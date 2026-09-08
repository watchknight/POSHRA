'use client'

import { MessageCircle } from 'lucide-react'

interface WhatsAppButtonProps {
  phoneNumber?: string
  defaultMessage?: string
}

export function WhatsAppButton({
  phoneNumber = '8801700000000',
  defaultMessage = 'Hi Poshra, I want to know more about your products!',
}: WhatsAppButtonProps) {
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-20 sm:bottom-6 right-5 z-40 flex items-center gap-2 rounded-full bg-emerald-500 px-3.5 py-2.5 text-white shadow-lg hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 group"
    >
      <MessageCircle className="h-6 w-6 fill-white" />
      <span className="hidden sm:inline text-xs font-semibold tracking-wide pr-1">
        WhatsApp Us
      </span>
    </a>
  )
}
