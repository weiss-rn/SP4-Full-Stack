'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Star, ShoppingCart, Check, Minus, Plus, LogIn } from 'lucide-react';
import { useCart } from '../store/CartContext';
import { useToast } from '@/store/ToastContext';
import { useT, useLocale } from '@/store/LocaleContext';
import { formatPrice } from '@/utils/currency';
import ProductCard from '../components/ProductCard';
import ProductReviews from '../components/ProductReviews';
import type { Product } from '@/data/products';

export default function ProductPage({
  product,
  related,
}: {
  product: Product | null;
  related: Product[];
}) {
  const { addItem, isLoggedIn, items } = useCart();
  const { showToast } = useToast();
  const t = useT();
  const { locale } = useLocale();

  const cartQty = items.find(i => i.product.id === product?.id)?.quantity ?? 0;
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="px-4 sm:px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-mono-900">{t('product.notFound')}</h1>
        <Link href="/products" className="text-sm text-mono-600 hover:underline mt-2 inline-block">
          ← {t('product.backToParts')}
        </Link>
      </div>
    );
  }

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    showToast(`${qty} ${product.name} added to cart.`, { type: 'success' });
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="px-4 sm:px-6 py-8">
      <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-mono-500 hover:text-mono-900 mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> {t('product.backToParts')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="bg-surface border border-mono-200 dark:border-mono-700 squircle-lg aspect-square flex items-center justify-center relative overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            <div className="text-center">
              <div className="text-7xl mb-3 opacity-20">⚙️</div>
              <span className="text-xs text-mono-400 font-medium uppercase tracking-wider">{product.category}</span>
            </div>
          )}
          {product.badge && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-mono-900 dark:bg-mono-100 dark:text-mono-900 text-white text-xs font-bold uppercase tracking-wider squircle-sm">
              {product.badge}
            </span>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="text-xs text-mono-500 font-medium uppercase tracking-wider mb-1">
            <Link href={`/category/${product.categorySlug}`} className="hover:text-mono-900 transition-colors">
              {product.category}
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-mono-900 leading-tight">{product.name}</h1>

          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? 'fill-mono-700 dark:fill-mono-300 text-mono-700 dark:text-mono-300' : 'fill-mono-200 dark:fill-mono-700 text-mono-200 dark:text-mono-700'}`}
                />
              ))}
            </div>
            <span className="text-xs text-mono-500">{product.rating} ({product.reviews} reviews)</span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-mono-900">{formatPrice(product.price, locale)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-mono-400 line-through">{formatPrice(product.originalPrice!, locale)}</span>
                <span className="px-2 py-0.5 bg-mono-200 dark:bg-mono-700 text-mono-700 dark:text-mono-300 text-xs font-bold squircle-sm">-{discountPct}%</span>
              </>
            )}
          </div>

          <p className="mt-4 text-sm text-mono-600 leading-relaxed">{product.description}</p>

          {/* Specs */}
          <div className="mt-5">
            <h3 className="text-xs font-semibold text-mono-900 uppercase tracking-wider mb-2">{t('product.specifications')}</h3>
            <ul className="space-y-1.5">
              {product.specs.map((spec, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-mono-600 dark:text-mono-400">
                  <Check className="w-3.5 h-3.5 text-mono-400 dark:text-mono-500 shrink-0" />
                  {spec}
                </li>
              ))}
            </ul>
          </div>

          {/* Stock status */}
          <div className="mt-5 flex items-center gap-3">
            {product.inStock ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-mono-700 dark:text-mono-300">
                <span className="w-2 h-2 bg-mono-700 dark:bg-mono-300 rounded-full" /> {t('product.inStock')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-mono-400 dark:text-mono-500">
                <span className="w-2 h-2 bg-mono-300 dark:bg-mono-600 rounded-full" /> {t('product.outOfStock')}
              </span>
            )}
            {cartQty > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 text-[11px] font-semibold text-purple-700 dark:text-purple-400">
                <ShoppingCart className="h-3 w-3" />
                {cartQty} in cart
              </span>
            )}
          </div>

          {/* Add to cart — requires login */}
          {product.inStock && isLoggedIn && (
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center border border-mono-200 dark:border-mono-700 squircle overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-mono-500 dark:text-mono-400 hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-semibold text-mono-900">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-9 h-9 flex items-center justify-center text-mono-500 dark:text-mono-400 hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={handleAdd}
                className={`flex-1 h-10 flex items-center justify-center gap-2 text-sm font-semibold squircle transition-all active:scale-[0.98] ${
                  added
                    ? 'bg-mono-700 text-white'
                    : 'bg-mono-900 text-white hover:bg-mono-800'
                }`}
              >
                {added ? (
                  <><Check className="w-4 h-4" /> {t('product.addedToCart')}</>
                ) : (
                  <><ShoppingCart className="w-4 h-4" /> {t('product.addToCart')}</>
                )}
              </button>
            </div>
          )}
          {product.inStock && !isLoggedIn && (
            <div className="mt-6">
              <Link
                href={`/login?redirect=${encodeURIComponent('/product/' + product.id)}`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-mono-300 dark:bg-mono-600 px-5 text-sm font-semibold text-mono-600 dark:text-mono-300 transition hover:bg-mono-400 dark:hover:bg-mono-500 hover:text-mono-800 dark:hover:text-mono-100"
              >
                <LogIn className="w-4 h-4" />
                Sign in to purchase
              </Link>
            </div>
          )}

          {/* SKU */}
          <div className="mt-4 text-[11px] text-mono-400 font-mono">
            {t('product.sku')}: {product.id.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <ProductReviews productId={product.id} />

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-lg font-bold text-mono-900 mb-4">{t('product.relatedProducts', { category: product.category })}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
