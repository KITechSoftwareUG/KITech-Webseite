"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, Terminal, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { trackEvent } from "@/lib/plausible";

const navigation = [
  { name: "Leistungen", href: "/leistungen" },
  { name: "Haltung", href: "/haltung" },
  { name: "Referenzen", href: "/referenzen" },
  { name: "Kontakt", href: "/kontakt" },
];

/**
 * Der Mitgliederbereich ist noch nicht freigeschaltet — siehe SiteHeader.tsx.
 * Statt eines Links steht hier ein Schloss.
 */

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center" aria-label="KITech Software – Startseite">
            <img src="/logo.png" alt="KITech Software Logo" className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-light transition-colors hover:text-primary ${
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Theme umschalten"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            <span
              className="hidden items-center gap-2 rounded-none border border-border/60 px-4 py-2 text-sm font-light text-foreground/45 sm:inline-flex"
              aria-label="Mitgliederbereich – in Arbeit, noch nicht freigeschaltet"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              Mitgliederbereich
            </span>

            <Button
              variant="hero"
              size="lg"
              className="hidden sm:flex"
              onClick={() => {
                trackEvent("Calendly_Klick", { position: "header-desktop" });
                router.push("/lass-uns-reden");
              }}
            >
              Erstgespräch vereinbaren
            </Button>

            <button
              className="lg:hidden p-2"
              aria-label="Menü öffnen"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-background"
          >
            <nav className="container py-4 flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 px-4 rounded-lg text-sm font-light transition-colors ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <span
                className="flex items-center justify-center gap-2 rounded-none border border-border/60 px-4 py-3 text-center text-sm font-light text-foreground/45"
                aria-label="Mitgliederbereich – in Arbeit, noch nicht freigeschaltet"
              >
                <Lock className="h-4 w-4" aria-hidden="true" />
                Mitgliederbereich
              </span>
              <Button
                variant="hero"
                className="mt-2"
                onClick={() => {
                  setMobileMenuOpen(false);
                  trackEvent("Calendly_Klick", { position: "header-mobile" });
                  router.push("/lass-uns-reden");
                }}
              >
                Erstgespräch vereinbaren
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
