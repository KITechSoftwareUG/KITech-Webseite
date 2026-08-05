"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { trackEvent } from "@/lib/plausible";

/**
 * Anmeldung zur Warteliste. Solange die Community noch nicht offen ist, ist das
 * der einzige Weg, den ein Besucher gehen kann.
 *
 * Die Adresse geht an `/api/warteliste` und von dort serverseitig weiter — die
 * Webhook-URL bleibt so aus dem Browser heraus unsichtbar.
 *
 * @param id Muss je Einbau eindeutig sein: die Seite zeigt das Formular zweimal
 *   (Hero und Seitenfuß), und zwei gleiche `id`-Werte machen das Label des
 *   Eingabefelds mehrdeutig.
 */

type Status = "leer" | "sendet" | "fertig" | "fehler";

export function CommunityWarteliste({ id, position }: { id: string; position: string }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot
  const [status, setStatus] = useState<Status>("leer");
  const [fehler, setFehler] = useState<string | null>(null);

  async function absenden(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sendet") return;

    setStatus("sendet");
    setFehler(null);

    try {
      const antwort = await fetch("/api/warteliste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });

      const daten = (await antwort.json()) as { ok?: boolean; fehler?: string };

      if (!antwort.ok) {
        setFehler(daten.fehler ?? "Das hat nicht geklappt.");
        setStatus("fehler");
        return;
      }

      trackEvent("CTA_Klick", { position });
      setStatus("fertig");
    } catch {
      setFehler("Keine Verbindung. Bitte noch einmal versuchen.");
      setStatus("fehler");
    }
  }

  if (status === "fertig") {
    return (
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-accent text-background">
          <Check className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[17px] font-semibold leading-tight text-foreground">
            Du stehst auf der Liste.
          </p>
          <p className="mt-2 max-w-[420px] text-[14px] leading-[1.6] text-muted-foreground">
            Wir melden uns, bevor die Türen aufgehen. Keine Newsletter, kein Verteiler —
            eine Mail, wenn es losgeht.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={absenden} className="flex w-full max-w-[520px] flex-col gap-3 sm:flex-row">
        <label htmlFor={id} className="sr-only">
          E-Mail-Adresse
        </label>
        <input
          id={id}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="deine@email.de"
          className="h-[60px] min-w-0 flex-1 border border-border bg-background px-4 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-accent"
        />

        {/* Honeypot: für Menschen unsichtbar, für Bots verlockend. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />

        <button
          type="submit"
          disabled={status === "sendet"}
          className="inline-flex h-[60px] shrink-0 items-center justify-center gap-2.5 bg-accent px-7 text-[15px] font-semibold text-background transition-colors hover:bg-accent/90 disabled:opacity-60"
        >
          {status === "sendet" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Moment …
            </>
          ) : (
            <>
              Platz sichern
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      {fehler && (
        <p role="alert" className="mt-3 text-[13px] leading-snug text-destructive">
          {fehler}
        </p>
      )}
    </>
  );
}
