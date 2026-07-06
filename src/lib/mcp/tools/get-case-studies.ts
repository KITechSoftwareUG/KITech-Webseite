import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const CASE_STUDIES = [
  {
    industry: "Immobilien / Bauunternehmen",
    problem: "Manuelle Zuordnung von Zahlungen zu Mietverträgen",
    solution: "Datenbank mit intelligenter Zuordnung",
    result: "50% Zeitersparnis bei voller Entlastung der Partner",
  },
  {
    industry: "Consulting / Zertifizierungsgesellschaft",
    problem: "Chaotische Terminverwaltung",
    solution: "CRM- und Auditsystem mit Outlook-Kalender-Schnittstelle",
    result: "40% Zeitersparnis, saubere Übersicht kritischer Themen",
  },
  {
    industry: "Handwerk / Glasbau",
    problem: "Ineffiziente Auftragsverarbeitung",
    solution: "Automatisierte Angebots- und Rechnungserstellung",
    result: "70% kürzerer Verkaufsprozess",
  },
];

export default defineTool({
  name: "get_case_studies",
  title: "KITech Case Studies",
  description:
    "Referenzprojekte von KITech Software mit Problem, Lösung und messbarem Ergebnis.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(CASE_STUDIES, null, 2) }],
  }),
});
