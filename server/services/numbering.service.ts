import {DatabaseStorage, storage} from "../storage";
import { db } from "../db";
import { sql } from "drizzle-orm";

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
   * Generate a formatted invoice number (unified for all invoices)
   * Example: INV-2025-001
   * Both master and child invoices use the same numbering sequence
   */
  static async generateMasterInvoiceNumber(): Promise<string> {
    try {
      // Try master specific settings first
      let formatSetting = await storage.getSetting("masterInvoiceFormat");
      let prefixSetting = await storage.getSetting("masterInvoicePrefix");
      
      // Fallback to generic invoice settings
      if (!formatSetting) formatSetting = await storage.getSetting("invoiceFormat");
      if (!formatSetting) formatSetting = await storage.getSetting("invoice_number_format");

      if (!prefixSetting) prefixSetting = await storage.getSetting("invoicePrefix");
      if (!prefixSetting) prefixSetting = await storage.getSetting("invoice_prefix");

      const format = formatSetting?.value || "{PREFIX}-{YEAR}-{COUNTER:04d}";
      const prefix = prefixSetting?.value || "MINV";

      // Use unified counter for all invoices
      const counter = await this.getAndIncrementCounter("invoice");
      return this.applyFormat(format, prefix, counter);
    } catch (error) {
      console.error("Error generating master invoice number:", error);
      const counter = Math.floor(Math.random() * 10000);
      return `MINV-${String(counter).padStart(4, "0")}`;
    }
  }

  /**
   * Generate a formatted invoice number (unified for all invoices)
   * Example: INV-2025-001
   * Both master and child invoices use the same numbering sequence
   */
  static async generateChildInvoiceNumber(): Promise<string> {
    try {
      // Try child specific settings first
      let formatSetting = await storage.getSetting("childInvoiceFormat");
      let prefixSetting = await storage.getSetting("childInvoicePrefix");
      
      // Fallback to generic invoice settings
      if (!formatSetting) formatSetting = await storage.getSetting("invoiceFormat");
      if (!formatSetting) formatSetting = await storage.getSetting("invoice_number_format");

      if (!prefixSetting) prefixSetting = await storage.getSetting("invoicePrefix");
      if (!prefixSetting) prefixSetting = await storage.getSetting("invoice_prefix");

      const format = formatSetting?.value || "{PREFIX}-{YEAR}-{COUNTER:04d}";
      const prefix = prefixSetting?.value || "INV";

      // Use unified counter for all invoices
      const counter = await this.getAndIncrementCounter("invoice");
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
   * Generate a formatted sales order number
   * Example: SO-2025-001
   */
  static async generateSalesOrderNumber(): Promise<string> {
    try {
      let formatSetting = await storage.getSetting("salesOrderFormat");
      if (!formatSetting) formatSetting = await storage.getSetting("sales_order_number_format");

      let prefixSetting = await storage.getSetting("salesOrderPrefix");
      if (!prefixSetting) prefixSetting = await storage.getSetting("sales_order_prefix");

      const format = formatSetting?.value || "{PREFIX}-{YEAR}-{COUNTER:04d}";
      const prefix = prefixSetting?.value || "SO";

      const counter = await this.getAndIncrementCounter("sales_order");
      return this.applyFormat(format, prefix, counter);
    } catch (error) {
      console.error("Error generating sales order number:", error);
      const counter = Math.floor(Math.random() * 10000);
      return `SO-${String(counter).padStart(4, "0")}`;
    }
  }

  /**
   * Get the next counter value and increment it
   * Uses year-based counter keys (e.g., quote_counter_2025)
   * Uses ATOMIC SQL UPDATE to prevent race conditions
   * Counters start from 1 (formatted as 001 with padding)
   */
  private static async getAndIncrementCounter(type: string): Promise<number> {
    const year = new Date().getFullYear();
    const counterKey = `${type}_counter_${year}`;

    // ATOMIC UPSERT: 
    // Try to insert '1'. On conflict (key exists), increment current value + 1 and return it.
    // We cast to integer for math, then back to text for storage.
    const result = await db.execute(sql`
      INSERT INTO settings (id, key, value, updated_at) 
      VALUES (${sql`gen_random_uuid()`}, ${counterKey}, '1', NOW())
      ON CONFLICT (key) DO UPDATE 
      SET value = (CAST(settings.value AS INTEGER) + 1)::text, updated_at = NOW()
      RETURNING value
    `);

    // Drizzle's execute returns a raw result. Structure depends on driver, but usually rows are in result[0] or result.rows
    // For pg driver common in Drizzle:
    // The result from a RETURNING clause is typically in rows.
    
    // Safety check for result parsing
    let nextValue = 1;
    if (result && Array.isArray(result) && result.length > 0 && result[0].value) {
        // Some drivers return array of rows directly
        nextValue = parseInt(result[0].value, 10);
    } else if (result && 'rows' in result && Array.isArray((result as any).rows) && (result as any).rows.length > 0) {
        // PG driver often returns { rows: [...] }
        nextValue = parseInt((result as any).rows[0].value, 10);
    } else {
       // Fallback: If we can't parse the atomic result, we SHOULD NOT fall back to a non-atomic read.
       // That would re-introduce race conditions. Instead, we should log a critical error and fail.
       console.error(`[NumberingService] CRITICAL: Failed to parse atomic result for ${counterKey}. Result was:`, result);
       throw new Error(`Failed to generate atomic counter for ${type}. Database driver response format unexpected.`);
    }

    console.log(`[NumberingService] ${type}_${year}: next=${nextValue}`);
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
