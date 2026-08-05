"use client";

import Link from "next/link";
import { StructuredData, getWebPageSchema } from "@/components/seo/StructuredData";
import { SignalField } from "@/components/canvas/SignalField";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ClientResults } from "@/components/sections/ClientResults";
import { TeamSection } from "@/components/sections/TeamSection";
import { FinalCta } from "@/components/sections/FinalCta";
import { ScrollHint } from "@/components/sections/ScrollHint";
import { trackEvent } from "@/lib/plausible";

const legalLinks = [
  { name: "Impressum", href: "/impressum" },
  { name: "Datenschutz", href: "/datenschutz" },
  { name: "AGB", href: "/agb" },
];

/**
 * Startseite. Aufbau:
 *   Hero    : ausschliesslich die eine Aussage plus der Erstgespraech-CTA.
 *   Darunter: Kunden-Ergebniskarten, Team, Abschluss-CTA.
 *
 * Der Hero ist am 05.08.2026 auf Ansage radikal leergeraeumt worden. Entfallen
 * sind dabei: das Label "Für den deutschen Mittelstand", der Positionierungs-
 * Absatz ("Wir sind euer Anwendungspartner …"), die Medienflaeche (HeroMedia)
 * und die beiden Kennzahl-Kacheln "50+ Projekte" / "98 % Kundenzufriedenheit".
 * Begruendung: die Aussage soll allein wirken. Wer eines davon zurueckholt,
 * nimmt ihr genau die Wirkung, wegen der der Hero leergeraeumt wurde.
 *
 * Frueher entfernt: ROI-Badge, Logo-Karussell, Trust-Badges und die
 * Sammel-Bewertungszeile ("5 Sterne, 40+ Bewertungen") — die Sterne stehen
 * jetzt bei den einzelnen Kunden auf den Bewertungskarten, wo sie einer
 * konkreten Aussage zugeordnet sind statt anonym im Hero zu haengen.
 */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <StructuredData
        data={getWebPageSchema(
          "KITech Software",
          "Anwendungspartner für KI im deutschen Mittelstand",
          "https://kitech-software.de/"
        )}
      />

      <main className="relative isolate overflow-hidden">
        {/* Hintergrund: Schwarz -> Dunkelblau (Ersatz fuer das Werkstatt-Foto der Referenz),
            dezentes SignalField fuer KI-Textur, plus eine Vignette, damit Text und Karten
            ruhig sitzen. */}
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(112deg, hsl(245 55% 12%) 0%, hsl(243 45% 9%) 46%, hsl(0 0% 5%) 100%)",
            }}
          />
          <SignalField density={0.5} intensity={0.5} baseColor="--primary" accentColor="--accent" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(130% 90% at 22% 32%, transparent 0%, hsl(240 40% 4% / 0.6) 100%)",
            }}
          />
          {/* Weicher Auslauf zur Seitenfarbe. Ohne ihn endet der Hero-Verlauf an
              einer sichtbaren Kante, und der Übergang zu den Karten wirkt wie ein
              Schnitt statt wie ein Weiterlesen. */}
          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-background" />
        </div>

        {/* Kopfzeile sitzt in derselben Containerbreite wie das Grid, damit das Logo
            optisch an seiner bisherigen Stelle bleibt und die Navigation rechts andockt. */}
        <SiteHeader className="mx-auto w-full max-w-[1060px] px-5 pt-7 sm:px-8 lg:px-0" />

        {/* Die Aussage steht allein und mittig. Die Hoehe ist bewusst grosszuegig:
            der Satz braucht Luft um sich herum, sonst ist er nur eine grosse Zeile
            statt eine Ansage. `min-h` mit abgezogener Kopfzeilenhoehe, damit der
            Scroll-Hinweis unten noch im ersten Bildschirm sitzt. */}
        <div className="mx-auto flex w-full max-w-[1060px] flex-col items-center justify-center px-5 pb-16 pt-20 text-center sm:px-8 sm:pb-20 sm:pt-28 lg:min-h-[calc(100svh-210px)] lg:px-0 lg:pt-24">
          {/* Der weisse Marker sitzt auf "mehr" — dem einen Wort, das die Aussage
              traegt. Bewusst nur ein Wort: ueber mehrere Zeilen gezogen zerfaellt
              der Marker in versetzte Bloecke und wird unruhig. */}
          <h1 className="kinetic-display kinetic-morph-in max-w-[16ch] text-balance text-[33px] leading-[1.1] text-foreground sm:text-[58px] sm:leading-[1.08] lg:text-[80px]">
            Falsche KI kostet{" "}
            <span className="box-decoration-clone bg-foreground px-2.5 pb-1 text-background">
              mehr
            </span>{" "}
            als keine KI.
          </h1>

          {/* Calendly-CTA: weisser Block wie in der Referenz ("Termin vereinbaren..."),
              bewusst der visuell dominanteste Block auf der Seite. Der einzige
              Zusatz, der im Hero bleiben darf — er erklaert nichts, er handelt. */}
          <Link
            href="/lass-uns-reden"
            onClick={() => trackEvent("Calendly_Klick", { position: "home-hero" })}
            /* Groesser als der Standard-CTA im Rest der Seite: er ist im leeren
               Hero der einzige Gegenpol zur 80px-Headline und wuerde in der
               kleineren Fassung daneben verschwinden. */
            className="mt-12 inline-flex h-[60px] w-full max-w-[330px] flex-col items-center justify-center bg-foreground px-6 text-center text-background transition-colors hover:bg-foreground/90 sm:mt-14 sm:w-[330px]"
          >
            <span className="block text-[15px] font-semibold leading-tight">
              Kostenloses Erstgespräch buchen
            </span>
            <span className="mt-1 block text-[12px] font-normal leading-tight text-background/58">
              30 Minuten, unverbindlich
            </span>
          </Link>
        </div>

        <ScrollHint targetId="ergebnisse" label="Ergebnisse ansehen" />
      </main>

      {/* Das alte Logo-Karussell ist hier bewusst entfernt: Kundenreferenzen laufen
          ausschliesslich ueber die Ergebniskarten. Eine Leiste mit blossen Logos
          wiederholt nur, was die Karten mit echten Zahlen besser sagen. */}

      {/* Kunden-Ergebniskarten (6 Karten, 2 Spalten). Daten in src/data/client-results.ts. */}
      <ClientResults />

      {/* "Wer wir sind": vier gleich breite Kacheln in einem geschlossenen Block.
          Ayham ist über die Behandlung hervorgehoben (Akzentkante, hellerer Grund),
          nicht mehr über die Größe — siehe Kommentar in TeamSection.tsx. */}
      <TeamSection />

      <FinalCta />

      <footer className="border-t border-border py-6">
        <div className="container flex flex-col items-center gap-3 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} KITech Software UG (haftungsbeschränkt).</p>
          <nav aria-label="Rechtliche Links" className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="transition-colors hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
