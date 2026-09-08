'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, ShieldCheck, Truck, RotateCcw, Banknote, CheckCircle, ShoppingBag, Zap } from 'lucide-react'
import { formatBDT } from '@/lib/utils'
import { useCartStore } from '@/store/cart'
import { useLanguage } from '@/components/i18n/LanguageContext'
import { trackViewContent, trackAddToCart } from '@/lib/analytics/pixel'
import { ProductGallery } from './ProductGallery'
import { VariantSelector } from './VariantSelector'
import { QuantityStepper } from './QuantityStepper'
import { UrgencyBadge } from './UrgencyBadge'
import { StickyMobileBar } from './StickyMobileBar'
import { ReviewSection } from './ReviewSection'
import { RelatedProducts } from './RelatedProducts'
import type { Product, ProductVariant, Review } from '@/types'

interface ProductDetailViewProps {
  product: Product
  reviews: Review[]
  relatedProducts: Product[]
}

export function ProductDetailView({
  product,
  reviews,
  relatedProducts,
}: ProductDetailViewProps) {
  const router = useRouter()
  const { addItem } = useCartStore()
  const { t } = useLanguage()

  // Variants handling
  const variants = (Array.isArray(product.variants) ? product.variants : []) as unknown as ProductVariant[]
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.length > 0 ? variants[0] : null
  )

  // Quantity handling
  const [quantity, setQuantity] = useState(1)
  const [addedAnimation, setAddedAnimation] = useState(false)

  // Dynamic effective price & stock
  const variantPriceAdjustment = selectedVariant?.price_adjustment || 0
  const effectiveUnitPrice = product.price + variantPriceAdjustment
  const effectiveStock = selectedVariant ? selectedVariant.stock_qty : product.stock_qty
  const isOutOfStock = effectiveStock <= 0

  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(
          ((product.compare_at_price - product.price) / product.compare_at_price) * 100
        )
      : null

  // Fire Meta Pixel ViewContent on product page load
  useEffect(() => {
    trackViewContent({
      id: product.id,
      name: product.name,
      price: effectiveUnitPrice / 100,
    })
  }, [product.id, product.name, effectiveUnitPrice])

  const handleAddToCart = () => {
    if (isOutOfStock) return

    addItem({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      image_url: product.images?.[0] || '',
      price: effectiveUnitPrice,
      max_stock: effectiveStock,
      variant_label: selectedVariant?.label || null,
      variant_price_adjustment: variantPriceAdjustment,
    })

    // Fire Meta Pixel AddToCart
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: effectiveUnitPrice / 100,
      quantity,
    })

    setAddedAnimation(true)
    setTimeout(() => setAddedAnimation(false), 2000)
  }

  const handleOrderNow = () => {
    handleAddToCart()
    router.push('/checkout')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10 sm:px-6 lg:px-8">
      {/* Product Hero Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left: Gallery (Col 6) */}
        <div className="lg:col-span-6">
          <ProductGallery images={product.images || []} productName={product.name} />
        </div>

        {/* Right: Info & Buy Box (Col 6) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Header & Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-md bg-emerald-50 text-emerald-800 px-2.5 py-0.5 text-xs font-bold border border-emerald-200/60">
                {t.trust.codBadge}
              </span>
              {discountPercent && (
                <span className="rounded-md bg-red-600 text-white px-2.5 py-0.5 text-xs font-extrabold shadow-2xs">
                  {t.product.save} {discountPercent}%
                </span>
              )}
              {product.sku && (
                <span className="text-[11px] text-gray-500 font-mono">
                  {t.product.sku}: {product.sku}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Star Rating snippet */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(Number(product.rating_avg || 5))
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-800">
                {Number(product.rating_avg || 5.0).toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">
                ({product.rating_count || reviews.length} customer ratings)
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="rounded-2xl bg-gray-50/80 p-4 border border-gray-100 flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-black text-gray-900">
              {formatBDT(effectiveUnitPrice)}
            </span>
            {product.compare_at_price && (
              <span className="text-sm sm:text-base text-gray-400 line-through">
                {formatBDT(product.compare_at_price + variantPriceAdjustment)}
              </span>
            )}
            <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              In Stock &amp; Ready
            </span>
          </div>

          {/* Urgency Badge */}
          <UrgencyBadge stockQty={effectiveStock} />

          {/* Variant Selector */}
          {variants.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <VariantSelector
                variants={variants}
                selectedVariant={selectedVariant}
                onSelectVariant={(v) => {
                  setSelectedVariant(v)
                  setQuantity(1)
                }}
              />
            </div>
          )}

          {/* Quantity Stepper */}
          <div className="pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-2">
              {t.product.quantity}
            </label>
            <QuantityStepper
              quantity={quantity}
              maxStock={effectiveStock}
              onChange={setQuantity}
            />
          </div>

          {/* CTA Buttons */}
          <div className="pt-4 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3.5 px-6 text-sm font-bold transition-all shadow-xs ${
                  addedAnimation
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-gray-900 bg-white text-gray-900 hover:bg-gray-50 active:scale-98'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {addedAnimation ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>{t.product.addedToCart}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    <span>{t.product.addToCart}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleOrderNow}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3.5 px-6 text-sm font-bold text-white shadow-md hover:bg-emerald-800 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Zap className="h-4 w-4 fill-white" />
                <span>{t.product.orderCod}</span>
              </button>
            </div>

            <p className="text-[11px] text-center text-gray-500">
              {t.trust.inspectBeforePay}
            </p>
          </div>

          {/* Trust Guarantees Box */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-xs text-gray-700 space-y-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4 shrink-0 text-emerald-700" />
              <span>{t.trust.fastDelivery}</span>
            </div>
            <div className="flex items-center gap-3">
              <Banknote className="h-4 w-4 shrink-0 text-emerald-700" />
              <span>{t.trust.codTitle}</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-4 w-4 shrink-0 text-emerald-700" />
              <span>{t.trust.replacementTitle}</span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="pt-6 border-t border-gray-100 space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                {t.product.details}
              </h3>
              <div className="prose prose-sm text-gray-600 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                {product.description}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <ReviewSection
        productId={product.id}
        ratingAvg={product.rating_avg}
        ratingCount={product.rating_count}
        reviews={reviews}
      />

      {/* Related Products */}
      <RelatedProducts products={relatedProducts} />

      {/* Mobile Sticky Order Bar (Appears on small screens) */}
      <StickyMobileBar
        price={effectiveUnitPrice * quantity}
        isOutOfStock={isOutOfStock}
        onAddToCart={handleAddToCart}
        onOrderNow={handleOrderNow}
      />
    </div>
  )
}
