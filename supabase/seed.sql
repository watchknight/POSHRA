-- ============================================================
-- Poshra — Seed Data for Demo Store
-- Migration / Seed Script: seed.sql
-- Run this in Supabase SQL Editor to populate sample products
-- ============================================================

-- ── 1. Insert Categories ────────────────────────────────────
insert into public.categories (id, name, slug, image_url, sort_order, is_active)
values
  ('11111111-1111-1111-1111-111111111111', 'Smart Gadgets', 'smart-gadgets', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 1, true),
  ('22222222-2222-2222-2222-222222222222', 'Men''s Fashion', 'mens-fashion', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 2, true),
  ('33333333-3333-3333-3333-333333333333', 'Home & Lifestyle', 'home-lifestyle', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80', 3, true),
  ('44444444-4444-4444-4444-444444444444', 'Personal Care', 'personal-care', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80', 4, true)
on conflict (slug) do nothing;

-- ── 2. Insert Products ──────────────────────────────────────
insert into public.products (
  id, name, slug, description, images, price, compare_at_price, cost_price, category_id, stock_qty, sku, supplier_ref, variants, is_active, rating_avg, rating_count
)
values
  (
    'a1111111-1111-1111-1111-111111111111',
    'Ultra Pro AMOLED Smartwatch with Calling',
    'ultra-pro-amoled-smartwatch',
    'Experience next-gen health monitoring and Bluetooth crystal-clear calling with this premium Ultra Pro Smartwatch. Features a 2.02" HD AMOLED display, IP68 water resistance, heart rate & SpO2 tracking, and 7-day battery life on a single charge. Premium zinc alloy body with interchangeable silicone straps.',
    array[
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80'
    ],
    245000, -- ৳2,450
    320000, -- ৳3,200
    140000, -- LIFEGOOD cost: ৳1,400
    '11111111-1111-1111-1111-111111111111',
    42,
    'SW-ULTRA-01',
    'https://lifegood.app/products/watch-ultra-amoled-2024',
    '[
      {"label": "Space Black", "sku": "SW-ULTRA-BLK", "stock_qty": 20, "price_adjustment": 0},
      {"label": "Titanium Orange", "sku": "SW-ULTRA-ORG", "stock_qty": 14, "price_adjustment": 5000},
      {"label": "Silver White", "sku": "SW-ULTRA-WHT", "stock_qty": 8, "price_adjustment": 0}
    ]'::jsonb,
    true,
    4.85,
    38
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'Active Noise Cancelling Wireless Earbuds (ANC 35dB)',
    'anc-wireless-earbuds-pro',
    'Block out the chaotic city noise with active hybrid noise cancellation up to 35dB. Powered by 13mm dynamic titanium drivers for deep thumping bass and studio-clear vocals. Includes Transparency Mode, low-latency gaming mode (45ms), and up to 32 hours total playtime with the compact wireless charging case.',
    array[
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&q=80',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80'
    ],
    185000, -- ৳1,850
    250000, -- ৳2,500
    95000,  -- LIFEGOOD cost: ৳950
    '11111111-1111-1111-1111-111111111111',
    18,
    'TWS-ANC-PRO',
    'https://lifegood.app/products/tws-anc-titanium-bass',
    '[
      {"label": "Carbon Black", "sku": "TWS-BLK", "stock_qty": 12, "price_adjustment": 0},
      {"label": "Pearl White", "sku": "TWS-WHT", "stock_qty": 6, "price_adjustment": 0}
    ]'::jsonb,
    true,
    4.72,
    46
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'Premium Genuine Leather Minimalist RFID Wallet',
    'genuine-leather-rfid-wallet',
    'Crafted from 100% top-grain crazy-horse leather that develops a rich vintage patina over time. Embedded with military-grade RFID blocking technology to protect your cards against digital theft. Holds 8-10 cards, full-length cash compartment, and quick-access thumb slot.',
    array[
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
      'https://images.unsplash.com/photo-1559563458-527698bf5295?w=800&q=80'
    ],
    125000, -- ৳1,250
    180000, -- ৳1,800
    65000,  -- LIFEGOOD cost: ৳650
    '22222222-2222-2222-2222-222222222222',
    27,
    'WLT-LTR-RFID',
    'https://lifegood.app/products/rfid-slim-leather-wallet-ch',
    '[
      {"label": "Coffee Brown", "sku": "WLT-BRN", "stock_qty": 15, "price_adjustment": 0},
      {"label": "Classic Black", "sku": "WLT-BLK", "stock_qty": 12, "price_adjustment": 0}
    ]'::jsonb,
    true,
    4.90,
    29
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    'Vintage Stainless Steel Chronograph Quartz Watch',
    'vintage-chronograph-quartz-watch',
    'A timeless masculine timepiece featuring Japanese quartz movement, functional sub-dials, tachymeter bezel, and date calendar display. Hardened mineral crystal glass protects against scratches. Water-resistant up to 30 meters.',
    array[
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
      'https://images.unsplash.com/photo-1547996160-71dfabb19688?w=800&q=80'
    ],
    215000, -- ৳2,150
    295000, -- ৳2,950
    110000, -- LIFEGOOD cost: ৳1,100
    '22222222-2222-2222-2222-222222222222',
    7, -- low stock urgency test
    'WCH-CHRONO-09',
    'https://lifegood.app/products/mens-chrono-watch-vintage-9',
    '[
      {"label": "Emerald Dial / Silver", "sku": "WCH-EMR", "stock_qty": 4, "price_adjustment": 0},
      {"label": "Onyx Black / Gold", "sku": "WCH-GLD", "stock_qty": 3, "price_adjustment": 10000}
    ]'::jsonb,
    true,
    4.65,
    19
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    'Flame Effect Ultrasonic Aroma Essential Oil Diffuser',
    'flame-ultrasonic-aroma-diffuser',
    'Transform your room into a tranquil spa sanctuary. Creates a realistic flame ambiance using smart LED lights and cold ultrasonic mist. Whisper quiet operation (<25dB), automatic shutoff when water runs out, and compatible with all pure essential oils. Perfect for bedroom, study, or living space.',
    array[
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80'
    ],
    165000, -- ৳1,650
    230000, -- ৳2,300
    82000,  -- LIFEGOOD cost: ৳820
    '33333333-3333-3333-3333-333333333333',
    22,
    'HOM-FLM-DIF',
    'https://lifegood.app/products/flame-diffuser-humidifier-200ml',
    '[
      {"label": "Warm Amber Glow", "sku": "DIF-AMB", "stock_qty": 14, "price_adjustment": 0},
      {"label": "Dual Flame Blue/Orange", "sku": "DIF-DUO", "stock_qty": 8, "price_adjustment": 15000}
    ]'::jsonb,
    true,
    4.80,
    33
  ),
  (
    'a6666666-6666-6666-6666-666666666666',
    'Portable 6-Blade USB-C Rechargeable Smoothie Blender',
    'portable-rechargeable-mini-blender',
    'Make fresh fruit smoothies, protein shakes, and baby food anywhere on the go! Equipped with 6 ultra-sharp 304 stainless steel blades spinning at 22,000 RPM. USB-C rechargeable 4000mAh battery delivers 15-20 blends per charge. BPA-free food grade PCTG bottle with carrying strap.',
    array[
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=80',
      'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&q=80'
    ],
    145000, -- ৳1,450
    199000, -- ৳1,990
    75000,  -- LIFEGOOD cost: ৳750
    '33333333-3333-3333-3333-333333333333',
    15,
    'HOM-BLND-USB',
    'https://lifegood.app/products/mini-blender-portable-6blade',
    '[
      {"label": "Mint Green", "sku": "BLND-GRN", "stock_qty": 8, "price_adjustment": 0},
      {"label": "Sakura Pink", "sku": "BLND-PNK", "stock_qty": 7, "price_adjustment": 0}
    ]'::jsonb,
    true,
    4.75,
    24
  ),
  (
    'a7777777-7777-7777-7777-777777777777',
    'Professional Vintage T9 Metal Body Hair & Beard Trimmer',
    'vintage-t9-metal-hair-trimmer',
    'All-metal engraved Buddha/Dragon dragon casing with zero-gapped stainless T-blade for precise hair lining, fading, and beard detailing. High-torque quiet rotary motor cuts through thick hair effortlessly without snagging. Includes 4 guard combs (1.5mm, 2mm, 3mm, 4mm), cleaning brush, and USB charging cable.',
    array[
      'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&q=80',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80'
    ],
    99000,  -- ৳990
    150000, -- ৳1,500
    45000,  -- LIFEGOOD cost: ৳450
    '44444444-4444-4444-4444-444444444444',
    35,
    'PRC-TRM-T9',
    'https://lifegood.app/products/vintage-t9-gold-trimmer-metal',
    '[
      {"label": "Antique Bronze Dragon", "sku": "TRM-DRG", "stock_qty": 20, "price_adjustment": 0},
      {"label": "Golden Buddha", "sku": "TRM-GLD", "stock_qty": 15, "price_adjustment": 0}
    ]'::jsonb,
    true,
    4.91,
    67
  ),
  (
    'a8888888-8888-8888-8888-888888888888',
    '5-in-1 Hot Air Styler & Hair Dryer Volumizer Brush',
    '5-in-1-hot-air-styler-hair-dryer',
    'Salon quality blowouts and effortless curls at home without extreme heat damage. Comes with 5 interchangeable attachments: pre-styling dryer, 30mm left & right curling barrels, firm smoothing brush, and round volumizing brush. Negative ion technology reduces frizz and static.',
    array[
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80'
    ],
    285000, -- ৳2,850
    390000, -- ৳3,900
    135000, -- LIFEGOOD cost: ৳1,350
    '44444444-4444-4444-4444-444444444444',
    11,
    'PRC-AIR-5IN1',
    'https://lifegood.app/products/5in1-air-curler-hair-styler',
    '[
      {"label": "Grey & Pink", "sku": "AIR-PNK", "stock_qty": 6, "price_adjustment": 0},
      {"label": "Royal Purple", "sku": "AIR-PRP", "stock_qty": 5, "price_adjustment": 5000}
    ]'::jsonb,
    true,
    4.82,
    41
  )
on conflict (slug) do nothing;

-- ── 3. Insert Reviews ───────────────────────────────────────
insert into public.reviews (
  product_id, customer_name, rating, comment, is_approved
)
values
  ('a1111111-1111-1111-1111-111111111111', 'Md. Tanvir Ahmed', 5, 'Watch quality is insane! AMOLED display is bright even in direct sunlight in Dhaka. Calling feature works smoothly, mic is surprisingly clear. Cash on delivery was fast.', true),
  ('a1111111-1111-1111-1111-111111111111', 'Sajid Hossain', 5, 'Received in Chattogram in 3 days. Original packaging and seller even verified before shipping. 10/10 recommendation.', true),
  ('a1111111-1111-1111-1111-111111111111', 'Ariful Islam', 4, 'Good battery life, lasts about 5-6 days on heavy use. Value for money.', true),
  ('a2222222-2222-2222-2222-222222222222', 'Nusrat Jahan', 5, 'ANC really works on the bus and rickshaw! Bass is super punchy. Love the white case.', true),
  ('a2222222-2222-2222-2222-222222222222', 'Rashedul Karim', 5, 'Best TWS in this price point in BD right now. Microphone clarity is great for office zoom calls.', true),
  ('a3333333-3333-3333-3333-333333333333', 'Shafiqul Islam', 5, 'Pure leather smell and feel! Easily holds 8 cards and cash. Fits slim in front pocket.', true),
  ('a4444444-4444-4444-4444-444444444444', 'Mahmudul Hasan', 5, 'Heavy premium feel on the wrist. Looks like a 10k watch. Sub dials work properly.', true),
  ('a5555555-5555-5555-5555-555555555555', 'Farzana Yeasmin', 5, 'The flame effect in the dark looks magical. My bedroom feels like a luxury hotel.', true),
  ('a7777777-7777-7777-7777-777777777777', 'Kazi Zubair', 5, 'Trimmer blade is very sharp and gives a clean shave without cuts. Metal body is heavy and durable.', true),
  ('a8888888-8888-8888-8888-888888888888', 'Sadia Afrin', 5, 'Saved so much salon money! Curls hold all day with a little hairspray. Delivery inside Dhaka was under 24 hours.', true)
on conflict do nothing;
