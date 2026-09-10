'use server'

import { createAdminClient } from '@/lib/supabase/server'
import {
  checkoutSchema,
  type CheckoutInput,
  trackOrderSchema,
  updateOrderStatusSchema,
  bulkStatusUpdateSchema,
  orderFieldsUpdateSchema,
} from '@/lib/validators'
import { DELIVERY_FEES, getDeliveryZone, applyCoupon, getNextStatuses } from '@/lib/utils'
import type {
  CartItem, OrderItem, ProductVariant, Coupon, Product, Customer, Order,
  OrderWithCustomer, OrderTrackingData, StatusHistoryEntry, OrderStatus,
} from '@/types'
import { ORDER_STATUS_LABELS } from '@/types'
import { checkFraudSignals } from '@/lib/fraud/check'
import { initiatePayment } from '@/lib/payment/sslcommerz'
import { sendFacebookCapiPurchaseEvent } from '@/lib/analytics/facebook-capi'
import { assertAdminAuth } from '@/lib/auth/admin'

/**
 * Validates a coupon code against Supabase database.
 */
export async function validateCouponAction(code: string, subtotal: number) {
  if (!code || !code.trim()) {
    return { valid: false, error: 'Please enter a coupon code.' }
  }

  const cleanCode = code.trim().toUpperCase()
  const supabase = createAdminClient()

  const { data: couponRaw, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', cleanCode)
    .eq('is_active', true)
    .maybeSingle()

  const coupon = couponRaw as Coupon | null

  if (error || !coupon) {
    return { valid: false, error: 'Invalid or inactive coupon code.' }
  }

  // Expiration check
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false, error: 'This coupon code has expired.' }
  }

  // Usage limit check
  if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
    return { valid: false, error: 'This coupon has reached its maximum usage limit.' }
  }

  // Min order subtotal check
  if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
    return {
      valid: false,
      error: `Minimum order amount of ৳${coupon.min_order_amount / 100} required for this coupon.`,
    }
  }

  const discount = applyCoupon(subtotal, coupon.type, coupon.value)

  return {
    valid: true,
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      min_order_amount: coupon.min_order_amount || undefined,
    },
    discount,
  }
}

/**
 * Creates an order in the database entirely as a guest customer.
 * Uses service role client to insert securely.
 */
export async function createOrderAction(
  rawInput: CheckoutInput,
  cartItems: CartItem[]
) {
  try {
    // 1. Validate Form Input
    const parsed = checkoutSchema.safeParse(rawInput)
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || 'Invalid form input.'
      return { success: false, error: errorMsg }
    }
    const input = parsed.data

    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: 'Your cart is empty. Please add items before checking out.' }
    }

    const adminSupabase = createAdminClient()

    // 1.5 Rate Limiting: Max 4 orders per phone per 15 minutes to prevent bot flooding
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    const { data: customerRecordRaw } = await adminSupabase
      .from('customers')
      .select('id')
      .eq('phone', input.customer_phone)
      .maybeSingle()

    if (customerRecordRaw) {
      const { data: recentOrdersRaw } = await adminSupabase
        .from('orders')
        .select('id')
        .eq('customer_id', (customerRecordRaw as any).id)
        .gte('created_at', fifteenMinutesAgo)

      const recentOrders = (recentOrdersRaw || []) as { id: string }[]
      if (recentOrders.length >= 4) {
        return {
          success: false,
          error: 'Too many order requests from this number. Please wait 15 minutes or message us on WhatsApp.',
        }
      }
    }

    // 2. Fetch fresh product data from DB to prevent client price tampering
    const productIds = cartItems.map((item) => item.product_id)
    const { data: dbProductsRaw, error: prodErr } = await adminSupabase
      .from('products')
      .select('*')
      .in('id', productIds)

    const dbProducts = (dbProductsRaw || []) as Product[]

    if (prodErr || !dbProducts || dbProducts.length === 0) {
      return { success: false, error: 'Failed to verify product availability. Please try again.' }
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]))

    // 3. Build verified items snapshot, check real stock, and calculate actual subtotal
    let verifiedSubtotal = 0
    const orderItems: OrderItem[] = []

    for (const item of cartItems) {
      const dbProd = productMap.get(item.product_id)
      if (!dbProd) {
        return { success: false, error: `Product "${item.name}" is no longer available.` }
      }

      // Stock validation
      if (dbProd.stock_qty <= 0) {
        return { success: false, error: `Product "${dbProd.name}" is currently out of stock.` }
      }
      if (dbProd.stock_qty < item.quantity) {
        return { success: false, error: `Only ${dbProd.stock_qty} units available for "${dbProd.name}".` }
      }

      let unitPrice = dbProd.price
      let variantLabel: string | null = null
      let itemSku = dbProd.sku

      // Verify variant price adjustment if present
      if (item.variant_label && Array.isArray(dbProd.variants)) {
        const variantsList = dbProd.variants as unknown as ProductVariant[]
        const matchedVariant = variantsList.find((v) => v.label === item.variant_label)
        if (matchedVariant) {
          unitPrice += matchedVariant.price_adjustment || 0
          variantLabel = matchedVariant.label
          if (matchedVariant.sku) itemSku = matchedVariant.sku
        }
      }

      const itemTotal = unitPrice * item.quantity
      verifiedSubtotal += itemTotal

      orderItems.push({
        product_id: dbProd.id,
        name: dbProd.name,
        sku: itemSku,
        image_url: (dbProd.images && dbProd.images[0]) || item.image_url,
        price: unitPrice,
        quantity: item.quantity,
        variant_label: variantLabel,
      })
    }

    // 4. Calculate Delivery Fee & Zone
    const deliveryZone = getDeliveryZone(input.delivery_district)
    const deliveryFee = DELIVERY_FEES[deliveryZone]

    // 5. Calculate Discount if coupon applied
    let discountAmount = 0
    let couponCode: string | null = null

    if (input.coupon_code && input.coupon_code.trim()) {
      const couponRes = await validateCouponAction(input.coupon_code, verifiedSubtotal)
      if (couponRes.valid && couponRes.coupon) {
        discountAmount = couponRes.discount
        couponCode = couponRes.coupon.code
      } else {
        return {
          success: false,
          error: couponRes.error || 'The applied coupon is invalid or has expired.',
        }
      }
    }

    const total = Math.max(0, verifiedSubtotal - discountAmount + deliveryFee)

    // 5.5 Atomic inventory reservation (prevents concurrent overselling)
    const reservedItems: { productId: string; quantity: number }[] = []

    for (const item of orderItems) {
      let reserved = false

      // Try RPC first
      try {
        const { data: rpcSuccess, error: rpcErr } = await (adminSupabase as any).rpc(
          'decrement_product_stock',
          {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          }
        )
        if (!rpcErr && rpcSuccess === true) {
          reserved = true
        }
      } catch {
        // RPC fallback
      }

      // Fallback: Optimistic locking
      if (!reserved) {
        const { data: liveProdRaw } = await adminSupabase
          .from('products')
          .select('stock_qty')
          .eq('id', item.product_id)
          .single()

        const currentLiveStock = (liveProdRaw as any)?.stock_qty ?? 0
        if (currentLiveStock >= item.quantity) {
          const { data: updated, error: updateErr } = await (adminSupabase.from('products') as any)
            .update({ stock_qty: currentLiveStock - item.quantity })
            .eq('id', item.product_id)
            .eq('stock_qty', currentLiveStock)
            .select('id')
            .maybeSingle()

          if (!updateErr && updated) {
            reserved = true
          }
        }
      }

      if (reserved) {
        reservedItems.push({ productId: item.product_id, quantity: item.quantity })
      } else {
        // Rollback any successfully reserved items
        for (const res of reservedItems) {
          const { data: pRaw } = await adminSupabase
            .from('products')
            .select('stock_qty')
            .eq('id', res.productId)
            .single()

          if (pRaw) {
            await (adminSupabase.from('products') as any)
              .update({ stock_qty: (pRaw as any).stock_qty + res.quantity })
              .eq('id', res.productId)
          }
        }

        return {
          success: false,
          error: `Sorry, "${item.name}" is no longer available in the requested quantity. Please update your bag.`,
        }
      }
    }

    // 6. Resolve or Create Guest Customer by Phone
    let customerId: string | null = null
    const { data: existingCustomerRaw } = await adminSupabase
      .from('customers')
      .select('*')
      .eq('phone', input.customer_phone)
      .maybeSingle()

    const existingCustomer = existingCustomerRaw as Customer | null

    const currentAddress = {
      label: 'Delivery Address',
      division: '',
      district: input.delivery_district,
      thana: input.delivery_thana,
      street: input.delivery_address_line,
    }

    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      const { data: newCustomerRaw, error: custErr } = await (adminSupabase
        .from('customers') as any)
        .insert({
          name: input.customer_name,
          phone: input.customer_phone,
          email: input.customer_email || null,
          addresses: [currentAddress],
        })
        .select('id')
        .single()

      if (!custErr && newCustomerRaw) {
        customerId = (newCustomerRaw as { id: string }).id
      }
    }

    // 7. Initial status history log
    const statusHistory = [
      {
        status: 'pending',
        note: `Order placed by customer (${input.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'})`,
        at: new Date().toISOString(),
      },
    ]

    // 8. Insert Order Record
    const { data: orderRaw, error: orderErr } = await (adminSupabase
      .from('orders') as any)
      .insert({
        customer_id: customerId,
        items: orderItems,
        subtotal: verifiedSubtotal,
        discount_amount: discountAmount,
        delivery_fee: deliveryFee,
        total: total,
        payment_method: input.payment_method,
        payment_status: 'pending',
        order_status: 'pending', // "Pending Confirmation"
        delivery_district: input.delivery_district,
        delivery_thana: input.delivery_thana,
        delivery_address_line: input.delivery_address_line,
        delivery_zone: deliveryZone,
        admin_note: input.order_notes || null,
        coupon_code: couponCode,
        status_history: statusHistory,
        otp_verified: false,
        payment_tran_id: null, // Will be set for online payments
      })
      .select('id, order_number, total')
      .single()

    const order = orderRaw as { id: string; order_number: string; total: number } | null

    if (orderErr || !order) {
      console.error('Order creation error:', orderErr)
      // Rollback stock reservation on order creation error
      for (const res of reservedItems) {
        const { data: pRaw } = await adminSupabase
          .from('products')
          .select('stock_qty')
          .eq('id', res.productId)
          .single()

        if (pRaw) {
          await (adminSupabase.from('products') as any)
            .update({ stock_qty: (pRaw as any).stock_qty + res.quantity })
            .eq('id', res.productId)
        }
      }

      return { success: false, error: 'Failed to place order. Please try again or contact our WhatsApp support.' }
    }

    // 9. If coupon was used, increment times_used counter
    if (couponCode) {
      const { data: usedCouponRaw } = await adminSupabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode)
        .single()

      const usedCoupon = usedCouponRaw as Coupon | null

      if (usedCoupon) {
        await (adminSupabase.from('coupons') as any)
          .update({ times_used: (usedCoupon.times_used || 0) + 1 })
          .eq('id', usedCoupon.id)
      }
    }

    // 10. Run fraud check (async, non-blocking)
    try {
      const fraudResult = await checkFraudSignals(input.customer_phone, total)
      if (fraudResult.score > 0 || fraudResult.signals.length > 0) {
        await (adminSupabase.from('orders') as any)
          .update({
            fraud_score: fraudResult.score,
            fraud_signals: fraudResult.signals,
          })
          .eq('id', order.id)
      }
    } catch (fraudErr) {
      console.error('Fraud check error (non-blocking):', fraudErr)
    }

    // 11. Send Meta Conversions API (CAPI) Purchase event (non-blocking)
    sendFacebookCapiPurchaseEvent({
      orderNumber: order.order_number,
      totalBdt: total / 100,
      customerPhone: input.customer_phone,
      customerEmail: input.customer_email,
    }).catch((capiErr) => console.error('Meta CAPI error (non-blocking):', capiErr))

    // 12. If online payment, initiate SSLCommerz
    if (input.payment_method === 'online') {
      const itemNames = orderItems.map(i => i.name).join(', ')
      const paymentResult = await initiatePayment({
        orderNumber: order.order_number,
        totalBdt: total / 100, // Convert paisa to BDT
        customerName: input.customer_name,
        customerEmail: input.customer_email || '',
        customerPhone: input.customer_phone,
        customerAddress: input.delivery_address_line,
        customerCity: input.delivery_thana,
        customerDistrict: input.delivery_district,
        itemNames,
      })

      // Store tran_id
      await (adminSupabase.from('orders') as any)
        .update({ payment_tran_id: order.order_number })
        .eq('id', order.id)

      if (paymentResult.success && paymentResult.gatewayUrl) {
        return {
          success: true,
          orderNumber: order.order_number,
          orderId: order.id,
          total: order.total,
          gatewayUrl: paymentResult.gatewayUrl,
        }
      }

      // Payment initiation failed — order still created, customer can retry
      return {
        success: true,
        orderNumber: order.order_number,
        orderId: order.id,
        total: order.total,
        paymentError: paymentResult.error || 'Payment gateway unavailable. You can pay later.',
      }
    }

    // 12. COD order — return for OTP flow
    return {
      success: true,
      orderNumber: order.order_number,
      orderId: order.id,
      total: order.total,
    }
  } catch (err) {
    console.error('Unexpected order action error:', err)
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}

// ════════════════════════════════════════════════════════════════
// Stage 4 — Order Tracking & Admin Management Actions
// ════════════════════════════════════════════════════════════════

/**
 * Track an order by order number + phone.
 * Uses the security-definer `get_order_by_number` RPC — never exposes admin fields.
 */
export async function trackOrderAction(orderNumber: string, phone: string) {
  const parsed = trackOrderSchema.safeParse({ order_number: orderNumber, phone })
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message || 'Invalid input.' }
  }

  const supabase = createAdminClient()

  // Use the security-definer function which strips admin_note, supplier_order_ref, cost_price
  const { data, error } = await (supabase.rpc as any)('get_order_by_number', {
    p_order_number: parsed.data.order_number,
    p_phone: parsed.data.phone,
  })

  if (error || !data) {
    return {
      success: false as const,
      error: 'No order found. Please check your order number and phone number.',
    }
  }

  return { success: true as const, data: data as unknown as OrderTrackingData }
}

/**
 * Fetch orders for admin list view with filters, search, and pagination.
 */
export async function fetchAdminOrdersAction(params: {
  status?: string
  payment?: string
  search?: string
  dateRange?: 'today' | '7days' | '30days' | 'all'
  page?: number
  perPage?: number
}) {
  await assertAdminAuth()
  const supabase = createAdminClient()
  const { status, payment, search, dateRange, page = 1, perPage = 20 } = params

  let query = supabase
    .from('orders')
    .select('*, customers!inner(name, phone)', { count: 'exact' })

  // Also fetch orders with no customer
  let queryNoCustomer = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .is('customer_id', null)

  // Status filter
  if (status && status !== 'all') {
    query = query.eq('order_status', status)
    queryNoCustomer = queryNoCustomer.eq('order_status', status)
  }

  // Payment method filter
  if (payment && payment !== 'all') {
    query = query.eq('payment_method', payment)
    queryNoCustomer = queryNoCustomer.eq('payment_method', payment)
  }

  // Date range filter
  if (dateRange && dateRange !== 'all') {
    const now = new Date()
    let fromDate: Date
    if (dateRange === 'today') {
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (dateRange === '7days') {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
    query = query.gte('created_at', fromDate.toISOString())
    queryNoCustomer = queryNoCustomer.gte('created_at', fromDate.toISOString())
  }

  // Search
  if (search && search.trim()) {
    const term = search.trim()
    // Search by order number directly on orders
    if (term.toUpperCase().startsWith('ORD-') || /^\d+$/.test(term)) {
      const orderNumSearch = term.toUpperCase().startsWith('ORD-')
        ? term.toUpperCase()
        : `ORD-${term}`
      query = query.ilike('order_number', `%${orderNumSearch}%`)
      queryNoCustomer = queryNoCustomer.ilike('order_number', `%${orderNumSearch}%`)
    } else {
      // Search by customer name or phone
      query = query.or(`name.ilike.%${term}%,phone.ilike.%${term}%`, { referencedTable: 'customers' })
      // No customer orders won't match name/phone search
      queryNoCustomer = queryNoCustomer.eq('id', '00000000-0000-0000-0000-000000000000') // effectively no results
    }
  }

  // Pagination & ordering
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  query = query.order('created_at', { ascending: false }).range(from, to)
  queryNoCustomer = queryNoCustomer.order('created_at', { ascending: false }).range(from, to)

  const [result1, result2] = await Promise.all([
    query,
    queryNoCustomer,
  ])

  // Merge results
  type OrderRow = Order & { customers?: { name: string; phone: string } | null }
  const ordersWithCustomer = (result1.data || []) as OrderRow[]
  const ordersWithoutCustomer = (result2.data || []) as OrderRow[]

  const allOrders: OrderWithCustomer[] = [
    ...ordersWithCustomer.map((o) => ({
      ...o,
      customer_name: o.customers?.name || 'Unknown',
      customer_phone: o.customers?.phone || 'N/A',
      customers: undefined,
    })) as OrderWithCustomer[],
    ...ordersWithoutCustomer.map((o) => ({
      ...o,
      customer_name: 'Unknown',
      customer_phone: 'N/A',
    })) as OrderWithCustomer[],
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
   .slice(0, perPage)

  const totalCount = (result1.count || 0) + (result2.count || 0)

  return {
    orders: allOrders,
    totalCount,
    page,
    perPage,
    totalPages: Math.ceil(totalCount / perPage),
  }
}

/**
 * Fetch a single order with full customer data for admin detail view.
 */
export async function fetchAdminOrderDetailAction(orderNumber: string) {
  await assertAdminAuth()
  const supabase = createAdminClient()

  const { data: orderRaw, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber.toUpperCase().trim())
    .maybeSingle()

  if (error || !orderRaw) {
    return { success: false as const, error: 'Order not found.' }
  }

  const order = orderRaw as Order

  // Fetch customer info
  let customerName = 'Unknown'
  let customerPhone = 'N/A'
  let customerEmail: string | null = null

  if (order.customer_id) {
    const { data: customerRaw } = await supabase
      .from('customers')
      .select('*')
      .eq('id', order.customer_id)
      .maybeSingle()

    const customer = customerRaw as Customer | null
    if (customer) {
      customerName = customer.name
      customerPhone = customer.phone
      customerEmail = customer.email
    }
  }

  return {
    success: true as const,
    data: {
      ...order,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
    },
  }
}

/**
 * Update order status with one click — validates legal transition,
 * appends to status_history.
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  note?: string
) {
  await assertAdminAuth()
  const parsed = updateOrderStatusSchema.safeParse({
    order_id: orderId,
    status: newStatus,
    note,
  })
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message || 'Invalid input.' }
  }

  const supabase = createAdminClient()

  // Fetch current order
  const { data: orderRaw, error: fetchErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (fetchErr || !orderRaw) {
    return { success: false as const, error: 'Order not found.' }
  }

  const order = orderRaw as Order

  // Validate transition (cancelled can happen from any state)
  if (newStatus !== 'cancelled') {
    const validNext = getNextStatuses(order.order_status)
    if (!validNext.includes(newStatus)) {
      return {
        success: false as const,
        error: `Cannot transition from "${ORDER_STATUS_LABELS[order.order_status]}" to "${ORDER_STATUS_LABELS[newStatus]}".`,
      }
    }
  }

  // If transitioning to cancelled, replenish reserved inventory & coupon usage
  if (newStatus === 'cancelled' && order.order_status !== 'cancelled') {
    await restoreCancelledOrderStockAndCoupon(supabase, order)
  }

  // Build new status history entry
  const currentHistory = (order.status_history || []) as unknown as StatusHistoryEntry[]
  const newEntry: StatusHistoryEntry = {
    status: newStatus,
    note: note || null,
    at: new Date().toISOString(),
  }

  const { error: updateErr } = await (supabase.from('orders') as any)
    .update({
      order_status: newStatus,
      status_history: [...currentHistory, newEntry],
    })
    .eq('id', orderId)

  if (updateErr) {
    console.error('Status update error:', updateErr)
    return { success: false as const, error: 'Failed to update status. Please try again.' }
  }

  return { success: true as const }
}

/**
 * Restores product inventory and coupon usage when an order is cancelled.
 */
async function restoreCancelledOrderStockAndCoupon(supabase: any, order: Order) {
  try {
    const items = (Array.isArray(order.items) ? order.items : []) as unknown as OrderItem[]
    for (const item of items) {
      if (item.product_id && item.quantity > 0) {
        const { data: pRaw } = await supabase
          .from('products')
          .select('stock_qty')
          .eq('id', item.product_id)
          .single()

        if (pRaw) {
          await supabase
            .from('products')
            .update({ stock_qty: (pRaw.stock_qty || 0) + item.quantity })
            .eq('id', item.product_id)
        }
      }
    }

    if (order.coupon_code) {
      const { data: couponRaw } = await supabase
        .from('coupons')
        .select('id, times_used')
        .eq('code', order.coupon_code)
        .maybeSingle()

      if (couponRaw && (couponRaw.times_used || 0) > 0) {
        await supabase
          .from('coupons')
          .update({ times_used: couponRaw.times_used - 1 })
          .eq('id', couponRaw.id)
      }
    }
  } catch (err) {
    console.error('Failed to restore cancelled order stock/coupon:', err)
  }
}

/**
 * Bulk advance multiple orders by one status step.
 */
export async function bulkUpdateStatusAction(
  orderIds: string[],
  targetStatus: OrderStatus
) {
  await assertAdminAuth()
  const parsed = bulkStatusUpdateSchema.safeParse({
    order_ids: orderIds,
    target_status: targetStatus,
  })
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message || 'Invalid input.' }
  }

  const supabase = createAdminClient()

  // Fetch all orders
  const { data: ordersRaw, error: fetchErr } = await supabase
    .from('orders')
    .select('*')
    .in('id', orderIds)

  if (fetchErr || !ordersRaw) {
    return { success: false as const, error: 'Failed to fetch orders.' }
  }

  const orders = ordersRaw as Order[]
  let successCount = 0
  let skipCount = 0
  const errors: string[] = []

  for (const order of orders) {
    // Validate transition
    const validNext = getNextStatuses(order.order_status)
    if (!validNext.includes(targetStatus) && targetStatus !== 'cancelled') {
      skipCount++
      continue
    }

    const currentHistory = (order.status_history || []) as unknown as StatusHistoryEntry[]
    const newEntry: StatusHistoryEntry = {
      status: targetStatus,
      note: 'Bulk status update',
      at: new Date().toISOString(),
    }

    if (targetStatus === 'cancelled' && order.order_status !== 'cancelled') {
      await restoreCancelledOrderStockAndCoupon(supabase, order)
    }

    const { error: updateErr } = await (supabase.from('orders') as any)
      .update({
        order_status: targetStatus,
        status_history: [...currentHistory, newEntry],
      })
      .eq('id', order.id)

    if (updateErr) {
      errors.push(`${order.order_number}: ${updateErr.message}`)
    } else {
      successCount++
    }
  }

  return {
    success: true as const,
    successCount,
    skipCount,
    errors,
    message: `Updated ${successCount} order(s)${skipCount > 0 ? `, skipped ${skipCount}` : ''}${errors.length > 0 ? `, ${errors.length} failed` : ''}.`,
  }
}

/**
 * Update order fields: supplier_order_ref, courier_name, courier_tracking_code, admin_note.
 */
export async function updateOrderFieldsAction(
  orderId: string,
  fields: {
    supplier_order_ref?: string
    courier_name?: string
    courier_tracking_code?: string
    admin_note?: string
  }
) {
  await assertAdminAuth()
  const parsed = orderFieldsUpdateSchema.safeParse(fields)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message || 'Invalid input.' }
  }

  const supabase = createAdminClient()

  const updateData: Record<string, string | null> = {}
  if (fields.supplier_order_ref !== undefined) {
    updateData.supplier_order_ref = fields.supplier_order_ref || null
  }
  if (fields.courier_name !== undefined) {
    updateData.courier_name = fields.courier_name || null
  }
  if (fields.courier_tracking_code !== undefined) {
    updateData.courier_tracking_code = fields.courier_tracking_code || null
  }
  if (fields.admin_note !== undefined) {
    updateData.admin_note = fields.admin_note || null
  }

  if (Object.keys(updateData).length === 0) {
    return { success: true as const }
  }

  const { error } = await (supabase.from('orders') as any)
    .update(updateData)
    .eq('id', orderId)

  if (error) {
    console.error('Order fields update error:', error)
    return { success: false as const, error: 'Failed to update order. Please try again.' }
  }

  return { success: true as const }
}

/**
 * Admin action to manually verify an order via phone call when SMS OTP is delayed or fails.
 */
export async function adminVerifyPhoneOrderAction(orderId: string, adminNote?: string) {
  await assertAdminAuth()
  if (!orderId) {
    return { success: false as const, error: 'Order ID is required.' }
  }

  const supabase = createAdminClient()

  const { data: orderRaw, error: fetchErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (fetchErr || !orderRaw) {
    return { success: false as const, error: 'Order not found.' }
  }

  const order = orderRaw as Order
  const currentHistory = (order.status_history || []) as unknown as StatusHistoryEntry[]
  const newEntry: StatusHistoryEntry = {
    status: order.order_status,
    note: adminNote || 'Order verified via customer phone call by admin',
    at: new Date().toISOString(),
  }

  const { error: updateErr } = await (supabase.from('orders') as any)
    .update({
      otp_verified: true,
      status_history: [...currentHistory, newEntry],
    })
    .eq('id', orderId)

  if (updateErr) {
    return { success: false as const, error: 'Failed to verify order.' }
  }

  return { success: true as const }
}
