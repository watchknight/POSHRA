import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/storefront/ProductCard'
import { CatalogFilters } from '@/components/storefront/CatalogFilters'
import Link from 'next/link'
import type { Product, Category } from '@/types'
import { PackageOpen } from 'lucide-react'

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    min_price?: string
    max_price?: string
    in_stock?: string
    sort?: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { q, category, min_price, max_price, in_stock, sort } = await searchParams
  const supabase = await createClient()

  // 1. Fetch categories for filter sidebar
  const { data: categoriesRaw } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const categories = (categoriesRaw || []) as Category[]

  // 2. Build product query
  let query = supabase.from('products').select('*', { count: 'exact' }).eq('is_active', true)

  // Search keyword filter
  if (q && q.trim()) {
    query = query.ilike('name', `%${q.trim()}%`)
  }

  // Category filter by slug
  if (category) {
    const selectedCat = categories.find((c) => c.slug === category)
    if (selectedCat) {
      query = query.eq('category_id', selectedCat.id)
    }
  }

  // Price filters (stored in paisa)
  if (min_price && !isNaN(Number(min_price))) {
    query = query.gte('price', Number(min_price))
  }
  if (max_price && !isNaN(Number(max_price))) {
    query = query.lte('price', Number(max_price))
  }

  // In stock filter
  if (in_stock === 'true') {
    query = query.gt('stock_qty', 0)
  }

  // Sorting
  switch (sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'rating':
      query = query.order('rating_avg', { ascending: false })
      break
    case 'best_selling':
      query = query.order('rating_count', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data: productsRaw, count } = await query
  const products = (productsRaw || []) as Product[]
  const totalCount = count || products.length

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          {q ? `Search results for "${q}"` : category ? `Category: ${categories.find(c => c.slug === category)?.name || category}` : 'All Products'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Cash on Delivery available nationwide in Bangladesh (হাতে পেয়ে মূল্য দিন).
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 lg:gap-8">
        {/* Filters (Desktop Sidebar + Mobile Sheet) */}
        <CatalogFilters
          categories={categories}
          currentCategory={category}
          totalCount={totalCount}
        />

        {/* Product Grid Area */}
        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-gray-50/60 p-8 sm:p-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-xs text-gray-400 mb-3">
                <PackageOpen className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No products found</h3>
              <p className="mt-1 text-xs text-gray-500 max-w-sm">
                Try searching with different keywords or clearing active filters.
              </p>
              <Link
                href="/products"
                className="mt-5 rounded-xl bg-gray-900 px-5 py-2 text-xs font-bold text-white hover:bg-gray-800 transition-colors shadow-xs"
              >
                Clear All Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
