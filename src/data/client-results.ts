import certconsultingLogo from "@/assets/certconsulting-logo.png";
import nereoLogo from "@/assets/Nereo_Logo_Black_ColorDot.svg";
import pflegexpertsLogo from "@/assets/logo-pflegexperts.png";
import niimmoLogo from "@/assets/niimmo-logo.png";

/**
 * Kundendaten für das Ergebnisraster auf der Startseite (`ClientResults.tsx`)
 * sowie für Referenzen-Übersicht und Detailseiten (`ReferenceCard.tsx`,
 * `ReferenzDetail.tsx`).
 *
 * Die Startseitenkarte zeigt das ERGEBNIS prominent: die Kennzahl gross und
 * unterstrichen, dazu Beleglinks (`liveUrl` / `companyUrl`), Sterne und Foto.
 * Am 05.08.2026 war sie kurzzeitig auf eine reine Bewertungskarte ohne Zahlen
 * reduziert — das ist auf Ansage zurueckgenommen worden ("ganz prominent die
 * Ergebnisse zeigen"). Wer sie erneut entkernt, nimmt der Startseite ihren
 * einzigen harten Beweis.
 *
 * Inhalte stammen aus dem Briefing von Ayham (30.07.2026). Was noch fehlt oder
 * bestätigt werden muss, steht pro Eintrag in `openPoints` — daraus rendert die
 * Karte einen sichtbaren Marker. Leere/fehlende `openPoints` = freigegeben.
 *
 * Vor dem Livegang: jede Karte braucht die schriftliche Freigabe des Kunden für
 * Name, Foto und Zahlen.
 *
 * Fotos der Personen liegen unter `public/images/kunden/` als freigestellte WebPs
 * mit transparentem Hintergrund, auf die Person zugeschnitten, 520 px hoch.
 * Quelle waren die SVG-Freisteller von Ayham. Firmenlogos liegen dagegen als
 * Asset-Import in src/assets.
 *
 * WARTET AUF INHALT — Grynia:
 * `public/images/kunden/grynia.webp` liegt bereits bereit, aber es gibt noch keinen
 * Eintrag dafür. Ayham liefert die Angaben nach (04.08.2026). Solange Name, Firma
 * und die eine Zahl fehlen, wäre eine siebte Karte eine leere Hülle. Beim Ergänzen
 * mitziehen: "Sechs von über 50" in ClientResults.tsx und die Headline
 * "Sechs Fälle …" in src/views/Referenzen.tsx.
 *
 * ACHTUNG — was in den Detailtexten stehen darf:
 * Belegt sind die Angaben aus dem Briefing (Name, Firma, was gebaut wurde,
 * Dauer, eingesparte Stellen) und die geprüften Adressen.
 *
 * Bis zum 12.08.2026 standen in `detail.sections[].paragraphs` als
 * "Platzhalter:" markierte Fragetexte — sichtbar für jeden Besucher der
 * Detailseiten. Sie sind auf Ansage durch Fließtext ersetzt worden, und zwar
 * nach einer Regel, die hier bleibt:
 *
 *   Über den KUNDEN steht nur das, was im Briefing belegt ist. Was allgemein
 *   gilt — wie eine solche Aufgabe aussieht, wie wir arbeiten, was eine
 *   Rechtslage verlangt — ist als allgemeine Aussage formuliert und nicht als
 *   Behauptung über diesen Betrieb. Sätze wie "vorher lief alles über
 *   Excel-Listen" stehen deshalb NICHT da: das mag naheliegen, weiß aber
 *   niemand.
 *
 * Die Ausgangslage beim Kunden fehlt damit weiterhin in fast allen Fällen —
 * genau das steht in `openPoints`, und genau deshalb bleiben die Detailseiten
 * auf `noindex`. Wer die Angaben nachliefert, ergänzt hier einen Abschnitt
 * "Ausgangslage" und streicht den zugehörigen offenen Punkt.
 *
 * `phases` und `stack` bleiben leer, `quote` bleibt null, bis es dafür belegte
 * Angaben und (beim Zitat) eine schriftliche Freigabe des Kunden gibt. Einzige
 * Ausnahme: NiImmo — dort ist das Zitat über src/data/testimonials.ts belegt.
 * Nichts hier erfinden — auch nichts Naheliegendes.
 */

export interface ClientResult {
  /** URL-Segment für die Detailseite /referenzen/:slug */
  slug: string;
  /** Firmenname oder, solange der nicht freigegeben ist, die Branche. */
  company: string;
  logo: string | null;
  /**
   * Das GEBAUTE Produkt, öffentlich erreichbar. Der stärkste Beleg, den eine
   * Karte tragen kann: nicht "wir haben ein Portal gebaut", sondern "hier ist es".
   * Nur eintragen, wenn die Adresse tatsächlich das Ergebnis dieses Projekts
   * zeigt — nicht die Firmenwebsite des Kunden, dafür ist `companyUrl` da.
   * Alle Einträge am 05.08.2026 per Abruf geprüft (HTTP 200 + passender Titel).
   */
  liveUrl: string | null;
  /** Website des Kunden. Belegt, dass es die Firma wirklich gibt. */
  companyUrl: string | null;
  /**
   * Blendet den Fall auf der STARTSEITE aus; in der Referenz-Uebersicht und auf
   * der Detailseite bleibt er sichtbar. Gesteuert ueber `homeClientResults`
   * am Dateiende.
   *
   * Aktuell nur bei klargehalt gesetzt (Leon Battel) — auf Ansage vom
   * 05.08.2026, ohne Begruendung im Briefing. Nicht ohne Ruecksprache
   * entfernen.
   */
  hideOnHome?: boolean;
  person: {
    name: string;
    /** Rolle beim Kunden, optional. */
    role: string | null;
    /** Pfad unter /public. null => Initialen-Platzhalter. */
    photo: string | null;
  };
  /**
   * Sterne-Bewertung dieses Kunden, 1–5. Erscheint auf der Bewertungskarte.
   *
   * Steht seit 05.08.2026 überall auf 5 — so von Ayham vorgegeben ("Alle
   * Bewertungen erhalten 5 von 5 Sternen"). Vorher stand hier durchgängig 4.
   *
   * ACHTUNG: Das ist eine Bewertung, die einer namentlich genannten Person
   * zugeschrieben wird, und sie steht laut Vorgabe ausdrücklich für die
   * jeweilige Kundenaussage — nicht allgemein für die Zusammenarbeit.
   * Schriftlich belegt sind bisher nur Dennis Mikyas und Eugen Kretschmann
   * mit je 5 Sternen (siehe src/data/testimonials.ts). Für die übrigen Kunden
   * braucht es vor dem Livegang eine echte, dokumentierte Bewertung —
   * erfundene Bewertungen sind nach § 5b Abs. 3 UWG abmahnbar.
   */
  rating: number;
  /**
   * Der kurze Bewertungssatz auf der Karte, wörtlich so abgegeben. Genau ein
   * Satz — keine mehrzeiligen Testimonials, das ist Vorgabe.
   *
   * `null`, solange kein belegter Satz vorliegt: die Karte zeigt dann Name,
   * Firma und Sterne, aber keine Aussage. Hier NICHTS erfinden und auch nichts
   * aus `summary` oder `headline` umformulieren — das wäre eine Bewertung, die
   * dem Kunden in den Mund gelegt wird (§ 5b Abs. 3 UWG).
   *
   * TODO (Ayham): Sätze für Benjamin Ronneburg, Leon Battel, Jan Uwe Pane,
   * Felix Bechtoldt und Mike Letzgus nachliefern.
   */
  review: string | null;
  /** Die eine radikale Zahl, groß gesetzt. */
  headline: {
    value: string;
    label: string;
  };
  /** Was gebaut wurde, ein bis zwei Sätze. */
  summary: string;
  /** Projektdauer als fertiger String, z. B. "40 Tage bis live". */
  duration: string | null;
  /** Vorher/Nachher-Paar, nur wo es einen echten Prozessvergleich gibt. */
  before: string | null;
  after: string | null;
  /** Zusätzliche Kennzahl unter dem Vorher/Nachher. */
  extra: string | null;
  /** Was an diesem Eintrag noch offen ist. Leer => freigegeben. */
  openPoints?: string[];
  /**
   * Inhalt der Detailseite unter /referenzen/<slug>. Fehlt das Feld, zeigt die
   * Detailseite nur die Kartendaten plus einen Hinweis, dass der Fall gerade
   * aufbereitet wird — statt einer leeren Seite.
   */
  detail?: ClientResultDetail;
}

/** Ein Abschnitt der Fallbeschreibung: Überschrift plus Absätze. */
export interface DetailSection {
  heading: string;
  paragraphs: string[];
  /** Optionale Aufzählung unter den Absätzen. */
  bullets?: string[];
}

/** Ein Schritt im Projektverlauf. */
export interface DetailPhase {
  /** z. B. "Woche 1–2" */
  period: string;
  title: string;
  description: string;
}

/** Eine Kennzahl im Ergebnis-Raster der Detailseite. */
export interface DetailMetric {
  value: string;
  label: string;
}

export interface ClientResultDetail {
  /** Ein Satz als Aufmacher der Detailseite. */
  intro: string;
  /** Ausgangslage, Aufgabe, Lösung — je ein Abschnitt. */
  sections: DetailSection[];
  /** Projektverlauf als Zeitleiste. Leer lassen, wenn nicht belegbar. */
  phases: DetailPhase[];
  /** Ergebnis-Kennzahlen, ergänzend zur Kernzahl der Karte. */
  metrics: DetailMetric[];
  /** Eingesetzte Technik. */
  stack: string[];
  /** Wörtliches Zitat des Kunden — nur mit echter Freigabe. */
  quote: { text: string; author: string } | null;
}

export const clientResults: ClientResult[] = [
  {
    slug: "pflegexperts-claude-code",
    company: "Pflegexperts",
    logo: pflegexpertsLogo.src,
    liveUrl: null,
    companyUrl: "https://pflegexperts.de",
    person: {
      name: "Benjamin Ronneburg",
      role: null,
      photo: "/images/kunden/benjamin-ronneburg.webp",
    },
    rating: 5,
    review: null,
    headline: { value: "4 Wochen", label: "bis Claude Code einsatzbereit war" },
    summary:
      "Bei Pflegexperts steht Claude Code mit eingerichteter Arbeitsumgebung, klaren Regeln und Automatisierungen für die tägliche Arbeit.",
    duration: null,
    before: null,
    after: null,
    extra: null,
    openPoints: [
      "Ausgangslage beim Kunden nicht dokumentiert",
      "Eingesetzte Technik nicht dokumentiert",
      "Kein freigegebenes Zitat",
    ],
    detail: {
      intro:
        "In vier Wochen ein komplettes Claude-Code-Setup: Arbeitsumgebung, Regeln und " +
        "Automatisierungen für den täglichen Einsatz.",
      sections: [
        {
          heading: "Was wir gebaut haben",
          paragraphs: [
            "Aufgesetzt wurde ein komplettes Claude-Code-Setup: Arbeitsumgebung, Regeln " +
              "und Automatisierungen für den täglichen Einsatz. Nach vier Wochen stand es " +
              "und wurde benutzt.",
            "Ein solches Setup besteht aus drei Teilen. Die Arbeitsumgebung ist der Rahmen: " +
              "womit gearbeitet wird, worauf zugegriffen werden darf, wo Ergebnisse landen. " +
              "Die Regeln sind schriftlich hinterlegte Vorgaben — wie hier gearbeitet wird, " +
              "was ohne Rückfrage passieren darf und was ausdrücklich nicht. Die " +
              "Automatisierungen übernehmen die wiederkehrenden Handgriffe, die vorher " +
              "jedes Mal jemand selbst gemacht hat.",
          ],
        },
        {
          heading: "Warum ein Setup und nicht nur ein Zugang",
          paragraphs: [
            "Ein Werkzeugzugang ist in fünf Minuten eingerichtet und verändert wenig. " +
              "Ohne hinterlegte Regeln beantwortet ein Sprachmodell jede Aufgabe nach " +
              "eigenem Ermessen — es ist dann ein besserer Chat, kein Bestandteil der " +
              "Arbeit. Was den Unterschied macht, ist der Aufbau darum herum.",
            "Genau deshalb ist dieser Aufbau bei uns die eigentliche Arbeit. Er ist auch " +
              "der Grund, warum die Einführung an dieser Stelle vier Wochen gedauert hat " +
              "und nicht einen Nachmittag.",
          ],
        },
      ],
      phases: [],
      metrics: [{ value: "4 Wochen", label: "bis zum fertigen Setup" }],
      stack: [],
      quote: null,
    },
  },
  {
    slug: "klargehalt-saas",
    company: "klargehalt.de",
    logo: null,
    liveUrl: "https://klargehalt.de",
    companyUrl: null,
    hideOnHome: true,
    person: {
      name: "Leon Battel",
      role: null,
      photo: "/images/kunden/leon-battel.webp",
    },
    rating: 5,
    review: null,
    headline: { value: "2 Monate", label: "von der ersten Zeile bis zum Livegang" },
    summary:
      "SaaS zur EU-Entgelttransparenzrichtlinie gebaut — Bezahlsystem und Abrechnung inklusive.",
    duration: null,
    before: null,
    after: null,
    extra: null,
    openPoints: [
      "Funktionsumfang im Einzelnen nicht dokumentiert",
      "Eingesetzte Technik nicht dokumentiert",
      "Kein freigegebenes Zitat",
    ],
    detail: {
      intro:
        "In zwei Monaten von null auf live: ein komplettes SaaS zur " +
        "EU-Entgelttransparenzrichtlinie, inklusive Bezahlsystem und Abrechnung.",
      sections: [
        {
          heading: "Worum es geht",
          paragraphs: [
            "Die EU-Entgelttransparenzrichtlinie verpflichtet Arbeitgeber, offenzulegen, " +
              "wie Gehälter zustande kommen: Beschäftigte können Auskunft über das " +
              "Entgeltniveau vergleichbarer Tätigkeiten verlangen, und ab bestimmten " +
              "Betriebsgrößen muss über Entgeltunterschiede berichtet werden.",
            "Das ist eine Aufgabe, die sich schlecht einmalig erledigen lässt. Sie " +
              "wiederholt sich, sie braucht saubere Daten, und die Auswertung muss " +
              "nachvollziehbar bleiben — der klassische Fall für ein Produkt statt für " +
              "eine Tabelle.",
          ],
        },
        {
          heading: "Was wir gebaut haben",
          paragraphs: [
            "Gebaut wurde ein komplettes SaaS zur EU-Entgelttransparenzrichtlinie, " +
              "inklusive Bezahlsystem und Abrechnung. Von null auf live in zwei Monaten.",
            "Dass Bezahlung und Abrechnung dazugehören, ist der Teil, der solche Projekte " +
              "üblicherweise aufhält: Ein Produkt, das rechnen kann, aber kein Geld " +
              "einnimmt, ist kein Produkt. Beides war zum Livegang fertig.",
          ],
        },
        {
          heading: "Wo es läuft",
          paragraphs: [
            "Das Ergebnis steht öffentlich unter klargehalt.de und ist der belastbarste " +
              "Beleg, den dieser Fall hat: keine Beschreibung eines Projekts, sondern das " +
              "Produkt selbst.",
          ],
        },
      ],
      phases: [],
      metrics: [{ value: "2 Monate", label: "von null auf live" }],
      stack: [],
      quote: null,
    },
  },
  {
    slug: "niimmo-portal",
    company: "NiImmo Wohnungsbaugesellschaft",
    logo: niimmoLogo.src,
    liveUrl: "https://dashboard.niimmo.de",
    companyUrl: "https://niimmo.de",
    person: {
      name: "Dennis Mikyas",
      role: null,
      photo: null,
    },
    rating: 5,
    // Belegt: identischer Wortlaut wie in src/data/testimonials.ts.
    review: "Hier versteht jemand die Nutzung von KI.",
    headline: { value: "1,5", label: "Vollzeitstellen an eingespartem Aufwand" },
    summary:
      "Nach 40 Tagen lief die gesamte Objekt- und Kundenverwaltung in einem Portal.",
    duration: "40 Tage bis live",
    before: null,
    after: null,
    extra: null,
    openPoints: [
      "Ausgangslage beim Kunden nicht dokumentiert",
      "Eingesetzte Technik nicht dokumentiert",
    ],
    detail: {
      intro:
        "In 40 Tagen ein komplettes Portal für die gesamte Objekt- und Kundenverwaltung — " +
        "der eingesparte Aufwand entspricht 1,5 Vollzeitstellen.",
      sections: [
        {
          heading: "Was wir gebaut haben",
          paragraphs: [
            "Gebaut wurde ein komplettes Portal für die gesamte Objekt- und " +
              "Kundenverwaltung. Nach 40 Tagen war es live.",
            "„Gesamte“ ist dabei der entscheidende Teil. Objekte und Kunden getrennt zu " +
              "verwalten ist einfach; der Aufwand entsteht dort, wo beides " +
              "zusammengehört und heute noch von Hand zusammengetragen wird. Das Portal " +
              "führt diese Stellen an einem Ort zusammen, statt eine weitere Insel " +
              "danebenzustellen.",
          ],
        },
        {
          heading: "Was dabei herauskam",
          paragraphs: [
            "Der eingesparte Aufwand entspricht 1,5 Vollzeitstellen. Die Zahl beschreibt " +
              "eine Aufwands-Äquivalenz — also die Arbeitszeit, die vorher für diese " +
              "Vorgänge gebunden war und heute nicht mehr anfällt.",
            "Das Portal ist unter dashboard.niimmo.de im Einsatz.",
          ],
        },
      ],
      phases: [],
      metrics: [
        { value: "40 Tage", label: "bis live" },
        { value: "1,5", label: "Vollzeitstellen eingespart" },
      ],
      stack: [],
      /* Belegt: identischer Wortlaut wie in src/data/testimonials.ts, dort mit
         Rolle. Das einzige Zitat, das auf einer Detailseite stehen darf. */
      quote: {
        text: "Hier versteht jemand die Nutzung von KI",
        author: "Dennis Mikyas, Geschäftsführer NiImmo Holding GmbH",
      },
    },
  },
  {
    slug: "zertifizierungsmanagement-portal",
    company: "cert consulting Pane",
    logo: certconsultingLogo.src,
    liveUrl: "https://ccp-portal.de",
    companyUrl: null,
    person: {
      name: "Jan Uwe Pane",
      role: null,
      photo: null,
    },
    rating: 5,
    review: null,
    headline: { value: "1,2", label: "Vollzeitkräfte an eingespartem Aufwand" },
    summary:
      "Antrag rein, Zertifikat raus — der ganze Weg dazwischen steckt in einem Portal.",
    duration: "60 Tage bis live",
    before: null,
    after: null,
    extra: null,
    openPoints: [
      "Ausgangslage beim Kunden nicht dokumentiert",
      "Eingesetzte Technik nicht dokumentiert",
      "Kein freigegebenes Zitat",
    ],
    detail: {
      intro:
        "In 60 Tagen ein komplettes Zertifizierungsmanagement-Portal — vom Antrag bis " +
        "zum ausgestellten Zertifikat — und 1,2 eingesparte Vollzeitkräfte.",
      sections: [
        {
          heading: "Was wir gebaut haben",
          paragraphs: [
            "Gebaut wurde ein komplettes Zertifizierungsmanagement-Portal, das den " +
              "gesamten Weg vom Antrag bis zum ausgestellten Zertifikat abbildet. Nach " +
              "60 Tagen war es live.",
            "Eine Zertifizierung ist kein Vorgang, sondern eine Kette: Antrag, " +
              "Unterlagenprüfung, Rückfragen, Nachweise, Entscheidung, Ausstellung, " +
              "Ablage. Jede Übergabe dazwischen ist eine Stelle, an der etwas liegen " +
              "bleibt oder doppelt erfasst wird. Das Portal bildet die Kette am Stück " +
              "ab, statt einzelne Schritte zu digitalisieren und die Übergaben von Hand " +
              "zu lassen.",
          ],
        },
        {
          heading: "Was dabei herauskam",
          paragraphs: [
            "Der eingesparte Aufwand entspricht 1,2 Vollzeitkräften — die Arbeitszeit, " +
              "die vorher für diese Bearbeitung gebunden war.",
            "Das Portal ist unter ccp-portal.de im Einsatz.",
          ],
        },
      ],
      phases: [],
      metrics: [
        { value: "60 Tage", label: "bis live" },
        { value: "1,2", label: "Vollzeitkräfte eingespart" },
      ],
      stack: [],
      quote: null,
    },
  },
  {
    slug: "lead-pipeline",
    company: "4 Unternehmen, 9 Zielgruppen",
    logo: null,
    liveUrl: null,
    companyUrl: null,
    person: {
      name: "Felix Bechtoldt",
      role: null,
      photo: null,
    },
    rating: 5,
    review: null,
    headline: { value: "100+", label: "qualifizierte Leads, jeden Morgen um 8" },
    summary:
      "Eine Vertriebs-Pipeline über vier Unternehmen und neun Zielgruppen bringt die Recherche von drei Stunden auf zwei Minuten.",
    duration: null,
    before: "3 Stunden Recherche",
    after: "2 Minuten",
    extra: null,
    openPoints: [
      "Qualifizierungskriterien und Quellen nicht dokumentiert",
      "Eingesetzte Technik nicht dokumentiert",
      "Kein freigegebenes Zitat",
    ],
    detail: {
      intro:
        "Eine komplette Vertriebs-Pipeline über vier Unternehmen und neun Zielgruppen " +
        "hinweg — 100+ qualifizierte Leads liegen jeden Morgen um 8 Uhr bereit.",
      sections: [
        {
          heading: "Ausgangslage",
          paragraphs: [
            "Vor dem Projekt kostete die Recherche drei Stunden — täglich, bevor das " +
              "erste Gespräch überhaupt stattfinden konnte.",
            "Das ist die Sorte Aufwand, die in keiner Auswertung auftaucht: Sie " +
              "verschwindet nicht, sie wird nur nicht gezählt. Bezahlt wird ein Vertrieb " +
              "für Gespräche, nicht für das Zusammensuchen von Adressen.",
          ],
        },
        {
          heading: "Was wir gebaut haben",
          paragraphs: [
            "Gebaut wurde eine komplette Vertriebs-Pipeline mit täglicher " +
              "Lead-Generierung — über vier Unternehmen und neun Zielgruppen hinweg.",
            "Neun Zielgruppen heißt neun verschiedene Vorstellungen davon, was ein " +
              "brauchbarer Kontakt ist. Die Pipeline hält diese Unterscheidung aus: Sie " +
              "recherchiert nicht einfach breiter, sondern sortiert vor, sodass am Ende " +
              "eine Liste steht, mit der sofort gearbeitet werden kann.",
          ],
        },
        {
          heading: "Wie es heute läuft",
          paragraphs: [
            "Jeden Morgen um 8 Uhr liegen über 100 qualifizierte Leads bereit. Der " +
              "Schritt, der vorher drei Stunden gedauert hat, dauert heute zwei Minuten.",
            "Der eigentliche Gewinn ist dabei nicht die gesparte Zeit, sondern der " +
              "Zeitpunkt: Der Arbeitstag beginnt mit dem ersten Gespräch statt mit " +
              "Vorbereitung.",
          ],
        },
      ],
      phases: [],
      metrics: [
        { value: "100+", label: "qualifizierte Leads, täglich um 8 Uhr" },
        { value: "2 Minuten", label: "statt 3 Stunden Recherche" },
        { value: "4", label: "Unternehmen" },
        { value: "9", label: "Zielgruppen" },
      ],
      stack: [],
      quote: null,
    },
  },
  {
    slug: "nereo-claude-code",
    company: "Nereo",
    logo: nereoLogo.src,
    liveUrl: null,
    companyUrl: null,
    person: {
      name: "Mike Letzgus",
      role: null,
      photo: null,
    },
    rating: 5,
    review: null,
    headline: { value: "3 Wochen", label: "Setup bei Nereo, fertig zum Arbeiten" },
    summary:
      "Für Nereo eine Arbeitsumgebung aufgesetzt, feste Regeln hinterlegt und Automatisierungen für den Alltag gebaut.",
    duration: null,
    before: null,
    after: null,
    extra: null,
    openPoints: [
      "Ausgangslage beim Kunden nicht dokumentiert",
      "Eingesetzte Technik nicht dokumentiert",
      "Kein freigegebenes Zitat",
    ],
    detail: {
      intro:
        "In drei Wochen ein komplettes Claude-Code-Setup: Arbeitsumgebung, Regeln und " +
        "Automatisierungen für den täglichen Einsatz.",
      sections: [
        {
          heading: "Was wir gebaut haben",
          paragraphs: [
            "Aufgesetzt wurde ein komplettes Claude-Code-Setup: Arbeitsumgebung, Regeln " +
              "und Automatisierungen für den täglichen Einsatz. Nach drei Wochen stand es.",
            "Die Arbeitsumgebung legt fest, womit gearbeitet wird und worauf zugegriffen " +
              "werden darf. Die Regeln halten schriftlich fest, wie hier gearbeitet wird " +
              "und was ohne Rückfrage passieren darf. Die Automatisierungen übernehmen " +
              "die wiederkehrenden Handgriffe.",
          ],
        },
        {
          heading: "Warum drei Wochen und nicht drei Tage",
          paragraphs: [
            "Der Zugang selbst ist an einem Nachmittag eingerichtet. Die Zeit geht in " +
              "den Teil, den man nicht kaufen kann: die Regeln so zu fassen, dass sie zur " +
              "tatsächlichen Arbeitsweise passen, und die Automatisierungen so zu bauen, " +
              "dass sie auch dann noch laufen, wenn niemand daneben sitzt.",
            "Ohne diesen Teil bleibt ein Sprachmodell ein besserer Chat — hilfreich, " +
              "aber ohne Wirkung auf den Ablauf.",
          ],
        },
      ],
      phases: [],
      metrics: [{ value: "3 Wochen", label: "bis zum fertigen Setup" }],
      stack: [],
      quote: null,
    },
  },
];

/**
 * Die Faelle, die auf der STARTSEITE erscheinen — Reihenfolge = Reihenfolge im
 * Raster (zwei Spalten, also Index 1 = oben rechts).
 *
 * Abgeleitet aus `clientResults`, damit beide Listen nicht auseinanderlaufen:
 * wer einen Fall ergaenzt, hat ihn automatisch auch hier. Ausgeblendet wird
 * ausschliesslich ueber `hideOnHome` am jeweiligen Eintrag.
 */
export const homeClientResults: ClientResult[] = clientResults.filter(
  (result) => !result.hideOnHome
);
