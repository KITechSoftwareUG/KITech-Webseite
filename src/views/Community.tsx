"use client";

import { useCallback, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { company } from "@/config/company";
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

/**
 * Legt die ganze Seite hinter Milchglas: der Inhalt bleibt sichtbar, ist aber
 * unscharf und nicht bedienbar, darüber steht scharf der Hinweis, dass hier noch
 * gearbeitet wird (Ansage vom 05.08.2026).
 *
 * **Zum Abschalten genügt `false`** — dann ist die Seite wieder vollständig da,
 * am Inhalt darunter ändert sich nichts.
 *
 * Solange das `true` ist, gehört die Seite außerdem auf `noindex` und nicht in die
 * Sitemap (beides in `src/app/community/page.tsx` bzw. `src/config/navigation.ts`
 * hinterlegt) — eine verwischte Seite im Suchindex ist für Google dünner Inhalt.
 *
 * Kopfzeile und Fußzeile bleiben bewusst scharf und bedienbar: läge der Schleier
 * auch über der Navigation, wäre die Seite eine Sackgasse ohne Rückweg.
 */
const IM_AUFBAU = true;

/** Ziel nach dem Start. Vorher bewusst nirgends verlinkt. */
const SKOOL_URL = company.skoolUrl;

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

/**
 * Der scharfe Hinweis über dem verwischten Inhalt.
 *
 * `sticky` statt `fixed`: der Block wandert beim Scrollen mit, bleibt aber im
 * Seitenfluss und damit im Container — `fixed` würde ihn aus dem Layout lösen und
 * auf schmalen Schirmen über die Ränder hinausschieben. `top` liegt bei 42 % der
 * Höhe, also knapp über der Mitte, wo der Blick zuerst hinfällt.
 *
 * Der eigene Kasten hat einen kräftigen eigenen Grund: Text direkt auf verwischtem
 * Inhalt ist auch bei starker Unschärfe schwer zu lesen.
 */
function AufbauHinweis() {
  return (
    <div className="pointer-events-none sticky top-[42vh] z-10 flex justify-center px-5">
      <div className="w-full max-w-[560px] border border-border bg-background/97 px-7 py-8 text-center shadow-[0_24px_60px_hsl(0_0%_0%/0.55)] sm:px-10 sm:py-10">
        <p className="kinetic-display text-[26px] leading-tight text-foreground sm:text-[32px]">
          Diese Seite ist noch im Aufbau.
        </p>
        <p className="mt-4 text-[15px] leading-[1.6] text-foreground/75 sm:text-base">
          Die Community startet am{" "}
          <span className="font-semibold text-foreground">{START_LABEL}</span>.
        </p>
      </div>
    </div>
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
    /* Kein Signal-Hintergrund: die Seite soll ruhig bleiben, das freigestellte
       Foto trägt sie. Deshalb `backdrop="none"` statt des Verlaufs, den die
       übrigen Seiten im Kopfbereich tragen. */
    <PageShell backdrop="none">
      <StructuredData
        data={getWebPageSchema(
          "Die KI-Community von KITech Software",
          "Kein Hype. Keine Demos. Nur echte Projekte mit echten Ergebnissen.",
          "https://kitech-software.de/community"
        )}
      />

      {IM_AUFBAU && <AufbauHinweis />}

      {/* Der eigentliche Seiteninhalt. Im Aufbau-Zustand liegt er hinter Milchglas:
          `blur` macht ihn unscharf, `pointer-events-none` verhindert Klicks, und
          `inert` nimmt ihn zusätzlich aus Tastaturfokus und Vorlesereihenfolge —
          sonst könnte man sich mit der Tabulatortaste durch unsichtbare Felder
          hangeln und ins Nichts absenden. Der leichte Grauschleier darüber senkt
          den Kontrast so weit, dass der scharfe Hinweis klar davor steht. */}
      <div
        className={
          IM_AUFBAU
            ? "pointer-events-none select-none blur-[6px] saturate-[0.9] sm:blur-[8px]"
            : undefined
        }
        inert={IM_AUFBAU}
      >
      <div className={SITE_CONTAINER}>
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
      </div>
      </div>
    </PageShell>
  );
}
