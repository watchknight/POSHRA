import Link from 'next/link'
import { ArrowLeft, Search, ShoppingBag } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-2">
          <p className="text-6xl font-black text-emerald-600 tracking-tight">404</p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Page Not Found</h1>
          <p className="text-sm text-gray-500">
            Sorry, we couldn&apos;t find the page or product you&apos;re looking for. It might have been moved or is no longer available.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            Explore Products
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
