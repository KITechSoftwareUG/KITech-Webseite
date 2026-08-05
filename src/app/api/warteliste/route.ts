import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Nimmt Anmeldungen für die Warteliste der Skool-Community entgegen und reicht
 * sie an einen n8n-Webhook weiter.
 *
 * Die Webhook-URL steht bewusst OHNE `NEXT_PUBLIC_`-Präfix in der Umgebung: mit
 * Präfix würde Next.js sie ins Client-Bundle einbacken, und jeder könnte sie
 * direkt mit Müll befüllen. Deshalb läuft die Anmeldung über diesen Route
 * Handler statt per fetch aus dem Browser.
 *
 * Ist die Variable nicht gesetzt, meldet die Route einen ehrlichen Fehler,
 * statt Anmeldungen stillschweigend ins Nichts laufen zu lassen.
 */

export const runtime = "nodejs";
/** Kein Caching: jede Anmeldung muss wirklich durchlaufen. */
export const dynamic = "force-dynamic";

const anfrageSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  /** Honeypot — für Menschen unsichtbar. Ausgefüllt heißt: Bot. */
  website: z.string().max(200).optional(),
});

/**
 * Einfache Drosselung im Arbeitsspeicher: fünf Versuche je IP in zehn Minuten.
 * Reicht für eine Anmeldeseite — der Container läuft als einzelner Prozess.
 * Bei mehreren Instanzen müsste das nach Redis wandern.
 */
const FENSTER_MS = 10 * 60 * 1000;
const MAX_VERSUCHE = 5;
const versuche = new Map<string, number[]>();

function zuVieleVersuche(ip: string): boolean {
  const jetzt = Date.now();
  const bisher = (versuche.get(ip) ?? []).filter((t) => jetzt - t < FENSTER_MS);
  bisher.push(jetzt);
  versuche.set(ip, bisher);

  // Aufräumen, damit die Map nicht unbegrenzt wächst.
  if (versuche.size > 5000) {
    for (const [schluessel, zeiten] of versuche) {
      if (zeiten.every((t) => jetzt - t >= FENSTER_MS)) versuche.delete(schluessel);
    }
  }

  return bisher.length > MAX_VERSUCHE;
}

function ipVon(request: Request): string {
  const weitergeleitet = request.headers.get("x-forwarded-for");
  return weitergeleitet?.split(",")[0]?.trim() || "unbekannt";
}

export async function POST(request: Request) {
  if (zuVieleVersuche(ipVon(request))) {
    return NextResponse.json(
      { fehler: "Zu viele Versuche. Bitte später noch einmal probieren." },
      { status: 429 }
    );
  }

  let daten: unknown;
  try {
    daten = await request.json();
  } catch {
    return NextResponse.json({ fehler: "Ungültige Anfrage." }, { status: 400 });
  }

  const geprueft = anfrageSchema.safeParse(daten);
  if (!geprueft.success) {
    return NextResponse.json(
      { fehler: "Bitte eine gültige E-Mail-Adresse eingeben." },
      { status: 400 }
    );
  }

  // Honeypot: Bots bekommen ein freundliches OK, damit sie nicht nachjustieren.
  // Weitergereicht wird nichts.
  if (geprueft.data.website) {
    return NextResponse.json({ ok: true });
  }

  const webhook = process.env.WAITLIST_WEBHOOK_URL;
  if (!webhook) {
    return NextResponse.json(
      { fehler: "Die Anmeldung ist gerade nicht möglich. Bitte später noch einmal." },
      { status: 503 }
    );
  }

  try {
    const antwort = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: geprueft.data.email,
        quelle: "community-warteliste",
        zeitpunkt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!antwort.ok) {
      return NextResponse.json(
        { fehler: "Die Anmeldung ist gerade nicht möglich. Bitte später noch einmal." },
        { status: 502 }
      );
    }
  } catch {
    // Bewusst ohne Details nach außen — weder Zielsystem noch Fehlertext.
    return NextResponse.json(
      { fehler: "Die Anmeldung ist gerade nicht möglich. Bitte später noch einmal." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
