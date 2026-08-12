"use client";

import Link from "next/link";
import { footerNavigation, legalNavigation } from "@/config/navigation";
import { company, addressLine } from "@/config/company";
import { SITE_CONTAINER } from "./site-container";

/**
 * Fusszeile aller Seiten — vollflaechig in der Signalfarbe.
 *
 * Aufbau aus der Design-Vorlage uebernommen (referenz_desktop.png / _mobile.png):
 *
 *   Zeile 1  Logo links, Navigation horizontal daneben
 *   Zeile 2  Rechtstexte zentriert
 *   Zeile 3  kleiner, zentrierter Schlussblock
 *
 * Vorher stand hier ein Raster aus vier Spalten mit Ueberschriften, Kontaktblock
 * und einem Siegel — das hat die Vorlage nicht. Sie loest die Fusszeile als
 * flache, zentrierte Zeilenfolge; entsprechend sind Spaltenueberschriften und
 * Siegel entfallen.
 *
 * **Alle Links bleiben erhalten.** Die Fusszeile ist der einzige Ort, an dem
 * Glossar, Selbstcheck und Terminseite verlinkt sind — der Routen-Test besteht
 * darauf, dass jede oeffentliche Route von irgendwo erreichbar ist. Statt in
 * Spalten stehen sie jetzt in einer umbrechenden Zeile.
 *
 * Die Firmenangaben (Anschrift, Telefon, E-Mail) haben in der Vorlage keine
 * Entsprechung — dort steht an dieser Stelle ein langer Haftungsausschluss. Sie
 * bleiben trotzdem: fuer ein deutsches Unternehmen gehoeren sie in den Fuss.
 *
 * Weil alles auf der Signalfarbe steht, sind weder Border-Tokens noch
 * `text-muted-foreground` brauchbar (beide sind fuer hellen Grund gebaut) — die
 * Farben stehen deshalb als `white/xx` direkt an den Elementen.
 */

/** Alle Fusszeilen-Links in einer flachen Liste, Reihenfolge wie in der Konfiguration. */
const alleLinks = footerNavigation.flatMap((spalte) => spalte.links);

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className={`${SITE_CONTAINER} pb-[25px] pt-[35px] dt:pb-[35px]`}>
        {/* Zeile 1: Logo und Navigation */}
        <div className="flex flex-col items-center gap-6 dt:flex-row dt:items-center dt:justify-between dt:gap-10">
          <Link href="/" aria-label="KITech Software – Startseite" className="flex shrink-0">
            <img
              src="/logo-weiss.svg"
              alt="KITech Software Logo"
              className="h-9 w-auto dt:h-8"
            />
          </Link>

          <nav
            aria-label="Fußzeilen-Navigation"
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
          >
            {alleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-fliess font-normal text-white/90 transition-opacity hover:opacity-75"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Zeile 2: Rechtstexte, zentriert */}
        <nav
          aria-label="Rechtliche Links"
          className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          {legalNavigation.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-fliess font-normal text-white transition-opacity hover:opacity-75"
            >
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
            className="text-fliess font-normal text-white transition-opacity hover:opacity-75"
          >
            Cookie-Einstellungen
          </button>
        </nav>

        {/* Zeile 3: Schlussblock. In der Vorlage steht hier ein langer, klein
            gesetzter Haftungstext; bei uns die Firmenangaben und das Copyright. */}
        <p className="mt-6 text-center text-mini leading-[1.6] text-white/75">
          {company.legalName} · {addressLine} ·{" "}
          <a href={company.phone.href} className="transition-opacity hover:opacity-75">
            {company.phone.display}
          </a>{" "}
          ·{" "}
          <a
            href={`mailto:${company.email.general}`}
            className="transition-opacity hover:opacity-75"
          >
            {company.email.general}
          </a>
          <br />© {new Date().getFullYear()} Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  );
}
