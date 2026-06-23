import { describe, it, expect } from "vitest";
import {
  getEnterpriseCloudItemListSchema,
  getEnterpriseCloudFAQSchema,
} from "@/components/seo/StructuredData";
import {
  EnterpriseCloudItemListSchema,
  FAQPageSchema,
} from "@/lib/schema-validators";
import { enterpriseCloudPlatforms } from "@/components/sections/EnterpriseCloud";

const platforms = enterpriseCloudPlatforms.map((p) => ({
  ...p,
  areaServed: [...p.areaServed],
}));

describe("EnterpriseCloud ItemList schema", () => {
  it("validates the live platforms list", () => {
    const schema = getEnterpriseCloudItemListSchema(platforms);
    expect(() => EnterpriseCloudItemListSchema.parse(schema)).not.toThrow();
  });

  it("has sequential positions starting at 1", () => {
    const schema = EnterpriseCloudItemListSchema.parse(
      getEnterpriseCloudItemListSchema(platforms)
    );
    schema.itemListElement.forEach((el, i) => {
      expect(el.position).toBe(i + 1);
    });
  });

  it("rejects mismatched numberOfItems", () => {
    const schema = getEnterpriseCloudItemListSchema(platforms) as unknown as {
      numberOfItems: number;
    };
    schema.numberOfItems = 99;
    expect(() => EnterpriseCloudItemListSchema.parse(schema)).toThrow();
  });

  it("rejects platform entries without provider brand", () => {
    const schema = getEnterpriseCloudItemListSchema(platforms) as unknown as {
      itemListElement: { item: { brand?: unknown } }[];
    };
    delete schema.itemListElement[0].item.brand;
    expect(() => EnterpriseCloudItemListSchema.parse(schema)).toThrow();
  });
});

describe("EnterpriseCloud FAQ schema", () => {
  it("is a valid FAQPage", () => {
    expect(() => FAQPageSchema.parse(getEnterpriseCloudFAQSchema())).not.toThrow();
  });

  it("contains at least three Q&A entries", () => {
    const parsed = FAQPageSchema.parse(getEnterpriseCloudFAQSchema());
    expect(parsed.mainEntity.length).toBeGreaterThanOrEqual(3);
  });
});
