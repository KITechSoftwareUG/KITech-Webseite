"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowLeft, Mail, Check, Minus, X } from "lucide-react";
import { CheckShell } from "@/components/layout/CheckShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { trackEvent } from "@/lib/plausible";

type AnswerValue = "yes" | "no" | "unsure";
type Stage = "intro" | "check" | "result";

interface Question {
  /** Kurzlabel fuer Fortschritt und Ergebnisliste */
  label: string;
  /** Die eigentliche Frage */
  text: string;
  /** Fundstelle in der Verordnung bzw. was konkret zaehlt */
  note: string;
  /** Doppelt gewichtet, wo eine Luecke in der Praxis zuerst auffaellt */
  weight: 1 | 2;
}

const QUESTIONS: Question[] = [
  {
    label: "KI-Kompetenz",
    text: "Sind alle Mitarbeitenden, die KI-Werkzeuge im Alltag nutzen, nachweislich geschult?",
    note: "Art. 4 verlangt KI-Kompetenz seit dem 2. Februar 2025 — für ChatGPT & Co. genauso wie für eingebaute Copilot-Funktionen.",
    weight: 2,
  },
  {
    label: "Nachweise",
    text: "Könnten Sie diese Schulungen morgen früh belegen, wenn eine Behörde fragt?",
    note: "Gefragt sind Nachweise je Person, datiert und archiviert — nicht eine Teilnehmerliste im Postfach.",
    weight: 2,
  },
  {
    label: "Richtlinie",
    text: "Gibt es eine schriftliche Regelung, welche KI-Werkzeuge wofür eingesetzt werden dürfen?",
    note: "Versioniert, im Unternehmen bekannt und auffindbar. Eine mündliche Absprache zählt nicht.",
    weight: 1,
  },
  {
    label: "Inventar",
    text: "Wissen Sie, welche KI-Anwendungen im Unternehmen tatsächlich im Einsatz sind?",
    note: "Inklusive der KI-Funktionen, die in bestehender Software mitgeliefert werden, und ihrer Risiko-Einstufung.",
    weight: 2,
  },
  {
    label: "Vertraulichkeit",
    text: "Ist ausgeschlossen, dass vertrauliche Daten in Prompts öffentlicher Sprachmodelle landen?",
    note: "Geheimhaltungs- und Datenschutzpflichten gelten unverändert weiter, auch wenn das Werkzeug neu ist.",
    weight: 2,
  },
  {
    label: "Verbotene Praktiken",
    text: "Haben Sie geprüft, ob eine Ihrer Anwendungen unter die verbotenen Praktiken fällt?",
    note: "Art. 5 verbietet unter anderem Emotionserkennung am Arbeitsplatz und Social Scoring — ohne Übergangsfrist.",
    weight: 1,
  },
  {
    label: "Transparenz",
    text: "Erfahren Kunden und Mitarbeitende, wenn sie mit einem KI-System zu tun haben?",
    note: "Art. 50 verlangt Offenlegung bei Chatbots, KI-generierten Inhalten und automatisierten Entscheidungen.",
    weight: 1,
  },
  {
    label: "Aktualität",
    text: "Gibt es einen festen Termin, an dem all das überprüft und nachgezogen wird?",
    note: "Neue Werkzeuge und neue Fristen entwerten den Stand von gestern. Ein Quartalsrhythmus reicht meist aus.",
    weight: 1,
  },
];

const MAX_SCORE = QUESTIONS.reduce((sum, question) => sum + question.weight, 0);

const OPTIONS: { value: AnswerValue; label: string; hint: string }[] = [
  { value: "yes", label: "Ja", hint: "Belegbar vorhanden" },
  { value: "no", label: "Nein", hint: "Fehlt oder unvollständig" },
  { value: "unsure", label: "Weiß ich nicht", hint: "Zählt wie eine offene Lücke" },
];

/**
 * Ergebnis-Baender ueber die Design-Tokens des Systems statt ueber eigene
 * Hex-Werte: success/solo-accent/destructive tragen hier dieselbe Bedeutung
 * wie im Rest der Seite.
 *
 * `ink` ist die aufgehellte Variante desselben Farbtons fuer Text: die
 * Flaechenfarben erreichen als 12px-Label auf dem dunklen Hintergrund keine
 * 4.5:1 (destructive kommt auf 4.38). Flaeche und Rand bleiben beim Token,
 * Text nimmt `ink`.
 */
const BANDS = {
  solid: {
    color: "hsl(var(--success))",
    ink: "hsl(152 60% 62%)",
    label: "Tragfähig",
    headline: "Tragfähig — aber noch nicht lückenlos belegbar.",
    body: "Der Betrieb ist im Griff. Was in einer Prüfung zählt, ist trotzdem etwas anderes: der Nachweis je Person und je Werkzeug, ohne Suchen. Genau dieser letzte Schritt fehlt in den meisten Unternehmen.",
  },
  partial: {
    color: "hsl(var(--solo-accent))",
    ink: "hsl(38 85% 66%)",
    label: "Lückenhaft",
    headline: "Mehrere Pflichten sind noch nicht belegbar.",
    body: "Einiges läuft, anderes existiert nur im Kopf. Ohne strukturierten Nachweis wird daraus in einer Prüfung ein Befund — mit Bußgeld- und Haftungsfolge. Der Aufwand, das zu ordnen, ist überschaubar; der Zeitpunkt ist jetzt.",
  },
  critical: {
    color: "hsl(var(--destructive))",
    ink: "hsl(0 80% 70%)",
    label: "Kritisch",
    headline: "Zentrale Pflichten sind offen.",
    body: "Die Grundlagen fehlen noch — Schulung, Inventar, Nachweis. Das ist der Stand, mit dem die meisten Unternehmen starten, und er lässt sich in wenigen Wochen ordnen. Ungeklärt bleibt er ein reales Risiko.",
  },
} as const;

type BandKey = keyof typeof BANDS;

const ANSWER_META: Record<AnswerValue, { icon: typeof Check; color: string; label: string }> = {
  yes: { icon: Check, color: "hsl(var(--success))", label: "Erfüllt" },
  unsure: { icon: Minus, color: "hsl(var(--solo-accent))", label: "Unklar" },
  no: { icon: X, color: "hsl(var(--destructive))", label: "Offen" },
};

export default function EuAiActSelbstcheck() {
  const [stage, setStage] = useState<Stage>("intro");
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  const result = useMemo(() => {
    let score = 0;
    const open: number[] = [];
    const unclear: number[] = [];
    QUESTIONS.forEach((question, i) => {
      const answer = answers[i];
      if (answer === "yes") score += question.weight;
      else if (answer === "no") open.push(i);
      else if (answer === "unsure") unclear.push(i);
    });
    const percent = Math.round((score / MAX_SCORE) * 100);
    const band: BandKey =
      percent >= 85 && open.length === 0 ? "solid" : percent >= 50 ? "partial" : "critical";
    return { percent, open, unclear, band };
  }, [answers]);

  function start() {
    setAnswers({});
    setIndex(0);
    setStage("check");
    trackEvent("CTA_Klick", { position: "selbstcheck-start" });
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function answer(value: AnswerValue) {
    const next = { ...answers, [index]: value };
    setAnswers(next);
    if (index + 1 < QUESTIONS.length) {
      setIndex((prev) => prev + 1);
      return;
    }
    setStage("result");
    // Aus `next` rechnen, nicht aus `result`: der State-Update ist hier noch nicht durch.
    const score = QUESTIONS.reduce(
      (sum, question, i) => (next[i] === "yes" ? sum + question.weight : sum),
      0
    );
    trackEvent("Lead_Qualifier_abgeschlossen", {
      ergebnis: Math.round((score / MAX_SCORE) * 100),
    });
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    /*
     * Der Check laeuft seit dem 11.08.2026 markenfrei: keine Kopfzeile mit Logo,
     * keine Fusszeile mit Firmierung, kein Ankuendigungsbalken — statt der
     * `PageShell` traegt er die `CheckShell` (siehe die Begruendung dort).
     *
     * Er stand vorher im vollen Seitenrahmen, weil er als eigener Fokus-Screen
     * eine Sackgasse war. Der markenfreie Rahmen loest das anders: er verlinkt
     * oben rechts weiter — auf den Selbstcheck zur Entgelttransparenzrichtlinie
     * unter klargehalt.de, das zweite Werkzeug derselben Art.
     */
    <CheckShell
      title="EU AI Act · Selbstcheck"
      link={{
        href: "https://www.klargehalt.de/selbstcheck",
        label: "Entgelttransparenzrichtlinie prüfen",
        shortLabel: "Entgelttransparenz",
        trackingPosition: "selbstcheck-klargehalt",
      }}
      note="Orientierung auf Basis Ihrer Angaben, keine Rechtsberatung. Die Antworten bleiben in Ihrem Browser."
    >
      <>
        {stage === "intro" && <Intro onStart={start} />}
        {stage === "check" && (
          <Check_
            index={index}
            answers={answers}
            onAnswer={answer}
            onBack={() => setIndex((prev) => Math.max(0, prev - 1))}
          />
        )}
        {stage === "result" && (
          <Result
            percent={result.percent}
            band={result.band}
            open={result.open}
            unclear={result.unclear}
            answers={answers}
            onRestart={start}
          />
        )}
      </>
    </CheckShell>
  );
}

/* ------------------------------------------------------------------ Intro */

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <>
      <section className="relative isolate w-full overflow-hidden">
        {/* Heller Kopfbereich statt des frueheren Canvas-Signalfelds: die
            Animation war ein Element des dunklen Designs, auf weissem Grund gibt
            es nichts zu leuchten (siehe docs/DESIGN.md). */}
        <div
          className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-surface-strong to-background"
          aria-hidden="true"
        />

        <div className={`${SITE_CONTAINER} grid gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-12 lg:py-28`}>
          <div className="lg:col-span-7">
            <span className="mb-6 block w-fit bg-primary px-3 py-1.5 text-mini font-medium uppercase tracking-wide text-primary-foreground">
              EU AI Act · Selbstcheck
            </span>

            <h1 className="kinetic-display kinetic-morph-in max-w-2xl text-balance text-4xl leading-[1.35] text-foreground sm:text-5xl sm:leading-[1.25] lg:text-6xl">
              <span className="box-decoration-clone bg-primary px-2 text-primary-foreground">
                Acht Fragen. Danach wissen Sie, wo Sie stehen.
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-balance text-base font-light leading-relaxed text-foreground/85 sm:text-lg">
              Der EU AI Act gilt. Die meisten Unternehmen erfüllen mehr davon, als sie denken — und
              können weniger davon belegen, als sie glauben. Dieser Check trennt beides.
            </p>
            <p className="mt-4 max-w-xl text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
              Zwei Minuten, keine E-Mail-Adresse, kein Datenversand. Die Antworten bleiben in Ihrem
              Browser, die Auswertung sehen Sie sofort auf dieser Seite.
            </p>

            <button
              type="button"
              onClick={onStart}
              className="group mt-10 inline-flex w-full items-center justify-between gap-6 bg-primary px-6 py-5 text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto"
            >
              <span className="text-left">
                <span className="block text-base font-medium sm:text-lg">Check starten</span>
                <span className="mt-1 block text-xs font-light text-primary-foreground/70 sm:text-sm">
                  Acht Fragen, Ergebnis direkt im Anschluss
                </span>
              </span>
              <ArrowRight
                className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>

            <p className="mt-8 max-w-xl text-xs leading-relaxed text-muted-foreground">
              Der Check ist eine Orientierung, keine Rechtsberatung. Er bildet die Pflichten ab, die
              bei Unternehmen mit KI-Einsatz in der Praxis zuerst auffallen.
            </p>
          </div>

          {/* Statt drei generischer Benefit-Kacheln: die acht Pruefpunkte selbst.
              Wer wissen will, was der Check abfragt, sieht es hier vollstaendig. */}
          <div className="lg:col-span-5">
            <div className="border border-border bg-surface">
              <p className="border-b border-border px-5 py-4 text-sm font-medium text-foreground">
                Was geprüft wird
              </p>
              <ol className="divide-y divide-border">
                {QUESTIONS.map((question, i) => (
                  <li key={question.label} className="flex items-baseline gap-4 px-5 py-3.5">
                    <span className="kinetic-data w-5 shrink-0 text-xs text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="text-sm font-light text-foreground/90">{question.label}</span>
                    {question.weight === 2 && (
                      <span className="ml-auto shrink-0 text-mini uppercase tracking-wide text-accent">
                        Kernpflicht
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ Check */

/** Trailing underscore, damit der Name nicht mit dem Check-Icon aus lucide kollidiert. */
function Check_({
  index,
  answers,
  onAnswer,
  onBack,
}: {
  index: number;
  answers: Record<number, AnswerValue>;
  onAnswer: (value: AnswerValue) => void;
  onBack: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const question = QUESTIONS[index];
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    groupRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [index]);

  function onKeyDown(event: React.KeyboardEvent) {
    const buttons = Array.from(groupRef.current?.querySelectorAll("button") ?? []);
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      buttons[(current + 1 + buttons.length) % buttons.length]?.focus();
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      buttons[(current - 1 + buttons.length) % buttons.length]?.focus();
    }
  }

  return (
    <section className={`${SITE_CONTAINER} w-full py-14 sm:py-20`}>
      <div className="mx-auto max-w-3xl">
        <Progress index={index} answers={answers} />

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 border border-border bg-surface"
          >
            <div className="border-b border-border px-6 py-8 sm:px-10 sm:py-10">
              <p className="kinetic-data text-xs text-muted-foreground">
                Frage {index + 1} von {QUESTIONS.length} · {question.label}
              </p>
              <h2 className="kinetic-display mt-4 text-balance text-2xl leading-snug text-foreground sm:text-3xl">
                {question.text}
              </h2>
              <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-muted-foreground">
                {question.note}
              </p>
            </div>

            <div
              ref={groupRef}
              role="group"
              aria-label="Antwort auswählen"
              onKeyDown={onKeyDown}
              className="grid sm:grid-cols-3"
            >
              {OPTIONS.map((option, i) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onAnswer(option.value)}
                  className={[
                    "group flex min-h-[5.5rem] flex-col justify-center gap-1 px-6 py-5 text-left transition-colors",
                    "hover:bg-primary hover:text-primary-foreground",
                    "focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary",
                    i > 0 ? "border-t border-border sm:border-l sm:border-t-0" : "",
                  ].join(" ")}
                >
                  <span className="text-base font-medium">{option.label}</span>
                  <span className="text-xs font-light text-muted-foreground group-hover:text-primary-foreground/75">
                    {option.hint}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={onBack}
            disabled={index === 0}
            className="-mx-2 inline-flex min-h-[2.75rem] items-center gap-2 px-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Zurück
          </button>
          <p className="text-xs text-muted-foreground">
            Antworten bleiben im Browser — nichts wird übertragen.
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Der Fortschritt zeigt pro Frage, wie sie beantwortet wurde — die Leiste ist
 * damit Navigation und Zwischenstand in einem, nicht nur Dekoration.
 */
function Progress({ index, answers }: { index: number; answers: Record<number, AnswerValue> }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-medium text-foreground">EU-AI-Act-Selbstcheck</p>
        <p className="kinetic-data text-xs text-muted-foreground">
          {index + 1} / {QUESTIONS.length}
        </p>
      </div>
      <div className="mt-3 flex gap-1" aria-hidden="true">
        {QUESTIONS.map((question, i) => {
          const answer = answers[i];
          const background = answer ? ANSWER_META[answer].color : undefined;
          return (
            <span
              key={question.label}
              className={[
                "h-1 flex-1 transition-colors",
                answer ? "" : i === index ? "bg-primary/50" : "bg-border",
              ].join(" ")}
              style={background ? { backgroundColor: background } : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- Result */

function Result({
  percent,
  band,
  open,
  unclear,
  answers,
  onRestart,
}: {
  percent: number;
  band: BandKey;
  open: number[];
  unclear: number[];
  answers: Record<number, AnswerValue>;
  onRestart: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const verdict = BANDS[band];
  const [shown, setShown] = useState(reduceMotion ? percent : 0);

  useEffect(() => {
    if (reduceMotion) {
      setShown(percent);
      return;
    }
    const start = performance.now();
    const duration = 900;
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      setShown(Math.round(percent * (1 - Math.pow(1 - t, 4))));
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [percent, reduceMotion]);

  const todo = [...open, ...unclear].sort((a, b) => a - b);

  return (
    <>
      <section className={`${SITE_CONTAINER} w-full py-14 sm:py-20`}>
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Ihr Ergebnis</p>
              <p className="mt-2 flex items-baseline gap-3">
                <span className="kinetic-display text-6xl leading-none text-foreground sm:text-7xl">
                  {shown}
                </span>
                <span className="kinetic-data text-sm text-muted-foreground">von 100</span>
              </p>
            </div>
            <span
              className="border px-3 py-1.5 text-xs font-medium uppercase tracking-wide"
              style={{ borderColor: verdict.color, color: verdict.ink }}
            >
              {verdict.label}
            </span>
          </div>

          <div className="mt-8 flex gap-1" aria-hidden="true">
            {QUESTIONS.map((question, i) => {
              const answer = answers[i];
              return (
                <span
                  key={question.label}
                  className="h-1.5 flex-1"
                  style={{ backgroundColor: answer ? ANSWER_META[answer].color : "hsl(var(--border))" }}
                />
              );
            })}
          </div>
          {/* Beziffert, was die Leiste farblich zeigt - sonst muss man die Farben raten. */}
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
            {(["yes", "unsure", "no"] as AnswerValue[]).map((value) => {
              const count = QUESTIONS.filter((_, i) => answers[i] === value).length;
              if (count === 0) return null;
              return (
                <span key={value} className="inline-flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0"
                    style={{ backgroundColor: ANSWER_META[value].color }}
                    aria-hidden="true"
                  />
                  {count}× {ANSWER_META[value].label}
                </span>
              );
            })}
          </p>

          <h1 className="kinetic-display mt-10 max-w-2xl text-balance text-3xl leading-tight text-foreground sm:text-4xl">
            {verdict.headline}
          </h1>
          <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-foreground/85">
            {verdict.body}
          </p>

          {/* Der eigentliche Wert des Checks: nicht die Punktzahl, sondern die
              konkrete Liste dessen, was offen ist. */}
          {todo.length > 0 ? (
            <div className="mt-12 border border-border bg-surface">
              <p className="border-b border-border px-5 py-4 text-sm font-medium text-foreground">
                {todo.length === 1 ? "Ein offener Punkt" : `${todo.length} offene Punkte`}
              </p>
              <ul className="divide-y divide-border">
                {todo.map((i) => {
                  const question = QUESTIONS[i];
                  const meta = ANSWER_META[answers[i]];
                  const Icon = meta.icon;
                  return (
                    <li key={question.label} className="flex gap-4 px-5 py-4">
                      <Icon
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: meta.color }}
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {question.label}
                          <span className="ml-2 font-light text-muted-foreground">
                            {meta.label}
                          </span>
                        </p>
                        <p className="mt-1.5 text-sm font-light leading-relaxed text-muted-foreground">
                          {question.note}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="mt-12 border border-border bg-surface px-5 py-6">
              <p className="text-sm font-medium text-foreground">Keine offenen Punkte</p>
              <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">
                Alle acht Punkte haben Sie mit Ja beantwortet. Bleibt die Frage, ob die Nachweise
                einer Prüfung standhalten — genau das schauen wir uns im Gespräch an.
              </p>
            </div>
          )}

          <Link
            href="/lass-uns-reden"
            onClick={() => trackEvent("Calendly_Klick", { position: "selbstcheck-ergebnis" })}
            className="group mt-12 inline-flex w-full items-center justify-between gap-6 bg-primary px-6 py-5 text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
          >
            <span className="text-left">
              <span className="block text-base font-medium sm:text-lg">
                {todo.length > 0 ? "Offene Punkte besprechen" : "Nachweise prüfen lassen"}
              </span>
              <span className="mt-1 block text-xs font-light text-primary-foreground/70 sm:text-sm">
                Kostenlose KI-Bewertung, 60 Minuten, ohne Verpflichtung
              </span>
            </span>
            <ArrowRight
              className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>

          <EmailSummary percent={percent} todo={todo} />

          <div className="mt-12 border-t border-border pt-6">
            <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
              Das Ergebnis ist eine Orientierung auf Basis Ihrer Angaben und keine Aussage über die
              Rechtskonformität Ihres Unternehmens im Einzelfall. Für rechtliche Würdigungen wenden
              Sie sich an eine Rechtsanwältin oder einen Rechtsanwalt.
            </p>
            <button
              type="button"
              onClick={onRestart}
              className="mt-4 text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Check erneut starten
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

/**
 * Die Zusammenfassung geht per mailto raus — kein Formular-Backend, keine
 * Speicherung, damit die Zusage "nichts wird übertragen" auch hier stimmt.
 */
function EmailSummary({ percent, todo }: { percent: number; todo: number[] }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const valid = email.includes("@") && consent;

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid) return;
    const subject = `EU-AI-Act-Selbstcheck: ${percent} von 100`;
    const lines = [
      "Guten Tag,",
      "",
      `ich habe den Selbstcheck ausgefüllt und komme auf ${percent} von 100 Punkten.`,
      todo.length > 0
        ? `Offen sind: ${todo.map((i) => QUESTIONS[i].label).join(", ")}.`
        : "Offene Punkte hatte ich keine.",
      "",
      "Bitte melden Sie sich für ein kurzes Gespräch.",
      "",
      email,
    ];
    trackEvent("Kontaktformular_gesendet", { position: "selbstcheck-zusammenfassung" });
    window.location.href = `mailto:info@kitech-software.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  }

  return (
    <form onSubmit={onSubmit} className="mt-12 border border-border bg-surface p-5 sm:p-6">
      <p className="text-sm font-medium text-foreground">Ergebnis per E-Mail schicken</p>
      <p className="mt-2 max-w-xl text-sm font-light leading-relaxed text-muted-foreground">
        Optional. Öffnet Ihr E-Mail-Programm mit einer fertigen Zusammenfassung — Sie entscheiden,
        ob Sie sie abschicken.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="selbstcheck-email" className="sr-only">
          E-Mail-Adresse
        </label>
        <input
          id="selbstcheck-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@ihrunternehmen.de"
          className="h-12 w-full border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none sm:max-w-xs"
        />
        <button
          type="submit"
          disabled={!valid}
          className="inline-flex h-12 items-center justify-center gap-2 bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent disabled:text-muted-foreground"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          Entwurf öffnen
        </button>
      </div>

      <label className="mt-4 flex items-start gap-3 text-xs font-light leading-relaxed text-muted-foreground">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
          required
        />
        {/* Ohne Firmennamen, weil die Seite markenfrei laeuft — wer die Anfrage
            erhaelt und verantwortet, steht in der verlinkten Erklaerung und im
            Empfaengerfeld der Mail, die sich gleich oeffnet. */}
        <span>
          Ich bin einverstanden, dass meine E-Mail-Adresse für die Antwort auf diese Anfrage
          verwendet wird. Empfänger und Verantwortlicher stehen im{" "}
          <Link href="/datenschutz" className="underline underline-offset-2 hover:text-foreground">
            Datenschutz
          </Link>
          .
        </span>
      </label>
    </form>
  );
}

