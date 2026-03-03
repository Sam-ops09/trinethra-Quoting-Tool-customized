import cron from "node-cron";
import { SubscriptionService } from "./subscription.service";
import { QuoteExpiryAlertService } from "./quote-expiry.service";
import { logger } from "../utils/logger";

export class SchedulerService {
  /**
   * Initialize scheduled tasks
   */
  static init() {
    // Run every day at midnight (00:00 server time)
    // Format: Minute Hour DayMonth Month DayWeek
    cron.schedule("0 0 * * *", async () => {
      logger.info("[Scheduler] Running daily subscription check...");
      try {
        const results = await SubscriptionService.processDueSubscriptions();
        logger.info(`[Scheduler] Processed ${results.length} subscriptions.`);
      } catch (error) {
        logger.error("[Scheduler] Error processing subscriptions:", error);
      }
    });

    logger.info("[Scheduler] Subscription scheduler initialized (0 0 * * *)");

    // Run every day at 8:00 AM — check for expiring quotes
    cron.schedule("0 8 * * *", async () => {
      logger.info("[Scheduler] Running daily quote expiry check...");
      try {
        await QuoteExpiryAlertService.checkAndNotify();
      } catch (error) {
        logger.error("[Scheduler] Error checking quote expiry:", error);
      }
    });

    logger.info("[Scheduler] Quote expiry scheduler initialized (0 8 * * *)");
  }
}
