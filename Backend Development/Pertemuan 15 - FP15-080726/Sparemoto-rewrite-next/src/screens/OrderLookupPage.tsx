"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Package, Search } from "lucide-react";

import type { DemoOrderLookupOrder } from "@/types/demo-orders";
import { useToast } from "@/store/ToastContext";
import { useT, useLocale } from "@/store/LocaleContext";
import { formatPrice } from "@/utils/currency";

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

export default function OrderLookupPage() {
  const { showToast } = useToast();
  const t = useT();
  const { locale } = useLocale();
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<DemoOrderLookupOrder[]>([]);
  const [searchedEmail, setSearchedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return;

    setLoading(true);
    setError("");
    setSearchedEmail(normalizedEmail);

    try {
      const response = await fetch(`/api/demo-orders/lookup?email=${encodeURIComponent(normalizedEmail)}`);
      const data = (await response.json()) as { error?: string; orders?: DemoOrderLookupOrder[] };

      if (!response.ok || !data.orders) {
        throw new Error(data.error || "Unable to find orders.");
      }

      setOrders(data.orders);
      showToast(data.orders.length > 0 ? "Order history loaded." : "No orders found for that email.", {
        type: data.orders.length > 0 ? "success" : "info",
      });
    } catch (lookupError) {
      const nextError = lookupError instanceof Error ? lookupError.message : "Unable to find orders.";
      setError(nextError);
      setOrders([]);
      showToast(nextError, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mono-900">{t("orders.title")}</h1>
        <p className="mt-1 text-sm text-mono-500">{t("orders.description")}</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-mono-200 dark:border-mono-700 bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">{t("orders.searchPlaceholder")}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mono-400" />
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("orders.searchPlaceholder")}
              className="w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface py-2.5 pl-10 pr-3 text-sm text-mono-900 outline-none transition focus:border-mono-900"
            />
          </label>
          <button
            disabled={loading}
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-mono-900 px-4 text-sm font-semibold text-white transition hover:bg-mono-800 disabled:opacity-60"
          >
            {loading ? t("orders.searching") : t("orders.searchButton")}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
      </form>

      <div className="mt-6 space-y-4">
        {searchedEmail && !loading && orders.length === 0 && !error && (
          <div className="rounded-2xl border border-mono-200 bg-surface p-6 text-center">
            <Package className="mx-auto mb-3 h-8 w-8 text-mono-300" />
            <p className="text-sm font-semibold text-mono-900">{t("orders.noOrders")}</p>
            <p className="mt-1 text-sm text-mono-500">{searchedEmail}</p>
            <Link href="/products" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-mono-700 hover:text-mono-900">
              {t("cart.browseParts")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-mono-200 bg-surface p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mono-500">
                  {formatTimestamp(order.createdAt)}
                </p>
                <h2 className="mt-1 text-lg font-bold text-mono-900">{order.orderNumber}</h2>
                <p className="text-sm text-mono-500">{order.customerName}</p>
              </div>
              <div className="rounded-xl border border-mono-200 bg-mono-50 px-4 py-3 text-sm">
                <div className="text-xs text-mono-500">{t("orders.total")}</div>
                <div className="text-lg font-extrabold text-mono-900">{formatPrice(order.total, locale)}</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {order.items.map((item) => (
                <div key={`${order.id}-${item.productId}`} className="flex items-start justify-between gap-3 rounded-xl bg-mono-50 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-mono-900">{item.productName}</p>
                    <p className="text-xs text-mono-500">
                      {item.category} · Qty {item.quantity} · Remaining stock {item.remainingStock}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-mono-900">{formatPrice(item.lineTotal, locale)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-2 border-t border-mono-100 pt-4 text-xs sm:grid-cols-4">
              <div>
                <span className="text-mono-500">{t("orders.subtotal")}</span>
                <p className="font-semibold text-mono-900">{formatPrice(order.subtotal, locale)}</p>
              </div>
              <div>
                <span className="text-mono-500">{t("orders.discount")}</span>
                <p className="font-semibold text-mono-900">
                  {order.discountAmount > 0 ? `-${formatPrice(order.discountAmount, locale)}` : formatPrice(0, locale)}
                </p>
              </div>
              <div>
                <span className="text-mono-500">{t("orders.shippingLabel")}</span>
                <p className="font-semibold text-mono-900">
                  {order.shippingFee === 0 ? t("cart.free") : formatPrice(order.shippingFee, locale)}
                </p>
              </div>
              <div>
                <span className="text-mono-500">{t("orders.items")}</span>
                <p className="font-semibold text-mono-900">{order.totalItems}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
