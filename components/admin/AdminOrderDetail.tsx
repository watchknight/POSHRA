'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { updateOrderStatusAction, updateOrderFieldsAction } from '@/lib/actions/orders'
import { createSteadfastParcelAction, syncSteadfastStatusAction } from '@/lib/actions/courier'
import { formatBDT, formatDate, timeAgo, getNextStatuses, copyToClipboard } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_STATUS_PIPELINE } from '@/types'
import type { OrderItem, StatusHistoryEntry, OrderStatus } from '@/types'
import { CancelOrderModal } from './CancelOrderModal'

interface AdminOrderDetailProps {
  order: {
    id: string
    order_number: string
    customer_id: string | null
    items: any // OrderItem[]
    subtotal: number
    discount_amount: number
    delivery_fee: number
    total: number
    payment_method: string
    payment_status: string
    order_status: string
    delivery_district: string
    delivery_thana: string
    delivery_address_line: string
    delivery_zone: string
    supplier_order_ref: string | null
    courier_name: string | null
    courier_tracking_code: string | null
    status_history: any // StatusHistoryEntry[]
    admin_note: string | null
    coupon_code: string | null
    otp_verified: boolean
    created_at: string
    updated_at: string
    customer_name: string
    customer_phone: string
    customer_email: string | null
    steadfast_consignment_id: string | null
    fraud_score: number
    fraud_signals: any
    payment_details: any
  }
}

function EditableField({ 
  label, 
  value, 
  onSave, 
  isTextarea = false 
}: { 
  label: string; 
  value: string; 
  onSave: (val: string) => Promise<boolean>;
  isTextarea?: boolean;
}) {
  const [currentValue, setCurrentValue] = useState(value || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const timer = useRef<NodeJS.Timeout>(null)

  const handleBlur = async () => {
    if (currentValue !== (value || '')) {
      setIsSaving(true)
      const success = await onSave(currentValue)
      setIsSaving(false)
      if (success) {
        setSaved(true)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => setSaved(false), 2000)
      }
    }
  }

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {isSaving && <span className="text-xs text-gray-500">Saving...</span>}
        {saved && <span className="text-xs text-green-600 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Saved
        </span>}
      </div>
      {isTextarea ? (
        <textarea
          value={currentValue}
          onChange={e => setCurrentValue(e.target.value)}
          onBlur={handleBlur}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          rows={3}
        />
      ) : (
        <div className="relative">
          <input
            type="text"
            value={currentValue}
            onChange={e => setCurrentValue(e.target.value)}
            onBlur={handleBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
             <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}

export function AdminOrderDetail({ order }: AdminOrderDetailProps) {
  const router = useRouter()
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [transitioningStatus, setTransitioningStatus] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isCourierLoading, setIsCourierLoading] = useState(false)
  const [isSyncingCourier, setIsSyncingCourier] = useState(false)

  const handleSendToSteadfast = async () => {
    setIsCourierLoading(true)
    try {
      const result = await createSteadfastParcelAction(order.id)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || 'Failed to create Steadfast parcel')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred while creating the parcel')
    } finally {
      setIsCourierLoading(false)
    }
  }

  const handleSyncSteadfastStatus = async () => {
    setIsSyncingCourier(true)
    try {
      const res = await syncSteadfastStatusAction(order.id)
      if (res.success) {
        alert(res.message || 'Steadfast status synced successfully')
        router.refresh()
      } else {
        alert(res.error || 'Failed to sync status with Steadfast')
      }
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Failed to sync courier status')
    } finally {
      setIsSyncingCourier(false)
    }
  }

  const nextStatuses = getNextStatuses(order.order_status as OrderStatus)
  const statusColor = ORDER_STATUS_COLORS[order.order_status as OrderStatus] || 'bg-gray-100 text-gray-800'
  const statusLabel = ORDER_STATUS_LABELS[order.order_status as OrderStatus] || order.order_status

  const handleStatusTransition = async (newStatus: string) => {
    setTransitioningStatus(newStatus)
    try {
      const result = await updateOrderStatusAction(order.id, newStatus as OrderStatus)
      if (result.success) {
        router.refresh()
      }
    } finally {
      setTransitioningStatus(null)
    }
  }

  const handleFieldSave = async (field: string, value: string) => {
    const result = await updateOrderFieldsAction(order.id, { [field]: value })
    if (result.success) {
      router.refresh()
      return true
    }
    return false
  }

  const handleCopyShippingDetails = async () => {
    const itemsText = order.items.map((item: any) => `- ${item.name} ${item.variant_label ? `(${item.variant_label})` : ''} × ${item.quantity}`).join('\n')
    const text = `Name: ${order.customer_name}\nPhone: ${order.customer_phone}\nAddress: ${order.delivery_address_line}\nDistrict: ${order.delivery_district}\nThana: ${order.delivery_thana}\nItems:\n${itemsText}`
    
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const showCopyButton = ['ordered_from_supplier', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes(order.order_status)

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Fraud Warning Banner */}
      {order.fraud_score > 0 && (
        <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
          order.fraud_score > 30 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <div>
            <h3 className="font-bold">⚠️ Fraud Risk Score: {order.fraud_score}</h3>
            {order.fraud_signals && order.fraud_signals.length > 0 && (
              <ul className="mt-1 list-disc list-inside text-sm">
                {order.fraud_signals.map((signal: string, i: number) => (
                  <li key={i}>{signal}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link href="/admin/orders" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center mb-2">
            ← Back to Orders
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-gray-900 font-mono tracking-tight">{order.order_number}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
              {statusLabel}
            </span>
            {order.otp_verified === true ? (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                ✓ OTP Verified
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                ⚠ OTP Not Verified
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">Placed {timeAgo(new Date(order.created_at))}</p>
        </div>

        {/* Action Buttons */}
        {order.order_status !== 'cancelled' && order.order_status !== 'delivered' && (
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map(status => (
              <button
                key={status}
                onClick={() => handleStatusTransition(status)}
                disabled={transitioningStatus !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {transitioningStatus === status && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                )}
                Mark as {ORDER_STATUS_LABELS[status as OrderStatus]}
              </button>
            ))}
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancel Order
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer Info Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Customer & Delivery Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xl font-medium text-gray-900 mb-1">{order.customer_name}</p>
                <a href={`tel:${order.customer_phone}`} className="text-indigo-600 hover:underline flex items-center mb-1">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {order.customer_phone}
                </a>
                {order.customer_email && (
                  <p className="text-gray-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {order.customer_email}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Delivery Address</p>
                <p className="text-gray-900">{order.delivery_address_line}</p>
                <p className="text-gray-900">{order.delivery_thana}, {order.delivery_district}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Zone: {order.delivery_zone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 py-2">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md overflow-hidden relative">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    {item.variant_label && (
                      <p className="text-xs text-gray-500">{item.variant_label}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 whitespace-nowrap">
                    {item.quantity} × {formatBDT(item.price)}
                  </div>
                  <div className="text-sm font-medium text-gray-900 whitespace-nowrap w-24 text-right">
                    {formatBDT(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">{formatBDT(order.subtotal)}</dd>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-green-600">
                      Discount {order.coupon_code ? `(${order.coupon_code})` : ''}
                    </dt>
                    <dd className="text-sm font-medium text-green-600">-{formatBDT(order.discount_amount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Delivery Fee</dt>
                  <dd className="text-sm font-medium text-gray-900">{formatBDT(order.delivery_fee)}</dd>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                  <dt className="text-base font-bold text-gray-900">Total</dt>
                  <dd className="text-lg font-bold text-gray-900">{formatBDT(order.total)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Payment Info Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Payment Information</h2>
            <div className="flex gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Method</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 uppercase">
                  {order.payment_method}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${
                  order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                  order.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                } uppercase`}>
                  {order.payment_status}
                </span>
              </div>
            </div>
            {order.payment_method === 'online' && order.payment_details && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm overflow-hidden">
                <p className="font-medium text-gray-900 mb-2">Gateway Details</p>
                <div className="space-y-1 text-gray-600">
                  {Object.entries(order.payment_details).map(([key, value]) => {
                    if (value === null || value === '' || typeof value === 'object') return null;
                    return (
                      <p key={key} className="break-all">
                        <span className="font-medium text-gray-700">{key}:</span> {String(value)}
                      </p>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (1/3 width on large screens) */}
        <div className="space-y-6">
          
          {/* Supplier Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Supplier (LIFEGOOD)</h2>
            <EditableField 
              label="Supplier Order Ref" 
              value={order.supplier_order_ref || ''} 
              onSave={(val) => handleFieldSave('supplier_order_ref', val)} 
            />
            {showCopyButton && (
              <button
                onClick={handleCopyShippingDetails}
                className="w-full mt-2 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    📋 Copy Shipping Details
                  </>
                )}
              </button>
            )}
          </div>

          {/* Courier Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Courier / Shipping</h2>
            {['packed', 'shipped', 'out_for_delivery'].includes(order.order_status) && (
              <div className="mb-6">
                {order.steadfast_consignment_id ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm font-medium flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Parcel Created ✓
                      </div>
                      <button
                        type="button"
                        onClick={handleSyncSteadfastStatus}
                        disabled={isSyncingCourier}
                        className="text-xs px-2.5 py-1 bg-white border border-green-300 rounded shadow-xs hover:bg-green-100 text-green-900 font-medium transition-colors disabled:opacity-50"
                      >
                        {isSyncingCourier ? 'Syncing...' : '🔄 Sync Status'}
                      </button>
                    </div>
                    <span className="text-xs font-normal opacity-80 break-all">Consignment ID: {order.steadfast_consignment_id}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSendToSteadfast}
                    disabled={isCourierLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    {isCourierLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Creating Parcel...
                      </span>
                    ) : '📦 Send to Steadfast Courier'}
                  </button>
                )}
              </div>
            )}
            <EditableField 
              label="Courier Name" 
              value={order.courier_name || ''} 
              onSave={(val) => handleFieldSave('courier_name', val)} 
            />
            <EditableField 
              label="Tracking Code" 
              value={order.courier_tracking_code || ''} 
              onSave={(val) => handleFieldSave('courier_tracking_code', val)} 
            />
          </div>

          {/* Admin Note Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Admin Note</h2>
            <EditableField 
              label="Internal Note" 
              value={order.admin_note || ''} 
              onSave={(val) => handleFieldSave('admin_note', val)} 
              isTextarea 
            />
          </div>

          {/* Status History */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Status History</h2>
            <div className="flow-root">
              <ul className="-mb-8">
                {order.status_history?.map((entry: any, entryIdx: number) => {
                  const statusColorClass = ORDER_STATUS_COLORS[entry.status as OrderStatus]?.replace('bg-', 'text-').replace('-100', '-500').replace('-800', '-500') || 'text-gray-500'
                  return (
                    <li key={entryIdx}>
                      <div className="relative pb-8">
                        {entryIdx !== (order.status_history?.length || 0) - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-gray-50 ${statusColorClass}`}>
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="5" />
                              </svg>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                <span className="font-medium text-gray-900">{ORDER_STATUS_LABELS[entry.status as OrderStatus] || entry.status}</span>
                              </p>
                              {entry.note && (
                                <p className="mt-1 text-sm text-gray-500">{entry.note}</p>
                              )}
                            </div>
                            <div className="text-right text-xs whitespace-nowrap text-gray-500">
                              {formatDate(entry.at)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

        </div>
      </div>

      <CancelOrderModal 
        isOpen={isCancelModalOpen} 
        onClose={() => setIsCancelModalOpen(false)} 
        onSuccess={() => router.refresh()} 
        orderId={order.id}
        orderNumber={order.order_number}
      />
    </div>
  )
}
