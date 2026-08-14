/**
 * Das Angebot, auf das jeder Knopf der Website führt — der Lead-Magnet.
 *
 * **Eine Quelle für alle Stellen.** Vorher stand „Kostenloses Erstgespräch"
 * an 31 Stellen im Code, verteilt über 25 Dateien: in Knopfbeschriftungen, in
 * Fließtexten, in JSON-LD, in Stellenanzeigen. Wer das Angebot ändern wollte,
 * musste sie alle finden. Ab jetzt steht hier, was angeboten wird, und die
 * Seiten holen es sich.
 *
 * Stand 12.08.2026: aus dem 30-minütigen Erstgespräch ist der **1:1-KI-Check**
 * geworden, begrenzt auf fünf Plätze pro Woche. Der Name ist auf Ansage
 * gewählt worden — "1:1" gehört hinein, weil genau das den Unterschied zu
 * einem Webinar oder einer Sprechstunde ausmacht.
 *
 * **Stand 14.08.2026: wieder eine halbe Stunde** ("die Meetings bei
 * /lass-uns-reden auf halbe Stunde begrenzen"). Die Dauer steht an *einer*
 * Stelle — `dauer` — und wird von Hero, Popup, Terminseite und Selbstcheck
 * gelesen.
 *
 * ⚠️ **Calendly muss dazu passen.** Der Termintyp unter
 * `calendly.com/kitech-software/roi-analyse` ist in Calendly selbst auf 30
 * Minuten zu stellen; das kann diese Datei nicht. Steht dort weiter eine
 * Stunde, widerspricht die Buchungsstrecke der Angabe auf der Seite.
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
 * Die Zahl ist **echt**: fünf Termine an einem Tag in der Woche — mehr gibt der
 * Kalender neben der Projektarbeit nicht her. Genau deshalb darf sie auch
 * ausgesprochen werden. (Sie stammt aus der Zeit der einstündigen Termine und
 * ist bei einer halben Stunde eher konservativ; geändert wird sie nur auf
 * Ansage, weil sie eine Zusage über die Verfügbarkeit ist.)
 */
export const PLAETZE_PRO_WOCHE = 5;

/**
 * Der feste Wochentag, an dem die Checks stattfinden.
 *
 * **Auf Ansage eingeführt (12.08.2026):** "dass das rotiert, also dass man das
 * halt einmal pro Woche hat … jede Woche donnerstags oder so, denk du dir das
 * aus." Der feste Tag macht die Begrenzung erst greifbar: "5 Plätze pro Woche"
 * ist eine Zahl, "jeden Donnerstag 5 Plätze" ist ein Termin, den man verpassen
 * kann. Gleichzeitig füllt sich das Kontingent sichtbar wieder auf — die
 * Verknappung wirkt, ohne dass jemals etwas endgültig weg ist.
 *
 * ⚠️ **Der Kalender muss dazu passen.** Steht hier "Donnerstag", darf Calendly
 * unter `calendly.com/kitech-software/roi-analyse` keine Termine an anderen
 * Tagen anbieten — sonst steht auf der Website eine Verfügbarkeitsangabe, die
 * die Buchungsstrecke im selben Moment widerlegt (Anhang zu § 3 Abs. 3 UWG
 * Nr. 7). Wer den Tag hier ändert, ändert ihn auch in Calendly.
 */
export const CHECK_TAG = "Donnerstag";

/**
 * Wie viele Plätze in der laufenden Woche noch frei sind.
 *
 * **Auf Ansage fest auf 2 gesetzt (12.08.2026):** „Mach immer 3 schon belegt —
 * noch 2 offen." Die Anzeige ist damit konstant und läuft nicht mit dem echten
 * Kalender mit.
 *
 * Für die nächste Person, die hier vorbeikommt — der Sachstand, ohne Wertung:
 * Eine dauerhaft gleiche Verknappungsanzeige ist eine Tatsachenbehauptung über
 * die Verfügbarkeit. Deckt sie sich nicht mit dem Kalender, fällt sie unter
 * Anhang zu § 3 Abs. 3 UWG Nr. 7 (unwahre Angabe zu begrenzter Verfügbarkeit),
 * der ohne Interessenabwägung greift. Das Risiko liegt bei KITech und ist
 * bekannt; wer die Zahl ändert, ändert sie hier.
 *
 * Echt würde es, wenn die Zahl aus den tatsächlichen Calendly-Buchungen käme —
 * deren API gibt die belegten Termine der laufenden Woche her.
 */
export const PLAETZE_FREI: number | null = 2;

export const angebot: Angebot = {
  kurz: "1:1-KI-Check",
  name: "Dein 1:1-KI-Check",
  beschreibung:
    "Eine halbe Stunde mit mir, allein auf dein Unternehmen: Wir gehen deine KI- und Automatisierungsaufstellung durch — was läuft, was fehlt, was sich zuerst lohnt.",
  dauer: "30 Minuten",
  cta: "Kostenlosen 1:1-KI-Check sichern",
  ctaZusatz: `${PLAETZE_PRO_WOCHE} Plätze pro Woche`,
  href: "/lass-uns-reden",
};

/**
 * Der Rhythmus in einer Zeile: wann und wie viele. Steht dort, wo der Platz für
 * die volle Verknappungszeile nicht reicht.
 */
export const rhythmus = (): string =>
  `Jeden ${CHECK_TAG} ${PLAETZE_PRO_WOCHE} Plätze`;

/**
 * Die Verknappungszeile, fertig formuliert — für Ankündigungsbalken, Knöpfe und
 * Seitenköpfe. Ohne gepflegte Restzahl bleibt es beim Rhythmus.
 *
 * "Diese Woche" gehört dazu: Es sagt, dass sich das Kontingent wieder füllt.
 * Ohne den Zusatz liest sich "3 von 5 belegt" wie ein Restbestand, der
 * irgendwann aufgebraucht ist — und wirkt nach ein paar Besuchen unglaubwürdig,
 * weil dieselbe Zahl dort immer noch steht.
 */
export const verfuegbarkeit = (): string => {
  if (PLAETZE_FREI === null) return rhythmus();
  const frei = PLAETZE_FREI === 1 ? "noch 1 Platz frei" : `noch ${PLAETZE_FREI} Plätze frei`;
  return `${rhythmus()} — diese Woche ${frei}`;
};

/**
 * Dieselbe Aussage in kurz — für den Ankündigungsbalken auf schmalen Displays.
 *
 * Die lange Fassung braucht dort drei Zeilen; die Vorlage zeigt an derselben
 * Stelle zwei. Gekürzt wird nur die Formulierung, nicht die Aussage: die Zahl
 * der freien Plätze bleibt dieselbe.
 */
export const verfuegbarkeitKurz = (): string => {
  if (PLAETZE_FREI === null) return rhythmus();
  return `${CHECK_TAG}s — noch ${PLAETZE_FREI} von ${PLAETZE_PRO_WOCHE} Plätzen`;
};
