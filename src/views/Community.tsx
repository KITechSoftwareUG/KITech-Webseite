"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StructuredData, getWebPageSchema } from "@/components/seo/StructuredData";
import { trackEvent } from "@/lib/plausible";

/**
 * `/community` — der einzige Einstiegspunkt in die Skool-Community.
 *
 * Bewusste Entscheidungen (Ansage vom 05.08.2026):
 *   - Es gibt keine zweite Community-Seite und keinen Funnel davor. Die frühere
 *     Warteliste unter `/skool` ist ersatzlos entfallen; wer beitreten will, klickt
 *     hier und ist drin. `/skool` leitet permanent hierher (next.config.ts).
 *   - Keine Canvas-Animation (SignalField), kein `kinetic-morph-in`, keine
 *     Scroll-Effekte. Ruhige Fläche, das Portrait trägt die Seite.
 *   - Kein Label-über-Headline-Muster, keine Feature-Kacheln mit Icons — beides
 *     liest sich als Baukasten. Die Vorteile stehen als redaktionelle Liste.
 *   - Kopfzeile und Fußzeile bleiben drin: die Seite soll sich wie ein Teil der
 *     Unternehmenswebsite anfühlen, nicht wie eine abgeschottete Funnel-Seite.
 */

/**
 * Ziel des einzigen CTA dieser Seite.
 *
 * ACHTUNG — Platzhalter: die echte Skool-URL liegt noch nicht vor (Stand 05.08.2026).
 * Hier steht deshalb die Skool-Startseite. Vor dem Livegang durch die tatsächliche
 * Gruppen-URL ersetzen (z. B. https://www.skool.com/<gruppenname>).
 */
const SKOOL_URL = "https://www.skool.com/";

/**
 * Großes Portrait von Ayham, eigens für diese Seite.
 *
 * Bewusst NICHT `src/assets/ayham-portrait*.webp` — die laufen an anderer Stelle
 * und sind für diese Größe zu klein. Das hochauflösende Bild wird unter genau
 * diesem Pfad erwartet; ideal im Hochformat (4:5), mindestens 1200 px breit.
 */
const PORTRAIT_SRC = "/media/ayham-community.jpg";

/** Wörtlich wie vorgegeben. */
const VORTEILE = [
  "Austausch mit Unternehmern, die KI bereits produktiv einsetzen.",
  "Echte Projekte statt theoretischer Inhalte.",
  "Praktische Lösungen zum Nachbauen.",
  "Direkter Austausch ohne Marketing-Blabla.",
  "Erfahrungen, Fehler und Ergebnisse aus echten Kundenprojekten.",
];

const legalLinks = [
  { name: "Impressum", href: "/impressum" },
  { name: "Datenschutz", href: "/datenschutz" },
  { name: "AGB", href: "/agb" },
];

/**
 * Die beiden Konditionen stehen an beiden CTAs identisch — sie gehören zum Button,
 * nicht in eine eigene Sektion. Als eigene Komponente, damit sie nicht auseinander
 * laufen, wenn eine der beiden Stellen später geändert wird.
 */
function Konditionen() {
  return (
    <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[19px] font-semibold leading-tight sm:text-[22px]">
      <span className="text-accent">100 % kostenlos</span>
      <span aria-hidden="true" className="text-foreground/25">
        /
      </span>
      <span className="text-foreground">Begrenzte Plätze</span>
    </p>
  );
}

function BeitretenButton({ position }: { position: string }) {
  return (
    <a
      href={SKOOL_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("CTA_Klick", { position })}
      className="inline-flex h-[68px] w-full max-w-[420px] items-center justify-center gap-3 bg-accent px-8 text-[16px] font-semibold text-background transition-colors hover:bg-accent/90 sm:text-[17px]"
    >
      Jetzt kostenlos beitreten
      <ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" />
    </a>
  );
}

export default function Community() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <StructuredData
        data={getWebPageSchema(
          "Die KI-Community von KITech Software",
          "Kein Hype. Keine Demos. Nur echte Projekte mit echten Ergebnissen.",
          "https://kitech-software.de/community"
        )}
      />

      <SiteHeader className="mx-auto w-full max-w-[1120px] px-5 pt-7 sm:px-8" />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-5 sm:px-8">
        {/* Hero: Aussage links, Portrait rechts. Das Bild bekommt bewusst fast
            genauso viel Fläche wie der Text — es ist hier das Vertrauenselement,
            nicht Dekoration. */}
        {/* Reihenfolge ist bewusst per Grid-Koordinaten gesetzt statt per `order`:
            so steht das Portrait im Quelltext (und damit auf dem Handy) direkt unter
            der Headline, während es auf großen Schirmen rechts neben Text und CTA
            sitzt. Auf dem Handy zuerst der Button und dann das Gesicht wäre genau
            die Funnel-Reihenfolge, die diese Seite nicht haben soll. */}
        <section className="grid gap-y-10 pb-24 pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-x-16 lg:pb-32 lg:pt-20">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <h1 className="kinetic-display max-w-[600px] text-balance text-[40px] leading-[1.05] text-foreground sm:text-[56px] lg:text-[60px]">
              Werde Teil der{" "}
              <span className="box-decoration-clone bg-foreground px-2.5 pb-1 text-background">
                einzig wahren
              </span>{" "}
              KI-Community.
            </h1>

            {/* Bewusst nah an der Headline und fast so groß: der Satz ist die zweite
                Hälfte der Aussage, kein erklärender Fließtext darunter. */}
            <p className="mt-7 max-w-[540px] text-pretty text-[20px] leading-[1.45] text-foreground/90 sm:text-[24px]">
              Kein Hype. Keine Demos. Nur echte Projekte mit echten Ergebnissen.
            </p>
          </div>

          {/* Hochformat statt der sonst üblichen Bildkacheln: ein Gesicht wirkt
              stehend, nicht liegend beschnitten. */}
          <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
            <div className="relative mx-auto w-full max-w-[460px] overflow-hidden bg-foreground/[0.04] lg:ml-auto lg:mr-0">
              <img
                src={PORTRAIT_SRC}
                alt="Ayham Alkhalil, Gründer von KITech Software"
                className="aspect-[4/5] w-full object-cover object-center"
                loading="eager"
              />
            </div>
          </div>

          <div className="min-w-0 lg:col-start-1 lg:row-start-2 lg:self-start">
            <Konditionen />
            <div className="mt-5">
              <BeitretenButton position="community-hero" />
            </div>
          </div>
        </section>

        {/* Vorteile: eine Liste, keine Kacheln. Trennlinien statt Boxen, damit der
            Blick durchläuft und nicht an fünf gleichen Rechtecken hängen bleibt. */}
        <section className="border-t border-border py-20 lg:py-28" aria-labelledby="drin">
          <h2
            id="drin"
            className="kinetic-display text-[28px] leading-tight text-foreground sm:text-[36px]"
          >
            Was dich drin erwartet.
          </h2>

          <ul className="mt-12 max-w-[820px]">
            {VORTEILE.map((vorteil, index) => (
              <li
                key={vorteil}
                className={`py-6 text-[19px] leading-[1.4] text-foreground/88 sm:text-[23px] ${
                  index > 0 ? "border-t border-border/60" : ""
                }`}
              >
                {vorteil}
              </li>
            ))}
          </ul>
        </section>

        {/* Abschluss: derselbe Weg noch einmal, ohne neues Argument. Wer bis hier
            gelesen hat, soll nicht nach oben scrollen müssen. */}
        <section className="border-t border-border py-20 lg:py-28">
          <Konditionen />
          <div className="mt-5">
            <BeitretenButton position="community-abschluss" />
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col items-start gap-3 px-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
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
