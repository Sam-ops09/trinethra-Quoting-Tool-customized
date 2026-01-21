/**
 * Credit Notes Routes
 * 
 * Handles API endpoints for managing credit notes (refunds/returns)
 * Credit notes reduce the amount owed on an invoice
 */

import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware";
import { requireFeature } from "../feature-flags-middleware";
import { requirePermission } from "../permissions-middleware";
import { logger } from "../utils/logger";
import { db } from "../db";
import * as schema from "../../shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { NumberingService } from "../services/numbering.service";
import { toDecimal, add, subtract, toMoneyString, moneyGte, moneyGt } from "../utils/financial";

const router = Router();

// ==================== GET ALL CREDIT NOTES ====================
router.get("/credit-notes", authMiddleware, requireFeature('creditNotes_module'), async (req: AuthRequest, res: Response) => {
  try {
    const creditNotes = await db.select()
      .from(schema.creditNotes)
      .leftJoin(schema.invoices, eq(schema.creditNotes.invoiceId, schema.invoices.id))
      .leftJoin(schema.clients, eq(schema.creditNotes.clientId, schema.clients.id))
      .leftJoin(schema.users, eq(schema.creditNotes.createdBy, schema.users.id))
      .orderBy(desc(schema.creditNotes.createdAt));

    const formattedNotes = creditNotes.map(row => ({
      ...row.credit_notes,
      invoice: row.invoices ? {
        id: row.invoices.id,
        invoiceNumber: row.invoices.invoiceNumber,
      } : null,
      client: row.clients ? {
        id: row.clients.id,
        name: row.clients.name,
        email: row.clients.email,
      } : null,
      createdByUser: row.users ? {
        id: row.users.id,
        name: row.users.name,
      } : null,
    }));

    return res.json(formattedNotes);
  } catch (error: any) {
    logger.error("Get credit notes error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch credit notes" });
  }
});

// ==================== GET CREDIT NOTE BY ID ====================
router.get("/credit-notes/:id", authMiddleware, requireFeature('creditNotes_module'), async (req: AuthRequest, res: Response) => {
  try {
    const [creditNote] = await db.select()
      .from(schema.creditNotes)
      .where(eq(schema.creditNotes.id, req.params.id));

    if (!creditNote) {
      return res.status(404).json({ error: "Credit note not found" });
    }

    // Get items
    const items = await db.select()
      .from(schema.creditNoteItems)
      .where(eq(schema.creditNoteItems.creditNoteId, req.params.id))
      .orderBy(schema.creditNoteItems.sortOrder);

    // Get invoice details (only if invoiceId is set)
    let invoice = null;
    if (creditNote.invoiceId) {
      const [foundInvoice] = await db.select()
        .from(schema.invoices)
        .where(eq(schema.invoices.id, creditNote.invoiceId));
      invoice = foundInvoice || null;
    }

    // Get client details
    const [client] = await db.select()
      .from(schema.clients)
      .where(eq(schema.clients.id, creditNote.clientId));

    // Get creator details
    const [creator] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.id, creditNote.createdBy));

    return res.json({
      ...creditNote,
      items,
      invoice: invoice ? {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        paidAmount: invoice.paidAmount,
        paymentStatus: invoice.paymentStatus,
      } : null,
      client: client ? {
        id: client.id,
        name: client.name,
        email: client.email,
      } : null,
      createdByUser: creator ? {
        id: creator.id,
        name: creator.name,
      } : null,
    });
  } catch (error: any) {
    logger.error("Get credit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch credit note" });
  }
});

// ==================== GET CREDIT NOTES BY INVOICE ====================
router.get("/invoices/:invoiceId/credit-notes", authMiddleware, requireFeature('creditNotes_module'), async (req: AuthRequest, res: Response) => {
  try {
    const creditNotes = await db.select()
      .from(schema.creditNotes)
      .where(eq(schema.creditNotes.invoiceId, req.params.invoiceId))
      .orderBy(desc(schema.creditNotes.createdAt));

    return res.json(creditNotes);
  } catch (error: any) {
    logger.error("Get invoice credit notes error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch credit notes" });
  }
});

// ==================== CREATE CREDIT NOTE ====================
router.post("/credit-notes", authMiddleware, requireFeature('creditNotes_create'), requirePermission("credit_notes", "create"), async (req: AuthRequest, res: Response) => {
  try {
    const { invoiceId, clientId: directClientId, reason, items, notes, currency = "INR", cgst = "0", sgst = "0", igst = "0" } = req.body;

    // Validation: require reason and items
    if (!reason || !items || items.length === 0) {
      return res.status(400).json({ error: "Reason and at least one item are required" });
    }

    // Determine the clientId - either from invoice or directly provided
    let resolvedClientId: string;
    let invoice = null;

    if (invoiceId) {
      // Verify invoice exists
      const [foundInvoice] = await db.select()
        .from(schema.invoices)
        .where(eq(schema.invoices.id, invoiceId));

      if (!foundInvoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      invoice = foundInvoice;
      resolvedClientId = invoice.clientId!;
    } else if (directClientId) {
      // Verify client exists for standalone notes
      const [client] = await db.select()
        .from(schema.clients)
        .where(eq(schema.clients.id, directClientId));

      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      resolvedClientId = directClientId;
    } else {
      return res.status(400).json({ error: "Either invoiceId or clientId is required" });
    }

    // Generate credit note number
    const creditNoteNumber = await NumberingService.generateCreditNoteNumber();

    // Calculate totals
    let subtotal = toDecimal(0);
    for (const item of items) {
      const itemSubtotal = toDecimal(item.quantity).times(toDecimal(item.unitPrice));
      subtotal = subtotal.plus(itemSubtotal);
    }

    const total = subtotal.plus(toDecimal(cgst)).plus(toDecimal(sgst)).plus(toDecimal(igst));

    const result = await db.transaction(async (tx) => {
      // Create credit note
      const [creditNote] = await tx.insert(schema.creditNotes).values({
        creditNoteNumber,
        invoiceId: invoiceId || null,
        clientId: resolvedClientId,
        status: "draft",
        issueDate: new Date(),
        reason,
        currency,
        subtotal: toMoneyString(subtotal),
        cgst,
        sgst,
        igst,
        total: toMoneyString(total),
        notes,
        createdBy: req.user!.id,
      }).returning();

      // Create items
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemSubtotal = toDecimal(item.quantity).times(toDecimal(item.unitPrice));
        
        await tx.insert(schema.creditNoteItems).values({
          creditNoteId: creditNote.id,
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: String(item.unitPrice),
          subtotal: toMoneyString(itemSubtotal),
          hsnSac: item.hsnSac || null,
          sortOrder: i,
        });
      }

      // Log activity
      await tx.insert(schema.activityLogs).values({
        userId: req.user!.id,
        action: "create_credit_note",
        entityType: "credit_note",
        entityId: creditNote.id,
        timestamp: new Date(),
      });

      return creditNote;
    });

    return res.status(201).json(result);
  } catch (error: any) {
    logger.error("Create credit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to create credit note" });
  }
});

// ==================== UPDATE CREDIT NOTE ====================
router.put("/credit-notes/:id", authMiddleware, requireFeature('creditNotes_edit'), requirePermission("credit_notes", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    const { reason, items, notes, cgst = "0", sgst = "0", igst = "0", invoiceId } = req.body;

    // Verify credit note exists and is in draft status
    const [existing] = await db.select()
      .from(schema.creditNotes)
      .where(eq(schema.creditNotes.id, req.params.id));

    if (!existing) {
      return res.status(404).json({ error: "Credit note not found" });
    }

    if (existing.status !== "draft") {
      return res.status(400).json({ error: "Only draft credit notes can be edited" });
    }

    // Calculate new totals
    let subtotal = toDecimal(0);
    if (items) {
      for (const item of items) {
        const itemSubtotal = toDecimal(item.quantity).times(toDecimal(item.unitPrice));
        subtotal = subtotal.plus(itemSubtotal);
      }
    }
    
    // Validate invoiceId if provided (for linking/unlinking)
    let finalInvoiceId = existing.invoiceId;
    if (invoiceId !== undefined) {
      if (invoiceId === null) {
        finalInvoiceId = null; // Unlink
      } else {
        // Verify invoice exists and belongs to same client
        const [targetInvoice] = await db.select()
          .from(schema.invoices)
          .where(eq(schema.invoices.id, invoiceId));
        
        if (!targetInvoice) {
          return res.status(404).json({ error: "Target invoice not found" });
        }
        if (targetInvoice.clientId !== existing.clientId) {
          return res.status(400).json({ error: "Target invoice must belong to the same client" });
        }
        finalInvoiceId = invoiceId;
      }
    }

    const total = subtotal.plus(toDecimal(cgst)).plus(toDecimal(sgst)).plus(toDecimal(igst));

    const result = await db.transaction(async (tx) => {
      // Update credit note
      const [updated] = await tx.update(schema.creditNotes)
        .set({
          reason: reason || existing.reason,
          invoiceId: finalInvoiceId,
          notes: notes !== undefined ? notes : existing.notes,
          cgst,
          sgst,
          igst,
          subtotal: toMoneyString(subtotal),
          total: toMoneyString(total),
          updatedAt: new Date(),
        })
        .where(eq(schema.creditNotes.id, req.params.id))
        .returning();

      // Update items if provided
      if (items) {
        // Delete existing items
        await tx.delete(schema.creditNoteItems)
          .where(eq(schema.creditNoteItems.creditNoteId, req.params.id));

        // Create new items
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemSubtotal = toDecimal(item.quantity).times(toDecimal(item.unitPrice));
          
          await tx.insert(schema.creditNoteItems).values({
            creditNoteId: req.params.id,
            productId: item.productId || null,
            description: item.description,
            quantity: item.quantity,
            unitPrice: String(item.unitPrice),
            subtotal: toMoneyString(itemSubtotal),
            hsnSac: item.hsnSac || null,
            sortOrder: i,
          });
        }
      }

      // Log activity
      await tx.insert(schema.activityLogs).values({
        userId: req.user!.id,
        action: "update_credit_note",
        entityType: "credit_note",
        entityId: req.params.id,
        timestamp: new Date(),
      });

      return updated;
    });

    return res.json(result);
  } catch (error: any) {
    logger.error("Update credit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to update credit note" });
  }
});

// ==================== DELETE CREDIT NOTE ====================
router.delete("/credit-notes/:id", authMiddleware, requireFeature('creditNotes_delete'), requirePermission("credit_notes", "delete"), async (req: AuthRequest, res: Response) => {
  try {
    // Verify credit note exists and is in draft status
    const [existing] = await db.select()
      .from(schema.creditNotes)
      .where(eq(schema.creditNotes.id, req.params.id));

    if (!existing) {
      return res.status(404).json({ error: "Credit note not found" });
    }

    if (existing.status !== "draft") {
      return res.status(400).json({ error: "Only draft credit notes can be deleted" });
    }

    await db.transaction(async (tx) => {
      // Delete items first (cascade should handle this, but being explicit)
      await tx.delete(schema.creditNoteItems)
        .where(eq(schema.creditNoteItems.creditNoteId, req.params.id));

      // Delete credit note
      await tx.delete(schema.creditNotes)
        .where(eq(schema.creditNotes.id, req.params.id));

      // Log activity
      await tx.insert(schema.activityLogs).values({
        userId: req.user!.id,
        action: "delete_credit_note",
        entityType: "credit_note",
        entityId: req.params.id,
        timestamp: new Date(),
      });
    });

    return res.json({ success: true });
  } catch (error: any) {
    logger.error("Delete credit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to delete credit note" });
  }
});

// ==================== ISSUE CREDIT NOTE ====================
router.post("/credit-notes/:id/issue", authMiddleware, requireFeature('creditNotes_issue'), requirePermission("credit_notes", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    // Verify credit note exists and is in draft status
    const [existing] = await db.select()
      .from(schema.creditNotes)
      .where(eq(schema.creditNotes.id, req.params.id));

    if (!existing) {
      return res.status(404).json({ error: "Credit note not found" });
    }

    if (existing.status !== "draft") {
      return res.status(400).json({ error: "Credit note has already been issued" });
    }

    const result = await db.transaction(async (tx) => {
      // Update status to issued
      const [updated] = await tx.update(schema.creditNotes)
        .set({
          status: "issued",
          issueDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.creditNotes.id, req.params.id))
        .returning();

      // Log activity
      await tx.insert(schema.activityLogs).values({
        userId: req.user!.id,
        action: "issue_credit_note",
        entityType: "credit_note",
        entityId: req.params.id,
        timestamp: new Date(),
      });

      return updated;
    });

    return res.json(result);
  } catch (error: any) {
    logger.error("Issue credit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to issue credit note" });
  }
});

// ==================== APPLY CREDIT NOTE TO INVOICE ====================
router.post("/credit-notes/:id/apply", authMiddleware, requireFeature('creditNotes_apply'), requirePermission("credit_notes", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    // Verify credit note exists and is in issued status
    const [creditNote] = await db.select()
      .from(schema.creditNotes)
      .where(eq(schema.creditNotes.id, req.params.id));

    if (!creditNote) {
      return res.status(404).json({ error: "Credit note not found" });
    }

    if (creditNote.status !== "issued") {
      return res.status(400).json({ error: "Credit note must be issued before applying" });
    }

    // Ensure credit note has an associated invoice for applying
    if (!creditNote.invoiceId) {
      return res.status(400).json({ error: "Cannot apply a standalone credit note without an invoice" });
    }

    // Get the invoice
    const [invoice] = await db.select()
      .from(schema.invoices)
      .where(eq(schema.invoices.id, creditNote.invoiceId));

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const creditAmount = toDecimal(creditNote.total);
    const currentPaid = toDecimal(invoice.paidAmount);
    const invoiceTotal = toDecimal(invoice.total);

    // Apply credit as if it were a payment
    const newPaidAmount = currentPaid.plus(creditAmount);
    const newRemainingAmount = invoiceTotal.minus(newPaidAmount);

    // Determine new payment status
    let newPaymentStatus: string = invoice.paymentStatus || "pending";
    if (moneyGte(newPaidAmount, invoiceTotal)) {
      newPaymentStatus = "paid";
    } else if (moneyGt(newPaidAmount, 0)) {
      newPaymentStatus = "partial";
    }

    const result = await db.transaction(async (tx) => {
      // Update credit note status to applied
      const [updatedCreditNote] = await tx.update(schema.creditNotes)
        .set({
          status: "applied",
          appliedAmount: creditNote.total,
          updatedAt: new Date(),
        })
        .where(eq(schema.creditNotes.id, req.params.id))
        .returning();

      // Update invoice with adjusted amounts
      await tx.update(schema.invoices)
        .set({
          paidAmount: toMoneyString(newPaidAmount),
          remainingAmount: toMoneyString(newRemainingAmount.isNegative() ? toDecimal(0) : newRemainingAmount),
          paymentStatus: newPaymentStatus,
          updatedAt: new Date(),
        })
        .where(eq(schema.invoices.id, creditNote.invoiceId!));

      // Log activity
      await tx.insert(schema.activityLogs).values({
        userId: req.user!.id,
        action: "apply_credit_note",
        entityType: "credit_note",
        entityId: req.params.id,
        timestamp: new Date(),
      });

      return updatedCreditNote;
    });

    return res.json(result);
  } catch (error: any) {
    logger.error("Apply credit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to apply credit note" });
  }
});

// ==================== CANCEL CREDIT NOTE ====================
router.post("/credit-notes/:id/cancel", authMiddleware, requireFeature('creditNotes_edit'), requirePermission("credit_notes", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    const [existing] = await db.select()
      .from(schema.creditNotes)
      .where(eq(schema.creditNotes.id, req.params.id));

    if (!existing) {
      return res.status(404).json({ error: "Credit note not found" });
    }

    if (existing.status === "applied") {
      return res.status(400).json({ error: "Applied credit notes cannot be cancelled" });
    }

    if (existing.status === "cancelled") {
      return res.status(400).json({ error: "Credit note is already cancelled" });
    }

    const result = await db.transaction(async (tx) => {
      const [updated] = await tx.update(schema.creditNotes)
        .set({
          status: "cancelled",
          updatedAt: new Date(),
        })
        .where(eq(schema.creditNotes.id, req.params.id))
        .returning();

      await tx.insert(schema.activityLogs).values({
        userId: req.user!.id,
        action: "cancel_credit_note",
        entityType: "credit_note",
        entityId: req.params.id,
        timestamp: new Date(),
      });

      return updated;
    });

    return res.json(result);
  } catch (error: any) {
    logger.error("Cancel credit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to cancel credit note" });
  }
});

export default router;
