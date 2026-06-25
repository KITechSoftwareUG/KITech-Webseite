import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { PersonSchema } from "@/lib/schema-validators";
import { getFounderPersonSchema } from "@/components/seo/StructuredData";

describe("Founder Person schema", () => {
  const data = getFounderPersonSchema();

  it("matches the PersonSchema validator", () => {
    const result = PersonSchema.safeParse(data);
    if (!result.success) {
      console.error(result.error.format());
    }
    expect(result.success).toBe(true);
  });

  it("identifies A. Alkhalil as founder of KITech", () => {
    expect(data.name).toBe("A. Alkhalil");
    expect(data.jobTitle).toMatch(/Gründer|Geschäftsführer/);
    expect((data as any).worksFor.name).toMatch(/KITech/);
  });

  it("uses an absolute https image URL", () => {
    expect((data as any).image).toMatch(/^https:\/\//);
  });

  it("declares relevant expertise topics", () => {
    expect((data as any).knowsAbout.length).toBeGreaterThan(0);
  });
});

describe("Founder Person schema renders on key pages", () => {
  // The factory is imported and rendered as JSON-LD by:
  //  - src/pages/Index.tsx
  //  - src/pages/Haltung.tsx
  //  - src/pages/Kontakt.tsx
  // We assert at the source level that each page imports + emits it.
  const pages = ["src/pages/Index.tsx", "src/pages/Haltung.tsx", "src/pages/Kontakt.tsx"];

  for (const page of pages) {
    it(`${page} imports and renders getFounderPersonSchema`, () => {
      const src = readFileSync(page, "utf8");
      expect(src).toMatch(/getFounderPersonSchema/);
      expect(src).toMatch(/StructuredData\s+data=\{getFounderPersonSchema\(\)\}/);
    });
  }
});
