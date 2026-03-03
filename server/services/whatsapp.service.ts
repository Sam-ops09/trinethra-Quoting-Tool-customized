import { storage } from "../storage";
import { logger } from "../utils/logger";

/**
 * WhatsApp sharing service using wa.me deep links.
 * No external API dependency — generates shareable URLs
 * that open WhatsApp with pre-filled messages.
 */
export class WhatsAppService {
  /**
   * Build a wa.me deep link URL.
   * @param phone - Phone number (with country code, digits only)
   * @param message - Pre-filled message text
   */
  static buildWhatsAppUrl(phone: string | null | undefined, message: string): string {
    const encodedMessage = encodeURIComponent(message);
    if (phone) {
      // Strip non-digit characters
      const cleanPhone = phone.replace(/\D/g, "");
      return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    }
    // No phone → open WhatsApp contact picker with pre-filled message
    return `https://wa.me/?text=${encodedMessage}`;
  }

  /**
   * Generate a shareable message for a quote.
   */
  static async buildQuoteMessage(quoteId: string, baseUrl: string): Promise<{ message: string; phone: string | null }> {
    const quote = await storage.getQuote(quoteId);
    if (!quote) throw new Error("Quote not found");

    const client = await storage.getClient(quote.clientId);
    const allSettings = await storage.getAllSettings();
    const companyName = allSettings.find(s => s.key === "companyName")?.value || "Our Company";

    const publicLink = quote.publicToken
      ? `${baseUrl}/p/quote/${quote.publicToken}`
      : null;

    const lines = [
      `📋 *Quote ${quote.quoteNumber}*`,
      `From: ${companyName}`,
      `To: ${client?.name || "Client"}`,
      `Amount: ${quote.currency} ${quote.total}`,
      `Status: ${quote.status}`,
      quote.validUntil ? `Valid Until: ${new Date(quote.validUntil).toLocaleDateString()}` : null,
      "",
      publicLink ? `🔗 View & respond: ${publicLink}` : null,
    ].filter(Boolean);

    return {
      message: lines.join("\n"),
      phone: client?.phone || null,
    };
  }

  /**
   * Generate a shareable message for an invoice.
   */
  static async buildInvoiceMessage(invoiceId: string): Promise<{ message: string; phone: string | null }> {
    const invoice = await storage.getInvoice(invoiceId);
    if (!invoice) throw new Error("Invoice not found");

    const client = invoice.clientId ? await storage.getClient(invoice.clientId) : null;
    const allSettings = await storage.getAllSettings();
    const companyName = allSettings.find(s => s.key === "companyName")?.value || "Our Company";

    const remaining = Number(invoice.remainingAmount) || 0;
    const lines = [
      `🧾 *Invoice ${invoice.invoiceNumber}*`,
      `From: ${companyName}`,
      `To: ${client?.name || "Client"}`,
      `Total: ${invoice.currency || "INR"} ${invoice.total}`,
      `Paid: ${invoice.currency || "INR"} ${invoice.paidAmount}`,
      remaining > 0 ? `Outstanding: ${invoice.currency || "INR"} ${remaining.toFixed(2)}` : "✅ Fully Paid",
      `Due: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}`,
    ].filter(Boolean);

    return {
      message: lines.join("\n"),
      phone: client?.phone || null,
    };
  }
}
