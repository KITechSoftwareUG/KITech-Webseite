/**
 * Inhalte der beiden Sales-Letter-Funnels.
 *
 * Aufbau bewusst wie ein Sales Letter, nicht wie eine Leistungsseite:
 * Schmerz -> Problem -> warum die üblichen Antworten scheitern -> der eigentliche
 * Grund -> was stattdessen funktioniert -> Beweis -> CTA.
 *
 * ALLE Texte hier sind Platzhalter und als solche markiert (`isPlaceholder`).
 * Ayham liefert Rohtext oder Stichpunkte; ersetzt wird ausschließlich in dieser
 * Datei, die Komponente bleibt unberührt.
 *
 * Bilder: `image.src` erwartet einen Pfad unter /public (z. B.
 * "/images/ayham/schreibtisch.webp"). null => neutrale Platzhalterfläche.
 */

export interface SalesLetterBlock {
  /** Kleine Überzeile über der Block-Headline. */
  kicker?: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  /** Bild-Einschub als Rhythmus-Brecher. Seite wechselt blockweise. */
  image?: {
    src: string | null;
    alt: string;
    align: "left" | "right";
  };
}

export interface SalesLetterContent {
  slug: string;
  /** Für die Segmentierung: wohin führt der CTA am Ende? */
  audience: "solo" | "unternehmen";
  seo: {
    title: string;
    description: string;
  };
  hero: {
    badge: string;
    headline: string;
    /** Zweiter Teil der Headline, im weißen Marker gesetzt. */
    headlineHighlight: string;
    sub: string;
    ctaLabel: string;
    ctaHint: string;
  };
  blocks: SalesLetterBlock[];
  closing: {
    heading: string;
    paragraph: string;
    ctaLabel: string;
    ctaHint: string;
  };
  isPlaceholder?: boolean;
}

const placeholderParagraph =
  "Platzhalter. Hier steht der Fließtext von Ayham — direkt, konkret, ohne Weichspüler. Zwei bis vier Sätze pro Absatz, damit der Text auf dem Handy lesbar bleibt.";

export const soloLetter: SalesLetterContent = {
  slug: "warum-du-mit-ki-kein-geld-verdienst",
  audience: "solo",
  seo: {
    title: "Warum du mit KI kein Geld verdienst – KITech Software",
    description:
      "Platzhalter-Beschreibung: Der ehrliche Grund, warum die meisten mit KI keinen Cent verdienen — und was stattdessen funktioniert.",
  },
  hero: {
    badge: "Für Einzelunternehmer und Selbstständige",
    headline: "Warum du mit KI",
    headlineHighlight: "kein Geld verdienst.",
    sub: placeholderParagraph,
    ctaLabel: "Kostenlose KI-Bewertung sichern",
    ctaHint: "30 Minuten, unverbindlich",
  },
  blocks: [
    {
      kicker: "Das Problem",
      heading: "Platzhalter-Headline: Du hast die Tools. Es passiert trotzdem nichts.",
      paragraphs: [placeholderParagraph, placeholderParagraph],
      image: { src: null, alt: "Ayham Alkhalil", align: "right" },
    },
    {
      kicker: "Warum die üblichen Antworten scheitern",
      heading: "Platzhalter-Headline: Noch ein Prompt-Kurs löst dein Problem nicht.",
      paragraphs: [placeholderParagraph],
      bullets: [
        "Platzhalter: erster Grund, warum es nicht funktioniert",
        "Platzhalter: zweiter Grund",
        "Platzhalter: dritter Grund",
      ],
      image: { src: null, alt: "Ayham Alkhalil", align: "left" },
    },
    {
      kicker: "Der eigentliche Grund",
      heading: "Platzhalter-Headline: Der Punkt, den fast alle überspringen.",
      paragraphs: [placeholderParagraph, placeholderParagraph],
      image: { src: null, alt: "Ayham Alkhalil", align: "right" },
    },
    {
      kicker: "Was stattdessen funktioniert",
      heading: "Platzhalter-Headline: So gehen wir das gemeinsam an.",
      paragraphs: [placeholderParagraph],
      bullets: [
        "Platzhalter: Schritt 1",
        "Platzhalter: Schritt 2",
        "Platzhalter: Schritt 3",
      ],
    },
  ],
  closing: {
    heading: "Platzhalter: Wenn du das ernst meinst, reden wir.",
    paragraph: placeholderParagraph,
    ctaLabel: "Kostenlose KI-Bewertung sichern",
    ctaHint: "30 Minuten, unverbindlich",
  },
  isPlaceholder: true,
};

export const unternehmenLetter: SalesLetterContent = {
  slug: "warum-unternehmen-mit-ki-kein-geld-verdienen",
  audience: "unternehmen",
  seo: {
    title: "Warum Unternehmen mit KI kein Geld verdienen – KITech Software",
    description:
      "Platzhalter-Beschreibung: Warum KI-Projekte im Mittelstand im Pilotstadium sterben — und woran man es vorher erkennt.",
  },
  hero: {
    badge: "Für Geschäftsführung und Bereichsleitung",
    headline: "Warum Unternehmen mit KI",
    headlineHighlight: "kein Geld verdienen.",
    sub: placeholderParagraph,
    ctaLabel: "Kostenlose ROI-Analyse buchen",
    ctaHint: "30 Minuten, unverbindlich",
  },
  blocks: [
    {
      kicker: "Das Problem",
      heading: "Platzhalter-Headline: Der Pilot lief. Danach kam nichts.",
      paragraphs: [placeholderParagraph, placeholderParagraph],
      image: { src: null, alt: "Ayham Alkhalil", align: "right" },
    },
    {
      kicker: "Warum die üblichen Antworten scheitern",
      heading: "Platzhalter-Headline: Warum die große Beratung hier nicht hilft.",
      paragraphs: [placeholderParagraph],
      bullets: [
        "Platzhalter: erster Grund",
        "Platzhalter: zweiter Grund",
        "Platzhalter: dritter Grund",
      ],
      image: { src: null, alt: "Ayham Alkhalil", align: "left" },
    },
    {
      kicker: "Der eigentliche Grund",
      heading: "Platzhalter-Headline: Es scheitert nicht an der Technik.",
      paragraphs: [placeholderParagraph, placeholderParagraph],
      image: { src: null, alt: "Ayham Alkhalil", align: "right" },
    },
    {
      kicker: "Was stattdessen funktioniert",
      heading: "Platzhalter-Headline: ROI zuerst, Technik danach.",
      paragraphs: [placeholderParagraph],
      bullets: [
        "Platzhalter: Schritt 1",
        "Platzhalter: Schritt 2",
        "Platzhalter: Schritt 3",
      ],
    },
  ],
  closing: {
    heading: "Platzhalter: Rechnen wir es gemeinsam durch.",
    paragraph: placeholderParagraph,
    ctaLabel: "Kostenlose ROI-Analyse buchen",
    ctaHint: "30 Minuten, unverbindlich",
  },
  isPlaceholder: true,
};
