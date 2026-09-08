import type { Metadata } from 'next'
import { RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Return & Refund Policy — Poshra',
  description: 'Learn about Poshra 7-day return, exchange, and refund policy for online orders across Bangladesh.',
}

export default function ReturnPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center space-y-3 mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Customer Protection
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          7-Day Return &amp; Refund Policy
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">
          We want you to shop with complete peace of mind. Read our transparent conditions for doorstep inspection, returns, and replacements.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-gray-600 leading-relaxed">
        {/* Doorstep Inspection Box */}
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>Doorstep Inspection on Delivery</span>
          </div>
          <p>
            When the delivery rider arrives at your doorstep, you are encouraged to <strong>open and inspect the package before paying the cash</strong>. Check that the item matches your order, has no external damage, and is in good physical condition. If there is any discrepancy, you can immediately return it with the delivery rider without paying.
          </p>
        </div>

        {/* 7-Day Window */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-2xs space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-gray-900" />
            1. Eligibility Window (7 Days)
          </h2>
          <p>
            If you discover a manufacturing fault or operational issue after accepting the parcel, you have <strong>7 calendar days</strong> from the delivery date to notify our support team.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-500">
            <li>Item does not turn on or function as advertised.</li>
            <li>Item has missing accessories or components mentioned in the box.</li>
            <li>Wrong color, model, or variant sent by mistake.</li>
          </ul>
        </section>

        {/* Return Conditions */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-2xs space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gray-900" />
            2. Return Conditions
          </h2>
          <p>To be eligible for an exchange or refund, the returned merchandise must:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-500">
            <li>Be in its original packaging with all included accessories, manuals, and boxes.</li>
            <li>Show no signs of physical abuse, liquid exposure (unless certified waterproof), or third-party repair attempts.</li>
            <li>Include proof of purchase (such as order number or SMS confirmation).</li>
          </ul>
        </section>

        {/* Exchange vs Refund */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-2xs space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            3. Replacement &amp; Refund Process
          </h2>
          <p>
            Once our verification team receives and inspects the returned item:
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-gray-500">
            <li><strong>Free Replacement:</strong> A brand-new replacement unit will be dispatched immediately via express courier free of charge.</li>
            <li><strong>Refund:</strong> If the product is out of stock, we will issue a 100% refund to your bKash, Nagad, or bank account within 3 to 5 business days.</li>
          </ol>
        </section>

        {/* How to initiate */}
        <div className="rounded-2xl bg-gray-900 p-6 text-white text-center space-y-3">
          <h3 className="text-base font-bold">Need to Initiate a Return or Exchange?</h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            Simply send a WhatsApp message to our team with your Order Number and a short video/photo of the issue.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-block rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-gray-950 hover:bg-emerald-400 transition-colors shadow-xs"
            >
              Contact Support Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
