import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/storefront/ProductCard'
import { CatalogFilters } from '@/components/storefront/CatalogFilters'
import type { Product, Category } from '@/types'
import { PackageOpen } from 'lucide-react'
import Link from 'next/link'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    min_price?: string
    max_price?: string
    in_stock?: string
    sort?: string
  }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: categoryRaw } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  const category = categoryRaw as Category | null
  if (!category) return { title: 'Category Not Found | Poshra' }

  return {
    title: `${category.name} — Buy Online in Bangladesh | Poshra`,
    description: `Browse the best collection of ${category.name} with cash on delivery at Poshra.`,
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { min_price, max_price, in_stock, sort } = await searchParams
  const supabase = await createClient()

  // 1. Fetch the category
  const { data: categoryRaw } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!categoryRaw) {
    notFound()
  }

  const currentCategory = categoryRaw as Category

  // 2. Fetch all active categories for the sidebar
  const { data: categoriesRaw } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const categories = (categoriesRaw || []) as Category[]

  // 3. Build product query
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('category_id', currentCategory.id)
    .eq('is_active', true)

  if (min_price && !isNaN(Number(min_price))) {
    query = query.gte('price', Number(min_price))
  }
  if (max_price && !isNaN(Number(max_price))) {
    query = query.lte('price', Number(max_price))
  }
  if (in_stock === 'true') {
    query = query.gt('stock_qty', 0)
  }

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Category Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          {currentCategory.name}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
          Explore our top-selling {currentCategory.name.toLowerCase()} with Cash on Delivery nationwide.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <CatalogFilters
          categories={categories}
          currentCategory={currentCategory.slug}
          totalCount={totalCount}
        />

        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-gray-50/60 p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xs text-gray-400 mb-4">
                <PackageOpen className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No products found</h3>
              <p className="mt-1 text-xs text-gray-500 max-w-sm">
                No active products match your current price or stock filters in this category.
              </p>
              <Link
                href={`/category/${slug}`}
                className="mt-6 rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-gray-800 transition-colors shadow-xs"
              >
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3">
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
