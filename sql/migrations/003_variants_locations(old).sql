-- ─────────────────────────────────────────────────────────────────────────────
--  MIGRATION 003 — Inventory Variants, Locations, Image Path, Stock Trigger
--
--  Run with:
--    docker exec -i lambs_postgres psql -U lambs -d lambsflorist \
--      < sql/migrations/003_variants_locations.sql
--
--  What this migration does:
--   1. Adds image_path column to inventory (replaces emoji long-term)
--   2. Creates inventory_variants table — per-variant name + absolute pricing
--   3. Creates inventory_stock table — per-variant per-location stock counts
--   4. Migrates existing inventory rows + sizes[] array → variant rows
--   5. Seeds stock at Piedmont (existing stock_count) and Anniston (0)
--   6. Adds DB trigger: stock_count = 0 → in_stock = false automatically
--      (works on both main inventory table and inventory_stock table)
--
--  Backward compatibility:
--   The original columns (sizes, price, stock_count, in_stock) are kept
--   on the inventory table. They act as the product-level default until
--   all UI is migrated to read from inventory_variants + inventory_stock.
--   A future migration (004) will drop these legacy columns.
-- ─────────────────────────────────────────────────────────────────────────────

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

-- ─────────────────────────────────────────────────────────────────────────────
--  Verification queries (run manually to confirm):
--
--  SELECT i.name, v.name AS variant, v.price, v.is_default
--  FROM inventory_variants v JOIN inventory i ON i.id = v.inventory_id
--  ORDER BY i.name, v.display_order;
--
--  SELECT i.name, v.name AS variant, s.location, s.stock_count, s.in_stock
--  FROM inventory_stock s
--  JOIN inventory_variants v ON v.id = s.variant_id
--  JOIN inventory i ON i.id = v.inventory_id
--  ORDER BY i.name, v.display_order, s.location;
-- ─────────────────────────────────────────────────────────────────────────────