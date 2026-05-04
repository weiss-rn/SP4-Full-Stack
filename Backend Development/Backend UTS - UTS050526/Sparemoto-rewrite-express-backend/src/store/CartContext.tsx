'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Product } from '@/data/products';
import { getDiscountRate, roundCurrency } from '@/lib/commerce';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  discountCode: string;
  applyDiscount: (code: string) => boolean;
  removeDiscount: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountRate, setDiscountRate] = useState(0);

  const addItem = useCallback((product: Product, qty = 1) => {
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
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.product.id !== productId));
    } else {
      setItems(prev =>
        prev.map(i =>
          i.product.id === productId ? { ...i, quantity } : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscountCode('');
    setDiscountRate(0);
  }, []);

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
        totalItems, subtotal, discount, discountCode, applyDiscount, removeDiscount, total,
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
