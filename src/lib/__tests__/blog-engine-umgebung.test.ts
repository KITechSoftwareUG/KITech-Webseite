import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Jeder Einstiegspunkt der Blog-Engine muss `.env` laden, bevor er nach einem
 * Zugang fragt.
 *
 * **Warum das ein Test ist.** Am 23.08.2026 stellte sich heraus: Die Engine las
 * `process.env.DATAFORSEO_LOGIN` — aber niemand füllte `process.env`. Kein
 * `dotenv`, kein `--env-file`, und `tsx` lädt von sich aus nichts. Wer die
 * Zugangsdaten korrekt in `.env` einträgt, bekam trotzdem „DATAFORSEO_LOGIN
 * fehlt" — und suchte den Fehler beim Zugang statt beim Laden.
 *
 * Der Fehler war nur deshalb so lange unsichtbar, weil die Pipeline mangels
 * Zugangsdaten ohnehin nie gelaufen ist. Genau solche Fehler fallen erst in dem
 * Moment auf, in dem man sie am wenigsten brauchen kann.
 *
 * Geprüft wird die **Reihenfolge**: Der Import muss vor allen anderen stehen.
 * Ein `import` weiter unten würde in ESM zwar auch vor dem Rumpf ausgeführt,
 * aber nach den Modulen darüber — und eines davon könnte beim Laden bereits
 * eine Variable lesen.
 */

const EINSTIEGSPUNKTE = [
  "lauf.ts",
  "brief.ts",
  "pruefe.ts",
  "freigeben.ts",
  "indexnow-melden.ts",
  "backlink-radar.ts",
] as const;

const WURZEL = "scripts/blog-engine";

describe("Blog-Engine: .env wird geladen", () => {
  it("das Lademodul existiert", () => {
    expect(fs.existsSync(path.join(WURZEL, "lib/umgebung.ts"))).toBe(true);
  });

  for (const datei of EINSTIEGSPUNKTE) {
    it(`${datei} lädt .env als ersten Import`, () => {
      const quelle = fs.readFileSync(path.join(WURZEL, datei), "utf8");

      const importe = quelle
        .split("\n")
        .map((zeile) => zeile.trim())
        .filter((zeile) => zeile.startsWith("import "));

      expect(importe.length, `${datei} hat keine Importe — Test veraltet?`).toBeGreaterThan(0);
      expect(
        importe[0],
        `${datei} lädt .env nicht als ersten Import. Erste Zeile ist: ${importe[0]}\n` +
          `Erwartet: import "./lib/umgebung.js";`
      ).toContain("lib/umgebung.js");
    });
  }

  /**
   * Die Gegenprobe zum Modul selbst: Es darf beim Fehlen der Datei nicht werfen.
   * Im Container und in Coolify gibt es keine `.env` — dort kommen die Werte aus
   * echten Umgebungsvariablen, und ein Absturz wäre dort das falsche Verhalten.
   */
  it("das Lademodul wirft nicht, wenn .env fehlt", () => {
    const quelle = fs.readFileSync(path.join(WURZEL, "lib/umgebung.ts"), "utf8");
    expect(quelle).toContain("existsSync");
    expect(quelle).toContain("try");
  });
});

/**
 * Dieselbe Regel gilt außerhalb der Blog-Engine: Wer einen Zugang aus
 * `process.env` liest, muss `.env` vorher geladen haben. `scripts/suchkonsole.ts`
 * liegt nicht unter `scripts/blog-engine/`, teilt sich aber dessen Lademodul —
 * und damit auch dessen Falle.
 */
describe("Weitere Einstiegspunkte laden .env", () => {
  const WEITERE = ["scripts/suchkonsole.ts", "scripts/bing.ts"] as const;

  for (const datei of WEITERE) {
    it(`${datei} lädt .env als ersten Import`, () => {
      const quelle = fs.readFileSync(datei, "utf8");

      const importe = quelle
        .split("\n")
        .map((zeile) => zeile.trim())
        .filter((zeile) => zeile.startsWith("import "));

      expect(importe.length, `${datei} hat keine Importe — Test veraltet?`).toBeGreaterThan(0);
      expect(
        importe[0],
        `${datei} lädt .env nicht als ersten Import. Erste Zeile ist: ${importe[0]}`
      ).toContain("lib/umgebung.js");
    });
  }
});
