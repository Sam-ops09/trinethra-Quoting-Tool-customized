/**
 * EMAIL TEMPLATE SERVICE
 * Handles rendering of email templates with variable substitution
 */

import { db } from "../db";
import { emailTemplates, type EmailTemplate, type EmailTemplateType } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "../utils/logger";

// Variable definitions for each template type
export const TEMPLATE_VARIABLES: Record<EmailTemplateType, { name: string; description: string }[]> = {
  quote: [
    { name: "quote_number", description: "Quote reference number" },
    { name: "client_name", description: "Client company/person name" },
    { name: "client_email", description: "Client email address" },
    { name: "total", description: "Quote total amount" },
    { name: "valid_until", description: "Quote validity date" },
    { name: "company_name", description: "Your company name" },
    { name: "attention_to", description: "Attention to person" },
    { name: "currency", description: "Currency code (e.g., INR, USD)" },
  ],
  invoice: [
    { name: "invoice_number", description: "Invoice reference number" },
    { name: "client_name", description: "Client company/person name" },
    { name: "client_email", description: "Client email address" },
    { name: "total", description: "Invoice total amount" },
    { name: "due_date", description: "Payment due date" },
    { name: "paid_amount", description: "Amount already paid" },
    { name: "remaining_amount", description: "Remaining balance" },
    { name: "company_name", description: "Your company name" },
    { name: "currency", description: "Currency code" },
  ],
  sales_order: [
    { name: "order_number", description: "Sales order number" },
    { name: "client_name", description: "Client company/person name" },
    { name: "client_email", description: "Client email address" },
    { name: "total", description: "Order total amount" },
    { name: "expected_delivery", description: "Expected delivery date" },
    { name: "company_name", description: "Your company name" },
    { name: "currency", description: "Currency code" },
  ],
  payment_reminder: [
    { name: "invoice_number", description: "Invoice reference number" },
    { name: "client_name", description: "Client company/person name" },
    { name: "remaining_amount", description: "Remaining balance" },
    { name: "due_date", description: "Payment due date" },
    { name: "days_overdue", description: "Number of days past due" },
    { name: "company_name", description: "Your company name" },
    { name: "currency", description: "Currency code" },
  ],
  password_reset: [
    { name: "user_name", description: "User's display name" },
    { name: "reset_link", description: "Password reset URL" },
    { name: "expiry_hours", description: "Hours until link expires" },
  ],
  welcome: [
    { name: "user_name", description: "User's display name" },
    { name: "login_url", description: "Application login URL" },
    { name: "company_name", description: "Your company name" },
  ],
};

// Default templates for each type
export const DEFAULT_TEMPLATES: Record<EmailTemplateType, { subject: string; body: string }> = {
  quote: {
    subject: "Quote {{quote_number}} from {{company_name}}",
    body: `<h2>Quote {{quote_number}}</h2>
<p>Dear {{client_name}},</p>
<p>Please find attached your quotation for the requested items/services.</p>
<p><strong>Total Amount:</strong> {{currency}} {{total}}</p>
<p><strong>Valid Until:</strong> {{valid_until}}</p>
<p>If you have any questions or require modifications, please don't hesitate to contact us.</p>
<p>Best regards,<br>{{company_name}}</p>`,
  },
  invoice: {
    subject: "Invoice {{invoice_number}} from {{company_name}}",
    body: `<h2>Invoice {{invoice_number}}</h2>
<p>Dear {{client_name}},</p>
<p>Please find attached your invoice for recent services/products.</p>
<p><strong>Total Amount:</strong> {{currency}} {{total}}</p>
<p><strong>Due Date:</strong> {{due_date}}</p>
<p>Please process this invoice at your earliest convenience.</p>
<p>Best regards,<br>{{company_name}}</p>`,
  },
  sales_order: {
    subject: "Sales Order {{order_number}} Confirmation from {{company_name}}",
    body: `<h2>Sales Order Confirmation</h2>
<p>Dear {{client_name}},</p>
<p>Thank you for your order. Please find attached your sales order confirmation.</p>
<p><strong>Order Number:</strong> {{order_number}}</p>
<p><strong>Total:</strong> {{currency}} {{total}}</p>
<p><strong>Expected Delivery:</strong> {{expected_delivery}}</p>
<p>We will notify you once your order has been shipped.</p>
<p>Best regards,<br>{{company_name}}</p>`,
  },
  payment_reminder: {
    subject: "Payment Reminder - Invoice {{invoice_number}}",
    body: `<h2>Payment Reminder</h2>
<p>Dear {{client_name}},</p>
<p>This is a friendly reminder that Invoice {{invoice_number}} is pending payment.</p>
<p><strong>Amount Due:</strong> {{currency}} {{remaining_amount}}</p>
<p><strong>Due Date:</strong> {{due_date}}</p>
{{#if days_overdue}}<p><strong>Days Overdue:</strong> {{days_overdue}}</p>{{/if}}
<p>Please process this payment at your earliest convenience.</p>
<p>Best regards,<br>{{company_name}}</p>`,
  },
  password_reset: {
    subject: "Password Reset Request",
    body: `<h2>Password Reset Request</h2>
<p>Hi {{user_name}},</p>
<p>You requested a password reset. Click the link below to reset your password:</p>
<p><a href="{{reset_link}}" style="display: inline-block; padding: 10px 20px; background-color: #0046FF; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
<p>This link will expire in {{expiry_hours}} hour(s).</p>
<p>If you didn't request this, you can safely ignore this email.</p>`,
  },
  welcome: {
    subject: "Welcome to {{company_name}}!",
    body: `<h2>Welcome to {{company_name}}!</h2>
<p>Hi {{user_name}},</p>
<p>Your account has been successfully created. You can now login and start using the platform.</p>
<p><a href="{{login_url}}" style="display: inline-block; padding: 10px 20px; background-color: #0046FF; color: white; text-decoration: none; border-radius: 5px;">Login Now</a></p>
<p>If you have any questions, please don't hesitate to contact us.</p>
<p>Best regards,<br>{{company_name}} Team</p>`,
  },
};

export class EmailTemplateService {
  /**
   * Get active template by type (returns default if none found)
   */
  static async getTemplate(type: EmailTemplateType): Promise<EmailTemplate | null> {
    try {
      const [template] = await db
        .select()
        .from(emailTemplates)
        .where(and(
          eq(emailTemplates.type, type),
          eq(emailTemplates.isActive, true),
          eq(emailTemplates.isDefault, true)
        ))
        .limit(1);

      if (template) return template;

      // Try to find any active template of this type
      const [anyTemplate] = await db
        .select()
        .from(emailTemplates)
        .where(and(
          eq(emailTemplates.type, type),
          eq(emailTemplates.isActive, true)
        ))
        .limit(1);

      return anyTemplate || null;
    } catch (error) {
      logger.error(`Error getting email template for type ${type}:`, error);
      return null;
    }
  }

  /**
   * Create a virtual template from defaults (for fallback)
   */
  static getDefaultTemplate(type: EmailTemplateType): { subject: string; body: string } {
    return DEFAULT_TEMPLATES[type] || DEFAULT_TEMPLATES.quote;
  }

  /**
   * Render template with variable substitution
   */
  static renderTemplate(
    template: { subject: string; body: string },
    variables: Record<string, string | number | undefined>
  ): { subject: string; body: string } {
    let subject = template.subject;
    let body = template.body;

    // Replace all {{variable}} patterns
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      const safeValue = value !== undefined ? String(value) : '';
      subject = subject.replace(regex, safeValue);
      body = body.replace(regex, safeValue);
    }

    // Handle simple conditional blocks {{#if variable}}...{{/if}}
    body = body.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, varName, content) => {
      const value = variables[varName];
      return value && value !== '' && value !== '0' ? content : '';
    });

    return { subject, body };
  }

  /**
   * Get template and render with variables (with fallback)
   */
  static async renderTemplateByType(
    type: EmailTemplateType,
    variables: Record<string, string | number | undefined>
  ): Promise<{ subject: string; body: string }> {
    const template = await this.getTemplate(type);
    
    if (template) {
      return this.renderTemplate(
        { subject: template.subject, body: template.body },
        variables
      );
    }

    // Fallback to default template
    return this.renderTemplate(this.getDefaultTemplate(type), variables);
  }

  /**
   * Get available variables for a template type
   */
  static getAvailableVariables(type: EmailTemplateType): { name: string; description: string }[] {
    return TEMPLATE_VARIABLES[type] || [];
  }

  /**
   * Validate that template uses valid variables
   */
  static validateTemplate(
    templateContent: string,
    type: EmailTemplateType
  ): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const validVars = TEMPLATE_VARIABLES[type].map(v => v.name);

    // Find all {{variable}} patterns (excluding conditionals)
    const variablePattern = /\{\{(?!#|\/)([\w]+)\}\}/g;
    let match;

    while ((match = variablePattern.exec(templateContent)) !== null) {
      const varName = match[1];
      if (!validVars.includes(varName)) {
        warnings.push(`Unknown variable: {{${varName}}}. Available: ${validVars.join(', ')}`);
      }
    }

    // Check for unclosed conditionals
    const ifCount = (templateContent.match(/\{\{#if/g) || []).length;
    const endIfCount = (templateContent.match(/\{\{\/if\}\}/g) || []).length;
    if (ifCount !== endIfCount) {
      errors.push(`Mismatched conditional blocks: ${ifCount} {{#if}} vs ${endIfCount} {{/if}}`);
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Preview template with sample data
   */
  static previewTemplate(
    template: { subject: string; body: string },
    type: EmailTemplateType
  ): { subject: string; body: string } {
    const sampleData: Record<string, string> = {
      quote_number: "QT-2026-001",
      invoice_number: "INV-2026-001",
      order_number: "SO-2026-001",
      client_name: "Acme Corporation",
      client_email: "contact@acme.com",
      total: "50,000.00",
      valid_until: "February 28, 2026",
      due_date: "February 15, 2026",
      paid_amount: "25,000.00",
      remaining_amount: "25,000.00",
      expected_delivery: "February 20, 2026",
      days_overdue: "5",
      company_name: "Your Company",
      attention_to: "John Smith",
      currency: "INR",
      user_name: "John Doe",
      reset_link: "https://example.com/reset?token=sample",
      login_url: "https://example.com/login",
      expiry_hours: "1",
    };

    return this.renderTemplate(template, sampleData);
  }

  /**
   * Seed default templates for all types
   */
  static async seedDefaultTemplates(userId: string): Promise<void> {
    const types: EmailTemplateType[] = [
      "quote", "invoice", "sales_order", "payment_reminder", "password_reset", "welcome"
    ];

    for (const type of types) {
      try {
        // Check if default template already exists
        const [existing] = await db
          .select()
          .from(emailTemplates)
          .where(and(
            eq(emailTemplates.type, type),
            eq(emailTemplates.isDefault, true)
          ))
          .limit(1);

        if (existing) {
          logger.info(`Default email template for ${type} already exists, skipping`);
          continue;
        }

        const defaultTemplate = DEFAULT_TEMPLATES[type];
        const availableVars = TEMPLATE_VARIABLES[type];

        await db.insert(emailTemplates).values({
          name: `Default ${type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Template`,
          type,
          subject: defaultTemplate.subject,
          body: defaultTemplate.body,
          availableVariables: JSON.stringify(availableVars),
          isActive: true,
          isDefault: true,
          createdBy: userId,
        });

        logger.info(`Created default email template for ${type}`);
      } catch (error) {
        logger.error(`Error seeding email template for ${type}:`, error);
      }
    }
  }
}
