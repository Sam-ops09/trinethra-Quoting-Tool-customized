
import { Router, Response } from "express";
import { storage } from "../storage";
import { authMiddleware, AuthRequest } from "../middleware";
import { requirePermission } from "../permissions-middleware";
import { requireFeature } from "../feature-flags-middleware";
import { logger } from "../utils/logger";
import { db } from "../db";
import * as schema from "../../shared/schema";
import { eq, sql } from "drizzle-orm";
import { getSerialTraceability } from "../serial-number-service"; 
// Note: Depending on tsconfig, import might need to be without .js if ts-node
// but current codebase uses imports. 
// I'll check other files. They mostly import from "../services/..." without extension.
// Trying without extension first.

const router = Router();

// Serial Number Search/Traceability Route
router.get("/search", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { getSerialTraceability } = await import("../serial-number-service");
        const serialNumber = req.query.q as string;

        if (!serialNumber || serialNumber.trim().length === 0) {
        return res.status(400).json({ error: "Serial number query is required" });
        }

        const traceability = await getSerialTraceability(serialNumber.trim());

        if (!traceability) {
        return res.status(404).json({ error: "Serial number not found" });
        }

        return res.json(traceability);
    } catch (error: any) {
        logger.error("Error searching serial number:", error);
        return res.status(500).json({ error: error.message || "Failed to search serial number" });
    }
});

// Batch validate serial numbers
router.post("/batch-validate", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { getSerialTraceability } = await import("../serial-number-service");
        const { serials } = req.body;

        if (!serials || !Array.isArray(serials)) {
        return res.status(400).json({ error: "Invalid serials array" });
        }

        // Check each serial for system-wide existence
        const results = await Promise.all(
        serials.map(async (serial) => {
            const traceability = await getSerialTraceability(serial);
            return {
            serial,
            exists: !!traceability,
            info: traceability,
            };
        })
        );

        return res.json({ results });
    } catch (error: any) {
        logger.error("Error batch validating serials:", error);
        return res.status(500).json({ error: error.message || "Failed to validate serials" });
    }
});

// Bulk Import Serial Numbers
router.post("/bulk", authMiddleware, requireFeature('serialNumber_tracking'), async (req: AuthRequest, res: Response) => {
    try {
      const {
        serialNumbers,
        invoiceItemId,
        productId,
        vendorPoItemId,
        grnId,
      } = req.body;

      if (!Array.isArray(serialNumbers) || serialNumbers.length === 0) {
        return res.status(400).json({ error: "Serial numbers array is required" });
      }

      // Check for duplicates in the system
      const existing = await db
        .select()
        .from(schema.serialNumbers)
        .where(sql`${schema.serialNumbers.serialNumber} = ANY(${serialNumbers})`);

      if (existing.length > 0) {
        return res.status(400).json({
          error: "Duplicate serial numbers found",
          duplicates: existing.map(s => s.serialNumber),
        });
      }

      // Create serial number records
      const records = serialNumbers.map((sn: string) => ({
        serialNumber: sn,
        productId: productId || null,
        vendorPoItemId: vendorPoItemId || null,
        grnId: grnId || null,
        invoiceItemId: invoiceItemId || null,
        status: invoiceItemId ? "reserved" : "in_stock",
        createdBy: req.user!.id,
      }));

      const created = await db
        .insert(schema.serialNumbers)
        .values(records)
        .returning();

      // Log activity
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "bulk_import_serials",
        entityType: "serial_numbers",
        entityId: created[0].id,
      });

      return res.json({ count: created.length, serialNumbers: created });
    } catch (error: any) {
      logger.error("Error importing serial numbers:", error);
      return res.status(500).json({ error: error.message || "Failed to import serial numbers" });
    }
});

// Get Single Serial Number Traceability
router.get("/:serialNumber", authMiddleware, requireFeature('serialNumber_tracking'), async (req: AuthRequest, res: Response) => {
    try {
      const [serial] = await db
        .select()
        .from(schema.serialNumbers)
        .where(eq(schema.serialNumbers.serialNumber, req.params.serialNumber));

      if (!serial) {
        return res.status(404).json({ error: "Serial number not found" });
      }

      // Fetch related data
      let product = null;
      if (serial.productId) {
        [product] = await db
          .select({ id: schema.products.id, name: schema.products.name, sku: schema.products.sku })
          .from(schema.products)
          .where(eq(schema.products.id, serial.productId));
      }

      let vendor = null;
      if (serial.vendorId) {
        [vendor] = await db
          .select({ id: schema.vendors.id, name: schema.vendors.name })
          .from(schema.vendors)
          .where(eq(schema.vendors.id, serial.vendorId));
      }

      let vendorPo = null;
      if (serial.vendorPoId) {
        [vendorPo] = await db
          .select({
            id: schema.vendorPurchaseOrders.id,
            poNumber: schema.vendorPurchaseOrders.poNumber,
            orderDate: schema.vendorPurchaseOrders.orderDate,
          })
          .from(schema.vendorPurchaseOrders)
          .where(eq(schema.vendorPurchaseOrders.id, serial.vendorPoId));
      }

      let grn = null;
      if (serial.grnId) {
        [grn] = await db
          .select({
            id: schema.goodsReceivedNotes.id,
            grnNumber: schema.goodsReceivedNotes.grnNumber,
            receivedDate: schema.goodsReceivedNotes.receivedDate,
            inspectionStatus: schema.goodsReceivedNotes.inspectionStatus,
          })
          .from(schema.goodsReceivedNotes)
          .where(eq(schema.goodsReceivedNotes.id, serial.grnId));
      }

      let invoice = null;
      if (serial.invoiceId) {
        [invoice] = await db
          .select({
            id: schema.invoices.id,
            invoiceNumber: schema.invoices.invoiceNumber,
            createdAt: schema.invoices.createdAt,
          })
          .from(schema.invoices)
          .where(eq(schema.invoices.id, serial.invoiceId));
      }

      return res.json({
        ...serial,
        product,
        vendor,
        vendorPo,
        grn,
        invoice,
      });
    } catch (error) {
      logger.error("Error fetching serial number:", error);
      return res.status(500).json({ error: "Failed to fetch serial number" });
    }
});

export default router;
