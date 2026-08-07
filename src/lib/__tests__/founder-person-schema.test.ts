import { describe, it, expect } from "vitest";
import { PersonSchema } from "@/lib/schema-validators";
import HaltungSrc from "../../views/Haltung.tsx?raw";
import KontaktSrc from "../../views/Kontakt.tsx?raw";
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

  /**
   * Ab hier wird mit dem geparsten Ergebnis gearbeitet statt mit dem Rohobjekt.
   *
   * `getFounderPersonSchema()` liefert `SchemaBase` mit `[key: string]: unknown`
   * — jeder Feldzugriff darauf war vorher ein `as any`-Cast und damit ein
   * ESLint-Fehler. Zod kennt die Feldtypen bereits; einmal parsen ersetzt drei
   * Casts und prüft nebenbei, dass die Felder überhaupt das erwartete Format
   * haben.
   */
  const person = PersonSchema.parse(data);

  it("identifies Ayham Alkhalil as founder of KITech", () => {
    expect(person.name).toBe("Ayham Alkhalil");
    expect(person.jobTitle).toMatch(/Gründer|Geschäftsführer/);
    expect(person.worksFor.name).toMatch(/KITech/);
  });

  it("uses an absolute https image URL", () => {
    expect(person.image).toMatch(/^https:\/\//);
  });

  it("declares relevant expertise topics", () => {
    expect(person.knowsAbout?.length).toBeGreaterThan(0);
  });
});

/**
 * Prüft die *aktiven* Seiten, auf denen der Gründer im Mittelpunkt steht.
 *
 * Bis zum 05.08.2026 las dieser Test `src/views/legacy/Index.tsx`, `Haltung.tsx`
 * und `Kontakt.tsx` — also drei Seiten, die seit der Next.js-Migration gar nicht
 * mehr ausgeliefert werden. Er war damit grün, ohne noch etwas über die echte
 * Website auszusagen. Jetzt zeigt er auf die Seiten unter `src/views/`.
 *
 * Ebenfalls angepasst: Geprüft wird nur noch, DASS das Schema eingebunden ist,
 * nicht mehr die genaue Schreibweise des JSX. Die neuen Seiten übergeben mehrere
 * Schemas gebündelt als Array an eine einzige `StructuredData`-Komponente; die
 * alte Prüfung auf `data={getFounderPersonSchema()}` hätte das als Fehler
 * gemeldet, obwohl das Schema korrekt ausgeliefert wird.
 */
describe("Founder Person schema renders on key pages", () => {
  const pages: Array<[string, string]> = [
    ["Haltung.tsx", HaltungSrc],
    ["Kontakt.tsx", KontaktSrc],
  ];

  for (const [name, src] of pages) {
    it(`${name} imports and renders getFounderPersonSchema`, () => {
      expect(src).toMatch(/import\s*\{[^}]*getFounderPersonSchema/s);
      expect(src).toMatch(/getFounderPersonSchema\(\)/);
    });
  }
});
