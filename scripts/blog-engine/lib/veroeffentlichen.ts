import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Artikel } from "../../../src/lib/wissen/schema.js";
import { schreibeArtikel, artikelPfad } from "./artikel-io.js";
import { pruefeArtikel } from "./qualitaet.js";
import { meldeUrls, betroffeneUrls } from "./indexnow.js";
import { melde, warne, fehler } from "./protokoll.js";

/**
 * Schritt 10 — freigeben, committen, ausliefern. Der Auto-Modus.
 *
 * ⚠️ **Dieser Schritt macht Artikel öffentlich.** Er läuft nur, wenn er
 * ausdrücklich verlangt wird (`npm run blog:lauf -- --auto`) **und** die
 * Umgebung dafür eingerichtet ist. Ohne beides endet der Lauf wie bisher beim
 * Entwurf.
 *
 * ## Warum es ihn jetzt gibt
 *
 * Im Kopf von `09-ablegen.ts` steht, dass die menschliche Freigabe der
 * Unterschied zwischen einem verteidigungsfähigen Vorgehen und dem ist, was
 * Google „scaled content abuse" nennt — und dass, wer das ändert, es bewusst
 * tut und aufschreibt, warum. Hier ist das Warum.
 *
 * Ayham hat den Auto-Modus am 26.08.2026 verlangt, nachdem der Einwand
 * vorgetragen war. Das ist seine Entscheidung über das Risiko seiner Domain.
 *
 * ## Was dabei **nicht** aufgegeben wird
 *
 * Der Einwand richtete sich nie gegen Automatik an sich, sondern gegen
 * Veröffentlichung **ohne Prüfung**. Die Prüfung bleibt vollständig — sie wird
 * nur nicht mehr von einem Menschen ausgelöst:
 *
 * | Tor | Wirkung im Auto-Modus |
 * |---|---|
 * | Eigenanteil (`substanz`) | unverändert. Kein Thema ohne belegten Eigenanteil wird je produziert. Ist der Vorrat leer, erscheint nichts — das ist der vorgesehene Zustand. |
 * | Hausstil, 81 Regeln | **härter als von Hand.** `blog:freigeben` kennt `--trotzdem`; hier gibt es das nicht. Ein harter Befund blockiert, Punkt. |
 * | Tests und Build | laufen **nach** dem Statuswechsel erneut. Der Loader bricht bei jedem Schemaverstoß ab. |
 * | Name unter der Freigabe | **Pflicht.** Ohne `BLOG_ENGINE_FREIGABE_VON` veröffentlicht die Automatik nicht. |
 *
 * Der letzte Punkt ist der wichtigste. `freigabe.von` ist die Antwort auf die
 * Frage, wer für den Artikel geradesteht. Im Auto-Modus heißt der Name nicht
 * „ich habe diesen Artikel gelesen", sondern „ich stehe für das ein, was diese
 * Automatik unter meinem Namen veröffentlicht" — eine stehende redaktionelle
 * Verantwortung, wie sie jeder Herausgeber trägt. Deshalb muss sie ausdrücklich
 * erklärt werden und darf nicht aus einem Standardwert entstehen.
 *
 * ## Was der Schritt nicht anfasst
 *
 * Er stellt **nur die eigenen Dateien** bereit: die Artikel-JSONs, die beiden
 * `llms`-Dateien und das Laufprotokoll. Kein `git add -A`. Mehrere Sessions
 * teilen sich diesen Arbeitsbaum (siehe `CLAUDE.md`) — was eine andere Sitzung
 * gerade offen hat, geht die Automatik nichts an und darf nicht in ihrem Commit
 * landen.
 *
 * ⚠️ Ein Deploy liefert trotzdem **alles** aus, was in `main` liegt. Dagegen
 * hilft kein Filter, nur die Reihenfolge: erst rebasen, dann Tests und Build
 * über den Stand laufen lassen, der ausgeliefert wird, dann deployen. Genau so
 * läuft es hier.
 */

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

/** Was am Ende eines Auto-Laufs tatsächlich passiert ist. */
export interface VeroeffentlichungsErgebnis {
  freigegeben: string[];
  blockiert: Array<{ slug: string; grund: string }>;
  /** Kurzhash des Commits, oder null wenn nicht committet wurde. */
  commit: string | null;
  geschoben: boolean;
  deployt: boolean;
  indexnowGemeldet: boolean;
  /** Warum der Lauf nicht weiterlief, in Klartext. */
  abbruch: string | null;
}

function leeresErgebnis(abbruch: string | null): VeroeffentlichungsErgebnis {
  return {
    freigegeben: [],
    blockiert: [],
    commit: null,
    geschoben: false,
    deployt: false,
    indexnowGemeldet: false,
    abbruch,
  };
}

function heute(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Führt ein Programm ohne Shell aus.
 *
 * Argumentliste statt Kommandozeile: Slugs und Commit-Nachrichten stammen aus
 * erzeugtem Text. Eine Shell dazwischen wäre eine Einladung, über die niemand
 * nachdenken will.
 */
function fuehreAus(
  programm: string,
  argumente: string[],
  optionen: { erlaubeFehler?: boolean } = {}
): { erfolg: boolean; ausgabe: string } {
  try {
    const ausgabe = execFileSync(programm, argumente, {
      cwd: WURZEL,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 15 * 60 * 1000,
    });
    return { erfolg: true, ausgabe: String(ausgabe ?? "") };
  } catch (ausnahme) {
    const roh = ausnahme as { stdout?: unknown; stderr?: unknown; message?: string };
    const ausgabe =
      String(roh?.stdout ?? "") + String(roh?.stderr ?? "") || String(roh?.message ?? ausnahme);
    if (!optionen.erlaubeFehler) {
      /* Nicht werfen: der Aufrufer entscheidet, ob ein Fehlschlag den Lauf
         beendet. Ein geworfener Fehler mitten im Veröffentlichen würde den
         Bestand in einem Zustand hinterlassen, den niemand mehr einordnet. */
    }
    return { erfolg: false, ausgabe };
  }
}

/** Die letzten Zeilen einer Ausgabe — mehr braucht niemand zum Einordnen. */
function schwanz(text: string, zeilen = 30): string {
  return text.split("\n").slice(-zeilen).join("\n");
}

/* -------------------------------------------------------------------------- */
/* Vorbedingungen                                                             */
/* -------------------------------------------------------------------------- */

export interface Bereitschaft {
  bereit: boolean;
  /** Name, der unter die Freigabe kommt. Nur gesetzt, wenn `bereit`. */
  von: string;
  /** Warum nicht, in einem Satz. */
  grund: string;
}

/**
 * Darf die Automatik veröffentlichen?
 *
 * Wird **vor** dem Schreiben aufgerufen, nicht erst danach. Ein Lauf, der zwei
 * Artikel erzeugt und dann an einer fehlenden Variablen scheitert, hat Geld
 * ausgegeben und nichts erreicht.
 */
export function pruefeBereitschaft(): Bereitschaft {
  const von = (process.env.BLOG_ENGINE_FREIGABE_VON ?? "").trim();

  if (!von) {
    return {
      bereit: false,
      von: "",
      grund:
        "BLOG_ENGINE_FREIGABE_VON ist nicht gesetzt. Die Automatik veröffentlicht nicht " +
        "namenlos — dieser Name ist die Antwort auf die Frage, wer für die Artikel " +
        "geradesteht.",
    };
  }

  if (von.length < 2 || von.length > 80) {
    return {
      bereit: false,
      von: "",
      grund: `BLOG_ENGINE_FREIGABE_VON ist ${von.length} Zeichen lang, erlaubt sind 2 bis 80.`,
    };
  }

  const zweig = fuehreAus("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
  const aktuell = zweig.ausgabe.trim();
  if (!zweig.erfolg || aktuell !== "main") {
    return {
      bereit: false,
      von: "",
      grund:
        `Der Arbeitsbaum steht auf "${aktuell || "unbekannt"}", nicht auf main. ` +
        "Die Automatik wechselt den Zweig nicht — das wäre ein Eingriff in fremde Arbeit.",
    };
  }

  return { bereit: true, von, grund: "" };
}

/* -------------------------------------------------------------------------- */
/* Die Schritte                                                               */
/* -------------------------------------------------------------------------- */

/** Das Urteil über einen einzelnen Artikel — ohne Nebenwirkung, damit prüfbar. */
export interface Urteil {
  darf: boolean;
  /** Warum nicht, in einem Satz. Leer, wenn er darf. */
  grund: string;
  warnungen: number;
}

/**
 * Darf dieser Artikel ohne menschlichen Blick öffentlich werden?
 *
 * ⚠️ Kein `--trotzdem`. Von Hand darf ein Mensch einen harten Befund
 * überstimmen, weil er den Artikel gelesen hat und die Regel im Einzelfall
 * besser kennt als das Prüfmodul. Eine Automatik hat diese Kenntnis nicht —
 * für sie ist ein harter Befund das Ende, und zwar ausnahmslos.
 *
 * Weiche Warnungen halten nicht auf. Sie tun es auch bei der Freigabe von Hand
 * nicht: 81 Regeln erzeugen auf jedem echten Text ein paar Treffer, und eine
 * Schwelle, die niemand je erreicht, ist keine Prüfung, sondern eine Blockade.
 */
export function beurteile(artikel: Artikel): Urteil {
  const befund = pruefeArtikel(artikel);

  if (befund.harteFehler.length > 0) {
    const erste = befund.harteFehler
      .slice(0, 3)
      .map((f) => `${f.regel} (${f.fundstelle})`)
      .join("; ");
    return {
      darf: false,
      grund: `${befund.harteFehler.length} harte Befunde: ${erste}`,
      warnungen: befund.warnungen.length,
    };
  }

  /* Ein Artikel ohne belegten Eigenanteil kommt hier eigentlich nie an — das
     Tor steht schon bei der Themenauswahl. Die zweite Abfrage kostet nichts und
     schließt den Weg über eine von Hand angelegte Datei. */
  if (!artikel.substanz || !artikel.substanz.beschreibung) {
    return {
      darf: false,
      grund: "Kein belegter Eigenanteil (substanz). Wird nie veröffentlicht.",
      warnungen: befund.warnungen.length,
    };
  }

  return { darf: true, grund: "", warnungen: befund.warnungen.length };
}

/**
 * Setzt die Artikel auf `veroeffentlicht` — aber nur die, die `beurteile`
 * durchlässt.
 */
function gibFrei(
  artikel: Artikel[],
  von: string
): { freigegeben: Artikel[]; blockiert: Array<{ slug: string; grund: string }> } {
  const freigegeben: Artikel[] = [];
  const blockiert: Array<{ slug: string; grund: string }> = [];

  for (const eintrag of artikel) {
    const urteil = beurteile(eintrag);

    if (!urteil.darf) {
      blockiert.push({ slug: eintrag.slug, grund: urteil.grund });
      warne(`${eintrag.slug} bleibt Entwurf — ${urteil.grund}`);
      for (const f of pruefeArtikel(eintrag).harteFehler.slice(0, 5)) {
        warne(`    ✗ ${f.regel} (${f.fundstelle}): ${f.text}`);
      }
      continue;
    }

    if (urteil.warnungen > 0) {
      melde(`${eintrag.slug}: ${urteil.warnungen} Warnung(en), keine harten Befunde.`);
    }

    /* Erstveröffentlichung setzt `datum` auf heute — dieselbe Begründung wie in
       freigeben.ts: ein Artikel ist an dem Tag erschienen, an dem er
       freigegeben wurde, nicht an dem, an dem der Entwurf entstand. */
    const erstveroeffentlichung = !eintrag.freigabe;

    const fertig: Artikel = {
      ...eintrag,
      status: "veroeffentlicht",
      freigabe: { von, am: heute() },
      datum: erstveroeffentlichung ? heute() : eintrag.datum,
      aktualisiert: heute(),
    };

    schreibeArtikel(fertig);
    freigegeben.push(fertig);
    melde(`${eintrag.slug} freigegeben von ${von} (Auto-Modus).`);
  }

  return { freigegeben, blockiert };
}

/**
 * Erzeugt `llms.txt` neu und lässt Tests und Build über den geänderten Bestand
 * laufen.
 *
 * Die Reihenfolge ist nicht beliebig: `llms-txt.test.ts` vergleicht die beiden
 * Dateien gegen den Stand der Datendateien und bricht ab, sobald sie
 * auseinanderlaufen. Wer die Artikel umstellt, ohne `npm run llms` zu
 * wiederholen, hat einen roten Test — und zwar zu Recht, denn KI-Systeme lesen
 * diese Dateien lieber als das HTML.
 */
function pruefeBestand(): { gruen: boolean; ausgabe: string } {
  melde("Erzeuge llms.txt neu");
  const llms = fuehreAus("npm", ["run", "llms", "--silent"]);
  if (!llms.erfolg) return { gruen: false, ausgabe: schwanz(llms.ausgabe) };

  melde("Prüfe den Bestand: npm test");
  const test = fuehreAus("npm", ["test", "--silent"]);
  if (!test.erfolg) return { gruen: false, ausgabe: schwanz(test.ausgabe) };

  melde("Prüfe den Bestand: npm run build");
  const build = fuehreAus("npm", ["run", "build", "--silent"]);
  if (!build.erfolg) return { gruen: false, ausgabe: schwanz(build.ausgabe) };

  return { gruen: true, ausgabe: "" };
}

/**
 * Committet **nur die eigenen Dateien** und schiebt sie nach `origin/main`.
 *
 * `git add <pfad>` je Artikel statt `git add content/`: Legt eine andere
 * Sitzung gerade einen Artikel von Hand an, gehört er nicht in diesen Commit.
 * Und vor dem Schieben wird rebast, damit der Stand, den der Deploy ausliefert,
 * derselbe ist, über den eben Tests und Build liefen.
 */
function committeUndSchiebe(
  slugs: string[],
  laufId: string,
  von: string
): { commit: string | null; geschoben: boolean; grund: string } {
  const dateien = [
    ...slugs.map((slug) => path.relative(WURZEL, artikelPfad(slug))),
    "public/llms.txt",
    "public/llms-full.txt",
    /* Das Laufprotokoll gehört dazu. Zwei Gründe: Es ist der Nachweis, wie ein
       Artikel entstanden ist — Kosten, geprüfte Themen, Fehler —, und ohne ihn
       sammelt `content/seo/laeufe/` täglich eine unversionierte Datei an. Genau
       das macht das `git status --short` vor dem Deploy unbrauchbar, auf dem
       hier alles aufbaut. */
    `content/seo/laeufe/${laufId}.json`,
  ];

  for (const datei of dateien) {
    const zugefuegt = fuehreAus("git", ["add", "--", datei]);
    if (!zugefuegt.erfolg) {
      return { commit: null, geschoben: false, grund: `git add ${datei}: ${zugefuegt.ausgabe}` };
    }
  }

  /* Ältere Protokolle, die ein abgebrochener Lauf hinterlassen hat, gehen mit —
     sonst bleiben sie für immer unversioniert liegen. */
  fuehreAus("git", ["add", "--", "content/seo/laeufe"]);

  const bereit = fuehreAus("git", ["diff", "--cached", "--name-only"]);
  if (!bereit.ausgabe.trim()) {
    return { commit: null, geschoben: false, grund: "Nichts zu committen." };
  }

  const nachricht = [
    `Gratis-Wissen: ${slugs.length} Artikel veroeffentlicht (Lauf ${laufId})`,
    "",
    "Erzeugt von der Blog-Automatik, freigegeben im Auto-Modus.",
    `Verantwortlich laut BLOG_ENGINE_FREIGABE_VON: ${von}`,
    "",
    "Jeder Artikel hat die Qualitaetspruefung ohne harten Befund bestanden;",
    "im Auto-Modus gibt es kein --trotzdem. Tests und Build liefen ueber den",
    "Stand nach dem Statuswechsel.",
    "",
    ...slugs.map((slug) => `  - ${slug}`),
  ].join("\n");

  const commit = fuehreAus("git", ["commit", "-m", nachricht]);
  if (!commit.erfolg) {
    return { commit: null, geschoben: false, grund: `git commit: ${schwanz(commit.ausgabe, 10)}` };
  }

  const hash = fuehreAus("git", ["rev-parse", "--short", "HEAD"]).ausgabe.trim();
  melde(`Committet: ${hash}`);

  /* Rebase vor dem Schieben. Hat eine andere Sitzung inzwischen gepusht, liegt
     unser Commit sonst quer — und ein --force wäre an dieser Stelle das
     Falscheste von allem. */
  fuehreAus("git", ["fetch", "origin", "main"]);
  const rebase = fuehreAus("git", ["rebase", "origin/main"]);
  if (!rebase.erfolg) {
    fuehreAus("git", ["rebase", "--abort"]);
    return {
      commit: hash,
      geschoben: false,
      grund:
        "Rebase auf origin/main ist fehlgeschlagen — der Commit liegt lokal. " +
        "Ein Mensch muss den Konflikt ansehen.",
    };
  }

  /* `git push` schiebt ALLE lokalen Commits, nicht nur den eigenen — und der
     Deploy danach liefert sie aus. Wer morgen im Protokoll sucht, warum etwas
     live ist, das niemand freigegeben hat, findet die Antwort hier. Kein
     Abbruch: Diese Commits liegen in main, weil jemand sie dorthin gelegt hat.
     Sie zurückzuhalten wäre ein Eingriff in fremde Arbeit. */
  const mitlaeufer = fuehreAus("git", ["log", "--oneline", "origin/main..HEAD"])
    .ausgabe.trim()
    .split("\n")
    .filter((zeile) => zeile && !zeile.includes(nachricht.split("\n")[0]));

  if (mitlaeufer.length > 0) {
    warne(`Der Push nimmt ${mitlaeufer.length} fremde(n) Commit(s) mit:`);
    for (const zeile of mitlaeufer) warne(`    ${zeile}`);
  }

  const push = fuehreAus("git", ["push", "origin", "main"]);
  if (!push.erfolg) {
    return {
      commit: hash,
      geschoben: false,
      grund: `git push: ${schwanz(push.ausgabe, 10)}`,
    };
  }

  const hashNachRebase = fuehreAus("git", ["rev-parse", "--short", "HEAD"]).ausgabe.trim();
  melde(`Geschoben nach origin/main: ${hashNachRebase}`);
  return { commit: hashNachRebase, geschoben: true, grund: "" };
}

/**
 * Stößt den Deploy über die Coolify-API an.
 *
 * Nur mit `BLOG_ENGINE_DEPLOY=1`. Das Repo deployt bewusst nicht nach jedem
 * Push (siehe `CLAUDE.md`, Abschnitt Hosting); diese Variable ist die bewusste
 * Ausnahme und gehört erst gesetzt, wenn ein paar Läufe von Hand durchgesehen
 * wurden.
 */
async function deploye(): Promise<{ deployt: boolean; grund: string }> {
  if (process.env.BLOG_ENGINE_DEPLOY !== "1") {
    return {
      deployt: false,
      grund: "BLOG_ENGINE_DEPLOY steht nicht auf 1 — der Lauf endet beim Push.",
    };
  }

  /* `COOLIFY_API_BASE` steht in
     /home/deploy/KITech/infra/secrets/coolify-api-token.env und trägt dort das
     `/api/v1` bereits im Wert. Andere Stellen schreiben nur den Host. Beides
     muss gehen — ein doppeltes /api/v1 quittiert Coolify mit 404, und ein 404
     sähe im Protokoll aus wie „Anwendung gibt es nicht". */
  const basis = (process.env.COOLIFY_API_BASE ?? "")
    .replace(/\/+$/, "")
    .replace(/\/api\/v1$/, "");
  const token = process.env.COOLIFY_API_TOKEN;
  const uuid = process.env.COOLIFY_APP_UUID;

  if (!basis || !token || !uuid) {
    return {
      deployt: false,
      grund: "COOLIFY_API_BASE, COOLIFY_API_TOKEN oder COOLIFY_APP_UUID fehlt.",
    };
  }

  try {
    const antwort = await fetch(`${basis}/api/v1/deploy?uuid=${encodeURIComponent(uuid)}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(30_000),
    });

    if (!antwort.ok) {
      /* Bewusst ohne Antworttext: die Coolify-Antwort kann Pfade und Namen
         enthalten, die nicht ins Protokoll gehören. */
      return { deployt: false, grund: `Coolify antwortete mit ${antwort.status}.` };
    }

    melde("Deploy angestoßen.");
    return { deployt: true, grund: "" };
  } catch (ausnahme) {
    return {
      deployt: false,
      grund: `Coolify nicht erreichbar: ${ausnahme instanceof Error ? ausnahme.message : String(ausnahme)}`,
    };
  }
}

/**
 * Wartet, bis die neuen Adressen wirklich ausgeliefert werden.
 *
 * Ohne dieses Warten meldet IndexNow Adressen, die noch 404 liefern — und eine
 * gemeldete 404 ist schlechter als gar keine Meldung: Bing hat die Adresse dann
 * einmal gesehen und als fehlend verbucht.
 */
async function warteBisErreichbar(urls: string[], maxSekunden = 600): Promise<boolean> {
  if (urls.length === 0) return false;

  const frist = Date.now() + maxSekunden * 1000;
  const probe = urls[0];

  melde(`Warte auf die Auslieferung: ${probe}`);

  while (Date.now() < frist) {
    try {
      const antwort = await fetch(probe, {
        method: "HEAD",
        signal: AbortSignal.timeout(10_000),
      });
      if (antwort.ok) {
        melde("Die neue Seite wird ausgeliefert.");
        return true;
      }
    } catch {
      /* Während des Deploys ist die Seite kurz nicht erreichbar. Das ist der
         Normalfall, kein Grund aufzuhören. */
    }
    await new Promise((weiter) => setTimeout(weiter, 15_000));
  }

  warne(`${probe} war nach ${maxSekunden} s nicht erreichbar — IndexNow wird übersprungen.`);
  return false;
}

/* -------------------------------------------------------------------------- */
/* Der Ablauf                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Freigeben, committen, ausliefern, melden — in dieser Reihenfolge, und jeder
 * Schritt nur, wenn der vorige durchlief.
 *
 * **Fällt einer aus, bleibt es dabei.** Kein Wiederholen, kein Erzwingen. Der
 * Lauf meldet, wo er stehengeblieben ist; die Artikel liegen dann als Entwurf
 * oder als lokaler Commit da und warten auf einen Menschen. Ein
 * Veröffentlichungsschritt, der sich selbst über Hindernisse hinweghilft, ist
 * genau der, den man nachts nicht laufen lassen möchte.
 */
export async function veroeffentliche(
  artikel: Artikel[],
  laufId: string
): Promise<VeroeffentlichungsErgebnis> {
  const bereitschaft = pruefeBereitschaft();
  if (!bereitschaft.bereit) {
    fehler(`Auto-Modus nicht möglich: ${bereitschaft.grund}`);
    return leeresErgebnis(bereitschaft.grund);
  }

  const { freigegeben, blockiert } = gibFrei(artikel, bereitschaft.von);

  if (freigegeben.length === 0) {
    const grund = "Kein Artikel hat die Qualitätsprüfung bestanden — nichts veröffentlicht.";
    warne(grund);
    return { ...leeresErgebnis(grund), blockiert };
  }

  const bestand = pruefeBestand();
  if (!bestand.gruen) {
    fehler("Tests oder Build sind nach dem Statuswechsel rot. Nichts wird ausgeliefert.");
    process.stdout.write(bestand.ausgabe + "\n");
    /* Die Artikel stehen jetzt auf "veroeffentlicht", sind aber nicht
       committet — auf der Website ändert sich also nichts. Zurückschreiben wäre
       verlockend, verwischt aber die Spur: so sieht ein Mensch morgen genau
       den Zustand, in dem es hakte. */
    return {
      ...leeresErgebnis("Tests oder Build nach dem Statuswechsel fehlgeschlagen"),
      freigegeben: freigegeben.map((a) => a.slug),
      blockiert,
    };
  }

  const slugs = freigegeben.map((a) => a.slug);
  const git = committeUndSchiebe(slugs, laufId, bereitschaft.von);

  if (!git.geschoben) {
    warne(`Nicht geschoben: ${git.grund}`);
    return {
      freigegeben: slugs,
      blockiert,
      commit: git.commit,
      geschoben: false,
      deployt: false,
      indexnowGemeldet: false,
      abbruch: git.grund,
    };
  }

  const auslieferung = await deploye();
  if (!auslieferung.deployt) {
    melde(`Kein Deploy: ${auslieferung.grund}`);
    return {
      freigegeben: slugs,
      blockiert,
      commit: git.commit,
      geschoben: true,
      deployt: false,
      indexnowGemeldet: false,
      abbruch: auslieferung.grund,
    };
  }

  const cluster = [...new Set(freigegeben.map((a) => a.cluster))];
  const urls = betroffeneUrls(slugs, cluster);

  const erreichbar = await warteBisErreichbar(urls);
  let gemeldet = false;

  if (erreichbar) {
    try {
      gemeldet = await meldeUrls(urls);
    } catch (ausnahme) {
      warne(
        `IndexNow: ${ausnahme instanceof Error ? ausnahme.message : String(ausnahme)}`
      );
    }
  }

  return {
    freigegeben: slugs,
    blockiert,
    commit: git.commit,
    geschoben: true,
    deployt: true,
    indexnowGemeldet: gemeldet,
    abbruch: null,
  };
}
