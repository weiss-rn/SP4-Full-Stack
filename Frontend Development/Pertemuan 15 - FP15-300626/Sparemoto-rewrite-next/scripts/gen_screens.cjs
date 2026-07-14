const fs = require('fs');

// ========== CartPage.tsx ==========
fs.writeFileSync('src/screens/CartPage.tsx', `'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingCart, Tag, X, ArrowRight } from 'lucide-react';
import { useCart } from '../store/CartContext';
import { useToast } from '@/store/ToastContext';
import { useT, useLocale } from '@/store/LocaleContext';
import { formatPrice } from '@/utils/currency';

export default function CartPage() {
  const {
    items, removeItem, updateQuantity, clearCart,
    subtotal, discount, discountCode, applyDiscount, removeDiscount, total, totalItems
  } = useCart();
  const { showToast } = useToast();
  const t = useT();
  const { locale } = useLocale();

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
      showToast(t('cart.codeApplied'), { type: 'success' });
    } else {
      setCodeError(t('cart.invalidCode'));
      showToast(t('cart.invalidCode'), { type: 'error' });
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
            <div key={product.id} className="bg-white border border-mono-200 squircle p-3 sm:p-4 flex gap-3 sm:gap-4">
              <Link
                href={\`/product/\${product.id}\`}
                className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center overflow-hidden bg-mono-100 squircle-sm"
              >
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl sm:text-2xl opacity-30">⚙️</span>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={\`/product/\${product.id}\`} className="text-sm font-semibold text-mono-900 hover:underline line-clamp-1">
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
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-9 h-9 flex items-center justify-center text-mono-500 hover:bg-mono-100 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-xs font-semibold text-mono-900">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
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
          <div className="bg-white border border-mono-200 squircle p-4 sm:p-5 lg:sticky lg:top-20">
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
                      className="w-full pl-8 pr-3 py-2.5 sm:py-2 bg-mono-50 border border-mono-200 squircle-sm text-xs text-mono-900 placeholder:text-mono-400 focus:outline-none focus:border-mono-400"
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
`);

// ========== ProductsPage.tsx ==========
fs.writeFileSync('src/screens/ProductsPage.tsx', `'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import type { Category, Product } from '@/data/products';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useT } from '@/store/LocaleContext';

const PRODUCTS_PER_PAGE = 12;
const sortOptions = ['name', 'price-low', 'price-high', 'rating'] as const;
type SortBy = (typeof sortOptions)[number];

function normalizeSort(value: string | null): SortBy {
  return sortOptions.includes(value as SortBy) ? (value as SortBy) : 'name';
}

function normalizePage(value: string | null) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export default function ProductsPage({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const t = useT();
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') ?? 'all');
  const [sortBy, setSortBy] = useState<SortBy>(() => normalizeSort(searchParams.get('sort')));
  const [currentPage, setCurrentPage] = useState(() => normalizePage(searchParams.get('page')));
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebouncedValue(search.trim(), 250);

  useEffect(() => {
    const params = new URLSearchParams(searchParamsString);
    const nextSearch = params.get('q') ?? '';
    const nextCategory = params.get('category') ?? 'all';
    const nextSort = normalizeSort(params.get('sort'));
    const nextPage = normalizePage(params.get('page'));

    setSearch((value) => (value === nextSearch ? value : nextSearch));
    setSelectedCategory((value) => (value === nextCategory ? value : nextCategory));
    setSortBy((value) => (value === nextSort ? value : nextSort));
    setCurrentPage((value) => (value === nextPage ? value : nextPage));
  }, [searchParamsString]);

  useEffect(() => {
    const params = new URLSearchParams(searchParamsString);

    if (debouncedSearch) {
      params.set('q', debouncedSearch);
    } else {
      params.delete('q');
    }

    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }

    if (sortBy !== 'name') {
      params.set('sort', sortBy);
    } else {
      params.delete('sort');
    }

    if (currentPage > 1) {
      params.set('page', String(currentPage));
    } else {
      params.delete('page');
    }

    const nextQuery = params.toString();
    const nextHref = nextQuery ? \`\${pathname}?\${nextQuery}\` : pathname;
    const currentHref = searchParamsString ? \`\${pathname}?\${searchParamsString}\` : pathname;

    if (nextHref !== currentHref) {
      router.replace(nextHref, { scroll: false });
    }
  }, [currentPage, debouncedSearch, pathname, router, searchParamsString, selectedCategory, sortBy]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.categorySlug === selectedCategory);
    }

    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      default: result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [debouncedSearch, products, selectedCategory, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const visibleProducts = filtered.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const updateCategory = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setCurrentPage(1);
  };

  const updateSort = (value: string) => {
    setSortBy(normalizeSort(value));
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mono-900">{t('products.title')}</h1>
        <p className="text-sm text-mono-500 mt-0.5">{t('products.productsFound', { count: filtered.length })}</p>
      </div>

      {/* Search & filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mono-400" />
          <input
            type="text"
            placeholder={t('products.searchPlaceholder')}
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-white border border-mono-200 squircle text-sm text-mono-900 placeholder:text-mono-400 focus:outline-none focus:border-mono-400"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden flex items-center justify-center gap-2 px-4 py-2 bg-white border border-mono-200 squircle text-sm font-medium text-mono-700"
        >
          <SlidersHorizontal className="w-4 h-4" /> {t('products.filters')}
        </button>
        <div className={\`\${showFilters ? 'flex' : 'hidden'} sm:flex gap-3\`}>
          <select
            value={selectedCategory}
            onChange={e => updateCategory(e.target.value)}
            className="px-3 py-2 bg-white border border-mono-200 squircle text-sm text-mono-700 focus:outline-none focus:border-mono-400 appearance-none cursor-pointer"
          >
            <option value="all">{t('products.allCategories')}</option>
            {categories.map(c => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={e => updateSort(e.target.value)}
            className="px-3 py-2 bg-white border border-mono-200 squircle text-sm text-mono-700 focus:outline-none focus:border-mono-400 appearance-none cursor-pointer"
          >
            <option value="name">{t('products.sortName')}</option>
            <option value="price-low">{t('products.sortPriceLow')}</option>
            <option value="price-high">{t('products.sortPriceHigh')}</option>
            <option value="rating">{t('products.sortRating')}</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-mono-500 text-sm">{t('products.noResults')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {visibleProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-mono-500">
                {t('products.page')} <span className="font-semibold text-mono-900">{page}</span> {t('products.of')}{' '}
                <span className="font-semibold text-mono-900">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-mono-200 bg-white px-3 text-sm font-medium text-mono-700 transition hover:border-mono-900 hover:text-mono-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('products.previous')}
                </button>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-mono-200 bg-white px-3 text-sm font-medium text-mono-700 transition hover:border-mono-900 hover:text-mono-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('products.next')}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
`);

// ========== CheckoutPage.tsx ==========
fs.writeFileSync('src/screens/CheckoutPage.tsx', `'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Check, Package } from 'lucide-react';

import { getShippingFee } from '@/lib/commerce';
import { useCart } from '../store/CartContext';
import { useToast } from '@/store/ToastContext';
import { useT, useLocale } from '@/store/LocaleContext';
import { formatPrice } from '@/utils/currency';
import type { DemoOrderInput, DemoOrderReceipt } from '@/types/demo-orders';

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

export default function CheckoutPage() {
  const { items, subtotal, discount, discountCode, total, clearCart, totalItems } = useCart();
  const { showToast } = useToast();
  const t = useT();
  const { locale } = useLocale();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [receipt, setReceipt] = useState<DemoOrderReceipt | null>(null);
  const shipping = getShippingFee(subtotal);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    const form = new FormData(event.currentTarget);
    const payload: DemoOrderInput = {
      customer: {
        firstName: String(form.get('firstName') ?? '').trim(),
        lastName: String(form.get('lastName') ?? '').trim(),
        email: String(form.get('email') ?? '').trim(),
        phone: String(form.get('phone') ?? '').trim(),
        addressLine1: String(form.get('addressLine1') ?? '').trim(),
        addressLine2: String(form.get('addressLine2') ?? '').trim(),
        city: String(form.get('city') ?? '').trim(),
        state: String(form.get('state') ?? '').trim(),
        postalCode: String(form.get('postalCode') ?? '').trim(),
        country: String(form.get('country') ?? '').trim(),
      },
      items: items.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      })),
      discountCode: discountCode || null,
    };

    try {
      const response = await fetch('/api/demo-orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string; order?: DemoOrderReceipt };
      if (!response.ok || !data.order) {
        throw new Error(data.error || 'Unable to place demo order.');
      }

      setReceipt(data.order);
      clearCart();
      showToast(t('checkout.orderRecorded'), { type: 'success' });
    } catch (submitError) {
      const nextError = submitError instanceof Error ? submitError.message : 'Unable to place demo order.';
      setErrorMessage(nextError);
      showToast(nextError, { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (receipt) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-16 h-16 bg-mono-900 squircle mx-auto flex items-center justify-center mb-4">
          <Check className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-mono-900">{t('checkout.orderRecorded')}</h1>
        <p className="text-sm text-mono-500 mt-2 mb-1">{receipt.orderNumber}</p>
        <p className="text-xs text-mono-400 mb-6">
          {t('checkout.orderLogged', { time: formatTimestamp(receipt.createdAt) })}
        </p>

        <div className="bg-white border border-mono-200 squircle p-5 text-left mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-mono-500" />
            <span className="text-sm font-semibold text-mono-900">{t('orders.items')}</span>
          </div>
          <div className="space-y-2 text-xs text-mono-600">
            {receipt.items.map((item) => (
              <div key={item.productId} className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-mono-900">{item.productName}</p>
                  <p>{item.category} · Qty {item.quantity} · Remaining stock {item.remainingStock}</p>
                </div>
                <span className="shrink-0 font-semibold text-mono-900">{formatPrice(item.lineTotal, locale)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-mono-200 squircle p-5 text-left mb-6">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-mono-600">
              <span>Customer</span>
              <span className="font-medium text-mono-900">{receipt.customerName}</span>
            </div>
            <div className="flex justify-between text-mono-600">
              <span>{t('orders.items')}</span>
              <span className="font-medium text-mono-900">{receipt.totalItems}</span>
            </div>
            <div className="flex justify-between text-mono-600">
              <span>{t('orders.total')}</span>
              <span className="font-medium text-mono-900">{formatPrice(receipt.total, locale)}</span>
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-mono-900 text-white text-sm font-semibold squircle hover:bg-mono-800 transition-colors"
        >
          {t('checkout.continueShopping')}
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-mono-900">{t('checkout.nothingToCheckout')}</h1>
        <p className="text-sm text-mono-500 mt-1 mb-4">{t('checkout.nothingDesc')}</p>
        <Link href="/products" className="text-sm text-mono-600 hover:underline">← {t('checkout.browseParts')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-mono-500 hover:text-mono-900 mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> {t('checkout.backToCart')}
      </Link>

      <h1 className="text-2xl font-bold text-mono-900 mb-6">{t('checkout.title')}</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {errorMessage && (
              <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="bg-white border border-mono-200 squircle p-5">
              <h2 className="text-sm font-bold text-mono-900 mb-3">{t('checkout.contactInfo')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input required name="firstName" placeholder={t('checkout.firstName')} className="px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400" />
                <input required name="lastName" placeholder={t('checkout.lastName')} className="px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400" />
                <input required name="email" type="email" placeholder={t('checkout.email')} className="sm:col-span-2 px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400" />
                <input required name="phone" placeholder={t('checkout.phone')} className="sm:col-span-2 px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400" />
              </div>
            </div>

            <div className="bg-white border border-mono-200 squircle p-5">
              <h2 className="text-sm font-bold text-mono-900 mb-3">{t('checkout.shippingAddress')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input required name="addressLine1" placeholder={t('checkout.address1')} className="sm:col-span-2 px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400" />
                <input name="addressLine2" placeholder={t('checkout.address2')} className="sm:col-span-2 px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400" />
                <input required name="city" placeholder={t('checkout.city')} className="px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400" />
                <input required name="state" placeholder={t('checkout.state')} className="px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400" />
                <input required name="postalCode" placeholder={t('checkout.postalCode')} className="px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400" />
                <input required name="country" placeholder={t('checkout.country')} className="px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400" />
              </div>
            </div>

            <div className="bg-white border border-mono-200 squircle p-5">
              <h2 className="text-sm font-bold text-mono-900 mb-3 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-mono-400" /> {t('checkout.payment')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input required placeholder={t('checkout.cardNumber')} defaultValue="4242 4242 4242 4242" className="sm:col-span-2 px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400 font-mono" />
                <input required placeholder={t('checkout.expiry')} defaultValue="12/28" className="px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400 font-mono" />
                <input required placeholder={t('checkout.cvc')} defaultValue="123" className="px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400 font-mono" />
              </div>
              <p className="text-[10px] text-mono-400 mt-2">
                {t('checkout.paymentNotice')}
              </p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-mono-200 squircle p-5 sticky top-20">
              <h2 className="text-sm font-bold text-mono-900 mb-3">{t('cart.orderSummary')}</h2>

              <div className="space-y-2 mb-3">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-mono-600 truncate flex-1">
                      {product.name} <span className="text-mono-400">×{quantity}</span>
                    </span>
                    <span className="font-medium text-mono-900 shrink-0">{formatPrice(product.price * quantity, locale)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-mono-200 pt-2 space-y-1.5 text-xs">
                <div className="flex justify-between text-mono-600">
                  <span>{t('cart.subtotal')} ({totalItems} {t('cart.items', { count: totalItems }).split(' ')[1]})</span>
                  <span className="font-medium text-mono-900">{formatPrice(subtotal, locale)}</span>
                </div>
                <div className="flex justify-between text-mono-600">
                  <span>{t('cart.shipping')}</span>
                  <span className="font-medium text-mono-900">{shipping === 0 ? t('cart.free') : formatPrice(shipping, locale)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-mono-700">
                    <span>{t('cart.discount')} ({discountCode})</span>
                    <span className="font-medium">-{formatPrice(discount, locale)}</span>
                  </div>
                )}
                <div className="border-t border-mono-200 pt-2 flex justify-between">
                  <span className="font-semibold text-mono-900">{t('cart.total')}</span>
                  <span className="text-lg font-extrabold text-mono-900">{formatPrice(total + shipping, locale)}</span>
                </div>
              </div>

              <button
                disabled={submitting}
                type="submit"
                className="mt-4 w-full h-10 flex items-center justify-center gap-2 bg-mono-900 text-white text-sm font-semibold squircle hover:bg-mono-800 transition-colors active:scale-[0.98] disabled:opacity-60"
              >
                <Lock className="w-3.5 h-3.5" /> {submitting ? t('checkout.recordingOrder') : t('checkout.placeOrder')}
              </button>

              <p className="text-[10px] text-mono-400 text-center mt-2">
                {t('cart.demoNotice')}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
`);

// ========== CategoriesPage.tsx ==========
fs.writeFileSync('src/screens/CategoriesPage.tsx', `'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Category } from '@/data/products';
import { useT } from '@/store/LocaleContext';

export default function CategoriesPage({ categories }: { categories: Category[] }) {
  const t = useT();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-mono-900">{t('categories.title')}</h1>
        <p className="text-sm text-mono-500 mt-1">{t('categories.description')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <Link
            key={cat.slug}
            href={\`/category/\${cat.slug}\`}
            className="bg-white border border-mono-200 squircle p-6 hover:border-mono-400 transition-colors group flex items-start gap-4"
          >
            <div className="w-12 h-12 bg-mono-100 squircle flex items-center justify-center text-2xl shrink-0 group-hover:bg-mono-200 transition-colors">
              {cat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-mono-900">{cat.name}</h3>
                <ArrowRight className="w-4 h-4 text-mono-400 group-hover:text-mono-700 transition-colors shrink-0" />
              </div>
              <p className="text-xs text-mono-500 mt-1 leading-relaxed">{cat.description}</p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-mono-100 text-mono-600 text-[10px] font-semibold squircle-sm">
                {t('categories.partsAvailable', { count: cat.count })}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
`);

// ========== CategoryPage.tsx ==========
fs.writeFileSync('src/screens/CategoryPage.tsx', `'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import type { Category, Product } from '@/data/products';
import { useT } from '@/store/LocaleContext';

export default function CategoryPage({
  category,
  products,
}: {
  category: Category | null;
  products: Product[];
}) {
  const t = useT();

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-mono-900">{t('category.notFound')}</h1>
        <Link href="/categories" className="text-sm text-mono-600 hover:underline mt-2 inline-block">
          ← {t('category.backToCategories')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/categories" className="inline-flex items-center gap-1.5 text-sm text-mono-500 hover:text-mono-900 mb-4 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> {t('category.backToCategories')}
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-mono-200 squircle flex items-center justify-center text-xl">{category.icon}</div>
        <div>
          <h1 className="text-xl font-bold text-mono-900">{category.name}</h1>
          <p className="text-sm text-mono-500">{t('categories.partsAvailable', { count: products.length })}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
`);

// ========== OrderLookupPage.tsx ==========
fs.writeFileSync('src/screens/OrderLookupPage.tsx', `"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Package, Search } from "lucide-react";

import type { DemoOrderLookupOrder } from "@/types/demo-orders";
import { useToast } from "@/store/ToastContext";
import { useT, useLocale } from "@/store/LocaleContext";
import { formatPrice } from "@/utils/currency";

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

export default function OrderLookupPage() {
  const { showToast } = useToast();
  const t = useT();
  const { locale } = useLocale();
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<DemoOrderLookupOrder[]>([]);
  const [searchedEmail, setSearchedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return;

    setLoading(true);
    setError("");
    setSearchedEmail(normalizedEmail);

    try {
      const response = await fetch(\`/api/demo-orders/lookup?email=\${encodeURIComponent(normalizedEmail)}\`);
      const data = (await response.json()) as { error?: string; orders?: DemoOrderLookupOrder[] };

      if (!response.ok || !data.orders) {
        throw new Error(data.error || "Unable to find orders.");
      }

      setOrders(data.orders);
      showToast(data.orders.length > 0 ? "Order history loaded." : "No orders found for that email.", {
        type: data.orders.length > 0 ? "success" : "info",
      });
    } catch (lookupError) {
      const nextError = lookupError instanceof Error ? lookupError.message : "Unable to find orders.";
      setError(nextError);
      setOrders([]);
      showToast(nextError, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mono-900">{t("orders.title")}</h1>
        <p className="mt-1 text-sm text-mono-500">{t("orders.description")}</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-mono-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">{t("orders.searchPlaceholder")}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mono-400" />
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("orders.searchPlaceholder")}
              className="w-full rounded-xl border border-mono-200 bg-mono-50 py-2.5 pl-10 pr-3 text-sm text-mono-900 outline-none transition focus:border-mono-900 focus:bg-white"
            />
          </label>
          <button
            disabled={loading}
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-mono-900 px-4 text-sm font-semibold text-white transition hover:bg-mono-800 disabled:opacity-60"
          >
            {loading ? t("orders.searching") : t("orders.searchButton")}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
      </form>

      <div className="mt-6 space-y-4">
        {searchedEmail && !loading && orders.length === 0 && !error && (
          <div className="rounded-2xl border border-mono-200 bg-white p-6 text-center">
            <Package className="mx-auto mb-3 h-8 w-8 text-mono-300" />
            <p className="text-sm font-semibold text-mono-900">{t("orders.noOrders")}</p>
            <p className="mt-1 text-sm text-mono-500">{searchedEmail}</p>
            <Link href="/products" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-mono-700 hover:text-mono-900">
              {t("cart.browseParts")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-mono-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mono-500">
                  {formatTimestamp(order.createdAt)}
                </p>
                <h2 className="mt-1 text-lg font-bold text-mono-900">{order.orderNumber}</h2>
                <p className="text-sm text-mono-500">{order.customerName}</p>
              </div>
              <div className="rounded-xl border border-mono-200 bg-mono-50 px-4 py-3 text-sm">
                <div className="text-xs text-mono-500">{t("orders.total")}</div>
                <div className="text-lg font-extrabold text-mono-900">{formatPrice(order.total, locale)}</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {order.items.map((item) => (
                <div key={\`\${order.id}-\${item.productId}\`} className="flex items-start justify-between gap-3 rounded-xl bg-mono-50 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-mono-900">{item.productName}</p>
                    <p className="text-xs text-mono-500">
                      {item.category} · Qty {item.quantity} · Remaining stock {item.remainingStock}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-mono-900">{formatPrice(item.lineTotal, locale)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-2 border-t border-mono-100 pt-4 text-xs sm:grid-cols-4">
              <div>
                <span className="text-mono-500">{t("orders.subtotal")}</span>
                <p className="font-semibold text-mono-900">{formatPrice(order.subtotal, locale)}</p>
              </div>
              <div>
                <span className="text-mono-500">{t("orders.discount")}</span>
                <p className="font-semibold text-mono-900">
                  {order.discountAmount > 0 ? \`-\${formatPrice(order.discountAmount, locale)}\` : formatPrice(0, locale)}
                </p>
              </div>
              <div>
                <span className="text-mono-500">{t("orders.shippingLabel")}</span>
                <p className="font-semibold text-mono-900">
                  {order.shippingFee === 0 ? t("cart.free") : formatPrice(order.shippingFee, locale)}
                </p>
              </div>
              <div>
                <span className="text-mono-500">{t("orders.items")}</span>
                <p className="font-semibold text-mono-900">{order.totalItems}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
`);

console.log('All screen files updated successfully');
console.log('CartPage:', fs.statSync('src/screens/CartPage.tsx').size, 'bytes');
console.log('ProductsPage:', fs.statSync('src/screens/ProductsPage.tsx').size, 'bytes');
console.log('CheckoutPage:', fs.statSync('src/screens/CheckoutPage.tsx').size, 'bytes');
console.log('CategoriesPage:', fs.statSync('src/screens/CategoriesPage.tsx').size, 'bytes');
console.log('CategoryPage:', fs.statSync('src/screens/CategoryPage.tsx').size, 'bytes');
console.log('OrderLookupPage:', fs.statSync('src/screens/OrderLookupPage.tsx').size, 'bytes');
