#!/usr/bin/env node

/**
 * Check Activity Logs in Database
 */

import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config();

async function checkActivityLogs() {
  console.log('🔍 Checking activity logs in database...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Get activity logs count
    const countResult = await sql`SELECT COUNT(*) as count FROM activity_logs`;
    const count = parseInt(countResult[0].count);

    console.log(`📊 Total activity logs: ${count}\n`);

    if (count === 0) {
      console.log('⚠️  No activity logs found in database!');
      console.log('');
      console.log('💡 Activity logs are created when users perform actions like:');
      console.log('   - Creating/editing quotes');
      console.log('   - Approving quotes');
      console.log('   - Creating invoices');
      console.log('   - Recording payments');
      console.log('   - Etc.');
      console.log('');
      console.log('📝 Try performing some actions in the app to generate logs.');
      return;
    }

    // Get recent logs
    const logs = await sql`
      SELECT 
        id,
        user_id,
        action,
        entity_type,
        entity_id,
        timestamp
      FROM activity_logs 
      ORDER BY timestamp DESC 
      LIMIT 10
    `;

    console.log('📋 Recent activity logs:');
    console.log('');

    for (const log of logs) {
      const timeAgo = new Date(log.timestamp).toLocaleString();
      console.log(`  ✓ ${log.action}`);
      console.log(`    Entity: ${log.entity_type} ${log.entity_id || '(no ID)'}`);
      console.log(`    User: ${log.user_id}`);
      console.log(`    Time: ${timeAgo}`);
      console.log('');
    }

    console.log('✅ Activity logs are present in the database!');
    console.log(`   Total: ${count} logs`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkActivityLogs().catch(console.error);

