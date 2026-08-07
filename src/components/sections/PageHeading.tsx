import type { ReactNode } from "react";
import { SITE_CONTAINER } from "@/components/layout/site-container";

/**
 * Seitenkopf aller Unterseiten: eine große Aussage, darunter höchstens ein Satz.
 *
 * Bewusst OHNE das Muster Label -> Headline -> Erklärabsatz. Das kleine
 * Rechteck-Label über der Überschrift und der erklärende Fließtext darunter sind
 * als Sektionsaufbau ausdrücklich raus (Vorgabe Ayham) — sie lesen sich wie ein
 * Baukasten und nehmen der Aussage die Wucht.
 *
 * `lead` ist deshalb kein Erklärabsatz, sondern die zweite Hälfte der Aussage:
 * groß gesetzt, nah an der Überschrift, ein Satz. Wer drei Sätze braucht, hat
 * die Überschrift nicht scharf genug formuliert.
 */
export function PageHeading({
  title,
  lead,
  /** Zusätzliche Elemente unter dem Lead — etwa ein CTA oder Kennzahl-Kacheln. */
  children,
}: {
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className={`${SITE_CONTAINER} pb-4 pt-14 sm:pt-20`}>
      <h1 className="kinetic-display kinetic-morph-in max-w-[860px] text-balance text-[34px] leading-[1.1] text-foreground sm:text-[48px]">
        {title}
      </h1>

      {lead && (
        <p className="mt-7 max-w-[640px] text-pretty text-[18px] leading-[1.45] text-foreground/90 sm:text-[22px]">
          {lead}
        </p>
      )}

      {children}
    </section>
  );
}
