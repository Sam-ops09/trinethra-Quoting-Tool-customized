
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Cleaning up duplicate Sales Orders (keeping oldest)...");
  try {
    // Delete duplicates properly
    await db.execute(sql`
      DELETE FROM sales_orders a
      USING sales_orders b
      WHERE a.id > b.id 
      AND a.quote_id = b.quote_id;
    `);
    console.log("✅ Success: Duplicates removed.");

    console.log("Adding unique index to sales_orders...");
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_orders_quote_unique 
      ON sales_orders (quote_id);
    `);
    console.log("✅ Success: Unique index added to sales_orders(quote_id).");
  } catch (error) {
    console.error("❌ Failed:", error);
    process.exit(1);
  }
  process.exit(0);
}

main();
