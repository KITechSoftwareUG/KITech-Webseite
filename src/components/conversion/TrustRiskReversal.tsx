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

export function TrustRiskReversal() {
  return (
    <section className="py-20 lg:py-28 bg-card/30 border-y border-border/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mb-12"
        >
          <span className="inline-block text-xs font-light tracking-widest uppercase text-primary mb-3">
            Risiko? Übernehmen wir.
          </span>
          <h2 className="text-3xl sm:text-4xl font-light mb-4 text-foreground">
            Sechs Versprechen, die Sie <span className="gradient-text">absichern</span>.
          </h2>
          <p className="text-muted-foreground">
            KI-Projekte scheitern selten an Technik – sondern an unklaren Zielen und Risiken.
            Wir drehen das um: Das Projektrisiko liegt bei uns, nicht bei Ihnen.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {guarantees.map((g, i) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group rounded-2xl border border-border bg-background p-6 hover:border-primary/50 hover:shadow-card transition-all"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <g.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-medium mb-2 text-foreground">{g.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{g.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
