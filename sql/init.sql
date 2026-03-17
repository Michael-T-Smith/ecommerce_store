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
  sizes_multipler      INTEGER[]     NOT NULL DEFAULT ARRAY[1],
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


-- ── customers ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS customers (
  id             SERIAL        PRIMARY KEY,
  name           VARCHAR(120)  NOT NULL,
  email          VARCHAR(200)  NOT NULL UNIQUE,
  phone          VARCHAR(20),
  password_hash  TEXT          NOT NULL,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS customers_updated_at ON customers;
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);


-- ── customer_addresses ───────────────────────────────────────────
-- zone is nullable — auto-detected during checkout but can be
-- stored here once confirmed so repeat orders skip the lookup.

CREATE TABLE IF NOT EXISTS customer_addresses (
  id            SERIAL        PRIMARY KEY,
  customer_id   INTEGER       NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label         VARCHAR(60)   NOT NULL DEFAULT 'Home',
  address_line  TEXT          NOT NULL,
  city          VARCHAR(100)  NOT NULL,
  state         VARCHAR(50)   NOT NULL DEFAULT 'AL',
  zip           VARCHAR(20)   NOT NULL,
  zone          delivery_zone,
  is_default    BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS customer_addresses_updated_at ON customer_addresses;
CREATE TRIGGER customer_addresses_updated_at
  BEFORE UPDATE ON customer_addresses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_addresses_customer ON customer_addresses(customer_id);


-- ── orders: add customer_id FK ───────────────────────────────────
-- Nullable — guest orders have no customer_id.
-- ON DELETE SET NULL — if a customer deletes their account,
-- their order history is preserved anonymously.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);



BEGIN;

-- ── 1. Add image_path to inventory ──────────────────────────────────────────
ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS image_path VARCHAR(255);

-- ── 2. inventory_variants ────────────────────────────────────────────────────
--  Each variant is one purchasable SKU of a product (e.g. "Small", "Large",
--  or any custom name the owner creates like "With Ceramic Vase").
--  Price is the absolute sale price for that variant, not an adjustment.

CREATE TABLE IF NOT EXISTS inventory_variants (
  id            SERIAL        PRIMARY KEY,
  inventory_id  INTEGER       NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  name          VARCHAR(100)  NOT NULL,                    -- "Standard", "Large", custom
  price         NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  cost_price    NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
  display_order INTEGER       NOT NULL DEFAULT 0,          -- controls UI sort order
  is_default    BOOLEAN       NOT NULL DEFAULT FALSE,      -- pre-selected in UI
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (inventory_id, name)
);

DROP TRIGGER IF EXISTS inventory_variants_updated_at ON inventory_variants;
CREATE TRIGGER inventory_variants_updated_at
  BEFORE UPDATE ON inventory_variants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_variants_inventory_id ON inventory_variants(inventory_id);

-- ── 3. inventory_stock ───────────────────────────────────────────────────────
--  Stock is tracked per variant per location.
--  Locations: 'piedmont' | 'anniston'

CREATE TABLE IF NOT EXISTS inventory_stock (
  id                  SERIAL  PRIMARY KEY,
  variant_id          INTEGER NOT NULL REFERENCES inventory_variants(id) ON DELETE CASCADE,
  location            VARCHAR(50) NOT NULL
                        CHECK (location IN ('piedmont', 'anniston')),
  stock_count         INTEGER NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 2,
  in_stock            BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (variant_id, location)
);

CREATE INDEX IF NOT EXISTS idx_stock_variant_id ON inventory_stock(variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_location   ON inventory_stock(location);

DROP TRIGGER IF EXISTS inventory_stock_updated_at ON inventory_stock;
CREATE TRIGGER inventory_stock_updated_at
  BEFORE UPDATE ON inventory_stock
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 4. Migrate existing inventory → variants ─────────────────────────────────
--  For each product, expand sizes[] into one row per variant.
--  Pricing formula:
--    Small    = base × 0.80
--    Standard = base × 1.00
--    Large    = base × 1.25
--    XL       = base × 1.60
--  is_default = true for 'Standard', or the first size if Standard absent.

INSERT INTO inventory_variants
  (inventory_id, name, price, cost_price, display_order, is_default)
SELECT
  i.id,
  sv.size_name,
  ROUND(
    i.price * CASE sv.size_name
      WHEN 'Small'    THEN 0.80
      WHEN 'Standard' THEN 1.00
      WHEN 'Large'    THEN 1.25
      WHEN 'XL'       THEN 1.60
      ELSE                 1.00
    END,
    2
  ),
  ROUND(
    i.cost_price * CASE sv.size_name
      WHEN 'Small'    THEN 0.80
      WHEN 'Standard' THEN 1.00
      WHEN 'Large'    THEN 1.25
      WHEN 'XL'       THEN 1.60
      ELSE                 1.00
    END,
    2
  ),
  sv.ord,
  -- is_default: Standard if present, otherwise first variant
  (sv.size_name = 'Standard') OR
  (NOT 'Standard' = ANY(i.sizes) AND sv.ord = 1)
FROM inventory i
CROSS JOIN LATERAL (
  SELECT
    unnest(i.sizes)                AS size_name,
    generate_subscripts(i.sizes, 1) AS ord
) sv
ON CONFLICT (inventory_id, name) DO NOTHING;

-- ── 5. Seed stock per variant per location ───────────────────────────────────
--  Piedmont gets the existing stock_count from the main inventory row.
--  Anniston starts at 0 — owner fills in actual counts via dashboard.

INSERT INTO inventory_stock
  (variant_id, location, stock_count, low_stock_threshold, in_stock)
SELECT
  v.id,
  loc.location,
  -- Distribute existing stock_count to piedmont; anniston starts at 0
  CASE WHEN loc.location = 'piedmont' THEN
    CASE
      -- For single-size products give the full stock to that variant
      WHEN array_length(i.sizes, 1) = 1 THEN i.stock_count
      -- For multi-size split evenly, floor — owner adjusts from dashboard
      ELSE i.stock_count / array_length(i.sizes, 1)
    END
  ELSE 0 END,
  i.low_stock_threshold,
  CASE
    WHEN loc.location = 'piedmont' THEN i.in_stock
    ELSE FALSE
  END
FROM inventory_variants v
JOIN inventory i ON i.id = v.inventory_id
CROSS JOIN (VALUES ('piedmont'), ('anniston')) AS loc(location)
ON CONFLICT (variant_id, location) DO NOTHING;

-- ── 6. Trigger: stock_count = 0 → in_stock flips false (main inventory) ─────

CREATE OR REPLACE FUNCTION fn_sync_in_stock_from_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.stock_count = 0 THEN
    NEW.in_stock := FALSE;
  ELSIF NEW.stock_count > 0 AND (OLD.stock_count = 0 OR OLD.in_stock = FALSE) THEN
    -- Auto-restore in_stock when stock is added back
    NEW.in_stock := TRUE;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_in_stock ON inventory;
CREATE TRIGGER trg_sync_in_stock
  BEFORE UPDATE OF stock_count ON inventory
  FOR EACH ROW EXECUTE FUNCTION fn_sync_in_stock_from_count();

-- ── 7. Same trigger for inventory_stock (variant-level) ──────────────────────

CREATE OR REPLACE FUNCTION fn_sync_variant_in_stock()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.stock_count = 0 THEN
    NEW.in_stock := FALSE;
  ELSIF NEW.stock_count > 0 AND (OLD.stock_count = 0 OR OLD.in_stock = FALSE) THEN
    NEW.in_stock := TRUE;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_variant_in_stock ON inventory_stock;
CREATE TRIGGER trg_sync_variant_in_stock
  BEFORE UPDATE OF stock_count ON inventory_stock
  FOR EACH ROW EXECUTE FUNCTION fn_sync_variant_in_stock();

COMMIT;