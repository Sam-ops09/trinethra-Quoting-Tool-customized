
import 'dotenv/config';
import { db } from "../server/db";
import { storage } from "../server/storage";
import * as schema from "../shared/schema";
import { sql, desc } from "drizzle-orm";

async function syncCounters() {
    console.log("Syncing counters...");
    const year = new Date().getFullYear();

    // 1. Quotes
    const quotes = await db.select().from(schema.quotes).orderBy(desc(schema.quotes.createdAt));
    let maxQuoteNum = 0;
    for (const q of quotes) {
        const match = q.quoteNumber.match(/(\d+)$/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num < 1000000 && num > maxQuoteNum) {
                maxQuoteNum = num;
            }
        }
    }
    if (maxQuoteNum > 0) {
        console.log(`Found max reasonable quote number: ${maxQuoteNum}`);
        await updateCounter("quote", year, maxQuoteNum);
    }

    // 2. Sales Orders
    const sos = await db.select().from(schema.salesOrders).orderBy(desc(schema.salesOrders.createdAt));
    let maxSoNum = 0;
    for (const so of sos) {
        const match = so.orderNumber.match(/(\d+)$/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num < 1000000 && num > maxSoNum) {
                maxSoNum = num;
            }
        }
    }
    if (maxSoNum > 0) {
        console.log(`Found max reasonable SO number: ${maxSoNum}`);
        await updateCounter("sales_order", year, maxSoNum);
    }

    // 3. Invoices
    const invs = await db.select().from(schema.invoices).orderBy(desc(schema.invoices.createdAt));
    let maxInvNum = 0;
    for (const inv of invs) {
        const match = inv.invoiceNumber.match(/(\d+)$/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num < 1000000 && num > maxInvNum) {
                maxInvNum = num;
            }
        }
    }
    if (maxInvNum > 0) {
        console.log(`Found max reasonable Invoice number: ${maxInvNum}`);
        await updateCounter("invoice", year, maxInvNum);
    }

    console.log("Counters synced.");
    process.exit(0);
}

async function updateCounter(type: string, year: number, val: number) {
    const key = `${type}_counter_${year}`;
    // We set it to 'val'. The next increment will likely be val+1 (because getAndIncrement upserts then increments? 
    // No, getAndIncrement does: INSERT ... DO UPDATE SET value = value + 1 RETURNING value.
    // So if we set it to 'val', next call returns 'val + 1'. Correct.
    
    await db.execute(sql`
        INSERT INTO settings (id, key, value, updated_at)
        VALUES (${sql`gen_random_uuid()`}, ${key}, ${String(val)}, NOW())
        ON CONFLICT (key) DO UPDATE
        SET value = ${String(val)}, updated_at = NOW()
    `);
    console.log(`Updated ${key} to ${val}`);
}

syncCounters().catch(console.error);
