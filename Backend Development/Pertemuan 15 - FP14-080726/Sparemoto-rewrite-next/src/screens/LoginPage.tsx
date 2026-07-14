"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { useToast } from "@/store/ToastContext";
import { useT } from "@/store/LocaleContext";

export default function LoginPage() {
  const { showToast } = useToast();
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Show a toast when redirected from a purchase attempt
  useEffect(() => {
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    if (!redirect) return;

    showToast(
      redirect.startsWith("/product/")
        ? "Please sign in to purchase this item."
        : "Please sign in to continue.",
      { type: "info" }
    );
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = (await response.json()) as { error?: string; user?: { email: string } };
      if (!response.ok || !data.user) throw new Error(data.error || "Login failed.");
      showToast("Welcome back, " + data.user.email + "!", { type: "success" });

      // Resolve redirect after login
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirect") || "/";
      window.location.href = redirectTo;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed.";
      setError(msg);
      showToast(msg, { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12 sm:px-6">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-mono-900 text-white">
        <Lock className="h-5 w-5" />
      </div>
      <h1 className="text-2xl font-bold text-mono-900">{t('auth.signInTitle')}</h1>
      <p className="mt-1 text-sm text-mono-500">{t('auth.signInDesc')}</p>
      <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-mono-200 dark:border-mono-700 bg-surface p-5 shadow-sm space-y-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-mono-500">{t("checkout.email")}</span>
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mono-400" />
            <input autoFocus required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface py-2.5 pl-10 pr-3 text-sm text-mono-900 outline-none transition focus:border-mono-900" />
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-mono-500">{t("admin.password")}</span>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3 py-2.5 text-sm text-mono-900 outline-none transition focus:border-mono-900" />
        </label>
        {error && <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-300">{error}</div>}
        <button disabled={submitting} type="submit"
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-mono-900 text-sm font-semibold text-white transition hover:bg-mono-800 disabled:opacity-60">
          <Lock className="h-4 w-4" />
          {submitting ? t("admin.signingIn") : t("admin.signIn")}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-mono-500">
        No account? <Link href="/register" className="font-semibold text-mono-900 hover:underline">Create one</Link>
      </p>
    </div>
  );
}
