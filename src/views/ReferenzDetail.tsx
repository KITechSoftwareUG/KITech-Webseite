"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, Quote } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SignalField } from "@/components/canvas/SignalField";
import {
  StructuredData,
  getWebPageSchema,
  getBreadcrumbSchema,
} from "@/components/seo/StructuredData";
import { ReferencePortrait } from "@/components/sections/ReferencePortrait";
import { ReferenceCta } from "@/components/sections/ReferenceCta";
import type { ClientResult } from "@/data/client-results";
import { BASE_URL } from "@/lib/metadata";

const legalLinks = [
  { name: "Impressum", href: "/impressum" },
  { name: "Datenschutz", href: "/datenschutz" },
  { name: "AGB", href: "/agb" },
];

interface ReferenzDetailProps {
  result: ClientResult;
  /** Nächster Fall für die Weiterleitung am Seitenfuß. null, wenn es nur einen gibt. */
  nextResult: ClientResult | null;
}

/**
 * Offene Punkte aus der Datendatei. Auf der Karte passt nur der erste Marker, hier
 * stehen alle: dieselbe Lime-Sprache wie in `ClientResults.tsx`, aber vollständig.
 *
 * Solange hier etwas steht, ist der Fall laut Datendatei nicht freigegeben — die
 * Seite läuft dann auch auf `noindex` (siehe app/referenzen/[slug]/page.tsx).
 */
function OpenPointsNotice({ points }: { points: string[] }) {
  if (points.length === 0) return null;

  return (
    <aside
      aria-label="Offene Punkte zu diesem Fall"
      className="max-w-[760px] border border-accent/40 bg-accent/5 p-6 sm:p-7"
    >
      <span className="block w-fit bg-accent px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-background">
        In Arbeit
      </span>
      <p className="mt-4 text-[14px] leading-[1.6] text-foreground/85">
        An diesem Fall wird noch gearbeitet. Was oben in Zahlen steht, ist belegt; offen
        ist:
      </p>
      <ul className="mt-3 space-y-2">
        {points.map((point) => (
          <li
            key={point}
            className="flex items-start gap-2.5 text-[14px] leading-[1.6] text-muted-foreground"
          >
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden="true" />
            {point}
          </li>
        ))}
      </ul>
    </aside>
  );
}

/**
 * Detailseite eines Kundenfalls unter /referenzen/<slug>.
 *
 * Das Feld `detail` in der Datendatei ist optional, und das ist hier der wichtigste
 * Fall: Solange die Langfassung fehlt, zeigt die Seite den Kopf mit den belegten
 * Kartendaten plus einen ehrlichen Hinweis — keine Blindtexte, keine
 * Platzhalter-Kennzahlen, keine erfundenen Zitate. Dasselbe gilt innerhalb der
 * Langfassung: leere `phases`, `stack` oder `quote` lassen den jeweiligen Block
 * ganz weg, statt eine leere Überschrift stehen zu lassen.
 *
 * Alle Texte stammen aus `src/data/client-results.ts`.
 */
export default function ReferenzDetail({ result, nextResult }: ReferenzDetailProps) {
  const detail = result.detail;
  const openPoints = result.openPoints ?? [];
  const hasFacts = Boolean(result.duration || (result.before && result.after) || result.extra);
  const caseUrl = `${BASE_URL}/referenzen/${result.slug}`;

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <StructuredData
        data={[
          getWebPageSchema(
            `${result.company} – ${result.headline.value} ${result.headline.label}`,
            detail?.intro ?? result.summary,
            caseUrl
          ),
          getBreadcrumbSchema([
            { name: "Startseite", url: `${BASE_URL}/` },
            { name: "Referenzen", url: `${BASE_URL}/referenzen` },
            { name: result.company, url: caseUrl },
          ]),
        ]}
      />

      {/* Gleicher Signal-Hintergrund wie auf Startseite, Terminseite und Übersicht —
          die Detailseite soll sich nicht wie eine fremde Seite anfühlen. */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[680px]" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(112deg, hsl(245 55% 12%) 0%, hsl(243 45% 9%) 46%, hsl(0 0% 5%) 100%)",
          }}
        />
        <SignalField density={0.45} intensity={0.45} baseColor="--primary" accentColor="--accent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      <SiteHeader className="relative mx-auto w-full max-w-[1180px] px-5 pt-7 sm:px-8" />

      <main className="relative flex-1">
        {/* === Kopf: Person, Firma, Kernzahl === */}
        <section className="mx-auto max-w-[1180px] px-5 pb-14 pt-10 sm:px-8 sm:pt-14">
          <Link
            href="/referenzen"
            className="inline-flex items-center gap-2 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Alle Referenzen
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start lg:gap-16">
            <div className="min-w-0">
              <div className="flex items-start gap-5">
                {/* Höhe passend zur Breite setzen, sonst steht das Portrait (object-bottom)
                    unten in einem viel zu hohen Kasten und reißt eine Lücke neben dem Namen. */}
                <ReferencePortrait
                  person={result.person}
                  className="w-[104px] shrink-0 sm:w-[128px]"
                  imageClassName="h-[128px] sm:h-[156px]"
                />
                <div className="min-w-0 pt-1">
                  <p className="text-base font-semibold leading-tight text-foreground sm:text-lg">
                    {result.person.name}
                  </p>
                  {result.person.role && (
                    <p className="mt-1 text-[13px] leading-tight text-muted-foreground">
                      {result.person.role}
                    </p>
                  )}
                  <p className="mt-2 text-[13px] leading-tight text-muted-foreground">
                    {result.company}
                  </p>
                  {result.logo && (
                    <span className="mt-3 inline-flex h-12 items-center bg-white px-2.5">
                      <img
                        src={result.logo}
                        alt={`${result.company} Firmenlogo`}
                        className="max-h-8 w-auto max-w-[132px] object-contain"
                      />
                    </span>
                  )}
                </div>
              </div>

              <h1 className="kinetic-display kinetic-morph-in mt-10 max-w-[640px] text-balance text-[34px] leading-[1.08] text-foreground sm:text-[46px]">
                <span className="kinetic-data font-light">{result.headline.value}</span>{" "}
                {result.headline.label}
              </h1>

              <p className="mt-6 max-w-[560px] text-pretty text-[15px] leading-[1.65] text-foreground/82 sm:text-base">
                {result.summary}
              </p>
            </div>

            {/* Belegzeilen rechts: Dauer und Prozessvergleich, exakt wie auf der Karte. */}
            {hasFacts && (
              <dl className="border border-border bg-[linear-gradient(168deg,hsl(245_28%_13%)_0%,hsl(243_20%_9%)_100%)] p-6 text-[14px] sm:p-8">
                {result.duration && (
                  <div className="flex items-center gap-2.5">
                    <dt className="sr-only">Projektdauer</dt>
                    <Clock className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    <dd className="font-semibold text-foreground">{result.duration}</dd>
                  </div>
                )}
                {result.before && result.after && (
                  <div
                    className={`flex flex-wrap items-center gap-2.5 ${result.duration ? "mt-4 border-t border-border/60 pt-4" : ""}`}
                  >
                    <dt className="sr-only">Vorher und nachher</dt>
                    <dd className="text-muted-foreground line-through decoration-muted-foreground/50">
                      {result.before}
                    </dd>
                    <ArrowRight className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    <dd className="font-semibold text-foreground">{result.after}</dd>
                  </div>
                )}
                {result.extra && (
                  <div
                    className={`flex items-center gap-2.5 ${result.duration || result.before ? "mt-4 border-t border-border/60 pt-4" : ""}`}
                  >
                    <dt className="sr-only">Weitere Kennzahl</dt>
                    <dd className="font-semibold text-accent">{result.extra}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </section>

        {detail ? (
          <div className="border-t border-border/60 bg-background">
            <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 sm:py-20">
              {openPoints.length > 0 && (
                <div className="mb-12">
                  <OpenPointsNotice points={openPoints} />
                </div>
              )}

              <p className="max-w-[760px] text-pretty text-[19px] leading-[1.5] text-foreground sm:text-[24px]">
                {detail.intro}
              </p>

              {/* === Ausgangslage, Aufgabe, Lösung === */}
              {detail.sections.length > 0 && (
                <div className="mt-14 space-y-12">
                  {detail.sections.map((section) => (
                    <section
                      key={section.heading}
                      className="border-t border-border/60 pt-8 lg:grid lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-12"
                    >
                      <h2 className="kinetic-display text-balance text-[22px] leading-tight text-foreground sm:text-[26px]">
                        {section.heading}
                      </h2>
                      <div className="mt-5 max-w-[720px] lg:mt-0">
                        <div className="space-y-4 text-pretty text-[15px] leading-[1.7] text-muted-foreground">
                          {section.paragraphs.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                        </div>
                        {section.bullets && section.bullets.length > 0 && (
                          <ul className="mt-6 space-y-2.5">
                            {section.bullets.map((bullet) => (
                              <li
                                key={bullet}
                                className="flex items-start gap-2.5 text-[15px] leading-[1.6] text-foreground/90"
                              >
                                <ArrowRight
                                  className="mt-1 h-4 w-4 shrink-0 text-accent"
                                  aria-hidden="true"
                                />
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </section>
                  ))}
                </div>
              )}

              {/* === Projektverlauf === */}
              {detail.phases.length > 0 && (
                <section className="mt-16 border-t border-border/60 pt-8 lg:grid lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-12">
                  <h2 className="kinetic-display text-[22px] leading-tight text-foreground sm:text-[26px]">
                    Projektverlauf
                  </h2>
                  <ol className="relative mt-6 max-w-[720px] border-l border-border lg:mt-0">
                    {detail.phases.map((phase) => (
                      <li
                        key={`${phase.period}-${phase.title}`}
                        className="relative pb-9 pl-6 last:pb-0"
                      >
                        {/* Der Punkt sitzt auf der Linie: 8px breit, deshalb 3,5px nach
                            links geschoben (die Linie ist 1px). `relative` steht am <li>,
                            sonst würden alle Punkte am oberen Rand der Liste kleben. */}
                        <span
                          className="absolute -left-[3.5px] top-1.5 h-2 w-2 bg-accent"
                          aria-hidden="true"
                        />
                        <p className="kinetic-data text-[12px] uppercase tracking-wide text-accent">
                          {phase.period}
                        </p>
                        <h3 className="mt-2 text-[16px] font-semibold leading-tight text-foreground">
                          {phase.title}
                        </h3>
                        <p className="mt-2 text-pretty text-[15px] leading-[1.65] text-muted-foreground">
                          {phase.description}
                        </p>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* === Ergebnis-Kennzahlen === */}
              {detail.metrics.length > 0 && (
                <section className="mt-16 border-t border-border/60 pt-8">
                  <h2 className="kinetic-display text-[22px] leading-tight text-foreground sm:text-[26px]">
                    Was dabei herausgekommen ist
                  </h2>
                  {/* gap-px auf border-Grund: erzeugt Haarlinien zwischen den Kacheln,
                      ohne doppelte Rahmen an den Stoßkanten.

                      Die Spaltenzahl richtet sich nach der Anzahl der Kennzahlen —
                      ein festes 3er-Raster ließe bei zwei Werten eine leere Zelle
                      stehen, die wie ein Darstellungsfehler aussieht. */}
                  <div
                    className={`mt-6 grid gap-px border border-border bg-border ${
                      detail.metrics.length === 1
                        ? ""
                        : detail.metrics.length === 2
                          ? "sm:grid-cols-2"
                          : "sm:grid-cols-2 lg:grid-cols-3"
                    }`}
                  >
                    {detail.metrics.map((metric) => (
                      <div key={metric.label} className="bg-background p-6 sm:p-7">
                        <p className="kinetic-data text-[36px] font-light leading-none text-foreground">
                          {metric.value}
                        </p>
                        <p className="mt-3 text-[14px] font-semibold leading-[1.3] text-foreground">
                          {metric.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* === Eingesetzte Technik === */}
              {detail.stack.length > 0 && (
                <section className="mt-16 border-t border-border/60 pt-8 lg:grid lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-12">
                  <h2 className="kinetic-display text-[22px] leading-tight text-foreground sm:text-[26px]">
                    Eingesetzte Technik
                  </h2>
                  <ul className="mt-6 flex max-w-[720px] flex-wrap gap-2.5 lg:mt-0">
                    {detail.stack.map((item) => (
                      <li
                        key={item}
                        className="kinetic-data border border-border px-3 py-1.5 text-[12px] text-foreground/80"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* === Kundenzitat === nur, wenn es wörtlich vorliegt und freigegeben ist. */}
              {detail.quote && (
                <figure className="mt-16 border border-border bg-[linear-gradient(168deg,hsl(245_28%_13%)_0%,hsl(243_20%_9%)_100%)] p-8 sm:p-12">
                  <Quote className="h-6 w-6 text-accent" aria-hidden="true" />
                  <blockquote className="mt-5 max-w-[760px] text-pretty text-[19px] leading-[1.5] text-foreground sm:text-[22px]">
                    „{detail.quote.text}“
                  </blockquote>
                  <figcaption className="mt-6 border-t border-border/60 pt-5 text-[13px] text-muted-foreground">
                    {detail.quote.author}
                  </figcaption>
                </figure>
              )}
            </div>
          </div>
        ) : (
          /* Kein `detail` in der Datendatei: ehrliche Leerstelle statt Attrappe. */
          <div className="border-t border-border/60 bg-background">
            <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 sm:py-20">
              <div className="max-w-[720px] border border-border p-8 sm:p-10">
                <span className="mb-5 block w-fit border border-border px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  In Arbeit
                </span>
                <h2 className="kinetic-display text-balance text-[24px] leading-[1.15] text-foreground sm:text-[30px]">
                  Dieser Fall wird gerade ausführlich aufbereitet.
                </h2>
                <p className="mt-5 text-pretty text-[15px] leading-[1.65] text-muted-foreground">
                  Was oben steht, ist belegt: die Zahl und das gebaute System.
                  Die Langfassung — Ausgangslage, Projektverlauf, Kennzahlen und das Zitat —
                  veröffentlichen wir erst, wenn sie mit {result.person.name} abgestimmt und
                  schriftlich freigegeben ist.
                </p>
                <Link
                  href="/referenzen"
                  className="mt-7 inline-flex items-center gap-2 text-[13px] font-semibold text-foreground transition-colors hover:text-primary"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Zurück zu allen Referenzen
                </Link>
              </div>

              {openPoints.length > 0 && (
                <div className="mt-8">
                  <OpenPointsNotice points={openPoints} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* === Weiterleitung: Übersicht und nächster Fall === */}
        <nav
          aria-label="Weitere Referenzen"
          className="mx-auto grid max-w-[1180px] gap-px bg-border sm:grid-cols-2"
        >
          <Link
            href="/referenzen"
            className="group flex items-center gap-3 bg-background p-6 transition-colors hover:bg-card sm:p-8"
          >
            <ArrowLeft
              className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
              aria-hidden="true"
            />
            <span>
              <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                Übersicht
              </span>
              <span className="mt-1 block text-[15px] font-semibold text-foreground">
                Alle Referenzen
              </span>
            </span>
          </Link>

          {nextResult && (
            <Link
              href={`/referenzen/${nextResult.slug}`}
              className="group flex items-center justify-end gap-3 bg-background p-6 text-right transition-colors hover:bg-card sm:p-8"
            >
              <span className="min-w-0">
                <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                  Nächster Fall
                </span>
                <span className="mt-1 block truncate text-[15px] font-semibold text-foreground">
                  {nextResult.company}
                </span>
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                aria-hidden="true"
              />
            </Link>
          )}
        </nav>

        <ReferenceCta position={`referenz-detail-${result.slug}`} />
      </main>

      <footer className="border-t border-border py-6">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-3 px-5 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} KITech Software UG (haftungsbeschränkt).</p>
          <nav aria-label="Rechtliche Links" className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <Link key={link.name} href={link.href} className="transition-colors hover:text-primary">
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
