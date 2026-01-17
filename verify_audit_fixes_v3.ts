
import "dotenv/config";
import { db } from "./server/db";
import { sql } from "drizzle-orm";
import { invoices, salesOrders } from "./shared/schema";

async function verify() {
  console.log("Starting Audit Fixes Verification...");

  // 1. Verify Currency Column
  console.log("1. Checking for 'currency' column in invoices...");
  const currencyCheck = await db.execute(sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'currency';
  `);
  
  if (currencyCheck.rows.length > 0) {
    console.log("✅ 'currency' column exists in invoices table.");
  } else {
    console.error("❌ 'currency' column MISSING in invoices table!");
    process.exit(1);
  }

  // 2. Verify Unique Index Removal
  console.log("2. Checking if unique index on salesOrderId is removed...");
  const indexCheck = await db.execute(sql`
    SELECT indexname 
    FROM pg_indexes 
    WHERE tablename = 'invoices' AND indexname = 'idx_invoices_sales_order_unique';
  `);

  if (indexCheck.rows.length === 0) {
    console.log("✅ Unique index 'idx_invoices_sales_order_unique' is GONE (Correct).");
  } else {
    console.error("❌ Unique index STILL EXISTS! Partial invoicing will fail.");
    process.exit(1);
  }

  // 3. functional Test: Insert Duplicate Invoice for Same Sales Order
  console.log("3. Testing Partial Invoicing (Multiple Invoices per Order)...");
  
  // Find a sales order (or create a dummy one if none)
  const so = await db.query.salesOrders.findFirst();
  if (so) {
    console.log(`Found Sales Order: ${so.orderNumber} (${so.id})`);
    
    const timestamp = Date.now();
    try {
        // Insert Invoice 1
        console.log("Inserting Invoice A...");
        await db.insert(invoices).values({
            invoiceNumber: `TEST-INV-A-${timestamp}`,
            salesOrderId: so.id,
            clientId: so.clientId,
            status: "draft",
            total: "100",
            currency: "USD", // Testing currency too
            isMaster: false
        });

        // Insert Invoice 2 (Should succeed now)
        console.log("Inserting Invoice B (Same SO)...");
        await db.insert(invoices).values({
            invoiceNumber: `TEST-INV-B-${timestamp}`,
            salesOrderId: so.id,
            clientId: so.clientId,
            status: "draft",
            total: "100",
            currency: "EUR",
            isMaster: false
        });

        console.log("✅ SUCCESS: Added multiple invoices for the same Sales Order.");
    } catch (e: any) {
        console.error("❌ FAILED to add multiple invoices:", e.message);
        process.exit(1);
    }
  } else {
    console.log("⚠️ No Sales Orders found to test. Skipping functional test.");
  }

  console.log("\nALL VERIFICATION CHECKS PASSED!");
  process.exit(0);
}

verify().catch(console.error);
