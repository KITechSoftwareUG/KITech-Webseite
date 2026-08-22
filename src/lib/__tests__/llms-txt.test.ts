import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { baueKurz, baueLang, ZIEL_KURZ, ZIEL_LANG } from "../../../scripts/llms-txt";

/**
 * `llms.txt` und `llms-full.txt` gegen den Stand der Website prüfen.
 *
 * **Warum das ein Test ist und keine Erinnerung im Kalender:** Beide Dateien
 * waren am 20.08.2026 sechs Wochen alt und beschrieben eine Website, die es
 * nicht mehr gab — inklusive der ROI-Garantie und eines Kunden, den es nie
 * gegeben hat. Eine Websuche am selben Tag gab eine KI-Antwort zurück, die
 * wörtlich aus der veralteten Datei zitierte.
 *
 * Genau dagegen hilft nur, dass es auffällt, bevor es live geht. Wer eine
 * Leistung, einen Referenzfall oder einen Artikel ändert, ändert damit auch das
 * erwartete Ergebnis hier — und der Test sagt, dass `npm run llms` fällig ist.
 */

describe("llms.txt", () => {
  it("gibt den aktuellen Stand der Website wieder", () => {
    const vorhanden = fs.readFileSync(ZIEL_KURZ, "utf8");
    expect(
      vorhanden === baueKurz(),
      "public/llms.txt ist nicht auf dem Stand der Datendateien. Neu erzeugen: npm run llms"
    ).toBe(true);
  });

  it("llms-full.txt ebenso", () => {
    const vorhanden = fs.readFileSync(ZIEL_LANG, "utf8");
    expect(
      vorhanden === baueLang(),
      "public/llms-full.txt ist nicht auf dem Stand der Datendateien. Neu erzeugen: npm run llms"
    ).toBe(true);
  });

  /**
   * Die Aussagen, die am 20.08.2026 in der alten Fassung standen und dort nicht
   * mehr hingehören. Der Test prüft nicht Schönheit, sondern genau diese sechs
   * Fehler — jeder davon war real.
   */
  it("enthält nichts, was von der Website entfernt wurde", () => {
    const kurz = baueKurz();
    const lang = baueLang();

    /* Geprüft wird das **Zahlungsversprechen**, nicht das Wort „ROI-Garantie".
       Der Begriff steht seit dem 20.08.2026 neutral im Glossar erklärt — als
       Branchenbegriff, nicht als Zusage von KITech — und darf deshalb in der
       Begriffsliste auftauchen. Was nicht wiederkommen darf, ist der Satz. */
    for (const [was, muster] of [
      ["ROI-Garantie als Zusage", /zahlt der Kunde nicht|zahlen Sie nicht|KITech-Modell/i],
      ["erfundener Kunde", /Frank Locke|Locke und Partner/i],
      ["tote Calendly-Adresse", /automatisieren-mit-kitech/i],
      ["TMG statt DDG", /§\s*5\s*TMG/i],
      ["nicht belegte Kunden", /Alltagshilfe Fischer|ExpatVantage/i],
    ] as const) {
      expect(muster.test(kurz), `llms.txt enthält wieder: ${was}`).toBe(false);
      expect(muster.test(lang), `llms-full.txt enthält wieder: ${was}`).toBe(false);
    }
  });

  /**
   * Die alte Fassung führte sechs Leistungen auf, darunter „Computer Vision"
   * und „Datenplattform-Aufbau" — beide seit dem 12.08.2026 nicht mehr im
   * Angebot.
   *
   * Geprüft wird deshalb der Abschnitt, nicht die Wörter: „Computer Vision"
   * steht weiterhin völlig zu Recht im Glossar, weil es dort ein Fachbegriff
   * ist und keine Leistung.
   */
  it("führt genau die Leistungen auf, die services.ts kennt", async () => {
    const { services } = await import("@/data/services");
    const lang = baueLang();

    const abschnitt = lang.slice(lang.indexOf("## 3. Leistungen"), lang.indexOf("## 4. Haltung"));
    const ueberschriften = [...abschnitt.matchAll(/^### \d+ — (.+)$/gm)].map((m) => m[1]);

    expect(ueberschriften).toEqual(services.map((leistung) => leistung.title));
  });

  it("nennt nur Kundenstimmen, die auch in testimonials.ts stehen", async () => {
    const { testimonials } = await import("@/data/testimonials");
    const lang = baueLang();

    /* Jede Zeile, die wie ein Zitat aussieht, muss einem Eintrag zuzuordnen sein. */
    const zitate = [...lang.matchAll(/^- „(.+?)" — (.+)$/gm)];
    expect(zitate.length).toBe(testimonials.length);

    for (const [, text, urheber] of zitate) {
      const treffer = testimonials.find((t) => t.quote === text);
      expect(treffer, `Zitat ohne Eintrag in testimonials.ts: „${text}"`).toBeTruthy();
      expect(urheber).toContain(treffer!.author);
    }
  });
});
