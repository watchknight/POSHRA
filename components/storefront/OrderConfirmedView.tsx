'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle2,
  PackageSearch,
  Truck,
  Banknote,
  PhoneCall,
  ShieldCheck,
  Copy,
} from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatBDT } from '@/lib/utils'
import { trackPurchase } from '@/lib/analytics/pixel'
import { useLanguage } from '@/components/i18n/LanguageContext'
import type { Order, OrderItem } from '@/types'

interface OrderConfirmedViewProps {
  order: Order
}

export function OrderConfirmedView({ order }: OrderConfirmedViewProps) {
  const { t } = useLanguage()
  const { clearCart } = useCartStore()

  // Ensure cart is cleared and fire Meta Pixel Purchase event
  useEffect(() => {
    clearCart()

    const orderItems = (Array.isArray(order.items) ? order.items : []) as unknown as OrderItem[]
    trackPurchase({
      orderNumber: order.order_number,
      totalBdt: order.total / 100,
      numItems: orderItems.length,
    })
  }, [clearCart, order.order_number, order.total, order.items])

  const items = (Array.isArray(order.items) ? order.items : []) as unknown as OrderItem[]

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.order_number)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16 sm:px-6 lg:px-8">
      {/* Success Badge */}
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-md animate-in zoom-in-75">
          <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12" />
        </div>

        <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          {t.orderConfirmed.successBadge}
        </span>

        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
          {t.orderConfirmed.title}
        </h1>

        <div className="inline-flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-2 text-xs sm:text-sm font-mono font-bold text-gray-800">
          <span>{t.orderConfirmed.orderNo}: {order.order_number}</span>
          <button
            onClick={copyOrderNumber}
            className="p-1 hover:text-emerald-700 transition-colors"
            title="Copy Order Number"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Reassurance Banner */}
      <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6 text-emerald-950 space-y-2.5 shadow-2xs">
        <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-emerald-900">
          <PhoneCall className="h-5 w-5 text-emerald-600" />
          <span>{t.orderConfirmed.weWillCall}</span>
        </div>
      </div>

      {/* Main Order Details Card */}
      <div className="mt-8 rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100">
          {t.checkout.orderSummary}
        </h2>

        {/* Delivery & Payment Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600">
          <div className="rounded-2xl bg-gray-50/70 p-4 border border-gray-100 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-gray-900 text-xs uppercase tracking-wider">
              <Truck className="h-4 w-4 text-gray-700" />
              <span>{t.checkout.shippingAddress}</span>
            </div>
            <p className="font-semibold text-gray-900 pt-0.5">{order.delivery_address_line}</p>
            <p>{order.delivery_thana}, {order.delivery_district}</p>
            <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {order.delivery_zone === 'inside_dhaka' ? 'Inside Dhaka (24-48h)' : 'Outside Dhaka (3-5 Days)'}
            </span>
          </div>

          <div className="rounded-2xl bg-gray-50/70 p-4 border border-gray-100 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-gray-900 text-xs uppercase tracking-wider">
              <Banknote className="h-4 w-4 text-gray-700" />
              <span>{t.checkout.paymentMethod}</span>
            </div>
            <p className="font-semibold text-gray-900 pt-0.5">
              {order.payment_method === 'cod' ? t.checkout.codTitle : t.checkout.onlineTitle}
            </p>
            <p className="text-gray-500">Amount Due:</p>
            <p className="text-lg font-black text-gray-900 tabular-nums">{formatBDT(order.total)}</p>
          </div>
        </div>

        {/* Ordered Items List */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
            {t.cart.product}
          </h3>
          <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-gray-50/40 p-4">
            {items.map((item, idx) => (
              <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white border border-gray-100">
                    {item.image_url && (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{item.name}</p>
                    {item.variant_label && (
                      <p className="text-[11px] text-gray-500">{t.cart.variant}: {item.variant_label}</p>
                    )}
                    <p className="text-[11px] text-gray-400">Qty: <span className="tabular-nums">{item.quantity}</span></p>
                  </div>
                </div>

                <span className="text-xs font-bold text-gray-900 tabular-nums">
                  {formatBDT(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="space-y-2 pt-3 border-t border-gray-100 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>{t.cart.subtotal}</span>
            <span className="font-semibold text-gray-900 tabular-nums">{formatBDT(order.subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span>{t.cart.deliveryFee}</span>
            <span className="font-semibold text-gray-900 tabular-nums">{formatBDT(order.delivery_fee)}</span>
          </div>

          {order.discount_amount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>{t.cart.discount}</span>
              <span className="tabular-nums">-{formatBDT(order.discount_amount)}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline pt-3 border-t border-gray-100">
            <span className="text-sm font-bold text-gray-900">{t.cart.estimatedTotal}</span>
            <span className="text-xl font-black text-gray-900 tabular-nums">{formatBDT(order.total)}</span>
          </div>
        </div>

        {/* Action Buttons: Track Order & Home */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Link
            href={`/track?order=${encodeURIComponent(order.order_number)}`}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3.5 px-6 text-xs font-bold text-white shadow-md hover:bg-gray-800 transition-all"
          >
            <PackageSearch className="h-4 w-4" />
            <span>{t.orderConfirmed.trackOrderBtn}</span>
          </Link>

          <Link
            href="/"
            className="flex-1 flex items-center justify-center rounded-xl border border-gray-200 bg-white py-3.5 px-6 text-xs font-bold text-gray-800 hover:bg-gray-50 transition-all"
          >
            <span>{t.orderConfirmed.continueShopping}</span>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 pt-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>{t.cart.freeReturns}</span>
        </div>
      </div>
    </div>
  )
}
