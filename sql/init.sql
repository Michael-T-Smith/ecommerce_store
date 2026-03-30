-- ================================================================
--  Lamb's Florist — PostgreSQL Schema  (canonical — all migrations baked in)
--  File: sql/init.sql
--
--  Runs automatically on fresh container via docker-entrypoint-initdb.d.
--  Safe to run manually against an existing DB (all statements idempotent).
--
--    docker exec -i lambs_postgres psql -U lambs -d lambsflorist < sql/init.sql
--
--  Schema reflects all migrations 001-011:
--    - prices INTEGER[] + cost_prices INTEGER[] (replaces scalar price columns)
--    - sizes TEXT[] free-form (no hardcoded options)
--    - inventory_images table (multi-photo per product)
--    - No emoji column, no image_path column on inventory
--    - is_featured BOOLEAN + featured_accent VARCHAR(7) on inventory
--    - inventory.location TEXT (piedmont | centre) — store assignment
--    - delivery_zones table (admin-managed, replaces ENUM)
--    - delivery_zone + zone columns are TEXT (no ENUM)
--    - orders: fulfillment_type, pickup fields, processing_fee, customer_id
--    - orders.pickup_location TEXT — which store the customer will pick up from
--    - orders: pickup_date removed (stored in delivery_date for both types)
--    - customers + customer_addresses tables
-- ================================================================


-- ── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ── ENUMs ─────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE employee_status AS ENUM ('active', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending', 'confirmed', 'preparing',
    'out_for_delivery', 'delivered', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE delivery_status AS ENUM (
    'scheduled', 'dispatched', 'delivered', 'failed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- NOTE: delivery_zone ENUM intentionally omitted.
-- Zone values are TEXT, managed via the delivery_zones table.

DO $$ BEGIN
  CREATE TYPE delivery_window AS ENUM ('morning', 'afternoon');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── updated_at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ── TABLE: employees ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
  id             SERIAL          PRIMARY KEY,
  name           VARCHAR(120)    NOT NULL,
  email          VARCHAR(200)    NOT NULL UNIQUE,
  phone          VARCHAR(20),
  role           user_role       NOT NULL DEFAULT 'employee',
  status         employee_status NOT NULL DEFAULT 'active',
  password_hash  TEXT,
  hire_date      DATE            NOT NULL DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
DROP TRIGGER IF EXISTS employees_updated_at ON employees;
CREATE TRIGGER employees_updated_at
  BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX IF NOT EXISTS idx_employees_email  ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_role   ON employees(role);


-- ── TABLE: customers ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id             SERIAL        PRIMARY KEY,
  name           VARCHAR(120)  NOT NULL,
  email          VARCHAR(200)  NOT NULL UNIQUE,
  phone          VARCHAR(20),
  password_hash  TEXT,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
DROP TRIGGER IF EXISTS customers_updated_at ON customers;
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);


-- ── TABLE: customer_addresses ────────────────────────────────────────────────
-- zone is TEXT (not ENUM) — zone system is admin-managed via delivery_zones table
CREATE TABLE IF NOT EXISTS customer_addresses (
  id            SERIAL        PRIMARY KEY,
  customer_id   INTEGER       NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label         VARCHAR(60)   NOT NULL DEFAULT 'Home',
  address_line  TEXT          NOT NULL,
  city          VARCHAR(100)  NOT NULL,
  state         VARCHAR(50)   NOT NULL DEFAULT 'AL',
  zip           VARCHAR(20)   NOT NULL,
  zone          TEXT,
  is_default    BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
DROP TRIGGER IF EXISTS customer_addresses_updated_at ON customer_addresses;
CREATE TRIGGER customer_addresses_updated_at
  BEFORE UPDATE ON customer_addresses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX IF NOT EXISTS idx_addresses_customer ON customer_addresses(customer_id);


-- ── TABLE: inventory ─────────────────────────────────────────────────────────
-- prices INTEGER[] and cost_prices INTEGER[] are index-aligned with sizes TEXT[].
-- sizes[i] → prices[i]. Enforced in application layer (API routes).
-- is_featured + featured_accent control homepage "This Week's Picks" section.
-- No emoji column. No image_path column. Photos live in inventory_images.
CREATE TABLE IF NOT EXISTS inventory (
  id                   SERIAL        PRIMARY KEY,
  sku                  VARCHAR(20)   NOT NULL UNIQUE,
  name                 VARCHAR(200)  NOT NULL,
  description          TEXT,
  prices               INTEGER[]     NOT NULL DEFAULT ARRAY[0],
  cost_prices          INTEGER[]     NOT NULL DEFAULT ARRAY[0],
  category             VARCHAR(60)   NOT NULL,
  tag                  VARCHAR(40),
  sizes                TEXT[]        NOT NULL DEFAULT ARRAY['Standard'],
  supplier             VARCHAR(120),
  stock_count          INTEGER       NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
  low_stock_threshold  INTEGER       NOT NULL DEFAULT 2 CHECK (low_stock_threshold >= 0),
  in_stock             BOOLEAN       NOT NULL DEFAULT TRUE,
  is_featured          BOOLEAN       NOT NULL DEFAULT FALSE,
  featured_accent      VARCHAR(7)    NOT NULL DEFAULT '#D4511A',
  location             TEXT          NOT NULL DEFAULT 'piedmont' CHECK (location IN ('piedmont', 'centre')),
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
DROP TRIGGER IF EXISTS inventory_updated_at ON inventory;
CREATE TRIGGER inventory_updated_at
  BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_in_stock  ON inventory(in_stock);
CREATE INDEX IF NOT EXISTS idx_inventory_sku       ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_featured  ON inventory(is_featured) WHERE is_featured = TRUE;


-- ── TABLE: inventory_images ──────────────────────────────────────────────────
-- Up to 5 photos per product. display_order=0 is the cover image shown on cards.
-- path is the URL-ready string: /inventory/classic-red-roses-1.png
-- Physical files live in /public/inventory/
CREATE TABLE IF NOT EXISTS inventory_images (
  id            SERIAL        PRIMARY KEY,
  inventory_id  INTEGER       NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  path          TEXT          NOT NULL,
  display_order INTEGER       NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inv_images_inventory_id ON inventory_images(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inv_images_order        ON inventory_images(inventory_id, display_order);


-- ── TABLE: orders ─────────────────────────────────────────────────────────────
-- items JSONB is a snapshot of cart at order time — immune to inventory edits.
-- fulfillment_type: 'delivery' | 'pickup'
-- delivery_zone is TEXT (not ENUM) — nullable for pickup orders
-- processing_fee covers Stripe (2.9%+$0.30) grossed up to merchant-neutral
CREATE TABLE IF NOT EXISTS orders (
  id                SERIAL        PRIMARY KEY,
  order_number      VARCHAR(20)   NOT NULL UNIQUE,
  customer_name     VARCHAR(120)  NOT NULL,
  customer_email    VARCHAR(200),
  customer_phone    VARCHAR(20),
  items             JSONB         NOT NULL,
  subtotal          NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee      NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  processing_fee    NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (processing_fee >= 0),
  total             NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  fulfillment_type  VARCHAR(20)   NOT NULL DEFAULT 'delivery',
  status            order_status  NOT NULL DEFAULT 'pending',
  delivery_address  TEXT,
  delivery_zone     TEXT,
  delivery_date     DATE,
  delivery_window   TEXT          NOT NULL DEFAULT 'afternoon',
  pickup_time       VARCHAR(20),
  pickup_location   TEXT          DEFAULT 'piedmont',
  note_message      TEXT,
  staff_notes       TEXT,
  stripe_payment_id VARCHAR(200),
  customer_id       INTEGER       REFERENCES customers(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX IF NOT EXISTS idx_orders_status         ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date  ON orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_created_at     ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id    ON orders(customer_id);


-- ── TABLE: deliveries ────────────────────────────────────────────────────────
-- zone is TEXT (not ENUM)
CREATE TABLE IF NOT EXISTS deliveries (
  id                SERIAL          PRIMARY KEY,
  order_id          INTEGER         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  driver_id         INTEGER         REFERENCES employees(id) ON DELETE SET NULL,
  zone              TEXT,
  address           TEXT            NOT NULL,
  scheduled_date    DATE            NOT NULL,
  scheduled_window  TEXT            NOT NULL DEFAULT 'afternoon',
  status            delivery_status NOT NULL DEFAULT 'scheduled',
  delivery_notes    TEXT,
  delivered_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
DROP TRIGGER IF EXISTS deliveries_updated_at ON deliveries;
CREATE TRIGGER deliveries_updated_at
  BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_date   ON deliveries(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver ON deliveries(driver_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order  ON deliveries(order_id);


-- ── TABLE: delivery_zones ────────────────────────────────────────────────────
-- Admin-managed delivery zones. Cecilia adds/edits from /dashboard/zones.
-- Checkout fetches active zones from GET /api/delivery-zones at runtime.
-- Flat fee model — no per-mile calculations.
CREATE TABLE IF NOT EXISTS delivery_zones (
  id         SERIAL       PRIMARY KEY,
  value      VARCHAR(60)  NOT NULL UNIQUE,
  label      TEXT         NOT NULL,
  fee        INTEGER      NOT NULL DEFAULT 0 CHECK (fee >= 0),
  active     BOOLEAN      NOT NULL DEFAULT TRUE,
  sort_order INTEGER      NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
DROP TRIGGER IF EXISTS delivery_zones_updated_at ON delivery_zones;
CREATE TRIGGER delivery_zones_updated_at
  BEFORE UPDATE ON delivery_zones FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── SEED: delivery_zones ─────────────────────────────────────────────────────
INSERT INTO delivery_zones (value, label, fee, sort_order) VALUES
  ('piedmont', 'Piedmont',          8,  0),
  ('anniston', 'Anniston / Oxford', 12, 1),
  ('centre',   'Centre',            15, 2)
ON CONFLICT (value) DO NOTHING;


-- ── SEED: inventory ──────────────────────────────────────────────────────────
-- prices and cost_prices are INTEGER arrays aligned with sizes[].
-- sizes[i] → prices[i]. All seed items use uniform pricing across sizes
-- as a starting point — edit from the dashboard to set per-size pricing.
INSERT INTO inventory
  (sku, name, description, prices, cost_prices, category, tag,
   sizes, supplier, stock_count, low_stock_threshold, in_stock)
VALUES
  ('BQ-001', 'Classic Red Roses',
   'A timeless dozen long-stemmed red roses, hand-tied with eucalyptus and wrapped in kraft paper.',
   ARRAY[42,52,68], ARRAY[14,18,24],
   'Bouquets', 'Popular',
   ARRAY['Small','Standard','Large'], 'Piedmont Valley Growers', 12, 3, true),

  ('BQ-002', 'Sunflower Bundle',
   'Cheerful sunflowers bundled with seasonal greenery — a ray of sunshine for any occasion.',
   ARRAY[38,52], ARRAY[12,18],
   'Bouquets', NULL,
   ARRAY['Standard','Large'], 'Piedmont Valley Growers', 8, 2, true),

  ('BQ-003', 'Wildflower Mix',
   'A loose, garden-gathered mix of seasonal wildflowers. No two are ever alike.',
   ARRAY[36,44,58], ARRAY[11,14,20],
   'Bouquets', 'New',
   ARRAY['Small','Standard','Large'], 'Blue Ridge Blooms', 6, 2, true),

  ('BQ-004', 'Lavender Stems',
   'Fresh lavender stems bundled and tied with twine. Fragrant, calming, beautiful.',
   ARRAY[36], ARRAY[10],
   'Bouquets', NULL,
   ARRAY['Standard'], 'Blue Ridge Blooms', 15, 3, true),

  ('AR-001', 'Tropical Paradise',
   'Birds of paradise, anthuriums, and tropical foliage arranged in a ceramic vessel.',
   ARRAY[68,90], ARRAY[26,36],
   'Arrangements', 'Bestseller',
   ARRAY['Standard','Large'], 'Gulf Coast Tropicals', 5, 2, true),

  ('AR-002', 'Garden Centerpiece',
   'A lush, low centerpiece of garden roses, ranunculus, and soft greenery.',
   ARRAY[85,110,145], ARRAY[32,44,58],
   'Arrangements', NULL,
   ARRAY['Standard','Large','XL'], 'Piedmont Valley Growers', 3, 2, true),

  ('AR-003', 'Rustic Wildflower Vase',
   'Dahlias, cosmos, and seasonal blooms in a mason jar — relaxed, warm, and inviting.',
   ARRAY[44,57], ARRAY[15,20],
   'Arrangements', NULL,
   ARRAY['Small','Standard'], 'Blue Ridge Blooms', 7, 2, true),

  ('PL-001', 'Succulent Collection',
   'A curated set of three succulents in coordinating terra cotta pots.',
   ARRAY[42], ARRAY[15],
   'Plants', 'Popular',
   ARRAY['Standard'], 'Desert Roots Nursery', 10, 3, true),

  ('PL-002', 'Peace Lily',
   'A classic peace lily in a nursery pot. Air purifying, shade tolerant, easy to care for.',
   ARRAY[28,35,48], ARRAY[9,11,16],
   'Plants', NULL,
   ARRAY['Small','Standard','Large'], 'Desert Roots Nursery', 9, 3, true),

  ('PL-003', 'Orchid Duo',
   'Two phalaenopsis orchids in coordinating ceramic pots. Elegant and long-blooming.',
   ARRAY[65], ARRAY[28],
   'Plants', 'New',
   ARRAY['Standard'], 'Gulf Coast Tropicals', 0, 2, false),

  ('SE-001', 'Autumn Wreath',
   'Hand-crafted dried wreath with preserved oak leaves, seed pods, and cotton stems.',
   ARRAY[78,105], ARRAY[30,42],
   'Seasonal', 'Seasonal',
   ARRAY['Standard','Large'], 'Appalachian Dried Goods', 4, 2, true),

  ('SE-002', 'Holiday Poinsettia',
   'Classic red poinsettia in a foil-wrapped pot. A holiday staple.',
   ARRAY[24,32,44], ARRAY[8,10,15],
   'Seasonal', 'Seasonal',
   ARRAY['Small','Standard','Large'], 'Piedmont Valley Growers', 22, 5, true),

  ('SE-003', 'Spring Tulip Bunch',
   'A hand-tied bunch of mixed tulips in seasonal colors. Fresh from our growers weekly.',
   ARRAY[40,54], ARRAY[13,18],
   'Seasonal', NULL,
   ARRAY['Standard','Large'], 'Blue Ridge Blooms', 11, 3, true),

  ('GF-001', 'Gift Basket — Blooms',
   'A wicker basket filled with a small arrangement, chocolates, and a handwritten card.',
   ARRAY[90,120], ARRAY[38,52],
   'Gifts', 'Popular',
   ARRAY['Standard','Large'], 'In-house', 5, 2, true),

  ('GF-002', 'Dried Flower Bundle',
   'Preserved pampas, dried roses, and bunny tail grass — a lasting gift.',
   ARRAY[38,48], ARRAY[12,16],
   'Gifts', NULL,
   ARRAY['Small','Standard'], 'Appalachian Dried Goods', 8, 2, true),

  ('GF-003', 'Bud Vase Set',
   'A set of three bud vases with single-stem flowers — minimal, modern, gift-ready.',
   ARRAY[55], ARRAY[20],
   'Gifts', 'New',
   ARRAY['Standard'], 'In-house', 2, 3, true)

ON CONFLICT (sku) DO NOTHING;


-- ── SEED: employees ──────────────────────────────────────────────────────────
-- Passwords are NULL — run scripts/seed-dev.js after container starts.
-- Default creds after seed: cecilia@lambsflorist.com / admin1234
--                            frank@lambsflorist.com  / manager1234
INSERT INTO employees (name, email, phone, role, status, hire_date)
VALUES
  ('Cecilia Lamb', 'cecilia@lambsflorist.com', '(256) 555-0101', 'admin',    'active', '2010-03-01'),
  ('Frank Lamb',   'frank@lambsflorist.com',   '(256) 555-0102', 'manager',  'active', '2010-03-01'),
  ('Jane Holloway', 'jane@lambsflorist.com',     '(256) 555-0103', 'employee', 'active', '2022-06-15')
ON CONFLICT (email) DO NOTHING;