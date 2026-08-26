import { Users } from "lucide-react";

/**
 * Steht an der Stelle, an der die anderen Ergebniskarten ihre Sterne zeigen —
 * für Fälle ohne Bewertung.
 *
 * **Auf Ansage (26.08.2026):** „Bei der klargehalt gibt es ja keine Sterne.
 * Mach statt den Sternen iwas dahin — sowas wie 20+ Kunden usw."
 *
 * Betrifft aktuell nur klargehalt.de: Der Fall hat bewusst keine Person
 * (siehe `person` in `client-results.ts`) und damit niemanden, der eine
 * Bewertung abgeben könnte. Im Kartenkopf blieb dadurch eine Lücke, wo bei
 * allen anderen fünf Sterne stehen.
 *
 * ⚠️ Bewusst KEIN Stern und kein sternähnliches Zeichen. Die Zeile darf nicht
 * wie eine Bewertung ohne Absender aussehen — sie trägt eine nachzählbare
 * Tatsache, nicht ein Urteil. Deshalb ein Personen-Symbol in der Signalfarbe
 * der Seite statt des Bewertungsgolds der Sterne.
 */
export function StattSterne({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Users aria-hidden="true" className="h-[14px] w-[14px] shrink-0 text-primary" />
      <span className="text-mini font-bold leading-none text-foreground">{text}</span>
    </span>
  );
}
