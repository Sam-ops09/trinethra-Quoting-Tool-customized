/**
 * Workflow Automation Routes
 * 
 * API endpoints for workflow management and execution
 */

import { Router, Response } from "express";
import { authMiddleware, type AuthRequest } from "../middleware";
import { requirePermission } from "../permissions-middleware";
import { requireFeature } from "../feature-flags-middleware";
import { storage } from "../storage";
import { WorkflowService } from "../services/workflow.service";
import { WorkflowEngine } from "../services/workflow-engine.service";
import { logger } from "../utils/logger";

const router = Router();

// Apply workflow module feature flag to all routes
router.use(requireFeature("workflows_module"));

/**
 * GET /api/workflows
 * Get all workflows
 */
router.get("/", authMiddleware, requirePermission("settings", "view"), async (req: AuthRequest, res: Response) => {
  try {
    const workflows = await storage.getAllWorkflows();
    res.json(workflows);
  } catch (error: any) {
    logger.error("[WorkflowRoutes] Error fetching workflows:", error);
    res.status(500).json({ error: "Failed to fetch workflows" });
  }
});

/**
 * GET /api/workflows/entity/:entityType
 * Get workflows for a specific entity type
 */
router.get("/entity/:entityType", authMiddleware, requirePermission("settings", "view"), async (req: AuthRequest, res: Response) => {
  try {
    const { entityType } = req.params;
    const workflows = await storage.getWorkflowsByEntity(entityType);
    res.json(workflows);
  } catch (error: any) {
    logger.error("[WorkflowRoutes] Error fetching workflows by entity:", error);
    res.status(500).json({ error: "Failed to fetch workflows" });
  }
});

/**
 * GET /api/workflows/:id
 * Get workflow details with triggers and actions
 */
router.get("/:id", authMiddleware, requirePermission("settings", "view"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const workflowData = await WorkflowService.getWorkflowComplete(id);
    
    if (!workflowData.workflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }

    res.json(workflowData);
  } catch (error: any) {
    logger.error("[WorkflowRoutes] Error fetching workflow:", error);
    res.status(500).json({ error: "Failed to fetch workflow" });
  }
});

/**
 * POST /api/workflows
 * Create a new workflow
 */
router.post("/", authMiddleware, requirePermission("settings", "create"), async (req: AuthRequest, res: Response) => {
  try {
    const { workflow, triggers, actions, schedule } = req.body;

    // Validate request
    if (!workflow || !triggers || !actions) {
      return res.status(400).json({ 
        error: "Missing required fields: workflow, triggers, and actions are required" 
      });
    }

    // Validate workflow configuration
    const validation = WorkflowService.validateWorkflowConfig({ triggers, actions });
    if (!validation.isValid) {
      return res.status(400).json({ error: "Invalid workflow configuration", details: validation.errors });
    }

    // Add createdBy from authenticated user
    const workflowWithUser = {
      ...workflow,
      createdBy: req.user!.id,
    };

    // Create workflow
    const result = await WorkflowService.createWorkflow({
      workflow: workflowWithUser,
      triggers,
      actions,
      schedule,
    });

    logger.info(`[WorkflowRoutes] Created workflow: ${result.workflow.id} by user ${req.user!.id}`);
    
    res.status(201).json(result);
  } catch (error: any) {
    logger.error("[WorkflowRoutes] Error creating workflow:", error);
    res.status(500).json({ error: "Failed to create workflow", details: error.message });
  }
});

/**
 * PATCH /api/workflows/:id
 * Update a workflow
 */
router.patch("/:id", authMiddleware, requirePermission("settings", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { workflow, triggers, actions } = req.body;

    // Check if workflow exists
    const existing = await storage.getWorkflow(id);
    if (!existing) {
      return res.status(404).json({ error: "Workflow not found" });
    }

    // Validate if triggers and actions are provided
    if (triggers && actions) {
      const validation = WorkflowService.validateWorkflowConfig({ triggers, actions });
      if (!validation.isValid) {
        return res.status(400).json({ error: "Invalid workflow configuration", details: validation.errors });
      }
    }

    // Update workflow
    const result = await WorkflowService.updateWorkflow(id, {
      workflow,
      triggers,
      actions,
    });

    logger.info(`[WorkflowRoutes] Updated workflow: ${id} by user ${req.user!.id}`);
    
    res.json(result);
  } catch (error: any) {
    logger.error("[WorkflowRoutes] Error updating workflow:", error);
    res.status(500).json({ error: "Failed to update workflow", details: error.message });
  }
});

/**
 * DELETE /api/workflows/:id
 * Delete a workflow (soft delete)
 */
router.delete("/:id", authMiddleware, requirePermission("settings", "delete"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if workflow exists
    const existing = await storage.getWorkflow(id);
    if (!existing) {
      return res.status(404).json({ error: "Workflow not found" });
    }

    // Delete workflow
    await WorkflowService.deleteWorkflow(id);

    logger.info(`[WorkflowRoutes] Deleted workflow: ${id} by user ${req.user!.id}`);
    
    res.json({ message: "Workflow deleted successfully" });
  } catch (error: any) {
    logger.error("[WorkflowRoutes] Error deleting workflow:", error);
    res.status(500).json({ error: "Failed to delete workflow" });
  }
});

/**
 * POST /api/workflows/:id/toggle
 * Toggle workflow active status
 */
router.post("/:id/toggle", authMiddleware, requirePermission("settings", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "isActive must be a boolean" });
    }

    const updated = await WorkflowService.toggleWorkflowStatus(id, isActive);
    
    if (!updated) {
      return res.status(404).json({ error: "Workflow not found" });
    }

    logger.info(`[WorkflowRoutes] Toggled workflow ${id} to ${isActive ? 'active' : 'inactive'} by user ${req.user!.id}`);
    
    res.json(updated);
  } catch (error: any) {
    logger.error("[WorkflowRoutes] Error toggling workflow:", error);
    res.status(500).json({ error: "Failed to toggle workflow status" });
  }
});

/**
 * POST /api/workflows/:id/test
 * Test workflow execution (simulation mode)
 */
router.post("/:id/test", authMiddleware, requirePermission("settings", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { testData } = req.body;

    if (!testData) {
      return res.status(400).json({ error: "testData is required for simulation" });
    }

    const workflow = await storage.getWorkflow(id);
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }

    // Test trigger evaluation
    const triggers = await storage.getWorkflowTriggers(id);
    const triggerResults = triggers.map((trigger) => {
      // Evaluate each trigger with test data
      return {
        triggerId: trigger.id,
        triggerType: trigger.triggerType,
        conditions: trigger.conditions,
        result: "Test evaluation - implement trigger evaluation here",
      };
    });

    // Get actions that would execute
    const actions = await storage.getWorkflowActions(id);

    logger.info(`[WorkflowRoutes] Tested workflow: ${id} by user ${req.user!.id}`);
    
    res.json({
      workflow,
      triggerResults,
      actions,
      note: "Test mode - no actual actions were executed",
    });
  } catch (error: any) {
    logger.error("[WorkflowRoutes] Error testing workflow:", error);
    res.status(500).json({ error: "Failed to test workflow" });
  }
});

/**
 * POST /api/workflows/:id/execute
 * Manually execute a workflow
 */
router.post("/:id/execute", authMiddleware, requirePermission("settings", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { entityId, entityType } = req.body;

    if (!entityId || !entityType) {
      return res.status(400).json({ error: "entityId and entityType are required" });
    }

    const workflow = await storage.getWorkflow(id);
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }

    // Trigger workflow manually
    await WorkflowEngine.triggerWorkflows(entityType, entityId, {
      eventType: "manual",
      entity: req.body.entity || {},
      triggeredBy: `user:${req.user!.id}`,
    });

    logger.info(`[WorkflowRoutes] Manually executed workflow: ${id} by user ${req.user!.id}`);
    
    res.json({ message: "Workflow execution triggered successfully" });
  } catch (error: any) {
    logger.error("[WorkflowRoutes] Error executing workflow:", error);
    res.status(500).json({ error: "Failed to execute workflow" });
  }
});

/**
 * GET /api/workflows/:id/executions
 * Get execution history for a workflow
 */
router.get("/:id/executions", authMiddleware, requirePermission("settings", "view"), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const executions = await storage.getWorkflowExecutions(id);
    res.json(executions);
  } catch (error: any) {
    logger.error("[WorkflowRoutes] Error fetching workflow executions:", error);
    res.status(500).json({ error: "Failed to fetch workflow executions" });
  }
});

/**
 * GET /api/workflows/executions/entity/:entityType/:entityId
 * Get all workflow executions for a specific entity
 */
router.get("/executions/entity/:entityType/:entityId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { entityType, entityId } = req.params;
    const executions = await storage.getEntityWorkflowExecutions(entityType, entityId);
    res.json(executions);
  } catch (error: any) {
    logger.error("[WorkflowRoutes] Error fetching entity workflow executions:", error);
    res.status(500).json({ error: "Failed to fetch executions" });
  }
});

export default router;
