'use client'

import { useState } from 'react'
import { updateOrderStatusAction } from '@/lib/actions/orders'
import { OrderStatus } from '@/types'

interface CancelOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  orderId: string
  orderNumber: string
}

export function CancelOrderModal({ isOpen, onClose, onSuccess, orderId, orderNumber }: CancelOrderModalProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleCancel = async () => {
    if (!reason.trim()) {
      setError('Please provide a cancellation reason')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await updateOrderStatusAction(orderId, 'cancelled' as OrderStatus, reason)
      if (result.success) {
        onSuccess()
        onClose()
      } else {
        setError(result.error || 'Failed to cancel order')
      }
    } catch (e) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Cancel Order {orderNumber}?</h3>
        </div>
        <div className="px-6 py-4 flex-1">
          <p className="text-sm text-red-600 mb-4">Warning: This action cannot be undone.</p>
          <div className="space-y-2">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Cancellation Reason</label>
            <textarea
              id="reason"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setError(null)
              }}
              placeholder="Reason for cancellation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
              disabled={isSubmitting}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting || !reason.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cancelling...
              </>
            ) : (
              'Confirm Cancellation'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
