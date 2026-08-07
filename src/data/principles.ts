/**
 * Werte und Versprechen für `/haltung`.
 *
 * HERKUNFT: übernommen von der alten Haltungsseite
 * (`src/views/legacy/Haltung.tsx`) beim Relaunch am 05.08.2026. Ansprache von
 * "Sie" auf "ihr" gedreht, damit die Seite nicht als einzige siezt.
 *
 * NICHT übernommen: die Passage zur ROI-Garantie ("Erreichen wir das vereinbarte
 * ROI-Ziel nicht, zahlen Sie nicht"). Das ist ein bindendes Zahlungsversprechen
 * und gehört ausdrücklich freigegeben, bevor es wieder auf der Seite steht —
 * beim Wiederaufbau der Seitenstruktur wird so etwas nicht nebenbei
 * mitgeschleppt. Soll es zurück, kommt es hier wieder rein.
 *
 * OFFEN: Ayhams aktueller Wortlaut ersetzt diese Texte. Nur diese Datei ändern,
 * `Haltung.tsx` bleibt unberührt.
 */

export interface Principle {
  title: string;
  description: string;
}

export const principles: Principle[] = [
  {
    title: "Sicherheit vor Funktionsumfang",
    description:
      "Jede Zeile entsteht unter der Frage, was mit den Daten passiert. Datenschutz ist keine Nacharbeit, sondern die Ausgangslage.",
  },
  {
    title: "Nachvollziehbar statt Blackbox",
    description:
      "Wir erklären, was wir tun und warum. Keine versteckten Abhängigkeiten, keine Lock-ins, keine magischen Versprechen.",
  },
  {
    title: "Ingenieure, keine Verkäufer",
    description:
      "Was wir vorschlagen, hat einen technischen Grund. Nicht einen, der gerade gut klingt.",
  },
  {
    title: "Nicht jedes Problem braucht KI",
    description:
      "Wenn eine einfachere Lösung besser passt, sagen wir das — auch wenn wir daran weniger verdienen.",
  },
  {
    title: "Systeme, die man in zwei Jahren noch warten kann",
    description:
      "Wartbar, erweiterbar, dokumentiert. Kein Schnellschuss, den danach niemand mehr anfassen will.",
  },
  {
    title: "Auf Augenhöhe",
    description:
      "Ihr wisst, wie euer Geschäft läuft. Wir wissen, wie man es baut. Beides zusammen ergibt das Ergebnis.",
  },
];

/** Was ihr bekommt, unabhängig vom Projekt. Kurze Aussagen, keine Absätze. */
export const commitments: string[] = [
  "Kein Vendor-Lock-in: der Code gehört euch",
  "Betrieb lokal oder in der EU möglich",
  "Vollständige Dokumentation",
  "Wissenstransfer ist Teil des Projekts",
  "Nachvollziehbare Preise",
  "Wartung auch nach dem Projektende",
];
