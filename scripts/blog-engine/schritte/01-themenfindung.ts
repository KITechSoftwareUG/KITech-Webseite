import {
  keywordSchwierigkeit,
  pruefeZugangsdaten,
  suchintention,
  suchvolumen,
  verwandteKeywords,
  type Intentionswert,
  type Schwierigkeitswert,
  type SuchvolumenDatensatz,
  type VerwandtesKeyword,
} from "../lib/dataforseo.js";
import { ladeThemenVorrat } from "../lib/artikel-io.js";
import { melde, warne } from "../lib/protokoll.js";
import type { KeywordDaten, ThemaImVorrat, ThemenfindungErgebnis } from "../lib/typen.js";

/**
 * Schritt 01 — Themenfindung: *Was könnte man heute schreiben?*
 *
 * Dieser Schritt entscheidet nichts. Er stellt zusammen, was heute überhaupt
 * zur Wahl steht, und legt die Keyword-Zahlen daneben, mit denen Schritt 02
 * dann aussortiert. Die Trennung ist Absicht: Auswahl ohne Netzwerkzugriff
 * lässt sich testen, Zusammenstellen mit Netzwerkzugriff nicht.
 *
 * **Die Themen kommen aus dem Vorrat, nicht aus Keyword-Vorschlägen.** Googles
 * Prüfliste für hilfreiche Inhalte nennt als Warnsignal wörtlich: „Are you
 * producing lots of content on many different topics in hopes that some of it
 * might perform well in search results?" Genau das entsteht, wenn eine Maschine
 * sich ihre Themen selbst aus einer Keyword-API zieht. Die API liefert hier
 * ausschließlich Zahlen zu Themen, die ein Mensch vorher aufgeschrieben hat.
 */

/**
 * Für wie viele der obersten Kandidaten zusätzlich verwandte Suchbegriffe
 * geholt werden.
 *
 * Jeder Aufruf kostet eigenes Geld (~0,02 $ bei Tiefe 2) und der Ertrag ist nur
 * für die Themen nützlich, die heute tatsächlich geschrieben werden.
 *
 * ⚠️ Die Zahl hängt deshalb an der Artikelzahl, nicht an einer Konstanten. Vorher
 * standen hier fest fünf — bei `--anzahl 1`, wie der Cron ihn aufruft, wurden
 * also vier von fünf Abfragen bezahlt und weggeworfen. Gemessen am Lauf vom
 * 27.08.2026: 0,178 $ gesamt, davon rund 0,10 $ für diese fünf.
 *
 * Der Zuschlag von zwei ist der Spielraum für Schritt 02: Die Kandidatenliste
 * ist nach Priorität sortiert, aber die Auswahl filtert noch nach Eigenanteil
 * und Dubletten. Wer zu knapp abfragt, riskiert ein gewähltes Thema **ohne**
 * Sekundärkeywords — das kostet Qualität statt Geld und ist der schlechtere
 * Tausch.
 */
const VERWANDTE_ZUSCHLAG = 2;

/**
 * Tiefe der „Ähnliche Suchanfragen"-Kette.
 *
 * Der Client warnt nicht ohne Grund: Tiefe 2 liefert rund 72 Keywords für
 * ~0,02 $, Tiefe 4 rund 4680 für ~0,58 $. Für acht Sekundärkeywords je Artikel
 * ist alles über 2 bezahlter Ballast, der am Rand ohnehin vom Thema abkommt.
 */
const VERWANDTE_TIEFE = 2;

/** Mehr als 100 Vorschläge sieht Schritt 02 sich ohnehin nicht an. */
const VERWANDTE_LIMIT = 100;

/**
 * Die Grenzen, an denen die Google-Ads-Schnittstelle **den gesamten Task**
 * abweist, nicht nur das eine Keyword.
 *
 * Der Client wirft in diesem Fall — was richtig ist, hier aber teuer wäre: ein
 * einziges zu langes Keyword im Vorrat nähme allen anderen Kandidaten ihr
 * Suchvolumen. Deshalb werden untaugliche Keywords vorher aussortiert und
 * bekommen `suchvolumen: null`.
 */
const ADS_ZEICHEN_MAX = 80;
const ADS_WOERTER_MAX = 10;

/**
 * Das heutige Datum als `JJJJ-MM-TT` in deutscher Zeit.
 *
 * `new Date().toISOString()` rechnet in UTC. Zwischen Mitternacht und zwei Uhr
 * morgens Berliner Zeit stünde dort noch der Vortag — ein Thema mit
 * `fruehestens: heute` fiele dann einen Lauf lang durch, ohne dass jemand den
 * Grund fände. `sv-SE` ist das gängige Gebietsschema, das von sich aus
 * JJJJ-MM-TT formatiert.
 */
function heutigesDatum(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date());
}

/**
 * Kommt das Thema heute in Frage?
 *
 * ISO-Daten lassen sich als Zeichenketten vergleichen — lexikografisch ist bei
 * `JJJJ-MM-TT` dasselbe wie chronologisch. Das spart die Umwandlung in `Date`
 * und damit jede Zeitzonenfrage.
 */
/**
 * Läuft dem Thema die Zeit davon?
 *
 * `true`, wenn sein `spaetestens` innerhalb der nächsten acht Wochen liegt.
 * Die Spanne ist so gewählt, dass ein Thema mehrere Läufe lang bevorzugt wird,
 * bevor es endgültig herausfällt — bei zwei bis drei Artikeln täglich sind das
 * reichlich Gelegenheiten, ohne dass ein einzelner Stichtag die Auswahl über
 * Monate dominiert.
 *
 * Themen ohne `spaetestens` bekommen den Bonus nie. Das ist der Normalfall:
 * Von 69 Einträgen im Vorrat trägt nur ein kleiner Teil einen Stichtag.
 */
const STICHTAG_VORLAUF_TAGE = 56;

function hatNahenStichtag(thema: ThemaImVorrat, datum: string): boolean {
  if (!thema.spaetestens) return false;
  /* Beide sind ISO-Daten; die Differenz in Tagen genügt hier, Zeitzonen spielen
     bei einer Acht-Wochen-Spanne keine Rolle. */
  const tage = (Date.parse(thema.spaetestens) - Date.parse(datum)) / 86_400_000;
  return tage >= 0 && tage <= STICHTAG_VORLAUF_TAGE;
}

function istHeuteFaellig(thema: ThemaImVorrat, datum: string): boolean {
  if (thema.erledigt) return false;
  if (thema.fruehestens && thema.fruehestens > datum) return false;
  if (thema.spaetestens && thema.spaetestens < datum) return false;
  return true;
}

/**
 * Der Schlüssel, unter dem Antworten den Kandidaten zugeordnet werden.
 *
 * DataForSEO schickt Keywords kleingeschrieben und getrimmt zurück — auch dann,
 * wenn sie im Vorrat mit Großbuchstaben stehen. Ohne Normalisierung fände die
 * Zuordnung „EU AI Act Pflichten" nicht wieder.
 */
function schluessel(keyword: string): string {
  return keyword.trim().toLowerCase();
}

/** Keywords, die Google Ads nicht abweist. Siehe {@link ADS_ZEICHEN_MAX}. */
function adsTauglich(keyword: string): boolean {
  return (
    keyword.length <= ADS_ZEICHEN_MAX && keyword.split(/\s+/).filter(Boolean).length <= ADS_WOERTER_MAX
  );
}

/**
 * Führt einen API-Aufruf aus und gibt bei Fehlschlag `null` zurück.
 *
 * **Die Automatik darf an fehlenden Keyword-Zahlen nicht sterben.** Ohne
 * Suchvolumen wird die Auswahl schlechter — sie fällt auf die vom Menschen
 * gepflegte Priorität zurück, und das ist ein brauchbares Notprogramm. Ein
 * abgebrochener Lauf dagegen produziert gar nichts, obwohl der Eigenanteil
 * (der eigentliche Wert eines Artikels) längst im Vorrat steht.
 */
async function ohneAbbruch<T>(was: string, arbeit: () => Promise<T>): Promise<T | null> {
  try {
    return await arbeit();
  } catch (problem: unknown) {
    const grund = problem instanceof Error ? problem.message : String(problem);
    warne(`Themenfindung: ${was} nicht abrufbar — ${grund}`);
    return null;
  }
}

/** Nachschlagewerk aus einer Antwortliste, normalisiert auf das Keyword. */
function nachSchluessel<T extends { keyword: string }>(eintraege: T[]): Map<string, T> {
  const karte = new Map<string, T>();
  for (const eintrag of eintraege) {
    const wert = schluessel(eintrag.keyword);
    if (wert) karte.set(wert, eintrag);
  }
  return karte;
}

/** Ein verwandtes Keyword auf die vier Zahlen reduzieren, die Schritt 02 liest. */
function alsKeywordDaten(satz: VerwandtesKeyword): KeywordDaten {
  return {
    keyword: satz.keyword,
    suchvolumen: satz.volumen,
    schwierigkeit: satz.schwierigkeit,
    intention: satz.intention,
    cpc: satz.cpc,
  };
}

/**
 * Stellt die Themen zusammen, die heute in Frage kommen, und legt die
 * Keyword-Zahlen daneben.
 *
 * @param anzahlKandidaten Wie viele der fälligen Themen angereichert werden.
 *   Jeder Kandidat kostet Geld in Schritt 03 und 04, aber nicht hier: die drei
 *   Metrik-Abfragen laufen **gebündelt** über die ganze Liste. Ein Aufruf für
 *   dreißig Keywords kostet so viel wie einer für eines.
 * @param anzahlArtikel Wie viele Artikel heute entstehen sollen. Bestimmt, für
 *   wie viele Themen verwandte Keywords geholt werden — das ist die einzige
 *   Abfrage hier, die **je Thema** abgerechnet wird.
 */
export async function findeThemen(
  anzahlKandidaten: number,
  anzahlArtikel = 2,
): Promise<ThemenfindungErgebnis> {
  // Der Vorrat kommt von der Platte, nicht aus dem Netz: Er ist da, bevor
  // irgendetwas Geld kostet. Fehlt die Datei, ist die Liste leer und dieser
  // Schritt endet unten mit einer Warnung statt mit einem Stacktrace.
  const vorrat = ladeThemenVorrat();
  const datum = heutigesDatum();

  const faellig = vorrat
    .filter((thema) => istHeuteFaellig(thema, datum))
    // Kleinere Zahl zuerst. Bei Gleichstand entscheidet die Kennung, damit zwei
    // Läufe am selben Tag dieselbe Reihenfolge ergeben — sonst hinge es an der
    // Sortierstabilität der Laufzeit, welches Thema geschrieben wird.
    //
    // Davor greift der Stichtagsbonus: Ein Thema mit `spaetestens` fällt am Tag
    // danach lautlos aus der Fälligkeit (istHeuteFaellig), ohne dass es je nach
    // vorn gerückt wäre. Ein Beitrag zur E-Rechnungspflicht ab 1.1.2027 nützt am
    // 2.1.2027 niemandem mehr — er muss vorher geschrieben werden oder gar nicht.
    // Themen mit nahem Stichtag stehen deshalb vor gleichrangigen ohne.
    .sort(
      (a, b) =>
        Number(hatNahenStichtag(b, datum)) - Number(hatNahenStichtag(a, datum)) ||
        a.prioritaet - b.prioritaet ||
        a.id.localeCompare(b.id, "de"),
    );

  const kandidatenThemen = faellig.slice(0, Math.max(0, anzahlKandidaten));

  melde(
    `Themenfindung: ${vorrat.length} Themen im Vorrat, ${faellig.length} heute fällig, ` +
      `${kandidatenThemen.length} werden bewertet.`,
  );

  if (kandidatenThemen.length === 0) {
    warne(
      "Themenfindung: kein fälliges Thema. Entweder ist der Vorrat leer, alles ist " +
        "erledigt, oder alle Stichtage liegen außerhalb von heute.",
    );
    return { kandidaten: [], verwandte: {} };
  }

  // Erst die Zugangsdaten, dann das Netz: fehlen Login oder Passwort, wirft
  // jeder der drei Aufrufe denselben Fehler, und im Protokoll stünde dreimal
  // dasselbe. Einmal prüfen, einmal warnen, ohne Zahlen weiterarbeiten.
  let mitDataForSeo = true;
  try {
    pruefeZugangsdaten();
  } catch (problem: unknown) {
    mitDataForSeo = false;
    warne(
      "Themenfindung: keine DataForSEO-Zugangsdaten — die Auswahl läuft ohne " +
        "Suchvolumen, Schwierigkeit und Intention allein nach der gepflegten Priorität. " +
        (problem instanceof Error ? problem.message : String(problem)),
    );
  }

  const keywords = kandidatenThemen.map((thema) => thema.zielKeyword);
  const fuerAds = keywords.filter(adsTauglich);
  if (fuerAds.length < keywords.length) {
    warne(
      `Themenfindung: ${keywords.length - fuerAds.length} Zielkeyword(e) überschreiten die ` +
        `Google-Ads-Grenzen (${ADS_ZEICHEN_MAX} Zeichen, ${ADS_WOERTER_MAX} Wörter) und ` +
        "bleiben ohne Suchvolumen. Zu lange Keywords ranken selten und gehören meist gekürzt.",
    );
  }

  // Drei Endpunkte, drei Aufrufe — aber jeweils einer für die ganze Liste.
  // Einzeln abgefragt kostete dasselbe Ergebnis das N-fache und liefe bei
  // Google Ads (12 Anfragen pro Minute) zusätzlich in die Drossel.
  const [volumen, schwierigkeiten, intentionen] = mitDataForSeo
    ? await Promise.all([
        fuerAds.length > 0
          ? ohneAbbruch<SuchvolumenDatensatz[]>("Suchvolumen", () => suchvolumen(fuerAds))
          : Promise.resolve(null),
        ohneAbbruch<Schwierigkeitswert[]>("Keyword-Schwierigkeit", () =>
          keywordSchwierigkeit(keywords),
        ),
        ohneAbbruch<Intentionswert[]>("Suchintention", () => suchintention(keywords)),
      ])
    : [null, null, null];

  const volumenKarte = nachSchluessel<SuchvolumenDatensatz>(volumen ?? []);
  const schwierigkeitsKarte = nachSchluessel<Schwierigkeitswert>(schwierigkeiten ?? []);
  const intentionsKarte = nachSchluessel<Intentionswert>(intentionen ?? []);

  const kandidaten = kandidatenThemen.map((thema) => {
    const wert = schluessel(thema.zielKeyword);
    const treffer = volumenKarte.get(wert);
    const schwer = schwierigkeitsKarte.get(wert);
    const absicht = intentionsKarte.get(wert);

    // `null` heißt „keine Daten", nicht „null Suchanfragen". Der Unterschied
    // entscheidet in Schritt 02 darüber, ob ein Thema wegen schlechter Zahlen
    // aussortiert wird oder wegen fehlender — und Letzteres wäre falsch.
    const daten: KeywordDaten | null =
      treffer || schwer || absicht
        ? {
            keyword: thema.zielKeyword,
            suchvolumen: treffer?.volumen ?? null,
            schwierigkeit: schwer?.schwierigkeit ?? null,
            intention: absicht?.intention ?? null,
            cpc: treffer?.cpc ?? null,
          }
        : null;

    return { ...thema, daten };
  });

  /**
   * Schlüssel ist die **Themen-Kennung**, nicht das Keyword: Schritt 02 hat das
   * Thema in der Hand und soll seine Sekundärkeywords ohne Umweg über eine
   * zweite Normalisierung finden.
   */
  const verwandte: Record<string, KeywordDaten[]> = {};

  if (mitDataForSeo) {
    for (const thema of kandidaten.slice(0, anzahlArtikel + VERWANDTE_ZUSCHLAG)) {
      const treffer = await ohneAbbruch<VerwandtesKeyword[]>(
        `verwandte Keywords zu „${thema.zielKeyword}"`,
        () =>
          verwandteKeywords(thema.zielKeyword, VERWANDTE_TIEFE, {
            limit: VERWANDTE_LIMIT,
          }),
      );
      if (!treffer) continue;
      verwandte[thema.id] = treffer.map(alsKeywordDaten);
    }
  }

  const mitZahlen = kandidaten.filter((eintrag) => eintrag.daten !== null).length;
  melde(
    `Themenfindung: ${kandidaten.length} Kandidaten, davon ${mitZahlen} mit Keyword-Daten; ` +
      `verwandte Begriffe für ${Object.keys(verwandte).length} Themen.`,
  );

  return { kandidaten, verwandte };
}
