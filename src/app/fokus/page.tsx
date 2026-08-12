import { buildMetadata } from "@/lib/metadata";
import { Fokus } from "@/views/Fokus";

/**
 * Landingpage unter fokus.kitech-software.de (Host-Rewrite in src/proxy.ts),
 * intern /fokus. Steht auf Ansage leer — Begründung in src/views/Fokus.tsx.
 *
 * `noindex` bleibt: eine Seite ohne Inhalt gehört nicht in den Suchindex, und
 * das alte Vorschaubild bewarb den 299-€-Workshop, den es hier nicht mehr gibt.
 */
export const metadata = buildMetadata({
  title: "KITech Software",
  description: "Diese Seite hat aktuell keinen Inhalt.",
  path: "/fokus",
  noindex: true,
});

export default function Page() {
  return <Fokus />;
}
