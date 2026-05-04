'use client';

import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import type { Product } from '@/data/products';
import { useCart } from '../store/CartContext';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <div className="group bg-white border border-mono-200 squircle overflow-hidden flex flex-col hover:border-mono-400 transition-colors">
      {/* Image area */}
      <Link href={`/product/${product.id}`} className="relative block bg-mono-100 aspect-[4/3] overflow-hidden">
        {product.imageUrl || product.image ? (
          <img
            src={product.imageUrl || product.image}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
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
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="px-3 py-1 bg-mono-200 text-mono-600 text-xs font-semibold squircle-sm">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3">
        <Link href={`/product/${product.id}`} className="text-sm font-semibold text-mono-900 leading-tight hover:underline line-clamp-2">
          {product.name}
        </Link>

        <div className="flex items-center gap-1 mt-1.5">
          <Star className="w-3 h-3 fill-mono-700 text-mono-700" />
          <span className="text-xs text-mono-600 font-medium">{product.rating}</span>
          <span className="text-xs text-mono-400">({product.reviews})</span>
        </div>

        <div className="mt-auto pt-3 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-mono-900">${product.price.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-xs text-mono-400 line-through">${product.originalPrice!.toFixed(2)}</span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-[10px] font-semibold text-mono-600">Save {discountPct}%</span>
            )}
          </div>

          {product.inStock && (
            <button
              onClick={(e) => { e.preventDefault(); addItem(product); }}
              className="w-8 h-8 flex items-center justify-center bg-mono-900 text-white squircle-sm hover:bg-mono-700 transition-colors active:scale-95"
              title="Add to cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
