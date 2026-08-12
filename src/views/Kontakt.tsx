"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Clock, ArrowRight, Linkedin } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { PageHeading } from "@/components/sections/PageHeading";
import {
  StructuredData,
  getWebPageSchema,
  getBreadcrumbSchema,
  getLocalBusinessSchema,
  getContactPageSchema,
  getFounderPersonSchema,
} from "@/components/seo/StructuredData";
import { company, addressLine } from "@/config/company";
import { BASE_URL } from "@/lib/metadata";
import { trackEvent } from "@/lib/plausible";

/**
 * `/kontakt` — die Wege zu einem Menschen, ohne Formularschleife.
 *
 * Bewusst OHNE Kontaktformular: der Weg, den wir wollen, ist der Termin im
 * Kalender (`/lass-uns-reden`), und wer lieber schreibt, schreibt direkt eine
 * E-Mail. Ein Formular dazwischen sammelt nur Nachrichten ein, auf die dann
 * jemand antworten muss — es ist ein zusätzlicher Umweg, kein Kontaktweg.
 *
 * Alle Daten kommen aus `src/config/company.ts`. Vorher standen Telefonnummern
 * und Adressen über mehrere Dateien verteilt, mit zwei verschiedenen Nummern
 * nebeneinander.
 */

const kontaktwege = [
  {
    icon: Mail,
    label: "E-Mail",
    value: company.email.general,
    href: `mailto:${company.email.general}`,
    event: "Email_Klick" as const,
  },
  {
    icon: Phone,
    label: "Telefon",
    value: company.phone.display,
    href: company.phone.href,
    event: "Telefon_Klick" as const,
  },
  {
    icon: MapPin,
    label: "Standort",
    value: addressLine,
    href: null,
    event: null,
  },
  {
    icon: Clock,
    label: "Erreichbar",
    value: company.availability,
    href: null,
    event: null,
  },
];

export default function Kontakt() {
  return (
    <PageShell>
      <StructuredData
        data={[
          getWebPageSchema(
            "Kontakt",
            "Kostenlosen 1:1-KI-Check sichern oder direkt schreiben — KITech Software aus Hannover.",
            `${BASE_URL}/kontakt`
          ),
          getBreadcrumbSchema([
            { name: "Startseite", url: `${BASE_URL}/` },
            { name: "Kontakt", url: `${BASE_URL}/kontakt` },
          ]),
          getLocalBusinessSchema(),
          getContactPageSchema(),
          getFounderPersonSchema(),
        ]}
      />

      <PageHeading
        title="Direkt an den Tisch, nicht ins Formular."
        lead="Dreißig Minuten im Kalender, eine E-Mail oder ein Anruf — such dir aus, was dir lieber ist."
      />

      <section className={`${SITE_CONTAINER} py-14 sm:py-16`} aria-labelledby="wege">
        <h2 id="wege" className="sr-only">
          Kontaktwege
        </h2>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-14">
          {/* Kontaktdaten als Raster mit Trennlinien (gap-px auf Border-Grund) —
              dieselbe Bauweise wie die Zusagen-Liste auf /haltung. */}
          <ul className="grid h-fit gap-px border border-border bg-border sm:grid-cols-2">
            {kontaktwege.map((weg) => {
              const inhalt = (
                <>
                  <span className="flex items-center gap-2 text-mini uppercase tracking-wide text-muted-foreground">
                    <weg.icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    {weg.label}
                  </span>
                  <span className="mt-3 block text-[15px] font-medium leading-snug text-foreground">
                    {weg.value}
                  </span>
                </>
              );

              return (
                <li key={weg.label} className="bg-background">
                  {weg.href ? (
                    <a
                      href={weg.href}
                      onClick={() => weg.event && trackEvent(weg.event, { position: "kontakt" })}
                      className="block h-full p-6 transition-colors hover:bg-foreground/[0.03]"
                    >
                      {inhalt}
                    </a>
                  ) : (
                    <div className="h-full p-6">{inhalt}</div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Der Weg, den wir wollen: Termin im Kalender. Steht als eigener Block
              rechts, damit er nicht als fünfte Kachel unter den Kontaktdaten
              verschwindet. */}
          <div className="border border-border bg-background/40 p-7 sm:p-8">
            <h3 className="kinetic-display text-balance text-h4 leading-[1.15] text-foreground sm:text-h3">
              Kostenloser 1:1-KI-Check
            </h3>
            <p className="mt-4 text-pretty text-fliess leading-[1.6] text-muted-foreground">
              Wir sehen uns einen eurer Prozesse an und rechnen durch, was Automatisierung
              dort bringt. Kein Verkaufsgespräch — am Ende steht eine Einschätzung, auch
              wenn sie „lohnt sich nicht“ lautet.
            </p>

            <Link
              href="/lass-uns-reden"
              onClick={() => trackEvent("Calendly_Klick", { position: "kontakt-seite" })}
              className="mt-7 inline-flex h-[56px] w-full items-center justify-between gap-4 bg-primary px-6 text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <span className="flex flex-col text-left">
                <span className="text-fliess font-semibold leading-tight">Termin auswählen</span>
                <span className="mt-1 text-mini leading-tight text-primary-foreground/58">
                  30 Minuten, unverbindlich
                </span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </Link>

            {/* Direkter Draht zum Gründer — bewusst getrennt von der allgemeinen
                Adresse oben, damit klar ist, wen man hier erreicht. */}
            <div className="mt-7 border-t border-border/60 pt-6">
              <p className="text-mini uppercase tracking-wide text-muted-foreground">
                Direkt zu {company.founder.name}
              </p>
              <div className="mt-3 flex flex-col gap-2.5 text-fliess">
                <a
                  href={`mailto:${company.email.founder}`}
                  onClick={() => trackEvent("Email_Klick", { position: "kontakt-gruender" })}
                  className="inline-flex items-center gap-2 text-foreground/85 transition-colors hover:text-primary"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  {company.email.founder}
                </a>
                <a
                  href={company.mobile.href}
                  onClick={() => trackEvent("Telefon_Klick", { position: "kontakt-gruender" })}
                  className="inline-flex items-center gap-2 text-foreground/85 transition-colors hover:text-primary"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  {company.mobile.display}
                </a>
                <a
                  href={company.founder.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-foreground/85 transition-colors hover:text-primary"
                >
                  <Linkedin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 text-fliess leading-[1.6] text-muted-foreground">
          Bewerbungen laufen nicht hierüber, sondern über die{" "}
          <Link href="/karriere" className="text-foreground underline underline-offset-4 hover:text-primary">
            offenen Stellen
          </Link>
          .
        </p>
      </section>
    </PageShell>
  );
}
