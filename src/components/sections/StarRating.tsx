import { Star } from "lucide-react";

/**
 * Sterne-Bewertung eines einzelnen Kunden, wie sie auf den Ergebniskarten steht.
 *
 * Gold statt des sonst üblichen Signal-Lime: Sterne sind ein etabliertes Zeichen,
 * das in Gelb sofort als Bewertung gelesen wird. In der Akzentfarbe der Seite
 * wirkten sie wie ein weiteres Designelement.
 *
 * Es werden immer fünf Positionen gezeichnet, davon `value` gefüllt. Nur so ist
 * die Zahl überhaupt als Bewertung lesbar — vier Sterne ohne den fünften Umriss
 * liest niemand als "vier von fünf", sondern als Dekoration.
 */
export function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${value} von ${max} Sternen`}
    >
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={
            i < value
              ? "h-[13px] w-[13px] fill-amber-400 text-amber-400"
              : "h-[13px] w-[13px] text-amber-400/30"
          }
        />
      ))}
    </span>
  );
}
