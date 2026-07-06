import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_contact",
  title: "KITech Kontakt",
  description:
    "Kontaktinformationen von KITech Software inkl. E-Mail, Telefon, Adresse und Terminbuchungslink.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            email: "info@kitech-software.de",
            phone: "+49 (0) 511 89738590",
            address: "Wedekindstraße 14, 30161 Hannover, Deutschland",
            website: "https://kitech-software.de",
            booking: "https://calendly.com/automatisieren-mit-kitech/30min",
            managingDirector: "Ayham Alkhalil",
          },
          null,
          2,
        ),
      },
    ],
  }),
});
