import { melde, warne } from "./protokoll.js";

/**
 * Der Zugang der Blog-Automatik zur Anthropic Messages API.
 *
 * **Warum kein SDK.** Gebraucht werden genau zwei Dinge: eine Frage stellen und
 * ein Objekt nach vorgegebenem Schema zurückbekommen. Das offizielle SDK bringt
 * dafür einen Abhängigkeitsbaum mit, der bei jedem `npm audit` mitläuft und bei
 * jedem Major-Sprung nachgezogen werden will — für einen Aufruf, der aus
 * eingebautem `fetch`, drei Headern und einem JSON-Körper besteht. Der Preis
 * dieser Entscheidung steht in derselben Zeile: **Modell-IDs, Parameternamen
 * und Beta-Kennungen pflegt hier niemand außer uns.** Wer sie ändert, prüft sie
 * gegen die aktuelle Doku, nicht gegen die Erinnerung.
 *
 * **Was dieses Modul verhindert, ist teurer als das, was es kann:**
 *
 *  - **Kostenbremse.** `ANTHROPIC_TAGESLIMIT_TOKEN` (Standard 2 Mio.) bricht ab,
 *    bevor eine Schleife über zwanzig Themen zu einer dreistelligen Rechnung
 *    wird. Ein Artikel kostet über alle neun Schritte grob 60.000 bis 120.000
 *    Token; das Limit lässt also ungefähr zwanzig Artikel je Prozesslauf zu.
 *  - **Wiederholen mit wachsendem Abstand.** 429 und 5xx sind bei einem
 *    Batchlauf Normalbetrieb, kein Ausnahmefall. Wer sie durchreicht, verliert
 *    nach vier Minuten Recherche den ganzen Artikel an eine Sekunde Überlast.
 *  - **Zwischenspeicher für den System-Prompt.** Der Hausstil ist mehrere
 *    tausend Token lang und geht bei jedem Artikel unverändert mit. Ohne
 *    `cache_control` wird er jedes Mal voll bezahlt.
 *
 * Doku: https://docs.anthropic.com/en/api/messages
 */

/* -------------------------------------------------------------------------- */
/* Modellwahl                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Das Modell, das den Artikel selbst schreibt.
 *
 * **Hier wird nicht gespart.** Der Text ist das Produkt: Er trägt den Namen
 * eines Menschen als Autor, steht öffentlich unter unserer Domain und wird an
 * einem Qualitätstor gemessen, das 39 harte Regeln kennt. Jeder Durchgang, den
 * ein schwächeres Modell zusätzlich braucht, kostet die vollen Eingabetoken des
 * ganzen Briefings noch einmal — die vermeintliche Ersparnis dreht sich beim
 * zweiten Nachbessern bereits um.
 *
 * Opus 5 kostet 5 $ je Mio. Eingabe- und 25 $ je Mio. Ausgabetoken. Ein
 * fertiger Artikel liegt damit im niedrigen einstelligen Eurobereich. Das ist
 * die günstigste Position der ganzen Rechnung — Recherche und SERP-Abfragen
 * kosten mehr.
 */
export const MODELL_SCHREIBEN = "claude-opus-5";

/**
 * Das Modell für alles, was Struktur ist und nicht Prosa: Gliederung,
 * Extraktion aus gelesenen Seiten, Bewertung von Themen, Vorschläge für interne
 * Links.
 *
 * Diese Schritte haben eine **prüfbare richtige Antwort** und geben ihr Ergebnis
 * über ein Schema zurück — die Form ist erzwungen, nur der Inhalt zählt. Genau
 * dort ist der Unterschied zwischen den Modellklassen klein und der Preisunter-
 * schied groß: Sonnet 5 kostet 3 $ statt 5 $ je Mio. Eingabe- und 15 $ statt
 * 25 $ je Mio. Ausgabetoken. Schritt 04 schiebt zehn Volltexte durch das
 * Modell; das ist die Stelle im Lauf, an der Eingabetoken wirklich anfallen.
 *
 * ⚠️ **Nicht für den Artikel verwenden.** Wer hier spart, spart am Sichtbaren.
 */
export const MODELL_STRUKTUR = "claude-sonnet-5";

/**
 * Modelle, die Sampling-Parameter (`temperature`, `top_p`, `top_k`) **nicht**
 * mehr annehmen — sie antworten darauf mit HTTP 400.
 *
 * Das ist die häufigste Falle beim Übertragen von älterem Beispielcode: Ein
 * `temperature: 0.3`, das seit Jahren in jedem Snippet steht, macht auf diesen
 * Modellen aus einem funktionierenden Aufruf einen harten Fehler. Statt den
 * Wunsch stillschweigend zu erfüllen oder den Lauf daran scheitern zu lassen,
 * verwirft `frage()` den Wert mit einer Warnung — die Steuerung der Streuung
 * läuft auf diesen Modellen über den Prompt, nicht über einen Regler.
 */
const OHNE_SAMPLING: ReadonlySet<string> = new Set([
  "claude-opus-5",
  "claude-opus-4-8",
  "claude-opus-4-7",
  "claude-sonnet-5",
  "claude-fable-5",
  "claude-mythos-5",
]);

/* -------------------------------------------------------------------------- */
/* Fehlerklassen                                                              */
/* -------------------------------------------------------------------------- */

/** Auf welcher Ebene es geklemmt hat — bestimmt, was zu tun ist. */
export type Fehlerebene = "konfiguration" | "budget" | "netzwerk" | "http" | "antwort";

/**
 * Ein Fehler aus dem Claude-Weg, mit der Information, die zur Diagnose wirklich
 * gebraucht wird: welche Ebene, welcher HTTP-Code, ob ein zweiter Versuch
 * überhaupt Sinn ergeben hätte.
 */
export class ClaudeFehler extends Error {
  readonly ebene: Fehlerebene;
  readonly statusCode: number | null;
  readonly wiederholbar: boolean;

  constructor(
    nachricht: string,
    optionen: { ebene: Fehlerebene; statusCode?: number | null; wiederholbar?: boolean },
  ) {
    super(nachricht);
    this.name = "ClaudeFehler";
    this.ebene = optionen.ebene;
    this.statusCode = optionen.statusCode ?? null;
    this.wiederholbar = optionen.wiederholbar ?? false;
  }
}

/** Es fehlt etwas in der Umgebung. Kein Netzwerkweg, kein Wiederholen. */
export class ClaudeKonfigFehler extends ClaudeFehler {
  constructor(nachricht: string) {
    super(nachricht, { ebene: "konfiguration" });
    this.name = "ClaudeKonfigFehler";
  }
}

/** Das Tokenlimit dieses Prozesslaufs ist aufgebraucht. */
export class ClaudeBudgetFehler extends ClaudeFehler {
  constructor(nachricht: string) {
    super(nachricht, { ebene: "budget" });
    this.name = "ClaudeBudgetFehler";
  }
}

/* -------------------------------------------------------------------------- */
/* Zugangsdaten                                                               */
/* -------------------------------------------------------------------------- */

const BASIS_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";

/**
 * Holt den Schlüssel oder bricht mit einer Meldung ab, die sagt, was zu tun ist.
 *
 * Bewusst **nicht** beim Import geprüft: Sonst könnte niemand dieses Modul
 * importieren, um nur `getTokenverbrauch()` zu lesen oder eine Typdefinition zu
 * verwenden. Der Aufrufer, der früh scheitern will, ruft `pruefeUmgebung()`.
 */
function schluessel(): string {
  const wert = process.env.ANTHROPIC_API_KEY;
  if (!wert) {
    throw new ClaudeKonfigFehler(
      "ANTHROPIC_API_KEY ist nicht gesetzt. Eintragen in die lokale .env " +
        "(Vorlage: .env.example), in Coolify als Runtime-Variable. Ohne " +
        "NEXT_PUBLIC_-Präfix — mit Präfix stünde der Schlüssel im Client-Bundle " +
        "und wäre im Quelltext jeder ausgelieferten Seite lesbar.",
    );
  }
  return wert;
}

/**
 * Prüft die Umgebung, ohne eine Anfrage zu stellen — für Skripte, die früh
 * abbrechen wollen, statt nach zehn Minuten Recherche über einen fehlenden
 * Schlüssel zu stolpern.
 */
export function pruefeUmgebung(): void {
  schluessel();
}

/* -------------------------------------------------------------------------- */
/* Tokenerfassung und Limit                                                   */
/* -------------------------------------------------------------------------- */

const TAGESLIMIT_STANDARD = 2_000_000;

/**
 * Das Limit aus der Umgebung, mit 2 Mio. als Rückfall.
 *
 * Unbrauchbare Werte (keine Zahl, negativ) fallen auf den Standard zurück statt
 * auf 0 — eine 0 würde jeden Aufruf blockieren und wie ein kaputter Client
 * aussehen statt wie ein Tippfehler in der `.env`.
 */
function tageslimit(): number {
  const roh = process.env.ANTHROPIC_TAGESLIMIT_TOKEN;
  if (!roh) return TAGESLIMIT_STANDARD;
  const wert = Number.parseInt(roh, 10);
  if (!Number.isFinite(wert) || wert <= 0) return TAGESLIMIT_STANDARD;
  return wert;
}

const verbrauch = {
  ein: 0,
  aus: 0,
  cacheGeschrieben: 0,
  cacheGelesen: 0,
  anfragen: 0,
};

export interface Tokenverbrauch {
  /** Eingabetoken ohne Zwischenspeicher. */
  ein: number;
  /** Ausgabetoken. */
  aus: number;
  /** In den Zwischenspeicher geschrieben — kostet das 1,25-Fache. */
  cacheGeschrieben: number;
  /** Aus dem Zwischenspeicher gelesen — kostet ein Zehntel. */
  cacheGelesen: number;
  anfragen: number;
  /** Summe über alle vier Arten. Das ist die Zahl, gegen die das Limit prüft. */
  gesamt: number;
  tageslimit: number;
  /** Was noch übrig ist, nie negativ. */
  rest: number;
}

/**
 * Der laufende Tokenstand.
 *
 * **Alle vier Arten zählen mit.** Zwischengespeicherte Eingabetoken kosten nur
 * ein Zehntel, sind aber Token — würde man sie herausrechnen, ließe sich das
 * Limit mit einem langen, gecachten System-Prompt beliebig überziehen und die
 * Bremse wäre keine.
 *
 * ⚠️ Der Zähler lebt **im Prozess**. Zehn Skriptläufe hintereinander zählen
 * zehnmal von vorn; das Limit bremst einen Durchlauf, nicht einen Tag. Eine
 * echte Tagesgrenze gehört zusätzlich in die Anthropic Console.
 */
export function getTokenverbrauch(): Tokenverbrauch {
  const gesamt =
    verbrauch.ein + verbrauch.aus + verbrauch.cacheGeschrieben + verbrauch.cacheGelesen;
  const limit = tageslimit();
  return {
    ein: verbrauch.ein,
    aus: verbrauch.aus,
    cacheGeschrieben: verbrauch.cacheGeschrieben,
    cacheGelesen: verbrauch.cacheGelesen,
    anfragen: verbrauch.anfragen,
    gesamt,
    tageslimit: limit,
    rest: Math.max(0, limit - gesamt),
  };
}

/** Nur für Tests und Skripte, die mehrere Budgets nacheinander fahren. */
export function setzeTokenverbrauchZurueck(): void {
  verbrauch.ein = 0;
  verbrauch.aus = 0;
  verbrauch.cacheGeschrieben = 0;
  verbrauch.cacheGelesen = 0;
  verbrauch.anfragen = 0;
}

/**
 * Die Bremse: Vor jedem Versuch muss noch Budget da sein.
 *
 * Geprüft wird **vorher gegen das bereits Verbrauchte**, nicht gegen eine
 * Schätzung der kommenden Anfrage — deren Größe kennt niemand vorab. Die letzte
 * Anfrage darf das Limit also überschreiten, die nächste kommt nicht mehr
 * durch. Das ist gewollt: Eine Vorabschätzung läge immer daneben und würde
 * entweder zu früh blockieren oder zu spät.
 */
function pruefeBudget(): void {
  const stand = getTokenverbrauch();
  if (stand.gesamt >= stand.tageslimit) {
    throw new ClaudeBudgetFehler(
      `Tokenlimit dieses Laufs erreicht: ${stand.gesamt} von ${stand.tageslimit} Token ` +
        `verbraucht (${stand.anfragen} Anfragen). Der Lauf bricht hier ab, statt weiter ` +
        "abzurechnen. Limit anheben über ANTHROPIC_TAGESLIMIT_TOKEN — vorher nachsehen, " +
        "ob nicht eine Schleife den Verbrauch erklärt.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Zwischenspeicher für den System-Prompt                                     */
/* -------------------------------------------------------------------------- */

/**
 * Ab wie vielen Zeichen der System-Prompt zum Zwischenspeichern markiert wird.
 *
 * Die API speichert erst ab **1024 Token** — kürzere Prefixe werden ohne
 * Fehlermeldung einfach nicht gespeichert. Deutscher Fließtext liegt bei grob
 * 3,4 Zeichen je Token; 4200 Zeichen entsprechen damit rund 1230 Token und
 * halten Abstand zur Grenze, statt knapp darunter zu landen und den Aufschlag
 * fürs Schreiben ohne den Rabatt fürs Lesen zu zahlen.
 *
 * ⚠️ **Die Schätzung ist eine Schätzung.** Ob wirklich gespeichert wurde, sagt
 * nur `usage.cache_creation_input_tokens` bzw. `cache_read_input_tokens` in der
 * Antwort — beides landet in `getTokenverbrauch()`. Bleibt `cacheGelesen` über
 * mehrere Artikel bei null, ist etwas im Prefix nicht stabil.
 *
 * ⚠️ **Reihenfolge des Prefix: `tools` → `system` → `messages`.** Eine Marke am
 * System-Prompt speichert alles davor mit, also auch die Werkzeugdefinition.
 * Wechselt das Schema zwischen zwei Aufrufen, ist der Zwischenspeicher hin —
 * das Sparen wirkt beim Schreib-Prompt, der bei jedem Artikel identisch ist,
 * nicht bei wechselnden Strukturabfragen.
 */
const CACHE_MINDESTZEICHEN = 4200;

/* -------------------------------------------------------------------------- */
/* Wiederholen                                                                */
/* -------------------------------------------------------------------------- */

const MAX_VERSUCHE = 5;
const BACKOFF_BASIS_MS = 1500;
const BACKOFF_DECKEL_MS = 60_000;

/**
 * Codes, bei denen ein zweiter Versuch Sinn ergibt: Das Problem liegt an der
 * Taktung oder an der anderen Seite, nicht an der Anfrage. Alles andere —
 * falsches Feld, ungültiger Schlüssel, zu langer Prompt — wird durch
 * Wiederholen nur langsamer.
 *
 * 529 ist `overloaded_error`: Das Modell ist gerade überlastet. Genau dafür ist
 * das Warten gedacht.
 */
const WIEDERHOLBARE_CODES: ReadonlySet<number> = new Set([408, 409, 429, 500, 502, 503, 504, 529]);

/**
 * Wie lange gewartet wird.
 *
 * `retry-after` der API schlägt jede eigene Rechnung — die andere Seite weiß
 * besser, wann sie wieder kann. Ohne diesen Header verdoppelt sich der Abstand
 * je Versuch, mit einem Zufallsanteil: Ohne den laufen mehrere gleichzeitig
 * gestartete Artikel im Gleichtakt in dieselbe nächste Überlast.
 */
function wartezeitMs(versuch: number, retryAfter: string | null): number {
  if (retryAfter) {
    const sekunden = Number.parseFloat(retryAfter);
    if (Number.isFinite(sekunden) && sekunden >= 0) {
      return Math.min(BACKOFF_DECKEL_MS, Math.ceil(sekunden * 1000) + 250);
    }
  }
  const grund = Math.min(BACKOFF_DECKEL_MS, BACKOFF_BASIS_MS * 2 ** (versuch - 1));
  return grund + Math.floor(Math.random() * 500);
}

const schlafe = (ms: number): Promise<void> => new Promise((weiter) => setTimeout(weiter, ms));

/* -------------------------------------------------------------------------- */
/* Antwortform der API                                                        */
/* -------------------------------------------------------------------------- */

interface InhaltsBlock {
  type: string;
  text?: string;
  name?: string;
  input?: unknown;
}

interface ApiVerbrauch {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

interface ApiAntwort {
  content?: InhaltsBlock[];
  stop_reason?: string;
  stop_details?: { type?: string; category?: string | null; explanation?: string | null } | null;
  usage?: ApiVerbrauch;
  model?: string;
}

interface ApiFehlerkoerper {
  error?: { type?: string; message?: string };
}

/** Antwortkörper lesen, ohne dass ein kaputtes JSON die Diagnose verdeckt. */
async function alsJson(antwort: Response): Promise<unknown> {
  const roh = await antwort.text();
  try {
    return JSON.parse(roh) as unknown;
  } catch {
    return { error: { type: "kein_json", message: roh.slice(0, 400) } } satisfies ApiFehlerkoerper;
  }
}

/* -------------------------------------------------------------------------- */
/* Rückfall bei Ablehnung                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Serverseitiger Rückfall, falls ein Sicherheitsklassifikator die Anfrage
 * ablehnt (`stop_reason: "refusal"`).
 *
 * Bei einem Batchlauf ist eine Ablehnung sonst das Ende des Artikels — und
 * ausgerechnet Fachtexte über Angriffe, Haftung oder Gesetzeslagen können sie
 * auslösen. Mit dem Rückfall führt dieselbe Anfrage innerhalb desselben Aufrufs
 * ein anderes Modell zu Ende; abgerechnet wird zu dessen Sätzen.
 *
 * **Es ist ein Beta-Merkmal.** Sollte die Kennung eines Tages nicht mehr gelten
 * oder für dieses Konto nicht freigeschaltet sein, antwortet die API mit 400 —
 * und ohne die Notbremse unten würde daran *jeder* Aufruf des Laufs scheitern,
 * nicht nur der abgelehnte. Deshalb: einmal ohne Rückfall wiederholen, warnen,
 * und für den Rest des Prozesses darauf verzichten.
 */
const FALLBACK_BETA = "server-side-fallback-2026-07-01";
let fallbackAktiv = true;

function siehtNachFallbackFehlerAus(koerper: unknown): boolean {
  const text = JSON.stringify(koerper ?? "").toLowerCase();
  return text.includes("fallback") || text.includes("beta");
}

/* -------------------------------------------------------------------------- */
/* Die eine Frage                                                             */
/* -------------------------------------------------------------------------- */

/** JSON Schema, so wie die API es erwartet. */
export type JsonSchema = Record<string, unknown>;

export interface FrageOptionen {
  /**
   * Der System-Prompt. Bei langen, gleichbleibenden Prompts (Hausstil) wird er
   * automatisch zum Zwischenspeichern markiert.
   *
   * ⚠️ **Nichts Wechselndes hineinschreiben.** Ein Datum, eine Lauf-Kennung
   * oder ein Artikelname im System-Prompt macht den Zwischenspeicher wertlos,
   * ohne dass es irgendwo auffällt — außer an der Rechnung.
   */
  system: string;
  /** Die eigentliche Aufgabe. Alles Wechselnde gehört hierhin. */
  nachricht: string;
  /** `MODELL_SCHREIBEN` oder `MODELL_STRUKTUR`. */
  modell: string;
  maxTokens: number;
  /**
   * Streuung. Wird auf Modellen aus `OHNE_SAMPLING` verworfen — dort antwortet
   * die API auf `temperature` mit 400.
   */
  temperatur?: number;
  /**
   * Mit Schema wird ein Werkzeug erzwungen und dessen geprüfte Eingabe
   * zurückgegeben. Ohne Schema kommt der Text.
   */
  schema?: JsonSchema;
  /** Kurzname für das Protokoll, z. B. `"gliederung"`. */
  zweck?: string;
}

/** Name des erzwungenen Werkzeugs. Taucht nur im Protokoll der API auf. */
const WERKZEUG_NAME = "antwort";

/**
 * Timeout einer einzelnen Anfrage.
 *
 * Bewusst großzügig: Ein vollständiger Artikel mit 16.000 Ausgabetoken läuft
 * mehrere Minuten, und ein Abbruch mitten darin wirft die Arbeit weg, ohne die
 * verbrauchten Token zurückzugeben. Hier wartet ein Skript, kein Besucher.
 *
 * Ein Timeout wird **nicht** wiederholt: Was einmal in fünfzehn Minuten nicht
 * fertig wurde, wird es beim zweiten Mal meist auch nicht — und der zweite
 * Versuch kostet noch einmal eine Viertelstunde.
 */
function timeoutMs(): number {
  const roh = process.env.ANTHROPIC_TIMEOUT_MS;
  const wert = roh ? Number.parseInt(roh, 10) : NaN;
  return Number.isFinite(wert) && wert > 0 ? wert : 900_000;
}

/**
 * Stellt eine Frage und gibt die Antwort zurück — als Text, oder mit `schema`
 * als geprüftes Objekt.
 *
 * `T` beschreibt nur die Schema-Antwort; **ohne `schema` ist das Ergebnis immer
 * eine Zeichenkette**, weshalb `string` die Vorgabe ist. Die Typvariable ist
 * eine Zusage des Aufrufers an sich selbst: Sie muss zu dem Schema passen, das
 * er übergibt.
 */
export async function frage<T = string>(optionen: FrageOptionen): Promise<T> {
  const { system, nachricht, modell, maxTokens, temperatur, schema, zweck } = optionen;
  const bezeichnung = zweck ?? (schema ? "strukturierte Antwort" : "Text");

  const kopf: Record<string, string> = {
    "content-type": "application/json",
    "x-api-key": schluessel(),
    "anthropic-version": API_VERSION,
  };

  const systemBlock: Record<string, unknown> = { type: "text", text: system };
  if (system.length >= CACHE_MINDESTZEICHEN) {
    systemBlock.cache_control = { type: "ephemeral" };
  }

  const koerper: Record<string, unknown> = {
    model: modell,
    max_tokens: maxTokens,
    system: [systemBlock],
    messages: [{ role: "user", content: nachricht }],
  };

  if (temperatur !== undefined) {
    if (OHNE_SAMPLING.has(modell)) {
      warne("temperatur wird verworfen — dieses Modell nimmt keine Sampling-Parameter", {
        modell,
        temperatur,
      });
    } else {
      koerper.temperature = temperatur;
    }
  }

  if (schema) {
    /* `strict` garantiert, dass die Eingabe des Werkzeugs exakt zum Schema
       passt — verlangt dafür aber `additionalProperties: false` und ein
       `required`. Fehlt eines davon, antwortet die API mit 400. Statt das
       Schema des Aufrufers hinter seinem Rücken umzuschreiben, wird `strict`
       nur gesetzt, wenn es erfüllbar ist; sonst greift die Formprüfung unten. */
    const streng = schema.additionalProperties === false && Array.isArray(schema.required);

    koerper.tools = [
      {
        name: WERKZEUG_NAME,
        description:
          "Gib das Ergebnis ausschließlich über dieses Werkzeug zurück, " +
          "vollständig und im vorgegebenen Format.",
        input_schema: schema,
        ...(streng ? { strict: true } : {}),
      },
    ];
    /* Erzwungen statt freigestellt: Ohne das antwortet das Modell manchmal in
       Prosa, und ein Schritt, der ein Objekt erwartet, bekommt einen Aufsatz.
       `disable_parallel_tool_use` verhindert zwei konkurrierende Antworten. */
    koerper.tool_choice = {
      type: "tool",
      name: WERKZEUG_NAME,
      disable_parallel_tool_use: true,
    };
  }

  let letzterFehler: ClaudeFehler | null = null;

  for (let versuch = 1; versuch <= MAX_VERSUCHE; versuch++) {
    pruefeBudget();

    const kopfDiesmal = fallbackAktiv ? { ...kopf, "anthropic-beta": FALLBACK_BETA } : kopf;
    const koerperDiesmal = fallbackAktiv ? { ...koerper, fallbacks: "default" } : koerper;

    let antwort: Response;
    try {
      antwort = await fetch(BASIS_URL, {
        method: "POST",
        headers: kopfDiesmal,
        body: JSON.stringify(koerperDiesmal),
        signal: AbortSignal.timeout(timeoutMs()),
      });
    } catch (ausnahme: unknown) {
      const abgelaufen = ausnahme instanceof Error && ausnahme.name === "TimeoutError";
      const grund = ausnahme instanceof Error ? ausnahme.message : String(ausnahme);

      letzterFehler = new ClaudeFehler(
        abgelaufen
          ? `Anfrage an Claude lief in die Zeitüberschreitung (${timeoutMs()} ms, ${bezeichnung}). ` +
            "Bei sehr langen Artikeln ANTHROPIC_TIMEOUT_MS erhöhen."
          : `Anfrage an Claude kam nicht durch (${bezeichnung}): ${grund}`,
        { ebene: "netzwerk", wiederholbar: !abgelaufen },
      );

      if (abgelaufen || versuch === MAX_VERSUCHE) throw letzterFehler;
      await schlafe(wartezeitMs(versuch, null));
      continue;
    }

    if (!antwort.ok) {
      const koerperFehler = (await alsJson(antwort)) as ApiFehlerkoerper;
      const meldung = koerperFehler.error?.message ?? antwort.statusText;
      const art = koerperFehler.error?.type ?? "unbekannt";

      /* Notbremse: Wenn die Beta-Kennung für den Rückfall der Grund für den 400
         ist, denselben Aufruf sofort ohne sie wiederholen — statt jeden
         weiteren Aufruf dieses Laufs daran scheitern zu lassen. */
      if (antwort.status === 400 && fallbackAktiv && siehtNachFallbackFehlerAus(koerperFehler)) {
        fallbackAktiv = false;
        warne("Serverseitiger Rückfall wird für diesen Lauf abgeschaltet", { grund: meldung });
        continue;
      }

      const wiederholbar = WIEDERHOLBARE_CODES.has(antwort.status);
      letzterFehler = new ClaudeFehler(
        `Claude antwortete mit HTTP ${antwort.status} (${art}, ${bezeichnung}): ${meldung}`,
        { ebene: "http", statusCode: antwort.status, wiederholbar },
      );

      if (!wiederholbar || versuch === MAX_VERSUCHE) throw letzterFehler;

      const warten = wartezeitMs(versuch, antwort.headers.get("retry-after"));
      melde("Claude überlastet oder gedrosselt, neuer Versuch", {
        status: antwort.status,
        versuch,
        wartenMs: warten,
      });
      await schlafe(warten);
      continue;
    }

    const daten = (await alsJson(antwort)) as ApiAntwort;
    buchen(daten.usage);

    return auswerten<T>(daten, schema, bezeichnung, modell);
  }

  /* Unerreichbar: Die Schleife wirft oder gibt zurück. Der Wurf hier hält die
     Zusage des Rückgabetyps, ohne ein `undefined` durchzulassen. */
  throw (
    letzterFehler ??
    new ClaudeFehler(`Claude lieferte keine Antwort (${bezeichnung})`, { ebene: "http" })
  );
}

/** Verbrauch aus der Antwort übernehmen. Fehlende Felder zählen als null. */
function buchen(nutzung: ApiVerbrauch | undefined): void {
  verbrauch.anfragen += 1;
  if (!nutzung) return;
  verbrauch.ein += nutzung.input_tokens ?? 0;
  verbrauch.aus += nutzung.output_tokens ?? 0;
  verbrauch.cacheGeschrieben += nutzung.cache_creation_input_tokens ?? 0;
  verbrauch.cacheGelesen += nutzung.cache_read_input_tokens ?? 0;
}

/**
 * Aus der Antwort das machen, was der Aufrufer bestellt hat — und bei allem,
 * was nach halber Arbeit aussieht, abbrechen.
 *
 * **Eine abgeschnittene Antwort ist kein Ergebnis.** Bei `max_tokens` bricht das
 * Modell mitten im Satz ab; bei einem Schema ist das entstandene JSON
 * unvollständig und der halbe Artikel wäre trotzdem bezahlt. Lieber ein Fehler,
 * den der Aufrufer sieht, als ein Torso, der durch das Qualitätstor rutscht.
 */
function auswerten<T>(
  daten: ApiAntwort,
  schema: JsonSchema | undefined,
  bezeichnung: string,
  modell: string,
): T {
  if (daten.stop_reason === "refusal") {
    const kategorie = daten.stop_details?.category ?? "ohne Angabe";
    throw new ClaudeFehler(
      `Claude hat die Anfrage abgelehnt (${bezeichnung}, Kategorie: ${kategorie}). ` +
        "Das Thema oder die Formulierung des Prompts anpassen — Wiederholen hilft nicht.",
      { ebene: "antwort" },
    );
  }

  if (daten.stop_reason === "max_tokens") {
    throw new ClaudeFehler(
      `Die Antwort wurde an der Token-Obergrenze abgeschnitten (${bezeichnung}, Modell ` +
        `${modell}). maxTokens erhöhen oder die Aufgabe kleiner schneiden — ein halber ` +
        "Artikel ist kein Artikel.",
      { ebene: "antwort" },
    );
  }

  const bloecke = daten.content ?? [];

  if (!schema) {
    const text = bloecke
      .filter((block) => block.type === "text" && typeof block.text === "string")
      .map((block) => block.text as string)
      .join("\n")
      .trim();

    if (text.length === 0) {
      throw new ClaudeFehler(`Claude lieferte einen leeren Text (${bezeichnung})`, {
        ebene: "antwort",
      });
    }
    return text as unknown as T;
  }

  const werkzeug = bloecke.find(
    (block) => block.type === "tool_use" && block.name === WERKZEUG_NAME,
  );

  if (!werkzeug || werkzeug.input === undefined || werkzeug.input === null) {
    throw new ClaudeFehler(
      `Claude hat das erzwungene Werkzeug nicht benutzt (${bezeichnung}, ` +
        `stop_reason: ${daten.stop_reason ?? "unbekannt"}).`,
      { ebene: "antwort" },
    );
  }

  pruefeForm(werkzeug.input, schema, bezeichnung);
  return werkzeug.input as T;
}

/**
 * Die Form der Antwort gegen das Schema halten — die Pflichtfelder, nicht mehr.
 *
 * **Absichtlich keine vollständige JSON-Schema-Prüfung.** Die käme nur mit einer
 * weiteren Abhängigkeit, und die eigentliche Arbeit macht ohnehin die API: Mit
 * `strict: true` garantiert sie die Einhaltung. Was hier bleibt, ist der Fall
 * ohne `strict` — und dort ist genau eine Frage praktisch relevant: Fehlt ein
 * Pflichtfeld? Ein Schritt, der auf `brief.eigenanteil` zugreift, soll das hier
 * erfahren und nicht drei Funktionen später an einem `undefined`.
 */
function pruefeForm(wert: unknown, schema: JsonSchema, bezeichnung: string): void {
  if (schema.type !== "object") return;

  if (typeof wert !== "object" || wert === null || Array.isArray(wert)) {
    throw new ClaudeFehler(
      `Claude lieferte kein Objekt, obwohl das Schema eines verlangt (${bezeichnung})`,
      { ebene: "antwort" },
    );
  }

  const pflicht = Array.isArray(schema.required) ? schema.required : [];
  const fehlend = pflicht
    .filter((feld): feld is string => typeof feld === "string")
    .filter((feld) => !(feld in (wert as Record<string, unknown>)));

  if (fehlend.length > 0) {
    throw new ClaudeFehler(
      `In der Antwort fehlen Pflichtfelder (${bezeichnung}): ${fehlend.join(", ")}`,
      { ebene: "antwort" },
    );
  }
}
