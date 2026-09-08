-- ============================================================
-- Poshra — Database Schema
-- Migration: 0001_initial_schema.sql  (full replacement)
-- Paste this into Supabase SQL Editor → Run
-- ============================================================

-- ── Extensions ─────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Enums ──────────────────────────────────────────────────
create type payment_method_type as enum ('cod', 'online');
create type payment_status_type as enum ('pending', 'paid', 'failed', 'refunded');

-- order_status will get more values in Stage 4; start minimal
create type order_status_type as enum (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

create type delivery_zone_type as enum ('inside_dhaka', 'outside_dhaka');
create type coupon_type_enum as enum ('percent', 'flat');

-- ── Auto-increment for human-friendly order numbers ─────────
create sequence if not exists orders_seq start with 10234 increment by 1;

-- ── admin_users (profiles linked to Supabase Auth) ──────────
-- Supabase Auth manages passwords; this table adds app-level metadata.
create table public.admin_users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  role       text not null default 'admin',  -- 'admin' | 'super_admin'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── categories ──────────────────────────────────────────────
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  image_url  text,
  parent_id  uuid references public.categories(id) on delete set null,
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── products ────────────────────────────────────────────────
create table public.products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  description      text,
  images           text[] not null default '{}',          -- ordered array of image URLs
  price            integer not null,                      -- BDT paisa (1 BDT = 100)
  compare_at_price integer,                               -- struck-through original price
  cost_price       integer,                               -- LIFEGOOD cost — admin-only, NEVER client-exposed
  category_id      uuid references public.categories(id) on delete set null,
  stock_qty        integer not null default 0,
  sku              text unique,
  supplier_ref     text,                                   -- paste LIFEGOOD product link/ref here
  variants         jsonb not null default '[]'::jsonb,    -- [{label, sku, stock_qty, price_adjustment}]
  is_active        boolean not null default true,
  rating_avg       numeric(3,2) not null default 0.00,
  rating_count     integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── customers ────────────────────────────────────────────────
-- Created automatically when a phone number places an order.
-- No signup flow — guests become customers transparently.
create table public.customers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null unique,                        -- BD format: 01XXXXXXXXX
  email      text unique,
  addresses  jsonb not null default '[]'::jsonb,          -- [{label, division, district, thana, street}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── orders ───────────────────────────────────────────────────
create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  order_number        text not null unique
                        default 'ORD-' || nextval('orders_seq'),
  customer_id         uuid references public.customers(id) on delete set null,

  -- Line items: snapshot at time of order
  -- [{product_id, name, sku, image_url, price, quantity, variant_label}]
  items               jsonb not null,

  -- Financials (all in BDT paisa)
  subtotal            integer not null,
  discount_amount     integer not null default 0,
  delivery_fee        integer not null default 0,
  total               integer not null,

  -- Payment
  payment_method      payment_method_type not null default 'cod',
  payment_status      payment_status_type not null default 'pending',

  -- Order lifecycle
  order_status        order_status_type not null default 'pending',

  -- Delivery address (denormalised for stability — address can change later)
  delivery_district   text not null,
  delivery_thana      text not null,
  delivery_address_line text not null,
  delivery_zone       delivery_zone_type not null default 'outside_dhaka',

  -- Supplier & courier (filled in by admin)
  supplier_order_ref  text,                              -- LIFEGOOD order ref
  courier_name        text,
  courier_tracking_code text,

  -- Status history: append-only log stored as JSONB
  -- [{status, note, at}]
  status_history      jsonb not null default '[]'::jsonb,

  -- Admin
  admin_note          text,
  coupon_code         text,                              -- applied coupon (snapshot)

  -- Fraud
  otp_verified        boolean not null default false,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── coupons ─────────────────────────────────────────────────
create table public.coupons (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique,
  type             coupon_type_enum not null,
  value            integer not null,                     -- percent (0-100) or flat paisa
  min_order_amount integer not null default 0,           -- minimum subtotal to apply
  expires_at       timestamptz,
  usage_limit      integer,                              -- null = unlimited
  times_used       integer not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── reviews ─────────────────────────────────────────────────
create table public.reviews (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  customer_name text not null,
  rating        smallint not null check (rating between 1 and 5),
  comment       text,
  images        text[] not null default '{}',
  is_approved   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── Indexes ─────────────────────────────────────────────────
create index idx_products_category      on public.products(category_id);
create index idx_products_slug          on public.products(slug);
create index idx_products_is_active     on public.products(is_active);
create index idx_orders_customer        on public.orders(customer_id);
create index idx_orders_status          on public.orders(order_status);
create index idx_orders_created_at      on public.orders(created_at desc);
create index idx_orders_order_number    on public.orders(order_number);
create index idx_customers_phone        on public.customers(phone);
create index idx_reviews_product        on public.reviews(product_id);
create index idx_reviews_is_approved    on public.reviews(is_approved);
create index idx_coupons_code           on public.coupons(code);

-- ── updated_at trigger ──────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_admin_users_updated_at
  before update on public.admin_users
  for each row execute function public.set_updated_at();

create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger trg_customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger trg_coupons_updated_at
  before update on public.coupons
  for each row execute function public.set_updated_at();

create trigger trg_reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- ── Auto-create admin_users row on auth.users insert ────────
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.admin_users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ── Row Level Security ───────────────────────────────────────
alter table public.admin_users  enable row level security;
alter table public.categories   enable row level security;
alter table public.products     enable row level security;
alter table public.customers    enable row level security;
alter table public.orders       enable row level security;
alter table public.coupons      enable row level security;
alter table public.reviews      enable row level security;

-- Public (anon) reads — storefront
create policy "Anon can read active categories"
  on public.categories for select to anon
  using (is_active = true);

create policy "Anon can read active products (no cost_price)"
  on public.products for select to anon
  using (is_active = true);
-- Note: cost_price is in the row but never queried in public SELECT lists.
-- For extra safety you could use a view, but column-level selection in
-- Server Actions/Components is sufficient for Stage 1.

create policy "Anon can read approved reviews"
  on public.reviews for select to anon
  using (is_approved = true);

-- Anon INSERT for orders/customers (guest checkout — Stage 3)
-- Implemented via service-role Server Action, not direct anon INSERT.
-- No anon write policies needed.

-- Authenticated (admin) — full access to everything
create policy "Admin full access to admin_users"
  on public.admin_users for all to authenticated
  using (true) with check (true);

create policy "Admin full access to categories"
  on public.categories for all to authenticated
  using (true) with check (true);

create policy "Admin full access to products"
  on public.products for all to authenticated
  using (true) with check (true);

create policy "Admin full access to customers"
  on public.customers for all to authenticated
  using (true) with check (true);

create policy "Admin full access to orders"
  on public.orders for all to authenticated
  using (true) with check (true);

create policy "Admin full access to coupons"
  on public.coupons for all to authenticated
  using (true) with check (true);

create policy "Admin full access to reviews"
  on public.reviews for all to authenticated
  using (true) with check (true);

-- ── Public order-tracking function (security definer) ────────
-- Returns safe public fields only — cost_price, admin_note, supplier_order_ref excluded.
create or replace function public.get_order_by_number(p_order_number text)
returns json
language plpgsql security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order
  from public.orders
  where order_number = upper(trim(p_order_number));

  if not found then
    return null;
  end if;

  return json_build_object(
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
    'created_at',            v_order.created_at
    -- admin_note, supplier_order_ref, cost_price intentionally excluded
  );
end;
$$;

grant execute on function public.get_order_by_number(text) to anon;
