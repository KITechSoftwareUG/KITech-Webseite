import {
  glossaryTerms,
  GLOSSARY_DEFAULT_PUBLISHED,
  GLOSSARY_DEFAULT_MODIFIED,
  GLOSSARY_DEFAULT_IMAGE,
  type GlossaryTerm,
} from "@/data/glossary";
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getWebPageSchema,
} from "@/components/seo/StructuredData";

export const GLOSSARY_BASE_URL = "https://kitech-software.de";
export const GLOSSARY_INDEX_URL = `${GLOSSARY_BASE_URL}/glossar`;
export const GLOSSARY_PUBLISHER = {
  "@type": "Organization" as const,
  name: "KITech Software UG (haftungsbeschränkt)",
  url: GLOSSARY_BASE_URL,
};

export function buildGlossaryTermSchema(term: GlossaryTerm) {
  const url = `${GLOSSARY_INDEX_URL}/${term.slug}`;

  return [
    {
      "@context": "https://schema.org" as const,
      "@type": "Article",
      headline: term.term,
      name: term.term,
      description: term.metaDescription,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      url,
      image: [GLOSSARY_DEFAULT_IMAGE],
      datePublished: term.datePublished ?? GLOSSARY_DEFAULT_PUBLISHED,
      dateModified: term.dateModified ?? GLOSSARY_DEFAULT_MODIFIED,
      inLanguage: "de-DE",
      author: { ...GLOSSARY_PUBLISHER },
      publisher: {
        ...GLOSSARY_PUBLISHER,
        logo: {
          "@type": "ImageObject" as const,
          url: `${GLOSSARY_BASE_URL}/logo.png`,
        },
      },
      about: {
        "@type": "DefinedTerm",
        name: term.term,
        description: term.shortDefinition,
        inDefinedTermSet: {
          "@type": "DefinedTermSet",
          "@id": GLOSSARY_INDEX_URL,
          name: "KITech KI-Glossar",
          url: GLOSSARY_INDEX_URL,
        },
      },
    },
    getBreadcrumbSchema([
      { name: "Start", url: `${GLOSSARY_BASE_URL}/` },
      { name: "Glossar", url: GLOSSARY_INDEX_URL },
      { name: term.term, url },
    ]),
    ...(term.faqs && term.faqs.length > 0 ? [getFAQSchema(term.faqs)] : []),
  ];
}

export function buildGlossaryIndexSchema() {
  return [
    getWebPageSchema(
      "Glossar – KI-Begriffe verständlich erklärt",
      "Glossar mit klar definierten Fachbegriffen rund um KI, ROI-Garantie, KI-Audit und DSGVO-konforme KI-Systeme.",
      GLOSSARY_INDEX_URL
    ),
    getBreadcrumbSchema([
      { name: "Start", url: `${GLOSSARY_BASE_URL}/` },
      { name: "Glossar", url: GLOSSARY_INDEX_URL },
    ]),
    {
      "@context": "https://schema.org" as const,
      "@type": "DefinedTermSet",
      "@id": GLOSSARY_INDEX_URL,
      name: "KITech KI-Glossar",
      url: GLOSSARY_INDEX_URL,
      inLanguage: "de-DE",
      hasDefinedTerm: glossaryTerms.map((t) => ({
        "@type": "DefinedTerm",
        name: t.term,
        description: t.shortDefinition,
        url: `${GLOSSARY_INDEX_URL}/${t.slug}`,
        inDefinedTermSet: { "@id": GLOSSARY_INDEX_URL },
      })),
    },
  ];
}
