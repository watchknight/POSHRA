import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/storefront/ProductCard'
import { TrustStrip } from '@/components/storefront/TrustStrip'
import {
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Truck,
  Banknote,
  PackageCheck,
  CheckCircle,
  Flame,
  Star
} from 'lucide-react'
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
    <div className="space-y-8 sm:space-y-12">
      {/* Hero Section with Aesthetic Ambient Aurora Lighting (No Dots) */}
      <section className="relative overflow-hidden bg-[#070b12] text-white py-8 sm:py-14 lg:py-16">
        {/* Ambient Gradient Glows (Replacing the dot matrix) */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 right-0 h-[450px] w-[450px] rounded-full bg-cyan-500/15 blur-[150px] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-emerald-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070b12]/50 to-[#070b12] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Content & Trust Metrics */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              {/* Redesigned High-Trust Cash on Delivery Box */}
              <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-gray-900/90 to-emerald-950/80 border border-emerald-500/40 px-3.5 py-2 text-xs shadow-[0_0_20px_rgba(16,185,129,0.22)] backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <Truck className="h-4 w-4 text-emerald-400" />
                  <span className="font-extrabold text-white tracking-wide">100% Cash on Delivery</span>
                </div>
                <span className="hidden sm:inline text-emerald-500/50 font-bold">•</span>
                <span className="text-emerald-300 font-semibold text-[11px] sm:text-xs">
                  হাতে পেয়ে চেক করে মূল্য দিন (Inspect Before Paying)
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
                Trending Smart Gadgets &amp; Everyday Essentials
              </h1>

              <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover Bangladesh&apos;s most sought-after watches, noise-cancelling audio, home innovations, and personal accessories. Pay only when you hold the product.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
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

              {/* Quick Trust Bar (Fills previous dead vertical space) */}
              <div className="pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
                    <Banknote className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">৳0 Advance</p>
                    <p className="text-[10px] text-gray-400">Pay at doorstep</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">24-48h Delivery</p>
                    <p className="text-[10px] text-gray-400">Dhaka &amp; Nationwide</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Open &amp; Check</p>
                    <p className="text-[10px] text-gray-400">Verify parcel first</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
                    <PackageCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">7-Day Return</p>
                    <p className="text-[10px] text-gray-400">Hassle-free swap</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Crowd-Attracting Visual Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Glow ring behind showcase card */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500/30 to-cyan-500/20 blur-xl opacity-75" />

                <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.04] p-3 shadow-2xl backdrop-blur-md">
                  {/* Main Product Showcase Image */}
                  <div className="relative aspect-4/3 sm:aspect-square w-full overflow-hidden rounded-2xl bg-gray-950">
                    <Image
                      src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=85"
                      alt="Featured trending smartwatch"
                      fill
                      priority
                      className="object-cover transition-transform duration-700 hover:scale-105"
                    />

                    {/* Top Floating Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1 text-[11px] font-bold text-emerald-400 backdrop-blur-md border border-white/10 shadow-lg">
                      <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      <span>#1 Trending in BD</span>
                    </div>

                    <div className="absolute top-3 right-3 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-lg">
                      -28% OFF
                    </div>

                    {/* Bottom Floating Details Card */}
                    <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-black/80 backdrop-blur-md p-3.5 border border-white/15 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star className="h-3 w-3 fill-amber-400" />
                            <span className="text-[11px] font-bold text-white">4.9</span>
                            <span className="text-[10px] text-gray-400">(420+ verified reviews)</span>
                          </div>
                          <h4 className="text-sm font-extrabold text-white mt-0.5">
                            Ultra Pro AMOLED Smartwatch
                          </h4>
                          <p className="text-[11px] text-emerald-400 font-medium">
                            Bluetooth Calling • Waterproof
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="block text-sm sm:text-base font-black text-emerald-400">
                            ৳2,450
                          </span>
                          <span className="text-[11px] text-gray-400 line-through">
                            ৳3,400
                          </span>
                        </div>
                      </div>

                      {/* Live purchase ticker inside card */}
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-300">
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>48 units ordered in last 24h</span>
                        </span>
                        <Link
                          href="/product/ultra-pro-amoled-smartwatch-calling"
                          className="font-bold text-white hover:text-emerald-400 flex items-center gap-0.5"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
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
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              50 verified products per category, ready for fast cash on delivery
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

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-xs hover:shadow-md transition-all"
            >
              <div className="relative aspect-4/3 sm:aspect-16/11 w-full overflow-hidden bg-gray-100">
                {cat.image_url && (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute top-2.5 right-2.5 rounded-full bg-white/20 backdrop-blur-md px-2 py-0.5 text-[10px] font-extrabold text-white">
                  50 Items
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] font-medium text-emerald-300 mt-0.5 block group-hover:underline">
                    Explore Collection →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
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

        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {featuredProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} priority={idx < 4} />
          ))}
        </div>
      </section>

      {/* Best Sellers Section */}
      {bestSellers.length > 0 && (
        <section className="bg-gray-50/80 py-8 sm:py-12 border-y border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
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

            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Redesigned 2-Column Risk-Free Guarantee Section (Eliminating dead empty void) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="rounded-3xl bg-gradient-to-br from-gray-900 via-[#0d1522] to-gray-950 p-6 sm:p-10 lg:p-12 text-white relative overflow-hidden shadow-2xl border border-white/10">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Guarantee Copy & CTA */}
            <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-400 px-3.5 py-1 text-xs font-bold border border-emerald-500/30">
                <ShieldCheck className="h-4 w-4" />
                <span>100% Risk-Free Shopping Guarantee</span>
              </span>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
                Order with Confidence. Pay Only Upon Delivery.
              </h2>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                We know trust is everything in Bangladesh e-commerce. When you order from Poshra, our courier brings the parcel directly to your doorstep. You open and inspect the contents before handing over a single taka. If you are not satisfied, our 7-day hassle-free return has you covered.
              </p>

              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-bold text-gray-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25"
                >
                  <span>Browse The Collection</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Column: 3-Step COD Inspection Flow (Fills the previous blank space) */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-start gap-3.5 rounded-2xl bg-white/[0.04] p-4 border border-white/10 backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-sm">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Place Order with ৳0 Advance</h4>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    No card, bKash pin, or advance charge required. Simply provide your delivery phone and address.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl bg-white/[0.04] p-4 border border-white/10 backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-black text-sm">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Rapid Doorstep Delivery</h4>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    Shipped securely via Steadfast courier within 24-48 hours in Dhaka and nationwide.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl bg-white/[0.04] p-4 border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-gray-950 font-black text-sm">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-300">Open, Inspect &amp; Pay Cash</h4>
                  <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                    Check the product quality with your own hands. Hand over the cash only when you are 100% satisfied.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

