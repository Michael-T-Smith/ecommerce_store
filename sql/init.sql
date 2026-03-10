-- ================================================================
--  Lamb's Florist — PostgreSQL Schema
--  File: sql/init.sql
--
--  This file runs ONCE automatically when the container is first
--  created via docker-entrypoint-initdb.d.
--
--  It will NOT re-run on container restart — only on a fresh volume.
--  All statements are idempotent (IF NOT EXISTS / DO NOTHING)
--  so it is safe to run manually against an existing DB as well:
--
--    docker exec -i lambs_postgres psql -U lambs -d lambsflorist < sql/init.sql
--
--  For schema changes after go-live, add files to sql/migrations/
--  and run them manually — never drop/recreate the volume in production.
-- ================================================================


-- ── Extensions ───────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ── Enums ─────────────────────────────────────────────────────────────────────
-- Wrapped in DO blocks so re-runs don't fail if the type already exists.

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE employee_status AS ENUM ('active', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed',
    'preparing',
    'out_for_delivery',
    'delivered',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE delivery_status AS ENUM (
    'scheduled',
    'dispatched',
    'delivered',
    'failed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE delivery_zone AS ENUM ('piedmont', 'anniston', 'centre');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE delivery_window AS ENUM ('morning', 'afternoon');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── updated_at trigger ────────────────────────────────────────────────────────
-- Attach to any table to keep updated_at accurate automatically.
-- One function, reused across all tables.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ─────────────────────────────────────────────────────────────────────────────
--  TABLE: employees
--  Created first — orders and deliveries both FK to this table.
--  password_hash is NULL until scripts/seed-dev.js or seed-admin.js runs.
--  Soft-delete pattern: status = 'inactive' instead of hard DELETE.
--  This preserves all order and delivery history when staff leave.
-- ─────────────────────────────────────────────────────────────────────────────

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
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_employees_email  ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_role   ON employees(role);


-- ─────────────────────────────────────────────────────────────────────────────
--  TABLE: inventory
--  stock_count and in_stock are kept as separate fields intentionally.
--  in_stock can be manually toggled to false even if stock_count > 0
--  (e.g. seasonal item taken off menu but not disposed of).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inventory (
  id                   SERIAL        PRIMARY KEY,
  sku                  VARCHAR(20)   NOT NULL UNIQUE,
  name                 VARCHAR(200)  NOT NULL,
  description          TEXT,
  price                NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  cost_price           NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
  category             VARCHAR(60)   NOT NULL,
  tag                  VARCHAR(40),
  emoji                VARCHAR(8),
  sizes                TEXT[]        NOT NULL DEFAULT ARRAY['Standard'],
  supplier             VARCHAR(120),
  stock_count          INTEGER       NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
  low_stock_threshold  INTEGER       NOT NULL DEFAULT 2 CHECK (low_stock_threshold >= 0),
  in_stock             BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS inventory_updated_at ON inventory;
CREATE TRIGGER inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_in_stock  ON inventory(in_stock);
CREATE INDEX IF NOT EXISTS idx_inventory_sku       ON inventory(sku);


-- ─────────────────────────────────────────────────────────────────────────────
--  TABLE: orders
--  items JSONB stores a price + name snapshot at time of order.
--  This means inventory changes (price edits, deletions) never
--  retroactively alter order history — critical for accounting.
--
--  order_number format: LF-YYYY-XXXX (generated in API route)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
  id                SERIAL          PRIMARY KEY,
  order_number      VARCHAR(20)     NOT NULL UNIQUE,
  customer_name     VARCHAR(120)    NOT NULL,
  customer_email    VARCHAR(200),
  customer_phone    VARCHAR(20),
  items             JSONB           NOT NULL,
  subtotal          NUMERIC(10,2)   NOT NULL CHECK (subtotal >= 0),
  delivery_fee      NUMERIC(10,2)   NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total             NUMERIC(10,2)   NOT NULL CHECK (total >= 0),
  status            order_status    NOT NULL DEFAULT 'pending',
  delivery_address  TEXT            NOT NULL,
  delivery_zone     delivery_zone   NOT NULL,
  delivery_date     DATE            NOT NULL,
  delivery_window   delivery_window NOT NULL DEFAULT 'afternoon',
  note_message      TEXT,
  staff_notes       TEXT,
  stripe_payment_id VARCHAR(200),
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_orders_status         ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date  ON orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_zone  ON orders(delivery_zone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at     ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);


-- ─────────────────────────────────────────────────────────────────────────────
--  TABLE: deliveries
--  One delivery row per order. Created atomically with the order
--  in the POST /api/orders route (same transaction).
--
--  ON DELETE CASCADE: if an order is hard-deleted, its delivery
--  row is removed automatically. In practice orders are cancelled
--  (status change) not deleted — this is a safety net.
--
--  driver_id ON DELETE SET NULL: if an employee record is removed,
--  deliveries they drove are preserved but driver_id becomes NULL.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS deliveries (
  id                SERIAL          PRIMARY KEY,
  order_id          INTEGER         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  driver_id         INTEGER         REFERENCES employees(id) ON DELETE SET NULL,
  zone              delivery_zone   NOT NULL,
  address           TEXT            NOT NULL,
  scheduled_date    DATE            NOT NULL,
  scheduled_window  delivery_window NOT NULL DEFAULT 'afternoon',
  status            delivery_status NOT NULL DEFAULT 'scheduled',
  delivery_notes    TEXT,
  delivered_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS deliveries_updated_at ON deliveries;
CREATE TRIGGER deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_deliveries_status  ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_date    ON deliveries(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver  ON deliveries(driver_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order   ON deliveries(order_id);






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
  ('Cecelia Bates', 'cecelia@lambsflorist.com', '(256) 555-0101', 'admin',    'active', '2010-03-01'),
  ('Frank Bates',   'frank@lambsflorist.com',   '(256) 555-0102', 'manager',  'active', '2010-03-01'),
  ('Jane Holloway', 'jane@lambsflorist.com',     '(256) 555-0103', 'employee', 'active', '2022-06-15')
ON CONFLICT (email) DO NOTHING;