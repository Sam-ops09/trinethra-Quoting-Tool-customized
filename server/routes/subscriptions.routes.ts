
import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware";
import { logger } from "../utils/logger";
import { SubscriptionService } from "../services/subscription.service";
import { NumberingService } from "../services/numbering.service";
import { toMoneyString, toDecimal, moneyGt } from "../utils/financial";
import { db } from "../db";
import * as schema from "../../shared/schema";
import { eq } from "drizzle-orm";
import { requireFeature } from "../feature-flags-middleware";
import { requirePermission } from "../permissions-middleware";

const router = Router();

// List all subscriptions
router.get("/subscriptions", authMiddleware, requireFeature('subscriptions_module'), async (req: AuthRequest, res: Response) => {
  try {
    const subs = await SubscriptionService.getAllSubscriptions();
    return res.json(subs);
  } catch (error: any) {
    logger.error("Error fetching subscriptions:", error);
    return res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});

// Create subscription
router.post("/subscriptions", authMiddleware, requireFeature('subscriptions_module'), async (req: AuthRequest, res: Response) => {
  try {
    const sub = await SubscriptionService.createSubscription(req.body, req.user!.id);
    return res.status(201).json(sub);
  } catch (error: any) {
    logger.error("Error creating subscription:", error);
    return res.status(500).json({ error: "Failed to create subscription" });
  }
});

// Get subscription details
router.get("/subscriptions/:id", authMiddleware, requireFeature('subscriptions_module'), async (req: AuthRequest, res: Response) => {
  try {
    const sub = await SubscriptionService.getSubscriptionById(req.params.id);
    if (!sub) {
      return res.status(404).json({ error: "Subscription not found" });
    }
    return res.json(sub);
  } catch (error: any) {
    logger.error("Error fetching subscription:", error);
    return res.status(500).json({ error: "Failed to fetch subscription" });
  }
});

// ==================== PREVIEW SUBSCRIPTION UPDATE (PRORATION) ====================
router.post("/subscriptions/:id/preview-update", authMiddleware, requireFeature('subscriptions_module'), async (req: AuthRequest, res: Response) => {
  try {
    const { amount, billingCycle } = req.body;
    
    const subscription = await SubscriptionService.getSubscriptionById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    if (subscription.status !== "active") {
      return res.json({ amount: 0, description: "Subscription not active", daysRemaining: 0 });
    }

    const proration = SubscriptionService.calculateProration(
      parseFloat(subscription.amount),
      parseFloat(amount),
      new Date(subscription.nextBillingDate),
      subscription.billingCycle as "monthly" | "quarterly" | "annually" // Use current cycle for calc comparison
    );

    return res.json(proration);
  } catch (error: any) {
    logger.error("Preview subscription update error:", error);
    return res.status(500).json({ error: error.message || "Failed to preview update" });
  }
});

// Update subscription
router.put("/subscriptions/:id", authMiddleware, requireFeature('subscriptions_module'), requirePermission("subscriptions", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    const { planName, billingCycle, startDate, amount, currency, autoRenew, itemsSnapshot, notes, applyProration } = req.body;

    // Verify subscription exists
    const existing = await SubscriptionService.getSubscriptionById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const result = await db.transaction(async (tx) => {
      // Handle Proration if requested and active
      if (applyProration && existing.status === "active") {
        const proration = SubscriptionService.calculateProration(
          parseFloat(existing.amount),
          parseFloat(amount),
          new Date(existing.nextBillingDate),
          existing.billingCycle as any
        );

        if (proration.amount !== 0) {
          if (proration.amount > 0) {
            // CHARGE: Create immediate invoice
            const invoiceNumber = await NumberingService.generateMasterInvoiceNumber();
            const [invoice] = await tx.insert(schema.invoices).values({
              invoiceNumber,
              clientId: existing.clientId,
              subscriptionId: existing.id,
              status: "draft",
              issueDate: new Date(),
              dueDate: new Date(), // Immediate
              currency: currency || existing.currency,
              subtotal: toMoneyString(proration.amount),
              total: toMoneyString(proration.amount),
              notes: `Proration charge for plan change: ${proration.description}`,
              createdBy: req.user!.id,
            }).returning();

            await tx.insert(schema.invoiceItems).values({
              invoiceId: invoice.id,
              description: `Proration Adjustment (${proration.description})`,
              quantity: 1,
              unitPrice: proration.amount.toString(),
              subtotal: proration.amount.toString(),
            });

          } else {
            // CREDIT: Add to prorataCredit
            const creditAmount = Math.abs(proration.amount);
            const currentCredit = parseFloat(existing.prorataCredit || "0");
            await tx.update(schema.subscriptions)
              .set({ 
                prorataCredit: (currentCredit + creditAmount).toString(),
                notes: (existing.notes || "") + `\n[${new Date().toISOString()}] Applied proration credit: ${creditAmount}`
              })
              .where(eq(schema.subscriptions.id, req.params.id));
          }
        }
      }

      // Update subscription details
      const updateData: any = {
        planName,
        billingCycle,
        amount: amount.toString(),
        currency,
        autoRenew,
        itemsSnapshot: JSON.stringify(itemsSnapshot), // Ensure string format
        notes,
      };

      if (startDate) {
          updateData.startDate = new Date(startDate);
          // Recalculate next billing based on NEW start date if needed
      }

      const [updated] = await tx.update(schema.subscriptions)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(schema.subscriptions.id, req.params.id))
        .returning();

      // Log
      await tx.insert(schema.activityLogs).values({
        userId: req.user!.id,
        action: "update_subscription",
        entityType: "subscription",
        entityId: req.params.id,
        timestamp: new Date(),
      });

      return updated;
    });

    return res.json(result);
  } catch (error: any) {
    logger.error("Update subscription error:", error);
    return res.status(500).json({ error: error.message || "Failed to update subscription" });
  }
});

// Cancel subscription
router.post("/subscriptions/:id/cancel", authMiddleware, requireFeature('subscriptions_module'), async (req: AuthRequest, res: Response) => {
  try {
    const sub = await SubscriptionService.cancelSubscription(req.params.id);
    return res.json(sub);
  } catch (error: any) {
    logger.error("Error cancelling subscription:", error);
    return res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

export const subscriptionRoutes = router;
