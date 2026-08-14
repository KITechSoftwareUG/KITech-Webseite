import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { darfMelden, ipVon, kennungVon } from "@/lib/melde-sperre";

/**
 * Meldet die Momente, in denen jemand auf der Website etwas tut, das ein
 * Gespräch werden kann — an einen Webhook, von dort weiter als Nachricht.
 *
 * **Auf Ansage (14.08.2026):** „Ich möchte eine Benachrichtigung kriegen …
 * sodass ich dann auch genau weiß, wer das war."
 *
 * Gemeldet wird **nicht jeder Seitenaufruf** — das wäre Lärm, und nach zwei
 * Tagen liest niemand mehr hin. Gemeldet werden die fünf Ereignisse in
 * `EreignisSchema`: Terminseite geöffnet, Popup-Knopf geklickt, Telefonnummer
 * oder E-Mail angeklickt, Selbstcheck abgeschlossen.
 *
 * ## Was hiervon ohne Einwilligung läuft
 *
 * Das Ereignis selbst: welche Seite, welches Ereignis, woher der Besucher kam,
 * welche Kampagne. Dabei wird **nichts auf dem Endgerät gespeichert oder
 * ausgelesen** — kein Cookie, kein localStorage, kein Fingerprint. Nur deshalb
 * greift § 25 TDDDG nicht und es braucht keine Einwilligung. Die IP sieht der
 * Server zwangsläufig, nutzt sie aber nur flüchtig für die Sperre und schickt
 * sie nicht mit.
 *
 * ## Was Einwilligung braucht
 *
 * Die **Firmenerkennung**. Dafür geht die IP an `ipinfo.io`, und das ist eine
 * Weitergabe personenbezogener Daten an einen Dritten in den USA. Sie läuft
 * deshalb nur, wenn der Client `mitEinwilligung: true` meldet — er liest das
 * aus derselben Einwilligung, an der auch Plausible hängt
 * (`hasAnalyticsConsent()` in `src/lib/consent.ts`).
 *
 * ⚠️ **Der Cookie-Banner und `/datenschutz` müssen das benennen.** Beides ist
 * am 14.08.2026 ergänzt worden; wer die Firmenerkennung wieder abschaltet,
 * nimmt die Textstellen mit heraus. Steht kein `IPINFO_TOKEN`, unterbleibt die
 * Abfrage vollständig — dann meldet die Route nur das Ereignis.
 *
 * ## Warum das nicht `visitor-enrichment.ts` macht
 *
 * Das tat es, und es war aus drei Gründen falsch gebaut: Der Ziel-Webhook
 * (`os.kitech-software.de/api/webhook/tracking`) existiert seit dem Umzug nicht
 * mehr und antwortet mit 404 — es kam also nichts an. Token und Secret standen
 * im Client-Bundle und waren für jeden lesbar. Und die IP ging aus dem Browser
 * des Besuchers direkt an einen US-Dienst. Alles drei ist hier anders: der
 * Aufruf läuft serverseitig, die Geheimnisse bleiben auf dem Server.
 *
 * ## Einrichtung (Coolify, Runtime-Variablen, kein Rebuild nötig)
 *
 * | Variable | Pflicht | Wirkung |
 * |---|---|---|
 * | `EREIGNIS_WEBHOOK_URL` | ja | Ohne sie tut die Route nichts (204). |
 * | `EREIGNIS_WEBHOOK_SECRET` | nein | Geht als `x-tracking-secret` mit. |
 * | `IPINFO_TOKEN` | nein | Ohne ihn keine Firmenerkennung. |
 *
 * Keine der drei trägt ein `NEXT_PUBLIC_`-Präfix — sie bleiben serverseitig.
 *
 * ℹ️ `/api/funnel-besuch` macht dasselbe für die Kampagnenseiten und ist älter.
 * Die beiden gehören mittelfristig zusammengelegt; getrennt sind sie, weil sie
 * unterschiedliche Webhooks bedienen dürfen sollen.
 */

export const dynamic = "force-dynamic";

/** Wie viele Meldungen eine Adresse pro Zehn-Minuten-Fenster auslösen darf. */
const MAX_PRO_FENSTER = 12;

const EreignisSchema = z.object({
  ereignis: z.enum([
    /* Einmal je Sitzung, nur nach Zustimmung — siehe visitor-enrichment.ts. */
    "besuch",
    "termin_geoeffnet",
    "popup_geklickt",
    "telefon_geklickt",
    "email_geklickt",
    "selbstcheck_fertig",
  ]),
  /** Wo es passiert ist. Fremde Eingabe — Länge begrenzt. */
  seite: z.string().trim().max(200),
  referrer: z.string().trim().max(500).nullable().optional(),
  utmSource: z.string().trim().max(120).nullable().optional(),
  utmMedium: z.string().trim().max(120).nullable().optional(),
  utmCampaign: z.string().trim().max(120).nullable().optional(),
  /**
   * Hat der Besucher der Reichweitenmessung zugestimmt? Nur dann wird die
   * Firma nachgeschlagen. Der Client kann hier lügen — aber ein Besucher, der
   * sich absichtlich als einwilligend ausgibt, ist kein realistischer Angriff.
   */
  mitEinwilligung: z.boolean().optional(),
});

/** Was `ipinfo.io` zurückgibt, soweit es hier gebraucht wird. */
interface IpInfoAntwort {
  org?: string;
  city?: string;
  region?: string;
  country?: string;
  hostname?: string;
}

/**
 * Schlägt nach, aus welchem Netz der Aufruf kam.
 *
 * Das Ergebnis ist eine **Firma, kein Mensch**: `org` ist der Betreiber des
 * IP-Bereichs. Bei einem Firmenanschluss steht dort der Firmenname, bei einem
 * Privatanschluss der Telekom-Anschluss der Telekom. Wer sich davon Namen
 * erhofft, wird enttäuscht — mehr gibt keine IP her, bei keinem Anbieter.
 */
async function firmaNachschlagen(ip: string | null): Promise<IpInfoAntwort | null> {
  const token = process.env.IPINFO_TOKEN;
  if (!token || !ip) return null;

  try {
    const antwort = await fetch(`https://ipinfo.io/${encodeURIComponent(ip)}/json?token=${token}`, {
      signal: AbortSignal.timeout(2500),
    });
    if (!antwort.ok) return null;
    return (await antwort.json()) as IpInfoAntwort;
  } catch {
    /* Erreichbarkeit eines Fremddienstes darf die Meldung nicht aufhalten. */
    return null;
  }
}

export async function POST(request: NextRequest) {
  const ziel = process.env.EREIGNIS_WEBHOOK_URL;

  /* Nicht eingerichtet: still bestätigen. Die Seite soll nicht dadurch
     auffallen, dass ein Meldeaufruf in der Konsole des Besuchers rot wird. */
  if (!ziel) return new NextResponse(null, { status: 204 });

  if (!darfMelden("ereignis", kennungVon(request), MAX_PRO_FENSTER)) {
    return new NextResponse(null, { status: 429 });
  }

  let daten: z.infer<typeof EreignisSchema>;
  try {
    daten = EreignisSchema.parse(await request.json());
  } catch {
    /* Bewusst ohne Details: eine Fehlermeldung, die verrät, welche Felder
       erwartet werden, ist eine Anleitung zum Missbrauch. */
    return NextResponse.json({ fehler: "Ungültige Anfrage" }, { status: 400 });
  }

  const netz = daten.mitEinwilligung ? await firmaNachschlagen(ipVon(request)) : null;
  const secret = process.env.EREIGNIS_WEBHOOK_SECRET;

  try {
    await fetch(ziel, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-tracking-secret": secret } : {}),
      },
      body: JSON.stringify({
        ereignis: daten.ereignis,
        seite: daten.seite,
        referrer: daten.referrer ?? null,
        utm_source: daten.utmSource ?? null,
        utm_medium: daten.utmMedium ?? null,
        utm_campaign: daten.utmCampaign ?? null,
        /* Firma und Ort nur mit Einwilligung, IP grundsätzlich nicht. */
        firma: netz?.org ?? null,
        ort: netz?.city ?? null,
        region: netz?.region ?? null,
        land: netz?.country ?? null,
        netz_hostname: netz?.hostname ?? null,
        zeitpunkt: new Date().toISOString(),
      }),
      /* Der Besucher soll nicht auf einen fremden Dienst warten. Bricht der
         Webhook weg, ist die Meldung verloren — die Seite ist wichtiger. */
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    /* Auch bei einem Fehler 204: für den Besucher ist der Aufruf bedeutungslos,
       und der Browser soll nichts wiederholen. */
  }

  return new NextResponse(null, { status: 204 });
}
