/**
 * Lädt `.env`, bevor irgendein Skript nach einem Zugang fragt.
 *
 * **Warum es diese Datei gibt.** Bis zum 23.08.2026 las die Blog-Engine ihre
 * Zugangsdaten aus `process.env` — und niemand füllte `process.env`. Weder ein
 * `dotenv`-Paket noch ein `--env-file`-Flag in den npm-Scripts; `tsx` lädt von
 * sich aus keine `.env`. Nachgemessen: eine Variable in `.env` eintragen und aus
 * einem Skript auslesen ergab `(nicht gesetzt)`.
 *
 * Die Folge war heimtückisch, weil sie wie ein Konfigurationsfehler aussah: Wer
 * `DATAFORSEO_LOGIN` ordentlich in `.env` einträgt, bekommt beim ersten Lauf
 * trotzdem „DATAFORSEO_LOGIN fehlt" zu lesen — und sucht den Fehler beim
 * Zugang, nicht beim Laden.
 *
 * **Warum `process.loadEnvFile()` und nicht ein Flag in package.json.** Das Flag
 * müsste in jedes der sechs `blog:*`-Scripts, würde aber nur greifen, wenn der
 * Lauf über npm startet. Die Engine soll auch aus einem Cron, aus n8n oder
 * direkt per `tsx` startbar sein. Ein Import, den jeder Einstiegspunkt als
 * erste Zeile trägt, gilt in allen vier Fällen.
 *
 * **Was bewusst NICHT passiert:** Fehlt `.env`, wird nichts geworfen. In der
 * Docker-Umgebung und in Coolify kommen die Werte aus echten Umgebungs-
 * variablen; eine Datei gibt es dort nicht, und das ist der Normalfall, kein
 * Fehler. Vorhandene Umgebungsvariablen werden von `loadEnvFile` **nicht**
 * überschrieben — die Datei füllt nur Lücken.
 *
 * Verwendung: als **erster** Import eines Einstiegspunktes.
 *
 *     import "./lib/umgebung.js";
 */

import fs from "node:fs";
import path from "node:path";

/** Die Datei, aus der gelesen wird — im Projektwurzelverzeichnis. */
const ENV_DATEI = path.join(process.cwd(), ".env");

/**
 * Merkt, ob schon geladen wurde. Mehrere Einstiegspunkte in einem Prozess (etwa
 * ein Skript, das ein anderes importiert) sollen die Datei nicht zweimal lesen.
 */
let geladen = false;

/**
 * Lädt `.env`, falls vorhanden. Gibt zurück, ob dabei etwas gelesen wurde —
 * für Skripte, die das melden wollen.
 */
export function ladeUmgebung(): boolean {
  if (geladen) return true;

  if (!fs.existsSync(ENV_DATEI)) {
    /* Kein Fehler: im Container kommen die Werte aus echten Variablen. */
    return false;
  }

  try {
    process.loadEnvFile(ENV_DATEI);
    geladen = true;
    return true;
  } catch (ursache) {
    /*
     * Eine kaputte `.env` (etwa eine Zeile ohne `=`) darf den Lauf nicht
     * lautlos in denselben Zustand bringen wie eine fehlende Datei — dann
     * suchte man den Fehler wieder beim Zugang statt beim Laden.
     */
    process.stderr.write(
      `\n  ⚠ .env konnte nicht gelesen werden: ${ursache instanceof Error ? ursache.message : String(ursache)}\n` +
        `    Die Zugangsdaten fehlen dadurch, obwohl die Datei existiert.\n\n`
    );
    return false;
  }
}

/* Beim Import ausführen — das ist der ganze Zweck der Datei. */
ladeUmgebung();
