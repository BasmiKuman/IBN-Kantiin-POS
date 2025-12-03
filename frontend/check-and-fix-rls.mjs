import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env file manually
const envFile = readFileSync('.env', 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndFixRLS() {
  console.log('🔍 Checking RLS status for all tables...\n');

  const tables = [
    'categories',
    'products',
    'product_variants',
    'customers',
    'employees',
    'attendance',
    'transactions',
    'transaction_items',
    'settings'
  ];

  // Check current RLS status
  const { data: rlsStatus, error: rlsError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        schemaname,
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename IN (${tables.map(t => `'${t}'`).join(',')})
      ORDER BY tablename;
    `
  });

  if (rlsError) {
    console.log('📊 Checking RLS via alternative method...\n');
    
    // Try to get info from information_schema
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: RLS ENABLED or ERROR - ${error.message}`);
      } else {
        console.log(`✅ ${table}: Working (${data?.length || 0} rows readable)`);
      }
    }
  } else {
    console.log('Current RLS Status:');
    console.table(rlsStatus);
  }

  console.log('\n🔧 Disabling RLS on all tables...\n');

  // Disable RLS for all tables
  const disableSQL = tables.map(table => `
    ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;
    GRANT ALL ON public.${table} TO anon;
    GRANT ALL ON public.${table} TO authenticated;
  `).join('\n');

  console.log('SQL to execute:');
  console.log(disableSQL);
  console.log('\n📋 Please run this SQL in Supabase SQL Editor:\n');
  console.log('=' .repeat(60));
  console.log(disableSQL);
  console.log('=' .repeat(60));

  // Test DELETE operation
  console.log('\n🧪 Testing DELETE operations...\n');

  // Test delete on products (create and delete a test product)
  const testProduct = {
    name: 'TEST_DELETE_ME',
    category_id: (await supabase.from('categories').select('id').limit(1).single()).data?.id,
    price: 1000,
    cost: 500,
    stock: 0,
    sku: 'TEST_SKU_' + Date.now(),
    is_active: false
  };

  const { data: created, error: createError } = await supabase
    .from('products')
    .insert(testProduct)
    .select()
    .single();

  if (createError) {
    console.log('❌ Cannot create test product:', createError.message);
  } else {
    console.log('✅ Test product created:', created.id);

    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', created.id);

    if (deleteError) {
      console.log('❌ DELETE FAILED:', deleteError.message);
      console.log('   This confirms RLS is blocking DELETE operations!');
    } else {
      console.log('✅ DELETE SUCCESS - RLS is working correctly for deletes');
    }
  }
}

checkAndFixRLS().catch(console.error);
