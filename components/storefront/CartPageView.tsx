'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  Tag,
  Loader2,
  X,
} from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatBDT } from '@/lib/utils'
import { validateCouponAction } from '@/lib/actions/orders'
import { useLanguage } from '@/components/i18n/LanguageContext'

export function CartPageView() {
  const { t } = useLanguage()
  const {
    items,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeItem,
    totalPrice,
    discountAmount,
  } = useCartStore()

  const [mounted, setMounted] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4">
            <div className="h-5 bg-gray-100 rounded-md w-1/4" />
            <div className="flex gap-4 items-center py-2 border-b border-gray-50">
              <div className="h-20 w-20 bg-gray-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
            <div className="flex gap-4 items-center py-2">
              <div className="h-20 w-20 bg-gray-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4">
            <div className="h-5 bg-gray-100 rounded-md w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-11 bg-gray-100 rounded-xl w-full" />
          </div>
        </div>
      </div>
    )
  }

  const subtotal = totalPrice()
  const discount = discountAmount()
  const estimatedTotal = Math.max(0, subtotal - discount)

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponInput.trim()) return

    setCouponLoading(true)
    setCouponMessage(null)

    try {
      const res = await validateCouponAction(couponInput, subtotal)
      if (res.valid && res.coupon) {
        applyCoupon(res.coupon)
        setCouponMessage({
          text: `Coupon "${res.coupon.code}" applied! You saved ${formatBDT(res.discount)}.`,
          isError: false,
        })
        setCouponInput('')
      } else {
        setCouponMessage({ text: res.error || 'Invalid coupon.', isError: true })
      }
    } catch {
      setCouponMessage({ text: 'Failed to apply coupon.', isError: true })
    } finally {
      setCouponLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-gray-50 text-gray-400 mb-4">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t.cart.empty}</h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
          {t.cart.emptySubtitle}
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-xs font-bold text-white hover:bg-gray-800 shadow-xs transition-all"
        >
          <span>{t.cart.startShopping}</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Cart Items (8 Cols) */}
      <div className="lg:col-span-8 space-y-4">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-3.5 bg-gray-50/50 flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>{t.cart.product}</span>
            <span>{t.cart.total}</span>
          </div>

          <div className="divide-y divide-gray-100 p-4 sm:p-5">
            {items.map((item) => {
              const unitPrice = item.price + (item.variant_price_adjustment || 0)
              const itemKey = `${item.product_id}::${item.variant_label ?? ''}`

              return (
                <div key={itemKey} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100"
                    >
                      {item.image_url && (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${item.slug}`}
                        className="text-xs sm:text-sm font-bold text-gray-900 hover:text-emerald-700 transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>

                      {item.variant_label && (
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {t.cart.variant}: <span className="font-semibold text-gray-700">{item.variant_label}</span>
                        </p>
                      )}

                      <p className="text-xs font-semibold text-gray-800 mt-1 tabular-nums">
                        {formatBDT(unitPrice)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                    {/* Stepper */}
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.product_id, item.quantity - 1, item.variant_label)
                        }
                        className="p-2 text-gray-500 hover:bg-gray-200 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-9 text-center text-xs font-bold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.product_id, item.quantity + 1, item.variant_label)
                        }
                        className="p-2 text-gray-500 hover:bg-gray-200 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <span className="text-xs sm:text-sm font-black text-gray-900 w-20 text-right">
                      {formatBDT(unitPrice * item.quantity)}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeItem(item.product_id, item.variant_label)}
                      className="text-gray-400 hover:text-red-500 p-1.5 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <Link href="/products" className="hover:text-gray-900 font-semibold">
            &larr; {t.cart.continueShopping}
          </Link>
          <span className="flex items-center gap-1 text-emerald-700">
            <Truck className="h-3.5 w-3.5" />
            {t.cart.nationwideCod}
          </span>
        </div>
      </div>

      {/* Right: Summary Box (4 Cols) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100">
            {t.cart.orderSummary}
          </h2>

          {/* Coupon */}
          <div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Tag className="h-4 w-4" />
                  <span>Coupon &ldquo;{appliedCoupon.code}&rdquo; Applied</span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="p-1 hover:text-red-500 text-gray-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder={t.cart.haveCoupon}
                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs uppercase focus:border-gray-900 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-800 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    {couponLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t.cart.apply}
                  </button>
                </form>
                {couponMessage && (
                  <p
                    className={`text-[11px] ${
                      couponMessage.isError ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2.5 pt-3 border-t border-gray-100 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>{t.cart.itemsSubtotal}</span>
              <span className="font-semibold text-gray-900 tabular-nums">{formatBDT(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>{t.cart.discount}</span>
                <span className="tabular-nums">-{formatBDT(discount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>{t.cart.deliveryFee}</span>
              <span className="text-gray-500 font-medium">{t.cart.deliveryNotice}</span>
            </div>

            <div className="flex justify-between items-baseline pt-3 border-t border-gray-100">
              <span className="text-sm font-bold text-gray-900">{t.cart.estimatedTotal}</span>
              <span className="text-xl font-black text-gray-900 tabular-nums">{formatBDT(estimatedTotal)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="flex w-full items-center justify-center rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:scale-[0.99] transition-all"
          >
            <span>{t.cart.proceedToCheckout}</span>
          </Link>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>{t.cart.payAfterVerify}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
