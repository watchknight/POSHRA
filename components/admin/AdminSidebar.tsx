'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/lib/actions/auth'

const navItems = [
  { href: '/admin',            label: 'Dashboard',  icon: '📊', exact: true  },
  { href: '/admin/orders',     label: 'Orders',     icon: '📦', exact: false },
  { href: '/admin/customers',  label: 'Customers',  icon: '👥', exact: false },
  { href: '/admin/products',   label: 'Products',   icon: '🛍️', exact: false },
  { href: '/admin/categories', label: 'Categories', icon: '🗂️', exact: false },
  { href: '/admin/coupons',    label: 'Coupons',    icon: '🎟️', exact: false },
  { href: '/admin/reviews',    label: 'Reviews',    icon: '⭐', exact: false },
  { href: '/admin/settings',   label: 'Settings',   icon: '⚙️', exact: false },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-56 flex-col border-r border-gray-200 bg-white">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-gray-200 px-5">
        <span className="text-lg font-bold text-gray-900">Poshra</span>
        <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-200 p-2">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <span>🚪</span>
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
