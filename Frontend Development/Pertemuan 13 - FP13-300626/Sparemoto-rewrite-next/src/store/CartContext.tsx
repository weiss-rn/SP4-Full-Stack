'use client';

import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Product } from '@/data/products';
import { products as seedProducts } from '@/data/products';
import { getDiscountRate, roundCurrency } from '@/lib/commerce';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => Promise<{ success: boolean; error?: string }>;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => Promise<{ success: boolean; error?: string }>;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  discountCode: string;
  applyDiscount: (code: string) => boolean;
  removeDiscount: () => void;
  total: number;
  isLoggedIn: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

function findProduct(productId: string): Product | undefined {
  return seedProducts.find((p) => p.id === productId);
}

function getAvailableStock(product: Product, currentCartQty: number): number {
  const physicalStock = Math.max(0, Math.floor(product.stockCount ?? 0));
  return Math.max(0, physicalStock - currentCartQty);
}

async function fetchServerCart(): Promise<Array<{ productId: string; quantity: number }>> {
  try {
    const res = await fetch('/api/cart', { credentials: 'same-origin' });
    const data = (await res.json()) as { items?: Array<{ product_id: string; quantity: number }> };
    if (!Array.isArray(data.items)) return [];
    return data.items.map((i) => ({ productId: i.product_id, quantity: i.quantity }));
  } catch {
    return [];
  }
}

async function fetchCurrentUser(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
    const data = (await res.json()) as { user?: unknown };
    return Boolean(data.user);
  } catch {
    return false;
  }
}

async function syncAddToServer(productId: string, quantity: number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/cart', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      return { success: false, error: data.error || 'Failed to add to cart' };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

async function syncUpdateOnServer(productId: string, quantity: number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/cart/' + encodeURIComponent(productId), {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      return { success: false, error: data.error || 'Failed to update cart' };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

async function syncRemoveOnServer(productId: string) {
  try {
    await fetch('/api/cart/' + encodeURIComponent(productId), {
      method: 'DELETE',
      credentials: 'same-origin',
    });
  } catch { /* best effort */ }
}

async function syncClearOnServer() {
  try {
    await fetch('/api/cart', {
      method: 'DELETE',
      credentials: 'same-origin',
    });
  } catch { /* best effort */ }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountRate, setDiscountRate] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const loadedRef = useRef(false);

  // Check login status and load server cart on mount
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    async function init() {
      try {
        const loggedIn = await fetchCurrentUser();
        setIsLoggedIn(loggedIn);

        if (loggedIn) {
          const serverItems = await fetchServerCart();
          const hydrated: CartItem[] = [];
          for (const si of serverItems) {
            const product = findProduct(si.productId);
            if (product) {
              hydrated.push({ product, quantity: si.quantity });
            }
          }
          setItems(hydrated);
        }
      } catch {
        // Not logged in — cart stays empty
      }
    }
    init();
  }, []);

  const addItem = useCallback(async (product: Product, qty = 1): Promise<{ success: boolean; error?: string }> => {
    if (!isLoggedIn) return { success: false, error: 'Please sign in to add items to cart' };

    const existing = items.find(i => i.product.id === product.id);
    const currentQty = existing?.quantity ?? 0;
    const available = getAvailableStock(product, currentQty);

    if (qty > available) {
      return {
        success: false,
        error: `Only ${available} unit${available === 1 ? '' : 's'} available. You already have ${currentQty} in your cart.`
      };
    }

    const result = await syncAddToServer(product.id, qty);
    if (!result.success) {
      return result;
    }

    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { product, quantity: qty }];
    });

    return { success: true };
  }, [isLoggedIn, items]);

  const removeItem = useCallback((productId: string) => {
    if (!isLoggedIn) return;
    syncRemoveOnServer(productId);
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, [isLoggedIn]);

  const updateQuantity = useCallback(async (productId: string, quantity: number): Promise<{ success: boolean; error?: string }> => {
    if (!isLoggedIn) return { success: false, error: 'Please sign in to update cart' };

    const existing = items.find(i => i.product.id === productId);
    if (!existing) return { success: false, error: 'Item not in cart' };

    if (quantity <= 0) {
      const result = await syncUpdateOnServer(productId, 0);
      if (!result.success) return result;
      setItems(prev => prev.filter(i => i.product.id !== productId));
      return { success: true };
    }

    const available = getAvailableStock(existing.product, 0);
    if (quantity > available) {
      return {
        success: false,
        error: `Only ${available} unit${available === 1 ? '' : 's'} available.`
      };
    }

    const result = await syncUpdateOnServer(productId, quantity);
    if (!result.success) {
      return result;
    }

    setItems(prev =>
      prev.map(i =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );

    return { success: true };
  }, [isLoggedIn, items]);

  const clearCart = useCallback(() => {
    if (!isLoggedIn) return;
    syncClearOnServer();
    setItems([]);
    setDiscountCode('');
    setDiscountRate(0);
  }, [isLoggedIn]);

  const applyDiscount = useCallback((code: string): boolean => {
    const upper = code.toUpperCase().trim();
    if (getDiscountRate(upper) > 0) {
      setDiscountCode(upper);
      setDiscountRate(getDiscountRate(upper));
      return true;
    }
    return false;
  }, []);

  const removeDiscount = useCallback(() => {
    setDiscountCode('');
    setDiscountRate(0);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = roundCurrency(items.reduce((sum, i) => sum + i.product.price * i.quantity, 0));
  const discount = roundCurrency(subtotal * discountRate);
  const total = roundCurrency(subtotal - discount);

  return (
    <CartContext.Provider
      value={{
        items, addItem, removeItem, updateQuantity, clearCart,
        totalItems, subtotal, discount, discountCode, applyDiscount, removeDiscount, total, isLoggedIn,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
