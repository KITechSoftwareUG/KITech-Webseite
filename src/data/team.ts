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

import ayhamPortrait from "@/assets/ayham-portrait.webp";
import leonPortrait from "@/assets/leon-portrait.webp";

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
    photo: ayhamPortrait.src,
    linkedinUrl: "https://www.linkedin.com/in/ayham-alkhalil-66bb451b5",
    highlight: true,
  },
  {
    name: "Leon",
    role: "Entwickler",
    bio: "Entwickler mit praktischer Erfahrung in der Umsetzung moderner Software- und Automatisierungslösungen.",
    photo: leonPortrait.src,
    linkedinUrl: null,
  },
  {
    name: "Jörg",
    role: "Vertrieb",
    bio: "Vertriebsprofi mit über 30 Jahren Erfahrung im Verkauf und in der persönlichen Kundenbetreuung.",
    photo: null,
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
