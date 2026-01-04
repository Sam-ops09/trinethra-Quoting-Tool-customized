#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);
  
  try {
    console.log('🔄 Running migration: add_tax_rates_payment_terms.sql');
    
    // Read the migration file
    const migrationPath = join(__dirname, '..', 'migrations', 'add_tax_rates_payment_terms.sql');
    const migrationSQL = await readFile(migrationPath, 'utf-8');
    
    // Execute the migration
    await sql(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('✅ payment_terms table created with default data');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

runMigration();

