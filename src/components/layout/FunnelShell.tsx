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
 * **Keine Kopfleiste** (Vorgabe 12.08.2026): „Die Leiste oben braucht man
 * nicht, das Logo funktioniert sowieso nicht." Hier stand bis dahin das
 * dunkelblaue Band der Hauptseite mit dem weißen Logo darin. Es sah aus wie
 * eine Navigation, war aber keine — das Logo verlinkte bewusst nirgendwohin,
 * damit die Seite keinen Ausgang bekommt. Ein Balken, der wie ein Menü
 * aussieht und sich nicht wie eins verhält, kostet nur Bauhöhe über der
 * Aussage. Das Logo steht jetzt als reines Absenderzeichen im Seitenkopf, den
 * die jeweilige Seite selbst setzt (`FunnelLogo`), auf demselben Grund wie ihr
 * Hero — dadurch gibt es keine Kante mehr zwischen Leiste und Inhalt.
 *
 * Was bleibt, bleibt aus einem Grund:
 *
 *   - **Impressum, Datenschutz, AGB.** Die Anbieterkennzeichnung ist nach § 5
 *     DDG Pflicht und muss von jeder öffentlich erreichbaren Seite ohne Umweg
 *     erreichbar sein.
 *   - **Cookie-Einstellungen**, dieselbe Pflicht wie überall sonst. Das Banner
 *     hängt ohnehin im Providers-Baum darüber.
 *
 * Dieselbe Bauart wie `CheckShell` — nur trägt der Funnel im Gegensatz zum
 * Selbstcheck die Marke, weil er sie verkauft.
 */
/**
 * Absenderzeichen im Seitenkopf — ohne Balken, ohne Link.
 *
 * Steht innerhalb der ersten Sektion der Seite, damit es auf deren Grund sitzt
 * und keine sichtbare Kante entsteht. Dunkle Logodatei (`logo.png`), weil der
 * Grund hier hell ist; `logo-weiss.svg` wäre unsichtbar.
 */
export function FunnelLogo() {
  return (
    <img
      src="/logo.png"
      alt="KITech Software"
      className="h-7 w-auto select-none sm:h-8"
    />
  );
}

export function FunnelShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
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
