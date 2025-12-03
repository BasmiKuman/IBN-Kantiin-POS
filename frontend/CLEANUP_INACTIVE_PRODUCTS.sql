-- ============================================================
-- CLEANUP INACTIVE PRODUCTS - Free Up SKU
-- ============================================================
-- Script ini akan HARD DELETE produk yang sudah soft-deleted
-- sehingga SKU-nya bisa digunakan lagi
-- ============================================================

-- STEP 1: Lihat produk yang akan dihapus
SELECT 
    id, 
    name, 
    sku, 
    is_active,
    created_at
FROM products 
WHERE is_active = false
ORDER BY created_at DESC;

-- STEP 2: (Optional) Backup data sebelum delete
-- Uncomment jika ingin backup
/*
CREATE TABLE IF NOT EXISTS products_deleted_backup AS 
SELECT * FROM products WHERE is_active = false;
*/

-- STEP 3: HARD DELETE produk yang inactive
-- ⚠️ WARNING: Ini akan PERMANENT delete data!
-- Pastikan Anda sudah backup jika perlu
DELETE FROM products 
WHERE is_active = false;

-- STEP 4: Verify - Cek apakah masih ada produk inactive
SELECT COUNT(*) as inactive_products_count 
FROM products 
WHERE is_active = false;
-- Expected: 0

-- STEP 5: Verify - Cek produk yang masih aktif
SELECT 
    id, 
    name, 
    sku, 
    is_active
FROM products 
WHERE is_active = true
ORDER BY name;

-- ============================================================
-- ALTERNATIF: Update SKU produk yang inactive agar tidak conflict
-- ============================================================
-- Jika tidak ingin hard delete, bisa append "_DELETED" ke SKU
-- sehingga tidak conflict dengan produk baru

/*
UPDATE products 
SET sku = sku || '_DELETED_' || id::text
WHERE is_active = false 
  AND sku NOT LIKE '%_DELETED_%';
*/

-- Verify setelah update
/*
SELECT id, name, sku, is_active 
FROM products 
WHERE is_active = false
ORDER BY name;
*/

-- ============================================================
-- REKOMENDASI UNTUK PRODUCTION
-- ============================================================
-- Opsi 1: HARD DELETE (script ini)
--   + SKU langsung bisa digunakan lagi
--   - Data hilang permanent
--   - Tidak bisa restore

-- Opsi 2: UPDATE SKU dengan suffix (uncomment bagian ALTERNATIF)
--   + Data masih ada untuk audit
--   + SKU bisa digunakan lagi
--   - SKU jadi panjang dan aneh

-- Opsi 3: Ubah UNIQUE constraint jadi PARTIAL (advanced)
/*
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_key;
CREATE UNIQUE INDEX products_sku_active_unique 
ON products (sku) 
WHERE is_active = true;
*/
--   + Paling elegan, SKU unique hanya untuk yang aktif
--   + Produk inactive bisa punya SKU yang sama
--   - Butuh migration
