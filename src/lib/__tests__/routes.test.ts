import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  mainNavigation,
  footerNavigation,
  legalNavigation,
  siteRoutes,
  permanentRedirects,
} from "@/config/navigation";
import { clientResults } from "@/data/client-results";
import { glossaryTerms } from "@/data/glossary";
import { jobs } from "@/data/jobs";

/**
 * Routen- und Link-Prüfung.
 *
 * Anlass: Beim Relaunch am 05.08.2026 pflegten Kopfzeile, Fußzeile und Sitemap
 * je eine eigene Liste von Pfaden. Sie waren auseinandergelaufen — mehrere
 * Routen existierten, standen aber in keiner Navigation, und die Sitemap listete
 * nicht alles Indexierbare. So etwas fällt beim Draufschauen nicht auf; es fällt
 * auf, wenn ein Besucher auf einer 404 landet.
 *
 * Der Test liest deshalb die *tatsächlich vorhandenen* Routen aus `src/app`
 * (nicht aus einer gepflegten Liste) und prüft jeden internen Link im aktiven
 * Quellcode dagegen.
 *
 * Nicht geprüft wird `src/views/legacy/` — die Dateien sind nicht geroutet und
 * aus TypeScript- und ESLint-Prüfung ausgenommen. Ihre Links zeigen teils auf
 * Seiten, die es nicht mehr gibt, und das ist in Ordnung.
 */

const PROJEKT_WURZEL = process.cwd();
const APP_VERZEICHNIS = path.join(PROJEKT_WURZEL, "src", "app");
const QUELL_VERZEICHNIS = path.join(PROJEKT_WURZEL, "src");

/* -------------------------------------------------------------------------- */
/* Routen aus dem Dateisystem ableiten                                        */
/* -------------------------------------------------------------------------- */

/**
 * Alle Routen, die der App Router tatsächlich ausliefert — abgeleitet aus den
 * `page.tsx`-Dateien. Dynamische Segmente bleiben als `[slug]` stehen.
 */
function findeRouten(verzeichnis: string, prefix = ""): string[] {
  const routen: string[] = [];

  for (const eintrag of fs.readdirSync(verzeichnis, { withFileTypes: true })) {
    if (eintrag.isDirectory()) {
      // Route Groups `(name)` tauchen im Pfad nicht auf; private Ordner `_name` gar nicht.
      if (eintrag.name.startsWith("_")) continue;
      const segment = eintrag.name.startsWith("(") ? "" : `/${eintrag.name}`;
      routen.push(...findeRouten(path.join(verzeichnis, eintrag.name), `${prefix}${segment}`));
    } else if (eintrag.name === "page.tsx") {
      routen.push(prefix === "" ? "/" : prefix);
    }
  }

  return routen;
}

const vorhandeneRouten = findeRouten(APP_VERZEICHNIS);
const statischeRouten = vorhandeneRouten.filter((route) => !route.includes("["));
const dynamischeRouten = vorhandeneRouten.filter((route) => route.includes("["));

/** Slugs, die eine dynamische Route tatsächlich erzeugt (aus `generateStaticParams`). */
const dynamischeSlugs: Record<string, string[]> = {
  "/referenzen/[slug]": clientResults.map((result) => result.slug),
  "/glossar/[slug]": glossaryTerms.map((term) => term.slug),
  "/karriere/[slug]": jobs.map((job) => job.slug),
};

/* -------------------------------------------------------------------------- */
/* Links aus dem Quellcode sammeln                                            */
/* -------------------------------------------------------------------------- */

function sammleQuelldateien(verzeichnis: string): string[] {
  const dateien: string[] = [];

  for (const eintrag of fs.readdirSync(verzeichnis, { withFileTypes: true })) {
    const vollerPfad = path.join(verzeichnis, eintrag.name);

    if (eintrag.isDirectory()) {
      // Alt-Seiten und Tests bleiben außen vor, ebenso die generierten shadcn-Bausteine.
      if (eintrag.name === "legacy" || eintrag.name === "__tests__" || eintrag.name === "ui") {
        continue;
      }
      dateien.push(...sammleQuelldateien(vollerPfad));
    } else if (/\.tsx?$/.test(eintrag.name)) {
      dateien.push(vollerPfad);
    }
  }

  return dateien;
}

interface GefundenerLink {
  ziel: string;
  datei: string;
  /** Link mit Template-Anteil, z. B. `/referenzen/${slug}` — nur der Präfix ist prüfbar. */
  dynamisch: boolean;
}

/**
 * Sammelt interne Ziele aus `href="..."`, ``href={`...`}`` und `router.push("...")`.
 *
 * Externe Ziele (`https:`, `mailto:`, `tel:`) und reine Anker (`#…`) sind keine
 * Routen und werden übersprungen.
 */
function sammleLinks(): GefundenerLink[] {
  const links: GefundenerLink[] = [];

  const muster = [
    /href=["'](\/[^"'{}]*)["']/g,
    /href=\{`(\/[^`]*)`\}/g,
    /router\.push\(["'](\/[^"']*)["']\)/g,
    /router\.push\(`(\/[^`]*)`\)/g,
  ];

  for (const datei of sammleQuelldateien(QUELL_VERZEICHNIS)) {
    const inhalt = fs.readFileSync(datei, "utf-8");
    const relativ = path.relative(PROJEKT_WURZEL, datei);

    for (const regex of muster) {
      for (const treffer of inhalt.matchAll(regex)) {
        const ziel = treffer[1];
        if (!ziel.startsWith("/")) continue;
        links.push({
          ziel,
          datei: relativ,
          dynamisch: ziel.includes("${"),
        });
      }
    }
  }

  return links;
}

/**
 * Löst ein Linkziel gegen die vorhandenen Routen auf.
 * Gibt `null` zurück, wenn keine Route passt — dann ist der Link tot.
 */
function findePassendeRoute(ziel: string): string | null {
  // Query und Anker gehören nicht zum Pfad.
  const pfad = ziel.split(/[?#]/)[0].replace(/\/$/, "") || "/";

  if (statischeRouten.includes(pfad)) return pfad;
  if (permanentRedirects[pfad]) return pfad;

  // Template-Link: alles ab `${` ist zur Laufzeit variabel, der Präfix muss zu
  // einer dynamischen Route passen.
  if (pfad.includes("${")) {
    const prefix = pfad.slice(0, pfad.indexOf("${")).replace(/\/$/, "");
    const passend = dynamischeRouten.find((route) => route.startsWith(`${prefix}/[`));
    return passend ?? null;
  }

  // Konkreter dynamischer Pfad, z. B. /glossar/mlops
  const segmente = pfad.split("/").filter(Boolean);
  for (const route of dynamischeRouten) {
    const routenSegmente = route.split("/").filter(Boolean);
    if (routenSegmente.length !== segmente.length) continue;

    const passt = routenSegmente.every(
      (segment, index) => segment.startsWith("[") || segment === segmente[index]
    );
    if (passt) return route;
  }

  return null;
}

/* -------------------------------------------------------------------------- */

describe("Routen im App Router", () => {
  it("liefert überhaupt Routen", () => {
    expect(vorhandeneRouten.length).toBeGreaterThan(15);
  });

  it("kennt für jede statische Route einen Eintrag im Routen-Register", () => {
    // `/app/auth/*` sind Route Handler ohne page.tsx und tauchen hier nicht auf.
    const fehlend = statischeRouten.filter(
      (route) => !siteRoutes.some((eintrag) => eintrag.path === route)
    );

    expect(
      fehlend,
      `Diese Routen existieren, stehen aber nicht in siteRoutes (src/config/navigation.ts) — ` +
        `damit fehlen sie in der Sitemap-Entscheidung: ${fehlend.join(", ")}`
    ).toEqual([]);
  });

  it("hat für jeden Eintrag im Routen-Register eine echte Seite", () => {
    const verwaist = siteRoutes.filter((eintrag) => !statischeRouten.includes(eintrag.path));

    expect(
      verwaist.map((eintrag) => eintrag.path),
      "Diese Pfade stehen in siteRoutes, es gibt aber keine page.tsx dazu"
    ).toEqual([]);
  });
});

describe("Interne Links", () => {
  const links = sammleLinks();

  it("findet Links zum Prüfen", () => {
    expect(links.length).toBeGreaterThan(20);
  });

  it("zeigt kein Link ins Leere", () => {
    const tot = links.filter((link) => findePassendeRoute(link.ziel) === null);

    expect(
      tot.map((link) => `${link.ziel}  (in ${link.datei})`),
      "Diese Links zeigen auf Pfade, für die es keine Route und keinen Redirect gibt"
    ).toEqual([]);
  });

  it("verweist auf keine Route, die es nur als Alt-Seite gab", () => {
    // Diese Pfade gab es vor dem Relaunch; sie dürfen nicht versehentlich
    // zurückkommen, ohne dass eine Route dafür angelegt wird.
    const entfallen = ["/skool", "/community"];
    const direkteTreffer = links.filter((link) => entfallen.includes(link.ziel));

    for (const treffer of direkteTreffer) {
      expect(
        permanentRedirects[treffer.ziel],
        `${treffer.ziel} wird in ${treffer.datei} verlinkt, hat aber keinen Redirect`
      ).toBeTruthy();
    }
  });
});

describe("Navigation", () => {
  const navigationsZiele = [
    ...mainNavigation.flatMap((entry) => [entry.href, ...(entry.children?.map((c) => c.href) ?? [])]),
    ...footerNavigation.flatMap((column) => column.links.map((link) => link.href)),
    ...legalNavigation.map((link) => link.href),
  ];

  it("führt jeder Navigationspunkt auf eine echte Seite", () => {
    const tot = navigationsZiele.filter((ziel) => findePassendeRoute(ziel) === null);
    expect(tot, "Navigationspunkte ohne Route").toEqual([]);
  });

  it("ist jede öffentliche Route von irgendwo aus erreichbar", () => {
    /**
     * Der eigentliche Zweck dieser Datei. Eine Seite, die existiert, aber in
     * keiner Navigation steht, findet niemand — genau das war vor dem Relaunch
     * bei /leistungen, /haltung, /kontakt und /glossar der Fall.
     *
     * Ausgenommen sind nur Ziele, die bewusst nicht in der Navigation stehen:
     * Alias-Routen, der eingeloggte Bereich und die beiden Rechtstexte, die über
     * `legalNavigation` laufen (dort geprüft).
     */
    const ausgenommen = new Set([
      "/termin", // Alias auf /lass-uns-reden
      "/selbstcheck", // Alias auf /selbstcheck_eu_ai_act
      "/app", // eigener Bereich, eigene Domain
      "/funnel", // LinkedIn-Landingpage, eigene Domain, bewusst ohne Website-Navigation
      "/fokus", // LinkedIn-Landingpage, eigene Domain, bewusst ohne Website-Navigation
    ]);

    const erreichbar = new Set(navigationsZiele);
    const unerreichbar = statischeRouten.filter(
      (route) => route !== "/" && !ausgenommen.has(route) && !erreichbar.has(route)
    );

    expect(
      unerreichbar,
      "Diese Seiten existieren, sind aber über keine Navigation erreichbar"
    ).toEqual([]);
  });
});

describe("Sitemap-Entscheidung", () => {
  it("markiert die Platzhalter-Routen als nicht indexierbar", () => {
    /**
     * Diese drei tragen Platzhaltertext (Sales Letter) bzw. erfundene Stellen
     * (Karriere). Beides darf nicht in den Suchindex — bei den Stellen zieht es
     * sonst echte Bewerbungen auf Stellen, die es nicht gibt.
     */
    const muessenNoindexSein = [
      "/warum-du-mit-ki-kein-geld-verdienst",
      "/warum-unternehmen-mit-ki-kein-geld-verdienen",
      "/karriere",
    ];

    for (const pfad of muessenNoindexSein) {
      const eintrag = siteRoutes.find((route) => route.path === pfad);
      expect(eintrag, `${pfad} fehlt im Routen-Register`).toBeDefined();
      expect(eintrag?.indexable, `${pfad} müsste auf noindex stehen`).toBe(false);
    }
  });

  it("kennt jeden dynamischen Slug, auf den verlinkt wird", () => {
    for (const [route, slugs] of Object.entries(dynamischeSlugs)) {
      expect(dynamischeRouten, `Route ${route} fehlt`).toContain(route);
      expect(slugs.length, `${route} hat keine Einträge`).toBeGreaterThan(0);
      // Slugs müssen URL-tauglich sein, sonst bricht der statische Export.
      for (const slug of slugs) {
        expect(slug, `Ungültiger Slug in ${route}`).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      }
    }
  });
});
