-- =====================================================
-- IBN KANTIIN POS - DATABASE SCHEMA (SAFE VERSION)
-- Skip types if already exist
-- =====================================================

-- Create enums (with IF NOT EXISTS workaround)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'kasir', 'manajer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.customer_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.transaction_status AS ENUM ('completed', 'pending', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_method AS ENUM ('cash', 'debit', 'credit', 'qris', 'transfer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- =====================================================
-- USER ROLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'kasir',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.user_roles;
CREATE POLICY "Authenticated users can view roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

-- Function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role, _user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.categories;
CREATE POLICY "Authenticated users can view categories"
  ON public.categories FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;
CREATE POLICY "Authenticated users can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (true);

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
  cost DECIMAL(12,2),
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
CREATE POLICY "Authenticated users can view products"
  ON public.products FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
CREATE POLICY "Authenticated users can manage products"
  ON public.products FOR ALL
  TO authenticated
  USING (true);

-- Indexes for faster queries
DROP INDEX IF EXISTS idx_products_sku;
CREATE INDEX idx_products_sku ON public.products(sku);
DROP INDEX IF EXISTS idx_products_category;
CREATE INDEX idx_products_category ON public.products(category_id);
DROP INDEX IF EXISTS idx_products_active;
CREATE INDEX idx_products_active ON public.products(is_active);

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  tier public.customer_tier DEFAULT 'bronze',
  points INTEGER DEFAULT 0,
  total_purchases DECIMAL(15,2) DEFAULT 0,
  last_purchase_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
CREATE POLICY "Authenticated users can view customers"
  ON public.customers FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage customers" ON public.customers;
CREATE POLICY "Authenticated users can manage customers"
  ON public.customers FOR ALL
  TO authenticated
  USING (true);

-- Index for faster searches
DROP INDEX IF EXISTS idx_customers_phone;
CREATE INDEX idx_customers_phone ON public.customers(phone);
DROP INDEX IF EXISTS idx_customers_tier;
CREATE INDEX idx_customers_tier ON public.customers(tier);

-- =====================================================
-- EMPLOYEES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  salary DECIMAL(12,2),
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view employees" ON public.employees;
CREATE POLICY "Authenticated users can view employees"
  ON public.employees FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin can manage employees" ON public.employees;
CREATE POLICY "Admin can manage employees"
  ON public.employees FOR ALL
  TO authenticated
  USING (public.has_role('admin', auth.uid()));

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  cashier_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  discount DECIMAL(15,2) DEFAULT 0,
  tax DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) NOT NULL,
  payment_method public.payment_method NOT NULL,
  payment_amount DECIMAL(15,2) NOT NULL,
  change_amount DECIMAL(15,2) DEFAULT 0,
  status public.transaction_status DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view transactions" ON public.transactions;
CREATE POLICY "Authenticated users can view transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create transactions" ON public.transactions;
CREATE POLICY "Authenticated users can create transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update transactions" ON public.transactions;
CREATE POLICY "Authenticated users can update transactions"
  ON public.transactions FOR UPDATE
  TO authenticated
  USING (true);

-- Indexes
DROP INDEX IF EXISTS idx_transactions_number;
CREATE INDEX idx_transactions_number ON public.transactions(transaction_number);
DROP INDEX IF EXISTS idx_transactions_date;
CREATE INDEX idx_transactions_date ON public.transactions(created_at);
DROP INDEX IF EXISTS idx_transactions_customer;
CREATE INDEX idx_transactions_customer ON public.transactions(customer_id);
DROP INDEX IF EXISTS idx_transactions_status;
CREATE INDEX idx_transactions_status ON public.transactions(status);

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

ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view transaction items" ON public.transaction_items;
CREATE POLICY "Authenticated users can view transaction items"
  ON public.transaction_items FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create transaction items" ON public.transaction_items;
CREATE POLICY "Authenticated users can create transaction items"
  ON public.transaction_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Index
DROP INDEX IF EXISTS idx_transaction_items_transaction;
CREATE INDEX idx_transaction_items_transaction ON public.transaction_items(transaction_id);
DROP INDEX IF EXISTS idx_transaction_items_product;
CREATE INDEX idx_transaction_items_product ON public.transaction_items(product_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INITIAL DATA - CATEGORIES (Only insert if empty)
-- =====================================================
INSERT INTO public.categories (name, description)
SELECT 'Makanan', 'Produk makanan siap saji'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Makanan');

INSERT INTO public.categories (name, description)
SELECT 'Minuman', 'Berbagai jenis minuman'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Minuman');

INSERT INTO public.categories (name, description)
SELECT 'Snack', 'Makanan ringan'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Snack');

INSERT INTO public.categories (name, description)
SELECT 'Bumbu & Bahan', 'Bumbu dapur dan bahan masakan'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Bumbu & Bahan');

-- =====================================================
-- SAMPLE PRODUCTS (Only insert if empty)
-- =====================================================
INSERT INTO public.products (category_id, name, description, sku, price, cost, stock, min_stock) 
SELECT 
  c.id,
  'Nasi Goreng Special',
  'Nasi goreng dengan telur, ayam, dan sayuran',
  'FOOD-001',
  25000,
  15000,
  50,
  10
FROM public.categories c 
WHERE c.name = 'Makanan'
AND NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'FOOD-001');

INSERT INTO public.products (category_id, name, description, sku, price, cost, stock, min_stock)
SELECT 
  c.id,
  'Mie Ayam',
  'Mie dengan ayam cincang dan pangsit',
  'FOOD-002',
  20000,
  12000,
  50,
  10
FROM public.categories c 
WHERE c.name = 'Makanan'
AND NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'FOOD-002');

INSERT INTO public.products (category_id, name, description, sku, price, cost, stock, min_stock)
SELECT 
  c.id,
  'Es Teh Manis',
  'Teh manis dingin',
  'DRINK-001',
  5000,
  2000,
  100,
  20
FROM public.categories c 
WHERE c.name = 'Minuman'
AND NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'DRINK-001');

INSERT INTO public.products (category_id, name, description, sku, price, cost, stock, min_stock)
SELECT 
  c.id,
  'Kopi Hitam',
  'Kopi hitam panas',
  'DRINK-002',
  8000,
  3000,
  100,
  20
FROM public.categories c 
WHERE c.name = 'Minuman'
AND NOT EXISTS (SELECT 1 FROM public.products WHERE sku = 'DRINK-002');
