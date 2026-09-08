'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

export interface AppliedCoupon {
  code: string
  type: 'percent' | 'flat'
  value: number // percent or paisa
}

interface CartStore {
  items: CartItem[]
  appliedCoupon: AppliedCoupon | null
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (product_id: string, variant_label?: string | null) => void
  updateQuantity: (product_id: string, quantity: number, variant_label?: string | null) => void
  clearCart: () => void
  applyCoupon: (coupon: AppliedCoupon) => void
  removeCoupon: () => void
  totalItems: () => number
  totalPrice: () => number // raw subtotal before discount
  discountAmount: () => number // calculated discount in paisa
  finalTotal: (deliveryFee?: number) => number // subtotal - discount + deliveryFee
}

function itemKey(product_id: string, variant_label: string | null | undefined) {
  return `${product_id}::${variant_label ?? ''}`
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,

      addItem(item) {
        const key = itemKey(item.product_id, item.variant_label)
        set((state) => {
          const existing = state.items.find(
            (i) => itemKey(i.product_id, i.variant_label) === key
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                itemKey(i.product_id, i.variant_label) === key
                  ? { ...i, quantity: Math.min(i.quantity + 1, i.max_stock) }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        })
      },

      removeItem(product_id, variant_label) {
        const key = itemKey(product_id, variant_label)
        set((state) => ({
          items: state.items.filter(
            (i) => itemKey(i.product_id, i.variant_label) !== key
          ),
        }))
      },

      updateQuantity(product_id, quantity, variant_label) {
        const key = itemKey(product_id, variant_label)
        if (quantity <= 0) {
          get().removeItem(product_id, variant_label)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            itemKey(i.product_id, i.variant_label) === key
              ? { ...i, quantity: Math.min(quantity, i.max_stock) }
              : i
          ),
        }))
      },

      clearCart() {
        set({ items: [], appliedCoupon: null })
      },

      applyCoupon(coupon) {
        set({ appliedCoupon: coupon })
      },

      removeCoupon() {
        set({ appliedCoupon: null })
      },

      totalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      totalPrice() {
        return get().items.reduce(
          (sum, i) =>
            sum + (i.price + (i.variant_price_adjustment || 0)) * i.quantity,
          0
        )
      },

      discountAmount() {
        const subtotal = get().totalPrice()
        const coupon = get().appliedCoupon
        if (!coupon || subtotal <= 0) return 0

        if (coupon.type === 'percent') {
          return Math.round((subtotal * coupon.value) / 100)
        }
        // flat
        return Math.min(coupon.value, subtotal)
      },

      finalTotal(deliveryFee = 0) {
        const subtotal = get().totalPrice()
        const discount = get().discountAmount()
        return Math.max(0, subtotal - discount + deliveryFee)
      },
    }),
    { name: 'poshra-cart' }
  )
)
