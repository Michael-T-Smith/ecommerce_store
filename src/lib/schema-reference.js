
// ================================================================
//  FILE: src/lib/schema-reference.js
//
//  PostgreSQL schema reference for BityBird Co.
//  This file is DOCUMENTATION ONLY — not imported anywhere.
//  Use this as the source of truth when writing Prisma schema or
//  raw SQL migrations when the Docker DB is ready.
//
//  DOCKER SETUP (run on the host machine):
//  ─────────────────────────────────────
//  docker-compose.yml lives at project root.
//  Volume: lambs_pgdata persists across container restarts.
//  To migrate to a new machine:
//    1. docker compose down
//    2. tar -czf lambs_backup.tar.gz /var/lib/docker/volumes/lambs_pgdata
//    3. Move tar to new machine
//    4. Extract to same path (or update compose volume path)
//    5. docker compose up -d
//  ─────────────────────────────────────
//
//  MOCK DATA → DB MAPPING:
//  Every mock data file (inventoryData, ordersData, etc.) has a
//  "DB FIELD MAP" comment above each object shape showing which
//  mock field maps to which DB column. When wiring the API routes,
//  the component prop shapes do not change — only the data source.
// ================================================================

/*

-- ── ENUMS ──────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee');

CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'preparing',
  'out_for_delivery', 'delivered', 'cancelled'
);

CREATE TYPE delivery_status AS ENUM (
  'scheduled', 'dispatched', 'delivered', 'failed'
);

CREATE TYPE delivery_zone AS ENUM ('piedmont', 'anniston', 'centre');

CREATE TYPE delivery_window AS ENUM ('morning', 'afternoon');

CREATE TYPE employee_status AS ENUM ('active', 'inactive');


-- ── EMPLOYEES ────────────────────────────────────────────────────
-- Must exist before orders (driver FK) and users (role assignment)

CREATE TABLE employees (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(200) UNIQUE NOT NULL,
  phone       VARCHAR(20),
  role        user_role NOT NULL DEFAULT 'employee',
  status      employee_status NOT NULL DEFAULT 'active',
  hire_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── INVENTORY ────────────────────────────────────────────────────

CREATE TABLE inventory (
  id                   SERIAL PRIMARY KEY,
  sku                  VARCHAR(20) UNIQUE NOT NULL,
  name                 VARCHAR(200) NOT NULL,
  description          TEXT,
  price                INTEGER[] NOT NULL,
  cost_price           INTEGER[] NOT NULL,
  category             VARCHAR(60) NOT NULL,
  tag                  VARCHAR(40),
  sizes                TEXT[] NOT NULL DEFAULT '{"Standard"}',
  supplier             VARCHAR(120),
  stock_count          INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold  INTEGER NOT NULL DEFAULT 2,
  in_stock             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── ORDERS ───────────────────────────────────────────────────────

CREATE TABLE orders (
  id               SERIAL PRIMARY KEY,
  order_number     VARCHAR(20) UNIQUE NOT NULL,   -- e.g. LF-2024-0042
  customer_name    VARCHAR(120) NOT NULL,
  customer_email   VARCHAR(200),
  customer_phone   VARCHAR(20),
  items            JSONB NOT NULL,                -- snapshot of items at time of order
  subtotal         NUMERIC(10,2) NOT NULL,
  delivery_fee     NUMERIC(10,2) NOT NULL DEFAULT 0,
  total            NUMERIC(10,2) NOT NULL,
  status           order_status NOT NULL DEFAULT 'pending',
  delivery_address TEXT NOT NULL,
  delivery_zone    delivery_zone NOT NULL,
  delivery_date    DATE NOT NULL,
  delivery_window  delivery_window NOT NULL DEFAULT 'afternoon',
  note_message     TEXT,                          -- handwritten note content
  staff_notes      TEXT,                          -- internal only
  stripe_payment_id VARCHAR(200),                 -- from Stripe Connect
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── DELIVERIES ───────────────────────────────────────────────────
-- One delivery per order. Created when order status → 'preparing'.

CREATE TABLE deliveries (
  id               SERIAL PRIMARY KEY,
  order_id         INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  driver_id        INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  zone             delivery_zone NOT NULL,
  address          TEXT NOT NULL,
  scheduled_date   DATE NOT NULL,
  scheduled_window delivery_window NOT NULL,
  status           delivery_status NOT NULL DEFAULT 'scheduled',
  delivery_notes   TEXT,
  delivered_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── NOTES ────────────────────────────────────────────────────────

CREATE TABLE notes (
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


-- ── GIVING BACK ───────────────────────────────────────────────────

CREATE TABLE giving_back (
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


-- ── INDEXES ──────────────────────────────────────────────────────

CREATE INDEX idx_orders_status       ON orders(status);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX idx_deliveries_status   ON deliveries(status);
CREATE INDEX idx_deliveries_date     ON deliveries(scheduled_date);
CREATE INDEX idx_inventory_category  ON inventory(category);
CREATE INDEX idx_inventory_in_stock  ON inventory(in_stock);

*/
