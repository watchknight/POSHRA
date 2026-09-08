'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react'
import { useLanguage } from '@/components/i18n/LanguageContext'

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-gray-200 bg-white text-gray-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-black uppercase tracking-tight text-gray-900">
                Poshra<span className="text-emerald-500">.</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              {t.footer.tagline}
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full w-fit">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified Merchant</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              {t.footer.quickLinks}
            </h3>
            <ul className="mt-4 space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/products" className="hover:text-gray-900 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/category/smart-gadgets" className="hover:text-gray-900 transition-colors">
                  Smart Gadgets
                </Link>
              </li>
              <li>
                <Link href="/category/mens-fashion" className="hover:text-gray-900 transition-colors">
                  Men&apos;s Fashion
                </Link>
              </li>
              <li>
                <Link href="/category/home-lifestyle" className="hover:text-gray-900 transition-colors">
                  Home &amp; Lifestyle
                </Link>
              </li>
              <li>
                <Link href="/category/personal-care" className="hover:text-gray-900 transition-colors">
                  Personal Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              {t.footer.compliance}
            </h3>
            <ul className="mt-4 space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/track" className="hover:text-gray-900 transition-colors font-medium text-emerald-600">
                  {t.footer.trackOrder}
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-gray-900 transition-colors">
                  {t.footer.returnPolicy}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-gray-900 transition-colors">
                  {t.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gray-900 transition-colors">
                  {t.footer.aboutUs}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-900 transition-colors">
                  {t.footer.contactUs}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              {t.footer.contactUs}
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-gray-500">
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-gray-900 mt-0.5" />
                <span>+880 1700-000000 (10 AM - 10 PM)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-gray-900 mt-0.5" />
                <span>support@poshra.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-gray-900 mt-0.5" />
                <span>House 42, Road 11, Banani, Dhaka, Bangladesh</span>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-[11px] text-gray-400">Accepted Payment Methods:</p>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-bold text-gray-700">
                <span className="rounded bg-gray-100 px-2 py-0.5 border border-gray-200">Cash on Delivery</span>
                <span className="rounded bg-pink-50 text-pink-700 px-2 py-0.5 border border-pink-200">bKash</span>
                <span className="rounded bg-orange-50 text-orange-700 px-2 py-0.5 border border-orange-200">Nagad</span>
                <span className="rounded bg-gray-100 px-2 py-0.5 border border-gray-200">Visa / Mastercard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-3">
          <p>© {new Date().getFullYear()} Poshra Bangladesh. {t.footer.rights}</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for online shoppers in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  )
}
