import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData, getWebPageSchema, getBreadcrumbSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import niimmoLogo from "@/assets/niimmo-logo.png";
import alltagshilfeLogo from "@/assets/alltagshilfe-logo.png";
import certconsultingLogo from "@/assets/certconsulting-logo.png";
import kremaLogo from "@/assets/krema-logo.png";
import expatvantageLogo from "@/assets/expatvantage-logo.png";
import feilAutomationAsset from "@/assets/feil-automation-logo.png.asset.json";
import pflegeXpertsAsset from "@/assets/pflegexperts-logo.png.asset.json";
import lernwerkstattAsset from "@/assets/lernwerkstatt-pflege-logo.png.asset.json";

const metrics = [
  { value: "50+", label: "Projekte abgeschlossen" },
  { value: "98%", label: "Kundenzufriedenheit" },
  { value: "Ø 4 Mo.", label: "Time-to-Value" },
  { value: "100%", label: "DSGVO-konform" },
];

const clients = [
  { name: "NiImmo Holding GmbH", logo: niimmoLogo },
  { name: "Alltagshilfe Fischer GmbH", logo: alltagshilfeLogo },
  { name: "cert consulting Pane", logo: certconsultingLogo },
  { name: "KREMA Group", logo: kremaLogo },
  { name: "ExpatVantage", logo: expatvantageLogo },
  { name: "FEIL Automation (Maschinenbau)", logo: feilAutomationAsset.url },
  { name: "PflegeXperts", logo: pflegeXpertsAsset.url },
  { name: "Lernwerkstatt Pflege", logo: lernwerkstattAsset.url },
];

export default function Referenzen() {
  const autoplayPlugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  return (
    <Layout>
      <SEOHead
        title="Referenzen – KITech Software"
        description="Ausgewählte Kunden aus Immobilien, Pflege, Industrie, Maschinenbau und Beratung. Über 50 erfolgreich abgeschlossene KI-Projekte."
        canonical="/referenzen"
      />
      <StructuredData data={getWebPageSchema("Referenzen", "Ausgewählte Kunden und Branchen", "https://kitech-software.de/referenzen")} />
      <StructuredData data={getBreadcrumbSchema([{ name: "Startseite", url: "https://kitech-software.de" }, { name: "Referenzen", url: "https://kitech-software.de/referenzen" }])} />

      {/* Hero */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-background to-card">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Unsere <span className="gradient-text">Referenzen</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10">
              Ein Auszug aus den Unternehmen, mit denen wir zusammenarbeiten – branchenübergreifend
              vom Mittelstand bis zur Holding. Die hier gezeigten Kunden sind nur ein kleiner Teil
              unseres Portfolios.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
              {metrics.map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center p-4 bg-card rounded-xl border border-border"
                >
                  <p className="text-2xl sm:text-3xl font-bold gradient-text">{metric.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Client Carousel */}
      <section className="py-16 bg-card/50 border-y border-border" aria-labelledby="clients-heading">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Ein Auszug unserer Kunden – und weitere Projekte
          </p>
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[autoplayPlugin.current]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {clients.map((client, i) => (
                <CarouselItem key={i} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/5">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="flex flex-col items-center gap-3 p-6 bg-card rounded-xl border border-border h-full"
                  >
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center p-2">
                      {client.logo ? (
                        <img
                          src={client.logo}
                          alt={`${client.name} Firmenlogo`}
                          className="h-8 object-contain opacity-70 hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground text-center">
                          {client.name.split(" ")[0]}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-center text-foreground leading-tight">
                      {client.name}
                    </p>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ihr Projekt könnte das nächste sein
            </h2>
            <p className="text-muted-foreground mb-8">
              Lassen Sie uns gemeinsam den wirtschaftlichen Hebel in Ihrem Unternehmen
              quantifizieren – mit klarer ROI-Garantie statt vagen Versprechen.
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
