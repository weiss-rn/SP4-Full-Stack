function CartItemSkeleton() {
  return (
    <div className="flex gap-3 sm:gap-4 rounded-xl border border-mono-200 dark:border-mono-700 bg-surface p-3 sm:p-4">
      <div className="h-16 w-16 shrink-0 animate-pulse rounded-lg bg-mono-100 sm:h-20 sm:w-20" />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 animate-pulse rounded bg-mono-100" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-mono-100" />
          </div>
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-mono-100" />
        </div>
        <div className="flex items-end justify-between">
          <div className="h-9 w-28 animate-pulse rounded-lg bg-mono-100" />
          <div className="space-y-1.5 text-right">
            <div className="h-5 w-16 animate-pulse rounded bg-mono-100" />
            <div className="h-3 w-12 animate-pulse rounded bg-mono-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="rounded-xl border border-mono-200 dark:border-mono-700 bg-surface p-4 sm:p-5">
      <div className="mb-4 h-5 w-28 animate-pulse rounded bg-mono-100" />
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-4 w-16 animate-pulse rounded bg-mono-100" />
          <div className="h-4 w-14 animate-pulse rounded bg-mono-100" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-14 animate-pulse rounded bg-mono-100" />
          <div className="h-4 w-10 animate-pulse rounded bg-mono-100" />
        </div>
        <div className="border-t border-mono-200 pt-2 flex justify-between">
          <div className="h-5 w-12 animate-pulse rounded bg-mono-100" />
          <div className="h-6 w-20 animate-pulse rounded bg-mono-100" />
        </div>
      </div>
      <div className="mt-4 h-10 w-full animate-pulse rounded-xl bg-mono-100" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-5 sm:mb-6 space-y-2">
        <div className="h-7 w-40 animate-pulse rounded bg-mono-100 sm:h-8" />
        <div className="h-4 w-24 animate-pulse rounded bg-mono-100" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <CartItemSkeleton key={index} />
          ))}
        </div>
        <div className="lg:col-span-1">
          <SummarySkeleton />
        </div>
      </div>
    </div>
  );
}
