
import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware";
import { requirePermission } from "../permissions-middleware";
import { governanceService } from "../services/governance.service";
import { logger } from "../utils/logger";

const router = Router();

router.get("/stats", authMiddleware, requirePermission("analytics", "view"), async (req: AuthRequest, res: Response) => {
    try {
        const stats = await governanceService.getStats();
        return res.json(stats);
    } catch (error) {
        logger.error("Governance stats error:", error);
        return res.status(500).json({ error: "Failed to fetch governance stats" });
    }
});

export default router;
