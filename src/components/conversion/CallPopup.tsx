"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { angebot, verfuegbarkeitKurz } from "@/config/angebot";
import {
  callPopup,
  CALL_POPUP_PAUSE_NACH_KLICK_TAGE,
  CALL_POPUP_PAUSE_TAGE,
  CALL_POPUP_SCROLL_PX,
  CALL_POPUP_VERZOEGERUNG_MS,
  CALL_POPUP_VERZOEGERUNG_NACH_CONSENT_MS,
} from "@/data/call-popup";
import { CONSENT_DECIDED_EVENT, loadStoredConsent } from "@/lib/consent";
import { trackEvent } from "@/lib/plausible";

/**
 * Das Popup der Startseite: geht kurz nach dem Laden auf und stellt genau eine
 * Frage. Inhalt, Zeiten und Pausen stehen in `src/data/call-popup.ts`, samt
 * der Begründung, warum es so früh kommt.
 *
 * **Nur auf der Startseite.** Es hängt bewusst nicht in `PageShell`, sondern in
 * `Home.tsx` — auf `/lass-uns-reden` wäre ein Kasten, der zum Termin auffordert,
 * absurd, und über einem Datenschutztext unpassend.
 *
 * Der Dialog kommt aus `components/ui/dialog` (Radix). Damit sind Escape,
 * Fokus-Falle, gesperrter Seiten-Scroll und die ARIA-Auszeichnung erledigt —
 * und das Popup ist tastaturbedienbar, was ein selbstgebautes `div`-Overlay
 * regelmäßig nicht ist.
 *
 * Geometrie im Stil des Hero: Versalien, scharfe Kanten, Pill-Knopf über die
 * volle Breite (52/56 px hoch, Radius 100 px) — dieselben Werte wie der Knopf
 * darunter im Hero.
 */

/** Zeitstempel, bis zu dem das Popup Ruhe gibt (ms seit Epoch, als String). */
const SPERRE_KEY = "call-popup-v1";

const TAG_MS = 24 * 60 * 60 * 1000;

/**
 * `localStorage` kann werfen — Safari im privaten Modus, gesperrte Cookies,
 * eingebettete Ansichten. Dann lieber zeigen als abstürzen.
 */
function sperreAktiv(): boolean {
  try {
    const bis = Number(window.localStorage.getItem(SPERRE_KEY));
    if (!Number.isFinite(bis) || bis <= 0) return false;
    if (Date.now() < bis) return true;
    window.localStorage.removeItem(SPERRE_KEY);
    return false;
  } catch {
    return false;
  }
}

function sperreSetzen(tage: number) {
  try {
    window.localStorage.setItem(SPERRE_KEY, String(Date.now() + tage * TAG_MS));
  } catch {
    /* kein Speicher verfügbar — dann eben nur für diesen Seitenaufruf */
  }
}

export function CallPopup() {
  const [offen, setOffen] = useState(false);
  const inhalt = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sperreAktiv()) return;

    let timer = 0;
    let aufScroll: (() => void) | null = null;
    let aufConsent: (() => void) | null = null;

    const stoppen = () => {
      window.clearTimeout(timer);
      if (aufScroll) window.removeEventListener("scroll", aufScroll);
      if (aufConsent) window.removeEventListener(CONSENT_DECIDED_EVENT, aufConsent);
    };

    const oeffnen = () => {
      stoppen();
      setOffen(true);
      trackEvent("CTA_Klick", { position: "startseite-popup", label: "angezeigt" });
    };

    /** Zeit ODER erste Scrollbewegung — was zuerst kommt. */
    const wecker = (verzoegerung: number) => {
      timer = window.setTimeout(oeffnen, verzoegerung);
      aufScroll = () => {
        if (window.scrollY > CALL_POPUP_SCROLL_PX) oeffnen();
      };
      window.addEventListener("scroll", aufScroll, { passive: true });
    };

    if (loadStoredConsent()) {
      // Wiederkehrer: der Cookie-Banner erscheint gar nicht erst.
      wecker(CALL_POPUP_VERZOEGERUNG_MS);
    } else {
      // Erstbesuch: warten, bis der Banner weg ist (siehe CONSENT_DECIDED_EVENT).
      aufConsent = () => wecker(CALL_POPUP_VERZOEGERUNG_NACH_CONSENT_MS);
      window.addEventListener(CONSENT_DECIDED_EVENT, aufConsent);
    }

    return stoppen;
  }, []);

  const schliessen = () => {
    setOffen(false);
    sperreSetzen(CALL_POPUP_PAUSE_TAGE);
  };

  const angenommen = () => {
    setOffen(false);
    sperreSetzen(CALL_POPUP_PAUSE_NACH_KLICK_TAGE);
    trackEvent("Calendly_Klick", { position: "startseite-popup" });
  };

  return (
    <Dialog open={offen} onOpenChange={(naechster) => !naechster && schliessen()}>
      {/*
        `[&>button]:hidden` blendet den eingebauten Schließen-Knopf von shadcn
        aus — er ist 16 px groß und beschriftet sich englisch mit "Close". Der
        eigene darunter steht in einem `div` und wird vom Selektor (nur direkte
        Kinder) deshalb nicht getroffen.
      */}
      {/*
        Der Fokus geht auf den Kasten selbst, nicht auf das Schließen-Kreuz.
        Radix würde sonst das erste bedienbare Element anspringen — der
        Fokusring säße dann sichtbar auf dem X, also ausgerechnet auf dem
        Weg hinaus. So liest ein Screenreader Überschrift und Satz vor, und
        die erste Tabulatortaste führt trotzdem hinein.

        `w-[calc(100%-30px)]` lässt auf dem Handy links und rechts 15 px stehen —
        dasselbe Maß wie der Seitenrand der Website.
      */}
      <DialogContent
        ref={inhalt}
        onOpenAutoFocus={(ereignis) => {
          ereignis.preventDefault();
          inhalt.current?.focus();
        }}
        className="w-[calc(100%-30px)] max-w-[520px] gap-0 rounded-none border border-border bg-background p-8 sm:rounded-none sm:p-10 [&>button]:hidden"
      >
        <div>
          {/* Kein eigenes `onClick`: Radix meldet das Schließen über
              `onOpenChange`, dort hängt `schliessen()` schon dran. */}
          <DialogClose
            aria-label="Schließen"
            className="absolute right-4 top-4 p-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-5 w-5" />
          </DialogClose>
        </div>

        <DialogTitle className="max-w-[380px] text-balance text-[32px] font-extrabold uppercase leading-[36.8px] tracking-tight text-foreground">
          {callPopup.ueberschrift}
        </DialogTitle>

        <DialogDescription className="mt-4 text-pretty text-lead font-normal text-foreground">
          {callPopup.text}
        </DialogDescription>

        <Link
          href={angebot.href}
          onClick={angenommen}
          className="mt-8 inline-flex h-[52px] w-full items-center justify-center rounded-[100px] bg-primary px-[10px] text-center text-[18px] font-bold text-primary-foreground transition-colors hover:bg-primary/90 dt:h-[56px] dt:text-[20px]"
        >
          {callPopup.cta}
        </Link>

        {/* Dieselbe Zeile wie unter dem Hero-Knopf — eine Quelle, siehe angebot.ts. */}
        <p className="mt-3 text-center text-mini font-normal text-muted-foreground">
          Kostenlos · {angebot.dauer} · {verfuegbarkeitKurz()}
        </p>

        {/* Wie der Schließen-Knopf oben in einem `div`: `[&>button]:hidden`
            trifft nur direkte Kinder, und das soll allein der eingebaute
            shadcn-Knopf sein. */}
        <div>
          <button
            type="button"
            onClick={schliessen}
            className="mx-auto mt-5 block text-mini font-normal text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            {callPopup.ablehnen}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
