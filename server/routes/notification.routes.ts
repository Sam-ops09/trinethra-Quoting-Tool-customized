import { Router, Request, Response } from "express";
import { NotificationService } from "../services/notification.service";
import { authMiddleware, AuthRequest } from "../middleware";

const router = Router();

/**
 * GET /api/notifications
 * Get notifications for the current user
 * Query params: unreadOnly, limit, offset
 */
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const unreadOnly = req.query.unreadOnly === "true";
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const notifications = await NotificationService.getNotifications({
      userId,
      unreadOnly,
      limit,
      offset,
    });

    res.json({
      notifications,
      pagination: {
        limit,
        offset,
        hasMore: notifications.length === limit,
      },
    });
  } catch (error) {
    console.error("[NotificationRoutes] Failed to get notifications:", error);
    res.status(500).json({ error: "Failed to get notifications" });
  }
});

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 */
router.get("/unread-count", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const count = await NotificationService.getUnreadCount(userId);
    res.json({ count });
  } catch (error) {
    console.error("[NotificationRoutes] Failed to get unread count:", error);
    res.status(500).json({ error: "Failed to get unread count" });
  }
});

/**
 * POST /api/notifications/:id/read
 * Mark a notification as read
 */
router.post("/:id/read", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;

    const success = await NotificationService.markAsRead(notificationId, userId);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Notification not found" });
    }
  } catch (error) {
    console.error("[NotificationRoutes] Failed to mark as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read
 */
router.post("/read-all", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const count = await NotificationService.markAllAsRead(userId);
    res.json({ success: true, count });
  } catch (error) {
    console.error("[NotificationRoutes] Failed to mark all as read:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;

    const success = await NotificationService.delete(notificationId, userId);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Notification not found" });
    }
  } catch (error) {
    console.error("[NotificationRoutes] Failed to delete notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

/**
 * DELETE /api/notifications
 * Delete all notifications for the current user
 */
router.delete("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const count = await NotificationService.deleteAll(userId);
    res.json({ success: true, count });
  } catch (error) {
    console.error("[NotificationRoutes] Failed to delete all notifications:", error);
    res.status(500).json({ error: "Failed to delete all notifications" });
  }
});

export const notificationRoutes = router;
