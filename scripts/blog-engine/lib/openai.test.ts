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
import { istStrengErzwingbar } from "./openai";
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
