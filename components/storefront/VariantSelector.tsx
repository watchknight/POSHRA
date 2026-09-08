'use client'

import type { ProductVariant } from '@/types'
import { formatBDT } from '@/lib/utils'

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedVariant: ProductVariant | null
  onSelectVariant: (variant: ProductVariant) => void
}

export function VariantSelector({
  variants,
  selectedVariant,
  onSelectVariant,
}: VariantSelectorProps) {
  if (!variants || variants.length === 0) return null

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
          Option / Color / Size:
        </label>
        {selectedVariant && (
          <span className="text-xs font-semibold text-gray-900">
            {selectedVariant.label}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = selectedVariant?.label === v.label
          const isOutOfStock = v.stock_qty <= 0

          return (
            <button
              key={v.label}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelectVariant(v)}
              className={`relative rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                isSelected
                  ? 'border-gray-900 bg-gray-900 text-white shadow-xs'
                  : isOutOfStock
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed line-through'
                  : 'border-gray-200 bg-white text-gray-800 hover:border-gray-400'
              }`}
            >
              <span>{v.label}</span>
              {v.price_adjustment !== 0 && (
                <span
                  className={`ml-1.5 text-[10px] ${
                    isSelected ? 'text-gray-300' : 'text-emerald-600'
                  }`}
                >
                  {v.price_adjustment > 0 ? `+${formatBDT(v.price_adjustment)}` : formatBDT(v.price_adjustment)}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
