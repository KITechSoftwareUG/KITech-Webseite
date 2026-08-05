import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";

/**
 * Layout des eingeloggten Bereichs (`app.kitech-software.de`, intern `/app`).
 *
 * Bewusst ohne `cookies()`/`headers()` im Layout selbst: die Session prüft der
 * Auth-Guard in den einzelnen Seiten.
 *
 * `buildMetadata()` ist hier absichtlich nicht im Einsatz: das schreibt Canonical
 * und OpenGraph für die öffentlichen Marketing-Seiten. Der Bereich hinter dem
 * Login hat weder das eine noch das andere nötig, sondern nur ein hartes
 * noindex/nofollow — er gehört nicht in den Suchindex.
 */

/**
 * ZWINGEND für den gesamten Bereich, nicht optional.
 *
 * Ohne diese Zeile rendert Next.js die Seiten beim Build vor. Zur Build-Zeit gibt
 * es keine Session (und keine LOGTO_-Variablen), der Guard schlägt an und leitet
 * auf /auth/login um — und genau diese Weiterleitung wird als statisches HTML
 * eingefroren. Ergebnis: Der Bereich wäre auch nach erfolgreichem Login nie
 * erreichbar, weil die ausgelieferte Seite immer die eingefrorene Umleitung ist.
 *
 * Im Layout statt in jeder einzelnen Seite, damit der Fehler bei neuen Seiten
 * nicht wieder auftreten kann. Die Marketing-Routen sind davon nicht betroffen —
 * `dynamic` wirkt nur auf diesen Teilbaum.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "KITech Bereich",
    template: "%s · KITech Bereich",
  },
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
