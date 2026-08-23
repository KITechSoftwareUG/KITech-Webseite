import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ohneKommentare } from "./quelltext";

/**
 * Die drei Rechtstexte gegen Normen prüfen, die es nicht mehr gibt.
 *
 * **Warum das ein Test ist.** Am 21.08.2026 wurde in `llms.txt` gefunden, dass
 * dort „§ 5 TMG" stand — und per Test abgesichert, dass es nicht zurückkommt.
 * Am 23.08.2026 fiel auf, dass die **Impressumsseite selbst** denselben Fehler
 * noch trug: die Datei, die von der Korrektur am dringendsten betroffen war,
 * lag außerhalb der Prüfung. Das ist die Lücke, die dieser Test schließt.
 *
 * Geprüft werden nur Normen, die tatsächlich aufgehoben sind — nicht Stil,
 * nicht Vollständigkeit. Ein Rechtstext, der eine nicht mehr existierende
 * Vorschrift zitiert, ist ein sichtbarer Mangel auf genau der Seite, die
 * Sorgfalt belegen soll.
 */

const RECHTSTEXTE = ["Impressum.tsx", "Datenschutz.tsx", "AGB.tsx"] as const;


/**
 * Aufgehobene Normen und das, was an ihre Stelle getreten ist.
 *
 * - **TMG** → aufgehoben am 14.05.2024 durch das Digitale-Dienste-Gesetz.
 *   Die Anbieterkennzeichnung steht seither in § 5 DDG.
 * - **TTDSG** → am selben Tag in **TDDDG** umbenannt (Telekommunikation-
 *   Digitale-Dienste-Datenschutz-Gesetz). Die Einwilligung für den Zugriff auf
 *   das Endgerät steht in § 25 TDDDG.
 */
const AUFGEHOBEN = [
  {
    name: "TMG (aufgehoben 14.05.2024)",
    muster: /\bTMG\b/,
    statt: "DDG — die Impressumspflicht steht in § 5 DDG",
  },
  {
    name: "TTDSG (umbenannt 14.05.2024)",
    muster: /\bTTDSG\b/,
    statt: "TDDDG — die Einwilligung steht in § 25 TDDDG",
  },
] as const;

describe("Rechtstexte", () => {
  for (const datei of RECHTSTEXTE) {
    it(`${datei} zitiert keine aufgehobene Norm`, () => {
      const text = ohneKommentare(fs.readFileSync(path.join("src/views", datei), "utf8"));

      for (const { name, muster, statt } of AUFGEHOBEN) {
        expect(
          muster.test(text),
          `src/views/${datei} nennt ${name}. Richtig ist: ${statt}.`
        ).toBe(false);
      }
    });
  }

  /**
   * Die Gegenprobe: Ohne diese Zeile wäre der Test oben auch dann grün, wenn
   * jemand die Überschrift ganz entfernt. § 5 DDG ist Pflichtangabe — die
   * Norm muss dastehen, nicht nur die falsche fehlen.
   */
  it("Impressum nennt § 5 DDG als Grundlage", () => {
    const text = ohneKommentare(fs.readFileSync("src/views/Impressum.tsx", "utf8"));
    expect(/§\s*5\s*DDG/.test(text), "src/views/Impressum.tsx nennt § 5 DDG nicht mehr.").toBe(true);
  });
});
