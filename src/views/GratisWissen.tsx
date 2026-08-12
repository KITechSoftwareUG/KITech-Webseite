"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { StructuredData, getWebPageSchema, getBreadcrumbSchema } from "@/components/seo/StructuredData";
import { wissenArtikelSortiert } from "@/data/wissen";
import { BASE_URL } from "@/lib/metadata";

/**
 * `/gratis-wissen` — der Content-Bereich.
 *
 * Auf Ansage angelegt (12.08.2026): ein Ort für Artikel, Tipps und Ratgeber,
 * Name vorgegeben. Er steht in der Kopfzeile an der Stelle, an der vorher
 * "Warum?" stand.
 *
 * Der Kopf ist bewusst so laut wie der Hero der Startseite: Der Bereich soll
 * über die Suche gefunden werden, und wer hier landet, soll in einer Zeile
 * sehen, worauf er sich einlässt — kostenlos, ohne Anmeldung, ohne Gegenleistung.
 * Genau das ist der Unterschied zu den üblichen Ratgebern, hinter denen ein
 * Formular klebt.
 *
 * Inhalte in `src/data/wissen.ts`.
 */
export default function GratisWissen() {
  return (
    <PageShell backdrop="none">
      <StructuredData
        data={[
          getWebPageSchema(
            "Gratis-Wissen",
            "Artikel, Tipps und Ratgeber rund um KI im Mittelstand — kostenlos und ohne Anmeldung.",
            `${BASE_URL}/gratis-wissen`
          ),
          getBreadcrumbSchema([
            { name: "Startseite", url: `${BASE_URL}/` },
            { name: "Gratis-Wissen", url: `${BASE_URL}/gratis-wissen` },
          ]),
        ]}
      />

      <section className="bg-surface-strong">
        <div className={`${SITE_CONTAINER} py-16 text-center sm:py-20`}>
          <h1 className="kinetic-morph-in mx-auto max-w-[760px] text-balance text-[38px] font-extrabold uppercase leading-[1.08] tracking-tight text-foreground sm:text-[50px] sm:leading-[57.5px]">
            Gratis-Wissen
          </h1>
          <p className="mx-auto mt-6 max-w-[620px] text-pretty text-[18px] font-normal leading-[27px] text-foreground dt:text-subline">
            Tipps, Ratgeber und die Fehler, die fast jeder mit KI macht. Ohne Anmeldung, ohne
            E-Mail-Adresse, ohne Gegenleistung.
          </p>
        </div>
      </section>

      <section className={`${SITE_CONTAINER} py-14 sm:py-16`} aria-labelledby="artikel">
        <h2 id="artikel" className="sr-only">
          Alle Artikel
        </h2>

        {/* Trennlinien-Raster (gap-px auf Border-Grund) statt einzelner Karten —
            dieselbe Sprache wie im Glossar.

            Bei ungerader Artikelzahl nimmt der letzte Eintrag beide Spalten:
            sonst bleibt rechts daneben eine Zelle in der Rahmenfarbe stehen,
            und die liest sich wie ein Darstellungsfehler. */}
        <ul className="grid gap-px border border-border bg-border sm:grid-cols-2 sm:[&>li:last-child:nth-child(odd)]:col-span-2">
          {wissenArtikelSortiert.map((artikel) => (
            <li key={artikel.slug} className="bg-background">
              <Link
                href={`/gratis-wissen/${artikel.slug}`}
                className="group flex h-full flex-col p-7 transition-colors hover:bg-foreground/[0.03] sm:p-8"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-primary px-3 py-1 text-mini font-bold uppercase tracking-wide text-primary-foreground">
                    {artikel.kategorie}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-mini text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {artikel.lesezeit} Min.
                  </span>
                </div>

                <h3 className="kinetic-display mt-5 text-balance text-[22px] leading-[1.15] text-foreground sm:text-[25px]">
                  {artikel.titel}
                </h3>

                <p className="mt-4 text-pretty text-fliess leading-[1.6] text-muted-foreground">
                  {artikel.teaser}
                </p>

                <span className="mt-6 inline-flex items-center gap-2 text-fliess font-bold text-primary">
                  Lesen
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <CtaBanner
        heading="Steht dein Fall nicht dabei?"
        text="Im 1:1-KI-Check gehen wir genau deinen Ablauf durch, statt allgemein über KI zu reden."
        position="gratis-wissen"
      />
    </PageShell>
  );
}
