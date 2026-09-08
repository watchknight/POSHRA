import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { OrderConfirmedView } from '@/components/storefront/OrderConfirmedView'
import type { Order } from '@/types'

interface OrderConfirmedPageProps {
  params: Promise<{ orderNumber: string }>
}

export async function generateMetadata({ params }: OrderConfirmedPageProps): Promise<Metadata> {
  const { orderNumber } = await params
  return {
    title: `Order #${orderNumber} Confirmed — Poshra`,
    description: 'Thank you for your order! Your Cash on Delivery package is being prepared.',
  }
}

export default async function OrderConfirmedPage({ params }: OrderConfirmedPageProps) {
  const { orderNumber } = await params
  const supabase = createAdminClient()

  const { data: orderRaw, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .maybeSingle()

  if (error || !orderRaw) {
    notFound()
  }

  const order = orderRaw as Order

  return <OrderConfirmedView order={order} />
}
