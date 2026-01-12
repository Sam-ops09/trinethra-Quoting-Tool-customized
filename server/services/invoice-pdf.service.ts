// server/services/invoice-pdf.service.ts
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import type { Quote, QuoteItem, Client } from "@shared/schema";

interface InvoicePdfData {
  quote: Quote;
  client: Client;
  items: QuoteItem[];

  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  companyGSTIN?: string;
  companyLogo?: string;
  preparedBy?: string;
  userEmail?: string;

  // Company details from settings
  companyDetails?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    gstin?: string;
  };

  invoiceNumber: string;
  dueDate: Date;

  /** Optional explicit invoice date; falls back to quote.quoteDate */
  invoiceDate?: Date;

  paidAmount?: string | number;
  paymentStatus?: string;

  // Master/Child invoice fields
  isMaster?: boolean;
  masterInvoiceStatus?: string;
  parentInvoiceNumber?: string;

  childInvoices?: Array<{
    invoiceNumber: string;
    total: string;
    paymentStatus: string;
    createdAt: string;
  }>;

  deliveryNotes?: string | null;
  milestoneDescription?: string | null;

  // Invoice-specific totals (override quote totals)
  subtotal?: string;
  discount?: string;
  cgst?: string;
  sgst?: string;
  igst?: string;
  shippingCharges?: string;
  total?: string;

  notes?: string | null;
  termsAndConditions?: string | null;

  // Bank account details
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankIfscCode?: string;
  bankBranch?: string;
  bankSwiftCode?: string;
}

type SerialAppendixItem = {
  itemIndex: number;
  description: string;
  serials: string[];
};

export class InvoicePDFService {
  // A4 points
  private static readonly PAGE_WIDTH = 595.28;
  private static readonly PAGE_HEIGHT = 841.89;

  // Compact margins
  private static readonly MARGIN_LEFT = 28;
  private static readonly MARGIN_RIGHT = 28;
  private static readonly MARGIN_TOP = 22;
  private static readonly MARGIN_BOTTOM = 32;

  private static readonly CONTENT_WIDTH =
    InvoicePDFService.PAGE_WIDTH -
    InvoicePDFService.MARGIN_LEFT -
    InvoicePDFService.MARGIN_RIGHT;

  // Palette
  private static readonly INK = "#111827";
  private static readonly SUBTLE = "#4B5563";
  private static readonly FAINT = "#6B7280";
  private static readonly LINE = "#D1D5DB";
  private static readonly SOFT = "#F3F4F6";

  private static readonly CURRENCY_PREFIX = "Rs. ";

  // Serials
  private static readonly SERIAL_INLINE_LIMIT = 8;
  private static readonly SERIAL_APPENDIX_THRESHOLD = 12;

  // Text/layout tuning
  private static readonly TABLE_DESC_MAX_LINES = 6;
  private static readonly TABLE_SERIAL_MAX_LINES = 6;

  // ---------------------------
  // Public API
  // ---------------------------
  static generateInvoicePDF(data: InvoicePdfData): PDFKit.PDFDocument {
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: this.MARGIN_TOP,
        bottom: this.MARGIN_BOTTOM,
        left: this.MARGIN_LEFT,
        right: this.MARGIN_RIGHT,
      },
      bufferPages: true,
      info: {
        Author: data.companyName || "AICERA",
      },
    });

    doc.lineGap(1);

    const appendix: SerialAppendixItem[] = [];

    this.drawHeader(doc, data);
    this.drawTopBlocks(doc, data);
    this.drawItemsTable(doc, data, appendix);
    this.drawFinalSections(doc, data);

    if (appendix.length > 0) {
      doc.addPage();
      this.drawHeader(doc, data);
      this.drawSerialAppendix(doc, data, appendix);
    }

    const range = doc.bufferedPageRange();
    const totalPages = range.count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      this.drawFooter(doc, i + 1, totalPages);
    }

    doc.end();
    return doc;
  }

  // ---------------------------
  // Geometry helpers
  // ---------------------------
  private static bottomY(): number {
    return this.PAGE_HEIGHT - this.MARGIN_BOTTOM;
  }

  private static ensureSpace(
    doc: InstanceType<typeof PDFDocument>,
    data: InvoicePdfData,
    needed: number
  ) {
    if (doc.y + needed <= this.bottomY()) return;
    doc.addPage();
    this.drawHeader(doc, data);
  }

  private static hr(doc: InstanceType<typeof PDFDocument>, y?: number) {
    const yy = y ?? doc.y;
    doc.save();
    doc.strokeColor(this.LINE).lineWidth(0.8);
    doc
      .moveTo(this.MARGIN_LEFT, yy)
      .lineTo(this.PAGE_WIDTH - this.MARGIN_RIGHT, yy)
      .stroke();
    doc.restore();
  }

  private static hrLocal(
    doc: InstanceType<typeof PDFDocument>,
    x1: number,
    x2: number,
    y: number,
    lineWidth = 0.8
  ) {
    doc.save();
    doc.strokeColor(this.LINE).lineWidth(lineWidth);
    doc.moveTo(x1, y).lineTo(x2, y).stroke();
    doc.restore();
  }

  private static box(
    doc: InstanceType<typeof PDFDocument>,
    x: number,
    y: number,
    w: number,
    h: number,
    opts?: { fill?: string; stroke?: string; lineWidth?: number }
  ) {
    doc.save();
    if (opts?.fill) doc.fillColor(opts.fill).rect(x, y, w, h).fill();
    doc
      .strokeColor(opts?.stroke ?? this.LINE)
      .lineWidth(opts?.lineWidth ?? 0.9)
      .rect(x, y, w, h)
      .stroke();
    doc.restore();
  }

  private static label(
    doc: InstanceType<typeof PDFDocument>,
    txt: string,
    x: number,
    y: number
  ) {
    doc.save();
    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(txt.toUpperCase(), x, y, {
      characterSpacing: 0.6,
      lineBreak: false,
    });
    doc.restore();
  }

  private static safeDate(d: any): string {
    try {
      if (!d) return "-";
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return "-";
      return dt.toLocaleDateString("en-IN");
    } catch {
      return "-";
    }
  }

  private static money(v: number | string): string {
    const n = Number(v) || 0;
    return (
      this.CURRENCY_PREFIX +
      n.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  /** For totals rows (discount etc.) */
  private static moneySigned(v: number | string): string {
    const n = Number(v) || 0;
    if (n < 0) {
      const abs = Math.abs(n);
      return (
        "-" +
        this.CURRENCY_PREFIX +
        abs.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }
    return this.money(n);
  }

  private static normalizeAddress(addr?: string, maxLines = 3) {
    if (!addr) return "";
    const rawParts = String(addr)
      .split(/\n|,/g)
      .map((s) => s.trim())
      .filter(Boolean);

    const seen = new Set<string>();
    const parts: string[] = [];
    for (const p of rawParts) {
      const k = p.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      parts.push(p);
    }

    return parts.slice(0, Math.max(3, maxLines * 2)).join(", ");
  }

  private static isValidEmail(email?: string) {
    if (!email) return false;
    const e = email.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  private static isValidPhone(phone?: string) {
    if (!phone) return false;
    const p = phone.replace(/[^\d]/g, "");
    return p.length >= 8 && p.length <= 13;
  }

  private static isValidGSTIN(gstin?: string) {
    if (!gstin) return false;
    const g = gstin.trim().toUpperCase();
    return /^[0-9A-Z]{15}$/.test(g);
  }

  private static truncateToWidth(
    doc: InstanceType<typeof PDFDocument>,
    text: string,
    maxWidth: number,
    suffix = "…"
  ) {
    const s = String(text ?? "");
    if (!s) return "";
    if (doc.widthOfString(s) <= maxWidth) return s;

    let lo = 0;
    let hi = s.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      const cand = s.slice(0, mid) + suffix;
      if (doc.widthOfString(cand) <= maxWidth) lo = mid + 1;
      else hi = mid;
    }
    const cut = Math.max(0, lo - 1);
    return s.slice(0, cut) + suffix;
  }

  private static wrapTextLines(
    doc: InstanceType<typeof PDFDocument>,
    text: string,
    width: number,
    maxLines = Infinity
  ): string[] {
    const t = String(text ?? "").replace(/\s+/g, " ").trim();
    if (!t) return [];
    const words = t.split(" ");
    const lines: string[] = [];
    let line = "";

    const pushLine = (s: string) => {
      const trimmed = s.trim();
      if (trimmed) lines.push(trimmed);
    };

    for (const w of words) {
      if (lines.length >= maxLines) break;
      const candidate = line ? `${line} ${w}` : w;
      if (doc.widthOfString(candidate) <= width) {
        line = candidate;
      } else {
        if (line) pushLine(line);
        line = w;
      }
    }
    if (line && lines.length < maxLines) pushLine(line);
    return lines;
  }

  // ---------------------------
  // Header
  // ---------------------------
  private static drawHeader(
    doc: InstanceType<typeof PDFDocument>,
    data: InvoicePdfData
  ) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    const topY = doc.page.margins.top;

    const logoSize = 26;
    let logoPrinted = false;

    try {
      if (data.companyLogo) {
        doc.image(data.companyLogo, x, topY + 12, { fit: [logoSize, logoSize] });
        logoPrinted = true;
      } else {
        let logoPath = path.join(process.cwd(), "client", "public", "AICERA_Logo.png");
        if (!fs.existsSync(logoPath)) logoPath = path.join(process.cwd(), "client", "public", "logo.png");
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, x, topY + 12, { fit: [logoSize, logoSize] });
          logoPrinted = true;
        }
      }
    } catch {
      logoPrinted = false;
    }

    const leftX = logoPrinted ? x + logoSize + 8 : x;

    doc.font("Helvetica-Bold").fontSize(11).fillColor(this.INK);
    doc.text("TAX INVOICE", x, topY - 2, {
      width: w,
      align: "center",
      lineBreak: false,
    });

    doc.font("Helvetica-Bold").fontSize(10).fillColor(this.INK);
    doc.text(data.companyName || "AICERA", leftX, topY + 12, {
      width: 300,
      lineBreak: false,
    });

    const parts: string[] = [];
    if (this.isValidEmail(data.companyEmail)) parts.push(String(data.companyEmail).trim());
    if (this.isValidPhone(data.companyPhone)) parts.push(String(data.companyPhone).trim());
    if (this.isValidGSTIN(data.companyGSTIN)) parts.push(`GSTIN: ${String(data.companyGSTIN).trim().toUpperCase()}`);

    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    if (parts.length) {
      doc.text(parts.join("  |  "), leftX, topY + 24, {
        width: 360,
        lineBreak: false,
      });
    }

    const addr = this.normalizeAddress(data.companyAddress, 2);
    if (addr) {
      doc.font("Helvetica").fontSize(7.0).fillColor(this.SUBTLE);
      doc.text(addr, leftX, topY + 34, { width: 360 });
    }

    const rightW = 210;
    const rightX = x + w - rightW;

    doc.font("Helvetica").fontSize(7.0).fillColor(this.SUBTLE);
    doc.text("Invoice No.", rightX, topY + 12, {
      width: rightW,
      align: "right",
      lineBreak: false,
    });

    doc.font("Helvetica-Bold").fontSize(9.6).fillColor(this.INK);
    doc.text(String(data.invoiceNumber || "-"), rightX, topY + 22, {
      width: rightW,
      align: "right",
      lineBreak: false,
    });

    doc.font("Helvetica").fontSize(7.0).fillColor(this.SUBTLE);
    doc.text("Date", rightX, topY + 34, {
      width: rightW,
      align: "right",
      lineBreak: false,
    });

    const invDate = data.invoiceDate ?? (data.quote as any)?.quoteDate;
    doc.font("Helvetica-Bold").fontSize(8.6).fillColor(this.INK);
    doc.text(this.safeDate(invDate), rightX, topY + 44, {
      width: rightW,
      align: "right",
      lineBreak: false,
    });

    const minLineY = topY + 58;
    doc.y = Math.max(doc.y + 6, minLineY);
    this.hr(doc);
    doc.y += 8;
  }

  // ---------------------------
  // Top blocks
  // ---------------------------
  private static drawTopBlocks(
    doc: InstanceType<typeof PDFDocument>,
    data: InvoicePdfData
  ) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;

    const gap = 10;
    const leftW = w * 0.56;
    const rightW = w - leftW - gap;

    let startY = doc.y;

    // Optional "From" company-details block
    const companyDetails = data.companyDetails || {};
    const hasCompanyDetails = companyDetails.name || companyDetails.address || companyDetails.email;

    if (hasCompanyDetails) {
      doc.font("Helvetica-Bold").fontSize(8.6);
      const compNameH = companyDetails.name
        ? doc.heightOfString(companyDetails.name, { width: w - 16 })
        : 0;

      const companyInfo: string[] = [];
      if (companyDetails.address) companyInfo.push(String(companyDetails.address).trim());
      if (companyDetails.phone) companyInfo.push(`Ph: ${String(companyDetails.phone).trim()}`);
      if (companyDetails.gstin) companyInfo.push(`GSTIN: ${String(companyDetails.gstin).trim().toUpperCase()}`);
      if (data.userEmail) companyInfo.push(`Contact: ${String(data.userEmail).trim()}`);

      doc.font("Helvetica").fontSize(7.2);
      const compInfoText = companyInfo.join(" | ");
      const compInfoH = companyInfo.length
        ? doc.heightOfString(compInfoText, { width: w - 16 })
        : 0;

      const companyBoxH = Math.max(6 + 12 + compNameH + 2 + compInfoH + 10, 56);

      this.ensureSpace(doc, data, companyBoxH + 10);

      this.box(doc, x, startY, w, companyBoxH, { fill: "#FFFFFF" });

      doc.font("Helvetica-Bold").fontSize(8.2).fillColor(this.INK);
      doc.text("From", x + 8, startY + 6, { width: w - 16 });

      let cy = startY + 18;

      if (companyDetails.name) {
        doc.font("Helvetica-Bold").fontSize(8.6).fillColor(this.INK);
        doc.text(companyDetails.name, x + 8, cy, { width: w - 16 });
        cy += compNameH + 2;
      }

      if (companyInfo.length > 0) {
        doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
        doc.text(compInfoText, x + 8, cy, { width: w - 16 });
      }

      startY += companyBoxH + 10;
    }

    const startY2 = startY;
    const leftX = x;
    const rightX = x + leftW + gap;

    const ship = (data.client as any)?.shippingAddress || (data.client as any)?.billingAddress;
    const bill = (data.client as any)?.billingAddress;

    const clientPhone = (data.client as any)?.phone;
    const clientEmail = (data.client as any)?.email;
    const clientGSTIN = (data.client as any)?.gstin;

    const clientName = data.client.name || "-";
    const shipAddr = this.normalizeAddress(ship, 10) || "-";
    const billAddr = this.normalizeAddress(bill, 10) || "-";

    doc.font("Helvetica-Bold").fontSize(8.6);
    const cNameH = doc.heightOfString(clientName, { width: leftW - 16 });

    doc.font("Helvetica").fontSize(7.2);
    const shipAddrH = doc.heightOfString(shipAddr, { width: leftW - 16 });
    const billAddrH = doc.heightOfString(billAddr, { width: leftW - 16 });

    const billParts: string[] = [];
    if (this.isValidPhone(clientPhone)) billParts.push(`Ph: ${String(clientPhone).trim()}`);
    if (this.isValidEmail(clientEmail)) billParts.push(`Email: ${String(clientEmail).trim()}`);
    if (this.isValidGSTIN(clientGSTIN)) billParts.push(`GSTIN: ${String(clientGSTIN).trim().toUpperCase()}`);

    doc.font("Helvetica").fontSize(7.0);
    const contactText = billParts.join("  |  ");
    const contactH = billParts.length ? doc.heightOfString(contactText, { width: leftW - 16 }) : 0;

    const shipBlockH = 6 + 14 + cNameH + 2 + shipAddrH + 8;

    // IMPORTANT FIX: contact is NOT bottom-anchored anymore — it flows after bill address.
    const billBlockH = 6 + 14 + cNameH + 2 + billAddrH + (contactH ? 6 + contactH : 0) + 8;

    const leftTotalH = shipBlockH + billBlockH;

    // right meta rows
    const rightTotalH = 20 + (6 * 18) + 10;
    const h = Math.max(leftTotalH, rightTotalH, 128);

    this.ensureSpace(doc, data, h + 10);

    // Left big box
    this.box(doc, leftX, startY2, leftW, h, { fill: "#FFFFFF" });

    // FIX: only draw local divider, NOT a full-width hr
    const splitY = startY2 + shipBlockH;
    this.hrLocal(doc, leftX, leftX + leftW, splitY, 0.8);

    // Ship To
    doc.font("Helvetica-Bold").fontSize(8.2).fillColor(this.INK);
    doc.text("Consignee (Ship To)", leftX + 8, startY2 + 6, { width: leftW - 16 });

    let cy = startY2 + 20;
    doc.font("Helvetica-Bold").fontSize(8.6).fillColor(this.INK);
    doc.text(clientName, leftX + 8, cy, { width: leftW - 16 });
    cy += cNameH + 2;

    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(shipAddr, leftX + 8, cy, { width: leftW - 16 });

    // Bill To
    const by = splitY;
    doc.font("Helvetica-Bold").fontSize(8.2).fillColor(this.INK);
    doc.text("Buyer (Bill To)", leftX + 8, by + 6, { width: leftW - 16 });

    cy = by + 20;
    doc.font("Helvetica-Bold").fontSize(8.6).fillColor(this.INK);
    doc.text(clientName, leftX + 8, cy, { width: leftW - 16 });
    cy += cNameH + 2;

    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(billAddr, leftX + 8, cy, { width: leftW - 16 });
    cy += billAddrH + 6;

    if (contactH > 0) {
      doc.font("Helvetica").fontSize(7.0).fillColor(this.SUBTLE);
      doc.text(contactText, leftX + 8, cy, { width: leftW - 16 });
    }

    // Right meta grid box
    this.box(doc, rightX, startY2, rightW, h, { fill: "#FFFFFF" });

    const kvRowH = h / 6;
    const pad = 8;
    const labelW = Math.min(88, rightW * 0.45);
    const valW = rightW - pad * 2 - labelW;

    const row = (i: number, label: string, value: string) => {
      const yy = startY2 + i * kvRowH;

      if (i < 5) {
        doc.save();
        doc.strokeColor(this.LINE).lineWidth(0.6);
        doc.moveTo(rightX, yy + kvRowH).lineTo(rightX + rightW, yy + kvRowH).stroke();
        doc.restore();
      }

      doc.font("Helvetica").fontSize(7.0).fillColor(this.SUBTLE);
      doc.text(label, rightX + pad, yy + 5, { width: labelW, lineBreak: false });

      doc.font("Helvetica-Bold").fontSize(7.6).fillColor(this.INK);
      const v = value || "-";
      doc.text(this.truncateToWidth(doc, v, valW), rightX + pad + labelW, yy + 4, {
        width: valW,
        align: "right",
        lineBreak: false,
      });
    };

    const status = String(data.paymentStatus || "pending").toUpperCase();
    const quoteNo = String((data.quote as any)?.quoteNumber || "-");
    const due = this.safeDate(data.dueDate);
    const invDate = this.safeDate(data.invoiceDate ?? (data.quote as any)?.quoteDate);
    const preparedBy = String(data.preparedBy || "-");
    const deliveryNotesStr = String(data.deliveryNotes || "").trim();

    row(0, "Invoice Date", invDate);
    row(1, "Due Date", due);
    row(2, "PO No.", quoteNo);
    row(3, "Payment Status", status);
    row(4, "Invoice Prepared By", preparedBy);
    row(5, "Delivery Note", deliveryNotesStr);

    doc.y = startY2 + h + 10;
  }

  // ---------------------------
  // Items Table
  // ---------------------------
  private static drawItemsTable(
    doc: InstanceType<typeof PDFDocument>,
    data: InvoicePdfData,
    appendix: SerialAppendixItem[]
  ) {
    const x0 = this.MARGIN_LEFT;
    const tableW = this.CONTENT_WIDTH;

    const col = {
      sn: 24,
      desc: 260,
      hsn: 56,
      qty: 40,
      unit: 40,
      rate: 72,
      amount: 0,
    };

    const fixed = col.sn + col.hsn + col.qty + col.unit + col.rate;
    col.amount = Math.max(86, tableW - fixed - col.desc);
    col.desc = Math.max(210, tableW - fixed - col.amount);

    const cx = {
      sn: x0,
      desc: x0 + col.sn,
      hsn: x0 + col.sn + col.desc,
      qty: x0 + col.sn + col.desc + col.hsn,
      unit: x0 + col.sn + col.desc + col.hsn + col.qty,
      rate: x0 + col.sn + col.desc + col.hsn + col.qty + col.unit,
      amount: x0 + col.sn + col.desc + col.hsn + col.qty + col.unit + col.rate,
      right: x0 + tableW,
    };

    doc.font("Helvetica-Bold").fontSize(9.2).fillColor(this.INK);
    doc.text("Description of Goods / Services", x0, doc.y);
    doc.y += 6;

    const headerH = 22;
    const minRowH = 20;

    const drawHeader = (y: number) => {
      this.box(doc, x0, y, tableW, headerH, {
        fill: this.SOFT,
        stroke: this.LINE,
        lineWidth: 0.9,
      });

      doc.save();
      doc.strokeColor(this.LINE).lineWidth(0.8);
      [cx.desc, cx.hsn, cx.qty, cx.unit, cx.rate, cx.amount].forEach((vx) => {
        doc.moveTo(vx, y).lineTo(vx, y + headerH).stroke();
      });
      doc.restore();

      doc.font("Helvetica").fontSize(7.0).fillColor(this.SUBTLE);

      const put = (
        t: string,
        xx: number,
        ww: number,
        align: PDFKit.Mixins.TextOptions["align"]
      ) => {
        doc.text(t.toUpperCase(), xx, y + 7, {
          width: ww,
          align,
          characterSpacing: 0.6,
          lineBreak: false,
        });
      };

      put("Sl", cx.sn, col.sn, "center");
      put("Description", cx.desc + 6, col.desc - 12, "left");
      put("HSN/SAC", cx.hsn, col.hsn, "center");
      put("Qty", cx.qty, col.qty, "center");
      put("Unit", cx.unit, col.unit, "center");
      put("Rate", cx.rate, col.rate - 8, "right");
      put("Amount", cx.amount, col.amount - 8, "right");
    };

    this.ensureSpace(doc, data, headerH + minRowH + 10);

    let y = doc.y;
    drawHeader(y);
    y += headerH;

    const items = data.items || [];
    if (items.length === 0) {
      this.box(doc, x0, y, tableW, 40, { fill: "#FFFFFF" });
      doc.font("Helvetica-Bold").fontSize(8).fillColor(this.SUBTLE);
      doc.text("No items.", x0, y + 14, { width: tableW, align: "center" });
      doc.y = y + 50;
      return;
    }

    for (let idx = 0; idx < items.length; idx++) {
      const it = items[idx];

      const descRaw = String((it as any).description ?? "").trim();
      const desc = descRaw || "-";

      const qty = Number((it as any).quantity ?? 0);
      const unit = String((it as any).unit ?? "pcs");
      const rate = Number((it as any).unitPrice ?? 0);
      const amount = Number((it as any).subtotal ?? qty * rate);

      const hsnSac = String((it as any).hsnSac ?? (it as any).hsn_sac ?? "").trim() || "-";

      const serials = this.parseSerialNumbers((it as any).serialNumbers);
      const needsAppendix = serials.length > this.SERIAL_APPENDIX_THRESHOLD;

      const serialInline = serials.length
        ? this.serialInlineSummary(serials, needsAppendix)
        : "";

      // measure row height (MATCH what we render)
      doc.save();
      doc.font("Helvetica").fontSize(8.0).fillColor(this.INK);

      const allDescLines = this.wrapTextLines(doc, desc, col.desc - 12, 50);
      let descLines = allDescLines;

      if (allDescLines.length > this.TABLE_DESC_MAX_LINES) {
        descLines = allDescLines.slice(0, this.TABLE_DESC_MAX_LINES);
        // indicate truncation cleanly
        const last = descLines[descLines.length - 1];
        descLines[descLines.length - 1] = this.truncateToWidth(
          doc,
          `${last} …`,
          col.desc - 12
        );
      }

      const descH = descLines.length * 11;

      let serialLines: string[] = [];
      let serialH = 0;
      if (serialInline) {
        doc.font("Helvetica").fontSize(6.8).fillColor(this.SUBTLE);
        const sAll = this.wrapTextLines(doc, serialInline, col.desc - 12, 50);
        serialLines = sAll.slice(0, this.TABLE_SERIAL_MAX_LINES);
        if (sAll.length > this.TABLE_SERIAL_MAX_LINES) {
          const last = serialLines[serialLines.length - 1];
          serialLines[serialLines.length - 1] = this.truncateToWidth(
            doc,
            `${last} …`,
            col.desc - 12
          );
        }
        serialH = serialLines.length ? serialLines.length * 9 : 0;
      }

      doc.restore();

      const rowH = Math.max(minRowH, 8 + descH + (serialH ? serialH + 2 : 0));

      // paginate
      if (y + rowH > this.bottomY() - 10) {
        doc.addPage();
        this.drawHeader(doc, data);
        this.drawTopBlocks(doc, data);

        doc.font("Helvetica-Bold").fontSize(9.2).fillColor(this.INK);
        doc.text("Description of Goods / Services (cont.)", x0, doc.y);
        doc.y += 6;

        this.ensureSpace(doc, data, headerH + minRowH + 10);
        y = doc.y;
        drawHeader(y);
        y += headerH;
      }

      // row box
      this.box(doc, x0, y, tableW, rowH, { fill: "#FFFFFF" });

      // vertical lines
      doc.save();
      doc.strokeColor(this.LINE).lineWidth(0.8);
      [cx.desc, cx.hsn, cx.qty, cx.unit, cx.rate, cx.amount].forEach((vx) => {
        doc.moveTo(vx, y).lineTo(vx, y + rowH).stroke();
      });
      doc.restore();

      const padY = 6;

      doc.font("Helvetica").fontSize(8).fillColor(this.INK);
      doc.text(String(idx + 1), cx.sn, y + padY, {
        width: col.sn,
        align: "center",
        lineBreak: false,
      });

      // description (RENDER ALL measured lines)
      let dy = y + padY;
      doc.font("Helvetica").fontSize(8.0).fillColor(this.INK);
      for (const ln of descLines) {
        doc.text(ln, cx.desc + 6, dy, { width: col.desc - 12, lineBreak: false });
        dy += 11;
      }

      // serial inline
      if (serialLines.length) {
        dy += 2;
        doc.font("Helvetica").fontSize(6.8).fillColor(this.SUBTLE);
        for (const ln of serialLines) {
          doc.text(this.truncateToWidth(doc, ln, col.desc - 12), cx.desc + 6, dy, {
            width: col.desc - 12,
            lineBreak: false,
          });
          dy += 9;
        }
      }

      doc.font("Helvetica").fontSize(8).fillColor(this.INK);
      doc.text(hsnSac, cx.hsn, y + padY, { width: col.hsn, align: "center", lineBreak: false });
      doc.text(String(qty), cx.qty, y + padY, { width: col.qty, align: "center", lineBreak: false });
      doc.text(unit, cx.unit, y + padY, { width: col.unit, align: "center", lineBreak: false });
      doc.text(this.money(rate), cx.rate, y + padY, {
        width: col.rate - 8,
        align: "right",
        lineBreak: false,
      });
      doc.text(this.money(amount), cx.amount, y + padY, {
        width: col.amount - 8,
        align: "right",
        lineBreak: false,
      });

      if (needsAppendix) appendix.push({ itemIndex: idx + 1, description: desc, serials });

      y += rowH;
    }

    doc.y = y + 8;
  }

  // ---------------------------
  // Final sections
  // ---------------------------
  private static drawFinalSections(doc: InstanceType<typeof PDFDocument>, data: InvoicePdfData) {
    const sectionMin = 190;
    this.ensureSpace(doc, data, sectionMin);

    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    const gap = 10;

    const leftW = w * 0.58;
    const rightW = w - leftW - gap;
    const leftX = x;
    const rightX = x + leftW + gap;

    const subtotal =
      data.subtotal !== undefined ? Number(data.subtotal) : Number((data.quote as any).subtotal) || 0;
    const discount =
      data.discount !== undefined ? Number(data.discount) : Number((data.quote as any).discount) || 0;
    const shipping =
      data.shippingCharges !== undefined
        ? Number(data.shippingCharges)
        : Number((data.quote as any).shippingCharges) || 0;
    const cgst = data.cgst !== undefined ? Number(data.cgst) : Number((data.quote as any).cgst) || 0;
    const sgst = data.sgst !== undefined ? Number(data.sgst) : Number((data.quote as any).sgst) || 0;
    const igst = data.igst !== undefined ? Number(data.igst) : Number((data.quote as any).igst) || 0;
    const total = data.total !== undefined ? Number(data.total) : Number((data.quote as any).total) || 0;

    // Discount should display (cleanly) and affect taxable.
    const effectiveDiscount = Math.max(0, discount);
    const taxable = Math.max(0, subtotal - effectiveDiscount + Math.max(0, shipping));

    const totalsRows: Array<{ label: string; value: number; bold?: boolean; signed?: boolean }> = [
      { label: "Subtotal", value: subtotal },
    ];
    if (effectiveDiscount > 0) totalsRows.push({ label: "Discount", value: -effectiveDiscount, signed: true });
    if (shipping > 0) totalsRows.push({ label: "Shipping/Handling", value: shipping });
    if (cgst > 0) totalsRows.push({ label: "CGST", value: cgst });
    if (sgst > 0) totalsRows.push({ label: "SGST", value: sgst });
    if (igst > 0) totalsRows.push({ label: "IGST", value: igst });
    totalsRows.push({ label: "TOTAL", value: total, bold: true });

    const words = this.amountInWordsINR(total);

    const notesText = String(data.notes || (data.quote as any).notes || "").trim();
    const milestone = String(data.milestoneDescription || "").trim();
    const delivery = String(data.deliveryNotes || "").trim();

    // Notes: render as clean bullet-ish lines (not a single “A | B | C” blob)
    const notesLinesRaw: string[] = [];
    if (milestone) notesLinesRaw.push(`Milestone: ${milestone}`);
    if (delivery) notesLinesRaw.push(`Delivery: ${delivery}`);
    if (notesText) notesLinesRaw.push(`Notes: ${notesText}`);

    const termsRaw = String(data.termsAndConditions || "").trim();
    const termsLines = termsRaw ? termsRaw.split("\n").map((s) => s.trim()).filter(Boolean) : [];

    // Measure left heights
    doc.save();
    doc.font("Helvetica").fontSize(7.4);
    const wordsH = doc.heightOfString(words, { width: leftW - 16 });

    doc.font("Helvetica").fontSize(7.2);
    const measuredNotesLines: string[] = [];
    for (const nl of notesLinesRaw) {
      const wrapped = this.wrapTextLines(doc, nl, leftW - 16, 3);
      measuredNotesLines.push(...wrapped);
    }
    const notesH = measuredNotesLines.length ? measuredNotesLines.length * 10 : 0;

    const measuredTermsLines: string[] = [];
    for (const tl of termsLines) {
      const wrapped = this.wrapTextLines(doc, `• ${tl}`, leftW - 16, 4);
      measuredTermsLines.push(...wrapped);
    }
    const maxTermsLines = 6;
    const termsShown = measuredTermsLines.slice(0, maxTermsLines);
    const termsH = termsShown.length ? termsShown.length * 10 : 0;
    doc.restore();

    const leftH =
      10 + 14 + wordsH +
      (notesH ? 10 + notesH : 0) +
      (termsH ? 10 + termsH : 0) +
      10;

    const rowH = 16;
    const totalsTopPad = 22;
    const totalsBottomPad = 10;
    const taxLineH = 12;
    const totalsH = totalsTopPad + totalsRows.length * rowH + taxLineH + totalsBottomPad;

    const blockH = Math.max(leftH, totalsH);
    this.ensureSpace(doc, data, blockH + 10);

    const y0 = doc.y;

    // Left box
    this.box(doc, leftX, y0, leftW, blockH, { fill: "#FFFFFF" });
    this.label(doc, "Amount Chargeable (in words)", leftX + 8, y0 + 6);

    doc.font("Helvetica-Bold").fontSize(7.8).fillColor(this.INK);
    doc.text(words, leftX + 8, y0 + 20, { width: leftW - 16 });

    let ly = y0 + 20 + wordsH + 6;

    if (measuredNotesLines.length) {
      this.label(doc, "Notes", leftX + 8, ly);
      ly += 12;

      doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
      let ny = ly;
      for (const ln of measuredNotesLines.slice(0, 8)) {
        doc.text(this.truncateToWidth(doc, ln, leftW - 16), leftX + 8, ny, { width: leftW - 16 });
        ny += 10;
      }
      ly = ny + 2;
    }

    if (termsShown.length) {
      this.label(doc, "Terms & Conditions", leftX + 8, ly);
      ly += 12;

      doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
      let ty = ly;
      for (const ln of termsShown) {
        doc.text(this.truncateToWidth(doc, ln, leftW - 16), leftX + 8, ty, {
          width: leftW - 16,
          lineBreak: false,
        });
        ty += 10;
      }
    }

    // Right totals box
    this.box(doc, rightX, y0, rightW, blockH, { fill: "#FFFFFF" });
    this.label(doc, "Totals", rightX + 8, y0 + 6);

    const labelW = rightW * 0.55;
    const valW = rightW - 16 - labelW;

    let ry = y0 + 22;

    totalsRows.forEach((r) => {
      doc.font("Helvetica-Bold").fontSize(7.6).fillColor(this.INK);
      doc.text(r.label, rightX + 8, ry, { width: labelW, lineBreak: false });

      doc.font("Helvetica-Bold").fontSize(r.bold ? 9.0 : 8.0).fillColor(this.INK);
      const moneyStr = r.signed ? this.moneySigned(r.value) : this.money(r.value);
      doc.text(moneyStr, rightX + 8 + labelW, ry - (r.bold ? 1 : 0), {
        width: valW,
        align: "right",
        lineBreak: false,
      });

      ry += rowH;
    });

    // Tax summary line
    const taxBits: string[] = [];
    const nbsp = "\u00A0";
    taxBits.push(`Taxable: ${this.money(taxable).replace("Rs. ", "Rs." + nbsp)}`);
    if (cgst > 0) taxBits.push(`CGST: ${this.money(cgst).replace("Rs. ", "Rs." + nbsp)}`);
    if (sgst > 0) taxBits.push(`SGST: ${this.money(sgst).replace("Rs. ", "Rs." + nbsp)}`);
    if (igst > 0) taxBits.push(`IGST: ${this.money(igst).replace("Rs. ", "Rs." + nbsp)}`);

    doc.font("Helvetica").fontSize(6).fillColor(this.FAINT);
    const taxLine = this.truncateToWidth(doc, taxBits.join("  |  "), rightW - 16);
    doc.text(taxLine, rightX + 8, ry + 2, {
      width: rightW - 16,
      align: "right",
      lineBreak: false,
    });

    doc.y = y0 + blockH + 10;

    // Declaration + Bank + Signatures
    this.drawDeclarationBankAndSignatures(doc, data);
  }

  private static drawDeclarationBankAndSignatures(
    doc: InstanceType<typeof PDFDocument>,
    data: InvoicePdfData
  ) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;

    const needed = 150;
    this.ensureSpace(doc, data, needed);

    const y0 = doc.y;

    const gap = 10;
    const leftW = w * 0.56;
    const rightW = w - leftW - gap;

    const h = 86;

    this.box(doc, x, y0, leftW, h, { fill: "#FFFFFF" });
    this.box(doc, x + leftW + gap, y0, rightW, h, { fill: "#FFFFFF" });

    this.label(doc, "Declaration", x + 8, y0 + 6);
    doc.font("Helvetica").fontSize(7.4).fillColor(this.SUBTLE);
    doc.text(
      "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
      x + 8,
      y0 + 20,
      { width: leftW - 16 }
    );

    this.label(doc, "Company's Bank Details for Payment", x + leftW + gap + 8, y0 + 6);

    const bankLines: string[] = [];
    if (data.bankAccountName) bankLines.push(`A/c Name: ${data.bankAccountName}`);
    if (data.bankName) bankLines.push(`Bank: ${data.bankName}`);
    if (data.bankAccountNumber) bankLines.push(`A/c No: ${data.bankAccountNumber}`);
    if (data.bankIfscCode) bankLines.push(`IFSC: ${data.bankIfscCode}`);
    if (data.bankBranch) bankLines.push(`Branch: ${data.bankBranch}`);
    if (data.bankSwiftCode) bankLines.push(`SWIFT: ${data.bankSwiftCode}`);

    doc.font("Helvetica-Bold").fontSize(7.2).fillColor(this.INK);
    doc.text(bankLines.length ? bankLines.join("\n") : "-", x + leftW + gap + 8, y0 + 20, {
      width: rightW - 16,
    });

    const sigY = y0 + h + 10;
    const sigH = 62;

    this.ensureSpace(doc, data, sigH + 10);

    const colW = (w - gap) / 2;
    const leftSigX = x;
    const rightSigX = x + colW + gap;

    this.box(doc, leftSigX, sigY, colW, sigH, { fill: "#FFFFFF" });
    this.box(doc, rightSigX, sigY, colW, sigH, { fill: "#FFFFFF" });

    this.label(doc, "Client Acceptance", leftSigX + 8, sigY + 6);
    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    doc.text("Customer Seal & Signature", leftSigX + 8, sigY + 18, { width: colW - 16 });

    doc.save();
    doc.strokeColor(this.LINE).lineWidth(0.9);
    doc.moveTo(leftSigX + 8, sigY + sigH - 18).lineTo(leftSigX + colW - 8, sigY + sigH - 18).stroke();
    doc.restore();

    doc.font("Helvetica").fontSize(6.8).fillColor(this.FAINT);
    doc.text("Date:", leftSigX + 8, sigY + sigH - 14, { width: colW - 16 });

    this.label(doc, "For Company", rightSigX + 8, sigY + 6);
    const company = data.companyName || "AICERA";
    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(`For ${company}`, rightSigX + 8, sigY + 18, { width: colW - 16 });

    doc.save();
    doc.strokeColor(this.LINE).lineWidth(0.9);
    doc.moveTo(rightSigX + 8, sigY + sigH - 18).lineTo(rightSigX + colW - 8, sigY + sigH - 18).stroke();
    doc.restore();

    doc.font("Helvetica").fontSize(6.8).fillColor(this.FAINT);
    doc.text("Authorised Signatory", rightSigX + 8, sigY + sigH - 14, { width: colW - 16 });

    doc.y = sigY + sigH + 10;

    // Computer generated note (kept)
    const oldY = doc.y;
    const noteY = this.bottomY() - 24;

    doc.save();
    doc.font("Helvetica").fontSize(7.0).fillColor(this.FAINT);
    doc.text("This is a Computer Generated Invoice", this.MARGIN_LEFT, noteY, {
      width: this.CONTENT_WIDTH,
      align: "center",
      lineBreak: false,
    });
    doc.restore();

    doc.y = oldY;
  }

  // ---------------------------
  // Serial Appendix
  // ---------------------------
  private static drawSerialAppendix(
    doc: InstanceType<typeof PDFDocument>,
    data: InvoicePdfData,
    appendix: SerialAppendixItem[]
  ) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(this.INK);
    doc.text("Serial Numbers Appendix", this.MARGIN_LEFT, doc.y);

    doc.font("Helvetica").fontSize(8).fillColor(this.SUBTLE);
    doc.text("Full serial lists are provided here to keep invoice pages clean.", this.MARGIN_LEFT, doc.y + 14, {
      width: this.CONTENT_WIDTH,
    });

    doc.y += 34;
    this.hr(doc);
    doc.y += 10;

    const colGap = 18;
    const colW = (this.CONTENT_WIDTH - colGap) / 2;
    const leftX = this.MARGIN_LEFT;
    const rightX = this.MARGIN_LEFT + colW + colGap;

    let col = 0;
    let x = leftX;
    let y = doc.y;
    let colTop = doc.y;

    const nextColumnOrPage = (need: number) => {
      if (y + need <= this.bottomY()) return;

      if (col === 0) {
        col = 1;
        x = rightX;
        y = colTop;
      } else {
        doc.addPage();
        this.drawHeader(doc, data);

        doc.font("Helvetica-Bold").fontSize(10).fillColor(this.INK);
        doc.text("Serial Numbers Appendix (cont.)", this.MARGIN_LEFT, doc.y);

        doc.y += 18;
        this.hr(doc);
        doc.y += 10;

        col = 0;
        x = leftX;
        colTop = doc.y;
        y = colTop;
      }
    };

    appendix.forEach((a) => {
      const heading = `Item ${a.itemIndex}: ${a.description}`;
      const serialText = a.serials.join(", ");

      doc.save();
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(this.INK);
      const h1 = doc.heightOfString(heading, { width: colW });

      doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
      const h2 = doc.heightOfString(serialText, { width: colW });
      doc.restore();

      nextColumnOrPage(h1 + h2 + 16);

      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(this.INK);
      doc.text(heading, x, y, { width: colW });
      y += h1 + 3;

      doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
      doc.text(serialText, x, y, { width: colW });
      y += h2 + 8;

      doc.save();
      doc.strokeColor(this.LINE).lineWidth(0.7);
      doc.moveTo(x, y).lineTo(x + colW, y).stroke();
      doc.restore();

      y += 8;
    });

    doc.y = Math.max(doc.y, y);
  }

  // ---------------------------
  // Footer
  // ---------------------------
  private static drawFooter(doc: InstanceType<typeof PDFDocument>, page: number, total: number) {
    const oldY = doc.y;
    const y = this.bottomY() - 10;

    doc.save();
    doc.font("Helvetica").fontSize(7).fillColor(this.FAINT);
    doc.text(`Page ${page} of ${total}`, this.MARGIN_LEFT, y, {
      width: this.CONTENT_WIDTH,
      align: "center",
      lineBreak: false,
    });
    doc.restore();

    doc.y = oldY;
  }

  // ---------------------------
  // Serials utilities
  // ---------------------------
  private static parseSerialNumbers(raw: any): string[] {
    if (!raw) return [];
    try {
      if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);

      if (typeof raw === "string") {
        const t = raw.trim();
        if (!t) return [];

        if (t.startsWith("[") && t.endsWith("]")) {
          const arr = JSON.parse(t);
          if (Array.isArray(arr)) return arr.map(String).map((s) => s.trim()).filter(Boolean);
        }

        return t
          .split(/,|\n|;/g)
          .map((s) => s.trim())
          .filter(Boolean);
      }

      return [];
    } catch {
      return [];
    }
  }

  private static serialInlineSummary(serials: string[], hasAppendix: boolean): string {
    if (!serials.length) return "";

    if (hasAppendix) {
      const head = serials.slice(0, Math.min(4, serials.length));
      const remaining = Math.max(0, serials.length - head.length);
      return remaining > 0
        ? `Serial#: ${head.join(", ")} (+${remaining} more — see appendix)`
        : `Serial#: ${head.join(", ")}`;
    }

    if (serials.length <= this.SERIAL_INLINE_LIMIT) return `Serial#: ${serials.join(", ")}`;

    const head = serials.slice(0, 4);
    const tail = serials.slice(-2);
    const remaining = serials.length - (head.length + tail.length);

    return `Serial#: ${head.join(", ")}, …, ${tail.join(", ")} (+${remaining} more)`;
  }

  // ---------------------------
  // Amount in words (INR)
  // ---------------------------
  private static amountInWordsINR(amount: number): string {
    const n = Number(amount) || 0;
    const rupees = Math.floor(n);
    const paise = Math.round((n - rupees) * 100);

    const r = this.numberToWordsIndian(rupees);
    const p = paise > 0 ? this.numberToWordsIndian(paise) : "";

    // FIX: include "Rupees" so the sentence reads correctly.
    if (paise > 0) return `INR ${r} Rupees and ${p} Paise Only`;
    return `INR ${r} Rupees Only`;
  }

  private static numberToWordsIndian(num: number): string {
    const n = Math.floor(Math.abs(num));
    if (n === 0) return "Zero";

    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const twoDigits = (x: number) => {
      if (x < 20) return ones[x];
      const t = Math.floor(x / 10);
      const o = x % 10;
      return `${tens[t]}${o ? " " + ones[o] : ""}`.trim();
    };

    const threeDigits = (x: number) => {
      const h = Math.floor(x / 100);
      const r = x % 100;
      let s = "";
      if (h) s += `${ones[h]} Hundred`;
      if (r) s += `${h ? " " : ""}${twoDigits(r)}`;
      return s.trim();
    };

    const parts: string[] = [];

    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n / 100000) % 100);
    const thousand = Math.floor((n / 1000) % 100);
    const hundredPart = n % 1000;

    if (crore) parts.push(`${twoDigits(crore)} Crore`);
    if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
    if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
    if (hundredPart) parts.push(threeDigits(hundredPart));

    return parts.join(" ").replace(/\s+/g, " ").trim();
  }
}