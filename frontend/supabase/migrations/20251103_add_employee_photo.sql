-- Add photo_url column to employees table
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Comment for clarity
COMMENT ON COLUMN employees.photo_url IS 'URL to employee profile photo stored in Supabase Storage';
