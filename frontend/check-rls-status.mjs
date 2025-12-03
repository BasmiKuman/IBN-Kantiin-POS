#!/usr/bin/env node

/**
 * Script untuk mengecek status RLS dan policies pada tabel products
 * Jalankan di Supabase SQL Editor atau terminal dengan env variables
 */

console.log('='.repeat(60));
console.log('CHECK RLS STATUS - PRODUCTS TABLE');
console.log('='.repeat(60));
console.log('\n📋 Jalankan SQL berikut di Supabase Dashboard → SQL Editor:\n');

const sqlChecks = `
-- 1. Cek status RLS pada tabel products
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'products';

-- 2. Cek semua policies yang ada pada tabel products
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'products';

-- 3. Cek grants/permissions pada tabel products
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'products';
`;

console.log(sqlChecks);

console.log('\n' + '='.repeat(60));
console.log('SOLUSI ALTERNATIF - PASTIKAN RLS BENAR-BENAR DISABLED');
console.log('='.repeat(60));
console.log('\n📝 Jika hasil check menunjukkan RLS masih enabled, jalankan:\n');

const fixSql = `
-- OPSI 1: Disable RLS (Paling Simple)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- OPSI 2: Drop semua policies dulu, baru disable RLS
DROP POLICY IF EXISTS "Allow all operations on products" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;

ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- OPSI 3: Jika tetap ingin pakai RLS, pastikan policy nya benar
-- Hapus semua policy lama
DROP POLICY IF EXISTS "Allow all operations on products" ON products;

-- Buat policy baru yang benar-benar permissive
CREATE POLICY "products_select_policy" 
ON products FOR SELECT 
USING (true);

CREATE POLICY "products_insert_policy" 
ON products FOR INSERT 
WITH CHECK (true);

CREATE POLICY "products_update_policy" 
ON products FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "products_delete_policy" 
ON products FOR DELETE 
USING (true);

-- Grant permissions
GRANT ALL ON products TO authenticated;
GRANT ALL ON products TO anon;
GRANT ALL ON products TO postgres;
`;

console.log(fixSql);

console.log('\n' + '='.repeat(60));
console.log('REKOMENDASI');
console.log('='.repeat(60));
console.log(`
✅ Untuk testing/development: Gunakan OPSI 1 atau OPSI 2
   (Disable RLS sepenuhnya)

✅ Untuk production: Gunakan OPSI 3 
   (Policy terpisah per operasi: SELECT, INSERT, UPDATE, DELETE)

⚠️  Setelah menjalankan SQL, WAJIB:
   1. Refresh halaman aplikasi (Ctrl+R atau F5)
   2. Clear browser cache jika masih error
   3. Cek browser console untuk error baru
`);

console.log('='.repeat(60));
kok