import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { empfehlungenFuer, seitenMitEmpfehlungen } from "@/lib/wissen/empfehlungen";
import { veroeffentlichteArtikel } from "@/lib/wissen/laden";
import { ohneKommentare } from "./quelltext";

/**
 * Interne Verlinkung von den Hauptseiten auf die Artikel.
 *
 * **Warum es diesen Test gibt.** Am 24.08.2026 wurde gegen die Live-Domain
 * gemessen: acht Hauptseiten, **null** Links auf einen Artikel. Der gesamte
 * Wissensbereich hing allein am Hub. Das war niemandem aufgefallen, weil kein
 * einzelner Commit es kaputt gemacht hatte — es war nie da.
 *
 * Genau solche Lücken schließt der Routen-Test nicht: Er prüft, dass jeder
 * vorhandene Link auf eine echte Route zeigt, nicht ob ein Link fehlt.
 */

const WURZEL = path.join(__dirname, "..", "..", "..");

function view(datei: string): string {
  return ohneKommentare(fs.readFileSync(path.join(WURZEL, "src", "views", datei), "utf8"));
}

function wrapper(datei: string): string {
  return ohneKommentare(fs.readFileSync(path.join(WURZEL, "src", "app", datei), "utf8"));
}

describe("Artikelempfehlungen auf den Hauptseiten", () => {
  it("liefert für jede eingetragene Seite Artikel", () => {
    for (const pfad of seitenMitEmpfehlungen()) {
      const treffer = empfehlungenFuer(pfad);
      expect(treffer.length, `${pfad} bekommt keine Artikel`).toBeGreaterThan(0);
    }
  });

  it("liefert nie denselben Artikel zweimal auf einer Seite", () => {
    for (const pfad of seitenMitEmpfehlungen()) {
      const slugs = empfehlungenFuer(pfad).map((a) => a.slug);
      expect(new Set(slugs).size, `${pfad} zeigt eine Dublette`).toBe(slugs.length);
    }
  });

  it("liefert nur veröffentlichte Artikel", () => {
    const erlaubt = new Set(veroeffentlichteArtikel().map((a) => a.slug));
    for (const pfad of seitenMitEmpfehlungen()) {
      for (const artikel of empfehlungenFuer(pfad)) {
        expect(erlaubt.has(artikel.slug), `${pfad} zeigt ${artikel.slug}`).toBe(true);
      }
    }
  });

  it("gibt nur die Felder weiter, die der Kasten anzeigt", () => {
    /* Die Views sind Client Components. Was hier durchgereicht wird, landet im
       ausgelieferten HTML — ein vollständiger Artikel mit allen Abschnitten
       würde jede Hauptseite um ein Vielfaches aufblähen. */
    const erlaubteFelder = ["slug", "titel", "teaser", "kategorie", "lesezeit"];
    for (const artikel of empfehlungenFuer("/")) {
      expect(Object.keys(artikel).sort()).toEqual([...erlaubteFelder].sort());
    }
  });

  it("gibt für eine unbekannte Seite nichts zurück", () => {
    expect(empfehlungenFuer("/gibt-es-nicht")).toEqual([]);
  });

  it("bindet den Block in jede Hauptseite ein, die Empfehlungen hat", () => {
    /* Der eigentliche Befund: Ohne diese Prüfung kann der Block aus einer View
       verschwinden, ohne dass ein Test rot wird. */
    const views: Record<string, string> = {
      "/": "Home.tsx",
      "/leistungen": "Leistungen.tsx",
      "/haltung": "Haltung.tsx",
      "/referenzen": "Referenzen.tsx",
      "/warum": "Warum.tsx",
      "/solo": "Segment.tsx",
      "/enterprise": "Segment.tsx",
    };

    for (const pfad of seitenMitEmpfehlungen()) {
      const datei = views[pfad];
      expect(datei, `Für ${pfad} ist keine View hinterlegt`).toBeTruthy();
      expect(view(datei), `${datei} rendert keinen WeiterlesenBlock`).toContain(
        "<WeiterlesenBlock"
      );
    }
  });

  it("lädt die Empfehlungen im Server-Wrapper, nicht in der View", () => {
    /* `empfehlungenFuer()` liest Dateien. In einer Client Component ("use
       client") bricht das zur Laufzeit. Der Aufruf gehört in die page.tsx. */
    const wrapperJeSeite: Record<string, string> = {
      "/": "page.tsx",
      "/leistungen": "leistungen/page.tsx",
      "/haltung": "haltung/page.tsx",
      "/referenzen": "referenzen/page.tsx",
      "/warum": "warum/page.tsx",
      "/solo": "solo/page.tsx",
      "/enterprise": "enterprise/page.tsx",
    };

    for (const [pfad, datei] of Object.entries(wrapperJeSeite)) {
      const quelle = wrapper(datei);
      expect(quelle, `${datei} ruft empfehlungenFuer nicht auf`).toContain("empfehlungenFuer");
      expect(quelle, `${datei} übergibt den falschen Pfad`).toContain(`empfehlungenFuer("${pfad}")`);
    }

    for (const datei of ["Home.tsx", "Leistungen.tsx", "Segment.tsx", "Haltung.tsx"]) {
      expect(view(datei), `${datei} ruft den Loader selbst auf`).not.toContain(
        "empfehlungenFuer("
      );
    }
  });

  it("hält die Hub-Überschrift bei einem Begriff mit Suchvolumen", () => {
    /* Die H1 lautete bis zum 24.08.2026 „Gratis-Wissen" — der Bereichsname,
       aber kein Suchbegriff. Der Bereichsname bleibt in Navigation und
       Brotkrume; die wichtigste Überschrift der Seite trägt jetzt das Thema. */
    const hub = ohneKommentare(
      fs.readFileSync(path.join(WURZEL, "src/views/wissen/UebersichtSeite.tsx"), "utf8")
    );
    const h1 = hub.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    expect(h1, "Hub hat keine H1").toBeTruthy();
    expect(h1![1]).toMatch(/KI im Mittelstand/i);
  });
});
