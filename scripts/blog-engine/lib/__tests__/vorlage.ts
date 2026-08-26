/**
 * Ein vollstaendiger, schemagueltiger Artikel im Hausstil — die gemeinsame
 * Vorlage der Tests rund um die Blog-Automatik.
 *
 * Bewusst kein Textfetzen: Ein Pruefer, der nur an konstruierten Schnipseln
 * getestet wird, besteht sich selbst und faellt am ersten echten Artikel um.
 *
 * ⚠️ Liegt hier und nicht in einer `*.test.ts`, weil Vitest solche Dateien
 * einsammelt: Wer eine Vorlage aus einer Testdatei importiert, laesst deren
 * Tests ein zweites Mal laufen. Gleiche Bauart wie
 * `src/lib/__tests__/quelltext.ts`.
 */

import type { Artikel } from "@/lib/wissen/schema";

export const SAUBER: Artikel = {
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
