/**
 * Team fuer die "Wer wir sind"-Sektion. Die Reihenfolge in `teamRoster` ist die
 * Reihenfolge im Raster — Ayham zuerst, danach das Team.
 *
 * Ayham hat ein freigestelltes Portrait (transparenter Hintergrund).
 * Deshalb setzt die Komponente einen aufgehellten "Studio-Grund" hinter das Bild:
 * ohne den wuerden dunkle Anzuege auf dem near-black Seitenhintergrund komplett
 * verschwinden.
 *
 * Fuer Joerg und Jennifer liegen noch keine Fotos vor (`photo: null`). Die Kachel
 * zeigt dann einen neutralen Platzhalter (Silhouetten-Icon auf dem Studio-Grund),
 * damit die Karte einheitlich zu den anderen bleibt — so von Ayham vorgegeben
 * (05.08.2026). Vorher stand dort eine leere Flaeche ohne jeden Marker.
 *
 * Neue Fotos bitte unter `public/images/team/` ablegen (migrationsfreundlich,
 * siehe client-results.ts) und den Pfad hier eintragen.
 */


export interface TeamMember {
  name: string;
  /** Funktion im Team. Steht bei allen vier fest (Vorgabe Ayham, 05.08.2026). */
  role: string;
  /** Ein Satz zur Person. Woertlich aus Ayhams Vorgabe — nicht umformulieren. */
  bio: string;
  /** Bildquelle (Asset-Import oder Pfad unter /public). null => neutraler Platzhalter. */
  photo: string | null;
  /**
   * Persoenliches LinkedIn-Profil. `null`, solange die URL nicht vorliegt — dann
   * rendert die Kachel keinen Link statt auf ein fremdes oder erfundenes Profil
   * zu zeigen.
   * TODO (Ayham): URLs fuer Joerg und Jennifer nachtragen.
   */
  linkedinUrl: string | null;
  /** Hebt die Kachel hervor (Akzentkante + hellerer Grund). Aktuell nur der Gruender. */
  highlight?: boolean;
}

export const teamRoster: TeamMember[] = [
  {
    name: "Ayham Alkhalil",
    role: "Geschäftsführer & Entwickler",
    bio: "Zehn Jahre Konzernerfahrung und sieben Jahre Praxiserfahrung in der Entwicklung von Software- und KI-Lösungen für Unternehmen und Großkonzerne.",
    photo: "/images/team/ayham.webp",
    linkedinUrl: "https://www.linkedin.com/in/ayham-alkhalil-66bb451b5",
    /**
     * **Keine Hervorhebung mehr (14.08.2026, auf Ansage:** „alle nebeneinander
     * auch — nicht nur mich so prominent darstellen!"). Vorher trug Ayhams
     * Kachel eine Akzentkante und einen helleren Bildgrund. Dass er der
     * Geschäftsführer ist, sagt die Rolle unter dem Namen; dafür braucht es
     * keine zweite Auszeichnung.
     */
    highlight: false,
  },
  {
    /**
     * Nachname am 14.08.2026 auf Ansage ergänzt.
     *
     * ⚠️ **„York" ist derselbe Mensch.** Am 17.08.2026 stand hier kurzzeitig
     * ein zweiter Eintrag unter diesem Namen — er stammt aus einer
     * Sprachnachricht, in der „Jörg" als „York" verschriftlicht wurde. Beide
     * sind zusammengeführt; wer die Schreibweise erneut irgendwo auftauchen
     * sieht, meint diese Person hier.
     */
    name: "Jörg Kratzat",
    /** Am 17.08.2026 geschärft: nicht Vertrieb allgemein, sondern IT und SaaS. */
    role: "Vertrieb IT & SaaS",
    /**
     * Erster Halbsatz wörtlich von Ayham (05.08.2026), der zweite auf Ansage
     * vom 17.08.2026 ergänzt: „absoluter Vertriebsprofi im Bereich IT und SaaS
     * … also auch wirklich spezialisiert".
     */
    bio: "Vertriebsprofi mit über 30 Jahren Erfahrung im Verkauf und in der persönlichen Kundenbetreuung — spezialisiert auf IT und SaaS: Software-Verkaufszyklen, technische Entscheider und der Unterschied zwischen einer Demo und einem Projekt.",
    /** Foto vom 17.08.2026. */
    photo: "/images/team/joerg.webp",
    linkedinUrl: null,
  },
  {
    name: "Jennifer",
    role: "Werkstudentin Backoffice",
    bio: "Unterstützt das Team im Backoffice und bei organisatorischen sowie administrativen Aufgaben.",
    photo: null,
    linkedinUrl: null,
  },
];
