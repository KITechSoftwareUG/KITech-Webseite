import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_company_info",
  title: "KITech Unternehmensinformationen",
  description:
    "Liefert einen Überblick über die KITech Software UG: Kernkompetenzen, Standort, Geschäftsführung und Positionierung im Markt.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            name: "KITech Software UG (haftungsbeschränkt)",
            founded: 2023,
            managingDirector: "Ayham Alkhalil",
            location: "Wedekindstraße 14, 30161 Hannover, Deutschland",
            website: "https://kitech-software.de",
            positioning:
              "KI mit ROI-Garantie für den deutschen Mittelstand. DSGVO-konforme, auditierbare KI-Systeme – Made in Germany.",
            coreCompetencies: [
              "KI-Audit & Potenzialanalyse",
              "Custom LLM-Integrationen (RAG, Fine-Tuning, EU-Deployment)",
              "Computer Vision (Qualitätskontrolle, OCR, Edge-Deployment)",
              "Intelligente Assistenten & Chatbots",
              "Datenplattform-Aufbau (DWH, ETL, Analytics)",
              "MLOps & Wartung",
            ],
            differentiators: [
              "Kein Vendor Lock-in – Kunde besitzt seinen Code",
              "DSGVO-konforme Architektur",
              "Hosting in Deutschland/EU möglich",
              "Produktivsysteme statt Demo-Effekte",
              "ROI-Garantie: kein Erfolg, keine Zahlung",
            ],
            registration: "HRB 230077 (Amtsgericht Hannover)",
            vatId: "DE459778632",
          },
          null,
          2,
        ),
      },
    ],
  }),
});
