/**
 * Einheitliche Seitenbreite — Maße aus der Design-Vorlage gemessen.
 *
 * Vorlage (acquisition.com), Container `.header__container`:
 *   ab 1025 px : Breite = min(100%, 1170 px), **kein** seitliches Padding
 *   bis 1024 px: Breite = 100% − 20 px, also 10 px Rand je Seite
 *
 * Die 10 px sind auffällig schmal — auf dem Handy steht der Text damit fast am
 * Displayrand. Das ist so gemessen und wird bewusst übernommen; die Vorlage hat
 * Vorrang vor dem, was üblicherweise als komfortabel gilt.
 *
 * Ein Wert für alle Seiten: vorher trug jede ihren eigenen, und beim Wechsel
 * zwischen zwei Seiten sprang das Logo in der Kopfzeile sichtbar hin und her.
 */
export const SITE_CONTAINER = "mx-auto w-full max-w-site px-[10px] dt:px-0";

/**
 * Schmale Spalte für zusammenhängenden Fließtext (Rechtstexte, Glossar-Artikel).
 *
 * 760 px ergeben bei der Grundschriftgröße rund 75 Zeichen pro Zeile — die
 * Breite, ab der das Auge beim Zeilenwechsel anfängt, die nächste Zeile zu
 * verfehlen. Volle Seitenbreite wäre für einen Datenschutztext unlesbar.
 *
 * Anders als `SITE_CONTAINER` behält diese Spalte auf dem Handy ein echtes
 * Padding: 10 px Rand sind für einen mehrseitigen Fließtext zu wenig, und die
 * Vorlage hat für diesen Fall keine Entsprechung.
 */
export const TEXT_CONTAINER = "mx-auto w-full max-w-[760px] px-5 sm:px-8";
