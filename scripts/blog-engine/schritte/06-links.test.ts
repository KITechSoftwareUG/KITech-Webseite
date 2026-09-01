/**
 * Selbstprüfung des Link-Nachtrags.
 *
 * Anlass: Der Auto-Lauf vom 01.09.2026 starb an
 * „interneLinks: Array must contain at least 3 element(s)" — nach bezahlter
 * Recherche und auch nach dem Korrekturanlauf. Ursache: `pruefeAnkertexte`
 * entfernt Links, deren Ankertext nicht wörtlich im Absatz steht; das Schema
 * verlangt aber drei. Filter und Mindestzahl arbeiten gegeneinander.
 *
 * ⚠️ Der wichtigste Test hier ist der letzte: Was der Nachtrag ergänzt, muss
 * den Filter überstehen. Ein Nachtrag, der Links erzeugt, die `pruefeAnkertexte`
 * gleich wieder wegwirft, tauscht nur einen Fehlschlag gegen einen anderen.
 */

import { describe, expect, it } from "vitest";
import type { Artikel } from "@/lib/wissen/schema";
import { ergaenzeInterneLinks, pruefeAnkertexte } from "./06-schreiben";

const BESTAND = [
  { slug: "ki-setup-im-betrieb", titel: "Was ein KI-Setup im Betrieb ausmacht", zielKeyword: "ki setup betrieb" },
  { slug: "automatisierung-nachts", titel: "Wenn eine Automatisierung nachts abstürzt", zielKeyword: "automatisierung absturz" },
  { slug: "e-rechnung-2027", titel: "E-Rechnung ab 2027", zielKeyword: "e-rechnung pflicht" },
] as unknown as Artikel[];

const ERLAUBT = new Set(BESTAND.map((a) => `/gratis-wissen/${a.slug}`));

function artikelMit(links: unknown[], texte: string[]): Artikel {
  return {
    intro: "Ein Einstieg ohne Fachbegriffe.",
    abschnitte: texte.map((p, i) => ({ heading: `Abschnitt ${i}`, paragraphs: [p] })),
    interneLinks: links,
  } as unknown as Artikel;
}

describe("ergaenzeInterneLinks", () => {
  it("rührt nichts an, wenn schon drei Links da sind", () => {
    const a = artikelMit([{ ziel: "/x", ankertext: "a", abschnitt: 0 }, { ziel: "/y", ankertext: "b", abschnitt: 0 }, { ziel: "/z", ankertext: "c", abschnitt: 0 }], ["egal"]);
    expect(ergaenzeInterneLinks(a, BESTAND, ERLAUBT).interneLinks).toHaveLength(3);
  });

  it("ergänzt aus Begriffen, die wörtlich im Text stehen", () => {
    const a = artikelMit([], [
      "Wer ki setup betrieb ernst nimmt, plant anders.",
      "Und automatisierung absturz ist kein Randfall.",
      "Dazu kommt e-rechnung pflicht ab 2027.",
    ]);
    const n = ergaenzeInterneLinks(a, BESTAND, ERLAUBT);
    expect(n.interneLinks).toHaveLength(3);
  });

  /* Die wichtigste Zusage: nichts erfinden. */
  it("erfindet nichts, wenn kein Begriff im Text steht", () => {
    const a = artikelMit([], ["Ein Text über etwas ganz anderes.", "Noch ein Absatz."]);
    expect(ergaenzeInterneLinks(a, BESTAND, ERLAUBT).interneLinks).toHaveLength(0);
  });

  it("verlinkt dasselbe Ziel nicht zweimal", () => {
    const a = artikelMit([{ ziel: "/gratis-wissen/ki-setup-im-betrieb", ankertext: "x", abschnitt: 0 }], [
      "ki setup betrieb steht hier und Was ein KI-Setup im Betrieb ausmacht auch.",
    ]);
    const ziele = ergaenzeInterneLinks(a, BESTAND, ERLAUBT).interneLinks.map((l) => l.ziel);
    expect(new Set(ziele).size).toBe(ziele.length);
  });

  /* Der Test, auf den es ankommt. */
  it("was ergänzt wird, überlebt den Filter", () => {
    const a = artikelMit([], [
      "Wer ki setup betrieb ernst nimmt, plant anders.",
      "Und automatisierung absturz ist kein Randfall.",
      "Dazu kommt e-rechnung pflicht ab 2027.",
    ]);
    const ergaenzt = ergaenzeInterneLinks(a, BESTAND, ERLAUBT);
    const nachFilter = pruefeAnkertexte(ergaenzt, ERLAUBT);
    expect(nachFilter.interneLinks).toHaveLength(ergaenzt.interneLinks.length);
    expect(nachFilter.interneLinks.length).toBeGreaterThanOrEqual(3);
  });
});
