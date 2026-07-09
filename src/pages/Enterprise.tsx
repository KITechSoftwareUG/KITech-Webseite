import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FunnelLayout } from "@/components/layout/FunnelLayout";
import { trackEvent } from "@/lib/plausible";
import { SEOHead } from "@/components/seo/SEOHead";
import {
  StructuredData,
  getOrganizationSchema,
  getLocalBusinessSchema,
  getWebPageSchema,
  getFounderPersonSchema,
  getFAQSchema,
  getReviewSchema,
  getBreadcrumbSchema,
} from "@/components/seo/StructuredData";
import { EnterpriseCloud } from "@/components/sections/EnterpriseCloud";
import { TrustRiskReversal } from "@/components/conversion/TrustRiskReversal";
import { founderInfo } from "@/components/sections/FounderPortrait";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  Check,
  Star,
  Shield,
  ShieldAlert,
  MapPin,
  Clipboard,
  Database,
  Rocket,
  Building2,
  FileCheck,
  Wrench,
  Workflow,
  FileSearch,
  MessageSquare,
  BarChart3,
  TrendingDown,
  Network,
  Award,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

import niimmoLogo from "@/assets/niimmo-logo.png";
import certconsultingLogo from "@/assets/certconsulting-logo.png";
import kremaLogo from "@/assets/krema-logo.png";
import alltagshilfeLogo from "@/assets/alltagshilfe-logo.png";
import expatvantageLogo from "@/assets/expatvantage-logo.png";

// Hinweis: Der Slug "/30min" spiegelt die tatsächliche Event-Dauer wider – die Copy auf
// dieser Seite ist bewusst auf "30 Minuten" vereinheitlicht (siehe Solo.tsx). Falls ein
// kürzeres 20-Minuten-Format gewünscht ist: eigenes Calendly-Event anlegen und sowohl
// diese URL als auch die "30-Minuten"-Textstellen in dieser Datei entsprechend anpassen.
const CALENDLY_URL = "https://calendly.com/automatisieren-mit-kitech/30min";

/** Blueprint-/Grid-Linien-Overlay – kühles, technisches Motiv, das sich durch
 * Hero-Hintergrund und Gründer-Bildbehandlung zieht (bewusster Kontrast zur
 * organischeren, wärmeren Solo-Seite). */
const GRID_PATTERN_STYLE: CSSProperties = {
  backgroundImage:
    "linear-gradient(hsl(var(--enterprise-accent) / 0.16) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--enterprise-accent) / 0.16) 1px, transparent 1px)",
  backgroundSize: "34px 34px",
};

const trustLogos = [
  { name: "NiImmo Holding GmbH", logo: niimmoLogo },
  { name: "KREMA Group", logo: kremaLogo },
  { name: "cert consulting Pane", logo: certconsultingLogo },
  { name: "Alltagshilfe Fischer GmbH", logo: alltagshilfeLogo },
  { name: "ExpatVantage", logo: expatvantageLogo },
];

const businessProblems = [
  {
    icon: TrendingDown,
    title: "Unklarer ROI",
    text: "Viele KI-Initiativen bleiben Pilotprojekte ohne belastbaren Wirtschaftlichkeitsnachweis – Budget fließt, Wirkung bleibt unklar.",
  },
  {
    icon: ShieldAlert,
    title: "Sicherheits- & Compliance-Risiko",
    text: "Unternehmensdaten wandern unkontrolliert in Public-Cloud-KI-Tools außerhalb der EU – ohne AVV, ohne Datenresidenz-Nachweis.",
  },
  {
    icon: Network,
    title: "Fehlende Governance",
    text: "Kein zentrales Monitoring, keine klaren Verantwortlichkeiten, keine auditierbaren Prompts und Outputs über Abteilungen hinweg.",
  },
];

const useCases = [
  {
    icon: Workflow,
    title: "Prozessautomatisierung",
    description:
      "Wiederkehrende Abläufe wie Rechnungsprüfung, Auftragsbearbeitung und Reporting laufen automatisiert – Mitarbeitende prüfen nur noch Ausnahmen.",
    stack: "n8n · Python · Supabase",
  },
  {
    icon: FileSearch,
    title: "Wissensmanagement & RAG",
    description:
      "Unternehmensinternes Wissen wird durchsuchbar: Ihre KI beantwortet Fragen auf Basis Ihrer eigenen Dokumente – mit Quellenangabe statt Halluzination.",
    stack: "Azure AI Search · RAG · Claude",
  },
  {
    icon: MessageSquare,
    title: "Kundenservice",
    description:
      "Erster Kontaktpunkt für Support-Anfragen, Terminbuchung und Angebote – rund um die Uhr, mit nahtloser Übergabe an Ihr Team bei Bedarf.",
    stack: "Claude API · n8n · CRM",
  },
  {
    icon: BarChart3,
    title: "Datenanalyse",
    description:
      "Rohdaten aus ERP, CRM und Excel werden automatisch aufbereitet, klassifiziert und in Dashboards nutzbar gemacht – statt in Tabellen zu versanden.",
    stack: "Python · Supabase · Reporting",
  },
];

const caseStudies = [
  {
    industry: "Bauunternehmen",
    subtitle: "IMMOBILIEN",
    problem: "Manuelle Zuordnung von Zahlungen zu Mietverträgen",
    solution: "Datenbank mit intelligenter Zuordnung",
    result: "50% Zeitersparnis",
    resultDetail: "Bei voller Entlastung der Partner",
    icon: Building2,
  },
  {
    industry: "Zertifizierungsgesellschaft",
    subtitle: "CONSULTING",
    problem: "Chaotische Terminverwaltung",
    solution: "CRM-System, Auditsystem mit Outlook-Kalender-Schnittstelle",
    result: "40% Zeitersparnis",
    resultDetail: "Saubere Übersicht von kritischen Themen",
    icon: FileCheck,
  },
  {
    industry: "Glasbau",
    subtitle: "HANDWERK",
    problem: "Ineffiziente Auftragsverarbeitung",
    solution: "Automatisierte Auftragsverarbeitung, Angebots- und Rechnungserstellung",
    result: "70% kürzerer Verkaufsprozess",
    resultDetail: "Alle Prozesse laufen halbautomatisch, der Mensch segnet nur noch ab",
    icon: Wrench,
  },
];

const testimonials = [
  {
    quote: "Sehr tolle Zusammenarbeit",
    author: "Eugen Kretschmann",
    role: "Geschäftsführer KREMA Group",
    rating: 5,
  },
  {
    quote: "Hier versteht jemand die Nutzung von KI",
    author: "Dennis Mikyas",
    role: "Geschäftsführer NiImmo Holding GmbH",
    rating: 5,
  },
  {
    quote:
      "Dank KITech Software konnten wir unsere internen Abläufe neu denken – die Zusammenarbeit war professionell, lösungsorientiert und hat uns echten Mehrwert gebracht.",
    author: "Frank Locke",
    role: "Geschäftsführer Kanzlei Locke und Partner",
    rating: 5,
  },
];

const processSteps = [
  {
    number: "01",
    title: "ROI-Audit & Business Case",
    description:
      "Wir analysieren Ihre Prozesse, identifizieren die wirtschaftlich stärksten KI-Hebel und quantifizieren den ROI in Euro – bevor eine Zeile Code geschrieben wird.",
    features: ["Prozess-Mapping", "ROI-Kalkulation in €"],
    icon: Clipboard,
  },
  {
    number: "02",
    title: "Entwicklung mit ROI-Garantie",
    description:
      "Wir bauen die Lösung gegen vorab vereinbarte ROI-Ziele und in Ihrer bevorzugten Cloud- bzw. Governance-Umgebung. Erreichen wir die Ziele nicht, zahlen Sie nicht.",
    features: ["Festpreis-Modell", "Klare Erfolgskriterien"],
    icon: Database,
  },
  {
    number: "03",
    title: "Betrieb & ROI-Tracking",
    description:
      "Ihre KI geht in Produktion. Wir messen den realisierten ROI laufend, überwachen Governance und Kosten und weisen den Wertbeitrag transparent nach.",
    features: ["ROI-Dashboard", "Laufendes Monitoring"],
    icon: Rocket,
  },
];

const faqs = [
  {
    question: "Was macht KITech Software für Unternehmen anders?",
    answer:
      "KITech Software baut KI-Lösungen für Unternehmen mit ROI-Garantie. Wir definieren vorab den wirtschaftlichen Wertbeitrag in Euro; wird er nicht erreicht, zahlt der Kunde nicht. DSGVO-konform, mit Wahl der Cloud- oder On-Prem-Umgebung.",
  },
  {
    question: "Was bedeutet die ROI-Garantie konkret?",
    answer:
      "Vor Projektstart definieren wir gemeinsam einen messbaren ROI in Euro – z. B. eingesparte Stunden, automatisierte Vorgänge, zusätzlicher Umsatz. Erreichen wir das vereinbarte Ziel nicht, zahlen Sie nicht. Das Umsetzungsrisiko liegt bei uns.",
  },
  {
    question: "Ist die Lösung DSGVO-konform?",
    answer:
      "Ja, DSGVO-Konformität ist Grundprinzip jedes Projekts. Hosting in Deutschland/EU ist Standard, ein Auftragsverarbeitungsvertrag (AVV) liegt bereits vor dem Erstgespräch vor.",
  },
  {
    question: "Bietet ihr auch Private AI bzw. On-Premise-Lösungen an?",
    answer:
      "Ja. Wenn Public Cloud aus regulatorischen oder Sicherheitsgründen nicht in Frage kommt, setzen wir Open-Source-Modelle (Llama, Mistral, Qwen) auf souveräner Infrastruktur wie STACKIT, IONOS oder in Ihrem eigenen Rechenzentrum auf.",
  },
  {
    question: "Wie funktioniert die Umsetzung mit Azure AI, AWS oder Google Cloud?",
    answer:
      "Wir bauen Agenten-Systeme dort, wo Ihre Daten, Ihre Compliance-Vorgaben und Ihre bestehende IT-Strategie es verlangen – auf Azure AI Foundry, AWS Bedrock oder Google Vertex AI, jeweils mit Private Endpoints und EU-Datenresidenz.",
  },
  {
    question: "Welche Vertragsmodelle bietet KITech für Enterprise-Projekte an?",
    answer:
      "Für klar umrissene Projekte arbeiten wir mit Festpreis und ROI-Garantie. Für laufenden Betrieb und Weiterentwicklung bieten wir ergänzend ein Retainer-Modell an – immer auf Basis von NDA und AVV.",
  },
];

export default function Enterprise() {
  const enterpriseUrl = "https://kitech-software.de/enterprise";

  return (
    <FunnelLayout pathLabel="Enterprise AI" accentClassName="text-enterprise-accent">
      <SEOHead
        title="Enterprise AI – KI für dein Unternehmen | KITech Software"
        description="Enterprise-grade KI-Automatisierung mit ROI-Garantie: Private AI, Azure AI und sichere, DSGVO-konforme KI-Workflows für Unternehmen. Kostenloses 30-Minuten-Erstgespräch."
        canonical="/enterprise"
      />
      <StructuredData data={getOrganizationSchema()} />
      <StructuredData data={getLocalBusinessSchema()} />
      <StructuredData
        data={getWebPageSchema(
          "Enterprise AI – KI für dein Unternehmen",
          "Enterprise-grade KI-Automatisierung mit ROI-Garantie, Private AI und Azure AI für Unternehmen.",
          enterpriseUrl
        )}
      />
      <StructuredData
        data={getBreadcrumbSchema([
          { name: "Startseite", url: "https://kitech-software.de/" },
          { name: "Enterprise AI", url: enterpriseUrl },
        ])}
      />
      <StructuredData data={getFounderPersonSchema()} />
      <StructuredData data={getReviewSchema(testimonials.map((t) => ({ author: t.author, text: t.quote, rating: t.rating })))} />
      <StructuredData data={getFAQSchema(faqs)} />

      {/* 1. Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 opacity-40" style={GRID_PATTERN_STYLE} aria-hidden="true" />
        <div
          className="absolute inset-x-0 top-0 h-[70%] bg-gradient-to-b from-enterprise-accent/10 via-transparent to-transparent"
          aria-hidden="true"
        />
        <div className="container relative py-20 sm:py-28 lg:py-36 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs uppercase tracking-widest text-enterprise-accent font-medium mb-6">
              Für Unternehmen &amp; Organisationen
            </span>
            {/* font-display italic auf dem h1 selbst (nicht nur auf dem Akzent-Span) angleicht
                das Hero-Headline an dieselbe Konvention, die jede andere Section-Überschrift
                dieser Seite bereits nutzt (voll kursive Instrument-Serif-Basis, Akzent-Span
                uebernimmt nur die Farbe statt zusaetzlich die Typografie zu wechseln). */}
            <h1 className="font-display text-3xl italic sm:text-5xl lg:text-6xl tracking-tight mb-6 text-foreground leading-tight">
              KI für dein Unternehmen —{" "}
              <span className="text-enterprise-accent">
                Enterprise AI, Private AI, Azure AI
              </span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Sichere, professionell implementierte KI-Automatisierung für Geschäftsprozesse –
              mit ROI-Garantie, DSGVO-Konformität und der Cloud- oder Private-AI-Umgebung Ihrer Wahl.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="hero"
                size="xl"
                className="bg-enterprise-accent text-enterprise-accent-foreground hover:bg-enterprise-accent/90"
                asChild
              >
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("Calendly_Klick", { position: "enterprise-hero" })}
                >
                  Kostenloses 30-Minuten-Erstgespräch buchen
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <a href="#security">Security &amp; Private-AI-Optionen ansehen</a>
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-enterprise-accent" aria-hidden="true" />
                DSGVO-konform
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-enterprise-accent" aria-hidden="true" />
                Hosting in Deutschland/EU
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-enterprise-accent" aria-hidden="true" />
                ROI-Garantie
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust-Leiste: echte Referenzen */}
      <section className="border-b border-border/50 py-10 overflow-hidden bg-background">
        <div className="container">
          <p className="text-center text-[11px] uppercase tracking-widest text-muted-foreground mb-6">
            Vertraut von Unternehmen wie
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {trustLogos.map((client) => (
              <img
                key={client.name}
                src={client.logo}
                alt={`${client.name} Firmenlogo`}
                className="h-6 sm:h-7 w-auto object-contain grayscale opacity-60"
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Business-Problem */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center mb-14"
          >
            <span className="inline-block text-xs uppercase tracking-widest text-enterprise-accent font-medium mb-4">
              Das eigentliche Problem
            </span>
            <h2 className="font-display text-3xl italic text-foreground mb-4 sm:text-4xl">
              KI ohne klaren Wirtschafts- und Sicherheitsrahmen
            </h2>
            <p className="text-muted-foreground">
              Drei Muster, die wir bei fast jedem Erstgespräch mit Unternehmen sehen –
              und die wir mit unserem Vorgehen gezielt auflösen.
            </p>
          </motion.div>

          {/* Card-Stil-Entscheidung (bewusst, siehe auch Solo.tsx): Enterprise nutzt durchgehend
              solide bg-card-Flaechen mit umrahmten Icon-Chips (getoente rounded-xl Container) -
              das ist die visuelle Umsetzung von "kuehl/seriös/institutionell" aus dem Auftrag
              (fest, formal, strukturiert), im bewussten Kontrast zu Solos transluzenten
              bg-card/NN-Flaechen mit freistehenden Icons ("warm/persoenlich"). Jede Card auf
              dieser Seite nutzt solides bg-card/bg-background - nicht auf Solos Stil angleichen. */}
          <div className="grid sm:grid-cols-3 gap-6">
            {businessProblems.map((problem, i) => (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-enterprise-accent/10 text-enterprise-accent mb-4">
                  <problem.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-foreground">{problem.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{problem.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Enterprise-AI-Positionierung */}
      <section className="py-20 lg:py-28 border-t border-border/50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block text-xs uppercase tracking-widest text-enterprise-accent font-medium mb-4">
                Positionierung
              </span>
              <h2 className="font-display text-3xl italic text-foreground mb-6 sm:text-4xl">
                Enterprise AI von KITech:{" "}
                <span className="text-enterprise-accent">ROI-Garantie trifft Compliance-first.</span>
              </h2>
              <p className="text-muted-foreground mb-4">
                Wir definieren vor Projektstart den wirtschaftlichen Wertbeitrag in Euro – eingesparte
                Stunden, automatisierte Vorgänge, zusätzlicher Umsatz. Erreichen wir das vereinbarte
                ROI-Ziel nicht, zahlen Sie nicht.
              </p>
              <p className="text-muted-foreground">
                Gleichzeitig bauen wir dort, wo Ihre Daten hin dürfen: in Ihrer bevorzugten
                Cloud-Umgebung, hybrid, oder vollständig souverän on-premise. So tragen wir das
                Umsetzungs- und Sicherheitsrisiko, nicht Sie.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative mx-auto w-full max-w-sm"
            >
              {/* TODO: Enterprise-Foto (Anzug, Team im Hintergrund) hier einsetzen, sobald verfügbar
                  - aktuell Solo-Portrait mit Enterprise-Bildbehandlung (Stahlblau-Duotone + Blueprint-Grid)
                  als Übergangslösung, da noch kein passendes Foto im Projekt existiert. */}
              <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-elevated">
                <div className="absolute inset-0" style={GRID_PATTERN_STYLE} aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" aria-hidden="true" />
                <img
                  src={founderInfo.imageUrl}
                  alt={`${founderInfo.name}, ${founderInfo.role} der KITech Software UG`}
                  loading="lazy"
                  className="relative w-full h-auto object-cover grayscale sepia-[0.35] hue-rotate-[185deg] saturate-[2] contrast-[1.1] brightness-[0.92]"
                />
                <div className="relative border-t border-border bg-background/90 backdrop-blur-sm p-4">
                  <p className="text-xs text-foreground/80 leading-snug italic mb-2">
                    „{founderInfo.quoteShort}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">{founderInfo.name}</p>
                      <p className="text-[10px] text-muted-foreground">{founderInfo.role}</p>
                    </div>
                    <span className="text-[10px] text-enterprise-accent tracking-widest">KITECH</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <TrustRiskReversal />

      {/* 4. Use Cases */}
      <section className="py-20 lg:py-28" id="use-cases">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mb-12"
          >
            <span className="inline-block text-xs uppercase tracking-widest text-enterprise-accent font-medium mb-4">
              Anwendungsfälle
            </span>
            <h2 className="font-display text-3xl italic text-foreground mb-4 sm:text-4xl">
              Vier Hebel, die sich in Unternehmen sofort rechnen
            </h2>
            <p className="text-muted-foreground">
              Kein KI-Selbstzweck – konkrete Anwendungsfälle, die wir für Unternehmen bereits umsetzen.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((useCase, i) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group rounded-2xl border border-border bg-card p-6 lg:p-7 hover:border-enterprise-accent/50 hover:shadow-elevated transition-all"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-enterprise-accent/10 text-enterprise-accent mb-4 group-hover:bg-enterprise-accent group-hover:text-enterprise-accent-foreground transition-colors">
                  <useCase.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-foreground">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{useCase.description}</p>
                <p className="font-mono text-[11px] uppercase tracking-wider text-enterprise-accent/80">
                  {useCase.stack}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Security / Private AI / Azure */}
      <div id="security">
        <EnterpriseCloud />
      </div>

      {/* 6. Zertifikate / Nachweise */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center mb-12"
          >
            <span className="inline-block text-xs uppercase tracking-widest text-enterprise-accent font-medium mb-4">
              Zertifizierungen &amp; Nachweise
            </span>
            <h2 className="font-display text-3xl italic text-foreground mb-4 sm:text-4xl">
              Woran Sie uns schon heute messen können
            </h2>
            <p className="text-muted-foreground">
              Formale Zertifizierungen sind in Vorbereitung. Bis dahin sichern gelebte Praxis und
              schriftlich fixierte Zusagen die Vertrauensbasis – siehe die sechs Versprechen oben.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { label: "ISO 27001", sub: "[folgt]" },
              { label: "BSI C5-Testat", sub: "[folgt]" },
              { label: "Referenzen mit Namensfreigabe", sub: "auf Anfrage" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-card/50 p-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
                  <Award className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Case Studies */}
      <section className="py-20 lg:py-28 bg-card/30 border-y border-border/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mb-12"
          >
            <span className="inline-block text-xs uppercase tracking-widest text-enterprise-accent font-medium mb-4">
              Nachweisbare Ergebnisse
            </span>
            <h2 className="font-display text-3xl italic text-foreground mb-4 sm:text-4xl">
              Agenten im Einsatz. Echte Ergebnisse.
            </h2>
            <p className="text-muted-foreground">
              Keine Theorie, sondern produktive Systeme bei echten Unternehmen.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-14">
            {caseStudies.map((study, i) => (
              <motion.div
                key={study.industry}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-background rounded-2xl border border-border p-6 shadow-card"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-enterprise-accent/10 text-enterprise-accent">
                    <study.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{study.industry}</h3>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
                      {study.subtitle}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    {/* text-destructive (HSL L 42-50%) faellt auf dem dunklen Card-Hintergrund
                        auf nur ~2.8-3.6:1 Kontrast bei text-xs (WCAG AA verlangt 4.5:1 fuer
                        Fliesstext dieser Groesse) - gesaettigtes Rot hat trotz "mittlerer"
                        Lightness eine niedrige relative Luminanz. Fixe, hellere Rot-Variante
                        speziell fuer dieses Tag-Label (>4.9:1 in beiden Theme-Varianten). */}
                    <span className="inline-block px-2 py-0.5 bg-destructive/10 text-[hsl(0_72%_64%)] text-xs font-light rounded mb-1">
                      Problem
                    </span>
                    <p className="text-sm text-muted-foreground">{study.problem}</p>
                  </div>
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-success/10 text-success text-xs font-light rounded mb-1">
                      Lösung
                    </span>
                    <p className="text-sm text-muted-foreground">{study.solution}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-2xl font-mono font-medium text-success">{study.result}</p>
                  <p className="text-xs text-muted-foreground">{study.resultDetail}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-background rounded-2xl border border-border p-6 shadow-card"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-enterprise-accent text-enterprise-accent" />
                  ))}
                </div>
                {/* italic angeglichen an die Zitat-Konvention, die sonst ueberall auf der Seite
                    gilt (Gruender-Zitat in der Positionierungs-Section, SoloPortrait-Zitat) -
                    dieses Testimonial-Blockquote war bisher die einzige nicht-kursive Ausnahme. */}
                <blockquote className="text-foreground mb-6 italic">„{testimonial.quote}"</blockquote>
                <div>
                  <p className="font-medium text-sm text-foreground">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Prozess */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-xs uppercase tracking-widest text-enterprise-accent font-medium mb-4">
              Vorgehen
            </span>
            <h2 className="font-display text-3xl italic text-foreground mb-4 sm:text-4xl">
              Vom ROI-Audit zur garantierten Wirkung
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Wir quantifizieren den Wertbeitrag, bauen die Lösung gegen messbare Ziele und
              weisen den ROI im Betrieb transparent nach. Strukturiert, festpreisbasiert, garantiert.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative bg-card rounded-2xl border border-border p-6 shadow-card"
              >
                <div className="absolute -top-4 -right-4 text-6xl font-mono font-bold text-enterprise-accent/10">
                  {step.number}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-enterprise-accent/10 text-enterprise-accent mb-4">
                  <step.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-light mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{step.description}</p>
                <div className="space-y-2">
                  {step.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" aria-hidden="true" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CTA + Kalender */}
      <section className="py-20 lg:py-28 bg-card/30 border-y border-border/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-background border-2 border-enterprise-accent/40 p-8 md:p-16 text-center shadow-elevated"
          >
            <div className="absolute inset-0 opacity-30" style={GRID_PATTERN_STYLE} aria-hidden="true" />
            <div className="relative">
              <h2 className="font-display text-3xl italic text-foreground mb-4 sm:text-4xl">
                Bereit für Enterprise AI mit garantiertem ROI?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                In 30 Minuten besprechen wir Ihren konkreten Anwendungsfall, die passende
                Cloud- bzw. Private-AI-Umgebung und einen realistischen ROI-Rahmen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="xl"
                  className="bg-enterprise-accent text-enterprise-accent-foreground hover:bg-enterprise-accent/90"
                  asChild
                >
                  <a
                    href={CALENDLY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("Calendly_Klick", { position: "enterprise-final-cta" })}
                  >
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    Kostenloses 30-Minuten-Erstgespräch buchen
                  </a>
                </Button>
                <Button variant="ctaOutline" size="xl" asChild>
                  <Link to="/kontakt">Kontakt aufnehmen</Link>
                </Button>
              </div>
              <div className="mt-8 flex justify-center">
                <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card/50 px-4 py-2">
                  <img
                    src={founderInfo.imageUrl}
                    alt={`${founderInfo.name}, ${founderInfo.role} der KITech Software UG`}
                    className="h-8 w-8 rounded-full object-cover object-top grayscale ring-1 ring-enterprise-accent/30"
                  />
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Persönlicher Rückruf von{" "}
                    <span className="text-foreground font-medium">{founderInfo.name}</span> (Geschäftsführer) –
                    meist innerhalb von 24h.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="py-20 lg:py-28" id="faq">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block text-xs uppercase tracking-widest text-enterprise-accent font-medium mb-4">
              Häufige Fragen
            </span>
            <h2 className="font-display text-3xl italic text-foreground sm:text-4xl">
              Was Unternehmen uns am häufigsten fragen
            </h2>
          </motion.div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={faq.question} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-foreground font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 11. Kontakt */}
      <section className="py-16 border-t border-border/50">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div>
              <h2 className="text-xl font-medium text-foreground mb-1">Lieber direkt schreiben oder anrufen?</h2>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mt-3">
                <a href="mailto:info@kitech-software.de" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Mail className="h-4 w-4 text-enterprise-accent" aria-hidden="true" />
                  info@kitech-software.de
                </a>
                <a href="tel:+4915164682544" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Phone className="h-4 w-4 text-enterprise-accent" aria-hidden="true" />
                  +49 (0) 151 64682544
                </a>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-enterprise-accent" aria-hidden="true" />
                  Hannover, Deutschland
                </span>
              </div>
            </div>
            <Button variant="outline" size="lg" asChild>
              <Link to="/kontakt">
                Zur Kontaktseite
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </FunnelLayout>
  );
}
