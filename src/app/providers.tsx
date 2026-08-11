"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/CookieConsent";

/**
 * Sammelt alle Provider, die Client-seitigen State brauchen. Das Root-Layout
 * bleibt dadurch eine Server Component und kann Metadata exportieren.
 *
 * `reducedMotion="user"` lässt Framer Motion die Betriebssystem-Einstellung
 * "Bewegung reduzieren" automatisch respektieren — zentral hier statt pro Komponente.
 *
 * `forcedTheme="light"`: seit dem Design-Wechsel am 11.08.2026 gibt es keinen
 * Dark Mode mehr (siehe docs/DESIGN.md). next-themes bleibt installiert, weil
 * shadcn-Bausteine den Provider erwarten — es darf aber keine dunkle Klasse
 * mehr gesetzt werden, sonst greifen Reste alter Theme-Stände.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
      <TooltipProvider>
        <MotionConfig reducedMotion="user">
          {children}
          <Toaster />
          <Sonner />
          <CookieConsent />
        </MotionConfig>
      </TooltipProvider>
    </ThemeProvider>
  );
}
