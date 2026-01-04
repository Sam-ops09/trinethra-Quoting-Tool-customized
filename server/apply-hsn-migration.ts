import { pool } from './db';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    console.log('📦 Applying HSN/SAC migration...');
    
    const migrationPath = path.join(process.cwd(), 'migrations', 'add_hsn_sac_codes.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    const client = await pool.connect();
    
    try {
      await client.query(migrationSQL);
      console.log('✅ HSN/SAC migration applied successfully!');
      console.log('✅ Columns added: quote_items.hsn_sac, invoice_items.hsn_sac');
    } finally {
      client.release();
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

