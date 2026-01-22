import PDFDocument from "pdfkit";
import type { Readable } from "stream";
import { prepareLogoSync, drawLogo } from "./pdf-helpers";
import { formatCurrency, formatCurrencyPdf } from "./currency-helper";

interface VendorPoPDFData {
  po: {
    poNumber: string;
    orderDate: Date;
    expectedDeliveryDate?: Date | null;
    subtotal: string;
    discount: string;
    cgst: string;
    sgst: string;
    igst: string;
    shippingCharges: string;
    total: string;
    currency?: string;
    notes?: string | null;
    termsAndConditions?: string | null;
  };
  vendor: {
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    gstin?: string | null;
    contactPerson?: string | null;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
  }>;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  companyGSTIN: string;
  companyLogo?: string;
}

export class VendorPoPDFService {
  static generateVendorPoPDF(data: VendorPoPDFData): Readable {
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    // Register Fonts
    try {
      const fontDir = require("path").join(process.cwd(), "server", "pdf", "fonts");
      const regularPath = require("path").join(fontDir, "Roboto-Regular.ttf");
      const boldPath = require("path").join(fontDir, "Roboto-Bold.ttf");
      
      const fs = require("fs");
      if (fs.existsSync(regularPath) && fs.existsSync(boldPath)) {
          doc.registerFont("Helvetica", regularPath);
          doc.registerFont("Helvetica-Bold", boldPath);
      }
    } catch (e) { }

    // Header
    const { logo, mimeType } = prepareLogoSync(data.companyLogo);
    let logoSize = 50;
    
    if (logo) {
      drawLogo(doc, logo, mimeType, 50, 50, logoSize);
    }
    
    // Move slightly down if logo is present so title isn't too cramped? 
    // Actually title is centered, logo is left (50,50). Overlap is unlikely.
    
    doc.fontSize(24).font("Helvetica-Bold").text("PURCHASE ORDER", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica").text(data.companyName, { align: "center" });
    if (data.companyAddress) {
      doc.fontSize(9).text(data.companyAddress, { align: "center" });
    }
    if (data.companyPhone || data.companyEmail) {
      doc.text(`${data.companyPhone || ""} | ${data.companyEmail || ""}`, { align: "center" });
    }
    if (data.companyGSTIN) {
      doc.text(`GSTIN: ${data.companyGSTIN}`, { align: "center" });
    }
    doc.moveDown(1);

    // PO Details
    const startY = doc.y;
    doc.fontSize(10).font("Helvetica-Bold").text("PO Number:", 50, startY);
    doc.font("Helvetica").text(data.po.poNumber, 150, startY);
    
    doc.font("Helvetica-Bold").text("PO Date:", 50, startY + 15);
    doc.font("Helvetica").text(new Date(data.po.orderDate).toLocaleDateString(), 150, startY + 15);

    if (data.po.expectedDeliveryDate) {
      doc.font("Helvetica-Bold").text("Delivery Date:", 50, startY + 30);
      doc.font("Helvetica").text(new Date(data.po.expectedDeliveryDate).toLocaleDateString(), 150, startY + 30);
    }

    doc.moveDown(3);

    // Vendor Details
    doc.fontSize(11).font("Helvetica-Bold").text("Vendor Details:", 50);
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Name: ${data.vendor.name}`);
    if (data.vendor.contactPerson) {
      doc.text(`Contact Person: ${data.vendor.contactPerson}`);
    }
    if (data.vendor.email) {
      doc.text(`Email: ${data.vendor.email}`);
    }
    if (data.vendor.phone) {
      doc.text(`Phone: ${data.vendor.phone}`);
    }
    if (data.vendor.address) {
      doc.text(`Address: ${data.vendor.address}`);
    }
    if (data.vendor.gstin) {
      doc.text(`GSTIN: ${data.vendor.gstin}`);
    }

    doc.moveDown(1.5);

    // Items Table
    const tableTop = doc.y;
    const itemCodeX = 50;
    const descriptionX = 70;
    const quantityX = 350;
    const rateX = 420;
    const amountX = 490;

    // Table Header
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("#", itemCodeX, tableTop);
    doc.text("Description", descriptionX, tableTop);
    doc.text("Qty", quantityX, tableTop);
    doc.text("Rate", rateX, tableTop);
    doc.text("Amount", amountX, tableTop);

    // Line under header
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table Rows
    doc.font("Helvetica");
    let yPos = tableTop + 25;
    data.items.forEach((item, index) => {
      // Check if we need a new page
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      doc.text((index + 1).toString(), itemCodeX, yPos);
      doc.text(item.description, descriptionX, yPos, { width: 270 });
      doc.text(item.quantity.toString(), quantityX, yPos);
      doc.text(formatCurrencyPdf(Number(item.unitPrice), data.po.currency), rateX, yPos);
      doc.text(formatCurrencyPdf(Number(item.subtotal), data.po.currency), amountX, yPos);
      
      yPos += 25;
    });

    // Line after items
    doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
    yPos += 15;

    // Totals
    doc.font("Helvetica-Bold");
    const totalsX = 420;
    doc.text("Subtotal:", totalsX, yPos);
    doc.font("Helvetica").text(formatCurrencyPdf(Number(data.po.subtotal), data.po.currency), 490, yPos);
    yPos += 15;

    if (Number(data.po.discount) > 0) {
      doc.font("Helvetica-Bold").text("Discount:", totalsX, yPos);
      doc.font("Helvetica").text(`-${formatCurrencyPdf(Number(data.po.discount), data.po.currency)}`, 490, yPos);
      yPos += 15;
    }

    if (Number(data.po.cgst) > 0) {
      doc.font("Helvetica-Bold").text("CGST:", totalsX, yPos);
      doc.font("Helvetica").text(formatCurrencyPdf(Number(data.po.cgst), data.po.currency), 490, yPos);
      yPos += 15;
    }

    if (Number(data.po.sgst) > 0) {
      doc.font("Helvetica-Bold").text("SGST:", totalsX, yPos);
      doc.font("Helvetica").text(formatCurrencyPdf(Number(data.po.sgst), data.po.currency), 490, yPos);
      yPos += 15;
    }

    if (Number(data.po.igst) > 0) {
      doc.font("Helvetica-Bold").text("IGST:", totalsX, yPos);
      doc.font("Helvetica").text(formatCurrencyPdf(Number(data.po.igst), data.po.currency), 490, yPos);
      yPos += 15;
    }

    if (Number(data.po.shippingCharges) > 0) {
      doc.font("Helvetica-Bold").text("Shipping:", totalsX, yPos);
      doc.font("Helvetica").text(formatCurrencyPdf(Number(data.po.shippingCharges), data.po.currency), 490, yPos);
      yPos += 15;
    }

    // Total Amount (highlighted)
    doc.rect(415, yPos - 5, 135, 20).fillAndStroke("#f0f0f0", "#000");
    doc.fillColor("#000");
    doc.fontSize(11).font("Helvetica-Bold").text("Total Amount:", totalsX, yPos);
    doc.text(formatCurrencyPdf(Number(data.po.total), data.po.currency), 490, yPos);
    yPos += 30;

    // Notes
    if (data.po.notes) {
      doc.fontSize(10).font("Helvetica-Bold").text("Notes:", 50, yPos);
      yPos += 15;
      doc.fontSize(9).font("Helvetica").text(data.po.notes, 50, yPos, { width: 500 });
      yPos += 40;
    }

    // Terms and Conditions
    if (data.po.termsAndConditions) {
      if (yPos > 650) {
        doc.addPage();
        yPos = 50;
      }
      doc.fontSize(10).font("Helvetica-Bold").text("Terms and Conditions:", 50, yPos);
      yPos += 15;
      doc.fontSize(8).font("Helvetica").text(data.po.termsAndConditions, 50, yPos, { width: 500 });
    }

    // Footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).text(
        `Page ${i + 1} of ${pageCount} | Generated on ${new Date().toLocaleString()}`,
        50,
        750,
        { align: "center" }
      );
    }

    doc.end();
    return doc as unknown as Readable;
  }
}

