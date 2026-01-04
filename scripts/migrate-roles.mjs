#!/usr/bin/env node

/**
 * Database Migration Script: Update User Roles
 * This script safely migrates user roles from old to new enum values
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, sql } from 'drizzle-orm';
import { pgTable, text, varchar } from 'drizzle-orm/pg-core';

// Load environment variables
config();

// Simplified users table definition for migration
const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: text("email").notNull(),
  role: text("role").notNull(),
});

async function migrateRoles() {
  console.log('🔄 Starting user role migration...\n');

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.error('   Please set it in your .env file\n');
    process.exit(1);
  }

  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    const connection = neon(process.env.DATABASE_URL);
    const db = drizzle(connection);
    console.log('✅ Connected successfully\n');

    // Check current users using raw SQL to avoid schema issues
    console.log('📊 Checking current user roles...');
    const result = await connection`SELECT id, email, role FROM users ORDER BY created_at`;

    if (result.length === 0) {
      console.log('ℹ️  No users found in database');
      console.log('✅ Migration complete (nothing to migrate)\n');
      return;
    }

    console.log(`Found ${result.length} user(s):\n`);
    result.forEach(user => {
      console.log(`  - ${user.email}: ${user.role}`);
    });
    console.log('');

    // Check if any users need migration
    const usersToMigrate = result.filter(user =>
      user.role === 'user' || user.role === 'manager'
    );

    if (usersToMigrate.length === 0) {
      console.log('✅ All users already have valid roles');
      console.log('✅ Migration complete (nothing to migrate)\n');
      return;
    }

    console.log(`⚠️  Found ${usersToMigrate.length} user(s) that need migration:\n`);
    usersToMigrate.forEach(user => {
      const newRole = user.role === 'manager' ? 'sales_manager' : 'sales_executive';
      console.log(`  - ${user.email}: ${user.role} → ${newRole}`);
    });
    console.log('');

    // In non-interactive mode or with --yes flag, proceed automatically
    const shouldProceed = process.argv.includes('--yes') || process.argv.includes('-y');

    if (!shouldProceed) {
      console.log('⚠️  This script would update user roles automatically.');
      console.log('   Run with --yes flag to proceed:\n');
      console.log('   npm run migrate:roles -- --yes\n');
      return;
    }

    console.log('🚀 Starting migration...\n');

    // Migrate users using raw SQL
    let migratedCount = 0;
    for (const user of usersToMigrate) {
      const newRole = user.role === 'manager' ? 'sales_manager' : 'sales_executive';

      try {
        await connection`
          UPDATE users 
          SET role = ${newRole}
          WHERE id = ${user.id}
        `;

        console.log(`  ✅ Migrated ${user.email}: ${user.role} → ${newRole}`);
        migratedCount++;
      } catch (error) {
        console.error(`  ❌ Failed to migrate ${user.email}:`, error.message);
      }
    }

    console.log('');
    console.log(`✅ Migration complete! Updated ${migratedCount} user(s)\n`);

    // Show final state
    console.log('📊 Final user roles:');
    const updatedUsers = await connection`SELECT email, role FROM users ORDER BY created_at`;

    updatedUsers.forEach(user => {
      console.log(`  - ${user.email}: ${user.role}`);
    });
    console.log('');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run migration
migrateRoles().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

