ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS processing_fee NUMERIC(10,2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN orders.processing_fee IS
  'Fee passed to customer: 5.9% gross-up + $0.30 (covers 2.9% Stripe + 3% platform)';

SELECT 'Migration 005 complete — processing_fee column added' AS result;