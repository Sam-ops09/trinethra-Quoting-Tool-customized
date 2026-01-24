import 'dotenv/config';
import { db } from "./server/db";
import { quotes, invoices, salesOrders } from "./shared/schema";
import { count } from "drizzle-orm";

async function debugAnalytics() {
  console.log("Debugging Analytics Data...");
  
  try {
    const quoteCount = await db.select({ value: count() }).from(quotes);
    console.log(`Quotes in DB: ${quoteCount[0].value}`);

    const invoiceCount = await db.select({ value: count() }).from(invoices);
    console.log(`Invoices in DB: ${invoiceCount[0].value}`);

    const soCount = await db.select({ value: count() }).from(salesOrders);
    console.log(`Sales Orders in DB: ${soCount[0].value}`);
    
    console.log("✅ Analytics data checks completed.");
  } catch (error) {
    console.error("❌ Error checking analytics data:", error);
  }
  process.exit(0);
}

debugAnalytics();
