-- =====================================================
-- FIX ATTENDANCE VIEW
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- Drop view if exists
DROP VIEW IF EXISTS attendance_summary;

-- Create view for attendance summary
CREATE OR REPLACE VIEW attendance_summary AS
SELECT 
  e.id as employee_id,
  e.name as employee_name,
  e.position,
  COUNT(a.id) as total_days,
  COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days,
  COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_days,
  COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_days,
  ROUND(AVG(a.work_duration)::numeric, 2) as avg_work_hours,
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
