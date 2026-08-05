"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StructuredData, getWebPageSchema } from "@/components/seo/StructuredData";
import { CommunityCountdown, START_LABEL } from "@/components/sections/CommunityCountdown";
import { CommunityWarteliste } from "@/components/sections/CommunityWarteliste";
import { trackEvent } from "@/lib/plausible";

/**
 * `/community` — der einzige Einstiegspunkt in die Skool-Community.
 *
 * Bewusste Entscheidungen (Ansage vom 05.08.2026):
 *   - Es gibt keine zweite Community-Seite und keinen Funnel davor. Die frühere
 *     Seite `/skool` ist entfallen und leitet permanent hierher (next.config.ts).
 *   - Keine Canvas-Animation (SignalField), kein `kinetic-morph-in`, keine
 *     Scroll-Effekte. Ruhige Fläche, das Foto trägt die Seite.
 *   - Kein Label-über-Headline-Muster, keine Feature-Kacheln mit Icons — beides
 *     liest sich als Baukasten. Die Vorteile stehen als redaktionelle Liste.
 *   - Kopfzeile und Fußzeile bleiben drin: die Seite soll sich wie ein Teil der
 *     Unternehmenswebsite anfühlen, nicht wie eine abgeschottete Funnel-Seite.
 *
 * Zwei Zustände (Nachtrag 05.08.2026 — die Gruppe ist noch nicht offen):
 *   VOR dem Start  : Countdown plus Warteliste. Kein Link in die Gruppe, denn
 *                    dort ist noch nichts zu holen.
 *   AB dem Start   : Beitritts-Button in die Gruppe.
 * Umgeschaltet wird im Browser, sobald der Countdown durch ist — die Seite wird
 * statisch vorgerendert, ein serverseitiger Vergleich stünde sonst für immer auf
 * dem Build-Zeitpunkt. Ohne Deploy wechselt die Seite also von selbst.
 */

/** Ziel nach dem Start. Vorher bewusst nirgends verlinkt. */
const SKOOL_URL = "https://www.skool.com/ki-fur-business-4646";

/**
 * Freigestelltes Foto von Ayham am Schreibtisch — von Ayham geliefert als
 * `skool_bild.svg` (4,7 MB, zwei eingebettete PNGs hinter einer Maske).
 *
 * Als WebP mit Alphakanal abgelegt statt als SVG ausgeliefert: das SVG wäre mit
 * 4,7 MB das mit Abstand schwerste Element der Seite gewesen und hätte den
 * Bildaufbau ausgebremst. Das WebP hält dieselbe Freistellung bei 122 KB.
 * Transparenz bleibt erhalten, JPEG kann das nicht — deshalb hier kein .jpg.
 *
 * Maße 1200×1140 (fast quadratisch): das sind die Maße des Motivs selbst, der
 * leere Rand des SVG ist weggeschnitten. Deshalb steht das Bild frei auf dem
 * Seitenhintergrund, ohne Rahmen und ohne festes Seitenverhältnis.
 */
const PORTRAIT_SRC = "/media/ayham-community.webp";
const PORTRAIT_WIDTH = 1200;
const PORTRAIT_HEIGHT = 1140;

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
  /**
   * Startet als `false` — vor dem 1. September ist das für praktisch jeden
   * Besucher richtig, und der Countdown korrigiert es beim ersten Tick, falls
   * der Termin durch ist. Andersherum (Start bei `true`) würde bis dahin für
   * einen Wimpernschlag der Beitritts-Button aufblitzen.
   */
  const [gestartet, setGestartet] = useState(false);
  const beiAblauf = useCallback(() => setGestartet(true), []);

  /** Vor dem Start Warteliste, danach der Weg in die Gruppe. */
  function Handlung({ id, position }: { id: string; position: string }) {
    return gestartet ? (
      <BeitretenButton position={position} />
    ) : (
      <CommunityWarteliste id={id} position={position} />
    );
  }

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
        <section className="grid gap-y-10 pb-24 pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-x-14 lg:pb-32 lg:pt-20">
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

          {/* Kein Rahmen, kein Hintergrund, kein Beschnitt: das Foto ist freigestellt
              und steht direkt auf der Seitenfläche. Ein Kasten drumherum würde die
              Freistellung genau wieder zunichtemachen.

              `width`/`height` stehen als Attribute drin, damit der Browser den Platz
              schon vor dem Laden reserviert — sonst springt der Hero beim Bildaufbau. */}
          <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
            <img
              src={PORTRAIT_SRC}
              width={PORTRAIT_WIDTH}
              height={PORTRAIT_HEIGHT}
              alt="Ayham Alkhalil, Gründer von KITech Software, an seinem Schreibtisch"
              className="mx-auto h-auto w-full max-w-[520px] lg:ml-auto lg:mr-0"
              loading="eager"
            />
          </div>

          <div className="min-w-0 lg:col-start-1 lg:row-start-2 lg:self-start">
            {!gestartet && (
              <div className="mb-9">
                <CommunityCountdown onAblauf={beiAblauf} />
              </div>
            )}
            <Konditionen />
            <div className="mt-5">
              <Handlung id="warteliste-hero" position="community-hero" />
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
            gelesen hat, soll nicht nach oben scrollen müssen. Der Countdown steht
            hier bewusst nicht ein zweites Mal — zwei tickende Uhren auf einer Seite
            sind eine zu viel. Stattdessen die Startzeile als Satz. */}
        <section className="border-t border-border py-20 lg:py-28">
          {!gestartet && (
            <p className="mb-6 text-[15px] leading-tight text-foreground/70">
              Los geht es am{" "}
              <span className="font-semibold text-foreground">{START_LABEL}</span>.
            </p>
          )}
          <Konditionen />
          <div className="mt-5">
            <Handlung id="warteliste-abschluss" position="community-abschluss" />
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
