"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Blendet einen Abschnitt beim Hereinscrollen ein — leicht von unten, einmal.
 *
 * **Der Startzustand ist sichtbar.** Das ist der Kern dieser Umsetzung: Wer die
 * Seite ohne JavaScript lädt, sieht den vollständigen Inhalt. Erst im Browser
 * wird ein Element, das noch *unterhalb* des Sichtfelds liegt, versteckt und
 * beim Hereinscrollen eingeblendet.
 *
 * Der naheliegende Weg — Framer Motion mit `initial={{ opacity: 0 }}` und
 * `whileInView` — macht genau das Gegenteil: er schreibt `opacity: 0` schon ins
 * serverseitig gerenderte HTML. Fällt das JavaScript aus, ist die halbe Seite
 * unsichtbar, und jedes Werkzeug, das die Seite rendert ohne zu scrollen, sieht
 * leere Blöcke. Bei der ersten Fassung standen so die Kundenzahlen — das
 * stärkste Argument der Seite — im Screenshot als leere Kästen da.
 *
 * Elemente, die beim Laden bereits im Bild sind, werden bewusst *nicht*
 * angefasst: sie würden sonst kurz aufblitzen und wieder verschwinden.
 *
 * Bei `prefers-reduced-motion` passiert gar nichts. Dauerhafte Bewegung ist für
 * Menschen mit vestibulären Beschwerden ein echtes Problem, keine
 * Geschmacksfrage — dieselbe Rücksicht wie beim Kundenband.
 *
 * Die beiden Klassen sind in `src/index.css` definiert.
 */
export function Einblenden({
  children,
  /** Verzögerung in Sekunden, um Elemente nacheinander erscheinen zu lassen. */
  verzoegerung = 0,
  className,
}: {
  children: ReactNode;
  verzoegerung?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    /* Schon im Bild? Dann nichts tun — sonst blitzt der Inhalt auf und
       verschwindet für den Bruchteil einer Sekunde wieder. */
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.style.transitionDelay = verzoegerung ? `${verzoegerung}s` : "";
    el.classList.add("einblenden-start");

    const beobachter = new IntersectionObserver(
      ([eintrag]) => {
        if (!eintrag.isIntersecting) return;
        el.classList.add("einblenden-an");
        beobachter.disconnect();
      },
      /* Startet, kurz bevor der Block im Bild ist — sonst ist die Bewegung
         beim Ankommen schon vorbei oder fängt erst beim Lesen an. */
      { rootMargin: "0px 0px -12% 0px" }
    );

    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, [verzoegerung]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
