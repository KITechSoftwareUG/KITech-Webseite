/**
 * Offene Stellen für `/karriere`.
 *
 * ⚠️ ACHTUNG — ALLE STELLEN HIER SIND PLATZHALTER (`isPlaceholder: true`).
 *
 * Sie sind am 05.08.2026 auf Ansage angelegt worden, damit das Stellenportal
 * Struktur und Gestaltung bekommt ("schreib mal ein paar Jobs rein, B2B Setter
 * oder so"). Die Zuschnitte sind plausibel, aber niemand hat sie ausgeschrieben.
 *
 * Was daraus folgt, solange `isPlaceholder` gesetzt ist:
 *   - `/karriere` und alle Detailseiten stehen auf `noindex` und stehen nicht in
 *     der Sitemap. Erfundene Stellenanzeigen in der Suche ziehen echte
 *     Bewerbungen auf Stellen, die es nicht gibt — das kostet Menschen Zeit, die
 *     sie gerade nicht haben.
 *   - Es wird KEIN `JobPosting`-JSON-LD ausgegeben. Damit landet nichts davon in
 *     Google for Jobs.
 * Beides schaltet sich von selbst um, sobald `isPlaceholder` entfällt — in
 * `src/app/karriere/page.tsx` ist dafür nichts nachzupflegen.
 *
 * VOR DEM LIVEGANG: echte Stellen eintragen oder die Route aus der Navigation
 * nehmen (`src/config/navigation.ts`).
 */

export interface Job {
  slug: string;
  title: string;
  /** Ein Satz für die Übersicht. */
  teaser: string;
  employmentType: "Vollzeit" | "Teilzeit" | "Werkstudium" | "Freelance";
  location: string;
  /** Wo gearbeitet wird. */
  workMode: "Remote" | "Hybrid" | "Vor Ort";
  /** Womit man rechnen kann. Leer lassen, wenn nichts Belastbares vorliegt. */
  compensation?: string;
  /** Einleitung auf der Detailseite. Zwei bis drei Sätze. */
  intro: string;
  tasks: string[];
  profile: string[];
  offer: string[];
  /** Solange gesetzt: noindex, kein JobPosting-Schema. Siehe Dateikopf. */
  isPlaceholder?: boolean;
}

export const jobs: Job[] = [
  {
    slug: "b2b-setter",
    title: "B2B Setter (Appointment Setting)",
    teaser:
      "Du führst die ersten Gespräche mit Geschäftsführern im Mittelstand und buchst die Termine, aus denen Projekte werden.",
    employmentType: "Vollzeit",
    location: "Hannover",
    workMode: "Remote",
    compensation: "Fixum plus Provision pro gehaltenem Termin",
    intro:
      "Wir reden mit Geschäftsführern, bei denen KI bisher nichts gebracht hat. Deine Aufgabe ist der erste dieser Gespräche: herausfinden, ob es überhaupt passt, und wenn ja, den Termin setzen. Kein Abarbeiten von Skripten — wer bei uns setzt, muss verstehen, wovon der andere redet.",
    tasks: [
      "Erstkontakt per Telefon, LinkedIn und E-Mail",
      "Qualifizieren: passt der Prozess, passt die Größe, passt der Zeitpunkt",
      "Termine für die Erstgespräche setzen und nachhalten",
      "Rückmeldungen aus den Gesprächen ins CRM zurückspielen",
    ],
    profile: [
      "Erfahrung im B2B-Outbound, idealerweise mit erklärungsbedürftigen Leistungen",
      "Du hältst ein Gespräch auch dann, wenn die ersten zwei Sätze schiefgehen",
      "Verhandlungssicheres Deutsch",
      "Selbstorganisiert — wir kontrollieren keine Anwesenheit, sondern Ergebnisse",
    ],
    offer: [
      "Vollständig remote, feste Termine nur für die Abstimmung",
      "Provision ohne Deckel",
      "Direkter Draht zur Geschäftsführung statt drei Ebenen dazwischen",
      "Einarbeitung an echten Projekten, nicht an Foliensätzen",
    ],
    isPlaceholder: true,
  },
  {
    slug: "sales-closer",
    title: "Sales Closer (KI-Projekte im Mittelstand)",
    teaser:
      "Du übernimmst die qualifizierten Termine, führst die Erstgespräche und bringst Projekte zum Abschluss.",
    employmentType: "Vollzeit",
    location: "Hannover",
    workMode: "Hybrid",
    compensation: "Fixum plus Beteiligung am Projektvolumen",
    intro:
      "Du bekommst Termine mit Entscheidern, die ein konkretes Problem haben. Im Gespräch geht es nicht darum, KI zu verkaufen, sondern darum, den Prozess dahinter zu verstehen und ehrlich einzuschätzen, ob sich Automatisierung rechnet. Manchmal ist die richtige Antwort ein Nein — das gehört dazu.",
    tasks: [
      "Erstgespräche führen und den wirtschaftlichen Hebel herausarbeiten",
      "Angebote gemeinsam mit der Technik zuschneiden",
      "Abschluss und Übergabe ins Projekt",
      "Bestandskunden weiterentwickeln",
    ],
    profile: [
      "Nachweisbare Abschlüsse im beratungsintensiven B2B-Vertrieb",
      "Du kannst technisch mitreden, ohne Entwickler zu sein",
      "Du sagst ab, wenn es nicht passt, statt es passend zu reden",
      "Verhandlungssicheres Deutsch",
    ],
    offer: [
      "Termine kommen aus dem eigenen Setting, keine Kaltakquise",
      "Beteiligung am Projektvolumen",
      "Zwei Tage Büro Hannover, Rest frei einteilbar",
    ],
    isPlaceholder: true,
  },
  {
    slug: "entwickler-ki-automatisierung",
    title: "Entwickler:in KI-Automatisierung",
    teaser:
      "Du baust die Automatisierungen, die bei unseren Kunden im Tagesgeschäft laufen — und hältst sie am Laufen.",
    employmentType: "Vollzeit",
    location: "Hannover",
    workMode: "Hybrid",
    intro:
      "Unsere Projekte enden nicht mit einem Prototyp, sondern mit etwas, das jeden Morgen läuft. Du baust Agenten, Schnittstellen und Datenstrecken — und bist danach die Person, die weiß, warum sie so gebaut sind.",
    tasks: [
      "Automatisierungen und KI-Agenten für Kundenprozesse bauen",
      "Anbindung an bestehende Systeme (APIs, Datenbanken, Dokumentenablagen)",
      "Betrieb und Überwachung dessen, was live ist",
      "Technische Einschätzung im Erstgespräch, wenn es konkret wird",
    ],
    profile: [
      "Sicher in Python und TypeScript",
      "Erfahrung mit Sprachmodellen jenseits von Prompt-Basteln",
      "Du dokumentierst, damit es in zwei Jahren noch wartbar ist",
      "Deutsch für die Kundenkommunikation",
    ],
    offer: [
      "Echte Projekte statt Demos, mit sichtbarem Ergebnis beim Kunden",
      "Entscheidungen über den Stack triffst du mit, nicht ein Gremium",
      "Zwei Tage Büro Hannover, Rest frei einteilbar",
    ],
    isPlaceholder: true,
  },
  {
    slug: "werkstudent-softwareentwicklung",
    title: "Werkstudent:in Softwareentwicklung",
    teaser:
      "Du arbeitest an echten Kundenprojekten mit, nicht an einer Spielwiese neben dem Betrieb.",
    employmentType: "Werkstudium",
    location: "Hannover",
    workMode: "Hybrid",
    compensation: "15–20 Stunden pro Woche, im Semester flexibel",
    intro:
      "Wir haben keine getrennte Werkstudenten-Aufgabenliste. Du bekommst ein Stück eines echten Projekts, mit Review und jemandem, der danebensteht — aber es geht danach in Betrieb.",
    tasks: [
      "Features in laufenden Kundenprojekten umsetzen",
      "Tests schreiben und bestehende Automatisierungen prüfen",
      "Datenaufbereitung für Auswertungen",
    ],
    profile: [
      "Studium der Informatik oder etwas Verwandtes",
      "Erste Erfahrung mit Python oder TypeScript",
      "Du fragst nach, statt drei Tage in die falsche Richtung zu bauen",
    ],
    offer: [
      "Im Semester flexible Zeiten, in der Klausurphase weniger",
      "Betreuung durch die Person, die den Code auch review",
      "Übernahme möglich, wenn es für beide passt",
    ],
    isPlaceholder: true,
  },
];

export function getJobBySlug(slug: string): Job | undefined {
  return jobs.find((job) => job.slug === slug);
}

/**
 * Steht auch nur eine Platzhalter-Stelle in der Liste, bleibt das ganze Portal
 * aus dem Index. Sonst wäre die Übersicht indexiert und würde auf erfundene
 * Stellen verlinken.
 */
export const jobsArePlaceholder = jobs.some((job) => job.isPlaceholder);
