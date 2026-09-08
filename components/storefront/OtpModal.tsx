'use client'

import React, { useState, useEffect, useRef } from 'react'
import { sendOtpAction, verifyOtpAction } from '@/lib/actions/otp'

interface OtpModalProps {
  isOpen: boolean
  phone: string
  orderId: string
  orderNumber: string
  onVerified: () => void
}

export default function OtpModal({ isOpen, phone, orderId, orderNumber, onVerified }: OtpModalProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(60)
  const [attempts, setAttempts] = useState(0)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleSendOtp = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await sendOtpAction(phone, orderId)
      // Assuming result could contain { error: string } on failure
      if (result && (result as any).error) {
         setError((result as any).error)
      } else {
         setCooldown(60)
         setOtp(Array(6).fill(''))
         inputRefs.current[0]?.focus()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      handleSendOtp()
    }
  }, [isOpen])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isOpen && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isOpen, cooldown])

  const handleVerify = async (code: string) => {
    if (attempts >= 5) {
      setError('Maximum attempts reached. Please request a new OTP.')
      return
    }
    setLoading(true)
    setError(null)
    setAttempts((prev) => prev + 1)
    
    try {
      const result = await verifyOtpAction(phone, code, orderId)
      // Assuming result could contain { error: string } on failure
      if (result && (result as any).error) {
        setError((result as any).error)
        setOtp(Array(6).fill(''))
        inputRefs.current[0]?.focus()
      } else {
        onVerified()
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed')
      setOtp(Array(6).fill(''))
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    // If pasting multiple digits
    if (value.length > 1) {
      const pastedDigits = value.slice(0, 6).split('')
      for (let i = 0; i < pastedDigits.length; i++) {
        if (index + i < 6) {
          newOtp[index + i] = pastedDigits[i]
        }
      }
      setOtp(newOtp)
      const nextIndex = Math.min(index + pastedDigits.length, 5)
      inputRefs.current[nextIndex]?.focus()
      
      const fullCode = newOtp.join('')
      if (fullCode.length === 6) {
        handleVerify(fullCode)
      }
      return
    }

    newOtp[index] = value
    setOtp(newOtp)

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    const fullCode = newOtp.join('')
    if (fullCode.length === 6) {
      handleVerify(fullCode)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const maskPhone = (p: string) => {
    if (p.length < 11) return p
    return p.substring(0, 3) + '****' + p.substring(7)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl transform transition-all">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Order</h2>
          <p className="text-gray-500 text-sm">
            Order <span className="font-semibold text-gray-900">{orderNumber}</span>
          </p>
          <p className="text-gray-500 text-sm mt-1">
            We sent a 6-digit code to <span className="font-medium text-gray-900">{maskPhone(phone)}</span>
          </p>
        </div>

        <div className="flex justify-between gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all disabled:opacity-50 disabled:bg-gray-50"
              disabled={loading}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center animate-pulse">
            {error} {attempts > 0 && `(Attempt ${attempts}/5)`}
          </div>
        )}

        <div className="text-center mt-6 space-y-3">
          <button
            onClick={handleSendOtp}
            disabled={cooldown > 0 || loading || attempts >= 5}
            className="text-sm font-medium text-green-600 hover:text-green-700 disabled:text-gray-400 transition-colors"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend OTP'}
          </button>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-500 mb-1.5">Didn&apos;t receive SMS after 60 seconds?</p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801898919219'}?text=${encodeURIComponent(`Hi Poshra support, I placed order ${orderNumber} with phone ${phone} and need help verifying my order.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition-colors"
            >
              💬 Verify via WhatsApp Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
