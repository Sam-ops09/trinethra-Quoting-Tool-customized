import { db } from "../db";
import { subscriptions, invoices, invoiceItems, clients, type InsertSubscription, type Subscription } from "../../shared/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import { NumberingService } from "./numbering.service";
import { logger } from "../utils/logger";
import { addMonths, addYears, startOfDay, differenceInDays } from "date-fns";
import { EmailService } from "./email.service";
import { isFeatureEnabled } from "../../shared/feature-flags";

export class SubscriptionService {
  /**
   * Get all subscriptions
   */
  static async getAllSubscriptions() {
    return await db.query.subscriptions.findMany({
      with: {
        client: true,
      },
      orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)],
    });
  }

  /**
   * Get subscription by ID
   */
  static async getSubscriptionById(id: string) {
    return await db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, id),
      with: {
        client: true,
        invoices: {
          orderBy: (invoices, { desc }) => [desc(invoices.issueDate)],
        },
      },
    });
  }

  /**
   * Create a new subscription
   */
  static async createSubscription(data: InsertSubscription, userId: string) {
    // Generate subscription number? Or just use UUID/Name?
    // Schema has subscriptionNumber (SUB-2025-001)
    
    // Simple counter for subscriptions if not in NumberingService yet
    // For now, let's use a simple format or update NumberingService.
    // Let's assume SUB-{YEAR}-{RANDOM} for now to avoid blocking, 
    // or add it to NumberingService later.
    const year = new Date().getFullYear();
    const subNumber = `SUB-${year}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    console.log(`[SubscriptionService] Creating subscription. Payload:`, JSON.stringify(data, null, 2));

    const startDate = new Date(data.startDate || new Date());
    console.log(`[SubscriptionService] Parsed Start Date: ${startDate.toISOString()}`);


    const [newSubscription] = await db.insert(subscriptions).values({
      ...data,
      startDate: startDate,
      nextBillingDate: startDate,
      subscriptionNumber: subNumber,
      status: "active",
      createdBy: userId,
    }).returning();

    // Check if immediate billing is required (Start Date <= Today)
    if (newSubscription.status === 'active' && newSubscription.nextBillingDate <= new Date()) {
       logger.info(`[SubscriptionService] New subscription ${newSubscription.id} starts in past/today. Processing immediate renewal.`);
       // To process renewal, we need the client data, so fetch it
       const subWithClient = await db.query.subscriptions.findFirst({
         where: eq(subscriptions.id, newSubscription.id),
         with: { client: true }
       });
       if (subWithClient) {
         await this.processSubscriptionRenewal(subWithClient);
       }
    }

    return newSubscription;
  }

  /**
   * Update subscription
   */
  static async updateSubscription(id: string, data: Partial<InsertSubscription>) {
    const [updated] = await db.update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return updated;
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(id: string) {
    const [updated] = await db.update(subscriptions)
      .set({ status: "cancelled", autoRenew: false, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return updated;
  }

  /**
   * Process due subscriptions and generate invoices
   */
  static async processDueSubscriptions() {
    const today = startOfDay(new Date()); // Ensure we check against start of today
    
    // Find active subscriptions where nextBillingDate <= today
    const dueSubscriptions = await db.query.subscriptions.findMany({
      where: and(
        eq(subscriptions.status, "active"),
        lte(subscriptions.nextBillingDate, today)
      ),
      with: {
        client: true
      }
    });

    logger.info(`[SubscriptionService] Found ${dueSubscriptions.length} due subscriptions.`);

    const results = [];
    for (const sub of dueSubscriptions) {
      const result = await this.processSubscriptionRenewal(sub);
      results.push(result);
    }
    return results;
  }

  /**
   * Process subscription renewal(s) until up to date
   */
  static async processSubscriptionRenewal(sub: Subscription & { client: any }) {
    const MAX_CYCLES = 12; // Safety break
    let cyclesProcessed = 0;
    
    // We need to fetch the latest state of the subscription to ensure loop condition is valid
    // But passing 'sub' and updating it in memory is easier for the loop.
    let currentNextBilling = new Date(sub.nextBillingDate);
    const today = startOfDay(new Date());
    
    // Results accumulator
    const results = [];

    // Loop while next billing date is today or in the past
    while (currentNextBilling <= today && cyclesProcessed < MAX_CYCLES) {
      cyclesProcessed++;
      try {
        console.log(`[SubscriptionService] Processing renewal cycle #${cyclesProcessed} for ${sub.id}. Current Billing: ${currentNextBilling.toISOString()}`);
        
        // Generate Invoice
        // Note: generateInvoice uses specific fields from 'sub'. 
        // If we want the invoice date to reflect the "missed" billing date, we might need to adjust generateInvoice
        // But typically invoices are issued "Now" for past dues.
        const invoice = await this.generateInvoiceForSubscription(sub);

        // Calculate next date
        // @ts-ignore
        const nextDate = this.calculateNextBillingDate(currentNextBilling, sub.billingCycle);
        console.log(`[SubscriptionService] New Next Date: ${nextDate.toISOString()}`);
        
        // Update DB
        // We update iteratively so if it fails halfway, we at least recorded progress?
        // Or we could verify success.
        await db.update(subscriptions)
          .set({ 
            nextBillingDate: nextDate,
            lastInvoiceDate: new Date(),
            updatedAt: new Date()
          })
          .where(eq(subscriptions.id, sub.id));
        
        // Send Email
        if (isFeatureEnabled('email_subscriptionRenewed')) {
            if (sub.client && sub.client.email) {
                // ... email logic
                await EmailService.sendSubscriptionRenewedEmail(
                    sub.client.email,
                    sub.client.name,
                    sub.planName,
                    invoice.invoiceNumber,
                    `${sub.currency} ${sub.amount}`,
                    nextDate
                );
            }
        }

        results.push({ subscriptionId: sub.id, invoiceId: invoice.id, status: "success", billingDate: currentNextBilling });
        
        // Advance loop variable
        currentNextBilling = nextDate;

        // Update the 'sub' object reference for calculateNextBillingDate in next iteration if needed
        // (calculateNextBillingDate only needs the date and cycle, which we have)
        
      } catch (error: any) {
        logger.error(`[SubscriptionService] Failed to process subscription ${sub.id} cycle ${cyclesProcessed}:`, error);
        return { subscriptionId: sub.id, error: error.message, status: "failed" }; // Abort loop on error
      }
    }
    
    if (cyclesProcessed >= MAX_CYCLES) {
        logger.warn(`[SubscriptionService] Hit max renewal cycles (${MAX_CYCLES}) for ${sub.id}. Stopping catch-up.`);
    }

    return { subscriptionId: sub.id, processedcount: results.length, status: "success", details: results };
  }

  /**
   * Generate Invoice for a Subscription
   * ATOMIC TRANSACTION: Ensures header and items are created together.
   */
  static async generateInvoiceForSubscription(sub: Subscription) {
    logger.info(`[SubscriptionService] Generating invoice for subscription ${sub.id}`);

    return await db.transaction(async (tx) => {
      // Generate Invoice Number
      // Use NumberingService (assuming generic invoice generator)
      const invoiceNumber = await NumberingService.generateMasterInvoiceNumber(); 

      const items = JSON.parse(sub.itemsSnapshot || "[]");
      
      // Create Invoice
      const [newInvoice] = await tx.insert(invoices).values({
        invoiceNumber,
        clientId: sub.clientId,
        subscriptionId: sub.id,
        status: "draft", // Auto-draft? Or sent? Usually draft for review or auto-send.
        issueDate: new Date(),
        dueDate: addMonths(new Date(), 1), // Default net 30?
        currency: sub.currency,
        subtotal: sub.amount.toString(), // Assuming amount is subtotal? Or total? 
        // Simplified: amount is total for now, logic below
        total: sub.amount.toString(),
        notes: `Recurring invoice for ${sub.planName} (${sub.billingCycle})`,
        createdBy: sub.createdBy, // Attributed to creator of sub? Or system?
      }).returning();

      // Create Invoice Items
      if (items.length > 0) {
        for (const item of items) {
          const itemSubtotal = item.subtotal || (Number(item.quantity) * Number(item.unitPrice)).toString();
          
          await tx.insert(invoiceItems).values({
            invoiceId: newInvoice.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: itemSubtotal,
            // ... other fields
          });
        }
      }

      return newInvoice;
    });
  }

  /**
   * Calculate Proration for plan change
   */
  static calculateProration(
    currentAmount: number,
    newAmount: number,
    nextBillingDate: Date,
    billingCycle: "monthly" | "quarterly" | "annually"
  ) {
    const today = startOfDay(new Date());
    const daysRemaining = differenceInDays(new Date(nextBillingDate), today);

    // If billing date is passed or today, no proration (full charge next cycle)
    if (daysRemaining <= 0) return { amount: 0, description: "No proration needed" };

    // Calculate total days in the cycle
    // We need the *previous* billing date to know total cycle length
    // Approximation: 
    // Monthly = 30, Quarterly = 90, Annually = 365
    let totalDays = 30;
    if (billingCycle === "quarterly") totalDays = 90;
    if (billingCycle === "annually") totalDays = 365;

    // Daily rates
    const oldDailyRate = currentAmount / totalDays;
    const newDailyRate = newAmount / totalDays;

    // Adjustment = (New Rate - Old Rate) * Days Remaining
    // If New > Old: Positive (Customer owes money)
    // If New < Old: Negative (Customer gets credit)
    const adjustment = (newDailyRate - oldDailyRate) * daysRemaining;

    return {
      amount: parseFloat(adjustment.toFixed(2)),
      daysRemaining,
      description: `Proration for ${daysRemaining} remaining days`,
    };
  }

  /**
   * Helper: Calculate next billing date
   */
  static calculateNextBillingDate(currentDate: Date, cycle: "monthly" | "quarterly" | "annually"): Date {
    const date = new Date(currentDate);
    switch (cycle) {
      case "monthly": return addMonths(date, 1);
      case "quarterly": return addMonths(date, 3);
      case "annually": return addYears(date, 1);
      default: return addMonths(date, 1);
    }
  }
}
