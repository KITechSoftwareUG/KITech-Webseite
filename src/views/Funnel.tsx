"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Check, ChevronDown, X } from "lucide-react";
import { FunnelLogo, FunnelShell } from "@/components/layout/FunnelShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { FunnelStickyCta } from "@/components/conversion/FunnelStickyCta";
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
import { beobachteLesetiefe, meldeFunnelBesuch } from "@/lib/funnel-besuch";
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
 *   Hero → Beweis (Zahlen, dann Zitate) → Pattern-Interrupt → Problem → CTA →
 *   Ablauf → Kosten → Ergebnis → Kundenband → Qualifizierung → CTA → Gründer →
 *   FAQ → Abschluss-CTA
 *
 * Vier Eigenheiten sind Absicht:
 *
 *   1. **Derselbe CTA mehrfach.** Die Seite ist lang; wer an irgendeiner Stelle
 *      überzeugt ist, soll dort klicken können. Immer dieselbe Beschriftung,
 *      immer dasselbe Ziel — kein zweites (`funnel-narrativ/reference/bans.md`).
 *      Auf dem Handy kommt die mitlaufende Leiste dazu.
 *   2. **Chevrons zwischen den Blöcken.** In der Vorlage der einzige Trenner;
 *      sie ziehen das Auge weiter nach unten, statt eine Linie zu setzen, an der
 *      man aufhören könnte. `aria-hidden`, weil rein visuell.
 *   3. **Beweis in zwei Formen, direkt nacheinander.** Erst die belegten
 *      Kennzahlen, dann die beiden echten Zitate. Bis zum 18.08.2026 standen die
 *      Zitate allein oben und die Zahlen viertausend Pixel weiter unten — ein
 *      Testimonial ohne Zahl ist laut `voice.md` Dekoration.
 *   4. **Der Ablauf-Block ist der einzige auf farbigem Grund.** Er beantwortet
 *      die teuerste Frage der Seite („wofür gebe ich zwei Stunden her?") und ist
 *      deshalb der einzige, der sich optisch heraushebt.
 *
 * **Nicht übernommen** wurde alles, was die Vorlage an Beweis behauptet, ohne
 * dass wir es belegen könnten: zehn Testimonials mit Zahlen (wir haben zwei
 * abgegebene Zitate), eine Sammelbewertung und ein durchgestrichener
 * Vorher-Preis. Erfundene Bewertungen sind nach § 5b Abs. 3 UWG abmahnbar.
 *
 * Der Rahmen ist `FunnelShell`, nicht `PageShell` — eine Landingpage mit voller
 * Website-Navigation gibt kaltem Traffic ein Dutzend Ausgänge. Begründung dort.
 */

/* -------------------------------------------------------------------------- */
/* Bausteine, die es nur auf dieser Seite gibt                                 */
/* -------------------------------------------------------------------------- */

/**
 * Der eine Knopf der Seite. Mehrfach eingebaut, überall gleich beschriftet —
 * nur `position` unterscheidet sich, damit in Plausible ablesbar ist, an welcher
 * Stelle geklickt wird.
 *
 * `min-h` statt fester Höhe: die Beschriftung kommt aus `src/data/funnel.ts` und
 * ändert sich mit dem Angebot. Mit `h-[56px]` lief der Text bei jeder längeren
 * Fassung oben und unten aus der Pille heraus — dieselbe Regel, die am
 * 17.08.2026 schon für `CtaBanner`, `Home` und `Segment` gezogen wurde.
 */
function AnmeldeKnopf({ position }: { position: string }) {
  return (
    <div className="flex flex-col items-center">
      <Link
        href={c.anmeldung.href}
        onClick={() => trackEvent("Calendly_Klick", { position })}
        className="inline-flex min-h-[56px] w-full max-w-[420px] items-center justify-center rounded-[100px] bg-primary px-8 py-3 text-center text-[18px] font-bold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:text-[20px]"
      >
        {c.anmeldung.label}
      </Link>
      <p className="mt-3 max-w-[420px] text-balance text-center text-mini font-normal leading-snug text-muted-foreground">
        {c.anmeldung.hinweis}
      </p>
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
function AbschnittsTitel({
  id,
  hell = false,
  children,
}: {
  id: string;
  /** Auf dunklem Grund (Ablauf-Block) muss die Schrift hell stehen. */
  hell?: boolean;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className={`kinetic-display mx-auto max-w-[820px] text-balance text-center text-[28px] leading-[1.14] sm:text-h2 ${
        hell ? "text-white" : "text-foreground"
      }`}
    >
      {children}
    </h2>
  );
}

/**
 * Zweispaltige Liste mit Zeichen davor — das Grundmuster der Vorlage für
 * Kosten, Ergebnis und Qualifizierung.
 *
 * `marker` steuert, was vor der Zeile steht: ein Häkchen für das, was eintritt,
 * ein Kreuz für das, was fehlt oder ausschließt. Die Farben sind die Tokens der
 * Seite (`success`/`destructive`), nicht die Ampelfarben der Vorlage.
 */
function ZeichenListe({
  items,
  marker,
}: {
  items: string[];
  marker: "check" | "cross";
}) {
  return (
    <ul className="grid gap-x-10 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 py-3">
          {marker === "check" ? (
            <Check
              className="mt-1 h-[18px] w-[18px] shrink-0 text-success"
              strokeWidth={3}
              aria-hidden="true"
            />
          ) : (
            <X
              className="mt-1 h-[18px] w-[18px] shrink-0 text-destructive"
              strokeWidth={3}
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

/**
 * Gruenderportrait. Liegt wie alle inhaltlichen Bilder unter `public/images/`
 * — ein neues Foto braucht damit nur eine neue Datei, keine Code-Aenderung.
 */
const ayhamPortrait = "/images/team/ayham.webp";

/* -------------------------------------------------------------------------- */

export function Funnel() {
  /* Jeder Aufruf wird gemeldet — unabhängig vom Cookie-Banner und ohne
     personenbezogene Daten. Begründung in src/app/api/funnel-besuch/route.ts. */
  useEffect(() => {
    meldeFunnelBesuch("/funnel");
    /* Zweite Zahl: wie viele lesen bis zum Ende. Auf einer Seite dieser Länge
       die einzige Kennzahl, die erklärt, warum jemand nicht geklickt hat. */
    return beobachteLesetiefe("/funnel");
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

          {/* Die drei Angaben, die vor dem Klick entscheiden — auf Lesehöhe
              statt als Kleingedrucktes unter dem Knopf. Senkrechte Striche
              statt Aufzählungspunkten, damit die Zeile ruhig bleibt. */}
          <ul className="mt-7 flex flex-wrap items-center gap-y-2">
            {c.eckdaten.map((punkt, index) => (
              <li key={punkt} className="flex items-center">
                {index > 0 && (
                  <span className="mx-4 h-4 w-px bg-border sm:mx-5" aria-hidden="true" />
                )}
                <span className="kinetic-data text-fliess font-semibold text-foreground sm:text-[16px]">
                  {punkt}
                </span>
              </li>
            ))}
          </ul>

          {/* Zeigt sich nur mit echtem Datum — siehe WorkshopTermin. */}
          <WorkshopTermin termin={c.termin} />

          <div className="mt-9 flex justify-start">
            <div className="w-full max-w-[420px]">
              <AnmeldeKnopf position="funnel-hero" />
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Beweis -- */}
      {/* Zahlen zuerst: die belegten Kennzahlen aus client-results.ts, danach
          die zwei echten Zitate. Beides steht direkt unter dem Hero, weil kalter
          Traffic den Beleg braucht, bevor eine Behauptung fällt. */}
      <section className={`${SITE_CONTAINER} py-14`} aria-labelledby="beweis">
        <AbschnittsTitel id="beweis">{c.beweisHeading}</AbschnittsTitel>

        <ul className="mx-auto mt-9 max-w-[760px] divide-y divide-border border-y border-border">
          {c.beweisZeilen.map((zeile) => (
            <li
              key={zeile}
              className="py-4 text-fliess font-medium leading-[1.5] text-foreground sm:text-[16px]"
            >
              {zeile}
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-6 max-w-[760px] text-balance text-center text-[16px] font-semibold leading-snug text-foreground sm:text-lead">
          {c.beweisSchluss}
        </p>

        {/* Die zwei abgegebenen Zitate. Mehr gibt es nicht — und mehr wird
            nicht erfunden. */}
        <ul className="mx-auto mt-12 grid max-w-[900px] gap-x-12 gap-y-8 sm:grid-cols-2">
          {testimonials.map((stimme) => (
            <li key={stimme.author} className="flex flex-col">
              <StarRating value={stimme.rating} />
              <p className="mt-3 text-[16px] font-semibold leading-[1.45] text-foreground">
                „{stimme.quote}“
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

      {/* ---------------------------------------------------------- Ablauf -- */}
      {/* Der einzige Block auf dunklem Grund: er beantwortet die teuerste Frage
          der Seite — wofür gebe ich zwei Stunden her? Nach elf Bildschirmen in
          Weiß und Hellgrau ist das die Stelle, an der ein Bruch trägt. */}
      <section className="bg-navbar py-16 text-navbar-foreground" aria-labelledby="ablauf">
        <div className={SITE_CONTAINER}>
          <AbschnittsTitel id="ablauf" hell>
            {c.ablaufHeading}
          </AbschnittsTitel>
          <p className="mx-auto mt-5 max-w-[620px] text-pretty text-center text-fliess leading-[1.6] text-white/70 sm:text-[16px]">
            {c.ablaufLead}
          </p>

          <ol className="mx-auto mt-10 max-w-[760px] divide-y divide-white/15 border-y border-white/15">
            {c.ablauf.map((schritt, index) => (
              <li key={schritt.title} className="flex gap-5 py-6 sm:gap-7">
                <span className="kinetic-data shrink-0 text-[26px] font-light leading-none text-white/45 sm:text-h3">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-[17px] font-bold leading-snug text-white sm:text-lead">
                    {schritt.title}
                  </h3>
                  <p className="mt-2 text-pretty text-fliess leading-[1.6] text-white/70 sm:text-[16px]">
                    {schritt.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Weiter />

      {/* ------------------------------------------------ Kosten / Ergebnis -- */}
      <section className={`${SITE_CONTAINER} py-14`} aria-labelledby="kosten">
        <AbschnittsTitel id="kosten">{c.kostenHeading}</AbschnittsTitel>
        <div className="mx-auto mt-8 max-w-[900px]">
          <ZeichenListe items={c.kosten} marker="cross" />
        </div>
      </section>

      <section className={`${SITE_CONTAINER} pb-14`} aria-labelledby="ergebnis">
        <AbschnittsTitel id="ergebnis">{c.changeHeading}</AbschnittsTitel>
        <div className="mx-auto mt-8 max-w-[900px]">
          <ZeichenListe items={c.change} marker="check" />
        </div>
      </section>

      <Weiter />

      {/* ---------------------------------------------- Kundenband (Gesichter) -- */}
      {/* Die Kennzahlen stehen bereits oben als Text. Hier geht es um die
          Gesichter und Logos — deshalb ohne Verlinkung: sechs anklickbare Karten
          wären sechs Ausgänge aus einer Seite, die genau ein Ziel hat. */}
      <div className="py-6">
        <KundenLaufband ohneLinks />
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
          Zeilen. Das Portrait steht darunter auf grauem Grund: es ist
          freigestellt und schwebte auf Weiß. */}
      <section className={`${SITE_CONTAINER} py-14`} aria-labelledby="gruender">
        <h2
          id="gruender"
          className="kinetic-display max-w-[760px] text-balance text-[26px] leading-[1.16] text-foreground sm:text-h3"
        >
          {c.founder.heading}
        </h2>

        <div className="mt-6 max-w-[660px] space-y-4">
          {c.founder.paragraphs.map((absatz) => (
            <p
              key={absatz}
              className="text-pretty text-[16px] leading-[1.6] text-foreground/85 sm:text-lead"
            >
              {absatz}
            </p>
          ))}
        </div>

        <div className="mt-10 flex max-w-[660px] items-end justify-center overflow-hidden bg-surface-strong">
          {/* Pfad statt Import: die Bilder liegen seit dem 17.08.2026 unter
              `public/images/` und brauchen keine Import-Zeile mehr (siehe
              public/images/README.md). `loading="lazy"`, weil das Portrait weit
              unten steht und den Seitenaufbau nicht aufhalten soll. */}
          <img
            src={ayhamPortrait}
            alt="Ayham Alkhalil, Gründer von KITech Software"
            loading="lazy"
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

      {/* Mitlaufende Leiste, nur auf dem Handy. Der Abstand darüber verhindert,
          dass sie den Abschluss-CTA verdeckt. */}
      <div className="h-[92px] lg:hidden" aria-hidden="true" />
      <FunnelStickyCta
        label={c.anmeldung.label}
        hinweis="2 Stunden live, kostenlos"
        href={c.anmeldung.href}
      />
    </FunnelShell>
  );
}
