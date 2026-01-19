
import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware";
import { storage } from "../storage";
import { cacheService } from "../services/cache.service";
import { logger } from "../utils/logger";

const router = Router();

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
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

router.get("/type/:type", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const templates = await storage.getTemplatesByType(req.params.type);
      return res.json(templates);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch templates by type" });
    }
});

router.get("/default/:type", authMiddleware, async (req: AuthRequest, res: Response) => {
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

router.get("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
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

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
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

router.patch("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
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

      return res.json(template);
    } catch (error: any) {
      logger.error("Update template error:", error);
      return res.status(500).json({ error: error.message || "Failed to update template" });
    }
});

router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
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

export default router;
