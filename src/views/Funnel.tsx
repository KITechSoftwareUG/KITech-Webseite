"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Check, ChevronDown, X } from "lucide-react";
import { FunnelLogo, FunnelShell } from "@/components/layout/FunnelShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { KundenLaufband } from "@/components/sections/KundenLaufband";
import { StarRating } from "@/components/sections/StarRating";
import { WorkshopTermin } from "@/components/sections/WorkshopTermin";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StructuredData, getWebPageSchema } from "@/components/seo/StructuredData";
import { testimonials } from "@/data/testimonials";
import { funnelContent as c } from "@/data/funnel";
import { meldeFunnelBesuch } from "@/lib/funnel-besuch";
import { trackEvent } from "@/lib/plausible";
import { BASE_URL } from "@/lib/metadata";

/**
 * Landingpage `/funnel` — kostenloser Live-Workshop, Zielgruppe Geschäftsführer
 * im Mittelstand. Inhalt und Herkunft: `src/data/funnel.ts`.
 *
 * **Die Reihenfolge stammt aus einer Vorlage**, die Ayham vorgegeben hat
 * (`src/assets/funnels.leadersmedia.de_scale_ (1).png`). Übernommen ist die
 * Struktur, nicht das Aussehen:
 *
 *   Hero mit Termin → Kundenstimmen → Problem → CTA → Mechanismus →
 *   Wiedererkennung → Vorher/Nachher → Ergebnisse → Qualifizierung → CTA →
 *   Gründer → FAQ → Abschluss-CTA
 *
 * Drei Eigenheiten der Vorlage sind Absicht und keine Nachlässigkeit:
 *
 *   1. **Derselbe CTA vier Mal.** Die Seite ist lang; wer an irgendeiner Stelle
 *      überzeugt ist, soll dort klicken können und nicht erst ans Ende scrollen.
 *      Vier Mal derselbe Knopf mit derselben Beschriftung — kein zweites Ziel
 *      (`funnel-narrativ/reference/bans.md`).
 *   2. **Chevrons zwischen den Blöcken.** In der Vorlage der einzige Trenner;
 *      sie ziehen das Auge weiter nach unten, statt eine Linie zu setzen, an der
 *      man aufhören könnte. `aria-hidden`, weil rein visuell.
 *   3. **Beweis zwei Mal, in zwei Formen.** Kurze Kundenstimmen direkt unter dem
 *      Hero (bevor irgendeine Behauptung fällt), die Ergebnisse mit Kennzahlen
 *      erst in der Mitte, wenn das Problem benannt ist.
 *
 * **Nicht übernommen** wurde alles, was die Vorlage an Beweis behauptet, ohne
 * dass wir es belegen könnten: zehn Testimonials mit Zahlen (wir haben zwei
 * abgegebene Zitate, siehe `src/data/testimonials.ts`), eine
 * Sammelbewertung („4,9 Sterne bei 321 Bewertungen") und ein durchgestrichener
 * Vorher-Preis. Erfundene Bewertungen sind nach § 5b Abs. 3 UWG abmahnbar.
 *
 * Der Rahmen ist `FunnelShell`, nicht `PageShell` — eine Landingpage mit voller
 * Website-Navigation gibt kaltem Traffic ein Dutzend Ausgänge. Begründung dort.
 */

/* -------------------------------------------------------------------------- */
/* Bausteine, die es nur auf dieser Seite gibt                                 */
/* -------------------------------------------------------------------------- */

/**
 * Der eine Knopf der Seite. Vier Mal eingebaut, überall gleich beschriftet —
 * nur `position` unterscheidet sich, damit Plausible zeigt, an welcher Stelle
 * der Seite geklickt wird.
 */
function AnmeldeKnopf({ position }: { position: string }) {
  return (
    <div className="flex flex-col items-center">
      <Link
        href={c.anmeldung.href}
        onClick={() => trackEvent("Calendly_Klick", { position })}
        className="inline-flex h-[56px] w-full max-w-[420px] items-center justify-center rounded-[100px] bg-primary px-8 text-center text-[18px] font-bold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90 sm:text-[20px]"
      >
        {c.anmeldung.label}
      </Link>
      <p className="mt-3 text-mini font-normal text-muted-foreground">{c.anmeldung.hinweis}</p>
    </div>
  );
}

/** Trenner der Vorlage: ein Winkel, der nach unten zeigt. Rein visuell. */
function Weiter() {
  return (
    <div className="flex justify-center py-2" aria-hidden="true">
      <ChevronDown className="h-9 w-9 text-primary" strokeWidth={2.5} />
    </div>
  );
}

/** Überschrift eines Abschnitts. In der Vorlage zentriert, außer im Hero. */
function AbschnittsTitel({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="kinetic-display mx-auto max-w-[820px] text-balance text-center text-[28px] leading-[1.14] text-foreground sm:text-h2"
    >
      {children}
    </h2>
  );
}

/**
 * Zweispaltige Liste mit Zeichen davor — das Grundmuster der Vorlage für
 * „erkennst du dich wieder", „das verändert sich" und die Qualifizierung.
 *
 * `marker` steuert, was vor der Zeile steht: ein Häkchen für das, was eintritt,
 * ein Kreuz für das, was fehlt oder ausschließt, ein Quadrat für neutrale
 * Aufzählung. Die Farben sind die Tokens der Seite (`success`/`destructive`),
 * nicht die Ampelfarben der Vorlage.
 */
function ZeichenListe({
  items,
  marker,
}: {
  items: string[];
  marker: "check" | "cross" | "square";
}) {
  return (
    <ul className="grid gap-x-10 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 py-3">
          {marker === "check" && (
            <Check
              className="mt-1 h-[18px] w-[18px] shrink-0 text-success"
              strokeWidth={3}
              aria-hidden="true"
            />
          )}
          {marker === "cross" && (
            <X
              className="mt-1 h-[18px] w-[18px] shrink-0 text-destructive"
              strokeWidth={3}
              aria-hidden="true"
            />
          )}
          {marker === "square" && (
            <span
              className="mt-[7px] h-[9px] w-[9px] shrink-0 bg-foreground"
              aria-hidden="true"
            />
          )}
          <span className="text-fliess font-medium leading-[1.5] text-foreground sm:text-[16px]">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */

export function Funnel() {
  /* Jeder Aufruf wird gemeldet — unabhängig vom Cookie-Banner und ohne
     personenbezogene Daten. Begründung in src/app/api/funnel-besuch/route.ts. */
  useEffect(() => {
    meldeFunnelBesuch("/funnel");
  }, []);

  return (
    <FunnelShell>
      <StructuredData
        data={[
          getWebPageSchema(
            `${c.headline} ${c.headlineHighlight} ${c.headlineRest}`,
            c.lead,
            `${BASE_URL}/funnel`
          ),
        ]}
      />

      {/* ------------------------------------------------------------ Hero -- */}
      {/* Linksbündig wie in der Vorlage — nicht zentriert wie der Hero der
          Startseite. Auf `surface-strong`, dem grauen Grund des Designsystems. */}
      <section className="bg-surface-strong pb-14 pt-7 sm:pt-9">
        <div className={SITE_CONTAINER}>
          {/* Absender, keine Navigation — steht auf demselben grauen Grund wie
              der Hero, damit über der Aussage keine eigene Leiste liegt. */}
          <FunnelLogo />

          <h1 className="kinetic-display kinetic-morph-in mt-10 max-w-[860px] text-balance text-[36px] leading-[41.4px] text-foreground sm:mt-14 sm:text-h1">
            {c.headline}{" "}
            <span className="box-decoration-clone bg-primary px-2 text-primary-foreground">
              {c.headlineHighlight}
            </span>{" "}
            {c.headlineRest}
          </h1>

          <p className="mt-6 max-w-[640px] text-pretty text-lead font-normal text-muted-foreground">
            {c.lead}
          </p>

          <p className="mt-6 max-w-[560px] text-fliess font-semibold leading-[1.5] text-foreground">
            {c.zielgruppe}
          </p>

          {/* Zeigt sich nur mit echtem Datum — siehe WorkshopTermin. */}
          <WorkshopTermin termin={c.termin} />

          <div className="mt-10 flex justify-start">
            <div className="w-full max-w-[420px]">
              <AnmeldeKnopf position="funnel-hero" />
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------- Beweis, erste Welle -- */}
      {/* In der Vorlage stehen hier vier Kundenstimmen. Wir haben zwei, die
          tatsächlich so abgegeben wurden — mehr nicht, und keine erfundenen
          dazu. Kurz gehalten, weil die Zitate selbst kurz sind; die Zahlen
          kommen weiter unten über das Kundenband. */}
      <section className={`${SITE_CONTAINER} py-12`} aria-label="Kundenstimmen">
        <ul className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
          {testimonials.map((stimme) => (
            <li key={stimme.author} className="flex flex-col">
              <StarRating value={stimme.rating} />
              <p className="mt-3 text-[16px] font-semibold leading-[1.45] text-foreground">
                „{stimme.quote}"
              </p>
              <p className="mt-2 text-fliess text-muted-foreground">
                {stimme.author} · {stimme.role}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <Weiter />

      {/* ------------------------------------------------ Pattern-Interrupt -- */}
      {/* Schema A, Beat 2: die eigene Fehlererfahrung, bevor eine Behauptung
          über das Angebot fällt. Linksbündig, wie die Gründer-Passage. */}
      <section className={`${SITE_CONTAINER} py-14`} aria-labelledby="verbrannt">
        <h2
          id="verbrannt"
          className="kinetic-display max-w-[720px] text-balance text-[26px] leading-[1.16] text-foreground sm:text-h3"
        >
          {c.patternInterrupt.heading}
        </h2>
        <p className="mt-5 max-w-[640px] text-pretty text-[16px] leading-[1.6] text-foreground/85 sm:text-lead">
          {c.patternInterrupt.body}
        </p>
      </section>

      {/* --------------------------------------------------------- Problem -- */}
      <section className={`${SITE_CONTAINER} py-14`} aria-labelledby="problem">
        <AbschnittsTitel id="problem">{c.painHeading}</AbschnittsTitel>

        <div className="mx-auto mt-10 max-w-[720px]">
          <p className="text-[16px] font-medium leading-[1.55] text-foreground sm:text-lead">
            {c.painIntro}
          </p>
          <p className="mt-6 text-[16px] font-semibold leading-[1.55] text-foreground sm:text-lead">
            {c.painLeadIn}
          </p>

          <ul className="mt-4">
            {c.painPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 py-3">
                <X
                  className="mt-1 h-[18px] w-[18px] shrink-0 text-destructive"
                  strokeWidth={3}
                  aria-hidden="true"
                />
                <span className="text-fliess font-medium leading-[1.5] text-foreground sm:text-[16px]">
                  {point}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-[16px] font-semibold leading-[1.55] text-foreground sm:text-lead">
            {c.painConclusion}
          </p>
          <p className="mt-3 text-[16px] leading-[1.55] text-muted-foreground sm:text-lead">
            {c.painBridge}
          </p>
        </div>

        <div className="mt-12">
          <AnmeldeKnopf position="funnel-problem" />
        </div>
      </section>

      <Weiter />

      {/* ----------------------------------------------------- Mechanismus -- */}
      {/* Zentrierte, nummerierte Liste — in der Vorlage der einzige Block, der
          komplett mittig steht. Nummer und Titel in einer Zeile, ein Satz
          darunter. */}
      <section className={`${SITE_CONTAINER} py-14`} aria-labelledby="mechanismus">
        <AbschnittsTitel id="mechanismus">{c.mechanismHeading}</AbschnittsTitel>

        <ol className="mx-auto mt-10 max-w-[720px]">
          {c.mechanism.map((schritt, index) => (
            <li key={schritt.title} className="py-5 text-center">
              <h3 className="text-[17px] font-bold leading-snug text-foreground sm:text-h4">
                <span className="kinetic-data mr-2 font-light text-primary">{index + 1}.</span>
                {schritt.title}
              </h3>
              <p className="mx-auto mt-2 max-w-[560px] text-pretty text-fliess leading-[1.6] text-muted-foreground sm:text-[16px]">
                {schritt.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <Weiter />

      {/* -------------------------------------- Wiedererkennung / Vorher-Nachher -- */}
      <section className={`${SITE_CONTAINER} py-14`} aria-labelledby="wiedererkennung">
        <AbschnittsTitel id="wiedererkennung">{c.recognizeHeading}</AbschnittsTitel>
        <div className="mx-auto mt-8 max-w-[900px]">
          <ZeichenListe items={c.recognize} marker="square" />
        </div>
      </section>

      <section className={`${SITE_CONTAINER} pb-14`} aria-labelledby="veraenderung">
        <AbschnittsTitel id="veraenderung">{c.changeHeading}</AbschnittsTitel>
        <div className="mx-auto mt-8 max-w-[900px]">
          <ZeichenListe items={c.change} marker="check" />
        </div>
      </section>

      <Weiter />

      {/* -------------------------------------------- Beweis, zweite Welle -- */}
      {/* Die Ergebnisse mit Kennzahlen, sobald das Problem benannt ist. Dasselbe
          Band wie auf der Startseite — belegte Fälle aus client-results.ts. */}
      <div className="py-6">
        <KundenLaufband />
      </div>

      <Weiter />

      {/* -------------------------------------------------- Qualifizierung -- */}
      <section className={`${SITE_CONTAINER} py-14`} aria-labelledby="geeignet">
        <AbschnittsTitel id="geeignet">{c.fit.forTitle}</AbschnittsTitel>
        <div className="mx-auto mt-8 max-w-[900px]">
          <ZeichenListe items={c.fit.for} marker="check" />
        </div>
      </section>

      <section className={`${SITE_CONTAINER} pb-14`} aria-labelledby="ungeeignet">
        <AbschnittsTitel id="ungeeignet">{c.fit.notTitle}</AbschnittsTitel>
        <div className="mx-auto mt-8 max-w-[900px]">
          <ZeichenListe items={c.fit.not} marker="cross" />
        </div>

        <div className="mt-12">
          <AnmeldeKnopf position="funnel-qualifizierung" />
        </div>
      </section>

      <Weiter />

      {/* --------------------------------------------------------- Gründer -- */}
      {/* Linksbündig wie in der Vorlage, kurze Absätze von je ein bis zwei
          Zeilen. Das Portrait steht darunter, nicht daneben: es ist freigestellt
          und braucht den grauen Grund, sonst schwebt die Person auf Weiß. */}
      <section className={`${SITE_CONTAINER} py-14`} aria-labelledby="gruender">
        <h2
          id="gruender"
          className="kinetic-display max-w-[760px] text-balance text-[26px] leading-[1.16] text-foreground sm:text-h3"
        >
          {c.founder.heading}
        </h2>

        <div className="mt-6 max-w-[660px] space-y-4">
          {c.founder.paragraphs.map((absatz) => (
            <p key={absatz} className="text-pretty text-[16px] leading-[1.6] text-foreground/85 sm:text-lead">
              {absatz}
            </p>
          ))}
        </div>

        {/* Der graue Grund ist auf die Breite der Textspalte begrenzt und endet
            unten bündig mit der Person. Über die volle Containerbreite gezogen
            stand das freigestellte Portrait mittig in einer leeren Fläche. */}
        <div className="mt-10 flex max-w-[660px] items-end justify-center overflow-hidden bg-surface-strong">
          <img
            src={"/images/team/ayham.webp"}
            alt="Ayham Alkhalil, Gründer von KITech Software"
            className="h-[360px] w-auto select-none object-contain object-bottom sm:h-[460px]"
          />
        </div>
      </section>

      <Weiter />

      {/* ------------------------------------------------------------- FAQ -- */}
      <section className={`${SITE_CONTAINER} py-14`} aria-labelledby="faq">
        <AbschnittsTitel id="faq">{c.faqHeading}</AbschnittsTitel>

        <Accordion type="single" collapsible className="mx-auto mt-10 max-w-[760px]">
          {c.faq.map((eintrag, index) => (
            <AccordionItem
              key={eintrag.question}
              value={`frage-${index}`}
              className="mb-3 border border-border bg-surface px-5"
            >
              <AccordionTrigger className="py-5 text-left text-[16px] font-bold leading-snug text-foreground hover:no-underline sm:text-lead">
                {eintrag.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-pretty text-fliess leading-[1.6] text-muted-foreground sm:text-[16px]">
                {eintrag.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* -------------------------------------------------- Abschluss-CTA -- */}
      <section
        className="border-t border-border bg-surface-strong py-16"
        aria-labelledby="abschluss"
      >
        <div className={SITE_CONTAINER}>
          <AbschnittsTitel id="abschluss">{c.cta.heading}</AbschnittsTitel>
          <p className="mx-auto mt-5 max-w-[620px] text-pretty text-center text-fliess text-muted-foreground sm:text-[16px]">
            {c.cta.text}
          </p>

          <div className="mt-10">
            <AnmeldeKnopf position="funnel-abschluss" />
          </div>
        </div>
      </section>
    </FunnelShell>
  );
}
