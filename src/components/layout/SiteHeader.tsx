"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { mainNavigation, type NavEntry } from "@/config/navigation";
import { SITE_CONTAINER } from "@/components/layout/site-container";

/**
 * Navigationsleiste: dunkles Navy-Band ueber die volle Breite, Logo links,
 * Navigation rechts.
 *
 * Sie laeuft bewusst im normalen Dokumentfluss mit und ist NICHT sticky — beim
 * Scrollen verschwindet sie nach oben, waehrend der dunkelblaue Ankuendigungsbalken
 * (`AnnouncementBar`) stehen bleibt. Genau so ist es vorgegeben; die uebliche
 * mitfahrende Navigation waere hier falsch.
 *
 * Vorher hatte die Kopfzeile keinen eigenen Hintergrund und sass als erste Zeile
 * im Seitencontainer auf dem dunklen Signalverlauf. Mit dem hellen Design
 * braucht sie einen eigenen dunklen Grund, sonst haengt sie im Nichts.
 *
 * Die Punkte kommen aus `src/config/navigation.ts` — dieselbe Quelle wie
 * Fusszeile, Sitemap und Routen-Test.
 *
 * Untermenues: "Warum?" fasst die beiden Funnel-Seiten zusammen, "Leistungen"
 * die beiden Zielgruppen-Seiten. Der Elternpunkt bleibt in beiden Faellen ein
 * echter Link auf eine eigene Seite — ein Menuepunkt, der nur aufklappt und
 * selbst nirgendwohin fuehrt, ist besonders auf dem Handy eine Sackgasse.
 */

/** Innenbreite der Leiste — dieselbe Kante wie der Seiteninhalt. */
const HEADER_CONTAINER = SITE_CONTAINER;

/**
 * Ist dieser Punkt (oder einer seiner Unterpunkte) die aktuelle Seite?
 *
 * Unterseiten zaehlen mit: auf `/referenzen/niimmo` bleibt "Referenzen"
 * markiert. Die Startseite ist davon ausgenommen, sonst waere sie ueberall aktiv.
 */
function istAktiv(entry: NavEntry, pathname: string): boolean {
  const trifft = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return trifft(entry.href) || (entry.children?.some((child) => trifft(child.href)) ?? false);
}

/**
 * Ein Punkt der Desktop-Leiste. Mit Unterpunkten klappt beim Ueberfahren und
 * beim Hineintabben ein Menue auf; Escape schliesst es wieder.
 */
function DesktopEntry({ entry, pathname }: { entry: NavEntry; pathname: string }) {
  const [offen, setOffen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const aktiv = istAktiv(entry, pathname);

  const schliessen = useCallback(() => setOffen(false), []);

  /**
   * Schliesst, sobald der Fokus den Punkt samt Untermenue verlaesst.
   * `relatedTarget` ist das Element, das den Fokus bekommt — liegt es noch im
   * Container, bleibt das Menue offen, damit man sich durchtabben kann.
   */
  const beiBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(event.relatedTarget as Node | null)) {
      setOffen(false);
    }
  };

  const linkKlassen = `whitespace-nowrap text-[16px] font-medium leading-[20.8px] transition-colors hover:text-white ${
    aktiv ? "text-white" : "text-white/80"
  }`;

  if (!entry.children?.length) {
    return (
      <Link href={entry.href} className={linkKlassen}>
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
        className={`inline-flex items-center gap-1.5 ${linkKlassen}`}
      >
        {entry.label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${offen ? "rotate-180" : ""}`}
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
            /* `pt-4` erzeugt eine unsichtbare Bruecke zwischen Link und Kasten:
               ohne sie verlaesst die Maus auf dem Weg nach unten kurz den
               Container und das Menue klappt genau dann zu, wenn man es
               anklicken will. */
            className="absolute left-0 top-full z-50 pt-4"
          >
            {/* Weisses Menue auf dunkler Leiste — wie die Seite darunter. */}
            <div className="w-[320px] overflow-hidden rounded-lg bg-white shadow-elevated">
              {entry.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={schliessen}
                  className={`block border-b border-border px-5 py-3.5 transition-colors last:border-b-0 hover:bg-surface ${
                    pathname === child.href ? "bg-surface" : ""
                  }`}
                >
                  <span className="block text-[14px] font-semibold leading-snug text-foreground">
                    {child.label}
                  </span>
                  {child.description && (
                    <span className="mt-1 block text-[12px] font-normal leading-snug text-muted-foreground">
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
 * Ein Punkt im mobilen Menue. Hier stehen Link und Aufklapp-Knopf getrennt
 * nebeneinander — auf dem Handy ist Platz fuer zwei Tippziele, und ein Link, der
 * beim Antippen nur aufklappt statt zu navigieren, ueberrascht.
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
  /** Untermenue der aktuellen Seite startet offen — der Kontext ist dann sichtbar. */
  const [offen, setOffen] = useState(aktiv);

  return (
    <div className="border-b border-white/12 last:border-b-0">
      <div className="flex items-center justify-between">
        <Link
          href={entry.href}
          onClick={onNavigate}
          className={`flex-1 py-3.5 text-[16px] font-medium transition-colors hover:text-white ${
            aktiv ? "text-white" : "text-white/85"
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
            className="p-3 text-white/70 transition-colors hover:text-white"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${offen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>

      {entry.children?.length && offen ? (
        <div className="border-l border-white/20 pb-3 pl-4">
          {entry.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className={`block py-2.5 text-[14px] font-normal leading-snug transition-colors hover:text-white ${
                pathname === child.href ? "text-white" : "text-white/70"
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

  /** Menue schliessen, wenn die Route wechselt — sonst bleibt es offen. */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className={`relative z-40 w-full bg-navbar text-navbar-foreground ${className ?? ""}`}>
      <div className={HEADER_CONTAINER}>
        <div className="flex h-[76px] items-center justify-between gap-6 dt:h-[65px]">
          <Link href="/" aria-label="KITech Software – Startseite" className="flex shrink-0">
            {/*
              Höhe aus der Vorlage: dort ist die Wortmarke am Desktop 19 px hoch,
              auf dem Handy 26 px. Unsere Logodatei hat oben und unten je rund
              3 px Weißraum, die Glyphen füllen also gut vier Fünftel der
              angegebenen Höhe — 24 px bzw. 32 px CSS treffen die Vorlage.

              Vorher stand hier h-10/dt:h-8. Die Wortmarke war damit ein Drittel
              größer als in der Vorlage und ließ die Navigationsleiste optisch
              schwerer wirken, obwohl beide Leisten exakt gleich hoch sind.
            */}
            <img src="/logo-weiss.svg" alt="KITech Software Logo" className="h-8 w-auto dt:h-6" />
          </Link>

          {/* Ab 1025 px volle Leiste, darunter Hamburger — derselbe Punkt,
              an dem die Vorlage umschaltet (gemessen). Abstand zwischen den
              Punkten ebenfalls gemessen: 21 px. */}
          <nav className="hidden items-center gap-[21px] dt:flex" aria-label="Hauptnavigation">
            {mainNavigation.map((entry) => (
              <DesktopEntry key={entry.href} entry={entry} pathname={pathname} />
            ))}
          </nav>

          <button
            type="button"
            className="-mr-2 p-2 text-white dt:hidden"
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
              className="overflow-hidden dt:hidden"
              aria-label="Hauptnavigation (mobil)"
            >
              <div className="flex flex-col border-t border-white/12 pb-4 pt-1">
                {mainNavigation.map((entry) => (
                  <MobileEntry
                    key={entry.href}
                    entry={entry}
                    pathname={pathname}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
