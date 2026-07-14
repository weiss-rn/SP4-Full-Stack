function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-mono-200 dark:border-mono-700 bg-surface">
      <div className="aspect-[4/3] animate-pulse bg-mono-100" />
      <div className="space-y-3 p-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-mono-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-mono-100" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-mono-100" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 space-y-2">
        <div className="h-7 w-48 animate-pulse rounded bg-mono-100" />
        <div className="h-4 w-32 animate-pulse rounded bg-mono-100" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
