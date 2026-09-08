import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { AdminProductList } from '@/components/admin/AdminProductList'

export const metadata: Metadata = { title: 'Products — Admin' }

export default async function AdminProductsPage() {
  const supabase = createAdminClient()
  const { data: categoriesRaw } = await supabase
    .from('categories')
    .select('id, name')
    .order('sort_order', { ascending: true })

  const categories = (categoriesRaw || []) as { id: string; name: string }[]

  return <AdminProductList categories={categories} />
}
