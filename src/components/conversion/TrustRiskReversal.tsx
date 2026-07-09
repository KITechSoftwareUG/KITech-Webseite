import { motion } from "framer-motion";
import { ShieldCheck, BadgeEuro, FileCheck2, Lock, MapPin, Handshake } from "lucide-react";

const guarantees = [
  {
    icon: BadgeEuro,
    title: "ROI-Garantie",
    text: "Verfehlen wir das vereinbarte ROI-Ziel, zahlen Sie nicht. Schriftlich fixiert im Angebot.",
  },
  {
    icon: Handshake,
    title: "Festpreis statt Stundenfalle",
    text: "Klar definierter Scope, klar definierter Preis. Keine bösen Überraschungen am Monatsende.",
  },
  {
    icon: FileCheck2,
    title: "Audit-Report inklusive",
    text: "Auch ohne Folgeauftrag erhalten Sie einen verwertbaren ROI-Report – Ihr Wissen bleibt bei Ihnen.",
  },
  {
    icon: Lock,
    title: "DSGVO & Hosting in DE",
    text: "Datenverarbeitung in deutschen Rechenzentren, AVV-Vertrag und auditierbare Datenflüsse.",
  },
  {
    icon: ShieldCheck,
    title: "NDA von Anfang an",
    text: "Vertraulichkeitsvereinbarung bereits vor dem Erstgespräch – auf Wunsch in 24 h.",
  },
  {
    icon: MapPin,
    title: "Ansprechpartner aus Hannover",
    text: "Kein Callcenter, kein Offshore-Team. Direkter Draht zum Geschäftsführer.",
  },
];

/**
 * Visuelle Ausfuehrung (KI-Redesign v2): kinetic-display statt Serif-Kursiv, Lime-Akzent
 * statt Gradient-Text (Gradient-Text ist laut Design-Skill ein verbotenes Muster). Keine
 * eigene Eyebrow-Zeile mehr – der Hero auf Enterprise.tsx traegt den einzigen bewussten
 * Kicker der Seite, jede weitere Section (inkl. dieser) haelt sich daran.
 *
 * Layout-Korrektur (finale Review-Runde): die urspruengliche Version rendert alle sechs
 * Versprechen als identisch grosse "rounded-2xl border + Icon-Chip"-Karten - genau das vom
 * Design-Skill verbotene "identische Card-Grid"-Muster, und auf /enterprise bereits das
 * 3./4./5. Grid dieser Art in Folge (businessProblems, useCases, platforms nutzen aehnliche
 * Rezepturen). Ersetzt durch ein kartenloses Raster: kein Rahmen, kein Hintergrund, kein
 * Radius pro Eintrag - nur eine duenne neutrale Trennlinie (border-t, keine Akzentfarbe,
 * daher kein "Side-Stripe"-Verstoss) plus Icon+Text im Fliess-Rhythmus. Zwei Spalten statt
 * drei, damit die Zeilen nicht zufaellig wie das Zertifikate-Raster wirken.
 */
export function TrustRiskReversal() {
  return (
    <section className="py-20 lg:py-28 bg-card/30 border-y border-border/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-2xl mb-14"
        >
          <h2 className="kinetic-display text-3xl text-foreground mb-4 sm:text-4xl text-balance">
            Sechs Versprechen, die Sie <span className="text-enterprise-accent">absichern</span>.
          </h2>
          <p className="text-muted-foreground text-pretty">
            KI-Projekte scheitern selten an Technik – sondern an unklaren Zielen und Risiken.
            Wir drehen das um: Das Projektrisiko liegt bei uns, nicht bei Ihnen.
          </p>
        </motion.div>

        <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:gap-x-20">
          {guarantees.map((g, i) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
              className="flex gap-4 border-t border-border pt-6"
            >
              <g.icon className="mt-0.5 h-5 w-5 shrink-0 text-enterprise-accent" aria-hidden="true" />
              <div>
                <h3 className="text-base font-medium text-foreground">{g.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">{g.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
