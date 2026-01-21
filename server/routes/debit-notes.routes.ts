/**
 * Debit Notes Routes
 * 
 * Handles API endpoints for managing debit notes (additional charges)
 * Debit notes increase the amount owed on an invoice
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

// ==================== GET ALL DEBIT NOTES ====================
router.get("/debit-notes", authMiddleware, requireFeature('debitNotes_module'), async (req: AuthRequest, res: Response) => {
  try {
    const debitNotes = await db.select()
      .from(schema.debitNotes)
      .leftJoin(schema.invoices, eq(schema.debitNotes.invoiceId, schema.invoices.id))
      .leftJoin(schema.clients, eq(schema.debitNotes.clientId, schema.clients.id))
      .leftJoin(schema.users, eq(schema.debitNotes.createdBy, schema.users.id))
      .orderBy(desc(schema.debitNotes.createdAt));

    const formattedNotes = debitNotes.map(row => ({
      ...row.debit_notes,
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
    logger.error("Get debit notes error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch debit notes" });
  }
});

// ==================== GET DEBIT NOTE BY ID ====================
router.get("/debit-notes/:id", authMiddleware, requireFeature('debitNotes_module'), async (req: AuthRequest, res: Response) => {
  try {
    const [debitNote] = await db.select()
      .from(schema.debitNotes)
      .where(eq(schema.debitNotes.id, req.params.id));

    if (!debitNote) {
      return res.status(404).json({ error: "Debit note not found" });
    }

    // Get items
    const items = await db.select()
      .from(schema.debitNoteItems)
      .where(eq(schema.debitNoteItems.debitNoteId, req.params.id))
      .orderBy(schema.debitNoteItems.sortOrder);

    // Get invoice details (only if invoiceId is set)
    let invoice = null;
    if (debitNote.invoiceId) {
      const [foundInvoice] = await db.select()
        .from(schema.invoices)
        .where(eq(schema.invoices.id, debitNote.invoiceId));
      invoice = foundInvoice || null;
    }

    // Get client details
    const [client] = await db.select()
      .from(schema.clients)
      .where(eq(schema.clients.id, debitNote.clientId));

    // Get creator details
    const [creator] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.id, debitNote.createdBy));

    return res.json({
      ...debitNote,
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
    logger.error("Get debit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch debit note" });
  }
});

// ==================== GET DEBIT NOTES BY INVOICE ====================
router.get("/invoices/:invoiceId/debit-notes", authMiddleware, requireFeature('debitNotes_module'), async (req: AuthRequest, res: Response) => {
  try {
    const debitNotes = await db.select()
      .from(schema.debitNotes)
      .where(eq(schema.debitNotes.invoiceId, req.params.invoiceId))
      .orderBy(desc(schema.debitNotes.createdAt));

    return res.json(debitNotes);
  } catch (error: any) {
    logger.error("Get invoice debit notes error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch debit notes" });
  }
});

// ==================== CREATE DEBIT NOTE ====================
router.post("/debit-notes", authMiddleware, requireFeature('debitNotes_create'), requirePermission("debit_notes", "create"), async (req: AuthRequest, res: Response) => {
  try {
    const { invoiceId, reason, items, notes, currency = "INR", cgst = "0", sgst = "0", igst = "0" } = req.body;

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
    } else if (req.body.clientId) {
      // Verify client exists for standalone notes
      const [client] = await db.select()
        .from(schema.clients)
        .where(eq(schema.clients.id, req.body.clientId));

      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      resolvedClientId = req.body.clientId;
    } else {
      return res.status(400).json({ error: "Either invoiceId or clientId is required" });
    }

    // Generate debit note number
    const debitNoteNumber = await NumberingService.generateDebitNoteNumber();

    // Calculate totals
    let subtotal = toDecimal(0);
    for (const item of items) {
      const itemSubtotal = toDecimal(item.quantity).times(toDecimal(item.unitPrice));
      subtotal = subtotal.plus(itemSubtotal);
    }

    const total = subtotal.plus(toDecimal(cgst)).plus(toDecimal(sgst)).plus(toDecimal(igst));

    const result = await db.transaction(async (tx) => {
      // Create debit note
      const [debitNote] = await tx.insert(schema.debitNotes).values({
        debitNoteNumber,
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
        
        await tx.insert(schema.debitNoteItems).values({
          debitNoteId: debitNote.id,
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
        action: "create_debit_note",
        entityType: "debit_note",
        entityId: debitNote.id,
        timestamp: new Date(),
      });

      return debitNote;
    });

    return res.status(201).json(result);
  } catch (error: any) {
    logger.error("Create debit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to create debit note" });
  }
});

// ==================== UPDATE DEBIT NOTE ====================
router.put("/debit-notes/:id", authMiddleware, requireFeature('debitNotes_edit'), requirePermission("debit_notes", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    const { reason, items, notes, cgst = "0", sgst = "0", igst = "0", invoiceId } = req.body;

    // Verify debit note exists and is in draft status
    const [existing] = await db.select()
      .from(schema.debitNotes)
      .where(eq(schema.debitNotes.id, req.params.id));

    if (!existing) {
      return res.status(404).json({ error: "Debit note not found" });
    }

    if (existing.status !== "draft") {
      return res.status(400).json({ error: "Only draft debit notes can be edited" });
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
      // Update debit note
      const [updated] = await tx.update(schema.debitNotes)
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
        .where(eq(schema.debitNotes.id, req.params.id))
        .returning();

      // Update items if provided
      if (items) {
        // Delete existing items
        await tx.delete(schema.debitNoteItems)
          .where(eq(schema.debitNoteItems.debitNoteId, req.params.id));

        // Create new items
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemSubtotal = toDecimal(item.quantity).times(toDecimal(item.unitPrice));
          
          await tx.insert(schema.debitNoteItems).values({
            debitNoteId: req.params.id,
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
        action: "update_debit_note",
        entityType: "debit_note",
        entityId: req.params.id,
        timestamp: new Date(),
      });

      return updated;
    });

    return res.json(result);
  } catch (error: any) {
    logger.error("Update debit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to update debit note" });
  }
});

// ==================== DELETE DEBIT NOTE ====================
router.delete("/debit-notes/:id", authMiddleware, requireFeature('debitNotes_delete'), requirePermission("debit_notes", "delete"), async (req: AuthRequest, res: Response) => {
  try {
    // Verify debit note exists and is in draft status
    const [existing] = await db.select()
      .from(schema.debitNotes)
      .where(eq(schema.debitNotes.id, req.params.id));

    if (!existing) {
      return res.status(404).json({ error: "Debit note not found" });
    }

    if (existing.status !== "draft") {
      return res.status(400).json({ error: "Only draft debit notes can be deleted" });
    }

    await db.transaction(async (tx) => {
      // Delete items first
      await tx.delete(schema.debitNoteItems)
        .where(eq(schema.debitNoteItems.debitNoteId, req.params.id));

      // Delete debit note
      await tx.delete(schema.debitNotes)
        .where(eq(schema.debitNotes.id, req.params.id));

      // Log activity
      await tx.insert(schema.activityLogs).values({
        userId: req.user!.id,
        action: "delete_debit_note",
        entityType: "debit_note",
        entityId: req.params.id,
        timestamp: new Date(),
      });
    });

    return res.json({ success: true });
  } catch (error: any) {
    logger.error("Delete debit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to delete debit note" });
  }
});

// ==================== ISSUE DEBIT NOTE ====================
router.post("/debit-notes/:id/issue", authMiddleware, requireFeature('debitNotes_issue'), requirePermission("debit_notes", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    // Verify debit note exists and is in draft status
    const [existing] = await db.select()
      .from(schema.debitNotes)
      .where(eq(schema.debitNotes.id, req.params.id));

    if (!existing) {
      return res.status(404).json({ error: "Debit note not found" });
    }

    if (existing.status !== "draft") {
      return res.status(400).json({ error: "Debit note has already been issued" });
    }

    const result = await db.transaction(async (tx) => {
      // Update status to issued
      const [updated] = await tx.update(schema.debitNotes)
        .set({
          status: "issued",
          issueDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.debitNotes.id, req.params.id))
        .returning();

      // Log activity
      await tx.insert(schema.activityLogs).values({
        userId: req.user!.id,
        action: "issue_debit_note",
        entityType: "debit_note",
        entityId: req.params.id,
        timestamp: new Date(),
      });

      return updated;
    });

    return res.json(result);
  } catch (error: any) {
    logger.error("Issue debit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to issue debit note" });
  }
});

// ==================== APPLY DEBIT NOTE TO INVOICE ====================
router.post("/debit-notes/:id/apply", authMiddleware, requireFeature('debitNotes_apply'), requirePermission("debit_notes", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    // Verify debit note exists and is in issued status
    const [debitNote] = await db.select()
      .from(schema.debitNotes)
      .where(eq(schema.debitNotes.id, req.params.id));

    if (!debitNote) {
      return res.status(404).json({ error: "Debit note not found" });
    }

    if (debitNote.status !== "issued") {
      return res.status(400).json({ error: "Debit note must be issued before applying" });
    }

    // Ensure debit note has an associated invoice for applying
    if (!debitNote.invoiceId) {
      return res.status(400).json({ error: "Cannot apply a standalone debit note without an invoice" });
    }

    // Get the invoice
    const [invoice] = await db.select()
      .from(schema.invoices)
      .where(eq(schema.invoices.id, debitNote.invoiceId));

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const debitAmount = toDecimal(debitNote.total);
    const invoiceTotal = toDecimal(invoice.total);
    const currentPaid = toDecimal(invoice.paidAmount);

    // Debit note increases the invoice total, effectively reducing paid percentage
    // We increase the invoice total and remaining amount
    const newInvoiceTotal = invoiceTotal.plus(debitAmount);
    const newRemainingAmount = newInvoiceTotal.minus(currentPaid);

    // Determine new payment status
    let newPaymentStatus: string = invoice.paymentStatus || "pending";
    if (moneyGte(currentPaid, newInvoiceTotal)) {
      newPaymentStatus = "paid";
    } else if (moneyGt(currentPaid, 0)) {
      newPaymentStatus = "partial";
    } else {
      newPaymentStatus = "pending";
    }

    const result = await db.transaction(async (tx) => {
      // Update debit note status to applied
      const [updatedDebitNote] = await tx.update(schema.debitNotes)
        .set({
          status: "applied",
          appliedAmount: debitNote.total,
          updatedAt: new Date(),
        })
        .where(eq(schema.debitNotes.id, req.params.id))
        .returning();

      // Update invoice with adjusted amounts
      // Note: We adjust the total of the invoice to reflect additional charges
      await tx.update(schema.invoices)
        .set({
          total: toMoneyString(newInvoiceTotal),
          remainingAmount: toMoneyString(newRemainingAmount),
          paymentStatus: newPaymentStatus,
          updatedAt: new Date(),
        })
        .where(eq(schema.invoices.id, debitNote.invoiceId!));

      // Log activity
      await tx.insert(schema.activityLogs).values({
        userId: req.user!.id,
        action: "apply_debit_note",
        entityType: "debit_note",
        entityId: req.params.id,
        timestamp: new Date(),
      });

      return updatedDebitNote;
    });

    return res.json(result);
  } catch (error: any) {
    logger.error("Apply debit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to apply debit note" });
  }
});

// ==================== CANCEL DEBIT NOTE ====================
router.post("/debit-notes/:id/cancel", authMiddleware, requireFeature('debitNotes_edit'), requirePermission("debit_notes", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    const [existing] = await db.select()
      .from(schema.debitNotes)
      .where(eq(schema.debitNotes.id, req.params.id));

    if (!existing) {
      return res.status(404).json({ error: "Debit note not found" });
    }

    if (existing.status === "applied") {
      return res.status(400).json({ error: "Applied debit notes cannot be cancelled" });
    }

    if (existing.status === "cancelled") {
      return res.status(400).json({ error: "Debit note is already cancelled" });
    }

    const result = await db.transaction(async (tx) => {
      const [updated] = await tx.update(schema.debitNotes)
        .set({
          status: "cancelled",
          updatedAt: new Date(),
        })
        .where(eq(schema.debitNotes.id, req.params.id))
        .returning();

      await tx.insert(schema.activityLogs).values({
        userId: req.user!.id,
        action: "cancel_debit_note",
        entityType: "debit_note",
        entityId: req.params.id,
        timestamp: new Date(),
      });

      return updated;
    });

    return res.json(result);
  } catch (error: any) {
    logger.error("Cancel debit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to cancel debit note" });
  }
});

export default router;
