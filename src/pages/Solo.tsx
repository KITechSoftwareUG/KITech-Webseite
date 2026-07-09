import { motion } from "framer-motion";
import { FunnelLayout } from "@/components/layout/FunnelLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData, getWebPageSchema, getFAQSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { founderInfo } from "@/components/sections/FounderPortrait";
import { trackEvent } from "@/lib/plausible";
import portraitAsset from "@/assets/alkhalil-portrait.png.asset.json";
import {
  ArrowRight,
  Calendar,
  Users,
  Bot,
  Workflow,
  Target,
  Quote,
  Sparkles,
} from "lucide-react";

const CALENDLY_URL = "https://calendly.com/automatisieren-mit-kitech/30min";
const PORTRAIT_URL = portraitAsset.url;

function openCalendly(position: string) {
  trackEvent("Calendly_Klick", { position });
  window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
}

/**
 * Zielgruppen-Kacheln für "Für wen ist das?".
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
    title: "Gründer:innen & kleine Teams",
    description: "Du willst erste Automatisierungen mit n8n selbst aufbauen und verstehen, statt sie einzukaufen.",
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
    duration: "60–90 Minuten",
    description:
      "Eine fokussierte 1:1-Session zu einem konkreten Thema – z. B. dein Claude-Setup, ein n8n-Workflow oder ein akutes Automatisierungs-Problem.",
    price: "[Preis folgt]",
    featured: false,
  },
  {
    title: "Sprint-Paket",
    duration: "2–4 Wochen",
    description:
      "Mehrere aufeinander aufbauende Sessions: von der ersten Automatisierung bis zu einem laufenden System, das für dich arbeitet.",
    price: "[Preis folgt]",
    featured: true,
  },
  {
    title: "Laufende Begleitung",
    duration: "Monatlich",
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
 * Dezenter, einheitlicher Scroll-Übergang (Fade + leichtes Slide-up). Bewusst zurückhaltend
 * gehalten – der Auftrag verlangt visuelle Kraft primär aus Komposition/Typografie/Licht,
 * nicht aus aufwendiger Animation.
 */
function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Personalisierte Bildbehandlung für die Solo-Hero: Graustufen mit warmem Farb-Hover,
 * weicher Glow dahinter, Zitat-Karte darunter. Angelehnt an FounderPortrait.tsx (Variante
 * "hero"), aber mit solo-accent (Champagne) statt primary und seitenspezifischem Bildschnitt
 * fürs Split-Layout – bewusst lokal gehalten, um FounderPortrait.tsx (genutzt auf /kontakt
 * und /haltung) nicht anzufassen.
 */
function SoloPortrait() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
      className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-lg"
    >
      <div className="absolute inset-x-6 bottom-4 -z-10 h-2/3 rounded-full bg-solo-accent/15 blur-3xl" aria-hidden="true" />
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border/60 bg-secondary shadow-elevated">
        <img
          src={PORTRAIT_URL}
          alt={`${founderInfo.name}, ${founderInfo.role} der KITech Software UG`}
          loading="eager"
          className="h-full w-full object-cover object-top grayscale sepia-[0.12] brightness-95 transition-all duration-500 hover:grayscale-0 hover:sepia-0"
        />
      </div>
      <div className="relative -mt-10 mx-4 rounded-2xl border border-border/60 bg-background/95 p-4 shadow-card backdrop-blur-sm sm:-mt-12 sm:p-5">
        <p className="mb-3 text-sm italic leading-snug text-foreground/85">„{founderInfo.quoteShort}"</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-light text-foreground">{founderInfo.name}</p>
            <p className="text-xs text-muted-foreground">{founderInfo.role}</p>
          </div>
          <span className="text-[10px] tracking-widest text-solo-accent">KITECH</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Solo() {
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

      {/* 1. Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} aria-hidden="true" />
        <div className="container grid gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-solo-accent/30 bg-solo-accent/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-solo-accent">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Für Einzelpersonen & Solo-Selbstständige
            </span>
            <h1 className="font-display text-4xl italic leading-[1.1] text-foreground sm:text-5xl lg:text-6xl">
              Ayham – Einzel-KI-Coaching mit Claude, Codex und n8n
            </h1>
            <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-foreground/80 sm:text-xl">
              Lass uns deine Art, wie du arbeitest, auf ein neues Level anheben.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Persönliches 1:1-Coaching – zugeschnitten auf deinen Alltag, nicht auf eine Standard-Folie. Wir arbeiten
              gemeinsam an deinem echten Setup, nicht an einem generischen Beispiel.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="xl"
                onClick={() => openCalendly("solo-hero")}
                className="bg-solo-accent text-solo-accent-foreground hover:bg-solo-accent/90 shadow-soft"
              >
                Kostenloses Erstgespräch buchen
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <span className="text-xs text-muted-foreground">30 Minuten, unverbindlich, kostenlos</span>
            </div>
          </motion.div>

          <SoloPortrait />
        </div>
      </section>

      {/* 2. Für wen ist das? */}
      <section className="border-t border-border/50 py-20 sm:py-24">
        <div className="container">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-solo-accent">Zielgruppe</span>
            <h2 className="mt-4 font-display text-3xl italic text-foreground sm:text-4xl">Für wen ist das gedacht?</h2>
            <p className="mt-4 text-muted-foreground">
              Dieses Coaching ist für Menschen, die selbst mit KI arbeiten wollen – nicht für Unternehmen, die eine
              eigene Abteilung dafür aufbauen.
            </p>
          </FadeIn>

          {/* Card-Stil-Entscheidung (bewusst, siehe auch Enterprise.tsx): Solo nutzt durchgehend
              transluzente bg-card/NN-Flaechen und freistehende Icons ohne umrahmten Container -
              das ist keine Inkonsistenz, sondern die visuelle Umsetzung von "warm/persoenlich"
              aus dem Auftrag (weich, offen, weniger formal). Enterprise nutzt im Gegenzug
              durchgehend solide bg-card-Flaechen mit umrahmten Icon-Chips fuer "kuehl/seriös/
              institutionell". Beide Varianten sind jeweils auf ihrer Seite 100% konsistent
              durchgezogen (keine Card auf dieser Seite nutzt solides bg-card) - nicht angleichen. */}
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((a, i) => (
              <FadeIn
                key={a.title}
                delay={i * 0.08}
                className="rounded-2xl border border-border/60 bg-card/30 p-6"
              >
                <a.icon className="h-6 w-6 text-solo-accent" aria-hidden="true" />
                <h3 className="mt-4 text-base font-medium text-foreground">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.description}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Format & Angebot (Platzhalter-Struktur, Preise final offen) */}
      <section className="border-t border-border/50 py-20 sm:py-24">
        <div className="container">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-solo-accent">Format & Angebot</span>
            <h2 className="mt-4 font-display text-3xl italic text-foreground sm:text-4xl">
              Wie das Coaching aufgebaut ist
            </h2>
            <p className="mt-4 text-muted-foreground">
              Die genaue Struktur und die Preise werden aktuell final abgestimmt. So ist der geplante Rahmen:
            </p>
          </FadeIn>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {offers.map((offer, i) => (
              <FadeIn
                key={offer.title}
                delay={i * 0.1}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  offer.featured
                    ? "border-solo-accent/50 bg-solo-accent/[0.06] shadow-elevated"
                    : "border-border/60 bg-card/30"
                }`}
              >
                {offer.featured && (
                  <span className="absolute -top-3 left-8 rounded-full bg-solo-accent px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-solo-accent-foreground">
                    Empfohlener Einstieg
                  </span>
                )}
                <h3 className="font-display text-2xl italic text-foreground">{offer.title}</h3>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{offer.duration}</p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{offer.description}</p>
                <p className="mt-6 text-lg font-light text-foreground/60">{offer.price}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Testimonials (Platzhalter-Struktur, keine erfundenen Namen/Zitate) */}
      <section className="border-t border-border/50 py-20 sm:py-24">
        <div className="container">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-solo-accent">Stimmen</span>
            <h2 className="mt-4 font-display text-3xl italic text-foreground sm:text-4xl">
              Was Teilnehmer:innen sagen
            </h2>
            <p className="mt-4 text-muted-foreground">
              Hier entstehen in Kürze echte Stimmen aus dem Coaching. Aktuell die geplante Platzhalter-Struktur:
            </p>
          </FadeIn>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <FadeIn
                key={i}
                delay={i * 0.08}
                className="flex flex-col rounded-2xl border border-dashed border-border/60 bg-card/20 p-8"
              >
                <Quote className="h-6 w-6 text-solo-accent/60" aria-hidden="true" />
                <p className="mt-4 flex-1 text-sm italic leading-relaxed text-muted-foreground">
                  [Testimonial folgt]
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full border border-dashed border-border/60" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-foreground/70">[Name folgt]</p>
                    <p className="text-xs text-muted-foreground">[Rolle folgt]</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="border-t border-border/50 py-20 sm:py-24">
        <div className="container max-w-3xl">
          <FadeIn className="text-center">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-solo-accent">FAQ</span>
            <h2 className="mt-4 font-display text-3xl italic text-foreground sm:text-4xl">
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

      {/* 6. Abschluss-CTA */}
      <section className="relative overflow-hidden border-t border-border/50 py-20 sm:py-28">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} aria-hidden="true" />
        <div className="container text-center">
          <FadeIn className="mx-auto max-w-2xl">
            <h2 className="font-display text-3xl italic leading-tight text-foreground sm:text-4xl lg:text-5xl">
              Lass uns deine Art, wie du arbeitest, auf ein neues Level anheben.
            </h2>
            <p className="mt-5 text-muted-foreground">
              Im kostenlosen Erstgespräch schauen wir gemeinsam, wo Claude, Codex und n8n für dich den größten
              Unterschied machen.
            </p>
            <div className="mt-8 flex justify-center">
              <Button
                size="xl"
                onClick={() => openCalendly("solo-final-cta")}
                className="bg-solo-accent text-solo-accent-foreground hover:bg-solo-accent/90 shadow-soft"
              >
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Kostenloses Erstgespräch buchen
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </FunnelLayout>
  );
}
