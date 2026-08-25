/**
 * Inhalte der beiden Zielgruppen-Seiten `/solo` und `/enterprise`.
 *
 * HERKUNFT: verdichtet aus den beiden Alt-Seiten (`src/views/legacy/Solo.tsx`,
 * 655 Zeilen, und `src/views/legacy/Enterprise.tsx`, 977 Zeilen). Beide standen
 * seit der Next.js-Migration auf der Baustellenseite. Übernommen wurde, was
 * belegt oder unstrittig war; weggelassen wurde:
 *   - die Preistabellen der Solo-Seite (dort selbst als "[Preis folgt]" markiert),
 *   - die Platzhalter-Konzernlogos der Enterprise-Seite ("[Marke folgt]"),
 *   - die Zusicherung "Erreichen wir die Ziele nicht, zahlen Sie nicht". Das ist
 *     ein bindendes Zahlungsversprechen und gehört freigegeben, bevor es wieder
 *     live geht — nicht beim Wiederaufbau der Seitenstruktur mitgeschleppt.
 *
 * ANSPRACHE: `/solo` duzt, `/enterprise` sagt "ihr". Die Alt-Seite für
 * Unternehmen siezte als einzige Seite im Repo — auf einer Website, die ab dem
 * Hero duzt, fällt das auf.
 *
 * OFFEN: Ayhams aktueller Wortlaut ersetzt diese Texte. Nur diese Datei ändern,
 * `Segment.tsx` bleibt unberührt.
 */

export interface SegmentStep {
  number: string;
  title: string;
  description: string;
}

export interface SegmentCapability {
  title: string;
  description: string;
  /** Womit gebaut wird. Leer lassen, wenn es nicht zur Aussage beiträgt. */
  stack?: string;
}

export interface SegmentContent {
  slug: string;
  /** Kurzform für Tracking-Positionen und Schema-Titel. */
  key: "solo" | "enterprise";
  headline: string;
  /** Zweiter Teil der Überschrift, im weißen Marker gesetzt. */
  headlineHighlight: string;
  lead: string;
  /** Woran es hakt. Erkennbare Situationen, keine abstrakten Klagen. */
  painHeading: string;
  painPoints: string[];
  capabilityHeading: string;
  capabilities: SegmentCapability[];
  processHeading: string;
  process: SegmentStep[];
  /** Der passende Sales Letter unter /warum. */
  letter: { href: string; label: string };
  cta: { heading: string; text: string };
  /**
   * Überschrift und Zeile über den Artikelempfehlungen am Seitenfuß
   * (`WeiterlesenBlock`). Steht hier und nicht in der Vorlage, weil beide
   * Zielgruppen unterschiedlich angesprochen werden — dieselbe Regel wie beim
   * `cta` darunter: gleiche Form, andere Aussage.
   */
  wissen: { heading: string; text: string };
}

export const soloSegment: SegmentContent = {
  slug: "solo",
  key: "solo",
  headline: "Du hast die Tools.",
  headlineHighlight: "Es passiert trotzdem nichts.",
  lead: "Für Selbstständige und Teams bis sechs Leute, die KI im Alltag nutzen wollen statt sie nur zu abonnieren.",

  painHeading: "Kommt dir bekannt vor?",
  painPoints: [
    "Ein KI-Tool-Abo nach dem anderen ausprobiert – benutzt wird am Ende keins wirklich.",
    "Eine Agentur bezahlt, die eine schicke Präsentation geliefert hat und sonst nichts.",
    "Ein Wochenende mit Tutorials investiert – und danach trotzdem allein dagestanden.",
    "Du bist der Flaschenhals für jede Entscheidung, und daran hat kein Tool etwas geändert.",
  ],

  capabilityHeading: "Was am Ende bei dir steht.",
  capabilities: [
    {
      title: "Ein Setup für deinen Alltag",
      description:
        "Kein Beispielprojekt, sondern deine Fälle: die Aufgaben, die jede Woche wiederkommen.",
    },
    {
      title: "Automatisierungen, die du selbst verstehst",
      description:
        "Gebaut wird so, dass du es hinterher anfassen kannst. Sonst hast du nur eine neue Abhängigkeit.",
      stack: "n8n · Python",
    },
    {
      title: "Vorlagen für deine Branche",
      description:
        "Prompts und Bausteine, die zu deiner Arbeit passen — nicht die generische Sammlung aus dem Kurs.",
    },
    {
      title: "Direkter Draht",
      description: "Du schreibst der Person, die es gebaut hat. Keine Ticket-Warteschlange.",
    },
  ],

  processHeading: "Wie das abläuft.",
  process: [
    {
      number: "01",
      title: "Standortbestimmung",
      description:
        "Im kostenlosen 1:1-KI-Check schauen wir auf deinen echten Alltag: Wo bremst dich das gerade konkret aus?",
    },
    {
      number: "02",
      title: "Gemeinsame Umsetzung",
      description:
        "Wir arbeiten live an deinem echten Fall – deinem Setup, deinem Workflow, deinem Code – nicht an einem generischen Beispiel.",
    },
    {
      number: "03",
      title: "Eigenständig weiterarbeiten",
      description:
        "Das System bleibt bei dir. Du verstehst, kontrollierst und erweiterst es selbst – ohne dauerhaft von uns abhängig zu sein.",
    },
  ],

  letter: {
    href: "/warum-du-mit-ki-kein-geld-verdienst",
    label: "Warum du mit KI kein Geld verdienst",
  },

  cta: {
    heading: "Einmal an deinem echten Fall statt an einem Beispiel.",
    text: "Dreißig Minuten, in denen wir auf deinen Alltag schauen — nicht auf eine Präsentation.",
  },
  wissen: {
    heading: "Erst lesen, dann Werkzeuge kaufen.",
    text: "Woran es liegt, wenn die Lizenzen da sind und trotzdem nichts passiert.",
  },
};

export const enterpriseSegment: SegmentContent = {
  slug: "enterprise",
  key: "enterprise",
  headline: "Der Pilot lief.",
  headlineHighlight: "Danach kam nichts.",
  lead: "Für Unternehmen mit gewachsenen Prozessen, echten Compliance-Anforderungen und einer KI-Initiative, die im Pilotstadium hängt.",

  painHeading: "Woran es in Unternehmen hängt.",
  painPoints: [
    "Viele KI-Initiativen bleiben Pilotprojekte ohne belastbaren Wirtschaftlichkeitsnachweis – Budget fließt, Wirkung bleibt unklar.",
    "Unternehmensdaten wandern unkontrolliert in Public-Cloud-Tools außerhalb der EU – ohne Auftragsverarbeitungsvertrag, ohne Nachweis, wo sie liegen.",
    "Kein zentrales Monitoring, keine klaren Verantwortlichkeiten, nichts Auditierbares über Abteilungen hinweg.",
  ],

  capabilityHeading: "Wo es sich bei euch rechnet.",
  capabilities: [
    {
      title: "Prozessautomatisierung",
      description:
        "Wiederkehrende Abläufe wie Rechnungsprüfung, Auftragsbearbeitung und Reporting laufen automatisiert – geprüft werden nur noch die Ausnahmen.",
      stack: "n8n · Python · Supabase",
    },
    {
      title: "Wissensmanagement und RAG",
      description:
        "Internes Wissen wird durchsuchbar: Antworten auf Basis eurer eigenen Dokumente – mit Quellenangabe statt Halluzination.",
      stack: "Azure AI Search · RAG",
    },
    {
      title: "Kundenservice",
      description:
        "Erster Kontaktpunkt für Anfragen, Termine und Angebote – rund um die Uhr, mit sauberer Übergabe an euer Team, wenn es nötig wird.",
      stack: "n8n · CRM-Anbindung",
    },
    {
      title: "Datenanalyse",
      description:
        "Rohdaten aus ERP, CRM und Tabellen werden automatisch aufbereitet und in Auswertungen nutzbar, statt in Dateien zu versanden.",
      stack: "Python · Supabase",
    },
  ],

  processHeading: "Wie ein Projekt läuft.",
  process: [
    {
      number: "01",
      title: "Audit und Business Case",
      description:
        "Wir sehen uns eure Prozesse an, suchen die wirtschaftlich stärksten Hebel und rechnen sie in Euro durch – bevor eine Zeile Code entsteht.",
    },
    {
      number: "02",
      title: "Entwicklung gegen feste Ziele",
      description:
        "Gebaut wird gegen vorab vereinbarte Erfolgskriterien, in eurer Cloud- und Governance-Umgebung. Festpreis, keine offene Rechnung.",
    },
    {
      number: "03",
      title: "Betrieb und Nachweis",
      description:
        "Die Lösung geht in Produktion. Wir messen laufend, was sie bringt, überwachen Kosten und Governance und weisen den Beitrag nach.",
    },
  ],

  letter: {
    href: "/warum-unternehmen-mit-ki-kein-geld-verdienen",
    label: "Warum Unternehmen mit KI kein Geld verdienen",
  },

  cta: {
    heading: "Einen Prozess durchrechnen, bevor Budget fließt.",
    text: "Dreißig Minuten an einem konkreten Ablauf — am Ende steht eine Zahl, auch wenn sie gegen das Projekt spricht.",
  },
  wissen: {
    heading: "Was im laufenden Betrieb wirklich passiert.",
    text: "Betriebsfragen, die vor dem Pilot niemand stellt: Zuständigkeit nachts, Datenschutz, Hosting.",
  },
};
