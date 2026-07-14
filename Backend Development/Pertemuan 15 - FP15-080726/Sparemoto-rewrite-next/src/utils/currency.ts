import type { Locale } from "@/lib/i18n";

export const EXCHANGE_RATES: Record<string, number> = { USD: 1, IDR: 15800 };
export const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", IDR: "Rp" };

export function getCurrencyCode(locale: Locale): string {
  return locale === "id" ? "IDR" : "USD";
}

export function convertPrice(amountUsd: number, locale: Locale): number {
  const code = getCurrencyCode(locale);
  const rate = EXCHANGE_RATES[code] ?? 1;
  return Math.round(amountUsd * rate * 100) / 100;
}

export function formatPrice(amountUsd: number, locale: Locale): string {
  const code = getCurrencyCode(locale);
  const converted = convertPrice(amountUsd, locale);
  const symbol = CURRENCY_SYMBOLS[code] ?? "$";
  if (code === "IDR") {
    return symbol + converted.toLocaleString("id-ID", { maximumFractionDigits: 0 });
  }
  return symbol + converted.toFixed(2);
}
