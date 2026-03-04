import { storage } from "../storage";
import { NotificationService } from "./notification.service";
import { logger } from "../utils/logger";

/**
 * Quote Expiry Alert Service
 * Detects quotes approaching their validUntil date and sends in-app notifications.
 * Follows the same pattern as PaymentReminderScheduler.
 */
export class QuoteExpiryAlertService {
  private static isRunning = false;
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the quote expiry alert scheduler.
   * Runs immediately, then every 24 hours.
   */
  static start() {
    if (this.isRunning) {
      logger.info("[QuoteExpiry] Scheduler already running");
      return;
    }

    logger.info("[QuoteExpiry] Starting scheduler...");
    this.isRunning = true;

    // Run immediately on start
    this.checkAndNotify();

    // Then run every 24 hours
    this.intervalId = setInterval(() => {
      this.checkAndNotify();
    }, 24 * 60 * 60 * 1000);

    logger.info("[QuoteExpiry] Scheduler started successfully");
  }

  /**
   * Stop the scheduler.
   */
  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info("[QuoteExpiry] Scheduler stopped");
  }

  /**
   * Check all quotes and send notifications for expiring/expired ones.
   * Alert thresholds: 7 days before, 3 days before, and expired today.
   */
  static async checkAndNotify() {
    try {
      logger.info("[QuoteExpiry] Checking for expiring quotes...");

      const quotes = await storage.getAllQuotes();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const ALERT_DAYS = [7, 3, 0]; // days until expiry to trigger alerts
      const MAX_ALERTS_PER_RUN = 50;
      let alertsSent = 0;

      for (const quote of quotes) {
        if (alertsSent >= MAX_ALERTS_PER_RUN) {
          logger.info(`[QuoteExpiry] Reached batch limit of ${MAX_ALERTS_PER_RUN}, remaining quotes will be checked next cycle.`);
          break;
        }

        // Only alert for quotes that are actively awaiting response
        if (quote.status !== "sent" && quote.status !== "approved") continue;

        // Skip quotes without a validity date
        if (!quote.validUntil) continue;

        const validUntil = new Date(quote.validUntil);
        validUntil.setHours(0, 0, 0, 0);

        const diffMs = validUntil.getTime() - today.getTime();
        const daysUntilExpiry = Math.round(diffMs / (1000 * 60 * 60 * 24));

        // Check if this matches one of our alert thresholds
        if (!ALERT_DAYS.includes(daysUntilExpiry)) continue;

        // Determine who to notify: assignedTo if available, else creator
        const notifyUserId = quote.assignedTo || quote.createdBy;

        try {
          if (daysUntilExpiry <= 0) {
            // Expired today or earlier
            await NotificationService.notifyQuoteExpiring(
              notifyUserId,
              quote.quoteNumber,
              quote.id,
              0,
              String(quote.total)
            );
            
            // Mark quote as expired
            await storage.updateQuote(quote.id, { status: "expired" });
          } else {
            // Expiring soon (3 or 7 days)
            await NotificationService.notifyQuoteExpiring(
              notifyUserId,
              quote.quoteNumber,
              quote.id,
              daysUntilExpiry,
              String(quote.total)
            );
          }

          alertsSent++;

          // Log the activity
          await storage.createActivityLog({
            userId: notifyUserId,
            action: daysUntilExpiry <= 0 ? "quote_expired" : "quote_expiring_soon",
            entityType: "quote",
            entityId: quote.id,
          });

          logger.info(`[QuoteExpiry] Notified for quote ${quote.quoteNumber} (${daysUntilExpiry <= 0 ? "expired today" : `expires in ${daysUntilExpiry} days`})`);
        } catch (error) {
          logger.error(`[QuoteExpiry] Failed to notify for quote ${quote.quoteNumber}:`, error);
        }
      }

      logger.info(`[QuoteExpiry] Check complete. Sent ${alertsSent} alert(s).`);
    } catch (error) {
      logger.error("[QuoteExpiry] Error checking for expiring quotes:", error);
    }
  }

  /**
   * Manually trigger a check (for testing).
   */
  static async runNow() {
    await this.checkAndNotify();
  }
}
