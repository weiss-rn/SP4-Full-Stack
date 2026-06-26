'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Minus, Plus, ShoppingCart, Tag, X, ArrowRight } from 'lucide-react';
import { useCart } from '../store/CartContext';
import { useToast } from '@/store/ToastContext';
import { useT, useLocale } from '@/store/LocaleContext';
import { formatPrice } from '@/utils/currency';

export default function CartPage() {
  const {
    items, removeItem, updateQuantity, clearCart,
    subtotal, discount, discountCode, applyDiscount, removeDiscount, total, totalItems, isLoggedIn
  } = useCart();
  const { showToast } = useToast();
  const t = useT();
  const { locale } = useLocale();

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState(false);

  const handleUpdateQty = async (productId: string, newQty: number) => {
    const result = await updateQuantity(productId, newQty);
    if (!result.success && result.error) {
      showToast(result.error, { type: 'error' });
    }
  };

  const handleApplyCode = () => {
    setCodeError('');
    setCodeSuccess(false);
    if (!code.trim()) return;
    const success = applyDiscount(code);
    if (success) {
      setCodeSuccess(true);
      setCode('');
      showToast(t('cart.codeApplied'), { type: 'success' });
    } else {
      setCodeError(t('cart.invalidCode'));
      showToast(t('cart.invalidCode'), { type: 'error' });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="px-4 sm:px-6 py-12 sm:py-16 text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-mono-100 squircle mx-auto flex items-center justify-center mb-4">
          <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 text-mono-400" />
        </div>
        <h1 className="text-xl font-bold text-mono-900">Sign in to use the cart</h1>
        <p className="text-sm text-mono-500 mt-1 mb-6">Create an account or sign in to add items to your cart.</p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-mono-900 text-white text-sm font-semibold squircle hover:bg-mono-800 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface border border-mono-200 text-mono-700 text-sm font-semibold squircle hover:bg-mono-50 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-4 sm:px-6 py-12 sm:py-16 text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-mono-100 squircle mx-auto flex items-center justify-center mb-4">
          <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 text-mono-400" />
        </div>
        <h1 className="text-xl font-bold text-mono-900">{t('cart.empty')}</h1>
        <p className="text-sm text-mono-500 mt-1 mb-6">{t('cart.emptyDesc')}</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-mono-900 text-white text-sm font-semibold squircle hover:bg-mono-800 transition-colors"
        >
          {t('cart.browseParts')} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-mono-900">{t('cart.title')}</h1>
          <p className="text-sm text-mono-500 mt-0.5">{t('cart.items', { count: totalItems })}</p>
        </div>
        <button
          onClick={() => {
            clearCart();
            showToast('Cart cleared.', { type: 'info' });
          }}
          className="text-xs text-mono-500 hover:text-mono-900 transition-colors px-2 py-1 -mr-2"
        >
          {t('cart.clearAll')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="bg-surface border border-mono-200 dark:border-mono-700 squircle p-3 sm:p-4 flex gap-3 sm:gap-4">
              <Link
                href={`/product/${product.id}`}
                className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center overflow-hidden bg-mono-100 squircle-sm"
              >
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                    loading="lazy"
                    unoptimized
                  />
                ) : (
                  <span className="text-xl sm:text-2xl opacity-30">⚙️</span>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/product/${product.id}`} className="text-sm font-semibold text-mono-900 hover:underline line-clamp-1">
                      {product.name}
                    </Link>
                    <div className="text-xs text-mono-500 mt-0.5">{product.category}</div>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="w-9 h-9 flex items-center justify-center text-mono-400 hover:text-red-600 hover:bg-red-50 squircle-sm transition-colors shrink-0 -mr-1"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-end justify-between mt-2 sm:mt-3">
                  <div className="flex items-center border border-mono-200 squircle-sm overflow-hidden">
                    <button
                      onClick={() => handleUpdateQty(product.id, quantity - 1)}
                      className="w-9 h-9 flex items-center justify-center text-mono-500 hover:bg-mono-100 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-xs font-semibold text-mono-900">{quantity}</span>
                    <button
                      onClick={() => handleUpdateQty(product.id, quantity + 1)}
                      className="w-9 h-9 flex items-center justify-center text-mono-500 hover:bg-mono-100 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-mono-900">{formatPrice(product.price * quantity, locale)}</div>
                    {quantity > 1 && (
                      <div className="text-[11px] text-mono-400">{formatPrice(product.price, locale)} {t('cart.each')}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-mono-200 dark:border-mono-700 squircle p-4 sm:p-5 lg:sticky lg:top-20">
            <h2 className="text-base font-bold text-mono-900 mb-4">{t('cart.orderSummary')}</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-mono-600">
                <span>{t('cart.subtotal')}</span>
                <span className="font-medium text-mono-900">{formatPrice(subtotal, locale)}</span>
              </div>
              <div className="flex justify-between text-mono-600">
                <span>{t('cart.shipping')}</span>
                <span className="font-medium text-mono-900">{subtotal >= 200 ? t('cart.free') : formatPrice(14.99, locale)}</span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-mono-700">
                  <span className="flex items-center gap-1">
                    {t('cart.discount')}
                    <span className="px-1.5 py-0.5 bg-mono-100 text-[10px] font-bold squircle-sm">{discountCode}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">-{formatPrice(discount, locale)}</span>
                    <button onClick={removeDiscount} className="w-7 h-7 flex items-center justify-center text-mono-400 hover:text-mono-900 hover:bg-mono-100 squircle-sm transition-colors" aria-label="Remove discount">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t border-mono-200 pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-mono-900">{t('cart.total')}</span>
                <span className="text-lg font-extrabold text-mono-900">
                  {formatPrice(total + (subtotal >= 200 ? 0 : 14.99), locale)}
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
                      placeholder={t('cart.discountPlaceholder')}
                      value={code}
                      onChange={e => { setCode(e.target.value); setCodeError(''); setCodeSuccess(false); }}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCode()}
                      className="w-full pl-8 pr-3 py-2.5 sm:py-2 bg-surface border border-mono-200 dark:border-mono-700 squircle-sm text-xs text-mono-900 placeholder:text-mono-400 focus:outline-none focus:border-mono-400"
                    />
                  </div>
                  <button
                    onClick={handleApplyCode}
                    className="px-3 py-2.5 sm:py-2 bg-mono-900 text-white text-xs font-semibold squircle-sm hover:bg-mono-800 transition-colors shrink-0"
                  >
                    {t('cart.apply')}
                  </button>
                </div>
                {codeError && <p className="text-[11px] text-mono-500 mt-1">{codeError}</p>}
                {codeSuccess && <p className="text-[11px] text-mono-600 mt-1 font-medium">{t('cart.codeApplied')}</p>}
              </div>
            )}

            <Link
              href="/checkout"
              className="mt-4 w-full h-11 sm:h-10 flex items-center justify-center gap-2 bg-mono-900 text-white text-sm font-semibold squircle hover:bg-mono-800 transition-colors"
            >
              {t('cart.proceedCheckout')} <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-[10px] text-mono-400 text-center mt-3">
              {t('cart.demoNotice')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
