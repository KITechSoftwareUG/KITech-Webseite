"use client";

import Link from "next/link";
import { StructuredData, getWebPageSchema } from "@/components/seo/StructuredData";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { ClientResults } from "@/components/sections/ClientResults";
import { TeamSection } from "@/components/sections/TeamSection";
import { FinalCta } from "@/components/sections/FinalCta";
import { ScrollHint } from "@/components/sections/ScrollHint";
import { trackEvent } from "@/lib/plausible";

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
 *
 * Kopfzeile, Fusszeile und Hintergrund kommen seit dem Aufraeumen am 05.08.2026
 * aus `PageShell` — vorher baute diese Datei alle drei selbst, mit einer eigenen
 * Containerbreite (1060px) und einer eigenen Fusszeile.
 */
export default function Home() {
  return (
    <PageShell
      /* Der eingefaerbte Bereich endet dort, wo der Hero endet — deshalb
         mitwachsend statt fester Wert: auf grossen Schirmen fuellt der Hero
         einen Bildschirm, auf dem Handy deutlich weniger. Laeuft der Verlauf
         zu weit, faerbt er die ersten Ergebniskarten mit ein. */
      backdropClassName="absolute inset-x-0 top-0 -z-10 h-[540px] sm:h-[640px] lg:h-[100svh]"
      backdropVignette
      backdropDensity={0.5}
      backdropIntensity={0.5}
    >
      <StructuredData
        data={getWebPageSchema(
          "KITech Software",
          "Anwendungspartner für KI im deutschen Mittelstand",
          "https://kitech-software.de/"
        )}
      />

      {/* Die Aussage steht allein und mittig. Die Hoehe ist bewusst grosszuegig:
          der Satz braucht Luft um sich herum, sonst ist er nur eine grosse Zeile
          statt eine Ansage. `min-h` mit abgezogener Kopfzeilenhoehe, damit der
          Scroll-Hinweis unten noch im ersten Bildschirm sitzt. */}
      <div
        className={`${SITE_CONTAINER} flex flex-col items-center justify-center pb-16 pt-20 text-center sm:pb-20 sm:pt-28 lg:min-h-[calc(100svh-210px)] lg:pt-24`}
      >
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
    </PageShell>
  );
}
