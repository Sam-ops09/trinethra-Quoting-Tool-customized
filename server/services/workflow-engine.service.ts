/**
 * Workflow Engine Service
 * 
 * Core execution engine for workflow automation.
 * Evaluates triggers, executes actions, and manages workflow execution state.
 */

import { storage } from "../storage";
import { logger } from "../utils/logger";
import { EmailService } from "./email.service";
import { NotificationService } from "./notification.service";
import type {
  Workflow,
  WorkflowTrigger,
  WorkflowAction,
  WorkflowExecution,
  WorkflowTriggerType,
  WorkflowActionType,
} from "@shared/schema";
import parser from "cron-parser";

interface TriggerContext {
  eventType: string;
  oldValue?: any;
  newValue?: any;
  entity: any;
  [key: string]: any;
}

interface ActionExecutionResult {
  actionId: string;
  actionType: string;
  status: "success" | "failed" | "skipped";
  details: string;
  timestamp: Date;
  error?: string;
}

export class WorkflowEngine {
  /**
   * Trigger workflows for a specific entity event
   * This is called whenever an entity changes (quote status change, invoice created, etc.)
   */
  static async triggerWorkflows(
    entityType: string,
    entityId: string,
    context: TriggerContext
  ): Promise<void> {
    try {
      // Get all active workflows for this entity type
      const workflows = await storage.getActiveWorkflows(entityType);

      if (workflows.length === 0) {
        logger.debug(`[WorkflowEngine] No active workflows for ${entityType}`);
        return;
      }

      logger.info(`[WorkflowEngine] Found ${workflows.length} active workflows for ${entityType}`);

      // Evaluate and execute each workflow
      for (const workflow of workflows) {
        try {
          // Wrap individual workflow execution to prevent one failure from stopping others
          const shouldExecute = await this.evaluateWorkflow(workflow, context);
          
          if (shouldExecute) {
            logger.info(`[WorkflowEngine] Executing workflow: ${workflow.name} (${workflow.id})`);
            
            // Execute in background to not block the main request if not already async
            // Ideally this should be a job queue. For now, we await but catch errors strictly.
            await this.executeWorkflow(workflow, entityType, entityId, context)
              .catch(err => {
                 logger.error(`[WorkflowEngine] Critical failure executing workflow ${workflow.id}:`, err);
              });
          }
        } catch (error) {
          logger.error(`[WorkflowEngine] Error processing workflow ${workflow.id}:`, error);
          // Continue with other workflows even if one fails
        }
      }
    } catch (error) {
      logger.error(`[WorkflowEngine] Error triggering workflows for ${entityType}:`, error);
      // Don't throw, just log. We don't want to break the business transaction (e.g. creating quote) 
      // just because workflow engine failed.
    }
  }

  /**
/**
     * Evaluate if a workflow should execute based on its triggers
     */
    private static async evaluateWorkflow(workflow: Workflow, context: TriggerContext): Promise<boolean> {
      try {
        const triggers = await storage.getWorkflowTriggers(workflow.id);
        
        if (triggers.length === 0) {
          logger.warn(`[WorkflowEngine] Workflow ${workflow.id} has no triggers`);
          return false;
        }

        const logic = workflow.triggerLogic || "AND";
        const results: boolean[] = [];

        for (const trigger of triggers) {
          if (!trigger.isActive) continue;
          
          const matches = this.evaluateTrigger(trigger, context);
          results.push(matches);
        }

        // Apply logic (AND/OR)
        if (logic === "AND") {
          return results.every((r) => r === true);
        } else {
          // OR logic
          return results.some((r) => r === true);
        }
      } catch (error) {
        logger.error(`[WorkflowEngine] Error evaluating workflow ${workflow.id}:`, error);
        return false;
      }
    }

    /**
     * Evaluate a single trigger condition
     */
    private static evaluateTrigger(trigger: WorkflowTrigger, context: TriggerContext): boolean {
      const conditions = trigger.conditions as any;
      
      switch (trigger.triggerType) {
        case "status_change":
          return this.evaluateStatusChange(conditions, context);
        
        case "amount_threshold":
          return this.evaluateAmountThreshold(conditions, context);
        
        case "field_change":
          return this.evaluateFieldChange(conditions, context);
        
        case "date_based":
          return this.evaluateDateBased(conditions, context);
        
        case "created":
          // Check if event type is 'created'
          return context.eventType === "created";
        
        case "manual":
          // Manual triggers always return true when explicitly triggered
          return context.eventType === "manual";
        
        default:
          logger.warn(`[WorkflowEngine] Unknown trigger type: ${trigger.triggerType}`);
          return false;
      }
    }

    /**
     * Evaluate status change trigger
     * Example: { field: "status", from: "draft", to: "approved" }
     */
    private static evaluateStatusChange(conditions: any, context: TriggerContext): boolean {
      if (context.eventType !== "status_change") return false;
      
      const field = conditions.field || "status";
      const from = conditions.from;
      const to = conditions.to;

      // If both from and to are specified
      if (from && to) {
        return context.oldValue === from && context.newValue === to;
      }
      
      // If only 'to' is specified
      if (to) {
        return context.newValue === to;
      }
      
      // If only 'from' is specified
      if (from) {
        return context.oldValue === from;
      }

      // Any status change
      return context.oldValue !== context.newValue;
    }

    /**
     * Evaluate amount threshold trigger
     * Example: { field: "total", operator: "greater_than", value: 10000 }
     */
    private static evaluateAmountThreshold(conditions: any, context: TriggerContext): boolean {
      const field = conditions.field || "total";
      const operator = conditions.operator;
      const threshold = parseFloat(conditions.value);

      const entityValue = parseFloat(context.entity[field] || 0);

      switch (operator) {
        case "greater_than":
          return entityValue > threshold;
        case "less_than":
          return entityValue < threshold;
        case "equals":
          return entityValue === threshold;
        case "greater_than_or_equal":
          return entityValue >= threshold;
        case "less_than_or_equal":
          return entityValue <= threshold;
        default:
          return false;
      }
    }

    /**
     * Evaluate field change trigger
     * Example: { field: "discount", operator: "greater_than", value: 20 }
     */
    private static evaluateFieldChange(conditions: any, context: TriggerContext): boolean {
      if (context.eventType !== "field_change") return false;
      
      const field = conditions.field;
      const operator = conditions.operator;
      const value = conditions.value;

      const fieldValue = context.entity[field];

      switch (operator) {
        case "equals":
          return fieldValue == value;
        case "not_equals":
          return fieldValue != value;
        case "greater_than":
          return parseFloat(fieldValue) > parseFloat(value);
        case "less_than":
          return parseFloat(fieldValue) < parseFloat(value);
        case "contains":
          return String(fieldValue).includes(String(value));
        default:
          return false;
      }
    }

    /**
     * Evaluate date-based trigger
     * Example: { field: "dueDate", operator: "days_before", value: 7 }
     */
    private static evaluateDateBased(conditions: any, context: TriggerContext): boolean {
      const field = conditions.field;
      const operator = conditions.operator;
      const days = parseInt(conditions.value);

      const dateValue = context.entity[field];
      if (!dateValue) return false;

      const targetDate = new Date(dateValue);
      const today = new Date();
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (operator) {
        case "days_before":
          return diffDays === days && diffDays > 0;
        case "days_after":
          return diffDays === -days && diffDays < 0;
        case "is_overdue":
          return diffDays < 0;
        case "is_today":
          return diffDays === 0;
        default:
          return false;
      }
    }

    /**
     * Execute a workflow's actions
     */
    private static async executeWorkflow(
      workflow: Workflow,
      entityType: string,
      entityId: string,
      context: TriggerContext
    ): Promise<void> {
      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const startTime = Date.now();

      // Create execution record
      const execution = await storage.createWorkflowExecution({
        workflowId: workflow.id,
        entityType,
        entityId,
        status: "running",
        triggeredBy: context.triggeredBy || "system",
        executionLog: [],
      });

      const executionLog: ActionExecutionResult[] = [];

      try {
        // Get workflow actions
        const actions = await storage.getWorkflowActions(workflow.id);
        
        logger.info(`[WorkflowEngine] Executing ${actions.length} actions for workflow ${workflow.id}`);

        // Execute actions in order
        for (const action of actions) {
          if (!action.isActive) {
            executionLog.push({
              actionId: action.id,
              actionType: action.actionType,
              status: "skipped",
              details: "Action is inactive",
              timestamp: new Date(),
            });
            continue;
          }

          try {
            // Check conditional execution
            if (action.conditionExpression) {
              const shouldExecute = this.evaluateActionCondition(action.conditionExpression, context);
              if (!shouldExecute) {
                executionLog.push({
                  actionId: action.id,
                  actionType: action.actionType,
                  status: "skipped",
                  details: "Condition not met",
                  timestamp: new Date(),
                });
                continue;
              }
            }

            // Handle delay
            if (action.delayMinutes && action.delayMinutes > 0) {
              logger.info(`[WorkflowEngine] Delaying action ${action.id} by ${action.delayMinutes} minutes`);
              // In real implementation, this would schedule the action for later
              // For now, we'll just log it
            }

            // Execute the action
            const result = await this.executeAction(action, context);
            executionLog.push(result);

          } catch (error: any) {
            logger.error(`[WorkflowEngine] Error executing action ${action.id}:`, error);
            executionLog.push({
              actionId: action.id,
              actionType: action.actionType,
              status: "failed",
              details: "Action execution failed",
              error: error.message,
              timestamp: new Date(),
            });
          }
        }

        // Update execution record with success
        const executionTime = Date.now() - startTime;
        await storage.updateWorkflowExecution(execution.id, {
          status: "completed",
          completedAt: new Date(),
          executionLog: executionLog as any,
          executionTimeMs: executionTime,
        });

        logger.info(`[WorkflowEngine] Workflow ${workflow.id} completed in ${executionTime}ms`);

      } catch (error: any) {
        // Update execution record with failure
        await storage.updateWorkflowExecution(execution.id, {
          status: "failed",
          completedAt: new Date(),
          executionLog: executionLog as any,
          errorMessage: error.message,
          errorStack: error.stack,
        });

        logger.error(`[WorkflowEngine] Workflow ${workflow.id} failed:`, error);
      }
    }

    /**
     * Evaluate action condition expression safely
     * Example: "{{quote.total}} > 50000"
     * 
     * SAFE EVALUATION STRATEGY:
     * 1. Interpolate variables first
     * 2. Parse the expression to identify operator and operands
     * 3. Evaluate strictly without `eval()` or `new Function()`
     */
    private static evaluateActionCondition(expression: string, context: TriggerContext): boolean {
      try {
        // 1. Interpolate variables
        // We use the existing interpolateTemplate but need to handle non-string types for comparison
        // So we manually resolve values that look like variables
        
        let evaluatedExpression = expression.trim();
        
        // Match pattern: operand operator operand
        // Supported operators: >, <, >=, <=, ==, !=, ===, !==
        // Order matters: match longer operators first (e.g. >= before >)
        const operatorMatch = evaluatedExpression.match(/(>=|<=|===|!==|==|!=|>|<)/);
        
        if (!operatorMatch) {
            // No operator found, maybe it's a boolean variable check like "{{quote.isApproved}}"
            if (evaluatedExpression.startsWith("{{") && evaluatedExpression.endsWith("}}")) {
                const path = evaluatedExpression.replace(/\{\{|\}\}/g, '').trim();
                const value = this.getNestedValue(context.entity, path);
                return !!value;
            }
            logger.warn(`[WorkflowEngine] Invalid condition format: ${expression}`);
            return false;
        }

        const operator = operatorMatch[0];
        const parts = evaluatedExpression.split(operator);
        
        if (parts.length !== 2) {
             logger.warn(`[WorkflowEngine] Complex expressions not supported: ${expression}`);
             return false;
        }

        let leftRaw = parts[0].trim();
        let rightRaw = parts[1].trim();

        // Helper to resolve value
        const resolve = (val: string): any => {
            if (val.startsWith("{{") && val.endsWith("}}")) {
                 const path = val.replace(/\{\{|\}\}/g, '').trim();
                 return this.getNestedValue(context.entity, path);
            }
            // Number literal
            if (!isNaN(Number(val)) && val !== "") return Number(val);
            // String literal
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                return val.slice(1, -1);
            }
            // Boolean literal
            if (val === "true") return true;
            if (val === "false") return false;
            
            return val;
        };

        const leftVal = resolve(leftRaw);
        const rightVal = resolve(rightRaw);

        switch (operator) {
            case ">": return Number(leftVal) > Number(rightVal);
            case "<": return Number(leftVal) < Number(rightVal);
            case ">=": return Number(leftVal) >= Number(rightVal);
            case "<=": return Number(leftVal) <= Number(rightVal);
            case "==": return leftVal == rightVal;
            case "!=": return leftVal != rightVal;
            case "===": return leftVal === rightVal;
            case "!==": return leftVal !== rightVal;
            default: return false;
        }

      } catch (error) {
        logger.error(`[WorkflowEngine] Error evaluating condition: ${expression}`, error);
        return false;
      }
    }

    /**
     * Get nested value from object using dot notation
     * Example: getNestedValue({ quote: { total: 1000 } }, "quote.total") => 1000
     */
    private static getNestedValue(obj: any, path: string): any {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Execute a single action
     */
    private static async executeAction(
      action: WorkflowAction,
      context: TriggerContext
    ): Promise<ActionExecutionResult> {
      const config = action.actionConfig as any;
      
      try {
        switch (action.actionType) {
          case "send_email":
            await this.executeSendEmail(config, context);
            break;
          
          case "create_notification":
            await this.executeCreateNotification(config, context);
            break;
          
          case "update_field":
            await this.executeUpdateField(config, context);
            break;
          
          case "create_activity_log":
            await this.executeCreateActivityLog(config, context);
            break;
            
          case "assign_user":
            await this.executeAssignUser(config, context);
            break;
          
          default:
            logger.warn(`[WorkflowEngine] Unimplemented action type: ${action.actionType}`);
        }

        return {
          actionId: action.id,
          actionType: action.actionType,
          status: "success",
          details: `Successfully executed ${action.actionType}`,
          timestamp: new Date(),
        };
      } catch (error: any) {
        return {
          actionId: action.id,
          actionType: action.actionType,
          status: "failed",
          details: "Action execution failed",
          error: error.message,
          timestamp: new Date(),
        };
      }
    }

    /**
     * Send email action
     */
    private static async executeSendEmail(config: any, context: TriggerContext): Promise<void> {
      const to = this.interpolateTemplate(config.to, context);
      const subject = this.interpolateTemplate(config.subject, context);
      const body = this.interpolateTemplate(config.body, context);

      // Use existing email service
      await EmailService.sendEmail({
        to,
        subject,
        html: body,
      });

      logger.info(`[WorkflowEngine] Would send email to: ${to}, subject: ${subject}`);
    }

    /**
     * Create notification action
     */
    /**
     * Create notification action
     */
    private static async executeCreateNotification(config: any, context: TriggerContext): Promise<void> {
      let userId = this.interpolateTemplate(config.userId, context);
      const title = this.interpolateTemplate(config.title, context);
      const message = this.interpolateTemplate(config.message, context);
      
      const roles = ['admin', 'sales_executive', 'sales_manager', 'purchase_operations', 'finance_accounts'];
      let targetUserIds: string[] = [];

      if (roles.includes(userId)) {
          // It's a role, fetch all users with this role
          const usersWithRole = await storage.getUsersByRole(userId);
          if (usersWithRole.length > 0) {
              targetUserIds = usersWithRole.map(u => u.id);
              logger.info(`[WorkflowEngine] Broadcasting notification to ${targetUserIds.length} users in role ${userId}`);
          } else {
              logger.warn(`[WorkflowEngine] No users found with role ${userId} for notification`);
              return; 
          }
      } else {
          // It's a specific user ID or invalid
          targetUserIds = [userId];
      }

      // Send to all targets
      for (const targetId of targetUserIds) {
          await NotificationService.create({
            userId: targetId,
            type: config.type || "system_announcement",
            title,
            message,
            entityType: context.entity.entityType,
            entityId: context.entity.id,
          });
      }

      logger.info(`[WorkflowEngine] Created notifications for ${targetUserIds.length} recipients`);
    }

    /**
     * Update field action
     */
    private static async executeUpdateField(config: any, context: TriggerContext): Promise<void> {
      const field = config.field;
      const value = this.interpolateTemplate(config.value, context);
      const entityType = context.entity.entityType || "quote"; // Default or detect from context
      const entityId = context.entity.id;

      logger.info(`[WorkflowEngine] Updating field ${field} to ${value} for ${entityType} ${entityId}`);
      
      try {
        if (entityType === "quote") {
           await storage.updateQuote(entityId, { [field]: value });
        } else if (entityType === "invoice") {
           // await storage.updateInvoice(entityId, { [field]: value });
           logger.warn(`[WorkflowEngine] Update invoice not yet implemented fully`);
        } else {
           logger.warn(`[WorkflowEngine] Entity type ${entityType} not supported for generic update`);
        }
      } catch (err) {
        logger.error(`[WorkflowEngine] Failed to update field:`, err);
        throw err;
      }
    }

    /**
     * Create activity log action
     */
    private static async executeCreateActivityLog(config: any, context: TriggerContext): Promise<void> {
      const action = this.interpolateTemplate(config.action, context);
      const details = this.interpolateTemplate(config.details, context);

      await storage.createActivityLog({
        userId: config.userId || context.entity.createdBy,
        action,
        entityType: context.entity.entityType || "workflow",
        entityId: context.entity.id,
        metadata: { details },
      });

      logger.info(`[WorkflowEngine] Created activity log: ${action}`);
    }

    /**
     * Template interpolation
     * Replaces {{variable}} with actual values from context
     */
    private static interpolateTemplate(template: string, context: TriggerContext): string {
      if (!template) return "";
      
      let result = template;
      const matches = template.match(/\{\{([^}]+)\}\}/g);
      
      if (matches) {
        for (const match of matches) {
          const path = match.replace(/\{\{|\}\}/g, '').trim();
          
          // Try detecting snake_case to camelCase mapping for common fields if not found directly
          let value = this.getNestedValue(context.entity, path);
          
          if (!value && path.includes('_')) {
             const camelPath = path.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
             value = this.getNestedValue(context.entity, camelPath);
          }
          
          // Also check 'entity' wrapper if user did {{quote.status}} but we passed entity as root
          if (!value) {
             value = this.getNestedValue({ entity: context.entity, ...context.entity }, path);
          }
          
          result = result.replace(match, String(value || ""));
        }
      }
      
      return result;
    }

    /**
     * Run scheduled workflows (called by cron job)
     */
    static async runScheduledWorkflows(): Promise<void> {
      try {
        const schedules = await storage.getActiveWorkflowSchedules();
        const now = new Date();

        for (const schedule of schedules) {
          if (schedule.nextRunAt && new Date(schedule.nextRunAt) <= now) {
            logger.info(`[WorkflowEngine] Running scheduled workflow: ${schedule.workflowId}`);
            
            // Execute the workflow
            const workflow = await storage.getWorkflow(schedule.workflowId);
            if (workflow && workflow.status === "active") {
              // Trigger the workflow with scheduled context
              await this.triggerWorkflows(workflow.entityType, "scheduled", {
                eventType: "time_based",
                entity: {},
                triggeredBy: "schedule",
              });
            }

            // Update last run and calculate next run
            await storage.updateWorkflowSchedule(schedule.id, {
              lastRunAt: now,
              nextRunAt: this.calculateNextRun(schedule.cronExpression),
            });
          }
        }
      } catch (error) {
        logger.error(`[WorkflowEngine] Error running scheduled workflows:`, error);
      }
    }

    /**
     * Assign user action
     */
    private static async executeAssignUser(config: any, context: TriggerContext): Promise<void> {
      let userId = this.interpolateTemplate(config.userId, context);
      const entityType = context.entity.entityType || "quote";
      const entityId = context.entity.id;

      // Check if userId is actually a role
      const roles = ['admin', 'sales_executive', 'sales_manager', 'purchase_operations', 'finance_accounts'];
      if (roles.includes(userId)) {
          logger.info(`[WorkflowEngine] Attempting to resolve role: ${userId}`);
          const usersWithRole = await storage.getUsersByRole(userId);
          if (usersWithRole.length > 0) {
              // Strategy: Pick the first active user with this role
              // Future improvement: Round robin or load balancing
              userId = usersWithRole[0].id; // Reassigning userId here
              logger.info(`[WorkflowEngine] Resolved role ${config.userId} to user ${userId} (${usersWithRole[0].name})`);
          } else {
              logger.warn(`[WorkflowEngine] No users found with role ${userId} to assign`);
              return; // Cannot assign
          }
      } else {
          logger.info(`[WorkflowEngine] Using direct user ID or variable: ${userId}`);
      }

      logger.info(`[WorkflowEngine] Final assignment - Entity: ${entityType} ${entityId}, User: ${userId}`);

      try {
        if (entityType === "quote") {
          await storage.updateQuote(entityId, { assignedTo: userId });
          
          // Send Nofitication to the assignee
          await NotificationService.create({
            userId: userId,
            type: "system_announcement",
            title: "New Assignment",
            message: `You have been assigned to Quote ${context.entity.quoteNumber || 'Update'}`,
            entityType: "quote",
            entityId: entityId,
          });
          logger.info(`[WorkflowEngine] Sent assignment notification to user ${userId}`);

        } else {
          logger.warn(`[WorkflowEngine] Assign user not supported for entity type ${entityType}`);
        }
      } catch (err) {
        logger.error(`[WorkflowEngine] Failed to assign user:`, err);
        throw err;
      }
    }


    /**
     * Calculate next run time based on cron expression
     */
    private static calculateNextRun(cronExpression: string): Date {
        try {
            const interval = parser.parseExpression(cronExpression);
            return interval.next().toDate();
        } catch (err) {
            logger.error(`[WorkflowEngine] Invalid cron expression: ${cronExpression}`, err);
            // Default to next day same time if failed? Or throw?
            // For safety, let's just add 24 hours to prevent rapid loop
            return new Date(Date.now() + 24 * 60 * 60 * 1000);
        }
    }
}
