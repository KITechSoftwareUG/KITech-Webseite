import { Linkedin } from "lucide-react";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { founderInfo } from "@/components/sections/FounderPortrait";
import { TeamTile } from "@/components/sections/TeamSection";
import { company } from "@/config/company";
import { gruenderwort } from "@/data/gruenderwort";
import { teamRoster } from "@/data/team";

/**
 * Der Abschnitt unter dem Kundenlaufband: das Gründerwort, darunter das Team.
 *
 * **Am 14.08.2026 umgebaut, auf Ansage:** „Alle nebeneinander auch — nicht nur
 * mich so prominent darstellen!" Vorher stand hier Ayhams Portrait 300 px breit
 * links neben dem Zitat, und die Kollegen kamen als Textzeilen darunter. Jetzt
 * trägt der Text allein — und alle drei stehen in gleich breiten Kacheln
 * nebeneinander, mit gleich hohem Bildfeld und ohne Auszeichnung für den
 * Gründer.
 *
 * Die Kacheln kommen aus `TeamSection` (`TeamTile`) und sind damit dieselben
 * wie überall sonst: ein Foto oder, solange keines vorliegt, eine neutrale
 * Silhouette.
 *
 * Das Zitat braucht trotzdem eine Zuschreibung — ohne Namen darunter weiß
 * niemand, wer da spricht. Sie steht klein, nicht als zweite Überschrift.
 *
 * Kein Label über der Überschrift, keine Icon-Kacheln, kein zweiter Knopf: der
 * Aufruf steht im Hero und im Popup, hier steht der Grund, ihm zu folgen.
 */

/**
 * Die Personen in der Reihenfolge aus `gruenderwort.ts`. Ein Name ohne Eintrag
 * in `team.ts` fällt still weg, statt eine leere Kachel zu erzeugen.
 */
const team = gruenderwort.teamNamen
  .map((name) => teamRoster.find((person) => person.name === name))
  .filter((person): person is (typeof teamRoster)[number] => Boolean(person));

export function Gruenderwort() {
  return (
    <section className="bg-surface">
      <div className={`${SITE_CONTAINER} py-16 sm:py-20`} aria-labelledby="gruenderwort">
        <h2 id="gruenderwort" className="sr-only">
          {gruenderwort.ueberschrift}
        </h2>

        {/* Textbreite begrenzt: 1180 px sind für einen Absatz unlesbar, und das
            Zitat soll umbrechen wie ein Satz, nicht wie eine Zeile. */}
        <div className="max-w-[860px]">
          <blockquote className="text-balance text-h3 leading-[1.25] text-foreground sm:text-[32px]">
            „{gruenderwort.zitat}“
          </blockquote>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-[13px] leading-tight text-muted-foreground">
              <span className="font-semibold text-foreground">{founderInfo.name}</span>
              {" — "}
              {founderInfo.role}, {company.legalName}
            </p>

            <a
              href={founderInfo.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] text-primary transition-opacity hover:opacity-80"
            >
              <Linkedin className="h-3.5 w-3.5" aria-hidden="true" />
              LinkedIn
              <span className="sr-only">-Profil von {founderInfo.name} (öffnet in neuem Tab)</span>
            </a>
          </div>

          {gruenderwort.absaetze.map((absatz) => (
            <p key={absatz.slice(0, 40)} className="mt-6 text-pretty text-lead text-foreground">
              {absatz}
            </p>
          ))}

          <p className="mt-6 text-pretty text-lead font-semibold text-foreground">
            {gruenderwort.abschluss}
          </p>
        </div>

        {team.length > 0 && (
          <div className="mt-12">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              {gruenderwort.teamUeberschrift}
            </h3>

            {/*
              Auf dem Handy zwei Spalten, ab `lg` alle nebeneinander. `lg:grid-cols-3`
              ist fest und nicht aus `team.length` gerechnet: Tailwind erzeugt seine
              Klassen beim Build und kennt zur Laufzeit zusammengesetzte Namen nicht.
              Kommt eine vierte Person dazu, bricht das Raster in eine zweite Zeile um.
            */}
            <ul className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-3 lg:gap-6">
              {team.map((person) => (
                <TeamTile key={person.name} member={person} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
