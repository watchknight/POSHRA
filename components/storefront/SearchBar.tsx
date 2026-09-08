'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatBDT } from '@/lib/utils'

interface SearchResult {
  id: string
  name: string
  slug: string
  images: string[]
  price: number
  compare_at_price: number | null
}

export function SearchBar({ className = '' }: { className?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close autocomplete
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (val: string) => {
    setQuery(val)
    if (!val.trim() || val.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }
  }

  // Debounced search query to Supabase
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed || trimmed.length < 2) {
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('products')
          .select('id, name, slug, images, price, compare_at_price')
          .eq('is_active', true)
          .ilike('name', `%${trimmed}%`)
          .limit(5)

        if (!error && data) {
          setResults(data as SearchResult[])
          setIsOpen(true)
        }
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setIsLoading(false)
      }
    }, 250)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setIsOpen(false)
    router.push(`/products?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
          placeholder="Search products, gadgets, fashion..."
          className="w-full rounded-full border border-gray-200 bg-gray-50/70 py-2 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-all"
        />
        <Search className="absolute left-3.5 h-4 w-4 text-gray-400 pointer-events-none" />

        {isLoading ? (
          <Loader2 className="absolute right-3.5 h-4 w-4 text-gray-400 animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
            }}
            className="absolute right-3.5 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl animate-in fade-in-0 zoom-in-95">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-1.5">
            Products Found
          </div>
          <div className="divide-y divide-gray-50">
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl p-2 hover:bg-gray-50 transition-colors"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-100">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-gray-900">
                      {formatBDT(product.price)}
                    </span>
                    {product.compare_at_price && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatBDT(product.compare_at_price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-1 border-t border-gray-100 pt-2 px-1">
            <button
              onClick={handleSubmit}
              className="w-full rounded-lg bg-gray-50 py-2 text-center text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              View all results for &ldquo;{query}&rdquo; →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
