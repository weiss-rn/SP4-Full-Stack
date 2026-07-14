function FormSectionSkeleton() {
  return (
    <div className="rounded-xl border border-mono-200 dark:border-mono-700 bg-surface p-5">
      <div className="mb-3 h-4 w-36 animate-pulse rounded bg-mono-100" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="h-10 animate-pulse rounded-lg bg-mono-100" />
        <div className="h-10 animate-pulse rounded-lg bg-mono-100" />
        <div className="h-10 animate-pulse rounded-lg bg-mono-100 sm:col-span-2" />
        <div className="h-10 animate-pulse rounded-lg bg-mono-100 sm:col-span-2" />
      </div>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="rounded-xl border border-mono-200 dark:border-mono-700 bg-surface p-5 lg:sticky lg:top-20">
      <div className="mb-3 h-4 w-28 animate-pulse rounded bg-mono-100" />
      <div className="space-y-2 mb-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-mono-100" />
            <div className="h-3 w-16 animate-pulse rounded bg-mono-100" />
          </div>
        ))}
      </div>
      <div className="border-t border-mono-200 pt-2 space-y-1.5">
        <div className="flex justify-between">
          <div className="h-3 w-16 animate-pulse rounded bg-mono-100" />
          <div className="h-3 w-14 animate-pulse rounded bg-mono-100" />
        </div>
        <div className="flex justify-between">
          <div className="h-3 w-14 animate-pulse rounded bg-mono-100" />
          <div className="h-3 w-10 animate-pulse rounded bg-mono-100" />
        </div>
        <div className="border-t border-mono-200 pt-2 flex justify-between">
          <div className="h-4 w-12 animate-pulse rounded bg-mono-100" />
          <div className="h-6 w-20 animate-pulse rounded bg-mono-100" />
        </div>
      </div>
      <div className="mt-4 h-10 w-full animate-pulse rounded-xl bg-mono-100" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-6 h-4 w-24 animate-pulse rounded bg-mono-100" />
      <div className="mb-6 h-7 w-40 animate-pulse rounded bg-mono-100 sm:h-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <FormSectionSkeleton />
          <FormSectionSkeleton />
          <FormSectionSkeleton />
        </div>
        <div className="lg:col-span-1">
          <SummarySkeleton />
        </div>
      </div>
    </div>
  );
}
