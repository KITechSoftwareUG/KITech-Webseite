import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";
import { SignalField } from "@/components/canvas/SignalField";
import niimmoLogo from "@/assets/niimmo-logo.png";
import alltagshilfeLogo from "@/assets/alltagshilfe-logo.png";
import certconsultingLogo from "@/assets/certconsulting-logo.png";
import kremaLogo from "@/assets/krema-logo.png";
import expatvantageLogo from "@/assets/expatvantage-logo.png";

const legalLinks = [
  { name: "Impressum", href: "/impressum" },
  { name: "Datenschutz", href: "/datenschutz" },
  { name: "AGB", href: "/agb" },
];

/**
 * Referenzlogos wie auf der bisherigen Startseite (Index.tsx) - bewusst dieselben echten
 * Bilddateien (nicht die Lovable-Asset-Pointer), damit sie auch ausserhalb von Lovable-
 * Hosting zuverlaessig laden.
 */
const clientReferences = [
  { name: "NiImmo Holding GmbH", logo: niimmoLogo },
  { name: "Alltagshilfe Fischer GmbH", logo: alltagshilfeLogo },
  { name: "cert consulting Pane", logo: certconsultingLogo },
  { name: "KREMA Group", logo: kremaLogo },
  { name: "ExpatVantage", logo: expatvantageLogo },
];

/**
 * Baustellen-Seite: wird waehrend des Website-Relaunchs fuer alle Routen
 * (ausser den rechtlich verpflichtenden Seiten Impressum/Datenschutz/AGB)
 * ausgeliefert. Logo kommt bewusst aus public/logo.png (echte, lokal
 * gebundelte Datei) statt aus dem Lovable-Asset-Pointer in src/assets/
 * (kitech-logo.png.asset.json) - der loest nur auf der Lovable-Domain auf
 * und war nach dem Umzug auf Coolify ein kaputtes Bild.
 */
export default function UnderConstruction() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SEOHead
        title="Ist aktuell in Bearbeitung | KITech Software"
        description="Diese Seite wird gerade grundlegend ueberarbeitet. Eine neue Version mit echten Referenzen und Case Studies entsteht - bis dahin erreichen Sie uns direkt per E-Mail oder Telefon."
        canonical="/"
        noindex={true}
      />

      <main className="relative isolate flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-20 text-center sm:px-6">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <SignalField density={0.55} intensity={0.7} baseColor="--primary" accentColor="--accent" />
        </div>
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background/70 to-background"
          aria-hidden="true"
        />

        <Link to="/" aria-label="KITech Software – Startseite" className="mb-8 inline-flex sm:mb-10">
          <img src="/logo.png" alt="KITech Software Logo" className="h-9 w-auto sm:h-10" />
        </Link>

        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-accent">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Relaunch in Arbeit
        </span>

        <h1 className="kinetic-display kinetic-morph-in max-w-4xl text-balance text-4xl leading-[1.1] text-foreground sm:text-6xl lg:text-7xl">
          Ist aktuell in Bearbeitung.
        </h1>

        <p className="mt-6 max-w-xl text-balance text-base font-light leading-relaxed text-foreground/85 sm:mt-8 sm:text-lg">
          Kein hastig zusammengeklicktes KI-Template — hier entsteht gerade ein umfassend neues
          Projekt: mit echten Referenzen, echten Case Studies und dem Anspruch, den Sie von uns
          kennen.
        </p>
        <p className="mt-4 max-w-xl text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
          Qualität braucht ihre Zeit. Bis es so weit ist, zeigen wir bewusst nur das Nötigste —
          und bitten kurz um Geduld.
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

      {/* Referenzleiste bleibt sichtbar, auch waehrend der Baustelle: echte Kunden sollen
          nicht verschwinden, nur weil der Rest der Seite gerade reduziert ist. Gleicher
          Marquee-Aufbau wie zuvor auf der Startseite (dreifach dupliziert fuer nahtlose
          Endlosschleife, Rand-Fade links/rechts). */}
      <section className="border-t border-border/60 py-8 overflow-hidden bg-background">
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
                <img
                  src={client.logo}
                  alt={`${client.name} Firmenlogo`}
                  className="h-5 sm:h-6 w-auto object-contain grayscale opacity-50"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

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
