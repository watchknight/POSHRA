/**
 * Steadfast Courier Webhook — receives delivery status updates.
 * 
 * Setup in Steadfast Merchant Portal: set callback URL to this endpoint.
 * Validates using the STEADFAST_WEBHOOK_SECRET if configured.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { mapSteadfastStatus } from '@/lib/courier/steadfast'
import type { Order, StatusHistoryEntry } from '@/types'

export async function POST(request: NextRequest) {
  try {
    // Optional: validate webhook secret
    const webhookSecret = process.env.STEADFAST_WEBHOOK_SECRET
    if (webhookSecret) {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${webhookSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await request.json()
    const { consignment_id, invoice, status: steadfastStatus, cod_amount } = body

    if (!consignment_id && !invoice) {
      return NextResponse.json({ error: 'Missing consignment_id or invoice' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Find order by consignment ID or invoice (order_number)
    let orderQuery = supabase.from('orders').select('*')
    if (consignment_id) {
      orderQuery = orderQuery.eq('steadfast_consignment_id', String(consignment_id))
    } else {
      orderQuery = orderQuery.eq('order_number', invoice)
    }

    const { data: orderRaw } = await orderQuery.maybeSingle()

    if (!orderRaw) {
      console.warn('Steadfast webhook: order not found for', { consignment_id, invoice })
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orderRaw as Order

    // Terminal status protection: ignore updates if order is already delivered or cancelled
    const TERMINAL_STATUSES = ['delivered', 'cancelled']
    if (TERMINAL_STATUSES.includes(order.order_status)) {
      console.log(`Steadfast webhook: Order ${order.order_number} is in terminal state '${order.order_status}'. Skipping webhook status update.`)
      return NextResponse.json({ message: 'Order in terminal state, update ignored', currentStatus: order.order_status }, { status: 200 })
    }

    // Map Steadfast status to our status
    const mapping = mapSteadfastStatus(steadfastStatus)

    // Build status history entry
    const currentHistory = (order.status_history || []) as unknown as StatusHistoryEntry[]

    const updates: Record<string, unknown> = {}

    if (mapping.orderStatus && mapping.orderStatus !== order.order_status) {
      updates.order_status = mapping.orderStatus

      const newEntry: StatusHistoryEntry = {
        status: mapping.orderStatus as any,
        note: mapping.note,
        at: new Date().toISOString(),
      }
      updates.status_history = [...currentHistory, newEntry]
    }

    if (mapping.paymentStatus && mapping.paymentStatus !== order.payment_status) {
      updates.payment_status = mapping.paymentStatus
    }

    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      await (supabase.from('orders') as any)
        .update(updates)
        .eq('id', order.id)

      console.log(`Steadfast webhook: Updated order ${order.order_number} — status: ${mapping.orderStatus || 'unchanged'}, payment: ${mapping.paymentStatus || 'unchanged'}`)
    }

    return NextResponse.json({ message: 'Processed', updates }, { status: 200 })
  } catch (err) {
    console.error('Steadfast webhook error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
