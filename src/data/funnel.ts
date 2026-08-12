/**
 * Inhalt der LinkedIn-Landingpage `/funnel` (Domain `funnel.kitech-software.de`,
 * Host-Rewrite in `src/proxy.ts`).
 *
 * Zielgruppe: kalter Traffic über den LinkedIn-"Featured"-Bereich, kennt die
 * Marke noch nicht. Beat-Reihenfolge folgt Schema A ("Verbrannt-Funnel") aus
 * dem `funnel-narrativ`-Skill (`.claude/skills/funnel-narrativ/`) — Hero,
 * Pattern-Interrupt, Problem, Kundenstimmen, Lösung, CTA — umgesetzt mit den
 * bestehenden Bausteinen dieser Seite (PageHeading, ClientResults, CtaBanner),
 * nicht mit eigenen.
 *
 * OFFEN: `patternInterrupt.body` ist Platzhalter-Struktur, keine erfundene
 * Biografie — Ayhams echter Wortlaut ersetzt den Text, bevor die Seite indexiert
 * wird (siehe `indexable: false` in `src/config/navigation.ts`).
 */

export const funnelContent = {
  headline: "KI ohne Zugriff ist nur",
  headlineHighlight: "Zeitverschwendung.",
  lead: "KI wird erst produktiv, wenn sie auf relevante Unternehmensdaten, Systeme und Prozesse zugreifen kann.",

  patternInterrupt: {
    heading: "Ich habe selbst gesehen, wie das schiefläuft.",
    body: "Platzhalter: eine kurze, persönliche Geschichte — ein konkretes KI-/Automatisierungsprojekt, das ohne echten Datenzugriff gescheitert oder ins Leere gelaufen ist, bevor der eigentliche Ansatz klar wurde. 2-4 kurze Sätze, keine Fachbegriffe.",
  },

  painHeading: "Das Problem.",
  painPoints: [
    "Kein Zugriff auf E-Mails und Dokumente.",
    "Keine Verbindung zu CRM-, ERP- oder internen Systemen.",
    "Mitarbeiter müssen Informationen manuell kopieren.",
    "Die KI kennt den Unternehmenskontext nicht.",
    "Es entstehen isolierte Tools, die niemand dauerhaft nutzt.",
  ],

  solutionHeading: "Was am Ende bei dir steht.",
  solutionIntro:
    "Keine wahllos in Prozesse hineingequetschte KI, sondern eine eigene Arbeitsumgebung, die kontrolliert auf relevante Systeme, Daten und Schnittstellen zugreift.",
  solutionItems: [
    { title: "Eigene KI-Infrastruktur", description: "Ein System statt einzelner Tools, die niemand verbindet." },
    { title: "Datenbank & Schnittstellen", description: "Der Kontext, den die KI sonst bei jeder Anfrage neu fehlt." },
    { title: "Automatisierte Workflows", description: "Agenten mit eigenem Postfach und klar definierten Aufgaben." },
    { title: "Klar definierte Prozesse", description: "Aus Chatten wird ein produktiver Arbeitsprozess." },
  ],
  solutionOutro: "Die KI erhält Zugriff, Kontext und konkrete Aufgaben. Dadurch wird aus Chatten ein produktiver Arbeitsprozess.",

  cta: {
    heading: "Lass uns prüfen, wo KI in deinem Unternehmen wirklich produktiv werden kann.",
    text: "In der KI-Bewertung analysieren wir, welche Prozesse, Daten und Systeme sich sinnvoll verbinden lassen.",
  },
};
