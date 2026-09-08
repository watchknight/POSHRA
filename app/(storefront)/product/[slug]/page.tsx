import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ProductDetailView } from '@/components/storefront/ProductDetailView'
import type { Product, Review } from '@/types'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: productRaw } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  const product = productRaw as Product | null

  if (!product) {
    return { title: 'Product Not Found | Poshra' }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://poshra.com'
  const mainImage = product.images?.[0] || ''
  const priceBdt = (product.price / 100).toFixed(0)

  return {
    title: `${product.name} — ৳${priceBdt} Cash on Delivery | Poshra`,
    description:
      product.description?.slice(0, 160) ||
      `Buy ${product.name} online with Cash on Delivery in Bangladesh. 100% Quality Guaranteed.`,
    alternates: {
      canonical: `${baseUrl}/product/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} — ৳${priceBdt} | Poshra`,
      description:
        product.description?.slice(0, 160) ||
        `Buy ${product.name} online with Cash on Delivery across Bangladesh.`,
      url: `${baseUrl}/product/${product.slug}`,
      siteName: 'Poshra',
      locale: 'bn_BD',
      type: 'website',
      images: mainImage
        ? [
            {
              url: mainImage,
              width: 800,
              height: 800,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — ৳${priceBdt} | Poshra`,
      description:
        product.description?.slice(0, 160) ||
        `Buy ${product.name} online with Cash on Delivery in Bangladesh.`,
      images: mainImage ? [mainImage] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // 1. Fetch Product
  const { data: productRaw } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!productRaw) {
    notFound()
  }

  const product = productRaw as Product

  // 2. Fetch Approved Reviews & Related Products in parallel
  const [
    { data: reviewsRaw },
    { data: relatedRaw },
  ] = await Promise.all([
    supabase
      .from('reviews')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false }),
    product.category_id
      ? supabase
          .from('products')
          .select('*')
          .eq('category_id', product.category_id)
          .neq('id', product.id)
          .eq('is_active', true)
          .limit(4)
      : Promise.resolve({ data: [] }),
  ])

  const reviews = (reviewsRaw || []) as Review[]
  const relatedProducts = (relatedRaw || []) as Product[]

  // 3. Schema.org Product Structured Data JSON-LD
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://poshra.com'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images || [],
    description: product.description || undefined,
    sku: product.sku || product.slug,
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/product/${product.slug}`,
      priceCurrency: 'BDT',
      price: (product.price / 100).toFixed(2),
      availability:
        product.stock_qty > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Poshra',
      },
    },
    ...(product.rating_count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating_avg,
        reviewCount: product.rating_count,
        bestRating: '5',
        worstRating: '1',
      },
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailView
        product={product}
        reviews={reviews}
        relatedProducts={relatedProducts}
      />
    </>
  )
}
