/**
 * Format a BDT paisa amount as a human-readable taka string.
 * e.g. 50000 paisa → "৳500"
 */
export function formatBDT(paisa: number): string {
  const taka = paisa / 100
  return `৳${taka.toLocaleString('en-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

/**
 * Format a date for display (BD locale).
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Generate a URL-safe slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Calculate the effective price for a cart item (base + variant adjustment).
 */
export function effectivePrice(
  basePrice: number,
  variantAdjustment: number = 0
): number {
  return basePrice + variantAdjustment
}

/**
 * Apply a coupon discount to a subtotal.
 * Returns the discount amount in paisa.
 */
export function applyCoupon(
  subtotal: number,
  couponType: 'percent' | 'flat',
  couponValue: number
): number {
  if (couponType === 'percent') {
    return Math.round((subtotal * couponValue) / 100)
  }
  return Math.min(couponValue, subtotal) // flat — never negative total
}

/**
 * Determine delivery zone based on district name.
 * Dhaka district → inside_dhaka; everything else → outside_dhaka.
 */
export function getDeliveryZone(
  district: string
): 'inside_dhaka' | 'outside_dhaka' {
  return district.toLowerCase() === 'dhaka' ? 'inside_dhaka' : 'outside_dhaka'
}

/**
 * Standard delivery fees in paisa.
 * These are defaults — admin can override in settings (Stage 5).
 */
export const DELIVERY_FEES = {
  inside_dhaka: 6000,   // ৳60
  outside_dhaka: 12000, // ৳120
} as const

/**
 * Format a date as a relative time string (e.g. "2h ago", "3d ago").
 */
export function timeAgo(date: string | Date): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diff = now - then

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return formatDate(date)
}

/**
 * Order status pipeline — returns valid next statuses for a given current status.
 * 'cancelled' is always available. Pipeline moves forward only.
 */
export function getNextStatuses(
  currentStatus: string
): string[] {
  const pipeline = [
    'pending',
    'confirmed',
    'ordered_from_supplier',
    'packed',
    'shipped',
    'out_for_delivery',
    'delivered',
  ]

  const currentIndex = pipeline.indexOf(currentStatus)
  if (currentIndex === -1 || currentStatus === 'delivered' || currentStatus === 'cancelled') {
    return []
  }

  // Can advance to next step + cancel
  const next = pipeline[currentIndex + 1]
  return next ? [next, 'cancelled'] : ['cancelled']
}

/**
 * Copy text to clipboard. Returns true on success.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }
}
