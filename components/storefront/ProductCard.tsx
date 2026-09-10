'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingBag } from 'lucide-react'
import { formatBDT } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(
          ((product.compare_at_price - product.price) / product.compare_at_price) * 100
        )
      : null

  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs transition-all duration-300 hover:shadow-lg hover:border-gray-200">
      {/* Product Image Container */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden bg-gray-50"
      >
        <Image
          src={mainImage}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Discount Badge */}
        {discountPercent ? (
          <span className="absolute left-2 top-2 rounded-md bg-red-600 px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-[11px] font-extrabold text-white shadow-xs">
            -{discountPercent}%
          </span>
        ) : null}

        {/* Stock Status Badge */}
        {product.stock_qty <= 0 ? (
          <span className="absolute right-2 top-2 rounded-md bg-gray-900/85 px-1.5 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase text-white backdrop-blur-xs">
            Sold Out
          </span>
        ) : product.stock_qty < 10 ? (
          <span className="absolute right-2 top-2 rounded-md bg-amber-500/95 px-1.5 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase text-white backdrop-blur-xs">
            Low Stock
          </span>
        ) : null}
      </Link>

      {/* Details Container */}
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-4">
        <div>
          {/* Star Rating */}
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-400" />
            <span className="text-[11px] sm:text-xs font-bold text-gray-800">
              {Number(product.rating_avg || 5.0).toFixed(1)}
            </span>
            <span className="text-[10px] sm:text-[11px] text-gray-400">
              ({product.rating_count || 0})
            </span>
          </div>

          {/* Title */}
          <Link href={`/product/${product.slug}`} className="mt-1 sm:mt-1.5 block">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Action */}
        <div className="mt-2.5 sm:mt-3 pt-2 border-t border-gray-50 flex items-end justify-between gap-1.5 sm:gap-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-xs sm:text-base font-extrabold text-gray-900">
                {formatBDT(product.price)}
              </span>
              {product.compare_at_price && (
                <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                  {formatBDT(product.compare_at_price)}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] text-emerald-700 font-semibold block truncate">
              Cash on Delivery
            </span>
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gray-100 text-gray-700 group-hover:bg-gray-900 group-hover:text-white transition-colors"
            aria-label={`View ${product.name}`}
          >
            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
