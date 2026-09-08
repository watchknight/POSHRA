'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatBDT } from '@/lib/utils'
import { useLanguage } from '@/components/i18n/LanguageContext'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { t } = useLanguage()
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  const total = totalPrice()
  const count = totalItems()

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-gray-900" />
              <h2 className="text-base font-bold text-gray-900">{t.cart.yourCart}</h2>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700 tabular-nums">
                {count}
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400 mb-4">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">{t.cart.empty}</h3>
                <p className="mt-1 text-xs text-gray-500 max-w-xs">
                  {t.cart.emptySubtitle}
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 rounded-xl bg-gray-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-gray-800 transition-colors"
                >
                  {t.cart.startShopping}
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {items.map((item) => {
                  const unitPrice = item.price + (item.variant_price_adjustment || 0)
                  return (
                    <li key={`${item.product_id}::${item.variant_label ?? ''}`} className="py-4 flex gap-3">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => removeItem(item.product_id, item.variant_label)}
                              className="text-gray-400 hover:text-red-500 p-0.5 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {item.variant_label && (
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              {t.cart.variant}: <span className="font-medium text-gray-700">{item.variant_label}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                            <button
                              onClick={() =>
                                updateQuantity(item.product_id, item.quantity - 1, item.variant_label)
                              }
                              className="p-1 text-gray-500 hover:bg-gray-200 transition-colors"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold text-gray-900 tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product_id, item.quantity + 1, item.variant_label)
                              }
                              className="p-1 text-gray-500 hover:bg-gray-200 transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <span className="text-xs sm:text-sm font-bold text-gray-900 tabular-nums">
                            {formatBDT(unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Footer / Checkout CTA */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50/50 p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t.cart.subtotal}</span>
                <span className="font-bold text-gray-900 text-base tabular-nums">{formatBDT(total)}</span>
              </div>
              <p className="text-[11px] text-gray-500">
                {t.cart.deliveryNotice}
              </p>

              <Link
                href="/checkout"
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:scale-[0.99] transition-all"
              >
                <span>{t.cart.proceedToCheckout}</span>
              </Link>

              <Link
                href="/cart"
                onClick={onClose}
                className="block text-center text-xs font-semibold text-gray-500 hover:text-gray-900 pt-1 underline"
              >
                {t.cart.viewFullBag}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
