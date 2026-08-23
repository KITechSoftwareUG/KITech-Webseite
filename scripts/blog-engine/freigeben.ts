/* Muss der erste Import bleiben: fuellt process.env aus .env, bevor ein
   anderes Modul nach einem Zugang fragt. Siehe lib/umgebung.ts. */
import "./lib/umgebung.js";
import { ladeAlleArtikel, schreibeArtikel } from "./lib/artikel-io.js";
import { pruefeArtikel } from "./lib/qualitaet.js";
import { melde, warne, fehler } from "./lib/protokoll.js";
import type { Artikel } from "../../src/lib/wissen/schema.js";

/**
 * Einen Entwurf freigeben — der eine Schritt, den ein Mensch macht.
 *
 * ```
 * npm run blog:freigeben -- <slug> --von "Ayham Alkhalil"
 * npm run blog:freigeben -- --alle --von "Ayham Alkhalil"
 * npm run blog:freigeben -- <slug> --zurueckziehen
 * ```
 *
 * **Warum es diesen Schritt gibt und warum er nicht automatisiert ist.**
 *
 * Googles Bewertungsanleitung definiert den Begriff „Effort" als „the extent to
 * which a human being actively worked to create satisfying content" und nennt
 * als Gegenbeispiel ausdrücklich Erzeugung im großen Stil „without any
 * oversight, manual curation etc.". Dieser Befehl ist genau diese Aufsicht —
 * nachvollziehbar, mit Namen und Datum, im Artikel selbst hinterlegt.
 *
 * Das ist keine Formalie. Wenn irgendwann jemand fragt, wie diese Artikel
 * entstanden sind, ist das Feld `freigabe` die Antwort. Wer es automatisch
 * füllen lässt, hat die Antwort verloren, bevor die Frage gestellt wurde.
 *
 * **Vor der Freigabe wird gelesen.** Der Befehl zeigt die Qualitätsbefunde und
 * verlangt bei harten Fehlern eine ausdrückliche Bestätigung. Er ersetzt aber
 * nicht das Lesen des Artikels — kein Prüfmodul der Welt beantwortet die eine
 * Frage, auf die es ankommt: Steht hier etwas, das nicht auf den ersten zehn
 * Ergebnissen steht?
 */

interface Argumente {
  slugs: string[];
  alle: boolean;
  von: string | null;
  zurueckziehen: boolean;
  trotzdem: boolean;
  hilfe: boolean;
}

function leseArgumente(argv: string[]): Argumente {
  const args: Argumente = {
    slugs: [],
    alle: false,
    von: null,
    zurueckziehen: false,
    trotzdem: false,
    hilfe: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const wert = argv[i];
    if (wert === "--alle") args.alle = true;
    else if (wert === "--von") args.von = argv[++i] ?? null;
    else if (wert === "--zurueckziehen") args.zurueckziehen = true;
    else if (wert === "--trotzdem") args.trotzdem = true;
    else if (wert === "--hilfe" || wert === "-h") args.hilfe = true;
    else if (!wert.startsWith("--")) args.slugs.push(wert);
  }

  return args;
}

function heute(): string {
  const jetzt = new Date();
  const monat = String(jetzt.getMonth() + 1).padStart(2, "0");
  const tag = String(jetzt.getDate()).padStart(2, "0");
  return `${jetzt.getFullYear()}-${monat}-${tag}`;
}

function zeigeHilfe(): void {
  process.stdout.write(
    [
      "",
      "Entwürfe freigeben oder zurückziehen.",
      "",
      "  npm run blog:freigeben -- <slug> --von \"Dein Name\"",
      "  npm run blog:freigeben -- --alle --von \"Dein Name\"",
      "  npm run blog:freigeben -- <slug> --zurueckziehen",
      "",
      "Optionen:",
      "  --alle             alle Entwürfe auf einmal",
      "  --von <name>       wer freigibt. Pflicht beim Freigeben.",
      "  --zurueckziehen    einen Artikel aus dem Index nehmen (status: zurueckgezogen)",
      "  --trotzdem         auch bei harten Qualitätsbefunden freigeben",
      "",
      "Nach der Freigabe:",
      "  npm test && npm run build",
      "  git add content/ && git commit -m \"...\" && git push",
      "  Deploy wie gewohnt — dieser Befehl liefert nichts aus.",
      "",
    ].join("\n")
  );
}

/**
 * Zeigt den Artikel so, dass man ihn beurteilen kann, ohne die JSON-Datei zu
 * lesen — und stellt die Substanzfrage explizit.
 */
function zeigeArtikel(artikel: Artikel): void {
  const zeilen = [
    "",
    "─".repeat(72),
    artikel.titel,
    "─".repeat(72),
    `Thema:      ${artikel.cluster}`,
    `Keyword:    ${artikel.zielKeyword}`,
    `Autor:      ${artikel.autor}`,
    `Abschnitte: ${artikel.abschnitte.length}   Fragen: ${artikel.faq.length}   ` +
      `Quellen: ${artikel.quellen.length}   Interne Links: ${artikel.interneLinks.length}`,
    "",
    "EIGENANTEIL (das Feld, das über Erlaubt und Spam entscheidet):",
    `  Art:       ${artikel.substanz.art}`,
    `  Was:       ${artikel.substanz.beschreibung}`,
    `  Woher:     ${artikel.substanz.herkunft}`,
    "",
    "KERNAUSSAGEN:",
    ...artikel.kernaussagen.map((aussage) => `  • ${aussage}`),
    "",
    "GLIEDERUNG:",
    ...artikel.abschnitte.map((abschnitt, index) => `  ${index + 1}. ${abschnitt.heading}`),
    "",
  ];

  process.stdout.write(zeilen.join("\n") + "\n");
}

export async function main(): Promise<number> {
  const args = leseArgumente(process.argv.slice(2));

  if (args.hilfe || (args.slugs.length === 0 && !args.alle)) {
    zeigeHilfe();
    return args.hilfe ? 0 : 1;
  }

  const bestand = ladeAlleArtikel();

  const betroffen = args.alle
    ? bestand.filter((artikel) => artikel.status === "entwurf")
    : bestand.filter((artikel) => args.slugs.includes(artikel.slug));

  if (betroffen.length === 0) {
    fehler(
      args.alle
        ? "Kein Entwurf gefunden. Alles freigegeben oder noch nichts erzeugt."
        : `Kein Artikel mit dem Slug ${args.slugs.join(", ")} gefunden.`
    );
    return 1;
  }

  /* -------------------------------------------------------------------- */
  /* Zurückziehen                                                         */
  /* -------------------------------------------------------------------- */

  if (args.zurueckziehen) {
    for (const artikel of betroffen) {
      schreibeArtikel({ ...artikel, status: "zurueckgezogen", aktualisiert: heute() });
      melde(`${artikel.slug} ist zurückgezogen — er verschwindet mit dem nächsten Build.`);
    }

    melde("");
    melde("Googles eigener Ausweg für Inhalte, die nicht hätten erscheinen sollen, lautet");
    melde("wörtlich: If you are hosting such content on your site, exclude it from Search.");
    melde("Genau das passiert hier — die Datei bleibt, die Seite verschwindet.");
    melde("");
    melde("Danach: npm test && npm run build, dann committen und ausliefern.");
    return 0;
  }

  /* -------------------------------------------------------------------- */
  /* Freigeben                                                            */
  /* -------------------------------------------------------------------- */

  if (!args.von) {
    fehler(
      "--von fehlt. Eine Freigabe ohne Namen ist keine Freigabe — genau dieser Name ist " +
        "die Antwort auf die Frage, ob ein Mensch am Ergebnis gearbeitet hat."
    );
    return 1;
  }

  let blockiert = 0;

  for (const artikel of betroffen) {
    if (artikel.status === "veroeffentlicht") {
      warne(`${artikel.slug} steht bereits live — übersprungen.`);
      continue;
    }

    zeigeArtikel(artikel);

    const befund = pruefeArtikel(artikel);

    if (befund.warnungen.length > 0) {
      process.stdout.write(`WARNUNGEN (${befund.warnungen.length}):\n`);
      for (const eintrag of befund.warnungen.slice(0, 10)) {
        process.stdout.write(`  · ${eintrag.regel}: ${eintrag.hinweis}\n`);
      }
      if (befund.warnungen.length > 10) {
        process.stdout.write(`  · … und ${befund.warnungen.length - 10} weitere\n`);
      }
      process.stdout.write("\n");
    }

    if (befund.harteFehler.length > 0 && !args.trotzdem) {
      fehler(`${artikel.slug}: ${befund.harteFehler.length} harte Befunde — nicht freigegeben.`);
      for (const eintrag of befund.harteFehler.slice(0, 10)) {
        process.stdout.write(`  ✗ ${eintrag.regel} (${eintrag.fundstelle}): ${eintrag.text}\n`);
      }
      process.stdout.write(
        "\n  Beheben und erneut versuchen, oder mit --trotzdem bewusst überstimmen.\n\n"
      );
      blockiert += 1;
      continue;
    }

    if (befund.harteFehler.length > 0) {
      warne(
        `${artikel.slug} wird trotz ${befund.harteFehler.length} harter Befunde freigegeben ` +
          `(--trotzdem).`
      );
    }

    /* Bei der Erstveröffentlichung wandert auch `datum` auf den Freigabetag.
       Ein Artikel ist an dem Tag erschienen, an dem er freigegeben wurde — nicht
       an dem, an dem der Entwurf entstand. Stünden beide auseinander, zeigte die
       Seite bei der Premiere ein „aktualisiert am", und `datePublished` im Markup
       wiese auf einen Tag, an dem die Adresse noch eine 404 lieferte.

       Bei einem Artikel, der schon einmal live war (zurückgezogen und erneut
       freigegeben), bleibt `datum` stehen — dort ist die Aktualisierung echt. */
    const erstveroeffentlichung = !artikel.freigabe;

    schreibeArtikel({
      ...artikel,
      status: "veroeffentlicht",
      freigabe: { von: args.von, am: heute() },
      datum: erstveroeffentlichung ? heute() : artikel.datum,
      aktualisiert: heute(),
    });

    melde(`${artikel.slug} freigegeben von ${args.von}.`);
  }

  if (blockiert > 0) {
    return 1;
  }

  melde("");
  melde("Jetzt der Reihe nach:");
  melde("  npm test && npm run build");
  melde("  git add content/ && git commit -m \"Gratis-Wissen: neue Artikel\" && git push");
  melde("  Deploy über die Coolify-API — nach eigenem Go, wie im Repo dokumentiert.");
  melde("  Danach optional: npm run blog:indexnow");

  return 0;
}

/* Nur ausführen, wenn direkt aufgerufen — nicht beim Importieren aus einem Test. */
const direktAufgerufen = process.argv[1]?.includes("freigeben");
if (direktAufgerufen) {
  main()
    .then((code) => process.exit(code))
    .catch((ausnahme: unknown) => {
      fehler(ausnahme instanceof Error ? ausnahme.message : String(ausnahme));
      process.exit(1);
    });
}
