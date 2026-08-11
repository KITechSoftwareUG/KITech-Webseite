"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Shield } from "lucide-react";
import { footerNavigation, legalNavigation } from "@/config/navigation";
import { company, addressLine } from "@/config/company";
import { SITE_CONTAINER } from "./site-container";
import { trackEvent } from "@/lib/plausible";

/**
 * Fusszeile aller Seiten — vollflaechig dunkelblau.
 *
 * Der dunkelblaue Abschluss ist ein bewusster Zug des Designs: die Seite laeuft
 * ueber weisse und hellgraue Abschnitte und endet in einem satten Farbblock.
 * Auf hellem Grund waere die Fusszeile ein weiterer grauer Abschnitt und die
 * Seite haette kein Ende, sondern hoerte einfach auf.
 *
 * Weil alles auf Dunkelblau steht, sind hier weder Border-Tokens noch
 * `text-muted-foreground` brauchbar (beide sind fuer hellen Grund gebaut) —
 * die Farben stehen deshalb als `white/xx` direkt an den Elementen.
 *
 * Aufgabe der Fusszeile bleibt unveraendert: Von jeder Seite aus muss jede
 * andere Seite erreichbar sein. Was in der Kopfzeile keinen Platz hat (Glossar,
 * Selbstcheck, Terminseite), steht hier. Die Spalten kommen aus
 * `src/config/navigation.ts`.
 */
export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className={`${SITE_CONTAINER} py-14 sm:py-16`}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] lg:gap-10">
          {/* Marke */}
          <div>
            <Link href="/" aria-label="KITech Software – Startseite" className="flex w-fit">
              <img src="/logo.png" alt="KITech Software Logo" className="h-8 w-auto" />
            </Link>

            <p className="mt-5 max-w-[320px] text-[13px] leading-[1.6] text-white/80">
              {company.tagline}
            </p>

            <div className="mt-6 flex flex-col gap-2.5 text-[13px]">
              <a
                href={`mailto:${company.email.general}`}
                onClick={() => trackEvent("Email_Klick", { position: "footer" })}
                className="inline-flex items-center gap-2 text-white/90 transition-opacity hover:opacity-75"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {company.email.general}
              </a>
              <a
                href={company.phone.href}
                onClick={() => trackEvent("Telefon_Klick", { position: "footer" })}
                className="inline-flex items-center gap-2 text-white/90 transition-opacity hover:opacity-75"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {company.phone.display}
              </a>
              <span className="inline-flex items-center gap-2 text-white/75">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {addressLine}
              </span>
            </div>

            <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-[11px] text-white/85">
              <Shield className="h-3.5 w-3.5" aria-hidden="true" />
              DSGVO-konform, gehostet in Deutschland
            </span>
          </div>

          {/* Navigationsspalten */}
          {footerNavigation.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-[11px] font-bold uppercase tracking-wide text-white">
                {column.title}
              </h2>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] leading-snug text-white/75 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Abschlusszeile: Copyright links, Rechtstexte rechts. */}
        <div className="mt-14 flex flex-col gap-4 border-t border-white/25 pt-7 text-xs text-white/75 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {company.legalName}
          </p>

          <nav aria-label="Rechtliche Links" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legalNavigation.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
            {/*
              Oeffnet den Consent-Dialog erneut. Als Event statt als Zustand im
              Footer, weil das Banner selbst (CookieConsent.tsx) ausserhalb der
              Shell im Providers-Baum haengt.
            */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("cookie-consent:open"))}
              className="transition-colors hover:text-white"
            >
              Cookie-Einstellungen
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}
