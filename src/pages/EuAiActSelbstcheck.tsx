import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Clock,
  ShieldCheck,
  Compass,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";

// Eigene Schriften nur fuer diese Route (lazy geladen ueber App.tsx).
// Die Seite laeuft bewusst in einem eigenen, hellen Farbschema und nicht im
// dark-first KITech-Theme - deshalb sind alle Farben hier hart gesetzt.
import "@fontsource-variable/inter";
import "@fontsource-variable/inter-tight";

type AnswerValue = "yes" | "no" | "unsure";
type Band = "ok" | "warn" | "bad";
type Stage = "landing" | "check" | "computing" | "result";

interface Question {
  id: string;
  text: string;
  hint: string;
  weight: number;
}

const QUESTIONS: Question[] = [
  {
    id: "literacy",
    text: "Haben alle Mitarbeitenden, die KI-Tools im Arbeitsalltag nutzen (z. B. ChatGPT, Microsoft Copilot, Google Gemini), eine dokumentierte AI-Literacy-Schulung erhalten?",
    hint: "Art. 4 EU AI Act – Pflicht seit 2. Februar 2025.",
    weight: 2,
  },
  {
    id: "nachweis",
    text: "Können Sie auf Nachfrage einer Aufsichtsbehörde innerhalb von 48 Stunden Schulungsnachweise je Person vorlegen?",
    hint: "Namentliche PDF-Nachweise, datiert, archivierbar.",
    weight: 2,
  },
  {
    id: "richtlinie",
    text: "Existiert eine schriftliche, versionierte KI-Nutzungsrichtlinie, die alle eingesetzten Tools verbindlich regelt?",
    hint: "Word/PDF, versioniert, allen zugänglich.",
    weight: 1,
  },
  {
    id: "inventar",
    text: "Führen Sie ein vollständiges KI-Inventar aller im Unternehmen eingesetzten KI-Anwendungen inklusive Risiko-Einstufung?",
    hint: "Alle KI-Tools und -Module, die im Unternehmen genutzt werden – dokumentiert und eingestuft.",
    weight: 2,
  },
  {
    id: "vertraulichkeit",
    text: "Ist sichergestellt, dass keine vertraulichen Unternehmens- oder Kundendaten in Prompts allgemeiner Cloud-LLMs (ChatGPT, Gemini, Claude) gelangen?",
    hint: "Berufs- und Datenschutzpflichten gelten weiter – unabhängig vom Tool.",
    weight: 2,
  },
  {
    id: "verbot",
    text: "Haben Sie geprüft, dass keine der eingesetzten KI-Anwendungen unter die Verbote nach Art. 5 EU AI Act fällt?",
    hint: "Z. B. Emotionserkennung am Arbeitsplatz, Social Scoring.",
    weight: 1,
  },
  {
    id: "transparenz",
    text: "Werden betroffene Personen transparent über den KI-Einsatz informiert (Art. 50)?",
    hint: "Z. B. Chatbots, KI-generierte Inhalte, automatisierte Entscheidungen.",
    weight: 1,
  },
  {
    id: "review",
    text: "Gibt es einen festen Prozess, mit dem die Nachweise bei neuen Tools oder Rechtsänderungen aktualisiert werden?",
    hint: "Z. B. quartalsweise Review, dokumentiert.",
    weight: 1,
  },
];

const MAX_SCORE = QUESTIONS.reduce((sum, q) => sum + q.weight, 0);

const OPTIONS: { value: AnswerValue; label: string }[] = [
  { value: "yes", label: "Ja" },
  { value: "no", label: "Nein" },
  { value: "unsure", label: "Unsicher" },
];

const SCHULUNG_STORAGE_KEY = "kitech.ai-act.schulung-absolviert";

interface Verdict {
  band: Band;
  bandLabel: string;
  title: string;
  body: string;
}

export default function EuAiActSelbstcheck() {
  const [stage, setStage] = useState<Stage>("landing");
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  const { score, risky, missing } = useMemo(() => {
    let score = 0;
    let risky = 0;
    let missing = 0;
    for (const question of QUESTIONS) {
      const answer = answers[question.id];
      if (answer === "yes") score += question.weight;
      else if (answer === "no") risky += 1;
      else if (answer === "unsure") missing += 1;
    }
    return { score, risky, missing };
  }, [answers]);

  const pct = Math.round((score / MAX_SCORE) * 100);

  const verdict: Verdict =
    pct >= 85 && risky === 0
      ? {
          band: "ok",
          bandLabel: "Guter Stand · aber Lücke",
          title: "Guter Stand – aber noch nicht vollständig nachweisbar.",
          body: "Vieles ist im Griff. In Prüfsituationen zählt jedoch die lückenlose, zeigbare Dokumentation je Person und Tool. Genau dieser letzte Schritt zur belastbaren Nachweismappe fehlt in fast allen Unternehmen – auch bei Ihnen sind noch Punkte offen. Handlungsbedarf besteht.",
        }
      : pct >= 50
        ? {
            band: "warn",
            bandLabel: "Erkennbare Lücken",
            title: "Erkennbare Lücken – jetzt Handlungsbedarf.",
            body: "Mehrere Pflichten aus dem EU AI Act sind bei Ihnen aktuell noch nicht belastbar dokumentiert. Ohne strukturierten Nachweis droht bei einer Prüfung ein Befund – mit möglichen Bußgeldern und Haftungsfolgen. Jetzt lohnt sich ein klarer Plan für die nächsten Schritte.",
          }
        : {
            band: "bad",
            bandLabel: "Deutliche Lücken",
            title: "Deutliche Lücken – dringender Handlungsbedarf.",
            body: "Zentrale Pflichten aus dem EU AI Act sind bei Ihnen aktuell nicht abgedeckt. Ohne zeitnahes Vorgehen entsteht ein reales Bußgeld- und Haftungsrisiko. Die gute Nachricht: Genau hier starten die meisten Unternehmen – und in wenigen Wochen ist ein belastbarer Nachweisstand aufgebaut.",
          };

  const recommended: "schulung" | "gespraech" = verdict.band === "warn" ? "schulung" : "gespraech";

  function start() {
    setAnswers({});
    setIndex(0);
    setStage("check");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    }
  }

  function pick(value: AnswerValue) {
    const question = QUESTIONS[index];
    setAnswers((prev) => ({ ...prev, [question.id]: value }));

    const delay = reduced ? 0 : 380;
    window.setTimeout(() => {
      if (index + 1 < QUESTIONS.length) {
        setIndex((prev) => prev + 1);
      } else {
        setStage("computing");
        window.setTimeout(() => setStage("result"), reduced ? 0 : 700);
      }
    }, delay);
  }

  function back() {
    if (index > 0) setIndex((prev) => prev - 1);
  }

  return (
    <div className="selbstcheck-page min-h-screen overflow-x-clip bg-[#f7f3ea] text-[#101b31]">
      <SEOHead
        title="EU-AI-Act-Selbstcheck für Unternehmen | KITech Software"
        description="In 2 Minuten sehen, wo Ihr Unternehmen beim EU AI Act steht. Acht praxisnahe Fragen, sofortiges Ergebnis, ohne E-Mail und ohne Datenversand."
        canonical="/eu-ai-act-selbstcheck"
      />
      {stage === "landing" && <LandingView onStart={start} />}
      {stage === "check" && (
        <CheckView
          index={index}
          answer={answers[QUESTIONS[index].id]}
          onPick={pick}
          onBack={back}
        />
      )}
      {stage === "computing" && <ComputingView />}
      {stage === "result" && (
        <ResultView
          pct={pct}
          risky={risky}
          missing={missing}
          verdict={verdict}
          recommended={recommended}
          onRestart={start}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Landing */

function LandingView({ onStart }: { onStart: () => void }) {
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const [pointer, setPointer] = useState({ x: 50, y: 40 });

  useEffect(() => {
    if (reduced) return;
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (event: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      setPointer({
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      });
    };
    hero.addEventListener("mousemove", onMove);
    return () => hero.removeEventListener("mousemove", onMove);
  }, [reduced]);

  return (
    <>
      <section
        ref={heroRef}
        className="relative isolate flex min-h-[88vh] items-center overflow-hidden bg-[#0a1428] text-white"
      >
        <motion.div
          aria-hidden
          className="absolute -left-32 top-1/4 -z-10 h-[38rem] w-[38rem] rounded-full bg-[#1b9a70]/25 blur-[120px]"
          animate={reduced ? undefined : { x: [0, 80, -20, 0], y: [0, -40, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -right-40 top-10 -z-10 h-[34rem] w-[34rem] rounded-full bg-[#3b82f6]/20 blur-[120px]"
          animate={reduced ? undefined : { x: [0, -60, 30, 0], y: [0, 40, -20, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute left-1/3 bottom-0 -z-10 h-[26rem] w-[26rem] rounded-full bg-[#6ee7ba]/15 blur-[100px]"
          animate={reduced ? undefined : { x: [0, 40, -30, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at 50% 30%, black 35%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 35%, transparent 78%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 transition-[background] duration-200"
          style={{
            background: `radial-gradient(600px circle at ${pointer.x}% ${pointer.y}%, rgba(110,231,186,.10), transparent 60%)`,
          }}
        />

        <div className="relative mx-auto w-full max-w-[80rem] px-6 py-28 text-center md:py-36">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.04] px-3.5 py-1.5 text-[11.5px] font-semibold uppercase tracking-[.18em] text-[#6ee7ba] backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Der KITech KI-Check
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="selbstcheck-display mx-auto mt-10 max-w-4xl text-[2.75rem] font-bold leading-[1.02] tracking-[-.035em] text-white sm:text-6xl lg:text-[4.25rem]"
          >
            In 2 Minuten sehen, wo Ihr Unternehmen{" "}
            <span className="relative inline-block bg-gradient-to-r from-[#6ee7ba] via-[#a8f0d0] to-[#74a9ff] bg-clip-text text-transparent">
              beim AI Act
              {!reduced && (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(105deg, transparent 30%, rgba(255,255,255,.6) 50%, transparent 70%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                  initial={{ backgroundPositionX: "-200%" }}
                  animate={{ backgroundPositionX: "200%" }}
                  transition={{ duration: 2.2, delay: 0.8, ease: "easeInOut" }}
                />
              )}
            </span>{" "}
            steht.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mx-auto mt-8 max-w-2xl text-[17px] leading-relaxed text-white/70 md:text-lg"
          >
            Prüfen Sie an acht typischen Pflichten aus dem EU AI Act – von KI-Schulung über
            Nachweise bis zur Risikoprüfung. Sofort ein Ergebnis. Ohne E-Mail. Ohne Datenversand.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-12 flex flex-wrap justify-center gap-4"
          >
            <button
              type="button"
              onClick={onStart}
              className="group inline-flex h-[3.25rem] items-center justify-center gap-2 rounded-lg bg-[#18845f] px-7 text-sm font-semibold text-white shadow-[0_18px_45px_-18px_rgba(40,169,120,.75)] transition hover:bg-[#126b4d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6ee7ba]"
            >
              Selbstcheck starten
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </motion.div>

          <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12.5px] text-white/60">
            {[
              "Allgemeine Orientierung",
              "8 praxisnahe Fragen",
              "Sofortiges Ergebnis",
              "Kein Datenversand",
            ].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6ee7ba]" /> {item}
              </span>
            ))}
          </div>

          <p className="mx-auto mt-5 max-w-2xl text-center text-[12px] leading-relaxed text-white/45">
            Der Check ist eine allgemeine Orientierung und ersetzt keine Rechtsberatung. Er greift
            die zentralen Pflichten des EU AI Act auf, die für Unternehmen mit KI-Einsatz typisch
            sind.
          </p>
        </div>
      </section>

      <section className="bg-[#f7f3ea] py-20 md:py-28">
        <div className="mx-auto w-full max-w-[80rem] px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#18845f]">
              Was der Check Ihnen bringt
            </p>
            <h2 className="selbstcheck-display mt-4 text-4xl font-bold leading-[1.04] tracking-[-.035em] text-[#101b31] sm:text-5xl">
              Wissen, wo Handlungsbedarf wirklich liegt.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[16.5px] leading-relaxed text-[#4a5566]">
              Keine allgemeine Ratgeber-Liste, sondern eine kurze Standortbestimmung zu den
              Pflichten, die in der Praxis am häufigsten fehlen.
            </p>
          </div>

          <div className="relative mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
            <div
              aria-hidden
              className="absolute inset-x-8 top-10 hidden h-px bg-gradient-to-r from-[#18845f]/10 via-[#18845f]/60 to-[#18845f]/10 md:block"
            />
            {[
              {
                icon: Clock,
                bold: "Acht Fragen, die im Arbeitsalltag zählen.",
                text: "Schulung, Richtlinie, KI-Inventar, Nachweise, Transparenz – gefragt wird, was Behörden und Audits tatsächlich interessieren.",
              },
              {
                icon: ShieldCheck,
                bold: "Ergebnis direkt, Daten bei Ihnen.",
                text: "Sie sehen sofort, wo Ihr Standort ausreicht und wo Lücken oder Unsicherheiten bleiben. Alles passiert rein im Browser.",
              },
              {
                icon: Compass,
                bold: "Ein passender nächster Schritt.",
                text: "Danach wählen Sie: ein persönliches Erstgespräch oder die KI-Schulung für Ihr Team – ohne Verpflichtung.",
              },
            ].map(({ icon: Icon, bold, text }) => (
              <div
                key={bold}
                className="group relative overflow-hidden rounded-2xl border border-[#ddd6c9] bg-white p-7 shadow-[0_20px_45px_-38px_rgba(16,27,49,.45)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_28px_60px_-40px_rgba(24,132,95,.55)]"
              >
                <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-[#18845f] to-[#65c6a3] transition-transform duration-500 group-hover:scale-x-100" />
                <span className="relative inline-grid h-11 w-11 place-items-center rounded-full border border-[#cfe3d9] bg-[#edf7f1] text-[#18845f]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-6 text-lg font-semibold text-[#101b31]">{bold}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[#4a5566]">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex justify-center">
            <button
              type="button"
              onClick={onStart}
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#101b31] px-6 text-sm font-semibold text-white shadow-[0_18px_45px_-22px_rgba(16,27,49,.7)] transition hover:-translate-y-0.5 hover:bg-[#18324a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#18845f]"
            >
              Selbstcheck starten
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>

      <SourceNote />
    </>
  );
}

/* ------------------------------------------------------------------ Check */

function CheckView({
  index,
  answer,
  onPick,
  onBack,
}: {
  index: number;
  answer?: AnswerValue;
  onPick: (value: AnswerValue) => void;
  onBack: () => void;
}) {
  const reduced = useReducedMotion();
  const question = QUESTIONS[index];
  const total = QUESTIONS.length;
  const progress = Math.round(((index + (answer ? 1 : 0)) / total) * 100);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    groupRef.current?.querySelector<HTMLButtonElement>('button[role="radio"]')?.focus();
  }, [index]);

  function onKeyDown(event: React.KeyboardEvent) {
    const radios = Array.from(
      groupRef.current?.querySelectorAll<HTMLButtonElement>('button[role="radio"]') ?? []
    );
    const active = document.activeElement as HTMLButtonElement | null;
    const current = active ? radios.indexOf(active) : -1;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      radios[(current + 1 + radios.length) % radios.length]?.focus();
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      radios[(current - 1 + radios.length) % radios.length]?.focus();
    }
  }

  return (
    <section className="relative isolate overflow-hidden bg-[#f7f3ea]">
      <div className="pointer-events-none absolute -left-40 top-24 -z-10 h-[26rem] w-[26rem] rounded-full bg-[#18845f]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-10 -z-10 h-[22rem] w-[22rem] rounded-full bg-[#3b82f6]/[.08] blur-3xl" />

      <div className="mx-auto w-full max-w-[80rem] px-6 py-20 md:py-28">
        <div className="mx-auto w-full max-w-[760px]">
          <p className="mb-8 text-center text-[14px] leading-relaxed text-[#4a5566]">
            Wählen Sie <span className="font-semibold text-[#101b31]">Ja</span>,{" "}
            <span className="font-semibold text-[#101b31]">Nein</span> oder{" "}
            <span className="font-semibold text-[#101b31]">Unsicher</span>. Sie können jederzeit
            zurückgehen und am Ende Ihr Ergebnis sehen.
          </p>

          <div className="mb-10" aria-live="polite">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[.2em] text-[#18845f]">
                Frage {String(index + 1).padStart(2, "0")}
                <span className="text-[#4a5566]/60"> · von {String(total).padStart(2, "0")}</span>
              </span>
              <span className="font-mono text-[13px] font-semibold text-[#101b31] tabular-nums">
                {progress}%
              </span>
            </div>

            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#e3dccc]">
              <motion.div
                className="relative h-full rounded-full bg-gradient-to-r from-[#18845f] via-[#39c392] to-[#6ee7ba]"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: reduced ? 0 : 0.5, ease: [0.2, 0.6, 0.2, 1] }}
              >
                <span className="absolute inset-y-0 right-0 w-8 bg-gradient-to-r from-transparent to-white/60 blur-sm" />
              </motion.div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              {QUESTIONS.map((_, i) => (
                <span
                  key={i}
                  className={[
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    i < index
                      ? "bg-[#18845f]"
                      : i === index
                        ? "bg-[#18845f] ring-4 ring-[#18845f]/15"
                        : "bg-[#cfc7b6]",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: reduced ? 0 : 0.3, ease: [0.2, 0.6, 0.2, 1] }}
              className="relative overflow-hidden rounded-[1.75rem] border border-[#ddd6c9] bg-white p-8 shadow-[0_35px_80px_-55px_rgba(16,27,49,.55)] md:p-12"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#18845f] via-[#39c392] to-[#74a9ff]" />
              <span
                aria-hidden
                className="selbstcheck-display pointer-events-none absolute -right-4 -top-6 select-none text-[8rem] font-bold leading-none tracking-[-.06em] text-[#101b31]/[.035] md:text-[10rem]"
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <p className="relative text-[11px] font-semibold uppercase tracking-[.22em] text-[#18845f]">
                Frage {index + 1} von {total}
              </p>
              <h2 className="selbstcheck-display relative mt-4 text-[24px] font-bold leading-snug tracking-[-.02em] text-[#101b31] md:text-[30px]">
                {question.text}
              </h2>
              <p className="relative mt-4 text-[14px] leading-relaxed text-[#4a5566]">
                {question.hint}
              </p>

              <div
                ref={groupRef}
                role="radiogroup"
                aria-label="Antwort auswählen"
                onKeyDown={onKeyDown}
                className="relative mt-8 space-y-2.5"
              >
                {OPTIONS.map((option) => {
                  const selected = answer === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      tabIndex={selected || (!answer && option.value === "yes") ? 0 : -1}
                      onClick={() => onPick(option.value)}
                      className={[
                        "group relative flex min-h-[60px] w-full items-center gap-4 overflow-hidden rounded-xl border px-5 text-left text-[15.5px] transition-all duration-200",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#18845f] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                        selected
                          ? "border-[#18845f] bg-[#edf7f1] text-[#101b31] shadow-[0_10px_25px_-18px_rgba(24,132,95,.6)]"
                          : "border-[#ddd6c9] bg-white text-[#101b31] hover:-translate-y-0.5 hover:border-[#18845f]/50 hover:bg-[#faf7ef] hover:shadow-[0_10px_25px_-20px_rgba(16,27,49,.35)]",
                      ].join(" ")}
                    >
                      <span
                        aria-hidden
                        className={[
                          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                          selected
                            ? "border-[#18845f] bg-[#18845f]"
                            : "border-[#c9c1b0] group-hover:border-[#18845f]",
                        ].join(" ")}
                      >
                        {selected && <CheckCircle2 className="h-4 w-4 text-white" strokeWidth={3} />}
                      </span>
                      <span className="font-semibold">{option.label}</span>
                      <span
                        aria-hidden
                        className={[
                          "ml-auto font-mono text-[11px] uppercase tracking-[.2em] transition-colors",
                          selected ? "text-[#18845f]" : "text-[#a99f89] group-hover:text-[#18845f]",
                        ].join(" ")}
                      >
                        {option.value === "yes" ? "01" : option.value === "no" ? "02" : "03"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-10 flex items-center justify-between border-t border-[#ece5d5] pt-6">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={index === 0}
                  className="inline-flex items-center gap-2 text-[13px] font-medium text-[#4a5566] transition-colors hover:text-[#101b31] disabled:opacity-40 disabled:hover:text-[#4a5566]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Zurück
                </button>
                <span className="text-[12px] text-[#4a5566]/70">
                  Auswahl übernimmt automatisch.
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          <p className="mt-8 text-center text-[12px] text-[#4a5566]/80">
            Ihre Antworten bleiben in Ihrem Browser – es wird nichts übertragen.
          </p>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Computing */

function ComputingView() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0a1428] text-white">
      <div className="absolute -right-32 -top-40 -z-10 h-[34rem] w-[34rem] rounded-full bg-[#1b9a70]/20 blur-3xl" />
      <div className="absolute -left-48 bottom-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-[#3b82f6]/10 blur-3xl" />
      <div className="mx-auto flex min-h-[70vh] w-full max-w-[80rem] flex-col items-center justify-center px-6 py-24 text-center">
        <div className="relative mb-8 h-16 w-16">
          <span className="absolute inset-0 rounded-full border-2 border-white/10" />
          <span
            className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#6ee7ba]"
            style={{ animationDuration: "1.2s" }}
          />
        </div>
        <p className="selbstcheck-display text-2xl font-semibold text-white" aria-live="polite">
          Ihre Antworten werden ausgewertet …
        </p>
        <p className="mt-3 text-[14px] text-white/60">Einen Moment bitte.</p>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Result */

function ResultView({
  pct,
  risky,
  missing,
  verdict,
  recommended,
  onRestart,
}: {
  pct: number;
  risky: number;
  missing: number;
  verdict: Verdict;
  recommended: "schulung" | "gespraech";
  onRestart: () => void;
}) {
  const accent =
    verdict.band === "ok" ? "#6ee7ba" : verdict.band === "warn" ? "#f5c451" : "#f28b82";
  const fulfilled = QUESTIONS.length - risky - missing;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#0a1428] text-white">
        <div
          className="absolute -right-32 -top-40 -z-10 h-[34rem] w-[34rem] rounded-full blur-3xl"
          style={{ backgroundColor: `${accent}33` }}
        />
        <div className="absolute -left-48 bottom-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-[#3b82f6]/10 blur-3xl" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at 50% 30%, black 40%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 40%, transparent 75%)",
          }}
        />

        <div className="mx-auto w-full max-w-[80rem] px-6 py-24 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.04] px-3.5 py-1.5 text-[11.5px] font-semibold uppercase tracking-[.2em] text-[#6ee7ba] backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Ergebnis · Ihr Standortbild
            </span>

            <div className="mt-12 flex justify-center">
              <ScoreRing pct={pct} band={verdict.band} />
            </div>

            <div className="mt-10 flex justify-center">
              <BandBadge band={verdict.band} label={verdict.bandLabel} />
            </div>

            <h2 className="selbstcheck-display mt-6 text-4xl font-bold leading-[1.05] tracking-[-.03em] text-white md:text-5xl">
              {verdict.title}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[16.5px] leading-relaxed text-white/75">
              {verdict.body}
            </p>

            <div className="mx-auto mt-10 grid max-w-xl grid-cols-3 overflow-hidden rounded-xl border border-white/10 bg-white/[.04] backdrop-blur">
              <StatCell label="Erfüllt" value={fulfilled} accent="#6ee7ba" />
              <StatCell label="Lücke" value={risky} accent="#f28b82" border />
              <StatCell label="Unsicher" value={missing} accent="#f5c451" border />
            </div>

            <ResultActions />

            <p className="mx-auto mt-10 max-w-2xl text-[12.5px] leading-relaxed text-white/50">
              Dieses Ergebnis ist eine allgemeine Orientierung auf Basis Ihrer Angaben. Es ist keine
              Rechtsberatung und keine Aussage über die Rechtskonformität Ihres Unternehmens im
              Einzelfall.
            </p>

            <button
              type="button"
              onClick={onRestart}
              className="mt-6 text-[12.5px] text-white/60 underline-offset-4 hover:text-white hover:underline"
            >
              Selbstcheck erneut starten
            </button>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f3ea] py-20 md:py-28">
        <div className="mx-auto w-full max-w-[80rem] px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#18845f]">
              So geht es nach dem Ergebnis weiter
            </p>
            <h2 className="selbstcheck-display mt-4 text-4xl font-bold leading-[1.04] tracking-[-.035em] text-[#101b31] sm:text-5xl">
              Beide Wege sind kostenlos und ohne Verpflichtung.
            </h2>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2">
            <NextStepCard
              recommended={recommended === "gespraech"}
              eyebrow="Kostenloses Erstgespräch · 30 Minuten"
              title="Persönliche Standortbestimmung"
              text="Wir gehen Ihre Antworten gemeinsam durch und zeigen an einem Beispiel, wie Inventar, Richtlinie und Nachweise an einer Stelle zusammenlaufen. Danach entscheiden Sie in Ruhe, ob es zu Ihnen passt."
              cta="Erstgespräch buchen"
              href="/lass-uns-reden"
              internal
            />
            <NextStepCard
              recommended={recommended === "schulung"}
              eyebrow="KI-Schulung für Ihr Team"
              title="KI-Kompetenz nach Art. 4"
              text="Mit einer dokumentierten Schulung decken Sie die KI-Kompetenz nach Art. 4 EU AI Act ab – kompakt aufgebaut, mit Nachweis je Person."
              cta="Schulung anfragen"
              href="/lass-uns-reden"
              internal
            />
          </div>
        </div>
      </section>

      <EmailSummary pct={pct} />
      <SourceNote />
    </>
  );
}

function ResultActions() {
  const [done, setDone] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setDone(window.localStorage.getItem(SCHULUNG_STORAGE_KEY) === "1");
    } catch {
      setDone(false);
    }
  }, []);

  function markDone() {
    try {
      window.localStorage.setItem(SCHULUNG_STORAGE_KEY, "1");
    } catch {
      /* localStorage nicht verfügbar - Zustand bleibt nur in dieser Session */
    }
    setDone(true);
  }

  function reset() {
    try {
      window.localStorage.removeItem(SCHULUNG_STORAGE_KEY);
    } catch {
      /* siehe oben */
    }
    setDone(false);
  }

  if (done === null) return <div className="mt-10 h-[132px]" aria-hidden />;

  const primary =
    "group inline-flex h-[3.25rem] items-center justify-center gap-2 rounded-lg bg-[#18845f] px-7 text-sm font-semibold text-white shadow-[0_18px_45px_-18px_rgba(40,169,120,.75)] transition hover:-translate-y-0.5 hover:bg-[#126b4d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6ee7ba]";
  const secondary =
    "group inline-flex h-[3.25rem] items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/[.04] px-7 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/[.08] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6ee7ba]";

  return (
    <div className="mt-10">
      <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#6ee7ba]">
        Jetzt Lücke schließen – kostenlos
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {!done && (
          <Link to="/lass-uns-reden" className={primary}>
            KI-Schulung anfragen
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
        <Link to="/lass-uns-reden" className={done ? primary : secondary}>
          Kostenloses Erstgespräch buchen
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div className="mt-5">
        {done ? (
          <button
            type="button"
            onClick={reset}
            className="text-[11.5px] text-white/50 underline-offset-4 hover:text-white/80 hover:underline"
          >
            Schulung doch nicht absolviert? Wieder anzeigen
          </button>
        ) : (
          <button
            type="button"
            onClick={markDone}
            className="text-[11.5px] text-white/50 underline-offset-4 hover:text-white/80 hover:underline"
          >
            Schulung bereits absolviert – nur Erstgespräch anzeigen
          </button>
        )}
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  accent,
  border,
}: {
  label: string;
  value: number;
  accent: string;
  border?: boolean;
}) {
  return (
    <div className={["px-5 py-5", border ? "border-l border-white/10" : ""].join(" ")}>
      <p className="selbstcheck-display text-3xl font-bold tabular-nums" style={{ color: accent }}>
        {value}
      </p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[.18em] text-white/60">
        {label}
      </p>
    </div>
  );
}

function ScoreRing({ pct, band }: { pct: number; band: Band }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? pct : 0);
  const size = 220;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const from = band === "ok" ? "#6ee7ba" : band === "warn" ? "#f5c451" : "#f28b82";
  const to = band === "ok" ? "#39c392" : band === "warn" ? "#e0a025" : "#d96354";

  useEffect(() => {
    if (reduced) {
      setShown(pct);
      return;
    }
    const start = performance.now();
    const duration = 1100;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(Math.round(pct * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [pct, reduced]);

  const offset = circumference - (shown / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        aria-hidden
        className="absolute inset-0 rounded-full opacity-40 blur-3xl"
        style={{ backgroundColor: from }}
      />
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
        className="relative"
      >
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke="rgba(255,255,255,0.08)"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          stroke="url(#scoreGrad)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="selbstcheck-display text-[4.25rem] font-bold leading-none tabular-nums text-white">
          {shown}
        </span>
        <span className="mt-2 text-[10.5px] font-semibold uppercase tracking-[.24em] text-white/60">
          von 100
        </span>
      </div>
    </div>
  );
}

function BandBadge({ band, label }: { band: Band; label: string }) {
  const background =
    band === "ok"
      ? "rgba(110,231,186,0.12)"
      : band === "warn"
        ? "rgba(245,196,81,0.14)"
        : "rgba(242,139,130,0.14)";
  const borderColor =
    band === "ok"
      ? "rgba(110,231,186,0.45)"
      : band === "warn"
        ? "rgba(245,196,81,0.5)"
        : "rgba(242,139,130,0.5)";
  const color = band === "ok" ? "#6ee7ba" : band === "warn" ? "#f5c451" : "#f28b82";

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[.16em] backdrop-blur"
      style={{ background, borderColor, color }}
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

function NextStepCard({
  recommended,
  eyebrow,
  title,
  text,
  cta,
  href,
  internal,
}: {
  recommended: boolean;
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  internal?: boolean;
}) {
  const base =
    "mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#18845f]";
  const buttonClass = recommended
    ? `${base} bg-[#18845f] text-white shadow-[0_18px_45px_-22px_rgba(24,132,95,.7)] hover:-translate-y-0.5 hover:bg-[#126b4d]`
    : `${base} border border-[#9eabb7] text-[#101b31] hover:border-[#101b31]`;

  return (
    <div
      className={[
        "group relative flex h-full flex-col overflow-hidden rounded-2xl p-8 transition duration-500 sm:p-10",
        recommended
          ? "border-2 border-[#18845f] bg-[#f1f8f4] shadow-[0_32px_70px_-38px_rgba(24,132,95,.72)] lg:scale-[1.015]"
          : "border border-[#d9dfe5] bg-white shadow-[0_24px_60px_-50px_rgba(16,27,49,.7)] hover:-translate-y-1 hover:shadow-[0_28px_60px_-40px_rgba(16,27,49,.5)]",
      ].join(" ")}
    >
      <div
        className={
          recommended
            ? "absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#18845f] via-[#6bcaa6] to-[#18845f]"
            : "absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[#18845f] transition-transform duration-500 group-hover:scale-x-100"
        }
      />
      {recommended && (
        <span className="absolute right-5 top-3 rounded-full bg-[#18845f] px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[.14em] text-white">
          Empfohlener nächster Schritt
        </span>
      )}
      <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#18845f]">{eyebrow}</p>
      <h3 className="selbstcheck-display mt-3 text-2xl font-bold leading-tight tracking-[-.02em] text-[#101b31]">
        {title}
      </h3>
      <p className="mt-4 flex-1 text-[14.5px] leading-relaxed text-[#4a5566]">{text}</p>
      {internal ? (
        <Link to={href} className={buttonClass}>
          {cta} <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClass}>
          {cta} <ArrowRight className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

function EmailSummary({ pct }: { pct: number }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email || !consent) return;
    const subject = encodeURIComponent(`Selbstcheck-Zusammenfassung (${pct}/100)`);
    const body = encodeURIComponent(
      `Hallo KITech-Team,\n\nich habe den EU-AI-Act-Selbstcheck ausgefüllt und möchte eine Zusammenfassung meines Ergebnisses per E-Mail erhalten.\n\nErgebnis: ${pct}/100\nMeine E-Mail: ${email}\n\nDanke!`
    );
    if (typeof window !== "undefined") {
      window.location.href = `mailto:info@kitech-software.de?subject=${subject}&body=${body}`;
    }
  }

  return (
    <section className="bg-[#f7f3ea] py-20 md:py-28">
      <div className="mx-auto w-full max-w-[80rem] px-6">
        <div className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl border border-[#ddd6c9] bg-white p-8 shadow-[0_28px_65px_-50px_rgba(16,27,49,.5)] md:p-12">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#18845f]/10 blur-3xl" />
          <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#18845f]">
            Optional · nur bei Interesse
          </p>
          <h3 className="selbstcheck-display mt-3 text-2xl font-bold leading-tight tracking-[-.02em] text-[#101b31]">
            Zusammenfassung Ihres Ergebnisses per E-Mail erhalten.
          </h3>
          <p className="mt-3 text-[14.5px] leading-relaxed text-[#4a5566]">
            Freiwillig. Ohne E-Mail sehen Sie Ihr Ergebnis hier auf der Seite – es wird nichts
            gespeichert.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label htmlFor="sc-email" className="sr-only">
              E-Mail-Adresse
            </label>
            <input
              id="sc-email"
              type="email"
              required
              placeholder="ihre.adresse@firma.de"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full rounded-lg border border-[#d9dfe5] bg-white px-4 text-[14.5px] text-[#101b31] placeholder:text-[#a99f89] transition-colors focus:border-[#18845f] focus:outline-none focus:ring-2 focus:ring-[#18845f]/15"
            />
            <label className="flex items-start gap-3 text-[12.5px] leading-relaxed text-[#4a5566]">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#18845f]"
                required
              />
              <span>
                Ich willige ein, dass KITech Software meine E-Mail-Adresse zur einmaligen Zusendung
                der Zusammenfassung verarbeitet.{" "}
                <Link
                  to="/datenschutz"
                  className="underline underline-offset-2 hover:text-[#101b31]"
                >
                  Datenschutz
                </Link>
                .
              </span>
            </label>
            <button
              type="submit"
              disabled={!email || !consent}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#18845f] px-6 text-sm font-semibold text-white shadow-[0_18px_45px_-22px_rgba(24,132,95,.7)] transition hover:-translate-y-0.5 hover:bg-[#126b4d] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-[#18845f]"
            >
              <Mail className="h-4 w-4" />
              Zusammenfassung senden
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function SourceNote() {
  return (
    <section className="bg-[#f7f3ea]">
      <div className="mx-auto w-full max-w-[80rem] px-6 py-12">
        <p className="text-center text-[12px] font-medium uppercase tracking-[.18em] text-[#4a5566]/70">
          Jede Pflichtaussage quellenbelegt (VO (EU) 2024/1689) · Schulung &amp; Vorlagen statt
          Rechtsversprechen
        </p>
      </div>
    </section>
  );
}
