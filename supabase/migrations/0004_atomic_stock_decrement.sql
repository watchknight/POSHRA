-- ============================================================
-- Migration: 0004_atomic_stock_decrement.sql
-- Function to atomically decrement product stock with bounds checking
-- ============================================================

create or replace function public.decrement_product_stock(
  p_product_id uuid,
  p_quantity integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated integer;
begin
  if p_quantity <= 0 then
    return false;
  end if;

  update public.products
  set stock_qty = stock_qty - p_quantity
  where id = p_product_id and stock_qty >= p_quantity;

  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$;

-- Grant execute permissions so PostgREST RPC can expose it
grant execute on function public.decrement_product_stock(uuid, integer) to anon, authenticated, service_role;
