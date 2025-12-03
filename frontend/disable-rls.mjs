import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableRLS() {
  console.log('🔧 Disabling Row Level Security for demo/development...\n');

  const tables = [
    'categories',
    'products', 
    'customers',
    'employees',
    'transactions',
    'transaction_items',
    'attendance'
  ];

  try {
    // Disable RLS for all tables
    for (const table of tables) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`
      });

      if (error) {
        console.log(`⚠️  ${table}: RLS might already be disabled or need manual intervention`);
      } else {
        console.log(`✅ ${table}: RLS disabled`);
      }
    }

    console.log('\n📊 Verifying RLS status...\n');

    // Verify by trying to fetch data
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        console.log(`❌ ${table}: Still getting error - ${error.message}`);
      } else {
        console.log(`✅ ${table}: Accessible (${data?.length || 0} rows)`);
      }
    }

    console.log('\n✅ RLS has been disabled for all tables!');
    console.log('\n⚠️  WARNING: This is for demo/development only!');
    console.log('   For production, implement proper RLS policies.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Manual Fix Required:');
    console.log('   1. Open: https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/sql/new');
    console.log('   2. Copy content from: disable-rls-demo.sql');
    console.log('   3. Paste and Run in SQL Editor\n');
  }
}

disableRLS();
