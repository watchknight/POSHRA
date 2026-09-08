import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchAdminOrderDetailAction } from '@/lib/actions/orders'
import { AdminOrderDetail } from '@/components/admin/AdminOrderDetail'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params
  return { title: `Order ${id} — Admin` }
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const result = await fetchAdminOrderDetailAction(id)
  
  if (!result.success || !result.data) {
    notFound()
  }
  const rawOrder = result.data as any
  const order = {
    ...rawOrder,
    steadfast_consignment_id: rawOrder.steadfast_consignment_id ?? null,
    fraud_score: rawOrder.fraud_score ?? 0,
    fraud_signals: rawOrder.fraud_signals ?? [],
    payment_details: rawOrder.payment_details ?? {},
  }

  return <AdminOrderDetail order={order} />
}
