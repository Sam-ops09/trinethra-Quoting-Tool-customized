import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { Resend } from "resend";
import { isFeatureEnabled } from "../../shared/feature-flags";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export class EmailService {
  private static transporter: Transporter | null = null;
  private static resend: Resend | null = null;
  private static useResend = false;

  static initialize(config: EmailConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
    });
  }

  static initializeResend(apiKey: string) {
    this.resend = new Resend(apiKey);
    this.useResend = true;
  }

  static async getTransporter(): Promise<Transporter> {
    if (!this.transporter) {
      // Use test transporter in development/testing
      if (process.env.NODE_ENV !== "production") {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      } else {
        throw new Error("Email service not initialized");
      }
    }
    return this.transporter;
  }

  static getResend(): Resend {
    if (!this.resend) {
      throw new Error("Resend service not initialized");
    }
    return this.resend;
  }

  static async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    if (!isFeatureEnabled('email_integration')) {
        console.log('[EmailService] Email integration disabled, skipping password reset email');
        return;
    }
    const htmlContent = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #0046FF; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `;

    try {
      if (this.useResend && this.resend) {
        // Use Resend API
        let fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
        if (fromEmail.includes("@gmail.com")) {
          console.warn(`[Resend] Gmail domain not supported by Resend, falling back to: onboarding@resend.dev`);
          fromEmail = "onboarding@resend.dev";
        }
        
        await this.resend.emails.send({
          from: fromEmail,
          to: email,
          subject: "Password Reset Request",
          html: htmlContent,
        });
      } else {
        // Use nodemailer fallback
        const transporter = await this.getTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || "noreply@quoteprogen.com",
          to: email,
          subject: "Password Reset Request",
          html: htmlContent,
          text: `Password Reset Request\n\nClick the link below to reset your password:\n${resetLink}\n\nThis link will expire in 1 hour.`,
        });
      }
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      throw error;
    }
  }

  static async sendQuoteEmail(
    email: string,
    emailSubject: string,
    emailBody: string,
    pdfBuffer: Buffer
  ): Promise<void> {
    if (!isFeatureEnabled('quotes_emailSending')) {
        console.log('[EmailService] Quotes email sending disabled, skipping quote email');
        return;
    }
    // Convert newlines to HTML with proper formatting
    const lines = emailBody.split('\n');
    const formattedLines: string[] = [];
    let previousWasEmpty = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed === '') {
        if (!previousWasEmpty) {
          formattedLines.push('<br/>');
          previousWasEmpty = true;
        }
      } else {
        formattedLines.push(`<p style="margin: 4px 0;">${line}</p>`);
        previousWasEmpty = false;
      }
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
        ${formattedLines.join('')}
      </div>
    `;

    // Extract quote number from subject for filename (fallback to timestamp if not found)
    const quoteNumberMatch = emailSubject.match(/Quote\s+([A-Z0-9-]+)/i);
    const quoteNumber = quoteNumberMatch ? quoteNumberMatch[1] : `Quote_${Date.now()}`;

    try {
      let emailSent = false;

      // Try Resend first if configured
      if (this.useResend && this.resend) {
        try {
          const base64Pdf = pdfBuffer.toString("base64");
          let fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

          if (fromEmail.includes("@gmail.com")) {
            console.warn(`[Resend] Gmail domain not supported by Resend, will try fallback`);
            // Don't override, let fallback handle it
          } else {
            const response = await this.resend.emails.send({
              from: fromEmail,
              to: email,
              subject: emailSubject,
              html: htmlContent,
              attachments: [
                {
                  filename: `${quoteNumber}.pdf`,
                  content: base64Pdf,
                },
              ],
            });

            if (response.error) {
              console.warn(`[Resend] Error sending quote email, falling back to SMTP:`, response.error);
              // Don't throw, fall through to SMTP fallback
            } else {
              console.log(`[Resend] Quote email sent successfully to ${email}`);
              emailSent = true;
            }
          }
        } catch (resendError) {
          console.warn(`[Resend] Failed to send with Resend, falling back to SMTP:`, resendError);
          // Fall through to SMTP
        }
      }

      // Fallback to nodemailer if Resend didn't work
      if (!emailSent) {
        try {
          const transporter = await this.getTransporter();
          await transporter.sendMail({
            from: process.env.EMAIL_FROM || "quotes@quoteprogen.com",
            to: email,
            subject: emailSubject,
            html: htmlContent,
            text: emailBody,
            attachments: [
              {
                filename: `${quoteNumber}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
              },
            ],
          });
          console.log(`[SMTP] Quote email sent successfully to ${email}`);
          emailSent = true;
        } catch (smtpError) {
          console.error("[SMTP] Failed to send quote email:", smtpError);
          throw smtpError;
        }
      }

      if (!emailSent) {
        throw new Error("Failed to send email via both Resend and SMTP");
      }
    } catch (error) {
      console.error("Failed to send quote email:", error);
      throw error;
    }
  }

  static async sendSalesOrderEmail(
    email: string,
    emailSubject: string,
    emailBody: string,
    pdfBuffer: Buffer
  ): Promise<void> {
    if (!isFeatureEnabled('sales_orders_emailSending')) {
        console.log('[EmailService] Sales orders email sending disabled, skipping sales order email');
        return;
    }
    // Convert newlines to HTML with proper formatting
    const lines = emailBody.split('\n');
    const formattedLines: string[] = [];
    let previousWasEmpty = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed === '') {
        if (!previousWasEmpty) {
          formattedLines.push('<br/>');
          previousWasEmpty = true;
        }
      } else {
        formattedLines.push(`<p style="margin: 4px 0;">${line}</p>`);
        previousWasEmpty = false;
      }
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
        ${formattedLines.join('')}
      </div>
    `;

    // Extract order number from subject for filename
    const orderNumberMatch = emailSubject.match(/Order\s+([A-Z0-9-]+)/i);
    const orderNumber = orderNumberMatch ? orderNumberMatch[1] : `Order_${Date.now()}`;

    try {
      if (this.useResend && this.resend) {
        // Use Resend API
        const base64Pdf = pdfBuffer.toString("base64");
        let fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
        if (fromEmail.includes("@gmail.com")) {
          console.warn(`[Resend] Gmail domain not supported by Resend, falling back to: onboarding@resend.dev`);
          fromEmail = "onboarding@resend.dev";
        }

        const response = await this.resend.emails.send({
          from: fromEmail,
          to: email,
          subject: emailSubject,
          html: htmlContent,
          attachments: [
            {
              filename: `${orderNumber}.pdf`,
              content: base64Pdf,
            },
          ],
        });

        if (response.error) {
          console.error(`[Resend] Error sending sales order email:`, response.error);
          throw new Error(`Resend API error: ${JSON.stringify(response.error)}`);
        }
      } else {
        // Use nodemailer fallback
        const transporter = await this.getTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || "orders@quoteprogen.com",
          to: email,
          subject: emailSubject,
          html: htmlContent,
          text: emailBody,
          attachments: [
            {
              filename: `${orderNumber}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ],
        });
      }
    } catch (error) {
      console.error("Failed to send sales order email:", error);
      throw error;
    }
  }

  static async sendInvoiceEmail(
    email: string,
    emailSubject: string,
    emailBody: string,
    pdfBuffer: Buffer
  ): Promise<void> {
    if (!isFeatureEnabled('invoices_emailSending')) {
        console.log('[EmailService] Invoices email sending disabled, skipping invoice email');
        return;
    }
    // Convert newlines to HTML with proper formatting
    const lines = emailBody.split('\n');
    const formattedLines: string[] = [];
    let previousWasEmpty = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed === '') {
        if (!previousWasEmpty) {
          formattedLines.push('<br/>');
          previousWasEmpty = true;
        }
      } else {
        formattedLines.push(`<p style="margin: 4px 0;">${line}</p>`);
        previousWasEmpty = false;
      }
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
        ${formattedLines.join('')}
      </div>
    `;

    // Extract invoice number from subject for filename
    const invoiceNumberMatch = emailSubject.match(/Invoice\s+([A-Z0-9-]+)/i);
    const invoiceNumber = invoiceNumberMatch ? invoiceNumberMatch[1] : `Invoice_${Date.now()}`;

    try {
      if (this.useResend && this.resend) {
        // Use Resend API
        const base64Pdf = pdfBuffer.toString("base64");
        let fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
        if (fromEmail.includes("@gmail.com")) {
          console.warn(`[Resend] Gmail domain not supported by Resend, falling back to: onboarding@resend.dev`);
          fromEmail = "onboarding@resend.dev";
        }

        const response = await this.resend.emails.send({
          from: fromEmail,
          to: email,
          subject: emailSubject,
          html: htmlContent,
          attachments: [
            {
              filename: `${invoiceNumber}.pdf`,
              content: base64Pdf,
            },
          ],
        });

        if (response.error) {
          console.error(`[Resend] Error sending invoice email:`, response.error);
          throw new Error(`Resend API error: ${JSON.stringify(response.error)}`);
        }
      } else {
        // Use nodemailer fallback
        const transporter = await this.getTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || "invoices@quoteprogen.com",
          to: email,
          subject: emailSubject,
          html: htmlContent,
          text: emailBody,
          attachments: [
            {
              filename: `${invoiceNumber}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ],
        });
      }
    } catch (error) {
      console.error("Failed to send invoice email:", error);
      throw error;
    }
  }

  static async sendPaymentReminderEmail(
    email: string,
    emailSubject: string,
    emailBody: string
  ): Promise<void> {
    if (!isFeatureEnabled('invoices_emailSending')) {
        console.log('[EmailService] Invoices email sending disabled, skipping payment reminder email');
        return;
    }
    // Convert newlines to HTML with proper formatting
    const lines = emailBody.split('\n');
    const formattedLines: string[] = [];
    let previousWasEmpty = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed === '') {
        if (!previousWasEmpty) {
          formattedLines.push('<br/>');
          previousWasEmpty = true;
        }
      } else {
        formattedLines.push(`<p style="margin: 4px 0;">${line}</p>`);
        previousWasEmpty = false;
      }
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
        ${formattedLines.join('')}
      </div>
    `;

    try {
      if (this.useResend && this.resend) {
        // Use Resend API
        let fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
        if (fromEmail.includes("@gmail.com")) {
          console.warn(`[Resend] Gmail domain not supported by Resend, falling back to: onboarding@resend.dev`);
          fromEmail = "onboarding@resend.dev";
        }
        
        const response = await this.resend.emails.send({
          from: fromEmail,
          to: email,
          subject: emailSubject,
          html: htmlContent,
        });

        if (response.error) {
          console.error(`[Resend] Error sending payment reminder:`, response.error);
          throw new Error(`Resend API error: ${JSON.stringify(response.error)}`);
        }
      } else {
        // Use nodemailer fallback
        const transporter = await this.getTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || "billing@quoteprogen.com",
          to: email,
          subject: emailSubject,
          html: htmlContent,
          text: emailBody,
        });
      }
    } catch (error) {
      console.error("Failed to send payment reminder email:", error);
      throw error;
    }
  }

  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    if (!isFeatureEnabled('email_welcome')) {
        console.log('[EmailService] Welcome email sending disabled, skipping welcome email');
        return;
    }
    const htmlContent = `
      <h2>Welcome to QuoteProGen!</h2>
      <p>Hi ${name},</p>
      <p>Your account has been successfully created. You can now login and start creating professional quotes.</p>
      <p>Visit our platform to get started: <a href="${process.env.APP_URL || "http://localhost:5000"}/login">Login</a></p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br/>QuoteProGen Team</p>
    `;

    try {
      if (this.useResend && this.resend) {
        // Use Resend API
        let fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
        if (fromEmail.includes("@gmail.com")) {
          console.warn(`[Resend] Gmail domain not supported by Resend, falling back to: onboarding@resend.dev`);
          fromEmail = "onboarding@resend.dev";
        }
        
        await this.resend.emails.send({
          from: fromEmail,
          to: email,
          subject: "Welcome to QuoteProGen!",
          html: htmlContent,
        });
      } else {
        // Use nodemailer fallback
        const transporter = await this.getTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || "welcome@quoteprogen.com",
          to: email,
          subject: "Welcome to QuoteProGen!",
          html: htmlContent,
        });
      }
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      // Don't throw - welcome email is non-critical
    }
  }

  static async sendSubscriptionRenewedEmail(
    to: string,
    clientName: string,
    planName: string,
    invoiceNumber: string,
    amount: string,
    nextDate: Date
  ): Promise<void> {
    if (!isFeatureEnabled('email_subscriptionRenewed')) {
        console.log('[EmailService] Subscription renewal email sending disabled, skipping subscription renewal email');
        return;
    }
    const htmlContent = `
      <h2>Subscription Renewed</h2>
      <p>Hello ${clientName},</p>
      <p>Your subscription for <strong>${planName}</strong> has been successfully renewed.</p>
      <p>Order Details:</p>
      <ul>
        <li><strong>Invoice:</strong> ${invoiceNumber}</li>
        <li><strong>Amount:</strong> ${amount}</li>
        <li><strong>Next Renewal:</strong> ${nextDate.toLocaleDateString()}</li>
      </ul>
      <p>Thank you for your business!</p>
    `;

    try {
      if (this.useResend && this.resend) {
        let fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
        if (fromEmail.includes("@gmail.com")) {
            fromEmail = "onboarding@resend.dev";
        }
        await this.resend.emails.send({
          from: fromEmail,
          to: to,
          subject: `Subscription Renewed: ${planName}`,
          html: htmlContent,
        });
      } else {
        const transporter = await this.getTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || "billing@quoteprogen.com",
          to: to,
          subject: `Subscription Renewed: ${planName}`,
          html: htmlContent,
        });
      }
      console.log(`[EmailService] Subscription renewal email sent to ${to}`);
    } catch (error) {
      console.error("Failed to send subscription renewal email:", error);
      // don't throw to avoid breaking the scheduler loop
    }
  }
  static async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    if (!isFeatureEnabled('email_integration')) {
        console.log('[EmailService] Email integration disabled, skipping generic email');
        return;
    }
    try {
      if (this.useResend && this.resend) {
        let fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
        if (fromEmail.includes("@gmail.com")) {
            fromEmail = "onboarding@resend.dev";
        }
        await this.resend.emails.send({
          from: fromEmail,
          to: params.to,
          subject: params.subject,
          html: params.html,
          text: params.text,
        });
      } else {
        const transporter = await this.getTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || "noreply@quoteprogen.com",
          to: params.to,
          subject: params.subject,
          html: params.html,
          text: params.text,
        });
      }
      console.log(`[EmailService] Generic email sent to ${params.to}`);
    } catch (error) {
      console.error("Failed to send generic email:", error);
      throw error;
    }
  }
}