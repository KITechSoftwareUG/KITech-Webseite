"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { legalNavigation } from "@/config/navigation";
import { SITE_CONTAINER } from "./site-container";

/**
 * Rahmen der Kampagnenseiten (`/funnel`, `/fokus`) — dieselbe Optik wie die
 * Website, aber ohne jeden Ausgang.
 *
 * **Warum nicht `PageShell`:** Die Landingpages bekommen kalten Traffic über
 * einen einzelnen LinkedIn-Link. `PageShell` bringt Ankündigungsbalken,
 * vollständiges Hauptmenü mit zwei Untermenüs und die große Fußzeile mit rund
 * zwanzig Links mit. Wer hier landet, hat damit ein Dutzend Möglichkeiten
 * wegzuklicken, bevor er den einen Knopf erreicht, für den die Seite gebaut
 * ist. `funnel-narrativ/reference/bans.md` verbietet aus demselben Grund ein
 * zweites CTA-Ziel — eine volle Navigation ist nichts anderes, nur in groß.
 *
 * Was bleibt, bleibt aus einem Grund:
 *
 *   - **Das Logo** oben links, wie in der Vorlage. Es verweist bewusst *nicht*
 *     auf die Startseite: ein Link dorthin wäre genau der Ausgang, den diese
 *     Hülle vermeidet. Es steht als Absender da, nicht als Navigation.
 *   - **Impressum, Datenschutz, AGB.** Die Anbieterkennzeichnung ist nach § 5
 *     DDG Pflicht und muss von jeder öffentlich erreichbaren Seite ohne Umweg
 *     erreichbar sein.
 *   - **Cookie-Einstellungen**, dieselbe Pflicht wie überall sonst. Das Banner
 *     hängt ohnehin im Providers-Baum darüber.
 *
 * Dieselbe Bauart wie `CheckShell` — nur trägt der Funnel im Gegensatz zum
 * Selbstcheck die Marke, weil er sie verkauft.
 */
export function FunnelShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      {/* Gleiche Höhe und Innenbreite wie die Navigationsleiste der Hauptseite,
          damit die Seite nicht wie ein fremdes Werkzeug wirkt — nur ohne Menü. */}
      <header className="relative z-40 w-full bg-navbar text-navbar-foreground">
        <div className={SITE_CONTAINER}>
          <div className="flex h-[65px] items-center">
            {/* Kein `<Link>`: siehe Kopfkommentar. Das Logo ist Absender, kein Weg. */}
            <img
              src="/logo-weiss.svg"
              alt="KITech Software"
              className="h-8 w-auto dt:h-6"
            />
          </div>
        </div>
      </header>

      <main className="relative flex-1">{children}</main>

      <footer className="border-t border-border bg-surface">
        <div
          className={`${SITE_CONTAINER} flex flex-col items-center gap-4 py-7 text-xs text-muted-foreground sm:flex-row sm:justify-center`}
        >
          <nav
            aria-label="Rechtliche Links"
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          >
            {legalNavigation.map((eintrag) => (
              <Link
                key={eintrag.href}
                href={eintrag.href}
                className="transition-colors hover:text-foreground"
              >
                {eintrag.label}
              </Link>
            ))}
            {/* Öffnet den Consent-Dialog erneut — als Event, weil das Banner
                außerhalb dieser Hülle im Providers-Baum hängt. */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("cookie-consent:open"))}
              className="transition-colors hover:text-foreground"
            >
              Cookie-Einstellungen
            </button>
          </nav>
        </div>
      </footer>
    </div>
  );
}
