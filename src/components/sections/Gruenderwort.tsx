import { Linkedin } from "lucide-react";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { founderInfo } from "@/components/sections/FounderPortrait";
import { company } from "@/config/company";
import { gruenderwort } from "@/data/gruenderwort";
import { teamRoster } from "@/data/team";

/**
 * Die Kollegen, in der Reihenfolge aus `gruenderwort.ts`. Ein Name ohne Eintrag
 * in `team.ts` fällt still weg, statt eine leere Zeile zu erzeugen.
 */
const team = gruenderwort.teamNamen
  .map((name) => teamRoster.find((person) => person.name === name))
  .filter((person): person is (typeof teamRoster)[number] => Boolean(person));

/**
 * Der Abschnitt unter dem Kundenlaufband: Portrait, Zitat, zwei Absätze, Team.
 *
 * Aufbau bewusst identisch zum Gründerblock auf `/haltung` — Portrait links,
 * unsichtbare Überschrift, Zitat als tragendes Element, darunter Name, Rolle
 * und LinkedIn in einem eckigen Rahmen. Wer beide Seiten sieht, soll dieselbe
 * Person in derselben Form wiedererkennen und nicht zwei Entwürfe.
 *
 * Kein Label über der Überschrift, keine Icon-Kacheln, kein zweiter Knopf: der
 * Aufruf steht im Hero und im Popup, hier steht der Grund, ihm zu folgen.
 *
 * Server Component — nichts daran ist interaktiv.
 */
export function Gruenderwort() {
  return (
    <section className="bg-surface">
      <div className={`${SITE_CONTAINER} py-16 sm:py-20`} aria-labelledby="gruenderwort">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-14">
          <img
            src={founderInfo.imageUrl}
            alt={`${founderInfo.name}, ${founderInfo.role} von KITech Software`}
            loading="lazy"
            className="portrait-fade w-full max-w-[300px] border border-border bg-background object-contain object-bottom"
          />

          <div className="min-w-0">
            <h2 id="gruenderwort" className="sr-only">
              {gruenderwort.ueberschrift}
            </h2>

            <blockquote className="text-balance text-h3 leading-[1.25] text-foreground sm:text-[32px]">
              „{gruenderwort.zitat}“
            </blockquote>

            {gruenderwort.absaetze.map((absatz) => (
              <p key={absatz.slice(0, 40)} className="mt-6 text-pretty text-lead text-foreground">
                {absatz}
              </p>
            ))}

            <p className="mt-6 text-pretty text-lead font-semibold text-foreground">
              {gruenderwort.abschluss}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <div>
                <p className="text-[15px] font-semibold leading-tight text-foreground">
                  {founderInfo.name}
                </p>
                <p className="mt-1 text-[12px] leading-tight text-muted-foreground">
                  {founderInfo.role}, {company.legalName}
                </p>
              </div>

              <a
                href={founderInfo.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-border px-3 py-2 text-[12px] text-foreground/80 transition-colors hover:border-primary hover:text-primary"
              >
                <Linkedin className="h-3.5 w-3.5" aria-hidden="true" />
                LinkedIn
              </a>
            </div>

            {/*
              Das Team steht dort, wo Ayham steht — auf Ansage (14.08.2026).
              Bewusst ohne Fotos: für Jörg liegt keins vor, und Leons Gesicht
              ist auf derselben Seite schon einmal zu sehen (als Kunde im
              Kundenlaufband). Zwei graue Silhouetten neben einem echten
              Portrait wären der schlechtere Eindruck als gar keins. Name,
              Rolle und ein Satz reichen — Trennlinien statt Kacheln, wie
              überall sonst auf der Seite.
            */}
            {team.length > 0 && (
              <div className="mt-12 border-t border-border pt-8">
                <h3 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {gruenderwort.teamUeberschrift}
                </h3>

                <dl className="mt-5 grid gap-6 sm:grid-cols-2 sm:gap-8">
                  {team.map((person) => (
                    <div key={person.name}>
                      <dt className="text-[15px] font-semibold leading-tight text-foreground">
                        {/* Echtes Leerzeichen statt `ml-2`: sonst liest ein
                            Screenreader „LeonEntwickler" am Stück vor. */}
                        {person.name}{" "}
                        <span className="font-normal text-muted-foreground">{person.role}</span>
                      </dt>
                      <dd className="mt-2 text-pretty text-fliess text-muted-foreground">
                        {person.bio}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
