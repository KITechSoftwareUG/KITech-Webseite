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
 * ein Satz, nah an der Überschrift. Wer drei Sätze braucht, hat die Überschrift
 * nicht scharf genug formuliert.
 *
 * Größen aus der Design-Vorlage gemessen (acquisition.com /careers):
 * Überschrift 48 px / 800 / Zeilenhöhe 55,2 px, Satz darunter 18 px / 27 px.
 *
 * Bewusst **ohne** `uppercase`: Versalien sind im hellen Design der Zug des
 * Heros auf der Startseite. Die Titel hier sind ganze Sätze mit Satzzeichen
 * ("Direkt an den Tisch, nicht ins Formular.") — in Großbuchstaben verlieren
 * sie über zwei Zeilen ihre Lesbarkeit. Die Wucht kommt aus Gewicht (800 über
 * `kinetic-display`) und Größe.
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
    <section className={`${SITE_CONTAINER} pb-4 pt-[40px] sm:pt-[64px]`}>
      <h1 className="kinetic-display kinetic-morph-in max-w-[860px] text-balance text-[36px] leading-[41.4px] text-foreground sm:text-h1">
        {title}
      </h1>

      {/* Der Lead steht in `muted-foreground`: dunkles Grau auf hellem Grund,
          klar lesbar und trotzdem eine Stufe unter der Überschrift. */}
      {lead && (
        <p className="mt-6 max-w-[640px] text-pretty text-lead font-normal text-muted-foreground">
          {lead}
        </p>
      )}

      {children}
    </section>
  );
}
