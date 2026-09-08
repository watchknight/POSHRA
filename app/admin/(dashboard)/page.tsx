import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { formatBDT, timeAgo } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/types'
import type { OrderStatus, PaymentMethod, OrderItem } from '@/types'
import {
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Factory,
  CheckCircle2,
  Package,
  ArrowRight,
  Clock,
  DollarSign,
  Tag,
  Star,
} from 'lucide-react'

export const metadata: Metadata = { title: 'Dashboard — Admin' }

interface RecentOrder {
  order_number: string
  order_status: OrderStatus
  total: number
  payment_method: PaymentMethod
  created_at: string
}

interface LowStockProduct {
  id: string
  name: string
  slug: string
  stock_qty: number
  price: number
}

interface BestSellerItem {
  productId: string
  name: string
  quantitySold: number
  totalRevenue: number
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()

  // 1. Calculate today's midnight timestamp in UTC
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIso = today.toISOString()

  // 2. Fetch queries in parallel
  const [
    { count: totalOrdersCount },
    { data: todayOrdersRaw },
    { count: pendingOrdersCount },
    { count: confirmedOrdersCount },
    { data: lowStockProductsRaw },
    { data: allOrdersForMetricsRaw },
    { data: recentOrdersRaw },
    { count: pendingReviewsCount },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('id, total, order_status')
      .gte('created_at', todayIso)
      .neq('order_status', 'cancelled'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_status', 'pending'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_status', 'confirmed'),
    supabase
      .from('products')
      .select('id, name, slug, stock_qty, price')
      .eq('is_active', true)
      .lte('stock_qty', 5)
      .order('stock_qty', { ascending: true })
      .limit(5),
    supabase
      .from('orders')
      .select('total, items, order_status')
      .neq('order_status', 'cancelled')
      .limit(200),
    supabase
      .from('orders')
      .select('order_number, order_status, total, payment_method, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', false),
  ])

  const todayOrders = (todayOrdersRaw || []) as { id: string; total: number; order_status: string }[]
  const todayOrdersCount = todayOrders.length
  const todayRevenuePaisa = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0)

  const allOrders = (allOrdersForMetricsRaw || []) as { total: number; items: any; order_status: string }[]
  const totalRevenuePaisa = allOrders.reduce((sum, o) => sum + (o.total || 0), 0)

  const recentOrders = (recentOrdersRaw || []) as unknown as RecentOrder[]
  const lowStockProducts = (lowStockProductsRaw || []) as unknown as LowStockProduct[]

  // 3. Compute best-selling products from recent orders
  const bestSellersMap = new Map<string, BestSellerItem>()
  allOrders.forEach((order) => {
    const items = (Array.isArray(order.items) ? order.items : []) as unknown as OrderItem[]
    items.forEach((item) => {
      const existing = bestSellersMap.get(item.product_id)
      const qty = item.quantity || 1
      const rev = (item.price || 0) * qty
      if (existing) {
        existing.quantitySold += qty
        existing.totalRevenue += rev
      } else {
        bestSellersMap.set(item.product_id, {
          productId: item.product_id,
          name: item.name,
          quantitySold: qty,
          totalRevenue: rev,
        })
      }
    })
  })

  const bestSellers = Array.from(bestSellersMap.values())
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 5)

  const statusBadge: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    ordered_from_supplier: 'bg-indigo-100 text-indigo-800',
    packed: 'bg-purple-100 text-purple-800',
    processing: 'bg-gray-100 text-gray-700',
    shipped: 'bg-orange-100 text-orange-800',
    out_for_delivery: 'bg-cyan-100 text-cyan-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-xs text-gray-500 mt-1">
          Store performance, daily sales, and operational action queues
        </p>
      </div>

      {/* ── PRIORITY CALLOUT: Needs Supplier Order ────────── */}
      {(confirmedOrdersCount || 0) > 0 && (
        <div className="rounded-2xl border-2 border-indigo-500/80 bg-indigo-50/70 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-indigo-600 p-2.5 text-white shadow-xs">
              <Factory className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-indigo-950">
                {confirmedOrdersCount} Orders Waiting to be Placed on LIFEGOOD
              </h3>
              <p className="text-xs text-indigo-800 mt-0.5 max-w-xl">
                These customer orders are confirmed and ready for admin to order from the LIFEGOOD supplier app today.
              </p>
            </div>
          </div>

          <Link
            href="/admin/orders?status=confirmed"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs shrink-0"
          >
            <span>Process on LIFEGOOD</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* ── METRIC CARDS ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Revenue */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Today&apos;s Revenue
            </p>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-gray-900 font-mono">
            {formatBDT(todayRevenuePaisa)}
          </p>
          <p className="mt-1 text-[11px] text-gray-500 font-medium">
            From {todayOrdersCount} orders placed today
          </p>
        </div>

        {/* Today's Orders */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Today&apos;s Orders
            </p>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-gray-900 font-mono">
            {todayOrdersCount}
          </p>
          <p className="mt-1 text-[11px] text-gray-500 font-medium">
            Total {totalOrdersCount ?? 0} all-time orders
          </p>
        </div>

        {/* Pending Confirmation */}
        <Link
          href="/admin/orders?status=pending"
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs hover:border-yellow-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Pending Confirmation
            </p>
            <div className="rounded-xl bg-yellow-50 p-2 text-yellow-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-yellow-700 font-mono">
            {pendingOrdersCount ?? 0}
          </p>
          <p className="mt-1 text-[11px] text-yellow-600 font-medium">
            Requires phone verification
          </p>
        </Link>

        {/* Total Revenue */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total Revenue
            </p>
            <div className="rounded-xl bg-purple-50 p-2 text-purple-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-gray-900 font-mono">
            {formatBDT(totalRevenuePaisa)}
          </p>
          <p className="mt-1 text-[11px] text-gray-500 font-medium">
            Excluding cancelled orders
          </p>
        </div>
      </div>

      {/* ── TWO COLUMN LAYOUT: Recent Orders & Operational Alerts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Recent Orders (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-gray-200 bg-white shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-500" />
              <span>Recent Orders</span>
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No orders placed yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <Link
                  key={order.order_number}
                  href={`/admin/orders/${order.order_number}`}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-gray-900">
                        {order.order_number}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {order.payment_method === 'cod' ? 'COD' : 'Online'}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 mt-0.5 block">
                      {timeAgo(new Date(order.created_at))}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        statusBadge[order.order_status] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {ORDER_STATUS_LABELS[order.order_status] ?? order.order_status}
                    </span>
                    <span className="text-sm font-bold text-gray-900 font-mono">
                      {formatBDT(order.total)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Low-Stock Alerts & Best Sellers (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Low Stock Alerts */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Low-Stock Warnings (&le; 5 units)</span>
              </h3>
              <Link
                href="/admin/products"
                className="text-[11px] font-bold text-gray-500 hover:text-gray-900"
              >
                Catalog &rarr;
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="flex items-center gap-2 py-4 text-xs text-emerald-700 bg-emerald-50 rounded-xl p-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>All product inventory levels are healthy!</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-amber-100 bg-amber-50/40 text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-gray-900 truncate max-w-[200px]">
                        {p.name}
                      </p>
                      <p className="text-[11px] font-mono text-gray-500">
                        {formatBDT(p.price)}
                      </p>
                    </div>

                    <span
                      className={`font-mono text-xs font-black px-2 py-0.5 rounded-md shrink-0 ${
                        p.stock_qty === 0
                          ? 'bg-red-200 text-red-900'
                          : 'bg-amber-200 text-amber-900'
                      }`}
                    >
                      {p.stock_qty === 0 ? 'Out of stock' : `${p.stock_qty} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Best-Selling Products */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span>Top Selling Products</span>
              </h3>
            </div>

            {bestSellers.length === 0 ? (
              <p className="py-4 text-xs text-gray-400 text-center">
                Top sellers will appear as orders are completed.
              </p>
            ) : (
              <div className="space-y-2.5">
                {bestSellers.map((item, idx) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 font-mono text-[10px] font-bold text-gray-600">
                        #{idx + 1}
                      </span>
                      <p className="font-medium text-gray-900 truncate max-w-[180px]">
                        {item.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0 font-mono">
                      <p className="font-bold text-gray-900">{item.quantitySold} sold</p>
                      <p className="text-[10px] text-gray-500">{formatBDT(item.totalRevenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Reviews Banner */}
          {(pendingReviewsCount || 0) > 0 && (
            <Link
              href="/admin/reviews"
              className="flex items-center justify-between p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100/80 transition-colors shadow-2xs text-xs font-semibold"
            >
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>{pendingReviewsCount} customer review(s) awaiting moderation</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* ── Quick Admin Shortcuts ──────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4">
          Quick Operations
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            href="/admin/orders?status=confirmed"
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-4 text-center hover:border-gray-900 hover:bg-gray-50/60 transition-all shadow-2xs"
          >
            <Factory className="h-6 w-6 text-indigo-600" />
            <span className="text-xs font-bold text-gray-900">Needs Supplier Order</span>
          </Link>

          <Link
            href="/admin/products"
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-4 text-center hover:border-gray-900 hover:bg-gray-50/60 transition-all shadow-2xs"
          >
            <Package className="h-6 w-6 text-emerald-600" />
            <span className="text-xs font-bold text-gray-900">Bulk Import Products</span>
          </Link>

          <Link
            href="/admin/coupons"
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-4 text-center hover:border-gray-900 hover:bg-gray-50/60 transition-all shadow-2xs"
          >
            <Tag className="h-6 w-6 text-purple-600" />
            <span className="text-xs font-bold text-gray-900">Manage Coupons</span>
          </Link>

          <Link
            href="/admin/reviews"
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-4 text-center hover:border-gray-900 hover:bg-gray-50/60 transition-all shadow-2xs"
          >
            <Star className="h-6 w-6 text-amber-500" />
            <span className="text-xs font-bold text-gray-900">Moderate Reviews</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
