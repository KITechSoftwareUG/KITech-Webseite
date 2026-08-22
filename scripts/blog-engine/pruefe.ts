import { ladeAlleArtikel } from "./lib/artikel-io.js";
import { pruefeArtikel } from "./lib/qualitaet.js";
import type { Artikel } from "../../src/lib/wissen/schema.js";

/**
 * Einen oder alle Artikel gegen den Hausstil prüfen.
 *
 * ```
 * npm run blog:pruefen                 # alle
 * npm run blog:pruefen -- <slug>       # einer
 * npm run blog:pruefen -- --entwuerfe  # nur Entwürfe
 * ```
 *
 * Was hier geprüft wird, ist die Form: Anrede, Satzbau, Typografie, Belege,
 * Struktur, Verlinkung. Was **nicht** geprüft werden kann, ist die einzige
 * Frage, auf die es ankommt — ob im Artikel etwas steht, das nicht auf den
 * ersten zehn Ergebnissen steht. Dafür gibt es kein Muster und keine Kennzahl.
 * Diese Prüfung ersetzt das Lesen nicht, sie sortiert nur das Offensichtliche
 * vorweg.
 */

interface Argumente {
  slugs: string[];
  nurEntwuerfe: boolean;
  ausfuehrlich: boolean;
}

function leseArgumente(argv: string[]): Argumente {
  const args: Argumente = { slugs: [], nurEntwuerfe: false, ausfuehrlich: false };

  for (const wert of argv) {
    if (wert === "--entwuerfe") args.nurEntwuerfe = true;
    else if (wert === "--ausfuehrlich" || wert === "-v") args.ausfuehrlich = true;
    else if (!wert.startsWith("--")) args.slugs.push(wert);
  }

  return args;
}

function schreibe(text: string): void {
  process.stdout.write(text + "\n");
}

function zeigeBefund(artikel: Artikel, ausfuehrlich: boolean): boolean {
  const ergebnis = pruefeArtikel(artikel);
  const zeichen = ergebnis.bestanden ? "✓" : "✗";

  schreibe("");
  schreibe(`${zeichen} ${artikel.slug}  [${artikel.status}]`);
  schreibe(`  ${artikel.titel}`);

  const k = ergebnis.kennzahlen;
  schreibe(
    `  ${k.woerter} Wörter · ${k.woerterProSatz?.toFixed(1)} Wörter/Satz · ` +
      `${k.absatzlaenge?.toFixed(0)} Wörter/Absatz · ${k.interneLinks} Links · ` +
      `${k.quellen} Quellen · ${k.faqAnzahl} Fragen`
  );

  if (typeof k.frageUeberschriftenAnteil === "number") {
    schreibe(
      `  Fragen als Überschrift: ${Math.round(k.frageUeberschriftenAnteil * 100)} % · ` +
        `Eigennamen: ${Math.round((k.entityDichte ?? 0) * 100)} % · ` +
        `Struktur: ${Math.round((k.strukturAnteil ?? 0) * 100)} %`
    );
  }

  if (ergebnis.harteFehler.length > 0) {
    schreibe(`  HART (${ergebnis.harteFehler.length}):`);
    for (const befund of ergebnis.harteFehler.slice(0, ausfuehrlich ? 99 : 8)) {
      schreibe(`    ✗ ${befund.regel} — ${befund.fundstelle}`);
      schreibe(`      ${befund.text}`);
    }
    if (!ausfuehrlich && ergebnis.harteFehler.length > 8) {
      schreibe(`    … und ${ergebnis.harteFehler.length - 8} weitere (mit -v alle)`);
    }
  }

  if (ergebnis.warnungen.length > 0 && ausfuehrlich) {
    schreibe(`  WARNUNGEN (${ergebnis.warnungen.length}):`);
    for (const befund of ergebnis.warnungen) {
      schreibe(`    · ${befund.regel}: ${befund.hinweis}`);
    }
  } else if (ergebnis.warnungen.length > 0) {
    schreibe(`  ${ergebnis.warnungen.length} Warnung(en) — mit -v anzeigen`);
  }

  return ergebnis.bestanden;
}

function main(): number {
  const args = leseArgumente(process.argv.slice(2));
  const bestand = ladeAlleArtikel();

  let auswahl = bestand;
  if (args.slugs.length > 0) {
    auswahl = bestand.filter((artikel) => args.slugs.includes(artikel.slug));
  } else if (args.nurEntwuerfe) {
    auswahl = bestand.filter((artikel) => artikel.status === "entwurf");
  }

  if (auswahl.length === 0) {
    schreibe("Nichts zu prüfen.");
    return 0;
  }

  let durchgefallen = 0;
  for (const artikel of auswahl) {
    if (!zeigeBefund(artikel, args.ausfuehrlich)) durchgefallen += 1;
  }

  schreibe("");
  schreibe("─".repeat(60));
  schreibe(
    `${auswahl.length} geprüft, ${auswahl.length - durchgefallen} bestanden, ${durchgefallen} mit harten Befunden.`
  );

  if (durchgefallen === 0) {
    schreibe("");
    schreibe("Die Form stimmt. Bleibt die Frage, die kein Prüfer beantwortet:");
    schreibe("Steht hier etwas, das nicht auf den ersten zehn Ergebnissen steht?");
  }

  return durchgefallen > 0 ? 1 : 0;
}

process.exit(main());
