"use client";

import type { ReactNode } from "react";

import Layout from "@/components/Layout";
import ScrollToTop from "@/components/ScrollToTop";
import { CartProvider } from "@/store/CartContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <ScrollToTop />
      <Layout>{children}</Layout>
    </CartProvider>
  );
}

