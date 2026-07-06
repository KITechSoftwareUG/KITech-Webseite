import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const SERVICES = [
  {
    slug: "ki-audit",
    name: "KI-Audit & Potenzialanalyse",
    summary:
      "Objektive Bewertung der KI-Reife. Datenqualität, Prozesseignung, Machbarkeit, ROI-Kalkulation.",
  },
  {
    slug: "custom-llm",
    name: "Custom LLM-Integrationen",
    summary:
      "Maßgeschneiderte Sprachmodell-Lösungen mit RAG, Fine-Tuning, EU-/On-Prem-Deployment.",
  },
  {
    slug: "computer-vision",
    name: "Computer Vision",
    summary:
      "Bilderkennung für Qualitätskontrolle, OCR, Objekterkennung, Edge-Deployment (<100ms).",
  },
  {
    slug: "assistenten",
    name: "Intelligente Assistenten",
    summary:
      "KI-Chatbots und Wissensassistenten für Kundenservice und interne Prozesse.",
  },
  {
    slug: "datenplattform",
    name: "Datenplattform-Aufbau",
    summary:
      "Data Warehousing, ETL-Pipelines, Datenqualitätsmanagement, Analytics-Dashboards.",
  },
  {
    slug: "mlops",
    name: "MLOps & Wartung",
    summary:
      "Modell-Monitoring, automatisiertes Retraining, Performance-Optimierung, 24/7 Support.",
  },
];

export default defineTool({
  name: "get_services",
  title: "KITech Leistungen",
  description:
    "Liste aller Leistungen und Beratungsangebote von KITech Software. Optional nach Slug filterbar.",
  inputSchema: {
    slug: z
      .string()
      .optional()
      .describe(
        "Optionaler Slug einer einzelnen Leistung (z. B. 'ki-audit', 'custom-llm', 'computer-vision').",
      ),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ slug }) => {
    const data = slug ? SERVICES.filter((s) => s.slug === slug) : SERVICES;
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  },
});
