#!/usr/bin/env node

/**
 * REGENERATE SUPABASE TYPES
 * Run: node regenerate-types.mjs
 * 
 * This will generate fresh TypeScript types from your Supabase database
 */

import { execSync } from 'child_process';

const SUPABASE_PROJECT_ID = 'nqkziafaofdejhuqwtul';

console.log('🔄 Regenerating Supabase types...\n');

try {
  // Run supabase gen types
  const command = `npx supabase gen types typescript --project-id ${SUPABASE_PROJECT_ID} > src/integrations/supabase/types.ts`;
  
  console.log(`Running: ${command}\n`);
  
  execSync(command, { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('\n✅ Supabase types generated successfully!');
  console.log('📁 File: src/integrations/supabase/types.ts');
  
} catch (error) {
  console.error('\n❌ Error generating types:', error.message);
  console.error('\nMake sure you have run CREATE_ADMIN_ACCOUNT.sql first!');
  process.exit(1);
}
