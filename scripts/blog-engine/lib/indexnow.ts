import fs from "node:fs";
import path from "node:path";
import { melde, warne } from "./protokoll.js";

/**
 * IndexNow — neue Adressen an die teilnehmenden Suchdienste melden.
 *
 * ⚠️ **Google nimmt an IndexNow nicht teil und war nie dabei.** Wer hier eine
 * schnellere Google-Indexierung erwartet, wird enttäuscht. Die maßgebliche
 * Teilnehmerliste steht maschinenlesbar unter
 * `https://www.indexnow.org/searchengines.json` und enthielt beim Bau dieses
 * Moduls: **Bing, Yandex, Seznam, Naver, Yep, Internet Archive und Amazonbot**.
 *
 * Warum es sich trotzdem lohnt — zwei Gründe, beide nicht Google:
 *
 * 1. **Bing speist Microsoft Copilot**, und die Bing Webmaster Tools sind das
 *    einzige offizielle Zitations-Reporting, das ein großer Anbieter für
 *    KI-Antworten überhaupt bereitstellt. Was dort schnell drin ist, lässt sich
 *    dort auch messen.
 * 2. **Amazonbot und das Internet Archive** sind Zulieferer für KI-Systeme.
 *    IndexNow ist damit kein reiner Bing-Kanal mehr.
 *
 * Für Google bleibt der Weg, den Google selbst nennt: eine aktuelle Sitemap und
 * die Search Console. Der alte, unauthentifizierte Sitemap-Ping ist seit 2023
 * abgeschaltet — er antwortet mit 404 —, und die Indexing API ist ausdrücklich
 * auf `JobPosting` und `BroadcastEvent` beschränkt. Für Blogartikel gibt es
 * keinen Automatisierungspfad zu Google, und jede Anleitung, die einen
 * verspricht, beschreibt einen Missbrauch der API.
 */

const ENDPUNKT = "https://api.indexnow.org/indexnow";
const HOST = "kitech-software.de";

/** Erlaubt sind 8 bis 128 Zeichen aus a-z, A-Z, 0-9 und Bindestrich. */
const KEY_MUSTER = /^[A-Za-z0-9-]{8,128}$/;

export class IndexNowFehler extends Error {
  constructor(nachricht: string) {
    super(nachricht);
    this.name = "IndexNowFehler";
  }
}

function schluessel(): string {
  const wert = process.env.INDEXNOW_KEY?.trim();

  if (!wert) {
    throw new IndexNowFehler(
      "INDEXNOW_KEY fehlt. Erzeugen mit `openssl rand -hex 16`, in .env eintragen, " +
        "danach `npm run blog:indexnow -- --keydatei` aufrufen, damit die Prüfdatei unter " +
        "public/ liegt. Ohne die Datei weist der Dienst jede Meldung ab."
    );
  }

  if (!KEY_MUSTER.test(wert)) {
    throw new IndexNowFehler(
      `INDEXNOW_KEY hat ein ungültiges Format: erlaubt sind 8 bis 128 Zeichen aus ` +
        `a-z, A-Z, 0-9 und Bindestrich. Aktuell: ${wert.length} Zeichen.`
    );
  }

  return wert;
}

/**
 * Legt die Prüfdatei unter `public/<key>.txt` an.
 *
 * Der Dienst ruft diese Adresse ab, bevor er eine Meldung annimmt: Sie belegt,
 * dass wer den Schlüssel kennt, auch über die Domain verfügt. Ohne die Datei
 * kommt eine 403 zurück, und zwar erst nach der ersten echten Meldung — nicht
 * beim Einrichten.
 */
export function schreibeKeyDatei(key?: string): string {
  const wert = key ?? schluessel();
  const ziel = path.join(process.cwd(), "public", `${wert}.txt`);

  fs.writeFileSync(ziel, wert, "utf8");
  melde(`Prüfdatei angelegt: public/${wert}.txt`);
  melde(`Erreichbar sein muss sie unter https://${HOST}/${wert}.txt — erst nach dem Deploy.`);

  return ziel;
}

/**
 * Meldet Adressen. Gibt zurück, ob die Meldung angenommen wurde.
 *
 * Der Dienst nimmt bis zu 10.000 Adressen pro Aufruf; bei mehr wird gestückelt.
 * Alle Adressen müssen zum selben Host gehören — sonst kommt 422 zurück.
 */
export async function meldeUrls(urls: string[]): Promise<boolean> {
  if (urls.length === 0) {
    melde("Keine Adressen zu melden.");
    return true;
  }

  let key: string;
  try {
    key = schluessel();
  } catch (ausnahme) {
    warne(ausnahme instanceof Error ? ausnahme.message : String(ausnahme));
    return false;
  }

  const fremd = urls.filter((url) => !url.startsWith(`https://${HOST}/`) && url !== `https://${HOST}`);
  if (fremd.length > 0) {
    warne(
      `${fremd.length} Adresse(n) gehören nicht zu ${HOST} und werden ausgelassen — ` +
        `der Dienst würde die ganze Meldung mit 422 abweisen.`
    );
  }

  const eigene = urls.filter((url) => !fremd.includes(url));
  if (eigene.length === 0) return false;

  let alleOk = true;

  for (let start = 0; start < eigene.length; start += 10000) {
    const teil = eigene.slice(start, start + 10000);

    let antwort: Response;
    try {
      antwort = await fetch(ENDPUNKT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host: HOST,
          key,
          keyLocation: `https://${HOST}/${key}.txt`,
          urlList: teil,
        }),
        signal: AbortSignal.timeout(30_000),
      });
    } catch (ausnahme) {
      warne(
        "IndexNow nicht erreichbar: " +
          (ausnahme instanceof Error ? ausnahme.message : String(ausnahme))
      );
      alleOk = false;
      continue;
    }

    if (antwort.status === 200) {
      melde(`${teil.length} Adresse(n) gemeldet und angenommen.`);
      continue;
    }

    if (antwort.status === 202) {
      melde(
        `${teil.length} Adresse(n) angenommen — der Schlüssel wird noch geprüft. ` +
          `Das ist die normale Antwort beim ersten Mal.`
      );
      continue;
    }

    alleOk = false;

    const klartext: Record<number, string> = {
      400: "Ungültiges Format der Meldung.",
      403:
        `Schlüssel abgelehnt. Prüfe, ob https://${HOST}/${key}.txt erreichbar ist und ` +
        `genau den Schlüssel enthält — die Datei muss deployt sein, nicht nur lokal liegen.`,
      422: `Adressen gehören nicht zu ${HOST}, oder der Schlüssel passt nicht zum Host.`,
      429: "Zu viele Meldungen. Später erneut versuchen.",
    };

    warne(
      `IndexNow antwortet mit ${antwort.status}. ` +
        (klartext[antwort.status] ?? "Unerwartete Antwort.")
    );
  }

  return alleOk;
}

/**
 * Alle Adressen, die nach einer Veröffentlichung neu oder geändert sind.
 *
 * Übersicht und Themenseite kommen mit: Wenn ein Artikel erscheint, ändern sich
 * beide ebenfalls, und beide sind Einstiegsseiten.
 */
export function betroffeneUrls(slugs: string[], cluster: string[]): string[] {
  const urls = new Set<string>([`https://${HOST}/gratis-wissen`]);

  for (const slug of slugs) urls.add(`https://${HOST}/gratis-wissen/${slug}`);
  for (const eintrag of cluster) urls.add(`https://${HOST}/gratis-wissen/thema/${eintrag}`);

  return [...urls];
}
