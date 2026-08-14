/**
 * Das Popup, das auf der Startseite kurz nach dem Laden aufgeht.
 *
 * **Vorgabe Ayham (13.08.2026), wörtlich:** „Ganz ungescrollt oder fast ganz
 * ungescrollt kommt sofort ein Pop-up: ‚Buch dir einen Call‘, so richtig
 * direkt. Bisschen einfach kurz kennenlernen, erzähl mir, wie deine
 * KI-Situation ist, und ich geb dir sofort drei, vier Tipps kostenlos zum
 * Mitnehmen — so ganz radikal, so richtig stoppend."
 *
 * Deshalb steht hier ein Text und keine Argumentationskette: eine Aussage, ein
 * Satz, ein Knopf. Wer hier eine Aufzählung mit Häkchen ergänzt, nimmt dem
 * Popup genau das Stoppende, für das es gebaut ist.
 *
 * Der Knopf führt wie jeder andere CTA der Website auf `angebot.href`
 * (`/lass-uns-reden`) — nie direkt zu Calendly.
 *
 * **Es wartet auf Ruhe (Vorgabe 14.08.2026).** Bis dahin ging es 3,5 s nach
 * dem Laden auf, oder sofort bei der ersten Scrollbewegung. Beides ist
 * zurückgenommen: „Bitte ein bisschen verzögert anzeigen — es soll kommen,
 * wenn quasi nichts passiert. Ranking ist schon sehr wichtig."
 *
 * Der Grund ist nicht Höflichkeit, sondern Google: Overlays, die auf dem Handy
 * **unmittelbar nach dem Laden** den Inhalt verdecken, gelten als „intrusive
 * interstitial" und können die Seite in der mobilen Suche zurückstufen — und
 * die Startseite ist die Seite, die ranken soll. Ein Dialog, der erst nach
 * einer knappen halben Minute und nur in einer Lesepause kommt, fällt nicht
 * darunter.
 *
 * Die Bedingung hat deshalb drei Teile, alle in dieser Datei einstellbar:
 *
 *   1. **Frühestens** nach `CALL_POPUP_MINDESTDAUER_MS` auf der Seite.
 *   2. **Dann** erst, wenn `CALL_POPUP_RUHE_MS` lang nichts passiert —
 *      kein Scrollen, keine Maus, keine Taste, keine Berührung.
 *   3. **Spätestens** nach `CALL_POPUP_SPAETESTENS_MS`, damit es auch jemanden
 *      erreicht, der ununterbrochen liest und scrollt.
 */

export interface CallPopupInhalt {
  /** Die Aussage. Steht groß und in Versalien, wie die H1 der Startseite. */
  ueberschrift: string;
  /** Ein Satz, was in dem Gespräch passiert. */
  text: string;
  /** Beschriftung des Knopfes. */
  cta: string;
  /** Der leise Ausweg unter dem Knopf. Kein „Nein, ich will keinen Umsatz". */
  ablehnen: string;
}

export const callPopup: CallPopupInhalt = {
  ueberschrift: "Buch dir einen Call.",
  text: "Kurz kennenlernen: Du erzählst mir, wie deine KI-Situation ist — und ich geb dir sofort 3–4 Tipps kostenlos zum Mitnehmen.",
  cta: "Ja, Call buchen",
  ablehnen: "Nein, gerade nicht",
};

/**
 * Wie lange jemand mindestens auf der Seite gewesen sein muss.
 *
 * 25 Sekunden sind deutlich mehr als die Zeitspanne, in der Google ein Overlay
 * noch der Landung zurechnet, und ungefähr die Zeit, die man braucht, um Hero
 * und die ersten Kundenkarten anzusehen.
 */
export const CALL_POPUP_MINDESTDAUER_MS = 25_000;

/**
 * Wie lange nichts passiert sein muss, bevor das Popup aufgeht.
 *
 * Das ist der Kern der Vorgabe: nicht mitten in die Bewegung hinein, sondern
 * in die Pause danach. Sechs Sekunden ohne Scrollen, Maus, Taste oder
 * Berührung sind auf einer Seite dieser Länge eine echte Pause und nicht bloß
 * der Moment, in dem jemand einen Satz zu Ende liest.
 */
export const CALL_POPUP_RUHE_MS = 6_000;

/**
 * Notbremse: Wer ununterbrochen scrollt, hätte sonst nie eine Pause — und
 * bekäme das Popup nie zu sehen. Nach dieser Zeit geht es auch ohne Ruhe auf.
 */
export const CALL_POPUP_SPAETESTENS_MS = 75_000;

/**
 * Vorlauf für Erstbesucher, gemessen ab dem Moment, in dem der Cookie-Banner
 * weggeklickt wurde. Erst danach beginnt die Mindestdauer zu laufen.
 *
 * **Warum überhaupt gewartet wird:** Der Banner erscheint nach 500 ms unten am
 * Rand. Ein Dialog darüber sperrt die Seite (Radix legt einen Overlay über
 * alles) — die Einwilligung wäre dann nicht mehr bedienbar. Zwei Overlays
 * gleichzeitig sind in beide Richtungen schlecht: rechtlich, weil die
 * Einwilligung frei zugänglich sein muss, und praktisch, weil niemand zwei
 * Kästen gleichzeitig liest.
 *
 * ⚠️ Wer den Banner **gar nicht** anfasst, sieht auch kein Popup. Das ist der
 * Preis dafür, die Einwilligung nicht zu verdecken.
 */
export const CALL_POPUP_VORLAUF_NACH_CONSENT_MS = 2_000;

/** Wie lange Ruhe ist, wenn jemand das Popup wegklickt. */
export const CALL_POPUP_PAUSE_TAGE = 7;

/**
 * Wie lange Ruhe ist, wenn jemand auf den Knopf geklickt hat.
 *
 * Wer gerade auf der Terminseite war, soll beim nächsten Besuch nicht wieder
 * gefragt werden, ob er einen Termin will.
 */
export const CALL_POPUP_PAUSE_NACH_KLICK_TAGE = 90;
