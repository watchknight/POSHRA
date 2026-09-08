-- ============================================================
-- Poshra — Migration 0002: Expand order_status_type enum
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── Add new enum values ────────────────────────────────────
-- Postgres enums support ADD VALUE but not REMOVE VALUE.
-- 'processing' remains but is unused; new pipeline values added.

ALTER TYPE order_status_type ADD VALUE IF NOT EXISTS 'ordered_from_supplier' AFTER 'confirmed';
ALTER TYPE order_status_type ADD VALUE IF NOT EXISTS 'packed' AFTER 'ordered_from_supplier';
-- 'processing' stays between 'packed' and 'shipped' (unused, harmless)
ALTER TYPE order_status_type ADD VALUE IF NOT EXISTS 'out_for_delivery' AFTER 'shipped';

-- ── Update get_order_by_number to include customer_phone for verification ──
CREATE OR REPLACE FUNCTION public.get_order_by_number(p_order_number text, p_phone text DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order  public.orders%rowtype;
  v_customer public.customers%rowtype;
BEGIN
  SELECT * INTO v_order
  FROM public.orders
  WHERE order_number = upper(trim(p_order_number));

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- If phone is provided, verify it matches the customer
  IF p_phone IS NOT NULL AND trim(p_phone) != '' THEN
    IF v_order.customer_id IS NOT NULL THEN
      SELECT * INTO v_customer
      FROM public.customers
      WHERE id = v_order.customer_id;

      IF NOT FOUND OR v_customer.phone != trim(p_phone) THEN
        RETURN NULL;  -- phone doesn't match → treat as not found
      END IF;
    ELSE
      RETURN NULL;  -- no customer linked → can't verify
    END IF;
  END IF;

  -- Fetch customer name for display
  IF v_order.customer_id IS NOT NULL THEN
    SELECT * INTO v_customer
    FROM public.customers
    WHERE id = v_order.customer_id;
  END IF;

  RETURN json_build_object(
    'order_number',          v_order.order_number,
    'order_status',          v_order.order_status,
    'payment_method',        v_order.payment_method,
    'payment_status',        v_order.payment_status,
    'items',                 v_order.items,
    'subtotal',              v_order.subtotal,
    'discount_amount',       v_order.discount_amount,
    'delivery_fee',          v_order.delivery_fee,
    'total',                 v_order.total,
    'delivery_district',     v_order.delivery_district,
    'delivery_thana',        v_order.delivery_thana,
    'delivery_address_line', v_order.delivery_address_line,
    'delivery_zone',         v_order.delivery_zone,
    'courier_name',          v_order.courier_name,
    'courier_tracking_code', v_order.courier_tracking_code,
    'status_history',        v_order.status_history,
    'created_at',            v_order.created_at,
    'customer_name',         COALESCE(v_customer.name, 'Customer')
    -- admin_note, supplier_order_ref, cost_price intentionally excluded
  );
END;
$$;

-- Re-grant execute to anon (function signature changed)
GRANT EXECUTE ON FUNCTION public.get_order_by_number(text, text) TO anon;
-- Keep the old 1-arg version accessible too
GRANT EXECUTE ON FUNCTION public.get_order_by_number(text) TO anon;
