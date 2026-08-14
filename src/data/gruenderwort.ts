/**
 * Das Gründerwort unter dem Kundenlaufband auf der Startseite.
 *
 * **Auf Ansage (14.08.2026):** Unter den Referenzen soll etwas stehen, und es
 * soll Ayham sein — bei dieser Zielgruppe trägt die Person, nicht die Firma.
 *
 * **Woher die Texte kommen:**
 *
 *   - `zitat` steht wörtlich so schon auf `/haltung` (`src/views/Haltung.tsx`)
 *     und ist von Ayham. Es ist hier bewusst dasselbe: eine Aussage, die auf
 *     zwei Seiten steht, wirkt wie eine Haltung; zwei verschiedene wirken wie
 *     Werbetexte. Wer es hier ändert, ändert es dort mit.
 *   - `absaetze` ist ein **Entwurf** und der einzige Text auf dieser Seite, der
 *     nicht belegt ist. Er sagt nichts, was nicht anderswo im Repo steht
 *     (Prozess-Audit zuerst, „nicht jedes Problem braucht KI", Betrieb in der
 *     EU oder im Haus) — aber es sind nicht Ayhams Worte.
 *
 * ⚠️ **Offen:** `absaetze` durch Ayhams Wortlaut ersetzen. Nur diese Datei
 * anfassen, die Komponente bleibt unberührt.
 */

export interface Gruenderwort {
  /**
   * Überschrift des Abschnitts — **unsichtbar**, nur für Screenreader und die
   * Dokumentgliederung. Sichtbar trägt das Zitat den Block. Eine kleine Zeile
   * über einer Überschrift wäre genau das Label-Muster, das auf dieser Website
   * nicht gebaut wird. Genauso macht es `/haltung`.
   */
  ueberschrift: string;
  /** Der Satz, der trägt. Wörtlich von Ayham, identisch zu `/haltung`. */
  zitat: string;
  /** Zwei bis drei kurze Absätze darunter. Siehe Warnung oben. */
  absaetze: string[];
  /** Was unter dem Namen steht, statt eines weiteren Knopfes. */
  abschluss: string;
  /** Überschrift über den beiden Kollegen. Sichtbar, aber klein. */
  teamUeberschrift: string;
  /**
   * Wer neben Ayham gezeigt wird — Namen aus `src/data/team.ts`.
   *
   * **Auf Ansage (14.08.2026):** „Da, wo mein Bild auftaucht, gerne auch mein
   * Team anzeigen. Ich geb dir zwei Leute: Jörg und Leon."
   *
   * Bewusst nur zwei von vier: Jennifer (Werkstudentin Backoffice) ist auf der
   * Startseite nicht genannt worden. Wer sie ergänzen will, trägt hier den
   * Namen ein — Rolle und Satz kommen dann automatisch aus `team.ts`.
   */
  teamNamen: string[];
}

export const gruenderwort: Gruenderwort = {
  ueberschrift: "Wer dahintersteht",

  zitat:
    "Ich habe zu oft gesehen, wie sechsstellige Beträge in Projekte gehen, die in einer schicken Demo enden und nie in der Bilanz ankommen. Mittelstand kann sich das nicht leisten.",

  absaetze: [
    "Deshalb fängt bei uns kein Projekt mit einem Werkzeug an, sondern mit euren Abläufen. Wir sehen sie uns an und sagen, an welcher Stelle Automatisierung etwas bringt — und an welcher nicht. Wenn eine einfachere Lösung besser passt, sagen wir das auch dann, wenn wir daran weniger verdienen.",
    "Was danach gebaut wird, läuft in eurem Tagesgeschäft und nicht in einer Demo: angeschlossen an eure Systeme, betrieben in europäischer Region oder auf eurer eigenen Hardware, dokumentiert und wartbar. Der Code gehört euch.",
  ],

  abschluss: "Im 1:1-KI-Check sprichst du mit mir, nicht mit einem Vertrieb.",

  teamUeberschrift: "Wer sonst noch dabei ist",
  teamNamen: ["Leon", "Jörg"],
};
