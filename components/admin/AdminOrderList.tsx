'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { fetchAdminOrdersAction, bulkUpdateStatusAction } from '@/lib/actions/orders'
import { formatBDT, timeAgo, getNextStatuses } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_STATUS_PIPELINE } from '@/types'
import type { OrderWithCustomer, OrderStatus } from '@/types'

interface Filters {
  status?: string
  search?: string
  payment?: string
  date?: string
  page?: string
}

export function AdminOrderList({ initialFilters }: { initialFilters: Filters }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [orders, setOrders] = useState<OrderWithCustomer[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [updating, setUpdating] = useState(false)

  const [filters, setFilters] = useState<Filters>({
    status: initialFilters.status || '',
    search: initialFilters.search || '',
    payment: initialFilters.payment || '',
    date: initialFilters.date || '',
    page: initialFilters.page || '1',
  })

  const TABS = [
    { label: 'All', value: '' },
    { label: 'Pending Confirmation', value: 'pending' },
    { label: 'Needs Supplier Order', value: 'confirmed' },
    { label: 'Ordered', value: 'ordered_from_supplier' },
    { label: 'Packed', value: 'packed' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Out for Delivery', value: 'out_for_delivery' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ]

  const fetchOrders = useCallback(async (currentFilters: Filters) => {
    setLoading(true)
    try {
      const res = await fetchAdminOrdersAction({
        status: currentFilters.status || undefined,
        payment: currentFilters.payment || undefined,
        search: currentFilters.search || undefined,
        dateRange: (currentFilters.date || undefined) as 'today' | '7days' | '30days' | 'all' | undefined,
        page: currentFilters.page ? parseInt(currentFilters.page) : 1,
        perPage: 20,
      })
      setOrders(res.orders || [])
      setTotal(res.totalCount || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders(filters)
    
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.search) params.set('search', filters.search)
    if (filters.payment) params.set('payment', filters.payment)
    if (filters.date) params.set('date', filters.date)
    if (filters.page && filters.page !== '1') params.set('page', filters.page)
    
    router.push(`?${params.toString()}`, { scroll: false })
  }, [filters, fetchOrders, router])

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: '1' }))
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(orders.map(o => o.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds)
    if (checked) {
      newSet.add(id)
    } else {
      newSet.delete(id)
    }
    setSelectedIds(newSet)
  }

  const getBulkNextStatus = () => {
    if (selectedIds.size === 0) return null
    const selectedOrders = orders.filter(o => selectedIds.has(o.id))
    
    // Find most common status
    const counts: Record<string, number> = {}
    let maxStatus = selectedOrders[0]?.order_status || 'pending'
    let maxCount = 0
    
    for (const order of selectedOrders) {
      counts[order.order_status] = (counts[order.order_status] || 0) + 1
      if (counts[order.order_status] > maxCount) {
        maxCount = counts[order.order_status]
        maxStatus = order.order_status
      }
    }
    
    const nextStatuses = getNextStatuses(maxStatus)
    return nextStatuses.length > 0 ? nextStatuses[0] : null
  }

  const handleBulkUpdate = async (nextStatus: OrderStatus) => {
    if (selectedIds.size === 0 || !nextStatus) return
    if (!confirm(`Are you sure you want to update ${selectedIds.size} orders to ${ORDER_STATUS_LABELS[nextStatus]}?`)) return
    
    setUpdating(true)
    try {
      const ids = Array.from(selectedIds)
      const res = await bulkUpdateStatusAction(ids, nextStatus)
      if (res?.success) {
        alert(res.message || 'Orders updated successfully')
        setSelectedIds(new Set())
        fetchOrders(filters)
      } else {
        alert(res?.error || 'Failed to update orders')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred during bulk update')
    } finally {
      setUpdating(false)
    }
  }

  const bulkNextStatus = getBulkNextStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by order #, phone, name..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Quick filter tabs */}
      <div className="flex overflow-x-auto pb-2 border-b gap-6 whitespace-nowrap scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => handleFilterChange('status', tab.value)}
            className={`pb-2 text-sm font-medium transition-colors ${
              (filters.status || '') === tab.value
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Secondary filters */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm font-medium text-gray-700 border px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
        >
          {showFilters ? 'Hide Filters' : 'More Filters'}
        </button>
      </div>

      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-md flex flex-wrap gap-4 border">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="text-sm border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={filters.payment}
              onChange={(e) => handleFilterChange('payment', e.target.value)}
              className="text-sm border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="cod">Cash on Delivery</option>
              <option value="online">Online Payment</option>
            </select>
          </div>
        </div>
      )}

      {/* Order table */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && selectedIds.size === orders.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Payment</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Age</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 w-4 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-4 space-y-1">
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                      <div className="h-3 w-20 bg-gray-100 rounded" />
                    </td>
                    <td className="px-4 py-4"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-4 hidden sm:table-cell"><div className="h-5 w-20 bg-gray-200 rounded-full" /></td>
                    <td className="px-4 py-4 hidden md:table-cell"><div className="h-5 w-12 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-4 hidden lg:table-cell"><div className="h-4 w-14 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-4 text-right"><div className="h-4 w-10 bg-gray-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-sm font-medium text-gray-600">No orders found</p>
                      <p className="text-xs text-gray-400">
                        {filters.status || filters.search || filters.payment || filters.date
                          ? 'No orders match your active filter criteria.'
                          : 'Orders placed by customers will appear here.'}
                      </p>
                      {(filters.status || filters.search || filters.payment || filters.date) && (
                        <button
                          type="button"
                          onClick={() => setFilters({ status: '', search: '', payment: '', date: '', page: '1' })}
                          className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order.id)}
                        onChange={(e) => handleSelectOne(order.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.order_number}`} className="font-mono font-medium text-blue-600 hover:underline">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{order.customer_name}</div>
                      <div className="text-xs text-gray-500">{order.customer_phone}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatBDT(order.total)}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          ORDER_STATUS_COLORS[order.order_status] ?? 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {ORDER_STATUS_LABELS[order.order_status] ?? order.order_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {order.payment_method === 'cod' ? 'COD' : 'Online'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      {timeAgo(order.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.order_number}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center"
                      >
                        View &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{orders.length > 0 ? 1 : 0}</span> to <span className="font-medium">{orders.length}</span> of <span className="font-medium">{total}</span> orders
          </div>
          <div className="flex gap-2">
            <button 
              disabled={filters.page === '1'}
              onClick={() => handleFilterChange('page', String(Math.max(1, parseInt(filters.page || '1') - 1)))}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
              Previous
            </button>
            <button 
              disabled={orders.length === 0 || orders.length < 20 /* Assuming 20 per page */}
              onClick={() => handleFilterChange('page', String(parseInt(filters.page || '1') + 1))}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
          <span className="font-medium text-sm">
            {selectedIds.size} selected
          </span>
          
          <div className="flex items-center gap-3 border-l border-gray-700 pl-6">
            {bulkNextStatus ? (
              <button
                disabled={updating}
                onClick={() => handleBulkUpdate(bulkNextStatus as OrderStatus)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
              >
                {updating ? 'Updating...' : `Advance to ${ORDER_STATUS_LABELS[bulkNextStatus as OrderStatus]}`}
              </button>
            ) : (
              <span className="text-gray-400 text-sm">Cannot advance status</span>
            )}
            
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
