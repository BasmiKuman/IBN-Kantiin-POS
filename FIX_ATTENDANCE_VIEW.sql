-- =====================================================
-- FIX ATTENDANCE VIEW
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- Drop view if exists
DROP VIEW IF EXISTS attendance_summary;

-- Create view for attendance summary
-- Note: Actual table structure has these columns:
-- id, employee_id, employee_username, employee_name, clock_in, clock_out, date, created_at, updated_at
CREATE OR REPLACE VIEW attendance_summary AS
SELECT 
  e.id as employee_id,
  e.name as employee_name,
  e.position,
  COUNT(a.id) as total_days,
  COUNT(CASE WHEN a.clock_in IS NOT NULL THEN 1 END) as present_days,
  COUNT(CASE WHEN EXTRACT(HOUR FROM a.clock_in AT TIME ZONE 'Asia/Jakarta') > 8 
    OR (EXTRACT(HOUR FROM a.clock_in AT TIME ZONE 'Asia/Jakarta') = 8 
        AND EXTRACT(MINUTE FROM a.clock_in AT TIME ZONE 'Asia/Jakarta') > 30) 
    THEN 1 END) as late_days,
  0 as absent_days,
  ROUND(AVG(
    CASE 
      WHEN a.clock_out IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (a.clock_out - a.clock_in))/3600 
      ELSE 0 
    END
  )::numeric, 2) as avg_work_hours,
  MAX(a.clock_in) as last_attendance
FROM public.employees e
LEFT JOIN public.attendance a ON e.id = a.employee_id
WHERE e.is_active = true
GROUP BY e.id, e.name, e.position;

-- Grant access to the view
GRANT SELECT ON attendance_summary TO authenticated;
GRANT SELECT ON attendance_summary TO anon;

-- Verify the view was created
SELECT 'View created successfully!' as status;
SELECT * FROM attendance_summary LIMIT 5;
