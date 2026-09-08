'use client'

import { useState } from 'react'
import { Star, CheckCircle, PenLine, Loader2, Send } from 'lucide-react'
import type { Review } from '@/types'
import { formatDate } from '@/lib/utils'
import { submitReviewAction } from '@/lib/actions/reviews'

interface ReviewSectionProps {
  productId: string
  ratingAvg: number
  ratingCount: number
  reviews: Review[]
}

export function ReviewSection({
  productId,
  ratingAvg,
  ratingCount,
  reviews,
}: ReviewSectionProps) {
  const avg = Number(ratingAvg || 5.0).toFixed(1)

  // Review submission state
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [customerName, setCustomerName] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName.trim()) {
      setErrorMsg('Please enter your name.')
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    const res = await submitReviewAction({
      productId,
      customerName,
      rating,
      comment,
    })

    setSubmitting(false)

    if (res.success) {
      setSuccessMsg(res.message || 'Review submitted successfully!')
      setCustomerName('')
      setComment('')
      setRating(5)
      setShowForm(false)
    } else {
      setErrorMsg(res.error || 'Failed to submit review.')
    }
  }

  return (
    <section className="border-t border-gray-100 pt-10 mt-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-gray-100">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Customer Reviews</h3>
          <p className="text-xs text-gray-500 mt-1">
            Verified feedback from genuine Bangladeshi buyers
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Rating Score Card */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
            <div className="text-2xl font-black text-gray-900">{avg}</div>
            <div>
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.round(Number(avg))
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                Based on {ratingCount || reviews.length} verified ratings
              </p>
            </div>
          </div>

          {/* Write a review button */}
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-3 text-xs font-bold text-gray-800 shadow-2xs hover:bg-gray-50 transition-colors"
          >
            <PenLine className="h-4 w-4 text-emerald-600" />
            <span>{showForm ? 'Cancel Review' : 'Write a Review'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Interactive Review Submission Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-gray-200 bg-gray-50/60 p-6 space-y-4 animate-in slide-in-from-top-3"
        >
          <h4 className="text-sm font-bold text-gray-900">Share Your Experience</h4>

          {errorMsg && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {/* Star selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Overall Rating *
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-gray-700">
                {rating} out of 5 stars
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Tanvir Ahmed"
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs focus:border-gray-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Review & Feedback
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like about the product? Fast delivery, material quality..."
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs focus:border-gray-900 focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-2xs"
            >
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>Submit Review for Moderation</span>
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="mt-8 space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center py-8 text-sm text-gray-400">
            No approved reviews yet for this product. Be the first to share your experience!
          </p>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      {rev.customer_name}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle className="h-3 w-3" />
                      Verified Buyer
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 mt-1">
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
                </div>

                <span className="text-xs text-gray-400">
                  {formatDate(rev.created_at)}
                </span>
              </div>

              {rev.comment && (
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {rev.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
