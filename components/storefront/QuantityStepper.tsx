'use client'

import { Minus, Plus } from 'lucide-react'

interface QuantityStepperProps {
  quantity: number
  maxStock: number
  onChange: (qty: number) => void
}

export function QuantityStepper({
  quantity,
  maxStock,
  onChange,
}: QuantityStepperProps) {
  return (
    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50 w-fit">
      <button
        type="button"
        disabled={quantity <= 1}
        onClick={() => onChange(Math.max(1, quantity - 1))}
        className="p-2.5 text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>

      <span className="w-12 text-center text-sm font-bold text-gray-900 select-none">
        {quantity}
      </span>

      <button
        type="button"
        disabled={quantity >= maxStock}
        onClick={() => onChange(Math.min(maxStock, quantity + 1))}
        className="p-2.5 text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
