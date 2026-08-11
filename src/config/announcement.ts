/**
 * Inhalt des dunkelblauen Ankuendigungsbalkens ganz oben.
 *
 * Bewusst als eigene Datei: der Balken ist die einzige Stelle der Seite, an der
 * etwas Zeitliches steht. Er wird haeufiger geaendert als alles andere und soll
 * dafuer nicht in eine Layout-Komponente hineingegriffen werden muessen.
 *
 * Steht `announcement` auf `null`, verschwindet der Balken vollstaendig — die
 * Kopfzeile rueckt dann nach oben, ohne dass sonst etwas angepasst werden muss.
 *
 * WICHTIG: Hier gehoert nichts hinein, was nicht stimmt. Der Balken ist die
 * prominenteste Zeile der Seite; eine erfundene Verknappung ("nur noch 3
 * Plaetze") waere eine irrefuehrende geschaeftliche Handlung nach § 5 UWG.
 */
export interface Announcement {
  /** Kurzes Label in der weissen Pille, z. B. "NEU". Optional. */
  badge?: string;
  /** Der fette Teil der Zeile — ohne Satzzeichen am Ende, der Doppelpunkt kommt aus der Komponente. */
  lead: string;
  /** Der leichte Teil dahinter. */
  text: string;
  href: string;
}

export const announcement: Announcement | null = {
  badge: "NEU",
  lead: "Kostenloses Erstgespräch",
  text: "In 30 Minuten wissen wir, ob es passt",
  href: "/lass-uns-reden",
};
