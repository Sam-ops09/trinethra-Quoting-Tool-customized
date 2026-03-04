import { db } from "./server/db";
import { clients, quotes, invoices, products } from "./shared/schema";
import { ilike, or } from "drizzle-orm";

async function main() {
  const searchTerm = "%a%";
  console.log("Searching for:", searchTerm);
  
  const clientResults = await db.select().from(clients).where(or(ilike(clients.name, searchTerm), ilike(clients.email, searchTerm))).limit(5);
  console.log("Clients found:", clientResults.length, clientResults.map(c => c.name));

  const quoteResults = await db.select().from(quotes).limit(5);
  console.log("Total Quotes in DB:", quoteResults.length);

  process.exit(0);
}

main().catch(console.error);
