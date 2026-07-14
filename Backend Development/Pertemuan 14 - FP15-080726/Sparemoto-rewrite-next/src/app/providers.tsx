"use client";

import type { ReactNode } from "react";

import Layout from "@/components/Layout";
import ScrollToTop from "@/components/ScrollToTop";
import { CartProvider } from "@/store/CartContext";
import { LocaleProvider } from "@/store/LocaleContext";
import { ThemeProvider } from "@/store/ThemeContext";
import { ToastProvider } from "@/store/ToastContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <CartProvider>
          <ToastProvider>
            <ScrollToTop />
            <Layout>{children}</Layout>
          </ToastProvider>
        </CartProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
