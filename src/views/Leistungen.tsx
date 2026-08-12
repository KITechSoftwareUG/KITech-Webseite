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
  getServiceSchema,
} from "@/components/seo/StructuredData";
import { leistungenEntry } from "@/config/navigation";
import { services, techStack } from "@/data/services";
import { BASE_URL } from "@/lib/metadata";

/**
 * `/leistungen` — was gebaut wird, in der Reihenfolge, in der es gebaut wird.
 *
 * Stand bis zum 05.08.2026 auf der Baustellenseite, obwohl die Alt-Seite den
 * Inhalt längst hatte. Neu aufgebaut, nicht kopiert: die Alt-Seite arbeitete mit
 * einem Raster aus sechs abgerundeten Karten, jede mit einem Icon in einem
 * abgerundeten Quadrat — genau die Baukasten-Optik, die im Relaunch raus ist.
 *
 * Hier stattdessen: eine durchlaufende Liste mit Nummern und Trennlinien. Sie
 * hat außerdem eine Aussage, die das Raster nicht hatte — dass die sechs Punkte
 * eine Reihenfolge haben und Punkt 5 (Daten) das Fundament für die davor ist.
 *
 * Inhalte in `src/data/services.ts`.
 */
export default function Leistungen() {
  return (
    <PageShell>
      <StructuredData
        data={[
          getWebPageSchema(
            "Leistungen",
            "Vom Prozess-Audit über individuelle KI-Agenten bis zum laufenden Betrieb.",
            `${BASE_URL}/leistungen`
          ),
          getBreadcrumbSchema([
            { name: "Startseite", url: `${BASE_URL}/` },
            { name: "Leistungen", url: `${BASE_URL}/leistungen` },
          ]),
          getServiceSchema(
            "KI-Automatisierung und individuelle Softwarelösungen",
            "Prozess-Audit, individuelle KI-Agenten, Datenplattform und laufender Betrieb für den deutschen Mittelstand."
          ),
        ]}
      />

      <PageHeading
        title="Sechs Schritte. Der fünfte trägt die anderen fünf."
        lead="Ohne saubere Daten ist jeder Agent darüber ein Demo-Effekt."
      />

      {/* Leistungen als durchlaufende Liste: Nummer links, Inhalt rechts.
          Trennlinien statt Kästen, damit die Reihenfolge lesbar bleibt — sechs
          gleich große Karten nebeneinander sagen "beliebig kombinierbar", und
          genau das stimmt hier nicht. */}
      <section className={`${SITE_CONTAINER} py-16 sm:py-20`} aria-labelledby="leistungen">
        <h2 id="leistungen" className="sr-only">
          Leistungen im Einzelnen
        </h2>

        <div className="divide-y divide-border/60 border-y border-border/60">
          {services.map((service) => (
            <article
              key={service.step}
              className="grid gap-6 py-10 sm:py-12 lg:grid-cols-[80px_minmax(0,1fr)_minmax(0,300px)] lg:gap-10"
            >
              <span className="kinetic-data text-[28px] font-light leading-none text-accent">
                {service.step}
              </span>

              <div className="min-w-0">
                <h3 className="kinetic-display text-balance text-h4 leading-[1.15] text-foreground sm:text-[27px]">
                  {service.title}
                </h3>
                <p className="mt-4 max-w-[560px] text-pretty text-[15px] leading-[1.65] text-foreground/82">
                  {service.description}
                </p>
              </div>

              <ul className="space-y-2.5">
                {service.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex gap-3 text-fliess leading-[1.5] text-muted-foreground"
                  >
                    <span className="mt-[7px] h-1 w-1 shrink-0 bg-accent" aria-hidden="true" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Weiche in die beiden Zielgruppen-Seiten. Ziele kommen aus der
          Navigations-Konfiguration, damit hier keine zweite Liste entsteht. */}
      <section className={`${SITE_CONTAINER} pb-16`} aria-labelledby="zielgruppen">
        <h2
          id="zielgruppen"
          className="kinetic-display text-balance text-h3 leading-tight text-foreground sm:text-[36px]"
        >
          Zwei Ausgangslagen, zwei Wege.
        </h2>

        <div className="mt-9 grid gap-6 md:grid-cols-2">
          {leistungenEntry.children?.map((child) => (
            <NavCard
              key={child.href}
              href={child.href}
              title={child.label}
              description={child.description}
            />
          ))}
        </div>
      </section>

      {/* Technologie: eine Zeile Belege, kein Kachelraster. Der Stack verkauft
          nichts — er beantwortet nur die Frage, worauf das Ganze läuft. */}
      <section className={`${SITE_CONTAINER} pb-20 sm:pb-24`} aria-labelledby="stack">
        <h2 id="stack" className="text-mini uppercase tracking-wide text-muted-foreground">
          Worauf es läuft
        </h2>
        <ul className="mt-5 flex flex-wrap gap-3">
          {techStack.map((tech) => (
            <li
              key={tech.name}
              className="border border-border px-3 py-2 text-[12px] text-foreground/80"
            >
              {tech.name}
              <span className="ml-2 text-muted-foreground">{tech.category}</span>
            </li>
          ))}
        </ul>
      </section>

      <CtaBanner
        heading="Welcher Prozess bei euch zuerst?"
        text="In der KI-Bewertung nehmen wir einen konkreten Ablauf auseinander und rechnen ihn durch."
        position="leistungen-abschluss"
      />
    </PageShell>
  );
}
