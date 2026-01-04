#!/usr/bin/env tsx

/**
 * Migration Script: Update User Roles
 *
 * This script migrates users from old roles to new business-specific roles.
 * Must be run BEFORE schema push.
 */

// Load environment variables FIRST
import * as dotenv from "dotenv";
dotenv.config();

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in environment variables");
  console.error("   Please ensure .env file exists and contains DATABASE_URL\n");
  process.exit(1);
}

import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function migrateUserRoles() {
  console.log("🔄 Starting user role migration...\n");

  try {
    // Step 1: Check current users and their roles
    console.log("📊 Checking current user roles...");
    const currentUsers = await db.execute(sql`
      SELECT id, email, name, role FROM users ORDER BY created_at
    `);

    console.log(`Found ${currentUsers.rows.length} users:\n`);
    currentUsers.rows.forEach((user: any) => {
      console.log(`  - ${user.email}: ${user.role}`);
    });
    console.log("");

    // Step 2: Show what will change
    console.log("⚠️  This will update user roles as follows:");
    console.log("  - 'admin' → 'admin' (no change)");
    console.log("  - 'manager' → 'sales_manager'");
    console.log("  - 'user' → 'sales_executive'");
    console.log("  - 'viewer' → 'viewer' (no change)");
    console.log("");

    // Check if running in non-interactive mode
    if (process.argv.includes('--yes') || process.argv.includes('-y')) {
      console.log("🚀 Auto-confirming migration (--yes flag detected)...\n");
    } else {
      console.log("⏭️  Proceeding with migration...\n");
    }

    // Step 3: Create temporary column
    console.log("1️⃣  Creating temporary role column...");
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role_new TEXT
    `);
    console.log("   ✅ Temporary column created\n");

    // Step 4: Map old roles to new roles
    console.log("2️⃣  Mapping old roles to new roles...");
    await db.execute(sql`
      UPDATE users SET role_new = CASE
        WHEN role::text = 'admin' THEN 'admin'
        WHEN role::text = 'manager' THEN 'sales_manager'
        WHEN role::text = 'user' THEN 'sales_executive'
        WHEN role::text = 'viewer' THEN 'viewer'
        ELSE 'sales_executive'
      END
      WHERE role_new IS NULL
    `);
    console.log("   ✅ Users mapped to new roles\n");

    // Step 5: Drop old column and rename new one
    console.log("3️⃣  Replacing old role column...");
    await db.execute(sql`ALTER TABLE users DROP COLUMN role`);
    await db.execute(sql`ALTER TABLE users RENAME COLUMN role_new TO role`);
    console.log("   ✅ Role column updated\n");

    // Step 6: Verify migration
    console.log("4️⃣  Verifying migration...");
    const updatedUsers = await db.execute(sql`
      SELECT id, email, name, role FROM users ORDER BY created_at
    `);

    console.log(`\nMigrated ${updatedUsers.rows.length} users:\n`);
    updatedUsers.rows.forEach((user: any) => {
      console.log(`  ✅ ${user.email}: ${user.role}`);
    });
    console.log("");

    console.log("✅ User role migration completed successfully!\n");
    console.log("📝 Next steps:");
    console.log("   1. Run: pnpm run db:push");
    console.log("   2. This will update the enum with new role values");
    console.log("   3. Restart your application\n");

    process.exit(0);

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    console.error("\n⚠️  Your database has not been modified.");
    console.error("   Please fix the error and try again.\n");

    process.exit(1);
  }
}

// Run migration
migrateUserRoles();

