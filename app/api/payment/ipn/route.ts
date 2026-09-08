/**
 * SSLCommerz IPN (Instant Payment Notification) — server-to-server webhook.
 * 
 * This is a backup — fires even if customer doesn't return to success_url.
 * Always validates payment server-side before updating.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { validatePayment } from '@/lib/payment/sslcommerz'
import type { Order, StatusHistoryEntry } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const valId = formData.get('val_id') as string
    const tranId = formData.get('tran_id') as string
    const status = formData.get('status') as string

    if (!valId || !tranId) {
      return NextResponse.json({ error: 'Missing val_id or tran_id' }, { status: 400 })
    }

    // Only process successful payments
    if (status !== 'VALID' && status !== 'VALIDATED') {
      return NextResponse.json({ message: 'Non-success status, ignored' }, { status: 200 })
    }

    // Validate server-side
    const validation = await validatePayment(valId)
    if (!validation.valid) {
      console.error('IPN validation failed:', validation)
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: orderRaw } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', tranId)
      .maybeSingle()

    if (!orderRaw) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orderRaw as Order

    // Idempotency — skip if already paid
    if (order.payment_status === 'paid') {
      return NextResponse.json({ message: 'Already processed' }, { status: 200 })
    }

    // Verify amount
    const expectedBdt = order.total / 100
    const paidBdt = validation.amount || 0

    if (Math.abs(expectedBdt - paidBdt) > 1) {
      console.error(`IPN amount mismatch: expected ${expectedBdt}, got ${paidBdt}`)
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }

    // Update order
    const currentHistory = (order.status_history || []) as unknown as StatusHistoryEntry[]
    const newEntry: StatusHistoryEntry = {
      status: 'confirmed' as any,
      note: `Payment confirmed via IPN — ${validation.cardType || 'SSLCommerz'}`,
      at: new Date().toISOString(),
    }

    await (supabase.from('orders') as any)
      .update({
        payment_status: 'paid',
        payment_val_id: valId,
        payment_details: validation.rawResponse || {},
        order_status: order.order_status === 'pending' ? 'confirmed' : order.order_status,
        otp_verified: true,
        status_history: [...currentHistory, newEntry],
      })
      .eq('id', order.id)

    return NextResponse.json({ message: 'Payment processed' }, { status: 200 })
  } catch (err) {
    console.error('IPN handler error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
