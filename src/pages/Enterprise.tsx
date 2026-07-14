import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FunnelLayout } from "@/components/layout/FunnelLayout";
import { SignalField } from "@/components/canvas/SignalField";
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
  UserRound,
  Linkedin,
  Search,
  MessageCircle,
  Hash,
  Briefcase,
} from "lucide-react";

import niimmoLogo from "@/assets/niimmo-logo.png";
import certconsultingLogo from "@/assets/certconsulting-logo.png";
import kremaLogo from "@/assets/krema-logo.png";
import alltagshilfeLogo from "@/assets/alltagshilfe-logo.png";
import expatvantageLogo from "@/assets/expatvantage-logo.png";

const trustLogos = [
  { name: "NiImmo Holding GmbH", logo: niimmoLogo },
  { name: "KREMA Group", logo: kremaLogo },
  { name: "cert consulting Pane", logo: certconsultingLogo },
  { name: "Alltagshilfe Fischer GmbH", logo: alltagshilfeLogo },
  { name: "ExpatVantage", logo: expatvantageLogo },
];

/** Konsultative Positionierung: drei Prinzipien statt eines vorgefertigten Pitches. */
const discoveryPrinciples = [
  {
    icon: MessageCircle,
    title: "Kein Pitch, keine Standard-Folie",
    text: "Wir kommen nicht mit einer fertigen Lösung ins Erstgespräch – die gibt es an diesem Punkt noch nicht.",
  },
  {
    icon: Search,
    title: "Gemeinsame Problemsuche",
    text: "Im Gespräch suchen wir gemeinsam nach dem Problem, das sich wirtschaftlich am stärksten lohnt zu lösen.",
  },
  {
    icon: Hash,
    title: "Quantifizierung in Zahlen",
    text: "Erst wenn das Problem in Euro und Stunden greifbar ist, sprechen wir über eine mögliche Lösung.",
  },
];

/**
 * Konzernerfahrung: Platzhalter fuer konkrete Marken/Referenzen, bis der Auftraggeber die
 * echten Namen liefert (KEINE erfundenen Firmennamen - falsche Tatsachenbehauptung auf einer
 * echten Firmenseite). Sub-Label macht den Platzhalter-Status sichtbar, analog zu "certificates".
 */
const corporateBrands = [
  { label: "[Marke folgt]", sub: "Konzern" },
  { label: "[Marke folgt]", sub: "Konzern" },
  { label: "[Marke folgt]", sub: "Konzern" },
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

const certificates = [
  { label: "ISO 27001", sub: "[folgt]" },
  { label: "BSI C5-Testat", sub: "[folgt]" },
  { label: "Referenzen mit Namensfreigabe", sub: "auf Anfrage" },
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

      {/* 1. Hero — einziger bewusster Kicker der Seite (siehe Design-Skill: max. EIN Kicker,
          nicht als Wiederholungsmuster). SignalField ersetzt das bisherige CSS-Blueprint-Grid
          vollstaendig: dichter/lebendiger als Solo (density 1.2), Lime-Pulse via
          --enterprise-accent. kinetic-morph-in laesst die H1 "sich berechnen" (MONO-Achse
          faehrt von 0/blur nach 0.35/scharf) statt Serif-Kursiv-Reveal. */}
      {/* "isolate" (CSS isolation: isolate) ist hier notwendig, nicht kosmetisch: "relative"
          allein erzeugt OHNE eigenen z-index KEINEN neuen Stacking-Context, wodurch das
          "-z-10"-Canvas ohne "isolate" nicht relativ zu dieser Section stapelt, sondern in
          den naechsten echten Stacking-Context weiter oben faellt und dadurch hinter dem
          undurchsichtigen bg-background des Layout-Wrappers verschwindet - trotz korrekt
          gezeichnetem Canvas-Inhalt (per Pixel-Diff verifiziert, reproduziert auch in echtem,
          nicht nur headless Chrome). */}
      <section className="relative isolate overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 -z-10">
          <SignalField density={1.2} intensity={1} accentColor="--enterprise-accent" />
        </div>
        <div
          className="absolute inset-x-0 top-0 h-[70%] bg-gradient-to-b from-background via-transparent to-transparent -z-10"
          aria-hidden="true"
        />
        <div className="container relative py-20 sm:py-28 lg:py-36 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-enterprise-accent/30 bg-enterprise-accent/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-enterprise-accent mb-6">
              <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
              Für Unternehmen &amp; Organisationen
            </span>
            <h1 className="kinetic-display kinetic-morph-in text-3xl sm:text-5xl lg:text-6xl mb-6 text-foreground leading-[1.1] text-balance">
              KI für dein Unternehmen —{" "}
              <span className="text-enterprise-accent">Enterprise AI, Private AI, Azure AI</span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
              Sichere, professionell implementierte KI-Automatisierung für Geschäftsprozesse –
              mit ROI-Garantie, DSGVO-Konformität und der Cloud- oder Private-AI-Umgebung Ihrer Wahl.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* whitespace-normal + h-auto ueberschreiben die Button-Basisklasse (whitespace-
                  nowrap + fixe h-14): der lange Button-Text sprengt sonst auf schmalen
                  Viewports (<400px) die Breite und wird links/rechts abgeschnitten statt
                  umzubrechen - verifiziert per Mobile-Screenshot (390px). */}
              <Button
                variant="hero"
                size="xl"
                className="h-auto min-h-14 whitespace-normal bg-enterprise-accent py-3.5 text-center text-enterprise-accent-foreground shadow-soft-enterprise hover:bg-enterprise-accent/90"
                asChild
              >
                <Link
                  to="/lass-uns-reden"
                  onClick={() => trackEvent("Calendly_Klick", { position: "enterprise-hero" })}
                >
                  Kostenloses 30-Minuten-Erstgespräch buchen
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" className="h-auto min-h-14 whitespace-normal py-3.5 text-center" asChild>
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

      {/* Trust-Leiste: echte Referenzen. Bewusst keine zweite Uppercase-Tracked-Eyebrow hier
          (die Hero hat bereits ihren einen Kicker) - schlichte Caption, konsistent mit der
          identischen Trust-Leiste auf der Startseite (Index.tsx). */}
      <section className="border-b border-border/50 py-10 overflow-hidden bg-background">
        <div className="container">
          <p className="text-center text-xs text-muted-foreground mb-6">
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

      {/* 2. Positionierung: "Kein Problem, keine Loesung" – die konsultative Grundhaltung
          steht bewusst vor der Muster-/Problem-Sektion, damit diese nicht wie eine fertige
          Diagnose wirkt, sondern wie Beispiele aus echten Erstgespraechen. */}
      <section className="py-20 lg:py-28 border-b border-border/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-2xl mx-auto text-center mb-14"
          >
            <h2 className="kinetic-display text-3xl text-foreground mb-4 sm:text-4xl text-balance">
              Kein Problem, keine Lösung.
            </h2>
            <p className="text-muted-foreground text-pretty">
              Die meisten Anbieter starten mit einer Präsentation über das, was sie verkaufen. Wir starten anders: Im
              kostenlosen Erstgespräch suchen wir gemeinsam nach einem echten Problem in Ihrem Unternehmen – und
              statten es mit Zahlen aus, bevor überhaupt über eine Lösung gesprochen wird.
            </p>
          </motion.div>

          <div className="grid divide-y divide-border rounded-2xl border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {discoveryPrinciples.map((principle, i) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
                className="p-6 lg:p-8"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-enterprise-accent/10 text-enterprise-accent mb-4">
                  <principle.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-foreground">{principle.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{principle.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Konzernerfahrung – Markennamen sind bewusst als Platzhalter markiert
          ("[Marke folgt]"), bis konkrete Referenzen freigegeben sind. Kein erfundener
          Firmenname: falsche Tatsachenbehauptung auf einer echten Firmenseite. */}
      <section className="py-16 lg:py-20 border-b border-border/50 bg-card/30">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="lg:col-span-5"
            >
              <Briefcase className="h-7 w-7 text-enterprise-accent mb-4" aria-hidden="true" />
              <h2 className="kinetic-display text-2xl text-foreground mb-4 sm:text-3xl text-balance">
                Konzernerfahrung, die den Unterschied macht
              </h2>
              <p className="text-muted-foreground text-pretty">
                Bevor KITech Software entstand, hat {founderInfo.name} als Konzernmanager gearbeitet – mit den
                Prozessen, der Größenordnung und den Abstimmungswegen, die in gewachsenen Organisationen entstehen.
                Diese Erfahrung fließt direkt in jedes Enterprise-Projekt ein.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="lg:col-span-7"
            >
              <span className="kinetic-data text-[11px] text-muted-foreground">FRÜHERE STATIONEN</span>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {corporateBrands.map((brand, i) => (
                  <span
                    key={`${brand.label}-${i}`}
                    className="inline-flex items-center gap-2.5 rounded-full border border-dashed border-border px-4 py-2"
                  >
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground/70" aria-hidden="true" />
                    <span className="text-sm text-foreground/85">{brand.label}</span>
                    <span className="kinetic-data text-xs text-muted-foreground">{brand.sub}</span>
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Konkrete Marken auf Anfrage – Details folgen in Kürze.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Business-Problem – als Beispiele aus echten Erstgespraechen gerahmt, nicht als
          vorab feststehende Diagnose (passend zur konsultativen Positionierung oben). */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-2xl mx-auto text-center mb-14"
          >
            <h2 className="kinetic-display text-3xl text-foreground mb-4 sm:text-4xl text-balance">
              KI ohne klaren Wirtschafts- und Sicherheitsrahmen
            </h2>
            <p className="text-muted-foreground text-pretty">
              Drei Muster, die wir bei fast jedem Erstgespräch mit Unternehmen sehen –
              nicht Ihre vorab feststehende Diagnose, sondern der Ausgangspunkt für das Gespräch.
            </p>
          </motion.div>

          {/* Bewusst KEIN drittes "N gleiche Karten"-Grid in Folge (siehe Design-Skill-Verbot
              gegen identische Card-Grids): ein einzelnes umrandetes Panel, intern per
              divide-x/-y in drei Spalten geteilt, statt drei einzeln umrandeter Karten. Das
              bleibt "kuehl/institutionell" (fester Rahmen, formale Struktur) und variiert
              trotzdem die Behandlung gegenueber Use-Cases/Case-Studies/Prozess weiter unten. */}
          <div className="grid divide-y divide-border rounded-2xl border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {businessProblems.map((problem, i) => (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
                className="p-6 lg:p-8"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-enterprise-accent/10 text-enterprise-accent mb-4">
                  <problem.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-foreground">{problem.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{problem.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Enterprise-AI-Positionierung — GEAENDERTE ANWEISUNG: kein Gruenderfoto in dieser
          Runde. Der ehemalige Foto-Slot wird vom SignalField selbst getragen (dicht/lebendig,
          density 1.3): ein generatives Canvas gilt als vollwertige "Imagery", kein Text-only-
          Notbehelf. Das Gruender-Zitat bleibt als eigenstaendige Karte darunter erhalten, ohne
          Bildrahmen. */}
      <section className="py-20 lg:py-28 border-t border-border/50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <h2 className="kinetic-display text-3xl text-foreground mb-6 sm:text-4xl text-balance">
                Enterprise AI von KITech:{" "}
                <span className="text-enterprise-accent">ROI-Garantie trifft Compliance-first.</span>
              </h2>
              <p className="text-muted-foreground mb-4 text-pretty">
                Wir definieren vor Projektstart den wirtschaftlichen Wertbeitrag in Euro – eingesparte
                Stunden, automatisierte Vorgänge, zusätzlicher Umsatz. Erreichen wir das vereinbarte
                ROI-Ziel nicht, zahlen Sie nicht.
              </p>
              <p className="text-muted-foreground text-pretty">
                Gleichzeitig bauen wir dort, wo Ihre Daten hin dürfen: in Ihrer bevorzugten
                Cloud-Umgebung, hybrid, oder vollständig souverän on-premise. So tragen wir das
                Umsetzungs- und Sicherheitsrisiko, nicht Sie.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="relative mx-auto w-full max-w-sm"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-card">
                <SignalField className="absolute inset-0" density={1.3} intensity={1.1} accentColor="--enterprise-accent" />
                <span className="kinetic-data absolute left-4 top-4 rounded-full border border-enterprise-accent/30 bg-background/80 px-2.5 py-1 text-[10px] uppercase text-enterprise-accent backdrop-blur-sm">
                  System aktiv
                </span>
              </div>
              <div className="relative -mt-10 mx-4 rounded-2xl border border-border bg-background/95 p-4 backdrop-blur-sm sm:-mt-12 sm:p-5">
                <p className="mb-3 text-sm leading-snug text-foreground/85 text-pretty">
                  „{founderInfo.quoteShort}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{founderInfo.name}</p>
                    <p className="text-xs text-muted-foreground">{founderInfo.role}</p>
                  </div>
                  <a
                    href={founderInfo.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${founderInfo.name} auf LinkedIn`}
                    className="text-enterprise-accent transition-opacity hover:opacity-80"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <TrustRiskReversal />

      {/* 6. Use Cases — bewusst eine volle Zeilen-Liste (divide-y, kein Card-Rahmen, keine
          Nummern) statt eines weiteren "rounded-2xl border + Icon-Chip"-Grids: das waere auf
          dieser Seite bereits das 3. identische Grid in Folge (nach businessProblems und der
          Positionierungs-Karte) - genau das vom Design-Skill verbotene Muster. Keine 01/02/03-
          Nummerierung, da die vier Hebel keine echte Reihenfolge/Sequenz sind (siehe Verbot
          gegen Nummerierung als Standard-Geruest). */}
      <section className="py-20 lg:py-28" id="use-cases">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-2xl mb-12"
          >
            <h2 className="kinetic-display text-3xl text-foreground mb-4 sm:text-4xl text-balance">
              Vier Hebel, die sich in Unternehmen sofort rechnen
            </h2>
            <p className="text-muted-foreground text-pretty">
              Kein KI-Selbstzweck – konkrete Anwendungsfälle, die wir für Unternehmen bereits umsetzen.
            </p>
          </motion.div>

          <div className="divide-y divide-border border-y border-border">
            {useCases.map((useCase, i) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
                className="grid items-start gap-4 py-7 sm:grid-cols-[2.75rem_1fr] sm:gap-6 lg:grid-cols-[2.75rem_1fr_11rem] lg:items-center lg:gap-10"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-enterprise-accent/10 text-enterprise-accent">
                  <useCase.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">{useCase.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                    {useCase.description}
                  </p>
                </div>
                <p className="kinetic-data text-[11px] uppercase text-enterprise-accent/80 lg:text-right">
                  {useCase.stack}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Security / Private AI / Azure */}
      <div id="security">
        <EnterpriseCloud />
      </div>

      {/* 8. Zertifikate / Nachweise */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-2xl mx-auto text-center mb-12"
          >
            <h2 className="kinetic-display text-3xl text-foreground mb-4 sm:text-4xl text-balance">
              Woran Sie uns schon heute messen können
            </h2>
            <p className="text-muted-foreground text-pretty">
              Formale Zertifizierungen sind in Vorbereitung. Bis dahin sichern gelebte Praxis und
              schriftlich fixierte Zusagen die Vertrauensbasis – siehe die sechs Versprechen oben.
            </p>
          </motion.div>

          {/* Bewusst keine dritte Karten-Variante fuer die drei Eintraege (nach businessProblems/
              useCases waere das erneut dieselbe "Box + Icon"-Reflex): eine lockere, zentrierte
              Pill-Reihe, gestrichelt als sichtbares "in Vorbereitung"-Signal statt als Karten-Rahmen. */}
          <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
            {certificates.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-2.5 rounded-full border border-dashed border-border px-4 py-2"
              >
                <Award className="h-3.5 w-3.5 text-muted-foreground/70" aria-hidden="true" />
                <span className="text-sm text-foreground/85">{item.label}</span>
                <span className="kinetic-data text-xs text-muted-foreground">{item.sub}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Case Studies + Testimonials — zwei sichtbar unterschiedliche Behandlungen statt
          zwei identischer "rounded-2xl border + p-6"-Grids direkt hintereinander (die vorher
          schlimmste Haeufung des Card-Grid-Verbots auf dieser Seite, da beide Grids exakt
          dieselbe Rezeptur nutzten). Case Studies: EIN umrandetes Ledger-Panel (Familie mit
          businessProblems), Ergebnis-Zahl zuerst statt Icon zuerst. Testimonials: bewusst
          kartenlos - nur Text/Sterne, getrennt durch eine duenne vertikale Linie (Desktop). */}
      <section className="py-20 lg:py-28 bg-card/30 border-y border-border/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-2xl mb-12"
          >
            <h2 className="kinetic-display text-3xl text-foreground mb-4 sm:text-4xl text-balance">
              Agenten im Einsatz. Echte Ergebnisse.
            </h2>
            <p className="text-muted-foreground text-pretty">
              Keine Theorie, sondern produktive Systeme bei echten Unternehmen.
            </p>
          </motion.div>

          <div className="grid divide-y divide-border rounded-2xl border border-border bg-card md:grid-cols-3 md:divide-x md:divide-y-0">
            {caseStudies.map((study, i) => (
              <motion.div
                key={study.industry}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                className="p-6 lg:p-7"
              >
                <p className="kinetic-data text-3xl text-enterprise-accent">{study.result}</p>
                <p className="mb-5 text-xs text-muted-foreground">{study.resultDetail}</p>

                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-enterprise-accent/10 text-enterprise-accent">
                    <study.icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{study.industry}</h3>
                    <span className="kinetic-data text-xs uppercase text-muted-foreground">
                      {study.subtitle}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <div>
                    {/* text-destructive (HSL L 42-50%) faellt auf dem dunklen Card-Hintergrund
                        auf nur ~2.8-3.6:1 Kontrast bei text-xs (WCAG AA verlangt 4.5:1 fuer
                        Fliesstext dieser Groesse) - gesaettigtes Rot hat trotz "mittlerer"
                        Lightness eine niedrige relative Luminanz. Fixe, hellere Rot-Variante
                        speziell fuer dieses Tag-Label (>4.9:1 in beiden Theme-Varianten). */}
                    <span className="inline-block px-2 py-0.5 bg-destructive/10 text-[hsl(0_72%_64%)] text-xs font-light rounded mb-1">
                      Problem
                    </span>
                    <p className="text-sm text-muted-foreground text-pretty">{study.problem}</p>
                  </div>
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-success/10 text-success text-xs font-light rounded mb-1">
                      Lösung
                    </span>
                    <p className="text-sm text-muted-foreground text-pretty">{study.solution}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Testimonials: bewusst textgefuehrt statt in Karten - Sterne + Zitat + Name,
              getrennt per duenner neutraler Linie (kein Farbakzent -> kein Side-Stripe-
              Verstoss), damit sich Stimmen spuerbar von den datengetriebenen Case Studies
              oben abheben. */}
          <div className="mt-16">
            <h3 className="kinetic-data mb-8 text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Stimmen unserer Kunden
            </h3>
            <div className="grid gap-x-10 gap-y-10 sm:grid-cols-3 sm:[&>*:not(:first-child)]:border-l sm:[&>*:not(:first-child)]:border-border sm:[&>*:not(:first-child)]:pl-10">
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={testimonial.author}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                >
                  <div className="mb-4 flex gap-1">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-enterprise-accent text-enterprise-accent" />
                    ))}
                  </div>
                  <blockquote className="text-foreground text-pretty">„{testimonial.quote}"</blockquote>
                  <div className="mt-5">
                    <p className="text-sm font-medium text-foreground">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10. Prozess — echte 3-stufige Sequenz: 01/02/03 duerfen laut Design-Skill bleiben
          (Nummerierung ist nur verboten, wenn sie ohne echte Reihenfolge als Standard-Geruest
          dient). Nummern jetzt in kinetic-data statt font-mono, sonst unveraendert. */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="kinetic-display text-3xl text-foreground mb-4 sm:text-4xl text-balance">
              Vom ROI-Audit zur garantierten Wirkung
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
              Wir quantifizieren den Wertbeitrag, bauen die Lösung gegen messbare Ziele und
              weisen den ROI im Betrieb transparent nach. Strukturiert, festpreisbasiert, garantiert.
            </p>
          </motion.div>

          {/* Bewusst kein weiteres "bordered card + icon chip"-Grid (siehe businessProblems/
              useCases/TrustRiskReversal): eine verbundene Timeline ohne Card-Rahmen - die
              grosse kinetic-data-Nummer ist hier der primaere visuelle Anker, eine durchgehende
              Top-Linie verbindet die drei Schritte zu einer sichtbaren Sequenz statt drei
              isolierter Karten. */}
          <div className="grid gap-10 border-t border-border md:grid-cols-3 md:gap-8">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                className="-mt-px border-t-2 border-enterprise-accent pt-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="kinetic-data text-3xl text-enterprise-accent/40">{step.number}</span>
                  <step.icon className="h-5 w-5 text-enterprise-accent" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-light mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 text-pretty">{step.description}</p>
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

      {/* 11. CTA + Kalender — SignalField ersetzt das bisherige Blueprint-Grid im Panel;
          Panel selbst nur Border ODER kein Shadow (Ghost-Card-Verbot), hier: Border-only,
          kein shadow-elevated mehr. Kein Foto beim "Persoenlicher Rueckruf"-Badge, stattdessen
          Icon-Avatar. */}
      <section className="py-20 lg:py-28 bg-card/30 border-y border-border/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ease: "easeOut" }}
            className="relative overflow-hidden rounded-2xl bg-background border border-enterprise-accent/30 p-8 md:p-16 text-center"
          >
            <div className="absolute inset-0 opacity-[0.5]" aria-hidden="true">
              <SignalField density={1.1} intensity={0.9} accentColor="--enterprise-accent" />
            </div>
            <div className="relative">
              <h2 className="kinetic-display text-3xl text-foreground mb-4 sm:text-4xl text-balance">
                Bereit für Enterprise AI mit garantiertem ROI?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
                In 30 Minuten besprechen wir Ihren konkreten Anwendungsfall, die passende
                Cloud- bzw. Private-AI-Umgebung und einen realistischen ROI-Rahmen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="xl"
                  className="h-auto min-h-14 whitespace-normal bg-enterprise-accent py-3.5 text-center text-enterprise-accent-foreground shadow-soft-enterprise hover:bg-enterprise-accent/90"
                  asChild
                >
                  <Link
                    to="/lass-uns-reden"
                    onClick={() => trackEvent("Calendly_Klick", { position: "enterprise-final-cta" })}
                  >
                    <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Kostenloses 30-Minuten-Erstgespräch buchen
                  </Link>
                </Button>
                <Button variant="ctaOutline" size="xl" asChild>
                  <Link to="/kontakt">Kontakt aufnehmen</Link>
                </Button>
              </div>
              <div className="mt-8 flex justify-center">
                <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card/70 px-4 py-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-enterprise-accent/10 text-enterprise-accent ring-1 ring-enterprise-accent/30">
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                  </span>
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

      {/* 12. FAQ */}
      <section className="py-20 lg:py-28" id="faq">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h2 className="kinetic-display text-3xl text-foreground sm:text-4xl text-balance">
              Was Unternehmen uns am häufigsten fragen
            </h2>
          </motion.div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={faq.question} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-foreground font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-pretty">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 13. Kontakt */}
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
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </FunnelLayout>
  );
}
