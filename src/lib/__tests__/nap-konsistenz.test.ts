import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { company } from "../../config/company";
import { ohneKommentare } from "./quelltext";

/**
 * Name, Anschrift, Telefon — überall dieselben.
 *
 * **Warum das ein Test ist.** Am 26.08.2026 führte die Website zwei
 * Telefonnummern parallel, und zwar genau auf den Flächen, die für den
 * NAP-Abgleich gelesen werden: Fußzeile und `llms.txt` zeigten das Festnetz,
 * Impressum, Datenschutzerklärung und alle drei JSON-LD-Knoten die Mobilnummer.
 * Auf `/kontakt` standen beide auf derselben Seite — die maschinenlesbare
 * Angabe widersprach der sichtbaren.
 *
 * Für lokale Suche zählt Übereinstimmung über Website, Google Business Profile
 * und Verzeichnisse hinweg. Zwei Nummern heißen: keine bestätigt die andere.
 */

/**
 * Auf die reine internationale Ziffernfolge normalisieren.
 *
 * Die deutsche Schreibweise „+49 (0) 151 64682544" trägt eine Null in
 * Klammern: Sie gehört zur *nationalen* Wählform und entfällt international.
 * Wer sie mitzählt, hält dieselbe Nummer für zwei verschiedene.
 */
function ziffern(text: string): string {
  return text
    .replace(/\(\s*0\s*\)/g, "")
    .replace(/\D/g, "")
    .replace(/^0049/, "49")
    .replace(/^490/, "49");
}

/** Die kanonische Nummer in internationaler Form, ohne Trennzeichen. */
const KANONISCH = ziffern(company.phone.href.replace("tel:", ""));

/** Dateien, die eine Telefonnummer sichtbar oder maschinenlesbar ausgeben. */
const QUELLEN = [
  "src/views/Impressum.tsx",
  "src/views/Datenschutz.tsx",
  "src/components/seo/StructuredData.tsx",
  "src/components/conversion/StickyMobileCTA.tsx",
] as const;

describe("NAP-Konsistenz", () => {
  it("die kanonische Nummer ist gesetzt", () => {
    expect(KANONISCH.length, "company.phone.href enthält keine brauchbare Nummer").toBeGreaterThan(10);
  });

  for (const datei of QUELLEN) {
    it(`${datei} nennt keine abweichende Telefonnummer`, () => {
      if (!fs.existsSync(datei)) return;
      const text = ohneKommentare(fs.readFileSync(datei, "utf8"));

      /* Deutsche Rufnummern in den Schreibweisen, die im Repo vorkommen:
         +49…, 0049…, tel:+49… — jeweils mit optionalen Trennzeichen. */
      const treffer = text.match(/(?:\+49|0049)[\s()\-/]*\d[\d\s()\-/]{6,}/g) ?? [];

      const abweichend = [...new Set(treffer.map(ziffern))]
        .filter((n) => n.length >= 11)
        .filter((n) => n !== KANONISCH);

      expect(
        abweichend,
        `${datei} nennt eine andere Nummer als company.phone (${KANONISCH}):\n` +
          abweichend.map((n) => `  +${n}`).join("\n") +
          `\nZwei Nummern auf einer Website heißen: keine bestätigt die andere.`
      ).toEqual([]);
    });
  }

  it("llms.txt gibt dieselbe Nummer aus", () => {
    if (!fs.existsSync("public/llms.txt")) return;
    const text = fs.readFileSync("public/llms.txt", "utf8");
    const treffer = text.match(/(?:\+49|0049)[\s()\-/]*\d[\d\s()\-/]{6,}/g) ?? [];
    const abweichend = [...new Set(treffer.map(ziffern))]
      .filter((n) => n.length >= 11)
      .filter((n) => n !== KANONISCH);

    expect(
      abweichend,
      `public/llms.txt nennt eine andere Nummer. Neu erzeugen: npm run llms\n` +
        abweichend.map((n) => `  +${n}`).join("\n")
    ).toEqual([]);
  });

  /** Die Anschrift steht an mehreren Stellen wörtlich — sie muss übereinstimmen. */
  it("die Anschrift ist überall dieselbe", () => {
    const abweichend: string[] = [];
    for (const datei of ["src/views/Impressum.tsx", "src/components/seo/StructuredData.tsx"]) {
      if (!fs.existsSync(datei)) continue;
      const text = ohneKommentare(fs.readFileSync(datei, "utf8"));
      if (text.includes("Wedekind") && !text.includes(company.address.street)) {
        abweichend.push(`${datei}: nennt eine andere Straße als „${company.address.street}“`);
      }
      if (/\b3\d{4}\b/.test(text) && !text.includes(company.address.zip)) {
        abweichend.push(`${datei}: nennt eine andere Postleitzahl als „${company.address.zip}“`);
      }
    }
    expect(abweichend, abweichend.join("\n")).toEqual([]);
  });
});
