/**
 * PERMISSION MIDDLEWARE
 *
 * Express middleware for checking permissions and enforcing governance rules
 */

import { Response, NextFunction } from "express";
import { AuthRequest } from "./middleware";
import {
  hasPermission,
  requiresAuditLog,
  UserRole,
  ResourceType,
  ActionType,
  formatAuditLogEntry
} from "./permissions-service";
import { storage } from "./storage";

/**
 * Middleware to check if user has permission for a resource action
 */
export function requirePermission(resource: ResourceType, action: ActionType) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const hasAccess = hasPermission(user.role as UserRole, resource, action);

      if (!hasAccess) {
        // Log unauthorized attempt
        await storage.createActivityLog({
          userId: user.id,
          action: `unauthorized_${action}_${resource}`,
          entityType: resource,
          entityId: null,
        });

        return res.status(403).json({
          error: "Forbidden",
          message: `You don't have permission to ${action} ${resource}`,
          requiredPermission: { resource, action }
        });
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({ error: "Permission check failed" });
    }
  };
}

/**
 * Middleware to log activities that require audit trail
 */
export function auditLog(resource: ResourceType, action: ActionType) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return next();
      }

      // Store original send to intercept response
      const originalSend = res.json.bind(res);

      res.json = function(data: any) {
        // Only log on successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const entityId = req.params.id || data?.id || null;

          // Create audit log entry
          storage.createActivityLog({
            userId: user.id,
            action: `${action}_${resource}`,
            entityType: resource,
            entityId: entityId,
          }).catch(err => {
            console.error("Failed to create audit log:", err);
          });
        }

        return originalSend(data);
      };

      next();
    } catch (error) {
      console.error("Audit log error:", error);
      next(); // Continue even if audit logging fails
    }
  };
}

/**
 * Middleware to check governance rules for quote approval
 */
export function requireQuoteApprovalPermission() {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { canApproveQuote } = await import("./permissions-service");
      const user = req.user;
      const quoteId = req.params.id;

      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get quote to check status
      const quote = await storage.getQuote(quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      const check = canApproveQuote(user.role as UserRole, quote.status);

      if (!check.allowed) {
        return res.status(403).json({
          error: "Forbidden",
          message: check.reason,
          requiredRole: check.requiredRole
        });
      }

      next();
    } catch (error) {
      console.error("Quote approval check error:", error);
      return res.status(500).json({ error: "Permission check failed" });
    }
  };
}

/**
 * Middleware to check governance rules for master invoice operations
 */
export function requireMasterInvoicePermission(operation: "confirm" | "lock") {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { canConfirmMasterInvoice, canLockMasterInvoice } = await import("./permissions-service");
      const user = req.user;
      const invoiceId = req.params.id;

      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get invoice to check status
      const invoice = await storage.getInvoice(invoiceId);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      const check = operation === "confirm"
        ? canConfirmMasterInvoice(user.role as UserRole, invoice.masterInvoiceStatus || "draft")
        : canLockMasterInvoice(user.role as UserRole, invoice.masterInvoiceStatus || "draft");

      if (!check.allowed) {
        return res.status(403).json({
          error: "Forbidden",
          message: check.reason,
          requiredRole: check.requiredRole
        });
      }

      next();
    } catch (error) {
      console.error("Master invoice permission check error:", error);
      return res.status(500).json({ error: "Permission check failed" });
    }
  };
}

/**
 * Middleware to check payment management permissions
 */
export function requirePaymentManagementPermission(action: "create" | "delete") {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { canManagePayments } = await import("./permissions-service");
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const check = canManagePayments(user.role as UserRole, action);

      if (!check.allowed) {
        return res.status(403).json({
          error: "Forbidden",
          message: check.reason,
          requiredRole: check.requiredRole
        });
      }

      next();
    } catch (error) {
      console.error("Payment permission check error:", error);
      return res.status(500).json({ error: "Permission check failed" });
    }
  };
}

/**
 * Create detailed audit log for sensitive operations
 */
export async function createDetailedAuditLog(
  userId: string,
  resource: ResourceType,
  action: ActionType,
  entityId: string,
  changes?: Record<string, { old: any; new: any }>,
  additionalContext?: Record<string, any>
) {
  try {
    const message = formatAuditLogEntry(resource, action, entityId, changes);

    await storage.createActivityLog({
      userId,
      action: `${action}_${resource}`,
      entityType: resource,
      entityId,
    });

    // Could also store detailed changes in a separate audit table if needed
    console.log(`[AUDIT] User ${userId}: ${message}`, additionalContext);
  } catch (error) {
    console.error("Failed to create detailed audit log:", error);
  }
}

