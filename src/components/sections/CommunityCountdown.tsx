"use client";

import { useEffect, useState } from "react";

/**
 * Countdown bis zum Start der Community.
 *
 * Zwei Dinge, die hier leicht schiefgehen:
 *
 * 1. Die Seite wird beim Build statisch vorgerendert. Würde die Restzeit schon
 *    auf dem Server berechnet, stünde in der ausgelieferten HTML für immer die
 *    Zeit vom Build-Zeitpunkt. Deshalb rechnet ausschließlich der Browser, und
 *    bis zum ersten Tick stehen Platzhalterstriche — gleiche Maße, kein Sprung.
 *
 * 2. Das Zieldatum trägt eine ausdrückliche Zeitzone (+02:00, deutsche
 *    Sommerzeit). Ohne sie läge der Start für einen Besucher in New York sechs
 *    Stunden daneben.
 */

/** 1. September 2026, 00:00 Uhr deutscher Zeit. */
export const START_ZEITPUNKT = new Date("2026-09-01T00:00:00+02:00");
export const START_LABEL = "1. September 2026";

interface Restzeit {
  tage: number;
  stunden: number;
  minuten: number;
  sekunden: number;
}

function restzeitBis(ziel: Date, jetzt: number): Restzeit | null {
  const differenz = ziel.getTime() - jetzt;
  if (differenz <= 0) return null;

  return {
    tage: Math.floor(differenz / 86_400_000),
    stunden: Math.floor((differenz / 3_600_000) % 24),
    minuten: Math.floor((differenz / 60_000) % 60),
    sekunden: Math.floor((differenz / 1000) % 60),
  };
}

/**
 * @param onAblauf wird einmal gerufen, sobald der Countdown durch ist — die
 *   Seite tauscht daraufhin die Warteliste gegen den Beitritts-Button.
 */
export function CommunityCountdown({ onAblauf }: { onAblauf?: () => void }) {
  const [restzeit, setRestzeit] = useState<Restzeit | null>(null);
  const [laeuft, setLaeuft] = useState(false);

  useEffect(() => {
    function tick() {
      const rest = restzeitBis(START_ZEITPUNKT, Date.now());
      setRestzeit(rest);
      setLaeuft(true);
      if (!rest) onAblauf?.();
    }

    tick();
    const zeitgeber = setInterval(tick, 1000);
    return () => clearInterval(zeitgeber);
  }, [onAblauf]);

  const felder: Array<{ wert: number | null; label: string }> = [
    { wert: restzeit?.tage ?? null, label: "Tage" },
    { wert: restzeit?.stunden ?? null, label: "Stunden" },
    { wert: restzeit?.minuten ?? null, label: "Minuten" },
    { wert: restzeit?.sekunden ?? null, label: "Sekunden" },
  ];

  return (
    <div>
      <p className="text-[15px] leading-tight text-foreground/70">
        Start am{" "}
        <span className="font-semibold text-foreground">{START_LABEL}</span>
      </p>

      {/* aria-live bewusst "off": ein Sekundentakt im Screenreader wäre eine
          Dauerbeschallung. Die Startzeile darüber sagt bereits alles Nötige. */}
      <div
        className="mt-4 flex flex-wrap gap-x-8 gap-y-4"
        aria-live="off"
        aria-label={
          laeuft && restzeit
            ? `Noch ${restzeit.tage} Tage bis zum Start am ${START_LABEL}`
            : `Start am ${START_LABEL}`
        }
      >
        {felder.map((feld) => (
          <div key={feld.label}>
            {/* kinetic-data bringt tabellarische Ziffern mit — ohne die springt
                die Zeile im Sekundentakt, weil die 1 schmaler ist als die 8. */}
            <p className="kinetic-data text-[40px] font-light leading-none text-foreground sm:text-[52px]">
              {feld.wert === null ? "––" : String(feld.wert).padStart(2, "0")}
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-foreground/50">
              {feld.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
