-- ============================================================
-- CHECK SOFT DELETE - Lihat Produk yang "Terhapus"
-- ============================================================

-- STEP 1: Lihat semua produk (aktif dan non-aktif)
SELECT 
    id,
    name,
    sku,
    is_active,
    created_at,
    updated_at,
    CASE 
        WHEN is_active = true THEN '✅ AKTIF'
        WHEN is_active = false THEN '❌ DIHAPUS (SOFT DELETE)'
    END as status
FROM products
ORDER BY updated_at DESC
LIMIT 20;

-- STEP 2: Hitung berapa produk aktif vs non-aktif
SELECT 
    is_active,
    COUNT(*) as jumlah,
    CASE 
        WHEN is_active = true THEN '✅ Produk Aktif'
        WHEN is_active = false THEN '❌ Produk Terhapus'
    END as keterangan
FROM products
GROUP BY is_active;

-- STEP 3: Lihat produk yang baru saja di-delete (1 jam terakhir)
SELECT 
    id,
    name,
    sku,
    is_active,
    updated_at,
    '❌ BARU DIHAPUS!' as status
FROM products
WHERE is_active = false
  AND updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;

-- STEP 4: Jika mau BENAR-BENAR HAPUS PERMANEN (HATI-HATI!)
-- Uncomment baris di bawah untuk hapus permanen produk non-aktif
-- WARNING: DATA TIDAK BISA DI-RESTORE!

-- DELETE FROM products WHERE is_active = false;

-- STEP 5: Atau restore produk yang "terhapus"
-- UPDATE products SET is_active = true WHERE name = 'NAMA_PRODUK_YANG_MAU_DIRESTORE';
