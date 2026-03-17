-- sql/migrations/006_featured_inventory.sql
--
-- Adds featured flag and accent color to the inventory table.
-- Featured items appear on the homepage FeaturedArrangements section.
-- Up to 3 items should be featured at once (enforced in the dashboard UI,
-- not at the DB level — lets admins easily rotate without constraint errors).
--
-- Run once:
--   docker exec -i lambs_postgres psql -U lambs -d lambsflorist \
--     < sql/migrations/006_featured_inventory.sql

-- Boolean flag — controls whether item appears in featured section
ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

-- Hex color used as the card background on the homepage feature cards
-- e.g. '#D4511A' (brand orange), '#3D2B1A' (bark), '#C9A84C' (gold)
-- Defaults to brand orange if not set
ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS featured_accent VARCHAR(7) NOT NULL DEFAULT '#D4511A';

CREATE INDEX IF NOT EXISTS idx_inventory_featured ON inventory(is_featured)
  WHERE is_featured = TRUE;

SELECT 'Migration 006 complete — is_featured and featured_accent columns added' AS result;