"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Lock } from "lucide-react";

/**
 * Kopfzeile der neu gebauten Seiten: Logo links, Navigation rechts.
 *
 * Bewusst NICHT sticky und ohne eigenen Hintergrund — sie sitzt als erste Zeile
 * direkt im Seitencontainer, damit das Logo genau dort bleibt, wo es im Hero-Layout
 * schon war. Deshalb auch das `className`-Prop: jede Seite gibt ihre eigene
 * Container-Breite und ihr Padding mit.
 *
 * Der ältere `Header.tsx` (sticky, mit Theme-Toggle) gehört zu den Alt-Seiten über
 * `Layout.tsx` und bleibt unangetastet.
 */

/**
 * Die beiden Funnel-Links tragen den vollen Seitentitel, nicht ein neutrales Label
 * wie "Für Selbstständige" — der Satz selbst ist der Haken.
 *
 * Weil das breit baut, klappt die Kopfzeile erst ab `xl` (1280px) auf die
 * horizontale Leiste auf; darunter greift das Menü.
 */
const navigation = [
  { name: "Warum du mit KI kein Geld verdienst", href: "/warum-du-mit-ki-kein-geld-verdienst" },
  { name: "Warum Unternehmen mit KI kein Geld verdienen", href: "/warum-unternehmen-mit-ki-kein-geld-verdienen" },
  { name: "Referenzen", href: "/referenzen" },
  { name: "Community", href: "/community" },
];

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

export function SiteHeader({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-6">
        <Link href="/" aria-label="KITech Software – Startseite" className="flex shrink-0">
          <img src="/logo.png" alt="KITech Software Logo" className="h-8 w-auto sm:h-9" />
        </Link>

        <nav className="hidden items-center gap-5 xl:flex" aria-label="Hauptnavigation">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`whitespace-nowrap text-[12px] transition-colors hover:text-foreground ${
                pathname === item.href ? "text-foreground" : "text-foreground/62"
              }`}
            >
              {item.name}
            </Link>
          ))}

          <LoginSchloss />
        </nav>

        <button
          type="button"
          className="p-2 text-foreground xl:hidden"
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
            className="overflow-hidden xl:hidden"
            aria-label="Hauptnavigation (mobil)"
          >
            <div className="mt-6 flex flex-col gap-1 border-t border-border/60 pt-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="py-3 text-[15px] text-foreground/82 transition-colors hover:text-foreground"
                >
                  {item.name}
                </Link>
              ))}
              <LoginSchloss className="mt-3 justify-between px-4 py-3 text-[15px]" />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
