/**
 * Hilfsfunktion für Tests, die **Quelltext** prüfen statt Verhalten.
 *
 * Solche Tests haben eine gemeinsame Falle: Sie greifen auf den Kommentar, der
 * erklärt, warum etwas verboten ist. Beim Test gegen „§ 5 TMG" im Impressum und
 * beim Test gegen doppelte Breadcrumbs ist das jeweils sofort passiert — der
 * Kommentar, der die Regel begründet, muss den verbotenen Begriff nennen
 * dürfen, sonst ist die Begründung nicht lesbar.
 *
 * Geprüft wird deshalb immer nur der Code, nie die Dokumentation daneben.
 */

/** Entfernt Block- und Zeilenkommentare. URLs (`https://`) bleiben unberührt. */
export function ohneKommentare(quelltext: string): string {
  return quelltext
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
}
