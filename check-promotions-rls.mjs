import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables manually
const envPath = join(__dirname, '.env.local');
let supabaseUrl, supabaseKey;

try {
  const envFile = readFileSync(envPath, 'utf8');
  const lines = envFile.split('\n');
  for (const line of lines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  }
} catch (error) {
  console.error('❌ Error reading .env.local:', error.message);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPromotionsRLS() {
  console.log('🔧 Fixing promotions table RLS...\n');

  try {
    // Try to check current RLS status
    console.log('1️⃣ Checking current promotions data...');
    const { data: currentData, error: selectError } = await supabase
      .from('promotions')
      .select('*')
      .limit(5);

    if (selectError) {
      console.error('❌ Error reading promotions:', selectError.message);
    } else {
      console.log(`✅ Can read promotions. Found ${currentData?.length || 0} records`);
    }

    // Try to insert a test record
    console.log('\n2️⃣ Testing INSERT operation...');
    const testPromo = {
      code: 'TEST_' + Date.now(),
      name: 'Test Promotion',
      description: 'Test promotion for RLS check',
      type: 'percentage',
      value: 5,
      min_purchase: 0,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true,
    };

    const { data: insertData, error: insertError } = await supabase
      .from('promotions')
      .insert(testPromo)
      .select();

    if (insertError) {
      console.error('❌ Error inserting promotion:', insertError.message);
      console.error('Error details:', insertError);
      
      if (insertError.code === '42501') {
        console.log('\n🔴 RLS POLICY ERROR: Permission denied');
        console.log('📋 Solution:');
        console.log('   Run this SQL in Supabase Dashboard SQL Editor:');
        console.log('   ');
        console.log('   ALTER TABLE promotions DISABLE ROW LEVEL SECURITY;');
        console.log('   ');
        console.log('   Or if you want to keep RLS:');
        console.log('   ');
        console.log('   DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON promotions;');
        console.log('   CREATE POLICY "Allow all operations" ON promotions FOR ALL USING (true) WITH CHECK (true);');
      }
    } else {
      console.log('✅ Successfully inserted test promotion');
      console.log('Data:', insertData);

      // Clean up test record
      if (insertData && insertData[0]) {
        const { error: deleteError } = await supabase
          .from('promotions')
          .delete()
          .eq('id', insertData[0].id);

        if (!deleteError) {
          console.log('🧹 Cleaned up test record');
        }
      }
    }

    // Try update operation
    if (currentData && currentData.length > 0) {
      console.log('\n3️⃣ Testing UPDATE operation...');
      const { error: updateError } = await supabase
        .from('promotions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentData[0].id);

      if (updateError) {
        console.error('❌ Error updating promotion:', updateError.message);
      } else {
        console.log('✅ Successfully updated promotion');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixPromotionsRLS().then(() => {
  console.log('\n✨ Check complete!');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
