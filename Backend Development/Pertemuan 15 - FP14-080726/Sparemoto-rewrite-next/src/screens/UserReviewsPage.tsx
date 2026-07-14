"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Star, Trash2, Package, Loader2, User } from "lucide-react";
import type { UserReviewResult } from "@/lib/catalog";
import { useToast } from "@/store/ToastContext";
import { useT } from "@/store/LocaleContext";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-mono-200 dark:fill-mono-700 text-mono-200 dark:text-mono-700"
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function UserReviewsPage() {
  const { showToast } = useToast();
  const t = useT();
  const [reviews, setReviews] = useState<UserReviewResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/reviews");
      const data = (await res.json()) as { error?: string; reviews?: UserReviewResult[] };
      if (!res.ok) {
        if (res.status === 401) {
          setNotLoggedIn(true);
          return;
        }
        throw new Error(data.error || "Unable to load reviews.");
      }
      setReviews(data.reviews ?? []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to load reviews.", { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleDelete = async (reviewId: string) => {
    setDeletingId(reviewId);
    try {
      const res = await fetch(`/api/user/reviews/${reviewId}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Unable to delete review.");
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setConfirmDeleteId(null);
      showToast(t("reviews.deleted"), { type: "success" });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to delete review.", { type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  if (notLoggedIn) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center sm:px-6">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-mono-200 dark:bg-mono-700">
          <User className="h-6 w-6 text-mono-500 dark:text-mono-400" />
        </div>
        <h1 className="text-xl font-bold text-mono-900 dark:text-mono-100">{t("auth.signInTitle")}</h1>
        <p className="mt-1 text-sm text-mono-500 dark:text-mono-400">Sign in to view your review history.</p>
        <Link
          href="/login?redirect=/reviews"
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
        <h1 className="text-2xl font-bold text-mono-900 dark:text-mono-100">{t("reviews.historyTitle")}</h1>
        <p className="mt-1 text-sm text-mono-500 dark:text-mono-400">{t("reviews.historyDescription")}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-mono-400" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-mono-200 dark:border-mono-700 bg-surface p-6 text-center">
          <Package className="mx-auto mb-3 h-8 w-8 text-mono-300 dark:text-mono-600" />
          <p className="text-sm font-semibold text-mono-900 dark:text-mono-100">{t("reviews.noReviews")}</p>
          <p className="mt-1 text-sm text-mono-500 dark:text-mono-400">{t("reviews.noReviewsDesc")}</p>
          <Link href="/products" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-mono-700 dark:text-mono-300 hover:text-mono-900 dark:hover:text-mono-100">
            {t("reviews.browseProducts")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-mono-200 dark:border-mono-700 bg-surface p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/product/${review.productId}`} className="text-sm font-semibold text-mono-900 dark:text-mono-100 hover:underline">
                      {review.title}
                    </Link>
                    <span className="text-xs text-mono-400 dark:text-mono-500">
                      {t("reviews.onProduct", { product: review.productId })}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <StarDisplay rating={review.rating} />
                    <span className="text-xs font-semibold text-mono-700 dark:text-mono-300">{review.rating}/5</span>
                  </div>
                  <p className="mt-2 text-sm text-mono-600 dark:text-mono-400 leading-relaxed">{review.body}</p>
                  <p className="mt-2 text-[11px] text-mono-400 dark:text-mono-500">{formatDate(review.createdAt)}</p>
                </div>
                <div className="shrink-0">
                  {confirmDeleteId === review.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                      >
                        {deletingId === review.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="inline-flex items-center gap-1 rounded-lg border border-mono-200 dark:border-mono-700 px-2.5 py-1 text-[11px] font-medium text-mono-600 dark:text-mono-400 transition hover:bg-mono-50 dark:hover:bg-mono-800"
                      >
                        {t("profile.cancel")}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(review.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-800 px-2.5 py-1 text-[11px] font-medium text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3 w-3" />
                      {t("reviews.deleteReview")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
