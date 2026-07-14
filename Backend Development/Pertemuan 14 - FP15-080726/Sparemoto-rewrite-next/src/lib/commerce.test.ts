import { describe, expect, it } from "vitest";

import { getDiscountRate, getShippingFee, roundCurrency, SHIPPING_FEE } from "./commerce";

describe("commerce helpers", () => {
  it("normalizes discount codes", () => {
    expect(getDiscountRate(" moto10 ")).toBe(0.1);
    expect(getDiscountRate("parts20")).toBe(0.2);
    expect(getDiscountRate("missing")).toBe(0);
    expect(getDiscountRate(null)).toBe(0);
  });

  it("applies the shipping threshold", () => {
    expect(getShippingFee(199.99)).toBe(SHIPPING_FEE);
    expect(getShippingFee(200)).toBe(0);
  });

  it("rounds currency to two decimals", () => {
    expect(roundCurrency(10.005)).toBe(10.01);
    expect(roundCurrency(12.344)).toBe(12.34);
  });
});
