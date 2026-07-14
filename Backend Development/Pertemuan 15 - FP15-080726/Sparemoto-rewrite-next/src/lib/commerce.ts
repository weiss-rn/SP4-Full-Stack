export const SHIPPING_FEE = 14.99;

export const DISCOUNT_CODES: Record<string, number> = {
  MOTO10: 0.1,
  PARTS20: 0.2,
  RIDE15: 0.15,
  FIRST25: 0.25,
};

export function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getDiscountRate(code?: string | null) {
  if (!code) {
    return 0;
  }

  return DISCOUNT_CODES[code.trim().toUpperCase()] ?? 0;
}

export function getShippingFee(subtotal: number) {
  return subtotal >= 200 ? 0 : SHIPPING_FEE;
}
