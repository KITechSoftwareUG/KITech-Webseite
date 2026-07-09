import { motion, useReducedMotion } from "framer-motion";
import { FunnelLayout } from "@/components/layout/FunnelLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData, getWebPageSchema, getFAQSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { SignalField } from "@/components/canvas/SignalField";
import { founderInfo } from "@/components/sections/FounderPortrait";
import { trackEvent } from "@/lib/plausible";
import {
  ArrowRight,
  Calendar,
  Users,
  Bot,
  Workflow,
  Target,
  Quote,
  Sparkles,
  Flame,
  Lightbulb,
  User,
  Building2,
  X,
  Check,
  ShieldCheck,
  Compass,
} from "lucide-react";

const CALENDLY_URL = "https://calendly.com/automatisieren-mit-kitech/30min";

function openCalendly(position: string) {
  trackEvent("Calendly_Klick", { position });
  window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
}

/** Section 2 (PAIN): konkrete, erkennbare "schon-verbrannt"-Situationen statt abstrakter Klagen. */
const painPoints = [
  "Ein KI-Tool-Abo nach dem anderen ausprobiert – benutzt wird am Ende keins wirklich.",
  "Eine Agentur bezahlt, die eine schicke Präsentation geliefert hat und sonst nichts.",
  "Ein Wochenende mit YouTube-Tutorials investiert – und danach trotzdem allein dagestanden.",
];

/**
 * Section 4 (Optionen A/B): bewusst genau zwei Spalten, keine Card-Grid-Wiederholung, sondern
 * ein klarer Kontrast mit "VS"-Trenner in der Mitte. Beide Optionen enden in einem echten
 * Nachteil für genau diese Zielgruppe (Solo/2-6-Personen-Teams), nicht in einer Karikatur.
 */
const options = [
  {
    icon: User,
    label: "OPTION A",
    title: "Allein weitermachen",
    downsides: [
      "Prompt-Sammlungen und Trial-and-Error nach Feierabend",
      "Kein System, das wirklich trägt – nur ein paar Prompts, die halbwegs funktionieren",
      "Du bleibst der Flaschenhals für jede Entscheidung",
    ],
  },
  {
    icon: Building2,
    label: "OPTION B",
    title: "Eine große KI-Agentur beauftragen",
    downsides: [
      "Wochenlanges Onboarding, ein Account Manager statt der Person, die wirklich baut",
      "Eine Lösung, die für einen Konzern gedacht war – nicht für dich mit 2–6 Leuten",
      "Hohe monatliche Kosten für ein Paket von der Stange",
    ],
  },
];

/** Section 7 (Prozess der Zusammenarbeit): drei echte Schritte, keine Standard-Nummerierung ohne Sequenz. */
const processSteps = [
  {
    number: "01",
    icon: Compass,
    title: "Standortbestimmung",
    description:
      "Im kostenlosen Erstgespräch schauen wir auf deinen echten Alltag: Wo bremst dich das gerade konkret aus?",
  },
  {
    number: "02",
    icon: Workflow,
    title: "Gemeinsame Umsetzung",
    description:
      "Wir arbeiten live an deinem echten Fall – deinem Claude-Setup, deinem n8n-Workflow, deinem Code – nicht an einem generischen Beispiel.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Eigenständig weiterarbeiten",
    description:
      "Das System bleibt bei dir. Du verstehst, kontrollierst und erweiterst es selbst – ohne dauerhaft von uns abhängig zu sein.",
  },
];

/** Section 8c (Features): konkrete, greifbare Bausteine statt vager Buzzwords. */
const features = [
  "Individuelles Claude-Setup für deinen Alltag",
  "n8n-Automatisierungen, die du selbst verstehst",
  "Codex-gestützte Coding-Workflows",
  "Prompt- und Vorlagen-Bibliothek für deine Branche",
  "Direkter Draht zu Ayham – keine Ticket-Warteschlange",
  "Remote, flexibel, an deinem Bildschirm",
];

/**
 * Zielgruppen-Einträge für "Für wen ist das?". Läuft als vertikale, durch Linien getrennte
 * Liste statt als vier gleichförmige Karten - bewusste Layout-Variation, kein Card-Grid-Reflex.
 */
const audiences = [
  {
    icon: Users,
    title: "Solo-Selbstständige & Freelancer",
    description: "Du willst wiederkehrende Aufgaben abgeben und mehr Zeit für die Arbeit gewinnen, die wirklich zählt.",
  },
  {
    icon: Bot,
    title: "Berater:innen, Coaches & Kreative",
    description: "Du willst Claude und Codex fest in deinen Alltag integrieren – nicht nur gelegentlich ausprobieren.",
  },
  {
    icon: Workflow,
    title: "Agenturen mit 2–6 Mitarbeiter:innen",
    description: "Du willst erste Automatisierungen mit n8n selbst aufbauen und verstehen, statt sie teuer einzukaufen.",
  },
  {
    icon: Target,
    title: "Alle mit KI-Frust",
    description: "Du hast KI-Tools ausprobiert, spürst im Alltag aber noch keinen echten Hebel.",
  },
];

/**
 * Format/Angebot – Platzhalter-Struktur. Preise sind bewusst noch nicht final,
 * siehe [Preis folgt]-Markierung. Auftrag: Content darf hier Template bleiben.
 */
const offers = [
  {
    title: "Einzelsession",
    duration: "60–90 MINUTEN",
    description:
      "Eine fokussierte 1:1-Session zu einem konkreten Thema – z. B. dein Claude-Setup, ein n8n-Workflow oder ein akutes Automatisierungs-Problem.",
    price: "[Preis folgt]",
    featured: false,
  },
  {
    title: "Sprint-Paket",
    duration: "2–4 WOCHEN",
    description:
      "Mehrere aufeinander aufbauende Sessions: von der ersten Automatisierung bis zu einem laufenden System, das für dich arbeitet.",
    price: "[Preis folgt]",
    featured: true,
  },
  {
    title: "Laufende Begleitung",
    duration: "MONATLICH",
    description:
      "Kontinuierliche Begleitung für alle, die ihr KI-Setup dauerhaft weiterentwickeln und aktuell halten wollen.",
    price: "[Preis folgt]",
    featured: false,
  },
];

/**
 * FAQ – plausible, evergreene Fragen zum Coaching-Format. Antworten sind Entwurfs-Copy;
 * die Preis-Antwort bleibt bewusst als Platzhalter, bis Angebot/Preise final stehen.
 */
const faqs = [
  {
    question: "Wie läuft eine Coaching-Session konkret ab?",
    answer:
      "Wir starten bei deiner aktuellen Arbeitsweise: Wo bremst dich das gerade aus? Danach arbeiten wir live an deinem Fall – mit Claude, Codex oder n8n, nicht an einem austauschbaren Beispiel.",
  },
  {
    question: "Brauche ich technisches Vorwissen?",
    answer:
      "Nein. Das Coaching passt sich deinem Level an – egal ob du gerade erst mit KI-Tools startest oder schon automatisierst und den nächsten Schritt gehen willst.",
  },
  {
    question: "Welche Tools stehen im Mittelpunkt?",
    answer:
      "Vor allem Claude als KI-Assistent für Text, Code und Analyse, Codex-gestützte Coding-Workflows und n8n für Automatisierungen – abgestimmt darauf, was in deinem Alltag wirklich Zeit spart.",
  },
  {
    question: "Findet das Coaching remote statt?",
    answer:
      "Ja, per Video-Call. So arbeiten wir flexibel und direkt an deinem Bildschirm, unabhängig vom Standort.",
  },
  {
    question: "Was kostet das Coaching?",
    answer:
      "[Preisdetails folgen in Kürze.] Im kostenlosen Erstgespräch besprechen wir, welches Format zu dir passt.",
  },
];

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Dezenter, einheitlicher Scroll-Übergang (Fade + leichtes Slide-up). Respektiert
 * prefers-reduced-motion (Framer Motion prüft das nicht automatisch) - bei reduzierter
 * Bewegung startet der Inhalt bereits sichtbar an Zielposition, keine Animation läuft.
 */
function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Solo() {
  const reduceMotion = useReducedMotion();

  return (
    <FunnelLayout pathLabel="Einzel-Coaching" accentClassName="text-solo-accent">
      <SEOHead
        title="Einzel-KI-Coaching mit Ayham – Claude, Codex, n8n"
        description="Individuelles KI-Coaching mit Ayham Alkhalil: Claude, Codex, n8n und moderne AI-Workflows für deine Arbeitsweise."
        canonical="/solo"
      />
      <StructuredData
        data={getWebPageSchema(
          "Einzel-KI-Coaching mit Ayham",
          "Individuelles KI-Coaching mit Ayham Alkhalil: Claude, Codex, n8n und moderne AI-Workflows für deine Arbeitsweise.",
          "https://kitech-software.de/solo"
        )}
      />
      <StructuredData data={getFAQSchema(faqs)} />

      {/* 1. Hero – kein Foto: das Signal Field trägt das gesamte visuelle Gewicht,
          ruhig eingestellt (Solo bleibt der zurückhaltendere der beiden Funnel-Pfade). */}
      {/* "isolate" ist hier notwendig, nicht kosmetisch: "relative" allein erzeugt ohne
          eigenen z-index keinen neuen Stacking-Context, sonst landet das "-z-10"-Canvas
          hinter dem undurchsichtigen bg-background des Layout-Wrappers (verifiziert). */}
      <section className="relative isolate overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <SignalField density={0.7} intensity={0.85} baseColor="--primary" accentColor="--solo-accent" />
        </div>
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/55 to-background/10"
          aria-hidden="true"
        />
        <div className="container relative py-20 sm:py-28 lg:py-36">
          <motion.div
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.7, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-solo-accent/30 bg-solo-accent/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-solo-accent">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Für Freelancer &amp; kleine Teams
            </span>
            <h1
              className={`kinetic-display text-balance text-4xl leading-[1.05] text-foreground sm:text-5xl lg:text-6xl ${
                reduceMotion ? "" : "kinetic-morph-in"
              }`}
            >
              Ayham — Einzel-KI-Coaching mit Claude, Codex und n8n
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg font-light leading-relaxed text-foreground/85 sm:text-xl">
              Lass uns deine Art, wie du arbeitest, auf ein neues Level anheben.
            </p>
            <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Persönliches 1:1-Coaching – zugeschnitten auf deinen Alltag, nicht auf eine Standard-Folie. Wir arbeiten
              gemeinsam an deinem echten Setup, nicht an einem generischen Beispiel.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="xl"
                onClick={() => openCalendly("solo-hero")}
                className="bg-solo-accent text-solo-accent-foreground hover:bg-solo-accent/90 shadow-soft-solo"
              >
                Kostenloses Erstgespräch buchen
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <span className="text-xs text-muted-foreground">30 Minuten, unverbindlich, kostenlos</span>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border/60 pt-6">
              <div className="flex items-center gap-2.5">
                <span className="kinetic-data text-[11px] text-muted-foreground">COACH</span>
                <span className="text-sm text-foreground">{founderInfo.name}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="kinetic-data text-[11px] text-muted-foreground">STACK</span>
                <span className="text-sm text-foreground">Claude · Codex · n8n</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="kinetic-data text-[11px] text-muted-foreground">FORMAT</span>
                <span className="text-sm text-foreground">1:1 Remote</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. PAIN – "Du hast dich schon verbrannt": konkrete, wiedererkennbare Situationen
          statt abstrakter Klage. Flame greift die Formulierung wörtlich auf. */}
      <section className="border-t border-border/60 py-20 sm:py-24">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <FadeIn className="lg:col-span-4">
              <Flame className="h-8 w-8 text-solo-accent" aria-hidden="true" />
              <h2 className="kinetic-display mt-4 text-balance text-3xl text-foreground sm:text-4xl">
                Du hast dich schon verbrannt.
              </h2>
              <p className="mt-5 text-pretty text-muted-foreground">
                Und du bist nicht das Problem. Die Angebote, die du bisher probiert hast, waren einfach die falschen.
              </p>
            </FadeIn>

            <div className="lg:col-span-8">
              {painPoints.map((point, i) => (
                <FadeIn
                  key={point}
                  delay={i * 0.06}
                  className={`flex items-start gap-4 py-6 ${i !== 0 ? "border-t border-border/50" : ""}`}
                >
                  <X className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
                  <p className="text-pretty text-base leading-relaxed text-foreground/85">{point}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. "Du weißt, dass du was ändern musst" – der Moment der Klarheit zwischen
          Schmerz und Entscheidung. Bewusst kurz und zentriert statt eines weiteren Listen-Layouts. */}
      <section className="border-t border-border/60 py-20 sm:py-24">
        <div className="container max-w-2xl text-center">
          <FadeIn>
            <Lightbulb className="mx-auto h-8 w-8 text-solo-accent" aria-hidden="true" />
            <h2 className="kinetic-display mt-4 text-balance text-3xl text-foreground sm:text-4xl">
              Du weißt, dass du was ändern musst.
            </h2>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
              Du siehst, wie andere Freelancer und kleine Teams mit KI in der Hälfte der Zeit mehr schaffen. Das
              Potenzial ist real. Was dir fehlt, ist nicht noch ein Tool – sondern jemand, der so lange mit dir an
              deinem echten Alltag arbeitet, bis es wirklich sitzt.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* 4. Optionen A/B – bewusst genau zwei Spalten mit "VS"-Trenner, kein Card-Grid-Reflex:
          eine echte, kontrastive Gegenüberstellung statt einer beliebigen N-Karten-Liste. */}
      <section className="border-t border-border/60 py-20 sm:py-24">
        <div className="container">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="kinetic-display text-balance text-3xl text-foreground sm:text-4xl">
              Was sind deine Optionen?
            </h2>
          </FadeIn>

          <div className="relative mt-14 grid gap-10 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-border/60">
            {options.map((option, i) => (
              <FadeIn key={option.title} delay={i * 0.08} className="lg:px-10 first:lg:pl-0 last:lg:pr-0">
                <span className="kinetic-data text-[11px] text-muted-foreground">{option.label}</span>
                <div className="mt-3 flex items-center gap-3">
                  <option.icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                  <h3 className="kinetic-display text-xl text-foreground">{option.title}</h3>
                </div>
                <ul className="mt-5 space-y-3">
                  {option.downsides.map((downside) => (
                    <li key={downside} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive/70" aria-hidden="true" />
                      <span className="text-pretty">{downside}</span>
                    </li>
                  ))}
                </ul>
              </FadeIn>
            ))}
            <span className="kinetic-data pointer-events-none absolute left-1/2 top-0 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground lg:flex">
              VS
            </span>
          </div>
        </div>
      </section>

      {/* 5. Pivot – "Du brauchst was anderes": schmale, textgeführte Bruchstelle zwischen
          Problem und Lösung. Bewusst ohne Karte/Rahmen, reine Typografie als Statement. */}
      <section className="border-y border-solo-accent/30 bg-solo-accent/[0.06] py-14 sm:py-16">
        <div className="container text-center">
          <FadeIn>
            <p className="kinetic-display text-balance text-2xl text-foreground sm:text-3xl lg:text-4xl">
              Du brauchst was anderes.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* 6. Lösung */}
      <section className="border-b border-border/60 py-20 sm:py-24">
        <div className="container max-w-2xl">
          <FadeIn>
            <h2 className="kinetic-display text-balance text-3xl text-foreground sm:text-4xl">
              Coaching, das sich deinem Alltag anpasst – nicht umgekehrt.
            </h2>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
              Kein Kurs von der Stange, keine Agentur-Standardfolie. Du arbeitest direkt mit mir an deinem echten
              Setup – mit Claude, Codex und n8n – so lange, bis es läuft und du es allein weiterführen kannst.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* 7. Prozess der Zusammenarbeit – verbundene Timeline statt Card-Grid, konsistent mit
          dem Muster auf /enterprise. */}
      <section className="py-20 sm:py-24">
        <div className="container">
          <FadeIn className="max-w-2xl">
            <h2 className="kinetic-display text-balance text-3xl text-foreground sm:text-4xl">
              Prozess der Zusammenarbeit
            </h2>
          </FadeIn>

          <div className="mt-14 grid gap-10 border-t border-border md:grid-cols-3 md:gap-8">
            {processSteps.map((step, i) => (
              <FadeIn key={step.number} delay={i * 0.08} className="-mt-px border-t-2 border-solo-accent pt-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="kinetic-data text-3xl text-solo-accent/40">{step.number}</span>
                  <step.icon className="h-5 w-5 text-solo-accent" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-light text-foreground">{step.title}</h3>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 8a. Branchen/Zielgruppen – vertikale Liste statt vier gleichförmiger Karten. */}
      <section className="border-t border-border/60 py-20 sm:py-24">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <FadeIn className="lg:col-span-4">
              <h2 className="kinetic-display text-balance text-3xl text-foreground sm:text-4xl">
                Für wen ist das gedacht?
              </h2>
              <p className="mt-5 text-pretty text-muted-foreground">
                Dieses Coaching ist für Menschen, die selbst mit KI arbeiten wollen – nicht für Unternehmen, die eine
                eigene Abteilung dafür aufbauen.
              </p>
            </FadeIn>

            <div className="lg:col-span-8">
              {audiences.map((a, i) => (
                <FadeIn
                  key={a.title}
                  delay={i * 0.06}
                  className={`flex items-start gap-5 py-6 ${i !== 0 ? "border-t border-border/50" : ""}`}
                >
                  <a.icon className="mt-0.5 h-5 w-5 shrink-0 text-solo-accent" aria-hidden="true" />
                  <div>
                    <h3 className="text-base font-medium text-foreground">{a.title}</h3>
                    <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
                      {a.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8b. Features – konkrete Bausteine als Tag-Reihe statt weiterer Cards. */}
      <section className="border-t border-border/60 py-20 sm:py-24">
        <div className="container">
          <FadeIn className="max-w-2xl">
            <h2 className="kinetic-display text-balance text-3xl text-foreground sm:text-4xl">
              Was wir konkret gemeinsam aufbauen
            </h2>
          </FadeIn>
          <div className="mt-10 flex flex-wrap gap-3">
            {features.map((feature, i) => (
              <FadeIn
                key={feature}
                delay={i * 0.04}
                className="inline-flex items-center gap-2.5 rounded-full border border-border px-4 py-2"
              >
                <Check className="h-3.5 w-3.5 text-solo-accent" aria-hidden="true" />
                <span className="text-sm text-foreground/85">{feature}</span>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 8c. Angebot (Platzhalter-Struktur, Preise final offen) – zusammenhängende
          Streifen-Leiste statt drei einzeln umrandeter Karten. */}
      <section className="border-t border-border/60 py-20 sm:py-24">
        <div className="container">
          <FadeIn className="max-w-2xl">
            <h2 className="kinetic-display text-balance text-3xl text-foreground sm:text-4xl">
              Wie das Coaching aufgebaut ist
            </h2>
            <p className="mt-5 text-pretty text-muted-foreground">
              Die genaue Struktur und die Preise werden aktuell final abgestimmt. So ist der geplante Rahmen:
            </p>
          </FadeIn>

          <div className="mt-14 grid divide-y divide-border/50 border-t border-border/50 lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:rounded-xl lg:border">
            {offers.map((offer, i) => (
              <FadeIn
                key={offer.title}
                delay={i * 0.08}
                className={`relative flex flex-col p-8 ${offer.featured ? "bg-solo-accent/[0.06]" : ""}`}
              >
                {offer.featured && (
                  <span className="absolute right-6 top-6 rounded-full bg-solo-accent px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-solo-accent-foreground">
                    Empfohlen
                  </span>
                )}
                <span className="kinetic-data text-[11px] text-muted-foreground">{offer.duration}</span>
                <h3 className="kinetic-display mt-3 text-xl text-foreground">{offer.title}</h3>
                <p className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {offer.description}
                </p>
                <p className="mt-6 text-lg font-light text-foreground/70">{offer.price}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 8d. Trust – ein einzelner, deutlich als Platzhalter markierter Testimonial-Block. */}
      <section className="border-t border-border/60 py-20 sm:py-24">
        <div className="container max-w-2xl">
          <FadeIn className="text-center">
            <h2 className="kinetic-display text-balance text-3xl text-foreground sm:text-4xl">
              Was Teilnehmer:innen sagen
            </h2>
            <p className="mt-5 text-pretty text-muted-foreground">
              Hier entstehen in Kürze echte Stimmen aus dem Coaching.
            </p>
          </FadeIn>

          <FadeIn delay={0.1} className="mt-12 rounded-xl border border-dashed border-border/60 p-10 text-center">
            <Quote className="mx-auto h-6 w-6 text-solo-accent/70" aria-hidden="true" />
            <p className="mt-5 text-pretty text-base italic leading-relaxed text-muted-foreground">
              [Testimonial folgt]
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="h-9 w-9 shrink-0 rounded-full border border-dashed border-border/60" aria-hidden="true" />
              <div className="text-left">
                <p className="text-sm text-foreground/70">[Name folgt]</p>
                <p className="text-xs text-muted-foreground">[Rolle folgt]</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 8e. Über uns – Gründer-Zitat, textbasiert, kein Bildrahmen (siehe Hero-Kommentar). */}
      <section className="border-t border-border/60 py-20 sm:py-24">
        <div className="container max-w-2xl text-center">
          <FadeIn>
            <span className="kinetic-data text-[11px] text-muted-foreground">ÜBER MICH</span>
            <blockquote className="mt-4 text-pretty text-xl italic leading-relaxed text-foreground/85 sm:text-2xl">
              „{founderInfo.quoteShort}"
            </blockquote>
            <footer className="mt-4 not-italic text-sm text-muted-foreground">
              — {founderInfo.name}, {founderInfo.role}
            </footer>
          </FadeIn>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="border-t border-border/60 py-20 sm:py-24" id="faq">
        <div className="container max-w-3xl">
          <FadeIn className="text-center">
            <h2 className="kinetic-display text-balance text-3xl text-foreground sm:text-4xl">
              Häufige Fragen zum Coaching
            </h2>
          </FadeIn>

          <FadeIn delay={0.1} className="mt-12">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={faq.question} value={`item-${i}`} className="border-border/60">
                  <AccordionTrigger className="text-left font-light text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeIn>
        </div>
      </section>

      {/* 10. No-Brainer Pitch – ruhiges Signal Field als Bookend zur Hero. Copy macht das
          Risiko explizit gleich null, statt nur "kostenlos" zu behaupten. */}
      {/* "isolate" noetig, siehe Kommentar an der Hero-Section weiter oben. */}
      <section className="relative isolate overflow-hidden border-t border-border/60 py-20 sm:py-28">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <SignalField density={0.6} intensity={0.75} baseColor="--primary" accentColor="--solo-accent" />
        </div>
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background/55 to-background"
          aria-hidden="true"
        />
        <div className="container text-center">
          <FadeIn className="mx-auto max-w-2xl">
            <h2 className="kinetic-display text-balance text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
              Lass uns deine Art, wie du arbeitest, auf ein neues Level anheben.
            </h2>
            <p className="mt-5 text-pretty text-muted-foreground">
              30 Minuten, kostenlos, unverbindlich. Kein Angebot, kein Verkaufsdruck – nur eine ehrliche Einschätzung,
              ob und wie das Coaching für dich funktioniert. Wenn nicht: Du gehst trotzdem mit Klarheit raus.
            </p>
            <div className="mt-8 flex justify-center">
              <Button
                size="xl"
                onClick={() => openCalendly("solo-final-cta")}
                className="bg-solo-accent text-solo-accent-foreground hover:bg-solo-accent/90 shadow-soft-solo"
              >
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Kostenloses Erstgespräch buchen
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              — {founderInfo.name}, {founderInfo.role}
            </p>
          </FadeIn>
        </div>
      </section>
    </FunnelLayout>
  );
}
