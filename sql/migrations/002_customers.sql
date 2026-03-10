-- ================================================================
--  Migration: 002_customers.sql
--  Run after init.sql is already applied to the database.
--
--  Apply with:
--    docker exec -i lambs_postgres psql -U lambs -d lambsflorist \
--      < sql/migrations/002_customers.sql
--
--  All statements are idempotent — safe to run more than once.
-- ================================================================


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