-- sql/migrations/008_delivery_zones_table.sql
--
-- Replaces the hardcoded delivery_zone ENUM with a managed delivery_zones
-- table. Safe to re-run — every step checks current state before acting.
--
-- Run:
--   docker exec -i lambs_postgres psql -U lambs -d lambsflorist \
--     < sql/migrations/008_delivery_zones_table.sql

-- ── 1. Create the delivery_zones table ───────────────────────────────────────
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
  BEFORE UPDATE ON delivery_zones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 2. Seed the three existing zones ─────────────────────────────────────────
INSERT INTO delivery_zones (value, label, fee, sort_order) VALUES
  ('piedmont', 'Piedmont',          8,  0),
  ('anniston', 'Anniston / Oxford', 12, 1),
  ('centre',   'Centre',            15, 2)
ON CONFLICT (value) DO NOTHING;

-- ── 3. Convert ENUM columns to TEXT ──────────────────────────────────────────
-- Each ALTER is wrapped in a DO block so it skips gracefully if the column
-- is already TEXT (re-run safe) or doesn't exist (missing migration 002).

-- orders.delivery_zone
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders'
      AND column_name = 'delivery_zone'
      AND data_type = 'USER-DEFINED'
  ) THEN
    ALTER TABLE orders ALTER COLUMN delivery_zone DROP NOT NULL;
    ALTER TABLE orders ALTER COLUMN delivery_zone TYPE TEXT
      USING delivery_zone::TEXT;
    RAISE NOTICE 'orders.delivery_zone converted to TEXT';
  ELSE
    RAISE NOTICE 'orders.delivery_zone already TEXT or does not exist — skipped';
  END IF;
END $$;

-- deliveries.zone
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deliveries'
      AND column_name = 'zone'
      AND data_type = 'USER-DEFINED'
  ) THEN
    ALTER TABLE deliveries ALTER COLUMN zone DROP NOT NULL;
    ALTER TABLE deliveries ALTER COLUMN zone TYPE TEXT
      USING zone::TEXT;
    RAISE NOTICE 'deliveries.zone converted to TEXT';
  ELSE
    RAISE NOTICE 'deliveries.zone already TEXT or does not exist — skipped';
  END IF;
END $$;

-- customer_addresses.zone
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customer_addresses'
      AND column_name = 'zone'
      AND data_type = 'USER-DEFINED'
  ) THEN
    ALTER TABLE customer_addresses ALTER COLUMN zone TYPE TEXT
      USING zone::TEXT;
    RAISE NOTICE 'customer_addresses.zone converted to TEXT';
  ELSE
    RAISE NOTICE 'customer_addresses.zone already TEXT or does not exist — skipped';
  END IF;
END $$;

-- ── 4. Drop the ENUM type ─────────────────────────────────────────────────────
-- IF EXISTS means this is safe whether or not the type still exists.
-- No CASCADE needed — all dependent columns were converted above.
DROP TYPE IF EXISTS delivery_zone;

SELECT 'Migration 008 complete — delivery_zones table ready, ENUM dropped' AS result;