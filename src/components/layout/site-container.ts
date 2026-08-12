/**
 * Einheitliche Seitenbreite — Maße aus der Design-Vorlage gemessen.
 *
 * Der Container der Vorlage ist ein Bootstrap-Container: **1170 px Außenbreite
 * mit 15 px Innenabstand je Seite**, die Inhaltsspalte also 1140 px breit. Am
 * Referenzbild nachgerechnet (Fenster 1350 px): die Spalte läuft von 105 bis
 * 1245 px, das Logo setzt bei 114 an (die 9 px sind Weißraum in der Logodatei),
 * der letzte Navigationspunkt endet bei 1251.
 *
 * Vorher stand hier `dt:px-0`, die Spalte war also 1170 px breit und begann bei
 * 90 px. Dadurch saßen Logo und Navigation je 15 px weiter außen als in der
 * Vorlage — in der Kopfzeile der sichtbarste Unterschied.
 *
 * Der Innenabstand gilt auf allen Breiten: mobil misst die Vorlage 20 px vom
 * Displayrand bis zur Logo-Glyphe, also ebenfalls rund 15 px Abstand plus den
 * Weißraum der Datei.
 *
 * Ein Wert für alle Seiten: vorher trug jede ihren eigenen, und beim Wechsel
 * zwischen zwei Seiten sprang das Logo in der Kopfzeile sichtbar hin und her.
 */
export const SITE_CONTAINER = "mx-auto w-full max-w-site px-[15px]";

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
