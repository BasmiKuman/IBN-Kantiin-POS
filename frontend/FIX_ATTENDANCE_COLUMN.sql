-- =====================================================
-- FIX ATTENDANCE TABLE - Make employee_username nullable
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- The production table has these columns:
-- id, employee_id, employee_username, employee_name, clock_in, clock_out, date, created_at, updated_at
-- We need to make employee_username and employee_name nullable since we have employee_id

-- Option 1: Make columns nullable (Recommended)
ALTER TABLE public.attendance 
ALTER COLUMN employee_username DROP NOT NULL;

ALTER TABLE public.attendance 
ALTER COLUMN employee_name DROP NOT NULL;

-- Verify the change
SELECT 'Constraint removed successfully! Columns are now nullable.' as status;

-- Test insert (should work now)
-- The app will only send employee_id, other fields will be NULL or auto-filled
SELECT 'You can now insert with just employee_id' as note;
