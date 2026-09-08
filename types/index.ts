export type { Tables, TablesInsert, TablesUpdate, Enums } from './database.types'

import type { Tables, Enums } from './database.types'

// ── Table row aliases ────────────────────────────────────────
export type AdminUser = Tables<'admin_users'>
export type Category = Tables<'categories'>
export type Product = Tables<'products'>
export type Customer = Tables<'customers'>
export type Order = Tables<'orders'>
export type Coupon = Tables<'coupons'>
export type Review = Tables<'reviews'>

// ── Enum aliases ─────────────────────────────────────────────
export type PaymentMethod = Enums<'payment_method_type'>
export type PaymentStatus = Enums<'payment_status_type'>
export type OrderStatus = Enums<'order_status_type'>
export type DeliveryZone = Enums<'delivery_zone_type'>
export type CouponType = Enums<'coupon_type_enum'>

// ── JSONB shapes ─────────────────────────────────────────────

/** One product variant (size/color/etc.) */
export interface ProductVariant {
  label: string           // e.g. "Large / Red"
  sku: string | null
  stock_qty: number
  price_adjustment: number  // paisa delta — positive = more expensive
}

/** A single saved address on a customer record */
export interface CustomerAddress {
  label: string           // e.g. "Home", "Office"
  division: string
  district: string
  thana: string
  street: string
}

/** Order line item — price snapshot at time of order */
export interface OrderItem {
  product_id: string
  name: string
  sku: string | null
  image_url: string
  price: number           // BDT paisa at time of order
  quantity: number
  variant_label: string | null
}

/** One entry in orders.status_history JSONB array */
export interface StatusHistoryEntry {
  status: OrderStatus
  note: string | null
  at: string              // ISO 8601 timestamp
}

// ── Public tracking payload — defined below after label maps ─

// ── Cart (Zustand, client-only) ───────────────────────────────
export interface CartItem {
  product_id: string
  slug: string
  name: string
  price: number           // BDT paisa
  quantity: number
  image_url: string
  max_stock: number
  variant_label: string | null
  variant_price_adjustment: number  // 0 if no variant
}

// ── Action result wrapper ────────────────────────────────────
export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// ── Bangladesh geo data ──────────────────────────────────────
export interface BdDistrict {
  name: string
  thanas: string[]
}

export interface BdDivision {
  name: string
  districts: BdDistrict[]
}

// ── Display label maps ───────────────────────────────────────
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending Confirmation',
  confirmed: 'Confirmed',
  ordered_from_supplier: 'Ordered from Supplier',
  packed: 'Packed',
  processing: 'Processing',          // legacy — unused in pipeline
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

/** Customer-facing friendly copy per status */
export const CUSTOMER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Your order has been received and is awaiting confirmation',
  confirmed: 'Your order has been confirmed! We\'re preparing it now',
  ordered_from_supplier: 'Your order has been placed with our supplier and is being prepared',
  packed: 'Your order has been packed and is ready for courier pickup',
  processing: 'Your order is being processed',
  shipped: 'Your order has been handed to the courier and is on its way',
  out_for_delivery: 'Your order is out for delivery today!',
  delivered: 'Your order has been delivered. Thank you for shopping with Poshra!',
  cancelled: 'This order has been cancelled',
}

/**
 * The operational pipeline in order. 'cancelled' is not in the pipeline —
 * it can happen from any state.  'processing' is legacy and excluded.
 */
export const ORDER_STATUS_PIPELINE: OrderStatus[] = [
  'pending',
  'confirmed',
  'ordered_from_supplier',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
]

/** Status badge colour classes (Tailwind) */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending:                'bg-yellow-100 text-yellow-800',
  confirmed:              'bg-blue-100 text-blue-800',
  ordered_from_supplier:  'bg-indigo-100 text-indigo-800',
  packed:                 'bg-purple-100 text-purple-800',
  processing:             'bg-gray-100 text-gray-700',
  shipped:                'bg-orange-100 text-orange-800',
  out_for_delivery:       'bg-cyan-100 text-cyan-800',
  delivered:              'bg-green-100 text-green-800',
  cancelled:              'bg-red-100 text-red-800',
}

/** Order joined with customer info — used in admin order list */
export interface OrderWithCustomer extends Order {
  customer_name: string
  customer_phone: string
}

/** Tracking data returned by get_order_by_number (includes customer_name) */
export interface OrderTrackingData {
  order_number: string
  order_status: OrderStatus
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  items: OrderItem[]
  subtotal: number
  discount_amount: number
  delivery_fee: number
  total: number
  delivery_district: string
  delivery_thana: string
  delivery_address_line: string
  delivery_zone: DeliveryZone
  courier_name: string | null
  courier_tracking_code: string | null
  status_history: StatusHistoryEntry[]
  created_at: string
  customer_name: string
}
