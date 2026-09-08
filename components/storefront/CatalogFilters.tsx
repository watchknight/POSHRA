'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Filter, X, Check, ArrowUpDown } from 'lucide-react'
import type { Category } from '@/types'

interface CatalogFiltersProps {
  categories: Category[]
  currentCategory?: string
  totalCount: number
}

export function CatalogFilters({
  categories,
  currentCategory,
  totalCount,
}: CatalogFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Current filter state from URL
  const activeSort = searchParams.get('sort') || 'newest'
  const inStockOnly = searchParams.get('in_stock') === 'true'
  const minPrice = searchParams.get('min_price') || ''
  const maxPrice = searchParams.get('max_price') || ''
  const [localMin, setLocalMin] = useState(minPrice ? String(Number(minPrice) / 100) : '')
  const [localMax, setLocalMax] = useState(maxPrice ? String(Number(maxPrice) / 100) : '')

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())

    if (localMin && !isNaN(Number(localMin))) {
      params.set('min_price', String(Math.round(Number(localMin) * 100)))
    } else {
      params.delete('min_price')
    }

    if (localMax && !isNaN(Number(localMax))) {
      params.set('max_price', String(Math.round(Number(localMax) * 100)))
    } else {
      params.delete('max_price')
    }

    router.push(`${pathname}?${params.toString()}`)
    setMobileFilterOpen(false)
  }

  const clearAllFilters = () => {
    setLocalMin('')
    setLocalMax('')
    router.push(pathname)
    setMobileFilterOpen(false)
  }

  const sortOptions = [
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Customer Rating' },
    { value: 'best_selling', label: 'Popular & Best Selling' },
  ]

  const FilterContent = (
    <div className="space-y-6">
      {/* Active Category if on all products page */}
      {!currentCategory && categories.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
            Category
          </h4>
          <div className="space-y-1.5">
            <button
              onClick={() => updateParam('category', null)}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                !searchParams.get('category')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>All Categories</span>
              {!searchParams.get('category') && <Check className="h-3.5 w-3.5" />}
            </button>
            {categories.map((cat) => {
              const isSelected = searchParams.get('category') === cat.slug
              return (
                <button
                  key={cat.id}
                  onClick={() => updateParam('category', cat.slug)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{cat.name}</span>
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* In-stock toggle */}
      <div className="border-t border-gray-100 pt-5">
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-800 select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => updateParam('in_stock', e.target.checked ? 'true' : null)}
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {/* Price Range Filter */}
      <div className="border-t border-gray-100 pt-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
          Price Range (৳ BDT)
        </h4>
        <form onSubmit={handlePriceApply} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:border-gray-900 focus:outline-none"
            />
            <span className="text-gray-400 text-xs">-</span>
            <input
              type="number"
              placeholder="Max"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:border-gray-900 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-gray-100 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-200 transition-colors"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* Reset all button */}
      {(searchParams.toString().length > 0) && (
        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={clearAllFilters}
            className="w-full rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Top Bar with Filter Toggle (Mobile) and Sort Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {/* Mobile filter button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-800 shadow-2xs hover:bg-gray-50 lg:hidden"
          >
            <Filter className="h-3.5 w-3.5 text-gray-500" />
            <span>Filter</span>
            {(inStockOnly || minPrice || maxPrice || searchParams.get('category')) && (
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <p className="text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-900">{totalCount}</span> products
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
          <select
            value={activeSort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="rounded-xl border border-gray-200 bg-white py-1.5 pl-2.5 pr-8 text-xs font-medium text-gray-800 focus:border-gray-900 focus:outline-none shadow-2xs cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Sidebar (Rendered inside desktop catalog page layout) */}
      <div className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Filters</h3>
          </div>
          {FilterContent}
        </div>
      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-4/5 max-w-xs bg-white p-6 shadow-xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">Filters</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6">{FilterContent}</div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full rounded-xl bg-gray-900 py-3 text-xs font-bold text-white hover:bg-gray-800"
              >
                View Results ({totalCount})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
