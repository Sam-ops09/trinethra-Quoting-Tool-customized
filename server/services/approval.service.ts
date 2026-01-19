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

    let requiredRole: string | null = null;
    let needsApproval = false;

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
          if (discountPercent.gt(threshold)) {
            triggered = true;
          }
        }
      } else if (rule.triggerType === "total_amount") {
        const total = new Decimal(quote.total || 0);
        if (total.gt(threshold)) {
          triggered = true;
        }
      }

      if (triggered) {
        needsApproval = true;
        // Logic to determine highest role could be complex, for now assume 'sales_manager'
        // or take the role from the rule. If multiple rules trigger, we might need the "most senior" role.
        // For simplicity, we'll take the first triggered rule's requirement or default to manager.
        requiredRole = rule.requiredRole || "sales_manager";
        // Stop at first trigger or collect all? 
        // Let's stop at first trigger for MVP.
        break;
      }
    }

    if (needsApproval) {
      return { approvalStatus: "pending", approvalRequiredBy: requiredRole };
    }

    return { approvalStatus: "none", approvalRequiredBy: null };
  }
}
