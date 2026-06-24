"use client";

import { useState, type FormEvent } from "react";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to sign in.");
      }

      window.location.reload();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-mono-900 text-white">
        <Lock className="h-5 w-5" />
      </div>
      <h1 className="text-2xl font-bold text-mono-900">Admin Sign In</h1>
      <p className="mt-1 text-sm text-mono-500">Inventory tools require an admin session.</p>

      <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-mono-200 dark:border-mono-700 bg-surface p-5 shadow-sm">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-mono-500">Password</span>
          <input
            autoFocus
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3 py-2.5 text-sm text-mono-900 outline-none transition focus:border-mono-900"
          />
        </label>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          disabled={submitting}
          type="submit"
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-mono-900 text-sm font-semibold text-white transition hover:bg-mono-800 disabled:opacity-60"
        >
          <Lock className="h-4 w-4" />
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
