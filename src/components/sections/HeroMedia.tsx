"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { SignalField } from "@/components/canvas/SignalField";

/**
 * Medienfläche im Hero — hier läuft später das Video von Ayham bzw. ein Foto.
 *
 * Solange keine Datei vorliegt, steht hier eine ehrlich markierte Platzhalter-Fläche
 * statt eines Fake-Players: eine Abspieltaste, die nichts abspielt, wäre ein
 * Versprechen, das die Seite nicht einlöst.
 *
 * Zum Freischalten: `videoSrc` und `posterSrc` unten setzen. Das Video wird dann
 * erst auf Klick geladen (kein Autoplay, kein Preload) — das spart Datenvolumen
 * und respektiert langsame Verbindungen.
 *
 * Dateien gehören nach `public/media/`, nicht nach `src/assets` — Videos sollen
 * nicht durch den Bundler.
 */

/** Sobald ein Video vorliegt: Pfad unter /public eintragen, z. B. "/media/ayham.mp4". */
const videoSrc: string | null = null;
/** Standbild, das vor dem Abspielen gezeigt wird, z. B. "/media/ayham-poster.jpg". */
const posterSrc: string | null = null;

export function HeroMedia() {
  const [playing, setPlaying] = useState(false);

  if (videoSrc) {
    return (
      <div className="relative aspect-video overflow-hidden border border-white/12 bg-black">
        {playing ? (
          <video
            src={videoSrc}
            poster={posterSrc ?? undefined}
            controls
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group relative h-full w-full"
            aria-label="Video abspielen"
          >
            {posterSrc && (
              <img src={posterSrc} alt="" aria-hidden="true" className="h-full w-full object-cover" />
            )}
            <span className="absolute left-1/2 top-1/2 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-foreground/85 text-background transition-transform group-hover:scale-105">
              <Play className="h-7 w-7 translate-x-0.5 fill-current" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative aspect-video overflow-hidden border border-white/12"
      style={{
        background:
          "linear-gradient(160deg, hsl(245 45% 16%) 0%, hsl(243 40% 10%) 60%, hsl(0 0% 6%) 100%)",
      }}
    >
      <SignalField density={0.9} intensity={0.6} baseColor="--primary" accentColor="--accent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,hsl(245_85%_62%/0.28),transparent_38%)]" />

      <span className="absolute right-0 top-0 bg-accent px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-background">
        Video folgt
      </span>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
        <span className="flex h-[62px] w-[62px] items-center justify-center border border-white/25 text-foreground/60">
          <Play className="h-6 w-6 translate-x-0.5" aria-hidden="true" />
        </span>
        <span className="px-6 text-[11px] uppercase tracking-wide text-foreground/45">
          Platz für Video oder Foto
        </span>
      </div>
    </div>
  );
}
