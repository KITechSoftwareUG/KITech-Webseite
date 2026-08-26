import { describe, expect, it } from "vitest";
import { veroeffentlichteArtikel, alleCluster } from "../wissen/laden";
import fs from "node:fs";
import path from "node:path";
import { BESCHREIBUNG_MAX, TITEL_MAX, kuerze } from "@/lib/metadata";

/**
 * Titel- und Beschreibungslängen im Blick behalten.
 *
 * **Anlass (20.08.2026):** Eine Auswertung aller 48 vorgerenderten Seiten fand
 * sechs Beschreibungen über der Kürzungsgrenze — die Startseite mit 230
 * Zeichen — und drei Titel über 70 Zeichen, den längsten mit 82. Gekürzt wird
 * im Suchergebnis am Ende, und am Ende stand bei uns jeweils das Angebot.
 *
 * **Was hier NICHT geprüft wird:** ob der Text gut ist. Länge ist die einzige
 * Eigenschaft einer Beschreibung, die sich automatisch beurteilen lässt.
 *
 * Der Test liest die Quelldateien statt eines Builds — er soll auch dann
 * laufen, wenn gerade nichts gebaut ist. Deshalb greift er nur String-Literale
 * ab; zusammengesetzte Titel (Artikel, Autoren, Themen) prüft der zweite Block
 * über die echten Daten.
 */

const APP = path.join(process.cwd(), "src", "app");

/** Alle `page.tsx` unter `src/app`, ohne den Alt-Bestand. */
function seitenDateien(verzeichnis: string, gefunden: string[] = []): string[] {
  for (const eintrag of fs.readdirSync(verzeichnis, { withFileTypes: true })) {
    const voll = path.join(verzeichnis, eintrag.name);
    if (eintrag.isDirectory()) seitenDateien(voll, gefunden);
    else if (eintrag.name === "page.tsx") gefunden.push(voll);
  }
  return gefunden;
}

/**
 * Zieht `title:` und `description:` aus einem `buildMetadata({…})`-Aufruf,
 * sofern sie als einfaches String-Literal dastehen.
 *
 * Template-Literale (`${…}`) werden übersprungen: Ihr Wert steht erst zur
 * Laufzeit fest. Für die häufigen Fälle davon gibt es den zweiten Block.
 */
function literale(quelle: string, feld: "title" | "description"): string[] {
  const treffer = [...quelle.matchAll(new RegExp(`${feld}:\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`, "g"))];
  return treffer.map((m) => m[1].replace(/\\"/g, '"'));
}

describe("Metadaten-Längen", () => {
  const dateien = seitenDateien(APP);

  it("findet überhaupt Seiten", () => {
    expect(dateien.length).toBeGreaterThan(20);
  });

  it("kein Titel über der Kürzungsgrenze", () => {
    const zuLang: string[] = [];

    for (const datei of dateien) {
      const quelle = fs.readFileSync(datei, "utf8");
      for (const titel of literale(quelle, "title")) {
        if (titel.length > TITEL_MAX) {
          zuLang.push(`${path.relative(process.cwd(), datei)} (${titel.length}): ${titel}`);
        }
      }
    }

    expect(zuLang, `Titel über ${TITEL_MAX} Zeichen:\n${zuLang.join("\n")}`).toEqual([]);
  });

  it("keine Beschreibung über der Kürzungsgrenze", () => {
    const zuLang: string[] = [];

    for (const datei of dateien) {
      const quelle = fs.readFileSync(datei, "utf8");
      for (const text of literale(quelle, "description")) {
        if (text.length > BESCHREIBUNG_MAX) {
          zuLang.push(`${path.relative(process.cwd(), datei)} (${text.length}): ${text.slice(0, 80)}…`);
        }
      }
    }

    expect(zuLang, `Beschreibungen über ${BESCHREIBUNG_MAX} Zeichen:\n${zuLang.join("\n")}`).toEqual([]);
  });
});

describe("kuerze()", () => {
  it("lässt kurze Texte unangetastet", () => {
    expect(kuerze("Kurz und gut.", 40)).toBe("Kurz und gut.");
  });

  it("hält die Grenze ein", () => {
    const lang = "Ein sehr langer Satz, der auf jeden Fall über die gesetzte Grenze hinausgeht und deshalb gekürzt werden muss.";
    expect(kuerze(lang, 40).length).toBeLessThanOrEqual(40);
  });

  it("schneidet an der Wortgrenze, nicht mitten im Wort", () => {
    const gekuerzt = kuerze("Automatisierung rechnet sich selten dort, wo sie am einfachsten ist", 30);
    expect(gekuerzt.endsWith("…")).toBe(true);
    expect(gekuerzt.slice(0, -1).trim().split(" ").at(-1)).not.toBe("einfachs");
  });

  it("lässt kein Satzzeichen vor dem Auslassungszeichen stehen", () => {
    expect(kuerze("Erst ein Teil, dann noch viel mehr Text als hineinpasst", 20)).not.toMatch(/[,;:]…$/);
  });
});

/**
 * Titel, die NICHT als String-Literal im Code stehen.
 *
 * **Die Lücke, die das schließt.** Der Block oben liest String-Literale aus den
 * `page.tsx` unter `src/app/`. Ein Titel, der zur Laufzeit aus einer JSON-Datei
 * oder einer Datendatei zusammengesetzt wird, läuft daran vorbei — und genau so
 * stand am 26.08.2026 ein Artikel mit **71 Zeichen** live, während der Test grün
 * war.
 *
 * Geprüft wird deshalb der Wert, den `generateMetadata` tatsächlich baut.
 */
describe("Titel aus Datendateien", () => {
  it("jeder veröffentlichte Artikel hat einen Suchtitel im Korridor", () => {
    const zuLang = veroeffentlichteArtikel()
      .map((a) => ({ slug: a.slug, titel: a.metaTitel ?? a.titel }))
      .filter((a) => a.titel.length > TITEL_MAX)
      .map((a) => `  ${a.titel.length} Zeichen  ${a.slug}: „${a.titel}“`);

    expect(
      zuLang,
      `Diese Artikel liefern einen <title> über ${TITEL_MAX} Zeichen.\n` +
        `Lösung: Feld "metaTitel" in der JSON-Datei setzen — die H1 bleibt davon unberührt.\n` +
        zuLang.join("\n")
    ).toEqual([]);
  });

  it("jede Themenseite hat einen Titel im Korridor", () => {
    /* Dasselbe Muster wie in der Themenseite: Der Zusatz wird nur angehängt,
       wenn er passt — sonst steht der Thementitel allein. Wer die Route ändert,
       ändert auch hier. */
    const zusatz = " – Gratis-Wissen";
    const zuLang = alleCluster()
      .map((c) => (c.titel.length + zusatz.length <= TITEL_MAX ? `${c.titel}${zusatz}` : c.titel))
      .filter((t) => t.length > TITEL_MAX);

    expect(
      zuLang,
      `Themenseiten-Titel über ${TITEL_MAX} Zeichen — hier hilft nur ein kürzerer ` +
        `Cluster-Titel in content/seo/cluster.json:\n${zuLang.join("\n")}`
    ).toEqual([]);
  });

  /**
   * Die Gegenprobe zum Feld selbst: Ein `metaTitel`, der genauso lang ist wie
   * der Titel, ist ein vergessener Handgriff — dann hat jemand das Feld gesetzt,
   * ohne zu kürzen.
   */
  it("metaTitel ist kürzer als der Titel, wo er gesetzt ist", () => {
    const sinnlos = veroeffentlichteArtikel()
      .filter((a) => a.metaTitel && a.metaTitel.length >= a.titel.length)
      .map((a) => `  ${a.slug}: metaTitel ${a.metaTitel!.length} >= titel ${a.titel.length}`);

    expect(sinnlos, `metaTitel ohne Wirkung:\n${sinnlos.join("\n")}`).toEqual([]);
  });
});
