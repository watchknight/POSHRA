/**
 * SSLCommerz Cancel Callback — POST handler.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Customer cancelled payment — redirect back to checkout
  return NextResponse.redirect(new URL('/checkout?error=payment_cancelled', request.url))
}
