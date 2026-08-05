"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SignalField } from "@/components/canvas/SignalField";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { trackEvent } from "@/lib/plausible";

/**
 * Generische Platzhalterseite für Routen, die im Relaunch bereits einen Platz
 * haben, aber inhaltlich noch nicht gebaut sind (Community, Learning-Portal,
 * Referenz-Detailseiten).
 *
 * Immer `noindex` — diese Seiten sollen nicht in den Suchindex, solange sie leer sind.
 * Sobald eine Route echten Inhalt bekommt, wird sie in App.tsx auf die eigene
 * Komponente umgehängt und verschwindet hier.
 */
export default function ComingSoon({
  title,
  description,
  note,
}: {
  title: string;
  description: string;
  /** Optionaler Hinweis, was hier später entsteht. */
  note?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background text-foreground">

      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(112deg, hsl(245 55% 12%) 0%, hsl(243 45% 9%) 46%, hsl(0 0% 5%) 100%)",
          }}
        />
        <SignalField density={0.4} intensity={0.4} baseColor="--primary" accentColor="--accent" />
      </div>

      <div className="mx-auto flex w-full max-w-[1060px] flex-1 flex-col px-5 py-12 sm:px-8 sm:py-16">
        <SiteHeader />

        <div className="flex flex-1 flex-col justify-center py-20">
          <span className="mb-5 block w-fit border border-border px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            In Arbeit
          </span>

          <h1 className="kinetic-display kinetic-morph-in max-w-[720px] text-balance text-[34px] leading-[1.08] text-foreground sm:text-[50px]">
            {title}
          </h1>

          <p className="mt-7 max-w-[560px] text-pretty text-[15px] leading-[1.65] text-foreground/82">
            {description}
          </p>

          {note && (
            <p className="mt-4 max-w-[560px] text-pretty text-[13px] leading-[1.6] text-muted-foreground">
              {note}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/lass-uns-reden"
              onClick={() => trackEvent("Calendly_Klick", { position: `coming-soon-${title}` })}
              className="inline-flex h-[52px] items-center gap-3 bg-foreground px-6 text-[13px] font-semibold text-background transition-colors hover:bg-foreground/90"
            >
              Erstgespräch buchen
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/"
              className="inline-flex h-[52px] items-center gap-3 border border-border px-6 text-[13px] text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
