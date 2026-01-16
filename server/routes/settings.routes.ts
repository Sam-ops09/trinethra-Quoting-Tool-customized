
import { Router, Response, Request } from "express";
import { authMiddleware, AuthRequest } from "../middleware";
import { logger } from "../utils/logger";
import { storage } from "../storage";
import { db } from "../db";
import * as schema from "../../shared/schema";
import { eq } from "drizzle-orm";
import { NumberingService } from "../services/numbering.service";
import { EmailService } from "../services/email.service";

const router = Router();

// ==================== SETTINGS ROUTES ====================
router.get("/settings", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Only admins can access settings" });
    }
    const settingsArray = await storage.getAllSettings();
    // Convert array to key-value object for easier frontend consumption
    const settingsObject = settingsArray.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
    return res.json(settingsObject);
  } catch (error) {
    logger.error("Error fetching settings:", error);
    return res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.post("/settings", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Only admins can update settings" });
    }

    const body = req.body;

    // Whitelist of allowed settings keys - helps prevent arbitrary settings injection
    const ALLOWED_SETTINGS_KEYS = [
      // Company info
      "companyName", "companyAddress", "companyPhone", "companyEmail", "companyWebsite",
      "gstin", "pan", "cin", "logo", "companyLogo",
      // Bank details
      "bankName", "bankAccountNumber", "bankAccountName", "bankIfscCode", "bankBranch", "bankSwiftCode",
      // Document prefixes
      "quotePrefix", "invoicePrefix", "childInvoicePrefix", "salesOrderPrefix", "vendorPoPrefix", "grnPrefix",
      // Document formats
      "quoteFormat", "invoiceFormat", "childInvoiceFormat", "salesOrderFormat", "vendorPoFormat", "grnFormat",
      // Date format
      "dateFormat", "fiscalYearStart",
      // Feature-related settings
      "defaultCurrency", "defaultTaxRate", "defaultPaymentTerms",
      // Email settings
      "emailFrom", "emailReplyTo", "emailFooter",
      // Terms and conditions
      "defaultTermsAndConditions", "defaultNotes",
    ];

    const validateSettingKey = (key: string): boolean => {
      return ALLOWED_SETTINGS_KEYS.includes(key) || key.startsWith("custom_");
    };

    // Check if it's a single key-value pair or bulk update
    if (body.key && body.value !== undefined) {
      // Validate single setting key
      if (!validateSettingKey(body.key)) {
        return res.status(400).json({ error: `Invalid setting key: ${body.key}` });
      }
      // Single setting update
      const setting = await storage.upsertSetting({
        key: body.key,
        value: body.value,
        updatedBy: req.user!.id,
      });
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_setting",
        entityType: "setting",
        entityId: body.key,
      });
      return res.json(setting);
    } else {
      // Bulk settings update
      const results = [];
      const invalidKeys: string[] = [];
      
      for (const [key, value] of Object.entries(body)) {
        if (!validateSettingKey(key)) {
          invalidKeys.push(key);
          continue;
        }
        if (value !== undefined && value !== null) {
          const setting = await storage.upsertSetting({
            key,
            value: String(value),
            updatedBy: req.user!.id,
          });
          results.push(setting);
        }
      }

      if (invalidKeys.length > 0) {
        logger.warn(`[Settings] Ignored invalid keys: ${invalidKeys.join(", ")}`);
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_settings",
        entityType: "settings",
        entityId: "bulk",
      });

      return res.json(results);
    }
  } catch (error: any) {
    logger.error("Error updating settings:", error);
    return res.status(500).json({ error: error.message || "Failed to update setting" });
  }
});

// ==================== BANK DETAILS ROUTES ====================

router.get("/bank-details", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Only admins can access bank details" });
    }
    const details = await storage.getAllBankDetails();
    return res.json(details);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch bank details" });
  }
});

router.get("/bank-details/active", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const detail = await storage.getActiveBankDetails();
    return res.json(detail || null);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch active bank details" });
  }
});

router.post("/bank-details", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Only admins can create bank details" });
    }

    const { bankName, accountNumber, accountName, ifscCode, branch, swiftCode } = req.body;

    if (!bankName || !accountNumber || !accountName || !ifscCode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const detail = await storage.createBankDetails({
      bankName,
      accountNumber,
      accountName,
      ifscCode,
      branch: branch || null,
      swiftCode: swiftCode || null,
      isActive: true,
      updatedBy: req.user!.id,
    });

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "create_bank_details",
      entityType: "bank_details",
      entityId: detail.id,
    });

    return res.json(detail);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to create bank details" });
  }
});

router.put("/bank-details/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Only admins can update bank details" });
    }

    const { bankName, accountNumber, accountName, ifscCode, branch, swiftCode, isActive } = req.body;

    const detail = await storage.updateBankDetails(
      req.params.id,
      {
        ...(bankName && { bankName }),
        ...(accountNumber && { accountNumber }),
        ...(accountName && { accountName }),
        ...(ifscCode && { ifscCode }),
        ...(branch !== undefined && { branch }),
        ...(swiftCode !== undefined && { swiftCode }),
        ...(isActive !== undefined && { isActive }),
        updatedBy: req.user!.id,
      }
    );

    if (!detail) {
      return res.status(404).json({ error: "Bank details not found" });
    }

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "update_bank_details",
      entityType: "bank_details",
      entityId: detail.id,
    });

    return res.json(detail);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to update bank details" });
  }
});

router.delete("/bank-details/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete bank details" });
    }

    await storage.deleteBankDetails(req.params.id);

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "delete_bank_details",
      entityType: "bank_details",
      entityId: req.params.id,
    });

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to delete bank details" });
  }
});

// ==================== DOCUMENT NUMBER MIGRATION ROUTES ====================
// Note: Using dynamic import for services that might have circular dependencies or heavy initialization

router.post("/settings/migrate-document-numbers", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Only admins can migrate document numbers" });
    }

    const { DocumentNumberMigrationService } = await import("../services/document-number-migration.service");

    const options = {
      migrateQuotes: req.body.migrateQuotes !== false,
      migrateVendorPos: req.body.migrateVendorPos !== false,
      migrateMasterInvoices: req.body.migrateMasterInvoices !== false,
      migrateChildInvoices: req.body.migrateChildInvoices !== false,
      migrateGrns: req.body.migrateGrns !== false,
    };

    const result = await DocumentNumberMigrationService.migrateAllDocumentNumbers(options);

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "migrate_document_numbers",
      entityType: "settings",
      entityId: "document_numbering",
    });

    return res.json({
      success: result.success,
      message: result.success ? "Document numbers migrated successfully" : "Some migrations failed",
      migrated: result.migrated,
      errors: result.errors,
    });
  } catch (error: any) {
    logger.error("Document number migration error:", error);
    return res.status(500).json({
      error: error.message || "Failed to migrate document numbers",
      success: false,
    });
  }
});

// ==================== NUMBERING COUNTER ROUTES ====================

router.get("/numbering/counters", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Only admins can access counter values" });
    }

    const { NumberingService } = await import("../services/numbering.service");
    const { featureFlags } = await import("../../shared/feature-flags");
    const year = new Date().getFullYear();

    const counters: any = { year };

    // Only include counters for enabled features
    if (featureFlags.quotes_module) {
      counters.quote = await NumberingService.getCounter("quote", year);
    }
    if (featureFlags.vendorPO_module) {
      counters.vendor_po = await NumberingService.getCounter("vendor_po", year);
    }
    if (featureFlags.invoices_module) {
      counters.invoice = await NumberingService.getCounter("invoice", year);
    }
    if (featureFlags.grn_module) {
      counters.grn = await NumberingService.getCounter("grn", year);
    }
    if (featureFlags.sales_orders_module) {
      counters.sales_order = await NumberingService.getCounter("sales_order", year);
    }

    return res.json(counters);
  } catch (error: any) {
    logger.error("Get counters error:", error);
    return res.status(500).json({ error: error.message || "Failed to get counters" });
  }
});

router.post("/numbering/reset-counter", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Only admins can reset counters" });
    }

    const { type, year } = req.body;

    if (!type) {
      return res.status(400).json({ error: "Counter type is required" });
    }

    const validTypes = ["quote", "vendor_po", "invoice", "grn", "sales_order"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid counter type" });
    }

    // Check if feature is enabled
    const { featureFlags } = await import("../../shared/feature-flags");
    const featureMap: Record<string, boolean> = {
      quote: featureFlags.quotes_module,
      vendor_po: featureFlags.vendorPO_module,
      invoice: featureFlags.invoices_module,
      grn: featureFlags.grn_module,
      sales_order: featureFlags.sales_orders_module,
    };

    if (!featureMap[type]) {
      return res.status(403).json({ error: `Feature for ${type} is not enabled` });
    }

    const { NumberingService } = await import("../services/numbering.service");
    const targetYear = year || new Date().getFullYear();

    await NumberingService.resetCounter(type, targetYear);

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "reset_counter",
      entityType: "numbering",
      entityId: `${type}_${targetYear}`,
    });

    return res.json({
      success: true,
      message: `Counter for ${type} (${targetYear}) reset to 0`,
      currentValue: 0,
    });
  } catch (error: any) {
    logger.error("Reset counter error:", error);
    return res.status(500).json({ error: error.message || "Failed to reset counter" });
  }
});

// ==================== TAX RATES & PAYMENT TERMS ROUTES ====================

// Get all tax rates
router.get("/tax-rates", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const rates = await db.select().from(schema.taxRates).where(eq(schema.taxRates.isActive, true));
    // Transform to simpler format for frontend
    const simplifiedRates = rates.map(rate => ({
      id: rate.id,
      name: `${rate.taxType} ${rate.region}`,
      percentage: parseFloat(rate.igstRate), // Use IGST as the main rate
      sgstRate: parseFloat(rate.sgstRate),
      cgstRate: parseFloat(rate.cgstRate),
      igstRate: parseFloat(rate.igstRate),
      region: rate.region,
      taxType: rate.taxType,
      isActive: rate.isActive,
      effectiveFrom: rate.effectiveFrom,
      effectiveTo: rate.effectiveTo,
    }));
    return res.json(simplifiedRates);
  } catch (error: any) {
    logger.error("Error fetching tax rates:", error);
    return res.status(500).json({ error: "Failed to fetch tax rates" });
  }
});

// Create tax rate
router.post("/tax-rates", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!["admin", "finance_accounts"].includes(req.user!.role)) {
      return res.status(403).json({ error: "Forbidden: Only admin and finance can manage tax rates" });
    }

    const { region, taxType, sgstRate, cgstRate, igstRate, description } = req.body;

    if (!region || !taxType) {
      return res.status(400).json({ error: "Region and taxType are required" });
    }

    // Use the rates provided by the client, default to 0 if not provided
    const sgst = sgstRate !== undefined && sgstRate !== null ? String(sgstRate) : "0";
    const cgst = cgstRate !== undefined && cgstRate !== null ? String(cgstRate) : "0";
    const igst = igstRate !== undefined && igstRate !== null ? String(igstRate) : "0";

    const newRate = await db.insert(schema.taxRates).values({
      region,
      taxType,
      sgstRate: sgst,
      cgstRate: cgst,
      igstRate: igst,
    }).returning();

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "create_tax_rate",
      entityType: "tax_rate",
      entityId: newRate[0].id,
    });

    return res.json({
      id: newRate[0].id,
      region,
      region_name: region, // Ensure compatibility
      taxType,
      sgstRate: parseFloat(sgst),
      cgstRate: parseFloat(cgst),
      igstRate: parseFloat(igst),
    });
  } catch (error: any) {
    logger.error("Error creating tax rate:", error);
    return res.status(500).json({ error: error.message || "Failed to create tax rate" });
  }
});

// Delete tax rate
router.delete("/tax-rates/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!["admin", "finance_accounts"].includes(req.user!.role)) {
      return res.status(403).json({ error: "Forbidden: Only admin and finance can manage tax rates" });
    }

    await db.delete(schema.taxRates).where(eq(schema.taxRates.id, req.params.id));

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "delete_tax_rate",
      entityType: "tax_rate",
      entityId: req.params.id,
    });

    return res.json({ success: true });
  } catch (error: any) {
    logger.error("Error deleting tax rate:", error);
    return res.status(500).json({ error: error.message || "Failed to delete tax rate" });
  }
});

// Get all payment terms
router.get("/payment-terms", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const terms = await db.select().from(schema.paymentTerms).where(eq(schema.paymentTerms.isActive, true));
    return res.json(terms);
  } catch (error: any) {
    logger.error("Error fetching payment terms:", error);
    return res.status(500).json({ error: "Failed to fetch payment terms" });
  }
});

// Create payment term
router.post("/payment-terms", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!["admin", "finance_accounts"].includes(req.user!.role)) {
      return res.status(403).json({ error: "Forbidden: Only admin and finance can manage payment terms" });
    }

    const { name, days, description, isDefault } = req.body;

    if (!name || days === undefined) {
      return res.status(400).json({ error: "Name and days are required" });
    }

    // If this is set as default, remove default from others
    if (isDefault) {
      await db.update(schema.paymentTerms).set({ isDefault: false }).where(eq(schema.paymentTerms.isDefault, true));
    }

    const newTerm = await db.insert(schema.paymentTerms).values({
      name,
      days,
      description: description || null,
      isDefault: isDefault || false,
      createdBy: req.user!.id,
    }).returning();

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "create_payment_term",
      entityType: "payment_term",
      entityId: newTerm[0].id,
    });

    return res.json(newTerm[0]);
  } catch (error: any) {
    logger.error("Error creating payment term:", error);
    return res.status(500).json({ error: error.message || "Failed to create payment term" });
  }
});

// Delete payment term
router.delete("/payment-terms/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!["admin", "finance_accounts"].includes(req.user!.role)) {
      return res.status(403).json({ error: "Forbidden: Only admin and finance can manage payment terms" });
    }

    await db.delete(schema.paymentTerms).where(eq(schema.paymentTerms.id, req.params.id));

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "delete_payment_term",
      entityType: "payment_term",
      entityId: req.params.id,
    });

    return res.json({ success: true });
  } catch (error: any) {
    logger.error("Error deleting payment term:", error);
    return res.status(500).json({ error: error.message || "Failed to delete payment term" });
  }
});

// ==================== CURRENCY SETTINGS ROUTES ====================

router.get("/currency-settings", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const settings = await storage.getCurrencySettings();
    if (!settings) {
      return res.json({ baseCurrency: "INR", supportedCurrencies: "[]", exchangeRates: "{}" });
    }
    return res.json(settings);
  } catch (error) {
    logger.error("Get currency settings error:", error);
    return res.status(500).json({ error: "Failed to fetch currency settings" });
  }
});

router.post("/currency-settings", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { baseCurrency, supportedCurrencies, exchangeRates } = req.body;

    const settings = await storage.upsertCurrencySettings({
      baseCurrency: baseCurrency || "INR",
      supportedCurrencies: typeof supportedCurrencies === "string" ? supportedCurrencies : JSON.stringify(supportedCurrencies),
      exchangeRates: typeof exchangeRates === "string" ? exchangeRates : JSON.stringify(exchangeRates),
    });

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "update_currency_settings",
      entityType: "settings",
    });

    return res.json(settings);
  } catch (error: any) {
    logger.error("Update currency settings error:", error);
    return res.status(500).json({ error: error.message || "Failed to update currency settings" });
  }
});

// ==================== ADMIN SETTINGS ROUTES ====================

router.get("/admin/settings", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const settings = await storage.getAllSettings();
    const settingsMap: Record<string, string> = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    // Organize settings by category
    const categories = {
      company: {
        companyName: settingsMap["companyName"] || "",
        companyEmail: settingsMap["companyEmail"] || "",
        companyPhone: settingsMap["companyPhone"] || "",
        companyWebsite: settingsMap["companyWebsite"] || "",
        companyAddress: settingsMap["companyAddress"] || "",
        companyLogo: settingsMap["companyLogo"] || "",
      },
      taxation: {
        gstin: settingsMap["gstin"] || "",
        taxType: settingsMap["taxType"] || "GST", // GST, VAT, etc.
        defaultTaxRate: settingsMap["defaultTaxRate"] || "18",
        enableIGST: settingsMap["enableIGST"] === "true",
        enableCGST: settingsMap["enableCGST"] === "true",
        enableSGST: settingsMap["enableSGST"] === "true",
      },
      documents: {
        quotePrefix: settingsMap["quotePrefix"] || "QT",
        invoicePrefix: settingsMap["invoicePrefix"] || "INV",
        nextQuoteNumber: settingsMap["nextQuoteNumber"] || "1001",
        nextInvoiceNumber: settingsMap["nextInvoiceNumber"] || "1001",
      },
      email: {
        smtpHost: settingsMap["smtpHost"] || "",
        smtpPort: settingsMap["smtpPort"] || "",
        smtpEmail: settingsMap["smtpEmail"] || "",
        emailTemplateQuote: settingsMap["emailTemplateQuote"] || "",
        emailTemplateInvoice: settingsMap["emailTemplateInvoice"] || "",
        emailTemplatePaymentReminder: settingsMap["emailTemplatePaymentReminder"] || "",
      },
      general: {
        quotaValidityDays: settingsMap["quotaValidityDays"] || "30",
        invoiceDueDays: settingsMap["invoiceDueDays"] || "30",
        enableAutoReminders: settingsMap["enableAutoReminders"] === "true",
        reminderDaysBeforeDue: settingsMap["reminderDaysBeforeDue"] || "3",
      },
    };

    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch admin settings" });
  }
});

router.post("/admin/settings/company", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const companySettings = req.body;
    for (const [key, value] of Object.entries(companySettings)) {
      await storage.upsertSetting({
        key,
        value: String(value),
        updatedBy: req.user!.id,
      });
    }

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "update_company_settings",
      entityType: "settings",
    });

    return res.json({ success: true, message: "Company settings updated" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to update company settings" });
  }
});

router.post("/admin/settings/taxation", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const taxSettings = req.body;
    for (const [key, value] of Object.entries(taxSettings)) {
      await storage.upsertSetting({
        key,
        value: String(value),
        updatedBy: req.user!.id,
      });
    }

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "update_tax_settings",
      entityType: "settings",
    });

    return res.json({ success: true, message: "Tax settings updated" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to update tax settings" });
  }
});

router.post("/admin/settings/email", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
    }

    const emailSettings = req.body;
    for (const [key, value] of Object.entries(emailSettings)) {
        await storage.upsertSetting({
        key,
        value: String(value),
        updatedBy: req.user!.id,
        });
    }

    await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_email_settings",
        entityType: "settings",
    });

    // Reinitialize email service with new SMTP settings
    if (emailSettings.smtpHost) {
      EmailService.initialize({
        host: emailSettings.smtpHost,
        port: Number(emailSettings.smtpPort),
        secure: emailSettings.smtpSecure === "true",
        auth: {
          user: emailSettings.smtpEmail,
          pass: process.env.SMTP_PASSWORD || "",
        },
        from: emailSettings.smtpEmail || "noreply@quoteprogen.com",
      });
    }

    return res.json({ success: true, message: "Email settings updated" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to update email settings" });
  }
});

// ==================== DEBUG ENDPOINTS ====================
router.get("/debug/counters", async (req: Request, res: Response) => {
  try {
    const year = new Date().getFullYear();
    const types = ["quote", "master_invoice", "child_invoice", "vendor_po", "grn"];
    const counters: Record<string, any> = {};

    for (const type of types) {
      const counterKey = `${type}_counter_${year}`;
      const setting = await storage.getSetting(counterKey);
      const currentValue = setting?.value || "0";
      const nextValue = parseInt(String(currentValue), 10) + 1;
      counters[counterKey] = {
        current: currentValue,
        next: String(nextValue).padStart(4, "0"),
        exists: !!setting,
      };
    }

    return res.json({
      year,
      counters,
      message: "Next value shows what will be generated next"
    });
  } catch (error: any) {
    logger.error("Error fetching counters:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch counters" });
  }
});

router.post("/debug/reset-counter/:type", async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const year = new Date().getFullYear();

    logger.info(`[DEBUG] Resetting counter for ${type} in year ${year}`);

    await NumberingService.resetCounter(type, year);

    return res.json({
      success: true,
      message: `Counter ${type}_counter_${year} has been reset to 0`,
      nextNumber: "0001"
    });
  } catch (error: any) {
    logger.error("Error resetting counter:", error);
    return res.status(500).json({ error: error.message || "Failed to reset counter" });
  }
});

router.post("/debug/set-counter/:type/:value", async (req: Request, res: Response) => {
  try {
    const { type, value } = req.params;
    const year = new Date().getFullYear();
    const numValue = parseInt(value, 10);

    if (isNaN(numValue) || numValue < 0) {
      return res.status(400).json({ error: "Value must be a non-negative integer" });
    }

    logger.info(`[DEBUG] Setting ${type}_counter_${year} to ${numValue}`);

    await NumberingService.setCounter(type, year, numValue);

    const nextValue = numValue + 1;
    return res.json({
      success: true,
      message: `Counter ${type}_counter_${year} set to ${numValue}`,
      nextNumber: String(nextValue).padStart(4, "0")
    });
  } catch (error: any) {
    logger.error("Error setting counter:", error);
    return res.status(500).json({ error: error.message || "Failed to set counter" });
  }
});

export default router;
