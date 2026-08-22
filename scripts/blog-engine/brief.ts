import fs from "node:fs";
import path from "node:path";
import { ladeAlleArtikel, ladeThemenVorrat, slugAus, eindeutigerSlug } from "./lib/artikel-io.js";
import { melde, fehler } from "./lib/protokoll.js";
import type { Artikel } from "../../src/lib/wissen/schema.js";
import type { ThemaImVorrat } from "./lib/typen.js";

/**
 * Ein Redaktionsbriefing erzeugen — **ohne eine einzige bezahlte Anfrage.**
 *
 * ```
 * npm run blog:brief                 # zeigt, welche Themen bereitstehen
 * npm run blog:brief -- <thema-id>   # Briefing plus JSON-Gerüst
 * ```
 *
 * **Wofür das da ist.** Die volle Automatik (`npm run blog:lauf`) holt Keyword-
 * daten, liest die rankende Konkurrenz und lässt ein Modell schreiben. Das
 * kostet — wenig, aber es kostet, und es braucht drei Zugänge. Dieser Befehl
 * macht dieselbe Vorarbeit aus dem, was ohnehin im Repo liegt: der Themen-Vorrat,
 * der Artikelbestand, die Themenfelder, die Verlinkungslage.
 *
 * Heraus kommt ein Briefing, das ein Mensch — oder ein Assistent, der ohnehin
 * schon läuft — direkt zum Schreiben verwenden kann. Kein Schlüssel nötig, keine
 * Abrechnung, kein Wartelauf.
 *
 * **Was es nicht kann:** Es weiß nicht, was auf den ersten zehn Ergebnissen
 * steht. Diese Kenntnis ist der eigentliche Wert der bezahlten Recherche — sie
 * beantwortet die Frage, was der Artikel bringen muss, das dort fehlt. Ohne sie
 * muss diese Frage von Hand beantwortet werden. Das Briefing stellt sie deshalb
 * ausdrücklich, statt sie zu überspringen.
 */

const BRIEFING_ORDNER = path.join(process.cwd(), "content", "seo", "briefings");

interface Argumente {
  themaId: string | null;
  hilfe: boolean;
}

function leseArgumente(argv: string[]): Argumente {
  const args: Argumente = { themaId: null, hilfe: false };

  for (const wert of argv) {
    if (wert === "--hilfe" || wert === "-h") args.hilfe = true;
    else if (!wert.startsWith("--")) args.themaId = wert;
  }

  return args;
}

function schreibe(text: string): void {
  process.stdout.write(text + "\n");
}

function heute(): string {
  const jetzt = new Date();
  const monat = String(jetzt.getMonth() + 1).padStart(2, "0");
  const tag = String(jetzt.getDate()).padStart(2, "0");
  return `${jetzt.getFullYear()}-${monat}-${tag}`;
}

/* -------------------------------------------------------------------------- */
/* Verlinkungsziele                                                           */
/* -------------------------------------------------------------------------- */

interface Verlinkungsziel {
  ziel: string;
  eingehend: number;
  ankertexte: string[];
}

/**
 * Wohin dieser Artikel verlinken sollte — und mit welchen Ankertexten **nicht**.
 *
 * Die Auswertung von 23 Millionen internen Links (Zyppy, 1.800 Websites) findet
 * den stärksten Zusammenhang nicht bei der Zahl der Links, sondern bei der
 * Vielfalt der Ankertexte auf dieselbe Seite. Deshalb steht hier neben jedem
 * Ziel, welche Formulierungen schon vergeben sind: Der neue Link braucht eine
 * andere.
 *
 * Die Zahl daneben ist der Korridor-Hinweis. Bis etwa 45 eingehende Links steigt
 * der gemessene Zusammenhang mit Suchklicks, danach kehrt er sich um.
 */
function verlinkungsziele(bestand: Artikel[], thema: ThemaImVorrat): Verlinkungsziel[] {
  const bild = new Map<string, { anzahl: number; anker: Set<string> }>();

  for (const artikel of bestand) {
    for (const link of artikel.interneLinks) {
      const eintrag = bild.get(link.ziel) ?? { anzahl: 0, anker: new Set<string>() };
      eintrag.anzahl += 1;
      eintrag.anker.add(link.ankertext);
      bild.set(link.ziel, eintrag);
    }
  }

  /* Feste Ziele, die fast immer passen, plus die Artikel desselben Themas. */
  const kandidaten = new Set<string>([
    "/leistungen",
    "/referenzen",
    "/glossar",
    `/gratis-wissen/thema/${thema.cluster}`,
  ]);

  for (const artikel of bestand) {
    if (artikel.status !== "veroeffentlicht") continue;
    if (artikel.cluster === thema.cluster) {
      kandidaten.add(`/gratis-wissen/${artikel.slug}`);
    }
  }

  return [...kandidaten]
    .map((ziel) => ({
      ziel,
      eingehend: bild.get(ziel)?.anzahl ?? 0,
      ankertexte: [...(bild.get(ziel)?.anker ?? [])],
    }))
    .sort((a, b) => a.eingehend - b.eingehend);
}

/* -------------------------------------------------------------------------- */
/* Briefing                                                                   */
/* -------------------------------------------------------------------------- */

function baueBriefing(thema: ThemaImVorrat, bestand: Artikel[], slug: string): string {
  const veroeffentlicht = bestand.filter((a) => a.status === "veroeffentlicht");
  const imCluster = veroeffentlicht.filter((a) => a.cluster === thema.cluster);
  const ziele = verlinkungsziele(bestand, thema);

  const belegteKeywords = veroeffentlicht
    .map((a) => `\`${a.zielKeyword}\` (${a.slug})`)
    .join(" · ");

  const zeilen: string[] = [
    `# Briefing: ${thema.arbeitstitel}`,
    "",
    `Erzeugt am ${heute()} aus dem Repo — ohne bezahlte Abfragen.`,
    `Thema-Kennung: \`${thema.id}\` · Vorgeschlagener Slug: \`${slug}\``,
    "",
    "---",
    "",
    "## Die Frage, die vor allem anderen steht",
    "",
    "> **Was steht in diesem Artikel, das nicht auf den ersten zehn Ergebnissen steht?**",
    "",
    "Dieses Briefing kann sie nicht beantworten — es kennt die Ergebnisseite nicht.",
    "Wer den Artikel schreibt, beantwortet sie zuerst. Fällt die Antwort dünn aus,",
    "wird nicht geschrieben.",
    "",
    "Googles Messlatte, wörtlich aus der eigenen Anleitung: nichts veröffentlichen,",
    "was „could easily be produced by a generative AI model\".",
    "",
    "---",
    "",
    "## Auftrag",
    "",
    `| | |`,
    `|---|---|`,
    `| Zielkeyword | \`${thema.zielKeyword}\` |`,
    `| Thema | \`${thema.cluster}\` |`,
    `| Autor | \`${thema.autor}\` |`,
    `| Priorität | ${thema.prioritaet} |`,
  ];

  if (thema.fruehestens) zeilen.push(`| Frühestens | ${thema.fruehestens} |`);
  if (thema.spaetestens) zeilen.push(`| Spätestens | ${thema.spaetestens} |`);
  if (thema.notiz) zeilen.push(`| Notiz | ${thema.notiz} |`);

  zeilen.push("", "---", "");

  /* ---------------------------------------------------------------------- */
  /* Der Eigenanteil — der wichtigste Block                                  */
  /* ---------------------------------------------------------------------- */

  zeilen.push("## Der Eigenanteil");
  zeilen.push("");

  if (!thema.substanz) {
    zeilen.push(
      "⚠️ **Dieses Thema hat keinen belegten Eigenanteil.** Es wird nicht geschrieben,",
      "bevor `substanz` im Vorrat gefüllt ist.",
      "",
      "Was dort hineingehört: eine gemessene Zahl, eine Konfiguration aus einem echten",
      "Projekt, eine Entscheidung mit Begründung, ein Fehler mit Kosten, eine gelesene",
      "Primärquelle, ein zerlegter Ablauf. Nicht: „umfassende Erfahrung\", „aus vielen",
      "Kundenprojekten\", eine gute Zusammenfassung fremder Texte.",
      "",
      "Ausführlich: `.claude/skills/blog-seo/reference/substanz-gate.md`",
      ""
    );
  } else {
    zeilen.push(
      `**Art:** \`${thema.substanz.art}\``,
      "",
      `**Was:** ${thema.substanz.beschreibung}`,
      "",
      `**Woher:** ${thema.substanz.herkunft}`,
      ""
    );

    if (thema.substanz.material && thema.substanz.material.length > 0) {
      zeilen.push(
        "**Material, das wörtlich verwendet werden darf:**",
        "",
        ...thema.substanz.material.map((eintrag) => `- ${eintrag}`),
        ""
      );
    }

    zeilen.push(
      "Dieser Eigenanteil muss im Artikel **sichtbar** werden — nicht als Behauptung",
      "im Vorwort, sondern als Inhalt, den man nachvollziehen kann. Wenn er sich beim",
      "Schreiben als dünn herausstellt, ist das ein Befund, kein Hindernis: Thema",
      "zurücklegen, Notiz eintragen.",
      ""
    );
  }

  zeilen.push("---", "");

  /* ---------------------------------------------------------------------- */
  /* Abgrenzung                                                              */
  /* ---------------------------------------------------------------------- */

  zeilen.push("## Abgrenzung");
  zeilen.push("");

  if (imCluster.length === 0) {
    zeilen.push(
      `Im Thema \`${thema.cluster}\` steht noch kein Artikel. Dieser wird der erste —`,
      "er darf also breiter anlegen, was später aufgeteilt wird.",
      ""
    );
  } else {
    zeilen.push(
      `Diese Artikel stehen im selben Thema. Was ihnen gehört, gehört **nicht** in`,
      "diesen Artikel — sonst konkurrieren beide gegeneinander statt gegen den",
      "Wettbewerb:",
      ""
    );
    for (const artikel of imCluster) {
      zeilen.push(
        `- **${artikel.titel}** (\`${artikel.zielKeyword}\`)`,
        `  ${artikel.teaser}`
      );
    }
    zeilen.push("");
  }

  zeilen.push(
    "**Bereits vergebene Zielkeywords** — keines davon darf dieser Artikel anpeilen:",
    "",
    belegteKeywords || "(noch keine)",
    "",
    "---",
    ""
  );

  /* ---------------------------------------------------------------------- */
  /* Verlinkung                                                              */
  /* ---------------------------------------------------------------------- */

  zeilen.push(
    "## Interne Verlinkung",
    "",
    "Drei bis acht Links im Fließtext. **Der Ankertext muss wörtlich in dem Absatz",
    "stehen, auf den er gesetzt wird** — sonst wird der Link nicht gerendert und",
    "zählt trotzdem in jeder Auswertung. Beim Umstellen der Bestandsartikel waren",
    "das fünfzehn von fünfzehn.",
    "",
    "Der praktische Weg: erst den Absatz schreiben, dann eine Formulierung daraus",
    "als Ankertext eintragen.",
    "",
    "| Ziel | eingehend | schon vergebene Ankertexte |",
    "|---|---|---|"
  );

  for (const ziel of ziele) {
    const anker =
      ziel.ankertexte.length > 0
        ? ziel.ankertexte.map((a) => `„${a}"`).join(" · ")
        : "—";
    zeilen.push(`| \`${ziel.ziel}\` | ${ziel.eingehend} | ${anker} |`);
  }

  zeilen.push(
    "",
    "Ziele mit wenigen eingehenden Links zuerst. Der gemessene Zusammenhang mit",
    "Suchklicks steigt bis etwa 45 eingehende Links und kehrt sich danach um.",
    "Formulierungen, die in der rechten Spalte stehen, **nicht wiederverwenden** —",
    "Vielfalt der Ankertexte ist der stärkste Einzelbefund der Zyppy-Auswertung.",
    "",
    "---",
    ""
  );

  /* ---------------------------------------------------------------------- */
  /* Struktur und Hausstil                                                   */
  /* ---------------------------------------------------------------------- */

  zeilen.push(
    "## Struktur",
    "",
    "| | |",
    "|---|---|",
    "| Abschnitte | 5 bis 9 |",
    "| Überschriften als echte Frage | mehr als die Hälfte |",
    "| Umfang | 1.000 bis 1.800 Wörter |",
    "| Kernaussagen | 2 bis 4, jede ohne Kontext verständlich |",
    "| Häufige Fragen | 3 bis 5 |",
    "| Quellen | jede Fremdzahl, mit URL und Abrufdatum |",
    "",
    "Warum Fragen als Überschrift: In einer Auswertung von 18.012 verifizierten",
    "ChatGPT-Zitaten stammten 78,4 Prozent der frage-verknüpften Zitate aus einer H2.",
    "Warum die Kernaussagen oben stehen: 44,2 Prozent aller Zitate kamen aus dem",
    "ersten Drittel des Textes.",
    "",
    "## Hausstil, in Zahlen",
    "",
    "| | Zielwert |",
    "|---|---|",
    "| Wörter je Satz | 13–17 im Mittel, kein Satz über 32 |",
    "| Wörter je Absatz | 25–45, nie über 55 |",
    "| Sätze je Absatz | 2 bis 3 |",
    "| Em-Dash | mit Leerzeichen, höchstens einer je Satz, etwa jeder fünfte Satz |",
    "",
    "**Null Vorkommen:** `du` · `wir` · `Sie` im Artikelkörper · der Firmenname ·",
    "En-Dash im Fließtext · gerade Anführungszeichen · Semikolon · Ausrufezeichen ·",
    "Prozentzeichen · Abkürzungen wie `z. B.` oder `bzw.` · `Tool` · `LLM` ·",
    "`Use Case` · `Monitoring` · `könnte` · `eventuell` · `vielleicht`",
    "",
    "Der Artikelkörper spricht **niemanden** an. Der Leser erscheint als `man`,",
    "`jemand`, `wer`. Geduzt wird nur im CTA.",
    "",
    "Vollständig: `scripts/blog-engine/prompts/hausstil.md`",
    "",
    "---",
    "",
    "## Danach",
    "",
    "```bash",
    `npm run blog:pruefen -- ${slug} -v`,
    `npm run blog:freigeben -- ${slug} --von "Ayham Alkhalil"`,
    "npm test && npm run build",
    "```",
    ""
  );

  return zeilen.join("\n");
}

/* -------------------------------------------------------------------------- */
/* JSON-Gerüst                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Ein Gerüst mit allen Pflichtfeldern und Platzhaltern.
 *
 * Die Platzhalter sind absichtlich so formuliert, dass sie das Schema **nicht**
 * bestehen: Wer vergisst, ein Feld zu füllen, merkt es beim ersten `npm test`
 * statt beim Lesen der veröffentlichten Seite.
 */
function baueGeruest(thema: ThemaImVorrat, slug: string): unknown {
  return {
    slug,
    titel: thema.arbeitstitel,
    teaser: "TODO — ein Satz für Übersichtskarte und Meta-Beschreibung, 60 bis 280 Zeichen.",
    kategorie: "TODO",
    cluster: thema.cluster,
    zielKeyword: thema.zielKeyword,
    sekundaerKeywords: [],
    datum: heute(),
    aktualisiert: heute(),
    lesezeit: 7,
    autor: thema.autor,
    intro:
      "TODO — zwei bis drei Sätze. Kein Themen-Ankündigen, kein „In diesem Artikel\", " +
      "keine Zahl im ersten Satz. Der erste Satz benennt den Irrtum, nicht das Thema.",
    abschnitte: [
      {
        heading: "TODO — als Frage oder Aussage, nie als Etikett, nie mit Punkt am Ende",
        paragraphs: ["TODO — 25 bis 45 Wörter je Absatz, zwei bis drei Sätze."],
      },
    ],
    kernaussagen: [
      "TODO — ein Satz, der ohne Kontext verständlich ist. Definitionsform bevorzugt.",
      "TODO — noch einer.",
    ],
    fazit: "TODO — ein bis zwei Sätze. Umwertung plus Auflösung. Keine Aufforderung.",
    faq: [
      {
        frage: "TODO — eine echte Frage, wie sie jemand tippen würde",
        antwort: "TODO — die Antwort im ersten Satz, dann die Begründung.",
      },
    ],
    quellen: [],
    interneLinks: [
      {
        ziel: "/leistungen",
        ankertext: "TODO — muss wörtlich im Absatz stehen",
        abschnitt: 0,
      },
    ],
    substanz: thema.substanz
      ? {
          art: thema.substanz.art,
          beschreibung: thema.substanz.beschreibung,
          herkunft: thema.substanz.herkunft,
        }
      : {
          art: "prozesszerlegung",
          beschreibung: "TODO — dieses Thema hat keinen belegten Eigenanteil im Vorrat.",
          herkunft: "TODO",
        },
    cta: {
      heading: "TODO — 3 bis 7 Wörter, entwertet die Seite, auf der man steht",
      text: "TODO — eine Zeile, 12 bis 20 Wörter, beantwortet die Überschrift.",
    },
    status: "entwurf",
  };
}

/* -------------------------------------------------------------------------- */

function zeigeVorrat(vorrat: ThemaImVorrat[], bestand: Artikel[]): void {
  const belegt = new Set(
    bestand.filter((a) => a.status === "veroeffentlicht").map((a) => a.zielKeyword.toLowerCase())
  );

  const offen = vorrat
    .filter((thema) => !thema.erledigt)
    .filter((thema) => !belegt.has(thema.zielKeyword.toLowerCase()))
    .sort((a, b) => a.prioritaet - b.prioritaet);

  const mitSubstanz = offen.filter((thema) => thema.substanz);

  schreibe("");
  schreibe(`${offen.length} Themen offen, davon ${mitSubstanz.length} mit belegtem Eigenanteil.`);
  schreibe("");
  schreibe("Bereit zum Schreiben:");
  schreibe("");

  for (const thema of mitSubstanz.slice(0, 15)) {
    schreibe(`  ${String(thema.prioritaet).padStart(2)}  ${thema.id}`);
    schreibe(`      ${thema.arbeitstitel}`);
    schreibe(`      ${thema.substanz?.art} — ${thema.substanz?.beschreibung.slice(0, 88)}…`);
    schreibe("");
  }

  if (mitSubstanz.length > 15) {
    schreibe(`  … und ${mitSubstanz.length - 15} weitere.`);
    schreibe("");
  }

  schreibe("Briefing erzeugen:  npm run blog:brief -- <thema-id>");
  schreibe("");
}

function main(): number {
  const args = leseArgumente(process.argv.slice(2));

  if (args.hilfe) {
    schreibe("");
    schreibe("Redaktionsbriefing aus dem Repo erzeugen — ohne bezahlte Abfragen.");
    schreibe("");
    schreibe("  npm run blog:brief                 zeigt, welche Themen bereitstehen");
    schreibe("  npm run blog:brief -- <thema-id>   Briefing plus JSON-Gerüst");
    schreibe("");
    return 0;
  }

  const vorrat = ladeThemenVorrat();
  const bestand = ladeAlleArtikel();

  if (!args.themaId) {
    zeigeVorrat(vorrat, bestand);
    return 0;
  }

  const thema = vorrat.find((eintrag) => eintrag.id === args.themaId);

  if (!thema) {
    fehler(`Thema "${args.themaId}" steht nicht im Vorrat.`);
    schreibe("");
    schreibe("Verfügbare Kennungen: npm run blog:brief");
    return 1;
  }

  const slug = eindeutigerSlug(
    slugAus(thema.arbeitstitel),
    bestand.map((artikel) => artikel.slug)
  );

  fs.mkdirSync(BRIEFING_ORDNER, { recursive: true });

  const briefingPfad = path.join(BRIEFING_ORDNER, `${thema.id}.md`);
  fs.writeFileSync(briefingPfad, baueBriefing(thema, bestand, slug), "utf8");

  const geruestPfad = path.join(process.cwd(), "content", "wissen", `${slug}.json`);
  let geruestGeschrieben = false;

  if (fs.existsSync(geruestPfad)) {
    melde(`Datei existiert schon, Gerüst nicht überschrieben: ${path.relative(process.cwd(), geruestPfad)}`);
  } else {
    fs.writeFileSync(geruestPfad, JSON.stringify(baueGeruest(thema, slug), null, 2) + "\n", "utf8");
    geruestGeschrieben = true;
  }

  schreibe("");
  schreibe(`Briefing:  ${path.relative(process.cwd(), briefingPfad)}`);
  if (geruestGeschrieben) {
    schreibe(`Gerüst:    ${path.relative(process.cwd(), geruestPfad)}`);
  }
  schreibe("");

  if (!thema.substanz) {
    schreibe("⚠️  Dieses Thema hat keinen belegten Eigenanteil. Erst `substanz` im Vorrat");
    schreibe("   füllen, sonst entsteht genau die Sorte Artikel, die abgestraft wird.");
    schreibe("");
  }

  schreibe("Das Gerüst ist absichtlich schema-widrig — alle TODO-Felder fallen bei");
  schreibe("`npm test` auf. Was nicht gefüllt wird, fällt auf, bevor es live geht.");
  schreibe("");

  return 0;
}

process.exit(main());
