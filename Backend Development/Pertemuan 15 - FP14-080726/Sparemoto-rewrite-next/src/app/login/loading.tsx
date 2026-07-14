function InputSkeleton() {
  return (
    <div className="block space-y-2">
      <div className="h-3 w-16 animate-pulse rounded bg-mono-100" />
      <div className="h-10 w-full animate-pulse rounded-xl bg-mono-100" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12 sm:px-6">
      <div className="mb-5 h-12 w-12 animate-pulse rounded-2xl bg-mono-100" />
      <div className="mb-1 h-7 w-24 animate-pulse rounded bg-mono-100" />
      <div className="h-4 w-56 animate-pulse rounded bg-mono-100" />
      <div className="mt-6 rounded-2xl border border-mono-200 dark:border-mono-700 bg-surface p-5 shadow-sm space-y-4">
        <InputSkeleton />
        <InputSkeleton />
        <div className="h-10 w-full animate-pulse rounded-xl bg-mono-100" />
      </div>
      <div className="mt-4 flex justify-center">
        <div className="h-4 w-36 animate-pulse rounded bg-mono-100" />
      </div>
    </div>
  );
}
