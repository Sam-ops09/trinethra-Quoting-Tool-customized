
import { db } from "../server/db";
import { clients } from "../shared/schema";

async function main() {
  console.log("Fetching client addresses...");
  const allClients = await db.select().from(clients);
  
  if (allClients.length === 0) {
    console.log("No clients found.");
    return;
  }

  console.log(`Found ${allClients.length} clients.`);
  allClients.forEach(c => {
    console.log(`ID: ${c.id}`);
    console.log(`Name: ${c.name}`);
    console.log(`Billing: "${c.billingAddress}"`);
    console.log(`Shipping: "${c.shippingAddress}"`);
    console.log("-------------------");
  });
  process.exit(0);
}

main().catch(console.error);
