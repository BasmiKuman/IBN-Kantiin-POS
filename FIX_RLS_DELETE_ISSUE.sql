-- ============================================================
-- FIX RLS DELETE ISSUE
-- Run this in Supabase SQL Editor to allow DELETE operations
-- ============================================================

-- STEP 1: Check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('categories', 'products', 'product_variants', 'customers', 'employees', 'attendance', 'transactions', 'transaction_items', 'settings')
ORDER BY tablename;

-- STEP 2: Disable RLS on all tables
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- STEP 3: Grant permissions to anon and authenticated users
GRANT ALL ON public.categories TO anon, authenticated;
GRANT ALL ON public.products TO anon, authenticated;
GRANT ALL ON public.product_variants TO anon, authenticated;
GRANT ALL ON public.customers TO anon, authenticated;
GRANT ALL ON public.employees TO anon, authenticated;
GRANT ALL ON public.attendance TO anon, authenticated;
GRANT ALL ON public.transactions TO anon, authenticated;
GRANT ALL ON public.transaction_items TO anon, authenticated;
GRANT ALL ON public.settings TO anon, authenticated;

-- STEP 4: Drop all existing RLS policies (if any)
DROP POLICY IF EXISTS "Enable all operations for anon" ON public.categories;
DROP POLICY IF EXISTS "Enable all operations for anon" ON public.products;
DROP POLICY IF EXISTS "Enable all operations for anon" ON public.product_variants;
DROP POLICY IF EXISTS "Enable all operations for anon" ON public.customers;
DROP POLICY IF EXISTS "Enable all operations for anon" ON public.employees;
DROP POLICY IF EXISTS "Enable all operations for anon" ON public.attendance;
DROP POLICY IF EXISTS "Enable all operations for anon" ON public.transactions;
DROP POLICY IF EXISTS "Enable all operations for anon" ON public.transaction_items;
DROP POLICY IF EXISTS "Enable all operations for anon" ON public.settings;

-- STEP 5: Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('categories', 'products', 'product_variants', 'customers', 'employees', 'attendance', 'transactions', 'transaction_items', 'settings')
ORDER BY tablename;

-- All rls_enabled should be FALSE now
SELECT '✅ RLS has been disabled on all tables. DELETE operations should work now!' as status;
