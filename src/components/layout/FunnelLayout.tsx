import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface FunnelLayoutProps {
  children: React.ReactNode;
  /** Kurzes Label rechts neben dem Logo, z.B. "Einzel-Coaching" oder "Enterprise AI". Optional - ohne Label bleibt nur das Logo stehen. */
  pathLabel?: string;
  /** Tailwind-Klasse für die Akzentfarbe des Path-Labels, z.B. "text-solo-accent" */
  accentClassName?: string;
}

/**
 * Bewusst schlanker Layout-Wrapper für /solo und /enterprise: kein volles Haupt-Menü,
 * kein StickyMobileCTA, kein ExitIntentPopup - nur ein klarer Ausstieg zurück zur
 * Startseite, damit der Funnel nicht durch die normale Seitennavigation verwässert wird.
 */
export function FunnelLayout({ children, pathLabel, accentClassName = "text-primary" }: FunnelLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="KITech Software – Startseite">
            <img src="/logo.png" alt="KITech Software" className="h-6 w-auto" />
            {pathLabel && (
              <span className={`hidden sm:inline text-xs uppercase tracking-widest font-medium ${accentClassName}`}>
                {pathLabel}
              </span>
            )}
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Zurück zur Startseite</span>
            <span className="sm:hidden">Abbrechen</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} KITech Software</p>
          <div className="flex gap-6">
            <Link href="/impressum" className="hover:text-foreground transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</Link>
            <Link href="/agb" className="hover:text-foreground transition-colors">AGB</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
