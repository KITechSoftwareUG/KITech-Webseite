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
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
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
