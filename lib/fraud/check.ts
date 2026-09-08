/**
 * Fraud Signal Checking.
 * 
 * Checks phone number history and order patterns to flag suspicious orders.
 * Results are informational — admin makes the final call.
 */

import { createAdminClient } from '@/lib/supabase/server'

export interface FraudCheckResult {
  score: number          // 0 = clean, higher = more suspicious
  signals: string[]      // human-readable descriptions
}

/**
 * Check fraud signals for a phone number and order.
 */
export async function checkFraudSignals(
  phone: string,
  orderTotal: number,   // paisa
): Promise<FraudCheckResult> {
  const supabase = createAdminClient()
  const signals: string[] = []
  let score = 0

  try {
    // 1. Check previous orders from this phone
    const { data: customerRaw } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .maybeSingle()

    const customer = customerRaw as { id: string } | null

    if (customer) {
      // Count previous orders
      const { data: ordersRaw } = await supabase
        .from('orders')
        .select('order_status')
        .eq('customer_id', customer.id)

      const orders = (ordersRaw || []) as { order_status: string }[]

      if (orders.length > 0) {
        const cancelled = orders.filter(o => o.order_status === 'cancelled').length
        const delivered = orders.filter(o => o.order_status === 'delivered').length
        const total = orders.length

        // High cancellation rate
        if (cancelled >= 3) {
          score += 40
          signals.push(`⚠️ ${cancelled} cancelled orders out of ${total} total (${Math.round(cancelled / total * 100)}% cancellation rate)`)
        } else if (cancelled >= 2) {
          score += 20
          signals.push(`⚡ ${cancelled} previous cancellations`)
        }

        // Good history bonus (lowers score)
        if (delivered >= 3 && cancelled === 0) {
          score -= 20
          signals.push(`✅ Trusted customer — ${delivered} successful deliveries, 0 cancellations`)
        }
      } else {
        // First-time customer
        if (orderTotal >= 200000) { // ৳2000+
          score += 15
          signals.push(`🆕 First-time customer with high-value order (${(orderTotal / 100).toFixed(0)} BDT)`)
        }
      }
    } else {
      // Brand new phone number — no previous orders at all
      if (orderTotal >= 300000) { // ৳3000+
        score += 25
        signals.push(`🆕 Unknown phone number with high-value order (${(orderTotal / 100).toFixed(0)} BDT)`)
      } else {
        score += 5
        signals.push(`🆕 New customer — no order history`)
      }
    }

    // 2. Check if OTP was verified (will be checked after order creation, so we skip here)
    
    // 3. Ensure score doesn't go negative
    score = Math.max(0, score)

  } catch (err) {
    console.error('Fraud check error:', err)
    // Don't block orders on fraud check failure
    signals.push('⚠️ Fraud check encountered an error — review manually')
    score = 10
  }

  return { score, signals }
}
