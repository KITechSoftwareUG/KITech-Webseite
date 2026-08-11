"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { ClientResults } from "@/components/sections/ClientResults";
import { trackEvent } from "@/lib/plausible";
import type { SalesLetterBlock, SalesLetterContent } from "@/data/sales-letters";

/**
 * Gemeinsame Vorlage für beide Funnel-Seiten ("Warum du..." / "Warum Unternehmen...").
 * Der Inhalt kommt vollständig aus src/data/sales-letters.ts — hier steht nur Struktur
 * und Gestaltung, damit Textänderungen nie die Komponente anfassen müssen.
 *
 * Leseführung: schmale Textspalte (max. ~68 Zeichen), Bild-Einschübe wechseln
 * blockweise die Seite und brechen den Textfluss auf.
 *
 * Gestaltung folgt dem hellen Designsystem (docs/DESIGN.md): weißer Grund,
 * Dunkelblau als einzige Signalfarbe, Pill-Buttons, abgerundete Flächen.
 */

function ImageSlot({ image }: { image: NonNullable<SalesLetterBlock["image"]> }) {
  if (image.src) {
    // Bilder liegen wie Karten auf der Seite: gerundet, mit feinem Ring statt
    // harter Kante — eine scharfkantige Fotofläche wirkt auf Weiß unfertig.
    return (
      <img
        src={image.src}
        alt={image.alt}
        className="w-full rounded-2xl object-cover shadow-card ring-1 ring-border"
        loading="lazy"
      />
    );
  }

  // Platzhalterfläche: hellgrauer Grund statt des früheren dunklen Verlaufs.
  // Gestrichelte Kante, damit sie sichtbar als "noch nicht befüllt" liest.
  return (
    <div className="relative flex aspect-[3/4] w-full items-center justify-center rounded-2xl border border-dashed border-border bg-surface-strong">
      <span className="px-4 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Bild von Ayham
        <br />
        folgt
      </span>
    </div>
  );
}

function Block({ block }: { block: SalesLetterBlock }) {
  const text = (
    <div className="min-w-0 max-w-[600px]">
      {/* Überzeile als dunkelblaue Pille: der einzige Farbtupfer im Textfluss, und
          das einzige Element, das hier weißen Text tragen darf. */}
      {block.kicker && (
        <span className="mb-4 block w-fit rounded-full bg-primary px-3.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
          {block.kicker}
        </span>
      )}
      <h2 className="kinetic-display text-balance text-[26px] leading-[1.14] text-foreground sm:text-[34px]">
        {block.heading}
      </h2>
      <div className="mt-6 space-y-4">
        {block.paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="text-pretty text-[15px] font-normal leading-[1.7] text-muted-foreground sm:text-base"
          >
            {paragraph}
          </p>
        ))}
      </div>
      {block.bullets && (
        <ul className="mt-7 space-y-3">
          {block.bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex gap-3 text-[15px] font-normal leading-[1.6] text-muted-foreground"
            >
              <span
                className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                aria-hidden="true"
              />
              {bullet}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  if (!block.image) {
    return <section className="py-14 sm:py-20">{text}</section>;
  }

  const imageLeft = block.image.align === "left";

  // Das Spalten-Template muss mit der Bildseite wechseln — sonst landet die schmale
  // Bildspalte immer rechts. Auf Mobile steht der Text immer zuerst (order-Umkehr).
  return (
    <section
      className={`grid items-center gap-10 py-14 sm:py-20 lg:gap-16 ${
        imageLeft
          ? "lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]"
          : "lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]"
      }`}
    >
      {imageLeft ? (
        <>
          <div className="order-2 lg:order-1">
            <ImageSlot image={block.image} />
          </div>
          <div className="order-1 lg:order-2">{text}</div>
        </>
      ) : (
        <>
          {text}
          <ImageSlot image={block.image} />
        </>
      )}
    </section>
  );
}

export function SalesLetter({ content }: { content: SalesLetterContent }) {
  return (
    <PageShell backdropClassName="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-surface-strong to-background sm:h-[520px]">
      {/* Hero */}
      <header>
        <div className={`${SITE_CONTAINER} pb-20 pt-14 sm:pb-28 sm:pt-20`}>
          <span className="mb-5 block w-fit rounded-full bg-primary px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
            {content.hero.badge}
          </span>

          {/* Hero-Überschrift in Versalien — prägendster Zug der Vorlage. Der
              hervorgehobene Teil steht jetzt im dunkelblauen Marker statt im
              dunklen; weißer Text gehört im hellen Layout nur auf Dunkelblau. */}
          <h1 className="kinetic-display kinetic-morph-in max-w-[820px] text-balance text-[34px] uppercase leading-[1.08] text-foreground sm:text-[54px]">
            {content.hero.headline}{" "}
            <span className="box-decoration-clone rounded-lg bg-primary px-2.5 pb-1 text-primary-foreground">
              {content.hero.headlineHighlight}
            </span>
          </h1>

          <p className="mt-8 max-w-[620px] text-pretty text-[15px] font-normal leading-[1.65] text-muted-foreground sm:text-base">
            {content.hero.sub}
          </p>

          <Link
            href="/lass-uns-reden"
            onClick={() =>
              trackEvent("Calendly_Klick", { position: `salesletter-hero-${content.audience}` })
            }
            className="mt-10 inline-flex h-[56px] w-full max-w-[320px] items-center justify-between gap-4 rounded-full bg-primary px-7 text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
          >
            <span className="flex flex-col text-left">
              <span className="text-[13px] font-bold leading-tight">{content.hero.ctaLabel}</span>
              {/* Der Hinweis steht auf Dunkelblau: aufgehellte Weißstufe statt einer
                  Grauabstufung, die auf farbigem Grund schmutzig wirkt. */}
              <span className="mt-1 text-[11px] font-normal leading-tight text-primary-foreground/75">
                {content.hero.ctaHint}
              </span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* Argumentationskette */}
      <div className={SITE_CONTAINER}>
        <div className="divide-y divide-border">
          {content.blocks.map((block, index) => (
            <Block key={index} block={block} />
          ))}
        </div>
      </div>

      {/* Beweis: dieselben Ergebniskarten wie auf der Startseite. */}
      <ClientResults />

      {/* Abschluss-CTA. Die Sektion steht auf `bg-surface`, damit sie sich von
          den weißen Referenzkarten darüber absetzt — der Farbwechsel ersetzt
          die frühere Trennlinie. */}
      <section className="bg-surface py-20 sm:py-24">
        <div className={SITE_CONTAINER}>
          <div className="flex flex-col items-start gap-8 rounded-2xl bg-white p-8 shadow-card ring-1 ring-border sm:p-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-[560px]">
              <h2 className="kinetic-display text-balance text-[26px] leading-[1.12] text-foreground sm:text-[34px]">
                {content.closing.heading}
              </h2>
              <p className="mt-4 text-pretty text-[15px] font-normal leading-[1.65] text-muted-foreground">
                {content.closing.paragraph}
              </p>
            </div>
            <Link
              href="/lass-uns-reden"
              onClick={() =>
                trackEvent("Calendly_Klick", { position: `salesletter-ende-${content.audience}` })
              }
              className="inline-flex h-[56px] w-full max-w-[320px] shrink-0 items-center justify-between gap-4 rounded-full bg-primary px-7 text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
            >
              <span className="flex flex-col text-left">
                <span className="text-[13px] font-bold leading-tight">
                  {content.closing.ctaLabel}
                </span>
                <span className="mt-1 text-[11px] font-normal leading-tight text-primary-foreground/75">
                  {content.closing.ctaHint}
                </span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
