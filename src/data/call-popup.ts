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
 * ⚠️ **Zu wissen, solange das Popup so früh aufgeht:** Google wertet Overlays,
 * die auf dem Handy direkt nach dem Laden den Inhalt verdecken, als
 * „intrusive interstitial" und kann die Seite in der mobilen Suche
 * zurückstufen. Das betrifft genau die Startseite. Wer das Risiko nicht
 * tragen will, setzt `CALL_POPUP_VERZOEGERUNG_MS` hoch oder lässt das Popup
 * erst ab einer Scrolltiefe aufgehen — beides sind Zahlen in dieser Datei, die
 * Komponente muss dafür nicht angefasst werden.
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
 * Wie lange nach dem Laden das Popup aufgeht — „fast ganz ungescrollt".
 *
 * Kurz genug, dass es die Aussage im Hero unterbricht, lang genug, dass sie
 * vorher einmal gelesen werden kann.
 */
export const CALL_POPUP_VERZOEGERUNG_MS = 3500;

/**
 * Dieselbe Verzögerung für Erstbesucher, gemessen ab dem Moment, in dem der
 * Cookie-Banner weggeklickt wurde.
 *
 * **Warum überhaupt gewartet wird:** Der Banner erscheint nach 500 ms unten am
 * Rand. Ein Dialog darüber sperrt die Seite (Radix legt einen Overlay über
 * alles) — die Einwilligung wäre dann nicht mehr bedienbar. Zwei Overlays
 * gleichzeitig sind in beide Richtungen schlecht: rechtlich, weil die
 * Einwilligung frei zugänglich sein muss, und praktisch, weil niemand zwei
 * Kästen gleichzeitig liest. Deshalb erst der Banner, dann das Popup — und
 * dann schneller, weil zu dem Zeitpunkt schon Zeit auf der Seite vergangen ist.
 */
export const CALL_POPUP_VERZOEGERUNG_NACH_CONSENT_MS = 1200;

/**
 * Scrollt jemand vorher schon los, geht das Popup sofort auf.
 *
 * 120 px sind rund eine Handbewegung auf dem Handy — „fast ganz ungescrollt".
 */
export const CALL_POPUP_SCROLL_PX = 120;

/** Wie lange Ruhe ist, wenn jemand das Popup wegklickt. */
export const CALL_POPUP_PAUSE_TAGE = 7;

/**
 * Wie lange Ruhe ist, wenn jemand auf den Knopf geklickt hat.
 *
 * Wer gerade auf der Terminseite war, soll beim nächsten Besuch nicht wieder
 * gefragt werden, ob er einen Termin will.
 */
export const CALL_POPUP_PAUSE_NACH_KLICK_TAGE = 90;
