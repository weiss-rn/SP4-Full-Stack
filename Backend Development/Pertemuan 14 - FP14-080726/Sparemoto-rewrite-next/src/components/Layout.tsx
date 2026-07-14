'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, LogOut, ShoppingCart, Menu, X, Search, Wrench, Globe, Sun, Moon } from 'lucide-react';
import { useCart } from '../store/CartContext';
import { useLocale, useT } from '@/store/LocaleContext';
import { useTheme } from '@/store/ThemeContext';
import type { Locale, TranslationKey } from '@/lib/i18n';

// Inline SVG icon to avoid pulling all lucide-react User icon variants into the bundle
function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const localeLabels: Record<Locale, string> = { en: 'EN', id: 'ID' };
const localeNext: Record<Locale, Locale> = { en: 'id', id: 'en' };

export default function Layout({ children }: { children: React.ReactNode }) {
  const { totalItems, isLoggedIn } = useCart();
  const { locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const t = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname() ?? '';

  const baseLinks: { href: string; label: string; tKey: TranslationKey }[] = [
    { href: '/', label: 'Home', tKey: 'nav.home' },
    { href: '/categories', label: 'Categories', tKey: 'nav.categories' },
    { href: '/products', label: 'All Parts', tKey: 'nav.allParts' },
  ];

  const loggedInLinks: { href: string; label: string; tKey: TranslationKey }[] = [
    { href: '/profile', label: 'Profile', tKey: 'nav.home' },
    ...baseLinks,
  ];

  const navLinks: { href: string; label: string; tKey: TranslationKey }[] = isLoggedIn
    ? loggedInLinks
    : [...baseLinks];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/categories') return pathname === '/categories' || pathname.startsWith('/category/');
    if (href === '/products') return pathname === '/products' || pathname.startsWith('/product/');
    if (href === '/login') return pathname === '/login';
    return pathname === href;
  };

  return (
    <div className="min-h-screen flex flex-col bg-mono-50">
      {/* Top banner */}
      <div className="bg-mono-900 text-mono-300 dark:bg-mono-50 dark:text-mono-700 text-[10px] sm:text-xs text-center px-2 py-1.5 tracking-wide leading-relaxed" dangerouslySetInnerHTML={{ __html: t('banner.text') }} />

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-mono-200 dark:bg-mono-50/95 dark:border-mono-800">
        <div className="px-4 sm:px-6">
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
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 text-sm font-medium squircle-sm ${
                  isActive(link.href)
                    ? 'bg-mono-900 text-white dark:bg-mono-800 dark:text-mono-100'
                    : 'text-mono-600 hover:bg-mono-100 dark:text-mono-400 dark:hover:bg-mono-800'
                }`}
              >
                {link.tKey ? t(link.tKey) : link.label}
              </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Dark mode toggle */}
              <button
                onClick={toggleTheme}
                className="hidden sm:flex items-center gap-1 px-2 py-1.5 text-xs font-semibold squircle-sm text-mono-500 hover:text-mono-900 hover:bg-mono-100 transition-colors border border-mono-200 dark:border-mono-700 dark:text-mono-400 dark:hover:text-mono-100 dark:hover:bg-mono-800"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              {/* Locale toggle */}
              <button
                onClick={() => setLocale(localeNext[locale])}
                className="hidden sm:flex items-center gap-1 px-2 py-1.5 text-xs font-semibold squircle-sm text-mono-500 hover:text-mono-900 hover:bg-mono-100 transition-colors border border-mono-200 dark:border-mono-700 dark:text-mono-400 dark:hover:text-mono-100 dark:hover:bg-mono-800"
                title={locale === 'en' ? 'Switch to Indonesian' : 'Switch to English'}
              >
                <Globe className="w-3.5 h-3.5" />
                {localeLabels[locale]}
              </button>

          <Link
            href="/products"
            className="hidden sm:flex w-8 h-8 items-center justify-center text-mono-500 hover:text-mono-900 hover:bg-mono-100 squircle-sm transition-colors dark:text-mono-400 dark:hover:text-mono-100 dark:hover:bg-mono-800"
          >
            <Search className="w-4 h-4" />
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                href="/profile"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium squircle-sm text-mono-500 hover:text-mono-900 hover:bg-mono-100 transition-colors dark:text-mono-400 dark:hover:text-mono-100 dark:hover:bg-mono-800"
              >
                <UserIcon className="w-4 h-4" />
                <span>Profile</span>
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'DELETE' });
                  window.location.href = '/';
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium squircle-sm text-mono-500 hover:text-mono-900 hover:bg-mono-100 transition-colors dark:text-mono-400 dark:hover:text-mono-100 dark:hover:bg-mono-800"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('nav.signOut')}</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium squircle-sm text-mono-700 hover:bg-mono-100 transition-colors dark:text-mono-300 dark:hover:bg-mono-800"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('nav.signIn')}</span>
            </Link>
          )}

              <Link
                href="/cart"
                className="relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium squircle-sm text-mono-700 hover:bg-mono-100 transition-colors dark:text-mono-300 dark:hover:bg-mono-800"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">{t('nav.cart')}</span>
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
            <nav className="md:hidden pb-3 border-t border-mono-100 dark:border-mono-800 pt-2 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2 text-sm font-medium squircle-sm ${
                    isActive(link.href)
                      ? 'bg-mono-900 text-white dark:bg-mono-800 dark:text-mono-100'
                      : 'text-mono-600 hover:bg-mono-100 dark:text-mono-400 dark:hover:bg-mono-800'
                  }`}
              >
                {link.tKey ? t(link.tKey) : link.label}
                </Link>
              ))}
              {isLoggedIn ? (
                <>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium squircle-sm text-mono-600 hover:bg-mono-100 dark:text-mono-400 dark:hover:bg-mono-800"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await fetch('/api/auth/logout', { method: 'DELETE' });
                      window.location.href = '/';
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium squircle-sm text-mono-600 hover:bg-mono-100 dark:text-mono-400 dark:hover:bg-mono-800"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('nav.signOut')}
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium squircle-sm text-mono-600 hover:bg-mono-100 dark:text-mono-400 dark:hover:bg-mono-800"
                >
                  <LogIn className="w-4 h-4" />
                  {t('nav.signIn')}
                </Link>
              )}
              <button
                onClick={() => { toggleTheme(); setMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium squircle-sm text-mono-600 hover:bg-mono-100 dark:text-mono-400 dark:hover:bg-mono-800"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                onClick={() => { setLocale(localeNext[locale]); setMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium squircle-sm text-mono-600 hover:bg-mono-100 dark:text-mono-400 dark:hover:bg-mono-800"
              >
                <Globe className="w-4 h-4" />
                {locale === 'en' ? 'Bahasa Indonesia' : 'English'}
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-mono-900 text-mono-400 dark:bg-mono-50 dark:text-mono-700 mt-16">
        <div className="px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-mono-700 dark:bg-mono-800 squircle-sm flex items-center justify-center">
                  <Wrench className="w-3.5 h-3.5 text-mono-300 dark:text-mono-600" />
                </div>
                <span className="text-sm font-bold text-white tracking-tight">MotoParts</span>
              </div>
              <p className="text-xs leading-relaxed text-mono-500">
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-mono-300 dark:text-mono-700 uppercase tracking-wider mb-3">{t('footer.shop')}</h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/categories" className="hover:text-white dark:hover:text-mono-900 transition-colors">{t('nav.categories')}</Link></li>
                <li><Link href="/products" className="hover:text-white dark:hover:text-mono-900 transition-colors">{t('nav.allParts')}</Link></li>
                <li><Link href="/orders" className="hover:text-white dark:hover:text-mono-900 transition-colors">{t('nav.orders')}</Link></li>
                <li><Link href="/cart" className="hover:text-white dark:hover:text-mono-900 transition-colors">{t('nav.cart')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-mono-300 dark:text-mono-700 uppercase tracking-wider mb-3">{t('footer.support')}</h4>
              <ul className="space-y-1.5 text-xs">
                <li><span className="cursor-default">Shipping Info</span></li>
                <li><span className="cursor-default">Returns</span></li>
                <li><span className="cursor-default">Contact Us</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-mono-300 dark:text-mono-700 uppercase tracking-wider mb-3">{t('footer.discountCodes')}</h4>
              <ul className="space-y-1.5 text-xs font-mono">
                <li>MOTO10 — 10% off</li>
                <li>RIDE15 — 15% off</li>
                <li>PARTS20 — 20% off</li>
                <li>FIRST25 — 25% off</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-mono-800 dark:border-mono-200 mt-8 pt-6 text-xs text-mono-600 dark:text-mono-400 text-center">
            {t('footer.copyright')} This is a demo store — no real transactions.
          </div>
        </div>
      </footer>
    </div>
  );
}
