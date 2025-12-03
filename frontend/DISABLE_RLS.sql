-- =====================================================
-- DISABLE RLS (Row Level Security) FOR ALL TABLES
-- Run this in Supabase SQL Editor
-- =====================================================
-- This allows all queries to work without authentication
-- ⚠️ FOR DEVELOPMENT ONLY - Enable RLS for production!
-- =====================================================

-- Disable RLS on all tables
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (if any)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on categories
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'categories' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.categories';
    END LOOP;
    
    -- Drop all policies on products
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'products' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.products';
    END LOOP;
    
    -- Drop all policies on customers
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'customers' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.customers';
    END LOOP;
    
    -- Drop all policies on employees
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'employees' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.employees';
    END LOOP;
    
    -- Drop all policies on attendance
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'attendance' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.attendance';
    END LOOP;
    
    -- Drop all policies on transactions
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'transactions' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.transactions';
    END LOOP;
    
    -- Drop all policies on transaction_items
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'transaction_items' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.transaction_items';
    END LOOP;
    
    -- Drop all policies on settings
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'settings' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.settings';
    END LOOP;
END $$;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    CASE WHEN rowsecurity THEN '🔒 ENABLED' ELSE '✅ DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('categories', 'products', 'customers', 'employees', 'attendance', 'transactions', 'transaction_items', 'settings')
ORDER BY tablename;

-- =====================================================
-- RLS DISABLED! 🎉
-- =====================================================
-- All tables are now accessible without authentication
-- This is suitable for development/testing
-- =====================================================
