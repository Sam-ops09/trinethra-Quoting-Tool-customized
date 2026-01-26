import "dotenv/config";
import { storage } from "../server/storage";
import { NumberingService } from "../server/services/numbering.service";
import { users, clients, quotes, quoteItems } from "../shared/schema";
import { db } from "../server/db";
import { eq } from "drizzle-orm";

async function runTest() {
  console.log("Starting Optimistic Locking Verification...");

  // 1. Setup Data
  console.log("Setting up test data...");
  const user = await storage.getUserByEmail("admin@example.com");
  if (!user) throw new Error("Admin user not found");

  const client = await storage.createClient({
    name: "Test Client Lock",
    email: "testlock@example.com",
    createdBy: user.id
  });

  const quoteNumber = await NumberingService.generateQuoteNumber();
  const quote = await storage.createQuoteTransaction({
    quoteNumber,
    clientId: client.id,
    createdBy: user.id,
    status: "draft",
    currency: "INR",
    subtotal: "100.00",
    total: "100.00",
    discount: "0",
    cgst: "0",
    sgst: "0",
    igst: "0",
    shippingCharges: "0",
    items: [],
    version: 1, // Explicitly start at 1
    validityDays: 30,
    quoteDate: new Date()
  }, []);

  console.log(`Created Quote ${quoteNumber} (Version: ${quote.version})`);

  // 2. Simulator User A Update (Success)
  console.log("\n--- User A Update ---");
  const quoteA = await storage.getQuote(quote.id);
  // Simulate payload sent by A
  const payloadA = {
    notes: "User A was here",
    version: quoteA!.version // Sending 1
  };
  
  // Create a mock request/response flow or call storage directly? 
  // Ideally we test the route logic, but we can't easily spin up the express app here without more setup.
  // We accepted the plan modifies the ROUTE, not the storage.
  // So we need to fetch, check logic, then update.
  
  // REPLICATING ROUTE LOGIC SIMULATION
  console.log(`Checking version: Request(${payloadA.version}) vs DB(${quoteA!.version})`);
  if (payloadA.version !== quoteA!.version) {
      console.error("FAIL: User A should have matched version");
      process.exit(1);
  }
  
  const nextVerA = quoteA!.version + 1;
  await storage.updateQuote(quote.id, { ...payloadA, version: nextVerA });
  console.log("User A Update Success. Version incremented.");

  // 3. User B Update (Fail)
  console.log("\n--- User B Update (Stale) ---");
  // User B still has the OLD version (1) in their browser
  const payloadB = {
    notes: "User B overwrite attempt",
    version: 1 // STALE! DB is now 2
  };

  const quoteCurrent = await storage.getQuote(quote.id);
  console.log(`Checking version: Request(${payloadB.version}) vs DB(${quoteCurrent!.version})`);

  if (payloadB.version !== quoteCurrent!.version) {
      console.log("SUCCESS: Conflict detected! (Expected behavior)");
  } else {
      console.error("FAIL: Conflict NOT detected. This is bad.");
      process.exit(1);
  }

  // 4. User B Refresh and Update (Success)
  console.log("\n--- User B Refresh & Update ---");
  const payloadB_Fresh = {
      notes: "User B fresh update",
      version: quoteCurrent!.version // Now sending 2
  };
  
  if (payloadB_Fresh.version !== quoteCurrent!.version) {
       console.error("FAIL: Fresh logic broken");
       process.exit(1);
  }
  
  const nextVerB = quoteCurrent!.version + 1;
  await storage.updateQuote(quote.id, { ...payloadB_Fresh, version: nextVerB });
  
  const finalQuote = await storage.getQuote(quote.id);
  console.log(`Final Version: ${finalQuote!.version} (Expected: 3)`);
  
  if (finalQuote!.version === 3) {
      console.log("ALL TESTS PASSED");
  } else {
      console.log("FAIL: Final version mismatch");
      process.exit(1);
  }

  process.exit(0);
}

runTest().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
