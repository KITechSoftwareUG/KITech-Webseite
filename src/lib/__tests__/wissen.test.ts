import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  alleArtikel,
  alleAutoren,
  alleCluster,
  artikelImCluster,
  veroeffentlichteArtikel,
  verlinkungsBild,
} from "@/lib/wissen/laden";
import { staticRoutePaths } from "@/config/navigation";
import { glossaryTerms } from "@/data/glossary";
import { clientResults } from "@/data/client-results";

/**
 * Prüfung des Artikelbestands unter `content/wissen/`.
 *
 * **Warum dieser Test existiert.** Die Artikel entstehen automatisch. Ein
 * Programm, das täglich schreibt, macht keine Tippfehler — es macht
 * systematische Fehler, und zwar in jedem Artikel gleichzeitig: ein Link auf
 * eine Route, die es nicht mehr gibt; zwei Artikel auf dasselbe Keyword; ein
 * Beleg, der fehlt. Genau das fängt dieser Test ab, bevor es deployt wird.
 *
 * Das Zod-Schema prüft die *Form* eines einzelnen Artikels. Hier wird geprüft,
 * was nur im Zusammenhang sichtbar ist: Beziehungen zwischen Artikeln, zum
 * Routenbestand und zur Verlinkungsstruktur.
 *
 * Läuft mit `npm test` mit. Ein leeres `content/wissen/` lässt alle Prüfungen
 * durchlaufen — bis der erste Artikel da ist, gibt es nichts zu prüfen.
 */

const PROJEKT_WURZEL = process.cwd();
const APP_VERZEICHNIS = path.join(PROJEKT_WURZEL, "src", "app");

/** Dieselbe Ableitung wie in `routes.test.ts`: Routen aus dem Dateisystem. */
function findeRouten(verzeichnis: string, prefix = ""): string[] {
  const routen: string[] = [];

  for (const eintrag of fs.readdirSync(verzeichnis, { withFileTypes: true })) {
    if (eintrag.isDirectory()) {
      if (eintrag.name.startsWith("_")) continue;
      const segment = eintrag.name.startsWith("(") ? "" : `/${eintrag.name}`;
      routen.push(...findeRouten(path.join(verzeichnis, eintrag.name), `${prefix}${segment}`));
    } else if (eintrag.name === "page.tsx") {
      routen.push(prefix === "" ? "/" : prefix);
    }
  }

  return routen;
}

const vorhandeneRouten = findeRouten(APP_VERZEICHNIS);

/** Alle Ziele, auf die ein Artikel intern zeigen darf. */
function erlaubteZiele(): Set<string> {
  const ziele = new Set<string>([
    ...staticRoutePaths,
    ...vorhandeneRouten.filter((route) => !route.includes("[")),
    ...glossaryTerms.map((term) => `/glossar/${term.slug}`),
    ...clientResults.map((result) => `/referenzen/${result.slug}`),
    ...veroeffentlichteArtikel().map((artikel) => `/gratis-wissen/${artikel.slug}`),
    ...alleCluster().map((cluster) => `/gratis-wissen/thema/${cluster.slug}`),
    ...alleAutoren().map((autor) => `/autoren/${autor.slug}`),
  ]);

  return ziele;
}

describe("Artikelbestand", () => {
  it("lädt und validiert ohne Fehler", () => {
    expect(() => alleArtikel()).not.toThrow();
  });

  it("hat eindeutige Slugs", () => {
    const slugs = alleArtikel().map((artikel) => artikel.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("vergibt jedes Zielkeyword höchstens einmal", () => {
    const belegt = new Map<string, string>();

    for (const artikel of veroeffentlichteArtikel()) {
      const schluessel = artikel.zielKeyword.trim().toLowerCase();
      const schonDa = belegt.get(schluessel);

      expect(
        schonDa,
        `"${artikel.zielKeyword}" ist doppelt vergeben: ${schonDa} und ${artikel.slug}. ` +
          `Zwei Artikel auf dasselbe Ziel konkurrieren gegeneinander statt gegen den Wettbewerb.`
      ).toBeUndefined();

      belegt.set(schluessel, artikel.slug);
    }
  });

  it("nennt für jeden veröffentlichten Artikel eine Freigabe", () => {
    for (const artikel of veroeffentlichteArtikel()) {
      expect(artikel.freigabe, `${artikel.slug} steht live, ohne dass jemand freigegeben hat`)
        .toBeDefined();
    }
  });

  it("belegt bei jedem Artikel den nicht generierbaren Anteil", () => {
    /* Der Kern des Ganzen. Google unterscheidet zwischen „commodity content" und
       Inhalten mit „unique expert or experienced takes" — und die Messlatte in
       der eigenen Anleitung lautet, nichts zu veröffentlichen, was „could easily
       be produced by a generative AI model". Ohne diesen Beleg ist ein Artikel
       genau das. */
    for (const artikel of alleArtikel()) {
      expect(artikel.substanz.beschreibung.length).toBeGreaterThanOrEqual(40);
      expect(artikel.substanz.herkunft.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("nennt einen Autor, der existiert — nie ein Modell", () => {
    const bekannt = new Set(alleAutoren().map((autor) => autor.slug));

    for (const artikel of alleArtikel()) {
      expect(bekannt.has(artikel.autor), `${artikel.slug}: Autor "${artikel.autor}" unbekannt`)
        .toBe(true);
      /* Google rät ausdrücklich davon ab, einem Modell eine Byline zu geben. */
      expect(artikel.autor).not.toMatch(/^(ki|ai|claude|gpt|bot|redaktion)$/i);
    }
  });

  it("hängt jeden Artikel an ein Thema, das es gibt", () => {
    const bekannt = new Set(alleCluster().map((cluster) => cluster.slug));

    for (const artikel of alleArtikel()) {
      expect(bekannt.has(artikel.cluster), `${artikel.slug}: Thema "${artikel.cluster}" unbekannt`)
        .toBe(true);
    }
  });
});

describe("Interne Verlinkung", () => {
  it("zeigt nur auf Seiten, die es gibt", () => {
    const ziele = erlaubteZiele();

    for (const artikel of veroeffentlichteArtikel()) {
      for (const link of artikel.interneLinks) {
        expect(
          ziele.has(link.ziel),
          `${artikel.slug} verlinkt "${link.ankertext}" auf ${link.ziel} — diese Seite gibt es nicht.`
        ).toBe(true);
      }
    }
  });

  it("verlinkt nicht auf sich selbst", () => {
    for (const artikel of veroeffentlichteArtikel()) {
      for (const link of artikel.interneLinks) {
        expect(link.ziel).not.toBe(`/gratis-wissen/${artikel.slug}`);
      }
    }
  });

  it("verwendet innerhalb eines Artikels keinen Ankertext zweimal", () => {
    for (const artikel of veroeffentlichteArtikel()) {
      const anker = artikel.interneLinks.map((link) => link.ankertext.trim().toLowerCase());
      expect(
        new Set(anker).size,
        `${artikel.slug} nutzt denselben Ankertext mehrfach. Nur die erste Fundstelle wird verlinkt — ` +
          `der zweite Link fällt still aus.`
      ).toBe(anker.length);
    }
  });

  it("setzt jeden Ankertext an eine Stelle, an der er wirklich steht", () => {
    /* Der Fehler, der hier abgefangen wird, ist unsichtbar: Ein Link, dessen
       Ankertext nicht im Absatz vorkommt, wird nicht gerendert. Er steht im
       JSON, wird gezählt, taucht in jeder Auswertung auf — und existiert auf
       der Seite nicht. Beim Umstellen der drei Bestandsartikel waren das
       fünfzehn von fünfzehn. */
    for (const artikel of veroeffentlichteArtikel()) {
      for (const link of artikel.interneLinks) {
        const abschnitt =
          link.abschnitt === "intro" ? null : artikel.abschnitte[link.abschnitt];

        const text =
          link.abschnitt === "intro"
            ? artikel.intro
            : [
                abschnitt?.paragraphs.join(" ") ?? "",
                ...(abschnitt?.unterabschnitte ?? []).map((u) => u.paragraphs.join(" ")),
              ].join(" ");

        expect(
          text.includes(link.ankertext),
          `${artikel.slug}: "${link.ankertext}" steht nicht in Abschnitt ${link.abschnitt} — ` +
            `der Link wird nicht gerendert.`
        ).toBe(true);
      }
    }
  });

  it("verweist auf jeden Abschnitt, den es gibt", () => {
    for (const artikel of veroeffentlichteArtikel()) {
      for (const link of artikel.interneLinks) {
        if (link.abschnitt === "intro") continue;
        expect(
          link.abschnitt,
          `${artikel.slug}: Link "${link.ankertext}" zeigt auf Abschnitt ${link.abschnitt}, ` +
            `der Artikel hat aber nur ${artikel.abschnitte.length}.`
        ).toBeLessThan(artikel.abschnitte.length);
      }
    }
  });

  it("überlädt keine Zielseite", () => {
    /* Die Auswertung von 23 Mio. internen Links über 1.800 Websites (Zyppy)
       findet den Zusammenhang zwischen eingehenden internen Links und Suchklicks
       bis etwa 45 steigend — und danach fallend. Der Test schlägt bei 60 an, weil
       das kein scharfer Schwellenwert ist, sondern ein Korridor: Ab dort ist es
       kein Zufall mehr, sondern ein Muster, das jemand angesehen haben sollte. */
    for (const [ziel, eintrag] of verlinkungsBild()) {
      expect(
        eintrag.anzahl,
        `${ziel} bekommt ${eintrag.anzahl} interne Links aus Artikeln. Ab etwa 45–50 kehrt ` +
          `sich der gemessene Zusammenhang um — Links auf andere Ziele verteilen.`
      ).toBeLessThan(60);
    }
  });

  it("variiert die Ankertexte je Zielseite", () => {
    /* Der stärkste Zusammenhang der Zyppy-Auswertung war nicht die Zahl der
       Links, sondern die Vielfalt der Ankertexte auf dieselbe Seite. Zehnmal
       derselbe Anker zählt dort wie ein einziger redaktioneller Link. */
    for (const [ziel, eintrag] of verlinkungsBild()) {
      if (eintrag.anzahl < 5) continue;

      const vielfalt = eintrag.ankertexte.size / eintrag.anzahl;
      expect(
        vielfalt,
        `${ziel}: ${eintrag.anzahl} Links, aber nur ${eintrag.ankertexte.size} verschiedene ` +
          `Ankertexte. Formulierungen variieren.`
      ).toBeGreaterThan(0.4);
    }
  });
});

describe("Themen und Autoren", () => {
  it("hat für jedes Thema mit Artikeln eine erreichbare Hub-Seite", () => {
    for (const cluster of alleCluster()) {
      if (artikelImCluster(cluster.slug).length === 0) continue;
      expect(vorhandeneRouten).toContain("/gratis-wissen/thema/[cluster]");
    }
  });

  it("führt jeden Autor mit belegbarem Hintergrund", () => {
    for (const autor of alleAutoren()) {
      expect(autor.themen.length).toBeGreaterThanOrEqual(2);
      expect(autor.kurzbeschreibung.length).toBeGreaterThanOrEqual(80);
    }
  });
});
