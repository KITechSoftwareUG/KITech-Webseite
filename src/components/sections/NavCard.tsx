import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Große klickbare Kachel für Verzweigungsseiten (`/warum`, `/leistungen`):
 * ganze Fläche als Link, Titel, ein Satz, Pfeil unten rechts.
 *
 * Eckig und ohne Icon-Quadrat oben links — das Icon-in-abgerundetem-Kasten-Muster
 * der Alt-Seiten ist genau die Baukasten-Optik, die hier nicht wiederkommen soll.
 * Was die Kachel unterscheidet, ist der Text, nicht ein dekoratives Symbol.
 */
export function NavCard({
  href,
  title,
  description,
  /** Kleine Zeile über dem Titel, z. B. die Zielgruppe. Kein dekoratives Label. */
  eyebrow,
}: {
  href: string;
  title: string;
  description?: string;
  eyebrow?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[220px] flex-col justify-between border border-border bg-background/40 p-7 transition-colors hover:border-foreground/40 hover:bg-foreground/[0.03] sm:p-8"
    >
      <div>
        {eyebrow && (
          <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
            {eyebrow}
          </span>
        )}
        <h3
          className={`kinetic-display text-balance text-[22px] leading-[1.15] text-foreground sm:text-[26px] ${
            eyebrow ? "mt-3" : ""
          }`}
        >
          {title}
        </h3>
        {description && (
          <p className="mt-4 max-w-[420px] text-pretty text-[14px] leading-[1.6] text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <span className="mt-8 inline-flex items-center gap-2 text-[13px] font-semibold text-foreground">
        Ansehen
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
