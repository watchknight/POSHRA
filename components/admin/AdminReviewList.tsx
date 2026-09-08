'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  ExternalLink,
  Loader2,
  MessageSquare,
} from 'lucide-react'
import {
  fetchAdminReviewsAction,
  moderateReviewAction,
  type AdminReviewListItem,
} from '@/lib/actions/reviews'
import { formatDate } from '@/lib/utils'

export function AdminReviewList() {
  const [reviews, setReviews] = useState<AdminReviewListItem[]>([])
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending')
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const loadReviews = useCallback(async () => {
    setLoading(true)
    const res = await fetchAdminReviewsAction(filter)
    if (res.success) {
      setReviews(res.reviews)
    }
    setLoading(false)
  }, [filter])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const handleModerate = async (id: string, action: 'approve' | 'reject' | 'delete') => {
    setActionLoadingId(id)
    const res = await moderateReviewAction(id, action)
    setActionLoadingId(null)

    if (res.success) {
      loadReviews()
    } else {
      alert(res.error || 'Failed to moderate review.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews Moderation</h1>
          <p className="text-xs text-gray-500 mt-1">
            Approve genuine customer feedback and maintain storefront credibility
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          {(['pending', 'approved', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold capitalize transition-all ${
                filter === tab
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab === 'pending' ? 'Pending Approval' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Cards List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin text-gray-900 mb-2" />
          <p className="text-xs">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-2xs">
          <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-700">No {filter} reviews</p>
          <p className="text-xs text-gray-400 mt-1">
            {filter === 'pending'
              ? 'All submitted reviews have been moderated! Great job.'
              : 'No reviews found in this category.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => {
            const isActing = actionLoadingId === rev.id
            const prodImg = rev.product?.images?.[0] || ''

            return (
              <div
                key={rev.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-300 transition-colors"
              >
                {/* Left: Product & Customer Content */}
                <div className="flex items-start gap-4 min-w-0">
                  {/* Product thumbnail */}
                  <div className="relative h-14 w-14 shrink-0 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
                    {prodImg ? (
                      <Image
                        src={prodImg}
                        alt={rev.product?.name || 'Product'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-300 text-xs">
                        No img
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/product/${rev.product?.slug || ''}`}
                        target="_blank"
                        className="font-bold text-sm text-gray-900 hover:text-emerald-700 transition-colors flex items-center gap-1 truncate max-w-sm"
                      >
                        <span>{rev.product?.name || 'Unknown Product'}</span>
                        <ExternalLink className="h-3 w-3 shrink-0 text-gray-400" />
                      </Link>

                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rev.is_approved
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {rev.is_approved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>

                    {/* Star Rating & Reviewer */}
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-gray-700">{rev.customer_name}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">{formatDate(rev.created_at)}</span>
                    </div>

                    {/* Comment text */}
                    {rev.comment && (
                      <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl mt-1.5 leading-relaxed">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 md:self-center">
                  {!rev.is_approved ? (
                    <>
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handleModerate(rev.id, 'approve')}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-2xs"
                      >
                        {isActing ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        <span>Approve</span>
                      </button>

                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handleModerate(rev.id, 'delete')}
                        className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handleModerate(rev.id, 'reject')}
                        className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Revoke Approval
                      </button>
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handleModerate(rev.id, 'delete')}
                        className="rounded-xl p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        title="Delete Review"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
