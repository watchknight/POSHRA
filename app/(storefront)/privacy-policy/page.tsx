import type { Metadata } from 'next'
import { Lock, EyeOff, Bell, UserCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy — Poshra',
  description: 'Learn how Poshra protects your personal data, delivery addresses, and guest order privacy.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center space-y-3 mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Transparency &amp; Safety
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-gray-600 leading-relaxed">
        <section className="rounded-3xl border border-gray-100 bg-gray-50/70 p-6 sm:p-8 space-y-3">
          <h2 className="text-base font-bold text-gray-900">Our Commitment to Your Privacy</h2>
          <p>
            At Poshra Bangladesh (&ldquo;Poshra&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), we take your personal data and online privacy with the utmost seriousness. This Privacy Policy outlines what information we collect when you order through our website and how that information is safeguarded.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-emerald-600" />
            1. Information We Collect
          </h2>
          <p>
            Because we operate a <strong>guest-checkout model</strong>, you are not required to create a permanent password or user account to shop. When you place an order, we collect only what is strictly necessary to fulfill delivery:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-500">
            <li><strong>Customer Name:</strong> To address the parcel correctly.</li>
            <li><strong>Mobile Phone Number:</strong> For SMS order confirmation, delivery call coordination with the rider, and fraud verification.</li>
            <li><strong>Delivery Address:</strong> (Division, District, Thana, Street details) to guide the courier dispatch.</li>
            <li><strong>Technical Fraud Signals:</strong> IP address, device type, and order submission duration to combat fake/prank cash-on-delivery orders.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-600" />
            2. How We Use Your Information
          </h2>
          <p>We use your information exclusively for:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-500">
            <li>Processing, verifying, and dispatching your requested order.</li>
            <li>Sharing the address and phone number with our trusted third-party courier partner (e.g. Pathao, Paperfly, RedX, Steadfast) strictly for parcel delivery.</li>
            <li>Sending SMS or WhatsApp order status updates and tracking links.</li>
            <li>Preventing fraudulent or prank orders.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-emerald-600" />
            3. Zero Data Selling Guarantee
          </h2>
          <p>
            We <strong>never sell, rent, trade, or monetize</strong> your personal phone numbers, names, or addresses with third-party advertisers, data brokers, or marketing lists. Your data is used only for fulfilling transactions you explicitly initiate on Poshra.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-4 w-4 text-emerald-600" />
            4. Communications &amp; Opt-Out
          </h2>
          <p>
            You will only receive operational SMS/WhatsApp messages relating directly to your purchase (Order Placed, Shipped, Courier Tracking Number). You will not receive unsolicited spam marketing.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-2xs space-y-2">
          <h2 className="text-base font-bold text-gray-900">5. Contact Us Regarding Your Data</h2>
          <p className="text-gray-500">
            If you wish to view, update, or request the deletion of your customer history, please contact our Data Protection Officer at:
          </p>
          <p className="font-semibold text-gray-900 pt-1">
            Email: <a href="mailto:privacy@poshra.com" className="text-emerald-700 underline">privacy@poshra.com</a><br />
            Address: House 42, Road 11, Banani, Dhaka, Bangladesh
          </p>
        </section>
      </div>
    </div>
  )
}
