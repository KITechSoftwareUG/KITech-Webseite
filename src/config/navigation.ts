/**
 * Navigation und Routen-Register — die einzige Wahrheit für Kopfzeile, Fußzeile,
 * Sitemap und den Routen-Test.
 *
 * Vorher pflegte jede Stelle ihre eigene Liste: die Kopfzeile vier Punkte, die
 * Alt-Fußzeile fünf andere, die Sitemap eine dritte, und die Rechtstext-Links
 * standen in vier Seiten einzeln als `legalLinks`-Array. Dabei sind mehrere
 * Routen komplett aus der Navigation gefallen — es gab sie, aber kein Weg führte
 * hin. Wer hier etwas einträgt, trägt es überall ein.
 *
 * Diese Datei ist bewusst frei von JSX und React: sie wird auch von
 * `src/app/sitemap.ts` (Server) und vom Routen-Test (Node) importiert.
 */

export interface NavLink {
  label: string;
  href: string;
  /** Ein Satz für Untermenü, Übersichtskacheln und Fußzeile. */
  description?: string;
}

export interface NavEntry extends NavLink {
  /**
   * Unterpunkte. Der Elternpunkt bleibt ein echter Link auf eine eigene Seite —
   * ein Menüpunkt, der nur aufklappt und selbst nirgendwohin führt, ist auf dem
   * Handy eine Sackgasse.
   */
  children?: NavLink[];
}

/**
 * Die beiden Funnel-Seiten hängen unter einem gemeinsamen Punkt "Warum?"
 * (Vorgabe Ayham, 05.08.2026). Vorher standen beide vollen Seitentitel
 * nebeneinander in der Kopfzeile und haben sie allein gefüllt — für die
 * restlichen Themen war schlicht kein Platz.
 *
 * Die vollen Titel bleiben erhalten, sie stehen jetzt im Untermenü. Dort tragen
 * sie sich, weil sie untereinander stehen statt in einer Zeile.
 */
export const warumEntry: NavEntry = {
  label: "Warum?",
  href: "/warum",
  description: "Der Grund, warum KI bei den meisten kein Geld verdient.",
  children: [
    {
      label: "Warum du mit KI kein Geld verdienst",
      href: "/warum-du-mit-ki-kein-geld-verdienst",
      description: "Für Einzelunternehmer und Selbstständige.",
    },
    {
      label: "Warum Unternehmen mit KI kein Geld verdienen",
      href: "/warum-unternehmen-mit-ki-kein-geld-verdienen",
      description: "Für Geschäftsführung und Bereichsleitung.",
    },
  ],
};

export const leistungenEntry: NavEntry = {
  label: "Leistungen",
  href: "/leistungen",
  description: "Was wir bauen — vom Prozess-Audit bis zum laufenden Betrieb.",
  children: [
    {
      label: "Für Selbstständige",
      href: "/solo",
      description: "Ein bis sechs Leute, kein IT-Team im Rücken.",
    },
    {
      label: "Für Unternehmen",
      href: "/enterprise",
      description: "Gewachsene Prozesse, echte Compliance-Anforderungen.",
    },
  ],
};

/** Kopfzeile. Reihenfolge = Reihenfolge in der Leiste. */
export const mainNavigation: NavEntry[] = [
  warumEntry,
  leistungenEntry,
  { label: "Referenzen", href: "/referenzen", description: "Kundenfälle mit Zahlen." },
  { label: "Haltung", href: "/haltung", description: "Wonach wir entscheiden." },
  { label: "Community", href: "/community", description: "Die KI-Community auf Skool." },
  { label: "Karriere", href: "/karriere", description: "Offene Stellen bei KITech." },
  { label: "Kontakt", href: "/kontakt", description: "Direkter Draht, ohne Formularschleife." },
];

/**
 * Fußzeile. Deckt bewusst jede öffentliche Route ab — auch die, die nicht in die
 * Kopfzeile passen (Glossar, Selbstcheck, Terminseite). Der Footer ist die Stelle,
 * an der nichts unauffindbar sein darf.
 */
export const footerNavigation: Array<{ title: string; links: NavLink[] }> = [
  {
    title: "Angebot",
    links: [
      { label: "Leistungen", href: "/leistungen" },
      { label: "Für Selbstständige", href: "/solo" },
      { label: "Für Unternehmen", href: "/enterprise" },
      { label: "EU-AI-Act-Selbstcheck", href: "/eu-ai-act-selbstcheck" },
      { label: "Erstgespräch buchen", href: "/lass-uns-reden" },
    ],
  },
  {
    title: "Unternehmen",
    links: [
      { label: "Haltung", href: "/haltung" },
      { label: "Referenzen", href: "/referenzen" },
      { label: "Karriere", href: "/karriere" },
      { label: "Kontakt", href: "/kontakt" },
    ],
  },
  {
    title: "Wissen",
    links: [
      { label: "Warum?", href: "/warum" },
      { label: "Warum du mit KI kein Geld verdienst", href: "/warum-du-mit-ki-kein-geld-verdienst" },
      {
        label: "Warum Unternehmen mit KI kein Geld verdienen",
        href: "/warum-unternehmen-mit-ki-kein-geld-verdienen",
      },
      { label: "Glossar", href: "/glossar" },
      { label: "Community", href: "/community" },
    ],
  },
];

/**
 * Rechtstexte. Standen bis zum 05.08.2026 als kopiertes `legalLinks`-Array in
 * Home, Community, Referenzen, ReferenzDetail, LassUnsReden und der
 * Baustellenseite — sechsmal dieselbe Liste.
 */
export const legalNavigation: NavLink[] = [
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
  { label: "AGB", href: "/agb" },
];

/* ------------------------------------------------------------------------- */
/* Routen-Register                                                            */
/* ------------------------------------------------------------------------- */

export interface RouteDefinition {
  path: string;
  /**
   * Darf die Seite in den Suchindex? `false` bedeutet: die Seite setzt
   * `noindex` in ihrer Metadata und gehört damit nicht in die Sitemap.
   */
  indexable: boolean;
  /**
   * Alias auf eine andere Route (gleicher Inhalt, Canonical zeigt woanders hin).
   * Aliase bleiben aus der Sitemap draußen, sonst entsteht Duplicate Content.
   */
  aliasOf?: string;
  lastModified: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

/**
 * Alle statischen Routen der Website. Dynamische Detailseiten
 * (`/referenzen/[slug]`, `/glossar/[slug]`, `/karriere/[slug]`) stehen hier
 * nicht — die Sitemap leitet sie aus den jeweiligen Datendateien ab, damit sie
 * nicht auseinanderlaufen können.
 *
 * Der Routen-Test in `src/lib/__tests__/routes.test.ts` gleicht diese Liste
 * gegen die tatsächlich vorhandenen `src/app/**\/page.tsx` ab. Eine Route, die
 * hier fehlt oder dort nicht existiert, lässt den Test fehlschlagen.
 */
export const siteRoutes: RouteDefinition[] = [
  { path: "/", indexable: true, lastModified: "2026-08-05", changeFrequency: "weekly", priority: 1.0 },

  // Warum? — die Übersicht ist indexierbar, die beiden Letter bleiben draußen,
  // solange sie Platzhaltertext tragen (isPlaceholder in sales-letters.ts).
  { path: "/warum", indexable: true, lastModified: "2026-08-05", changeFrequency: "monthly", priority: 0.7 },
  {
    path: "/warum-du-mit-ki-kein-geld-verdienst",
    indexable: false,
    lastModified: "2026-08-05",
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    path: "/warum-unternehmen-mit-ki-kein-geld-verdienen",
    indexable: false,
    lastModified: "2026-08-05",
    changeFrequency: "monthly",
    priority: 0.6,
  },

  { path: "/leistungen", indexable: true, lastModified: "2026-08-05", changeFrequency: "monthly", priority: 0.9 },
  { path: "/solo", indexable: true, lastModified: "2026-08-05", changeFrequency: "monthly", priority: 0.8 },
  { path: "/enterprise", indexable: true, lastModified: "2026-08-05", changeFrequency: "monthly", priority: 0.8 },

  { path: "/referenzen", indexable: true, lastModified: "2026-08-05", changeFrequency: "monthly", priority: 0.8 },
  { path: "/haltung", indexable: true, lastModified: "2026-08-05", changeFrequency: "monthly", priority: 0.7 },
  // Seite liegt hinter Milchglas, solange IM_AUFBAU in views/Community.tsx true
  // ist — bis dahin kein Index und nicht in der Sitemap.
  { path: "/community", indexable: false, lastModified: "2026-08-05", changeFrequency: "monthly", priority: 0.9 },
  { path: "/glossar", indexable: true, lastModified: "2026-08-05", changeFrequency: "monthly", priority: 0.6 },
  { path: "/kontakt", indexable: true, lastModified: "2026-08-05", changeFrequency: "monthly", priority: 0.8 },

  // Stellenanzeigen sind noch Platzhalter (isPlaceholder in jobs.ts). Bis echte
  // Stellen drinstehen: kein Index — erfundene Stellenanzeigen in der Suche
  // ziehen echte Bewerbungen auf eine Stelle, die es nicht gibt.
  { path: "/karriere", indexable: false, lastModified: "2026-08-05", changeFrequency: "weekly", priority: 0.6 },

  {
    path: "/lass-uns-reden",
    indexable: true,
    lastModified: "2026-07-11",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/termin",
    indexable: true,
    aliasOf: "/lass-uns-reden",
    lastModified: "2026-07-11",
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    path: "/eu-ai-act-selbstcheck",
    indexable: true,
    lastModified: "2026-07-28",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/selbstcheck",
    indexable: true,
    aliasOf: "/eu-ai-act-selbstcheck",
    lastModified: "2026-07-28",
    changeFrequency: "monthly",
    priority: 0.5,
  },

  { path: "/impressum", indexable: true, lastModified: "2026-07-10", changeFrequency: "yearly", priority: 0.3 },
  { path: "/datenschutz", indexable: true, lastModified: "2026-07-10", changeFrequency: "yearly", priority: 0.3 },
  { path: "/agb", indexable: true, lastModified: "2026-07-10", changeFrequency: "yearly", priority: 0.3 },

  // Eingeloggter Bereich: eigene Domain (app.kitech-software.de über src/proxy.ts),
  // gehört nie in den Index.
  { path: "/app", indexable: false, lastModified: "2026-08-05", changeFrequency: "monthly", priority: 0.1 },
];

/**
 * Weiterleitungen aus `next.config.ts`. Hier gespiegelt, damit der Routen-Test
 * einen Link auf `/skool` nicht als toten Link meldet — die Adresse ist gültig,
 * sie landet nur woanders.
 */
export const permanentRedirects: Record<string, string> = {
  "/skool": "/community",
};

/** Alle statischen Pfade als Menge — praktisch für Prüfungen. */
export const staticRoutePaths: string[] = siteRoutes.map((route) => route.path);
