/**
 * Leistungsportfolio für `/leistungen`.
 *
 * HERKUNFT: Die sechs Leistungen und der Technologie-Stack stammen inhaltlich
 * aus der alten Leistungsseite (`src/views/legacy/Leistungen.tsx`) und sind beim
 * Relaunch am 05.08.2026 übernommen worden — der Auftrag lautete, dass alles,
 * was vorher da war, wieder erreichbar sein muss.
 *
 * OFFEN: Die Formulierungen sind Altbestand, nicht Ayhams aktueller Wortlaut.
 * Ersetzt wird ausschließlich in dieser Datei; `Leistungen.tsx` bleibt dabei
 * unberührt. Zwei Dinge sind beim Übernehmen bewusst geändert worden:
 *   - Ansprache von "Sie" auf "ihr" gedreht. Die neu gebauten Seiten duzen ab
 *     dem Hero; eine Leistungsseite, die als einzige siezt, fällt auf.
 *   - Die Formulierung "Erreichen wir das ROI-Ziel nicht, zahlen Sie nicht" ist
 *     hier NICHT übernommen. Sie stand so auf der Alt-Seite, ist aber ein
 *     bindendes Zahlungsversprechen — das gehört freigegeben, bevor es wieder
 *     live geht, nicht beim Wiederaufbau der Seitenstruktur mit durchgereicht.
 */

export interface Service {
  /** Nummer im Ablauf. Ersetzt das Icon-Quadrat der Alt-Seite. */
  step: string;
  title: string;
  description: string;
  bullets: string[];
}

export const services: Service[] = [
  {
    step: "01",
    title: "Prozess-Audit und Potenzialanalyse",
    description:
      "Wir sehen uns eure Abläufe an und sagen, an welcher Stelle Automatisierung tatsächlich etwas bringt — und an welcher nicht.",
    bullets: [
      "Prozess-Aufnahme im Tagesgeschäft",
      "Automatisierungspotenzial pro Schritt",
      "Architektur-Entwurf",
      "Rechnung, was es bringt, vor dem Bauen",
    ],
  },
  {
    step: "02",
    title: "Individuelle Agenten und LLM-Orchestrierung",
    description:
      "Maßgeschneiderte KI-Agenten, die zusammenarbeiten statt nebeneinander zu laufen — in eurer Infrastruktur, nicht in fremder.",
    bullets: [
      "Multi-Agent-Systeme",
      "RAG auf euren eigenen Daten",
      "Betrieb lokal oder in der EU",
      "Anbindung an bestehende Systeme",
    ],
  },
  {
    step: "03",
    title: "Vision-Agenten",
    description:
      "Bilderkennung und visuelle Prüfung — von der Qualitätskontrolle bis zur Dokumentenverarbeitung.",
    bullets: [
      "Qualitätskontrolle",
      "Dokumentenerfassung (OCR)",
      "Objekterkennung",
      "Betrieb direkt an der Maschine",
    ],
  },
  {
    step: "04",
    title: "Kommunikations-Agenten",
    description:
      "Agenten für Kundenkommunikation und internes Wissen — über alle Kanäle hinweg, mit einem gemeinsamen Stand.",
    bullets: [
      "Kundenservice",
      "Wissensdatenbank, die Antworten gibt",
      "Vorgangsbearbeitung",
      "Mehrere Kanäle, ein System",
    ],
  },
  {
    step: "05",
    title: "Daten-Agenten und Plattform",
    description:
      "Das Fundament: Agenten, die eure Daten aufbereiten und zusammenführen. Ohne das trägt der Rest nicht.",
    bullets: [
      "Datenübernahme und -transformation",
      "Prüfung der Datenqualität",
      "Auswertungen und Dashboards",
      "Aufbau eines Data Warehouse",
    ],
  },
  {
    step: "06",
    title: "Betrieb und Wartung",
    description:
      "Was gebaut ist, muss laufen. Überwachung, Nachjustieren und Weiterentwicklung im laufenden Betrieb.",
    bullets: [
      "Überwachung im Betrieb",
      "Regelmäßiges Nachtrainieren",
      "Optimierung nach Messwerten",
      "Fester Ansprechpartner",
    ],
  },
];

/**
 * Der Technologie-Stack der Alt-Seite. Steht bewusst als schlichte Zeile am Ende
 * der Seite, nicht als Kachelraster: er ist ein Beleg, kein Verkaufsargument.
 */
export const techStack: Array<{ name: string; category: string }> = [
  { name: "Python", category: "Backend" },
  { name: "PyTorch", category: "ML-Framework" },
  { name: "Hugging Face", category: "Sprachmodelle" },
  { name: "LangChain", category: "Orchestrierung" },
  { name: "PostgreSQL", category: "Datenbank" },
  { name: "Docker", category: "Container" },
  { name: "Kubernetes", category: "Betrieb" },
  { name: "Azure / AWS", category: "Cloud" },
];
