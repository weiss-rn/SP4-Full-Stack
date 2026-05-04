'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, Search, Wrench } from 'lucide-react';
import { useCart } from '../store/CartContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname() ?? '';

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/categories', label: 'Categories' },
    { href: '/products', label: 'All Parts' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/categories') return pathname === '/categories' || pathname.startsWith('/category/');
    if (href === '/products') return pathname === '/products' || pathname.startsWith('/product/');
    return pathname === href;
  };

  return (
    <div className="min-h-screen flex flex-col bg-mono-50">
      {/* Top banner */}
      <div className="bg-mono-900 text-mono-300 text-xs text-center py-1.5 tracking-wide">
        Use code <span className="text-white font-semibold">MOTO10</span> for 10% off your order — Free shipping on orders over $200
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-mono-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-mono-900 squircle-sm flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-mono-900">
                Moto<span className="text-mono-500">Parts</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-sm font-medium squircle-sm transition-colors ${
                    isActive(link.href)
                      ? 'bg-mono-900 text-white'
                      : 'text-mono-600 hover:text-mono-900 hover:bg-mono-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <Link
                href="/products"
                className="hidden sm:flex w-8 h-8 items-center justify-center text-mono-500 hover:text-mono-900 hover:bg-mono-100 squircle-sm transition-colors"
              >
                <Search className="w-4 h-4" />
              </Link>

              <Link
                href="/cart"
                className="relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium squircle-sm text-mono-700 hover:bg-mono-100 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-mono-900 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile menu button */}
              <button
                className="md:hidden w-8 h-8 flex items-center justify-center text-mono-700"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {menuOpen && (
            <nav className="md:hidden pb-3 border-t border-mono-100 pt-2 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2 text-sm font-medium squircle-sm ${
                    isActive(link.href)
                      ? 'bg-mono-900 text-white'
                      : 'text-mono-600 hover:bg-mono-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-mono-900 text-mono-400 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-mono-700 squircle-sm flex items-center justify-center">
                  <Wrench className="w-3.5 h-3.5 text-mono-300" />
                </div>
                <span className="text-sm font-bold text-white tracking-tight">MotoParts</span>
              </div>
              <p className="text-xs leading-relaxed text-mono-500">
                Premium motorcycle spare parts. Quality you can trust, prices you'll appreciate.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-mono-300 uppercase tracking-wider mb-3">Shop</h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
                <li><Link href="/products" className="hover:text-white transition-colors">All Parts</Link></li>
                <li><Link href="/cart" className="hover:text-white transition-colors">Cart</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-mono-300 uppercase tracking-wider mb-3">Support</h4>
              <ul className="space-y-1.5 text-xs">
                <li><span className="cursor-default">Shipping Info</span></li>
                <li><span className="cursor-default">Returns</span></li>
                <li><span className="cursor-default">Contact Us</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-mono-300 uppercase tracking-wider mb-3">Discount Codes</h4>
              <ul className="space-y-1.5 text-xs font-mono">
                <li>MOTO10 — 10% off</li>
                <li>RIDE15 — 15% off</li>
                <li>PARTS20 — 20% off</li>
                <li>FIRST25 — 25% off</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-mono-800 mt-8 pt-6 text-xs text-mono-600 text-center">
            © 2025 MotoParts. This is a demo store — no real transactions.
          </div>
        </div>
      </footer>
    </div>
  );
}
