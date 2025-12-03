import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hqrkqsddsmjsdmwmxcrm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxcmtxc2Rkc21qc2Rtd214Y3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMzY3NTksImV4cCI6MjA3NzcxMjc1OX0.Oa_rw84APi1HdqJxZ7xezNs0iP-yEfW4RUvos4zF0yQ';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('⚠️  Cannot alter table structure via anon API key');
console.log('\n📋 Please run this SQL in Supabase Dashboard > SQL Editor:\n');
console.log('─'.repeat(60));
console.log(`
-- Option 1: Make employee_username nullable
ALTER TABLE public.attendance 
ALTER COLUMN employee_username DROP NOT NULL;

-- Option 2: Drop the column entirely (recommended)
ALTER TABLE public.attendance 
DROP COLUMN IF EXISTS employee_username;

-- Verify
SELECT 'Fixed!' as status;
`);
console.log('─'.repeat(60));
console.log('\nAfter running the SQL, the attendance feature will work correctly.');
