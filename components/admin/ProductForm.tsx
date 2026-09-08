'use client'

import { useState } from 'react'
import { createOrUpdateProductAction, type ProductInput } from '@/lib/actions/products'
import { formatBDT } from '@/lib/utils'
import { Loader2, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'

interface CategoryOption {
  id: string
  name: string
}

interface ProductFormProps {
  initialData?: Partial<ProductInput>
  categories: CategoryOption[]
  onSuccess: () => void
  onCancel: () => void
}

export function ProductForm({
  initialData,
  categories,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [price, setPrice] = useState<string>(
    initialData?.price !== undefined ? String(initialData.price) : ''
  )
  const [costPrice, setCostPrice] = useState<string>(
    initialData?.cost_price !== undefined ? String(initialData.cost_price) : ''
  )
  const [compareAtPrice, setCompareAtPrice] = useState<string>(
    initialData?.compare_at_price !== undefined ? String(initialData.compare_at_price) : ''
  )
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '')
  const [stockQty, setStockQty] = useState<string>(
    initialData?.stock_qty !== undefined ? String(initialData.stock_qty) : '10'
  )
  const [sku, setSku] = useState(initialData?.sku || '')
  const [supplierRef, setSupplierRef] = useState(initialData?.supplier_ref || '')
  const [imagesText, setImagesText] = useState(
    (initialData?.images || []).join('\n')
  )
  const [isActive, setIsActive] = useState(
    initialData?.is_active !== undefined ? initialData.is_active : true
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Margin Helper calculation ─────────────────────────────
  const numPrice = parseFloat(price) || 0
  const numCost = parseFloat(costPrice) || 0
  const profit = numPrice - numCost
  const marginPct = numPrice > 0 ? (profit / numPrice) * 100 : 0
  const isNegative = numCost > 0 && profit < 0
  const isHealthy = marginPct >= 25

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Product name is required.')
      return
    }
    if (numPrice <= 0) {
      setError('Please provide a valid selling price.')
      return
    }

    setSaving(true)
    setError(null)

    const images = imagesText
      .split('\n')
      .map((url) => url.trim())
      .filter(Boolean)

    const res = await createOrUpdateProductAction({
      id: initialData?.id,
      name,
      slug: slug || undefined,
      description,
      price: numPrice,
      cost_price: numCost > 0 ? numCost : undefined,
      compare_at_price: parseFloat(compareAtPrice) || undefined,
      category_id: categoryId || null,
      stock_qty: parseInt(stockQty, 10) || 0,
      sku: sku || undefined,
      supplier_ref: supplierRef || undefined,
      images,
      is_active: isActive,
    })

    setSaving(false)

    if (res.success) {
      onSuccess()
    } else {
      setError(res.error || 'Failed to save product.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Basic Info ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Premium Cotton Casual Shirt"
            className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-gray-900 focus:outline-none bg-white"
          >
            <option value="">Select Category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            SKU
          </label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="e.g. SHIRT-BLK-L"
            className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
          />
        </div>
      </div>

      {/* ── Pricing & LIVE MARGIN HELPER ─────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-gray-900">
              Pricing & Margin Calculator
            </h3>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Calculated in real-time
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Selling Price (৳) *
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 1250"
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm font-semibold focus:border-gray-900 focus:outline-none bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Cost Price (৳ LIFEGOOD)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="e.g. 750"
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm font-semibold focus:border-gray-900 focus:outline-none bg-white"
            />
            <p className="text-[11px] text-gray-400 mt-0.5">Admin-only, secret</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Compare-at Price (৳)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              placeholder="e.g. 1800"
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-gray-900 focus:outline-none bg-white"
            />
            <p className="text-[11px] text-gray-400 mt-0.5">Struck-through price</p>
          </div>
        </div>

        {/* Live Margin Banner */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition-all ${
            isNegative
              ? 'bg-red-50 border-red-200 text-red-800'
              : numCost > 0
              ? isHealthy
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-gray-100/70 border-gray-200 text-gray-600'
          }`}
        >
          <div className="flex items-center gap-2">
            {isNegative ? (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            ) : (
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            )}
            <span className="text-xs font-bold uppercase tracking-wider">
              {isNegative ? 'Negative Margin Warning' : 'Estimated Margin'}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-2 sm:mt-0 text-sm">
            <div>
              <span className="text-xs opacity-75">Profit / Item: </span>
              <strong className="font-mono">
                {numPrice > 0
                  ? numCost > 0
                    ? `৳${profit.toFixed(0)}`
                    : 'Enter cost price'
                  : '—'}
              </strong>
            </div>
            {numPrice > 0 && numCost > 0 && (
              <div
                className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                  isNegative
                    ? 'bg-red-200 text-red-900'
                    : isHealthy
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-amber-200 text-amber-900'
                }`}
              >
                {marginPct.toFixed(1)}% Margin
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Inventory & Supplier ───────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Stock Quantity
          </label>
          <input
            type="number"
            min="0"
            value={stockQty}
            onChange={(e) => setStockQty(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            LIFEGOOD Supplier Reference / Link
          </label>
          <input
            type="text"
            value={supplierRef}
            onChange={(e) => setSupplierRef(e.target.value)}
            placeholder="e.g. LG-94821 or product page link"
            className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
          />
        </div>
      </div>

      {/* ── Images ─────────────────────────────────────────── */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
          Image URLs (one per line)
        </label>
        <textarea
          rows={3}
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
          className="w-full font-mono text-xs rounded-xl border border-gray-300 p-3 focus:border-gray-900 focus:outline-none"
        />
      </div>

      {/* ── Description ────────────────────────────────────── */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
          Description
        </label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed product descriptions, features, and specs..."
          className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-gray-900 focus:outline-none"
        />
      </div>

      {/* ── Active Switch ──────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
        />
        <label htmlFor="is_active" className="text-sm font-medium text-gray-900">
          Product is Active & visible on storefront
        </label>
      </div>

      {/* ── Actions ────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-xs"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{initialData?.id ? 'Update Product' : 'Create Product'}</span>
        </button>
      </div>
    </form>
  )
}
