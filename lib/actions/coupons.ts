'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { assertAdminAuth } from '@/lib/auth/admin'
import type { Coupon, CouponType } from '@/types'
import { revalidatePath } from 'next/cache'

export interface CouponInput {
  id?: string
  code: string
  type: CouponType
  value: number // percent (e.g. 10) or flat BDT (e.g. 100)
  min_order_amount?: number // in BDT
  expires_at?: string | null // ISO date string or null
  usage_limit?: number | null
  is_active?: boolean
}

/**
 * Fetch all coupons for admin
 */
export async function fetchAdminCouponsAction() {
  await assertAdminAuth()
  const supabase = createAdminClient()
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      success: true,
      coupons: (data || []) as Coupon[],
    }
  } catch (err: any) {
    console.error('Error fetching coupons:', err)
    return { success: false, error: err.message || 'Failed to fetch coupons', coupons: [] }
  }
}

/**
 * Create or update a coupon
 */
export async function createOrUpdateCouponAction(input: CouponInput) {
  await assertAdminAuth()
  const supabase = createAdminClient()

  const cleanCode = input.code.trim().toUpperCase()
  if (!cleanCode) {
    return { success: false, error: 'Coupon code is required.' }
  }

  if (input.value <= 0) {
    return { success: false, error: 'Coupon value must be greater than zero.' }
  }

  if (input.type === 'percent' && input.value > 100) {
    return { success: false, error: 'Percentage discount cannot exceed 100%.' }
  }

  try {
    // Value stored: if flat, store in paisa (val * 100). If percent, store as integer (0-100).
    const storedValue =
      input.type === 'flat' ? Math.round(input.value * 100) : Math.round(input.value)

    const minOrderPaisa = input.min_order_amount
      ? Math.round(input.min_order_amount * 100)
      : 0

    const payload: Record<string, any> = {
      code: cleanCode,
      type: input.type,
      value: storedValue,
      min_order_amount: minOrderPaisa,
      expires_at: input.expires_at ? new Date(input.expires_at).toISOString() : null,
      usage_limit: input.usage_limit ? Number(input.usage_limit) : null,
      is_active: input.is_active !== undefined ? input.is_active : true,
    }

    if (input.id) {
      const { error } = await (supabase.from('coupons') as any)
        .update(payload)
        .eq('id', input.id)

      if (error) throw error
    } else {
      const { error } = await (supabase.from('coupons') as any).insert(payload)
      if (error) throw error
    }

    revalidatePath('/admin/coupons')
    return { success: true }
  } catch (err: any) {
    console.error('Error saving coupon:', err)
    return { success: false, error: err.message || 'Failed to save coupon.' }
  }
}

/**
 * Delete a coupon
 */
export async function deleteCouponAction(id: string) {
  await assertAdminAuth()
  const supabase = createAdminClient()
  try {
    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (error) throw error

    revalidatePath('/admin/coupons')
    return { success: true }
  } catch (err: any) {
    console.error('Error deleting coupon:', err)
    return { success: false, error: err.message || 'Failed to delete coupon.' }
  }
}

/**
 * Toggle coupon active status
 */
export async function toggleCouponActiveAction(id: string, isActive: boolean) {
  await assertAdminAuth()
  const supabase = createAdminClient()
  try {
    const { error } = await (supabase.from('coupons') as any)
      .update({ is_active: isActive })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/coupons')
    return { success: true }
  } catch (err: any) {
    console.error('Error toggling coupon:', err)
    return { success: false, error: err.message || 'Failed to toggle coupon.' }
  }
}
