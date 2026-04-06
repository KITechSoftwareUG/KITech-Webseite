import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SEOHead } from "@/components/seo/SEOHead";
import {
  StructuredData,
  getOrganizationSchema,
  getLocalBusinessSchema,
  getFAQSchema,
  getReviewSchema,
  getSoftwareAppSchema,
  getWebPageSchema,
} from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { LampContainer } from "@/components/ui/lamp";
import { TextRotate } from "@/components/ui/text-rotate";
import { Check, X, Star, ArrowRight, ChevronLeft, ChevronRight, Clipboard, Database, Rocket, Building2, Factory, ShoppingCart, Shield, MapPin, Terminal, Smartphone, Sparkles, FileCheck, Wrench } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { trackEvent, initScrollTracking } from "@/lib/plausible";
import { Users, Briefcase, HelpCircle } from "lucide-react";
import cleverfuchsLogo from "@/assets/cleverfuchs-logo.png";
import appStoreBadge from "@/assets/appstore-badge.svg";
import niimmoLogo from "@/assets/niimmo-logo.png";
import alltagshilfeLogo from "@/assets/alltagshilfe-logo.png";
import certconsultingLogo from "@/assets/certconsulting-logo.png";
import kremaLogo from "@/assets/krema-logo.png";
import expatvantageLogo from "@/assets/expatvantage-logo.png";
import ethixaiLogo from "@/assets/ethixai-logo.png";
import klargehaltLogo from "@/assets/klargehalt-logo.png";
const clientReferences = [{
  name: "NiImmo Holding GmbH",
  icon: Building2,
  logo: niimmoLogo
}, {
  name: "Alltagshilfe Fischer GmbH",
  icon: Shield,
  logo: alltagshilfeLogo
}, {
  name: "cert consulting Pane",
  icon: Clipboard,
  logo: certconsultingLogo
}, {
  name: "KREMA Group",
  icon: Factory,
  logo: kremaLogo
}, {
  name: "ExpatVantage",
  icon: Database,
  logo: expatvantageLogo
}];
const products = [{
  name: "CleverFuchs",
  description: "iOS App",
  icon: Smartphone
}, {
  name: "KI-DNA Generator",
  description: "SaaS Platform",
  icon: Sparkles
}];
const comparisonData = [{
  feature: 'Standard "Prompts"',
  typical: true,
  kitech: "Orchestrierte Agenten-Systeme"
}, {
  feature: "Unklare Datenflüsse",
  typical: true,
  kitech: "DSGVO-konforme Agenten-Architektur"
}, {
  feature: "Demo-Effekte",
  typical: true,
  kitech: "Produktive Agenten im Einsatz"
}, {
  feature: "Denken in Jobrollen",
  typical: true,
  kitech: "Denken in Prozess-Orchestrierungen"
}];
const processSteps = [{
  number: "01",
  title: "Prozessanalyse & Agenten-Design",
  description: "Wir analysieren Ihre Geschäftsprozesse und identifizieren, welche Aufgaben durch spezialisierte KI-Agenten übernommen werden können. Das Ergebnis: ein klarer Orchestrierungsplan.",
  features: ["Prozess-Mapping", "Agenten-Architektur"],
  icon: Clipboard
}, {
  number: "02",
  title: "Agenten-Entwicklung & Orchestrierung",
  description: "Wir entwickeln spezialisierte KI-Agenten, die nahtlos zusammenarbeiten – wie ein eingespieltes Team, nur vollständig automatisiert und skalierbar.",
  features: ["Multi-Agent-Systeme", "Lokale/EU Deployments"],
  icon: Database
}, {
  number: "03",
  title: "Deployment & kontinuierliche Optimierung",
  description: "Ihre Agenten gehen in Produktion. Wir überwachen, optimieren und erweitern das System iterativ – damit es mit Ihrem Unternehmen wächst.",
  features: ["Agenten-Monitoring", "Laufende Wartung"],
  icon: Rocket
}];
const caseStudies = [{
  industry: "Bauunternehmen",
  subtitle: "IMMOBILIEN",
  problem: "Manuelle Zuordnung von Zahlungen zu Mietverträgen",
  solution: "Datenbank mit intelligenter Zuordnung",
  result: "50% Zeitersparnis",
  resultDetail: "Bei voller Entlastung der Partner",
  icon: Building2
}, {
  industry: "Zertifizierungsgesellschaft",
  subtitle: "CONSULTING",
  problem: "Chaotische Terminverwaltung",
  solution: "CRM-System, Auditsystem mit Outlook-Kalender-Schnittstelle",
  result: "40% Zeitersparnis",
  resultDetail: "Saubere Übersicht von kritischen Themen",
  icon: FileCheck
}, {
  industry: "Glasbau",
  subtitle: "HANDWERK",
  problem: "Ineffiziente Auftragsverarbeitung",
  solution: "Automatisierte Auftragsverarbeitung, Angebotserstellung und Rechnungserstellung",
  result: "70% kürzerer Verkaufsprozess",
  resultDetail: "Alle Prozesse laufen nun halbautomatisch und der Mensch segnet nur noch ab",
  icon: Wrench
}];
const testimonials = [{
  quote: "Sehr tolle Zusammenarbeit",
  author: "Eugen Kretschmann",
  role: "Geschäftsführer KREMA Group",
  rating: 5
}, {
  quote: "Hier versteht jemand die Nutzung von KI",
  author: "Dennis Mikyas",
  role: "Geschäftsführer NiImmo Holding GmbH",
  rating: 5
}, {
  quote: "Dank KI-TEXT konnten wir unsere internen Abläufe neu denken – die Zusammenarbeit war professionell, lösungsorientiert und hat uns echten Mehrwert gebracht.",
  author: "Frank Locke",
  role: "Geschäftsführer Kanzlei Locke und Partner",
  rating: 5
}];
export default function Index() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentCaseStudy, setCurrentCaseStudy] = useState(0);
  const [qualifierStep, setQualifierStep] = useState(0);
  const [showQualifierPopup, setShowQualifierPopup] = useState(false);
  const [popupDismissed, setPopupDismissed] = useState(false);
  const [qualifierAnswers, setQualifierAnswers] = useState({
    role: "",
    industry: "",
    challenge: "",
    revenue: "",
    budget: ""
  });

  // Show popup after scrolling 300px
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300 && !popupDismissed) {
        setShowQualifierPopup(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [popupDismissed]);

  // Plausible: Scroll-Tiefe 90% tracken
  useEffect(() => {
    const cleanup = initScrollTracking();
    return cleanup;
  }, []);
  const closePopup = () => {
    setShowQualifierPopup(false);
    setPopupDismissed(true);
  };
  const roleOptions = [{
    id: "unternehmen",
    icon: Briefcase,
    title: "Unternehmer/in",
    subtitle: "Ich leite ein Unternehmen"
  }, {
    id: "fuehrung",
    icon: Users,
    title: "Führungskraft",
    subtitle: "Ich bin in einer Führungsposition"
  }, {
    id: "berater",
    icon: HelpCircle,
    title: "Berater/in",
    subtitle: "Ich berate andere Unternehmen"
  }];
  const industryOptions = [{
    id: "dienstleistung",
    label: "Dienstleistung"
  }, {
    id: "handel",
    label: "Handel & E-Commerce"
  }, {
    id: "produktion",
    label: "Produktion & Industrie"
  }, {
    id: "finanzen",
    label: "Finanzen & Versicherung"
  }, {
    id: "gesundheit",
    label: "Gesundheit & Pflege"
  }, {
    id: "andere",
    label: "Andere Branche"
  }];
  const challengeOptions = [{
    id: "kosten",
    label: "Kosten senken & Effizienz steigern"
  }, {
    id: "automatisierung",
    label: "Prozesse automatisieren"
  }, {
    id: "kundenservice",
    label: "Kundenservice verbessern"
  }, {
    id: "daten",
    label: "Daten besser nutzen"
  }, {
    id: "wettbewerb",
    label: "Wettbewerbsfähig bleiben"
  }, {
    id: "unsicher",
    label: "Weiß noch nicht genau"
  }];
  const revenueOptions = [{
    id: "unter500k",
    label: "Unter 500.000 €"
  }, {
    id: "500k-2m",
    label: "500.000 € – 2 Mio. €"
  }, {
    id: "2m-10m",
    label: "2 – 10 Mio. €"
  }, {
    id: "10m-50m",
    label: "10 – 50 Mio. €"
  }, {
    id: "ueber50m",
    label: "Über 50 Mio. €"
  }];
  const budgetOptions = [{
    id: "unter10k",
    label: "Unter 10.000 €"
  }, {
    id: "10k-25k",
    label: "10.000 – 25.000 €"
  }, {
    id: "25k-50k",
    label: "25.000 – 50.000 €"
  }, {
    id: "50k-100k",
    label: "50.000 – 100.000 €"
  }, {
    id: "ueber100k",
    label: "Über 100.000 €"
  }, {
    id: "unklar",
    label: "Noch nicht definiert"
  }];
  const handleAnswer = (field: string, value: string) => {
    setQualifierAnswers(prev => ({
      ...prev,
      [field]: value
    }));
    setTimeout(() => {
      setQualifierStep(prev => prev + 1);
    }, 300);
  };
  const totalSteps = 6;
  const progressPercent = qualifierStep / (totalSteps - 1) * 100;
  const nextTestimonial = () => {
    setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
  };
  const prevTestimonial = () => {
    setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };
  const nextCaseStudy = () => {
    setCurrentCaseStudy(prev => (prev + 1) % caseStudies.length);
  };
  const prevCaseStudy = () => {
    setCurrentCaseStudy(prev => (prev - 1 + caseStudies.length) % caseStudies.length);
  };
  return <Layout>
      <SEOHead
        title="KITech Software – KI-Agenten für den Mittelstand"
        description="Wir denken nicht in Jobrollen, sondern in KI-Agenten. Orchestrierte, DSGVO-konforme Agenten-Systeme für Ihre realen Geschäftsprozesse. Made in Germany."
        canonical="/"
      />
      <StructuredData data={getOrganizationSchema()} />
      <StructuredData data={getLocalBusinessSchema()} />
      <StructuredData data={getWebPageSchema("KITech Software – KI-Agenten für den Mittelstand", "Orchestrierte KI-Agenten für Ihre realen Geschäftsprozesse.", "https://kitech-software.de")} />
      <StructuredData data={getReviewSchema(testimonials.map(t => ({ author: t.author, text: t.quote, rating: t.rating })))} />
      <StructuredData data={getSoftwareAppSchema("ethixAI", "SaaS-Plattform für KI-Ethik und Compliance", "SaaS Platform", "https://ethixAI.io")} />
      <StructuredData data={getFAQSchema([
        { question: "Was macht KITech Software?", answer: "KITech Software entwickelt orchestrierte KI-Agenten-Systeme, die reale Geschäftsprozesse automatisieren. Wir denken nicht in Jobrollen, sondern in intelligenten Agenten-Orchestrierungen. DSGVO-konform, Made in Germany." },
        { question: "Was sind KI-Agenten?", answer: "KI-Agenten sind spezialisierte, autonome Softwareeinheiten, die bestimmte Aufgaben übernehmen. Mehrere Agenten werden orchestriert, um komplette Prozesse abzubilden – effizienter als klassische Rollenverteilung." },
        { question: "Ist KITech DSGVO-konform?", answer: "Ja, DSGVO-Konformität ist Grundprinzip. Lokales/EU Hosting möglich, keine proprietären Lock-Ins." },
      ])} />
      {/* Hero Section with Lamp Effect */}
      <section className="relative overflow-hidden">
        <LampContainer className="min-h-[550px] sm:min-h-[650px] lg:min-h-[800px]">
          <motion.div initial={{
          opacity: 0,
          y: 60
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut"
        }} className="text-center px-4 sm:px-6">
            
            
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-light tracking-tight mb-4 sm:mb-6 lg:mb-10 bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text leading-tight">
              Nicht Rollen besetzen. Agenten orchestrieren.
              <br />
              <span className="inline-block h-[1.35em] overflow-hidden mt-1 sm:mt-0">
                <TextRotate texts={["25+ orchestrierte Agenten-Systeme", "30 Prozess-Audits", "über 8 Jahre Konzernerfahrung"]} rotationInterval={3000} auto splitBy="none" staggerDuration={0} initial={{
                y: "-120%",
                opacity: 0
              }} animate={{
                y: 0,
                opacity: 1
              }} exit={{
                y: "120%",
                opacity: 0
              }} transition={{
                type: "spring",
                damping: 20,
                stiffness: 200
              }} mainClassName="justify-center" splitLevelClassName="w-full justify-center" elementLevelClassName="text-primary inline-block whitespace-nowrap text-xl sm:text-3xl lg:text-5xl" />
              </span>
            </h1>
            
            <p className="text-sm sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 lg:mb-10 leading-relaxed">
              Wir denken nicht in Jobrollen, sondern in KI-Agenten. Spezialisierte Agenten 
              übernehmen Aufgaben, orchestriert zu automatisierten Prozessen – DSGVO-konform 
              und auditierbar. Made in Germany.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button variant="hero" size="lg" className="sm:size-xl text-sm sm:text-base" asChild>
                <Link to="/kontakt" onClick={() => trackEvent("CTA_Klick", { position: "hero", label: "Agenten-Potenzial" })}>Agenten-Potenzial prüfen lassen</Link>
              </Button>
              <Button variant="heroOutline" size="lg" className="sm:size-xl text-sm sm:text-base" asChild>
                <Link to="/leistungen">Unsere Agenten-Leistungen</Link>
              </Button>
            </div>
          </motion.div>
        </LampContainer>
      </section>

      {/* Client References – Marquee */}
      <section className="border-y border-border/50 py-10 overflow-hidden">
        <div className="container mb-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground text-center">Vertraut von innovativen Unternehmen</p>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
          <div className="flex animate-marquee whitespace-nowrap">
            {[...clientReferences, ...clientReferences, ...clientReferences].map((client, i) => (
              <div key={`${client.name}-${i}`} className="flex items-center gap-3 mx-10 shrink-0">
                {client.logo ? (
                  <img src={client.logo} alt={client.name} className="h-6 w-auto object-contain grayscale opacity-60" />
                ) : (
                  <client.icon className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground font-light">{client.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eigene Produkte – kompakt */}
      <section className="py-10">
        <div className="container">
          <p className="text-xs uppercase tracking-widest text-muted-foreground text-center mb-6">Eigene Produkte</p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { logo: cleverfuchsLogo, name: "CleverFuchs", desc: "iOS App", status: "Coming Soon", href: "#" },
              { logo: ethixaiLogo, name: "ethixAI", desc: "SaaS Platform", status: "Live", href: "https://ethixAI.io" },
              { logo: klargehaltLogo, name: "Klargehalt", desc: "SaaS Platform", status: "Coming Soon", href: "https://klargehalt.de" },
            ].map((p) => (
              <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border/40 hover:border-border transition-colors group">
                <img src={p.logo} alt={p.name} className="h-8 w-8 rounded-lg object-contain grayscale group-hover:grayscale-0 transition-all" />
                <div>
                  <p className="text-sm font-medium text-foreground leading-tight">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.desc} · {p.status}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Qualifier Popup */}
      <AnimatePresence>
        {showQualifierPopup && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm" onClick={closePopup}>
            <motion.div initial={{
          opacity: 0,
          scale: 0.9,
          y: 20
        }} animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }} exit={{
          opacity: 0,
          scale: 0.9,
          y: 20
        }} transition={{
          type: "spring",
          damping: 25,
          stiffness: 300
        }} className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-background border-2 border-primary p-8 md:p-12 shadow-elevated" onClick={e => e.stopPropagation()}>
              <button onClick={closePopup} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Schritt {qualifierStep + 1} von {totalSteps}</span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div className="h-full bg-primary rounded-full" initial={{
                width: 0
              }} animate={{
                width: `${progressPercent}%`
              }} transition={{
                duration: 0.3
              }} />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {/* Step 0: Role */}
                {qualifierStep === 0 && <motion.div key="step0" initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: -20
            }} className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-light mb-2 text-foreground">
                      Was beschreibt Sie am besten?
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Wir zeigen Ihnen passende Lösungen für Ihre Situation.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {roleOptions.map(option => <motion.button key={option.id} onClick={() => handleAnswer("role", option.id)} whileHover={{
                  scale: 1.02
                }} whileTap={{
                  scale: 0.98
                }} className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 ${qualifierAnswers.role === option.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}>
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <option.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-light text-foreground">{option.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{option.subtitle}</p>
                          </div>
                        </motion.button>)}
                    </div>
                  </motion.div>}

                {/* Step 1: Industry */}
                {qualifierStep === 1 && <motion.div key="step1" initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: -20
            }} className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-light mb-2 text-foreground">
                      In welcher Branche sind Sie tätig?
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      So können wir Ihnen relevante Beispiele zeigen.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {industryOptions.map(option => <motion.button key={option.id} onClick={() => handleAnswer("industry", option.id)} whileHover={{
                  scale: 1.02
                }} whileTap={{
                  scale: 0.98
                }} className={`p-4 rounded-xl border-2 transition-all duration-200 ${qualifierAnswers.industry === option.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}>
                          <p className="font-light text-foreground text-sm">{option.label}</p>
                        </motion.button>)}
                    </div>
                  </motion.div>}

                {/* Step 2: Challenge */}
                {qualifierStep === 2 && <motion.div key="step2" initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: -20
            }} className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-light mb-2 text-foreground">
                      Was ist Ihre größte Herausforderung?
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Wir helfen Ihnen, die richtige Lösung zu finden.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {challengeOptions.map(option => <motion.button key={option.id} onClick={() => handleAnswer("challenge", option.id)} whileHover={{
                  scale: 1.02
                }} whileTap={{
                  scale: 0.98
                }} className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${qualifierAnswers.challenge === option.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}>
                          <p className="font-light text-foreground text-sm">{option.label}</p>
                        </motion.button>)}
                    </div>
                  </motion.div>}

                {/* Step 3: Revenue */}
                {qualifierStep === 3 && <motion.div key="step3" initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: -20
            }} className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-light mb-2 text-foreground">
                      Wie hoch ist Ihr Jahresumsatz?
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Hilft uns, passende Lösungen für Ihre Unternehmensgröße zu empfehlen.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                      {revenueOptions.map(option => <motion.button key={option.id} onClick={() => handleAnswer("revenue", option.id)} whileHover={{
                  scale: 1.02
                }} whileTap={{
                  scale: 0.98
                }} className={`p-4 rounded-xl border-2 transition-all duration-200 ${qualifierAnswers.revenue === option.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}>
                          <p className="font-light text-foreground text-sm">{option.label}</p>
                        </motion.button>)}
                    </div>
                  </motion.div>}

                {/* Step 4: Budget */}
                {qualifierStep === 4 && <motion.div key="step4" initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: -20
            }} className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-light mb-2 text-foreground">
                      Welches Budget planen Sie für KI?
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Keine Sorge, das ist völlig unverbindlich.
                    </p>
                    <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                      {budgetOptions.map(option => <motion.button key={option.id} onClick={() => handleAnswer("budget", option.id)} whileHover={{
                  scale: 1.02
                }} whileTap={{
                  scale: 0.98
                }} className={`p-4 rounded-xl border-2 transition-all duration-200 ${qualifierAnswers.budget === option.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}>
                          <p className="font-light text-foreground text-sm">{option.label}</p>
                        </motion.button>)}
                    </div>
                  </motion.div>}

                {/* Step 5: Success */}
                {qualifierStep === 5 && <motion.div key="step5" initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: -20
            }} className="text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
                      <Check className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-light mb-2 text-foreground">
                      Perfekt! Wir haben alles, was wir brauchen.
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                      Basierend auf Ihren Antworten können wir Ihnen maßgeschneiderte KI-Lösungen vorschlagen. Lassen Sie uns in einem kurzen Gespräch die Details besprechen.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button variant="default" size="lg" asChild onClick={closePopup}>
                        <Link to="/kontakt" onClick={() => trackEvent("Lead_Qualifier_abgeschlossen")}>
                          Kostenlos beraten lassen
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="lg" onClick={closePopup}>
                        Später
                      </Button>
                    </div>
                  </motion.div>}
              </AnimatePresence>

              {/* Back Button */}
              {qualifierStep > 0 && qualifierStep < 5 && <button onClick={() => setQualifierStep(prev => prev - 1)} className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  ← Zurück
                </button>}
            </motion.div>
          </motion.div>}
      </AnimatePresence>

      {/* Why KITech Section */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.5
            }}>
                <h2 className="text-3xl sm:text-4xl font-light mb-2">Warum KITech?</h2>
                <p className="text-2xl sm:text-3xl font-light gradient-text mb-6">
                  Agenten statt Abteilungen.
                </p>
                <p className="text-muted-foreground mb-6">
                  Während andere in Jobrollen denken, orchestrieren wir spezialisierte KI-Agenten 
                  zu automatisierten Prozessen – tief integriert in Ihre bestehende IT-Landschaft.
                </p>
                <p className="text-muted-foreground mb-8">
                  Jeder Agent übernimmt eine klar definierte Aufgabe. Zusammen bilden sie ein 
                  System, das schneller, günstiger und skalierbarer arbeitet als klassische Teams – 
                  bei voller Auditierbarkeit und DSGVO-Konformität.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4">
                {[{
                  icon: Check,
                  text: "Multi-Agent-Orchestrierung"
                }, {
                  icon: MapPin,
                  text: "Hosting in Deutschland/EU"
                }, {
                  icon: Check,
                  text: "Autonome Prozessautomatisierung"
                }, {
                  icon: Check,
                  text: "Kein Vendor-Lock-In"
                }].map((item, i) => <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                        <item.icon className="h-4 w-4 text-success" />
                      </div>
                      <span className="text-foreground">{item.text}</span>
                    </div>)}
                </div>
              </motion.div>
            </div>

            {/* Comparison Table */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: 0.2
          }} className="bg-card rounded-2xl border border-border p-6 shadow-card">
              <h3 className="font-light text-lg mb-6">Der Unterschied</h3>
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div></div>
                <div className="text-center text-primary font-light">TYPISCHE KI-AGENTUR</div>
                <div className="text-center text-primary font-light">KITECH SOFTWARE</div>
              </div>
              <div className="space-y-3">
                {comparisonData.map((row, i) => <div key={i} className="grid grid-cols-3 gap-4 items-center py-3 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{row.feature}</span>
                    <div className="text-center">
                      {row.typical && <X className="h-5 w-5 text-destructive mx-auto" />}
                    </div>
                    <span className="text-sm text-success text-center">{row.kitech}</span>
                  </div>)}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 lg:py-28 bg-card/50">
        <div className="container">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light mb-4">
              Von der Analyse zum Agenten-System
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Wir analysieren Ihre Prozesse, designen spezialisierte Agenten und 
              orchestrieren sie zu einem autonomen System. Strukturiert und transparent.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {processSteps.map((step, i) => <motion.div key={step.number} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: i * 0.1
          }} className="relative bg-card rounded-2xl border border-border p-6 shadow-card">
                <div className="absolute -top-4 -right-4 text-6xl font-bold text-primary/10">
                  {step.number}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-light mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{step.description}</p>
                <div className="space-y-2">
                  {step.features.map((feature, j) => <div key={j} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      <span className="text-foreground">{feature}</span>
                    </div>)}
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-16 sm:py-20 lg:py-28">
        <div className="container">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light mb-3 sm:mb-4">
                Agenten im Einsatz. Echte Ergebnisse.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                Keine Theorie, sondern produktive Agenten-Systeme. 
                Hier sind Auszüge aus unserer Arbeit.
              </p>
            </div>
            <div className="flex gap-2 self-end sm:self-auto">
              <button onClick={prevCaseStudy} className="p-2 rounded-lg border border-border hover:bg-accent transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={nextCaseStudy} className="p-2 rounded-lg border border-border hover:bg-accent transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>

          {/* Mobile: Swipeable cards */}
          <div className="md:hidden">
            <motion.div className="overflow-hidden" drag="x" dragConstraints={{
            left: 0,
            right: 0
          }} dragElastic={0.2} onDragEnd={(e, {
            offset,
            velocity
          }) => {
            const swipe = Math.abs(offset.x) * velocity.x;
            if (swipe < -500) {
              nextCaseStudy();
            } else if (swipe > 500) {
              prevCaseStudy();
            }
          }}>
              <AnimatePresence mode="wait">
                <motion.div key={currentCaseStudy} initial={{
                opacity: 0,
                x: 50
              }} animate={{
                opacity: 1,
                x: 0
              }} exit={{
                opacity: 0,
                x: -50
              }} transition={{
                duration: 0.3
              }} className="bg-card rounded-2xl border border-border p-5 shadow-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {(() => {
                      const Icon = caseStudies[currentCaseStudy].icon;
                      return <Icon className="h-5 w-5" />;
                    })()}
                    </div>
                    <div>
                      <h3 className="font-light text-base">{caseStudies[currentCaseStudy].industry}</h3>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {caseStudies[currentCaseStudy].subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-destructive/10 text-destructive text-xs font-light rounded mb-1">
                        Problem
                      </span>
                      <p className="text-sm text-muted-foreground">{caseStudies[currentCaseStudy].problem}</p>
                    </div>
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-success/10 text-success text-xs font-light rounded mb-1">
                        Lösung
                      </span>
                      <p className="text-sm text-muted-foreground">{caseStudies[currentCaseStudy].solution}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-xl font-light text-success">{caseStudies[currentCaseStudy].result}</p>
                    <p className="text-xs text-muted-foreground">{caseStudies[currentCaseStudy].resultDetail}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
            
            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {caseStudies.map((_, i) => <button key={i} onClick={() => setCurrentCaseStudy(i)} className={`w-2 h-2 rounded-full transition-colors ${i === currentCaseStudy ? 'bg-primary' : 'bg-muted-foreground/30'}`} />)}
            </div>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {caseStudies.map((study, i) => <motion.div key={study.industry} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: i * 0.1
          }} className="bg-card rounded-2xl border border-border p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <study.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-light">{study.industry}</h3>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {study.subtitle}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-destructive/10 text-destructive text-xs font-light rounded mb-1">
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
                  <p className="text-2xl font-light text-success">{study.result}</p>
                  <p className="text-xs text-muted-foreground">{study.resultDetail}</p>
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-28 bg-card/50">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => <motion.div key={i} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: i * 0.1
          }} className="bg-card rounded-2xl border border-border p-6 shadow-card">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => <Star key={j} className="h-4 w-4 fill-primary text-primary" />)}
                </div>
                <blockquote className="text-foreground mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <p className="font-light text-sm">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="relative overflow-hidden rounded-3xl bg-background border-2 border-primary p-8 md:p-16 text-center shadow-elevated">
            <h2 className="text-3xl sm:text-4xl font-light mb-4 text-foreground">
              Bereit für Ihre eigenen KI-Agenten?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Lassen Sie uns gemeinsam herausfinden, welche Prozesse in Ihrem 
              Unternehmen durch orchestrierte KI-Agenten automatisiert werden können.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="cta" size="xl" onClick={() => { trackEvent("Calendly_Klick", { position: "footer-cta" }); window.open('https://calendly.com/kitech-software-info/30min', '_blank'); }}>
                Unverbindliches Erstgespräch
              </Button>
              <Button variant="ctaOutline" size="xl" asChild>
                <Link to="/kontakt" onClick={() => trackEvent("CTA_Klick", { position: "footer-cta", label: "Kontakt" })}>Kontakt aufnehmen</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                DSGVO-konform
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Made in Germany
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>;
}