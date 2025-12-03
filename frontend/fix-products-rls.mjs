import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase credentials dari environment atau hardcode untuk testing
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hqrkqsddsmjsdmwmxcrm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY not found');
  console.log('Please set environment variable or update the script with your key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixProductsRLS() {
  console.log('🔧 Fixing Products RLS policies...\n');

  try {
    // Test connection
    console.log('1. Testing connection...');
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('   ⚠️  Current error:', testError.message);
    } else {
      console.log('   ✅ Connection successful');
    }

    console.log('\n2. Applying RLS fix...');
    console.log('   Option 1: DISABLE RLS (Development - Easiest)');
    console.log('   Option 2: CREATE permissive policies (Production-safe)');
    console.log('\n   Please run ONE of these SQL commands in Supabase SQL Editor:\n');

    // Read SQL file
    const sqlContent = readFileSync(join(__dirname, 'FIX_PRODUCTS_RLS.sql'), 'utf-8');
    console.log('─'.repeat(70));
    console.log(sqlContent);
    console.log('─'.repeat(70));

    console.log('\n3. Alternative: Quick Fix via API (if you have service role key)');
    
    // Try to check RLS status
    const { data: tables, error: tableError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (tableError) {
      console.log(`   ❌ Still blocked: ${tableError.message}`);
      console.log('\n   → You MUST run the SQL above in Supabase Dashboard');
      console.log('   → Go to: Supabase Dashboard > SQL Editor > New Query');
      console.log('   → Copy-paste the SQL above and run it');
    } else {
      console.log('   ✅ Products table is accessible!');
    }

    console.log('\n4. Quick Test After Fix:');
    console.log('   Run: node test-products-insert.mjs');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

console.log('═'.repeat(70));
console.log('  FIX PRODUCTS RLS - Supabase Row Level Security');
console.log('═'.repeat(70));
console.log('');

fixProductsRLS();
