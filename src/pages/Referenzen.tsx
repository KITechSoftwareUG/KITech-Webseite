import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Factory, 
  ShoppingCart, 
  TrendingUp,
  Star,
  ArrowRight,
  Building2
} from "lucide-react";

const caseStudies = [
  {
    id: 1,
    industry: "Wirtschaftskanzlei",
    client: "Große deutsche Wirtschaftskanzlei",
    icon: Shield,
    challenge: "Manuelle Prüfung von hunderten Vertragspositionen verursachte erheblichen Zeitaufwand bei den Partnern und führte zu Engpässen bei komplexen Due-Diligence-Prozessen.",
    solution: "Implementierung eines lokalen LLM-Systems zur automatisierten Extraktion und Klassifizierung von Risikoklauseln. Das System wurde auf dem eigenen Server der Kanzlei deployed, um maximale Vertraulichkeit zu gewährleisten.",
    results: [
      { metric: "75%", label: "Zeitersparnis" },
      { metric: "99.2%", label: "Genauigkeit" },
      { metric: "3 Wochen", label: "Implementierung" },
    ],
    quote: "Endlich ein Partner, der versteht, dass bei uns jedes Dokument vertraulich ist.",
    technologies: ["Lokales LLM", "RAG", "Custom Fine-Tuning"],
  },
  {
    id: 2,
    industry: "Maschinenbau KMU",
    client: "Mittelständischer Maschinenbauer",
    icon: Factory,
    challenge: "Hohe Ausschussquote von 15% durch visuelle Fehler, die erst spät im Produktionsprozess erkannt wurden. Manuelle Qualitätskontrolle war zeitaufwändig und fehleranfällig.",
    solution: "Computer Vision Modell auf Edge-Hardware direkt an der Produktionslinie. Echtzeit-Fehlererkennung mit automatischer Klassifizierung und Benachrichtigung.",
    results: [
      { metric: "12%", label: "Weniger Ausschuss" },
      { metric: "< 100ms", label: "Erkennungszeit" },
      { metric: "3 Monate", label: "ROI erreicht" },
    ],
    quote: "Die Amortisation war schneller als bei jeder anderen Investition in den letzten Jahren.",
    technologies: ["Computer Vision", "Edge AI", "Real-time Processing"],
  },
  {
    id: 3,
    industry: "E-Commerce",
    client: "Wachsender Online-Händler",
    icon: ShoppingCart,
    challenge: "Support-Team überlastet mit wiederkehrenden Standardanfragen zu Bestellstatus, Rückgaben und Produktinformationen. Lange Antwortzeiten führten zu Kundenunzufriedenheit.",
    solution: "RAG-System mit eigenem FAQ und Dokumentenbestand. Intelligente Eskalation an menschliche Agenten bei komplexen Fällen.",
    results: [
      { metric: "40%", label: "Automatisierung" },
      { metric: "24/7", label: "Verfügbarkeit" },
      { metric: "4.8/5", label: "Kundenzufriedenheit" },
    ],
    quote: "Unser Support-Team kann sich endlich auf die wirklich wichtigen Fälle konzentrieren.",
    technologies: ["RAG", "ChatBot", "Integration APIs"],
  },
];

const metrics = [
  { value: "50+", label: "Projekte abgeschlossen" },
  { value: "98%", label: "Kundenzufriedenheit" },
  { value: "Ø 4 Mo.", label: "Time-to-Value" },
  { value: "100%", label: "DSGVO-konform" },
];

export default function Referenzen() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-background to-card">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="gradient-text">Referenzen</span> & Case Studies
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Keine Marketing-Versprechen, sondern dokumentierte Ergebnisse. 
              Erfahren Sie, wie wir echte Geschäftsprobleme mit KI gelöst haben.
            </p>
          </motion.div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {metrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl font-bold gradient-text">{metric.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="space-y-16">
            {caseStudies.map((study, i) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-card rounded-3xl border border-border overflow-hidden"
              >
                <div className="grid lg:grid-cols-2 gap-8 p-8 md:p-12">
                  {/* Left: Info */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <study.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{study.industry}</h3>
                        <p className="text-sm text-muted-foreground">{study.client}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-semibold text-destructive mb-2">Herausforderung</h4>
                        <p className="text-muted-foreground">{study.challenge}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-success mb-2">Lösung</h4>
                        <p className="text-muted-foreground">{study.solution}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-6">
                      {study.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-secondary rounded-full text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Results */}
                  <div className="lg:border-l lg:border-border lg:pl-8">
                    <h4 className="text-sm font-semibold text-primary mb-6">Ergebnisse</h4>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {study.results.map((result) => (
                        <div key={result.label} className="text-center p-4 bg-secondary/50 rounded-xl">
                          <p className="text-2xl font-bold text-success">{result.metric}</p>
                          <p className="text-xs text-muted-foreground mt-1">{result.label}</p>
                        </div>
                      ))}
                    </div>

                    <blockquote className="border-l-2 border-primary pl-4 italic text-muted-foreground">
                      "{study.quote}"
                    </blockquote>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-card/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ihr Projekt könnte das nächste sein
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Lassen Sie uns gemeinsam herausfinden, wie KI in Ihrem Unternehmen 
              echten Mehrwert schaffen kann.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/kontakt">
                Projekt besprechen
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
