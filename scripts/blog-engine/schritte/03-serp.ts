import { DataForSeoFehler, pruefeZugangsdaten, serpAnalyse } from "../lib/dataforseo.js";
import { melde, warne } from "../lib/protokoll.js";
import type { SerpBild, SerpTreffer } from "../lib/typen.js";

/**
 * Schritt 03 — SERP: *Was steht schon da?*
 *
 * Der billigste Schritt mit der größten Hebelwirkung. Eine Abfrage kostet
 * Bruchteile eines Cents und beantwortet zwei Fragen, für die sonst Schritt 04
 * (Volltexte lesen, ein Vielfaches teurer) bezahlt werden müsste: Welche Fragen
 * stellen die Leute wirklich, und ist der Platz überhaupt zu holen?
 *
 * Deshalb ist er von Schritt 04 getrennt. Wer hier abbricht, hat fast nichts
 * ausgegeben.
 */

/**
 * Wie viele Treffer geholt werden.
 *
 * ⚠️ **Der Preis ist linear**: `tiefe: 100` kostet das Zehnfache von `tiefe: 10`.
 * Und der Ertrag ist es nicht — für die Frage „wer steht da und was fehlt" sind
 * die ersten zehn die Antwort. Google hat `num=100` ohnehin abgeschafft; was
 * darunter steht, sieht niemand.
 */
const SERP_TIEFE = 10;

/**
 * Ab wie vielen starken Domains in den Top 10 das Thema als aussichtslos gilt.
 *
 * Sechs von zehn heißt: Auch ein sehr guter Text landet realistisch auf Platz 7.
 * Darunter beginnt der Bereich, in dem ein Artikel Arbeit kostet und keine
 * Klicks bringt. Fünf wäre zu streng — bei fünf starken Domains sind fünf
 * schwache dabei, und gegen die ist ein Platz zu holen.
 */
const AUSSICHTSLOS_AB = 6;

/**
 * Domains, gegen die eine kleine Firmenseite in der organischen Suche nicht
 * ankommt.
 *
 * Es geht nicht um Textqualität — gegen die meisten dieser Seiten ist inhaltlich
 * leicht zu gewinnen. Es geht um das, was Google zusätzlich bewertet: Alter,
 * Linkprofil, Markenbekanntheit, und bei Behörden schlicht Zuständigkeit. Wer
 * gegen `gesetze-im-internet.de` über einen Gesetzestext schreibt, gewinnt den
 * Platz nicht, egal wie gut der Text ist.
 *
 * **Die Liste ist bewusst kurz und deutsch.** Sie soll die Fälle abdecken, die
 * bei KI-, Automatisierungs- und Rechtsthemen im deutschen Mittelstand
 * tatsächlich vorkommen — nicht jede große Domain der Welt. Wer sie erweitert,
 * sollte einen Fall nennen können, in dem sie gefehlt hat.
 *
 * Schreibweise: Ein führender Punkt (`.bund.de`) trifft jede Subdomain darunter,
 * ein voller Name (`heise.de`) trifft die Domain und ihre Subdomains, ein Wort
 * ohne Punkt (`kpmg`) trifft jede Domain, die dieses Wort als eigenen Teil führt
 * — das ist der einzige Weg, `kpmg.de`, `kpmg.com` und `home.kpmg` gemeinsam zu
 * erwischen.
 */
export const STARKE_DOMAINS: readonly string[] = [
  // Behörden und amtliche Quellen
  ".bund.de",
  ".europa.eu",
  "gesetze-im-internet.de",
  "bundesnetzagentur.de",
  "bmwk.de",
  "bmwe.de",
  // Große Verlage und Portale
  "wikipedia.org",
  "haufe.de",
  "ihk.de",
  "dihk.de",
  "computerwoche.de",
  "heise.de",
  "t3n.de",
  "chip.de",
  "focus.de",
  "handelsblatt.com",
  "wiwo.de",
  // Herstellerdokumentation — die Primärquelle zum eigenen Produkt
  "microsoft.com",
  "aws.amazon.com",
  "google.com",
  "openai.com",
  "anthropic.com",
  // Beratungsriesen
  "kpmg",
  "pwc",
  "deloitte",
  "ey.com",
  "bcg.com",
  "mckinsey",
];

/** Domain auf die vergleichbare Form bringen: klein, ohne `www.`, ohne Punkte am Rand. */
function normalisiere(domain: string): string {
  return domain.trim().toLowerCase().replace(/^www\./, "").replace(/\.$/, "");
}

/** Gehört diese Domain zu denen, gegen die nicht anzukommen ist? */
export function istStarkeDomain(domain: string): boolean {
  const wert = normalisiere(domain);
  if (!wert) return false;
  const teile = wert.split(".");

  return STARKE_DOMAINS.some((eintrag) => {
    if (eintrag.startsWith(".")) {
      // `.bund.de` trifft `arbeitsagentur.bund.de`, aber auch `bund.de` selbst.
      return wert.endsWith(eintrag) || wert === eintrag.slice(1);
    }
    if (eintrag.includes(".")) {
      return wert === eintrag || wert.endsWith(`.${eintrag}`);
    }
    // Markenwort ohne Endung: als eigener Namensteil, nicht als Teilzeichenkette.
    // Sonst träfe `pwc` auch `pwcinformatik-beispiel.de`.
    return teile.includes(eintrag);
  });
}

/** Ein leeres Bild — wenn keine Abfrage möglich war, aber der Lauf weitergehen soll. */
function leeresBild(keyword: string): SerpBild {
  return {
    keyword,
    treffer: [],
    fragen: [],
    featuredSnippet: null,
    merkmale: [],
    hatKiUebersicht: false,
    // Bewusst `false`: „keine Daten" ist nicht dasselbe wie „aussichtslos".
    // Ein `true` hier würde Schritt 05 ein Urteil vorgeben, das niemand gefällt hat.
    aussichtslos: false,
  };
}

/**
 * Holt die Suchergebnisseite zu einem Keyword und zerlegt sie in das, womit
 * Schritt 04 und 05 arbeiten.
 *
 * Fehlen die Zugangsdaten oder ist das Tagesbudget aufgebraucht, gibt die
 * Funktion ein leeres Bild zurück und warnt. Das hat einen angenehmen
 * Nebeneffekt: Ohne Treffer liest Schritt 04 keine Seiten und verbrennt keine
 * Firecrawl-Credits für eine Recherche, die es nicht geben kann.
 *
 * Alles andere — Netzfehler, kaputte Antwort, Fehler in der Aufgabe — wird
 * **weitergereicht**. Ein stiller Rückfall auf „die Suchergebnisseite ist leer"
 * wäre die gefährlichste Antwort von allen: Schritt 05 hielte jedes Thema für
 * unbesetzt und jede Lücke für eine Chance.
 */
export async function analysiereSerp(keyword: string): Promise<SerpBild> {
  const suche = keyword.trim();
  if (!suche) {
    warne("SERP: leeres Keyword übergeben — es gibt nichts abzufragen.");
    return leeresBild(keyword);
  }

  try {
    pruefeZugangsdaten();
  } catch (problem: unknown) {
    warne(
      `SERP „${suche}": keine DataForSEO-Zugangsdaten — der Artikel entsteht ohne Kenntnis ` +
        "der Konkurrenz. " +
        (problem instanceof Error ? problem.message : String(problem)),
    );
    return leeresBild(suche);
  }

  let analyse;
  try {
    analyse = await serpAnalyse(suche, {
      tiefe: SERP_TIEFE,
      // Ohne Klicktiefe liefert Google nur die Fragen ohne die Antworttexte.
      // Eine Ebene reicht: Was Google aufgeklappt zeigt, ist die Erwartung an
      // die Antwort — tiefer wird es zur Fragenliste ohne Bezug zum Thema.
      paaKlickTiefe: 1,
    });
  } catch (problem: unknown) {
    if (problem instanceof DataForSeoFehler && problem.ebene === "budget") {
      warne(
        `SERP „${suche}": Tagesbudget aufgebraucht — dieses Thema läuft ohne SERP-Bild weiter. ` +
          problem.message,
      );
      return leeresBild(suche);
    }
    throw problem;
  }

  const treffer: SerpTreffer[] = analyse.organisch
    .filter((eintrag) => Boolean(eintrag.url))
    .slice(0, SERP_TIEFE)
    .map((eintrag, index) => ({
      // `organischePosition` ist die Platzierung in der Trefferliste,
      // `position` die über alle Elemente hinweg. Für „wer steht vor mir"
      // zählt die erste; der Index ist der Rückfall, wenn beide fehlen.
      position: eintrag.organischePosition ?? eintrag.position ?? index + 1,
      domain: normalisiere(eintrag.domain),
      titel: eintrag.titel ?? "",
      url: eintrag.url ?? "",
      beschreibung: eintrag.beschreibung ?? "",
    }));

  const fragen: string[] = [];
  for (const eintrag of analyse.fragen) {
    const frage = eintrag.frage?.trim();
    if (!frage) continue;
    if (fragen.some((vorhanden) => vorhanden.toLowerCase() === frage.toLowerCase())) continue;
    fragen.push(frage);
  }

  const starke = treffer.filter((eintrag) => istStarkeDomain(eintrag.domain)).length;
  const aussichtslos = starke >= AUSSICHTSLOS_AB;

  const bild: SerpBild = {
    keyword: analyse.keyword || suche,
    treffer,
    fragen,
    featuredSnippet: analyse.featuredSnippet
      ? {
          titel: analyse.featuredSnippet.titel ?? "",
          url: analyse.featuredSnippet.url ?? "",
          text: analyse.featuredSnippet.beschreibung ?? "",
        }
      : null,
    merkmale: analyse.vorhandeneFeatures,
    // Beide Wege prüfen: Eine KI-Übersicht ohne aufgeführte Quellen kommt vor,
    // dann ist die Liste leer und nur der Elementtyp verrät sie.
    hatKiUebersicht:
      analyse.aiOverviewQuellen.length > 0 || analyse.vorhandeneFeatures.includes("ai_overview"),
    aussichtslos,
  };

  melde(
    `SERP „${bild.keyword}": ${treffer.length} Treffer, ${fragen.length} Fragen, ` +
      `${starke} starke Domain(s)${bild.hatKiUebersicht ? ", KI-Übersicht steht darüber" : ""}.`,
  );

  if (aussichtslos) {
    warne(
      `SERP „${bild.keyword}": ${starke} der Top ${treffer.length} gehören Behörden, großen ` +
        "Verlagen oder Herstellern. Der Platz ist organisch kaum zu holen — das Thema taugt " +
        "höchstens als Beitrag zum Thema-Cluster, nicht als Ranking-Versuch.",
    );
  }

  return bild;
}
