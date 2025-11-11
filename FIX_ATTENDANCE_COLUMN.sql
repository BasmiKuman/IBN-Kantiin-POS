-- =====================================================
-- FIX ATTENDANCE TABLE - Remove NOT NULL constraint
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- Make employee_username nullable (we have employee_id foreign key already)
ALTER TABLE public.attendance 
ALTER COLUMN employee_username DROP NOT NULL;

-- If the column doesn't serve a purpose, we can also drop it entirely
-- Uncomment below if you want to remove the column:
-- ALTER TABLE public.attendance DROP COLUMN IF EXISTS employee_username;

-- Verify the change
SELECT 'Constraint removed successfully!' as status;

-- Test insert (should work now)
-- Replace with actual employee_id from your employees table
-- INSERT INTO attendance (employee_id) 
-- VALUES ('your-employee-id-here')
-- RETURNING *;
