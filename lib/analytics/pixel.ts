/**
 * Client-Side Meta Pixel Tracking Helpers
 * Standard Meta Events: ViewContent, AddToCart, InitiateCheckout, Purchase
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void
    _fbq?: any
  }
}

export function fbTrack(
  eventName: string,
  params?: Record<string, any>,
  options?: { eventID?: string }
) {
  if (typeof window === 'undefined') return

  if (typeof window.fbq === 'function') {
    if (options?.eventID) {
      window.fbq('track', eventName, params, { eventID: options.eventID })
    } else {
      window.fbq('track', eventName, params)
    }
  } else if (process.env.NODE_ENV !== 'production') {
    console.log(`[Meta Pixel Mock] ${eventName}`, params, options)
  }
}

/**
 * ViewContent — fired on product detail page
 */
export function trackViewContent(product: {
  id: string
  name: string
  price: number // in BDT
  category?: string
}) {
  fbTrack('ViewContent', {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    content_category: product.category || 'General',
    value: product.price,
    currency: 'BDT',
  })
}

/**
 * AddToCart — fired when an item is added to cart
 */
export function trackAddToCart(product: {
  id: string
  name: string
  price: number // in BDT
  quantity: number
}) {
  fbTrack('AddToCart', {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price * product.quantity,
    currency: 'BDT',
  })
}

/**
 * InitiateCheckout — fired when customer lands on checkout page
 */
export function trackInitiateCheckout(totalBdt: number, numItems: number) {
  fbTrack('InitiateCheckout', {
    value: totalBdt,
    currency: 'BDT',
    num_items: numItems,
  })
}

/**
 * Purchase — fired on order confirmation page
 * eventID must match the server CAPI event_id for Meta deduplication!
 */
export function trackPurchase(order: {
  orderNumber: string
  totalBdt: number
  numItems: number
}) {
  fbTrack(
    'Purchase',
    {
      value: order.totalBdt,
      currency: 'BDT',
      num_items: order.numItems,
      content_type: 'product',
    },
    { eventID: order.orderNumber }
  )
}
