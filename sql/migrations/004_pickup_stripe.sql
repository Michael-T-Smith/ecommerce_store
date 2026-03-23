-- sql/migrations/004_pickup_stripe.sql
--
-- Adds in-store pickup support and fixes the delivery_window column type
-- so it accepts the time-string format ("09:00-11:00") the checkout page
-- already sends — the old ENUM only had 'morning' | 'afternoon'.
--
-- Run once:
--   docker exec -i lambs_postgres psql -U lambs -d lambsflorist \
--     < sql/migrations/004_pickup_stripe.sql
--
-- Safe to re-run — all changes are guarded with IF NOT EXISTS / DO blocks.

-- ─── 1. New ENUM: fulfillment_type ───────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE fulfillment_type AS ENUM ('delivery', 'pickup');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 2. orders table ─────────────────────────────────────────────────────────

-- 2a. Add fulfillment_type column (default 'delivery' keeps existing rows valid)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS fulfillment_type fulfillment_type NOT NULL DEFAULT 'delivery';

-- 2b. Make delivery_zone nullable — pickup orders have no zone
ALTER TABLE orders
  ALTER COLUMN delivery_zone DROP NOT NULL;

-- 2c. Change delivery_window from ENUM to TEXT so time strings like
--     "09:00-11:00" are accepted. Steps: drop default, alter type, restore default.
ALTER TABLE orders ALTER COLUMN delivery_window DROP DEFAULT;
ALTER TABLE orders ALTER COLUMN delivery_window TYPE TEXT
  USING delivery_window::TEXT;
ALTER TABLE orders ALTER COLUMN delivery_window SET DEFAULT 'afternoon';

-- ─── 3. deliveries table ─────────────────────────────────────────────────────

-- 3a. Make zone nullable — pickup orders have no delivery row
ALTER TABLE deliveries
  ALTER COLUMN zone DROP NOT NULL;

-- 3b. Same delivery_window fix
ALTER TABLE deliveries ALTER COLUMN scheduled_window DROP DEFAULT;
ALTER TABLE deliveries ALTER COLUMN scheduled_window TYPE TEXT
  USING scheduled_window::TEXT;
ALTER TABLE deliveries ALTER COLUMN scheduled_window SET DEFAULT 'afternoon';

-- ─── 4. Add 'pending_payment' to order_status enum ───────────────────────────
-- Represents an order where the customer has submitted the form but payment
-- has not yet been confirmed by Stripe. These are cleaned up if abandoned.
DO $$ BEGIN
  ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'pending_payment' BEFORE 'pending';
EXCEPTION WHEN others THEN NULL; END $$;

-- ─── 5. Add pickup_time column to orders ─────────────────────────────────────
-- Stores the requested pickup time for in-store orders (e.g. "10:00-11:00").
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS pickup_time TEXT;

SELECT 'Migration 004 complete — pickup + stripe schema ready' AS result;