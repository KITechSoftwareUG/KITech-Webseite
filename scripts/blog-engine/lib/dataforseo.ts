/**
 * DataForSEO API v3 — der einzige Zugang der Blog-Engine zu Keyword-, SERP- und
 * Backlink-Daten.
 *
 * **Warum ein eigener Client und kein SDK.** DataForSEO bietet generierte
 * Clients an, die den kompletten Endpunktbaum abbilden. Gebraucht werden hier
 * dreizehn Aufrufe. Ein eigener Client kostet weniger als die Abhängigkeit und
 * erlaubt das, worauf es bei dieser API wirklich ankommt: die Kostenbremse.
 *
 * **Diese API kostet pro Aufruf echtes Geld** — es gibt kein Freikontingent und
 * keine Warnung vor dem Abbuchen. Deshalb hat jede Antwort ein `cost`-Feld, das
 * hier mitgeschrieben wird, und ein hartes Tageslimit
 * (`DATAFORSEO_TAGESLIMIT_USD`, Standard 5 $), das die nächste Anfrage abbricht.
 * Das ist eine Bremse, keine Empfehlung: eine Schleife über 2000 Keywords mit
 * `depth: 100` ist in einer Minute geschrieben und in derselben Minute teuer.
 * Wer entwickelt, setzt `DATAFORSEO_SANDBOX=1` — die Sandbox liefert
 * Dummy-Daten, kostet nichts und hat dieselbe Antwortstruktur.
 *
 * **Alles hier ist die Live-Methode.** Das hat drei Konsequenzen, die man
 * kennen muss:
 *  1. Ein POST-Aufruf darf genau **einen** Task tragen. Die dokumentierten
 *     100 Tasks pro Request gelten nur für `task_post` (Queue).
 *  2. Live-Ergebnisse werden **nicht gespeichert**. Die 30 Tage Aufbewahrung
 *     gelten für Queue-Tasks; wer live abruft, hat keine zweite Chance und muss
 *     die Antwort selbst wegschreiben.
 *  3. Der Server bricht Live-Tasks nach 120 Sekunden mit `50401` ab. Der
 *     Client-Timeout liegt bewusst knapp darüber.
 *
 * **Fallen, die Geld kosten** (aus der Preisdoku, nicht aus Erfahrung):
 *  - `depth` ist **linear** bepreist, seit Google `num=100` abgeschafft hat.
 *    `depth: 100` kostet das Zehnfache von `depth: 10` — keine Staffel, kein
 *    Rabatt. Alter Beispielcode mit `depth: 100` ist eine Zehnfachrechnung.
 *  - Suchoperatoren (`site:`, `filetype:`, `inurl:` …) **verfünffachen** den
 *    SERP-Preis, je verwendetem Operator. `serpAnalyse` warnt deshalb.
 *  - `include_clickstream_data: true` **verdoppelt** den Labs-Preis. Steht
 *    hier überall fest auf `false`.
 *
 * **Für die nächste Person, die hier etwas ergänzt:** `keywords_for_site` hat
 * `target_type` mit dem Default `"page"`, nicht `"site"`. Wer eine Domain
 * übergibt und das Feld vergisst, bekommt die Keywords einer einzelnen Seite
 * und merkt es an den Daten nicht. Und die Backlinks API kennt **nur** Live —
 * eine Queue-Variante zu suchen ist verlorene Zeit.
 *
 * Doku: https://docs.dataforseo.com/v3/ · Fehlercodes:
 * https://docs.dataforseo.com/v3/appendix/errors/
 */

// ---------------------------------------------------------------------------
// Deutschland-Defaults
// ---------------------------------------------------------------------------

/**
 * Google-Ads-Criteria-ID für Deutschland. Über SERP, Keywords Data und Labs
 * hinweg dieselbe Zahl — die APIs teilen sich den Standortbaum.
 */
export const STANDORT_DEUTSCHLAND = 2276;

/** ISO-Sprachcode für die Suchsprache. */
export const SPRACHE_DEUTSCH = "de";

/**
 * Die Google-Länderdomain. Ohne sie befragt die SERP-API `google.com` mit
 * deutschem Standort — das liefert andere Ergebnisse als das, was ein Besucher
 * aus Hannover sieht.
 */
export const SE_DOMAIN_DEUTSCHLAND = "google.de";

/**
 * `location_name`/`language_name` wären die Alternative zu den Codes — aber
 * **englisch** ("Germany", "German") und nicht mischbar mit den Codes. Hier
 * stehen sie nur, damit niemand "Deutschland" ausprobiert und rätselt.
 */
export const STANDORT_NAME_DEUTSCHLAND = "Germany";
export const SPRACHE_NAME_DEUTSCH = "German";

// ---------------------------------------------------------------------------
// Statuscodes und Fehler
// ---------------------------------------------------------------------------

/**
 * Die Statuscodes, auf die dieser Client reagiert.
 *
 * ⚠️ Die im Netz kursierende Tabelle ist an mehreren Stellen falsch — vor allem
 * beim Rate Limit. `40006` ist **nicht** das Rate Limit, sondern "mehr als 100
 * Tasks in einem POST". Wer darauf wiederholt, retryt einen zu großen Batch
 * endlos und läuft beim echten Rate Limit (`40202`) ungebremst weiter.
 */
export const STATUS = {
  /** Alles in Ordnung. */
  OK: 20000,
  /** Task angelegt (nur Queue-Methode, hier nie). */
  TASK_ANGELEGT: 20100,
  /** Mehr als 100 Tasks in einem POST — Batch verkleinern, nicht wiederholen. */
  ZU_VIELE_TASKS: 40006,
  /** Auth fehlgeschlagen: falscher API-Login oder falsches API-Passwort. */
  AUTH_FEHLGESCHLAGEN: 40100,
  /** Account nicht verifiziert — blockiert schon den allerersten Aufruf. */
  ACCOUNT_UNVERIFIZIERT: 40104,
  /** Guthaben aufgebraucht. */
  GUTHABEN_LEER: 40200,
  /** Rate Limit pro Minute überschritten (2000/min, Google Ads 12/min). */
  RATE_LIMIT: 40202,
  /** Tages-Kostenlimit des Accounts erreicht (im Dashboard gesetzt). */
  TAGESLIMIT_ERREICHT: 40203,
  /** IP nicht in der Whitelist des Accounts. */
  IP_NICHT_ERLAUBT: 40207,
  /** Zu viele gleichzeitige Anfragen (max. 30). */
  ZU_VIELE_PARALLEL: 40209,
  /** Guthaben zu niedrig für diesen Task. */
  GUTHABEN_ZU_NIEDRIG: 40210,
  /** Task nicht gefunden (nicht 40601 — das heißt "empfangen, noch nicht eingereiht"). */
  TASK_NICHT_GEFUNDEN: 40401,
  /** Ungültiges Feld im POST-Array. */
  UNGUELTIGES_FELD: 40501,
  /** Interner Serverfehler. */
  SERVERFEHLER: 50000,
  /** Live-Task hat die 120-Sekunden-Grenze gerissen. */
  LIVE_TIMEOUT: 50401,
} as const;

/**
 * Genau die Codes, bei denen ein zweiter Versuch Sinn ergibt: das Problem liegt
 * an der Taktung, nicht an der Anfrage. Alles andere — falsches Feld, leeres
 * Guthaben, kaputte Credentials — wird durch Wiederholen nur langsamer.
 */
const WIEDERHOLBARE_CODES: ReadonlySet<number> = new Set([
  STATUS.RATE_LIMIT,
  STATUS.ZU_VIELE_PARALLEL,
  STATUS.SERVERFEHLER,
  STATUS.LIVE_TIMEOUT,
]);

/** Auf welcher Ebene der Fehler entstanden ist — bestimmt die Diagnose. */
export type Fehlerebene = "netzwerk" | "http" | "umschlag" | "task" | "konfiguration" | "budget";

/**
 * Ein Fehler aus dem DataForSEO-Weg, mit der Information, die man zur Diagnose
 * wirklich braucht: welche Ebene, welcher Code, welcher Endpunkt.
 */
export class DataForSeoFehler extends Error {
  readonly ebene: Fehlerebene;
  readonly statusCode: number | null;
  readonly endpunkt: string | null;
  readonly wiederholbar: boolean;

  constructor(
    nachricht: string,
    optionen: {
      ebene: Fehlerebene;
      statusCode?: number | null;
      endpunkt?: string | null;
      wiederholbar?: boolean;
    },
  ) {
    super(nachricht);
    this.name = "DataForSeoFehler";
    this.ebene = optionen.ebene;
    this.statusCode = optionen.statusCode ?? null;
    this.endpunkt = optionen.endpunkt ?? null;
    this.wiederholbar = optionen.wiederholbar ?? false;
  }
}

// ---------------------------------------------------------------------------
// Zugangsdaten
// ---------------------------------------------------------------------------

const PRODUKTION_BASIS = "https://api.dataforseo.com/v3";
const SANDBOX_BASIS = "https://sandbox.dataforseo.com/v3";

/**
 * Ob die Sandbox angesprochen wird. Sie ist kostenlos, liefert Dummy-Daten und
 * hat dieselbe Struktur wie die Produktion — der einzige ehrliche Weg, eine
 * Auswertung zu entwickeln, ohne bei jedem Testlauf zu zahlen.
 */
export const istSandbox = (): boolean => process.env.DATAFORSEO_SANDBOX === "1";

/** Die Basis-URL, die dieser Lauf tatsächlich anspricht. */
export const basisUrl = (): string => (istSandbox() ? SANDBOX_BASIS : PRODUKTION_BASIS);

/**
 * Baut den Basic-Auth-Header.
 *
 * Fehlen die Variablen, bricht der Client hier ab — vor dem ersten Netzwerkweg,
 * mit dem Hinweis auf `.env.example`. Die Alternative wäre ein 401 aus der API,
 * der nach falschen Zugangsdaten aussieht statt nach fehlenden.
 *
 * Bewusst **nicht** beim Import geprüft, sondern beim ersten Aufruf: sonst
 * könnte niemand dieses Modul importieren, um nur `getAusgaben()` zu lesen oder
 * eine Typdefinition zu verwenden.
 *
 * ⚠️ Gemeint sind API-Login und API-Passwort aus dem Dashboard unter
 * "API Access" — **nicht** die Anmeldedaten des Benutzerkontos.
 */
function autorisierung(): string {
  const login = process.env.DATAFORSEO_LOGIN;
  const passwort = process.env.DATAFORSEO_PASSWORD;

  if (!login || !passwort) {
    const fehlend = [
      !login ? "DATAFORSEO_LOGIN" : null,
      !passwort ? "DATAFORSEO_PASSWORD" : null,
    ]
      .filter(Boolean)
      .join(" und ");

    throw new DataForSeoFehler(
      `DataForSEO-Zugangsdaten fehlen: ${fehlend} ist nicht gesetzt. ` +
        "Eintragen in die lokale .env (Vorlage: .env.example), in Coolify als " +
        "Runtime-Variable. Es sind API-Login und API-Passwort aus dem " +
        "DataForSEO-Dashboard unter \"API Access\", nicht die Anmeldedaten des " +
        "Kontos. Zum Entwickeln ohne Kosten zusätzlich DATAFORSEO_SANDBOX=1 setzen.",
      { ebene: "konfiguration" },
    );
  }

  return `Basic ${Buffer.from(`${login}:${passwort}`, "utf8").toString("base64")}`;
}

/**
 * Prüft die Zugangsdaten, ohne eine Anfrage zu stellen — für Skripte, die früh
 * abbrechen wollen, statt nach der halben Recherche über ein fehlendes Passwort
 * zu stolpern.
 */
export function pruefeZugangsdaten(): void {
  autorisierung();
}

// ---------------------------------------------------------------------------
// Kostenerfassung und Tageslimit
// ---------------------------------------------------------------------------

const TAGESLIMIT_STANDARD_USD = 5.0;

/**
 * Das Tageslimit aus der Umgebung, mit 5 $ als Rückfall.
 *
 * Unbrauchbare Werte (kein Zahl, negativ) werden nicht stillschweigend auf 0
 * gesetzt — eine 0 würde jeden Aufruf blockieren und wie ein kaputter Client
 * aussehen. Stattdessen greift der Standardwert.
 */
function tageslimitUsd(): number {
  const roh = process.env.DATAFORSEO_TAGESLIMIT_USD;
  if (!roh) return TAGESLIMIT_STANDARD_USD;
  const wert = Number.parseFloat(roh);
  if (!Number.isFinite(wert) || wert < 0) return TAGESLIMIT_STANDARD_USD;
  return wert;
}

const heutigerTag = (): string => new Date().toISOString().slice(0, 10);

const ausgaben = {
  tag: heutigerTag(),
  heuteUsd: 0,
  gesamtUsd: 0,
  anfragen: 0,
};

/** Was dieser Prozess bisher ausgegeben hat. */
export interface Ausgabenstand {
  /** Tag (ISO), auf den sich `heuteUsd` bezieht. */
  tag: string;
  /** Summe der `cost`-Felder seit Mitternacht UTC. */
  heuteUsd: number;
  /** Summe der `cost`-Felder seit Prozessstart, über Tagesgrenzen hinweg. */
  gesamtUsd: number;
  /** Zahl der beantworteten Anfragen. */
  anfragen: number;
  /** Das aktuell geltende Limit. */
  tageslimitUsd: number;
  /** Was heute noch übrig ist, nie negativ. */
  restUsd: number;
}

/**
 * Der laufende Kostenstand.
 *
 * Die Zahlen stammen aus dem `cost`-Feld der Antworten, nicht aus einer
 * Preistabelle — DataForSEO rechnet Zuschläge (Suchoperatoren, `depth`,
 * Clickstream) selbst ein, eine nachgebaute Kalkulation läge immer daneben.
 *
 * ⚠️ Der Zähler lebt **im Prozess**. Zehn Skriptläufe hintereinander zählen
 * zehnmal von vorn; das Limit bremst einen Durchlauf, nicht einen Tag. Wer eine
 * echte Tagesgrenze will, setzt sie zusätzlich im DataForSEO-Dashboard — die
 * quittiert die API dann mit `40203`.
 */
export function getAusgaben(): Ausgabenstand {
  tagesgrenzePruefen();
  const limit = tageslimitUsd();
  return {
    tag: ausgaben.tag,
    heuteUsd: Number(ausgaben.heuteUsd.toFixed(6)),
    gesamtUsd: Number(ausgaben.gesamtUsd.toFixed(6)),
    anfragen: ausgaben.anfragen,
    tageslimitUsd: limit,
    restUsd: Math.max(0, Number((limit - ausgaben.heuteUsd).toFixed(6))),
  };
}

/**
 * Setzt den Tageszähler zurück, wenn seit dem letzten Aufruf ein neuer Tag
 * begonnen hat. Läuft ein Skript über Mitternacht, wäre sonst das Limit des
 * Vortages weiterhin verbraucht.
 */
function tagesgrenzePruefen(): void {
  const jetzt = heutigerTag();
  if (jetzt !== ausgaben.tag) {
    ausgaben.tag = jetzt;
    ausgaben.heuteUsd = 0;
  }
}

/** Nur für Tests und Skripte, die mehrere Budgets nacheinander fahren. */
export function setzeAusgabenZurueck(): void {
  ausgaben.tag = heutigerTag();
  ausgaben.heuteUsd = 0;
  ausgaben.gesamtUsd = 0;
  ausgaben.anfragen = 0;
}

/**
 * Die eigentliche Bremse: bevor eine Anfrage rausgeht, muss noch Budget da
 * sein.
 *
 * Geprüft wird **vor** dem Aufruf gegen den bereits verbrauchten Betrag. Der
 * Preis der kommenden Anfrage ist vorher nicht bekannt — die letzte Anfrage
 * darf das Limit also überschreiten, die nächste kommt nicht mehr durch. Das
 * ist gewollt: eine Schätzung vorab wäre falsch und würde entweder zu früh
 * blockieren oder zu spät.
 */
function budgetPruefen(endpunkt: string): void {
  tagesgrenzePruefen();
  const limit = tageslimitUsd();
  if (ausgaben.heuteUsd >= limit) {
    throw new DataForSeoFehler(
      `Tageslimit erreicht: ${ausgaben.heuteUsd.toFixed(4)} $ von ${limit.toFixed(2)} $ ` +
        `verbraucht, Anfrage an ${endpunkt} abgebrochen. Limit anheben über ` +
        "DATAFORSEO_TAGESLIMIT_USD, Zähler zurücksetzen mit setzeAusgabenZurueck(), " +
        "oder mit DATAFORSEO_SANDBOX=1 kostenlos weiterarbeiten.",
      { ebene: "budget", endpunkt },
    );
  }
}

/**
 * Schreibt die Kosten einer Antwort mit.
 *
 * In der Sandbox ist `cost` immer 0 — der Zähler läuft trotzdem mit, damit die
 * Zahl der Anfragen stimmt und ein Sandbox-Lauf zeigt, wie viele Aufrufe ein
 * Skript überhaupt macht.
 */
function kostenBuchen(kosten: number): void {
  tagesgrenzePruefen();
  ausgaben.anfragen += 1;
  if (kosten > 0) {
    ausgaben.heuteUsd += kosten;
    ausgaben.gesamtUsd += kosten;
  }
}

// ---------------------------------------------------------------------------
// Drosselung
// ---------------------------------------------------------------------------

/**
 * Die Ratenlimits liegen pro Endpunktgruppe, nicht global — und sie liegen
 * grotesk weit auseinander.
 *
 * Die Google-Ads-Live-Endpunkte erlauben **12 Anfragen pro Minute**. Das ist der
 * harte Engpass der ganzen API: wer `suchvolumen()` in einer Schleife über 100
 * Keyword-Pakete ruft, wartet mit dieser Drossel acht Minuten — und rennt ohne
 * sie nach der zwölften Anfrage in `40202`.
 */
const DROSSEL_ABSTAND_MS: Record<string, number> = {
  // 12/min → 5 s Abstand, mit etwas Luft.
  google_ads: 5_100,
  // 2000/min wären 30 ms. 40 ms lässt Raum für parallele Prozesse auf demselben Account.
  standard: 40,
};

/** Wie viele Anfragen gleichzeitig laufen dürfen. Die API erlaubt 30 (`40209`). */
const GLEICHZEITIG_MAX = 10;

const schlafe = (ms: number): Promise<void> =>
  new Promise((freigeben) => setTimeout(freigeben, ms));

const drosselKette = new Map<string, Promise<void>>();
const letzterStart = new Map<string, number>();

/**
 * Hält den Mindestabstand zwischen zwei Starts derselben Gruppe ein.
 *
 * Die Kette serialisiert nur die *Startzeitpunkte*, nicht die Anfragen selbst —
 * sonst wäre der Client bei den schnellen Labs-Endpunkten künstlich sequenziell,
 * obwohl dort 2000 Anfragen pro Minute erlaubt sind.
 */
async function drossle(gruppe: string): Promise<void> {
  const abstand = DROSSEL_ABSTAND_MS[gruppe] ?? DROSSEL_ABSTAND_MS.standard;
  const vorgaenger = drosselKette.get(gruppe) ?? Promise.resolve();

  let freigeben: () => void = () => undefined;
  const eigenerPlatz = new Promise<void>((aufloesen) => {
    freigeben = aufloesen;
  });
  drosselKette.set(
    gruppe,
    vorgaenger.then(() => eigenerPlatz),
  );

  await vorgaenger;
  const wartezeit = (letzterStart.get(gruppe) ?? 0) + abstand - Date.now();
  if (wartezeit > 0) await schlafe(wartezeit);
  letzterStart.set(gruppe, Date.now());
  freigeben();
}

let laufendeAnfragen = 0;
const schleusenWarteschlange: Array<() => void> = [];

async function betreteSchleuse(): Promise<void> {
  if (laufendeAnfragen < GLEICHZEITIG_MAX) {
    laufendeAnfragen += 1;
    return;
  }
  await new Promise<void>((aufloesen) => schleusenWarteschlange.push(aufloesen));
  laufendeAnfragen += 1;
}

function verlasseSchleuse(): void {
  laufendeAnfragen -= 1;
  const naechster = schleusenWarteschlange.shift();
  if (naechster) naechster();
}

// ---------------------------------------------------------------------------
// Zentrale Anfrage
// ---------------------------------------------------------------------------

/**
 * Der Server bricht Live-Tasks nach 120 Sekunden selbst ab (`50401`). Der
 * Client wartet zehn Sekunden länger, damit die API ihre eigene, aussagekräftige
 * Fehlermeldung noch zurückgeben kann, statt dass der Client vorher abschneidet.
 */
const TIMEOUT_STANDARD_MS = 130_000;

const MAX_VERSUCHE = 4;
const BACKOFF_BASIS_MS = 1_000;
const BACKOFF_RATE_LIMIT_MS = 6_000;

interface AnfrageOptionen {
  /** GET nur für die Hilfsendpunkte (`appendix/user_data`). */
  methode?: "GET" | "POST";
  /**
   * Die Task-Parameter. Werden als **einelementiges** Array gesendet — die
   * Live-Methode nimmt genau einen Task pro Aufruf.
   */
  aufgabe?: Record<string, unknown>;
  /** Welche Drosselgruppe gilt. */
  drossel?: string;
  timeoutMs?: number;
}

/** Was aus einer Antwort übrig bleibt, nachdem beide Statusebenen geprüft sind. */
interface Rohantwort {
  /** `tasks[0].result`, nie `null` — leere Ergebnisse kommen als leeres Array. */
  ergebnis: unknown[];
  /** `cost` dieser Antwort in USD. */
  kosten: number;
}

type Roh = Record<string, unknown>;

const objekt = (wert: unknown): Roh =>
  wert !== null && typeof wert === "object" ? (wert as Roh) : {};
const liste = (wert: unknown): unknown[] => (Array.isArray(wert) ? wert : []);
const zahl = (wert: unknown): number | null =>
  typeof wert === "number" && Number.isFinite(wert) ? wert : null;
const text = (wert: unknown): string | null =>
  typeof wert === "string" && wert.length > 0 ? wert : null;
const wahrheit = (wert: unknown): boolean => wert === true;

/** Greift einen verschachtelten Wert ab, ohne bei fehlenden Zwischenebenen zu werfen. */
const feld = (wurzel: unknown, ...schluessel: string[]): unknown =>
  schluessel.reduce<unknown>((wert, name) => objekt(wert)[name], wurzel);

/**
 * Jede Anfrage an DataForSEO läuft hier durch — Auth, Drosselung, Budget,
 * Timeout, beide Statusebenen und der Retry.
 *
 * **Beide Statusebenen zu prüfen ist Pflicht.** Der äußere `status_code` sagt
 * "20000 Ok", während `tasks[0].status_code` das eigentliche Problem trägt:
 * falsches Feld, zu viele Keywords, Guthaben leer. Wer nur den äußeren Code
 * liest, bekommt ein leeres Ergebnis und keine Fehlermeldung.
 */
async function anfrage(pfadTeile: string[], optionen: AnfrageOptionen = {}): Promise<Rohantwort> {
  const endpunkt = pfadTeile.join("/");
  const methode = optionen.methode ?? "POST";
  const gruppe = optionen.drossel ?? "standard";
  const kopf = autorisierung();

  let letzterFehler: DataForSeoFehler | null = null;

  for (let versuch = 1; versuch <= MAX_VERSUCHE; versuch += 1) {
    budgetPruefen(endpunkt);
    await drossle(gruppe);
    await betreteSchleuse();

    const abbruch = new AbortController();
    const wecker = setTimeout(() => abbruch.abort(), optionen.timeoutMs ?? TIMEOUT_STANDARD_MS);

    try {
      const antwort = await fetch(`${basisUrl()}/${endpunkt}`, {
        method: methode,
        headers: {
          Authorization: kopf,
          "Content-Type": "application/json",
        },
        // Die Live-Methode nimmt genau einen Task pro POST. Ein Array mit zehn
        // Objekten schlägt fehl — die 100 gelten nur für die Queue.
        body: methode === "POST" ? JSON.stringify([optionen.aufgabe ?? {}]) : undefined,
        signal: abbruch.signal,
      });

      if (!antwort.ok) {
        const wiederholbar = antwort.status === 429 || antwort.status >= 500;
        letzterFehler = new DataForSeoFehler(
          `HTTP ${antwort.status} von ${endpunkt}: ${antwort.statusText}`,
          { ebene: "http", statusCode: antwort.status, endpunkt, wiederholbar },
        );
        if (!wiederholbar) throw letzterFehler;
        // Der Server sagt selbst, wie lange er Ruhe braucht — das schlägt jede Heuristik.
        const nachHeader = Number.parseInt(antwort.headers.get("retry-after") ?? "", 10);
        await schlafe(
          Number.isFinite(nachHeader) && nachHeader > 0
            ? nachHeader * 1000
            : rueckzugszeit(versuch, BACKOFF_BASIS_MS),
        );
        continue;
      }

      const daten = objekt(await antwort.json());
      const aeussererCode = zahl(daten.status_code);
      const kosten = zahl(daten.cost) ?? 0;

      // Gebucht wird, was die API berechnet hat — auch bei einem Task-Fehler.
      // Ein fehlgeschlagener Task kann bereits Geld gekostet haben.
      kostenBuchen(kosten);

      if (aeussererCode !== STATUS.OK) {
        const fehler = new DataForSeoFehler(
          `${endpunkt}: ${aeussererCode} ${text(daten.status_message) ?? "ohne Meldung"}${erlaeuterung(aeussererCode)}`,
          {
            ebene: "umschlag",
            statusCode: aeussererCode,
            endpunkt,
            wiederholbar: WIEDERHOLBARE_CODES.has(aeussererCode ?? 0),
          },
        );
        if (!fehler.wiederholbar) throw fehler;
        letzterFehler = fehler;
        await schlafe(rueckzugszeit(versuch, rueckzugsbasis(aeussererCode)));
        continue;
      }

      const aufgabe = objekt(liste(daten.tasks)[0]);
      const aufgabenCode = zahl(aufgabe.status_code);

      if (aufgabenCode !== STATUS.OK) {
        const fehler = new DataForSeoFehler(
          `${endpunkt} (Task): ${aufgabenCode} ${text(aufgabe.status_message) ?? "ohne Meldung"}${erlaeuterung(aufgabenCode)}`,
          {
            ebene: "task",
            statusCode: aufgabenCode,
            endpunkt,
            wiederholbar: WIEDERHOLBARE_CODES.has(aufgabenCode ?? 0),
          },
        );
        if (!fehler.wiederholbar) throw fehler;
        letzterFehler = fehler;
        await schlafe(rueckzugszeit(versuch, rueckzugsbasis(aufgabenCode)));
        continue;
      }

      // `result: null` ist kein Fehler, sondern "nichts gefunden" — etwa ein
      // Keyword ohne Suchvolumen. Ein leeres Array ist die ehrlichere Antwort
      // als ein geworfener Fehler.
      return { ergebnis: liste(aufgabe.result), kosten };
    } catch (ursache) {
      if (ursache instanceof DataForSeoFehler) {
        if (!ursache.wiederholbar || versuch === MAX_VERSUCHE) throw ursache;
        letzterFehler = ursache;
        continue;
      }

      // Abbruch durch den eigenen Wecker, DNS-Aussetzer, gekappte Verbindung:
      // alles Gründe, es noch einmal zu versuchen.
      const abgebrochen = ursache instanceof Error && ursache.name === "AbortError";
      letzterFehler = new DataForSeoFehler(
        abgebrochen
          ? `${endpunkt}: Zeitüberschreitung nach ${(optionen.timeoutMs ?? TIMEOUT_STANDARD_MS) / 1000} s.`
          : `${endpunkt}: Netzwerkfehler — ${ursache instanceof Error ? ursache.message : String(ursache)}`,
        { ebene: "netzwerk", endpunkt, wiederholbar: true },
      );
      if (versuch === MAX_VERSUCHE) throw letzterFehler;
      await schlafe(rueckzugszeit(versuch, BACKOFF_BASIS_MS));
    } finally {
      clearTimeout(wecker);
      verlasseSchleuse();
    }
  }

  throw (
    letzterFehler ??
    new DataForSeoFehler(`${endpunkt}: nach ${MAX_VERSUCHE} Versuchen keine Antwort.`, {
      ebene: "netzwerk",
      endpunkt,
    })
  );
}

/**
 * Exponentieller Rückzug mit Streuung. Ohne die Streuung starten mehrere
 * Prozesse nach einem Rate Limit exakt gleichzeitig wieder — und laufen
 * geschlossen ins nächste.
 */
function rueckzugszeit(versuch: number, basis: number): number {
  const gewachsen = basis * 2 ** (versuch - 1);
  return Math.round(gewachsen * (0.75 + Math.random() * 0.5));
}

/**
 * Beim Rate Limit ist die Sperre minutenbasiert — eine Sekunde später erneut zu
 * fragen, verbrennt nur einen Versuch.
 */
const rueckzugsbasis = (code: number | null): number =>
  code === STATUS.RATE_LIMIT || code === STATUS.ZU_VIELE_PARALLEL
    ? BACKOFF_RATE_LIMIT_MS
    : BACKOFF_BASIS_MS;

/**
 * Ergänzt die knappen API-Meldungen um das, was man im Fehlerfall tatsächlich
 * wissen will. "Not Found." allein hilft niemandem weiter.
 */
function erlaeuterung(code: number | null): string {
  switch (code) {
    case STATUS.ZU_VIELE_TASKS:
      return " — mehr als 100 Tasks in einem POST. (Live nimmt ohnehin nur einen.)";
    case STATUS.AUTH_FEHLGESCHLAGEN:
      return " — DATAFORSEO_LOGIN/DATAFORSEO_PASSWORD prüfen: es sind die API-Zugangsdaten aus \"API Access\", nicht die des Benutzerkontos.";
    case STATUS.ACCOUNT_UNVERIFIZIERT:
      return " — der Account ist noch nicht verifiziert und kann keine Anfragen stellen.";
    case STATUS.GUTHABEN_LEER:
    case STATUS.GUTHABEN_ZU_NIEDRIG:
      return " — Guthaben aufladen (Mindestaufladung 50 $).";
    case STATUS.RATE_LIMIT:
      return " — Rate Limit pro Minute. Google-Ads-Endpunkte erlauben nur 12/min.";
    case STATUS.TAGESLIMIT_ERREICHT:
      return " — das im DataForSEO-Dashboard gesetzte Tages-Kostenlimit greift.";
    case STATUS.IP_NICHT_ERLAUBT:
      return " — die aufrufende IP steht nicht in der Whitelist des Accounts.";
    case STATUS.ZU_VIELE_PARALLEL:
      return " — mehr als 30 gleichzeitige Anfragen.";
    case STATUS.UNGUELTIGES_FELD:
      return " — ein Feld im POST-Körper ist unbekannt oder falsch typisiert.";
    case STATUS.LIVE_TIMEOUT:
      return " — Live-Tasks brechen nach 120 s ab. Kleinere Anfrage stellen (weniger depth, weniger Keywords).";
    default:
      return "";
  }
}

// ---------------------------------------------------------------------------
// Gemeinsame Typen
// ---------------------------------------------------------------------------

/** Standort und Sprache — überall dieselben zwei Felder. */
export interface MarktOptionen {
  /** Google-Ads-Criteria-ID, Standard Deutschland (2276). */
  standort?: number;
  /** ISO-Sprachcode, Standard "de". */
  sprache?: string;
  /** Freies Etikett, kommt in der Antwort zurück — nützlich in Logs. */
  tag?: string;
}

/** Ein Monatswert aus der Suchvolumen-Historie. */
export interface Monatswert {
  jahr: number | null;
  monat: number | null;
  suchvolumen: number | null;
}

const monatswerte = (roh: unknown): Monatswert[] =>
  liste(roh).map((eintrag) => ({
    jahr: zahl(objekt(eintrag).year),
    monat: zahl(objekt(eintrag).month),
    suchvolumen: zahl(objekt(eintrag).search_volume),
  }));

/**
 * Ein Keyword mit allem, was die Labs-API dazu weiß.
 *
 * Bewusst flach: die API verschachtelt dieselben Metriken je nach Endpunkt in
 * `keyword_info`, `keyword_properties`, `search_intent_info` oder noch eine
 * Ebene tiefer unter `keyword_data`. Wer damit weiterarbeitet, will `.volumen`
 * schreiben und nicht raten, in welchem Zweig es diesmal steht.
 */
export interface KeywordDatensatz {
  keyword: string;
  /** Durchschnittliche monatliche Suchanfragen. `null` heißt: keine Daten, nicht 0. */
  volumen: number | null;
  cpc: number | null;
  /** LOW / MEDIUM / HIGH — die Google-Ads-Einstufung. */
  wettbewerb: string | null;
  /** 0–100. Wettbewerb um Anzeigenplätze, **nicht** die SEO-Schwierigkeit. */
  wettbewerbIndex: number | null;
  /** 0–100. Wie schwer ein Platz in den Top 10 organisch zu holen ist. */
  schwierigkeit: number | null;
  /** informational | navigational | commercial | transactional */
  intention: string | null;
  /** Prozentuale Veränderung des Volumens (Monat/Quartal/Jahr), soweit geliefert. */
  trend: { monat: number | null; quartal: number | null; jahr: number | null };
  /** Welche SERP-Elemente bei diesem Keyword auftauchen — nur mit `serpInfo: true`. */
  serpFeatures: string[];
  /** Wie viele Treffer Google für das Keyword meldet. */
  serpTrefferGesamt: number | null;
  monatswerte: Monatswert[];
  /** Sprache, die die API im Keyword erkannt hat — entlarvt Fremdsprachiges in deutschen Sets. */
  spracheErkannt: string | null;
}

/**
 * Baut aus einem Labs-Item den flachen Datensatz.
 *
 * `related_keywords` verpackt dasselbe Item eine Ebene tiefer unter
 * `keyword_data` — deshalb packt der Aufrufer die Hülle vorher aus, statt dass
 * hier zwei Formen geraten werden müssten.
 */
function keywordDatensatz(roh: unknown): KeywordDatensatz {
  const item = objekt(roh);
  return {
    keyword: text(item.keyword) ?? "",
    volumen: zahl(feld(item, "keyword_info", "search_volume")),
    cpc: zahl(feld(item, "keyword_info", "cpc")),
    wettbewerb: text(feld(item, "keyword_info", "competition_level")),
    wettbewerbIndex: zahl(feld(item, "keyword_info", "competition")),
    schwierigkeit: zahl(feld(item, "keyword_properties", "keyword_difficulty")),
    intention: text(feld(item, "search_intent_info", "main_intent")),
    trend: {
      monat: zahl(feld(item, "keyword_info", "search_volume_trend", "monthly")),
      quartal: zahl(feld(item, "keyword_info", "search_volume_trend", "quarterly")),
      jahr: zahl(feld(item, "keyword_info", "search_volume_trend", "yearly")),
    },
    serpFeatures: liste(feld(item, "serp_info", "serp_item_types")).filter(
      (wert): wert is string => typeof wert === "string",
    ),
    serpTrefferGesamt: zahl(feld(item, "serp_info", "se_results_count")),
    monatswerte: monatswerte(feld(item, "keyword_info", "monthly_searches")),
    spracheErkannt: text(feld(item, "keyword_properties", "detected_language")),
  };
}

/**
 * Labs erlaubt höchstens acht Filterbedingungen — und zählt die "and"/"or"
 * dazwischen mit. Die Regel steht hier, damit sie nicht in jeder Funktion neu
 * erfunden wird.
 */
const LABS_FILTER_MAX = 8;
const LABS_LIMIT_MAX = 1000;

function labsFilter(
  mindestVolumen: number | undefined,
  maxSchwierigkeit: number | undefined,
  eigene: unknown[] | undefined,
): unknown[] | undefined {
  if (eigene && eigene.length > 0) {
    if (eigene.length > LABS_FILTER_MAX) {
      throw new DataForSeoFehler(
        `Zu viele Filterbedingungen (${eigene.length}). DataForSEO Labs erlaubt höchstens ${LABS_FILTER_MAX} — die Verknüpfungen "and"/"or" zählen mit.`,
        { ebene: "konfiguration" },
      );
    }
    return eigene;
  }

  const bedingungen: unknown[] = [];
  if (typeof mindestVolumen === "number") {
    bedingungen.push(["keyword_info.search_volume", ">=", mindestVolumen]);
  }
  if (typeof maxSchwierigkeit === "number") {
    if (bedingungen.length > 0) bedingungen.push("and");
    bedingungen.push(["keyword_properties.keyword_difficulty", "<=", maxSchwierigkeit]);
  }
  return bedingungen.length > 0 ? bedingungen : undefined;
}

const grenze = (wert: number | undefined, standard: number): number =>
  Math.min(Math.max(1, wert ?? standard), LABS_LIMIT_MAX);

// ---------------------------------------------------------------------------
// DataForSEO Labs — Keyword-Recherche
// ---------------------------------------------------------------------------

export interface KeywordIdeenOptionen extends MarktOptionen {
  /** Höchstzahl der Ergebnisse, max. 1000. Jedes Item kostet 0,00012 $. */
  limit?: number;
  /** Untergrenze Suchvolumen — spart Items und damit Geld. */
  mindestVolumen?: number;
  /** Obergrenze Keyword-Schwierigkeit. */
  maxSchwierigkeit?: number;
  /** Eigene Filterbedingungen; ersetzen `mindestVolumen`/`maxSchwierigkeit`. */
  filter?: unknown[];
  /** Sortierung, z. B. `["keyword_info.search_volume,desc"]`, max. 3 Regeln. */
  sortierung?: string[];
  /** Nur enge Varianten der Seeds statt des ganzen Themenfelds. */
  engeVarianten?: boolean;
  /** Synonyme aussortieren — gegen Dutzende Schreibweisen desselben Begriffs. */
  synonymeIgnorieren?: boolean;
  /** SERP-Features je Keyword mitliefern (kostenlos, aber langsamer). */
  serpInfo?: boolean;
}

const LABS_SEEDS_MAX = 200;

/**
 * Keyword-Ideen aus dem Themenfeld mehrerer Seeds.
 *
 * Der Unterschied zu {@link keywordVorschlaege}: Ideen kommen aus derselben
 * *Kategorie* und müssen den Seed nicht enthalten ("KI-Automatisierung" →
 * "Prozesse digitalisieren"). Vorschläge enthalten den Seed immer wörtlich.
 * Für ein Themencluster ist das hier der richtige Einstieg.
 *
 * Kosten: 0,012 $ je Aufruf plus 0,00012 $ je geliefertem Keyword — ein Lauf
 * mit `limit: 1000` kostet 0,13 $. `mindestVolumen` ist damit nicht nur ein
 * Qualitäts-, sondern ein Preisfilter.
 */
export async function keywordIdeen(
  seeds: string[],
  optionen: KeywordIdeenOptionen = {},
): Promise<KeywordDatensatz[]> {
  const bereinigt = seeds.map((seed) => seed.trim().toLowerCase()).filter(Boolean);

  if (bereinigt.length === 0) {
    throw new DataForSeoFehler("keywordIdeen: mindestens ein Seed-Keyword nötig.", {
      ebene: "konfiguration",
    });
  }
  if (bereinigt.length > LABS_SEEDS_MAX) {
    throw new DataForSeoFehler(
      `keywordIdeen: ${bereinigt.length} Seeds übergeben, erlaubt sind ${LABS_SEEDS_MAX}.`,
      { ebene: "konfiguration" },
    );
  }

  const { ergebnis } = await anfrage(
    ["dataforseo_labs", "google", "keyword_ideas", "live"],
    {
      aufgabe: {
        keywords: bereinigt,
        location_code: optionen.standort ?? STANDORT_DEUTSCHLAND,
        language_code: optionen.sprache ?? SPRACHE_DEUTSCH,
        limit: grenze(optionen.limit, 200),
        closely_variants: wahrheit(optionen.engeVarianten),
        ignore_synonyms: optionen.synonymeIgnorieren !== false,
        include_serp_info: wahrheit(optionen.serpInfo),
        // Verdoppelt den Preis und liefert Bing-normalisierte Zweitzahlen, die
        // für die Redaktionsplanung nichts entscheiden.
        include_clickstream_data: false,
        filters: labsFilter(optionen.mindestVolumen, optionen.maxSchwierigkeit, optionen.filter),
        order_by: optionen.sortierung ?? ["keyword_info.search_volume,desc"],
        tag: optionen.tag,
      },
    },
  );

  return liste(feld(ergebnis[0], "items")).map(keywordDatensatz);
}

export interface KeywordVorschlaegeOptionen extends KeywordIdeenOptionen {
  /** Nur Phrasen, die den Seed exakt in dieser Wortfolge enthalten. */
  exakt?: boolean;
  /** Den Seed selbst mit ausliefern. */
  seedEinschliessen?: boolean;
}

/** Der Seed und seine Long-Tail-Varianten. */
export interface KeywordVorschlaege {
  /** Der Seed mit seinen eigenen Metriken — `null`, wenn die API ihn nicht kennt. */
  seed: KeywordDatensatz | null;
  vorschlaege: KeywordDatensatz[];
}

/**
 * Long-Tail-Varianten, die den Seed wörtlich enthalten.
 *
 * Das ist die Long-Tail-Quelle für Zwischenüberschriften und FAQ-Blöcke: alles
 * hier ist eine echte Suchanfrage, in der der Seed vorkommt.
 *
 * Rückgabe ist bewusst ein Objekt und keine Liste — die API liefert den Seed
 * mit eigenen Metriken (`seed_keyword_data`) getrennt von den Vorschlägen, und
 * dieser Vergleichswert geht beim Flachklopfen verloren.
 */
export async function keywordVorschlaege(
  keyword: string,
  optionen: KeywordVorschlaegeOptionen = {},
): Promise<KeywordVorschlaege> {
  const seed = keyword.trim().toLowerCase();
  if (!seed) {
    throw new DataForSeoFehler("keywordVorschlaege: leeres Keyword.", { ebene: "konfiguration" });
  }

  const { ergebnis } = await anfrage(
    ["dataforseo_labs", "google", "keyword_suggestions", "live"],
    {
      aufgabe: {
        keyword: seed,
        location_code: optionen.standort ?? STANDORT_DEUTSCHLAND,
        language_code: optionen.sprache ?? SPRACHE_DEUTSCH,
        limit: grenze(optionen.limit, 200),
        exact_match: wahrheit(optionen.exakt),
        include_seed_keyword: optionen.seedEinschliessen !== false,
        include_serp_info: wahrheit(optionen.serpInfo),
        include_clickstream_data: false,
        ignore_synonyms: optionen.synonymeIgnorieren !== false,
        filters: labsFilter(optionen.mindestVolumen, optionen.maxSchwierigkeit, optionen.filter),
        order_by: optionen.sortierung ?? ["keyword_info.search_volume,desc"],
        tag: optionen.tag,
      },
    },
  );

  const wurzel = ergebnis[0];
  const seedRoh = objekt(wurzel).seed_keyword_data;

  return {
    seed: seedRoh ? keywordDatensatz(seedRoh) : null,
    vorschlaege: liste(feld(wurzel, "items")).map(keywordDatensatz),
  };
}

/** Ein verwandtes Keyword — dieselben Metriken plus die Nachbarschaft aus der SERP. */
export interface VerwandtesKeyword extends KeywordDatensatz {
  /** Die "Ähnliche Suchanfragen" dieses Keywords — der Stoff für die nächste Runde. */
  auchGesucht: string[];
}

const VERWANDTE_TIEFE_MAX = 4;

/**
 * Die Kette der "Ähnlichen Suchanfragen" unterhalb einer SERP, rekursiv gefolgt.
 *
 * ⚠️ **`tiefe` wächst exponentiell und wird pro Item abgerechnet.** Der Ertrag
 * laut Doku: 0 ≈ 1 Keyword, 1 ≈ 8, 2 ≈ 72, 3 ≈ 584, 4 ≈ 4680. Tiefe 4 kostet
 * damit rund 0,58 $ statt der 0,02 $ bei Tiefe 2 — dreißigmal so viel für
 * Ergebnisse, die am Rand kaum noch zum Thema gehören. Standard ist deshalb 2.
 *
 * Die Items liegen hier **eine Ebene tiefer** als bei allen anderen
 * Labs-Endpunkten (`items[].keyword_data`) — eine Eigenheit, die man ohne
 * Blick in die Antwort nicht erwartet.
 */
export async function verwandteKeywords(
  keyword: string,
  tiefe = 2,
  optionen: MarktOptionen & { limit?: number; serpInfo?: boolean } = {},
): Promise<VerwandtesKeyword[]> {
  const seed = keyword.trim().toLowerCase();
  if (!seed) {
    throw new DataForSeoFehler("verwandteKeywords: leeres Keyword.", { ebene: "konfiguration" });
  }
  if (!Number.isInteger(tiefe) || tiefe < 0 || tiefe > VERWANDTE_TIEFE_MAX) {
    throw new DataForSeoFehler(
      `verwandteKeywords: tiefe muss zwischen 0 und ${VERWANDTE_TIEFE_MAX} liegen (übergeben: ${tiefe}).`,
      { ebene: "konfiguration" },
    );
  }

  const { ergebnis } = await anfrage(
    ["dataforseo_labs", "google", "related_keywords", "live"],
    {
      aufgabe: {
        keyword: seed,
        location_code: optionen.standort ?? STANDORT_DEUTSCHLAND,
        language_code: optionen.sprache ?? SPRACHE_DEUTSCH,
        depth: tiefe,
        limit: grenze(optionen.limit, 200),
        include_serp_info: wahrheit(optionen.serpInfo),
        include_clickstream_data: false,
        tag: optionen.tag,
      },
    },
  );

  return liste(feld(ergebnis[0], "items")).map((item) => ({
    ...keywordDatensatz(objekt(item).keyword_data),
    auchGesucht: liste(objekt(item).related_keywords).filter(
      (wert): wert is string => typeof wert === "string",
    ),
  }));
}

// ---------------------------------------------------------------------------
// Keywords Data (Google Ads) — die offiziellen Volumina
// ---------------------------------------------------------------------------

/** Ein Suchvolumen direkt aus Google Ads. */
export interface SuchvolumenDatensatz {
  keyword: string;
  volumen: number | null;
  /** LOW / MEDIUM / HIGH */
  wettbewerb: string | null;
  /** 0–100 */
  wettbewerbIndex: number | null;
  cpc: number | null;
  /** Untere Gebotsspanne für die obere Anzeigenposition, in Euro. */
  gebotNiedrig: number | null;
  /** Obere Gebotsspanne. */
  gebotHoch: number | null;
  /** Die letzten zwölf Monate. */
  monatswerte: Monatswert[];
}

const GOOGLE_ADS_KEYWORDS_MAX = 1000;
const GOOGLE_ADS_ZEICHEN_MAX = 80;
const GOOGLE_ADS_WOERTER_MAX = 10;

/**
 * Suchvolumen direkt aus der Google-Ads-API — die Zahlen, gegen die jeder
 * Kunde nachrechnet.
 *
 * **Wann das hier statt Labs.** Labs liefert dieselben Volumina aus eigener
 * Datenbank, dazu Schwierigkeit und Intention, und erlaubt 2000 Anfragen pro
 * Minute. Diese Funktion holt die Zahl von Google selbst — teurer (0,09 $ je
 * Aufruf), langsamer (**12 Anfragen pro Minute**, der harte Engpass der ganzen
 * API) und ohne Zusatzmetriken. Sie ist die Wahl, wenn eine bekannte
 * Keyword-Liste belastbar bewertet werden soll, nicht die für die Recherche.
 *
 * ⚠️ **Die Antwort liegt direkt in `tasks[0].result[]`, ohne `items`.** Das ist
 * die einzige Struktur-Ausnahme im ganzen v3-Baum. Wer hier `result[0].items`
 * liest, bekommt `undefined` und keinen Fehler.
 *
 * Google-Ads-Regeln, die vorab geprüft werden, weil sie sonst den ganzen Task
 * kippen: höchstens 1000 Keywords, je 80 Zeichen und 10 Wörter, keine Emojis.
 * Kleingeschrieben wird ohnehin — das erledigt Google, hier passiert es vorher,
 * damit die Antwort zu den gesendeten Keywords passt.
 */
export async function suchvolumen(
  keywords: string[],
  optionen: MarktOptionen & { suchpartner?: boolean } = {},
): Promise<SuchvolumenDatensatz[]> {
  const bereinigt = keywords.map((eintrag) => eintrag.trim().toLowerCase()).filter(Boolean);

  if (bereinigt.length === 0) {
    throw new DataForSeoFehler("suchvolumen: keine Keywords übergeben.", { ebene: "konfiguration" });
  }
  if (bereinigt.length > GOOGLE_ADS_KEYWORDS_MAX) {
    throw new DataForSeoFehler(
      `suchvolumen: ${bereinigt.length} Keywords, erlaubt sind ${GOOGLE_ADS_KEYWORDS_MAX} je Aufruf. ` +
        "Liste aufteilen — aber bedenken: nur 12 Aufrufe pro Minute.",
      { ebene: "konfiguration" },
    );
  }

  const zuLang = bereinigt.find((eintrag) => eintrag.length > GOOGLE_ADS_ZEICHEN_MAX);
  if (zuLang) {
    throw new DataForSeoFehler(
      `suchvolumen: "${zuLang}" ist länger als ${GOOGLE_ADS_ZEICHEN_MAX} Zeichen — Google Ads weist den ganzen Task ab.`,
      { ebene: "konfiguration" },
    );
  }
  const zuViele = bereinigt.find(
    (eintrag) => eintrag.split(/\s+/).length > GOOGLE_ADS_WOERTER_MAX,
  );
  if (zuViele) {
    throw new DataForSeoFehler(
      `suchvolumen: "${zuViele}" hat mehr als ${GOOGLE_ADS_WOERTER_MAX} Wörter — Google Ads weist den ganzen Task ab.`,
      { ebene: "konfiguration" },
    );
  }

  const { ergebnis } = await anfrage(
    ["keywords_data", "google_ads", "search_volume", "live"],
    {
      // Eigene Drosselgruppe: 12 Anfragen pro Minute, nicht 2000.
      drossel: "google_ads",
      aufgabe: {
        keywords: bereinigt,
        location_code: optionen.standort ?? STANDORT_DEUTSCHLAND,
        language_code: optionen.sprache ?? SPRACHE_DEUTSCH,
        // Suchpartner-Netzwerk verwässert die Zahl gegenüber dem, was in der
        // Google-Suche selbst passiert.
        search_partners: wahrheit(optionen.suchpartner),
        sort_by: "search_volume",
        tag: optionen.tag,
      },
    },
  );

  return ergebnis.map((eintrag) => {
    const item = objekt(eintrag);
    return {
      keyword: text(item.keyword) ?? "",
      volumen: zahl(item.search_volume),
      wettbewerb: text(item.competition),
      wettbewerbIndex: zahl(item.competition_index),
      cpc: zahl(item.cpc),
      gebotNiedrig: zahl(item.low_top_of_page_bid),
      gebotHoch: zahl(item.high_top_of_page_bid),
      monatswerte: monatswerte(item.monthly_searches),
    };
  });
}

// ---------------------------------------------------------------------------
// Labs — Schwierigkeit und Intention
// ---------------------------------------------------------------------------

/** Keyword mit seiner organischen Schwierigkeit. */
export interface Schwierigkeitswert {
  keyword: string;
  /** 0–100. `null` heißt: die API hat keinen Wert, nicht "leicht". */
  schwierigkeit: number | null;
}

const BULK_KEYWORDS_MAX = 1000;

/**
 * Wie schwer ein Platz in den Top 10 zu holen ist — 0 bis 100, für bis zu 1000
 * Keywords in einem Aufruf.
 *
 * Der Wert entscheidet, ob ein Keyword als eigener Artikel taugt oder nur als
 * Abschnitt. Er ist ein Modell, kein Messwert: er schaut auf die Linkprofile
 * der aktuell rankenden Seiten, nicht auf deren Inhalt. Ein schwaches Thema mit
 * starken Domains sieht hier schwer aus und ist trotzdem angreifbar.
 */
export async function keywordSchwierigkeit(
  keywords: string[],
  optionen: MarktOptionen = {},
): Promise<Schwierigkeitswert[]> {
  const bereinigt = keywords.map((eintrag) => eintrag.trim().toLowerCase()).filter(Boolean);
  if (bereinigt.length === 0) {
    throw new DataForSeoFehler("keywordSchwierigkeit: keine Keywords übergeben.", {
      ebene: "konfiguration",
    });
  }
  if (bereinigt.length > BULK_KEYWORDS_MAX) {
    throw new DataForSeoFehler(
      `keywordSchwierigkeit: ${bereinigt.length} Keywords, erlaubt sind ${BULK_KEYWORDS_MAX}.`,
      { ebene: "konfiguration" },
    );
  }

  const { ergebnis } = await anfrage(
    ["dataforseo_labs", "google", "bulk_keyword_difficulty", "live"],
    {
      aufgabe: {
        keywords: bereinigt,
        location_code: optionen.standort ?? STANDORT_DEUTSCHLAND,
        language_code: optionen.sprache ?? SPRACHE_DEUTSCH,
        tag: optionen.tag,
      },
    },
  );

  return liste(feld(ergebnis[0], "items")).map((eintrag) => ({
    keyword: text(objekt(eintrag).keyword) ?? "",
    schwierigkeit: zahl(objekt(eintrag).keyword_difficulty),
  }));
}

/** Die vier Absichten, die hinter einer Suchanfrage stehen können. */
export type Suchabsicht = "informational" | "navigational" | "commercial" | "transactional";

/** Was jemand mit dieser Suche vorhat. */
export interface Intentionswert {
  keyword: string;
  /** Die stärkste Absicht. */
  intention: Suchabsicht | null;
  /** Wie sicher sich das Modell ist, 0–1. */
  wahrscheinlichkeit: number | null;
  /** Nebenabsichten — ein Keyword ist selten sortenrein. */
  weitere: Array<{ intention: Suchabsicht | null; wahrscheinlichkeit: number | null }>;
}

/**
 * Die Suchabsicht hinter bis zu 1000 Keywords.
 *
 * Der Filter, der entscheidet, ob ein Keyword überhaupt in einen Blogartikel
 * gehört: `informational` ja, `transactional` gehört auf eine Angebotsseite.
 * Wer transaktionale Keywords in Ratgebertexte packt, rankt entweder nicht oder
 * bekommt Leser, die etwas kaufen wollten und einen Text bekommen haben.
 *
 * ⚠️ **Kein Standort-Parameter.** Die Absicht hängt an der Sprache, nicht am
 * Land — ein `location_code` im Körper lässt den Task mit `40501` scheitern.
 */
export async function suchintention(
  keywords: string[],
  optionen: { sprache?: string; tag?: string } = {},
): Promise<Intentionswert[]> {
  const bereinigt = keywords.map((eintrag) => eintrag.trim().toLowerCase()).filter(Boolean);
  if (bereinigt.length === 0) {
    throw new DataForSeoFehler("suchintention: keine Keywords übergeben.", {
      ebene: "konfiguration",
    });
  }
  if (bereinigt.length > BULK_KEYWORDS_MAX) {
    throw new DataForSeoFehler(
      `suchintention: ${bereinigt.length} Keywords, erlaubt sind ${BULK_KEYWORDS_MAX}.`,
      { ebene: "konfiguration" },
    );
  }

  const { ergebnis } = await anfrage(
    ["dataforseo_labs", "google", "search_intent", "live"],
    {
      aufgabe: {
        keywords: bereinigt,
        language_code: optionen.sprache ?? SPRACHE_DEUTSCH,
        tag: optionen.tag,
      },
    },
  );

  return liste(feld(ergebnis[0], "items")).map((eintrag) => {
    const item = objekt(eintrag);
    return {
      keyword: text(item.keyword) ?? "",
      intention: (text(feld(item, "keyword_intent", "label")) as Suchabsicht) ?? null,
      wahrscheinlichkeit: zahl(feld(item, "keyword_intent", "probability")),
      weitere: liste(item.secondary_keyword_intents).map((weiterer) => ({
        intention: (text(objekt(weiterer).label) as Suchabsicht) ?? null,
        wahrscheinlichkeit: zahl(objekt(weiterer).probability),
      })),
    };
  });
}

// ---------------------------------------------------------------------------
// SERP API
// ---------------------------------------------------------------------------

/** Ein organischer Treffer. */
export interface OrganischerTreffer {
  /** Position über alle SERP-Elemente hinweg — was der Nutzer wirklich sieht. */
  position: number | null;
  /** Position innerhalb der organischen Liste. */
  organischePosition: number | null;
  domain: string;
  titel: string | null;
  url: string | null;
  beschreibung: string | null;
}

/** Eine "Nutzer fragen auch"-Frage samt der Antwort, die Google einblendet. */
export interface PaaFrage {
  frage: string;
  antwort: string | null;
  quelleUrl: string | null;
  quelleDomain: string | null;
}

/** Der hervorgehobene Kasten über den Treffern — Position null. */
export interface FeaturedSnippet {
  titel: string | null;
  url: string | null;
  domain: string | null;
  beschreibung: string | null;
}

/** Eine Quelle, aus der die KI-Übersicht zitiert. */
export interface AiOverviewQuelle {
  titel: string | null;
  url: string | null;
  domain: string | null;
}

/** Die aufbereitete SERP. */
export interface SerpAnalyse {
  keyword: string;
  /** Die Google-URL, unter der das Ergebnis geholt wurde — zum Nachsehen. */
  pruefUrl: string | null;
  /** Wie viele Treffer Google insgesamt meldet. */
  trefferGesamt: number | null;
  /** Welche Elementtypen auf dieser SERP vorkommen — das Feld-Profil des Keywords. */
  vorhandeneFeatures: string[];
  organisch: OrganischerTreffer[];
  fragen: PaaFrage[];
  featuredSnippet: FeaturedSnippet | null;
  /** Leer, wenn keine KI-Übersicht ausgespielt wurde. */
  aiOverviewQuellen: AiOverviewQuelle[];
}

export interface SerpOptionen extends MarktOptionen {
  /** Google-Länderdomain, Standard `google.de`. */
  seDomain?: string;
  geraet?: "desktop" | "mobile";
  /**
   * Wie viele Treffer geholt werden. ⚠️ **Linear bepreist**: 100 kostet das
   * Zehnfache von 10. Standard bleibt 10.
   */
  tiefe?: number;
  /**
   * Wie tief die "Nutzer fragen auch"-Kästen aufgeklappt werden (1–4).
   * Jeder Klick kostet 0,00015 $ zusätzlich. Ohne diesen Wert liefert Google
   * nur die sichtbaren Fragen ohne Antworttexte.
   */
  paaKlickTiefe?: number;
}

const SERP_TIEFE_MAX_LIVE = 200;

/**
 * Erkennt Google-Suchoperatoren im Keyword.
 *
 * Der Grund ist kein Stilempfinden, sondern der Preis: **jeder Operator
 * verfünffacht den SERP-Preis.** Eine `site:`-Abfrage auf `depth: 100` kostet
 * 0,03 $ statt 0,0006 $ — Faktor 50, ohne dass irgendwo eine Warnung erscheint.
 * Deshalb wird hier gewarnt statt geworfen: die Abfrage ist legitim, sie soll
 * nur nicht versehentlich passieren.
 */
const OPERATOR_MUSTER =
  /\b(site|filetype|inurl|intitle|allintitle|allinurl|allinanchor|inanchor|cache|related|link|define|source|before|after|daterange|imagesize|loc|location):/i;

/**
 * Eine komplette SERP, zerlegt in das, womit man arbeiten kann: Wettbewerber,
 * Fragen, Snippet-Chancen, KI-Quellen.
 *
 * **Bewusst `live/advanced`, nicht `live/regular`.** `regular` liefert nur
 * `organic`, `paid` und `featured_snippet` — die "Nutzer fragen auch"-Fragen,
 * die den halben Artikelaufbau vorgeben, kommen dort schlicht nicht vor. Der
 * Preisunterschied ist keiner.
 *
 * `vorhandeneFeatures` verdient den zweiten Blick: stehen dort `ai_overview`,
 * `featured_snippet` oder `video`, konkurriert ein Text nicht mehr um Platz 1,
 * sondern um den Rest der Seite darunter.
 */
export async function serpAnalyse(
  keyword: string,
  optionen: SerpOptionen = {},
): Promise<SerpAnalyse> {
  const suche = keyword.trim();
  if (!suche) {
    throw new DataForSeoFehler("serpAnalyse: leeres Keyword.", { ebene: "konfiguration" });
  }

  const tiefe = optionen.tiefe ?? 10;
  if (tiefe > SERP_TIEFE_MAX_LIVE) {
    throw new DataForSeoFehler(
      `serpAnalyse: tiefe ${tiefe} — die Live-Methode liefert höchstens ${SERP_TIEFE_MAX_LIVE} Treffer.`,
      { ebene: "konfiguration" },
    );
  }
  if (tiefe > 10) {
    console.warn(
      `[dataforseo] "${suche}": tiefe ${tiefe} kostet das ${Math.ceil(tiefe / 10)}-fache des Basispreises — ` +
        "die Staffelung ist linear, seit Google num=100 abgeschafft hat.",
    );
  }
  if (OPERATOR_MUSTER.test(suche)) {
    console.warn(
      `[dataforseo] "${suche}" enthält einen Suchoperator — das verfünffacht den SERP-Preis je Operator.`,
    );
  }

  const { ergebnis } = await anfrage(["serp", "google", "organic", "live", "advanced"], {
    aufgabe: {
      keyword: suche,
      location_code: optionen.standort ?? STANDORT_DEUTSCHLAND,
      language_code: optionen.sprache ?? SPRACHE_DEUTSCH,
      se_domain: optionen.seDomain ?? SE_DOMAIN_DEUTSCHLAND,
      device: optionen.geraet ?? "desktop",
      os: optionen.geraet === "mobile" ? "android" : "windows",
      depth: tiefe,
      // Fasst mehrere Treffer derselben Domain zusammen, wie Google es anzeigt —
      // sonst zählt ein Wettbewerber mit Sitelinks als vier Konkurrenten.
      group_organic_results: true,
      people_also_ask_click_depth: optionen.paaKlickTiefe,
      tag: optionen.tag,
    },
  });

  const wurzel = objekt(ergebnis[0]);
  const items = liste(wurzel.items);

  const organisch: OrganischerTreffer[] = [];
  const fragen: PaaFrage[] = [];
  const aiOverviewQuellen: AiOverviewQuelle[] = [];
  let featuredSnippet: FeaturedSnippet | null = null;

  for (const eintrag of items) {
    const item = objekt(eintrag);
    switch (text(item.type)) {
      case "organic":
        organisch.push({
          position: zahl(item.rank_absolute),
          organischePosition: zahl(item.rank_group),
          domain: text(item.domain) ?? "",
          titel: text(item.title),
          url: text(item.url),
          beschreibung: text(item.description),
        });
        break;

      case "featured_snippet":
        // Nur das erste zählt — Google zeigt nie zwei, und ein zweites Element
        // wäre ein Artefakt der Gruppierung.
        featuredSnippet ??= {
          titel: text(item.title),
          url: text(item.url),
          domain: text(item.domain),
          beschreibung: text(item.description),
        };
        break;

      case "people_also_ask":
        for (const frageRoh of liste(item.items)) {
          const frage = objekt(frageRoh);
          // Die Antwort steckt in `expanded_element` — dem aufgeklappten Kasten.
          // Ohne `paaKlickTiefe` ist der leer und es bleibt bei der Frage.
          const antwort = objekt(liste(frage.expanded_element)[0]);
          fragen.push({
            frage: text(frage.title) ?? "",
            antwort: text(antwort.description),
            quelleUrl: text(antwort.url),
            quelleDomain: text(antwort.domain),
          });
        }
        break;

      case "ai_overview":
        for (const quelleRoh of liste(item.references)) {
          const quelle = objekt(quelleRoh);
          aiOverviewQuellen.push({
            titel: text(quelle.title),
            url: text(quelle.url),
            domain: text(quelle.domain),
          });
        }
        break;

      default:
        break;
    }
  }

  return {
    keyword: text(wurzel.keyword) ?? suche,
    pruefUrl: text(wurzel.check_url),
    trefferGesamt: zahl(wurzel.se_results_count),
    vorhandeneFeatures: liste(wurzel.item_types).filter(
      (wert): wert is string => typeof wert === "string",
    ),
    organisch,
    fragen,
    featuredSnippet,
    aiOverviewQuellen,
  };
}

// ---------------------------------------------------------------------------
// Labs — Domain-Analyse
// ---------------------------------------------------------------------------

/** Ein Keyword, für das eine Domain bereits rankt. */
export interface RankendesKeyword {
  keyword: string;
  volumen: number | null;
  schwierigkeit: number | null;
  intention: string | null;
  /** Position auf der SERP. */
  position: number | null;
  /** Die rankende Seite. */
  url: string | null;
  titel: string | null;
  /** Geschätzter monatlicher Traffic-Wert dieses Platzes. */
  etv: number | null;
  /** Als welches SERP-Element die Seite rankt (organic, featured_snippet, …). */
  serpTyp: string | null;
}

/** Wie eine Domain in der organischen Suche insgesamt dasteht. */
export interface DomainKennzahlen {
  /** Zahl der rankenden Keywords. */
  keywords: number | null;
  /** Geschätzter monatlicher organischer Traffic. */
  etv: number | null;
  platz1: number | null;
  plaetze2bis3: number | null;
  plaetze4bis10: number | null;
  plaetze11bis100: number | null;
}

/** Das Ranking-Profil einer Domain. */
export interface RankingProfil {
  ziel: string;
  kennzahlen: DomainKennzahlen;
  keywords: RankendesKeyword[];
}

const domainKennzahlen = (roh: unknown): DomainKennzahlen => {
  const organisch = feld(roh, "organic");
  const summe = (...namen: string[]): number | null =>
    namen.reduce<number | null>((bisher, name) => {
      const wert = zahl(objekt(organisch)[name]);
      if (wert === null) return bisher;
      return (bisher ?? 0) + wert;
    }, null);

  return {
    keywords: zahl(objekt(organisch).count),
    etv: zahl(objekt(organisch).etv),
    platz1: zahl(objekt(organisch).pos_1),
    plaetze2bis3: zahl(objekt(organisch).pos_2_3),
    plaetze4bis10: summe("pos_4_10"),
    plaetze11bis100: summe("pos_11_20", "pos_21_30", "pos_31_40", "pos_41_50", "pos_51_60", "pos_61_70", "pos_71_80", "pos_81_90", "pos_91_100"),
  };
};

/** Domain oder URL auf die Form bringen, die die API erwartet. */
const zielBereinigen = (ziel: string): string =>
  ziel.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase();

/**
 * Wofür eine Domain heute schon rankt — der ehrlichste Ausgangspunkt jeder
 * Content-Planung, für die eigene Seite wie für einen Wettbewerber.
 *
 * Übergeben wird die nackte Domain (`beispiel.de`, ohne Protokoll); mit
 * Protokoll versteht die API es als einzelne URL und liefert nur deren
 * Keywords. Das Aufräumen passiert hier, weil der Unterschied in den Daten
 * nicht auffällt — man sieht nur wenige Ergebnisse und hält die Domain für
 * schwach.
 */
export async function rankendeKeywords(
  domain: string,
  optionen: MarktOptionen & {
    limit?: number;
    mindestVolumen?: number;
    /** Nur bestimmte SERP-Typen, z. B. `["organic", "featured_snippet"]`. */
    elementTypen?: string[];
    sortierung?: string[];
  } = {},
): Promise<RankingProfil> {
  const ziel = zielBereinigen(domain);
  if (!ziel) {
    throw new DataForSeoFehler("rankendeKeywords: leere Domain.", { ebene: "konfiguration" });
  }

  const { ergebnis } = await anfrage(["dataforseo_labs", "google", "ranked_keywords", "live"], {
    aufgabe: {
      target: ziel,
      location_code: optionen.standort ?? STANDORT_DEUTSCHLAND,
      language_code: optionen.sprache ?? SPRACHE_DEUTSCH,
      limit: grenze(optionen.limit, 100),
      item_types: optionen.elementTypen ?? ["organic", "featured_snippet"],
      // "live" heißt hier: aktuelle Platzierungen. "lost"/"all" holen verlorene
      // Rankings dazu und blähen das Ergebnis um Historie auf.
      historical_serp_mode: "live",
      filters: labsFilter(optionen.mindestVolumen, undefined, undefined),
      order_by: optionen.sortierung ?? ["ranked_serp_element.serp_item.etv,desc"],
      tag: optionen.tag,
    },
  });

  const wurzel = objekt(ergebnis[0]);

  return {
    ziel,
    kennzahlen: domainKennzahlen(wurzel.metrics),
    keywords: liste(wurzel.items).map((eintrag) => {
      const item = objekt(eintrag);
      const platzierung = feld(item, "ranked_serp_element", "serp_item");
      return {
        keyword: text(feld(item, "keyword_data", "keyword")) ?? "",
        volumen: zahl(feld(item, "keyword_data", "keyword_info", "search_volume")),
        schwierigkeit: zahl(
          feld(item, "keyword_data", "keyword_properties", "keyword_difficulty"),
        ),
        intention: text(feld(item, "keyword_data", "search_intent_info", "main_intent")),
        position: zahl(objekt(platzierung).rank_absolute),
        url: text(objekt(platzierung).url),
        titel: text(objekt(platzierung).title),
        etv: zahl(objekt(platzierung).etv),
        serpTyp: text(objekt(platzierung).type),
      };
    }),
  };
}

/** Eine Domain, die um dieselben Keywords konkurriert. */
export interface WettbewerberDomain {
  domain: string;
  /** Auf wie vielen gemeinsamen Keywords man sich trifft. */
  ueberschneidungen: number | null;
  /** Durchschnittsposition auf den gemeinsamen Keywords. */
  schnittPosition: number | null;
  /** Kennzahlen der ganzen Domain, nicht nur der Schnittmenge. */
  kennzahlen: DomainKennzahlen;
}

/**
 * Wer sonst noch auf dieselben Keywords rankt — die Wettbewerber der Suche,
 * nicht die des Marktes.
 *
 * Der Unterschied ist der ganze Punkt: hier tauchen Fachportale, Verbände und
 * Softwareanbieter auf, die kein Vertriebler je als Konkurrenz nennen würde,
 * die aber genau die Plätze belegen, um die es geht.
 */
export async function wettbewerberDomains(
  domain: string,
  optionen: MarktOptionen & { limit?: number; topDomainsAusschliessen?: boolean } = {},
): Promise<WettbewerberDomain[]> {
  const ziel = zielBereinigen(domain);
  if (!ziel) {
    throw new DataForSeoFehler("wettbewerberDomains: leere Domain.", { ebene: "konfiguration" });
  }

  const { ergebnis } = await anfrage(["dataforseo_labs", "google", "competitors_domain", "live"], {
    aufgabe: {
      target: ziel,
      location_code: optionen.standort ?? STANDORT_DEUTSCHLAND,
      language_code: optionen.sprache ?? SPRACHE_DEUTSCH,
      limit: grenze(optionen.limit, 20),
      item_types: ["organic"],
      // Wikipedia, Amazon und Co. ranken überall mit und sind für niemanden ein
      // erreichbarer Vergleich.
      exclude_top_domains: optionen.topDomainsAusschliessen !== false,
      order_by: ["intersections,desc"],
      tag: optionen.tag,
    },
  });

  return liste(feld(ergebnis[0], "items")).map((eintrag) => {
    const item = objekt(eintrag);
    return {
      domain: text(item.domain) ?? "",
      ueberschneidungen: zahl(item.intersections),
      schnittPosition: zahl(item.avg_position),
      kennzahlen: domainKennzahlen(item.full_domain_metrics),
    };
  });
}

// ---------------------------------------------------------------------------
// Backlinks API
// ---------------------------------------------------------------------------

/**
 * Die Backlinks API kennt **nur** die Live-Methode — es gibt keine
 * Queue-Variante, egal was ältere Beispiele nahelegen.
 *
 * Abgerechnet wird 0,024 $ je Aufruf plus 0,000036 $ je Zeile. Ein Aufruf mit
 * 1000 Zeilen kostet 0,06 $; die Zeilenzahl ist damit der Preishebel, nicht die
 * Zahl der Aufrufe.
 */
export interface BacklinkZusammenfassung {
  ziel: string;
  /** Domain-Rang 0–1000, DataForSEOs eigene Stärkeskala. */
  rang: number | null;
  backlinks: number | null;
  /** Spam-Einschätzung 0–100. Hoch heißt: das Profil sieht gekauft aus. */
  spamScore: number | null;
  verweisendeDomains: number | null;
  /** Verweisende Hauptdomains — Subdomains zusammengefasst. */
  verweisendeHauptdomains: number | null;
  verweisendeSeiten: number | null;
  /** Wie viele der verweisenden Domains nofollow setzen. */
  verweisendeDomainsNofollow: number | null;
  /** Verweisende IPs und Subnetze — viele Links aus einem Subnetz sind ein Muster. */
  verweisendeIps: number | null;
  verweisendeSubnetze: number | null;
  defekteBacklinks: number | null;
  interneLinks: number | null;
  externeLinks: number | null;
  /** Wann der erste Link gesehen wurde. */
  erstmalsGesehen: string | null;
}

/**
 * Das Backlink-Profil eines Ziels in einer Zahlenreihe.
 *
 * Für die Blog-Engine ist das der Realitätscheck hinter der
 * Keyword-Schwierigkeit: ein Wert von 60 bedeutet etwas völlig anderes, wenn
 * die rankenden Seiten 40 verweisende Domains haben statt 4000.
 *
 * `ziel` nimmt eine Domain (`beispiel.de`) oder eine einzelne URL.
 */
export async function backlinkZusammenfassung(
  ziel: string,
  optionen: { mitSubdomains?: boolean; tag?: string } = {},
): Promise<BacklinkZusammenfassung> {
  const adresse = zielBereinigen(ziel);
  if (!adresse) {
    throw new DataForSeoFehler("backlinkZusammenfassung: leeres Ziel.", { ebene: "konfiguration" });
  }

  const { ergebnis } = await anfrage(["backlinks", "summary", "live"], {
    aufgabe: {
      target: adresse,
      include_subdomains: optionen.mitSubdomains !== false,
      // Nur Links, die heute noch stehen. "all" mischt verlorene dazu und lässt
      // jedes Profil stärker aussehen, als es ist.
      backlinks_status_type: "live",
      // Die eingebetteten Beispiellisten kosten Zeilen und werden hier nicht
      // ausgewertet — dafür gibt es verweisendeDomains().
      internal_list_limit: 1,
      tag: optionen.tag,
    },
  });

  const wurzel = objekt(ergebnis[0]);

  return {
    ziel: text(wurzel.target) ?? adresse,
    rang: zahl(wurzel.rank),
    backlinks: zahl(wurzel.backlinks),
    spamScore: zahl(wurzel.backlinks_spam_score),
    verweisendeDomains: zahl(wurzel.referring_domains),
    verweisendeHauptdomains: zahl(wurzel.referring_main_domains),
    verweisendeSeiten: zahl(wurzel.referring_pages),
    verweisendeDomainsNofollow: zahl(wurzel.referring_domains_nofollow),
    verweisendeIps: zahl(wurzel.referring_ips),
    verweisendeSubnetze: zahl(wurzel.referring_subnets),
    defekteBacklinks: zahl(wurzel.broken_backlinks),
    interneLinks: zahl(wurzel.internal_links_count),
    externeLinks: zahl(wurzel.external_links_count),
    erstmalsGesehen: text(wurzel.first_seen),
  };
}

/** Eine Domain, die auf das Ziel verlinkt. */
export interface VerweisendeDomain {
  domain: string;
  /** Domain-Rang der verweisenden Seite — die Stärke, die sie weitergibt. */
  rang: number | null;
  backlinks: number | null;
  /** Wie viele davon dofollow sind. */
  dofollow: number | null;
  spamScore: number | null;
  defekteBacklinks: number | null;
  erstmalsGesehen: string | null;
  /** Gesetzt, wenn der Link verschwunden ist. */
  verlorenAm: string | null;
}

/**
 * Wer auf ein Ziel verlinkt, absteigend nach Stärke.
 *
 * `limit` ist hier der Preis: 0,000036 $ je Zeile. 100 Domains kosten 0,028 $,
 * 1000 Domains 0,06 $. Für die Frage "wer verlinkt die Wettbewerber, uns aber
 * nicht" reichen die stärksten hundert fast immer.
 */
export async function verweisendeDomains(
  ziel: string,
  limit = 100,
  optionen: { mitSubdomains?: boolean; tag?: string } = {},
): Promise<VerweisendeDomain[]> {
  const adresse = zielBereinigen(ziel);
  if (!adresse) {
    throw new DataForSeoFehler("verweisendeDomains: leeres Ziel.", { ebene: "konfiguration" });
  }

  const { ergebnis } = await anfrage(["backlinks", "referring_domains", "live"], {
    aufgabe: {
      target: adresse,
      limit: Math.min(Math.max(1, limit), 1000),
      include_subdomains: optionen.mitSubdomains !== false,
      backlinks_status_type: "live",
      order_by: ["rank,desc"],
      tag: optionen.tag,
    },
  });

  return liste(feld(ergebnis[0], "items")).map((eintrag) => {
    const item = objekt(eintrag);
    return {
      domain: text(item.domain) ?? "",
      rang: zahl(item.rank),
      backlinks: zahl(item.backlinks),
      dofollow: zahl(item.dofollow),
      spamScore: zahl(item.backlinks_spam_score),
      defekteBacklinks: zahl(item.broken_backlinks),
      erstmalsGesehen: text(item.first_seen),
      verlorenAm: text(item.lost_date),
    };
  });
}

/** Eine Domain mit überlappendem Backlink-Profil. */
export interface BacklinkWettbewerber {
  ziel: string;
  rang: number | null;
  backlinks: number | null;
  /** Wie viele verweisende Domains man sich teilt — die Liste der Link-Chancen. */
  ueberschneidungen: number | null;
  verweisendeDomains: number | null;
  /** Rang der Hauptdomain, falls das Ziel eine Subdomain ist. */
  hauptdomainRang: number | null;
}

/**
 * Domains, deren Backlink-Profil sich mit dem eigenen überschneidet.
 *
 * Anders als {@link wettbewerberDomains} (gemeinsame Keywords) geht es hier um
 * gemeinsame *Linkquellen*. Wer auf drei Wettbewerber verlinkt und auf einen
 * nicht, ist die naheliegendste Adresse für einen Gastbeitrag.
 */
export async function backlinkWettbewerber(
  ziel: string,
  optionen: { limit?: number; tag?: string } = {},
): Promise<BacklinkWettbewerber[]> {
  const adresse = zielBereinigen(ziel);
  if (!adresse) {
    throw new DataForSeoFehler("backlinkWettbewerber: leeres Ziel.", { ebene: "konfiguration" });
  }

  const { ergebnis } = await anfrage(["backlinks", "competitors", "live"], {
    aufgabe: {
      target: adresse,
      limit: Math.min(Math.max(1, optionen.limit ?? 20), 1000),
      order_by: ["intersections,desc"],
      tag: optionen.tag,
    },
  });

  return liste(feld(ergebnis[0], "items")).map((eintrag) => {
    const item = objekt(eintrag);
    return {
      ziel: text(item.target) ?? "",
      rang: zahl(item.rank),
      backlinks: zahl(item.backlinks),
      ueberschneidungen: zahl(item.intersections),
      verweisendeDomains: zahl(item.referring_domains),
      hauptdomainRang: zahl(item.main_domain_rank),
    };
  });
}

// ---------------------------------------------------------------------------
// Konto
// ---------------------------------------------------------------------------

/** Was das DataForSEO-Konto über sich selbst sagt. */
export interface Kontostand {
  login: string | null;
  /** Verfügbares Guthaben in USD. */
  guthabenUsd: number | null;
  /** Insgesamt aufgeladen. */
  aufgeladenUsd: number | null;
  /** Vom Account gesetztes Tageslimit — greift serverseitig mit `40203`. */
  tageslimitUsd: number | null;
  /** Erlaubte Anfragen pro Minute. */
  limitProMinute: number | null;
  /** Ob dieser Lauf gegen die Sandbox spricht — dann sind alle Zahlen Attrappe. */
  sandbox: boolean;
}

/**
 * Guthaben und Limits des Kontos.
 *
 * Der einzige `GET` in diesem Modul und der einzige kostenlose Aufruf — deshalb
 * der richtige Vorabcheck für ein langes Recherche-Skript: erst fragen, ob
 * genug Guthaben da ist, dann tausend Keywords starten und nach dreihundert an
 * `40210` scheitern.
 */
export async function kontostand(): Promise<Kontostand> {
  const { ergebnis } = await anfrage(["appendix", "user_data"], { methode: "GET" });
  const wurzel = objekt(ergebnis[0]);

  return {
    login: text(wurzel.login),
    guthabenUsd: zahl(feld(wurzel, "money", "balance")),
    aufgeladenUsd: zahl(feld(wurzel, "money", "total")),
    tageslimitUsd: zahl(feld(wurzel, "money", "limits", "day")),
    limitProMinute: zahl(feld(wurzel, "rates", "limits", "minute")),
    sandbox: istSandbox(),
  };
}
