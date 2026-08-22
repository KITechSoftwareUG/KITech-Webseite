/**
 * QUALITÄTSTOR für automatisch erzeugte Blogartikel unter `/gratis-wissen`.
 *
 * Prüft einen fertigen `Artikel` (Datenmodell: `src/lib/wissen/schema.ts`) gegen
 * zwei Dinge, die das Zod-Schema nicht prüfen kann:
 *
 *   1. den **Hausstil** — die messbaren Kennzahlen aus dem Schreibstandard
 *      (Satzlängen, Anrede, Typografie, Belegpflicht für Zahlen),
 *   2. die **GEO-Struktur** — Frage-Überschriften, Definitionssatz, Entity-Dichte,
 *      Anteil strukturierter Elemente, interne Verlinkung.
 *
 * Das Schema entscheidet, ob ein Artikel *existieren* darf. Dieses Modul
 * entscheidet, ob er *veröffentlicht* werden darf. Beides zusammen ist der Grund,
 * warum eine tägliche Frequenz hier verantwortbar ist: Was durchfällt, wird nicht
 * veröffentlicht, sondern bleibt Entwurf und wartet auf einen Menschen.
 *
 * Herkunft der Regeln:
 *   - `grundlage__tonalitaet.md`, Abschnitt 2 (Satzbau-Kennzahlen) und
 *     Abschnitt 7 (Prüfliste vor der Veröffentlichung) — daraus stammen alle
 *     harten Zahlen. Sie sind an den handgeschriebenen Startartikeln in
 *     `src/data/wissen.ts` gemessen, nicht erfunden.
 *   - `content-creator/content/_agents/_lib/check-blog-slop.mjs` — die 50
 *     Slop-Muster und die metrischen Checks. Die IDs sind bewusst identisch
 *     übernommen, damit ein Befund hier und dort denselben Namen trägt.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * EM-DASH (—) IST HAUSSTANDARD UND NIEMALS EIN FEHLER.
 *
 * Anderswo gilt der Gedankenstrich als LLM-Verräter. Auf kitech-software.de ist
 * er die häufigste Satzfigur nach dem Doppelpunkt: 20 Stück auf 102 Sätze in den
 * handgeschriebenen Artikeln, ungefähr jeder fünfte Satz. Geprüft wird deshalb
 * ausschließlich seine *Verwendung* (Leerzeichen auf beiden Seiten, höchstens
 * einer pro Satz, Dichte im Korridor 0,15–0,45) — nie sein Vorkommen.
 *
 * Der En-Dash (–) ist das Gegenteil: im Fließtext verboten, 0 Treffer im ganzen
 * sichtbaren Text der Website. Wer beide Zeichen verwechselt, dreht diese Regel
 * genau um und lässt den Prüfer gegen den eigenen Hausstil laufen.
 * ────────────────────────────────────────────────────────────────────────────
 */

import type { Artikel } from "@/lib/wissen/schema";

/* ══════════════════════════════════════════════════════════════════════════
   TEIL 0 — Ergebnis-Typen
   ══════════════════════════════════════════════════════════════════════════ */

export interface Befund {
  /** Stabile Regel-ID (kebab-case). Bei portierten Mustern identisch mit `check-blog-slop.mjs`. */
  regel: string;
  /** `hart` = Artikel wird abgelehnt. `weich` = Warnung, Mensch entscheidet. */
  schwere: "hart" | "weich";
  /** Wo im Artikel: `abschnitte[2].paragraphs[1]`, `intro`, `faq[0].antwort` … */
  fundstelle: string;
  /** Der Textausschnitt, an dem es hängt. */
  text: string;
  /** Warum das ein Befund ist — die Begründung, nicht nur das Verbot. */
  hinweis: string;
}

export interface Pruefergebnis {
  /** `true`, wenn kein harter Fehler vorliegt. Warnungen kippen das Urteil nicht. */
  bestanden: boolean;
  harteFehler: Befund[];
  warnungen: Befund[];
  kennzahlen: Record<string, number>;
}

/* ══════════════════════════════════════════════════════════════════════════
   TEIL 1 — Den Artikel in prüfbare Felder zerlegen

   Ein Artikel ist kein Fließtext, sondern ein Objekt. Welche Regel wo gilt,
   hängt an der Rolle des Feldes: Im CTA ist „du“ richtig, im Artikelkörper ein
   harter Fehler. Ohne diese Trennung würde der Prüfer den eigenen Standard
   verletzen, der genau diesen Unterschied vorschreibt.
   ══════════════════════════════════════════════════════════════════════════ */

type Rolle =
  | "teaser"
  | "intro"
  | "kernaussage"
  | "ueberschrift"
  | "absatz"
  | "bullet"
  | "tabelle"
  | "faq"
  | "fazit"
  | "cta";

interface Feld {
  fundstelle: string;
  text: string;
  rolle: Rolle;
}

/**
 * Der Artikelkörper: alles, was der Leser als Artikel liest.
 * **Ohne `cta`** (dort ist die Anrede erlaubt) und **ohne `substanz`**
 * (interne Prüfspur, erscheint nie auf der Seite — ein Repo-Pfad darin darf
 * „Tool“ heißen, ohne dass das ein Stilfehler wäre).
 */
const ROLLEN_KOERPER: Rolle[] = [
  "teaser",
  "intro",
  "kernaussage",
  "ueberschrift",
  "absatz",
  "bullet",
  "tabelle",
  "faq",
  "fazit",
];

/** Körper plus CTA — für Typografie, die überall gilt. */
const ROLLEN_SICHTBAR: Rolle[] = [...ROLLEN_KOERPER, "cta"];

/** Alles, was aus ganzen Sätzen besteht — Grundlage der Satzlängen-Prüfung. */
const ROLLEN_PROSA: Rolle[] = ["intro", "kernaussage", "absatz", "bullet", "faq", "fazit"];

/**
 * Der Fließtext im engeren Sinn. Die Kennzahlen aus Abschnitt 2 des
 * Schreibstandards sind an genau dieser Menge gemessen (Intro + Absätze), nicht
 * an Überschriften, Listen oder FAQ — sonst verschieben sich alle Korridore.
 */
const ROLLEN_FLIESSTEXT: Rolle[] = ["intro", "absatz", "fazit"];

/** Strukturierte Elemente für die GEO-Quote. */
const ROLLEN_STRUKTUR: Rolle[] = ["bullet", "tabelle", "faq"];

function sammleFelder(artikel: Artikel): Feld[] {
  const felder: Feld[] = [];
  const zu = (fundstelle: string, text: string, rolle: Rolle) => {
    if (typeof text === "string" && text.trim().length > 0) {
      felder.push({ fundstelle, text, rolle });
    }
  };

  zu("teaser", artikel.teaser, "teaser");
  zu("intro", artikel.intro, "intro");

  (artikel.kernaussagen ?? []).forEach((k, i) => zu(`kernaussagen[${i}]`, k, "kernaussage"));

  (artikel.abschnitte ?? []).forEach((abschnitt, i) => {
    zu(`abschnitte[${i}].heading`, abschnitt.heading, "ueberschrift");
    (abschnitt.paragraphs ?? []).forEach((p, j) =>
      zu(`abschnitte[${i}].paragraphs[${j}]`, p, "absatz")
    );
    (abschnitt.bullets ?? []).forEach((b, j) =>
      zu(`abschnitte[${i}].bullets[${j}]`, b, "bullet")
    );
    (abschnitt.unterabschnitte ?? []).forEach((u, j) => {
      zu(`abschnitte[${i}].unterabschnitte[${j}].heading`, u.heading, "ueberschrift");
      (u.paragraphs ?? []).forEach((p, k) =>
        zu(`abschnitte[${i}].unterabschnitte[${j}].paragraphs[${k}]`, p, "absatz")
      );
    });
    if (abschnitt.tabelle) {
      abschnitt.tabelle.kopf.forEach((z, j) =>
        zu(`abschnitte[${i}].tabelle.kopf[${j}]`, z, "tabelle")
      );
      abschnitt.tabelle.zeilen.forEach((zeile, j) =>
        zeile.forEach((zelle, k) =>
          zu(`abschnitte[${i}].tabelle.zeilen[${j}][${k}]`, zelle, "tabelle")
        )
      );
    }
  });

  (artikel.faq ?? []).forEach((f, i) => {
    zu(`faq[${i}].frage`, f.frage, "faq");
    zu(`faq[${i}].antwort`, f.antwort, "faq");
  });

  zu("fazit", artikel.fazit, "fazit");

  if (artikel.cta) {
    zu("cta.heading", artikel.cta.heading, "cta");
    zu("cta.text", artikel.cta.text, "cta");
  }

  return felder;
}

/* ══════════════════════════════════════════════════════════════════════════
   TEIL 2 — Textwerkzeuge

   Portiert aus `check-blog-slop.mjs`. Absichtlich dieselbe Zerlegung: Wenn beide
   Werkzeuge unterschiedlich zählen, streiten zwei Prüfer über dieselbe Datei.
   ══════════════════════════════════════════════════════════════════════════ */

/** Abkürzungen, die einen Satz nicht beenden. Im Hausstil verboten — hier steht
 *  die Liste trotzdem, damit ein Verstoß die Satzzählung nicht zusätzlich
 *  verfälscht und der Befund am richtigen Satz hängt. */
const ABKUERZUNGEN = [
  "z. B", "z.B", "d. h", "d.h", "u. a", "u.a", "i. d. R", "i.d.R", "bzw", "ca",
  "vgl", "evtl", "ggf", "inkl", "exkl", "max", "min", "Nr", "Abs", "Art", "Dr",
  "Prof", "Mio", "Mrd", "usw", "etc", "sog", "bspw", "Hrsg", "Aufl",
];

export function woerter(text: string): string[] {
  return text.match(/[\p{L}\p{N}][\p{L}\p{N}\-'’]*/gu) ?? [];
}

export function saetze(text: string): string[] {
  const P = "\uE001"; // Private Use Area: längentreuer Platzhalter, kein Wortzeichen
  let t = String(text).replace(/\s+/g, " ");
  for (const abk of ABKUERZUNGEN) {
    const esc = abk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    t = t.replace(new RegExp(`(^|[\\s(])${esc}\\.`, "g"), (m) => m.split(".").join(P));
  }
  // Ordinal- und Dezimalzahlen schützen: „1. Halbjahr“, „3.5“ bleiben ein Satz.
  t = t.replace(/(\d)\.(?=\s*\d)/g, `$1${P}`);
  t = t.replace(/(\d)\.(?=\s+[A-ZÄÖÜ])/g, `$1${P}`);
  return t
    .split(/(?<=[.!?…])["“”»«’)\]]?\s+/)
    .map((s) => s.split(P).join(".").trim())
    .filter((s) => s.length > 1 && /[a-zäöüßA-ZÄÖÜ]/.test(s));
}

/** Absätze eines mehrzeiligen Feldes (das Intro darf Leerzeilen enthalten). */
function absaetzeAus(text: string): string[] {
  return String(text)
    .split(/\n[ \t]*\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => woerter(p).length >= 3);
}

function mittelwert(zahlen: number[]): number {
  if (zahlen.length === 0) return 0;
  return zahlen.reduce((a, b) => a + b, 0) / zahlen.length;
}

function median(zahlen: number[]): number {
  if (zahlen.length === 0) return 0;
  const s = [...zahlen].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Standardabweichung. Gleichförmige Satzlängen sind der KI-Marker, der sich
 *  durch Wortaustausch nicht beheben lässt — deshalb wird sie gemessen und
 *  nicht geschätzt. */
function standardabweichung(zahlen: number[]): number {
  if (zahlen.length < 2) return 0;
  const m = mittelwert(zahlen);
  return Math.sqrt(mittelwert(zahlen.map((z) => (z - m) ** 2)));
}

function runde(x: number, stellen = 3): number {
  if (!Number.isFinite(x)) return 0;
  return Number(x.toFixed(stellen));
}

function ausschnitt(text: string, index: number, laenge: number, rand = 45): string {
  const start = Math.max(0, index - rand);
  const ende = Math.min(text.length, index + laenge + rand);
  const roh = text.slice(start, ende).replace(/\s+/g, " ").trim();
  return (start > 0 ? "… " : "") + roh + (ende < text.length ? " …" : "");
}

/* ══════════════════════════════════════════════════════════════════════════
   TEIL 3 — Musterkatalog

   `maxTreffer` = so viele Vorkommen gehen noch durch (Default 0).
   `hartAb`     = ab dieser Trefferzahl wird aus weich hart (Häufungs-Marker).
   `rollen`     = in welchen Feldern das Muster überhaupt gilt.
   ══════════════════════════════════════════════════════════════════════════ */

interface Muster {
  regel: string;
  regex: RegExp;
  schwere: "hart" | "weich";
  rollen: Rolle[];
  hinweis: string;
  maxTreffer?: number;
  hartAb?: number;
  /**
   * Text in deutschen Anführungszeichen von der Prüfung ausnehmen.
   *
   * Nur für die Anrede-Regeln gesetzt, und aus einem belegten Grund: Eines der
   * drei Intro-Muster des Schreibstandards ist der zitierte Satz aus der Praxis
   * — „Wir haben die Lizenzen, es benutzt nur keiner.“ Der Artikel spricht dort
   * nicht, er zitiert. Ohne diese Ausnahme würde der Prüfer genau das Muster
   * verbieten, das der Standard als Vorbild führt.
   *
   * Für alles andere gilt die Ausnahme **nicht**: Ein Firmenname, eine
   * Buzzword-Kette oder ein gerades Anführungszeichen bleiben auch im Zitat
   * das, was sie sind.
   */
  zitateAusnehmen?: boolean;
}

/** Maskiert „…“-Spannen längentreu, damit Fundstellen im Original stimmen. */
function maskiereZitate(text: string): string {
  return text.replace(/„[^“\n]{0,400}“/g, (m) => m.replace(/[^\n]/g, "\uE002"));
}

/* ── 3a — Hausstil: die harten Zahlen aus dem Schreibstandard ───────────── */

export const HAUSSTIL_MUSTER: Muster[] = [
  {
    regel: "anrede-du",
    zitateAusnehmen: true,
    regex: /\b(?:du|dich|dir|dein(?:e[mnrs]?|es|er)?|euch|euer|eure[mnrs]?)\b/gi,
    schwere: "hart",
    rollen: ROLLEN_KOERPER,
    hinweis:
      "HART, weil der Registerunterschied zwischen Blog und Funnel daran hängt: Der Artikelkörper spricht niemanden an (`man`, `jemand`, `wer`), gemessen 0× du/ihr/wir in wissen.ts. Wer über die Suche kommt, sucht eine Antwort — geduzt wird erst im CTA darunter, und genau dort ist es richtig.",
  },
  {
    regel: "anrede-wir",
    zitateAusnehmen: true,
    regex: /\b(?:wir|uns|unser(?:e[mnrs]?|es|er)?)\b/gi,
    schwere: "hart",
    rollen: ROLLEN_KOERPER,
    hinweis:
      "HART, weil „wir“ den Artikel zum Werbetext macht. Dieselbe These steht im Fazit absenderlos („Falsche KI kostet mehr als keine KI“) und im Sales Letter als Markenaussage („Das ist der Satz hinter allem, was wir hier machen“) — nur die erste Form gehört in einen Artikel.",
  },
  {
    regel: "firmenname-im-koerper",
    regex: /\bKI\s?-?\s?Tech\b/gi,
    schwere: "hart",
    rollen: ROLLEN_KOERPER,
    hinweis:
      "HART, weil der Absender im Article-JSON-LD und im CTA-Banner steht und sonst nirgends. Ein Firmenname im Fließtext verwandelt die Antwort in eine Anzeige und kostet genau das Vertrauen, wegen dem jemand über die Suche gekommen ist. In `cta` und `substanz` ist er erlaubt.",
  },
  {
    regel: "hausstil-en-dash",
    // Zahlenspanne (3–4) ist laut Standard zulässig und wird unten separat weich gemeldet.
    regex: /(?<!\d\s?)–(?!\s?\d)/g,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART, weil der En-Dash im sichtbaren Text 0 Treffer hat und der Em-Dash (—) das Hausmittel ist. Die En-Dashes in `segments.ts` und `glossary.ts` sind Altlast aus den Vite-Vorgängerseiten und ausdrücklich kein Vorbild. Zulässig bleibt er nur als Zahlenspanne und als SEO-Titeltrenner.",
  },
  {
    regel: "hausstil-en-dash-zahlenspanne",
    regex: /\d\s?–\s?\d/g,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "WEICH: Zahlenspannen (3–4 Tipps) sind die einzige zulässige Verwendung des En-Dash. Trotzdem gemeldet, damit niemand über die Ausnahme versehentlich das Zeichen einführt.",
  },
  {
    regel: "hausstil-em-dash-ohne-leerzeichen",
    // Der Em-Dash selbst ist NIE ein Fehler — nur diese Schreibweise.
    regex: /\S—|—\S/g,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART, aber es geht nicht gegen den Em-Dash: Er ist Hausstandard. Verlangt ist nur die Schreibweise mit Leerzeichen auf beiden Seiten — `Wort—Wort` hat im gesamten sichtbaren Text 0 Treffer und ist ein Rohausgabe-Artefakt.",
  },
  {
    regel: "hausstil-anfuehrungszeichen",
    regex: /["']|”|“(?=[\p{L}\p{N}])/gu,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART, weil Deutsch „unten-oben“ setzt (U+201E … U+201C) und gerade Zoll-Zeichen direkt aus der Chat-Ausgabe stammen. 0 gerade Anführungszeichen im gesamten sichtbaren Text — ein Treffer beweist, dass niemand den Text gelesen hat.",
  },
  {
    regel: "hausstil-satzzeichen",
    regex: /[;!%&…]|\.\.\./g,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: Semikolon, Ausrufezeichen, Auslassungspunkte, Prozentzeichen und kaufmännisches Und haben im sichtbaren Text der Website je 0 Treffer. Statt Semikolon steht ein Punkt, statt `%` das Wort Prozent, statt `&` das Wort und.",
  },
  {
    regel: "hausstil-abkuerzung",
    regex:
      /\b(?:z\.\s?B\.|bzw\.|etc\.|u\.\s?a\.|d\.\s?h\.|ggf\.|inkl\.|exkl\.|ca\.|evtl\.|i\.\s?d\.\s?R\.|u\.\s?U\.|zzgl\.|bspw\.|vgl\.)/gi,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: 0 Treffer im sichtbaren Text. Beispiele werden mit Doppelpunkt eingeführt, nicht mit „z. B.“, und Fachbegriffe stehen ausgeschrieben („Auftragsverarbeitungsvertrag“, nicht „AVV“). Eigennamen wie ERP, CRM, DSGVO oder EU AI Act bleiben unangetastet.",
  },
  {
    regel: "hausstil-anglizismus",
    regex:
      /\b(?:tools?|toolsets?|llms?|use[\s-]?cases?|monitoring|insights?|deep[\s-]?dives?|learnings?|best[\s-]?practices?|quick[\s-]?wins?|low[\s-]?hanging[\s-]?fruits?|mindsets?|workflows?|features?)\b/gi,
    schwere: "hart",
    rollen: ROLLEN_KOERPER,
    hinweis:
      "HART, weil es für jedes dieser Wörter ein deutsches gibt und der Bestand es belegt: Werkzeug 3× / Tool 0×, Sprachmodell 3× / LLM 0×, Anwendungsfall / Use Case 0×, Überwachung / Monitoring 0×. Englisch bleibt nur, wo es der Eigenname der Sache ist (AWS Bedrock, Azure OpenAI Service).",
  },
  {
    regel: "hausstil-konjunktiv-weichspueler",
    regex:
      /\b(?:könnte(?:st|n)?|koennte(?:st|n)?|eventuell|vielleicht|womöglich|woemoeglich|unter\s+umständen|unter\s+umstaenden)\b/gi,
    schwere: "hart",
    rollen: ROLLEN_KOERPER,
    hinweis:
      "HART, und zwar als einzige Ausnahme von der Abtönungspflicht: Abgetönt wird die *Häufigkeit* („fast immer“, „meist“, „in den seltensten Fällen“) — nie die *Aussage*. Die Konjunktiv-Weichspüler haben 0 Treffer im gesamten sichtbaren Text der Website.",
  },
];

/* ── 3b — Slop-Muster, portiert aus `check-blog-slop.mjs` ───────────────── */
/* IDs unverändert übernommen: ein Befund heißt hier wie dort gleich.        */

export const SLOP_MUSTER: Muster[] = [
  {
    regel: "floskel-heutige-welt",
    regex:
      /\bin\s+(?:der\s+heutigen|unserer\s+heutigen|der\s+modernen)\s+(?:schnelllebigen\s+|digitalen\s+|vernetzten\s+|modernen\s+|dynamischen\s+)?(?:welt|zeit|geschäftswelt|arbeitswelt|gesellschaft|wirtschaft)\b|\bheutzutage\s+ist\s+es\s+wichtiger\s+denn\s+je\b/gi,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: der häufigste LLM-Artikelanfang im Deutschen. Sagt nichts, verortet nichts, funktioniert für jedes Thema — genau deshalb erzeugt ihn ein Modell, wenn es keinen echten Einstieg hat. Der Standard verlangt stattdessen den Irrtum im ersten Satz.",
  },
  {
    regel: "floskel-digitales-zeitalter",
    regex:
      /\bim\s+(?:heutigen\s+)?(?:digitalen|technologischen|modernen|neuen)\s+zeitalter\b|\bim\s+zeitalter\s+(?:von|der|des)\b|\bin\s+der\s+ära\s+(?:der|des|von)\b|\bim\s+zuge\s+der\s+digitalisierung\b/gi,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: Epochen-Rahmung ohne Aussage. Ein Fachtext benennt einen Zeitpunkt, ein Gesetz oder eine Zahl — kein „Zeitalter“.",
  },
  {
    regel: "floskel-in-einer-welt",
    regex:
      /\bin\s+einer\s+(?:welt|zeit|branche|ära)\s*,\s*in\s+der\b|\bin\s+einer\s+welt\s+voller\b/gi,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: Filmtrailer-Einstieg. Baut eine Kulisse statt einer Behauptung und ist ein Standardgriff generierter Einleitungen.",
  },
  {
    regel: "floskel-redaktioneller-kommentar",
    regex:
      /\bes\s+(?:ist|gilt|sei|bleibt|wäre)\s+(?:auch\s+|jedoch\s+|dabei\s+|zudem\s+|hier\s+|allerdings\s+|dennoch\s+)?(?:wichtig|entscheidend|wesentlich|hilfreich|ratsam|essenziell)\s*,?\s*zu\s+(?:beachten|bemerken|erwähnen|betonen|wissen|berücksichtigen|verstehen)\b|\bes\s+(?:ist|sei)\s+(?:auch\s+)?(?:erwähnenswert|bemerkenswert|anzumerken|angemerkt|hervorzuheben)\b|\bes\s+(?:bleibt|gilt)\s+festzuhalten\b|\bes\s+(?:versteht\s+sich\s+von\s+selbst|liegt\s+auf\s+der\s+hand|ist\s+kein\s+geheimnis|steht\s+außer\s+frage)\b/gi,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: redaktioneller Selbstkommentar. Der Text spricht über seine eigene Wichtigkeit, statt die Sache zu sagen. Streichen kostet nie Information.",
  },
  {
    regel: "floskel-artikel-ankuendigung",
    regex:
      /\bin\s+diesem\s+(?:artikel|beitrag|blogbeitrag|blogartikel|text|leitfaden|ratgeber|guide)\s+(?:werden\s+wir|erfährst\s+du|erfahren\s+sie|zeigen\s+wir|schauen\s+wir|beleuchten\s+wir|gehen\s+wir|lernst\s+du|lernen\s+sie)\b|\bdieser\s+(?:artikel|beitrag|leitfaden|guide)\s+(?:beleuchtet|zeigt|erklärt|liefert|gibt\s+(?:dir|ihnen))\b|\bwir\s+werfen\s+einen\s+(?:genaueren\s+)?blick\s+auf\b|\bbevor\s+wir\s+(?:starten|beginnen|einsteigen)\b/gi,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: Inhaltsverzeichnis in Prosa. Der Leser will die Antwort, nicht die Ankündigung der Antwort. Der Standard verbietet „In diesem Artikel“ ausdrücklich für den Einstieg.",
  },
  {
    regel: "floskel-zusammenfassung",
    regex:
      /\b(?:zusammenfassend|abschließend|alles\s+in\s+allem|unterm\s+strich|im\s+großen\s+und\s+ganzen|insgesamt)\s+(?:lässt\s+sich|kann\s+man|kann\s+gesagt|bleibt\s+(?:festzuhalten|zu\s+sagen)|ist\s+festzuhalten|sei\s+(?:gesagt|angemerkt)|betrachtet)\b|\bwie\s+(?:wir|sie)\s+gesehen\s+haben\b|\bwir\s+haben\s+gesehen\s*,\s*dass\b|\bzusammengefasst\s*:/gi,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: Schlussformel, die den Artikel referiert statt ihn zu Ende zu bringen. Das Fazit fasst laut Standard nicht zusammen, es setzt den Schlusspunkt (Umwertung + Auflösung).",
  },
  {
    regel: "ueberschrift-fazit",
    regex:
      /^[ \t]{0,3}(?:fazit|zusammenfassung|schlussfolgerung|schlusswort|key\s*takeaways?|takeaways?|das\s+wichtigste\s+in\s+kürze|auf\s+einen\s+blick)[ \t]*[:*]{0,3}[ \t]*$/gim,
    schwere: "weich",
    rollen: ["ueberschrift"],
    hinweis:
      "WEICH: Standard-Schlussbaustein des generierten Artikelschemas. Nicht per se falsch — aber jede Überschrift soll eine Aussage oder eine Frage sein, nie ein Etikett. Das `fazit` ist ohnehin ein eigenes Feld.",
  },
  {
    regel: "floskel-eintauchen",
    regex:
      /\b(?:lass(?:t)?\s+uns|lassen\s+sie\s+uns)\s+(?:gemeinsam\s+)?(?:tiefer\s+|kurz\s+)?ein\s?tauchen\b|\btauchen\s+wir\s+(?:gemeinsam\s+)?(?:tiefer\s+|kurz\s+)?ein\b|\b(?:tief|tiefer|genauer)\s+ein(?:zu)?tauchen\b|\beintauchen\s+in\s+die\s+welt\b|\bdeep[\s-]?dive\b|\blass(?:t)?\s+uns\s+(?:beginnen|starten|loslegen)\b/gi,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: wörtliche Übersetzung von „let's dive in“. Im deutschen Fachtext ein Fremdkörper und einer der zuverlässigsten Einzelmarker überhaupt.",
  },
  {
    regel: "floskel-welt-der",
    regex:
      /\bdie\s+(?:faszinierende\s+|spannende\s+|komplexe\s+|bunte\s+|schnelllebige\s+)?welt\s+(?:der|des|von)\b/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    hinweis: "WEICH: Themen-Rahmung statt Thema. Ein Fachartikel benennt den Gegenstand direkt.",
  },
  {
    regel: "floskel-naechstes-level",
    regex:
      /\bauf\s+(?:das|ein)\s+(?:nächste[sn]?|neue[sn]?|höhere[sn]?)\s+(?:level|niveau)\b|\bnext[\s-]level\b|\bdas\s+volle\s+potenzial\s+(?:aus)?schöpfen\b|\bdas\s+potenzial\s+(?:voll\s+)?ausschöpfen\b/gi,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: leerer Aufstiegs-Topos aus dem Marketing-Korpus. Beschreibt keine Veränderung, die man messen könnte. „KI auf dem nächsten Level“ steht wörtlich auf der noGo-Liste des Stimmprofils.",
  },
  {
    regel: "vage-autoritaet",
    regex:
      /\b(?:viele\s+|zahlreiche\s+)?(?:expert(?:en|innen)|fachleute|studien|untersuchungen|branchenberichte|beobachter|kritiker|analysten)\s+(?:sind\s+sich\s+einig|zeigen|belegen|zufolge|argumentieren|betonen|weisen\s+darauf\s+hin|gehen\s+davon\s+aus)\b|\blaut\s+(?:aktuellen\s+)?(?:studien|expert(?:en|innen)|branchenberichten|schätzungen)\b|\bstudien\s+(?:haben\s+)?(?:gezeigt|belegt)\b|\bes\s+wird\s+geschätzt\s*,\s*dass\b/gi,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: Autorität ohne Quelle. Auf einer Firmenwebsite nicht nur schlechter Stil, sondern nach § 5 UWG angreifbar, sobald daraus eine Werbeaussage wird. Wer eine Studie zitiert, trägt sie in `quellen` ein.",
  },
  {
    regel: "floskel-weiterer-punkt",
    regex:
      /\bein\s+weiterer\s+(?:wichtiger|entscheidender|zentraler|wesentlicher|interessanter)\s+(?:punkt|aspekt|faktor|vorteil|grund)\b|\bein\s+weiteres\s+(?:wichtiges|zentrales|entscheidendes)\s+(?:element|merkmal|argument)\b|\bnicht\s+zu\s+vergessen\s*[,:]/gi,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: Füllnaht zwischen zwei Listenpunkten, die in Fließtext gegossen wurden. Verrät, dass der Text aus einer Aufzählung entstanden ist.",
  },
  {
    regel: "floskel-spielt-eine-rolle",
    regex:
      /\bspielt\s+(?:dabei\s+|hier\s+|hierbei\s+)?eine\s+(?:wichtige|entscheidende|zentrale|große|maßgebliche|tragende|nicht\s+zu\s+unterschätzende)\s+rolle\b|\bist\s+von\s+(?:entscheidender|zentraler|großer)\s+bedeutung\b|\bnimmt\s+eine\s+(?:zentrale|wichtige)\s+(?:rolle|stellung)\s+ein\b/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "WEICH: Bedeutungsbehauptung ohne Wirkung. Sagt, dass etwas wichtig sei, statt zu sagen, was es tut.",
  },
  {
    regel: "chat-artefakt",
    regex:
      /\bals\s+(?:KI|AI)[\s-]?(?:sprachmodell|modell|assistent|system)\b|\bich\s+hoffe\s*,\s*(?:das|dies|dieser\s+artikel)\s+hilft\b|\b(?:stand|bis\s+zu)\s+meine[smr]\s+letzten\s+(?:updates?|wissensstand(?:es)?)\b|\bmöchte[snt]?\s+(?:du|sie)\s*,\s*dass\s+ich\b|\bhier\s+ist\s+(?:dein|ihr|der\s+überarbeitete|ein\s+entwurf|die\s+überarbeitete)\b|^[ \t]*(?:natürlich|selbstverständlich|gerne|klar)\s*[!,]/gim,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: Rest der Chat-Oberfläche, der beim Kopieren mitgekommen ist. Eindeutigster aller Marker — kein menschlicher Autor schreibt so in einen Blogartikel.",
  },
  {
    regel: "anglizismus-uebersetzt",
    regex:
      /\bwenn\s+es\s+darum\s+geht\b|\bam\s+ende\s+des\s+tages\b|(?:^|[.!?]\s+)auf\s+der\s+(?:anderen|einen)\s+seite\b|\bin\s+der\s+lage\s+sein\s*,\s*zu\b|\bes\s+geht\s+darum\s*,\s*(?:zu\s+)?verstehen\b/gi,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: Direktübersetzungen („when it comes to“, „at the end of the day“, „on the other hand“). Grammatisch korrekt, idiomatisch fremd — typisch für ein Modell, das im Englischen denkt.",
  },
  {
    regel: "floskel-zahlreiche-vorteile",
    regex:
      /\b(?:zahlreiche|unzählige|zahllose|vielfältige|verschiedenste|eine\s+vielzahl\s+(?:von|an))\s+(?:vorteile|möglichkeiten|chancen|optionen|anwendungsfälle|einsatzmöglichkeiten|lösungen|faktoren)\b/gi,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: Mengenbehauptung statt Aufzählung. Wer die Vorteile kennt, nennt sie. Der Standard verlangt an dieser Stelle das konkrete Ding statt des Oberbegriffs.",
  },
  {
    regel: "floskel-vage-hilfe",
    regex:
      /\b(?:dies|das)\s+könnte\s+(?:hilfreich|nützlich|sinnvoll)\s+sein\b|\bein\s+guter\s+weg\s*,\s*(?:dies|das)\s+zu\s+erreichen\b|\bein\s+bewährter\s+ansatz\s+(?:ist|besteht\s+darin)\b|\bhier\s+sind\s+(?:einige|ein\s+paar)\s+(?:tipps|möglichkeiten|beispiele|ansätze|schritte)\b/gi,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: Ratgeber-Leerlauf. Empfiehlt etwas, ohne sich festzulegen — und trifft damit genau den Funnel-Grundsatz, dass ein Artikel ein Problem radikal gut löst statt breit zu erklären.",
  },
  {
    regel: "floskel-leerformel",
    regex:
      /\bhinterlässt\s+(?:einen\s+)?bleibenden\s+eindruck\b|\bein\s+(?:echter\s+)?wendepunkt\b|\btief\s+verwurzelt\b|\bvon\s+unschätzbarem\s+wert\b|\bdas\s+herzstück\b|\bnicht\s+zu\s+unterschätzen\b|\bin\s+aller\s+munde\b|\bder\s+schlüssel\s+zum\s+erfolg\b|\b(?:chancen|möglichkeiten)\s+und\s+(?:herausforderungen|risiken|grenzen)\b|\bherausforderungen\s+und\s+(?:chancen|möglichkeiten|lösungen)\b|\bsteht\s+vor\s+(?:mehreren\s+|großen\s+|zahlreichen\s+|einigen\s+)?herausforderungen\b|\bvor-\s+und\s+nachteile\s+abwägen\b/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "WEICH: entweder Pathos ohne Gegenstand oder der Ausgewogenheits-Reflex des Modells — zu jedem Punkt die Gegenseite, damit nichts falsch sein kann. Ergebnis ist ein Text ohne Position.",
  },
  {
    regel: "rhetorischer-opener",
    regex:
      /^[ \t>*-]{0,4}(?:kennst\s+du\s+das|kennen\s+sie\s+das|stell(?:en\s+sie\s+sich|\s+dir)\s+vor|haben\s+sie\s+sich\s+(?:schon\s+)?(?:einmal\s+|mal\s+)?gefragt|hast\s+du\s+dich\s+(?:schon\s+)?(?:einmal\s+|mal\s+)?gefragt|was\s+wäre\s*,\s*wenn)\b/gim,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "WEICH: Standard-Hook aus dem Copywriting-Korpus. Am Artikelanfang fast immer generiert — und Fragezeichen gehören laut Standard in Titel und Listenpunkte, nicht als rhetorische Frage in den Absatz.",
  },
  {
    regel: "floskel-immer-mehr",
    regex:
      /\bimmer\s+mehr\s+(?:menschen|unternehmen|firmen|betriebe|kunden|nutzer|anwender|organisationen)\b|\bimmer\s+häufiger\s+(?:setzen|nutzen|verwenden)\b/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "WEICH: Trendbehauptung ohne Zahl. Auf einer Firmenwebsite zudem eine Werbeaussage, die belegt sein müsste.",
  },
  {
    regel: "nicht-nur-sondern-auch",
    regex: /\bnicht\s+nur\b[^.!?\n]{1,120}?\bsondern\s+auch\b/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    maxTreffer: 1,
    hartAb: 3,
    hinweis:
      "WEICH ab dem zweiten Mal: der meistgenannte deutsche LLM-Satzbau (negativer Parallelismus). Einmal pro Artikel ist normale Sprache, ab zwei Vorkommen ist es das Modell. Nicht zu verwechseln mit „nicht X, sondern Y“ — das ist Hausstil (R8).",
  },
  {
    regel: "nicht-x-sondern-y",
    regex:
      /\bes\s+geht\s+(?:hier\s+|dabei\s+)?nicht\s+(?:nur\s+)?um\b[^.!?\n]{1,100}?\bsondern\b|\bnicht\s+die\s+frage\s*,\s*ob\b[^.!?\n]{1,80}?\bsondern\b|\bweniger\s+\S+\s*,\s*mehr\s+\S+\s*[.!]/gi,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: rhetorische Umkehr als Füllmuster. Klingt nach Einsicht, transportiert aber nur eine Umformulierung derselben Aussage. Der Hausstil verlangt bei „nicht X“ ein echtes „sondern Y“ mit neuer Information.",
  },
  {
    regel: "antithese-satzpaar",
    regex: new RegExp(
      "\\b(Das ist|Das war|Es ist|Es geht|Wir sind|Wir bauen|Wir machen|Sie sind|Das bedeutet|Das heißt)\\s+(kein|keine|nicht|nichts)\\b[^.!?\\n]{0,100}[.!?]\\s+\\1\\b(?!\\s+(?:kein|keine|nicht|nichts))",
      "gi"
    ),
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: zwei Sätze mit identischem Subjekt, erst negiert, dann positiv. Ein Mensch variiert die zweite Hälfte, das Modell kopiert den Satzanfang.",
  },
  {
    regel: "schlagzeilen-antithese",
    regex:
      /\b[\wäöüßÄÖÜ-]{3,}\s+ist\s+tot\s*[.!:]|\bvergiss\s+[\wäöüßÄÖÜ-]{3,}\s*[.!:]|\b[\wäöüßÄÖÜ-]{3,}\s+ist\s+die\s+zukunft\s*[.!:]/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "WEICH: LinkedIn-Schlagzeilenlogik im Blogartikel. Erzeugt Widerspruch statt Erkenntnis und stammt fast immer aus einem Hook-Generator.",
  },
  {
    regel: "sowohl-als-auch",
    regex: /\bsowohl\b[^.!?\n]{1,100}?\bals\s+auch\b/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    maxTreffer: 1,
    hartAb: 4,
    hinweis:
      "WEICH: Vollständigkeits-Konstruktion. In Häufung ein Zeichen dafür, dass der Text jede Aufzählung symmetrisch abschließen will, statt zu gewichten.",
  },
  {
    regel: "dreier-adjektivkette",
    regex:
      /\b[\wäöüß]{4,}(?:ig|isch|lich|iv|abel|ibel|bar|sam|haft|voll|los|ent|ant)\s*,\s*[\wäöüß]{4,}(?:ig|isch|lich|iv|abel|ibel|bar|sam|haft|voll|los|ent|ant)\s+und\s+[\wäöüß]{4,}(?:ig|isch|lich|iv|abel|ibel|bar|sam|haft|voll|los|ent|ant)\b/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    maxTreffer: 1,
    hartAb: 3,
    hinweis:
      "WEICH: die Dreier-Adjektivkette („schnell, sicher und skalierbar“) ist die Signatur-Kadenz generierter Werbeprosa. Das dritte Glied trägt fast nie eigene Information.",
  },
  {
    regel: "bullet-fett-leadin",
    // In der JSON-Welt gibt es kein Markdown-Listenlayout mehr. Dasselbe Muster
    // erscheint hier als „Begriff: Erklärung“ in jedem Punkt — dagegen steht
    // R13: eine Liste pro Artikel, und sie beantwortet eine Frage.
    regex: /^[^:\n]{2,45}:\s+\S/g,
    schwere: "weich",
    rollen: ["bullet"],
    maxTreffer: 3,
    hartAb: 6,
    hinweis:
      "WEICH in Häufung: Stichwort, Doppelpunkt, Erklärsatz — dreimal identisch ist das Standard-Listenlayout jedes Sprachmodells. Die Definitionsliste (`Begriff: Erklärung`) ist im Hausstil erlaubt, aber nur als *eine* Liste im Artikel mit drei bis vier Punkten.",
  },
  {
    regel: "emoji-im-text", // in check-blog-slop.mjs: "emoji-ueberschrift"
    regex:
      // Variationsselektor (FE0F) steht bewusst ausserhalb der Zeichenklasse:
      // in der Klasse waere er ein kombinierendes Zeichen und die Regel unzuverlaessig.
      /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}]|\u{FE0F}/gu,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: Emoji sind ein gelistetes KI-Anzeichen und passen nicht in den Hausstil (scharfkantig, ohne Deko). Im sichtbaren Text der Website: 0 Treffer.",
  },
  {
    regel: "fettschrift-inflation",
    regex: /\*\*[^*\n]{1,90}\*\*|<(?:strong|b)>[^<\n]{1,90}<\/(?:strong|b)>/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    maxTreffer: 6,
    hartAb: 15,
    hinweis:
      "WEICH: Das Modell markiert jeden Begriff als wichtig, weil es nicht gewichten kann. In JSON-Artikeln ist Markdown ohnehin unerwünscht — die Darstellung setzt die Auszeichnung.",
  },
  {
    regel: "uebergang-darueber-hinaus",
    regex: /\bdarüber\s+hinaus\b/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    maxTreffer: 1,
    hartAb: 4,
    hinweis:
      "WEICH: der Übergang, den LLMs zwischen zwei beliebige Absätze setzen. Er behauptet eine Steigerung, die es inhaltlich nicht gibt.",
  },
  {
    regel: "uebergang-zudem-ausserdem",
    regex: /\b(?:zudem|außerdem|ausserdem|ebenso|zusätzlich)\b/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    maxTreffer: 3,
    hartAb: 8,
    hinweis:
      "WEICH: additive Übergänge in Serie kennzeichnen eine abgearbeitete Stichpunktliste. Menschliche Absätze hängen kausal zusammen, nicht additiv.",
  },
  {
    regel: "uebergang-gehoben",
    regex:
      /\b(?:des\s+weiteren|desweiteren|überdies|ferner|gleichwohl|nichtsdestotrotz|nichtsdestoweniger|mithin|indes|nicht\s+zuletzt|vor\s+diesem\s+hintergrund|in\s+diesem\s+zusammenhang|in\s+diesem\s+kontext)\b/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    hartAb: 3,
    hinweis:
      "WEICH: Behördenregister. Diese Konnektoren kommen in gesprochener Fachsprache praktisch nicht vor.",
  },
  {
    regel: "uebergang-letztendlich",
    regex: /\b(?:letztendlich|letzten\s+endes|schlussendlich|im\s+endeffekt)\b/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    maxTreffer: 1,
    hartAb: 4,
    hinweis:
      "WEICH: Pseudo-Schlussmarker mitten im Text. Kündigt eine Zuspitzung an, die dann nicht kommt.",
  },
  {
    regel: "hedge-kann-helfen",
    regex:
      /\bkann(?:\s+(?:dir|ihnen|dabei|dazu|hierbei))?\s+(?:helfen|unterstützen|beitragen|behilflich\s+sein)\b|\bkönnen(?:\s+(?:dir|ihnen|dabei|dazu))?\s+(?:helfen|unterstützen|beitragen)\b/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    maxTreffer: 1,
    hartAb: 4,
    hinweis:
      "WEICH: unverbindliche Nutzenaussage. Wer weiß, was ein Werkzeug leistet, schreibt, was es tut.",
  },
  {
    regel: "hedge-konjunktiv",
    // „könnte“ ist oben hart geregelt; hier bleiben nur die Formen, die der
    // Schreibstandard nicht ausdrücklich verbietet.
    regex: /\b(?:dürfte|dürften|mag\s+sein|müsste|müssten)\b/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    maxTreffer: 2,
    hartAb: 6,
    hinweis:
      "WEICH: Konjunktivdichte ist der statistische Fingerabdruck von RLHF-Vorsicht. Ein Fachtext, der berät, behauptet — er spekuliert nicht in jedem dritten Satz.",
  },
  {
    regel: "hedge-moeglicherweise",
    regex: /\b(?:möglicherweise|gegebenenfalls|vermutlich|wahrscheinlich|potenziell)\b/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    maxTreffer: 2,
    hartAb: 7,
    hinweis:
      "WEICH: Abschwächungsvokabular in Serie. Erzeugt einen Text, der zu allem eine Einschränkung mitliefert und deshalb zu nichts eine Aussage macht.",
  },
  {
    regel: "hedge-in-vielen-faellen",
    regex:
      /\bin\s+(?:vielen|manchen|einigen|den\s+meisten|bestimmten)\s+fällen\b|\bin\s+der\s+regel\b|\bje\s+nach\s+(?:anwendungsfall|kontext|situation|bedarf|unternehmen)\b|\bes\s+(?:kommt\s+(?:ganz\s+)?darauf\s+an|hängt\s+(?:ganz\s+)?davon\s+ab)\b/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    maxTreffer: 1,
    hartAb: 5,
    hinweis:
      "WEICH: Allquantor-Ausweichung. Ersetzt die konkrete Bedingung („ab 50 Belegen im Monat“) durch eine unbestimmte Menge.",
  },
  {
    regel: "hedge-oft-haeufig",
    regex:
      /\b(?:oft|oftmals|häufig|meist|meistens|tendenziell|generell|grundsätzlich|typischerweise|in\s+aller\s+regel)\b/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    maxTreffer: 4,
    hartAb: 10,
    hinweis:
      "WEICH und bewusst großzügig: Abtönen der *Häufigkeit* ist im Blog Pflicht, nicht Schwäche („fast immer“, „meist“, „in den seltensten Fällen“). Erst die Dichte zeigt, dass der Text systematisch der Festlegung ausweicht.",
  },
  {
    regel: "leere-superlative",
    regex:
      /\b(?:revolutionär\w*|bahnbrechend\w*|wegweisend\w*|beispiellos\w*|atemberaubend\w*|unvergleichlich\w*|ohnegleichen|spielverändernd\w*|game[\s-]?changer\w*|meilenstein\w*)\b/gi,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: Werbesprache ohne Referenz und wörtlich auf der noGo-Liste des Stimmprofils. Unbelegte Spitzenstellungsbehauptungen sind nach UWG angreifbar.",
  },
  {
    regel: "consulting-buzzword",
    regex:
      /\b(?:transformativ\w*|nahtlos\w*|tiefgreifend\w*|ganzheitlich\w*|holistisch\w*|skalierbar\w*|synergie\w*|paradigmenwechsel|disruptiv\w*|schlüsselfertig\w*|zukunftssicher\w*|hochmodern\w*|state[\s-]of[\s-]the[\s-]art|cutting[\s-]edge)\b/gi,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: genau die Wörter, die deutsche Detektor-Listen als auffälligste LLM-Marker führen — und dieselben, die das Stimmprofil verbietet (revolutionär, disruptiv, transformativ, nahtlos, skalierbar als leeres Adjektiv).",
  },
  {
    regel: "weiche-buzzwords",
    regex:
      /\b(?:maßgeschneidert\w*|massgeschneidert\w*|innovativ\w*|proaktiv\w*|intuitiv\w*|robust\w*|vielfältig\w*|vielseitig\w*|essenziell\w*|essentiell\w*|umfassend\w*|akribisch\w*|immersiv\w*|prädiktiv\w*|visionär\w*|renommiert\w*|dynamisch\w*|mühelos|reibungslos|leistungsstark\w*|zuverlässig\w*|effizient\w*)\b/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    maxTreffer: 3,
    hartAb: 9,
    hinweis:
      "WEICH: einzeln legitim, in Dichte ein Marker. Das Modell füllt jede Substantivstelle mit einem positiv besetzten Adjektiv, weil das Werbekorpus es so vormacht.",
  },
  {
    regel: "ki-branchen-buzzword",
    regex:
      /\bKI[\s-]?(?:gestützt|getrieben|basiert|gesteuert|gestützte[nmrs]?|basierte[nmrs]?)\b|\b(?:intelligente|smarte)\s+lösungen\b|\bdigitale\s+transformation\b|\b(?:datengetrieben\w*|data[\s-]driven)\b/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    maxTreffer: 2,
    hartAb: 8,
    hinweis:
      "WEICH: Branchenjargon aus Agentur-Content. Er signalisiert Zugehörigkeit, nicht Kompetenz — und macht den Artikel von jedem anderen KI-Artikel ununterscheidbar.",
  },
  {
    regel: "aufwertungsverben",
    regex:
      /\b(?:entfessel|beflügel|verschlank|aufwert|revolutionier|demokratisier|katapultier|transformier|maximier|potenzier)\w*\b|\bneu\s+definier\w+\b|\bdas\s+potenzial\s+entfalten\b/gi,
    schwere: "weich",
    rollen: ROLLEN_SICHTBAR,
    maxTreffer: 1,
    hartAb: 5,
    hinweis:
      "WEICH: Verben mit Wachstumspathos statt Vorgangsbeschreibung. „Wir revolutionieren die Buchhaltung“ sagt weniger als „der Abgleich läuft jetzt nächtlich“.",
  },
  {
    regel: "partizipialkonstruktion",
    regex:
      /\b(?:gewährleistend|hervorhebend|betonend|widerspiegelnd|ermöglichend|sicherstellend|unterstreichend|verdeutlichend|schaffend|bietend)\b/gi,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: nachgestelltes Partizip Präsens ist im Englischen Standard („…, ensuring that …“) und im Deutschen praktisch ungrammatisch. Direkter Übersetzungsfehler des Modells.",
  },
  {
    regel: "typo-doppelte-leerzeichen",
    regex: /\S {2,}\S/g,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: entsteht beim maschinellen Zusammensetzen von Satzfragmenten. Ein Mensch, der den Text gelesen hätte, hätte es gesehen.",
  },
  {
    regel: "typo-leerzeichen-vor-satzzeichen",
    regex: /[\wäöüßÄÖÜ)\]“”] +[,.;:!?](?=\s|$)/gm,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART: französische Interpunktionsregel, im Deutschen falsch. Typischer Artefaktfehler nach Übersetzungs- oder Zusammensetzschritten.",
  },
  {
    regel: "typo-englische-zahlen",
    regex: /\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b|\b\d+\.\d{1,2}\s*(?:prozent|mio|millionen|milliarden)\b/gi,
    schwere: "hart",
    rollen: ROLLEN_SICHTBAR,
    hinweis:
      "HART statt weich wie in der Vorlage: Komma als Tausender- und Punkt als Dezimaltrenner ist englische Konvention und macht Kennzahlen um Faktor 1000 falsch lesbar. Auf einer Seite, die Zahlen belegen muss, ist eine falsch lesbare Zahl kein Schönheitsfehler. Dezimaltrennzeichen ist das Komma.",
  },
];

export const MUSTER: Muster[] = [...HAUSSTIL_MUSTER, ...SLOP_MUSTER];

/* ══════════════════════════════════════════════════════════════════════════
   TEIL 4 — Prüfläufe
   ══════════════════════════════════════════════════════════════════════════ */

function pruefeMuster(felder: Feld[], befunde: Befund[]): void {
  for (const muster of MUSTER) {
    const relevant = felder.filter((f) => muster.rollen.includes(f.rolle));
    const treffer: { feld: Feld; text: string }[] = [];

    for (const feld of relevant) {
      const pruefText = muster.zitateAusnehmen ? maskiereZitate(feld.text) : feld.text;
      muster.regex.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = muster.regex.exec(pruefText)) !== null) {
        if (m[0].length === 0) {
          muster.regex.lastIndex++;
          continue;
        }
        treffer.push({ feld, text: ausschnitt(feld.text, m.index, m[0].length) });
        if (treffer.length >= 60) break;
      }
      if (treffer.length >= 60) break;
    }

    const erlaubt = muster.maxTreffer ?? 0;
    if (treffer.length <= erlaubt) continue;

    const schwere: "hart" | "weich" =
      muster.hartAb && treffer.length >= muster.hartAb ? "hart" : muster.schwere;
    const zusatz =
      erlaubt > 0 ? ` (${treffer.length}× gefunden, erlaubt ${erlaubt})` : "";

    // Jede Fundstelle einzeln melden, bis zu zehn: Wer korrigiert, braucht die
    // Stelle, nicht die Anzahl.
    for (const t of treffer.slice(0, 10)) {
      befunde.push({
        regel: muster.regel,
        schwere,
        fundstelle: t.feld.fundstelle,
        text: t.text,
        hinweis: muster.hinweis + zusatz,
      });
    }
  }
}

/**
 * Höflichkeits-„Sie“ von anaphorischem „Sie“ trennen.
 *
 * Der Schreibstandard hält fest: In `wissen.ts` sind alle „Sie“-Treffer
 * anaphorische Pronomen („Sie bindet Budget“ = die falsche KI). Ein pauschales
 * Verbot würde also korrekte Sätze abweisen. Unterscheidungsmerkmal: Das
 * anaphorische „sie“ steht kleingeschrieben, außer am Satzanfang. Ein
 * großgeschriebenes „Sie“ **mitten im Satz** ist praktisch immer die Anrede.
 */
function pruefeHoeflichkeitsSie(felder: Feld[], befunde: Befund[]): void {
  const anrede = /\b(?:Sie|Ihnen|Ihre[mnrs]?|Ihr)\b/g;
  for (const feld of felder) {
    if (!ROLLEN_KOERPER.includes(feld.rolle)) continue;
    for (const satz of saetze(maskiereZitate(feld.text))) {
      anrede.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = anrede.exec(satz)) !== null) {
        // Nicht nur der Satzanfang zählt, sondern jeder Teilsatzanfang: Der
        // Doppelpunkt ist in diesem Register das Arbeitspferd, und dahinter
        // steht das anaphorische Pronomen ständig — „Falsche KI kostet mehr als
        // keine KI: Sie bindet Budget" ist Hausstil, keine Anrede. Der Em-Dash
        // trägt denselben nachgestellten Anschluss.
        const davor = satz.slice(0, m.index).replace(/[\s"'’»«]+$/, "");
        if (davor === "" || /[.!?:;—([„]$/.test(davor)) continue;
        befunde.push({
          regel: "anrede-sie",
          schwere: "hart",
          fundstelle: feld.fundstelle,
          text: ausschnitt(satz, m.index, m[0].length),
          hinweis:
            "HART: Die Höflichkeitsform kommt auf der ganzen Website nicht vor — eine Seite, die ab dem Hero duzt, wirkt mit einem gesiezten Artikel wie zwei Firmen. Anaphorisches „Sie“ am Satzanfang ist erlaubt und wird hier nicht gemeldet.",
        });
      }
    }
  }
}

/**
 * Satz- und Absatzlängen als harte Obergrenzen.
 *
 * Die Zahlen sind gemessen, nicht gesetzt: längster Satz im Bestand 32 Wörter,
 * längster Absatz 54. Beides sind Deckel, keine Ziele — der Korridor
 * (13–17 Wörter je Satz, 25–45 je Absatz) steht weiter unten als Warnung.
 */
function pruefeLaengen(felder: Feld[], befunde: Befund[]): void {
  for (const feld of felder) {
    if (ROLLEN_PROSA.includes(feld.rolle)) {
      // Die 32 sind am Fließtext gemessen (Intro und Absätze der drei
      // Startartikel). In FAQ-Antworten und Listenpunkten steht dieselbe Zahl
      // als Warnung: Dort trägt ein langer Satz regelmäßig eine Aufzählung
      // („Fünf Muster wiederholen sich: …"), und die Messreihe deckt diese Form
      // nicht ab. Eine harte Grenze aus einer fremden Grundgesamtheit lehnt
      // Artikel ab, die dem Standard folgen — das wäre ein Prüffehler, kein Fund.
      const imFliesstext =
        ROLLEN_FLIESSTEXT.includes(feld.rolle) || feld.rolle === "kernaussage";
      for (const satz of saetze(feld.text)) {
        const laenge = woerter(satz).length;
        if (laenge > 32) {
          befunde.push({
            regel: "satz-zu-lang",
            schwere: imFliesstext ? "hart" : "weich",
            fundstelle: feld.fundstelle,
            text: `${laenge} Wörter: ${satz.slice(0, 140)}`,
            hinweis:
              "HART: Der längste Satz im handgeschriebenen Bestand hat 32 Wörter. Alles darüber ist im Register dieser Website nicht mehr belegt — und ein langer Satz trägt hier fast immer zwei Nebensätze, was der Standard ebenfalls ausschließt.",
          });
        }
      }
    }
    // Absatzdeckel gilt für zusammenhängende Blöcke, nicht für Listenpunkte,
    // FAQ-Antworten oder Kernaussagen: die haben im Schema eigene Obergrenzen.
    if (feld.rolle === "intro" || feld.rolle === "absatz" || feld.rolle === "fazit") {
      for (const absatz of absaetzeAus(feld.text)) {
        const laenge = woerter(absatz).length;
        if (laenge > 55) {
          befunde.push({
            regel: "absatz-zu-lang",
            schwere: "hart",
            fundstelle: feld.fundstelle,
            text: `${laenge} Wörter: ${absatz.slice(0, 140)}`,
            hinweis:
              "HART: Der längste Absatz im Bestand hat 54 Wörter, der Schnitt liegt bei 34. Ein Absatz über 55 Wörtern ist auf dem Handy eine Wand — und entsteht fast immer dadurch, dass drei Gedanken zusammengeschoben wurden, statt einen zu Ende zu bringen.",
          });
        }
      }
    }
  }
}

/**
 * Belegpflicht für Zahlen.
 *
 * Wörtliche Vorgabe aus `src/data/wissen.ts`: „Keine Zahl ohne Beleg. Der Bereich
 * soll ranken, und eine erfundene Marktzahl ist genau die Sorte Aussage, die
 * abgemahnt wird." Deshalb hart und deshalb einzeln: Es gibt keinen Grund, aus
 * fünf unbelegten Zahlen einen Befund zu machen — jede muss belegt oder
 * gestrichen werden.
 *
 * Als Beleg zählt ein Eintrag in `quellen[]` **oder** das `substanz`-Feld: Eine
 * Zahl aus einer eigenen Messung („nach 40 Tagen live“) hat keine fremde Quelle,
 * sondern eine eigene — und genau die dokumentiert `substanz.herkunft`.
 */
/**
 * Was eine Zahl zur Tatsachenbehauptung macht: eine Einheit dahinter
 * (Prozent, Euro, Tage, Mitarbeiter …) oder ein Mengenwort davor („über",
 * „rund", „bis zu"). Genau die vier Sorten, die die Vorgabe nennt —
 * Prozentangaben, Geldbeträge, Jahreszahlen, Mengen.
 */
const EINHEIT_NACH_ZAHL =
  /^\s*(?:%|€|\s?(?:prozent|prozentpunkte?|euro|cent|tage?n?|wochen?|monate?n?|jahre?n?|jahrzehnte?n?|stunden?|minuten?|sekunden?|mal|millionen?|milliarden?|tausend|mitarbeiter\w*|beschäftigte\w*|betriebe|unternehmen|firmen|kunden|nutzer|anwender|anfragen|belege|rechnungen|projekte|fälle|vollzeitstellen|personen|teams?|seiten?|dokumente|zeilen|schritte|punkte|plätze|prozesse|vorgänge|systeme)\b)/i;

const MENGE_VOR_ZAHL =
  /\b(?:über|rund|etwa|circa|knapp|mehr\s+als|weniger\s+als|bis\s+zu|nur|jede[rn]?|nach|seit|binnen|innerhalb\s+von)\s+$/i;

function pruefeZahlen(artikel: Artikel, felder: Feld[], befunde: Befund[]): number {
  const belegText = [
    ...(artikel.quellen ?? []).flatMap((q) => [q.bezeichnung, q.belegt, q.url]),
    artikel.substanz?.beschreibung ?? "",
    artikel.substanz?.herkunft ?? "",
  ]
    .join(" \n ")
    .toLowerCase();

  const zahl = /\d+(?:[.,]\d+)*/g;
  let unbelegt = 0;

  for (const feld of felder) {
    // Nur Fließtext und die zitierfähigen Felder. Überschriften dürfen eine
    // Gliederungsnummer tragen („1. KI sitzt dort, wo kein Geld entsteht“).
    if (
      !["intro", "absatz", "fazit", "kernaussage", "faq", "bullet", "teaser", "tabelle"].includes(
        feld.rolle
      )
    )
      continue;

    zahl.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = zahl.exec(feld.text)) !== null) {
      const roh = m[0];
      const davor = feld.text.slice(0, m.index);
      const danach = feld.text.slice(m.index + roh.length);

      // Aufzählungsnummer am Anfang („1. “, „2) “) ist keine Tatsachenbehauptung.
      if (/(?:^|\n)\s*$/.test(davor) && /^\d{1,2}[.)]\s/.test(feld.text.slice(m.index))) continue;

      // Nur Zahlen mit Tatsachencharakter: Prozentangaben, Geldbeträge,
      // Jahreszahlen, Mengen. Ziffern in Eigennamen bleiben außen vor —
      // „Microsoft 365“, „ISO 27001“, „GPT-4“ behaupten nichts, was jemand
      // belegen müsste. Eine Regel, die bei jedem Produktnamen anschlägt, wird
      // nach drei Tagen ignoriert, und danach fällt auch die erfundene
      // Marktzahl nicht mehr auf.
      const istTatsache =
        EINHEIT_NACH_ZAHL.test(danach) ||
        MENGE_VOR_ZAHL.test(davor) ||
        (/^(?:19|20)\d{2}$/.test(roh) && !/[\wÄÖÜäöüß-]$/.test(davor.trimEnd().slice(-1)));
      if (!istTatsache) continue;

      const ziffern = roh.replace(/[^\d]/g, "");
      const belegt =
        belegText.includes(roh.toLowerCase()) ||
        (ziffern.length > 0 && belegText.includes(ziffern));

      if (!belegt) {
        unbelegt++;
        befunde.push({
          regel: "zahl-ohne-beleg",
          schwere: "hart",
          fundstelle: feld.fundstelle,
          text: ausschnitt(feld.text, m.index, roh.length),
          hinweis:
            "HART: Die Zahl „" +
            roh +
            "\u201C taucht weder in quellen[] noch in substanz auf. Vorgabe wörtlich: " +
            "„Keine Zahl ohne Beleg.\u201C Eine erfundene Marktzahl ist genau die Sorte Aussage, " +
            "die abgemahnt wird — und ohne Abrufdatum in zwei Jahren nicht mehr überprüfbar. " +
            "Entweder Beleg in quellen[] eintragen, aus substanz herleiten oder die Zahl streichen.",
        });
      }
    }
  }
  return unbelegt;
}

/** Floskeln, die als „nicht generierbarer Eigenanteil“ durchgereicht werden. */
const SUBSTANZ_FLOSKELN = [
  "umfassende erfahrung",
  "langjährige erfahrung",
  "langjaehrige erfahrung",
  "langjährige praxis",
  "langjaehrige praxis",
  "jahrelange erfahrung",
  "tiefes verständnis",
  "tiefes verstaendnis",
  "unsere expertise",
  "unser know-how",
  "bewährte methoden",
  "beste praktiken",
  "hohe qualität",
  "individuelle lösungen",
  "am puls der zeit",
  "breites wissen",
  "viel erfahrung",
];

/**
 * `substanz` ist das wichtigste Feld des Datenmodells: Es trägt die
 * Unterscheidung zwischen „commodity content“ und „unique expert or experienced
 * takes". Eine Beschreibung, die selbst generisch ist, hebt genau die Bremse
 * aus, wegen der die Automatik verantwortbar ist — deshalb hart.
 */
function pruefeSubstanz(artikel: Artikel, befunde: Befund[]): void {
  const beschreibung = artikel.substanz?.beschreibung ?? "";
  const klein = beschreibung.toLowerCase();

  for (const floskel of SUBSTANZ_FLOSKELN) {
    if (klein.includes(floskel)) {
      befunde.push({
        regel: "substanz-generisch",
        schwere: "hart",
        fundstelle: "substanz.beschreibung",
        text: beschreibung,
        hinweis:
          "HART: „" +
          floskel +
          "\u201C ist genau das, was ein Modell schreibt, wenn es keinen Eigenanteil hat. " +
          "Das Feld muss benennen, was hier steht und sonst nirgends — eine Messreihe, eine " +
          "Architekturentscheidung, ein Fehlerbericht, die Zerlegung eines echten Ablaufs. Ohne " +
          "belegten Eigenanteil bricht die Pipeline den Artikel ab, statt ihn zu veröffentlichen.",
      });
    }
  }

  // Ohne konkrete Herkunft ist die Beschreibung nicht nachprüfbar.
  if ((artikel.substanz?.herkunft ?? "").trim().length < 5) {
    befunde.push({
      regel: "substanz-ohne-herkunft",
      schwere: "hart",
      fundstelle: "substanz.herkunft",
      text: artikel.substanz?.herkunft ?? "",
      hinweis:
        "HART: Die Herkunft ist die Prüfspur für Menschen — Repo-Pfad, Projektname, Gesetzesfundstelle, Messreihe. Ohne sie lässt sich der behauptete Eigenanteil nicht nachvollziehen.",
    });
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   TEIL 5 — Kennzahlen und weiche Korridore

   Alle Schwellen aus Abschnitt 2 des Schreibstandards. Sie sind **weich**: Ein
   Artikel mit 12,8 Wörtern je Satz ist kein Fehler, sondern ein Hinweis. Auch
   die metrischen Checks aus `check-blog-slop.mjs` (Varianz, Nominalstil,
   Passiv) kennen dort einen harten Schwellwert — hier sind sie durchgehend
   weich, weil die harte Liste oben abschließend ist. Eine Kennzahl allein soll
   keinen Artikel ablehnen; sie soll den Menschen hinschauen lassen.
   ══════════════════════════════════════════════════════════════════════════ */

function warnung(befunde: Befund[], regel: string, fundstelle: string, text: string, hinweis: string): void {
  befunde.push({ regel, schwere: "weich", fundstelle, text, hinweis });
}

function pruefeKennzahlen(
  artikel: Artikel,
  felder: Feld[],
  befunde: Befund[]
): Record<string, number> {
  const fliesstextFelder = felder.filter((f) => ROLLEN_FLIESSTEXT.includes(f.rolle));
  const fliesstext = fliesstextFelder.map((f) => f.text).join("\n\n");

  const alleSaetze = fliesstextFelder.flatMap((f) => saetze(f.text));
  const satzLaengen = alleSaetze.map((s) => woerter(s).length);
  const alleAbsaetze = fliesstextFelder.flatMap((f) => absaetzeAus(f.text));
  const absatzLaengen = alleAbsaetze.map((p) => woerter(p).length);

  const koerperFelder = felder.filter((f) => ROLLEN_KOERPER.includes(f.rolle));
  const strukturWoerter = felder
    .filter((f) => ROLLEN_STRUKTUR.includes(f.rolle))
    .reduce((s, f) => s + woerter(f.text).length, 0);
  const gesamtWoerter = koerperFelder.reduce((s, f) => s + woerter(f.text).length, 0);

  const ueberschriften = felder.filter((f) => f.rolle === "ueberschrift");
  const fragen = ueberschriften.filter((f) => f.text.trim().endsWith("?"));

  const emDashes = (fliesstext.match(/—/g) ?? []).length;

  /* ── Satzlänge ─────────────────────────────────────────────────────────── */
  const wProSatz = mittelwert(satzLaengen);
  const medianSatz = median(satzLaengen);
  const streuung = standardabweichung(satzLaengen);
  const kurz = satzLaengen.filter((l) => l <= 15).length / Math.max(1, satzLaengen.length);
  const lang = satzLaengen.filter((l) => l >= 26).length / Math.max(1, satzLaengen.length);

  if (satzLaengen.length >= 8) {
    if (wProSatz < 13 || wProSatz > 17) {
      warnung(
        befunde,
        "satzlaenge-korridor",
        "fließtext",
        `Ø ${runde(wProSatz, 1)} Wörter je Satz`,
        "Korridor 13–17 Wörter, gemessener Ist-Wert im Bestand 15,2. Der Blog ist die längste Textsorte der Website — aber nur um zwei bis vier Wörter gegenüber dem Sales Letter (11,5), nicht um das Doppelte."
      );
    }
    if (medianSatz > 16) {
      warnung(
        befunde,
        "satzlaenge-median",
        "fließtext",
        `Median ${runde(medianSatz, 1)} Wörter`,
        "Median soll bei höchstens 16 liegen (Ist 14). Ein hoher Median bei passendem Mittelwert heißt: Es fehlen die kurzen Sätze, die den Takt brechen."
      );
    }
    if (kurz < 0.5) {
      warnung(
        befunde,
        "anteil-kurze-saetze",
        "fließtext",
        `${runde(kurz * 100, 1)} Prozent der Sätze haben höchstens 15 Wörter`,
        "Mindestens die Hälfte soll kurz sein (Ist 56 Prozent). Der kürzeste Satz im Bestand hat fünf Wörter."
      );
    }
    if (lang > 0.08) {
      warnung(
        befunde,
        "anteil-lange-saetze",
        "fließtext",
        `${runde(lang * 100, 1)} Prozent der Sätze haben 26 Wörter oder mehr`,
        "Höchstens 8 Prozent (Ist 5 Prozent, drei von 63) — und nie zwei lange Sätze hintereinander."
      );
    }
    if (streuung < 4) {
      warnung(
        befunde,
        "satzlaenge-varianz",
        "fließtext",
        `Standardabweichung ${runde(streuung, 2)} Wörter`,
        "Gleichförmige Satzlängen sind der aussagekräftigste KI-Marker überhaupt, weil er sich durch Wortaustausch nicht beheben lässt: Menschen wechseln zwischen Dreiwortsatz und Nebensatzkette, Modelle pendeln um eine Ziellänge."
      );
    }
  }

  /* ── Absatzlänge ───────────────────────────────────────────────────────── */
  const absatzMittel = mittelwert(absatzLaengen);
  const absatzStreuung = standardabweichung(absatzLaengen);
  if (absatzLaengen.length >= 4) {
    if (absatzMittel < 25 || absatzMittel > 45) {
      warnung(
        befunde,
        "absatzlaenge-korridor",
        "fließtext",
        `Ø ${runde(absatzMittel, 1)} Wörter je Absatz`,
        "Korridor 25–45 Wörter (Ist 34). Der Zwei-Satz-Absatz ist der Normalfall, ein Ein-Satz-Absatz pro Artikel ist Betonung."
      );
    }
    if (absatzStreuung < 8) {
      warnung(
        befunde,
        "absatzlaenge-varianz",
        "fließtext",
        `Standardabweichung ${runde(absatzStreuung, 2)} Wörter`,
        "Generierte Artikel bauen alle Absätze auf dieselbe Größe, weil das Modell pro Gliederungspunkt denselben Block erzeugt. Ein gewachsener Text hat einen Einzeiler neben einem langen Absatz."
      );
    }
  }

  /* ── Nebensätze ────────────────────────────────────────────────────────── */
  const einleiter =
    /,\s*(?:dass|weil|wenn|ob|obwohl|während|damit|sodass|so\s+dass|bevor|nachdem|falls|indem|wobei|der|die|das|dem|den|denen|deren|dessen|welche[rsnm]?)\b/gi;
  let mehrfach = 0;
  for (const satz of alleSaetze) {
    einleiter.lastIndex = 0;
    const anzahl = (satz.match(einleiter) ?? []).length;
    if (anzahl >= 2) mehrfach++;
  }
  const nebensatzAnteil = alleSaetze.length ? mehrfach / alleSaetze.length : 0;
  if (alleSaetze.length >= 8 && nebensatzAnteil > 0.15) {
    warnung(
      befunde,
      "nebensatz-dichte",
      "fließtext",
      `${runde(nebensatzAnteil * 100, 1)} Prozent der Sätze tragen zwei oder mehr Nebensätze`,
      "Maximal ein Nebensatz pro Satz (Ist 11 Prozent, sieben von 63). Zwei sind die Ausnahme und tragen ein Aufzählungsmuster, kein Argument."
    );
  }

  /* ── Em-Dash: Dichte, nicht Vorkommen ──────────────────────────────────── */
  const emDashDichte = alleSaetze.length ? emDashes / alleSaetze.length : 0;
  if (alleSaetze.length >= 10 && (emDashDichte < 0.15 || emDashDichte > 0.45)) {
    warnung(
      befunde,
      "em-dash-dichte",
      "fließtext",
      `${runde(emDashDichte, 2)} Em-Dashes je Satz (${emDashes} Stück)`,
      "Korridor 0,15–0,45 (Ist 0,32: 20 Stück auf 63 Sätze, ungefähr jeder fünfte Satz). Der Em-Dash ist Hausstandard und niemals ein Fehler — zu wenige heißt, der nachgestellte Widerspruch fehlt, zu viele heißt, er ersetzt den Doppelpunkt, der hier das Arbeitspferd ist."
    );
  }
  // Höchstens ein Em-Dash pro Satz: genau eine Ausnahme im ganzen Bestand.
  for (const feld of felder) {
    if (!ROLLEN_PROSA.includes(feld.rolle)) continue;
    for (const satz of saetze(feld.text)) {
      if ((satz.match(/—/g) ?? []).length > 1) {
        warnung(
          befunde,
          "em-dash-mehrfach",
          feld.fundstelle,
          satz.slice(0, 160),
          "Ein Em-Dash pro Satz. Die einzige belegte Ausnahme im Bestand ist ein Einschub-Paar („fortsetzen — oder eben ehrlich beenden — kann“). Zwei einzelne Gedankenstriche in einem Satz sind keiner."
        );
      }
    }
  }

  /* ── GEO: Frage-Überschriften ──────────────────────────────────────────── */
  const frageAnteil = ueberschriften.length ? fragen.length / ueberschriften.length : 0;
  if (ueberschriften.length >= 3 && frageAnteil < 0.3) {
    warnung(
      befunde,
      "geo-frage-ueberschriften",
      "abschnitte[].heading",
      `${fragen.length} von ${ueberschriften.length} Überschriften sind Fragen (${runde(frageAnteil * 100, 1)} Prozent)`,
      "Von 18.012 verifizierten ChatGPT-Zitaten stammten 78,4 Prozent der frage-verknüpften Zitate aus einer H2-Überschrift. Direkt darunter gehört die Antwort in ein bis zwei Sätzen. Der Hausstil erlaubt Frage *und* Aussage — nur das Etikett ist verboten."
    );
  }

  /* ── GEO: Definitionssatz im ersten Intro-Absatz ───────────────────────── */
  const ersterIntroAbsatz = absaetzeAus(artikel.intro ?? "")[0] ?? "";
  const definition =
    /\b[A-ZÄÖÜ][\wäöüßA-ZÄÖÜ-]+(?:\s+[\wäöüßA-ZÄÖÜ-]+){0,3}\s+(?:ist|sind|bezeichnet|heißt|heisst|bedeutet|meint)\b/;
  if (ersterIntroAbsatz && !definition.test(ersterIntroAbsatz)) {
    warnung(
      befunde,
      "geo-definitionssatz",
      "intro",
      ersterIntroAbsatz.slice(0, 160),
      "Sätze in Definitionsform („X ist …“) tauchten in zitierten Passagen fast doppelt so häufig auf, und 44,2 Prozent der Zitate stammten aus dem ersten Drittel des Textes. Das steht in Spannung zur Hausregel „kein Definitions-Einstieg“ — deshalb weich: Der Definitionssatz darf auch der zweite Satz sein oder in den Kernaussagen stehen."
    );
  }

  /* ── GEO: Entity-Dichte ────────────────────────────────────────────────── */
  let benennungen = 0;
  let tokens = 0;
  for (const satz of alleSaetze) {
    const w = woerter(satz);
    tokens += w.length;
    for (let i = 1; i < w.length; i++) {
      if (/^[A-ZÄÖÜ]/.test(w[i])) benennungen++;
    }
  }
  const entityDichte = tokens ? benennungen / tokens : 0;
  if (tokens >= 120 && entityDichte < 0.08) {
    warnung(
      befunde,
      "geo-entity-dichte",
      "fließtext",
      `${runde(entityDichte * 100, 1)} Prozent benannte Größen`,
      "Gemessen wird Großschreibung außerhalb des Satzanfangs — im Deutschen die beste maschinelle Näherung an „konkrete Benennung“, weil jedes Substantiv großgeschrieben wird. Ein niedriger Wert heißt: Der Text besteht aus Verben und Adjektiven statt aus Dingen („moderne Technologien“ statt „AWS Bedrock, Azure OpenAI Service, Grafikkarten“)."
    );
  }

  /* ── GEO: Anteil strukturierter Elemente ───────────────────────────────── */
  const strukturAnteil = gesamtWoerter ? strukturWoerter / gesamtWoerter : 0;
  if (gesamtWoerter >= 300 && (strukturAnteil < 0.15 || strukturAnteil > 0.35)) {
    warnung(
      befunde,
      "geo-struktur-anteil",
      "bullets / tabellen / faq",
      `${runde(strukturAnteil * 100, 1)} Prozent des Umfangs sind strukturiert`,
      "Strukturierte Elemente werden von RAG-Systemen zuverlässiger extrahiert als äquivalente Prosa — aber der Anteil ist ein Optimum, kein Maximum. Zu wenig heißt: nichts zum Herausziehen. Zu viel heißt: ein Fließtext in Listenverkleidung, den der Hausstil ausdrücklich ausschließt."
    );
  }

  /* ── Interne Links ─────────────────────────────────────────────────────── */
  const links = artikel.interneLinks ?? [];
  if (links.length < 3 || links.length > 8) {
    warnung(
      befunde,
      "interne-links-anzahl",
      "interneLinks",
      `${links.length} interne Links`,
      "Pflicht sind 3 bis 8. Die Auswertung über 23 Millionen interne Links (Zyppy, 1.800 Websites) ist der einzige belastbare Zusammenhang, den wir hier überhaupt haben."
    );
  }
  const anker = links.map((l) => l.ankertext.trim().toLowerCase());
  const doppelte = anker.filter((a, i) => anker.indexOf(a) !== i);
  for (const d of [...new Set(doppelte)]) {
    warnung(
      befunde,
      "ankertext-wiederholung",
      "interneLinks",
      `„${d}“ kommt mehrfach vor`,
      "Der stärkste Zusammenhang liegt nicht bei der Zahl der Links, sondern bei der Vielfalt der Ankertexte auf dieselbe Zielseite. Zehnmal derselbe Anker zählt wie ein einziger redaktioneller Link."
    );
  }

  /* ── Umfang ────────────────────────────────────────────────────────────── */
  if (gesamtWoerter < 700 || gesamtWoerter > 2500) {
    warnung(
      befunde,
      "artikel-umfang",
      "artikel",
      `${gesamtWoerter} Wörter im Körper`,
      "Korridor 700–2500 Wörter für Pipeline-Artikel. Die drei handgeschriebenen Startartikel liegen mit 557 / 456 / 327 Wörtern bewusst darunter — sie haben keine FAQ, keine Tabellen und keine Kernaussagen. Wer den Korridor ändert, zieht `lesezeit` mit."
    );
  }

  return {
    woerter: gesamtWoerter,
    saetze: alleSaetze.length,
    absaetze: alleAbsaetze.length,
    woerterProSatz: runde(wProSatz, 2),
    medianSatzlaenge: runde(medianSatz, 1),
    absatzlaenge: runde(absatzMittel, 2),
    satzlaengenStreuung: runde(streuung, 2),
    absatzlaengenStreuung: runde(absatzStreuung, 2),
    anteilKurzeSaetze: runde(kurz, 3),
    anteilLangeSaetze: runde(lang, 3),
    nebensatzAnteil: runde(nebensatzAnteil, 3),
    emDashDichte: runde(emDashDichte, 3),
    frageUeberschriftenAnteil: runde(frageAnteil, 3),
    entityDichte: runde(entityDichte, 3),
    strukturAnteil: runde(strukturAnteil, 3),
    interneLinks: links.length,
    quellen: (artikel.quellen ?? []).length,
    faqAnzahl: (artikel.faq ?? []).length,
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   TEIL 6 — Einstiegspunkt
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Prüft einen Artikel gegen Hausstil und GEO-Struktur.
 *
 * `bestanden` hängt **allein an den harten Fehlern**. Warnungen summieren sich
 * nicht zu einer Ablehnung: Sie markieren Korridore, und ein Text, der aus
 * gutem Grund am Rand eines Korridors liegt, soll nicht von der Statistik
 * gestoppt werden. Die Entscheidung darüber gehört zum redaktionellen Schritt,
 * und genau der ist der Grund, warum `status: entwurf` der Normalfall ist.
 */
export function pruefeArtikel(artikel: Artikel): Pruefergebnis {
  const felder = sammleFelder(artikel);
  const befunde: Befund[] = [];

  pruefeMuster(felder, befunde);
  pruefeHoeflichkeitsSie(felder, befunde);
  pruefeLaengen(felder, befunde);
  const unbelegteZahlen = pruefeZahlen(artikel, felder, befunde);
  pruefeSubstanz(artikel, befunde);
  const kennzahlen = pruefeKennzahlen(artikel, felder, befunde);

  const harteFehler = befunde.filter((b) => b.schwere === "hart");
  const warnungen = befunde.filter((b) => b.schwere === "weich");

  return {
    bestanden: harteFehler.length === 0,
    harteFehler,
    warnungen,
    kennzahlen: {
      ...kennzahlen,
      unbelegteZahlen,
      harteFehler: harteFehler.length,
      warnungen: warnungen.length,
    },
  };
}

/** Kurzer Textbericht für die Pipeline-Ausgabe und für Menschen im Terminal. */
export function berichte(ergebnis: Pruefergebnis): string {
  const zeilen: string[] = [];
  zeilen.push(ergebnis.bestanden ? "BESTANDEN" : "ABGELEHNT");
  zeilen.push(
    `${ergebnis.kennzahlen.woerter} Wörter · ${ergebnis.kennzahlen.saetze} Sätze · ` +
      `Ø ${ergebnis.kennzahlen.woerterProSatz} Wörter je Satz · ` +
      `${ergebnis.harteFehler.length} harte Fehler · ${ergebnis.warnungen.length} Warnungen`
  );
  for (const b of [...ergebnis.harteFehler, ...ergebnis.warnungen]) {
    zeilen.push(`[${b.schwere === "hart" ? "HART " : "weich"}] ${b.regel} — ${b.fundstelle}`);
    zeilen.push(`        ${b.text}`);
    zeilen.push(`        → ${b.hinweis}`);
  }
  return zeilen.join("\n");
}

/** Regelübersicht für Dokumentation und Tests. */
export function regelUebersicht(): { regel: string; schwere: string }[] {
  const programmatisch = [
    { regel: "anrede-sie", schwere: "hart" },
    { regel: "satz-zu-lang", schwere: "hart" },
    { regel: "absatz-zu-lang", schwere: "hart" },
    { regel: "zahl-ohne-beleg", schwere: "hart" },
    { regel: "substanz-generisch", schwere: "hart" },
    { regel: "substanz-ohne-herkunft", schwere: "hart" },
    { regel: "satzlaenge-korridor", schwere: "weich" },
    { regel: "satzlaenge-median", schwere: "weich" },
    { regel: "anteil-kurze-saetze", schwere: "weich" },
    { regel: "anteil-lange-saetze", schwere: "weich" },
    { regel: "satzlaenge-varianz", schwere: "weich" },
    { regel: "absatzlaenge-korridor", schwere: "weich" },
    { regel: "absatzlaenge-varianz", schwere: "weich" },
    { regel: "nebensatz-dichte", schwere: "weich" },
    { regel: "em-dash-dichte", schwere: "weich" },
    { regel: "em-dash-mehrfach", schwere: "weich" },
    { regel: "geo-frage-ueberschriften", schwere: "weich" },
    { regel: "geo-definitionssatz", schwere: "weich" },
    { regel: "geo-entity-dichte", schwere: "weich" },
    { regel: "geo-struktur-anteil", schwere: "weich" },
    { regel: "interne-links-anzahl", schwere: "weich" },
    { regel: "ankertext-wiederholung", schwere: "weich" },
    { regel: "artikel-umfang", schwere: "weich" },
  ];
  return [
    ...MUSTER.map((m) => ({ regel: m.regel, schwere: m.schwere as string })),
    ...programmatisch,
  ];
}
