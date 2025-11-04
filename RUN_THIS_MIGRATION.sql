-- =====================================================
-- JALANKAN SQL INI DI SUPABASE DASHBOARD
-- =====================================================
-- Cara:
-- 1. Buka Supabase Dashboard
-- 2. Pilih project Anda
-- 3. Klik "SQL Editor" di sidebar kiri
-- 4. Klik "New Query"
-- 5. Copy-paste SQL di bawah ini
-- 6. Klik "Run" untuk menjalankan
-- =====================================================

-- Tambah kolom username dan password ke tabel employees
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS password TEXT;

-- Buat index untuk mempercepat pencarian username
CREATE INDEX IF NOT EXISTS idx_employees_username ON employees(username);

-- Verifikasi kolom sudah ditambahkan
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'employees'
ORDER BY ordinal_position;
