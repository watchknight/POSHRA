'use client'

import { formatBDT } from '@/lib/utils'
import { ShoppingBag, Zap } from 'lucide-react'

interface StickyMobileBarProps {
  price: number
  isOutOfStock: boolean
  onOrderNow: () => void
  onAddToCart: () => void
}

export function StickyMobileBar({
  price,
  isOutOfStock,
  onOrderNow,
  onAddToCart,
}: StickyMobileBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 sm:hidden shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-gray-500 font-medium block">Total Price</span>
          <span className="text-lg font-black text-gray-900 leading-tight">
            {formatBDT(price)}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-[240px]">
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={onAddToCart}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gray-900 bg-white py-2.5 px-3 text-xs font-bold text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 active:scale-95 transition-all"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Cart</span>
          </button>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={onOrderNow}
            className="flex-2 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 px-3 text-xs font-bold text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-700 active:scale-95 transition-all"
          >
            <Zap className="h-4 w-4 fill-white" />
            <span>Order (COD)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
