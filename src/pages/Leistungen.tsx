import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Cpu, 
  Search, 
  Cog, 
  Shield, 
  Database, 
  Eye, 
  MessageSquare, 
  FileText, 
  Check,
  ArrowRight
} from "lucide-react";

const services = [
  {
    icon: Search,
    title: "KI-Audit & Potenzialanalyse",
    description: "Objektive Bewertung Ihrer KI-Reife und Identifikation konkreter Anwendungsfälle mit messbarem ROI.",
    features: [
      "Datenqualitätsbewertung",
      "Prozesseignungsprüfung",
      "Technische Machbarkeitsanalyse",
      "ROI-Kalkulation",
    ],
  },
  {
    icon: Cpu,
    title: "Custom LLM-Integrationen",
    description: "Maßgeschneiderte Sprachmodell-Lösungen, die sicher in Ihre bestehende Infrastruktur eingebettet werden.",
    features: [
      "Lokale/EU Deployments",
      "RAG-Systeme",
      "Fine-Tuning",
      "API-Integrationen",
    ],
  },
  {
    icon: Eye,
    title: "Computer Vision",
    description: "Bilderkennungs- und Analysesysteme für Qualitätskontrolle, Dokumentenverarbeitung und mehr.",
    features: [
      "Qualitätskontrolle",
      "Objekterkennung",
      "OCR & Dokumentenanalyse",
      "Edge-Deployment",
    ],
  },
  {
    icon: MessageSquare,
    title: "Intelligente Assistenten",
    description: "KI-gestützte Chatbots und Assistenten, die Ihre Geschäftsprozesse wirklich verstehen.",
    features: [
      "Kundenservice-Automatisierung",
      "Interne Wissensassistenten",
      "Prozessautomatisierung",
      "Multi-Channel-Support",
    ],
  },
  {
    icon: Database,
    title: "Datenplattform-Aufbau",
    description: "Solide Dateninfrastruktur als Fundament für nachhaltige KI-Initiativen.",
    features: [
      "Data Warehousing",
      "ETL-Pipelines",
      "Datenqualitätsmanagement",
      "Analytics-Dashboards",
    ],
  },
  {
    icon: Cog,
    title: "MLOps & Wartung",
    description: "Professioneller Betrieb und kontinuierliche Verbesserung Ihrer KI-Systeme.",
    features: [
      "Modell-Monitoring",
      "Automatisierte Retraining",
      "Performance-Optimierung",
      "24/7 Support",
    ],
  },
];

const techStack = [
  { name: "Python", category: "Backend" },
  { name: "PyTorch", category: "ML Framework" },
  { name: "Hugging Face", category: "LLMs" },
  { name: "LangChain", category: "LLM Orchestrierung" },
  { name: "PostgreSQL", category: "Database" },
  { name: "Docker", category: "Containerization" },
  { name: "Kubernetes", category: "Orchestrierung" },
  { name: "Azure/AWS", category: "Cloud" },
];

export default function Leistungen() {
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
              Unsere <span className="gradient-text">Leistungen</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Von der strategischen Analyse bis zur produktionsreifen Implementierung – 
              wir begleiten Sie auf dem gesamten Weg zu nachhaltigen KI-Lösungen.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/kontakt">
                Beratungsgespräch vereinbaren
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-elevated transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <service.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-muted-foreground text-sm mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 lg:py-28 bg-card/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Technologie-Stack
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Wir setzen auf bewährte, enterprise-ready Technologien statt auf den neuesten Hype.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="px-4 py-2 bg-card rounded-lg border border-border"
              >
                <span className="font-medium">{tech.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{tech.category}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-3xl border border-border p-8 md:p-16 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Passendes Paket nicht dabei?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Jedes Unternehmen ist einzigartig. Lassen Sie uns gemeinsam herausfinden, 
              welche KI-Lösung für Sie am sinnvollsten ist.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/kontakt">Individuelles Angebot anfragen</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
