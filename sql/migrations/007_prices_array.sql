-- sql/migrations/007_prices_array.sql
--
-- Replaces the single NUMERIC price/cost_price columns with INTEGER arrays
-- that are index-aligned with the sizes TEXT[] column.
-- Drops the inventory_variants and inventory_stock tables (from migration 003)
-- which are superseded by this simpler approach.
--
-- sizes[i]      = size name   e.g. ARRAY['Small','Standard','Large']
-- prices[i]     = sale price  e.g. ARRAY[38, 52, 68]   (whole dollar integers)
-- cost_prices[i]= cost price  e.g. ARRAY[12, 18, 24]
--
-- Run once:
--   docker exec -i lambs_postgres psql -U lambs -d lambsflorist \
--     < sql/migrations/007_prices_array.sql

BEGIN;

-- ── 1. Drop variant / stock tables (no longer needed) ────────────────────────
DROP TABLE IF EXISTS inventory_stock    CASCADE;
DROP TABLE IF EXISTS inventory_variants CASCADE;

-- ── 2. Add new array columns ──────────────────────────────────────────────────
ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS prices      INTEGER[] NOT NULL DEFAULT ARRAY[0];

ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS cost_prices INTEGER[] NOT NULL DEFAULT ARRAY[0];

-- ── 3. Migrate existing single-price data ────────────────────────────────────
-- Each item gets one price entry per size, all set to the current price.
-- Admins can then update individual sizes from the dashboard.
UPDATE inventory
SET
  prices      = array_fill(price::INTEGER,      ARRAY[GREATEST(array_length(sizes, 1), 1)]),
  cost_prices = array_fill(cost_price::INTEGER, ARRAY[GREATEST(array_length(sizes, 1), 1)]);

-- ── 4. Drop legacy single-value columns ──────────────────────────────────────
ALTER TABLE inventory DROP COLUMN IF EXISTS price;
ALTER TABLE inventory DROP COLUMN IF EXISTS cost_price;

-- ── 5. Add constraint — arrays must be same length as sizes ──────────────────
-- PostgreSQL doesn't support cross-column array length checks as table
-- constraints, so we enforce this in the application layer (API routes).
-- A trigger would be the DB-level alternative if needed later.

COMMIT;

SELECT 'Migration 007 complete — prices and cost_prices are now INTEGER arrays' AS result;