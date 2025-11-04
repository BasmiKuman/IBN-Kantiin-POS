import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const supabaseUrl = 'https://hqrkqsddsmjsdmwmxcrm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxcmtxc2Rkc21qc2Rtd214Y3JtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjEzNjc1OSwiZXhwIjoyMDc3NzEyNzU5fQ.YXlp8d5NFZwabi5CN8EZHz6ikGMOKuxPxLzl1XIVb2U';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...\n');
    
    // Read migration file
    const migrationPath = join(__dirname, 'supabase', 'migrations', '20251103000000_initial_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded');
    console.log('📊 Executing SQL migration...\n');
    
    // Execute migration using Supabase's SQL function
    // Note: This requires the service role key
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
      // If the RPC method doesn't exist, we'll need to run it differently
      console.log('⚠️  Direct SQL execution not available via API');
      console.log('📝 Please run the migration manually:\n');
      console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm');
      console.log('2. Navigate to: SQL Editor');
      console.log('3. Copy and paste the content from: supabase/migrations/20251103000000_initial_schema.sql');
      console.log('4. Click "Run" to execute the migration\n');
      console.log('✅ Migration file is ready at: supabase/migrations/20251103000000_initial_schema.sql');
      return;
    }

    const result = await response.json();
    console.log('✅ Migration executed successfully!');
    console.log('📊 Result:', result);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n📝 Manual migration steps:');
    console.log('1. Go to: https://supabase.com/dashboard/project/hqrkqsddsmjsdmwmxcrm');
    console.log('2. Open SQL Editor');
    console.log('3. Run the SQL from: supabase/migrations/20251103000000_initial_schema.sql\n');
  }
}

runMigration();
