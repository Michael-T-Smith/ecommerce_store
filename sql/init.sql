-- ================================================================
--  BityBird Co — PostgreSQL Schema  (canonical — all migrations baked in)
--  File: sql/init.sql
--
--  Runs automatically on fresh container via docker-entrypoint-initdb.d.
--  Safe to run manually against an existing DB (all statements idempotent).
--
--    docker exec -i bitybird_postgres psql -U bity -d bitybird < sql/init.sql
--
--  Schema reflects all migrations 001-012:
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

ALTER TABLE inventory ADD COLUMN IF NOT EXISTS collection_ids    text[]      DEFAULT '{}';
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS is_customizable   BOOLEAN     NOT NULL DEFAULT FALSE;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS customization_type VARCHAR(40) NOT NULL DEFAULT 'engraved';

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

CREATE TABLE IF NOT EXISTS collections (
  id           serial PRIMARY KEY,
  slug         text NOT NULL UNIQUE,
  label        text NOT NULL,
  emoji        text NOT NULL DEFAULT '✨',
  accent_color text NOT NULL DEFAULT '#C08FA3',
  light_text   boolean NOT NULL DEFAULT false,
  headline     text NOT NULL DEFAULT '',
  subheadline  text NOT NULL DEFAULT '',
  body_copy    text NOT NULL DEFAULT '',
  tags         text[] NOT NULL DEFAULT '{}',
  active       boolean NOT NULL DEFAULT true,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

INSERT INTO collections (slug,label,emoji,accent_color,light_text,headline,subheadline,body_copy,tags,sort_order) VALUES
  ('just-because','Found & Given','🔍','#C08FA3',false,'Because You Thought of Them','Some gifts don''t need a reason — just the right find','The best surprises are the ones nobody saw coming. A revived piece with a story behind it hits different than anything off a shelf.',ARRAY['No Occasion Needed','Surprise Worthy','Any Budget'],1),
  ('birthday','Aged to Celebrate','🕯️','#D4511A',false,'Better With Time','For the person who appreciates what actually lasts','Years look good on some things. Celebrate with something that proves it — reclaimed, restored, and ready for another chapter.',ARRAY['Same-Day Available','Handwritten Note','All Ages'],2),
  ('anniversary','Worth Keeping','🔧','#BFA05C',false,'Still Going Strong','For the milestones that prove some things only get better','The best relationships — like the best objects — improve with care over time. Mark yours with something built to outlast the moment.',ARRAY['Romantic','Premium Options','Same-Day Available'],3),
  ('sympathy','Quiet Comfort','🕊️','#3D2B1A',true,'Something Solid','Pieces that don''t pretend — they just show up','When words fall short, a carefully chosen object speaks quietly. These pieces have survived their own wear — they know how to endure.',ARRAY['Delivered with Care','Handwritten Note','Tasteful Options'],4),
  ('wedding','For the Long Haul','💍','#1D1B1C',true,'Built to Last','Gifts as enduring as the commitment','We work directly with couples on event pieces — restored centrepieces, reclaimed display finds, and gifts made to survive decades, not seasons.',ARRAY['Custom Orders','Consultation Available','Full Event Décor'],5),
  ('accessories','Wearable History','📿','#c5b9a9',false,'Carry Something Real','Pieces with provenance — not just a price tag','Every clasp, cord, and setting has earned its wear. These aren''t accessories you replace — they''re ones you keep.',ARRAY['One of a Kind','Handcrafted','Limited Stock'],6)
ON CONFLICT (slug) DO NOTHING;

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
-- Admin-managed delivery zones. Candice adds/edits from /dashboard/zones.
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


-- ── TABLE: notes ─────────────────────────────────────────────────────────────
-- Candice writes posts from /dashboard/notes.
-- status='published' makes a post visible on /notes. status='draft' is private.
-- published_at is set when status transitions to 'published' and kept thereafter.
CREATE TABLE IF NOT EXISTS notes (
  id           SERIAL        PRIMARY KEY,
  title        VARCHAR(255)  NOT NULL,
  slug         VARCHAR(255)  NOT NULL UNIQUE,
  body         TEXT          NOT NULL,
  excerpt      VARCHAR(400),
  status       VARCHAR(20)   NOT NULL DEFAULT 'draft'
                             CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  author_id    INTEGER       REFERENCES employees(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
DROP TRIGGER IF EXISTS notes_updated_at ON notes;
CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX IF NOT EXISTS idx_notes_status       ON notes(status);
CREATE INDEX IF NOT EXISTS idx_notes_published_at ON notes(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_slug         ON notes(slug);


-- ── TABLE: giving_back ────────────────────────────────────────────────────────
-- Community initiatives managed from /dashboard/givingback.
-- active=true items appear on /givingback in sort_order sequence.
CREATE TABLE IF NOT EXISTS giving_back (
  id               SERIAL        PRIMARY KEY,
  title            VARCHAR(255)  NOT NULL,
  description      TEXT          NOT NULL,
  impact_statement VARCHAR(255),
  emoji            VARCHAR(10)   NOT NULL DEFAULT '🌱',
  active           BOOLEAN       NOT NULL DEFAULT TRUE,
  sort_order       INTEGER       NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
DROP TRIGGER IF EXISTS giving_back_updated_at ON giving_back;
CREATE TRIGGER giving_back_updated_at
  BEFORE UPDATE ON giving_back FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX IF NOT EXISTS idx_giving_back_active ON giving_back(active);
CREATE INDEX IF NOT EXISTS idx_giving_back_order  ON giving_back(sort_order);

-- ── SEED: giving_back ─────────────────────────────────────────────────────────
INSERT INTO giving_back (title, description, impact_statement, emoji, sort_order) VALUES
  ('Anniston Community Food Bank',
   'A portion of every sale goes toward stocking shelves at the Anniston Community Food Bank.',
   'Supporting families in need across Calhoun County.',
   '🥫', 0),
  ('Free Crafting Workshops',
   'We host free monthly crafting and upcycling workshops at the Piedmont Community Center.',
   'Teaching sustainable making skills to anyone who wants to learn.',
   '🔨', 1),
  ('Calhoun County School Supply Drive',
   'Each back-to-school season BityBird Co collects and donates supplies to local Calhoun County schools.',
   'Equipping students who need it most.',
   '📚', 2)
ON CONFLICT DO NOTHING;


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
   ARRAY['Small','Standard','Large'], 'Piedmont Valley Growers', 12, 3, true)

ON CONFLICT (sku) DO NOTHING;