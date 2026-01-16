
import { Router, Response } from "express";
import { storage } from "../storage";
import { authMiddleware, AuthRequest } from "../middleware";
import { requireFeature } from "../feature-flags-middleware";
import { requirePermission } from "../permissions-middleware";
import { NumberingService } from "../services/numbering.service";
import { logger } from "../utils/logger";

const router = Router();

router.get("/", requireFeature('quotes_module'), authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const quotes = await storage.getAllQuotes();
    const quotesWithClients = await Promise.all(
      quotes.map(async (quote) => {
        const client = await storage.getClient(quote.clientId);
        return {
          ...quote,
          clientName: client?.name || "Unknown",
          clientEmail: client?.email || "",
        };
      })
    );
    res.json(quotesWithClients);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quotes" });
  }
});

router.get("/:id", requireFeature('quotes_module'), authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const quote = await storage.getQuote(req.params.id);
    if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
    }

    const client = await storage.getClient(quote.clientId);
    const items = await storage.getQuoteItems(quote.id);
    const creator = await storage.getUser(quote.createdBy);

    res.json({
        ...quote,
        client,
        items,
        createdByName: creator?.name || "Unknown",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quote" });
  }
});

router.post("/", requireFeature('quotes_create'), authMiddleware, requirePermission("quotes", "create"), async (req: AuthRequest, res: Response) => {
  try {
    const { items, ...quoteData } = req.body;

    // Convert ISO string date to Date object if provided (optional; DB has default)
    if (quoteData.quoteDate && typeof quoteData.quoteDate === "string") {
        const parsed = new Date(quoteData.quoteDate);
        if (!isNaN(parsed.getTime())) {
        quoteData.quoteDate = parsed;
        } else {
        delete quoteData.quoteDate; // invalid date string, let DB default
        }
    }

    // Get settings for quote prefix
    const prefixSetting = await storage.getSetting("quotePrefix");
    const prefix = prefixSetting?.value || "QT";

    // Generate quote number using NumberingService
    const quoteNumber = await NumberingService.generateQuoteNumber();

    // Create quote
    // Prepare items for transaction
    const quoteItemsData = (items || []).map((item: any, i: number) => ({
        quoteId: "", // Placeholder, will be set in transaction
        productId: item.productId || null,
        description: item.description,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        subtotal: String(item.quantity * item.unitPrice),
        sortOrder: i,
        hsnSac: item.hsnSac || null,
    }));

    // Create quote and items in transaction
    const quote = await storage.createQuoteTransaction({
        ...quoteData,
        quoteNumber,
        createdBy: req.user!.id,
    }, quoteItemsData);

    await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_quote",
        entityType: "quote",
        entityId: quote.id,
    });

    return res.json(quote);
  } catch (error: any) {
    logger.error("Create quote error:", error);
    return res.status(500).json({ error: error.message || "Failed to create quote" });
  }
});

router.patch("/:id", authMiddleware, requirePermission("quotes", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    // Check if quote exists and is not invoiced
    const existingQuote = await storage.getQuote(req.params.id);
    if (!existingQuote) {
        return res.status(404).json({ error: "Quote not found" });
    }

    // Prevent editing invoiced quotes
    if (existingQuote.status === "invoiced") {
        return res.status(400).json({ error: "Cannot edit an invoiced quote" });
    }

    // Prevent editing quotes converted to sales orders
    const existingSalesOrder = await storage.getSalesOrderByQuote(req.params.id);
    if (existingSalesOrder) {
        return res.status(400).json({ 
        error: "Cannot edit a quote that has been converted to a Sales Order." 
        });
    }

    // Prevent editing finalized quotes (Sent/Approved/Rejected) unless only updating status
    // We allow updating status (e.g. marking as Approved), but not content changes.
    if (["sent", "approved", "rejected", "closed_paid", "closed_cancelled"].includes(existingQuote.status)) {
        const keys = Object.keys(req.body);
        const allowedKeys = ["status", "closureNotes", "closedBy", "closedAt"]; // Start with status and closure fields
        const hasContentUpdates = keys.some(key => !allowedKeys.includes(key));
        
        if (hasContentUpdates) {
            return res.status(400).json({ 
                error: `Quote is in '${existingQuote.status}' state and cannot be edited. Please use the 'Revise' option to create a new version.` 
            });
        }
    }

    // Normalize date fields
    const toDate = (v: any) => {
        if (!v) return undefined;
        if (v instanceof Date) return v;
        if (typeof v === 'string') {
        const d = new Date(v);
        return isNaN(d.getTime()) ? undefined : d;
        }
        return undefined;
    };

    const { items, ...updateFields } = req.body;
    const updateData = { ...updateFields };
    if (updateData.quoteDate) updateData.quoteDate = toDate(updateData.quoteDate);
    if (updateData.validUntil) updateData.validUntil = toDate(updateData.validUntil);

    let quote;

    if (items && Array.isArray(items)) {
        // Prepare items for transaction
        const quoteItemsData = items.map((item: any, i: number) => ({
        quoteId: req.params.id,
        productId: item.productId || null,
        description: item.description,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        subtotal: String(item.quantity * item.unitPrice),
        sortOrder: i,
        hsnSac: item.hsnSac || null,
        }));

        quote = await storage.updateQuoteTransaction(req.params.id, updateData, quoteItemsData);
    } else {
        quote = await storage.updateQuote(req.params.id, updateData);
    }

    if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
    }

    await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_quote",
        entityType: "quote",
        entityId: quote.id,
    });


    // DISABLED: Automatic email sending when quote status changes to "sent"
    // Future implementation should use event bus or queue

    return res.json(quote);
  } catch (error) {
    logger.error("Update quote error:", error);
    res.status(500).json({ error: "Failed to update quote" });
  }
});

router.post("/:id/convert-to-invoice", authMiddleware, requirePermission("invoices", "create"), async (req: AuthRequest, res: Response) => {
  try {
    const quote = await storage.getQuote(req.params.id);
    if (!quote) return res.status(404).json({ error: "Quote not found" });

    if (quote.status === "invoiced") {
        return res.status(400).json({ error: "Quote is already invoiced" });
    }

    // CRITICAL: Check if sales order exists for this quote
    // If SO exists, invoice should be created FROM the SO, not from the quote
    const existingSalesOrder = await storage.getSalesOrderByQuote(req.params.id);
    if (existingSalesOrder) {
        return res.status(400).json({ 
        error: "Cannot create invoice directly from quote. This quote has already been converted to a sales order. Please create the invoice from the sales order instead.",
        salesOrderId: existingSalesOrder.id,
        salesOrderNumber: existingSalesOrder.orderNumber
        });
    }

    // Generate a new master invoice number using admin master invoice numbering settings
    const invoiceNumber = await NumberingService.generateMasterInvoiceNumber();

    // Create the invoice
    const invoice = await storage.createInvoice({
        invoiceNumber,
        quoteId: quote.id,
        clientId: quote.clientId,
        isMaster: true,
        masterInvoiceStatus: "draft", 
        paymentStatus: "pending", 
        dueDate: new Date(Date.now() + (quote.validityDays || 30) * 24 * 60 * 60 * 1000), // Default due date based on validity
        paidAmount: "0",
        subtotal: quote.subtotal,
        discount: quote.discount,
        cgst: quote.cgst,
        sgst: quote.sgst,
        igst: quote.igst,
        shippingCharges: quote.shippingCharges,
        total: quote.total,
        notes: quote.notes,
        termsAndConditions: quote.termsAndConditions,
        createdBy: req.user!.id,
    });

    // Get quote items and create invoice items
    const quoteItems = await storage.getQuoteItems(quote.id);
    for (const item of quoteItems) {
        await storage.createInvoiceItem({
        invoiceId: invoice.id,
        productId: (item as any).productId || null,
        description: item.description,
        quantity: item.quantity,
        fulfilledQuantity: 0,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        status: "pending",
        sortOrder: item.sortOrder,
        hsnSac: item.hsnSac
        });
    }

    // Update quote status
    await storage.updateQuote(quote.id, { status: "invoiced" });

    // Log activity
    await storage.createActivityLog({
        userId: req.user!.id,
        action: "convert_quote_to_invoice",
        entityType: "invoice",
        entityId: invoice.id,
    });

    return res.json(invoice);
    
  } catch (error: any) {
    logger.error("Convert quote error:", error);
    return res.status(500).json({ error: error.message || "Failed to convert quote" });
  }
});

export default router;
