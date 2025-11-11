import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hqrkqsddsmjsdmwmxcrm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxcmtxc2Rkc21qc2Rtd214Y3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMzY3NTksImV4cCI6MjA3NzcxMjc1OX0.Oa_rw84APi1HdqJxZ7xezNs0iP-yEfW4RUvos4zF0yQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAttendanceView() {
  console.log('🔧 Creating attendance_summary view...\n');
  
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      -- Drop view if exists
      DROP VIEW IF EXISTS attendance_summary;
      
      -- Create view
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
      
      -- Grant access
      GRANT SELECT ON attendance_summary TO authenticated;
      GRANT SELECT ON attendance_summary TO anon;
    `
  });
  
  if (error) {
    console.error('❌ Error creating view:', error.message);
    console.log('\nTrying alternative method via SQL Editor in Supabase Dashboard...');
    console.log('\n📋 Please run this SQL in Supabase Dashboard > SQL Editor:\n');
    console.log(`
DROP VIEW IF EXISTS attendance_summary;

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

GRANT SELECT ON attendance_summary TO authenticated;
GRANT SELECT ON attendance_summary TO anon;
    `);
  } else {
    console.log('✅ View created successfully!');
  }
}

fixAttendanceView().catch(console.error);
