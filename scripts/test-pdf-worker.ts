
import { Worker } from "worker_threads";
import path from "path";
import fs from "fs";

async function testWorker() {
    console.log("Testing PDF Worker...");
    
    // Mock Data
    const mockData = {
        quote: { 
            quoteNumber: "TEST-001", 
            quoteDate: new Date(),
            total: "1000.00",
            status: "draft",
            clientId: "client-1",
            createdBy: "user-1"
        },
        client: { name: "Test Client", email: "test@example.com" },
        items: [
            { description: "Test Item", quantity: 1, unitPrice: "1000.00", subtotal: "1000.00" }
        ],
        companyName: "Test Company",
    };

    // Use the bundled worker (mimics production / simpler for testing)
    const workerPath = path.join(process.cwd(), "dist", "workers", "pdf.worker.js");
    console.log("Worker Path:", workerPath);

    const worker = new Worker(workerPath);

    const start = Date.now();
    
    const result = await new Promise<Buffer>((resolve, reject) => {
        worker.on("message", (msg) => {
            if (msg.status === "success") {
                resolve(Buffer.from(msg.buffer));
            } else {
                reject(new Error(msg.error));
            }
            worker.terminate();
        });
        worker.on("error", (err) => {
            reject(err);
            worker.terminate();
        });
        worker.postMessage(mockData);
    });

    const duration = Date.now() - start;
    console.log(`✅ Worker returned buffer of size ${result.length} bytes in ${duration}ms`);
    
    if (result.length > 0 && result.toString('utf8', 0, 4) === '%PDF') {
        console.log("✅ Header checks out (%PDF)");
    } else {
        console.error("❌ Invalid PDF header");
        process.exit(1);
    }
}

testWorker().catch(err => {
    console.error("❌ Test Failed:", err);
    process.exit(1);
});
