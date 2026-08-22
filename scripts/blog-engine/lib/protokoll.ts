import fs from "node:fs";
import path from "node:path";

import type { LaufProtokoll } from "./typen.js";

/**
 * Was ein Lauf der Blog-Automatik über sich selbst mitteilt — auf dem Terminal,
 * als Datei und als Nachricht.
 *
 * **Warum kein `console.log`.** Ein Lauf schreibt einen Artikel und läuft dabei
 * mehrere Minuten durch neun Schritte, drei fremde Dienste und ein hartes
 * Qualitätstor. Geht dabei etwas schief, ist die einzige Spur das Log — und
 * zwar Wochen später, aus einem n8n-Ausführungsprotokoll heraus, ohne den
 * Prozess vor sich zu haben. Dafür braucht jede Zeile drei Dinge, die
 * `console.log` nicht liefert: **einen Zeitstempel** (welcher Schritt hat die
 * Zeit verbraucht), **den richtigen Kanal** und **eine gleichbleibende Form**.
 *
 * **Fortschritt gehört auf stdout, Probleme auf stderr.** Das ist keine
 * Kosmetik: Wer den Lauf aus einem Cron oder aus n8n heraus startet, bekommt
 * beide Ströme getrennt. Läuft der Fortschritt über stderr, sieht jeder normale
 * Lauf nach einem Fehlschlag aus und die eine Meldung, auf die es ankommt, geht
 * in neunzig Zeilen Routine unter.
 *
 * **Farbe nur im Terminal.** Steuerzeichen sind unsichtbar, solange ein Mensch
 * zusieht, und werden zu Zeichensalat, sobald die Ausgabe in eine Datei, in ein
 * Ticket oder in eine Chat-Nachricht wandert. Deshalb hängt sie an `isTTY` — pro
 * Kanal getrennt, denn stdout kann umgeleitet sein, während stderr noch am
 * Terminal hängt.
 *
 * Keine Abhängigkeit: Zeitstempel, Farbe und Einrückung sind zusammen keine
 * dreißig Zeilen. Ein Logging-Paket dafür wäre ein Update-Pfad ohne Gegenwert.
 */

/* -------------------------------------------------------------------------- */
/* Ausgabe auf dem Terminal                                                   */
/* -------------------------------------------------------------------------- */

/**
 * ANSI-Sequenzen, absichtlich sparsam.
 *
 * Nur drei Rollen werden eingefärbt — Zeitstempel (grau, damit er sich
 * wegliest), Warnung (gelb) und Fehler (rot). Wer mehr einfärbt, macht genau
 * die beiden Farben wertlos, auf die es ankommt.
 */
const FARBE = {
  grau: "\u001b[90m",
  gelb: "\u001b[33m",
  rot: "\u001b[31m",
  fett: "\u001b[1m",
  aus: "\u001b[0m",
} as const;

/** Nur färben, wenn wirklich ein Terminal zusieht. */
function faerbe(text: string, farbe: keyof typeof FARBE, kanal: NodeJS.WriteStream): string {
  return kanal.isTTY ? `${FARBE[farbe]}${text}${FARBE.aus}` : text;
}

/**
 * Uhrzeit statt vollständigem Datum.
 *
 * Ein Lauf dauert Minuten, nicht Tage; das Datum steht ohnehin im Dateinamen
 * des Protokolls und in `gestartet`. In der Zeile selbst zählt nur, wie weit
 * zwei Schritte auseinanderliegen.
 */
function uhrzeit(): string {
  return new Date().toTimeString().slice(0, 8);
}

/**
 * Begleitdaten als `schlüssel=wert`, nicht als JSON-Klumpen.
 *
 * Eine Logzeile wird gelesen, nicht geparst. `keyword="ki im mittelstand"
 * treffer=10` ist auf einen Blick erfassbar, ein eingebettetes JSON-Objekt
 * nicht. Alles, was kein Grundtyp ist, wird trotzdem als JSON angehängt —
 * lieber unschön als weg.
 */
function alsText(wert: unknown): string {
  if (wert === null || wert === undefined) return "–";
  if (typeof wert === "string") return /\s/.test(wert) ? `"${wert}"` : wert;
  if (typeof wert === "number" || typeof wert === "boolean" || typeof wert === "bigint") {
    return String(wert);
  }
  try {
    return JSON.stringify(wert) ?? String(wert);
  } catch {
    /* Zirkuläre Struktur. Eine Logzeile darf daran nicht sterben. */
    return "[nicht darstellbar]";
  }
}

function anhang(daten?: Record<string, unknown>): string {
  if (!daten) return "";
  const teile = Object.entries(daten).map(([schluessel, wert]) => `${schluessel}=${alsText(wert)}`);
  return teile.length > 0 ? `  ${teile.join(" ")}` : "";
}

function schreibeZeile(
  kanal: NodeJS.WriteStream,
  markierung: string,
  markierungsfarbe: keyof typeof FARBE | null,
  text: string,
  daten?: Record<string, unknown>,
): void {
  const zeit = faerbe(uhrzeit(), "grau", kanal);
  const kopf = markierungsfarbe ? faerbe(markierung, markierungsfarbe, kanal) : markierung;
  kanal.write(`${zeit} ${kopf} ${text}${anhang(daten)}\n`);
}

/** Normaler Fortschritt. Landet auf stdout, weil er kein Problem ist. */
export function melde(text: string, daten?: Record<string, unknown>): void {
  schreibeZeile(process.stdout, "·      ", null, text, daten);
}

/**
 * Etwas ist schief, aber der Lauf geht weiter — ein übersprungenes Thema, eine
 * Datei, die das Schema verfehlt, ein Dienst ohne Antwort.
 *
 * Warnungen gehören auf stderr, weil nach ihnen gesucht wird. Wer nur stdout
 * aufhebt, verliert genau die Zeilen, wegen derer er nachsieht.
 */
export function warne(text: string, daten?: Record<string, unknown>): void {
  schreibeZeile(process.stderr, "WARNUNG", "gelb", text, daten);
}

/**
 * Der Lauf ist an dieser Stelle gescheitert.
 *
 * Bewusst **ohne** `process.exit`: Ob nach einem gescheiterten Artikel der
 * nächste noch laufen soll, weiß nur der Aufrufer. Ein Protokollmodul, das den
 * Prozess beendet, nimmt ihm diese Entscheidung ab und verhindert nebenbei,
 * dass das Protokoll überhaupt noch geschrieben wird.
 */
export function fehler(text: string, daten?: Record<string, unknown>): void {
  schreibeZeile(process.stderr, "FEHLER ", "rot", text, daten);
}

/**
 * Abschnittsüberschrift zwischen zwei Schritten.
 *
 * Die Nummer ist zweistellig, damit die Trenner untereinander fluchten und die
 * Reihenfolge aus `typen.ts` im Log wiedererkennbar bleibt — wer „05" sucht,
 * findet „05" und nicht „5".
 */
export function schritt(nummer: number, name: string): void {
  const kennung = String(nummer).padStart(2, "0");
  const zeile = `-- ${kennung} · ${name} `;
  process.stdout.write(`\n${faerbe(zeile.padEnd(72, "-"), "fett", process.stdout)}\n`);
}

/* -------------------------------------------------------------------------- */
/* Das Protokoll eines Laufs                                                  */
/* -------------------------------------------------------------------------- */

const WURZEL = process.cwd();
const LAUF_ORDNER = path.join(WURZEL, "content", "seo", "laeufe");

/**
 * Ein frisches, leeres Protokoll.
 *
 * Alle Zähler stehen auf null statt auf `undefined`: Ein Lauf, der schon in
 * Schritt 03 abbricht, soll ein vollständiges Protokoll hinterlassen, in dem
 * null Artikel und null Kosten stehen — nicht eines mit Lücken, bei dem man
 * raten muss, ob nichts passiert ist oder nur nichts mitgeschrieben wurde.
 */
export function starteProtokoll(id: string, modus: "entwurf" | "auto"): LaufProtokoll {
  return {
    id,
    gestartet: new Date().toISOString(),
    modus,
    themen: [],
    artikel: [],
    fehler: [],
    kosten: {
      dataforseoUsd: 0,
      firecrawlCredits: 0,
      claudeTokenEin: 0,
      claudeTokenAus: 0,
    },
  };
}

/**
 * Aus der Lauf-Kennung einen Dateinamen machen, dem man trauen kann.
 *
 * Die Kennung kommt aus einem Aufrufargument oder einer Umgebungsvariablen und
 * wird hier zu einem Pfad. Ohne diese Zeile genügt `--id ../../public/robots`,
 * und das Protokoll überschreibt eine ausgelieferte Datei. Kein hypothetischer
 * Angriff, sondern der klassische Tippfehler mit Nebenwirkung.
 */
function dateiName(id: string): string {
  const sauber = id
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
  return sauber.length > 0 ? sauber : "ohne-kennung";
}

/**
 * Legt das Protokoll unter `content/seo/laeufe/<id>.json` ab und gibt den Pfad
 * zurück.
 *
 * **Warum im Repo und nicht in `/tmp`.** Das Protokoll ist die Prüfspur zu
 * einem veröffentlichten Artikel: welches Thema, welches Modell, wie viele
 * Durchgänge bis zum bestandenen Qualitätstor, was es gekostet hat. Wer in
 * einem halben Jahr fragt, wie ein Artikel entstanden ist, findet die Antwort
 * neben dem Artikel — nicht in einem Verzeichnis, das der nächste Neustart
 * leert.
 *
 * `beendet` wird hier nachgetragen, falls der Aufrufer es vergessen hat: Ein
 * Protokoll ohne Ende sieht aus wie ein abgestürzter Lauf, und diese
 * Verwechslung kostet beim Nachsehen mehr als die Zeile hier.
 */
export function schreibeProtokoll(protokoll: LaufProtokoll): string {
  if (!protokoll.beendet) protokoll.beendet = new Date().toISOString();

  const ziel = path.join(LAUF_ORDNER, `${dateiName(protokoll.id)}.json`);
  fs.mkdirSync(LAUF_ORDNER, { recursive: true });

  /* Erst daneben schreiben, dann umbenennen: Ein Abbruch mitten im Schreiben
     hinterlässt sonst ein halbes JSON, das beim nächsten Lesen wie ein kaputtes
     Protokoll aussieht statt wie ein abgebrochener Schreibvorgang. */
  const zwischen = `${ziel}.tmp`;
  fs.writeFileSync(zwischen, `${JSON.stringify(protokoll, null, 2)}\n`, "utf8");
  fs.renameSync(zwischen, ziel);

  return ziel;
}

/* -------------------------------------------------------------------------- */
/* Meldung nach draußen                                                       */
/* -------------------------------------------------------------------------- */

/** Was an den Webhook geht — eine Zusammenfassung, nicht das ganze Protokoll. */
interface Meldung {
  lauf: string;
  modus: LaufProtokoll["modus"];
  gestartet: string;
  beendet: string | null;
  dauerSekunden: number | null;
  artikelAnzahl: number;
  fehlerAnzahl: number;
  artikel: Array<{ slug: string; titel: string; status: string; durchgaenge: number }>;
  fehler: string[];
  kosten: LaufProtokoll["kosten"];
  /** Fertig formulierte Zeile für Telegram, E-Mail oder Chat. */
  text: string;
}

function dauerSekunden(protokoll: LaufProtokoll): number | null {
  if (!protokoll.beendet) return null;
  const von = Date.parse(protokoll.gestartet);
  const bis = Date.parse(protokoll.beendet);
  if (!Number.isFinite(von) || !Number.isFinite(bis)) return null;
  return Math.max(0, Math.round((bis - von) / 1000));
}

/**
 * Ein Satz, den ein Mensch auf dem Handy lesen kann.
 *
 * Der Empfänger ist ein n8n-Workflow, der daraus eine Nachricht macht. Stünde
 * hier nur das rohe Protokoll, müsste die Formulierung im Workflow entstehen —
 * und läge damit an der einen Stelle, die niemand versioniert.
 */
function zusammenfassung(protokoll: LaufProtokoll): string {
  const teile: string[] = [`Blog-Lauf ${protokoll.id} (${protokoll.modus})`];

  if (protokoll.artikel.length === 0) {
    teile.push("kein Artikel entstanden");
  } else {
    const namen = protokoll.artikel.map((a) => `${a.titel} [${a.status}]`).join(", ");
    teile.push(`${protokoll.artikel.length} Artikel: ${namen}`);
  }

  if (protokoll.fehler.length > 0) {
    teile.push(`${protokoll.fehler.length} Fehler: ${protokoll.fehler.join(" | ")}`);
  }

  const dauer = dauerSekunden(protokoll);
  if (dauer !== null) teile.push(`${Math.round(dauer / 60)} min`);

  const { claudeTokenEin, claudeTokenAus, dataforseoUsd, firecrawlCredits } = protokoll.kosten;
  teile.push(
    `Kosten: ${claudeTokenEin + claudeTokenAus} Token, ` +
      `${dataforseoUsd.toFixed(2)} $ DataForSEO, ${firecrawlCredits} Firecrawl-Credits`,
  );

  return teile.join(" — ");
}

/**
 * Schickt die Zusammenfassung an `BLOG_ENGINE_WEBHOOK_URL`.
 *
 * **Ohne gesetzte Variable passiert nichts** — kein Fehler, keine Warnung, kein
 * Netzwerkweg. Dasselbe Muster wie `src/app/api/ereignis/route.ts`: Eine nicht
 * eingerichtete Meldung ist eine Entscheidung, kein Defekt, und darf einen
 * ansonsten erfolgreichen Lauf nicht rot färben.
 *
 * `BLOG_ENGINE_WEBHOOK_SECRET` geht als `x-tracking-secret` mit, damit der
 * Empfänger fremde Aufrufe abweisen kann — derselbe Header wie bei den
 * Website-Meldungen, damit ein n8n-Workflow beide Quellen gleich behandeln kann.
 *
 * **Ein Fehler beim Melden wirft nicht.** Zu diesem Zeitpunkt ist der Artikel
 * geschrieben und das Protokoll abgelegt; ein nicht erreichbarer Webhook darf
 * daraus keinen gescheiterten Lauf machen.
 */
export async function meldeAnWebhook(protokoll: LaufProtokoll): Promise<void> {
  const ziel = process.env.BLOG_ENGINE_WEBHOOK_URL;
  if (!ziel) return;

  const meldung: Meldung = {
    lauf: protokoll.id,
    modus: protokoll.modus,
    gestartet: protokoll.gestartet,
    beendet: protokoll.beendet ?? null,
    dauerSekunden: dauerSekunden(protokoll),
    artikelAnzahl: protokoll.artikel.length,
    fehlerAnzahl: protokoll.fehler.length,
    artikel: protokoll.artikel.map((a) => ({
      slug: a.slug,
      titel: a.titel,
      status: a.status,
      durchgaenge: a.durchgaenge,
    })),
    fehler: protokoll.fehler,
    kosten: protokoll.kosten,
    text: zusammenfassung(protokoll),
  };

  const secret = process.env.BLOG_ENGINE_WEBHOOK_SECRET;

  try {
    const antwort = await fetch(ziel, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-tracking-secret": secret } : {}),
      },
      body: JSON.stringify(meldung),
      /* Der Lauf ist fertig, niemand wartet noch. Acht Sekunden reichen für
         einen erreichbaren Webhook und sind kurz genug, dass ein hängender
         nicht zum Problem wird. */
      signal: AbortSignal.timeout(8000),
    });

    if (!antwort.ok) {
      warne("Webhook hat die Laufmeldung abgelehnt", { status: antwort.status, lauf: protokoll.id });
      return;
    }

    melde("Laufmeldung verschickt", { lauf: protokoll.id });
  } catch (ausnahme: unknown) {
    warne("Laufmeldung konnte nicht zugestellt werden", {
      grund: ausnahme instanceof Error ? ausnahme.message : String(ausnahme),
    });
  }
}
