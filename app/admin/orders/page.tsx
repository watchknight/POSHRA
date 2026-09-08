import type { Metadata } from 'next'
import { AdminOrderList } from '@/components/admin/AdminOrderList'

export const metadata: Metadata = { title: 'Orders — Admin' }

interface AdminOrdersPageProps {
  searchParams: Promise<{ status?: string; search?: string; payment?: string; date?: string; page?: string }>
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams
  return <AdminOrderList initialFilters={params} />
}
