/**
 * SSLCommerz Payment Gateway Client.
 * 
 * Uses sslcommerz-lts npm package.
 * Sandbox: store_id=testbox, store_passwd=qwerty
 */

const SANDBOX_URL = 'https://sandbox.sslcommerz.com'
const LIVE_URL = 'https://securepay.sslcommerz.com'

function getConfig() {
  const isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true'
  const storeId = process.env.SSLCOMMERZ_STORE_ID || (isLive ? '' : 'testbox')
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD || (isLive ? '' : 'qwerty')

  if (isLive && (!storeId || storeId === 'testbox' || !storePassword || storePassword === 'qwerty')) {
    throw new Error('SSLCommerz live mode is enabled (SSLCOMMERZ_IS_LIVE=true), but valid live credentials (SSLCOMMERZ_STORE_ID, SSLCOMMERZ_STORE_PASSWORD) are not configured.')
  }

  const baseUrl = isLive ? LIVE_URL : SANDBOX_URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return { storeId, storePassword, isLive, baseUrl, appUrl }
}

export interface PaymentInitData {
  orderNumber: string
  totalBdt: number          // BDT amount (NOT paisa) — e.g. 1250.50
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  customerDistrict: string
  itemNames: string
}

export interface PaymentInitResult {
  success: boolean
  gatewayUrl?: string
  sessionKey?: string
  error?: string
}

/**
 * Initiate an SSLCommerz payment session.
 * Returns the GatewayPageURL to redirect the customer to.
 */
export async function initiatePayment(data: PaymentInitData): Promise<PaymentInitResult> {
  const { storeId, storePassword, baseUrl, appUrl } = getConfig()

  const params = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePassword,
    total_amount: data.totalBdt.toFixed(2),
    currency: 'BDT',
    tran_id: data.orderNumber,
    success_url: `${appUrl}/api/payment/success`,
    fail_url: `${appUrl}/api/payment/fail`,
    cancel_url: `${appUrl}/api/payment/cancel`,
    ipn_url: `${appUrl}/api/payment/ipn`,
    shipping_method: 'Courier',
    product_name: data.itemNames || 'Poshra Order',
    product_category: 'General',
    product_profile: 'physical-goods',
    cus_name: data.customerName,
    cus_email: data.customerEmail || 'customer@poshra.com',
    cus_add1: data.customerAddress,
    cus_city: data.customerCity || data.customerDistrict,
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: data.customerPhone,
    ship_name: data.customerName,
    ship_add1: data.customerAddress,
    ship_city: data.customerCity || data.customerDistrict,
    ship_postcode: '1000',
    ship_country: 'Bangladesh',
    // Pass order number in custom field for IPN processing
    value_a: data.orderNumber,
  })

  try {
    const res = await fetch(`${baseUrl}/gwprocess/v4/api.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const result = await res.json()

    if (result.status === 'SUCCESS' && result.GatewayPageURL) {
      return {
        success: true,
        gatewayUrl: result.GatewayPageURL,
        sessionKey: result.sessionkey,
      }
    }

    return {
      success: false,
      error: result.failedreason || 'Payment initiation failed',
    }
  } catch (err) {
    console.error('SSLCommerz initiation error:', err)
    return { success: false, error: 'Payment gateway unavailable' }
  }
}

/**
 * Validate a payment using SSLCommerz Validation API.
 * MUST be called server-side before marking payment as successful.
 */
export async function validatePayment(valId: string): Promise<{
  valid: boolean
  tranId?: string
  amount?: number
  cardType?: string
  bankTranId?: string
  status?: string
  error?: string
  rawResponse?: Record<string, unknown>
}> {
  const { storeId, storePassword, baseUrl } = getConfig()

  const url = new URL(`${baseUrl}/validator/api/validationserverAPI.php`)
  url.searchParams.set('val_id', valId)
  url.searchParams.set('store_id', storeId)
  url.searchParams.set('store_passwd', storePassword)
  url.searchParams.set('format', 'json')

  try {
    const res = await fetch(url.toString())
    const data = await res.json()

    const isValid = data.status === 'VALID' || data.status === 'VALIDATED'

    return {
      valid: isValid,
      tranId: data.tran_id,
      amount: parseFloat(data.amount || '0'),
      cardType: data.card_type,
      bankTranId: data.bank_tran_id,
      status: data.status,
      rawResponse: data,
    }
  } catch (err) {
    console.error('SSLCommerz validation error:', err)
    return { valid: false, error: 'Payment validation failed' }
  }
}
