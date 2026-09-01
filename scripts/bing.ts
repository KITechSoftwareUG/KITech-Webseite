import "./blog-engine/lib/umgebung.js";

/**
 * Bedienwerkzeug für die Bing Webmaster Tools.
 *
 *     npm run bing -- zugang             Selbsttest: Was sieht der Schlüssel?
 *     npm run bing -- status             Ein Bild: Index, Crawl, Sitemaps, Kontingent
 *     npm run bing -- leistung           Klicks, Impressionen, Suchanfragen, Seiten
 *     npm run bing -- crawl              Crawl-Reihe und offene Beanstandungen
 *     npm run bing -- abdeckung          Jede Sitemap-Adresse einzeln nachschlagen
 *     npm run bing -- seite <adresse>    Was Bing über eine Adresse weiß
 *     npm run bing -- keyword <begriff>  Suchvolumen — kostenlos, im Gegensatz zu DataForSEO
 *     npm run bing -- sitemaps           Stand der Sitemaps
 *     npm run bing -- einreichen         Sitemap-Adressen zur Prüfung einreichen
 *
 * **Warum neben `npm run gsc` ein zweites Werkzeug und keine gemeinsame
 * Oberfläche.** Die beiden Dienste beantworten verschiedene Fragen, und ein
 * gemeinsamer Nenner wäre die kleinere Schnittmenge. Google misst Positionen,
 * die Bing nicht kennt; Bing nennt Suchvolumen und nimmt Einreichungen an, was
 * Google beides nicht tut. Zusammengelegt bliebe von beidem die Hälfte.
 *
 * ⚠️ **Bing ist nicht Google.** Jede Zahl hier beschreibt Bings Sicht. Für die
 * Frage „wie stehen wir bei Google" ist `npm run gsc` zuständig — Zahlen von
 * hier dort einzusetzen, führt in die Irre.
 */

import {
  bingDatum,
  blockierteUrls,
  crawlEinstellungen,
  crawlFehler,
  crawlZahlen,
  feedEinreichen,
  feeds,
  geholtAm,
  keyword,
  kontingent,
  linkZahlen,
  seiten,
  site,
  sites,
  suchanfragen,
  urlAuskunft,
  urlsEinreichen,
  verkehr,
  verwandteKeywords,
  type CrawlZahl,
} from "./blog-engine/lib/bing.js";

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

/** Die Sitemap, aus der `abdeckung` und `einreichen` ihre Adressen ziehen. */
const SITEMAP = "https://kitech-software.de/sitemap.xml";

/**
 * Wie viele Nachschlagevorgänge gleichzeitig laufen. Bing nennt kein
 * Minutenlimit; fünf ist die Zahl, bei der nichts abgewiesen wurde, ohne den
 * Dienst zu bestürmen.
 */
const GLEICHZEITIG = 5;

// ---------------------------------------------------------------------------
// Ausgabe
// ---------------------------------------------------------------------------

function zahl(wert: number, stellen = 0): string {
  return wert.toLocaleString("de-DE", {
    minimumFractionDigits: stellen,
    maximumFractionDigits: stellen,
  });
}

function kuerze(text: string, breite: number): string {
  return text.length <= breite ? text.padEnd(breite) : `${text.slice(0, breite - 1)}…`;
}

/** `JJJJ-MM-TT` aus Microsofts `/Date(…)/`, oder ein Strich. */
function tag(wert: string | null | undefined): string {
  return bingDatum(wert)?.toISOString().slice(0, 10) ?? "—";
}

/** Der Pfad ohne Domain — in Tabellen liest sich das erheblich besser. */
function pfad(adresse: string): string {
  return adresse.replace(/^https?:\/\/kitech-software\.de/, "") || "/";
}

/** Holt die Adressen der Sitemap. Beide Befehle unten brauchen dieselbe Liste. */
async function sitemapAdressen(grenze: number): Promise<string[]> {
  const quelle = schalter("sitemap", SITEMAP);
  const xml = await (await fetch(quelle)).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((t) => t[1].trim()).slice(0, grenze);
}

// ---------------------------------------------------------------------------
// Befehle
// ---------------------------------------------------------------------------

async function befehlZugang(): Promise<void> {
  const liste = await sites();

  if (alsJson) {
    console.log(JSON.stringify(liste, null, 2));
    return;
  }

  if (liste.length === 0) {
    console.log(
      "\nDer Schlüssel ist gültig, sieht aber keine einzige Site.\n\n" +
        "Er hängt am angemeldeten Konto: Was dieses Konto in den Webmaster Tools\n" +
        "nicht bestätigt hat, taucht hier nicht auf.\n"
    );
    return;
  }

  console.log("\nSites, die dieser Schlüssel sieht:\n");
  for (const s of liste) {
    const markierung = s.Url === site() ? " ← eingestellt" : "";
    console.log(`  ${s.Url}${markierung}`);
    console.log(`    bestätigt: ${s.IsVerified ? "ja" : "NEIN"}`);
    console.log(`    Meta-Tag:  ${s.AuthenticationCode}`);
  }
  console.log(
    "\n  Der Wert bei „Meta-Tag“ muss mit BING_SITE_VERIFICATION in\n" +
      "  src/config/suchkonsolen.ts übereinstimmen. Weicht er ab, verliert die\n" +
      "  Domain beim nächsten Nachprüfen still ihren bestätigten Status.\n"
  );
}

/**
 * Der eine Befehl, der die Lage zeigt.
 *
 * Die aussagekräftigste Zahl ist nicht in der Oberfläche zu finden: `InIndex`
 * gegen die Zahl der Sitemap-Adressen. Alles andere kann grün sein, während
 * Bing die Hälfte der Seiten wegwirft.
 */
async function befehlStatus(): Promise<void> {
  const [liste, crawl, feedListe, quote, einstellungen, links, blockiert] = await Promise.all([
    sites(),
    crawlZahlen(),
    feeds(),
    kontingent(),
    crawlEinstellungen(),
    linkZahlen().catch(() => null),
    blockierteUrls().catch(() => []),
  ]);

  const eigene = liste.find((s) => s.Url === site());
  const neueste = crawl.at(-1);
  const adressen = await sitemapAdressen(10_000).catch(() => []);

  if (alsJson) {
    console.log(
      JSON.stringify(
        { site: site(), eigene, neueste, feeds: feedListe, quote, einstellungen, sitemapAdressen: adressen.length },
        null,
        2
      )
    );
    return;
  }

  console.log(`\n${site()}`);
  console.log(`  bestätigt:        ${eigene?.IsVerified ? "ja" : "NEIN"}`);

  if (neueste) {
    console.log(`\nStand ${tag(neueste.Date)}`);
    console.log(`  Im Bing-Index:    ${zahl(neueste.InIndex)}`);
    if (adressen.length > 0) {
      const anteil = (neueste.InIndex / adressen.length) * 100;
      console.log(`  In der Sitemap:   ${zahl(adressen.length)}  (${zahl(anteil, 0)} % davon im Index)`);
    }
    console.log(`  Gecrawlt am Tag:  ${zahl(neueste.CrawledPages)}`);
    console.log(`  Eingehende Links: ${zahl(neueste.InLinks)}`);
    console.log(`  Crawl-Fehler:     ${zahl(neueste.CrawlErrors)}`);
  }

  console.log(`\nSitemaps`);
  for (const f of feedListe) {
    console.log(`  ${f.Url}`);
    console.log(`    ${f.Status} · ${zahl(f.UrlCount)} Adressen · gelesen ${tag(f.LastCrawled)}`);
  }

  console.log(`\nEinreichungen`);
  console.log(`  Kontingent:       ${zahl(quote.DailyQuota)} am Tag · ${zahl(quote.MonthlyQuota)} im Monat`);

  const rate = einstellungen.CrawlRate;
  const gleich = rate.every((w) => w === rate[0]);
  console.log(`\nCrawl-Rate          ${gleich ? `${rate[0]} von 10, alle 24 Stunden` : rate.join(",")}`);
  console.log(`  Boost verfügbar:  ${einstellungen.CrawlBoostAvailable ? "ja" : "nein"}`);

  if (links) console.log(`\nEingehende Links    ${zahl(links.TotalPages)} verweisende Seiten`);
  if (blockiert.length > 0) console.log(`\n⚠️  ${blockiert.length} Adressen sind in Bing blockiert.`);

  if (neueste && adressen.length > 0 && neueste.InIndex < adressen.length) {
    console.log(
      `\n⚠️  ${zahl(adressen.length - neueste.InIndex)} Adressen der Sitemap sind nicht im Index.\n` +
        "    Welche das sind: npm run bing -- abdeckung\n" +
        "    Bing crawlt sie, behält sie aber nicht — das ist fast immer eine Frage\n" +
        "    fehlender eingehender Links, nicht der Crawl-Rate."
    );
  }
  console.log();
}

async function befehlLeistung(): Promise<void> {
  const [tage, anfragen, seitenListe] = await Promise.all([verkehr(), suchanfragen(), seiten()]);

  if (alsJson) {
    console.log(JSON.stringify({ verkehr: tage, suchanfragen: anfragen, seiten: seitenListe }, null, 2));
    return;
  }

  const klicks = tage.reduce((s, t) => s + t.Clicks, 0);
  const impressionen = tage.reduce((s, t) => s + t.Impressions, 0);

  console.log(`\n${site()} · ${tage.length} Tage`);
  console.log(`  Klicks:       ${zahl(klicks)}`);
  console.log(`  Impressionen: ${zahl(impressionen)}`);

  if (impressionen === 0) {
    console.log(
      "\nNull Impressionen heißt: Die Seiten sind zwar im Index, erscheinen aber in\n" +
        "keiner Ergebnisliste weit genug oben, um gezählt zu werden. Bei einer jungen\n" +
        "Domain ohne eingehende Links ist das der erwartete Zustand, kein Defekt.\n"
    );
    return;
  }

  if (anfragen.length > 0) {
    console.log(`\n${kuerze("Suchanfrage", 46)}  Klicks   Impr.   Pos.`);
    console.log("─".repeat(72));
    for (const a of anfragen.slice(0, 25)) {
      console.log(
        `${kuerze(a.Query, 46)}  ${zahl(a.Clicks).padStart(6)}  ${zahl(a.Impressions).padStart(6)}` +
          `  ${zahl(a.AvgImpressionPosition, 1).padStart(5)}`
      );
    }
  }

  if (seitenListe.length > 0) {
    console.log(`\n${kuerze("Seite", 46)}  Klicks   Impr.   Pos.`);
    console.log("─".repeat(72));
    for (const s of seitenListe.slice(0, 25)) {
      console.log(
        `${kuerze(pfad(s.Query), 46)}  ${zahl(s.Clicks).padStart(6)}  ${zahl(s.Impressions).padStart(6)}` +
          `  ${zahl(s.AvgImpressionPosition, 1).padStart(5)}`
      );
    }
  }
  console.log();
}

async function befehlCrawl(): Promise<void> {
  const [reihe, fehler] = await Promise.all([crawlZahlen(), crawlFehler()]);

  if (alsJson) {
    console.log(JSON.stringify({ reihe, fehler }, null, 2));
    return;
  }

  console.log(`\nDatum        Gecrawlt  Index  Links   2xx  301  302  4xx  5xx  Fehler`);
  console.log("─".repeat(72));
  for (const t of reihe) {
    console.log(
      `${tag(t.Date)}  ${zahl(t.CrawledPages).padStart(8)}  ${zahl(t.InIndex).padStart(5)}` +
        `  ${zahl(t.InLinks).padStart(5)}  ${zahl(t.Code2xx).padStart(4)}  ${zahl(t.Code301).padStart(3)}` +
        `  ${zahl(t.Code302).padStart(3)}  ${zahl(t.Code4xx).padStart(3)}  ${zahl(t.Code5xx).padStart(3)}` +
        `  ${zahl(t.CrawlErrors).padStart(6)}`
    );
  }

  const auffaellig = reihe.filter((t: CrawlZahl) => t.Code5xx > 0 || t.BlockedByRobotsTxt > 0 || t.DnsFailures > 0);
  if (auffaellig.length > 0) {
    console.log("\n⚠️  Tage mit 5xx, robots.txt-Blockade oder DNS-Ausfall:");
    for (const t of auffaellig) {
      console.log(`    ${tag(t.Date)}  5xx ${t.Code5xx} · robots ${t.BlockedByRobotsTxt} · DNS ${t.DnsFailures}`);
    }
  }

  if (fehler.length === 0) {
    console.log("\nKeine offenen Beanstandungen.\n");
    return;
  }

  console.log(`\n${fehler.length} Beanstandungen:\n`);
  for (const f of fehler.slice(0, 40)) {
    console.log(`  ${kuerze(pfad(f.Url), 58)} HTTP ${f.HttpCode}`);
  }
  console.log();
}

async function befehlSeite(): Promise<void> {
  const adresse = argumente[1];
  if (!adresse || adresse.startsWith("--")) {
    console.error("Aufruf: npm run bing -- seite https://kitech-software.de/pfad");
    process.exitCode = 1;
    return;
  }

  const auskunft = await urlAuskunft(adresse);

  if (alsJson) {
    console.log(JSON.stringify(auskunft, null, 2));
    return;
  }

  if (!auskunft) {
    console.log(`\n${adresse}\n\n  Bing kennt diese Adresse nicht.\n`);
    return;
  }

  console.log(`\n${adresse}\n`);
  console.log(`  Als Seite geführt: ${auskunft.IsPage ? "ja" : "nein"}`);
  console.log(`  Entdeckt:          ${tag(auskunft.DiscoveryDate)}`);
  console.log(`  Zuletzt geholt:    ${tag(auskunft.LastCrawledDate)}`);
  console.log(`  Größe:             ${zahl(auskunft.DocumentSize)} Bytes`);
  console.log(`  Verweise darauf:   ${zahl(auskunft.AnchorCount)}`);

  if (auskunft.AnchorCount === 0) {
    console.log(
      "\n  ⚠️  Keine Verweise auf diese Adresse. Bing gewichtet interne Verlinkung\n" +
        "      stark — eine Seite, auf die nichts zeigt, bleibt oft draußen."
    );
  }
  console.log();
}

/**
 * Schlägt jede Sitemap-Adresse einzeln nach.
 *
 * `GetUrlInfo` ist die einzige Auskunft, die je Adresse antwortet. Ein
 * `LastCrawledDate` heißt: Bing hat die Seite geholt. Ob sie im Index steht,
 * sagt keine Schnittstelle je Adresse — die Gesamtzahl steht in `status`.
 */
async function befehlAbdeckung(): Promise<void> {
  const grenze = Number(schalter("grenze", "500"));
  const adressen = await sitemapAdressen(grenze);

  if (adressen.length === 0) {
    console.error("Keine <loc>-Einträge in der Sitemap.");
    process.exitCode = 1;
    return;
  }

  if (!alsJson) console.log(`\n${adressen.length} Adressen — das dauert einen Moment.`);

  const ergebnisse: { adresse: string; auskunft: Awaited<ReturnType<typeof urlAuskunft>> }[] = [];
  for (let i = 0; i < adressen.length; i += GLEICHZEITIG) {
    const gruppe = adressen.slice(i, i + GLEICHZEITIG);
    ergebnisse.push(
      ...(await Promise.all(
        gruppe.map(async (adresse) => ({
          adresse,
          auskunft: await urlAuskunft(adresse).catch(() => null),
        }))
      ))
    );
    if (!alsJson) process.stdout.write(".");
  }
  if (!alsJson) console.log("\n");

  if (alsJson) {
    console.log(JSON.stringify(ergebnisse, null, 2));
    return;
  }

  const bekannt = ergebnisse.filter((e) => geholtAm(e.auskunft));
  const unbekannt = ergebnisse.filter((e) => !geholtAm(e.auskunft));

  if (unbekannt.length > 0) {
    console.log("Von Bing nie geholt:\n");
    for (const { adresse } of unbekannt) console.log(`  ${pfad(adresse)}`);
    console.log(`\n  Einreichen: npm run bing -- einreichen --fehlend\n`);
  }

  console.log("Geholt:\n");
  for (const { adresse, auskunft } of bekannt) {
    const ohne = auskunft!.AnchorCount === 0 ? "  ⚠️ ohne Verweise" : "";
    console.log(`  ${kuerze(pfad(adresse), 58)} ${tag(auskunft!.LastCrawledDate)}${ohne}`);
  }

  console.log(`\n${bekannt.length} von ${ergebnisse.length} geholt.`);
  console.log("Wie viele davon im Index sind, sagt nur die Gesamtzahl: npm run bing -- status\n");
}

async function befehlKeyword(): Promise<void> {
  const begriff = argumente[1];
  if (!begriff || begriff.startsWith("--")) {
    console.error('Aufruf: npm run bing -- keyword "KI Beratung"');
    process.exitCode = 1;
    return;
  }

  const land = schalter("land", "de");
  const sprache = schalter("sprache", "de-DE");

  const [einzeln, verwandt] = await Promise.all([
    keyword(begriff, undefined, undefined, land, sprache),
    verwandteKeywords(begriff, undefined, undefined, land, sprache).catch(() => []),
  ]);

  if (alsJson) {
    console.log(JSON.stringify({ begriff, einzeln, verwandt }, null, 2));
    return;
  }

  console.log(`\n„${begriff}“ · ${land} · ${sprache}\n`);
  console.log(`  Impressionen (exakt):    ${zahl(einzeln.Impressions)}`);
  console.log(`  Impressionen (weit):     ${zahl(einzeln.BroadImpressions)}`);

  if (einzeln.Impressions === 0) {
    console.log(
      "\n  Null heißt nicht „Fehler“, sondern „unter der Schwelle, die Bing\n" +
        "  ausweist“. Für deutsche B2B-Begriffe ist das der Normalfall."
    );
  }

  if (verwandt.length > 0) {
    console.log(`\n${kuerze("Verwandter Begriff", 46)}    exakt      weit`);
    console.log("─".repeat(72));
    for (const v of verwandt.slice(0, 30)) {
      console.log(
        `${kuerze(v.Query ?? "—", 46)}  ${zahl(v.Impressions).padStart(7)}  ${zahl(v.BroadImpressions).padStart(8)}`
      );
    }
  }
  console.log(
    "\n  ⚠️  Das ist Bings Volumen, nicht Googles. Als Größenordnung brauchbar,\n" +
      "      als Googles Nachfrage nicht.\n"
  );
}

async function befehlSitemaps(): Promise<void> {
  const i = argumente.indexOf("--einreichen");
  if (i >= 0) {
    const adresse = argumente[i + 1] ?? SITEMAP;
    await feedEinreichen(adresse);
    console.log(`\nEingereicht: ${adresse}\n`);
    return;
  }

  const liste = await feeds();

  if (alsJson) {
    console.log(JSON.stringify(liste, null, 2));
    return;
  }

  console.log();
  for (const f of liste) {
    console.log(`  ${f.Url}`);
    console.log(`    Typ:         ${f.Type}`);
    console.log(`    Status:      ${f.Status}`);
    console.log(`    Adressen:    ${zahl(f.UrlCount)}`);
    console.log(`    eingereicht: ${tag(f.Submitted)}`);
    console.log(`    gelesen:     ${tag(f.LastCrawled)}`);
    if (!f.Url.startsWith("https://kitech-software.de")) {
      console.log(`    ⚠️  Nicht die kanonische Adresse — von Bing selbst gefunden.`);
    }
  }
  console.log();
}

/**
 * Reicht Adressen zur Prüfung ein.
 *
 * ⚠️ **Das erzwingt keine Indexierung.** Bing nimmt die Adresse in die
 * Warteschlange. Dieselbe Adresse mehrfach einzureichen beschleunigt nichts.
 *
 * Ohne Schalter passiert nichts — der Befehl zeigt, was er täte. Einreichen
 * ist eine Handlung nach außen, und die soll man ausdrücklich auslösen.
 */
async function befehlEinreichen(): Promise<void> {
  const nurFehlende = argumente.includes("--fehlend");
  const wirklich = argumente.includes("--los");
  const grenze = Number(schalter("grenze", "500"));

  let adressen = await sitemapAdressen(grenze);

  if (nurFehlende) {
    if (!alsJson) console.log(`\nPrüfe, welche Bing noch nie geholt hat …`);
    const geprueft = await Promise.all(
      adressen.map(async (a) => ({ a, bekannt: Boolean(geholtAm(await urlAuskunft(a).catch(() => null))) }))
    );
    adressen = geprueft.filter((g) => !g.bekannt).map((g) => g.a);
  }

  const quote = await kontingent();

  if (adressen.length === 0) {
    console.log("\nNichts einzureichen — Bing kennt bereits jede Adresse.\n");
    return;
  }

  if (!wirklich) {
    console.log(`\n${adressen.length} Adressen wären einzureichen:\n`);
    for (const a of adressen) console.log(`  ${pfad(a)}`);
    console.log(
      `\nKontingent heute: ${zahl(quote.DailyQuota)}.\n` +
        `Ausführen mit --los:  npm run bing -- einreichen${nurFehlende ? " --fehlend" : ""} --los\n`
    );
    return;
  }

  if (adressen.length > quote.DailyQuota) {
    console.error(`\nMehr Adressen (${adressen.length}) als Kontingent (${quote.DailyQuota}).\n`);
    process.exitCode = 1;
    return;
  }

  /*
   * Ein Stapelaufruf, nicht 30 einzelne. Bing bestätigt nicht je Adresse
   * (`{"d":null}` ist die ganze Erfolgsantwort), eine Schleife brächte also
   * keine feinere Auskunft — nur dreißigmal mehr Anfragen.
   */
  try {
    await urlsEinreichen(adressen);
  } catch (ursache) {
    console.error(`\n${ursache instanceof Error ? ursache.message : String(ursache)}\n`);
    process.exitCode = 1;
    return;
  }

  if (alsJson) {
    console.log(JSON.stringify({ eingereicht: adressen.length, adressen }, null, 2));
    return;
  }

  console.log(`\n${adressen.length} Adressen eingereicht.`);
  console.log(
    "\nBing bestätigt nicht je Adresse — ausgeblieben ist nur, was hier als Fehler\n" +
      "stünde. Ob es gewirkt hat, zeigt InIndex in ein paar Tagen:\n" +
      "  npm run bing -- status\n"
  );
}

// ---------------------------------------------------------------------------

const BEFEHLE: Record<string, () => Promise<void>> = {
  zugang: befehlZugang,
  status: befehlStatus,
  leistung: befehlLeistung,
  crawl: befehlCrawl,
  seite: befehlSeite,
  abdeckung: befehlAbdeckung,
  keyword: befehlKeyword,
  sitemaps: befehlSitemaps,
  einreichen: befehlEinreichen,
};

async function main(): Promise<void> {
  const auszufuehren = BEFEHLE[befehl ?? ""];

  if (!auszufuehren) {
    console.log(
      "\nBing Webmaster Tools\n\n" +
        "  npm run bing -- zugang              Selbsttest: Was sieht der Schlüssel?\n" +
        "  npm run bing -- status              Index, Crawl, Sitemaps, Kontingent\n" +
        "  npm run bing -- leistung            Klicks, Impressionen, Suchanfragen\n" +
        "  npm run bing -- crawl               Crawl-Reihe und Beanstandungen\n" +
        "  npm run bing -- abdeckung           Jede Sitemap-Adresse nachschlagen\n" +
        "    --grenze 50                       weniger Adressen\n" +
        "  npm run bing -- seite <adresse>     Was Bing über eine Adresse weiß\n" +
        '  npm run bing -- keyword "<begriff>" Suchvolumen bei Bing — kostenlos\n' +
        "    --land de --sprache de-DE         andere Region (land klein!)\n" +
        "  npm run bing -- sitemaps            Stand der Sitemaps\n" +
        "    --einreichen <adresse>            Sitemap einreichen\n" +
        "  npm run bing -- einreichen          Zeigt, was eingereicht würde\n" +
        "    --fehlend                         nur nie geholte Adressen\n" +
        "    --los                             wirklich einreichen\n\n" +
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
