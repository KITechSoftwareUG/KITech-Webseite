/**
 * OpenAI als zweiter Anbieter neben Anthropic.
 *
 * **Warum es diese Datei gibt.** Die Engine war auf Anthropic gebaut; am
 * 26.08.2026 lag ein OpenAI-Schlüssel vor und keiner von Anthropic. Statt die
 * fünf Schritte umzuschreiben, die `frage()` aufrufen, sitzt der Unterschied
 * hier — die Schnittstelle bleibt dieselbe.
 *
 * **Was sich zwischen den beiden APIs unterscheidet:**
 *
 * | | Anthropic | OpenAI |
 * |---|---|---|
 * | Anmeldung | `x-api-key` | `Authorization: Bearer` |
 * | System-Anweisung | eigenes Feld `system` | erste Nachricht mit `role: "system"` |
 * | Erzwungenes Format | Werkzeug mit `input_schema` | `response_format` mit `json_schema` |
 * | Tokenzählung | `input_tokens` / `output_tokens` | `prompt_tokens` / `completion_tokens` |
 * | Zwischenspeicher | `cache_control` je Block | automatisch ab 1024 Token |
 *
 * Der Zwischenspeicher ist der Grund, warum hier nichts gesetzt wird: OpenAI
 * macht das von selbst, sobald der Anfang zweier Anfragen übereinstimmt. Der
 * Hausstil-Prompt ist über 10.000 Zeichen lang und steht immer vorn — die
 * Bedingung ist also erfüllt, ohne dass jemand etwas markiert.
 */

import { melde, warne } from "./protokoll.js";

const BASIS_URL = "https://api.openai.com/v1/chat/completions";

/**
 * Modell für die eigentliche Schreibarbeit.
 *
 * `gpt-5.5` statt einer `-pro`-Variante: Der Unterschied zeigt sich bei
 * Aufgaben mit langer Herleitung, nicht beim Schreiben nach einem Hausstil, der
 * 81 Regeln vorgibt. Der Preis unterscheidet sich dagegen deutlich.
 */
export const OPENAI_MODELL_SCHREIBEN = "gpt-5.5";

/** Für Gliederung, Prüfung und Einhängen — die Schritte ohne Fließtext. */
export const OPENAI_MODELL_STRUKTUR = "gpt-5.4-mini";

/**
 * Modelle, die keine Sampling-Parameter annehmen.
 *
 * Die Reasoning-Reihe (`o3`, `o4`) verwirft `temperature` nicht still, sondern
 * antwortet mit HTTP 400. Ein Lauf, der daran scheitert, hat den Prompt schon
 * bezahlt.
 */
const OHNE_SAMPLING = new Set(["o3", "o3-mini", "o4-mini"]);

/**
 * Ein flaches Ergebnisobjekt statt einer unterschiedenen Vereinigung.
 *
 * Im Projekt ist `strictNullChecks` abgeschaltet (siehe tsconfig.json). Ohne
 * das verengt TypeScript `{ ok: true } | { ok: false }` nicht zuverlässig, und
 * der Aufrufer bekommt Fehler auf Feldern, die es im jeweiligen Zweig sehr wohl
 * gibt. Ein flaches Objekt ist hier ehrlicher als eine Typkonstruktion, die die
 * Projektkonfiguration nicht trägt.
 */
export interface OpenAiErgebnis {
  ok: boolean;
  /** Nur bei `ok: true` gefüllt. */
  text: string;
  tokenEin: number;
  tokenAus: number;
  /** Nur bei `ok: false`: HTTP-Status, 0 bei Netzwerkfehler, 408 bei Zeitüberschreitung. */
  status: number;
  meldung: string;
}

/**
 * Wie viel Spielraum die Denk-Token bekommen.
 *
 * Der Faktor ist geschätzt, nicht gemessen — gemessen ist nur, dass null
 * Spielraum zu wenig ist. Er darf großzügig sein: `max_completion_tokens` ist
 * eine Obergrenze, keine Bestellung. Was nicht gebraucht wird, kostet nichts.
 * Zu knapp kostet dagegen den ganzen Artikel.
 */
const DENK_SPIELRAUM = 2;

/** Mindestbudget, damit auch eine sehr kurze Antwort das Nachdenken übersteht. */
const MINDESTBUDGET = 2000;

function tokenbudget(gewuenschterText: number): number {
  return Math.max(MINDESTBUDGET, Math.ceil(gewuenschterText * DENK_SPIELRAUM));
}

/**
 * Traegt dieses Schema `strict: true`?
 *
 * OpenAI verlangt dafuer auf **jeder** Objektebene: `additionalProperties: false`
 * und ein `required`, das **alle** Eigenschaften nennt. Anthropic laesst
 * optionale Felder zu — die Schemas der Engine sind danach gebaut.
 *
 * ⚠️ Diese Pruefung muss rekursiv sein. Eine Fassung, die nur die oberste Ebene
 * ansah, liess das Artikel-Schema durch: Dort ist `bullets` erst in
 * `abschnitte.items` optional. Die API antwortete mit 400, der Lauf brach im
 * Schreibschritt ab — nach der bezahlten Keyword-Recherche. Kostete am
 * 27.08.2026 einen ganzen Lauf (17,8 Cent DataForSEO fuer null Artikel).
 *
 * Im Zweifel `false`: Dann gilt `json_object`, das Modell bekommt das Schema
 * weiterhin im Prompt, und die Formpruefung des Aufrufers faengt den Rest. Ein
 * lockerer Zwang kostet einen Nachbesserungsdurchgang; ein falscher Zwang
 * kostet den ganzen Lauf.
 */
export function istStrengErzwingbar(knoten: unknown): boolean {
  if (!knoten || typeof knoten !== "object") return true;

  const k = knoten as Record<string, unknown>;

  /* Kombinatoren erlaubt OpenAI unter `strict` nur eingeschraenkt. Wer sie
     benutzt, bekommt json_object — das ist die sichere Seite. */
  if (k.anyOf || k.oneOf || k.allOf || k.not) return false;

  if (k.type === "object" || k.properties) {
    const eigenschaften = (k.properties ?? {}) as Record<string, unknown>;
    const pflicht = Array.isArray(k.required) ? (k.required as string[]) : [];
    if (k.additionalProperties !== false) return false;
    if (pflicht.length !== Object.keys(eigenschaften).length) return false;
    for (const wert of Object.values(eigenschaften)) {
      if (!istStrengErzwingbar(wert)) return false;
    }
    return true;
  }

  if (k.type === "array" || k.items) {
    return istStrengErzwingbar(k.items);
  }

  return true;
}

/**
 * Ein Aufruf. Fehlerbehandlung, Wiederholung und Budget bleiben beim Aufrufer —
 * diese Datei kennt nur das Format.
 */
export async function openAiAufruf(optionen: {
  schluessel: string;
  system: string;
  nachricht: string;
  modell: string;
  maxTokens: number;
  temperatur?: number;
  schema?: Record<string, unknown>;
  timeoutMs: number;
}): Promise<OpenAiErgebnis> {
  const { schluessel, system, nachricht, modell, maxTokens, temperatur, schema, timeoutMs } = optionen;

  /* Die Nutzernachricht kann unten um das Schema wachsen — siehe `if (schema)`. */
  let nutzerNachricht = nachricht;

  const koerper: Record<string, unknown> = {
    model: modell,
    /* `max_completion_tokens` — `max_tokens` ist bei den neueren Modellen
       abgelehnt, nicht nur veraltet.
     *
     * ⚠️ Und es zählt etwas anderes als Anthropics `max_tokens`: **die
     * Denk-Token gehen mit hinein.** Die Aufrufer bemessen ihr Budget nach der
     * Länge des gewünschten Textes — bei Anthropic stimmt das, hier reicht es
     * nicht. Nachgemessen an einer Ein-Wort-Antwort: 19 Token aus, davon 9
     * fürs Nachdenken. Bei langem Text ist der Anteil kleiner, aber nie null.
     *
     * Ohne Luft bricht die Antwort mittendrin ab — und zwar ohne Fehler, nur
     * mit `finish_reason: "length"`. Ein Artikel, der nachts um vier auf halber
     * Strecke endet, sieht auf den ersten Blick aus wie ein schlechtes Modell.
     */
    max_completion_tokens: tokenbudget(maxTokens),
    messages: [
      { role: "system", content: system },
      /* Platzhalter — der endgueltige Text steht unten, nachdem feststeht, ob
         das Schema mitgeschickt werden muss. */
      { role: "user", content: nachricht },
    ],
  };

  if (temperatur !== undefined && !OHNE_SAMPLING.has(modell)) {
    koerper.temperature = temperatur;
  }

  if (schema) {
    const streng = istStrengErzwingbar(schema);

    koerper.response_format = streng
      ? {
          type: "json_schema",
          json_schema: { name: "antwort", strict: true, schema },
        }
      : { type: "json_object" };

    if (!streng) {
      /*
       * ⚠️ **Ohne diesen Block sieht das Modell das Schema NIE.**
       *
       * `json_object` verlangt nur „irgendein gültiges JSON" — die Feldnamen
       * stehen dann nirgends. Und in `prompts/` kommen sie auch nicht vor:
       * `ankertext` und `paragraphs` null Mal, `ziel` und `heading` je einmal
       * (und zwar in anderer Bedeutung). Der Prompt beschreibt die Form in
       * deutscher Prosa — „Ein Link besteht aus dem Zielpfad, dem Ankertext und
       * der Nummer des Abschnitts" — und überlässt dem Modell, wie die
       * Schlüssel heißen.
       *
       * Es rät dann. In vier von vier beobachteten Aufrufen falsch: Links mit
       * `ziel: undefined`, Abschnitte ohne `heading`/`paragraphs`. Das ist die
       * gemeinsame Wurzel der Abbrüche vom 28.08. („undefined is not iterable")
       * und vom 01.09. („interneLinks: at least 3") — beide Male hatte das
       * Modell den Text geschrieben und nur die Verpackung verfehlt, nachdem
       * Recherche und Briefing bezahlt waren.
       *
       * Das Schema in die Nutzernachricht zu hängen kostet Eingabe-Token und
       * erzwingt nichts. Aber es ist der Unterschied zwischen „raten" und
       * „abschreiben", und Eingabe-Token sind das Billigste am ganzen Lauf.
       */
      nutzerNachricht =
        nachricht +
        "\n\n# Antwortform\n" +
        "Antworte mit genau einem JSON-Objekt nach diesem Schema. Die " +
        "Schlüsselnamen zeichengenau übernehmen — auch die verschachtelten.\n" +
        "```json\n" +
        JSON.stringify(schema) +
        "\n```";

      warne(
        "OpenAI: Schema nicht streng erzwingbar — es gilt json_object, das Schema " +
          "geht stattdessen im Prompt mit",
        { modell },
      );
    }
  }

  /* Erst jetzt steht der endgueltige Nutzertext fest. */
  (koerper.messages as Array<{ role: string; content: string }>)[1].content = nutzerNachricht;

  let antwort: Response;
  try {
    antwort = await fetch(BASIS_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${schluessel}`,
      },
      body: JSON.stringify(koerper),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (ausnahme: unknown) {
    const abgelaufen = ausnahme instanceof Error && ausnahme.name === "TimeoutError";
    return {
      ok: false,
      text: "",
      tokenEin: 0,
      tokenAus: 0,
      status: abgelaufen ? 408 : 0,
      meldung: ausnahme instanceof Error ? ausnahme.message : String(ausnahme),
    };
  }

  const roh = (await antwort.json().catch(() => ({}))) as {
    choices?: { message?: { content?: string }; finish_reason?: string }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
    error?: { message?: string; type?: string };
  };

  if (!antwort.ok) {
    return {
      ok: false,
      text: "",
      tokenEin: 0,
      tokenAus: 0,
      status: antwort.status,
      meldung: roh.error?.message ?? antwort.statusText,
    };
  }

  const wahl = roh.choices?.[0];
  const text = wahl?.message?.content ?? "";

  /* `length` heißt: Das Modell wurde mitten im Satz abgeschnitten. Der Text ist
     dann unbrauchbar, aber bezahlt — das gehört ins Protokoll, nicht still
     weiterverarbeitet. */
  if (wahl?.finish_reason === "length") {
    melde("OpenAI: Antwort an der Tokengrenze abgeschnitten", {
      modell,
      gewuenscht: maxTokens,
      /* Das tatsaechlich gesendete Budget — sonst sucht man den Fehler an
         einer Zahl, die so nie an die API ging. */
      gesendet: tokenbudget(maxTokens),
    });
  }

  return {
    ok: true,
    text,
    tokenEin: roh.usage?.prompt_tokens ?? 0,
    tokenAus: roh.usage?.completion_tokens ?? 0,
    status: antwort.status,
    meldung: "",
  };
}
