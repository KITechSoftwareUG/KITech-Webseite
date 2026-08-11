import type { AppModule } from "@/components/app/app-modules";

/**
 * Kachel für einen der drei Bausteine des Bereichs.
 *
 * Marker oben rechts wie bei den Kunden-Ergebniskarten (`ClientResults.tsx`):
 * bündig in der Ecke, Lime, sehr klein — hier trägt er "In Arbeit", weil es
 * hinter der Kachel noch nichts zu klicken gibt. Bewusst kein Fortschrittsbalken
 * und keine Prozentangabe: beides wäre erfunden.
 *
 * Reine Server-Komponente, kein Zustand — deshalb kein "use client".
 */
export function ModuleCard({ module }: { module: AppModule }) {
  const Icon = module.icon;

  return (
    <article className="relative flex flex-col border border-border bg-surface px-6 pb-7 pt-8 shadow-[0_20px_50px_hsl(0_0%_0%/0.35)] transition-colors hover:border-primary/60">
      <span className="kinetic-data absolute right-0 top-0 bg-accent px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
        In Arbeit
      </span>

      <span className="flex h-11 w-11 items-center justify-center border border-border text-accent" aria-hidden="true">
        <Icon className="h-5 w-5" />
      </span>

      <h3 className="kinetic-display mt-6 text-balance text-[20px] leading-tight text-foreground">
        {module.title}
      </h3>

      <p className="mt-3 text-pretty text-[14px] leading-[1.6] text-muted-foreground">
        {module.description}
      </p>

      <ul className="mt-6 space-y-2.5 border-t border-border/60 pt-5 text-[13px]">
        {module.contents.map((entry) => (
          <li key={entry} className="flex items-start gap-2.5 text-foreground/82">
            {/* Quadratischer Punkt statt Icon — passt zur scharfkantigen Linie. */}
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden="true" />
            {entry}
          </li>
        ))}
      </ul>
    </article>
  );
}
