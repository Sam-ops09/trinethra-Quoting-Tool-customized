
import { Router, Response } from "express";
import { storage } from "../storage";
import { authMiddleware, AuthRequest } from "../middleware";
import { requireFeature } from "../feature-flags-middleware";
import { requirePermission } from "../permissions-middleware";
import { logger } from "../utils/logger";
import { db } from "../db";
import * as schema from "../../shared/schema";
import { eq, sql } from "drizzle-orm";
import { toDecimal, add, subtract, toMoneyString, moneyGte, moneyGt } from "../utils/financial";

const router = Router();

// ==================== PAYMENTS ROUTES ====================

// Update Invoice Payment Status and Amount
router.put("/invoices/:id/payment-status", authMiddleware, requirePermission("payments", "create"), async (req: AuthRequest, res: Response) => {
  try {
    const { paymentStatus, paidAmount } = req.body;

    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const quote = await storage.getQuote(invoice.quoteId || "");
    if (!quote) {
      return res.status(404).json({ error: "Related quote not found" });
    }

    const updateData: Partial<typeof invoice> = {};

    if (paymentStatus !== undefined) {
      updateData.paymentStatus = paymentStatus;
    }

    if (paidAmount !== undefined) {
      const numPaidAmount = Number(paidAmount);
      // Use invoice total if available, otherwise use quote total
      const totalAmount = invoice.total ? Number(invoice.total) : Number(quote.total);

      if (numPaidAmount < 0 || numPaidAmount > totalAmount) {
        return res.status(400).json({ error: "Invalid paid amount" });
      }

      updateData.paidAmount = String(numPaidAmount);

      // Auto-update status based on amount if not explicitly set
      if (paymentStatus === undefined) {
        if (numPaidAmount >= totalAmount) {
          updateData.paymentStatus = "paid";
        } else if (numPaidAmount > 0) {
          updateData.paymentStatus = "partial";
        } else {
          updateData.paymentStatus = "pending";
        }
      }

    }


    const updatedInvoice = await storage.updateInvoice(req.params.id, updateData);

    // If this is a child invoice, update the master invoice payment totals
    if (invoice.parentInvoiceId) {
      const masterInvoice = await storage.getInvoice(invoice.parentInvoiceId);
      if (masterInvoice) {
        // Get all child invoices of this master
        const allInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId || "");
        const childInvoices = allInvoices.filter(inv => inv.parentInvoiceId === masterInvoice.id);

        // Calculate total paid amount from all children (including the just-updated one)
        const totalChildPaidAmount = childInvoices.reduce((sum, child) => {
          const childPaid = child.id === invoice.id ? Number(updateData.paidAmount || 0) : Number(child.paidAmount || 0);
          return sum + childPaid;
        }, 0);

        // Update master invoice with aggregated payment data
        const masterTotal = Number(masterInvoice.total);
        let masterPaymentStatus: "pending" | "partial" | "paid" | "overdue" = "pending";
        if (totalChildPaidAmount >= masterTotal) {
          masterPaymentStatus = "paid";
        } else if (totalChildPaidAmount > 0) {
          masterPaymentStatus = "partial";
        }

        await storage.updateInvoice(masterInvoice.id, {
          paidAmount: String(totalChildPaidAmount),
          paymentStatus: masterPaymentStatus,
        });

        // Check if we should auto-close the quote
        if (masterPaymentStatus === "paid") {
          const quote = await storage.getQuote(masterInvoice.quoteId || "");
          if (quote && quote.status === "invoiced") {
            // All invoices are paid, auto-close the quote
            await storage.updateQuote(quote.id, {
              status: "closed_paid",
              closedAt: new Date(),
              closedBy: req.user!.id,
              closureNotes: "Auto-closed: All invoices fully paid",
            });

            await storage.createActivityLog({
              userId: req.user!.id,
              action: "close_quote",
              entityType: "quote",
              entityId: quote.id,
            });
          }
        }
      }
    } else if (updatedInvoice?.paymentStatus === "paid") {
      // For master or standalone invoices, check if we should close the quote
      const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId || "");
      const allPaid = allInvoices.every(inv => inv.paymentStatus === "paid");

      if (allPaid) {
        const quote = await storage.getQuote(invoice.quoteId || "");
        if (quote && quote.status === "invoiced") {
          await storage.updateQuote(quote.id, {
            status: "closed_paid",
            closedAt: new Date(),
            closedBy: req.user!.id,
            closureNotes: "Auto-closed: All invoices fully paid",
          });

          await storage.createActivityLog({
            userId: req.user!.id,
            action: "close_quote",
            entityType: "quote",
            entityId: quote.id,
          });
        }
      }
    }

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "update_payment_status",
      entityType: "invoice",
      entityId: invoice.id,
    });

    return res.json(updatedInvoice);
  } catch (error: any) {
    logger.error("Update payment status error:", error);
    return res.status(500).json({ error: error.message || "Failed to update payment status" });
  }
});

// Record Invoice Payment (incremental)
router.post("/invoices/:id/payment", authMiddleware, requirePermission("payments", "create"), async (req: AuthRequest, res: Response) => {
  try {
    const { amount, paymentMethod, transactionId, notes, paymentDate } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid payment amount is required" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: "Payment method is required" });
    }

    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const quote = await storage.getQuote(invoice.quoteId || "");
    if (!quote) {
      return res.status(404).json({ error: "Related quote not found" });
    }

    // Create payment history record
    // Wrap all payment-related updates in a transaction for atomicity
    const result = await db.transaction(async (tx) => {
      // 1. Create payment history record
      const [paymentRecord] = await tx.insert(schema.paymentHistory).values({
        invoiceId: req.params.id,
        amount: String(amount),
        paymentMethod,
        transactionId: transactionId || null,
        notes: notes || null,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        recordedBy: req.user!.id,
      }).returning();

      
      // 2. Update invoice totals using Decimal.js for precision
      const newPaidAmount = add(invoice.paidAmount, amount);
      
      const totalAmount = toDecimal(invoice.total || quote.total);

      console.log(`[DEBUG_PAYMENT] paidAmount=${invoice.paidAmount}, amount=${amount}, newPaid=${newPaidAmount.toString()}, total=${totalAmount.toString()}`);

      // Validation: Prevent overpayment
      if (moneyGt(newPaidAmount, totalAmount)) {
           console.log(`[DEBUG_PAYMENT] FAIL: newPaid > total`);
           throw new Error("Payment amount exceeds total invoice amount");
      }
      
      const newRemainingAmount = subtract(totalAmount, newPaidAmount);

      let newPaymentStatus: string = invoice.paymentStatus || "pending";
      if (moneyGte(newPaidAmount, totalAmount)) {
        newPaymentStatus = "paid";
      } else if (moneyGt(newPaidAmount, 0)) {
        newPaymentStatus = "partial";
      }

      const [updatedInvoice] = await tx.update(schema.invoices)
        .set({
          paidAmount: toMoneyString(newPaidAmount),
          remainingAmount: toMoneyString(newRemainingAmount),
          paymentStatus: newPaymentStatus,
          lastPaymentDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.invoices.id, req.params.id))
        .returning();

      // 3. If this is a child invoice, update the master invoice payment totals
      if (invoice.parentInvoiceId) {
        const [masterInvoice] = await tx.select().from(schema.invoices)
          .where(eq(schema.invoices.id, invoice.parentInvoiceId));
        
        if (masterInvoice) {
          // Use parentInvoiceId directly to find child invoices (quoteId is now nullable)
          const childInvoices = await tx.select().from(schema.invoices)
            .where(eq(schema.invoices.parentInvoiceId, masterInvoice.id));

          // Calculate total paid using Decimal.js
          let totalChildPaidAmount = toDecimal(0);
          for (const child of childInvoices) {
            const childPaid = child.id === invoice.id ? newPaidAmount : toDecimal(child.paidAmount);
            totalChildPaidAmount = totalChildPaidAmount.plus(childPaid);
          }

          const masterTotal = toDecimal(masterInvoice.total);
          let masterPaymentStatus: string = "pending";
          if (moneyGte(totalChildPaidAmount, masterTotal)) {
            masterPaymentStatus = "paid";
          } else if (moneyGt(totalChildPaidAmount, 0)) {
            masterPaymentStatus = "partial";
          }

          await tx.update(schema.invoices)
            .set({
              paidAmount: toMoneyString(totalChildPaidAmount),
              paymentStatus: masterPaymentStatus,
              lastPaymentDate: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(schema.invoices.id, masterInvoice.id));
        }
      }

      // 4. Log activity
      await tx.insert(schema.activityLogs).values({
        userId: req.user!.id,
        action: "record_payment",
        entityType: "invoice",
        entityId: invoice.id,
        timestamp: new Date(),
      });

      // 5. Check if quote should be auto-closed
      if (invoice.quoteId) {
        const [currentQuote] = await tx.select().from(schema.quotes)
          .where(eq(schema.quotes.id, invoice.quoteId));
        
        if (currentQuote && currentQuote.status === "invoiced") {
          const allInvoicesForQuote = await tx.select().from(schema.invoices)
            .where(eq(schema.invoices.quoteId, invoice.quoteId));

          const relevantInvoices = allInvoicesForQuote.filter(inv => !inv.parentInvoiceId);
          const allPaid = relevantInvoices.every(inv => inv.paymentStatus === "paid");

          if (allPaid && relevantInvoices.length > 0) {
            await tx.update(schema.quotes)
              .set({
                status: "closed_paid",
                closedAt: new Date(),
                closedBy: req.user!.id,
                updatedAt: new Date(),
              })
              .where(eq(schema.quotes.id, invoice.quoteId));

            await tx.insert(schema.activityLogs).values({
              userId: req.user!.id,
              action: "close_quote",
              entityType: "quote",
              entityId: currentQuote.id,
              timestamp: new Date(),
            });
          }
        }
      }

      return updatedInvoice;
    });

    return res.json(result);
  } catch (error: any) {
    logger.error("Record payment error:", error);
    return res.status(500).json({ error: error.message || "Failed to record payment" });
  }
});

// Get Invoice Payment History (Detailed with actual payment records)
router.get("/invoices/:id/payment-history-detailed", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    logger.info(`[Payment History] Fetching for invoice ${req.params.id}, isMaster: ${invoice.isMaster}`);

    let payments;

    // If this is a master invoice, aggregate payment history from all child invoices
    if (invoice.isMaster) {
      let childInvoices: any[] = [];
      if (invoice.quoteId) {
        const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId || "");
        childInvoices = allInvoices.filter((inv: any) => inv.parentInvoiceId === invoice.id);
      } else if (invoice.salesOrderId) {
         const allInvoices = await storage.getInvoicesBySalesOrder(invoice.salesOrderId);
         childInvoices = allInvoices.filter((inv: any) => inv.parentInvoiceId === invoice.id);
      }

      logger.info(`[Payment History] Found ${childInvoices.length} child invoices:`, childInvoices.map((c: any) => c.id));

      // Get payment history for all child invoices
      const childPayments = await Promise.all(
        childInvoices.map((child: any) => storage.getPaymentHistory(child.id))
      );

      // Flatten and sort by date (most recent first)
      payments = childPayments.flat().sort((a, b) =>
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      );
      logger.info(`[Payment History] Aggregated ${payments.length} payments from children`);
    } else {
      // For regular or child invoices, get payment history directly
      payments = await storage.getPaymentHistory(req.params.id);
      logger.info(`[Payment History] Regular/child invoice, found ${payments.length} payments`);
    }

    // Enrich with user names
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        const user = await storage.getUser(payment.recordedBy);
        return {
          ...payment,
          recordedByName: user?.name || "Unknown",
        };
      })
    );

    logger.info(`[Payment History] Returning ${enrichedPayments.length} enriched payments`);
    return res.json(enrichedPayments);
  } catch (error) {
    logger.error("Fetch payment history error:", error);
    return res.status(500).json({ error: "Failed to fetch payment history" });
  }
});

// Get Invoice Payment History (Legacy - for backward compatibility)
router.get("/invoices/:id/payment-history", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Parse payment notes to create history (legacy)
    const history = [];
    if (invoice.paymentNotes) {
      const entries = invoice.paymentNotes.split("\n").filter(e => e.trim());
      for (const entry of entries) {
        const match = entry.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z): (.+)$/);
        if (match) {
          history.push({
            date: match[1],
            note: match[2],
          });
        }
      }
    }

    return res.json({
      invoiceId: invoice.id,
      paidAmount: invoice.paidAmount,
      lastPaymentDate: invoice.lastPaymentDate,

      history,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch payment history" });
  }
});

// Delete Payment History Record
router.delete("/payment-history/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // First get the payment record to get invoice details
    const payment = await storage.getPaymentById(req.params.id);

    if (!payment) {
      return res.status(404).json({ error: "Payment record not found" });
    }

    const invoice = await storage.getInvoice(payment.invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const quote = await storage.getQuote(invoice.quoteId || "");
    if (!quote) {
      return res.status(404).json({ error: "Related quote not found" });
    }

    // Delete payment record
    await storage.deletePaymentHistory(req.params.id);

    // Recalculate invoice totals
    const allPayments = await storage.getPaymentHistory(payment.invoiceId);
    const newPaidAmount = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    // Use invoice.total for child invoices, quote.total for regular invoices
    const totalAmount = Number(invoice.total || quote.total);

    let newPaymentStatus: "pending" | "partial" | "paid" | "overdue" = "pending";
    if (newPaidAmount >= totalAmount) {
      newPaymentStatus = "paid";
    } else if (newPaidAmount > 0) {
      newPaymentStatus = "partial";
    }

    const lastPayment = allPayments[0]; // Already sorted by date desc
    await storage.updateInvoice(payment.invoiceId, {
      paidAmount: String(newPaidAmount),
      paymentStatus: newPaymentStatus,
      lastPaymentDate: lastPayment?.paymentDate || null,

    });

    // If this is a child invoice, update the master invoice payment totals
    if (invoice.parentInvoiceId) {
      const masterInvoice = await storage.getInvoice(invoice.parentInvoiceId);
      if (masterInvoice) {
        // Get all child invoices of this master
        const allInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId || "");
        const childInvoices = allInvoices.filter(inv => inv.parentInvoiceId === masterInvoice.id);

        // Calculate total paid amount from all children (with updated payment for current invoice)
        const totalChildPaidAmount = childInvoices.reduce((sum, child) => {
          const childPaid = child.id === invoice.id ? newPaidAmount : Number(child.paidAmount || 0);
          return sum + childPaid;
        }, 0);

        // Update master invoice with aggregated payment data
        const masterTotal = Number(masterInvoice.total);
        let masterPaymentStatus: "pending" | "partial" | "paid" | "overdue" = "pending";
        if (totalChildPaidAmount >= masterTotal) {
          masterPaymentStatus = "paid";
        } else if (totalChildPaidAmount > 0) {
          masterPaymentStatus = "partial";
        }

        await storage.updateInvoice(masterInvoice.id, {
          paidAmount: String(totalChildPaidAmount),
          paymentStatus: masterPaymentStatus,
          lastPaymentDate: totalChildPaidAmount > 0 ? new Date() : null,
        });
      }
    }

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "delete_payment",
      entityType: "invoice",
      entityId: invoice.id,
    });

    return res.json({ success: true });
  } catch (error: any) {
    logger.error("Delete payment error:", error);
    return res.status(500).json({ error: error.message || "Failed to delete payment" });
  }
});

export default router;
