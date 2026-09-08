'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { getSmsProvider } from '@/lib/sms/provider'
import { otpSchema } from '@/lib/validators'

/**
 * Generate a random 6-digit OTP code.
 */
function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Simple hash for OTP codes — uses a basic comparison approach.
 * In production, use bcrypt. For now we store a reversible hash
 * to keep dependencies minimal.
 */
function hashCode(code: string): string {
  // Simple base64 encoding with a salt prefix for basic obfuscation
  // In production, replace with bcrypt
  const salt = 'poshra_otp_'
  return Buffer.from(salt + code).toString('base64')
}

function verifyCode(code: string, hash: string): boolean {
  return hashCode(code) === hash
}

/**
 * Send an OTP to a phone number for order verification.
 */
export async function sendOtpAction(phone: string, orderId: string) {
  if (!phone || !orderId) {
    return { success: false as const, error: 'Phone and order ID are required.' }
  }

  const supabase = createAdminClient()

  // Rate limit: 60-second cooldown between requests per phone
  const sixtySecondsAgo = new Date(Date.now() - 60 * 1000).toISOString()
  const { data: latestOtp } = await supabase
    .from('otps')
    .select('created_at')
    .eq('phone', phone)
    .gte('created_at', sixtySecondsAgo)
    .order('created_at', { ascending: false })
    .limit(1)

  if (latestOtp && latestOtp.length > 0) {
    return { success: false as const, error: 'Please wait 60 seconds before requesting another code.' }
  }

  // Rate limit: max 3 OTPs per phone per 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { data: recentOtps } = await supabase
    .from('otps')
    .select('id')
    .eq('phone', phone)
    .gte('created_at', tenMinutesAgo)

  if (recentOtps && recentOtps.length >= 3) {
    return { success: false as const, error: 'Too many OTP requests. Please wait a few minutes.' }
  }

  // Generate OTP
  const code = generateOtpCode()
  const codeHash = hashCode(code)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes

  // Store in DB
  const { error: insertError } = await (supabase.from('otps') as any).insert({
    phone,
    code_hash: codeHash,
    order_id: orderId,
    expires_at: expiresAt,
  })

  if (insertError) {
    console.error('OTP insert error:', insertError)
    return { success: false as const, error: 'Failed to generate OTP. Please try again.' }
  }

  // Send via SMS provider
  const smsProvider = getSmsProvider()
  const smsResult = await smsProvider.sendOtp(phone, code)

  if (!smsResult.success) {
    return { success: false as const, error: smsResult.error || 'Failed to send OTP.' }
  }

  return { success: true as const }
}

/**
 * Verify an OTP code for an order.
 */
export async function verifyOtpAction(phone: string, otp: string, orderId: string) {
  const parsed = otpSchema.safeParse({ phone, otp, order_id: orderId })
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message || 'Invalid input.' }
  }

  const supabase = createAdminClient()

  // Find the most recent unverified OTP for this phone + order
  const { data: otpRecords } = await supabase
    .from('otps')
    .select('*')
    .eq('phone', phone)
    .eq('order_id', orderId)
    .eq('verified', false)
    .order('created_at', { ascending: false })
    .limit(1)

  const otpRecord = (otpRecords as any)?.[0]

  if (!otpRecord) {
    return { success: false as const, error: 'No OTP found. Please request a new code.' }
  }

  // Check expiry
  if (new Date(otpRecord.expires_at) < new Date()) {
    return { success: false as const, error: 'OTP has expired. Please request a new code.' }
  }

  // Check max attempts
  if (otpRecord.attempts >= 5) {
    return { success: false as const, error: 'Too many attempts. Please request a new code.' }
  }

  // Increment attempts
  await (supabase.from('otps') as any)
    .update({ attempts: otpRecord.attempts + 1 })
    .eq('id', otpRecord.id)

  // Verify code
  if (!verifyCode(otp, otpRecord.code_hash)) {
    const remainingAttempts = 4 - otpRecord.attempts
    return {
      success: false as const,
      error: `Invalid OTP. ${remainingAttempts > 0 ? `${remainingAttempts} attempts remaining.` : 'Please request a new code.'}`,
    }
  }

  // Mark OTP as verified
  await (supabase.from('otps') as any)
    .update({ verified: true })
    .eq('id', otpRecord.id)

  // Mark order as OTP verified
  await (supabase.from('orders') as any)
    .update({ otp_verified: true })
    .eq('id', orderId)

  return { success: true as const }
}
