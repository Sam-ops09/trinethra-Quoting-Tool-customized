import { Router, Response } from "express";
import type { AuthRequest } from "../middleware";
import { storage } from "../storage";
import { db } from "../db";
import * as schema from "@shared/schema";
import { eq, gte, lte, and, desc } from "drizzle-orm";
import { logger } from "../utils/logger";

const router = Router();

// ==================== HELPERS ====================

/**
 * Escape a CSV field value.
 * Wraps in quotes if the value contains commas, quotes, or newlines.
 */
function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Build a CSV string from headers and rows.
 */
function buildCsv(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(csvEscape).join(",");
  const dataLines = rows.map(row => row.map(csvEscape).join(","));
  return [headerLine, ...dataLines].join("\n");
}

/**
 * Format a date for CSV output.
 */
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

/**
 * Get today's date string for filenames.
 */
function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

// ==================== QUOTES EXPORT ====================

router.get("/quotes", async (req: AuthRequest, res: Response) => {
  try {
    const { status, dateFrom, dateTo } = req.query;

    // Fetch quotes with client names
    const quotesWithClients = await db.select()
      .from(schema.quotes)
      .leftJoin(schema.clients, eq(schema.quotes.clientId, schema.clients.id))
      .leftJoin(schema.users, eq(schema.quotes.createdBy, schema.users.id))
      .orderBy(desc(schema.quotes.createdAt));

    let results = quotesWithClients.map(row => ({
      ...row.quotes,
      clientName: row.clients?.name || "Unknown",
      createdByName: row.users?.name || "Unknown",
    }));

    // Apply filters
    if (status && status !== "all") {
      results = results.filter(q => q.status === status);
    }
    if (dateFrom) {
      const from = new Date(dateFrom as string);
      from.setHours(0, 0, 0, 0);
      results = results.filter(q => new Date(q.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo as string);
      to.setHours(23, 59, 59, 999);
      results = results.filter(q => new Date(q.createdAt) <= to);
    }

    const headers = [
      "Quote Number", "Version", "Client Name", "Status",
      "Quote Date", "Valid Until", "Currency",
      "Subtotal", "Discount", "CGST", "SGST", "IGST", "Shipping", "Total",
      "Created By", "Created At",
    ];

    const rows = results.map(q => [
      q.quoteNumber,
      String(q.version),
      q.clientName,
      q.status,
      formatDate(q.quoteDate),
      formatDate(q.validUntil),
      q.currency,
      String(q.subtotal),
      String(q.discount),
      String(q.cgst),
      String(q.sgst),
      String(q.igst),
      String(q.shippingCharges),
      String(q.total),
      q.createdByName,
      formatDate(q.createdAt),
    ]);

    const csv = buildCsv(headers, rows);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="quotes_export_${todayStr()}.csv"`);
    return res.send(csv);
  } catch (error) {
    logger.error("Quotes export error:", error);
    return res.status(500).json({ error: "Failed to export quotes" });
  }
});

// ==================== INVOICES EXPORT ====================

router.get("/invoices", async (req: AuthRequest, res: Response) => {
  try {
    const { paymentStatus, status, dateFrom, dateTo } = req.query;

    const invoicesWithClients = await db.select()
      .from(schema.invoices)
      .leftJoin(schema.clients, eq(schema.invoices.clientId, schema.clients.id))
      .orderBy(desc(schema.invoices.createdAt));

    let results = invoicesWithClients.map(row => ({
      ...row.invoices,
      clientName: row.clients?.name || "Unknown",
    }));

    // Apply filters
    if (paymentStatus && paymentStatus !== "all") {
      results = results.filter(inv => inv.paymentStatus === paymentStatus);
    }
    if (status && status !== "all") {
      results = results.filter(inv => inv.status === status);
    }
    if (dateFrom) {
      const from = new Date(dateFrom as string);
      from.setHours(0, 0, 0, 0);
      results = results.filter(inv => new Date(inv.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo as string);
      to.setHours(23, 59, 59, 999);
      results = results.filter(inv => new Date(inv.createdAt) <= to);
    }

    const headers = [
      "Invoice Number", "Client Name", "Status", "Payment Status",
      "Issue Date", "Due Date", "Currency",
      "Subtotal", "Discount", "CGST", "SGST", "IGST", "Shipping", "Total",
      "Paid Amount", "Remaining Amount", "Last Payment Date", "Created At",
    ];

    const rows = results.map(inv => [
      inv.invoiceNumber,
      inv.clientName,
      inv.status,
      inv.paymentStatus || "",
      formatDate(inv.issueDate),
      formatDate(inv.dueDate),
      inv.currency,
      String(inv.subtotal || 0),
      String(inv.discount || 0),
      String(inv.cgst || 0),
      String(inv.sgst || 0),
      String(inv.igst || 0),
      String(inv.shippingCharges || 0),
      String(inv.total || 0),
      String(inv.paidAmount || 0),
      String(inv.remainingAmount || 0),
      formatDate(inv.lastPaymentDate),
      formatDate(inv.createdAt),
    ]);

    const csv = buildCsv(headers, rows);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="invoices_export_${todayStr()}.csv"`);
    return res.send(csv);
  } catch (error) {
    logger.error("Invoices export error:", error);
    return res.status(500).json({ error: "Failed to export invoices" });
  }
});

// ==================== PAYMENTS EXPORT ====================

router.get("/payments", async (req: AuthRequest, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const paymentsWithDetails = await db.select()
      .from(schema.paymentHistory)
      .leftJoin(schema.invoices, eq(schema.paymentHistory.invoiceId, schema.invoices.id))
      .leftJoin(schema.users, eq(schema.paymentHistory.recordedBy, schema.users.id))
      .orderBy(desc(schema.paymentHistory.paymentDate));

    let results = paymentsWithDetails.map(row => ({
      ...row.payment_history,
      invoiceNumber: row.invoices?.invoiceNumber || "Unknown",
      recordedByName: row.users?.name || "Unknown",
    }));

    // Apply date filters
    if (dateFrom) {
      const from = new Date(dateFrom as string);
      from.setHours(0, 0, 0, 0);
      results = results.filter(p => new Date(p.paymentDate) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo as string);
      to.setHours(23, 59, 59, 999);
      results = results.filter(p => new Date(p.paymentDate) <= to);
    }

    const headers = [
      "Invoice Number", "Amount", "Payment Method", "Transaction ID",
      "Payment Date", "Notes", "Recorded By", "Created At",
    ];

    const rows = results.map(p => [
      p.invoiceNumber,
      String(p.amount),
      p.paymentMethod,
      p.transactionId || "",
      formatDate(p.paymentDate),
      p.notes || "",
      p.recordedByName,
      formatDate(p.createdAt),
    ]);

    const csv = buildCsv(headers, rows);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="payments_export_${todayStr()}.csv"`);
    return res.send(csv);
  } catch (error) {
    logger.error("Payments export error:", error);
    return res.status(500).json({ error: "Failed to export payments" });
  }
});

export default router;
