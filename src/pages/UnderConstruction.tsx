import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";
import kitechLogo from "@/assets/kitech-logo.png.asset.json";

const legalLinks = [
  { name: "Impressum", href: "/impressum" },
  { name: "Datenschutz", href: "/datenschutz" },
  { name: "AGB", href: "/agb" },
];

/**
 * Baustellen-Seite: wird waehrend des Website-Relaunchs fuer alle Routen
 * (ausser den rechtlich verpflichtenden Seiten Impressum/Datenschutz/AGB)
 * ausgeliefert. Bewusst reduziert statt kaputt wirkend - mit Logo, klarer
 * Ansage und weiterhin erreichbaren Kontaktdaten, damit keine Leads verloren
 * gehen, waehrend die neue Version mit echten Referenzen entsteht.
 */
export default function UnderConstruction() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SEOHead
        title="Ist aktuell in Bearbeitung | KITech Software"
        description="Diese Seite wird gerade ueberarbeitet. Eine neue Version mit echten Referenzen und Case Studies entsteht - bis dahin erreichen Sie uns direkt per E-Mail oder Telefon."
        canonical="/"
        noindex={true}
      />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <Link to="/" aria-label="KITech Software – Startseite" className="mb-10 inline-flex sm:mb-12">
          <img
            src={kitechLogo.url}
            alt="KITech Software Logo"
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <h1 className="max-w-4xl text-balance text-4xl font-medium leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Ist aktuell in Bearbeitung.
        </h1>

        <p className="mt-6 max-w-xl text-balance text-base font-light leading-relaxed text-muted-foreground sm:mt-8 sm:text-lg">
          Gerade entsteht eine neue Version dieser Seite - mit echten Referenzen
          und Case Studies unserer Kundenprojekte. Qualitaet braucht Zeit,
          deshalb zeigen wir Ihnen bis dahin bewusst nur das Noetigste.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:mt-12 sm:flex-row sm:gap-6">
          <a
            href="mailto:info@kitech-software.de"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary sm:text-base"
          >
            <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            info@kitech-software.de
          </a>
          <span className="hidden h-4 w-px bg-border sm:inline-block" aria-hidden="true" />
          <a
            href="tel:+4951189738590"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary sm:text-base"
          >
            <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            +49 (0) 511 89738590
          </a>
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <div className="container flex flex-col items-center gap-3 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} KITech Software UG (haftungsbeschränkt).</p>
          <nav aria-label="Rechtliche Links" className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="transition-colors hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
