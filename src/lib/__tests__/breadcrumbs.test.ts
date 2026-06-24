import { describe, it, expect } from "vitest";
import { getBreadcrumbSchema } from "@/components/seo/StructuredData";
import {
  BreadcrumbListSchema,
  assertBreadcrumbPositions,
} from "@/lib/schema-validators";
import { glossaryTerms } from "@/data/glossary";

const BASE = "https://kitech-software.de";

const pages = [
  { name: "Leistungen", path: "/leistungen" },
  { name: "Haltung", path: "/haltung" },
  { name: "Referenzen", path: "/referenzen" },
  { name: "Kontakt", path: "/kontakt" },
  { name: "Impressum", path: "/impressum" },
  { name: "Datenschutz", path: "/datenschutz" },
  { name: "AGB", path: "/agb" },
  { name: "Glossar", path: "/glossar" },
] as const;

describe.each(pages)("BreadcrumbList JSON-LD for %s", ({ name, path }) => {
  const schema = getBreadcrumbSchema([
    { name: "Startseite", url: BASE },
    { name, url: `${BASE}${path}` },
  ]);

  it("validates against BreadcrumbListSchema", () => {
    expect(() => BreadcrumbListSchema.parse(schema)).not.toThrow();
  });

  it("has sequential positions starting at 1", () => {
    const parsed = BreadcrumbListSchema.parse(schema);
    assertBreadcrumbPositions(parsed.itemListElement);
    expect(parsed.itemListElement[0]!.position).toBe(1);
    expect(parsed.itemListElement[parsed.itemListElement.length - 1]!.position).toBe(
      parsed.itemListElement.length
    );
  });

  it("ends with the current page URL and name", () => {
    const parsed = BreadcrumbListSchema.parse(schema);
    const last = parsed.itemListElement[parsed.itemListElement.length - 1]!;
    expect(last.name).toBe(name);
    expect(last.item).toBe(`${BASE}${path}`);
  });
});

describe("BreadcrumbList JSON-LD for glossary term pages", () => {
  it("validates a 3-level breadcrumb (Start → Glossar → Term)", () => {
    const term = glossaryTerms[0]!;
    const schema = getBreadcrumbSchema([
      { name: "Startseite", url: BASE },
      { name: "Glossar", url: `${BASE}/glossar` },
      { name: term.term, url: `${BASE}/glossar/${term.slug}` },
    ]);
    const parsed = BreadcrumbListSchema.parse(schema);
    expect(parsed.itemListElement).toHaveLength(3);
    assertBreadcrumbPositions(parsed.itemListElement);
    expect(parsed.itemListElement[2]!.item).toBe(
      `${BASE}/glossar/${term.slug}`
    );
  });

  it("validates all glossary terms produce valid breadcrumbs", () => {
    for (const term of glossaryTerms) {
      const schema = getBreadcrumbSchema([
        { name: "Startseite", url: BASE },
        { name: "Glossar", url: `${BASE}/glossar` },
        { name: term.term, url: `${BASE}/glossar/${term.slug}` },
      ]);
      expect(() => BreadcrumbListSchema.parse(schema)).not.toThrow();
    }
  });
});

describe("BreadcrumbList edge cases", () => {
  it("rejects a single-item breadcrumb (min 2)", () => {
    const schema = getBreadcrumbSchema([{ name: "Startseite", url: BASE }]);
    expect(() => BreadcrumbListSchema.parse(schema)).toThrow();
  });

  it("rejects non-URL items", () => {
    const schema = getBreadcrumbSchema([
      { name: "Startseite", url: BASE },
      { name: "Broken", url: "not-a-url" },
    ]);
    expect(() => BreadcrumbListSchema.parse(schema)).toThrow();
  });

  it("detects non-sequential positions via assertBreadcrumbPositions", () => {
    expect(() =>
      assertBreadcrumbPositions([{ position: 1 }, { position: 3 }])
    ).toThrow(/not sequential/);
  });
});
