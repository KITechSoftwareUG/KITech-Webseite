import { z } from "zod";

/**
 * Das Datenmodell eines Artikels unter `/gratis-wissen`.
 *
 * WARUM JSON STATT TYPESCRIPT (19.08.2026): Bis hierher standen die Artikel als
 * Array in `src/data/wissen.ts`. Das war richtig, solange ein Mensch drei Artikel
 * von Hand pflegt — und wird falsch, sobald eine Pipeline täglich schreibt: ein
 * Programm, das TypeScript-Quelltext manipuliert, bricht beim ersten
 * Sonderzeichen. Jeder Artikel liegt jetzt als eigene Datei unter
 * `content/wissen/<slug>.json`, wird von `laden.ts` eingelesen und **gegen dieses
 * Schema geprüft**. Was das Schema nicht besteht, kommt nicht in den Build.
 *
 * DAS SCHEMA IST DAS QUALITÄTSTOR, NICHT NUR EINE TYPDEFINITION. Mehrere Felder
 * existieren ausschließlich, um Google-Spam-Policies und die eigenen
 * Repo-Regeln maschinell durchzusetzen:
 *
 *   - `substanz`   — der nicht generierbare Bestandteil. Ohne ihn kein Artikel.
 *                    Direkte Umsetzung von Googles Unterscheidung zwischen
 *                    „commodity content" und „non-commodity content".
 *   - `quellen`    — jede Zahl im Text braucht hier einen Eintrag. Repo-Regel
 *                    „Keine Zahl ohne Beleg" (`src/data/wissen.ts`, Kopf).
 *   - `autor`      — namentlich, nie „KI". Google rät ausdrücklich davon ab,
 *                    einem Modell eine Byline zu geben.
 *   - `interneLinks` — Pflicht, 3 bis 8. Die Zyppy-Auswertung über 23 Mio.
 *                    interne Links ist der einzige belastbare Zusammenhang, den
 *                    wir hier überhaupt haben.
 *
 * Wer ein Pflichtfeld weich macht, nimmt genau die Bremse heraus, wegen der die
 * Automatik verantwortbar ist. Das ist eine inhaltliche Entscheidung, keine
 * technische.
 */

/** ISO-Datum `JJJJ-MM-TT`. Kein `new Date()` — die Pipeline setzt echte Daten. */
const isoDatum = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum muss im Format JJJJ-MM-TT stehen");

const slugMuster = z
  .string()
  .min(3)
  .max(80)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug: nur Kleinbuchstaben, Ziffern und einzelne Bindestriche"
  );

/**
 * Ein Beleg für eine Zahl oder eine fremde Aussage im Text.
 *
 * `abgerufen` ist Pflicht, weil eine Marktzahl ohne Abrufdatum in zwei Jahren
 * nicht mehr überprüfbar ist — und dann als Behauptung dasteht, die uns gehört.
 */
export const quelleSchema = z.object({
  /** Wie im Text darauf verwiesen wird, z. B. „Statistisches Bundesamt, 2026". */
  bezeichnung: z.string().min(3).max(160),
  url: z.string().url(),
  abgerufen: isoDatum,
  /** Die Aussage, die dieser Beleg trägt. Zwingt zum Nachdenken beim Eintragen. */
  belegt: z.string().min(10).max(300),
});

/**
 * Ein Link im Fließtext auf eine andere Seite dieser Website.
 *
 * `ankertext` ist bewusst frei und wird pro Artikel variiert: Die Auswertung von
 * 23 Mio. internen Links (Zyppy, 1.800 Websites) findet den stärksten
 * Zusammenhang nicht bei der Zahl der Links, sondern bei der **Vielfalt der
 * Ankertexte** auf dieselbe Zielseite. Zehnmal derselbe Anker zählt dort wie ein
 * einziger redaktioneller Link.
 */
export const internerLinkSchema = z.object({
  /** Zielpfad ab Domainwurzel, z. B. `/glossar/rag`. */
  ziel: z.string().regex(/^\/[a-z0-9/\-_]*$/i, "Ziel muss ein interner Pfad sein"),
  ankertext: z.string().min(3).max(90),
  /**
   * In welchem Abschnitt der Link steht (Index in `abschnitte`), oder `"intro"`.
   * Die Darstellung setzt ihn an genau dieser Stelle in den Text.
   */
  abschnitt: z.union([z.literal("intro"), z.number().int().min(0)]),
});

export const abschnittSchema = z.object({
  /**
   * H2. Als Frage oder als Aussage — nie als Etikett, nie mit Punkt am Ende.
   *
   * Fragen sind der stärkere Fall: In einer Auswertung von 18.012 verifizierten
   * ChatGPT-Zitaten stammten 78,4 % der frage-verknüpften Zitate aus einer
   * H2-Überschrift. Direkt darunter gehört die Antwort in ein bis zwei Sätzen.
   */
  heading: z.string().min(8).max(120),
  paragraphs: z.array(z.string().min(20)).min(1).max(6),
  bullets: z.array(z.string().min(3).max(200)).max(7).optional(),
  /** Optionale H3-Ebene innerhalb des Abschnitts. */
  unterabschnitte: z
    .array(
      z.object({
        heading: z.string().min(6).max(120),
        paragraphs: z.array(z.string().min(20)).min(1).max(4),
      })
    )
    .max(5)
    .optional(),
  /**
   * Tabelle als Alternative zu Fließtext. Strukturierte Elemente werden von
   * RAG-Systemen zuverlässiger extrahiert als äquivalente Prosa — aber der
   * Anteil ist ein Optimum, kein Maximum. Deshalb höchstens eine je Abschnitt.
   */
  tabelle: z
    .object({
      kopf: z.array(z.string().min(1).max(60)).min(2).max(4),
      zeilen: z.array(z.array(z.string().max(200)).min(2).max(4)).min(2).max(10),
    })
    .optional(),
});

/**
 * Eine Frage mit Antwort, sichtbar am Artikelende.
 *
 * ⚠️ **Bewusst ohne FAQPage-JSON-LD.** Google hat das FAQ-Rich-Result zum
 * 07.05.2026 abgeschaltet und die Dokumentation dazu im Juni 2026 entfernt; das
 * Markup erzeugt seither kein Suchergebnis mehr. Was messbar wirkt, ist der
 * **sichtbare** Frage-Antwort-Block im HTML — deshalb rendern wir ihn, ohne ihn
 * auszuzeichnen. Wer hier FAQPage-Schema nachrüstet, gewinnt nichts.
 */
export const faqSchema = z.object({
  frage: z.string().min(10).max(160),
  antwort: z.string().min(30).max(900),
});

/**
 * Der nicht generierbare Bestandteil — das wichtigste Feld dieser Datei.
 *
 * Google unterscheidet in der eigenen Anleitung zu generativen Suchfunktionen
 * zwischen „commodity content" („7 Tipps für Erstkäufer") und „non-commodity
 * content" — Letzteres liefert „unique expert or experienced takes that go
 * beyond common knowledge". Und in derselben Anleitung steht die Messlatte:
 * nichts veröffentlichen, was „could easily be produced by a generative AI
 * model".
 *
 * Genau das prüft dieses Feld. Es ist der Grund, warum eine tägliche Frequenz
 * hier verantwortbar ist und anderswo zur Abstrafung führt: Ohne belegten
 * Eigenanteil bricht die Pipeline den Artikel ab, statt ihn zu veröffentlichen.
 */
export const substanzSchema = z.object({
  /**
   * Was genau ist an diesem Artikel nicht aus fremden Quellen zusammengesetzt?
   */
  art: z.enum([
    "eigene-messung", // Zahlen aus einem echten Projekt oder Betrieb
    "eigener-code", // Konfiguration, Skript, Schema aus einer echten Datei
    "architekturentscheidung", // Warum wir uns so und nicht anders entschieden haben
    "fehlerbericht", // Was schiefging und was es gekostet hat
    "primaerquelle", // Auswertung eines Gesetzes-, Norm- oder Doku-Originals
    "prozesszerlegung", // Ein realer Ablauf, Schritt für Schritt aufgemacht
  ]),
  /** Ein Satz: was hier steht und sonst nirgends. */
  beschreibung: z.string().min(40).max(400),
  /**
   * Woher es stammt — Repo-Pfad, Projektname, Gesetzesfundstelle, Messreihe.
   * Interne Pfade landen nie im Artikel; das Feld ist die Prüfspur für Menschen.
   */
  herkunft: z.string().min(5).max(300),
});

export const artikelSchema = z.object({
  slug: slugMuster,
  titel: z.string().min(15).max(120),
  /**
   * Kurzfassung des Titels für das `<title>`-Element — nur nötig, wenn `titel`
   * über 60 Zeichen liegt.
   *
   * **Warum es das Feld gibt.** Eine H1 darf ausführlich sein: sie steht auf
   * der Seite, wird ganz gelesen und trägt den Zusammenhang. Das Suchergebnis
   * schneidet dagegen bei etwa 60 Zeichen ab, und was danach kommt, sieht
   * niemand. Beides in ein Feld zu zwingen heißt, eines von beiden schlechter
   * zu machen.
   *
   * Aufgefallen am 26.08.2026: „E-Rechnung ab 1.1.2027: wer versenden muss und
   * was bis dahin zu tun ist" misst 71 Zeichen und stand so live. Der Test in
   * `metadaten.test.ts` hatte das nicht gefunden, weil er nur String-Literale
   * aus den `page.tsx` unter `src/app/` liest — ein Titel, der aus einer JSON-Datei
   * kommt, läuft an ihm vorbei.
   *
   * Ohne Angabe wird `titel` verwendet. Der Loader bricht ab, wenn *beide*
   * über der Grenze liegen.
   */
  metaTitel: z.string().min(15).max(60).optional(),
  /** Ein Satz für Übersichtskarte und Meta-Beschreibung. */
  teaser: z.string().min(60).max(280),
  kategorie: z.string().min(3).max(30),
  /**
   * Themen-Cluster (Slug aus `content/seo/cluster.json`). Bestimmt, unter
   * welcher Hub-Seite der Artikel hängt und wohin zurückverlinkt wird.
   */
  cluster: slugMuster,
  /**
   * Das eine Keyword, für das dieser Artikel ranken soll.
   *
   * ⚠️ **Genau ein Artikel je Keyword.** Der Loader bricht bei Dubletten ab.
   * Zwei Artikel auf dasselbe Ziel konkurrieren gegeneinander statt gegen den
   * Wettbewerb — und ChatGPT dedupliziert Ergebnisse zusätzlich pro Domain,
   * womit die schwächere Seite die stärkere verdrängen kann.
   */
  zielKeyword: z.string().min(3).max(90),
  sekundaerKeywords: z.array(z.string().min(3).max(90)).max(12).default([]),

  datum: isoDatum,
  /** Letzte inhaltliche Änderung. Speist `lastmod` in der Sitemap. */
  aktualisiert: isoDatum,
  lesezeit: z.number().int().min(3).max(25),

  /** Slug aus `content/seo/autoren.json`. Niemals ein Modell. */
  autor: slugMuster,

  intro: z.string().min(120).max(700),
  abschnitte: z.array(abschnittSchema).min(3).max(14),
  /**
   * Zwei bis vier Sätze, die für sich allein zitierfähig sind — jeder ohne
   * Kontext verständlich, jeder eine vollständige Aussage.
   *
   * Sie stehen sichtbar oben im Artikel. Von 18.012 verifizierten ChatGPT-Zitaten
   * stammten 44,2 % aus dem ersten Drittel des Textes; Sätze in Definitionsform
   * („X ist …") tauchten in zitierten Passagen fast doppelt so häufig auf.
   */
  kernaussagen: z.array(z.string().min(40).max(320)).min(2).max(4),
  fazit: z.string().min(60).max(400),

  faq: z.array(faqSchema).min(2).max(8).default([]),
  quellen: z.array(quelleSchema).max(15).default([]),
  interneLinks: z.array(internerLinkSchema).min(3).max(8),
  substanz: substanzSchema,

  /** Eigener Abschluss-CTA. Jeder Artikel bekommt einen eigenen — nie dreimal denselben. */
  cta: z.object({
    heading: z.string().min(10).max(80),
    text: z.string().min(30).max(200),
  }),

  /**
   * Freigabestand. Nur `veroeffentlicht` erscheint auf der Website.
   *
   * `entwurf` ist der Normalfall der Pipeline: geschrieben, geprüft, wartet auf
   * einen Menschen. Das ist die Stelle, an der aus „automatisch erzeugt" ein
   * redaktioneller Vorgang wird — und genau die Unterscheidung, die Googles
   * Bewertungsrichtlinien mit „the extent to which a human being actively worked
   * to create satisfying content" beschreiben.
   */
  status: z.enum(["entwurf", "veroeffentlicht", "zurueckgezogen"]),
  /** Wer freigegeben hat und wann. Pflicht, sobald `status: veroeffentlicht`. */
  freigabe: z
    .object({
      von: z.string().min(2).max(80),
      am: isoDatum,
    })
    .optional(),

  /** Herkunft des Entwurfs. Dokumentation, keine Ausgabe auf der Seite. */
  erzeugt: z
    .object({
      lauf: z.string().max(60).optional(),
      modell: z.string().max(60).optional(),
      am: isoDatum.optional(),
    })
    .optional(),
});

export type Artikel = z.infer<typeof artikelSchema>;
export type Abschnitt = z.infer<typeof abschnittSchema>;
export type Quelle = z.infer<typeof quelleSchema>;
export type InternerLink = z.infer<typeof internerLinkSchema>;
export type Faq = z.infer<typeof faqSchema>;

/** Ein veröffentlichter Artikel braucht eine Freigabe — sonst ist er keiner. */
export const artikelSchemaMitFreigabe = artikelSchema.refine(
  (a) => a.status !== "veroeffentlicht" || Boolean(a.freigabe),
  {
    message:
      "status 'veroeffentlicht' verlangt ein freigabe-Objekt (von, am). " +
      "Ohne benannte Freigabe ist der Artikel ein Entwurf.",
    path: ["freigabe"],
  }
);

/* -------------------------------------------------------------------------- */
/* Autoren                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Autoren stehen in `content/seo/autoren.json` und bekommen unter
 * `/autoren/<slug>` eine eigene Seite mit `ProfilePage`-Auszeichnung.
 *
 * Das ist die einzige Stelle, an der strukturierte Daten für einen Blog dieser
 * Größe noch etwas tragen: Google empfiehlt für `author` ausdrücklich `type` und
 * `url` beziehungsweise `sameAs`, und für interne Autorenseiten zusätzlich
 * `ProfilePage`-Markup — anders als bei `Article` gibt es dort echte Pflichtfelder.
 */
export const autorSchema = z.object({
  slug: slugMuster,
  name: z.string().min(3).max(80),
  rolle: z.string().min(3).max(80),
  /** Zwei bis vier Sätze. Belegbarer Hintergrund, keine Selbstbeweihräucherung. */
  kurzbeschreibung: z.string().min(80).max(900),
  /** Wofür diese Person einsteht — speist `knowsAbout`. */
  themen: z.array(z.string().min(3).max(60)).min(2).max(10),
  bild: z.string().min(1).max(200).optional(),
  linkedinUrl: z.string().url().optional(),
  email: z.string().email().optional(),
});

export type Autor = z.infer<typeof autorSchema>;

/* -------------------------------------------------------------------------- */
/* Themen-Cluster                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Ein Cluster ist eine Hub-Seite mit den Artikeln, die dazugehören.
 *
 * Der Aufbau ist kein Ordnungsprinzip, sondern der Gegenzug gegen ein konkretes
 * Problem der täglichen Publikation: Artikel Nummer eins steht nach vierzig
 * Tagen auf Seite drei der Übersicht und hat dann keinen einzigen internen Link
 * mehr aus einem Fließtext. Ein Hub hält jeden Artikel bei zwei Klicks von der
 * Startseite und erzeugt genau die Ankertext-Vielfalt, die in der Zyppy-Auswertung
 * den stärksten Zusammenhang mit Suchklicks zeigt.
 */
export const clusterSchema = z.object({
  slug: slugMuster,
  /** Überschrift der Hub-Seite. */
  titel: z.string().min(8).max(90),
  /** Das Keyword, für das die Hub-Seite selbst ranken soll. */
  pillarKeyword: z.string().min(3).max(90),
  teaser: z.string().min(60).max(300),
  /** Zwei bis vier Absätze eigener Text — ein Hub ohne Inhalt ist eine Linkliste. */
  einleitung: z.array(z.string().min(40)).min(2).max(5),
  /** Reihenfolge in der Übersicht. Kleiner zuerst. */
  reihenfolge: z.number().int().min(0).max(99),
  /** Steht der Hub in Navigation und Sitemap? */
  indexierbar: z.boolean().default(true),
});

export type Cluster = z.infer<typeof clusterSchema>;
