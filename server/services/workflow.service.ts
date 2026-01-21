/**
 * Workflow Service
 * 
 * Handles workflow creation, updating, and management operations.
 * This service provides CRUD operations for workflows, triggers, and actions.
 */

import { storage } from "../storage";
import { logger } from "../utils/logger";
import type {
  Workflow,
  InsertWorkflow,
  WorkflowTrigger,
  InsertWorkflowTrigger,
  WorkflowAction,
  InsertWorkflowAction,
  WorkflowSchedule,
  InsertWorkflowSchedule,
} from "@shared/schema";

export class WorkflowService {
  /**
   * Create a complete workflow with triggers and actions
   */
  static async createWorkflow(data: {
    workflow: Omit<InsertWorkflow, "createdBy"> & { createdBy: string };
    triggers: Omit<InsertWorkflowTrigger, "workflowId">[];
    actions: Omit<InsertWorkflowAction, "workflowId">[];
    schedule?: Omit<InsertWorkflowSchedule, "workflowId">;
  }): Promise<{ workflow: Workflow; triggers: WorkflowTrigger[]; actions: WorkflowAction[] }> {
    try {
      // Create workflow
      const workflow = await storage.createWorkflow(data.workflow);
      logger.info(`[WorkflowService] Created workflow: ${workflow.id} (${workflow.name})`);

      // Create triggers
      const triggers: WorkflowTrigger[] = [];
      for (const trigger of data.triggers) {
        const created = await storage.createWorkflowTrigger({
          ...trigger,
          workflowId: workflow.id,
        });
        triggers.push(created);
      }
      logger.info(`[WorkflowService] Created ${triggers.length} triggers for workflow ${workflow.id}`);

      // Create actions
      const actions: WorkflowAction[] = [];
      for (const action of data.actions) {
        const created = await storage.createWorkflowAction({
          ...action,
          workflowId: workflow.id,
        });
        actions.push(created);
      }
      logger.info(`[WorkflowService] Created ${actions.length} actions for workflow ${workflow.id}`);

      // Create schedule if provided
      if (data.schedule) {
        await storage.createWorkflowSchedule({
          ...data.schedule,
          workflowId: workflow.id,
        });
        logger.info(`[WorkflowService] Created schedule for workflow ${workflow.id}`);
      }

      return { workflow, triggers, actions };
    } catch (error) {
      logger.error(`[WorkflowService] Error creating workflow:`, error);
      throw error;
    }
  }

  /**
   * Update workflow with new triggers and actions
   */
  static async updateWorkflow(
    workflowId: string,
    data: {
      workflow?: Partial<Workflow>;
      triggers?: Omit<InsertWorkflowTrigger, "workflowId">[];
      actions?: Omit<InsertWorkflowAction, "workflowId">[];
    }
  ): Promise<{ workflow?: Workflow; triggers?: WorkflowTrigger[]; actions?: WorkflowAction[] }> {
    try {
      const result: { workflow?: Workflow; triggers?: WorkflowTrigger[]; actions?: WorkflowAction[] } = {};

      // Update workflow if provided
      if (data.workflow) {
        result.workflow = await storage.updateWorkflow(workflowId, data.workflow);
        logger.info(`[WorkflowService] Updated workflow: ${workflowId}`);
      }

      // Update triggers if provided (delete old, create new)
      if (data.triggers) {
        await storage.deleteWorkflowTriggers(workflowId);
        const triggers: WorkflowTrigger[] = [];
        for (const trigger of data.triggers) {
          const created = await storage.createWorkflowTrigger({
            ...trigger,
            workflowId,
          });
          triggers.push(created);
        }
        result.triggers = triggers;
        logger.info(`[WorkflowService] Updated ${triggers.length} triggers for workflow ${workflowId}`);
      }

      // Update actions if provided (delete old, create new)
      if (data.actions) {
        await storage.deleteWorkflowActions(workflowId);
        const actions: WorkflowAction[] = [];
        for (const action of data.actions) {
          const created = await storage.createWorkflowAction({
            ...action,
            workflowId,
          });
          actions.push(created);
        }
        result.actions = actions;
        logger.info(`[WorkflowService] Updated ${actions.length} actions for workflow ${workflowId}`);
      }

      return result;
    } catch (error) {
      logger.error(`[WorkflowService] Error updating workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Get complete workflow with triggers and actions
   */
  static async getWorkflowComplete(workflowId: string): Promise<{
    workflow: Workflow | undefined;
    triggers: WorkflowTrigger[];
    actions: WorkflowAction[];
    schedule?: WorkflowSchedule;
  }> {
    try {
      const workflow = await storage.getWorkflow(workflowId);
      if (!workflow) {
        return {
          workflow: undefined,
          triggers: [],
          actions: [],
        };
      }

      const triggers = await storage.getWorkflowTriggers(workflowId);
      const actions = await storage.getWorkflowActions(workflowId);
      const schedule = await storage.getWorkflowSchedule(workflowId);

      return {
        workflow,
        triggers,
        actions,
        schedule,
      };
    } catch (error) {
      logger.error(`[WorkflowService] Error getting workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Delete workflow (soft delete - sets status to inactive)
   */
  static async deleteWorkflow(workflowId: string): Promise<void> {
    try {
      await storage.deleteWorkflow(workflowId);
      logger.info(`[WorkflowService] Deleted workflow: ${workflowId}`);
    } catch (error) {
      logger.error(`[WorkflowService] Error deleting workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Get all active workflows for a specific entity type
   */
  static async getActiveWorkflowsForEntity(entityType: string): Promise<Workflow[]> {
    try {
      return await storage.getActiveWorkflows(entityType);
    } catch (error) {
      logger.error(`[WorkflowService] Error getting active workflows for ${entityType}:`, error);
      throw error;
    }
  }

  /**
   * Toggle workflow status (active/inactive)
   */
  static async toggleWorkflowStatus(workflowId: string, isActive: boolean): Promise<Workflow | undefined> {
    try {
      const status = isActive ? "active" : "inactive";
      const updated = await storage.updateWorkflow(workflowId, { status });
      logger.info(`[WorkflowService] Set workflow ${workflowId} status to ${status}`);
      return updated;
    } catch (error) {
      logger.error(`[WorkflowService] Error toggling workflow status:`, error);
      throw error;
    }
  }

  /**
   * Validate workflow configuration
   * Ensures triggers and actions are properly configured
   */
  static validateWorkflowConfig(data: {
    triggers: Omit<InsertWorkflowTrigger, "workflowId">[];
    actions: Omit<InsertWorkflowAction, "workflowId">[];
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate triggers
    if (data.triggers.length === 0) {
      errors.push("Workflow must have at least one trigger");
    }

    for (const trigger of data.triggers) {
      if (!trigger.triggerType) {
        errors.push("Trigger must have a type");
      }
      if (!trigger.conditions || Object.keys(trigger.conditions).length === 0) {
        errors.push(`Trigger of type ${trigger.triggerType} must have conditions`);
      }
    }

    // Validate actions
    if (data.actions.length === 0) {
      errors.push("Workflow must have at least one action");
    }

    for (const action of data.actions) {
      if (!action.actionType) {
        errors.push("Action must have a type");
      }
      if (!action.actionConfig || Object.keys(action.actionConfig).length === 0) {
        errors.push(`Action of type ${action.actionType} must have configuration`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
