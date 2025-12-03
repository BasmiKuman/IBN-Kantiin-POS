-- =====================================================
-- SETUP SUPABASE STORAGE FOR EMPLOYEE PHOTOS
-- =====================================================
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- =====================================================

-- Create storage bucket untuk employee photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('employees', 'employees', true)
ON CONFLICT (id) DO NOTHING;

-- Set storage policy agar semua user bisa upload dan read
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
