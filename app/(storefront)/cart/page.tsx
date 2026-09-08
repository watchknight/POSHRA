import type { Metadata } from 'next'
import { CartPageView } from '@/components/storefront/CartPageView'

export const metadata: Metadata = {
  title: 'Shopping Cart — Poshra',
  description: 'View your selected items, apply discounts, and proceed to Cash on Delivery checkout at Poshra.',
}

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-8">
        Your Shopping Bag
      </h1>
      <CartPageView />
    </div>
  )
}
