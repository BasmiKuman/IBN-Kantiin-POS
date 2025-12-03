-- =====================================================
-- ADD MISSING COLUMNS TO EMPLOYEES TABLE
-- Run this in Supabase SQL Editor if employees table already exists
-- =====================================================

-- Add salary column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'employees' 
                 AND column_name = 'salary') THEN
    ALTER TABLE public.employees ADD COLUMN salary DECIMAL(12,2);
    RAISE NOTICE 'Column salary added to employees table';
  ELSE
    RAISE NOTICE 'Column salary already exists in employees table';
  END IF;
END $$;

-- Add user_id column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'employees' 
                 AND column_name = 'user_id') THEN
    ALTER TABLE public.employees ADD COLUMN user_id UUID;
    RAISE NOTICE 'Column user_id added to employees table';
  ELSE
    RAISE NOTICE 'Column user_id already exists in employees table';
  END IF;
END $$;

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'employees'
ORDER BY ordinal_position;
