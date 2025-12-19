import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LampContainer } from "@/components/ui/lamp";
import { TextRotate } from "@/components/ui/text-rotate";
import { Check, X, Star, ArrowRight, ChevronLeft, ChevronRight, Clipboard, Database, Rocket, Building2, Factory, ShoppingCart, Shield, MapPin, Terminal, Smartphone, Sparkles } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useState } from "react";

const clientReferences = [
  { name: "NiImmo Holding GmbH", icon: Building2 },
  { name: "Alltagshilfe Fischer GmbH", icon: Shield },
  { name: "Certconsulting Pane, Spark und Partner", icon: Clipboard },
  { name: "KREMA Group", icon: Factory },
  { name: "Vantage Partner", icon: Database },
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
              <span className="gradient-text inline-block h-[1.35em] overflow-hidden">
                <TextRotate
                  texts={["25+ erfolgreiche Projekte", "30 KI-Audits", "Ohne Hype, mit Substanz"]}
                  rotationInterval={3000}
                  splitBy="none"
                  staggerDuration={0}
                  initial={{ y: "-120%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "120%", opacity: 0 }}
                  transition={{ type: "spring", damping: 20, stiffness: 200 }}
                  mainClassName="w-full justify-center"
                  splitLevelClassName="w-full justify-center"
                  elementLevelClassName="inline-block whitespace-nowrap"
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
      <section className="border-y border-border bg-card/50 py-10">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr,auto] gap-10 items-start">
            {/* Client References */}
            <div>
              <p className="text-sm text-muted-foreground mb-5">
                Vertraut von innovativen Unternehmen
              </p>
              <div className="flex flex-wrap items-center gap-6 md:gap-8">
                {clientReferences.map(client => (
                  <div key={client.name} className="flex items-center gap-2 text-muted-foreground/70">
                    <client.icon className="h-5 w-5" />
                    <span className="font-light text-sm">{client.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Products */}
            <div className="lg:border-l lg:border-border lg:pl-10">
              <p className="text-sm text-muted-foreground mb-5">
                Eigene Produkte
              </p>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
                {products.map(product => (
                  <div key={product.name} className="flex items-center gap-3 bg-background/50 rounded-lg px-4 py-3 border border-border/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <product.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-light text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

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
        }} className="relative overflow-hidden rounded-3xl bg-card border border-border p-8 md:p-16 text-center gradient-cta">
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