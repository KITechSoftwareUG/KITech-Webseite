import { Link } from "react-router-dom";
import { SEOHead } from "@/components/seo/SEOHead";
import {
  StructuredData,
  getOrganizationSchema,
  getLocalBusinessSchema,
  getWebPageSchema,
  getFounderPersonSchema,
} from "@/components/seo/StructuredData";
import { SplitHero } from "@/components/sections/SplitHero";
import { Footer } from "@/components/layout/Footer";
import niimmoLogo from "@/assets/niimmo-logo.png";
import alltagshilfeLogo from "@/assets/alltagshilfe-logo.png";
import certconsultingLogo from "@/assets/certconsulting-logo.png";
import kremaLogo from "@/assets/krema-logo.png";
import expatvantageLogo from "@/assets/expatvantage-logo.png";

const clientReferences = [
  { name: "NiImmo Holding GmbH", logo: niimmoLogo },
  { name: "Alltagshilfe Fischer GmbH", logo: alltagshilfeLogo },
  { name: "cert consulting Pane", logo: certconsultingLogo },
  { name: "KREMA Group", logo: kremaLogo },
  { name: "ExpatVantage", logo: expatvantageLogo },
];

export default function Index() {
  return (
    <>
      <SEOHead
        title="KITech Software – KI-Coaching & Enterprise AI mit Ayham Alkhalil"
        description="Zwei Wege zu besserer KI-Nutzung: Einzel-Coaching mit Claude, Codex und n8n für Einzelpersonen – oder Enterprise-AI-Lösungen für Unternehmen. Made in Germany."
        canonical="/"
      />
      <StructuredData data={getOrganizationSchema()} />
      <StructuredData data={getLocalBusinessSchema()} />
      <StructuredData data={getWebPageSchema("KITech Software – KI-Coaching & Enterprise AI", "Einzel-KI-Coaching und Enterprise-AI-Lösungen mit Ayham Alkhalil.", "https://kitech-software.de")} />
      <StructuredData data={getFounderPersonSchema()} />

      <div className="min-h-screen bg-background">
        {/* Sichtbar hat die Split-Hero zwei gleichwertige h2-Headlines (Solo/Enterprise) -
            bewusst ohne visuelle Hierarchie zwischen beiden Pfaden. Für SEO/Screenreader
            braucht die Seite dennoch genau ein h1; daher hier sr-only ergänzt, ohne das
            Design der Entscheidungs-Hero zu beeinflussen. */}
        <h1 className="sr-only">
          KITech Software – Einzel-KI-Coaching und Enterprise AI mit Ayham Alkhalil
        </h1>
        <SplitHero />

        {/* Schmale, gemeinsame Vertrauens-Leiste unterhalb der Entscheidungs-Hero. Bewusst
            keine zweite Uppercase-Tracked-Eyebrow hier (die Hero hat bereits ihren einen
            Kicker) - schlichte Caption in normaler Groß-/Kleinschreibung. */}
        <section className="border-y border-border/50 py-8 overflow-hidden bg-background">
          <div className="container mb-5">
            <p className="text-center text-xs text-muted-foreground">
              Vertraut von Unternehmen wie
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-background to-transparent z-10" />
            <div className="flex animate-marquee whitespace-nowrap">
              {[...clientReferences, ...clientReferences, ...clientReferences].map((client, i) => (
                <div key={`${client.name}-${i}`} className="flex items-center gap-3 mx-8 sm:mx-10 shrink-0">
                  <img src={client.logo} alt={`${client.name} Firmenlogo`} className="h-5 sm:h-6 w-auto object-contain grayscale opacity-50" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
