export default function ProfileLoading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col px-4 py-8 sm:px-6">
      <div className="mb-6 animate-pulse">
        <div className="mb-3 h-12 w-12 rounded-2xl bg-mono-200" />
        <div className="mb-1 h-6 w-32 rounded-lg bg-mono-200" />
        <div className="h-4 w-56 rounded-lg bg-mono-100" />
      </div>
      <div className="mb-6 animate-pulse rounded-2xl border border-mono-200 dark:border-mono-700 bg-surface p-5 shadow-sm">
        <div className="mb-4 h-4 w-28 rounded-lg bg-mono-200" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="h-[70px] rounded-xl bg-mono-100" />
          <div className="h-[70px] rounded-xl bg-mono-100" />
          <div className="h-[70px] rounded-xl bg-mono-100" />
          <div className="h-[70px] rounded-xl bg-mono-100" />
        </div>
      </div>
      <div className="animate-pulse rounded-2xl border border-mono-200 dark:border-mono-700 bg-surface p-5 shadow-sm">
        <div className="mb-4 h-4 w-32 rounded-lg bg-mono-200" />
        <div className="h-24 rounded-xl bg-mono-100" />
      </div>
    </div>
  );
}
