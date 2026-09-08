import { createClient } from '@/lib/supabase/server'

/**
 * Validates that the current request has an active authenticated admin session.
 * Throws an Error if unauthenticated, preventing unauthorized execution of Server Actions.
 */
export async function assertAdminAuth() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized: Admin access required.')
  }

  return user
}
