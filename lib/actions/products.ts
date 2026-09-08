'use server'

import { createAdminClient } from '@/lib/supabase/server'
import type { Product, Category } from '@/types'
import { revalidatePath } from 'next/cache'
import { assertAdminAuth } from '@/lib/auth/admin'

export interface AdminProductListItem extends Product {
  category?: { id: string; name: string } | null
}

export interface FetchProductsParams {
  search?: string
  categoryId?: string
  page?: number
  limit?: number
}

/**
 * Fetch products for admin list view with filters and pagination
 */
export async function fetchAdminProductsAction(params: FetchProductsParams = {}) {
  await assertAdminAuth()
  const supabase = createAdminClient()
  const page = params.page || 1
  const limit = params.limit || 20
  const offset = (page - 1) * limit

  try {
    let query = supabase
      .from('products')
      .select('*, category:categories(id, name)', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (params.search && params.search.trim()) {
      const q = params.search.trim()
      query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%,supplier_ref.ilike.%${q}%`)
    }

    if (params.categoryId && params.categoryId !== 'all') {
      query = query.eq('category_id', params.categoryId)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) {
      console.error('Error fetching admin products:', error)
      return { success: false, error: error.message, products: [], total: 0 }
    }

    return {
      success: true,
      products: (data || []) as unknown as AdminProductListItem[],
      total: count || 0,
    }
  } catch (err) {
    console.error('Unexpected error fetching admin products:', err)
    return { success: false, error: 'Failed to load products', products: [], total: 0 }
  }
}

export interface ProductInput {
  id?: string
  name: string
  slug?: string
  description?: string
  price: number // in BDT (will be stored as paisa in DB)
  cost_price?: number // in BDT (will be stored as paisa in DB)
  compare_at_price?: number // in BDT (will be stored as paisa in DB)
  category_id?: string | null
  stock_qty: number
  sku?: string
  supplier_ref?: string
  images: string[]
  is_active?: boolean
}

/**
 * Helper to generate URL-safe slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Create or update a single product
 */
export async function createOrUpdateProductAction(input: ProductInput) {
  await assertAdminAuth()
  const supabase = createAdminClient()

  if (!input.name || !input.name.trim()) {
    return { success: false, error: 'Product name is required.' }
  }

  if (input.price === undefined || input.price < 0) {
    return { success: false, error: 'Valid selling price is required.' }
  }

  try {
    const rawSlug = input.slug?.trim() || slugify(input.name)
    let finalSlug = rawSlug

    // Check slug uniqueness if new or slug changed
    if (!input.id) {
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('slug', finalSlug)
        .maybeSingle()

      if (existing) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`
      }
    }

    const payload: Record<string, any> = {
      name: input.name.trim(),
      slug: finalSlug,
      description: input.description?.trim() || null,
      price: Math.round(input.price * 100), // paisa
      cost_price: input.cost_price ? Math.round(input.cost_price * 100) : null,
      compare_at_price: input.compare_at_price ? Math.round(input.compare_at_price * 100) : null,
      category_id: input.category_id || null,
      stock_qty: Number(input.stock_qty) || 0,
      sku: input.sku?.trim() || null,
      supplier_ref: input.supplier_ref?.trim() || null,
      images: input.images || [],
      is_active: input.is_active !== undefined ? input.is_active : true,
    }

    if (input.id) {
      // Update
      const { error } = await (supabase.from('products') as any)
        .update(payload)
        .eq('id', input.id)

      if (error) throw error
    } else {
      // Insert
      const { error } = await (supabase.from('products') as any).insert(payload)
      if (error) throw error
    }

    revalidatePath('/admin/products')
    revalidatePath('/products')
    return { success: true }
  } catch (err: any) {
    console.error('Error saving product:', err)
    return { success: false, error: err.message || 'Failed to save product.' }
  }
}

/**
 * Delete a product
 */
export async function deleteProductAction(id: string) {
  await assertAdminAuth()
  const supabase = createAdminClient()
  try {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error

    revalidatePath('/admin/products')
    revalidatePath('/products')
    return { success: true }
  } catch (err: any) {
    console.error('Error deleting product:', err)
    return { success: false, error: err.message || 'Failed to delete product.' }
  }
}

export interface BulkProductImportRow {
  name: string
  description?: string
  price: number // in BDT
  cost_price?: number // in BDT
  category?: string
  stock_qty?: number
  sku?: string
  supplier_ref?: string
  images?: string[]
}

/**
 * Bulk import products from parsed CSV data
 */
export async function bulkImportProductsAction(rows: BulkProductImportRow[]) {
  await assertAdminAuth()
  if (!rows || rows.length === 0) {
    return { success: false, error: 'No products provided for import.', count: 0 }
  }

  const supabase = createAdminClient()

  try {
    // 1. Fetch all categories to map by name or slug
    const { data: categoriesRaw } = await supabase
      .from('categories')
      .select('id, name, slug')

    const categoryMap = new Map<string, string>() // lower(name) -> id
    const categories = (categoriesRaw || []) as { id: string; name: string; slug: string }[]
    categories.forEach((c) => {
      categoryMap.set(c.name.toLowerCase().trim(), c.id)
      categoryMap.set(c.slug.toLowerCase().trim(), c.id)
    })

    // 2. Prepare product records
    const insertPayloads: any[] = []
    const timestampSuffix = Date.now().toString().slice(-4)

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const cleanName = row.name.trim()
      const baseSlug = slugify(cleanName) || `product-${Date.now()}`
      const uniqueSlug = `${baseSlug}-${timestampSuffix}-${i + 1}`

      // Match category
      let categoryId: string | null = null
      if (row.category && row.category.trim()) {
        const catKey = row.category.trim().toLowerCase()
        if (categoryMap.has(catKey)) {
          categoryId = categoryMap.get(catKey)!
        } else {
          // Auto-create category if doesn't exist
          const catSlug = slugify(row.category) || `cat-${Date.now()}`
          const { data: newCat } = await (supabase.from('categories') as any)
            .insert({ name: row.category.trim(), slug: `${catSlug}-${Date.now().toString().slice(-3)}` })
            .select('id')
            .single()

          if (newCat) {
            categoryId = newCat.id
            categoryMap.set(catKey, categoryId!)
          }
        }
      }

      insertPayloads.push({
        name: cleanName,
        slug: uniqueSlug,
        description: row.description?.trim() || null,
        price: Math.round(Number(row.price || 0) * 100), // paisa
        cost_price: row.cost_price ? Math.round(Number(row.cost_price) * 100) : null,
        category_id: categoryId,
        stock_qty: Number(row.stock_qty) || 0,
        sku: row.sku?.trim() || `SKU-${Date.now().toString().slice(-6)}-${i + 1}`,
        supplier_ref: row.supplier_ref?.trim() || null,
        images: row.images || [],
        is_active: true,
      })
    }

    // 3. Batch insert in chunks of 50 with row-by-row fallback on error
    const chunkSize = 50
    let insertedCount = 0
    const failedRows: { name: string; error: string }[] = []

    for (let i = 0; i < insertPayloads.length; i += chunkSize) {
      const chunk = insertPayloads.slice(i, i + chunkSize)
      try {
        const { error } = await (supabase.from('products') as any).insert(chunk)
        if (error) throw error
        insertedCount += chunk.length
      } catch (chunkErr: any) {
        console.warn('Batch chunk insert error, falling back to row-by-row:', chunkErr.message)
        // Fall back to row-by-row insertion so malformed rows don't crash the entire batch
        for (const item of chunk) {
          const { error: rowErr } = await (supabase.from('products') as any).insert(item)
          if (!rowErr) {
            insertedCount++
          } else {
            failedRows.push({ name: item.name, error: rowErr.message })
          }
        }
      }
    }

    revalidatePath('/admin/products')
    revalidatePath('/products')
    return {
      success: true,
      count: insertedCount,
      failedCount: failedRows.length,
      failedRows: failedRows.slice(0, 10), // return top 10 sample errors if any
    }
  } catch (err: any) {
    console.error('Bulk import failed:', err)
    return { success: false, error: err.message || 'Failed to import products.', count: 0 }
  }
}
