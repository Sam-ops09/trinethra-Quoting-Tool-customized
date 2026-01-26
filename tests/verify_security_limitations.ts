
import "dotenv/config";
import { WorkflowEngine } from "../server/services/workflow-engine.service";
import { storage } from "../server/storage";
import { logger } from "../server/utils/logger";

// Mock logger to suppress error output during expected failures
const originalError = logger.error;
const originalWarn = logger.warn;

async function runTest() {
  console.log("Starting Security & Scheduling Verification...");

  try {
    // 1. Test Safe Evaluation
    console.log("\n--- Test 1: Safe Condition Evaluation ---");
    // We need to access the private method evaluateActionCondition via type casting or just trust the triggering mechanism
    // Let's use the public triggerWorkflows method and observe logic
    
    // We'll mock storage to return a workflow with specific conditions
    const REF_ID = "security_test_" + Date.now();
    
    // Mock Data
    const mockContext = {
      eventType: "status_change",
      oldValue: "draft",
      newValue: "approved",
      entity: { 
          id: REF_ID,
          entityType: "quote",
          total: 1000,
          status: "approved",
          isVip: true 
      }
    };

    // Access generic private method for testing purposes (in JS/TS we can cast to any)
    const engine = WorkflowEngine as any;
    
    // Check valid condition
    const validCondition = "{{total}} > 500";
    const result1 = engine.evaluateActionCondition(validCondition, mockContext);
    console.log(`Condition "${validCondition}" result:`, result1);
    if(result1 !== true) throw new Error("Valid condition failed");

    // Check valid boolean condition
    const validBool = "{{isVip}} == true";
    const result2 = engine.evaluateActionCondition(validBool, mockContext);
    console.log(`Condition "${validBool}" result:`, result2);
    if(result2 !== true) throw new Error("Valid boolean condition failed");
    
    // 2. Test Unsafe Evaluation (RCE Attempt)
    console.log("\n--- Test 2: RCE Prevention ---");
    const rceCondition = "process.exit(1)";
    // Suppress logs for this expected error
    logger.error = () => {}; 
    logger.warn = () => {};

    const resultRCE = engine.evaluateActionCondition(rceCondition, mockContext);
    
    // Restore logs
    logger.error = originalError;
    logger.warn = originalWarn;

    console.log(`Condition "${rceCondition}" result:`, resultRCE);
    
    if (resultRCE === true) {
        throw new Error("CRITICAL: RCE Condition evaluated to true!");
    }
    // If it threw an error inside, it returns false, which is good.
    // If it executed process.exit(1), the test would have died silently.
    console.log("SUCCESS: RCE attempt failed (returned false).");


    // 3. Test Scheduling
    console.log("\n--- Test 3: Cron Calculation ---");
    // Method is private, access via checking update side effects
    
    const user = await storage.getUserByEmail("admin@example.com");
    if (!user) throw new Error("Admin user not found for test");

    // Create a dummy schedule
    // Need a valid workflow first
    const wf = await storage.createWorkflow({
        name: "Schedule Test Workflow",
        entityType: "quote",
        triggerLogic: "AND",
        isActive: true,
        createdBy: user.id
    });

    const schedule = await storage.createWorkflowSchedule({
        workflowId: wf.id,
        cronExpression: "0 0 * * *", // Daily at midnight
        isActive: true,
        createdBy: user.id
    });
    
    // Manually trigger the update logic by mocking the current time or nextRunAt
    // But calculateNextRun is private. Let's cast to any again.
    const cronExpr = "0 * * * *"; // Hourly
    const nextRun = engine.calculateNextRun(cronExpr);
    
    console.log(`Cron "${cronExpr}" generic next run:`, nextRun);
    
    if (!(nextRun instanceof Date) || isNaN(nextRun.getTime())) {
        throw new Error("calculateNextRun returned invalid date");
    }
    
    const now = new Date();
    // Next run should be within 1 hour from now
    const diff = nextRun.getTime() - now.getTime();
    if (diff <= 0 || diff > 60 * 60 * 1000 + 1000) {
        throw new Error(`Calculated next run is suspiciously far or past: ${nextRun}`);
    }
    
    console.log("SUCCESS: Cron calculation works.");
    
    // Clean up
    await storage.deleteWorkflowSchedule(schedule.workflowId); // Logic might differ, but assuming implementation
    console.log("\nALL TESTS PASSED.");

  } catch (e: any) {
    console.error("TEST FAILED:", e);
    process.exit(1);
  }
}

runTest();
