-- =====================================================
-- BASMIKUMAN POS - COMPLETE DATABASE SETUP
-- =====================================================
-- Cara:
-- 1. Buka Supabase Dashboard
-- 2. Pilih project Anda
-- 3. Klik "SQL Editor" di sidebar kiri
-- 4. Klik "New Query"
-- 5. Copy-paste SELURUH SQL di bawah ini
-- 6. Klik "Run" untuk menjalankan
-- =====================================================

-- =====================================================
-- PART 1: CREATE TABLES (Initial Schema)
-- =====================================================

-- Create enum types
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'kasir', 'manager');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.customer_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.transaction_status AS ENUM ('completed', 'pending', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_method AS ENUM ('cash', 'qris', 'transfer');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT NOT NULL UNIQUE,
  price DECIMAL(12,2) NOT NULL,
  cost_price DECIMAL(12,2),
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 10,
  max_stock INTEGER DEFAULT 1000,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$ 
BEGIN
  -- Add stock column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'products' 
                 AND column_name = 'stock') THEN
    ALTER TABLE public.products ADD COLUMN stock INTEGER NOT NULL DEFAULT 0;
  END IF;
  
  -- Add cost_price column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'products' 
                 AND column_name = 'cost_price') THEN
    ALTER TABLE public.products ADD COLUMN cost_price DECIMAL(12,2);
  END IF;
  
  -- Add min_stock column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'products' 
                 AND column_name = 'min_stock') THEN
    ALTER TABLE public.products ADD COLUMN min_stock INTEGER DEFAULT 10;
  END IF;
  
  -- Add max_stock column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'products' 
                 AND column_name = 'max_stock') THEN
    ALTER TABLE public.products ADD COLUMN max_stock INTEGER DEFAULT 1000;
  END IF;
END $$;

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  tier public.customer_tier DEFAULT 'bronze',
  points INTEGER DEFAULT 0,
  total_spent DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- EMPLOYEES TABLE (with username & password)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  password TEXT,
  email TEXT,
  phone TEXT,
  position TEXT,
  photo_url TEXT,
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk mempercepat pencarian username
CREATE INDEX IF NOT EXISTS idx_employees_username ON public.employees(username);

-- =====================================================
-- ATTENDANCE TABLE (using employee_username)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_username TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  check_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out TIMESTAMPTZ,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk query cepat
CREATE INDEX IF NOT EXISTS idx_attendance_username ON public.attendance(employee_username);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON public.attendance(employee_id);

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number TEXT,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  cashier_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount DECIMAL(15,2) DEFAULT 0,
  tax DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  payment_method public.payment_method NOT NULL,
  payment_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  change_amount DECIMAL(15,2) DEFAULT 0,
  status public.transaction_status DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TRANSACTION ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- PART 2: STORAGE SETUP (for employee photos)
-- =====================================================

-- Create storage bucket untuk foto karyawan
INSERT INTO storage.buckets (id, name, public)
VALUES ('employees', 'employees', true)
ON CONFLICT (id) DO NOTHING;

-- Set storage policies
DO $$
BEGIN
  -- Drop existing policies if any
  DROP POLICY IF EXISTS "Anyone can upload employee photos" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can read employee photos" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can update employee photos" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can delete employee photos" ON storage.objects;

  -- Create new policies
  CREATE POLICY "Anyone can upload employee photos"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'employees');

  CREATE POLICY "Anyone can read employee photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'employees');

  CREATE POLICY "Anyone can update employee photos"
  ON storage.objects FOR UPDATE
  TO public
  USING (bucket_id = 'employees');

  CREATE POLICY "Anyone can delete employee photos"
  ON storage.objects FOR DELETE
  TO public
  USING (bucket_id = 'employees');
END $$;

-- =====================================================
-- PART 3: CREATE ADMIN ACCOUNT
-- =====================================================

-- Hapus admin lama jika ada (opsional)
-- DELETE FROM public.employees WHERE username = 'Basmikuman';

-- Buat akun admin
INSERT INTO public.employees (
  name,
  username,
  password,
  email,
  position,
  is_active,
  hire_date
) VALUES (
  'Admin - Fadlan Nafian',
  'Basmikuman',
  'kadalmesir007',
  'fadlannafian@gmail.com',
  'admin',
  true,
  CURRENT_DATE
)
ON CONFLICT (username) 
DO UPDATE SET 
  password = 'kadalmesir007',
  position = 'admin',
  is_active = true;

-- =====================================================
-- PART 4: INSERT DEMO DATA (Optional)
-- =====================================================

-- Insert default category
INSERT INTO public.categories (name, description) 
VALUES ('Makanan', 'Produk makanan dan minuman')
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO public.products (name, sku, price, stock, category_id)
SELECT 
  'Nasi Goreng', 
  'NG001', 
  25000, 
  100,
  (SELECT id FROM public.categories WHERE name = 'Makanan' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'NG001');

INSERT INTO public.products (name, sku, price, stock, category_id)
SELECT 
  'Es Teh Manis', 
  'ETM001', 
  5000, 
  200,
  (SELECT id FROM public.categories WHERE name = 'Makanan' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'ETM001');

-- Insert default settings
INSERT INTO public.settings (key, value) 
VALUES 
  ('store_name', 'BasmiKuman POS'),
  ('tax_enabled', 'false'),
  ('tax_percentage', '0')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- PART 5: VERIFICATION
-- =====================================================

-- Verify admin account
SELECT 
  '✅ ADMIN ACCOUNT CREATED' as status,
  id, 
  name, 
  username, 
  position, 
  email, 
  is_active, 
  hire_date
FROM public.employees
WHERE username = 'Basmikuman';

-- Count tables
SELECT 
  '✅ TABLES CREATED' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tables;

-- Count storage buckets
SELECT 
  '✅ STORAGE SETUP' as status,
  COUNT(*) as total_buckets
FROM storage.buckets
WHERE id = 'employees';

-- =====================================================
-- SETUP COMPLETE! 🎉
-- =====================================================
-- 
-- Login credentials:
-- Username: Basmikuman
-- Password: kadalmesir007
-- 
-- Next steps:
-- 1. Test login di aplikasi
-- 2. Tambah karyawan baru (optional)
-- 3. Mulai transaksi!
-- =====================================================
