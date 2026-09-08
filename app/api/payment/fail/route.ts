/**
 * SSLCommerz Fail Callback — POST handler.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { Order } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const tranId = formData.get('tran_id') as string

    if (tranId) {
      const supabase = createAdminClient()
      const { data: orderRaw } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', tranId)
        .maybeSingle()

      if (orderRaw) {
        const order = orderRaw as Order
        if (order.payment_status !== 'paid') {
          await (supabase.from('orders') as any)
            .update({ payment_status: 'failed' })
            .eq('id', order.id)
        }
      }
    }

    return NextResponse.redirect(new URL('/checkout?error=payment_failed', request.url))
  } catch (err) {
    console.error('Payment fail handler error:', err)
    return NextResponse.redirect(new URL('/checkout?error=unexpected', request.url))
  }
}
