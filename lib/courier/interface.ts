/**
 * Courier Adapter Interface — pluggable courier integration.
 * 
 * Currently implements Steadfast Courier.
 * Add Pathao or another courier by implementing this interface.
 */

export interface CreateParcelInput {
  orderNumber: string
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  codAmount: number      // BDT (not paisa)
  note?: string
  itemDescription?: string
}

export interface CreateParcelResult {
  success: boolean
  consignmentId?: string
  trackingCode?: string
  error?: string
}

export interface ParcelStatus {
  status: string
  details?: Record<string, unknown>
}

export interface CourierBalance {
  balance: number
}

export interface CourierAdapter {
  readonly name: string
  createParcel(input: CreateParcelInput): Promise<CreateParcelResult>
  getStatus(consignmentId: string): Promise<ParcelStatus>
  checkBalance(): Promise<CourierBalance>
}
