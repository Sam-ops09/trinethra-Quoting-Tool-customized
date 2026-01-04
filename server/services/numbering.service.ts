import {DatabaseStorage, storage} from "../storage";

/**
 * NumberingService - Handles document number generation based on configured schemes
 *
 * Features:
 * - Configurable formats per document type (Quote, Invoice, PO, GRN)
 * - Format variables: {PREFIX}, {YEAR}, {COUNTER}
 * - Year-based counter management
 * - Automatic counter reset on January 1st
 */
export class NumberingService {
  /**
   * Generate a formatted quote number
   * Example: QT-2025-001
   */
  static async generateQuoteNumber(): Promise<string> {
    try {
      // Get configuration from settings - try both naming conventions
      let formatSetting = await storage.getSetting("quoteFormat");
      if (!formatSetting) formatSetting = await storage.getSetting("quote_number_format");

      let prefixSetting = await storage.getSetting("quotePrefix");
      if (!prefixSetting) prefixSetting = await storage.getSetting("quote_prefix");

      const format = formatSetting?.value || "{PREFIX}-{YEAR}-{COUNTER:04d}";
      const prefix = prefixSetting?.value || "QT";

      // Get and increment counter
      const counter = await this.getAndIncrementCounter("quote");

      // Generate number using format
      return this.applyFormat(format, prefix, counter);
    } catch (error) {
      console.error("Error generating quote number:", error);
      // Fallback to simple format if numbering service fails
      const counter = Math.floor(Math.random() * 10000);
      return `QT-${String(counter).padStart(4, "0")}`;
    }
  }

  /**
   * Generate a formatted master invoice number
   * Example: MINV-2025-001
   */
  static async generateMasterInvoiceNumber(): Promise<string> {
    try {
      let formatSetting = await storage.getSetting("masterInvoiceFormat");
      if (!formatSetting) formatSetting = await storage.getSetting("master_invoice_number_format");

      let prefixSetting = await storage.getSetting("masterInvoicePrefix");
      if (!prefixSetting) prefixSetting = await storage.getSetting("master_invoice_prefix");

      const format = formatSetting?.value || "{PREFIX}-{YEAR}-{COUNTER:04d}";
      const prefix = prefixSetting?.value || "MINV";

      const counter = await this.getAndIncrementCounter("master_invoice");
      return this.applyFormat(format, prefix, counter);
    } catch (error) {
      console.error("Error generating master invoice number:", error);
      const counter = Math.floor(Math.random() * 10000);
      return `MINV-${String(counter).padStart(4, "0")}`;
    }
  }

  /**
   * Generate a formatted child invoice number
   * Example: INV-2025-001
   */
  static async generateChildInvoiceNumber(): Promise<string> {
    try {
      let formatSetting = await storage.getSetting("childInvoiceFormat");
      if (!formatSetting) formatSetting = await storage.getSetting("invoice_number_format");

      let prefixSetting = await storage.getSetting("childInvoicePrefix");
      if (!prefixSetting) prefixSetting = await storage.getSetting("invoice_prefix");

      const format = formatSetting?.value || "{PREFIX}-{YEAR}-{COUNTER:04d}";
      const prefix = prefixSetting?.value || "INV";

      const counter = await this.getAndIncrementCounter("child_invoice");
      return this.applyFormat(format, prefix, counter);
    } catch (error) {
      console.error("Error generating child invoice number:", error);
      const counter = Math.floor(Math.random() * 10000);
      return `INV-${String(counter).padStart(4, "0")}`;
    }
  }

  /**
   * Generate a formatted invoice number (backwards compatibility)
   * Example: INV-2025-001
   */
  static async generateInvoiceNumber(): Promise<string> {
    // Use child invoice number for backwards compatibility
    return this.generateChildInvoiceNumber();
  }

  /**
   * Generate a formatted vendor PO number
   * Example: PO-2025-001
   */
  static async generateVendorPoNumber(): Promise<string> {
    try {
      let formatSetting = await storage.getSetting("vendorPoFormat");
      if (!formatSetting) formatSetting = await storage.getSetting("po_number_format");

      let prefixSetting = await storage.getSetting("vendorPoPrefix");
      if (!prefixSetting) prefixSetting = await storage.getSetting("po_prefix");

      const format = formatSetting?.value || "{PREFIX}-{YEAR}-{COUNTER:04d}";
      const prefix = prefixSetting?.value || "PO";

      const counter = await this.getAndIncrementCounter("vendor_po");
      return this.applyFormat(format, prefix, counter);
    } catch (error) {
      console.error("Error generating vendor PO number:", error);
      const counter = Math.floor(Math.random() * 10000);
      return `PO-${String(counter).padStart(4, "0")}`;
    }
  }

  /**
   * Generate a formatted GRN number
   * Example: GRN-2025-001
   */
  static async generateGrnNumber(): Promise<string> {
    try {
      let formatSetting = await storage.getSetting("grnFormat");
      if (!formatSetting) formatSetting = await storage.getSetting("grn_number_format");

      let prefixSetting = await storage.getSetting("grnPrefix");
      if (!prefixSetting) prefixSetting = await storage.getSetting("grn_prefix");

      const format = formatSetting?.value || "{PREFIX}-{YEAR}-{COUNTER:04d}";
      const prefix = prefixSetting?.value || "GRN";

      const counter = await this.getAndIncrementCounter("grn");
      return this.applyFormat(format, prefix, counter);
    } catch (error) {
      console.error("Error generating GRN number:", error);
      const counter = Math.floor(Math.random() * 10000);
      return `GRN-${String(counter).padStart(4, "0")}`;
    }
  }

  /**
   * Get the next counter value and increment it
   * Uses year-based counter keys (e.g., quote_counter_2025)
   * Always checks DB for the latest value before incrementing
   * Counters start from 1 (formatted as 001 with padding)
   */
  private static async getAndIncrementCounter(type: string): Promise<number> {
    const year = new Date().getFullYear();
    const counterKey = `${type}_counter_${year}`;

    // Always fetch from DB to get the latest counter value
    // This ensures we never miss any increments from concurrent requests
    const currentCounterSetting = await storage.getSetting(counterKey);

    // Determine current value:
    // - If setting exists: parse the stored value
    // - If setting doesn't exist: this is the first time, initialize to 0 (will become 1)
    let currentValue = 0;

    if (currentCounterSetting && currentCounterSetting.value) {
      const parsed = parseInt(currentCounterSetting.value, 10);
      if (!isNaN(parsed)) {
        currentValue = parsed;
      }
    }

    // Increment to get next value
    const nextValue = currentValue + 1;

    console.log(`[NumberingService] ${type}_${year}: current=${currentValue}, next=${nextValue}`);

    // Save updated counter to DB
    // Note: We don't set updatedBy to avoid foreign key constraint violations
    // The settings table has a FK constraint on updatedBy, so we leave it null
    await storage.upsertSetting({
      key: counterKey,
      value: String(nextValue),
    });

    return nextValue;
  }

  /**
   * Apply format string with variables
   * Supported variables:
   * - {PREFIX}: Document prefix (QT, INV, PO, GRN)
   * - {YEAR}: Current year (2025)
   * - {COUNTER}: Counter value (1, 2, 3...)
   * - {COUNTER:04d}: Counter with zero padding to 4 digits (0001, 0002...)
   */
  private static applyFormat(format: string, prefix: string, counter: number): string {
    let result = format;

    // Replace {PREFIX}
    result = result.replace(/{PREFIX}/g, prefix);

    // Replace {YEAR}
    const year = new Date().getFullYear();
    result = result.replace(/{YEAR}/g, String(year));

    // Replace {COUNTER} variants
    // {COUNTER:04d} = zero-padded to 4 digits
    // {COUNTER:05d} = zero-padded to 5 digits
    // {COUNTER} = no padding
    result = result.replace(/{COUNTER:(\d+)d}/g, (match, padding) => {
      return String(counter).padStart(parseInt(padding), "0");
    });

    // Default {COUNTER} with 4-digit padding
    result = result.replace(/{COUNTER}/g, String(counter).padStart(4, "0"));

    return result;
  }

  /**
   * Reset a counter to 0 (for testing/admin purposes)
   */
  static async resetCounter(type: string, year: number): Promise<void> {
    const counterKey = `${type}_counter_${year}`;
    console.log(`[NumberingService] RESETTING counter ${counterKey} to 0`);
    await storage.upsertSetting({
      key: counterKey,
      value: "0",
    });
  }

  /**
   * Set a counter to a specific value
   */
  static async setCounter(type: string, year: number, value: number): Promise<void> {
    const counterKey = `${type}_counter_${year}`;
    console.log(`[NumberingService] Setting counter ${counterKey} to ${value}`);
    await storage.upsertSetting({
      key: counterKey,
      value: String(value),
    });
  }

  /**
   * Get current counter value without incrementing
   */
  static async getCounter(type: string, year: number): Promise<number> {
    const counterKey = `${type}_counter_${year}`;
    const setting = await storage.getSetting(counterKey);
    const value = setting ? parseInt(setting.value || "0", 10) : 0;
    console.log(`[NumberingService] Current ${counterKey} = ${value}`);
    return value;
  }
}
