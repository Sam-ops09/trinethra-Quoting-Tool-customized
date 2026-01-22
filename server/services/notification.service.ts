import { db } from "../db";
import { notifications, users } from "@shared/schema";
import type { Notification, InsertNotification, NotificationType } from "@shared/schema";
import { eq, and, desc, sql, lt } from "drizzle-orm";
import { WebSocketService } from "./websocket.service";
import { logger } from "../utils/logger";

interface CreateNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

interface GetNotificationsOptions {
  userId: string;
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Notification Service for managing in-app notifications
 * Handles:
 * - Creating and storing notifications
 * - Real-time delivery via WebSocket
 * - Mark as read/unread
 * - Notification cleanup
 */
class NotificationServiceClass {
  /**
   * Create a new notification and deliver via WebSocket
   */
  async create(options: CreateNotificationOptions): Promise<Notification | null> {
    try {
      const [notification] = await db.insert(notifications).values({
        userId: options.userId,
        type: options.type,
        title: options.title,
        message: options.message,
        entityType: options.entityType,
        entityId: options.entityId,
        metadata: options.metadata,
      }).returning();

      // Deliver via WebSocket if user is online
      if (notification) {
        WebSocketService.sendNotification(options.userId, {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          entityType: notification.entityType || undefined,
          entityId: notification.entityId || undefined,
          metadata: notification.metadata as any,
          createdAt: notification.createdAt,
        });
      }

      return notification;
    } catch (error) {
      logger.error("[NotificationService] Failed to create notification:", error);
      return null;
    }
  }

  /**
   * Create notifications for multiple users
   */
  async createForMany(userIds: string[], options: Omit<CreateNotificationOptions, "userId">): Promise<void> {
    for (const userId of userIds) {
      await this.create({ ...options, userId });
    }
  }

  /**
   * Create notification for all users with a specific role
   */
  async createForRole(role: string, options: Omit<CreateNotificationOptions, "userId">): Promise<void> {
    try {
      const usersWithRole = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.role, role as any));

      const userIds = usersWithRole.map((u) => u.id);
      await this.createForMany(userIds, options);
    } catch (error) {
      logger.error("[NotificationService] Failed to create notifications for role:", error);
    }
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(options: GetNotificationsOptions): Promise<Notification[]> {
    try {
      const conditions = [eq(notifications.userId, options.userId)];
      
      if (options.unreadOnly) {
        conditions.push(eq(notifications.isRead, false));
      }

      const result = await db.select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(options.limit || 50)
        .offset(options.offset || 0);

      return result;
    } catch (error) {
      logger.error("[NotificationService] Failed to get notifications:", error);
      return [];
    }
  }

  /**
   * Get count of unread notifications for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const [result] = await db.select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ));

      return Number(result?.count || 0);
    } catch (error) {
      logger.error("[NotificationService] Failed to get unread count:", error);
      return 0;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const [updated] = await db.update(notifications)
        .set({ 
          isRead: true, 
          readAt: new Date() 
        })
        .where(and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        ))
        .returning();

      return !!updated;
    } catch (error) {
      logger.error("[NotificationService] Failed to mark as read:", error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await db.update(notifications)
        .set({ 
          isRead: true, 
          readAt: new Date() 
        })
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ))
        .returning();

      return result.length;
    } catch (error) {
      logger.error("[NotificationService] Failed to mark all as read:", error);
      return 0;
    }
  }

  /**
   * Delete a notification
   */
  async delete(notificationId: string, userId: string): Promise<boolean> {
    try {
      const [deleted] = await db.delete(notifications)
        .where(and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        ))
        .returning();

      return !!deleted;
    } catch (error) {
      logger.error("[NotificationService] Failed to delete notification:", error);
      return false;
    }
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAll(userId: string): Promise<number> {
    try {
      const result = await db.delete(notifications)
        .where(eq(notifications.userId, userId))
        .returning();

      return result.length;
    } catch (error) {
      logger.error("[NotificationService] Failed to delete all notifications:", error);
      return 0;
    }
  }

  /**
   * Clean up old notifications (older than 30 days)
   */
  async cleanup(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await db.delete(notifications)
        .where(lt(notifications.createdAt, cutoffDate))
        .returning();

      console.log(`[NotificationService] Cleaned up ${result.length} old notifications`);
      return result.length;
    } catch (error) {
      logger.error("[NotificationService] Failed to cleanup old notifications:", error);
      return 0;
    }
  }

  // ============================================
  // Convenience methods for common notification types
  // ============================================

  /**
   * Notify when quote status changes
   */
  async notifyQuoteStatusChange(
    userId: string,
    quoteNumber: string,
    quoteId: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    await this.create({
      userId,
      type: "quote_status_change",
      title: `Quote ${quoteNumber} Status Updated`,
      message: `Quote status changed from "${oldStatus}" to "${newStatus}"`,
      entityType: "quote",
      entityId: quoteId,
      metadata: { oldStatus, newStatus, quoteNumber },
    });
  }

  /**
   * Notify when approval is required
   */
  async notifyApprovalRequest(
    approverId: string,
    quoteNumber: string,
    quoteId: string,
    requesterName: string,
    reason: string
  ): Promise<void> {
    await this.create({
      userId: approverId,
      type: "approval_request",
      title: `Approval Required: Quote ${quoteNumber}`,
      message: `${requesterName} has requested your approval. Reason: ${reason}`,
      entityType: "quote",
      entityId: quoteId,
      metadata: { requesterName, reason, quoteNumber },
    });
  }

  /**
   * Notify when approval decision is made
   */
  async notifyApprovalDecision(
    userId: string,
    quoteNumber: string,
    quoteId: string,
    approverName: string,
    decision: "approved" | "rejected",
    comments?: string
  ): Promise<void> {
    await this.create({
      userId,
      type: "approval_decision",
      title: `Quote ${quoteNumber} ${decision === "approved" ? "Approved" : "Rejected"}`,
      message: `${approverName} has ${decision} your quote${comments ? `: ${comments}` : ""}`,
      entityType: "quote",
      entityId: quoteId,
      metadata: { approverName, decision, comments, quoteNumber },
    });
  }

  /**
   * Notify when payment is received
   */
  async notifyPaymentReceived(
    userId: string,
    invoiceNumber: string,
    invoiceId: string,
    amount: string,
    currency: string
  ): Promise<void> {
    await this.create({
      userId,
      type: "payment_received",
      title: `Payment Received: ${currency} ${amount}`,
      message: `Payment of ${currency} ${amount} received for Invoice ${invoiceNumber}`,
      entityType: "invoice",
      entityId: invoiceId,
      metadata: { amount, currency, invoiceNumber },
    });
  }

  /**
   * Notify when payment is overdue
   */
  async notifyPaymentOverdue(
    userId: string,
    invoiceNumber: string,
    invoiceId: string,
    daysOverdue: number,
    amount: string
  ): Promise<void> {
    await this.create({
      userId,
      type: "payment_overdue",
      title: `Invoice ${invoiceNumber} Overdue`,
      message: `Invoice is ${daysOverdue} days overdue. Outstanding amount: ${amount}`,
      entityType: "invoice",
      entityId: invoiceId,
      metadata: { daysOverdue, amount, invoiceNumber },
    });
  }

  /**
   * Notify when someone joins a document
   */
  async notifyCollaboratorJoined(
    userId: string,
    joinerName: string,
    entityType: string,
    entityId: string,
    entityNumber: string
  ): Promise<void> {
    await this.create({
      userId,
      type: "collaboration_joined",
      title: `${joinerName} Joined Your Document`,
      message: `${joinerName} is now viewing ${entityType} ${entityNumber}`,
      entityType,
      entityId,
      metadata: { joinerName, entityNumber },
    });
  }

  /**
   * Send system announcement to all users
   */
  async sendSystemAnnouncement(
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const allUsers = await db.select({ id: users.id }).from(users);
      await this.createForMany(
        allUsers.map((u) => u.id),
        {
          type: "system_announcement",
          title,
          message,
          metadata,
        }
      );
    } catch (error) {
      logger.error("[NotificationService] Failed to send system announcement:", error);
    }
  }
}

// Singleton instance
export const NotificationService = new NotificationServiceClass();
