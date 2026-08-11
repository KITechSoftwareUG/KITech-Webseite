"use client";

import Link from "next/link";
import { Linkedin } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { PageHeading } from "@/components/sections/PageHeading";
import { CtaBanner } from "@/components/sections/CtaBanner";
import {
  StructuredData,
  getWebPageSchema,
  getBreadcrumbSchema,
  getFounderPersonSchema,
} from "@/components/seo/StructuredData";
import { founderInfo } from "@/components/sections/FounderPortrait";
import { principles, commitments } from "@/data/principles";
import { company } from "@/config/company";
import { BASE_URL } from "@/lib/metadata";

/**
 * `/haltung` — wonach entschieden wird, wenn es im Projekt eng wird.
 *
 * Neu aufgebaut statt aus `src/views/legacy/Haltung.tsx` übernommen: dort standen
 * die sechs Werte als abgerundetes Kartenraster mit Icon-Quadraten, dazu ein
 * zentriertes Herz-Symbol über einem Zitat. Beides ist im Relaunch raus.
 *
 * Hier trägt das Gründerzitat den Kopf der Seite — es ist die Haltung, alles
 * darunter ist ihre Anwendung.
 *
 * Inhalte in `src/data/principles.ts`.
 */
export default function Haltung() {
  return (
    <PageShell>
      <StructuredData
        data={[
          getWebPageSchema(
            "Haltung",
            "Wonach wir entscheiden, wenn es im Projekt eng wird.",
            `${BASE_URL}/haltung`
          ),
          getBreadcrumbSchema([
            { name: "Startseite", url: `${BASE_URL}/` },
            { name: "Haltung", url: `${BASE_URL}/haltung` },
          ]),
          getFounderPersonSchema(),
        ]}
      />

      <PageHeading
        title={
          <>
            KI wird überall reingequetscht.{" "}
            <span className="box-decoration-clone bg-primary px-2.5 pb-1 text-primary-foreground">
              Ohne klaren Nutzen
            </span>
            .
          </>
        }
        lead="Wir machen es anders — und sagen ab, wenn wir den Nutzen nicht sehen."
      />

      {/* Gründer: Portrait und Aussage nebeneinander. Kein Erklärabsatz über der
          Person, kein Icon — das Gesicht und der Satz reichen. */}
      <section className={`${SITE_CONTAINER} py-16 sm:py-20`} aria-labelledby="gruender">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:items-center lg:gap-14">
          <img
            src={founderInfo.imageUrl}
            alt={`${founderInfo.name}, ${founderInfo.role} von KITech Software`}
            className="portrait-fade w-full max-w-[300px] border border-border bg-[linear-gradient(168deg,hsl(245_28%_13%)_0%,hsl(243_20%_9%)_100%)] object-contain object-bottom"
          />

          <div className="min-w-0">
            <h2 id="gruender" className="sr-only">
              Der Gründer
            </h2>

            <blockquote className="kinetic-display text-balance text-[24px] leading-[1.25] text-foreground sm:text-[32px]">
              „Ich habe zu oft gesehen, wie sechsstellige Beträge in Projekte gehen, die in
              einer schicken Demo enden und nie in der Bilanz ankommen. Mittelstand kann
              sich das nicht leisten.“
            </blockquote>

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
      </section>

      {/* Werte als durchlaufende Liste mit Trennlinien. Sechs gleich große Karten
          mit Icons wären wieder das Raster, das im Relaunch abgeschafft wurde. */}
      <section className={`${SITE_CONTAINER} pb-16`} aria-labelledby="werte">
        <h2
          id="werte"
          className="kinetic-display text-balance text-[26px] leading-tight text-foreground sm:text-[34px]"
        >
          Wonach wir entscheiden.
        </h2>

        <dl className="mt-10 divide-y divide-border/60 border-y border-border/60">
          {principles.map((principle) => (
            <div key={principle.title} className="grid gap-3 py-7 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-10">
              <dt className="text-[17px] font-semibold leading-snug text-foreground sm:text-[19px]">
                {principle.title}
              </dt>
              <dd className="max-w-[620px] text-pretty text-[15px] leading-[1.6] text-muted-foreground">
                {principle.description}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Zusagen: knappe Liste, zwei Spalten. Keine Häkchen-Symbole — die Aussage
          steht schon da, ein Haken davor macht sie nicht wahrer. */}
      <section className={`${SITE_CONTAINER} pb-20 sm:pb-24`} aria-labelledby="zusagen">
        <h2
          id="zusagen"
          className="kinetic-display text-balance text-[26px] leading-tight text-foreground sm:text-[34px]"
        >
          Was ihr in jedem Projekt bekommt.
        </h2>

        <ul className="mt-9 grid gap-px border border-border bg-border sm:grid-cols-2">
          {commitments.map((item) => (
            <li key={item} className="bg-background p-6 text-[15px] leading-[1.5] text-foreground/88">
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-8 text-[14px] leading-[1.6] text-muted-foreground">
          Wie das in echten Projekten aussieht, steht bei den{" "}
          <Link href="/referenzen" className="text-foreground underline underline-offset-4 hover:text-primary">
            Referenzen
          </Link>
          .
        </p>
      </section>

      <CtaBanner
        heading="Passt das zu dem, was ihr sucht?"
        text="Dreißig Minuten reichen, um herauszufinden, ob wir zusammenpassen — oder eben nicht."
        position="haltung-abschluss"
      />
    </PageShell>
  );
}
