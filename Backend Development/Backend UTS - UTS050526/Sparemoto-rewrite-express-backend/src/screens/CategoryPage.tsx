import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import type { Category, Product } from '@/data/products';

export default function CategoryPage({
  category,
  products,
}: {
  category: Category | null;
  products: Product[];
}) {

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-mono-900">Category Not Found</h1>
        <Link href="/categories" className="text-sm text-mono-600 hover:underline mt-2 inline-block">
          ← Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/categories" className="inline-flex items-center gap-1.5 text-sm text-mono-500 hover:text-mono-900 mb-4 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> All Categories
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-mono-200 squircle flex items-center justify-center text-xl">{category.icon}</div>
        <div>
          <h1 className="text-xl font-bold text-mono-900">{category.name}</h1>
          <p className="text-sm text-mono-500">{products.length} parts available</p>
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
