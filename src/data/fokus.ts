/**
 * Inhalt der LinkedIn-Landingpage `/fokus` (Domain `fokus.kitech-software.de`,
 * Host-Rewrite in `src/proxy.ts`).
 *
 * Zielgruppe: kalter Traffic über den LinkedIn-"Featured"-Bereich. Beat-
 * Reihenfolge folgt Schema A aus dem `funnel-narrativ`-Skill, siehe `funnel.ts`
 * für den ausführlicheren Kommentar zur Herkunft.
 *
 * OFFEN: `patternInterrupt.body` ist Platzhalter-Struktur, keine erfundene
 * Biografie. Preis (299 €, vorher 600 €) ist der zuletzt gültige Stand aus dem
 * Vite-Vorgänger — vor Livegang mit Ayham gegenchecken.
 */

export const fokusContent = {
  headline: "Wie kommst du mit dem Einsatz von KI",
  headlineHighlight: "endlich voran?",
  lead: "Keine weiteren Tutorials. Kein weiterer Prompt-Ordner. Sondern ein konkreter Plan für deine Situation.",

  patternInterrupt: {
    heading: "Ich habe selbst Monate damit verloren.",
    body: "Platzhalter: eine kurze, persönliche Geschichte — wie viel Zeit in Tutorials/Prompt-Sammlungen ging, bevor klar wurde, dass das Problem nie fehlendes Wissen war, sondern fehlende Klarheit über den eigenen Anwendungsfall. 2-4 kurze Sätze.",
  },

  painHeading: "Kennst du das auch?",
  painPoints: [
    "Du kennst viele Tools, aber hast keinen klaren Prozess.",
    "Du probierst ständig etwas Neues aus.",
    "Du weißt nicht, welcher Anwendungsfall wirklich sinnvoll ist.",
    "Du siehst Möglichkeiten, kommst aber nicht in die Umsetzung.",
    "Du weißt nicht, wie daraus Produktivität oder Umsatz entsteht.",
  ],

  processHeading: "Die Lösung ist nicht noch mehr Wissen.",
  processIntro:
    "Die meisten scheitern nicht daran, zu wenig über KI zu wissen. Sie scheitern daran, dass ihnen Klarheit über ihren konkreten Anwendungsfall, den Nutzen und die nächsten Schritte fehlt.",
  process: [
    { number: "01", title: "Situation analysieren", description: "Wo stehst du wirklich, jenseits der Tool-Liste." },
    { number: "02", title: "Anwendungsfall auswählen", description: "Der eine, der für dich sinnvoll ist — nicht alle." },
    { number: "03", title: "Umsetzung planen", description: "Klare nächste Schritte statt eines weiteren Tutorials." },
  ],

  offer: {
    title: "Dein persönlicher 1:1-KI-Workshop",
    includes: [
      "60–90 Minuten",
      "Persönliches 1:1-Gespräch",
      "Analyse deiner aktuellen Situation",
      "Bewertung deiner Ideen und Möglichkeiten",
      "Auswahl eines konkreten KI-Anwendungsfalls",
      "Klare nächste Schritte",
    ],
    excludes: "Keine Standardschulung. Kein aufgezeichneter Videokurs. Kein Gruppencall.",
    priceOld: "600 €",
    priceNew: "299 €",
    discountLabel: "50 % Einführungsrabatt",
  },

  fit: {
    forTitle: "Geeignet für",
    for: [
      "Selbstständige",
      "Unternehmer",
      "Entscheider",
      "Menschen mit konkreten Ideen",
      "Personen, die endlich in die Umsetzung kommen wollen",
    ],
    notTitle: "Nicht geeignet für",
    not: [
      "Reine Tool-Sammler",
      "Menschen, die nur kostenlose Prompts suchen",
      "Personen, die ein allgemeines KI-Webinar erwarten",
      "Menschen, die ohne eigene Umsetzung sofortige Ergebnisse erwarten",
    ],
  },

  cta: {
    heading: "Mach aus KI-Wissen einen konkreten Plan.",
    text: "Nach dem Workshop weißt du, welcher Anwendungsfall für dich sinnvoll ist und was du als Nächstes tun musst.",
  },
};
