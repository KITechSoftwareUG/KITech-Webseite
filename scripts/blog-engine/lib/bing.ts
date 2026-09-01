/**
 * Bing Webmaster Tools API — die zweite Suchmaschine, und die einzige, bei der
 * sich eine Adresse aktiv anstoßen lässt.
 *
 * **Warum das hier steht, obwohl Bing klein ist.** Zwei Gründe, die nichts mit
 * Marktanteil zu tun haben. Erstens speist Bings Index Copilot und ChatGPTs
 * Websuche — wer dort nicht steht, fehlt in Antworten, die nie als Suchtreffer
 * erscheinen. Zweitens misst `GetKeyword` echtes Suchvolumen **kostenlos**,
 * während DataForSEO je Abfrage bezahlt wird und das Guthaben knapp ist.
 *
 * Doku: https://learn.microsoft.com/en-us/dotnet/api/microsoft.bing.webmaster.api.interfaces
 *
 * ---
 *
 * ## Vier Eigenheiten, die Aufrufe scheitern lassen
 *
 * **1. `country` muss klein geschrieben sein.** `country=de` liefert Daten,
 * `country=DE` antwortet `Specified argument was out of the range of valid
 * values`. Der Fehler kommt als **HTTP 400**, nicht als 403 — er sieht deshalb
 * nach einem kaputten Schlüssel aus und ist keiner.
 *
 * **2. Datumsangaben als `JJJJ-MM-TT`.** Das aus Microsofts eigener Doku
 * bekannte `/Date(1754006400000)/` wird im Query-String **nicht** erkannt
 * (`String was not recognized as a valid DateTime`). Gelesen wird es dagegen
 * genau in dieser Form — siehe `bingDatum()`.
 *
 * **3. Lesen ist GET, Schreiben ist POST — und die Verwechslung sieht wie ein
 * fehlender Endpunkt aus.** `GetKeyword` als POST liefert eine HTML-Fehlerseite;
 * `SubmitUrl` als GET ebenso. Wer daraus schließt, `SubmitUrl` gebe es in der
 * JSON-Schnittstelle nicht, irrt: Es fehlt nur der Rumpf. Schreibende Aufrufe
 * tragen ihre Parameter als JSON im Body, `apikey` bleibt in der Adresse, und
 * die Erfolgsantwort ist `{"d":null}` — kein Bestätigungsobjekt.
 *
 * **4. Endpunkte, die es nicht gibt, antworten mit HTML statt mit JSON.**
 * `GetGeoRegionSettings`, `GetSiteMoves` und `GetPagePreviewBlocks` gehören
 * dazu: In der .NET-Bibliothek stehen sie, über die JSON-Schnittstelle sind sie
 * nicht erreichbar. `anfrage()` übersetzt das, statt den HTML-Text als kaputtes
 * JSON durchzureichen.
 *
 * ---
 *
 * ⚠️ **Der Schlüssel darf mehr als lesen.** Mit ihm lassen sich 10.000 Adressen
 * am Tag einreichen und Sitemaps **entfernen**. Er ist ein echtes Geheimnis und
 * gehört nach `.env` — anders als `BING_SITE_VERIFICATION` in
 * `src/config/suchkonsolen.ts`, das ohnehin im HTML jeder Seite steht.
 */

/** Basis aller Aufrufe. Die JSON-Variante; `/pox/` wäre die XML-Variante. */
const BASIS = "https://ssl.bing.com/webmaster/api.svc/json";

/**
 * Die Site, auf die sich alles bezieht — zeichengenau so, wie sie in den
 * Webmaster Tools steht, **mit** Schrägstrich am Ende. Überschreibbar, damit
 * sich der Zugang gegen eine andere Site prüfen lässt, ohne Code zu ändern.
 */
export function site(): string {
  return process.env.BING_SITE_URL?.trim() || "https://kitech-software.de/";
}

export class BingFehler extends Error {
  constructor(nachricht: string, public readonly status?: number) {
    super(nachricht);
    this.name = "BingFehler";
  }
}

/**
 * Holt den Schlüssel und sagt im Fehlerfall, wo er herkommt. Ohne diesen Satz
 * landet man in der Rechteverwaltung statt in `.env`.
 */
export function schluessel(): string {
  const wert = process.env.BING_WEBMASTER_API_KEY?.trim();
  if (!wert) {
    throw new BingFehler(
      "BING_WEBMASTER_API_KEY fehlt.\n" +
        "    Zu holen unter https://www.bing.com/webmasters → Einstellungen → API-Zugriff.\n" +
        "    Eintragen in .env (nicht ins Repo — der Schlüssel darf einreichen und löschen)."
    );
  }
  return wert;
}

/**
 * Wandelt Microsofts `/Date(1788232702000)/` in ein `Date`.
 *
 * Die Zahl ist bereits Epoch-Millisekunden in UTC. Der bei manchen Feldern
 * angehängte Versatz (`-0700`) ist nur ein Anzeigehinweis und wird bewusst
 * verworfen — wer ihn aufaddiert, verschiebt das Datum um sieben Stunden.
 */
export function bingDatum(wert: string | null | undefined): Date | null {
  if (!wert) return null;
  const treffer = /\/Date\((-?\d+)/.exec(wert);
  if (!treffer) return null;
  const ms = Number(treffer[1]);
  /*
   * ⚠️ Bing kennt drei Schreibweisen für „nie", und keine davon ist null:
   *   `-62135568000000`  .NET `DateTime.MinValue`, Jahr 1 — so antwortet
   *                      `GetUrlInfo` für eine Adresse, die nie geholt wurde.
   *   `-11644473600000`  Jahr 1601 — so datiert `GetFeeds` eine Sitemap, die
   *                      Bing selbst gefunden statt bekommen hat.
   *   ein echtes Datum.
   *
   * Beide Sonderwerte sind negativ, und beide bedeuten dasselbe. Wer nur auf
   * das Vorhandensein des Feldes prüft, hält sie für Daten — siehe `geholtAm()`.
   */
  if (!Number.isFinite(ms) || ms < 0) return null;
  return new Date(ms);
}

/**
 * Wann Bing eine Adresse zuletzt geholt hat — oder `null` für „noch nie".
 *
 * ⚠️ **Die Prüfung gehört hierher, nicht an die Aufrufstelle.** `LastCrawledDate`
 * ist bei einer nie geholten Adresse **nicht leer**, sondern trägt das Jahr 1.
 * Ein `if (auskunft.LastCrawledDate)` ist damit immer wahr und zählt jede
 * unbekannte Seite als geholt — der Fehler fällt nur auf, weil in der Tabelle
 * ein Strich statt eines Datums steht.
 */
export function geholtAm(auskunft: UrlAuskunft | null | undefined): Date | null {
  return bingDatum(auskunft?.LastCrawledDate);
}

/** `JJJJ-MM-TT` — das einzige Datumsformat, das die API im Query-String frisst. */
export function alsTag(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** `JJJJ-MM-TT` für „vor n Tagen". */
export function tagVor(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return alsTag(d);
}

/**
 * Ruft einen Endpunkt auf und übersetzt Bings drei Arten, „nein" zu sagen.
 *
 * Der Schlüssel wird in Fehlermeldungen **nicht** ausgegeben: Die Adresse
 * enthält ihn, und eine Meldung landet schnell in einem Protokoll.
 */
async function anfrage<T>(
  endpunkt: string,
  parameter: Record<string, string> = {},
  nutzlast?: unknown
): Promise<T> {
  const adresse = new URL(`${BASIS}/${endpunkt}`);
  adresse.searchParams.set("apikey", schluessel());
  for (const [name, wert] of Object.entries(parameter)) adresse.searchParams.set(name, wert);

  let antwort: Response;
  try {
    antwort = await fetch(adresse, {
      signal: AbortSignal.timeout(30_000),
      ...(nutzlast === undefined
        ? {}
        : {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(nutzlast),
          }),
    });
  } catch (ursache) {
    throw new BingFehler(
      `${endpunkt}: keine Antwort (${ursache instanceof Error ? ursache.message : String(ursache)})`
    );
  }

  const rumpf = await antwort.text();

  /*
   * Fall 1: HTML statt JSON. Das heißt nicht „Fehler im Aufruf", sondern
   * „diesen Endpunkt gibt es über die JSON-Schnittstelle nicht" — eine
   * Unterscheidung, die man dem Rohtext nicht ansieht.
   */
  if (rumpf.startsWith("<") || rumpf.startsWith("﻿<")) {
    throw new BingFehler(
      `${endpunkt}: antwortet mit HTML statt JSON.\n` +
        `    Zwei Ursachen kommen infrage, und die Antwort unterscheidet sie nicht:\n` +
        `    → Falsche Methode. Lesen ist GET, Schreiben (Submit*) ist POST mit JSON-Rumpf.\n` +
        `    → Den Endpunkt gibt es in der JSON-Schnittstelle wirklich nicht,\n` +
        `      auch wenn er in der .NET-Bibliothek steht (GetGeoRegionSettings, GetSiteMoves).`,
      antwort.status
    );
  }

  let geparst: unknown;
  try {
    geparst = JSON.parse(rumpf);
  } catch {
    throw new BingFehler(`${endpunkt}: Antwort ist kein JSON (${rumpf.slice(0, 120)})`, antwort.status);
  }

  /* Fall 2: Bings eigener Fehlerrumpf. Kommt mit HTTP 400, nie mit 403. */
  const fehler = geparst as { ErrorCode?: number; Message?: string };
  if (typeof fehler?.ErrorCode === "number") {
    const hinweis = /range of valid values.*country/is.test(fehler.Message ?? "")
      ? "\n    → `country` muss klein geschrieben sein: `de`, nicht `DE`."
      : /valid DateTime/i.test(fehler.Message ?? "")
        ? "\n    → Datum als JJJJ-MM-TT übergeben, nicht als /Date(…)/."
        : "";
    throw new BingFehler(`${endpunkt}: ${fehler.Message ?? `ErrorCode ${fehler.ErrorCode}`}${hinweis}`, antwort.status);
  }

  /* Fall 3: echter HTTP-Fehler ohne verwertbaren Rumpf. */
  if (!antwort.ok) {
    const deutung =
      antwort.status === 401
        ? " — Schlüssel ungültig oder zurückgezogen"
        : antwort.status === 403
          ? " — Schlüssel gültig, aber diese Site gehört nicht dazu"
          : "";
    throw new BingFehler(`${endpunkt}: HTTP ${antwort.status}${deutung}`, antwort.status);
  }

  return (geparst as { d: T }).d;
}

// ---------------------------------------------------------------------------
// Lesen
// ---------------------------------------------------------------------------

export interface BingSite {
  Url: string;
  IsVerified: boolean;
  AuthenticationCode: string;
  DnsVerificationCode: string;
}

/** Alle Sites, die dieser Schlüssel sieht. Der Selbsttest des Zugangs. */
export function sites(): Promise<BingSite[]> {
  return anfrage<BingSite[]>("GetUserSites");
}

export interface VerkehrsZahl {
  Date: string;
  Clicks: number;
  Impressions: number;
}

/** Klicks und Impressionen je Tag. Bing liefert nur wenige Tage rückwirkend. */
export function verkehr(): Promise<VerkehrsZahl[]> {
  return anfrage<VerkehrsZahl[]>("GetRankAndTrafficStats", { siteUrl: site() });
}

export interface Suchanfrage {
  Query: string;
  Clicks: number;
  Impressions: number;
  AvgClickPosition: number;
  AvgImpressionPosition: number;
}

/** Suchanfragen, über die die Site gefunden wurde. */
export function suchanfragen(): Promise<Suchanfrage[]> {
  return anfrage<Suchanfrage[]>("GetQueryStats", { siteUrl: site() });
}

export interface SeitenZahl {
  Query: string;
  Clicks: number;
  Impressions: number;
  AvgClickPosition: number;
  AvgImpressionPosition: number;
}

/** Dieselben Zahlen je Seite. `Query` trägt hier die Adresse, nicht die Suche. */
export function seiten(): Promise<SeitenZahl[]> {
  return anfrage<SeitenZahl[]>("GetPageStats", { siteUrl: site() });
}

export interface CrawlZahl {
  Date: string;
  CrawledPages: number;
  InIndex: number;
  InLinks: number;
  CrawlErrors: number;
  Code2xx: number;
  Code301: number;
  Code302: number;
  Code4xx: number;
  Code5xx: number;
  BlockedByRobotsTxt: number;
  ConnectionTimeout: number;
  DnsFailures: number;
  AllOtherCodes: number;
  ContainsMalware: number;
}

/**
 * Crawl- und Indexzahlen je Tag. Die aussagekräftigste Reihe des ganzen
 * Dienstes: `InIndex` gegen die Zahl der Sitemap-Adressen gehalten sagt, wie
 * viel Bing tatsächlich behält.
 */
export function crawlZahlen(): Promise<CrawlZahl[]> {
  return anfrage<CrawlZahl[]>("GetCrawlStats", { siteUrl: site() });
}

export interface CrawlFehler {
  Url: string;
  HttpCode: number;
  InLinks: number;
  Category?: number;
}

/** Offene Crawl-Beanstandungen. Leer heißt: Bing hat nichts zu meckern. */
export function crawlFehler(): Promise<CrawlFehler[]> {
  return anfrage<CrawlFehler[]>("GetCrawlIssues", { siteUrl: site() });
}

export interface Feed {
  Url: string;
  Type: string;
  Status: string;
  UrlCount: number;
  LastCrawled: string;
  Submitted: string;
  Compressed: boolean;
  FileSize: number;
}

/** Eingereichte und selbst gefundene Sitemaps. */
export function feeds(): Promise<Feed[]> {
  return anfrage<Feed[]>("GetFeeds", { siteUrl: site() });
}

export interface UrlAuskunft {
  Url: string;
  IsPage: boolean;
  HttpStatus: number;
  DocumentSize: number;
  AnchorCount: number;
  TotalChildUrlCount: number;
  DiscoveryDate: string;
  LastCrawledDate: string;
}

/**
 * Was Bing über eine einzelne Adresse weiß. `LastCrawledDate` ist die
 * belastbare Antwort auf „kennt Bing die Seite schon?".
 */
export function urlAuskunft(url: string): Promise<UrlAuskunft | null> {
  return anfrage<UrlAuskunft | null>("GetUrlInfo", { siteUrl: site(), url });
}

export interface Kontingent {
  DailyQuota: number;
  MonthlyQuota: number;
}

/** Wie viele Adressen heute noch eingereicht werden dürfen. */
export function kontingent(): Promise<Kontingent> {
  return anfrage<Kontingent>("GetUrlSubmissionQuota", { siteUrl: site() });
}

export interface CrawlEinstellung {
  CrawlRate: number[];
  CrawlBoostAvailable: boolean;
  CrawlBoostEnabled: boolean;
}

/**
 * Die Crawl-Rate, 24 Werte — einer je Stunde, Skala 1 bis 10.
 *
 * ⚠️ Ein höherer Wert erlaubt Bing, häufiger anzuklopfen; er bewirkt nicht,
 * dass mehr Seiten in den Index kommen. Wer nichts findet, wovon der Crawler
 * ausgebremst wird, ändert hier nichts Sinnvolles.
 */
export function crawlEinstellungen(): Promise<CrawlEinstellung> {
  return anfrage<CrawlEinstellung>("GetCrawlSettings", { siteUrl: site() });
}

export interface LinkZahlen {
  TotalPages: number;
  Links: { Url: string; Count: number }[];
}

/** Eingehende Links, wie Bing sie zählt. */
export function linkZahlen(): Promise<LinkZahlen> {
  return anfrage<LinkZahlen>("GetLinkCounts", { siteUrl: site(), page: "0" });
}

/** Adressen, die in den Webmaster Tools von der Anzeige ausgenommen wurden. */
export function blockierteUrls(): Promise<unknown[]> {
  return anfrage<unknown[]>("GetBlockedUrls", { siteUrl: site() });
}

// ---------------------------------------------------------------------------
// Keyword-Daten — der kostenlose Teil
// ---------------------------------------------------------------------------

export interface KeywordZahl {
  Query: string | null;
  Impressions: number;
  BroadImpressions: number;
}

/**
 * Suchvolumen eines Begriffs bei Bing.
 *
 * ⚠️ `Query: null` mit `Impressions: 0` heißt **nicht** „Fehler", sondern
 * „unterhalb dessen, was Bing ausweist". Für deutsche B2B-Begriffe ist das der
 * Normalfall — die Zahl ist trotzdem eine Aussage.
 *
 * `Impressions` zählt den Begriff selbst, `BroadImpressions` zusätzlich seine
 * Varianten. Der Abstand zwischen beiden ist das eigentlich Interessante: viel
 * Broad bei wenig Exact heißt, die Nachfrage steckt in Abwandlungen.
 */
export function keyword(
  begriff: string,
  von = tagVor(60),
  bis = tagVor(2),
  land = "de",
  sprache = "de-DE"
): Promise<KeywordZahl> {
  return anfrage<KeywordZahl>("GetKeyword", {
    q: begriff,
    country: land,
    language: sprache,
    startDate: von,
    endDate: bis,
  });
}

/** Begriffe, die Bing im Umfeld des gesuchten sieht — die Themenfindung. */
export function verwandteKeywords(
  begriff: string,
  von = tagVor(60),
  bis = tagVor(2),
  land = "de",
  sprache = "de-DE"
): Promise<KeywordZahl[]> {
  return anfrage<KeywordZahl[]>("GetRelatedKeywords", {
    q: begriff,
    country: land,
    language: sprache,
    startDate: von,
    endDate: bis,
  });
}

// ---------------------------------------------------------------------------
// Schreiben
// ---------------------------------------------------------------------------

/**
 * Wie viele Adressen ein `SubmitUrlBatch` verträgt. Bing nennt 500; hier steht
 * bewusst weniger, weil eine abgewiesene Gruppe alle ihre Adressen mitreißt und
 * der Gewinn zwischen 100 und 500 gleich null ist.
 */
export const STAPEL_MAX = 100;

/**
 * Reicht Adressen zur Prüfung ein.
 *
 * ⚠️ **Das ist kein Indexierungsbefehl.** Bing nimmt die Adressen in die
 * Warteschlange; ob und wann daraus ein Indexeintrag wird, entscheidet Bing.
 * Dieselbe Adresse mehrfach am Tag einzureichen beschleunigt nichts und
 * verbraucht Kontingent.
 *
 * **Warum trotzdem, obwohl IndexNow läuft.** `npm run blog:indexnow` meldet
 * jeden **neuen** Artikel, und das ist Bings bevorzugter Weg. Was IndexNow nie
 * gesehen hat, sind die Seiten, die vor seiner Einführung entstanden — für die
 * ist dies der Nachschub, einmalig.
 *
 * Die Erfolgsantwort ist `{"d":null}`: kein Objekt, keine Bestätigung je
 * Adresse. Ausgeblieben ist nur, was als Fehler geworfen wird.
 */
export async function urlsEinreichen(urls: string[]): Promise<void> {
  for (let i = 0; i < urls.length; i += STAPEL_MAX) {
    await anfrage("SubmitUrlBatch", {}, { siteUrl: site(), urlList: urls.slice(i, i + STAPEL_MAX) });
  }
}

/** Einzelne Adresse — derselbe Weg, nur ohne Stapel. */
export function urlEinreichen(url: string): Promise<unknown> {
  return anfrage("SubmitUrl", {}, { siteUrl: site(), url });
}

/**
 * Reicht eine Sitemap ein.
 *
 * Doppelt einreichen schadet nicht — Bing führt jede Adresse einmal und
 * aktualisiert nur den Zeitstempel.
 */
export function feedEinreichen(feedUrl: string): Promise<unknown> {
  return anfrage("SubmitFeed", {}, { siteUrl: site(), feedUrl });
}
