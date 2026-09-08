import { Flame, CheckCircle2, AlertCircle } from 'lucide-react'

export function UrgencyBadge({ stockQty }: { stockQty: number }) {
  if (stockQty <= 0) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 w-fit">
        <AlertCircle className="h-4 w-4" />
        <span>Currently Out of Stock</span>
      </div>
    )
  }

  if (stockQty <= 10) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 border border-amber-200/60 animate-pulse w-fit">
        <Flame className="h-4 w-4 text-amber-600 fill-amber-500" />
        <span>Hurry! Only {stockQty} units left in stock</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 w-fit">
      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      <span>In Stock • Ready for Doorstep Delivery</span>
    </div>
  )
}
