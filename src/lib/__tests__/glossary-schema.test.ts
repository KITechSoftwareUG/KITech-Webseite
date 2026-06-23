import { describe, it, expect } from "vitest";
import { glossaryTerms } from "@/data/glossary";
import {
  buildGlossaryIndexSchema,
  buildGlossaryTermSchema,
  GLOSSARY_INDEX_URL,
} from "@/lib/glossary-schema";
import {
  ArticleSchema,
  BreadcrumbListSchema,
  FAQPageSchema,
  DefinedTermSetSchema,
  WebPageSchema,
  assertBreadcrumbPositions,
} from "@/lib/schema-validators";

describe("Glossary index JSON-LD", () => {
  const [webpage, breadcrumb, termSet] = buildGlossaryIndexSchema();

  it("contains a valid WebPage", () => {
    expect(() => WebPageSchema.parse(webpage)).not.toThrow();
  });

  it("contains a valid BreadcrumbList with sequential positions", () => {
    const parsed = BreadcrumbListSchema.parse(breadcrumb);
    assertBreadcrumbPositions(parsed.itemListElement);
  });

  it("contains a valid DefinedTermSet listing every term", () => {
    const parsed = DefinedTermSetSchema.parse(termSet);
    expect(parsed.hasDefinedTerm).toHaveLength(glossaryTerms.length);
    for (const t of parsed.hasDefinedTerm) {
      expect(t.url).toMatch(/^https:\/\/kitech-software\.de\/glossar\//);
      expect(t.inDefinedTermSet?.["@id"]).toBe(GLOSSARY_INDEX_URL);
    }
  });
});

describe.each(glossaryTerms.map((t) => [t.slug, t] as const))(
  "Glossary term %s",
  (_slug, term) => {
    const blocks = buildGlossaryTermSchema(term);
    const article = blocks.find((b) => b["@type"] === "Article")!;
    const breadcrumb = blocks.find((b) => b["@type"] === "BreadcrumbList")!;
    const faq = blocks.find((b) => b["@type"] === "FAQPage");

    it("has valid Article schema with all rich-result fields", () => {
      const parsed = ArticleSchema.parse(article);
      expect(parsed.url).toBe(`${GLOSSARY_INDEX_URL}/${term.slug}`);
      expect(parsed.mainEntityOfPage["@id"]).toBe(parsed.url);
      expect(parsed.image[0]).toMatch(/^https?:\/\//);
      expect(new Date(parsed.dateModified).getTime()).toBeGreaterThanOrEqual(
        new Date(parsed.datePublished).getTime()
      );
    });

    it("has valid BreadcrumbList ending with the term", () => {
      const parsed = BreadcrumbListSchema.parse(breadcrumb);
      assertBreadcrumbPositions(parsed.itemListElement);
      const last = parsed.itemListElement.at(-1)!;
      expect(last.name).toBe(term.term);
      expect(last.item).toBe(`${GLOSSARY_INDEX_URL}/${term.slug}`);
    });

    it("emits a valid FAQPage iff faqs are defined", () => {
      if (term.faqs && term.faqs.length > 0) {
        const parsed = FAQPageSchema.parse(faq);
        expect(parsed.mainEntity).toHaveLength(term.faqs.length);
      } else {
        expect(faq).toBeUndefined();
      }
    });
  }
);

describe("Glossary data integrity", () => {
  it("has unique slugs", () => {
    const slugs = glossaryTerms.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("only references existing related slugs", () => {
    const known = new Set(glossaryTerms.map((t) => t.slug));
    for (const t of glossaryTerms) {
      for (const r of t.related) {
        expect(known, `related slug "${r}" of "${t.slug}"`).toContain(r);
      }
    }
  });
});
