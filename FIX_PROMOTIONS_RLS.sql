-- ============================================
-- FIX RLS POLICIES FOR PROMOTIONS TABLE
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Step 1: Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON promotions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON promotions;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON promotions;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON promotions;

-- Step 2: Disable RLS (simplest solution for internal POS system)
ALTER TABLE promotions DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ALTERNATIVE: Keep RLS enabled with permissive policy
-- Uncomment lines below if you prefer to keep RLS enabled
-- ============================================

-- ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow all operations for all users" ON promotions
--   FOR ALL
--   USING (true)
--   WITH CHECK (true);

-- ============================================
-- VERIFICATION QUERY
-- Run this after to verify RLS is disabled
-- ============================================

-- SELECT 
--   schemaname,
--   tablename,
--   rowsecurity
-- FROM pg_tables 
-- WHERE tablename = 'promotions';

-- Expected result: rowsecurity = false

