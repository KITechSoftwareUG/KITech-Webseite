"use client";

import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { PageHeading } from "@/components/sections/PageHeading";
import { NavCard } from "@/components/sections/NavCard";
import { CtaBanner } from "@/components/sections/CtaBanner";
import {
  StructuredData,
  getWebPageSchema,
  getBreadcrumbSchema,
} from "@/components/seo/StructuredData";
import { warumEntry } from "@/config/navigation";
import { BASE_URL } from "@/lib/metadata";
import { WeiterlesenBlock } from "@/components/sections/WeiterlesenBlock";
import type { ArtikelTeaser } from "@/lib/wissen/empfehlungen";

/**
 * `/warum` — die Weiche vor den beiden Sales Lettern.
 *
 * Entstanden am 05.08.2026 aus einer Vorgabe an die Navigation: die beiden
 * Funnel-Seiten standen mit ihren vollen Titeln nebeneinander in der Kopfzeile
 * ("Warum du mit KI kein Geld verdienst" / "Warum Unternehmen mit KI kein Geld
 * verdienen") und haben sie allein gefüllt. Sie hängen jetzt unter einem Punkt
 * "Warum?" — und der braucht ein Ziel, sonst ist er auf dem Handy ein Menüpunkt,
 * der beim Antippen nichts tut.
 *
 * Die Seite selbst hält sich kurz: eine Aussage, die Weiche, die gemeinsame
 * Ursache in drei Zeilen. Der Rest steht in den beiden Lettern.
 *
 * Die beiden Ziele kommen aus `warumEntry` in `src/config/navigation.ts` — hier
 * steht keine zweite Liste, die auseinanderlaufen könnte.
 */

/**
 * Die drei Gründe sind bewusst als Aussagen formuliert, nicht als Fragen, und
 * bewusst ohne Icons. Ein Symbol neben "Niemand fasst den Prozess an" macht den
 * Satz nicht klarer, es macht ihn nur dekorativ.
 */
const GRUENDE = [
  "Das Tool ist gekauft, der Prozess dahinter ist derselbe geblieben.",
  "Es gibt niemanden, der es benutzt, wenn es im Alltag mal klemmt.",
  "Niemand hat vorher ausgerechnet, was es überhaupt bringen soll.",
];

export default function Warum({ wissen = [] }: { wissen?: ArtikelTeaser[] }) {
  return (
    <PageShell>
      <StructuredData
        data={[
          getWebPageSchema(
            "Warum KI bei den meisten kein Geld verdient",
            "Zwei Wege zur selben Ursache — einer für Selbstständige, einer für Unternehmen.",
            `${BASE_URL}/warum`
          ),
          getBreadcrumbSchema([
            { name: "Startseite", url: `${BASE_URL}/` },
            { name: "Warum?", url: `${BASE_URL}/warum` },
          ]),
        ]}
      />

      <PageHeading
        /* Ohne blauen Marker auf "das Problem" (Vorgabe 14.08.2026): die
           Auszeichnung ist auf allen Unterseiten raus, wie zuvor schon im Hero
           der Startseite. Die Aussage trägt sich selbst. */
        title="Die Technik war noch nie das Problem." 
        lead="Zwei Wege zur selben Ursache. Nimm den, der auf dich passt."
      />

      <section className={`${SITE_CONTAINER} pt-12 sm:pt-14`}>
        <h2 className="sr-only">Die beiden Wege</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {warumEntry.children?.map((child) => (
            <NavCard
              key={child.href}
              href={child.href}
              title={child.label}
              description={child.description}
            />
          ))}
        </div>
      </section>

      {/* Die gemeinsame Ursache: eine Liste mit Trennlinien statt drei Kacheln.
          Der Blick läuft durch, statt an drei gleich großen Rechtecken hängen zu
          bleiben — dasselbe Muster wie auf /community. */}
      <section className={`${SITE_CONTAINER} py-20 sm:py-24`} aria-labelledby="ursache">
        <h2
          id="ursache"
          className="kinetic-display text-balance text-h3 leading-tight text-foreground sm:text-[36px]"
        >
          Woran es tatsächlich liegt.
        </h2>

        <ul className="mt-10 max-w-[820px]">
          {GRUENDE.map((grund, index) => (
            <li
              key={grund}
              className={`py-6 text-lead leading-[1.45] text-foreground/88 sm:text-[21px] ${
                index > 0 ? "border-t border-border/60" : ""
              }`}
            >
              {grund}
            </li>
          ))}
        </ul>
      </section>

      <WeiterlesenBlock
        artikel={wissen}
        heading="Die lange Fassung."
        text="Woran KI-Vorhaben scheitern, Station für Station — und was ein Setup ausmacht, das trägt."
      />

      <CtaBanner
        heading="Herausfinden, woran es bei euch liegt."
        text="Ein Prozess, einmal durchgerechnet. Danach wisst ihr, ob sich Automatisierung dort lohnt — oder eben nicht."
        position="warum-uebersicht"
      />
    </PageShell>
  );
}
