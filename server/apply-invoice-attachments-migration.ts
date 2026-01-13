import { pool } from './db';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    console.log('📦 Applying invoice_attachments migration...');
    
    const migrationPath = path.join(process.cwd(), 'migrations', 'add_invoice_attachments_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    const client = await pool.connect();
    
    try {
      await client.query(migrationSQL);
      console.log('✅ invoice_attachments migration applied successfully!');
      console.log('✅ Table created: invoice_attachments');
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
