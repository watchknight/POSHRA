import type { Metadata } from 'next'
import { AdminReviewList } from '@/components/admin/AdminReviewList'

export const metadata: Metadata = { title: 'Reviews — Admin' }

export default function AdminReviewsPage() {
  return <AdminReviewList />
}
