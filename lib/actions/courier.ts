'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { SteadfastCourier, mapSteadfastStatus } from '@/lib/courier/steadfast'
import { assertAdminAuth } from '@/lib/auth/admin'
import { revalidatePath } from 'next/cache'
import type { Order, Customer, StatusHistoryEntry } from '@/types'

/**
 * Create a Steadfast parcel from an order.
 * Called from admin order detail when order is "packed".
 */
export async function createSteadfastParcelAction(orderId: string) {
  if (!orderId) {
    return { success: false as const, error: 'Order ID is required.' }
  }

  await assertAdminAuth()
  const supabase = createAdminClient()

  // Fetch order
  const { data: orderRaw, error: orderErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (orderErr || !orderRaw) {
    return { success: false as const, error: 'Order not found.' }
  }

  const order = orderRaw as Order & { steadfast_consignment_id?: string | null }

  // Check if parcel already created
  if (order.steadfast_consignment_id) {
    return { success: false as const, error: 'Steadfast parcel already created for this order.' }
  }

  // Fetch customer
  let customerName = 'Customer'
  let customerPhone = ''

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
    }
  }

  if (!customerPhone) {
    return { success: false as const, error: 'Customer phone number not found.' }
  }

  // Build full address
  const fullAddress = [
    order.delivery_address_line,
    order.delivery_thana,
    order.delivery_district,
  ].filter(Boolean).join(', ')

  // Calculate COD amount (BDT, not paisa)
  // If paid online, COD = 0
  const codAmountBdt = order.payment_status === 'paid' ? 0 : Math.round(order.total / 100)

  // Build item description
  const items = (order.items as any[]) || []
  const itemDesc = items.map((i: any) => `${i.name} x${i.quantity}`).join(', ')

  // Create parcel via Steadfast
  const courier = new SteadfastCourier()
  const result = await courier.createParcel({
    orderNumber: order.order_number,
    recipientName: customerName,
    recipientPhone: customerPhone,
    recipientAddress: fullAddress,
    codAmount: codAmountBdt,
    note: order.admin_note || '',
    itemDescription: itemDesc,
  })

  if (!result.success) {
    return { success: false as const, error: result.error || 'Failed to create Steadfast parcel.' }
  }

  // Update order with courier info
  await (supabase.from('orders') as any)
    .update({
      courier_name: 'Steadfast',
      courier_tracking_code: result.trackingCode || '',
      steadfast_consignment_id: result.consignmentId || '',
    })
    .eq('id', orderId)

  return {
    success: true as const,
    consignmentId: result.consignmentId,
    trackingCode: result.trackingCode,
  }
}

/**
 * Check Steadfast courier account balance.
 */
export async function checkCourierBalanceAction() {
  await assertAdminAuth()
  try {
    const courier = new SteadfastCourier()
    const result = await courier.checkBalance()
    return { success: true as const, balance: result.balance }
  } catch {
    return { success: false as const, error: 'Failed to check courier balance.' }
  }
}

/**
 * Manually sync delivery status from Steadfast Courier for an order.
 * Verifies admin auth, checks current status, queries Steadfast getStatus(),
 * maps to internal status, guards against downgrading terminal states,
 * and updates DB.
 */
export async function syncSteadfastStatusAction(orderId: string) {
  if (!orderId) {
    return { success: false as const, error: 'Order ID is required.' }
  }

  await assertAdminAuth()
  const supabase = createAdminClient()

  const { data: orderRaw, error: orderErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (orderErr || !orderRaw) {
    return { success: false as const, error: 'Order not found.' }
  }

  const order = orderRaw as Order & { steadfast_consignment_id?: string | null }

  if (!order.steadfast_consignment_id) {
    return { success: false as const, error: 'No Steadfast consignment ID found for this order.' }
  }

  const courier = new SteadfastCourier()
  const statusResult = await courier.getStatus(order.steadfast_consignment_id)

  if (!statusResult || statusResult.status === 'unknown') {
    return { success: false as const, error: 'Failed to retrieve status from Steadfast or consignment not found.' }
  }

  const steadfastStatus = statusResult.status
  const mapping = mapSteadfastStatus(steadfastStatus)

  // Terminal status protection: don't downgrade delivered or cancelled
  const TERMINAL_STATUSES = ['delivered', 'cancelled']
  if (TERMINAL_STATUSES.includes(order.order_status)) {
    return {
      success: true as const,
      message: `Order is already in terminal state '${order.order_status}'. Steadfast status is '${steadfastStatus}'. No status update needed.`,
      steadfastStatus,
      currentOrderStatus: order.order_status,
    }
  }

  const currentHistory = (order.status_history || []) as unknown as StatusHistoryEntry[]
  const updates: Record<string, unknown> = {}

  if (mapping.orderStatus && mapping.orderStatus !== order.order_status) {
    updates.order_status = mapping.orderStatus
    const newEntry: StatusHistoryEntry = {
      status: mapping.orderStatus as any,
      note: `Manual sync — Steadfast status: ${steadfastStatus}. ${mapping.note}`,
      at: new Date().toISOString(),
    }
    updates.status_history = [...currentHistory, newEntry]
  }

  if (mapping.paymentStatus && mapping.paymentStatus !== order.payment_status) {
    updates.payment_status = mapping.paymentStatus
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateErr } = await (supabase.from('orders') as any)
      .update(updates)
      .eq('id', order.id)

    if (updateErr) {
      return { success: false as const, error: updateErr.message || 'Failed to update order status.' }
    }
  }

  revalidatePath(`/admin/orders/${order.order_number}`)
  revalidatePath('/admin/orders')

  return {
    success: true as const,
    message: `Steadfast status '${steadfastStatus}' synced successfully.`,
    steadfastStatus,
    updatedStatus: mapping.orderStatus || order.order_status,
  }
}
