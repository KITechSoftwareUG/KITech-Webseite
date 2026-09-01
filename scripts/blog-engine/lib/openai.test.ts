/**
 * Selbstprüfung des OpenAI-Adapters.
 *
 * Der Anlass ist konkret: Am 27.08.2026 brach der erste Auto-Lauf im
 * Schreibschritt mit HTTP 400 ab, weil `strict: true` gesetzt wurde, obwohl das
 * Artikel-Schema es nicht trägt — `bullets` ist in `abschnitte.items` optional,
 * und die damalige Prüfung sah nur die oberste Ebene. Bezahlt war die
 * Keyword-Recherche da schon.
 *
 * ⚠️ Ein falsch gesetztes `strict` kostet den ganzen Lauf; ein zu lockeres
 * kostet einen Nachbesserungsdurchgang. Im Zweifel `false`.
 */

import { describe, expect, it } from "vitest";
import { istStrengErzwingbar, openAiAufruf } from "./openai";
import { ARTIKEL_SCHEMA } from "../schritte/06-schreiben";

describe("istStrengErzwingbar", () => {
  it("nimmt ein durchgehend strenges Schema an", () => {
    expect(
      istStrengErzwingbar({
        type: "object",
        additionalProperties: false,
        required: ["a"],
        properties: { a: { type: "string" } },
      })
    ).toBe(true);
  });

  it("lehnt ab, wenn oben ein Feld optional ist", () => {
    expect(
      istStrengErzwingbar({
        type: "object",
        additionalProperties: false,
        required: [],
        properties: { a: { type: "string" } },
      })
    ).toBe(false);
  });

  it("lehnt ab, wenn additionalProperties fehlt", () => {
    expect(
      istStrengErzwingbar({
        type: "object",
        required: ["a"],
        properties: { a: { type: "string" } },
      })
    ).toBe(false);
  });

  /* Der Fall, der den Lauf gekostet hat: oben alles sauber, tief drin nicht. */
  it("findet ein optionales Feld erst in einem verschachtelten Array", () => {
    expect(
      istStrengErzwingbar({
        type: "object",
        additionalProperties: false,
        required: ["liste"],
        properties: {
          liste: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["pflicht"],
              properties: {
                pflicht: { type: "string" },
                optional: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      })
    ).toBe(false);
  });

  it("lehnt Kombinatoren ab", () => {
    expect(istStrengErzwingbar({ anyOf: [{ type: "string" }, { type: "number" }] })).toBe(false);
  });

  /* Das echte Schema der Engine. Es TRAEGT strict nicht — und genau das muss
     die Pruefung sagen, sonst antwortet die API wieder mit 400. Wird das Schema
     eines Tages durchgehend streng gebaut, schlaegt dieser Test fehl und will
     dann umgedreht werden. */
  it("erkennt, dass ARTIKEL_SCHEMA strict nicht trägt", () => {
    expect(istStrengErzwingbar(ARTIKEL_SCHEMA)).toBe(false);
  });
});

describe("Schema im Prompt, wenn strict nicht geht", () => {
  /**
   * Der Fall, der vier Laeufe gekostet hat: `json_object` verlangt nur
   * „irgendein gueltiges JSON". Die Feldnamen standen nirgends — in prompts/
   * kommen `ankertext` und `paragraphs` null Mal vor. Das Modell riet, und zwar
   * falsch: Links ohne `ziel`, Abschnitte ohne `heading`.
   *
   * ⚠️ Dieser Test greift die HTTP-Anfrage ab. Er prueft die einzige Frage, auf
   * die es ankommt: Steht das Schema im gesendeten Text?
   */
  it("haengt das Schema an die Nutzernachricht", async () => {
    const echt = globalThis.fetch;
    let gesendet = "";

    globalThis.fetch = (async (_url: string, init: { body: string }) => {
      gesendet = init.body;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: "{}" }, finish_reason: "stop" }],
          usage: { prompt_tokens: 1, completion_tokens: 1 },
        }),
      };
    }) as unknown as typeof fetch;

    try {
      await openAiAufruf({
        schluessel: "test",
        system: "sys",
        nachricht: "Schreib etwas.",
        modell: "gpt-5.5",
        maxTokens: 100,
        timeoutMs: 5000,
        /* Traegt strict NICHT: `bullets` ist optional. Genau die Form des
           echten ARTIKEL_SCHEMA. */
        schema: {
          type: "object",
          properties: {
            abschnitte: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["heading"],
                properties: {
                  heading: { type: "string" },
                  bullets: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
      });
    } finally {
      globalThis.fetch = echt;
    }

    const koerper = JSON.parse(gesendet);
    expect(koerper.response_format.type).toBe("json_object");

    const nutzertext = koerper.messages[1].content;
    expect(nutzertext).toContain("Schreib etwas.");
    expect(nutzertext, "der Feldname muss im Prompt stehen").toContain("bullets");
    expect(nutzertext).toContain("heading");
  });

  it("haengt nichts an, wenn das Schema strict traegt", async () => {
    const echt = globalThis.fetch;
    let gesendet = "";
    globalThis.fetch = (async (_url: string, init: { body: string }) => {
      gesendet = init.body;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: "{}" }, finish_reason: "stop" }],
          usage: {},
        }),
      };
    }) as unknown as typeof fetch;

    try {
      await openAiAufruf({
        schluessel: "test",
        system: "sys",
        nachricht: "Schreib etwas.",
        modell: "gpt-5.5",
        maxTokens: 100,
        timeoutMs: 5000,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["a"],
          properties: { a: { type: "string" } },
        },
      });
    } finally {
      globalThis.fetch = echt;
    }

    const koerper = JSON.parse(gesendet);
    expect(koerper.response_format.type).toBe("json_schema");
    expect(koerper.messages[1].content).toBe("Schreib etwas.");
  });
});
