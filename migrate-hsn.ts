-- Quick migration to add HSN/SAC columns
-- Run this with: npx tsx migrate-hsn.ts

import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('🔧 Adding HSN/SAC columns...');
  
  try {
    // Add to quote_items
    await db.execute(sql`
      ALTER TABLE quote_items 
      ADD COLUMN IF NOT EXISTS hsn_sac VARCHAR(10);
    `);
    console.log('✅ Added hsn_sac to quote_items');
    
    // Add to invoice_items  
    await db.execute(sql`
      ALTER TABLE invoice_items 
      ADD COLUMN IF NOT EXISTS hsn_sac VARCHAR(10);
    `);
    console.log('✅ Added hsn_sac to invoice_items');
    
    console.log('🎉 Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();

