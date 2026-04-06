import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData, getWebPageSchema, getBreadcrumbSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  Shield,
  Calendar
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/plausible";

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
    value: "+49 (0) 511 89738590",
    href: "tel:+4951189738590",
  },
  {
    icon: MapPin,
    label: "Standort",
    value: "Deutschland",
    href: null,
  },
  {
    icon: Clock,
    label: "Erreichbarkeit",
    value: "Mo-Fr, 9-18 Uhr",
    href: null,
  },
];

export default function Kontakt() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    trackEvent("Kontaktformular_gesendet");
    toast.success("Nachricht gesendet!", {
      description: "Wir melden uns innerhalb von 24 Stunden bei Ihnen.",
    });
    
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Layout>
      <SEOHead
        title="Kontakt – KI-Beratung anfragen | KITech Software"
        description="Kontaktieren Sie KITech Software für ein unverbindliches Erstgespräch. KI-Beratung, Audit und Entwicklung aus Hannover."
        canonical="/kontakt"
      />
      <StructuredData data={getWebPageSchema("Kontakt", "Kontaktformular und Erstgespräch", "https://kitech-software.de/kontakt")} />
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

      {/* Contact Form & Info */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-card">
                <h2 className="text-2xl font-semibold mb-6">Nachricht senden</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Vorname *</Label>
                      <Input
                        id="firstName"
                        placeholder="Max"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nachname *</Label>
                      <Input
                        id="lastName"
                        placeholder="Mustermann"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="max@unternehmen.de"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Unternehmen</Label>
                    <Input
                      id="company"
                      placeholder="Mustermann GmbH"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Betreff *</Label>
                    <Input
                      id="subject"
                      placeholder="Anfrage zu KI-Beratung"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Ihre Nachricht *</Label>
                    <Textarea
                      id="message"
                      placeholder="Beschreiben Sie kurz Ihr Anliegen..."
                      rows={5}
                      required
                    />
                  </div>

                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 mt-0.5 text-primary" />
                    <span>
                      Ihre Daten werden gemäß unserer Datenschutzerklärung verarbeitet 
                      und nicht an Dritte weitergegeben.
                    </span>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Wird gesendet..."
                    ) : (
                      <>
                        Nachricht senden
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
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

              {/* Quick Call CTA */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">Lieber direkt sprechen?</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Buchen Sie einen kostenlosen 30-Minuten-Termin für ein 
                  unverbindliches Erstgespräch.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => { trackEvent("Calendly_Klick", { position: "kontakt-seite" }); window.open('https://calendly.com/kitech-software-info/30min', '_blank'); }}
                >
                  Erstgespräch vereinbaren
                </Button>
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
