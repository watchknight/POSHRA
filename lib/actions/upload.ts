'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { assertAdminAuth } from '@/lib/auth/admin'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
]

export interface UploadImageResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Secure image upload server action for admin catalog management.
 * Strictly verifies admin session, file size limit (5MB), and image MIME types.
 */
export async function uploadImageAction(formData: FormData): Promise<UploadImageResult> {
  try {
    // 1. Authenticate admin
    await assertAdminAuth()

    const file = formData.get('file') as File | null
    if (!file) {
      return { success: false, error: 'No image file provided.' }
    }

    // 2. Size validation
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
      }
    }

    // 3. MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: `Unsupported file format: ${file.type || 'unknown'}. Allowed formats: JPG, PNG, WEBP, AVIF, GIF.`,
      }
    }

    // 4. Generate unique file name
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const ext = file.name.split('.').pop() || 'webp'
    const cleanFileName = `products/${timestamp}-${randomSuffix}.${ext}`

    const supabase = createAdminClient()

    // 5. Upload to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer())
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(cleanFileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.warn('Supabase storage upload error:', error.message)
      // If bucket does not exist or storage not configured yet, return error
      return {
        success: false,
        error: `Storage upload failed: ${error.message}. Ensure 'product-images' bucket is created in Supabase.`,
      }
    }

    // 6. Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('product-images').getPublicUrl(data.path)

    return {
      success: true,
      url: publicUrl,
    }
  } catch (err: any) {
    console.error('uploadImageAction error:', err)
    return {
      success: false,
      error: err.message || 'Image upload failed.',
    }
  }
}
