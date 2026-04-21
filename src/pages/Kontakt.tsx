import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData, getWebPageSchema, getBreadcrumbSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Shield,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { trackEvent } from "@/lib/plausible";

const CALENDLY_URL = "https://calendly.com/kitdienstleistungen/erstgesprach-automatisierung";

const contactInfo = [
  {
    icon: Mail,
    label: "E-Mail",
    value: "info@kitech-software.de",
    href: "mailto:info@kitech-software.de",
  },
  {
    icon: Phone,
    label: "Telefon",
    value: "+49 (0) 151 64682544",
    href: "tel:+4915164682544",
  },
  {
    icon: MapPin,
    label: "Standort",
    value: "Hannover, Deutschland",
    href: null,
  },
  {
    icon: Clock,
    label: "Erreichbarkeit",
    value: "Mo–Fr, 9–18 Uhr",
    href: null,
  },
];

export default function Kontakt() {
  const openCalendly = () => {
    trackEvent("Calendly_Klick", { position: "kontakt-seite" });
    window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <Layout>
      <SEOHead
        title="Kontakt – KI-Beratung anfragen | KITech Software"
        description="Erstgespräch buchen mit KITech Software – unverbindliche KI-Beratung für den Mittelstand aus Hannover."
        canonical="/kontakt"
      />
      <StructuredData data={getWebPageSchema("Kontakt", "Erstgespräch und Kontaktdaten", "https://kitech-software.de/kontakt")} />
      <StructuredData data={getBreadcrumbSchema([{ name: "Startseite", url: "https://kitech-software.de" }, { name: "Kontakt", url: "https://kitech-software.de/kontakt" }])} />

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
              <span className="gradient-text">Kontakt</span> aufnehmen
            </h1>
            <p className="text-xl text-muted-foreground">
              Lassen Sie uns über Ihre KI-Anforderungen sprechen.
              Unverbindlich, ehrlich und auf Augenhöhe.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Calendly CTA + Contact Info */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">

            {/* Calendly CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-card rounded-2xl border border-border p-8 md:p-10 shadow-card h-full flex flex-col justify-between">
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6">
                    <Calendar className="h-7 w-7" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-4">Erstgespräch buchen</h2>
                  <p className="text-muted-foreground mb-4">
                    30 Minuten, kostenlos und unverbindlich. Wir analysieren gemeinsam,
                    wo KI-Automatisierung in Ihrem Unternehmen den größten Hebel hat.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-8">
                    {[
                      "Kein Verkaufsgespräch – ehrliche Einschätzung",
                      "Konkrete nächste Schritte am Ende des Calls",
                      "DSGVO-konform, hosted in Germany",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={openCalendly}
                >
                  <Calendar className="h-4 w-4" />
                  Termin auswählen
                </Button>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-semibold mb-6">Kontaktdaten</h2>
                <div className="space-y-4">
                  {contactInfo.map((info) => (
                    <div key={info.label} className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <info.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{info.label}</p>
                        {info.href ? (
                          <a
                            href={info.href}
                            className="font-medium hover:text-primary transition-colors"
                            onClick={() => {
                              if (info.href.startsWith("tel:")) trackEvent("Telefon_Klick");
                              if (info.href.startsWith("mailto:")) trackEvent("Email_Klick");
                            }}
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p className="font-medium">{info.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">DSGVO-konform</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Made in Germany</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
