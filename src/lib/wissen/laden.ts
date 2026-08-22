import fs from "node:fs";
import path from "node:path";
import {
  artikelSchemaMitFreigabe,
  autorSchema,
  clusterSchema,
  type Artikel,
  type Autor,
  type Cluster,
} from "./schema";

/**
 * Liest Artikel, Autoren und Cluster von der Platte und prüft sie.
 *
 * **Nur serverseitig.** `node:fs` gibt es im Browser nicht. Aufrufer sind die
 * Server-Wrapper unter `src/app/`, `sitemap.ts`, der RSS-Feed und der
 * Routen-Test — nie eine Client Component. Die Seiten-Komponenten bekommen die
 * fertigen Objekte als Props.
 *
 * **Fehler brechen den Build ab, statt still zu übergehen.** Das ist Absicht: Ein
 * Artikel, der das Schema verletzt, ist ein Artikel, den niemand geprüft hat.
 * Lieber ein roter Build als eine halbe Seite in der Suche.
 *
 * Gelesen wird einmal pro Prozess. Bei `next build` heißt das: einmal für
 * `generateStaticParams`, dann kommen alle Seiten aus demselben Ergebnis. Ohne
 * diesen Cache läse ein Build mit 500 Artikeln das Verzeichnis 500-mal.
 */

const WURZEL = process.cwd();
const ARTIKEL_ORDNER = path.join(WURZEL, "content", "wissen");
const SEO_ORDNER = path.join(WURZEL, "content", "seo");

/* -------------------------------------------------------------------------- */
/* Einlesen mit Prüfung                                                       */
/* -------------------------------------------------------------------------- */

function lesJson(datei: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(datei, "utf8"));
  } catch (fehler) {
    throw new Error(
      `${path.relative(WURZEL, datei)} ist kein gültiges JSON: ${
        fehler instanceof Error ? fehler.message : String(fehler)
      }`
    );
  }
}

/** Zod-Fehler so ausgeben, dass man die Stelle im JSON auch findet. */
function fehlerText(datei: string, issues: { path: (string | number)[]; message: string }[]): string {
  const zeilen = issues.map((i) => `  • ${i.path.join(".") || "(Wurzel)"}: ${i.message}`);
  return `${path.relative(WURZEL, datei)} entspricht nicht dem Schema:\n${zeilen.join("\n")}`;
}

/* -------------------------------------------------------------------------- */
/* Autoren                                                                    */
/* -------------------------------------------------------------------------- */

let autorenCache: Autor[] | null = null;

export function alleAutoren(): Autor[] {
  if (autorenCache) return autorenCache;

  const datei = path.join(SEO_ORDNER, "autoren.json");
  const roh = lesJson(datei);
  const geprueft = autorSchema.array().safeParse(roh);

  if (!geprueft.success) {
    throw new Error(fehlerText(datei, geprueft.error.issues));
  }

  const slugs = new Set<string>();
  for (const autor of geprueft.data) {
    if (slugs.has(autor.slug)) {
      throw new Error(`Autoren-Slug doppelt vergeben: "${autor.slug}"`);
    }
    slugs.add(autor.slug);
  }

  autorenCache = geprueft.data;
  return autorenCache;
}

export function autorNachSlug(slug: string): Autor | undefined {
  return alleAutoren().find((autor) => autor.slug === slug);
}

/* -------------------------------------------------------------------------- */
/* Cluster                                                                    */
/* -------------------------------------------------------------------------- */

let clusterCache: Cluster[] | null = null;

export function alleCluster(): Cluster[] {
  if (clusterCache) return clusterCache;

  const datei = path.join(SEO_ORDNER, "cluster.json");
  const roh = lesJson(datei);
  const geprueft = clusterSchema.array().safeParse(roh);

  if (!geprueft.success) {
    throw new Error(fehlerText(datei, geprueft.error.issues));
  }

  const slugs = new Set<string>();
  for (const cluster of geprueft.data) {
    if (slugs.has(cluster.slug)) {
      throw new Error(`Cluster-Slug doppelt vergeben: "${cluster.slug}"`);
    }
    slugs.add(cluster.slug);
  }

  clusterCache = [...geprueft.data].sort((a, b) => a.reihenfolge - b.reihenfolge);
  return clusterCache;
}

export function clusterNachSlug(slug: string): Cluster | undefined {
  return alleCluster().find((cluster) => cluster.slug === slug);
}

/* -------------------------------------------------------------------------- */
/* Artikel                                                                    */
/* -------------------------------------------------------------------------- */

let artikelCache: Artikel[] | null = null;

/**
 * Alle Artikel — auch Entwürfe und zurückgezogene.
 *
 * Für die Website nimmt man `veroeffentlichteArtikel()`. Diese Funktion ist für
 * die Pipeline und für Prüfungen da, die den ganzen Bestand sehen müssen
 * (Keyword-Dubletten, Verlinkungsdichte).
 */
export function alleArtikel(): Artikel[] {
  if (artikelCache) return artikelCache;

  if (!fs.existsSync(ARTIKEL_ORDNER)) {
    artikelCache = [];
    return artikelCache;
  }

  const dateien = fs
    .readdirSync(ARTIKEL_ORDNER)
    .filter((name) => name.endsWith(".json"))
    .sort();

  const artikel: Artikel[] = [];
  const autorenSlugs = new Set(alleAutoren().map((a) => a.slug));
  const clusterSlugs = new Set(alleCluster().map((c) => c.slug));

  /* Keyword → Slug. Zwei Artikel auf dasselbe Ziel konkurrieren gegeneinander
     statt gegen den Wettbewerb; zusätzlich dedupliziert ChatGPT Ergebnisse pro
     Domain, sodass die schwächere Seite die stärkere verdrängen kann. */
  const keywordBelegt = new Map<string, string>();

  for (const name of dateien) {
    const datei = path.join(ARTIKEL_ORDNER, name);
    const geprueft = artikelSchemaMitFreigabe.safeParse(lesJson(datei));

    if (!geprueft.success) {
      throw new Error(fehlerText(datei, geprueft.error.issues));
    }

    const eintrag = geprueft.data;

    if (`${eintrag.slug}.json` !== name) {
      throw new Error(
        `${name}: Dateiname und slug stimmen nicht überein (slug ist "${eintrag.slug}"). ` +
          `Die Datei muss "${eintrag.slug}.json" heißen — der Dateiname ist die URL.`
      );
    }

    if (!autorenSlugs.has(eintrag.autor)) {
      throw new Error(
        `${name}: Autor "${eintrag.autor}" steht nicht in content/seo/autoren.json.`
      );
    }

    if (!clusterSlugs.has(eintrag.cluster)) {
      throw new Error(
        `${name}: Cluster "${eintrag.cluster}" steht nicht in content/seo/cluster.json.`
      );
    }

    /* Nur veröffentlichte Artikel belegen ein Keyword — ein Entwurf, der auf
       dasselbe Ziel schreibt wie ein Live-Artikel, ist oft genau der geplante
       Ersatz und darf nebenher liegen. */
    if (eintrag.status === "veroeffentlicht") {
      const schluessel = eintrag.zielKeyword.trim().toLowerCase();
      const schonBelegt = keywordBelegt.get(schluessel);
      if (schonBelegt) {
        throw new Error(
          `Zielkeyword "${eintrag.zielKeyword}" ist doppelt vergeben: ` +
            `"${schonBelegt}" und "${eintrag.slug}". Genau ein Artikel je Keyword — ` +
            `sonst konkurrieren beide gegeneinander. Einen zurückziehen oder umwidmen.`
        );
      }
      keywordBelegt.set(schluessel, eintrag.slug);
    }

    /* Jeder Ankertext muss wörtlich im zugewiesenen Abschnitt stehen.

       Sonst passiert etwas, das man beim Draufschauen nicht bemerkt: Der Link
       ist im JSON eingetragen, wird gezählt, taucht in jeder Auswertung auf —
       und im gerenderten Text ist er nicht da, weil `verlinken.tsx` seine
       Fundstelle nicht findet. Genau dieser Fall ist beim Umstellen der drei
       Bestandsartikel eingetreten: fünfzehn eingetragene Links, null gerenderte.

       Deshalb bricht der Build hier ab, statt still weniger zu verlinken. */
    for (const link of eintrag.interneLinks) {
      const abschnitt =
        link.abschnitt === "intro" ? null : eintrag.abschnitte[link.abschnitt];

      if (link.abschnitt !== "intro" && !abschnitt) {
        throw new Error(
          `${name}: Link "${link.ankertext}" zeigt auf Abschnitt ${link.abschnitt}, ` +
            `der Artikel hat aber nur ${eintrag.abschnitte.length}.`
        );
      }

      const text =
        link.abschnitt === "intro"
          ? eintrag.intro
          : [
              abschnitt!.paragraphs.join(" "),
              ...(abschnitt!.unterabschnitte ?? []).map((u) => u.paragraphs.join(" ")),
            ].join(" ");

      if (!text.includes(link.ankertext)) {
        throw new Error(
          `${name}: Der Ankertext "${link.ankertext}" kommt im Abschnitt ` +
            `${link.abschnitt} nicht vor. Ein Link, dessen Ankertext nicht im Text ` +
            `steht, wird nicht gerendert — er zählt nur in der Statistik. ` +
            `Entweder den Ankertext an eine echte Textstelle anpassen oder die ` +
            `Formulierung in den Absatz aufnehmen.`
        );
      }
    }

    artikel.push(eintrag);
  }

  artikelCache = artikel;
  return artikelCache;
}

/** Was auf der Website erscheint — absteigend nach Datum. */
export function veroeffentlichteArtikel(): Artikel[] {
  return alleArtikel()
    .filter((a) => a.status === "veroeffentlicht")
    .sort((a, b) => b.datum.localeCompare(a.datum));
}

export function artikelNachSlug(slug: string): Artikel | undefined {
  return veroeffentlichteArtikel().find((a) => a.slug === slug);
}

export function artikelImCluster(clusterSlug: string): Artikel[] {
  return veroeffentlichteArtikel().filter((a) => a.cluster === clusterSlug);
}

export function artikelVonAutor(autorSlug: string): Artikel[] {
  return veroeffentlichteArtikel().filter((a) => a.autor === autorSlug);
}

/**
 * Wie oft jede Seite intern aus einem Artikel-Fließtext verlinkt wird, und mit
 * welchen Ankertexten.
 *
 * Grundlage für die Verlinkungsprüfung der Pipeline. Die Zyppy-Auswertung
 * (23 Mio. interne Links, 1.800 Websites) findet zwei Effekte: Seiten mit 40–44
 * eingehenden internen Links bekamen viermal so viele Suchklicks wie solche mit
 * 0–4 — und **ab etwa 45 bis 50 kehrt sich der Zusammenhang um**. Deshalb ist
 * hier nicht „mehr" das Ziel, sondern ein Korridor, und die Vielfalt der
 * Ankertexte zählt stärker als ihre Zahl.
 */
export function verlinkungsBild(): Map<string, { anzahl: number; ankertexte: Set<string> }> {
  const bild = new Map<string, { anzahl: number; ankertexte: Set<string> }>();

  for (const artikel of veroeffentlichteArtikel()) {
    for (const link of artikel.interneLinks) {
      const eintrag = bild.get(link.ziel) ?? { anzahl: 0, ankertexte: new Set<string>() };
      eintrag.anzahl += 1;
      eintrag.ankertexte.add(link.ankertext.trim().toLowerCase());
      bild.set(link.ziel, eintrag);
    }
  }

  return bild;
}

/** Nur für Tests: den Cache leeren, damit veränderte Dateien neu gelesen werden. */
export function cacheLeeren(): void {
  artikelCache = null;
  autorenCache = null;
  clusterCache = null;
}
