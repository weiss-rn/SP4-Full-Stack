'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Truck, RotateCcw, Tag } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import type { Category, Product } from '@/data/products';
import { useT } from '@/store/LocaleContext';

export default function HomePage({
  featured,
  categories,
}: {
  featured: Product[];
  categories: Category[];
}) {
  const t = useT();

  return (
    <div>
      {/* Hero */}
      <section className="bg-mono-900 text-white dark:bg-mono-50">
        <div className="px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <span className="inline-block px-2.5 py-1 bg-mono-800 text-mono-400 dark:bg-mono-800 dark:text-mono-300 text-[10px] font-bold uppercase tracking-widest squircle-sm mb-4">
              {t('hero.badge')}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              {t('hero.title1')}<br />
              <span className="text-mono-400">{t('hero.title2')}</span>
            </h1>
            <p className="mt-4 text-mono-400 dark:text-mono-600 text-sm sm:text-base leading-relaxed max-w-lg">
              {t('hero.description')}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface text-mono-900 text-sm font-semibold squircle hover:bg-mono-100 transition-colors"
              >
                {t('hero.browseAll')} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-mono-800 text-mono-300 text-sm font-semibold squircle hover:bg-mono-700 transition-colors"
              >
                {t('hero.shopByCategory')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-mono-200 dark:border-mono-800 bg-surface">
        <div className="px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Truck, label: t('features.freeShipping'), desc: t('features.freeShippingDesc') },
              { icon: Shield, label: t('features.qualityGuaranteed'), desc: t('features.qualityGuaranteedDesc') },
              { icon: RotateCcw, label: t('features.returns'), desc: t('features.returnsDesc') },
              { icon: Tag, label: t('features.bestPrices'), desc: t('features.bestPricesDesc') },
            ].map(f => (
                <div key={f.label} className="flex items-center gap-3 p-3 bg-mono-100 dark:bg-mono-800 squircle">
                  <div className="w-9 h-9 bg-mono-200 dark:bg-mono-700 squircle-sm flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4 text-mono-600 dark:text-mono-300" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-mono-900 dark:text-mono-100">{f.label}</div>
                    <div className="text-[11px] text-mono-500 dark:text-mono-600">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 sm:px-6 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-mono-900">{t('home.shopByCategory')}</h2>
            <p className="text-sm text-mono-500 mt-0.5">{t('home.shopByCategoryDesc')}</p>
          </div>
          <Link href="/categories" className="text-sm font-medium text-mono-600 hover:text-mono-900 flex items-center gap-1">
            {t('home.viewAll')} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map(cat => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="bg-surface border border-mono-200 dark:border-mono-700 squircle p-4 text-center hover:border-mono-400 dark:hover:border-mono-500 hover:bg-mono-50 dark:hover:bg-mono-800 transition-colors group"
            >
              <div className="text-2xl mb-2">{cat.icon}</div>
              <div className="text-sm font-semibold text-mono-900 dark:text-mono-100">{cat.name}</div>
              <div className="text-[11px] text-mono-400 dark:text-mono-500 mt-0.5">{t('home.partsCount', { count: cat.count })}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="px-4 sm:px-6 pb-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-mono-900">{t('home.featured')}</h2>
            <p className="text-sm text-mono-500 mt-0.5">{t('home.featuredDesc')}</p>
          </div>
          <Link href="/products" className="text-sm font-medium text-mono-600 hover:text-mono-900 flex items-center gap-1">
            {t('home.viewAll')} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {featured.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 pb-4">
        <div className="bg-mono-900 dark:bg-mono-50 squircle-lg p-8 sm:p-12 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{t('home.ctaTitle')}</h2>
          <p className="text-mono-400 dark:text-mono-600 text-sm mb-4" dangerouslySetInnerHTML={{ __html: t('home.ctaDesc') }} />
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface text-mono-900 text-sm font-semibold squircle hover:bg-mono-100 transition-colors"
          >
            {t('home.ctaButton')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
