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
// import analyticsRoutes from "./analytics-routes"; // Refactored to server/routes/analytics.routes.ts
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
import pricingRoutes from "./routes/pricing.routes";
import templatesRoutes from "./routes/templates.routes";
import analyticsRoutes from "./routes/analytics.routes";
import adminUsersRoutes from "./routes/users.admin.routes";
import emailTemplatesRoutes from "./routes/email-templates.routes";
import { notificationRoutes } from "./routes/notification.routes";
import { collaborationRoutes } from "./routes/collaboration.routes";
import creditNotesRoutes from "./routes/credit-notes.routes";
import debitNotesRoutes from "./routes/debit-notes.routes";
import { subscriptionRoutes } from "./routes/subscriptions.routes";
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




  // Users Routes (Admin only)
  app.use("/api/users", authMiddleware, usersRoutes);

  // Clients Routes
  app.use("/api/clients", authMiddleware, clientsRoutes);

  // Quotes Routes
  // NOTE: Public routes (/public/:token/*) in quotesRoutes handle their own auth check
  app.use("/api/quotes", quotesRoutes);

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

  // Pricing Tiers Routes
  app.use("/api", authMiddleware, pricingRoutes);

  // Email Templates Routes
  app.use("/api/email-templates", emailTemplatesRoutes);

  // Notification Routes
  app.use("/api/notifications", notificationRoutes);

  // Collaboration Routes
  app.use("/api/collaboration", authMiddleware, collaborationRoutes);

  // Credit Notes Routes
  app.use("/api", creditNotesRoutes);

  // Debit Notes Routes
  app.use("/api", debitNotesRoutes);

  // Subscriptions Routes
  app.use("/api", subscriptionRoutes);

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
  app.use("/api/analytics", authMiddleware, analyticsRoutes);
  app.use("/api", authMiddleware, quoteWorkflowRoutes);

  const httpServer = createServer(app);
  return httpServer;
}

export type { AuthRequest };
