import type { Metadata } from 'next'
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us — Poshra Support',
  description: 'Need help with your order or have questions about our products? Contact the Poshra Bangladesh customer support team.',
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center space-y-3 mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          We&apos;re Here to Help
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
          Have an inquiry about an order, delivery timing, or product specifications? Contact our friendly support staff.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Info Cards (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-emerald-50/50 p-5 space-y-3 border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-sm">
              <MessageCircle className="h-5 w-5" />
              <span>Fastest Support: WhatsApp</span>
            </div>
            <p className="text-xs text-gray-600">
              For instant response, order updates, or product videos, message us directly on WhatsApp.
            </p>
            <a
              href="https://wa.me/8801898919219?text=Hi%20Poshra,%20I%20need%20assistance"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              <span>Chat on WhatsApp</span>
              <MessageCircle className="h-4 w-4 fill-white" />
            </a>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Contact Information
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 shrink-0 text-gray-900 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Phone Hotline</p>
                  <p className="text-gray-700 font-medium">
                    <a href="tel:01898919219" className="hover:underline">01898-919219</a> / <a href="tel:01856615858" className="hover:underline">01856-615858</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 shrink-0 text-gray-900 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Email Address</p>
                  <p className="text-gray-500">support@poshra.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-gray-900 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Office Location</p>
                  <p className="text-gray-500">House 42, Road 11, Block D, Banani, Dhaka-1213, Bangladesh</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 shrink-0 text-gray-900 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Operating Hours</p>
                  <p className="text-gray-500">Every day: 10:00 AM – 10:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form (Col 7) */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Send Us a Message</h2>
            <p className="text-xs text-gray-500 mb-6">
              Fill in your details and our team will get back to you within 2-4 hours.
            </p>

            <form className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs sm:text-sm focus:border-gray-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs sm:text-sm focus:border-gray-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Order Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ORD-10234"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs sm:text-sm focus:border-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Message / Inquiry *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we assist you today?"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs sm:text-sm focus:border-gray-900 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-xs font-bold text-white shadow-xs hover:bg-gray-800 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
