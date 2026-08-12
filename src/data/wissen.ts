/**
 * Inhalte für `/gratis-wissen` — Artikel, Tipps, Ratgeber.
 *
 * Auf Ansage angelegt (12.08.2026): "Ich möchte irgendwie einen Ort erstellen,
 * wo ich ganz viel Content raushaue: Blogartikel, Tipps, Ratgeber und so ein
 * Kram." Der Bereich ist als Ablage gedacht, die wächst — neue Artikel kommen
 * hier oben dazu, sonst ist nichts anzupassen: Übersicht, Detailseiten und
 * Sitemap ziehen aus dieser Datei.
 *
 * ZUM STAND DER TEXTE: Die drei Startartikel sind von mir geschrieben, nicht
 * von Ayham. Sie sind fachlich richtig und kommen ohne erfundene Zahlen aus —
 * es steht keine Statistik darin, die sich nicht belegen ließe, und keine
 * Kundenaussage, die nicht in `client-results.ts` steht. Wo Ayhams Wortlaut
 * kommt, wird hier ersetzt; die Komponenten bleiben unberührt.
 *
 * WORAUF ZU ACHTEN IST, wenn hier etwas dazukommt:
 *   - Keine Zahl ohne Beleg. Der Bereich soll ranken, und eine erfundene
 *     Marktzahl ist genau die Sorte Aussage, die abgemahnt wird.
 *   - Kein Artikel, der nur ein verkleideter Werbetext ist. Wer über die Suche
 *     kommt, sucht eine Antwort — der CTA steht am Ende, nicht im ersten Absatz.
 *   - `datum` im ISO-Format (JJJJ-MM-TT), die Übersicht sortiert danach.
 */

export interface WissenAbschnitt {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface WissenArtikel {
  slug: string;
  /** Überschrift der Seite und Kartentitel. */
  titel: string;
  /** Ein Satz für die Übersicht und die Meta-Beschreibung. */
  teaser: string;
  /** Schlagwort für die Karte, z. B. "Fehler", "Grundlagen", "Enterprise". */
  kategorie: string;
  /** Veröffentlichung, ISO. Bestimmt die Reihenfolge in der Übersicht. */
  datum: string;
  /** Geschätzte Lesezeit in Minuten. */
  lesezeit: number;
  /** Aufmacher, zwei bis drei Sätze. */
  intro: string;
  abschnitte: WissenAbschnitt[];
  /** Der eine Satz, der hängen bleiben soll. Steht am Ende, vor dem CTA. */
  fazit: string;
}

export const wissenArtikel: WissenArtikel[] = [
  {
    slug: "fehler-die-fast-jedes-unternehmen-mit-ki-macht",
    titel: "Die fünf Fehler, die fast jedes Unternehmen mit KI macht",
    teaser:
      "Nicht die Technik scheitert, sondern die Stelle, an der sie sitzt. Fünf Muster, die in Betrieben immer wieder auftauchen — und woran man sie früh erkennt.",
    kategorie: "Fehler",
    datum: "2026-08-12",
    lesezeit: 6,
    intro:
      "Wenn ein KI-Projekt nicht liefert, liegt es selten am Modell. Es liegt fast immer daran, an welcher Stelle im Betrieb es eingesetzt wurde und wer danach dafür zuständig ist. Diese fünf Muster tauchen so regelmäßig auf, dass man sie im ersten Gespräch schon hört.",
    abschnitte: [
      {
        heading: "1. KI sitzt dort, wo kein Geld entsteht",
        paragraphs: [
          "Der häufigste Fall: Ein Werkzeug schreibt Texte, fasst Protokolle zusammen, formuliert Angebote vor. Das funktioniert sofort und fühlt sich nach Fortschritt an — nur ist Schreiben in den seltensten Fällen der Engpass eines Betriebs.",
          "Geld geht dort verloren, wo etwas liegen bleibt: die Anfrage, die zwei Tage unbeantwortet steht. Das Angebot, das nie rausging. Die Übergabe zwischen zwei Abteilungen, die jedes Mal jemand von Hand macht. Wer dort ansetzt, sieht den Unterschied in der Auswertung, nicht nur im Kalender.",
          "Die Gegenprobe ist einfach: Nenne den Vorgang, an dem gerade Umsatz hängt. Sitzt die Automatisierung nicht an diesem Vorgang, spart sie Zeit — aber sie verdient kein Geld.",
        ],
      },
      {
        heading: "2. Der Pilot hat keinen Besitzer",
        paragraphs: [
          "Ein Bereich probiert etwas aus, es läuft, alle sind zufrieden. Dann soll es in den Betrieb, und dort stellt sich heraus: Niemand ist dafür zuständig, wenn es morgens nicht läuft. Niemand pflegt die Regeln nach, wenn sich ein Ablauf ändert. Niemand entscheidet, was passiert, wenn das Ergebnis einmal falsch ist.",
          "Ein Pilot ohne benannte verantwortliche Person ist kein Projekt, sondern ein Experiment. Das ist in Ordnung, solange man es so nennt — problematisch wird es, wenn ein Experiment als Einführung verkauft wird.",
        ],
      },
      {
        heading: "3. Das Modell bekommt die eigenen Daten nicht zu sehen",
        paragraphs: [
          "Ein Sprachmodell ohne Zugriff auf die Daten des Betriebs kann nur allgemein antworten. Es kennt die Preisliste nicht, nicht die Historie eines Kunden, nicht die interne Regel, warum dieser eine Fall anders behandelt wird.",
          "Genau diese Anbindung ist die Arbeit, die niemand gern übernimmt: Schnittstellen zu Systemen, die seit Jahren laufen, Rechte und Rollen, Datenqualität. Sie entscheidet aber darüber, ob am Ende ein Werkzeug steht oder ein besserer Chat.",
        ],
      },
      {
        heading: "4. Es gibt keine Zahl, an der man ablesen kann, ob es sich lohnt",
        paragraphs: [
          "Ohne Ausgangsmessung ist jede spätere Diskussion Geschmackssache. Bevor irgendetwas gebaut wird, sollte klar sein: Wie lange dauert dieser Vorgang heute, wie oft kommt er vor, wer macht ihn.",
          "Das ist keine Bürokratie, sondern Selbstschutz. Es ist die einzige Grundlage, auf der man ein Projekt später fortsetzen — oder eben ehrlich beenden — kann.",
        ],
        bullets: [
          "Wie viele Vorgänge pro Woche?",
          "Wie viele Minuten je Vorgang, von Anfang bis Ende?",
          "Wie viele davon sind Nacharbeit, weil vorher etwas fehlte?",
        ],
      },
      {
        heading: "5. Alles auf einmal statt einer Sache richtig",
        paragraphs: [
          "Der Reflex nach dem ersten Erfolg ist die Landkarte: zwanzig Anwendungsfälle, priorisiert, mit Roadmap über drei Jahre. In der Zeit, in der so ein Programm aufgesetzt wird, ändert sich die Lage — und mit ihr die Begründung des Programms.",
          "Ein Vorgang, sauber automatisiert, im Betrieb, mit einer Zahl dahinter, ist mehr wert als eine Landkarte. Er beweist im eigenen Haus, dass es geht, und er finanziert das nächste Stück.",
        ],
      },
    ],
    fazit:
      "Falsche KI kostet mehr als keine KI: Sie bindet Budget, bindet die besten Leute und hinterlässt im Betrieb die Überzeugung, dass das Thema nichts bringt.",
  },
  {
    slug: "ki-im-unternehmen-aws-azure-oder-eigener-server",
    titel: "KI im Unternehmen: AWS, Azure oder eigener Server?",
    teaser:
      "Für Betriebe mit echten Compliance-Anforderungen ist die Frage nicht, welches Modell das beste ist, sondern wo es läuft. Ein Vergleich der drei Wege — mit den Kriterien, die tatsächlich entscheiden.",
    kategorie: "Enterprise",
    datum: "2026-08-12",
    lesezeit: 7,
    intro:
      "Sobald personenbezogene Daten, Betriebsgeheimnisse oder regulierte Prozesse im Spiel sind, verschiebt sich die Frage. Nicht „welches Modell ist das beste“, sondern: Wo läuft es, wer kommt an die Daten, und was steht im Vertrag. Drei Wege stehen zur Wahl, und keiner ist grundsätzlich richtig.",
    abschnitte: [
      {
        heading: "Die Hyperscaler: AWS Bedrock und Azure OpenAI",
        paragraphs: [
          "Beide großen Anbieter stellen Sprachmodelle als verwalteten Dienst bereit — AWS über Bedrock, Microsoft über Azure OpenAI Service. Der entscheidende Unterschied zur direkten Nutzung eines Anbieter-Zugangs: Man kann die Region festlegen, in der die Verarbeitung stattfindet, und bekommt einen Auftragsverarbeitungsvertrag, der zu einem europäischen Betrieb passt.",
          "Was dafür spricht: Die Anbindung an bestehende Systeme ist meist schon da. Wer ohnehin Microsoft 365 oder eine AWS-Landschaft betreibt, hat Identitäten, Rechte und Netzwerkgrenzen bereits geregelt — und genau daran scheitern Projekte sonst.",
          "Was dagegen spricht: Die Abhängigkeit ist real. Preise, Modellauswahl und Bedingungen legt der Anbieter fest, und ein Wechsel ist Arbeit. Wer das vermeiden will, sollte die Anwendung von Anfang an so bauen, dass das Modell austauschbar bleibt.",
        ],
      },
      {
        heading: "Der eigene Server: offene Modelle im Haus",
        paragraphs: [
          "Offene Modelle lassen sich auf eigener Hardware betreiben. Damit verlassen die Daten das Haus nicht — das stärkste Argument in Bereichen, in denen das schlicht Voraussetzung ist: Gesundheitswesen, Verteidigung, Teile der öffentlichen Verwaltung.",
          "Der Preis dafür ist Betrieb. Grafikkarten, Überwachung, Aktualisierungen, jemand, der nachts erreichbar ist. Diese Kosten fallen an, ob das System genutzt wird oder nicht, während man beim Hyperscaler nach Verbrauch zahlt.",
          "Die ehrliche Faustregel: Eigener Betrieb lohnt sich, wenn die Nutzung hoch und gleichmäßig ist — oder wenn eine Vorschrift keine Wahl lässt. Für den ersten Anwendungsfall ist er fast immer der teurere Weg.",
        ],
      },
      {
        heading: "Was tatsächlich entscheidet",
        paragraphs: [
          "Die Wahl fällt selten am Modell, sondern an vier nüchternen Fragen:",
        ],
        bullets: [
          "Welche Daten gehen hinein — und dürfen die das überhaupt verlassen?",
          "Gibt es einen Auftragsverarbeitungsvertrag, der zum eigenen Datenschutzkonzept passt?",
          "Wie ist die Last verteilt: Dauerbetrieb oder ein paar Anfragen am Tag?",
          "Wer betreibt das in zwei Jahren — und mit welchem Wissen im Haus?",
        ],
      },
      {
        heading: "Der pragmatische Weg",
        paragraphs: [
          "In den meisten Betrieben führt der Weg über einen verwalteten Dienst in europäischer Region, mit sauber gezogenen Grenzen: welche Daten hineindürfen, welche nicht, und einer Anwendungsschicht dazwischen, die den Anbieter austauschbar hält.",
          "Der eigene Server kommt dann später, wenn die Nutzung es rechtfertigt oder eine Vorschrift es verlangt. Diese Reihenfolge kostet weniger und macht früher etwas nutzbar — und sie verbaut nichts.",
        ],
      },
    ],
    fazit:
      "Die Infrastrukturfrage ist keine Geschmacksfrage, sondern eine Rechenaufgabe mit vier Größen: Daten, Vertrag, Last und wer es später betreibt.",
  },
  {
    slug: "was-ein-ki-setup-im-betrieb-wirklich-ausmacht",
    titel: "Was ein KI-Setup im Betrieb wirklich ausmacht",
    teaser:
      "Der Zugang ist an einem Nachmittag eingerichtet. Warum es trotzdem Wochen dauert, bis KI im Tagesgeschäft etwas verändert — und woraus die Zeit tatsächlich besteht.",
    kategorie: "Grundlagen",
    datum: "2026-08-12",
    lesezeit: 5,
    intro:
      "„Wir haben die Lizenzen, es benutzt nur keiner.“ Dieser Satz fällt oft, und er beschreibt kein Motivationsproblem. Er beschreibt ein fehlendes Setup — und das ist etwas anderes als ein Zugang.",
    abschnitte: [
      {
        heading: "Ein Zugang ist keine Einführung",
        paragraphs: [
          "Ein Konto ist in fünf Minuten angelegt. Danach steht jede Person vor demselben leeren Eingabefeld und muss selbst herausfinden, wofür sich das lohnt. Ein Teil probiert etwas, die meisten kehren nach zwei Wochen zu ihrem alten Weg zurück — weil der alte Weg verlässlich ist und der neue jedes Mal neu erfunden werden muss.",
        ],
      },
      {
        heading: "Woraus ein Setup besteht",
        paragraphs: [
          "Ein tragfähiges Setup hat drei Teile, und keiner davon ist die Lizenz.",
        ],
        bullets: [
          "Die Arbeitsumgebung: womit gearbeitet wird, worauf zugegriffen werden darf, wo Ergebnisse landen.",
          "Die Regeln: schriftlich hinterlegte Vorgaben, wie hier gearbeitet wird, was ohne Rückfrage passieren darf und was ausdrücklich nicht.",
          "Die Automatisierungen: die wiederkehrenden Handgriffe, die vorher jedes Mal jemand selbst gemacht hat.",
        ],
      },
      {
        heading: "Warum die Regeln der wichtigste Teil sind",
        paragraphs: [
          "Ohne hinterlegte Regeln beantwortet ein Sprachmodell jede Aufgabe nach eigenem Ermessen. Es kennt die Tonalität des Hauses nicht, nicht die Reihenfolge, in der Dinge geprüft werden, nicht die Fälle, in denen jemand gefragt werden muss.",
          "Mit Regeln wird aus einem allgemeinen Werkzeug ein Bestandteil der Arbeit. Sie sind auch der Grund, warum sich ein Setup nicht kopieren lässt: Sie beschreiben genau das, was diesen Betrieb von anderen unterscheidet.",
        ],
      },
      {
        heading: "Woran man merkt, dass es sitzt",
        paragraphs: [
          "Nicht daran, dass alle begeistert sind. Sondern daran, dass jemand sich beschwert, wenn es einmal nicht läuft. Ab dem Moment ist es Teil des Arbeitswegs — und nicht mehr ein Zusatzangebot, das man auch ignorieren kann.",
        ],
      },
    ],
    fazit:
      "Die Lizenz ist der günstigste Teil. Bezahlt wird für den Aufbau darum herum — und genau der entscheidet, ob nach drei Monaten noch jemand damit arbeitet.",
  },
];

export function getArtikelBySlug(slug: string): WissenArtikel | undefined {
  return wissenArtikel.find((artikel) => artikel.slug === slug);
}

/** Neueste zuerst — die Reihenfolge der Übersicht. */
export const wissenArtikelSortiert: WissenArtikel[] = [...wissenArtikel].sort((a, b) =>
  b.datum.localeCompare(a.datum)
);
