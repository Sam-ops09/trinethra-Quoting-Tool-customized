import cron from "node-cron";
import { SubscriptionService } from "./subscription.service";
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
  }
}
