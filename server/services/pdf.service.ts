// server/pdf/PDFService.ts
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import type { Quote, QuoteItem, Client } from "@shared/schema";
import { getTheme, getSuggestedTheme, type PDFTheme } from "./pdf-themes";
import { prepareLogo, drawLogo } from "./pdf-helpers";
import { formatCurrency, formatCurrencyPdf } from "./currency-helper";

export interface QuoteWithDetails {
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
  preparedByEmail?: string;

  abstract?: string;
  theme?: string;

  declarationText?: string;

  bankDetails?: {
    accountName?: string;
    bankName?: string;
    accountNumber?: string;
    ifsc?: string;
    branch?: string;
    swift?: string;
    upi?: string;
  };

  clientAcceptanceLabel?: string;
}

type Doc = InstanceType<typeof PDFDocument>;

export class PDFService {
  // ===== A4 =====
  private static readonly PAGE_WIDTH = 595.28;
  private static readonly PAGE_HEIGHT = 841.89;

  // ===== Compact margins =====
  private static readonly MARGIN_LEFT = 28;
  private static readonly MARGIN_RIGHT = 28;
  private static readonly MARGIN_TOP = 22;
  private static readonly MARGIN_BOTTOM = 32;

  private static readonly CONTENT_WIDTH =
    PDFService.PAGE_WIDTH - PDFService.MARGIN_LEFT - PDFService.MARGIN_RIGHT;

  // ===== Footer safety (prevents content overlapping footer line/text) =====
  private static readonly FOOTER_TOP = PDFService.PAGE_HEIGHT - 34; // matches drawFooter()
  private static readonly FOOTER_SAFE_GAP = 10; // extra breathing room
  private static readonly HEADER_H = 70; // fixed header block height

  // ===== Palette =====
  private static INK = "#111827";
  private static SUBTLE = "#4B5563";
  private static FAINT = "#9CA3AF";
  private static LINE = "#D1D5DB";
  private static SOFT = "#F3F4F6";
  private static SURFACE = "#FFFFFF";
  private static ACCENT = "#111827";

  private static SUCCESS = "#16A34A";
  private static WARNING = "#F59E0B";
  private static DANGER = "#B91C1C";

  private static activeTheme: PDFTheme | null = null;

  // ===== Fonts =====
  private static FONT_REG = "Helvetica";
  private static FONT_BOLD = "Helvetica-Bold";

  // ===== Stroke & padding =====
  private static readonly STROKE_W = 0.9;
  private static readonly PAD_X = 8;

  // ======================================================================
  // PUBLIC
  // ======================================================================
  // ======================================================================
  // WORKER SUPPORT
  // ======================================================================
  static async generateQuotePDFInWorker(data: QuoteWithDetails): Promise<Buffer> {
    const { Worker } = await import("worker_threads");
    // Dynamic import to avoid issues in some environments if not used
    
    return new Promise(async (resolve, reject) => {
        try {
            let workerPath: string;
            if (process.env.NODE_ENV === "production") {
                workerPath = path.join(process.cwd(), "dist", "workers", "pdf.worker.js");
            } else {
                workerPath = path.join(process.cwd(), "server", "workers", "pdf.worker.ts");
            }

            // Determine execArgv for TS support in dev
            const execArgv = [];
            if (process.env.NODE_ENV !== "production") {
                const { pathToFileURL } = await import("url");
                // Try to resolve tsx loader
                try {
                    const tsxLoaderPath = path.resolve("node_modules/tsx/dist/loader.mjs");
                    // Check if exists? simplify: just use it
                    const loaderUrl = pathToFileURL(tsxLoaderPath).href;
                    execArgv.push("--import", loaderUrl);
                } catch (e) {
                   // If tsx resolution fails, maybe we are running with ts-node? 
                   // Fallback or let it fail and catch below
                }
            }

            const worker = new Worker(workerPath, {
                execArgv,
                workerData: data
            });

            worker.on("message", (msg) => {
                if (msg.status === "success") {
                    resolve(Buffer.from(msg.buffer));
                } else {
                    reject(new Error(msg.error));
                }
                worker.terminate();
            });

            worker.on("error", (err) => {
                reject(err);
                worker.terminate();
            });

            worker.on("exit", (code) => {
                if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
            });

            // If using postMessage instead of workerData (our worker uses on('message'))
            worker.postMessage(data);

        } catch (error) {
            reject(error);
        }
    });
  }

  static async generateQuotePDF(data: QuoteWithDetails, res: NodeJS.WritableStream): Promise<void> {
    // Theme selection
    let selectedTheme: PDFTheme;
    // ... existing implementation remains ...
    if (data.theme) selectedTheme = getTheme(data.theme);
    else if ((data.client as any).preferredTheme)
      selectedTheme = getTheme((data.client as any).preferredTheme);
    else if ((data.client as any).segment)
      selectedTheme = getSuggestedTheme((data.client as any).segment);
    else selectedTheme = getTheme("professional");

    this.applyTheme(selectedTheme);

    // 2. Create Doc
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
            Title: `Quote ${data.quote.quoteNumber}`, // Assuming quoteNumber is on data.quote
            Author: data.companyName || "AICERA",
        },
    });

    // Pipe immediately
    doc.pipe(res);

    // 3. Async Asset Prep
    await this.prepareAssets(doc, data);
    
    // 4. Draw content (Synchronous)
    doc.lineGap(2);

    // Optional cover only if abstract exists
    if (this.clean(data.abstract)) {
      this.drawCover(doc, data);
      doc.addPage();
    }

    this.drawHeader(doc, data, "COMMERCIAL PROPOSAL");
    this.drawFromBox(doc, data); // Kept original structure for these two
    this.drawShipBillAndMetaRow(doc, data); // Kept original structure for these two

    this.drawItemsTable(doc, data);

    this.drawWordsTermsTotalsRow(doc, data); // Kept original structure for these
    this.drawDeclarationBankRow(doc, data); // Kept original structure for these
    this.drawSignaturesRow(doc, data); // Kept original structure for these

    // Footer on every page
    const range = doc.bufferedPageRange();
    const total = range.count;
    for (let i = 0; i < total; i++) {
      doc.switchToPage(i);
      this.drawFooter(doc, i + 1, total);
    }

    doc.end();
  }

  // Optimize: Check assets async
  private static async prepareAssets(doc: Doc, data: QuoteWithDetails) {
      const fontsDir = path.join(process.cwd(), "server", "pdf", "fonts");
      
      // Fonts
      const tryFont = async (filename: string) => {
          try {
              const p = path.join(fontsDir, filename);
              await fs.promises.access(p, fs.constants.F_OK);
              return p;
          } catch { return null; }
      };

      // Try Roboto first (for currency support), then Inter
      const [robotoReg, robotoBold] = await Promise.all([
          tryFont("Roboto-Regular.ttf"),
          tryFont("Roboto-Bold.ttf")
      ]);

      if (robotoReg && robotoBold) {
          doc.registerFont("Helvetica", robotoReg);
          doc.registerFont("Helvetica-Bold", robotoBold);
          this.FONT_REG = "Helvetica";
          this.FONT_BOLD = "Helvetica-Bold";
      } else {
            // Fallback to Inter if available
            const [regPath, boldPath] = await Promise.all([
              tryFont("Inter-Regular.ttf"),
              tryFont("Inter-Bold.ttf")
            ]);

            if (regPath && boldPath) {
              doc.registerFont("Inter", regPath);
              doc.registerFont("Inter-Bold", boldPath);
              this.FONT_REG = "Inter";
              this.FONT_BOLD = "Inter-Bold";
            } else {
              this.FONT_REG = "Helvetica";
              this.FONT_BOLD = "Helvetica-Bold";
            }
      }

      // Logo
      // Logo
      let logoToUse: string | Buffer = "";
      
      // Logo (using shared helper)
      const { logo, mimeType } = await prepareLogo(data.companyLogo);
      (data as any).resolvedLogo = logo;
      (data as any).logoMimeType = mimeType;
  }

  // ======================================================================
  // THEME + FONTS
  // ======================================================================
  private static applyTheme(theme: PDFTheme) {
    this.activeTheme = theme;

    this.ACCENT = theme.colors?.accent || "#111827";
    this.INK = "#111827";
    this.SUBTLE = "#4B5563";
    this.FAINT = "#9CA3AF";
    this.LINE = "#D1D5DB";
    this.SOFT = "#F3F4F6";
    this.SURFACE = "#FFFFFF";

    this.SUCCESS = theme.colors?.success || "#16A34A";
    this.WARNING = theme.colors?.warning || "#F59E0B";
  }

  // No-op or deprecated
  private static setupFonts(doc: Doc) {
     // implementation moved to prepareAssets
  }

  // ======================================================================
  // HELPERS
  // ======================================================================
  private static bottomY(): number {
    // Keep content safely above the footer line + footer text
    return this.FOOTER_TOP - this.FOOTER_SAFE_GAP;
  }

  private static ensureSpace(doc: Doc, data: QuoteWithDetails, needed: number) {
    if (doc.y + needed <= this.bottomY()) return;
    doc.addPage();
    this.drawHeader(doc, data, "COMMERCIAL PROPOSAL");
  }

  private static clean(v: any): string {
    return String(v ?? "").trim();
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

  private static currency(v: number | string, currencyCode = "INR"): string {
    return formatCurrencyPdf(v, currencyCode);
  }

  private static normalizeAddress(addr?: string, maxLines = 3) {
    if (!addr) return "";
    const rawParts = String(addr)
      .split(/[\n,]/g)
      .map((s) => s.trim())
      .filter(Boolean);

    const seen = new Set<string>();
    const parts: string[] = [];
    for (const p of rawParts) {
      const key = p.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      parts.push(p);
    }
    return parts.slice(0, Math.max(3, maxLines * 2)).join(", ");
  }

  // ===== Invoice-style box drawing =====
  private static box(
    doc: Doc,
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
      .lineWidth(opts?.lineWidth ?? this.STROKE_W)
      .rect(x, y, w, h)
      .stroke();
    doc.restore();
  }

  private static hLine(doc: Doc, x1: number, x2: number, y: number) {
    doc.save();
    doc.strokeColor(this.LINE).lineWidth(0.8);
    doc.moveTo(x1, y).lineTo(x2, y).stroke();
    doc.restore();
  }

  private static label(doc: Doc, txt: string, x: number, y: number) {
    doc.save();
    doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(String(txt).toUpperCase(), x, y, {
      characterSpacing: 0.6,
      lineBreak: false,
    });
    doc.restore();
  }

  private static truncateToWidth(doc: Doc, text: string, width: number, suffix = "…"): string {
    const t = this.clean(text);
    if (!t) return "";
    if (doc.widthOfString(t) <= width) return t;

    let lo = 0;
    let hi = t.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      const cand = t.slice(0, mid) + suffix;
      if (doc.widthOfString(cand) <= width) lo = mid + 1;
      else hi = mid;
    }
    const cut = Math.max(0, lo - 1);
    return t.slice(0, cut) + suffix;
  }

  private static wrapLines(doc: Doc, text: string, width: number, maxLines: number): string[] {
    const t = this.clean(text).replace(/\s+/g, " ");
    if (!t) return [];

    // Use PDFKit's own text wrapper to calculate lines
    // This is much faster than word-by-word measurement
    const height = doc.heightOfString(t, { width });
    // This gives total height. We can guess lines by dividing by approximate line height?
    // No, better to let PDFKit do the work but we need the actual lines for our manual layout.
    // doc.text can return the text that was printed? No.
    // Actually, splitting by word IS the way to get lines if we need them as strings.
    // Optimization: check if whole string fits first.
    if (doc.widthOfString(t) <= width) return [t];
    
    // Heuristic optimization: Estimate line break position based on average char width?
    // Or just optimize the existing loop to not measure everything from scratch.
    
    const words = t.split(" ");
    const lines: string[] = [];
    let line = "";

    // Optimization: Check chunks of words instead of 1 by 1?
    // Let's stick to 1 by 1 but memoize or just accept it if text isn't huge.
    // The previous implementation was:
    /*
        for (const w of words) {
        const cand = line ? `${line} ${w}` : w;
        if (doc.widthOfString(cand) <= width) {
            line = cand;
        } else {
            push();
            line = w;
            if (lines.length >= maxLines) break;
        }
        }
    */
    // This is O(N^2) effectively if widthOfString is O(L).
    // Let's try to improve.
    
    for (const w of words) {
        const cand = line ? `${line} ${w}` : w;
        if (doc.widthOfString(cand) <= width) {
            line = cand;
        } else {
            if (line) lines.push(line);
            line = w;
            if (lines.length >= maxLines) break;
        }
    }
    if (line && lines.length < maxLines) lines.push(line);

    return lines.slice(0, maxLines);
  }

  // ======================================================================
  // COVER (optional)
  // ======================================================================
  private static drawCover(doc: Doc, data: QuoteWithDetails) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;

    doc.font(this.FONT_BOLD).fontSize(18).fillColor(this.INK);
    doc.text("COMMERCIAL PROPOSAL", x, 120, { width: w });

    doc.font(this.FONT_REG).fontSize(10).fillColor(this.SUBTLE);
    doc.text(`Quote No: ${this.clean((data.quote as any).quoteNumber || "-")}`, x, 148, { width: w });

    doc.y = 176;
    this.hLine(doc, x, x + w, doc.y);
    doc.y += 18;

    this.label(doc, "Abstract", x, doc.y);
    doc.y += 12;

    doc.font(this.FONT_REG).fontSize(10).fillColor(this.INK);
    doc.text(this.clean(data.abstract), x, doc.y, { width: w, lineGap: 3 });
  }

  // ======================================================================
  // HEADER (fixed-height, deterministic)
  // ======================================================================
  private static drawHeader(doc: Doc, data: QuoteWithDetails, title: string) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    const topY = doc.page.margins.top;

    const logoSize = 26;
    let logoPrinted = false;

    // Logo (use pre-resolved)
    const logoPath = (data as any).resolvedLogo;
    const mimeType = (data as any).logoMimeType || "";
    
    if (logoPath) {
        const drawn = drawLogo(doc, logoPath, mimeType, x, topY + 12, logoSize);
        logoPrinted = drawn;
    }

    // Center title (top row)
    doc.font(this.FONT_BOLD).fontSize(11).fillColor(this.INK);
    doc.text(title, x, topY - 2, { width: w, align: "center", lineBreak: false });

    // Left block: Company
    const leftX = logoPrinted ? x + logoSize + 8 : x;
    const leftW = 320;

    const company = this.clean(data.companyName || "AICERA");
    const contactBits: string[] = [];
    if (data.companyEmail) contactBits.push(this.clean(data.companyEmail));
    if (data.companyPhone) contactBits.push(this.clean(data.companyPhone));
    if (data.companyGSTIN) contactBits.push(`GSTIN: ${this.clean(data.companyGSTIN).toUpperCase()}`);
    const contactLine = contactBits.join("  |  ");

    doc.font(this.FONT_BOLD).fontSize(10).fillColor(this.INK);
    doc.text(company, leftX, topY + 12, { width: leftW, lineBreak: false });

    if (contactLine) {
      doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
      doc.text(this.truncateToWidth(doc, contactLine, leftW), leftX, topY + 24, {
        width: leftW,
        lineBreak: false,
      });
    }

    const addr = this.normalizeAddress(data.companyAddress, 2);
    if (addr) {
      doc.font(this.FONT_REG).fontSize(7.0).fillColor(this.SUBTLE);
      doc.text(addr, leftX, topY + 34, { width: leftW });
    }

    // Right meta block
    const rightW = 210;
    const rightX = x + w - rightW;

    const quoteNo = this.clean((data.quote as any).quoteNumber || "-");
    const date = this.safeDate((data.quote as any).quoteDate);

    doc.font(this.FONT_REG).fontSize(7.0).fillColor(this.SUBTLE);
    doc.text("Quote No.", rightX, topY + 12, { width: rightW, align: "right", lineBreak: false });

    doc.font(this.FONT_BOLD).fontSize(9.6).fillColor(this.INK);
    doc.text(quoteNo, rightX, topY + 22, { width: rightW, align: "right", lineBreak: false });

    doc.font(this.FONT_REG).fontSize(7.0).fillColor(this.SUBTLE);
    doc.text("Date", rightX, topY + 34, { width: rightW, align: "right", lineBreak: false });

    doc.font(this.FONT_BOLD).fontSize(8.6).fillColor(this.INK);
    doc.text(date, rightX, topY + 44, { width: rightW, align: "right", lineBreak: false });

    // Divider + deterministic doc.y
    const headerBottom = topY + this.HEADER_H;
    this.hLine(doc, x, x + w, headerBottom - 10);
    doc.y = headerBottom;
  }

  // ======================================================================
  // FROM
  // ======================================================================
  private static drawFromBox(doc: Doc, data: QuoteWithDetails) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;

    const name = this.clean(data.companyName || "AICERA");
    const addr = this.normalizeAddress(data.companyAddress, 10) || "-";

    doc.font(this.FONT_BOLD).fontSize(8.6);
    const nameH = doc.heightOfString(name, { width: w - this.PAD_X * 2 });

    doc.font(this.FONT_REG).fontSize(7.2);
    const addrH = doc.heightOfString(addr, { width: w - this.PAD_X * 2 });

    const contactBits: string[] = [];
    if (data.companyPhone) contactBits.push(`Ph: ${this.clean(data.companyPhone)}`);
    if (data.companyGSTIN) contactBits.push(`GSTIN: ${this.clean(data.companyGSTIN).toUpperCase()}`);
    if (data.preparedByEmail) contactBits.push(`Email: ${this.clean(data.preparedByEmail)}`);

    doc.font(this.FONT_REG).fontSize(7.0);
    const contactText = contactBits.join("  |  ");
    const contactH = contactBits.length
      ? doc.heightOfString(contactText, { width: w - this.PAD_X * 2 })
      : 0;

    // Dynamic height
    const contentH = 6 + 10 + nameH + 2 + addrH + (contactH ? 8 + contactH : 0) + 6;
    const h = Math.max(contentH, 58);

    this.ensureSpace(doc, data, h + 10);

    const y0 = doc.y;
    this.box(doc, x, y0, w, h, { fill: this.SURFACE });

    this.label(doc, "From", x + this.PAD_X, y0 + 6);

    let cy = y0 + 18;
    doc.font(this.FONT_BOLD).fontSize(8.6).fillColor(this.INK);
    doc.text(name, x + this.PAD_X, cy, { width: w - this.PAD_X * 2 });
    cy += nameH + 2;

    doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(addr, x + this.PAD_X, cy, { width: w - this.PAD_X * 2 });

    if (contactBits.length) {
      doc.font(this.FONT_REG).fontSize(7.0).fillColor(this.SUBTLE);
      const contactY = y0 + h - contactH - 6;
      doc.text(contactText, x + this.PAD_X, contactY, {
        width: w - this.PAD_X * 2,
      });
    }

    doc.y = y0 + h + 10;
  }

  // ======================================================================
  // SHIP/BILL + META
  // ======================================================================
  private static drawShipBillAndMetaRow(doc: Doc, data: QuoteWithDetails) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;

    const gap = 10;
    const leftW = w * 0.56;
    const rightW = w - leftW - gap;

    const clientName = this.clean((data.client as any).name || "-");
    const shipAddr =
      this.normalizeAddress((data.client as any).shippingAddress || (data.client as any).billingAddress, 10) || "-";
    const billAddr = this.normalizeAddress((data.client as any).billingAddress, 10) || "-";

    const phone = this.clean((data.client as any).phone);
    const email = this.clean((data.client as any).email);
    const contact = [phone ? `Ph: ${phone}` : "", email ? `Email: ${email}` : ""].filter(Boolean).join("  |  ");

    // Measure left blocks
    doc.font(this.FONT_BOLD).fontSize(8.6);
    const cNameH = doc.heightOfString(clientName, { width: leftW - this.PAD_X * 2 });

    doc.font(this.FONT_REG).fontSize(7.2);
    const shipAddrH = doc.heightOfString(shipAddr, { width: leftW - this.PAD_X * 2 });
    const shipH = 6 + 10 + cNameH + 2 + shipAddrH + 6;

    const billAddrH = doc.heightOfString(billAddr, { width: leftW - this.PAD_X * 2 });
    doc.font(this.FONT_REG).fontSize(7.0);
    const contactH = contact ? doc.heightOfString(contact, { width: leftW - this.PAD_X * 2 }) : 0;
    const billH = 6 + 10 + cNameH + 2 + billAddrH + (contactH ? 8 + contactH : 0) + 6;

    const leftTotalH = shipH + 8 + billH;

    // Measure right meta
    const q: any = data.quote;
    const rows: Array<{ k: string; v: string }> = [
      { k: "Quote Date", v: this.safeDate(q.quoteDate) },
      { k: "Validity", v: q.validUntil ? `Until ${this.safeDate(q.validUntil)}` : `${Number(q.validityDays || 30)} days` },
      { k: "Reference", v: this.clean(q.referenceNumber || "-") },
      { k: "Prepared By", v: this.clean(data.preparedBy || "-") },
    ];

    const h = Math.max(leftTotalH, 130);

    this.ensureSpace(doc, data, h + 10);

    const y0 = doc.y;
    const leftX = x;
    const rightX = x + leftW + gap;

    // Left box
    this.box(doc, leftX, y0, leftW, h, { fill: this.SURFACE });

    // Split line position (clamped so it never pushes Bill section off the box)
    const minBillSpace = 48; // label + a couple lines
    const idealSplitY = y0 + shipH + 8;
    const splitY = Math.min(idealSplitY, y0 + h - minBillSpace);
    this.hLine(doc, leftX, leftX + leftW, splitY);

    // Ship To
    this.label(doc, "Consignee (Ship To)", leftX + this.PAD_X, y0 + 6);
    let cy = y0 + 18;
    doc.font(this.FONT_BOLD).fontSize(8.6).fillColor(this.INK);
    doc.text(clientName, leftX + this.PAD_X, cy, { width: leftW - this.PAD_X * 2 });
    cy += cNameH + 2;

    doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(shipAddr, leftX + this.PAD_X, cy, { width: leftW - this.PAD_X * 2 });

    // Bill To
    this.label(doc, "Buyer (Bill To)", leftX + this.PAD_X, splitY + 6);
    cy = splitY + 18;
    doc.font(this.FONT_BOLD).fontSize(8.6).fillColor(this.INK);
    doc.text(clientName, leftX + this.PAD_X, cy, { width: leftW - this.PAD_X * 2 });
    cy += cNameH + 2;

    doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(billAddr, leftX + this.PAD_X, cy, { width: leftW - this.PAD_X * 2 });

    // Contact pinned to bottom
    if (contact) {
      doc.font(this.FONT_REG).fontSize(7.0).fillColor(this.SUBTLE);
      const contactY = y0 + h - contactH - 6;
      doc.text(contact, leftX + this.PAD_X, contactY, {
        width: leftW - this.PAD_X * 2,
      });
    }

    // Right meta box
    this.box(doc, rightX, y0, rightW, h, { fill: this.SURFACE });

    const rowHeight = h / rows.length;
    const labelW = rightW * 0.5;
    const valueW = rightW - labelW - this.PAD_X * 2;

    for (let i = 0; i < rows.length; i++) {
      const ry = y0 + i * rowHeight;
      if (i > 0) this.hLine(doc, rightX, rightX + rightW, ry);

      doc.font(this.FONT_REG).fontSize(7.0).fillColor(this.SUBTLE);
      doc.text(rows[i].k, rightX + this.PAD_X, ry + rowHeight / 2 - 4, {
        width: labelW - this.PAD_X,
        lineBreak: false,
      });

      // Truncate values to prevent clipping/overlaps
      doc.font(this.FONT_BOLD).fontSize(7.6).fillColor(this.INK);
      const v = this.truncateToWidth(doc, rows[i].v, valueW);
      doc.text(v, rightX + labelW, ry + rowHeight / 2 - 4, {
        width: valueW,
        align: "right",
        lineBreak: false,
      });
    }

    doc.y = y0 + h + 10;
  }

  // ======================================================================
  // ITEMS TABLE
  // ======================================================================
  private static drawItemsTable(doc: Doc, data: QuoteWithDetails) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;

    doc.font(this.FONT_BOLD).fontSize(9.2).fillColor(this.INK);
    doc.text("Description of Goods / Services", x, doc.y);
    doc.y += 6;

    const headerH = 22;
    const minRowH = 20;

    // Columns
    const sl = 24;
    const qty = 40;
    const unit = 40;
    const rate = 72;
    const amt = 86;
    const desc = w - (sl + qty + unit + rate + amt);

    const cx = {
      sl: x,
      desc: x + sl,
      qty: x + sl + desc,
      unit: x + sl + desc + qty,
      rate: x + sl + desc + qty + unit,
      amt: x + sl + desc + qty + unit + rate,
      right: x + w,
    };

    const drawHeader = (yy: number) => {
      this.box(doc, x, yy, w, headerH, { fill: this.SOFT, stroke: this.LINE, lineWidth: 0.9 });

      doc.save();
      doc.strokeColor(this.LINE).lineWidth(0.8);
      [cx.desc, cx.qty, cx.unit, cx.rate, cx.amt].forEach((vx) => {
        doc.moveTo(vx, yy).lineTo(vx, yy + headerH).stroke();
      });
      doc.restore();

      doc.font(this.FONT_REG).fontSize(7.0).fillColor(this.SUBTLE);
      doc.text("SL", cx.sl, yy + 7, { width: sl, align: "center", characterSpacing: 0.6, lineBreak: false });
      doc.text("DESCRIPTION", cx.desc + 4, yy + 7, { width: desc - 8, align: "left", characterSpacing: 0.6, lineBreak: false });
      doc.text("QTY", cx.qty, yy + 7, { width: qty, align: "center", characterSpacing: 0.6, lineBreak: false });
      doc.text("UNIT", cx.unit, yy + 7, { width: unit, align: "center", characterSpacing: 0.6, lineBreak: false });
      doc.text("RATE", cx.rate, yy + 7, { width: rate - 8, align: "right", characterSpacing: 0.6, lineBreak: false });
      doc.text("AMOUNT", cx.amt, yy + 7, { width: amt - 8, align: "right", characterSpacing: 0.6, lineBreak: false });
    };

    this.ensureSpace(doc, data, headerH + minRowH + 10);

    let y = doc.y;
    drawHeader(y);
    y += headerH;

    const items = data.items || [];
    for (let i = 0; i < items.length; i++) {
      const it: any = items[i];

      const descText = this.clean(it.description || "-");
      const qtyVal = Number(it.quantity ?? 0) || 0;
      const unitText = this.clean(it.unit || it.uom || it.unitName || "pcs");
      const rateVal = Number(it.unitPrice ?? 0) || 0;
      const amtVal = Number(it.subtotal ?? qtyVal * rateVal) || 0;

      doc.save();
      doc.font(this.FONT_REG).fontSize(8.0).fillColor(this.INK);
      const descLines = this.wrapLines(doc, descText, desc - 8, 30);
      doc.restore();

      const rowH = Math.max(minRowH, 8 + descLines.length * 11);

      // Page break
      if (y + rowH > this.bottomY() - 6) {
        doc.addPage();
        this.drawHeader(doc, data, "COMMERCIAL PROPOSAL");

        doc.font(this.FONT_BOLD).fontSize(9.2).fillColor(this.INK);
        doc.text("Description of Goods / Services (cont.)", x, doc.y);
        doc.y += 6;

        this.ensureSpace(doc, data, headerH + minRowH + 10);
        y = doc.y;
        drawHeader(y);
        y += headerH;
      }

      this.box(doc, x, y, w, rowH, { fill: this.SURFACE });

      doc.save();
      doc.strokeColor(this.LINE).lineWidth(0.8);
      [cx.desc, cx.qty, cx.unit, cx.rate, cx.amt].forEach((vx) => {
        doc.moveTo(vx, y).lineTo(vx, y + rowH).stroke();
      });
      doc.restore();

      // SL
      doc.font(this.FONT_REG).fontSize(8).fillColor(this.INK);
      doc.text(String(i + 1), cx.sl, y + 6, { width: sl, align: "center", lineBreak: false });

      // Description
      let dy = y + 6;
      for (const ln of descLines) {
        doc.text(ln, cx.desc + 4, dy, { width: desc - 8, lineBreak: false });
        dy += 11;
      }

      // Qty + Unit + Rate + Amount
      const midY = y + 6;
      doc.font(this.FONT_REG).fontSize(8).fillColor(this.INK);
      doc.text(String(qtyVal), cx.qty, midY, { width: qty, align: "center", lineBreak: false });
      doc.text(unitText, cx.unit, midY, { width: unit, align: "center", lineBreak: false });

      doc.font(this.FONT_BOLD).fontSize(8.0).fillColor(this.INK);
      doc.text(this.currency(rateVal, data.quote.currency), cx.rate, midY, { width: rate - 8, align: "right", lineBreak: false });
      doc.text(this.currency(amtVal, data.quote.currency), cx.amt, midY, { width: amt - 8, align: "right", lineBreak: false });

      y += rowH;
    }

    doc.y = y + 8;
  }

  // ======================================================================
  // WORDS + TERMS (left) + TOTALS (right)
  // ======================================================================
  private static drawWordsTermsTotalsRow(doc: Doc, data: QuoteWithDetails) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;

    const gap = 10;
    const leftW = w * 0.58;
    const rightW = w - leftW - gap;

    const q: any = data.quote;
    const total = Number(q.total) || 0;
    const amountWords = this.amountToINRWords(total);

    const termsInline = this.termsToInlineBullets(this.clean(q.termsAndConditions || "")) || "—";

    // Pre-measure terms lines
    doc.font(this.FONT_REG).fontSize(7.2);
    const termsLines = this.wrapLines(doc, termsInline, leftW - this.PAD_X * 2, 12);

    // Pre-measure amount words lines
    doc.font(this.FONT_BOLD).fontSize(7.8);
    const wordLines = this.wrapLines(doc, amountWords, leftW - this.PAD_X * 2, 3);

    // Compute left height based on content (no magic y0+50 anymore)
    const leftH = 6 + 12 + wordLines.length * 10 + 8 + 12 + termsLines.length * 10 + 10;
    // Compute right height based on totals rows
    const subtotal = Number(q.subtotal) || 0;
    const shipping = Number(q.shippingCharges) || 0;
    const cgst = Number(q.cgst) || 0;
    const sgst = Number(q.sgst) || 0;
    const igst = Number(q.igst) || 0;

    const rowList: Array<{ k: string; v: number; danger?: boolean; bold?: boolean }> = [];
    rowList.push({ k: "Subtotal", v: subtotal });
    if (shipping > 0) rowList.push({ k: "Shipping", v: shipping });
    if (cgst > 0) rowList.push({ k: "CGST", v: cgst });
    if (sgst > 0) rowList.push({ k: "SGST", v: sgst });
    if (igst > 0 && cgst === 0 && sgst === 0) rowList.push({ k: "IGST", v: igst });
    rowList.push({ k: "TOTAL", v: total, bold: true });

    const rightH = 22 + rowList.length * 14 + 12;

    const h = Math.max(leftH, rightH, 122);

    this.ensureSpace(doc, data, h + 12);

    const y0 = doc.y;

    // Left box
    this.box(doc, x, y0, leftW, h, { fill: this.SURFACE });
    this.label(doc, "Amount Chargeable (in words)", x + this.PAD_X, y0 + 6);

    doc.font(this.FONT_BOLD).fontSize(7.8).fillColor(this.INK);

    let wy = y0 + 20;
    for (const wl of wordLines) {
      doc.text(wl, x + this.PAD_X, wy, { width: leftW - this.PAD_X * 2 });
      wy += 10;
    }

    // Terms label placed AFTER amount words block
    const termsLabelY = wy + 6;
    this.label(doc, "Terms & Conditions", x + this.PAD_X, termsLabelY);

    doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
    let ty = termsLabelY + 12;
    for (const ln of termsLines) {
      doc.text(ln, x + this.PAD_X, ty, { width: leftW - this.PAD_X * 2, lineBreak: false });
      ty += 10;
    }

    // Right totals box
    const xr = x + leftW + gap;
    this.box(doc, xr, y0, rightW, h, { fill: this.SURFACE });
    this.label(doc, "Totals", xr + this.PAD_X, y0 + 6);

    let ry = y0 + 22;
    const rowH = 14;
    const labelW = rightW * 0.55;
    const valueW = rightW - labelW - this.PAD_X * 2;

    for (const r of rowList) {
      doc.font(this.FONT_BOLD).fontSize(r.bold ? 8.6 : 7.6).fillColor(this.INK);
      doc.text(r.k, xr + this.PAD_X, ry, { width: labelW - this.PAD_X, lineBreak: false });

      const moneyStr = this.currency(r.v, data.quote.currency);
      doc
        .font(this.FONT_BOLD)
        .fontSize(r.bold ? 9.0 : 8.0)
        .fillColor(r.danger ? this.DANGER : this.INK);
      doc.text(moneyStr, xr + labelW, ry, {
        width: valueW,
        align: "right",
        lineBreak: false,
      });

      ry += rowH;
    }

    doc.y = y0 + h + 12;
  }

  // ======================================================================
  // DECLARATION + BANK
  // ======================================================================
  private static drawDeclarationBankRow(doc: Doc, data: QuoteWithDetails) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;

    const gap = 10;
    const colW = Math.floor((w - gap) / 2);

    const declaration =
      this.clean(data.declarationText) ||
      "We declare that this proposal shows the actual price of the goods/services described and that all particulars are true and correct.";

    doc.font(this.FONT_REG).fontSize(7.2);
    const declLines = this.wrapLines(doc, declaration, colW - this.PAD_X * 2, 10);
    const declH = 20 + declLines.length * 9 + 10;

    const bd = data.bankDetails || {};
    const bankLines: string[] = [];
    if (bd.accountName) bankLines.push(`A/c Name: ${bd.accountName}`);
    if (bd.bankName) bankLines.push(`Bank: ${bd.bankName}`);
    if (bd.accountNumber) bankLines.push(`A/c No: ${bd.accountNumber}`);
    if (bd.ifsc) bankLines.push(`IFSC: ${bd.ifsc}`);
    if (bd.branch) bankLines.push(`Branch: ${bd.branch}`);
    if (bd.swift) bankLines.push(`SWIFT: ${bd.swift}`);
    if (bd.upi) bankLines.push(`UPI: ${bd.upi}`);

    const bankText = bankLines.length ? bankLines.join("  |  ") : "—";
    doc.font(this.FONT_BOLD).fontSize(7.2);
    const bankLines2 = this.wrapLines(doc, bankText, colW - this.PAD_X * 2, 10);
    const bankH = 20 + bankLines2.length * 9 + 10;

    const h = Math.max(declH, bankH, 76);

    this.ensureSpace(doc, data, h + 12);

    const y0 = doc.y;

    // Declaration
    this.box(doc, x, y0, colW, h, { fill: this.SURFACE });
    this.label(doc, "Declaration", x + this.PAD_X, y0 + 6);

    doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
    let dy = y0 + 20;
    for (const ln of declLines) {
      doc.text(ln, x + this.PAD_X, dy, { width: colW - this.PAD_X * 2, lineBreak: false });
      dy += 9;
    }

    // Bank
    const xr = x + colW + gap;
    this.box(doc, xr, y0, colW, h, { fill: this.SURFACE });
    this.label(doc, "Company Bank Details for Payment", xr + this.PAD_X, y0 + 6);

    doc.font(this.FONT_BOLD).fontSize(7.2).fillColor(this.INK);
    let by = y0 + 20;
    for (const ln of bankLines2) {
      doc.text(ln, xr + this.PAD_X, by, { width: colW - this.PAD_X * 2, lineBreak: false });
      by += 9;
    }

    doc.y = y0 + h + 12;
  }

  // ======================================================================
  // SIGNATURES
  // ======================================================================
  private static drawSignaturesRow(doc: Doc, data: QuoteWithDetails) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;

    const gap = 10;
    const colW = Math.floor((w - gap) / 2);
    const h = 74;

    this.ensureSpace(doc, data, h + 10);

    const y0 = doc.y;

    // Client acceptance
    this.box(doc, x, y0, colW, h, { fill: this.SURFACE });
    this.label(doc, "Client Acceptance", x + this.PAD_X, y0 + 6);

    doc.font(this.FONT_REG).fontSize(8.8).fillColor(this.SUBTLE);
    doc.text(this.clean(data.clientAcceptanceLabel || "Customer Seal & Signature"), x + this.PAD_X, y0 + 20, {
      width: colW - this.PAD_X * 2,
    });

    this.hLine(doc, x + this.PAD_X, x + colW - this.PAD_X, y0 + h - 24);
    doc.font(this.FONT_REG).fontSize(8.2).fillColor(this.SUBTLE);
    doc.text("Date:", x + this.PAD_X, y0 + h - 16, { width: colW - this.PAD_X * 2, lineBreak: false });

    // Company sign
    const xr = x + colW + gap;
    this.box(doc, xr, y0, colW, h, { fill: this.SURFACE });
    this.label(doc, "For Company", xr + this.PAD_X, y0 + 6);

    const company = this.clean(data.companyName || "AICERA");
    doc.font(this.FONT_REG).fontSize(8.8).fillColor(this.SUBTLE);
    doc.text(`For ${company}`, xr + this.PAD_X, y0 + 20, { width: colW - this.PAD_X * 2 });

    this.hLine(doc, xr + this.PAD_X, xr + colW - this.PAD_X, y0 + h - 24);
    doc.font(this.FONT_REG).fontSize(8.2).fillColor(this.SUBTLE);
    doc.text("Authorised Signatory", xr + this.PAD_X, y0 + h - 16, { width: colW - this.PAD_X * 2, lineBreak: false });

    doc.y = y0 + h + 10;
  }

  // ======================================================================
  // FOOTER
  // ======================================================================
  private static drawFooter(doc: Doc, page: number, total: number) {
    const footerTop = this.FOOTER_TOP;

    const prevBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    doc.save();
    doc.strokeColor(this.LINE).lineWidth(this.STROKE_W);
    doc.moveTo(this.MARGIN_LEFT, footerTop).lineTo(this.PAGE_WIDTH - this.MARGIN_RIGHT, footerTop).stroke();

    doc.font(this.FONT_REG).fontSize(8).fillColor(this.FAINT);
    doc.text("This is a Computer Generated Document", 0, footerTop + 7, {
      width: this.PAGE_WIDTH,
      align: "center",
      lineBreak: false,
    });
    doc.text(`Page ${page} of ${total}`, 0, footerTop + 19, {
      width: this.PAGE_WIDTH,
      align: "center",
      lineBreak: false,
    });

    doc.restore();
    doc.page.margins.bottom = prevBottom;
  }

  // ======================================================================
  // AMOUNT IN WORDS (INR)
  // ======================================================================
  private static amountToINRWords(amount: number) {
    const rupees = Math.floor(Math.abs(amount));
    const paise = Math.round((Math.abs(amount) - rupees) * 100);

    const r = this.numberToIndianWords(rupees);
    const p = paise > 0 ? ` and ${this.numberToIndianWords(paise)} Paise` : "";
    const sign = amount < 0 ? "Minus " : "";
    return `${sign}INR ${r}${p} Only`;
  }

  private static numberToIndianWords(n: number): string {
    if (!Number.isFinite(n) || n === 0) return "Zero";

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

    const two = (x: number) => {
      if (x < 20) return ones[x];
      const t = Math.floor(x / 10);
      const o = x % 10;
      return `${tens[t]}${o ? " " + ones[o] : ""}`.trim();
    };

    const three = (x: number) => {
      const h = Math.floor(x / 100);
      const r = x % 100;
      const head = h ? `${ones[h]} Hundred` : "";
      const tail = r ? `${head ? " " : ""}${two(r)}` : "";
      return `${head}${tail}`.trim();
    };

    const parts: string[] = [];
    let num = Math.floor(n);

    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const rest = num;

    if (crore) parts.push(`${three(crore)} Crore`);
    if (lakh) parts.push(`${three(lakh)} Lakh`);
    if (thousand) parts.push(`${three(thousand)} Thousand`);
    if (rest) parts.push(three(rest));

    return parts.join(" ").replace(/\s+/g, " ").trim();
  }

  // ======================================================================
  // TERMS INLINE (fix orphan lines + dedupe)
  // ======================================================================
  private static termsToInlineBullets(raw: string) {
    const t = this.clean(raw);
    if (!t) return "";

    const src = t
      .split(/\r?\n/g)
      .map((l) => l.trim())
      .filter(Boolean);

    const bullets: string[] = [];

    for (const original of src) {
      const stripped = original.replace(/^\s*(?:[-*•]+|\d+[.)\]])\s*/g, "").trim();
      if (!stripped) continue;

      const looksLikeNewItem =
        /^\s*(?:[-*•]+|\d+[.)\]])\s+/.test(original) || /:\s*/.test(stripped);

      if (!bullets.length) {
        bullets.push(stripped);
        continue;
      }

      // If it doesn't look like a new item, treat as continuation of previous line.
      if (!looksLikeNewItem) bullets[bullets.length - 1] += " " + stripped;
      else bullets.push(stripped);
    }

    // Normalize + dedupe (case-insensitive)
    const seen = new Set<string>();
    const out: string[] = [];
    for (const b of bullets) {
      const norm = b.replace(/\s+/g, " ").trim();
      const key = norm.toLowerCase();
      if (!norm || seen.has(key)) continue;
      seen.add(key);
      out.push(norm);
    }

    return out.join(" • ");
  }
}