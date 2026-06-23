import { describe, it, expect } from "vitest";
import {
  getOrganizationSchema,
  getLocalBusinessSchema,
  getWebPageSchema,
  getFAQSchema,
  getReviewSchema,
  getServiceSchema,
  getBreadcrumbSchema,
  getSoftwareAppSchema,
} from "@/components/seo/StructuredData";
import {
  OrganizationSchema,
  LocalBusinessSchema,
  WebPageSchema,
  FAQPageSchema,
  ReviewCollectionSchema,
  ServiceSchema,
  BreadcrumbListSchema,
  SoftwareApplicationSchema,
  assertBreadcrumbPositions,
} from "@/lib/schema-validators";

const BASE = "https://kitech-software.de";

describe("Global Organization & LocalBusiness", () => {
  it("Organization schema is valid", () => {
    expect(() => OrganizationSchema.parse(getOrganizationSchema())).not.toThrow();
  });

  it("LocalBusiness (ProfessionalService) schema is valid", () => {
    expect(() => LocalBusinessSchema.parse(getLocalBusinessSchema())).not.toThrow();
  });
});

const pages = [
  { name: "Startseite", path: "/", desc: "Orchestrierte KI-Agenten." },
  { name: "Leistungen", path: "/leistungen", desc: "KI-Leistungen mit ROI-Garantie" },
  { name: "Haltung", path: "/haltung", desc: "Unsere Werte" },
  { name: "Referenzen", path: "/referenzen", desc: "Ausgewählte Kunden" },
  { name: "Kontakt", path: "/kontakt", desc: "Erstgespräch und Kontaktdaten" },
  { name: "Impressum", path: "/impressum", desc: "Impressum der KITech Software UG" },
] as const;

describe.each(pages)("WebPage schema for %s", ({ name, path, desc }) => {
  it("is valid", () => {
    const url = path === "/" ? BASE : `${BASE}${path}`;
    expect(() => WebPageSchema.parse(getWebPageSchema(name, desc, url))).not.toThrow();
  });
});

describe.each(pages.filter((p) => p.path !== "/"))(
  "BreadcrumbList for %s",
  ({ name, path }) => {
    it("has sequential positions and ends with the page", () => {
      const schema = getBreadcrumbSchema([
        { name: "Startseite", url: BASE },
        { name, url: `${BASE}${path}` },
      ]);
      const parsed = BreadcrumbListSchema.parse(schema);
      assertBreadcrumbPositions(parsed.itemListElement);
      const last = parsed.itemListElement.at(-1)!;
      expect(last.name).toBe(name);
      expect(last.item).toBe(`${BASE}${path}`);
    });
  }
);

describe("Landing page Index sections", () => {
  it("FAQPage schema is valid", () => {
    const faq = getFAQSchema([
      { question: "Was macht KITech?", answer: "KI mit ROI-Garantie." },
      { question: "Was ist ROI-Garantie?", answer: "Sie zahlen nur bei messbarem Ergebnis." },
    ]);
    expect(() => FAQPageSchema.parse(faq)).not.toThrow();
  });

  it("Review collection schema is valid", () => {
    const reviews = getReviewSchema([
      { author: "Max Mustermann", text: "Top Arbeit.", rating: 5 },
      { author: "Erika Beispiel", text: "Sehr empfehlenswert.", rating: 5 },
    ]);
    expect(() => ReviewCollectionSchema.parse(reviews)).not.toThrow();
  });

  it("rejects out-of-range ratings", () => {
    const reviews = getReviewSchema([
      { author: "X", text: "y", rating: 9 as unknown as number },
    ]);
    expect(() => ReviewCollectionSchema.parse(reviews)).toThrow();
  });
});

describe("Leistungen Service schema", () => {
  it("is valid", () => {
    const s = getServiceSchema(
      "KI-Entwicklung mit ROI-Garantie",
      "KI-Lösungen für den Mittelstand mit garantiertem Wertbeitrag."
    );
    expect(() => ServiceSchema.parse(s)).not.toThrow();
  });
});

describe("SoftwareApplication schema (Produkte)", () => {
  it.each([
    ["ethixAI", "AI ethics SaaS", "Web App", "https://ethixai.io"],
    ["CleverFuchs", "Lern-App", "iOS App", undefined],
  ] as const)("%s validates", (name, desc, type, url) => {
    const schema = getSoftwareAppSchema(name, desc, type, url);
    expect(() => SoftwareApplicationSchema.parse(schema)).not.toThrow();
  });
});
