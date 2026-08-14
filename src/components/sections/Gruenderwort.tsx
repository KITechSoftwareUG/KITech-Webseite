import { Linkedin } from "lucide-react";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { founderInfo } from "@/components/sections/FounderPortrait";
import { company } from "@/config/company";
import { gruenderwort } from "@/data/gruenderwort";

/**
 * Der Abschnitt unter dem Kundenlaufband: Portrait, Zitat, zwei Absätze.
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
          </div>
        </div>
      </div>
    </section>
  );
}
