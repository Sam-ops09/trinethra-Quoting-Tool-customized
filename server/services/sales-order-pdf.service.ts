// server/services/sales-order-pdf.service.ts
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import type { Quote, QuoteItem, Client } from "@shared/schema";
import { isFeatureEnabled } from "@shared/feature-flags";
import { prepareLogo, drawLogo } from "./pdf-helpers";
import { formatCurrency, formatCurrencyPdf } from "./currency-helper";

export interface SalesOrderPdfData {
  quote: Quote;
  client: Client;
  items: any[];
  currency?: string;

  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  companyGSTIN: string;
  companyLogo?: string;

  companyDetails: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    gstin: string;
  };

  orderNumber: string;
  orderDate: Date;
  expectedDeliveryDate?: Date;

  // Financials
  subtotal: string | number;
  discount: string | number;
  cgst: string | number;
  sgst: string | number;
  igst: string | number;
  shippingCharges: string | number;
  total: string | number;

  deliveryNotes?: string;
  notes?: string;
  termsAndConditions?: string;
  bomSection?: string | null;

  // Optional for SO
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    ifsc?: string;
    branch?: string;
    swift?: string;
    upi?: string;
  };
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

export class SalesOrderPDFService {
  // A4 points
  private static readonly PAGE_WIDTH = 595.28;
  private static readonly PAGE_HEIGHT = 841.89;

  // Compact margins
  private static readonly MARGIN_LEFT = 40;
  private static readonly MARGIN_RIGHT = 40;
  private static readonly MARGIN_TOP = 40;
  private static readonly MARGIN_BOTTOM = 40;

  private static readonly CONTENT_WIDTH =
    SalesOrderPDFService.PAGE_WIDTH -
    SalesOrderPDFService.MARGIN_LEFT -
    SalesOrderPDFService.MARGIN_RIGHT;

  // Palette
  private static readonly INK = "#111827";
  private static readonly SUBTLE = "#4B5563";
  private static readonly FAINT = "#6B7280";
  private static readonly LINE = "#D1D5DB";
  private static readonly SOFT = "#F3F4F6";



  // Serials
  private static readonly SERIAL_INLINE_LIMIT = 8;
  private static readonly SERIAL_APPENDIX_THRESHOLD = 12;

  // ---------------------------
  // Public API
  // ---------------------------
  static async generateSalesOrderPDF(data: SalesOrderPdfData, res: NodeJS.WritableStream): Promise<void> {
    if (!isFeatureEnabled('sales_orders_module')) {
      throw new Error("Sales Orders module is disabled");
    }

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      bufferPages: true,
    });

    doc.pipe(res);

    // Async preparation
    await this.prepareAssets(doc, data);

    // Header + top blocks (IMPORTANT: this was missing on page 1 before)
    this.drawHeader(doc, data);
    this.drawTopBlocks(doc, data);

    // Items (return appendix)
    const appendix = this.drawItemsTable(doc, data);

    // Totals/terms/bank/signatures
    this.drawFinalSections(doc, data);

    // Serial appendix (if needed)
    if (appendix.length) {
      doc.addPage();
      this.drawHeader(doc, data);
      this.drawSerialAppendix(doc, data, appendix);
    }

    // Footer loop
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      this.drawFooter(doc, i + 1, range.count);
    }

    doc.end();
  }

  // Preload assets async
  private static async prepareAssets(doc: PDFKit.PDFDocument, data: SalesOrderPdfData) {
      // Fonts registration
      const fontDir = path.join(process.cwd(), "server", "pdf", "fonts");
      const regularPath = path.join(fontDir, "Roboto-Regular.ttf");
      const boldPath = path.join(fontDir, "Roboto-Bold.ttf");

      try {
        if (fs.existsSync(regularPath) && fs.existsSync(boldPath)) {
            doc.registerFont("Helvetica", regularPath);
            doc.registerFont("Helvetica-Bold", boldPath);
        }
      } catch (e) {
        // Ignore errors, fallback is automatic
      }

      // Logo (using shared helper)
      const { logo, mimeType } = await prepareLogo(data.companyLogo);
      (data as any).resolvedLogo = logo;
      (data as any).logoMimeType = mimeType;
  }

  // ---------------------------
  // Geometry helpers
  // ---------------------------
  private static bottomY(): number {
    return this.PAGE_HEIGHT - this.MARGIN_BOTTOM;
  }

  private static ensureSpace(
    doc: InstanceType<typeof PDFDocument>,
    data: SalesOrderPdfData,
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

  private static money(v: number | string, currency = "INR"): string {
    return formatCurrencyPdf(v, currency);
  }

  /** For totals rows (discount etc.) */
  private static moneySigned(v: number | string, currency = "INR"): string {
    const n = Number(v) || 0;
    if (n < 0) {
      return "-" + formatCurrencyPdf(Math.abs(n), currency);
    }
    return formatCurrencyPdf(n, currency);
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

    // Quick check
    if (doc.widthOfString(t) <= width) return [t];

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
  // Header (compact + professional)
  // ---------------------------
  private static drawHeader(doc: InstanceType<typeof PDFDocument>, data: SalesOrderPdfData) {
    const x = this.MARGIN_LEFT;
    const topY = this.MARGIN_TOP;

    // Right info box
    const rightColW = 160;
    const rightColX = this.MARGIN_LEFT + this.CONTENT_WIDTH - rightColW;
    const infoY = topY + 45;

    this.box(doc, rightColX, infoY, rightColW, 60, {
      fill: "#F8FAFC",
      stroke: this.LINE,
    });

    const labelX = rightColX + 10;
    const valX = rightColX + 80;
    let cY = infoY + 10;

    this.label(doc, "Order #", labelX, cY);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(this.INK);
    doc.text(data.orderNumber, valX, cY);
    cY += 16;

    this.label(doc, "Date", labelX, cY);
    doc.font("Helvetica").fontSize(9).fillColor(this.INK);
    doc.text(new Date(data.orderDate).toLocaleDateString("en-IN"), valX, cY);
    cY += 16;

    if (data.expectedDeliveryDate) {
      this.label(doc, "Due Date", labelX, cY);
      doc.font("Helvetica").fontSize(9).fillColor(this.INK);
      doc.text(new Date(data.expectedDeliveryDate).toLocaleDateString("en-IN"), valX, cY);
    }

    // Title
    doc.font("Helvetica-Bold").fontSize(16).fillColor(this.INK);
    doc.text("SALES ORDER", this.MARGIN_LEFT, topY, {
      width: this.CONTENT_WIDTH,
      align: "right",
    });

    // Left company
    const leftMaxW = this.CONTENT_WIDTH - rightColW - 20;

    // Logo
    let logoBottomY = topY;
    
    // Use resolved logo
    const logoPath = (data as any).resolvedLogo;
    const mimeType = (data as any).logoMimeType || "";
    let logoPrinted = false;
    const logoSize = 50;
    
    if (logoPath) {
        const drawn = drawLogo(doc, logoPath, mimeType, x, topY, logoSize);
        logoPrinted = drawn;
    }
    
    if (logoPrinted) logoBottomY = topY + logoSize + 10;

    let currentLeftY = Math.max(logoBottomY, topY + 10);

    doc.font("Helvetica-Bold").fontSize(14).fillColor(this.INK);
    doc.text(data.companyName, x, currentLeftY, { width: leftMaxW });
    currentLeftY = doc.y + 4;

    doc.font("Helvetica").fontSize(9).fillColor(this.SUBTLE);
    doc.text(this.normalizeAddress(data.companyAddress, 3), x, currentLeftY, {
      width: leftMaxW,
    });
    currentLeftY = doc.y + 6;

    const contactParts: string[] = [];
    if (this.isValidPhone(data.companyPhone)) contactParts.push(`Phone: ${data.companyPhone}`);
    if (this.isValidEmail(data.companyEmail)) contactParts.push(`Email: ${data.companyEmail}`);
    if (data.companyWebsite) contactParts.push(`Web: ${data.companyWebsite}`);
    if (this.isValidGSTIN(data.companyGSTIN)) contactParts.push(`GSTIN: ${data.companyGSTIN}`);

    if (contactParts.length > 0) {
      doc.text(contactParts.join(" | "), x, currentLeftY, { width: leftMaxW });
      currentLeftY = doc.y;
    }

    const contentBottom = Math.max(currentLeftY, infoY + 60);
    doc.y = contentBottom + 15;
    this.hr(doc);
    doc.y += 15;
  }

  // ---------------------------
  // Top blocks: Bill/Ship + meta (grid)
  // ---------------------------
  private static drawTopBlocks(doc: InstanceType<typeof PDFDocument>, data: SalesOrderPdfData) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;

    const gap = 10;
    const leftW = w * 0.56;
    const rightW = w - leftW - gap;

    let startY = doc.y;

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

    // Measure
    doc.font("Helvetica-Bold").fontSize(8.6);
    const cNameH = doc.heightOfString(clientName, { width: leftW - 16 });

    doc.font("Helvetica").fontSize(7.2);
    const shipAddrH = doc.heightOfString(shipAddr, { width: leftW - 16 });
    const billAddrH = doc.heightOfString(billAddr, { width: leftW - 16 });

    const billParts: string[] = [];
    if (this.isValidPhone(clientPhone)) billParts.push(`Ph: ${String(clientPhone).trim()}`);
    if (this.isValidEmail(clientEmail)) billParts.push(`Email: ${String(clientEmail).trim()}`);
    if (this.isValidGSTIN(clientGSTIN))
      billParts.push(`GSTIN: ${String(clientGSTIN).trim().toUpperCase()}`);

    doc.font("Helvetica").fontSize(7.0);
    const contactText = billParts.join("  |  ");
    const contactH = billParts.length ? doc.heightOfString(contactText, { width: leftW - 16 }) : 0;

    const shipBlockInnerH = 14 + cNameH + 2 + shipAddrH;
    const shipBlockFullH = 6 + shipBlockInnerH + 6;

    const billBlockInnerH = 14 + cNameH + 2 + billAddrH;
    const billBlockFullH = 6 + billBlockInnerH + (contactH ? 8 + contactH : 0) + 6;

    const leftTotalH = shipBlockFullH + billBlockFullH;
    const rightTotalH = 20 + 5 * 18 + 10;

    const h = Math.max(leftTotalH, rightTotalH, 140);

    this.ensureSpace(doc, data, h + 10);

    // Left box
    this.box(doc, leftX, startY2, leftW, h, { fill: "#FFFFFF" });

    // Ship To
    doc.font("Helvetica-Bold").fontSize(8.2).fillColor(this.INK);
    doc.text("Consignee (Ship To)", leftX + 8, startY2 + 6, { width: leftW - 16 });

    let cy = startY2 + 20;
    doc.font("Helvetica-Bold").fontSize(8.6).fillColor(this.INK);
    doc.text(data.client.name || "-", leftX + 8, cy, { width: leftW - 16, lineBreak: true });
    cy += cNameH + 2;

    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(shipAddr, leftX + 8, cy, { width: leftW - 16 });

    // Divider clamp
    const minBillHeight = 60;
    const idealSplitY = startY2 + shipBlockFullH;
    const maxSplitY = startY2 + h - minBillHeight;
    const splitY = Math.min(idealSplitY, maxSplitY);

    doc.save();
    doc.strokeColor(this.LINE).lineWidth(0.8);
    doc.moveTo(leftX, splitY).lineTo(leftX + leftW, splitY).stroke();
    doc.restore();

    // Bill To
    const by = splitY;
    doc.font("Helvetica-Bold").fontSize(8.2).fillColor(this.INK);
    doc.text("Buyer (Bill To)", leftX + 8, by + 6, { width: leftW - 16 });

    cy = by + 20;
    doc.font("Helvetica-Bold").fontSize(8.6).fillColor(this.INK);
    doc.text(data.client.name || "-", leftX + 8, cy, { width: leftW - 16, lineBreak: true });
    cy += cNameH + 2;

    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(billAddr, leftX + 8, cy, { width: leftW - 16 });

    // Contact pinned near bottom (kept as-is from your logic)
    if (contactH > 0) {
      const contactY = startY2 + h - contactH - 6;
      if (contactY > cy + 10) {
        doc.font("Helvetica").fontSize(7.0).fillColor(this.SUBTLE);
        doc.text(contactText, leftX + 8, contactY, { width: leftW - 16 });
      }
    }

    // Right meta box
    this.box(doc, rightX, startY2, rightW, h, { fill: "#FFFFFF" });

    const kvRowH = h / 5;
    const pad = 8;
    const labelW = Math.min(88, rightW * 0.45);
    const valW = rightW - pad * 2 - labelW;

    const row = (i: number, label: string, value: string) => {
      const yy = startY2 + i * kvRowH;

      if (i < 4) {
        doc.save();
        doc.strokeColor(this.LINE).lineWidth(0.6);
        doc.moveTo(rightX, yy + kvRowH).lineTo(rightX + rightW, yy + kvRowH).stroke();
        doc.restore();
      }

      doc.font("Helvetica").fontSize(7.0).fillColor(this.SUBTLE);
      doc.text(label, rightX + pad, yy + kvRowH / 2 - 4, { width: labelW, lineBreak: false });

      doc.font("Helvetica-Bold").fontSize(7.6).fillColor(this.INK);
      const v = value || "-";
      doc.text(this.truncateToWidth(doc, v, valW), rightX + pad + labelW, yy + kvRowH / 2 - 4, {
        width: valW,
        align: "right",
        lineBreak: false,
      });
    };

    const orderDate = this.safeDate(data.orderDate);
    const expectedDelivery = data.expectedDeliveryDate ? this.safeDate(data.expectedDeliveryDate) : "-";
    const quoteNo = String((data.quote as any)?.quoteNumber || "-");
    const preparedBy = String(data.companyDetails?.name || "-");
    const deliveryNotesStr = String(data.deliveryNotes || "").trim();

    row(0, "Order Date", orderDate);
    row(1, "Expected Delivery", expectedDelivery);
    row(2, "Quote No.", quoteNo);
    row(3, "Prepared By", preparedBy);
    row(4, "Delivery Note", deliveryNotesStr);

    doc.y = startY2 + h + 10;
  }

  // ---------------------------
  // Items Table (paginates) - RETURNS appendix
  // ---------------------------
  private static drawItemsTable(
    doc: InstanceType<typeof PDFDocument>,
    data: SalesOrderPdfData
  ): SerialAppendixItem[] {
    doc.y += 20;

    // -- Table Header --
    let y = doc.y;
    const x0 = this.MARGIN_LEFT;
    const appendix: SerialAppendixItem[] = [];

    const tableW = this.CONTENT_WIDTH;

    // Column plan
    // Column plan - Compact to fit 515.28pt
    const col = {
      sn: 26,
      desc: 215, // will be recalc'd but this is a target
      hsn: 54,
      qty: 36,
      unit: 36,
      rate: 64,
      amount: 84, // ensures space for typical totals
    };

    const fixed = col.sn + col.hsn + col.qty + col.unit + col.rate;
    // Remainder for desc + amount
    const available = tableW - fixed; 
    
    // Give amount at least 84, but stretch if plenty of space? 
    // Actually better to fix amount and give rest to desc for long text.
    col.amount = 84;
    col.desc = available - col.amount;

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

    const drawHeader = (yy: number) => {
      this.box(doc, x0, yy, tableW, headerH, {
        fill: this.SOFT,
        stroke: this.LINE,
        lineWidth: 0.9,
      });

      doc.save();
      doc.strokeColor(this.LINE).lineWidth(0.8);
      [cx.desc, cx.hsn, cx.qty, cx.unit, cx.rate, cx.amount].forEach((vx) => {
        doc.moveTo(vx, yy).lineTo(vx, yy + headerH).stroke();
      });
      doc.restore();

      doc.font("Helvetica").fontSize(7.0).fillColor(this.SUBTLE);

      const put = (
        t: string,
        xx: number,
        ww: number,
        align: PDFKit.Mixins.TextOptions["align"]
      ) => {
        doc.text(t.toUpperCase(), xx, yy + 7, {
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

    y = doc.y;
    drawHeader(y);
    y += headerH;

    const items = data.items || [];
    if (items.length === 0) {
      this.box(doc, x0, y, tableW, 40, { fill: "#FFFFFF" });
      doc.font("Helvetica-Bold").fontSize(8).fillColor(this.SUBTLE);
      doc.text("No items.", x0, y + 14, { width: tableW, align: "center" });
      doc.y = y + 50;
      return appendix;
    }

    for (let idx = 0; idx < items.length; idx++) {
      const it = items[idx];

      const descRaw = String((it as any).description ?? "").trim();
      const desc = descRaw || "-";

      const qty = Number((it as any).quantity ?? 0);
      const unit = String((it as any).unit ?? "pcs");
      const rate = Number((it as any).unitPrice ?? 0);
      const amount = Number((it as any).subtotal ?? qty * rate);
      const currency = data.currency || "INR";

      const hsnSac = String((it as any).hsnSac ?? (it as any).hsn_sac ?? "").trim() || "-";

      const serials = this.parseSerialNumbers((it as any).serialNumbers);
      const needsAppendix = serials.length > this.SERIAL_APPENDIX_THRESHOLD;

      const serialInline = serials.length ? this.serialInlineSummary(serials, needsAppendix) : "";

      // measure row height
      doc.save();
      doc.font("Helvetica").fontSize(8.0).fillColor(this.INK);

      const descLinesAll = this.wrapTextLines(doc, desc, col.desc - 12, 30);
      const descLines = descLinesAll;
      const descH = descLines.length * 11;

      let serialLines: string[] = [];
      let serialH = 0;
      if (serialInline) {
        doc.font("Helvetica").fontSize(6.8).fillColor(this.SUBTLE);
        const sAll = this.wrapTextLines(doc, serialInline, col.desc - 12, 10);
        serialLines = sAll;
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

      // content
      const padY = 6;

      doc.font("Helvetica").fontSize(8).fillColor(this.INK);
      doc.text(String(idx + 1), cx.sn, y + padY, {
        width: col.sn,
        align: "center",
        lineBreak: false,
      });

      // description
      let dy = y + padY;
      doc.text(descLines[0] || "", cx.desc + 6, dy, { width: col.desc - 12, lineBreak: false });
      dy += 11;
      if (descLines[1]) {
        doc.text(descLines[1], cx.desc + 6, dy, { width: col.desc - 12, lineBreak: false });
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
      doc.text(this.money(rate, data.currency), cx.rate, y + padY, {
        width: col.rate - 8,
        align: "right",
        lineBreak: false,
      });
      doc.text(this.money(amount, data.currency), cx.amount, y + padY, {
        width: col.amount - 8,
        align: "right",
        lineBreak: false,
      });

      // bottom line
      doc.save();
      doc.strokeColor(this.LINE).lineWidth(0.8);
      doc.moveTo(x0, y + rowH).lineTo(cx.right, y + rowH).stroke();
      doc.restore();

      if (needsAppendix) appendix.push({ itemIndex: idx + 1, description: desc, serials });

      y += rowH;
    }

    doc.y = y + 8;
    return appendix;
  }

  // ---------------------------
  // Final sections
  // ---------------------------
  private static drawFinalSections(doc: InstanceType<typeof PDFDocument>, data: SalesOrderPdfData) {
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

    const taxable = Math.max(0, subtotal - Math.max(0, discount) + Math.max(0, shipping));

    const totalsRows: Array<{ label: string; value: number; bold?: boolean; signed?: boolean }> = [
      { label: "Subtotal", value: subtotal },
    ];

    // If you want discount shown, uncomment:
    // if (discount > 0) totalsRows.push({ label: "Discount", value: -discount, signed: true });

    if (shipping > 0) totalsRows.push({ label: "Shipping/Handling", value: shipping });
    if (cgst > 0) totalsRows.push({ label: "CGST", value: cgst });
    if (sgst > 0) totalsRows.push({ label: "SGST", value: sgst });
    if (igst > 0) totalsRows.push({ label: "IGST", value: igst });
    totalsRows.push({ label: "TOTAL", value: total, bold: true });

    const words = this.amountInWords(total, data.currency);
    const notesText = String(data.notes || (data.quote as any).notes || "").trim();
    const delivery = String(data.deliveryNotes || "").trim();

    const termsRaw = String(data.termsAndConditions || "").trim();
    const termsLines = termsRaw ? termsRaw.split("\n").map((s) => s.trim()).filter(Boolean) : [];
    const termsText = termsLines.join("  •  ");
    const maxTermsLines = 4;

    // Measure left heights
    doc.save();
    doc.font("Helvetica").fontSize(7.4);
    const wordsH = doc.heightOfString(words, { width: leftW - 16 });
    const notesBlock = [delivery, notesText].filter(Boolean).join(" | ");
    const notesH = notesBlock ? doc.heightOfString(notesBlock, { width: leftW - 16 }) : 0;

    doc.font("Helvetica").fontSize(7.2);
    const wrappedTerms = termsText ? this.wrapTextLines(doc, termsText, leftW - 16, 50) : [];
    const termsShown = wrappedTerms.slice(0, maxTermsLines);
    const termsH = termsShown.length ? termsShown.length * 10 : 0;
    doc.restore();

    const leftH = 10 + 14 + wordsH + (notesH ? 10 + notesH : 0) + (termsH ? 10 + termsH : 0) + 10;

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

    if (notesBlock) {
      this.label(doc, "Notes", leftX + 8, ly);
      ly += 12;
      doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
      doc.text(this.truncateToWidth(doc, notesBlock, leftW - 16), leftX + 8, ly, {
        width: leftW - 16,
      });
      ly += notesH + 6;
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
      const moneyStr = r.signed ? this.moneySigned(r.value, data.currency) : this.money(r.value, data.currency);
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
    taxBits.push(`Taxable: ${this.money(taxable, data.currency).replace("Rs. ", "Rs." + nbsp)}`);
    if (cgst > 0) taxBits.push(`CGST: ${this.money(cgst, data.currency).replace("Rs. ", "Rs." + nbsp)}`);
    if (sgst > 0) taxBits.push(`SGST: ${this.money(sgst, data.currency).replace("Rs. ", "Rs." + nbsp)}`);
    if (igst > 0) taxBits.push(`IGST: ${this.money(igst, data.currency).replace("Rs. ", "Rs." + nbsp)}`);

    doc.font("Helvetica").fontSize(6).fillColor(this.FAINT);
    const taxLine = this.truncateToWidth(doc, taxBits.join("  |  "), rightW - 16);
    doc.text(taxLine, rightX + 8, ry + 2, { width: rightW - 16, align: "right", lineBreak: false });

    doc.y = y0 + blockH + 10;

    // Terms continuation
    if (wrappedTerms.length > maxTermsLines) {
      doc.addPage();
      this.drawHeader(doc, data);

      doc.font("Helvetica-Bold").fontSize(9.2).fillColor(this.INK);
      doc.text("Terms & Conditions (cont.)", this.MARGIN_LEFT, doc.y);
      doc.y += 8;

      const cont = wrappedTerms.slice(maxTermsLines);
      doc.font("Helvetica").fontSize(8).fillColor(this.SUBTLE);

      const colW = this.CONTENT_WIDTH;
      const startY = doc.y;
      const pad = 10;
      const boxH = Math.min(520, this.bottomY() - startY - 40);

      this.box(doc, this.MARGIN_LEFT, startY, colW, boxH, { fill: "#FFFFFF" });
      let yy = startY + pad;

      for (const ln of cont) {
        if (yy + 11 > startY + boxH - pad) break;
        doc.text(ln, this.MARGIN_LEFT + pad, yy, { width: colW - pad * 2 });
        yy += 11;
      }

      doc.y = startY + boxH + 12;
    }

    this.drawDeclarationBankAndSignatures(doc, data);
  }

  private static drawDeclarationBankAndSignatures(
    doc: InstanceType<typeof PDFDocument>,
    data: SalesOrderPdfData
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

    // Declaration (fixed wording for Sales Order)
    this.label(doc, "Declaration", x + 8, y0 + 6);
    doc.font("Helvetica").fontSize(7.4).fillColor(this.SUBTLE);
    doc.text(
      "We declare that this sales order shows the actual price of the goods described and that all particulars are true and correct.",
      x + 8,
      y0 + 20,
      { width: leftW - 16 }
    );

    // Bank details
    this.label(doc, "Company's Bank Details for Payment", x + leftW + gap + 8, y0 + 6);

    const bankLines: string[] = [];
    if (data.bankAccountName) bankLines.push(`A/c Name: ${data.bankAccountName}`);
    if (data.bankName) bankLines.push(`Bank: ${data.bankName}`);
    if (data.bankAccountNumber) bankLines.push(`A/c No: ${data.bankAccountNumber}`);
    if (data.bankIfscCode) bankLines.push(`IFSC: ${data.bankIfscCode}`);
    if (data.bankBranch) bankLines.push(`Branch: ${data.bankBranch}`);
    if (data.bankSwiftCode) bankLines.push(`SWIFT: ${data.bankSwiftCode}`);

    doc.font("Helvetica-Bold").fontSize(7.2).fillColor(this.INK);

    const bankLinesText = bankLines.length ? bankLines.join("\n") : "-";
    const bankH = doc.heightOfString(bankLinesText, { width: rightW - 16 }) + 30;

    const finalH = Math.max(h, bankH, 86);

    // Redraw boxes with final height
    this.box(doc, x, y0, leftW, finalH, { fill: "#FFFFFF" });
    this.box(doc, x + leftW + gap, y0, rightW, finalH, { fill: "#FFFFFF" });

    // Re-draw declaration
    this.label(doc, "Declaration", x + 8, y0 + 6);
    doc.font("Helvetica").fontSize(7.4).fillColor(this.SUBTLE);
    doc.text(
      "We declare that this sales order shows the actual price of the goods described and that all particulars are true and correct.",
      x + 8,
      y0 + 20,
      { width: leftW - 16 }
    );

    // Re-draw bank box content
    this.label(doc, "Company's Bank Details for Payment", x + leftW + gap + 8, y0 + 6);
    doc.font("Helvetica-Bold").fontSize(7.2).fillColor(this.INK);
    doc.text(bankLinesText, x + leftW + gap + 8, y0 + 20, { width: rightW - 16 });

    const sigY = y0 + finalH + 10;

    // Signatures
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
    doc
      .moveTo(leftSigX + 8, sigY + sigH - 18)
      .lineTo(leftSigX + colW - 8, sigY + sigH - 18)
      .stroke();
    doc.restore();
    doc.font("Helvetica").fontSize(6.8).fillColor(this.FAINT);
    doc.text("Date:", leftSigX + 8, sigY + sigH - 14, { width: colW - 16 });

    this.label(doc, "For Company", rightSigX + 8, sigY + 6);
    const company = data.companyName || "AICERA";
    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(`For ${company}`, rightSigX + 8, sigY + 18, { width: colW - 16 });

    doc.save();
    doc.strokeColor(this.LINE).lineWidth(0.9);
    doc
      .moveTo(rightSigX + 8, sigY + sigH - 18)
      .lineTo(rightSigX + colW - 8, sigY + sigH - 18)
      .stroke();
    doc.restore();
    doc.font("Helvetica").fontSize(6.8).fillColor(this.FAINT);
    doc.text("Authorised Signatory", rightSigX + 8, sigY + sigH - 14, { width: colW - 16 });

    doc.y = sigY + sigH + 10;

    // Computer generated note
    const oldY = doc.y;
    const noteY = this.bottomY() - 24;

    doc.save();
    doc.font("Helvetica").fontSize(7.0).fillColor(this.FAINT);
    doc.text("This is a Computer Generated Sales Order", this.MARGIN_LEFT, noteY, {
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
    data: SalesOrderPdfData,
    appendix: SerialAppendixItem[]
  ) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(this.INK);
    doc.text("Serial Numbers Appendix", this.MARGIN_LEFT, doc.y);

    doc.font("Helvetica").fontSize(8).fillColor(this.SUBTLE);
    doc.text("Full serial lists are provided here to keep sales order pages clean.", this.MARGIN_LEFT, doc.y + 14, {
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
  // Footer (inside margins; does not mutate doc.y)
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
  // ---------------------------
  // Amount in words (Dynamic Currency)
  // ---------------------------
  private static amountInWords(amount: number, currency = "INR"): string {
    const isINR = currency.toUpperCase() === "INR";
    const n = Number(amount) || 0;
    
    // Split integer and decimal parts
    const integerPart = Math.floor(Math.abs(n));
    const decimalPart = Math.round((Math.abs(n) - integerPart) * 100);

    let mainText = "";
    if (isINR) {
      mainText = this.numberToWordsIndian(integerPart);
    } else {
      mainText = this.numberToWordsInternational(integerPart);
    }

    let decimalText = "";
    if (decimalPart > 0) {
      if (isINR) {
        decimalText = ` and ${this.numberToWordsIndian(decimalPart)} Paise`;
      } else {
        // Generic decimal handling (cents)
        decimalText = ` and ${this.numberToWordsInternational(decimalPart)} Cents`;
      }
    }

    return `${currency} ${mainText}${decimalText} Only`;
  }

  // Indian Numbering System (Lakhs/Crores)
  private static numberToWordsIndian(num: number): string {
    const n = Math.floor(Math.abs(num));
    if (n === 0) return "Zero";

    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
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

  // International Numbering System (Millions/Billions)
  private static numberToWordsInternational(num: number): string {
    const n = Math.floor(Math.abs(num));
    if (n === 0) return "Zero";

    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
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
    const billion = Math.floor(n / 1000000000);
    const million = Math.floor((n / 1000000) % 1000);
    const thousand = Math.floor((n / 1000) % 1000);
    const hundredPart = n % 1000;

    if (billion) parts.push(`${threeDigits(billion)} Billion`);
    if (million) parts.push(`${threeDigits(million)} Million`);
    if (thousand) parts.push(`${threeDigits(thousand)} Thousand`);
    if (hundredPart) parts.push(threeDigits(hundredPart));

    return parts.join(" ").replace(/\s+/g, " ").trim();
  }
}