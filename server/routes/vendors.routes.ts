
import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware";
import { requirePermission } from "../permissions-middleware";
import { requireFeature } from "../feature-flags-middleware";
import { logger } from "../utils/logger";
import { storage } from "../storage";
import { db } from "../db";
import * as schema from "../../shared/schema";
import { eq, sql, desc } from "drizzle-orm";
import { NumberingService } from "../services/numbering.service";
import { isFeatureEnabled } from "@shared/feature-flags";

const router = Router();

// ==================== VENDORS ROUTES ====================
router.get("/vendors", authMiddleware, requireFeature('vendors_module'), async (req: AuthRequest, res: Response) => {
  try {
    const vendors = await storage.getAllVendors();
    res.json(vendors);
  } catch (error) {
    logger.error("Error fetching vendors:", error);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

router.get("/vendors/:id", authMiddleware, requireFeature('vendors_module'), async (req: AuthRequest, res: Response) => {
  try {
    const vendor = await storage.getVendor(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.json(vendor);
  } catch (error) {
    logger.error("Error fetching vendor:", error);
    res.status(500).json({ error: "Failed to fetch vendor" });
  }
});

router.post("/vendors", authMiddleware, requireFeature('vendors_create'), requirePermission("vendors", "create"), async (req: AuthRequest, res: Response) => {
  try {
    const vendor = await storage.createVendor({
      ...req.body,
      createdBy: req.user!.id,
    });
    res.json(vendor);
  } catch (error) {
    logger.error("Error creating vendor:", error);
    res.status(500).json({ error: "Failed to create vendor" });
  }
});

router.patch("/vendors/:id", authMiddleware, requireFeature('vendors_edit'), requirePermission("vendors", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    const updated = await storage.updateVendor(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.json(updated);
  } catch (error) {
    logger.error("Error updating vendor:", error);
    res.status(500).json({ error: "Failed to update vendor" });
  }
});

router.delete("/vendors/:id", authMiddleware, requireFeature('vendors_delete'), requirePermission("vendors", "delete"), async (req: AuthRequest, res: Response) => {
  try {
    await storage.deleteVendor(req.params.id);
    res.json({ success: true });
  } catch (error) {
    logger.error("Error deleting vendor:", error);
    res.status(500).json({ error: "Failed to delete vendor" });
  }
});

// ==================== VENDOR PURCHASE ORDERS ROUTES ====================
router.get("/vendor-pos", authMiddleware, requireFeature('vendorPO_module'), async (req: AuthRequest, res: Response) => {
  try {
    const quoteId = req.query.quoteId as string | undefined;
    
    let pos;
    if (quoteId) {
      pos = await storage.getVendorPosByQuote(quoteId);
    } else {
      pos = await storage.getAllVendorPos();
    }

    const enrichedPos = await Promise.all(
      pos.map(async (po) => {
        const vendor = await storage.getVendor(po.vendorId);
        const quote = po.quoteId ? await storage.getQuote(po.quoteId) : null;
        return {
          ...po,
          vendorName: vendor?.name || "Unknown",
          quoteNumber: quote?.quoteNumber || "N/A",
          quoteCurrency: quote?.currency,
        };
      })
    );

    res.json(enrichedPos);
  } catch (error) {
    logger.error("Error fetching vendor POs:", error);
    res.status(500).json({ error: "Failed to fetch vendor POs" });
  }
});

router.get("/vendor-pos/:id", authMiddleware, requireFeature('vendorPO_module'), async (req: AuthRequest, res: Response) => {
  try {
    const po = await storage.getVendorPo(req.params.id);
    if (!po) {
      return res.status(404).json({ error: "Vendor PO not found" });
    }

    const vendor = await storage.getVendor(po.vendorId);
    const quote = po.quoteId ? await storage.getQuote(po.quoteId) : null;
    const items = await storage.getVendorPoItems(po.id);

    res.json({
      ...po,
      vendor: vendor || {},
      quote: quote ? { id: quote.id, quoteNumber: quote.quoteNumber, currency: quote.currency } : undefined,
      items,
    });
  } catch (error) {
    logger.error("Error fetching vendor PO:", error);
    res.status(500).json({ error: "Failed to fetch vendor PO" });
  }
});

router.post("/quotes/:id/create-vendor-po", authMiddleware, requireFeature('vendorPO_create'), requirePermission("vendor_pos", "create"), async (req: AuthRequest, res: Response) => {
  try {
    const quote = await storage.getQuote(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    const quoteItems = await storage.getQuoteItems(quote.id);
    const poNumber = await NumberingService.generateVendorPoNumber();

    const po = await storage.createVendorPo({
      poNumber,
      quoteId: quote.id,
      vendorId: req.body.vendorId,
      status: "draft",
      orderDate: new Date(),
      expectedDeliveryDate: req.body.expectedDeliveryDate ? new Date(req.body.expectedDeliveryDate) : null,
      subtotal: quote.subtotal,
      discount: quote.discount,
      cgst: quote.cgst,
      sgst: quote.sgst,
      igst: quote.igst,
      shippingCharges: quote.shippingCharges,
      total: quote.total,
      notes: req.body.notes || null,
      termsAndConditions: quote.termsAndConditions,
      createdBy: req.user!.id,
    });

    for (const item of quoteItems) {
      await storage.createVendorPoItem({
        vendorPoId: po.id,
        productId: item.productId || null,
        description: item.description,
        quantity: item.quantity,
        receivedQuantity: 0,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        sortOrder: item.sortOrder,
      });
    }

    res.json(po);
  } catch (error) {
    logger.error("Error creating vendor PO:", error);
    res.status(500).json({ error: "Failed to create vendor PO" });
  }
});

router.post("/vendor-pos", authMiddleware, requireFeature('vendorPO_create'), requirePermission("vendor_pos", "create"), async (req: AuthRequest, res: Response) => {
  try {
    const { 
      vendorId, 
      expectedDeliveryDate, 
      items, 
      subtotal, 
      discount, 
      cgst, 
      sgst, 
      igst, 
      shippingCharges, 
      total, 
      notes, 
      termsAndConditions 
    } = req.body;

    if (!vendorId) {
      return res.status(400).json({ error: "Vendor ID is required" });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "At least one item is required" });
    }

    // Generate PO number
    const poNumber = await NumberingService.generateVendorPoNumber();

    // Create Vendor PO
    const po = await storage.createVendorPo({
      poNumber,
      quoteId: null, // Standalone PO
      vendorId,
      status: "draft",
      orderDate: new Date(),
      expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
      subtotal: subtotal.toString(),
      discount: discount.toString(),
      cgst: cgst.toString(),
      sgst: sgst.toString(),
      igst: igst.toString(),
      shippingCharges: shippingCharges.toString(),
      total: total.toString(),
      notes: notes || null,
      termsAndConditions: termsAndConditions || null,
      createdBy: req.user!.id,
    });

    // Create PO Items
    let sortOrder = 0;
    for (const item of items) {
      await storage.createVendorPoItem({
        vendorPoId: po.id,
        productId: item.productId || null,
        description: item.description,
        quantity: item.quantity,
        receivedQuantity: 0,
        unitPrice: item.unitPrice.toString(),
        subtotal: item.subtotal.toString(),
        sortOrder: sortOrder++,
      });
    }

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "create_vendor_po",
      entityType: "vendor_po",
      entityId: po.id,
    });

    res.json(po);
  } catch (error: any) {
    logger.error("Error creating vendor PO:", error);
    res.status(500).json({ error: error.message || "Failed to create vendor PO" });
  }
});

router.patch("/vendor-pos/:id", authMiddleware, requireFeature('vendorPO_edit'), async (req: AuthRequest, res: Response) => {
  try {
    const updated = await storage.updateVendorPo(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Vendor PO not found" });
    }
    res.json(updated);
  } catch (error) {
    logger.error("Error updating vendor PO:", error);
    res.status(500).json({ error: "Failed to update vendor PO" });
  }
});

router.patch("/vendor-pos/:id/items/:itemId/serials", authMiddleware, requireFeature('vendorPO_edit'), async (req: AuthRequest, res: Response) => {
  try {
    const { serialNumbers } = req.body;
    const updated = await storage.updateVendorPoItem(req.params.itemId, {
      serialNumbers: JSON.stringify(serialNumbers),
      receivedQuantity: serialNumbers.length,
    });

    if (!updated) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(updated);
  } catch (error) {
    logger.error("Error updating serial numbers:", error);
    res.status(500).json({ error: "Failed to update serial numbers" });
  }
});

// ==================== GRN ROUTES ====================
router.get("/grns", authMiddleware, requireFeature('grn_module'), async (req: AuthRequest, res: Response) => {
  try {
    const grns = await db
      .select({
        id: schema.goodsReceivedNotes.id,
        grnNumber: schema.goodsReceivedNotes.grnNumber,
        vendorPoId: schema.goodsReceivedNotes.vendorPoId,
        receivedDate: schema.goodsReceivedNotes.receivedDate,
        quantityOrdered: schema.goodsReceivedNotes.quantityOrdered,
        quantityReceived: schema.goodsReceivedNotes.quantityReceived,
        quantityRejected: schema.goodsReceivedNotes.quantityRejected,
        inspectionStatus: schema.goodsReceivedNotes.inspectionStatus,
        deliveryNoteNumber: schema.goodsReceivedNotes.deliveryNoteNumber,
        batchNumber: schema.goodsReceivedNotes.batchNumber,
        poNumber: schema.vendorPurchaseOrders.poNumber,
        vendorName: schema.vendors.name,
      })
      .from(schema.goodsReceivedNotes)
      .leftJoin(
        schema.vendorPurchaseOrders,
        eq(schema.goodsReceivedNotes.vendorPoId, schema.vendorPurchaseOrders.id)
      )
      .leftJoin(
        schema.vendors,
        eq(schema.vendorPurchaseOrders.vendorId, schema.vendors.id)
      )
      .orderBy(desc(schema.goodsReceivedNotes.receivedDate));

    res.json(grns);
  } catch (error) {
    logger.error("Error fetching GRNs:", error);
    res.status(500).json({ error: "Failed to fetch GRNs" });
  }
});

router.get("/grns/:id", authMiddleware, requireFeature('grn_module'), async (req: AuthRequest, res: Response) => {
  try {
    const [grn] = await db
      .select()
      .from(schema.goodsReceivedNotes)
      .where(eq(schema.goodsReceivedNotes.id, req.params.id));

    if (!grn) {
      return res.status(404).json({ error: "GRN not found" });
    }

    // Fetch related data
    const [po] = await db
      .select()
      .from(schema.vendorPurchaseOrders)
      .where(eq(schema.vendorPurchaseOrders.id, grn.vendorPoId));

    const [vendor] = await db
      .select()
      .from(schema.vendors)
      .where(eq(schema.vendors.id, po.vendorId));

    const [poItem] = await db
      .select()
      .from(schema.vendorPoItems)
      .where(eq(schema.vendorPoItems.id, grn.vendorPoItemId));

    let inspector = null;
    if (grn.inspectedBy) {
      [inspector] = await db
        .select({ id: schema.users.id, name: schema.users.name })
        .from(schema.users)
        .where(eq(schema.users.id, grn.inspectedBy));
    }

    res.json({
      ...grn,
      vendorPo: {
        id: po.id,
        poNumber: po.poNumber,
        currency: po.currency,
        vendor: {
          name: vendor.name,
          email: vendor.email,
          phone: vendor.phone,
        },
      },
      vendorPoItem: poItem,
      inspectedBy: inspector,
    });
  } catch (error) {
    logger.error("Error fetching GRN:", error);
    res.status(500).json({ error: "Failed to fetch GRN" });
  }
});

router.post("/grns", authMiddleware, requireFeature('grn_create'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      vendorPoId,
      vendorPoItemId,
      quantityOrdered,
      quantityReceived,
      quantityRejected,
      inspectionStatus,
      inspectionNotes,
      deliveryNoteNumber,
      batchNumber,
      serialNumbers,
    } = req.body;

    // Generate GRN number using NumberingService
    const grnNumber = await NumberingService.generateGrnNumber();

    // Create GRN
    const [grn] = await db
      .insert(schema.goodsReceivedNotes)
      .values({
        grnNumber,
        vendorPoId,
        vendorPoItemId,
        quantityOrdered,
        quantityReceived,
        quantityRejected: quantityRejected || 0,
        inspectionStatus: inspectionStatus || "pending",
        inspectionNotes,
        deliveryNoteNumber,
        batchNumber,
        createdBy: req.user!.id,
      })
      .returning();

    // Update vendor PO item received quantity
    const [poItem] = await db
      .select()
      .from(schema.vendorPoItems)
      .where(eq(schema.vendorPoItems.id, vendorPoItemId));

    await db
      .update(schema.vendorPoItems)
      .set({
        receivedQuantity: (poItem.receivedQuantity || 0) + quantityReceived,
        updatedAt: new Date(),
      })
      .where(eq(schema.vendorPoItems.id, vendorPoItemId));

    // Update product stock if productId is linked to the PO item (only if stock tracking is enabled)
    if (poItem.productId && isFeatureEnabled('products_stock_tracking')) {
      const quantityAccepted = quantityReceived - (quantityRejected || 0);
      if (quantityAccepted > 0) {
        await db
          .update(schema.products)
          .set({
            stockQuantity: sql`${schema.products.stockQuantity} + ${quantityAccepted}`,
            availableQuantity: sql`${schema.products.availableQuantity} + ${quantityAccepted}`,
            updatedAt: new Date(),
          })
          .where(eq(schema.products.id, poItem.productId));
        
        logger.info(`[GRN] Updated product ${poItem.productId} stock: +${quantityAccepted}`);
      }
    } else if (poItem.productId && !isFeatureEnabled('products_stock_tracking')) {
      logger.info(`[GRN] Stock update skipped for product ${poItem.productId}: Stock tracking is disabled`);
    }

    // Create serial numbers if provided
    if (serialNumbers && Array.isArray(serialNumbers) && serialNumbers.length > 0) {
      const serialRecords = serialNumbers.map((sn: string) => ({
        serialNumber: sn,
        productId: poItem.productId || null, // Link serial to product
        vendorPoId,
        vendorPoItemId,
        grnId: grn.id,
        status: "in_stock",
        createdBy: req.user!.id,
      }));

      await db.insert(schema.serialNumbers).values(serialRecords);
    }

    // Log activity
    await storage.createActivityLog({
      userId: req.user!.id,
      action: "create_grn",
      entityType: "grn",
      entityId: grn.id,
    });

    res.json(grn);
  } catch (error: any) {
    logger.error("Error creating GRN:", error);
    res.status(500).json({ error: error.message || "Failed to create GRN" });
  }
});

router.patch("/grns/:id", authMiddleware, requireFeature('grn_edit'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      quantityReceived,
      quantityRejected,
      inspectionStatus,
      inspectionNotes,
      deliveryNoteNumber,
      batchNumber,
    } = req.body;

    const [grn] = await db
      .update(schema.goodsReceivedNotes)
      .set({
        quantityReceived,
        quantityRejected: quantityRejected || 0,
        inspectionStatus,
        inspectedBy: req.user!.id,
        inspectionNotes,
        deliveryNoteNumber,
        batchNumber,
        updatedAt: new Date(),
      })
      .where(eq(schema.goodsReceivedNotes.id, req.params.id))
      .returning();

    if (!grn) {
      return res.status(404).json({ error: "GRN not found" });
    }

    // Log activity
    await storage.createActivityLog({
      userId: req.user!.id,
      action: "update_grn",
      entityType: "grn",
      entityId: grn.id,
    });

    res.json(grn);
  } catch (error: any) {
    logger.error("Error updating GRN:", error);
    res.status(500).json({ error: error.message || "Failed to update GRN" });
  }
});

export default router;
