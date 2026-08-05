"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

/**
 * Pfeil am Ende des Heros, der zum nächsten Abschnitt führt.
 *
 * Ein Anker-Link statt eines Scroll-Skripts: funktioniert auch ohne JavaScript,
 * ist per Tastatur bedienbar und landet als echtes Sprungziel im Verlauf. Die
 * Bewegung ist reine Zugabe — `reducedMotion="user"` ist global in
 * `src/app/providers.tsx` gesetzt, wer "Bewegung reduzieren" aktiviert hat,
 * bekommt den Pfeil ruhig.
 */
export function ScrollHint({ targetId, label }: { targetId: string; label: string }) {
  return (
    <div className="flex justify-center pb-10 pt-2">
      <motion.a
        href={`#${targetId}`}
        aria-label={label}
        className="group flex flex-col items-center gap-2 text-foreground/45 transition-colors hover:text-foreground"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-[10px] uppercase tracking-[0.2em]">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center border border-border/70 transition-colors group-hover:border-primary">
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </span>
      </motion.a>
    </div>
  );
}
