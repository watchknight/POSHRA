import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/storefront/Navbar'
import { Footer } from '@/components/storefront/Footer'
import { WhatsAppButton } from '@/components/storefront/WhatsAppButton'

import { LanguageProvider } from '@/components/i18n/LanguageContext'

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('name, slug')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-white text-gray-900">
        <Navbar categories={categories || []} />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </div>
    </LanguageProvider>
  )
}
