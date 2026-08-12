"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER, TEXT_CONTAINER } from "@/components/layout/site-container";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { StructuredData, getBreadcrumbSchema } from "@/components/seo/StructuredData";
import type { WissenArtikel as Artikel } from "@/data/wissen";
import { BASE_URL } from "@/lib/metadata";

/**
 * Ein Artikel unter `/gratis-wissen/<slug>`.
 *
 * Fließtext in `TEXT_CONTAINER` (760 px): Diese Seiten werden gelesen, nicht
 * überflogen — bei voller Seitenbreite verfehlt das Auge beim Zeilenwechsel die
 * nächste Zeile.
 *
 * Am Ende steht genau ein CTA. Der Artikel soll für sich stehen: Wer über die
 * Suche kommt, sucht eine Antwort, keinen Verkaufstext. Ein Werbeblock im
 * ersten Drittel würde beides kaputtmachen — die Antwort und das Vertrauen.
 */
export default function WissenArtikel({
  artikel,
  /** Nächster Artikel für die Weiterleitung am Fuß. `null`, wenn es nur einen gibt. */
  naechster,
}: {
  artikel: Artikel;
  naechster: Artikel | null;
}) {
  const url = `${BASE_URL}/gratis-wissen/${artikel.slug}`;

  return (
    <PageShell backdrop="none">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: artikel.titel,
            description: artikel.teaser,
            datePublished: artikel.datum,
            dateModified: artikel.datum,
            inLanguage: "de-DE",
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            author: {
              "@type": "Organization",
              name: "KITech Software UG (haftungsbeschränkt)",
              url: BASE_URL,
            },
            publisher: {
              "@type": "Organization",
              name: "KITech Software UG (haftungsbeschränkt)",
              url: BASE_URL,
            },
          },
          getBreadcrumbSchema([
            { name: "Startseite", url: `${BASE_URL}/` },
            { name: "Gratis-Wissen", url: `${BASE_URL}/gratis-wissen` },
            { name: artikel.titel, url },
          ]),
        ]}
      />

      <article>
        <header className="bg-surface-strong">
          <div className={`${TEXT_CONTAINER} py-14 sm:py-20`}>
            <Link
              href="/gratis-wissen"
              className="inline-flex items-center gap-2 text-mini font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Gratis-Wissen
            </Link>

            <div className="mt-7 flex items-center gap-3">
              <span className="bg-primary px-3 py-1 text-mini font-bold uppercase tracking-wide text-primary-foreground">
                {artikel.kategorie}
              </span>
              <span className="inline-flex items-center gap-1.5 text-mini text-muted-foreground">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {artikel.lesezeit} Minuten
              </span>
            </div>

            <h1 className="kinetic-display kinetic-morph-in mt-5 text-balance text-[32px] leading-[1.12] text-foreground sm:text-[44px]">
              {artikel.titel}
            </h1>

            <p className="mt-6 text-pretty text-lead leading-[1.55] text-foreground/85">
              {artikel.intro}
            </p>
          </div>
        </header>

        <div className={`${TEXT_CONTAINER} py-14 sm:py-16`}>
          {artikel.abschnitte.map((abschnitt) => (
            <section key={abschnitt.heading} className="mb-12 last:mb-0">
              <h2 className="kinetic-display text-balance text-[24px] leading-[1.2] text-foreground sm:text-[28px]">
                {abschnitt.heading}
              </h2>

              <div className="mt-5 space-y-4 text-pretty text-[16px] leading-[1.7] text-muted-foreground">
                {abschnitt.paragraphs.map((absatz) => (
                  <p key={absatz}>{absatz}</p>
                ))}
              </div>

              {abschnitt.bullets && abschnitt.bullets.length > 0 && (
                <ul className="mt-6 space-y-3">
                  {abschnitt.bullets.map((punkt) => (
                    <li
                      key={punkt}
                      className="flex items-start gap-3 text-[16px] leading-[1.6] text-foreground/90"
                    >
                      <span
                        className="mt-[10px] h-1.5 w-1.5 shrink-0 bg-primary"
                        aria-hidden="true"
                      />
                      {punkt}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {/* Das Fazit trägt den Satz, der hängen bleiben soll — abgesetzt, damit
              man ihn auch beim Überfliegen mitnimmt. */}
          <p className="mt-14 border-l-2 border-primary bg-surface p-6 text-pretty text-[18px] font-semibold leading-[1.5] text-foreground sm:p-8 sm:text-[20px]">
            {artikel.fazit}
          </p>
        </div>
      </article>

      {naechster && (
        <nav aria-label="Weitere Artikel" className={`${SITE_CONTAINER} pb-4`}>
          <Link
            href={`/gratis-wissen/${naechster.slug}`}
            className="group flex items-center justify-between gap-4 border border-border bg-background p-6 transition-colors hover:border-primary sm:p-8"
          >
            <span className="min-w-0">
              <span className="block text-mini uppercase tracking-wide text-muted-foreground">
                Nächster Artikel
              </span>
              <span className="mt-1 block text-[17px] font-bold leading-tight text-foreground">
                {naechster.titel}
              </span>
            </span>
            <ArrowRight
              className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </nav>
      )}

      <CtaBanner
        heading="Das war die Theorie."
        text="Im 1:1-KI-Check gehen wir deinen konkreten Ablauf durch — und sagen dir, was sich zuerst lohnt."
        position={`wissen-${artikel.slug}`}
      />
    </PageShell>
  );
}
