/**
 * Bestätigungskennungen für Google Search Console und Bing Webmaster Tools.
 *
 * **Warum als Meta-Tag und nicht über DNS.** Die Nameserver der Domain liegen
 * bei Hostinger (`ns1.dns-parking.com`), ein TXT-Eintrag braucht also Zugang
 * zu deren Oberfläche. Das Meta-Tag braucht nur einen Deploy — und der Weg
 * steht hier ohnehin bereit.
 *
 * ⚠️ **Der Eintrag darf nach der Bestätigung nicht wieder verschwinden.** Beide
 * Dienste prüfen ihn regelmäßig nach; fehlt er, verliert die Domain ihren
 * bestätigten Status und die Daten laufen nicht weiter. Er bleibt also dauerhaft
 * stehen, auch wenn er nur einmal gebraucht zu werden scheint.
 *
 * Beide Werte sind **keine Geheimnisse**: Sie stehen im Quelltext jeder
 * ausgelieferten Seite und sind für jeden lesbar. Sie belegen nur, dass jemand
 * Schreibzugriff auf die Website hat — deshalb gehören sie ins Repo und nicht
 * in `.env`.
 *
 * ## Wo die Werte herkommen
 *
 * **Google Search Console** — https://search.google.com/search-console
 *   1. Property hinzufügen, Typ **URL-Präfix**, Wert `https://kitech-software.de`
 *      (nicht „Domain": der Typ verlangt zwingend DNS).
 *   2. Bestätigungsmethode **HTML-Tag** wählen.
 *   3. Aus `<meta name="google-site-verification" content="…">` den Inhalt von
 *      `content` hier eintragen — nur den Wert, nicht das ganze Tag.
 *   4. Deployen, dann in der Search Console auf „Bestätigen".
 *
 * **Bing Webmaster Tools** — https://www.bing.com/webmasters
 *   Der kürzeste Weg ist der Import aus der Search Console: „Import from
 *   Google Search Console" übernimmt Property und Bestätigung in einem Schritt.
 *   Wer den eigenen Weg geht, wählt die Meta-Tag-Bestätigung und trägt den
 *   Wert aus `<meta name="msvalidate.01" content="…">` hier ein.
 *
 * Nach der Bestätigung in beiden Diensten die Sitemap einreichen:
 * `https://kitech-software.de/sitemap.xml`
 */

/**
 * Google Search Console. `null`, solange nichts eingetragen ist — dann rendert
 * Next.js kein Tag, statt eines mit leerem Inhalt auszugeben.
 */
export const GOOGLE_SITE_VERIFICATION: string | null = "kswqCDW66B81rNaynhQohlOjWMGZoJ-3ccdXHGLUdXE";

/** Bing Webmaster Tools. Entfällt, wenn aus der Search Console importiert wird. */
export const BING_SITE_VERIFICATION: string | null = null;

/**
 * Baut daraus den `verification`-Abschnitt für Next.js. Leere Felder werden
 * weggelassen — ein Tag mit leerem `content` sieht für den Prüfer aus wie ein
 * fehlgeschlagener Versuch.
 */
export function suchkonsolenBestaetigung() {
  const other: Record<string, string> = {};
  if (BING_SITE_VERIFICATION) other["msvalidate.01"] = BING_SITE_VERIFICATION;

  return {
    ...(GOOGLE_SITE_VERIFICATION ? { google: GOOGLE_SITE_VERIFICATION } : {}),
    ...(Object.keys(other).length > 0 ? { other } : {}),
  };
}
