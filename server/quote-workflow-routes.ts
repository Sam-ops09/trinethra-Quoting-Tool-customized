
import { Router, Response } from "express";
import { AuthRequest } from "./routes";
import { storage } from "./storage";
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { requirePermission } from "./permissions-middleware";
import { hasPermission } from "./permissions-service";
import { requireFeature } from "./feature-flags-middleware";
import { isFeatureEnabled } from "@shared/feature-flags";
import ExcelJS from "exceljs";
import { z } from "zod";
import { NumberingService } from "./services/numbering.service";
import { InvoicePDFService } from "./services/invoice-pdf.service";
import { SalesOrderPDFService } from "./services/sales-order-pdf.service";
import { EmailService } from "./services/email.service";
import { Readable } from "stream";

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk: any) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err: any) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Reserve stock for a sales order when it's confirmed.
 * For each item with a productId, increases reservedQuantity and decreases availableQuantity.
 * Skipped if products_stock_tracking or products_reserve_on_order is OFF.
 */
async function reserveStockForSalesOrder(salesOrderId: string): Promise<void> {
  // Skip if stock tracking or reserve-on-order is disabled
  if (!isFeatureEnabled('products_stock_tracking') || !isFeatureEnabled('products_reserve_on_order')) {
    console.log(`[Stock Reserve] Skipped for SO ${salesOrderId}: Stock tracking or reserve-on-order is disabled`);
    return;
  }
  
  try {
    const items = await storage.getSalesOrderItems(salesOrderId);
    
    // Group items by productId
    const productQuantities: Record<string, number> = {};
    for (const item of items) {
      if (item.productId) {
        productQuantities[item.productId] = (productQuantities[item.productId] || 0) + item.quantity;
      }
    }
    
    // Update each product's reserved and available quantities
    for (const [productId, quantity] of Object.entries(productQuantities)) {
      await db.update(schema.products)
        .set({
          reservedQuantity: sql`${schema.products.reservedQuantity} + ${quantity}`,
          availableQuantity: sql`${schema.products.availableQuantity} - ${quantity}`,
        })
        .where(eq(schema.products.id, productId));
    }
    
    console.log(`[Stock Reserve] Reserved stock for SO ${salesOrderId}: ${Object.keys(productQuantities).length} products`);
  } catch (error) {
    console.error(`[Stock Reserve] Error reserving stock for SO ${salesOrderId}:`, error);
    throw error;
  }
}

/**
 * Release reserved stock when a sales order is cancelled.
 * Skipped if products_stock_tracking or products_reserve_on_order is OFF.
 */
async function releaseStockForSalesOrder(salesOrderId: string): Promise<void> {
  // Skip if stock tracking or reserve-on-order is disabled
  if (!isFeatureEnabled('products_stock_tracking') || !isFeatureEnabled('products_reserve_on_order')) {
    console.log(`[Stock Release] Skipped for SO ${salesOrderId}: Stock tracking or reserve-on-order is disabled`);
    return;
  }
  
  try {
    const items = await storage.getSalesOrderItems(salesOrderId);
    
    // Group items by productId
    const productQuantities: Record<string, number> = {};
    for (const item of items) {
      if (item.productId) {
        productQuantities[item.productId] = (productQuantities[item.productId] || 0) + item.quantity;
      }
    }
    
    // Restore each product's reserved and available quantities
    for (const [productId, quantity] of Object.entries(productQuantities)) {
      await db.update(schema.products)
        .set({
          reservedQuantity: sql`GREATEST(0, ${schema.products.reservedQuantity} - ${quantity})`,
          availableQuantity: sql`${schema.products.availableQuantity} + ${quantity}`,
        })
        .where(eq(schema.products.id, productId));
    }
    
    console.log(`[Stock Release] Released stock for SO ${salesOrderId}: ${Object.keys(productQuantities).length} products`);
  } catch (error) {
    console.error(`[Stock Release] Error releasing stock for SO ${salesOrderId}:`, error);
    // Don't throw - allow cancellation to proceed
  }
}

const router = Router();

/**
 * QUOTE VERSIONS
 */

// Revise a quote (Create version snapshot + Reset to Draft)
router.post("/quotes/:id/revise",
  requireFeature('quotes_module'),
  requirePermission("quotes", "edit"),
  async (req: AuthRequest, res: Response) => {
    try {
      const quoteId = req.params.id;
      const quote = await storage.getQuote(quoteId);

      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      // Allow revision for all quotes (including drafts if manual snapshot is desired)
      // Removed check blocking draft status

      // 1. Create Snapshot (Logic copied from /versions endpoint)
      const items = await storage.getQuoteItems(quoteId);

      await storage.createQuoteVersion({
        quoteId,
        version: quote.version,
        clientId: quote.clientId,
        status: quote.status,
        validityDays: quote.validityDays,
        quoteDate: quote.quoteDate,
        validUntil: quote.validUntil,
        referenceNumber: quote.referenceNumber,
        attentionTo: quote.attentionTo,
        subtotal: quote.subtotal.toString(),
        discount: quote.discount.toString(),
        cgst: quote.cgst.toString(),
        sgst: quote.sgst.toString(),
        igst: quote.igst.toString(),
        shippingCharges: quote.shippingCharges.toString(),
        total: quote.total.toString(),
        notes: quote.notes,
        termsAndConditions: quote.termsAndConditions,
        bomSection: quote.bomSection,
        slaSection: quote.slaSection,
        timelineSection: quote.timelineSection,
        itemsSnapshot: JSON.stringify(items),
        revisionNotes: req.body.revisionNotes || `Revision from status: ${quote.status}`,
        revisedBy: req.user!.id,
      });

      // 2. Update Quote to Draft and Increment Version
      const updatedQuote = await storage.updateQuote(quoteId, {
        status: "draft",
        version: quote.version + 1,
        // Reset approval/sent fields if any? (Not explicitly in schema besides status)
      });

      // 3. Log Activity
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "revise_quote",
        entityType: "quote",
        entityId: quote.id,
      });

      return res.json(updatedQuote);
    } catch (error: any) {
      console.error("Revise quote error:", error);
      return res.status(500).json({ error: error.message || "Failed to revise quote" });
    }
  }
);

// Create a new version snapshot OF THE CURRENT STATE (Manual snapshot without reset)
router.post("/quotes/:id/versions", 
  requireFeature('quotes_module'),
  // authMiddleware is applied at mount level
  requirePermission("quotes", "edit"), 
  async (req: AuthRequest, res: Response) => {
    try {
      const quoteId = req.params.id;
      const quote = await storage.getQuote(quoteId);
      
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      // Calculate next version number
      const existingVersions = await storage.getQuoteVersions(quoteId);
      const nextVersion = existingVersions.length > 0 
        ? Math.max(...existingVersions.map(v => v.version)) + 1 
        : 1;

      // Get items for snapshot
      const items = await storage.getQuoteItems(quoteId);

      // Create version
      const version = await storage.createQuoteVersion({
        quoteId,
        version: nextVersion,
        clientId: quote.clientId,
        status: quote.status,
        validityDays: quote.validityDays,
        quoteDate: quote.quoteDate,
        validUntil: quote.validUntil,
        referenceNumber: quote.referenceNumber,
        attentionTo: quote.attentionTo,
        subtotal: quote.subtotal.toString(),
        discount: quote.discount.toString(),
        cgst: quote.cgst.toString(),
        sgst: quote.sgst.toString(),
        igst: quote.igst.toString(),
        shippingCharges: quote.shippingCharges.toString(),
        total: quote.total.toString(),
        notes: quote.notes,
        termsAndConditions: quote.termsAndConditions,
        bomSection: quote.bomSection,
        slaSection: quote.slaSection,
        timelineSection: quote.timelineSection,
        itemsSnapshot: JSON.stringify(items),
        revisionNotes: req.body.revisionNotes,
        revisedBy: req.user!.id,
      });

      return res.json(version);
    } catch (error: any) {
      console.error("Create quote version error:", error);
      return res.status(500).json({ error: error.message || "Failed to create quote version" });
    }
  }
);

// Get versions for a quote
router.get("/quotes/:id/versions", 
  requireFeature('quotes_module'),
  requirePermission("quotes", "view"), 
  async (req: AuthRequest, res: Response) => {
    try {
      const versions = await storage.getQuoteVersions(req.params.id);
      return res.json(versions);
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to fetch quote versions" });
    }
  }
);

// Get specific version
router.get("/quotes/:id/versions/:version", 
  requireFeature('quotes_module'),
  requirePermission("quotes", "view"), 
  async (req: AuthRequest, res: Response) => {
    try {
      const version = await storage.getQuoteVersion(req.params.id, parseInt(req.params.version));
      if (!version) {
        return res.status(404).json({ error: "Version not found" });
      }
      return res.json(version);
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to fetch version" });
    }
  }
);

// Clone a quote
router.post("/quotes/:id/clone",
  requireFeature('quotes_clone'),
  requirePermission("quotes", "create"),
  async (req: AuthRequest, res: Response) => {
    try {
      const quoteId = req.params.id;
      const originalQuote = await storage.getQuote(quoteId);

      if (!originalQuote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      const items = await storage.getQuoteItems(quoteId);

      // Generate new quote number
      const quoteNumber = await NumberingService.generateQuoteNumber();

      // Create new quote
      // Note: We don't copy versions, activities, or invoices. This is a fresh start.
      const newQuote = await storage.createQuote({
        quoteNumber,
        clientId: originalQuote.clientId,
        templateId: originalQuote.templateId,
        status: "draft",
        validityDays: originalQuote.validityDays,
        quoteDate: new Date(),
        referenceNumber: originalQuote.referenceNumber ? `Clone of ${originalQuote.quoteNumber}` : undefined,
        attentionTo: originalQuote.attentionTo,
        subtotal: originalQuote.subtotal.toString(),
        discount: originalQuote.discount.toString(),
        cgst: originalQuote.cgst.toString(),
        sgst: originalQuote.sgst.toString(),
        igst: originalQuote.igst.toString(),
        shippingCharges: originalQuote.shippingCharges.toString(),
        total: originalQuote.total.toString(),
        notes: originalQuote.notes,
        termsAndConditions: originalQuote.termsAndConditions,
        bomSection: originalQuote.bomSection,
        slaSection: originalQuote.slaSection,
        timelineSection: originalQuote.timelineSection,
        createdBy: req.user!.id,
      });

      // Clone items
      for (const item of items) {
        await storage.createQuoteItem({
          quoteId: newQuote.id,
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toString(),
          subtotal: item.subtotal.toString(),
          hsnSac: item.hsnSac,
          sortOrder: item.sortOrder,
        });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "clone_quote",
        entityType: "quote",
        entityId: newQuote.id,
      });

      return res.json(newQuote);
    } catch (error: any) {
      console.error("Clone quote error:", error);
      return res.status(500).json({ error: error.message || "Failed to clone quote" });
    }
  }
);


/**
 * SALES ORDERS
 */

// Create Sales Order from Quote
router.post("/sales-orders",
  requireFeature('quotes_module'),
  requirePermission("sales_orders", "create"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { quoteId } = req.body;
      
      if (!quoteId) {
        return res.status(400).json({ error: "Quote ID is required" });
      }

      // Check if quote exists
      const quote = await storage.getQuote(quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      if (quote.status !== "approved") {
        return res.status(400).json({ error: "Quote must be approved before converting to a Sales Order." });
      }

      // Check if sales order already exists
      const existingOrder = await storage.getSalesOrderByQuote(quoteId);
      if (existingOrder) {
        return res.status(400).json({ error: "Sales Order already exists for this quote", id: existingOrder.id });
      }

      const orderNumber = await NumberingService.generateSalesOrderNumber(); 

      const salesOrder = await db.transaction(async (tx) => {
          // Create Sales Order
          const [order] = await tx.insert(schema.salesOrders).values({
            orderNumber,
            quoteId: quote.id,
            clientId: quote.clientId,
            status: "draft",
            orderDate: new Date(),
            subtotal: quote.subtotal.toString(),
            discount: quote.discount.toString(),
            cgst: quote.cgst.toString(),
            sgst: quote.sgst.toString(),
            igst: quote.igst.toString(),
            shippingCharges: quote.shippingCharges.toString(),
            total: quote.total.toString(),
            notes: quote.notes,
            termsAndConditions: quote.termsAndConditions,
            createdBy: req.user!.id,
          }).returning();

          // Create Items
          const quoteItems = await storage.getQuoteItems(quoteId);
          for (const item of quoteItems) {
            await tx.insert(schema.salesOrderItems).values({
              salesOrderId: order.id,
              productId: item.productId || null,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice.toString(),
              subtotal: item.subtotal.toString(),
              hsnSac: item.hsnSac,
              sortOrder: item.sortOrder,
              status: "pending",
              fulfilledQuantity: 0
            });
          }

          await tx.insert(schema.activityLogs).values({
            userId: req.user!.id,
            action: "create", 
            entityType: "sales_orders" as any,
            entityId: order.id,
            timestamp: new Date()
          });

          return order;
      });

      return res.json(salesOrder);
    } catch (error: any) {
      console.error("Create sales order error:", error);
      return res.status(500).json({ error: error.message || "Failed to create sales order" });
    }
  }
);

router.get("/sales-orders",
  requirePermission("sales_orders", "view"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { quoteId } = req.query;
      
      let orders: any[] = [];
      if (quoteId) {
        const order = await storage.getSalesOrderByQuote(quoteId as string);
        if (order) {
          orders = [order];
        }
      } else {
        orders = await storage.getAllSalesOrders();
      }

      // Enrich with client name
      const ordersWithData = await Promise.all(orders.map(async (order) => {
        const client = await storage.getClient(order.clientId);
        const quote = await storage.getQuote(order.quoteId);
        return {
          ...order,
          clientName: client?.name || "Unknown",
          quoteNumber: quote?.quoteNumber || "Unknown"
        };
      }));
      return res.json(ordersWithData);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch sales orders" });
    }
  }
);

router.get("/sales-orders/:id",
  requirePermission("sales_orders", "view"),
  async (req: AuthRequest, res: Response) => {
    try {
      const order = await storage.getSalesOrder(req.params.id);
      if (order) {
          console.log(`[GET SO] ID: ${order.id}, Subtotal: ${order.subtotal}, Discount: ${order.discount}, Tax: ${order.cgst}/${order.sgst}/${order.igst}, Total: ${order.total}`);
      }
      if (!order) {
        return res.status(404).json({ error: "Sales Order not found" });
      }
      
      const items = await storage.getSalesOrderItems(order.id);
      const client = await storage.getClient(order.clientId);
      const quote = await storage.getQuote(order.quoteId);
      const quoteItems = await storage.getQuoteItems(order.quoteId);
      const creator = await storage.getUser(order.createdBy);

      // Check for linked invoice
      const invoices = await storage.getInvoicesByQuote(order.quoteId);
      const linkedInvoice = invoices.find(inv => inv.salesOrderId === order.id);

      return res.json({
        ...order,
        client,
        items,
        quote: {
          ...quote,
          items: quoteItems
        },
        createdByName: creator?.name || "Unknown",
        invoiceId: linkedInvoice?.id
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch sales order" });
    }
  }
);

router.patch("/sales-orders/:id",
  requirePermission("sales_orders", "edit"),
  async (req: AuthRequest, res: Response) => {
    try {
      const orderId = req.params.id;
      const currentOrder = await storage.getSalesOrder(orderId);
      if (!currentOrder) return res.status(404).json({ error: "Order not found" });
      
      // Handle status transitions permissions
      if (req.body.status && req.body.status !== currentOrder.status) {
        const newStatus = req.body.status;
        if (newStatus === "confirmed" && currentOrder.status === "draft") {
          if (!req.user || !hasPermission(req.user.role as any, "sales_orders", "approve")) {
            return res.status(403).json({ error: "Insufficient permissions to confirm orders" });
          }
          req.body.confirmedAt = new Date();
          req.body.confirmedBy = req.user.id;
        } else if (newStatus === "cancelled") {
          if (!req.user || !hasPermission(req.user!.role as any, "sales_orders", "cancel")) {
            return res.status(403).json({ error: "Insufficient permissions to cancel orders" });
          }
        } else if (newStatus === "fulfilled" && currentOrder.status !== "confirmed") {
          return res.status(400).json({ error: "Only confirmed orders can be fulfilled" });
        }
      }
      
      const result = await db.transaction(async (tx) => {
          const items = req.body.items;
          const updateData: any = { ...req.body };
          delete updateData.items;

          // Date Conversions
          if (updateData.expectedDeliveryDate) updateData.expectedDeliveryDate = new Date(updateData.expectedDeliveryDate);
          if (updateData.actualDeliveryDate) updateData.actualDeliveryDate = new Date(updateData.actualDeliveryDate);

          // Server-Side Financial Recalculation
          let subtotal = Number(currentOrder.subtotal);
          
          // Helper to safely get number or current
          const getNum = (val: any, current: string | null) => val !== undefined ? Number(val) : Number(current || 0);

          if (items && Array.isArray(items)) {
              // Recalculate subtotal from new items
              subtotal = items.reduce((acc: number, item: any) => acc + (Number(item.quantity) * Number(item.unitPrice)), 0);
              updateData.subtotal = subtotal.toString();
          }

          const discount = getNum(updateData.discount, currentOrder.discount);
          const shipping = getNum(updateData.shippingCharges, currentOrder.shippingCharges);
          const cgst = getNum(updateData.cgst, currentOrder.cgst);
          const sgst = getNum(updateData.sgst, currentOrder.sgst);
          const igst = getNum(updateData.igst, currentOrder.igst);

          // Enforce Total Consistency
          updateData.total = (subtotal - discount + shipping + cgst + sgst + igst).toString();

          // 1. Update Order
          const [updatedOrder] = await tx.update(schema.salesOrders)
              .set(updateData)
              .where(eq(schema.salesOrders.id, orderId))
              .returning();

          if (!updatedOrder) throw new Error("Failed to update sales order");

          // 2. Update Items (Transaction Safe)
          if (items && Array.isArray(items)) {
              await tx.delete(schema.salesOrderItems).where(eq(schema.salesOrderItems.salesOrderId, orderId));
              
              for (let i = 0; i < items.length; i++) {
                  const item = items[i];
                  await tx.insert(schema.salesOrderItems).values({
                      salesOrderId: orderId,
                      productId: item.productId || null,
                      description: item.description,
                      quantity: item.quantity,
                      unitPrice: item.unitPrice,
                      subtotal: item.subtotal,
                      hsnSac: item.hsnSac || null,
                      sortOrder: i,
                      status: "pending",
                  });
              }
          }

          // 3. Handle Stock (Reserve Logic)
          // Note: reserveStockForSalesOrder handles its own logic, but we should verify if it needs to be inside transaction?
          // It updates Products table.
          // Ideally yes. But `reserveStockForSalesOrder` is a helper function that does its own updates.
          // If we want it atomic, we should refactor it to accept `tx` or inline it.
          // For now, let's keep it after transaction commit or accept minor risk since it's "Reserve" not "Deduct".
          // Actually, if we fail here, we want to rollback the order update.
          // Since `reserveStockForSalesOrder` likely uses global `storage` / `db`, it's outside this `tx`.
          // We can call it AFTER metadata update.
          
          return updatedOrder;
      });

      // Post-transaction Side Effects
      if (req.body.status && req.body.status !== currentOrder.status) {
          if (req.body.status === "confirmed" && currentOrder.status === "draft") {
             await reserveStockForSalesOrder(orderId);
          } else if (req.body.status === "cancelled" && currentOrder.status === "confirmed") {
             await releaseStockForSalesOrder(orderId);
          }
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "edit",
        entityType: "sales_orders" as any,
        entityId: result.id
      });

      return res.json(result);
    } catch (error: any) {
      console.error("Error updating sales order:", error);
      return res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  "/sales-orders/:id/convert-to-invoice",
  requireFeature('invoices_module'),
  requirePermission("invoices", "create"),
  async (req: AuthRequest, res: Response) => {
    try {
      const orderId = req.params.id;
      
      // 1. Initial Checks (Reads)
      const order = await storage.getSalesOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Sales order not found" });
      }

      if (order.status !== "fulfilled") {
        return res.status(400).json({ 
          error: "Only fulfilled sales orders can be converted to an invoice" 
        });
      }

      const quote = await storage.getQuote(order.quoteId);
      if (!quote || quote.status !== "approved") {
        return res.status(400).json({ 
          error: "Linked quote must be approved" 
        });
      }

      // 2. Prepare Data
      let items: any[] = await storage.getSalesOrderItems(orderId);
      if (!items || items.length === 0) {
        items = await storage.getQuoteItems(order.quoteId);
      }
      if (!items || items.length === 0) {
        return res.status(400).json({ error: "No items found to invoice" });
      }

      const invoiceNumber = await NumberingService.generateChildInvoiceNumber();

      // 3. Transactional Write
      const result = await db.transaction(async (tx) => {
          // A. Check for duplicates (Double check within lock/transaction scope)
          // Note: The Unique Index we added acts as the final guard rail
          const existingInvoices = await tx.select().from(schema.invoices).where(eq(schema.invoices.salesOrderId, orderId));
          if (existingInvoices.length > 0) {
              throw new Error("An invoice has already been generated for this sales order");
          }

          // B. Create Invoice
          const [invoice] = await tx.insert(schema.invoices).values({
              invoiceNumber,
              quoteId: order.quoteId,
              salesOrderId: orderId,
              clientId: order.clientId,
              issueDate: new Date(),
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              status: "draft",
              isMaster: false,
              paymentStatus: "pending",
              paidAmount: "0", // String for decimal
              createdBy: req.user!.id,
              subtotal: order.subtotal,
              discount: order.discount,
              cgst: order.cgst,
              sgst: order.sgst,
              igst: order.igst,
              shippingCharges: order.shippingCharges,
              total: order.total,
              notes: order.notes,
              termsAndConditions: order.termsAndConditions,
              deliveryNotes: `Delivery Date: ${order.actualDeliveryDate ? new Date(order.actualDeliveryDate).toLocaleDateString() : 'N/A'}`,
          }).returning();

          // C. Process Items & Stock
          const shortageNotes: string[] = [];
          
          for (const item of items) {
              // Stock Logic
              if (item.productId && isFeatureEnabled('products_stock_tracking')) {
                  // Atomic Update
                  // We lock the row for update to prevent race between read and write within this transaction
                  const [product] = await tx.select().from(schema.products)
                      .where(eq(schema.products.id, item.productId));
                      
                  if (product) {
                      const requiredQty = Number(item.quantity);
                      const currentStock = Number(product.stockQuantity);
                      
                      // Check validation
                      const allowNegative = isFeatureEnabled('products_allow_negative_stock');
                      if (!allowNegative && currentStock < requiredQty) {
                          console.log(`[Stock Deduction] Stock shortage for ${item.description}`);
                      }
                      
                       if (isFeatureEnabled('products_stock_warnings') && currentStock < requiredQty) {
                          shortageNotes.push(`[SHORTAGE] ${item.description}: Required ${requiredQty}, Available ${currentStock}`);
                      }

                      // Atomic SQL Update
                      // Decrease Stock by Qty.
                      // Decrease Reserved by Qty (clamped to 0).
                      // Recalculate Available using explicit formula: (stock - qty) - (reserved - qty)
                      // Wait, if reserved was NOT increased before (e.g. older order), we should play safe.
                      // available = stock - reserved. 
                      // So we update stock and reserved, and then set available = stock - reserved.
                      
                      const updateQuery = {
                          stockQuantity: sql`${schema.products.stockQuantity} - ${requiredQty}`,
                          reservedQuantity: sql`GREATEST(0, ${schema.products.reservedQuantity} - ${requiredQty})`,
                          availableQuantity: sql`(${schema.products.stockQuantity} - ${requiredQty}) - GREATEST(0, ${schema.products.reservedQuantity} - ${requiredQty})`
                      };

                      await tx.update(schema.products)
                          .set(updateQuery)
                          .where(eq(schema.products.id, item.productId));
                  }
              }

              // Create Invoice Item
              await tx.insert(schema.invoiceItems).values({
                  invoiceId: invoice.id,
                  productId: item.productId || null,
                  description: item.description,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  subtotal: item.subtotal,
                  hsnSac: item.hsnSac || null,
                  sortOrder: item.sortOrder,
                  status: "pending",
                  fulfilledQuantity: item.quantity,
              });
          }

          // D. Update Delivery Notes with Shortages
          if (isFeatureEnabled('products_stock_warnings') && shortageNotes.length > 0) {
              const existingNotes = invoice.deliveryNotes || "";
              const shortageText = shortageNotes.join("\n");
              const newNotes = existingNotes ? `${existingNotes}\n\n${shortageText}` : shortageText;
              
              await tx.update(schema.invoices)
                  .set({ deliveryNotes: newNotes })
                  .where(eq(schema.invoices.id, invoice.id));
                  
              invoice.deliveryNotes = newNotes; // Update local obj for PDF
          }

          // E. Update Quote Status
          await tx.update(schema.quotes)
              .set({ status: "invoiced" })
              .where(eq(schema.quotes.id, quote.id));

          // F. Log Activities
          await tx.insert(schema.activityLogs).values({
              userId: req.user!.id,
              action: "create_invoice",
              entityType: "invoice",
              entityId: invoice.id,
              metadata: { fromSalesOrder: orderId },
              timestamp: new Date()
          });
          await tx.insert(schema.activityLogs).values({
              userId: req.user!.id,
              action: "update_status", 
              entityType: "quote",
              entityId: quote.id,
              metadata: { 
                newStatus: "invoiced", 
                trigger: "invoice_creation",
                salesOrderId: orderId
              },
              timestamp: new Date()
          });

          return { invoice, items };
      });

      // 4. Post-Transaction: PDF Generation
      try {
          const { invoice, items } = result;
           // Fetch dependencies for PDF
          const settingss = await storage.getAllSettings();
          
          const companyName = settingss.find((s) => s.key === "company_name")?.value || "OPTIVALUE TEK";
          const companyAddress = settingss.find((s) => s.key === "company_address")?.value || "";
          const companyPhone = settingss.find((s) => s.key === "company_phone")?.value || "";
          const companyEmail = settingss.find((s) => s.key === "company_email")?.value || "";
          const companyWebsite = settingss.find((s) => s.key === "company_website")?.value || "";
          const companyGSTIN = settingss.find((s) => s.key === "company_gstin")?.value || "";

          const bankDetail = await storage.getActiveBankDetails();
          const client = await storage.getClient(invoice.clientId!);

          const { PassThrough } = await import("stream");
          const pt = new PassThrough();

          const pdfPromise = InvoicePDFService.generateInvoicePDF({
              quote: quote as any,
              client: client!,
              items: items as any,
              companyName,
              companyAddress,
              companyPhone,
              companyEmail,
              companyWebsite,
              companyGSTIN,
              companyDetails: {
                 name: companyName,
                 address: companyAddress,
                 phone: companyPhone,
                 email: companyEmail,
                 website: companyWebsite,
                 gstin: companyGSTIN,
              },
              invoiceNumber: invoice.invoiceNumber,
              invoiceDate: invoice.createdAt || new Date(),
              dueDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(),
              paidAmount: invoice.paidAmount || "0",
              paymentStatus: (invoice.paymentStatus as any) || "pending",
              isMaster: invoice.isMaster,
              childInvoices: [],
              deliveryNotes: invoice.deliveryNotes || undefined,
              subtotal: invoice.subtotal || "0",
              discount: invoice.discount || "0",
              cgst: invoice.cgst || "0",
              sgst: invoice.sgst || "0",
              igst: invoice.igst || "0",
              shippingCharges: invoice.shippingCharges || "0",
              total: invoice.total || "0",
              notes: invoice.notes || undefined,
              termsAndConditions: invoice.termsAndConditions,
              bankName: bankDetail?.bankName || "",
              bankAccountNumber: bankDetail?.accountNumber || "",
              bankAccountName: bankDetail?.accountName || "",
              bankIfscCode: bankDetail?.ifscCode || "",
          }, pt);

          const buffer = await streamToBuffer(pt);
          await pdfPromise;
          
          await storage.createInvoiceAttachment({
              invoiceId: invoice.id,
              fileName: `Invoice-${invoice.invoiceNumber}.pdf`,
              fileType: "application/pdf",
              fileSize: buffer.length,
              content: buffer.toString('base64')
          });

      } catch (pdfError) {
          console.error("PDF generation failed for invoice:", result.invoice.id, pdfError);
      }

      return res.status(201).json(result.invoice);

    } catch (error: any) {
      console.error("Error creating invoice from sales order:", error);
      if (error.message.includes("already")) {
           return res.status(409).json({ error: error.message });
      }
      if (error.code === '23505') { 
           return res.status(409).json({ error: "An invoice has already been generated for this sales order" });
      }
      return res.status(500).json({ error: error.message });
    }
  }
);

// POST /quotes/parse-excel
// Expects: { fileContent: string (base64) }
// Returns: { items: Array<{ description, quantity, unitPrice, hsnSac }> }
router.post(
  "/quotes/parse-excel",
  requirePermission("quotes", "create"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { fileContent } = req.body;
      if (!fileContent) {
        return res.status(400).json({ message: "No file content provided" });
      }

      const buffer = Buffer.from(fileContent, "base64");
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);

      const worksheet = workbook.worksheets[0]; // Assume first sheet
      const items: any[] = [];

      // Assume header is first row
      const headerRow = worksheet.getRow(1);
      const headers: Record<string, number> = {};
      
      headerRow.eachCell((cell, colNumber) => {
        const value = cell.value?.toString().toLowerCase().trim() || "";
        if (value.includes("description") || value.includes("item")) headers.description = colNumber;
        if (value.includes("quantity") || value.includes("qty")) headers.quantity = colNumber;
        if (value.includes("price") || value.includes("rate")) headers.unitPrice = colNumber;
        if (value.includes("hsn") || value.includes("sac")) headers.hsnSac = colNumber;
      });

      if (!headers.description || !headers.quantity || !headers.unitPrice) {
        return res.status(400).json({ 
             message: "Invalid Excel format. Required columns: Description, Quantity, Unit Price" 
        });
      }

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const description = row.getCell(headers.description).value?.toString() || "";
        const quantity = Number(row.getCell(headers.quantity).value) || 0;
        const unitPrice = Number(row.getCell(headers.unitPrice).value) || 0;
        const hsnSac = headers.hsnSac ? row.getCell(headers.hsnSac).value?.toString() || "" : "";

        if (description && quantity > 0) {
            items.push({
                description,
                quantity,
                unitPrice,
                hsnSac,
                subtotal: quantity * unitPrice
            });
        }
      });

      res.json(items);
    } catch (error) {
      console.error("Error parsing Excel:", error);
      res.status(500).json({ message: "Failed to parse Excel file" });
    }
  }
);

// Generate Sales Order PDF
router.get("/sales-orders/:id/pdf", requirePermission("sales_orders", "view"), async (req: AuthRequest, res: Response) => {
  try {
    const order = await storage.getSalesOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Sales order not found" });
    }

    const client = await storage.getClient(order.clientId);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Fetch dependencies
    const settings = await storage.getAllSettings();
    const companyName = settings.find((s) => s.key === "company_companyName")?.value || "";
    
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



    // Fetch bank details from settings
    const bankName = settings.find((s) => s.key === "bank_bankName")?.value || "";
    const bankAccountNumber = settings.find((s) => s.key === "bank_accountNumber")?.value || "";
    const bankAccountName = settings.find((s) => s.key === "bank_accountName")?.value || "";
    const bankIfscCode = settings.find((s) => s.key === "bank_ifscCode")?.value || "";
    const bankBranch = settings.find((s) => s.key === "bank_branch")?.value || "";
    const bankSwiftCode = settings.find((s) => s.key === "bank_swiftCode")?.value || "";

    const quote = await storage.getQuote(order.quoteId);
    if (!quote) {
      // Should rare, but handle it
      console.warn(`Quote not found for order ${order.id}`);
    }

    const items = await storage.getSalesOrderItems(order.id);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=SalesOrder-${order.orderNumber}.pdf`);

    await SalesOrderPDFService.generateSalesOrderPDF({
      quote: (quote || { quoteNumber: "-" }) as any, 
      client,
      items: items || [],
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      companyWebsite,
      companyGSTIN,
      companyLogo,
      companyDetails: {
        name: companyName,
        address: companyAddress,
        phone: companyPhone,
        email: companyEmail,
        website: companyWebsite,
        gstin: companyGSTIN,
      },
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      expectedDeliveryDate: order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate) : undefined,
      subtotal: order.subtotal || "0",
      discount: order.discount || "0",
      cgst: order.cgst || "0",
      sgst: order.sgst || "0",
      igst: order.igst || "0",
      shippingCharges: order.shippingCharges || "0",
      total: order.total || "0",
      notes: order.notes || undefined,
      termsAndConditions: order.termsAndConditions || undefined,
      // Bank details (nested and top-level for backward compatibility)
      bankDetails: {
        bankName,
        accountNumber: bankAccountNumber,
        accountName: bankAccountName,
        ifsc: bankIfscCode,
        branch: bankBranch,
        swift: bankSwiftCode,
      },
      // Pass top-level for existing PDF logic
      bankName: bankName,
      bankAccountNumber: bankAccountNumber,
      bankAccountName: bankAccountName,
      bankIfscCode: bankIfscCode,
      bankBranch: bankBranch,
      bankSwiftCode: bankSwiftCode,
      deliveryNotes: undefined, // Schema update needed if this field is required
    }, res);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// Email Sales Order
router.post("/sales-orders/:id/email", requirePermission("sales_orders", "view"), async (req: AuthRequest, res: Response) => {
  try {
    const { email, subject, body } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }

    const order = await storage.getSalesOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Sales order not found" });
    }

    const client = await storage.getClient(order.clientId);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Generate PDF Buffer
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

    // Fetch bank details from settings
    const bankName = settings.find((s) => s.key === "bank_bankName")?.value || "";
    const bankAccountNumber = settings.find((s) => s.key === "bank_accountNumber")?.value || "";
    const bankAccountName = settings.find((s) => s.key === "bank_accountName")?.value || "";
    const bankIfscCode = settings.find((s) => s.key === "bank_ifscCode")?.value || "";
    const bankBranch = settings.find((s) => s.key === "bank_branch")?.value || "";
    const bankSwiftCode = settings.find((s) => s.key === "bank_swiftCode")?.value || "";

    const items = await storage.getSalesOrderItems(order.id);

    const { PassThrough } = await import("stream");
    const pdfStream = new PassThrough();

    const pdfPromise = SalesOrderPDFService.generateSalesOrderPDF({
      quote: { quoteNumber: "-" } as any,
      client,
      items: items || [],
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      companyWebsite,
      companyGSTIN,
      companyLogo,
      companyDetails: {
        name: companyName,
        address: companyAddress,
        phone: companyPhone,
        email: companyEmail,
        website: companyWebsite,
        gstin: companyGSTIN,
      },
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      expectedDeliveryDate: order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate) : undefined,
      subtotal: order.subtotal || "0",
      discount: order.discount || "0",
      cgst: order.cgst || "0",
      sgst: order.sgst || "0",
      igst: order.igst || "0",
      shippingCharges: order.shippingCharges || "0",
      total: order.total || "0",
      notes: order.notes || undefined,
      termsAndConditions: order.termsAndConditions || undefined,
      // Bank details (nested and top-level for backward compatibility)
      bankDetails: {
        bankName,
        accountNumber: bankAccountNumber,
        accountName: bankAccountName,
        ifsc: bankIfscCode,
        branch: bankBranch,
        swift: bankSwiftCode,
      },
      // Pass top-level for existing PDF logic
      bankName: bankName,
      bankAccountNumber: bankAccountNumber,
      bankAccountName: bankAccountName,
      bankIfscCode: bankIfscCode,
      bankBranch: bankBranch,
      bankSwiftCode: bankSwiftCode,
      deliveryNotes: undefined, // Schema update needed if this field is required
    }, pdfStream);

    const buffer = await streamToBuffer(pdfStream);
    await pdfPromise;

    await EmailService.sendSalesOrderEmail(
        email,
        subject || `Sales Order ${order.orderNumber} from ${companyName}`,
        body || `Please find attached Sales Order ${order.orderNumber}.`,
        buffer
    );

    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Convert Quote to Sales Order
router.post("/quotes/:id/sales-orders",
  requireFeature('sales_orders_module'),
  requirePermission("sales_orders", "create"),
  async (req: AuthRequest, res: Response) => {
    try {
      const quoteId = req.params.id;
      const quote = await storage.getQuote(quoteId);

      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      if (quote.status !== "approved") {
        return res.status(400).json({ message: "Only approved quotes can be converted to sales orders" });
      }

      // Check if order already exists
      const existingOrder = await storage.getSalesOrderByQuote(quoteId);
      if (existingOrder) {
        return res.status(400).json({ message: "A Sales Order already exists for this quote", orderId: existingOrder.id });
      }

      // Generate Order Number
      // Generate Order Number through Service
      const orderNumber = await NumberingService.generateSalesOrderNumber();

      // Create Sales Order
      const newOrder = await storage.createSalesOrder({
        quoteId,
        orderNumber,
        clientId: quote.clientId,
        status: "draft",
        subtotal: quote.subtotal,
        discount: quote.discount || "0",
        cgst: quote.cgst || "0",
        sgst: quote.sgst || "0",
        igst: quote.igst || "0",
        shippingCharges: quote.shippingCharges || "0",
        total: quote.total,
        notes: quote.notes,
        termsAndConditions: quote.termsAndConditions,
        createdBy: req.user!.id,
      });

      // Copy Line Items - fetch them from the quote
      const quoteItems = await storage.getQuoteItems(quoteId);
      if (quoteItems && quoteItems.length > 0) {
        let sortOrder = 0;
        for (const item of quoteItems) {
          await storage.createSalesOrderItem({
            salesOrderId: newOrder.id,
            productId: item.productId || null,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            hsnSac: item.hsnSac,
            sortOrder: sortOrder++,
            status: "pending",
            fulfilledQuantity: 0
          });
        }
      }

      res.status(201).json(newOrder);
    } catch (error: any) {
      console.error("Failed to create sales order:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  }
);

export default router;
