export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="rounded-[2rem] border border-mono-200 dark:border-mono-700 bg-surface p-5 shadow-sm sm:p-8">
        <div className="mb-6 h-12 w-12 animate-pulse rounded-2xl bg-mono-100" />
        <div className="mb-3 h-8 w-72 max-w-full animate-pulse rounded bg-mono-100" />
        <div className="mb-8 h-4 w-96 max-w-full animate-pulse rounded bg-mono-100" />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="h-[460px] animate-pulse rounded-2xl bg-mono-100" />
          <div className="h-[460px] animate-pulse rounded-2xl bg-mono-100" />
        </div>
      </div>
    </div>
  );
}
