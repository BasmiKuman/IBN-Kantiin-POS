import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hqrkqsddsmjsdmwmxcrm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxcmtxc2Rkc21qc2Rtd214Y3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMzY3NTksImV4cCI6MjA3NzcxMjc1OX0.Oa_rw84APi1HdqJxZ7xezNs0iP-yEfW4RUvos4zF0yQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAttendanceTable() {
  console.log('🔍 Checking attendance table and migrations...\n');
  
  // Check if table exists
  const { data: testData, error } = await supabase
    .from('attendance')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ Attendance table error:', error.message);
    console.log('\n📋 This means attendance table needs to be created.');
    console.log('   Run: npm run migration:attendance\n');
  } else {
    console.log('✅ Attendance table exists');
    console.log('   Records found:', testData?.length || 0);
  }
  
  // Check view
  const { data: viewData, error: viewError } = await supabase
    .from('attendance_summary')
    .select('*')
    .limit(1);
    
  if (viewError) {
    console.error('\n❌ View attendance_summary not found:', viewError.message);
  } else {
    console.log('\n✅ View attendance_summary exists');
  }
  
  // Check employees with username
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('id, name, username, is_active')
    .eq('is_active', true)
    .limit(3);
    
  if (empError) {
    console.error('\n❌ Error checking employees:', empError.message);
  } else {
    console.log('\n✅ Active employees found:', employees?.length || 0);
    if (employees && employees.length > 0) {
      console.log('\nSample employees:');
      employees.forEach(emp => {
        console.log(`  - ${emp.name} (username: ${emp.username || 'NOT SET'})`);
      });
    }
  }
}

checkAttendanceTable().catch(console.error);
