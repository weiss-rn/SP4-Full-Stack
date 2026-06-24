'use client';

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
    const nextHref = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    const currentHref = searchParamsString ? `${pathname}?${searchParamsString}` : pathname;

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
    <div className="px-4 sm:px-6 py-8">
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
            className="w-full pl-9 pr-4 py-2 bg-surface border border-mono-200 dark:border-mono-700 squircle text-sm text-mono-900 placeholder:text-mono-400 focus:outline-none focus:border-mono-400"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden flex items-center justify-center gap-2 px-4 py-2 bg-surface border border-mono-200 dark:border-mono-700 squircle text-sm font-medium text-mono-700"
        >
          <SlidersHorizontal className="w-4 h-4" /> {t('products.filters')}
        </button>
        <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex gap-3`}>
          <select
            value={selectedCategory}
            onChange={e => updateCategory(e.target.value)}
            className="px-3 py-2 bg-surface border border-mono-200 dark:border-mono-700 squircle text-sm text-mono-700 focus:outline-none focus:border-mono-400 appearance-none cursor-pointer"
          >
            <option value="all">{t('products.allCategories')}</option>
            {categories.map(c => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={e => updateSort(e.target.value)}
            className="px-3 py-2 bg-surface border border-mono-200 dark:border-mono-700 squircle text-sm text-mono-700 focus:outline-none focus:border-mono-400 appearance-none cursor-pointer"
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
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-mono-200 dark:border-mono-700 bg-surface px-3 text-sm font-medium text-mono-700 transition hover:border-mono-900 hover:text-mono-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('products.previous')}
                </button>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-mono-200 dark:border-mono-700 bg-surface px-3 text-sm font-medium text-mono-700 transition hover:border-mono-900 hover:text-mono-900 disabled:cursor-not-allowed disabled:opacity-50"
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
