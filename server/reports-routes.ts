import type { Express } from "express";
import { db } from "./db";
import { quotes, clients, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

export function registerReportRoutes(app: Express) {
  // Generate Invoice Report (Excel or PDF)
  app.get("/api/reports/invoices", async (req, res) => {
    try {
      const format = req.query.format as string;

      if (!format || !["excel", "pdf"].includes(format)) {
        return res.status(400).send("Invalid format. Use 'excel' or 'pdf'");
      }

      // Fetch all invoices with related data
      const { invoices } = await import("@shared/schema");
      const allInvoices = await db
        .select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          clientName: clients.name,
          status: invoices.status,
          subtotal: invoices.subtotal,
          total: invoices.total,
          discount: invoices.discount,
          cgst: invoices.cgst,
          sgst: invoices.sgst,
          igst: invoices.igst,
          dueDate: invoices.dueDate,
          paidAmount: invoices.paidAmount,
          remainingAmount: invoices.remainingAmount,
          createdAt: invoices.createdAt,
          createdByName: users.name,
        })
        .from(invoices)
        .leftJoin(clients, eq(invoices.clientId, clients.id))
        .leftJoin(users, eq(invoices.createdBy, users.id))
        .orderBy(invoices.createdAt);

      if (format === "excel") {
        await generateInvoiceExcelReport(allInvoices, res);
      } else if (format === "pdf") {
        await generateInvoicePDFReport(allInvoices, res);
      }
    } catch (error) {
      console.error("Invoice report generation error:", error);
      res.status(500).send(`Error generating report: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });

  // Generate Quote Report (Excel or PDF)
  app.get("/api/reports/quotes", async (req, res) => {
    try {
      const format = req.query.format as string;

      if (!format || !["excel", "pdf"].includes(format)) {
        return res.status(400).send("Invalid format. Use 'excel' or 'pdf'");
      }

      // Fetch all quotes with related data
      const allQuotes = await db
        .select({
          id: quotes.id,
          quoteNumber: quotes.quoteNumber,
          clientName: clients.name,
          status: quotes.status,
          subtotal: quotes.subtotal,
          total: quotes.total,
          discount: quotes.discount,
          cgst: quotes.cgst,
          sgst: quotes.sgst,
          igst: quotes.igst,
          validUntil: quotes.validUntil,
          createdAt: quotes.createdAt,
          createdByName: users.name,
        })
        .from(quotes)
        .leftJoin(clients, eq(quotes.clientId, clients.id))
        .leftJoin(users, eq(quotes.createdBy, users.id))
        .orderBy(quotes.createdAt);

      if (format === "excel") {
        await generateExcelReport(allQuotes, res);
      } else if (format === "pdf") {
        await generatePDFReport(allQuotes, res);
      }
    } catch (error) {
      console.error("Report generation error:", error);
      res.status(500).send(`Error generating report: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });
}

// Generate Excel Report
async function generateExcelReport(quotes: any[], res: any) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Quotes Report");

  // Set column headers
  worksheet.columns = [
    { header: "Quote Number", key: "quoteNumber", width: 20 },
    { header: "Client", key: "clientName", width: 25 },
    { header: "Status", key: "status", width: 15 },
    { header: "Subtotal", key: "subtotal", width: 15 },
    { header: "Discount", key: "discount", width: 15 },
    { header: "CGST", key: "cgst", width: 12 },
    { header: "SGST", key: "sgst", width: 12 },
    { header: "IGST", key: "igst", width: 12 },
    { header: "Total", key: "total", width: 15 },
    { header: "Valid Until", key: "validUntil", width: 15 },
    { header: "Created By", key: "createdByName", width: 20 },
    { header: "Created Date", key: "createdAt", width: 20 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true, size: 12 };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F81BD" },
  };
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

  // Add data rows
  quotes.forEach((quote) => {
    worksheet.addRow({
      quoteNumber: quote.quoteNumber,
      clientName: quote.clientName || "N/A",
      status: quote.status,
      subtotal: parseFloat(quote.subtotal || "0"),
      discount: parseFloat(quote.discount || "0"),
      cgst: parseFloat(quote.cgst || "0"),
      sgst: parseFloat(quote.sgst || "0"),
      igst: parseFloat(quote.igst || "0"),
      total: parseFloat(quote.total || "0"),
      validUntil: quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : "N/A",
      createdByName: quote.createdByName || "Unknown",
      createdAt: new Date(quote.createdAt).toLocaleDateString(),
    });
  });

  // Add totals row
  worksheet.addRow({
    quoteNumber: "TOTAL",
    clientName: "",
    status: "",
    subtotal: quotes.reduce((sum, q) => sum + parseFloat(q.subtotal || "0"), 0),
    discount: quotes.reduce((sum, q) => sum + parseFloat(q.discount || "0"), 0),
    cgst: quotes.reduce((sum, q) => sum + parseFloat(q.cgst || "0"), 0),
    sgst: quotes.reduce((sum, q) => sum + parseFloat(q.sgst || "0"), 0),
    igst: quotes.reduce((sum, q) => sum + parseFloat(q.igst || "0"), 0),
    total: quotes.reduce((sum, q) => sum + parseFloat(q.total || "0"), 0),
    validUntil: "",
    createdByName: "",
    createdAt: "",
  });
  const totalRowNumber = worksheet.lastRow?.number;
  if (totalRowNumber) {
    const totalRow = worksheet.getRow(totalRowNumber);
    totalRow.font = { bold: true };
    totalRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9E2F3" },
    };
  }

  // Format currency columns
  ["subtotal", "discount", "cgst", "sgst", "igst", "total"].forEach((col) => {
    worksheet.getColumn(col).numFmt = "₹#,##0.00";
  });

  // Set response headers
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="Quote Report ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }).replace(/,/g, "")}.xlsx"`
  );

  // Write to response
  await workbook.xlsx.write(res);
  res.end();
}

// Generate PDF Report
async function generatePDFReport(quotes: any[], res: any) {
  const doc = new PDFDocument({
    margin: 40,
    size: "A4",
    bufferPages: true
  });

  // Set response headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="Quote Report ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }).replace(/,/g, "")}.pdf"`
  );

  // Pipe to response
  doc.pipe(res);

  // Add title with better styling
  doc.fontSize(24).font("Helvetica-Bold").fillColor("#1a56db").text("Quote Report", { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(10).font("Helvetica").fillColor("#666666").text(
    `Generated on ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
    { align: "center" }
  );
  doc.moveDown(1.5);

  // Add summary box
  const totalValue = quotes.reduce((sum, q) => sum + parseFloat(q.total || "0"), 0);
  const avgValue = quotes.length > 0 ? totalValue / quotes.length : 0;
  const statusCounts = quotes.reduce((acc: any, q) => {
    acc[q.status] = (acc[q.status] || 0) + 1;
    return acc;
  }, {});

  // Summary section with box
  const summaryBoxY = doc.y;
  doc.roundedRect(40, summaryBoxY, 515, 120, 5).fillAndStroke("#f0f9ff", "#3b82f6");

  doc.fillColor("#000000").fontSize(14).font("Helvetica-Bold").text("Executive Summary", 50, summaryBoxY + 10);
  doc.moveDown(0.5);

  doc.fontSize(10).font("Helvetica");
  const summaryY = doc.y;

  // Left column
  doc.fillColor("#374151").text("Total Quotes:", 60, summaryY);
  doc.fillColor("#000000").font("Helvetica-Bold").text(`${quotes.length}`, 180, summaryY);

  doc.fillColor("#374151").font("Helvetica").text("Total Value:", 60, summaryY + 20);
  doc.fillColor("#059669").font("Helvetica-Bold").text(
    `₹${totalValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
    180, summaryY + 20
  );

  doc.fillColor("#374151").font("Helvetica").text("Average Value:", 60, summaryY + 40);
  doc.fillColor("#000000").font("Helvetica-Bold").text(
    `₹${avgValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
    180, summaryY + 40
  );

  // Right column - Status breakdown
  doc.fillColor("#374151").font("Helvetica").text("Status Breakdown:", 320, summaryY);
  let statusY = summaryY + 20;
  Object.entries(statusCounts).forEach(([status, count]) => {
    doc.fillColor("#6b7280").fontSize(9).text(`${status}:`, 330, statusY);
    doc.fillColor("#000000").font("Helvetica-Bold").text(`${count}`, 450, statusY);
    statusY += 15;
  });

  doc.y = summaryBoxY + 130;
  doc.moveDown(1);

  // Table header
  doc.fontSize(14).font("Helvetica-Bold").fillColor("#000000").text("Quote Details", 40);
  doc.moveDown(0.8);

  // Draw table
  const tableTop = doc.y;
  const pageWidth = 515;
  const colWidths = [90, 140, 70, 90, 80, 45]; // Quote#, Client, Status, Total, Date, Taxes
  const headers = ["Quote Number", "Client", "Status", "Total Amount", "Date", "Tax"];

  // Table header background
  doc.rect(40, tableTop, pageWidth, 25).fillAndStroke("#e5e7eb", "#d1d5db");

  // Table header text
  doc.fillColor("#1f2937").fontSize(9).font("Helvetica-Bold");
  let xPos = 45;
  headers.forEach((header, i) => {
    doc.text(header, xPos, tableTop + 8, { width: colWidths[i] - 10, align: i >= 3 ? "right" : "left" });
    xPos += colWidths[i];
  });

  let y = tableTop + 30;
  doc.font("Helvetica").fontSize(8).fillColor("#000000");

  // Table rows
  quotes.slice(0, 35).forEach((quote, index) => {
    // Check if we need a new page
    if (y > 750) {
      doc.addPage();
      y = 50;

      // Redraw header on new page
      doc.rect(40, y, pageWidth, 25).fillAndStroke("#e5e7eb", "#d1d5db");
      doc.fillColor("#1f2937").fontSize(9).font("Helvetica-Bold");
      xPos = 45;
      headers.forEach((header, i) => {
        doc.text(header, xPos, y + 8, { width: colWidths[i] - 10, align: i >= 3 ? "right" : "left" });
        xPos += colWidths[i];
      });
      y += 30;
      doc.font("Helvetica").fontSize(8).fillColor("#000000");
    }

    // Alternating row colors
    if (index % 2 === 0) {
      doc.rect(40, y - 2, pageWidth, 20).fill("#f9fafb");
    }

    const totalAmount = parseFloat(quote.total || "0");
    const totalTax = parseFloat(quote.cgst || "0") + parseFloat(quote.sgst || "0") + parseFloat(quote.igst || "0");
    const dateStr = new Date(quote.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

    // Row data
    xPos = 45;
    doc.fillColor("#1e40af").text(quote.quoteNumber, xPos, y + 5, { width: colWidths[0] - 10, ellipsis: true });
    xPos += colWidths[0];

    doc.fillColor("#000000").text(quote.clientName || "N/A", xPos, y + 5, { width: colWidths[1] - 10, ellipsis: true });
    xPos += colWidths[1];

    // Status badge
    const statusColors: any = {
      draft: "#6b7280",
      sent: "#3b82f6",
      approved: "#059669",
      rejected: "#dc2626"
    };
    doc.fillColor(statusColors[quote.status] || "#6b7280").text(
      quote.status.toUpperCase(),
      xPos, y + 5,
      { width: colWidths[2] - 10 }
    );
    xPos += colWidths[2];

    doc.fillColor("#059669").font("Helvetica-Bold").text(
      `₹${totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      xPos, y + 5,
      { width: colWidths[3] - 10, align: "right" }
    );
    xPos += colWidths[3];

    doc.fillColor("#000000").font("Helvetica").text(dateStr, xPos, y + 5, { width: colWidths[4] - 10, align: "right" });
    xPos += colWidths[4];

    doc.fillColor("#6b7280").fontSize(7).text(
      `₹${totalTax.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      xPos, y + 6,
      { width: colWidths[5] - 10, align: "right" }
    );

    y += 20;
  });

  // Bottom border for table
  doc.rect(40, y, pageWidth, 1).fill("#d1d5db");

  // Footer note
  if (quotes.length > 35) {
    doc.moveDown(1);
    doc.fontSize(8).font("Helvetica-Oblique").fillColor("#6b7280").text(
      `Note: Showing first 35 of ${quotes.length} total quotes. Export to Excel for complete data.`,
      { align: "center" }
    );
  }

  // Add page numbers
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor("#9ca3af").text(
      `Page ${i + 1} of ${pages.count}`,
      40,
      doc.page.height - 30,
      { align: "center" }
    );
  }

  doc.end();
}

// Generate Invoice Excel Report
async function generateInvoiceExcelReport(invoices: any[], res: any) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Invoices Report");

  // Set column headers
  worksheet.columns = [
    { header: "Invoice Number", key: "invoiceNumber", width: 20 },
    { header: "Client", key: "clientName", width: 25 },
    { header: "Status", key: "status", width: 15 },
    { header: "Subtotal", key: "subtotal", width: 15 },
    { header: "Discount", key: "discount", width: 15 },
    { header: "CGST", key: "cgst", width: 12 },
    { header: "SGST", key: "sgst", width: 12 },
    { header: "IGST", key: "igst", width: 12 },
    { header: "Total", key: "total", width: 15 },
    { header: "Paid", key: "paidAmount", width: 15 },
    { header: "Remaining", key: "remainingAmount", width: 15 },
    { header: "Due Date", key: "dueDate", width: 15 },
    { header: "Created By", key: "createdByName", width: 20 },
    { header: "Created Date", key: "createdAt", width: 20 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true, size: 12 };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F81BD" },
  };
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

  // Add data rows
  invoices.forEach((invoice) => {
    worksheet.addRow({
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName || "N/A",
      status: invoice.status,
      subtotal: parseFloat(invoice.subtotal || "0"),
      discount: parseFloat(invoice.discount || "0"),
      cgst: parseFloat(invoice.cgst || "0"),
      sgst: parseFloat(invoice.sgst || "0"),
      igst: parseFloat(invoice.igst || "0"),
      total: parseFloat(invoice.total || "0"),
      paidAmount: parseFloat(invoice.paidAmount || "0"),
      remainingAmount: parseFloat(invoice.remainingAmount || "0"),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A",
      createdByName: invoice.createdByName || "Unknown",
      createdAt: new Date(invoice.createdAt).toLocaleDateString(),
    });
  });

  // Add totals row
  worksheet.addRow({
    invoiceNumber: "TOTAL",
    clientName: "",
    status: "",
    subtotal: invoices.reduce((sum, inv) => sum + parseFloat(inv.subtotal || "0"), 0),
    discount: invoices.reduce((sum, inv) => sum + parseFloat(inv.discount || "0"), 0),
    cgst: invoices.reduce((sum, inv) => sum + parseFloat(inv.cgst || "0"), 0),
    sgst: invoices.reduce((sum, inv) => sum + parseFloat(inv.sgst || "0"), 0),
    igst: invoices.reduce((sum, inv) => sum + parseFloat(inv.igst || "0"), 0),
    total: invoices.reduce((sum, inv) => sum + parseFloat(inv.total || "0"), 0),
    paidAmount: invoices.reduce((sum, inv) => sum + parseFloat(inv.paidAmount || "0"), 0),
    remainingAmount: invoices.reduce((sum, inv) => sum + parseFloat(inv.remainingAmount || "0"), 0),
    dueDate: "",
    createdByName: "",
    createdAt: "",
  });

  const totalRowNumber = worksheet.lastRow?.number;
  if (totalRowNumber) {
    const totalRow = worksheet.getRow(totalRowNumber);
    totalRow.font = { bold: true };
    totalRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9E2F3" },
    };
  }

  // Format currency columns
  ["subtotal", "discount", "cgst", "sgst", "igst", "total", "paidAmount", "remainingAmount"].forEach((col) => {
    worksheet.getColumn(col).numFmt = "₹#,##0.00";
  });

  // Set response headers
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="Invoice Report ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }).replace(/,/g, "")}.xlsx"`
  );

  // Write to response
  await workbook.xlsx.write(res);
  res.end();
}

// Generate Invoice PDF Report
async function generateInvoicePDFReport(invoices: any[], res: any) {
  const doc = new PDFDocument({
    margin: 40,
    size: "A4",
    bufferPages: true
  });

  // Set response headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="Invoice Report ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }).replace(/,/g, "")}.pdf"`
  );

  // Pipe to response
  doc.pipe(res);

  // Add title with better styling
  doc.fontSize(24).font("Helvetica-Bold").fillColor("#dc2626").text("Invoice & Collections Report", { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(10).font("Helvetica").fillColor("#666666").text(
    `Generated on ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
    { align: "center" }
  );
  doc.moveDown(1.5);

  // Calculate summary statistics
  const totalValue = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || "0"), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + parseFloat(inv.paidAmount || "0"), 0);
  const totalRemaining = invoices.reduce((sum, inv) => sum + parseFloat(inv.remainingAmount || "0"), 0);
  const collectionRate = totalValue > 0 ? ((totalPaid / totalValue) * 100).toFixed(1) : "0.0";
  const statusCounts = invoices.reduce((acc: any, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1;
    return acc;
  }, {});

  // Summary box with metrics
  const summaryBoxY = doc.y;
  doc.roundedRect(40, summaryBoxY, 515, 140, 5).fillAndStroke("#fef2f2", "#dc2626");

  doc.fillColor("#000000").fontSize(14).font("Helvetica-Bold").text("Financial Summary", 50, summaryBoxY + 10);
  doc.moveDown(0.5);

  const summaryY = doc.y;
  doc.fontSize(10).font("Helvetica");

  // Metrics grid
  const metrics = [
    { label: "Total Invoices:", value: `${invoices.length}`, color: "#000000" },
    { label: "Total Value:", value: `₹${totalValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, color: "#1e40af" },
    { label: "Total Collected:", value: `₹${totalPaid.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, color: "#059669" },
    { label: "Outstanding:", value: `₹${totalRemaining.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, color: "#dc2626" },
    { label: "Collection Rate:", value: `${collectionRate}%`, color: "#059669" }
  ];

  metrics.forEach((metric, i) => {
    const yPos = summaryY + (i * 18);
    doc.fillColor("#374151").font("Helvetica").text(metric.label, 60, yPos);
    doc.fillColor(metric.color).font("Helvetica-Bold").text(metric.value, 200, yPos);
  });

  // Status breakdown on right
  doc.fillColor("#374151").font("Helvetica").text("Status Breakdown:", 340, summaryY);
  let statusY = summaryY + 18;
  Object.entries(statusCounts).forEach(([status, count]) => {
    doc.fillColor("#6b7280").fontSize(9).text(`${status}:`, 350, statusY);
    doc.fillColor("#000000").font("Helvetica-Bold").text(`${count}`, 480, statusY);
    statusY += 15;
  });

  doc.y = summaryBoxY + 150;
  doc.moveDown(1);

  // Table title
  doc.fontSize(14).font("Helvetica-Bold").fillColor("#000000").text("Invoice Details", 40);
  doc.moveDown(0.8);

  // Table setup
  const tableTop = doc.y;
  const pageWidth = 515;
  const colWidths = [75, 110, 55, 70, 70, 70, 65];
  const headers = ["Invoice #", "Client", "Status", "Total", "Paid", "Due", "Due Date"];

  // Table header
  doc.rect(40, tableTop, pageWidth, 25).fillAndStroke("#e5e7eb", "#d1d5db");
  doc.fillColor("#1f2937").fontSize(8).font("Helvetica-Bold");

  let xPos = 45;
  headers.forEach((header, i) => {
    doc.text(header, xPos, tableTop + 8, {
      width: colWidths[i] - 10,
      align: i >= 3 && i <= 5 ? "right" : "left"
    });
    xPos += colWidths[i];
  });

  let y = tableTop + 30;
  doc.font("Helvetica").fontSize(8).fillColor("#000000");

  // Table rows
  invoices.slice(0, 30).forEach((invoice, index) => {
    if (y > 750) {
      doc.addPage();
      y = 50;

      // Redraw header
      doc.rect(40, y, pageWidth, 25).fillAndStroke("#e5e7eb", "#d1d5db");
      doc.fillColor("#1f2937").fontSize(8).font("Helvetica-Bold");
      xPos = 45;
      headers.forEach((header, i) => {
        doc.text(header, xPos, y + 8, {
          width: colWidths[i] - 10,
          align: i >= 3 && i <= 5 ? "right" : "left"
        });
        xPos += colWidths[i];
      });
      y += 30;
      doc.font("Helvetica").fontSize(8).fillColor("#000000");
    }

    // Alternating rows
    if (index % 2 === 0) {
      doc.rect(40, y - 2, pageWidth, 18).fill("#f9fafb");
    }

    const totalAmount = parseFloat(invoice.total || "0");
    const paidAmount = parseFloat(invoice.paidAmount || "0");
    const remainingAmount = parseFloat(invoice.remainingAmount || "0");
    const dueDate = invoice.dueDate
      ? new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" })
      : "N/A";

    xPos = 45;

    // Invoice number
    doc.fillColor("#1e40af").text(invoice.invoiceNumber, xPos, y + 4, { width: colWidths[0] - 10, ellipsis: true });
    xPos += colWidths[0];

    // Client name
    doc.fillColor("#000000").text(invoice.clientName || "N/A", xPos, y + 4, { width: colWidths[1] - 10, ellipsis: true });
    xPos += colWidths[1];

    // Status
    const statusColors: any = {
      draft: "#6b7280",
      sent: "#3b82f6",
      partial: "#f59e0b",
      paid: "#059669",
      overdue: "#dc2626"
    };
    doc.fillColor(statusColors[invoice.status] || "#6b7280").fontSize(7).text(
      invoice.status.toUpperCase(),
      xPos, y + 5,
      { width: colWidths[2] - 10 }
    );
    xPos += colWidths[2];

    // Total
    doc.fillColor("#1e40af").fontSize(8).font("Helvetica-Bold").text(
      `₹${totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      xPos, y + 4,
      { width: colWidths[3] - 10, align: "right" }
    );
    xPos += colWidths[3];

    // Paid
    doc.fillColor("#059669").font("Helvetica").text(
      `₹${paidAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      xPos, y + 4,
      { width: colWidths[4] - 10, align: "right" }
    );
    xPos += colWidths[4];

    // Due
    doc.fillColor(remainingAmount > 0 ? "#dc2626" : "#6b7280").text(
      `₹${remainingAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      xPos, y + 4,
      { width: colWidths[5] - 10, align: "right" }
    );
    xPos += colWidths[5];

    // Due date
    doc.fillColor("#6b7280").fontSize(7).text(dueDate, xPos, y + 5, { width: colWidths[6] - 10, align: "left" });

    y += 18;
  });

  // Bottom border
  doc.rect(40, y, pageWidth, 1).fill("#d1d5db");

  // Footer note
  if (invoices.length > 30) {
    doc.moveDown(1);
    doc.fontSize(8).font("Helvetica-Oblique").fillColor("#6b7280").text(
      `Note: Showing first 30 of ${invoices.length} total invoices. Export to Excel for complete data.`,
      { align: "center" }
    );
  }

  // Add page numbers
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor("#9ca3af").text(
      `Page ${i + 1} of ${pages.count}`,
      40,
      doc.page.height - 30,
      { align: "center" }
    );
  }

  doc.end();
}

