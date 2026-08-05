"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { appModules } from "@/components/app/app-modules";

/**
 * Rahmen des eingeloggten Bereichs: feste Kopfzeile, ab `lg` zusätzlich eine
 * Seitenleiste, darunter mobil ein aufklappbares Menü.
 *
 * Der Bereich sieht bewusst anders aus als die Marketing-Seite: dort trägt jede
 * Seite ihren eigenen Hero mit Verlauf und Canvas-Hintergrund, hier gibt es
 * stattdessen nüchterne Chrome-Flächen (`bg-card`) mit harten Rahmenkanten. Wer
 * eingeloggt ist, soll auf den ersten Blick merken, dass er nicht mehr auf der
 * Verkaufsseite ist — deshalb Seitenleiste statt zentrierter Marketing-Container.
 *
 * Scharfkantig (keine rounded-*), wie alle neu gebauten Komponenten.
 */

/**
 * Der Bereich liegt intern unter `/app`, wird aber per Host-Rewrite als
 * `app.kitech-software.de/` ausgeliefert. Alle internen Links hier sind deshalb
 * aus Besuchersicht geschrieben ("/" statt "/app") — sonst würde der Rewrite den
 * Pfad ein zweites Mal voranstellen und ins Leere laufen.
 */
const OVERVIEW_HREF = "/";

/**
 * Zurück zur öffentlichen Website. Absolut, weil das auf der App-Domain eine
 * andere Origin ist — ein relativer Pfad landete wieder im App-Bereich.
 */
const MARKETING_URL = "https://kitech-software.de";

/**
 * Abmelden ist eine zustandsändernde Aktion und deshalb ein POST-Formular, kein
 * Link: einen GET-Link lösen Prefetch, Link-Vorschauen und Browser-Erweiterungen
 * ungefragt aus — der Nutzer fliegt raus, ohne geklickt zu haben. Die Route baut
 * der Auth-Teil; der Pfad steht hier ebenfalls aus Besuchersicht.
 */
const LOGOUT_ACTION = "/auth/logout";

function NavList({ overviewActive, onNavigate }: { overviewActive: boolean; onNavigate?: () => void }) {
  return (
    <ul className="flex flex-col">
      <li>
        <Link
          href={OVERVIEW_HREF}
          onClick={onNavigate}
          aria-current={overviewActive ? "page" : undefined}
          className={`flex items-center gap-3 border-l-2 px-4 py-3 text-[13px] transition-colors ${
            overviewActive
              ? "border-accent bg-secondary text-foreground"
              : "border-transparent text-foreground/70 hover:border-border hover:text-foreground"
          }`}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden="true" />
          Übersicht
        </Link>
      </li>

      {/* Die drei Bausteine sind bewusst keine Links: die Routen existieren noch
          nicht, ein Klick liefe auf 404. Als gedämpfte Einträge mit "bald"-Marker
          zeigen sie die spätere Struktur, ohne etwas zu versprechen. */}
      {appModules.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.id}>
            <span className="flex items-center gap-3 border-l-2 border-transparent px-4 py-3 text-[13px] text-foreground/40">
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.navLabel}
              <span className="sr-only">– noch nicht verfügbar</span>
              <span className="kinetic-data ml-auto border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                bald
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function MarketingLink({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <a
      href={MARKETING_URL}
      onClick={onNavigate}
      className="flex items-center gap-2 px-4 py-3 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
    >
      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      Zur Website
    </a>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Auf der App-Domain meldet `usePathname()` "/", beim direkten Aufruf über die
  // Hauptdomain "/app" — dieselbe Seite, zwei Schreibweisen.
  const overviewActive = pathname === "/" || pathname === "/app";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-accent focus:bg-background focus:px-4 focus:py-2 focus:text-[13px]"
      >
        Zum Inhalt springen
      </a>

      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={OVERVIEW_HREF} aria-label="KITech Software – zur Übersicht" className="flex shrink-0">
              <img src="/logo.png" alt="KITech Software Logo" className="h-7 w-auto sm:h-8" />
            </Link>
            {/* Der Kennzeichnungs-Chip ist der schnellste Hinweis "du bist eingeloggt". */}
            <span className="kinetic-data hidden border border-border px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground sm:inline-block">
              Mitgliederbereich
            </span>
          </div>

          <div className="flex items-center gap-2">
            <form action={LOGOUT_ACTION} method="post">
              <button
                type="submit"
                aria-label="Abmelden"
                className="inline-flex items-center gap-2 border border-border px-3 py-2 text-[13px] text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Abmelden</span>
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
              aria-expanded={menuOpen}
              className="border border-border p-2 text-foreground transition-colors hover:border-primary hover:text-primary lg:hidden"
            >
              {menuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-border lg:hidden"
              aria-label="Bereichsnavigation (mobil)"
            >
              <div className="py-2">
                <NavList overviewActive={overviewActive} onNavigate={() => setMenuOpen(false)} />
                <div className="mt-2 border-t border-border/60 pt-1">
                  <MarketingLink onNavigate={() => setMenuOpen(false)} />
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <div className="flex flex-1">
        <aside className="hidden shrink-0 border-r border-border bg-card lg:block lg:w-[248px]">
          {/* Eigene Klebeposition unterhalb der 64px hohen Kopfzeile, damit die
              Navigation beim Scrollen langer Inhalte stehen bleibt. */}
          <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col justify-between py-6">
            <nav aria-label="Bereichsnavigation">
              <NavList overviewActive={overviewActive} />
            </nav>
            <MarketingLink />
          </div>
        </aside>

        <main id="inhalt" className="min-w-0 flex-1 px-5 py-10 sm:px-8 sm:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
