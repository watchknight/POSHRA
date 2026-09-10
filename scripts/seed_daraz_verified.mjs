import { createClient } from '@supabase/supabase-js'
import { gadgetsProducts } from './data/gadgets.mjs'
import { fashionProducts } from './data/fashion.mjs'
import { homeProducts } from './data/home.mjs'
import { personalCareProducts } from './data/personal_care.mjs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmycidryjuipbaiegnic.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteWNpZHJ5anVpcGJhaWVnbmljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODc4MjY3OCwiZXhwIjoyMTA0MzU4Njc4fQ.3XT7IozrmLjJWSqrN8i8dqbi1OQloBUWGIsIVzk6x-s'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function seedDarazVerified() {
  console.log('====================================================')
  console.log('🚀 Starting Daraz Verified Product Seeding (200 items)')
  console.log('====================================================\n')

  const allProducts = [
    ...gadgetsProducts,
    ...fashionProducts,
    ...homeProducts,
    ...personalCareProducts
  ]

  console.log(`📦 Loaded ${allProducts.length} total products:`)
  console.log(`  - Smart Gadgets: ${gadgetsProducts.length}`)
  console.log(`  - Men's Fashion: ${fashionProducts.length}`)
  console.log(`  - Home & Lifestyle: ${homeProducts.length}`)
  console.log(`  - Personal Care: ${personalCareProducts.length}\n`)

  const BATCH_SIZE = 25
  const totalBatches = Math.ceil(allProducts.length / BATCH_SIZE)

  for (let i = 0; i < allProducts.length; i += BATCH_SIZE) {
    const batch = allProducts.slice(i, i + BATCH_SIZE)
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1

    console.log(`⏳ Inserting Batch ${batchNumber}/${totalBatches} (${batch.length} products)...`)

    const { data, error } = await supabase
      .from('products')
      .upsert(batch, { onConflict: 'slug' })

    if (error) {
      console.error(`❌ Batch ${batchNumber} failed:`, error.message)
      throw error
    }

    console.log(`✅ Batch ${batchNumber}/${totalBatches} successfully upserted.`)
  }

  console.log('\n====================================================')
  console.log('🔍 Verifying Final Counts in Supabase...')
  console.log('====================================================\n')

  const { count: totalCount, error: countErr } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  if (countErr) {
    console.error('❌ Error counting total products:', countErr.message)
  } else {
    console.log(`🎉 Total Products in Database: ${totalCount}`)
  }

  const { data: categories, error: catErr } = await supabase
    .from('categories')
    .select('id, name, slug')

  if (catErr) {
    console.error('❌ Error fetching categories:', catErr.message)
  } else {
    console.log('\n📊 Product Breakdown By Category:')
    for (const cat of categories) {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id)

      if (error) {
        console.error(`  - ${cat.name}: ERROR (${error.message})`)
      } else {
        console.log(`  - ${cat.name} (${cat.slug}): ${count} products`)
      }
    }
  }

  console.log('\n✨ Seeding completed successfully!')
}

seedDarazVerified().catch((err) => {
  console.error('\n💥 Fatal seeding failure:', err)
  process.exit(1)
})
