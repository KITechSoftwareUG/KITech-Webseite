import { angebot, verfuegbarkeit } from "./angebot";

/**
 * Inhalt des Ankuendigungsbalkens ganz oben.
 *
 * Bewusst als eigene Datei: der Balken ist die einzige Stelle der Seite, an der
 * etwas Zeitliches steht. Er wird haeufiger geaendert als alles andere und soll
 * dafuer nicht in eine Layout-Komponente hineingegriffen werden muessen.
 *
 * Steht `announcement` auf `null`, verschwindet der Balken vollstaendig — die
 * Kopfzeile rueckt dann nach oben, ohne dass sonst etwas angepasst werden muss.
 *
 * Der Text kommt aus `angebot.ts`, damit Balken und Knoepfe nicht auseinander
 * laufen. Die Jahreszahl steht bewusst drin: sie macht aus einer beliebigen
 * Zeile eine datierte Ankuendigung — genauso loest es die Design-Vorlage
 * ("2026 Scaling Workshop Dates Announced").
 *
 * WICHTIG: Hier gehoert nichts hinein, was nicht stimmt. Der Balken ist die
 * prominenteste Zeile der Seite; eine erfundene Verknappung waere eine
 * irrefuehrende geschaeftliche Handlung nach § 5 UWG. Die Platzangabe kommt
 * deshalb aus `verfuegbarkeit()` und damit aus gepflegten Zahlen.
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
  lead: `${angebot.kurz} 2026`,
  text: `Kostenlos, ${angebot.dauer} — ${verfuegbarkeit()}`,
  href: angebot.href,
};
