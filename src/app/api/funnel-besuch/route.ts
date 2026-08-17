import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

/**
 * Meldet jeden Aufruf der Kampagnenseiten (`/funnel`, `/fokus`) an einen
 * Webhook — damit Ayham mitbekommt, wenn jemand auf der Seite landet.
 *
 * **Warum eine eigene Route und nicht `trackVisitor()` aus
 * `src/lib/visitor-enrichment.ts`:** Das bestehende Besuchertracking hängt am
 * Cookie-Banner (`CookieConsent.tsx` ruft es erst nach Zustimmung zu Analytics
 * auf) und reichert die Daten über `ipinfo.io` mit IP, Stadt und Firma an. Für
 * die Frage „wie viele Leute kommen auf die Seite" ist das doppelt untauglich:
 * Wer ablehnt oder das Banner wegklickt, taucht nie auf — und das sind je nach
 * Zielgruppe die Hälfte bis zwei Drittel aller Besucher. Diese Route zählt
 * deshalb **jeden** Aufruf.
 *
 * Damit das ohne Einwilligung zulässig ist, verarbeitet sie bewusst so wenig
 * wie möglich:
 *
 *   - **Kein Cookie, kein localStorage, kein Fingerprint.** Es wird nichts auf
 *     dem Endgerät gespeichert oder ausgelesen — nur dann greift § 25 TDDDG
 *     nicht und es braucht keine Einwilligung.
 *   - **Die IP wird nicht weitergereicht.** Der Server sieht sie zwangsläufig
 *     (ohne sie käme keine Antwort zurück) und nutzt sie nur flüchtig für die
 *     Sperre unten. In den Webhook geht sie nicht.
 *   - **Keine Weitergabe an Dritte.** Kein `ipinfo.io`, kein externer Dienst
 *     im Anfragepfad des Besuchers.
 *
 * Übrig bleibt: welche Seite, woher der Besucher kam, welche Kampagne. Das ist
 * genau die Information, um die es geht.
 *
 * **Einrichtung:** `FUNNEL_BESUCH_WEBHOOK_URL` als Environment-Variable in
 * Coolify setzen (Runtime, kein Rebuild nötig — die Variable trägt bewusst kein
 * `NEXT_PUBLIC_`-Präfix und bleibt damit serverseitig). Ohne die Variable
 * antwortet die Route still mit 204 und tut nichts; die Seite funktioniert
 * unverändert weiter.
 *
 * Optional `FUNNEL_BESUCH_WEBHOOK_SECRET` — wird als `x-tracking-secret`
 * mitgeschickt, damit der Empfänger fremde Aufrufe abweisen kann. Anders als
 * das Secret in `visitor-enrichment.ts`, das im Client-Bundle steht und damit
 * für jeden lesbar ist, verlässt dieses hier den Server nie.
 */

/** Die Route ruft einen externen Dienst — sie darf nicht vorgerendert werden. */
export const dynamic = "force-dynamic";

const BesuchSchema = z.object({
  /** Welche Seite. Nur die beiden Kampagnenpfade sind erlaubt. */
  seite: z.enum(["/funnel", "/fokus"]),
  /**
   * Was passiert ist. `aufruf` ist der Seitenaufruf, `gelesen` meldet, dass
   * jemand 90 % der Seite gescrollt hat.
   *
   * Die Scrolltiefe ist auf einer Seite dieser Länge die aussagekräftigste
   * Zahl nach dem Aufruf: sie trennt „kurz reingeschaut" von „bis zum Ende
   * gelesen und trotzdem nicht geklickt". Plausible könnte das auch, aber nur
   * nach Einwilligung — über diesen Kanal wird es ohne Cookie und ohne
   * personenbezogene Daten gezählt.
   */
  ereignis: z.enum(["aufruf", "gelesen"]).default("aufruf"),
  /** Woher der Besucher kam. Fremde Eingabe — Länge begrenzt. */
  referrer: z.string().trim().max(500).nullable().optional(),
  utmSource: z.string().trim().max(120).nullable().optional(),
  utmMedium: z.string().trim().max(120).nullable().optional(),
  utmCampaign: z.string().trim().max(120).nullable().optional(),
});

/* -------------------------------------------------------------------------- */
/* Sperre gegen Dauerfeuer                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Wie viele Meldungen eine Adresse pro Fenster auslösen darf.
 *
 * Ohne die Sperre könnte jemand die Route in einer Schleife aufrufen und damit
 * das Postfach oder den Messenger dahinter fluten — der Endpunkt ist öffentlich
 * und ungeschützt erreichbar, das ist bei einer statischen Seite unvermeidbar.
 * Zehn Aufrufe in zehn Minuten sind mehr, als ein Mensch je erzeugt, und wenig
 * genug, dass ein Skript nichts anrichtet.
 *
 * Der Speicher liegt im Prozess: die Seite läuft als **ein** Node-Server im
 * Container (siehe `Dockerfile`, `output: "standalone"`). Bei mehreren Instanzen
 * müsste das nach außen wandern — dann ist aber ohnehin ein Zähler mit
 * Persistenz die richtige Antwort, nicht diese Map.
 */
const MAX_PRO_FENSTER = 10;
const FENSTER_MS = 10 * 60 * 1000;

const zaehler = new Map<string, { anzahl: number; bis: number }>();

function darfMelden(kennung: string): boolean {
  const jetzt = Date.now();
  const eintrag = zaehler.get(kennung);

  if (!eintrag || eintrag.bis < jetzt) {
    zaehler.set(kennung, { anzahl: 1, bis: jetzt + FENSTER_MS });

    /* Abgelaufene Einträge wegräumen, damit die Map nicht unbegrenzt wächst.
       Bei den Besucherzahlen dieser Seite reicht das Aufräumen im Vorbeigehen. */
    if (zaehler.size > 1000) {
      for (const [schluessel, wert] of zaehler) {
        if (wert.bis < jetzt) zaehler.delete(schluessel);
      }
    }
    return true;
  }

  if (eintrag.anzahl >= MAX_PRO_FENSTER) return false;

  eintrag.anzahl += 1;
  return true;
}

/**
 * Kennung für die Sperre — die IP, sonst der User-Agent als schwacher Ersatz.
 *
 * Sie wird nur im Arbeitsspeicher gehalten, nirgends gespeichert und nicht
 * weitergereicht.
 *
 * ⚠️ `x-forwarded-for` setzt der Reverse Proxy davor (Coolify/Traefik), aber der
 * Header ist grundsätzlich fälschbar: wer ihn bei jeder Anfrage variiert,
 * bekommt jedes Mal ein frisches Kontingent. Die Sperre schützt deshalb gegen
 * versehentliches Dauerfeuer und gegen simple Skripte, nicht gegen jemanden,
 * der sie gezielt umgehen will. Für einen öffentlichen Endpunkt ohne Anmeldung
 * ist das die erreichbare Grenze — wird die Meldung wichtiger, gehört sie
 * hinter einen Zähler mit Persistenz statt hinter diese Map.
 */
function kennungVon(request: NextRequest): string {
  const weitergeleitet = request.headers.get("x-forwarded-for");
  if (weitergeleitet) return weitergeleitet.split(",")[0].trim();
  return request.headers.get("user-agent") ?? "unbekannt";
}

/* -------------------------------------------------------------------------- */

export async function POST(request: NextRequest) {
  const ziel = process.env.FUNNEL_BESUCH_WEBHOOK_URL;

  /* Nicht eingerichtet: still bestätigen. Die Seite soll nicht dadurch
     auffallen, dass ein Tracking-Aufruf in der Konsole des Besuchers rot wird. */
  if (!ziel) {
    return new NextResponse(null, { status: 204 });
  }

  if (!darfMelden(kennungVon(request))) {
    return new NextResponse(null, { status: 429 });
  }

  let daten: z.infer<typeof BesuchSchema>;
  try {
    daten = BesuchSchema.parse(await request.json());
  } catch {
    /* Bewusst ohne Details: eine Fehlermeldung, die verrät, welche Felder
       erwartet werden, ist eine Anleitung zum Missbrauch. */
    return NextResponse.json({ fehler: "Ungültige Anfrage" }, { status: 400 });
  }

  const secret = process.env.FUNNEL_BESUCH_WEBHOOK_SECRET;

  try {
    await fetch(ziel, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-tracking-secret": secret } : {}),
      },
      body: JSON.stringify({
        ereignis: daten.ereignis === "gelesen" ? "funnel_gelesen" : "funnel_besuch",
        seite: daten.seite,
        referrer: daten.referrer ?? null,
        utm_source: daten.utmSource ?? null,
        utm_medium: daten.utmMedium ?? null,
        utm_campaign: daten.utmCampaign ?? null,
        zeitpunkt: new Date().toISOString(),
      }),
      /* Der Besucher soll nicht auf einen fremden Dienst warten. Bricht der
         Webhook weg, ist die Meldung verloren — das ist hier der richtige
         Kompromiss, die Seite ist wichtiger als die Statistik. */
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    /* Auch bei einem Fehler 204: für den Besucher ist der Aufruf bedeutungslos,
       und der Browser soll nichts wiederholen. */
  }

  return new NextResponse(null, { status: 204 });
}
