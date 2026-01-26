
import { Router, Response } from "express";
import { storage } from "../storage";
import { authMiddleware, AuthRequest } from "../middleware";
import { requireFeature } from "../feature-flags-middleware";
import { requirePermission } from "../permissions-middleware";
import { logger } from "../utils/logger";
import { db } from "../db";
import * as schema from "../../shared/schema";
import { eq, sql } from "drizzle-orm";
import { NumberingService } from "../services/numbering.service";
import { InvoicePDFService } from "../services/invoice-pdf.service";
import { EmailService } from "../services/email.service";
import { calculateLineSubtotal, toMoneyString, toDecimal } from "../utils/financial";

const router = Router();

// ==================== INVOICES ROUTES ====================

router.get("/", requireFeature('invoices_module'), authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const invoices = await storage.getAllInvoices();
    const invoicesWithDetails = await Promise.all(
      invoices.map(async (invoice) => {
        const client = invoice.clientId ? await storage.getClient(invoice.clientId) : undefined;
        return {
          ...invoice,
          clientName: client?.name || "Unknown",
        };
      })
    );
    res.json(invoicesWithDetails);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

router.get("/:id", requireFeature('invoices_module'), authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
    }

    const client = invoice.clientId ? await storage.getClient(invoice.clientId) : undefined;
    const items = await storage.getInvoiceItems(invoice.id);
    const creator = invoice.createdBy ? await storage.getUser(invoice.createdBy) : undefined;

    // Get parent invoice if this is a child
    let parentInvoice = undefined;
    if (invoice.parentInvoiceId) {
        parentInvoice = await storage.getInvoice(invoice.parentInvoiceId);
    }

    // Get child invoices if this is a master
    let childInvoices: any[] = [];
    if (invoice.isMaster) {
        if (invoice.quoteId) {
            const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId || "");
            childInvoices = allInvoices.filter((inv: any) => inv.parentInvoiceId === invoice.id);
        } else if (invoice.salesOrderId) {
            const allInvoices = await storage.getInvoicesBySalesOrder(invoice.salesOrderId);
            childInvoices = allInvoices.filter((inv: any) => inv.parentInvoiceId === invoice.id);
        }
    }

    // Ensure items are properly formatted with all necessary fields
    const formattedItems = items.map(item => ({
        ...item,
        productId: item.productId,
        quantity: Number(item.quantity),
        unitPrice: String(item.unitPrice),
        subtotal: String(item.subtotal),
        fulfilledQuantity: Number(item.fulfilledQuantity || 0),
        status: item.status || "pending"
    }));

    res.json({
        ...invoice,
        client,
        items: formattedItems,
        createdByName: creator?.name || "Unknown",
        parentInvoice,
        childInvoices,
    });
  } catch (error) {
    logger.error("Error fetching invoice:", error);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

// Update Master Invoice Status (Draft -> Confirmed -> Locked)
router.put("/:id/master-status", authMiddleware, requireFeature('invoices_finalize'), requirePermission("invoices", "finalize"), async (req: AuthRequest, res: Response) => {
  try {
    const { masterInvoiceStatus } = req.body;

    if (!["draft", "confirmed", "locked"].includes(masterInvoiceStatus)) {
      return res.status(400).json({ error: "Invalid master invoice status" });
    }

    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (!invoice.isMaster) {
      return res.status(400).json({ error: "This is not a master invoice" });
    }

    // Validate status transitions
    const currentStatus = invoice.masterInvoiceStatus;
    const validTransitions: Record<string, string[]> = {
      "draft": ["confirmed"],
      "confirmed": ["locked"],
      "locked": [], // Cannot transition from locked
    };

    if (currentStatus && !validTransitions[currentStatus]?.includes(masterInvoiceStatus)) {
      return res.status(400).json({
        error: `Cannot transition from ${currentStatus} to ${masterInvoiceStatus}`
      });
    }

    const updatedInvoice = await storage.updateInvoice(req.params.id, {
      masterInvoiceStatus: masterInvoiceStatus as "draft" | "confirmed" | "locked",
    });

    await storage.createActivityLog({
      userId: req.user!.id,
      action: `master_invoice_${masterInvoiceStatus}`,
      entityType: "invoice",
      entityId: invoice.id,
    });

    res.json({ success: true, invoice: updatedInvoice });
  } catch (error: any) {
    logger.error("Update master invoice status error:", error);
    return res.status(500).json({ error: error.message || "Failed to update master invoice status" });
  }
});

// Update Master Invoice (with edit restrictions based on status)
// Also works for Child Invoices (editable until paid)
router.put("/:id/master-details", authMiddleware, requireFeature('invoices_edit'), requirePermission("invoices", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    const result = await db.transaction(async (tx) => {
        const invoice = await storage.getInvoice(req.params.id);
        if (!invoice) {
            throw new Error("Invoice not found");
        }

        const isMasterInvoice = invoice.isMaster;
        const isChildInvoice = !!invoice.parentInvoiceId;
        const isRegularInvoice = !isMasterInvoice && !isChildInvoice;

        if (isMasterInvoice) {
            if (invoice.masterInvoiceStatus === "locked") {
                const error: any = new Error("Cannot edit a locked master invoice");
                error.statusCode = 400;
                throw error;
            }
        } else if (isChildInvoice || isRegularInvoice) {
            if (invoice.paymentStatus === "paid") {
                const error: any = new Error("Cannot edit a paid invoice");
                error.statusCode = 400;
                throw error;
            }
        }

        const isDraft = isMasterInvoice
        ? (!invoice.masterInvoiceStatus || invoice.masterInvoiceStatus === "draft")
        : (invoice.paymentStatus !== "paid"); 

        const updateData: any = {};

        if (isDraft) {
            const editableFields = [
                "notes", "termsAndConditions", "deliveryNotes", "milestoneDescription",
                "dueDate", "subtotal", "discount", "cgst", "sgst", "igst",
                "shippingCharges", "total", "paymentStatus", "paidAmount", "bomSection"
            ];

            for (const field of editableFields) {
                if (req.body[field] !== undefined) {
                    updateData[field] = req.body[field];
                }
            }

            if (req.body.items && Array.isArray(req.body.items)) {
                if (isChildInvoice && invoice.parentInvoiceId) {
                    const masterInvoice = await storage.getInvoice(invoice.parentInvoiceId);
                    if (masterInvoice) {
                        const masterItems = await storage.getInvoiceItems(masterInvoice.id);
                        const allChildInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId || "");
                        const siblingInvoices = allChildInvoices.filter(
                            inv => inv.parentInvoiceId === masterInvoice.id && inv.id !== invoice.id
                        );

                        const invoicedQuantities: Record<string, number> = {};
                        for (const sibling of siblingInvoices) {
                            const siblingItems = await storage.getInvoiceItems(sibling.id);
                            for (const item of siblingItems) {
                                const key = item.productId || item.description;
                                invoicedQuantities[key] = (invoicedQuantities[key] || 0) + item.quantity;
                            }
                        }

                        for (const newItem of req.body.items) {
                            const masterItem = masterItems.find(mi => (mi.productId && mi.productId === newItem.productId) || mi.description === newItem.description);
                            if (!masterItem) {
                                const error: any = new Error(`Item "${newItem.description}" not found in master invoice`);
                                error.statusCode = 400;
                                throw error;
                            }

                            const key = newItem.productId || newItem.description;
                            const alreadyInvoiced = invoicedQuantities[key] || 0;
                            const remaining = masterItem.quantity - alreadyInvoiced;

                            if (newItem.quantity > remaining) {
                                const error: any = new Error(`Item "${newItem.description}" quantity (${newItem.quantity}) exceeds remaining quantity (${remaining})`);
                                error.statusCode = 400;
                                throw error;
                            }
                        }
                    }
                }

                // Delete existing items using tx
                await tx.delete(schema.invoiceItems).where(eq(schema.invoiceItems.invoiceId, invoice.id));

                // Create new items using tx
                for (const item of req.body.items) {
                    await tx.insert(schema.invoiceItems).values({
                        invoiceId: invoice.id,
                        productId: item.productId || null,
                        description: item.description,
                        quantity: item.quantity,
                        fulfilledQuantity: item.fulfilledQuantity || 0,
                        unitPrice: item.unitPrice,
                        subtotal: toMoneyString(item.subtotal || calculateLineSubtotal(item.quantity, item.unitPrice)),
                        serialNumbers: item.serialNumbers || null,
                        status: item.status || "pending",
                        sortOrder: item.sortOrder || 0,
                        hsnSac: item.hsnSac || null,
                    });
                }
            }
        } else {
            const allowedFields = ["notes", "termsAndConditions", "deliveryNotes", "milestoneDescription"];
            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    updateData[field] = req.body[field];
                }
            }
        }

        if (Object.keys(updateData).length === 0 && (!isDraft || !req.body.items)) {
            const error: any = new Error("No valid fields to update");
            error.statusCode = 400;
            throw error;
        }

        let updatedInvoice;
        if (Object.keys(updateData).length > 0) {
            // Update invoice using tx
            [updatedInvoice] = await tx.update(schema.invoices)
                .set(updateData)
                .where(eq(schema.invoices.id, req.params.id))
                .returning();
        } else {
            updatedInvoice = invoice;
        }

        await tx.insert(schema.activityLogs).values({
            userId: req.user!.id,
            action: "update_master_invoice",
            entityType: "invoice",
            entityId: invoice.id,
        });

        return { success: true, invoice: updatedInvoice };
    });

    res.json(result);
  } catch (error: any) {
    logger.error("Update master invoice error:", error);
    if (error.statusCode === 400) {
        return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || "Failed to update master invoice" });
  }
});

// Finalize Invoice
router.put("/:id/finalize", authMiddleware, requireFeature('invoices_finalize'), requirePermission("invoices", "finalize"), async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
    }

    // Validation: Cannot finalize if already paid
    if (invoice.paymentStatus === "paid") {
        return res.status(400).json({ error: "Cannot finalize paid invoices" });
    }

    // Validation: Cannot finalize if cancelled
    if (invoice.status === "cancelled") {
        return res.status(400).json({ error: "Cannot finalize cancelled invoices" });
    }

    // For master invoices, must be confirmed first
    if (invoice.isMaster && invoice.masterInvoiceStatus !== "confirmed" && invoice.masterInvoiceStatus !== "locked") {
        return res.status(400).json({ error: "Master invoice must be confirmed before finalizing" });
    }

    const updatedInvoice = await storage.updateInvoice(req.params.id, {
        finalizedAt: new Date(),
        finalizedBy: req.user!.id,
        status: invoice.status === "draft" ? ("sent" as any) : invoice.status as any,
    });

    await storage.createActivityLog({
        userId: req.user!.id,
        action: "invoice_finalized",
        entityType: "invoice",
        entityId: invoice.id,
    });

    res.json({ success: true, invoice: updatedInvoice });
  } catch (error: any) {
    logger.error("Finalize invoice error:", error);
    return res.status(500).json({ error: error.message || "Failed to finalize invoice" });
  }
});

// Lock/Unlock Invoice
router.put("/:id/lock", authMiddleware, requireFeature('invoices_lock'), requirePermission("invoices", "lock"), async (req: AuthRequest, res: Response) => {
  try {
    const { isLocked } = req.body;

    if (typeof isLocked !== "boolean") {
        return res.status(400).json({ error: "isLocked must be a boolean" });
    }

    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
    }

    // Validation: Can only lock finalized or paid invoices
    if (isLocked && !invoice.finalizedAt && invoice.paymentStatus !== "paid") {
        return res.status(400).json({ error: "Can only lock finalized or paid invoices" });
    }

    const updatedInvoice = await storage.updateInvoice(req.params.id, {
        isLocked,
    });

    await storage.createActivityLog({
        userId: req.user!.id,
        action: isLocked ? "invoice_locked" : "invoice_unlocked",
        entityType: "invoice",
        entityId: invoice.id,
    });

    res.json({ success: true, invoice: updatedInvoice });
  } catch (error: any) {
    logger.error("Lock invoice error:", error);
    return res.status(500).json({ error: error.message || "Failed to lock/unlock invoice" });
  }
});

// Cancel Invoice
router.put("/:id/cancel", authMiddleware, requireFeature('invoices_cancel'), requirePermission("invoices", "cancel"), async (req: AuthRequest, res: Response) => {
  try {
    const { cancellationReason } = req.body;

    if (!cancellationReason || cancellationReason.trim().length === 0) {
        return res.status(400).json({ error: "Cancellation reason is required" });
    }

    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
    }

    // Validation: Cannot cancel paid invoices
    if (invoice.paymentStatus === "paid") {
        return res.status(400).json({ error: "Cannot cancel fully paid invoices" });
    }

    // Validation: Cannot cancel if already cancelled (check both status and cancelledAt)
    if (invoice.status === "cancelled" || invoice.cancelledAt) {
        return res.status(400).json({ error: "Invoice is already cancelled" });
    }

    // If master invoice with child invoices, check if any are paid (do validation outside transaction)
    let childInvoices: any[] = [];
    if (invoice.isMaster) {
        const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId || "");
        childInvoices = allInvoices.filter((inv: any) => inv.parentInvoiceId === invoice.id);
        const paidChildren = childInvoices.filter((c: any) => c.paymentStatus === "paid");
        if (paidChildren.length > 0) {
        return res.status(400).json({ error: "Cannot cancel master invoice with paid child invoices" });
        }
    }

    // Wrap all cancellation operations in a transaction for atomicity
    const result = await db.transaction(async (tx) => {
        // Helper function to reverse stock for an invoice (within transaction)
        const reverseStockForInvoice = async (invoiceId: string) => {
        
        // Track which products have been restored via serial numbers
        const restoredViaSerials = new Set<string>();

        // 1. First, handle serial number-tracked items
        const serialsResult = await tx
            .select()
            .from(schema.serialNumbers)
            .where(eq(schema.serialNumbers.invoiceId, invoiceId));

        const productStockUpdatesFromSerials: Record<string, number> = {};

        for (const serial of serialsResult) {
            if (serial.productId) {
            productStockUpdatesFromSerials[serial.productId] = (productStockUpdatesFromSerials[serial.productId] || 0) + 1;
            restoredViaSerials.add(serial.productId);
            }

            // Reset serial number: status back to in_stock, unlink from invoice
            await tx
            .update(schema.serialNumbers)
            .set({
                status: "in_stock",
                invoiceId: null,
                invoiceItemId: null,
                updatedAt: new Date(),
            })
            .where(eq(schema.serialNumbers.id, serial.id));
        }

        // Update product stock from serial numbers
        for (const [productId, quantityToRestore] of Object.entries(productStockUpdatesFromSerials)) {
            await tx
            .update(schema.products)
            .set({
                stockQuantity: sql`${schema.products.stockQuantity} + ${quantityToRestore}`,
                availableQuantity: sql`${schema.products.availableQuantity} + ${quantityToRestore}`,
                updatedAt: new Date(),
            })
            .where(eq(schema.products.id, productId));
        }

        // 2. Then, handle non-serial-tracked items via invoice items
        const invoiceItems = await tx
            .select()
            .from(schema.invoiceItems)
            .where(eq(schema.invoiceItems.invoiceId, invoiceId));
        
        for (const item of invoiceItems) {
            // Only restore if not already restored via serials AND has a productId
            if (item.productId && !restoredViaSerials.has(item.productId)) {
            const quantityToRestore = Number(item.quantity) || 0;
            
            if (quantityToRestore > 0) {
                await tx
                .update(schema.products)
                .set({
                    stockQuantity: sql`${schema.products.stockQuantity} + ${quantityToRestore}`,
                    availableQuantity: sql`${schema.products.availableQuantity} + ${quantityToRestore}`,
                    updatedAt: new Date(),
                })
                .where(eq(schema.products.id, item.productId));
            }
            }
        }

        const totalSerials = serialsResult.length;
        const totalItems = invoiceItems.filter(i => i.productId && !restoredViaSerials.has(i.productId!)).length;
        logger.stock(`[Stock Reversal] Restored ${totalSerials} serial items and ${totalItems} regular items for invoice ${invoiceId}`);
        };

        // Cancel child invoices if this is a master invoice
        if (invoice.isMaster) {
        for (const child of childInvoices) {
            if (child.paymentStatus !== "paid") {
            // Reverse stock for child invoice
            await reverseStockForInvoice(child.id);

            await tx.update(schema.invoices)
                .set({
                status: "cancelled",
                paymentStatus: "cancelled",
                cancelledAt: new Date(),
                cancelledBy: req.user!.id,
                cancellationReason: `Parent invoice cancelled: ${cancellationReason}`,
                updatedAt: new Date(),
                })
                .where(eq(schema.invoices.id, child.id));
            }
        }
        }

        // Reverse stock for the main invoice
        await reverseStockForInvoice(req.params.id);

        // Cancel the main invoice
        const [updatedInvoice] = await tx.update(schema.invoices)
        .set({
            status: "cancelled",
            paymentStatus: "cancelled",
            cancelledAt: new Date(),
            cancelledBy: req.user!.id,
            cancellationReason,
            updatedAt: new Date(),
        })
        .where(eq(schema.invoices.id, req.params.id))
        .returning();

        // Log activity
        await tx.insert(schema.activityLogs).values({
        userId: req.user!.id,
        action: "invoice_cancelled",
        entityType: "invoice",
        entityId: invoice.id,
        timestamp: new Date(),
        });

        return updatedInvoice;
    });

    res.json({ success: true, invoice: result });
  } catch (error: any) {
    logger.error("Cancel invoice error:", error);
    return res.status(500).json({ error: error.message || "Failed to cancel invoice" });
  }
});

// Delete Invoice (Soft Delete)
router.delete("/:id", authMiddleware, requireFeature('invoices_delete'), requirePermission("invoices", "delete"), async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
    }

    // Validation: Cannot delete paid or partially paid invoices
    if (invoice.paymentStatus === "paid" || invoice.paymentStatus === "partial") {
        return res.status(400).json({ error: "Cannot delete invoices with payments. Please cancel instead." });
    }

    // Validation: Cannot delete master invoices with child invoices
    if (invoice.isMaster) {
        const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId || "");
        const childInvoices = allInvoices.filter((inv: any) => inv.parentInvoiceId === invoice.id);
        if (childInvoices.length > 0) {
        return res.status(400).json({ error: "Cannot delete master invoice with child invoices" });
        }
    }

    // Soft delete by marking as cancelled
    const updatedInvoice = await storage.updateInvoice(req.params.id, {
        status: "cancelled" as any,
        cancelledAt: new Date(),
        cancelledBy: req.user!.id,
        cancellationReason: "Deleted by user",
    });

    await storage.createActivityLog({
        userId: req.user!.id,
        action: "invoice_deleted",
        entityType: "invoice",
        entityId: invoice.id,
    });

    res.json({ success: true, message: "Invoice deleted successfully" });
  } catch (error: any) {
    logger.error("Delete invoice error:", error);
    return res.status(500).json({ error: error.message || "Failed to delete invoice" });
  }
});

// Invoice Comments
router.get("/:id/comments", requireFeature('invoices_module'), authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
    }
    const comments = await storage.getInvoiceComments(invoice.id, true);
    res.json(comments);
  } catch (error) {
    logger.error("Get invoice comments error:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

router.post("/:id/comments", requireFeature('invoices_edit'), authMiddleware, requirePermission("invoices", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    const { message, isInternal } = req.body;
    const invoiceId = req.params.id;

    if (!message) {
        return res.status(400).json({ error: "Comment message is required" });
    }

    const invoice = await storage.getInvoice(invoiceId);
    if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
    }

    const comment = await storage.createInvoiceComment({
        invoiceId,
        message,
        isInternal: !!isInternal,
        authorType: "internal",
        authorName: req.user!.name,
        authorEmail: req.user!.email,
        parentCommentId: req.body.parentCommentId || null,
    });

    await storage.createActivityLog({
        userId: req.user!.id,
        action: "add_comment",
        entityType: "invoice",
        entityId: invoiceId,
        metadata: { commentId: comment.id, isInternal: !!isInternal },
    });

    res.status(201).json(comment);
  } catch (error) {
    logger.error("Add invoice comment error:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});


// Create Child Invoice from Master Invoice
router.post("/:id/create-child-invoice", authMiddleware, requireFeature('invoices_childInvoices'), requirePermission("invoices", "create"), async (req: AuthRequest, res: Response) => {
  try {
    const result = await db.transaction(async (tx) => {
        const { items, dueDate, notes, deliveryNotes, milestoneDescription } = req.body;

        // Use direct tx queries or storage (read-only is fine via storage if repeatable read is not strict req, but safer to stick to tx maybe? getInvoice is simple)
        // For reads, we can use storage IF we don't care about seeing uncommitted data from *this* transaction (which we don't yet).
        // But for "SELECT FOR UPDATE" equivalent we'd need tx.
        // For now, let's stick to storage for READS (simplicity) and tx for WRITES.
        // NOTE: Drizzle transaction snapshot might not see updates if we mix clients? No, standard PG transaction behavior applies.
        
        const masterInvoice = await storage.getInvoice(req.params.id);
        if (!masterInvoice) {
            throw new Error("Master invoice not found");
        }

        if (!masterInvoice.isMaster) {
            throw new Error("This is not a master invoice");
        }

        if (masterInvoice.masterInvoiceStatus === "draft") {
            throw new Error("Master invoice must be confirmed before creating child invoices");
        }

        const masterItems = await storage.getInvoiceItems(masterInvoice.id);
        const allChildInvoices = masterInvoice.quoteId ? await storage.getInvoicesByQuote(masterInvoice.quoteId || "") : await storage.getInvoicesBySalesOrder(masterInvoice.salesOrderId || "");

        const siblingInvoices = allChildInvoices.filter((inv: any) => inv.parentInvoiceId === masterInvoice.id);

        const invoicedQuantities: Record<string, number> = {};
        for (const sibling of siblingInvoices) {
            const siblingItems = await storage.getInvoiceItems(sibling.id);
            for (const item of siblingItems) {
                const key = item.productId || item.description;
                invoicedQuantities[key] = (invoicedQuantities[key] || 0) + item.quantity;
            }
        }

        const processedItems = [];
        let subtotal = toDecimal(0);

        for (const rawItem of items) {
            const newItem = { ...rawItem };
            
            const masterItem = masterItems.find(mi => 
                (newItem.itemId && mi.id === newItem.itemId) || 
                (mi.productId && mi.productId === newItem.productId) || 
                (mi.description === newItem.description)
            );

            if (!masterItem) {
                const error: any = new Error(`Item "${newItem.description}" not found in master invoice`);
                error.statusCode = 400;
                throw error;
            }

            if (!newItem.unitPrice) newItem.unitPrice = masterItem.unitPrice;
            if (!newItem.hsnSac) newItem.hsnSac = masterItem.hsnSac;
            if (!newItem.productId) newItem.productId = masterItem.productId;

            const unitPrice = toDecimal(newItem.unitPrice);
            const quantity = Number(newItem.quantity); // Quantity is usually efficient as number, but for price calc we mix

            if (unitPrice.isNaN()) {
                const error: any = new Error(`Invalid Unit Price for item "${newItem.description}". Master item price: ${masterItem.unitPrice}`);
                error.statusCode = 400;
                throw error;
            }

            const key = newItem.productId || newItem.description;
            const alreadyInvoiced = invoicedQuantities[String(key)] || 0;
            const remaining = Number(masterItem.quantity) - alreadyInvoiced;

            if (quantity > remaining) {
                const error: any = new Error(`Item "${newItem.description}" quantity (${newItem.quantity}) exceeds remaining quantity (${remaining})`);
                error.statusCode = 400;
                throw error;
            }

            // Accumulate subtotal using Decimal
            subtotal = subtotal.plus(unitPrice.times(quantity));
            processedItems.push(newItem);
        }

        const masterSubtotal = toDecimal(masterInvoice.subtotal);
        const ratio = masterSubtotal.gt(0) ? subtotal.dividedBy(masterSubtotal) : toDecimal(0);

        const cgst = toDecimal(masterInvoice.cgst || 0).times(ratio);
        const sgst = toDecimal(masterInvoice.sgst || 0).times(ratio);
        const igst = toDecimal(masterInvoice.igst || 0).times(ratio);
        const shippingCharges = toDecimal(masterInvoice.shippingCharges || 0).times(ratio);
        const discount = toDecimal(masterInvoice.discount || 0).times(ratio);

        const total = subtotal.plus(cgst).plus(sgst).plus(igst).plus(shippingCharges).minus(discount);

        const invoiceNumber = await NumberingService.generateChildInvoiceNumber();

        // Create child invoice using tx
        const [childInvoice] = await tx.insert(schema.invoices).values({
            invoiceNumber,
            parentInvoiceId: masterInvoice.id,
            quoteId: masterInvoice.quoteId,
            clientId: masterInvoice.clientId,
            paymentStatus: "pending",
            dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            paidAmount: "0",
            subtotal: toMoneyString(subtotal),
            discount: toMoneyString(discount),
            cgst: toMoneyString(cgst),
            sgst: toMoneyString(sgst),
            igst: toMoneyString(igst),
            shippingCharges: toMoneyString(shippingCharges),
            total: toMoneyString(total),
            notes: notes || masterInvoice.notes,
            termsAndConditions: masterInvoice.termsAndConditions,
            isMaster: false,
            deliveryNotes: deliveryNotes || null,
            milestoneDescription: milestoneDescription || null,
            createdBy: req.user!.id,
        }).returning();

        // Create child invoice items using tx
        for (const item of processedItems) {
            await tx.insert(schema.invoiceItems).values({
                invoiceId: childInvoice.id,
                productId: item.productId || null,
                description: item.description,
                quantity: item.quantity,
                fulfilledQuantity: 0,
                unitPrice: item.unitPrice,
                subtotal: toMoneyString(calculateLineSubtotal(item.quantity, item.unitPrice)),
                status: "pending",
                sortOrder: item.sortOrder || 0,
                hsnSac: item.hsnSac || null,
            });
        }

        await tx.insert(schema.activityLogs).values({
            userId: req.user!.id,
            action: "create_child_invoice",
            entityType: "invoice",
            entityId: childInvoice.id,
        });

        return childInvoice;
    });

    return res.json(result);
  } catch (error: any) {
    logger.error("Create child invoice error:", error);
    if (error.statusCode === 400) {
        return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || "Failed to create child invoice" });
  }
});

// Get Master Invoice Summary with remaining quantities
router.get("/:id/master-summary", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const masterInvoice = await storage.getInvoice(req.params.id);
    if (!masterInvoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (!masterInvoice.isMaster) {
      return res.status(400).json({ error: "This is not a master invoice" });
    }

    // Get master items
    const masterItems = await storage.getInvoiceItems(masterInvoice.id);

    // Get all child invoices
    const allInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId || "");
    const childInvoices = allInvoices.filter((inv: any) => inv.parentInvoiceId === masterInvoice.id);

    // Calculate invoiced and remaining quantities
    const invoicedQuantities: Record<string, number> = {};
    const invoicedAmounts: Record<string, number> = {};

    for (const child of childInvoices) {
      const childItems = await storage.getInvoiceItems(child.id);
      for (const item of childItems) {
        const key = item.description;
        invoicedQuantities[key] = (invoicedQuantities[key] || 0) + item.quantity;
        invoicedAmounts[key] = (invoicedAmounts[key] || 0) + Number(item.subtotal);
      }
    }

    // Build summary with remaining quantities
    const itemsSummary = masterItems.map(item => ({
      id: item.id,
      description: item.description,
      masterQuantity: item.quantity,
      masterUnitPrice: item.unitPrice,
      masterSubtotal: item.subtotal,
      invoicedQuantity: invoicedQuantities[item.description] || 0,
      invoicedAmount: invoicedAmounts[item.description] || 0,
      remainingQuantity: item.quantity - (invoicedQuantities[item.description] || 0),
      remainingAmount: Number(item.subtotal) - (invoicedAmounts[item.description] || 0),
    }));

    const totalInvoiced = childInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const totalRemaining = Number(masterInvoice.total) - totalInvoiced;

    return res.json({
      masterInvoice: {
        id: masterInvoice.id,
        invoiceNumber: masterInvoice.invoiceNumber,
        status: masterInvoice.masterInvoiceStatus || "draft",
        total: masterInvoice.total,
        subtotal: masterInvoice.subtotal,
        discount: masterInvoice.discount,
        cgst: masterInvoice.cgst,
        sgst: masterInvoice.sgst,
        igst: masterInvoice.igst,
        shippingCharges: masterInvoice.shippingCharges,
        createdAt: masterInvoice.createdAt,
      },
      items: itemsSummary,
      childInvoices: childInvoices.map(child => ({
        id: child.id,
        invoiceNumber: child.invoiceNumber,
        total: child.total,
        paymentStatus: child.paymentStatus,
        paidAmount: child.paidAmount,
        createdAt: child.createdAt,
      })),
      totals: {
        masterTotal: masterInvoice.total,
        totalInvoiced: totalInvoiced.toFixed(2),
        totalRemaining: totalRemaining.toFixed(2),
        invoicedPercentage: ((totalInvoiced / Number(masterInvoice.total)) * 100).toFixed(2),
      },
    });
  } catch (error: any) {
    logger.error("Get master invoice summary error:", error);
    return res.status(500).json({ error: error.message || "Failed to get master invoice summary" });
  }
});

// PDF Export for Invoices
router.get("/:id/pdf", authMiddleware, requireFeature('invoices_pdfGeneration'), async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
    }

    const quote = await storage.getQuote(invoice.quoteId || "");
    if (!quote) {
       // Should handle standalone invoices if supported, but for now allow null quote
       // But InvoicePDFService expects quote. We might need a dummy quote or fetch default.
       // However, schema says quoteId is nullable?
       if (!invoice.quoteId) {
          // It's a standalone invoice? Or maybe error?
          // If standalone, we create a partial dummy quote object for PDF service
       }
       // For now, proceed.
    }

    const client = invoice.clientId ? await storage.getClient(invoice.clientId) : undefined;
    if (!client) {
        return res.status(404).json({ error: "Client not found" });
    }

    const items = await storage.getInvoiceItems(invoice.id);
    const creator = invoice.createdBy ? await storage.getUser(invoice.createdBy) : undefined;

    // Fetch parent/child info for PDF
    let parentInvoice = undefined;
    if (invoice.parentInvoiceId) {
        parentInvoice = await storage.getInvoice(invoice.parentInvoiceId);
    }
    
    let childInvoices: any[] = [];
    if (invoice.isMaster) {
        if (invoice.quoteId) {
            const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId || "");
            const children = allInvoices.filter((inv: any) => inv.parentInvoiceId === invoice.id);
            // Map children to match expected type
             childInvoices = children.map(c => ({
                invoiceNumber: c.invoiceNumber,
                total: c.total,
                paymentStatus: c.paymentStatus,
                createdAt: c.createdAt.toISOString()
            }));
        }
    }

    // Fetch company settings
    const settings = await storage.getAllSettings();
    const companyName = settings.find((s) => s.key === "company_companyName")?.value || "OPTIVALUE TEK";
    const addr = settings.find((s) => s.key === "company_address")?.value || "";
    const city = settings.find((s) => s.key === "company_city")?.value || "";
    const state = settings.find((s) => s.key === "company_state")?.value || "";
    const zip = settings.find((s) => s.key === "company_zipCode")?.value || "";
    const country = settings.find((s) => s.key === "company_country")?.value || "";
    
    // Construct full address
    const companyAddress = [addr, city, state, zip, country].filter(Boolean).join(", ");

    const companyPhone = settings.find((s) => s.key === "company_phone")?.value || "";
    const companyEmail = settings.find((s) => s.key === "company_email")?.value || "";
    const companyWebsite = settings.find((s) => s.key === "company_website")?.value || "";
    const companyGSTIN = settings.find((s) => s.key === "company_gstin")?.value || "";
    const companyLogo = settings.find((s) => s.key === "company_logo")?.value;

    // Fetch bank details
    const bankName = settings.find((s) => s.key === "bank_bankName")?.value || "";
    const bankAccountNumber = settings.find((s) => s.key === "bank_accountNumber")?.value || "";
    const bankAccountName = settings.find((s) => s.key === "bank_accountName")?.value || "";
    const bankIfscCode = settings.find((s) => s.key === "bank_ifscCode")?.value || "";
    const bankBranch = settings.find((s) => s.key === "bank_branch")?.value || "";
    const bankSwiftCode = settings.find((s) => s.key === "bank_swiftCode")?.value || "";

    // Create filename
    const cleanFilename = `Invoice-${invoice.invoiceNumber}.pdf`.replace(/[^\w\-. ]/g, '_');

    // Set headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`);

    // Generate PDF
    await InvoicePDFService.generateInvoicePDF({
        quote: quote || {} as any, // Handle missing quote
        client,
        items: items as any,
        currency: invoice.currency,
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        companyWebsite,
        companyGSTIN,
        companyLogo: companyLogo || undefined,
        preparedBy: creator?.name,
        userEmail: req.user?.email,
        companyDetails: {
          name: companyName,
          address: companyAddress,
          phone: companyPhone,
          email: companyEmail,
          website: companyWebsite,
          gstin: companyGSTIN,
        },
        invoiceNumber: invoice.invoiceNumber,
        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(),
        paidAmount: invoice.paidAmount || "0",
        paymentStatus: invoice.paymentStatus || "pending",
        isMaster: invoice.isMaster || false, // Ensure boolean
        masterInvoiceStatus: invoice.masterInvoiceStatus || undefined,
        parentInvoiceNumber: parentInvoice?.invoiceNumber,
        childInvoices,
        deliveryNotes: invoice.deliveryNotes || undefined,
        milestoneDescription: invoice.milestoneDescription || undefined,
        subtotal: invoice.subtotal || "0",
        discount: invoice.discount || "0",
        cgst: invoice.cgst || "0",
        sgst: invoice.sgst || "0",
        igst: invoice.igst || "0",
        shippingCharges: invoice.shippingCharges || "0",
        total: invoice.total || "0",
        notes: invoice.notes || undefined,
        termsAndConditions: invoice.termsAndConditions || undefined, // Fix null vs undefined
        bomSection: invoice.bomSection || undefined,

        bankName, // Pass at top level too if required by service (it was in routes.ts)
        bankAccountNumber,
        bankAccountName,
        bankIfscCode,
        bankBranch,
        bankSwiftCode,
    }, res);
    
    await storage.createActivityLog({
        userId: req.user!.id,
        action: "export_pdf",
        entityType: "invoice",
        entityId: invoice.id,
    });
  } catch (error: any) {
    logger.error("Generate invoice PDF error:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// Email Invoice
router.post("/:id/email", authMiddleware, requireFeature('invoices_emailSending'), requirePermission("invoices", "view"), async (req: AuthRequest, res: Response) => {
    try {
      const { recipientEmail, message } = req.body;

      if (!recipientEmail) {
        return res.status(400).json({ error: "Recipient email is required" });
      }

      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Try to get quote if it exists, but don't require it for standalone invoices
      const quote = invoice.quoteId ? await storage.getQuote(invoice.quoteId) : null;

      // Get client from invoice directly or fallback to quote
      const clientId = invoice.clientId || quote?.clientId;
      if (!clientId) {
        return res.status(404).json({ error: "No client associated with this invoice" });
      }

      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      const items = await storage.getInvoiceItems(invoice.id);

      const creator = invoice.createdBy ? await storage.getUser(invoice.createdBy) : (quote ? await storage.getUser(quote.createdBy) : undefined);

      // Fetch company settings
      const settings = await storage.getAllSettings();
      const companyName = settings.find((s) => s.key === "company_companyName")?.value || "OPTIVALUE TEK";

      const addr = settings.find((s) => s.key === "company_address")?.value || "";
      const city = settings.find((s) => s.key === "company_city")?.value || "";
      const state = settings.find((s) => s.key === "company_state")?.value || "";
      const zip = settings.find((s) => s.key === "company_zipCode")?.value || "";
      const country = settings.find((s) => s.key === "company_country")?.value || "";

      // Construct full address
      const companyAddress = [addr, city, state, zip, country].filter(Boolean).join(", ");

      const companyPhone = settings.find((s) => s.key === "company_phone")?.value || "";
      const companyEmail = settings.find((s) => s.key === "company_email")?.value || "";
      const companyWebsite = settings.find((s) => s.key === "company_website")?.value || "";
      const companyGSTIN = settings.find((s) => s.key === "company_gstin")?.value || "";
      const companyLogo = settings.find((s) => s.key === "company_logo")?.value;

      // Fetch email templates
      const emailSubjectTemplate = settings.find((s) => s.key === "email_invoice_subject")?.value || "Invoice {INVOICE_NUMBER} from {COMPANY_NAME}";
      const emailBodyTemplate = settings.find((s) => s.key === "email_invoice_body")?.value || "Dear {CLIENT_NAME},\\n\\nPlease find attached invoice {INVOICE_NUMBER}.\\n\\nAmount Due: {TOTAL}\\nDue Date: {DUE_DATE}\\n\\nPayment Details:\\n{BANK_DETAILS}\\n\\nBest regards,\\n{COMPANY_NAME}";

      // Get bank details from settings
      const bankName = settings.find((s) => s.key === "bank_bankName")?.value || "";
      const bankAccountNumber = settings.find((s) => s.key === "bank_accountNumber")?.value || "";
      const bankAccountName = settings.find((s) => s.key === "bank_accountName")?.value || "";
      const bankIfscCode = settings.find((s) => s.key === "bank_ifscCode")?.value || "";
       
      const bankDetailsForEmail = bankName
        ? `Bank: ${bankName}\\nAccount: ${bankAccountName}\\nAccount Number: ${bankAccountNumber}\\nIFSC: ${bankIfscCode}`
        : "Contact us for payment details";

      // Replace variables in templates
      const variables: Record<string, string> = {
        "{COMPANY_NAME}": companyName,
        "{CLIENT_NAME}": client.name,
        "{INVOICE_NUMBER}": invoice.invoiceNumber,
        "{TOTAL}": `₹${Number(invoice.total).toLocaleString()}`,
        "{OUTSTANDING}": `₹${(Number(invoice.total) - Number(invoice.paidAmount)).toLocaleString()}`,
        "{DUE_DATE}": invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : new Date().toLocaleDateString(),
        "{BANK_DETAILS}": bankDetailsForEmail,
      };

      let emailSubject = emailSubjectTemplate;
      let emailBody = emailBodyTemplate;

      Object.entries(variables).forEach(([key, value]) => {
        const escapedKey = key.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
        emailSubject = emailSubject.replace(new RegExp(escapedKey, 'g'), value);
        emailBody = emailBody.replace(new RegExp(escapedKey, 'g'), value);
      });

      // Add custom message if provided
      if (message) {
        emailBody = `${emailBody}\\n\\n---\\nAdditional Note:\\n${message}`;
      }

      // Convert escaped newlines to actual newlines, then to HTML for email
      emailBody = emailBody.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');
      emailBody = emailBody.replace(/\n/g, '<br>');

      // Generate PDF for attachment
      const { PassThrough } = await import("stream");
      const pdfStream = new PassThrough();

      const pdfPromise = InvoicePDFService.generateInvoicePDF({
        quote: quote || {} as any,
        client,
        items: items as any,
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        companyWebsite,
        companyGSTIN,
        preparedBy: creator?.name,
        companyLogo,
        userEmail: req.user?.email,
        companyDetails: {
          name: companyName,
          address: companyAddress,
          phone: companyPhone,
          email: companyEmail,
          website: companyWebsite,
          gstin: companyGSTIN,
        },
        invoiceNumber: invoice.invoiceNumber,
        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(),
        paidAmount: invoice.paidAmount || "0",
        paymentStatus: invoice.paymentStatus || "pending",
        // Add missing invoice fields
        isMaster: invoice.isMaster,
        masterInvoiceStatus: invoice.masterInvoiceStatus || undefined,
        deliveryNotes: invoice.deliveryNotes || undefined,
        milestoneDescription: invoice.milestoneDescription || undefined,
        // Use invoice totals (not quote totals)
        subtotal: invoice.subtotal || "0",
        discount: invoice.discount || "0",
        cgst: invoice.cgst || "0",
        sgst: invoice.sgst || "0",
        igst: invoice.igst || "0",
        shippingCharges: invoice.shippingCharges || "0",
        total: invoice.total || "0",
        notes: invoice.notes || undefined,
        termsAndConditions: invoice.termsAndConditions,
        // Bank details from settings
        bankName: bankName || undefined,
        bankAccountNumber: bankAccountNumber || undefined,
        bankAccountName: bankAccountName || undefined,
        bankIfscCode: bankIfscCode || undefined,
        bankBranch: settings.find((s) => s.key === "bank_branch")?.value || undefined,
        bankSwiftCode: settings.find((s) => s.key === "bank_swiftCode")?.value || undefined,
      }, pdfStream);

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      pdfStream.on("data", (chunk: any) => chunks.push(chunk));
      await new Promise<void>((resolve, reject) => {
        pdfStream.on("end", resolve);
        pdfStream.on("error", reject);
      });
      await pdfPromise;
      const pdfBuffer = Buffer.concat(chunks);

      // Send email with PDF attachment using template
      await EmailService.sendInvoiceEmail(
        recipientEmail,
        emailSubject,
        emailBody,
        pdfBuffer
      );

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "email_invoice",
        entityType: "invoice",
        entityId: invoice.id,
      });

      return res.json({ success: true, message: "Invoice sent successfully" });
    } catch (error: any) {
      logger.error("Email invoice error:", error);
      return res.status(500).json({ error: error.message || "Failed to send invoice email" });
    }
  });

  // Send Payment Reminder
  router.post("/:id/payment-reminder", authMiddleware, requireFeature('invoices_paymentReminders'), requirePermission("invoices", "view"), async (req: AuthRequest, res: Response) => {
    try {
      const { recipientEmail, message } = req.body;

      if (!recipientEmail) {
        return res.status(400).json({ error: "Recipient email is required" });
      }

      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Try to get quote if it exists, but don't require it for standalone invoices
      const quote = invoice.quoteId ? await storage.getQuote(invoice.quoteId) : null;

      // Get client from invoice directly or fallback to quote
      const clientId = invoice.clientId || quote?.clientId;
      if (!clientId) {
        return res.status(404).json({ error: "No client associated with this invoice" });
      }

      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      // Fetch company settings
      const settings = await storage.getAllSettings();
      const companyName = settings.find((s) => s.key === "company_name")?.value || "OPTIVALUE TEK";

      // Fetch email template
      const emailSubjectTemplate = settings.find((s) => s.key === "email_payment_reminder_subject")?.value || "Payment Reminder: Invoice {INVOICE_NUMBER}";
      const emailBodyTemplate = settings.find((s) => s.key === "email_payment_reminder_body")?.value || "Dear {CLIENT_NAME},\\n\\nThis is a friendly reminder that invoice {INVOICE_NUMBER} is due for payment.\\n\\nAmount Due: {OUTSTANDING}\\nDue Date: {DUE_DATE}\\nDays Overdue: {DAYS_OVERDUE}\\n\\nPlease arrange payment at your earliest convenience.\\n\\nBest regards,\\n{COMPANY_NAME}";

      // Calculate days overdue
      const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : new Date();
      const today = new Date();
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysOverdueText = daysOverdue > 0 ? `${daysOverdue} days` : "Not overdue";

      // Calculate outstanding amount
      const outstanding = Number(invoice.total) - Number(invoice.paidAmount);

      // Replace variables in templates
      const variables: Record<string, string> = {
        "{COMPANY_NAME}": companyName,
        "{CLIENT_NAME}": client.name,
        "{INVOICE_NUMBER}": invoice.invoiceNumber,
        "{OUTSTANDING}": `₹${outstanding.toLocaleString()}`,
        "{TOTAL}": `₹${Number(invoice.total).toLocaleString()}`,
        "{DUE_DATE}": dueDate.toLocaleDateString(),
        "{DAYS_OVERDUE}": daysOverdueText,
      };

      let emailSubject = emailSubjectTemplate;
      let emailBody = emailBodyTemplate;

      Object.entries(variables).forEach(([key, value]) => {
        const escapedKey = key.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
        emailSubject = emailSubject.replace(new RegExp(escapedKey, 'g'), value);
        emailBody = emailBody.replace(new RegExp(escapedKey, 'g'), value);
      });

      // Add custom message if provided
      if (message) {
        emailBody = `${emailBody}\\n\\n---\\nAdditional Note:\\n${message}`;
      }

      // Convert escaped newlines to actual newlines, then to HTML for email
      emailBody = emailBody.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');
      emailBody = emailBody.replace(/\n/g, '<br>');

      // Send payment reminder email
      await EmailService.sendPaymentReminderEmail(
        recipientEmail,
        emailSubject,
        emailBody
      );

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "send_payment_reminder",
        entityType: "invoice",
        entityId: invoice.id,
      });

      return res.json({ success: true, message: "Payment reminder sent successfully" });
    } catch (error: any) {
      logger.error("Payment reminder error:", error);
      return res.status(500).json({ error: error.message || "Failed to send payment reminder" });
    }
  });

  // Record Payment
  router.post("/:id/payment", authMiddleware, requireFeature('payments_create'), requirePermission("payments", "create"), async (req: AuthRequest, res: Response) => {
    try {
      const { amount, paymentMethod, notes, transactionId } = req.body;
      const amountNum = Number(amount);

      if (isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({ error: "Invalid payment amount" });
      }

      const result = await db.transaction(async (tx) => {
        const invoice = await storage.getInvoice(req.params.id);
        if (!invoice) {
          throw new Error("Invoice not found");
        }

        if (invoice.status === "cancelled") {
            throw new Error("Cannot record payment for cancelled invoice");
        }

        const currentPaid = Number(invoice.paidAmount || 0);
        const total = Number(invoice.total);
        const newPaid = currentPaid + amountNum;

        if (newPaid > total + 0.01) { // Allow tiny epsilon for float issues, though ideally handled by string decimals
            throw new Error(`Payment amount exceeds remaining balance. Remaining: ${(total - currentPaid).toFixed(2)}`);
        }

        // Determine new status
        let newStatus = "pending";
        if (Math.abs(newPaid - total) < 0.01) {
            newStatus = "paid";
        } else if (newPaid > 0) {
            newStatus = "partial";
        }

        // 1. Create Payment History Record
        await tx.insert(schema.paymentHistory).values({
            invoiceId: invoice.id,
            amount: toMoneyString(amount),
            paymentMethod,
            transactionId: transactionId || null,
            notes: notes || null,
            recordedBy: req.user!.id,
            paymentDate: new Date(),
        });

        // 2. Update Invoice
        const [updatedInvoice] = await tx.update(schema.invoices)
            .set({
                paidAmount: toMoneyString(newPaid),
                remainingAmount: toMoneyString(total - newPaid),
                paymentStatus: newStatus as any,
                lastPaymentDate: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(schema.invoices.id, invoice.id))
            .returning();

        // 3. Log Activity
        await tx.insert(schema.activityLogs).values({
            userId: req.user!.id,
            action: "record_payment",
            entityType: "invoice",
            entityId: invoice.id,
            metadata: {
                amount: amountNum,
                method: paymentMethod,
                newStatus
            }
        });

        return updatedInvoice;
      });

      res.json(result);
    } catch (error: any) {
      logger.error("Record payment error:", error);
      res.status(500).json({ error: error.message || "Failed to record payment" });
    }
  });


  // PATCH: Update Serial Numbers for an Item
  router.patch("/:id/items/:itemId/serials", authMiddleware, requireFeature('serialNumber_tracking'), requirePermission("serial_numbers", "edit"), async (req: AuthRequest, res: Response) => {
    try {
      const { serialNumbers } = req.body;

      logger.info(`Updating serial numbers for item ${req.params.itemId} in invoice ${req.params.id}`);
      logger.info(`Serial numbers count: ${serialNumbers?.length || 0}`);

      // Get the invoice item being updated
      const invoiceItem = await storage.getInvoiceItem(req.params.itemId);
      if (!invoiceItem) {
        return res.status(404).json({ error: "Invoice item not found" });
      }

      // Update the child/current invoice item
      const updated = await storage.updateInvoiceItem(req.params.itemId, {
        serialNumbers: JSON.stringify(serialNumbers),
        fulfilledQuantity: serialNumbers.length,
        status: serialNumbers.length > 0 ? "fulfilled" : "pending",
      });

      if (!updated) {
        return res.status(404).json({ error: "Item not found" });
      }

      // Get the invoice to check if it's a child invoice
      const invoice = await storage.getInvoice(req.params.id);

      // If this is a child invoice, update the corresponding master item
      if (invoice && invoice.parentInvoiceId) {
        logger.info(`This is a child invoice. Parent: ${invoice.parentInvoiceId}`);
        logger.info(`Syncing with master invoice...`);

        // Get master invoice items
        const masterItems = await storage.getInvoiceItems(invoice.parentInvoiceId);

        // Find the corresponding master item by matching description and unitPrice
        const masterItem = masterItems.find((mi: any) =>
          mi.description === invoiceItem.description &&
          Number(mi.unitPrice) === Number(invoiceItem.unitPrice)
        );

        if (masterItem) {
          logger.info(`Found master item: ${masterItem.description} (ID: ${masterItem.id})`);

          // Get all child invoices of this master
          const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId || "");
          const childInvoices = allInvoices.filter(inv => inv.parentInvoiceId === invoice.parentInvoiceId);

          // Aggregate serial numbers from all child invoices for this item
          const allChildSerialNumbers = [];
          for (const childInvoice of childInvoices) {
            const childItems = await storage.getInvoiceItems(childInvoice.id);
            const matchingChildItem = childItems.find((ci: any) =>
              ci.description === masterItem.description &&
              Number(ci.unitPrice) === Number(masterItem.unitPrice)
            );

            if (matchingChildItem && matchingChildItem.serialNumbers) {
              try {
                const serials = JSON.parse(matchingChildItem.serialNumbers);
                allChildSerialNumbers.push(...serials);
              } catch (e) {
                logger.error("Error parsing serial numbers:", e);
              }
            }
          }

          // Update master item with aggregated serial numbers
          await storage.updateInvoiceItem(masterItem.id, {
            serialNumbers: allChildSerialNumbers.length > 0
              ? JSON.stringify(allChildSerialNumbers)
              : null,
            status: masterItem.fulfilledQuantity >= masterItem.quantity ? "fulfilled" : "pending",
          });
        }
      }

      res.json(updated);
    } catch (error) {
      logger.error("Error updating serial numbers:", error);
      res.status(500).json({ error: "Failed to update serial numbers" });
    }
  });

  // POST: Create/Validate Serial Numbers (Specific to Invoice Item)
  router.post("/:id/items/:itemId/serials/validate", authMiddleware, requireFeature('serialNumber_tracking'), requirePermission("serial_numbers", "view"), async (req: AuthRequest, res: Response) => {
    try {
      const { validateSerialNumbers } = await import("../serial-number-service");
      const { serials, expectedQuantity } = req.body;
      const { id: invoiceId, itemId } = req.params;

      if (!serials || !Array.isArray(serials)) {
        return res.status(400).json({ error: "Invalid serials array" });
      }

      if (typeof expectedQuantity !== 'number') {
        return res.status(400).json({ error: "Expected quantity must be a number" });
      }

      const validation = await validateSerialNumbers(
        invoiceId,
        itemId,
        serials,
        expectedQuantity,
        {
          checkInvoiceScope: true,
          checkQuoteScope: true,
          checkSystemWide: true,
        }
      );

      return res.json(validation);
    } catch (error: any) {
      logger.error("Error validating serial numbers:", error);
      return res.status(500).json({ error: error.message || "Failed to validate serial numbers" });
    }
  });

  // GET: Check Serial Edit Permissions
  router.get("/:id/serials/permissions", authMiddleware, requireFeature('serialNumber_tracking'), async (req: AuthRequest, res: Response) => {
    try {
      const { canEditSerialNumbers } = await import("../serial-number-service");
      const { id: invoiceId } = req.params;

      const permissions = await canEditSerialNumbers(req.user!.id, invoiceId);

      return res.json(permissions);
    } catch (error: any) {
      logger.error("Error checking serial edit permissions:", error);
      return res.status(500).json({ error: error.message || "Failed to check permissions" });
    }
  });

export default router;
