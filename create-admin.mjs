import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hqrkqsddsmjsdmwmxcrm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxcmtxc2Rkc21qc2Rtd214Y3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMzY3NTksImV4cCI6MjA3NzcxMjc1OX0.Oa_rw84APi1HdqJxZ7xezNs0iP-yEfW4RUvos4zF0yQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);


async function createAdmin() {
  console.log('🔧 Creating admin account...\n');
  
  try {
    // Step 1: Check if username column exists
    const { data: existingEmployee, error: checkError } = await supabase
      .from('employees')
      .select('*')
      .eq('username', 'Basmikuman')
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.log('⚠️  Error checking existing employee:', checkError.message);
      
      if (checkError.message.includes('column') && checkError.message.includes('does not exist')) {
        console.log('\n❌ Migration belum dijalankan!');
        console.log('📝 Silakan jalankan migration terlebih dahulu:');
        console.log('   Buka file: CREATE_ADMIN_ACCOUNT.sql');
        console.log('   Copy semua isinya ke Supabase Dashboard > SQL Editor > Run');
        return;
      }
      throw checkError;
    }

    // Step 2: Create or update admin account
    const adminData = {
      name: 'Admin - Fadlan Nafian',
      username: 'Basmikuman',
      password: 'kadalmesir007',
      email: 'fadlannafian@gmail.com',
      position: 'admin',
      is_active: true,
      hire_date: new Date().toISOString().split('T')[0]
    };

    let result;
    if (existingEmployee) {
      // Update existing
      console.log('📝 Updating existing admin account...');
      result = await supabase
        .from('employees')
        .update({
          username: adminData.username,
          password: adminData.password,
          position: adminData.position,
          is_active: true
        })
        .eq('username', 'Basmikuman')
        .select();
    } else {
      // Insert new
      console.log('➕ Creating new admin account...');
      result = await supabase
        .from('employees')
        .insert([adminData])
        .select();
    }

    if (result.error) {
      console.log('❌ Error creating admin:', result.error.message);
      
      if (result.error.message.includes('column') && result.error.message.includes('does not exist')) {
        console.log('\n⚠️  Kolom username/password belum ada di database!');
        console.log('📝 Silakan jalankan migration terlebih dahulu:');
        console.log('   1. Buka Supabase Dashboard');
        console.log('   2. Klik SQL Editor');
        console.log('   3. Copy isi file CREATE_ADMIN_ACCOUNT.sql');
        console.log('   4. Paste dan klik Run\n');
      }
      return;
    }

    console.log('✅ Admin account berhasil dibuat/diupdate!\n');
    console.log('� Detail akun:');
    console.log('   Nama     :', adminData.name);
    console.log('   Username :', adminData.username);
    console.log('   Password :', adminData.password);
    console.log('   Position :', adminData.position);
    console.log('\n🚀 Sekarang Anda bisa login dengan:');
    console.log('   Username: Basmikuman');
    console.log('   Password: kadalmesir007\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\n⚠️  Jika error tentang kolom yang tidak ada:');
    console.log('   Silakan jalankan migration dulu via Supabase Dashboard');
    console.log('   File: CREATE_ADMIN_ACCOUNT.sql\n');
  }
}

createAdmin();
