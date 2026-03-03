
import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware";
import { requirePermission } from "../permissions-middleware";
import { storage } from "../storage";
import { logger } from "../utils/logger";

const router = Router();

// GET /api/activity-logs — paginated listing with filters
router.get("/", authMiddleware, requirePermission("analytics", "view"), async (req: AuthRequest, res: Response) => {
    try {
        const offset = parseInt(req.query.offset as string) || 0;
        const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
        const entityType = req.query.entityType as string | undefined;
        const action = req.query.action as string | undefined;
        const userId = req.query.userId as string | undefined;
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

        const result = await storage.getActivityLogsPaginated({
            offset, limit, entityType, action, userId, startDate, endDate,
        });

        return res.json(result);
    } catch (error) {
        logger.error("Activity logs paginated error:", error);
        return res.status(500).json({ error: "Failed to fetch activity logs" });
    }
});

// GET /api/activity-logs/stats — aggregate counts by entity type
router.get("/stats", authMiddleware, requirePermission("analytics", "view"), async (req: AuthRequest, res: Response) => {
    try {
        const stats = await storage.getActivityLogStats();
        return res.json(stats);
    } catch (error) {
        logger.error("Activity log stats error:", error);
        return res.status(500).json({ error: "Failed to fetch activity log stats" });
    }
});

// GET /api/activity-logs/recent — legacy endpoint (keep backwards compatible)
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
