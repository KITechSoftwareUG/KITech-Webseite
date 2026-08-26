/**
 * Selbstprüfung des Auto-Modus.
 *
 * Was hier geprüft wird, ist nicht die Mechanik von git oder Coolify, sondern
 * die **Tore**: Wer darf ohne menschlichen Blick öffentlich werden und wer
 * nicht. Das ist die Stelle, an der die Entscheidung vom 26.08.2026 (Ayham:
 * Vollautomatik) verteidigungsfähig bleibt oder nicht.
 *
 * ⚠️ Fällt einer dieser Tests weg, veröffentlicht die Automatik still Dinge,
 * die vorher blockiert waren. Wer einen davon löscht, hebt eine Zusage auf,
 * nicht eine Prüfung.
 */

import { describe, expect, it } from "vitest";
import type { Artikel } from "@/lib/wissen/schema";
import { beurteile, pruefeBereitschaft } from "./veroeffentlichen";
import { SAUBER } from "./__tests__/vorlage";

describe("Auto-Modus: wer darf veröffentlicht werden", () => {
  it("lässt einen sauberen Artikel durch", () => {
    const urteil = beurteile(SAUBER);
    expect(urteil.darf, `blockiert mit: ${urteil.grund}`).toBe(true);
  });

  it("blockiert bei einem harten Befund — ohne Ausweg", () => {
    /* Anrede in der zweiten Person ist im Hausstil ein harter Befund. Von Hand
       ließe sich das mit --trotzdem überstimmen; die Automatik kennt das nicht. */
    const geduzt: Artikel = {
      ...SAUBER,
      abschnitte: [
        {
          ...SAUBER.abschnitte[0],
          paragraphs: [
            "Du merkst das an dem Tag, an dem dein Werkzeug einmal nicht läuft.",
            ...SAUBER.abschnitte[0].paragraphs.slice(1),
          ],
        },
        ...SAUBER.abschnitte.slice(1),
      ],
    };

    const urteil = beurteile(geduzt);
    expect(urteil.darf).toBe(false);
    expect(urteil.grund).toMatch(/harte Befunde/);
  });

  it("blockiert ohne belegten Eigenanteil", () => {
    /* Das Substanz-Tor steht doppelt: Das Qualitätsmodul meldet den fehlenden
       Beleg bereits als harten Befund, `beurteile` fragt zusätzlich nach. Der
       Test prüft deshalb die Wirkung — blockiert —, nicht den Wortlaut der
       Begründung. Sonst bricht er, sobald das eine Tor vor dem anderen greift. */
    const ohneSubstanz = { ...SAUBER, substanz: undefined } as unknown as Artikel;
    expect(beurteile(ohneSubstanz).darf).toBe(false);

    /* Und der Fall, den nur die zweite Abfrage fängt: Herkunft da, Beschreibung leer. */
    const ohneBeschreibung = {
      ...SAUBER,
      substanz: { ...SAUBER.substanz, beschreibung: "" },
    } as unknown as Artikel;
    const urteil = beurteile(ohneBeschreibung);
    expect(urteil.darf).toBe(false);
  });

  it("hält wegen weicher Warnungen nicht an", () => {
    /* 81 Regeln erzeugen auf jedem echten Text ein paar Treffer. Eine Schwelle,
       die niemand erreicht, wäre keine Prüfung, sondern eine Blockade — und
       nach zwei Wochen würde sie herausgenommen statt beachtet. */
    const urteil = beurteile(SAUBER);
    expect(urteil.darf).toBe(true);
    expect(typeof urteil.warnungen).toBe("number");
  });
});

describe("Auto-Modus: Vorbedingungen", () => {
  const vorher = process.env.BLOG_ENGINE_FREIGABE_VON;

  it("veröffentlicht nicht namenlos", () => {
    delete process.env.BLOG_ENGINE_FREIGABE_VON;
    const bereitschaft = pruefeBereitschaft();
    expect(bereitschaft.bereit).toBe(false);
    expect(bereitschaft.grund).toMatch(/BLOG_ENGINE_FREIGABE_VON/);
    process.env.BLOG_ENGINE_FREIGABE_VON = vorher;
  });

  it("nimmt keinen Namen, der keiner ist", () => {
    process.env.BLOG_ENGINE_FREIGABE_VON = "X";
    const bereitschaft = pruefeBereitschaft();
    expect(bereitschaft.bereit).toBe(false);
    process.env.BLOG_ENGINE_FREIGABE_VON = vorher;
  });

  it("gibt den Namen weiter, unter dem freigegeben wird", () => {
    process.env.BLOG_ENGINE_FREIGABE_VON = "Ayham Alkhalil";
    const bereitschaft = pruefeBereitschaft();
    /* Der Zweig muss main sein — läuft der Test in einem anderen Zweig, ist
       nicht der Name das Problem, und der Test soll das dann auch sagen. */
    if (bereitschaft.bereit) {
      expect(bereitschaft.von).toBe("Ayham Alkhalil");
    } else {
      expect(bereitschaft.grund).toMatch(/nicht auf main/);
    }
    process.env.BLOG_ENGINE_FREIGABE_VON = vorher;
  });
});
