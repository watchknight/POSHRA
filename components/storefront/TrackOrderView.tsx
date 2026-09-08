'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { trackOrderAction } from '@/lib/actions/orders'
import { formatBDT, formatDate } from '@/lib/utils'
import { ORDER_STATUS_PIPELINE, CUSTOMER_STATUS_LABELS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types'
import { useLanguage } from '@/components/i18n/LanguageContext'
import type { OrderTrackingData, StatusHistoryEntry } from '@/types'

export function TrackOrderView({ initialOrderNumber }: { initialOrderNumber: string }) {
  const { t } = useLanguage()
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderData, setOrderData] = useState<OrderTrackingData | null>(null)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const result = await trackOrderAction(orderNumber, phoneNumber)
      if (result.success && result.data) {
        setOrderData(result.data)
      } else {
        setError(result.error || 'Failed to track order')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (orderData) {
    const isCancelled = orderData.order_status === 'cancelled'
    const statusHistoryMap = new Map(orderData.status_history.map((h: StatusHistoryEntry) => [h.status, h.at]))

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => setOrderData(null)} className="text-sm text-gray-500 hover:text-gray-900 mb-6 flex items-center">
          &larr; Back to search
        </button>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{orderData.order_number}</h1>
              <p className="text-gray-600 mt-1">Hi {orderData.customer_name}, here is your order status.</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${ORDER_STATUS_COLORS[orderData.order_status] || 'bg-gray-100 text-gray-800'}`}>
              {ORDER_STATUS_LABELS[orderData.order_status] || orderData.order_status}
            </span>
          </div>

          <div className="relative py-4 pl-4 border-l-2 border-gray-200 space-y-8">
            {isCancelled ? (
              <div className="relative">
                <div className="absolute -left-[1.375rem] w-4 h-4 rounded-full bg-red-500 border-4 border-white shadow"></div>
                <div className="ml-4">
                  <h3 className="font-semibold text-red-600">{CUSTOMER_STATUS_LABELS['cancelled'] || 'This order has been cancelled'}</h3>
                  {statusHistoryMap.has('cancelled') && (
                    <p className="text-sm text-gray-500">{formatDate(statusHistoryMap.get('cancelled')!)}</p>
                  )}
                </div>
              </div>
            ) : (
              ORDER_STATUS_PIPELINE.map((pipelineStatus, index: number) => {
                const status = pipelineStatus
                const isCompleted = statusHistoryMap.has(status)
                const isCurrent = orderData.order_status === status
                const isFuture = !isCompleted && !isCurrent
                const timestamp = statusHistoryMap.get(status)

                return (
                  <div key={status} className="relative">
                    {/* Circle marker */}
                    <div className={`absolute -left-[1.375rem] rounded-full border-4 border-white shadow transition-all ${isCurrent ? 'bg-green-500 w-5 h-5 -left-[1.4375rem] animate-pulse' : isCompleted ? 'bg-green-500 w-4 h-4' : 'bg-gray-300 w-4 h-4'}`}></div>
                    
                    <div className={`ml-4 ${isFuture ? 'opacity-50' : ''}`}>
                      <h3 className={`font-medium ${isCurrent ? 'text-green-700 font-bold' : 'text-gray-900'}`}>
                      {CUSTOMER_STATUS_LABELS[status as keyof typeof CUSTOMER_STATUS_LABELS] || status}
                      </h3>
                      {timestamp && (
                        <p className="text-sm text-gray-500">{formatDate(timestamp)}</p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {orderData.courier_tracking_code && orderData.courier_name && (
          <div className="bg-white rounded-lg shadow p-6 mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Courier Tracking</h3>
              <p className="text-lg font-medium text-gray-900">{orderData.courier_name} - {orderData.courier_tracking_code}</p>
            </div>
            <button className="text-green-600 hover:text-green-800 font-medium text-sm">
              Track with {orderData.courier_name} &rarr;
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2 uppercase tracking-wider">{t.checkout.orderSummary}</h2>
          <div className="space-y-4">
            {orderData.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  {item.image_url && (
                    <div className="relative w-12 h-12 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-gray-900">{item.name}</p>
                    {item.variant_label && (
                      <p className="text-[11px] text-gray-500">{t.cart.variant}: {item.variant_label}</p>
                    )}
                    <p className="text-xs text-gray-500">Qty: <span className="tabular-nums">{item.quantity}</span></p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-bold text-gray-900 tabular-nums">{formatBDT(item.price * item.quantity)}</p>
              </div>
            ))}
            
            <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                <span>{t.cart.subtotal}</span>
                <span className="tabular-nums">{formatBDT(orderData.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                <span>{t.cart.deliveryFee}</span>
                <span className="tabular-nums">{formatBDT(orderData.delivery_fee)}</span>
              </div>
              {orderData.discount_amount > 0 && (
                <div className="flex justify-between text-xs sm:text-sm text-emerald-600">
                  <span>{t.cart.discount}</span>
                  <span className="tabular-nums">-{formatBDT(orderData.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm sm:text-base font-bold text-gray-900 border-t border-gray-100 pt-2">
                <span>{t.cart.total}</span>
                <span className="tabular-nums font-black">{formatBDT(orderData.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Track Your Order</h1>
          <p className="text-gray-500 mt-2">Enter your order number and phone number to track your order</p>
        </div>

        <form onSubmit={handleTrack} className="space-y-4">
          <div>
            <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Order Number
            </label>
            <input
              id="orderNumber"
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="ORD-10234"
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="01XXXXXXXXX"
              required
              pattern="01[0-9]{9}"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white font-medium py-2 px-4 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Tracking...' : 'Track Order'}
          </button>

          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-green-600 hover:text-green-800 font-medium">
              &larr; Back to store
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
