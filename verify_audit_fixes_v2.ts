
import 'dotenv/config';
import { NumberingService } from "./server/services/numbering.service";
import { storage } from "./server/storage";

async function verifyNumberingConcurrency() {
  console.log("--- Verifying NumberingService Concurrency ---");
  const promises = [];
  const count = 20;
  
  // Reset counter to ensure clean state
  await NumberingService.setCounter("quote", 2026, 0);

  for (let i = 0; i < count; i++) {
    promises.push(NumberingService.generateQuoteNumber());
  }

  const results = await Promise.all(promises);
  console.log("Generated Numbers:", results);

  const unique = new Set(results);
  if (unique.size === count) {
    console.log("✅ SUCCESS: All 20 generated numbers are unique.");
  } else {
    console.error(`❌ FAILURE: Only ${unique.size} unique numbers generated out of ${count}. Duplicates found!`);
    process.exit(1);
  }
}

async function verifyUserSoftDelete() {
  console.log("\n--- Verifying User Soft Delete ---");
  
  // 1. Create a dummy user
  const email = `test_del_${Date.now()}@example.com`;
  const user = await storage.createUser({
    email,
    passwordHash: "hash",
    name: "Delete Test User",
    role: "viewer",
    status: "active"
  });
  console.log(`Created user ${user.id} with status: ${user.status}`);

  // 2. "Delete" the user
  await storage.deleteUser(user.id);

  // 3. Verify status is inactive
  const updatedUser = await storage.getUser(user.id);
  
  if (!updatedUser) {
    console.error("❌ FAILURE: User record was completely removed from DB!");
    process.exit(1);
  }

  if (updatedUser.status === "inactive") {
    console.log("✅ SUCCESS: User status is now 'inactive'.");
  } else {
    console.error(`❌ FAILURE: User status is '${updatedUser.status}', expected 'inactive'.`);
    process.exit(1);
  }

  // 4. Verify tokens are cleared
  if (updatedUser.refreshToken === null && updatedUser.resetToken === null) {
    console.log("✅ SUCCESS: Security tokens cleared.");
  } else {
    console.error("❌ FAILURE: Security tokens were NOT cleared.");
    process.exit(1);
  }
}

async function run() {
  try {
    await verifyNumberingConcurrency();
    await verifyUserSoftDelete();
    console.log("\n✅ ALL VERIFICATIONS PASSED");
    process.exit(0);
  } catch (error) {
    console.error("Verification failed:", error);
    process.exit(1);
  }
}

run();
