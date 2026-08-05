"use client";

import { Linkedin, UserRound } from "lucide-react";
import { SignalField } from "@/components/canvas/SignalField";
import { teamRoster, type TeamMember } from "@/data/team";

/**
 * "Wer wir sind" als EIN geschlossener Block: vier gleich grosse Kacheln in einer
 * Reihe, umlaufend gerahmt, 1px-Fugen dazwischen.
 *
 * Vorher stand Ayham bis zu 840px hoch in der Mitte und drei kleine Portraits
 * schwebten absolut positioniert drumherum — die Sektion baute ueber 1200px hoch.
 * Das war der Kern der Beanstandung ("braucht viel zu viel Platz"). Jetzt traegt
 * die Breite die Komposition statt der Hoehe: feste, flache Medienhoehe pro Kachel,
 * kein Schweben, keine absolute Positionierung.
 *
 * Ayham ist nicht mehr ueber die GROESSE hervorgehoben, sondern ueber die
 * BEHANDLUNG (Akzentkante oben, hellerer Grund). Nur so bleiben alle vier Kacheln
 * identisch breit — und genau das ist das "geblockte" Bild.
 *
 * Seit 05.08.2026 traegt jede Kachel zusaetzlich einen Satz zur Person und die
 * LinkedIn-Verlinkung. Die Medienhoehe ist dafuer bewusst gesunken: der Textblock
 * darunter holt sich die Hoehe zurueck, die das Bild abgibt, der Gesamtblock
 * bleibt damit so flach wie vorher.
 *
 * Die Fugen entstehen ueber `gap-px` auf dem Raster plus `bg-border` am Container:
 * saubere 1px-Linien ohne nth-child-Randlogik, auch wenn das Raster auf Mobile
 * zweispaltig umbricht.
 */

/**
 * Studio-Grund hinter dem freigestellten Portrait. Ohne diese aufgehellte Flaeche
 * verschwinden dunkle Anzuege auf dem near-black Seitenhintergrund.
 */
const PHOTO_GROUND =
  "bg-[linear-gradient(165deg,hsl(240_14%_42%)_0%,hsl(243_22%_22%)_62%,hsl(243_28%_14%)_100%)]";

/** Gleicher Grund, eine Spur heller — die Hervorhebung des Gruenders. */
const PHOTO_GROUND_HIGHLIGHT =
  "bg-[linear-gradient(165deg,hsl(240_18%_50%)_0%,hsl(244_26%_26%)_62%,hsl(244_30%_15%)_100%)]";

/**
 * Kachel ohne Portrait: derselbe ausgeleuchtete Hintergrund wie hinter den Fotos,
 * damit die Kachel sichtbar zum selben "Raum" gehoert.
 */
const EMPTY_GROUND =
  "bg-[radial-gradient(120%_90%_at_50%_0%,hsl(243_20%_24%)_0%,hsl(243_24%_13%)_58%,hsl(243_28%_9%)_100%)]";

function TeamTile({ member }: { member: TeamMember }) {
  const ground = member.photo
    ? member.highlight
      ? PHOTO_GROUND_HIGHLIGHT
      : PHOTO_GROUND
    : EMPTY_GROUND;

  return (
    <li className="relative flex flex-col bg-background">
      {/* Feste Medienhoehe statt Seitenverhaeltnis: so bleibt der Block flach,
          egal wie breit die Spalten gerade sind. */}
      <div className={`relative h-[190px] overflow-hidden sm:h-[240px] lg:h-[260px] ${ground}`}>
        {member.photo ? (
          <img
            src={member.photo}
            alt={`${member.name}, ${member.role}`}
            /* Schlagschatten wie bei den Silhouetten in ClientResults: er loest die
               freigestellte Person vom Grund ab, ohne einen Rahmen zu brauchen. */
            className="h-full w-full object-cover object-top drop-shadow-[0_16px_28px_rgba(0,0,0,0.55)]"
            loading="lazy"
          />
        ) : (
          /* Neutraler Platzhalter, solange kein Foto vorliegt: eine Silhouette in
             sehr niedrigem Kontrast. Bewusst kein "Foto folgt"-Text und keine
             Initialen — die Kachel soll gestaltet wirken, nicht unfertig. */
          <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
            <UserRound className="h-20 w-20 text-foreground/20 sm:h-24 sm:w-24" strokeWidth={1} />
          </div>
        )}
        {member.highlight && (
          <span
            className="absolute inset-x-0 top-0 h-[3px] bg-accent"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Textleiste: in allen vier Kacheln strukturell identisch — Name, Rolle,
          ein Satz, LinkedIn. `mt-auto` am Link haelt die Verlinkung auf einer
          Linie, auch wenn die Saetze unterschiedlich lang umbrechen. */}
      <div className="flex flex-1 flex-col border-t border-border/70 px-3 py-3.5 sm:px-4">
        <span className="text-[13px] font-semibold leading-tight text-foreground sm:text-[14px]">
          {member.name}
        </span>
        <span className="mt-1 text-[11px] leading-tight text-muted-foreground sm:text-[12px]">
          {member.role}
        </span>
        <p className="mt-2.5 text-pretty text-[11.5px] leading-[1.55] text-muted-foreground sm:text-[12.5px]">
          {member.bio}
        </p>

        {member.linkedinUrl && (
          <a
            href={member.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex w-fit items-center gap-1.5 pt-3.5 text-[11.5px] font-semibold text-foreground transition-colors hover:text-primary sm:text-[12px]"
          >
            <Linkedin className="h-3.5 w-3.5" aria-hidden="true" />
            LinkedIn
            <span className="sr-only">-Profil von {member.name} (öffnet in neuem Tab)</span>
          </a>
        )}
      </div>
    </li>
  );
}

export function TeamSection() {
  return (
    <section
      className="relative isolate overflow-hidden bg-background py-16 sm:py-20"
      aria-labelledby="team-heading"
    >
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, hsl(0 0% 5%) 0%, hsl(245 48% 10%) 54%, hsl(0 0% 4%) 100%)",
          }}
        />
        <SignalField density={0.35} intensity={0.35} baseColor="--primary" accentColor="--accent" />
        <div className="absolute inset-x-0 top-0 h-px bg-border/60" />
      </div>

      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        {/* Kein erklaerender Absatz unter der Headline — bewusst ersatzlos gestrichen.
            Das Label bleibt: es ist als einzige Ausnahme ausdruecklich freigegeben. */}
        <header className="max-w-[620px]">
          <span className="mb-4 block w-fit border border-border px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Wer wir sind
          </span>
          <h2
            id="team-heading"
            className="kinetic-display text-balance text-[32px] leading-[1.1] text-foreground sm:text-[42px]"
          >
            Hier das KITech Team
          </h2>
        </header>

        {/* `bg-border` faerbt die 1px-Fugen zwischen den Kacheln. */}
        <div className="mt-8 border border-border bg-border sm:mt-10">
          <ul className="grid grid-cols-2 gap-px lg:grid-cols-4">
            {teamRoster.map((member) => (
              <TeamTile key={member.name} member={member} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
