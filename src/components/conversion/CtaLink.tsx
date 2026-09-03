"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackEvent, type PlausibleEvent } from "@/lib/plausible";

/**
 * Ein interner Link, der beim Klick ein Plausible-Ereignis meldet.
 *
 * **Warum es diese Komponente gibt.** `trackEvent` läuft im Browser, ein
 * `onClick` macht die umgebende Datei also zur Client-Komponente — und mit ihr
 * alles, was sie rendert. An dieser einen Zeile hing, dass `Home.tsx` nicht
 * Server Component sein konnte.
 *
 * ⚠️ **Das ist eine Architektur-Grenze, kein Tempo-Trick.** Nachgemessen am
 * 01.09.2026 brachte die Umstellung der Startseite messbar nichts (LCP
 * 3925 → 3915 ms): Das Bundle kommt aus dem Rahmen — Providers, Header,
 * Cookie-Banner —, nicht aus dem Seitenmarkup. Der Nutzen liegt darin, dass
 * statisches Markup gar nicht erst im Browser landet und die Grenze sichtbar
 * bleibt; wer hier Ladezeit erwartet, wird enttäuscht.
 *
 * Nicht durch einen gewöhnlichen `Link` ersetzen, um „aufzuräumen": Ohne sie
 * wandert das `onClick` zurück in die Seite und nimmt die Server-Grenze mit.
 *
 * `trackEvent` selbst ist bereits gutmütig: Ohne Einwilligung ist Plausible gar
 * nicht geladen, der Aufruf verpufft folgenlos. Deshalb steht hier keine
 * zusätzliche Prüfung.
 */
export function CtaLink({
  href,
  ereignis,
  eigenschaften,
  className,
  children,
  ...rest
}: {
  href: string;
  /** Plausible-Ereignis. Der Union-Typ verhindert Tippfehler, die sonst
      still eine neue, nie ausgewertete Ereignisart anlegen würden. */
  ereignis: PlausibleEvent;
  /** Zusatzangaben, etwa `{ position: "home-hero" }`. */
  eigenschaften?: Record<string, string | number | boolean>;
  className?: string;
  children: ReactNode;
} & Omit<React.ComponentPropsWithoutRef<typeof Link>, "href" | "onClick" | "className">) {
  return (
    <Link
      href={href}
      onClick={() => trackEvent(ereignis, eigenschaften)}
      className={className}
      {...rest}
    >
      {children}
    </Link>
  );
}
