-- ============================================================
-- DIAGNOSE ERROR 409 - PRODUCTS TABLE
-- ============================================================
-- Jalankan SQL ini SATU PER SATU di Supabase SQL Editor
-- untuk mencari tahu penyebab error 409
-- ============================================================

-- STEP 1: Cek apakah tabel products ada
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'products'
) as table_exists;

-- STEP 2: Cek struktur tabel products
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- STEP 3: Cek constraints (unique, primary key, etc)
SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'products'::regclass;

-- STEP 4: Cek RLS status
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'products';

-- STEP 5: Cek semua policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'products';

-- STEP 6: Cek permissions/grants
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'products';

-- STEP 7: Test SELECT query (apakah bisa baca data?)
SELECT COUNT(*) as total_products FROM products;

-- STEP 8: Cek apakah ada trigger yang mungkin conflict
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'products';

-- ============================================================
-- SOLUSI BERDASARKAN ERROR 409
-- ============================================================
-- Error 409 biasanya disebabkan oleh:
-- 1. RLS yang terlalu ketat
-- 2. Constraint/unique key yang conflict
-- 3. Trigger yang memblokir operasi
-- ============================================================

-- SOLUSI 1: RESET TOTAL - Hapus dan Disable Semua
-- ============================================================

-- Drop semua policy
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'products') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON products', r.policyname);
    END LOOP;
END $$;

-- Disable RLS
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Grant full permissions
GRANT ALL ON products TO authenticated;
GRANT ALL ON products TO anon;
GRANT ALL ON products TO postgres;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant sequence permissions (untuk auto-increment ID)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================================
-- SOLUSI 2: Jika masih error, coba lihat Realtime settings
-- ============================================================
-- Buka Supabase Dashboard > Database > Replication
-- Pastikan tabel 'products' tidak ada di Realtime replication
-- yang bisa menyebabkan conflict

-- ============================================================
-- SOLUSI 3: Cek apakah ada duplikat di UNIQUE constraint
-- ============================================================
-- Jika ada constraint UNIQUE pada kolom tertentu (misalnya barcode),
-- dan Anda coba insert data yang sama, akan muncul 409

-- Cek data yang mungkin duplikat
SELECT barcode, COUNT(*) as duplicate_count
FROM products
WHERE barcode IS NOT NULL
GROUP BY barcode
HAVING COUNT(*) > 1;

-- ============================================================
-- TEST SETELAH PERBAIKAN
-- ============================================================
-- Setelah menjalankan SOLUSI 1, test dengan query ini:

-- Test INSERT
INSERT INTO products (name, price, stock, category)
VALUES ('Test Product', 10000, 10, 'Test')
RETURNING *;

-- Jika berhasil, hapus test product
DELETE FROM products WHERE name = 'Test Product';
