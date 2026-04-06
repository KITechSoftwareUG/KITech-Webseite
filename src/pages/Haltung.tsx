import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData, getWebPageSchema, getBreadcrumbSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Eye, 
  Wrench, 
  Target, 
  Users, 
  Check,
  ArrowRight,
  Scale,
  Heart
} from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Sicherheit vor Features",
    description: "Jede Zeile Code wird unter dem Aspekt der Datensicherheit geschrieben. DSGVO-Konformität ist kein Afterthought, sondern Grundprinzip.",
  },
  {
    icon: Eye,
    title: "Transparenz statt Blackbox",
    description: "Wir erklären, was wir tun und warum. Keine versteckten Abhängigkeiten, keine proprietären Lock-Ins, keine magischen Versprechen.",
  },
  {
    icon: Wrench,
    title: "Engineering statt Marketing",
    description: "Wir sind Ingenieure, keine Verkäufer. Unsere Lösungen basieren auf technischer Exzellenz, nicht auf buzzword-getriebenen Trends.",
  },
  {
    icon: Target,
    title: "Fokus auf echten Mehrwert",
    description: "Nicht jedes Problem braucht KI. Wir sagen Ihnen ehrlich, wenn eine einfachere Lösung besser passt.",
  },
  {
    icon: Scale,
    title: "Nachhaltige Architekturen",
    description: "Wir bauen Systeme, die wartbar, erweiterbar und langfristig wirtschaftlich sind – keine Quick Fixes.",
  },
  {
    icon: Users,
    title: "Partnerschaft auf Augenhöhe",
    description: "Wir behandeln Sie als Partner, nicht als Auftraggeber. Ihr Erfolg ist unser Erfolg.",
  },
];

const differentiators = [
  "Kein Vendor-Lock-In: Sie besitzen Ihren Code",
  "Lokales/EU Hosting möglich",
  "Vollständige Dokumentation",
  "Wissenstransfer inklusive",
  "Transparente Preisgestaltung",
  "Langfristige Wartungsverträge",
];

export default function Haltung() {
  return (
    <Layout>
      <SEOHead
        title="Unsere Haltung – Agenten statt Abteilungen | KITech Software"
        description="Wir denken in Agenten-Orchestrierungen statt in Jobrollen. Substanz statt Hype, autonome Systeme statt manuelle Prozesse."
        canonical="/haltung"
      />
      <StructuredData data={getWebPageSchema("Haltung", "Unsere Werte und Prinzipien", "https://kitech-software.de/haltung")} />
      <StructuredData data={getBreadcrumbSchema([{ name: "Startseite", url: "https://kitech-software.de" }, { name: "Haltung", url: "https://kitech-software.de/haltung" }])} />
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
              Unsere <span className="gradient-text">Haltung</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Wir denken nicht in Jobrollen, sondern in Agenten-Orchestrierungen. 
              Prozesse automatisieren statt Stellen besetzen – mit Substanz und Engineering-Exzellenz.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <Heart className="h-12 w-12 text-primary mx-auto mb-6" />
            <blockquote className="text-2xl sm:text-3xl font-medium mb-6">
              "Wir ersetzen keine Menschen – wir orchestrieren Agenten, die 
              <span className="gradient-text"> Prozesse übernehmen, nicht Rollen.</span>"
            </blockquote>
            <p className="text-muted-foreground">
              Statt Jobrollen zu automatisieren, zerlegen wir Prozesse in Aufgaben und weisen 
              jedem Schritt einen spezialisierten KI-Agenten zu. So entsteht ein orchestriertes 
              System, das skaliert, auditierbar ist und langfristig Mehrwert schafft.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-20 lg:py-28 bg-card/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Unsere Werte</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Diese Prinzipien leiten jede Entscheidung, die wir treffen.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-6 shadow-card"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Was uns <span className="gradient-text">unterscheidet</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                In einem Markt voller leerer Versprechungen setzen wir auf messbare 
                Ergebnisse und langfristige Partnerschaften. Hier ist, was Sie von uns 
                erwarten können:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {differentiators.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border p-8 shadow-card"
            >
              <h3 className="text-xl font-semibold mb-4">Unser Versprechen</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Ehrliche Beratung</p>
                    <p className="text-sm text-muted-foreground">
                      Wir sagen Ihnen, wenn KI nicht die richtige Lösung ist.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Keine versteckten Kosten</p>
                    <p className="text-sm text-muted-foreground">
                      Transparente Preisgestaltung von Anfang an.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Messbare Ergebnisse</p>
                    <p className="text-sm text-muted-foreground">
                      Jedes Projekt mit klaren KPIs und Erfolgskriterien.
                    </p>
                  </div>
                </li>
              </ul>
            </motion.div>
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
              Klingt das nach dem Partner, den Sie suchen?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Lassen Sie uns in einem unverbindlichen Gespräch herausfinden, 
              ob wir zusammenpassen.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/kontakt">
                Gespräch vereinbaren
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
