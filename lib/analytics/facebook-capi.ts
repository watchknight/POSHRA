import crypto from 'crypto'

interface CapiPurchaseParams {
  orderNumber: string
  totalBdt: number
  customerPhone?: string
  customerEmail?: string
  clientIp?: string
  userAgent?: string
}

function hashSha256(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

/**
 * Format phone number for Meta Conversions API (E.164 without plus: 8801XXXXXXXXX)
 */
function normalizeBdPhone(phone?: string): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('8801')) return digits
  if (digits.startsWith('01')) return `88${digits}`
  return digits
}

/**
 * Send server-side Purchase event to Meta Conversions API (CAPI)
 * Uses orderNumber as event_id to automatically deduplicate with client Meta Pixel
 */
export async function sendFacebookCapiPurchaseEvent({
  orderNumber,
  totalBdt,
  customerPhone,
  customerEmail,
  clientIp,
  userAgent,
}: CapiPurchaseParams) {
  const pixelId = process.env.FB_PIXEL_ID || process.env.NEXT_PUBLIC_FB_PIXEL_ID
  const accessToken = process.env.FB_ACCESS_TOKEN
  const testEventCode = process.env.FB_TEST_EVENT_CODE

  if (!pixelId || !accessToken) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `[Meta CAPI Mock] Purchase for order ${orderNumber} (৳${totalBdt}) — CAPI not configured.`
      )
    }
    return { success: false, reason: 'unconfigured' }
  }

  try {
    const userData: Record<string, any> = {}

    // Hash phone
    const normalizedPhone = normalizeBdPhone(customerPhone)
    if (normalizedPhone) {
      userData.ph = [hashSha256(normalizedPhone)]
    }

    // Hash email
    if (customerEmail && customerEmail.includes('@')) {
      userData.em = [hashSha256(customerEmail)]
    }

    if (clientIp) {
      userData.client_ip_address = clientIp
    }

    if (userAgent) {
      userData.client_user_agent = userAgent
    }

    const eventPayload: Record<string, any> = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: orderNumber, // Matches client-side event for deduplication
      event_source_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://poshra.com'}/order-confirmed/${orderNumber}`,
      action_source: 'website',
      user_data: userData,
      custom_data: {
        currency: 'BDT',
        value: totalBdt,
        order_id: orderNumber,
      },
    }

    const requestBody: Record<string, any> = {
      data: [eventPayload],
    }

    if (testEventCode) {
      requestBody.test_event_code = testEventCode
    }

    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    )

    const result = await res.json()

    if (result.error) {
      console.error('[Meta CAPI Error]:', result.error)
      return { success: false, error: result.error }
    }

    console.log(`[Meta CAPI Success]: Purchase event for ${orderNumber} logged.`)
    return { success: true, result }
  } catch (err) {
    console.error('[Meta CAPI Exception]:', err)
    return { success: false, error: err }
  }
}
