// server/pdf/PDFService.ts
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import type { Quote, QuoteItem, Client } from "@shared/schema";
import { getTheme, getSuggestedTheme, type PDFTheme } from "./pdf-themes";

interface QuoteWithDetails {
    quote: Quote;
    client: Client;
    items: QuoteItem[];

    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyEmail?: string;
    companyWebsite?: string;
    companyGSTIN?: string;
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

    // ===== Compact margins (closer to invoice design) =====
    private static readonly MARGIN_LEFT = 28;
    private static readonly MARGIN_RIGHT = 28;
    private static readonly MARGIN_TOP = 22;
    private static readonly MARGIN_BOTTOM = 32;

    private static readonly CONTENT_WIDTH =
        PDFService.PAGE_WIDTH - PDFService.MARGIN_LEFT - PDFService.MARGIN_RIGHT;

    // ===== Clean invoice-style palette =====
    private static INK = "#111827";
    private static SUBTLE = "#4B5563";
    private static FAINT = "#6B7280";
    private static LINE = "#D1D5DB";
    private static SOFT = "#F3F4F6";
    private static SURFACE = "#FFFFFF";
    private static ACCENT = "#111827";

    private static SUCCESS = "#16A34A";
    private static WARNING = "#F59E0B";
    private static DANGER = "#B91C1C";

    private static activeTheme: PDFTheme | null = null;

    // ===== Fonts (optional Inter) =====
    private static FONT_REG = "Helvetica";
    private static FONT_BOLD = "Helvetica-Bold";

    // ===== Stroke & padding (invoice-style) =====
    private static readonly STROKE_W = 0.9;
    private static readonly PAD_X = 8;

    // ======================================================================
    // PUBLIC
    // ======================================================================
    static generateQuotePDF(data: QuoteWithDetails): PDFKit.PDFDocument {
        // Theme selection
        let selectedTheme: PDFTheme;
        if (data.theme) selectedTheme = getTheme(data.theme);
        else if ((data.client as any).preferredTheme) selectedTheme = getTheme((data.client as any).preferredTheme);
        else if ((data.client as any).segment) selectedTheme = getSuggestedTheme((data.client as any).segment);
        else selectedTheme = getTheme("professional");

        this.applyTheme(selectedTheme);

        const doc = new PDFDocument({
            size: "A4",
            margins: {
                top: this.MARGIN_TOP,
                bottom: this.MARGIN_BOTTOM,
                left: this.MARGIN_LEFT,
                right: this.MARGIN_RIGHT,
            },
            bufferPages: true,
            info: { Author: data.companyName || "AICERA" },
        });

        this.setupFonts(doc);
        doc.lineGap(2);

        // Optional cover only if abstract exists
        if (this.clean(data.abstract)) {
            this.drawCover(doc, data);
            doc.addPage();
        }

        this.drawHeader(doc, data, "COMMERCIAL PROPOSAL");
        this.drawFromBox(doc, data);
        this.drawShipBillAndMetaRow(doc, data);

        // Items
        this.drawItemsTable(doc, data);

        // Remaining blocks (with space checks in each method)
        this.drawWordsTermsTotalsRow(doc, data);
        this.drawDeclarationBankRow(doc, data);
        this.drawSignaturesRow(doc, data);

        // Footer on every page
        const range = doc.bufferedPageRange();
        const total = range.count;
        for (let i = 0; i < total; i++) {
            doc.switchToPage(i);
            this.drawFooter(doc, i + 1, total);
        }

        doc.end();
        return doc;
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

    private static setupFonts(doc: Doc) {
        const fontsDir = path.join(process.cwd(), "server", "pdf", "fonts");

        const tryRegister = (name: string, filename: string) => {
            try {
                const p = path.join(fontsDir, filename);
                if (fs.existsSync(p)) {
                    doc.registerFont(name, p);
                    return true;
                }
            } catch {}
            return false;
        };

        const okReg = tryRegister("Inter", "Inter-Regular.ttf");
        const okBold = tryRegister("Inter-Bold", "Inter-Bold.ttf");
        if (okReg && okBold) {
            this.FONT_REG = "Inter";
            this.FONT_BOLD = "Inter-Bold";
        } else {
            this.FONT_REG = "Helvetica";
            this.FONT_BOLD = "Helvetica-Bold";
        }
    }

    // ======================================================================
    // HELPERS
    // ======================================================================
    private static bottomY(): number {
        return this.PAGE_HEIGHT - this.MARGIN_BOTTOM;
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

    private static currency(v: number | string): string {
        const n = Number(v) || 0;
        return `Rs. ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
        doc.strokeColor(opts?.stroke ?? this.LINE)
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
        doc.text(String(txt).toUpperCase(), x, y, { characterSpacing: 0.6, lineBreak: false });
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

        const words = t.split(" ");
        const lines: string[] = [];
        let line = "";

        const push = () => {
            const s = line.trim();
            if (s) lines.push(s);
            line = "";
        };

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
        if (line && lines.length < maxLines) push();

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
    // HEADER (invoice-style)
    // ======================================================================
    private static drawHeader(doc: Doc, data: QuoteWithDetails, title: string) {
        const x = this.MARGIN_LEFT;
        const w = this.CONTENT_WIDTH;
        const topY = doc.page.margins.top;

        const logoSize = 26;
        let logoPrinted = false;

        // Logo
        try {
            let logoPath = path.join(process.cwd(), "client", "public", "AICERA_Logo.png");
            if (!fs.existsSync(logoPath)) logoPath = path.join(process.cwd(), "client", "public", "logo.png");
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, x, topY - 2, { fit: [logoSize, logoSize] });
                logoPrinted = true;
            }
        } catch {}

        // Title centered
        doc.font(this.FONT_BOLD).fontSize(11).fillColor(this.INK);
        doc.text(title, x, topY - 2, { width: w, align: "center", lineBreak: false });

        // Company name (left, after logo)
        const leftX = logoPrinted ? x + logoSize + 8 : x;
        doc.font(this.FONT_BOLD).fontSize(10).fillColor(this.INK);
        doc.text(this.clean(data.companyName || "AICERA"), leftX, topY + 12, {
            width: 300,
            lineBreak: false,
        });

        // Contact & Address (left, compact)
        // const parts: string[] = [];
        // if (data.companyEmail) parts.push(this.clean(data.companyEmail));
        // if (data.companyPhone) parts.push(this.clean(data.companyPhone));
        // if (data.companyGSTIN) parts.push(`GSTIN: ${this.clean(data.companyGSTIN).toUpperCase()}`);
        //
        // doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
        // if (parts.length) {
        //     doc.text(parts.join("  |  "), leftX, topY + 24, { width: 360, lineBreak: false });
        // }
        //
        // const addr = this.normalizeAddress(data.companyAddress, 2);
        // if (addr) {
        //     doc.font(this.FONT_REG).fontSize(7.0).fillColor(this.SUBTLE);
        //     doc.text(addr, leftX, topY + 34, { width: 360 });
        // }

        // Right invoice meta
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

        // Divider
        const minLineY = topY + 58;
        doc.y = Math.max(doc.y + 6, minLineY);
        this.hLine(doc, x, x + w, doc.y);
        doc.y += 8;
    }

    // ======================================================================
    // FROM
    // ======================================================================
    private static drawFromBox(doc: Doc, data: QuoteWithDetails) {
        const x = this.MARGIN_LEFT;
        const w = this.CONTENT_WIDTH;

        const h = 55; // Increased height to accommodate full address
        this.ensureSpace(doc, data, h + 10);

        const y0 = doc.y;
        this.box(doc, x, y0, w, h, { fill: "#FFFFFF" });

        this.label(doc, "From", x + this.PAD_X, y0 + 6);

        const name = this.clean(data.companyName || "AICERA");
        doc.font(this.FONT_BOLD).fontSize(8.6).fillColor(this.INK);
        doc.text(name, x + this.PAD_X, y0 + 18, { width: w - this.PAD_X * 2, lineBreak: false });

        const addr = this.normalizeAddress(data.companyAddress, 4) || "-";
        doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
        doc.text(addr, x + this.PAD_X, y0 + 28, { width: w - this.PAD_X * 2, lineBreak: true });

        // Contact pinned at bottom
        const contactBits: string[] = [];
        if (data.companyPhone) contactBits.push(`Ph: ${this.clean(data.companyPhone)}`);
        if (data.companyGSTIN) contactBits.push(`GSTIN: ${this.clean(data.companyGSTIN).toUpperCase()}`);
        if (data.preparedByEmail) contactBits.push(`Email: ${this.clean(data.preparedByEmail)}`);

        doc.font(this.FONT_REG).fontSize(7.0).fillColor(this.SUBTLE);
        if (contactBits.length) {
            doc.text(this.truncateToWidth(doc, contactBits.join("  |  "), w - this.PAD_X * 2), x + this.PAD_X, y0 + h - 14, {
                width: w - this.PAD_X * 2,
                lineBreak: false,
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

        const h = 128;
        this.ensureSpace(doc, data, h + 10);

        const y0 = doc.y;
        const leftX = x;
        const rightX = x + leftW + gap;

        // ===== Left split box =====
        this.box(doc, leftX, y0, leftW, h, { fill: "#FFFFFF" });

        const half = Math.floor(h / 2);
        this.hLine(doc, leftX, leftX + leftW, y0 + half);

        const clientName = this.clean((data.client as any).name || "-");
        const shipAddr = this.normalizeAddress((data.client as any).shippingAddress || (data.client as any).billingAddress, 2) || "-";
        const billAddr = this.normalizeAddress((data.client as any).billingAddress, 2) || "-";

        const phone = this.clean((data.client as any).phone);
        const email = this.clean((data.client as any).email);

        // Ship To
        this.label(doc, "Consignee (Ship To)", leftX + this.PAD_X, y0 + 6);
        doc.font(this.FONT_BOLD).fontSize(8.6).fillColor(this.INK);
        doc.text(clientName, leftX + this.PAD_X, y0 + 18, { width: leftW - this.PAD_X * 2, lineBreak: false });

        doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
        doc.text(shipAddr, leftX + this.PAD_X, y0 + 30, { width: leftW - this.PAD_X * 2 });

        // Bill To
        const by = y0 + half;
        this.label(doc, "Buyer (Bill To)", leftX + this.PAD_X, by + 6);
        doc.font(this.FONT_BOLD).fontSize(8.6).fillColor(this.INK);
        doc.text(clientName, leftX + this.PAD_X, by + 18, { width: leftW - this.PAD_X * 2, lineBreak: false });

        doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
        doc.text(billAddr, leftX + this.PAD_X, by + 30, { width: leftW - this.PAD_X * 2 });

        // Contact at bottom
        const contact = [phone ? `Ph: ${phone}` : "", email ? `Email: ${email}` : ""].filter(Boolean).join("  |  ");
        if (contact) {
            doc.font(this.FONT_REG).fontSize(7.0).fillColor(this.SUBTLE);
            doc.text(this.truncateToWidth(doc, contact, leftW - this.PAD_X * 2), leftX + this.PAD_X, y0 + h - 14, {
                width: leftW - this.PAD_X * 2,
                lineBreak: false,
            });
        }

        // ===== Right meta box =====
        this.box(doc, rightX, y0, rightW, h, { fill: "#FFFFFF" });

        const q: any = data.quote;
        const rows: Array<{ k: string; v: string }> = [
            { k: "Quote Date", v: this.safeDate(q.quoteDate) },
            { k: "Validity", v: q.validUntil ? `Until ${this.safeDate(q.validUntil)}` : `${Number(q.validityDays || 30)} days` },
            { k: "Reference", v: this.clean(q.referenceNumber || "-") },
            { k: "Prepared By", v: this.clean(data.preparedBy || "-") },
        ];

        const rH = Math.floor(h / rows.length);
        for (let i = 0; i < rows.length; i++) {
            const ry = y0 + i * rH;
            if (i > 0) this.hLine(doc, rightX, rightX + rightW, ry);

            const labelW = rightW * 0.5;
            const valueW = rightW - labelW - this.PAD_X * 2;

            doc.font(this.FONT_REG).fontSize(7.0).fillColor(this.SUBTLE);
            doc.text(rows[i].k, rightX + this.PAD_X, ry + 5, { width: labelW - this.PAD_X, lineBreak: false });

            doc.font(this.FONT_BOLD).fontSize(7.6).fillColor(this.INK);
            doc.text(this.truncateToWidth(doc, rows[i].v, valueW), rightX + labelW, ry + 5, {
                width: valueW,
                align: "right",
                lineBreak: false,
            });
        }

        doc.y = y0 + h + 10;
    }

    // ======================================================================
    // ITEMS TABLE (NO HSN/SAC)
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
            const descLines = this.wrapLines(doc, descText, desc - 8, 2);
            doc.restore();

            const rowH = Math.max(minRowH, 8 + descLines.length * 11);

            // Page break
            if (y + rowH > this.bottomY() - 12) {
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

            this.box(doc, x, y, w, rowH, { fill: "#FFFFFF" });

            doc.save();
            doc.strokeColor(this.LINE).lineWidth(0.8);
            [cx.desc, cx.qty, cx.unit, cx.rate, cx.amt].forEach((vx) => {
                doc.moveTo(vx, y).lineTo(vx, y + rowH).stroke();
            });
            doc.restore();

            // SL
            doc.font(this.FONT_REG).fontSize(8).fillColor(this.INK);
            doc.text(String(i + 1), cx.sl, y + Math.floor((rowH - 9) / 2) - 1, {
                width: sl,
                align: "center",
                lineBreak: false,
            });

            // Description
            let dy = y + 6;
            for (const ln of descLines) {
                doc.text(this.truncateToWidth(doc, ln, desc - 8), cx.desc + 4, dy, { width: desc - 8, lineBreak: false });
                dy += 11;
            }

            // Qty + Unit + Rate + Amount (centered and right-aligned)
            const midY = y + Math.floor((rowH - 10) / 2) - 1;
            doc.text(String(qtyVal), cx.qty, midY, { width: qty, align: "center", lineBreak: false });
            doc.text(unitText, cx.unit, midY, { width: unit, align: "center", lineBreak: false });

            // Rate + Amount - right aligned
            doc.font(this.FONT_BOLD).fontSize(8.0).fillColor(this.INK);
            doc.text(this.currency(rateVal), cx.rate, midY, { width: rate - 8, align: "right", lineBreak: false });
            doc.text(this.currency(amtVal), cx.amt, midY, { width: amt - 8, align: "right", lineBreak: false });

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

        const h = 122;
        this.ensureSpace(doc, data, h + 12);

        const y0 = doc.y;

        // Left box
        this.box(doc, x, y0, leftW, h, { fill: "#FFFFFF" });
        this.label(doc, "Amount Chargeable (in words)", x + this.PAD_X, y0 + 6);

        const q: any = data.quote;
        const total = Number(q.total) || 0;

        doc.font(this.FONT_BOLD).fontSize(7.8).fillColor(this.INK);
        doc.text(this.truncateToWidth(doc, this.amountToINRWords(total), leftW - this.PAD_X * 2), x + this.PAD_X, y0 + 20, {
            width: leftW - this.PAD_X * 2,
            lineBreak: false,
        });

        this.label(doc, "Terms & Conditions", x + this.PAD_X, y0 + 50);

        const termsInline = this.termsToInlineBullets(this.clean(q.termsAndConditions || "")) || "—";
        const termsLines = this.wrapLines(doc, termsInline, leftW - this.PAD_X * 2, 2);

        doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
        let ty = y0 + 62;
        for (const ln of termsLines) {
            doc.text(this.truncateToWidth(doc, ln, leftW - this.PAD_X * 2), x + this.PAD_X, ty, {
                width: leftW - this.PAD_X * 2,
                lineBreak: false,
            });
            ty += 10;
        }

        // Right totals box
        const xr = x + leftW + gap;
        this.box(doc, xr, y0, rightW, h, { fill: "#FFFFFF" });
        this.label(doc, "Totals", xr + this.PAD_X, y0 + 6);

        const subtotal = Number(q.subtotal) || 0;
        const shipping = Number(q.shippingCharges) || 0;
        const cgst = Number(q.cgst) || 0;
        const sgst = Number(q.sgst) || 0;
        const igst = Number(q.igst) || 0;

        const rows: Array<{ k: string; v: number; danger?: boolean; bold?: boolean }> = [];
        rows.push({ k: "Subtotal", v: subtotal });
        // Discount is applied in total calculation but not displayed separately
        if (shipping > 0) rows.push({ k: "Shipping", v: shipping });
        if (cgst > 0) rows.push({ k: "CGST", v: cgst });
        if (sgst > 0) rows.push({ k: "SGST", v: sgst });
        if (igst > 0 && cgst === 0 && sgst === 0) rows.push({ k: "IGST", v: igst });
        rows.push({ k: "TOTAL", v: total, bold: true });

        let ry = y0 + 22;
        const rowH = 14;
        const labelW = rightW * 0.55;
        const valueW = rightW - labelW - this.PAD_X * 2;

        for (const r of rows) {
            if (ry > y0 + h - 20) break;

            doc.font(this.FONT_BOLD).fontSize(r.bold ? 8.6 : 7.6).fillColor(this.INK);
            doc.text(r.k, xr + this.PAD_X, ry, { width: labelW - this.PAD_X, lineBreak: false });

            const moneyStr = this.currency(r.v);
            doc.font(this.FONT_BOLD).fontSize(r.bold ? 9.0 : 8.0).fillColor(r.danger ? this.DANGER : this.INK);
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
        const h = 76;

        this.ensureSpace(doc, data, h + 12);

        const y0 = doc.y;

        // Declaration
        this.box(doc, x, y0, colW, h, { fill: "#FFFFFF" });
        this.label(doc, "Declaration", x + this.PAD_X, y0 + 6);

        const declaration =
            this.clean(data.declarationText) ||
            "We declare that this proposal shows the actual price of the goods/services described and that all particulars are true and correct.";

        const declLines = this.wrapLines(doc, declaration, colW - this.PAD_X * 2, 2);
        doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
        let dy = y0 + 20;
        for (const ln of declLines) {
            doc.text(this.truncateToWidth(doc, ln, colW - this.PAD_X * 2), x + this.PAD_X, dy, {
                width: colW - this.PAD_X * 2,
                lineBreak: false,
            });
            dy += 9;
        }

        // Bank
        const xr = x + colW + gap;
        this.box(doc, xr, y0, colW, h, { fill: "#FFFFFF" });
        this.label(doc, "Company Bank Details for Payment", xr + this.PAD_X, y0 + 6);

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
        const bankLines2 = this.wrapLines(doc, bankText, colW - this.PAD_X * 2, 2);

        doc.font(this.FONT_BOLD).fontSize(7.2).fillColor(this.INK);
        let by = y0 + 20;
        for (const ln of bankLines2) {
            doc.text(this.truncateToWidth(doc, ln, colW - this.PAD_X * 2), xr + this.PAD_X, by, {
                width: colW - this.PAD_X * 2,
                lineBreak: false,
            });
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
        this.box(doc, x, y0, colW, h, { fill: "#FFFFFF" });
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
        this.box(doc, xr, y0, colW, h, { fill: "#FFFFFF" });
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
        const footerTop = this.PAGE_HEIGHT - 34;

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
    // TERMS INLINE
    // ======================================================================
    private static termsToInlineBullets(raw: string) {
        const t = this.clean(raw);
        if (!t) return "";

        const lines = t
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
            .map((l) => l.replace(/^[-*•\d.)\]]\s*/, ""));

        return lines.join(" • ").replace(/\s+/g, " ").trim();
    }
}