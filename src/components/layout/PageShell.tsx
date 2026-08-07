"use client";

import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { SignalBackdrop } from "./SignalBackdrop";

/**
 * Gemeinsamer Rahmen aller Seiten: Hintergrund, Kopfzeile, Inhalt, Fußzeile.
 *
 * Bis zum 05.08.2026 baute jede Seite diesen Rahmen selbst — mit drei
 * verschiedenen Containerbreiten, vier Kopien desselben Hintergrundverlaufs und
 * sechs Kopien der Fußzeile. Zwei Seiten (Rechtstexte) hingen sogar noch am
 * alten Layout mit einem völlig anderen Header. Wer eine neue Seite baut, nimmt
 * diese Shell und bekommt den Rahmen richtig.
 *
 * Der Hintergrund sitzt bewusst auf Shell-Ebene, nicht in `main`: die Kopfzeile
 * soll optisch auf dem Verlauf liegen, nicht darüber schweben.
 *
 * Die Breite des Inhalts gibt die Seite selbst vor — über `SITE_CONTAINER` aus
 * `site-container.ts`. Die Shell setzt sie nicht auf `main`, weil einzelne
 * Sektionen (Kartenraster, CTA-Bänder) bewusst über die volle Breite laufen und
 * ihre Kante selbst setzen.
 */
export function PageShell({
  children,
  /**
   * "header" — Signalverlauf im Kopfbereich (Standard).
   * "full"   — über die ganze Seite, für kurze Seiten ohne langen Inhalt.
   * "none"   — schwarzer Grund, für reine Textseiten (Rechtstexte, Glossar-Detail).
   */
  backdrop = "header",
  /** Überschreibt Position und Höhe des Hintergrunds, z. B. für einen bildschirmhohen Hero. */
  backdropClassName,
  /**
   * Weicher Auslauf am unteren Rand des Hintergrunds. Standardmäßig überall an,
   * wo der Hintergrund vor dem Seitenende aufhört — bei "full" gibt es nichts,
   * wohin ausgelaufen werden könnte.
   */
  backdropFade,
  backdropVignette = false,
  backdropDensity,
  backdropIntensity,
  /** Zusätzliche Klassen für das `main`-Element. */
  mainClassName = "",
}: {
  children: ReactNode;
  backdrop?: "header" | "full" | "none";
  backdropClassName?: string;
  backdropFade?: boolean;
  backdropVignette?: boolean;
  backdropDensity?: number;
  backdropIntensity?: number;
  mainClassName?: string;
}) {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      {backdrop !== "none" && (
        <SignalBackdrop
          className={
            backdropClassName ??
            (backdrop === "full"
              ? "absolute inset-0 -z-10"
              : "absolute inset-x-0 top-0 -z-10 h-[620px]")
          }
          fade={backdropFade ?? backdrop === "header"}
          vignette={backdropVignette}
          density={backdropDensity}
          intensity={backdropIntensity}
        />
      )}

      <SiteHeader />

      <main className={`relative flex-1 ${mainClassName}`}>{children}</main>

      <SiteFooter />
    </div>
  );
}
