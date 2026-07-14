export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-6 space-y-2">
        <div className="h-7 w-40 animate-pulse rounded bg-mono-100 sm:h-8" />
        <div className="h-4 w-56 animate-pulse rounded bg-mono-100" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-mono-200 dark:border-mono-700 bg-surface p-4">
            <div className="mx-auto mb-3 h-8 w-8 animate-pulse rounded bg-mono-100" />
            <div className="mx-auto mb-2 h-4 w-20 animate-pulse rounded bg-mono-100" />
            <div className="mx-auto h-3 w-16 animate-pulse rounded bg-mono-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
