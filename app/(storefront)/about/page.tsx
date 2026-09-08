import type { Metadata } from 'next'
import { ShieldCheck, Truck, Users, Award } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us — Poshra Bangladesh',
  description: 'Learn more about Poshra, our quality commitment, and how we bring top lifestyle products to customers across Bangladesh.',
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Our Story
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
          Simplifying Online Shopping in Bangladesh
        </h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Poshra was founded with one clear mission: to bring authentic, high-utility smart gadgets and lifestyle accessories directly to your home with 100% trust and zero risk.
        </p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8 text-sm sm:text-base text-gray-600 leading-relaxed">
        <section className="rounded-3xl bg-gray-50/80 p-6 sm:p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Why Poshra?</h2>
          <p>
            In an e-commerce landscape cluttered with inconsistent quality and delivery delays, Poshra stands apart through rigorous quality control. Every single item we curate is physically inspected, tested, and packed with protective materials before handover to our courier partners.
          </p>
          <p className="mt-3">
            Because we believe customers shouldn&apos;t have to worry when ordering online, <strong>Cash on Delivery (COD)</strong> is our standard payment option. You inspect the parcel upon delivery at your doorstep, verify the item, and only pay when you are satisfied.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
          <div className="rounded-2xl border border-gray-100 p-6 space-y-2 bg-white shadow-2xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Truck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Swift Nationwide Delivery</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              We deliver inside Dhaka within 24 to 48 hours, and across all 64 districts within 3 to 5 business days using reputable courier networks.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 p-6 space-y-2 bg-white shadow-2xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">7-Day Replacement Guarantee</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Received a defective item? We offer an easy 7-day exchange or refund process with transparent support via WhatsApp and phone.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 p-6 space-y-2 bg-white shadow-2xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Dedicated Customer Support</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Our support team is available every day from 10:00 AM to 10:00 PM via WhatsApp, phone, and email to answer your queries.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 p-6 space-y-2 bg-white shadow-2xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Curated Dropship Standards</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              We partner directly with established manufacturers and verified suppliers, bringing you international grade products at competitive local prices.
            </p>
          </div>
        </div>

        <section className="border-t border-gray-100 pt-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Have Questions or Need Assistance?</h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Reach out to our customer care team anytime or browse our trending catalog.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/contact"
              className="rounded-xl bg-gray-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-gray-800 transition-colors shadow-xs"
            >
              Contact Us
            </Link>
            <Link
              href="/products"
              className="rounded-xl border border-gray-200 px-6 py-2.5 text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors"
            >
              View Catalog
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
