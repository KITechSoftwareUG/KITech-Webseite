import { findeThemen } from "./schritte/01-themenfindung.js";
import { waehleThemen } from "./schritte/02-auswahl.js";
import { analysiereSerp } from "./schritte/03-serp.js";
import { recherchiere } from "./schritte/04-recherche.js";
import { erstelleBrief } from "./schritte/05-brief.js";
import { schreibeArtikel as verfasse } from "./schritte/06-schreiben.js";
import { pruefeUndBessere } from "./schritte/07-pruefen.js";
import { haengeEin } from "./schritte/08-verlinken.js";
import { legeAb } from "./schritte/09-ablegen.js";
import { ladeAlleArtikel, markiereErledigt } from "./lib/artikel-io.js";
import {
  melde,
  warne,
  fehler,
  schritt,
  starteProtokoll,
  schreibeProtokoll,
  meldeAnWebhook,
} from "./lib/protokoll.js";
import { getAusgaben } from "./lib/dataforseo.js";
import { getVerbrauch } from "./lib/firecrawl.js";
import { getTokenverbrauch } from "./lib/claude.js";
import type { Artikel } from "../../src/lib/wissen/schema.js";

/**
 * Der tägliche Lauf der Blog-Automatik.
 *
 * ```
 * npm run blog:lauf                  # zwei Entwürfe
 * npm run blog:lauf -- --anzahl 3    # drei
 * npm run blog:lauf -- --trocken     # nichts schreiben, nur zeigen, was passieren würde
 * ```
 *
 * **Was am Ende steht: Entwürfe.** Kein Commit, kein Deploy, nichts Öffentliches.
 * Die Begründung dafür steht ausführlich im Kopf von `schritte/09-ablegen.ts` —
 * kurz: Die Freigabe durch einen Menschen ist der Unterschied zwischen einem
 * verteidigungsfähigen Vorgehen und dem, was Googles Richtlinie als „scaled
 * content abuse" beschreibt. Sie ist keine Bremse, die man später herausnimmt,
 * wenn es gut läuft.
 *
 * **Der Lauf bricht bei einem einzelnen Thema nicht ab.** Schlägt die Recherche
 * für Thema zwei fehl, wird Thema drei trotzdem geschrieben. Was schiefging,
 * steht im Protokoll unter `content/seo/laeufe/`.
 *
 * **Fehlende Schlüssel machen den Lauf schlechter, nicht kaputt.** Ohne
 * DataForSEO fehlen Suchvolumen und Wettbewerbsbild, ohne Firecrawl die
 * Recherche in den rankenden Seiten. Nur ohne `ANTHROPIC_API_KEY` geht gar
 * nichts — dann gibt es niemanden, der schreibt.
 */

interface Argumente {
  anzahl: number;
  trocken: boolean;
  hilfe: boolean;
  /** Ein bestimmtes Thema aus dem Vorrat erzwingen, statt auszuwählen. */
  thema: string | null;
}

function leseArgumente(argv: string[]): Argumente {
  const args: Argumente = { anzahl: 2, trocken: false, hilfe: false, thema: null };

  for (let i = 0; i < argv.length; i += 1) {
    const wert = argv[i];
    if (wert === "--anzahl") args.anzahl = Math.max(1, Number(argv[++i]) || 2);
    else if (wert === "--trocken") args.trocken = true;
    else if (wert === "--thema") args.thema = argv[++i] ?? null;
    else if (wert === "--hilfe" || wert === "-h") args.hilfe = true;
  }

  return args;
}

function zeigeHilfe(): void {
  process.stdout.write(
    [
      "",
      "Täglicher Lauf der Blog-Automatik. Erzeugt Entwürfe, veröffentlicht nichts.",
      "",
      "  npm run blog:lauf",
      "  npm run blog:lauf -- --anzahl 3",
      "  npm run blog:lauf -- --thema <id-aus-dem-vorrat>",
      "  npm run blog:lauf -- --trocken",
      "",
      "Optionen:",
      "  --anzahl <n>   wie viele Artikel (Standard 2)",
      "  --thema <id>   ein bestimmtes Thema aus content/seo/themen-pool.json",
      "  --trocken      nur zeigen, was ausgewählt würde. Kostet nichts.",
      "",
      "Danach:",
      "  Entwürfe lesen, dann npm run blog:freigeben -- <slug> --von \"Dein Name\"",
      "",
    ].join("\n")
  );
}

/** Kennung des Laufs: Datum plus laufende Nummer innerhalb des Tages. */
function laufId(): string {
  const jetzt = new Date();
  const monat = String(jetzt.getMonth() + 1).padStart(2, "0");
  const tag = String(jetzt.getDate()).padStart(2, "0");
  const zeit = `${String(jetzt.getHours()).padStart(2, "0")}${String(jetzt.getMinutes()).padStart(2, "0")}`;
  return `${jetzt.getFullYear()}-${monat}-${tag}-${zeit}`;
}

export async function main(): Promise<number> {
  const args = leseArgumente(process.argv.slice(2));

  if (args.hilfe) {
    zeigeHilfe();
    return 0;
  }

  const protokoll = starteProtokoll(laufId(), "entwurf");
  const bestand = ladeAlleArtikel();
  const fertige: Artikel[] = [];

  melde(`Lauf ${protokoll.id} — Ziel: ${args.anzahl} Entwurf/Entwürfe`);
  melde(`Bestand: ${bestand.length} Artikel, davon ${bestand.filter((a) => a.status === "veroeffentlicht").length} veröffentlicht`);

  /* ---------------------------------------------------------------------- */
  schritt(1, "Themenfindung");
  /* ---------------------------------------------------------------------- */

  const gefunden = await findeThemen(Math.max(args.anzahl * 4, 8));
  melde(`${gefunden.kandidaten.length} Kandidat(en) aus dem Vorrat`);

  /* ---------------------------------------------------------------------- */
  schritt(2, "Auswahl");
  /* ---------------------------------------------------------------------- */

  const auswahl = waehleThemen(gefunden, args.anzahl, bestand);

  for (const verworfen of auswahl.verworfen) {
    melde(`  übersprungen: ${verworfen.id} — ${verworfen.grund}`);
  }

  let gewaehlt = auswahl.gewaehlt;

  if (args.thema) {
    const erzwungen = gefunden.kandidaten.find((kandidat) => kandidat.id === args.thema);
    if (!erzwungen) {
      fehler(`Thema "${args.thema}" steht nicht im Vorrat oder ist bereits erledigt.`);
      return 1;
    }
    if (!erzwungen.substanz) {
      fehler(
        `Thema "${args.thema}" hat keinen belegten Eigenanteil. Das Tor gilt auch für ` +
          `erzwungene Themen — sonst wäre es keins. Trage substanz im Vorrat ein.`
      );
      return 1;
    }
    gewaehlt = [{ ...erzwungen, sekundaer: [] }];
  }

  if (gewaehlt.length === 0) {
    warne("Kein Thema mit belegtem Eigenanteil verfügbar. Heute erscheint nichts.");
    melde("");
    melde("Das ist kein Ausfall, sondern der vorgesehene Zustand. Googles eigene Prüfliste");
    melde("nennt es als Warnsignal, Inhalte zu veröffentlichen, nur damit die Website frisch");
    melde("wirkt — mit dem Klammersatz: (No, it won't).");
    melde("");
    melde("Was zu tun ist: content/seo/themen-pool.json öffnen und bei einem Thema das Feld");
    melde("substanz füllen. Was dort hineingehört, steht in");
    melde(".claude/skills/blog-seo/reference/substanz-gate.md");

    protokoll.fehler.push("Kein Thema mit Substanz verfügbar");
    beendeProtokoll(protokoll);
    return 0;
  }

  melde(`Gewählt: ${gewaehlt.map((t) => t.id).join(", ")}`);
  protokoll.themen = gewaehlt.map((t) => t.id);

  if (args.trocken) {
    melde("");
    melde("Trockenlauf — hier wäre Schluss. Was passieren würde:");
    for (const thema of gewaehlt) {
      melde(`  • ${thema.arbeitstitel}`);
      melde(`    Keyword: ${thema.zielKeyword}`);
      melde(`    Eigenanteil: ${thema.substanz?.art} — ${thema.substanz?.beschreibung.slice(0, 90)}…`);
    }
    return 0;
  }

  /* ---------------------------------------------------------------------- */
  /* Je Thema: SERP, Recherche, Brief, Schreiben, Prüfen                     */
  /* ---------------------------------------------------------------------- */

  for (const [nummer, thema] of gewaehlt.entries()) {
    melde("");
    melde("═".repeat(72));
    melde(`Thema ${nummer + 1} von ${gewaehlt.length}: ${thema.arbeitstitel}`);
    melde("═".repeat(72));

    try {
      schritt(3, `Ergebnisseite zu „${thema.zielKeyword}"`);
      const serp = await analysiereSerp(thema.zielKeyword);

      if (serp.aussichtslos) {
        warne(
          `Die Ergebnisseite ist von sehr starken Domains besetzt. Der Artikel entsteht ` +
            `trotzdem — er zahlt dann auf das Thema und auf Zitierbarkeit ein, nicht auf ` +
            `Platz eins.`
        );
      }

      schritt(4, "Recherche in den rankenden Seiten");
      const recherche = await recherchiere(serp, { zielKeyword: thema.zielKeyword });
      melde(
        `${recherche.gelesen.length} Seite(n) gelesen, ${recherche.luecken.length} Lücke(n), ` +
          `${recherche.belege.length} belegbare Fremdzahl(en)`
      );

      schritt(5, "Redaktionsbriefing");
      const brief = await erstelleBrief(thema, serp, recherche);
      melde(`Eigenanteil laut Briefing: ${brief.eigenanteil}`);

      schritt(6, "Schreiben");
      const roh = await verfasse(brief, thema, [...bestand, ...fertige]);

      schritt(7, "Prüfen und nachbessern");
      const geprueft = await pruefeUndBessere(roh, brief);

      const befundZahl = { hart: 0, weich: 0 };
      try {
        const { pruefeArtikel } = await import("./lib/qualitaet.js");
        const befund = pruefeArtikel(geprueft.artikel);
        befundZahl.hart = befund.harteFehler.length;
        befundZahl.weich = befund.warnungen.length;
      } catch {
        /* Die Zahlen sind nur fürs Protokoll — sie dürfen den Lauf nicht kippen. */
      }

      if (befundZahl.hart > 0) {
        warne(
          `${befundZahl.hart} harte Befund(e) bleiben nach ${geprueft.durchgaenge} Durchgang/` +
            `Durchgängen stehen. Der Entwurf wird trotzdem abgelegt — ein Mensch entscheidet.`
        );
      }

      schritt(8, "In den Bestand einhängen");
      const aenderungen = await haengeEin(geprueft.artikel, [...bestand, ...fertige]);
      melde(`${aenderungen.length} Bestandsartikel verweisen jetzt auf den neuen`);

      fertige.push(geprueft.artikel);
      markiereErledigt(thema.id, geprueft.artikel.slug);

      protokoll.artikel.push({
        slug: geprueft.artikel.slug,
        titel: geprueft.artikel.titel,
        status: "entwurf",
        durchgaenge: geprueft.durchgaenge,
        harteFehler: befundZahl.hart,
        warnungen: befundZahl.weich,
      });
    } catch (ausnahme) {
      const text = ausnahme instanceof Error ? ausnahme.message : String(ausnahme);
      fehler(`Thema "${thema.id}" abgebrochen: ${text}`);
      protokoll.fehler.push(`${thema.id}: ${text}`);
      /* Weiter mit dem nächsten Thema. Ein einzelner Fehlschlag darf den Lauf
         nicht beenden — sonst kostet ein blockierter Seitenabruf den ganzen Tag. */
    }
  }

  /* ---------------------------------------------------------------------- */
  schritt(9, "Ablegen und gegenprüfen");
  /* ---------------------------------------------------------------------- */

  if (fertige.length === 0) {
    warne("Kein Artikel fertig geworden. Einzelheiten im Protokoll.");
    beendeProtokoll(protokoll);
    return 1;
  }

  const ablage = await legeAb(fertige);

  if (!ablage.testsGruen || !ablage.buildGruen) {
    fehler("Der Bestand ist nach dem Ablegen nicht stimmig. Ausgabe:");
    process.stdout.write((ablage.pruefausgabe ?? "") + "\n");
    protokoll.fehler.push("Tests oder Build nach dem Ablegen fehlgeschlagen");
    beendeProtokoll(protokoll);
    return 1;
  }

  beendeProtokoll(protokoll);
  return 0;
}

function beendeProtokoll(protokoll: ReturnType<typeof starteProtokoll>): void {
  protokoll.beendet = new Date().toISOString();

  const token = getTokenverbrauch();
  protokoll.kosten = {
    dataforseoUsd: getAusgaben().gesamtUsd,
    firecrawlCredits: getVerbrauch().credits,
    /* Zwischengespeicherte Eingabe zählt mit — sie ist billiger, aber nicht
       umsonst, und ein Protokoll, das sie verschweigt, unterschätzt den Lauf. */
    claudeTokenEin: token.ein + token.cacheGeschrieben + token.cacheGelesen,
    claudeTokenAus: token.aus,
  };

  const pfad = schreibeProtokoll(protokoll);

  melde("");
  melde("─".repeat(72));
  melde(`Protokoll: ${pfad}`);
  melde(
    `Kosten: DataForSEO ${protokoll.kosten.dataforseoUsd.toFixed(4)} USD · ` +
      `Firecrawl ${protokoll.kosten.firecrawlCredits} Credits · ` +
      `Claude ${protokoll.kosten.claudeTokenEin + protokoll.kosten.claudeTokenAus} Token`
  );

  void meldeAnWebhook(protokoll);
}

const direktAufgerufen = process.argv[1]?.includes("lauf");
if (direktAufgerufen) {
  main()
    .then((code) => process.exit(code))
    .catch((ausnahme: unknown) => {
      fehler(ausnahme instanceof Error ? ausnahme.message : String(ausnahme));
      process.exit(1);
    });
}
