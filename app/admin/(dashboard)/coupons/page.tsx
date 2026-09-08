import type { Metadata } from 'next'
import { CouponList } from '@/components/admin/CouponList'

export const metadata: Metadata = { title: 'Coupons — Admin' }

export default function AdminCouponsPage() {
  return <CouponList />
}
