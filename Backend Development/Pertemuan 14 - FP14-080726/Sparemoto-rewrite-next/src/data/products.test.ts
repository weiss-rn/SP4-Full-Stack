import { describe, expect, it } from "vitest";

import { getFeaturedProducts, getProductById, getProductsByCategory, products, searchProducts } from "./products";

describe("seed catalog helpers", () => {
  it("finds a product by id", () => {
    expect(getProductById("eng-001")?.name).toBe("Performance Piston Kit");
    expect(getProductById("missing")).toBeUndefined();
  });

  it("filters products by category", () => {
    const engineProducts = getProductsByCategory("engine");
    expect(engineProducts.length).toBeGreaterThan(0);
    expect(engineProducts.every((product) => product.categorySlug === "engine")).toBe(true);
  });

  it("searches names, categories, and descriptions", () => {
    expect(searchProducts("brake").length).toBeGreaterThan(0);
    expect(searchProducts("Nickel")).toEqual([expect.objectContaining({ id: "eng-006" })]);
  });

  it("returns featured sale or badged products", () => {
    const featured = getFeaturedProducts();
    expect(featured.length).toBeLessThanOrEqual(8);
    expect(featured.every((product) => product.badge || (product.originalPrice && product.originalPrice > product.price))).toBe(true);
  });

  it("keeps seed products on the consolidated imageUrl field", () => {
    expect(products.every((product) => !("image" in product))).toBe(true);
  });
});
