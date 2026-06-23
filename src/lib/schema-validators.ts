import { z } from "zod";

const Context = z.literal("https://schema.org");
const url = z.string().url();
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const Organization = z.object({
  "@type": z.literal("Organization"),
  name: z.string().min(1),
  url: url.optional(),
  logo: z
    .object({
      "@type": z.literal("ImageObject"),
      url,
    })
    .optional(),
});

const DefinedTermSetRef = z.object({
  "@type": z.literal("DefinedTermSet").optional(),
  "@id": url,
  name: z.string().optional(),
  url: url.optional(),
});

const DefinedTerm = z.object({
  "@type": z.literal("DefinedTerm"),
  name: z.string().min(1),
  description: z.string().min(1),
  url: url.optional(),
  inDefinedTermSet: DefinedTermSetRef.optional(),
});

export const ArticleSchema = z.object({
  "@context": Context,
  "@type": z.literal("Article"),
  headline: z.string().min(1).max(110),
  name: z.string().min(1).optional(),
  description: z.string().min(1),
  url,
  mainEntityOfPage: z.object({
    "@type": z.literal("WebPage"),
    "@id": url,
  }),
  image: z.array(url).min(1),
  datePublished: isoDate,
  dateModified: isoDate,
  inLanguage: z.string().min(2),
  author: Organization,
  publisher: Organization.refine((o) => !!o.logo, {
    message: "publisher.logo is required for Article rich result",
  }),
  about: DefinedTerm.optional(),
});

export const BreadcrumbListSchema = z.object({
  "@context": Context,
  "@type": z.literal("BreadcrumbList"),
  itemListElement: z
    .array(
      z.object({
        "@type": z.literal("ListItem"),
        position: z.number().int().positive(),
        name: z.string().min(1),
        item: url,
      })
    )
    .min(2),
});

export const FAQPageSchema = z.object({
  "@context": Context,
  "@type": z.literal("FAQPage"),
  mainEntity: z
    .array(
      z.object({
        "@type": z.literal("Question"),
        name: z.string().min(1),
        acceptedAnswer: z.object({
          "@type": z.literal("Answer"),
          text: z.string().min(1),
        }),
      })
    )
    .min(1),
});

export const DefinedTermSetSchema = z.object({
  "@context": Context,
  "@type": z.literal("DefinedTermSet"),
  "@id": url,
  name: z.string().min(1),
  url,
  inLanguage: z.string().optional(),
  hasDefinedTerm: z.array(DefinedTerm).min(1),
});

export const WebPageSchema = z.object({
  "@context": Context,
  "@type": z.literal("WebPage"),
  name: z.string().min(1),
  description: z.string().min(1),
  url,
});

/** Validate a positions-sequential breadcrumb. */
export function assertBreadcrumbPositions(
  items: ReadonlyArray<{ position?: number }>
) {
  items.forEach((it, i) => {
    if (it.position !== i + 1) {
      throw new Error(
        `Breadcrumb position ${it.position} at index ${i} is not sequential`
      );
    }
  });
}

// === Additional schemas used across landing & content pages ===

const PostalAddress = z.object({
  "@type": z.literal("PostalAddress"),
  streetAddress: z.string().min(1),
  addressLocality: z.string().min(1),
  postalCode: z.string().min(1),
  addressCountry: z.string().min(2),
  addressRegion: z.string().optional(),
});

export const OrganizationSchema = z.object({
  "@context": Context,
  "@type": z.literal("Organization"),
  name: z.string().min(1),
  url,
  logo: url,
  description: z.string().min(1),
  address: PostalAddress,
  contactPoint: z.object({
    "@type": z.literal("ContactPoint"),
    telephone: z.string().min(1),
    email: z.string().email(),
    contactType: z.string().min(1),
  }).passthrough(),
  sameAs: z.array(url).optional(),
});

export const LocalBusinessSchema = z.object({
  "@context": Context,
  "@type": z.enum([
    "LocalBusiness",
    "ProfessionalService",
    "Organization",
  ]),
  name: z.string().min(1),
  url,
  telephone: z.string().min(1),
  email: z.string().email(),
  description: z.string().min(1),
  address: PostalAddress,
  geo: z.object({
    "@type": z.literal("GeoCoordinates"),
    latitude: z.number(),
    longitude: z.number(),
  }),
  priceRange: z.string().min(1),
});

export const ServiceSchema = z.object({
  "@context": Context,
  "@type": z.literal("Service"),
  name: z.string().min(1),
  description: z.string().min(1),
  provider: z
    .object({
      "@type": z.literal("Organization"),
      name: z.string().min(1),
    })
    .passthrough(),
  serviceType: z.string().min(1),
});

export const ReviewCollectionSchema = z.object({
  "@context": Context,
  "@type": z.literal("Organization"),
  name: z.string().min(1),
  review: z
    .array(
      z.object({
        "@type": z.literal("Review"),
        author: z.object({
          "@type": z.literal("Person"),
          name: z.string().min(1),
        }),
        reviewBody: z.string().min(1),
        reviewRating: z.object({
          "@type": z.literal("Rating"),
          ratingValue: z.number().min(1).max(5),
          bestRating: z.number().min(1).max(5),
        }),
      })
    )
    .min(1),
});

export const SoftwareApplicationSchema = z.object({
  "@context": Context,
  "@type": z.literal("SoftwareApplication"),
  name: z.string().min(1),
  description: z.string().min(1),
  applicationCategory: z.string().min(1),
  operatingSystem: z.string().min(1),
  url,
  offers: z
    .object({
      "@type": z.literal("Offer"),
      availability: url,
    })
    .passthrough(),
});

