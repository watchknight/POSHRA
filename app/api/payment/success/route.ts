/**
 * SSLCommerz Success Callback — POST handler.
 * 
 * SSLCommerz redirects the customer here after successful payment.
 * We validate the payment server-side before marking it paid.
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
    const amount = formData.get('amount') as string

    if (!valId || !tranId) {
      return NextResponse.redirect(new URL('/checkout?error=missing_payment_data', request.url))
    }

    // Server-side validation — NEVER trust the callback alone
    const validation = await validatePayment(valId)

    if (!validation.valid) {
      console.error('Payment validation failed:', validation)
      return NextResponse.redirect(new URL(`/checkout?error=payment_validation_failed`, request.url))
    }

    const supabase = createAdminClient()

    // Find order by tran_id (which is the order_number)
    const { data: orderRaw } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', tranId)
      .maybeSingle()

    if (!orderRaw) {
      console.error('Order not found for tran_id:', tranId)
      return NextResponse.redirect(new URL('/checkout?error=order_not_found', request.url))
    }

    const order = orderRaw as Order

    // Verify amount matches (convert order total from paisa to BDT)
    const expectedBdt = order.total / 100
    const paidBdt = validation.amount || parseFloat(amount || '0')

    if (Math.abs(expectedBdt - paidBdt) > 1) { // Allow ৳1 tolerance for rounding
      console.error(`Amount mismatch: expected ${expectedBdt}, got ${paidBdt}`)
      return NextResponse.redirect(new URL('/checkout?error=amount_mismatch', request.url))
    }

    // Check if already paid (idempotency)
    if (order.payment_status === 'paid') {
      return NextResponse.redirect(new URL(`/order-confirmed/${order.order_number}`, request.url))
    }

    // Update order: mark as paid
    const currentHistory = (order.status_history || []) as unknown as StatusHistoryEntry[]
    const newEntry: StatusHistoryEntry = {
      status: 'confirmed' as any,
      note: `Payment received via ${validation.cardType || 'SSLCommerz'} (Bank Txn: ${validation.bankTranId || 'N/A'})`,
      at: new Date().toISOString(),
    }

    await (supabase.from('orders') as any)
      .update({
        payment_status: 'paid',
        payment_val_id: valId,
        payment_details: validation.rawResponse || {},
        order_status: 'confirmed', // Online payment auto-confirms (no OTP needed)
        otp_verified: true,        // Payment is verification
        status_history: [...currentHistory, newEntry],
      })
      .eq('id', order.id)

    // Redirect to confirmation page
    return NextResponse.redirect(new URL(`/order-confirmed/${order.order_number}`, request.url))
  } catch (err) {
    console.error('Payment success handler error:', err)
    return NextResponse.redirect(new URL('/checkout?error=unexpected', request.url))
  }
}
