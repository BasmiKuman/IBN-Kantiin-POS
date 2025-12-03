import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hqrkqsddsmjsdmwmxcrm.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_ANON_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProductInsert() {
  console.log('🧪 Testing Product Insert...\n');

  try {
    // Test insert
    const testProduct = {
      name: 'Test Product ' + Date.now(),
      price: 10000,
      category: 'Minuman',
      stock: 100,
      image_url: null
    };

    console.log('Inserting test product:', testProduct.name);
    
    const { data, error } = await supabase
      .from('products')
      .insert([testProduct])
      .select();

    if (error) {
      console.error('❌ INSERT FAILED:');
      console.error('   Error Code:', error.code);
      console.error('   Error Message:', error.message);
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);
      
      console.log('\n📋 SOLUTION:');
      console.log('   1. Go to Supabase Dashboard > SQL Editor');
      console.log('   2. Run: ALTER TABLE products DISABLE ROW LEVEL SECURITY;');
      console.log('   3. Or run the full SQL from: FIX_PRODUCTS_RLS.sql');
      
      return false;
    }

    console.log('✅ INSERT SUCCESS!');
    console.log('   Product ID:', data[0].id);
    console.log('   Product Name:', data[0].name);
    
    // Cleanup - delete test product
    console.log('\n🧹 Cleaning up test product...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', data[0].id);
    
    if (deleteError) {
      console.log('   ⚠️  Could not delete test product (manual cleanup needed)');
    } else {
      console.log('   ✅ Test product deleted');
    }

    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

console.log('═'.repeat(70));
console.log('  TEST PRODUCTS INSERT');
console.log('═'.repeat(70));
console.log('');

testProductInsert().then(success => {
  console.log('');
  console.log('═'.repeat(70));
  if (success) {
    console.log('  ✅ All tests passed! Products table is working correctly.');
  } else {
    console.log('  ❌ Tests failed. Please fix RLS policies first.');
  }
  console.log('═'.repeat(70));
  process.exit(success ? 0 : 1);
});
