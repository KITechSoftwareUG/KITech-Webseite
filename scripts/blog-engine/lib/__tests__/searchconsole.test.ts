import { afterEach, describe, expect, it } from "vitest";

/**
 * Was hier geprüft wird, sind die Fehler, die beim Einrichten tatsächlich
 * passieren — nicht die API selbst. Ein Test, der Google anruft, bräuchte einen
 * Schlüssel, liefe im Container nicht und würde bei jedem Netzwerkhänger rot.
 *
 * Geprüft wird stattdessen das, was ohne Netz feststeht: dass die
 * Property-Kennung die Form hat, die Google verlangt, und dass eine fehlende
 * oder falsche Konfiguration eine Meldung ergibt, die zur Ursache führt statt
 * zu einer Fehlersuche am falschen Ende.
 */

const URSPRUNG = { ...process.env };

afterEach(() => {
  process.env = { ...URSPRUNG };
});

describe("Search Console: Property-Kennung", () => {
  it("endet auf einen Schrägstrich", async () => {
    delete process.env.SEARCH_CONSOLE_PROPERTY;
    const { property } = await import("../searchconsole.js");

    /*
     * Ohne den Schrägstrich am Ende antwortet die API mit 403 „User does not
     * have sufficient permission for site" — einer Meldung, die von der
     * Rechteverwaltung spricht und die Property meint. Der Fehler kostet
     * garantiert eine Stunde, wenn er einmal hineingerät.
     */
    expect(property()).toBe("https://kitech-software.de/");
    expect(property().endsWith("/")).toBe(true);
  });

  it("lässt sich überschreiben, ohne Code zu ändern", async () => {
    process.env.SEARCH_CONSOLE_PROPERTY = "sc-domain:beispiel.de";
    const { property } = await import("../searchconsole.js");
    expect(property()).toBe("sc-domain:beispiel.de");
  });
});

describe("Google-Dienstkonto: Konfigurationsfehler", () => {
  it("nennt die Variable, wenn kein Schlüssel gesetzt ist", async () => {
    delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const { zugangstoken } = await import("../google-auth.js");

    await expect(zugangstoken(["scope"])).rejects.toThrow(/GOOGLE_SERVICE_ACCOUNT_JSON/);
  });

  it("nennt den Pfad, wenn die Schlüsseldatei nicht existiert", async () => {
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = "/gibt/es/nicht/schluessel.json";
    const { zugangstoken } = await import("../google-auth.js");

    await expect(zugangstoken(["scope"])).rejects.toThrow(/gibt es nicht/);
  });

  it("erkennt eine OAuth-Client-Datei als das falsche Format", async () => {
    /*
     * Der häufigste Fehlgriff in der Cloud Console: Unter „Anmeldedaten" liegt
     * die OAuth-Client-Datei direkt neben dem Dienstkonto-Schlüssel, beide
     * heißen JSON und beide sehen aus wie Zugangsdaten. Die eine hat aber
     * weder `client_email` noch `private_key`.
     */
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify({
      installed: { client_id: "…", client_secret: "…" },
    });
    const { zugangstoken } = await import("../google-auth.js");

    await expect(zugangstoken(["scope"])).rejects.toThrow(/service_account/);
  });
});
