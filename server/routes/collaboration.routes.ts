import { Router, Response } from "express";
import { WebSocketService } from "../services/websocket.service";
import { authMiddleware, AuthRequest } from "../middleware";
import { db } from "../db";
import { collaborationSessions, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

/**
 * GET /api/collaboration/:entityType/:entityId/presence
 * Get active collaborators for an entity
 */
router.get("/:entityType/:entityId/presence", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { entityType, entityId } = req.params;

    const collaborators = await WebSocketService.getCollaborators(entityType, entityId);

    res.json({
      entityType,
      entityId,
      collaborators,
      count: collaborators.length,
    });
  } catch (error) {
    console.error("[CollaborationRoutes] Failed to get presence:", error);
    res.status(500).json({ error: "Failed to get collaboration presence" });
  }
});

/**
 * GET /api/collaboration/:entityType/:entityId/is-editing
 * Check if anyone is currently editing an entity
 */
router.get("/:entityType/:entityId/is-editing", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { entityType, entityId } = req.params;
    const userId = req.user!.id;

    const sessions = await db.select({
      userId: collaborationSessions.userId,
      userName: users.name,
      isEditing: collaborationSessions.isEditing,
      cursorPosition: collaborationSessions.cursorPosition,
    })
    .from(collaborationSessions)
    .innerJoin(users, eq(collaborationSessions.userId, users.id))
    .where(
      and(
        eq(collaborationSessions.entityType, entityType),
        eq(collaborationSessions.entityId, entityId),
        eq(collaborationSessions.isEditing, true)
      )
    );

    // Filter out current user
    const othersEditing = sessions.filter((s) => s.userId !== userId);

    res.json({
      isBeingEdited: othersEditing.length > 0,
      editors: othersEditing.map((s) => ({
        userId: s.userId,
        userName: s.userName,
        cursorPosition: s.cursorPosition,
      })),
    });
  } catch (error) {
    console.error("[CollaborationRoutes] Failed to check editing status:", error);
    res.status(500).json({ error: "Failed to check editing status" });
  }
});

/**
 * POST /api/collaboration/:entityType/:entityId/heartbeat
 * Send a heartbeat to keep the collaboration session alive
 */
router.post("/:entityType/:entityId/heartbeat", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { entityType, entityId } = req.params;
    const userId = req.user!.id;

    await db.update(collaborationSessions)
      .set({ lastActivity: new Date() })
      .where(
        and(
          eq(collaborationSessions.entityType, entityType),
          eq(collaborationSessions.entityId, entityId),
          eq(collaborationSessions.userId, userId)
        )
      );

    res.json({ success: true });
  } catch (error) {
    console.error("[CollaborationRoutes] Failed to update heartbeat:", error);
    res.status(500).json({ error: "Failed to update heartbeat" });
  }
});

/**
 * GET /api/collaboration/user/:userId/status
 * Check if a specific user is online
 */
router.get("/user/:userId/status", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const isOnline = WebSocketService.isUserOnline(userId);
    const connectionCount = WebSocketService.getUserConnectionCount(userId);

    res.json({
      userId,
      isOnline,
      connectionCount,
    });
  } catch (error) {
    console.error("[CollaborationRoutes] Failed to get user status:", error);
    res.status(500).json({ error: "Failed to get user status" });
  }
});

/**
 * DELETE /api/collaboration/:entityType/:entityId/leave
 * Explicitly leave a collaboration session (cleanup)
 */
router.delete("/:entityType/:entityId/leave", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { entityType, entityId } = req.params;
    const userId = req.user!.id;

    await db.delete(collaborationSessions)
      .where(
        and(
          eq(collaborationSessions.entityType, entityType),
          eq(collaborationSessions.entityId, entityId),
          eq(collaborationSessions.userId, userId)
        )
      );

    res.json({ success: true });
  } catch (error) {
    console.error("[CollaborationRoutes] Failed to leave session:", error);
    res.status(500).json({ error: "Failed to leave collaboration session" });
  }
});

export const collaborationRoutes = router;
