import { describe, it, expect } from "vitest";
import { PersonSchema } from "@/lib/schema-validators";
import IndexSrc from "../../pages/Index.tsx?raw";
import HaltungSrc from "../../pages/Haltung.tsx?raw";
import KontaktSrc from "../../pages/Kontakt.tsx?raw";
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

  it("identifies Ayham Alkhalil as founder of KITech", () => {
    expect(data.name).toBe("Ayham Alkhalil");
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
  const pages: Array<[string, string]> = [
    ["Index.tsx", IndexSrc],
    ["Haltung.tsx", HaltungSrc],
    ["Kontakt.tsx", KontaktSrc],
  ];

  for (const [name, src] of pages) {
    it(`${name} imports and renders getFounderPersonSchema`, () => {
      expect(src).toMatch(/getFounderPersonSchema/);
      expect(src).toMatch(/StructuredData\s+data=\{getFounderPersonSchema\(\)\}/);
    });
  }
});
