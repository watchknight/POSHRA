import type { Metadata } from 'next'
import { CheckoutForm } from '@/components/storefront/CheckoutForm'
import { ShieldCheck, Truck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Checkout — Cash on Delivery | Poshra',
  description: 'Complete your order with Cash on Delivery in Bangladesh. Fast doorstep delivery nationwide.',
}

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      {/* Checkout Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Checkout
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Cash on Delivery • No advance payment required • Inspect package before payment
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
            <Truck className="h-3.5 w-3.5" />
            <span>Fast Nationwide Delivery</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>7-Day Replacement</span>
          </div>
        </div>
      </div>

      <CheckoutForm />
    </div>
  )
}
