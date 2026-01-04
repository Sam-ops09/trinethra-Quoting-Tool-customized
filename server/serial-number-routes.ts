/**
 * SERIAL NUMBER API ROUTES
 *
 * These routes handle serial number validation, tracking, and traceability
 */

import { Response } from "express";
import { AuthRequest } from "./routes";
import {
  validateSerialNumbers,
  getSerialTraceability,
  canEditSerialNumbers,
  logSerialNumberChange
} from "./serial-number-service";
import { storage } from "./storage";

/**
 * POST /api/invoices/:id/items/:itemId/serials/validate
 * Validate serial numbers before saving
 */
export async function validateSerialsRoute(req: AuthRequest, res: Response) {
  try {
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
    console.error("Error validating serial numbers:", error);
    return res.status(500).json({ error: error.message || "Failed to validate serial numbers" });
  }
}

/**
 * PATCH /api/invoices/:id/items/:itemId/serials
 * Update serial numbers for an invoice item
 */
export async function updateInvoiceItemSerialsRoute(req: AuthRequest, res: Response) {
  try {
    const { serialNumbers } = req.body;
    const { id: invoiceId, itemId } = req.params;

    if (!serialNumbers || !Array.isArray(serialNumbers)) {
      return res.status(400).json({ error: "Invalid serial numbers array" });
    }

    // Check if user can edit serials
    const editCheck = await canEditSerialNumbers(req.user!.id, invoiceId);
    if (!editCheck.canEdit) {
      return res.status(403).json({ error: editCheck.reason || "Cannot edit serial numbers" });
    }

    // Get the invoice item to check quantity
    const item = await storage.getInvoiceItem(itemId);
    if (!item) {
      return res.status(404).json({ error: "Invoice item not found" });
    }

    // Validate serial numbers
    const validation = await validateSerialNumbers(
      invoiceId,
      itemId,
      serialNumbers,
      item.quantity,
      {
        checkInvoiceScope: true,
        checkQuoteScope: true,
        checkSystemWide: true,
      }
    );

    if (!validation.valid) {
      return res.status(400).json({
        error: "Serial number validation failed",
        validationErrors: validation.errors
      });
    }

    // Update the invoice item
    const updated = await storage.updateInvoiceItem(itemId, {
      serialNumbers: JSON.stringify(serialNumbers),
      fulfilledQuantity: serialNumbers.length,
      status: serialNumbers.length > 0
        ? (serialNumbers.length === item.quantity ? "fulfilled" : "partial")
        : "pending",
    });

    // Create serial number records in the serialNumbers table for traceability
    const invoice = await storage.getInvoice(invoiceId);
    if (invoice) {
      for (const serial of serialNumbers) {
        // Check if serial already exists
        const existingSerial = await storage.getSerialNumberByValue(serial);

        if (!existingSerial) {
          // Create new serial number record
          await storage.createSerialNumber({
            serialNumber: serial,
            invoiceId: invoiceId,
            invoiceItemId: itemId,
            productId: null, // Can be linked later if products are enabled
            status: 'delivered',
            createdBy: req.user!.id,
          });
        }
      }
    }

    // Log the change
    await storage.createActivityLog({
      userId: req.user!.id,
      action: "update_serial_numbers",
      entityType: "invoice_item",
      entityId: itemId,
    });

    return res.json(updated);
  } catch (error: any) {
    console.error("Error updating serial numbers:", error);
    return res.status(500).json({ error: error.message || "Failed to update serial numbers" });
  }
}

/**
 * GET /api/serial-numbers/search?q=SERIAL123
 * Search for a serial number and get traceability info
 */
export async function searchSerialNumberRoute(req: AuthRequest, res: Response) {
  try {
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
    console.error("Error searching serial number:", error);
    return res.status(500).json({ error: error.message || "Failed to search serial number" });
  }
}

/**
 * GET /api/invoices/:id/items/:itemId/serials/permissions
 * Check if user can edit serial numbers for an invoice item
 */
export async function checkSerialEditPermissionsRoute(req: AuthRequest, res: Response) {
  try {
    const { id: invoiceId } = req.params;

    const permissions = await canEditSerialNumbers(req.user!.id, invoiceId);

    return res.json(permissions);
  } catch (error: any) {
    console.error("Error checking serial edit permissions:", error);
    return res.status(500).json({ error: error.message || "Failed to check permissions" });
  }
}

/**
 * GET /api/serial-numbers/batch-validate
 * Validate multiple serial numbers at once (for bulk operations)
 */
export async function batchValidateSerialsRoute(req: AuthRequest, res: Response) {
  try {
    const { serials } = req.body;

    if (!serials || !Array.isArray(serials)) {
      return res.status(400).json({ error: "Invalid serials array" });
    }

    // Check each serial for system-wide duplicates
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
    console.error("Error batch validating serials:", error);
    return res.status(500).json({ error: error.message || "Failed to validate serials" });
  }
}

