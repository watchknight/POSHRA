import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Categories' }

export default function AdminCategoriesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Categories</h1>
      <p className="text-gray-500 text-sm">
        Category management UI is built in Stage 5.
      </p>
    </div>
  )
}
