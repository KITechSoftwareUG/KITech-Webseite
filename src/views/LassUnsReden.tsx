"use client";

import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { StructuredData, getWebPageSchema } from "@/components/seo/StructuredData";
import { motion } from "framer-motion";
import { Star, X, ArrowRight, CalendarClock, Loader2, Quote, Linkedin } from "lucide-react";
import { trackEvent } from "@/lib/plausible";
import { hasAnalyticsConsent } from "@/lib/consent";
import { testimonials } from "@/data/testimonials";
import { founderInfo } from "@/components/sections/FounderPortrait";
import ayhamPortrait from "@/assets/ayham-portrait-casual.webp";


const CALENDLY_URL = "https://calendly.com/kitech-software/roi-analyse";
const CALENDLY_SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
      }) => void;
    };
  }
}

function loadCalendlyScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Calendly) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CALENDLY_SCRIPT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Calendly-Skript konnte nicht geladen werden.")));
      return;
    }
    const script = document.createElement("script");
    script.src = CALENDLY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Calendly-Skript konnte nicht geladen werden."));
    document.body.appendChild(script);
  });
}

/**
 * Drei echte, bereits an anderer Stelle im Code verwendete Kundenstimmen
 * (siehe src/pages/Enterprise.tsx) - hier bewusst dieselben, keine neuen
 * erfunden.
 */

/**
 * Basiert auf der bestehenden Positionierung (frühere Vergleichstabelle
 * "KITech vs. typische KI-Agentur" sowie den Enterprise-Problem-Statements),
 * nicht neu erfunden. Bewusst durchgehend "Sie" - konsistent mit dem Rest
 * der Seite (vorher fälschlich "ihr/du" gemischt).
 */
const mistakes = [
  "Sie zahlen nach Stunden, nicht nach Ergebnis.",
  "Sie bekommen Demos, die nie produktiv gehen.",
  "Das Risiko liegt bei Ihnen, nicht bei der Agentur.",
  "Ihre Daten landen unkontrolliert in Public-Cloud-Tools ohne AVV.",
];

/**
 * Basiert auf der Gründer-Positionierung aus Haltung.tsx (ROI-Garantie,
 * Festpreis, Risiko-Umkehr).
 */
const reasons = [
  "ROI in Euro, nicht in Buzzwords – vor Projektstart schriftlich definiert.",
  "Festpreis. Erreichen wir das Ziel nicht, zahlen Sie nicht.",
  "Das Risiko der Umsetzung liegt bei uns, nicht bei Ihnen.",
];

export default function LassUnsReden() {
  // Bewusst mit `false` starten und den Consent erst nach dem Mount lesen: der
  // Server kennt den localStorage nicht, ein direkt aus `hasAnalyticsConsent()`
  // initialisierter State würde beim Hydrieren von der Server-Ausgabe abweichen
  // (React-Fehler #418).
  const [widgetEnabled, setWidgetEnabled] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const [widgetError, setWidgetError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWidgetEnabled(hasAnalyticsConsent());
  }, []);

  useEffect(() => {
    if (!widgetEnabled || !containerRef.current) return;
    let cancelled = false;
    loadCalendlyScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        window.Calendly?.initInlineWidget({
          url: CALENDLY_URL,
          parentElement: containerRef.current,
        });
        if (!cancelled) setWidgetReady(true);
      })
      .catch(() => {
        if (!cancelled) setWidgetError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [widgetEnabled]);

  return (
    /* Signal-Hintergrund wie auf Startseite und Funnel-Seiten - die Terminseite
       soll sich nicht wie ein Fremdkörper anfühlen. */
    <PageShell backdropClassName="absolute inset-x-0 top-0 -z-10 h-[560px]">
      <StructuredData
        data={getWebPageSchema(
          "Lass uns reden",
          "Kostenloses Erstgespräch direkt im Kalender buchen",
          "https://kitech-software.de/lass-uns-reden"
        )}
      />

      <section className="relative py-12 lg:py-16">
        <div className={`${SITE_CONTAINER} grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16`}>
          {/* Linke Spalte: Mini-Funnel */}
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative flex min-h-[320px] items-end overflow-hidden border border-border bg-surface"
            >
              <img
                src={ayhamPortrait.src}
                alt="Ayham Alkhalil, Gründer KITech Software"
                className="absolute bottom-0 right-0 h-full max-h-[380px] w-auto object-contain object-bottom opacity-90"
              />
              <div
                className="absolute inset-0 bg-gradient-to-r from-card via-card/80 to-transparent"
                aria-hidden="true"
              />
              <div className="relative z-10 p-6 sm:p-8">
                <h1 className="kinetic-display kinetic-morph-in max-w-sm text-[30px] leading-[1.1] text-foreground sm:text-[38px]">
                  Falsche KI ist die{" "}
                  <span className="box-decoration-clone bg-primary px-2 pb-0.5 text-primary-foreground">
                    teuerste KI
                  </span>
                  .
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  Ayham Alkhalil, Gründer KITech Software
                </p>
                <a
                  href={founderInfo.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-opacity hover:opacity-80"
                >
                  <Linkedin className="h-4 w-4" aria-hidden="true" />
                  Auf LinkedIn vernetzen
                </a>
              </div>
            </motion.div>

            <div>
              <h2 className="kinetic-data mb-4 text-xs uppercase tracking-widest text-muted-foreground">
                Was Kunden sagen
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {testimonials.map((t) => (
                  <div
                    key={t.author}
                    className="flex h-full flex-col gap-3 border border-border bg-surface p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5" aria-hidden="true">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                        ))}
                      </div>
                      <Quote className="h-4 w-4 shrink-0 text-muted-foreground/40" aria-hidden="true" />
                    </div>
                    <p className="text-sm italic leading-snug text-foreground/90">„{t.quote}"</p>
                    <div className="mt-auto flex items-center gap-2.5 border-t border-border pt-3">
                      {t.logo && (
                        <img
                          src={t.logo}
                          alt=""
                          aria-hidden="true"
                          className="h-5 w-5 shrink-0 object-contain"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium leading-snug text-foreground">{t.author}</p>
                        <p className="text-mini leading-snug text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="kinetic-data mb-4 text-xs uppercase tracking-widest text-muted-foreground">
                Das läuft bei vielen falsch
              </h2>
              <ul className="space-y-2.5">
                {mistakes.map((m) => (
                  <li key={m} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="kinetic-data mb-4 text-xs uppercase tracking-widest text-muted-foreground">
                Warum Sie mit mir reden sollten
              </h2>
              <ul className="space-y-2.5">
                {reasons.map((r) => (
                  <li key={r} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Rechte Spalte: Calendly */}
          <div className="lg:sticky lg:top-24">
            <div className="overflow-hidden border border-border bg-surface">
              {widgetError ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 p-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    Der Kalender konnte nicht geladen werden. Bitte weichen Sie kurz auf{" "}
                    <a
                      href={CALENDLY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-4"
                    >
                      Calendly direkt
                    </a>{" "}
                    aus, oder schreiben Sie uns.
                  </p>
                </div>
              ) : widgetEnabled ? (
                <div className="relative" style={{ minWidth: 320, height: 700 }}>
                  {!widgetReady && (
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface"
                      role="status"
                      aria-live="polite"
                    >
                      <Loader2 className="h-6 w-6 animate-spin text-accent" aria-hidden="true" />
                      <span className="text-sm text-muted-foreground">Kalender wird geladen …</span>
                    </div>
                  )}
                  <div ref={containerRef} className="h-full w-full" />
                </div>
              ) : (
                <div className="flex min-h-[400px] flex-col items-center justify-center gap-5 p-10 text-center">
                  <CalendarClock className="h-8 w-8 text-accent" aria-hidden="true" />
                  <p className="max-w-xs text-sm leading-[1.6] text-muted-foreground">
                    Der Kalender wird über den externen Dienst Calendly geladen. Mit Klick
                    stimmen Sie dem Laden externer Inhalte zu.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      trackEvent("Calendly_Klick", { position: "lass-uns-reden-embed" });
                      setWidgetEnabled(true);
                    }}
                    className="inline-flex h-[52px] items-center gap-3 bg-primary px-6 text-fliess font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Kalender laden
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
