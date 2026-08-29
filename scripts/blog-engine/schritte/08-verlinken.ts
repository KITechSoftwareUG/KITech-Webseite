import type { Artikel } from "../../../src/lib/wissen/schema.js";
import type { VerlinkungsAenderung } from "../lib/typen.js";
import { frage, MODELL_STRUKTUR } from "../lib/claude.js";
import { schreibeArtikel } from "../lib/artikel-io.js";
import { melde, warne } from "../lib/protokoll.js";

/**
 * Schritt 08 — den neuen Artikel in den Bestand einhängen.
 *
 * **Warum es diesen Schritt gibt.** Ohne ihn zeigen Links nur nach hinten: Ein
 * neuer Artikel verweist auf ältere, aber kein älterer verweist auf ihn. Er
 * hängt dann an genau zwei Stellen — in der Übersicht und in der Themenseite —
 * und rutscht aus der Übersicht nach vierzig Tagen auf Seite drei. Über die
 * Sitemap bleibt er auffindbar, aber eine Sitemap überträgt kein Gewicht; sie
 * meldet nur Existenz.
 *
 * Dieser Schritt sucht deshalb in **bestehenden** Artikeln Stellen, an denen ein
 * Verweis auf den neuen natürlich passt, und trägt ihn dort ein.
 *
 * **Die Grenzen stammen aus der einzigen belastbaren öffentlichen Datenbasis**
 * zu interner Verlinkung: Zyppy hat 23 Millionen interne Links über 1.800
 * Websites (rund 520.000 URLs) gegen Search-Console-Daten gehalten. Zwei
 * Befunde daraus stehen hinter dem Code — beide sind Korrelationen, was die
 * Autoren selbst betonen („directionally useful but not necessarily scientific
 * truth"):
 *
 *   1. URLs mit 0–4 eingehenden internen Links bekamen im Schnitt 2 Klicks aus
 *      der Suche, URLs mit 40–44 das Vierfache. **Ab etwa 45 bis 50 kehrt sich
 *      der Zusammenhang um** — deshalb DECKEL_JE_ZIEL.
 *   2. Der stärkste gemessene Zusammenhang war nicht die Zahl der Links,
 *      sondern die **Vielfalt der Ankertexte** auf dieselbe Seite. Die Autoren
 *      dazu: Ein seitenweiter Link kann nur einen einzigen Ankertext tragen und
 *      zählt deshalb „in some ways … a single editorial link". Deshalb verlangt
 *      dieser Schritt für jedes Ziel einen neuen, anderen Ankertext.
 *
 * **Was hier nicht passiert:** Der Text bestehender Artikel wird nicht geändert.
 * Ein Link entsteht ausschließlich dadurch, dass eine **bereits vorhandene**
 * Formulierung zum Ankertext wird. Ein Modell, das Sätze in abgenommene Artikel
 * einfügt, wäre eine ganz andere Sorte Eingriff.
 */

/** Höchstens so viele bestehende Artikel werden je neuem Artikel angefasst. */
const MAX_GEAENDERTE_ARTIKEL = 3;

/** Schema-Grenze: kein Artikel trägt mehr als acht interne Links. */
const MAX_LINKS_JE_ARTIKEL = 8;

/**
 * Höchstzahl eingehender interner Links je Zielseite.
 *
 * 40 statt 45, weil der Umschlagpunkt in der Auswertung kein scharfer Wert ist,
 * sondern ein Bereich. Wer bis an die Kante geht, steht schon im Zweifel.
 */
const DECKEL_JE_ZIEL = 40;

interface Verweisvorschlag {
  /** Wörtliches Zitat aus dem Absatz, das zum Ankertext wird. */
  zitat: string;
  /** Index des Abschnitts, in dem das Zitat steht. */
  abschnitt: number;
  /** Warum der Verweis an dieser Stelle passt. Nur fürs Protokoll. */
  begruendung: string;
  /** Das Modell darf ablehnen — und soll es, wenn nichts passt. */
  passt: boolean;
}

const VORSCHLAG_SCHEMA = {
  type: "object",
  properties: {
    passt: {
      type: "boolean",
      description:
        "false, wenn keine Stelle im Text wirklich zu einem Verweis auf den neuen Artikel einlädt. Im Zweifel false.",
    },
    zitat: {
      type: "string",
      description:
        "Eine zusammenhängende Wortfolge, die WÖRTLICH und ZEICHENGENAU in einem der Absätze steht. Drei bis zwölf Wörter. Keine Umformulierung, keine Auslassungszeichen, keine Anführungszeichen drumherum.",
    },
    abschnitt: {
      type: "integer",
      description: "Nummer des Abschnitts, in dem das Zitat steht (0 für den ersten).",
    },
    begruendung: {
      type: "string",
      description: "Ein Satz: warum ein Leser an dieser Stelle den neuen Artikel brauchen könnte.",
    },
  },
  required: ["passt", "zitat", "abschnitt", "begruendung"],
} as const;

/**
 * Wie oft jede Zielseite im übergebenen Bestand schon verlinkt wird, und mit
 * welchen Ankertexten.
 *
 * Bewusst aus dem übergebenen Bestand berechnet statt aus dem Website-Loader:
 * In einem Lauf mit drei Artikeln muss der zweite die Änderungen des ersten
 * schon sehen, sonst laufen beide in dieselbe Zielseite.
 */
function verlinkungsBild(bestand: Artikel[]): Map<string, { anzahl: number; anker: Set<string> }> {
  const bild = new Map<string, { anzahl: number; anker: Set<string> }>();

  for (const artikel of bestand) {
    for (const link of artikel.interneLinks) {
      const eintrag = bild.get(link.ziel) ?? { anzahl: 0, anker: new Set<string>() };
      eintrag.anzahl += 1;
      eintrag.anker.add(link.ankertext.trim().toLowerCase());
      bild.set(link.ziel, eintrag);
    }
  }

  return bild;
}

/** Wortmenge eines Keywords — Grundlage für die Ähnlichkeit zweier Themen. */
function woerter(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-zäöüß0-9]+/)
      .filter((wort) => wort.length > 3)
  );
}

/** Anteil gemeinsamer Wörter an allen Wörtern beider Mengen. */
function aehnlichkeit(a: string, b: string): number {
  const mengeA = woerter(a);
  const mengeB = woerter(b);
  if (mengeA.size === 0 || mengeB.size === 0) return 0;

  let gemeinsam = 0;
  for (const wort of mengeA) if (mengeB.has(wort)) gemeinsam += 1;

  return gemeinsam / (mengeA.size + mengeB.size - gemeinsam);
}

/**
 * Kandidaten in der Reihenfolge, in der sie gefragt werden.
 *
 * Zuerst dasselbe Thema — dort ist ein Verweis fast immer angebracht und der
 * Hub hält beide ohnehin zusammen. Danach thematisch nahe Artikel, absteigend
 * nach Ähnlichkeit des Zielkeywords.
 */
function findeKandidaten(neu: Artikel, bestand: Artikel[]): Artikel[] {
  const andere = bestand.filter(
    (artikel) => artikel.slug !== neu.slug && artikel.status === "veroeffentlicht"
  );

  const bewertet = andere.map((artikel) => ({
    artikel,
    punkte:
      (artikel.cluster === neu.cluster ? 1 : 0) +
      aehnlichkeit(artikel.zielKeyword, neu.zielKeyword),
  }));

  return bewertet
    .filter((eintrag) => eintrag.punkte > 0.05)
    .sort((a, b) => b.punkte - a.punkte)
    .map((eintrag) => eintrag.artikel);
}

/** Der Text eines Abschnitts, so wie ihn `verlinken.tsx` beim Rendern sieht. */
function abschnittstext(artikel: Artikel, index: number): string {
  const abschnitt = artikel.abschnitte[index];
  if (!abschnitt) return "";

  return [
    abschnitt.paragraphs.join(" "),
    ...(abschnitt.unterabschnitte ?? []).map((unter) => unter.paragraphs.join(" ")),
  ].join(" ");
}

function baueAuftrag(kandidat: Artikel, neu: Artikel): string {
  const abschnitte = kandidat.abschnitte
    .map((abschnitt, index) => {
      const text = abschnittstext(kandidat, index);
      return `### Abschnitt ${index}: ${abschnitt.heading}\n${text}`;
    })
    .join("\n\n");

  return [
    "# Aufgabe",
    "",
    "Unten steht ein bereits veröffentlichter Artikel. Darunter ein neuer Artikel,",
    "der gerade entstanden ist.",
    "",
    "Finde **höchstens eine** Stelle im bestehenden Artikel, an der ein Leser vom",
    "neuen Artikel profitieren würde — und gib die Wortfolge zurück, die dort zum",
    "Link werden soll.",
    "",
    "## Harte Bedingungen",
    "",
    "1. Das Zitat muss **wörtlich und zeichengenau** in dem angegebenen Abschnitt",
    "   stehen. Kopiere es heraus, formuliere es nicht um. Ein Zitat, das nicht",
    "   exakt im Text steht, wird verworfen und der Verweis fällt aus.",
    "2. Drei bis zwölf Wörter. Kein ganzer Satz, keine Satzzeichen am Rand.",
    "3. Die Stelle muss inhaltlich zum neuen Artikel führen. Ein Verweis, der nur",
    "   irgendwie passt, ist keiner.",
    "4. Wenn keine Stelle wirklich passt: `passt: false`. Das ist der häufigere",
    "   Fall und die richtige Antwort — ein erzwungener Verweis schadet beiden",
    "   Artikeln.",
    "",
    "## Bestehender Artikel",
    "",
    `**${kandidat.titel}**`,
    "",
    abschnitte,
    "",
    "## Neuer Artikel, auf den verwiesen werden soll",
    "",
    `**${neu.titel}**`,
    "",
    neu.teaser,
    "",
    "Er beantwortet vor allem: " + neu.kernaussagen.join(" "),
  ].join("\n");
}

/**
 * Hängt den neuen Artikel in den Bestand ein.
 *
 * Ändert bis zu drei bestehende Artikel und schreibt sie zurück. Gibt zurück,
 * was tatsächlich geändert wurde — für das Protokoll und damit der Aufrufer
 * weiß, welche Adressen bei einem späteren Auslieferungslauf neu gemeldet
 * werden müssen.
 */
export async function haengeEin(
  neuerArtikel: Artikel,
  bestand: Artikel[]
): Promise<VerlinkungsAenderung[]> {
  const ziel = `/gratis-wissen/${neuerArtikel.slug}`;
  const bild = verlinkungsBild(bestand);
  const aenderungen: VerlinkungsAenderung[] = [];

  const bereitsGenutzteAnker = new Set(bild.get(ziel)?.anker ?? []);
  const kandidaten = findeKandidaten(neuerArtikel, bestand);

  if (kandidaten.length === 0) {
    melde("Kein passender Bestandsartikel gefunden — der neue Artikel hängt vorerst nur am Thema.");
    return aenderungen;
  }

  for (const kandidat of kandidaten) {
    if (aenderungen.length >= MAX_GEAENDERTE_ARTIKEL) break;

    if (kandidat.interneLinks.length >= MAX_LINKS_JE_ARTIKEL) {
      continue;
    }

    if (kandidat.interneLinks.some((link) => link.ziel === ziel)) {
      continue;
    }

    const eingehend = bild.get(ziel)?.anzahl ?? 0;
    if (eingehend >= DECKEL_JE_ZIEL) {
      warne(
        `${ziel} hat bereits ${eingehend} eingehende interne Links. Ab etwa 45 bis 50 ` +
          `kehrt sich der gemessene Zusammenhang um — hier wird nicht weiter verlinkt.`
      );
      break;
    }

    let vorschlag: Verweisvorschlag;
    try {
      vorschlag = await frage<Verweisvorschlag>({
        modell: MODELL_STRUKTUR,
        maxTokens: 1024,
        system:
          "Du suchst in einem bestehenden deutschen Fachartikel die eine Stelle, an der ein " +
          "Verweis auf einen neuen Artikel natürlich wirkt. Du gibst ausschließlich wörtliche " +
          "Zitate aus dem vorgelegten Text zurück und erfindest nichts. Im Zweifel lehnst du ab.",
        nachricht: baueAuftrag(kandidat, neuerArtikel),
        schema: VORSCHLAG_SCHEMA as unknown as Record<string, unknown>,
      });
    } catch (ausnahme) {
      warne(
        `Verweisvorschlag für ${kandidat.slug} fehlgeschlagen: ` +
          (ausnahme instanceof Error ? ausnahme.message : String(ausnahme))
      );
      continue;
    }

    if (!vorschlag.passt) {
      continue;
    }

    const ankertext = vorschlag.zitat.trim();

    /* Die harte Prüfung. Ein Ankertext, der nicht wörtlich im Absatz steht,
       wird beim Rendern nicht gefunden — der Link existiert dann nur in der
       Statistik. Genau dieser Fehler ist beim Umstellen der Bestandsartikel
       aufgetreten: fünfzehn eingetragene Links, null gerenderte. */
    const text = abschnittstext(kandidat, vorschlag.abschnitt);
    if (!text.includes(ankertext)) {
      warne(
        `${kandidat.slug}: vorgeschlagener Ankertext steht nicht wörtlich in Abschnitt ` +
          `${vorschlag.abschnitt} — verworfen. Vorschlag war: "${ankertext}"`
      );
      continue;
    }

    /* Vielfalt der Ankertexte ist der stärkste gemessene Zusammenhang der
       Zyppy-Auswertung. Derselbe Anker ein zweites Mal bringt nach diesen Daten
       nichts — er zählt wie ein einziger redaktioneller Link. */
    if (bereitsGenutzteAnker.has(ankertext.toLowerCase())) {
      warne(
        `${kandidat.slug}: Ankertext "${ankertext}" zeigt schon von anderer Stelle auf ${ziel}. ` +
          `Wiederholung bringt nichts — verworfen.`
      );
      continue;
    }

    /* Innerhalb eines Artikels darf ein Ankertext nur einmal vorkommen: Das
       Rendering verlinkt die erste Fundstelle, jede weitere fiele still aus. */
    if (
      kandidat.interneLinks.some(
        (link) => link.ankertext.trim().toLowerCase() === ankertext.toLowerCase()
      )
    ) {
      continue;
    }

    const geaendert: Artikel = {
      ...kandidat,
      interneLinks: [
        ...(kandidat.interneLinks ?? []),
        { ziel, ankertext, abschnitt: vorschlag.abschnitt },
      ],
      /* Der Artikel hat sich inhaltlich geändert — ein Link ist laut Googles
         eigener Sitemap-Dokumentation ausdrücklich eine wesentliche Änderung
         („an update to the main content, the structured data, or links on the
         page is generally considered significant"). */
      aktualisiert: heute(),
    };

    try {
      schreibeArtikel(geaendert);
    } catch (ausnahme) {
      warne(
        `${kandidat.slug} konnte nicht zurückgeschrieben werden: ` +
          (ausnahme instanceof Error ? ausnahme.message : String(ausnahme))
      );
      continue;
    }

    /* Den Bestand im Speicher mitziehen, damit der nächste Artikel desselben
       Laufs den neuen Stand sieht. */
    const index = bestand.findIndex((artikel) => artikel.slug === kandidat.slug);
    if (index >= 0) bestand[index] = geaendert;

    bereitsGenutzteAnker.add(ankertext.toLowerCase());
    const eintrag = bild.get(ziel) ?? { anzahl: 0, anker: new Set<string>() };
    eintrag.anzahl += 1;
    eintrag.anker.add(ankertext.toLowerCase());
    bild.set(ziel, eintrag);

    aenderungen.push({ slug: kandidat.slug, ziel, ankertext, abschnitt: vorschlag.abschnitt });
    melde(`${kandidat.slug} verweist jetzt auf ${ziel}`, { ankertext });
  }

  if (aenderungen.length === 0) {
    melde(
      "Kein Bestandsartikel hatte eine passende Stelle. Der neue Artikel hängt am Thema — " +
        "das ist kein Fehler, sondern der Normalfall bei einem Thema ohne nahe Nachbarn."
    );
  }

  return aenderungen;
}

/** Heutiges Datum als ISO-Tag. */
function heute(): string {
  const jetzt = new Date();
  const monat = String(jetzt.getMonth() + 1).padStart(2, "0");
  const tag = String(jetzt.getDate()).padStart(2, "0");
  return `${jetzt.getFullYear()}-${monat}-${tag}`;
}
