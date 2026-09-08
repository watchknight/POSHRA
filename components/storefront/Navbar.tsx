'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Menu, X, PackageSearch } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useLanguage, LanguageToggle } from '@/components/i18n/LanguageContext'
import { SearchBar } from './SearchBar'
import { CartDrawer } from './CartDrawer'

interface NavbarProps {
  categories?: Array<{ name: string; slug: string }>
}

export function Navbar({ categories = [] }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { totalItems } = useCartStore()
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const cartCount = mounted ? totalItems() : 0

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs">
        {/* Top Announcement Bar */}
        <div className="bg-gray-900 px-4 py-1.5 text-center text-[11px] font-medium text-white tracking-wide">
          <span>{t.nav.announcement}</span>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Mobile Hamburger & Brand */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tracking-tight text-gray-900 uppercase">
                  Poshra<span className="text-emerald-500">.</span>
                </span>
              </Link>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <SearchBar />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700">
              <Link href="/products" className="hover:text-gray-900 transition-colors">
                {t.nav.products}
              </Link>
              {categories.slice(0, 4).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="hover:text-gray-900 transition-colors whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Actions: Language Toggle, Track Order & Cart */}
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageToggle />

              <Link
                href="/track"
                className="hidden sm:flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <PackageSearch className="h-3.5 w-3.5 text-gray-500" />
                <span>{t.nav.trackOrder}</span>
              </Link>

              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center justify-center rounded-full p-2 text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-xs">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar Row (visible on small screens below header) */}
          <div className="pb-3 md:hidden">
            <SearchBar />
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white p-6 shadow-xl flex flex-col justify-between animate-in slide-in-from-left duration-300">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <span className="text-xl font-extrabold uppercase text-gray-900">
                  Poshra<span className="text-emerald-500">.</span>
                </span>
                <div className="flex items-center gap-2">
                  <LanguageToggle />
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-col space-y-3 text-sm font-semibold text-gray-800">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-gray-50"
                >
                  {t.nav.home}
                </Link>
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-gray-50"
                >
                  {t.nav.products}
                </Link>

                <div className="pt-2 border-t border-gray-100 text-xs font-bold uppercase text-gray-400 px-3">
                  {t.nav.categories}
                </div>
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2 hover:bg-gray-50 text-gray-700"
                  >
                    {cat.name}
                  </Link>
                ))}

                <div className="pt-2 border-t border-gray-100 text-xs font-bold uppercase text-gray-400 px-3">
                  Help & Trust
                </div>
                <Link
                  href="/track"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                >
                  <PackageSearch className="h-4 w-4 text-gray-400" />
                  Track Your Order
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-gray-50 text-gray-700"
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-gray-50 text-gray-700"
                >
                  Contact Us
                </Link>
                <Link
                  href="/return-policy"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-gray-50 text-gray-700"
                >
                  Return Policy
                </Link>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 text-xs text-gray-500">
              <p>Hotline: <a href="tel:01898919219" className="text-gray-900 font-semibold hover:underline">01898-919219</a> / <a href="tel:01856615858" className="text-gray-900 font-semibold hover:underline">01856-615858</a></p>
              <p className="mt-1">Cash on Delivery Available</p>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
