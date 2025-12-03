-- =====================================================
-- JALANKAN SQL INI DI SUPABASE DASHBOARD
-- =====================================================
-- FIX: SKU conflict dengan produk yang sudah dihapus
-- =====================================================

-- STEP 1: Drop index jika sudah ada (fix error 42P07)
DROP INDEX IF EXISTS products_sku_active_unique;

-- STEP 2: Drop constraint lama
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_key;

-- STEP 3: Create PARTIAL UNIQUE INDEX
-- SKU hanya unique untuk produk aktif (is_active = true)
CREATE UNIQUE INDEX products_sku_active_unique 
ON products (sku) 
WHERE is_active = true;

-- STEP 4: Update SKU produk inactive (fix foreign key issue)
-- Tambah suffix "_DELETED_" + timestamp ke SKU
UPDATE products 
SET sku = sku || '_DELETED_' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT
WHERE is_active = false 
  AND sku NOT LIKE '%_DELETED_%';

-- STEP 5: Verify
SELECT 
    COUNT(*) FILTER (WHERE is_active = true) as active_count,
    COUNT(*) FILTER (WHERE is_active = false AND sku LIKE '%_DELETED_%') as cleaned_count
FROM products;

-- =====================================================
-- SELESAI! Refresh browser dan coba tambah produk lagi
-- =====================================================
