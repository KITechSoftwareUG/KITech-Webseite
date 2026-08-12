/**
 * Das Angebot, auf das jeder Knopf der Website führt — der Lead-Magnet.
 *
 * **Eine Quelle für alle Stellen.** Vorher stand „Kostenloses Erstgespräch"
 * an 31 Stellen im Code, verteilt über 25 Dateien: in Knopfbeschriftungen, in
 * Fließtexten, in JSON-LD, in Stellenanzeigen. Wer das Angebot ändern wollte,
 * musste sie alle finden. Ab jetzt steht hier, was angeboten wird, und die
 * Seiten holen es sich.
 *
 * Stand 12.08.2026: aus dem 30-minütigen Erstgespräch ist eine einstündige
 * Bewertung der KI- und Automatisierungsaufstellung geworden, begrenzt auf
 * fünf Plätze pro Woche.
 */

export interface Angebot {
  /** Kurzname für Knöpfe und Navigation. */
  kurz: string;
  /** Vollständiger Name für Überschriften und Metadaten. */
  name: string;
  /** Ein Satz, was in der Stunde passiert. */
  beschreibung: string;
  /** Dauer als fertiger String. */
  dauer: string;
  /** Beschriftung des Haupt-Knopfes. */
  cta: string;
  /** Zweite Zeile unter dem Knopf, wo Platz ist. */
  ctaZusatz: string;
  /** Zielseite. */
  href: string;
}

/**
 * Wie viele Plätze pro Woche vergeben werden.
 *
 * Die Zahl ist **echt**: eine Stunde je Termin, fünf Termine — mehr gibt der
 * Kalender neben der Projektarbeit nicht her. Genau deshalb darf sie auch
 * ausgesprochen werden.
 */
export const PLAETZE_PRO_WOCHE = 5;

/**
 * Wie viele Plätze in der laufenden Woche noch frei sind.
 *
 * **`null` bedeutet: keine Restzahl anzeigen.** Dann steht auf der Seite nur
 * die Wochenzahl („fünf Plätze pro Woche"), und die stimmt immer.
 *
 * Wer hier eine Zahl einträgt, macht eine Tatsachenbehauptung über die
 * Verfügbarkeit. Sie muss dann auch stimmen und wöchentlich gepflegt werden:
 * Eine Verknappung, die unabhängig von der Wirklichkeit immer „noch 2 frei"
 * zeigt, ist nach Anhang zu § 3 Abs. 3 UWG Nr. 7 eine per se unzulässige
 * geschäftliche Handlung — ohne Interessenabwägung abmahnbar, und im Quelltext
 * für jeden Wettbewerber nachlesbar.
 *
 * Deshalb steht hier bewusst `null` und keine ausgedachte Zahl. Ayham trägt
 * ein, was tatsächlich frei ist; die Anzeige erscheint dann von selbst.
 */
export const PLAETZE_FREI: number | null = null;

export const angebot: Angebot = {
  kurz: "KI-Bewertung",
  name: "Kostenlose Bewertung eurer KI-Aufstellung",
  beschreibung:
    "Eine Stunde, in der wir eure KI- und Automatisierungsaufstellung durchgehen: was läuft, was fehlt, was sich zuerst lohnt.",
  dauer: "60 Minuten",
  cta: "Kostenlose KI-Bewertung sichern",
  ctaZusatz: `${PLAETZE_PRO_WOCHE} Plätze pro Woche`,
  href: "/lass-uns-reden",
};

/**
 * Die Verknappungszeile, fertig formuliert — für Ankündigungsbalken, Knöpfe und
 * Seitenköpfe. Ohne gepflegte Restzahl bleibt es bei der Wochenzahl.
 */
export const verfuegbarkeit = (): string =>
  PLAETZE_FREI === null
    ? `${PLAETZE_PRO_WOCHE} Plätze pro Woche`
    : PLAETZE_FREI === 1
      ? "Noch 1 Platz diese Woche"
      : `Noch ${PLAETZE_FREI} von ${PLAETZE_PRO_WOCHE} Plätzen diese Woche`;
