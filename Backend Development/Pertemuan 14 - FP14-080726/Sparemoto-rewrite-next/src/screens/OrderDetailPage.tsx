"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Loader2, User, Star } from "lucide-react";
import type { DemoOrderLookupOrder, DemoOrderStatus } from "@/types/demo-orders";
import { useToast } from "@/store/ToastContext";
import { useT, useLocale } from "@/store/LocaleContext";
import type { TranslationKey } from "@/lib/i18n";
import { formatPrice } from "@/utils/currency";

function formatTimestamp(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
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

const CANCEL_REASONS = [
  { key: "changedMind", labelKey: "orders.cancelReasonChangedMind" },
  { key: "betterPrice", labelKey: "orders.cancelReasonBetterPrice" },
  { key: "wrongItem", labelKey: "orders.cancelReasonWrongItem" },
  { key: "noLongerNeeded", labelKey: "orders.cancelReasonNoLongerNeeded" },
  { key: "other", labelKey: "orders.cancelReasonOther" },
] as const;

export default function OrderDetailPage({ orderId }: { orderId: string }) {
  const { showToast } = useToast();
  const t = useT();
  const { locale } = useLocale();
  const [order, setOrder] = useState<DemoOrderLookupOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  // Cancel modal state
  const [cancelTarget, setCancelTarget] = useState<{ type: "order" | "item"; itemId?: string } | null>(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/orders/${orderId}`);
      const data = (await res.json()) as { error?: string; order?: DemoOrderLookupOrder };
      if (!res.ok) {
        if (res.status === 401) {
          setNotLoggedIn(true);
          return;
        }
        throw new Error(data.error || "Unable to load order.");
      }
      setOrder(data.order ?? null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to load order.", { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [orderId, showToast]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleCancel = async () => {
    if (!cancelTarget || !order) return;
    const reason = selectedReason === "other" ? customReason.trim() : t(selectedReason === "changedMind" ? "orders.cancelReasonChangedMind" : selectedReason === "betterPrice" ? "orders.cancelReasonBetterPrice" : selectedReason === "wrongItem" ? "orders.cancelReasonWrongItem" : "orders.cancelReasonNoLongerNeeded");
    if (!reason) {
      showToast("Please provide a reason.", { type: "error" });
      return;
    }

    setCancelling(true);
    try {
      const url =
        cancelTarget.type === "order"
          ? `/api/user/orders/${order.id}/cancel`
          : `/api/user/orders/${order.id}/items/${cancelTarget.itemId}/cancel`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = (await res.json()) as { error?: string; order?: DemoOrderLookupOrder };
      if (!res.ok) throw new Error(data.error || "Unable to cancel.");
      setOrder(data.order ?? null);
      setCancelTarget(null);
      setSelectedReason("");
      setCustomReason("");
      showToast(t("orders.cancelSuccess"), { type: "success" });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to cancel.", { type: "error" });
    } finally {
      setCancelling(false);
    }
  };

  if (notLoggedIn) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center sm:px-6">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-mono-200 dark:bg-mono-700">
          <User className="h-6 w-6 text-mono-500 dark:text-mono-400" />
        </div>
        <h1 className="text-xl font-bold text-mono-900 dark:text-mono-100">{t("auth.signInTitle")}</h1>
        <p className="mt-1 text-sm text-mono-500 dark:text-mono-400">Sign in to view order details.</p>
        <Link
          href={`/login?redirect=/orders/${orderId}`}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-mono-900 dark:bg-mono-100 px-5 py-2.5 text-sm font-semibold text-white dark:text-mono-900 transition hover:bg-mono-800 dark:hover:bg-mono-200"
        >
          {t("nav.signIn")}
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-mono-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <Package className="mx-auto mb-3 h-8 w-8 text-mono-300 dark:text-mono-600" />
        <p className="text-sm font-semibold text-mono-900 dark:text-mono-100">Order not found.</p>
        <Link href="/orders" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-mono-700 dark:text-mono-300 hover:text-mono-900 dark:hover:text-mono-100">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
      </div>
    );
  }

  const isCancellable = order.status === "confirmed" || order.status === "pending";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm text-mono-500 dark:text-mono-400 hover:text-mono-900 dark:hover:text-mono-100 mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to orders
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-mono-900 dark:text-mono-100">{order.orderNumber}</h1>
          <StatusBadge status={order.status} t={t} />
        </div>
        <p className="mt-1 text-sm text-mono-500 dark:text-mono-400">{formatTimestamp(order.createdAt)}</p>
        {order.cancelReason && (
          <div className="mt-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">
            <span className="font-semibold">Cancellation reason:</span> {order.cancelReason}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-mono-900 dark:text-mono-100 uppercase tracking-wider">Items</h2>
          {order.items.map((item) => {
            const itemCancelled = item.itemStatus === "cancelled";
            return (
              <div
                key={item.productId}
                className={`rounded-2xl border p-4 ${
                  itemCancelled
                    ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 opacity-60"
                    : "border-mono-200 dark:border-mono-700 bg-surface"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/product/${item.productId}`} className="text-sm font-semibold text-mono-900 dark:text-mono-100 hover:underline">
                        {item.productName}
                      </Link>
                      {itemCancelled && (
                        <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:text-red-400">
                          Cancelled
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-mono-500 dark:text-mono-400 mt-0.5">{item.category} · Qty {item.quantity} · {formatPrice(item.unitPrice, locale)} each</p>
                    {item.cancelReason && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">Reason: {item.cancelReason}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-mono-900 dark:text-mono-100">{formatPrice(item.lineTotal, locale)}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {isCancellable && !itemCancelled && (
                    <button
                      type="button"
                      onClick={() => setCancelTarget({ type: "item", itemId: item.productId })}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-800 px-2.5 py-1 text-[11px] font-medium text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      {t("orders.cancelItem")}
                    </button>
                  )}
                  {!itemCancelled && (
                    <Link
                      href={`/product/${item.productId}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-mono-200 dark:border-mono-700 px-2.5 py-1 text-[11px] font-medium text-mono-600 dark:text-mono-400 transition hover:bg-mono-50 dark:hover:bg-mono-800"
                    >
                      <Star className="h-3 w-3" />
                      {t("orders.writeReview")}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Shipping Address */}
          <div className="rounded-2xl border border-mono-200 dark:border-mono-700 bg-surface p-4">
            <h3 className="text-xs font-bold text-mono-900 dark:text-mono-100 uppercase tracking-wider mb-2">{t("orders.shippingAddress")}</h3>
            <p className="text-sm text-mono-600 dark:text-mono-400">{order.customerName}</p>
            <p className="text-sm text-mono-600 dark:text-mono-400">{order.customerEmail}</p>
          </div>

          {/* Payment Summary */}
          <div className="rounded-2xl border border-mono-200 dark:border-mono-700 bg-surface p-4">
            <h3 className="text-xs font-bold text-mono-900 dark:text-mono-100 uppercase tracking-wider mb-3">{t("orders.paymentSummary")}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-mono-500 dark:text-mono-400">{t("orders.subtotal")}</span>
                <span className="font-semibold text-mono-900 dark:text-mono-100">{formatPrice(order.subtotal, locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mono-500 dark:text-mono-400">{t("orders.discount")}</span>
                <span className="font-semibold text-mono-900 dark:text-mono-100">
                  {order.discountAmount > 0 ? `-${formatPrice(order.discountAmount, locale)}` : formatPrice(0, locale)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mono-500 dark:text-mono-400">{t("orders.shippingLabel")}</span>
                <span className="font-semibold text-mono-900 dark:text-mono-100">
                  {order.shippingFee === 0 ? t("cart.free") : formatPrice(order.shippingFee, locale)}
                </span>
              </div>
              <div className="border-t border-mono-200 dark:border-mono-700 pt-2 flex justify-between">
                <span className="font-bold text-mono-900 dark:text-mono-100">{t("orders.total")}</span>
                <span className="font-extrabold text-mono-900 dark:text-mono-100">{formatPrice(order.total, locale)}</span>
              </div>
            </div>
          </div>

          {/* Cancel Order */}
          {isCancellable && (
            <button
              type="button"
              onClick={() => setCancelTarget({ type: "order" })}
              className="w-full rounded-2xl border border-red-200 dark:border-red-800 bg-surface px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              {t("orders.cancelOrder")}
            </button>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-mono-200 dark:border-mono-700 bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-bold text-mono-900 dark:text-mono-100">
              {cancelTarget.type === "order" ? t("orders.cancelOrder") : t("orders.cancelItem")}
            </h3>
            <p className="mt-1 text-sm text-mono-500 dark:text-mono-400">{t("orders.cancelReason")}</p>

            <div className="mt-4 space-y-2">
              {CANCEL_REASONS.map((reason) => (
                <label key={reason.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="cancel-reason"
                    value={reason.key}
                    checked={selectedReason === reason.key}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-mono-700 dark:text-mono-300">{t(reason.labelKey)}</span>
                </label>
              ))}
            </div>

            {selectedReason === "other" && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please specify your reason..."
                rows={3}
                className="mt-3 w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3 py-2.5 text-sm text-mono-900 outline-none transition focus:border-mono-900 resize-none"
              />
            )}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={!selectedReason || (selectedReason === "other" && !customReason.trim()) || cancelling}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t("orders.cancelConfirm")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCancelTarget(null);
                  setSelectedReason("");
                  setCustomReason("");
                }}
                className="flex-1 rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-4 py-2.5 text-sm font-semibold text-mono-600 dark:text-mono-400 transition hover:bg-mono-50 dark:hover:bg-mono-800"
              >
                {t("profile.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
