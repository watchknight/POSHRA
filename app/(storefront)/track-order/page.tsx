import type { Metadata } from 'next'
import { TrackOrderView } from '@/components/storefront/TrackOrderView'

export const metadata: Metadata = {
  title: 'Track Your Order — Poshra',
  description: 'Track your Poshra order status in real-time.',
}

interface TrackPageProps {
  searchParams: Promise<{ order?: string }>
}

export default async function TrackOrderPage({ searchParams }: TrackPageProps) {
  const { order } = await searchParams
  return <TrackOrderView initialOrderNumber={order || ''} />
}
