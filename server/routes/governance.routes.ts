
import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware";
import { requirePermission } from "../permissions-middleware";
import { governanceService } from "../services/governance.service";
import { logger } from "../utils/logger";
import { requireFeature } from "../feature-flags-middleware";

const router = Router();

router.get("/stats", authMiddleware, requireFeature('admin_governance'), requirePermission("analytics", "view"), async (req: AuthRequest, res: Response) => {
    try {
        const stats = await governanceService.getStats();
        return res.json(stats);
    } catch (error) {
        logger.error("Governance stats error:", error);
        return res.status(500).json({ error: "Failed to fetch governance stats" });
    }
});

export default router;
