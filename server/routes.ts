import type { Express } from "express";
import type { Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import { PDFService } from "./services/pdf.service";
import { InvoicePDFService } from "./services/invoice-pdf.service";
import { EmailService } from "./services/email.service";
import { analyticsService } from "./services/analytics.service";
import { pricingService } from "./services/pricing.service";
import { NumberingService } from "./services/numbering.service";
import { requirePermission } from "./permissions-middleware";
import { requireFeature, getFeatureFlagsEndpoint } from "./feature-flags-middleware";
import { validateRequest, authMiddleware, getJWTSecret } from "./middleware";
import type { AuthRequest } from "./middleware";
import { isFeatureEnabled } from "@shared/feature-flags";
import analyticsRoutes from "./analytics-routes";
import quoteWorkflowRoutes from "./quote-workflow-routes";
import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";
import clientsRoutes from "./routes/clients.routes";
import quotesRoutes from "./routes/quotes.routes";
import invoicesRoutes from "./routes/invoices.routes";
import paymentsRoutes from "./routes/payments.routes";
import productsRoutes from "./routes/products.routes";
import vendorsRoutes from "./routes/vendors.routes";
import settingsRoutes from "./routes/settings.routes";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "./db";
import * as schema from "../shared/schema";
import { z } from "zod";
import { toDecimal, add, subtract, toMoneyString, moneyGte, moneyGt } from "./utils/financial";
import { logger } from "./utils/logger";

const JWT_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";


export async function registerRoutes(app: Express): Promise<Server> {


  // Auth Routes
  app.use("/api/auth", authRoutes);


    // Analytics & Dashboard Routes
    app.use("/api", authMiddleware, analyticsRoutes);
    
    // Quote Workflow Routes
    app.use("/api", authMiddleware, quoteWorkflowRoutes);

  // Users Routes (Admin only)
  app.use("/api/users", authMiddleware, usersRoutes);

  // Clients Routes
  app.use("/api/clients", authMiddleware, clientsRoutes);

  // Quotes Routes
  app.use("/api/quotes", authMiddleware, quotesRoutes);

  // Invoices Routes
  app.use("/api/invoices", authMiddleware, invoicesRoutes);

  // Payments Routes
  app.use("/api", authMiddleware, paymentsRoutes);

  // Products Routes
  app.use("/api/products", authMiddleware, productsRoutes);

  // Vendors Routes (includes POs and GRNs)
  app.use("/api", authMiddleware, vendorsRoutes);

  // Settings Routes
  app.use("/api", authMiddleware, settingsRoutes);

  // Moved to invoices.routes.ts

  // PDF Export for Quotes


  // Email Quote
  app.post("/api/quotes/:id/email", authMiddleware, requirePermission("quotes", "view"), async (req: AuthRequest, res: Response) => {
    try {
      const { recipientEmail, message } = req.body;

      if (!recipientEmail) {
        return res.status(400).json({ error: "Recipient email is required" });
      }

      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      const client = await storage.getClient(quote.clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      const items = await storage.getQuoteItems(quote.id);

      const creator = await storage.getUser(quote.createdBy);

      // Fetch company settings
      const settings = await storage.getAllSettings();
      const companyName = settings.find((s) => s.key === "company_name")?.value || "OPTIVALUE TEK";
      const companyAddress = settings.find((s) => s.key === "company_address")?.value || "";
      const companyPhone = settings.find((s) => s.key === "company_phone")?.value || "";
      const companyEmail = settings.find((s) => s.key === "company_email")?.value || "";
      const companyWebsite = settings.find((s) => s.key === "company_website")?.value || "";
      const companyGSTIN = settings.find((s) => s.key === "company_gstin")?.value || "";
      const companyLogo = settings.find((s) => s.key === "company_logo")?.value;

      // Fetch email templates
      const emailSubjectTemplate = settings.find((s) => s.key === "email_quote_subject")?.value || "Quote {QUOTE_NUMBER} from {COMPANY_NAME}";
      const emailBodyTemplate = settings.find((s) => s.key === "email_quote_body")?.value || "Dear {CLIENT_NAME},\n\nPlease find attached quote {QUOTE_NUMBER} for your review.\n\nTotal Amount: {TOTAL}\nValid Until: {VALIDITY_DATE}\n\nBest regards,\n{COMPANY_NAME}";

      // Calculate validity date
      const quoteDate = new Date(quote.quoteDate);
      const validityDate = new Date(quoteDate);
      validityDate.setDate(validityDate.getDate() + (quote.validityDays || 30));

      // Replace variables in templates
      const variables: Record<string, string> = {
        "{COMPANY_NAME}": companyName,
        "{CLIENT_NAME}": client.name,
        "{QUOTE_NUMBER}": quote.quoteNumber,
        "{TOTAL}": `₹${Number(quote.total).toLocaleString()}`,
        "{VALIDITY_DATE}": validityDate.toLocaleDateString(),
      };

      let emailSubject = emailSubjectTemplate;
      let emailBody = emailBodyTemplate;

      // Replace variables - escape special regex characters in the key
      Object.entries(variables).forEach(([key, value]) => {
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        emailSubject = emailSubject.replace(new RegExp(escapedKey, 'g'), value);
        emailBody = emailBody.replace(new RegExp(escapedKey, 'g'), value);
      });

      // Add custom message if provided
      if (message) {
        emailBody = `${emailBody}\n\n---\nAdditional Note:\n${message}`;
      }

      // Fetch bank details
      const bankDetail = await storage.getActiveBankDetails();
      const bankName = bankDetail?.bankName || "";
      const bankAccountNumber = bankDetail?.accountNumber || "";
      const bankAccountName = bankDetail?.accountName || "";
      const bankIfscCode = bankDetail?.ifscCode || "";
      const bankBranch = bankDetail?.branch || "";
      const bankSwiftCode = bankDetail?.swiftCode || "";

      // Generate PDF for attachment
      const { PassThrough } = await import("stream");
      const pdfStream = new PassThrough();

      const pdfPromise = PDFService.generateQuotePDF({
        quote,
        client,
        items,
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        companyWebsite,
        companyGSTIN,
        companyLogo,
        preparedBy: creator?.name,
        preparedByEmail: creator?.email,
        bankDetails: {
          bankName,
          accountNumber: bankAccountNumber,
          accountName: bankAccountName,
          ifsc: bankIfscCode,
          branch: bankBranch,
          swift: bankSwiftCode,
        },
      }, pdfStream);

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      pdfStream.on("data", (chunk: any) => chunks.push(chunk));
      await new Promise<void>((resolve, reject) => {
        pdfStream.on("end", resolve);
        pdfStream.on("error", reject);
      });
      await pdfPromise;
      const pdfBuffer = Buffer.concat(chunks);

      // Send email with PDF attachment using template
      await EmailService.sendQuoteEmail(
        recipientEmail,
        emailSubject,
        emailBody,
        pdfBuffer
      );


      await storage.createActivityLog({
        userId: req.user!.id,
        action: "email_quote",
        entityType: "quote",
        entityId: quote.id,
      });

      return res.json({ success: true, message: "Quote sent successfully" });
    } catch (error: any) {
      logger.error("Email quote error:", error);
      return res.status(500).json({ error: error.message || "Failed to send quote email" });
    }
  });

  // Moved to invoices.routes.ts

  // Moved to payments.routes.ts

  // PDF Export for Quotes
  app.get("/api/quotes/:id/pdf", authMiddleware, async (req: AuthRequest, res: Response) => {
    logger.info(`[PDF Export START] Received request for quote: ${req.params.id}`);
    try {
      const quote = await storage.getQuote(req.params.id);
      logger.info(`[PDF Export] Found quote: ${quote?.quoteNumber}`);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      const client = await storage.getClient(quote.clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      const items = await storage.getQuoteItems(quote.id);
      const creator = await storage.getUser(quote.createdBy);

      // Fetch company settings
      const settings = await storage.getAllSettings();
      // Debug logging to see what keys are available
      logger.info("Available settings keys:", settings.map(s => s.key));

      const companyName = settings.find((s) => s.key === "company_companyName")?.value || "OPTIVALUE TEK";
      
      const addr = settings.find((s) => s.key === "company_address")?.value || "";
      const city = settings.find((s) => s.key === "company_city")?.value || "";
      const state = settings.find((s) => s.key === "company_state")?.value || "";
      const zip = settings.find((s) => s.key === "company_zipCode")?.value || "";
      const country = settings.find((s) => s.key === "company_country")?.value || "";
      
      // Construct full address
      const companyAddress = [addr, city, state, zip, country].filter(Boolean).join(", ");

      const companyPhone = settings.find((s) => s.key === "company_phone")?.value || "";
      const companyEmail = settings.find((s) => s.key === "company_email")?.value || "";
      const companyWebsite = settings.find((s) => s.key === "company_website")?.value || "";
      const companyGSTIN = settings.find((s) => s.key === "company_gstin")?.value || "";
      const companyLogo = settings.find((s) => s.key === "company_logo")?.value;
      
      logger.info("Company Logo found:", !!companyLogo, "Length:", companyLogo?.length);

      // Fetch bank details from settings
      const bankName = settings.find((s) => s.key === "bank_bankName")?.value || "";
      const bankAccountNumber = settings.find((s) => s.key === "bank_accountNumber")?.value || "";
      const bankAccountName = settings.find((s) => s.key === "bank_accountName")?.value || "";
      const bankIfscCode = settings.find((s) => s.key === "bank_ifscCode")?.value || "";
      const bankBranch = settings.find((s) => s.key === "bank_branch")?.value || "";
      const bankSwiftCode = settings.find((s) => s.key === "bank_swiftCode")?.value || "";

      logger.error("!!! DEBUG BANK DETAILS !!!", {
          bankName,
          bankAccountNumber,
          bankAccountName,
          bankIfscCode
      });

      // Create filename - ensure it's clean and doesn't have problematic characters
      const cleanFilename = `Quote-${quote.quoteNumber}.pdf`.replace(/[^\w\-. ]/g, '_');

      // Set headers BEFORE piping to ensure they're sent first
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", "");  // Let Node calculate length
      // Use RFC 5987 format for filename with UTF-8 encoding
      res.setHeader("Content-Disposition", `attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`);
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      // DEBUG: Log what we're sending
      logger.info(`[PDF Export] Quote #${quote.quoteNumber}`);
      logger.info(`[PDF Export] Clean filename: ${cleanFilename}`);
      logger.info(`[PDF Export] Content-Disposition header: attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`);

      // Generate PDF
      logger.info(`[PDF Export] About to generate PDF`);
      await PDFService.generateQuotePDF({
        quote,
        client,
        items,
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        companyWebsite,
        companyGSTIN,
        companyLogo,
        preparedBy: creator?.name,
        preparedByEmail: creator?.email,
        bankDetails: {
          bankName,
          accountNumber: bankAccountNumber,
          accountName: bankAccountName,
          ifsc: bankIfscCode,
          branch: bankBranch,
          swift: bankSwiftCode,
        },
      }, res);
      logger.info(`[PDF Export] PDF stream piped successfully`);

      // Log after headers are sent
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "export_pdf",
        entityType: "quote",
        entityId: quote.id,
      });
      logger.info(`[PDF Export COMPLETE] Quote PDF exported successfully: ${quote.quoteNumber}`);
    } catch (error: any) {
      logger.error("[PDF Export ERROR]", error);
      return res.status(500).json({ error: error.message || "Failed to generate PDF" });
    }
  });

  // Moved to invoices.routes.ts

  // Templates Routes
  app.get("/api/templates", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const type = req.query.type as string | undefined;
      const style = req.query.style as string | undefined;

      let templates;
      if (type) {
        templates = await storage.getTemplatesByType(type);
      } else if (style) {
        templates = await storage.getTemplatesByStyle(style);
      } else {
        templates = await storage.getAllTemplates();
      }

      return res.json(templates);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/type/:type", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const templates = await storage.getTemplatesByType(req.params.type);
      return res.json(templates);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch templates by type" });
    }
  });

  app.get("/api/templates/default/:type", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const template = await storage.getDefaultTemplate(req.params.type);
      if (!template) {
        return res.status(404).json({ error: "Default template not found" });
      }
      return res.json(template);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch default template" });
    }
  });

  app.get("/api/templates/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      return res.json(template);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  app.post("/api/templates", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const template = await storage.createTemplate({
        ...req.body,
        createdBy: req.user!.id,
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_template",
        entityType: "template",
        entityId: template.id,
      });

      return res.json(template);
    } catch (error: any) {
      logger.error("Create template error:", error);
      return res.status(500).json({ error: error.message || "Failed to create template" });
    }
  });

  app.patch("/api/templates/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const template = await storage.updateTemplate(req.params.id, req.body);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_template",
        entityType: "template",
        entityId: template.id,
      });

      return res.json(template);
    } catch (error: any) {
      logger.error("Update template error:", error);
      return res.status(500).json({ error: error.message || "Failed to update template" });
    }
  });

  app.delete("/api/templates/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteTemplate(req.params.id);

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "delete_template",
        entityType: "template",
        entityId: req.params.id,
      });

      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete template" });
    }
  });

  // ==================== BANK DETAILS ROUTES ====================

  // Moved to settings.routes.ts

  // Moved to vendors.routes.ts

  // ==================== MULTIPLE INVOICES ROUTES ====================
  app.get("/api/quotes/:id/invoices", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const invoices = await storage.getInvoicesByQuote(req.params.id);
      const enrichedInvoices = await Promise.all(
        invoices.map(async (invoice) => {
          const items = await storage.getInvoiceItems(invoice.id);
          return { ...invoice, items };
        })
      );
      res.json(enrichedInvoices);
    } catch (error) {
      logger.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.post("/api/quotes/:id/create-invoice", authMiddleware, requirePermission("invoices", "create"), async (req: AuthRequest, res: Response) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      const { parentInvoiceId, isMaster = false } = req.body;

      let invoiceNumber: string;

      // Generate hierarchical invoice numbers
      if (parentInvoiceId) {
        // This is a child invoice
        const parentInvoice = await storage.getInvoice(parentInvoiceId);
        if (!parentInvoice) {
          return res.status(404).json({ error: "Parent invoice not found" });
        }

        // Get all child invoices of this parent
        const allInvoices = await storage.getInvoicesByQuote(quote.id);
        const siblings = allInvoices.filter(inv => inv.parentInvoiceId === parentInvoiceId);
        const childNumber = siblings.length + 1;

        // Generate child invoice number: INV-001-1, INV-001-2, etc.
        invoiceNumber = `${parentInvoice.invoiceNumber}-${childNumber}`;
      } else if (isMaster) {
        // This is a master invoice
        invoiceNumber = await NumberingService.generateMasterInvoiceNumber();
      } else {
        // This is a standalone/child invoice
        invoiceNumber = await NumberingService.generateChildInvoiceNumber();
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const invoice = await storage.createInvoice({
        invoiceNumber,
        quoteId: quote.id,
        parentInvoiceId: parentInvoiceId || null,
        isMaster: parentInvoiceId ? false : (isMaster || false),
        paymentStatus: "pending",
        dueDate,
        paidAmount: "0",
        clientId: quote.clientId,
        subtotal: String(quote.subtotal || 0),
        discount: String(quote.discount || 0),
        cgst: String(quote.cgst || 0),
        sgst: String(quote.sgst || 0),
        igst: String(quote.igst || 0),
        total: String(quote.total || 0),
        remainingAmount: String(quote.total || 0),
        status: "draft",
        createdBy: req.user!.id,
      });

      // Create invoice items
      const quoteItems = await storage.getQuoteItems(quote.id);
      for (const item of quoteItems) {
        await storage.createInvoiceItem({
          invoiceId: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          hsnSac: item.hsnSac
        });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_invoice",
        entityType: "invoice",
        entityId: invoice.id,
      });

      return res.json(invoice);
    } catch (error: any) {
      logger.error("Create invoice error:", error);
      return res.status(500).json({ error: error.message || "Failed to create invoice" });
    }
  });



  app.patch("/api/invoices/:id/items/:itemId/serials", authMiddleware, requirePermission("serial_numbers", "edit"), async (req: AuthRequest, res: Response) => {
    try {
      const { serialNumbers } = req.body;

      logger.info(`Updating serial numbers for item ${req.params.itemId} in invoice ${req.params.id}`);
      logger.info(`Serial numbers count: ${serialNumbers?.length || 0}`);

      // Get the invoice item being updated
      const invoiceItem = await storage.getInvoiceItem(req.params.itemId);
      if (!invoiceItem) {
        return res.status(404).json({ error: "Invoice item not found" });
      }

      // Update the child/current invoice item
      const updated = await storage.updateInvoiceItem(req.params.itemId, {
        serialNumbers: JSON.stringify(serialNumbers),
        fulfilledQuantity: serialNumbers.length,
        status: serialNumbers.length > 0 ? "fulfilled" : "pending",
      });

      if (!updated) {
        return res.status(404).json({ error: "Item not found" });
      }

      // Get the invoice to check if it's a child invoice
      const invoice = await storage.getInvoice(req.params.id);

      // If this is a child invoice, update the corresponding master item
      if (invoice && invoice.parentInvoiceId) {
        logger.info(`This is a child invoice. Parent: ${invoice.parentInvoiceId}`);
        logger.info(`Syncing with master invoice...`);

        // Get master invoice items
        const masterItems = await storage.getInvoiceItems(invoice.parentInvoiceId);

        logger.info(`Searching for master item with:`);
        logger.info(`  Description: "${invoiceItem.description}"`);
        logger.info(`  Unit Price: ${invoiceItem.unitPrice}`);
        logger.info(`\nAvailable master items:`);
        masterItems.forEach((mi: any, index: number) => {
          logger.info(`  [${index}] Description: "${mi.description}", Unit Price: ${mi.unitPrice}`);
        });

        // Find the corresponding master item by matching description and unitPrice
        const masterItem = masterItems.find((mi: any) =>
          mi.description === invoiceItem.description &&
          Number(mi.unitPrice) === Number(invoiceItem.unitPrice)
        );

        if (masterItem) {
          logger.info(`Found master item: ${masterItem.description} (ID: ${masterItem.id})`);

          // Get all child invoices of this master
          const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId || "");
          const childInvoices = allInvoices.filter(inv => inv.parentInvoiceId === invoice.parentInvoiceId);

          logger.info(`Found ${childInvoices.length} child invoices for this master`);

          // Aggregate serial numbers from all child invoices for this item
          const allChildSerialNumbers = [];
          for (const childInvoice of childInvoices) {
            const childItems = await storage.getInvoiceItems(childInvoice.id);
            const matchingChildItem = childItems.find((ci: any) =>
              ci.description === masterItem.description &&
              Number(ci.unitPrice) === Number(masterItem.unitPrice)
            );

            if (matchingChildItem && matchingChildItem.serialNumbers) {
              try {
                const serials = JSON.parse(matchingChildItem.serialNumbers);
                allChildSerialNumbers.push(...serials);
                logger.info(`  Child ${childInvoice.invoiceNumber}: ${serials.length} serial numbers`);
              } catch (e) {
                logger.error("Error parsing serial numbers:", e);
              }
            }
          }

          logger.info(`Total aggregated serial numbers: ${allChildSerialNumbers.length}`);

          // Update master item with aggregated serial numbers
          await storage.updateInvoiceItem(masterItem.id, {
            serialNumbers: allChildSerialNumbers.length > 0
              ? JSON.stringify(allChildSerialNumbers)
              : null,
            status: masterItem.fulfilledQuantity >= masterItem.quantity ? "fulfilled" : "pending",
          });

          logger.info(`✓ Master item updated successfully with ${allChildSerialNumbers.length} serial numbers`);
        } else {
          logger.info(`⚠ No matching master item found for: ${invoiceItem.description}`);
        }
      } else {
        logger.info(`This is not a child invoice or is a master invoice itself`);
      }

      res.json(updated);
    } catch (error) {
      logger.error("Error updating serial numbers:", error);
      res.status(500).json({ error: "Failed to update serial numbers" });
    }
  });

  // Serial Number Validation Route
  app.post("/api/invoices/:id/items/:itemId/serials/validate", authMiddleware, requirePermission("serial_numbers", "view"), async (req: AuthRequest, res: Response) => {
    try {
      const { validateSerialNumbers } = await import("./serial-number-service");
      const { serials, expectedQuantity } = req.body;
      const { id: invoiceId, itemId } = req.params;

      if (!serials || !Array.isArray(serials)) {
        return res.status(400).json({ error: "Invalid serials array" });
      }

      if (typeof expectedQuantity !== 'number') {
        return res.status(400).json({ error: "Expected quantity must be a number" });
      }

      const validation = await validateSerialNumbers(
        invoiceId,
        itemId,
        serials,
        expectedQuantity,
        {
          checkInvoiceScope: true,
          checkQuoteScope: true,
          checkSystemWide: true,
        }
      );

      return res.json(validation);
    } catch (error: any) {
      logger.error("Error validating serial numbers:", error);
      return res.status(500).json({ error: error.message || "Failed to validate serial numbers" });
    }
  });

  // Check serial edit permissions
  app.get("/api/invoices/:id/serials/permissions", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { canEditSerialNumbers } = await import("./serial-number-service");
      const { id: invoiceId } = req.params;

      const permissions = await canEditSerialNumbers(req.user!.id, invoiceId);

      return res.json(permissions);
    } catch (error: any) {
      logger.error("Error checking serial edit permissions:", error);
      return res.status(500).json({ error: error.message || "Failed to check permissions" });
    }
  });

  // Serial Number Search/Traceability Route
  app.get("/api/serial-numbers/search", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { getSerialTraceability } = await import("./serial-number-service");
      const serialNumber = req.query.q as string;

      if (!serialNumber || serialNumber.trim().length === 0) {
        return res.status(400).json({ error: "Serial number query is required" });
      }

      const traceability = await getSerialTraceability(serialNumber.trim());

      if (!traceability) {
        return res.status(404).json({ error: "Serial number not found" });
      }

      return res.json(traceability);
    } catch (error: any) {
      logger.error("Error searching serial number:", error);
      return res.status(500).json({ error: error.message || "Failed to search serial number" });
    }
  });

  // Batch validate serial numbers
  app.post("/api/serial-numbers/batch-validate", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { getSerialTraceability } = await import("./serial-number-service");
      const { serials } = req.body;

      if (!serials || !Array.isArray(serials)) {
        return res.status(400).json({ error: "Invalid serials array" });
      }

      // Check each serial for system-wide existence
      const results = await Promise.all(
        serials.map(async (serial) => {
          const traceability = await getSerialTraceability(serial);
          return {
            serial,
            exists: !!traceability,
            info: traceability,
          };
        })
      );

      return res.json({ results });
    } catch (error: any) {
      logger.error("Error batch validating serials:", error);
      return res.status(500).json({ error: error.message || "Failed to validate serials" });
    }
  });

  // Create child invoice from master invoice
  app.post("/api/invoices/:masterId/create-child", authMiddleware, requirePermission("invoices", "create"), async (req: AuthRequest, res: Response) => {
    try {
      const { masterId } = req.params;
      const { items, milestoneDescription, deliveryNotes, notes } = req.body;

      logger.info("Creating child invoice for master:", masterId);
      logger.info("Request body:", JSON.stringify(req.body, null, 2));

      // 1. Verify master invoice exists and is actually a master
      const masterInvoice = await storage.getInvoice(masterId);
      if (!masterInvoice) {
        logger.error("Master invoice not found:", masterId);
        return res.status(404).json({ error: "Master invoice not found" });
      }

      if (!masterInvoice.isMaster) {
        logger.error("Invoice is not a master invoice:", masterId);
        return res.status(400).json({ error: "Invoice is not a master invoice" });
      }

      // 2. Get master invoice items
      const masterItems = await storage.getInvoiceItems(masterId);
      logger.info("Master items count:", masterItems?.length || 0);

      if (!masterItems || masterItems.length === 0) {
        logger.error("Master invoice has no items");
        return res.status(400).json({ error: "Master invoice has no items" });
      }

      // 3. Validate items array
      if (!items || !Array.isArray(items) || items.length === 0) {
        logger.error("Invalid items array:", items);
        return res.status(400).json({ error: "Items array is required and must not be empty" });
      }

      // 4. Validate quantities - ensure we're not over-invoicing
      for (const item of items) {
        const masterItem = masterItems.find((mi: any) => mi.id === item.itemId);
        if (!masterItem) {
          logger.error("Item not found in master:", item.itemId);
          return res.status(400).json({ error: `Item ${item.itemId} not found in master invoice` });
        }

        const remaining = masterItem.quantity - masterItem.fulfilledQuantity;
        logger.info(`Item ${masterItem.description}: qty=${item.quantity}, remaining=${remaining}`);

        if (item.quantity > remaining) {
          logger.error(`Over-invoicing detected: requested=${item.quantity}, remaining=${remaining}`);
          return res.status(400).json({
            error: `Cannot invoice ${item.quantity} of "${masterItem.description}". Only ${remaining} remaining.`
          });
        }
      }

      // 4. Generate child invoice number (INV-001-1, INV-001-2, etc.)
      const allInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId || "");
      const siblings = allInvoices.filter(inv => inv.parentInvoiceId === masterId);
      // Generate child invoice number using admin child invoice numbering settings
      const childInvoiceNumber = await NumberingService.generateChildInvoiceNumber();

      // 5. Calculate totals based on selected items
      let subtotal = 0;
      logger.info("Calculating subtotal for child invoice...");
      for (const item of items) {
        const masterItem = masterItems.find((mi: any) => mi.id === item.itemId);
        if (!masterItem) {
          logger.error("Master item not found during calculation:", item.itemId);
          continue; // Skip if not found (already validated, but safety check)
        }
        const itemSubtotal = Number(masterItem.unitPrice) * item.quantity;
        logger.info(`  Item: ${masterItem.description}, unitPrice: ${masterItem.unitPrice}, qty: ${item.quantity}, subtotal: ${itemSubtotal}`);
        subtotal += itemSubtotal;
      }
      logger.info("Total subtotal:", subtotal);

      // 6. Pro-rate taxes and discounts proportionally
      const masterSubtotal = Number(masterInvoice.subtotal);
      logger.info("Master subtotal:", masterSubtotal);
      const ratio = masterSubtotal > 0 ? subtotal / masterSubtotal : 0;
      logger.info("Ratio:", ratio);

      const discount = Number(masterInvoice.discount) * ratio;
      const cgst = Number(masterInvoice.cgst) * ratio;
      const sgst = Number(masterInvoice.sgst) * ratio;
      const igst = Number(masterInvoice.igst) * ratio;
      const shippingCharges = Number(masterInvoice.shippingCharges) * ratio;

      logger.info("Calculated amounts - discount:", discount, "cgst:", cgst, "sgst:", sgst, "igst:", igst, "shipping:", shippingCharges);

      const total = subtotal - discount + cgst + sgst + igst + shippingCharges;
      logger.info("Final total:", total);

      // 7. Create child invoice
      const childInvoice = await storage.createInvoice({
        invoiceNumber: childInvoiceNumber,
        parentInvoiceId: masterId,
        quoteId: masterInvoice.quoteId,
        paymentStatus: "pending",
        dueDate: masterInvoice.dueDate ? new Date(masterInvoice.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        igst: igst.toFixed(2),
        shippingCharges: shippingCharges.toFixed(2),
        total: total.toFixed(2),
        paidAmount: "0",
        isMaster: false,
        milestoneDescription: milestoneDescription || null,
        deliveryNotes: deliveryNotes || null,
        notes: notes || masterInvoice.notes || null,
        termsAndConditions: masterInvoice.termsAndConditions || null,
        createdBy: req.user!.id,
      });

      // 8. Create invoice items and update master item quantities
      for (const item of items) {
        const masterItem = masterItems.find((mi: any) => mi.id === item.itemId);
        if (!masterItem) continue; // Skip if not found

        // Create child invoice item
        await storage.createInvoiceItem({
          invoiceId: childInvoice.id,
          description: masterItem.description,
          quantity: item.quantity,
          fulfilledQuantity: 0,
          unitPrice: masterItem.unitPrice,
          subtotal: (Number(masterItem.unitPrice) * item.quantity).toFixed(2),
          serialNumbers: item.serialNumbers ? JSON.stringify(item.serialNumbers) : null,
          status: "pending",
          sortOrder: masterItem.sortOrder,
          hsnSac: (masterItem as any).hsnSac || null,
        });

        // Update master item's fulfilledQuantity
        await db
          .update(schema.invoiceItems)
          .set({
            fulfilledQuantity: sql`${schema.invoiceItems.fulfilledQuantity} + ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(schema.invoiceItems.id, masterItem.id));
      }

      // 9. Log activity
      await db.insert(schema.activityLogs).values({
        userId: req.user!.id,
        action: "child_invoice_created",
        entityType: "invoice",
        entityId: childInvoice.id,
      });

      res.json(childInvoice);
    } catch (error) {
      logger.error("Error creating child invoice:", error);
      res.status(500).json({ error: "Failed to create child invoice" });
    }
  });

  // Moved to products.routes.ts

  // Moved to vendors.routes.ts

  // ==================== SERIAL NUMBER ROUTES ====================
  app.post("/api/serial-numbers/bulk", authMiddleware, requireFeature('serialNumber_tracking'), async (req: AuthRequest, res: Response) => {
    try {
      const {
        serialNumbers,
        invoiceItemId,
        productId,
        vendorPoItemId,
        grnId,
      } = req.body;

      if (!Array.isArray(serialNumbers) || serialNumbers.length === 0) {
        return res.status(400).json({ error: "Serial numbers array is required" });
      }

      // Check for duplicates in the system
      const existing = await db
        .select()
        .from(schema.serialNumbers)
        .where(sql`${schema.serialNumbers.serialNumber} = ANY(${serialNumbers})`);

      if (existing.length > 0) {
        return res.status(400).json({
          error: "Duplicate serial numbers found",
          duplicates: existing.map(s => s.serialNumber),
        });
      }

      // Create serial number records
      const records = serialNumbers.map((sn: string) => ({
        serialNumber: sn,
        productId: productId || null,
        vendorPoItemId: vendorPoItemId || null,
        grnId: grnId || null,
        invoiceItemId: invoiceItemId || null,
        status: invoiceItemId ? "reserved" : "in_stock",
        createdBy: req.user!.id,
      }));

      const created = await db
        .insert(schema.serialNumbers)
        .values(records)
        .returning();

      // Log activity
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "bulk_import_serials",
        entityType: "serial_numbers",
        entityId: created[0].id,
      });

      res.json({ count: created.length, serialNumbers: created });
    } catch (error: any) {
      logger.error("Error importing serial numbers:", error);
      res.status(500).json({ error: error.message || "Failed to import serial numbers" });
    }
  });

  app.get("/api/serial-numbers/:serialNumber", authMiddleware, requireFeature('serialNumber_tracking'), async (req: AuthRequest, res: Response) => {
    try {
      const [serial] = await db
        .select()
        .from(schema.serialNumbers)
        .where(eq(schema.serialNumbers.serialNumber, req.params.serialNumber));

      if (!serial) {
        return res.status(404).json({ error: "Serial number not found" });
      }

      // Fetch related data
      let product = null;
      if (serial.productId) {
        [product] = await db
          .select({ id: schema.products.id, name: schema.products.name, sku: schema.products.sku })
          .from(schema.products)
          .where(eq(schema.products.id, serial.productId));
      }

      let vendor = null;
      if (serial.vendorId) {
        [vendor] = await db
          .select({ id: schema.vendors.id, name: schema.vendors.name })
          .from(schema.vendors)
          .where(eq(schema.vendors.id, serial.vendorId));
      }

      let vendorPo = null;
      if (serial.vendorPoId) {
        [vendorPo] = await db
          .select({
            id: schema.vendorPurchaseOrders.id,
            poNumber: schema.vendorPurchaseOrders.poNumber,
            orderDate: schema.vendorPurchaseOrders.orderDate,
          })
          .from(schema.vendorPurchaseOrders)
          .where(eq(schema.vendorPurchaseOrders.id, serial.vendorPoId));
      }

      let grn = null;
      if (serial.grnId) {
        [grn] = await db
          .select({
            id: schema.goodsReceivedNotes.id,
            grnNumber: schema.goodsReceivedNotes.grnNumber,
            receivedDate: schema.goodsReceivedNotes.receivedDate,
            inspectionStatus: schema.goodsReceivedNotes.inspectionStatus,
          })
          .from(schema.goodsReceivedNotes)
          .where(eq(schema.goodsReceivedNotes.id, serial.grnId));
      }

      let invoice = null;
      if (serial.invoiceId) {
        [invoice] = await db
          .select({
            id: schema.invoices.id,
            invoiceNumber: schema.invoices.invoiceNumber,
            createdAt: schema.invoices.createdAt,
          })
          .from(schema.invoices)
          .where(eq(schema.invoices.id, serial.invoiceId));
      }

      res.json({
        ...serial,
        product,
        vendor,
        vendorPo,
        grn,
        invoice,
      });
    } catch (error) {
      logger.error("Error fetching serial number:", error);
      res.status(500).json({ error: "Failed to fetch serial number" });
    }
  });

  // Analytics Routes
  app.get("/api/analytics/dashboard", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const quotes = await storage.getAllQuotes();
      const clients = await storage.getAllClients();
      const invoices = await storage.getAllInvoices();

      const totalQuotes = quotes.length;
      const totalClients = clients.length;

      const safeToNum = (val: any) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        const str = String(val).replace(/[^0-9.-]+/g, "");
        return parseFloat(str) || 0;
      };

      const approvedQuotes = quotes.filter(q => q.status === "approved" || q.status === "invoiced" || q.status === "closed_paid");
      
      // Calculate Total Revenue from Invoices (Collected Amount)
      const totalRevenue = invoices.reduce((sum, inv) => sum + safeToNum(inv.paidAmount), 0);

      const conversionRate = totalQuotes > 0
        ? ((approvedQuotes.length / totalQuotes) * 100).toFixed(1)
        : "0";

      const recentQuotes = await Promise.all(
        quotes.slice(0, 5).map(async (quote) => {
          const client = await storage.getClient(quote.clientId);
          return {
            id: quote.id,
            quoteNumber: quote.quoteNumber,
            clientName: client?.name || "Unknown",
            total: quote.total,
            status: quote.status,
            createdAt: quote.createdAt,
          };
        })
      );

      // Create client map for faster lookup
      const clientMap = new Map(clients.map(c => [c.id, c]));

      // Top clients (by Collected Amount)
      const clientRevenue = new Map<string, { name: string; totalRevenue: number; quoteCount: number }>();
      
      for (const inv of invoices) {
        if (!inv.clientId) continue;
        const paid = safeToNum(inv.paidAmount);
        if (paid <= 0) continue;

        const client = clientMap.get(inv.clientId);
        if (!client) continue;
        
        const existing = clientRevenue.get(inv.clientId);
        if (existing) {
          existing.totalRevenue += paid;
          existing.quoteCount += 1; // Actually invoice count, but re-using the field name for frontend compatibility
        } else {
          clientRevenue.set(inv.clientId, {
            name: client.name,
            totalRevenue: paid,
            quoteCount: 1,
          });
        }
      }

      const topClients = Array.from(clientRevenue.values())
        .map(c => ({
          name: c.name,
          total: c.totalRevenue, // Send as number
          quoteCount: c.quoteCount,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      const quotesByStatus = quotes.reduce((acc: any[], quote) => {
        const existing = acc.find(item => item.status === quote.status);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({ status: quote.status, count: 1 });
        }
        return acc;
      }, []);

      // Monthly revenue (simplified - last 6 months)
      const monthlyRevenue = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const monthQuotes = approvedQuotes.filter(q => {
          const qDate = new Date(q.createdAt);
          return qDate.getMonth() === date.getMonth() && qDate.getFullYear() === date.getFullYear();
        });
        const revenue = monthQuotes.reduce((sum, q) => sum + safeToNum(q.total), 0);
        monthlyRevenue.push({ month, revenue });
      }

      return res.json({
        totalQuotes,
        totalClients,
        totalRevenue: totalRevenue.toFixed(2),
        conversionRate,
        recentQuotes,
        topClients,
        quotesByStatus,
        monthlyRevenue,
      });
    } catch (error) {
      logger.error("Analytics error:", error);
      return res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/:timeRange(\\d+)", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const timeRange = req.params.timeRange ? Number(req.params.timeRange) : 12;
      
      const quotes = await storage.getAllQuotes();
      const clients = await storage.getAllClients();

      // Filter by time range
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - timeRange);
      const filteredQuotes = quotes.filter(q => new Date(q.createdAt) >= cutoffDate);

      const approvedQuotes = filteredQuotes.filter(q => q.status === "approved" || q.status === "invoiced");
      const totalRevenue = approvedQuotes.reduce((sum, q) => sum + Number(q.total), 0);
      const avgQuoteValue = filteredQuotes.length > 0
        ? (filteredQuotes.reduce((sum, q) => sum + Number(q.total), 0) / filteredQuotes.length).toFixed(2)
        : "0";

      const conversionRate = filteredQuotes.length > 0
        ? ((approvedQuotes.length / filteredQuotes.length) * 100).toFixed(1)
        : "0";

      // Monthly data
      const monthlyData = [];
      for (let i = timeRange - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        
        const monthQuotes = filteredQuotes.filter(q => {
          const qDate = new Date(q.createdAt);
          return qDate.getMonth() === date.getMonth() && qDate.getFullYear() === date.getFullYear();
        });
        
        const monthApproved = monthQuotes.filter(q => q.status === "approved" || q.status === "invoiced");
        const revenue = monthApproved.reduce((sum, q) => sum + Number(q.total), 0);
        
        monthlyData.push({
          month,
          quotes: monthQuotes.length,
          revenue,
          conversions: monthApproved.length,
        });
      }

      // Top clients
      const clientRevenue = new Map<string, { name: string; totalRevenue: number; quoteCount: number }>();
      
      for (const quote of approvedQuotes) {
        const client = await storage.getClient(quote.clientId);
        if (!client) continue;
        
        const existing = clientRevenue.get(client.id);
        if (existing) {
          existing.totalRevenue += Number(quote.total);
          existing.quoteCount += 1;
        } else {
          clientRevenue.set(client.id, {
            name: client.name,
            totalRevenue: Number(quote.total),
            quoteCount: 1,
          });
        }
      }

      const topClients = Array.from(clientRevenue.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10)
        .map(c => ({
          name: c.name,
          totalRevenue: c.totalRevenue.toFixed(2),
          quoteCount: c.quoteCount,
        }));

      // Status breakdown
      const statusBreakdown = filteredQuotes.reduce((acc: any[], quote) => {
        const existing = acc.find(item => item.status === quote.status);
        const value = Number(quote.total);
        if (existing) {
          existing.count += 1;
          existing.value += value;
        } else {
          acc.push({ status: quote.status, count: 1, value });
        }
        return acc;
      }, []);

      return res.json({
        overview: {
          totalQuotes: filteredQuotes.length,
          totalRevenue: totalRevenue.toFixed(2),
          avgQuoteValue,
          conversionRate,
        },
        monthlyData,
        topClients,
        statusBreakdown,
      });
    } catch (error) {
      logger.error("Analytics error:", error);
      return res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // PHASE 3 - ADVANCED ANALYTICS ENDPOINTS
  app.get("/api/analytics/forecast", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const monthsAhead = req.query.months ? Number(req.query.months) : 3;
      const forecast = await analyticsService.getRevenueForecast(monthsAhead);
      return res.json(forecast);
    } catch (error) {
      logger.error("Forecast error:", error);
      return res.status(500).json({ error: "Failed to fetch forecast" });
    }
  });

  app.get("/api/analytics/deal-distribution", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const distribution = await analyticsService.getDealDistribution();
      return res.json(distribution);
    } catch (error) {
      logger.error("Deal distribution error:", error);
      return res.status(500).json({ error: "Failed to fetch deal distribution" });
    }
  });

  app.get("/api/analytics/regional", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const regionalData = await analyticsService.getRegionalDistribution();
      return res.json(regionalData);
    } catch (error) {
      logger.error("Regional data error:", error);
      return res.status(500).json({ error: "Failed to fetch regional data" });
    }
  });

  app.post("/api/analytics/custom-report", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { startDate, endDate, status, minAmount, maxAmount } = req.body;
      const report = await analyticsService.getCustomReport({
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
        minAmount,
        maxAmount,
      });
      return res.json(report);
    } catch (error) {
      logger.error("Custom report error:", error);
      return res.status(500).json({ error: "Failed to generate custom report" });
    }
  });

  app.get("/api/analytics/pipeline", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const pipeline = await analyticsService.getSalesPipeline();
      return res.json(pipeline);
    } catch (error) {
      logger.error("Pipeline error:", error);
      return res.status(500).json({ error: "Failed to fetch pipeline data" });
    }
  });

  app.get("/api/analytics/client/:clientId/ltv", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const ltv = await analyticsService.getClientLifetimeValue(req.params.clientId);
      return res.json(ltv);
    } catch (error) {
      logger.error("LTV error:", error);
      return res.status(500).json({ error: "Failed to fetch client LTV" });
    }
  });

  app.get("/api/analytics/competitor-insights", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const insights = await analyticsService.getCompetitorInsights();
      return res.json(insights);
    } catch (error) {
      logger.error("Competitor insights error:", error);
      return res.status(500).json({ error: "Failed to fetch competitor insights" });
    }
  });

  // VENDOR ANALYTICS ENDPOINTS
  app.get("/api/analytics/vendor-spend", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const timeRange = req.query.timeRange ? Number(req.query.timeRange) : 12;
      const vendors = await storage.getAllVendors();
      const vendorPos = await storage.getAllVendorPos();

      // Filter by time range
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - timeRange);
      const filteredPos = vendorPos.filter(po => new Date(po.createdAt) >= cutoffDate);

      // Calculate vendor spend
      const vendorSpend = new Map();
      for (const po of filteredPos) {
        const vendor = vendors.find(v => v.id === po.vendorId);
        if (vendor) {
          const existing = vendorSpend.get(po.vendorId);
          const poTotal = Number(po.total);
          if (existing) {
            existing.totalSpend += poTotal;
            existing.poCount += 1;
          } else {
            vendorSpend.set(po.vendorId, {
              vendorId: po.vendorId,
              vendorName: vendor.name,
              totalSpend: poTotal,
              poCount: 1,
              status: po.status,
            });
          }
        }
      }

      // Top vendors by spend
      const topVendors = Array.from(vendorSpend.values())
        .sort((a, b) => b.totalSpend - a.totalSpend)
        .slice(0, 10)
        .map(v => ({
          vendorId: v.vendorId,
          vendorName: v.vendorName,
          totalSpend: v.totalSpend.toFixed(2),
          poCount: v.poCount,
          avgPoValue: (v.totalSpend / v.poCount).toFixed(2),
        }));

      // Total procurement spend
      const totalSpend = filteredPos.reduce((sum, po) => sum + Number(po.total), 0);

      // Procurement delays (POs not fulfilled on time)
      const delayedPos = filteredPos.filter(po => {
        if (po.status === "fulfilled" && po.expectedDeliveryDate && po.actualDeliveryDate) {
          return new Date(po.actualDeliveryDate) > new Date(po.expectedDeliveryDate);
        }
        if (po.status !== "fulfilled" && po.expectedDeliveryDate) {
          return new Date() > new Date(po.expectedDeliveryDate);
        }
        return false;
      });

      // Vendor performance metrics
      const vendorPerformance = Array.from(vendorSpend.values()).map(v => {
        const vendorPOs = filteredPos.filter(po => po.vendorId === v.vendorId);
        const onTimePOs = vendorPOs.filter(po => {
          if (po.status === "fulfilled" && po.expectedDeliveryDate && po.actualDeliveryDate) {
            return new Date(po.actualDeliveryDate) <= new Date(po.expectedDeliveryDate);
          }
          return false;
        });

        const fulfilledCount = vendorPOs.filter(po => po.status === "fulfilled").length;
        const onTimeRate = fulfilledCount > 0 ? ((onTimePOs.length / fulfilledCount) * 100).toFixed(1) : "0";

        return {
          vendorName: v.vendorName,
          totalPOs: vendorPOs.length,
          fulfilledPOs: fulfilledCount,
          onTimeDeliveryRate: onTimeRate + "%",
          totalSpend: v.totalSpend.toFixed(2),
        };
      }).sort((a, b) => Number(b.totalSpend) - Number(a.totalSpend));

      return res.json({
        overview: {
          totalSpend: totalSpend.toFixed(2),
          totalPOs: filteredPos.length,
          activeVendors: vendorSpend.size,
          delayedPOs: delayedPos.length,
          avgPoValue: filteredPos.length > 0 ? (totalSpend / filteredPos.length).toFixed(2) : "0",
        },
        topVendors,
        vendorPerformance,
        procurementDelays: {
          count: delayedPos.length,
          percentage: filteredPos.length > 0 ? ((delayedPos.length / filteredPos.length) * 100).toFixed(1) : "0",
        },
      });
    } catch (error) {
      logger.error("Vendor analytics error:", error);
      return res.status(500).json({ error: "Failed to fetch vendor analytics" });
    }
  });

  // PHASE 3 - CLIENT MANAGEMENT ENDPOINTS (Tags & Communications)
  app.get("/api/clients/:clientId/tags", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const tags = await storage.getClientTags(req.params.clientId);
      return res.json(tags);
    } catch (error) {
      logger.error("Get tags error:", error);
      return res.status(500).json({ error: "Failed to fetch client tags" });
    }
  });

  app.post("/api/clients/:clientId/tags", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { tag } = req.body;
      if (!tag) {
        return res.status(400).json({ error: "Tag is required" });
      }

      const clientTag = await storage.addClientTag({
        clientId: req.params.clientId,
        tag,
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "add_client_tag",
        entityType: "client",
        entityId: req.params.clientId,
      });

      return res.json(clientTag);
    } catch (error) {
      logger.error("Add tag error:", error);
      return res.status(500).json({ error: "Failed to add tag" });
    }
  });

  app.delete("/api/clients/tags/:tagId", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      await storage.removeClientTag(req.params.tagId);

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "remove_client_tag",
        entityType: "client_tag",
        entityId: req.params.tagId,
      });

      return res.json({ success: true });
    } catch (error) {
      logger.error("Remove tag error:", error);
      return res.status(500).json({ error: "Failed to remove tag" });
    }
  });

  app.get("/api/clients/:clientId/communications", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const communications = await storage.getClientCommunications(req.params.clientId);
      return res.json(communications);
    } catch (error) {
      logger.error("Get communications error:", error);
      return res.status(500).json({ error: "Failed to fetch communications" });
    }
  });

  app.post("/api/clients/:clientId/communications", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { type, subject, message, attachments } = req.body;

      if (!type || !["email", "call", "meeting", "note"].includes(type)) {
        return res.status(400).json({ error: "Valid communication type is required" });
      }

      const communication = await storage.createClientCommunication({
        clientId: req.params.clientId,
        type,
        subject,
        message,
        date: new Date(),
        communicatedBy: req.user!.id,
        attachments: attachments ? JSON.stringify(attachments) : undefined,
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_communication",
        entityType: "client",
        entityId: req.params.clientId,
      });

      return res.json(communication);
    } catch (error: any) {
      logger.error("Create communication error:", error);
      return res.status(500).json({ error: error.message || "Failed to create communication" });
    }
  });

  app.delete("/api/clients/communications/:commId", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteClientCommunication(req.params.commId);

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "delete_communication",
        entityType: "client_communication",
        entityId: req.params.commId,
      });

      return res.json({ success: true });
    } catch (error) {
      logger.error("Delete communication error:", error);
      return res.status(500).json({ error: "Failed to delete communication" });
    }
  });


  // PHASE 3 - PRICING TIERS ENDPOINTS
  app.get("/api/pricing-tiers", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const tiers = await storage.getAllPricingTiers();
      return res.json(tiers);
    } catch (error) {
      logger.error("Get pricing tiers error:", error);
      return res.status(500).json({ error: "Failed to fetch pricing tiers" });
    }
  });

  app.post("/api/pricing-tiers", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { name, minAmount, maxAmount, discountPercent, description, isActive } = req.body;

      if (!name || minAmount === undefined || discountPercent === undefined) {
        return res.status(400).json({ error: "Name, minAmount, and discountPercent are required" });
      }

      const tier = await storage.createPricingTier({
        name,
        minAmount,
        maxAmount,
        discountPercent,
        description,
        isActive: isActive !== false,
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_pricing_tier",
        entityType: "pricing_tier",
        entityId: tier.id,
      });

      return res.json(tier);
    } catch (error: any) {
      logger.error("Create pricing tier error:", error);
      return res.status(500).json({ error: error.message || "Failed to create pricing tier" });
    }
  });

  app.patch("/api/pricing-tiers/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const updated = await storage.updatePricingTier(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Pricing tier not found" });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_pricing_tier",
        entityType: "pricing_tier",
        entityId: req.params.id,
      });

      return res.json(updated);
    } catch (error: any) {
      logger.error("Update pricing tier error:", error);
      return res.status(500).json({ error: error.message || "Failed to update pricing tier" });
    }
  });

  app.delete("/api/pricing-tiers/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      await storage.deletePricingTier(req.params.id);

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "delete_pricing_tier",
        entityType: "pricing_tier",
        entityId: req.params.id,
      });

      return res.json({ success: true });
    } catch (error) {
      logger.error("Delete pricing tier error:", error);
      return res.status(500).json({ error: "Failed to delete pricing tier" });
    }
  });

  // PHASE 3 - PRICING CALCULATION ENDPOINTS
  app.post("/api/pricing/calculate-discount", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { subtotal } = req.body;

      if (!subtotal || subtotal <= 0) {
        return res.status(400).json({ error: "Valid subtotal is required" });
      }

      const result = await pricingService.calculateDiscount(subtotal);
      return res.json(result);
    } catch (error: any) {
      logger.error("Calculate discount error:", error);
      return res.status(500).json({ error: error.message || "Failed to calculate discount" });
    }
  });

  app.post("/api/pricing/calculate-taxes", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { amount, region, useIGST } = req.body;

      if (!amount || !region) {
        return res.status(400).json({ error: "Amount and region are required" });
      }

      const taxes = await pricingService.calculateTaxes(amount, region, useIGST);
      return res.json(taxes);
    } catch (error: any) {
      logger.error("Calculate taxes error:", error);
      return res.status(500).json({ error: error.message || "Failed to calculate taxes" });
    }
  });

  app.post("/api/pricing/calculate-total", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { subtotal, region, useIGST, shippingCharges, customDiscount } = req.body;

      if (!subtotal || !region) {
        return res.status(400).json({ error: "Subtotal and region are required" });
      }

      const total = await pricingService.calculateQuoteTotal({
        subtotal,
        region,
        useIGST,
        shippingCharges,
        customDiscount,
      });

      return res.json(total);
    } catch (error: any) {
      logger.error("Calculate total error:", error);
      return res.status(500).json({ error: error.message || "Failed to calculate total" });
    }
  });

  app.post("/api/pricing/convert-currency", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { amount, fromCurrency, toCurrency } = req.body;

      if (!amount || !fromCurrency || !toCurrency) {
        return res.status(400).json({ error: "Amount, fromCurrency, and toCurrency are required" });
      }

      const converted = await pricingService.convertCurrency(amount, fromCurrency, toCurrency);
      return res.json({ original: amount, converted, fromCurrency, toCurrency });
    } catch (error: any) {
      logger.error("Convert currency error:", error);
      return res.status(500).json({ error: error.message || "Failed to convert currency" });
    }
  });

  // Moved to settings.routes.ts

  // User Management (Admin Panel)
  app.get("/api/admin/users", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const users = await storage.getAllUsers();
      const sanitized = users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
      }));

      return res.json(sanitized);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:userId/role", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { role } = req.body;
      if (!["admin", "manager", "user", "viewer"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      const updated = await storage.updateUser(req.params.userId, { role });
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "change_user_role",
        entityType: "user",
        entityId: req.params.userId,
      });

      return res.json({ success: true, message: `User role changed to ${role}` });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update user role" });
    }
  });

  app.patch("/api/admin/users/:userId/status", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { status } = req.body;
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const updated = await storage.updateUser(req.params.userId, { status });
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "change_user_status",
        entityType: "user",
        entityId: req.params.userId,
      });

      return res.json({ success: true, message: `User status changed to ${status}` });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update user status" });
    }
  });

  // Analytics & Dashboard Routes
  app.use("/api", authMiddleware, analyticsRoutes);
  app.use("/api", authMiddleware, quoteWorkflowRoutes);

  const httpServer = createServer(app);
  return httpServer;
}

export type { AuthRequest };
