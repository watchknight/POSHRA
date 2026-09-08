'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { assertAdminAuth } from '@/lib/auth/admin'
import { revalidatePath } from 'next/cache'
import type { Review } from '@/types'

export interface SubmitReviewInput {
  productId: string
  customerName: string
  rating: number // 1 to 5
  comment?: string
}

/**
 * Public action: submit a customer review on a product
 * Saved as is_approved = false pending admin approval
 */
export async function submitReviewAction(input: SubmitReviewInput) {
  const supabase = createAdminClient()

  if (!input.productId) {
    return { success: false, error: 'Product ID is required.' }
  }

  const name = input.customerName?.trim()
  if (!name || name.length < 2) {
    return { success: false, error: 'Please enter your name (min 2 characters).' }
  }

  const rating = Math.round(input.rating)
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { success: false, error: 'Please provide a valid rating between 1 and 5 stars.' }
  }

  try {
    const { error } = await (supabase.from('reviews') as any).insert({
      product_id: input.productId,
      customer_name: name,
      rating,
      comment: input.comment?.trim() || null,
      is_approved: false, // Moderation queue
    })

    if (error) throw error

    return {
      success: true,
      message: 'Thank you! Your review has been submitted and will appear once approved.',
    }
  } catch (err: any) {
    console.error('Error submitting review:', err)
    return { success: false, error: err.message || 'Failed to submit review.' }
  }
}

export interface AdminReviewListItem extends Review {
  product?: { id: string; name: string; slug: string; images: string[] } | null
}

/**
 * Fetch reviews for admin moderation queue
 */
export async function fetchAdminReviewsAction(filter: 'all' | 'pending' | 'approved' = 'pending') {
  await assertAdminAuth()
  const supabase = createAdminClient()

  try {
    let query = supabase
      .from('reviews')
      .select('*, product:products(id, name, slug, images)')
      .order('created_at', { ascending: false })

    if (filter === 'pending') {
      query = query.eq('is_approved', false)
    } else if (filter === 'approved') {
      query = query.eq('is_approved', true)
    }

    const { data, error } = await query

    if (error) throw error

    return {
      success: true,
      reviews: (data || []) as unknown as AdminReviewListItem[],
    }
  } catch (err: any) {
    console.error('Error fetching admin reviews:', err)
    return { success: false, error: err.message || 'Failed to load reviews.', reviews: [] }
  }
}

/**
 * Recalculate product's rating_avg and rating_count based on approved reviews
 */
async function updateProductRatingStats(productId: string) {
  const supabase = createAdminClient()
  try {
    const { data: approvedReviewsRaw } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('is_approved', true)

    const approvedReviews = (approvedReviewsRaw || []) as { rating: number }[]
    const count = approvedReviews.length
    const avg =
      count > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count
        : 0

    await (supabase.from('products') as any)
      .update({
        rating_avg: parseFloat(avg.toFixed(2)),
        rating_count: count,
      })
      .eq('id', productId)
  } catch (err) {
    console.error('Failed to update product rating stats:', err)
  }
}

/**
 * Moderate review: approve or reject
 */
export async function moderateReviewAction(
  reviewId: string,
  action: 'approve' | 'reject' | 'delete'
) {
  await assertAdminAuth()
  const supabase = createAdminClient()

  try {
    // 1. Get review to find product_id
    const { data: reviewRaw, error: fetchErr } = await supabase
      .from('reviews')
      .select('product_id')
      .eq('id', reviewId)
    const review = reviewRaw as { product_id: string } | null

    if (fetchErr || !review) {
      return { success: false, error: 'Review not found.' }
    }

    const productId = review.product_id

    if (action === 'delete') {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId)
      if (error) throw error
    } else {
      const isApproved = action === 'approve'
      const { error } = await (supabase.from('reviews') as any)
        .update({ is_approved: isApproved })
        .eq('id', reviewId)

      if (error) throw error
    }

    // 2. Recalculate product rating stats
    if (productId) {
      await updateProductRatingStats(productId)
    }

    revalidatePath('/admin/reviews')
    revalidatePath('/products')
    return { success: true }
  } catch (err: any) {
    console.error('Error moderating review:', err)
    return { success: false, error: err.message || 'Failed to moderate review.' }
  }
}
