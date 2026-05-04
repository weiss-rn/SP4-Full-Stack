import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Category } from '@/data/products';

export default function CategoriesPage({ categories }: { categories: Category[] }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-mono-900">Categories</h1>
        <p className="text-sm text-mono-500 mt-1">Browse parts by motorcycle system</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
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
                {cat.count} parts
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
