import { ProductCard } from './ProductCard'
import type { Product } from '@/types'

interface RelatedProductsProps {
  products: Product[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) return null

  return (
    <section className="mt-16 pt-10 border-t border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">You May Also Like</h3>
          <p className="text-xs text-gray-500 mt-0.5">Similar trending products from our collection</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-4">
        {products.slice(0, 4).map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  )
}
