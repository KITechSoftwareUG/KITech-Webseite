import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

const navigation = [
  { name: "Leistungen", href: "/leistungen" },
  { name: "Haltung", href: "/haltung" },
  { name: "Referenzen", href: "/referenzen" },
  { name: "Kontakt", href: "/kontakt" },
];

const PORTAL_URL = (import.meta.env.VITE_PORTAL_URL ?? "https://app.kitech-software.de").replace(/\/$/, "");

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center" aria-label="KITech Software – Startseite">
            <img src="/logo.png" alt="KITech Software Logo" className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-light transition-colors hover:text-primary ${
                  location.pathname === item.href
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

            <a
              href={`${PORTAL_URL}/login`}
              className="hidden sm:inline-flex items-center rounded-none border border-border px-4 py-2 text-sm font-light text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Anmelden
            </a>

            <Button
              variant="hero"
              size="lg"
              className="hidden sm:flex"
              onClick={() => window.open('https://calendly.com/automatisieren-mit-kitech/30min', '_blank', 'noopener,noreferrer')}
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
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 px-4 rounded-lg text-sm font-light transition-colors ${
                    location.pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <a
                href={`${PORTAL_URL}/login`}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-none border border-border px-4 py-3 text-center text-sm font-light text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Anmelden
              </a>
              <Button
                variant="hero"
                className="mt-2"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.open('https://calendly.com/automatisieren-mit-kitech/30min', '_blank', 'noopener,noreferrer');
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
