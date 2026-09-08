'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Tag,
  Edit2,
  Trash2,
  Calendar,
  Loader2,
  CheckCircle2,
  XCircle,
  Percent,
  Banknote,
} from 'lucide-react'
import {
  fetchAdminCouponsAction,
  createOrUpdateCouponAction,
  deleteCouponAction,
  toggleCouponActiveAction,
  type CouponInput,
} from '@/lib/actions/coupons'
import { formatBDT, formatDate } from '@/lib/utils'
import type { Coupon, CouponType } from '@/types'

export function CouponList() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)

  // Modal
  const [isOpen, setIsOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

  // Form State
  const [code, setCode] = useState('')
  const [type, setType] = useState<CouponType>('percent')
  const [value, setValue] = useState('')
  const [minOrderAmount, setMinOrderAmount] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCoupons = useCallback(async () => {
    setLoading(true)
    const res = await fetchAdminCouponsAction()
    if (res.success) {
      setCoupons(res.coupons)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadCoupons()
  }, [loadCoupons])

  const openCreateModal = () => {
    setEditingCoupon(null)
    setCode('')
    setType('percent')
    setValue('')
    setMinOrderAmount('')
    setUsageLimit('')
    setExpiresAt('')
    setIsActive(true)
    setError(null)
    setIsOpen(true)
  }

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setCode(coupon.code)
    setType(coupon.type as CouponType)
    // If flat, value in DB is paisa; display in BDT
    setValue(coupon.type === 'flat' ? String(coupon.value / 100) : String(coupon.value))
    setMinOrderAmount(coupon.min_order_amount ? String(coupon.min_order_amount / 100) : '')
    setUsageLimit(coupon.usage_limit !== null ? String(coupon.usage_limit) : '')
    setExpiresAt(
      coupon.expires_at
        ? new Date(coupon.expires_at).toISOString().slice(0, 16)
        : ''
    )
    setIsActive(coupon.is_active)
    setError(null)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue <= 0) {
      setError('Please provide a valid discount value.')
      setSaving(false)
      return
    }

    const payload: CouponInput = {
      id: editingCoupon?.id,
      code,
      type,
      value: numValue,
      min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
      usage_limit: usageLimit ? parseInt(usageLimit, 10) : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      is_active: isActive,
    }

    const res = await createOrUpdateCouponAction(payload)
    setSaving(false)

    if (res.success) {
      setIsOpen(false)
      loadCoupons()
    } else {
      setError(res.error || 'Failed to save coupon.')
    }
  }

  const handleDelete = async (id: string, couponCode: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${couponCode}"?`)) return
    const res = await deleteCouponAction(id)
    if (res.success) {
      loadCoupons()
    } else {
      alert(res.error || 'Failed to delete coupon')
    }
  }

  const handleToggle = async (id: string, currentState: boolean) => {
    const res = await toggleCouponActiveAction(id, !currentState)
    if (res.success) {
      loadCoupons()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons & Discounts</h1>
          <p className="text-xs text-gray-500 mt-1">
            Create promotional codes to increase conversions and reward loyal customers
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-2xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin text-gray-900 mb-2" />
            <p className="text-xs">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Tag className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-sm font-bold text-gray-700">No coupons yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Create your first promotional discount coupon
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Coupon Code</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Min. Order</th>
                  <th className="px-4 py-3">Usage</th>
                  <th className="px-4 py-3">Expiry</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((coupon) => {
                  const isExpired =
                    coupon.expires_at && new Date(coupon.expires_at) < new Date()
                  const isLimitReached =
                    coupon.usage_limit && coupon.times_used >= coupon.usage_limit

                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Code */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 font-mono font-bold text-sm text-gray-900 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg">
                            <Tag className="h-3 w-3 text-emerald-600" />
                            {coupon.code}
                          </span>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
                          {coupon.type === 'percent' ? (
                            <>
                              <Percent className="h-3 w-3" />
                              {coupon.value}% OFF
                            </>
                          ) : (
                            <>
                              <Banknote className="h-3 w-3" />
                              {formatBDT(coupon.value)} Flat OFF
                            </>
                          )}
                        </span>
                      </td>

                      {/* Min order */}
                      <td className="px-4 py-3.5 font-mono text-gray-700">
                        {coupon.min_order_amount > 0
                          ? formatBDT(coupon.min_order_amount)
                          : 'No Minimum'}
                      </td>

                      {/* Usage */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-gray-900 font-medium">
                          {coupon.times_used}
                        </span>
                        <span className="text-gray-400 font-mono">
                          {' '}
                          / {coupon.usage_limit ? coupon.usage_limit : '∞'}
                        </span>
                        {isLimitReached && (
                          <span className="ml-2 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                            Limit Reached
                          </span>
                        )}
                      </td>

                      {/* Expiry */}
                      <td className="px-4 py-3.5">
                        {coupon.expires_at ? (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className={isExpired ? 'text-red-600 font-semibold' : ''}>
                              {formatDate(coupon.expires_at)}
                            </span>
                            {isExpired && (
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                Expired
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Never expires</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggle(coupon.id, coupon.is_active)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                            coupon.is_active && !isExpired && !isLimitReached
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {coupon.is_active && !isExpired && !isLimitReached ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 text-gray-400" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(coupon)}
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            title="Edit Coupon"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id, coupon.code)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete Coupon"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Coupon'}
            </h2>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER25"
                  className="w-full font-mono text-sm font-bold uppercase rounded-xl border border-gray-300 px-3 py-2.5 focus:border-gray-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CouponType)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:border-gray-900 focus:outline-none bg-white"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (৳ BDT)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Value * {type === 'percent' ? '(%)' : '(৳ BDT)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={type === 'percent' ? 100 : undefined}
                    step="any"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={type === 'percent' ? '15' : '200'}
                    className="w-full font-semibold rounded-xl border border-gray-300 px-3 py-2.5 focus:border-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Min. Order Amount (৳ BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder="0 (No minimum)"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:border-gray-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="Unlimited"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:border-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Expiration Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:border-gray-900 focus:outline-none bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="coupon_active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <label htmlFor="coupon_active" className="text-xs font-semibold text-gray-900">
                  Coupon is active and can be redeemed
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2 font-bold text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingCoupon ? 'Update Coupon' : 'Create Coupon'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
