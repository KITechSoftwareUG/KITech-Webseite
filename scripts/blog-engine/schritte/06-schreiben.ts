/**
 * SCHRITT 06 — Der Artikel.
 *
 * Aufbau des Aufrufs, und warum er so aussieht:
 *
 *   System-Prompt  `prompts/hausstil.md`, unverändert, mit Zwischenspeicher.
 *                  Der Schreibstandard ist mehrere tausend Token schwer und
 *                  zwischen zwei Artikeln byteweise identisch — genau der Fall,
 *                  für den das Zwischenspeichern gemacht ist. Alles, was sich je
 *                  Artikel unterscheidet, steht deshalb in der Nutzeranweisung
 *                  und niemals im System-Prompt.
 *   Nutzeranweisung `prompts/schreiben.md`, gefüllt mit dem Briefing.
 *   Antwortform     ein JSON-Schema, das `src/lib/wissen/schema.ts` nachbaut,
 *                   **einschließlich aller Längengrenzen**. Ein Modell hält eine
 *                   Grenze, die als Bedingung der Ausgabe dasteht, deutlich
 *                   zuverlässiger ein als eine, die im Prompttext steht.
 *
 * **Drei Felder erzeugt das Modell nicht, sie werden danach gesetzt:**
 *
 *   `substanz`  kommt aus dem Vorrat. Ein Modell, das den eigenen Eigenanteil
 *               beschreiben darf, beschreibt ihn immer als vorhanden.
 *   `quellen`   wird gegen die Belege des Briefings gefiltert. Was dort nicht
 *               steht, fliegt raus — eine erfundene Quelle ist nach § 5b Absatz 3
 *               UWG abmahnbar und fällt beim Lesen nicht auf.
 *   `status`    ist immer `entwurf`. Der Schreibschritt veröffentlicht nichts.
 *               Aus „automatisch erzeugt“ wird erst durch einen Menschen ein
 *               redaktioneller Vorgang.
 *
 * Dazu kommt die Prüfung der Ankertexte. Sie ist kein Feinschliff: Ein Link,
 * dessen Ankertext im Absatz nicht wörtlich vorkommt, wird nicht gerendert,
 * zählt aber in jeder Statistik mit. Beim Umstellen der drei Bestandsartikel
 * sind so fünfzehn eingetragene Links zu null gerenderten geworden.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Brief } from "../lib/typen.js";
import type { GewaehltesThema } from "./05-brief.js";
import { MODELL_SCHREIBEN, frage, type JsonSchema } from "../lib/claude.js";
import { melde, warne } from "../lib/protokoll.js";
import { artikelSchema, type Artikel } from "../../../src/lib/wissen/schema.js";

const HIER = dirname(fileURLToPath(import.meta.url));
const PROMPT_ORDNER = join(HIER, "..", "prompts");

/** Wörter je Minute für die Lesezeit. Der Bestand rechnet mit diesem Wert. */
const WOERTER_JE_MINUTE = 200;

/* ══════════════════════════════════════════════════════════════════════════
   Das Antwortschema — von Hand nach src/lib/wissen/schema.ts gebaut
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Nachbau des Zod-Schemas als JSON-Schema.
 *
 * ⚠️ **Zwei Schemata für dieselbe Sache sind eine Schuld.** Sie stehen hier
 * trotzdem nebeneinander, weil der automatische Weg schlechter wäre: Ein
 * Generator aus Zod bräuchte `zod-to-json-schema` als weitere Abhängigkeit im
 * Website-Repo und übersetzt genau die Grenzen am ungenauesten, auf die es hier
 * ankommt. Wer `src/lib/wissen/schema.ts` ändert, ändert diese Datei mit —
 * `artikelSchema.safeParse` unten fängt den Fall sonst erst nach dem
 * teuersten Aufruf des Laufs ab.
 *
 * Nicht enthalten und bewusst nicht vom Modell erzeugt: `substanz`, `status`,
 * `freigabe`, `erzeugt`, `datum`, `aktualisiert`, `lesezeit`.
 */
export const ARTIKEL_SCHEMA: JsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "slug",
    "titel",
    "teaser",
    "kategorie",
    "cluster",
    "zielKeyword",
    "sekundaerKeywords",
    "autor",
    "intro",
    "abschnitte",
    "kernaussagen",
    "fazit",
    "faq",
    "quellen",
    "interneLinks",
    "cta",
  ],
  properties: {
    slug: {
      type: "string",
      minLength: 3,
      maxLength: 80,
      pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
    },
    titel: { type: "string", minLength: 15, maxLength: 120 },
    teaser: { type: "string", minLength: 60, maxLength: 280 },
    kategorie: { type: "string", minLength: 3, maxLength: 30 },
    cluster: { type: "string", minLength: 3, maxLength: 80 },
    zielKeyword: { type: "string", minLength: 3, maxLength: 90 },
    sekundaerKeywords: {
      type: "array",
      maxItems: 12,
      items: { type: "string", minLength: 3, maxLength: 90 },
    },
    autor: { type: "string", minLength: 3, maxLength: 80 },
    intro: { type: "string", minLength: 120, maxLength: 700 },
    abschnitte: {
      type: "array",
      minItems: 5,
      maxItems: 9,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["heading", "paragraphs"],
        properties: {
          heading: { type: "string", minLength: 8, maxLength: 120 },
          paragraphs: {
            type: "array",
            minItems: 1,
            maxItems: 6,
            items: { type: "string", minLength: 20 },
          },
          bullets: {
            type: "array",
            maxItems: 7,
            items: { type: "string", minLength: 3, maxLength: 200 },
          },
          unterabschnitte: {
            type: "array",
            maxItems: 5,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["heading", "paragraphs"],
              properties: {
                heading: { type: "string", minLength: 6, maxLength: 120 },
                paragraphs: {
                  type: "array",
                  minItems: 1,
                  maxItems: 4,
                  items: { type: "string", minLength: 20 },
                },
              },
            },
          },
          tabelle: {
            type: "object",
            additionalProperties: false,
            required: ["kopf", "zeilen"],
            properties: {
              kopf: {
                type: "array",
                minItems: 2,
                maxItems: 4,
                items: { type: "string", minLength: 1, maxLength: 60 },
              },
              zeilen: {
                type: "array",
                minItems: 2,
                maxItems: 10,
                items: {
                  type: "array",
                  minItems: 2,
                  maxItems: 4,
                  items: { type: "string", maxLength: 200 },
                },
              },
            },
          },
        },
      },
    },
    kernaussagen: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: { type: "string", minLength: 40, maxLength: 320 },
    },
    fazit: { type: "string", minLength: 60, maxLength: 400 },
    faq: {
      type: "array",
      minItems: 2,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["frage", "antwort"],
        properties: {
          frage: { type: "string", minLength: 10, maxLength: 160 },
          antwort: { type: "string", minLength: 30, maxLength: 900 },
        },
      },
    },
    quellen: {
      type: "array",
      maxItems: 15,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["bezeichnung", "url", "abgerufen", "belegt"],
        properties: {
          bezeichnung: { type: "string", minLength: 3, maxLength: 160 },
          url: { type: "string" },
          abgerufen: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
          belegt: { type: "string", minLength: 10, maxLength: 300 },
        },
      },
    },
    interneLinks: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["ziel", "ankertext", "abschnitt"],
        properties: {
          ziel: { type: "string", pattern: "^/[a-z0-9/\\-_]*$" },
          ankertext: { type: "string", minLength: 3, maxLength: 90 },
          abschnitt: {
            anyOf: [{ type: "string", enum: ["intro"] }, { type: "integer", minimum: 0 }],
          },
        },
      },
    },
    cta: {
      type: "object",
      additionalProperties: false,
      required: ["heading", "text"],
      properties: {
        heading: { type: "string", minLength: 10, maxLength: 80 },
        text: { type: "string", minLength: 30, maxLength: 200 },
      },
    },
  },
};

/** Was das Modell liefert: der Artikel ohne die Felder, die die Pipeline setzt. */
export type ModellArtikel = Omit<
  Artikel,
  "datum" | "aktualisiert" | "lesezeit" | "substanz" | "status" | "freigabe" | "erzeugt"
>;

/* ══════════════════════════════════════════════════════════════════════════
   Einstiegspunkt
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Schreibt den Artikel zum Briefing.
 *
 * @param vorhandene Der Bestand. Er dient zwei Zwecken: Er verhindert, dass der
 *   neue Artikel dieselbe Aussage noch einmal macht, und er ist die einzige
 *   Quelle gültiger Zielpfade für interne Links auf Artikel. Schritt 05 kennt
 *   ihn nicht und liefert deshalb nur die stabilen Seiten.
 */
export async function schreibeArtikel(
  brief: Brief,
  thema: GewaehltesThema,
  vorhandene: Artikel[]
): Promise<Artikel> {
  if (!thema.substanz) {
    throw new Error(
      `Thema „${thema.id}“ hat keine substanz. Schritt 05 hätte das abfangen müssen — ` +
        `hier wird nicht geschrieben, was ohne Eigenanteil auskommen soll.`
    );
  }

  const system = liesPrompt("hausstil.md");
  const nutzer = fuelleVorlage(liesPrompt("schreiben.md"), brief, thema, vorhandene);

  const roh = await frage<ModellArtikel>({
    modell: MODELL_SCHREIBEN,
    system,
    nachricht: nutzer,
    schema: ARTIKEL_SCHEMA,
    maxTokens: 16_000,
    zweck: "artikel",
  });

  let artikel = setzePflichtfelder(roh, brief, thema, vorhandene);
  artikel = filtereQuellen(artikel, brief);
  artikel = pruefeAnkertexte(artikel, erlaubteZiele(brief, vorhandene));

  const gepruft = artikelSchema.safeParse(artikel);
  if (gepruft.success) {
    melde(`Artikel „${artikel.slug}“ geschrieben: ${zaehleWoerter(artikel)} Wörter.`);
    return gepruft.data;
  }

  // Das Antwortschema erzwingt die Form, nicht jede Bedingung des Zod-Schemas —
  // und die gesetzten Pflichtfelder kommen erst danach dazu. Ein Anlauf zur
  // Korrektur ist billiger als ein verlorener Lauf; zwei wären eine Schleife,
  // und Schleifen gehören in Schritt 07, wo sie gezählt werden.
  const maengel = gepruft.error.issues
    .map((issue) => `- ${issue.path.join(".") || "(Wurzel)"}: ${issue.message}`)
    .join("\n");
  warne(`Artikel entspricht dem Datenmodell nicht. Ein Korrekturanlauf:\n${maengel}`);

  const korrigiert = await frage<ModellArtikel>({
    modell: MODELL_SCHREIBEN,
    system,
    nachricht: [
      nutzer,
      "",
      "# Korrektur",
      "Dein Entwurf hat das Datenmodell verfehlt. Gib denselben Artikel noch einmal",
      "aus und behebe genau diese Punkte, ohne sonst etwas zu ändern:",
      maengel,
    ].join("\n"),
    schema: ARTIKEL_SCHEMA,
    maxTokens: 16_000,
    zweck: "artikel-korrektur",
  });

  let zweiter = setzePflichtfelder(korrigiert, brief, thema, vorhandene);
  zweiter = filtereQuellen(zweiter, brief);
  zweiter = pruefeAnkertexte(zweiter, erlaubteZiele(brief, vorhandene));

  const zweitePruefung = artikelSchema.safeParse(zweiter);
  if (!zweitePruefung.success) {
    throw new Error(
      `Artikel zu „${brief.zielKeyword}“ entspricht auch nach der Korrektur nicht ` +
        `dem Datenmodell:\n` +
        zweitePruefung.error.issues
          .map((issue) => `- ${issue.path.join(".") || "(Wurzel)"}: ${issue.message}`)
          .join("\n")
    );
  }

  melde(`Artikel „${zweiter.slug}“ nach einer Korrektur geschrieben.`);
  return zweitePruefung.data;
}

/* ══════════════════════════════════════════════════════════════════════════
   Nachbearbeitung — auch von Schritt 07 benutzt
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Wirft alle Quellen weg, die nicht im Briefing stehen.
 *
 * Der Vergleich läuft über die Adresse, nicht über den Text: Bezeichnung und
 * belegte Aussage formuliert das Modell um, die Adresse nicht. Eine Quelle, die
 * hier verschwindet, war entweder erfunden oder stammt aus einer Seite, die die
 * Recherche nicht als belegt eingestuft hat — in beiden Fällen darf sie nicht in
 * den Artikel.
 */
export function filtereQuellen(artikel: Artikel, brief: Brief): Artikel {
  const erlaubt = new Set(brief.belege.map((beleg) => normalisiereUrl(beleg.url)));
  const behalten = (artikel.quellen ?? []).filter((quelle) =>
    erlaubt.has(normalisiereUrl(quelle.url))
  );

  const verworfen = (artikel.quellen ?? []).length - behalten.length;
  if (verworfen > 0) {
    for (const quelle of artikel.quellen ?? []) {
      if (!erlaubt.has(normalisiereUrl(quelle.url))) {
        warne(
          `Quelle entfernt, steht nicht in den Belegen des Briefings: ` +
            `„${quelle.bezeichnung}“ (${quelle.url}). Jede Zahl, die daran hing, ` +
            `ist jetzt unbelegt — Schritt 07 meldet sie als harten Fehler.`
        );
      }
    }
  }

  return { ...artikel, quellen: behalten };
}

/**
 * Entfernt interne Links, deren Ankertext nicht im zugewiesenen Abschnitt steht.
 *
 * Dieselbe Prüfung führt `src/lib/wissen/laden.ts` beim Bauen aus — dort bricht
 * sie den Build ab. Hier wird stattdessen der Link entfernt: Ein Entwurf mit
 * fünf statt sieben Links ist brauchbar, ein Lauf, der am letzten Schritt
 * abbricht, nicht. Die Warnung bleibt, damit der Mensch beim Freigeben sieht,
 * was fehlt.
 */
export function pruefeAnkertexte(artikel: Artikel, erlaubteZiele: Set<string>): Artikel {
  const behalten = (artikel.interneLinks ?? []).filter((link) => {
    if (!erlaubteZiele.has(link.ziel)) {
      warne(`Interner Link entfernt: „${link.ziel}“ ist kein Pfad dieser Website.`);
      return false;
    }

    const abschnitt =
      link.abschnitt === "intro" ? null : artikel.abschnitte[link.abschnitt as number];

    if (link.abschnitt !== "intro" && !abschnitt) {
      warne(
        `Interner Link entfernt: „${link.ankertext}“ zeigt auf Abschnitt ` +
          `${link.abschnitt}, der Artikel hat aber nur ${artikel.abschnitte.length}.`
      );
      return false;
    }

    const text =
      link.abschnitt === "intro"
        ? artikel.intro
        : [
            abschnitt.paragraphs.join(" "),
            ...(abschnitt.unterabschnitte ?? []).map((u) => u.paragraphs.join(" ")),
          ].join(" ");

    if (!text.includes(link.ankertext)) {
      warne(
        `Interner Link entfernt: der Ankertext „${link.ankertext}“ kommt in Abschnitt ` +
          `${link.abschnitt} nicht wörtlich vor. Ein solcher Link wird nicht ` +
          `gerendert und zählt trotzdem in jeder Auswertung.`
      );
      return false;
    }

    return true;
  });

  if (behalten.length < 3) {
    warne(
      `Nur noch ${behalten.length} interne Links übrig, Pflicht sind drei. ` +
        `Der Entwurf besteht das Datenmodell so nicht.`
    );
  }

  return { ...artikel, interneLinks: behalten };
}

/** Alle Pfade, auf die ein Artikel dieser Website zeigen darf. */
export function erlaubteZiele(brief: Brief, vorhandene: Artikel[]): Set<string> {
  const ziele = new Set<string>(brief.verlinkungsziele.map((eintrag) => eintrag.ziel));
  for (const artikel of vorhandene) ziele.add(`/gratis-wissen/${artikel.slug}`);
  ziele.add(`/gratis-wissen/thema/${brief.cluster}`);
  ziele.add("/gratis-wissen");
  return ziele;
}

/* ══════════════════════════════════════════════════════════════════════════
   Innereien
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Liest eine Prompt-Datei. Auch von Schritt 07 benutzt: Die Korrekturdurchgänge
 * laufen unter demselben System-Prompt wie das Schreiben — schon damit der
 * Zwischenspeicher greift, vor allem aber, damit nicht zwei Fassungen desselben
 * Standards nebeneinander stehen.
 */
export function liesPrompt(datei: string): string {
  try {
    return readFileSync(join(PROMPT_ORDNER, datei), "utf8");
  } catch (ursache: unknown) {
    const meldung = ursache instanceof Error ? ursache.message : String(ursache);
    throw new Error(`Prompt ${datei} nicht lesbar: ${meldung}`);
  }
}

/**
 * Setzt die Felder, die nicht vom Modell kommen dürfen.
 *
 * Reihenfolge ist wichtig: erst die Pflichtfelder, dann die Prüfung gegen das
 * Zod-Schema. Andersherum würde eine erfundene `substanz` durchgehen und die
 * echte danach still überschrieben.
 */
function setzePflichtfelder(
  roh: ModellArtikel,
  brief: Brief,
  thema: GewaehltesThema,
  vorhandene: Artikel[]
): Artikel {
  const heute = heuteIso();
  const woerter = zaehleWoerter(roh as unknown as Artikel);

  return {
    ...roh,
    slug: freierSlug(roh.slug, vorhandene),
    cluster: brief.cluster,
    autor: brief.autor,
    zielKeyword: brief.zielKeyword,
    sekundaerKeywords: brief.sekundaerKeywords,
    datum: heute,
    aktualisiert: heute,
    lesezeit: Math.min(25, Math.max(3, Math.ceil(woerter / WOERTER_JE_MINUTE))),
    substanz: {
      art: thema.substanz.art,
      beschreibung: thema.substanz.beschreibung,
      herkunft: thema.substanz.herkunft,
    },
    // Nie etwas anderes. Der Schreibschritt veröffentlicht nicht, und ein
    // Vorgabewert, den man „für diesen einen Fall“ überschreibt, ist keiner.
    status: "entwurf",
  };
}

/**
 * Macht den Slug eindeutig.
 *
 * Der Loader bricht bei zwei Artikeln mit demselben Slug ab, und er hat recht
 * damit — zwei Dateien auf eine Adresse ist kein Zustand, den man raten sollte.
 * Hier wird angehängt statt abgebrochen, weil der Slug beim Freigeben ohnehin
 * durch Menschenhand geht.
 */
function freierSlug(vorschlag: string, vorhandene: Artikel[]): string {
  const belegt = new Set(vorhandene.map((artikel) => artikel.slug));
  if (!belegt.has(vorschlag)) return vorschlag;

  for (let zaehler = 2; zaehler < 20; zaehler++) {
    const kandidat = `${vorschlag}-${zaehler}`.slice(0, 80);
    if (!belegt.has(kandidat)) {
      warne(`Slug „${vorschlag}“ war belegt, der Entwurf heißt jetzt „${kandidat}“.`);
      return kandidat;
    }
  }
  throw new Error(`Kein freier Slug zu „${vorschlag}“ gefunden.`);
}

function normalisiereUrl(url: string): string {
  return url.trim().replace(/\/+$/, "").toLowerCase();
}

function heuteIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Zählt die Wörter im sichtbaren Fließtext. Grundlage für die Lesezeit. */
function zaehleWoerter(artikel: Artikel): number {
  const teile: string[] = [artikel.intro ?? "", artikel.fazit ?? ""];
  for (const abschnitt of artikel.abschnitte ?? []) {
    teile.push(abschnitt.heading, ...abschnitt.paragraphs, ...(abschnitt.bullets ?? []));
    for (const unter of abschnitt.unterabschnitte ?? []) {
      teile.push(unter.heading, ...unter.paragraphs);
    }
  }
  for (const eintrag of artikel.faq ?? []) teile.push(eintrag.frage, eintrag.antwort);
  return teile
    .join(" ")
    .split(/\s+/)
    .filter((wort) => wort.length > 0).length;
}

/* -------------------------------------------------------------------------- */
/* Vorlage füllen                                                             */
/* -------------------------------------------------------------------------- */

function fuelleVorlage(
  vorlage: string,
  brief: Brief,
  thema: GewaehltesThema,
  vorhandene: Artikel[]
): string {
  const werte: Record<string, string> = {
    ZIELKEYWORD: brief.zielKeyword,
    SEKUNDAERKEYWORDS: liste(brief.sekundaerKeywords, "keine"),
    TITELVORSCHLAEGE: aufzaehlung(brief.titelVorschlaege),
    CLUSTER: brief.cluster,
    ZIELWORTZAHL: String(brief.zielWortzahl),
    LESER: brief.leser,
    KERNTHESE: brief.kernthese,
    EIGENANTEIL: brief.eigenanteil,
    SUBSTANZ: thema.substanz
      ? [
          `Art: ${thema.substanz.art}`,
          `Was: ${thema.substanz.beschreibung}`,
          `Herkunft: ${thema.substanz.herkunft}`,
        ].join("\n")
      : "fehlt",
    GLIEDERUNG: brief.gliederung
      .map(
        (punkt, index) =>
          `${index}. ${punkt.heading}${punkt.istFrage ? " (Frage)" : ""}\n   ${punkt.inhalt}`
      )
      .join("\n"),
    FRAGEN: aufzaehlung(brief.fragen),
    BELEGE: brief.belege.length
      ? brief.belege
          .map(
            (beleg) =>
              `- Aussage: ${beleg.aussage}\n  Bezeichnung: ${beleg.quelle}\n  URL: ${beleg.url}\n  Abgerufen: ${heuteIso()}`
          )
          .join("\n")
      : "Keine Belege. Der Artikel enthält keine einzige Fremdzahl, und `quellen` bleibt leer.",
    MATERIAL: brief.material.length
      ? aufzaehlung(brief.material)
      : "Kein wörtlich verwendbares Material. Der Eigenanteil steckt in der Argumentation, nicht in Zitaten.",
    VERLINKUNGSZIELE: [
      ...brief.verlinkungsziele.map((eintrag) => `- ${eintrag.ziel} — ${eintrag.anlass}`),
      ...vorhandene
        .filter((artikel) => artikel.cluster === brief.cluster)
        .slice(0, 12)
        .map((artikel) => `- /gratis-wissen/${artikel.slug} — ${artikel.titel}`),
    ].join("\n"),
    ABGRENZUNG: aufzaehlung(brief.abgrenzung),
    VORHANDENE: vorhandene.length
      ? vorhandene
          .slice(0, 40)
          .map(
            (artikel) =>
              `- ${artikel.slug} — „${artikel.titel}“ (Zielkeyword: ${artikel.zielKeyword})`
          )
          .join("\n")
      : "Noch keine.",
  };

  return vorlage.replace(/\{\{([A-Z_]+)\}\}/g, (treffer, name: string) => {
    const wert = werte[name];
    if (wert === undefined) {
      warne(`Platzhalter {{${name}}} in prompts/schreiben.md hat keinen Wert.`);
      return treffer;
    }
    return wert;
  });
}

function aufzaehlung(werte: string[]): string {
  return werte.length ? werte.map((wert) => `- ${wert}`).join("\n") : "- (nichts)";
}

function liste(werte: string[], leer: string): string {
  return werte.length ? werte.join(", ") : leer;
}
