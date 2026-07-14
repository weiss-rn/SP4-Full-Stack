function OrderCardSkeleton() {
  return (
    <div className="rounded-2xl border border-mono-200 dark:border-mono-700 bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="h-3 w-36 animate-pulse rounded bg-mono-100" />
          <div className="h-5 w-48 animate-pulse rounded bg-mono-100" />
          <div className="h-3 w-32 animate-pulse rounded bg-mono-100" />
        </div>
        <div className="rounded-xl border border-mono-200 bg-mono-50 px-4 py-3">
          <div className="mb-1 h-3 w-10 animate-pulse rounded bg-mono-100" />
          <div className="h-6 w-20 animate-pulse rounded bg-mono-100" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-start justify-between gap-3 rounded-xl bg-mono-50 px-3 py-2">
            <div className="flex-1 space-y-1">
              <div className="h-3 w-3/4 animate-pulse rounded bg-mono-100" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-mono-100" />
            </div>
            <div className="h-3 w-14 animate-pulse rounded bg-mono-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 space-y-2">
        <div className="h-7 w-36 animate-pulse rounded bg-mono-100 sm:h-8" />
        <div className="h-4 w-64 animate-pulse rounded bg-mono-100" />
      </div>
      <div className="mb-6 h-14 w-full animate-pulse rounded-2xl bg-mono-100" />
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
