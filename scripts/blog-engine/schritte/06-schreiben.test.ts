/**
 * Selbstprüfung der Antwort-Normalisierung.
 *
 * Anlass: Am 28.08.2026 brach der Auto-Lauf mit „undefined is not iterable" ab —
 * nachdem das Modell den Artikel bereits geschrieben hatte (12.876 Token) und
 * DataForSEO bezahlt war. Ursache: Seit das ARTIKEL_SCHEMA als `json_object`
 * statt `strict` läuft, darf das Modell Felder weglassen; der Code spreizte sie
 * ungeprüft auf.
 *
 * ⚠️ Diese Tests halten fest, dass ein unvollständiges Modellergebnis zu einer
 * **lesbaren** Meldung führt, nicht zu einem Absturz. Sie prüfen nicht, ob der
 * Artikel gut ist — das tut das Zod-Schema, und genau dazu muss es überhaupt
 * erst kommen.
 */

import { describe, expect, it } from "vitest";
import { normalisiereModellantwort } from "./06-schreiben";

describe("normalisiereModellantwort", () => {
  it("füllt fehlende Listen auf oberster Ebene", () => {
    const roh = { titel: "X" } as never;
    const n = normalisiereModellantwort(roh);
    expect(n.kernaussagen).toEqual([]);
    expect(n.quellen).toEqual([]);
    expect(n.faq).toEqual([]);
    expect(n.interneLinks).toEqual([]);
    expect(n.abschnitte).toEqual([]);
  });

  /* Der Fall, der den Lauf gekostet hat. */
  it("füllt ein fehlendes paragraphs im Abschnitt", () => {
    const roh = { abschnitte: [{ heading: "Eins" }] } as never;
    const n = normalisiereModellantwort(roh);
    expect(n.abschnitte[0].paragraphs).toEqual([]);
    expect(() => [...n.abschnitte[0].paragraphs]).not.toThrow();
  });

  it("füllt ein fehlendes paragraphs im Unterabschnitt", () => {
    const roh = {
      abschnitte: [{ heading: "Eins", paragraphs: ["a"], unterabschnitte: [{ heading: "Zwei" }] }],
    } as never;
    const n = normalisiereModellantwort(roh);
    expect(n.abschnitte[0].unterabschnitte[0].paragraphs).toEqual([]);
  });

  it("erfindet nichts — vorhandene Werte bleiben unverändert", () => {
    const roh = {
      titel: "X",
      kernaussagen: ["eine"],
      abschnitte: [{ heading: "Eins", paragraphs: ["a", "b"] }],
    } as never;
    const n = normalisiereModellantwort(roh);
    expect(n.titel).toBe("X");
    expect(n.kernaussagen).toEqual(["eine"]);
    expect(n.abschnitte[0].paragraphs).toEqual(["a", "b"]);
  });

  it("ersetzt auch einen falschen Typ durch eine leere Liste", () => {
    /* Ohne Zwang kann das Modell statt einer Liste einen String liefern.
       `Array.isArray` faengt das; ein `?? []` allein taete es nicht. */
    const roh = { kernaussagen: "keine Liste", abschnitte: [] } as never;
    expect(normalisiereModellantwort(roh).kernaussagen).toEqual([]);
  });
});
