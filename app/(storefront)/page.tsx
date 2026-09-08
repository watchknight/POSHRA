import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/storefront/ProductCard'
import { TrustStrip } from '@/components/storefront/TrustStrip'
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react'
import type { Product, Category } from '@/types'

export const revalidate = 60 // ISR: revalidate cache every 60 seconds

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch categories & featured products in parallel
  const [
    { data: categoriesRaw },
    { data: featuredProductsRaw },
    { data: bestSellersRaw },
  ] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('rating_count', { ascending: false })
      .limit(4),
  ])

  const categories = (categoriesRaw || []) as Category[]
  const featuredProducts = (featuredProductsRaw || []) as Product[]
  const bestSellers = (bestSellersRaw || []) as Product[]

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white py-12 sm:py-20 lg:py-24">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 text-xs font-semibold text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Genuine Quality • Cash on Delivery Nationwide</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Trending Smart Gadgets &amp; Everyday Essentials
              </h1>

              <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover Bangladesh&apos;s most sought-after watches, noise-cancelling audio, home innovations, and personal accessories. Pay only when you hold the product.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/products"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 text-sm font-bold text-gray-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 active:scale-98 transition-all"
                >
                  <span>Explore All Products</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/category/smart-gadgets"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-all"
                >
                  Smart Gadgets
                </Link>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm aspect-square overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-sm">
                <Image
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"
                  alt="Featured smartwatch"
                  fill
                  priority
                  className="object-cover rounded-2xl"
                />
                <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-black/75 backdrop-blur-md p-4 border border-white/15">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-400">Featured Pick</p>
                      <h4 className="text-sm font-bold text-white mt-0.5">Ultra Pro Smartwatch</h4>
                    </div>
                    <span className="rounded-lg bg-emerald-500 text-gray-950 text-xs font-extrabold px-2.5 py-1">
                      ৳2,450
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <TrustStrip />

      {/* Category Shortcuts */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Handpicked collections curated for everyday convenience
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-xs hover:shadow-md transition-all"
            >
              <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
                {cat.image_url && (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] font-medium text-emerald-300 mt-0.5 block group-hover:underline">
                    Shop Now →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Trending Now</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-0.5">
              Featured Products
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-bold text-gray-900 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>See More</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {featuredProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} priority={idx < 4} />
          ))}
        </div>
      </section>

      {/* Best Sellers Section */}
      {bestSellers.length > 0 && (
        <section className="bg-gray-50/70 py-12 border-y border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Customer Favorites</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                  Best Sellers in Bangladesh
                </h2>
              </div>
              <Link
                href="/products?sort=best_selling"
                className="text-xs sm:text-sm font-bold text-gray-900 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>View Ranking</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-4">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Order Flow Guarantee / Why Poshra */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-3xl bg-gray-900 p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-400 px-3 py-1 text-xs font-bold">
              <ShieldCheck className="h-3.5 w-3.5" />
              100% Risk-Free Shopping
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
              Order with Confidence. Pay Only Upon Delivery.
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              We know trust is everything. When you order from Poshra, our rider brings the package directly to your address. You open and inspect the contents before handing over the cash. If you are not satisfied, our 7-day hassle-free return has you covered.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-bold text-gray-900 hover:bg-gray-100 transition-colors shadow-md"
              >
                <span>Browse The Collection</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
