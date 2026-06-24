import { describe, it, expect } from "vitest";
import {
  getWebPageSchema,
  getBreadcrumbSchema,
  getServiceSchema,
  getLocalBusinessSchema,
  getClientsItemListSchema,
  getContactPageSchema,
} from "@/components/seo/StructuredData";
import {
  WebPageSchema,
  BreadcrumbListSchema,
  ServiceSchema,
  LocalBusinessSchema,
  ClientsItemListSchema,
  ContactPageSchema,
  assertBreadcrumbPositions,
} from "@/lib/schema-validators";

const BASE = "https://kitech-software.de";

describe("Referenzen page JSON-LD", () => {
  const url = `${BASE}/referenzen`;
  const clients = [
    { name: "NiImmo Holding GmbH" },
    { name: "Alltagshilfe Fischer GmbH" },
    { name: "cert consulting Pane" },
    { name: "KREMA Group" },
    { name: "ExpatVantage" },
    { name: "FEIL Automation" },
    { name: "PflegeXperts" },
    { name: "Lernwerkstatt Pflege" },
  ];

  it("WebPage validates", () => {
    expect(() =>
      WebPageSchema.parse(getWebPageSchema("Referenzen", "Ausgewählte Kunden", url))
    ).not.toThrow();
  });

  it("Breadcrumb validates with sequential positions", () => {
    const schema = getBreadcrumbSchema([
      { name: "Startseite", url: BASE },
      { name: "Referenzen", url },
    ]);
    const parsed = BreadcrumbListSchema.parse(schema);
    assertBreadcrumbPositions(parsed.itemListElement);
  });

  it("Clients ItemList validates and positions are sequential", () => {
    const schema = getClientsItemListSchema(clients);
    const parsed = ClientsItemListSchema.parse(schema);
    expect(parsed.numberOfItems).toBe(clients.length);
    parsed.itemListElement.forEach((el, i) => {
      expect(el.position).toBe(i + 1);
      expect(el.item.name).toBe(clients[i].name);
    });
  });

  it("rejects empty client list", () => {
    expect(() => ClientsItemListSchema.parse(getClientsItemListSchema([]))).toThrow();
  });
});

describe("Leistungen page JSON-LD", () => {
  const url = `${BASE}/leistungen`;

  it("WebPage validates", () => {
    expect(() =>
      WebPageSchema.parse(getWebPageSchema("Leistungen", "KI-Leistungen mit ROI-Garantie", url))
    ).not.toThrow();
  });

  it("Breadcrumb validates", () => {
    const parsed = BreadcrumbListSchema.parse(
      getBreadcrumbSchema([
        { name: "Startseite", url: BASE },
        { name: "Leistungen", url },
      ])
    );
    assertBreadcrumbPositions(parsed.itemListElement);
  });

  it("Service schema validates", () => {
    expect(() =>
      ServiceSchema.parse(
        getServiceSchema(
          "KI-Entwicklung mit ROI-Garantie",
          "KI-Lösungen für den Mittelstand mit garantiertem wirtschaftlichem Wertbeitrag."
        )
      )
    ).not.toThrow();
  });
});

describe("Kontakt page JSON-LD", () => {
  const url = `${BASE}/kontakt`;

  it("WebPage validates", () => {
    expect(() =>
      WebPageSchema.parse(getWebPageSchema("Kontakt", "Erstgespräch und Kontaktdaten", url))
    ).not.toThrow();
  });

  it("Breadcrumb validates", () => {
    const parsed = BreadcrumbListSchema.parse(
      getBreadcrumbSchema([
        { name: "Startseite", url: BASE },
        { name: "Kontakt", url },
      ])
    );
    assertBreadcrumbPositions(parsed.itemListElement);
  });

  it("LocalBusiness validates", () => {
    expect(() => LocalBusinessSchema.parse(getLocalBusinessSchema())).not.toThrow();
  });

  it("ContactPage validates with contactPoint", () => {
    const parsed = ContactPageSchema.parse(getContactPageSchema());
    expect(parsed.mainEntity.contactPoint.email).toContain("@");
    expect(parsed.url).toBe(url);
  });
});
