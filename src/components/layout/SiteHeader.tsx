"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Lock, ChevronDown } from "lucide-react";
import { mainNavigation, type NavEntry } from "@/config/navigation";
import { SITE_CONTAINER } from "./site-container";

/**
 * Kopfzeile aller Seiten: Logo links, Navigation rechts.
 *
 * Bewusst NICHT sticky und ohne eigenen Hintergrund — sie sitzt als erste Zeile
 * direkt im Seitencontainer, damit das Logo genau dort bleibt, wo es im
 * Hero-Layout schon war. Das `className`-Prop überschreibt die Containerbreite
 * nur noch in Ausnahmefällen; der Normalfall ist `SITE_CONTAINER`, damit das
 * Logo beim Seitenwechsel nicht springt.
 *
 * Die Punkte kommen aus `src/config/navigation.ts` — dieselbe Quelle wie
 * Fußzeile, Sitemap und Routen-Test.
 *
 * Untermenüs (Stand 05.08.2026): "Warum?" fasst die beiden Funnel-Seiten
 * zusammen, "Leistungen" die beiden Zielgruppen-Seiten. Vorher standen die
 * vollen Titel beider Funnel-Seiten nebeneinander in der Leiste und haben sie
 * allein gefüllt — Referenzen, Haltung, Karriere und Kontakt hatten keinen Platz
 * und waren über die Kopfzeile schlicht nicht erreichbar.
 *
 * Der Elternpunkt bleibt in beiden Fällen ein echter Link auf eine eigene Seite.
 * Ein Menüpunkt, der nur aufklappt und selbst nirgendwohin führt, ist besonders
 * auf dem Handy eine Sackgasse.
 */

/**
 * Der Mitgliederbereich ist gebaut, aber bewusst noch NICHT freigeschaltet:
 * LogTo hat noch kein TLS, und ob der Bereich am Ende selbst gebaut wird oder
 * über Skool läuft, ist offen. Bis dahin steht hier ein Schloss statt eines
 * Links — es zeigt, dass es ihn geben wird, ohne ein Versprechen einzulösen,
 * das noch nicht eingelöst werden kann.
 *
 * Zum Freischalten: dieses Element wieder durch einen `<a>` auf
 * `${NEXT_PUBLIC_APP_URL}/auth/login` ersetzen (der Code dafür liegt unter
 * `src/app/app/`).
 */
function LoginSchloss({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 border border-border/60 whitespace-nowrap px-3 py-2 text-[12px] font-medium text-foreground/45 ${className}`}
      aria-label="Mitgliederbereich – in Arbeit, noch nicht freigeschaltet"
    >
      <Lock className="h-3.5 w-3.5" aria-hidden="true" />
      Mitgliederbereich
      <span className="kinetic-data border border-border/60 px-1.5 py-0.5 text-[9px] uppercase leading-none text-foreground/40">
        bald
      </span>
    </span>
  );
}

/**
 * Ist dieser Punkt (oder einer seiner Unterpunkte) die aktuelle Seite?
 *
 * Unterseiten zählen mit: auf `/referenzen/niimmo` bleibt "Referenzen" markiert.
 * Die Startseite ist davon ausgenommen, sonst wäre sie auf jeder Seite aktiv.
 */
function istAktiv(entry: NavEntry, pathname: string): boolean {
  const trifft = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return trifft(entry.href) || (entry.children?.some((child) => trifft(child.href)) ?? false);
}

/**
 * Ein Punkt der Desktop-Leiste. Mit Unterpunkten klappt beim Überfahren und beim
 * Hineintabben ein Menü auf; Escape schließt es wieder.
 *
 * Kein separater Aufklapp-Knopf neben dem Link: bei 12px Schriftgröße stünden
 * dann zwei Klickziele im Abstand weniger Pixel nebeneinander. Stattdessen
 * öffnet der Link selbst per Hover/Fokus und bleibt gleichzeitig ein Link.
 */
function DesktopEntry({ entry, pathname }: { entry: NavEntry; pathname: string }) {
  const [offen, setOffen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const aktiv = istAktiv(entry, pathname);

  const schliessen = useCallback(() => setOffen(false), []);

  /**
   * Schließt, sobald der Fokus den Punkt samt Untermenü verlässt. `relatedTarget`
   * ist das Element, das den Fokus bekommt — liegt es noch im Container, bleibt
   * das Menü offen, damit man sich durchtabben kann.
   */
  const beiBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(event.relatedTarget as Node | null)) {
      setOffen(false);
    }
  };

  if (!entry.children?.length) {
    return (
      <Link
        href={entry.href}
        className={`whitespace-nowrap text-[12px] transition-colors hover:text-foreground ${
          aktiv ? "text-foreground" : "text-foreground/62"
        }`}
      >
        {entry.label}
      </Link>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOffen(true)}
      onMouseLeave={schliessen}
      onFocus={() => setOffen(true)}
      onBlur={beiBlur}
      onKeyDown={(event) => {
        if (event.key === "Escape") schliessen();
      }}
    >
      <Link
        href={entry.href}
        aria-haspopup="true"
        aria-expanded={offen}
        className={`inline-flex items-center gap-1 whitespace-nowrap text-[12px] transition-colors hover:text-foreground ${
          aktiv ? "text-foreground" : "text-foreground/62"
        }`}
      >
        {entry.label}
        <ChevronDown
          className={`h-3 w-3 transition-transform ${offen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </Link>

      <AnimatePresence>
        {offen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            /* `pt-3` erzeugt eine unsichtbare Brücke zwischen Link und Kasten:
               ohne sie verlässt die Maus auf dem Weg nach unten kurz den
               Container und das Menü klappt genau dann zu, wenn man es anklicken
               will. */
            className="absolute left-0 top-full z-50 pt-3"
          >
            <div className="w-[300px] border border-border bg-background shadow-elevated">
              {entry.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={schliessen}
                  className={`block border-b border-border/60 px-4 py-3 transition-colors last:border-b-0 hover:bg-foreground/5 ${
                    pathname === child.href ? "bg-foreground/5" : ""
                  }`}
                >
                  <span className="block text-[13px] leading-snug text-foreground">
                    {child.label}
                  </span>
                  {child.description && (
                    <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                      {child.description}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Ein Punkt im mobilen Menü. Hier stehen Link und Aufklapp-Knopf getrennt
 * nebeneinander — auf dem Handy ist genug Platz für zwei getrennte Tippziele,
 * und ein Link, der beim Antippen nur aufklappt statt zu navigieren, überrascht.
 */
function MobileEntry({
  entry,
  pathname,
  onNavigate,
}: {
  entry: NavEntry;
  pathname: string;
  onNavigate: () => void;
}) {
  const aktiv = istAktiv(entry, pathname);
  /** Untermenü der aktuellen Seite startet offen — der Kontext ist dann sichtbar. */
  const [offen, setOffen] = useState(aktiv);

  return (
    <div className="border-b border-border/40 last:border-b-0">
      <div className="flex items-center justify-between">
        <Link
          href={entry.href}
          onClick={onNavigate}
          className={`flex-1 py-3 text-[15px] transition-colors hover:text-foreground ${
            aktiv ? "text-foreground" : "text-foreground/82"
          }`}
        >
          {entry.label}
        </Link>

        {entry.children?.length ? (
          <button
            type="button"
            onClick={() => setOffen((wert) => !wert)}
            aria-expanded={offen}
            aria-label={`Unterpunkte von ${entry.label} ${offen ? "einklappen" : "ausklappen"}`}
            className="p-3 text-foreground/62 transition-colors hover:text-foreground"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${offen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>

      {entry.children?.length && offen ? (
        <div className="border-l border-border/60 pb-3 pl-4">
          {entry.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className={`block py-2.5 text-[13px] leading-snug transition-colors hover:text-foreground ${
                pathname === child.href ? "text-foreground" : "text-foreground/68"
              }`}
            >
              {child.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SiteHeader({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  /** Menü schließen, wenn die Route wechselt — sonst bleibt es über den Seitenwechsel offen. */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className={className ?? `${SITE_CONTAINER} pt-7`}>
      <div className="flex items-center justify-between gap-6">
        <Link href="/" aria-label="KITech Software – Startseite" className="flex shrink-0">
          <img src="/logo.png" alt="KITech Software Logo" className="h-8 w-auto sm:h-9" />
        </Link>

        {/* Ab `lg` (1024px) passt die volle Leiste: sieben kurze Punkte plus
            Schloss. Vorher brauchte sie `xl`, weil zwei ganze Satz-Titel darin
            standen. */}
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Hauptnavigation">
          {mainNavigation.map((entry) => (
            <DesktopEntry key={entry.href} entry={entry} pathname={pathname} />
          ))}
          <LoginSchloss />
        </nav>

        <button
          type="button"
          className="p-2 text-foreground lg:hidden"
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden lg:hidden"
            aria-label="Hauptnavigation (mobil)"
          >
            <div className="mt-6 flex flex-col border-t border-border/60 pt-2">
              {mainNavigation.map((entry) => (
                <MobileEntry
                  key={entry.href}
                  entry={entry}
                  pathname={pathname}
                  onNavigate={() => setOpen(false)}
                />
              ))}
              <LoginSchloss className="mt-4 justify-between px-4 py-3 text-[15px]" />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
