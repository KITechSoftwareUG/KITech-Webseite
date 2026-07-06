import { defineMcp } from "@lovable.dev/mcp-js";
import getCompanyInfo from "./tools/get-company-info";
import getServices from "./tools/get-services";
import getCaseStudies from "./tools/get-case-studies";
import getContact from "./tools/get-contact";

export default defineMcp({
  name: "kitech-software-mcp",
  title: "KITech Software MCP",
  version: "0.1.0",
  instructions:
    "Öffentlicher MCP-Server der KITech Software UG (Hannover, Deutschland). " +
    "Liefert strukturierte Informationen zu Unternehmen, Leistungen, Referenzprojekten und Kontaktdaten. " +
    "Nutze get_company_info für Überblick, get_services für Beratungs- und Entwicklungsleistungen, " +
    "get_case_studies für Referenzen und get_contact für Kontakt- und Buchungsdaten.",
  tools: [getCompanyInfo, getServices, getCaseStudies, getContact],
});
