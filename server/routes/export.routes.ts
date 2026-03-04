import { Router, Response } from "express";
import type { AuthRequest } from "../middleware";
import { storage } from "../storage";
import { db } from "../db";
import * as schema from "@shared/schema";
import { eq, gte, lte, and, desc } from "drizzle-orm";
import { logger } from "../utils/logger";
import ExcelJS from "exceljs";

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

/** Column definition for XLSX generation */
interface XlsxColumnDef {
  header: string;
  key: string;
  width?: number;
  isCurrency?: boolean;
  isDate?: boolean;
}

/**
 * Build an XLSX workbook from column definitions and row data, then stream it to the response.
 */
async function sendXlsx(
  res: Response,
  sheetName: string,
  columns: XlsxColumnDef[],
  rows: Record<string, any>[],
  filename: string
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "T-Quoting Tool";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width || 18,
    style: col.isCurrency ? { numFmt: '#,##0.00' } : col.isDate ? { numFmt: 'yyyy-mm-dd' } : undefined,
  }));

  // Bold header row
  sheet.getRow(1).font = { bold: true, size: 11 };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE8EDF5" },
  };

  for (const row of rows) {
    sheet.addRow(row);
  }

  // Auto-fit column widths based on content (cap at 40)
  sheet.columns.forEach((col) => {
    if (!col || !col.eachCell) return;
    let maxLen = (col.header as string)?.length || 10;
    col.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const len = cell.value ? String(cell.value).length : 0;
      if (len > maxLen) maxLen = len;
    });
    col.width = Math.min(maxLen + 4, 40);
  });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
}

// ==================== QUOTES EXPORT ====================

router.get("/quotes", async (req: AuthRequest, res: Response) => {
  try {
    const { status, dateFrom, dateTo, format } = req.query;

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

    // ---- XLSX FORMAT ----
    if (format === "xlsx") {
      const columns: XlsxColumnDef[] = [
        { header: "Quote Number", key: "quoteNumber", width: 18 },
        { header: "Version", key: "version", width: 10 },
        { header: "Client Name", key: "clientName", width: 25 },
        { header: "Status", key: "status", width: 14 },
        { header: "Quote Date", key: "quoteDate", isDate: true },
        { header: "Valid Until", key: "validUntil", isDate: true },
        { header: "Currency", key: "currency", width: 10 },
        { header: "Subtotal", key: "subtotal", isCurrency: true },
        { header: "Discount", key: "discount", isCurrency: true },
        { header: "CGST", key: "cgst", isCurrency: true },
        { header: "SGST", key: "sgst", isCurrency: true },
        { header: "IGST", key: "igst", isCurrency: true },
        { header: "Shipping", key: "shipping", isCurrency: true },
        { header: "Total", key: "total", isCurrency: true },
        { header: "Created By", key: "createdBy", width: 20 },
        { header: "Created At", key: "createdAt", isDate: true },
      ];

      const rows = results.map(q => ({
        quoteNumber: q.quoteNumber,
        version: q.version,
        clientName: q.clientName,
        status: q.status,
        quoteDate: formatDate(q.quoteDate),
        validUntil: formatDate(q.validUntil),
        currency: q.currency,
        subtotal: Number(q.subtotal),
        discount: Number(q.discount),
        cgst: Number(q.cgst),
        sgst: Number(q.sgst),
        igst: Number(q.igst),
        shipping: Number(q.shippingCharges),
        total: Number(q.total),
        createdBy: q.createdByName,
        createdAt: formatDate(q.createdAt),
      }));

      return await sendXlsx(res, "Quotes", columns, rows, `quotes_export_${todayStr()}.xlsx`);
    }

    // ---- CSV FORMAT (default) ----
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
    const { paymentStatus, status, dateFrom, dateTo, format } = req.query;

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

    // ---- XLSX FORMAT ----
    if (format === "xlsx") {
      const columns: XlsxColumnDef[] = [
        { header: "Invoice Number", key: "invoiceNumber", width: 18 },
        { header: "Client Name", key: "clientName", width: 25 },
        { header: "Status", key: "status", width: 14 },
        { header: "Payment Status", key: "paymentStatus", width: 16 },
        { header: "Issue Date", key: "issueDate", isDate: true },
        { header: "Due Date", key: "dueDate", isDate: true },
        { header: "Currency", key: "currency", width: 10 },
        { header: "Subtotal", key: "subtotal", isCurrency: true },
        { header: "Discount", key: "discount", isCurrency: true },
        { header: "CGST", key: "cgst", isCurrency: true },
        { header: "SGST", key: "sgst", isCurrency: true },
        { header: "IGST", key: "igst", isCurrency: true },
        { header: "Shipping", key: "shipping", isCurrency: true },
        { header: "Total", key: "total", isCurrency: true },
        { header: "Paid Amount", key: "paidAmount", isCurrency: true },
        { header: "Remaining Amount", key: "remainingAmount", isCurrency: true },
        { header: "Last Payment Date", key: "lastPaymentDate", isDate: true },
        { header: "Created At", key: "createdAt", isDate: true },
      ];

      const rows = results.map(inv => ({
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.clientName,
        status: inv.status,
        paymentStatus: inv.paymentStatus || "",
        issueDate: formatDate(inv.issueDate),
        dueDate: formatDate(inv.dueDate),
        currency: inv.currency,
        subtotal: Number(inv.subtotal || 0),
        discount: Number(inv.discount || 0),
        cgst: Number(inv.cgst || 0),
        sgst: Number(inv.sgst || 0),
        igst: Number(inv.igst || 0),
        shipping: Number(inv.shippingCharges || 0),
        total: Number(inv.total || 0),
        paidAmount: Number(inv.paidAmount || 0),
        remainingAmount: Number(inv.remainingAmount || 0),
        lastPaymentDate: formatDate(inv.lastPaymentDate),
        createdAt: formatDate(inv.createdAt),
      }));

      return await sendXlsx(res, "Invoices", columns, rows, `invoices_export_${todayStr()}.xlsx`);
    }

    // ---- CSV FORMAT (default) ----
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
    const { dateFrom, dateTo, format } = req.query;

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

    // ---- XLSX FORMAT ----
    if (format === "xlsx") {
      const columns: XlsxColumnDef[] = [
        { header: "Invoice Number", key: "invoiceNumber", width: 18 },
        { header: "Amount", key: "amount", isCurrency: true },
        { header: "Payment Method", key: "paymentMethod", width: 18 },
        { header: "Transaction ID", key: "transactionId", width: 22 },
        { header: "Payment Date", key: "paymentDate", isDate: true },
        { header: "Notes", key: "notes", width: 30 },
        { header: "Recorded By", key: "recordedBy", width: 20 },
        { header: "Created At", key: "createdAt", isDate: true },
      ];

      const rows = results.map(p => ({
        invoiceNumber: p.invoiceNumber,
        amount: Number(p.amount),
        paymentMethod: p.paymentMethod,
        transactionId: p.transactionId || "",
        paymentDate: formatDate(p.paymentDate),
        notes: p.notes || "",
        recordedBy: p.recordedByName,
        createdAt: formatDate(p.createdAt),
      }));

      return await sendXlsx(res, "Payments", columns, rows, `payments_export_${todayStr()}.xlsx`);
    }

    // ---- CSV FORMAT (default) ----
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
