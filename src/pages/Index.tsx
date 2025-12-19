import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LampContainer } from "@/components/ui/lamp";
import { TextRotate } from "@/components/ui/text-rotate";
import { Check, X, Star, ArrowRight, ChevronLeft, ChevronRight, Clipboard, Database, Rocket, Building2, Factory, ShoppingCart, Shield, MapPin, Terminal, Smartphone, Sparkles } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { Users, Briefcase, HelpCircle } from "lucide-react";
import cleverfuchsLogo from "@/assets/cleverfuchs-logo.png";
import appStoreBadge from "@/assets/appstore-badge.svg";
import niimmoLogo from "@/assets/niimmo-logo.png";
import alltagshilfeLogo from "@/assets/alltagshilfe-logo.png";
import certconsultingLogo from "@/assets/certconsulting-logo.png";
import kremaLogo from "@/assets/krema-logo.png";
import expatvantageLogo from "@/assets/expatvantage-logo.png";

const clientReferences = [
  { name: "NiImmo Holding GmbH", icon: Building2, logo: niimmoLogo },
  { name: "Alltagshilfe Fischer GmbH", icon: Shield, logo: alltagshilfeLogo },
  { name: "cert consulting Pane", icon: Clipboard, logo: certconsultingLogo },
  { name: "KREMA Group", icon: Factory, logo: kremaLogo },
  { name: "ExpatVantage", icon: Database, logo: expatvantageLogo },
];

const products = [
  { 
    name: "CleverFuchs", 
    description: "iOS App", 
    icon: Smartphone 
  },
  { 
    name: "KI-DNA Generator", 
    description: "SaaS Platform", 
    icon: Sparkles 
  },
];
const comparisonData = [{
  feature: 'Standard "Prompts"',
  typical: true,
  kitech: "Technische Integration"
}, {
  feature: "Unklare/feltige Datenfüsse",
  typical: true,
  kitech: "DSGVO-konforme Architektur"
}, {
  feature: "Demo-Effekte",
  typical: true,
  kitech: "Produktivsysteme"
}, {
  feature: "Kurzfristiger Hype",
  typical: true,
  kitech: "Langfristige Wartbarkeit"
}];
const processSteps = [{
  number: "01",
  title: "KI-Audit & Standortbestimmung",
  description: "Kein Blindflug. Wir analysieren Ihre Datenqualität, Prozesseignung und organisatorische Reife. Das Ergebnis ist eine objektive Entscheidungsgrundlage, kein Verkaufs-Pitch.",
  features: ["Risikoanalyse", "Machbarkeitsprüfung"],
  icon: Clipboard
}, {
  number: "02",
  title: "Individuelle KI-Systeme",
  description: "Wir entwickeln maßgeschneiderte KI-Automatisierungen, die genau auf Ihre Schnittstellen passen. Auditierbar, sicher und dokumentiert.",
  features: ["Lokale/EU Deployments", "Clean Code & Docs"],
  icon: Database
}, {
  number: "03",
  title: "Begleitete Umsetzung",
  description: "Von der ersten Codezeile bis zum Betrieb. Wir sorgen für iterative Entwicklung, transparente Architektur und klare Verantwortlichkeiten.",
  features: ["Wissenstransfer", "Laufende Wartung"],
  icon: Rocket
}];
const caseStudies = [{
  industry: "Wirtschaftskanzlei",
  subtitle: "LEGAL TECH",
  problem: "Manuelle Prüfung von hunderten Vertragspositionen",
  solution: "Lokales LLM zur Extraktion von Risikoklauseln",
  result: "75% Zeitersparnis",
  resultDetail: "Bei voller Entlastung der Partner",
  icon: Shield
}, {
  industry: "Maschinenbau KMU",
  subtitle: "QUALITÄTSSICHERUNG",
  problem: "Hohe Ausschussquote durch visuelle Fehler",
  solution: "Computer Vision Modell auf Edge-Hardware",
  result: "12% weniger Ausschuss",
  resultDetail: "ROI nach drei Monaten erreicht",
  icon: Factory
}, {
  industry: "E-Commerce Player",
  subtitle: "KUNDENSUPPORT",
  problem: "Support-Überlastung bei Standard-anfragen",
  solution: "RAG-System mit eigenem FAQ/Dokumenten",
  result: "40% Automatisierung",
  resultDetail: "Ohne Qualitätseinbußen im Support",
  icon: ShoppingCart
}];
const testimonials = [{
  quote: "Endlich ein Partner, der KI technisch versteht statt sie uns als Marketing-Allheilmittel zu verkaufen.",
  author: "Dr. Marcus Weber",
  role: "CTO, TechVenture GmbH",
  rating: 5
}, {
  quote: "Nachweisbare Ergebnisse und deutsche Server - ein Unterschied für uns als DSGVO-relevantes Unternehmen.",
  author: "Ing. Thomas Klein",
  role: "Geschäftsführer, Precision Engineering",
  rating: 5
}, {
  quote: "Professionell, uneigenständig und technisch versiert. Keine Buzzwords, nur Umsetzung.",
  author: "Julia Schmidt",
  role: "Head of Digital, FinanceFirst AG",
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

  const closePopup = () => {
    setShowQualifierPopup(false);
    setPopupDismissed(true);
  };

  const roleOptions = [
    { id: "unternehmen", icon: Briefcase, title: "Unternehmer/in", subtitle: "Ich leite ein Unternehmen" },
    { id: "fuehrung", icon: Users, title: "Führungskraft", subtitle: "Ich bin in einer Führungsposition" },
    { id: "berater", icon: HelpCircle, title: "Berater/in", subtitle: "Ich berate andere Unternehmen" }
  ];

  const industryOptions = [
    { id: "dienstleistung", label: "Dienstleistung" },
    { id: "handel", label: "Handel & E-Commerce" },
    { id: "produktion", label: "Produktion & Industrie" },
    { id: "finanzen", label: "Finanzen & Versicherung" },
    { id: "gesundheit", label: "Gesundheit & Pflege" },
    { id: "andere", label: "Andere Branche" }
  ];

  const challengeOptions = [
    { id: "kosten", label: "Kosten senken & Effizienz steigern" },
    { id: "automatisierung", label: "Prozesse automatisieren" },
    { id: "kundenservice", label: "Kundenservice verbessern" },
    { id: "daten", label: "Daten besser nutzen" },
    { id: "wettbewerb", label: "Wettbewerbsfähig bleiben" },
    { id: "unsicher", label: "Weiß noch nicht genau" }
  ];

  const revenueOptions = [
    { id: "unter500k", label: "Unter 500.000 €" },
    { id: "500k-2m", label: "500.000 € – 2 Mio. €" },
    { id: "2m-10m", label: "2 – 10 Mio. €" },
    { id: "10m-50m", label: "10 – 50 Mio. €" },
    { id: "ueber50m", label: "Über 50 Mio. €" }
  ];

  const budgetOptions = [
    { id: "unter10k", label: "Unter 10.000 €" },
    { id: "10k-25k", label: "10.000 – 25.000 €" },
    { id: "25k-50k", label: "25.000 – 50.000 €" },
    { id: "50k-100k", label: "50.000 – 100.000 €" },
    { id: "ueber100k", label: "Über 100.000 €" },
    { id: "unklar", label: "Noch nicht definiert" }
  ];

  const handleAnswer = (field: string, value: string) => {
    setQualifierAnswers(prev => ({ ...prev, [field]: value }));
    setTimeout(() => {
      setQualifierStep(prev => prev + 1);
    }, 300);
  };

  const totalSteps = 6;
  const progressPercent = (qualifierStep / (totalSteps - 1)) * 100;

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
      {/* Hero Section with Lamp Effect */}
      <section className="relative overflow-hidden">
        <LampContainer className="min-h-[700px] lg:min-h-[800px]">
          <motion.div initial={{
          opacity: 0,
          y: 100
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut"
        }} className="text-center">
            
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-10 bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text">
              KI-Lösungen, die Bestand haben.
              <br />
              <span className="inline-block h-[1.35em] overflow-hidden">
                <TextRotate
                  texts={["25+ erfolgreiche Projekte", "30 KI-Audits", "über 8 Jahre Konzernerfahrung"]}
                  rotationInterval={3000}
                  auto
                  splitBy="none"
                  staggerDuration={0}
                  initial={{ y: "-120%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "120%", opacity: 0 }}
                  transition={{ type: "spring", damping: 20, stiffness: 200 }}
                  mainClassName="justify-center"
                  splitLevelClassName="w-full justify-center"
                  elementLevelClassName="text-primary inline-block whitespace-nowrap"
                />
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Individuelle, sichere und auditierbare KI-Systeme für Ihre realen 
              Geschäftsprozesse. Wir ersetzen Buzzwords durch Ingenieurskunst und 
              Marketing-Versprechen durch technische Validierung.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/kontakt">KI-Reifegrad prüfen lassen</Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/leistungen">Technische Standortbestimmung</Link>
              </Button>
            </div>
          </motion.div>
        </LampContainer>
      </section>

      {/* Trust Logos & Products */}
      <section className="border-y border-border bg-card/50 py-16 md:py-20">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr,auto] gap-12 lg:gap-16 items-start">
            {/* Client References */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Referenzen
              </h3>
              <p className="text-muted-foreground mb-8">
                Vertraut von innovativen Unternehmen
              </p>
              <div className="flex flex-wrap items-center gap-8 md:gap-10">
                {clientReferences.map(client => (
                  <div key={client.name} className="flex items-center gap-3 text-foreground/80">
                    {client.logo ? (
                      <img src={client.logo} alt={client.name} className="h-8 w-auto object-contain" />
                    ) : (
                      <client.icon className="h-6 w-6" />
                    )}
                    <span className="font-light text-base">{client.name}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-light text-base italic">Und mehr</span>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="lg:border-l lg:border-border lg:pl-12">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Eigene Produkte
              </h3>
              <p className="text-muted-foreground mb-8">
                Von mir entwickelte Lösungen
              </p>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-5">
                {/* CleverFuchs with App Store Button */}
                <div className="flex items-center gap-4 bg-background/80 rounded-xl px-5 py-4 border border-border/50 shadow-sm">
                  <img 
                    src={cleverfuchsLogo} 
                    alt="CleverFuchs Logo" 
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-base">CleverFuchs</p>
                    <p className="text-sm text-muted-foreground">iOS App</p>
                  </div>
                  <a 
                    href="https://apps.apple.com/app/cleverfuchs" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="shrink-0"
                  >
                    <img 
                      src={appStoreBadge} 
                      alt="Download im App Store" 
                      className="h-10"
                    />
                  </a>
                </div>
                
                {/* KI-DNA Generator */}
                <div className="flex items-center gap-4 bg-background/80 rounded-xl px-5 py-4 border border-border/50 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-base">KI-DNA Generator</p>
                    <p className="text-sm text-muted-foreground">SaaS Platform</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Qualifier Popup */}
      <AnimatePresence>
        {showQualifierPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
            onClick={closePopup}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-background border-2 border-primary p-8 md:p-12 shadow-elevated"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closePopup}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Schritt {qualifierStep + 1} von {totalSteps}</span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {/* Step 0: Role */}
                {qualifierStep === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="text-center"
                  >
                    <h2 className="text-2xl sm:text-3xl font-light mb-2 text-foreground">
                      Was beschreibt Sie am besten?
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Wir zeigen Ihnen passende Lösungen für Ihre Situation.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {roleOptions.map((option) => (
                        <motion.button
                          key={option.id}
                          onClick={() => handleAnswer("role", option.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 ${
                            qualifierAnswers.role === option.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <option.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-light text-foreground">{option.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{option.subtitle}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 1: Industry */}
                {qualifierStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="text-center"
                  >
                    <h2 className="text-2xl sm:text-3xl font-light mb-2 text-foreground">
                      In welcher Branche sind Sie tätig?
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      So können wir Ihnen relevante Beispiele zeigen.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {industryOptions.map((option) => (
                        <motion.button
                          key={option.id}
                          onClick={() => handleAnswer("industry", option.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            qualifierAnswers.industry === option.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <p className="font-light text-foreground text-sm">{option.label}</p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Challenge */}
                {qualifierStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="text-center"
                  >
                    <h2 className="text-2xl sm:text-3xl font-light mb-2 text-foreground">
                      Was ist Ihre größte Herausforderung?
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Wir helfen Ihnen, die richtige Lösung zu finden.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {challengeOptions.map((option) => (
                        <motion.button
                          key={option.id}
                          onClick={() => handleAnswer("challenge", option.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            qualifierAnswers.challenge === option.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <p className="font-light text-foreground text-sm">{option.label}</p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Revenue */}
                {qualifierStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="text-center"
                  >
                    <h2 className="text-2xl sm:text-3xl font-light mb-2 text-foreground">
                      Wie hoch ist Ihr Jahresumsatz?
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Hilft uns, passende Lösungen für Ihre Unternehmensgröße zu empfehlen.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                      {revenueOptions.map((option) => (
                        <motion.button
                          key={option.id}
                          onClick={() => handleAnswer("revenue", option.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            qualifierAnswers.revenue === option.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <p className="font-light text-foreground text-sm">{option.label}</p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Budget */}
                {qualifierStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="text-center"
                  >
                    <h2 className="text-2xl sm:text-3xl font-light mb-2 text-foreground">
                      Welches Budget planen Sie für KI?
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Keine Sorge, das ist völlig unverbindlich.
                    </p>
                    <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                      {budgetOptions.map((option) => (
                        <motion.button
                          key={option.id}
                          onClick={() => handleAnswer("budget", option.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            qualifierAnswers.budget === option.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <p className="font-light text-foreground text-sm">{option.label}</p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Success */}
                {qualifierStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="text-center"
                  >
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
                        <Link to="/kontakt">
                          Kostenlos beraten lassen
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={closePopup}
                      >
                        Später
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Back Button */}
              {qualifierStep > 0 && qualifierStep < 5 && (
                <button
                  onClick={() => setQualifierStep(prev => prev - 1)}
                  className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Zurück
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
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
                  Haltung statt Hype.
                </p>
                <p className="text-muted-foreground mb-6">
                  Während andere "KI-Agenturen" Wrapper um ChatGPT bauen, entwickeln wir 
                  robuste Systeme, die tief in Ihre bestehende IT-Landschaft integriert sind.
                </p>
                <p className="text-muted-foreground mb-8">
                  Wir verstehen KI nicht als Spielerei, sondern als kritisches Infrastruktur-Element. 
                  Datensicherheit, Nachvollziehbarkeit und wirtschaftliche Wartbarkeit stehen bei uns 
                  vor dem nächsten viralen Trend.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {[{
                  icon: Check,
                  text: "Auditierbare Ergebnisse"
                }, {
                  icon: MapPin,
                  text: "Hosting in Deutschland/EU"
                }, {
                  icon: Check,
                  text: "Reale Prozessintegration"
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
              Unser Vorgehen: Strukturiert & Transparent
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Wir verkaufen keine Wunder, sondern ingenieurtechnische Lösungen. 
              Unser Prozess minimiert Risiken und maximiert Nutzen.
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
        }} className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-light mb-4">
                Echte Probleme. Echte Lösungen.
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Wir sprechen nicht über Möglichkeiten, sondern über Ergebnisse. 
                Hier sind Auszüge aus unserer Arbeit.
              </p>
            </div>
            <div className="hidden md:flex gap-2">
              <button onClick={prevCaseStudy} className="p-2 rounded-lg border border-border hover:bg-accent transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={nextCaseStudy} className="p-2 rounded-lg border border-border hover:bg-accent transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
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
              Bereit für KI mit Substanz?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Lassen Sie uns in einem unverbindlichen Gespräch prüfen, wo KI in 
              Ihrem Unternehmen echten Mehrwert stiftet – und wo nicht.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="cta" size="xl" asChild>
                <Link to="/kontakt">Unverbindliches Erstgespräch</Link>
              </Button>
              <Button variant="ctaOutline" size="xl" asChild>
                <Link to="/kontakt">Kontakt aufnehmen</Link>
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