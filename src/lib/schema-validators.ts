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
export function assertBreadcrumbPositions(items: { position: number }[]) {
  items.forEach((it, i) => {
    if (it.position !== i + 1) {
      throw new Error(
        `Breadcrumb position ${it.position} at index ${i} is not sequential`
      );
    }
  });
}
