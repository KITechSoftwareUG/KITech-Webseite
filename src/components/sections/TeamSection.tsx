"use client";

import { Linkedin, UserRound } from "lucide-react";
import { teamRoster, type TeamMember } from "@/data/team";

/**
 * "Wer wir sind" als EIN geschlossener Block: vier gleich grosse Kacheln in einer
 * Reihe.
 *
 * Vorher stand Ayham bis zu 840px hoch in der Mitte und drei kleine Portraits
 * schwebten absolut positioniert drumherum — die Sektion baute ueber 1200px hoch.
 * Das war der Kern der Beanstandung ("braucht viel zu viel Platz"). Jetzt traegt
 * die Breite die Komposition statt der Hoehe: feste, flache Medienhoehe pro Kachel,
 * kein Schweben, keine absolute Positionierung.
 *
 * Ayham ist nicht mehr ueber die GROESSE hervorgehoben, sondern ueber die
 * BEHANDLUNG (Akzentkante oben in der Signalfarbe). Nur so bleiben alle vier
 * Kacheln identisch breit — und genau das ist das "geblockte" Bild.
 *
 * Seit 05.08.2026 traegt jede Kachel zusaetzlich einen Satz zur Person und die
 * LinkedIn-Verlinkung. Die Medienhoehe ist dafuer bewusst gesunken: der Textblock
 * darunter holt sich die Hoehe zurueck, die das Bild abgibt, der Gesamtblock
 * bleibt damit so flach wie vorher.
 *
 * Helles Design (11.08.2026): Die Kacheln waren ein zusammenhaengendes Gitter mit
 * 1px-Fugen (`gap-px` auf `bg-border`) — eine Loesung fuer den dunklen Grund, wo
 * eine Linie das einzige Mittel war, Flaechen zu trennen. Auf Weiss uebernimmt das
 * die Karte selbst: vier eigenstaendige weisse Karten mit Rundung, Schatten und
 * Ring, wie in `ClientResults`. Die Canvas-Animation im Sektionshintergrund
 * (`SignalField`) ist ersatzlos entfallen, es gibt auf hellem Grund nichts zu
 * leuchten.
 */

/**
 * Grund hinter dem freigestellten Portrait. Die Fotos sind transparent
 * freigestellt; auf reinem Weiss saehe die Person aus, als schwebe sie im Nichts.
 * Das leichte Grau setzt ein sichtbares Bildfeld ab, ohne wie ein zweiter
 * Farbton zu wirken — dasselbe Feld wie in den Kundenkarten.
 */
const PHOTO_GROUND = "bg-surface-strong";

/** Gleiches Bildfeld, eine Spur heller — die Hervorhebung des Gruenders. */
const PHOTO_GROUND_HIGHLIGHT = "bg-surface";

/**
 * Kachel ohne Portrait: derselbe Grund wie hinter den Fotos, damit die Kachel
 * sichtbar zum selben "Raum" gehoert.
 */
const EMPTY_GROUND = "bg-surface-strong";

function TeamTile({ member }: { member: TeamMember }) {
  const ground = member.photo
    ? member.highlight
      ? PHOTO_GROUND_HIGHLIGHT
      : PHOTO_GROUND
    : EMPTY_GROUND;

  return (
    <li className="relative flex flex-col overflow-hidden rounded-lg bg-white border border-border">
      {/* Feste Medienhoehe statt Seitenverhaeltnis: so bleibt der Block flach,
          egal wie breit die Spalten gerade sind. */}
      <div className={`relative h-[190px] overflow-hidden sm:h-[240px] lg:h-[260px] ${ground}`}>
        {member.photo ? (
          <img
            src={member.photo}
            alt={`${member.name}, ${member.role}`}
            /* Weicher, dunkler Schlagschatten statt des frueheren harten Schwarz:
               auf hellem Grund liest sich ein starker Schatten als Schmutzrand.
               Er loest die freigestellte Person vom Bildfeld ab, ohne Rahmen. */
            className="h-full w-full object-cover object-top drop-shadow-[0_14px_24px_rgba(19,22,40,0.18)]"
            loading="lazy"
          />
        ) : (
          /* Neutraler Platzhalter, solange kein Foto vorliegt: eine Silhouette in
             sehr niedrigem Kontrast. Bewusst kein "Foto folgt"-Text und keine
             Initialen — die Kachel soll gestaltet wirken, nicht unfertig. */
          <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
            <UserRound
              className="h-20 w-20 text-muted-foreground/35 sm:h-24 sm:w-24"
              strokeWidth={1}
            />
          </div>
        )}
        {member.highlight && (
          <span className="absolute inset-x-0 top-0 h-[3px] bg-primary" aria-hidden="true" />
        )}
      </div>

      {/* Textleiste: in allen vier Kacheln strukturell identisch — Name, Rolle,
          ein Satz, LinkedIn. `mt-auto` am Link haelt die Verlinkung auf einer
          Linie, auch wenn die Saetze unterschiedlich lang umbrechen. */}
      <div className="flex flex-1 flex-col border-t border-border px-4 py-4 sm:px-5">
        <span className="text-fliess font-bold leading-tight text-foreground sm:text-fliess">
          {member.name}
        </span>
        <span className="mt-1 text-mini font-normal leading-tight text-muted-foreground sm:text-[12px]">
          {member.role}
        </span>
        <p className="mt-2.5 text-pretty text-[11.5px] font-normal leading-[1.55] text-muted-foreground sm:text-[12.5px]">
          {member.bio}
        </p>

        {member.linkedinUrl && (
          <a
            href={member.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex w-fit items-center gap-1.5 pt-3.5 text-[11.5px] font-semibold text-primary transition-opacity hover:opacity-80 sm:text-[12px]"
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
    // `bg-surface` statt Weiss: die Sektion steht zwischen weissen Abschnitten,
    // und die weissen Karten brauchen einen Grund, von dem sie sich abheben.
    <section className="bg-surface py-16 sm:py-20" aria-labelledby="team-heading">
      <div className="mx-auto w-full max-w-site px-5 sm:px-8">
        {/* Kein erklaerender Absatz unter der Headline — bewusst ersatzlos gestrichen.
            Das Label bleibt: es ist als einzige Ausnahme ausdruecklich freigegeben.
            Als dunkelblaue Pille statt als grauer Kasten — auf hellem Grund ist der
            umrandete Kasten kaum sichtbar, die Signalfarbe traegt ihn. */}
        <header className="max-w-[620px]">
          <span className="mb-4 block w-fit rounded-full bg-primary px-3 py-1 text-mini font-bold uppercase tracking-wide text-primary-foreground">
            Wer wir sind
          </span>
          <h2
            id="team-heading"
            className="kinetic-display text-balance text-[36px] leading-[1.1] text-foreground sm:text-[42px]"
          >
            Hier das KITech Team
          </h2>
        </header>

        {/* Eigenstaendige Karten mit echtem Abstand statt eines Gitters mit
            1px-Fugen — siehe Kopfkommentar. */}
        <div className="mt-8 sm:mt-10">
          <ul className="grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-6">
            {teamRoster.map((member) => (
              <TeamTile key={member.name} member={member} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
