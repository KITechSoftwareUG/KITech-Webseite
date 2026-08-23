import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ohneKommentare } from "./quelltext";
import { buildGlossaryIndexSchema, buildGlossaryTermSchema } from "../glossary-schema";
import { glossaryTerms } from "../../data/glossary";

/**
 * Eine Seite darf nur **eine** BreadcrumbList ausgeben.
 *
 * **Warum das ein Test ist.** `/glossar` lieferte bis zum 23.08.2026 zwei
 * BreadcrumbList-Knoten für denselben Pfad: einen aus
 * `buildGlossaryIndexSchema()`, einen zusätzlich aus der View. Sie
 * unterschieden sich nur in der Beschriftung des ersten Elements — „Start >
 * Glossar" gegen „Startseite > Glossar".
 *
 * Das ist kein zulässiger Alternativpfad (die gäbe es nur bei Seiten, die
 * wirklich über zwei Wege erreichbar sind), sondern eine Dublette aus zwei
 * Einbauorten. Welchen Google für das Suchergebnis nimmt, ist dann Zufall.
 *
 * Der Fehler war im Quelltext nicht zu sehen: Die View spreadete eine Funktion,
 * die mehrere Schemas liefert, und die Absicht des Kommentars dort war, das
 * Spreaden zu erklären — nicht, den Inhalt aufzuzählen. Sichtbar wurde er erst
 * im ausgelieferten HTML.
 */

/** Zählt BreadcrumbList-Knoten in einer Schema-Liste. */
function breadcrumbs(schemas: unknown[]): Record<string, unknown>[] {
  return schemas.filter(
    (s): s is Record<string, unknown> =>
      typeof s === "object" && s !== null && (s as Record<string, unknown>)["@type"] === "BreadcrumbList"
  );
}

describe("Breadcrumbs sind eindeutig", () => {
  it("die Glossar-Übersicht liefert genau eine BreadcrumbList", () => {
    const gefunden = breadcrumbs(buildGlossaryIndexSchema());
    expect(
      gefunden.length,
      `buildGlossaryIndexSchema() liefert ${gefunden.length} BreadcrumbList-Knoten. ` +
        `Wer in der View eine weitere ergänzt, erzeugt eine Dublette.`
    ).toBe(1);
  });

  for (const term of glossaryTerms) {
    it(`/glossar/${term.slug} liefert genau eine BreadcrumbList`, () => {
      expect(breadcrumbs(buildGlossaryTermSchema(term)).length).toBe(1);
    });
  }

  /**
   * Die Lücke, die der Test oben nicht schließt: Er prüft die Schema-Funktionen,
   * aber der Fehler saß in der **View**, die zusätzlich zur Sammelfunktion einen
   * eigenen Breadcrumb-Aufruf hatte.
   *
   * Deshalb hier die statische Gegenprobe: Keine View darf gleichzeitig eine
   * Schema-Sammelfunktion spreaden **und** selbst `getBreadcrumbSchema` rufen.
   * Die Sammelfunktionen bringen ihre Breadcrumb mit — das ist die Stelle, an
   * der die Dublette entsteht, ohne dass man sie im Quelltext sieht.
   */
  it("keine View kombiniert eine Schema-Sammelfunktion mit einem eigenen Breadcrumb", () => {
    const SAMMELFUNKTIONEN = ["buildGlossaryIndexSchema", "buildGlossaryTermSchema"];
    const views = fs
      .readdirSync("src/views", { recursive: true, encoding: "utf8" })
      .filter((d) => typeof d === "string" && d.endsWith(".tsx") && !d.startsWith("legacy"));

    for (const datei of views) {
      const quelle = ohneKommentare(fs.readFileSync(path.join("src/views", datei), "utf8"));
      const nutztSammler = SAMMELFUNKTIONEN.some((f) => quelle.includes(`${f}(`));
      if (!nutztSammler) continue;

      expect(
        quelle.includes("getBreadcrumbSchema("),
        `src/views/${datei} ruft eine Schema-Sammelfunktion UND getBreadcrumbSchema — ` +
          `die Sammelfunktion bringt die Breadcrumb bereits mit, das ergibt zwei Knoten.`
      ).toBe(false);
    }
  });

  /**
   * Die Beschriftung des ersten Elements muss überall dieselbe sein — sonst
   * steht in der Suche mal „Start", mal „Startseite" vor demselben Pfad. Der
   * Rest der Website nutzt „Startseite" (34 Stellen gegen 2).
   */
  it("das erste Element heißt überall „Startseite“", () => {
    const alle = [buildGlossaryIndexSchema(), ...glossaryTerms.map(buildGlossaryTermSchema)];

    for (const schemas of alle) {
      for (const krume of breadcrumbs(schemas)) {
        const liste = krume.itemListElement as { name: string }[];
        expect(
          liste[0]?.name,
          `Erstes Breadcrumb-Element heißt „${liste[0]?.name}“ statt „Startseite“.`
        ).toBe("Startseite");
      }
    }
  });
});
