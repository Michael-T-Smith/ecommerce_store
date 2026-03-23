


-- ─────────────────────────────────────────────────────────────────────────────
--  SEED: inventory
--  Matches INVENTORY_MOCK in src/lib/inventoryData.js exactly.
--  ON CONFLICT DO NOTHING — safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO inventory
  (sku, name, description, price, cost_price, category, tag, emoji,
   sizes, supplier, stock_count, low_stock_threshold, in_stock)
VALUES
  ('BQ-001', 'Classic Red Roses',
   'A timeless dozen long-stemmed red roses, hand-tied with eucalyptus and wrapped in kraft paper.',
   52, 18, 'Bouquets', 'Popular', '🌹',
   ARRAY['Small','Standard','Large'], 'Piedmont Valley Growers', 12, 3, true),

  ('BQ-002', 'Sunflower Bundle',
   'Cheerful sunflowers bundled with seasonal greenery — a ray of sunshine for any occasion.',
   38, 12, 'Bouquets', NULL, '🌻',
   ARRAY['Standard','Large'], 'Piedmont Valley Growers', 8, 2, true),

  ('BQ-003', 'Wildflower Mix',
   'A loose, garden-gathered mix of seasonal wildflowers. No two are ever alike.',
   44, 14, 'Bouquets', 'New', '💐',
   ARRAY['Small','Standard','Large'], 'Blue Ridge Blooms', 6, 2, true),

  ('BQ-004', 'Lavender Stems',
   'Fresh lavender stems bundled and tied with twine. Fragrant, calming, beautiful.',
   36, 10, 'Bouquets', NULL, '💜',
   ARRAY['Standard'], 'Blue Ridge Blooms', 15, 3, true),

  ('AR-001', 'Tropical Paradise',
   'Birds of paradise, anthuriums, and tropical foliage arranged in a ceramic vessel.',
   68, 26, 'Arrangements', 'Bestseller', '🌺',
   ARRAY['Standard','Large'], 'Gulf Coast Tropicals', 5, 2, true),

  ('AR-002', 'Garden Centerpiece',
   'A lush, low centerpiece of garden roses, ranunculus, and soft greenery. Perfect for tables.',
   85, 32, 'Arrangements', NULL, '🌸',
   ARRAY['Standard','Large','XL'], 'Piedmont Valley Growers', 3, 2, true),

  ('AR-003', 'Rustic Wildflower Vase',
   'Dahlias, cosmos, and seasonal blooms in a mason jar — relaxed, warm, and inviting.',
   57, 20, 'Arrangements', NULL, '🌼',
   ARRAY['Small','Standard'], 'Blue Ridge Blooms', 7, 2, true),

  ('PL-001', 'Succulent Collection',
   'A curated set of three succulents in coordinating terra cotta pots. Low maintenance, long lasting.',
   42, 15, 'Plants', 'Popular', '🪴',
   ARRAY['Standard'], 'Desert Roots Nursery', 10, 3, true),

  ('PL-002', 'Peace Lily',
   'A classic peace lily in a nursery pot. Air purifying, shade tolerant, and easy to care for.',
   35, 11, 'Plants', NULL, '🌿',
   ARRAY['Small','Standard','Large'], 'Desert Roots Nursery', 9, 3, true),

  ('PL-003', 'Orchid Duo',
   'Two phalaenopsis orchids in coordinating ceramic pots. Elegant and long-blooming.',
   65, 28, 'Plants', 'New', '🌷',
   ARRAY['Standard'], 'Gulf Coast Tropicals', 0, 2, false),

  ('SE-001', 'Autumn Wreath',
   'Hand-crafted dried wreath with preserved oak leaves, seed pods, and cotton stems.',
   78, 30, 'Seasonal', 'Seasonal', '🍂',
   ARRAY['Standard','Large'], 'Appalachian Dried Goods', 4, 2, true),

  ('SE-002', 'Holiday Poinsettia',
   'Classic red poinsettia in a foil-wrapped pot. A holiday staple for home or gifting.',
   32, 10, 'Seasonal', 'Seasonal', '🎄',
   ARRAY['Small','Standard','Large'], 'Piedmont Valley Growers', 22, 5, true),

  ('SE-003', 'Spring Tulip Bunch',
   'A hand-tied bunch of mixed tulips in seasonal colors. Fresh from our growers weekly.',
   40, 13, 'Seasonal', NULL, '🌷',
   ARRAY['Standard','Large'], 'Blue Ridge Blooms', 11, 3, true),

  ('GF-001', 'Gift Basket — Blooms',
   'A wicker basket filled with a small arrangement, chocolates, and a handwritten card.',
   90, 38, 'Gifts', 'Popular', '🎁',
   ARRAY['Standard','Large'], 'In-house', 5, 2, true),

  ('GF-002', 'Dried Flower Bundle',
   'Preserved pampas, dried roses, and bunny tail grass — a lasting, low-maintenance gift.',
   48, 16, 'Gifts', NULL, '🪷',
   ARRAY['Small','Standard'], 'Appalachian Dried Goods', 8, 2, true),

  ('GF-003', 'Bud Vase Set',
   'A set of three bud vases with single-stem flowers — minimal, modern, and gift-ready.',
   55, 20, 'Gifts', 'New', '🏺',
   ARRAY['Standard'], 'In-house', 2, 3, true)

ON CONFLICT (sku) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
--  SEED: employees
--  Passwords are NULL here — run scripts/seed-dev.js after container starts
--  to populate password_hash for all three accounts.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO employees (name, email, phone, role, status, hire_date)
VALUES
  ('Cecelia Lamb', 'cecelia@lambsflorist.com', '(256) 555-0101', 'admin',    'active', '2010-03-01'),
  ('Frank Lamb',   'frank@lambsflorist.com',   '(256) 555-0102', 'manager',  'active', '2010-03-01'),
  ('Jane Holloway', 'jane@lambsflorist.com',     '(256) 555-0103', 'employee', 'active', '2022-06-15')
ON CONFLICT (email) DO NOTHING;