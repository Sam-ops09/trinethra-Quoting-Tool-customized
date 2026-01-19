import "dotenv/config";
import { cacheService } from "../server/services/cache.service";
import { analyticsService } from "../server/services/analytics.service";

async function verifyCache() {
  console.log("Starting Cache Verification...");

  // 1. Basic Cache Operations
  console.log("\n1. Testing Basic Cache Operations:");
  const testKey = "test-key:" + Date.now();
  const testValue = { foo: "bar", baz: 123 };

  console.log(`Setting key ${testKey}...`);
  await cacheService.set(testKey, testValue, 60);

  console.log("Getting key...");
  const retrieved = await cacheService.get(testKey);
  console.log("Retrieved:", retrieved);

  if (JSON.stringify(retrieved) === JSON.stringify(testValue)) {
    console.log("✅ Set/Get passed");
  } else {
    console.error("❌ Set/Get failed");
    process.exit(1);
  }

  console.log("Deleting key...");
  await cacheService.del(testKey);
  const deleted = await cacheService.get(testKey);
  if (deleted === null) {
    console.log("✅ Delete passed");
  } else {
    console.error("❌ Delete failed");
    process.exit(1);
  }

  // 2. Analytics Integration
  console.log("\n2. Testing Analytics Caching:");
  const start1 = Date.now();
  console.log("First call (Uncached)...");
  await analyticsService.getRevenueForecast(3);
  const dur1 = Date.now() - start1;
  console.log(`First call took ${dur1}ms`);

  const start2 = Date.now();
  console.log("Second call (Should be Cached)...");
  await analyticsService.getRevenueForecast(3);
  const dur2 = Date.now() - start2;
  console.log(`Second call took ${dur2}ms`);

  if (dur2 < dur1) { // Basic heuristic, not guaranteed locally if DB is super fast, but logic holds
     console.log("✅ Second call was faster (likely cached)");
  } else {
     console.log("⚠️ Second call was not faster (DB might be very fast or caching failed)");
  }
  
  // Verify cache key exists
  const forecastKey = "analytics:forecast:3";
  const cachedForecast = await cacheService.get(forecastKey);
  if (cachedForecast) {
    console.log("✅ Cache key 'analytics:forecast:3' exists");
  } else {
    console.error("❌ Analytics cache key missing");
  }

  console.log("\n✓ Verification Complete!");
  process.exit(0);
}

verifyCache().catch(console.error);
