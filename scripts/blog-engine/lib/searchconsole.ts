/**
 * Google Search Console API — die eigenen Zahlen aus Googles Sicht.
 *
 * **Warum das hier steht.** Bis jetzt kannte die Blog-Engine nur DataForSEO:
 * Schätzwerte über den Markt, pro Aufruf bezahlt, Guthaben knapp. Die Search
 * Console liefert etwas anderes und Besseres — **gemessene Klicks,
 * Impressionen und Positionen der eigenen Seiten**, kostenlos und ohne
 * Tageslimit. Für die Frage „rankt der Artikel von letzter Woche?" ist das die
 * einzige Quelle, die nicht rät.
 *
 * Doku: https://developers.google.com/webmaster-tools/v1/api_reference_index
 *
 * ---
 *
 * ## Vier Eigenheiten, die Auswertungen falsch machen
 *
 * **1. Die Summe der Suchanfragen ist kleiner als die Wahrheit.** Google lässt
 * seltene Suchanfragen aus dem Bericht weg, um Personen zu schützen. Wer die
 * Klicks aller `query`-Zeilen addiert, erhält weniger als die Gesamtzahl
 * derselben Property — und das ist kein Fehler, sondern Absicht. Wer eine
 * Gesamtsumme braucht, fragt **ohne** Dimension ab.
 *
 * **2. Die Position ist bereits ein Durchschnitt.** Ein Mittelwert über die
 * `position`-Spalte mehrerer Zeilen mittelt Durchschnitte und gewichtet dabei
 * eine Suchanfrage mit drei Impressionen so stark wie eine mit dreitausend.
 * Wer eine Gesamtposition will, gewichtet mit `impressions`.
 *
 * **3. Die Daten sind zwei bis drei Tage alt.** `dataState: "FINAL"` (Standard
 * hier) liefert nur abgeschlossene Tage. `"ALL"` liefert zusätzlich die
 * frischen, **unvollständigen** Tage — brauchbar für „läuft überhaupt etwas",
 * unbrauchbar für jeden Vergleich, weil die Zahlen nachträglich steigen.
 *
 * **4. Die Historie endet nach 16 Monaten.** Ältere Zeiträume liefern keine
 * Fehlermeldung, sondern leere Ergebnisse — der Unterschied zu „keine Daten"
 * ist von außen nicht zu sehen.
 *
 * ---
 *
 * ⚠️ **Die Property-Kennung muss zeichengenau stimmen.** Für eine
 * URL-Präfix-Property ist das `https://kitech-software.de/` — **mit** Schrägstrich
 * am Ende. Ohne ihn antwortet die API mit 403 „User does not have sufficient
 * permission for site" und meint damit nicht die Berechtigung, sondern dass es
 * diese Property nicht gibt. Der Fehler schickt jeden zuerst in die
 * Rechteverwaltung. (Eine Domain-Property hieße `sc-domain:kitech-software.de`
 * — die gibt es hier nicht, sie verlangt DNS-Zugang.)
 *
 * ⚠️ **Ein Dienstkonto ist ein eigener Nutzer.** Der Zugang hängt nicht am
 * Google-Konto von Ayham: Die Adresse des Dienstkontos muss in der Search
 * Console unter *Einstellungen → Nutzer und Berechtigungen* eingetragen sein.
 * Das ist der Schritt, den man vergisst, und er äußert sich als 403.
 */

import { zugangstoken } from "./google-auth.js";

/** Nur Lesen — reicht für Zahlen, Sitemap-Liste und URL-Prüfung. */
export const SCOPE_LESEN = "https://www.googleapis.com/auth/webmasters.readonly";

/** Schreiben — nötig, um eine Sitemap einzureichen oder zu löschen. */
export const SCOPE_SCHREIBEN = "https://www.googleapis.com/auth/webmasters";

const BASIS = "https://searchconsole.googleapis.com";

/**
 * Googles Zeilenlimit je Anfrage. Mehr liefert die API nicht aus, auch wenn
 * man mehr anfordert — größere Mengen holt `leistung()` seitenweise.
 */
const ZEILEN_MAX = 25000;

export class SearchConsoleFehler extends Error {
  constructor(nachricht: string, public readonly status?: number) {
    super(nachricht);
    this.name = "SearchConsoleFehler";
  }
}

/**
 * Die Property, auf die sich alles bezieht. Überschreibbar über
 * `SEARCH_CONSOLE_PROPERTY`, damit sich der Zugang auch gegen eine andere
 * Property testen lässt, ohne Code zu ändern.
 */
export function property(): string {
  return process.env.SEARCH_CONSOLE_PROPERTY?.trim() || "https://kitech-software.de/";
}

/**
 * Ruft die API auf und übersetzt Googles Fehler in etwas Lesbares.
 *
 * Die drei Statuscodes, die hier wirklich vorkommen, haben Bedeutungen, die man
 * ihnen nicht ansieht — deshalb stehen sie im Klartext in der Meldung.
 */
async function ruf<T>(
  pfad: string,
  optionen: { methode?: string; rumpf?: unknown; scope?: string } = {}
): Promise<T> {
  const token = await zugangstoken([optionen.scope ?? SCOPE_LESEN]);

  const antwort = await fetch(`${BASIS}${pfad}`, {
    method: optionen.methode ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(optionen.rumpf ? { "Content-Type": "application/json" } : {}),
    },
    ...(optionen.rumpf ? { body: JSON.stringify(optionen.rumpf) } : {}),
  });

  if (!antwort.ok) {
    const text = await antwort.text();
    let hinweis = "";
    if (antwort.status === 403) {
      hinweis =
        `\n\nDie zwei üblichen Ursachen für 403:\n` +
        `  1. Das Dienstkonto steht nicht als Nutzer der Property in der Search\n` +
        `     Console (Einstellungen → Nutzer und Berechtigungen → Nutzer hinzufügen).\n` +
        `  2. Die Property-Kennung stimmt nicht zeichengenau. Erwartet:\n` +
        `     "${property()}" — mit Schrägstrich am Ende.\n` +
        `  Welche Properties das Dienstkonto sieht, zeigt: npm run gsc -- properties`;
    } else if (antwort.status === 401) {
      hinweis = "\n\nDas Zugangstoken wurde abgelehnt — Schlüsseldatei und Systemuhr prüfen.";
    } else if (antwort.status === 429) {
      hinweis =
        "\n\nKontingent erschöpft. Die URL-Prüfung ist auf 2000 Adressen je Tag " +
        "und Property begrenzt; das Kontingent setzt sich nach Mitternacht " +
        "pazifischer Zeit zurück.";
    }
    throw new SearchConsoleFehler(
      `Search Console antwortete mit HTTP ${antwort.status}: ${text}${hinweis}`,
      antwort.status
    );
  }

  /*
   * ⚠️ Nicht `antwort.json()`. Die schreibenden Aufrufe — `sitemaps.submit`
   * und `sitemaps.delete` — antworten mit einem **leeren Rumpf**. `json()`
   * wirft darauf „Unexpected end of JSON input", und zwar *nachdem* Google die
   * Änderung längst übernommen hat: Der Aufruf sieht fehlgeschlagen aus und
   * war erfolgreich. Am 01.09.2026 beim Einreichen des RSS-Feeds passiert.
   */
  const text = await antwort.text();
  return (text ? JSON.parse(text) : {}) as T;
}

/** Die Property gehört in den Pfad — und muss dafür kodiert werden. */
function pfadProperty(): string {
  return encodeURIComponent(property());
}

// ---------------------------------------------------------------------------
// Leistungsdaten
// ---------------------------------------------------------------------------

export type Dimension = "query" | "page" | "country" | "device" | "date" | "searchAppearance";

export interface Zeile {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface LeistungAbfrage {
  /** Format `JJJJ-MM-TT`, in der Zeitzone der Property (Pacific Time). */
  von: string;
  bis: string;
  /** Leer lassen für die Gesamtsumme — siehe Eigenheit 1 im Kopf. */
  dimensionen?: Dimension[];
  /** Höchstzahl Zeilen insgesamt; wird nötigenfalls seitenweise geholt. */
  grenze?: number;
  /** `FINAL` = nur abgeschlossene Tage (Standard), `ALL` = inklusive frischer, unvollständiger. */
  datenstand?: "FINAL" | "ALL";
  /** Auf Zeilen einschränken, etwa nur Adressen unter `/gratis-wissen/`. */
  filter?: { dimension: Dimension; operator?: string; ausdruck: string }[];
  typ?: "WEB" | "IMAGE" | "VIDEO" | "NEWS" | "DISCOVER" | "GOOGLE_NEWS";
}

/**
 * Holt Leistungsdaten und blättert selbstständig weiter, bis die gewünschte
 * Menge beisammen ist oder Google keine Zeilen mehr liefert.
 */
export async function leistung(abfrage: LeistungAbfrage): Promise<Zeile[]> {
  const grenze = abfrage.grenze ?? 1000;
  const gesammelt: Zeile[] = [];

  while (gesammelt.length < grenze) {
    const stapel = Math.min(ZEILEN_MAX, grenze - gesammelt.length);

    const antwort = await ruf<{ rows?: Zeile[] }>(
      `/webmasters/v3/sites/${pfadProperty()}/searchAnalytics/query`,
      {
        methode: "POST",
        rumpf: {
          startDate: abfrage.von,
          endDate: abfrage.bis,
          dimensions: abfrage.dimensionen ?? [],
          rowLimit: stapel,
          startRow: gesammelt.length,
          dataState: abfrage.datenstand ?? "FINAL",
          type: abfrage.typ ?? "WEB",
          ...(abfrage.filter?.length
            ? {
                dimensionFilterGroups: [
                  {
                    filters: abfrage.filter.map((f) => ({
                      dimension: f.dimension.toUpperCase(),
                      operator: f.operator ?? "EQUALS",
                      expression: f.ausdruck,
                    })),
                  },
                ],
              }
            : {}),
        },
      }
    );

    const zeilen = antwort.rows ?? [];
    gesammelt.push(...zeilen);

    /* Weniger als angefordert heißt: Das war die letzte Seite. */
    if (zeilen.length < stapel) break;
  }

  return gesammelt;
}

// ---------------------------------------------------------------------------
// Sitemaps
// ---------------------------------------------------------------------------

export interface SitemapStand {
  path: string;
  lastSubmitted?: string;
  lastDownloaded?: string;
  isPending?: boolean;
  warnings?: string;
  errors?: string;
  /**
   * ⚠️ `indexed` ist tot. Google befüllt das Feld seit Jahren nicht mehr und
   * liefert konstant `0` — auch für Properties, deren Seiten nachweislich im
   * Index stehen. Nachgemessen am 01.09.2026: Die Sitemap meldete „0 von 38
   * indexiert", während die URL-Prüfung derselben Property für die Startseite
   * „Gesendet und indexiert" zurückgab und Google 86 Impressionen auswies.
   *
   * Wer die Zahl ausgibt, produziert einen Fehlalarm. Wer wissen will, was im
   * Index steht, nimmt `pruefeUrl()` oder den Bericht „Seiten" in der
   * Oberfläche.
   */
  contents?: { type: string; submitted: string; indexed?: string }[];
}

export async function sitemaps(): Promise<SitemapStand[]> {
  const antwort = await ruf<{ sitemap?: SitemapStand[] }>(
    `/webmasters/v3/sites/${pfadProperty()}/sitemaps`
  );
  return antwort.sitemap ?? [];
}

/**
 * Reicht eine Sitemap ein.
 *
 * ⚠️ Das ist **keine** Aufforderung zum Crawlen einzelner Seiten und ersetzt
 * nichts. Google nimmt die Adresse entgegen und liest sie, wann es will. Der
 * alte, unauthentifizierte Sitemap-Ping ist seit 2023 abgeschaltet; das hier
 * ist der verbliebene offizielle Weg.
 */
export async function sitemapEinreichen(adresse: string): Promise<void> {
  await ruf<unknown>(
    `/webmasters/v3/sites/${pfadProperty()}/sitemaps/${encodeURIComponent(adresse)}`,
    { methode: "PUT", scope: SCOPE_SCHREIBEN }
  );
}

// ---------------------------------------------------------------------------
// URL-Prüfung
// ---------------------------------------------------------------------------

export interface UrlBefund {
  verdict?: string;
  coverageState?: string;
  robotsTxtState?: string;
  indexingState?: string;
  lastCrawlTime?: string;
  pageFetchState?: string;
  googleCanonical?: string;
  userCanonical?: string;
  sitemap?: string[];
  referringUrls?: string[];
  crawledAs?: string;
}

/**
 * Fragt Googles Index-Status einer einzelnen Adresse ab — dasselbe, was die
 * „URL-Prüfung" in der Oberfläche zeigt.
 *
 * ⚠️ **2000 Adressen je Tag und Property, 600 je Minute.** Das ist keine
 * Schleife über alle Artikel, sondern ein Werkzeug für Einzelfälle: „Warum ist
 * dieser Artikel nach vier Tagen nicht drin?"
 *
 * Der aufschlussreichste Wert ist `googleCanonical`: Weicht er von der
 * geprüften Adresse ab, hat Google eine andere Seite als maßgeblich gewählt —
 * die häufigste stille Ursache dafür, dass eine Seite nicht erscheint.
 */
export async function pruefeUrl(adresse: string): Promise<UrlBefund> {
  const antwort = await ruf<{ inspectionResult?: { indexStatusResult?: UrlBefund } }>(
    `/v1/urlInspection/index:inspect`,
    {
      methode: "POST",
      rumpf: { inspectionUrl: adresse, siteUrl: property(), languageCode: "de" },
    }
  );
  return antwort.inspectionResult?.indexStatusResult ?? {};
}

// ---------------------------------------------------------------------------
// Selbsttest
// ---------------------------------------------------------------------------

/**
 * Alle Properties, die das Dienstkonto sehen darf. Der erste Aufruf beim
 * Einrichten: Eine leere Liste heißt, der Schlüssel ist in Ordnung, aber das
 * Dienstkonto wurde in der Search Console noch nicht als Nutzer eingetragen.
 */
export async function properties(): Promise<{ siteUrl: string; permissionLevel: string }[]> {
  const antwort = await ruf<{ siteEntry?: { siteUrl: string; permissionLevel: string }[] }>(
    `/webmasters/v3/sites`
  );
  return antwort.siteEntry ?? [];
}
