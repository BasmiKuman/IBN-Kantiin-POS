-- ============================================================
-- FIX SKU UNIQUE CONSTRAINT - BEST SOLUTION
-- ============================================================
-- Ubah UNIQUE constraint SKU jadi PARTIAL
-- SKU hanya unique untuk produk yang is_active = true
-- Produk yang dihapus (is_active = false) boleh punya SKU sama
-- ============================================================

-- STEP 1: Drop existing UNIQUE constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_key;

-- STEP 2: Create PARTIAL UNIQUE INDEX
-- Index ini hanya enforce uniqueness untuk is_active = true
CREATE UNIQUE INDEX products_sku_active_unique 
ON products (sku) 
WHERE is_active = true;

-- STEP 3: Verify - Cek index yang sudah dibuat
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'products'
  AND indexname = 'products_sku_active_unique';

-- Expected output:
-- indexname: products_sku_active_unique
-- indexdef: CREATE UNIQUE INDEX products_sku_active_unique ON public.products USING btree (sku) WHERE (is_active = true)

-- STEP 4: Test - Insert produk dengan SKU yang sudah ada di produk inactive
-- Ini seharusnya BERHASIL sekarang!
/*
INSERT INTO products (name, sku, price, stock, category_id, is_active)
VALUES ('Test Product', 'EXISTING-SKU-FROM-DELETED', 10000, 10, 'some-category-id', true);
*/

-- STEP 5: Cleanup - Hapus test product jika ada
/*
DELETE FROM products WHERE name = 'Test Product';
*/

-- ============================================================
-- KEUNTUNGAN SOLUSI INI:
-- ============================================================
-- ✅ SKU unique hanya untuk produk aktif
-- ✅ Bisa reuse SKU dari produk yang sudah dihapus
-- ✅ Data history tetap ada (soft delete)
-- ✅ Tidak perlu hard delete atau modify SKU
-- ✅ Auto-generate SKU tetap work dengan baik
-- ✅ Tidak perlu ubah kode aplikasi

-- ============================================================
-- SETELAH MENJALANKAN SQL INI:
-- ============================================================
-- 1. Refresh browser (Ctrl + Shift + R)
-- 2. Coba tambah produk dengan SKU yang sama dengan produk yang sudah dihapus
-- 3. Seharusnya BERHASIL sekarang!
-- 4. Error 409 untuk SKU duplikat hanya muncul jika SKU sudah ada di produk AKTIF
