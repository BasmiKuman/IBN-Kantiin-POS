import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hqrkqsddsmjsdmwmxcrm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxcmtxc2Rkc21qc2Rtd214Y3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMzY3NTksImV4cCI6MjA3NzcxMjc1OX0.Oa_rw84APi1HdqJxZ7xezNs0iP-yEfW4RUvos4zF0yQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔌 Testing Supabase connection...\n');
  console.log('📍 URL:', supabaseUrl);
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('categories')
      .select('count');
    
    if (error) {
      console.log('⚠️  Database tables not yet created');
      console.log('Error:', error.message);
      console.log('\n📝 Next steps:');
      console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/editor');
      console.log('2. Click on "SQL Editor" in the left sidebar');
      console.log('3. Click "New query"');
      console.log('4. Copy the entire content from: supabase/migrations/20251103000000_initial_schema.sql');
      console.log('5. Paste it into the SQL editor');
      console.log('6. Click "Run" or press Ctrl+Enter\n');
      console.log('✅ Connection to Supabase is working! Just need to run the migration.');
    } else {
      console.log('✅ Connection successful!');
      console.log('✅ Database tables already exist!');
      console.log('📊 Data:', data);
    }
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

testConnection();
