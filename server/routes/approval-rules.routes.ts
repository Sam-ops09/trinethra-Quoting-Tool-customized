import { Router, Response } from "express";
import { storage } from "../storage";
import { authMiddleware, AuthRequest } from "../middleware";
import { requirePermission } from "../permissions-middleware";
import { insertApprovalRuleSchema } from "@shared/schema";
import { logger } from "../utils/logger";

const router = Router();

// Get all rules
router.get("/", authMiddleware, requirePermission("settings", "view"), async (req: AuthRequest, res: Response) => {
  try {
    const rules = await storage.getApprovalRules();
    res.json(rules);
  } catch (error) {
    logger.error("Failed to fetch approval rules:", error);
    res.status(500).json({ error: "Failed to fetch approval rules" });
  }
});

// Create rule
router.post("/", authMiddleware, requirePermission("settings", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    const validatedRule = insertApprovalRuleSchema.parse({
      ...req.body,
      createdBy: req.user!.id
    });
    
    const rule = await storage.createApprovalRule(validatedRule);
    res.json(rule);
  } catch (error: any) {
    logger.error("Failed to create approval rule:", error);
    res.status(400).json({ error: error.message || "Failed to create approval rule" });
  }
});

// Update rule
router.patch("/:id", authMiddleware, requirePermission("settings", "edit"), async (req: AuthRequest, res: Response) => {
  try {
    const updated = await storage.updateApprovalRule(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Rule not found" });
    }
    res.json(updated);
  } catch (error) {
    logger.error("Failed to update approval rule:", error);
    res.status(500).json({ error: "Failed to update approval rule" });
  }
});

// Delete rule
router.delete("/:id", authMiddleware, requirePermission("settings", "edit"), async (req: AuthRequest, res: Response) => {
  try {
     await storage.deleteApprovalRule(req.params.id);
     res.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete approval rule:", error);
    res.status(500).json({ error: "Failed to delete approval rule" });
  }
});

export default router;
