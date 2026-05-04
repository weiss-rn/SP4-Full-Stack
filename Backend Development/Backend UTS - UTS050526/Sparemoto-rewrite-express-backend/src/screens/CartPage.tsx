'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingCart, Tag, X, ArrowRight } from 'lucide-react';
import { useCart } from '../store/CartContext';

export default function CartPage() {
  const {
    items, removeItem, updateQuantity, clearCart,
    subtotal, discount, discountCode, applyDiscount, removeDiscount, total, totalItems
  } = useCart();

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState(false);

  const handleApplyCode = () => {
    setCodeError('');
    setCodeSuccess(false);
    if (!code.trim()) return;
    const success = applyDiscount(code);
    if (success) {
      setCodeSuccess(true);
      setCode('');
    } else {
      setCodeError('Invalid discount code');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-16 h-16 bg-mono-100 squircle mx-auto flex items-center justify-center mb-4">
          <ShoppingCart className="w-7 h-7 text-mono-400" />
        </div>
        <h1 className="text-xl font-bold text-mono-900">Your Cart is Empty</h1>
        <p className="text-sm text-mono-500 mt-1 mb-6">Add some parts to get started</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-mono-900 text-white text-sm font-semibold squircle hover:bg-mono-800 transition-colors"
        >
          Browse Parts <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-mono-900">Shopping Cart</h1>
          <p className="text-sm text-mono-500 mt-0.5">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-mono-500 hover:text-mono-900 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="bg-white border border-mono-200 squircle p-4 flex gap-4">
              {/* Image placeholder */}
              <Link href={`/product/${product.id}`} className="w-20 h-20 bg-mono-100 squircle-sm flex items-center justify-center shrink-0">
                <span className="text-2xl opacity-30">⚙️</span>
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/product/${product.id}`} className="text-sm font-semibold text-mono-900 hover:underline line-clamp-1">
                      {product.name}
                    </Link>
                    <div className="text-xs text-mono-500 mt-0.5">{product.category}</div>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="w-7 h-7 flex items-center justify-center text-mono-400 hover:text-mono-900 hover:bg-mono-100 squircle-sm transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-end justify-between mt-3">
                  <div className="flex items-center border border-mono-200 squircle-sm overflow-hidden">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-mono-500 hover:bg-mono-100 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-mono-900">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-mono-500 hover:bg-mono-100 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-mono-900">${(product.price * quantity).toFixed(2)}</div>
                    {quantity > 1 && (
                      <div className="text-[11px] text-mono-400">${product.price.toFixed(2)} each</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-mono-200 squircle p-5 sticky top-20">
            <h2 className="text-base font-bold text-mono-900 mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-mono-600">
                <span>Subtotal</span>
                <span className="font-medium text-mono-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-mono-600">
                <span>Shipping</span>
                <span className="font-medium text-mono-900">{subtotal >= 200 ? 'Free' : '$14.99'}</span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-mono-700">
                  <span className="flex items-center gap-1">
                    Discount
                    <span className="px-1.5 py-0.5 bg-mono-100 text-[10px] font-bold squircle-sm">{discountCode}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">-${discount.toFixed(2)}</span>
                    <button onClick={removeDiscount} className="text-mono-400 hover:text-mono-900">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t border-mono-200 pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-mono-900">Total</span>
                <span className="text-lg font-extrabold text-mono-900">
                  ${(total + (subtotal >= 200 ? 0 : 14.99)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Discount code */}
            {!discountCode && (
              <div className="mt-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-mono-400" />
                    <input
                      type="text"
                      placeholder="Discount code"
                      value={code}
                      onChange={e => { setCode(e.target.value); setCodeError(''); setCodeSuccess(false); }}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCode()}
                      className="w-full pl-8 pr-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-xs text-mono-900 placeholder:text-mono-400 focus:outline-none focus:border-mono-400"
                    />
                  </div>
                  <button
                    onClick={handleApplyCode}
                    className="px-3 py-2 bg-mono-900 text-white text-xs font-semibold squircle-sm hover:bg-mono-800 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {codeError && <p className="text-[11px] text-mono-500 mt-1">{codeError}</p>}
                {codeSuccess && <p className="text-[11px] text-mono-600 mt-1 font-medium">Code applied!</p>}
              </div>
            )}

            <Link
              href="/checkout"
              className="mt-4 w-full h-10 flex items-center justify-center gap-2 bg-mono-900 text-white text-sm font-semibold squircle hover:bg-mono-800 transition-colors"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-[10px] text-mono-400 text-center mt-3">
              This is a demo store. No real payment will be processed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
