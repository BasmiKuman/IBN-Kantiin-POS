import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hqrkqsddsmjsdmwmxcrm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxcmtxc2Rkc21qc2Rtd214Y3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMzY3NTksImV4cCI6MjA3NzcxMjc1OX0.Oa_rw84APi1HdqJxZ7xezNs0iP-yEfW4RUvos4zF0yQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAttendanceInsert() {
  console.log('🧪 Testing attendance insert...\n');
  
  // Get a test employee
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('id, name, username')
    .eq('is_active', true)
    .limit(1);
    
  if (empError || !employees || employees.length === 0) {
    console.error('❌ No active employees found');
    return;
  }
  
  const testEmployee = employees[0];
  console.log('Using test employee:', testEmployee.name);
  console.log('Employee ID:', testEmployee.id);
  
  // Try to insert attendance
  console.log('\n📝 Attempting to insert attendance record...');
  
  const { data, error } = await supabase
    .from('attendance')
    .insert({
      employee_id: testEmployee.id,
    })
    .select()
    .single();
  
  if (error) {
    console.error('\n❌ Insert failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error details:', error.details);
    console.error('Error hint:', error.hint);
  } else {
    console.log('\n✅ Insert successful!');
    console.log('Attendance record:', data);
    
    // Clean up - delete test record
    const { error: deleteError } = await supabase
      .from('attendance')
      .delete()
      .eq('id', data.id);
      
    if (!deleteError) {
      console.log('\n🧹 Test record cleaned up');
    }
  }
}

testAttendanceInsert().catch(console.error);
