import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Große klickbare Kachel für Verzweigungsseiten (`/warum`, `/leistungen`):
 * ganze Fläche als Link, Titel, ein Satz, Pill-Knopf unten links.
 *
 * Ohne Icon-Quadrat oben links — das Icon-in-abgerundetem-Kasten-Muster der
 * Alt-Seiten ist genau die Baukasten-Optik, die hier nicht wiederkommen soll.
 * Was die Kachel unterscheidet, ist der Text, nicht ein dekoratives Symbol.
 *
 * Die Kachel selbst ist seit dem hellen Design eine Karte im Standardschnitt
 * (`rounded-2xl`, weiss, Ring, weicher Schatten) — dieselbe Form wie die
 * Kundenkarten. Scharfkantige Kaesten wirken auf hellem Grund unfertig.
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
      className="group flex min-h-[220px] flex-col justify-between rounded-2xl bg-white p-7 shadow-card ring-1 ring-border transition-shadow duration-200 hover:shadow-elevated sm:p-8"
    >
      <div>
        {eyebrow && (
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
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
          <p className="mt-4 max-w-[420px] text-pretty text-[14px] font-normal leading-[1.6] text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {/* Optische Pille, kein eigener Knopf: die ganze Kachel ist der Link, ein
          verschachteltes Bedienelement waere fuer Tastatur und Screenreader
          doppelt. Deshalb `span` mit Button-Aussehen, das am Hover der Kachel
          haengt. Weisse Schrift steht auf `bg-primary` und bleibt lesbar. */}
      <span className="mt-8 inline-flex h-[46px] w-fit items-center gap-2 rounded-full bg-primary px-6 text-[14px] font-bold text-primary-foreground transition-colors group-hover:bg-primary/90">
        Ansehen
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
