import certconsultingLogo from "@/assets/certconsulting-logo.png";
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
 * ACHTUNG — Detailtexte sind Platzhalter:
 * Belegt sind nur die Angaben aus dem Briefing (Name, Firma, was gebaut wurde,
 * Dauer, eingesparte Stellen). Alles andere in `detail` ist bewusst ein als
 * "Platzhalter:" markierter Fragetext, der beschreibt, welche Information Ayham
 * nachliefern muss. Diese Absätze in `detail.sections[].paragraphs` ersetzen —
 * und den zugehörigen Eintrag in `openPoints` streichen, sobald ein Fall steht.
 * `phases`, `stack` und `quote` bleiben leer bzw. null, bis es dafür belegte
 * Angaben und (beim Zitat) eine schriftliche Freigabe des Kunden gibt.
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
      "Falldetails fehlen: Ausgangslage, Umfang des Setups, Alltag heute",
      "Eingesetzte Technik nicht dokumentiert",
      "Kein freigegebenes Zitat",
    ],
    detail: {
      intro:
        "In vier Wochen ein komplettes Claude-Code-Setup: Arbeitsumgebung, Regeln und " +
        "Automatisierungen für den täglichen Einsatz.",
      sections: [
        {
          heading: "Ausgangslage",
          paragraphs: [
            "Platzhalter: Wie hat das Team vor dem Projekt gearbeitet? Welche Aufgaben " +
              "liefen manuell, wie lange dauerte ein Durchlauf, wo entstanden Fehler?",
            "Platzhalter: Was war der Auslöser, ein Claude-Code-Setup aufzusetzen — und " +
              "welche Erwartung stand am Anfang?",
          ],
        },
        {
          heading: "Was wir gebaut haben",
          paragraphs: [
            "Aufgesetzt wurde ein komplettes Claude-Code-Setup: Arbeitsumgebung, Regeln " +
              "und Automatisierungen für den täglichen Einsatz. Nach vier Wochen stand es.",
            "Platzhalter: Welche Regeln und welche Automatisierungen genau? Für welche " +
              "wiederkehrenden Aufgaben ist das Setup gedacht, und wie wurde das Team " +
              "eingearbeitet?",
          ],
        },
        {
          heading: "Wie es heute läuft",
          paragraphs: [
            "Platzhalter: Wer arbeitet heute täglich mit dem Setup, und wofür? Welche " +
              "Aufgabe dauert jetzt wie lange, und was ist ganz weggefallen?",
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
      "Falldetails fehlen: Ausgangslage, Funktionsumfang, Alltag nach Livegang",
      "Eingesetzte Technik nicht dokumentiert",
      "Kein freigegebenes Zitat",
    ],
    detail: {
      intro:
        "In zwei Monaten von null auf live: ein komplettes SaaS zur " +
        "EU-Entgelttransparenzrichtlinie, inklusive Bezahlsystem und Abrechnung.",
      sections: [
        {
          heading: "Ausgangslage",
          paragraphs: [
            "Platzhalter: Was war der Ausgangspunkt für klargehalt.de — welche Idee, " +
              "welcher Markt, welche Frist? Was lag zu Projektbeginn schon vor und was " +
              "musste bei null anfangen?",
            "Platzhalter: Für wen ist das Produkt gedacht, und was hätten diese Kunden " +
              "ohne das SaaS tun müssen?",
          ],
        },
        {
          heading: "Was wir gebaut haben",
          paragraphs: [
            "Gebaut wurde ein komplettes SaaS zur EU-Entgelttransparenzrichtlinie, " +
              "inklusive Bezahlsystem und Abrechnung. Von null auf live in zwei Monaten.",
            "Platzhalter: Welche Funktionen umfasst das Produkt im Einzelnen? Wie läuft " +
              "eine Auswertung ab, und was war die schwierigste Anforderung?",
          ],
        },
        {
          heading: "Wie es heute läuft",
          paragraphs: [
            "Platzhalter: Wer nutzt das SaaS heute, wie viele Kunden bzw. Auswertungen " +
              "laufen darüber, und wie hat sich das Produkt seit dem Livegang " +
              "weiterentwickelt?",
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
      "Falldetails fehlen: Ausgangslage, Funktionsumfang, Alltag nach Livegang",
      "Eingesetzte Technik nicht dokumentiert",
      "Kein freigegebenes Zitat",
    ],
    detail: {
      intro:
        "In 40 Tagen ein komplettes Portal für die gesamte Objekt- und Kundenverwaltung — " +
        "der eingesparte Aufwand entspricht 1,5 Vollzeitstellen.",
      sections: [
        {
          heading: "Ausgangslage",
          paragraphs: [
            "Platzhalter: Womit hat das Team die Objekt- und Kundenverwaltung vor dem " +
              "Projekt erledigt? Welche Schritte liefen manuell, wie lange dauerte ein " +
              "Durchlauf, wo entstanden Fehler?",
            "Platzhalter: Was war der Auslöser, das Portal bauen zu lassen — und was " +
              "wäre passiert, wenn alles so geblieben wäre?",
          ],
        },
        {
          heading: "Was wir gebaut haben",
          paragraphs: [
            "Gebaut wurde ein komplettes Portal für die gesamte Objekt- und " +
              "Kundenverwaltung. Nach 40 Tagen war es live.",
            "Platzhalter: Welche Bereiche deckt das Portal im Einzelnen ab? Wer arbeitet " +
              "darin, welche Rollen gibt es, und was war die schwierigste Anforderung?",
          ],
        },
        {
          heading: "Wie es heute läuft",
          paragraphs: [
            "Der eingesparte Aufwand entspricht 1,5 Vollzeitstellen.",
            "Platzhalter: Welcher Vorgang dauert heute wie lange, was ist ganz " +
              "weggefallen, und wofür nutzt das Team die frei gewordene Zeit?",
          ],
        },
      ],
      phases: [],
      metrics: [
        { value: "40 Tage", label: "bis live" },
        { value: "1,5", label: "Vollzeitstellen eingespart" },
      ],
      stack: [],
      quote: null,
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
      "Falldetails fehlen: Ausgangslage, Funktionsumfang, Alltag nach Livegang",
      "Eingesetzte Technik nicht dokumentiert",
      "Kein freigegebenes Zitat",
    ],
    detail: {
      intro:
        "In 60 Tagen ein komplettes Zertifizierungsmanagement-Portal — vom Antrag bis " +
        "zum ausgestellten Zertifikat — und 1,2 eingesparte Vollzeitkräfte.",
      sections: [
        {
          heading: "Ausgangslage",
          paragraphs: [
            "Platzhalter: Wie lief der Weg vom Antrag bis zum Zertifikat vor dem " +
              "Projekt? Welche Schritte liefen manuell, wie lange dauerte ein Durchlauf, " +
              "wo entstanden Fehler?",
            "Platzhalter: Was war der Auslöser für das Projekt — Menge der Anträge, " +
              "Nachweispflichten, Personalsituation?",
          ],
        },
        {
          heading: "Was wir gebaut haben",
          paragraphs: [
            "Gebaut wurde ein komplettes Zertifizierungsmanagement-Portal, das den " +
              "gesamten Weg vom Antrag bis zum ausgestellten Zertifikat abbildet. Nach " +
              "60 Tagen war es live.",
            "Platzhalter: Welche Stationen durchläuft ein Antrag im Portal? Wer prüft, " +
              "wer gibt frei, wie entsteht das Zertifikat am Ende — und was war die " +
              "schwierigste Anforderung?",
          ],
        },
        {
          heading: "Wie es heute läuft",
          paragraphs: [
            "Der eingesparte Aufwand entspricht 1,2 Vollzeitkräften.",
            "Platzhalter: Wie viele Anträge laufen heute pro Monat durch das Portal, " +
              "wie lange dauert ein Vorgang jetzt, und was ist ganz weggefallen?",
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
      "Falldetails fehlen: Ausgangslage, Aufbau der Pipeline, Alltag heute",
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
            "Vor dem Projekt kostete die Recherche drei Stunden.",
            "Platzhalter: Wer hat diese drei Stunden investiert, und woraus bestand die " +
              "Arbeit genau? Welche Quellen wurden durchsucht, wie wurden Leads " +
              "qualifiziert, und wo gingen Treffer verloren?",
          ],
        },
        {
          heading: "Was wir gebaut haben",
          paragraphs: [
            "Gebaut wurde eine komplette Vertriebs-Pipeline mit täglicher " +
              "Lead-Generierung — über vier Unternehmen und neun Zielgruppen hinweg.",
            "Platzhalter: Wie unterscheiden sich die neun Zielgruppen, und wie wird ein " +
              "Lead als qualifiziert eingestuft? Was war beim Aufbau der Pipeline die " +
              "schwierigste Stelle?",
          ],
        },
        {
          heading: "Wie es heute läuft",
          paragraphs: [
            "Jeden Morgen um 8 Uhr liegen über 100 qualifizierte Leads bereit. Der " +
              "Schritt, der vorher drei Stunden gedauert hat, dauert heute zwei Minuten.",
            "Platzhalter: Was passiert nach den zwei Minuten — wie geht der Vertrieb mit " +
              "der Liste weiter um, und was hat sich dadurch im Tagesablauf verändert?",
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
    logo: null,
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
      "Falldetails fehlen: Ausgangslage, Umfang des Setups, Alltag heute",
      "Eingesetzte Technik nicht dokumentiert",
      "Kein freigegebenes Zitat",
    ],
    detail: {
      intro:
        "In drei Wochen ein komplettes Claude-Code-Setup: Arbeitsumgebung, Regeln und " +
        "Automatisierungen für den täglichen Einsatz.",
      sections: [
        {
          heading: "Ausgangslage",
          paragraphs: [
            "Platzhalter: Wie hat das Team vor dem Projekt gearbeitet? Welche Aufgaben " +
              "liefen manuell, wie lange dauerte ein Durchlauf, wo entstanden Fehler?",
            "Platzhalter: Was war der Auslöser, ein Claude-Code-Setup aufzusetzen — und " +
              "welche Erwartung stand am Anfang?",
          ],
        },
        {
          heading: "Was wir gebaut haben",
          paragraphs: [
            "Aufgesetzt wurde ein komplettes Claude-Code-Setup: Arbeitsumgebung, Regeln " +
              "und Automatisierungen für den täglichen Einsatz. Nach drei Wochen stand es.",
            "Platzhalter: Welche Regeln und welche Automatisierungen genau? Für welche " +
              "wiederkehrenden Aufgaben ist das Setup gedacht, und wie wurde das Team " +
              "eingearbeitet?",
          ],
        },
        {
          heading: "Wie es heute läuft",
          paragraphs: [
            "Platzhalter: Wer arbeitet heute täglich mit dem Setup, und wofür? Welche " +
              "Aufgabe dauert jetzt wie lange, und was ist ganz weggefallen?",
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
