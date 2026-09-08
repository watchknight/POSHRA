'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Banknote,
  CreditCard,
  Truck,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Tag,
  CheckCircle2,
  X,
  ShoppingBag,
} from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { getAllDistricts, getThanasByDistrict } from '@/lib/bd-geo'
import { formatBDT, DELIVERY_FEES, getDeliveryZone } from '@/lib/utils'
import { createOrderAction, validateCouponAction } from '@/lib/actions/orders'
import { trackInitiateCheckout } from '@/lib/analytics/pixel'
import { useLanguage } from '@/components/i18n/LanguageContext'
import OtpModal from './OtpModal'

export function CheckoutForm() {
  const router = useRouter()
  const { t } = useLanguage()
  const {
    items,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    totalPrice,
    discountAmount,
    clearCart,
  } = useCartStore()

  const [mounted, setMounted] = useState(false)
  const [districts, setDistricts] = useState<string[]>([])
  const [thanas, setThanas] = useState<string[]>([])

  // Form inputs
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('Dhaka')
  const [selectedThana, setSelectedThana] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod')

  // Coupon input state
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null)

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // OTP modal state
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [pendingOrderId, setPendingOrderId] = useState('')
  const [pendingOrderNumber, setPendingOrderNumber] = useState('')

  useEffect(() => {
    setMounted(true)
    const allDist = getAllDistricts()
    setDistricts(allDist)
    const initialThanas = getThanasByDistrict('Dhaka')
    setThanas(initialThanas)
    if (initialThanas.length > 0) setSelectedThana(initialThanas[0])

    // Fire Meta Pixel InitiateCheckout
    if (items.length > 0) {
      trackInitiateCheckout(totalPrice() / 100, items.length)
    }
  }, [])

  // When district changes, update thanas and delivery zone
  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district)
    const newThanas = getThanasByDistrict(district)
    setThanas(newThanas)
    if (newThanas.length > 0) {
      setSelectedThana(newThanas[0])
    } else {
      setSelectedThana('')
    }
  }

  // Delivery calculation
  const subtotal = mounted ? totalPrice() : 0
  const deliveryZone = getDeliveryZone(selectedDistrict)
  const deliveryFee = DELIVERY_FEES[deliveryZone]
  const discount = mounted ? discountAmount() : 0
  const finalTotal = Math.max(0, subtotal - discount + deliveryFee)

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponInput.trim()) return

    setCouponLoading(true)
    setCouponMessage(null)

    try {
      const res = await validateCouponAction(couponInput, subtotal)
      if (res.valid && res.coupon) {
        applyCoupon(res.coupon)
        setCouponMessage({
          text: `Coupon "${res.coupon.code}" applied! You saved ${formatBDT(res.discount)}.`,
          isError: false,
        })
        setCouponInput('')
      } else {
        setCouponMessage({ text: res.error || 'Invalid coupon.', isError: true })
      }
    } catch {
      setCouponMessage({ text: 'Failed to apply coupon. Please try again.', isError: true })
    } finally {
      setCouponLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (items.length === 0) {
      setErrorMessage('Your cart is empty.')
      return
    }

    if (!customerPhone.match(/^01[3-9]\d{8}$/)) {
      setErrorMessage('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678).')
      return
    }

    if (!selectedThana) {
      setErrorMessage('Please select your Thana / Upazila.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createOrderAction(
        {
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || undefined,
          delivery_district: selectedDistrict,
          delivery_thana: selectedThana,
          delivery_address_line: addressLine,
          delivery_zone: deliveryZone,
          payment_method: paymentMethod,
          order_notes: orderNotes || undefined,
          coupon_code: appliedCoupon?.code || undefined,
        },
        items
      )

      if (result.success && result.orderNumber) {
        // Online payment — redirect to SSLCommerz gateway
        if ((result as any).gatewayUrl) {
          clearCart()
          window.location.href = (result as any).gatewayUrl
          return
        }

        // Payment error for online orders — show error but order is created
        if ((result as any).paymentError) {
          clearCart()
          setErrorMessage((result as any).paymentError)
          setIsSubmitting(false)
          // Still redirect to confirmation after a delay
          setTimeout(() => {
            router.push(`/order-confirmed/${result.orderNumber}`)
          }, 3000)
          return
        }

        // COD order — show OTP verification modal
        if (paymentMethod === 'cod' && (result as any).orderId) {
          setPendingOrderId((result as any).orderId)
          setPendingOrderNumber(result.orderNumber)
          setShowOtpModal(true)
          setIsSubmitting(false)
          return
        }

        // Fallback — direct redirect
        clearCart()
        router.push(`/order-confirmed/${result.orderNumber}`)
      } else {
        setErrorMessage(result.error || 'Failed to place order. Please try again.')
        setIsSubmitting(false)
      }
    } catch (err) {
      console.error('Order submit error:', err)
      setErrorMessage('A network error occurred. Please try again or reach out on WhatsApp.')
      setIsSubmitting(false)
    }
  }

  const handleOtpVerified = () => {
    setShowOtpModal(false)
    clearCart()
    router.push(`/order-confirmed/${pendingOrderNumber}`)
  }

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-gray-50 text-gray-400 mb-4">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Your Cart is Empty</h2>
        <p className="mt-1 text-xs text-gray-500">
          Please add at least one product to your cart before proceeding to checkout.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-xl bg-gray-900 px-6 py-3 text-xs font-bold text-white hover:bg-gray-800 shadow-xs"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Col: Customer & Shipping Details (7 Cols) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Error Alert */}
        {errorMessage && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Customer Info */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
              1
            </span>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              {t.checkout.customerInfo}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.checkout.fullName} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Tanvir Ahmed"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs sm:text-sm focus:border-gray-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.checkout.phone} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs sm:text-sm focus:border-gray-900 focus:outline-none font-mono"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                {t.checkout.phoneHelp}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t.checkout.email}
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="e.g. tanvir@gmail.com"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs sm:text-sm focus:border-gray-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Step 2: Delivery Address (District -> Thana Cascade) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                2
              </span>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                {t.checkout.shippingAddress}
              </h2>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              {deliveryZone === 'inside_dhaka' ? 'Inside Dhaka (৳60)' : 'Outside Dhaka (৳120)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.checkout.district} <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs sm:text-sm focus:border-gray-900 focus:outline-none bg-white cursor-pointer"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.checkout.thana} <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={selectedThana}
                onChange={(e) => setSelectedThana(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs sm:text-sm focus:border-gray-900 focus:outline-none bg-white cursor-pointer"
              >
                {thanas.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t.checkout.addressLine} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="e.g. House 14, Road 5, Block B, Mirpur 10"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs sm:text-sm focus:border-gray-900 focus:outline-none"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Please include house, road, sector/block details so the courier rider can find you easily.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t.checkout.orderNotes}
            </label>
            <textarea
              rows={2}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder={t.checkout.orderNotesPlaceholder}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs sm:text-sm focus:border-gray-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Step 3: Payment Method */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
              3
            </span>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              {t.checkout.paymentMethod}
            </h2>
          </div>

          <div className="space-y-3">
            {/* COD Option */}
            <label
              className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition-all ${
                paymentMethod === 'cod'
                  ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="payment_method"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs sm:text-sm font-bold text-gray-900">
                    {t.checkout.codTitle}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  {t.checkout.codDesc}
                </p>
              </div>
            </label>

            {/* Online Payment Option */}
            <label
              className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition-all ${
                paymentMethod === 'online'
                  ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="payment_method"
                value="online"
                checked={paymentMethod === 'online'}
                onChange={() => setPaymentMethod('online')}
                className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-700" />
                  <span className="text-xs sm:text-sm font-bold text-gray-900">
                    Pay Online (bKash / Nagad / Cards)
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Instant digital payment. (Select Cash on Delivery for quickest instant dispatch).
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Right Col: Order Summary & Placement (5 Cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100">
            Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} Items)
          </h2>

          {/* Items list */}
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 pr-1">
            {items.map((item) => {
              const unitPrice = item.price + (item.variant_price_adjustment || 0)
              return (
                <div key={`${item.product_id}::${item.variant_label ?? ''}`} className="py-2.5 flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
                    {item.image_url && (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                    {item.variant_label && (
                      <p className="text-[10px] text-gray-400">Variant: {item.variant_label}</p>
                    )}
                    <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-900">
                    {formatBDT(unitPrice * item.quantity)}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Coupon Code Section */}
          <div className="pt-2 border-t border-gray-100">
            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-800 border border-emerald-200">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Tag className="h-3.5 w-3.5" />
                  <span>Coupon &ldquo;{appliedCoupon.code}&rdquo; Applied</span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="p-1 hover:text-red-500 text-gray-400"
                  aria-label="Remove coupon"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon Code"
                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs uppercase focus:border-gray-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={couponLoading || !couponInput.trim()}
                    onClick={handleApplyCoupon}
                    className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-800 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    {couponLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Apply'}
                  </button>
                </div>
                {couponMessage && (
                  <p
                    className={`text-[11px] ${
                      couponMessage.isError ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Calculation Breakdown */}
          <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">{formatBDT(subtotal)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-gray-400" />
                Delivery Fee ({deliveryZone === 'inside_dhaka' ? 'Dhaka' : 'Outside Dhaka'})
              </span>
              <span className="font-semibold text-gray-900">{formatBDT(deliveryFee)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon Discount</span>
                <span>-{formatBDT(discount)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-3 border-t border-gray-100">
              <span className="text-sm font-bold text-gray-900">Total Payable</span>
              <span className="text-xl font-black text-gray-900">{formatBDT(finalTotal)}</span>
            </div>
            <p className="text-[10px] text-gray-400 text-right">
              {paymentMethod === 'cod' ? 'Due upon doorstep inspection' : 'Pay via digital gateway'}
            </p>
          </div>

          {/* Place Order CTA Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 py-4 px-6 text-sm font-black text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t.checkout.placingOrder}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>{t.checkout.confirmOrder} — {formatBDT(finalTotal)}</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
            <span>{t.checkout.secureCheckout}</span>
          </div>
        </div>
      </div>
    </form>

      <OtpModal
        isOpen={showOtpModal}
        phone={customerPhone}
        orderId={pendingOrderId}
        orderNumber={pendingOrderNumber}
        onVerified={handleOtpVerified}
      />
    </>
  )
}
