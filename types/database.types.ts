export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          email: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          image_url: string | null
          parent_id: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          images: string[]
          price: number
          compare_at_price: number | null
          cost_price: number | null        // ADMIN-ONLY — never expose to client
          category_id: string | null
          stock_qty: number
          sku: string | null
          supplier_ref: string | null
          variants: Json                   // ProductVariant[]
          is_active: boolean
          rating_avg: number
          rating_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          images?: string[]
          price: number
          compare_at_price?: number | null
          cost_price?: number | null
          category_id?: string | null
          stock_qty?: number
          sku?: string | null
          supplier_ref?: string | null
          variants?: Json
          is_active?: boolean
          rating_avg?: number
          rating_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          images?: string[]
          price?: number
          compare_at_price?: number | null
          cost_price?: number | null
          category_id?: string | null
          stock_qty?: number
          sku?: string | null
          supplier_ref?: string | null
          variants?: Json
          is_active?: boolean
          rating_avg?: number
          rating_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          addresses: Json                  // CustomerAddress[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email?: string | null
          addresses?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string | null
          addresses?: Json
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          items: Json                      // OrderItem[]
          subtotal: number
          discount_amount: number
          delivery_fee: number
          total: number
          payment_method: Database['public']['Enums']['payment_method_type']
          payment_status: Database['public']['Enums']['payment_status_type']
          order_status: Database['public']['Enums']['order_status_type']
          delivery_district: string
          delivery_thana: string
          delivery_address_line: string
          delivery_zone: Database['public']['Enums']['delivery_zone_type']
          supplier_order_ref: string | null
          courier_name: string | null
          courier_tracking_code: string | null
          status_history: Json             // StatusHistoryEntry[]
          admin_note: string | null
          coupon_code: string | null
          otp_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          customer_id?: string | null
          items: Json
          subtotal: number
          discount_amount?: number
          delivery_fee?: number
          total: number
          payment_method?: Database['public']['Enums']['payment_method_type']
          payment_status?: Database['public']['Enums']['payment_status_type']
          order_status?: Database['public']['Enums']['order_status_type']
          delivery_district: string
          delivery_thana: string
          delivery_address_line: string
          delivery_zone?: Database['public']['Enums']['delivery_zone_type']
          supplier_order_ref?: string | null
          courier_name?: string | null
          courier_tracking_code?: string | null
          status_history?: Json
          admin_note?: string | null
          coupon_code?: string | null
          otp_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          items?: Json
          subtotal?: number
          discount_amount?: number
          delivery_fee?: number
          total?: number
          payment_method?: Database['public']['Enums']['payment_method_type']
          payment_status?: Database['public']['Enums']['payment_status_type']
          order_status?: Database['public']['Enums']['order_status_type']
          delivery_district?: string
          delivery_thana?: string
          delivery_address_line?: string
          delivery_zone?: Database['public']['Enums']['delivery_zone_type']
          supplier_order_ref?: string | null
          courier_name?: string | null
          courier_tracking_code?: string | null
          status_history?: Json
          admin_note?: string | null
          coupon_code?: string | null
          otp_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          type: Database['public']['Enums']['coupon_type_enum']
          value: number
          min_order_amount: number
          expires_at: string | null
          usage_limit: number | null
          times_used: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          type: Database['public']['Enums']['coupon_type_enum']
          value: number
          min_order_amount?: number
          expires_at?: string | null
          usage_limit?: number | null
          times_used?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          type?: Database['public']['Enums']['coupon_type_enum']
          value?: number
          min_order_amount?: number
          expires_at?: string | null
          usage_limit?: number | null
          times_used?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          customer_name: string
          rating: number
          comment: string | null
          images: string[]
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          customer_name: string
          rating: number
          comment?: string | null
          images?: string[]
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          customer_name?: string
          rating?: number
          comment?: string | null
          images?: string[]
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      get_order_by_number: {
        Args: { p_order_number: string; p_phone?: string }
        Returns: Json
      }
    }
    Enums: {
      payment_method_type: 'cod' | 'online'
      payment_status_type: 'pending' | 'paid' | 'failed' | 'refunded'
      order_status_type:
        | 'pending'
        | 'confirmed'
        | 'ordered_from_supplier'
        | 'packed'
        | 'processing'
        | 'shipped'
        | 'out_for_delivery'
        | 'delivered'
        | 'cancelled'
      delivery_zone_type: 'inside_dhaka' | 'outside_dhaka'
      coupon_type_enum: 'percent' | 'flat'
    }
  }
}

// ── Convenience aliases ──────────────────────────────────────
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
