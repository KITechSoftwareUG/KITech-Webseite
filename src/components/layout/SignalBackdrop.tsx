"use client";

import { SignalField } from "@/components/canvas/SignalField";

/**
 * Der Signal-Hintergrund: Schwarz-zu-Dunkelblau-Verlauf, darüber das
 * Canvas-Signalfeld, darunter ein weicher Auslauf in die Seitenfarbe.
 *
 * Bis zum 05.08.2026 stand derselbe Verlaufswert wörtlich kopiert in Startseite,
 * Referenzübersicht, Baustellenseite und Sales-Letter-Vorlage. Vier Kopien
 * bedeuten vier Stellen, an denen der Blauton auseinanderlaufen kann — hier
 * steht er einmal.
 *
 * Positionierung und Höhe kommen über `className`, damit der eingefärbte Bereich
 * genau dort enden kann, wo der Hero der jeweiligen Seite endet. Die Startseite
 * braucht dafür einen anderen (und responsiven) Wert als eine Übersichtsseite.
 */
export function SignalBackdrop({
  /**
   * Standard: Kopfbereich fester Höhe. Für eine Seite, die vollflächig eingefärbt
   * sein soll, `absolute inset-0 -z-10` übergeben.
   */
  className = "absolute inset-x-0 top-0 -z-10 h-[620px]",
  density = 0.45,
  intensity = 0.45,
  /**
   * Weicher Auslauf am unteren Rand. Ohne ihn endet der Verlauf an einer
   * sichtbaren Kante, und der Übergang zum Inhalt darunter wirkt wie ein Schnitt
   * statt wie ein Weiterlesen.
   */
  fade = true,
  /**
   * Dunkler Rand nach außen. Beruhigt den Untergrund, wenn Text direkt darauf
   * sitzt — auf der Startseite nötig, sonst konkurriert das Signalfeld mit der
   * Headline.
   */
  vignette = false,
}: {
  className?: string;
  density?: number;
  intensity?: number;
  fade?: boolean;
  vignette?: boolean;
}) {
  return (
    <div className={className} aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(112deg, hsl(245 55% 12%) 0%, hsl(243 45% 9%) 46%, hsl(0 0% 5%) 100%)",
        }}
      />

      <SignalField density={density} intensity={intensity} baseColor="--primary" accentColor="--accent" />

      {vignette && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(130% 90% at 22% 32%, transparent 0%, hsl(240 40% 4% / 0.6) 100%)",
          }}
        />
      )}

      {fade && (
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      )}
    </div>
  );
}
