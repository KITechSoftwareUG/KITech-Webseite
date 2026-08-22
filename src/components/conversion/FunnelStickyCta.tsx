"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/plausible";

/**
 * Anmelde-Leiste, die auf dem Handy am unteren Rand mitläuft.
 *
 * **Warum nicht `StickyMobileCTA`:** Die trägt zwei Knöpfe — „Anrufen" und den
 * Termin — und wirbt für den 1:1-KI-Check aus `src/config/angebot.ts`. Auf einer
 * Kampagnenseite ist beides falsch: `funnel-narrativ/reference/bans.md` erlaubt
 * genau ein CTA-Ziel pro Funnel, und beworben wird hier der Workshop, nicht der
 * Check. Ein zweiter Knopf teilt die Aufmerksamkeit genau dort, wo sie am
 * teuersten ist.
 *
 * **Warum überhaupt:** Die Seite ist auf dem Handy mehrere tausend Pixel lang.
 * Wer im unteren Drittel überzeugt ist, müsste ohne diese Leiste erst wieder
 * scrollen, um einen Knopf zu finden.
 *
 * **Nur auf dem Handy** (`lg:hidden`): auf dem Desktop stehen die Seiten-CTAs
 * nah genug beieinander, und eine fixierte Leiste nähme dort nur Platz weg.
 *
 * Die Leiste hält unten Abstand zur Systemgeste von iOS
 * (`env(safe-area-inset-bottom)`) — ohne das liegt der Knopf auf iPhones unter
 * dem Home-Indikator und ist schwer zu treffen.
 */
export function FunnelStickyCta({
  label,
  hinweis,
  href,
}: {
  label: string;
  hinweis: string;
  href: string;
}) {
  const [sichtbar, setSichtbar] = useState(false);

  useEffect(() => {
    /*
     * Rund die Höhe des Hero-Bereichs auf dem Handy: die Leiste kommt genau
     * dann, wenn der erste Knopf aus dem Bild scrollt — nicht schon währenddessen
     * (zwei sichtbare Knöpfe gleichzeitig wirken hektisch).
     */
    const beiScroll = () => setSichtbar(window.scrollY > 620);
    window.addEventListener("scroll", beiScroll, { passive: true });
    beiScroll();
    return () => window.removeEventListener("scroll", beiScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md transition-transform duration-300 lg:hidden ${
        sichtbar ? "translate-y-0" : "translate-y-full"
      }`}
      /* `inert` im eingefahrenen Zustand: sonst liegt ein Link im Tabulator-Weg,
         den niemand sehen kann. */
      aria-hidden={!sichtbar}
      inert={!sichtbar}
    >
      {/* `max-w-[420px]`: dieselbe Breite wie der Knopf im Hero. Ohne sie lief
         die Pille auf Tablets ueber die volle Fensterbreite — bei 768 px
         736 px, waehrend derselbe Knopf zwei Bildschirme weiter oben
         420 px misst. */}
      <div className="mx-auto w-full max-w-[420px] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <Link
          href={href}
          onClick={() => trackEvent("Calendly_Klick", { position: "funnel-sticky" })}
          className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-[100px] bg-primary px-6 py-2 text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
        >
          <span className="flex flex-col text-left">
            <span className="text-[16px] font-bold leading-tight">{label}</span>
            <span className="mt-0.5 text-mini font-normal leading-tight text-primary-foreground/75">
              {hinweis}
            </span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
