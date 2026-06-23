import { motion } from "framer-motion";
import { Cloud, Shield, Server, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  StructuredData,
  getEnterpriseCloudItemListSchema,
  getEnterpriseCloudFAQSchema,
} from "@/components/seo/StructuredData";

export const enterpriseCloudPlatforms = [
  {
    name: "KI-Agenten auf Microsoft Azure AI Foundry",
    provider: "Microsoft Azure",
    description:
      "Enterprise-Grade Agenten auf Azure AI Foundry – inkl. Azure OpenAI, AI Search, Content Safety und Private Link in EU-Regionen.",
    url: "https://ai.azure.com/",
    areaServed: ["Germany", "Austria", "Switzerland"],
  },
  {
    name: "KI-Agenten auf AWS Bedrock",
    provider: "Amazon Web Services",
    description:
      "Multi-Model-Architekturen auf Amazon Bedrock mit Claude, Llama, Mistral und Titan – mit Guardrails und Knowledge Bases in eu-central-1.",
    url: "https://aws.amazon.com/bedrock/",
    areaServed: ["Germany", "Austria", "Switzerland"],
  },
  {
    name: "KI-Agenten auf Google Vertex AI",
    provider: "Google Cloud",
    description:
      "Gemini-Modelle und Vertex AI Agent Builder für daten-intensive Workflows – mit VPC Service Controls und CMEK in europe-west3.",
    url: "https://cloud.google.com/vertex-ai",
    areaServed: ["Germany", "Austria", "Switzerland"],
  },
  {
    name: "Souveräne & On-Premise KI-Agenten",
    provider: "STACKIT / IONOS / On-Prem",
    description:
      "Open-Source-LLMs (Llama, Mistral, Qwen) auf STACKIT, IONOS, Open Telekom Cloud oder eigener Infrastruktur – BSI C5- / ISO 27001-konform.",
    areaServed: ["Germany"],
  },
] as const;


const platforms = [
  {
    name: "Microsoft Azure AI Foundry",
    badge: "Certified Partner-Stack",
    description:
      "Enterprise-Grade Agenten auf Azure AI Foundry – inkl. Azure OpenAI, AI Search, Content Safety und Private Link in EU-Regionen (Frankfurt, Zürich, Amsterdam).",
    features: [
      "Azure OpenAI (GPT-4o, o-Series)",
      "AI Foundry Agent Service",
      "Private Endpoints & VNet",
      "Entra ID / Conditional Access",
    ],
  },
  {
    name: "AWS Bedrock",
    badge: "Multi-Model Enterprise",
    description:
      "Multi-Model-Architekturen auf Amazon Bedrock mit Claude, Llama, Mistral und Titan – mit Guardrails, Knowledge Bases und Bedrock Agents in eu-central-1.",
    features: [
      "Anthropic Claude on Bedrock",
      "Bedrock Agents & Knowledge Bases",
      "Guardrails & PII-Filter",
      "PrivateLink & KMS-Verschlüsselung",
    ],
  },
  {
    name: "Google Vertex AI",
    badge: "Gemini Enterprise",
    description:
      "Gemini-Modelle und Vertex AI Agent Builder für Daten-intensive Workflows – mit VPC Service Controls und CMEK in europe-west3.",
    features: [
      "Gemini 2.x auf Vertex AI",
      "Agent Builder & Search",
      "VPC-SC & CMEK",
      "BigQuery-Integration",
    ],
  },
  {
    name: "Sovereign & On-Prem",
    badge: "Digitale Souveränität",
    description:
      "Wenn Cloud nicht in Frage kommt: Open-Source-LLMs (Llama, Mistral, Qwen) auf STACKIT, IONOS, Open Telekom Cloud oder Ihrer eigenen Infrastruktur.",
    features: [
      "STACKIT & IONOS AI",
      "vLLM / Ollama On-Prem",
      "Air-Gapped Deployments",
      "BSI C5 / ISO 27001-konform",
    ],
  },
];

const trustBadges = [
  { icon: Shield, label: "DSGVO-konform", sub: "Auftragsverarbeitung & SCC" },
  { icon: Server, label: "EU-Datenresidenz", sub: "Frankfurt · Zürich · Amsterdam" },
  { icon: Cloud, label: "Hybrid & Multi-Cloud", sub: "Kein Vendor Lock-in" },
];

export function EnterpriseCloud() {
  return (
    <section
      className="py-20 lg:py-28 bg-card/30 border-y border-border"
      aria-labelledby="enterprise-cloud-heading"
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-14"
        >
          <span className="inline-block text-xs uppercase tracking-widest text-primary font-medium mb-4">
            Enterprise-Cloud-Expertise
          </span>
          <h2
            id="enterprise-cloud-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-light mb-6 text-foreground"
          >
            Azure AI Foundry, AWS Bedrock & souveräne KI –{" "}
            <span className="gradient-text font-normal">in einer Hand</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Für Konzerne und gehobenen Mittelstand bauen wir Agenten-Systeme dort, wo Ihre Daten,
            Ihre Compliance und Ihre IT-Strategie es verlangen – nicht dort, wo es uns am leichtesten fällt.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {platforms.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group bg-background rounded-2xl border border-border p-6 lg:p-8 hover:border-primary/40 hover:shadow-elevated transition-all"
            >
              <div className="flex items-start justify-between mb-4 gap-4">
                <h3 className="text-xl font-medium text-foreground">{p.name}</h3>
                <span className="shrink-0 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-primary/30 text-primary bg-primary/5">
                  {p.badge}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                {p.description}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid sm:grid-cols-3 gap-4 mb-10"
        >
          {trustBadges.map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-3 bg-background rounded-xl border border-border p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <b.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{b.label}</div>
                <div className="text-xs text-muted-foreground">{b.sub}</div>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="text-center">
          <Button variant="hero" size="lg" asChild>
            <Link to="/kontakt">
              Enterprise-Architektur besprechen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Unverbindliches 30-Min-Sparring zu Ihrer Cloud- &amp; KI-Strategie.
          </p>
        </div>
      </div>
    </section>
  );
}
