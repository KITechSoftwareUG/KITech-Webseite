"use client";

import { FunnelShell } from "@/components/layout/FunnelShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";

/**
 * Landingpage `/fokus` (Domain `fokus.kitech-software.de`) — **bewusst leer**.
 *
 * Vorgabe vom 12.08.2026: „Fokus.tsx soll erstmal leer bleiben." Der Workshop
 * ist auf `/funnel` gewandert; was hier einmal stand (1:1-KI-Workshop für
 * 299 €, Preis aus dem Vite-Vorgänger) beschreibt kein Angebot mehr, das es so
 * gibt. Stehen zu lassen wäre eine falsche Preisangabe auf einer öffentlich
 * erreichbaren Domain.
 *
 * **Warum leer und nicht gelöscht:** `fokus.kitech-software.de` ist eine
 * eingerichtete Domain, die geteilt worden sein kann. Eine 404 auf einer
 * beworbenen Adresse ist schlechter als eine Seite, die sagt, dass gerade
 * nichts da ist. Die Route bleibt deshalb bestehen und auf `noindex`.
 *
 * **Der alte Inhalt ist nicht verloren:** vollständig im Commit `176b6a2`
 * (Datendatei `src/data/fokus.ts`, View mit Angebots- und
 * Qualifizierungsblock). Zurückholen:
 *
 *     git checkout 176b6a2 -- src/data/fokus.ts src/views/Fokus.tsx
 *
 * Wer die Seite wieder füllt: `src/views/Funnel.tsx` ist die aktuelle Vorlage
 * für den Aufbau einer Kampagnenseite (Struktur, Rahmen, wiederholter CTA).
 */
export function Fokus() {
  return (
    <FunnelShell>
      <section className={`${SITE_CONTAINER} py-24 sm:py-32`}>
        <h1 className="kinetic-display max-w-[640px] text-balance text-[28px] leading-[1.16] text-foreground sm:text-h2">
          Hier entsteht gerade etwas.
        </h1>
        <p className="mt-5 max-w-[520px] text-pretty text-lead font-normal text-muted-foreground">
          Diese Seite hat aktuell keinen Inhalt.
        </p>
      </section>
    </FunnelShell>
  );
}
