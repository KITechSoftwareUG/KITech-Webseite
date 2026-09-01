import { afterEach, describe, expect, it } from "vitest";

/**
 * Geprüft wird nicht Bing, sondern das, was beim Auswerten seiner Antworten
 * schiefgeht. Ein Test, der die API anruft, bräuchte den Schlüssel, liefe im
 * Container nicht und würde bei jedem Netzwerkhänger rot.
 *
 * Der Schwerpunkt liegt auf dem Datumsformat — dort steckte am 01.09.2026 ein
 * echter Fehler: `/autoren` erschien in der Abdeckung als „geholt", obwohl Bing
 * die Seite nie angefasst hatte. Grund war nicht die API, sondern die Annahme,
 * ein vorhandenes Feld enthalte auch ein Datum.
 */

const URSPRUNG = { ...process.env };

afterEach(() => {
  process.env = { ...URSPRUNG };
});

describe("Bing: Site-Kennung", () => {
  it("endet auf einen Schrägstrich", async () => {
    delete process.env.BING_SITE_URL;
    const { site } = await import("../bing.js");

    /* Zeichengenau so, wie die Site in den Webmaster Tools geführt wird. */
    expect(site()).toBe("https://kitech-software.de/");
    expect(site().endsWith("/")).toBe(true);
  });

  it("lässt sich überschreiben, ohne Code zu ändern", async () => {
    process.env.BING_SITE_URL = "https://beispiel.de/";
    const { site } = await import("../bing.js");
    expect(site()).toBe("https://beispiel.de/");
  });
});

describe("Bing: fehlender Schlüssel", () => {
  it("nennt die Variable und wo der Schlüssel herkommt", async () => {
    delete process.env.BING_WEBMASTER_API_KEY;
    const { schluessel } = await import("../bing.js");

    expect(() => schluessel()).toThrow(/BING_WEBMASTER_API_KEY/);
    expect(() => schluessel()).toThrow(/bing\.com\/webmasters/);
  });
});

/**
 * ⚠️ Der Kern dieser Datei.
 *
 * Bing hat drei Schreibweisen für „nie" und keine davon ist `null`. Wer nur
 * prüft, ob das Feld gefüllt ist, zählt jede unbekannte Seite als geholt — und
 * merkt es nur daran, dass in der Tabelle ein Strich statt eines Datums steht.
 */
describe("Bing: Datumsangaben", () => {
  it("liest ein echtes Datum", async () => {
    const { bingDatum } = await import("../bing.js");
    expect(bingDatum("/Date(1788232702000)/")?.toISOString().slice(0, 10)).toBe("2026-09-01");
  });

  it("verwirft den angehängten Zeitversatz, statt ihn aufzuaddieren", async () => {
    const { bingDatum } = await import("../bing.js");

    /*
     * `-0700` ist ein Anzeigehinweis; die Zahl davor ist bereits UTC. Wer den
     * Versatz verrechnet, verschiebt jedes Datum um sieben Stunden — was genau
     * an Tagesgrenzen falsche Tage ergibt.
     */
    const mit = bingDatum("/Date(1788232702000-0700)/");
    const ohne = bingDatum("/Date(1788232702000)/");
    expect(mit?.getTime()).toBe(ohne?.getTime());
  });

  it("erkennt DateTime.MinValue als „nie“", async () => {
    const { bingDatum } = await import("../bing.js");
    /* So antwortet GetUrlInfo für eine nie geholte Adresse. */
    expect(bingDatum("/Date(-62135568000000-0800)/")).toBeNull();
  });

  it("erkennt das Jahr 1601 als „nie“", async () => {
    const { bingDatum } = await import("../bing.js");
    /* So datiert GetFeeds eine Sitemap, die Bing selbst gefunden hat. */
    expect(bingDatum("/Date(-11644473600000)/")).toBeNull();
  });

  it("verträgt fehlende und unsinnige Werte", async () => {
    const { bingDatum } = await import("../bing.js");
    expect(bingDatum(null)).toBeNull();
    expect(bingDatum(undefined)).toBeNull();
    expect(bingDatum("")).toBeNull();
    expect(bingDatum("gestern")).toBeNull();
  });

  it("schreibt Tage als JJJJ-MM-TT — das einzige Format, das die API frisst", async () => {
    const { alsTag } = await import("../bing.js");

    /*
     * Das aus Microsofts Doku bekannte `/Date(…)/` wird im Query-String NICHT
     * erkannt: „String was not recognized as a valid DateTime", HTTP 400.
     */
    expect(alsTag(new Date("2026-08-31T22:15:00Z"))).toBe("2026-08-31");
    expect(alsTag(new Date("2026-01-05T00:00:00Z"))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("Bing: geholt oder nicht", () => {
  it("hält DateTime.MinValue nicht für einen Abruf", async () => {
    const { geholtAm } = await import("../bing.js");

    /*
     * Der Fehler vom 01.09.2026 in einer Zeile: Das Feld ist gefüllt, die
     * Adresse wurde trotzdem nie geholt.
     */
    const nieGeholt = { LastCrawledDate: "/Date(-62135568000000-0800)/" } as never;
    expect(Boolean((nieGeholt as { LastCrawledDate: string }).LastCrawledDate)).toBe(true);
    expect(geholtAm(nieGeholt)).toBeNull();
  });

  it("liefert das Datum, wenn die Adresse geholt wurde", async () => {
    const { geholtAm } = await import("../bing.js");
    const geholt = { LastCrawledDate: "/Date(1788232702000)/" } as never;
    expect(geholtAm(geholt)?.toISOString().slice(0, 10)).toBe("2026-09-01");
  });

  it("verträgt eine Adresse, die Bing gar nicht kennt", async () => {
    const { geholtAm } = await import("../bing.js");
    expect(geholtAm(null)).toBeNull();
    expect(geholtAm(undefined)).toBeNull();
  });
});

/**
 * Die beiden Fallstricke, die sich als HTTP 400 melden und deshalb wie ein
 * kaputter Schlüssel aussehen. Der Test hält den Hinweistext fest, weil er
 * genau dann gelesen wird, wenn niemand mehr weiß, woran es lag.
 */
describe("Bing: Fehlerdeutung", () => {
  it("hält die Kleinschreibung von country fest", async () => {
    const quelle = await import("node:fs").then((fs) =>
      fs.readFileSync("scripts/blog-engine/lib/bing.ts", "utf8")
    );

    expect(quelle).toContain("country");
    expect(quelle).toMatch(/klein/i);
  });

  it("verwendet für Keyword-Abfragen ein kleingeschriebenes Land", async () => {
    delete process.env.BING_WEBMASTER_API_KEY;
    const { keyword } = await import("../bing.js");

    /*
     * Ohne Schlüssel wirft der Aufruf, bevor er das Netz erreicht — geprüft
     * wird hier nur, dass die Voreinstellung nicht „DE" lautet.
     */
    await expect(keyword("test")).rejects.toThrow(/BING_WEBMASTER_API_KEY/);

    const quelle = await import("node:fs").then((fs) =>
      fs.readFileSync("scripts/blog-engine/lib/bing.ts", "utf8")
    );
    expect(quelle).toMatch(/land = "de"/);
  });
});
