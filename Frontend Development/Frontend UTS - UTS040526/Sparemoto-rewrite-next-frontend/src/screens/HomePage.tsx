import Link from 'next/link';
import { ArrowRight, Shield, Truck, RotateCcw, Tag } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import type { Category, Product } from '@/data/products';

export default function HomePage({
  featured,
  categories,
}: {
  featured: Product[];
  categories: Category[];
}) {
  return (
    <div>
      {/* Hero */}
      <section className="bg-mono-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <span className="inline-block px-2.5 py-1 bg-mono-800 text-mono-400 text-[10px] font-bold uppercase tracking-widest squircle-sm mb-4">
              Premium Parts
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Motorcycle Spare Parts<br />
              <span className="text-mono-400">You Can Trust</span>
            </h1>
            <p className="mt-4 text-mono-400 text-sm sm:text-base leading-relaxed max-w-lg">
              OEM-quality and performance parts for every ride. From engine internals to exhaust systems — find exactly what your bike needs.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-mono-900 text-sm font-semibold squircle hover:bg-mono-100 transition-colors"
              >
                Browse All Parts <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-mono-800 text-mono-300 text-sm font-semibold squircle hover:bg-mono-700 transition-colors"
              >
                Shop by Category
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-mono-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Truck, label: 'Free Shipping', desc: 'Orders over $200' },
              { icon: Shield, label: 'Quality Guaranteed', desc: 'OEM-spec parts' },
              { icon: RotateCcw, label: '30-Day Returns', desc: 'Hassle-free' },
              { icon: Tag, label: 'Best Prices', desc: 'Competitive pricing' },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3 p-3 bg-mono-50 squircle">
                <div className="w-9 h-9 bg-mono-200 squircle-sm flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-mono-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-mono-900">{f.label}</div>
                  <div className="text-[11px] text-mono-500">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-mono-900">Shop by Category</h2>
            <p className="text-sm text-mono-500 mt-0.5">Find parts by system</p>
          </div>
          <Link href="/categories" className="text-sm font-medium text-mono-600 hover:text-mono-900 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map(cat => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="bg-white border border-mono-200 squircle p-4 text-center hover:border-mono-400 hover:bg-mono-50 transition-colors group"
            >
              <div className="text-2xl mb-2">{cat.icon}</div>
              <div className="text-sm font-semibold text-mono-900">{cat.name}</div>
              <div className="text-[11px] text-mono-400 mt-0.5">{cat.count} parts</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-mono-900">Featured & On Sale</h2>
            <p className="text-sm text-mono-500 mt-0.5">Top picks and discounted parts</p>
          </div>
          <Link href="/products" className="text-sm font-medium text-mono-600 hover:text-mono-900 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {featured.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
        <div className="bg-mono-900 squircle-lg p-8 sm:p-12 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">New Customer? Get 25% Off</h2>
          <p className="text-mono-400 text-sm mb-4">Use code <span className="font-mono font-bold text-white">FIRST25</span> at checkout</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-mono-900 text-sm font-semibold squircle hover:bg-mono-100 transition-colors"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
