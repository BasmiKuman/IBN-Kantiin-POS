import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const supabaseUrl = 'https://hqrkqsddsmjsdmwmxcrm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxcmtxc2Rkc21qc2Rtd214Y3JtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjEzNjc1OSwiZXhwIjoyMDc3NzEyNzU5fQ.YXlp8d5NFZwabi5CN8EZHz6ikGMOKuxPxLzl1XIVb2U';

async function runMigration() {
  try {
    console.log('🚀 Menjalankan migrasi skema absensi...\n');
    
    // Read migration file
    const migrationPath = join(__dirname, 'supabase', 'migrations', '20251103_attendance_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('📄 File migrasi dimuat');
    console.log('📊 Mengeksekusi SQL...\n');
    
    // Execute migration using fetch
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: migrationSQL })
    });

    if (!response.ok) {
      console.log('⚠️  Eksekusi SQL via API tidak tersedia');
      console.log('📝 Silakan jalankan migrasi manual:\n');
      console.log('1. Buka Supabase Dashboard:');
      console.log('   https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/sql/new\n');
      console.log('2. Copy isi file: supabase/migrations/20251103_attendance_schema.sql');
      console.log('3. Paste di SQL Editor dan klik "Run"\n');
      console.log('✅ File migrasi siap di: supabase/migrations/20251103_attendance_schema.sql');
      return;
    }

    const result = await response.json();
    console.log('✅ Migrasi berhasil dieksekusi!');
    console.log('📊 Result:', result);
    
  } catch (error) {
    console.error('❌ Migrasi gagal:', error.message);
    console.log('\n📝 Langkah manual:');
    console.log('1. Buka: https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm/sql/new');
    console.log('2. Jalankan SQL dari: supabase/migrations/20251103_attendance_schema.sql\n');
  }
}

runMigration();
