/**
 * Leistungsportfolio für `/leistungen`.
 *
 * HERKUNFT: Die sechs Leistungen und der Technologie-Stack stammen inhaltlich
 * aus der alten Leistungsseite (`src/views/legacy/Leistungen.tsx`) und sind beim
 * Relaunch am 05.08.2026 übernommen worden — der Auftrag lautete, dass alles,
 * was vorher da war, wieder erreichbar sein muss.
 *
 * GEKÜRZT am 12.08.2026 auf Ansage ("die Leistungen kannst du dramatisch
 * verkürzen, das ist ein bisschen random"). Vorher standen hier sechs
 * Leistungen mit je vier Stichpunkten — 24 Zeilen, die niemand liest, und in
 * denen Vision-Agenten neben Kommunikations-Agenten und Data-Warehouse
 * standen, als wären das gleichwertige Angebote.
 *
 * Jetzt vier Schritte in der Reihenfolge, in der sie stattfinden, je ein Satz.
 * Neu darin und ebenfalls auf Ansage: der Enterprise-Betrieb (AWS, Azure oder
 * eigene Hardware) als eigener Punkt — "dass es halt für Unternehmen auch
 * vernünftig gemacht werden muss".
 *
 * `bullets` bleibt im Typ, wird aber nicht mehr befüllt: die Komponente
 * rendert die Liste nur, wenn etwas drinsteht.
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
    title: "Prozess-Audit",
    description:
      "Wir sehen uns eure Abläufe an und sagen, an welcher Stelle Automatisierung etwas bringt — und an welcher nicht. Was sich nicht rechnet, sagen wir vorher.",
    bullets: [],
  },
  {
    step: "02",
    title: "KI-Agenten, die an euren Daten arbeiten",
    description:
      "Agenten, die an eure Systeme angeschlossen sind statt danebenzustehen: Dokumente, Datenbanken, Fachanwendungen. Ohne diesen Anschluss bleibt jedes Sprachmodell ein besserer Chat.",
    bullets: [],
  },
  {
    step: "03",
    title: "Enterprise-Betrieb: AWS, Azure oder im eigenen Haus",
    description:
      "Für Betriebe mit echten Anforderungen an Datenschutz und Nachweisbarkeit: Betrieb in europäischer Region über AWS oder Azure, mit Auftragsverarbeitungsvertrag — oder auf eigener Hardware, wenn die Daten das Haus nicht verlassen dürfen.",
    bullets: [],
  },
  {
    step: "04",
    title: "Betrieb und Wartung",
    description:
      "Was gebaut ist, muss laufen. Überwachung, Nachjustieren, Weiterentwicklung — und ein fester Ansprechpartner statt einer Ticketschlange.",
    bullets: [],
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
