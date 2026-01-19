import type { Express } from "express";
import type { Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { storage } from "./storage";
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
import serialNumbersRoutes from "./routes/serial-numbers.routes";
import approvalRulesRoutes from "./routes/approval-rules.routes";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "./db";
import * as schema from "../shared/schema";
import { z } from "zod";
import { toDecimal, add, subtract, toMoneyString, moneyGte, moneyGt } from "./utils/financial";
import { logger } from "./utils/logger";
import { cacheService } from "./services/cache.service";

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

  // Serial Number Routes
  app.use("/api/serial-numbers", authMiddleware, serialNumbersRoutes);

  // Approval Rules Routes
  app.use("/api/approval-rules", authMiddleware, approvalRulesRoutes);

  // Moved to invoices.routes.ts

  // PDF Export for Quotes



  // Moved to invoices.routes.ts

  // Templates Routes
  app.get("/api/templates", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const type = req.query.type as string | undefined;
      const style = req.query.style as string | undefined;

      const cacheKey = `templates:list:${type || 'all'}:${style || 'all'}`;
      const cached = await cacheService.get<any>(cacheKey);
      if (cached) return res.json(cached);

      let templates;
      if (type) {
        templates = await storage.getTemplatesByType(type);
      } else if (style) {
        templates = await storage.getTemplatesByStyle(style);
      } else {
        templates = await storage.getAllTemplates();
      }

      await cacheService.set(cacheKey, templates, 300); // 5 mins cache for lists


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
      const cacheKey = `templates:id:${req.params.id}`;
      const cached = await cacheService.get<any>(cacheKey);
      if (cached) return res.json(cached);

      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      await cacheService.set(cacheKey, template, 3600); // 1 hour cache
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

      // Invalidate cache
      await cacheService.del(`templates:id:${req.params.id}`);
      // Also potentially invalidate lists... leaving for TTL expiry for now


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

      // Invalidate cache
      await cacheService.del(`templates:id:${req.params.id}`);

      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete template" });
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
