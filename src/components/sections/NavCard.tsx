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
 * Die Kachel ist **flach**: kein Rahmen, kein Schatten, kein eigener Grund.
 * Die Design-Vorlage arbeitet auf ihren Unterseiten durchgehend ohne solche
 * Kaesten — Struktur entsteht dort ueber Typografie und Abstaende. Getrennt
 * werden die Kacheln nur durch eine feine Oberkante.
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
      className="group flex min-h-[200px] flex-col justify-between border-t border-border pt-7 transition-opacity duration-200 hover:opacity-80"
    >
      <div>
        {eyebrow && (
          <span className="block text-mini font-semibold uppercase tracking-wide text-muted-foreground">
            {eyebrow}
          </span>
        )}
        <h3
          className={`kinetic-display text-balance text-h3 text-foreground ${
            eyebrow ? "mt-3" : ""
          }`}
        >
          {title}
        </h3>
        {description && (
          <p className="mt-4 max-w-[420px] text-pretty text-fliess font-normal text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {/* Optische Pille, kein eigener Knopf: die ganze Kachel ist der Link, ein
          verschachteltes Bedienelement waere fuer Tastatur und Screenreader
          doppelt. Deshalb `span` mit Button-Aussehen, das am Hover der Kachel
          haengt. Weisse Schrift steht auf `bg-primary` und bleibt lesbar. */}
      <span className="mt-8 inline-flex h-[54px] w-fit items-center gap-2 rounded-[100px] bg-primary px-[50px] text-lead font-medium text-primary-foreground transition-colors group-hover:bg-primary/90">
        Ansehen
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
