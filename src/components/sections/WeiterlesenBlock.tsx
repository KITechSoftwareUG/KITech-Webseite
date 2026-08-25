"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import type { ArtikelTeaser } from "@/lib/wissen/empfehlungen";

/**
 * Artikel aus `/gratis-wissen` am Fuß einer Hauptseite.
 *
 * **Wozu.** Am 24.08.2026 wurde gemessen, dass keine einzige Hauptseite auf
 * einen Artikel verlinkte — der ganze Wissensbereich hing allein am Hub. Dieser
 * Block schließt die Lücke: Er steht zwischen dem letzten Inhaltsabschnitt und
 * dem Abschluss-CTA und gibt jedem Artikel einen Weg von einer Seite, die
 * Autorität trägt. Welche Artikel hier landen, entscheidet
 * `empfehlungenFuer()` in `src/lib/wissen/empfehlungen.ts`.
 *
 * **Vor dem CTA, nicht danach.** Der `CtaBanner` ist der Abschluss der Seite;
 * was hinter ihm steht, liest niemand mehr. Umgekehrt soll der Block den Weg
 * zum Termin nicht ersetzen — deshalb steht er davor und ist sichtbar
 * zurückhaltender gesetzt als alles darüber.
 *
 * **Kein `rounded`, kein Kachelraster mit Icons.** Trennlinien über `gap-px`
 * auf `bg-border`, wie im Glossar und auf dem Hub. Die Überschrift ist eine
 * Aussage, kein Kategorielabel („Weiterlesen“) — sonst entstünde genau das
 * Label-Überschrift-Absatz-Muster, das auf dieser Website nicht gebaut wird.
 *
 * Reine Darstellung: Die Daten kommen aus der Server Component in
 * `src/app/<pfad>/page.tsx`. Der Loader liest Dateien und kann hier nicht
 * aufgerufen werden.
 */
export function WeiterlesenBlock({
  artikel,
  /** Eine Aussage, kein Label. Pro Seite verschieden, damit niemand denselben Satz zweimal liest. */
  heading,
  /** Höchstens ein Satz. Optional — die Überschrift trägt für sich. */
  text,
}: {
  artikel: ArtikelTeaser[];
  heading: string;
  text?: string;
}) {
  /* Kein Artikel, kein Kasten. Eine Überschrift ohne Inhalt darunter sieht aus
     wie ein Ladefehler. */
  if (artikel.length === 0) return null;

  return (
    <section
      className={`${SITE_CONTAINER} pb-16 sm:pb-20`}
      aria-labelledby="weiterlesen"
    >
      <div className="border-t border-border pt-12 sm:pt-14">
        <div className="flex flex-col gap-3 dt:flex-row dt:items-end dt:justify-between">
          <div>
            <h2
              id="weiterlesen"
              className="kinetic-display text-balance text-[24px] leading-[1.2] text-foreground sm:text-[28px]"
            >
              {heading}
            </h2>
            {text ? (
              <p className="mt-3 max-w-[560px] text-pretty text-fliess leading-[1.6] text-muted-foreground">
                {text}
              </p>
            ) : null}
          </div>

          <Link
            href="/gratis-wissen"
            className="inline-flex shrink-0 items-center gap-2 text-fliess font-bold text-primary hover:underline"
          >
            Alle Artikel
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Bei ungerader Anzahl nimmt der letzte Eintrag beide Spalten — sonst
            bleibt rechts daneben eine Zelle in der Rahmenfarbe stehen, und die
            liest sich wie ein Darstellungsfehler. Dieselbe Regel wie auf dem
            Hub. */}
        <ul className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2 sm:[&>li:last-child:nth-child(odd)]:col-span-2">
          {artikel.map((eintrag) => (
            <li key={eintrag.slug} className="bg-background">
              <Link
                href={`/gratis-wissen/${eintrag.slug}`}
                className="group flex h-full flex-col p-6 transition-colors hover:bg-foreground/[0.03] sm:p-7"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-primary px-2.5 py-1 text-mini font-bold uppercase tracking-wide text-primary-foreground">
                    {eintrag.kategorie}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-mini text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {eintrag.lesezeit} Min.
                  </span>
                </div>

                <h3 className="kinetic-display mt-4 text-balance text-[19px] leading-[1.18] text-foreground sm:text-[21px]">
                  {eintrag.titel}
                </h3>

                <p className="mt-3 flex-1 text-pretty text-[15px] leading-[1.6] text-muted-foreground">
                  {eintrag.teaser}
                </p>

                <span className="mt-5 inline-flex items-center gap-2 text-mini font-bold text-primary">
                  Lesen
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
