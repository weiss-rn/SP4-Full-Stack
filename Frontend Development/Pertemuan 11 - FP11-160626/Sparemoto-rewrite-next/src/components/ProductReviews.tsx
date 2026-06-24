"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Star, ThumbsUp, MessageCircle, Send, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { getReviewsByProductId } from "@/data/reviews";
import { useToast } from "@/store/ToastContext";

interface UserReview {
  id: string;
  productId: string;
  userId: string | null;
  author: string;
  rating: number;
  title: string;
  body: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

type MergedReview = {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verifiedPurchase: boolean;
  isStatic?: boolean;
  isUserSubmitted?: boolean;
  isWeird?: boolean;
};

function StarRating({ rating, size = "sm", interactive, onChange }: {
  rating: number;
  size?: "sm" | "xs";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}) {
  const starSize = size === "sm" ? "w-4 h-4" : "w-3 h-3";
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = interactive
          ? i < (hoverRating || rating)
          : i < Math.round(rating);

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            onMouseEnter={() => interactive && setHoverRating(i + 1)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={cn(
              interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default",
              "focus-visible:outline-2 focus-visible:outline-mono-900"
            )}
            aria-label={interactive ? `Rate ${i + 1} star${i + 1 > 1 ? "s" : ""}` : undefined}
          >
            <Star
              className={cn(
                starSize,
                "transition-colors",
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-mono-200 text-mono-200 dark:fill-mono-600 dark:text-mono-600"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ReviewCard({ review }: { review: MergedReview }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.body.length > 200;
  const isWeird = review.isWeird || (review.rating <= 2 && review.body.includes("??"));

  return (
    <div className={cn(
      "rounded-2xl border p-4 transition",
      isWeird
        ? "border-amber-200 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-900/10"
        : "border-mono-200 bg-surface dark:border-mono-700"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mono-200 text-[11px] font-bold text-mono-600 dark:bg-mono-600 dark:text-mono-300">
              {review.author.charAt(0)}
            </span>
            <span className="text-sm font-semibold text-mono-900 dark:text-mono-100">{review.author}</span>
            {review.verifiedPurchase && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <ThumbsUp className="h-2.5 w-2.5" />
                Verified
              </span>
            )}
            {review.isUserSubmitted && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                New
              </span>
            )}
            {isWeird && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                <MessageCircle className="h-2.5 w-2.5" />
                Interesting
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <StarRating rating={review.rating} />
            <span className="text-xs font-semibold text-mono-900 dark:text-mono-100">{review.rating}</span>
          </div>
          <h4 className="mt-1.5 text-sm font-bold text-mono-900 dark:text-mono-100">{review.title}</h4>
          <div className="mt-1">
            <p className="text-sm leading-relaxed text-mono-600 dark:text-mono-400">
              {isLong && !expanded ? review.body.slice(0, 200) + "..." : review.body}
            </p>
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="mt-1 inline-flex items-center gap-0.5 text-xs font-semibold text-mono-500 hover:text-mono-900 dark:hover:text-mono-200"
              >
                {expanded ? (
                  <>Show less <ChevronUp className="h-3 w-3" /></>
                ) : (
                  <>Read more <ChevronDown className="h-3 w-3" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-mono-400 dark:text-mono-500">{formatDate(review.date)}</p>
    </div>
  );
}

function WriteReviewForm({ productId, onReviewSubmitted }: { productId: string; onReviewSubmitted: () => void }) {
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      showToast("Please select a star rating.", { type: "error" });
      return;
    }
    if (!title.trim()) {
      showToast("Please enter a review title.", { type: "error" });
      return;
    }
    if (!body.trim()) {
      showToast("Please write your review.", { type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, rating, title: title.trim(), body: body.trim() }),
      });

      const data = await res.json() as { error?: string; review?: unknown };
      if (!res.ok) throw new Error(data.error || "Unable to submit review.");

      showToast("Review submitted! Thank you for your feedback.", { type: "success" });
      setRating(0);
      setTitle("");
      setBody("");
      setShowForm(false);
      onReviewSubmitted();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to submit review.", { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "w-full rounded-xl border border-mono-200 bg-mono-50 px-3 py-2.5 text-sm text-mono-900 outline-none transition focus:border-mono-900 focus:bg-white dark:border-mono-700 dark:bg-mono-800 dark:text-mono-100 dark:focus:bg-mono-800";

  return (
    <div className="rounded-2xl border border-mono-200 bg-mono-50 p-5 dark:border-mono-700 dark:bg-mono-800/50">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-mono-400" />
          <h3 className="text-sm font-bold text-mono-900 dark:text-mono-100">Write a Review</h3>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition",
            showForm
              ? "bg-mono-200 text-mono-600 hover:bg-mono-300 dark:bg-mono-700 dark:text-mono-300"
              : "bg-mono-900 text-white hover:bg-mono-800 dark:bg-mono-100 dark:text-mono-900"
          )}
        >
          {showForm ? "Cancel" : "Write Review"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500 dark:text-mono-400">
              Your Rating
            </span>
            <div className="mt-2">
              <StarRating rating={rating} size="sm" interactive onChange={setRating} />
              {rating > 0 && (
                <span className="ml-2 text-xs font-medium text-mono-500 dark:text-mono-400">
                  {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : "Excellent"}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500 dark:text-mono-400">
              Review Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Share the highlight of your experience"
              className={cn(fieldClass, "mt-1")}
              maxLength={100}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500 dark:text-mono-400">
              Your Review
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tell others about your experience with this part. How was the fitment? Performance? Installation?"
              rows={4}
              className={cn(fieldClass, "mt-1 resize-none")}
              maxLength={2000}
            />
            <p className="mt-1 text-right text-[10px] text-mono-400">{body.length}/2000</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-mono-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-mono-800 disabled:opacity-60 dark:bg-mono-100 dark:text-mono-900 dark:hover:bg-mono-200"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
            ) : (
              <><Send className="h-4 w-4" /> Submit Review</>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ProductReviews({ productId }: { productId: string }) {
  const staticReviews = getReviewsByProductId(productId);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [sortNewest, setSortNewest] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadUserReviews = useCallback(async () => {
    setLoaded(false);
    setUserReviews([]);
    try {
      const res = await fetch(`/api/reviews/${productId}`);
      const data = await res.json() as { reviews?: UserReview[] };
      setUserReviews(data.reviews ?? []);
      setLoaded(true);
    } catch {
      setLoaded(true);
    }
  }, [productId]);

  useEffect(() => {
    loadUserReviews();
  }, [loadUserReviews]);

  // Merge static reviews with user-submitted reviews
  const allReviews: MergedReview[] = [
    ...userReviews.map((r) => ({
      id: r.id,
      author: r.author,
      rating: r.rating,
      title: r.title,
      body: r.body,
      date: r.createdAt,
      verifiedPurchase: r.verifiedPurchase,
      isUserSubmitted: true,
    })),
    ...staticReviews.map((r) => ({
      id: r.id,
      author: r.author,
      rating: r.rating,
      title: r.title,
      body: r.body,
      date: r.date,
      verifiedPurchase: r.verifiedPurchase,
      isStatic: true,
      isWeird: r.rating <= 2 && r.body.includes("??"),
    })),
  ];

  if (allReviews.length === 0 && !loaded) {
    return (
      <section className="mt-12">
        <div className="border-t border-mono-200 dark:border-mono-700 pt-8">
          <div className="flex items-center gap-3 mb-5">
            <MessageCircle className="h-5 w-5 text-mono-400" />
            <h2 className="text-lg font-bold text-mono-900 dark:text-mono-100">Customer Reviews</h2>
          </div>
          <WriteReviewForm productId={productId} onReviewSubmitted={loadUserReviews} />
          <p className="mt-4 text-center text-sm text-mono-500 dark:text-mono-400">
            Be the first to review this product!
          </p>
        </div>
      </section>
    );
  }

  const sorted = [...allReviews].sort((a, b) =>
    sortNewest
      ? new Date(b.date).getTime() - new Date(a.date).getTime()
      : b.rating - a.rating
  );

  const displayed = showAll ? sorted : sorted.slice(0, 4);
  const hasMore = sorted.length > 4;

  return (
    <section className="mt-12">
      <div className="border-t border-mono-200 dark:border-mono-700 pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-mono-400" />
            <h2 className="text-lg font-bold text-mono-900 dark:text-mono-100">
              Customer Reviews
            </h2>
            <span className="rounded-full bg-mono-200 px-2.5 py-0.5 text-xs font-semibold text-mono-600 dark:bg-mono-700 dark:text-mono-300">
              {allReviews.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-mono-500 dark:text-mono-400">Sort by:</span>
            <button
              type="button"
              onClick={() => setSortNewest(true)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition",
                sortNewest
                  ? "bg-mono-900 text-white dark:bg-mono-100 dark:text-mono-900"
                  : "bg-mono-100 text-mono-600 hover:bg-mono-200 dark:bg-mono-800 dark:text-mono-400 dark:hover:bg-mono-700"
              )}
            >
              Newest
            </button>
            <button
              type="button"
              onClick={() => setSortNewest(false)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition",
                !sortNewest
                  ? "bg-mono-900 text-white dark:bg-mono-100 dark:text-mono-900"
                  : "bg-mono-100 text-mono-600 hover:bg-mono-200 dark:bg-mono-800 dark:text-mono-400 dark:hover:bg-mono-700"
              )}
            >
              Highest Rated
            </button>
          </div>
        </div>

        <div className="mt-5">
          <WriteReviewForm productId={productId} onReviewSubmitted={loadUserReviews} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {displayed.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {hasMore && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-mono-200 dark:border-mono-700 bg-surface px-4 py-3 text-sm font-semibold text-mono-700 transition hover:border-mono-900 hover:text-mono-900 dark:hover:border-mono-400 dark:hover:text-mono-100"
          >
            {showAll ? (
              <>Show less <ChevronUp className="h-4 w-4" /></>
            ) : (
              <>Show all {sorted.length} reviews <ChevronDown className="h-4 w-4" /></>
            )}
          </button>
        )}
      </div>
    </section>
  );
}
