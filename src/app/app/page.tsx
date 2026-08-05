import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { appModules } from "@/components/app/app-modules";
import { ModuleCard } from "@/components/app/ModuleCard";
import { requireUser } from "@/lib/auth/session";

/**
 * Startseite des eingeloggten Bereichs — aus Besuchersicht `app.kitech-software.de/`.
 *
 * Ehrliche Baustelle: es gibt hier noch keine Inhalte, und die Seite sagt das
 * auch. Statt einer leeren Dashboard-Attrappe mit Platzhalter-Zahlen zeigt sie
 * die drei Bausteine, die entstehen. Erst wenn ein Baustein echte Daten hat,
 * wird aus seiner Kachel ein Einstieg.
 *
 * Der Session-Guard steht hier und nicht im Layout: im Layout würde er den
 * gesamten Teilbaum dynamisch machen, hier trifft er genau die Seite, die
 * Schutz braucht.
 */
export const metadata: Metadata = {
  title: "Übersicht",
  robots: { index: false, follow: false },
};

const CONTACT_EMAIL = "aalkh@kitech-software.de";

export default async function AppOverviewPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-[1080px]">
      <header className="max-w-[680px]">
        <span className="kinetic-data mb-5 block w-fit border border-border px-3 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
          In Arbeit
        </span>

        <h1 className="kinetic-display kinetic-morph-in text-balance text-[30px] leading-[1.1] text-foreground sm:text-[40px]">
          Dein Bereich wird gerade gebaut.
        </h1>

        <p className="mt-6 text-pretty text-[15px] leading-[1.65] text-foreground/82">
          Der Login steht, die Inhalte noch nicht. Unten siehst du, woraus dieser
          Bereich bestehen wird — ohne Platzhalter-Daten und ohne Termin, den wir
          noch nicht halten können.
        </p>

        {/* Einzige echte Angabe auf dieser Seite — aus der Session, nicht erfunden.
            Sie beantwortet außerdem die erste Frage in jedem Login-Bereich:
            "Mit welchem Konto bin ich hier eigentlich drin?" */}
        <p className="kinetic-data mt-7 text-[12px] text-muted-foreground">
          Angemeldet als <span className="text-foreground">{user.displayName}</span>
        </p>
      </header>

      <section className="mt-14" aria-labelledby="bausteine-heading">
        <h2
          id="bausteine-heading"
          className="kinetic-display text-[22px] leading-tight text-foreground sm:text-[26px]"
        >
          Was hier entsteht
        </h2>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {appModules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </section>

      {/* Solange nichts klickbar ist, braucht die Seite wenigstens einen echten
          Weg nach draußen — sonst ist der eingeloggte Bereich eine Sackgasse. */}
      <footer className="mt-14 border-t border-border/60 pt-6">
        <p className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
          <Mail className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          Fragen oder etwas, das hier fehlt? Schreib direkt an
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-semibold text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </footer>
    </div>
  );
}
