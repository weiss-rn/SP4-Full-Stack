const fs = require("fs");
function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

// 1. LocaleContext
ensureDir("src/store");
fs.writeFileSync("src/store/LocaleContext.tsx", `"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { t as translate, type Locale, type TranslationKey } from "@/lib/i18n";

const LOCALE_COOKIE = "motoparts.locale";
const LOCALE_KEY = "motoparts.locale.v1";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

function readStorageLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(LOCALE_KEY);
    if (stored === "id" || stored === "en") return stored;
  } catch { /* ignore */ }
  const match = document.cookie.match(new RegExp("(?:^|; )" + LOCALE_COOKIE + "=([^;]*)"));
  const value = match?.[1];
  return value === "id" ? "id" : "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => { setLocaleState(readStorageLocale()); }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try { window.localStorage.setItem(LOCALE_KEY, next); } catch { /* ignore */ }
    document.cookie = LOCALE_COOKIE + "=" + next + "; Path=/; Max-Age=31536000; SameSite=Lax";
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return { locale: ctx.locale, setLocale: ctx.setLocale };
}

export function useT() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useT must be used within LocaleProvider");
  return ctx.t;
}
`);
console.log("Created src/store/LocaleContext.tsx");

// 2. Currency utility
ensureDir("src/utils");
fs.writeFileSync("src/utils/currency.ts", `import type { Locale } from "@/lib/i18n";

export const EXCHANGE_RATES: Record<string, number> = { USD: 1, IDR: 15800 };
export const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", IDR: "Rp" };

export function getCurrencyCode(locale: Locale): string {
  return locale === "id" ? "IDR" : "USD";
}

export function convertPrice(amountUsd: number, locale: Locale): number {
  const code = getCurrencyCode(locale);
  const rate = EXCHANGE_RATES[code] ?? 1;
  return Math.round(amountUsd * rate * 100) / 100;
}

export function formatPrice(amountUsd: number, locale: Locale): string {
  const code = getCurrencyCode(locale);
  const converted = convertPrice(amountUsd, locale);
  const symbol = CURRENCY_SYMBOLS[code] ?? "$";
  if (code === "IDR") {
    return symbol + converted.toLocaleString("id-ID", { maximumFractionDigits: 0 });
  }
  return symbol + converted.toFixed(2);
}
`);
console.log("Created src/utils/currency.ts");

// 3. Login/Register pages
ensureDir("src/app/login");
fs.writeFileSync("src/app/login/page.tsx", `import LoginPage from "@/screens/LoginPage";
export const dynamic = "force-dynamic";
export default function Page() { return <LoginPage />; }
`);

ensureDir("src/app/register");
fs.writeFileSync("src/app/register/page.tsx", `import RegisterPage from "@/screens/RegisterPage";
export const dynamic = "force-dynamic";
export default function Page() { return <RegisterPage />; }
`);
console.log("Created login/register pages");

// 4. LoginPage
fs.writeFileSync("src/screens/LoginPage.tsx", `"use client";

import { useState, type FormEvent } from "react";
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
      window.location.href = "/";
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
      <h1 className="text-2xl font-bold text-mono-900">Sign In</h1>
      <p className="mt-1 text-sm text-mono-500">Access your account to sync your cart across devices.</p>
      <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-mono-200 bg-white p-5 shadow-sm space-y-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-mono-500">{t("checkout.email")}</span>
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mono-400" />
            <input autoFocus required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full rounded-xl border border-mono-200 bg-mono-50 py-2.5 pl-10 pr-3 text-sm text-mono-900 outline-none transition focus:border-mono-900 focus:bg-white" />
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-mono-500">{t("admin.password")}</span>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-mono-200 bg-mono-50 px-3 py-2.5 text-sm text-mono-900 outline-none transition focus:border-mono-900 focus:bg-white" />
        </label>
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
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
`);
console.log("Created src/screens/LoginPage.tsx");

// 5. RegisterPage
fs.writeFileSync("src/screens/RegisterPage.tsx", `"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Lock, Mail, User } from "lucide-react";
import { useToast } from "@/store/ToastContext";
import { useT } from "@/store/LocaleContext";

export default function RegisterPage() {
  const { showToast } = useToast();
  const t = useT();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = (await response.json()) as { error?: string; user?: { email: string } };
      if (!response.ok || !data.user) throw new Error(data.error || "Registration failed.");
      showToast("Account created! Please sign in.", { type: "success" });
      window.location.href = "/login";
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      setError(msg);
      showToast(msg, { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12 sm:px-6">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-mono-900 text-white">
        <User className="h-5 w-5" />
      </div>
      <h1 className="text-2xl font-bold text-mono-900">Create Account</h1>
      <p className="mt-1 text-sm text-mono-500">Sign up to sync your cart across devices.</p>
      <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-mono-200 bg-white p-5 shadow-sm space-y-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-mono-500">Full Name</span>
          <div className="relative mt-2">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mono-400" />
            <input autoFocus required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
              className="w-full rounded-xl border border-mono-200 bg-mono-50 py-2.5 pl-10 pr-3 text-sm text-mono-900 outline-none transition focus:border-mono-900 focus:bg-white" />
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-mono-500">{t("checkout.email")}</span>
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mono-400" />
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full rounded-xl border border-mono-200 bg-mono-50 py-2.5 pl-10 pr-3 text-sm text-mono-900 outline-none transition focus:border-mono-900 focus:bg-white" />
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-mono-500">{t("admin.password")}</span>
          <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-mono-200 bg-mono-50 px-3 py-2.5 text-sm text-mono-900 outline-none transition focus:border-mono-900 focus:bg-white" />
        </label>
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <button disabled={submitting} type="submit"
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-mono-900 text-sm font-semibold text-white transition hover:bg-mono-800 disabled:opacity-60">
          <Lock className="h-4 w-4" />
          {submitting ? "Creating account..." : "Create Account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-mono-500">
        Already have an account? <Link href="/login" className="font-semibold text-mono-900 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
`);
console.log("Created src/screens/RegisterPage.tsx");

console.log("All foundation files generated!");
