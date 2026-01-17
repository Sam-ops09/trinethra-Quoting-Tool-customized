
import 'dotenv/config';
import { storage } from "./server/storage";
import { NumberingService } from "./server/services/numbering.service";

async function run() {
  try {
    console.log("Checking Current Settings...");
    const prefix = await storage.getSetting("quotePrefix");
    const format = await storage.getSetting("quoteFormat");
    console.log("quotePrefix:", prefix?.value);
    console.log("quoteFormat:", format?.value);

    console.log("Checking Counters...");
    const year = new Date().getFullYear();
    const counter = await NumberingService.getCounter("quote", year);
    console.log(`quote_counter_${year}:`, counter);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

run();
