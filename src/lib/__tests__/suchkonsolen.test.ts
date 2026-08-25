import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { ohneKommentare } from "./quelltext";
import {
  GOOGLE_SITE_VERIFICATION,
  BING_SITE_VERIFICATION,
  suchkonsolenBestaetigung,
} from "../../config/suchkonsolen";

/**
 * Die Bestätigung für Search Console und Bing Webmaster Tools.
 *
 * **Warum das ein Test ist.** Beide Dienste prüfen ihr Meta-Tag regelmäßig
 * nach. Verschwindet es, verliert die Domain den bestätigten Status und die
 * Daten laufen nicht weiter — und zwar still. Ein Tag, das nur einmal gebraucht
 * zu werden scheint, ist genau die Sorte Zeile, die jemand später als Altlast
 * entfernt.
 *
 * Der Test prüft deshalb zwei Dinge: dass die Verdrahtung im Root-Layout steht,
 * und dass ein eingetragener Wert auch tatsächlich im Ergebnis landet.
 */

describe("Suchkonsolen-Bestätigung", () => {
  it("das Root-Layout gibt die Bestätigung aus", () => {
    const layout = ohneKommentare(fs.readFileSync("src/app/layout.tsx", "utf8"));
    expect(
      layout.includes("suchkonsolenBestaetigung()"),
      "src/app/layout.tsx ruft suchkonsolenBestaetigung() nicht mehr auf. " +
        "Ohne den Aufruf verliert die Domain ihren bestätigten Status bei Google und Bing."
    ).toBe(true);
    expect(layout).toContain("verification:");
  });

  it("ein eingetragener Google-Wert landet im Ergebnis", () => {
    const ergebnis = suchkonsolenBestaetigung();
    if (GOOGLE_SITE_VERIFICATION) {
      expect(ergebnis.google).toBe(GOOGLE_SITE_VERIFICATION);
    } else {
      expect(
        "google" in ergebnis,
        "Ohne eingetragenen Wert darf kein leeres google-Feld entstehen — " +
          "ein Tag mit leerem content sieht für den Prüfer aus wie ein Fehlversuch."
      ).toBe(false);
    }
  });

  it("ein eingetragener Bing-Wert landet im Ergebnis", () => {
    const ergebnis = suchkonsolenBestaetigung() as { other?: Record<string, string> };
    if (BING_SITE_VERIFICATION) {
      expect(ergebnis.other?.["msvalidate.01"]).toBe(BING_SITE_VERIFICATION);
    } else {
      expect("other" in ergebnis).toBe(false);
    }
  });

  /**
   * Die Kennungen sind keine Geheimnisse — sie stehen im Quelltext jeder
   * ausgelieferten Seite. Sie dürfen deshalb im Repo stehen. Was sie nicht
   * sein dürfen: ein Platzhalter, den jemand für echt hält.
   */
  it("enthält keinen Platzhaltertext statt einer echten Kennung", () => {
    for (const [name, wert] of [
      ["GOOGLE_SITE_VERIFICATION", GOOGLE_SITE_VERIFICATION],
      ["BING_SITE_VERIFICATION", BING_SITE_VERIFICATION],
    ] as const) {
      if (!wert) continue;
      expect(
        /^(TODO|xxx|abc|dein|hier|placeholder|beispiel)/i.test(wert),
        `${name} sieht nach einem Platzhalter aus: „${wert}“`
      ).toBe(false);
      expect(wert.length, `${name} ist zu kurz für eine echte Kennung`).toBeGreaterThan(10);
    }
  });
});
