import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hqrkqsddsmjsdmwmxcrm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxcmtxc2Rkc21qc2Rtd214Y3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyMTU1ODAsImV4cCI6MjA0ODc5MTU4MH0.s9VUfwKF-lnlOMAeH5HFJJx3qEqJpxkUBwJYHAL5GFo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Checking Supabase Health...\n');

// Test 1: Check connection
console.log('1️⃣ Testing basic connection...');
try {
  const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
  if (error) {
    console.log('❌ Connection Error:', error.message);
    console.log('   Code:', error.code);
    console.log('   Details:', error.details);
    console.log('   Hint:', error.hint);
  } else {
    console.log('✅ Connection OK');
  }
} catch (err) {
  console.log('❌ Fatal Error:', err.message);
}

// Test 2: Check auth
console.log('\n2️⃣ Testing authentication...');
try {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    console.log('✅ Logged in as:', session.user.email);
  } else {
    console.log('⚠️  Not logged in (this is OK for anon key test)');
  }
} catch (err) {
  console.log('❌ Auth Error:', err.message);
}

// Test 3: Check tables
console.log('\n3️⃣ Testing table access...');
const tables = ['products', 'categories', 'transactions', 'customers', 'employees'];

for (const table of tables) {
  try {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: OK (${data?.length || 0} rows)`);
    }
  } catch (err) {
    console.log(`❌ ${table}: ${err.message}`);
  }
}

console.log('\n✅ Health check complete!');
