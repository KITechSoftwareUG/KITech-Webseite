"use client";

import { useEffect, useState } from "react";
import type { FunnelTermin } from "@/data/funnel";

/**
 * Termin, Anmeldeschluss und Countdown eines Live-Workshops.
 *
 * **Der Countdown läuft nur auf eine echte Frist.** `funnel-narrativ/reference/bans.md`
 * verbietet erfundene Timer ausdrücklich — also solche, die bei jedem
 * Seitenaufruf neu bei 24:00:00 anfangen. Hier zählt die Anzeige auf einen
 * festen Zeitpunkt aus `src/data/funnel.ts`. Steht dort keiner (`termin: null`),
 * rendert diese Komponente gar nichts, statt eine Dringlichkeit zu behaupten,
 * die es nicht gibt.
 *
 * **Warum die Zahlen erst nach dem Laden erscheinen:** Server und Browser
 * stünden sonst auf verschiedenen Sekunden, und React meldet beim Hydrieren
 * einen Unterschied. Bis der Browser gerechnet hat, steht die Zeile deshalb auf
 * Nullen — sie hat dadurch von Anfang an ihre endgültige Höhe und die Seite
 * springt beim Laden nicht.
 *
 * Ist der Termin vorbei, verschwindet der Countdown und der Anmeldeschluss;
 * das Datum selbst bleibt stehen. Ein Zähler, der bei „00 00 00 00" hängt,
 * sieht aus wie ein Fehler, und ein abgelaufener Anmeldeschluss ist eine
 * falsche Aussage.
 */

interface Restzeit {
  tage: number;
  stunden: number;
  minuten: number;
  sekunden: number;
}

const NULL_ZEIT: Restzeit = { tage: 0, stunden: 0, minuten: 0, sekunden: 0 };

function restzeitBis(ziel: number, jetzt: number): Restzeit | null {
  const ms = ziel - jetzt;
  if (ms <= 0) return null;

  const sekundenGesamt = Math.floor(ms / 1000);
  return {
    tage: Math.floor(sekundenGesamt / 86400),
    stunden: Math.floor((sekundenGesamt % 86400) / 3600),
    minuten: Math.floor((sekundenGesamt % 3600) / 60),
    sekunden: sekundenGesamt % 60,
  };
}

const EINHEITEN: { schluessel: keyof Restzeit; label: string }[] = [
  { schluessel: "tage", label: "Tage" },
  { schluessel: "stunden", label: "Stunden" },
  { schluessel: "minuten", label: "Minuten" },
  { schluessel: "sekunden", label: "Sekunden" },
];

export function WorkshopTermin({ termin }: { termin: FunnelTermin | null }) {
  /** `null` = im Browser gerechnet und abgelaufen. `NULL_ZEIT` = noch nicht gerechnet. */
  const [rest, setRest] = useState<Restzeit | null>(NULL_ZEIT);
  const [gerechnet, setGerechnet] = useState(false);

  useEffect(() => {
    if (!termin) return;

    const ziel = new Date(termin.start).getTime();
    if (Number.isNaN(ziel)) return;

    const aktualisieren = () => {
      setRest(restzeitBis(ziel, Date.now()));
      setGerechnet(true);
    };

    aktualisieren();
    const timer = window.setInterval(aktualisieren, 1000);
    return () => window.clearInterval(timer);
  }, [termin]);

  if (!termin) return null;

  const abgelaufen = gerechnet && rest === null;
  const anzeige = rest ?? NULL_ZEIT;

  return (
    <div className="mt-10">
      <p className="text-fliess font-semibold text-foreground">{termin.anzeige}</p>

      {termin.anmeldeschluss && !abgelaufen && (
        <p className="mt-1 text-fliess text-muted-foreground">{termin.anmeldeschluss}</p>
      )}

      {!abgelaufen && (
        <ul className="mt-6 flex max-w-[420px] items-stretch border border-border">
          {EINHEITEN.map((einheit, index) => (
            <li
              key={einheit.schluessel}
              className={`flex-1 px-3 py-4 text-center ${
                index > 0 ? "border-l border-border" : ""
              }`}
            >
              <span className="kinetic-data block text-h3 font-light leading-none text-foreground">
                {/* Zweistellig, damit die Spalten beim Herunterzählen nicht
                    schmaler werden und die Zeile ruckelt. */}
                {String(anzeige[einheit.schluessel]).padStart(2, "0")}
              </span>
              <span className="mt-2 block text-mini text-muted-foreground">{einheit.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
