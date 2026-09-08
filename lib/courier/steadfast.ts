/**
 * Steadfast Courier API Implementation.
 * 
 * API Docs: https://portal.steadfast.com.bd
 * Auth: Api-Key + Secret-Key headers on every request.
 */

import type { CourierAdapter, CreateParcelInput, CreateParcelResult, ParcelStatus, CourierBalance } from './interface'

const BASE_URL = process.env.STEADFAST_BASE_URL || 'https://portal.steadfast.com.bd/api/v1'

function getHeaders(): Record<string, string> {
  const apiKey = process.env.STEADFAST_API_KEY || ''
  const secretKey = process.env.STEADFAST_SECRET_KEY || ''

  if (!apiKey || !secretKey) {
    throw new Error('Steadfast API credentials not configured. Set STEADFAST_API_KEY and STEADFAST_SECRET_KEY.')
  }

  return {
    'Api-Key': apiKey,
    'Secret-Key': secretKey,
    'Content-Type': 'application/json',
  }
}

export class SteadfastCourier implements CourierAdapter {
  readonly name = 'Steadfast'

  async createParcel(input: CreateParcelInput): Promise<CreateParcelResult> {
    try {
      const res = await fetch(`${BASE_URL}/create_order`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          invoice: input.orderNumber,
          recipient_name: input.recipientName,
          recipient_phone: input.recipientPhone,
          recipient_address: input.recipientAddress,
          cod_amount: input.codAmount,
          note: input.note || '',
          item_description: input.itemDescription || '',
        }),
      })

      const data = await res.json()

      if (data.status === 200 && data.consignment) {
        return {
          success: true,
          consignmentId: String(data.consignment.consignment_id),
          trackingCode: data.consignment.tracking_code,
        }
      }

      return {
        success: false,
        error: data.message || data.errors?.join(', ') || 'Failed to create Steadfast parcel',
      }
    } catch (err) {
      console.error('Steadfast createParcel error:', err)
      return { success: false, error: 'Steadfast API unavailable' }
    }
  }

  async getStatus(consignmentId: string): Promise<ParcelStatus> {
    try {
      const res = await fetch(`${BASE_URL}/status_by_cid/${consignmentId}`, {
        headers: getHeaders(),
      })
      const data = await res.json()

      return {
        status: data.delivery_status || 'unknown',
        details: data,
      }
    } catch (err) {
      console.error('Steadfast getStatus error:', err)
      return { status: 'unknown' }
    }
  }

  async checkBalance(): Promise<CourierBalance> {
    try {
      const res = await fetch(`${BASE_URL}/get_balance`, {
        headers: getHeaders(),
      })
      const data = await res.json()

      return { balance: data.current_balance || 0 }
    } catch (err) {
      console.error('Steadfast checkBalance error:', err)
      return { balance: 0 }
    }
  }
}

/**
 * Map Steadfast delivery status to Poshra order status.
 * Returns null if no mapping / no action needed.
 */
export function mapSteadfastStatus(steadfastStatus: string): {
  orderStatus: string | null
  paymentStatus: string | null
  note: string
} {
  switch (steadfastStatus) {
    case 'delivered':
      return {
        orderStatus: 'delivered',
        paymentStatus: 'paid', // COD collected by courier
        note: 'Delivered by Steadfast courier',
      }
    case 'partial_delivered':
      return {
        orderStatus: 'delivered',
        paymentStatus: 'paid',
        note: 'Partially delivered by Steadfast courier',
      }
    case 'cancelled':
      return {
        orderStatus: 'cancelled',
        paymentStatus: null,
        note: 'Delivery cancelled/refused — Steadfast',
      }
    case 'in_review':
    case 'pending':
      return {
        orderStatus: null, // No status change
        paymentStatus: null,
        note: `Steadfast status: ${steadfastStatus}`,
      }
    case 'hold':
      return {
        orderStatus: null,
        paymentStatus: null,
        note: 'Delivery on hold — Steadfast (customer requested delay or unreachable)',
      }
    default:
      return {
        orderStatus: null,
        paymentStatus: null,
        note: `Steadfast status update: ${steadfastStatus}`,
      }
  }
}
