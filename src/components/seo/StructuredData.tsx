import { useEffect } from "react";

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
 * Injiziert JSON-LD Schema.org Daten sicher in den <head>.
 * Wird beim Unmount automatisch entfernt (SPA-safe).
 */
export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [data]);

  return null;
}

// === Vorgefertigte Schema-Factories ===

export function getOrganizationSchema(): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "KITech Software UG (haftungsbeschränkt)",
    alternateName: "KITech Software",
    url: "https://kitech-software.de",
    logo: "https://kitech-software.de/favicon.ico",
    description:
      "Individuelle, sichere und auditierbare KI-Systeme für Ihre realen Geschäftsprozesse. DSGVO-konforme KI-Lösungen ohne Hype, mit Substanz. Made in Germany.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Wedekindstraße 14",
      addressLocality: "Hannover",
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
    sameAs: [],
    foundingDate: "2023",
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 52.3759,
        longitude: 9.732,
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

export function getLocalBusinessSchema(): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "KITech Software",
    image: "https://kitech-software.de/favicon.ico",
    url: "https://kitech-software.de",
    telephone: "+49-151-64682544",
    email: "info@kitech-software.de",
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
      latitude: 52.3759,
      longitude: 9.732,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    priceRange: "€€€",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "3",
      bestRating: "5",
    },
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
      name: "KITech Software",
      url: "https://kitech-software.de",
    },
    publisher: {
      "@type": "Organization",
      name: "KITech Software UG (haftungsbeschränkt)",
    },
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
      name: "KITech Software UG (haftungsbeschränkt)",
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
      name: "KITech Software UG (haftungsbeschränkt)",
    },
  };
}
