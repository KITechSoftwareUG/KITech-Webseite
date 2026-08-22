import fs from "node:fs";
import path from "node:path";

import { artikelSchema, artikelSchemaMitFreigabe, type Artikel } from "../../../src/lib/wissen/schema.js";
import { melde, warne } from "./protokoll.js";
import type { ThemaImVorrat } from "./typen.js";

/**
 * Der einzige Weg der Automatik auf die Platte: Artikel lesen und schreiben,
 * Slugs bilden, den Themen-Vorrat pflegen.
 *
 * **Warum nicht `src/lib/wissen/laden.ts` benutzt wird.** Der Website-Loader ist
 * absichtlich unnachgiebig: Er bricht den Build ab, sobald *eine* Datei das
 * Schema verletzt, ein Keyword doppelt vergeben ist oder ein Autor fehlt. Genau
 * richtig für den Build — und unbrauchbar für die Pipeline. Schritt 02 muss
 * wissen, welche Keywords bereits belegt sind; wenn ein einziger kaputter
 * Zwischenstand im Ordner das Lesen aller Artikel verhindert, steht die
 * Automatik, bis ein Mensch aufräumt. Hier wird deshalb **Datei für Datei**
 * geprüft: Was nicht durchgeht, wird übersprungen und gemeldet, der Rest ist
 * benutzbar.
 *
 * **Beim Schreiben gilt der strengere Maßstab.** Eine Datei, die der Loader
 * später ablehnt, ist ein roter Build — und zwar nicht hier, sondern beim
 * nächsten Deploy, ohne erkennbaren Zusammenhang zum Lauf, der sie erzeugt hat.
 * `schreibeArtikel` prüft deshalb gegen dasselbe Schema wie der Loader,
 * einschließlich der Freigabepflicht, und wirft, statt zu schreiben.
 *
 * Alle Pfade hängen an `process.cwd()` — die Skripte laufen aus der
 * Repo-Wurzel, so wie `npm run` sie startet.
 */

const WURZEL = process.cwd();
const ARTIKEL_ORDNER = path.join(WURZEL, "content", "wissen");
const SEO_ORDNER = path.join(WURZEL, "content", "seo");
const VORRAT_DATEI = path.join(SEO_ORDNER, "themen-pool.json");

/** Aus `slugMuster` in `src/lib/wissen/schema.ts`. Hier gespiegelt, damit ein
 *  Slug gar nicht erst entsteht, den das Schema danach ablehnt. */
const MIN_SLUG_LAENGE = 3;
const MAX_SLUG_LAENGE = 80;

/* -------------------------------------------------------------------------- */
/* Schreiben, das einen Abbruch übersteht                                     */
/* -------------------------------------------------------------------------- */

/**
 * Erst daneben schreiben, dann umbenennen.
 *
 * Beim Themen-Vorrat ist das keine Vorsicht, sondern notwendig: Die Datei ist
 * die einzige Liste dessen, was noch zu tun ist, und wird bei jedem
 * `markiereErledigt` vollständig neu geschrieben. Ein Abbruch mitten im
 * Schreiben — Strom, Speicher, abgebrochener Cron — hinterlässt sonst ein
 * halbes JSON, und mit ihm ist der Vorrat weg. `rename` ist auf demselben
 * Dateisystem atomar: Es gibt entweder die alte oder die neue Fassung.
 */
function schreibeJson(ziel: string, inhalt: unknown): string {
  fs.mkdirSync(path.dirname(ziel), { recursive: true });
  const zwischen = `${ziel}.tmp`;
  fs.writeFileSync(zwischen, `${JSON.stringify(inhalt, null, 2)}\n`, "utf8");
  fs.renameSync(zwischen, ziel);
  return ziel;
}

/* -------------------------------------------------------------------------- */
/* Slugs                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Umlaute und `&` werden **ausgeschrieben**, nicht entfernt.
 *
 * Der Unterschied ist nicht kosmetisch: Aus „Verschlüsselung" würde sonst
 * `verschlsselung` — unlesbar, und für die Suche ein anderes Wort als das im
 * Titel. Die Reihenfolge ist deshalb festgelegt: erst diese Ersetzungen, dann
 * das Abstreifen der übrigen Akzente. Umgekehrt käme aus „ü" ein „u" und der
 * ganze Zweck wäre dahin.
 */
const ERSETZUNGEN: ReadonlyArray<readonly [RegExp, string]> = [
  [/ä/g, "ae"],
  [/ö/g, "oe"],
  [/ü/g, "ue"],
  [/ß/g, "ss"],
  [/&/g, " und "],
];

/**
 * Kürzt auf eine Höchstlänge, aber an einer Wortgrenze.
 *
 * Ein hart abgeschnittener Slug endet mitten im Wort (`…-datenschutzgrundv`)
 * und liest sich in der Adresszeile wie ein Fehler. Deshalb wird bis zum
 * letzten Bindestrich zurückgegangen — es sei denn, der Rest wäre danach zu
 * kurz, dann ist der harte Schnitt das kleinere Übel.
 */
function kuerze(slug: string, laenge: number): string {
  if (slug.length <= laenge) return slug;

  const hart = slug.slice(0, laenge);
  const letzterStrich = hart.lastIndexOf("-");
  const kandidat = letzterStrich >= MIN_SLUG_LAENGE ? hart.slice(0, letzterStrich) : hart;

  return kandidat.replace(/-+$/g, "");
}

/**
 * Macht aus einem deutschen Titel einen URL-Slug, der `slugMuster` genügt.
 *
 * Der Slug ist die **Identität** des Artikels: Dateiname, URL, Ziel jedes
 * internen Links. Er entsteht genau einmal und wird danach nicht mehr geändert
 * — eine geänderte URL ist ein 404 auf alles, was schon darauf zeigt.
 *
 * Wirft, wenn nichts Brauchbares übrig bleibt (Titel nur aus Sonderzeichen).
 * Ein stiller Rückfall auf `"artikel"` wäre schlimmer: Der zweite solche Titel
 * kollidierte mit dem ersten, und niemand wüsste warum.
 */
export function slugAus(titel: string): string {
  let arbeit = titel.toLowerCase();

  for (const [muster, ersatz] of ERSETZUNGEN) {
    arbeit = arbeit.replace(muster, ersatz);
  }

  /* Akzente von Buchstaben trennen und die Akzente wegwerfen: aus „é" wird „e",
     aus „ç" ein „c". Was danach noch übrig ist, ist ohnehin kein Buchstabe. */
  arbeit = arbeit.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const slug = kuerze(
    arbeit
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-|-$/g, ""),
    MAX_SLUG_LAENGE,
  );

  if (slug.length < MIN_SLUG_LAENGE) {
    throw new Error(
      `Aus dem Titel "${titel}" lässt sich kein Slug bilden — es bleiben weniger als ` +
        `${MIN_SLUG_LAENGE} verwertbare Zeichen übrig.`,
    );
  }

  return slug;
}

/**
 * Hängt `-2`, `-3` … an, wenn der Slug schon vergeben ist.
 *
 * ⚠️ **Ein belegter Slug ist meistens ein Warnsignal, keine Formalie.** Zwei
 * Artikel mit fast gleichem Titel heißt in der Regel: dasselbe Thema zweimal.
 * Die harte Regel dagegen ist „ein Keyword, ein Artikel", und die prüft Schritt
 * 02 — nicht diese Funktion. Sie sorgt nur dafür, dass ein bewusst gewollter
 * zweiter Artikel nicht den ersten überschreibt.
 *
 * Der Zähler wird beim Kürzen mitgerechnet, damit `basis-12` nicht auf 82
 * Zeichen anwächst und am Schema scheitert.
 */
export function eindeutigerSlug(basis: string, vorhandene: string[]): string {
  const belegt = new Set(vorhandene);
  if (!belegt.has(basis)) return basis;

  for (let zaehler = 2; zaehler <= 99; zaehler++) {
    const anhang = `-${zaehler}`;
    const kandidat = `${kuerze(basis, MAX_SLUG_LAENGE - anhang.length)}${anhang}`;
    if (!belegt.has(kandidat)) return kandidat;
  }

  throw new Error(
    `Für "${basis}" sind alle Varianten bis -99 vergeben. Das ist kein Namensproblem, ` +
      "sondern ein Themenproblem — hier läuft etwas im Kreis.",
  );
}

/* -------------------------------------------------------------------------- */
/* Artikel lesen                                                              */
/* -------------------------------------------------------------------------- */

/** Der Pfad, unter dem ein Artikel liegt. */
export function artikelPfad(slug: string): string {
  return path.join(ARTIKEL_ORDNER, `${slug}.json`);
}

/**
 * Liest alle Artikel aus `content/wissen/`.
 *
 * Geprüft wird gegen `artikelSchema` — **ohne** die Freigabepflicht und ohne die
 * dateiübergreifenden Prüfungen des Website-Loaders (doppelte Keywords,
 * unbekannte Autoren, unerreichbare Linkziele). Ein Artikel im Status
 * `veroeffentlicht`, dem die Freigabe fehlt, ist genau der Zwischenstand, den
 * die Pipeline sehen und reparieren können muss.
 *
 * Was das Schema verletzt, wird **übersprungen und gemeldet**, nicht geworfen:
 * Eine einzelne kaputte Datei darf nicht verhindern, dass Schritt 02 die
 * belegten Keywords erfährt. Die Warnung landet auf stderr und damit im
 * Laufprotokoll.
 *
 * Die Reihenfolge ist nach Slug sortiert und damit reproduzierbar —
 * `readdirSync` gibt keine garantierte Ordnung, und ein Lauf, der zweimal
 * dasselbe tut, soll zweimal dasselbe Ergebnis liefern.
 */
export function ladeAlleArtikel(): Artikel[] {
  if (!fs.existsSync(ARTIKEL_ORDNER)) {
    warne("Ordner content/wissen/ existiert nicht — es gibt noch keine Artikel");
    return [];
  }

  const dateien = fs
    .readdirSync(ARTIKEL_ORDNER)
    .filter((name) => name.endsWith(".json"))
    .sort();

  const artikel: Artikel[] = [];

  for (const name of dateien) {
    const datei = path.join(ARTIKEL_ORDNER, name);

    let roh: unknown;
    try {
      roh = JSON.parse(fs.readFileSync(datei, "utf8")) as unknown;
    } catch (ausnahme: unknown) {
      warne("Artikeldatei übersprungen — kein gültiges JSON", {
        datei: path.relative(WURZEL, datei),
        grund: ausnahme instanceof Error ? ausnahme.message : String(ausnahme),
      });
      continue;
    }

    const geprueft = artikelSchema.safeParse(roh);
    if (!geprueft.success) {
      warne("Artikeldatei übersprungen — verletzt das Schema", {
        datei: path.relative(WURZEL, datei),
        felder: geprueft.error.issues
          .map((problem) => problem.path.join(".") || "(Wurzel)")
          .join(", "),
      });
      continue;
    }

    artikel.push(geprueft.data);
  }

  return artikel;
}

/* -------------------------------------------------------------------------- */
/* Artikel schreiben                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Prüft den Artikel und legt ihn unter `content/wissen/<slug>.json` ab.
 *
 * **Geprüft wird gegen `artikelSchemaMitFreigabe`** — dasselbe Schema wie im
 * Website-Loader, einschließlich der Regel, dass `status: "veroeffentlicht"`
 * ein `freigabe`-Objekt verlangt. Ein hier durchgewinkter Artikel bräche sonst
 * den nächsten Build, und zwar an einer Stelle, die nicht mehr nach dem Lauf
 * aussieht, der ihn erzeugt hat.
 *
 * Geschrieben wird das **geprüfte** Objekt, nicht die Eingabe: Zod setzt dabei
 * die Vorgabewerte (`sekundaerKeywords`, `faq`, `quellen` als leere Listen), und
 * so steht in der Datei, was die Website auch liest.
 *
 * Zwei Leerzeichen Einrückung und ein abschließender Zeilenumbruch, weil diese
 * Dateien im Git liegen: Ein Diff soll die geänderte Zeile zeigen und nicht das
 * ganze Dokument.
 *
 * Ein Pfadausbruch über den Slug ist ausgeschlossen — `slugMuster` lässt nur
 * Kleinbuchstaben, Ziffern und einzelne Bindestriche zu, und geprüft wird vor
 * dem Bauen des Pfades.
 */
export function schreibeArtikel(artikel: Artikel): string {
  const geprueft = artikelSchemaMitFreigabe.safeParse(artikel);

  if (!geprueft.success) {
    const zeilen = geprueft.error.issues.map(
      (problem) => `  • ${problem.path.join(".") || "(Wurzel)"}: ${problem.message}`,
    );
    throw new Error(
      `Artikel "${artikel?.slug ?? "ohne Slug"}" entspricht nicht dem Schema und wird nicht ` +
        `geschrieben:\n${zeilen.join("\n")}`,
    );
  }

  const ziel = schreibeJson(artikelPfad(geprueft.data.slug), geprueft.data);
  melde("Artikel geschrieben", { datei: path.relative(WURZEL, ziel) });
  return ziel;
}

/* -------------------------------------------------------------------------- */
/* Themen-Vorrat                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Das Mindeste, was ein Eintrag mitbringen muss, um überhaupt verwertbar zu
 * sein.
 *
 * Für `ThemaImVorrat` gibt es bewusst **kein** Zod-Schema: Die Datei wird von
 * Hand gepflegt, und ein Schema hier wäre die zweite Wahrheit neben `typen.ts`.
 * Geprüft wird deshalb nur, woran ein Schritt sonst still scheitern würde —
 * `substanz` gehört ausdrücklich **nicht** dazu, weil `null` dort ein gültiger
 * Zustand ist: Ein Thema ohne Eigenanteil steht im Vorrat und wird von Schritt
 * 02 übersprungen. Das ist das Substanz-Tor, und es gehört dorthin, nicht
 * hierher.
 */
function istVerwertbar(wert: unknown): wert is ThemaImVorrat {
  if (typeof wert !== "object" || wert === null) return false;
  const eintrag = wert as Record<string, unknown>;
  return (
    typeof eintrag.id === "string" &&
    eintrag.id.length > 0 &&
    typeof eintrag.arbeitstitel === "string" &&
    typeof eintrag.zielKeyword === "string" &&
    typeof eintrag.cluster === "string" &&
    typeof eintrag.autor === "string" &&
    typeof eintrag.prioritaet === "number"
  );
}

/**
 * Liest `content/seo/themen-pool.json`.
 *
 * Fehlt die Datei, ist das eine **leere Liste mit Warnung**, kein Absturz: Der
 * aufrufende Schritt meldet dann „kein Thema verfügbar", und das ist eine
 * Aussage, mit der ein Mensch etwas anfangen kann. Ein Stacktrace über einen
 * fehlenden Pfad ist es nicht.
 *
 * Unbrauchbare Einträge werden übersprungen und gemeldet — dieselbe Haltung wie
 * bei den Artikeln: Ein Tippfehler in Eintrag 14 darf die Einträge 1 bis 13
 * nicht mitnehmen.
 */
export function ladeThemenVorrat(): ThemaImVorrat[] {
  if (!fs.existsSync(VORRAT_DATEI)) {
    warne("Themen-Vorrat fehlt — es kann nichts produziert werden", {
      datei: path.relative(WURZEL, VORRAT_DATEI),
    });
    return [];
  }

  let roh: unknown;
  try {
    roh = JSON.parse(fs.readFileSync(VORRAT_DATEI, "utf8")) as unknown;
  } catch (ausnahme: unknown) {
    throw new Error(
      `${path.relative(WURZEL, VORRAT_DATEI)} ist kein gültiges JSON: ` +
        `${ausnahme instanceof Error ? ausnahme.message : String(ausnahme)}. ` +
        "Der Vorrat wird bei jedem Lauf neu geschrieben — hier nichts raten, sondern " +
        "die letzte gute Fassung aus dem Git holen.",
    );
  }

  if (!Array.isArray(roh)) {
    throw new Error(
      `${path.relative(WURZEL, VORRAT_DATEI)} muss eine Liste von Themen enthalten.`,
    );
  }

  const themen: ThemaImVorrat[] = [];
  for (const [stelle, eintrag] of roh.entries()) {
    if (!istVerwertbar(eintrag)) {
      warne("Eintrag im Themen-Vorrat übersprungen — Pflichtfelder fehlen oder passen nicht", {
        stelle,
      });
      continue;
    }
    themen.push(eintrag);
  }

  return themen;
}

/** Schreibt den Vorrat zurück und gibt den Pfad zurück. */
export function schreibeThemenVorrat(themen: ThemaImVorrat[]): string {
  return schreibeJson(VORRAT_DATEI, themen);
}

/**
 * Trägt am Thema ein, welcher Artikel daraus entstanden ist.
 *
 * **Wirft, wenn die Kennung nicht existiert.** Ein stilles Nichtstun wäre hier
 * die teuerste Variante: Das Thema bliebe offen, der nächste Lauf produzierte
 * es erneut, und am Ende stünden zwei Artikel auf demselben Keyword — genau
 * der Fall, den die Regel „ein Keyword, ein Artikel" verhindern soll, und der
 * dem Loader erst beim Build auffällt.
 *
 * Ein bereits erledigtes Thema wird überschrieben, aber gemeldet: Es kommt
 * vor — ein Artikel wird verworfen und neu geschrieben — und soll trotzdem
 * jemandem auffallen.
 */
export function markiereErledigt(themaId: string, artikelSlug: string): void {
  const themen = ladeThemenVorrat();
  const thema = themen.find((eintrag) => eintrag.id === themaId);

  if (!thema) {
    throw new Error(
      `Thema "${themaId}" steht nicht im Vorrat und kann nicht als erledigt markiert ` +
        "werden. Ohne diesen Eintrag produziert der nächste Lauf dasselbe Thema noch " +
        "einmal.",
    );
  }

  if (thema.erledigt && thema.erledigt !== artikelSlug) {
    warne("Thema war bereits erledigt und wird neu zugeordnet", {
      thema: themaId,
      vorher: thema.erledigt,
      jetzt: artikelSlug,
    });
  }

  thema.erledigt = artikelSlug;
  schreibeThemenVorrat(themen);
  melde("Thema als erledigt markiert", { thema: themaId, artikel: artikelSlug });
}
