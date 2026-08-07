/**
 * Einheitliche Seitenbreite.
 *
 * Vorher trug jede Seite ihren eigenen Wert: Startseite 1060 px, Community
 * 1120 px, Referenzen 1180 px. Beim Wechsel zwischen zwei Seiten sprang dadurch
 * das Logo in der Kopfzeile sichtbar hin und her — der Rahmen, in dem die Seite
 * steht, wackelte. Ein Wert für alle.
 *
 * 1180 px ist der breiteste der drei Werte: Karten- und Tabellenraster brauchen
 * ihn, und Textspalten werden ohnehin über eigene `max-w`-Werte begrenzt. Ein
 * schmaler Hero (Startseite) bleibt schmal, indem er die Textspalte begrenzt —
 * nicht den Seitencontainer.
 *
 * Als Konstante statt als Tailwind-Klasse in `tailwind.config.ts`, weil sie auch
 * in Sektionen gebraucht wird, die außerhalb der Shell sitzen (ClientResults,
 * FinalCta) und dort mit derselben Kante fluchten müssen.
 */
export const SITE_CONTAINER = "mx-auto w-full max-w-[1180px] px-5 sm:px-8";

/**
 * Schmale Spalte für zusammenhängenden Fließtext (Rechtstexte, Glossar-Artikel).
 *
 * 760 px ergeben bei der Grundschriftgröße rund 75 Zeichen pro Zeile — die
 * Breite, ab der das Auge beim Zeilenwechsel anfängt, die nächste Zeile zu
 * verfehlen. Volle Seitenbreite wäre für einen Datenschutztext unlesbar.
 */
export const TEXT_CONTAINER = "mx-auto w-full max-w-[760px] px-5 sm:px-8";
