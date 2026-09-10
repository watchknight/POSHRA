'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Something went wrong!</h2>
          <p className="text-sm text-gray-500">
            We encountered an unexpected error while loading this page. Please try again or reach out to our team.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-gray-400">Error ID: {error.digest}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>

        <div className="pt-4 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-center gap-1">
          <span>Need immediate help?</span>
          <a
            href="https://wa.me/8801898919219?text=Hello%20Poshra%20Support,%20I%20faced%20an%20issue%20on%20the%20website"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:underline font-medium inline-flex items-center gap-1"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
