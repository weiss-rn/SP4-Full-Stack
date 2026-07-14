'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star, LogIn } from 'lucide-react';
import type { Product } from '@/data/products';
import { useCart } from '../store/CartContext';
import { useToast } from '@/store/ToastContext';
import { useLocale } from '@/store/LocaleContext';
import { usePathname } from 'next/navigation';
import { formatPrice } from '@/utils/currency';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, isLoggedIn, items } = useCart();
  const { showToast } = useToast();
  const { locale } = useLocale();
  const pathname = usePathname();

  const cartQty = items.find(i => i.product.id === product.id)?.quantity ?? 0;

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <div className="group bg-surface border border-mono-200 dark:border-mono-700 squircle overflow-hidden flex flex-col hover:border-mono-400 dark:hover:border-mono-500 transition-colors">
      {/* Image area */}
      <Link href={`/product/${product.id}`} className="relative block bg-mono-100 dark:bg-mono-800 aspect-[4/3] overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="text-4xl mb-1 opacity-30 group-hover:opacity-50 transition-opacity">⚙️</div>
              <span className="text-[10px] text-mono-400 font-medium uppercase tracking-wider">{product.category}</span>
            </div>
          </div>
        )}
        {product.badge && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-mono-900 text-white text-[10px] font-bold uppercase tracking-wider squircle-sm">
            {product.badge}
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-surface/70 dark:bg-mono-900/70 flex items-center justify-center">
            <span className="px-3 py-1 bg-mono-200 dark:bg-mono-700 text-mono-600 dark:text-mono-300 text-xs font-semibold squircle-sm">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3">
        <Link href={`/product/${product.id}`} className="text-sm font-semibold text-mono-900 leading-tight hover:underline line-clamp-2">
          {product.name}
        </Link>

        <div className="flex items-center gap-1 mt-1.5">
          <Star className="w-3 h-3 fill-mono-700 dark:fill-mono-300 text-mono-700 dark:text-mono-300" />
          <span className="text-xs text-mono-600 dark:text-mono-400 font-medium">{product.rating}</span>
          <span className="text-xs text-mono-400 dark:text-mono-500">({product.reviews})</span>
        </div>

        {/* Cart badge */}
        {cartQty > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:text-purple-400">
              <ShoppingCart className="h-2.5 w-2.5" />
              {cartQty} in cart
            </span>
          </div>
        )}

        <div className="mt-auto pt-3 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-mono-900">{formatPrice(product.price, locale)}</span>
              {hasDiscount && (
                <span className="text-xs text-mono-400 line-through">{formatPrice(product.originalPrice!, locale)}</span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-[10px] font-semibold text-mono-600">Save {discountPct}%</span>
            )}
          </div>

          {product.inStock && isLoggedIn && (
            <button
              onClick={(e) => {
                e.preventDefault();
                addItem(product);
                showToast(`${product.name} added to cart.`, { type: 'success' });
              }}
              className="w-8 h-8 flex items-center justify-center bg-mono-900 text-white squircle-sm hover:bg-mono-700 transition-colors active:scale-95"
              title="Add to cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
          )}
          {product.inStock && !isLoggedIn && (
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="w-8 h-8 flex items-center justify-center bg-mono-300 dark:bg-mono-600 text-mono-500 dark:text-mono-300 squircle-sm hover:bg-mono-400 dark:hover:bg-mono-500 hover:text-mono-700 dark:hover:text-mono-100 transition-colors"
              title="Sign in to buy"
            >
              <LogIn className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
