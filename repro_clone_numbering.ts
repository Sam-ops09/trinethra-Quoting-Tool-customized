
import 'dotenv/config';
import { storage } from "./server/storage";
import { NumberingService } from "./server/services/numbering.service";

async function run() {
  try {
    console.log("Starting Clone Numbering Reproduction...");

    // 1. Setup Custom Settings
    console.log("Setting custom numbering scheme...");
    await storage.upsertSetting({ key: "quotePrefix", value: "TEST" });
    await storage.upsertSetting({ key: "quoteFormat", value: "{PREFIX}-{YEAR}-{COUNTER:04d}" });
    
    // Reset counter to known value
    const year = new Date().getFullYear();
    await NumberingService.resetCounter("quote", year);
    await NumberingService.setCounter("quote", year, 900);
    console.log("Counter set to 900. Expecting next number: TEST-" + year + "-0901");

    // 2. Create User
    const user = await storage.getUserByEmail("demo@test.com") || await storage.createUser({
        username: "repro_user",
        email: "demo@test.com",
        passwordHash: "hash",
        role: "admin",
        name: "Repro User"
    });

    // 3. Get valid client
    let clients = await storage.getAllClients();
    let client;
    if (clients.length > 0) {
        client = clients[0];
    } else {
        client = await storage.createClient({
            name: "Repro Client",
            email: "client@repro.com",
            phone: "123",
            address: "123 St",
            createdBy: user.id
        });
    }

    // 4. Get valid template
    let templates = await storage.getAllTemplates();
    let template;
    if (templates.length > 0) {
        template = templates[0];
    } else {
        template = await storage.createTemplate({
            name: "Repro Template",
            type: "quote",
            style: "modern",
            content: "{}",
            createdBy: user.id
        });
    }

    // 5. Create Original Quote
    const originalQuote = await storage.createQuote({
      quoteNumber: "ORIG-001",
      clientId: client.id,
      templateId: template.id,
      status: "draft",
      validityDays: 30,
      total: "100",
      subtotal: "100",
      discount: "0",
      cgst: "0",
      sgst: "0",
      igst: "0",
      shippingCharges: "0",
      createdBy: user.id
    });
    
    // 6. Simulate Clone Logic
    console.log("Simulating clone...");
    const quoteNumber = await NumberingService.generateQuoteNumber();
    console.log("Generated Quote Number:", quoteNumber);

    const expected = `TEST-${year}-0901`;
    if (quoteNumber === expected) {
        console.log("SUCCESS: Numbering logic works correctly.");
    } else {
        console.error("FAILURE: Generated number does not match expected format.");
        console.error(`Expected: ${expected}`);
        console.error(`Actual:   ${quoteNumber}`);
        process.exit(1);
    }

    process.exit(0);

  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

run();
