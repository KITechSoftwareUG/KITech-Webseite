"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SignalField } from "@/components/canvas/SignalField";
import {
  StructuredData,
  getWebPageSchema,
  getBreadcrumbSchema,
} from "@/components/seo/StructuredData";
import { ReferenceCard } from "@/components/sections/ReferenceCard";
import { ReferenceCta } from "@/components/sections/ReferenceCta";
import { clientResults } from "@/data/client-results";

const legalLinks = [
  { name: "Impressum", href: "/impressum" },
  { name: "Datenschutz", href: "/datenschutz" },
  { name: "AGB", href: "/agb" },
];

/**
 * Referenz-Übersicht: Headline, zwei Kennzahl-Kacheln, darunter das Kartenraster.
 *
 * Kein Rechteck-Label und kein Erklärabsatz im Kopfbereich — die Abfolge
 * Label -> Headline -> Fließtext ist als Sektionsaufbau ausdrücklich raus.
 *
 * Die Einordnung, dass die Fälle hier eine Auswahl aus über 50 abgeschlossenen
 * Projekten sind und nicht das Gesamtwerk, trägt jetzt das Kachel-Paar: 50+
 * gegen die Anzahl der Detailfälle. Diese Information darf nicht verschwinden —
 * sonst liest sich die Seite wie das gesamte Werk und verkauft die Firma unter Wert.
 *
 * Alle Inhalte kommen aus `src/data/client-results.ts`. Hier wird nichts ergänzt,
 * gerundet oder ausgeschmückt.
 */
export default function Referenzen() {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <StructuredData
        data={[
          getWebPageSchema(
            "Referenzen",
            "Sechs Kundenfälle mit Zahlen: was gebaut wurde und was es dem Unternehmen gebracht hat.",
            "https://kitech-software.de/referenzen"
          ),
          getBreadcrumbSchema([
            { name: "Startseite", url: "https://kitech-software.de/" },
            { name: "Referenzen", url: "https://kitech-software.de/referenzen" },
          ]),
        ]}
      />

      {/* Signal-Hintergrund wie auf Startseite und Terminseite: nur im Kopfbereich,
          darunter blendet er in den Seitenhintergrund ab, damit die Karten ruhig sitzen. */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[620px]" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(112deg, hsl(245 55% 12%) 0%, hsl(243 45% 9%) 46%, hsl(0 0% 5%) 100%)",
          }}
        />
        <SignalField density={0.45} intensity={0.45} baseColor="--primary" accentColor="--accent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      <SiteHeader className="relative mx-auto w-full max-w-[1180px] px-5 pt-7 sm:px-8" />

      <main className="relative flex-1">
        <section className="mx-auto max-w-[1180px] px-5 pb-4 pt-14 sm:px-8 sm:pt-20">
          <h1 className="kinetic-display kinetic-morph-in max-w-[820px] text-balance text-[34px] leading-[1.1] text-foreground sm:text-[48px]">
            Sechs Fälle, bei denen die Zahl für sich spricht.
          </h1>

          {/* Zwei harte Kacheln statt eines Erklärabsatzes: 50+ gegen die Anzahl der
              Detailfälle sagt "Auswahl, nicht Gesamtwerk" ohne einen Satz Fließtext.
              Die zweite Zahl kommt direkt aus der Datendatei und kann deshalb nicht
              auseinanderlaufen, wenn Fälle dazukommen. */}
          <div className="mt-9 grid max-w-[520px] grid-cols-2 gap-5">
            <div className="flex min-h-[150px] flex-col items-center justify-center bg-foreground px-5 text-center text-background">
              <p className="kinetic-data text-[38px] font-light leading-none">50+</p>
              <p className="mt-3 max-w-[170px] text-[14px] font-semibold leading-[1.25]">
                Projekte abgeschlossen
              </p>
            </div>
            <div className="flex min-h-[150px] flex-col items-center justify-center border border-border px-5 text-center">
              <p className="kinetic-data text-[38px] font-light leading-none text-foreground">
                {clientResults.length}
              </p>
              {/* "davon" statt "Fälle im Detail": stellt den Bezug zur 50+-Kachel
                  daneben her — das war vorher die Aussage des gestrichenen Absatzes. */}
              <p className="mt-3 max-w-[170px] text-[14px] font-semibold leading-[1.25] text-foreground">
                davon hier im Detail
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-5 pb-20 pt-14 sm:px-8 sm:pb-28">
          <h2 className="sr-only">Alle Kundenfälle</h2>
          <div className="grid gap-7 sm:grid-cols-2">
            {clientResults.map((result) => (
              <ReferenceCard key={result.slug} result={result} />
            ))}
          </div>
        </section>

        <ReferenceCta position="referenzen-uebersicht" />
      </main>

      <footer className="border-t border-border py-6">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-3 px-5 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} KITech Software UG (haftungsbeschränkt).</p>
          <nav aria-label="Rechtliche Links" className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <Link key={link.name} href={link.href} className="transition-colors hover:text-primary">
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
