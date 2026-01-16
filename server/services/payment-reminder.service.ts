import { storage } from "../storage";
import { EmailService } from "./email.service";

/**
 * Payment Reminder Scheduler Service
 * Handles automatic payment reminders for overdue invoices
 */
export class PaymentReminderScheduler {
  private static isRunning = false;
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the payment reminder scheduler
   * Runs every day at 9:00 AM to check for overdue invoices
   */
  static start() {
    if (this.isRunning) {
      console.log("[Payment Reminders] Scheduler already running");
      return;
    }

    console.log("[Payment Reminders] Starting scheduler...");
    this.isRunning = true;

    // Run immediately on start
    this.checkAndSendReminders();

    // Then run every 24 hours
    this.intervalId = setInterval(() => {
      this.checkAndSendReminders();
    }, 24 * 60 * 60 * 1000); // 24 hours

    console.log("[Payment Reminders] Scheduler started successfully");
  }

  /**
   * Stop the payment reminder scheduler
   */
  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("[Payment Reminders] Scheduler stopped");
  }

  /**
   * Check all invoices and send reminders for overdue ones
   */
  static async checkAndSendReminders() {
    try {
      console.log("[Payment Reminders] Checking for overdue invoices...");

      const invoices = await storage.getAllInvoices();
      const settings = await storage.getAllSettings();

      // Get company name for emails
      const companyName = settings.find((s) => s.key === "company_name")?.value || "OPTIVALUE TEK";

      // Get email templates
      const emailSubjectTemplate = settings.find((s) => s.key === "email_payment_reminder_subject")?.value || 
        "Payment Reminder: Invoice {INVOICE_NUMBER}";
      const emailBodyTemplate = settings.find((s) => s.key === "email_payment_reminder_body")?.value || 
        "Dear {CLIENT_NAME},\n\nThis is a friendly reminder that invoice {INVOICE_NUMBER} is due for payment.\n\nAmount Due: {OUTSTANDING}\nDue Date: {DUE_DATE}\nDays Overdue: {DAYS_OVERDUE}\n\nPlease arrange payment at your earliest convenience.\n\nBest regards,\n{COMPANY_NAME}";

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let remindersSent = 0;

      for (const invoice of invoices) {
        // Skip if invoice is already paid
        if (invoice.paymentStatus === "paid") continue;

        // Skip if not master invoice or child invoice (only send for actual invoices)
        if (!invoice.isMaster && !invoice.parentInvoiceId) continue;

        if (!invoice.dueDate) continue;
        const dueDate = new Date(invoice.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        // Send reminders for invoices that are:
        // - 3 days overdue (first reminder)
        // - 7 days overdue (second reminder)
        // - 14 days overdue (third reminder)
        // - 30 days overdue (final reminder)
        const reminderDays = [3, 7, 14, 30];

        if (reminderDays.includes(daysOverdue)) {
          try {
            // Get quote and client details
            // Get client details (support both quote-based and standalone invoices)
            let client;
            if (invoice.clientId) {
              client = await storage.getClient(invoice.clientId);
            } else if (invoice.quoteId) {
              const quote = await storage.getQuote(invoice.quoteId);
              if (quote) {
                client = await storage.getClient(quote.clientId);
              }
            }

            if (!client || !client.email) continue;

            // Calculate outstanding amount
            const outstanding = Number(invoice.total) - Number(invoice.paidAmount);

            if (outstanding <= 0) continue; // Skip if nothing is owed

            // Replace variables in templates
            const variables: Record<string, string> = {
              "{COMPANY_NAME}": companyName,
              "{CLIENT_NAME}": client.name,
              "{INVOICE_NUMBER}": invoice.invoiceNumber,
              "{OUTSTANDING}": `₹${outstanding.toLocaleString()}`,
              "{TOTAL}": `₹${Number(invoice.total).toLocaleString()}`,
              "{DUE_DATE}": dueDate.toLocaleDateString(),
              "{DAYS_OVERDUE}": `${daysOverdue} days`,
            };

            let emailSubject = emailSubjectTemplate;
            let emailBody = emailBodyTemplate;

            Object.entries(variables).forEach(([key, value]) => {
              const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              emailSubject = emailSubject.replace(new RegExp(escapedKey, 'g'), value);
              emailBody = emailBody.replace(new RegExp(escapedKey, 'g'), value);
            });

            // Add automatic reminder note
            emailBody = `${emailBody}\n\n---\nThis is an automated payment reminder sent ${daysOverdue} days after the due date.`;

            // Send the reminder
            await EmailService.sendPaymentReminderEmail(
              client.email,
              emailSubject,
              emailBody
            );

            console.log(`[Payment Reminders] Sent reminder for invoice ${invoice.invoiceNumber} to ${client.email} (${daysOverdue} days overdue)`);
            remindersSent++;

            // Log the activity
            if (invoice.createdBy) {
              await storage.createActivityLog({
                userId: invoice.createdBy,
                action: "auto_payment_reminder",
                entityType: "invoice",
                entityId: invoice.id,
              });
            }

          } catch (error) {
            console.error(`[Payment Reminders] Failed to send reminder for invoice ${invoice.invoiceNumber}:`, error);
          }
        }
      }

      console.log(`[Payment Reminders] Check complete. Sent ${remindersSent} reminders.`);
    } catch (error) {
      console.error("[Payment Reminders] Error checking for overdue invoices:", error);
    }
  }

  /**
   * Manually trigger a reminder check (for testing or manual runs)
   */
  static async sendRemindersNow() {
    await this.checkAndSendReminders();
  }
}

