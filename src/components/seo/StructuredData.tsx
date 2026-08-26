// Typisierte Schema.org Interfaces
interface SchemaBase {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
}

interface StructuredDataProps {
  data: SchemaBase | SchemaBase[];
}

/**
 * Rendert JSON-LD direkt ins Markup, statt es wie früher per useEffect in den
 * <head> zu injizieren. Damit steht das Schema schon im vom Server gelieferten
 * HTML — genau der Punkt, wegen dem wir von der SPA weg sind: Crawler sehen es
 * sofort, ohne auf JavaScript zu warten.
 *
 * `</` wird escaped, damit ein String in den Daten das Script-Tag nicht vorzeitig
 * schließen kann.
 */
export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

// === Vorgefertigte Schema-Factories ===

/**
 * Die stabile Kennung des Unternehmens im Datengraph.
 *
 * **Warum es sie geben muss:** Jede Artikel- und Autorenseite setzt `publisher`
 * bzw. `worksFor` auf genau diese `@id` (siehe `src/lib/wissen/schema-org.ts`).
 * Bis zum 20.08.2026 wurde sie **nirgends definiert** — sie tauchte im gesamten
 * Build ausschließlich als Verweis auf, nie als Knoten. Der Herausgeber jedes
 * Artikels zeigte damit ins Leere.
 *
 * Gleichzeitig gab `getOrganizationSchema()` es zwar, sie war unit-getestet, und
 * **keine einzige Seite hat sie gerendert.** Auf der ganzen Website stand kein
 * `sameAs` — bei einer Marke, die sich mit „KITech NextGen Solutions"
 * (kitech.ai) verwechseln lässt, ist genau das der fehlende Anker.
 *
 * Seither: Der Knoten steht global im Root-Layout, `getLocalBusinessSchema()`
 * trägt dieselbe `@id`, damit Öffnungszeiten und Geokoordinaten in **dieselbe**
 * Entität fließen statt eine zweite aufzumachen.
 */
export const ORGANISATION_ID = "https://kitech-software.de/#organisation";

/** Dasselbe Prinzip für die Website als Ganzes. */
export const WEBSITE_ID = "https://kitech-software.de/#website";

/**
 * Profile, die das Unternehmen selbst betreibt und die eine dritte Stelle
 * bestätigt. Sie sind der Disambiguierungs-Anker, den Google für `Organization`
 * ausdrücklich empfiehlt.
 *
 * ⚠️ **Nur Profile aufnehmen, die KITech gehören.** Verzeichnisse wie
 * Creditreform oder Companyhouse tragen die Firma ebenfalls, sind aber
 * abgeschriebene Registerdaten ohne Zutun des Unternehmens — sie antworten
 * Crawlern zudem mit 403. Ein `sameAs`, das ein Prüfer nicht abrufen kann,
 * belegt nichts.
 */
const SAME_AS = [
  "https://www.linkedin.com/company/104155510",
  "https://www.provenexpert.com/de-de/kitech-software-ug/",
];

export function getOrganizationSchema(): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANISATION_ID,
    name: "KITech Software",
    /* Die Firmierung steht im dafür vorgesehenen Feld, nicht im Namen (Ansage
       17.08.2026: überall „KITech Software", außer im Impressum). Google zeigt
       `name`; `legalName` stützt die Anbieterkennzeichnung, die im Impressum
       vollständig steht. */
    legalName: "KITech Software UG (haftungsbeschränkt)",
    /* Umsatzsteuer-Identifikationsnummer und Registereintrag — beides steht im
       Impressum und ist damit ohnehin öffentlich. Im Schema stützen sie die
       Entität: Sie sind eindeutig und lassen sich gegen amtliche Quellen
       abgleichen, anders als ein Firmenname. */
    vatID: "DE459778632",
    identifier: {
      "@type": "PropertyValue",
      propertyID: "HRB",
      value: "HRB 230077, Amtsgericht Hannover",
    },
    url: "https://kitech-software.de",
    logo: "https://kitech-software.de/logo.png",
    image: "https://kitech-software.de/logo.png",
    /* Die ROI-Garantie („wird das Ziel nicht erreicht, zahlt der Kunde nicht")
       stand hier noch, obwohl sie am 12.08.2026 von allen Seiten genommen
       wurde — sie ging also weiter als Zusage an Google. Ersetzt durch das,
       was tatsächlich angeboten wird. */
    description:
      "KI-Beratung und Softwareentwicklung für den deutschen Mittelstand: Automatisierungen und individuelle Softwarelösungen, die im Tagesgeschäft laufen. Betrieb in europäischer Region oder auf eigener Hardware.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Wedekindstraße 14",
      addressLocality: "Hannover",
      addressRegion: "Niedersachsen",
      postalCode: "30161",
      addressCountry: "DE",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+49-151-64682544",
      email: "info@kitech-software.de",
      contactType: "customer service",
      availableLanguage: ["German", "English"],
    },
    sameAs: SAME_AS,
    /*
     * Eintragung ins Handelsregister, HRB 230077 Amtsgericht Hannover, am
     * 16.01.2026 — geprüft am 26.08.2026 am Registerauszug.
     *
     * Hier stand bis dahin "2023", ohne Beleg und ohne Kommentar. Bei einer UG
     * ist die Eintragung konstitutiv: Die juristische Person, die dieser
     * Organization-Knoten beschreibt, entsteht mit ihr. Eine frühere Tätigkeit
     * des Gründers ist etwas anderes als das Gründungsdatum der Gesellschaft.
     */
    foundingDate: "2026-01-16",
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 52.3859,
        longitude: 9.7529,
      },
      geoRadius: "500 km",
    },
    knowsAbout: [
      "Künstliche Intelligenz",
      "Machine Learning",
      "LLM Integration",
      "Computer Vision",
      "DSGVO-konforme KI",
      "KI-Audit",
      "Prozessautomatisierung",
    ],
  };
}

/**
 * Der lokale Teil derselben Entität — Geokoordinaten, Öffnungszeiten,
 * Preisniveau. Steht auf `/kontakt`.
 *
 * **Dieselbe `@id` wie `getOrganizationSchema()` ist Absicht.**
 * `ProfessionalService` ist ein Untertyp von `LocalBusiness` und damit von
 * `Organization`; beide Knoten beschreiben also dieselbe Firma. Über die
 * gemeinsame Kennung fließen sie im Graph zusammen. Ohne sie stünden auf der
 * Website zwei unabhängige Unternehmen mit identischer Adresse.
 */
export function getLocalBusinessSchema(): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": ORGANISATION_ID,
    name: "KITech Software",
    sameAs: SAME_AS,
    /* Firmierung im eigenen Feld — siehe Kommentar in `getOrganizationSchema`. */
    legalName: "KITech Software UG (haftungsbeschränkt)",
    logo: {
      "@type": "ImageObject",
      url: "https://kitech-software.de/logo.png",
    },
    image: "https://kitech-software.de/logo.png",
    url: "https://kitech-software.de",
    telephone: "+49-151-64682544",
    email: "info@kitech-software.de",
    /* Auch hier stand die ROI-Garantie noch — siehe `getOrganizationSchema`. */
    description:
      "KI-Beratung und Softwareentwicklung für den deutschen Mittelstand: Prozess-Audit, Automatisierungen und individuelle Software, betrieben in europäischer Region oder auf eigener Hardware.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Wedekindstraße 14",
      addressLocality: "Hannover",
      postalCode: "30161",
      addressRegion: "Niedersachsen",
      addressCountry: "DE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 52.3859,
      longitude: 9.7529,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    priceRange: "€€€",
  };
}

export function getWebPageSchema(
  name: string,
  description: string,
  url: string
): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: "KITech Software",
      url: "https://kitech-software.de",
    },
    /* Verweis statt Kopie: Der vollständige Knoten steht einmal global im
       Root-Layout. Vorher stand hier ein Stummel mit bloßem `name`, der mit dem
       Herausgeber der Artikel nichts zu tun hatte. */
    publisher: { "@id": ORGANISATION_ID },
  };
}

/**
 * Der Website-Knoten. Steht zusammen mit der Organisation global im Root-Layout.
 *
 * **Bewusst ohne `SearchAction`/Sitelinks-Suchfeld.** Diese Website hat keine
 * eigene Suche; ein `potentialAction`, das auf eine nicht vorhandene
 * Suchergebnisseite zeigt, wäre eine Angabe, die bei der ersten Prüfung
 * auffliegt.
 */
export function getWebSiteSchema(): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: "KITech Software",
    url: "https://kitech-software.de",
    inLanguage: "de-DE",
    publisher: { "@id": ORGANISATION_ID },
  };
}

export function getFAQSchema(
  faqs: { question: string; answer: string }[]
): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function getServiceSchema(
  name: string,
  description: string
): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: "KITech Software",
      url: "https://kitech-software.de",
    },
    areaServed: {
      "@type": "Country",
      name: "Germany",
    },
    serviceType: "KI-Beratung und Softwareentwicklung",
  };
}

export function getReviewSchema(
  reviews: {
    author: string;
    text: string;
    rating: number;
  }[]
): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "KITech Software",
    review: reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      reviewBody: r.text,
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
      },
    })),
  };
}

export function getBreadcrumbSchema(
  items: { name: string; url: string }[]
): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getSoftwareAppSchema(
  name: string,
  description: string,
  type: string,
  url?: string
): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    applicationCategory: "BusinessApplication",
    operatingSystem: type === "iOS App" ? "iOS" : "Web",
    url: url || "https://kitech-software.de",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/PreOrder",
    },
    author: {
      "@type": "Organization",
      name: "KITech Software",
    },
  };
}

/**
 * ItemList of Organization entries – maps the client logos on /referenzen.
 */
export function getClientsItemListSchema(
  clients: { name: string; url?: string }[]
): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ausgewählte Kunden von KITech Software",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: clients.length,
    itemListElement: clients.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Organization",
        name: c.name,
        ...(c.url ? { url: c.url } : {}),
      },
    })),
  };
}

/**
 * ContactPage schema for /kontakt – includes telephone, email, address.
 */
export function getContactPageSchema(): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Kontakt – KITech Software",
    url: "https://kitech-software.de/kontakt",
    description: "1:1-KI-Check und Kontaktdaten der KITech Software.",
    mainEntity: {
      "@type": "Organization",
      name: "KITech Software",
      url: "https://kitech-software.de",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+49-151-64682544",
        email: "info@kitech-software.de",
        contactType: "customer service",
        availableLanguage: ["German", "English"],
      },
    },
  };
}

/**
 * Person-Schema für den Gründer A. Alkhalil.
 * Stärkt E-E-A-T und macht den Geschäftsführer in KI-Suchergebnissen sichtbar.
 */
export function getFounderPersonSchema(): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://kitech-software.de/#ayham-alkhalil",
    name: "Ayham Alkhalil",
    alternateName: ["A. Alkhalil", "Ayham Al Khalil"],
    givenName: "Ayham",
    familyName: "Alkhalil",
    jobTitle: "Gründer & Geschäftsführer",
    description:
      "Ayham Alkhalil ist Gründer und Geschäftsführer von KITech Software in Hannover. Er entwickelt KI- und Automatisierungslösungen für den deutschen Mittelstand.",
    image: "https://kitech-software.de/images/team/ayham.webp",
    url: "https://kitech-software.de/haltung",
    worksFor: {
      "@type": "Organization",
      name: "KITech Software",
      url: "https://kitech-software.de",
    },
    founderOf: {
      "@type": "Organization",
      name: "KITech Software",
      url: "https://kitech-software.de",
    },
    nationality: { "@type": "Country", name: "Deutschland" },
    workLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Wedekindstraße 14",
        postalCode: "30161",
        addressLocality: "Hannover",
        addressCountry: "DE",
      },
    },
    /*
     * Das persoenliche Profil, nicht die Unternehmensseite. Ein Person-Knoten,
     * dessen sameAs auf die Firma zeigt, verknuepft die falschen Entitaeten --
     * die Unternehmensseite steht bereits im sameAs der Organisation.
     */
    sameAs: [
      "https://www.linkedin.com/in/ayham-alkhalil-66bb451b5",
    ],
    knowsAbout: [
      "Künstliche Intelligenz",
      "KI-Beratung",
      "Prozessautomatisierung",
      "Individuelle Softwareentwicklung",
      "Mittelstandsberatung",
      "Large Language Models",
      "AI Agents",
      "MLOps",
      "DSGVO-konforme KI",
    ],
  };
}

export interface CloudPlatformInput {
  name: string;
  description: string;
  provider: string;
  url?: string;
  areaServed?: string[];
}

/**
 * ItemList of Service entries – maps the Enterprise-Cloud-Platforms block.
 * Each list item is a full Service entity (Azure, AWS, GCP, Sovereign).
 */
export function getEnterpriseCloudItemListSchema(
  platforms: CloudPlatformInput[]
): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Enterprise-Cloud-Plattformen für KI-Agenten",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: platforms.length,
    itemListElement: platforms.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: p.name,
        description: p.description,
        serviceType: "KI-Agenten-Entwicklung auf Enterprise-Cloud-Plattformen",
        provider: {
          "@type": "Organization",
          name: "KITech Software",
          url: "https://kitech-software.de",
        },
        brand: {
          "@type": "Brand",
          name: p.provider,
        },
        ...(p.url ? { url: p.url } : {}),
        areaServed: (p.areaServed ?? ["Germany", "Austria", "Switzerland"]).map((a) => ({
          "@type": "Country",
          name: a,
        })),
      },
    })),
  };
}

export function getEnterpriseCloudFAQSchema(): SchemaBase {
  return getFAQSchema([
    {
      question: "Welche Enterprise-Cloud-Plattformen unterstützt KITech für KI-Agenten?",
      answer:
        "KITech baut KI-Agenten auf Microsoft Azure AI Foundry, AWS Bedrock und Google Vertex AI – sowie auf souveränen Alternativen wie STACKIT, IONOS AI und On-Premise-Deployments mit vLLM oder Ollama.",
    },
    {
      question: "Sind die KI-Lösungen DSGVO-konform und in der EU gehostet?",
      answer:
        "Ja. Alle Deployments laufen in EU-Regionen (Frankfurt, Zürich, Amsterdam oder europe-west3) mit Auftragsverarbeitungsverträgen, Standardvertragsklauseln, Private Endpoints und Verschlüsselung mit CMEK/KMS.",
    },
    {
      question: "Was ist mit digitaler Souveränität, wenn Public Cloud ausgeschlossen ist?",
      answer:
        "Für regulierte Branchen oder Air-Gapped-Anforderungen setzen wir Open-Source-LLMs (Llama, Mistral, Qwen) auf STACKIT, IONOS, Open Telekom Cloud oder Ihrer eigenen Infrastruktur auf – BSI C5- und ISO 27001-konform.",
    },
  ]);
}

