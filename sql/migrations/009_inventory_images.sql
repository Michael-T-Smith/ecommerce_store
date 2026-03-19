-- sql/migrations/009_inventory_images.sql
--
-- Creates the inventory_images table for multi-photo product listings.
-- Removes the legacy image_path and emoji columns from inventory.
--
-- Run once:
--   docker exec -i lambs_postgres psql -U lambs -d lambsflorist \
--     < sql/migrations/009_inventory_images.sql

-- ── 1. Create inventory_images ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_images (
  id            SERIAL        PRIMARY KEY,
  inventory_id  INTEGER       NOT NULL
                  REFERENCES inventory(id) ON DELETE CASCADE,
  path          TEXT          NOT NULL,   -- '/inventory/classic-red-roses-1.png'
  display_order INTEGER       NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_images_inventory_id
  ON inventory_images(inventory_id);

CREATE INDEX IF NOT EXISTS idx_inv_images_order
  ON inventory_images(inventory_id, display_order);

-- ── 2. Migrate any existing image_path values ─────────────────────────────────
-- If an item already had an image_path, carry it forward as display_order = 0.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory' AND column_name = 'image_path'
  ) THEN
    INSERT INTO inventory_images (inventory_id, path, display_order)
    SELECT id, image_path, 0
    FROM inventory
    WHERE image_path IS NOT NULL
    ON CONFLICT DO NOTHING;

    ALTER TABLE inventory DROP COLUMN image_path;
    RAISE NOTICE 'image_path migrated and column dropped';
  ELSE
    RAISE NOTICE 'image_path column not found — skipped';
  END IF;
END $$;

-- ── 3. Drop the emoji column ──────────────────────────────────────────────────
-- Replaced by real photos. Emoji was always a placeholder.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory' AND column_name = 'emoji'
  ) THEN
    ALTER TABLE inventory DROP COLUMN emoji;
    RAISE NOTICE 'emoji column dropped';
  ELSE
    RAISE NOTICE 'emoji column not found — skipped';
  END IF;
END $$;

SELECT 'Migration 009 complete — inventory_images table ready' AS result;