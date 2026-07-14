"use client";

import { RefreshCcw } from "lucide-react";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-mono-900 text-white">
        <RefreshCcw className="h-5 w-5" />
      </div>
      <h1 className="text-2xl font-bold text-mono-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-mono-500">The page failed to load cleanly. Try again from here.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-mono-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-mono-800"
      >
        <RefreshCcw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}
