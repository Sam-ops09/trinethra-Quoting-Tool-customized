import { Router, Response } from "express";
import path from "path";
import { storage } from "../storage";
import { authMiddleware, AuthRequest } from "../middleware";
import { requireFeature } from "../feature-flags-middleware";
import { requirePermission } from "../permissions-middleware";
import { NumberingService } from "../services/numbering.service";
import { logger } from "../utils/logger";
import { calculateSubtotal, calculateTotal, toMoneyString } from "../utils/financial";
import { EmailService } from "../services/email.service";
import { PDFService } from "../services/pdf.service";
import { isFeatureEnabled } from "../../shared/feature-flags";

import { ApprovalService } from "../services/approval.service";
import { NotificationService } from "../services/notification.service";
import { WorkflowEngine } from "../services/workflow-engine.service";
import { users } from "@shared/schema";
import * as schema from "@shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

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

// ============================================
// PUBLIC ROUTES - MUST BE DEFINED BEFORE /:id
// These routes don't require authentication
// ============================================

// PUBLIC ROUTE: Get Quote by Token
router.get("/public/:token", async (req: any, res: Response) => {
    try {
        const token = req.params.token;
        if (!token) return res.status(400).json({ error: "Token required" });

        const quote = await storage.getQuoteByToken(token);
        if (!quote) {
            return res.status(404).json({ error: "Quote not found or link expired" });
        }

        if (quote.tokenExpiresAt && new Date(quote.tokenExpiresAt) < new Date()) {
            return res.status(410).json({ error: "Quote link has expired" });
        }

        const client = await storage.getClient(quote.clientId);
        const items = await storage.getQuoteItems(quote.id);
        const creator = await storage.getUser(quote.createdBy);

        res.json({
            id: quote.id,
            quoteNumber: quote.quoteNumber,
            version: quote.version,
            status: quote.status,
            quoteDate: quote.quoteDate,
            validUntil: quote.validUntil,
            currency: quote.currency,
            items,
            subtotal: quote.subtotal,
            discount: quote.discount,
            shippingCharges: quote.shippingCharges,
            cgst: quote.cgst,
            sgst: quote.sgst,
            igst: quote.igst,
            total: quote.total,
            notes: quote.notes,
            termsAndConditions: quote.termsAndConditions,
            client: {
                name: client?.name,
                email: client?.email,
                billingAddress: client?.billingAddress,
                gstin: client?.gstin,
                phone: client?.phone,
            },
            sender: {
                name: creator?.name,
                email: creator?.email
            }
        });
    } catch (error) {
        logger.error("Public quote fetch error:", error);
        res.status(500).json({ error: "Failed to fetch quote" });
    }
});

// PUBLIC ROUTE: Get Comments for Quote
router.get("/public/:token/comments", async (req: any, res: Response) => {
    try {
        const quote = await storage.getQuoteByToken(req.params.token);
        if (!quote) {
            return res.status(404).json({ error: "Quote not found" });
        }

        if (quote.tokenExpiresAt && new Date(quote.tokenExpiresAt) < new Date()) {
            return res.status(410).json({ error: "Quote link has expired" });
        }

        const comments = await storage.getQuoteComments(quote.id, false);
        res.json(comments);
    } catch (error) {
        logger.error("Public quote comments fetch error:", error);
        res.status(500).json({ error: "Failed to fetch comments" });
    }
});

// PUBLIC ROUTE: Add Client Comment
router.post("/public/:token/comments", async (req: any, res: Response) => {
    try {
        const { authorName, authorEmail, message, parentCommentId } = req.body;
        
        if (!authorName || !message) {
            return res.status(400).json({ error: "Author name and message are required" });
        }

        const quote = await storage.getQuoteByToken(req.params.token);
        if (!quote) {
            return res.status(404).json({ error: "Quote not found" });
        }

        if (quote.tokenExpiresAt && new Date(quote.tokenExpiresAt) < new Date()) {
            return res.status(410).json({ error: "Quote link has expired" });
        }

        const comment = await storage.createQuoteComment({
            quoteId: quote.id,
            authorType: "client",
            authorName,
            authorEmail: authorEmail || null,
            message,
            parentCommentId: parentCommentId || null,
            isInternal: false,
        });

        await storage.createActivityLog({
            userId: quote.createdBy,
            action: "client_comment_public",
            entityType: "quote",
            entityId: quote.id,
            metadata: { commentId: comment.id, via: "public_link" }
        });

        res.json(comment);
    } catch (error) {
        logger.error("Public quote comment error:", error);
        res.status(500).json({ error: "Failed to add comment" });
    }
});

// PUBLIC ROUTE: Update Optional Item Selections
router.post("/public/:token/select-items", async (req: any, res: Response) => {
    try {
        const { selections } = req.body;

        if (!Array.isArray(selections)) {
            return res.status(400).json({ error: "Selections array is required" });
        }

        const quote = await storage.getQuoteByToken(req.params.token);
        if (!quote) {
            return res.status(404).json({ error: "Quote not found" });
        }

        if (quote.tokenExpiresAt && new Date(quote.tokenExpiresAt) < new Date()) {
            return res.status(410).json({ error: "Quote link has expired" });
        }

        if (!["sent", "draft"].includes(quote.status)) {
            return res.status(400).json({ error: "Quote is no longer editable" });
        }

        const quoteItems = await storage.getQuoteItems(quote.id);
        const optionalItemIds = quoteItems.filter(i => i.isOptional).map(i => i.id);

        for (const sel of selections) {
            if (!optionalItemIds.includes(sel.itemId)) {
                return res.status(400).json({ error: `Item ${sel.itemId} is not an optional item` });
            }
        }

        for (const sel of selections) {
            await storage.updateQuoteItemSelection(sel.itemId, sel.isSelected);
        }

        const updatedItems = await storage.getQuoteItems(quote.id);
        const selectedItems = updatedItems.filter(i => i.isSelected);
        
        let subtotal = 0;
        for (const item of selectedItems) {
            subtotal += Number(item.subtotal);
        }

        const discount = Number(quote.discount) || 0;
        const cgst = Number(quote.cgst) || 0;
        const sgst = Number(quote.sgst) || 0;
        const igst = Number(quote.igst) || 0;
        const shippingCharges = Number(quote.shippingCharges) || 0;
        const total = subtotal - discount + cgst + sgst + igst + shippingCharges;

        await storage.updateQuote(quote.id, {
            subtotal: subtotal.toFixed(2),
            total: total.toFixed(2),
        });

        res.json({ 
            success: true, 
            subtotal: subtotal.toFixed(2),
            total: total.toFixed(2),
            items: updatedItems
        });
    } catch (error) {
        logger.error("Public quote item selection error:", error);
        res.status(500).json({ error: "Failed to update selections" });
    }
});

// PUBLIC ROUTE: Enhanced Accept with Signature
router.post("/public/:token/accept", async (req: any, res: Response) => {
    try {
        const { clientName, clientSignature } = req.body;
        
        if (!clientName) {
            return res.status(400).json({ error: "Client name is required for acceptance" });
        }

        const quote = await storage.getQuoteByToken(req.params.token);
        if (!quote) {
            return res.status(404).json({ error: "Quote not found" });
        }

        if (quote.tokenExpiresAt && new Date(quote.tokenExpiresAt) < new Date()) {
            return res.status(410).json({ error: "Quote link has expired" });
        }

        if (!["sent", "draft"].includes(quote.status)) {
            return res.status(400).json({ error: "Quote is already processed" });
        }

        await storage.updateQuote(quote.id, {
            status: "approved",
            clientAcceptedName: clientName,
            clientSignature: clientSignature || null,
            clientAcceptedAt: new Date(),
        });

        await storage.createActivityLog({
            userId: quote.createdBy,
            action: "client_accept_with_signature",
            entityType: "quote",
            entityId: quote.id,
            metadata: { 
                via: "public_link",
                clientName,
                hasSignature: !!clientSignature,
                ip: req.ip
            }
        });

        res.json({ success: true, status: "approved" });
    } catch (error) {
        logger.error("Public quote accept error:", error);
        res.status(500).json({ error: "Failed to accept quote" });
    }
});

// PUBLIC ROUTE: Generic Client Action (Approve/Reject)
router.post("/public/:token/:action", async (req: any, res: Response) => {
    try {
        const { token, action } = req.params;
        const { reason } = req.body;

        if (!["approve", "reject"].includes(action)) {
            return res.status(400).json({ error: "Invalid action" });
        }

        const quote = await storage.getQuoteByToken(token);
        if (!quote) {
            return res.status(404).json({ error: "Quote not found" });
        }

        if (quote.tokenExpiresAt && new Date(quote.tokenExpiresAt) < new Date()) {
            return res.status(410).json({ error: "Quote link has expired" });
        }
        
        if (["approved", "invoiced", "closed_paid"].includes(quote.status)) {
             return res.status(400).json({ error: "Quote is already processed" });
        }

        const newStatus = action === "approve" ? "approved" : "rejected";
        
        await storage.updateQuote(quote.id, { status: newStatus });

        await storage.createActivityLog({
            userId: quote.createdBy,
            action: `client_${action}_public`,
            entityType: "quote",
            entityId: quote.id,
            metadata: { via: "public_link", reason, ip: req.ip }
        });

        res.json({ success: true, status: newStatus });
    } catch (error) {
        logger.error("Public quote action error:", error);
        res.status(500).json({ error: "Failed to process " + req.params.action });
    }
});

// ============================================
// INTERNAL ROUTES - Require Authentication
// ============================================

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

    // Feature Flag Guards
    if (!isFeatureEnabled('quotes_discount') && Number(quoteData.discount || 0) > 0) {
      return res.status(403).json({ error: "Discounts are currently disabled" });
    }
    if (!isFeatureEnabled('quotes_shippingCharges') && Number(quoteData.shippingCharges || 0) > 0) {
      return res.status(403).json({ error: "Shipping charges feature is disabled" });
    }
    if (!isFeatureEnabled('quotes_notes') && quoteData.notes) {
      delete quoteData.notes; // Silently drop notes if disabled
    }
    if (!isFeatureEnabled('quotes_termsConditions') && quoteData.termsAndConditions) {
       // Optional: Drop or Error. Let's drop.
       delete quoteData.termsAndConditions;
    }

    // Convert ISO string date to Date object
    if (quoteData.quoteDate && typeof quoteData.quoteDate === "string") {
        const parsed = new Date(quoteData.quoteDate);
        if (!isNaN(parsed.getTime())) {
        quoteData.quoteDate = parsed;
        } else {
        delete quoteData.quoteDate; 
        }
    }

    // Get settings for quote prefix
    const prefixSetting = await storage.getSetting("quotePrefix");
    const prefix = prefixSetting?.value || "QT";

    // Generate quote number
    const quoteNumber = await NumberingService.generateQuoteNumber();

    // Prepare items
    const quoteItemsData = (items || []).map((item: any, i: number) => ({
        quoteId: "", 
        productId: item.productId || null,
        description: item.description,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        subtotal: String(item.quantity * item.unitPrice),
        sortOrder: i,
        hsnSac: item.hsnSac || null,
    }));

    // Calculate Financials Server-Side
    // We import these dynamically or assume they are imported. 
    // Need to ensure imports are present at top of file. 
    // Assuming imports are: toDecimal, calculateSubtotal, calculateTotal, toMoneyString
    const subtotal = calculateSubtotal(quoteItemsData);
    
    // Use provided values or defaults for taxes/discounts
    const discount = quoteData.discount || 0;
    const shippingCharges = quoteData.shippingCharges || 0;
    const cgst = quoteData.cgst || 0;
    const sgst = quoteData.sgst || 0;
    const igst = quoteData.igst || 0;

    const total = calculateTotal({
        subtotal,
        discount,
        shippingCharges,
        cgst,
        sgst,
        igst
    });

    const finalQuoteData = {
        ...quoteData,
        quoteNumber,
        createdBy: req.user!.id,
        subtotal: toMoneyString(subtotal),
        discount: toMoneyString(discount),
        shippingCharges: toMoneyString(shippingCharges),
        cgst: toMoneyString(cgst),
        sgst: toMoneyString(sgst),
        igst: toMoneyString(igst),
        total: toMoneyString(total),
    };

    // Rule-Based Approval Check
    const { approvalStatus, approvalRequiredBy } = await ApprovalService.evaluateQuote(finalQuoteData as any); // Type cast until full integration
    Object.assign(finalQuoteData, { approvalStatus, approvalRequiredBy });

    // Create quote and items in transaction
    const quote = await storage.createQuoteTransaction(finalQuoteData, quoteItemsData);

    await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_quote",
        entityType: "quote",
        entityId: quote.id,
    });

    console.log("[DEBUG] Quote Created:", JSON.stringify(quote, null, 2)); 
    console.log("[DEBUG] Eval Result:", { approvalStatus, approvalRequiredBy });

    // Explicitly return computed status in case DB insert returned restricted object
    
    // NOTIFICATIONS
    try {
      // 1. Notify creator
      await NotificationService.create({
        userId: req.user!.id,
        type: "quote_status_change",
        title: "Quote Created",
        message: `Quote #${quoteNumber} has been created successfully.`,
        entityType: "quote",
        entityId: quote.id,
      });

      // 2. If approval needed, notify admins
      if (approvalStatus === "pending") {
        const admins = await db.select().from(users).where(eq(users.role, "admin"));
        for (const admin of admins) {
          await NotificationService.notifyApprovalRequest(
            admin.id,
            quoteNumber,
            quote.id,
            req.user!.email || "User",
            "Quote creation triggered approval rules"
          );
        }
      }
    } catch (notifError) {
      logger.error("Failed to send notifications for new quote:", notifError);
    }

    // Trigger Workflows
    try {
      // Enrich entity with client details for templates
      const client = await storage.getClient(quote.clientId);
      const enrichedEntity = {
        ...quote,
        client, // Allows {{client.name}}
        client_name: client?.name, // Allows {{client_name}}
        client_email: client?.email, // Allows {{client_email}}
        creator_name: req.user?.name || "QuoteProGen Team", // Allows {{creator_name}}
        creator_email: req.user?.email, // Allows {{creator_email}}
        formatted_total: `${quote.currency} ${toMoneyString(quote.total)}`, // Allows {{formatted_total}}
        formatted_subtotal: `${quote.currency} ${toMoneyString(quote.subtotal)}`, // Allows {{formatted_subtotal}}
      };

      logger.info(`[WorkflowDebug] Enriched Entity for Create: Client=${enrichedEntity.client_name}, Creator=${enrichedEntity.creator_name}`);

      await WorkflowEngine.triggerWorkflows("quote", quote.id, {
        eventType: "created",
        entity: enrichedEntity,
        triggeredBy: req.user!.id,
      });
      
      // Also trigger for status change (draft)
      await WorkflowEngine.triggerWorkflows("quote", quote.id, {
        eventType: "status_change",
        entity: enrichedEntity,
        newValue: quote.status,
        oldValue: null,
        triggeredBy: req.user!.id,
      });
      
      // Also trigger for amount threshold checks
      await WorkflowEngine.triggerWorkflows("quote", quote.id, {
        eventType: "amount_threshold",
        entity: enrichedEntity,
        triggeredBy: req.user!.id,
      });
    } catch (workflowError) {
      logger.error("Failed to trigger workflows for new quote:", workflowError);
    }

    return res.json({ ...quote, approvalStatus, approvalRequiredBy });
  } catch (error: any) {
    logger.error("Create quote error:", error);
    return res.status(500).json({ error: error.message || "Failed to create quote" });
  }
});

router.patch("/:id", authMiddleware, requireFeature('quotes_edit'), requirePermission("quotes", "edit"), async (req: AuthRequest, res: Response) => {
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
    
    // Feature Flag Guards (Update)
    if (!isFeatureEnabled('quotes_discount') && updateFields.discount && Number(updateFields.discount) > 0) {
      return res.status(403).json({ error: "Discounts are currently disabled" });
    }
    if (!isFeatureEnabled('quotes_shippingCharges') && updateFields.shippingCharges && Number(updateFields.shippingCharges) > 0) {
      return res.status(403).json({ error: "Shipping charges feature is disabled" });
    }

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

        // Re-evaluate approval if contents changed
        // We need to construct the full quote object to evaluate
        // This is tricky because we need partial update applied to existing quote
        
        // Optimistic evaluation strategy:
        // 1. Calculate new financials
        const subtotal = calculateSubtotal(quoteItemsData);
        const discount = updateData.discount !== undefined ? updateData.discount : existingQuote.discount;
        // ... (other fields) ...
        // For simplicity, we assume update applies to fields provided or falls back to existing.
        
        // Actually, easiest right now is to let the update happen, THEN re-evaluate? 
        // No, we need to set status BEFORE saving if it changes.
        
        // Better: Construct the "proposed" quote data
        const proposedQuote = {
            ...existingQuote,
            ...updateData,
            subtotal: toMoneyString(subtotal),
             // Recalculate total if items changed
             // ...
        };
        // NOTE: Full Recalculation is ideal. For MVP, we'll re-evaluate AFTER update if possible, 
        // or just apply logic here efficiently.
        
        // Let's do a simplified check for now: If items or financials updated, re-evaluate.
        // We should really update the approval status based on the NEW values.
        
        // Just rely on the storage update to return the new quote, then we can check?
        // No, we want to store the status.
        
        // Let's pass the responsibility to `ApprovalService` to check "proposed" values is best, 
        // but `evaluateQuote` takes a `Quote` object.
        
        // Let's just update normally, then check if we need to flag it. 
        // But `createQuoteTransaction` needs fields.
        
        // Let's do a simplified approach:
        // If items are being updated, we recalculate totals anyway in frontend ideally, but here we trust input or recalculate.
        // Let's just set `approvalStatus` to `pending` if it triggers rules, otherwise reset to `none`?
        // Or should we only set to `pending` if it WAS `none`?
        
        // Let's just re-run evaluation on the merged data.
        const mergedDataForEval = { ...existingQuote, ...updateData };
        if(items) {
             const sub = calculateSubtotal(quoteItemsData);
             mergedDataForEval.subtotal = toMoneyString(sub);
             mergedDataForEval.total = toMoneyString(calculateTotal({
                 subtotal: sub,
                 discount: mergedDataForEval.discount || 0,
                 shippingCharges: mergedDataForEval.shippingCharges || 0,
                 cgst: mergedDataForEval.cgst || 0,
                 sgst: mergedDataForEval.sgst || 0,
                 igst: mergedDataForEval.igst || 0
             }));
        }

        const { approvalStatus, approvalRequiredBy } = await ApprovalService.evaluateQuote(mergedDataForEval as any);
        Object.assign(updateData, { approvalStatus, approvalRequiredBy });

        quote = await storage.updateQuoteTransaction(req.params.id, updateData, quoteItemsData);
    } else {
        // Just updating fields like discount?
        const mergedDataForEval = { ...existingQuote, ...updateData };
        // If only updating status, skip eval?
        // We only eval if financial fields are touched
        const financialFields = ['discount', 'shippingCharges', 'items', 'total'];
        const isFinancialUpdate = Object.keys(updateData).some(k => financialFields.includes(k));
        
        if (isFinancialUpdate) {
             const { approvalStatus, approvalRequiredBy } = await ApprovalService.evaluateQuote(mergedDataForEval as any);
             Object.assign(updateData, { approvalStatus, approvalRequiredBy });
        }
        
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

    // NOTIFICATIONS
    try {
      // Detect approval status change
      if (updateData.approvalStatus && updateData.approvalStatus !== existingQuote.approvalStatus) {
        // If approved or rejected, notify the creator
        if (["approved", "rejected"].includes(updateData.approvalStatus)) {
          const action = updateData.approvalStatus === "approved" ? "approved" : "rejected";
          await NotificationService.notifyApprovalDecision(
            existingQuote.createdBy,
            quote.quoteNumber,
            quote.id,
            req.user!.email || "Approver",
            action as any
          );
        }
        
        // If became pending (e.g. revision triggers it), notify admins
        if (updateData.approvalStatus === "pending") {
           const admins = await db.select().from(users).where(eq(users.role, "admin"));
           for (const admin of admins) {
             await NotificationService.notifyApprovalRequest(
               admin.id,
               quote.quoteNumber,
               quote.id,
               req.user!.email || "User",
               "Quote update triggered approval rules"
             );
           }
        }
      } else if (updateData.status && updateData.status !== existingQuote.status) {
         // General status change notification
         // Only notify if it's a significant status change like "sent"
         if (updateData.status === "sent") {
            await NotificationService.notifyQuoteStatusChange(
              existingQuote.createdBy,
              quote.quoteNumber,
              quote.id,
              existingQuote.status,
              "sent"
            );
         }
      }
    } catch (notifError) {
      logger.error("Failed to send notifications for updated quote:", notifError);
    }

    // Trigger Workflows (Update)
    try {
      // Enrich entity with client details for templates
      const client = await storage.getClient(quote.clientId);
      const enrichedEntity = {
        ...quote,
        client,
        client_name: client?.name,
        client_email: client?.email,
        creator_name: req.user?.name || "QuoteProGen Team",
        creator_email: req.user?.email,
        formatted_total: `${quote.currency} ${toMoneyString(quote.total)}`,
        formatted_subtotal: `${quote.currency} ${toMoneyString(quote.subtotal)}`,
      };

      logger.info(`[WorkflowDebug] Enriched Entity for Update: Client=${enrichedEntity.client_name}, Creator=${enrichedEntity.creator_name}`);

      // 1. Status Change
      if (updateData.status && updateData.status !== existingQuote.status) {
        await WorkflowEngine.triggerWorkflows("quote", quote.id, {
          eventType: "status_change",
          entity: enrichedEntity,
          newValue: updateData.status,
          oldValue: existingQuote.status,
          triggeredBy: req.user!.id,
        });
      }

      // 2. Field Changes (Generic)
      // The current evaluateFieldChange implementation checks `context.entity[field]`.
      // So passing the updated quote as entity is correct.
      await WorkflowEngine.triggerWorkflows("quote", quote.id, {
        eventType: "field_change",
        entity: enrichedEntity,
        triggeredBy: req.user!.id,
        changes: updateData, // Optional context if needed later
      });
      
      // 3. Amount Checks (if financials changed)
      const financialFields = ['total', 'subtotal', 'discount'];
      if (Object.keys(updateData).some(k => financialFields.includes(k))) {
         await WorkflowEngine.triggerWorkflows("quote", quote.id, {
          eventType: "amount_threshold",
          entity: enrichedEntity,
          triggeredBy: req.user!.id,
        });
      }

    } catch (workflowError) {
      logger.error("Failed to trigger workflows for updated quote:", workflowError);
    }


    // DISABLED: Automatic email sending when quote status changes to "sent"
    // Future implementation should use event bus or queue

    return res.json(quote);
  } catch (error) {
    logger.error("Update quote error:", error);
    res.status(500).json({ error: "Failed to update quote" });
  }
});

router.post("/:id/convert-to-invoice", authMiddleware, requireFeature('quotes_convertToInvoice'), requirePermission("invoices", "create"), async (req: AuthRequest, res: Response) => {
  try {
    const result = await db.transaction(async (tx) => {
        const quote = await storage.getQuote(req.params.id);
        if (!quote) throw new Error("Quote not found");

        if (quote.status === "invoiced") {
            throw new Error("Quote is already invoiced");
        }

        // CRITICAL: Check if sales order exists for this quote
        // If SO exists, invoice should be created FROM the SO, not from the quote
        const existingSalesOrder = await storage.getSalesOrderByQuote(req.params.id);
        if (existingSalesOrder) {
            const error: any = new Error("Cannot create invoice directly from quote. This quote has already been converted to a sales order. Please create the invoice from the sales order instead.");
            error.statusCode = 400;
            error.details = {
                salesOrderId: existingSalesOrder.id,
                salesOrderNumber: existingSalesOrder.orderNumber
            };
            throw error;
        }

        // Generate a new master invoice number using admin master invoice numbering settings
        const invoiceNumber = await NumberingService.generateMasterInvoiceNumber();

        // Create the invoice
        const [invoice] = await tx.insert(schema.invoices).values({
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
        }).returning();

        // Get quote items and create invoice items
        const quoteItems = await storage.getQuoteItems(quote.id);
        for (const item of quoteItems) {
            await tx.insert(schema.invoiceItems).values({
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
        await tx.update(schema.quotes)
            .set({ status: "invoiced", updatedAt: new Date() })
            .where(eq(schema.quotes.id, quote.id));

        // Log activity (inside or outside transaction? Inside is safer for consistency)
        await tx.insert(schema.activityLogs).values({
            userId: req.user!.id,
            action: "convert_quote_to_invoice",
            entityType: "invoice",
            entityId: invoice.id,
        });

        return invoice;
    });

    return res.json(result);
    
  } catch (error: any) {
    logger.error("Convert quote error:", error);
    if (error.statusCode === 400) {
        return res.status(400).json({ error: error.message, ...error.details });
    }
    return res.status(500).json({ error: error.message || "Failed to convert quote" });
  }
});


// Email Quote
router.post("/:id/email", authMiddleware, requireFeature('quotes_emailSending'), requirePermission("quotes", "view"), async (req: AuthRequest, res: Response) => {
    try {
      const { recipientEmail, message } = req.body;

      if (!recipientEmail) {
        return res.status(400).json({ error: "Recipient email is required" });
      }

      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      // Block sending if pending approval
      if (quote.approvalStatus === "pending") {
          return res.status(400).json({ error: "Quote requires approval before it can be sent." });
      }
      if (quote.approvalStatus === "rejected") {
          return res.status(400).json({ error: "Quote has been rejected and cannot be sent." });
      }

      const client = await storage.getClient(quote.clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      const items = await storage.getQuoteItems(quote.id);

      const creator = await storage.getUser(quote.createdBy);

      // Fetch company settings
      const settings = await storage.getAllSettings();
      const companyName = settings.find((s) => s.key === "company_companyName")?.value || "OPTIVALUE TEK";
      const companyAddress = settings.find((s) => s.key === "company_address")?.value || "";
      const companyPhone = settings.find((s) => s.key === "company_phone")?.value || "";
      const companyEmail = settings.find((s) => s.key === "company_email")?.value || "";
      const companyWebsite = settings.find((s) => s.key === "company_website")?.value || "";
      const companyGSTIN = settings.find((s) => s.key === "company_gstin")?.value || "";
      const companyLogo = settings.find((s) => s.key === "company_logo")?.value;

      // Fetch email templates
      const emailSubjectTemplate = settings.find((s) => s.key === "email_quote_subject")?.value || "Quote {QUOTE_NUMBER} from {COMPANY_NAME}";
      const emailBodyTemplate = settings.find((s) => s.key === "email_quote_body")?.value || "Dear {CLIENT_NAME},\\n\\nPlease find attached quote {QUOTE_NUMBER} for your review.\\n\\nTotal Amount: {TOTAL}\\nValid Until: {VALIDITY_DATE}\\n\\nBest regards,\\n{COMPANY_NAME}";

      // Calculate validity date
      const quoteDate = new Date(quote.quoteDate);
      const validityDate = new Date(quoteDate);
      validityDate.setDate(validityDate.getDate() + (quote.validityDays || 30));

      // Replace variables in templates
      const variables: Record<string, string> = {
        "{COMPANY_NAME}": companyName,
        "{CLIENT_NAME}": client.name,
        "{QUOTE_NUMBER}": quote.quoteNumber,
        "{TOTAL}": `₹${Number(quote.total).toLocaleString()}`,
        "{VALIDITY_DATE}": validityDate.toLocaleDateString(),
      };

      let emailSubject = emailSubjectTemplate;
      let emailBody = emailBodyTemplate;

      // Replace variables - escape special regex characters in the key
      Object.entries(variables).forEach(([key, value]) => {
        const escapedKey = key.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
        emailSubject = emailSubject.replace(new RegExp(escapedKey, 'g'), value);
        emailBody = emailBody.replace(new RegExp(escapedKey, 'g'), value);
      });

      // Add custom message if provided
      if (message) {
        emailBody = `${emailBody}\\n\\n---\\nAdditional Note:\\n${message}`;
      }

      // Fetch bank details
      const bankDetail = await storage.getActiveBankDetails();

      const bankName = bankDetail?.bankName || "";
      const bankAccountNumber = bankDetail?.accountNumber || "";
      const bankAccountName = bankDetail?.accountName || "";
      const bankIfscCode = bankDetail?.ifscCode || "";
      const bankBranch = bankDetail?.branch || "";
      const bankSwiftCode = bankDetail?.swiftCode || "";

      // Generate PDF for attachment
      const { PassThrough } = await import("stream");
      const pdfStream = new PassThrough();

      const pdfPromise = PDFService.generateQuotePDF({
        quote,
        client,
        items,
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        companyWebsite,
        companyGSTIN,
        companyLogo,
        preparedBy: creator?.name,
        preparedByEmail: creator?.email,
        bankDetails: {
          bankName,
          accountNumber: bankAccountNumber,
          accountName: bankAccountName,
          ifsc: bankIfscCode,
          branch: bankBranch,
          swift: bankSwiftCode,
        },
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
      await EmailService.sendQuoteEmail(
        recipientEmail,
        emailSubject,
        emailBody,
        pdfBuffer
      );


      await storage.createActivityLog({
        userId: req.user!.id,
        action: "email_quote",
        entityType: "quote",
        entityId: quote.id,
      });

      return res.json({ success: true, message: "Quote sent successfully" });
    } catch (error: any) {
      logger.error("Email quote error:", error);
      return res.status(500).json({ error: error.message || "Failed to send quote email" });
    }
});

router.get("/:id/pdf", authMiddleware, requireFeature('quotes_pdfGeneration'), async (req: AuthRequest, res: Response) => {
    logger.info(`[PDF Export START] Received request for quote: ${req.params.id}`);
    try {
      const quote = await storage.getQuote(req.params.id);
      logger.info(`[PDF Export] Found quote: ${quote?.quoteNumber}`);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      const client = await storage.getClient(quote.clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      const items = await storage.getQuoteItems(quote.id);
      const creator = await storage.getUser(quote.createdBy);

      // Fetch company settings
      const settings = await storage.getAllSettings();
      // Debug logging to see what keys are available
      logger.info("Available settings keys:", settings.map(s => s.key));

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
      
      logger.info("Company Logo found:", !!companyLogo, "Length:", companyLogo?.length);

      // Fetch bank details from settings
      const bankName = settings.find((s) => s.key === "bank_bankName")?.value || "";
      const bankAccountNumber = settings.find((s) => s.key === "bank_accountNumber")?.value || "";
      const bankAccountName = settings.find((s) => s.key === "bank_accountName")?.value || "";
      const bankIfscCode = settings.find((s) => s.key === "bank_ifscCode")?.value || "";
      const bankBranch = settings.find((s) => s.key === "bank_branch")?.value || "";
      const bankSwiftCode = settings.find((s) => s.key === "bank_swiftCode")?.value || "";

      logger.error("!!! DEBUG BANK DETAILS !!!", {
          bankName,
          bankAccountNumber,
          bankAccountName,
          bankIfscCode
      });

      // Create filename - ensure it's clean and doesn't have problematic characters
      const cleanFilename = `Quote-${quote.quoteNumber}.pdf`.replace(/[^\w\-. ]/g, '_');

      // Set headers BEFORE piping to ensure they're sent first
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", "");  // Let Node calculate length
      // Use RFC 5987 format for filename with UTF-8 encoding
      res.setHeader("Content-Disposition", `attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`);
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      // DEBUG: Log what we're sending
      logger.info(`[PDF Export] Quote #${quote.quoteNumber}`);
      logger.info(`[PDF Export] Clean filename: ${cleanFilename}`);
      logger.info(`[PDF Export] Content-Disposition header: attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`);

      // Generate PDF using Worker Thread with Fallback
      logger.info(`[PDF Export] Attempting offload to Worker Thread`);
      
      const pdfPayload = {
        quote,
        client,
        items,
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        companyWebsite,
        companyGSTIN,
        companyLogo,
        preparedBy: creator?.name,
        preparedByEmail: creator?.email,
        bankDetails: {
          bankName,
          accountNumber: bankAccountNumber,
          accountName: bankAccountName,
          ifsc: bankIfscCode,
          branch: bankBranch,
          swift: bankSwiftCode,
        },
      };

      let pdfBuffer: Buffer;
      try {
          pdfBuffer = await PDFService.generateQuotePDFInWorker(pdfPayload as any);
          logger.info(`[PDF Export] Worker returned PDF buffer. Size: ${pdfBuffer.length}`);
      } catch (err: any) {
          logger.warn(`[PDF Export] Worker failed (${err.message}). Falling back to main thread.`);
          
          // Fallback: Generate in main thread
          const { PassThrough } = await import("stream"); // Ensure import
          const stream = new PassThrough();
          const chunks: Buffer[] = [];
          stream.on("data", c => chunks.push(c));
          
          const done = new Promise<void>((resolve, reject) => {
              stream.on("end", () => resolve());
              stream.on("error", reject);
          });

          await PDFService.generateQuotePDF(pdfPayload as any, stream);
          
          await done;
          pdfBuffer = Buffer.concat(chunks);
          logger.info(`[PDF Export] Main thread generated PDF buffer. Size: ${pdfBuffer.length}`);
      }

      res.send(pdfBuffer);
      logger.info(`[PDF Export] PDF stream piped successfully`);

      // Log after headers are sent
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "export_pdf",
        entityType: "quote",
        entityId: quote.id,
      });
      logger.info(`[PDF Export COMPLETE] Quote PDF exported successfully: ${quote.quoteNumber}`);
    } catch (error: any) {
      logger.error("[PDF Export ERROR]", error);
      return res.status(500).json({ error: error.message || "Failed to generate PDF" });
    }
});

router.get("/:id/invoices", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const invoices = await storage.getInvoicesByQuote(req.params.id);
      const enrichedInvoices = await Promise.all(
        invoices.map(async (invoice) => {
          const items = await storage.getInvoiceItems(invoice.id);
          return { ...invoice, items };
        })
      );
      res.json(enrichedInvoices);
    } catch (error) {
      logger.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
});

// Generate public link
router.post("/:id/share", authMiddleware, requirePermission("quotes", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    const quote = await storage.getQuote(req.params.id);
    if (!quote) return res.status(404).json({ error: "Quote not found" });

    // Generate new token if not exists or if requested to regenerate
    const { nanoid } = await import("nanoid");
    const token = nanoid(32); // Long secure token
    
    // Set expiry to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const updated = await storage.updateQuote(quote.id, {
      publicToken: quote.publicToken || token, // Keep existing if present, or use new
      tokenExpiresAt: quote.tokenExpiresAt || expiresAt, // Keep existing expiry if present
    });

    if (!updated) {
        throw new Error("Failed to update quote with public token");
    }

    return res.json({ 
      token: updated.publicToken, 
      expiresAt: updated.tokenExpiresAt,
      url: `${req.protocol}://${req.get('host')}/p/quote/${updated.publicToken}`
    });
  } catch (error) {
    logger.error("Share quote error:", error);
    return res.status(500).json({ error: "Failed to generate share link" });
  }
});

// Remove public link
router.delete("/:id/share", authMiddleware, requirePermission("quotes", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    const quote = await storage.getQuote(req.params.id);
    if (!quote) return res.status(404).json({ error: "Quote not found" });

    await storage.updateQuote(quote.id, {
        publicToken: null,
        tokenExpiresAt: null,
    } as any); // Type cast needed until types are fully updated

    return res.json({ success: true });
  } catch (error) {
    logger.error("Unshare quote error:", error);
    return res.status(500).json({ error: "Failed to remove share link" });
  }
});

// ============================================
// INTERNAL ROUTES - Require Authentication
// ============================================

// INTERNAL ROUTE: Get All Comments for Quote (including internal comments)
// NOTE: This must come AFTER public routes to avoid matching /public/:token/comments
router.get("/:id/comments", requireFeature('quotes_module'), authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const quote = await storage.getQuote(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    const comments = await storage.getQuoteComments(quote.id, true); // includeInternal = true
    res.json(comments);
  } catch (error) {
    logger.error("Quote comments fetch error:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// INTERNAL ROUTE: Add Staff Comment
router.post("/:id/comments", requireFeature('quotes_module'), authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { message, isInternal } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const quote = await storage.getQuote(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    const user = await storage.getUser(req.user!.id);
    const comment = await storage.createQuoteComment({
      quoteId: quote.id,
      authorType: "internal",
      authorName: user?.name || req.user!.email,
      authorEmail: req.user!.email,
      message,
      parentCommentId: null,
      isInternal: isInternal || false,
    });

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "staff_comment",
      entityType: "quote",
      entityId: quote.id,
      metadata: { commentId: comment.id, isInternal }
    });

    res.json(comment);
  } catch (error) {
    logger.error("Quote comment create error:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Approval Routes
router.post("/:id/approve", authMiddleware, requireFeature('quotes_approve'), requirePermission("quotes", "edit"), async (req: AuthRequest, res: Response) => {
    try {
        const quote = await storage.getQuote(req.params.id);
        if (!quote) return res.status(404).json({ error: "Quote not found" });

        if (quote.approvalStatus !== "pending") {
            return res.status(400).json({ error: "Quote is not pending approval" });
        }

        // Check permissions: Req user role must match approvalRequiredBy (or be admin)
        // Simple check:
        const requiredRole = quote.approvalRequiredBy;
        if (requiredRole && req.user!.role !== requiredRole && req.user!.role !== "admin") {
             return res.status(403).json({ error: `You do not have permission to approve this quote. Required role: ${requiredRole}` });
        }

        const updated = await storage.updateQuote(quote.id, {
            approvalStatus: "approved",
            status: "approved", // Also update main status? Or keep as draft/sent? Usually 'approved' is internal.
            // Let's map internal approval to main status 'approved' for now, but usually 'approved' in main status means Client Approved.
            // Wait, `quoteStatusEnum` has `approved`. Is that for Client or Internal?
            // Usually Client. 
            // If we have internal approval, maybe we keep it as 'draft' or 'pending'?
            // Let's keep main status as 'draft' (or whatever it was) but set `approvalStatus` to `approved`.
            // When sending, we check `approvalStatus`.
            // BUT, if the user manually sets status to 'Approved' (Client Approved), we might want to block that if internal approval is pending?
            // For now, let's just update `approvalStatus`.
            
            // Actually, if it's "Approved" by manager, it's ready to be sent.
        });

        await storage.createActivityLog({
            userId: req.user!.id,
            action: "approve_quote_internal",
            entityType: "quote",
            entityId: quote.id,
        });

        res.json(updated);
    } catch (error) {
        logger.error("Approve quote error:", error);
        res.status(500).json({ error: "Failed to approve quote" });
    }
});

router.post("/:id/reject", authMiddleware, requireFeature('quotes_approve'), requirePermission("quotes", "edit"), async (req: AuthRequest, res: Response) => {
    try {
        const quote = await storage.getQuote(req.params.id);
        if (!quote) return res.status(404).json({ error: "Quote not found" });

        if (quote.approvalStatus !== "pending") {
             return res.status(400).json({ error: "Quote is not pending approval" });
        }
        
        const requiredRole = quote.approvalRequiredBy;
        if (requiredRole && req.user!.role !== requiredRole && req.user!.role !== "admin") {
             return res.status(403).json({ error: `You do not have permission to reject this quote. Required role: ${requiredRole}` });
        }

        const updated = await storage.updateQuote(quote.id, {
            approvalStatus: "rejected",
            status: "rejected", // Update main status to rejected too?
        });

        await storage.createActivityLog({
            userId: req.user!.id,
            action: "reject_quote_internal",
            entityType: "quote",
            entityId: quote.id,
        });

        res.json(updated);
    } catch (error) {
        logger.error("Reject quote error:", error);
        res.status(500).json({ error: "Failed to reject quote" });
    }
});

export default router;
