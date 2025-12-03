-- ============================================================
-- ADD VARIANT COLUMNS TO TRANSACTION_ITEMS
-- ============================================================
-- Tambah kolom untuk menyimpan info variant di transaction items
-- ============================================================

-- STEP 1: Add columns
ALTER TABLE transaction_items 
ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(id),
ADD COLUMN IF NOT EXISTS variant_name TEXT;

-- STEP 2: Create index untuk performa
CREATE INDEX IF NOT EXISTS idx_transaction_items_variant 
ON transaction_items(variant_id);

-- STEP 3: Verify columns
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'transaction_items'
  AND column_name IN ('variant_id', 'variant_name')
ORDER BY ordinal_position;

-- ============================================================
-- NOTES:
-- ============================================================
-- - variant_id: Reference ke product_variants table (optional/nullable)
-- - variant_name: Nama variant untuk display (optional/nullable)
-- - Jika product tidak punya variant, kedua kolom ini NULL
-- - Jika product punya variant, kedua kolom ini diisi

-- ============================================================
-- SELESAI! Transaction items siap menyimpan info variant
-- ============================================================
