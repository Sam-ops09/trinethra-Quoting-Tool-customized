/**
 * EMAIL TEMPLATES ROUTES
 * CRUD endpoints for managing email templates
 */

import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware";
import { requireFeature } from "../feature-flags-middleware";
import { logger } from "../utils/logger";
import { db } from "../db";
import { emailTemplates, type EmailTemplateType } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { EmailTemplateService, TEMPLATE_VARIABLES, DEFAULT_TEMPLATES } from "../services/email-template.service";
import { storage } from "../storage";

const router = Router();

// Get all email templates
router.get("/", 
  requireFeature('email_templates_module'),
  authMiddleware, 
  async (req: AuthRequest, res: Response) => {
    try {
      const templates = await db.select().from(emailTemplates).orderBy(emailTemplates.type);
      res.json(templates);
    } catch (error) {
      logger.error("Error fetching email templates:", error);
      res.status(500).json({ error: "Failed to fetch email templates" });
    }
  }
);

// Get available template types and their variables
router.get("/types",
  requireFeature('email_templates_module'),
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const types = Object.keys(TEMPLATE_VARIABLES).map(type => ({
        type,
        variables: TEMPLATE_VARIABLES[type as EmailTemplateType],
        defaultTemplate: DEFAULT_TEMPLATES[type as EmailTemplateType],
      }));
      res.json(types);
    } catch (error) {
      logger.error("Error fetching template types:", error);
      res.status(500).json({ error: "Failed to fetch template types" });
    }
  }
);

// Get template by ID
router.get("/:id",
  requireFeature('email_templates_module'),
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const [template] = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.id, req.params.id))
        .limit(1);

      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      res.json(template);
    } catch (error) {
      logger.error("Error fetching email template:", error);
      res.status(500).json({ error: "Failed to fetch email template" });
    }
  }
);

// Get active template by type
router.get("/type/:type",
  requireFeature('email_templates_module'),
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const type = req.params.type as EmailTemplateType;
      const template = await EmailTemplateService.getTemplate(type);

      if (!template) {
        // Return default template if none configured
        const defaultTemplate = EmailTemplateService.getDefaultTemplate(type);
        return res.json({
          id: null,
          type,
          name: `Default ${type} Template`,
          subject: defaultTemplate.subject,
          body: defaultTemplate.body,
          isDefault: true,
          isActive: true,
          availableVariables: JSON.stringify(TEMPLATE_VARIABLES[type]),
        });
      }

      res.json(template);
    } catch (error) {
      logger.error("Error fetching template by type:", error);
      res.status(500).json({ error: "Failed to fetch template" });
    }
  }
);

// Create new email template (admin only)
router.post("/",
  requireFeature('email_templates_module'),
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Only admins can create email templates" });
      }

      const { name, type, subject, body, isActive, isDefault } = req.body;

      if (!name || !type || !subject || !body) {
        return res.status(400).json({ error: "Name, type, subject, and body are required" });
      }

      // Validate type
      const validTypes: EmailTemplateType[] = ["quote", "invoice", "sales_order", "payment_reminder", "password_reset", "welcome"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: `Invalid type. Must be one of: ${validTypes.join(", ")}` });
      }

      // Validate template content
      const validation = EmailTemplateService.validateTemplate(subject + body, type);
      if (!validation.valid) {
        return res.status(400).json({ error: "Template validation failed", details: validation.errors });
      }

      // If setting as default, unset other defaults of same type
      if (isDefault) {
        await db
          .update(emailTemplates)
          .set({ isDefault: false })
          .where(eq(emailTemplates.type, type));
      }

      const [template] = await db.insert(emailTemplates).values({
        name,
        type,
        subject,
        body,
        availableVariables: JSON.stringify(TEMPLATE_VARIABLES[type as EmailTemplateType]),
        isActive: isActive ?? true,
        isDefault: isDefault ?? false,
        createdBy: req.user!.id,
      }).returning();

      // Log activity
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_email_template",
        entityType: "email_template",
        entityId: template.id,
      });

      res.status(201).json(template);
    } catch (error: any) {
      logger.error("Error creating email template:", error);
      res.status(500).json({ error: error.message || "Failed to create email template" });
    }
  }
);

// Update email template (admin only)
router.put("/:id",
  requireFeature('email_templates_module'),
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Only admins can update email templates" });
      }

      const [existing] = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.id, req.params.id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({ error: "Template not found" });
      }

      const { name, subject, body, isActive, isDefault } = req.body;

      // Validate template content if provided
      const type = existing.type as EmailTemplateType;
      if (subject || body) {
        const validation = EmailTemplateService.validateTemplate(
          (subject || existing.subject) + (body || existing.body),
          type
        );
        if (!validation.valid) {
          return res.status(400).json({ error: "Template validation failed", details: validation.errors });
        }
      }

      // If setting as default, unset other defaults of same type
      if (isDefault && !existing.isDefault) {
        await db
          .update(emailTemplates)
          .set({ isDefault: false })
          .where(eq(emailTemplates.type, existing.type));
      }

      const [template] = await db
        .update(emailTemplates)
        .set({
          ...(name !== undefined && { name }),
          ...(subject !== undefined && { subject }),
          ...(body !== undefined && { body }),
          ...(isActive !== undefined && { isActive }),
          ...(isDefault !== undefined && { isDefault }),
          updatedAt: new Date(),
        })
        .where(eq(emailTemplates.id, req.params.id))
        .returning();

      // Log activity
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_email_template",
        entityType: "email_template",
        entityId: template.id,
      });

      res.json(template);
    } catch (error: any) {
      logger.error("Error updating email template:", error);
      res.status(500).json({ error: error.message || "Failed to update email template" });
    }
  }
);

// Delete email template (admin only)
router.delete("/:id",
  requireFeature('email_templates_module'),
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Only admins can delete email templates" });
      }

      const [existing] = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.id, req.params.id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({ error: "Template not found" });
      }

      await db.delete(emailTemplates).where(eq(emailTemplates.id, req.params.id));

      // Log activity
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "delete_email_template",
        entityType: "email_template",
        entityId: req.params.id,
      });

      res.json({ success: true });
    } catch (error: any) {
      logger.error("Error deleting email template:", error);
      res.status(500).json({ error: error.message || "Failed to delete email template" });
    }
  }
);

// Preview template with sample data
router.post("/:id/preview",
  requireFeature('email_templates_module'),
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const [template] = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.id, req.params.id))
        .limit(1);

      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      const preview = EmailTemplateService.previewTemplate(
        { subject: template.subject, body: template.body },
        template.type as EmailTemplateType
      );

      res.json(preview);
    } catch (error) {
      logger.error("Error previewing template:", error);
      res.status(500).json({ error: "Failed to preview template" });
    }
  }
);

// Preview template without saving
router.post("/preview-draft",
  requireFeature('email_templates_module'),
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { subject, body, type } = req.body;

      if (!subject || !body || !type) {
        return res.status(400).json({ error: "Subject, body, and type are required" });
      }

      const preview = EmailTemplateService.previewTemplate(
        { subject, body },
        type as EmailTemplateType
      );

      // Also validate
      const validation = EmailTemplateService.validateTemplate(subject + body, type);

      res.json({ ...preview, validation });
    } catch (error) {
      logger.error("Error previewing draft template:", error);
      res.status(500).json({ error: "Failed to preview template" });
    }
  }
);

// Seed default templates (admin only)
router.post("/seed-defaults",
  requireFeature('email_templates_module'),
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Only admins can seed default templates" });
      }

      await EmailTemplateService.seedDefaultTemplates(req.user!.id);

      // Log activity
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "seed_email_templates",
        entityType: "email_template",
        entityId: "system",
      });

      res.json({ success: true, message: "Default templates seeded successfully" });
    } catch (error: any) {
      logger.error("Error seeding default templates:", error);
      res.status(500).json({ error: error.message || "Failed to seed default templates" });
    }
  }
);

export default router;
