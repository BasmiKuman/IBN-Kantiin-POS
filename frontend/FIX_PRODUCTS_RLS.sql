-- Fix RLS untuk products table
-- Error 409 menunjukkan ada konflik dengan Row Level Security

-- 1. Matikan RLS pada products table (temporary untuk development)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 2. Atau jika ingin tetap pakai RLS, buat policies yang lengkap:
-- Drop existing policies dulu
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to insert products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON products;

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Buat policies baru yang lebih permisif
CREATE POLICY "Allow all operations on products"
ON products
FOR ALL
USING (true)
WITH CHECK (true);

-- Atau jika ingin lebih specific:
-- CREATE POLICY "Allow read products" ON products FOR SELECT USING (true);
-- CREATE POLICY "Allow insert products" ON products FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow update products" ON products FOR UPDATE USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow delete products" ON products FOR DELETE USING (true);

-- 3. Pastikan authenticated users bisa akses
GRANT ALL ON products TO authenticated;
GRANT ALL ON products TO anon;

-- 4. Reset sequence jika ada masalah dengan ID
-- SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
