import { storage } from "../storage";
import { Quote, ApprovalRule } from "@shared/schema";
import { Decimal } from "decimal.js";

export class ApprovalService {
  /**
   * Evaluates a quote against active approval rules.
   * Returns approval status and required role.
   */
  static async evaluateQuote(quote: Quote): Promise<{ approvalStatus: string; approvalRequiredBy: string | null }> {
    const rules = await storage.getApprovalRules();
    
    // If no rules exist, no approval needed
    if (!rules || rules.length === 0) {
      return { approvalStatus: "none", approvalRequiredBy: null };
    }

    let needsApproval = false;
    let highestRequiredRoleValue = 0;
    let highestRequiredRole: string | null = null;
    
    // Role Hierarchy for comparison
    const roleHierarchy: Record<string, number> = {
        "viewer": 0,
        "sales_executive": 1,
        "purchase_operations": 1, 
        "finance_accounts": 1,
        "sales_manager": 2,
        "admin": 3
    };

    for (const rule of rules) {
      if (!rule.isActive) continue;

      let triggered = false;
      const threshold = new Decimal(rule.thresholdValue);

      if (rule.triggerType === "discount_percentage") {
        // Calculate discount percentage: (discount / subtotal) * 100
        const subtotal = new Decimal(quote.subtotal || 0);
        const discount = new Decimal(quote.discount || 0);
        
        if (subtotal.gt(0)) {
          const discountPercent = discount.div(subtotal).mul(100);
          if (discountPercent.gte(threshold)) { // Changed to gte for strictness
            triggered = true;
          }
        }
      } else if (rule.triggerType === "total_amount") {
        const total = new Decimal(quote.total || 0);
        if (total.gte(threshold)) { // Changed to gte for strictness
          triggered = true;
        }
      }

      if (triggered) {
        needsApproval = true;
        const ruleRole = rule.requiredRole || "sales_manager";
        const roleValue = roleHierarchy[ruleRole] || 2; // Default to manager level if unknown
        
        if (roleValue > highestRequiredRoleValue) {
            highestRequiredRoleValue = roleValue;
            highestRequiredRole = ruleRole;
        }
      }
    }

    if (needsApproval) {
      // Default to sales_manager if for some reason it's null but approval is needed
      return { approvalStatus: "pending", approvalRequiredBy: highestRequiredRole || "sales_manager" };
    }

    return { approvalStatus: "none", approvalRequiredBy: null };
  }
}
