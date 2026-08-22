/**
 * Selbstprüfung des Qualitätstors.
 *
 * Läuft mit `npm test` (Vitest) mit. Die Vorlage `SAUBER` ist bewusst ein
 * vollständiger, schemagültiger Artikel im Hausstil — nicht ein Textfetzen:
 * Ein Prüfer, der nur an konstruierten Schnipseln getestet wird, besteht sich
 * selbst und fällt am ersten echten Artikel um.
 *
 * Der wichtigste Test steht unten: **Em-Dash löst keinen Fehler aus.** Er ist
 * Hausstandard, und ein Prüfer, der ihn meldet, läuft gegen den eigenen Stil.
 */

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { artikelSchemaMitFreigabe, type Artikel } from "@/lib/wissen/schema";
import { pruefeArtikel, regelUebersicht } from "./qualitaet";

/* -------------------------------------------------------------------------- */
/* Vorlage                                                                    */
/* -------------------------------------------------------------------------- */

const SAUBER: Artikel = {
  slug: "zugang-ist-keine-einfuehrung",
  titel: "Warum ein Zugang zum Sprachmodell noch keine Einführung ist",
  teaser:
    "Ein Zugang ist schnell verteilt. Ob danach jemand damit arbeitet, entscheidet sich an drei Dingen, die mit dem Modell nichts zu tun haben.",
  kategorie: "Einführung",
  cluster: "ki-im-betrieb",
  zielKeyword: "ki einführung betrieb",
  sekundaerKeywords: ["sprachmodell einführen", "ki lizenz betrieb"],
  datum: "2026-08-19",
  aktualisiert: "2026-08-19",
  lesezeit: 6,
  autor: "ayham-alkhalil",
  intro:
    "„Wir haben die Lizenzen, es benutzt nur keiner.“ Dieser Satz fällt oft, und er beschreibt kein Motivationsproblem. Er beschreibt ein fehlendes Setup — und das ist etwas anderes als ein Zugang.",
  kernaussagen: [
    "Ein Zugang zum Sprachmodell ist eine Lizenz, keine Einführung: Erst Regeln, Beispiele und eine benannte Person machen daraus einen Arbeitsweg.",
    "Die Einführung sitzt an dem Tag, an dem sich jemand beschwert, weil das Werkzeug einmal nicht läuft.",
  ],
  abschnitte: [
    {
      heading: "Ein Zugang ist keine Einführung",
      paragraphs: [
        "Die Lizenz ist am ersten Tag verteilt. Danach beginnt die Arbeit, die niemand eingeplant hat: Regeln, Beispiele, eine benannte Person.",
        "Ein Teil der Belegschaft probiert etwas aus. Die meisten kehren nach zwei Wochen zum alten Weg zurück, weil der alte Weg verlässlich ist.",
      ],
    },
    {
      heading: "Woran merkt man, dass es sitzt?",
      paragraphs: [
        "Nicht daran, dass alle begeistert sind. Sondern daran, dass jemand sich beschwert, wenn es einmal nicht läuft.",
        "Das Portal von NiImmo ging nach 40 Tagen in Betrieb. Ab diesem Tag hing der Vertrieb daran, und der Rückweg zur Tabelle war keiner mehr.",
      ],
      bullets: [
        "Die Regeln: schriftlich hinterlegte Vorgaben, was ohne Rückfrage passieren darf.",
        "Die Beispiele: fertige Vorlagen für die Vorgänge, an denen Umsatz hängt.",
        "Die Person: jemand, der den Vorgang besitzt und ihn nach der Einführung pflegt.",
      ],
    },
    {
      heading: "Was kostet ein Zugang ohne Aufbau?",
      paragraphs: [
        "Bezahlt wird nicht die Lizenz, sondern der Aufbau darum herum. Die Rechnung ist nüchtern und steht in keinem Angebot.",
        "Grafikkarten, Aktualisierungen, jemand mit Bereitschaft in der Nacht. Diese Posten fallen an, sobald der Betrieb ernst wird.",
      ],
      tabelle: {
        kopf: ["Weg", "Was dafür spricht", "Was dagegen spricht"],
        zeilen: [
          ["Verwalteter Dienst", "Anbindung meist schon da", "Abhängigkeit vom Anbieter"],
          ["Eigener Betrieb", "Daten bleiben im Haus", "Betrieb kostet Personal"],
        ],
      },
    },
    {
      heading: "Wer den Vorgang besitzt, entscheidet über das Ergebnis",
      paragraphs: [
        "Ein Pilot ohne benannte Person ist kein Projekt, sondern ein Experiment. Das ist in Ordnung, solange es so heißt.",
        "Ab dem Moment, in dem jemand den Vorgang besitzt, ist das Werkzeug Teil des Arbeitswegs. Vorher bleibt es ein Zusatzangebot, das man ignorieren kann.",
      ],
    },
  ],
  fazit:
    "Die Lizenz ist der günstigste Teil. Bezahlt wird für den Aufbau darum herum — und genau der entscheidet, ob nach drei Monaten noch jemand damit arbeitet.",
  faq: [
    {
      frage: "Reicht eine Schulung für die Einführung?",
      antwort:
        "Eine Schulung erklärt die Bedienung. Sie ersetzt keine Regel und keine Vorlage, und ohne beides fällt der alte Weg nach zwei Wochen zurück.",
    },
    {
      frage: "Woran erkennt man ein Experiment?",
      antwort:
        "An der fehlenden Zuständigkeit. Solange niemand benannt ist, gibt es auch niemanden, der den Vorgang nach der Einführung weiter pflegt.",
    },
  ],
  quellen: [
    {
      bezeichnung: "Projektdaten NiImmo, interne Referenzliste",
      url: "https://kitech-software.de/referenzen/niimmo",
      abgerufen: "2026-08-19",
      belegt: "Das Portal von NiImmo ging nach 40 Tagen in Betrieb.",
    },
  ],
  interneLinks: [
    { ziel: "/glossar/rag", ankertext: "Abruf aus eigenen Dokumenten", abschnitt: 0 },
    { ziel: "/leistungen", ankertext: "vier Schritte bis zum Betrieb", abschnitt: 1 },
    { ziel: "/referenzen", ankertext: "Portal für einen Immobilienbetrieb", abschnitt: 2 },
  ],
  substanz: {
    art: "prozesszerlegung",
    beschreibung:
      "Zerlegung einer echten Einführung in drei Bestandteile, gemessen an den Tagen bis zur ersten produktiven Nutzung und an der Zahl der Rückfragen danach.",
    herkunft: "Übergabeprotokoll NiImmo, src/data/client-results.ts",
  },
  cta: {
    heading: "Das war die Theorie.",
    text: "Im 1:1-KI-Check gehen wir deinen konkreten Ablauf durch und sagen dir, was sich zuerst lohnt.",
  },
  status: "veroeffentlicht",
  freigabe: { von: "Ayham Alkhalil", am: "2026-08-19" },
};

/** Kopie der Vorlage mit einem zusätzlichen Absatz im ersten Abschnitt. */
function mitAbsatz(text: string): Artikel {
  const kopie: Artikel = structuredClone(SAUBER);
  kopie.abschnitte[0].paragraphs.push(text);
  return kopie;
}

const regeln = (ergebnis: ReturnType<typeof pruefeArtikel>) =>
  ergebnis.harteFehler.map((b) => b.regel);

/* -------------------------------------------------------------------------- */

describe("Vorlage", () => {
  it("entspricht dem Artikelschema", () => {
    expect(() => artikelSchemaMitFreigabe.parse(SAUBER)).not.toThrow();
  });

  it("besteht die Prüfung ohne harten Fehler", () => {
    const ergebnis = pruefeArtikel(SAUBER);
    expect(ergebnis.harteFehler).toEqual([]);
    expect(ergebnis.bestanden).toBe(true);
  });

  it("liefert alle geforderten Kennzahlen als Zahl", () => {
    const { kennzahlen } = pruefeArtikel(SAUBER);
    for (const schluessel of [
      "woerter",
      "saetze",
      "absaetze",
      "woerterProSatz",
      "medianSatzlaenge",
      "absatzlaenge",
      "satzlaengenStreuung",
      "emDashDichte",
      "frageUeberschriftenAnteil",
      "entityDichte",
      "strukturAnteil",
      "interneLinks",
      "quellen",
      "faqAnzahl",
    ]) {
      expect(typeof kennzahlen[schluessel], schluessel).toBe("number");
    }
    expect(kennzahlen.saetze).toBeGreaterThan(10);
    expect(kennzahlen.quellen).toBe(1);
    expect(kennzahlen.faqAnzahl).toBe(2);
  });
});

describe("Em-Dash ist Hausstandard", () => {
  it("löst keinen Fehler und keine Warnung über sein Vorkommen aus", () => {
    const ergebnis = pruefeArtikel(
      mitAbsatz("Der Aufbau kostet Zeit — und genau daran scheitern die meisten Einführungen.")
    );
    expect(ergebnis.bestanden).toBe(true);
    expect(ergebnis.harteFehler).toEqual([]);
    expect(ergebnis.kennzahlen.emDashDichte).toBeGreaterThan(0);
  });

  it("meldet aber die Schreibweise ohne Leerzeichen", () => {
    const ergebnis = pruefeArtikel(mitAbsatz("Der Aufbau—nicht die Lizenz—kostet das Geld."));
    expect(regeln(ergebnis)).toContain("hausstil-em-dash-ohne-leerzeichen");
  });

  it("warnt bei zwei Gedankenstrichen im selben Satz", () => {
    const ergebnis = pruefeArtikel(
      mitAbsatz("Der Aufbau kostet Zeit — und Geld — und am Ende auch Nerven.")
    );
    expect(ergebnis.warnungen.map((b) => b.regel)).toContain("em-dash-mehrfach");
  });
});

describe("harte Hausstil-Regeln", () => {
  it("lehnt die Anrede mit du ab", () => {
    const ergebnis = pruefeArtikel(
      mitAbsatz("Wenn du das Werkzeug einführst, brauchst du zuerst eine Regel.")
    );
    expect(ergebnis.bestanden).toBe(false);
    expect(regeln(ergebnis)).toContain("anrede-du");
  });

  it("lehnt wir im Artikelkörper ab, erlaubt es aber im Zitat", () => {
    const mitWir = pruefeArtikel(mitAbsatz("Wir haben die Regeln danach schriftlich hinterlegt."));
    expect(regeln(mitWir)).toContain("anrede-wir");

    const imZitat = pruefeArtikel(
      mitAbsatz("Der Satz fällt fast wörtlich: „Wir haben die Lizenzen, es benutzt nur keiner.“")
    );
    expect(imZitat.harteFehler).toEqual([]);
  });

  it("erlaubt die Anrede im CTA", () => {
    // Die Vorlage duzt im CTA („gehen wir deinen konkreten Ablauf durch") und
    // besteht trotzdem — genau diese Trennung schreibt der Standard vor.
    expect(pruefeArtikel(SAUBER).bestanden).toBe(true);
  });

  it("lehnt die Höflichkeitsform mitten im Satz ab, nicht das anaphorische Sie", () => {
    const hoeflich = pruefeArtikel(
      mitAbsatz("Damit haben Sie den Vorgang im Griff und sparen Rückfragen.")
    );
    expect(regeln(hoeflich)).toContain("anrede-sie");

    const anaphorisch = pruefeArtikel(
      mitAbsatz("Die falsche Einführung kostet doppelt. Sie bindet Budget und bindet die besten Leute.")
    );
    expect(anaphorisch.harteFehler).toEqual([]);
  });

  it("lehnt den Firmennamen im Artikelkörper ab", () => {
    const ergebnis = pruefeArtikel(mitAbsatz("KITech hat diesen Ablauf mehrfach gebaut."));
    expect(regeln(ergebnis)).toContain("firmenname-im-koerper");
  });

  it("lehnt den En-Dash im Fließtext ab", () => {
    const ergebnis = pruefeArtikel(mitAbsatz("Der Aufbau kostet Zeit – und Geld."));
    expect(ergebnis.bestanden).toBe(false);
    expect(regeln(ergebnis)).toContain("hausstil-en-dash");
  });

  it("lehnt gerade Anführungszeichen ab", () => {
    const ergebnis = pruefeArtikel(mitAbsatz('Der Satz lautete: "Es benutzt nur keiner."'));
    expect(regeln(ergebnis)).toContain("hausstil-anfuehrungszeichen");
  });

  it("lehnt Semikolon, Ausrufezeichen und Prozentzeichen ab", () => {
    expect(regeln(pruefeArtikel(mitAbsatz("Die Regel steht; die Vorlage fehlt.")))).toContain(
      "hausstil-satzzeichen"
    );
    expect(regeln(pruefeArtikel(mitAbsatz("Der Anteil lag bei 62 % der Vorgänge.")))).toContain(
      "hausstil-satzzeichen"
    );
  });

  it("lehnt Abkürzungen und Anglizismen ab", () => {
    expect(regeln(pruefeArtikel(mitAbsatz("Das gilt z. B. für die Buchhaltung.")))).toContain(
      "hausstil-abkuerzung"
    );
    expect(
      regeln(pruefeArtikel(mitAbsatz("Das Tool übernimmt danach das Monitoring der Vorgänge.")))
    ).toContain("hausstil-anglizismus");
  });

  it("lehnt Konjunktiv-Weichspüler ab", () => {
    const ergebnis = pruefeArtikel(
      mitAbsatz("Der Aufbau könnte hier vielleicht die Rückfragen senken.")
    );
    expect(regeln(ergebnis)).toContain("hausstil-konjunktiv-weichspueler");
  });
});

describe("Belegpflicht für Zahlen", () => {
  it("lehnt eine unbelegte Prozentzahl ab und meldet sie einzeln", () => {
    const ergebnis = pruefeArtikel(
      mitAbsatz("Der Anteil der Betriebe lag bei 62 Prozent, im Vorjahr waren es 47 Prozent.")
    );
    expect(ergebnis.bestanden).toBe(false);
    const unbelegt = ergebnis.harteFehler.filter((b) => b.regel === "zahl-ohne-beleg");
    expect(unbelegt).toHaveLength(2);
    expect(ergebnis.kennzahlen.unbelegteZahlen).toBe(2);
  });

  it("lässt eine Zahl durch, die in quellen belegt ist", () => {
    // Die 40 aus der Vorlage steht wörtlich in `quellen[0].belegt`.
    const ergebnis = pruefeArtikel(SAUBER);
    expect(ergebnis.harteFehler.filter((b) => b.regel === "zahl-ohne-beleg")).toEqual([]);
  });

  it("lässt eine Zahl durch, die aus substanz stammt", () => {
    const kopie: Artikel = structuredClone(SAUBER);
    kopie.substanz.herkunft = "Messreihe über 12 Wochen, src/data/client-results.ts";
    kopie.abschnitte[0].paragraphs.push("Die Messung lief über 12 Wochen im laufenden Betrieb.");
    expect(pruefeArtikel(kopie).harteFehler).toEqual([]);
  });
});

describe("Slop-Muster und Substanz", () => {
  it("lehnt die häufigste generierte Einleitung ab", () => {
    const kopie: Artikel = structuredClone(SAUBER);
    kopie.intro =
      "In der heutigen schnelllebigen Geschäftswelt ist Automatisierung Pflicht. Der Satz stimmt trotzdem nicht. Er beschreibt ein fehlendes Setup.";
    expect(regeln(pruefeArtikel(kopie))).toContain("floskel-heutige-welt");
  });

  it("lehnt Consulting-Buzzwords ab", () => {
    const ergebnis = pruefeArtikel(
      mitAbsatz("Die Einführung verläuft nahtlos und macht den Betrieb zukunftssicher.")
    );
    expect(regeln(ergebnis)).toContain("consulting-buzzword");
  });

  it("lehnt eine generische Substanzbeschreibung ab", () => {
    const kopie: Artikel = structuredClone(SAUBER);
    kopie.substanz.beschreibung =
      "Der Artikel beruht auf umfassende Erfahrung aus vielen Projekten und einem tiefes Verständnis der Abläufe.";
    const ergebnis = pruefeArtikel(kopie);
    expect(ergebnis.bestanden).toBe(false);
    expect(regeln(ergebnis)).toContain("substanz-generisch");
  });
});

describe("Längen", () => {
  it("lehnt einen Satz über 32 Wörter ab", () => {
    const ergebnis = pruefeArtikel(
      mitAbsatz(
        "Die Einführung eines Sprachmodells in einem Betrieb ist dann erfolgreich, wenn die Regeln schriftlich vorliegen, die Beispiele fertig sind, eine Person den Vorgang besitzt und der alte Weg danach wirklich niemandem im Haus mehr fehlt."
      )
    );
    expect(regeln(ergebnis)).toContain("satz-zu-lang");
  });

  it("lehnt einen Absatz über 55 Wörter ab", () => {
    const satz = "Die Regel steht schriftlich und jeder im Betrieb kennt sie.";
    const ergebnis = pruefeArtikel(mitAbsatz([satz, satz, satz, satz, satz, satz].join(" ")));
    expect(regeln(ergebnis)).toContain("absatz-zu-lang");
  });
});

describe("keine Fehlalarme an echtem Hausstil", () => {
  // Die drei handgeschriebenen Startartikel liegen als JSON im Repo. Sie sind
  // der einzige Prüfstein, den es hier gibt: Wenn der Prüfer *sie* an Regeln
  // scheitern lässt, die aus ihnen gemessen wurden, ist die Regel falsch und
  // nicht der Artikel. Genau so sind drei Fehlalarme aufgefallen — die
  // Höflichkeitsform nach Doppelpunkt, die Ziffer in „Microsoft 365“ und der
  // harte Satzdeckel in FAQ-Antworten.
  const ordner = path.join(process.cwd(), "content", "wissen");
  const dateien = fs.existsSync(ordner)
    ? fs.readdirSync(ordner).filter((d) => d.endsWith(".json"))
    : [];

  it.each(dateien)("%s löst keinen Fehlalarm aus", (datei) => {
    const artikel = JSON.parse(fs.readFileSync(path.join(ordner, datei), "utf8")) as Artikel;
    const ergebnis = pruefeArtikel(artikel);
    const gefunden = new Set(ergebnis.harteFehler.map((b) => b.regel));
    for (const regel of ["anrede-sie", "anrede-wir", "anrede-du", "zahl-ohne-beleg", "firmenname-im-koerper"]) {
      expect([...gefunden], `${datei}: ${regel}`).not.toContain(regel);
    }
  });
});

describe("Zahlen mit und ohne Tatsachencharakter", () => {
  it("lässt Ziffern in Eigennamen durch", () => {
    const ergebnis = pruefeArtikel(
      mitAbsatz("Wer Microsoft 365 betreibt, hat die Anbindung an bestehende Systeme meist schon da.")
    );
    expect(ergebnis.harteFehler).toEqual([]);
  });

  it("meldet Mengen, Geldbeträge und Jahreszahlen", () => {
    for (const satz of [
      "Der Aufbau kostete 4800 Euro im ersten Jahr.",
      "Seit 2021 läuft der Abgleich nächtlich.",
      "Die Umstellung dauerte 17 Wochen.",
    ]) {
      expect(regeln(pruefeArtikel(mitAbsatz(satz))), satz).toContain("zahl-ohne-beleg");
    }
  });
});

describe("anaphorisches Sie", () => {
  it("ist nach Doppelpunkt und Gedankenstrich erlaubt", () => {
    const ergebnis = pruefeArtikel(
      mitAbsatz(
        "Falsche KI kostet mehr als keine KI: Sie bindet Budget und bindet die besten Leute im Haus."
      )
    );
    expect(ergebnis.harteFehler).toEqual([]);
  });
});

describe("Satzdeckel", () => {
  it("ist in einer FAQ-Antwort nur eine Warnung", () => {
    const kopie: Artikel = structuredClone(SAUBER);
    kopie.faq[0].antwort =
      "Aus drei Teilen, und keiner davon ist die Lizenz: der Arbeitsumgebung mit ihren Vorlagen, den schriftlich hinterlegten Regeln für den Umgang damit und einer benannten Person, die den Vorgang nach der Einführung weiter pflegt und Rückfragen beantwortet.";
    const ergebnis = pruefeArtikel(kopie);
    expect(ergebnis.harteFehler).toEqual([]);
    expect(ergebnis.warnungen.map((b) => b.regel)).toContain("satz-zu-lang");
  });
});

describe("Regelkatalog", () => {
  it("enthält harte und weiche Regeln", () => {
    const katalog = regelUebersicht();
    expect(katalog.filter((r) => r.schwere === "hart").length).toBeGreaterThan(20);
    expect(katalog.filter((r) => r.schwere === "weich").length).toBeGreaterThan(20);
    // Der Em-Dash selbst darf in keiner Regel als Verbot auftauchen.
    expect(katalog.map((r) => r.regel)).not.toContain("em-dash-verboten");
  });
});
