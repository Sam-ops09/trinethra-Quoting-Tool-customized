import { storage } from "../storage";
import { NumberingService } from "./numbering.service";

/**
 * DocumentNumberMigrationService
 * Handles updating all document numbers when numbering schemes are changed
 * Supports: Quotes, Invoices (Master & Child), Vendor POs, GRNs
 */
export class DocumentNumberMigrationService {
  /**
   * Migrate all document numbers based on updated numbering schemes
   * This is called when the admin updates the numbering configuration
   */
  static async migrateAllDocumentNumbers(options: {
    migrateQuotes?: boolean;
    migrateVendorPos?: boolean;
    migrateMasterInvoices?: boolean;
    migrateChildInvoices?: boolean;
    migrateGrns?: boolean;
  }): Promise<{
    success: boolean;
    migrated: {
      quotes: number;
      vendorPos: number;
      masterInvoices: number;
      childInvoices: number;
      grns: number;
    };
    errors: string[];
  }> {
    const results = {
      quotes: 0,
      vendorPos: 0,
      masterInvoices: 0,
      childInvoices: 0,
      grns: 0,
    };

    const errors: string[] = [];

    try {
      // Migrate Quotes
      if (options.migrateQuotes !== false) {
        try {
          results.quotes = await this.migrateQuoteNumbers();
        } catch (error) {
          errors.push(`Failed to migrate quotes: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      // Migrate Vendor Purchase Orders
      if (options.migrateVendorPos !== false) {
        try {
          results.vendorPos = await this.migrateVendorPoNumbers();
        } catch (error) {
          errors.push(`Failed to migrate vendor POs: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      // Migrate Master Invoices
      if (options.migrateMasterInvoices !== false) {
        try {
          results.masterInvoices = await this.migrateMasterInvoiceNumbers();
        } catch (error) {
          errors.push(`Failed to migrate master invoices: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      // Migrate Child Invoices
      if (options.migrateChildInvoices !== false) {
        try {
          results.childInvoices = await this.migrateChildInvoiceNumbers();
        } catch (error) {
          errors.push(`Failed to migrate child invoices: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      // Migrate GRNs
      if (options.migrateGrns !== false) {
        try {
          results.grns = await this.migrateGrnNumbers();
        } catch (error) {
          errors.push(`Failed to migrate GRNs: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      return {
        success: errors.length === 0,
        migrated: results,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        migrated: results,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Migrate all quote numbers
   * Regenerates quote numbers based on current numbering scheme
   */
  private static async migrateQuoteNumbers(): Promise<number> {
    const quotes = await storage.getAllQuotes();
    let migratedCount = 0;

    // Sort quotes by creation date to maintain order
    const sortedQuotes = quotes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Reset counters for all years
    await this.resetCounters("quote");

    // Regenerate numbers for each quote
    for (const quote of sortedQuotes) {
      try {
        const newQuoteNumber = await NumberingService.generateQuoteNumber();
        await storage.updateQuote(quote.id, { quoteNumber: newQuoteNumber });
        migratedCount++;
      } catch (error) {
        console.error(`Failed to migrate quote ${quote.id}:`, error);
      }
    }

    return migratedCount;
  }

  /**
   * Migrate all vendor PO numbers
   */
  private static async migrateVendorPoNumbers(): Promise<number> {
    const vendorPos = await storage.getAllVendorPos();
    let migratedCount = 0;

    // Sort by creation date
    const sortedPos = vendorPos.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Reset counters
    await this.resetCounters("vendor_po");

    // Regenerate numbers
    for (const po of sortedPos) {
      try {
        const newPoNumber = await NumberingService.generateVendorPoNumber();
        await storage.updateVendorPo(po.id, { poNumber: newPoNumber });
        migratedCount++;
      } catch (error) {
        console.error(`Failed to migrate vendor PO ${po.id}:`, error);
      }
    }

    return migratedCount;
  }

  /**
   * Migrate all master invoice numbers
   */
  private static async migrateMasterInvoiceNumbers(): Promise<number> {
    const invoices = await storage.getAllInvoices();
    const masterInvoices = invoices.filter((inv) => inv.isMaster);
    let migratedCount = 0;

    // Sort by creation date
    const sortedInvoices = masterInvoices.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Reset counters
    await this.resetCounters("master_invoice");

    // Regenerate numbers
    for (const invoice of sortedInvoices) {
      try {
        const newInvoiceNumber = await NumberingService.generateMasterInvoiceNumber();
        await storage.updateInvoice(invoice.id, { invoiceNumber: newInvoiceNumber });
        migratedCount++;
      } catch (error) {
        console.error(`Failed to migrate master invoice ${invoice.id}:`, error);
      }
    }

    return migratedCount;
  }

  /**
   * Migrate all child invoice numbers
   */
  private static async migrateChildInvoiceNumbers(): Promise<number> {
    const invoices = await storage.getAllInvoices();
    const childInvoices = invoices.filter((inv) => !inv.isMaster);
    let migratedCount = 0;

    // Sort by creation date
    const sortedInvoices = childInvoices.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Reset counters
    await this.resetCounters("child_invoice");

    // Regenerate numbers
    for (const invoice of sortedInvoices) {
      try {
        const newInvoiceNumber = await NumberingService.generateChildInvoiceNumber();
        await storage.updateInvoice(invoice.id, { invoiceNumber: newInvoiceNumber });
        migratedCount++;
      } catch (error) {
        console.error(`Failed to migrate child invoice ${invoice.id}:`, error);
      }
    }

    return migratedCount;
  }

  /**
   * Migrate all GRN numbers
   */
  private static async migrateGrnNumbers(): Promise<number> {
    const grns = await storage.getAllGrns();
    let migratedCount = 0;

    // Sort by creation date
    const sortedGrns = grns.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Reset counters
    await this.resetCounters("grn");

    // Regenerate numbers
    for (const grn of sortedGrns) {
      try {
        const newGrnNumber = await NumberingService.generateGrnNumber();
        await storage.updateGrn(grn.id, { grnNumber: newGrnNumber });
        migratedCount++;
      } catch (error) {
        console.error(`Failed to migrate GRN ${grn.id}:`, error);
      }
    }

    return migratedCount;
  }

  /**
   * Reset all counters for a document type
   * Clears all year-based counters (e.g., quote_counter_2024, quote_counter_2025)
   */
  private static async resetCounters(docType: string): Promise<void> {
    // Get all settings that match the counter pattern
    const allSettings = await storage.getAllSettings();
    const counterKeys = allSettings
      .map((s) => s.key)
      .filter((key) => key.startsWith(`${docType}_counter_`));

    // Delete all counter settings for this type
    for (const key of counterKeys) {
      await storage.deleteSetting(key);
    }
  }
}

