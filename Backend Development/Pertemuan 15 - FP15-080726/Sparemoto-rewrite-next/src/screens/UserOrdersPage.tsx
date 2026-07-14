"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Package, Search, ChevronRight, Loader2, User } from "lucide-react";
import type { DemoOrderLookupOrder, DemoOrderStatus } from "@/types/demo-orders";
import { useToast } from "@/store/ToastContext";
import { useT, useLocale } from "@/store/LocaleContext";
import type { TranslationKey } from "@/lib/i18n";
import { formatPrice } from "@/utils/currency";

function formatTimestamp(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status, t }: { status: DemoOrderStatus; t: (key: TranslationKey) => string }) {
  const styles: Record<DemoOrderStatus, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    partially_cancelled: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  };
  const labels: Record<DemoOrderStatus, string> = {
    pending: t("orders.statusPending"),
    confirmed: t("orders.statusConfirmed"),
    cancelled: t("orders.statusCancelled"),
    partially_cancelled: t("orders.statusPartiallyCancelled"),
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function UserOrdersPage() {
  const { showToast } = useToast();
  const t = useT();
  const { locale } = useLocale();
  const [orders, setOrders] = useState<DemoOrderLookupOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortNewest, setSortNewest] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/orders");
      const data = (await res.json()) as { error?: string; orders?: DemoOrderLookupOrder[] };
      if (!res.ok) {
        if (res.status === 401) {
          setNotLoggedIn(true);
          return;
        }
        throw new Error(data.error || "Unable to load orders.");
      }
      setOrders(data.orders ?? []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to load orders.", { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filtered = orders
    .filter((o) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.items.some((i) => i.productName.toLowerCase().includes(q))
      );
    })
    .sort((a, b) =>
      sortNewest
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  if (notLoggedIn) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center sm:px-6">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-mono-200 dark:bg-mono-700">
          <User className="h-6 w-6 text-mono-500 dark:text-mono-400" />
        </div>
        <h1 className="text-xl font-bold text-mono-900 dark:text-mono-100">{t("auth.signInTitle")}</h1>
        <p className="mt-1 text-sm text-mono-500 dark:text-mono-400">Sign in to view your order history.</p>
        <Link
          href="/login?redirect=/orders"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-mono-900 dark:bg-mono-100 px-5 py-2.5 text-sm font-semibold text-white dark:text-mono-900 transition hover:bg-mono-800 dark:hover:bg-mono-200"
        >
          {t("nav.signIn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mono-900 dark:text-mono-100">{t("orders.historyTitle")}</h1>
        <p className="mt-1 text-sm text-mono-500 dark:text-mono-400">{t("orders.historyDescription")}</p>
      </div>

      {/* Search and sort */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mono-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order number or product..."
            className="w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface py-2.5 pl-10 pr-3 text-sm text-mono-900 outline-none transition focus:border-mono-900"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSortNewest(true)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              sortNewest
                ? "bg-mono-900 dark:bg-mono-100 text-white dark:text-mono-900"
                : "bg-mono-100 dark:bg-mono-800 text-mono-600 dark:text-mono-400 hover:bg-mono-200 dark:hover:bg-mono-700"
            }`}
          >
            Newest
          </button>
          <button
            type="button"
            onClick={() => setSortNewest(false)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              !sortNewest
                ? "bg-mono-900 dark:bg-mono-100 text-white dark:text-mono-900"
                : "bg-mono-100 dark:bg-mono-800 text-mono-600 dark:text-mono-400 hover:bg-mono-200 dark:hover:bg-mono-700"
            }`}
          >
            Oldest
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-mono-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-mono-200 dark:border-mono-700 bg-surface p-6 text-center">
          <Package className="mx-auto mb-3 h-8 w-8 text-mono-300 dark:text-mono-600" />
          <p className="text-sm font-semibold text-mono-900 dark:text-mono-100">{t("orders.noOrders")}</p>
          <Link href="/products" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-mono-700 dark:text-mono-300 hover:text-mono-900 dark:hover:text-mono-100">
            {t("cart.browseParts")}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-2xl border border-mono-200 dark:border-mono-700 bg-surface p-4 shadow-sm transition hover:border-mono-400 dark:hover:border-mono-500"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-bold text-mono-900 dark:text-mono-100">{order.orderNumber}</h2>
                    <StatusBadge status={order.status} t={t} />
                  </div>
                  <p className="mt-0.5 text-xs text-mono-500 dark:text-mono-400">{formatTimestamp(order.createdAt)}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {order.items.slice(0, 3).map((item) => (
                      <span
                        key={item.productId}
                        className="inline-block rounded-full bg-mono-100 dark:bg-mono-800 px-2 py-0.5 text-[10px] text-mono-600 dark:text-mono-400"
                      >
                        {item.productName} x{item.quantity}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="inline-block rounded-full bg-mono-100 dark:bg-mono-800 px-2 py-0.5 text-[10px] text-mono-600 dark:text-mono-400">
                        +{order.items.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-mono-900 dark:text-mono-100">{formatPrice(order.total, locale)}</div>
                    <div className="text-[10px] text-mono-500 dark:text-mono-400">{order.totalItems} items</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-mono-400 shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
