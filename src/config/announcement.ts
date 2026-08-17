import { angebot, verfuegbarkeit, verfuegbarkeitKurz } from "./angebot";

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
 * Der Nachsatz kommt aus `angebot.ts`, damit Balken und Knoepfe nicht
 * auseinander laufen.
 *
 * **Stand 17.08.2026: der Balken fuehrt mit einer Frage, nicht mit dem
 * Produktnamen.** Vorher stand dort "1:1-KI-Check 2026" — eine datierte
 * Ankuendigung, wie die Design-Vorlage sie loest ("2026 Scaling Workshop Dates
 * Announced"). Auf Ansage geaendert: "bitte schreib stattdessen sowas wie
 * 'find heraus …', z. B. ob du KI gut nutzt". Ein Produktname sagt jemandem,
 * der die Seite zum ersten Mal sieht, nichts; "Find heraus, ob …" gibt ihm
 * einen Grund zu klicken. Wer hier wieder den Angebotsnamen einsetzt, nimmt
 * dem Balken genau das.
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
  /**
   * Kurzfassung fuer schmale Displays. Der Balken ist in der Vorlage auf dem
   * Handy zweizeilig; die lange Fassung braucht dort drei Zeilen.
   */
  textKurz: string;
  href: string;
}

export const announcement: Announcement | null = {
  /* **Kein Badge mehr.** "NEU" kuendigte das Produkt an ("NEU: 1:1-KI-Check
     2026") — vor einer Aufforderung liest es sich schief, und auf dem Handy
     kostete es die entscheidenden 52 px: mit Badge lief die Zeile auf drei
     Zeilen aus (108 px), ohne bleibt der Balken bei den vorgesehenen zwei
     (87 px, bei 360 px gemessen). Wer ihn zurueckholen will, setzt hier
     `badge: "NEU"` und sieht sich den Balken bei 360 px an. */
  /* "richtig" statt "gut" greift die Hero-Aussage auf ("Falsche KI kostet mehr
     als keine KI") — Balken und Hero sagen dann dasselbe, einmal als Frage und
     einmal als Behauptung. Wer lieber die woertliche Fassung will: "gut" hier
     einsetzen, sonst aendert sich nichts. */
  lead: "Find heraus, ob du KI richtig nutzt",
  /* Der Rhythmus steckt seit dem 12.08.2026 in `verfuegbarkeit()` selbst
     ("Jeden Donnerstag 5 Plätze — diese Woche noch 2 Plätze frei"). Die Dauer
     steht deshalb nicht mehr davor: Der Balken trägt eine Zeile, und die
     Begrenzung ist dort die wichtigere Angabe als die 60 Minuten. */
  text: verfuegbarkeit(),
  textKurz: verfuegbarkeitKurz(),
  href: angebot.href,
};
