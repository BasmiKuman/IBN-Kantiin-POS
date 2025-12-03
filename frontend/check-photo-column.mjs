import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hqrkqsddsmjsdmwmxcrm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxcmtxc2Rkc21qc2Rtd214Y3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMzY3NTksImV4cCI6MjA3NzcxMjc1OX0.Oa_rw84APi1HdqJxZ7xezNs0iP-yEfW4RUvos4zF0yQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addPhotoColumn() {
  console.log('🔧 Adding photo_url column to employees table...\n');
  
  try {
    // Check if we can query employees table
    const { data, error } = await supabase
      .from('employees')
      .select('id, name, photo_url')
      .limit(1);
    
    if (error) {
      if (error.message.includes('column "photo_url" does not exist')) {
        console.log('❌ Kolom photo_url belum ada!');
        console.log('\n📝 Silakan jalankan migration berikut di Supabase Dashboard > SQL Editor:');
        console.log('   File: CREATE_ADMIN_ACCOUNT.sql');
        console.log('   Atau copy SQL berikut:\n');
        console.log('ALTER TABLE employees ADD COLUMN IF NOT EXISTS photo_url TEXT;');
        console.log('\n');
      } else {
        console.log('⚠️  Error:', error.message);
      }
      return;
    }

    console.log('✅ Kolom photo_url sudah ada!');
    console.log('📊 Sample data:', data);
    console.log('\n✅ Database siap untuk fitur foto profil karyawan!\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

addPhotoColumn();
