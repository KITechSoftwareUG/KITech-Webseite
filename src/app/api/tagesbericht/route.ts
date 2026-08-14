import { NextResponse, type NextRequest } from "next/server";

/**
 * Der Tagesbericht: einmal am Tag die Zahlen des Vortags aus Plausible, fertig
 * formuliert, an denselben Webhook wie die Sofortmeldungen.
 *
 * **Auf Ansage (14.08.2026):** „Ich habe ja schon eine Analytics-Seite von
 * Plausible … wie man das in eine Benachrichtigung umwandeln kann." Genau das
 * macht diese Route — statt das Dashboard aufzurufen, kommt das Dashboard.
 *
 * ## Was drinsteht
 *
 * Besucher, Seitenaufrufe und Besuche des Vortags, die fünf meistbesuchten
 * Seiten, die fünf stärksten Quellen und die gezählten Ereignisse
 * (`CTA_Klick`, `Calendly_Klick`, …). Alles **aggregiert** — Plausible speichert
 * bewusst keine Einzelbesucher, und diese Route kann daran nichts ändern. Wer
 * wissen will, *wer* da war, bekommt das über `/api/ereignis`, nicht hier.
 *
 * ## Wer sie auslöst
 *
 * Niemand von selbst. Die Route wartet auf einen Aufruf von außen — n8n, ein
 * Coolify Scheduled Task, ein Cron auf dem Server:
 *
 * ```
 * curl -X POST https://kitech-software.de/api/tagesbericht \
 *   -H "x-tagesbericht-secret: <TAGESBERICHT_SECRET>"
 * ```
 *
 * Antwortet mit dem Bericht als JSON **und** schickt ihn an den Webhook, falls
 * einer gesetzt ist. Wer lieber in n8n formatiert, nimmt die Antwort; wer es
 * einfach will, lässt den Webhook feuern und nutzt `text`.
 *
 * ## Einrichtung (Coolify, Runtime-Variablen)
 *
 * | Variable | Pflicht | Wirkung |
 * |---|---|---|
 * | `PLAUSIBLE_API_KEY` | ja | Stats-API-Schlüssel, in Plausible unter „Settings → API Keys" erzeugt. |
 * | `TAGESBERICHT_SECRET` | ja | Ohne ihn antwortet die Route mit 404 — ein offener Statistik-Endpunkt gehört niemandem. |
 * | `PLAUSIBLE_SITE_ID` | nein | Standard `kitech-software.de`. |
 * | `PLAUSIBLE_API_URL` | nein | Standard `https://stats.kitech-software.de`. |
 * | `TAGESBERICHT_WEBHOOK_URL` | nein | Fällt auf `EREIGNIS_WEBHOOK_URL` zurück. |
 *
 * Gebaut gegen die **Query-API v2** (`POST /api/v2/query`), die in Plausible
 * Community Edition ab v2 vorhanden ist — hier läuft v3.2.0. Die ältere
 * `/api/v1/stats/*` gibt es dort zwar noch, sie ist aber der Auslaufpfad.
 */

export const dynamic = "force-dynamic";

const STANDARD_API = "https://stats.kitech-software.de";
const STANDARD_SITE = "kitech-software.de";

/** Antwortform der Query-API v2, soweit hier gebraucht. */
interface QueryAntwort {
  results?: Array<{ metrics: number[]; dimensions: string[] }>;
}

/** Ein Tag im Format YYYY-MM-DD, gerechnet in der Zeitzone der Website. */
function gestern(): string {
  const jetzt = new Date();
  jetzt.setDate(jetzt.getDate() - 1);
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(jetzt);
}

async function frage(
  koerper: Record<string, unknown>,
  api: string,
  schluessel: string
): Promise<QueryAntwort | null> {
  try {
    const antwort = await fetch(`${api}/api/v2/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${schluessel}`,
      },
      body: JSON.stringify(koerper),
      signal: AbortSignal.timeout(10_000),
    });
    if (!antwort.ok) return null;
    return (await antwort.json()) as QueryAntwort;
  } catch {
    return null;
  }
}

/** Aus einem Breakdown eine Liste `{ name, wert }` machen. */
function liste(antwort: QueryAntwort | null): Array<{ name: string; wert: number }> {
  return (antwort?.results ?? []).map((zeile) => ({
    name: zeile.dimensions[0] ?? "—",
    wert: zeile.metrics[0] ?? 0,
  }));
}

function alsText(
  tag: string,
  besucher: number,
  aufrufe: number,
  seiten: Array<{ name: string; wert: number }>,
  quellen: Array<{ name: string; wert: number }>,
  ereignisse: Array<{ name: string; wert: number }>
): string {
  const zeilen = [
    `KITech-Website am ${tag}`,
    `${besucher} Besucher, ${aufrufe} Seitenaufrufe`,
  ];

  if (seiten.length) {
    zeilen.push("", "Meistbesucht:");
    seiten.forEach((s) => zeilen.push(`  ${s.name} — ${s.wert}`));
  }
  if (quellen.length) {
    zeilen.push("", "Woher:");
    quellen.forEach((q) => zeilen.push(`  ${q.name || "direkt"} — ${q.wert}`));
  }
  if (ereignisse.length) {
    zeilen.push("", "Ereignisse:");
    ereignisse.forEach((e) => zeilen.push(`  ${e.name} — ${e.wert}`));
  }
  if (!besucher) {
    zeilen.push("", "Keine Besucher gezählt — entweder ein ruhiger Tag oder die Messung steht.");
  }

  return zeilen.join("\n");
}

export async function POST(request: NextRequest) {
  const secret = process.env.TAGESBERICHT_SECRET;
  const schluessel = process.env.PLAUSIBLE_API_KEY;

  /* Nicht eingerichtet oder falsches Secret: 404. Bewusst nicht 401 — ein
     Endpunkt, dessen Existenz man nicht bestätigt, wird nicht durchprobiert. */
  if (!secret || !schluessel) return new NextResponse(null, { status: 404 });

  const mitgeschickt =
    request.headers.get("x-tagesbericht-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (mitgeschickt !== secret) return new NextResponse(null, { status: 404 });

  const api = process.env.PLAUSIBLE_API_URL ?? STANDARD_API;
  const site = process.env.PLAUSIBLE_SITE_ID ?? STANDARD_SITE;
  const tag = gestern();
  const zeitraum = [tag, tag];

  /* Vier Abfragen, parallel: Kennzahlen, Seiten, Quellen, Ereignisse. */
  const [kennzahlen, seitenAntwort, quellenAntwort, ereignisAntwort] = await Promise.all([
    frage({ site_id: site, metrics: ["visitors", "pageviews", "visits"], date_range: zeitraum }, api, schluessel),
    frage(
      {
        site_id: site,
        metrics: ["pageviews"],
        date_range: zeitraum,
        dimensions: ["event:page"],
        order_by: [["pageviews", "desc"]],
        pagination: { limit: 5 },
      },
      api,
      schluessel
    ),
    frage(
      {
        site_id: site,
        metrics: ["visitors"],
        date_range: zeitraum,
        dimensions: ["visit:source"],
        order_by: [["visitors", "desc"]],
        pagination: { limit: 5 },
      },
      api,
      schluessel
    ),
    frage(
      {
        site_id: site,
        metrics: ["events"],
        date_range: zeitraum,
        dimensions: ["event:name"],
        order_by: [["events", "desc"]],
        pagination: { limit: 10 },
      },
      api,
      schluessel
    ),
  ]);

  /* Steht Plausible nicht zur Verfügung, ist das eine Störung und keine Null —
     ein Bericht „0 Besucher", der in Wahrheit ein Verbindungsfehler ist, wäre
     die schlechtere Nachricht. */
  if (!kennzahlen) {
    return NextResponse.json(
      { fehler: "Plausible antwortet nicht oder der API-Schlüssel gilt nicht." },
      { status: 502 }
    );
  }

  const [besucher = 0, aufrufe = 0, besuche = 0] = kennzahlen.results?.[0]?.metrics ?? [];
  const seiten = liste(seitenAntwort);
  const quellen = liste(quellenAntwort);
  /* Seitenaufrufe stehen in Plausible als Ereignis „pageview" und sind oben
     schon gezählt — in der Ereignisliste wären sie nur Rauschen. */
  const ereignisse = liste(ereignisAntwort).filter((e) => e.name !== "pageview");

  const bericht = {
    ereignis: "tagesbericht",
    tag,
    besucher,
    seitenaufrufe: aufrufe,
    besuche,
    top_seiten: seiten,
    top_quellen: quellen,
    ereignisse,
    text: alsText(tag, besucher, aufrufe, seiten, quellen, ereignisse),
    zeitpunkt: new Date().toISOString(),
  };

  const ziel = process.env.TAGESBERICHT_WEBHOOK_URL ?? process.env.EREIGNIS_WEBHOOK_URL;
  if (ziel) {
    const webhookSecret = process.env.EREIGNIS_WEBHOOK_SECRET;
    try {
      await fetch(ziel, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(webhookSecret ? { "x-tracking-secret": webhookSecret } : {}),
        },
        body: JSON.stringify(bericht),
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      /* Der Bericht steht trotzdem in der Antwort — wer per Cron aufruft,
         sieht den Fehlschlag dort. */
    }
  }

  return NextResponse.json(bericht);
}
