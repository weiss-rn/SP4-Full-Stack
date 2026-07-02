"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CheckCircle, Info, X, XCircle } from "lucide-react";

import { cn } from "@/utils/cn";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ShowToastOptions {
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, options?: ShowToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const toastStyles: Record<ToastType, string> = {
  success: "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-300",
  error: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-300",
  info: "border-mono-200 dark:border-mono-700 bg-surface text-mono-900",
};

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextIdRef = useRef(1);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, options: ShowToastOptions = {}) => {
      const id = nextIdRef.current;
      nextIdRef.current += 1;

      setToasts((current) => [
        ...current.slice(-2),
        { id, message, type: options.type ?? "info" },
      ]);

      window.setTimeout(() => {
        dismissToast(id);
      }, options.duration ?? 3200);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-3 bottom-3 z-[80] flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:w-[360px]"
      >
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.type];

          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg shadow-mono-900/10",
                toastStyles[toast.type]
              )}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="min-w-0 flex-1 leading-5">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-current/70 transition hover:bg-black/5 hover:text-current"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
