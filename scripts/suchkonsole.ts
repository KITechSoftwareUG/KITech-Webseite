import "./blog-engine/lib/umgebung.js";

/**
 * Bedienwerkzeug für die Google Search Console.
 *
 *     npm run gsc -- konto              Adresse des Dienstkontos (für den Eintrag in der Console)
 *     npm run gsc -- properties         Selbsttest: Was sieht das Dienstkonto?
 *     npm run gsc -- leistung           Klicks und Positionen der letzten 28 Tage
 *     npm run gsc -- seite <adresse>    Index-Status einer Adresse
 *     npm run gsc -- sitemaps           Stand der eingereichten Sitemaps
 *
 * **Warum ein Kommandozeilenwerkzeug und keine Oberfläche.** Die Search Console
 * hat bereits eine Oberfläche, und eine zweite wäre schlechter. Was ihr fehlt,
 * ist der Zugriff von außen: aus einem Skript, aus dem Cron, aus einer
 * Agentensitzung. Genau das ist hier gebaut — jeder Befehl gibt mit `--json`
 * seine Rohdaten aus und lässt sich weiterverarbeiten.
 *
 * ⚠️ **Dieses Werkzeug liest, es steuert Google nicht.** Es gibt keinen Befehl,
 * der eine Indexierung erzwingt: Die Indexing API ist auf `JobPosting` und
 * `BroadcastEvent` beschränkt, jede andere Nutzung ist ein Verstoß. Was hier
 * schreibt, ist einzig `sitemaps --einreichen`.
 */

import {
  leistung,
  properties,
  pruefeUrl,
  sitemapEinreichen,
  sitemaps,
  property,
  type Dimension,
  type Zeile,
} from "./blog-engine/lib/searchconsole.js";
import { dienstkontoAdresse } from "./blog-engine/lib/google-auth.js";

/** Wie viele Adressen gleichzeitig geprüft werden. */
const GLEICHZEITIG = 4;

// ---------------------------------------------------------------------------
// Argumente
// ---------------------------------------------------------------------------

const argumente = process.argv.slice(2);
const befehl = argumente[0];
const alsJson = argumente.includes("--json");

function schalter(name: string, standard: string): string {
  const i = argumente.indexOf(`--${name}`);
  return i >= 0 && argumente[i + 1] ? argumente[i + 1] : standard;
}

/** `JJJJ-MM-TT` für „vor n Tagen". */
function tagVor(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Ausgabe
// ---------------------------------------------------------------------------

function zahl(wert: number, stellen = 0): string {
  return wert.toLocaleString("de-DE", {
    minimumFractionDigits: stellen,
    maximumFractionDigits: stellen,
  });
}

/** Kürzt lange Zellen, damit die Tabelle im Terminal nicht umbricht. */
function kuerze(text: string, breite: number): string {
  return text.length <= breite ? text.padEnd(breite) : `${text.slice(0, breite - 1)}…`;
}

function tabelle(zeilen: Zeile[], titel: string, breite = 52): void {
  console.log(`\n${titel.padEnd(breite)}  Klicks   Impr.     CTR   Pos.`);
  console.log("─".repeat(breite + 32));
  for (const z of zeilen) {
    const name = z.keys?.join(" · ") ?? "(gesamt)";
    console.log(
      `${kuerze(name, breite)}  ${zahl(z.clicks).padStart(6)}  ${zahl(z.impressions).padStart(6)}` +
        `  ${zahl(z.ctr * 100, 1).padStart(5)}%  ${zahl(z.position, 1).padStart(5)}`
    );
  }
}

// ---------------------------------------------------------------------------
// Befehle
// ---------------------------------------------------------------------------

async function befehlKonto(): Promise<void> {
  const adresse = dienstkontoAdresse();
  console.log(`\nDienstkonto: ${adresse}`);
  console.log(`Property:    ${property()}`);
  console.log(
    "\nDamit dieses Konto Daten sieht, muss die Adresse in der Search Console\n" +
      "unter Einstellungen → Nutzer und Berechtigungen als Nutzer eingetragen\n" +
      "sein. Berechtigung „Vollständig“ — „Eingeschränkt“ genügt der\n" +
      "URL-Prüfung nicht.\n"
  );
}

async function befehlProperties(): Promise<void> {
  const liste = await properties();

  if (alsJson) {
    console.log(JSON.stringify(liste, null, 2));
    return;
  }

  if (liste.length === 0) {
    console.log(
      "\nDas Dienstkonto sieht keine einzige Property.\n\n" +
        "Der Schlüssel ist damit in Ordnung — die Anmeldung hat funktioniert.\n" +
        "Was fehlt, ist der Eintrag in der Search Console selbst:\n" +
        `  Einstellungen → Nutzer und Berechtigungen → Nutzer hinzufügen\n` +
        `  Adresse: ${dienstkontoAdresse()}\n`
    );
    return;
  }

  console.log("\nZugängliche Properties:\n");
  for (const p of liste) {
    const markierung = p.siteUrl === property() ? " ← eingestellt" : "";
    console.log(`  ${p.siteUrl}  (${p.permissionLevel})${markierung}`);
  }
  console.log();
}

async function befehlLeistung(): Promise<void> {
  const tage = Number(schalter("tage", "28"));
  const nach = schalter("nach", "query") as Dimension;
  const grenze = Number(schalter("grenze", "25"));
  const pfad = argumente.indexOf("--pfad") >= 0 ? schalter("pfad", "") : null;
  const datenstand = argumente.includes("--frisch") ? "ALL" : "FINAL";

  const von = tagVor(tage);
  const bis = tagVor(0);

  const filter = pfad
    ? [{ dimension: "page" as Dimension, operator: "CONTAINS", ausdruck: pfad }]
    : undefined;

  /*
   * Zwei Abfragen mit Absicht: Die Gesamtsumme ohne Dimension ist die einzige
   * vollständige Zahl. Die Summe der Zeilen darunter ist kleiner, weil Google
   * seltene Suchanfragen weglässt — ohne die Gegenüberstellung sieht man das
   * nicht und hält die kleinere Zahl für die Wahrheit.
   */
  const [gesamt, zeilen] = await Promise.all([
    leistung({ von, bis, grenze: 1, datenstand, filter }),
    leistung({ von, bis, dimensionen: [nach], grenze, datenstand, filter }),
  ]);

  if (alsJson) {
    console.log(JSON.stringify({ von, bis, nach, gesamt: gesamt[0] ?? null, zeilen }, null, 2));
    return;
  }

  console.log(`\n${property()} · ${von} bis ${bis}${pfad ? ` · nur Adressen mit „${pfad}“` : ""}`);
  if (datenstand === "ALL") {
    console.log("⚠️  --frisch: enthält unvollständige Tage, nicht für Vergleiche verwenden.");
  }

  if (gesamt[0]) {
    tabelle([gesamt[0]], "Gesamt");
  }

  if (zeilen.length === 0) {
    console.log(
      `\nKeine Zeilen für „${nach}“.\n` +
        "Bei einer jungen Property ist das normal: Ohne Impressionen gibt es\n" +
        "nichts zu berichten. Die Daten hinken zwei bis drei Tage hinterher."
    );
    return;
  }

  tabelle(zeilen, `Nach ${nach}`);

  const summe = zeilen.reduce((s, z) => s + z.clicks, 0);
  if (gesamt[0] && nach === "query" && summe < gesamt[0].clicks) {
    console.log(
      `\nHinweis: ${zahl(summe)} von ${zahl(gesamt[0].clicks)} Klicks entfallen auf die\n` +
        "gezeigten Suchanfragen. Die Lücke sind anonymisierte Anfragen, die Google\n" +
        "zum Schutz einzelner Personen nicht ausweist — kein Fehler."
    );
  }
  console.log();
}

async function befehlSeite(): Promise<void> {
  const adresse = argumente[1];
  if (!adresse || adresse.startsWith("--")) {
    console.error("Aufruf: npm run gsc -- seite https://kitech-software.de/pfad");
    process.exitCode = 1;
    return;
  }

  const befund = await pruefeUrl(adresse);

  if (alsJson) {
    console.log(JSON.stringify(befund, null, 2));
    return;
  }

  console.log(`\n${adresse}\n`);
  console.log(`  Urteil:        ${befund.verdict ?? "—"}`);
  console.log(`  Im Index:      ${befund.coverageState ?? "—"}`);
  console.log(`  Indexierung:   ${befund.indexingState ?? "—"}`);
  console.log(`  robots.txt:    ${befund.robotsTxtState ?? "—"}`);
  console.log(`  Abruf:         ${befund.pageFetchState ?? "—"}`);
  console.log(`  Zuletzt geholt:${befund.lastCrawlTime ? ` ${befund.lastCrawlTime}` : " noch nie"}`);
  console.log(`  Als:           ${befund.crawledAs ?? "—"}`);
  console.log(`  Canonical (wir):    ${befund.userCanonical ?? "—"}`);
  console.log(`  Canonical (Google): ${befund.googleCanonical ?? "—"}`);
  if (befund.sitemap?.length) console.log(`  In Sitemap:    ${befund.sitemap.join(", ")}`);

  if (
    befund.googleCanonical &&
    befund.userCanonical &&
    befund.googleCanonical !== befund.userCanonical
  ) {
    console.log(
      "\n⚠️  Google hat eine andere Seite als maßgeblich gewählt als wir angegeben\n" +
        "    haben. Diese Adresse erscheint dann nicht in den Ergebnissen — die\n" +
        "    andere erscheint an ihrer Stelle."
    );
  }
  console.log();
}

async function befehlSitemaps(): Promise<void> {
  const i = argumente.indexOf("--einreichen");
  if (i >= 0) {
    const adresse = argumente[i + 1] ?? "https://kitech-software.de/sitemap.xml";
    await sitemapEinreichen(adresse);
    console.log(`\nEingereicht: ${adresse}`);
    console.log("Google liest sie, wann es will — der Stand steht in ein paar Stunden hier.\n");
    return;
  }

  const liste = await sitemaps();

  if (alsJson) {
    console.log(JSON.stringify(liste, null, 2));
    return;
  }

  if (liste.length === 0) {
    console.log("\nKeine Sitemap eingereicht. Einreichen mit:");
    console.log("  npm run gsc -- sitemaps --einreichen https://kitech-software.de/sitemap.xml\n");
    return;
  }

  console.log();
  for (const s of liste) {
    console.log(`  ${s.path}`);
    console.log(`    eingereicht: ${s.lastSubmitted?.slice(0, 10) ?? "—"}`);
    console.log(`    gelesen:     ${s.lastDownloaded?.slice(0, 10) ?? "noch nicht"}`);
    console.log(`    Fehler: ${s.errors ?? 0} · Warnungen: ${s.warnings ?? 0}`);
    for (const inhalt of s.contents ?? []) {
      /*
       * Nur `submitted`. Das Feld `indexed` liefert Google konstant 0 und wäre
       * hier ein Fehlalarm — siehe Kommentar an `SitemapStand.contents`.
       */
      console.log(`    ${inhalt.type}: ${inhalt.submitted} Adressen eingereicht`);
    }
  }
  console.log(
    "\n  Wie viele davon im Index sind, sagt die Sitemap-API nicht — ihr Feld\n" +
      "  dafür ist tot. Einzelne Adresse prüfen: npm run gsc -- seite <adresse>"
  );
  console.log();
}

/**
 * Prüft jede Adresse der Sitemap einzeln bei Google nach.
 *
 * **Warum das nötig ist.** Der Bericht „Seiten" in der Oberfläche zeigt dieselbe
 * Auskunft, aber nur zum Anschauen. Und die Sitemap-API, die die Frage
 * beantworten müsste, liefert dafür ein totes Feld. Bleibt der Weg über die
 * URL-Prüfung: eine Anfrage je Adresse, dafür die verlässliche Antwort — samt
 * Grund, wenn eine Seite fehlt.
 *
 * ⚠️ **Das kostet Kontingent**: 2000 Adressen je Tag und Property. Bei 38
 * Adressen ist das reichlich; ab einigen hundert Artikeln ist es das nicht mehr,
 * dann grenzt `--grenze` ein.
 */
async function befehlAbdeckung(): Promise<void> {
  const quelle = schalter("sitemap", "https://kitech-software.de/sitemap.xml");
  const grenze = Number(schalter("grenze", "500"));

  const xml = await (await fetch(quelle)).text();
  const adressen = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((treffer) => treffer[1].trim())
    .slice(0, grenze);

  if (adressen.length === 0) {
    console.error(`Keine <loc>-Einträge in ${quelle}.`);
    process.exitCode = 1;
    return;
  }

  if (!alsJson) {
    console.log(`\n${adressen.length} Adressen aus ${quelle} — das dauert einen Moment.`);
  }

  const ergebnisse: { adresse: string; befund: Awaited<ReturnType<typeof pruefeUrl>> }[] = [];

  /*
   * In kleinen Gruppen statt alle auf einmal: Das Minutenlimit liegt bei 600,
   * und ein Schwall paralleler Anfragen bringt keinen Vorteil, weil Google
   * ohnehin je Adresse antwortet.
   */
  for (let i = 0; i < adressen.length; i += GLEICHZEITIG) {
    const gruppe = adressen.slice(i, i + GLEICHZEITIG);
    const stapel = await Promise.all(
      gruppe.map(async (adresse) => ({ adresse, befund: await pruefeUrl(adresse) }))
    );
    ergebnisse.push(...stapel);
    if (!alsJson) process.stdout.write(".");
  }
  if (!alsJson) console.log("\n");

  if (alsJson) {
    console.log(JSON.stringify(ergebnisse, null, 2));
    return;
  }

  const drin = ergebnisse.filter((e) => e.befund.verdict === "PASS");
  const draussen = ergebnisse.filter((e) => e.befund.verdict !== "PASS");

  if (draussen.length > 0) {
    console.log("Nicht im Index:\n");
    for (const { adresse, befund } of draussen) {
      console.log(`  ${adresse.replace("https://kitech-software.de", "")}`);
      console.log(`    ${befund.coverageState ?? "unbekannt"}`);
      /*
       * Weicht Googles Canonical ab, ist das der Grund — und zwar einer, den
       * `coverageState` allein nicht verrät.
       */
      if (befund.googleCanonical && befund.googleCanonical !== adresse) {
        console.log(`    Google wählte stattdessen: ${befund.googleCanonical}`);
      }
    }
    console.log();
  }

  console.log("Im Index:\n");
  for (const { adresse, befund } of drin) {
    const pfad = adresse.replace("https://kitech-software.de", "") || "/";
    const geholt = befund.lastCrawlTime?.slice(0, 10) ?? "—";
    console.log(`  ${kuerze(pfad, 62)} ${geholt}`);
  }

  console.log(
    `\n${drin.length} von ${ergebnisse.length} im Index` +
      (draussen.length ? `, ${draussen.length} nicht` : "") +
      ".\n"
  );
}

// ---------------------------------------------------------------------------

const BEFEHLE: Record<string, () => Promise<void>> = {
  konto: befehlKonto,
  properties: befehlProperties,
  leistung: befehlLeistung,
  seite: befehlSeite,
  sitemaps: befehlSitemaps,
  abdeckung: befehlAbdeckung,
};

async function main(): Promise<void> {
  const auszufuehren = BEFEHLE[befehl ?? ""];

  if (!auszufuehren) {
    console.log(
      "\nGoogle Search Console\n\n" +
        "  npm run gsc -- konto                    Adresse des Dienstkontos\n" +
        "  npm run gsc -- properties               Selbsttest: Was ist zugänglich?\n" +
        "  npm run gsc -- leistung                 Letzte 28 Tage nach Suchanfrage\n" +
        "    --tage 90                             anderer Zeitraum\n" +
        "    --nach page|date|query|country|device andere Aufschlüsselung\n" +
        "    --pfad /gratis-wissen/                nur Adressen, die das enthalten\n" +
        "    --grenze 50                           mehr Zeilen\n" +
        "    --frisch                              auch unvollständige Tage\n" +
        "  npm run gsc -- seite <adresse>          Index-Status einer Adresse\n" +
        "  npm run gsc -- abdeckung                Jede Sitemap-Adresse einzeln nachschlagen\n" +
        "    --grenze 50                           Kontingent schonen (2000/Tag)\n" +
        "  npm run gsc -- sitemaps                 Stand der Sitemaps\n" +
        "    --einreichen <adresse>                Sitemap einreichen\n\n" +
        "  --json bei jedem Befehl: Rohdaten statt Tabelle\n"
    );
    return;
  }

  try {
    await auszufuehren();
  } catch (ursache) {
    console.error(`\n${ursache instanceof Error ? ursache.message : String(ursache)}\n`);
    process.exitCode = 1;
  }
}

void main();
