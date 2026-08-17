
/**
 * Echte Kundenstimmen. Gemeinsame Quelle für Startseite und Terminseite —
 * vorher lagen sie doppelt im Code.
 *
 * WICHTIG: Hier gehören ausschließlich Bewertungen hinein, die tatsächlich so
 * abgegeben wurden. Erfundene Bewertungen sind nach § 5b Abs. 3 UWG eine
 * unlautere geschäftliche Handlung und abmahnbar.
 *
 * Historie: Bis 02.08.2026 stand hier ein Eintrag "Frank Locke, Kanzlei Locke
 * und Partner". Den gibt es nicht — er stammte aus dem Premium-Redesign-Commit
 * und wurde auf Ansage entfernt. Neue Einträge bitte nur mit echtem Beleg.
 */
export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  /** Firmenlogo, sofern vorhanden. */
  logo: string | null;
  /** Abgegebene Sterne-Bewertung (1–5). */
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    quote: "Sehr tolle Zusammenarbeit",
    author: "Eugen Kretschmann",
    role: "Geschäftsführer KREMA Group",
    logo: "/images/referenzen/logos/krema.png",
    rating: 5,
  },
  {
    quote: "Hier versteht jemand die Nutzung von KI",
    author: "Dennis Mikyas",
    role: "Geschäftsführer NiImmo Holding GmbH",
    logo: "/images/referenzen/logos/niimmo.png",
    rating: 5,
  },
];

/*
 * Bis 04.08.2026 stand hier `reviewCountLabel = "40+ Bewertungen"` für die
 * Sammelangabe im Hero. Die Zeile ist auf Ansage entfallen — die Sterne stehen
 * jetzt pro Kunde auf den Ergebniskarten (Feld `rating` in
 * src/data/client-results.ts). Wird die Sammelangabe wieder gebraucht, muss die
 * Zahl belegbar sein: sie ist eine Werbeaussage, keine Schätzung.
 */
