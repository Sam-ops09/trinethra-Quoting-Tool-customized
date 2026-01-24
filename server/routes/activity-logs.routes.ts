
import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware";
import { requirePermission } from "../permissions-middleware";
import { storage } from "../storage";
import { logger } from "../utils/logger";

const router = Router();

router.get("/recent", authMiddleware, requirePermission("analytics", "view"), async (req: AuthRequest, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
        const logs = await storage.getAllActivityLogs(limit);
        return res.json(logs);
    } catch (error) {
        logger.error("Activity logs error:", error);
        return res.status(500).json({ error: "Failed to fetch activity logs" });
    }
});

export default router;
