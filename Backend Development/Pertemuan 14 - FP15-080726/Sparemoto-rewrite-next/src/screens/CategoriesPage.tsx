'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Category } from '@/data/products';
import { useT } from '@/store/LocaleContext';

export default function CategoriesPage({ categories }: { categories: Category[] }) {
  const t = useT();

  return (
    <div className="px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-mono-900">{t('categories.title')}</h1>
        <p className="text-sm text-mono-500 mt-1">{t('categories.description')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="bg-surface border border-mono-200 dark:border-mono-700 squircle p-6 hover:border-mono-400 transition-colors group flex items-start gap-4"
          >
            <div className="w-12 h-12 bg-mono-100 dark:bg-mono-800 squircle flex items-center justify-center text-2xl shrink-0 group-hover:bg-mono-200 dark:group-hover:bg-mono-700 transition-colors">
              {cat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-mono-900 dark:text-mono-100">{cat.name}</h3>
                <ArrowRight className="w-4 h-4 text-mono-400 dark:text-mono-500 group-hover:text-mono-700 dark:group-hover:text-mono-300 transition-colors shrink-0" />
              </div>
              <p className="text-xs text-mono-500 dark:text-mono-400 mt-1 leading-relaxed">{cat.description}</p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-mono-100 dark:bg-mono-800 text-mono-600 dark:text-mono-400 text-[10px] font-semibold squircle-sm">
                {t('categories.partsAvailable', { count: cat.count })}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
