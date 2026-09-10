import { z } from 'zod'

/** 
 * Bangladesh phone number sanitizer and validator.
 * Accepts: 01712345678, +8801712345678, 8801712345678, 01712-345678, 01712 345678
 * Automatically strips whitespace, dashes, plus sign, and leading 88 country code.
 * Validates final result matches standard 11-digit format: 01[3-9]\d{8}
 */
export const bdPhone = z
  .string()
  .transform((val) => {
    let cleaned = val.replace(/[\s\-+()]/g, '')
    if (cleaned.startsWith('880')) {
      cleaned = cleaned.slice(2)
    }
    return cleaned
  })
  .refine((val) => /^01[3-9]\d{8}$/.test(val), {
    message: 'Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678).',
  })

// ── Checkout ────────────────────────────────────────────────
export const checkoutSchema = z.object({
  customer_name:       z.string().min(2, 'Name must be at least 2 characters').max(100),
  customer_phone:      bdPhone,
  customer_email:      z.string().email('Invalid email address').optional().or(z.literal('')),
  delivery_district:   z.string().min(1, 'District is required'),
  delivery_thana:      z.string().min(1, 'Thana/Upazila is required'),
  delivery_address_line: z.string().min(5, 'Please provide detailed house / street address (min 5 characters)').max(300),
  delivery_zone:       z.enum(['inside_dhaka', 'outside_dhaka']).default('outside_dhaka'),
  payment_method:      z.enum(['cod', 'online']).default('cod'),
  order_notes:         z.string().max(500).optional().or(z.literal('')),
  coupon_code:         z.string().max(50).optional().or(z.literal('')),
  /** Unix ms — captured in browser for time-to-order fraud signal */
  page_load_time:      z.number().optional(),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>

// ── OTP verification ────────────────────────────────────────
export const otpSchema = z.object({
  phone:      bdPhone,
  otp:        z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/),
  order_id:   z.string().uuid(),
})

export type OtpInput = z.infer<typeof otpSchema>

// ── Product (admin) ─────────────────────────────────────────
export const productSchema = z.object({
  name:            z.string().min(2).max(200),
  slug:            z.string().min(2).max(200)
                     .regex(/^[a-z0-9-]+$/, 'Slug: lowercase letters, numbers, hyphens only'),
  description:     z.string().max(5000).optional(),
  images:          z.array(z.string().url()).max(10),
  price:           z.number().int().positive('Price must be positive (BDT paisa)'),
  compare_at_price: z.number().int().positive().optional(),
  cost_price:      z.number().int().positive().optional(),  // LIFEGOOD cost — admin only
  category_id:     z.string().uuid().optional(),
  stock_qty:       z.number().int().min(0),
  sku:             z.string().max(100).optional(),
  supplier_ref:    z.string().max(500).optional(),  // LIFEGOOD link/ref
  variants:        z.array(z.object({
    label:            z.string().min(1).max(100),
    sku:              z.string().max(100).nullable().optional(),
    stock_qty:        z.number().int().min(0),
    price_adjustment: z.number().int(),
  })).optional(),
  is_active:       z.boolean().default(true),
})

export type ProductInput = z.infer<typeof productSchema>

// ── Category (admin) ────────────────────────────────────────
export const categorySchema = z.object({
  name:       z.string().min(2).max(100),
  slug:       z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  image_url:  z.string().url().optional().or(z.literal('')),
  parent_id:  z.string().uuid().optional(),
  sort_order: z.number().int().min(0).default(0),
  is_active:  z.boolean().default(true),
})

export type CategoryInput = z.infer<typeof categorySchema>

// ── Order status update (admin) ──────────────────────────────
export const updateOrderStatusSchema = z.object({
  order_id: z.string().uuid(),
  status:   z.enum([
    'pending', 'confirmed', 'ordered_from_supplier', 'packed',
    'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled',
  ]),
  note:     z.string().max(500).optional(),
})

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>

// ── Track order (customer) ──────────────────────────────────
export const trackOrderSchema = z.object({
  order_number: z.string().min(1, 'Order number is required').max(20),
  phone:        bdPhone,
})

export type TrackOrderInput = z.infer<typeof trackOrderSchema>

// ── Bulk status update (admin) ──────────────────────────────
export const bulkStatusUpdateSchema = z.object({
  order_ids:     z.array(z.string().uuid()).min(1, 'Select at least one order'),
  target_status: z.enum([
    'pending', 'confirmed', 'ordered_from_supplier', 'packed',
    'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled',
  ]),
})

export type BulkStatusUpdateInput = z.infer<typeof bulkStatusUpdateSchema>

// ── Order fields update (admin) ─────────────────────────────
export const orderFieldsUpdateSchema = z.object({
  order_id:           z.string().uuid(),
  supplier_order_ref: z.string().max(500).optional().or(z.literal('')),
  courier_name:       z.string().max(100).optional().or(z.literal('')),
  courier_tracking_code: z.string().max(100).optional().or(z.literal('')),
  admin_note:         z.string().max(2000).optional().or(z.literal('')),
})

export type OrderFieldsUpdateInput = z.infer<typeof orderFieldsUpdateSchema>

// ── Courier update (admin) ───────────────────────────────────
export const courierUpdateSchema = z.object({
  order_id:              z.string().uuid(),
  courier_name:          z.string().min(1).max(100),
  courier_tracking_code: z.string().max(100).optional(),
})

export type CourierUpdateInput = z.infer<typeof courierUpdateSchema>

// ── Coupon (admin) ───────────────────────────────────────────
export const couponSchema = z.object({
  code:             z.string().min(3).max(50).toUpperCase(),
  type:             z.enum(['percent', 'flat']),
  value:            z.number().int().positive(),
  min_order_amount: z.number().int().min(0).default(0),
  expires_at:       z.string().datetime().optional(),
  usage_limit:      z.number().int().positive().optional(),
  is_active:        z.boolean().default(true),
})

export type CouponInput = z.infer<typeof couponSchema>

