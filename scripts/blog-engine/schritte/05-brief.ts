/**
 * SCHRITT 05 — Das Redaktionsbriefing.
 *
 * Hier entscheidet sich, ob der Artikel etwas zu sagen hat. Alles danach ist
 * Ausführung: Schritt 06 formuliert, Schritt 07 korrigiert. Keiner der beiden
 * kann reparieren, dass ein Text nichts enthält, was nicht schon auf den ersten
 * zehn Ergebnissen steht.
 *
 * Deshalb steht genau diese Frage im Prompt, und deshalb ist {@link Brief.eigenanteil}
 * das einzige Feld, dessen Fehlen den Schritt abbrechen lässt. Googles eigene
 * Anleitung zu generativen Suchfunktionen setzt die Messlatte wörtlich so:
 * nichts veröffentlichen, was „could easily be produced by a generative AI
 * model“. Ein Briefing ohne Eigenanteil beschreibt genau das.
 *
 * ⚠️ **Der Schritt liest die Konkurrenz gekürzt.** Von jeder gelesenen Seite
 * gehen die Überschriften und die ersten Absätze in den Prompt, nicht der
 * Volltext. Das spart nicht nur Token: Wer zehn fremde Artikel vollständig
 * vorgelegt bekommt, schreibt den elften daraus zusammen. Gebraucht wird die
 * *Form* der Konkurrenz — worüber alle schreiben und worüber keiner — nicht
 * ihre Formulierungen.
 */

import type {
  AuswahlErgebnis,
  Brief,
  RechercheErgebnis,
  SerpBild,
} from "../lib/typen.js";
import { MODELL_STRUKTUR, frage, type JsonSchema } from "../lib/claude.js";
import { melde, warne } from "../lib/protokoll.js";

/** Ein Thema, so wie Schritt 02 es übergibt. */
export type GewaehltesThema = AuswahlErgebnis["gewaehlt"][number];

/**
 * Wie viel Text je Konkurrenzseite in den Prompt geht.
 *
 * 1.200 Zeichen sind ungefähr die Einleitung plus der erste Abschnitt — genug,
 * um zu erkennen, wie eine Seite das Thema anfasst, zu wenig, um sie
 * nachzuerzählen.
 */
const AUSZUG_ZEICHEN = 1200;

/** Wie viele Konkurrenzseiten überhaupt gezeigt werden. */
const MAX_SEITEN = 10;

/**
 * Der Umfangskorridor, in dem die Qualitätsprüfung keinen Befund erhebt.
 *
 * Er stammt aus `lib/qualitaet.ts` (Regel `artikel-umfang`, 700 bis 2.500
 * Wörter) und ist hier enger gefasst. Grund: Textlänge ist in der GEO-Forschung
 * der am schwächsten belegte Faktor überhaupt — das Princeton-Papier misst
 * null bis negativ. Die Zahl ist ein Anhaltspunkt für den Schreibschritt, keine
 * Zielgröße, an der etwas hängt.
 */
const UMFANG_MIN = 900;
const UMFANG_MAX = 1800;

/**
 * Zielpfade, die es unabhängig vom Artikelbestand immer gibt.
 *
 * Schritt 05 kennt die vorhandenen Artikel nicht — die kommen erst in Schritt
 * 06 dazu. Ohne diese Liste würde das Modell Pfade erfinden, und ein interner
 * Link ins Leere ist schlechter als keiner. Artikel-Links setzt deshalb der
 * Schreibschritt, Themenwege und Standardseiten dieser hier.
 */
function stabileZiele(cluster: string): string[] {
  return [
    `/gratis-wissen/thema/${cluster}`,
    "/gratis-wissen",
    "/leistungen",
    "/referenzen",
    "/haltung",
    "/glossar",
    "/kontakt",
  ];
}

/** Was das Modell beisteuert. Alles andere im Brief steht schon fest. */
interface ModellBrief {
  titelVorschlaege: string[];
  leser: string;
  kernthese: string;
  eigenanteil: string;
  gliederung: Array<{ heading: string; inhalt: string; istFrage: boolean }>;
  fragen: string[];
  verlinkungsziele: Array<{ ziel: string; anlass: string }>;
  abgrenzung: string[];
}

/**
 * Das Schema der Modellantwort.
 *
 * Die Längengrenzen stehen bewusst im Schema und nicht nur im Prompttext: Ein
 * Modell hält eine Grenze, die es als Bedingung der Ausgabe sieht, deutlich
 * zuverlässiger ein als eine, die irgendwo im Fließtext der Anweisung steht.
 */
const BRIEF_SCHEMA: JsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "titelVorschlaege",
    "leser",
    "kernthese",
    "eigenanteil",
    "gliederung",
    "fragen",
    "verlinkungsziele",
    "abgrenzung",
  ],
  properties: {
    titelVorschlaege: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string", minLength: 15, maxLength: 120 },
    },
    leser: { type: "string", minLength: 40, maxLength: 400 },
    kernthese: { type: "string", minLength: 40, maxLength: 300 },
    eigenanteil: { type: "string", minLength: 60, maxLength: 600 },
    gliederung: {
      type: "array",
      minItems: 5,
      maxItems: 9,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["heading", "inhalt", "istFrage"],
        properties: {
          heading: { type: "string", minLength: 8, maxLength: 120 },
          inhalt: { type: "string", minLength: 40, maxLength: 600 },
          istFrage: { type: "boolean" },
        },
      },
    },
    fragen: {
      type: "array",
      minItems: 2,
      maxItems: 6,
      items: { type: "string", minLength: 10, maxLength: 160 },
    },
    verlinkungsziele: {
      type: "array",
      minItems: 2,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["ziel", "anlass"],
        properties: {
          ziel: { type: "string", minLength: 2, maxLength: 120 },
          anlass: { type: "string", minLength: 15, maxLength: 240 },
        },
      },
    },
    abgrenzung: {
      type: "array",
      minItems: 1,
      maxItems: 6,
      items: { type: "string", minLength: 10, maxLength: 200 },
    },
  },
};

const SYSTEM_BRIEF = [
  "Du bist Redaktionsleiter eines deutschen Fachblogs für Softwareentwicklung",
  "und Automatisierung im Mittelstand. Du schreibst keine Artikel, du briefst sie.",
  "",
  "Deine Arbeit besteht aus einer einzigen Frage: Was steht in diesem Artikel,",
  "das nicht auf den ersten zehn Ergebnissen steht? Ein Briefing, das darauf",
  "keine Antwort hat, ist wertlos — dann entsteht ein elfter Artikel, der",
  "dasselbe sagt wie die zehn davor, und die Suchmaschine hat keinen Grund, ihn",
  "zu zeigen.",
  "",
  "Du arbeitest nüchtern und misstrauisch. Du übernimmst keine Behauptung aus",
  "den gelesenen Seiten, für die kein Beleg vorliegt. Du erfindest keine Zahlen,",
  "keine Studien und keine Quellen. Antworte ausschließlich mit dem geforderten",
  "JSON-Objekt.",
].join("\n");

/**
 * Erstellt das Briefing aus Thema, Ergebnisseite und Recherche.
 *
 * @throws {Error} wenn das Thema keinen Eigenanteil trägt — dann wird nicht
 *   produziert. Schritt 02 sortiert solche Themen bereits aus; diese Prüfung ist
 *   die letzte vor der ersten Rechnung.
 */
export async function erstelleBrief(
  thema: GewaehltesThema,
  serp: SerpBild,
  recherche: RechercheErgebnis
): Promise<Brief> {
  if (!thema.substanz) {
    throw new Error(
      `Thema „${thema.id}“ hat keine substanz. Ohne belegten Eigenanteil wird ` +
        `nicht produziert — das ist die Regel, wegen der eine tägliche Frequenz ` +
        `überhaupt verantwortbar ist.`
    );
  }

  if (serp.aussichtslos) {
    warne(
      `Thema „${thema.id}“: die Ergebnisseite ist von Portalen besetzt, gegen die ` +
        `eine kleine Domain nicht ankommt. Der Artikel entsteht trotzdem, aber die ` +
        `Erwartung an das Ranking gehört heruntergesetzt.`
    );
  }

  const ziele = stabileZiele(thema.cluster);
  const nutzer = baueNutzeranweisung(thema, serp, recherche, ziele);

  let modellBrief = await frage<ModellBrief>({
    modell: MODELL_STRUKTUR,
    system: SYSTEM_BRIEF,
    nachricht: nutzer,
    schema: BRIEF_SCHEMA,
    maxTokens: 8_000,
    zweck: "brief",
  });

  // Der Eigenanteil ist das einzige Feld, das einen zweiten Anlauf rechtfertigt:
  // Ohne ihn ist der ganze Schritt umsonst gelaufen. Ein Anlauf, nicht drei —
  // wenn das Modell beim zweiten Mal nichts findet, ist nichts da.
  if (!eigenanteilTraegt(modellBrief.eigenanteil)) {
    warne(
      `Eigenanteil zu dünn („${modellBrief.eigenanteil.slice(0, 80)}“). Zweiter Anlauf.`
    );
    modellBrief = await frage<ModellBrief>({
      modell: MODELL_STRUKTUR,
      system: SYSTEM_BRIEF,
      nachricht: `${nutzer}\n\n${NACHFASSEN_EIGENANTEIL}`,
      schema: BRIEF_SCHEMA,
      maxTokens: 8_000,
      zweck: "brief-nachfassen",
    });
  }

  if (!eigenanteilTraegt(modellBrief.eigenanteil)) {
    throw new Error(
      `Thema „${thema.id}“ bekommt keinen tragfähigen Eigenanteil. Der Artikel ` +
        `entsteht nicht. Entweder das Material im Vorrat reicht nicht, oder das ` +
        `Thema ist ausgeschrieben — beides entscheidet ein Mensch, nicht dieser Lauf.`
    );
  }

  const gliederung = modellBrief.gliederung.map((punkt) => ({
    heading: punkt.heading.replace(/\.$/, ""),
    inhalt: punkt.inhalt,
    istFrage: punkt.heading.trim().endsWith("?"),
  }));

  const frageAnteil =
    gliederung.filter((punkt) => punkt.istFrage).length / (gliederung.length || 1);
  if (frageAnteil <= 0.5) {
    warne(
      `Nur ${Math.round(frageAnteil * 100)} Prozent der Überschriften sind Fragen. ` +
        `78,4 Prozent der frage-verknüpften ChatGPT-Zitate stammen aus einer H2 — ` +
        `Schritt 07 meldet das als Warnung, blockiert aber nicht.`
    );
  }

  const brief: Brief = {
    themaId: thema.id,
    titelVorschlaege: modellBrief.titelVorschlaege,
    zielKeyword: thema.zielKeyword,
    sekundaerKeywords: (thema.sekundaer ?? []).slice(0, 12),
    cluster: thema.cluster,
    autor: thema.autor,
    leser: modellBrief.leser,
    kernthese: modellBrief.kernthese,
    eigenanteil: modellBrief.eigenanteil,
    gliederung,
    fragen: vereinige(modellBrief.fragen, serp.fragen).slice(0, 6),
    // Belege werden nicht vom Modell erzeugt, sondern aus der Recherche
    // durchgereicht. Alles andere wäre eine Einladung, eine Quelle zu erfinden,
    // die zur Aussage passt.
    belege: recherche.belege.slice(0, 15),
    material: thema.substanz.material ?? [],
    verlinkungsziele: modellBrief.verlinkungsziele.filter((eintrag) =>
      ziele.includes(eintrag.ziel)
    ),
    abgrenzung: modellBrief.abgrenzung,
    zielWortzahl: zielWortzahl(recherche.medianWortzahl),
  };

  const verworfen = modellBrief.verlinkungsziele.length - brief.verlinkungsziele.length;
  if (verworfen > 0) {
    warne(`${verworfen} Verlinkungsziele verworfen: nicht in der Liste vorhandener Pfade.`);
  }

  melde(
    `Brief für „${thema.id}“ steht: ${gliederung.length} Abschnitte, ` +
      `${brief.belege.length} Belege, Zielumfang ${brief.zielWortzahl} Wörter.`
  );

  return brief;
}

/* -------------------------------------------------------------------------- */
/* Bausteine                                                                  */
/* -------------------------------------------------------------------------- */

const NACHFASSEN_EIGENANTEIL = [
  "NACHTRAG — der Eigenanteil im ersten Versuch war leer oder eine Floskel.",
  "",
  "Schreib ihn neu, und zwar so, dass er sich überprüfen lässt: Was genau",
  "steht in diesem Artikel, das auf keiner der oben gezeigten Seiten steht?",
  "Nenne die Stelle im Artikel, an der es steht, und woher es kommt. Sätze wie",
  "„ein praxisnaher Blick“, „umfassender Überblick“ oder „fundierte Einordnung“",
  "sind keine Antwort. Wenn es nichts gibt, schreib das ausdrücklich hin.",
].join("\n");

/**
 * Prüft, ob der Eigenanteil eine Aussage ist oder nur eine Absichtserklärung.
 *
 * Die Floskelliste ist kurz und absichtlich grob: Sie fängt die Fälle ab, in
 * denen ein Modell die Frage höflich umgeht. Feinere Prüfung passiert nicht
 * hier, sondern beim Menschen, der den Entwurf freigibt.
 */
function eigenanteilTraegt(text: string): boolean {
  const wert = text.trim();
  if (wert.length < 60) return false;
  const floskeln =
    /\b(?:praxisnah\w*|umfassend\w*|fundiert\w*|ganzheitlich\w*|verständlich\s+aufbereitet|kompakter?\s+überblick|strukturiert\w*\s+überblick|klare?\s+einordnung)\b/i;
  if (floskeln.test(wert) && wert.length < 160) return false;
  return true;
}

/** Fasst zwei Fragelisten zusammen, ohne Dubletten und ohne Reihenfolge zu verlieren. */
function vereinige(erste: string[], zweite: string[]): string[] {
  const gesehen = new Set<string>();
  const ergebnis: string[] = [];
  for (const eintrag of [...erste, ...zweite]) {
    const schluessel = eintrag.trim().toLowerCase();
    if (!schluessel || gesehen.has(schluessel)) continue;
    gesehen.add(schluessel);
    ergebnis.push(eintrag.trim());
  }
  return ergebnis;
}

/**
 * Leitet den Zielumfang aus der Konkurrenz ab und deckelt ihn.
 *
 * Der Median der rankenden Seiten ist der beste verfügbare Hinweis darauf, was
 * die Suchenden erwarten. Er ist aber kein Ziel: Längere Texte ranken nicht
 * besser, und ein Artikel, der 2.400 Wörter braucht, um 900 Wörter Inhalt zu
 * transportieren, verletzt jede Kennzahl des Hausstils gleichzeitig.
 */
function zielWortzahl(medianWortzahl: number): number {
  if (!Number.isFinite(medianWortzahl) || medianWortzahl <= 0) return UMFANG_MIN;
  return Math.min(UMFANG_MAX, Math.max(UMFANG_MIN, Math.round(medianWortzahl / 50) * 50));
}

function baueNutzeranweisung(
  thema: GewaehltesThema,
  serp: SerpBild,
  recherche: RechercheErgebnis,
  ziele: string[]
): string {
  const substanz = thema.substanz;
  const teile: string[] = [];

  teile.push("# Auftrag");
  teile.push(
    "Erstelle das Redaktionsbriefing für einen Artikel zum Zielkeyword " +
      `„${thema.zielKeyword}“. Arbeitstitel der Redaktion: „${thema.arbeitstitel}“.`
  );

  teile.push("");
  teile.push("# Der Eigenanteil, den nur dieses Haus hat");
  if (substanz) {
    teile.push(`Art: ${substanz.art}`);
    teile.push(`Was: ${substanz.beschreibung}`);
    teile.push(`Herkunft: ${substanz.herkunft}`);
    if (substanz.material?.length) {
      teile.push("Material, das wörtlich verwendet werden darf:");
      for (const zeile of substanz.material) teile.push(`- ${zeile}`);
    }
  }
  teile.push(
    "Das Feld `eigenanteil` im Briefing baut hierauf auf und macht daraus einen " +
      "überprüfbaren Satz: Was steht im Artikel, das auf keiner der Seiten unten steht?"
  );

  teile.push("");
  teile.push("# Was heute auf der Ergebnisseite steht");
  if (serp.featuredSnippet) {
    teile.push(
      `Hervorgehobenes Ergebnis (${serp.featuredSnippet.url}): ${serp.featuredSnippet.text}`
    );
  }
  teile.push(`KI-Übersicht über den Ergebnissen: ${serp.hatKiUebersicht ? "ja" : "nein"}`);
  if (serp.merkmale.length) teile.push(`Elemente der Seite: ${serp.merkmale.join(", ")}`);
  for (const treffer of serp.treffer.slice(0, MAX_SEITEN)) {
    teile.push(
      `${treffer.position}. ${treffer.domain} — ${treffer.titel}\n   ${treffer.beschreibung}`
    );
  }

  if (serp.fragen.length) {
    teile.push("");
    teile.push("# Fragen, die Nutzer zu diesem Thema stellen");
    for (const frage of serp.fragen) teile.push(`- ${frage}`);
  }

  teile.push("");
  teile.push("# Was in den rankenden Seiten tatsächlich drinsteht");
  teile.push(
    `Median-Umfang der rankenden Seiten: ${recherche.medianWortzahl} Wörter.`
  );
  for (const seite of recherche.gelesen.slice(0, MAX_SEITEN)) {
    teile.push("");
    teile.push(`## ${seite.domain} — ${seite.titel} (${seite.wortzahl} Wörter)`);
    if (seite.ueberschriften.length) {
      teile.push(`Überschriften: ${seite.ueberschriften.join(" · ")}`);
    }
    teile.push(`Auszug: ${seite.inhalt.slice(0, AUSZUG_ZEICHEN).replace(/\s+/g, " ")}`);
  }

  if (recherche.pflichtthemen.length) {
    teile.push("");
    teile.push("# Pflichtthemen — beantwortet jede dieser Seiten");
    for (const punkt of recherche.pflichtthemen) teile.push(`- ${punkt}`);
    teile.push(
      "Was hier steht, muss vorkommen, sonst wirkt der Artikel unvollständig. " +
        "Es ist aber nicht der Grund, warum jemand ihn liest."
    );
  }

  if (recherche.luecken.length) {
    teile.push("");
    teile.push("# Lücken — beantwortet keine dieser Seiten");
    for (const punkt of recherche.luecken) teile.push(`- ${punkt}`);
    teile.push("Hier liegt die Chance. Zusammen mit dem Eigenanteil trägt das den Artikel.");
  }

  teile.push("");
  teile.push("# Belege, die verwendet werden dürfen");
  if (recherche.belege.length) {
    for (const beleg of recherche.belege) {
      teile.push(`- ${beleg.aussage} (${beleg.quelle}, ${beleg.url})`);
    }
  } else {
    teile.push("Keine. Der Artikel enthält dann keine einzige Fremdzahl.");
  }

  teile.push("");
  teile.push("# Zielpfade für interne Links");
  teile.push(
    "Wähle `ziel` ausschließlich aus dieser Liste. Andere Pfade werden verworfen. " +
      "Links auf einzelne Artikel setzt der Schreibschritt selbst, weil erst er den " +
      "Bestand kennt."
  );
  for (const ziel of ziele) teile.push(`- ${ziel}`);

  teile.push("");
  teile.push("# Was das Briefing enthalten muss");
  teile.push(
    [
      "- `titelVorschlaege`: drei bis fünf Titel. Jeder eine Aussage oder eine Frage,",
      "  keiner ein Etikett, keiner mit Jahreszahl. Das Zielkeyword kommt vor.",
      "- `leser`: wer das liest und mit welcher Frage im Kopf. Ein Betrieb, eine Rolle,",
      "  eine Lage — keine Zielgruppenbeschreibung aus dem Marketing.",
      "- `kernthese`: die eine Aussage, die hängen bleiben soll. Ein Satz.",
      "- `eigenanteil`: die Antwort auf die Kernfrage. Überprüfbar, nicht werbend.",
      "- `gliederung`: fünf bis neun Abschnitte in der Reihenfolge, in der sie stehen.",
      "  **Mehr als die Hälfte der Überschriften sind echte Fragen mit Fragezeichen**,",
      "  und `inhalt` sagt, was in den Abschnitt gehört — nicht, wie er klingen soll.",
      "  Der erste Abschnitt trägt die Antwort auf die Titelfrage, nicht die Hinführung.",
      "- `fragen`: zwei bis sechs Fragen für den Frage-Antwort-Block, bevorzugt aus der",
      "  Liste oben.",
      "- `verlinkungsziele`: Pfad plus Anlass, warum ein Link an dieser Stelle passt.",
      "- `abgrenzung`: was in diesem Artikel ausdrücklich nicht vorkommt.",
    ].join("\n")
  );

  return teile.join("\n");
}
