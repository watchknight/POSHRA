const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  const categories = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Smart Gadgets', slug: 'smart-gadgets', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', sort_order: 1, is_active: true },
    { id: '22222222-2222-2222-2222-222222222222', name: "Men's Fashion", slug: 'mens-fashion', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', sort_order: 2, is_active: true },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Home & Lifestyle', slug: 'home-lifestyle', image_url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80', sort_order: 3, is_active: true },
    { id: '44444444-4444-4444-4444-444444444444', name: 'Personal Care', slug: 'personal-care', image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80', sort_order: 4, is_active: true }
  ];

  console.log('Seeding categories...');
  const { error: catErr } = await supabase.from('categories').upsert(categories, { onConflict: 'slug' });
  if (catErr) console.error('Category error:', catErr);

  const products = [
    {
      id: 'a1111111-1111-1111-1111-111111111111',
      name: 'Ultra Pro AMOLED Smartwatch with Calling',
      slug: 'ultra-pro-amoled-smartwatch',
      description: 'Experience next-gen health monitoring and Bluetooth crystal-clear calling with this premium Ultra Pro Smartwatch. Features a 2.02" HD AMOLED display, IP68 water resistance, heart rate & SpO2 tracking, and 7-day battery life on a single charge. Premium zinc alloy body with interchangeable silicone straps.',
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80'
      ],
      price: 245000,
      compare_at_price: 320000,
      cost_price: 140000,
      category_id: '11111111-1111-1111-1111-111111111111',
      stock_qty: 42,
      sku: 'SW-ULTRA-01',
      supplier_ref: 'https://lifegood.app/products/watch-ultra-amoled-2024',
      variants: [
        { label: 'Space Black', sku: 'SW-ULTRA-BLK', stock_qty: 20, price_adjustment: 0 },
        { label: 'Titanium Orange', sku: 'SW-ULTRA-ORG', stock_qty: 14, price_adjustment: 5000 },
        { label: 'Silver White', sku: 'SW-ULTRA-WHT', stock_qty: 8, price_adjustment: 0 }
      ],
      is_active: true,
      rating_avg: 4.85,
      rating_count: 38
    },
    {
      id: 'a2222222-2222-2222-2222-222222222222',
      name: 'Active Noise Cancelling Wireless Earbuds (ANC 35dB)',
      slug: 'anc-wireless-earbuds-pro',
      description: 'Block out the chaotic city noise with active hybrid noise cancellation up to 35dB. Powered by 13mm dynamic titanium drivers for deep thumping bass and studio-clear vocals. Includes Transparency Mode, low-latency gaming mode (45ms), and up to 32 hours total playtime with the compact wireless charging case.',
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
        'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&q=80',
        'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80'
      ],
      price: 185000,
      compare_at_price: 250000,
      cost_price: 95000,
      category_id: '11111111-1111-1111-1111-111111111111',
      stock_qty: 18,
      sku: 'TWS-ANC-PRO',
      supplier_ref: 'https://lifegood.app/products/tws-anc-titanium-bass',
      variants: [
        { label: 'Carbon Black', sku: 'TWS-BLK', stock_qty: 12, price_adjustment: 0 },
        { label: 'Pearl White', sku: 'TWS-WHT', stock_qty: 6, price_adjustment: 0 }
      ],
      is_active: true,
      rating_avg: 4.72,
      rating_count: 46
    },
    {
      id: 'a3333333-3333-3333-3333-333333333333',
      name: 'Premium Genuine Leather Minimalist RFID Wallet',
      slug: 'genuine-leather-rfid-wallet',
      description: 'Crafted from 100% top-grain crazy-horse leather that develops a rich vintage patina over time. Embedded with military-grade RFID blocking technology to protect your cards against digital theft. Holds 8-10 cards, full-length cash compartment, and quick-access thumb slot.',
      images: [
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
        'https://images.unsplash.com/photo-1559563458-527698bf5295?w=800&q=80'
      ],
      price: 125000,
      compare_at_price: 180000,
      cost_price: 65000,
      category_id: '22222222-2222-2222-2222-222222222222',
      stock_qty: 27,
      sku: 'WLT-LTR-RFID',
      supplier_ref: 'https://lifegood.app/products/rfid-slim-leather-wallet-ch',
      variants: [
        { label: 'Coffee Brown', sku: 'WLT-BRN', stock_qty: 15, price_adjustment: 0 },
        { label: 'Classic Black', sku: 'WLT-BLK', stock_qty: 12, price_adjustment: 0 }
      ],
      is_active: true,
      rating_avg: 4.90,
      rating_count: 29
    },
    {
      id: 'a4444444-4444-4444-4444-444444444444',
      name: 'Vintage Stainless Steel Chronograph Quartz Watch',
      slug: 'vintage-chronograph-quartz-watch',
      description: 'A timeless masculine timepiece featuring Japanese quartz movement, functional sub-dials, tachymeter bezel, and date calendar display. Hardened mineral crystal glass protects against scratches. Water-resistant up to 30 meters.',
      images: [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
        'https://images.unsplash.com/photo-1547996160-71dfabb19688?w=800&q=80'
      ],
      price: 215000,
      compare_at_price: 295000,
      cost_price: 110000,
      category_id: '22222222-2222-2222-2222-222222222222',
      stock_qty: 7,
      sku: 'WCH-CHRONO-09',
      supplier_ref: 'https://lifegood.app/products/mens-chrono-watch-vintage-9',
      variants: [
        { label: 'Emerald Dial / Silver', sku: 'WCH-EMR', stock_qty: 4, price_adjustment: 0 },
        { label: 'Onyx Black / Gold', sku: 'WCH-GLD', stock_qty: 3, price_adjustment: 10000 }
      ],
      is_active: true,
      rating_avg: 4.65,
      rating_count: 19
    },
    {
      id: 'a5555555-5555-5555-5555-555555555555',
      name: 'Flame Effect Ultrasonic Aroma Essential Oil Diffuser',
      slug: 'flame-ultrasonic-aroma-diffuser',
      description: 'Transform your room into a tranquil spa sanctuary. Creates a realistic flame ambiance using smart LED lights and cold ultrasonic mist. Whisper quiet operation (<25dB), automatic shutoff when water runs out, and compatible with all pure essential oils. Perfect for bedroom, study, or living space.',
      images: [
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
        'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80'
      ],
      price: 165000,
      compare_at_price: 230000,
      cost_price: 82000,
      category_id: '33333333-3333-3333-3333-333333333333',
      stock_qty: 22,
      sku: 'HOM-FLM-DIF',
      supplier_ref: 'https://lifegood.app/products/flame-diffuser-humidifier-200ml',
      variants: [
        { label: 'Warm Amber Glow', sku: 'DIF-AMB', stock_qty: 14, price_adjustment: 0 },
        { label: 'Dual Flame Blue/Orange', sku: 'DIF-DUO', stock_qty: 8, price_adjustment: 15000 }
      ],
      is_active: true,
      rating_avg: 4.80,
      rating_count: 33
    },
    {
      id: 'a6666666-6666-6666-6666-666666666666',
      name: 'Portable 6-Blade USB-C Rechargeable Smoothie Blender',
      slug: 'portable-rechargeable-mini-blender',
      description: 'Make fresh fruit smoothies, protein shakes, and baby food anywhere on the go! Equipped with 6 ultra-sharp 304 stainless steel blades spinning at 22,000 RPM. USB-C rechargeable 4000mAh battery delivers 15-20 blends per charge. BPA-free food grade PCTG bottle with carrying strap.',
      images: [
        'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=80',
        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&q=80'
      ],
      price: 145000,
      compare_at_price: 199000,
      cost_price: 75000,
      category_id: '33333333-3333-3333-3333-333333333333',
      stock_qty: 15,
      sku: 'HOM-BLND-USB',
      supplier_ref: 'https://lifegood.app/products/mini-blender-portable-6blade',
      variants: [
        { label: 'Mint Green', sku: 'BLND-GRN', stock_qty: 8, price_adjustment: 0 },
        { label: 'Sakura Pink', sku: 'BLND-PNK', stock_qty: 7, price_adjustment: 0 }
      ],
      is_active: true,
      rating_avg: 4.75,
      rating_count: 24
    },
    {
      id: 'a7777777-7777-7777-7777-777777777777',
      name: 'Professional Vintage T9 Metal Body Hair & Beard Trimmer',
      slug: 'vintage-t9-metal-hair-trimmer',
      description: 'All-metal engraved Buddha/Dragon dragon casing with zero-gapped stainless T-blade for precise hair lining, fading, and beard detailing. High-torque quiet rotary motor cuts through thick hair effortlessly without snagging. Includes 4 guard combs (1.5mm, 2mm, 3mm, 4mm), cleaning brush, and USB charging cable.',
      images: [
        'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&q=80',
        'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80'
      ],
      price: 99000,
      compare_at_price: 150000,
      cost_price: 45000,
      category_id: '44444444-4444-4444-4444-444444444444',
      stock_qty: 35,
      sku: 'PRC-TRM-T9',
      supplier_ref: 'https://lifegood.app/products/vintage-t9-gold-trimmer-metal',
      variants: [
        { label: 'Antique Bronze Dragon', sku: 'TRM-DRG', stock_qty: 20, price_adjustment: 0 },
        { label: 'Golden Buddha', sku: 'TRM-GLD', stock_qty: 15, price_adjustment: 0 }
      ],
      is_active: true,
      rating_avg: 4.91,
      rating_count: 67
    },
    {
      id: 'a8888888-8888-8888-8888-888888888888',
      name: '5-in-1 Hot Air Styler & Hair Dryer Volumizer Brush',
      slug: '5-in-1-hot-air-styler-hair-dryer',
      description: 'Salon quality blowouts and effortless curls at home without extreme heat damage. Comes with 5 interchangeable attachments: pre-styling dryer, 30mm left & right curling barrels, firm smoothing brush, and round volumizing brush. Negative ion technology reduces frizz and static.',
      images: [
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80'
      ],
      price: 285000,
      compare_at_price: 390000,
      cost_price: 135000,
      category_id: '44444444-4444-4444-4444-444444444444',
      stock_qty: 11,
      sku: 'PRC-AIR-5IN1',
      supplier_ref: 'https://lifegood.app/products/5in1-air-curler-hair-styler',
      variants: [
        { label: 'Grey & Pink', sku: 'AIR-PNK', stock_qty: 6, price_adjustment: 0 },
        { label: 'Royal Purple', sku: 'AIR-PRP', stock_qty: 5, price_adjustment: 5000 }
      ],
      is_active: true,
      rating_avg: 4.82,
      rating_count: 41
    }
  ];

  console.log('Seeding products...');
  const { error: prodErr } = await supabase.from('products').upsert(products, { onConflict: 'slug' });
  if (prodErr) console.error('Product error:', prodErr);

  const reviews = [
    { product_id: 'a1111111-1111-1111-1111-111111111111', customer_name: 'Md. Tanvir Ahmed', rating: 5, comment: 'Watch quality is insane! AMOLED display is bright even in direct sunlight in Dhaka. Calling feature works smoothly, mic is surprisingly clear. Cash on delivery was fast.', is_approved: true },
    { product_id: 'a1111111-1111-1111-1111-111111111111', customer_name: 'Sajid Hossain', rating: 5, comment: 'Received in Chattogram in 3 days. Original packaging and seller even verified before shipping. 10/10 recommendation.', is_approved: true },
    { product_id: 'a1111111-1111-1111-1111-111111111111', customer_name: 'Ariful Islam', rating: 4, comment: 'Good battery life, lasts about 5-6 days on heavy use. Value for money.', is_approved: true },
    { product_id: 'a2222222-2222-2222-2222-222222222222', customer_name: 'Nusrat Jahan', rating: 5, comment: 'ANC really works on the bus and rickshaw! Bass is super punchy. Love the white case.', is_approved: true },
    { product_id: 'a3333333-3333-3333-3333-333333333333', customer_name: 'Shafiqul Islam', rating: 5, comment: 'Pure leather smell and feel! Easily holds 8 cards and cash. Fits slim in front pocket.', is_approved: true },
    { product_id: 'a4444444-4444-4444-4444-444444444444', customer_name: 'Mahmudul Hasan', rating: 5, comment: 'Heavy premium feel on the wrist. Looks like a 10k watch. Sub dials work properly.', is_approved: true },
    { product_id: 'a5555555-5555-5555-5555-555555555555', customer_name: 'Farzana Yeasmin', rating: 5, comment: 'The flame effect in the dark looks magical. My bedroom feels like a luxury hotel.', is_approved: true },
    { product_id: 'a7777777-7777-7777-7777-777777777777', customer_name: 'Kazi Zubair', rating: 5, comment: 'Trimmer blade is very sharp and gives a clean shave without cuts. Metal body is heavy and durable.', is_approved: true },
    { product_id: 'a8888888-8888-8888-8888-888888888888', customer_name: 'Sadia Afrin', rating: 5, comment: 'Saved so much salon money! Curls hold all day with a little hairspray. Delivery inside Dhaka was under 24 hours.', is_approved: true }
  ];

  console.log('Seeding reviews...');
  const { error: revErr } = await supabase.from('reviews').insert(reviews);
  if (revErr) console.error('Review error:', revErr);

  console.log('Seed completed successfully!');
}

seed().catch(console.error);
