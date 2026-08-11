"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { legalNavigation } from "@/config/navigation";
import { SITE_CONTAINER } from "./site-container";
import { trackEvent } from "@/lib/plausible";

/**
 * Rahmen fuer eigenstaendige Werkzeuge — bewusst ohne Marke.
 *
 * Anders als `PageShell` traegt diese Huelle kein Logo, keinen Firmennamen,
 * keine Hauptnavigation und keinen Ankuendigungsbalken. Der Check soll als
 * eigenes Werkzeug gelesen werden und nicht als Unterseite einer Agentur: wer
 * ihn geteilt bekommt, sieht zuerst die Sache, nicht den Absender.
 *
 * Was trotzdem bleibt, bleibt aus einem Grund:
 *
 *   - **Impressum und Datenschutz.** Die Anbieterkennzeichnung ist nach § 5 DDG
 *     Pflicht und muss von jeder oeffentlich erreichbaren Seite aus ohne Umweg
 *     erreichbar sein. Der Firmenname steht dann dort — nicht hier.
 *   - **Cookie-Einstellungen.** Dieselbe Pflicht wie auf jeder anderen Seite;
 *     das Banner haengt ohnehin im Providers-Baum darueber.
 *
 * Wer die Marke hier wieder einbaut (Logo in die Leiste, Fusszeile der
 * Hauptseite), nimmt der Seite genau die Eigenschaft, fuer die sie gebaut ist.
 */

/** Verweis oben rechts auf ein verwandtes Werkzeug unter eigener Adresse. */
export interface CheckShellLink {
  /** Vollstaendige externe Adresse, inklusive Schema. */
  href: string;
  /** Beschriftung ab `sm`. */
  label: string;
  /** Kurzform darunter, damit die Leiste auf dem Handy nicht umbricht. */
  shortLabel: string;
  /** Wert fuer `position` im Plausible-Event. */
  trackingPosition: string;
}

export function CheckShell({
  /** Wortmarke des Werkzeugs links in der Leiste — nicht der Firmenname. */
  title,
  /** Verweis oben rechts. Ohne Angabe bleibt die rechte Seite leer. */
  link,
  /** Kleingedrucktes links in der Fusszeile. */
  note,
  children,
}: {
  title: string;
  link?: CheckShellLink;
  note?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      {/*
       * Dieselbe Hoehe und Innenbreite wie die Navigationsleiste der Hauptseite,
       * damit der Check nicht wie eine fremde Baustelle wirkt — nur eben ohne
       * Logo und ohne Menue.
       */}
      <header className="relative z-40 w-full bg-navbar text-navbar-foreground">
        <div className={SITE_CONTAINER}>
          <div className="flex h-[65px] items-center justify-between gap-4">
            <span className="min-w-0 truncate text-[14px] font-medium leading-tight text-white sm:text-[16px]">
              {title}
            </span>

            {link && (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("CTA_Klick", { position: link.trackingPosition })}
                /*
                 * Neues Fenster mit Absicht: die Antworten des Checks stehen nur
                 * im Speicher der Seite. Wer hier wegnavigiert und zurueckkommt,
                 * faengt sonst von vorn an.
                 */
                className="group inline-flex shrink-0 items-center gap-2 border border-white/40 px-3 py-2 text-[12px] font-medium leading-tight text-white transition-colors hover:bg-white hover:text-navbar focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-4 sm:text-[13px]"
              >
                <span className="sm:hidden">{link.shortLabel}</span>
                <span className="hidden sm:inline">{link.label}</span>
                <ArrowUpRight
                  className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* `grid place-items-center`: der jeweils aktive Schritt sitzt mittig im
          verbleibenden Raum, statt oben zu kleben und unten Leere zu lassen. */}
      <main className="relative grid flex-1 place-items-center">{children}</main>

      <footer className="border-t border-border bg-surface">
        <div
          className={`${SITE_CONTAINER} flex flex-col gap-4 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between`}
        >
          {note && <p className="max-w-xl leading-relaxed">{note}</p>}

          <nav
            aria-label="Rechtliche Links"
            className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:justify-end"
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
            {/* Oeffnet den Consent-Dialog erneut — als Event, weil das Banner
                ausserhalb dieser Huelle im Providers-Baum haengt. */}
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
