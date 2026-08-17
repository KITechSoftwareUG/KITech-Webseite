/**
 * Team fuer die "Wer wir sind"-Sektion. Die Reihenfolge in `teamRoster` ist die
 * Reihenfolge im Raster — Ayham zuerst, danach das Team.
 *
 * Ayham und Leon haben freigestellte Portraits (transparenter Hintergrund).
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
   * TODO (Ayham): URLs fuer Leon, Joerg und Jennifer nachtragen.
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
    name: "Leon",
    /** Rolle am 17.08.2026 auf Ansage geändert — vorher „Entwickler". */
    role: "Technical Accountant",
    bio: "Entwickler mit praktischer Erfahrung in der Umsetzung moderner Software- und Automatisierungslösungen.",
    /**
     * Das Foto war am 14.08.2026 kurz draußen, weil Leon damals zusätzlich als
     * Kunde im Kundenlaufband stand und sein Gesicht dadurch zweimal auf
     * derselben Seite war. Seit dem 17.08.2026 ist die Referenz `klargehalt.de`
     * ohne Person (siehe `client-results.ts`) — der Grund ist damit weg, das
     * Foto bleibt.
     */
    photo: "/images/team/leon.webp",
    linkedinUrl: null,
  },
  {
    /** Nachname am 14.08.2026 auf Ansage ergänzt. */
    name: "Jörg Kratzat",
    role: "Vertrieb",
    bio: "Vertriebsprofi mit über 30 Jahren Erfahrung im Verkauf und in der persönlichen Kundenbetreuung.",
    /**
     * ⚠️ **Foto fehlt.** Gewünscht ist eines („mit Bildern!"), im Repo liegt
     * keines. Bis dahin zeigt die Kachel die neutrale Silhouette. Sobald das
     * Bild da ist: freigestellt als WebP unter `public/images/team/` ablegen
     * und den Pfad hier eintragen — sonst ist nichts zu tun.
     */
    photo: null,
    linkedinUrl: null,
  },
  {
    /** Am 17.08.2026 auf Ansage aufgenommen, Foto vom selben Tag. */
    name: "York",
    role: "Vertrieb IT & SaaS",
    /**
     * ⚠️ Formulierung auf Ansage („absoluter Vertriebsprofi im Bereich IT und
     * SaaS, also auch wirklich spezialisiert"), aber **ohne belegte Zahlen**:
     * weder Jahre noch Stationen liegen vor. Wer sie hat, trägt sie hier ein —
     * eine Zahl wirkt mehr als jedes Adjektiv.
     */
    bio: "Vertrieb ausschließlich in IT und SaaS: kennt Software-Verkaufszyklen, technische Entscheider und den Unterschied zwischen einer Demo und einem Projekt.",
    photo: "/images/team/york.webp",
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
