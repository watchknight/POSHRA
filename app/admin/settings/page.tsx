import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <p className="text-gray-500 text-sm">
        Settings UI is built in Stage 5.
      </p>
    </div>
  )
}
