'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  Plus,
  FileSpreadsheet,
  Search,
  Edit2,
  Trash2,
  TrendingUp,
  Package,
  AlertTriangle,
  Loader2,
  Filter,
} from 'lucide-react'
import {
  fetchAdminProductsAction,
  deleteProductAction,
  type AdminProductListItem,
} from '@/lib/actions/products'
import { formatBDT } from '@/lib/utils'
import { ProductForm } from './ProductForm'
import { BulkProductImportModal } from './BulkProductImportModal'

interface AdminProductListProps {
  categories: { id: string; name: string }[]
}

export function AdminProductList({ categories }: AdminProductListProps) {
  const [products, setProducts] = useState<AdminProductListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [page, setPage] = useState(1)

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<AdminProductListItem | null>(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    const res = await fetchAdminProductsAction({
      search,
      categoryId: selectedCategory,
      page,
      limit: 15,
    })

    if (res.success) {
      setProducts(res.products)
      setTotal(res.total)
    }
    setLoading(false)
  }, [search, selectedCategory, page])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return
    }

    const res = await deleteProductAction(id)
    if (res.success) {
      loadProducts()
    } else {
      alert(res.error || 'Failed to delete product')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your catalog, stock levels, and monitor LIFEGOOD profit margins
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Bulk Import (CSV)</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search products by name, SKU, or LIFEGOOD ref..."
            className="w-full rounded-xl border-0 bg-gray-50 pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-gray-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-2xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin text-gray-900 mb-2" />
            <p className="text-xs">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-sm font-bold text-gray-700">No products found</p>
            <p className="text-xs text-gray-400 mt-1">
              Add your first product or import in bulk using CSV
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Selling Price</th>
                  <th className="px-4 py-3">Cost (LIFEGOOD)</th>
                  <th className="px-4 py-3">Gross Margin</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((prod) => {
                  const priceBdt = prod.price / 100
                  const costBdt = prod.cost_price ? prod.cost_price / 100 : 0
                  const profit = priceBdt - costBdt
                  const marginPct = priceBdt > 0 && costBdt > 0 ? (profit / priceBdt) * 100 : 0
                  const isLowStock = prod.stock_qty <= 5
                  const imageSrc = prod.images?.[0] || ''

                  return (
                    <tr key={prod.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Product details */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
                            {imageSrc ? (
                              <Image
                                src={imageSrc}
                                alt={prod.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-300">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate max-w-[220px]">
                              {prod.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 font-mono">
                              {prod.sku && <span>SKU: {prod.sku}</span>}
                              {prod.supplier_ref && (
                                <span className="truncate max-w-[120px]" title={prod.supplier_ref}>
                                  Ref: {prod.supplier_ref}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-gray-600">
                        {prod.category?.name || '—'}
                      </td>

                      {/* Selling Price */}
                      <td className="px-4 py-3.5 font-bold text-gray-900 font-mono">
                        {formatBDT(prod.price)}
                      </td>

                      {/* Cost Price */}
                      <td className="px-4 py-3.5 font-mono text-gray-500">
                        {prod.cost_price ? formatBDT(prod.cost_price) : '—'}
                      </td>

                      {/* Margin Helper */}
                      <td className="px-4 py-3.5">
                        {costBdt > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black ${
                                profit < 0
                                  ? 'bg-red-100 text-red-800'
                                  : marginPct >= 25
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              <TrendingUp className="h-3 w-3" />
                              {marginPct.toFixed(0)}%
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              (+৳{profit.toFixed(0)})
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px]">No cost set</span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                            prod.stock_qty === 0
                              ? 'bg-red-100 text-red-800'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {isLowStock && <AlertTriangle className="h-3 w-3 text-amber-600" />}
                          {prod.stock_qty}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            prod.is_active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {prod.is_active ? 'Active' : 'Draft'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingProduct(prod)}
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete Product"
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

        {/* Pagination Bar */}
        {total > 15 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-xs text-gray-500">
            <span>
              Showing {products.length} of {total} products
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-gray-200 px-3 py-1 font-semibold hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="font-bold text-gray-900">Page {page}</span>
              <button
                disabled={page * 15 >= total}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-gray-200 px-3 py-1 font-semibold hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl my-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              Add New Product
            </h2>
            <ProductForm
              categories={categories}
              onSuccess={() => {
                setIsAddModalOpen(false)
                loadProducts()
              }}
              onCancel={() => setIsAddModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl my-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              Edit Product: {editingProduct.name}
            </h2>
            <ProductForm
              initialData={{
                id: editingProduct.id,
                name: editingProduct.name,
                slug: editingProduct.slug,
                description: editingProduct.description || '',
                price: editingProduct.price / 100,
                cost_price: editingProduct.cost_price
                  ? editingProduct.cost_price / 100
                  : undefined,
                compare_at_price: editingProduct.compare_at_price
                  ? editingProduct.compare_at_price / 100
                  : undefined,
                category_id: editingProduct.category_id,
                stock_qty: editingProduct.stock_qty,
                sku: editingProduct.sku || '',
                supplier_ref: editingProduct.supplier_ref || '',
                images: editingProduct.images || [],
                is_active: editingProduct.is_active,
              }}
              categories={categories}
              onSuccess={() => {
                setEditingProduct(null)
                loadProducts()
              }}
              onCancel={() => setEditingProduct(null)}
            />
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      <BulkProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          loadProducts()
        }}
      />
    </div>
  )
}
