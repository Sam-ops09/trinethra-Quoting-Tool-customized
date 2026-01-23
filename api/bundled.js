var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activityLogs: () => activityLogs,
  activityLogsRelations: () => activityLogsRelations,
  approvalRuleTriggerTypeEnum: () => approvalRuleTriggerTypeEnum,
  approvalRules: () => approvalRules,
  approvalRulesRelations: () => approvalRulesRelations,
  approvalStatusEnum: () => approvalStatusEnum,
  bankDetails: () => bankDetails,
  billingCycleEnum: () => billingCycleEnum,
  clientCommunications: () => clientCommunications,
  clientCommunicationsRelations: () => clientCommunicationsRelations,
  clientTags: () => clientTags,
  clientTagsRelations: () => clientTagsRelations,
  clients: () => clients,
  clientsRelations: () => clientsRelations,
  collaborationSessions: () => collaborationSessions,
  collaborationSessionsRelations: () => collaborationSessionsRelations,
  creditNoteItems: () => creditNoteItems,
  creditNoteItemsRelations: () => creditNoteItemsRelations,
  creditNoteStatusEnum: () => creditNoteStatusEnum,
  creditNotes: () => creditNotes,
  creditNotesRelations: () => creditNotesRelations,
  currencySettings: () => currencySettings,
  debitNoteItems: () => debitNoteItems,
  debitNoteItemsRelations: () => debitNoteItemsRelations,
  debitNoteStatusEnum: () => debitNoteStatusEnum,
  debitNotes: () => debitNotes,
  debitNotesRelations: () => debitNotesRelations,
  emailTemplateTypeEnum: () => emailTemplateTypeEnum,
  emailTemplates: () => emailTemplates,
  emailTemplatesRelations: () => emailTemplatesRelations,
  goodsReceivedNotes: () => goodsReceivedNotes,
  goodsReceivedNotesRelations: () => goodsReceivedNotesRelations,
  insertActivityLogSchema: () => insertActivityLogSchema,
  insertApprovalRuleSchema: () => insertApprovalRuleSchema,
  insertBankDetailsSchema: () => insertBankDetailsSchema,
  insertClientCommunicationSchema: () => insertClientCommunicationSchema,
  insertClientSchema: () => insertClientSchema,
  insertClientTagSchema: () => insertClientTagSchema,
  insertCollaborationSessionSchema: () => insertCollaborationSessionSchema,
  insertCreditNoteItemSchema: () => insertCreditNoteItemSchema,
  insertCreditNoteSchema: () => insertCreditNoteSchema,
  insertCurrencySettingSchema: () => insertCurrencySettingSchema,
  insertDebitNoteItemSchema: () => insertDebitNoteItemSchema,
  insertDebitNoteSchema: () => insertDebitNoteSchema,
  insertEmailTemplateSchema: () => insertEmailTemplateSchema,
  insertGrnSchema: () => insertGrnSchema,
  insertInvoiceAttachmentSchema: () => insertInvoiceAttachmentSchema,
  insertInvoiceItemSchema: () => insertInvoiceItemSchema,
  insertInvoiceSchema: () => insertInvoiceSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertPaymentHistorySchema: () => insertPaymentHistorySchema,
  insertPricingTierSchema: () => insertPricingTierSchema,
  insertProductSchema: () => insertProductSchema,
  insertQuoteItemSchema: () => insertQuoteItemSchema,
  insertQuoteSchema: () => insertQuoteSchema,
  insertQuoteVersionSchema: () => insertQuoteVersionSchema,
  insertSalesOrderItemSchema: () => insertSalesOrderItemSchema,
  insertSalesOrderSchema: () => insertSalesOrderSchema,
  insertSerialNumberSchema: () => insertSerialNumberSchema,
  insertSettingSchema: () => insertSettingSchema,
  insertTaxRateSchema: () => insertTaxRateSchema,
  insertTemplateSchema: () => insertTemplateSchema,
  insertUserDeviceSchema: () => insertUserDeviceSchema,
  insertUserSchema: () => insertUserSchema,
  insertVendorPoItemSchema: () => insertVendorPoItemSchema,
  insertVendorPurchaseOrderSchema: () => insertVendorPurchaseOrderSchema,
  insertVendorSchema: () => insertVendorSchema,
  insertWorkflowActionSchema: () => insertWorkflowActionSchema,
  insertWorkflowExecutionSchema: () => insertWorkflowExecutionSchema,
  insertWorkflowScheduleSchema: () => insertWorkflowScheduleSchema,
  insertWorkflowSchema: () => insertWorkflowSchema,
  insertWorkflowTriggerSchema: () => insertWorkflowTriggerSchema,
  invoiceAttachments: () => invoiceAttachments,
  invoiceItemStatusEnum: () => invoiceItemStatusEnum,
  invoiceItems: () => invoiceItems,
  invoiceItemsRelations: () => invoiceItemsRelations,
  invoices: () => invoices,
  invoicesRelations: () => invoicesRelations,
  masterInvoiceStatusEnum: () => masterInvoiceStatusEnum,
  notificationTypeEnum: () => notificationTypeEnum,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  paymentHistory: () => paymentHistory,
  paymentHistoryRelations: () => paymentHistoryRelations,
  paymentStatusEnum: () => paymentStatusEnum,
  paymentTerms: () => paymentTerms,
  pricingTiers: () => pricingTiers,
  products: () => products,
  productsRelations: () => productsRelations,
  quoteComments: () => quoteComments,
  quoteCommentsRelations: () => quoteCommentsRelations,
  quoteItems: () => quoteItems,
  quoteStatusEnum: () => quoteStatusEnum,
  quoteVersions: () => quoteVersions,
  quoteVersionsRelations: () => quoteVersionsRelations,
  quotes: () => quotes,
  quotesRelations: () => quotesRelations,
  salesOrderItemStatusEnum: () => salesOrderItemStatusEnum,
  salesOrderItems: () => salesOrderItems,
  salesOrderItemsRelations: () => salesOrderItemsRelations,
  salesOrderStatusEnum: () => salesOrderStatusEnum,
  salesOrders: () => salesOrders,
  salesOrdersRelations: () => salesOrdersRelations,
  serialNumbers: () => serialNumbers,
  serialNumbersRelations: () => serialNumbersRelations,
  settings: () => settings,
  subscriptionStatusEnum: () => subscriptionStatusEnum,
  subscriptions: () => subscriptions,
  subscriptionsRelations: () => subscriptionsRelations,
  taxRates: () => taxRates,
  templates: () => templates,
  templatesRelations: () => templatesRelations,
  userDevices: () => userDevices,
  userDevicesRelations: () => userDevicesRelations,
  userRoleEnum: () => userRoleEnum,
  userStatusEnum: () => userStatusEnum,
  users: () => users,
  usersRelations: () => usersRelations,
  vendorPoItems: () => vendorPoItems,
  vendorPoItemsRelations: () => vendorPoItemsRelations,
  vendorPoStatusEnum: () => vendorPoStatusEnum,
  vendorPurchaseOrders: () => vendorPurchaseOrders,
  vendorPurchaseOrdersRelations: () => vendorPurchaseOrdersRelations,
  vendors: () => vendors,
  vendorsRelations: () => vendorsRelations,
  workflowActionTypeEnum: () => workflowActionTypeEnum,
  workflowActions: () => workflowActions,
  workflowActionsRelations: () => workflowActionsRelations,
  workflowExecutions: () => workflowExecutions,
  workflowExecutionsRelations: () => workflowExecutionsRelations,
  workflowSchedules: () => workflowSchedules,
  workflowSchedulesRelations: () => workflowSchedulesRelations,
  workflowStatusEnum: () => workflowStatusEnum,
  workflowTriggerTypeEnum: () => workflowTriggerTypeEnum,
  workflowTriggers: () => workflowTriggers,
  workflowTriggersRelations: () => workflowTriggersRelations,
  workflows: () => workflows,
  workflowsRelations: () => workflowsRelations
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, pgEnum, boolean, index, uniqueIndex, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var userRoleEnum, userStatusEnum, quoteStatusEnum, paymentStatusEnum, vendorPoStatusEnum, invoiceItemStatusEnum, masterInvoiceStatusEnum, salesOrderStatusEnum, salesOrderItemStatusEnum, creditNoteStatusEnum, debitNoteStatusEnum, subscriptionStatusEnum, billingCycleEnum, approvalStatusEnum, users, usersRelations, userDevices, userDevicesRelations, clients, clientsRelations, quotes, approvalRuleTriggerTypeEnum, approvalRules, approvalRulesRelations, quoteVersions, quoteVersionsRelations, salesOrders, salesOrdersRelations, salesOrderItems, salesOrderItemsRelations, quoteItems, quoteComments, quoteCommentsRelations, subscriptions, subscriptionsRelations, invoices, quotesRelations, invoicesRelations, paymentHistory, paymentHistoryRelations, invoiceItems, invoiceAttachments, invoiceItemsRelations, vendors, vendorsRelations, vendorPurchaseOrders, vendorPurchaseOrdersRelations, vendorPoItems, vendorPoItemsRelations, products, productsRelations, goodsReceivedNotes, goodsReceivedNotesRelations, serialNumbers, serialNumbersRelations, templates, templatesRelations, activityLogs, activityLogsRelations, settings, bankDetails, clientTags, clientTagsRelations, clientCommunications, clientCommunicationsRelations, taxRates, paymentTerms, pricingTiers, currencySettings, emailTemplateTypeEnum, emailTemplates, emailTemplatesRelations, insertUserSchema, insertClientSchema, insertQuoteSchema, insertApprovalRuleSchema, insertQuoteItemSchema, insertInvoiceSchema, insertPaymentHistorySchema, insertTemplateSchema, insertActivityLogSchema, insertSettingSchema, insertBankDetailsSchema, insertClientTagSchema, insertClientCommunicationSchema, insertTaxRateSchema, insertPricingTierSchema, insertCurrencySettingSchema, insertInvoiceItemSchema, insertVendorSchema, insertVendorPurchaseOrderSchema, insertVendorPoItemSchema, insertProductSchema, insertGrnSchema, insertSerialNumberSchema, insertQuoteVersionSchema, insertSalesOrderSchema, insertSalesOrderItemSchema, notificationTypeEnum, notifications, notificationsRelations, collaborationSessions, collaborationSessionsRelations, insertNotificationSchema, insertCollaborationSessionSchema, creditNotes, creditNoteItems, creditNotesRelations, creditNoteItemsRelations, debitNotes, debitNoteItems, debitNotesRelations, debitNoteItemsRelations, insertCreditNoteSchema, insertCreditNoteItemSchema, insertDebitNoteSchema, insertDebitNoteItemSchema, insertInvoiceAttachmentSchema, insertEmailTemplateSchema, workflowStatusEnum, workflowTriggerTypeEnum, workflowActionTypeEnum, workflows, workflowsRelations, workflowTriggers, workflowTriggersRelations, workflowActions, workflowActionsRelations, workflowExecutions, workflowExecutionsRelations, workflowSchedules, workflowSchedulesRelations, insertWorkflowSchema, insertWorkflowTriggerSchema, insertWorkflowActionSchema, insertWorkflowExecutionSchema, insertWorkflowScheduleSchema, insertUserDeviceSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    userRoleEnum = pgEnum("user_role", ["admin", "sales_executive", "sales_manager", "purchase_operations", "finance_accounts", "viewer"]);
    userStatusEnum = pgEnum("user_status", ["active", "inactive"]);
    quoteStatusEnum = pgEnum("quote_status", ["draft", "sent", "approved", "rejected", "invoiced", "closed_paid", "closed_cancelled"]);
    paymentStatusEnum = pgEnum("payment_status", ["pending", "partial", "paid", "overdue"]);
    vendorPoStatusEnum = pgEnum("vendor_po_status", ["draft", "sent", "acknowledged", "fulfilled", "cancelled"]);
    invoiceItemStatusEnum = pgEnum("invoice_item_status", ["pending", "fulfilled", "partial"]);
    masterInvoiceStatusEnum = pgEnum("master_invoice_status", ["draft", "confirmed", "locked"]);
    salesOrderStatusEnum = pgEnum("sales_order_status", ["draft", "confirmed", "fulfilled", "cancelled"]);
    salesOrderItemStatusEnum = pgEnum("sales_order_item_status", ["pending", "partial", "fulfilled"]);
    creditNoteStatusEnum = pgEnum("credit_note_status", ["draft", "issued", "applied", "cancelled"]);
    debitNoteStatusEnum = pgEnum("debit_note_status", ["draft", "issued", "applied", "cancelled"]);
    subscriptionStatusEnum = pgEnum("subscription_status", ["active", "paused", "cancelled", "expired"]);
    billingCycleEnum = pgEnum("billing_cycle", ["monthly", "quarterly", "annually"]);
    approvalStatusEnum = pgEnum("approval_status", ["none", "pending", "approved", "rejected"]);
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      email: text("email").notNull().unique(),
      backupEmail: text("backup_email"),
      passwordHash: text("password_hash").notNull(),
      name: text("name").notNull(),
      role: userRoleEnum("role").notNull().default("viewer"),
      status: userStatusEnum("status").notNull().default("active"),
      resetToken: text("reset_token"),
      resetTokenExpiry: timestamp("reset_token_expiry"),
      refreshToken: text("refresh_token"),
      refreshTokenExpiry: timestamp("refresh_token_expiry"),
      // Delegation fields for temporary approval authority
      delegatedApprovalTo: varchar("delegated_approval_to"),
      delegationStartDate: timestamp("delegation_start_date"),
      delegationEndDate: timestamp("delegation_end_date"),
      delegationReason: text("delegation_reason"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    usersRelations = relations(users, ({ many }) => ({
      clients: many(clients),
      quotes: many(quotes),
      templates: many(templates),
      activityLogs: many(activityLogs),
      communications: many(clientCommunications),
      devices: many(userDevices)
    }));
    userDevices = pgTable("user_devices", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      deviceType: text("device_type").notNull(),
      // 'desktop', 'mobile', 'tablet', 'unknown'
      browser: text("browser"),
      os: text("os"),
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      lastActive: timestamp("last_active").notNull().defaultNow(),
      isActive: boolean("is_active").notNull().default(true),
      tokenHash: text("token_hash"),
      // Store hash of the session token to identify/revoke specific sessions
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    userDevicesRelations = relations(userDevices, ({ one }) => ({
      user: one(users, {
        fields: [userDevices.userId],
        references: [users.id]
      })
    }));
    clients = pgTable("clients", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      email: text("email").notNull(),
      phone: text("phone"),
      billingAddress: text("billing_address"),
      shippingAddress: text("shipping_address"),
      gstin: text("gstin"),
      contactPerson: text("contact_person"),
      segment: text("segment"),
      // enterprise, corporate, startup, government, education
      preferredTheme: text("preferred_theme"),
      // professional, modern, minimal, creative, premium
      createdBy: varchar("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      isActive: boolean("is_active").notNull().default(true)
    });
    clientsRelations = relations(clients, ({ one, many }) => ({
      creator: one(users, {
        fields: [clients.createdBy],
        references: [users.id]
      }),
      quotes: many(quotes),
      tags: many(clientTags),
      communications: many(clientCommunications)
    }));
    quotes = pgTable("quotes", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      quoteNumber: text("quote_number").notNull().unique(),
      version: integer("version").notNull().default(1),
      clientId: varchar("client_id").notNull().references(() => clients.id),
      templateId: varchar("template_id").references(() => templates.id),
      status: quoteStatusEnum("status").notNull().default("draft"),
      validityDays: integer("validity_days").notNull().default(30),
      quoteDate: timestamp("quote_date").notNull().defaultNow(),
      validUntil: timestamp("valid_until"),
      referenceNumber: text("reference_number"),
      attentionTo: text("attention_to"),
      currency: text("currency").notNull().default("INR"),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
      discount: decimal("discount", { precision: 12, scale: 2 }).notNull().default("0"),
      cgst: decimal("cgst", { precision: 12, scale: 2 }).notNull().default("0"),
      sgst: decimal("sgst", { precision: 12, scale: 2 }).notNull().default("0"),
      igst: decimal("igst", { precision: 12, scale: 2 }).notNull().default("0"),
      shippingCharges: decimal("shipping_charges", { precision: 12, scale: 2 }).notNull().default("0"),
      total: decimal("total", { precision: 12, scale: 2 }).notNull().default("0"),
      notes: text("notes"),
      termsAndConditions: text("terms_and_conditions"),
      // Advanced Sections
      bomSection: text("bom_section"),
      // Bill of Materials JSON
      slaSection: text("sla_section"),
      // Service Level Agreement JSON
      timelineSection: text("timeline_section"),
      // Project Timeline JSON
      // Closure tracking
      closedAt: timestamp("closed_at"),
      closedBy: varchar("closed_by").references(() => users.id),
      closureNotes: text("closure_notes"),
      // Public Sharing
      publicToken: text("public_token").unique(),
      tokenExpiresAt: timestamp("token_expires_at"),
      // Rule-Based Approval Fields
      approvalStatus: approvalStatusEnum("approval_status").notNull().default("none"),
      // none, pending, approved, rejected
      approvalRequiredBy: userRoleEnum("approval_required_by"),
      // Role required to approve (e.g. sales_manager)
      // Client Acceptance Fields
      clientSignature: text("client_signature"),
      clientAcceptedAt: timestamp("client_accepted_at"),
      clientAcceptedName: text("client_accepted_name"),
      assignedTo: varchar("assigned_to").references(() => users.id),
      createdBy: varchar("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    approvalRuleTriggerTypeEnum = pgEnum("approval_rule_trigger_type", ["discount_percentage", "total_amount"]);
    approvalRules = pgTable("approval_rules", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      description: text("description"),
      triggerType: approvalRuleTriggerTypeEnum("trigger_type").notNull(),
      thresholdValue: decimal("threshold_value", { precision: 12, scale: 2 }).notNull(),
      requiredRole: userRoleEnum("required_role").notNull().default("sales_manager"),
      isActive: boolean("is_active").notNull().default(true),
      createdBy: varchar("created_by").references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    approvalRulesRelations = relations(approvalRules, ({ one }) => ({
      creator: one(users, {
        fields: [approvalRules.createdBy],
        references: [users.id]
      })
    }));
    quoteVersions = pgTable("quote_versions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      quoteId: varchar("quote_id").notNull().references(() => quotes.id, { onDelete: "cascade" }),
      version: integer("version").notNull(),
      // Snapshot data
      clientId: varchar("client_id").notNull(),
      status: text("status").notNull(),
      validityDays: integer("validity_days"),
      quoteDate: timestamp("quote_date"),
      validUntil: timestamp("valid_until"),
      referenceNumber: text("reference_number"),
      attentionTo: text("attention_to"),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0"),
      discount: decimal("discount", { precision: 12, scale: 2 }).default("0"),
      cgst: decimal("cgst", { precision: 12, scale: 2 }).default("0"),
      sgst: decimal("sgst", { precision: 12, scale: 2 }).default("0"),
      igst: decimal("igst", { precision: 12, scale: 2 }).default("0"),
      shippingCharges: decimal("shipping_charges", { precision: 12, scale: 2 }).default("0"),
      total: decimal("total", { precision: 12, scale: 2 }).default("0"),
      notes: text("notes"),
      termsAndConditions: text("terms_and_conditions"),
      bomSection: text("bom_section"),
      slaSection: text("sla_section"),
      timelineSection: text("timeline_section"),
      itemsSnapshot: text("items_snapshot").notNull(),
      // JSON
      revisionNotes: text("revision_notes"),
      revisedBy: varchar("revised_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    quoteVersionsRelations = relations(quoteVersions, ({ one }) => ({
      quote: one(quotes, {
        fields: [quoteVersions.quoteId],
        references: [quotes.id]
      }),
      reviser: one(users, {
        fields: [quoteVersions.revisedBy],
        references: [users.id]
      })
    }));
    salesOrders = pgTable("sales_orders", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      orderNumber: text("order_number").notNull().unique(),
      quoteId: varchar("quote_id").references(() => quotes.id),
      clientId: varchar("client_id").notNull().references(() => clients.id),
      status: salesOrderStatusEnum("status").notNull().default("draft"),
      orderDate: timestamp("order_date").notNull().defaultNow(),
      expectedDeliveryDate: timestamp("expected_delivery_date"),
      actualDeliveryDate: timestamp("actual_delivery_date"),
      currency: text("currency").notNull().default("INR"),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
      discount: decimal("discount", { precision: 12, scale: 2 }).notNull().default("0"),
      cgst: decimal("cgst", { precision: 12, scale: 2 }).notNull().default("0"),
      sgst: decimal("sgst", { precision: 12, scale: 2 }).notNull().default("0"),
      igst: decimal("igst", { precision: 12, scale: 2 }).notNull().default("0"),
      shippingCharges: decimal("shipping_charges", { precision: 12, scale: 2 }).notNull().default("0"),
      total: decimal("total", { precision: 12, scale: 2 }).notNull().default("0"),
      notes: text("notes"),
      termsAndConditions: text("terms_and_conditions"),
      confirmedAt: timestamp("confirmed_at"),
      confirmedBy: varchar("confirmed_by").references(() => users.id),
      createdBy: varchar("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow(),
      bomSection: text("bom_section")
      // Stores JSON string of ExecBOMData
    }, (table) => {
      return {
        uniqueQuote: uniqueIndex("idx_sales_orders_quote_unique").on(table.quoteId)
      };
    });
    salesOrdersRelations = relations(salesOrders, ({ one, many }) => ({
      quote: one(quotes, {
        fields: [salesOrders.quoteId],
        references: [quotes.id]
      }),
      client: one(clients, {
        fields: [salesOrders.clientId],
        references: [clients.id]
      }),
      creator: one(users, {
        fields: [salesOrders.createdBy],
        references: [users.id]
      }),
      confirmer: one(users, {
        fields: [salesOrders.confirmedBy],
        references: [users.id]
      }),
      items: many(salesOrderItems),
      // One sales order can have multiple invoices (e.g. partial)
      invoices: many(invoices)
    }));
    salesOrderItems = pgTable("sales_order_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      salesOrderId: varchar("sales_order_id").notNull().references(() => salesOrders.id, { onDelete: "cascade" }),
      productId: varchar("product_id").references(() => products.id),
      // Optional link to product catalog
      description: text("description").notNull(),
      quantity: integer("quantity").notNull().default(1),
      fulfilledQuantity: integer("fulfilled_quantity").notNull().default(0),
      unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
      hsnSac: varchar("hsn_sac", { length: 10 }),
      status: salesOrderItemStatusEnum("status").notNull().default("pending"),
      sortOrder: integer("sort_order").notNull().default(0),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => {
      return {
        salesOrderIdx: index("idx_sales_order_items_order_id").on(table.salesOrderId)
      };
    });
    salesOrderItemsRelations = relations(salesOrderItems, ({ one }) => ({
      salesOrder: one(salesOrders, {
        fields: [salesOrderItems.salesOrderId],
        references: [salesOrders.id]
      })
    }));
    quoteItems = pgTable("quote_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      quoteId: varchar("quote_id").notNull().references(() => quotes.id, { onDelete: "cascade" }),
      productId: varchar("product_id").references(() => products.id),
      // Optional link to product catalog
      description: text("description").notNull(),
      quantity: integer("quantity").notNull().default(1),
      unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
      hsnSac: varchar("hsn_sac", { length: 10 }),
      sortOrder: integer("sort_order").notNull().default(0),
      // Optional item support - client can deselect optional items
      isOptional: boolean("is_optional").notNull().default(false),
      isSelected: boolean("is_selected").notNull().default(true)
    });
    quoteComments = pgTable("quote_comments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      quoteId: varchar("quote_id").notNull().references(() => quotes.id, { onDelete: "cascade" }),
      authorType: text("author_type").notNull(),
      // 'client' or 'internal'
      authorName: text("author_name").notNull(),
      authorEmail: text("author_email"),
      message: text("message").notNull(),
      parentCommentId: varchar("parent_comment_id"),
      isInternal: boolean("is_internal").notNull().default(false),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    quoteCommentsRelations = relations(quoteComments, ({ one }) => ({
      quote: one(quotes, {
        fields: [quoteComments.quoteId],
        references: [quotes.id]
      }),
      parentComment: one(quoteComments, {
        fields: [quoteComments.parentCommentId],
        references: [quoteComments.id]
      })
    }));
    subscriptions = pgTable("subscriptions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      subscriptionNumber: text("subscription_number").notNull().unique(),
      // SUB-2025-001
      clientId: varchar("client_id").notNull().references(() => clients.id),
      planName: text("plan_name").notNull(),
      status: subscriptionStatusEnum("status").notNull().default("active"),
      billingCycle: billingCycleEnum("billing_cycle").notNull().default("monthly"),
      startDate: timestamp("start_date").notNull().defaultNow(),
      nextBillingDate: timestamp("next_billing_date").notNull(),
      amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
      currency: text("currency").notNull().default("INR"),
      autoRenew: boolean("auto_renew").notNull().default(true),
      itemsSnapshot: text("items_snapshot").notNull(),
      // JSON
      lastInvoiceDate: timestamp("last_invoice_date"),
      prorataCredit: decimal("prorata_credit", { precision: 12, scale: 2 }).default("0"),
      notes: text("notes"),
      createdBy: varchar("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
      client: one(clients, {
        fields: [subscriptions.clientId],
        references: [clients.id]
      }),
      creator: one(users, {
        fields: [subscriptions.createdBy],
        references: [users.id]
      }),
      invoices: many(invoices)
    }));
    invoices = pgTable("invoices", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      invoiceNumber: text("invoice_number").notNull().unique(),
      quoteId: varchar("quote_id").references(() => quotes.id),
      salesOrderId: varchar("sales_order_id").references(() => salesOrders.id),
      clientId: varchar("client_id").references(() => clients.id),
      parentInvoiceId: varchar("parent_invoice_id"),
      subscriptionId: varchar("subscription_id").references(() => subscriptions.id),
      status: text("status").notNull().default("draft"),
      masterInvoiceStatus: text("master_invoice_status").default("draft"),
      paymentStatus: text("payment_status").default("pending"),
      issueDate: timestamp("issue_date").notNull().defaultNow(),
      dueDate: timestamp("due_date"),
      paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default("0"),
      remainingAmount: decimal("remaining_amount", { precision: 12, scale: 2 }).default("0"),
      currency: text("currency").notNull().default("INR"),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0"),
      discount: decimal("discount", { precision: 12, scale: 2 }).default("0"),
      cgst: decimal("cgst", { precision: 12, scale: 2 }).default("0"),
      sgst: decimal("sgst", { precision: 12, scale: 2 }).default("0"),
      igst: decimal("igst", { precision: 12, scale: 2 }).default("0"),
      shippingCharges: decimal("shipping_charges", { precision: 12, scale: 2 }).default("0"),
      total: decimal("total", { precision: 12, scale: 2 }).default("0"),
      notes: text("notes"),
      deliveryNotes: text("delivery_notes"),
      milestoneDescription: text("milestone_description"),
      lastPaymentDate: timestamp("last_payment_date"),
      paymentNotes: text("payment_notes"),
      termsAndConditions: text("terms_and_conditions"),
      isMaster: boolean("is_master").notNull().default(false),
      bomSection: text("bom_section"),
      // Stores JSON string of ExecBOMData
      // Invoice management fields
      cancelledAt: timestamp("cancelled_at"),
      cancelledBy: varchar("cancelled_by").references(() => users.id),
      cancellationReason: text("cancellation_reason"),
      finalizedAt: timestamp("finalized_at"),
      finalizedBy: varchar("finalized_by").references(() => users.id),
      isLocked: boolean("is_locked").notNull().default(false),
      createdBy: varchar("created_by").references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => {
      return {
        parentIdx: index("idx_invoices_parent_invoice_id").on(table.parentInvoiceId),
        subscriptionIdx: index("idx_invoices_subscription_id").on(table.subscriptionId),
        // REMOVED unique constraint to allow partial invoicing (multiple invoices per SO)
        // uniqueSalesOrder: uniqueIndex("idx_invoices_sales_order_unique").on(table.salesOrderId).where(sql`sales_order_id IS NOT NULL`),
        clientIdx: index("idx_invoices_client_id").on(table.clientId),
        paymentStatusIdx: index("idx_invoices_payment_status").on(table.paymentStatus)
      };
    });
    quotesRelations = relations(quotes, ({ one, many }) => ({
      client: one(clients, {
        fields: [quotes.clientId],
        references: [clients.id]
      }),
      template: one(templates, {
        fields: [quotes.templateId],
        references: [templates.id]
      }),
      creator: one(users, {
        fields: [quotes.createdBy],
        references: [users.id]
      }),
      closer: one(users, {
        fields: [quotes.closedBy],
        references: [users.id]
      }),
      items: many(quoteItems),
      invoices: many(invoices),
      vendorPos: many(vendorPurchaseOrders),
      versions: many(quoteVersions),
      salesOrders: many(salesOrders)
    }));
    invoicesRelations = relations(invoices, ({ one, many }) => ({
      quote: one(quotes, {
        fields: [invoices.quoteId],
        references: [quotes.id]
      }),
      parentInvoice: one(invoices, {
        fields: [invoices.parentInvoiceId],
        references: [invoices.id],
        relationName: "invoiceHierarchy"
      }),
      childInvoices: many(invoices, {
        relationName: "invoiceHierarchy"
      }),
      subscription: one(subscriptions, {
        fields: [invoices.subscriptionId],
        references: [subscriptions.id]
      }),
      creator: one(users, {
        fields: [invoices.createdBy],
        references: [users.id]
      }),
      items: many(invoiceItems),
      payments: many(paymentHistory)
    }));
    paymentHistory = pgTable("payment_history", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      invoiceId: varchar("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
      amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
      paymentMethod: text("payment_method").notNull(),
      // bank_transfer, credit_card, check, cash, upi, etc.
      transactionId: text("transaction_id"),
      notes: text("notes"),
      paymentDate: timestamp("payment_date").notNull().defaultNow(),
      recordedBy: varchar("recorded_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    paymentHistoryRelations = relations(paymentHistory, ({ one }) => ({
      invoice: one(invoices, {
        fields: [paymentHistory.invoiceId],
        references: [invoices.id]
      }),
      recordedBy: one(users, {
        fields: [paymentHistory.recordedBy],
        references: [users.id]
      })
    }));
    invoiceItems = pgTable("invoice_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      invoiceId: varchar("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
      productId: varchar("product_id").references(() => products.id),
      // Optional link to product catalog
      description: text("description").notNull(),
      quantity: integer("quantity").notNull().default(1),
      fulfilledQuantity: integer("fulfilled_quantity").notNull().default(0),
      unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
      serialNumbers: text("serial_numbers"),
      // JSON array of serial numbers
      status: invoiceItemStatusEnum("status").notNull().default("pending"),
      sortOrder: integer("sort_order").notNull().default(0),
      hsnSac: varchar("hsn_sac", { length: 10 }),
      // HSN/SAC code for GST compliance
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    invoiceAttachments = pgTable("invoice_attachments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      invoiceId: varchar("invoice_id").notNull().references(() => invoices.id),
      fileName: text("file_name").notNull(),
      fileType: text("file_type").notNull(),
      fileSize: integer("file_size").notNull(),
      content: text("content").notNull(),
      // Base64
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
      invoice: one(invoices, {
        fields: [invoiceItems.invoiceId],
        references: [invoices.id]
      })
    }));
    vendors = pgTable("vendors", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      email: text("email").notNull(),
      phone: text("phone"),
      contactPerson: text("contact_person"),
      paymentTerms: text("payment_terms"),
      notes: text("notes"),
      isActive: boolean("is_active").notNull().default(true),
      createdBy: varchar("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    vendorsRelations = relations(vendors, ({ one, many }) => ({
      creator: one(users, {
        fields: [vendors.createdBy],
        references: [users.id]
      }),
      purchaseOrders: many(vendorPurchaseOrders)
    }));
    vendorPurchaseOrders = pgTable("vendor_purchase_orders", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      poNumber: text("po_number").notNull().unique(),
      quoteId: varchar("quote_id").references(() => quotes.id),
      vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
      status: vendorPoStatusEnum("status").notNull().default("draft"),
      orderDate: timestamp("order_date").notNull().defaultNow(),
      expectedDeliveryDate: timestamp("expected_delivery_date"),
      actualDeliveryDate: timestamp("actual_delivery_date"),
      currency: text("currency").notNull().default("INR"),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
      discount: decimal("discount", { precision: 12, scale: 2 }).notNull().default("0"),
      cgst: decimal("cgst", { precision: 12, scale: 2 }).notNull().default("0"),
      sgst: decimal("sgst", { precision: 12, scale: 2 }).notNull().default("0"),
      igst: decimal("igst", { precision: 12, scale: 2 }).notNull().default("0"),
      shippingCharges: decimal("shipping_charges", { precision: 12, scale: 2 }).notNull().default("0"),
      total: decimal("total", { precision: 12, scale: 2 }).notNull().default("0"),
      notes: text("notes"),
      termsAndConditions: text("terms_and_conditions"),
      createdBy: varchar("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    vendorPurchaseOrdersRelations = relations(vendorPurchaseOrders, ({ one, many }) => ({
      quote: one(quotes, {
        fields: [vendorPurchaseOrders.quoteId],
        references: [quotes.id]
      }),
      vendor: one(vendors, {
        fields: [vendorPurchaseOrders.vendorId],
        references: [vendors.id]
      }),
      creator: one(users, {
        fields: [vendorPurchaseOrders.createdBy],
        references: [users.id]
      }),
      items: many(vendorPoItems)
    }));
    vendorPoItems = pgTable("vendor_po_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      vendorPoId: varchar("vendor_po_id").notNull().references(() => vendorPurchaseOrders.id, { onDelete: "cascade" }),
      productId: varchar("product_id").references(() => products.id),
      // Optional link to product catalog
      description: text("description").notNull(),
      quantity: integer("quantity").notNull().default(1),
      receivedQuantity: integer("received_quantity").notNull().default(0),
      unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
      serialNumbers: text("serial_numbers"),
      // JSON array of received serial numbers
      sortOrder: integer("sort_order").notNull().default(0),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    vendorPoItemsRelations = relations(vendorPoItems, ({ one, many }) => ({
      vendorPo: one(vendorPurchaseOrders, {
        fields: [vendorPoItems.vendorPoId],
        references: [vendorPurchaseOrders.id]
      }),
      grns: many(goodsReceivedNotes)
    }));
    products = pgTable("products", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      sku: text("sku").notNull().unique(),
      name: text("name").notNull(),
      description: text("description"),
      category: text("category"),
      unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
      stockQuantity: integer("stock_quantity").notNull().default(0),
      reservedQuantity: integer("reserved_quantity").notNull().default(0),
      availableQuantity: integer("available_quantity").notNull().default(0),
      reorderLevel: integer("reorder_level").notNull().default(0),
      requiresSerialNumber: boolean("requires_serial_number").notNull().default(false),
      warrantyMonths: integer("warranty_months").notNull().default(0),
      isActive: boolean("is_active").notNull().default(true),
      createdBy: varchar("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    productsRelations = relations(products, ({ one, many }) => ({
      creator: one(users, {
        fields: [products.createdBy],
        references: [users.id]
      }),
      serialNumbers: many(serialNumbers)
    }));
    goodsReceivedNotes = pgTable("goods_received_notes", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      grnNumber: text("grn_number").notNull().unique(),
      vendorPoId: varchar("vendor_po_id").notNull().references(() => vendorPurchaseOrders.id),
      vendorPoItemId: varchar("vendor_po_item_id").notNull().references(() => vendorPoItems.id),
      receivedDate: timestamp("received_date").notNull().defaultNow(),
      quantityOrdered: integer("quantity_ordered").notNull(),
      quantityReceived: integer("quantity_received").notNull(),
      quantityRejected: integer("quantity_rejected").notNull().default(0),
      inspectionStatus: text("inspection_status").notNull().default("pending"),
      // pending, approved, rejected, partial
      inspectedBy: varchar("inspected_by").references(() => users.id),
      inspectionNotes: text("inspection_notes"),
      deliveryNoteNumber: text("delivery_note_number"),
      batchNumber: text("batch_number"),
      attachments: text("attachments"),
      // JSON array of file URLs
      createdBy: varchar("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    goodsReceivedNotesRelations = relations(goodsReceivedNotes, ({ one, many }) => ({
      vendorPo: one(vendorPurchaseOrders, {
        fields: [goodsReceivedNotes.vendorPoId],
        references: [vendorPurchaseOrders.id]
      }),
      vendorPoItem: one(vendorPoItems, {
        fields: [goodsReceivedNotes.vendorPoItemId],
        references: [vendorPoItems.id]
      }),
      creator: one(users, {
        fields: [goodsReceivedNotes.createdBy],
        references: [users.id]
      }),
      inspector: one(users, {
        fields: [goodsReceivedNotes.inspectedBy],
        references: [users.id]
      }),
      serialNumbers: many(serialNumbers)
    }));
    serialNumbers = pgTable("serial_numbers", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      serialNumber: text("serial_number").notNull().unique(),
      productId: varchar("product_id").references(() => products.id),
      vendorId: varchar("vendor_id").references(() => vendors.id),
      vendorPoId: varchar("vendor_po_id").references(() => vendorPurchaseOrders.id),
      vendorPoItemId: varchar("vendor_po_item_id").references(() => vendorPoItems.id),
      grnId: varchar("grn_id").references(() => goodsReceivedNotes.id),
      invoiceId: varchar("invoice_id").references(() => invoices.id),
      invoiceItemId: varchar("invoice_item_id").references(() => invoiceItems.id),
      status: text("status").notNull().default("in_stock"),
      // in_stock, reserved, delivered, returned, defective
      warrantyStartDate: timestamp("warranty_start_date"),
      warrantyEndDate: timestamp("warranty_end_date"),
      location: text("location"),
      notes: text("notes"),
      createdBy: varchar("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    serialNumbersRelations = relations(serialNumbers, ({ one }) => ({
      product: one(products, {
        fields: [serialNumbers.productId],
        references: [products.id]
      }),
      vendor: one(vendors, {
        fields: [serialNumbers.vendorId],
        references: [vendors.id]
      }),
      vendorPo: one(vendorPurchaseOrders, {
        fields: [serialNumbers.vendorPoId],
        references: [vendorPurchaseOrders.id]
      }),
      vendorPoItem: one(vendorPoItems, {
        fields: [serialNumbers.vendorPoItemId],
        references: [vendorPoItems.id]
      }),
      grn: one(goodsReceivedNotes, {
        fields: [serialNumbers.grnId],
        references: [goodsReceivedNotes.id]
      }),
      invoice: one(invoices, {
        fields: [serialNumbers.invoiceId],
        references: [invoices.id]
      }),
      invoiceItem: one(invoiceItems, {
        fields: [serialNumbers.invoiceItemId],
        references: [invoiceItems.id]
      }),
      creator: one(users, {
        fields: [serialNumbers.createdBy],
        references: [users.id]
      })
    }));
    templates = pgTable("templates", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      content: text("content").notNull(),
      type: text("type").notNull(),
      // quote, invoice, email
      style: text("style").notNull().default("professional"),
      // professional, modern, minimal
      description: text("description"),
      headerImage: text("header_image"),
      // URL to header image
      logoUrl: text("logo_url"),
      colors: text("colors"),
      // JSON for color scheme
      isActive: boolean("is_active").notNull().default(true),
      isDefault: boolean("is_default").notNull().default(false),
      createdBy: varchar("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    templatesRelations = relations(templates, ({ one, many }) => ({
      creator: one(users, {
        fields: [templates.createdBy],
        references: [users.id]
      }),
      quotes: many(quotes)
    }));
    activityLogs = pgTable("activity_logs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      action: text("action").notNull(),
      entityType: text("entity_type").notNull(),
      entityId: varchar("entity_id"),
      metadata: jsonb("metadata"),
      timestamp: timestamp("timestamp").notNull().defaultNow()
    });
    activityLogsRelations = relations(activityLogs, ({ one }) => ({
      user: one(users, {
        fields: [activityLogs.userId],
        references: [users.id]
      })
    }));
    settings = pgTable("settings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      key: text("key").notNull().unique(),
      value: text("value").notNull(),
      updatedBy: varchar("updated_by").references(() => users.id),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    bankDetails = pgTable("bank_details", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      bankName: text("bank_name").notNull(),
      accountNumber: text("account_number").notNull(),
      accountName: text("account_name").notNull(),
      ifscCode: text("ifsc_code").notNull(),
      branch: text("branch"),
      swiftCode: text("swift_code"),
      isActive: boolean("is_active").notNull().default(true),
      updatedBy: varchar("updated_by").references(() => users.id),
      updatedAt: timestamp("updated_at").notNull().defaultNow(),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    clientTags = pgTable("client_tags", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      clientId: varchar("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
      tag: text("tag").notNull(),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    clientTagsRelations = relations(clientTags, ({ one }) => ({
      client: one(clients, {
        fields: [clientTags.clientId],
        references: [clients.id]
      })
    }));
    clientCommunications = pgTable("client_communications", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      clientId: varchar("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
      type: text("type").notNull(),
      // email, call, meeting, note
      subject: text("subject"),
      message: text("message"),
      date: timestamp("date").notNull().defaultNow(),
      communicatedBy: varchar("communicated_by").notNull().references(() => users.id),
      attachments: text("attachments")
      // JSON array of attachment URLs
    });
    clientCommunicationsRelations = relations(clientCommunications, ({ one }) => ({
      client: one(clients, {
        fields: [clientCommunications.clientId],
        references: [clients.id]
      }),
      user: one(users, {
        fields: [clientCommunications.communicatedBy],
        references: [users.id]
      })
    }));
    taxRates = pgTable("tax_rates", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      region: text("region").notNull(),
      // IN-AP, IN-KA, IN-MH, etc.
      taxType: text("tax_type").notNull(),
      // GST, VAT, SAT, etc.
      sgstRate: decimal("sgst_rate", { precision: 5, scale: 2 }).notNull().default("0"),
      // State GST
      cgstRate: decimal("cgst_rate", { precision: 5, scale: 2 }).notNull().default("0"),
      // Central GST
      igstRate: decimal("igst_rate", { precision: 5, scale: 2 }).notNull().default("0"),
      // Integrated GST
      effectiveFrom: timestamp("effective_from").notNull().defaultNow(),
      effectiveTo: timestamp("effective_to"),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    paymentTerms = pgTable("payment_terms", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      // Net 30, Due on Receipt, etc.
      days: integer("days").notNull().default(0),
      description: text("description"),
      isDefault: boolean("is_default").notNull().default(false),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow(),
      createdBy: varchar("created_by").references(() => users.id)
    });
    pricingTiers = pgTable("pricing_tiers", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      // Standard, Premium, Enterprise
      minAmount: decimal("min_amount", { precision: 12, scale: 2 }).notNull(),
      maxAmount: decimal("max_amount", { precision: 12, scale: 2 }),
      discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).notNull().default("0"),
      description: text("description"),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    currencySettings = pgTable("currency_settings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      baseCurrency: text("base_currency").notNull().default("INR"),
      // Default currency
      supportedCurrencies: text("supported_currencies").notNull(),
      // JSON array
      exchangeRates: text("exchange_rates"),
      // JSON object of rates
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    emailTemplateTypeEnum = pgEnum("email_template_type", [
      "quote",
      "invoice",
      "sales_order",
      "payment_reminder",
      "password_reset",
      "welcome"
    ]);
    emailTemplates = pgTable("email_templates", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      // e.g., "Quote Email", "Invoice Reminder"
      type: emailTemplateTypeEnum("type").notNull(),
      // quote, invoice, sales_order, etc.
      subject: text("subject").notNull(),
      // Email subject with {{variables}}
      body: text("body").notNull(),
      // HTML body with {{variables}}
      availableVariables: text("available_variables").notNull(),
      // JSON array of allowed variables
      isActive: boolean("is_active").notNull().default(true),
      isDefault: boolean("is_default").notNull().default(false),
      createdBy: varchar("created_by").references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    emailTemplatesRelations = relations(emailTemplates, ({ one }) => ({
      creator: one(users, {
        fields: [emailTemplates.createdBy],
        references: [users.id]
      })
    }));
    insertUserSchema = createInsertSchema(users).pick({
      email: true,
      backupEmail: true,
      passwordHash: true,
      name: true,
      role: true,
      status: true,
      refreshToken: true,
      refreshTokenExpiry: true
    }).extend({
      password: z.string().min(8).regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain uppercase, lowercase, number, and special character"
      )
    });
    insertClientSchema = createInsertSchema(clients).omit({
      id: true,
      createdAt: true,
      createdBy: true
    }).extend({
      email: z.string().email("Invalid email format"),
      segment: z.string().optional(),
      preferredTheme: z.string().optional()
    });
    insertQuoteSchema = createInsertSchema(quotes).omit({
      id: true,
      quoteNumber: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      approvalStatus: true,
      approvalRequiredBy: true
    });
    insertApprovalRuleSchema = createInsertSchema(approvalRules).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true
    });
    insertQuoteItemSchema = createInsertSchema(quoteItems).omit({
      id: true
    });
    insertInvoiceSchema = createInsertSchema(invoices).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPaymentHistorySchema = createInsertSchema(paymentHistory).omit({
      id: true,
      createdAt: true
    });
    insertTemplateSchema = createInsertSchema(templates).omit({
      id: true,
      createdAt: true,
      createdBy: true
    });
    insertActivityLogSchema = createInsertSchema(activityLogs).omit({
      id: true,
      timestamp: true
    });
    insertSettingSchema = createInsertSchema(settings).omit({
      id: true,
      updatedAt: true
    });
    insertBankDetailsSchema = createInsertSchema(bankDetails).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertClientTagSchema = createInsertSchema(clientTags).omit({
      id: true,
      createdAt: true
    });
    insertClientCommunicationSchema = createInsertSchema(clientCommunications).omit({
      id: true
    });
    insertTaxRateSchema = createInsertSchema(taxRates).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPricingTierSchema = createInsertSchema(pricingTiers).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertCurrencySettingSchema = createInsertSchema(currencySettings).omit({
      id: true,
      updatedAt: true
    });
    insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertVendorSchema = createInsertSchema(vendors).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true
    });
    insertVendorPurchaseOrderSchema = createInsertSchema(vendorPurchaseOrders).omit({
      id: true,
      poNumber: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true
    });
    insertVendorPoItemSchema = createInsertSchema(vendorPoItems).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertProductSchema = createInsertSchema(products).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true
    });
    insertGrnSchema = createInsertSchema(goodsReceivedNotes).omit({
      id: true,
      grnNumber: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true
    });
    insertSerialNumberSchema = createInsertSchema(serialNumbers).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true
    });
    insertQuoteVersionSchema = createInsertSchema(quoteVersions).omit({
      id: true,
      createdAt: true
    });
    insertSalesOrderSchema = createInsertSchema(salesOrders).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertSalesOrderItemSchema = createInsertSchema(salesOrderItems).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    notificationTypeEnum = pgEnum("notification_type", [
      "quote_status_change",
      "approval_request",
      "approval_decision",
      "payment_received",
      "payment_overdue",
      "collaboration_joined",
      "collaboration_edit",
      "system_announcement"
    ]);
    notifications = pgTable("notifications", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      type: notificationTypeEnum("type").notNull(),
      title: text("title").notNull(),
      message: text("message").notNull(),
      entityType: text("entity_type"),
      // quote, invoice, payment, sales_order, etc.
      entityId: varchar("entity_id"),
      isRead: boolean("is_read").notNull().default(false),
      readAt: timestamp("read_at"),
      metadata: jsonb("metadata"),
      // Additional context data (e.g., old/new status, amount, etc.)
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => ({
      userIdx: index("idx_notifications_user_id").on(table.userId),
      userUnreadIdx: index("idx_notifications_user_unread").on(table.userId, table.isRead)
    }));
    notificationsRelations = relations(notifications, ({ one }) => ({
      user: one(users, {
        fields: [notifications.userId],
        references: [users.id]
      })
    }));
    collaborationSessions = pgTable("collaboration_sessions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      entityType: text("entity_type").notNull(),
      // quote, sales_order, invoice
      entityId: varchar("entity_id").notNull(),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      socketId: text("socket_id").notNull(),
      cursorPosition: jsonb("cursor_position"),
      // { field: string, line: number }
      isEditing: boolean("is_editing").notNull().default(false),
      lastActivity: timestamp("last_activity").notNull().defaultNow(),
      joinedAt: timestamp("joined_at").notNull().defaultNow()
    }, (table) => ({
      entityIdx: index("idx_collab_sessions_entity").on(table.entityType, table.entityId),
      userSocketIdx: index("idx_collab_sessions_socket").on(table.socketId)
    }));
    collaborationSessionsRelations = relations(collaborationSessions, ({ one }) => ({
      user: one(users, {
        fields: [collaborationSessions.userId],
        references: [users.id]
      })
    }));
    insertNotificationSchema = createInsertSchema(notifications).omit({
      id: true,
      createdAt: true,
      isRead: true,
      readAt: true
    });
    insertCollaborationSessionSchema = createInsertSchema(collaborationSessions).omit({
      id: true,
      joinedAt: true,
      lastActivity: true
    });
    creditNotes = pgTable("credit_notes", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      creditNoteNumber: text("credit_note_number").notNull().unique(),
      invoiceId: varchar("invoice_id").references(() => invoices.id),
      // Optional - can be standalone
      clientId: varchar("client_id").notNull().references(() => clients.id),
      status: creditNoteStatusEnum("status").notNull().default("draft"),
      issueDate: timestamp("issue_date").notNull().defaultNow(),
      reason: text("reason").notNull(),
      // Return, Damaged goods, Price adjustment, etc.
      currency: text("currency").notNull().default("INR"),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
      cgst: decimal("cgst", { precision: 12, scale: 2 }).default("0"),
      sgst: decimal("sgst", { precision: 12, scale: 2 }).default("0"),
      igst: decimal("igst", { precision: 12, scale: 2 }).default("0"),
      total: decimal("total", { precision: 12, scale: 2 }).notNull().default("0"),
      appliedAmount: decimal("applied_amount", { precision: 12, scale: 2 }).default("0"),
      notes: text("notes"),
      createdBy: varchar("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => ({
      invoiceIdx: index("idx_credit_notes_invoice_id").on(table.invoiceId),
      clientIdx: index("idx_credit_notes_client_id").on(table.clientId),
      statusIdx: index("idx_credit_notes_status").on(table.status)
    }));
    creditNoteItems = pgTable("credit_note_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      creditNoteId: varchar("credit_note_id").notNull().references(() => creditNotes.id, { onDelete: "cascade" }),
      productId: varchar("product_id").references(() => products.id),
      description: text("description").notNull(),
      quantity: integer("quantity").notNull().default(1),
      unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
      hsnSac: varchar("hsn_sac", { length: 10 }),
      sortOrder: integer("sort_order").notNull().default(0),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    creditNotesRelations = relations(creditNotes, ({ one, many }) => ({
      invoice: one(invoices, {
        fields: [creditNotes.invoiceId],
        references: [invoices.id]
      }),
      client: one(clients, {
        fields: [creditNotes.clientId],
        references: [clients.id]
      }),
      creator: one(users, {
        fields: [creditNotes.createdBy],
        references: [users.id]
      }),
      items: many(creditNoteItems)
    }));
    creditNoteItemsRelations = relations(creditNoteItems, ({ one }) => ({
      creditNote: one(creditNotes, {
        fields: [creditNoteItems.creditNoteId],
        references: [creditNotes.id]
      }),
      product: one(products, {
        fields: [creditNoteItems.productId],
        references: [products.id]
      })
    }));
    debitNotes = pgTable("debit_notes", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      debitNoteNumber: text("debit_note_number").notNull().unique(),
      invoiceId: varchar("invoice_id").references(() => invoices.id),
      // Optional - can be standalone
      clientId: varchar("client_id").notNull().references(() => clients.id),
      status: debitNoteStatusEnum("status").notNull().default("draft"),
      issueDate: timestamp("issue_date").notNull().defaultNow(),
      reason: text("reason").notNull(),
      // Additional charges, Price revision, etc.
      currency: text("currency").notNull().default("INR"),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
      cgst: decimal("cgst", { precision: 12, scale: 2 }).default("0"),
      sgst: decimal("sgst", { precision: 12, scale: 2 }).default("0"),
      igst: decimal("igst", { precision: 12, scale: 2 }).default("0"),
      total: decimal("total", { precision: 12, scale: 2 }).notNull().default("0"),
      appliedAmount: decimal("applied_amount", { precision: 12, scale: 2 }).default("0"),
      notes: text("notes"),
      createdBy: varchar("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => ({
      invoiceIdx: index("idx_debit_notes_invoice_id").on(table.invoiceId),
      clientIdx: index("idx_debit_notes_client_id").on(table.clientId),
      statusIdx: index("idx_debit_notes_status").on(table.status)
    }));
    debitNoteItems = pgTable("debit_note_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      debitNoteId: varchar("debit_note_id").notNull().references(() => debitNotes.id, { onDelete: "cascade" }),
      productId: varchar("product_id").references(() => products.id),
      description: text("description").notNull(),
      quantity: integer("quantity").notNull().default(1),
      unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
      hsnSac: varchar("hsn_sac", { length: 10 }),
      sortOrder: integer("sort_order").notNull().default(0),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    debitNotesRelations = relations(debitNotes, ({ one, many }) => ({
      invoice: one(invoices, {
        fields: [debitNotes.invoiceId],
        references: [invoices.id]
      }),
      client: one(clients, {
        fields: [debitNotes.clientId],
        references: [clients.id]
      }),
      creator: one(users, {
        fields: [debitNotes.createdBy],
        references: [users.id]
      }),
      items: many(debitNoteItems)
    }));
    debitNoteItemsRelations = relations(debitNoteItems, ({ one }) => ({
      debitNote: one(debitNotes, {
        fields: [debitNoteItems.debitNoteId],
        references: [debitNotes.id]
      }),
      product: one(products, {
        fields: [debitNoteItems.productId],
        references: [products.id]
      })
    }));
    insertCreditNoteSchema = createInsertSchema(creditNotes).omit({
      id: true,
      creditNoteNumber: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      appliedAmount: true
    });
    insertCreditNoteItemSchema = createInsertSchema(creditNoteItems).omit({
      id: true,
      createdAt: true
    });
    insertDebitNoteSchema = createInsertSchema(debitNotes).omit({
      id: true,
      debitNoteNumber: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      appliedAmount: true
    });
    insertDebitNoteItemSchema = createInsertSchema(debitNoteItems).omit({
      id: true,
      createdAt: true
    });
    insertInvoiceAttachmentSchema = createInsertSchema(invoiceAttachments).omit({
      id: true,
      createdAt: true
    });
    insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true
    });
    workflowStatusEnum = pgEnum("workflow_status", ["active", "inactive", "draft"]);
    workflowTriggerTypeEnum = pgEnum("workflow_trigger_type", [
      "status_change",
      "amount_threshold",
      "date_based",
      "field_change",
      "time_based",
      "manual",
      "created"
    ]);
    workflowActionTypeEnum = pgEnum("workflow_action_type", [
      "send_email",
      "create_notification",
      "update_field",
      "assign_user",
      "create_task",
      "escalate",
      "webhook",
      "create_activity_log"
    ]);
    workflows = pgTable("workflows", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      description: text("description"),
      entityType: text("entity_type").notNull(),
      // quote, invoice, sales_order, payment, client, vendor, etc.
      status: workflowStatusEnum("status").notNull().default("draft"),
      priority: integer("priority").notNull().default(0),
      // Higher number = higher priority
      triggerLogic: text("trigger_logic").default("AND"),
      // AND, OR for multiple triggers
      isSystem: boolean("is_system").notNull().default(false),
      // System workflows vs user-created
      createdBy: varchar("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => ({
      entityTypeIdx: index("idx_workflows_entity_type").on(table.entityType),
      statusIdx: index("idx_workflows_status").on(table.status)
    }));
    workflowsRelations = relations(workflows, ({ one, many }) => ({
      creator: one(users, {
        fields: [workflows.createdBy],
        references: [users.id]
      }),
      triggers: many(workflowTriggers),
      actions: many(workflowActions),
      executions: many(workflowExecutions)
    }));
    workflowTriggers = pgTable("workflow_triggers", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      workflowId: varchar("workflow_id").notNull().references(() => workflows.id, { onDelete: "cascade" }),
      triggerType: workflowTriggerTypeEnum("trigger_type").notNull(),
      // Condition Configuration (JSON)
      // Examples:
      // status_change: { field: "status", from: "draft", to: "approved" }
      // amount_threshold: { field: "total", operator: "greater_than", value: 10000 }
      // date_based: { field: "dueDate", operator: "days_before", value: 7 }
      // field_change: { field: "discount", operator: "greater_than", value: 20 }
      // time_based: { schedule: "0 9 * * *", timezone: "Asia/Kolkata" } // cron expression
      conditions: jsonb("conditions").notNull(),
      // For complex conditions
      conditionLogic: text("condition_logic"),
      // Custom logic expression for advanced conditions
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => ({
      workflowIdx: index("idx_workflow_triggers_workflow_id").on(table.workflowId),
      triggerTypeIdx: index("idx_workflow_triggers_type").on(table.triggerType)
    }));
    workflowTriggersRelations = relations(workflowTriggers, ({ one }) => ({
      workflow: one(workflows, {
        fields: [workflowTriggers.workflowId],
        references: [workflows.id]
      })
    }));
    workflowActions = pgTable("workflow_actions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      workflowId: varchar("workflow_id").notNull().references(() => workflows.id, { onDelete: "cascade" }),
      actionType: workflowActionTypeEnum("action_type").notNull(),
      // Action Configuration (JSON)
      // Examples:
      // send_email: { template: "payment_reminder", to: "{{client.email}}", cc: "{{user.email}}" }
      // create_notification: { title: "Approval Required", message: "Quote {{quoteNumber}} needs approval", userId: "{{managerId}}" }
      // update_field: { field: "status", value: "pending_approval" }
      // assign_user: { field: "assignedTo", userId: "{{managerId}}" }
      // create_task: { title: "Follow up on quote", dueDate: "{{quote.validUntil}}", assignTo: "{{quote.createdBy}}" }
      // escalate: { to: "admin", message: "Quote overdue for {{days}} days" }
      // webhook: { url: "https://api.example.com/webhook", method: "POST", headers: {...}, body: {...} }
      actionConfig: jsonb("action_config").notNull(),
      // Execution order (lower number executes first)
      executionOrder: integer("execution_order").notNull().default(0),
      // Optional delay before execution (in minutes)
      delayMinutes: integer("delay_minutes").default(0),
      // Conditional execution (if-then logic)
      conditionExpression: text("condition_expression"),
      // e.g., "{{quote.total}} > 50000"
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => ({
      workflowIdx: index("idx_workflow_actions_workflow_id").on(table.workflowId),
      executionOrderIdx: index("idx_workflow_actions_execution_order").on(table.executionOrder)
    }));
    workflowActionsRelations = relations(workflowActions, ({ one }) => ({
      workflow: one(workflows, {
        fields: [workflowActions.workflowId],
        references: [workflows.id]
      })
    }));
    workflowExecutions = pgTable("workflow_executions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      workflowId: varchar("workflow_id").notNull().references(() => workflows.id),
      entityType: text("entity_type").notNull(),
      entityId: varchar("entity_id").notNull(),
      // Execution status
      status: text("status").notNull(),
      // pending, running, completed, failed, partially_completed
      // Who/what triggered this execution
      triggeredBy: text("triggered_by").notNull(),
      // system, user:{userId}, schedule, manual
      triggeredAt: timestamp("triggered_at").notNull().defaultNow(),
      completedAt: timestamp("completed_at"),
      // Execution details
      executionLog: jsonb("execution_log"),
      // Detailed log of each action execution
      // Example: [
      //   { step: 1, action: "send_email", status: "success", timestamp: "...", details: "..." },
      //   { step: 2, action: "create_notification", status: "success", timestamp: "...", details: "..." }
      // ]
      errorMessage: text("error_message"),
      errorStack: text("error_stack"),
      // Performance tracking
      executionTimeMs: integer("execution_time_ms")
    }, (table) => ({
      workflowIdx: index("idx_workflow_executions_workflow_id").on(table.workflowId),
      entityIdx: index("idx_workflow_executions_entity").on(table.entityType, table.entityId),
      statusIdx: index("idx_workflow_executions_status").on(table.status),
      triggeredAtIdx: index("idx_workflow_executions_triggered_at").on(table.triggeredAt)
    }));
    workflowExecutionsRelations = relations(workflowExecutions, ({ one }) => ({
      workflow: one(workflows, {
        fields: [workflowExecutions.workflowId],
        references: [workflows.id]
      })
    }));
    workflowSchedules = pgTable("workflow_schedules", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      workflowId: varchar("workflow_id").notNull().references(() => workflows.id, { onDelete: "cascade" }),
      cronExpression: text("cron_expression").notNull(),
      // e.g., "0 9 * * *" for daily at 9 AM
      timezone: text("timezone").notNull().default("UTC"),
      isActive: boolean("is_active").notNull().default(true),
      lastRunAt: timestamp("last_run_at"),
      nextRunAt: timestamp("next_run_at"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => ({
      workflowIdx: index("idx_workflow_schedules_workflow_id").on(table.workflowId),
      nextRunIdx: index("idx_workflow_schedules_next_run").on(table.nextRunAt)
    }));
    workflowSchedulesRelations = relations(workflowSchedules, ({ one }) => ({
      workflow: one(workflows, {
        fields: [workflowSchedules.workflowId],
        references: [workflows.id]
      })
    }));
    insertWorkflowSchema = createInsertSchema(workflows).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true
    });
    insertWorkflowTriggerSchema = createInsertSchema(workflowTriggers).omit({
      id: true,
      createdAt: true
    });
    insertWorkflowActionSchema = createInsertSchema(workflowActions).omit({
      id: true,
      createdAt: true
    });
    insertWorkflowExecutionSchema = createInsertSchema(workflowExecutions).omit({
      id: true
    });
    insertWorkflowScheduleSchema = createInsertSchema(workflowSchedules).omit({
      id: true,
      createdAt: true
    });
    insertUserDeviceSchema = createInsertSchema(userDevices).omit({
      id: true,
      createdAt: true
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
var connectionString, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
      import("ws").then((ws) => {
        neonConfig.webSocketConstructor = ws.default;
      }).catch(() => {
        console.warn("ws not available, using native WebSocket");
      });
    }
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    connectionString = process.env.DATABASE_URL.includes("?") ? process.env.DATABASE_URL : `${process.env.DATABASE_URL}?sslmode=require`;
    pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 1e4
    });
    db = drizzle(pool, { schema: schema_exports });
  }
});

// server/utils/logger.ts
var isDev, logger;
var init_logger = __esm({
  "server/utils/logger.ts"() {
    "use strict";
    isDev = process.env.NODE_ENV !== "production";
    logger = {
      /**
       * Debug level log - only in development
       */
      debug: (...args) => {
        if (isDev) {
          console.log("[DEBUG]", ...args);
        }
      },
      /**
       * Info level log - only in development
       */
      info: (...args) => {
        if (isDev) {
          console.log("[INFO]", ...args);
        }
      },
      /**
       * Warning level log - always
       */
      warn: (...args) => {
        console.warn("[WARN]", ...args);
      },
      /**
       * Error level log - always
       */
      error: (...args) => {
        console.error("[ERROR]", ...args);
      },
      /**
       * Stock operation logs - only in development
       */
      stock: (message) => {
        if (isDev) {
          console.log(message);
        }
      }
    };
  }
});

// server/services/cache.service.ts
import { createClient } from "redis";
import { LRUCache } from "lru-cache";
var CacheService, cacheService;
var init_cache_service = __esm({
  "server/services/cache.service.ts"() {
    "use strict";
    init_logger();
    CacheService = class {
      redisClient = null;
      memoryCache;
      useRedis = false;
      isConnected = false;
      constructor() {
        this.memoryCache = new LRUCache({
          max: 500,
          // Maximum number of items
          ttl: 1e3 * 60 * 60
          // 1 hour default TTL
        });
        if (process.env.REDIS_URL) {
          this.initRedis();
        } else {
          logger.info("Local: Cache service initialized with in-memory storage (No REDIS_URL provided)");
        }
      }
      async initRedis() {
        try {
          this.redisClient = createClient({
            url: process.env.REDIS_URL
          });
          this.redisClient.on("error", (err) => {
            logger.error("Redis Client Error", err);
            this.useRedis = false;
            this.isConnected = false;
          });
          this.redisClient.on("connect", () => {
            logger.info("Redis: Connected to Redis server");
            this.useRedis = true;
            this.isConnected = true;
          });
          this.redisClient.on("reconnecting", () => {
            logger.info("Redis: Reconnecting...");
            this.useRedis = false;
            this.isConnected = false;
          });
          await this.redisClient.connect();
        } catch (error) {
          logger.error("Failed to connect to Redis, falling back to memory cache:", error);
          this.useRedis = false;
          this.isConnected = false;
        }
      }
      /**
       * Get a value from the cache
       * @param key Cache key
       */
      async get(key) {
        try {
          if (this.useRedis && this.isConnected && this.redisClient) {
            const value = await this.redisClient.get(key);
            if (value) {
              return JSON.parse(value);
            }
            return null;
          } else {
            return this.memoryCache.get(key) || null;
          }
        } catch (error) {
          logger.error(`Cache get error for key ${key}:`, error);
          return null;
        }
      }
      /**
       * Set a value in the cache
       * @param key Cache key
       * @param value Value to store
       * @param ttlSeconds Time to live in seconds
       */
      async set(key, value, ttlSeconds = 3600) {
        try {
          if (this.useRedis && this.isConnected && this.redisClient) {
            await this.redisClient.set(key, JSON.stringify(value), {
              EX: ttlSeconds
            });
          } else {
            this.memoryCache.set(key, value, { ttl: ttlSeconds * 1e3 });
          }
        } catch (error) {
          logger.error(`Cache set error for key ${key}:`, error);
        }
      }
      /**
       * Delete a value from the cache
       * @param key Cache key
       */
      async del(key) {
        try {
          if (this.useRedis && this.isConnected && this.redisClient) {
            await this.redisClient.del(key);
          } else {
            this.memoryCache.delete(key);
          }
        } catch (error) {
          logger.error(`Cache delete error for key ${key}:`, error);
        }
      }
      /**
       * Flush all keys from the cache
       */
      async flush() {
        try {
          if (this.useRedis && this.isConnected && this.redisClient) {
            await this.redisClient.flushAll();
          } else {
            this.memoryCache.clear();
          }
        } catch (error) {
          logger.error("Cache flush error:", error);
        }
      }
    };
    cacheService = new CacheService();
  }
});

// server/storage.ts
import { eq, desc, and, sql as sql2 } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_cache_service();
    DatabaseStorage = class {
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user || void 0;
      }
      async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user || void 0;
      }
      async getUserByRefreshToken(token) {
        const [user] = await db.select().from(users).where(eq(users.refreshToken, token));
        return user || void 0;
      }
      async getUserByResetToken(token) {
        const [user] = await db.select().from(users).where(eq(users.resetToken, token));
        return user || void 0;
      }
      async createUser(user) {
        const [newUser] = await db.insert(users).values(user).returning();
        return newUser;
      }
      async updateUser(id, data) {
        const [updated] = await db.update(users).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
        if (updated) {
          await cacheService.del(`user:${id}`);
        }
        return updated || void 0;
      }
      async updateUserWithTokenCheck(id, token, data) {
        const [updated] = await db.update(users).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(users.id, id), eq(users.resetToken, token))).returning();
        if (updated) {
          await cacheService.del(`user:${id}`);
        }
        return updated || void 0;
      }
      async deleteUser(id) {
        await db.update(users).set({
          status: "inactive",
          refreshToken: null,
          refreshTokenExpiry: null,
          resetToken: null,
          resetTokenExpiry: null,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, id));
        console.log(`[Storage] User ${id} soft-deleted (set to inactive).`);
        await cacheService.del(`user:${id}`);
      }
      async getAllUsers() {
        return await db.select().from(users).orderBy(desc(users.createdAt));
      }
      async getUsersByRole(role) {
        return await db.select().from(users).where(eq(users.role, role));
      }
      // Clients
      async getClient(id) {
        const [client] = await db.select().from(clients).where(eq(clients.id, id));
        return client || void 0;
      }
      async getClientsByCreator(createdBy) {
        return await db.select().from(clients).where(eq(clients.createdBy, createdBy));
      }
      async getAllClients() {
        return await db.select().from(clients).orderBy(desc(clients.createdAt));
      }
      async createClient(client) {
        const [newClient] = await db.insert(clients).values(client).returning();
        return newClient;
      }
      async updateClient(id, data) {
        const [updated] = await db.update(clients).set(data).where(eq(clients.id, id)).returning();
        return updated || void 0;
      }
      async deleteClient(id) {
        await db.update(clients).set({
          isActive: false
        }).where(eq(clients.id, id));
        console.log(`[Storage] Client ${id} soft-deleted (set to inactive).`);
      }
      // Quotes
      async getQuote(id) {
        const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
        return quote || void 0;
      }
      async getQuoteByToken(token) {
        const [quote] = await db.select().from(quotes).where(eq(quotes.publicToken, token));
        return quote || void 0;
      }
      async getQuotesByCreator(createdBy) {
        return await db.select().from(quotes).where(eq(quotes.createdBy, createdBy)).orderBy(desc(quotes.createdAt));
      }
      async getAllQuotes() {
        return await db.select().from(quotes).orderBy(desc(quotes.createdAt));
      }
      async createQuote(quote) {
        const [newQuote] = await db.insert(quotes).values(quote).returning();
        return newQuote;
      }
      async updateQuote(id, data) {
        const [updated] = await db.update(quotes).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(quotes.id, id)).returning();
        return updated || void 0;
      }
      async deleteQuote(id) {
        await db.delete(quotes).where(eq(quotes.id, id));
      }
      async createQuoteTransaction(quote, items) {
        return await db.transaction(async (tx) => {
          const [newQuote] = await tx.insert(quotes).values(quote).returning();
          for (const item of items) {
            await tx.insert(quoteItems).values({ ...item, quoteId: newQuote.id });
          }
          return newQuote;
        });
      }
      async updateQuoteTransaction(id, data, items) {
        return await db.transaction(async (tx) => {
          const [updated] = await tx.update(quotes).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(quotes.id, id)).returning();
          if (!updated) return void 0;
          await tx.delete(quoteItems).where(eq(quoteItems.quoteId, id));
          for (const item of items) {
            await tx.insert(quoteItems).values({ ...item, quoteId: id });
          }
          return updated;
        });
      }
      async getLastQuoteNumber() {
        const [lastQuote] = await db.select().from(quotes).orderBy(desc(quotes.createdAt)).limit(1);
        return lastQuote?.quoteNumber;
      }
      // Quote Items
      async getQuoteItems(quoteId) {
        return await db.select().from(quoteItems).where(eq(quoteItems.quoteId, quoteId)).orderBy(quoteItems.sortOrder);
      }
      async createQuoteItem(item) {
        const [newItem] = await db.insert(quoteItems).values(item).returning();
        return newItem;
      }
      async deleteQuoteItems(quoteId) {
        await db.delete(quoteItems).where(eq(quoteItems.quoteId, quoteId));
      }
      // Invoices
      async getInvoice(id) {
        const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
        return invoice || void 0;
      }
      async getInvoiceByQuote(quoteId) {
        const [invoice] = await db.select().from(invoices).where(eq(invoices.quoteId, quoteId));
        return invoice || void 0;
      }
      async getAllInvoices() {
        return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
      }
      async createInvoice(invoice) {
        const [newInvoice] = await db.insert(invoices).values(invoice).returning();
        return newInvoice;
      }
      async updateInvoice(id, data) {
        const [updated] = await db.update(invoices).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(invoices.id, id)).returning();
        return updated || void 0;
      }
      async getLastInvoiceNumber() {
        const [lastInvoice] = await db.select().from(invoices).orderBy(desc(invoices.createdAt)).limit(1);
        return lastInvoice?.invoiceNumber;
      }
      // Payment History
      async getPaymentHistory(invoiceId) {
        return await db.select().from(paymentHistory).where(eq(paymentHistory.invoiceId, invoiceId)).orderBy(desc(paymentHistory.paymentDate));
      }
      async getPaymentById(id) {
        const [payment] = await db.select().from(paymentHistory).where(eq(paymentHistory.id, id));
        return payment || void 0;
      }
      async createPaymentHistory(payment) {
        const [newPayment] = await db.insert(paymentHistory).values(payment).returning();
        return newPayment;
      }
      async deletePaymentHistory(id) {
        await db.delete(paymentHistory).where(eq(paymentHistory.id, id));
      }
      // Templates
      async getTemplate(id) {
        const [template] = await db.select().from(templates).where(eq(templates.id, id));
        return template || void 0;
      }
      async getAllTemplates() {
        return await db.select().from(templates).where(eq(templates.isActive, true));
      }
      async getTemplatesByType(type) {
        return await db.select().from(templates).where(and(eq(templates.type, type), eq(templates.isActive, true)));
      }
      async getTemplatesByStyle(style) {
        return await db.select().from(templates).where(and(eq(templates.style, style), eq(templates.isActive, true)));
      }
      async getDefaultTemplate(type) {
        const [template] = await db.select().from(templates).where(and(eq(templates.type, type), eq(templates.isDefault, true)));
        return template || void 0;
      }
      async createTemplate(template) {
        const [newTemplate] = await db.insert(templates).values(template).returning();
        return newTemplate;
      }
      async updateTemplate(id, data) {
        const [updated] = await db.update(templates).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(templates.id, id)).returning();
        return updated || void 0;
      }
      async deleteTemplate(id) {
        const [existingQuote] = await db.select().from(quotes).where(eq(quotes.templateId, id)).limit(1);
        if (existingQuote) {
          throw new Error("Cannot delete template: it is referenced by existing quotes.");
        }
        await db.delete(templates).where(eq(templates.id, id));
      }
      // Activity Logs
      async createActivityLog(log) {
        const [newLog] = await db.insert(activityLogs).values(log).returning();
        return newLog;
      }
      async getActivityLogs(userId, limit = 50) {
        return await db.select().from(activityLogs).where(eq(activityLogs.userId, userId)).orderBy(desc(activityLogs.timestamp)).limit(limit);
      }
      // Settings
      async getSetting(key) {
        const [setting] = await db.select().from(settings).where(eq(settings.key, key));
        return setting || void 0;
      }
      async getAllSettings() {
        return await db.select().from(settings);
      }
      async upsertSetting(setting) {
        const existing = await this.getSetting(setting.key);
        if (existing) {
          const [updated] = await db.update(settings).set({ ...setting, updatedAt: /* @__PURE__ */ new Date() }).where(eq(settings.key, setting.key)).returning();
          return updated;
        } else {
          const [newSetting] = await db.insert(settings).values(setting).returning();
          return newSetting;
        }
      }
      async deleteSetting(key) {
        await db.delete(settings).where(eq(settings.key, key));
      }
      // Bank Details
      async getBankDetails(id) {
        const [detail] = await db.select().from(bankDetails).where(eq(bankDetails.id, id));
        return detail || void 0;
      }
      async getAllBankDetails() {
        return await db.select().from(bankDetails).orderBy(desc(bankDetails.createdAt));
      }
      async getActiveBankDetails() {
        const [detail] = await db.select().from(bankDetails).where(eq(bankDetails.isActive, true)).orderBy(desc(bankDetails.updatedAt)).limit(1);
        return detail || void 0;
      }
      async createBankDetails(details) {
        const [newDetail] = await db.insert(bankDetails).values(details).returning();
        return newDetail;
      }
      async updateBankDetails(id, data, updatedBy) {
        const [updated] = await db.update(bankDetails).set({ ...data, updatedAt: /* @__PURE__ */ new Date(), updatedBy: updatedBy || data.updatedBy }).where(eq(bankDetails.id, id)).returning();
        return updated;
      }
      async deleteBankDetails(id) {
        await db.delete(bankDetails).where(eq(bankDetails.id, id));
      }
      // PHASE 3 - Client Tags
      async getClientTags(clientId) {
        return await db.select().from(clientTags).where(eq(clientTags.clientId, clientId));
      }
      async addClientTag(tag) {
        const [newTag] = await db.insert(clientTags).values(tag).returning();
        return newTag;
      }
      async removeClientTag(tagId) {
        await db.delete(clientTags).where(eq(clientTags.id, tagId));
      }
      // PHASE 3 - Client Communications
      async getClientCommunications(clientId) {
        return await db.select().from(clientCommunications).where(eq(clientCommunications.clientId, clientId)).orderBy(desc(clientCommunications.date));
      }
      async createClientCommunication(communication) {
        const [newComm] = await db.insert(clientCommunications).values(communication).returning();
        return newComm;
      }
      async deleteClientCommunication(id) {
        await db.delete(clientCommunications).where(eq(clientCommunications.id, id));
      }
      // PHASE 3 - Tax Rates
      async getTaxRate(id) {
        const [rate] = await db.select().from(taxRates).where(eq(taxRates.id, id));
        return rate || void 0;
      }
      async getTaxRateByRegion(region) {
        const [rate] = await db.select().from(taxRates).where(and(eq(taxRates.region, region), eq(taxRates.isActive, true))).orderBy(desc(taxRates.effectiveFrom)).limit(1);
        return rate || void 0;
      }
      async getAllTaxRates() {
        return await db.select().from(taxRates).orderBy(desc(taxRates.effectiveFrom));
      }
      async getActiveTaxRates() {
        return await db.select().from(taxRates).where(eq(taxRates.isActive, true)).orderBy(desc(taxRates.effectiveFrom));
      }
      async createTaxRate(rate) {
        const [newRate] = await db.insert(taxRates).values(rate).returning();
        return newRate;
      }
      async updateTaxRate(id, data) {
        const [updated] = await db.update(taxRates).set(data).where(eq(taxRates.id, id)).returning();
        return updated || void 0;
      }
      async deleteTaxRate(id) {
        await db.delete(taxRates).where(eq(taxRates.id, id));
      }
      // PHASE 3 - Pricing Tiers
      async getPricingTier(id) {
        const [tier] = await db.select().from(pricingTiers).where(eq(pricingTiers.id, id));
        return tier || void 0;
      }
      async getAllPricingTiers() {
        return await db.select().from(pricingTiers);
      }
      async getPricingTierByAmount(amount) {
        const tiers = await db.select().from(pricingTiers).where(eq(pricingTiers.isActive, true));
        return tiers.find((t) => {
          const min = parseFloat(t.minAmount.toString());
          const max = t.maxAmount ? parseFloat(t.maxAmount.toString()) : Infinity;
          return amount >= min && amount <= max;
        });
      }
      async createPricingTier(tier) {
        const [newTier] = await db.insert(pricingTiers).values(tier).returning();
        return newTier;
      }
      async updatePricingTier(id, data) {
        const [updated] = await db.update(pricingTiers).set(data).where(eq(pricingTiers.id, id)).returning();
        return updated || void 0;
      }
      async deletePricingTier(id) {
        await db.delete(pricingTiers).where(eq(pricingTiers.id, id));
      }
      // PHASE 3 - Currency Settings
      async getCurrencySettings() {
        const [settings2] = await db.select().from(currencySettings).limit(1);
        return settings2 || void 0;
      }
      async upsertCurrencySettings(settings2) {
        const existing = await this.getCurrencySettings();
        if (existing) {
          const [updated] = await db.update(currencySettings).set({ ...settings2, updatedAt: /* @__PURE__ */ new Date() }).where(eq(currencySettings.id, existing.id)).returning();
          return updated;
        } else {
          const [newSettings] = await db.insert(currencySettings).values(settings2).returning();
          return newSettings;
        }
      }
      // NEW FEATURE - Vendors
      async getVendor(id) {
        const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
        return vendor || void 0;
      }
      async getAllVendors() {
        return await db.select().from(vendors).orderBy(desc(vendors.createdAt));
      }
      async getActiveVendors() {
        return await db.select().from(vendors).where(eq(vendors.isActive, true)).orderBy(vendors.name);
      }
      async createVendor(vendor) {
        const [newVendor] = await db.insert(vendors).values(vendor).returning();
        return newVendor;
      }
      async updateVendor(id, data) {
        const [updated] = await db.update(vendors).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(vendors.id, id)).returning();
        return updated || void 0;
      }
      async deleteVendor(id) {
        const pos = await db.select({ id: vendorPurchaseOrders.id }).from(vendorPurchaseOrders).where(eq(vendorPurchaseOrders.vendorId, id)).limit(1);
        if (pos.length > 0) {
          throw new Error("Cannot delete vendor: there are existing purchase orders for this vendor.");
        }
        await db.delete(vendors).where(eq(vendors.id, id));
      }
      // NEW FEATURE - Vendor Purchase Orders
      async getVendorPo(id) {
        const [po] = await db.select().from(vendorPurchaseOrders).where(eq(vendorPurchaseOrders.id, id));
        return po || void 0;
      }
      async getVendorPosByQuote(quoteId) {
        return await db.select().from(vendorPurchaseOrders).where(eq(vendorPurchaseOrders.quoteId, quoteId)).orderBy(desc(vendorPurchaseOrders.createdAt));
      }
      async getAllVendorPos() {
        return await db.select().from(vendorPurchaseOrders).orderBy(desc(vendorPurchaseOrders.createdAt));
      }
      async createVendorPo(po) {
        const [newPo] = await db.insert(vendorPurchaseOrders).values(po).returning();
        return newPo;
      }
      async updateVendorPo(id, data) {
        const [updated] = await db.update(vendorPurchaseOrders).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(vendorPurchaseOrders.id, id)).returning();
        return updated || void 0;
      }
      async deleteVendorPo(id) {
        await db.delete(vendorPurchaseOrders).where(eq(vendorPurchaseOrders.id, id));
      }
      async getLastPoNumber() {
        const [lastPo] = await db.select().from(vendorPurchaseOrders).orderBy(desc(vendorPurchaseOrders.createdAt)).limit(1);
        return lastPo?.poNumber;
      }
      // NEW FEATURE - Vendor PO Items
      async getVendorPoItems(vendorPoId) {
        return await db.select().from(vendorPoItems).where(eq(vendorPoItems.vendorPoId, vendorPoId)).orderBy(vendorPoItems.sortOrder);
      }
      async createVendorPoItem(item) {
        const [newItem] = await db.insert(vendorPoItems).values(item).returning();
        return newItem;
      }
      async updateVendorPoItem(id, data) {
        const [updated] = await db.update(vendorPoItems).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(vendorPoItems.id, id)).returning();
        return updated || void 0;
      }
      async deleteVendorPoItems(vendorPoId) {
        await db.delete(vendorPoItems).where(eq(vendorPoItems.vendorPoId, vendorPoId));
      }
      // NEW FEATURE - Invoice Items
      async getInvoiceItems(invoiceId) {
        return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId)).orderBy(invoiceItems.sortOrder);
      }
      async getInvoiceItem(id) {
        const [item] = await db.select().from(invoiceItems).where(eq(invoiceItems.id, id));
        return item || void 0;
      }
      async createInvoiceItem(item) {
        const [newItem] = await db.insert(invoiceItems).values(item).returning();
        return newItem;
      }
      async updateInvoiceItem(id, data) {
        const [updated] = await db.update(invoiceItems).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(invoiceItems.id, id)).returning();
        return updated || void 0;
      }
      async deleteInvoiceItems(invoiceId) {
        await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
      }
      async createInvoiceAttachment(attachment) {
        const [newAttachment] = await db.insert(invoiceAttachments).values(attachment).returning();
        return newAttachment;
      }
      async getInvoicesBySalesOrder(salesOrderId) {
        return await db.select().from(invoices).where(eq(invoices.salesOrderId, salesOrderId)).orderBy(desc(invoices.createdAt));
      }
      async getInvoicesByQuote(quoteId) {
        return await db.select().from(invoices).where(eq(invoices.quoteId, quoteId)).orderBy(desc(invoices.createdAt));
      }
      // Serial Numbers
      async getSerialNumber(id) {
        const { serialNumbers: serialNumbers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const [serial2] = await db.select().from(serialNumbers2).where(eq(serialNumbers2.id, id));
        return serial2 || void 0;
      }
      async getSerialNumberByValue(serialNumber) {
        const { serialNumbers: serialNumbers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const [serial2] = await db.select().from(serialNumbers2).where(eq(serialNumbers2.serialNumber, serialNumber));
        return serial2 || void 0;
      }
      async createSerialNumber(serial2) {
        const { serialNumbers: serialNumbers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const [newSerial] = await db.insert(serialNumbers2).values(serial2).returning();
        return newSerial;
      }
      async updateSerialNumber(id, data) {
        const { serialNumbers: serialNumbers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const [updated] = await db.update(serialNumbers2).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(serialNumbers2.id, id)).returning();
        return updated || void 0;
      }
      // NEW FEATURE - Goods Received Notes (GRN)
      async getGrn(id) {
        const [grn] = await db.select().from(goodsReceivedNotes).where(eq(goodsReceivedNotes.id, id));
        return grn || void 0;
      }
      async getGrnByNumber(grnNumber) {
        const [grn] = await db.select().from(goodsReceivedNotes).where(eq(goodsReceivedNotes.grnNumber, grnNumber));
        return grn || void 0;
      }
      async getAllGrns() {
        return await db.select().from(goodsReceivedNotes).orderBy(desc(goodsReceivedNotes.createdAt));
      }
      async getGrnsByVendorPo(vendorPoId) {
        return await db.select().from(goodsReceivedNotes).where(eq(goodsReceivedNotes.vendorPoId, vendorPoId)).orderBy(desc(goodsReceivedNotes.createdAt));
      }
      async createGrn(grn) {
        const [newGrn] = await db.insert(goodsReceivedNotes).values(grn).returning();
        return newGrn;
      }
      async updateGrn(id, data) {
        const [updated] = await db.update(goodsReceivedNotes).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(goodsReceivedNotes.id, id)).returning();
        return updated || void 0;
      }
      async deleteGrn(id) {
        await db.transaction(async (tx) => {
          const [grn] = await tx.select().from(goodsReceivedNotes).where(eq(goodsReceivedNotes.id, id));
          if (!grn) return;
          const [poItem] = await tx.select().from(vendorPoItems).where(eq(vendorPoItems.id, grn.vendorPoItemId));
          if (poItem && poItem.productId) {
            await tx.update(products).set({
              stockQuantity: sql2`${products.stockQuantity} - ${grn.quantityReceived}`,
              availableQuantity: sql2`${products.availableQuantity} - ${grn.quantityReceived}`,
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq(products.id, poItem.productId));
            console.log(`[Storage] Reversing GRN stock for product ${poItem.productId}: -${grn.quantityReceived}`);
          }
          await tx.delete(goodsReceivedNotes).where(eq(goodsReceivedNotes.id, id));
        });
      }
      // Quote Versions
      async createQuoteVersion(version) {
        const [newVersion] = await db.insert(quoteVersions).values(version).returning();
        return newVersion;
      }
      async getQuoteVersions(quoteId) {
        return await db.select().from(quoteVersions).where(eq(quoteVersions.quoteId, quoteId)).orderBy(desc(quoteVersions.version));
      }
      async getQuoteVersion(quoteId, version) {
        const [ver] = await db.select().from(quoteVersions).where(and(eq(quoteVersions.quoteId, quoteId), eq(quoteVersions.version, version)));
        return ver || void 0;
      }
      // Sales Orders
      async createSalesOrder(order) {
        const [newOrder] = await db.insert(salesOrders).values(order).returning();
        return newOrder;
      }
      async getSalesOrder(id) {
        const [order] = await db.select().from(salesOrders).where(eq(salesOrders.id, id));
        return order || void 0;
      }
      async getSalesOrderByQuote(quoteId) {
        const [order] = await db.select().from(salesOrders).where(eq(salesOrders.quoteId, quoteId));
        return order || void 0;
      }
      async getAllSalesOrders() {
        return await db.select().from(salesOrders).orderBy(desc(salesOrders.createdAt));
      }
      async updateSalesOrder(id, data) {
        const [updatedOrder] = await db.update(salesOrders).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(salesOrders.id, id)).returning();
        return updatedOrder || void 0;
      }
      async deleteSalesOrder(id) {
        await db.delete(salesOrders).where(eq(salesOrders.id, id));
      }
      async getLastSalesOrderNumber() {
        const [lastOrder] = await db.select().from(salesOrders).orderBy(desc(salesOrders.orderNumber)).limit(1);
        return lastOrder?.orderNumber;
      }
      // Sales Order Items
      async createSalesOrderItem(item) {
        const [newItem] = await db.insert(salesOrderItems).values(item).returning();
        return newItem;
      }
      async getSalesOrderItems(salesOrderId) {
        return await db.select().from(salesOrderItems).where(eq(salesOrderItems.salesOrderId, salesOrderId)).orderBy(salesOrderItems.sortOrder);
      }
      async deleteSalesOrderItems(salesOrderId) {
        await db.delete(salesOrderItems).where(eq(salesOrderItems.salesOrderId, salesOrderId));
      }
      // Products
      async getProduct(id) {
        const [product] = await db.select().from(products).where(eq(products.id, id));
        return product || void 0;
      }
      async updateProduct(id, data) {
        const [updated] = await db.update(products).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, id)).returning();
        return updated || void 0;
      }
      // Approval Rules
      async getApprovalRules() {
        return await db.select().from(approvalRules).where(eq(approvalRules.isActive, true));
      }
      async createApprovalRule(rule) {
        const [newRule] = await db.insert(approvalRules).values(rule).returning();
        return newRule;
      }
      async updateApprovalRule(id, rule) {
        const [updated] = await db.update(approvalRules).set({ ...rule, updatedAt: /* @__PURE__ */ new Date() }).where(eq(approvalRules.id, id)).returning();
        return updated;
      }
      async deleteApprovalRule(id) {
        await db.delete(approvalRules).where(eq(approvalRules.id, id));
      }
      // Quote Comments for Interactive Public Quotes
      async getQuoteComments(quoteId, includeInternal = false) {
        if (includeInternal) {
          return await db.select().from(quoteComments).where(eq(quoteComments.quoteId, quoteId)).orderBy(quoteComments.createdAt);
        }
        return await db.select().from(quoteComments).where(
          and(eq(quoteComments.quoteId, quoteId), eq(quoteComments.isInternal, false))
        ).orderBy(quoteComments.createdAt);
      }
      async createQuoteComment(comment) {
        const [newComment] = await db.insert(quoteComments).values(comment).returning();
        return newComment;
      }
      async updateQuoteItemSelection(itemId, isSelected) {
        const [updated] = await db.update(quoteItems).set({ isSelected }).where(eq(quoteItems.id, itemId)).returning();
        return updated || void 0;
      }
      // ==================== WORKFLOW AUTOMATION STORAGE METHODS ====================
      // Workflows
      async getWorkflow(id) {
        const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id));
        return workflow || void 0;
      }
      async getAllWorkflows() {
        return await db.select().from(workflows).orderBy(desc(workflows.createdAt));
      }
      async getWorkflowsByEntity(entityType) {
        return await db.select().from(workflows).where(eq(workflows.entityType, entityType)).orderBy(desc(workflows.priority));
      }
      async getActiveWorkflows(entityType) {
        return await db.select().from(workflows).where(
          and(
            eq(workflows.entityType, entityType),
            eq(workflows.status, "active")
          )
        ).orderBy(desc(workflows.priority));
      }
      async createWorkflow(workflow) {
        const [newWorkflow] = await db.insert(workflows).values(workflow).returning();
        return newWorkflow;
      }
      async updateWorkflow(id, data) {
        const { createdAt, id: _, ...updateData } = data;
        const [updated] = await db.update(workflows).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(workflows.id, id)).returning();
        return updated || void 0;
      }
      async deleteWorkflow(id) {
        await db.update(workflows).set({ status: "inactive", updatedAt: /* @__PURE__ */ new Date() }).where(eq(workflows.id, id));
      }
      // Workflow Triggers
      async getWorkflowTriggers(workflowId) {
        return await db.select().from(workflowTriggers).where(eq(workflowTriggers.workflowId, workflowId));
      }
      async createWorkflowTrigger(trigger) {
        const { createdAt, id: _, ...triggerData } = trigger;
        const [newTrigger] = await db.insert(workflowTriggers).values(triggerData).returning();
        return newTrigger;
      }
      async updateWorkflowTrigger(id, data) {
        const [updated] = await db.update(workflowTriggers).set(data).where(eq(workflowTriggers.id, id)).returning();
        return updated || void 0;
      }
      async deleteWorkflowTriggers(workflowId) {
        await db.delete(workflowTriggers).where(eq(workflowTriggers.workflowId, workflowId));
      }
      // Workflow Actions
      async getWorkflowActions(workflowId) {
        return await db.select().from(workflowActions).where(eq(workflowActions.workflowId, workflowId)).orderBy(workflowActions.executionOrder);
      }
      async createWorkflowAction(action) {
        const { createdAt, id: _, ...actionData } = action;
        const [newAction] = await db.insert(workflowActions).values(actionData).returning();
        return newAction;
      }
      async updateWorkflowAction(id, data) {
        const [updated] = await db.update(workflowActions).set(data).where(eq(workflowActions.id, id)).returning();
        return updated || void 0;
      }
      async deleteWorkflowActions(workflowId) {
        await db.delete(workflowActions).where(eq(workflowActions.workflowId, workflowId));
      }
      // Workflow Executions
      async getWorkflowExecution(id) {
        const [execution] = await db.select().from(workflowExecutions).where(eq(workflowExecutions.id, id));
        return execution || void 0;
      }
      async getWorkflowExecutions(workflowId) {
        return await db.select().from(workflowExecutions).where(eq(workflowExecutions.workflowId, workflowId)).orderBy(desc(workflowExecutions.triggeredAt)).limit(100);
      }
      async getEntityWorkflowExecutions(entityType, entityId) {
        return await db.select().from(workflowExecutions).where(
          and(
            eq(workflowExecutions.entityType, entityType),
            eq(workflowExecutions.entityId, entityId)
          )
        ).orderBy(desc(workflowExecutions.triggeredAt));
      }
      async createWorkflowExecution(execution) {
        const [newExecution] = await db.insert(workflowExecutions).values(execution).returning();
        return newExecution;
      }
      async updateWorkflowExecution(id, data) {
        const [updated] = await db.update(workflowExecutions).set(data).where(eq(workflowExecutions.id, id)).returning();
        return updated || void 0;
      }
      // Workflow Schedules
      async getWorkflowSchedule(workflowId) {
        const [schedule] = await db.select().from(workflowSchedules).where(eq(workflowSchedules.workflowId, workflowId));
        return schedule || void 0;
      }
      async getAllWorkflowSchedules() {
        return await db.select().from(workflowSchedules).orderBy(workflowSchedules.nextRunAt);
      }
      async getActiveWorkflowSchedules() {
        return await db.select().from(workflowSchedules).where(eq(workflowSchedules.isActive, true)).orderBy(workflowSchedules.nextRunAt);
      }
      async createWorkflowSchedule(schedule) {
        const [newSchedule] = await db.insert(workflowSchedules).values(schedule).returning();
        return newSchedule;
      }
      async updateWorkflowSchedule(id, data) {
        const [updated] = await db.update(workflowSchedules).set(data).where(eq(workflowSchedules.id, id)).returning();
        return updated || void 0;
      }
      async deleteWorkflowSchedule(workflowId) {
        await db.delete(workflowSchedules).where(eq(workflowSchedules.workflowId, workflowId));
      }
      // User Devices
      async createUserDevice(device) {
        const [newItem] = await db.insert(userDevices).values(device).returning();
        return newItem;
      }
      async getUserDevices(userId) {
        return db.select().from(userDevices).where(eq(userDevices.userId, userId)).orderBy(desc(userDevices.lastActive));
      }
      async getUserDevice(id) {
        const [device] = await db.select().from(userDevices).where(eq(userDevices.id, id));
        return device;
      }
      async updateUserDevice(id, data) {
        const [updated] = await db.update(userDevices).set(data).where(eq(userDevices.id, id)).returning();
        return updated;
      }
      async deleteUserDevice(id) {
        await db.delete(userDevices).where(eq(userDevices.id, id));
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/permissions-service.ts
function hasPermission(userRole, resource, action, context) {
  const roleDef = ROLE_DEFINITIONS[userRole];
  if (!roleDef) return false;
  const permission = roleDef.permissions.find(
    (p) => p.resource === resource && p.action === action
  );
  if (!permission) return false;
  if (permission.conditions && context) {
    return permission.conditions.every((condition) => {
      const contextValue = context[condition.field];
      switch (condition.operator) {
        case "equals":
          return contextValue === condition.value;
        case "not_equals":
          return contextValue !== condition.value;
        case "in":
          return Array.isArray(condition.value) && condition.value.includes(contextValue);
        case "not_in":
          return Array.isArray(condition.value) && !condition.value.includes(contextValue);
        default:
          return false;
      }
    });
  }
  return true;
}
var ROLE_DEFINITIONS;
var init_permissions_service = __esm({
  "server/permissions-service.ts"() {
    "use strict";
    ROLE_DEFINITIONS = {
      admin: {
        name: "Administrator",
        description: "Full system access - Configure settings, manage users, all operations",
        permissions: [
          // All resources with all actions
          { resource: "quotes", action: "view" },
          { resource: "quotes", action: "create" },
          { resource: "quotes", action: "edit" },
          { resource: "quotes", action: "delete" },
          { resource: "quotes", action: "approve" },
          { resource: "quotes", action: "cancel" },
          { resource: "invoices", action: "view" },
          { resource: "invoices", action: "create" },
          { resource: "invoices", action: "edit" },
          { resource: "invoices", action: "delete" },
          { resource: "invoices", action: "finalize" },
          { resource: "invoices", action: "lock" },
          { resource: "invoices", action: "cancel" },
          { resource: "sales_orders", action: "view" },
          { resource: "sales_orders", action: "create" },
          { resource: "sales_orders", action: "edit" },
          { resource: "sales_orders", action: "delete" },
          { resource: "sales_orders", action: "approve" },
          { resource: "sales_orders", action: "cancel" },
          { resource: "credit_notes", action: "view" },
          { resource: "credit_notes", action: "create" },
          { resource: "credit_notes", action: "edit" },
          { resource: "credit_notes", action: "delete" },
          { resource: "debit_notes", action: "view" },
          { resource: "debit_notes", action: "create" },
          { resource: "debit_notes", action: "edit" },
          { resource: "debit_notes", action: "delete" },
          { resource: "vendor_pos", action: "view" },
          { resource: "vendor_pos", action: "create" },
          { resource: "vendor_pos", action: "edit" },
          { resource: "vendor_pos", action: "delete" },
          { resource: "grns", action: "view" },
          { resource: "grns", action: "create" },
          { resource: "grns", action: "edit" },
          { resource: "grns", action: "delete" },
          { resource: "clients", action: "view" },
          { resource: "clients", action: "create" },
          { resource: "clients", action: "edit" },
          { resource: "clients", action: "delete" },
          { resource: "vendors", action: "view" },
          { resource: "vendors", action: "create" },
          { resource: "vendors", action: "edit" },
          { resource: "vendors", action: "delete" },
          { resource: "products", action: "view" },
          { resource: "products", action: "create" },
          { resource: "products", action: "edit" },
          { resource: "products", action: "delete" },
          { resource: "payments", action: "view" },
          { resource: "payments", action: "create" },
          { resource: "payments", action: "edit" },
          { resource: "payments", action: "delete" },
          { resource: "serial_numbers", action: "view" },
          { resource: "serial_numbers", action: "edit" },
          { resource: "users", action: "view" },
          { resource: "users", action: "create" },
          { resource: "users", action: "edit" },
          { resource: "users", action: "delete" },
          { resource: "settings", action: "view" },
          { resource: "settings", action: "create" },
          { resource: "settings", action: "edit" },
          { resource: "settings", action: "delete" },
          { resource: "settings", action: "manage" },
          { resource: "subscriptions", action: "view" },
          { resource: "subscriptions", action: "create" },
          { resource: "subscriptions", action: "edit" },
          { resource: "subscriptions", action: "delete" },
          { resource: "subscriptions", action: "cancel" },
          { resource: "subscriptions", action: "cancel" },
          { resource: "analytics", action: "view" }
        ]
      },
      sales_executive: {
        name: "Sales Executive",
        description: "Create and edit draft quotes, view related POs and invoices",
        permissions: [
          { resource: "quotes", action: "view" },
          { resource: "quotes", action: "create" },
          {
            resource: "quotes",
            action: "edit",
            conditions: [
              { field: "status", operator: "in", value: ["draft", "sent"] }
            ]
          },
          { resource: "invoices", action: "view" },
          { resource: "invoices", action: "create" },
          { resource: "invoices", action: "edit" },
          { resource: "invoices", action: "finalize" },
          { resource: "sales_orders", action: "view" },
          { resource: "sales_orders", action: "create" },
          { resource: "sales_orders", action: "edit" },
          { resource: "vendor_pos", action: "view" },
          { resource: "clients", action: "view" },
          { resource: "clients", action: "create" },
          { resource: "clients", action: "edit" },
          { resource: "products", action: "view" },
          { resource: "serial_numbers", action: "view" },
          { resource: "subscriptions", action: "view" }
        ]
      },
      sales_manager: {
        name: "Sales Manager",
        description: "Approve quotes, edit certain fields after approval",
        permissions: [
          { resource: "quotes", action: "view" },
          { resource: "quotes", action: "create" },
          { resource: "quotes", action: "edit" },
          { resource: "quotes", action: "approve" },
          { resource: "quotes", action: "cancel" },
          { resource: "invoices", action: "view" },
          { resource: "invoices", action: "create" },
          { resource: "invoices", action: "edit" },
          { resource: "sales_orders", action: "view" },
          { resource: "sales_orders", action: "create" },
          { resource: "sales_orders", action: "edit" },
          { resource: "sales_orders", action: "approve" },
          { resource: "sales_orders", action: "cancel" },
          { resource: "vendor_pos", action: "view" },
          { resource: "grns", action: "view" },
          { resource: "clients", action: "view" },
          { resource: "clients", action: "create" },
          { resource: "clients", action: "edit" },
          { resource: "products", action: "view" },
          { resource: "payments", action: "view" },
          { resource: "serial_numbers", action: "edit" },
          { resource: "subscriptions", action: "view" },
          { resource: "subscriptions", action: "create" },
          { resource: "subscriptions", action: "edit" },
          { resource: "subscriptions", action: "cancel" },
          { resource: "subscriptions", action: "cancel" },
          { resource: "analytics", action: "view" }
        ]
      },
      purchase_operations: {
        name: "Purchase / Operations",
        description: "Create and manage Vendor POs and GRNs, view relevant quotes and invoices",
        permissions: [
          { resource: "vendor_pos", action: "view" },
          { resource: "vendor_pos", action: "create" },
          { resource: "vendor_pos", action: "edit" },
          { resource: "vendor_pos", action: "delete" },
          { resource: "grns", action: "view" },
          { resource: "grns", action: "create" },
          { resource: "grns", action: "edit" },
          { resource: "grns", action: "delete" },
          { resource: "sales_orders", action: "view" },
          { resource: "quotes", action: "view" },
          { resource: "invoices", action: "view" },
          { resource: "vendors", action: "view" },
          { resource: "vendors", action: "create" },
          { resource: "vendors", action: "edit" },
          { resource: "products", action: "view" },
          { resource: "products", action: "create" },
          { resource: "products", action: "edit" },
          { resource: "serial_numbers", action: "view" },
          { resource: "serial_numbers", action: "edit" }
        ]
      },
      finance_accounts: {
        name: "Finance / Accounts",
        description: "Create and finalize invoices, record payments, view receivables",
        permissions: [
          { resource: "invoices", action: "view" },
          { resource: "invoices", action: "create" },
          { resource: "invoices", action: "edit" },
          { resource: "invoices", action: "finalize" },
          { resource: "invoices", action: "lock" },
          { resource: "invoices", action: "cancel" },
          { resource: "credit_notes", action: "view" },
          { resource: "credit_notes", action: "create" },
          { resource: "credit_notes", action: "edit" },
          { resource: "credit_notes", action: "delete" },
          { resource: "debit_notes", action: "view" },
          { resource: "debit_notes", action: "create" },
          { resource: "debit_notes", action: "edit" },
          { resource: "debit_notes", action: "delete" },
          { resource: "payments", action: "view" },
          { resource: "payments", action: "create" },
          { resource: "payments", action: "edit" },
          { resource: "payments", action: "delete" },
          { resource: "sales_orders", action: "view" },
          { resource: "quotes", action: "view" },
          { resource: "clients", action: "view" },
          { resource: "serial_numbers", action: "view" },
          { resource: "subscriptions", action: "view" },
          { resource: "subscriptions", action: "create" },
          { resource: "subscriptions", action: "edit" },
          { resource: "subscriptions", action: "cancel" },
          { resource: "subscriptions", action: "cancel" },
          { resource: "analytics", action: "view" }
        ]
      },
      viewer: {
        name: "Viewer",
        description: "Read-only access to most resources",
        permissions: [
          { resource: "quotes", action: "view" },
          { resource: "invoices", action: "view" },
          { resource: "sales_orders", action: "view" },
          { resource: "vendor_pos", action: "view" },
          { resource: "grns", action: "view" },
          { resource: "clients", action: "view" },
          { resource: "vendors", action: "view" },
          { resource: "products", action: "view" },
          { resource: "payments", action: "view" },
          { resource: "serial_numbers", action: "view" }
        ]
      }
    };
  }
});

// shared/feature-flags.ts
var feature_flags_exports = {};
__export(feature_flags_exports, {
  DEFAULT_FEATURE_FLAGS: () => DEFAULT_FEATURE_FLAGS,
  allFeaturesEnabled: () => allFeaturesEnabled,
  anyFeatureEnabled: () => anyFeatureEnabled,
  featureFlags: () => featureFlags,
  getFeatureFlags: () => getFeatureFlags,
  isFeatureEnabled: () => isFeatureEnabled
});
function getFeatureFlags() {
  const isBrowser = typeof window !== "undefined";
  const flags = { ...DEFAULT_FEATURE_FLAGS };
  if (isBrowser && typeof import.meta !== "undefined" && import.meta.env) {
    Object.keys(flags).forEach((key) => {
      const envKey = `VITE_FEATURE_${key.toUpperCase()}`;
      const envValue = import.meta.env[envKey];
      if (envValue !== void 0) {
        flags[key] = envValue === "true";
      }
    });
  }
  if (!isBrowser && typeof process !== "undefined" && process.env) {
    Object.keys(flags).forEach((key) => {
      const envKey = `FEATURE_${key.toUpperCase()}`;
      const envValue = process.env[envKey];
      if (envValue !== void 0) {
        flags[key] = envValue === "true";
      }
    });
  }
  return flags;
}
function isFeatureEnabled(feature) {
  return featureFlags[feature];
}
function anyFeatureEnabled(...features) {
  return features.some((f) => isFeatureEnabled(f));
}
function allFeaturesEnabled(...features) {
  return features.every((f) => isFeatureEnabled(f));
}
var DEFAULT_FEATURE_FLAGS, featureFlags;
var init_feature_flags = __esm({
  "shared/feature-flags.ts"() {
    "use strict";
    DEFAULT_FEATURE_FLAGS = {
      // ==================== PAGES & ROUTES ====================
      pages_dashboard: true,
      pages_clients: true,
      pages_clientDetail: true,
      pages_quotes: true,
      pages_quoteCreate: true,
      pages_quoteDetail: true,
      pages_invoices: true,
      pages_invoiceDetail: true,
      pages_vendors: true,
      pages_vendorPOs: true,
      pages_vendorPODetail: true,
      pages_products: true,
      pages_grn: true,
      pages_grnDetail: true,
      pages_serialSearch: true,
      pages_dashboardsOverview: true,
      pages_salesQuoteDashboard: true,
      pages_vendorPODashboard: true,
      pages_invoiceCollectionsDashboard: true,
      pages_serialTrackingDashboard: true,
      pages_adminUsers: true,
      pages_adminSettings: true,
      pages_adminConfiguration: true,
      pages_governanceDashboard: true,
      pages_adminAnalytics: true,
      pages_numberingSchemes: true,
      pages_resetPassword: true,
      pages_signup: true,
      // ==================== NAVIGATION ====================
      nav_salesDropdown: true,
      nav_purchaseDropdown: true,
      nav_adminDropdown: true,
      nav_dashboardsLink: true,
      nav_serialSearchLink: true,
      // ==================== QUOTE FEATURES ====================
      quotes_module: true,
      quotes_create: true,
      quotes_edit: true,
      quotes_delete: true,
      quotes_approve: true,
      quotes_cancel: true,
      quotes_close: true,
      quotes_clone: true,
      quotes_version: true,
      sales_orders_module: true,
      sales_orders_pdfGeneration: true,
      sales_orders_emailSending: false,
      quotes_bomSection: true,
      quotes_slaSection: true,
      quotes_timelineSection: true,
      quotes_convertToInvoice: true,
      quotes_convertToSalesOrder: true,
      sales_orders_convertToInvoice: true,
      quotes_convertToVendorPO: true,
      quotes_sendQuote: true,
      quotes_emailSending: false,
      quotes_pdfGeneration: true,
      quotes_templates: true,
      quotes_referenceNumber: true,
      quotes_attentionTo: true,
      quotes_validityDays: true,
      quotes_discount: true,
      quotes_shippingCharges: true,
      quotes_notes: true,
      quotes_termsConditions: true,
      // ==================== INVOICE FEATURES ====================
      invoices_module: true,
      invoices_create: true,
      invoices_edit: true,
      invoices_delete: true,
      invoices_finalize: true,
      invoices_lock: true,
      invoices_cancel: true,
      invoices_childInvoices: true,
      invoices_masterInvoices: true,
      invoices_milestoneInvoices: true,
      invoices_emailSending: true,
      invoices_pdfGeneration: true,
      invoices_paymentTracking: true,
      invoices_paymentHistory: true,
      invoices_partialPayments: true,
      invoices_paymentReminders: true,
      invoices_overdueNotifications: true,
      invoices_autoReminders: true,
      // ==================== CREDIT NOTES ====================
      creditNotes_module: true,
      creditNotes_create: true,
      creditNotes_edit: true,
      creditNotes_delete: true,
      creditNotes_issue: true,
      creditNotes_apply: true,
      // ==================== DEBIT NOTES ====================
      debitNotes_module: true,
      debitNotes_create: true,
      debitNotes_edit: true,
      debitNotes_delete: true,
      debitNotes_issue: true,
      debitNotes_apply: true,
      // ==================== SUBSCRIPTIONS ====================
      subscriptions_module: true,
      // ==================== CLIENT/CRM FEATURES ====================
      clients_module: true,
      clients_create: true,
      clients_edit: true,
      clients_delete: true,
      clients_segmentation: true,
      clients_tags: true,
      clients_preferredTheme: true,
      clients_gstin: true,
      clients_billingAddress: true,
      clients_shippingAddress: true,
      clients_communicationHistory: true,
      clients_timeline: true,
      clients_notes: true,
      clients_advancedSearch: true,
      // ==================== VENDOR & SUPPLY CHAIN ====================
      vendors_module: true,
      vendors_create: true,
      vendors_edit: true,
      vendors_delete: true,
      vendorPO_module: true,
      vendorPO_create: true,
      vendorPO_edit: true,
      vendorPO_delete: true,
      vendorPO_emailSending: false,
      vendorPO_pdfGeneration: true,
      vendorPO_statusTracking: true,
      grn_module: true,
      grn_create: true,
      grn_edit: true,
      grn_delete: true,
      grn_serialNumberTracking: true,
      grn_qualityNotes: true,
      serialNumber_tracking: true,
      serialNumber_search: true,
      serialNumber_export: true,
      serialNumber_history: true,
      // ==================== PRODUCTS & INVENTORY ====================
      products_module: true,
      products_create: true,
      products_edit: true,
      products_delete: true,
      products_sku: true,
      products_categories: true,
      products_pricing: true,
      products_reorderLevel: true,
      // Products Linking & Stock Control
      products_link_to_quotes: true,
      products_link_to_invoices: true,
      products_link_to_vendor_pos: true,
      products_stock_tracking: true,
      products_stock_warnings: true,
      products_reserve_on_order: true,
      products_allow_negative_stock: true,
      // ==================== ANALYTICS & DASHBOARDS ====================
      analytics_module: true,
      analytics_revenueMetrics: true,
      analytics_quoteMetrics: true,
      analytics_invoiceMetrics: true,
      analytics_vendorMetrics: true,
      analytics_forecasting: true,
      analytics_trends: true,
      analytics_charts: true,
      dashboard_salesQuotes: true,
      dashboard_vendorPO: true,
      dashboard_invoiceCollections: true,
      dashboard_serialTracking: true,
      dashboard_governance: true,
      // ==================== PAYMENT FEATURES ====================
      payments_module: true,
      payments_create: true,
      payments_edit: true,
      payments_delete: true,
      payments_history: true,
      payments_methods: true,
      payments_transactionIds: true,
      payments_notes: true,
      payments_analytics: true,
      // ==================== TAX & PRICING ====================
      tax_gst: true,
      tax_cgst: true,
      tax_sgst: true,
      tax_igst: true,
      tax_hsnSac: true,
      tax_multiRate: true,
      tax_rateManagement: true,
      pricing_tiers: true,
      pricing_discount: true,
      pricing_shipping: true,
      pricing_automatic: true,
      // ==================== PDF & THEMES ====================
      pdf_generation: true,
      // Re-enabled for testing
      pdf_themes: true,
      pdf_customThemes: true,
      pdf_clientSpecificThemes: true,
      pdf_logo: true,
      pdf_headerFooter: true,
      pdf_watermark: true,
      theme_professional: true,
      theme_modern: true,
      theme_minimal: true,
      theme_creative: true,
      theme_premium: true,
      theme_government: true,
      theme_education: true,
      // ==================== EMAIL INTEGRATION ====================
      email_integration: true,
      email_resend: true,
      email_smtp: true,
      email_welcome: false,
      email_quoteSending: false,
      email_invoiceSending: false,
      email_paymentReminders: false,
      email_overdueNotifications: false,
      email_vendorPO: false,
      email_templates_module: true,
      email_subscriptionRenewed: false,
      // ==================== ADMIN & CONFIGURATION ====================
      admin_userManagement: true,
      admin_settings: true,
      admin_configuration: true,
      admin_governance: true,
      admin_bankDetails: true,
      admin_taxRates: true,
      admin_numberingSchemes: true,
      admin_templates: true,
      admin_activityLogs: true,
      // ==================== SECURITY & ACCESS CONTROL ====================
      security_rbac: true,
      security_permissions: true,
      security_delegation: true,
      security_passwordReset: true,
      security_backupEmail: true,
      security_twoFactor: true,
      // Not yet implemented
      security_sessionManagement: true,
      security_rateLimiting: true,
      security_auditLogs: true,
      // ==================== USER MANAGEMENT ====================
      users_create: true,
      users_edit: true,
      users_delete: true,
      users_statusControl: true,
      users_roleAssignment: true,
      users_delegation: true,
      // ==================== ADVANCED FEATURES ====================
      advanced_apiRateLimiting: true,
      advanced_websockets: true,
      advanced_excelExport: true,
      advanced_bulkOperations: true,
      advanced_customReports: true,
      advanced_scheduledReports: true,
      // Not yet implemented
      // ==================== UI/UX FEATURES ====================
      ui_darkMode: true,
      ui_themeToggle: true,
      ui_animations: true,
      ui_tooltips: true,
      ui_breadcrumbs: true,
      ui_searchFilters: true,
      ui_sorting: true,
      ui_pagination: true,
      ui_responsiveDesign: true,
      // ==================== INTEGRATIONS ====================
      integration_vercelAnalytics: true,
      integration_externalApi: true,
      // ==================== WORKFLOW AUTOMATION ====================
      // Workflow Module
      workflows_module: true,
      workflows_create: true,
      workflows_edit: true,
      workflows_delete: true,
      workflows_execute: true,
      workflows_test: true,
      // Workflow Pages
      pages_workflows: true,
      pages_workflowBuilder: true,
      // Workflow Triggers
      workflows_trigger_statusChange: true,
      workflows_trigger_amountThreshold: true,
      workflows_trigger_fieldChange: true,
      workflows_trigger_dateBased: true,
      workflows_trigger_scheduled: true,
      workflows_trigger_manual: true,
      // Workflow Actions
      workflows_action_sendEmail: true,
      workflows_action_createNotification: true,
      workflows_action_updateField: true,
      workflows_action_assignUser: true,
      workflows_action_createTask: true,
      workflows_action_escalate: true,
      workflows_action_webhook: true,
      workflows_action_activityLog: true,
      // Approval Rules (Settings)
      approvalRules_module: true,
      approvalRules_create: true,
      approvalRules_edit: true,
      approvalRules_delete: true
    };
    featureFlags = getFeatureFlags();
  }
});

// server/services/numbering.service.ts
var numbering_service_exports = {};
__export(numbering_service_exports, {
  NumberingService: () => NumberingService
});
import { sql as sql3 } from "drizzle-orm";
var NumberingService;
var init_numbering_service = __esm({
  "server/services/numbering.service.ts"() {
    "use strict";
    init_storage();
    init_db();
    NumberingService = class {
      /**
       * Generate a formatted quote number
       * Example: QT-2025-001
       */
      static async generateQuoteNumber() {
        try {
          let formatSetting = await storage.getSetting("quoteFormat");
          if (!formatSetting) formatSetting = await storage.getSetting("quote_number_format");
          let prefixSetting = await storage.getSetting("quotePrefix");
          if (!prefixSetting) prefixSetting = await storage.getSetting("quote_prefix");
          const format = formatSetting?.value || "{PREFIX}-{YEAR}-{COUNTER:04d}";
          const prefix = prefixSetting?.value || "QT";
          const counter = await this.getAndIncrementCounter("quote");
          return this.applyFormat(format, prefix, counter);
        } catch (error) {
          console.error("Error generating quote number:", error);
          const counter = Math.floor(Math.random() * 1e4);
          return `QT-${String(counter).padStart(4, "0")}`;
        }
      }
      /**
       * Generate a formatted invoice number (unified for all invoices)
       * Example: INV-2025-001
       * Both master and child invoices use the same numbering sequence
       */
      static async generateMasterInvoiceNumber() {
        try {
          let formatSetting = await storage.getSetting("masterInvoiceFormat");
          let prefixSetting = await storage.getSetting("masterInvoicePrefix");
          if (!formatSetting) formatSetting = await storage.getSetting("invoiceFormat");
          if (!formatSetting) formatSetting = await storage.getSetting("invoice_number_format");
          if (!prefixSetting) prefixSetting = await storage.getSetting("invoicePrefix");
          if (!prefixSetting) prefixSetting = await storage.getSetting("invoice_prefix");
          const format = formatSetting?.value || "{PREFIX}-{YEAR}-{COUNTER:04d}";
          const prefix = prefixSetting?.value || "MINV";
          const counter = await this.getAndIncrementCounter("invoice");
          return this.applyFormat(format, prefix, counter);
        } catch (error) {
          console.error("Error generating master invoice number:", error);
          const counter = Math.floor(Math.random() * 1e4);
          return `MINV-${String(counter).padStart(4, "0")}`;
        }
      }
      /**
       * Generate a formatted invoice number (unified for all invoices)
       * Example: INV-2025-001
       * Both master and child invoices use the same numbering sequence
       */
      static async generateChildInvoiceNumber() {
        try {
          let formatSetting = await storage.getSetting("childInvoiceFormat");
          let prefixSetting = await storage.getSetting("childInvoicePrefix");
          if (!formatSetting) formatSetting = await storage.getSetting("invoiceFormat");
          if (!formatSetting) formatSetting = await storage.getSetting("invoice_number_format");
          if (!prefixSetting) prefixSetting = await storage.getSetting("invoicePrefix");
          if (!prefixSetting) prefixSetting = await storage.getSetting("invoice_prefix");
          const format = formatSetting?.value || "{PREFIX}-{YEAR}-{COUNTER:04d}";
          const prefix = prefixSetting?.value || "INV";
          const counter = await this.getAndIncrementCounter("invoice");
          return this.applyFormat(format, prefix, counter);
        } catch (error) {
          console.error("Error generating child invoice number:", error);
          const counter = Math.floor(Math.random() * 1e4);
          return `INV-${String(counter).padStart(4, "0")}`;
        }
      }
      /**
       * Generate a formatted invoice number (backwards compatibility)
       * Example: INV-2025-001
       */
      static async generateInvoiceNumber() {
        return this.generateChildInvoiceNumber();
      }
      /**
       * Generate a formatted vendor PO number
       * Example: PO-2025-001
       */
      static async generateVendorPoNumber() {
        try {
          let formatSetting = await storage.getSetting("vendorPoFormat");
          if (!formatSetting) formatSetting = await storage.getSetting("po_number_format");
          let prefixSetting = await storage.getSetting("vendorPoPrefix");
          if (!prefixSetting) prefixSetting = await storage.getSetting("po_prefix");
          const format = formatSetting?.value || "{PREFIX}-{YEAR}-{COUNTER:04d}";
          const prefix = prefixSetting?.value || "PO";
          const counter = await this.getAndIncrementCounter("vendor_po");
          return this.applyFormat(format, prefix, counter);
        } catch (error) {
          console.error("Error generating vendor PO number:", error);
          const counter = Math.floor(Math.random() * 1e4);
          return `PO-${String(counter).padStart(4, "0")}`;
        }
      }
      /**
       * Generate a formatted GRN number
       * Example: GRN-2025-001
       */
      static async generateGrnNumber() {
        try {
          let formatSetting = await storage.getSetting("grnFormat");
          if (!formatSetting) formatSetting = await storage.getSetting("grn_number_format");
          let prefixSetting = await storage.getSetting("grnPrefix");
          if (!prefixSetting) prefixSetting = await storage.getSetting("grn_prefix");
          const format = formatSetting?.value || "{PREFIX}-{YEAR}-{COUNTER:04d}";
          const prefix = prefixSetting?.value || "GRN";
          const counter = await this.getAndIncrementCounter("grn");
          return this.applyFormat(format, prefix, counter);
        } catch (error) {
          console.error("Error generating GRN number:", error);
          const counter = Math.floor(Math.random() * 1e4);
          return `GRN-${String(counter).padStart(4, "0")}`;
        }
      }
      /**
       * Generate a formatted sales order number
       * Example: SO-2025-001
       */
      static async generateSalesOrderNumber() {
        try {
          let formatSetting = await storage.getSetting("salesOrderFormat");
          if (!formatSetting) formatSetting = await storage.getSetting("sales_order_number_format");
          let prefixSetting = await storage.getSetting("salesOrderPrefix");
          if (!prefixSetting) prefixSetting = await storage.getSetting("sales_order_prefix");
          const format = formatSetting?.value || "{PREFIX}-{YEAR}-{COUNTER:04d}";
          const prefix = prefixSetting?.value || "SO";
          const counter = await this.getAndIncrementCounter("sales_order");
          return this.applyFormat(format, prefix, counter);
        } catch (error) {
          console.error("Error generating sales order number:", error);
          const counter = Math.floor(Math.random() * 1e4);
          return `SO-${String(counter).padStart(4, "0")}`;
        }
      }
      /**
       * Generate a formatted credit note number
       * Example: CN-2025-001
       */
      static async generateCreditNoteNumber() {
        try {
          let formatSetting = await storage.getSetting("creditNoteFormat");
          if (!formatSetting) formatSetting = await storage.getSetting("credit_note_number_format");
          let prefixSetting = await storage.getSetting("creditNotePrefix");
          if (!prefixSetting) prefixSetting = await storage.getSetting("credit_note_prefix");
          const format = formatSetting?.value || "{PREFIX}-{YEAR}-{COUNTER:04d}";
          const prefix = prefixSetting?.value || "CN";
          const counter = await this.getAndIncrementCounter("credit_note");
          return this.applyFormat(format, prefix, counter);
        } catch (error) {
          console.error("Error generating credit note number:", error);
          const counter = Math.floor(Math.random() * 1e4);
          return `CN-${String(counter).padStart(4, "0")}`;
        }
      }
      /**
       * Generate a formatted debit note number
       * Example: DN-2025-001
       */
      static async generateDebitNoteNumber() {
        try {
          let formatSetting = await storage.getSetting("debitNoteFormat");
          if (!formatSetting) formatSetting = await storage.getSetting("debit_note_number_format");
          let prefixSetting = await storage.getSetting("debitNotePrefix");
          if (!prefixSetting) prefixSetting = await storage.getSetting("debit_note_prefix");
          const format = formatSetting?.value || "{PREFIX}-{YEAR}-{COUNTER:04d}";
          const prefix = prefixSetting?.value || "DN";
          const counter = await this.getAndIncrementCounter("debit_note");
          return this.applyFormat(format, prefix, counter);
        } catch (error) {
          console.error("Error generating debit note number:", error);
          const counter = Math.floor(Math.random() * 1e4);
          return `DN-${String(counter).padStart(4, "0")}`;
        }
      }
      /**
       * Get the next counter value and increment it
       * Uses year-based counter keys (e.g., quote_counter_2025)
       * Uses ATOMIC SQL UPDATE to prevent race conditions
       * Counters start from 1 (formatted as 001 with padding)
       */
      static async getAndIncrementCounter(type) {
        const year = (/* @__PURE__ */ new Date()).getFullYear();
        const counterKey = `${type}_counter_${year}`;
        const result = await db.execute(sql3`
      INSERT INTO settings (id, key, value, updated_at) 
      VALUES (${sql3`gen_random_uuid()`}, ${counterKey}, '1', NOW())
      ON CONFLICT (key) DO UPDATE 
      SET value = (CAST(settings.value AS INTEGER) + 1)::text, updated_at = NOW()
      RETURNING value
    `);
        let nextValue = 1;
        if (result && Array.isArray(result) && result.length > 0 && result[0].value) {
          nextValue = parseInt(result[0].value, 10);
        } else if (result && "rows" in result && Array.isArray(result.rows) && result.rows.length > 0) {
          nextValue = parseInt(result.rows[0].value, 10);
        } else {
          console.error(`[NumberingService] CRITICAL: Failed to parse atomic result for ${counterKey}. Result was:`, result);
          throw new Error(`Failed to generate atomic counter for ${type}. Database driver response format unexpected.`);
        }
        console.log(`[NumberingService] ${type}_${year}: next=${nextValue}`);
        return nextValue;
      }
      /**
       * Apply format string with variables
       * Supported variables:
       * - {PREFIX}: Document prefix (QT, INV, PO, GRN)
       * - {YEAR}: Current year (2025)
       * - {COUNTER}: Counter value (1, 2, 3...)
       * - {COUNTER:04d}: Counter with zero padding to 4 digits (0001, 0002...)
       */
      static applyFormat(format, prefix, counter) {
        let result = format;
        result = result.replace(/{PREFIX}/g, prefix);
        const year = (/* @__PURE__ */ new Date()).getFullYear();
        result = result.replace(/{YEAR}/g, String(year));
        result = result.replace(/{COUNTER:(\d+)d}/g, (match, padding) => {
          return String(counter).padStart(parseInt(padding), "0");
        });
        result = result.replace(/{COUNTER}/g, String(counter).padStart(4, "0"));
        return result;
      }
      /**
       * Reset a counter to 0 (for testing/admin purposes)
       */
      static async resetCounter(type, year) {
        const counterKey = `${type}_counter_${year}`;
        console.log(`[NumberingService] RESETTING counter ${counterKey} to 0`);
        await storage.upsertSetting({
          key: counterKey,
          value: "0"
        });
      }
      /**
       * Set a counter to a specific value
       */
      static async setCounter(type, year, value) {
        const counterKey = `${type}_counter_${year}`;
        console.log(`[NumberingService] Setting counter ${counterKey} to ${value}`);
        await storage.upsertSetting({
          key: counterKey,
          value: String(value)
        });
      }
      /**
       * Get current counter value without incrementing
       */
      static async getCounter(type, year) {
        const counterKey = `${type}_counter_${year}`;
        const setting = await storage.getSetting(counterKey);
        const value = setting ? parseInt(setting.value || "0", 10) : 0;
        console.log(`[NumberingService] Current ${counterKey} = ${value}`);
        return value;
      }
    };
  }
});

// server/serial-number-service.ts
var serial_number_service_exports = {};
__export(serial_number_service_exports, {
  canEditSerialNumbers: () => canEditSerialNumbers,
  getSerialTraceability: () => getSerialTraceability,
  logSerialNumberChange: () => logSerialNumberChange,
  validateSerialNumbers: () => validateSerialNumbers
});
import { eq as eq6, and as and4, sql as sql6 } from "drizzle-orm";
async function validateSerialNumbers(invoiceId, invoiceItemId, serials, expectedQuantity, options = {
  checkInvoiceScope: true,
  checkQuoteScope: true,
  checkSystemWide: true
}) {
  const errors = [];
  const emptySerials = serials.filter((s) => !s || s.trim().length === 0);
  if (emptySerials.length > 0) {
    errors.push({
      type: "empty_serial",
      message: "Empty serial numbers are not allowed"
    });
  }
  const validSerials = serials.filter((s) => s && s.trim().length > 0);
  if (validSerials.length !== expectedQuantity) {
    errors.push({
      type: "count_mismatch",
      message: `Expected ${expectedQuantity} serial numbers, but received ${validSerials.length}`
    });
  }
  const duplicatesInList = validSerials.filter(
    (serial2, index2) => validSerials.indexOf(serial2) !== index2
  );
  const uniqueDuplicatesInList = Array.from(new Set(duplicatesInList));
  if (uniqueDuplicatesInList.length > 0) {
    errors.push({
      type: "duplicate_in_invoice",
      message: `Duplicate serial numbers in submission`,
      affectedSerials: uniqueDuplicatesInList
    });
  }
  if (options.checkInvoiceScope) {
    const invoiceItemsList = await db.select().from(invoiceItems).where(
      and4(
        eq6(invoiceItems.invoiceId, invoiceId),
        sql6`${invoiceItems.id} != ${invoiceItemId}`
      )
    );
    const existingSerialsInInvoice = [];
    for (const item of invoiceItemsList) {
      if (item.serialNumbers) {
        try {
          const itemSerials = JSON.parse(item.serialNumbers);
          existingSerialsInInvoice.push(...itemSerials);
        } catch (e) {
        }
      }
    }
    const duplicatesInInvoice = validSerials.filter(
      (s) => existingSerialsInInvoice.includes(s)
    );
    if (duplicatesInInvoice.length > 0) {
      errors.push({
        type: "duplicate_in_invoice",
        message: "Serial numbers already used in this invoice",
        affectedSerials: duplicatesInInvoice
      });
    }
  }
  if (options.checkQuoteScope) {
    const invoice = await db.select().from(invoices).where(eq6(invoices.id, invoiceId)).limit(1);
    if (invoice.length > 0) {
      const quoteId = invoice[0].quoteId;
      if (quoteId) {
        const relatedInvoices = await db.select().from(invoices).where(
          and4(
            eq6(invoices.quoteId, quoteId),
            sql6`${invoices.id} != ${invoiceId}`
          )
        );
        const existingSerialsInQuote = [];
        for (const relInvoice of relatedInvoices) {
          const items = await db.select().from(invoiceItems).where(eq6(invoiceItems.invoiceId, relInvoice.id));
          for (const item of items) {
            if (item.serialNumbers) {
              try {
                const itemSerials = JSON.parse(item.serialNumbers);
                existingSerialsInQuote.push(...itemSerials);
              } catch (e) {
              }
            }
          }
        }
        const duplicatesInQuote = validSerials.filter(
          (s) => existingSerialsInQuote.includes(s)
        );
        if (duplicatesInQuote.length > 0) {
          errors.push({
            type: "duplicate_in_quote",
            message: "Serial numbers already used in other invoices for this quote",
            affectedSerials: duplicatesInQuote
          });
        }
      }
    }
  }
  if (options.checkSystemWide) {
    const existingSerials = await db.select({ serialNumber: serialNumbers.serialNumber }).from(serialNumbers).where(
      sql6`${serialNumbers.serialNumber} IN (${sql6.join(validSerials.map((s) => sql6`${s}`), sql6`, `)})`
    );
    const duplicatesInSystem = existingSerials.map((s) => s.serialNumber);
    if (duplicatesInSystem.length > 0) {
      errors.push({
        type: "duplicate_in_system",
        message: "Serial numbers already exist in the system",
        affectedSerials: duplicatesInSystem
      });
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
async function getSerialTraceability(serialNumberValue) {
  console.log("[Serial Traceability] Searching for:", serialNumberValue);
  const [serial2] = await db.select().from(serialNumbers).where(eq6(serialNumbers.serialNumber, serialNumberValue)).limit(1);
  if (serial2) {
    console.log("[Serial Traceability] Found in serialNumbers table:", serial2.id);
    const invoice = serial2.invoiceId ? await db.select().from(invoices).where(eq6(invoices.id, serial2.invoiceId)).limit(1) : [];
    if (invoice.length === 0) {
      console.log("[Serial Traceability] No invoice found for serial");
      return null;
    }
    const quote = invoice[0].quoteId ? await db.select().from(quotes).where(eq6(quotes.id, invoice[0].quoteId)).limit(1) : [];
    const customer = quote.length > 0 ? await db.select().from(clients).where(eq6(clients.id, quote[0].clientId)).limit(1) : [];
    const salesOrder = invoice[0].salesOrderId ? await db.select().from(salesOrders).where(eq6(salesOrders.id, invoice[0].salesOrderId)).limit(1) : [];
    const invoiceItem = serial2.invoiceItemId ? await db.select().from(invoiceItems).where(eq6(invoiceItems.id, serial2.invoiceItemId)).limit(1) : [];
    const history = await db.select({
      action: activityLogs.action,
      userId: activityLogs.userId,
      timestamp: activityLogs.timestamp
    }).from(activityLogs).where(
      and4(
        eq6(activityLogs.entityType, "serial_number"),
        eq6(activityLogs.entityId, serial2.id)
      )
    ).orderBy(activityLogs.timestamp);
    const historyWithUsers = await Promise.all(
      history.map(async (h) => {
        const user = await db.select().from(users).where(eq6(users.id, h.userId)).limit(1);
        return {
          action: h.action,
          user: user.length > 0 ? user[0].name : "Unknown",
          timestamp: h.timestamp.toISOString()
        };
      })
    );
    return {
      serialNumber: serial2.serialNumber,
      status: serial2.status || "unknown",
      customer: customer.length > 0 ? {
        id: customer[0].id,
        name: customer[0].name,
        email: customer[0].email
      } : {
        id: "",
        name: "Unknown",
        email: ""
      },
      quote: quote.length > 0 ? {
        id: quote[0].id,
        quoteNumber: quote[0].quoteNumber
      } : {
        id: "",
        quoteNumber: "Unknown"
      },
      salesOrder: salesOrder.length > 0 ? {
        id: salesOrder[0].id,
        orderNumber: salesOrder[0].orderNumber
      } : void 0,
      invoice: {
        id: invoice[0].id,
        invoiceNumber: invoice[0].invoiceNumber,
        invoiceDate: invoice[0].createdAt.toISOString(),
        isMaster: invoice[0].isMaster,
        masterInvoiceId: invoice[0].parentInvoiceId || void 0
      },
      invoiceItem: invoiceItem.length > 0 ? {
        id: invoiceItem[0].id,
        description: invoiceItem[0].description,
        quantity: invoiceItem[0].quantity
      } : {
        id: "",
        description: "Unknown",
        quantity: 0
      },
      warranty: serial2.warrantyStartDate && serial2.warrantyEndDate ? {
        startDate: serial2.warrantyStartDate.toISOString(),
        endDate: serial2.warrantyEndDate.toISOString()
      } : void 0,
      location: serial2.location || void 0,
      notes: serial2.notes || void 0,
      history: historyWithUsers
    };
  }
  console.log("[Serial Traceability] Not in serialNumbers table, checking invoice items...");
  const allInvoiceItems = await db.select().from(invoiceItems);
  console.log("[Serial Traceability] Found", allInvoiceItems.length, "invoice items to check");
  for (const item of allInvoiceItems) {
    if (item.serialNumbers) {
      try {
        const itemSerials = JSON.parse(item.serialNumbers);
        if (Array.isArray(itemSerials) && itemSerials.includes(serialNumberValue)) {
          console.log("[Serial Traceability] Found in invoice item:", item.id);
          return await constructTraceabilityFromInvoiceItem(serialNumberValue, item);
        }
      } catch (e) {
        console.error("[Serial Traceability] Error parsing serialNumbers JSON for item:", item.id, e);
      }
    }
  }
  console.log("[Serial Traceability] Serial number not found anywhere");
  return null;
}
async function constructTraceabilityFromInvoiceItem(serialNumberValue, item) {
  const invoice = await db.select().from(invoices).where(eq6(invoices.id, item.invoiceId)).limit(1);
  if (invoice.length === 0) return null;
  const quote = invoice[0].quoteId ? await db.select().from(quotes).where(eq6(quotes.id, invoice[0].quoteId)).limit(1) : [];
  const customer = quote.length > 0 ? await db.select().from(clients).where(eq6(clients.id, quote[0].clientId)).limit(1) : [];
  const salesOrder = invoice[0].salesOrderId ? await db.select().from(salesOrders).where(eq6(salesOrders.id, invoice[0].salesOrderId)).limit(1) : [];
  return {
    serialNumber: serialNumberValue,
    status: "delivered",
    customer: customer.length > 0 ? {
      id: customer[0].id,
      name: customer[0].name,
      email: customer[0].email
    } : {
      id: "",
      name: "Unknown",
      email: ""
    },
    quote: quote.length > 0 ? {
      id: quote[0].id,
      quoteNumber: quote[0].quoteNumber
    } : {
      id: "",
      quoteNumber: "Unknown"
    },
    salesOrder: salesOrder.length > 0 ? {
      id: salesOrder[0].id,
      orderNumber: salesOrder[0].orderNumber
    } : void 0,
    invoice: {
      id: invoice[0].id,
      invoiceNumber: invoice[0].invoiceNumber,
      invoiceDate: invoice[0].createdAt.toISOString(),
      isMaster: invoice[0].isMaster,
      masterInvoiceId: invoice[0].parentInvoiceId || void 0
    },
    invoiceItem: {
      id: item.id,
      description: item.description,
      quantity: item.quantity
    },
    history: []
  };
}
async function logSerialNumberChange(userId, action, serialId) {
  await db.insert(activityLogs).values({
    userId,
    action: `serial_number_${action}`,
    entityType: "serial_number",
    entityId: serialId
  });
}
async function canEditSerialNumbers(userId, invoiceId) {
  const invoice = await db.select().from(invoices).where(eq6(invoices.id, invoiceId)).limit(1);
  if (invoice.length === 0) {
    return { canEdit: false, reason: "Invoice not found" };
  }
  const user = await db.select().from(users).where(eq6(users.id, userId)).limit(1);
  if (user.length === 0) {
    return { canEdit: false, reason: "User not found" };
  }
  const userRole = user[0].role;
  const invoiceStatus = invoice[0].paymentStatus;
  const masterStatus = invoice[0].masterInvoiceStatus;
  if (invoice[0].isMaster) {
    if (masterStatus === "draft") {
      return { canEdit: true };
    }
    if (masterStatus === "confirmed") {
      if (userRole === "admin" || userRole === "sales_manager") {
        return { canEdit: true };
      }
      return { canEdit: false, reason: "Only administrators and managers can edit serial numbers for confirmed master invoices" };
    }
    if (masterStatus === "locked") {
      if (userRole === "admin") {
        return { canEdit: true };
      }
      return { canEdit: false, reason: "Only administrators can edit serial numbers for locked master invoices" };
    }
  }
  if (invoiceStatus === "pending" || invoiceStatus === "partial") {
    return { canEdit: true };
  }
  if (invoiceStatus === "paid") {
    if (userRole === "admin" || userRole === "sales_manager") {
      return { canEdit: true };
    }
    return { canEdit: false, reason: "Only administrators and managers can edit serial numbers for paid invoices" };
  }
  return { canEdit: true };
}
var init_serial_number_service = __esm({
  "server/serial-number-service.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/services/document-number-migration.service.ts
var document_number_migration_service_exports = {};
__export(document_number_migration_service_exports, {
  DocumentNumberMigrationService: () => DocumentNumberMigrationService
});
var DocumentNumberMigrationService;
var init_document_number_migration_service = __esm({
  "server/services/document-number-migration.service.ts"() {
    "use strict";
    init_storage();
    init_numbering_service();
    DocumentNumberMigrationService = class {
      /**
       * Migrate all document numbers based on updated numbering schemes
       * This is called when the admin updates the numbering configuration
       */
      static async migrateAllDocumentNumbers(options) {
        const results = {
          quotes: 0,
          vendorPos: 0,
          masterInvoices: 0,
          childInvoices: 0,
          grns: 0
        };
        const errors = [];
        try {
          if (options.migrateQuotes !== false) {
            try {
              results.quotes = await this.migrateQuoteNumbers();
            } catch (error) {
              errors.push(`Failed to migrate quotes: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
          if (options.migrateVendorPos !== false) {
            try {
              results.vendorPos = await this.migrateVendorPoNumbers();
            } catch (error) {
              errors.push(`Failed to migrate vendor POs: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
          if (options.migrateMasterInvoices !== false) {
            try {
              results.masterInvoices = await this.migrateMasterInvoiceNumbers();
            } catch (error) {
              errors.push(`Failed to migrate master invoices: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
          if (options.migrateChildInvoices !== false) {
            try {
              results.childInvoices = await this.migrateChildInvoiceNumbers();
            } catch (error) {
              errors.push(`Failed to migrate child invoices: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
          if (options.migrateGrns !== false) {
            try {
              results.grns = await this.migrateGrnNumbers();
            } catch (error) {
              errors.push(`Failed to migrate GRNs: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
          return {
            success: errors.length === 0,
            migrated: results,
            errors
          };
        } catch (error) {
          return {
            success: false,
            migrated: results,
            errors: [error instanceof Error ? error.message : String(error)]
          };
        }
      }
      /**
       * Migrate all quote numbers
       * Regenerates quote numbers based on current numbering scheme
       */
      static async migrateQuoteNumbers() {
        const quotes2 = await storage.getAllQuotes();
        let migratedCount = 0;
        const sortedQuotes = quotes2.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        await this.resetCounters("quote");
        for (const quote of sortedQuotes) {
          try {
            const newQuoteNumber = await NumberingService.generateQuoteNumber();
            await storage.updateQuote(quote.id, { quoteNumber: newQuoteNumber });
            migratedCount++;
          } catch (error) {
            console.error(`Failed to migrate quote ${quote.id}:`, error);
          }
        }
        return migratedCount;
      }
      /**
       * Migrate all vendor PO numbers
       */
      static async migrateVendorPoNumbers() {
        const vendorPos = await storage.getAllVendorPos();
        let migratedCount = 0;
        const sortedPos = vendorPos.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        await this.resetCounters("vendor_po");
        for (const po of sortedPos) {
          try {
            const newPoNumber = await NumberingService.generateVendorPoNumber();
            await storage.updateVendorPo(po.id, { poNumber: newPoNumber });
            migratedCount++;
          } catch (error) {
            console.error(`Failed to migrate vendor PO ${po.id}:`, error);
          }
        }
        return migratedCount;
      }
      /**
       * Migrate all master invoice numbers
       */
      static async migrateMasterInvoiceNumbers() {
        const invoices2 = await storage.getAllInvoices();
        const masterInvoices = invoices2.filter((inv) => inv.isMaster);
        let migratedCount = 0;
        const sortedInvoices = masterInvoices.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        await this.resetCounters("master_invoice");
        for (const invoice of sortedInvoices) {
          try {
            const newInvoiceNumber = await NumberingService.generateMasterInvoiceNumber();
            await storage.updateInvoice(invoice.id, { invoiceNumber: newInvoiceNumber });
            migratedCount++;
          } catch (error) {
            console.error(`Failed to migrate master invoice ${invoice.id}:`, error);
          }
        }
        return migratedCount;
      }
      /**
       * Migrate all child invoice numbers
       */
      static async migrateChildInvoiceNumbers() {
        const invoices2 = await storage.getAllInvoices();
        const childInvoices = invoices2.filter((inv) => !inv.isMaster);
        let migratedCount = 0;
        const sortedInvoices = childInvoices.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        await this.resetCounters("child_invoice");
        for (const invoice of sortedInvoices) {
          try {
            const newInvoiceNumber = await NumberingService.generateChildInvoiceNumber();
            await storage.updateInvoice(invoice.id, { invoiceNumber: newInvoiceNumber });
            migratedCount++;
          } catch (error) {
            console.error(`Failed to migrate child invoice ${invoice.id}:`, error);
          }
        }
        return migratedCount;
      }
      /**
       * Migrate all GRN numbers
       */
      static async migrateGrnNumbers() {
        const grns = await storage.getAllGrns();
        let migratedCount = 0;
        const sortedGrns = grns.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        await this.resetCounters("grn");
        for (const grn of sortedGrns) {
          try {
            const newGrnNumber = await NumberingService.generateGrnNumber();
            await storage.updateGrn(grn.id, { grnNumber: newGrnNumber });
            migratedCount++;
          } catch (error) {
            console.error(`Failed to migrate GRN ${grn.id}:`, error);
          }
        }
        return migratedCount;
      }
      /**
       * Reset all counters for a document type
       * Clears all year-based counters (e.g., quote_counter_2024, quote_counter_2025)
       */
      static async resetCounters(docType) {
        const allSettings = await storage.getAllSettings();
        const counterKeys = allSettings.map((s) => s.key).filter((key) => key.startsWith(`${docType}_counter_`));
        for (const key of counterKeys) {
          await storage.deleteSetting(key);
        }
      }
    };
  }
});

// api/index.ts
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

// server/routes.ts
init_storage();
import { createServer } from "http";

// server/middleware.ts
init_storage();
init_cache_service();
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import jwt from "jsonwebtoken";
function getJWTSecret() {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }
  return process.env.SESSION_SECRET;
}
async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const decoded = jwt.verify(token, getJWTSecret());
    const cacheKey = `user:${decoded.id}`;
    const cachedUser = await cacheService.get(cacheKey);
    if (cachedUser) {
      if (cachedUser.status !== "active") {
        return res.status(401).json({ error: "Unauthorized" });
      }
      req.user = { id: cachedUser.id, email: cachedUser.email, role: cachedUser.role, name: cachedUser.name || "User" };
      return next();
    }
    const user = await storage.getUser(decoded.id);
    if (!user || user.status !== "active") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    await cacheService.set(cacheKey, {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      name: user.name
    }, 300);
    req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
function validateRequest(schema) {
  return async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message, details: error.errors });
      }
      return res.status(500).json({ error: "Internal validation error" });
    }
  };
}

// server/quote-workflow-routes.ts
init_storage();
init_db();
init_schema();
import { Router } from "express";
import { eq as eq2, sql as sql4 } from "drizzle-orm";

// server/permissions-middleware.ts
init_permissions_service();
init_storage();
function requirePermission(resource, action) {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const hasAccess = hasPermission(user.role, resource, action);
      if (!hasAccess) {
        await storage.createActivityLog({
          userId: user.id,
          action: `unauthorized_${action}_${resource}`,
          entityType: resource,
          entityId: null
        });
        return res.status(403).json({
          error: "Forbidden",
          message: `You don't have permission to ${action} ${resource}`,
          requiredPermission: { resource, action }
        });
      }
      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({ error: "Permission check failed" });
    }
  };
}

// server/quote-workflow-routes.ts
init_permissions_service();

// server/feature-flags-middleware.ts
init_feature_flags();
function requireFeature(feature) {
  return (req, res, next) => {
    if (!isFeatureEnabled(feature)) {
      return res.status(404).json({
        error: "Feature not available",
        message: `The ${feature} feature is currently disabled`
      });
    }
    next();
  };
}

// server/quote-workflow-routes.ts
init_feature_flags();
init_numbering_service();
import ExcelJS from "exceljs";

// server/services/invoice-pdf.service.ts
import PDFDocument from "pdfkit";
import path2 from "path";
import fs2 from "fs";

// server/services/pdf-helpers.ts
import path from "path";
import fs from "fs";
import SVGtoPDF from "svg-to-pdfkit";
async function prepareLogo(logoInput) {
  if (logoInput && logoInput.startsWith("data:image")) {
    try {
      const matches = logoInput.match(/^data:(image\/[a-zA-Z+]+);base64,/);
      const mimeType = matches ? matches[1] : "unknown";
      const base64Data = logoInput.split(",")[1];
      if (base64Data) {
        const cleanBase64 = base64Data.replace(/\s/g, "");
        return { logo: Buffer.from(cleanBase64, "base64"), mimeType };
      }
    } catch (e) {
      console.error("Failed to parse logo base64:", e);
    }
  }
  if (logoInput && !logoInput.startsWith("data:")) {
    const ext = path.extname(logoInput).toLowerCase().replace(".", "");
    let mime = "application/octet-stream";
    if (["png", "jpg", "jpeg"].includes(ext)) mime = `image/${ext}`;
    if (ext === "svg") mime = "image/svg+xml";
    return { logo: logoInput, mimeType: mime };
  }
  const p1 = path.join(process.cwd(), "client", "public", "AICERA_Logo.png");
  const p2 = path.join(process.cwd(), "client", "public", "logo.png");
  try {
    await fs.promises.access(p1, fs.constants.F_OK);
    return { logo: p1, mimeType: "image/png" };
  } catch {
    try {
      await fs.promises.access(p2, fs.constants.F_OK);
      return { logo: p2, mimeType: "image/png" };
    } catch {
    }
  }
  return { logo: "", mimeType: "" };
}
function drawLogo(doc, logo, mimeType, x, y, size) {
  if (!logo) return false;
  try {
    const isBuffer = Buffer.isBuffer(logo);
    let isSVG = mimeType.includes("svg");
    if (isBuffer && !isSVG) {
      const header = logo.subarray(0, 4).toString("hex").toUpperCase();
      if (header.includes("3C737667") || header.includes("3C3F786D")) {
        isSVG = true;
      }
    }
    if (!isBuffer && typeof logo === "string" && !isSVG) {
      if (logo.toLowerCase().endsWith(".svg")) isSVG = true;
    }
    if (isSVG) {
      let svgString = "";
      if (isBuffer) {
        svgString = logo.toString("utf-8");
      } else if (typeof logo === "string") {
        try {
          svgString = fs.readFileSync(logo, "utf-8");
        } catch (e) {
          console.error("Failed to read SVG file:", e);
          return false;
        }
      }
      if (svgString) {
        SVGtoPDF(doc, svgString, x, y, {
          width: size,
          height: size,
          preserveAspectRatio: "xMinYMin meet"
        });
        return true;
      }
    }
    doc.image(logo, x, y, { fit: [size, size] });
    return true;
  } catch (err) {
    console.error("Failed to draw logo:", err);
    return false;
  }
}

// server/services/currency-helper.ts
function formatCurrency(amount, currencyCode = "INR") {
  const num = Number(amount) || 0;
  try {
    if (currencyCode.toUpperCase() === "INR") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  } catch (error) {
    console.warn(`Invalid currency code: ${currencyCode}`, error);
    return `${currencyCode} ${num.toFixed(2)}`;
  }
}
function formatCurrencyPdf(amount, currencyCode = "INR") {
  return formatCurrency(amount, currencyCode);
}

// server/services/invoice-pdf.service.ts
var InvoicePDFService = class _InvoicePDFService {
  // A4 points
  static PAGE_WIDTH = 595.28;
  static PAGE_HEIGHT = 841.89;
  // Compact margins
  static MARGIN_LEFT = 28;
  static MARGIN_RIGHT = 28;
  static MARGIN_TOP = 22;
  static MARGIN_BOTTOM = 32;
  static CONTENT_WIDTH = _InvoicePDFService.PAGE_WIDTH - _InvoicePDFService.MARGIN_LEFT - _InvoicePDFService.MARGIN_RIGHT;
  // Palette
  static INK = "#111827";
  static SUBTLE = "#4B5563";
  static FAINT = "#6B7280";
  static LINE = "#D1D5DB";
  static SOFT = "#F3F4F6";
  // Serials
  static SERIAL_INLINE_LIMIT = 8;
  static SERIAL_APPENDIX_THRESHOLD = 12;
  // Text/layout tuning
  static TABLE_DESC_MAX_LINES = 6;
  static TABLE_SERIAL_MAX_LINES = 6;
  // ---------------------------
  // Public API
  // ---------------------------
  static async generateInvoicePDF(data, res) {
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: this.MARGIN_TOP,
        bottom: this.MARGIN_BOTTOM,
        left: this.MARGIN_LEFT,
        right: this.MARGIN_RIGHT
      },
      bufferPages: true,
      info: {
        Author: data.companyName || "Company Name"
      }
    });
    doc.pipe(res);
    await this.prepareAssets(doc, data);
    doc.lineGap(1);
    const appendix = [];
    this.drawHeader(doc, data);
    this.drawTopBlocks(doc, data);
    this.drawItemsTable(doc, data, appendix);
    this.drawFinalSections(doc, data);
    if (appendix.length > 0) {
      doc.addPage();
      this.drawHeader(doc, data);
      this.drawSerialAppendix(doc, data, appendix);
    }
    if (data.bomSection) {
      this.drawBOMSection(doc, data);
    }
    const range = doc.bufferedPageRange();
    const totalPages = range.count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      this.drawFooter(doc, i + 1, totalPages);
    }
    doc.end();
  }
  // Preload assets async-ish
  static async prepareAssets(doc, data) {
    const fontDir = path2.join(process.cwd(), "server", "pdf", "fonts");
    const regularPath = path2.join(fontDir, "Roboto-Regular.ttf");
    const boldPath = path2.join(fontDir, "Roboto-Bold.ttf");
    try {
      if (fs2.existsSync(regularPath) && fs2.existsSync(boldPath)) {
        doc.registerFont("Helvetica", regularPath);
        doc.registerFont("Helvetica-Bold", boldPath);
      }
    } catch (e) {
      console.warn("Could not register custom fonts, falling back to standard:", e);
    }
    const { logo, mimeType } = await prepareLogo(data.companyLogo);
    data.resolvedLogo = logo;
    data.logoMimeType = mimeType;
  }
  // ---------------------------
  // Geometry helpers
  // ---------------------------
  static bottomY() {
    return this.PAGE_HEIGHT - this.MARGIN_BOTTOM;
  }
  static ensureSpace(doc, data, needed) {
    if (doc.y + needed <= this.bottomY()) return;
    doc.addPage();
    this.drawHeader(doc, data);
  }
  static hr(doc, y) {
    const yy = y ?? doc.y;
    doc.save();
    doc.strokeColor(this.LINE).lineWidth(0.8);
    doc.moveTo(this.MARGIN_LEFT, yy).lineTo(this.PAGE_WIDTH - this.MARGIN_RIGHT, yy).stroke();
    doc.restore();
  }
  static hrLocal(doc, x1, x2, y, lineWidth = 0.8) {
    doc.save();
    doc.strokeColor(this.LINE).lineWidth(lineWidth);
    doc.moveTo(x1, y).lineTo(x2, y).stroke();
    doc.restore();
  }
  static box(doc, x, y, w, h, opts) {
    doc.save();
    if (opts?.fill) doc.fillColor(opts.fill).rect(x, y, w, h).fill();
    doc.strokeColor(opts?.stroke ?? this.LINE).lineWidth(opts?.lineWidth ?? 0.9).rect(x, y, w, h).stroke();
    doc.restore();
  }
  static label(doc, txt, x, y) {
    doc.save();
    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(txt.toUpperCase(), x, y, {
      characterSpacing: 0.6,
      lineBreak: false
    });
    doc.restore();
  }
  static clean(v) {
    return String(v ?? "").trim();
  }
  static safeDate(d) {
    try {
      if (!d) return "-";
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return "-";
      return dt.toLocaleDateString("en-IN");
    } catch {
      return "-";
    }
  }
  static money(v, currency = "INR") {
    return formatCurrencyPdf(v, currency);
  }
  /** For totals rows (discount etc.) */
  static moneySigned(v, currency = "INR") {
    const n = Number(v) || 0;
    if (n < 0) {
      return "-" + formatCurrencyPdf(Math.abs(n), currency);
    }
    return formatCurrencyPdf(n, currency);
  }
  static normalizeAddress(addr, maxLines = 3) {
    if (!addr) return "";
    const rawParts = String(addr).split(/\n|,/g).map((s) => s.trim()).filter(Boolean);
    const seen = /* @__PURE__ */ new Set();
    const parts = [];
    for (const p of rawParts) {
      const k = p.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      parts.push(p);
    }
    return parts.slice(0, Math.max(3, maxLines * 2)).join(", ");
  }
  static isValidEmail(email) {
    if (!email) return false;
    const e = email.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }
  static isValidPhone(phone) {
    if (!phone) return false;
    const p = phone.replace(/[^\d]/g, "");
    return p.length >= 8 && p.length <= 13;
  }
  static isValidGSTIN(gstin) {
    if (!gstin) return false;
    const g = gstin.trim().toUpperCase();
    return /^[0-9A-Z]{15}$/.test(g);
  }
  static truncateToWidth(doc, text2, maxWidth, suffix = "\u2026") {
    const s = String(text2 ?? "");
    if (!s) return "";
    if (doc.widthOfString(s) <= maxWidth) return s;
    let lo = 0;
    let hi = s.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      const cand = s.slice(0, mid) + suffix;
      if (doc.widthOfString(cand) <= maxWidth) lo = mid + 1;
      else hi = mid;
    }
    const cut = Math.max(0, lo - 1);
    return s.slice(0, cut) + suffix;
  }
  static wrapTextLines(doc, text2, width, maxLines = Infinity) {
    const t = String(text2 ?? "").replace(/\s+/g, " ").trim();
    if (!t) return [];
    if (doc.widthOfString(t) <= width) return [t];
    const words = t.split(" ");
    const lines = [];
    let line = "";
    const pushLine = (s) => {
      const trimmed = s.trim();
      if (trimmed) lines.push(trimmed);
    };
    for (const w of words) {
      if (lines.length >= maxLines) break;
      const candidate = line ? `${line} ${w}` : w;
      if (doc.widthOfString(candidate) <= width) {
        line = candidate;
      } else {
        if (line) pushLine(line);
        line = w;
      }
    }
    if (line && lines.length < maxLines) pushLine(line);
    return lines;
  }
  // ---------------------------
  // Header
  // ---------------------------
  static drawHeader(doc, data) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    const topY = doc.page.margins.top;
    const logoSize = 26;
    let logoPrinted = false;
    const logoPath = data.resolvedLogo;
    const mimeType = data.logoMimeType || "";
    if (logoPath) {
      const drawn = drawLogo(doc, logoPath, mimeType, x, topY + 12, logoSize);
      logoPrinted = drawn;
    }
    const leftX = logoPrinted ? x + logoSize + 8 : x;
    doc.font("Helvetica-Bold").fontSize(11).fillColor(this.INK);
    doc.text("TAX INVOICE", x, topY - 2, {
      width: w,
      align: "center",
      lineBreak: false
    });
    doc.font("Helvetica-Bold").fontSize(10).fillColor(this.INK);
    doc.text(data.companyName || "AICERA", leftX, topY + 12, {
      width: 300,
      lineBreak: false
    });
    const parts = [];
    if (this.isValidEmail(data.companyEmail)) parts.push(String(data.companyEmail).trim());
    if (this.isValidPhone(data.companyPhone)) parts.push(String(data.companyPhone).trim());
    if (this.isValidGSTIN(data.companyGSTIN))
      parts.push(`GSTIN: ${String(data.companyGSTIN).trim().toUpperCase()}`);
    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    if (parts.length) {
      doc.text(parts.join("  |  "), leftX, topY + 24, {
        width: 360,
        lineBreak: false
      });
    }
    const addr = this.normalizeAddress(data.companyAddress, 2);
    if (addr) {
      doc.font("Helvetica").fontSize(7).fillColor(this.SUBTLE);
      doc.text(addr, leftX, topY + 34, { width: 360 });
    }
    const rightW = 210;
    const rightX = x + w - rightW;
    doc.font("Helvetica").fontSize(7).fillColor(this.SUBTLE);
    doc.text("Invoice No.", rightX, topY + 12, {
      width: rightW,
      align: "right",
      lineBreak: false
    });
    doc.font("Helvetica-Bold").fontSize(9.6).fillColor(this.INK);
    doc.text(String(data.invoiceNumber || "-"), rightX, topY + 22, {
      width: rightW,
      align: "right",
      lineBreak: false
    });
    doc.font("Helvetica").fontSize(7).fillColor(this.SUBTLE);
    doc.text("Date", rightX, topY + 34, {
      width: rightW,
      align: "right",
      lineBreak: false
    });
    const invDate = data.invoiceDate ?? data.quote?.quoteDate;
    doc.font("Helvetica-Bold").fontSize(8.6).fillColor(this.INK);
    doc.text(this.safeDate(invDate), rightX, topY + 44, {
      width: rightW,
      align: "right",
      lineBreak: false
    });
    const minLineY = topY + 58;
    doc.y = Math.max(doc.y + 6, minLineY);
    this.hr(doc);
    doc.y += 8;
  }
  // ---------------------------
  // Top blocks
  // ---------------------------
  static drawTopBlocks(doc, data) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    const gap = 10;
    const leftW = w * 0.56;
    const rightW = w - leftW - gap;
    let startY = doc.y;
    const companyDetails = data.companyDetails || {};
    const hasCompanyDetails = companyDetails.name || companyDetails.address || companyDetails.email;
    if (hasCompanyDetails) {
      doc.font("Helvetica-Bold").fontSize(8.6);
      const compNameH = companyDetails.name ? doc.heightOfString(companyDetails.name, { width: w - 16 }) : 0;
      const companyInfo = [];
      if (companyDetails.address) companyInfo.push(String(companyDetails.address).trim());
      if (companyDetails.phone) companyInfo.push(`Ph: ${String(companyDetails.phone).trim()}`);
      if (companyDetails.gstin)
        companyInfo.push(`GSTIN: ${String(companyDetails.gstin).trim().toUpperCase()}`);
      if (data.userEmail) companyInfo.push(`Contact: ${String(data.userEmail).trim()}`);
      doc.font("Helvetica").fontSize(7.2);
      const compInfoText = companyInfo.join(" | ");
      const compInfoH = companyInfo.length ? doc.heightOfString(compInfoText, { width: w - 16 }) : 0;
      const companyBoxH = Math.max(6 + 12 + compNameH + 2 + compInfoH + 10, 56);
      this.ensureSpace(doc, data, companyBoxH + 10);
      this.box(doc, x, startY, w, companyBoxH, { fill: "#FFFFFF" });
      doc.font("Helvetica-Bold").fontSize(8.2).fillColor(this.INK);
      doc.text("From", x + 8, startY + 6, { width: w - 16 });
      let cy2 = startY + 18;
      if (companyDetails.name) {
        doc.font("Helvetica-Bold").fontSize(8.6).fillColor(this.INK);
        doc.text(companyDetails.name, x + 8, cy2, { width: w - 16 });
        cy2 += compNameH + 2;
      }
      if (companyInfo.length > 0) {
        doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
        doc.text(compInfoText, x + 8, cy2, { width: w - 16 });
      }
      startY += companyBoxH + 10;
    }
    const startY2 = startY;
    const leftX = x;
    const rightX = x + leftW + gap;
    const ship = data.client?.shippingAddress || data.client?.billingAddress;
    const bill = data.client?.billingAddress;
    const clientPhone = data.client?.phone;
    const clientEmail = data.client?.email;
    const clientGSTIN = data.client?.gstin;
    const clientName = data.client.name || "-";
    const shipAddr = this.normalizeAddress(ship, 10) || "-";
    const billAddr = this.normalizeAddress(bill, 10) || "-";
    doc.font("Helvetica-Bold").fontSize(8.6);
    const cNameH = doc.heightOfString(clientName, { width: leftW - 16 });
    doc.font("Helvetica").fontSize(7.2);
    const shipAddrH = doc.heightOfString(shipAddr, { width: leftW - 16 });
    const billAddrH = doc.heightOfString(billAddr, { width: leftW - 16 });
    const billParts = [];
    if (this.isValidPhone(clientPhone)) billParts.push(`Ph: ${String(clientPhone).trim()}`);
    if (this.isValidEmail(clientEmail)) billParts.push(`Email: ${String(clientEmail).trim()}`);
    if (this.isValidGSTIN(clientGSTIN))
      billParts.push(`GSTIN: ${String(clientGSTIN).trim().toUpperCase()}`);
    doc.font("Helvetica").fontSize(7);
    const contactText = billParts.join("  |  ");
    const contactH = billParts.length ? doc.heightOfString(contactText, { width: leftW - 16 }) : 0;
    const shipBlockH = 6 + 14 + cNameH + 2 + shipAddrH + 8;
    const billBlockH = 6 + 14 + cNameH + 2 + billAddrH + (contactH ? 6 + contactH : 0) + 8;
    const leftTotalH = shipBlockH + billBlockH;
    const rightTotalH = 20 + 6 * 18 + 10;
    const h = Math.max(leftTotalH, rightTotalH, 128);
    this.ensureSpace(doc, data, h + 10);
    this.box(doc, leftX, startY2, leftW, h, { fill: "#FFFFFF" });
    const splitY = startY2 + shipBlockH;
    this.hrLocal(doc, leftX, leftX + leftW, splitY, 0.8);
    doc.font("Helvetica-Bold").fontSize(8.2).fillColor(this.INK);
    doc.text("Consignee (Ship To)", leftX + 8, startY2 + 6, { width: leftW - 16 });
    let cy = startY2 + 20;
    doc.font("Helvetica-Bold").fontSize(8.6).fillColor(this.INK);
    doc.text(clientName, leftX + 8, cy, { width: leftW - 16 });
    cy += cNameH + 2;
    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(shipAddr, leftX + 8, cy, { width: leftW - 16 });
    const by = splitY;
    doc.font("Helvetica-Bold").fontSize(8.2).fillColor(this.INK);
    doc.text("Buyer (Bill To)", leftX + 8, by + 6, { width: leftW - 16 });
    cy = by + 20;
    doc.font("Helvetica-Bold").fontSize(8.6).fillColor(this.INK);
    doc.text(clientName, leftX + 8, cy, { width: leftW - 16 });
    cy += cNameH + 2;
    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(billAddr, leftX + 8, cy, { width: leftW - 16 });
    cy += billAddrH + 6;
    if (contactH > 0) {
      doc.font("Helvetica").fontSize(7).fillColor(this.SUBTLE);
      doc.text(contactText, leftX + 8, cy, { width: leftW - 16 });
    }
    this.box(doc, rightX, startY2, rightW, h, { fill: "#FFFFFF" });
    const kvRowH = h / 6;
    const pad = 8;
    const labelW = Math.min(88, rightW * 0.45);
    const valW = rightW - pad * 2 - labelW;
    const row = (i, label, value) => {
      const yy = startY2 + i * kvRowH;
      if (i < 5) {
        doc.save();
        doc.strokeColor(this.LINE).lineWidth(0.6);
        doc.moveTo(rightX, yy + kvRowH).lineTo(rightX + rightW, yy + kvRowH).stroke();
        doc.restore();
      }
      doc.font("Helvetica").fontSize(7).fillColor(this.SUBTLE);
      doc.text(label, rightX + pad, yy + 5, { width: labelW, lineBreak: false });
      doc.font("Helvetica-Bold").fontSize(7.6).fillColor(this.INK);
      const v = value || "-";
      doc.text(this.truncateToWidth(doc, v, valW), rightX + pad + labelW, yy + 4, {
        width: valW,
        align: "right",
        lineBreak: false
      });
    };
    const status = String(data.paymentStatus || "pending").toUpperCase();
    const quoteNo = String(data.quote?.quoteNumber || "-");
    const due = this.safeDate(data.dueDate);
    const invDate = this.safeDate(data.invoiceDate ?? data.quote?.quoteDate);
    const preparedBy = String(data.preparedBy || "-");
    const deliveryNotesStr = String(data.deliveryNotes || "").split("\n").filter((line) => !line.includes("[SHORTAGE]")).join("\n").trim();
    row(0, "Invoice Date", invDate);
    row(1, "Due Date", due);
    row(2, "PO No.", quoteNo);
    row(3, "Payment Status", status);
    row(4, "Invoice Prepared By", preparedBy);
    row(5, "Delivery Note", deliveryNotesStr);
    doc.y = startY2 + h + 10;
  }
  // ---------------------------
  // Items Table
  // ---------------------------
  static drawItemsTable(doc, data, appendix) {
    const x0 = this.MARGIN_LEFT;
    const tableW = this.CONTENT_WIDTH;
    const col = {
      sn: 24,
      desc: 260,
      hsn: 56,
      qty: 40,
      unit: 40,
      rate: 72,
      amount: 0
    };
    const fixed = col.sn + col.hsn + col.qty + col.unit + col.rate;
    col.amount = Math.max(86, tableW - fixed - col.desc);
    col.desc = Math.max(210, tableW - fixed - col.amount);
    const cx = {
      sn: x0,
      desc: x0 + col.sn,
      hsn: x0 + col.sn + col.desc,
      qty: x0 + col.sn + col.desc + col.hsn,
      unit: x0 + col.sn + col.desc + col.hsn + col.qty,
      rate: x0 + col.sn + col.desc + col.hsn + col.qty + col.unit,
      amount: x0 + col.sn + col.desc + col.hsn + col.qty + col.unit + col.rate,
      right: x0 + tableW
    };
    doc.font("Helvetica-Bold").fontSize(9.2).fillColor(this.INK);
    doc.text("Description of Goods / Services", x0, doc.y);
    doc.y += 6;
    const headerH = 22;
    const minRowH = 20;
    const drawHeader = (y2) => {
      this.box(doc, x0, y2, tableW, headerH, {
        fill: this.SOFT,
        stroke: this.LINE,
        lineWidth: 0.9
      });
      doc.save();
      doc.strokeColor(this.LINE).lineWidth(0.8);
      [cx.desc, cx.hsn, cx.qty, cx.unit, cx.rate, cx.amount].forEach((vx) => {
        doc.moveTo(vx, y2).lineTo(vx, y2 + headerH).stroke();
      });
      doc.restore();
      doc.font("Helvetica").fontSize(7).fillColor(this.SUBTLE);
      const put = (t, xx, ww, align) => {
        doc.text(t.toUpperCase(), xx, y2 + 7, {
          width: ww,
          align,
          characterSpacing: 0.6,
          lineBreak: false
        });
      };
      put("Sl", cx.sn, col.sn, "center");
      put("Description", cx.desc + 6, col.desc - 12, "left");
      put("HSN/SAC", cx.hsn, col.hsn, "center");
      put("Qty", cx.qty, col.qty, "center");
      put("Unit", cx.unit, col.unit, "center");
      put("Rate", cx.rate, col.rate - 8, "right");
      put("Amount", cx.amount, col.amount - 8, "right");
    };
    this.ensureSpace(doc, data, headerH + minRowH + 10);
    let y = doc.y;
    drawHeader(y);
    y += headerH;
    const items = data.items || [];
    if (items.length === 0) {
      this.box(doc, x0, y, tableW, 40, { fill: "#FFFFFF" });
      doc.font("Helvetica-Bold").fontSize(8).fillColor(this.SUBTLE);
      doc.text("No items.", x0, y + 14, { width: tableW, align: "center" });
      doc.y = y + 50;
      return;
    }
    for (let idx = 0; idx < items.length; idx++) {
      const it = items[idx];
      const descRaw = String(it.description ?? "").trim();
      const desc6 = descRaw || "-";
      const qty = Number(it.quantity ?? 0);
      const unit = String(it.unit ?? "pcs");
      const rate = Number(it.unitPrice ?? 0);
      const amount = Number(it.subtotal ?? qty * rate);
      const hsnSac = String(it.hsnSac ?? it.hsn_sac ?? "").trim() || "-";
      const serials = this.parseSerialNumbers(it.serialNumbers);
      const needsAppendix = serials.length > this.SERIAL_APPENDIX_THRESHOLD;
      const serialInline = serials.length ? this.serialInlineSummary(serials, needsAppendix) : "";
      doc.save();
      doc.font("Helvetica").fontSize(8).fillColor(this.INK);
      const allDescLines = this.wrapTextLines(doc, desc6, col.desc - 12, 50);
      let descLines = allDescLines;
      if (allDescLines.length > this.TABLE_DESC_MAX_LINES) {
        descLines = allDescLines.slice(0, this.TABLE_DESC_MAX_LINES);
        const last = descLines[descLines.length - 1];
        descLines[descLines.length - 1] = this.truncateToWidth(
          doc,
          `${last} \u2026`,
          col.desc - 12
        );
      }
      const descH = descLines.length * 11;
      let serialLines = [];
      let serialH = 0;
      if (serialInline) {
        doc.font("Helvetica").fontSize(6.8).fillColor(this.SUBTLE);
        const sAll = this.wrapTextLines(doc, serialInline, col.desc - 12, 50);
        serialLines = sAll.slice(0, this.TABLE_SERIAL_MAX_LINES);
        if (sAll.length > this.TABLE_SERIAL_MAX_LINES) {
          const last = serialLines[serialLines.length - 1];
          serialLines[serialLines.length - 1] = this.truncateToWidth(
            doc,
            `${last} \u2026`,
            col.desc - 12
          );
        }
        serialH = serialLines.length ? serialLines.length * 9 : 0;
      }
      doc.restore();
      const rowH = Math.max(minRowH, 8 + descH + (serialH ? serialH + 2 : 0));
      if (y + rowH > this.bottomY() - 10) {
        doc.addPage();
        this.drawHeader(doc, data);
        this.drawTopBlocks(doc, data);
        doc.font("Helvetica-Bold").fontSize(9.2).fillColor(this.INK);
        doc.text("Description of Goods / Services (cont.)", x0, doc.y);
        doc.y += 6;
        this.ensureSpace(doc, data, headerH + minRowH + 10);
        y = doc.y;
        drawHeader(y);
        y += headerH;
      }
      this.box(doc, x0, y, tableW, rowH, { fill: "#FFFFFF" });
      doc.save();
      doc.strokeColor(this.LINE).lineWidth(0.8);
      [cx.desc, cx.hsn, cx.qty, cx.unit, cx.rate, cx.amount].forEach((vx) => {
        doc.moveTo(vx, y).lineTo(vx, y + rowH).stroke();
      });
      doc.restore();
      const padY = 6;
      doc.font("Helvetica").fontSize(8).fillColor(this.INK);
      doc.text(String(idx + 1), cx.sn, y + padY, {
        width: col.sn,
        align: "center",
        lineBreak: false
      });
      let dy = y + padY;
      doc.font("Helvetica").fontSize(8).fillColor(this.INK);
      for (const ln of descLines) {
        doc.text(ln, cx.desc + 6, dy, { width: col.desc - 12, lineBreak: false });
        dy += 11;
      }
      if (serialLines.length) {
        dy += 2;
        doc.font("Helvetica").fontSize(6.8).fillColor(this.SUBTLE);
        for (const ln of serialLines) {
          doc.text(this.truncateToWidth(doc, ln, col.desc - 12), cx.desc + 6, dy, {
            width: col.desc - 12,
            lineBreak: false
          });
          dy += 9;
        }
      }
      doc.font("Helvetica").fontSize(8).fillColor(this.INK);
      doc.text(hsnSac, cx.hsn, y + padY, { width: col.hsn, align: "center", lineBreak: false });
      doc.text(String(qty), cx.qty, y + padY, { width: col.qty, align: "center", lineBreak: false });
      doc.text(unit, cx.unit, y + padY, { width: col.unit, align: "center", lineBreak: false });
      doc.text(this.money(rate, data.currency || data.quote.currency), cx.rate, y + padY, {
        width: col.rate - 8,
        align: "right",
        lineBreak: false
      });
      doc.text(this.money(amount, data.currency || data.quote.currency), cx.amount, y + padY, {
        width: col.amount - 8,
        align: "right",
        lineBreak: false
      });
      if (needsAppendix) appendix.push({ itemIndex: idx + 1, description: desc6, serials });
      y += rowH;
    }
    doc.y = y + 8;
  }
  // ---------------------------
  // Final sections
  // ---------------------------
  static drawFinalSections(doc, data) {
    const sectionMin = 190;
    this.ensureSpace(doc, data, sectionMin);
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    const gap = 10;
    const leftW = w * 0.58;
    const rightW = w - leftW - gap;
    const leftX = x;
    const rightX = x + leftW + gap;
    const subtotal = data.subtotal !== void 0 ? Number(data.subtotal) : Number(data.quote.subtotal) || 0;
    const discount = data.discount !== void 0 ? Number(data.discount) : Number(data.quote.discount) || 0;
    const shipping = data.shippingCharges !== void 0 ? Number(data.shippingCharges) : Number(data.quote.shippingCharges) || 0;
    const cgst = data.cgst !== void 0 ? Number(data.cgst) : Number(data.quote.cgst) || 0;
    const sgst = data.sgst !== void 0 ? Number(data.sgst) : Number(data.quote.sgst) || 0;
    const igst = data.igst !== void 0 ? Number(data.igst) : Number(data.quote.igst) || 0;
    const total = data.total !== void 0 ? Number(data.total) : Number(data.quote.total) || 0;
    const effectiveDiscount = Math.max(0, discount);
    const taxable = Math.max(0, subtotal - effectiveDiscount + Math.max(0, shipping));
    const totalsRows = [
      { label: "Subtotal", value: subtotal }
    ];
    if (effectiveDiscount > 0)
      totalsRows.push({ label: "Discount", value: -effectiveDiscount, signed: true });
    if (shipping > 0) totalsRows.push({ label: "Shipping/Handling", value: shipping });
    if (cgst > 0) totalsRows.push({ label: "CGST", value: cgst });
    if (sgst > 0) totalsRows.push({ label: "SGST", value: sgst });
    if (igst > 0) totalsRows.push({ label: "IGST", value: igst });
    totalsRows.push({ label: "TOTAL", value: total, bold: true });
    const words = this.amountInWords(total, data.currency || data.quote.currency);
    const notesText = String(data.notes || data.quote.notes || "").trim();
    const milestone = String(data.milestoneDescription || "").trim();
    const delivery = String(data.deliveryNotes || "").trim();
    const notesLinesRaw = [];
    if (milestone) notesLinesRaw.push(`Milestone: ${milestone}`);
    if (delivery) notesLinesRaw.push(`Delivery: ${delivery}`);
    if (notesText) notesLinesRaw.push(`Notes: ${notesText}`);
    const termsRaw = String(data.termsAndConditions || "").trim();
    const termsLines = termsRaw ? termsRaw.split("\n").map((s) => s.trim()).filter(Boolean) : [];
    doc.save();
    doc.font("Helvetica").fontSize(7.4);
    const wordsH = doc.heightOfString(words, { width: leftW - 16 });
    doc.font("Helvetica").fontSize(7.2);
    const measuredNotesLines = [];
    for (const nl of notesLinesRaw) {
      const wrapped = this.wrapTextLines(doc, nl, leftW - 16, 3);
      measuredNotesLines.push(...wrapped);
    }
    const notesH = measuredNotesLines.length ? measuredNotesLines.length * 10 : 0;
    const measuredTermsLines = [];
    for (const tl of termsLines) {
      const wrapped = this.wrapTextLines(doc, `\u2022 ${tl}`, leftW - 16, 4);
      measuredTermsLines.push(...wrapped);
    }
    const maxTermsLines = 6;
    const termsShown = measuredTermsLines.slice(0, maxTermsLines);
    const termsH = termsShown.length ? termsShown.length * 10 : 0;
    doc.restore();
    const leftH = 10 + 14 + wordsH + (notesH ? 10 + notesH : 0) + (termsH ? 10 + termsH : 0) + 10;
    const rowH = 16;
    const totalsTopPad = 22;
    const totalsBottomPad = 10;
    const taxLineH = 12;
    const totalsH = totalsTopPad + totalsRows.length * rowH + taxLineH + totalsBottomPad;
    const blockH = Math.max(leftH, totalsH);
    this.ensureSpace(doc, data, blockH + 10);
    const y0 = doc.y;
    this.box(doc, leftX, y0, leftW, blockH, { fill: "#FFFFFF" });
    this.label(doc, "Amount Chargeable (in words)", leftX + 8, y0 + 6);
    doc.font("Helvetica-Bold").fontSize(7.8).fillColor(this.INK);
    doc.text(words, leftX + 8, y0 + 20, { width: leftW - 16 });
    let ly = y0 + 20 + wordsH + 6;
    if (measuredNotesLines.length) {
      this.label(doc, "Notes", leftX + 8, ly);
      ly += 12;
      doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
      let ny = ly;
      for (const ln of measuredNotesLines.slice(0, 8)) {
        doc.text(this.truncateToWidth(doc, ln, leftW - 16), leftX + 8, ny, { width: leftW - 16 });
        ny += 10;
      }
      ly = ny + 2;
    }
    if (termsShown.length) {
      this.label(doc, "Terms & Conditions", leftX + 8, ly);
      ly += 12;
      doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
      let ty = ly;
      for (const ln of termsShown) {
        doc.text(this.truncateToWidth(doc, ln, leftW - 16), leftX + 8, ty, {
          width: leftW - 16,
          lineBreak: false
        });
        ty += 10;
      }
    }
    this.box(doc, rightX, y0, rightW, blockH, { fill: "#FFFFFF" });
    this.label(doc, "Totals", rightX + 8, y0 + 6);
    const labelW = rightW * 0.55;
    const valW = rightW - 16 - labelW;
    let ry = y0 + 22;
    totalsRows.forEach((r) => {
      doc.font("Helvetica-Bold").fontSize(7.6).fillColor(this.INK);
      doc.text(r.label, rightX + 8, ry, { width: labelW, lineBreak: false });
      doc.font("Helvetica-Bold").fontSize(r.bold ? 9 : 8).fillColor(this.INK);
      const moneyStr = r.signed ? this.moneySigned(r.value, data.currency || data.quote.currency) : this.money(r.value, data.currency || data.quote.currency);
      doc.text(moneyStr, rightX + 8 + labelW, ry - (r.bold ? 1 : 0), {
        width: valW,
        align: "right",
        lineBreak: false
      });
      ry += rowH;
    });
    const taxBits = [];
    const nbsp = "\xA0";
    taxBits.push(`Taxable: ${this.money(taxable, data.currency || data.quote.currency).replace("Rs. ", "Rs." + nbsp)}`);
    if (cgst > 0) taxBits.push(`CGST: ${this.money(cgst, data.currency || data.quote.currency).replace("Rs. ", "Rs." + nbsp)}`);
    if (sgst > 0) taxBits.push(`SGST: ${this.money(sgst, data.currency || data.quote.currency).replace("Rs. ", "Rs." + nbsp)}`);
    if (igst > 0) taxBits.push(`IGST: ${this.money(igst, data.currency || data.quote.currency).replace("Rs. ", "Rs." + nbsp)}`);
    doc.font("Helvetica").fontSize(6).fillColor(this.FAINT);
    const taxLine = this.truncateToWidth(doc, taxBits.join("  |  "), rightW - 16);
    doc.text(taxLine, rightX + 8, ry + 2, {
      width: rightW - 16,
      align: "right",
      lineBreak: false
    });
    doc.y = y0 + blockH + 10;
    this.drawDeclarationBankAndSignatures(doc, data);
  }
  static drawDeclarationBankAndSignatures(doc, data) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    const needed = 150;
    this.ensureSpace(doc, data, needed);
    const y0 = doc.y;
    const gap = 10;
    const leftW = w * 0.56;
    const rightW = w - leftW - gap;
    const h = 86;
    this.box(doc, x, y0, leftW, h, { fill: "#FFFFFF" });
    this.box(doc, x + leftW + gap, y0, rightW, h, { fill: "#FFFFFF" });
    this.label(doc, "Declaration", x + 8, y0 + 6);
    doc.font("Helvetica").fontSize(7.4).fillColor(this.SUBTLE);
    doc.text(
      "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
      x + 8,
      y0 + 20,
      { width: leftW - 16 }
    );
    this.label(doc, "Company's Bank Details for Payment", x + leftW + gap + 8, y0 + 6);
    const bankLines = [];
    if (data.bankAccountName) bankLines.push(`A/c Name: ${data.bankAccountName}`);
    if (data.bankName) bankLines.push(`Bank: ${data.bankName}`);
    if (data.bankAccountNumber) bankLines.push(`A/c No: ${data.bankAccountNumber}`);
    if (data.bankIfscCode) bankLines.push(`IFSC: ${data.bankIfscCode}`);
    if (data.bankBranch) bankLines.push(`Branch: ${data.bankBranch}`);
    if (data.bankSwiftCode) bankLines.push(`SWIFT: ${data.bankSwiftCode}`);
    doc.font("Helvetica-Bold").fontSize(7.2).fillColor(this.INK);
    doc.text(bankLines.length ? bankLines.join("\n") : "-", x + leftW + gap + 8, y0 + 20, {
      width: rightW - 16
    });
    const sigY = y0 + h + 10;
    const sigH = 62;
    this.ensureSpace(doc, data, sigH + 10);
    const colW = (w - gap) / 2;
    const leftSigX = x;
    const rightSigX = x + colW + gap;
    this.box(doc, leftSigX, sigY, colW, sigH, { fill: "#FFFFFF" });
    this.box(doc, rightSigX, sigY, colW, sigH, { fill: "#FFFFFF" });
    this.label(doc, "Client Acceptance", leftSigX + 8, sigY + 6);
    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    doc.text("Customer Seal & Signature", leftSigX + 8, sigY + 18, { width: colW - 16 });
    doc.save();
    doc.strokeColor(this.LINE).lineWidth(0.9);
    doc.moveTo(leftSigX + 8, sigY + sigH - 18).lineTo(leftSigX + colW - 8, sigY + sigH - 18).stroke();
    doc.restore();
    doc.font("Helvetica").fontSize(6.8).fillColor(this.FAINT);
    doc.text("Date:", leftSigX + 8, sigY + sigH - 14, { width: colW - 16 });
    this.label(doc, "For Company", rightSigX + 8, sigY + 6);
    const company = data.companyName || "AICERA";
    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(`For ${company}`, rightSigX + 8, sigY + 18, { width: colW - 16 });
    doc.save();
    doc.strokeColor(this.LINE).lineWidth(0.9);
    doc.moveTo(rightSigX + 8, sigY + sigH - 18).lineTo(rightSigX + colW - 8, sigY + sigH - 18).stroke();
    doc.restore();
    doc.font("Helvetica").fontSize(6.8).fillColor(this.FAINT);
    doc.text("Authorised Signatory", rightSigX + 8, sigY + sigH - 14, { width: colW - 16 });
    doc.y = sigY + sigH + 10;
    const oldY = doc.y;
    const noteY = this.bottomY() - 24;
    doc.save();
    doc.font("Helvetica").fontSize(7).fillColor(this.FAINT);
    doc.text("This is a Computer Generated Invoice", this.MARGIN_LEFT, noteY, {
      width: this.CONTENT_WIDTH,
      align: "center",
      lineBreak: false
    });
    doc.restore();
    doc.y = oldY;
  }
  // ---------------------------
  // Serial Appendix
  // ---------------------------
  static drawSerialAppendix(doc, data, appendix) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(this.INK);
    doc.text("Serial Numbers Appendix", this.MARGIN_LEFT, doc.y);
    doc.font("Helvetica").fontSize(8).fillColor(this.SUBTLE);
    doc.text("Full serial lists are provided here to keep invoice pages clean.", this.MARGIN_LEFT, doc.y + 14, {
      width: this.CONTENT_WIDTH
    });
    doc.y += 34;
    this.hr(doc);
    doc.y += 10;
    const colGap = 18;
    const colW = (this.CONTENT_WIDTH - colGap) / 2;
    const leftX = this.MARGIN_LEFT;
    const rightX = this.MARGIN_LEFT + colW + colGap;
    let col = 0;
    let x = leftX;
    let y = doc.y;
    let colTop = doc.y;
    const nextColumnOrPage = (need) => {
      if (y + need <= this.bottomY()) return;
      if (col === 0) {
        col = 1;
        x = rightX;
        y = colTop;
      } else {
        doc.addPage();
        this.drawHeader(doc, data);
        doc.font("Helvetica-Bold").fontSize(10).fillColor(this.INK);
        doc.text("Serial Numbers Appendix (cont.)", this.MARGIN_LEFT, doc.y);
        doc.y += 18;
        this.hr(doc);
        doc.y += 10;
        col = 0;
        x = leftX;
        colTop = doc.y;
        y = colTop;
      }
    };
    appendix.forEach((a) => {
      const heading = `Item ${a.itemIndex}: ${a.description}`;
      const serialText = a.serials.join(", ");
      doc.save();
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(this.INK);
      const h1 = doc.heightOfString(heading, { width: colW });
      doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
      const h2 = doc.heightOfString(serialText, { width: colW });
      doc.restore();
      nextColumnOrPage(h1 + h2 + 16);
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(this.INK);
      doc.text(heading, x, y, { width: colW });
      y += h1 + 3;
      doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
      doc.text(serialText, x, y, { width: colW });
      y += h2 + 8;
      doc.save();
      doc.strokeColor(this.LINE).lineWidth(0.7);
      doc.moveTo(x, y).lineTo(x + colW, y).stroke();
      doc.restore();
      y += 8;
    });
    doc.y = Math.max(doc.y, y);
  }
  // ---------------------------
  // BOM Section (Annexure - 1) — SAME DESIGN AS EXEC BOM
  // ---------------------------
  static drawBOMSection(doc, data) {
    if (!data.bomSection) return;
    let bom = null;
    try {
      bom = JSON.parse(data.bomSection);
    } catch (e) {
      console.error("Invalid bomSection JSON:", e);
      return;
    }
    if (!bom?.blocks || !Array.isArray(bom.blocks) || bom.blocks.length === 0) return;
    doc.addPage();
    const bottomLimit = () => this.bottomY() - 12;
    const drawAnnexureHeader = () => {
      const title = "Annexure - 1";
      const y = doc.page.margins.top;
      doc.font("Helvetica-Bold").fontSize(12).fillColor(this.INK);
      doc.text(title, this.MARGIN_LEFT, y, { width: this.CONTENT_WIDTH, align: "center" });
      doc.y = y + 22;
      this.hr(doc, doc.y);
      doc.y += 10;
    };
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    const headerH = 20;
    const minRowH = 16;
    const colModule = Math.floor(w * 0.3);
    const colQty = 44;
    const colDesc = w - colModule - colQty;
    const cx = {
      module: x,
      desc: x + colModule,
      qty: x + colModule + colDesc,
      right: x + w
    };
    const drawTableHeader = () => {
      if (doc.y + headerH > bottomLimit()) {
        doc.addPage();
        drawAnnexureHeader();
      }
      const yy = doc.y;
      this.box(doc, x, yy, w, headerH, { fill: this.SOFT, stroke: this.LINE, lineWidth: 0.9 });
      doc.save();
      doc.strokeColor(this.LINE).lineWidth(0.8);
      [cx.desc, cx.qty].forEach((vx) => doc.moveTo(vx, yy).lineTo(vx, yy + headerH).stroke());
      doc.restore();
      doc.font("Helvetica").fontSize(7).fillColor(this.SUBTLE);
      doc.text("MODULE", cx.module + 6, yy + 6, {
        width: colModule - 12,
        lineBreak: false,
        characterSpacing: 0.6
      });
      doc.text("DESCRIPTION", cx.desc + 6, yy + 6, {
        width: colDesc - 12,
        lineBreak: false,
        characterSpacing: 0.6
      });
      doc.text("QTY", cx.qty, yy + 6, {
        width: colQty - 8,
        align: "right",
        lineBreak: false,
        characterSpacing: 0.6
      });
      doc.y = yy + headerH;
    };
    const ensureAnnexureSpace = (need) => {
      if (doc.y + need <= bottomLimit()) return;
      doc.addPage();
      drawAnnexureHeader();
      drawTableHeader();
    };
    const drawBlockTitle = (title, skipEnsure = false) => {
      const h = 18;
      if (!skipEnsure) ensureAnnexureSpace(h + headerH + minRowH);
      const yy = doc.y;
      this.box(doc, x, yy, w, h, { fill: "#FFFFFF" });
      doc.font("Helvetica-Bold").fontSize(8.2).fillColor(this.SUBTLE);
      doc.text(this.truncateToWidth(doc, title, w - 12, "\u2026"), x + 6, yy + 5, {
        width: w - 12,
        lineBreak: false
      });
      doc.y = yy + h;
    };
    const drawSectionLabel = (label) => {
      const h = 16;
      ensureAnnexureSpace(h + minRowH);
      const yy = doc.y;
      this.box(doc, x, yy, w, h, { fill: "#FFFFFF" });
      doc.font("Helvetica").fontSize(7.4).fillColor(this.SUBTLE);
      doc.text(this.truncateToWidth(doc, label, w - 24, "\u2026"), x + 12, yy + 4, {
        width: w - 24,
        lineBreak: false
      });
      doc.y = yy + h;
    };
    const drawItemRow = (moduleTxt, descTxt, qtyTxt) => {
      doc.font("Helvetica").fontSize(7.2);
      const descLines = this.wrapTextLines(doc, descTxt, colDesc - 12, 2);
      const rowH = Math.max(minRowH, 6 + descLines.length * 9);
      ensureAnnexureSpace(rowH);
      const yy = doc.y;
      this.box(doc, x, yy, w, rowH, { fill: "#FFFFFF" });
      doc.save();
      doc.strokeColor(this.LINE).lineWidth(0.8);
      [cx.desc, cx.qty].forEach((vx) => doc.moveTo(vx, yy).lineTo(vx, yy + rowH).stroke());
      doc.restore();
      doc.font("Helvetica").fontSize(7.2).fillColor(this.INK);
      doc.text(this.truncateToWidth(doc, moduleTxt, colModule - 12, "\u2026"), cx.module + 6, yy + 5, {
        width: colModule - 12,
        lineBreak: false
      });
      let dy = yy + 5;
      for (const ln of descLines) {
        doc.text(this.truncateToWidth(doc, ln, colDesc - 12, "\u2026"), cx.desc + 6, dy, {
          width: colDesc - 12,
          lineBreak: false
        });
        dy += 9;
      }
      doc.font("Helvetica-Bold").fontSize(7.2).fillColor(this.INK);
      doc.text(qtyTxt, cx.qty, yy + Math.floor((rowH - 9) / 2), {
        width: colQty - 8,
        align: "right",
        lineBreak: false
      });
      doc.y = yy + rowH;
    };
    drawAnnexureHeader();
    drawTableHeader();
    let currentBlockTitle = null;
    const guardedEnsure = (need) => {
      if (doc.y + need <= bottomLimit()) return;
      doc.addPage();
      drawAnnexureHeader();
      drawTableHeader();
      if (currentBlockTitle) drawBlockTitle(currentBlockTitle, true);
    };
    for (const block of bom.blocks) {
      currentBlockTitle = this.clean(block.title || "BOM");
      guardedEnsure(28);
      drawBlockTitle(currentBlockTitle);
      for (const sec of block.sections || []) {
        const selectedItems = (sec.items || []).filter((it) => it?.selected !== false);
        if (selectedItems.length === 0) continue;
        guardedEnsure(22);
        drawSectionLabel(this.clean(sec.label || "Section"));
        for (const item of selectedItems) {
          guardedEnsure(24);
          drawItemRow(
            this.clean(item.module || "-"),
            this.clean(item.description || "-"),
            String(item.qty ?? "")
          );
        }
        doc.y += 6;
        guardedEnsure(12);
      }
      doc.y += 6;
      guardedEnsure(12);
    }
    doc.y += 10;
  }
  // ---------------------------
  // Footer
  // ---------------------------
  static drawFooter(doc, page, total) {
    const oldY = doc.y;
    const y = this.bottomY() - 10;
    doc.save();
    doc.font("Helvetica").fontSize(7).fillColor(this.FAINT);
    doc.text(`Page ${page} of ${total}`, this.MARGIN_LEFT, y, {
      width: this.CONTENT_WIDTH,
      align: "center",
      lineBreak: false
    });
    doc.restore();
    doc.y = oldY;
  }
  // ---------------------------
  // Serials utilities
  // ---------------------------
  static parseSerialNumbers(raw) {
    if (!raw) return [];
    try {
      if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);
      if (typeof raw === "string") {
        const t = raw.trim();
        if (!t) return [];
        if (t.startsWith("[") && t.endsWith("]")) {
          const arr = JSON.parse(t);
          if (Array.isArray(arr)) return arr.map(String).map((s) => s.trim()).filter(Boolean);
        }
        return t.split(/,|\n|;/g).map((s) => s.trim()).filter(Boolean);
      }
      return [];
    } catch {
      return [];
    }
  }
  static serialInlineSummary(serials, hasAppendix) {
    if (!serials.length) return "";
    if (hasAppendix) {
      const head2 = serials.slice(0, Math.min(4, serials.length));
      const remaining2 = Math.max(0, serials.length - head2.length);
      return remaining2 > 0 ? `Serial#: ${head2.join(", ")} (+${remaining2} more \u2014 see appendix)` : `Serial#: ${head2.join(", ")}`;
    }
    if (serials.length <= this.SERIAL_INLINE_LIMIT) return `Serial#: ${serials.join(", ")}`;
    const head = serials.slice(0, 4);
    const tail = serials.slice(-2);
    const remaining = serials.length - (head.length + tail.length);
    return `Serial#: ${head.join(", ")}, \u2026, ${tail.join(", ")} (+${remaining} more)`;
  }
  // ---------------------------
  // Amount in words (INR)
  // ---------------------------
  // ---------------------------
  // Amount in words (Dynamic Currency)
  // ---------------------------
  static amountInWords(amount, currency = "INR") {
    const isINR = currency.toUpperCase() === "INR";
    const n = Number(amount) || 0;
    const integerPart = Math.floor(Math.abs(n));
    const decimalPart = Math.round((Math.abs(n) - integerPart) * 100);
    let mainText = "";
    if (isINR) {
      mainText = this.numberToWordsIndian(integerPart);
    } else {
      mainText = this.numberToWordsInternational(integerPart);
    }
    let decimalText = "";
    if (decimalPart > 0) {
      if (isINR) {
        decimalText = ` and ${this.numberToWordsIndian(decimalPart)} Paise`;
      } else {
        decimalText = ` and ${this.numberToWordsInternational(decimalPart)} Cents`;
      }
    }
    return `${currency} ${mainText}${decimalText} Only`;
  }
  // Indian Numbering System (Lakhs/Crores)
  static numberToWordsIndian(num) {
    const n = Math.floor(Math.abs(num));
    if (n === 0) return "Zero";
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const twoDigits = (x) => {
      if (x < 20) return ones[x];
      const t = Math.floor(x / 10);
      const o = x % 10;
      return `${tens[t]}${o ? " " + ones[o] : ""}`.trim();
    };
    const threeDigits = (x) => {
      const h = Math.floor(x / 100);
      const r = x % 100;
      let s = "";
      if (h) s += `${ones[h]} Hundred`;
      if (r) s += `${h ? " " : ""}${twoDigits(r)}`;
      return s.trim();
    };
    const parts = [];
    const crore = Math.floor(n / 1e7);
    const lakh = Math.floor(n / 1e5 % 100);
    const thousand = Math.floor(n / 1e3 % 100);
    const hundredPart = n % 1e3;
    if (crore) parts.push(`${twoDigits(crore)} Crore`);
    if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
    if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
    if (hundredPart) parts.push(threeDigits(hundredPart));
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }
  // International Numbering System (Millions/Billions)
  static numberToWordsInternational(num) {
    const n = Math.floor(Math.abs(num));
    if (n === 0) return "Zero";
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const twoDigits = (x) => {
      if (x < 20) return ones[x];
      const t = Math.floor(x / 10);
      const o = x % 10;
      return `${tens[t]}${o ? " " + ones[o] : ""}`.trim();
    };
    const threeDigits = (x) => {
      const h = Math.floor(x / 100);
      const r = x % 100;
      let s = "";
      if (h) s += `${ones[h]} Hundred`;
      if (r) s += `${h ? " " : ""}${twoDigits(r)}`;
      return s.trim();
    };
    const parts = [];
    const billion = Math.floor(n / 1e9);
    const million = Math.floor(n / 1e6 % 1e3);
    const thousand = Math.floor(n / 1e3 % 1e3);
    const hundredPart = n % 1e3;
    if (billion) parts.push(`${threeDigits(billion)} Billion`);
    if (million) parts.push(`${threeDigits(million)} Million`);
    if (thousand) parts.push(`${threeDigits(thousand)} Thousand`);
    if (hundredPart) parts.push(threeDigits(hundredPart));
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }
};

// server/services/sales-order-pdf.service.ts
init_feature_flags();
import PDFDocument2 from "pdfkit";
import path3 from "path";
import fs3 from "fs";
var SalesOrderPDFService = class _SalesOrderPDFService {
  // A4 points
  static PAGE_WIDTH = 595.28;
  static PAGE_HEIGHT = 841.89;
  // Compact margins
  static MARGIN_LEFT = 40;
  static MARGIN_RIGHT = 40;
  static MARGIN_TOP = 40;
  static MARGIN_BOTTOM = 40;
  static CONTENT_WIDTH = _SalesOrderPDFService.PAGE_WIDTH - _SalesOrderPDFService.MARGIN_LEFT - _SalesOrderPDFService.MARGIN_RIGHT;
  // Palette
  static INK = "#111827";
  static SUBTLE = "#4B5563";
  static FAINT = "#6B7280";
  static LINE = "#D1D5DB";
  static SOFT = "#F3F4F6";
  // Serials
  static SERIAL_INLINE_LIMIT = 8;
  static SERIAL_APPENDIX_THRESHOLD = 12;
  // ---------------------------
  // Public API
  // ---------------------------
  static async generateSalesOrderPDF(data, res) {
    if (!isFeatureEnabled("sales_orders_module")) {
      throw new Error("Sales Orders module is disabled");
    }
    const doc = new PDFDocument2({
      size: "A4",
      margin: 0,
      bufferPages: true
    });
    doc.pipe(res);
    await this.prepareAssets(doc, data);
    this.drawHeader(doc, data);
    this.drawTopBlocks(doc, data);
    const appendix = this.drawItemsTable(doc, data);
    this.drawFinalSections(doc, data);
    if (appendix.length) {
      doc.addPage();
      this.drawHeader(doc, data);
      this.drawSerialAppendix(doc, data, appendix);
    }
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      this.drawFooter(doc, i + 1, range.count);
    }
    doc.end();
  }
  // Preload assets async
  static async prepareAssets(doc, data) {
    const fontDir = path3.join(process.cwd(), "server", "pdf", "fonts");
    const regularPath = path3.join(fontDir, "Roboto-Regular.ttf");
    const boldPath = path3.join(fontDir, "Roboto-Bold.ttf");
    try {
      if (fs3.existsSync(regularPath) && fs3.existsSync(boldPath)) {
        doc.registerFont("Helvetica", regularPath);
        doc.registerFont("Helvetica-Bold", boldPath);
      }
    } catch (e) {
    }
    const { logo, mimeType } = await prepareLogo(data.companyLogo);
    data.resolvedLogo = logo;
    data.logoMimeType = mimeType;
  }
  // ---------------------------
  // Geometry helpers
  // ---------------------------
  static bottomY() {
    return this.PAGE_HEIGHT - this.MARGIN_BOTTOM;
  }
  static ensureSpace(doc, data, needed) {
    if (doc.y + needed <= this.bottomY()) return;
    doc.addPage();
    this.drawHeader(doc, data);
  }
  static hr(doc, y) {
    const yy = y ?? doc.y;
    doc.save();
    doc.strokeColor(this.LINE).lineWidth(0.8);
    doc.moveTo(this.MARGIN_LEFT, yy).lineTo(this.PAGE_WIDTH - this.MARGIN_RIGHT, yy).stroke();
    doc.restore();
  }
  static box(doc, x, y, w, h, opts) {
    doc.save();
    if (opts?.fill) doc.fillColor(opts.fill).rect(x, y, w, h).fill();
    doc.strokeColor(opts?.stroke ?? this.LINE).lineWidth(opts?.lineWidth ?? 0.9).rect(x, y, w, h).stroke();
    doc.restore();
  }
  static label(doc, txt, x, y) {
    doc.save();
    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(txt.toUpperCase(), x, y, {
      characterSpacing: 0.6,
      lineBreak: false
    });
    doc.restore();
  }
  static safeDate(d) {
    try {
      if (!d) return "-";
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return "-";
      return dt.toLocaleDateString("en-IN");
    } catch {
      return "-";
    }
  }
  static money(v, currency = "INR") {
    return formatCurrencyPdf(v, currency);
  }
  /** For totals rows (discount etc.) */
  static moneySigned(v, currency = "INR") {
    const n = Number(v) || 0;
    if (n < 0) {
      return "-" + formatCurrencyPdf(Math.abs(n), currency);
    }
    return formatCurrencyPdf(n, currency);
  }
  static normalizeAddress(addr, maxLines = 3) {
    if (!addr) return "";
    const rawParts = String(addr).split(/\n|,/g).map((s) => s.trim()).filter(Boolean);
    const seen = /* @__PURE__ */ new Set();
    const parts = [];
    for (const p of rawParts) {
      const k = p.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      parts.push(p);
    }
    return parts.slice(0, Math.max(3, maxLines * 2)).join(", ");
  }
  static isValidEmail(email) {
    if (!email) return false;
    const e = email.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }
  static isValidPhone(phone) {
    if (!phone) return false;
    const p = phone.replace(/[^\d]/g, "");
    return p.length >= 8 && p.length <= 13;
  }
  static isValidGSTIN(gstin) {
    if (!gstin) return false;
    const g = gstin.trim().toUpperCase();
    return /^[0-9A-Z]{15}$/.test(g);
  }
  static truncateToWidth(doc, text2, maxWidth, suffix = "\u2026") {
    const s = String(text2 ?? "");
    if (!s) return "";
    if (doc.widthOfString(s) <= maxWidth) return s;
    let lo = 0;
    let hi = s.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      const cand = s.slice(0, mid) + suffix;
      if (doc.widthOfString(cand) <= maxWidth) lo = mid + 1;
      else hi = mid;
    }
    const cut = Math.max(0, lo - 1);
    return s.slice(0, cut) + suffix;
  }
  static wrapTextLines(doc, text2, width, maxLines = Infinity) {
    const t = String(text2 ?? "").replace(/\s+/g, " ").trim();
    if (!t) return [];
    if (doc.widthOfString(t) <= width) return [t];
    const words = t.split(" ");
    const lines = [];
    let line = "";
    const pushLine = (s) => {
      const trimmed = s.trim();
      if (trimmed) lines.push(trimmed);
    };
    for (const w of words) {
      if (lines.length >= maxLines) break;
      const candidate = line ? `${line} ${w}` : w;
      if (doc.widthOfString(candidate) <= width) {
        line = candidate;
      } else {
        if (line) pushLine(line);
        line = w;
      }
    }
    if (line && lines.length < maxLines) pushLine(line);
    return lines;
  }
  // ---------------------------
  // Header (compact + professional)
  // ---------------------------
  static drawHeader(doc, data) {
    const x = this.MARGIN_LEFT;
    const topY = this.MARGIN_TOP;
    const rightColW = 160;
    const rightColX = this.MARGIN_LEFT + this.CONTENT_WIDTH - rightColW;
    const infoY = topY + 45;
    this.box(doc, rightColX, infoY, rightColW, 60, {
      fill: "#F8FAFC",
      stroke: this.LINE
    });
    const labelX = rightColX + 10;
    const valX = rightColX + 80;
    let cY = infoY + 10;
    this.label(doc, "Order #", labelX, cY);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(this.INK);
    doc.text(data.orderNumber, valX, cY);
    cY += 16;
    this.label(doc, "Date", labelX, cY);
    doc.font("Helvetica").fontSize(9).fillColor(this.INK);
    doc.text(new Date(data.orderDate).toLocaleDateString("en-IN"), valX, cY);
    cY += 16;
    if (data.expectedDeliveryDate) {
      this.label(doc, "Due Date", labelX, cY);
      doc.font("Helvetica").fontSize(9).fillColor(this.INK);
      doc.text(new Date(data.expectedDeliveryDate).toLocaleDateString("en-IN"), valX, cY);
    }
    doc.font("Helvetica-Bold").fontSize(16).fillColor(this.INK);
    doc.text("SALES ORDER", this.MARGIN_LEFT, topY, {
      width: this.CONTENT_WIDTH,
      align: "right"
    });
    const leftMaxW = this.CONTENT_WIDTH - rightColW - 20;
    let logoBottomY = topY;
    const logoPath = data.resolvedLogo;
    const mimeType = data.logoMimeType || "";
    let logoPrinted = false;
    const logoSize = 50;
    if (logoPath) {
      const drawn = drawLogo(doc, logoPath, mimeType, x, topY, logoSize);
      logoPrinted = drawn;
    }
    if (logoPrinted) logoBottomY = topY + logoSize + 10;
    let currentLeftY = Math.max(logoBottomY, topY + 10);
    doc.font("Helvetica-Bold").fontSize(14).fillColor(this.INK);
    doc.text(data.companyName, x, currentLeftY, { width: leftMaxW });
    currentLeftY = doc.y + 4;
    doc.font("Helvetica").fontSize(9).fillColor(this.SUBTLE);
    doc.text(this.normalizeAddress(data.companyAddress, 3), x, currentLeftY, {
      width: leftMaxW
    });
    currentLeftY = doc.y + 6;
    const contactParts = [];
    if (this.isValidPhone(data.companyPhone)) contactParts.push(`Phone: ${data.companyPhone}`);
    if (this.isValidEmail(data.companyEmail)) contactParts.push(`Email: ${data.companyEmail}`);
    if (data.companyWebsite) contactParts.push(`Web: ${data.companyWebsite}`);
    if (this.isValidGSTIN(data.companyGSTIN)) contactParts.push(`GSTIN: ${data.companyGSTIN}`);
    if (contactParts.length > 0) {
      doc.text(contactParts.join(" | "), x, currentLeftY, { width: leftMaxW });
      currentLeftY = doc.y;
    }
    const contentBottom = Math.max(currentLeftY, infoY + 60);
    doc.y = contentBottom + 15;
    this.hr(doc);
    doc.y += 15;
  }
  // ---------------------------
  // Top blocks: Bill/Ship + meta (grid)
  // ---------------------------
  static drawTopBlocks(doc, data) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    const gap = 10;
    const leftW = w * 0.56;
    const rightW = w - leftW - gap;
    let startY = doc.y;
    const startY2 = startY;
    const leftX = x;
    const rightX = x + leftW + gap;
    const ship = data.client?.shippingAddress || data.client?.billingAddress;
    const bill = data.client?.billingAddress;
    const clientPhone = data.client?.phone;
    const clientEmail = data.client?.email;
    const clientGSTIN = data.client?.gstin;
    const clientName = data.client.name || "-";
    const shipAddr = this.normalizeAddress(ship, 10) || "-";
    const billAddr = this.normalizeAddress(bill, 10) || "-";
    doc.font("Helvetica-Bold").fontSize(8.6);
    const cNameH = doc.heightOfString(clientName, { width: leftW - 16 });
    doc.font("Helvetica").fontSize(7.2);
    const shipAddrH = doc.heightOfString(shipAddr, { width: leftW - 16 });
    const billAddrH = doc.heightOfString(billAddr, { width: leftW - 16 });
    const billParts = [];
    if (this.isValidPhone(clientPhone)) billParts.push(`Ph: ${String(clientPhone).trim()}`);
    if (this.isValidEmail(clientEmail)) billParts.push(`Email: ${String(clientEmail).trim()}`);
    if (this.isValidGSTIN(clientGSTIN))
      billParts.push(`GSTIN: ${String(clientGSTIN).trim().toUpperCase()}`);
    doc.font("Helvetica").fontSize(7);
    const contactText = billParts.join("  |  ");
    const contactH = billParts.length ? doc.heightOfString(contactText, { width: leftW - 16 }) : 0;
    const shipBlockInnerH = 14 + cNameH + 2 + shipAddrH;
    const shipBlockFullH = 6 + shipBlockInnerH + 6;
    const billBlockInnerH = 14 + cNameH + 2 + billAddrH;
    const billBlockFullH = 6 + billBlockInnerH + (contactH ? 8 + contactH : 0) + 6;
    const leftTotalH = shipBlockFullH + billBlockFullH;
    const rightTotalH = 20 + 5 * 18 + 10;
    const h = Math.max(leftTotalH, rightTotalH, 140);
    this.ensureSpace(doc, data, h + 10);
    this.box(doc, leftX, startY2, leftW, h, { fill: "#FFFFFF" });
    doc.font("Helvetica-Bold").fontSize(8.2).fillColor(this.INK);
    doc.text("Consignee (Ship To)", leftX + 8, startY2 + 6, { width: leftW - 16 });
    let cy = startY2 + 20;
    doc.font("Helvetica-Bold").fontSize(8.6).fillColor(this.INK);
    doc.text(data.client.name || "-", leftX + 8, cy, { width: leftW - 16, lineBreak: true });
    cy += cNameH + 2;
    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(shipAddr, leftX + 8, cy, { width: leftW - 16 });
    const minBillHeight = 60;
    const idealSplitY = startY2 + shipBlockFullH;
    const maxSplitY = startY2 + h - minBillHeight;
    const splitY = Math.min(idealSplitY, maxSplitY);
    doc.save();
    doc.strokeColor(this.LINE).lineWidth(0.8);
    doc.moveTo(leftX, splitY).lineTo(leftX + leftW, splitY).stroke();
    doc.restore();
    const by = splitY;
    doc.font("Helvetica-Bold").fontSize(8.2).fillColor(this.INK);
    doc.text("Buyer (Bill To)", leftX + 8, by + 6, { width: leftW - 16 });
    cy = by + 20;
    doc.font("Helvetica-Bold").fontSize(8.6).fillColor(this.INK);
    doc.text(data.client.name || "-", leftX + 8, cy, { width: leftW - 16, lineBreak: true });
    cy += cNameH + 2;
    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(billAddr, leftX + 8, cy, { width: leftW - 16 });
    if (contactH > 0) {
      const contactY = startY2 + h - contactH - 6;
      if (contactY > cy + 10) {
        doc.font("Helvetica").fontSize(7).fillColor(this.SUBTLE);
        doc.text(contactText, leftX + 8, contactY, { width: leftW - 16 });
      }
    }
    this.box(doc, rightX, startY2, rightW, h, { fill: "#FFFFFF" });
    const kvRowH = h / 5;
    const pad = 8;
    const labelW = Math.min(88, rightW * 0.45);
    const valW = rightW - pad * 2 - labelW;
    const row = (i, label, value) => {
      const yy = startY2 + i * kvRowH;
      if (i < 4) {
        doc.save();
        doc.strokeColor(this.LINE).lineWidth(0.6);
        doc.moveTo(rightX, yy + kvRowH).lineTo(rightX + rightW, yy + kvRowH).stroke();
        doc.restore();
      }
      doc.font("Helvetica").fontSize(7).fillColor(this.SUBTLE);
      doc.text(label, rightX + pad, yy + kvRowH / 2 - 4, { width: labelW, lineBreak: false });
      doc.font("Helvetica-Bold").fontSize(7.6).fillColor(this.INK);
      const v = value || "-";
      doc.text(this.truncateToWidth(doc, v, valW), rightX + pad + labelW, yy + kvRowH / 2 - 4, {
        width: valW,
        align: "right",
        lineBreak: false
      });
    };
    const orderDate = this.safeDate(data.orderDate);
    const expectedDelivery = data.expectedDeliveryDate ? this.safeDate(data.expectedDeliveryDate) : "-";
    const quoteNo = String(data.quote?.quoteNumber || "-");
    const preparedBy = String(data.companyDetails?.name || "-");
    const deliveryNotesStr = String(data.deliveryNotes || "").trim();
    row(0, "Order Date", orderDate);
    row(1, "Expected Delivery", expectedDelivery);
    row(2, "Quote No.", quoteNo);
    row(3, "Prepared By", preparedBy);
    row(4, "Delivery Note", deliveryNotesStr);
    doc.y = startY2 + h + 10;
  }
  // ---------------------------
  // Items Table (paginates) - RETURNS appendix
  // ---------------------------
  static drawItemsTable(doc, data) {
    doc.y += 20;
    let y = doc.y;
    const x0 = this.MARGIN_LEFT;
    const appendix = [];
    const tableW = this.CONTENT_WIDTH;
    const col = {
      sn: 26,
      desc: 215,
      // will be recalc'd but this is a target
      hsn: 54,
      qty: 36,
      unit: 36,
      rate: 64,
      amount: 84
      // ensures space for typical totals
    };
    const fixed = col.sn + col.hsn + col.qty + col.unit + col.rate;
    const available = tableW - fixed;
    col.amount = 84;
    col.desc = available - col.amount;
    const cx = {
      sn: x0,
      desc: x0 + col.sn,
      hsn: x0 + col.sn + col.desc,
      qty: x0 + col.sn + col.desc + col.hsn,
      unit: x0 + col.sn + col.desc + col.hsn + col.qty,
      rate: x0 + col.sn + col.desc + col.hsn + col.qty + col.unit,
      amount: x0 + col.sn + col.desc + col.hsn + col.qty + col.unit + col.rate,
      right: x0 + tableW
    };
    doc.font("Helvetica-Bold").fontSize(9.2).fillColor(this.INK);
    doc.text("Description of Goods / Services", x0, doc.y);
    doc.y += 6;
    const headerH = 22;
    const minRowH = 20;
    const drawHeader = (yy) => {
      this.box(doc, x0, yy, tableW, headerH, {
        fill: this.SOFT,
        stroke: this.LINE,
        lineWidth: 0.9
      });
      doc.save();
      doc.strokeColor(this.LINE).lineWidth(0.8);
      [cx.desc, cx.hsn, cx.qty, cx.unit, cx.rate, cx.amount].forEach((vx) => {
        doc.moveTo(vx, yy).lineTo(vx, yy + headerH).stroke();
      });
      doc.restore();
      doc.font("Helvetica").fontSize(7).fillColor(this.SUBTLE);
      const put = (t, xx, ww, align) => {
        doc.text(t.toUpperCase(), xx, yy + 7, {
          width: ww,
          align,
          characterSpacing: 0.6,
          lineBreak: false
        });
      };
      put("Sl", cx.sn, col.sn, "center");
      put("Description", cx.desc + 6, col.desc - 12, "left");
      put("HSN/SAC", cx.hsn, col.hsn, "center");
      put("Qty", cx.qty, col.qty, "center");
      put("Unit", cx.unit, col.unit, "center");
      put("Rate", cx.rate, col.rate - 8, "right");
      put("Amount", cx.amount, col.amount - 8, "right");
    };
    this.ensureSpace(doc, data, headerH + minRowH + 10);
    y = doc.y;
    drawHeader(y);
    y += headerH;
    const items = data.items || [];
    if (items.length === 0) {
      this.box(doc, x0, y, tableW, 40, { fill: "#FFFFFF" });
      doc.font("Helvetica-Bold").fontSize(8).fillColor(this.SUBTLE);
      doc.text("No items.", x0, y + 14, { width: tableW, align: "center" });
      doc.y = y + 50;
      return appendix;
    }
    for (let idx = 0; idx < items.length; idx++) {
      const it = items[idx];
      const descRaw = String(it.description ?? "").trim();
      const desc6 = descRaw || "-";
      const qty = Number(it.quantity ?? 0);
      const unit = String(it.unit ?? "pcs");
      const rate = Number(it.unitPrice ?? 0);
      const amount = Number(it.subtotal ?? qty * rate);
      const currency = data.currency || "INR";
      const hsnSac = String(it.hsnSac ?? it.hsn_sac ?? "").trim() || "-";
      const serials = this.parseSerialNumbers(it.serialNumbers);
      const needsAppendix = serials.length > this.SERIAL_APPENDIX_THRESHOLD;
      const serialInline = serials.length ? this.serialInlineSummary(serials, needsAppendix) : "";
      doc.save();
      doc.font("Helvetica").fontSize(8).fillColor(this.INK);
      const descLinesAll = this.wrapTextLines(doc, desc6, col.desc - 12, 30);
      const descLines = descLinesAll;
      const descH = descLines.length * 11;
      let serialLines = [];
      let serialH = 0;
      if (serialInline) {
        doc.font("Helvetica").fontSize(6.8).fillColor(this.SUBTLE);
        const sAll = this.wrapTextLines(doc, serialInline, col.desc - 12, 10);
        serialLines = sAll;
        serialH = serialLines.length ? serialLines.length * 9 : 0;
      }
      doc.restore();
      const rowH = Math.max(minRowH, 8 + descH + (serialH ? serialH + 2 : 0));
      if (y + rowH > this.bottomY() - 10) {
        doc.addPage();
        this.drawHeader(doc, data);
        this.drawTopBlocks(doc, data);
        doc.font("Helvetica-Bold").fontSize(9.2).fillColor(this.INK);
        doc.text("Description of Goods / Services (cont.)", x0, doc.y);
        doc.y += 6;
        this.ensureSpace(doc, data, headerH + minRowH + 10);
        y = doc.y;
        drawHeader(y);
        y += headerH;
      }
      this.box(doc, x0, y, tableW, rowH, { fill: "#FFFFFF" });
      doc.save();
      doc.strokeColor(this.LINE).lineWidth(0.8);
      [cx.desc, cx.hsn, cx.qty, cx.unit, cx.rate, cx.amount].forEach((vx) => {
        doc.moveTo(vx, y).lineTo(vx, y + rowH).stroke();
      });
      doc.restore();
      const padY = 6;
      doc.font("Helvetica").fontSize(8).fillColor(this.INK);
      doc.text(String(idx + 1), cx.sn, y + padY, {
        width: col.sn,
        align: "center",
        lineBreak: false
      });
      let dy = y + padY;
      doc.text(descLines[0] || "", cx.desc + 6, dy, { width: col.desc - 12, lineBreak: false });
      dy += 11;
      if (descLines[1]) {
        doc.text(descLines[1], cx.desc + 6, dy, { width: col.desc - 12, lineBreak: false });
        dy += 11;
      }
      if (serialLines.length) {
        dy += 2;
        doc.font("Helvetica").fontSize(6.8).fillColor(this.SUBTLE);
        for (const ln of serialLines) {
          doc.text(this.truncateToWidth(doc, ln, col.desc - 12), cx.desc + 6, dy, {
            width: col.desc - 12,
            lineBreak: false
          });
          dy += 9;
        }
      }
      doc.font("Helvetica").fontSize(8).fillColor(this.INK);
      doc.text(hsnSac, cx.hsn, y + padY, { width: col.hsn, align: "center", lineBreak: false });
      doc.text(String(qty), cx.qty, y + padY, { width: col.qty, align: "center", lineBreak: false });
      doc.text(unit, cx.unit, y + padY, { width: col.unit, align: "center", lineBreak: false });
      doc.text(this.money(rate, data.currency), cx.rate, y + padY, {
        width: col.rate - 8,
        align: "right",
        lineBreak: false
      });
      doc.text(this.money(amount, data.currency), cx.amount, y + padY, {
        width: col.amount - 8,
        align: "right",
        lineBreak: false
      });
      doc.save();
      doc.strokeColor(this.LINE).lineWidth(0.8);
      doc.moveTo(x0, y + rowH).lineTo(cx.right, y + rowH).stroke();
      doc.restore();
      if (needsAppendix) appendix.push({ itemIndex: idx + 1, description: desc6, serials });
      y += rowH;
    }
    doc.y = y + 8;
    return appendix;
  }
  // ---------------------------
  // Final sections
  // ---------------------------
  static drawFinalSections(doc, data) {
    const sectionMin = 190;
    this.ensureSpace(doc, data, sectionMin);
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    const gap = 10;
    const leftW = w * 0.58;
    const rightW = w - leftW - gap;
    const leftX = x;
    const rightX = x + leftW + gap;
    const subtotal = data.subtotal !== void 0 ? Number(data.subtotal) : Number(data.quote.subtotal) || 0;
    const discount = data.discount !== void 0 ? Number(data.discount) : Number(data.quote.discount) || 0;
    const shipping = data.shippingCharges !== void 0 ? Number(data.shippingCharges) : Number(data.quote.shippingCharges) || 0;
    const cgst = data.cgst !== void 0 ? Number(data.cgst) : Number(data.quote.cgst) || 0;
    const sgst = data.sgst !== void 0 ? Number(data.sgst) : Number(data.quote.sgst) || 0;
    const igst = data.igst !== void 0 ? Number(data.igst) : Number(data.quote.igst) || 0;
    const total = data.total !== void 0 ? Number(data.total) : Number(data.quote.total) || 0;
    const taxable = Math.max(0, subtotal - Math.max(0, discount) + Math.max(0, shipping));
    const totalsRows = [
      { label: "Subtotal", value: subtotal }
    ];
    if (shipping > 0) totalsRows.push({ label: "Shipping/Handling", value: shipping });
    if (cgst > 0) totalsRows.push({ label: "CGST", value: cgst });
    if (sgst > 0) totalsRows.push({ label: "SGST", value: sgst });
    if (igst > 0) totalsRows.push({ label: "IGST", value: igst });
    totalsRows.push({ label: "TOTAL", value: total, bold: true });
    const words = this.amountInWords(total, data.currency);
    const notesText = String(data.notes || data.quote.notes || "").trim();
    const delivery = String(data.deliveryNotes || "").trim();
    const termsRaw = String(data.termsAndConditions || "").trim();
    const termsLines = termsRaw ? termsRaw.split("\n").map((s) => s.trim()).filter(Boolean) : [];
    const termsText = termsLines.join("  \u2022  ");
    const maxTermsLines = 4;
    doc.save();
    doc.font("Helvetica").fontSize(7.4);
    const wordsH = doc.heightOfString(words, { width: leftW - 16 });
    const notesBlock = [delivery, notesText].filter(Boolean).join(" | ");
    const notesH = notesBlock ? doc.heightOfString(notesBlock, { width: leftW - 16 }) : 0;
    doc.font("Helvetica").fontSize(7.2);
    const wrappedTerms = termsText ? this.wrapTextLines(doc, termsText, leftW - 16, 50) : [];
    const termsShown = wrappedTerms.slice(0, maxTermsLines);
    const termsH = termsShown.length ? termsShown.length * 10 : 0;
    doc.restore();
    const leftH = 10 + 14 + wordsH + (notesH ? 10 + notesH : 0) + (termsH ? 10 + termsH : 0) + 10;
    const rowH = 16;
    const totalsTopPad = 22;
    const totalsBottomPad = 10;
    const taxLineH = 12;
    const totalsH = totalsTopPad + totalsRows.length * rowH + taxLineH + totalsBottomPad;
    const blockH = Math.max(leftH, totalsH);
    this.ensureSpace(doc, data, blockH + 10);
    const y0 = doc.y;
    this.box(doc, leftX, y0, leftW, blockH, { fill: "#FFFFFF" });
    this.label(doc, "Amount Chargeable (in words)", leftX + 8, y0 + 6);
    doc.font("Helvetica-Bold").fontSize(7.8).fillColor(this.INK);
    doc.text(words, leftX + 8, y0 + 20, { width: leftW - 16 });
    let ly = y0 + 20 + wordsH + 6;
    if (notesBlock) {
      this.label(doc, "Notes", leftX + 8, ly);
      ly += 12;
      doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
      doc.text(this.truncateToWidth(doc, notesBlock, leftW - 16), leftX + 8, ly, {
        width: leftW - 16
      });
      ly += notesH + 6;
    }
    if (termsShown.length) {
      this.label(doc, "Terms & Conditions", leftX + 8, ly);
      ly += 12;
      doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
      let ty = ly;
      for (const ln of termsShown) {
        doc.text(this.truncateToWidth(doc, ln, leftW - 16), leftX + 8, ty, {
          width: leftW - 16,
          lineBreak: false
        });
        ty += 10;
      }
    }
    this.box(doc, rightX, y0, rightW, blockH, { fill: "#FFFFFF" });
    this.label(doc, "Totals", rightX + 8, y0 + 6);
    const labelW = rightW * 0.55;
    const valW = rightW - 16 - labelW;
    let ry = y0 + 22;
    totalsRows.forEach((r) => {
      doc.font("Helvetica-Bold").fontSize(7.6).fillColor(this.INK);
      doc.text(r.label, rightX + 8, ry, { width: labelW, lineBreak: false });
      doc.font("Helvetica-Bold").fontSize(r.bold ? 9 : 8).fillColor(this.INK);
      const moneyStr = r.signed ? this.moneySigned(r.value, data.currency) : this.money(r.value, data.currency);
      doc.text(moneyStr, rightX + 8 + labelW, ry - (r.bold ? 1 : 0), {
        width: valW,
        align: "right",
        lineBreak: false
      });
      ry += rowH;
    });
    const taxBits = [];
    const nbsp = "\xA0";
    taxBits.push(`Taxable: ${this.money(taxable, data.currency).replace("Rs. ", "Rs." + nbsp)}`);
    if (cgst > 0) taxBits.push(`CGST: ${this.money(cgst, data.currency).replace("Rs. ", "Rs." + nbsp)}`);
    if (sgst > 0) taxBits.push(`SGST: ${this.money(sgst, data.currency).replace("Rs. ", "Rs." + nbsp)}`);
    if (igst > 0) taxBits.push(`IGST: ${this.money(igst, data.currency).replace("Rs. ", "Rs." + nbsp)}`);
    doc.font("Helvetica").fontSize(6).fillColor(this.FAINT);
    const taxLine = this.truncateToWidth(doc, taxBits.join("  |  "), rightW - 16);
    doc.text(taxLine, rightX + 8, ry + 2, { width: rightW - 16, align: "right", lineBreak: false });
    doc.y = y0 + blockH + 10;
    if (wrappedTerms.length > maxTermsLines) {
      doc.addPage();
      this.drawHeader(doc, data);
      doc.font("Helvetica-Bold").fontSize(9.2).fillColor(this.INK);
      doc.text("Terms & Conditions (cont.)", this.MARGIN_LEFT, doc.y);
      doc.y += 8;
      const cont = wrappedTerms.slice(maxTermsLines);
      doc.font("Helvetica").fontSize(8).fillColor(this.SUBTLE);
      const colW = this.CONTENT_WIDTH;
      const startY = doc.y;
      const pad = 10;
      const boxH = Math.min(520, this.bottomY() - startY - 40);
      this.box(doc, this.MARGIN_LEFT, startY, colW, boxH, { fill: "#FFFFFF" });
      let yy = startY + pad;
      for (const ln of cont) {
        if (yy + 11 > startY + boxH - pad) break;
        doc.text(ln, this.MARGIN_LEFT + pad, yy, { width: colW - pad * 2 });
        yy += 11;
      }
      doc.y = startY + boxH + 12;
    }
    this.drawDeclarationBankAndSignatures(doc, data);
  }
  static drawDeclarationBankAndSignatures(doc, data) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    const needed = 150;
    this.ensureSpace(doc, data, needed);
    const y0 = doc.y;
    const gap = 10;
    const leftW = w * 0.56;
    const rightW = w - leftW - gap;
    const h = 86;
    this.box(doc, x, y0, leftW, h, { fill: "#FFFFFF" });
    this.box(doc, x + leftW + gap, y0, rightW, h, { fill: "#FFFFFF" });
    this.label(doc, "Declaration", x + 8, y0 + 6);
    doc.font("Helvetica").fontSize(7.4).fillColor(this.SUBTLE);
    doc.text(
      "We declare that this sales order shows the actual price of the goods described and that all particulars are true and correct.",
      x + 8,
      y0 + 20,
      { width: leftW - 16 }
    );
    this.label(doc, "Company's Bank Details for Payment", x + leftW + gap + 8, y0 + 6);
    const bankLines = [];
    if (data.bankAccountName) bankLines.push(`A/c Name: ${data.bankAccountName}`);
    if (data.bankName) bankLines.push(`Bank: ${data.bankName}`);
    if (data.bankAccountNumber) bankLines.push(`A/c No: ${data.bankAccountNumber}`);
    if (data.bankIfscCode) bankLines.push(`IFSC: ${data.bankIfscCode}`);
    if (data.bankBranch) bankLines.push(`Branch: ${data.bankBranch}`);
    if (data.bankSwiftCode) bankLines.push(`SWIFT: ${data.bankSwiftCode}`);
    doc.font("Helvetica-Bold").fontSize(7.2).fillColor(this.INK);
    const bankLinesText = bankLines.length ? bankLines.join("\n") : "-";
    const bankH = doc.heightOfString(bankLinesText, { width: rightW - 16 }) + 30;
    const finalH = Math.max(h, bankH, 86);
    this.box(doc, x, y0, leftW, finalH, { fill: "#FFFFFF" });
    this.box(doc, x + leftW + gap, y0, rightW, finalH, { fill: "#FFFFFF" });
    this.label(doc, "Declaration", x + 8, y0 + 6);
    doc.font("Helvetica").fontSize(7.4).fillColor(this.SUBTLE);
    doc.text(
      "We declare that this sales order shows the actual price of the goods described and that all particulars are true and correct.",
      x + 8,
      y0 + 20,
      { width: leftW - 16 }
    );
    this.label(doc, "Company's Bank Details for Payment", x + leftW + gap + 8, y0 + 6);
    doc.font("Helvetica-Bold").fontSize(7.2).fillColor(this.INK);
    doc.text(bankLinesText, x + leftW + gap + 8, y0 + 20, { width: rightW - 16 });
    const sigY = y0 + finalH + 10;
    const sigH = 62;
    this.ensureSpace(doc, data, sigH + 10);
    const colW = (w - gap) / 2;
    const leftSigX = x;
    const rightSigX = x + colW + gap;
    this.box(doc, leftSigX, sigY, colW, sigH, { fill: "#FFFFFF" });
    this.box(doc, rightSigX, sigY, colW, sigH, { fill: "#FFFFFF" });
    this.label(doc, "Client Acceptance", leftSigX + 8, sigY + 6);
    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    doc.text("Customer Seal & Signature", leftSigX + 8, sigY + 18, { width: colW - 16 });
    doc.save();
    doc.strokeColor(this.LINE).lineWidth(0.9);
    doc.moveTo(leftSigX + 8, sigY + sigH - 18).lineTo(leftSigX + colW - 8, sigY + sigH - 18).stroke();
    doc.restore();
    doc.font("Helvetica").fontSize(6.8).fillColor(this.FAINT);
    doc.text("Date:", leftSigX + 8, sigY + sigH - 14, { width: colW - 16 });
    this.label(doc, "For Company", rightSigX + 8, sigY + 6);
    const company = data.companyName || "AICERA";
    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(`For ${company}`, rightSigX + 8, sigY + 18, { width: colW - 16 });
    doc.save();
    doc.strokeColor(this.LINE).lineWidth(0.9);
    doc.moveTo(rightSigX + 8, sigY + sigH - 18).lineTo(rightSigX + colW - 8, sigY + sigH - 18).stroke();
    doc.restore();
    doc.font("Helvetica").fontSize(6.8).fillColor(this.FAINT);
    doc.text("Authorised Signatory", rightSigX + 8, sigY + sigH - 14, { width: colW - 16 });
    doc.y = sigY + sigH + 10;
    const oldY = doc.y;
    const noteY = this.bottomY() - 24;
    doc.save();
    doc.font("Helvetica").fontSize(7).fillColor(this.FAINT);
    doc.text("This is a Computer Generated Sales Order", this.MARGIN_LEFT, noteY, {
      width: this.CONTENT_WIDTH,
      align: "center",
      lineBreak: false
    });
    doc.restore();
    doc.y = oldY;
  }
  // ---------------------------
  // Serial Appendix
  // ---------------------------
  static drawSerialAppendix(doc, data, appendix) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(this.INK);
    doc.text("Serial Numbers Appendix", this.MARGIN_LEFT, doc.y);
    doc.font("Helvetica").fontSize(8).fillColor(this.SUBTLE);
    doc.text("Full serial lists are provided here to keep sales order pages clean.", this.MARGIN_LEFT, doc.y + 14, {
      width: this.CONTENT_WIDTH
    });
    doc.y += 34;
    this.hr(doc);
    doc.y += 10;
    const colGap = 18;
    const colW = (this.CONTENT_WIDTH - colGap) / 2;
    const leftX = this.MARGIN_LEFT;
    const rightX = this.MARGIN_LEFT + colW + colGap;
    let col = 0;
    let x = leftX;
    let y = doc.y;
    let colTop = doc.y;
    const nextColumnOrPage = (need) => {
      if (y + need <= this.bottomY()) return;
      if (col === 0) {
        col = 1;
        x = rightX;
        y = colTop;
      } else {
        doc.addPage();
        this.drawHeader(doc, data);
        doc.font("Helvetica-Bold").fontSize(10).fillColor(this.INK);
        doc.text("Serial Numbers Appendix (cont.)", this.MARGIN_LEFT, doc.y);
        doc.y += 18;
        this.hr(doc);
        doc.y += 10;
        col = 0;
        x = leftX;
        colTop = doc.y;
        y = colTop;
      }
    };
    appendix.forEach((a) => {
      const heading = `Item ${a.itemIndex}: ${a.description}`;
      const serialText = a.serials.join(", ");
      doc.save();
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(this.INK);
      const h1 = doc.heightOfString(heading, { width: colW });
      doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
      const h2 = doc.heightOfString(serialText, { width: colW });
      doc.restore();
      nextColumnOrPage(h1 + h2 + 16);
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(this.INK);
      doc.text(heading, x, y, { width: colW });
      y += h1 + 3;
      doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
      doc.text(serialText, x, y, { width: colW });
      y += h2 + 8;
      doc.save();
      doc.strokeColor(this.LINE).lineWidth(0.7);
      doc.moveTo(x, y).lineTo(x + colW, y).stroke();
      doc.restore();
      y += 8;
    });
    doc.y = Math.max(doc.y, y);
  }
  // ---------------------------
  // Footer (inside margins; does not mutate doc.y)
  static drawFooter(doc, page, total) {
    const oldY = doc.y;
    const y = this.bottomY() - 10;
    doc.save();
    doc.font("Helvetica").fontSize(7).fillColor(this.FAINT);
    doc.text(`Page ${page} of ${total}`, this.MARGIN_LEFT, y, {
      width: this.CONTENT_WIDTH,
      align: "center",
      lineBreak: false
    });
    doc.restore();
    doc.y = oldY;
  }
  // ---------------------------
  // Serials utilities
  // ---------------------------
  static parseSerialNumbers(raw) {
    if (!raw) return [];
    try {
      if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);
      if (typeof raw === "string") {
        const t = raw.trim();
        if (!t) return [];
        if (t.startsWith("[") && t.endsWith("]")) {
          const arr = JSON.parse(t);
          if (Array.isArray(arr)) return arr.map(String).map((s) => s.trim()).filter(Boolean);
        }
        return t.split(/,|\n|;/g).map((s) => s.trim()).filter(Boolean);
      }
      return [];
    } catch {
      return [];
    }
  }
  static serialInlineSummary(serials, hasAppendix) {
    if (!serials.length) return "";
    if (hasAppendix) {
      const head2 = serials.slice(0, Math.min(4, serials.length));
      const remaining2 = Math.max(0, serials.length - head2.length);
      return remaining2 > 0 ? `Serial#: ${head2.join(", ")} (+${remaining2} more \u2014 see appendix)` : `Serial#: ${head2.join(", ")}`;
    }
    if (serials.length <= this.SERIAL_INLINE_LIMIT) return `Serial#: ${serials.join(", ")}`;
    const head = serials.slice(0, 4);
    const tail = serials.slice(-2);
    const remaining = serials.length - (head.length + tail.length);
    return `Serial#: ${head.join(", ")}, \u2026, ${tail.join(", ")} (+${remaining} more)`;
  }
  // ---------------------------
  // Amount in words (INR)
  // ---------------------------
  // ---------------------------
  // Amount in words (Dynamic Currency)
  // ---------------------------
  static amountInWords(amount, currency = "INR") {
    const isINR = currency.toUpperCase() === "INR";
    const n = Number(amount) || 0;
    const integerPart = Math.floor(Math.abs(n));
    const decimalPart = Math.round((Math.abs(n) - integerPart) * 100);
    let mainText = "";
    if (isINR) {
      mainText = this.numberToWordsIndian(integerPart);
    } else {
      mainText = this.numberToWordsInternational(integerPart);
    }
    let decimalText = "";
    if (decimalPart > 0) {
      if (isINR) {
        decimalText = ` and ${this.numberToWordsIndian(decimalPart)} Paise`;
      } else {
        decimalText = ` and ${this.numberToWordsInternational(decimalPart)} Cents`;
      }
    }
    return `${currency} ${mainText}${decimalText} Only`;
  }
  // Indian Numbering System (Lakhs/Crores)
  static numberToWordsIndian(num) {
    const n = Math.floor(Math.abs(num));
    if (n === 0) return "Zero";
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const twoDigits = (x) => {
      if (x < 20) return ones[x];
      const t = Math.floor(x / 10);
      const o = x % 10;
      return `${tens[t]}${o ? " " + ones[o] : ""}`.trim();
    };
    const threeDigits = (x) => {
      const h = Math.floor(x / 100);
      const r = x % 100;
      let s = "";
      if (h) s += `${ones[h]} Hundred`;
      if (r) s += `${h ? " " : ""}${twoDigits(r)}`;
      return s.trim();
    };
    const parts = [];
    const crore = Math.floor(n / 1e7);
    const lakh = Math.floor(n / 1e5 % 100);
    const thousand = Math.floor(n / 1e3 % 100);
    const hundredPart = n % 1e3;
    if (crore) parts.push(`${twoDigits(crore)} Crore`);
    if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
    if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
    if (hundredPart) parts.push(threeDigits(hundredPart));
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }
  // International Numbering System (Millions/Billions)
  static numberToWordsInternational(num) {
    const n = Math.floor(Math.abs(num));
    if (n === 0) return "Zero";
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const twoDigits = (x) => {
      if (x < 20) return ones[x];
      const t = Math.floor(x / 10);
      const o = x % 10;
      return `${tens[t]}${o ? " " + ones[o] : ""}`.trim();
    };
    const threeDigits = (x) => {
      const h = Math.floor(x / 100);
      const r = x % 100;
      let s = "";
      if (h) s += `${ones[h]} Hundred`;
      if (r) s += `${h ? " " : ""}${twoDigits(r)}`;
      return s.trim();
    };
    const parts = [];
    const billion = Math.floor(n / 1e9);
    const million = Math.floor(n / 1e6 % 1e3);
    const thousand = Math.floor(n / 1e3 % 1e3);
    const hundredPart = n % 1e3;
    if (billion) parts.push(`${threeDigits(billion)} Billion`);
    if (million) parts.push(`${threeDigits(million)} Million`);
    if (thousand) parts.push(`${threeDigits(thousand)} Thousand`);
    if (hundredPart) parts.push(threeDigits(hundredPart));
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }
};

// server/services/email.service.ts
import nodemailer from "nodemailer";
import { Resend } from "resend";
var EmailService = class {
  static transporter = null;
  static resend = null;
  static useResend = false;
  static initialize(config) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass
      }
    });
  }
  static initializeResend(apiKey) {
    this.resend = new Resend(apiKey);
    this.useResend = true;
  }
  static async getTransporter() {
    if (!this.transporter) {
      if (process.env.NODE_ENV !== "production") {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
      } else {
        throw new Error("Email service not initialized");
      }
    }
    return this.transporter;
  }
  static getResend() {
    if (!this.resend) {
      throw new Error("Resend service not initialized");
    }
    return this.resend;
  }
  static async sendPasswordResetEmail(email, resetLink) {
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
        let fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
        if (fromEmail.includes("@gmail.com")) {
          console.warn(`[Resend] Gmail domain not supported by Resend, falling back to: onboarding@resend.dev`);
          fromEmail = "onboarding@resend.dev";
        }
        await this.resend.emails.send({
          from: fromEmail,
          to: email,
          subject: "Password Reset Request",
          html: htmlContent
        });
      } else {
        const transporter = await this.getTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || "noreply@quoteprogen.com",
          to: email,
          subject: "Password Reset Request",
          html: htmlContent,
          text: `Password Reset Request

Click the link below to reset your password:
${resetLink}

This link will expire in 1 hour.`
        });
      }
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      throw error;
    }
  }
  static async sendQuoteEmail(email, emailSubject, emailBody, pdfBuffer) {
    const lines = emailBody.split("\n");
    const formattedLines = [];
    let previousWasEmpty = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === "") {
        if (!previousWasEmpty) {
          formattedLines.push("<br/>");
          previousWasEmpty = true;
        }
      } else {
        formattedLines.push(`<p style="margin: 4px 0;">${line}</p>`);
        previousWasEmpty = false;
      }
    }
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
        ${formattedLines.join("")}
      </div>
    `;
    const quoteNumberMatch = emailSubject.match(/Quote\s+([A-Z0-9-]+)/i);
    const quoteNumber = quoteNumberMatch ? quoteNumberMatch[1] : `Quote_${Date.now()}`;
    try {
      let emailSent = false;
      if (this.useResend && this.resend) {
        try {
          const base64Pdf = pdfBuffer.toString("base64");
          let fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
          if (fromEmail.includes("@gmail.com")) {
            console.warn(`[Resend] Gmail domain not supported by Resend, will try fallback`);
          } else {
            const response = await this.resend.emails.send({
              from: fromEmail,
              to: email,
              subject: emailSubject,
              html: htmlContent,
              attachments: [
                {
                  filename: `${quoteNumber}.pdf`,
                  content: base64Pdf
                }
              ]
            });
            if (response.error) {
              console.warn(`[Resend] Error sending quote email, falling back to SMTP:`, response.error);
            } else {
              console.log(`[Resend] Quote email sent successfully to ${email}`);
              emailSent = true;
            }
          }
        } catch (resendError) {
          console.warn(`[Resend] Failed to send with Resend, falling back to SMTP:`, resendError);
        }
      }
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
                contentType: "application/pdf"
              }
            ]
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
  static async sendSalesOrderEmail(email, emailSubject, emailBody, pdfBuffer) {
    const lines = emailBody.split("\n");
    const formattedLines = [];
    let previousWasEmpty = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === "") {
        if (!previousWasEmpty) {
          formattedLines.push("<br/>");
          previousWasEmpty = true;
        }
      } else {
        formattedLines.push(`<p style="margin: 4px 0;">${line}</p>`);
        previousWasEmpty = false;
      }
    }
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
        ${formattedLines.join("")}
      </div>
    `;
    const orderNumberMatch = emailSubject.match(/Order\s+([A-Z0-9-]+)/i);
    const orderNumber = orderNumberMatch ? orderNumberMatch[1] : `Order_${Date.now()}`;
    try {
      if (this.useResend && this.resend) {
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
              content: base64Pdf
            }
          ]
        });
        if (response.error) {
          console.error(`[Resend] Error sending sales order email:`, response.error);
          throw new Error(`Resend API error: ${JSON.stringify(response.error)}`);
        }
      } else {
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
              contentType: "application/pdf"
            }
          ]
        });
      }
    } catch (error) {
      console.error("Failed to send sales order email:", error);
      throw error;
    }
  }
  static async sendInvoiceEmail(email, emailSubject, emailBody, pdfBuffer) {
    const lines = emailBody.split("\n");
    const formattedLines = [];
    let previousWasEmpty = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === "") {
        if (!previousWasEmpty) {
          formattedLines.push("<br/>");
          previousWasEmpty = true;
        }
      } else {
        formattedLines.push(`<p style="margin: 4px 0;">${line}</p>`);
        previousWasEmpty = false;
      }
    }
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
        ${formattedLines.join("")}
      </div>
    `;
    const invoiceNumberMatch = emailSubject.match(/Invoice\s+([A-Z0-9-]+)/i);
    const invoiceNumber = invoiceNumberMatch ? invoiceNumberMatch[1] : `Invoice_${Date.now()}`;
    try {
      if (this.useResend && this.resend) {
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
              content: base64Pdf
            }
          ]
        });
        if (response.error) {
          console.error(`[Resend] Error sending invoice email:`, response.error);
          throw new Error(`Resend API error: ${JSON.stringify(response.error)}`);
        }
      } else {
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
              contentType: "application/pdf"
            }
          ]
        });
      }
    } catch (error) {
      console.error("Failed to send invoice email:", error);
      throw error;
    }
  }
  static async sendPaymentReminderEmail(email, emailSubject, emailBody) {
    const lines = emailBody.split("\n");
    const formattedLines = [];
    let previousWasEmpty = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === "") {
        if (!previousWasEmpty) {
          formattedLines.push("<br/>");
          previousWasEmpty = true;
        }
      } else {
        formattedLines.push(`<p style="margin: 4px 0;">${line}</p>`);
        previousWasEmpty = false;
      }
    }
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
        ${formattedLines.join("")}
      </div>
    `;
    try {
      if (this.useResend && this.resend) {
        let fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
        if (fromEmail.includes("@gmail.com")) {
          console.warn(`[Resend] Gmail domain not supported by Resend, falling back to: onboarding@resend.dev`);
          fromEmail = "onboarding@resend.dev";
        }
        const response = await this.resend.emails.send({
          from: fromEmail,
          to: email,
          subject: emailSubject,
          html: htmlContent
        });
        if (response.error) {
          console.error(`[Resend] Error sending payment reminder:`, response.error);
          throw new Error(`Resend API error: ${JSON.stringify(response.error)}`);
        }
      } else {
        const transporter = await this.getTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || "billing@quoteprogen.com",
          to: email,
          subject: emailSubject,
          html: htmlContent,
          text: emailBody
        });
      }
    } catch (error) {
      console.error("Failed to send payment reminder email:", error);
      throw error;
    }
  }
  static async sendWelcomeEmail(email, name) {
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
        let fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
        if (fromEmail.includes("@gmail.com")) {
          console.warn(`[Resend] Gmail domain not supported by Resend, falling back to: onboarding@resend.dev`);
          fromEmail = "onboarding@resend.dev";
        }
        await this.resend.emails.send({
          from: fromEmail,
          to: email,
          subject: "Welcome to QuoteProGen!",
          html: htmlContent
        });
      } else {
        const transporter = await this.getTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || "welcome@quoteprogen.com",
          to: email,
          subject: "Welcome to QuoteProGen!",
          html: htmlContent
        });
      }
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }
  }
  static async sendSubscriptionRenewedEmail(to, clientName, planName, invoiceNumber, amount, nextDate) {
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
          to,
          subject: `Subscription Renewed: ${planName}`,
          html: htmlContent
        });
      } else {
        const transporter = await this.getTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || "billing@quoteprogen.com",
          to,
          subject: `Subscription Renewed: ${planName}`,
          html: htmlContent
        });
      }
      console.log(`[EmailService] Subscription renewal email sent to ${to}`);
    } catch (error) {
      console.error("Failed to send subscription renewal email:", error);
    }
  }
  static async sendEmail(params) {
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
          text: params.text
        });
      } else {
        const transporter = await this.getTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || "noreply@quoteprogen.com",
          to: params.to,
          subject: params.subject,
          html: params.html,
          text: params.text
        });
      }
      console.log(`[EmailService] Generic email sent to ${params.to}`);
    } catch (error) {
      console.error("Failed to send generic email:", error);
      throw error;
    }
  }
};

// server/utils/financial.ts
import Decimal from "decimal.js";
Decimal.set({
  precision: 20,
  // Maximum significant digits
  rounding: Decimal.ROUND_HALF_UP,
  // Standard banking rounding
  toExpNeg: -7,
  // Never use exponential notation for small numbers
  toExpPos: 20
  // Only use exponential for very large numbers
});
function toDecimal(value) {
  if (value === null || value === void 0 || value === "") {
    return new Decimal(0);
  }
  if (value instanceof Decimal) {
    return value;
  }
  return new Decimal(value);
}
function add(...values) {
  return values.reduce((sum, val) => sum.plus(toDecimal(val)), new Decimal(0));
}
function subtract(a, b) {
  return toDecimal(a).minus(toDecimal(b));
}
function multiply(a, b) {
  return toDecimal(a).times(toDecimal(b));
}
function divide(a, b) {
  const divisor = toDecimal(b);
  if (divisor.isZero()) {
    throw new Error("Division by zero");
  }
  return toDecimal(a).dividedBy(divisor);
}
function calculateLineSubtotal(quantity, unitPrice) {
  return multiply(quantity, unitPrice);
}
function calculateSubtotal(items) {
  return items.reduce((total, item) => {
    return total.plus(calculateLineSubtotal(item.quantity, item.unitPrice));
  }, new Decimal(0));
}
function calculateTotal(params) {
  const subtotal = toDecimal(params.subtotal);
  const discount = toDecimal(params.discount);
  const shipping = toDecimal(params.shippingCharges);
  const cgst = toDecimal(params.cgst);
  const sgst = toDecimal(params.sgst);
  const igst = toDecimal(params.igst);
  return subtotal.minus(discount).plus(shipping).plus(cgst).plus(sgst).plus(igst);
}
function toMoneyString(value) {
  return toDecimal(value).toFixed(2);
}
function moneyGte(a, b) {
  return toDecimal(a).gte(toDecimal(b));
}
function moneyGt(a, b) {
  return toDecimal(a).gt(toDecimal(b));
}

// server/quote-workflow-routes.ts
init_logger();
async function streamToBuffer(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
var router = Router();
router.post(
  "/quotes/:id/revise",
  requireFeature("quotes_module"),
  requirePermission("quotes", "edit"),
  async (req, res) => {
    try {
      const quoteId = req.params.id;
      const quote = await storage.getQuote(quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      const items = await storage.getQuoteItems(quoteId);
      await storage.createQuoteVersion({
        quoteId,
        version: quote.version,
        clientId: quote.clientId,
        status: quote.status,
        validityDays: quote.validityDays,
        quoteDate: quote.quoteDate,
        validUntil: quote.validUntil,
        referenceNumber: quote.referenceNumber,
        attentionTo: quote.attentionTo,
        subtotal: quote.subtotal.toString(),
        discount: quote.discount.toString(),
        cgst: quote.cgst.toString(),
        sgst: quote.sgst.toString(),
        igst: quote.igst.toString(),
        shippingCharges: quote.shippingCharges.toString(),
        total: quote.total.toString(),
        notes: quote.notes,
        termsAndConditions: quote.termsAndConditions,
        bomSection: quote.bomSection,
        slaSection: quote.slaSection,
        timelineSection: quote.timelineSection,
        itemsSnapshot: JSON.stringify(items),
        revisionNotes: req.body.revisionNotes || `Revision from status: ${quote.status}`,
        revisedBy: req.user.id
      });
      const updatedQuote = await storage.updateQuote(quoteId, {
        status: "draft",
        version: quote.version + 1
        // Reset approval/sent fields if any? (Not explicitly in schema besides status)
      });
      await storage.createActivityLog({
        userId: req.user.id,
        action: "revise_quote",
        entityType: "quote",
        entityId: quote.id
      });
      return res.json(updatedQuote);
    } catch (error) {
      logger.error("Revise quote error:", error);
      return res.status(500).json({ error: error.message || "Failed to revise quote" });
    }
  }
);
router.post(
  "/quotes/:id/versions",
  requireFeature("quotes_module"),
  // authMiddleware is applied at mount level
  requirePermission("quotes", "edit"),
  async (req, res) => {
    try {
      const quoteId = req.params.id;
      const quote = await storage.getQuote(quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      const existingVersions = await storage.getQuoteVersions(quoteId);
      const nextVersion = existingVersions.length > 0 ? Math.max(...existingVersions.map((v) => v.version)) + 1 : 1;
      const items = await storage.getQuoteItems(quoteId);
      const version = await storage.createQuoteVersion({
        quoteId,
        version: nextVersion,
        clientId: quote.clientId,
        status: quote.status,
        validityDays: quote.validityDays,
        quoteDate: quote.quoteDate,
        validUntil: quote.validUntil,
        referenceNumber: quote.referenceNumber,
        attentionTo: quote.attentionTo,
        subtotal: quote.subtotal.toString(),
        discount: quote.discount.toString(),
        cgst: quote.cgst.toString(),
        sgst: quote.sgst.toString(),
        igst: quote.igst.toString(),
        shippingCharges: quote.shippingCharges.toString(),
        total: quote.total.toString(),
        notes: quote.notes,
        termsAndConditions: quote.termsAndConditions,
        bomSection: quote.bomSection,
        slaSection: quote.slaSection,
        timelineSection: quote.timelineSection,
        itemsSnapshot: JSON.stringify(items),
        revisionNotes: req.body.revisionNotes,
        revisedBy: req.user.id
      });
      return res.json(version);
    } catch (error) {
      logger.error("Create quote version error:", error);
      return res.status(500).json({ error: error.message || "Failed to create quote version" });
    }
  }
);
router.get(
  "/quotes/:id/versions",
  requireFeature("quotes_module"),
  requirePermission("quotes", "view"),
  async (req, res) => {
    try {
      const versions = await storage.getQuoteVersions(req.params.id);
      return res.json(versions);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch quote versions" });
    }
  }
);
router.get(
  "/quotes/:id/versions/:version",
  requireFeature("quotes_module"),
  requirePermission("quotes", "view"),
  async (req, res) => {
    try {
      const version = await storage.getQuoteVersion(req.params.id, parseInt(req.params.version));
      if (!version) {
        return res.status(404).json({ error: "Version not found" });
      }
      return res.json(version);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch version" });
    }
  }
);
router.post(
  "/quotes/:id/clone",
  requireFeature("quotes_clone"),
  requirePermission("quotes", "create"),
  async (req, res) => {
    try {
      const quoteId = req.params.id;
      const originalQuote = await storage.getQuote(quoteId);
      if (!originalQuote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      const items = await storage.getQuoteItems(quoteId);
      const quoteNumber = await NumberingService.generateQuoteNumber();
      const newQuote = await storage.createQuote({
        quoteNumber,
        clientId: originalQuote.clientId,
        templateId: originalQuote.templateId,
        status: "draft",
        validityDays: originalQuote.validityDays,
        quoteDate: /* @__PURE__ */ new Date(),
        referenceNumber: originalQuote.referenceNumber ? `Clone of ${originalQuote.quoteNumber}` : void 0,
        attentionTo: originalQuote.attentionTo,
        subtotal: originalQuote.subtotal.toString(),
        discount: originalQuote.discount.toString(),
        cgst: originalQuote.cgst.toString(),
        sgst: originalQuote.sgst.toString(),
        igst: originalQuote.igst.toString(),
        shippingCharges: originalQuote.shippingCharges.toString(),
        total: originalQuote.total.toString(),
        notes: originalQuote.notes,
        termsAndConditions: originalQuote.termsAndConditions,
        bomSection: originalQuote.bomSection,
        slaSection: originalQuote.slaSection,
        timelineSection: originalQuote.timelineSection,
        createdBy: req.user.id
      });
      for (const item of items) {
        await storage.createQuoteItem({
          quoteId: newQuote.id,
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toString(),
          subtotal: item.subtotal.toString(),
          hsnSac: item.hsnSac,
          sortOrder: item.sortOrder
        });
      }
      await storage.createActivityLog({
        userId: req.user.id,
        action: "clone_quote",
        entityType: "quote",
        entityId: newQuote.id
      });
      return res.json(newQuote);
    } catch (error) {
      logger.error("Clone quote error:", error);
      return res.status(500).json({ error: error.message || "Failed to clone quote" });
    }
  }
);
router.post(
  "/sales-orders",
  requireFeature("quotes_module"),
  requirePermission("sales_orders", "create"),
  async (req, res) => {
    try {
      const { quoteId, clientId, items, subtotal, total, bomSection, ...otherFields } = req.body;
      let baseOrderData = {};
      let orderItems = [];
      if (quoteId) {
        const quote = await storage.getQuote(quoteId);
        if (!quote) {
          return res.status(404).json({ error: "Quote not found" });
        }
        if (quote.status !== "approved") {
          return res.status(400).json({ error: "Quote must be approved before converting to a Sales Order." });
        }
        const existingOrder = await storage.getSalesOrderByQuote(quoteId);
        if (existingOrder) {
          return res.status(400).json({ error: "Sales Order already exists for this quote", id: existingOrder.id });
        }
        baseOrderData = {
          quoteId: quote.id,
          clientId: quote.clientId,
          currency: quote.currency,
          subtotal: quote.subtotal.toString(),
          discount: quote.discount.toString(),
          cgst: quote.cgst.toString(),
          sgst: quote.sgst.toString(),
          igst: quote.igst.toString(),
          shippingCharges: quote.shippingCharges.toString(),
          total: quote.total.toString(),
          notes: quote.notes,
          termsAndConditions: quote.termsAndConditions,
          bomSection: quote.bomSection
        };
        const existingItems = await storage.getQuoteItems(quoteId);
        orderItems = existingItems.map((item) => ({
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toString(),
          subtotal: item.subtotal.toString(),
          hsnSac: item.hsnSac,
          sortOrder: item.sortOrder
        }));
      } else {
        if (!clientId) {
          return res.status(400).json({ error: "Client ID is required for standalone Sales Orders" });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ error: "Items are required for standalone Sales Orders" });
        }
        baseOrderData = {
          quoteId: null,
          clientId,
          currency: otherFields.currency || "INR",
          subtotal: subtotal ? String(subtotal) : "0",
          total: total ? String(total) : "0",
          // Allow other fields or defaults
          notes: otherFields.notes || "",
          termsAndConditions: otherFields.termsAndConditions || "",
          shippingCharges: "0",
          discount: "0",
          cgst: "0",
          sgst: "0",
          igst: "0",
          bomSection: bomSection || null
        };
        orderItems = items.map((item) => ({
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: String(item.unitPrice || 0),
          subtotal: String(item.subtotal || 0),
          hsnSac: item.hsnSac || "",
          sortOrder: item.sortOrder || 0
        }));
      }
      const orderNumber = await NumberingService.generateSalesOrderNumber();
      const salesOrder = await db.transaction(async (tx) => {
        const [order] = await tx.insert(salesOrders).values({
          orderNumber,
          status: "draft",
          orderDate: /* @__PURE__ */ new Date(),
          ...baseOrderData,
          createdBy: req.user.id
        }).returning();
        for (const item of orderItems) {
          await tx.insert(salesOrderItems).values({
            salesOrderId: order.id,
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            hsnSac: item.hsnSac,
            sortOrder: item.sortOrder,
            status: "pending",
            fulfilledQuantity: 0
          });
        }
        await tx.insert(activityLogs).values({
          userId: req.user.id,
          action: "create",
          entityType: "sales_orders",
          entityId: order.id,
          timestamp: /* @__PURE__ */ new Date()
        });
        return order;
      });
      return res.json(salesOrder);
    } catch (error) {
      logger.error("Create sales order error:", error);
      return res.status(500).json({ error: error.message || "Failed to create sales order" });
    }
  }
);
router.get(
  "/sales-orders",
  requirePermission("sales_orders", "view"),
  async (req, res) => {
    try {
      const { quoteId } = req.query;
      let orders = [];
      if (quoteId) {
        const order = await storage.getSalesOrderByQuote(quoteId);
        if (order) {
          orders = [order];
        }
      } else {
        orders = await storage.getAllSalesOrders();
      }
      const ordersWithData = await Promise.all(orders.map(async (order) => {
        const client = await storage.getClient(order.clientId);
        const quote = order.quoteId ? await storage.getQuote(order.quoteId) : void 0;
        return {
          ...order,
          clientName: client?.name || "Unknown",
          quoteNumber: quote?.quoteNumber || ""
          // Return empty if no quote
        };
      }));
      return res.json(ordersWithData);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch sales orders" });
    }
  }
);
router.get(
  "/sales-orders/:id",
  requirePermission("sales_orders", "view"),
  async (req, res) => {
    try {
      const order = await storage.getSalesOrder(req.params.id);
      if (order) {
        logger.info(`[GET SO] ID: ${order.id}, Subtotal: ${order.subtotal}, Discount: ${order.discount}, Tax: ${order.cgst}/${order.sgst}/${order.igst}, Total: ${order.total}`);
      }
      if (!order) {
        return res.status(404).json({ error: "Sales Order not found" });
      }
      const items = await storage.getSalesOrderItems(order.id);
      const client = await storage.getClient(order.clientId);
      let quote = void 0;
      let quoteItems2 = [];
      if (order.quoteId) {
        quote = await storage.getQuote(order.quoteId);
        quoteItems2 = await storage.getQuoteItems(order.quoteId);
      }
      const creator = await storage.getUser(order.createdBy);
      const invoices2 = await storage.getInvoicesBySalesOrder(order.id);
      const linkedInvoice = invoices2[0];
      return res.json({
        ...order,
        client,
        items,
        quote: {
          ...quote,
          items: quoteItems2
        },
        createdByName: creator?.name || "Unknown",
        invoiceId: linkedInvoice?.id
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch sales order" });
    }
  }
);
router.patch(
  "/sales-orders/:id",
  requirePermission("sales_orders", "edit"),
  async (req, res) => {
    try {
      const orderId = req.params.id;
      const currentOrder = await storage.getSalesOrder(orderId);
      if (!currentOrder) return res.status(404).json({ error: "Order not found" });
      if (req.body.status && req.body.status !== currentOrder.status) {
        const newStatus = req.body.status;
        if (newStatus === "confirmed" && currentOrder.status === "draft") {
          if (!req.user || !hasPermission(req.user.role, "sales_orders", "approve")) {
            return res.status(403).json({ error: "Insufficient permissions to confirm orders" });
          }
          req.body.confirmedAt = /* @__PURE__ */ new Date();
          req.body.confirmedBy = req.user.id;
        } else if (newStatus === "cancelled") {
          if (!req.user || !hasPermission(req.user.role, "sales_orders", "cancel")) {
            return res.status(403).json({ error: "Insufficient permissions to cancel orders" });
          }
        } else if (newStatus === "fulfilled" && currentOrder.status !== "confirmed") {
          return res.status(400).json({ error: "Only confirmed orders can be fulfilled" });
        }
      }
      const result = await db.transaction(async (tx) => {
        const items = req.body.items;
        const updateData = { ...req.body };
        delete updateData.items;
        if (updateData.expectedDeliveryDate === "") {
          updateData.expectedDeliveryDate = null;
        } else if (updateData.expectedDeliveryDate) {
          updateData.expectedDeliveryDate = new Date(updateData.expectedDeliveryDate);
        }
        if (updateData.actualDeliveryDate === "") {
          updateData.actualDeliveryDate = null;
        } else if (updateData.actualDeliveryDate) {
          updateData.actualDeliveryDate = new Date(updateData.actualDeliveryDate);
        }
        let subtotal = toDecimal(currentOrder.subtotal);
        const getVal = (val, current) => val !== void 0 ? val : current;
        if (items && Array.isArray(items)) {
          subtotal = calculateSubtotal(items.map((item) => ({
            quantity: item.quantity,
            unitPrice: item.unitPrice
          })));
          updateData.subtotal = toMoneyString(subtotal);
        }
        const total = calculateTotal({
          subtotal,
          discount: getVal(updateData.discount, currentOrder.discount),
          shippingCharges: getVal(updateData.shippingCharges, currentOrder.shippingCharges),
          cgst: getVal(updateData.cgst, currentOrder.cgst),
          sgst: getVal(updateData.sgst, currentOrder.sgst),
          igst: getVal(updateData.igst, currentOrder.igst)
        });
        updateData.total = toMoneyString(total);
        const [updatedOrder] = await tx.update(salesOrders).set(updateData).where(eq2(salesOrders.id, orderId)).returning();
        if (!updatedOrder) throw new Error("Failed to update sales order");
        if (items && Array.isArray(items)) {
          await tx.delete(salesOrderItems).where(eq2(salesOrderItems.salesOrderId, orderId));
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            await tx.insert(salesOrderItems).values({
              salesOrderId: orderId,
              productId: item.productId || null,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
              hsnSac: item.hsnSac || null,
              sortOrder: i,
              status: "pending"
            });
          }
        }
        if (req.body.status && req.body.status !== currentOrder.status) {
          const orderItems = items && Array.isArray(items) ? items : await storage.getSalesOrderItems(orderId);
          const productQuantities = {};
          for (const item of orderItems) {
            if (item.productId) {
              productQuantities[item.productId] = (productQuantities[item.productId] || 0) + (item.quantity || 0);
            }
          }
          if (req.body.status === "confirmed" && currentOrder.status === "draft") {
            if (isFeatureEnabled("products_stock_tracking") && isFeatureEnabled("products_reserve_on_order")) {
              for (const [productId, quantity] of Object.entries(productQuantities)) {
                await tx.update(products).set({
                  reservedQuantity: sql4`${products.reservedQuantity} + ${quantity}`,
                  availableQuantity: sql4`${products.availableQuantity} - ${quantity}`,
                  updatedAt: /* @__PURE__ */ new Date()
                }).where(eq2(products.id, productId));
              }
              logger.stock(`[Stock Reserve] Reserved stock inside transaction for SO ${orderId}`);
            }
          } else if (req.body.status === "cancelled" && currentOrder.status === "confirmed") {
            if (isFeatureEnabled("products_stock_tracking") && isFeatureEnabled("products_reserve_on_order")) {
              for (const [productId, quantity] of Object.entries(productQuantities)) {
                await tx.update(products).set({
                  reservedQuantity: sql4`GREATEST(0, ${products.reservedQuantity} - ${quantity})`,
                  availableQuantity: sql4`${products.availableQuantity} + ${quantity}`,
                  updatedAt: /* @__PURE__ */ new Date()
                }).where(eq2(products.id, productId));
              }
              logger.stock(`[Stock Release] Released stock inside transaction for SO ${orderId}`);
            }
          }
        }
        await tx.insert(activityLogs).values({
          userId: req.user.id,
          action: "edit",
          entityType: "sales_orders",
          entityId: updatedOrder.id,
          timestamp: /* @__PURE__ */ new Date()
        });
        return updatedOrder;
      });
      return res.json(result);
    } catch (error) {
      logger.error("Error updating sales order:", error);
      return res.status(500).json({ error: error.message });
    }
  }
);
router.post(
  "/sales-orders/:id/convert-to-invoice",
  requireFeature("invoices_module"),
  requireFeature("sales_orders_convertToInvoice"),
  requirePermission("invoices", "create"),
  async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = await storage.getSalesOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Sales order not found" });
      }
      if (order.status !== "fulfilled" && order.status !== "confirmed") {
        return res.status(400).json({
          error: "Sales order must be Confirmed or Fulfilled to be converted to an invoice"
        });
      }
      let quote = null;
      if (order.quoteId) {
        quote = await storage.getQuote(order.quoteId);
        if (!quote || quote.status !== "approved") {
          return res.status(400).json({
            error: "Linked quote must be approved"
          });
        }
      }
      let items = await storage.getSalesOrderItems(orderId);
      if ((!items || items.length === 0) && order.quoteId) {
        items = await storage.getQuoteItems(order.quoteId);
      }
      if (!items || items.length === 0) {
        return res.status(400).json({ error: "No items found to invoice" });
      }
      const invoiceNumber = await NumberingService.generateChildInvoiceNumber();
      const result = await db.transaction(async (tx) => {
        const [invoice] = await tx.insert(invoices).values({
          invoiceNumber,
          quoteId: order.quoteId,
          salesOrderId: orderId,
          clientId: order.clientId,
          issueDate: /* @__PURE__ */ new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
          status: "draft",
          isMaster: false,
          paymentStatus: "pending",
          paidAmount: "0",
          // String for decimal
          remainingAmount: order.total,
          // Initialize remaining amount
          createdBy: req.user.id,
          // Propagate currency
          currency: order.currency || "INR",
          subtotal: order.subtotal,
          discount: order.discount,
          cgst: order.cgst,
          sgst: order.sgst,
          igst: order.igst,
          shippingCharges: order.shippingCharges,
          total: order.total,
          notes: order.notes,
          termsAndConditions: order.termsAndConditions,
          bomSection: quote?.bomSection,
          // Copy BOM from quote
          deliveryNotes: `Delivery Date: ${order.actualDeliveryDate ? new Date(order.actualDeliveryDate).toLocaleDateString() : "N/A"}`
        }).returning();
        const shortageNotes = [];
        for (const item of items) {
          if (item.productId && isFeatureEnabled("products_stock_tracking")) {
            const [product] = await tx.select().from(products).where(eq2(products.id, item.productId));
            if (product) {
              const requiredQty = Number(item.quantity);
              const currentStock = Number(product.stockQuantity);
              const allowNegative = isFeatureEnabled("products_allow_negative_stock");
              if (currentStock < requiredQty) {
                logger.stock(`[Stock Shortage] Product ${item.description} (ID: ${item.productId}): Required ${requiredQty}, Available ${currentStock}`);
                if (!allowNegative) {
                  logger.warn(`[Stock Block] Shortage blocked for ${item.description}`);
                }
                if (isFeatureEnabled("products_stock_warnings")) {
                  shortageNotes.push(`[SHORTAGE] ${item.description}: Required ${requiredQty}, Available ${currentStock}`);
                }
              }
              const updateQuery = {
                stockQuantity: sql4`${products.stockQuantity} - ${requiredQty}`,
                reservedQuantity: sql4`GREATEST(0, ${products.reservedQuantity} - ${requiredQty})`,
                availableQuantity: sql4`(${products.stockQuantity} - ${requiredQty}) - GREATEST(0, ${products.reservedQuantity} - ${requiredQty})`
              };
              await tx.update(products).set(updateQuery).where(eq2(products.id, item.productId));
            }
          }
          await tx.insert(invoiceItems).values({
            invoiceId: invoice.id,
            productId: item.productId || null,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            hsnSac: item.hsnSac || null,
            sortOrder: item.sortOrder,
            status: "pending",
            fulfilledQuantity: item.quantity
          });
        }
        if (isFeatureEnabled("products_stock_warnings") && shortageNotes.length > 0) {
          const existingNotes = invoice.deliveryNotes || "";
          const shortageText = shortageNotes.join("\n");
          const newNotes = existingNotes ? `${existingNotes}

${shortageText}` : shortageText;
          await tx.update(invoices).set({ deliveryNotes: newNotes }).where(eq2(invoices.id, invoice.id));
          invoice.deliveryNotes = newNotes;
        }
        if (order.quoteId) {
          await tx.update(quotes).set({ status: "invoiced" }).where(eq2(quotes.id, order.quoteId));
        }
        await tx.insert(activityLogs).values({
          userId: req.user.id,
          action: "create_invoice",
          entityType: "invoice",
          entityId: invoice.id,
          metadata: { fromSalesOrder: orderId },
          timestamp: /* @__PURE__ */ new Date()
        });
        if (order.quoteId) {
          await tx.insert(activityLogs).values({
            userId: req.user.id,
            action: "update_status",
            entityType: "quote",
            entityId: order.quoteId,
            metadata: {
              newStatus: "invoiced",
              trigger: "invoice_creation",
              salesOrderId: orderId
            },
            timestamp: /* @__PURE__ */ new Date()
          });
        }
        return { invoice, items };
      });
      try {
        const { invoice, items: items2 } = result;
        const settingss = await storage.getAllSettings();
        const companyName = settingss.find((s) => s.key === "company_name")?.value || "OPTIVALUE TEK";
        const companyAddress = settingss.find((s) => s.key === "company_address")?.value || "";
        const companyPhone = settingss.find((s) => s.key === "company_phone")?.value || "";
        const companyEmail = settingss.find((s) => s.key === "company_email")?.value || "";
        const companyWebsite = settingss.find((s) => s.key === "company_website")?.value || "";
        const companyGSTIN = settingss.find((s) => s.key === "company_gstin")?.value || "";
        const bankDetail = await storage.getActiveBankDetails();
        const client = await storage.getClient(invoice.clientId);
        let quote2 = void 0;
        if (invoice.quoteId) {
          quote2 = await storage.getQuote(invoice.quoteId);
        }
        const { PassThrough } = await import("stream");
        const pt = new PassThrough();
        const pdfPromise = InvoicePDFService.generateInvoicePDF({
          quote: quote2 || {},
          client,
          items: items2,
          companyName,
          companyAddress,
          companyPhone,
          companyEmail,
          companyWebsite,
          companyGSTIN,
          companyDetails: {
            name: companyName,
            address: companyAddress,
            phone: companyPhone,
            email: companyEmail,
            website: companyWebsite,
            gstin: companyGSTIN
          },
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.createdAt || /* @__PURE__ */ new Date(),
          dueDate: invoice.dueDate ? new Date(invoice.dueDate) : /* @__PURE__ */ new Date(),
          paidAmount: invoice.paidAmount || "0",
          paymentStatus: invoice.paymentStatus || "pending",
          isMaster: invoice.isMaster,
          childInvoices: [],
          deliveryNotes: invoice.deliveryNotes || void 0,
          subtotal: invoice.subtotal || "0",
          discount: invoice.discount || "0",
          cgst: invoice.cgst || "0",
          sgst: invoice.sgst || "0",
          igst: invoice.igst || "0",
          shippingCharges: invoice.shippingCharges || "0",
          total: invoice.total || "0",
          notes: invoice.notes || void 0,
          termsAndConditions: invoice.termsAndConditions,
          bankName: bankDetail?.bankName || "",
          bankAccountNumber: bankDetail?.accountNumber || "",
          bankAccountName: bankDetail?.accountName || "",
          bankIfscCode: bankDetail?.ifscCode || ""
        }, pt);
        const buffer = await streamToBuffer(pt);
        await pdfPromise;
        await storage.createInvoiceAttachment({
          invoiceId: invoice.id,
          fileName: `Invoice-${invoice.invoiceNumber}.pdf`,
          fileType: "application/pdf",
          fileSize: buffer.length,
          content: buffer.toString("base64")
        });
      } catch (pdfError) {
        logger.error("PDF generation failed for invoice:", result.invoice.id, pdfError);
      }
      return res.status(201).json(result.invoice);
    } catch (error) {
      logger.error("Error creating invoice from sales order:", error);
      if (error.message.includes("already")) {
        return res.status(409).json({ error: error.message });
      }
      if (error.code === "23505") {
        return res.status(409).json({ error: "An invoice has already been generated for this sales order" });
      }
      return res.status(500).json({ error: error.message });
    }
  }
);
router.post(
  "/quotes/parse-excel",
  requirePermission("quotes", "create"),
  async (req, res) => {
    try {
      const { fileContent } = req.body;
      if (!fileContent) {
        return res.status(400).json({ message: "No file content provided" });
      }
      const buffer = Buffer.from(fileContent, "base64");
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];
      const items = [];
      const headerRow = worksheet.getRow(1);
      const headers = {};
      headerRow.eachCell((cell, colNumber) => {
        const value = cell.value?.toString().toLowerCase().trim() || "";
        if (value.includes("description") || value.includes("item")) headers.description = colNumber;
        if (value.includes("quantity") || value.includes("qty")) headers.quantity = colNumber;
        if (value.includes("price") || value.includes("rate")) headers.unitPrice = colNumber;
        if (value.includes("hsn") || value.includes("sac")) headers.hsnSac = colNumber;
      });
      if (!headers.description || !headers.quantity || !headers.unitPrice) {
        return res.status(400).json({
          message: "Invalid Excel format. Required columns: Description, Quantity, Unit Price"
        });
      }
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const description = row.getCell(headers.description).value?.toString() || "";
        const quantity = Number(row.getCell(headers.quantity).value) || 0;
        const unitPrice = Number(row.getCell(headers.unitPrice).value) || 0;
        const hsnSac = headers.hsnSac ? row.getCell(headers.hsnSac).value?.toString() || "" : "";
        if (description && quantity > 0) {
          items.push({
            description,
            quantity,
            unitPrice,
            hsnSac,
            subtotal: quantity * unitPrice
          });
        }
      });
      res.json(items);
    } catch (error) {
      logger.error("Error parsing Excel:", error);
      res.status(500).json({ message: "Failed to parse Excel file" });
    }
  }
);
router.get("/sales-orders/:id/pdf", requirePermission("sales_orders", "view"), async (req, res) => {
  try {
    const order = await storage.getSalesOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Sales order not found" });
    }
    const client = await storage.getClient(order.clientId);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    const settings2 = await storage.getAllSettings();
    const companyName = settings2.find((s) => s.key === "company_companyName")?.value || "";
    const addr = settings2.find((s) => s.key === "company_address")?.value || "";
    const city = settings2.find((s) => s.key === "company_city")?.value || "";
    const state = settings2.find((s) => s.key === "company_state")?.value || "";
    const zip = settings2.find((s) => s.key === "company_zipCode")?.value || "";
    const country = settings2.find((s) => s.key === "company_country")?.value || "";
    const companyAddress = [addr, city, state, zip, country].filter(Boolean).join(", ");
    const companyPhone = settings2.find((s) => s.key === "company_phone")?.value || "";
    const companyEmail = settings2.find((s) => s.key === "company_email")?.value || "";
    const companyWebsite = settings2.find((s) => s.key === "company_website")?.value || "";
    const companyGSTIN = settings2.find((s) => s.key === "company_gstin")?.value || "";
    const companyLogo = settings2.find((s) => s.key === "company_logo")?.value;
    const bankName = settings2.find((s) => s.key === "bank_bankName")?.value || "";
    const bankAccountNumber = settings2.find((s) => s.key === "bank_accountNumber")?.value || "";
    const bankAccountName = settings2.find((s) => s.key === "bank_accountName")?.value || "";
    const bankIfscCode = settings2.find((s) => s.key === "bank_ifscCode")?.value || "";
    const bankBranch = settings2.find((s) => s.key === "bank_branch")?.value || "";
    const bankSwiftCode = settings2.find((s) => s.key === "bank_swiftCode")?.value || "";
    const quote = order.quoteId ? await storage.getQuote(order.quoteId) : void 0;
    if (!quote && order.quoteId) {
      logger.warn(`Quote not found for order ${order.id}`);
    }
    const items = await storage.getSalesOrderItems(order.id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=SalesOrder-${order.orderNumber}.pdf`);
    await SalesOrderPDFService.generateSalesOrderPDF({
      quote: quote || { quoteNumber: "-" },
      client,
      items: items || [],
      currency: order.currency,
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      companyWebsite,
      companyGSTIN,
      companyLogo,
      companyDetails: {
        name: companyName,
        address: companyAddress,
        phone: companyPhone,
        email: companyEmail,
        website: companyWebsite,
        gstin: companyGSTIN
      },
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      expectedDeliveryDate: order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate) : void 0,
      subtotal: order.subtotal || "0",
      discount: order.discount || "0",
      cgst: order.cgst || "0",
      sgst: order.sgst || "0",
      igst: order.igst || "0",
      shippingCharges: order.shippingCharges || "0",
      total: order.total || "0",
      notes: order.notes || void 0,
      termsAndConditions: order.termsAndConditions || void 0,
      bomSection: order.bomSection || void 0,
      // Bank details (nested and top-level for backward compatibility)
      bankDetails: {
        bankName,
        accountNumber: bankAccountNumber,
        accountName: bankAccountName,
        ifsc: bankIfscCode,
        branch: bankBranch,
        swift: bankSwiftCode
      },
      // Pass top-level for existing PDF logic
      bankName,
      bankAccountNumber,
      bankAccountName,
      bankIfscCode,
      bankBranch,
      bankSwiftCode,
      deliveryNotes: void 0
      // Schema update needed if this field is required
    }, res);
  } catch (error) {
    logger.error("Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});
router.post("/sales-orders/:id/email", requirePermission("sales_orders", "view"), async (req, res) => {
  try {
    const { email, subject, body } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }
    const order = await storage.getSalesOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Sales order not found" });
    }
    const client = await storage.getClient(order.clientId);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    const settings2 = await storage.getAllSettings();
    const companyName = settings2.find((s) => s.key === "company_companyName")?.value || "OPTIVALUE TEK";
    const addr = settings2.find((s) => s.key === "company_address")?.value || "";
    const city = settings2.find((s) => s.key === "company_city")?.value || "";
    const state = settings2.find((s) => s.key === "company_state")?.value || "";
    const zip = settings2.find((s) => s.key === "company_zipCode")?.value || "";
    const country = settings2.find((s) => s.key === "company_country")?.value || "";
    const companyAddress = [addr, city, state, zip, country].filter(Boolean).join(", ");
    const companyPhone = settings2.find((s) => s.key === "company_phone")?.value || "";
    const companyEmail = settings2.find((s) => s.key === "company_email")?.value || "";
    const companyWebsite = settings2.find((s) => s.key === "company_website")?.value || "";
    const companyGSTIN = settings2.find((s) => s.key === "company_gstin")?.value || "";
    const companyLogo = settings2.find((s) => s.key === "company_logo")?.value;
    const bankName = settings2.find((s) => s.key === "bank_bankName")?.value || "";
    const bankAccountNumber = settings2.find((s) => s.key === "bank_accountNumber")?.value || "";
    const bankAccountName = settings2.find((s) => s.key === "bank_accountName")?.value || "";
    const bankIfscCode = settings2.find((s) => s.key === "bank_ifscCode")?.value || "";
    const bankBranch = settings2.find((s) => s.key === "bank_branch")?.value || "";
    const bankSwiftCode = settings2.find((s) => s.key === "bank_swiftCode")?.value || "";
    const items = await storage.getSalesOrderItems(order.id);
    const { PassThrough } = await import("stream");
    const pdfStream = new PassThrough();
    const pdfPromise = SalesOrderPDFService.generateSalesOrderPDF({
      quote: { quoteNumber: "-" },
      client,
      items: items || [],
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      companyWebsite,
      companyGSTIN,
      companyLogo,
      companyDetails: {
        name: companyName,
        address: companyAddress,
        phone: companyPhone,
        email: companyEmail,
        website: companyWebsite,
        gstin: companyGSTIN
      },
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      expectedDeliveryDate: order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate) : void 0,
      subtotal: order.subtotal || "0",
      discount: order.discount || "0",
      cgst: order.cgst || "0",
      sgst: order.sgst || "0",
      igst: order.igst || "0",
      shippingCharges: order.shippingCharges || "0",
      total: order.total || "0",
      notes: order.notes || void 0,
      termsAndConditions: order.termsAndConditions || void 0,
      // Bank details (nested and top-level for backward compatibility)
      bankDetails: {
        bankName,
        accountNumber: bankAccountNumber,
        accountName: bankAccountName,
        ifsc: bankIfscCode,
        branch: bankBranch,
        swift: bankSwiftCode
      },
      // Pass top-level for existing PDF logic
      bankName,
      bankAccountNumber,
      bankAccountName,
      bankIfscCode,
      bankBranch,
      bankSwiftCode,
      deliveryNotes: void 0
      // Schema update needed if this field is required
    }, pdfStream);
    const buffer = await streamToBuffer(pdfStream);
    await pdfPromise;
    await EmailService.sendSalesOrderEmail(
      email,
      subject || `Sales Order ${order.orderNumber} from ${companyName}`,
      body || `Please find attached Sales Order ${order.orderNumber}.`,
      buffer
    );
    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    logger.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});
router.post(
  "/quotes/:id/sales-orders",
  requireFeature("sales_orders_module"),
  requireFeature("quotes_convertToSalesOrder"),
  requirePermission("sales_orders", "create"),
  async (req, res) => {
    try {
      const quoteId = req.params.id;
      const quote = await storage.getQuote(quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      if (quote.status !== "approved") {
        return res.status(400).json({ message: "Only approved quotes can be converted to sales orders" });
      }
      const orderNumber = await NumberingService.generateSalesOrderNumber();
      const result = await db.transaction(async (tx) => {
        const [existingOrder] = await tx.select().from(salesOrders).where(eq2(salesOrders.quoteId, quoteId));
        if (existingOrder) {
          throw new Error(`DUPLICATE_ORDER:${existingOrder.id}`);
        }
        const [newOrder] = await tx.insert(salesOrders).values({
          quoteId,
          orderNumber,
          clientId: quote.clientId,
          status: "draft",
          currency: quote.currency,
          subtotal: quote.subtotal,
          discount: quote.discount || "0",
          cgst: quote.cgst || "0",
          sgst: quote.sgst || "0",
          igst: quote.igst || "0",
          shippingCharges: quote.shippingCharges || "0",
          total: quote.total,
          notes: quote.notes,
          termsAndConditions: quote.termsAndConditions,
          createdBy: req.user.id
        }).returning();
        const quoteItems2 = await storage.getQuoteItems(quoteId);
        if (quoteItems2 && quoteItems2.length > 0) {
          let sortOrder = 0;
          for (const item of quoteItems2) {
            await tx.insert(salesOrderItems).values({
              salesOrderId: newOrder.id,
              productId: item.productId || null,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
              hsnSac: item.hsnSac,
              sortOrder: sortOrder++,
              status: "pending",
              fulfilledQuantity: 0
            });
          }
        }
        await tx.insert(activityLogs).values({
          userId: req.user.id,
          action: "create",
          entityType: "sales_orders",
          entityId: newOrder.id,
          timestamp: /* @__PURE__ */ new Date()
        });
        return newOrder;
      });
      res.status(201).json(result);
    } catch (error) {
      if (error.message?.startsWith("DUPLICATE_ORDER:")) {
        const orderId = error.message.split(":")[1];
        return res.status(400).json({ message: "A Sales Order already exists for this quote", orderId });
      }
      logger.error("Failed to create sales order:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  }
);
var quote_workflow_routes_default = router;

// server/routes/auth.routes.ts
init_storage();
import { Router as Router2 } from "express";
import bcrypt from "bcryptjs";
import jwt2 from "jsonwebtoken";
import { nanoid } from "nanoid";
init_logger();
var router2 = Router2();
var JWT_EXPIRES_IN = "15m";
router2.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password and name are required" });
    }
    if (await storage.getUserByEmail(email)) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await storage.createUser({
      email,
      passwordHash: hashedPassword,
      name,
      role: "viewer",
      status: "active"
    });
    await storage.createActivityLog({
      userId: user.id,
      action: "signup",
      entityType: "user",
      entityId: user.id
    });
    try {
      if (__require("../shared/feature-flags").isFeatureEnabled("email_welcome")) {
        await EmailService.sendWelcomeEmail(email, name);
      }
    } catch (error) {
      logger.error("Failed to send welcome email:", error);
    }
    return res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (error) {
    logger.error("Signup error:", error);
    return res.status(500).json({ error: error.message || "Failed to create account" });
  }
});
router2.post("/login", async (req, res) => {
  try {
    logger.info("Login attempt received");
    const { email, password } = req.body;
    if (!email || !password) {
      logger.info("Missing email or password");
      return res.status(400).json({ error: "Email and password are required" });
    }
    logger.info("Fetching user from database");
    const user = await storage.getUserByEmail(email);
    if (!user) {
      logger.info("User not found:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    logger.info("User found, checking status");
    if (user.status !== "active") {
      logger.info("User account is not active:", user.status);
      return res.status(401).json({ error: "Account is inactive" });
    }
    logger.info("Verifying password");
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      logger.info("Invalid password");
      return res.status(401).json({ error: "Invalid credentials" });
    }
    logger.info("Generating tokens");
    const refreshToken = nanoid(32);
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
    await storage.updateUser(user.id, {
      refreshToken,
      refreshTokenExpiry
    });
    const token = jwt2.sign(
      { id: user.id, email: user.email, role: user.role },
      getJWTSecret(),
      { expiresIn: JWT_EXPIRES_IN }
    );
    logger.info("Setting cookies");
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1e3
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // 7 days
    });
    logger.info("Creating activity log");
    await storage.createActivityLog({
      userId: user.id,
      action: "login",
      entityType: "user",
      entityId: user.id
    });
    try {
      const userAgent = req.headers["user-agent"] || "Unknown";
      const ip = req.ip || req.socket.remoteAddress || "Unknown";
      let deviceType = "desktop";
      if (/mobile/i.test(userAgent)) deviceType = "mobile";
      else if (/tablet|ipad/i.test(userAgent)) deviceType = "tablet";
      await storage.createUserDevice({
        userId: user.id,
        deviceType,
        browser: userAgent,
        // Storing full UA for now suitable for simple display
        os: "Unknown",
        ipAddress: typeof ip === "string" ? ip : "Unknown",
        // Handle potential array from x-forwarded-for if not parsed
        userAgent,
        tokenHash: refreshToken,
        // Storing refresh token directly (or should hash it? kept simple for now matching schema)
        isActive: true
      });
    } catch (e) {
      logger.error("Failed to track device:", e);
    }
    logger.info("Login successful");
    return res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (error) {
    logger.error("Login error:", error);
    logger.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({
      error: "Login failed",
      details: process.env.NODE_ENV !== "production" ? error.message : void 0
    });
  }
});
router2.post("/logout", authMiddleware, async (req, res) => {
  try {
    if (req.user?.id) {
      await storage.updateUser(req.user.id, {
        refreshToken: null,
        refreshTokenExpiry: null
      });
      await storage.createActivityLog({
        userId: req.user.id,
        action: "logout",
        entityType: "user",
        entityId: req.user.id
      });
    }
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    return res.json({ success: true });
  } catch (error) {
    logger.error("Logout error:", error);
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    return res.json({ success: true });
  }
});
router2.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user" });
  }
});
router2.post("/reset-password", requireFeature("pages_resetPassword"), async (req, res) => {
  try {
    const { email } = req.body;
    const user = await storage.getUserByEmail(email);
    if (!user || !user.backupEmail) {
      return res.json({ success: true });
    }
    const resetToken = nanoid(32);
    await storage.updateUser(user.id, {
      resetToken,
      resetTokenExpiry: new Date(Date.now() + 36e5)
      // 1 hour
    });
    const protocol = req.header("x-forwarded-proto") || req.protocol || "http";
    const host = req.header("x-forwarded-host") || req.header("host") || "localhost:5000";
    const baseUrl = `${protocol}://${host}`;
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
    try {
      await EmailService.sendPasswordResetEmail(user.backupEmail, resetLink);
    } catch (error) {
      logger.error("Failed to send password reset email:", error);
    }
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to process request" });
  }
});
router2.post("/reset-password-confirm", requireFeature("pages_resetPassword"), async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }
    const user = await storage.getUserByResetToken(token);
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }
    if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < /* @__PURE__ */ new Date()) {
      await storage.updateUser(user.id, {
        resetToken: null,
        resetTokenExpiry: null
      });
      return res.status(400).json({ error: "Reset token has expired" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      return res.status(400).json({ error: "Password must contain uppercase, lowercase, number, and special character" });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updatedUser = await storage.updateUserWithTokenCheck(user.id, token, {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null
    });
    if (!updatedUser) {
      logger.warn(`Reset token already used or invalidated for user ${user.id}`);
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }
    logger.info(`Password reset successful for user ${user.id}, token cleared`);
    await storage.createActivityLog({
      userId: user.id,
      action: "reset_password",
      entityType: "user",
      entityId: user.id
    });
    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    logger.error("Reset password confirm error:", error);
    return res.status(500).json({ error: "Failed to reset password" });
  }
});
router2.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token" });
    }
    const user = await storage.getUserByRefreshToken(refreshToken);
    if (!user) {
      res.clearCookie("refreshToken");
      res.clearCookie("token");
      return res.status(401).json({ error: "Invalid refresh token" });
    }
    if (user.refreshTokenExpiry && new Date(user.refreshTokenExpiry) < /* @__PURE__ */ new Date()) {
      await storage.updateUser(user.id, {
        refreshToken: null,
        refreshTokenExpiry: null
      });
      res.clearCookie("refreshToken");
      res.clearCookie("token");
      return res.status(401).json({ error: "Refresh token expired" });
    }
    if (user.status !== "active") {
      res.clearCookie("refreshToken");
      res.clearCookie("token");
      return res.status(401).json({ error: "Account is inactive" });
    }
    const newToken = jwt2.sign(
      { id: user.id, email: user.email, role: user.role },
      getJWTSecret(),
      { expiresIn: JWT_EXPIRES_IN }
    );
    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1e3
    });
    return res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    logger.error("Refresh token error:", error);
    res.clearCookie("refreshToken");
    res.clearCookie("token");
    return res.status(500).json({ error: "Failed to refresh token" });
  }
});
router2.get("/ws-token", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const wsToken = jwt2.sign(
      { id: req.user.id, email: req.user.email },
      getJWTSecret(),
      { expiresIn: "5m" }
      // Short-lived for initial connection only
    );
    return res.json({ token: wsToken });
  } catch (error) {
    logger.error("WebSocket token error:", error);
    return res.status(500).json({ error: "Failed to generate WebSocket token" });
  }
});
router2.get("/devices", authMiddleware, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    const devices = await storage.getUserDevices(req.user.id);
    return res.json(devices);
  } catch (error) {
    logger.error("Failed to fetch devices:", error);
    return res.status(500).json({ error: "Failed to fetch devices" });
  }
});
router2.delete("/devices/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    const device = await storage.getUserDevice(req.params.id);
    if (!device || device.userId !== req.user.id) {
      return res.status(404).json({ error: "Device not found" });
    }
    await storage.deleteUserDevice(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    logger.error("Failed to revoke device:", error);
    return res.status(500).json({ error: "Failed to revoke device" });
  }
});
var auth_routes_default = router2;

// server/routes/users.routes.ts
init_storage();
init_logger();
import { Router as Router3 } from "express";
import bcrypt2 from "bcryptjs";
var router3 = Router3();
router3.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const users2 = await storage.getAllUsers();
    return res.json(users2.map((u) => ({
      id: u.id,
      email: u.email,
      backupEmail: u.backupEmail,
      name: u.name,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt
    })));
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});
router3.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { email, backupEmail, password, name, role, status } = req.body;
    const existing = await storage.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const passwordHash = await bcrypt2.hash(password, 10);
    const user = await storage.createUser({
      email,
      backupEmail,
      passwordHash,
      name,
      role: role || "viewer",
      status: status || "active"
    });
    await storage.createActivityLog({
      userId: req.user.id,
      action: "create_user",
      entityType: "user",
      entityId: user.id
    });
    return res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to create user" });
  }
});
router3.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { name, email, backupEmail, role, status, password } = req.body;
    const userId = req.params.id;
    if (email) {
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (backupEmail !== void 0) updateData.backupEmail = backupEmail;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (password) {
      updateData.passwordHash = await bcrypt2.hash(password, 10);
    }
    const updatedUser = await storage.updateUser(userId, updateData);
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    await storage.createActivityLog({
      userId: req.user.id,
      action: "update_user",
      entityType: "user",
      entityId: userId
    });
    const safeUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      status: updatedUser.status,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      backupEmail: updatedUser.backupEmail
    };
    return res.json(safeUser);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to update user" });
  }
});
router3.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }
    await storage.deleteUser(req.params.id);
    await storage.createActivityLog({
      userId: req.user.id,
      action: "delete_user",
      entityType: "user",
      entityId: req.params.id
    });
    return res.json({ success: true });
  } catch (error) {
    logger.error("Delete user error:", error);
    return res.status(500).json({ error: error.message || "Failed to delete user" });
  }
});
var users_routes_default = router3;

// server/routes/clients.routes.ts
init_storage();
import { Router as Router4 } from "express";
init_feature_flags();
init_schema();
var router4 = Router4();
router4.get("/", requireFeature("clients_module"), authMiddleware, async (req, res) => {
  try {
    const clients3 = await storage.getAllClients();
    res.json(clients3);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});
router4.get("/:id", requireFeature("clients_module"), authMiddleware, async (req, res) => {
  try {
    const client = await storage.getClient(req.params.id);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    return res.json(client);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch client" });
  }
});
router4.post("/", requireFeature("clients_create"), authMiddleware, requirePermission("clients", "create"), validateRequest(insertClientSchema), async (req, res) => {
  try {
    if (!isFeatureEnabled("clients_gstin") && req.body.gstin) {
      return res.status(403).json({ error: "GSTIN feature is disabled" });
    }
    if (!isFeatureEnabled("clients_billingAddress") && req.body.billingAddress) {
      return res.status(403).json({ error: "Billing Address feature is disabled" });
    }
    if (!isFeatureEnabled("clients_shippingAddress") && req.body.shippingAddress) {
      return res.status(403).json({ error: "Shipping Address feature is disabled" });
    }
    const client = await storage.createClient({
      ...req.body,
      createdBy: req.user.id
    });
    await storage.createActivityLog({
      userId: req.user.id,
      action: "create_client",
      entityType: "client",
      entityId: client.id
    });
    return res.json(client);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to create client" });
  }
});
router4.put("/:id", requireFeature("clients_edit"), authMiddleware, requirePermission("clients", "edit"), async (req, res) => {
  try {
    const { name, email, gstin, billingAddress, shippingAddress } = req.body;
    if (!isFeatureEnabled("clients_gstin") && gstin) {
      return res.status(403).json({ error: "GSTIN feature is disabled" });
    }
    if (!isFeatureEnabled("clients_billingAddress") && billingAddress) {
      return res.status(403).json({ error: "Billing Address feature is disabled" });
    }
    if (!isFeatureEnabled("clients_shippingAddress") && shippingAddress) {
      return res.status(403).json({ error: "Shipping Address feature is disabled" });
    }
    if (!name || !email) {
      return res.status(400).json({ error: "Client name and email are required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    const client = await storage.updateClient(req.params.id, req.body);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    await storage.createActivityLog({
      userId: req.user.id,
      action: "update_client",
      entityType: "client",
      entityId: client.id
    });
    return res.json(client);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to update client" });
  }
});
router4.delete("/:id", requireFeature("clients_delete"), authMiddleware, requirePermission("clients", "delete"), async (req, res) => {
  try {
    await storage.deleteClient(req.params.id);
    await storage.createActivityLog({
      userId: req.user.id,
      action: "delete_client",
      entityType: "client",
      entityId: req.params.id
    });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete client" });
  }
});
router4.get("/:clientId/tags", authMiddleware, requireFeature("clients_tags"), async (req, res) => {
  try {
    const tags = await storage.getClientTags(req.params.clientId);
    return res.json(tags);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch client tags" });
  }
});
router4.post("/:clientId/tags", authMiddleware, requireFeature("clients_tags"), async (req, res) => {
  try {
    const { tag } = req.body;
    if (!tag) {
      return res.status(400).json({ error: "Tag is required" });
    }
    const clientTag = await storage.addClientTag({
      clientId: req.params.clientId,
      tag
    });
    await storage.createActivityLog({
      userId: req.user.id,
      action: "add_client_tag",
      entityType: "client",
      entityId: req.params.clientId
    });
    return res.json(clientTag);
  } catch (error) {
    return res.status(500).json({ error: "Failed to add tag" });
  }
});
router4.delete("/tags/:tagId", authMiddleware, requireFeature("clients_tags"), async (req, res) => {
  try {
    await storage.removeClientTag(req.params.tagId);
    await storage.createActivityLog({
      userId: req.user.id,
      action: "remove_client_tag",
      entityType: "client_tag",
      entityId: req.params.tagId
    });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to remove tag" });
  }
});
router4.get("/:clientId/communications", authMiddleware, requireFeature("clients_communicationHistory"), async (req, res) => {
  try {
    const communications = await storage.getClientCommunications(req.params.clientId);
    return res.json(communications);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch communications" });
  }
});
router4.post("/:clientId/communications", authMiddleware, requireFeature("clients_communicationHistory"), async (req, res) => {
  try {
    const { type, subject, message, attachments } = req.body;
    if (!type || !["email", "call", "meeting", "note"].includes(type)) {
      return res.status(400).json({ error: "Valid communication type is required" });
    }
    const communication = await storage.createClientCommunication({
      clientId: req.params.clientId,
      type,
      subject,
      message,
      date: /* @__PURE__ */ new Date(),
      communicatedBy: req.user.id,
      attachments: attachments ? JSON.stringify(attachments) : void 0
    });
    await storage.createActivityLog({
      userId: req.user.id,
      action: "create_communication",
      entityType: "client",
      entityId: req.params.clientId
    });
    return res.json(communication);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to create communication" });
  }
});
router4.delete("/communications/:commId", authMiddleware, requireFeature("clients_communicationHistory"), async (req, res) => {
  try {
    await storage.deleteClientCommunication(req.params.commId);
    await storage.createActivityLog({
      userId: req.user.id,
      action: "delete_communication",
      entityType: "client_communication",
      entityId: req.params.commId
    });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete communication" });
  }
});
var clients_routes_default = router4;

// server/routes/quotes.routes.ts
init_storage();
import { Router as Router5 } from "express";
init_numbering_service();
init_logger();

// server/services/pdf.service.ts
import PDFDocument3 from "pdfkit";
import path4 from "path";
import fs4 from "fs";

// server/services/pdf-themes.ts
var professionalTheme = {
  name: "professional",
  displayName: "Professional",
  description: "Classic corporate design with navy blue accents (original theme)",
  colors: {
    primary: "#0f172a",
    // Original default PRIMARY
    primaryLight: "#1e293b",
    // Original default PRIMARY_LIGHT
    accent: "#3b82f6",
    // Original default ACCENT
    accentLight: "#60a5fa",
    // Original default ACCENT_LIGHT
    text: "#1e293b",
    // Original default TEXT
    muted: "#64748b",
    // Original default MUTED
    border: "#e2e8f0",
    // Original default BORDER
    bgSoft: "#f8fafc",
    // Original default BG_SOFT
    bgAlt: "#f1f5f9",
    // Original default BG_ALT
    success: "#10b981",
    // Original default SUCCESS
    warning: "#f59e0b"
    // Original default WARNING
  },
  fonts: {
    heading: "Helvetica-Bold",
    body: "Helvetica",
    bold: "Helvetica-Bold"
  },
  styles: {
    headerStyle: "wave",
    borderRadius: 0,
    shadowIntensity: "light",
    spacing: "normal"
  }
};
var modernTheme = {
  name: "modern",
  displayName: "Modern",
  description: "Contemporary design with vibrant colors and clean lines",
  colors: {
    primary: "#6366f1",
    primaryLight: "#818cf8",
    accent: "#ec4899",
    accentLight: "#f472b6",
    text: "#111827",
    muted: "#6b7280",
    border: "#e5e7eb",
    bgSoft: "#faf5ff",
    bgAlt: "#f3f4f6",
    success: "#34d399",
    warning: "#fbbf24"
  },
  fonts: {
    heading: "Helvetica-Bold",
    body: "Helvetica",
    bold: "Helvetica-Bold"
  },
  styles: {
    headerStyle: "gradient",
    borderRadius: 4,
    shadowIntensity: "medium",
    spacing: "spacious"
  }
};
var minimalTheme = {
  name: "minimal",
  displayName: "Minimal",
  description: "Clean and simple design with focus on content",
  colors: {
    primary: "#18181b",
    primaryLight: "#27272a",
    accent: "#71717a",
    accentLight: "#a1a1aa",
    text: "#09090b",
    muted: "#71717a",
    border: "#e4e4e7",
    bgSoft: "#fafafa",
    bgAlt: "#f4f4f5",
    success: "#22c55e",
    warning: "#eab308"
  },
  fonts: {
    heading: "Helvetica-Bold",
    body: "Helvetica",
    bold: "Helvetica-Bold"
  },
  styles: {
    headerStyle: "minimal",
    borderRadius: 0,
    shadowIntensity: "none",
    spacing: "spacious"
  }
};
var creativeTheme = {
  name: "creative",
  displayName: "Creative",
  description: "Bold and colorful design for creative industries",
  colors: {
    primary: "#7c3aed",
    primaryLight: "#8b5cf6",
    accent: "#f59e0b",
    accentLight: "#fbbf24",
    text: "#1f2937",
    muted: "#6b7280",
    border: "#d1d5db",
    bgSoft: "#fef3c7",
    bgAlt: "#fef9c3",
    success: "#10b981",
    warning: "#ef4444"
  },
  fonts: {
    heading: "Helvetica-Bold",
    body: "Helvetica",
    bold: "Helvetica-Bold"
  },
  styles: {
    headerStyle: "modern",
    borderRadius: 8,
    shadowIntensity: "strong",
    spacing: "normal"
  }
};
var premiumTheme = {
  name: "premium",
  displayName: "Premium",
  description: "Luxurious design with gold accents for premium clients",
  colors: {
    primary: "#1e1b4b",
    primaryLight: "#312e81",
    accent: "#d97706",
    accentLight: "#f59e0b",
    text: "#0f172a",
    muted: "#475569",
    border: "#cbd5e1",
    bgSoft: "#fef9c3",
    bgAlt: "#fefce8",
    success: "#059669",
    warning: "#dc2626"
  },
  fonts: {
    heading: "Helvetica-Bold",
    body: "Helvetica",
    bold: "Helvetica-Bold"
  },
  styles: {
    headerStyle: "corporate",
    borderRadius: 2,
    shadowIntensity: "strong",
    spacing: "spacious"
  }
};
var governmentTheme = {
  name: "government",
  displayName: "Government",
  description: "Formal and structured design for government entities",
  colors: {
    primary: "#1e3a8a",
    primaryLight: "#1e40af",
    accent: "#0369a1",
    accentLight: "#0284c7",
    text: "#1e293b",
    muted: "#64748b",
    border: "#cbd5e1",
    bgSoft: "#f8fafc",
    bgAlt: "#f1f5f9",
    success: "#16a34a",
    warning: "#ea580c"
  },
  fonts: {
    heading: "Helvetica-Bold",
    body: "Helvetica",
    bold: "Helvetica-Bold"
  },
  styles: {
    headerStyle: "corporate",
    borderRadius: 0,
    shadowIntensity: "none",
    spacing: "compact"
  }
};
var educationTheme = {
  name: "education",
  displayName: "Education",
  description: "Friendly and approachable design for education sector",
  colors: {
    primary: "#0891b2",
    primaryLight: "#06b6d4",
    accent: "#14b8a6",
    accentLight: "#2dd4bf",
    text: "#0f172a",
    muted: "#64748b",
    border: "#cbd5e1",
    bgSoft: "#f0fdfa",
    bgAlt: "#ccfbf1",
    success: "#10b981",
    warning: "#f97316"
  },
  fonts: {
    heading: "Helvetica-Bold",
    body: "Helvetica",
    bold: "Helvetica-Bold"
  },
  styles: {
    headerStyle: "modern",
    borderRadius: 4,
    shadowIntensity: "light",
    spacing: "normal"
  }
};
var themeRegistry = {
  professional: professionalTheme,
  modern: modernTheme,
  minimal: minimalTheme,
  creative: creativeTheme,
  premium: premiumTheme,
  government: governmentTheme,
  education: educationTheme
};
var segmentThemeMapping = {
  enterprise: "premium",
  corporate: "professional",
  startup: "modern",
  government: "government",
  education: "education",
  creative: "creative"
};
function getTheme(themeName) {
  if (!themeName) return professionalTheme;
  return themeRegistry[themeName] || professionalTheme;
}
function getSuggestedTheme(segment) {
  if (!segment) return professionalTheme;
  const themeName = segmentThemeMapping[segment] || "professional";
  return getTheme(themeName);
}

// server/services/pdf.service.ts
var PDFService = class _PDFService {
  // ===== A4 =====
  static PAGE_WIDTH = 595.28;
  static PAGE_HEIGHT = 841.89;
  // ===== Compact margins =====
  static MARGIN_LEFT = 28;
  static MARGIN_RIGHT = 28;
  static MARGIN_TOP = 22;
  static MARGIN_BOTTOM = 32;
  static CONTENT_WIDTH = _PDFService.PAGE_WIDTH - _PDFService.MARGIN_LEFT - _PDFService.MARGIN_RIGHT;
  // ===== Footer safety (prevents content overlapping footer line/text) =====
  static FOOTER_TOP = _PDFService.PAGE_HEIGHT - 34;
  // matches drawFooter()
  static FOOTER_SAFE_GAP = 10;
  // extra breathing room
  static HEADER_H = 70;
  // fixed header block height
  // ===== Palette =====
  static INK = "#111827";
  static SUBTLE = "#4B5563";
  static FAINT = "#9CA3AF";
  static LINE = "#D1D5DB";
  static SOFT = "#F3F4F6";
  static SURFACE = "#FFFFFF";
  static ACCENT = "#111827";
  static SUCCESS = "#16A34A";
  static WARNING = "#F59E0B";
  static DANGER = "#B91C1C";
  static activeTheme = null;
  // ===== Fonts =====
  static FONT_REG = "Helvetica";
  static FONT_BOLD = "Helvetica-Bold";
  // ===== Stroke & padding =====
  static STROKE_W = 0.9;
  static PAD_X = 8;
  // ======================================================================
  // PUBLIC
  // ======================================================================
  // ======================================================================
  // WORKER SUPPORT
  // ======================================================================
  static async generateQuotePDFInWorker(data) {
    const { Worker } = await import("worker_threads");
    return new Promise(async (resolve, reject) => {
      try {
        let workerPath;
        if (process.env.NODE_ENV === "production") {
          workerPath = path4.join(process.cwd(), "dist", "workers", "pdf.worker.js");
        } else {
          workerPath = path4.join(process.cwd(), "server", "workers", "pdf.worker.ts");
        }
        const execArgv = [];
        if (process.env.NODE_ENV !== "production") {
          const { pathToFileURL } = await import("url");
          try {
            const tsxLoaderPath = path4.resolve("node_modules/tsx/dist/loader.mjs");
            const loaderUrl = pathToFileURL(tsxLoaderPath).href;
            execArgv.push("--import", loaderUrl);
          } catch (e) {
          }
        }
        const worker = new Worker(workerPath, {
          execArgv,
          workerData: data
        });
        worker.on("message", (msg) => {
          if (msg.status === "success") {
            resolve(Buffer.from(msg.buffer));
          } else {
            reject(new Error(msg.error));
          }
          worker.terminate();
        });
        worker.on("error", (err) => {
          reject(err);
          worker.terminate();
        });
        worker.on("exit", (code) => {
          if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        });
        worker.postMessage(data);
      } catch (error) {
        reject(error);
      }
    });
  }
  static async generateQuotePDF(data, res) {
    let selectedTheme;
    if (data.theme) selectedTheme = getTheme(data.theme);
    else if (data.client.preferredTheme)
      selectedTheme = getTheme(data.client.preferredTheme);
    else if (data.client.segment)
      selectedTheme = getSuggestedTheme(data.client.segment);
    else selectedTheme = getTheme("professional");
    this.applyTheme(selectedTheme);
    const doc = new PDFDocument3({
      size: "A4",
      margins: {
        top: this.MARGIN_TOP,
        bottom: this.MARGIN_BOTTOM,
        left: this.MARGIN_LEFT,
        right: this.MARGIN_RIGHT
      },
      bufferPages: true,
      info: {
        Title: `Quote ${data.quote.quoteNumber}`,
        // Assuming quoteNumber is on data.quote
        Author: data.companyName || "AICERA"
      }
    });
    doc.pipe(res);
    await this.prepareAssets(doc, data);
    doc.lineGap(2);
    if (this.clean(data.abstract)) {
      this.drawCover(doc, data);
      doc.addPage();
    }
    this.drawHeader(doc, data, "COMMERCIAL PROPOSAL");
    this.drawFromBox(doc, data);
    this.drawShipBillAndMetaRow(doc, data);
    this.drawItemsTable(doc, data);
    this.drawWordsTermsTotalsRow(doc, data);
    this.drawDeclarationBankRow(doc, data);
    this.drawSignaturesRow(doc, data);
    const range = doc.bufferedPageRange();
    const total = range.count;
    for (let i = 0; i < total; i++) {
      doc.switchToPage(i);
      this.drawFooter(doc, i + 1, total);
    }
    doc.end();
  }
  // Optimize: Check assets async
  static async prepareAssets(doc, data) {
    const fontsDir = path4.join(process.cwd(), "server", "pdf", "fonts");
    const tryFont = async (filename) => {
      try {
        const p = path4.join(fontsDir, filename);
        await fs4.promises.access(p, fs4.constants.F_OK);
        return p;
      } catch {
        return null;
      }
    };
    const [robotoReg, robotoBold] = await Promise.all([
      tryFont("Roboto-Regular.ttf"),
      tryFont("Roboto-Bold.ttf")
    ]);
    if (robotoReg && robotoBold) {
      doc.registerFont("Helvetica", robotoReg);
      doc.registerFont("Helvetica-Bold", robotoBold);
      this.FONT_REG = "Helvetica";
      this.FONT_BOLD = "Helvetica-Bold";
    } else {
      const [regPath, boldPath] = await Promise.all([
        tryFont("Inter-Regular.ttf"),
        tryFont("Inter-Bold.ttf")
      ]);
      if (regPath && boldPath) {
        doc.registerFont("Inter", regPath);
        doc.registerFont("Inter-Bold", boldPath);
        this.FONT_REG = "Inter";
        this.FONT_BOLD = "Inter-Bold";
      } else {
        this.FONT_REG = "Helvetica";
        this.FONT_BOLD = "Helvetica-Bold";
      }
    }
    let logoToUse = "";
    const { logo, mimeType } = await prepareLogo(data.companyLogo);
    data.resolvedLogo = logo;
    data.logoMimeType = mimeType;
  }
  // ======================================================================
  // THEME + FONTS
  // ======================================================================
  static applyTheme(theme) {
    this.activeTheme = theme;
    this.ACCENT = theme.colors?.accent || "#111827";
    this.INK = "#111827";
    this.SUBTLE = "#4B5563";
    this.FAINT = "#9CA3AF";
    this.LINE = "#D1D5DB";
    this.SOFT = "#F3F4F6";
    this.SURFACE = "#FFFFFF";
    this.SUCCESS = theme.colors?.success || "#16A34A";
    this.WARNING = theme.colors?.warning || "#F59E0B";
  }
  // No-op or deprecated
  static setupFonts(doc) {
  }
  // ======================================================================
  // HELPERS
  // ======================================================================
  static bottomY() {
    return this.FOOTER_TOP - this.FOOTER_SAFE_GAP;
  }
  static ensureSpace(doc, data, needed) {
    if (doc.y + needed <= this.bottomY()) return;
    doc.addPage();
    this.drawHeader(doc, data, "COMMERCIAL PROPOSAL");
  }
  static clean(v) {
    return String(v ?? "").trim();
  }
  static safeDate(d) {
    try {
      if (!d) return "-";
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return "-";
      return dt.toLocaleDateString("en-IN");
    } catch {
      return "-";
    }
  }
  static currency(v, currencyCode = "INR") {
    return formatCurrencyPdf(v, currencyCode);
  }
  static normalizeAddress(addr, maxLines = 3) {
    if (!addr) return "";
    const rawParts = String(addr).split(/[\n,]/g).map((s) => s.trim()).filter(Boolean);
    const seen = /* @__PURE__ */ new Set();
    const parts = [];
    for (const p of rawParts) {
      const key = p.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      parts.push(p);
    }
    return parts.slice(0, Math.max(3, maxLines * 2)).join(", ");
  }
  // ===== Invoice-style box drawing =====
  static box(doc, x, y, w, h, opts) {
    doc.save();
    if (opts?.fill) doc.fillColor(opts.fill).rect(x, y, w, h).fill();
    doc.strokeColor(opts?.stroke ?? this.LINE).lineWidth(opts?.lineWidth ?? this.STROKE_W).rect(x, y, w, h).stroke();
    doc.restore();
  }
  static hLine(doc, x1, x2, y) {
    doc.save();
    doc.strokeColor(this.LINE).lineWidth(0.8);
    doc.moveTo(x1, y).lineTo(x2, y).stroke();
    doc.restore();
  }
  static label(doc, txt, x, y) {
    doc.save();
    doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(String(txt).toUpperCase(), x, y, {
      characterSpacing: 0.6,
      lineBreak: false
    });
    doc.restore();
  }
  static truncateToWidth(doc, text2, width, suffix = "\u2026") {
    const t = this.clean(text2);
    if (!t) return "";
    if (doc.widthOfString(t) <= width) return t;
    let lo = 0;
    let hi = t.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      const cand = t.slice(0, mid) + suffix;
      if (doc.widthOfString(cand) <= width) lo = mid + 1;
      else hi = mid;
    }
    const cut = Math.max(0, lo - 1);
    return t.slice(0, cut) + suffix;
  }
  static wrapLines(doc, text2, width, maxLines) {
    const t = this.clean(text2).replace(/\s+/g, " ");
    if (!t) return [];
    const height = doc.heightOfString(t, { width });
    if (doc.widthOfString(t) <= width) return [t];
    const words = t.split(" ");
    const lines = [];
    let line = "";
    for (const w of words) {
      const cand = line ? `${line} ${w}` : w;
      if (doc.widthOfString(cand) <= width) {
        line = cand;
      } else {
        if (line) lines.push(line);
        line = w;
        if (lines.length >= maxLines) break;
      }
    }
    if (line && lines.length < maxLines) lines.push(line);
    return lines.slice(0, maxLines);
  }
  // ======================================================================
  // COVER (optional)
  // ======================================================================
  static drawCover(doc, data) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    doc.font(this.FONT_BOLD).fontSize(18).fillColor(this.INK);
    doc.text("COMMERCIAL PROPOSAL", x, 120, { width: w });
    doc.font(this.FONT_REG).fontSize(10).fillColor(this.SUBTLE);
    doc.text(`Quote No: ${this.clean(data.quote.quoteNumber || "-")}`, x, 148, { width: w });
    doc.y = 176;
    this.hLine(doc, x, x + w, doc.y);
    doc.y += 18;
    this.label(doc, "Abstract", x, doc.y);
    doc.y += 12;
    doc.font(this.FONT_REG).fontSize(10).fillColor(this.INK);
    doc.text(this.clean(data.abstract), x, doc.y, { width: w, lineGap: 3 });
  }
  // ======================================================================
  // HEADER (fixed-height, deterministic)
  // ======================================================================
  static drawHeader(doc, data, title) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    const topY = doc.page.margins.top;
    const logoSize = 26;
    let logoPrinted = false;
    const logoPath = data.resolvedLogo;
    const mimeType = data.logoMimeType || "";
    if (logoPath) {
      const drawn = drawLogo(doc, logoPath, mimeType, x, topY + 12, logoSize);
      logoPrinted = drawn;
    }
    doc.font(this.FONT_BOLD).fontSize(11).fillColor(this.INK);
    doc.text(title, x, topY - 2, { width: w, align: "center", lineBreak: false });
    const leftX = logoPrinted ? x + logoSize + 8 : x;
    const leftW = 320;
    const company = this.clean(data.companyName || "AICERA");
    const contactBits = [];
    if (data.companyEmail) contactBits.push(this.clean(data.companyEmail));
    if (data.companyPhone) contactBits.push(this.clean(data.companyPhone));
    if (data.companyGSTIN) contactBits.push(`GSTIN: ${this.clean(data.companyGSTIN).toUpperCase()}`);
    const contactLine = contactBits.join("  |  ");
    doc.font(this.FONT_BOLD).fontSize(10).fillColor(this.INK);
    doc.text(company, leftX, topY + 12, { width: leftW, lineBreak: false });
    if (contactLine) {
      doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
      doc.text(this.truncateToWidth(doc, contactLine, leftW), leftX, topY + 24, {
        width: leftW,
        lineBreak: false
      });
    }
    const addr = this.normalizeAddress(data.companyAddress, 2);
    if (addr) {
      doc.font(this.FONT_REG).fontSize(7).fillColor(this.SUBTLE);
      doc.text(addr, leftX, topY + 34, { width: leftW });
    }
    const rightW = 210;
    const rightX = x + w - rightW;
    const quoteNo = this.clean(data.quote.quoteNumber || "-");
    const date = this.safeDate(data.quote.quoteDate);
    doc.font(this.FONT_REG).fontSize(7).fillColor(this.SUBTLE);
    doc.text("Quote No.", rightX, topY + 12, { width: rightW, align: "right", lineBreak: false });
    doc.font(this.FONT_BOLD).fontSize(9.6).fillColor(this.INK);
    doc.text(quoteNo, rightX, topY + 22, { width: rightW, align: "right", lineBreak: false });
    doc.font(this.FONT_REG).fontSize(7).fillColor(this.SUBTLE);
    doc.text("Date", rightX, topY + 34, { width: rightW, align: "right", lineBreak: false });
    doc.font(this.FONT_BOLD).fontSize(8.6).fillColor(this.INK);
    doc.text(date, rightX, topY + 44, { width: rightW, align: "right", lineBreak: false });
    const headerBottom = topY + this.HEADER_H;
    this.hLine(doc, x, x + w, headerBottom - 10);
    doc.y = headerBottom;
  }
  // ======================================================================
  // FROM
  // ======================================================================
  static drawFromBox(doc, data) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    const name = this.clean(data.companyName || "AICERA");
    const addr = this.normalizeAddress(data.companyAddress, 10) || "-";
    doc.font(this.FONT_BOLD).fontSize(8.6);
    const nameH = doc.heightOfString(name, { width: w - this.PAD_X * 2 });
    doc.font(this.FONT_REG).fontSize(7.2);
    const addrH = doc.heightOfString(addr, { width: w - this.PAD_X * 2 });
    const contactBits = [];
    if (data.companyPhone) contactBits.push(`Ph: ${this.clean(data.companyPhone)}`);
    if (data.companyGSTIN) contactBits.push(`GSTIN: ${this.clean(data.companyGSTIN).toUpperCase()}`);
    if (data.preparedByEmail) contactBits.push(`Email: ${this.clean(data.preparedByEmail)}`);
    doc.font(this.FONT_REG).fontSize(7);
    const contactText = contactBits.join("  |  ");
    const contactH = contactBits.length ? doc.heightOfString(contactText, { width: w - this.PAD_X * 2 }) : 0;
    const contentH = 6 + 10 + nameH + 2 + addrH + (contactH ? 8 + contactH : 0) + 6;
    const h = Math.max(contentH, 58);
    this.ensureSpace(doc, data, h + 10);
    const y0 = doc.y;
    this.box(doc, x, y0, w, h, { fill: this.SURFACE });
    this.label(doc, "From", x + this.PAD_X, y0 + 6);
    let cy = y0 + 18;
    doc.font(this.FONT_BOLD).fontSize(8.6).fillColor(this.INK);
    doc.text(name, x + this.PAD_X, cy, { width: w - this.PAD_X * 2 });
    cy += nameH + 2;
    doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(addr, x + this.PAD_X, cy, { width: w - this.PAD_X * 2 });
    if (contactBits.length) {
      doc.font(this.FONT_REG).fontSize(7).fillColor(this.SUBTLE);
      const contactY = y0 + h - contactH - 6;
      doc.text(contactText, x + this.PAD_X, contactY, {
        width: w - this.PAD_X * 2
      });
    }
    doc.y = y0 + h + 10;
  }
  // ======================================================================
  // SHIP/BILL + META
  // ======================================================================
  static drawShipBillAndMetaRow(doc, data) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    const gap = 10;
    const leftW = w * 0.56;
    const rightW = w - leftW - gap;
    const clientName = this.clean(data.client.name || "-");
    const shipAddr = this.normalizeAddress(data.client.shippingAddress || data.client.billingAddress, 10) || "-";
    const billAddr = this.normalizeAddress(data.client.billingAddress, 10) || "-";
    const phone = this.clean(data.client.phone);
    const email = this.clean(data.client.email);
    const contact = [phone ? `Ph: ${phone}` : "", email ? `Email: ${email}` : ""].filter(Boolean).join("  |  ");
    doc.font(this.FONT_BOLD).fontSize(8.6);
    const cNameH = doc.heightOfString(clientName, { width: leftW - this.PAD_X * 2 });
    doc.font(this.FONT_REG).fontSize(7.2);
    const shipAddrH = doc.heightOfString(shipAddr, { width: leftW - this.PAD_X * 2 });
    const shipH = 6 + 10 + cNameH + 2 + shipAddrH + 6;
    const billAddrH = doc.heightOfString(billAddr, { width: leftW - this.PAD_X * 2 });
    doc.font(this.FONT_REG).fontSize(7);
    const contactH = contact ? doc.heightOfString(contact, { width: leftW - this.PAD_X * 2 }) : 0;
    const billH = 6 + 10 + cNameH + 2 + billAddrH + (contactH ? 8 + contactH : 0) + 6;
    const leftTotalH = shipH + 8 + billH;
    const q = data.quote;
    const rows = [
      { k: "Quote Date", v: this.safeDate(q.quoteDate) },
      { k: "Validity", v: q.validUntil ? `Until ${this.safeDate(q.validUntil)}` : `${Number(q.validityDays || 30)} days` },
      { k: "Reference", v: this.clean(q.referenceNumber || "-") },
      { k: "Prepared By", v: this.clean(data.preparedBy || "-") }
    ];
    const h = Math.max(leftTotalH, 130);
    this.ensureSpace(doc, data, h + 10);
    const y0 = doc.y;
    const leftX = x;
    const rightX = x + leftW + gap;
    this.box(doc, leftX, y0, leftW, h, { fill: this.SURFACE });
    const minBillSpace = 48;
    const idealSplitY = y0 + shipH + 8;
    const splitY = Math.min(idealSplitY, y0 + h - minBillSpace);
    this.hLine(doc, leftX, leftX + leftW, splitY);
    this.label(doc, "Consignee (Ship To)", leftX + this.PAD_X, y0 + 6);
    let cy = y0 + 18;
    doc.font(this.FONT_BOLD).fontSize(8.6).fillColor(this.INK);
    doc.text(clientName, leftX + this.PAD_X, cy, { width: leftW - this.PAD_X * 2 });
    cy += cNameH + 2;
    doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(shipAddr, leftX + this.PAD_X, cy, { width: leftW - this.PAD_X * 2 });
    this.label(doc, "Buyer (Bill To)", leftX + this.PAD_X, splitY + 6);
    cy = splitY + 18;
    doc.font(this.FONT_BOLD).fontSize(8.6).fillColor(this.INK);
    doc.text(clientName, leftX + this.PAD_X, cy, { width: leftW - this.PAD_X * 2 });
    cy += cNameH + 2;
    doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(billAddr, leftX + this.PAD_X, cy, { width: leftW - this.PAD_X * 2 });
    if (contact) {
      doc.font(this.FONT_REG).fontSize(7).fillColor(this.SUBTLE);
      const contactY = y0 + h - contactH - 6;
      doc.text(contact, leftX + this.PAD_X, contactY, {
        width: leftW - this.PAD_X * 2
      });
    }
    this.box(doc, rightX, y0, rightW, h, { fill: this.SURFACE });
    const rowHeight = h / rows.length;
    const labelW = rightW * 0.5;
    const valueW = rightW - labelW - this.PAD_X * 2;
    for (let i = 0; i < rows.length; i++) {
      const ry = y0 + i * rowHeight;
      if (i > 0) this.hLine(doc, rightX, rightX + rightW, ry);
      doc.font(this.FONT_REG).fontSize(7).fillColor(this.SUBTLE);
      doc.text(rows[i].k, rightX + this.PAD_X, ry + rowHeight / 2 - 4, {
        width: labelW - this.PAD_X,
        lineBreak: false
      });
      doc.font(this.FONT_BOLD).fontSize(7.6).fillColor(this.INK);
      const v = this.truncateToWidth(doc, rows[i].v, valueW);
      doc.text(v, rightX + labelW, ry + rowHeight / 2 - 4, {
        width: valueW,
        align: "right",
        lineBreak: false
      });
    }
    doc.y = y0 + h + 10;
  }
  // ======================================================================
  // ITEMS TABLE
  // ======================================================================
  static drawItemsTable(doc, data) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    doc.font(this.FONT_BOLD).fontSize(9.2).fillColor(this.INK);
    doc.text("Description of Goods / Services", x, doc.y);
    doc.y += 6;
    const headerH = 22;
    const minRowH = 20;
    const sl = 24;
    const qty = 40;
    const unit = 40;
    const rate = 72;
    const amt = 86;
    const desc6 = w - (sl + qty + unit + rate + amt);
    const cx = {
      sl: x,
      desc: x + sl,
      qty: x + sl + desc6,
      unit: x + sl + desc6 + qty,
      rate: x + sl + desc6 + qty + unit,
      amt: x + sl + desc6 + qty + unit + rate,
      right: x + w
    };
    const drawHeader = (yy) => {
      this.box(doc, x, yy, w, headerH, { fill: this.SOFT, stroke: this.LINE, lineWidth: 0.9 });
      doc.save();
      doc.strokeColor(this.LINE).lineWidth(0.8);
      [cx.desc, cx.qty, cx.unit, cx.rate, cx.amt].forEach((vx) => {
        doc.moveTo(vx, yy).lineTo(vx, yy + headerH).stroke();
      });
      doc.restore();
      doc.font(this.FONT_REG).fontSize(7).fillColor(this.SUBTLE);
      doc.text("SL", cx.sl, yy + 7, { width: sl, align: "center", characterSpacing: 0.6, lineBreak: false });
      doc.text("DESCRIPTION", cx.desc + 4, yy + 7, { width: desc6 - 8, align: "left", characterSpacing: 0.6, lineBreak: false });
      doc.text("QTY", cx.qty, yy + 7, { width: qty, align: "center", characterSpacing: 0.6, lineBreak: false });
      doc.text("UNIT", cx.unit, yy + 7, { width: unit, align: "center", characterSpacing: 0.6, lineBreak: false });
      doc.text("RATE", cx.rate, yy + 7, { width: rate - 8, align: "right", characterSpacing: 0.6, lineBreak: false });
      doc.text("AMOUNT", cx.amt, yy + 7, { width: amt - 8, align: "right", characterSpacing: 0.6, lineBreak: false });
    };
    this.ensureSpace(doc, data, headerH + minRowH + 10);
    let y = doc.y;
    drawHeader(y);
    y += headerH;
    const items = data.items || [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const descText = this.clean(it.description || "-");
      const qtyVal = Number(it.quantity ?? 0) || 0;
      const unitText = this.clean(it.unit || it.uom || it.unitName || "pcs");
      const rateVal = Number(it.unitPrice ?? 0) || 0;
      const amtVal = Number(it.subtotal ?? qtyVal * rateVal) || 0;
      doc.save();
      doc.font(this.FONT_REG).fontSize(8).fillColor(this.INK);
      const descLines = this.wrapLines(doc, descText, desc6 - 8, 30);
      doc.restore();
      const rowH = Math.max(minRowH, 8 + descLines.length * 11);
      if (y + rowH > this.bottomY() - 6) {
        doc.addPage();
        this.drawHeader(doc, data, "COMMERCIAL PROPOSAL");
        doc.font(this.FONT_BOLD).fontSize(9.2).fillColor(this.INK);
        doc.text("Description of Goods / Services (cont.)", x, doc.y);
        doc.y += 6;
        this.ensureSpace(doc, data, headerH + minRowH + 10);
        y = doc.y;
        drawHeader(y);
        y += headerH;
      }
      this.box(doc, x, y, w, rowH, { fill: this.SURFACE });
      doc.save();
      doc.strokeColor(this.LINE).lineWidth(0.8);
      [cx.desc, cx.qty, cx.unit, cx.rate, cx.amt].forEach((vx) => {
        doc.moveTo(vx, y).lineTo(vx, y + rowH).stroke();
      });
      doc.restore();
      doc.font(this.FONT_REG).fontSize(8).fillColor(this.INK);
      doc.text(String(i + 1), cx.sl, y + 6, { width: sl, align: "center", lineBreak: false });
      let dy = y + 6;
      for (const ln of descLines) {
        doc.text(ln, cx.desc + 4, dy, { width: desc6 - 8, lineBreak: false });
        dy += 11;
      }
      const midY = y + 6;
      doc.font(this.FONT_REG).fontSize(8).fillColor(this.INK);
      doc.text(String(qtyVal), cx.qty, midY, { width: qty, align: "center", lineBreak: false });
      doc.text(unitText, cx.unit, midY, { width: unit, align: "center", lineBreak: false });
      doc.font(this.FONT_BOLD).fontSize(8).fillColor(this.INK);
      doc.text(this.currency(rateVal, data.quote.currency), cx.rate, midY, { width: rate - 8, align: "right", lineBreak: false });
      doc.text(this.currency(amtVal, data.quote.currency), cx.amt, midY, { width: amt - 8, align: "right", lineBreak: false });
      y += rowH;
    }
    doc.y = y + 8;
  }
  // ======================================================================
  // WORDS + TERMS (left) + TOTALS (right)
  // ======================================================================
  static drawWordsTermsTotalsRow(doc, data) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    const gap = 10;
    const leftW = w * 0.58;
    const rightW = w - leftW - gap;
    const q = data.quote;
    const total = Number(q.total) || 0;
    const amountWords = this.amountToINRWords(total);
    const termsInline = this.termsToInlineBullets(this.clean(q.termsAndConditions || "")) || "\u2014";
    doc.font(this.FONT_REG).fontSize(7.2);
    const termsLines = this.wrapLines(doc, termsInline, leftW - this.PAD_X * 2, 12);
    doc.font(this.FONT_BOLD).fontSize(7.8);
    const wordLines = this.wrapLines(doc, amountWords, leftW - this.PAD_X * 2, 3);
    const leftH = 6 + 12 + wordLines.length * 10 + 8 + 12 + termsLines.length * 10 + 10;
    const subtotal = Number(q.subtotal) || 0;
    const shipping = Number(q.shippingCharges) || 0;
    const cgst = Number(q.cgst) || 0;
    const sgst = Number(q.sgst) || 0;
    const igst = Number(q.igst) || 0;
    const rowList = [];
    rowList.push({ k: "Subtotal", v: subtotal });
    if (shipping > 0) rowList.push({ k: "Shipping", v: shipping });
    if (cgst > 0) rowList.push({ k: "CGST", v: cgst });
    if (sgst > 0) rowList.push({ k: "SGST", v: sgst });
    if (igst > 0 && cgst === 0 && sgst === 0) rowList.push({ k: "IGST", v: igst });
    rowList.push({ k: "TOTAL", v: total, bold: true });
    const rightH = 22 + rowList.length * 14 + 12;
    const h = Math.max(leftH, rightH, 122);
    this.ensureSpace(doc, data, h + 12);
    const y0 = doc.y;
    this.box(doc, x, y0, leftW, h, { fill: this.SURFACE });
    this.label(doc, "Amount Chargeable (in words)", x + this.PAD_X, y0 + 6);
    doc.font(this.FONT_BOLD).fontSize(7.8).fillColor(this.INK);
    let wy = y0 + 20;
    for (const wl of wordLines) {
      doc.text(wl, x + this.PAD_X, wy, { width: leftW - this.PAD_X * 2 });
      wy += 10;
    }
    const termsLabelY = wy + 6;
    this.label(doc, "Terms & Conditions", x + this.PAD_X, termsLabelY);
    doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
    let ty = termsLabelY + 12;
    for (const ln of termsLines) {
      doc.text(ln, x + this.PAD_X, ty, { width: leftW - this.PAD_X * 2, lineBreak: false });
      ty += 10;
    }
    const xr = x + leftW + gap;
    this.box(doc, xr, y0, rightW, h, { fill: this.SURFACE });
    this.label(doc, "Totals", xr + this.PAD_X, y0 + 6);
    let ry = y0 + 22;
    const rowH = 14;
    const labelW = rightW * 0.55;
    const valueW = rightW - labelW - this.PAD_X * 2;
    for (const r of rowList) {
      doc.font(this.FONT_BOLD).fontSize(r.bold ? 8.6 : 7.6).fillColor(this.INK);
      doc.text(r.k, xr + this.PAD_X, ry, { width: labelW - this.PAD_X, lineBreak: false });
      const moneyStr = this.currency(r.v, data.quote.currency);
      doc.font(this.FONT_BOLD).fontSize(r.bold ? 9 : 8).fillColor(r.danger ? this.DANGER : this.INK);
      doc.text(moneyStr, xr + labelW, ry, {
        width: valueW,
        align: "right",
        lineBreak: false
      });
      ry += rowH;
    }
    doc.y = y0 + h + 12;
  }
  // ======================================================================
  // DECLARATION + BANK
  // ======================================================================
  static drawDeclarationBankRow(doc, data) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    const gap = 10;
    const colW = Math.floor((w - gap) / 2);
    const declaration = this.clean(data.declarationText) || "We declare that this proposal shows the actual price of the goods/services described and that all particulars are true and correct.";
    doc.font(this.FONT_REG).fontSize(7.2);
    const declLines = this.wrapLines(doc, declaration, colW - this.PAD_X * 2, 10);
    const declH = 20 + declLines.length * 9 + 10;
    const bd = data.bankDetails || {};
    const bankLines = [];
    if (bd.accountName) bankLines.push(`A/c Name: ${bd.accountName}`);
    if (bd.bankName) bankLines.push(`Bank: ${bd.bankName}`);
    if (bd.accountNumber) bankLines.push(`A/c No: ${bd.accountNumber}`);
    if (bd.ifsc) bankLines.push(`IFSC: ${bd.ifsc}`);
    if (bd.branch) bankLines.push(`Branch: ${bd.branch}`);
    if (bd.swift) bankLines.push(`SWIFT: ${bd.swift}`);
    if (bd.upi) bankLines.push(`UPI: ${bd.upi}`);
    const bankText = bankLines.length ? bankLines.join("  |  ") : "\u2014";
    doc.font(this.FONT_BOLD).fontSize(7.2);
    const bankLines2 = this.wrapLines(doc, bankText, colW - this.PAD_X * 2, 10);
    const bankH = 20 + bankLines2.length * 9 + 10;
    const h = Math.max(declH, bankH, 76);
    this.ensureSpace(doc, data, h + 12);
    const y0 = doc.y;
    this.box(doc, x, y0, colW, h, { fill: this.SURFACE });
    this.label(doc, "Declaration", x + this.PAD_X, y0 + 6);
    doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
    let dy = y0 + 20;
    for (const ln of declLines) {
      doc.text(ln, x + this.PAD_X, dy, { width: colW - this.PAD_X * 2, lineBreak: false });
      dy += 9;
    }
    const xr = x + colW + gap;
    this.box(doc, xr, y0, colW, h, { fill: this.SURFACE });
    this.label(doc, "Company Bank Details for Payment", xr + this.PAD_X, y0 + 6);
    doc.font(this.FONT_BOLD).fontSize(7.2).fillColor(this.INK);
    let by = y0 + 20;
    for (const ln of bankLines2) {
      doc.text(ln, xr + this.PAD_X, by, { width: colW - this.PAD_X * 2, lineBreak: false });
      by += 9;
    }
    doc.y = y0 + h + 12;
  }
  // ======================================================================
  // SIGNATURES
  // ======================================================================
  static drawSignaturesRow(doc, data) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    const gap = 10;
    const colW = Math.floor((w - gap) / 2);
    const h = 74;
    this.ensureSpace(doc, data, h + 10);
    const y0 = doc.y;
    this.box(doc, x, y0, colW, h, { fill: this.SURFACE });
    this.label(doc, "Client Acceptance", x + this.PAD_X, y0 + 6);
    doc.font(this.FONT_REG).fontSize(8.8).fillColor(this.SUBTLE);
    doc.text(this.clean(data.clientAcceptanceLabel || "Customer Seal & Signature"), x + this.PAD_X, y0 + 20, {
      width: colW - this.PAD_X * 2
    });
    this.hLine(doc, x + this.PAD_X, x + colW - this.PAD_X, y0 + h - 24);
    doc.font(this.FONT_REG).fontSize(8.2).fillColor(this.SUBTLE);
    doc.text("Date:", x + this.PAD_X, y0 + h - 16, { width: colW - this.PAD_X * 2, lineBreak: false });
    const xr = x + colW + gap;
    this.box(doc, xr, y0, colW, h, { fill: this.SURFACE });
    this.label(doc, "For Company", xr + this.PAD_X, y0 + 6);
    const company = this.clean(data.companyName || "AICERA");
    doc.font(this.FONT_REG).fontSize(8.8).fillColor(this.SUBTLE);
    doc.text(`For ${company}`, xr + this.PAD_X, y0 + 20, { width: colW - this.PAD_X * 2 });
    this.hLine(doc, xr + this.PAD_X, xr + colW - this.PAD_X, y0 + h - 24);
    doc.font(this.FONT_REG).fontSize(8.2).fillColor(this.SUBTLE);
    doc.text("Authorised Signatory", xr + this.PAD_X, y0 + h - 16, { width: colW - this.PAD_X * 2, lineBreak: false });
    doc.y = y0 + h + 10;
  }
  // ======================================================================
  // FOOTER
  // ======================================================================
  static drawFooter(doc, page, total) {
    const footerTop = this.FOOTER_TOP;
    const prevBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.save();
    doc.strokeColor(this.LINE).lineWidth(this.STROKE_W);
    doc.moveTo(this.MARGIN_LEFT, footerTop).lineTo(this.PAGE_WIDTH - this.MARGIN_RIGHT, footerTop).stroke();
    doc.font(this.FONT_REG).fontSize(8).fillColor(this.FAINT);
    doc.text("This is a Computer Generated Document", 0, footerTop + 7, {
      width: this.PAGE_WIDTH,
      align: "center",
      lineBreak: false
    });
    doc.text(`Page ${page} of ${total}`, 0, footerTop + 19, {
      width: this.PAGE_WIDTH,
      align: "center",
      lineBreak: false
    });
    doc.restore();
    doc.page.margins.bottom = prevBottom;
  }
  // ======================================================================
  // AMOUNT IN WORDS (INR)
  // ======================================================================
  static amountToINRWords(amount) {
    const rupees = Math.floor(Math.abs(amount));
    const paise = Math.round((Math.abs(amount) - rupees) * 100);
    const r = this.numberToIndianWords(rupees);
    const p = paise > 0 ? ` and ${this.numberToIndianWords(paise)} Paise` : "";
    const sign = amount < 0 ? "Minus " : "";
    return `${sign}INR ${r}${p} Only`;
  }
  static numberToIndianWords(n) {
    if (!Number.isFinite(n) || n === 0) return "Zero";
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen"
    ];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const two = (x) => {
      if (x < 20) return ones[x];
      const t = Math.floor(x / 10);
      const o = x % 10;
      return `${tens[t]}${o ? " " + ones[o] : ""}`.trim();
    };
    const three = (x) => {
      const h = Math.floor(x / 100);
      const r = x % 100;
      const head = h ? `${ones[h]} Hundred` : "";
      const tail = r ? `${head ? " " : ""}${two(r)}` : "";
      return `${head}${tail}`.trim();
    };
    const parts = [];
    let num = Math.floor(n);
    const crore = Math.floor(num / 1e7);
    num %= 1e7;
    const lakh = Math.floor(num / 1e5);
    num %= 1e5;
    const thousand = Math.floor(num / 1e3);
    num %= 1e3;
    const rest = num;
    if (crore) parts.push(`${three(crore)} Crore`);
    if (lakh) parts.push(`${three(lakh)} Lakh`);
    if (thousand) parts.push(`${three(thousand)} Thousand`);
    if (rest) parts.push(three(rest));
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }
  // ======================================================================
  // TERMS INLINE (fix orphan lines + dedupe)
  // ======================================================================
  static termsToInlineBullets(raw) {
    const t = this.clean(raw);
    if (!t) return "";
    const src = t.split(/\r?\n/g).map((l) => l.trim()).filter(Boolean);
    const bullets = [];
    for (const original of src) {
      const stripped = original.replace(/^\s*(?:[-*•]+|\d+[.)\]])\s*/g, "").trim();
      if (!stripped) continue;
      const looksLikeNewItem = /^\s*(?:[-*•]+|\d+[.)\]])\s+/.test(original) || /:\s*/.test(stripped);
      if (!bullets.length) {
        bullets.push(stripped);
        continue;
      }
      if (!looksLikeNewItem) bullets[bullets.length - 1] += " " + stripped;
      else bullets.push(stripped);
    }
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    for (const b of bullets) {
      const norm = b.replace(/\s+/g, " ").trim();
      const key = norm.toLowerCase();
      if (!norm || seen.has(key)) continue;
      seen.add(key);
      out.push(norm);
    }
    return out.join(" \u2022 ");
  }
};

// server/routes/quotes.routes.ts
init_feature_flags();

// server/services/approval.service.ts
init_storage();
import { Decimal as Decimal2 } from "decimal.js";
var ApprovalService = class {
  /**
   * Evaluates a quote against active approval rules.
   * Returns approval status and required role.
   */
  static async evaluateQuote(quote) {
    const rules = await storage.getApprovalRules();
    if (!rules || rules.length === 0) {
      return { approvalStatus: "none", approvalRequiredBy: null };
    }
    let requiredRole = null;
    let needsApproval = false;
    for (const rule of rules) {
      if (!rule.isActive) continue;
      let triggered = false;
      const threshold = new Decimal2(rule.thresholdValue);
      if (rule.triggerType === "discount_percentage") {
        const subtotal = new Decimal2(quote.subtotal || 0);
        const discount = new Decimal2(quote.discount || 0);
        if (subtotal.gt(0)) {
          const discountPercent = discount.div(subtotal).mul(100);
          if (discountPercent.gt(threshold)) {
            triggered = true;
          }
        }
      } else if (rule.triggerType === "total_amount") {
        const total = new Decimal2(quote.total || 0);
        if (total.gt(threshold)) {
          triggered = true;
        }
      }
      if (triggered) {
        needsApproval = true;
        requiredRole = rule.requiredRole || "sales_manager";
        break;
      }
    }
    if (needsApproval) {
      return { approvalStatus: "pending", approvalRequiredBy: requiredRole };
    }
    return { approvalStatus: "none", approvalRequiredBy: null };
  }
};

// server/services/notification.service.ts
init_db();
init_schema();
import { eq as eq4, and as and3, desc as desc2, sql as sql5, lt } from "drizzle-orm";

// server/services/websocket.service.ts
init_db();
init_schema();
import { Server } from "socket.io";
import jwt3 from "jsonwebtoken";
import { eq as eq3, and as and2 } from "drizzle-orm";
var WebSocketServiceClass = class {
  io = null;
  userConnections = /* @__PURE__ */ new Map();
  // userId -> connections
  /**
   * Initialize WebSocket server with authentication middleware
   */
  initialize(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : ["http://localhost:3000", "http://localhost:5000", "http://127.0.0.1:5000"],
        credentials: true
      },
      pingTimeout: 6e4,
      pingInterval: 25e3
    });
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
        if (!token) {
          return next(new Error("Authentication required"));
        }
        const decoded = jwt3.verify(token, getJWTSecret());
        const [user] = await db.select().from(users).where(eq3(users.id, decoded.id)).limit(1);
        if (!user) {
          return next(new Error("User not found"));
        }
        socket.userId = user.id;
        socket.userName = user.name;
        socket.userRole = user.role;
        next();
      } catch (error) {
        console.error("WebSocket auth error:", error);
        next(new Error("Invalid token"));
      }
    });
    this.io.on("connection", (socket) => {
      console.log(`[WebSocket] User ${socket.userName} (${socket.userId}) connected - Socket: ${socket.id}`);
      this.addConnection(socket);
      if (socket.userId) {
        socket.join(`user:${socket.userId}`);
      }
      socket.on("join:collaboration", async (data) => {
        await this.handleJoinCollaboration(socket, data);
      });
      socket.on("leave:collaboration", async (data) => {
        await this.handleLeaveCollaboration(socket, data);
      });
      socket.on("cursor:update", (data) => {
        this.handleCursorUpdate(socket, data);
      });
      socket.on("editing:start", (data) => {
        this.handleEditingState(socket, data, true);
      });
      socket.on("editing:stop", (data) => {
        this.handleEditingState(socket, data, false);
      });
      socket.on("document:change", (data) => {
        this.handleDocumentChange(socket, data);
      });
      socket.on("disconnect", async (reason) => {
        console.log(`[WebSocket] User ${socket.userName} disconnected - Reason: ${reason}`);
        await this.handleDisconnect(socket);
      });
      socket.emit("connected", {
        userId: socket.userId,
        userName: socket.userName,
        socketId: socket.id
      });
    });
    console.log("\u2713 WebSocket service initialized");
    return this.io;
  }
  /**
   * Track user connection
   */
  addConnection(socket) {
    if (!socket.userId) return;
    const connection = {
      socketId: socket.id,
      userId: socket.userId,
      userName: socket.userName || "Unknown",
      userRole: socket.userRole || "viewer",
      connectedAt: /* @__PURE__ */ new Date()
    };
    const existing = this.userConnections.get(socket.userId) || [];
    existing.push(connection);
    this.userConnections.set(socket.userId, existing);
  }
  /**
   * Remove user connection on disconnect
   */
  removeConnection(socket) {
    if (!socket.userId) return;
    const connections = this.userConnections.get(socket.userId) || [];
    const updated = connections.filter((c) => c.socketId !== socket.id);
    if (updated.length === 0) {
      this.userConnections.delete(socket.userId);
    } else {
      this.userConnections.set(socket.userId, updated);
    }
  }
  /**
   * Handle joining a collaboration room
   */
  async handleJoinCollaboration(socket, data) {
    if (!socket.userId) return;
    const roomName = `collab:${data.entityType}:${data.entityId}`;
    socket.join(roomName);
    try {
      await db.delete(collaborationSessions).where(
        and2(
          eq3(collaborationSessions.entityType, data.entityType),
          eq3(collaborationSessions.entityId, data.entityId),
          eq3(collaborationSessions.userId, socket.userId)
        )
      );
      await db.insert(collaborationSessions).values({
        entityType: data.entityType,
        entityId: data.entityId,
        userId: socket.userId,
        socketId: socket.id,
        isEditing: false
      });
    } catch (error) {
      console.error("[WebSocket] Failed to store collaboration session:", error);
    }
    socket.to(roomName).emit("collaborator:joined", {
      userId: socket.userId,
      userName: socket.userName,
      entityType: data.entityType,
      entityId: data.entityId
    });
    const collaborators = await this.getCollaborators(data.entityType, data.entityId);
    socket.emit("collaborators:list", {
      entityType: data.entityType,
      entityId: data.entityId,
      collaborators
    });
    console.log(`[WebSocket] User ${socket.userName} joined room ${roomName}`);
  }
  /**
   * Handle leaving a collaboration room
   */
  async handleLeaveCollaboration(socket, data) {
    if (!socket.userId) return;
    const roomName = `collab:${data.entityType}:${data.entityId}`;
    socket.leave(roomName);
    try {
      await db.delete(collaborationSessions).where(
        and2(
          eq3(collaborationSessions.socketId, socket.id),
          eq3(collaborationSessions.entityType, data.entityType),
          eq3(collaborationSessions.entityId, data.entityId)
        )
      );
    } catch (error) {
      console.error("[WebSocket] Failed to remove collaboration session:", error);
    }
    socket.to(roomName).emit("collaborator:left", {
      userId: socket.userId,
      userName: socket.userName,
      entityType: data.entityType,
      entityId: data.entityId
    });
    console.log(`[WebSocket] User ${socket.userName} left room ${roomName}`);
  }
  /**
   * Handle cursor position updates
   */
  handleCursorUpdate(socket, data) {
    if (!socket.userId) return;
    const roomName = `collab:${data.entityType}:${data.entityId}`;
    socket.to(roomName).emit("cursor:moved", {
      userId: socket.userId,
      userName: socket.userName,
      position: data.position
    });
  }
  /**
   * Handle editing state changes
   */
  async handleEditingState(socket, data, isEditing) {
    if (!socket.userId) return;
    const roomName = `collab:${data.entityType}:${data.entityId}`;
    try {
      await db.update(collaborationSessions).set({
        isEditing,
        lastActivity: /* @__PURE__ */ new Date(),
        cursorPosition: data.field ? { field: data.field } : null
      }).where(eq3(collaborationSessions.socketId, socket.id));
    } catch (error) {
      console.error("[WebSocket] Failed to update editing state:", error);
    }
    socket.to(roomName).emit("editing:changed", {
      userId: socket.userId,
      userName: socket.userName,
      isEditing,
      field: data.field
    });
  }
  /**
   * Handle document changes broadcast
   */
  handleDocumentChange(socket, data) {
    if (!socket.userId) return;
    const roomName = `collab:${data.entityType}:${data.entityId}`;
    socket.to(roomName).emit("document:updated", {
      userId: socket.userId,
      userName: socket.userName,
      changes: data.changes,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  /**
   * Handle socket disconnect
   */
  async handleDisconnect(socket) {
    this.removeConnection(socket);
    try {
      const sessions = await db.select().from(collaborationSessions).where(eq3(collaborationSessions.socketId, socket.id));
      for (const session of sessions) {
        const roomName = `collab:${session.entityType}:${session.entityId}`;
        this.io?.to(roomName).emit("collaborator:left", {
          userId: socket.userId,
          userName: socket.userName,
          entityType: session.entityType,
          entityId: session.entityId
        });
      }
      await db.delete(collaborationSessions).where(eq3(collaborationSessions.socketId, socket.id));
    } catch (error) {
      console.error("[WebSocket] Failed to clean up sessions on disconnect:", error);
    }
  }
  /**
   * Get active collaborators for an entity
   */
  async getCollaborators(entityType, entityId) {
    try {
      const sessions = await db.select({
        userId: collaborationSessions.userId,
        socketId: collaborationSessions.socketId,
        isEditing: collaborationSessions.isEditing,
        cursorPosition: collaborationSessions.cursorPosition,
        joinedAt: collaborationSessions.joinedAt,
        userName: users.name
      }).from(collaborationSessions).innerJoin(users, eq3(collaborationSessions.userId, users.id)).where(
        and2(
          eq3(collaborationSessions.entityType, entityType),
          eq3(collaborationSessions.entityId, entityId)
        )
      );
      return sessions;
    } catch (error) {
      console.error("[WebSocket] Failed to get collaborators:", error);
      return [];
    }
  }
  /**
   * Send notification to specific user(s)
   */
  sendNotification(userId, notification) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit("notification:new", notification);
  }
  /**
   * Send notification to multiple users
   */
  sendNotificationToMany(userIds, notification) {
    userIds.forEach((userId) => this.sendNotification(userId, notification));
  }
  /**
   * Broadcast to all connected users (e.g., system announcements)
   */
  broadcast(event, data) {
    if (!this.io) return;
    this.io.emit(event, data);
  }
  /**
   * Get connection count for a user
   */
  getUserConnectionCount(userId) {
    return this.userConnections.get(userId)?.length || 0;
  }
  /**
   * Check if a user is online
   */
  isUserOnline(userId) {
    return this.getUserConnectionCount(userId) > 0;
  }
  /**
   * Get the Socket.io server instance
   */
  getIO() {
    return this.io;
  }
};
var WebSocketService = new WebSocketServiceClass();

// server/services/notification.service.ts
init_logger();
var NotificationServiceClass = class {
  /**
   * Create a new notification and deliver via WebSocket
   */
  async create(options) {
    try {
      const [notification] = await db.insert(notifications).values({
        userId: options.userId,
        type: options.type,
        title: options.title,
        message: options.message,
        entityType: options.entityType,
        entityId: options.entityId,
        metadata: options.metadata
      }).returning();
      if (notification) {
        WebSocketService.sendNotification(options.userId, {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          entityType: notification.entityType || void 0,
          entityId: notification.entityId || void 0,
          metadata: notification.metadata,
          createdAt: notification.createdAt
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
  async createForMany(userIds, options) {
    for (const userId of userIds) {
      await this.create({ ...options, userId });
    }
  }
  /**
   * Create notification for all users with a specific role
   */
  async createForRole(role, options) {
    try {
      const usersWithRole = await db.select({ id: users.id }).from(users).where(eq4(users.role, role));
      const userIds = usersWithRole.map((u) => u.id);
      await this.createForMany(userIds, options);
    } catch (error) {
      logger.error("[NotificationService] Failed to create notifications for role:", error);
    }
  }
  /**
   * Get notifications for a user
   */
  async getNotifications(options) {
    try {
      const conditions = [eq4(notifications.userId, options.userId)];
      if (options.unreadOnly) {
        conditions.push(eq4(notifications.isRead, false));
      }
      const result = await db.select().from(notifications).where(and3(...conditions)).orderBy(desc2(notifications.createdAt)).limit(options.limit || 50).offset(options.offset || 0);
      return result;
    } catch (error) {
      logger.error("[NotificationService] Failed to get notifications:", error);
      return [];
    }
  }
  /**
   * Get count of unread notifications for a user
   */
  async getUnreadCount(userId) {
    try {
      const [result] = await db.select({ count: sql5`count(*)` }).from(notifications).where(and3(
        eq4(notifications.userId, userId),
        eq4(notifications.isRead, false)
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
  async markAsRead(notificationId, userId) {
    try {
      const [updated] = await db.update(notifications).set({
        isRead: true,
        readAt: /* @__PURE__ */ new Date()
      }).where(and3(
        eq4(notifications.id, notificationId),
        eq4(notifications.userId, userId)
      )).returning();
      return !!updated;
    } catch (error) {
      logger.error("[NotificationService] Failed to mark as read:", error);
      return false;
    }
  }
  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    try {
      const result = await db.update(notifications).set({
        isRead: true,
        readAt: /* @__PURE__ */ new Date()
      }).where(and3(
        eq4(notifications.userId, userId),
        eq4(notifications.isRead, false)
      )).returning();
      return result.length;
    } catch (error) {
      logger.error("[NotificationService] Failed to mark all as read:", error);
      return 0;
    }
  }
  /**
   * Delete a notification
   */
  async delete(notificationId, userId) {
    try {
      const [deleted] = await db.delete(notifications).where(and3(
        eq4(notifications.id, notificationId),
        eq4(notifications.userId, userId)
      )).returning();
      return !!deleted;
    } catch (error) {
      logger.error("[NotificationService] Failed to delete notification:", error);
      return false;
    }
  }
  /**
   * Delete all notifications for a user
   */
  async deleteAll(userId) {
    try {
      const result = await db.delete(notifications).where(eq4(notifications.userId, userId)).returning();
      return result.length;
    } catch (error) {
      logger.error("[NotificationService] Failed to delete all notifications:", error);
      return 0;
    }
  }
  /**
   * Clean up old notifications (older than 30 days)
   */
  async cleanup(daysOld = 30) {
    try {
      const cutoffDate = /* @__PURE__ */ new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      const result = await db.delete(notifications).where(lt(notifications.createdAt, cutoffDate)).returning();
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
  async notifyQuoteStatusChange(userId, quoteNumber, quoteId, oldStatus, newStatus) {
    await this.create({
      userId,
      type: "quote_status_change",
      title: `Quote ${quoteNumber} Status Updated`,
      message: `Quote status changed from "${oldStatus}" to "${newStatus}"`,
      entityType: "quote",
      entityId: quoteId,
      metadata: { oldStatus, newStatus, quoteNumber }
    });
  }
  /**
   * Notify when approval is required
   */
  async notifyApprovalRequest(approverId, quoteNumber, quoteId, requesterName, reason) {
    await this.create({
      userId: approverId,
      type: "approval_request",
      title: `Approval Required: Quote ${quoteNumber}`,
      message: `${requesterName} has requested your approval. Reason: ${reason}`,
      entityType: "quote",
      entityId: quoteId,
      metadata: { requesterName, reason, quoteNumber }
    });
  }
  /**
   * Notify when approval decision is made
   */
  async notifyApprovalDecision(userId, quoteNumber, quoteId, approverName, decision, comments) {
    await this.create({
      userId,
      type: "approval_decision",
      title: `Quote ${quoteNumber} ${decision === "approved" ? "Approved" : "Rejected"}`,
      message: `${approverName} has ${decision} your quote${comments ? `: ${comments}` : ""}`,
      entityType: "quote",
      entityId: quoteId,
      metadata: { approverName, decision, comments, quoteNumber }
    });
  }
  /**
   * Notify when payment is received
   */
  async notifyPaymentReceived(userId, invoiceNumber, invoiceId, amount, currency) {
    await this.create({
      userId,
      type: "payment_received",
      title: `Payment Received: ${currency} ${amount}`,
      message: `Payment of ${currency} ${amount} received for Invoice ${invoiceNumber}`,
      entityType: "invoice",
      entityId: invoiceId,
      metadata: { amount, currency, invoiceNumber }
    });
  }
  /**
   * Notify when payment is overdue
   */
  async notifyPaymentOverdue(userId, invoiceNumber, invoiceId, daysOverdue, amount) {
    await this.create({
      userId,
      type: "payment_overdue",
      title: `Invoice ${invoiceNumber} Overdue`,
      message: `Invoice is ${daysOverdue} days overdue. Outstanding amount: ${amount}`,
      entityType: "invoice",
      entityId: invoiceId,
      metadata: { daysOverdue, amount, invoiceNumber }
    });
  }
  /**
   * Notify when someone joins a document
   */
  async notifyCollaboratorJoined(userId, joinerName, entityType, entityId, entityNumber) {
    await this.create({
      userId,
      type: "collaboration_joined",
      title: `${joinerName} Joined Your Document`,
      message: `${joinerName} is now viewing ${entityType} ${entityNumber}`,
      entityType,
      entityId,
      metadata: { joinerName, entityNumber }
    });
  }
  /**
   * Send system announcement to all users
   */
  async sendSystemAnnouncement(title, message, metadata) {
    try {
      const allUsers = await db.select({ id: users.id }).from(users);
      await this.createForMany(
        allUsers.map((u) => u.id),
        {
          type: "system_announcement",
          title,
          message,
          metadata
        }
      );
    } catch (error) {
      logger.error("[NotificationService] Failed to send system announcement:", error);
    }
  }
};
var NotificationService = new NotificationServiceClass();

// server/services/workflow-engine.service.ts
init_storage();
init_logger();
var WorkflowEngine = class {
  /**
   * Trigger workflows for a specific entity event
   * This is called whenever an entity changes (quote status change, invoice created, etc.)
   */
  static async triggerWorkflows(entityType, entityId, context) {
    try {
      const workflows2 = await storage.getActiveWorkflows(entityType);
      if (workflows2.length === 0) {
        logger.debug(`[WorkflowEngine] No active workflows for ${entityType}`);
        return;
      }
      logger.info(`[WorkflowEngine] Found ${workflows2.length} active workflows for ${entityType}`);
      for (const workflow of workflows2) {
        try {
          const shouldExecute = await this.evaluateWorkflow(workflow, context);
          if (shouldExecute) {
            logger.info(`[WorkflowEngine] Executing workflow: ${workflow.name} (${workflow.id})`);
            await this.executeWorkflow(workflow, entityType, entityId, context);
          }
        } catch (error) {
          logger.error(`[WorkflowEngine] Error processing workflow ${workflow.id}:`, error);
        }
      }
    } catch (error) {
      logger.error(`[WorkflowEngine] Error triggering workflows for ${entityType}:`, error);
    }
  }
  /**
  /**
       * Evaluate if a workflow should execute based on its triggers
       */
  static async evaluateWorkflow(workflow, context) {
    try {
      const triggers = await storage.getWorkflowTriggers(workflow.id);
      if (triggers.length === 0) {
        logger.warn(`[WorkflowEngine] Workflow ${workflow.id} has no triggers`);
        return false;
      }
      const logic = workflow.triggerLogic || "AND";
      const results = [];
      for (const trigger of triggers) {
        if (!trigger.isActive) continue;
        const matches = this.evaluateTrigger(trigger, context);
        results.push(matches);
      }
      if (logic === "AND") {
        return results.every((r) => r === true);
      } else {
        return results.some((r) => r === true);
      }
    } catch (error) {
      logger.error(`[WorkflowEngine] Error evaluating workflow ${workflow.id}:`, error);
      return false;
    }
  }
  /**
   * Evaluate a single trigger condition
   */
  static evaluateTrigger(trigger, context) {
    const conditions = trigger.conditions;
    switch (trigger.triggerType) {
      case "status_change":
        return this.evaluateStatusChange(conditions, context);
      case "amount_threshold":
        return this.evaluateAmountThreshold(conditions, context);
      case "field_change":
        return this.evaluateFieldChange(conditions, context);
      case "date_based":
        return this.evaluateDateBased(conditions, context);
      case "created":
        return context.eventType === "created";
      case "manual":
        return context.eventType === "manual";
      default:
        logger.warn(`[WorkflowEngine] Unknown trigger type: ${trigger.triggerType}`);
        return false;
    }
  }
  /**
   * Evaluate status change trigger
   * Example: { field: "status", from: "draft", to: "approved" }
   */
  static evaluateStatusChange(conditions, context) {
    if (context.eventType !== "status_change") return false;
    const field = conditions.field || "status";
    const from = conditions.from;
    const to = conditions.to;
    if (from && to) {
      return context.oldValue === from && context.newValue === to;
    }
    if (to) {
      return context.newValue === to;
    }
    if (from) {
      return context.oldValue === from;
    }
    return context.oldValue !== context.newValue;
  }
  /**
   * Evaluate amount threshold trigger
   * Example: { field: "total", operator: "greater_than", value: 10000 }
   */
  static evaluateAmountThreshold(conditions, context) {
    const field = conditions.field || "total";
    const operator = conditions.operator;
    const threshold = parseFloat(conditions.value);
    const entityValue = parseFloat(context.entity[field] || 0);
    switch (operator) {
      case "greater_than":
        return entityValue > threshold;
      case "less_than":
        return entityValue < threshold;
      case "equals":
        return entityValue === threshold;
      case "greater_than_or_equal":
        return entityValue >= threshold;
      case "less_than_or_equal":
        return entityValue <= threshold;
      default:
        return false;
    }
  }
  /**
   * Evaluate field change trigger
   * Example: { field: "discount", operator: "greater_than", value: 20 }
   */
  static evaluateFieldChange(conditions, context) {
    if (context.eventType !== "field_change") return false;
    const field = conditions.field;
    const operator = conditions.operator;
    const value = conditions.value;
    const fieldValue = context.entity[field];
    switch (operator) {
      case "equals":
        return fieldValue == value;
      case "not_equals":
        return fieldValue != value;
      case "greater_than":
        return parseFloat(fieldValue) > parseFloat(value);
      case "less_than":
        return parseFloat(fieldValue) < parseFloat(value);
      case "contains":
        return String(fieldValue).includes(String(value));
      default:
        return false;
    }
  }
  /**
   * Evaluate date-based trigger
   * Example: { field: "dueDate", operator: "days_before", value: 7 }
   */
  static evaluateDateBased(conditions, context) {
    const field = conditions.field;
    const operator = conditions.operator;
    const days = parseInt(conditions.value);
    const dateValue = context.entity[field];
    if (!dateValue) return false;
    const targetDate = new Date(dateValue);
    const today = /* @__PURE__ */ new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
    switch (operator) {
      case "days_before":
        return diffDays === days && diffDays > 0;
      case "days_after":
        return diffDays === -days && diffDays < 0;
      case "is_overdue":
        return diffDays < 0;
      case "is_today":
        return diffDays === 0;
      default:
        return false;
    }
  }
  /**
   * Execute a workflow's actions
   */
  static async executeWorkflow(workflow, entityType, entityId, context) {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    const execution = await storage.createWorkflowExecution({
      workflowId: workflow.id,
      entityType,
      entityId,
      status: "running",
      triggeredBy: context.triggeredBy || "system",
      executionLog: []
    });
    const executionLog = [];
    try {
      const actions = await storage.getWorkflowActions(workflow.id);
      logger.info(`[WorkflowEngine] Executing ${actions.length} actions for workflow ${workflow.id}`);
      for (const action of actions) {
        if (!action.isActive) {
          executionLog.push({
            actionId: action.id,
            actionType: action.actionType,
            status: "skipped",
            details: "Action is inactive",
            timestamp: /* @__PURE__ */ new Date()
          });
          continue;
        }
        try {
          if (action.conditionExpression) {
            const shouldExecute = this.evaluateActionCondition(action.conditionExpression, context);
            if (!shouldExecute) {
              executionLog.push({
                actionId: action.id,
                actionType: action.actionType,
                status: "skipped",
                details: "Condition not met",
                timestamp: /* @__PURE__ */ new Date()
              });
              continue;
            }
          }
          if (action.delayMinutes && action.delayMinutes > 0) {
            logger.info(`[WorkflowEngine] Delaying action ${action.id} by ${action.delayMinutes} minutes`);
          }
          const result = await this.executeAction(action, context);
          executionLog.push(result);
        } catch (error) {
          logger.error(`[WorkflowEngine] Error executing action ${action.id}:`, error);
          executionLog.push({
            actionId: action.id,
            actionType: action.actionType,
            status: "failed",
            details: "Action execution failed",
            error: error.message,
            timestamp: /* @__PURE__ */ new Date()
          });
        }
      }
      const executionTime = Date.now() - startTime;
      await storage.updateWorkflowExecution(execution.id, {
        status: "completed",
        completedAt: /* @__PURE__ */ new Date(),
        executionLog,
        executionTimeMs: executionTime
      });
      logger.info(`[WorkflowEngine] Workflow ${workflow.id} completed in ${executionTime}ms`);
    } catch (error) {
      await storage.updateWorkflowExecution(execution.id, {
        status: "failed",
        completedAt: /* @__PURE__ */ new Date(),
        executionLog,
        errorMessage: error.message,
        errorStack: error.stack
      });
      logger.error(`[WorkflowEngine] Workflow ${workflow.id} failed:`, error);
    }
  }
  /**
   * Evaluate action condition expression
   * Example: "{{quote.total}} > 50000"
   */
  static evaluateActionCondition(expression, context) {
    try {
      let evaluatedExpression = expression;
      const matches = expression.match(/\{\{([^}]+)\}\}/g);
      if (matches) {
        for (const match of matches) {
          const path5 = match.replace(/\{\{|\}\}/g, "").trim();
          const value = this.getNestedValue(context.entity, path5);
          evaluatedExpression = evaluatedExpression.replace(match, String(value));
        }
      }
      return new Function("return " + evaluatedExpression)();
    } catch (error) {
      logger.error(`[WorkflowEngine] Error evaluating condition: ${expression}`, error);
      return false;
    }
  }
  /**
   * Get nested value from object using dot notation
   * Example: getNestedValue({ quote: { total: 1000 } }, "quote.total") => 1000
   */
  static getNestedValue(obj, path5) {
    return path5.split(".").reduce((current, key) => current?.[key], obj);
  }
  /**
   * Execute a single action
   */
  static async executeAction(action, context) {
    const config = action.actionConfig;
    try {
      switch (action.actionType) {
        case "send_email":
          await this.executeSendEmail(config, context);
          break;
        case "create_notification":
          await this.executeCreateNotification(config, context);
          break;
        case "update_field":
          await this.executeUpdateField(config, context);
          break;
        case "create_activity_log":
          await this.executeCreateActivityLog(config, context);
          break;
        case "assign_user":
          await this.executeAssignUser(config, context);
          break;
        default:
          logger.warn(`[WorkflowEngine] Unimplemented action type: ${action.actionType}`);
      }
      return {
        actionId: action.id,
        actionType: action.actionType,
        status: "success",
        details: `Successfully executed ${action.actionType}`,
        timestamp: /* @__PURE__ */ new Date()
      };
    } catch (error) {
      return {
        actionId: action.id,
        actionType: action.actionType,
        status: "failed",
        details: "Action execution failed",
        error: error.message,
        timestamp: /* @__PURE__ */ new Date()
      };
    }
  }
  /**
   * Send email action
   */
  static async executeSendEmail(config, context) {
    const to = this.interpolateTemplate(config.to, context);
    const subject = this.interpolateTemplate(config.subject, context);
    const body = this.interpolateTemplate(config.body, context);
    await EmailService.sendEmail({
      to,
      subject,
      html: body
    });
    logger.info(`[WorkflowEngine] Would send email to: ${to}, subject: ${subject}`);
  }
  /**
   * Create notification action
   */
  /**
   * Create notification action
   */
  static async executeCreateNotification(config, context) {
    let userId = this.interpolateTemplate(config.userId, context);
    const title = this.interpolateTemplate(config.title, context);
    const message = this.interpolateTemplate(config.message, context);
    const roles = ["admin", "sales_executive", "sales_manager", "purchase_operations", "finance_accounts"];
    let targetUserIds = [];
    if (roles.includes(userId)) {
      const usersWithRole = await storage.getUsersByRole(userId);
      if (usersWithRole.length > 0) {
        targetUserIds = usersWithRole.map((u) => u.id);
        logger.info(`[WorkflowEngine] Broadcasting notification to ${targetUserIds.length} users in role ${userId}`);
      } else {
        logger.warn(`[WorkflowEngine] No users found with role ${userId} for notification`);
        return;
      }
    } else {
      targetUserIds = [userId];
    }
    for (const targetId of targetUserIds) {
      await NotificationService.create({
        userId: targetId,
        type: config.type || "system_announcement",
        title,
        message,
        entityType: context.entity.entityType,
        entityId: context.entity.id
      });
    }
    logger.info(`[WorkflowEngine] Created notifications for ${targetUserIds.length} recipients`);
  }
  /**
   * Update field action
   */
  static async executeUpdateField(config, context) {
    const field = config.field;
    const value = this.interpolateTemplate(config.value, context);
    const entityType = context.entity.entityType || "quote";
    const entityId = context.entity.id;
    logger.info(`[WorkflowEngine] Updating field ${field} to ${value} for ${entityType} ${entityId}`);
    try {
      if (entityType === "quote") {
        await storage.updateQuote(entityId, { [field]: value });
      } else if (entityType === "invoice") {
        logger.warn(`[WorkflowEngine] Update invoice not yet implemented fully`);
      } else {
        logger.warn(`[WorkflowEngine] Entity type ${entityType} not supported for generic update`);
      }
    } catch (err) {
      logger.error(`[WorkflowEngine] Failed to update field:`, err);
      throw err;
    }
  }
  /**
   * Create activity log action
   */
  static async executeCreateActivityLog(config, context) {
    const action = this.interpolateTemplate(config.action, context);
    const details = this.interpolateTemplate(config.details, context);
    await storage.createActivityLog({
      userId: config.userId || context.entity.createdBy,
      action,
      entityType: context.entity.entityType || "workflow",
      entityId: context.entity.id,
      metadata: { details }
    });
    logger.info(`[WorkflowEngine] Created activity log: ${action}`);
  }
  /**
   * Template interpolation
   * Replaces {{variable}} with actual values from context
   */
  static interpolateTemplate(template, context) {
    if (!template) return "";
    let result = template;
    const matches = template.match(/\{\{([^}]+)\}\}/g);
    if (matches) {
      for (const match of matches) {
        const path5 = match.replace(/\{\{|\}\}/g, "").trim();
        let value = this.getNestedValue(context.entity, path5);
        if (!value && path5.includes("_")) {
          const camelPath = path5.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
          value = this.getNestedValue(context.entity, camelPath);
        }
        if (!value) {
          value = this.getNestedValue({ entity: context.entity, ...context.entity }, path5);
        }
        result = result.replace(match, String(value || ""));
      }
    }
    return result;
  }
  /**
   * Run scheduled workflows (called by cron job)
   */
  static async runScheduledWorkflows() {
    try {
      const schedules = await storage.getActiveWorkflowSchedules();
      const now = /* @__PURE__ */ new Date();
      for (const schedule of schedules) {
        if (schedule.nextRunAt && new Date(schedule.nextRunAt) <= now) {
          logger.info(`[WorkflowEngine] Running scheduled workflow: ${schedule.workflowId}`);
          const workflow = await storage.getWorkflow(schedule.workflowId);
          if (workflow && workflow.status === "active") {
            await this.triggerWorkflows(workflow.entityType, "scheduled", {
              eventType: "time_based",
              entity: {},
              triggeredBy: "schedule"
            });
          }
          await storage.updateWorkflowSchedule(schedule.id, {
            lastRunAt: now
            // nextRunAt: calculateNextRun(schedule.cronExpression),
          });
        }
      }
    } catch (error) {
      logger.error(`[WorkflowEngine] Error running scheduled workflows:`, error);
    }
  }
  /**
   * Assign user action
   */
  static async executeAssignUser(config, context) {
    let userId = this.interpolateTemplate(config.userId, context);
    const entityType = context.entity.entityType || "quote";
    const entityId = context.entity.id;
    const roles = ["admin", "sales_executive", "sales_manager", "purchase_operations", "finance_accounts"];
    if (roles.includes(userId)) {
      logger.info(`[WorkflowEngine] Attempting to resolve role: ${userId}`);
      const usersWithRole = await storage.getUsersByRole(userId);
      if (usersWithRole.length > 0) {
        userId = usersWithRole[0].id;
        logger.info(`[WorkflowEngine] Resolved role ${config.userId} to user ${userId} (${usersWithRole[0].name})`);
      } else {
        logger.warn(`[WorkflowEngine] No users found with role ${userId} to assign`);
        return;
      }
    } else {
      logger.info(`[WorkflowEngine] Using direct user ID or variable: ${userId}`);
    }
    logger.info(`[WorkflowEngine] Final assignment - Entity: ${entityType} ${entityId}, User: ${userId}`);
    try {
      if (entityType === "quote") {
        await storage.updateQuote(entityId, { assignedTo: userId });
        await NotificationService.create({
          userId,
          type: "system_announcement",
          title: "New Assignment",
          message: `You have been assigned to Quote ${context.entity.quoteNumber || "Update"}`,
          entityType: "quote",
          entityId
        });
        logger.info(`[WorkflowEngine] Sent assignment notification to user ${userId}`);
      } else {
        logger.warn(`[WorkflowEngine] Assign user not supported for entity type ${entityType}`);
      }
    } catch (err) {
      logger.error(`[WorkflowEngine] Failed to assign user:`, err);
      throw err;
    }
  }
};

// server/routes/quotes.routes.ts
init_schema();
init_schema();
init_db();
import { eq as eq5 } from "drizzle-orm";
var router5 = Router5();
router5.get("/", requireFeature("quotes_module"), authMiddleware, async (req, res) => {
  try {
    const quotes2 = await storage.getAllQuotes();
    const quotesWithClients = await Promise.all(
      quotes2.map(async (quote) => {
        const client = await storage.getClient(quote.clientId);
        return {
          ...quote,
          clientName: client?.name || "Unknown",
          clientEmail: client?.email || ""
        };
      })
    );
    res.json(quotesWithClients);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quotes" });
  }
});
router5.get("/public/:token", async (req, res) => {
  try {
    const token = req.params.token;
    if (!token) return res.status(400).json({ error: "Token required" });
    const quote = await storage.getQuoteByToken(token);
    if (!quote) {
      return res.status(404).json({ error: "Quote not found or link expired" });
    }
    if (quote.tokenExpiresAt && new Date(quote.tokenExpiresAt) < /* @__PURE__ */ new Date()) {
      return res.status(410).json({ error: "Quote link has expired" });
    }
    const client = await storage.getClient(quote.clientId);
    const items = await storage.getQuoteItems(quote.id);
    const creator = await storage.getUser(quote.createdBy);
    res.json({
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      version: quote.version,
      status: quote.status,
      quoteDate: quote.quoteDate,
      validUntil: quote.validUntil,
      currency: quote.currency,
      items,
      subtotal: quote.subtotal,
      discount: quote.discount,
      shippingCharges: quote.shippingCharges,
      cgst: quote.cgst,
      sgst: quote.sgst,
      igst: quote.igst,
      total: quote.total,
      notes: quote.notes,
      termsAndConditions: quote.termsAndConditions,
      client: {
        name: client?.name,
        email: client?.email,
        billingAddress: client?.billingAddress,
        gstin: client?.gstin,
        phone: client?.phone
      },
      sender: {
        name: creator?.name,
        email: creator?.email
      }
    });
  } catch (error) {
    logger.error("Public quote fetch error:", error);
    res.status(500).json({ error: "Failed to fetch quote" });
  }
});
router5.get("/public/:token/comments", async (req, res) => {
  try {
    const quote = await storage.getQuoteByToken(req.params.token);
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }
    if (quote.tokenExpiresAt && new Date(quote.tokenExpiresAt) < /* @__PURE__ */ new Date()) {
      return res.status(410).json({ error: "Quote link has expired" });
    }
    const comments = await storage.getQuoteComments(quote.id, false);
    res.json(comments);
  } catch (error) {
    logger.error("Public quote comments fetch error:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});
router5.post("/public/:token/comments", async (req, res) => {
  try {
    const { authorName, authorEmail, message, parentCommentId } = req.body;
    if (!authorName || !message) {
      return res.status(400).json({ error: "Author name and message are required" });
    }
    const quote = await storage.getQuoteByToken(req.params.token);
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }
    if (quote.tokenExpiresAt && new Date(quote.tokenExpiresAt) < /* @__PURE__ */ new Date()) {
      return res.status(410).json({ error: "Quote link has expired" });
    }
    const comment = await storage.createQuoteComment({
      quoteId: quote.id,
      authorType: "client",
      authorName,
      authorEmail: authorEmail || null,
      message,
      parentCommentId: parentCommentId || null,
      isInternal: false
    });
    await storage.createActivityLog({
      userId: quote.createdBy,
      action: "client_comment_public",
      entityType: "quote",
      entityId: quote.id,
      metadata: { commentId: comment.id, via: "public_link" }
    });
    res.json(comment);
  } catch (error) {
    logger.error("Public quote comment error:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});
router5.post("/public/:token/select-items", async (req, res) => {
  try {
    const { selections } = req.body;
    if (!Array.isArray(selections)) {
      return res.status(400).json({ error: "Selections array is required" });
    }
    const quote = await storage.getQuoteByToken(req.params.token);
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }
    if (quote.tokenExpiresAt && new Date(quote.tokenExpiresAt) < /* @__PURE__ */ new Date()) {
      return res.status(410).json({ error: "Quote link has expired" });
    }
    if (!["sent", "draft"].includes(quote.status)) {
      return res.status(400).json({ error: "Quote is no longer editable" });
    }
    const quoteItems2 = await storage.getQuoteItems(quote.id);
    const optionalItemIds = quoteItems2.filter((i) => i.isOptional).map((i) => i.id);
    for (const sel of selections) {
      if (!optionalItemIds.includes(sel.itemId)) {
        return res.status(400).json({ error: `Item ${sel.itemId} is not an optional item` });
      }
    }
    for (const sel of selections) {
      await storage.updateQuoteItemSelection(sel.itemId, sel.isSelected);
    }
    const updatedItems = await storage.getQuoteItems(quote.id);
    const selectedItems = updatedItems.filter((i) => i.isSelected);
    let subtotal = 0;
    for (const item of selectedItems) {
      subtotal += Number(item.subtotal);
    }
    const discount = Number(quote.discount) || 0;
    const cgst = Number(quote.cgst) || 0;
    const sgst = Number(quote.sgst) || 0;
    const igst = Number(quote.igst) || 0;
    const shippingCharges = Number(quote.shippingCharges) || 0;
    const total = subtotal - discount + cgst + sgst + igst + shippingCharges;
    await storage.updateQuote(quote.id, {
      subtotal: subtotal.toFixed(2),
      total: total.toFixed(2)
    });
    res.json({
      success: true,
      subtotal: subtotal.toFixed(2),
      total: total.toFixed(2),
      items: updatedItems
    });
  } catch (error) {
    logger.error("Public quote item selection error:", error);
    res.status(500).json({ error: "Failed to update selections" });
  }
});
router5.post("/public/:token/accept", async (req, res) => {
  try {
    const { clientName, clientSignature } = req.body;
    if (!clientName) {
      return res.status(400).json({ error: "Client name is required for acceptance" });
    }
    const quote = await storage.getQuoteByToken(req.params.token);
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }
    if (quote.tokenExpiresAt && new Date(quote.tokenExpiresAt) < /* @__PURE__ */ new Date()) {
      return res.status(410).json({ error: "Quote link has expired" });
    }
    if (!["sent", "draft"].includes(quote.status)) {
      return res.status(400).json({ error: "Quote is already processed" });
    }
    await storage.updateQuote(quote.id, {
      status: "approved",
      clientAcceptedName: clientName,
      clientSignature: clientSignature || null,
      clientAcceptedAt: /* @__PURE__ */ new Date()
    });
    await storage.createActivityLog({
      userId: quote.createdBy,
      action: "client_accept_with_signature",
      entityType: "quote",
      entityId: quote.id,
      metadata: {
        via: "public_link",
        clientName,
        hasSignature: !!clientSignature,
        ip: req.ip
      }
    });
    res.json({ success: true, status: "approved" });
  } catch (error) {
    logger.error("Public quote accept error:", error);
    res.status(500).json({ error: "Failed to accept quote" });
  }
});
router5.post("/public/:token/:action", async (req, res) => {
  try {
    const { token, action } = req.params;
    const { reason } = req.body;
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }
    const quote = await storage.getQuoteByToken(token);
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }
    if (quote.tokenExpiresAt && new Date(quote.tokenExpiresAt) < /* @__PURE__ */ new Date()) {
      return res.status(410).json({ error: "Quote link has expired" });
    }
    if (["approved", "invoiced", "closed_paid"].includes(quote.status)) {
      return res.status(400).json({ error: "Quote is already processed" });
    }
    const newStatus = action === "approve" ? "approved" : "rejected";
    await storage.updateQuote(quote.id, { status: newStatus });
    await storage.createActivityLog({
      userId: quote.createdBy,
      action: `client_${action}_public`,
      entityType: "quote",
      entityId: quote.id,
      metadata: { via: "public_link", reason, ip: req.ip }
    });
    res.json({ success: true, status: newStatus });
  } catch (error) {
    logger.error("Public quote action error:", error);
    res.status(500).json({ error: "Failed to process " + req.params.action });
  }
});
router5.get("/:id", requireFeature("quotes_module"), authMiddleware, async (req, res) => {
  try {
    const quote = await storage.getQuote(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }
    const client = await storage.getClient(quote.clientId);
    const items = await storage.getQuoteItems(quote.id);
    const creator = await storage.getUser(quote.createdBy);
    res.json({
      ...quote,
      client,
      items,
      createdByName: creator?.name || "Unknown"
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quote" });
  }
});
router5.post("/", requireFeature("quotes_create"), authMiddleware, requirePermission("quotes", "create"), async (req, res) => {
  try {
    const { items, ...quoteData } = req.body;
    if (!isFeatureEnabled("quotes_discount") && Number(quoteData.discount || 0) > 0) {
      return res.status(403).json({ error: "Discounts are currently disabled" });
    }
    if (!isFeatureEnabled("quotes_shippingCharges") && Number(quoteData.shippingCharges || 0) > 0) {
      return res.status(403).json({ error: "Shipping charges feature is disabled" });
    }
    if (!isFeatureEnabled("quotes_notes") && quoteData.notes) {
      delete quoteData.notes;
    }
    if (!isFeatureEnabled("quotes_termsConditions") && quoteData.termsAndConditions) {
      delete quoteData.termsAndConditions;
    }
    if (quoteData.quoteDate && typeof quoteData.quoteDate === "string") {
      const parsed = new Date(quoteData.quoteDate);
      if (!isNaN(parsed.getTime())) {
        quoteData.quoteDate = parsed;
      } else {
        delete quoteData.quoteDate;
      }
    }
    const prefixSetting = await storage.getSetting("quotePrefix");
    const prefix = prefixSetting?.value || "QT";
    const quoteNumber = await NumberingService.generateQuoteNumber();
    const quoteItemsData = (items || []).map((item, i) => ({
      quoteId: "",
      productId: item.productId || null,
      description: item.description,
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
      subtotal: String(item.quantity * item.unitPrice),
      sortOrder: i,
      hsnSac: item.hsnSac || null
    }));
    const subtotal = calculateSubtotal(quoteItemsData);
    const discount = quoteData.discount || 0;
    const shippingCharges = quoteData.shippingCharges || 0;
    const cgst = quoteData.cgst || 0;
    const sgst = quoteData.sgst || 0;
    const igst = quoteData.igst || 0;
    const total = calculateTotal({
      subtotal,
      discount,
      shippingCharges,
      cgst,
      sgst,
      igst
    });
    const finalQuoteData = {
      ...quoteData,
      quoteNumber,
      createdBy: req.user.id,
      subtotal: toMoneyString(subtotal),
      discount: toMoneyString(discount),
      shippingCharges: toMoneyString(shippingCharges),
      cgst: toMoneyString(cgst),
      sgst: toMoneyString(sgst),
      igst: toMoneyString(igst),
      total: toMoneyString(total)
    };
    const { approvalStatus, approvalRequiredBy } = await ApprovalService.evaluateQuote(finalQuoteData);
    Object.assign(finalQuoteData, { approvalStatus, approvalRequiredBy });
    const quote = await storage.createQuoteTransaction(finalQuoteData, quoteItemsData);
    await storage.createActivityLog({
      userId: req.user.id,
      action: "create_quote",
      entityType: "quote",
      entityId: quote.id
    });
    console.log("[DEBUG] Quote Created:", JSON.stringify(quote, null, 2));
    console.log("[DEBUG] Eval Result:", { approvalStatus, approvalRequiredBy });
    try {
      await NotificationService.create({
        userId: req.user.id,
        type: "quote_status_change",
        title: "Quote Created",
        message: `Quote #${quoteNumber} has been created successfully.`,
        entityType: "quote",
        entityId: quote.id
      });
      if (approvalStatus === "pending") {
        const admins = await db.select().from(users).where(eq5(users.role, "admin"));
        for (const admin of admins) {
          await NotificationService.notifyApprovalRequest(
            admin.id,
            quoteNumber,
            quote.id,
            req.user.email || "User",
            "Quote creation triggered approval rules"
          );
        }
      }
    } catch (notifError) {
      logger.error("Failed to send notifications for new quote:", notifError);
    }
    try {
      const client = await storage.getClient(quote.clientId);
      const enrichedEntity = {
        ...quote,
        client,
        // Allows {{client.name}}
        client_name: client?.name,
        // Allows {{client_name}}
        client_email: client?.email,
        // Allows {{client_email}}
        creator_name: req.user?.name || "QuoteProGen Team",
        // Allows {{creator_name}}
        creator_email: req.user?.email,
        // Allows {{creator_email}}
        formatted_total: `${quote.currency} ${toMoneyString(quote.total)}`,
        // Allows {{formatted_total}}
        formatted_subtotal: `${quote.currency} ${toMoneyString(quote.subtotal)}`
        // Allows {{formatted_subtotal}}
      };
      logger.info(`[WorkflowDebug] Enriched Entity for Create: Client=${enrichedEntity.client_name}, Creator=${enrichedEntity.creator_name}`);
      await WorkflowEngine.triggerWorkflows("quote", quote.id, {
        eventType: "created",
        entity: enrichedEntity,
        triggeredBy: req.user.id
      });
      await WorkflowEngine.triggerWorkflows("quote", quote.id, {
        eventType: "status_change",
        entity: enrichedEntity,
        newValue: quote.status,
        oldValue: null,
        triggeredBy: req.user.id
      });
      await WorkflowEngine.triggerWorkflows("quote", quote.id, {
        eventType: "amount_threshold",
        entity: enrichedEntity,
        triggeredBy: req.user.id
      });
    } catch (workflowError) {
      logger.error("Failed to trigger workflows for new quote:", workflowError);
    }
    return res.json({ ...quote, approvalStatus, approvalRequiredBy });
  } catch (error) {
    logger.error("Create quote error:", error);
    return res.status(500).json({ error: error.message || "Failed to create quote" });
  }
});
router5.patch("/:id", authMiddleware, requireFeature("quotes_edit"), requirePermission("quotes", "edit"), async (req, res) => {
  try {
    const existingQuote = await storage.getQuote(req.params.id);
    if (!existingQuote) {
      return res.status(404).json({ error: "Quote not found" });
    }
    if (existingQuote.status === "invoiced") {
      return res.status(400).json({ error: "Cannot edit an invoiced quote" });
    }
    const existingSalesOrder = await storage.getSalesOrderByQuote(req.params.id);
    if (existingSalesOrder) {
      return res.status(400).json({
        error: "Cannot edit a quote that has been converted to a Sales Order."
      });
    }
    if (["sent", "approved", "rejected", "closed_paid", "closed_cancelled"].includes(existingQuote.status)) {
      const keys = Object.keys(req.body);
      const allowedKeys = ["status", "closureNotes", "closedBy", "closedAt"];
      const hasContentUpdates = keys.some((key) => !allowedKeys.includes(key));
      if (hasContentUpdates) {
        return res.status(400).json({
          error: `Quote is in '${existingQuote.status}' state and cannot be edited. Please use the 'Revise' option to create a new version.`
        });
      }
    }
    const toDate = (v) => {
      if (!v) return void 0;
      if (v instanceof Date) return v;
      if (typeof v === "string") {
        const d = new Date(v);
        return isNaN(d.getTime()) ? void 0 : d;
      }
      return void 0;
    };
    const { items, ...updateFields } = req.body;
    if (!isFeatureEnabled("quotes_discount") && updateFields.discount && Number(updateFields.discount) > 0) {
      return res.status(403).json({ error: "Discounts are currently disabled" });
    }
    if (!isFeatureEnabled("quotes_shippingCharges") && updateFields.shippingCharges && Number(updateFields.shippingCharges) > 0) {
      return res.status(403).json({ error: "Shipping charges feature is disabled" });
    }
    const updateData = { ...updateFields };
    if (updateData.quoteDate) updateData.quoteDate = toDate(updateData.quoteDate);
    if (updateData.validUntil) updateData.validUntil = toDate(updateData.validUntil);
    let quote;
    if (items && Array.isArray(items)) {
      const quoteItemsData = items.map((item, i) => ({
        quoteId: req.params.id,
        productId: item.productId || null,
        description: item.description,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        subtotal: String(item.quantity * item.unitPrice),
        sortOrder: i,
        hsnSac: item.hsnSac || null
      }));
      const subtotal = calculateSubtotal(quoteItemsData);
      const discount = updateData.discount !== void 0 ? updateData.discount : existingQuote.discount;
      const proposedQuote = {
        ...existingQuote,
        ...updateData,
        subtotal: toMoneyString(subtotal)
        // Recalculate total if items changed
        // ...
      };
      const mergedDataForEval = { ...existingQuote, ...updateData };
      if (items) {
        const sub = calculateSubtotal(quoteItemsData);
        mergedDataForEval.subtotal = toMoneyString(sub);
        mergedDataForEval.total = toMoneyString(calculateTotal({
          subtotal: sub,
          discount: mergedDataForEval.discount || 0,
          shippingCharges: mergedDataForEval.shippingCharges || 0,
          cgst: mergedDataForEval.cgst || 0,
          sgst: mergedDataForEval.sgst || 0,
          igst: mergedDataForEval.igst || 0
        }));
      }
      const { approvalStatus, approvalRequiredBy } = await ApprovalService.evaluateQuote(mergedDataForEval);
      Object.assign(updateData, { approvalStatus, approvalRequiredBy });
      quote = await storage.updateQuoteTransaction(req.params.id, updateData, quoteItemsData);
    } else {
      const mergedDataForEval = { ...existingQuote, ...updateData };
      const financialFields = ["discount", "shippingCharges", "items", "total"];
      const isFinancialUpdate = Object.keys(updateData).some((k) => financialFields.includes(k));
      if (isFinancialUpdate) {
        const { approvalStatus, approvalRequiredBy } = await ApprovalService.evaluateQuote(mergedDataForEval);
        Object.assign(updateData, { approvalStatus, approvalRequiredBy });
      }
      quote = await storage.updateQuote(req.params.id, updateData);
    }
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }
    await storage.createActivityLog({
      userId: req.user.id,
      action: "update_quote",
      entityType: "quote",
      entityId: quote.id
    });
    try {
      if (updateData.approvalStatus && updateData.approvalStatus !== existingQuote.approvalStatus) {
        if (["approved", "rejected"].includes(updateData.approvalStatus)) {
          const action = updateData.approvalStatus === "approved" ? "approved" : "rejected";
          await NotificationService.notifyApprovalDecision(
            existingQuote.createdBy,
            quote.quoteNumber,
            quote.id,
            req.user.email || "Approver",
            action
          );
        }
        if (updateData.approvalStatus === "pending") {
          const admins = await db.select().from(users).where(eq5(users.role, "admin"));
          for (const admin of admins) {
            await NotificationService.notifyApprovalRequest(
              admin.id,
              quote.quoteNumber,
              quote.id,
              req.user.email || "User",
              "Quote update triggered approval rules"
            );
          }
        }
      } else if (updateData.status && updateData.status !== existingQuote.status) {
        if (updateData.status === "sent") {
          await NotificationService.notifyQuoteStatusChange(
            existingQuote.createdBy,
            quote.quoteNumber,
            quote.id,
            existingQuote.status,
            "sent"
          );
        }
      }
    } catch (notifError) {
      logger.error("Failed to send notifications for updated quote:", notifError);
    }
    try {
      const client = await storage.getClient(quote.clientId);
      const enrichedEntity = {
        ...quote,
        client,
        client_name: client?.name,
        client_email: client?.email,
        creator_name: req.user?.name || "QuoteProGen Team",
        creator_email: req.user?.email,
        formatted_total: `${quote.currency} ${toMoneyString(quote.total)}`,
        formatted_subtotal: `${quote.currency} ${toMoneyString(quote.subtotal)}`
      };
      logger.info(`[WorkflowDebug] Enriched Entity for Update: Client=${enrichedEntity.client_name}, Creator=${enrichedEntity.creator_name}`);
      if (updateData.status && updateData.status !== existingQuote.status) {
        await WorkflowEngine.triggerWorkflows("quote", quote.id, {
          eventType: "status_change",
          entity: enrichedEntity,
          newValue: updateData.status,
          oldValue: existingQuote.status,
          triggeredBy: req.user.id
        });
      }
      await WorkflowEngine.triggerWorkflows("quote", quote.id, {
        eventType: "field_change",
        entity: enrichedEntity,
        triggeredBy: req.user.id,
        changes: updateData
        // Optional context if needed later
      });
      const financialFields = ["total", "subtotal", "discount"];
      if (Object.keys(updateData).some((k) => financialFields.includes(k))) {
        await WorkflowEngine.triggerWorkflows("quote", quote.id, {
          eventType: "amount_threshold",
          entity: enrichedEntity,
          triggeredBy: req.user.id
        });
      }
    } catch (workflowError) {
      logger.error("Failed to trigger workflows for updated quote:", workflowError);
    }
    return res.json(quote);
  } catch (error) {
    logger.error("Update quote error:", error);
    res.status(500).json({ error: "Failed to update quote" });
  }
});
router5.post("/:id/convert-to-invoice", authMiddleware, requireFeature("quotes_convertToInvoice"), requirePermission("invoices", "create"), async (req, res) => {
  try {
    const result = await db.transaction(async (tx) => {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) throw new Error("Quote not found");
      if (quote.status === "invoiced") {
        throw new Error("Quote is already invoiced");
      }
      const existingSalesOrder = await storage.getSalesOrderByQuote(req.params.id);
      if (existingSalesOrder) {
        const error = new Error("Cannot create invoice directly from quote. This quote has already been converted to a sales order. Please create the invoice from the sales order instead.");
        error.statusCode = 400;
        error.details = {
          salesOrderId: existingSalesOrder.id,
          salesOrderNumber: existingSalesOrder.orderNumber
        };
        throw error;
      }
      const invoiceNumber = await NumberingService.generateMasterInvoiceNumber();
      const [invoice] = await tx.insert(invoices).values({
        invoiceNumber,
        quoteId: quote.id,
        clientId: quote.clientId,
        isMaster: true,
        masterInvoiceStatus: "draft",
        paymentStatus: "pending",
        dueDate: new Date(Date.now() + (quote.validityDays || 30) * 24 * 60 * 60 * 1e3),
        // Default due date based on validity
        paidAmount: "0",
        subtotal: quote.subtotal,
        discount: quote.discount,
        cgst: quote.cgst,
        sgst: quote.sgst,
        igst: quote.igst,
        shippingCharges: quote.shippingCharges,
        total: quote.total,
        notes: quote.notes,
        termsAndConditions: quote.termsAndConditions,
        createdBy: req.user.id
      }).returning();
      const quoteItems2 = await storage.getQuoteItems(quote.id);
      for (const item of quoteItems2) {
        await tx.insert(invoiceItems).values({
          invoiceId: invoice.id,
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          fulfilledQuantity: 0,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          status: "pending",
          sortOrder: item.sortOrder,
          hsnSac: item.hsnSac
        });
      }
      await tx.update(quotes).set({ status: "invoiced", updatedAt: /* @__PURE__ */ new Date() }).where(eq5(quotes.id, quote.id));
      await tx.insert(activityLogs).values({
        userId: req.user.id,
        action: "convert_quote_to_invoice",
        entityType: "invoice",
        entityId: invoice.id
      });
      return invoice;
    });
    return res.json(result);
  } catch (error) {
    logger.error("Convert quote error:", error);
    if (error.statusCode === 400) {
      return res.status(400).json({ error: error.message, ...error.details });
    }
    return res.status(500).json({ error: error.message || "Failed to convert quote" });
  }
});
router5.post("/:id/email", authMiddleware, requireFeature("quotes_emailSending"), requirePermission("quotes", "view"), async (req, res) => {
  try {
    const { recipientEmail, message } = req.body;
    if (!recipientEmail) {
      return res.status(400).json({ error: "Recipient email is required" });
    }
    const quote = await storage.getQuote(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }
    if (quote.approvalStatus === "pending") {
      return res.status(400).json({ error: "Quote requires approval before it can be sent." });
    }
    if (quote.approvalStatus === "rejected") {
      return res.status(400).json({ error: "Quote has been rejected and cannot be sent." });
    }
    const client = await storage.getClient(quote.clientId);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    const items = await storage.getQuoteItems(quote.id);
    const creator = await storage.getUser(quote.createdBy);
    const settings2 = await storage.getAllSettings();
    const companyName = settings2.find((s) => s.key === "company_companyName")?.value || "OPTIVALUE TEK";
    const companyAddress = settings2.find((s) => s.key === "company_address")?.value || "";
    const companyPhone = settings2.find((s) => s.key === "company_phone")?.value || "";
    const companyEmail = settings2.find((s) => s.key === "company_email")?.value || "";
    const companyWebsite = settings2.find((s) => s.key === "company_website")?.value || "";
    const companyGSTIN = settings2.find((s) => s.key === "company_gstin")?.value || "";
    const companyLogo = settings2.find((s) => s.key === "company_logo")?.value;
    const emailSubjectTemplate = settings2.find((s) => s.key === "email_quote_subject")?.value || "Quote {QUOTE_NUMBER} from {COMPANY_NAME}";
    const emailBodyTemplate = settings2.find((s) => s.key === "email_quote_body")?.value || "Dear {CLIENT_NAME},\\n\\nPlease find attached quote {QUOTE_NUMBER} for your review.\\n\\nTotal Amount: {TOTAL}\\nValid Until: {VALIDITY_DATE}\\n\\nBest regards,\\n{COMPANY_NAME}";
    const quoteDate = new Date(quote.quoteDate);
    const validityDate = new Date(quoteDate);
    validityDate.setDate(validityDate.getDate() + (quote.validityDays || 30));
    const variables = {
      "{COMPANY_NAME}": companyName,
      "{CLIENT_NAME}": client.name,
      "{QUOTE_NUMBER}": quote.quoteNumber,
      "{TOTAL}": `\u20B9${Number(quote.total).toLocaleString()}`,
      "{VALIDITY_DATE}": validityDate.toLocaleDateString()
    };
    let emailSubject = emailSubjectTemplate;
    let emailBody = emailBodyTemplate;
    Object.entries(variables).forEach(([key, value]) => {
      const escapedKey = key.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&");
      emailSubject = emailSubject.replace(new RegExp(escapedKey, "g"), value);
      emailBody = emailBody.replace(new RegExp(escapedKey, "g"), value);
    });
    if (message) {
      emailBody = `${emailBody}\\n\\n---\\nAdditional Note:\\n${message}`;
    }
    const bankDetail = await storage.getActiveBankDetails();
    const bankName = bankDetail?.bankName || "";
    const bankAccountNumber = bankDetail?.accountNumber || "";
    const bankAccountName = bankDetail?.accountName || "";
    const bankIfscCode = bankDetail?.ifscCode || "";
    const bankBranch = bankDetail?.branch || "";
    const bankSwiftCode = bankDetail?.swiftCode || "";
    const { PassThrough } = await import("stream");
    const pdfStream = new PassThrough();
    const pdfPromise = PDFService.generateQuotePDF({
      quote,
      client,
      items,
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      companyWebsite,
      companyGSTIN,
      companyLogo,
      preparedBy: creator?.name,
      preparedByEmail: creator?.email,
      bankDetails: {
        bankName,
        accountNumber: bankAccountNumber,
        accountName: bankAccountName,
        ifsc: bankIfscCode,
        branch: bankBranch,
        swift: bankSwiftCode
      }
    }, pdfStream);
    const chunks = [];
    pdfStream.on("data", (chunk) => chunks.push(chunk));
    await new Promise((resolve, reject) => {
      pdfStream.on("end", resolve);
      pdfStream.on("error", reject);
    });
    await pdfPromise;
    const pdfBuffer = Buffer.concat(chunks);
    await EmailService.sendQuoteEmail(
      recipientEmail,
      emailSubject,
      emailBody,
      pdfBuffer
    );
    await storage.createActivityLog({
      userId: req.user.id,
      action: "email_quote",
      entityType: "quote",
      entityId: quote.id
    });
    return res.json({ success: true, message: "Quote sent successfully" });
  } catch (error) {
    logger.error("Email quote error:", error);
    return res.status(500).json({ error: error.message || "Failed to send quote email" });
  }
});
router5.get("/:id/pdf", authMiddleware, requireFeature("quotes_pdfGeneration"), async (req, res) => {
  logger.info(`[PDF Export START] Received request for quote: ${req.params.id}`);
  try {
    const quote = await storage.getQuote(req.params.id);
    logger.info(`[PDF Export] Found quote: ${quote?.quoteNumber}`);
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }
    const client = await storage.getClient(quote.clientId);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    const items = await storage.getQuoteItems(quote.id);
    const creator = await storage.getUser(quote.createdBy);
    const settings2 = await storage.getAllSettings();
    logger.info("Available settings keys:", settings2.map((s) => s.key));
    const companyName = settings2.find((s) => s.key === "company_companyName")?.value || "OPTIVALUE TEK";
    const addr = settings2.find((s) => s.key === "company_address")?.value || "";
    const city = settings2.find((s) => s.key === "company_city")?.value || "";
    const state = settings2.find((s) => s.key === "company_state")?.value || "";
    const zip = settings2.find((s) => s.key === "company_zipCode")?.value || "";
    const country = settings2.find((s) => s.key === "company_country")?.value || "";
    const companyAddress = [addr, city, state, zip, country].filter(Boolean).join(", ");
    const companyPhone = settings2.find((s) => s.key === "company_phone")?.value || "";
    const companyEmail = settings2.find((s) => s.key === "company_email")?.value || "";
    const companyWebsite = settings2.find((s) => s.key === "company_website")?.value || "";
    const companyGSTIN = settings2.find((s) => s.key === "company_gstin")?.value || "";
    const companyLogo = settings2.find((s) => s.key === "company_logo")?.value;
    logger.info("Company Logo found:", !!companyLogo, "Length:", companyLogo?.length);
    const bankName = settings2.find((s) => s.key === "bank_bankName")?.value || "";
    const bankAccountNumber = settings2.find((s) => s.key === "bank_accountNumber")?.value || "";
    const bankAccountName = settings2.find((s) => s.key === "bank_accountName")?.value || "";
    const bankIfscCode = settings2.find((s) => s.key === "bank_ifscCode")?.value || "";
    const bankBranch = settings2.find((s) => s.key === "bank_branch")?.value || "";
    const bankSwiftCode = settings2.find((s) => s.key === "bank_swiftCode")?.value || "";
    logger.error("!!! DEBUG BANK DETAILS !!!", {
      bankName,
      bankAccountNumber,
      bankAccountName,
      bankIfscCode
    });
    const cleanFilename = `Quote-${quote.quoteNumber}.pdf`.replace(/[^\w\-. ]/g, "_");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", "");
    res.setHeader("Content-Disposition", `attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    logger.info(`[PDF Export] Quote #${quote.quoteNumber}`);
    logger.info(`[PDF Export] Clean filename: ${cleanFilename}`);
    logger.info(`[PDF Export] Content-Disposition header: attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`);
    logger.info(`[PDF Export] Attempting offload to Worker Thread`);
    const pdfPayload = {
      quote,
      client,
      items,
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      companyWebsite,
      companyGSTIN,
      companyLogo,
      preparedBy: creator?.name,
      preparedByEmail: creator?.email,
      bankDetails: {
        bankName,
        accountNumber: bankAccountNumber,
        accountName: bankAccountName,
        ifsc: bankIfscCode,
        branch: bankBranch,
        swift: bankSwiftCode
      }
    };
    let pdfBuffer;
    try {
      pdfBuffer = await PDFService.generateQuotePDFInWorker(pdfPayload);
      logger.info(`[PDF Export] Worker returned PDF buffer. Size: ${pdfBuffer.length}`);
    } catch (err) {
      logger.warn(`[PDF Export] Worker failed (${err.message}). Falling back to main thread.`);
      const { PassThrough } = await import("stream");
      const stream = new PassThrough();
      const chunks = [];
      stream.on("data", (c) => chunks.push(c));
      const done = new Promise((resolve, reject) => {
        stream.on("end", () => resolve());
        stream.on("error", reject);
      });
      await PDFService.generateQuotePDF(pdfPayload, stream);
      await done;
      pdfBuffer = Buffer.concat(chunks);
      logger.info(`[PDF Export] Main thread generated PDF buffer. Size: ${pdfBuffer.length}`);
    }
    res.send(pdfBuffer);
    logger.info(`[PDF Export] PDF stream piped successfully`);
    await storage.createActivityLog({
      userId: req.user.id,
      action: "export_pdf",
      entityType: "quote",
      entityId: quote.id
    });
    logger.info(`[PDF Export COMPLETE] Quote PDF exported successfully: ${quote.quoteNumber}`);
  } catch (error) {
    logger.error("[PDF Export ERROR]", error);
    return res.status(500).json({ error: error.message || "Failed to generate PDF" });
  }
});
router5.get("/:id/invoices", authMiddleware, async (req, res) => {
  try {
    const invoices2 = await storage.getInvoicesByQuote(req.params.id);
    const enrichedInvoices = await Promise.all(
      invoices2.map(async (invoice) => {
        const items = await storage.getInvoiceItems(invoice.id);
        return { ...invoice, items };
      })
    );
    res.json(enrichedInvoices);
  } catch (error) {
    logger.error("Error fetching invoices:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});
router5.post("/:id/share", authMiddleware, requirePermission("quotes", "edit"), async (req, res) => {
  try {
    const quote = await storage.getQuote(req.params.id);
    if (!quote) return res.status(404).json({ error: "Quote not found" });
    const { nanoid: nanoid2 } = await import("nanoid");
    const token = nanoid2(32);
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    const updated = await storage.updateQuote(quote.id, {
      publicToken: quote.publicToken || token,
      // Keep existing if present, or use new
      tokenExpiresAt: quote.tokenExpiresAt || expiresAt
      // Keep existing expiry if present
    });
    if (!updated) {
      throw new Error("Failed to update quote with public token");
    }
    return res.json({
      token: updated.publicToken,
      expiresAt: updated.tokenExpiresAt,
      url: `${req.protocol}://${req.get("host")}/p/quote/${updated.publicToken}`
    });
  } catch (error) {
    logger.error("Share quote error:", error);
    return res.status(500).json({ error: "Failed to generate share link" });
  }
});
router5.delete("/:id/share", authMiddleware, requirePermission("quotes", "edit"), async (req, res) => {
  try {
    const quote = await storage.getQuote(req.params.id);
    if (!quote) return res.status(404).json({ error: "Quote not found" });
    await storage.updateQuote(quote.id, {
      publicToken: null,
      tokenExpiresAt: null
    });
    return res.json({ success: true });
  } catch (error) {
    logger.error("Unshare quote error:", error);
    return res.status(500).json({ error: "Failed to remove share link" });
  }
});
router5.get("/:id/comments", requireFeature("quotes_module"), authMiddleware, async (req, res) => {
  try {
    const quote = await storage.getQuote(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }
    const comments = await storage.getQuoteComments(quote.id, true);
    res.json(comments);
  } catch (error) {
    logger.error("Quote comments fetch error:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});
router5.post("/:id/comments", requireFeature("quotes_module"), authMiddleware, async (req, res) => {
  try {
    const { message, isInternal } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    const quote = await storage.getQuote(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }
    const user = await storage.getUser(req.user.id);
    const comment = await storage.createQuoteComment({
      quoteId: quote.id,
      authorType: "internal",
      authorName: user?.name || req.user.email,
      authorEmail: req.user.email,
      message,
      parentCommentId: null,
      isInternal: isInternal || false
    });
    await storage.createActivityLog({
      userId: req.user.id,
      action: "staff_comment",
      entityType: "quote",
      entityId: quote.id,
      metadata: { commentId: comment.id, isInternal }
    });
    res.json(comment);
  } catch (error) {
    logger.error("Quote comment create error:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});
router5.post("/:id/approve", authMiddleware, requireFeature("quotes_approve"), requirePermission("quotes", "edit"), async (req, res) => {
  try {
    const quote = await storage.getQuote(req.params.id);
    if (!quote) return res.status(404).json({ error: "Quote not found" });
    if (quote.approvalStatus !== "pending") {
      return res.status(400).json({ error: "Quote is not pending approval" });
    }
    const requiredRole = quote.approvalRequiredBy;
    if (requiredRole && req.user.role !== requiredRole && req.user.role !== "admin") {
      return res.status(403).json({ error: `You do not have permission to approve this quote. Required role: ${requiredRole}` });
    }
    const updated = await storage.updateQuote(quote.id, {
      approvalStatus: "approved",
      status: "approved"
      // Also update main status? Or keep as draft/sent? Usually 'approved' is internal.
      // Let's map internal approval to main status 'approved' for now, but usually 'approved' in main status means Client Approved.
      // Wait, `quoteStatusEnum` has `approved`. Is that for Client or Internal?
      // Usually Client. 
      // If we have internal approval, maybe we keep it as 'draft' or 'pending'?
      // Let's keep main status as 'draft' (or whatever it was) but set `approvalStatus` to `approved`.
      // When sending, we check `approvalStatus`.
      // BUT, if the user manually sets status to 'Approved' (Client Approved), we might want to block that if internal approval is pending?
      // For now, let's just update `approvalStatus`.
      // Actually, if it's "Approved" by manager, it's ready to be sent.
    });
    await storage.createActivityLog({
      userId: req.user.id,
      action: "approve_quote_internal",
      entityType: "quote",
      entityId: quote.id
    });
    res.json(updated);
  } catch (error) {
    logger.error("Approve quote error:", error);
    res.status(500).json({ error: "Failed to approve quote" });
  }
});
router5.post("/:id/reject", authMiddleware, requireFeature("quotes_approve"), requirePermission("quotes", "edit"), async (req, res) => {
  try {
    const quote = await storage.getQuote(req.params.id);
    if (!quote) return res.status(404).json({ error: "Quote not found" });
    if (quote.approvalStatus !== "pending") {
      return res.status(400).json({ error: "Quote is not pending approval" });
    }
    const requiredRole = quote.approvalRequiredBy;
    if (requiredRole && req.user.role !== requiredRole && req.user.role !== "admin") {
      return res.status(403).json({ error: `You do not have permission to reject this quote. Required role: ${requiredRole}` });
    }
    const updated = await storage.updateQuote(quote.id, {
      approvalStatus: "rejected",
      status: "rejected"
      // Update main status to rejected too?
    });
    await storage.createActivityLog({
      userId: req.user.id,
      action: "reject_quote_internal",
      entityType: "quote",
      entityId: quote.id
    });
    res.json(updated);
  } catch (error) {
    logger.error("Reject quote error:", error);
    res.status(500).json({ error: "Failed to reject quote" });
  }
});
var quotes_routes_default = router5;

// server/routes/invoices.routes.ts
init_storage();
import { Router as Router6 } from "express";
init_logger();
init_db();
init_schema();
init_numbering_service();
import { eq as eq7, sql as sql7 } from "drizzle-orm";
var router6 = Router6();
router6.get("/", requireFeature("invoices_module"), authMiddleware, async (req, res) => {
  try {
    const invoices2 = await storage.getAllInvoices();
    const invoicesWithDetails = await Promise.all(
      invoices2.map(async (invoice) => {
        const client = invoice.clientId ? await storage.getClient(invoice.clientId) : void 0;
        return {
          ...invoice,
          clientName: client?.name || "Unknown"
        };
      })
    );
    res.json(invoicesWithDetails);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});
router6.get("/:id", requireFeature("invoices_module"), authMiddleware, async (req, res) => {
  try {
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    const client = invoice.clientId ? await storage.getClient(invoice.clientId) : void 0;
    const items = await storage.getInvoiceItems(invoice.id);
    const creator = invoice.createdBy ? await storage.getUser(invoice.createdBy) : void 0;
    let parentInvoice = void 0;
    if (invoice.parentInvoiceId) {
      parentInvoice = await storage.getInvoice(invoice.parentInvoiceId);
    }
    let childInvoices = [];
    if (invoice.isMaster) {
      if (invoice.quoteId) {
        const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId || "");
        childInvoices = allInvoices.filter((inv) => inv.parentInvoiceId === invoice.id);
      } else if (invoice.salesOrderId) {
        const allInvoices = await storage.getInvoicesBySalesOrder(invoice.salesOrderId);
        childInvoices = allInvoices.filter((inv) => inv.parentInvoiceId === invoice.id);
      }
    }
    const formattedItems = items.map((item) => ({
      ...item,
      productId: item.productId,
      quantity: Number(item.quantity),
      unitPrice: String(item.unitPrice),
      subtotal: String(item.subtotal),
      fulfilledQuantity: Number(item.fulfilledQuantity || 0),
      status: item.status || "pending"
    }));
    res.json({
      ...invoice,
      client,
      items: formattedItems,
      createdByName: creator?.name || "Unknown",
      parentInvoice,
      childInvoices
    });
  } catch (error) {
    logger.error("Error fetching invoice:", error);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});
router6.put("/:id/master-status", authMiddleware, requireFeature("invoices_finalize"), requirePermission("invoices", "finalize"), async (req, res) => {
  try {
    const { masterInvoiceStatus } = req.body;
    if (!["draft", "confirmed", "locked"].includes(masterInvoiceStatus)) {
      return res.status(400).json({ error: "Invalid master invoice status" });
    }
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    if (!invoice.isMaster) {
      return res.status(400).json({ error: "This is not a master invoice" });
    }
    const currentStatus = invoice.masterInvoiceStatus;
    const validTransitions = {
      "draft": ["confirmed"],
      "confirmed": ["locked"],
      "locked": []
      // Cannot transition from locked
    };
    if (currentStatus && !validTransitions[currentStatus]?.includes(masterInvoiceStatus)) {
      return res.status(400).json({
        error: `Cannot transition from ${currentStatus} to ${masterInvoiceStatus}`
      });
    }
    const updatedInvoice = await storage.updateInvoice(req.params.id, {
      masterInvoiceStatus
    });
    await storage.createActivityLog({
      userId: req.user.id,
      action: `master_invoice_${masterInvoiceStatus}`,
      entityType: "invoice",
      entityId: invoice.id
    });
    res.json({ success: true, invoice: updatedInvoice });
  } catch (error) {
    logger.error("Update master invoice status error:", error);
    return res.status(500).json({ error: error.message || "Failed to update master invoice status" });
  }
});
router6.put("/:id/master-details", authMiddleware, requireFeature("invoices_edit"), requirePermission("invoices", "edit"), async (req, res) => {
  try {
    const result = await db.transaction(async (tx) => {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        throw new Error("Invoice not found");
      }
      const isMasterInvoice = invoice.isMaster;
      const isChildInvoice = !!invoice.parentInvoiceId;
      const isRegularInvoice = !isMasterInvoice && !isChildInvoice;
      if (isMasterInvoice) {
        if (invoice.masterInvoiceStatus === "locked") {
          const error = new Error("Cannot edit a locked master invoice");
          error.statusCode = 400;
          throw error;
        }
      } else if (isChildInvoice || isRegularInvoice) {
        if (invoice.paymentStatus === "paid") {
          const error = new Error("Cannot edit a paid invoice");
          error.statusCode = 400;
          throw error;
        }
      }
      const isDraft = isMasterInvoice ? !invoice.masterInvoiceStatus || invoice.masterInvoiceStatus === "draft" : invoice.paymentStatus !== "paid";
      const updateData = {};
      if (isDraft) {
        const editableFields = [
          "notes",
          "termsAndConditions",
          "deliveryNotes",
          "milestoneDescription",
          "dueDate",
          "subtotal",
          "discount",
          "cgst",
          "sgst",
          "igst",
          "shippingCharges",
          "total",
          "paymentStatus",
          "paidAmount",
          "bomSection"
        ];
        for (const field of editableFields) {
          if (req.body[field] !== void 0) {
            updateData[field] = req.body[field];
          }
        }
        if (req.body.items && Array.isArray(req.body.items)) {
          if (isChildInvoice && invoice.parentInvoiceId) {
            const masterInvoice = await storage.getInvoice(invoice.parentInvoiceId);
            if (masterInvoice) {
              const masterItems = await storage.getInvoiceItems(masterInvoice.id);
              const allChildInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId || "");
              const siblingInvoices = allChildInvoices.filter(
                (inv) => inv.parentInvoiceId === masterInvoice.id && inv.id !== invoice.id
              );
              const invoicedQuantities = {};
              for (const sibling of siblingInvoices) {
                const siblingItems = await storage.getInvoiceItems(sibling.id);
                for (const item of siblingItems) {
                  const key = item.productId || item.description;
                  invoicedQuantities[key] = (invoicedQuantities[key] || 0) + item.quantity;
                }
              }
              for (const newItem of req.body.items) {
                const masterItem = masterItems.find((mi) => mi.productId && mi.productId === newItem.productId || mi.description === newItem.description);
                if (!masterItem) {
                  const error = new Error(`Item "${newItem.description}" not found in master invoice`);
                  error.statusCode = 400;
                  throw error;
                }
                const key = newItem.productId || newItem.description;
                const alreadyInvoiced = invoicedQuantities[key] || 0;
                const remaining = masterItem.quantity - alreadyInvoiced;
                if (newItem.quantity > remaining) {
                  const error = new Error(`Item "${newItem.description}" quantity (${newItem.quantity}) exceeds remaining quantity (${remaining})`);
                  error.statusCode = 400;
                  throw error;
                }
              }
            }
          }
          await tx.delete(invoiceItems).where(eq7(invoiceItems.invoiceId, invoice.id));
          for (const item of req.body.items) {
            await tx.insert(invoiceItems).values({
              invoiceId: invoice.id,
              productId: item.productId || null,
              description: item.description,
              quantity: item.quantity,
              fulfilledQuantity: item.fulfilledQuantity || 0,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal || String(Number(item.quantity) * Number(item.unitPrice)),
              serialNumbers: item.serialNumbers || null,
              status: item.status || "pending",
              sortOrder: item.sortOrder || 0,
              hsnSac: item.hsnSac || null
            });
          }
        }
      } else {
        const allowedFields = ["notes", "termsAndConditions", "deliveryNotes", "milestoneDescription"];
        for (const field of allowedFields) {
          if (req.body[field] !== void 0) {
            updateData[field] = req.body[field];
          }
        }
      }
      if (Object.keys(updateData).length === 0 && (!isDraft || !req.body.items)) {
        const error = new Error("No valid fields to update");
        error.statusCode = 400;
        throw error;
      }
      let updatedInvoice;
      if (Object.keys(updateData).length > 0) {
        [updatedInvoice] = await tx.update(invoices).set(updateData).where(eq7(invoices.id, req.params.id)).returning();
      } else {
        updatedInvoice = invoice;
      }
      await tx.insert(activityLogs).values({
        userId: req.user.id,
        action: "update_master_invoice",
        entityType: "invoice",
        entityId: invoice.id
      });
      return { success: true, invoice: updatedInvoice };
    });
    res.json(result);
  } catch (error) {
    logger.error("Update master invoice error:", error);
    if (error.statusCode === 400) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || "Failed to update master invoice" });
  }
});
router6.put("/:id/finalize", authMiddleware, requireFeature("invoices_finalize"), requirePermission("invoices", "finalize"), async (req, res) => {
  try {
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    if (invoice.paymentStatus === "paid") {
      return res.status(400).json({ error: "Cannot finalize paid invoices" });
    }
    if (invoice.status === "cancelled") {
      return res.status(400).json({ error: "Cannot finalize cancelled invoices" });
    }
    if (invoice.isMaster && invoice.masterInvoiceStatus !== "confirmed" && invoice.masterInvoiceStatus !== "locked") {
      return res.status(400).json({ error: "Master invoice must be confirmed before finalizing" });
    }
    const updatedInvoice = await storage.updateInvoice(req.params.id, {
      finalizedAt: /* @__PURE__ */ new Date(),
      finalizedBy: req.user.id,
      status: invoice.status === "draft" ? "sent" : invoice.status
    });
    await storage.createActivityLog({
      userId: req.user.id,
      action: "invoice_finalized",
      entityType: "invoice",
      entityId: invoice.id
    });
    res.json({ success: true, invoice: updatedInvoice });
  } catch (error) {
    logger.error("Finalize invoice error:", error);
    return res.status(500).json({ error: error.message || "Failed to finalize invoice" });
  }
});
router6.put("/:id/lock", authMiddleware, requireFeature("invoices_lock"), requirePermission("invoices", "lock"), async (req, res) => {
  try {
    const { isLocked } = req.body;
    if (typeof isLocked !== "boolean") {
      return res.status(400).json({ error: "isLocked must be a boolean" });
    }
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    if (isLocked && !invoice.finalizedAt && invoice.paymentStatus !== "paid") {
      return res.status(400).json({ error: "Can only lock finalized or paid invoices" });
    }
    const updatedInvoice = await storage.updateInvoice(req.params.id, {
      isLocked
    });
    await storage.createActivityLog({
      userId: req.user.id,
      action: isLocked ? "invoice_locked" : "invoice_unlocked",
      entityType: "invoice",
      entityId: invoice.id
    });
    res.json({ success: true, invoice: updatedInvoice });
  } catch (error) {
    logger.error("Lock invoice error:", error);
    return res.status(500).json({ error: error.message || "Failed to lock/unlock invoice" });
  }
});
router6.put("/:id/cancel", authMiddleware, requireFeature("invoices_cancel"), requirePermission("invoices", "cancel"), async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    if (!cancellationReason || cancellationReason.trim().length === 0) {
      return res.status(400).json({ error: "Cancellation reason is required" });
    }
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    if (invoice.paymentStatus === "paid") {
      return res.status(400).json({ error: "Cannot cancel fully paid invoices" });
    }
    if (invoice.status === "cancelled" || invoice.cancelledAt) {
      return res.status(400).json({ error: "Invoice is already cancelled" });
    }
    let childInvoices = [];
    if (invoice.isMaster) {
      const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId || "");
      childInvoices = allInvoices.filter((inv) => inv.parentInvoiceId === invoice.id);
      const paidChildren = childInvoices.filter((c) => c.paymentStatus === "paid");
      if (paidChildren.length > 0) {
        return res.status(400).json({ error: "Cannot cancel master invoice with paid child invoices" });
      }
    }
    const result = await db.transaction(async (tx) => {
      const reverseStockForInvoice = async (invoiceId) => {
        const restoredViaSerials = /* @__PURE__ */ new Set();
        const serialsResult = await tx.select().from(serialNumbers).where(eq7(serialNumbers.invoiceId, invoiceId));
        const productStockUpdatesFromSerials = {};
        for (const serial2 of serialsResult) {
          if (serial2.productId) {
            productStockUpdatesFromSerials[serial2.productId] = (productStockUpdatesFromSerials[serial2.productId] || 0) + 1;
            restoredViaSerials.add(serial2.productId);
          }
          await tx.update(serialNumbers).set({
            status: "in_stock",
            invoiceId: null,
            invoiceItemId: null,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq7(serialNumbers.id, serial2.id));
        }
        for (const [productId, quantityToRestore] of Object.entries(productStockUpdatesFromSerials)) {
          await tx.update(products).set({
            stockQuantity: sql7`${products.stockQuantity} + ${quantityToRestore}`,
            availableQuantity: sql7`${products.availableQuantity} + ${quantityToRestore}`,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq7(products.id, productId));
        }
        const invoiceItems2 = await tx.select().from(invoiceItems).where(eq7(invoiceItems.invoiceId, invoiceId));
        for (const item of invoiceItems2) {
          if (item.productId && !restoredViaSerials.has(item.productId)) {
            const quantityToRestore = Number(item.quantity) || 0;
            if (quantityToRestore > 0) {
              await tx.update(products).set({
                stockQuantity: sql7`${products.stockQuantity} + ${quantityToRestore}`,
                availableQuantity: sql7`${products.availableQuantity} + ${quantityToRestore}`,
                updatedAt: /* @__PURE__ */ new Date()
              }).where(eq7(products.id, item.productId));
            }
          }
        }
        const totalSerials = serialsResult.length;
        const totalItems = invoiceItems2.filter((i) => i.productId && !restoredViaSerials.has(i.productId)).length;
        logger.stock(`[Stock Reversal] Restored ${totalSerials} serial items and ${totalItems} regular items for invoice ${invoiceId}`);
      };
      if (invoice.isMaster) {
        for (const child of childInvoices) {
          if (child.paymentStatus !== "paid") {
            await reverseStockForInvoice(child.id);
            await tx.update(invoices).set({
              status: "cancelled",
              paymentStatus: "cancelled",
              cancelledAt: /* @__PURE__ */ new Date(),
              cancelledBy: req.user.id,
              cancellationReason: `Parent invoice cancelled: ${cancellationReason}`,
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq7(invoices.id, child.id));
          }
        }
      }
      await reverseStockForInvoice(req.params.id);
      const [updatedInvoice] = await tx.update(invoices).set({
        status: "cancelled",
        paymentStatus: "cancelled",
        cancelledAt: /* @__PURE__ */ new Date(),
        cancelledBy: req.user.id,
        cancellationReason,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq7(invoices.id, req.params.id)).returning();
      await tx.insert(activityLogs).values({
        userId: req.user.id,
        action: "invoice_cancelled",
        entityType: "invoice",
        entityId: invoice.id,
        timestamp: /* @__PURE__ */ new Date()
      });
      return updatedInvoice;
    });
    res.json({ success: true, invoice: result });
  } catch (error) {
    logger.error("Cancel invoice error:", error);
    return res.status(500).json({ error: error.message || "Failed to cancel invoice" });
  }
});
router6.delete("/:id", authMiddleware, requireFeature("invoices_delete"), requirePermission("invoices", "delete"), async (req, res) => {
  try {
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    if (invoice.paymentStatus === "paid" || invoice.paymentStatus === "partial") {
      return res.status(400).json({ error: "Cannot delete invoices with payments. Please cancel instead." });
    }
    if (invoice.isMaster) {
      const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId || "");
      const childInvoices = allInvoices.filter((inv) => inv.parentInvoiceId === invoice.id);
      if (childInvoices.length > 0) {
        return res.status(400).json({ error: "Cannot delete master invoice with child invoices" });
      }
    }
    const updatedInvoice = await storage.updateInvoice(req.params.id, {
      status: "cancelled",
      cancelledAt: /* @__PURE__ */ new Date(),
      cancelledBy: req.user.id,
      cancellationReason: "Deleted by user"
    });
    await storage.createActivityLog({
      userId: req.user.id,
      action: "invoice_deleted",
      entityType: "invoice",
      entityId: invoice.id
    });
    res.json({ success: true, message: "Invoice deleted successfully" });
  } catch (error) {
    logger.error("Delete invoice error:", error);
    return res.status(500).json({ error: error.message || "Failed to delete invoice" });
  }
});
router6.post("/:id/create-child-invoice", authMiddleware, requireFeature("invoices_childInvoices"), requirePermission("invoices", "create"), async (req, res) => {
  try {
    const result = await db.transaction(async (tx) => {
      const { items, dueDate, notes, deliveryNotes, milestoneDescription } = req.body;
      const masterInvoice = await storage.getInvoice(req.params.id);
      if (!masterInvoice) {
        throw new Error("Master invoice not found");
      }
      if (!masterInvoice.isMaster) {
        throw new Error("This is not a master invoice");
      }
      if (masterInvoice.masterInvoiceStatus === "draft") {
        throw new Error("Master invoice must be confirmed before creating child invoices");
      }
      const masterItems = await storage.getInvoiceItems(masterInvoice.id);
      const allChildInvoices = masterInvoice.quoteId ? await storage.getInvoicesByQuote(masterInvoice.quoteId || "") : await storage.getInvoicesBySalesOrder(masterInvoice.salesOrderId || "");
      const siblingInvoices = allChildInvoices.filter((inv) => inv.parentInvoiceId === masterInvoice.id);
      const invoicedQuantities = {};
      for (const sibling of siblingInvoices) {
        const siblingItems = await storage.getInvoiceItems(sibling.id);
        for (const item of siblingItems) {
          const key = item.productId || item.description;
          invoicedQuantities[key] = (invoicedQuantities[key] || 0) + item.quantity;
        }
      }
      const processedItems = [];
      let subtotal = 0;
      for (const rawItem of items) {
        const newItem = { ...rawItem };
        const masterItem = masterItems.find(
          (mi) => newItem.itemId && mi.id === newItem.itemId || mi.productId && mi.productId === newItem.productId || mi.description === newItem.description
        );
        if (!masterItem) {
          const error = new Error(`Item "${newItem.description}" not found in master invoice`);
          error.statusCode = 400;
          throw error;
        }
        if (!newItem.unitPrice) newItem.unitPrice = masterItem.unitPrice;
        if (!newItem.hsnSac) newItem.hsnSac = masterItem.hsnSac;
        if (!newItem.productId) newItem.productId = masterItem.productId;
        const unitPrice = Number(newItem.unitPrice);
        const quantity = Number(newItem.quantity);
        if (isNaN(unitPrice)) {
          const error = new Error(`Invalid Unit Price for item "${newItem.description}". Master item price: ${masterItem.unitPrice}`);
          error.statusCode = 400;
          throw error;
        }
        const key = newItem.productId || newItem.description;
        const alreadyInvoiced = invoicedQuantities[String(key)] || 0;
        const remaining = masterItem.quantity - alreadyInvoiced;
        if (quantity > remaining) {
          const error = new Error(`Item "${newItem.description}" quantity (${newItem.quantity}) exceeds remaining quantity (${remaining})`);
          error.statusCode = 400;
          throw error;
        }
        subtotal += unitPrice * quantity;
        processedItems.push(newItem);
      }
      const masterSubtotal = Number(masterInvoice.subtotal);
      const ratio = masterSubtotal > 0 ? subtotal / masterSubtotal : 0;
      const cgst = (Number(masterInvoice.cgst) * ratio).toFixed(2);
      const sgst = (Number(masterInvoice.sgst) * ratio).toFixed(2);
      const igst = (Number(masterInvoice.igst) * ratio).toFixed(2);
      const shippingCharges = (Number(masterInvoice.shippingCharges) * ratio).toFixed(2);
      const discount = (Number(masterInvoice.discount) * ratio).toFixed(2);
      const total = subtotal + Number(cgst) + Number(sgst) + Number(igst) + Number(shippingCharges) - Number(discount);
      if (isNaN(total)) {
        throw new Error("Calculation resulted in NaN. Check inputs.");
      }
      const invoiceNumber = await NumberingService.generateChildInvoiceNumber();
      const [childInvoice] = await tx.insert(invoices).values({
        invoiceNumber,
        parentInvoiceId: masterInvoice.id,
        quoteId: masterInvoice.quoteId,
        clientId: masterInvoice.clientId,
        paymentStatus: "pending",
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
        paidAmount: "0",
        subtotal: subtotal.toFixed(2),
        discount,
        cgst,
        sgst,
        igst,
        shippingCharges,
        total: total.toFixed(2),
        notes: notes || masterInvoice.notes,
        termsAndConditions: masterInvoice.termsAndConditions,
        isMaster: false,
        deliveryNotes: deliveryNotes || null,
        milestoneDescription: milestoneDescription || null,
        createdBy: req.user.id
      }).returning();
      for (const item of processedItems) {
        await tx.insert(invoiceItems).values({
          invoiceId: childInvoice.id,
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          fulfilledQuantity: 0,
          unitPrice: item.unitPrice,
          subtotal: (Number(item.unitPrice) * item.quantity).toFixed(2),
          status: "pending",
          sortOrder: item.sortOrder || 0,
          hsnSac: item.hsnSac || null
        });
      }
      await tx.insert(activityLogs).values({
        userId: req.user.id,
        action: "create_child_invoice",
        entityType: "invoice",
        entityId: childInvoice.id
      });
      return childInvoice;
    });
    return res.json(result);
  } catch (error) {
    logger.error("Create child invoice error:", error);
    if (error.statusCode === 400) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || "Failed to create child invoice" });
  }
});
router6.get("/:id/master-summary", authMiddleware, async (req, res) => {
  try {
    const masterInvoice = await storage.getInvoice(req.params.id);
    if (!masterInvoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    if (!masterInvoice.isMaster) {
      return res.status(400).json({ error: "This is not a master invoice" });
    }
    const masterItems = await storage.getInvoiceItems(masterInvoice.id);
    const allInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId || "");
    const childInvoices = allInvoices.filter((inv) => inv.parentInvoiceId === masterInvoice.id);
    const invoicedQuantities = {};
    const invoicedAmounts = {};
    for (const child of childInvoices) {
      const childItems = await storage.getInvoiceItems(child.id);
      for (const item of childItems) {
        const key = item.description;
        invoicedQuantities[key] = (invoicedQuantities[key] || 0) + item.quantity;
        invoicedAmounts[key] = (invoicedAmounts[key] || 0) + Number(item.subtotal);
      }
    }
    const itemsSummary = masterItems.map((item) => ({
      id: item.id,
      description: item.description,
      masterQuantity: item.quantity,
      masterUnitPrice: item.unitPrice,
      masterSubtotal: item.subtotal,
      invoicedQuantity: invoicedQuantities[item.description] || 0,
      invoicedAmount: invoicedAmounts[item.description] || 0,
      remainingQuantity: item.quantity - (invoicedQuantities[item.description] || 0),
      remainingAmount: Number(item.subtotal) - (invoicedAmounts[item.description] || 0)
    }));
    const totalInvoiced = childInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const totalRemaining = Number(masterInvoice.total) - totalInvoiced;
    return res.json({
      masterInvoice: {
        id: masterInvoice.id,
        invoiceNumber: masterInvoice.invoiceNumber,
        status: masterInvoice.masterInvoiceStatus || "draft",
        total: masterInvoice.total,
        subtotal: masterInvoice.subtotal,
        discount: masterInvoice.discount,
        cgst: masterInvoice.cgst,
        sgst: masterInvoice.sgst,
        igst: masterInvoice.igst,
        shippingCharges: masterInvoice.shippingCharges,
        createdAt: masterInvoice.createdAt
      },
      items: itemsSummary,
      childInvoices: childInvoices.map((child) => ({
        id: child.id,
        invoiceNumber: child.invoiceNumber,
        total: child.total,
        paymentStatus: child.paymentStatus,
        paidAmount: child.paidAmount,
        createdAt: child.createdAt
      })),
      totals: {
        masterTotal: masterInvoice.total,
        totalInvoiced: totalInvoiced.toFixed(2),
        totalRemaining: totalRemaining.toFixed(2),
        invoicedPercentage: (totalInvoiced / Number(masterInvoice.total) * 100).toFixed(2)
      }
    });
  } catch (error) {
    logger.error("Get master invoice summary error:", error);
    return res.status(500).json({ error: error.message || "Failed to get master invoice summary" });
  }
});
router6.get("/:id/pdf", authMiddleware, requireFeature("invoices_pdfGeneration"), async (req, res) => {
  try {
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    const quote = await storage.getQuote(invoice.quoteId || "");
    if (!quote) {
      if (!invoice.quoteId) {
      }
    }
    const client = invoice.clientId ? await storage.getClient(invoice.clientId) : void 0;
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    const items = await storage.getInvoiceItems(invoice.id);
    const creator = invoice.createdBy ? await storage.getUser(invoice.createdBy) : void 0;
    let parentInvoice = void 0;
    if (invoice.parentInvoiceId) {
      parentInvoice = await storage.getInvoice(invoice.parentInvoiceId);
    }
    let childInvoices = [];
    if (invoice.isMaster) {
      if (invoice.quoteId) {
        const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId || "");
        const children = allInvoices.filter((inv) => inv.parentInvoiceId === invoice.id);
        childInvoices = children.map((c) => ({
          invoiceNumber: c.invoiceNumber,
          total: c.total,
          paymentStatus: c.paymentStatus,
          createdAt: c.createdAt.toISOString()
        }));
      }
    }
    const settings2 = await storage.getAllSettings();
    const companyName = settings2.find((s) => s.key === "company_companyName")?.value || "OPTIVALUE TEK";
    const addr = settings2.find((s) => s.key === "company_address")?.value || "";
    const city = settings2.find((s) => s.key === "company_city")?.value || "";
    const state = settings2.find((s) => s.key === "company_state")?.value || "";
    const zip = settings2.find((s) => s.key === "company_zipCode")?.value || "";
    const country = settings2.find((s) => s.key === "company_country")?.value || "";
    const companyAddress = [addr, city, state, zip, country].filter(Boolean).join(", ");
    const companyPhone = settings2.find((s) => s.key === "company_phone")?.value || "";
    const companyEmail = settings2.find((s) => s.key === "company_email")?.value || "";
    const companyWebsite = settings2.find((s) => s.key === "company_website")?.value || "";
    const companyGSTIN = settings2.find((s) => s.key === "company_gstin")?.value || "";
    const companyLogo = settings2.find((s) => s.key === "company_logo")?.value;
    const bankName = settings2.find((s) => s.key === "bank_bankName")?.value || "";
    const bankAccountNumber = settings2.find((s) => s.key === "bank_accountNumber")?.value || "";
    const bankAccountName = settings2.find((s) => s.key === "bank_accountName")?.value || "";
    const bankIfscCode = settings2.find((s) => s.key === "bank_ifscCode")?.value || "";
    const bankBranch = settings2.find((s) => s.key === "bank_branch")?.value || "";
    const bankSwiftCode = settings2.find((s) => s.key === "bank_swiftCode")?.value || "";
    const cleanFilename = `Invoice-${invoice.invoiceNumber}.pdf`.replace(/[^\w\-. ]/g, "_");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`);
    await InvoicePDFService.generateInvoicePDF({
      quote: quote || {},
      // Handle missing quote
      client,
      items,
      currency: invoice.currency,
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      companyWebsite,
      companyGSTIN,
      companyLogo: companyLogo || void 0,
      preparedBy: creator?.name,
      userEmail: req.user?.email,
      companyDetails: {
        name: companyName,
        address: companyAddress,
        phone: companyPhone,
        email: companyEmail,
        website: companyWebsite,
        gstin: companyGSTIN
      },
      invoiceNumber: invoice.invoiceNumber,
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : /* @__PURE__ */ new Date(),
      paidAmount: invoice.paidAmount || "0",
      paymentStatus: invoice.paymentStatus || "pending",
      isMaster: invoice.isMaster || false,
      // Ensure boolean
      masterInvoiceStatus: invoice.masterInvoiceStatus || void 0,
      parentInvoiceNumber: parentInvoice?.invoiceNumber,
      childInvoices,
      deliveryNotes: invoice.deliveryNotes || void 0,
      milestoneDescription: invoice.milestoneDescription || void 0,
      subtotal: invoice.subtotal || "0",
      discount: invoice.discount || "0",
      cgst: invoice.cgst || "0",
      sgst: invoice.sgst || "0",
      igst: invoice.igst || "0",
      shippingCharges: invoice.shippingCharges || "0",
      total: invoice.total || "0",
      notes: invoice.notes || void 0,
      termsAndConditions: invoice.termsAndConditions || void 0,
      // Fix null vs undefined
      bomSection: invoice.bomSection || void 0,
      bankName,
      // Pass at top level too if required by service (it was in routes.ts)
      bankAccountNumber,
      bankAccountName,
      bankIfscCode,
      bankBranch,
      bankSwiftCode
    }, res);
    await storage.createActivityLog({
      userId: req.user.id,
      action: "export_pdf",
      entityType: "invoice",
      entityId: invoice.id
    });
  } catch (error) {
    logger.error("Generate invoice PDF error:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});
router6.post("/:id/email", authMiddleware, requireFeature("invoices_emailSending"), requirePermission("invoices", "view"), async (req, res) => {
  try {
    const { recipientEmail, message } = req.body;
    if (!recipientEmail) {
      return res.status(400).json({ error: "Recipient email is required" });
    }
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    const quote = invoice.quoteId ? await storage.getQuote(invoice.quoteId) : null;
    const clientId = invoice.clientId || quote?.clientId;
    if (!clientId) {
      return res.status(404).json({ error: "No client associated with this invoice" });
    }
    const client = await storage.getClient(clientId);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    const items = await storage.getInvoiceItems(invoice.id);
    const creator = invoice.createdBy ? await storage.getUser(invoice.createdBy) : quote ? await storage.getUser(quote.createdBy) : void 0;
    const settings2 = await storage.getAllSettings();
    const companyName = settings2.find((s) => s.key === "company_companyName")?.value || "OPTIVALUE TEK";
    const addr = settings2.find((s) => s.key === "company_address")?.value || "";
    const city = settings2.find((s) => s.key === "company_city")?.value || "";
    const state = settings2.find((s) => s.key === "company_state")?.value || "";
    const zip = settings2.find((s) => s.key === "company_zipCode")?.value || "";
    const country = settings2.find((s) => s.key === "company_country")?.value || "";
    const companyAddress = [addr, city, state, zip, country].filter(Boolean).join(", ");
    const companyPhone = settings2.find((s) => s.key === "company_phone")?.value || "";
    const companyEmail = settings2.find((s) => s.key === "company_email")?.value || "";
    const companyWebsite = settings2.find((s) => s.key === "company_website")?.value || "";
    const companyGSTIN = settings2.find((s) => s.key === "company_gstin")?.value || "";
    const companyLogo = settings2.find((s) => s.key === "company_logo")?.value;
    const emailSubjectTemplate = settings2.find((s) => s.key === "email_invoice_subject")?.value || "Invoice {INVOICE_NUMBER} from {COMPANY_NAME}";
    const emailBodyTemplate = settings2.find((s) => s.key === "email_invoice_body")?.value || "Dear {CLIENT_NAME},\\n\\nPlease find attached invoice {INVOICE_NUMBER}.\\n\\nAmount Due: {TOTAL}\\nDue Date: {DUE_DATE}\\n\\nPayment Details:\\n{BANK_DETAILS}\\n\\nBest regards,\\n{COMPANY_NAME}";
    const bankName = settings2.find((s) => s.key === "bank_bankName")?.value || "";
    const bankAccountNumber = settings2.find((s) => s.key === "bank_accountNumber")?.value || "";
    const bankAccountName = settings2.find((s) => s.key === "bank_accountName")?.value || "";
    const bankIfscCode = settings2.find((s) => s.key === "bank_ifscCode")?.value || "";
    const bankDetailsForEmail = bankName ? `Bank: ${bankName}\\nAccount: ${bankAccountName}\\nAccount Number: ${bankAccountNumber}\\nIFSC: ${bankIfscCode}` : "Contact us for payment details";
    const variables = {
      "{COMPANY_NAME}": companyName,
      "{CLIENT_NAME}": client.name,
      "{INVOICE_NUMBER}": invoice.invoiceNumber,
      "{TOTAL}": `\u20B9${Number(invoice.total).toLocaleString()}`,
      "{OUTSTANDING}": `\u20B9${(Number(invoice.total) - Number(invoice.paidAmount)).toLocaleString()}`,
      "{DUE_DATE}": invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : (/* @__PURE__ */ new Date()).toLocaleDateString(),
      "{BANK_DETAILS}": bankDetailsForEmail
    };
    let emailSubject = emailSubjectTemplate;
    let emailBody = emailBodyTemplate;
    Object.entries(variables).forEach(([key, value]) => {
      const escapedKey = key.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&");
      emailSubject = emailSubject.replace(new RegExp(escapedKey, "g"), value);
      emailBody = emailBody.replace(new RegExp(escapedKey, "g"), value);
    });
    if (message) {
      emailBody = `${emailBody}\\n\\n---\\nAdditional Note:\\n${message}`;
    }
    emailBody = emailBody.replace(/\\\\n/g, "\n").replace(/\\n/g, "\n");
    emailBody = emailBody.replace(/\n/g, "<br>");
    const { PassThrough } = await import("stream");
    const pdfStream = new PassThrough();
    const pdfPromise = InvoicePDFService.generateInvoicePDF({
      quote: quote || {},
      client,
      items,
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      companyWebsite,
      companyGSTIN,
      preparedBy: creator?.name,
      companyLogo,
      userEmail: req.user?.email,
      companyDetails: {
        name: companyName,
        address: companyAddress,
        phone: companyPhone,
        email: companyEmail,
        website: companyWebsite,
        gstin: companyGSTIN
      },
      invoiceNumber: invoice.invoiceNumber,
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : /* @__PURE__ */ new Date(),
      paidAmount: invoice.paidAmount || "0",
      paymentStatus: invoice.paymentStatus || "pending",
      // Add missing invoice fields
      isMaster: invoice.isMaster,
      masterInvoiceStatus: invoice.masterInvoiceStatus || void 0,
      deliveryNotes: invoice.deliveryNotes || void 0,
      milestoneDescription: invoice.milestoneDescription || void 0,
      // Use invoice totals (not quote totals)
      subtotal: invoice.subtotal || "0",
      discount: invoice.discount || "0",
      cgst: invoice.cgst || "0",
      sgst: invoice.sgst || "0",
      igst: invoice.igst || "0",
      shippingCharges: invoice.shippingCharges || "0",
      total: invoice.total || "0",
      notes: invoice.notes || void 0,
      termsAndConditions: invoice.termsAndConditions,
      // Bank details from settings
      bankName: bankName || void 0,
      bankAccountNumber: bankAccountNumber || void 0,
      bankAccountName: bankAccountName || void 0,
      bankIfscCode: bankIfscCode || void 0,
      bankBranch: settings2.find((s) => s.key === "bank_branch")?.value || void 0,
      bankSwiftCode: settings2.find((s) => s.key === "bank_swiftCode")?.value || void 0
    }, pdfStream);
    const chunks = [];
    pdfStream.on("data", (chunk) => chunks.push(chunk));
    await new Promise((resolve, reject) => {
      pdfStream.on("end", resolve);
      pdfStream.on("error", reject);
    });
    await pdfPromise;
    const pdfBuffer = Buffer.concat(chunks);
    await EmailService.sendInvoiceEmail(
      recipientEmail,
      emailSubject,
      emailBody,
      pdfBuffer
    );
    await storage.createActivityLog({
      userId: req.user.id,
      action: "email_invoice",
      entityType: "invoice",
      entityId: invoice.id
    });
    return res.json({ success: true, message: "Invoice sent successfully" });
  } catch (error) {
    logger.error("Email invoice error:", error);
    return res.status(500).json({ error: error.message || "Failed to send invoice email" });
  }
});
router6.post("/:id/payment-reminder", authMiddleware, requireFeature("invoices_paymentReminders"), requirePermission("invoices", "view"), async (req, res) => {
  try {
    const { recipientEmail, message } = req.body;
    if (!recipientEmail) {
      return res.status(400).json({ error: "Recipient email is required" });
    }
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    const quote = invoice.quoteId ? await storage.getQuote(invoice.quoteId) : null;
    const clientId = invoice.clientId || quote?.clientId;
    if (!clientId) {
      return res.status(404).json({ error: "No client associated with this invoice" });
    }
    const client = await storage.getClient(clientId);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    const settings2 = await storage.getAllSettings();
    const companyName = settings2.find((s) => s.key === "company_name")?.value || "OPTIVALUE TEK";
    const emailSubjectTemplate = settings2.find((s) => s.key === "email_payment_reminder_subject")?.value || "Payment Reminder: Invoice {INVOICE_NUMBER}";
    const emailBodyTemplate = settings2.find((s) => s.key === "email_payment_reminder_body")?.value || "Dear {CLIENT_NAME},\\n\\nThis is a friendly reminder that invoice {INVOICE_NUMBER} is due for payment.\\n\\nAmount Due: {OUTSTANDING}\\nDue Date: {DUE_DATE}\\nDays Overdue: {DAYS_OVERDUE}\\n\\nPlease arrange payment at your earliest convenience.\\n\\nBest regards,\\n{COMPANY_NAME}";
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : /* @__PURE__ */ new Date();
    const today = /* @__PURE__ */ new Date();
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1e3 * 60 * 60 * 24));
    const daysOverdueText = daysOverdue > 0 ? `${daysOverdue} days` : "Not overdue";
    const outstanding = Number(invoice.total) - Number(invoice.paidAmount);
    const variables = {
      "{COMPANY_NAME}": companyName,
      "{CLIENT_NAME}": client.name,
      "{INVOICE_NUMBER}": invoice.invoiceNumber,
      "{OUTSTANDING}": `\u20B9${outstanding.toLocaleString()}`,
      "{TOTAL}": `\u20B9${Number(invoice.total).toLocaleString()}`,
      "{DUE_DATE}": dueDate.toLocaleDateString(),
      "{DAYS_OVERDUE}": daysOverdueText
    };
    let emailSubject = emailSubjectTemplate;
    let emailBody = emailBodyTemplate;
    Object.entries(variables).forEach(([key, value]) => {
      const escapedKey = key.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&");
      emailSubject = emailSubject.replace(new RegExp(escapedKey, "g"), value);
      emailBody = emailBody.replace(new RegExp(escapedKey, "g"), value);
    });
    if (message) {
      emailBody = `${emailBody}\\n\\n---\\nAdditional Note:\\n${message}`;
    }
    emailBody = emailBody.replace(/\\\\n/g, "\n").replace(/\\n/g, "\n");
    emailBody = emailBody.replace(/\n/g, "<br>");
    await EmailService.sendPaymentReminderEmail(
      recipientEmail,
      emailSubject,
      emailBody
    );
    await storage.createActivityLog({
      userId: req.user.id,
      action: "send_payment_reminder",
      entityType: "invoice",
      entityId: invoice.id
    });
    return res.json({ success: true, message: "Payment reminder sent successfully" });
  } catch (error) {
    logger.error("Payment reminder error:", error);
    return res.status(500).json({ error: error.message || "Failed to send payment reminder" });
  }
});
router6.patch("/:id/items/:itemId/serials", authMiddleware, requireFeature("serialNumber_tracking"), requirePermission("serial_numbers", "edit"), async (req, res) => {
  try {
    const { serialNumbers: serialNumbers2 } = req.body;
    logger.info(`Updating serial numbers for item ${req.params.itemId} in invoice ${req.params.id}`);
    logger.info(`Serial numbers count: ${serialNumbers2?.length || 0}`);
    const invoiceItem = await storage.getInvoiceItem(req.params.itemId);
    if (!invoiceItem) {
      return res.status(404).json({ error: "Invoice item not found" });
    }
    const updated = await storage.updateInvoiceItem(req.params.itemId, {
      serialNumbers: JSON.stringify(serialNumbers2),
      fulfilledQuantity: serialNumbers2.length,
      status: serialNumbers2.length > 0 ? "fulfilled" : "pending"
    });
    if (!updated) {
      return res.status(404).json({ error: "Item not found" });
    }
    const invoice = await storage.getInvoice(req.params.id);
    if (invoice && invoice.parentInvoiceId) {
      logger.info(`This is a child invoice. Parent: ${invoice.parentInvoiceId}`);
      logger.info(`Syncing with master invoice...`);
      const masterItems = await storage.getInvoiceItems(invoice.parentInvoiceId);
      const masterItem = masterItems.find(
        (mi) => mi.description === invoiceItem.description && Number(mi.unitPrice) === Number(invoiceItem.unitPrice)
      );
      if (masterItem) {
        logger.info(`Found master item: ${masterItem.description} (ID: ${masterItem.id})`);
        const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId || "");
        const childInvoices = allInvoices.filter((inv) => inv.parentInvoiceId === invoice.parentInvoiceId);
        const allChildSerialNumbers = [];
        for (const childInvoice of childInvoices) {
          const childItems = await storage.getInvoiceItems(childInvoice.id);
          const matchingChildItem = childItems.find(
            (ci) => ci.description === masterItem.description && Number(ci.unitPrice) === Number(masterItem.unitPrice)
          );
          if (matchingChildItem && matchingChildItem.serialNumbers) {
            try {
              const serials = JSON.parse(matchingChildItem.serialNumbers);
              allChildSerialNumbers.push(...serials);
            } catch (e) {
              logger.error("Error parsing serial numbers:", e);
            }
          }
        }
        await storage.updateInvoiceItem(masterItem.id, {
          serialNumbers: allChildSerialNumbers.length > 0 ? JSON.stringify(allChildSerialNumbers) : null,
          status: masterItem.fulfilledQuantity >= masterItem.quantity ? "fulfilled" : "pending"
        });
      }
    }
    res.json(updated);
  } catch (error) {
    logger.error("Error updating serial numbers:", error);
    res.status(500).json({ error: "Failed to update serial numbers" });
  }
});
router6.post("/:id/items/:itemId/serials/validate", authMiddleware, requireFeature("serialNumber_tracking"), requirePermission("serial_numbers", "view"), async (req, res) => {
  try {
    const { validateSerialNumbers: validateSerialNumbers2 } = await Promise.resolve().then(() => (init_serial_number_service(), serial_number_service_exports));
    const { serials, expectedQuantity } = req.body;
    const { id: invoiceId, itemId } = req.params;
    if (!serials || !Array.isArray(serials)) {
      return res.status(400).json({ error: "Invalid serials array" });
    }
    if (typeof expectedQuantity !== "number") {
      return res.status(400).json({ error: "Expected quantity must be a number" });
    }
    const validation = await validateSerialNumbers2(
      invoiceId,
      itemId,
      serials,
      expectedQuantity,
      {
        checkInvoiceScope: true,
        checkQuoteScope: true,
        checkSystemWide: true
      }
    );
    return res.json(validation);
  } catch (error) {
    logger.error("Error validating serial numbers:", error);
    return res.status(500).json({ error: error.message || "Failed to validate serial numbers" });
  }
});
router6.get("/:id/serials/permissions", authMiddleware, requireFeature("serialNumber_tracking"), async (req, res) => {
  try {
    const { canEditSerialNumbers: canEditSerialNumbers2 } = await Promise.resolve().then(() => (init_serial_number_service(), serial_number_service_exports));
    const { id: invoiceId } = req.params;
    const permissions = await canEditSerialNumbers2(req.user.id, invoiceId);
    return res.json(permissions);
  } catch (error) {
    logger.error("Error checking serial edit permissions:", error);
    return res.status(500).json({ error: error.message || "Failed to check permissions" });
  }
});
var invoices_routes_default = router6;

// server/routes/payments.routes.ts
init_storage();
import { Router as Router7 } from "express";
init_logger();
init_db();
init_schema();
import { eq as eq8 } from "drizzle-orm";
var router7 = Router7();
router7.put("/invoices/:id/payment-status", authMiddleware, requireFeature("payments_create"), requirePermission("payments", "create"), async (req, res) => {
  try {
    const { paymentStatus, paidAmount } = req.body;
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    const quote = await storage.getQuote(invoice.quoteId || "");
    if (!quote) {
      return res.status(404).json({ error: "Related quote not found" });
    }
    const updateData = {};
    if (paymentStatus !== void 0) {
      updateData.paymentStatus = paymentStatus;
    }
    if (paidAmount !== void 0) {
      const numPaidAmount = Number(paidAmount);
      const totalAmount = invoice.total ? Number(invoice.total) : Number(quote.total);
      if (numPaidAmount < 0 || numPaidAmount > totalAmount) {
        return res.status(400).json({ error: "Invalid paid amount" });
      }
      updateData.paidAmount = String(numPaidAmount);
      if (paymentStatus === void 0) {
        if (numPaidAmount >= totalAmount) {
          updateData.paymentStatus = "paid";
        } else if (numPaidAmount > 0) {
          updateData.paymentStatus = "partial";
        } else {
          updateData.paymentStatus = "pending";
        }
      }
    }
    const updatedInvoice = await storage.updateInvoice(req.params.id, updateData);
    if (invoice.parentInvoiceId) {
      const masterInvoice = await storage.getInvoice(invoice.parentInvoiceId);
      if (masterInvoice) {
        const allInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId || "");
        const childInvoices = allInvoices.filter((inv) => inv.parentInvoiceId === masterInvoice.id);
        const totalChildPaidAmount = childInvoices.reduce((sum, child) => {
          const childPaid = child.id === invoice.id ? Number(updateData.paidAmount || 0) : Number(child.paidAmount || 0);
          return sum + childPaid;
        }, 0);
        const masterDirectPayments = await storage.getPaymentHistory(masterInvoice.id);
        const masterDirectTotal = masterDirectPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const finalMasterPaidAmount = totalChildPaidAmount + masterDirectTotal;
        const masterTotal = Number(masterInvoice.total);
        let masterPaymentStatus = "pending";
        if (finalMasterPaidAmount >= masterTotal) {
          masterPaymentStatus = "paid";
        } else if (finalMasterPaidAmount > 0) {
          masterPaymentStatus = "partial";
        }
        await storage.updateInvoice(masterInvoice.id, {
          paidAmount: String(finalMasterPaidAmount),
          paymentStatus: masterPaymentStatus
        });
        if (masterPaymentStatus === "paid") {
          const quote2 = await storage.getQuote(masterInvoice.quoteId || "");
          if (quote2 && quote2.status === "invoiced") {
            await storage.updateQuote(quote2.id, {
              status: "closed_paid",
              closedAt: /* @__PURE__ */ new Date(),
              closedBy: req.user.id,
              closureNotes: "Auto-closed: All invoices fully paid"
            });
            await storage.createActivityLog({
              userId: req.user.id,
              action: "close_quote",
              entityType: "quote",
              entityId: quote2.id
            });
          }
        }
      }
    } else if (updatedInvoice?.paymentStatus === "paid") {
      const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId || "");
      const allPaid = allInvoices.every((inv) => inv.paymentStatus === "paid");
      if (allPaid) {
        const quote2 = await storage.getQuote(invoice.quoteId || "");
        if (quote2 && quote2.status === "invoiced") {
          await storage.updateQuote(quote2.id, {
            status: "closed_paid",
            closedAt: /* @__PURE__ */ new Date(),
            closedBy: req.user.id,
            closureNotes: "Auto-closed: All invoices fully paid"
          });
          await storage.createActivityLog({
            userId: req.user.id,
            action: "close_quote",
            entityType: "quote",
            entityId: quote2.id
          });
        }
      }
    }
    await storage.createActivityLog({
      userId: req.user.id,
      action: "update_payment_status",
      entityType: "invoice",
      entityId: invoice.id
    });
    return res.json(updatedInvoice);
  } catch (error) {
    logger.error("Update payment status error:", error);
    return res.status(500).json({ error: error.message || "Failed to update payment status" });
  }
});
router7.post("/invoices/:id/payment", authMiddleware, requireFeature("payments_create"), requirePermission("payments", "create"), async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId, notes, paymentDate } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid payment amount is required" });
    }
    if (!paymentMethod) {
      return res.status(400).json({ error: "Payment method is required" });
    }
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    const quote = await storage.getQuote(invoice.quoteId || "");
    if (!quote) {
      return res.status(404).json({ error: "Related quote not found" });
    }
    const result = await db.transaction(async (tx) => {
      const [paymentRecord] = await tx.insert(paymentHistory).values({
        invoiceId: req.params.id,
        amount: String(amount),
        paymentMethod,
        transactionId: transactionId || null,
        notes: notes || null,
        paymentDate: paymentDate ? new Date(paymentDate) : /* @__PURE__ */ new Date(),
        recordedBy: req.user.id
      }).returning();
      const newPaidAmount = add(invoice.paidAmount, amount);
      const totalAmount = toDecimal(invoice.total || quote.total);
      console.log(`[DEBUG_PAYMENT] paidAmount=${invoice.paidAmount}, amount=${amount}, newPaid=${newPaidAmount.toString()}, total=${totalAmount.toString()}`);
      if (moneyGt(newPaidAmount, totalAmount)) {
        console.log(`[DEBUG_PAYMENT] FAIL: newPaid > total`);
        throw new Error("Payment amount exceeds total invoice amount");
      }
      const newRemainingAmount = subtract(totalAmount, newPaidAmount);
      let newPaymentStatus = invoice.paymentStatus || "pending";
      if (moneyGte(newPaidAmount, totalAmount)) {
        newPaymentStatus = "paid";
      } else if (moneyGt(newPaidAmount, 0)) {
        newPaymentStatus = "partial";
      }
      const [updatedInvoice] = await tx.update(invoices).set({
        paidAmount: toMoneyString(newPaidAmount),
        remainingAmount: toMoneyString(newRemainingAmount),
        paymentStatus: newPaymentStatus,
        lastPaymentDate: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq8(invoices.id, req.params.id)).returning();
      if (invoice.parentInvoiceId) {
        const [masterInvoice] = await tx.select().from(invoices).where(eq8(invoices.id, invoice.parentInvoiceId));
        if (masterInvoice) {
          const childInvoices = await tx.select().from(invoices).where(eq8(invoices.parentInvoiceId, masterInvoice.id));
          let totalChildPaidAmount = toDecimal(0);
          for (const child of childInvoices) {
            const childPaid = child.id === invoice.id ? newPaidAmount : toDecimal(child.paidAmount);
            totalChildPaidAmount = totalChildPaidAmount.plus(childPaid);
          }
          const masterDirectPayments = await tx.select().from(paymentHistory).where(eq8(paymentHistory.invoiceId, masterInvoice.id));
          let totalMasterDirect = toDecimal(0);
          for (const p of masterDirectPayments) {
            totalMasterDirect = totalMasterDirect.plus(toDecimal(p.amount));
          }
          const finalMasterPaidAmount = totalChildPaidAmount.plus(totalMasterDirect);
          const masterTotal = toDecimal(masterInvoice.total);
          let masterPaymentStatus = "pending";
          if (moneyGte(finalMasterPaidAmount, masterTotal)) {
            masterPaymentStatus = "paid";
          } else if (moneyGt(finalMasterPaidAmount, 0)) {
            masterPaymentStatus = "partial";
          }
          await tx.update(invoices).set({
            paidAmount: toMoneyString(finalMasterPaidAmount),
            paymentStatus: masterPaymentStatus,
            lastPaymentDate: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq8(invoices.id, masterInvoice.id));
        }
      }
      await tx.insert(activityLogs).values({
        userId: req.user.id,
        action: "record_payment",
        entityType: "invoice",
        entityId: invoice.id,
        timestamp: /* @__PURE__ */ new Date()
      });
      if (invoice.quoteId) {
        const [currentQuote] = await tx.select().from(quotes).where(eq8(quotes.id, invoice.quoteId));
        if (currentQuote && currentQuote.status === "invoiced") {
          const allInvoicesForQuote = await tx.select().from(invoices).where(eq8(invoices.quoteId, invoice.quoteId));
          const relevantInvoices = allInvoicesForQuote.filter((inv) => !inv.parentInvoiceId);
          const allPaid = relevantInvoices.every((inv) => inv.paymentStatus === "paid");
          if (allPaid && relevantInvoices.length > 0) {
            await tx.update(quotes).set({
              status: "closed_paid",
              closedAt: /* @__PURE__ */ new Date(),
              closedBy: req.user.id,
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq8(quotes.id, invoice.quoteId));
            await tx.insert(activityLogs).values({
              userId: req.user.id,
              action: "close_quote",
              entityType: "quote",
              entityId: currentQuote.id,
              timestamp: /* @__PURE__ */ new Date()
            });
          }
        }
      }
      return updatedInvoice;
    });
    return res.json(result);
  } catch (error) {
    logger.error("Record payment error:", error);
    return res.status(500).json({ error: error.message || "Failed to record payment" });
  }
});
router7.get("/invoices/:id/payment-history-detailed", authMiddleware, requireFeature("payments_module"), async (req, res) => {
  try {
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    logger.info(`[Payment History] Fetching for invoice ${req.params.id}, isMaster: ${invoice.isMaster}`);
    let payments;
    if (invoice.isMaster) {
      let childInvoices = [];
      if (invoice.quoteId) {
        const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId || "");
        childInvoices = allInvoices.filter((inv) => inv.parentInvoiceId === invoice.id);
      } else if (invoice.salesOrderId) {
        const allInvoices = await storage.getInvoicesBySalesOrder(invoice.salesOrderId);
        childInvoices = allInvoices.filter((inv) => inv.parentInvoiceId === invoice.id);
      }
      logger.info(`[Payment History] Found ${childInvoices.length} child invoices:`, childInvoices.map((c) => c.id));
      const childPayments = await Promise.all(
        childInvoices.map((child) => storage.getPaymentHistory(child.id))
      );
      const masterDirectPayments = await storage.getPaymentHistory(invoice.id);
      payments = [...masterDirectPayments, ...childPayments.flat()].sort(
        (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      );
      logger.info(`[Payment History] Aggregated ${payments.length} payments from children and master directly`);
    } else {
      payments = await storage.getPaymentHistory(req.params.id);
      logger.info(`[Payment History] Regular/child invoice, found ${payments.length} payments`);
    }
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        const user = await storage.getUser(payment.recordedBy);
        return {
          ...payment,
          recordedByName: user?.name || "Unknown"
        };
      })
    );
    logger.info(`[Payment History] Returning ${enrichedPayments.length} enriched payments`);
    return res.json(enrichedPayments);
  } catch (error) {
    logger.error("Fetch payment history error:", error);
    return res.status(500).json({ error: "Failed to fetch payment history" });
  }
});
router7.get("/invoices/:id/payment-history", authMiddleware, requireFeature("payments_module"), async (req, res) => {
  try {
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    const history = [];
    if (invoice.paymentNotes) {
      const entries = invoice.paymentNotes.split("\n").filter((e) => e.trim());
      for (const entry of entries) {
        const match = entry.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z): (.+)$/);
        if (match) {
          history.push({
            date: match[1],
            note: match[2]
          });
        }
      }
    }
    return res.json({
      invoiceId: invoice.id,
      paidAmount: invoice.paidAmount,
      lastPaymentDate: invoice.lastPaymentDate,
      history
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch payment history" });
  }
});
router7.delete("/payment-history/:id", authMiddleware, requireFeature("payments_delete"), async (req, res) => {
  try {
    const payment = await storage.getPaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: "Payment record not found" });
    }
    const invoice = await storage.getInvoice(payment.invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    const quote = await storage.getQuote(invoice.quoteId || "");
    if (!quote) {
      return res.status(404).json({ error: "Related quote not found" });
    }
    await storage.deletePaymentHistory(req.params.id);
    const allPayments = await storage.getPaymentHistory(payment.invoiceId);
    let newPaidAmount = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    if (invoice.isMaster) {
      let childInvoices = [];
      if (invoice.quoteId) {
        const allInv = await storage.getInvoicesByQuote(invoice.quoteId);
        childInvoices = allInv.filter((inv) => inv.parentInvoiceId === invoice.id);
      } else if (invoice.salesOrderId) {
        const allInv = await storage.getInvoicesBySalesOrder(invoice.salesOrderId);
        childInvoices = allInv.filter((inv) => inv.parentInvoiceId === invoice.id);
      }
      const childTotal = childInvoices.reduce((sum, c) => sum + Number(c.paidAmount || 0), 0);
      newPaidAmount += childTotal;
    }
    const totalAmount = Number(invoice.total || quote.total);
    let newPaymentStatus = "pending";
    if (newPaidAmount >= totalAmount) {
      newPaymentStatus = "paid";
    } else if (newPaidAmount > 0) {
      newPaymentStatus = "partial";
    }
    const lastPayment = allPayments[0];
    await storage.updateInvoice(payment.invoiceId, {
      paidAmount: String(newPaidAmount),
      paymentStatus: newPaymentStatus,
      lastPaymentDate: lastPayment?.paymentDate || null
    });
    if (invoice.parentInvoiceId) {
      const masterInvoice = await storage.getInvoice(invoice.parentInvoiceId);
      if (masterInvoice) {
        const allInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId || "");
        const childInvoices = allInvoices.filter((inv) => inv.parentInvoiceId === masterInvoice.id);
        const totalChildPaidAmount = childInvoices.reduce((sum, child) => {
          const childPaid = child.id === invoice.id ? newPaidAmount : Number(child.paidAmount || 0);
          return sum + childPaid;
        }, 0);
        const masterDirectPayments = await storage.getPaymentHistory(masterInvoice.id);
        const masterDirectTotal = masterDirectPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const finalMasterPaidAmount = totalChildPaidAmount + masterDirectTotal;
        const masterTotal = Number(masterInvoice.total);
        let masterPaymentStatus = "pending";
        if (finalMasterPaidAmount >= masterTotal) {
          masterPaymentStatus = "paid";
        } else if (finalMasterPaidAmount > 0) {
          masterPaymentStatus = "partial";
        }
        await storage.updateInvoice(masterInvoice.id, {
          paidAmount: String(finalMasterPaidAmount),
          paymentStatus: masterPaymentStatus,
          lastPaymentDate: finalMasterPaidAmount > 0 ? /* @__PURE__ */ new Date() : null
        });
      }
    }
    await storage.createActivityLog({
      userId: req.user.id,
      action: "delete_payment",
      entityType: "invoice",
      entityId: invoice.id
    });
    return res.json({ success: true });
  } catch (error) {
    logger.error("Delete payment error:", error);
    return res.status(500).json({ error: error.message || "Failed to delete payment" });
  }
});
var payments_routes_default = router7;

// server/routes/products.routes.ts
import { Router as Router8 } from "express";
init_logger();
init_db();
init_schema();
import { eq as eq9 } from "drizzle-orm";
init_feature_flags();
var router8 = Router8();
router8.get("/", authMiddleware, requireFeature("products_module"), requirePermission("products", "view"), async (req, res) => {
  try {
    const products2 = await db.select().from(products).orderBy(products.name);
    res.json(products2);
  } catch (error) {
    logger.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});
router8.get("/:id", authMiddleware, requireFeature("products_module"), requirePermission("products", "view"), async (req, res) => {
  try {
    const [product] = await db.select().from(products).where(eq9(products.id, req.params.id));
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    logger.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});
router8.post("/", authMiddleware, requireFeature("products_create"), requirePermission("products", "create"), async (req, res) => {
  try {
    if (req.body && typeof req.body.unitPrice === "number") {
      req.body.unitPrice = String(req.body.unitPrice);
    }
    if (!isFeatureEnabled("products_sku") && req.body.sku) {
      return res.status(403).json({ error: "SKU feature is disabled" });
    }
    if (!isFeatureEnabled("products_stock_tracking") && (req.body.stockQuantity || req.body.minStockLevel)) {
      delete req.body.stockQuantity;
      delete req.body.minStockLevel;
    }
    if (!isFeatureEnabled("products_pricing") && req.body.unitPrice) {
      delete req.body.unitPrice;
    }
    const parseResult = insertProductSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors });
    }
    const validatedData = parseResult.data;
    const stockQuantity = validatedData.stockQuantity || 0;
    const initialAvailable = validatedData.availableQuantity !== void 0 ? validatedData.availableQuantity : stockQuantity;
    const [product] = await db.insert(products).values({
      ...validatedData,
      stockQuantity,
      availableQuantity: initialAvailable,
      createdBy: req.user.id
    }).returning();
    res.json(product);
  } catch (error) {
    logger.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});
router8.patch("/:id", authMiddleware, requireFeature("products_edit"), requirePermission("products", "edit"), async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: /* @__PURE__ */ new Date() };
    if (!isFeatureEnabled("products_sku") && updates.sku) delete updates.sku;
    if (!isFeatureEnabled("products_stock_tracking")) {
      delete updates.stockQuantity;
      delete updates.availableQuantity;
      delete updates.minStockLevel;
    }
    const [updated] = await db.update(products).set(updates).where(eq9(products.id, req.params.id)).returning();
    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(updated);
  } catch (error) {
    logger.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});
var products_routes_default = router8;

// server/routes/vendors.routes.ts
import { Router as Router9 } from "express";
init_logger();
init_storage();
init_db();
init_schema();
init_numbering_service();
init_feature_flags();
import { eq as eq10, sql as sql9, desc as desc3 } from "drizzle-orm";
var router9 = Router9();
router9.get("/vendors", authMiddleware, requireFeature("vendors_module"), async (req, res) => {
  try {
    const vendors2 = await storage.getAllVendors();
    res.json(vendors2);
  } catch (error) {
    logger.error("Error fetching vendors:", error);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});
router9.get("/vendors/:id", authMiddleware, requireFeature("vendors_module"), async (req, res) => {
  try {
    const vendor = await storage.getVendor(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.json(vendor);
  } catch (error) {
    logger.error("Error fetching vendor:", error);
    res.status(500).json({ error: "Failed to fetch vendor" });
  }
});
router9.post("/vendors", authMiddleware, requireFeature("vendors_create"), requirePermission("vendors", "create"), async (req, res) => {
  try {
    const vendor = await storage.createVendor({
      ...req.body,
      createdBy: req.user.id
    });
    res.json(vendor);
  } catch (error) {
    logger.error("Error creating vendor:", error);
    res.status(500).json({ error: "Failed to create vendor" });
  }
});
router9.patch("/vendors/:id", authMiddleware, requireFeature("vendors_edit"), requirePermission("vendors", "edit"), async (req, res) => {
  try {
    const updated = await storage.updateVendor(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.json(updated);
  } catch (error) {
    logger.error("Error updating vendor:", error);
    res.status(500).json({ error: "Failed to update vendor" });
  }
});
router9.delete("/vendors/:id", authMiddleware, requireFeature("vendors_delete"), requirePermission("vendors", "delete"), async (req, res) => {
  try {
    await storage.deleteVendor(req.params.id);
    res.json({ success: true });
  } catch (error) {
    logger.error("Error deleting vendor:", error);
    res.status(500).json({ error: "Failed to delete vendor" });
  }
});
router9.get("/vendor-pos", authMiddleware, requireFeature("vendorPO_module"), async (req, res) => {
  try {
    const quoteId = req.query.quoteId;
    let pos;
    if (quoteId) {
      pos = await storage.getVendorPosByQuote(quoteId);
    } else {
      pos = await storage.getAllVendorPos();
    }
    const enrichedPos = await Promise.all(
      pos.map(async (po) => {
        const vendor = await storage.getVendor(po.vendorId);
        const quote = po.quoteId ? await storage.getQuote(po.quoteId) : null;
        return {
          ...po,
          vendorName: vendor?.name || "Unknown",
          quoteNumber: quote?.quoteNumber || "N/A",
          quoteCurrency: quote?.currency
        };
      })
    );
    res.json(enrichedPos);
  } catch (error) {
    logger.error("Error fetching vendor POs:", error);
    res.status(500).json({ error: "Failed to fetch vendor POs" });
  }
});
router9.get("/vendor-pos/:id", authMiddleware, requireFeature("vendorPO_module"), async (req, res) => {
  try {
    const po = await storage.getVendorPo(req.params.id);
    if (!po) {
      return res.status(404).json({ error: "Vendor PO not found" });
    }
    const vendor = await storage.getVendor(po.vendorId);
    const quote = po.quoteId ? await storage.getQuote(po.quoteId) : null;
    const items = await storage.getVendorPoItems(po.id);
    res.json({
      ...po,
      vendor: vendor || {},
      quote: quote ? { id: quote.id, quoteNumber: quote.quoteNumber, currency: quote.currency } : void 0,
      items
    });
  } catch (error) {
    logger.error("Error fetching vendor PO:", error);
    res.status(500).json({ error: "Failed to fetch vendor PO" });
  }
});
router9.post("/quotes/:id/create-vendor-po", authMiddleware, requireFeature("vendorPO_create"), requirePermission("vendor_pos", "create"), async (req, res) => {
  try {
    const quote = await storage.getQuote(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }
    const quoteItems2 = await storage.getQuoteItems(quote.id);
    const poNumber = await NumberingService.generateVendorPoNumber();
    const po = await storage.createVendorPo({
      poNumber,
      quoteId: quote.id,
      vendorId: req.body.vendorId,
      status: "draft",
      orderDate: /* @__PURE__ */ new Date(),
      expectedDeliveryDate: req.body.expectedDeliveryDate ? new Date(req.body.expectedDeliveryDate) : null,
      subtotal: quote.subtotal,
      discount: quote.discount,
      cgst: quote.cgst,
      sgst: quote.sgst,
      igst: quote.igst,
      shippingCharges: quote.shippingCharges,
      total: quote.total,
      notes: req.body.notes || null,
      termsAndConditions: quote.termsAndConditions,
      createdBy: req.user.id
    });
    for (const item of quoteItems2) {
      await storage.createVendorPoItem({
        vendorPoId: po.id,
        productId: item.productId || null,
        description: item.description,
        quantity: item.quantity,
        receivedQuantity: 0,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        sortOrder: item.sortOrder
      });
    }
    res.json(po);
  } catch (error) {
    logger.error("Error creating vendor PO:", error);
    res.status(500).json({ error: "Failed to create vendor PO" });
  }
});
router9.post("/vendor-pos", authMiddleware, requireFeature("vendorPO_create"), requirePermission("vendor_pos", "create"), async (req, res) => {
  try {
    const {
      vendorId,
      expectedDeliveryDate,
      items,
      subtotal,
      discount,
      cgst,
      sgst,
      igst,
      shippingCharges,
      total,
      notes,
      termsAndConditions
    } = req.body;
    if (!vendorId) {
      return res.status(400).json({ error: "Vendor ID is required" });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "At least one item is required" });
    }
    const poNumber = await NumberingService.generateVendorPoNumber();
    const po = await storage.createVendorPo({
      poNumber,
      quoteId: null,
      // Standalone PO
      vendorId,
      status: "draft",
      orderDate: /* @__PURE__ */ new Date(),
      expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
      subtotal: subtotal.toString(),
      discount: discount.toString(),
      cgst: cgst.toString(),
      sgst: sgst.toString(),
      igst: igst.toString(),
      shippingCharges: shippingCharges.toString(),
      total: total.toString(),
      notes: notes || null,
      termsAndConditions: termsAndConditions || null,
      createdBy: req.user.id
    });
    let sortOrder = 0;
    for (const item of items) {
      await storage.createVendorPoItem({
        vendorPoId: po.id,
        productId: item.productId || null,
        description: item.description,
        quantity: item.quantity,
        receivedQuantity: 0,
        unitPrice: item.unitPrice.toString(),
        subtotal: item.subtotal.toString(),
        sortOrder: sortOrder++
      });
    }
    await storage.createActivityLog({
      userId: req.user.id,
      action: "create_vendor_po",
      entityType: "vendor_po",
      entityId: po.id
    });
    res.json(po);
  } catch (error) {
    logger.error("Error creating vendor PO:", error);
    res.status(500).json({ error: error.message || "Failed to create vendor PO" });
  }
});
router9.patch("/vendor-pos/:id", authMiddleware, requireFeature("vendorPO_edit"), async (req, res) => {
  try {
    const updated = await storage.updateVendorPo(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Vendor PO not found" });
    }
    res.json(updated);
  } catch (error) {
    logger.error("Error updating vendor PO:", error);
    res.status(500).json({ error: "Failed to update vendor PO" });
  }
});
router9.patch("/vendor-pos/:id/items/:itemId/serials", authMiddleware, requireFeature("vendorPO_edit"), async (req, res) => {
  try {
    const { serialNumbers: serialNumbers2 } = req.body;
    const updated = await storage.updateVendorPoItem(req.params.itemId, {
      serialNumbers: JSON.stringify(serialNumbers2),
      receivedQuantity: serialNumbers2.length
    });
    if (!updated) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(updated);
  } catch (error) {
    logger.error("Error updating serial numbers:", error);
    res.status(500).json({ error: "Failed to update serial numbers" });
  }
});
router9.get("/grns", authMiddleware, requireFeature("grn_module"), async (req, res) => {
  try {
    const grns = await db.select({
      id: goodsReceivedNotes.id,
      grnNumber: goodsReceivedNotes.grnNumber,
      vendorPoId: goodsReceivedNotes.vendorPoId,
      receivedDate: goodsReceivedNotes.receivedDate,
      quantityOrdered: goodsReceivedNotes.quantityOrdered,
      quantityReceived: goodsReceivedNotes.quantityReceived,
      quantityRejected: goodsReceivedNotes.quantityRejected,
      inspectionStatus: goodsReceivedNotes.inspectionStatus,
      deliveryNoteNumber: goodsReceivedNotes.deliveryNoteNumber,
      batchNumber: goodsReceivedNotes.batchNumber,
      poNumber: vendorPurchaseOrders.poNumber,
      vendorName: vendors.name
    }).from(goodsReceivedNotes).leftJoin(
      vendorPurchaseOrders,
      eq10(goodsReceivedNotes.vendorPoId, vendorPurchaseOrders.id)
    ).leftJoin(
      vendors,
      eq10(vendorPurchaseOrders.vendorId, vendors.id)
    ).orderBy(desc3(goodsReceivedNotes.receivedDate));
    res.json(grns);
  } catch (error) {
    logger.error("Error fetching GRNs:", error);
    res.status(500).json({ error: "Failed to fetch GRNs" });
  }
});
router9.get("/grns/:id", authMiddleware, requireFeature("grn_module"), async (req, res) => {
  try {
    const [grn] = await db.select().from(goodsReceivedNotes).where(eq10(goodsReceivedNotes.id, req.params.id));
    if (!grn) {
      return res.status(404).json({ error: "GRN not found" });
    }
    const [po] = await db.select().from(vendorPurchaseOrders).where(eq10(vendorPurchaseOrders.id, grn.vendorPoId));
    const [vendor] = await db.select().from(vendors).where(eq10(vendors.id, po.vendorId));
    const [poItem] = await db.select().from(vendorPoItems).where(eq10(vendorPoItems.id, grn.vendorPoItemId));
    let inspector = null;
    if (grn.inspectedBy) {
      [inspector] = await db.select({ id: users.id, name: users.name }).from(users).where(eq10(users.id, grn.inspectedBy));
    }
    res.json({
      ...grn,
      vendorPo: {
        id: po.id,
        poNumber: po.poNumber,
        currency: po.currency,
        vendor: {
          name: vendor.name,
          email: vendor.email,
          phone: vendor.phone
        }
      },
      vendorPoItem: poItem,
      inspectedBy: inspector
    });
  } catch (error) {
    logger.error("Error fetching GRN:", error);
    res.status(500).json({ error: "Failed to fetch GRN" });
  }
});
router9.post("/grns", authMiddleware, requireFeature("grn_create"), async (req, res) => {
  try {
    const {
      vendorPoId,
      vendorPoItemId,
      quantityOrdered,
      quantityReceived,
      quantityRejected,
      inspectionStatus,
      inspectionNotes,
      deliveryNoteNumber,
      batchNumber,
      serialNumbers: serialNumbers2
    } = req.body;
    const grnNumber = await NumberingService.generateGrnNumber();
    const [grn] = await db.insert(goodsReceivedNotes).values({
      grnNumber,
      vendorPoId,
      vendorPoItemId,
      quantityOrdered,
      quantityReceived,
      quantityRejected: quantityRejected || 0,
      inspectionStatus: inspectionStatus || "pending",
      inspectionNotes,
      deliveryNoteNumber,
      batchNumber,
      createdBy: req.user.id
    }).returning();
    const [poItem] = await db.select().from(vendorPoItems).where(eq10(vendorPoItems.id, vendorPoItemId));
    await db.update(vendorPoItems).set({
      receivedQuantity: (poItem.receivedQuantity || 0) + quantityReceived,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq10(vendorPoItems.id, vendorPoItemId));
    if (poItem.productId && isFeatureEnabled("products_stock_tracking")) {
      const quantityAccepted = quantityReceived - (quantityRejected || 0);
      if (quantityAccepted > 0) {
        await db.update(products).set({
          stockQuantity: sql9`${products.stockQuantity} + ${quantityAccepted}`,
          availableQuantity: sql9`${products.availableQuantity} + ${quantityAccepted}`,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq10(products.id, poItem.productId));
        logger.info(`[GRN] Updated product ${poItem.productId} stock: +${quantityAccepted}`);
      }
    } else if (poItem.productId && !isFeatureEnabled("products_stock_tracking")) {
      logger.info(`[GRN] Stock update skipped for product ${poItem.productId}: Stock tracking is disabled`);
    }
    if (serialNumbers2 && Array.isArray(serialNumbers2) && serialNumbers2.length > 0) {
      const serialRecords = serialNumbers2.map((sn) => ({
        serialNumber: sn,
        productId: poItem.productId || null,
        // Link serial to product
        vendorPoId,
        vendorPoItemId,
        grnId: grn.id,
        status: "in_stock",
        createdBy: req.user.id
      }));
      await db.insert(serialNumbers).values(serialRecords);
    }
    await storage.createActivityLog({
      userId: req.user.id,
      action: "create_grn",
      entityType: "grn",
      entityId: grn.id
    });
    res.json(grn);
  } catch (error) {
    logger.error("Error creating GRN:", error);
    res.status(500).json({ error: error.message || "Failed to create GRN" });
  }
});
router9.patch("/grns/:id", authMiddleware, requireFeature("grn_edit"), async (req, res) => {
  try {
    const {
      quantityReceived,
      quantityRejected,
      inspectionStatus,
      inspectionNotes,
      deliveryNoteNumber,
      batchNumber
    } = req.body;
    const [grn] = await db.update(goodsReceivedNotes).set({
      quantityReceived,
      quantityRejected: quantityRejected || 0,
      inspectionStatus,
      inspectedBy: req.user.id,
      inspectionNotes,
      deliveryNoteNumber,
      batchNumber,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq10(goodsReceivedNotes.id, req.params.id)).returning();
    if (!grn) {
      return res.status(404).json({ error: "GRN not found" });
    }
    await storage.createActivityLog({
      userId: req.user.id,
      action: "update_grn",
      entityType: "grn",
      entityId: grn.id
    });
    res.json(grn);
  } catch (error) {
    logger.error("Error updating GRN:", error);
    res.status(500).json({ error: error.message || "Failed to update GRN" });
  }
});
var vendors_routes_default = router9;

// server/routes/settings.routes.ts
import { Router as Router10 } from "express";
init_logger();
init_storage();
init_db();
init_schema();
init_numbering_service();
import { eq as eq11 } from "drizzle-orm";
var router10 = Router10();
router10.get("/settings", authMiddleware, requireFeature("admin_settings"), requirePermission("settings", "manage"), async (req, res) => {
  try {
    const settingsArray = await storage.getAllSettings();
    const settingsObject = settingsArray.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    return res.json(settingsObject);
  } catch (error) {
    logger.error("Error fetching settings:", error);
    return res.status(500).json({ error: "Failed to fetch settings" });
  }
});
router10.post("/settings", authMiddleware, requireFeature("admin_settings"), requirePermission("settings", "manage"), async (req, res) => {
  try {
    const body = req.body;
    const ALLOWED_SETTINGS_KEYS = [
      // Company info
      "companyName",
      "companyAddress",
      "companyPhone",
      "companyEmail",
      "companyWebsite",
      "company_companyName",
      "company_address",
      "company_phone",
      "company_email",
      "company_website",
      "gstin",
      "pan",
      "cin",
      "logo",
      "companyLogo",
      "company_gstin",
      "company_pan",
      "company_cin",
      "company_logo",
      "company_city",
      "company_state",
      "company_zipCode",
      "company_country",
      "company_tan",
      "city",
      "state",
      "zipCode",
      "country",
      "tan",
      // Bank details
      "bankName",
      "bankAccountNumber",
      "bankAccountName",
      "bankIfscCode",
      "bankBranch",
      "bankSwiftCode",
      "bank_bankName",
      "bank_accountNumber",
      "bank_accountName",
      "bank_ifscCode",
      "bank_branch",
      "bank_swiftCode",
      // Document prefixes
      "quotePrefix",
      "invoicePrefix",
      "childInvoicePrefix",
      "salesOrderPrefix",
      "vendorPoPrefix",
      "grnPrefix",
      // Document formats
      "quoteFormat",
      "invoiceFormat",
      "childInvoiceFormat",
      "salesOrderFormat",
      "vendorPoFormat",
      "grnFormat",
      // Date format
      "dateFormat",
      "fiscalYearStart",
      // Feature-related settings
      "defaultCurrency",
      "defaultTaxRate",
      "defaultPaymentTerms",
      // Email settings
      "emailFrom",
      "emailReplyTo",
      "emailFooter",
      // Terms and conditions
      "defaultTermsAndConditions",
      "defaultNotes"
    ];
    const validateSettingKey = (key) => {
      return ALLOWED_SETTINGS_KEYS.includes(key) || key.startsWith("custom_");
    };
    if (body.key && body.value !== void 0) {
      if (!validateSettingKey(body.key)) {
        return res.status(400).json({ error: `Invalid setting key: ${body.key}` });
      }
      const setting = await storage.upsertSetting({
        key: body.key,
        value: body.value,
        updatedBy: req.user.id
      });
      await storage.createActivityLog({
        userId: req.user.id,
        action: "update_setting",
        entityType: "setting",
        entityId: body.key
      });
      return res.json(setting);
    } else {
      const results = [];
      const invalidKeys = [];
      for (const [key, value] of Object.entries(body)) {
        if (!validateSettingKey(key)) {
          invalidKeys.push(key);
          continue;
        }
        if (value !== void 0 && value !== null) {
          const setting = await storage.upsertSetting({
            key,
            value: String(value),
            updatedBy: req.user.id
          });
          results.push(setting);
        }
      }
      if (invalidKeys.length > 0) {
        logger.warn(`[Settings] Ignored invalid keys: ${invalidKeys.join(", ")}`);
      }
      await storage.createActivityLog({
        userId: req.user.id,
        action: "update_settings",
        entityType: "settings",
        entityId: "bulk"
      });
      return res.json(results);
    }
  } catch (error) {
    logger.error("Error updating settings:", error);
    return res.status(500).json({ error: error.message || "Failed to update setting" });
  }
});
router10.get("/bank-details", authMiddleware, requireFeature("admin_settings"), requirePermission("settings", "manage"), async (req, res) => {
  try {
    const details = await storage.getAllBankDetails();
    return res.json(details);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch bank details" });
  }
});
router10.get("/bank-details/active", authMiddleware, async (req, res) => {
  try {
    const detail = await storage.getActiveBankDetails();
    return res.json(detail || null);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch active bank details" });
  }
});
router10.post("/bank-details", authMiddleware, requireFeature("admin_settings"), requirePermission("settings", "manage"), async (req, res) => {
  try {
    const { bankName, accountNumber, accountName, ifscCode, branch, swiftCode } = req.body;
    if (!bankName || !accountNumber || !accountName || !ifscCode) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const detail = await storage.createBankDetails({
      bankName,
      accountNumber,
      accountName,
      ifscCode,
      branch: branch || null,
      swiftCode: swiftCode || null,
      isActive: true,
      updatedBy: req.user.id
    });
    await storage.createActivityLog({
      userId: req.user.id,
      action: "create_bank_details",
      entityType: "bank_details",
      entityId: detail.id
    });
    return res.json(detail);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to create bank details" });
  }
});
router10.put("/bank-details/:id", authMiddleware, requireFeature("admin_settings"), requirePermission("settings", "manage"), async (req, res) => {
  try {
    const { bankName, accountNumber, accountName, ifscCode, branch, swiftCode, isActive } = req.body;
    const detail = await storage.updateBankDetails(
      req.params.id,
      {
        ...bankName && { bankName },
        ...accountNumber && { accountNumber },
        ...accountName && { accountName },
        ...ifscCode && { ifscCode },
        ...branch !== void 0 && { branch },
        ...swiftCode !== void 0 && { swiftCode },
        ...isActive !== void 0 && { isActive },
        updatedBy: req.user.id
      }
    );
    if (!detail) {
      return res.status(404).json({ error: "Bank details not found" });
    }
    await storage.createActivityLog({
      userId: req.user.id,
      action: "update_bank_details",
      entityType: "bank_details",
      entityId: detail.id
    });
    return res.json(detail);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to update bank details" });
  }
});
router10.delete("/bank-details/:id", authMiddleware, requireFeature("admin_settings"), requirePermission("settings", "manage"), async (req, res) => {
  try {
    await storage.deleteBankDetails(req.params.id);
    await storage.createActivityLog({
      userId: req.user.id,
      action: "delete_bank_details",
      entityType: "bank_details",
      entityId: req.params.id
    });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to delete bank details" });
  }
});
router10.post("/settings/migrate-document-numbers", authMiddleware, requireFeature("admin_settings"), requirePermission("settings", "manage"), async (req, res) => {
  try {
    const { DocumentNumberMigrationService: DocumentNumberMigrationService2 } = await Promise.resolve().then(() => (init_document_number_migration_service(), document_number_migration_service_exports));
    const options = {
      migrateQuotes: req.body.migrateQuotes !== false,
      migrateVendorPos: req.body.migrateVendorPos !== false,
      migrateMasterInvoices: req.body.migrateMasterInvoices !== false,
      migrateChildInvoices: req.body.migrateChildInvoices !== false,
      migrateGrns: req.body.migrateGrns !== false
    };
    const result = await DocumentNumberMigrationService2.migrateAllDocumentNumbers(options);
    await storage.createActivityLog({
      userId: req.user.id,
      action: "migrate_document_numbers",
      entityType: "settings",
      entityId: "document_numbering"
    });
    return res.json({
      success: result.success,
      message: result.success ? "Document numbers migrated successfully" : "Some migrations failed",
      migrated: result.migrated,
      errors: result.errors
    });
  } catch (error) {
    logger.error("Document number migration error:", error);
    return res.status(500).json({
      error: error.message || "Failed to migrate document numbers",
      success: false
    });
  }
});
router10.get("/numbering/counters", authMiddleware, requireFeature("admin_settings"), requirePermission("settings", "manage"), async (req, res) => {
  try {
    const { NumberingService: NumberingService2 } = await Promise.resolve().then(() => (init_numbering_service(), numbering_service_exports));
    const { featureFlags: featureFlags2 } = await Promise.resolve().then(() => (init_feature_flags(), feature_flags_exports));
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const counters = { year };
    if (featureFlags2.quotes_module) {
      counters.quote = await NumberingService2.getCounter("quote", year);
    }
    if (featureFlags2.vendorPO_module) {
      counters.vendor_po = await NumberingService2.getCounter("vendor_po", year);
    }
    if (featureFlags2.invoices_module) {
      counters.invoice = await NumberingService2.getCounter("invoice", year);
    }
    if (featureFlags2.grn_module) {
      counters.grn = await NumberingService2.getCounter("grn", year);
    }
    if (featureFlags2.sales_orders_module) {
      counters.sales_order = await NumberingService2.getCounter("sales_order", year);
    }
    if (featureFlags2.creditNotes_module) {
      counters.credit_note = await NumberingService2.getCounter("credit_note", year);
    }
    if (featureFlags2.debitNotes_module) {
      counters.debit_note = await NumberingService2.getCounter("debit_note", year);
    }
    return res.json(counters);
  } catch (error) {
    logger.error("Get counters error:", error);
    return res.status(500).json({ error: error.message || "Failed to get counters" });
  }
});
router10.post("/numbering/reset-counter", authMiddleware, requireFeature("admin_settings"), requirePermission("settings", "manage"), async (req, res) => {
  try {
    const { type, year } = req.body;
    if (!type) {
      return res.status(400).json({ error: "Counter type is required" });
    }
    const validTypes = ["quote", "vendor_po", "invoice", "grn", "sales_order", "credit_note", "debit_note"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid counter type" });
    }
    const { featureFlags: featureFlags2 } = await Promise.resolve().then(() => (init_feature_flags(), feature_flags_exports));
    const featureMap = {
      quote: featureFlags2.quotes_module,
      vendor_po: featureFlags2.vendorPO_module,
      invoice: featureFlags2.invoices_module,
      grn: featureFlags2.grn_module,
      sales_order: featureFlags2.sales_orders_module,
      credit_note: featureFlags2.creditNotes_module,
      debit_note: featureFlags2.debitNotes_module
    };
    if (!featureMap[type]) {
      return res.status(403).json({ error: `Feature for ${type} is not enabled` });
    }
    const { NumberingService: NumberingService2 } = await Promise.resolve().then(() => (init_numbering_service(), numbering_service_exports));
    const targetYear = year || (/* @__PURE__ */ new Date()).getFullYear();
    await NumberingService2.resetCounter(type, targetYear);
    await storage.createActivityLog({
      userId: req.user.id,
      action: "reset_counter",
      entityType: "numbering",
      entityId: `${type}_${targetYear}`
    });
    return res.json({
      success: true,
      message: `Counter for ${type} (${targetYear}) reset to 0`,
      currentValue: 0
    });
  } catch (error) {
    logger.error("Reset counter error:", error);
    return res.status(500).json({ error: error.message || "Failed to reset counter" });
  }
});
router10.post("/numbering/set-counter", authMiddleware, requireFeature("admin_settings"), requirePermission("settings", "manage"), async (req, res) => {
  try {
    const { type, year, value } = req.body;
    if (!type || value === void 0) {
      return res.status(400).json({ error: "Counter type and value are required" });
    }
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) {
      return res.status(400).json({ error: "Value must be a non-negative integer" });
    }
    const validTypes = ["quote", "vendor_po", "invoice", "grn", "sales_order", "credit_note", "debit_note"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid counter type" });
    }
    const { featureFlags: featureFlags2 } = await Promise.resolve().then(() => (init_feature_flags(), feature_flags_exports));
    const featureMap = {
      quote: featureFlags2.quotes_module,
      vendor_po: featureFlags2.vendorPO_module,
      invoice: featureFlags2.invoices_module,
      grn: featureFlags2.grn_module,
      sales_order: featureFlags2.sales_orders_module,
      credit_note: featureFlags2.creditNotes_module,
      debit_note: featureFlags2.debitNotes_module
    };
    if (!featureMap[type]) {
      return res.status(403).json({ error: `Feature for ${type} is not enabled` });
    }
    const { NumberingService: NumberingService2 } = await Promise.resolve().then(() => (init_numbering_service(), numbering_service_exports));
    const targetYear = year || (/* @__PURE__ */ new Date()).getFullYear();
    await NumberingService2.setCounter(type, targetYear, numValue);
    const nextValue = numValue + 1;
    await storage.createActivityLog({
      userId: req.user.id,
      action: "set_counter",
      entityType: "numbering",
      entityId: `${type}_${targetYear}`
    });
    return res.json({
      success: true,
      message: `Counter for ${type} (${targetYear}) set to ${numValue}`,
      currentValue: numValue,
      nextNumber: String(nextValue).padStart(4, "0")
    });
  } catch (error) {
    logger.error("Set counter error:", error);
    return res.status(500).json({ error: error.message || "Failed to set counter" });
  }
});
router10.get("/tax-rates", authMiddleware, async (req, res) => {
  try {
    const rates = await db.select().from(taxRates).where(eq11(taxRates.isActive, true));
    const simplifiedRates = rates.map((rate) => ({
      id: rate.id,
      name: `${rate.taxType} ${rate.region}`,
      percentage: parseFloat(rate.igstRate),
      // Use IGST as the main rate
      sgstRate: parseFloat(rate.sgstRate),
      cgstRate: parseFloat(rate.cgstRate),
      igstRate: parseFloat(rate.igstRate),
      region: rate.region,
      taxType: rate.taxType,
      isActive: rate.isActive,
      effectiveFrom: rate.effectiveFrom,
      effectiveTo: rate.effectiveTo
    }));
    return res.json(simplifiedRates);
  } catch (error) {
    logger.error("Error fetching tax rates:", error);
    return res.status(500).json({ error: "Failed to fetch tax rates" });
  }
});
router10.post("/tax-rates", authMiddleware, requireFeature("admin_settings"), requirePermission("settings", "create"), async (req, res) => {
  try {
    const { region, taxType, sgstRate, cgstRate, igstRate, description } = req.body;
    if (!region || !taxType) {
      return res.status(400).json({ error: "Region and taxType are required" });
    }
    const sgst = sgstRate !== void 0 && sgstRate !== null ? String(sgstRate) : "0";
    const cgst = cgstRate !== void 0 && cgstRate !== null ? String(cgstRate) : "0";
    const igst = igstRate !== void 0 && igstRate !== null ? String(igstRate) : "0";
    const newRate = await db.insert(taxRates).values({
      region,
      taxType,
      sgstRate: sgst,
      cgstRate: cgst,
      igstRate: igst
    }).returning();
    await storage.createActivityLog({
      userId: req.user.id,
      action: "create_tax_rate",
      entityType: "tax_rate",
      entityId: newRate[0].id
    });
    return res.json({
      id: newRate[0].id,
      region,
      region_name: region,
      // Ensure compatibility
      taxType,
      sgstRate: parseFloat(sgst),
      cgstRate: parseFloat(cgst),
      igstRate: parseFloat(igst)
    });
  } catch (error) {
    logger.error("Error creating tax rate:", error);
    return res.status(500).json({ error: error.message || "Failed to create tax rate" });
  }
});
router10.delete("/tax-rates/:id", authMiddleware, requireFeature("admin_settings"), requirePermission("settings", "delete"), async (req, res) => {
  try {
    await db.delete(taxRates).where(eq11(taxRates.id, req.params.id));
    await storage.createActivityLog({
      userId: req.user.id,
      action: "delete_tax_rate",
      entityType: "tax_rate",
      entityId: req.params.id
    });
    return res.json({ success: true });
  } catch (error) {
    logger.error("Error deleting tax rate:", error);
    return res.status(500).json({ error: error.message || "Failed to delete tax rate" });
  }
});
router10.get("/payment-terms", authMiddleware, async (req, res) => {
  try {
    const terms = await db.select().from(paymentTerms).where(eq11(paymentTerms.isActive, true));
    return res.json(terms);
  } catch (error) {
    logger.error("Error fetching payment terms:", error);
    return res.status(500).json({ error: "Failed to fetch payment terms" });
  }
});
router10.post("/payment-terms", authMiddleware, requireFeature("admin_settings"), requirePermission("settings", "create"), async (req, res) => {
  try {
    const { name, days, description, isDefault } = req.body;
    if (!name || days === void 0) {
      return res.status(400).json({ error: "Name and days are required" });
    }
    if (isDefault) {
      await db.update(paymentTerms).set({ isDefault: false }).where(eq11(paymentTerms.isDefault, true));
    }
    const newTerm = await db.insert(paymentTerms).values({
      name,
      days,
      description: description || null,
      isDefault: isDefault || false,
      createdBy: req.user.id
    }).returning();
    await storage.createActivityLog({
      userId: req.user.id,
      action: "create_payment_term",
      entityType: "payment_term",
      entityId: newTerm[0].id
    });
    return res.json(newTerm[0]);
  } catch (error) {
    logger.error("Error creating payment term:", error);
    return res.status(500).json({ error: error.message || "Failed to create payment term" });
  }
});
router10.delete("/payment-terms/:id", authMiddleware, requireFeature("admin_settings"), requirePermission("settings", "delete"), async (req, res) => {
  try {
    await db.delete(paymentTerms).where(eq11(paymentTerms.id, req.params.id));
    await storage.createActivityLog({
      userId: req.user.id,
      action: "delete_payment_term",
      entityType: "payment_term",
      entityId: req.params.id
    });
    return res.json({ success: true });
  } catch (error) {
    logger.error("Error deleting payment term:", error);
    return res.status(500).json({ error: error.message || "Failed to delete payment term" });
  }
});
router10.get("/currency-settings", authMiddleware, async (req, res) => {
  try {
    const settings2 = await storage.getCurrencySettings();
    if (!settings2) {
      return res.json({ baseCurrency: "INR", supportedCurrencies: "[]", exchangeRates: "{}" });
    }
    return res.json(settings2);
  } catch (error) {
    logger.error("Get currency settings error:", error);
    return res.status(500).json({ error: "Failed to fetch currency settings" });
  }
});
router10.post("/currency-settings", authMiddleware, requireFeature("admin_settings"), requirePermission("settings", "manage"), async (req, res) => {
  try {
    const { baseCurrency, supportedCurrencies, exchangeRates } = req.body;
    const settings2 = await storage.upsertCurrencySettings({
      baseCurrency: baseCurrency || "INR",
      supportedCurrencies: typeof supportedCurrencies === "string" ? supportedCurrencies : JSON.stringify(supportedCurrencies),
      exchangeRates: typeof exchangeRates === "string" ? exchangeRates : JSON.stringify(exchangeRates)
    });
    await storage.createActivityLog({
      userId: req.user.id,
      action: "update_currency_settings",
      entityType: "settings"
    });
    return res.json(settings2);
  } catch (error) {
    logger.error("Update currency settings error:", error);
    return res.status(500).json({ error: error.message || "Failed to update currency settings" });
  }
});
router10.get("/admin/settings", authMiddleware, requireFeature("admin_settings"), requirePermission("settings", "manage"), async (req, res) => {
  try {
    const settings2 = await storage.getAllSettings();
    const settingsMap = {};
    settings2.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    const categories = {
      company: {
        companyName: settingsMap["companyName"] || "",
        companyEmail: settingsMap["companyEmail"] || "",
        companyPhone: settingsMap["companyPhone"] || "",
        companyWebsite: settingsMap["companyWebsite"] || "",
        companyAddress: settingsMap["companyAddress"] || "",
        companyLogo: settingsMap["companyLogo"] || ""
      },
      taxation: {
        gstin: settingsMap["gstin"] || "",
        taxType: settingsMap["taxType"] || "GST",
        // GST, VAT, etc.
        defaultTaxRate: settingsMap["defaultTaxRate"] || "18",
        enableIGST: settingsMap["enableIGST"] === "true",
        enableCGST: settingsMap["enableCGST"] === "true",
        enableSGST: settingsMap["enableSGST"] === "true"
      },
      documents: {
        quotePrefix: settingsMap["quotePrefix"] || "QT",
        invoicePrefix: settingsMap["invoicePrefix"] || "INV",
        nextQuoteNumber: settingsMap["nextQuoteNumber"] || "1001",
        nextInvoiceNumber: settingsMap["nextInvoiceNumber"] || "1001"
      },
      email: {
        smtpHost: settingsMap["smtpHost"] || "",
        smtpPort: settingsMap["smtpPort"] || "",
        smtpEmail: settingsMap["smtpEmail"] || "",
        emailTemplateQuote: settingsMap["emailTemplateQuote"] || "",
        emailTemplateInvoice: settingsMap["emailTemplateInvoice"] || "",
        emailTemplatePaymentReminder: settingsMap["emailTemplatePaymentReminder"] || ""
      },
      general: {
        quotaValidityDays: settingsMap["quotaValidityDays"] || "30",
        invoiceDueDays: settingsMap["invoiceDueDays"] || "30",
        enableAutoReminders: settingsMap["enableAutoReminders"] === "true",
        reminderDaysBeforeDue: settingsMap["reminderDaysBeforeDue"] || "3"
      }
    };
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch admin settings" });
  }
});
router10.post("/admin/settings/company", authMiddleware, requireFeature("admin_settings"), requirePermission("settings", "manage"), async (req, res) => {
  try {
    const companySettings = req.body;
    for (const [key, value] of Object.entries(companySettings)) {
      await storage.upsertSetting({
        key,
        value: String(value),
        updatedBy: req.user.id
      });
    }
    await storage.createActivityLog({
      userId: req.user.id,
      action: "update_company_settings",
      entityType: "settings"
    });
    return res.json({ success: true, message: "Company settings updated" });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to update company settings" });
  }
});
router10.post("/admin/settings/taxation", authMiddleware, requireFeature("admin_settings"), requirePermission("settings", "manage"), async (req, res) => {
  try {
    const taxSettings = req.body;
    for (const [key, value] of Object.entries(taxSettings)) {
      await storage.upsertSetting({
        key,
        value: String(value),
        updatedBy: req.user.id
      });
    }
    await storage.createActivityLog({
      userId: req.user.id,
      action: "update_tax_settings",
      entityType: "settings"
    });
    return res.json({ success: true, message: "Tax settings updated" });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to update tax settings" });
  }
});
router10.post("/admin/settings/email", authMiddleware, requireFeature("admin_settings"), requirePermission("settings", "manage"), async (req, res) => {
  try {
    const emailSettings = req.body;
    for (const [key, value] of Object.entries(emailSettings)) {
      await storage.upsertSetting({
        key,
        value: String(value),
        updatedBy: req.user.id
      });
    }
    await storage.createActivityLog({
      userId: req.user.id,
      action: "update_email_settings",
      entityType: "settings"
    });
    if (emailSettings.smtpHost) {
      EmailService.initialize({
        host: emailSettings.smtpHost,
        port: Number(emailSettings.smtpPort),
        secure: emailSettings.smtpSecure === "true",
        auth: {
          user: emailSettings.smtpEmail,
          pass: process.env.SMTP_PASSWORD || ""
        },
        from: emailSettings.smtpEmail || "noreply@quoteprogen.com"
      });
    }
    return res.json({ success: true, message: "Email settings updated" });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to update email settings" });
  }
});
router10.get("/debug/counters", async (req, res) => {
  try {
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const types = ["quote", "master_invoice", "child_invoice", "vendor_po", "grn"];
    const counters = {};
    for (const type of types) {
      const counterKey = `${type}_counter_${year}`;
      const setting = await storage.getSetting(counterKey);
      const currentValue = setting?.value || "0";
      const nextValue = parseInt(String(currentValue), 10) + 1;
      counters[counterKey] = {
        current: currentValue,
        next: String(nextValue).padStart(4, "0"),
        exists: !!setting
      };
    }
    return res.json({
      year,
      counters,
      message: "Next value shows what will be generated next"
    });
  } catch (error) {
    logger.error("Error fetching counters:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch counters" });
  }
});
router10.post("/debug/reset-counter/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    logger.info(`[DEBUG] Resetting counter for ${type} in year ${year}`);
    await NumberingService.resetCounter(type, year);
    return res.json({
      success: true,
      message: `Counter ${type}_counter_${year} has been reset to 0`,
      nextNumber: "0001"
    });
  } catch (error) {
    logger.error("Error resetting counter:", error);
    return res.status(500).json({ error: error.message || "Failed to reset counter" });
  }
});
router10.post("/debug/set-counter/:type/:value", async (req, res) => {
  try {
    const { type, value } = req.params;
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) {
      return res.status(400).json({ error: "Value must be a non-negative integer" });
    }
    logger.info(`[DEBUG] Setting ${type}_counter_${year} to ${numValue}`);
    await NumberingService.setCounter(type, year, numValue);
    const nextValue = numValue + 1;
    return res.json({
      success: true,
      message: `Counter ${type}_counter_${year} set to ${numValue}`,
      nextNumber: String(nextValue).padStart(4, "0")
    });
  } catch (error) {
    logger.error("Error setting counter:", error);
    return res.status(500).json({ error: error.message || "Failed to set counter" });
  }
});
var settings_routes_default = router10;

// server/routes/serial-numbers.routes.ts
init_storage();
import { Router as Router11 } from "express";
init_logger();
init_db();
init_schema();
import { eq as eq12, sql as sql10 } from "drizzle-orm";
var router11 = Router11();
router11.get("/search", authMiddleware, async (req, res) => {
  try {
    const { getSerialTraceability: getSerialTraceability2 } = await Promise.resolve().then(() => (init_serial_number_service(), serial_number_service_exports));
    const serialNumber = req.query.q;
    if (!serialNumber || serialNumber.trim().length === 0) {
      return res.status(400).json({ error: "Serial number query is required" });
    }
    const traceability = await getSerialTraceability2(serialNumber.trim());
    if (!traceability) {
      return res.status(404).json({ error: "Serial number not found" });
    }
    return res.json(traceability);
  } catch (error) {
    logger.error("Error searching serial number:", error);
    return res.status(500).json({ error: error.message || "Failed to search serial number" });
  }
});
router11.post("/batch-validate", authMiddleware, async (req, res) => {
  try {
    const { getSerialTraceability: getSerialTraceability2 } = await Promise.resolve().then(() => (init_serial_number_service(), serial_number_service_exports));
    const { serials } = req.body;
    if (!serials || !Array.isArray(serials)) {
      return res.status(400).json({ error: "Invalid serials array" });
    }
    const results = await Promise.all(
      serials.map(async (serial2) => {
        const traceability = await getSerialTraceability2(serial2);
        return {
          serial: serial2,
          exists: !!traceability,
          info: traceability
        };
      })
    );
    return res.json({ results });
  } catch (error) {
    logger.error("Error batch validating serials:", error);
    return res.status(500).json({ error: error.message || "Failed to validate serials" });
  }
});
router11.post("/bulk", authMiddleware, requireFeature("serialNumber_tracking"), async (req, res) => {
  try {
    const {
      serialNumbers: serialNumbers2,
      invoiceItemId,
      productId,
      vendorPoItemId,
      grnId
    } = req.body;
    if (!Array.isArray(serialNumbers2) || serialNumbers2.length === 0) {
      return res.status(400).json({ error: "Serial numbers array is required" });
    }
    const existing = await db.select().from(serialNumbers).where(sql10`${serialNumbers.serialNumber} = ANY(${serialNumbers2})`);
    if (existing.length > 0) {
      return res.status(400).json({
        error: "Duplicate serial numbers found",
        duplicates: existing.map((s) => s.serialNumber)
      });
    }
    const records = serialNumbers2.map((sn) => ({
      serialNumber: sn,
      productId: productId || null,
      vendorPoItemId: vendorPoItemId || null,
      grnId: grnId || null,
      invoiceItemId: invoiceItemId || null,
      status: invoiceItemId ? "reserved" : "in_stock",
      createdBy: req.user.id
    }));
    const created = await db.insert(serialNumbers).values(records).returning();
    await storage.createActivityLog({
      userId: req.user.id,
      action: "bulk_import_serials",
      entityType: "serial_numbers",
      entityId: created[0].id
    });
    return res.json({ count: created.length, serialNumbers: created });
  } catch (error) {
    logger.error("Error importing serial numbers:", error);
    return res.status(500).json({ error: error.message || "Failed to import serial numbers" });
  }
});
router11.get("/:serialNumber", authMiddleware, requireFeature("serialNumber_tracking"), async (req, res) => {
  try {
    const [serial2] = await db.select().from(serialNumbers).where(eq12(serialNumbers.serialNumber, req.params.serialNumber));
    if (!serial2) {
      return res.status(404).json({ error: "Serial number not found" });
    }
    let product = null;
    if (serial2.productId) {
      [product] = await db.select({ id: products.id, name: products.name, sku: products.sku }).from(products).where(eq12(products.id, serial2.productId));
    }
    let vendor = null;
    if (serial2.vendorId) {
      [vendor] = await db.select({ id: vendors.id, name: vendors.name }).from(vendors).where(eq12(vendors.id, serial2.vendorId));
    }
    let vendorPo = null;
    if (serial2.vendorPoId) {
      [vendorPo] = await db.select({
        id: vendorPurchaseOrders.id,
        poNumber: vendorPurchaseOrders.poNumber,
        orderDate: vendorPurchaseOrders.orderDate
      }).from(vendorPurchaseOrders).where(eq12(vendorPurchaseOrders.id, serial2.vendorPoId));
    }
    let grn = null;
    if (serial2.grnId) {
      [grn] = await db.select({
        id: goodsReceivedNotes.id,
        grnNumber: goodsReceivedNotes.grnNumber,
        receivedDate: goodsReceivedNotes.receivedDate,
        inspectionStatus: goodsReceivedNotes.inspectionStatus
      }).from(goodsReceivedNotes).where(eq12(goodsReceivedNotes.id, serial2.grnId));
    }
    let invoice = null;
    if (serial2.invoiceId) {
      [invoice] = await db.select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        createdAt: invoices.createdAt
      }).from(invoices).where(eq12(invoices.id, serial2.invoiceId));
    }
    return res.json({
      ...serial2,
      product,
      vendor,
      vendorPo,
      grn,
      invoice
    });
  } catch (error) {
    logger.error("Error fetching serial number:", error);
    return res.status(500).json({ error: "Failed to fetch serial number" });
  }
});
var serial_numbers_routes_default = router11;

// server/routes/approval-rules.routes.ts
init_storage();
import { Router as Router12 } from "express";
init_schema();
init_logger();
var router12 = Router12();
router12.use(requireFeature("approvalRules_module"));
router12.get("/", authMiddleware, requirePermission("settings", "view"), async (req, res) => {
  try {
    const rules = await storage.getApprovalRules();
    res.json(rules);
  } catch (error) {
    logger.error("Failed to fetch approval rules:", error);
    res.status(500).json({ error: "Failed to fetch approval rules" });
  }
});
router12.post("/", authMiddleware, requirePermission("settings", "edit"), async (req, res) => {
  try {
    const validatedRule = insertApprovalRuleSchema.parse({
      ...req.body,
      createdBy: req.user.id
    });
    const rule = await storage.createApprovalRule(validatedRule);
    res.json(rule);
  } catch (error) {
    logger.error("Failed to create approval rule:", error);
    res.status(400).json({ error: error.message || "Failed to create approval rule" });
  }
});
router12.patch("/:id", authMiddleware, requirePermission("settings", "edit"), async (req, res) => {
  try {
    const updated = await storage.updateApprovalRule(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Rule not found" });
    }
    res.json(updated);
  } catch (error) {
    logger.error("Failed to update approval rule:", error);
    res.status(500).json({ error: "Failed to update approval rule" });
  }
});
router12.delete("/:id", authMiddleware, requirePermission("settings", "edit"), async (req, res) => {
  try {
    await storage.deleteApprovalRule(req.params.id);
    res.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete approval rule:", error);
    res.status(500).json({ error: "Failed to delete approval rule" });
  }
});
var approval_rules_routes_default = router12;

// server/routes/pricing.routes.ts
init_storage();
import { Router as Router13 } from "express";
init_logger();

// server/services/pricing.service.ts
init_storage();
import { Decimal as Decimal3 } from "decimal.js";
var PricingService = class {
  /**
   * Calculate discount based on quote amount and applicable pricing tier
   */
  async calculateDiscount(subtotal) {
    try {
      const tier = await storage.getPricingTierByAmount(subtotal);
      if (!tier) {
        return {
          discountPercent: 0,
          discountAmount: 0,
          finalAmount: subtotal
        };
      }
      const discountPercent = parseFloat(tier.discountPercent.toString());
      const discountAmount = subtotal * (discountPercent / 100);
      const finalAmount = subtotal - discountAmount;
      return {
        discountPercent,
        discountAmount,
        finalAmount
      };
    } catch (error) {
      console.error("Error calculating discount:", error);
      return {
        discountPercent: 0,
        discountAmount: 0,
        finalAmount: subtotal
      };
    }
  }
  /**
   * Get applicable tax rates for a region
   */
  async getTaxRatesForRegion(region) {
    try {
      const taxRate = await storage.getTaxRateByRegion(region);
      if (!taxRate) {
        return {
          sgstRate: 0,
          cgstRate: 0,
          igstRate: 0
        };
      }
      return {
        sgstRate: parseFloat(taxRate.sgstRate.toString()),
        cgstRate: parseFloat(taxRate.cgstRate.toString()),
        igstRate: parseFloat(taxRate.igstRate.toString())
      };
    } catch (error) {
      console.error("Error getting tax rates:", error);
      return {
        sgstRate: 0,
        cgstRate: 0,
        igstRate: 0
      };
    }
  }
  /**
   * Calculate taxes on an amount
   */
  async calculateTaxes(amount, region, useIGST = false) {
    const rates = await this.getTaxRatesForRegion(region);
    if (useIGST) {
      const igst = amount * (rates.igstRate / 100);
      return {
        sgst: 0,
        cgst: 0,
        igst,
        totalTax: igst
      };
    } else {
      const sgst = amount * (rates.sgstRate / 100);
      const cgst = amount * (rates.cgstRate / 100);
      return {
        sgst,
        cgst,
        igst: 0,
        totalTax: sgst + cgst
      };
    }
  }
  /**
   * Convert amount between currencies
   */
  async convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return amount;
    }
    try {
      const currencySettings2 = await storage.getCurrencySettings();
      if (!currencySettings2 || !currencySettings2.exchangeRates) {
        return amount;
      }
      const rates = JSON.parse(currencySettings2.exchangeRates);
      const fromRate = rates[fromCurrency] || 1;
      const toRate = rates[toCurrency] || 1;
      return amount / fromRate * toRate;
    } catch (error) {
      console.error("Error converting currency:", error);
      return amount;
    }
  }
  /**
   * Apply rounding rules to a monetary amount
   */
  roundAmount(amount, roundingRule = "nearest") {
    const decimal2 = new Decimal3(amount);
    switch (roundingRule) {
      case "up":
        return parseFloat(decimal2.toDecimalPlaces(2, Decimal3.ROUND_UP).toString());
      case "down":
        return parseFloat(decimal2.toDecimalPlaces(2, Decimal3.ROUND_DOWN).toString());
      case "nearest":
      default:
        return parseFloat(decimal2.toDecimalPlaces(2, Decimal3.ROUND_HALF_UP).toString());
    }
  }
  /**
   * Calculate final quote total with all adjustments
   */
  async calculateQuoteTotal(params) {
    let discount = params.customDiscount || 0;
    if (!params.customDiscount) {
      const discountCalc = await this.calculateDiscount(params.subtotal);
      discount = discountCalc.discountAmount;
    }
    const discountedSubtotal = params.subtotal - discount;
    const shipping = params.shippingCharges || 0;
    const subtotalWithShipping = discountedSubtotal + shipping;
    const taxes = await this.calculateTaxes(subtotalWithShipping, params.region, params.useIGST);
    const total = this.roundAmount(subtotalWithShipping + taxes.totalTax);
    return {
      subtotal: this.roundAmount(params.subtotal),
      discount: this.roundAmount(discount),
      discountedSubtotal: this.roundAmount(discountedSubtotal),
      shipping: this.roundAmount(shipping),
      subtotalWithShipping: this.roundAmount(subtotalWithShipping),
      sgst: this.roundAmount(taxes.sgst),
      cgst: this.roundAmount(taxes.cgst),
      igst: this.roundAmount(taxes.igst),
      total
    };
  }
};
var pricingService = new PricingService();

// server/routes/pricing.routes.ts
var router13 = Router13();
router13.get("/pricing-tiers", authMiddleware, async (req, res) => {
  try {
    const tiers = await storage.getAllPricingTiers();
    res.json(tiers);
  } catch (error) {
    logger.error("Get pricing tiers error:", error);
    res.status(500).json({ error: "Failed to fetch pricing tiers" });
  }
});
router13.post("/pricing-tiers", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { name, minAmount, maxAmount, discountPercent, description, isActive } = req.body;
    if (!name || minAmount === void 0 || discountPercent === void 0) {
      return res.status(400).json({ error: "Name, minAmount, and discountPercent are required" });
    }
    const tier = await storage.createPricingTier({
      name,
      minAmount,
      maxAmount,
      discountPercent,
      description,
      isActive: isActive !== false
    });
    await storage.createActivityLog({
      userId: req.user.id,
      action: "create_pricing_tier",
      entityType: "pricing_tier",
      entityId: tier.id
    });
    res.json(tier);
  } catch (error) {
    logger.error("Create pricing tier error:", error);
    res.status(500).json({ error: error.message || "Failed to create pricing tier" });
  }
});
router13.patch("/pricing-tiers/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const updated = await storage.updatePricingTier(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Pricing tier not found" });
    }
    await storage.createActivityLog({
      userId: req.user.id,
      action: "update_pricing_tier",
      entityType: "pricing_tier",
      entityId: updated.id
    });
    res.json(updated);
  } catch (error) {
    logger.error("Update pricing tier error:", error);
    res.status(500).json({ error: error.message || "Failed to update pricing tier" });
  }
});
router13.delete("/pricing-tiers/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    await storage.deletePricingTier(req.params.id);
    await storage.createActivityLog({
      userId: req.user.id,
      action: "delete_pricing_tier",
      entityType: "pricing_tier",
      entityId: req.params.id
    });
    res.json({ success: true });
  } catch (error) {
    logger.error("Delete pricing tier error:", error);
    res.status(500).json({ error: "Failed to delete pricing tier" });
  }
});
router13.post("/pricing/calculate-discount", authMiddleware, async (req, res) => {
  try {
    const { subtotal } = req.body;
    if (!subtotal || subtotal <= 0) {
      return res.status(400).json({ error: "Valid subtotal is required" });
    }
    const result = await pricingService.calculateDiscount(subtotal);
    res.json(result);
  } catch (error) {
    logger.error("Calculate discount error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate discount" });
  }
});
router13.post("/pricing/calculate-taxes", authMiddleware, async (req, res) => {
  try {
    const { amount, region, useIGST } = req.body;
    if (!amount || !region) {
      return res.status(400).json({ error: "Amount and region are required" });
    }
    const taxes = await pricingService.calculateTaxes(amount, region, useIGST);
    res.json(taxes);
  } catch (error) {
    logger.error("Calculate taxes error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate taxes" });
  }
});
router13.post("/pricing/calculate-total", authMiddleware, async (req, res) => {
  try {
    const { subtotal, region, useIGST, shippingCharges, customDiscount } = req.body;
    if (!subtotal || !region) {
      return res.status(400).json({ error: "Subtotal and region are required" });
    }
    const total = await pricingService.calculateQuoteTotal({
      subtotal,
      region,
      useIGST,
      shippingCharges,
      customDiscount
    });
    res.json(total);
  } catch (error) {
    logger.error("Calculate total error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate total" });
  }
});
router13.post("/pricing/convert-currency", authMiddleware, async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;
    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({ error: "Amount, fromCurrency, and toCurrency are required" });
    }
    const converted = await pricingService.convertCurrency(amount, fromCurrency, toCurrency);
    res.json({ original: amount, converted, fromCurrency, toCurrency });
  } catch (error) {
    logger.error("Convert currency error:", error);
    res.status(500).json({ error: error.message || "Failed to convert currency" });
  }
});
var pricing_routes_default = router13;

// server/routes/analytics.routes.ts
import { Router as Router14 } from "express";
init_storage();
init_logger();

// server/services/analytics.service.ts
init_storage();
init_cache_service();
var AnalyticsService = class {
  /**
   * Get revenue forecast based on historical data
   */
  async getRevenueForecast(monthsAhead = 3) {
    const cacheKey = `analytics:forecast:${monthsAhead}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;
    try {
      const allQuotes = await storage.getAllQuotes();
      const allInvoices = await storage.getAllInvoices();
      const now = /* @__PURE__ */ new Date();
      const monthlyRevenue = {};
      for (let i = 0; i < 12; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlyRevenue[monthKey] = 0;
      }
      allInvoices.forEach((invoice) => {
        const date = new Date(invoice.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyRevenue.hasOwnProperty(monthKey)) {
          monthlyRevenue[monthKey] += parseFloat((invoice.paidAmount || 0).toString());
        }
      });
      const revenues = Object.values(monthlyRevenue).filter((v) => v > 0);
      const avgRevenue = revenues.length > 0 ? revenues.reduce((a, b) => a + b, 0) / revenues.length : 0;
      const forecast = [];
      for (let i = 1; i <= monthsAhead; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() + i);
        const monthStr = date.toLocaleString("default", { month: "short", year: "numeric" });
        forecast.push({
          month: monthStr,
          forecastedRevenue: this.roundAmount(avgRevenue * (1 + (Math.random() - 0.5) * 0.2)),
          confidence: 0.75 + Math.random() * 0.15
          // 75-90% confidence
        });
      }
      await cacheService.set(cacheKey, forecast, 3600);
      return forecast;
    } catch (error) {
      console.error("Error getting revenue forecast:", error);
      return [];
    }
  }
  /**
   * Get deal distribution by value ranges
   */
  async getDealDistribution() {
    const cacheKey = "analytics:deal_distribution";
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;
    try {
      const allQuotes = await storage.getAllQuotes();
      const ranges = [
        { label: "0-10K", min: 0, max: 1e4 },
        { label: "10K-50K", min: 1e4, max: 5e4 },
        { label: "50K-100K", min: 5e4, max: 1e5 },
        { label: "100K-500K", min: 1e5, max: 5e5 },
        { label: "500K+", min: 5e5, max: Infinity }
      ];
      const distribution = ranges.map((range) => {
        const quotesInRange = allQuotes.filter((q) => {
          const total = parseFloat(q.total.toString());
          return total >= range.min && total < range.max;
        });
        const totalValue = quotesInRange.reduce((sum, q) => sum + parseFloat(q.total.toString()), 0);
        return {
          range: range.label,
          count: quotesInRange.length,
          totalValue: this.roundAmount(totalValue),
          percentage: 0
          // Will calculate after
        };
      });
      const totalQuotes = distribution.reduce((sum, d) => sum + d.count, 0);
      const result = distribution.map((d) => ({
        ...d,
        percentage: totalQuotes > 0 ? d.count / totalQuotes * 100 : 0
      }));
      await cacheService.set(cacheKey, result, 900);
      return result;
    } catch (error) {
      console.error("Error getting deal distribution:", error);
      return [];
    }
  }
  /**
   * Get regional sales distribution
   */
  async getRegionalDistribution() {
    const cacheKey = "analytics:regional_distribution";
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;
    try {
      const allClients = await storage.getAllClients();
      const allQuotes = await storage.getAllQuotes();
      const regionData = {};
      for (const quote of allQuotes) {
        const client = allClients.find((c) => c.id === quote.clientId);
        const rawAddress = client?.billingAddress || client?.shippingAddress || "";
        const addressParts = rawAddress.split(/[\n,]/).map((s) => s.trim()).filter((s) => s.length > 0);
        let region = "Unknown";
        if (addressParts.length > 0) {
          const last = addressParts[addressParts.length - 1];
          if (/^[\d-]+$/.test(last) && addressParts.length > 1) {
            region = addressParts[addressParts.length - 2];
          } else {
            region = last;
          }
        }
        if ((region === "Unknown" || region.length < 3) && client?.gstin && client.gstin.length >= 2) {
          const stateCode = client.gstin.substring(0, 2);
          const stateMap = {
            "01": "Jammu & Kashmir",
            "02": "Himachal Pradesh",
            "03": "Punjab",
            "04": "Chandigarh",
            "05": "Uttarakhand",
            "06": "Haryana",
            "07": "Delhi",
            "08": "Rajasthan",
            "09": "Uttar Pradesh",
            "10": "Bihar",
            "11": "Sikkim",
            "12": "Arunachal Pradesh",
            "13": "Nagaland",
            "14": "Manipur",
            "15": "Mizoram",
            "16": "Tripura",
            "17": "Meghalaya",
            "18": "Assam",
            "19": "West Bengal",
            "20": "Jharkhand",
            "21": "Odisha",
            "22": "Chattisgarh",
            "23": "Madhya Pradesh",
            "24": "Gujarat",
            "27": "Maharashtra",
            "29": "Karnataka",
            "30": "Goa",
            "31": "Lakshadweep",
            "32": "Kerala",
            "33": "Tamil Nadu",
            "34": "Puducherry",
            "35": "Andaman & Nicobar",
            "36": "Telangana",
            "37": "Andhra Pradesh",
            "38": "Ladakh"
          };
          if (stateMap[stateCode]) {
            region = stateMap[stateCode];
          }
        }
        if (!regionData[region]) {
          regionData[region] = { count: 0, revenue: 0 };
        }
        regionData[region].count++;
        regionData[region].revenue += parseFloat(quote.total.toString());
      }
      const totalQuotes = Object.values(regionData).reduce((sum, r) => sum + r.count, 0);
      const result = Object.entries(regionData).map(([region, data]) => ({
        region,
        quoteCount: data.count,
        totalRevenue: this.roundAmount(data.revenue),
        percentage: totalQuotes > 0 ? data.count / totalQuotes * 100 : 0
      }));
      await cacheService.set(cacheKey, result, 3600);
      return result;
    } catch (error) {
      console.error("Error getting regional distribution:", error);
      return [];
    }
  }
  /**
   * Get custom report data
   */
  async getCustomReport(params) {
    try {
      let quotes2 = await storage.getAllQuotes();
      const clients3 = await storage.getAllClients();
      if (params.startDate) {
        quotes2 = quotes2.filter((q) => new Date(q.createdAt) >= params.startDate);
      }
      if (params.endDate) {
        quotes2 = quotes2.filter((q) => new Date(q.createdAt) <= params.endDate);
      }
      if (params.status) {
        quotes2 = quotes2.filter((q) => q.status === params.status);
      }
      if (params.minAmount) {
        quotes2 = quotes2.filter((q) => parseFloat(q.total.toString()) >= params.minAmount);
      }
      if (params.maxAmount) {
        quotes2 = quotes2.filter((q) => parseFloat(q.total.toString()) <= params.maxAmount);
      }
      return quotes2.map((q) => {
        const client = clients3.find((c) => c.id === q.clientId);
        return {
          quoteNumber: q.quoteNumber,
          clientName: client?.name || "Unknown",
          totalAmount: this.roundAmount(parseFloat(q.total.toString())),
          status: q.status,
          createdDate: q.createdAt
        };
      });
    } catch (error) {
      console.error("Error getting custom report:", error);
      return [];
    }
  }
  /**
   * Get sales pipeline data
   */
  async getSalesPipeline() {
    const cacheKey = "analytics:sales_pipeline";
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;
    try {
      const allQuotes = await storage.getAllQuotes();
      const stages = ["draft", "sent", "approved", "rejected", "invoiced"];
      const pipeline = stages.map((stage) => {
        const stageQuotes = allQuotes.filter((q) => q.status === stage);
        const totalValue = stageQuotes.reduce((sum, q) => sum + parseFloat(q.total.toString()), 0);
        const avgDealValue = stageQuotes.length > 0 ? totalValue / stageQuotes.length : 0;
        return {
          stage,
          count: stageQuotes.length,
          totalValue: this.roundAmount(totalValue),
          avgDealValue: this.roundAmount(avgDealValue)
        };
      });
      await cacheService.set(cacheKey, pipeline, 300);
      return pipeline;
    } catch (error) {
      console.error("Error getting sales pipeline:", error);
      return [];
    }
  }
  /**
   * Get client lifetime value
   */
  async getClientLifetimeValue(clientId) {
    try {
      const allQuotes = await storage.getAllQuotes();
      const clientQuotes = allQuotes.filter((q) => q.clientId === clientId);
      const allInvoices = await storage.getAllInvoices();
      const clientInvoices = allInvoices.filter((i) => {
        const quote = clientQuotes.find((q) => q.id === i.quoteId);
        return !!quote;
      });
      const totalRevenue = clientInvoices.reduce((sum, i) => sum + parseFloat((i.paidAmount || 0).toString()), 0);
      const avgDealSize = clientQuotes.length > 0 ? totalRevenue / clientQuotes.length : 0;
      const conversionRate = clientQuotes.length > 0 ? clientInvoices.length / clientQuotes.length * 100 : 0;
      return {
        totalQuotes: clientQuotes.length,
        totalInvoices: clientInvoices.length,
        totalRevenue: this.roundAmount(totalRevenue),
        averageDealSize: this.roundAmount(avgDealSize),
        conversionRate: parseFloat(conversionRate.toFixed(2))
      };
    } catch (error) {
      console.error("Error getting client lifetime value:", error);
      return {
        totalQuotes: 0,
        totalInvoices: 0,
        totalRevenue: 0,
        averageDealSize: 0,
        conversionRate: 0
      };
    }
  }
  /**
   * Get competitor analysis insights
   */
  async getCompetitorInsights() {
    const cacheKey = "analytics:competitor_insights";
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;
    try {
      const allQuotes = await storage.getAllQuotes();
      const allInvoices = await storage.getAllInvoices();
      if (allQuotes.length === 0) {
        return {
          avgQuoteValue: 0,
          medianQuoteValue: 0,
          quoteFrequency: 0,
          conversionTrend: 0
        };
      }
      const values = allQuotes.map((q) => parseFloat(q.total.toString())).sort((a, b) => a - b);
      const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
      const medianValue = values.length % 2 === 0 ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2 : values[Math.floor(values.length / 2)];
      const weekAgo = /* @__PURE__ */ new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentQuotes = allQuotes.filter((q) => new Date(q.createdAt) >= weekAgo);
      const quoteFrequency = recentQuotes.length;
      const conversionCount = allInvoices.length;
      const conversionTrend = allQuotes.length > 0 ? conversionCount / allQuotes.length * 100 : 0;
      const result = {
        avgQuoteValue: this.roundAmount(avgValue),
        medianQuoteValue: this.roundAmount(medianValue),
        quoteFrequency,
        conversionTrend: parseFloat(conversionTrend.toFixed(2))
      };
      await cacheService.set(cacheKey, result, 3600);
      return result;
    } catch (error) {
      console.error("Error getting competitor insights:", error);
      return {
        avgQuoteValue: 0,
        medianQuoteValue: 0,
        quoteFrequency: 0,
        conversionTrend: 0
      };
    }
  }
  roundAmount(amount) {
    return Math.round(amount * 100) / 100;
  }
};
var analyticsService = new AnalyticsService();

// server/routes/analytics.routes.ts
init_db();
import { sql as sql11 } from "drizzle-orm";
import ExcelJS2 from "exceljs";
var router14 = Router14();
router14.get("/dashboard", authMiddleware, requireFeature("analytics_module"), requirePermission("analytics", "view"), async (req, res) => {
  try {
    const quotes2 = await storage.getAllQuotes();
    const clients3 = await storage.getAllClients();
    const invoices2 = await storage.getAllInvoices();
    const totalQuotes = quotes2.length;
    const totalClients = clients3.length;
    const safeToNum = (val) => {
      if (typeof val === "number") return val;
      if (!val) return 0;
      const str = String(val).replace(/[^0-9.-]+/g, "");
      return parseFloat(str) || 0;
    };
    const approvedQuotes = quotes2.filter((q) => q.status === "approved" || q.status === "invoiced" || q.status === "closed_paid");
    const totalRevenue = invoices2.reduce((sum, inv) => sum + safeToNum(inv.paidAmount), 0);
    const conversionRate = totalQuotes > 0 ? (approvedQuotes.length / totalQuotes * 100).toFixed(1) : "0";
    const recentQuotes = await Promise.all(
      quotes2.slice(0, 5).map(async (quote) => {
        const client = await storage.getClient(quote.clientId);
        return {
          id: quote.id,
          quoteNumber: quote.quoteNumber,
          clientName: client?.name || "Unknown",
          total: quote.total,
          status: quote.status,
          createdAt: quote.createdAt
        };
      })
    );
    const clientMap = new Map(clients3.map((c) => [c.id, c]));
    const clientRevenue = /* @__PURE__ */ new Map();
    for (const inv of invoices2) {
      if (!inv.clientId) continue;
      const paid = safeToNum(inv.paidAmount);
      if (paid <= 0) continue;
      const client = clientMap.get(inv.clientId);
      if (!client) continue;
      const existing = clientRevenue.get(inv.clientId);
      if (existing) {
        existing.totalRevenue += paid;
        existing.quoteCount += 1;
      } else {
        clientRevenue.set(inv.clientId, {
          name: client.name,
          totalRevenue: paid,
          quoteCount: 1
        });
      }
    }
    const topClients = Array.from(clientRevenue.values()).map((c) => ({
      name: c.name,
      total: c.totalRevenue,
      // Send as number
      quoteCount: c.quoteCount
    })).sort((a, b) => b.total - a.total).slice(0, 5);
    const quotesByStatus = quotes2.reduce((acc, quote) => {
      const existing = acc.find((item) => item.status === quote.status);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ status: quote.status, count: 1 });
      }
      return acc;
    }, []);
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = /* @__PURE__ */ new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const monthQuotes = approvedQuotes.filter((q) => {
        const qDate = new Date(q.createdAt);
        return qDate.getMonth() === date.getMonth() && qDate.getFullYear() === date.getFullYear();
      });
      const revenue = monthQuotes.reduce((sum, q) => sum + safeToNum(q.total), 0);
      monthlyRevenue.push({ month, revenue });
    }
    return res.json({
      totalQuotes,
      totalClients,
      totalRevenue: totalRevenue.toFixed(2),
      conversionRate,
      recentQuotes,
      topClients,
      quotesByStatus,
      monthlyRevenue
    });
  } catch (error) {
    logger.error("Analytics error:", error);
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }
});
router14.get("/:timeRange(\\d+)", authMiddleware, requireFeature("analytics_module"), requirePermission("analytics", "view"), async (req, res) => {
  try {
    const timeRange = req.params.timeRange ? Number(req.params.timeRange) : 12;
    const quotes2 = await storage.getAllQuotes();
    const clients3 = await storage.getAllClients();
    const cutoffDate = /* @__PURE__ */ new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - timeRange);
    const filteredQuotes = quotes2.filter((q) => new Date(q.createdAt) >= cutoffDate);
    const approvedQuotes = filteredQuotes.filter((q) => q.status === "approved" || q.status === "invoiced");
    const totalRevenue = approvedQuotes.reduce((sum, q) => sum + Number(q.total), 0);
    const avgQuoteValue = filteredQuotes.length > 0 ? (filteredQuotes.reduce((sum, q) => sum + Number(q.total), 0) / filteredQuotes.length).toFixed(2) : "0";
    const conversionRate = filteredQuotes.length > 0 ? (approvedQuotes.length / filteredQuotes.length * 100).toFixed(1) : "0";
    const monthlyData = [];
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = /* @__PURE__ */ new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const monthQuotes = filteredQuotes.filter((q) => {
        const qDate = new Date(q.createdAt);
        return qDate.getMonth() === date.getMonth() && qDate.getFullYear() === date.getFullYear();
      });
      const monthApproved = monthQuotes.filter((q) => q.status === "approved" || q.status === "invoiced");
      const revenue = monthApproved.reduce((sum, q) => sum + Number(q.total), 0);
      monthlyData.push({
        month,
        quotes: monthQuotes.length,
        revenue,
        conversions: monthApproved.length
      });
    }
    const clientRevenue = /* @__PURE__ */ new Map();
    for (const quote of approvedQuotes) {
      const client = await storage.getClient(quote.clientId);
      if (!client) continue;
      const existing = clientRevenue.get(client.id);
      if (existing) {
        existing.totalRevenue += Number(quote.total);
        existing.quoteCount += 1;
      } else {
        clientRevenue.set(client.id, {
          name: client.name,
          totalRevenue: Number(quote.total),
          quoteCount: 1
        });
      }
    }
    const topClients = Array.from(clientRevenue.values()).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10).map((c) => ({
      name: c.name,
      totalRevenue: c.totalRevenue.toFixed(2),
      quoteCount: c.quoteCount
    }));
    const statusBreakdown = filteredQuotes.reduce((acc, quote) => {
      const existing = acc.find((item) => item.status === quote.status);
      const value = Number(quote.total);
      if (existing) {
        existing.count += 1;
        existing.value += value;
      } else {
        acc.push({ status: quote.status, count: 1, value });
      }
      return acc;
    }, []);
    return res.json({
      overview: {
        totalQuotes: filteredQuotes.length,
        totalRevenue: totalRevenue.toFixed(2),
        avgQuoteValue,
        conversionRate
      },
      monthlyData,
      topClients,
      statusBreakdown
    });
  } catch (error) {
    logger.error("Analytics error:", error);
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }
});
router14.get("/forecast", authMiddleware, requireFeature("analytics_module"), requirePermission("analytics", "view"), async (req, res) => {
  try {
    const monthsAhead = req.query.months ? Number(req.query.months) : 3;
    const forecast = await analyticsService.getRevenueForecast(monthsAhead);
    return res.json(forecast);
  } catch (error) {
    logger.error("Forecast error:", error);
    return res.status(500).json({ error: "Failed to fetch forecast" });
  }
});
router14.get("/deal-distribution", authMiddleware, requireFeature("analytics_module"), requirePermission("analytics", "view"), async (req, res) => {
  try {
    const distribution = await analyticsService.getDealDistribution();
    return res.json(distribution);
  } catch (error) {
    logger.error("Deal distribution error:", error);
    return res.status(500).json({ error: "Failed to fetch deal distribution" });
  }
});
router14.get("/regional", authMiddleware, requireFeature("analytics_module"), requirePermission("analytics", "view"), async (req, res) => {
  try {
    const regionalData = await analyticsService.getRegionalDistribution();
    return res.json(regionalData);
  } catch (error) {
    logger.error("Regional data error:", error);
    return res.status(500).json({ error: "Failed to fetch regional data" });
  }
});
router14.post("/custom-report", authMiddleware, requireFeature("analytics_module"), requirePermission("analytics", "view"), async (req, res) => {
  try {
    const { startDate, endDate, status, minAmount, maxAmount } = req.body;
    const report = await analyticsService.getCustomReport({
      startDate: startDate ? new Date(startDate) : void 0,
      endDate: endDate ? new Date(endDate) : void 0,
      status,
      minAmount,
      maxAmount
    });
    return res.json(report);
  } catch (error) {
    logger.error("Custom report error:", error);
    return res.status(500).json({ error: "Failed to generate custom report" });
  }
});
router14.get("/pipeline", authMiddleware, requireFeature("analytics_module"), requirePermission("analytics", "view"), async (req, res) => {
  try {
    const pipeline = await analyticsService.getSalesPipeline();
    return res.json(pipeline);
  } catch (error) {
    logger.error("Pipeline error:", error);
    return res.status(500).json({ error: "Failed to fetch pipeline data" });
  }
});
router14.get("/client/:clientId/ltv", authMiddleware, requireFeature("analytics_module"), requirePermission("analytics", "view"), async (req, res) => {
  try {
    const ltv = await analyticsService.getClientLifetimeValue(req.params.clientId);
    return res.json(ltv);
  } catch (error) {
    logger.error("LTV error:", error);
    return res.status(500).json({ error: "Failed to fetch client LTV" });
  }
});
router14.get("/competitor-insights", authMiddleware, requireFeature("analytics_module"), requirePermission("analytics", "view"), async (req, res) => {
  try {
    const insights = await analyticsService.getCompetitorInsights();
    return res.json(insights);
  } catch (error) {
    logger.error("Competitor insights error:", error);
    return res.status(500).json({ error: "Failed to fetch competitor insights" });
  }
});
router14.get("/vendor-spend", authMiddleware, requireFeature("analytics_module"), requirePermission("analytics", "view"), async (req, res) => {
  try {
    const timeRange = req.query.timeRange ? Number(req.query.timeRange) : 12;
    const vendors2 = await storage.getAllVendors();
    const vendorPos = await storage.getAllVendorPos();
    const cutoffDate = /* @__PURE__ */ new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - timeRange);
    const filteredPos = vendorPos.filter((po) => new Date(po.createdAt) >= cutoffDate);
    const vendorSpend = /* @__PURE__ */ new Map();
    for (const po of filteredPos) {
      const vendor = vendors2.find((v) => v.id === po.vendorId);
      if (vendor) {
        const existing = vendorSpend.get(po.vendorId);
        const poTotal = Number(po.total);
        if (existing) {
          existing.totalSpend += poTotal;
          existing.poCount += 1;
        } else {
          vendorSpend.set(po.vendorId, {
            vendorId: po.vendorId,
            vendorName: vendor.name,
            totalSpend: poTotal,
            poCount: 1,
            status: po.status
          });
        }
      }
    }
    const topVendors = Array.from(vendorSpend.values()).sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 10).map((v) => ({
      vendorId: v.vendorId,
      vendorName: v.vendorName,
      totalSpend: v.totalSpend.toFixed(2),
      poCount: v.poCount,
      avgPoValue: (v.totalSpend / v.poCount).toFixed(2)
    }));
    const totalSpend = filteredPos.reduce((sum, po) => sum + Number(po.total), 0);
    const delayedPos = filteredPos.filter((po) => {
      if (po.status === "fulfilled" && po.expectedDeliveryDate && po.actualDeliveryDate) {
        return new Date(po.actualDeliveryDate) > new Date(po.expectedDeliveryDate);
      }
      if (po.status !== "fulfilled" && po.expectedDeliveryDate) {
        return /* @__PURE__ */ new Date() > new Date(po.expectedDeliveryDate);
      }
      return false;
    });
    const vendorPerformance = Array.from(vendorSpend.values()).map((v) => {
      const vendorPOs = filteredPos.filter((po) => po.vendorId === v.vendorId);
      const onTimePOs = vendorPOs.filter((po) => {
        if (po.status === "fulfilled" && po.expectedDeliveryDate && po.actualDeliveryDate) {
          return new Date(po.actualDeliveryDate) <= new Date(po.expectedDeliveryDate);
        }
        return false;
      });
      const fulfilledCount = vendorPOs.filter((po) => po.status === "fulfilled").length;
      const onTimeRate = fulfilledCount > 0 ? (onTimePOs.length / fulfilledCount * 100).toFixed(1) : "0";
      return {
        vendorName: v.vendorName,
        totalPOs: vendorPOs.length,
        fulfilledPOs: fulfilledCount,
        onTimeDeliveryRate: onTimeRate + "%",
        totalSpend: v.totalSpend.toFixed(2)
      };
    }).sort((a, b) => Number(b.totalSpend) - Number(a.totalSpend));
    return res.json({
      overview: {
        totalSpend: totalSpend.toFixed(2),
        totalPOs: filteredPos.length,
        activeVendors: vendorSpend.size,
        delayedPOs: delayedPos.length,
        avgPoValue: filteredPos.length > 0 ? (totalSpend / filteredPos.length).toFixed(2) : "0"
      },
      topVendors,
      vendorPerformance,
      procurementDelays: {
        count: delayedPos.length,
        percentage: filteredPos.length > 0 ? (delayedPos.length / filteredPos.length * 100).toFixed(1) : "0"
      }
    });
  } catch (error) {
    logger.error("Vendor analytics error:", error);
    return res.status(500).json({ error: "Failed to fetch vendor analytics" });
  }
});
router14.get("/export", authMiddleware, requireFeature("analytics_module"), requirePermission("analytics", "view"), async (req, res) => {
  try {
    const timeRange = req.query.timeRange || "12";
    let startDate;
    let endDate = /* @__PURE__ */ new Date();
    if (timeRange !== "all") {
      const months = parseInt(timeRange);
      if (!isNaN(months)) {
        startDate = /* @__PURE__ */ new Date();
        startDate.setMonth(startDate.getMonth() - months);
      }
    }
    const quotesList = await analyticsService.getCustomReport({ startDate, endDate });
    const pipelineData = await analyticsService.getSalesPipeline();
    const regionalData = await analyticsService.getRegionalDistribution();
    const totalQuotes = quotesList.length;
    const totalRevenue = quotesList.reduce((sum, q) => sum + q.totalAmount, 0);
    const avgDealSize = totalQuotes > 0 ? totalRevenue / totalQuotes : 0;
    const statusCounts = {};
    quotesList.forEach((q) => {
      statusCounts[q.status] = (statusCounts[q.status] || 0) + 1;
    });
    const workbook = new ExcelJS2.Workbook();
    workbook.creator = "T-Quoting Tool";
    workbook.created = /* @__PURE__ */ new Date();
    const summarySheet = workbook.addWorksheet("Overview");
    summarySheet.columns = [
      { header: "Metric", key: "metric", width: 25 },
      { header: "Value", key: "value", width: 25, style: { numFmt: "#,##0.00" } }
    ];
    summarySheet.addRows([
      { metric: "Report Date", value: (/* @__PURE__ */ new Date()).toLocaleDateString() },
      { metric: "Time Range", value: timeRange === "all" ? "All Time" : `Last ${timeRange} Months` },
      {},
      // Empty row
      { metric: "Total Quotes", value: totalQuotes },
      { metric: "Total Revenue", value: totalRevenue },
      { metric: "Average Deal Size", value: avgDealSize }
    ]);
    summarySheet.getRow(2).getCell("value").numFmt = "@";
    summarySheet.getRow(3).getCell("value").numFmt = "@";
    summarySheet.getRow(5).getCell("value").numFmt = "#,##0";
    summarySheet.getRow(6).getCell("value").numFmt = "#,##0.00";
    summarySheet.getRow(7).getCell("value").numFmt = "#,##0.00";
    summarySheet.getRow(1).font = { bold: true, size: 14 };
    summarySheet.getCell("A9").value = "Pipeline Stage";
    summarySheet.getCell("B9").value = "Count";
    summarySheet.getCell("C9").value = "Value";
    summarySheet.getCell("A9").font = { bold: true };
    summarySheet.getCell("B9").font = { bold: true };
    summarySheet.getCell("C9").font = { bold: true };
    let currentRow = 10;
    pipelineData.forEach((stage) => {
      summarySheet.getCell(`A${currentRow}`).value = stage.stage;
      summarySheet.getCell(`B${currentRow}`).value = stage.count;
      summarySheet.getCell(`C${currentRow}`).value = stage.totalValue;
      summarySheet.getCell(`C${currentRow}`).numFmt = "#,##0.00";
      currentRow++;
    });
    const regionSheet = workbook.addWorksheet("Regional Performance");
    regionSheet.columns = [
      { header: "Region", key: "region", width: 20 },
      { header: "Quotes", key: "count", width: 15, style: { numFmt: "#,##0" } },
      { header: "Revenue", key: "revenue", width: 20, style: { numFmt: "#,##0.00" } },
      { header: "Share (%)", key: "share", width: 15, style: { numFmt: '0.0"%"' } }
    ];
    regionSheet.getRow(1).font = { bold: true };
    regionalData.forEach((r) => {
      regionSheet.addRow({
        region: r.region,
        count: r.quoteCount,
        revenue: r.totalRevenue,
        share: r.percentage.toFixed(1)
      });
    });
    const quotesSheet = workbook.addWorksheet("Quote Details");
    quotesSheet.columns = [
      { header: "Quote Number", key: "quoteNumber", width: 20 },
      { header: "Client", key: "clientName", width: 30 },
      { header: "Status", key: "status", width: 15 },
      { header: "Amount", key: "totalAmount", width: 20, style: { numFmt: "#,##0.00" } },
      { header: "Date", key: "createdDate", width: 20 }
    ];
    quotesSheet.getRow(1).font = { bold: true };
    quotesList.forEach((q) => {
      quotesSheet.addRow({
        quoteNumber: q.quoteNumber,
        clientName: q.clientName,
        status: q.status,
        totalAmount: q.totalAmount,
        createdDate: new Date(q.createdDate).toLocaleDateString()
      });
    });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="Analytics_Report_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    logger.error("Error exporting analytics report:", error);
    res.status(500).json({ error: "Failed to export report" });
  }
});
router14.get("/sales-quotes", authMiddleware, requireFeature("dashboard_salesQuotes"), requirePermission("analytics", "view"), async (req, res) => {
  try {
    const allQuotes = await storage.getAllQuotes();
    const allClients = await storage.getAllClients();
    const quotesByStatus = {
      draft: 0,
      sent: 0,
      approved: 0,
      rejected: 0,
      invoiced: 0
    };
    const valueByStatus = {
      draft: 0,
      sent: 0,
      approved: 0,
      rejected: 0,
      invoiced: 0
    };
    allQuotes.forEach((quote) => {
      const status = quote.status;
      if (quotesByStatus.hasOwnProperty(status)) {
        quotesByStatus[status]++;
        valueByStatus[status] = add(valueByStatus[status], quote.total).toNumber();
      }
    });
    const sentQuotes = quotesByStatus.sent + quotesByStatus.approved + quotesByStatus.rejected;
    const conversionRate = sentQuotes > 0 ? quotesByStatus.approved / sentQuotes * 100 : 0;
    const totalValue = allQuotes.reduce((sum, q) => add(sum, q.total), toDecimal(0));
    const averageQuoteValue = allQuotes.length > 0 ? divide(totalValue, allQuotes.length).toNumber() : 0;
    const customerQuotes = /* @__PURE__ */ new Map();
    allQuotes.forEach((quote) => {
      const existing = customerQuotes.get(quote.clientId);
      const value = toDecimal(quote.total);
      if (existing) {
        existing.count++;
        existing.value = add(existing.value, value).toNumber();
      } else {
        const client = allClients.find((c) => c.id === quote.clientId);
        if (client) {
          customerQuotes.set(quote.clientId, {
            name: client.name,
            count: 1,
            value: value.toNumber()
          });
        }
      }
    });
    const topCustomers = Array.from(customerQuotes.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      quoteCount: data.count,
      totalValue: data.value
    })).sort((a, b) => b.totalValue - a.totalValue).slice(0, 10);
    const monthlyData = /* @__PURE__ */ new Map();
    allQuotes.forEach((quote) => {
      const date = new Date(quote.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const existing = monthlyData.get(monthKey);
      if (existing) {
        existing.quotes++;
        existing.value = add(existing.value, quote.total).toNumber();
        if (quote.status === "approved") existing.approved++;
      } else {
        monthlyData.set(monthKey, {
          quotes: 1,
          value: toDecimal(quote.total).toNumber(),
          approved: quote.status === "approved" ? 1 : 0
        });
      }
    });
    const monthlyTrend = Array.from(monthlyData.entries()).map(([month, data]) => ({ month, ...data })).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);
    res.json({
      quotesByStatus,
      valueByStatus,
      conversionRate,
      averageQuoteValue: Math.round(averageQuoteValue),
      totalQuoteValue: Math.round(totalValue.toNumber()),
      topCustomers,
      monthlyTrend
    });
  } catch (error) {
    logger.error("Error fetching sales analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});
router14.get("/vendor-po", authMiddleware, requireFeature("analytics_module"), requirePermission("analytics", "view"), async (req, res) => {
  try {
    const allPOs = await db.execute(sql11`
      SELECT * FROM vendor_purchase_orders ORDER BY created_at DESC
    `);
    const allVendors = await storage.getAllVendors();
    const posByStatus = {
      draft: 0,
      sent: 0,
      acknowledged: 0,
      fulfilled: 0,
      cancelled: 0
    };
    let totalPOValue = 0;
    allPOs.rows.forEach((po) => {
      const status = po.status;
      if (posByStatus.hasOwnProperty(status)) {
        posByStatus[status]++;
      }
      totalPOValue += parseFloat(po.total_amount || 0);
    });
    const averagePOValue = allPOs.rows.length > 0 ? totalPOValue / allPOs.rows.length : 0;
    const fulfillmentRate = allPOs.rows.length > 0 ? posByStatus.fulfilled / allPOs.rows.length * 100 : 0;
    const vendorSpend = /* @__PURE__ */ new Map();
    allPOs.rows.forEach((po) => {
      const existing = vendorSpend.get(po.vendor_id);
      const amount = toDecimal(po.total_amount);
      if (existing) {
        existing.spend = add(existing.spend, amount).toNumber();
        existing.count++;
      } else {
        const vendor = allVendors.find((v) => v.id === po.vendor_id);
        if (vendor) {
          vendorSpend.set(po.vendor_id, {
            name: vendor.name,
            spend: amount.toNumber(),
            count: 1
          });
        }
      }
    });
    const spendByVendor = Array.from(vendorSpend.entries()).map(([vendorId, data]) => ({
      vendorId,
      vendorName: data.name,
      totalSpend: Math.round(data.spend),
      poCount: data.count
    })).sort((a, b) => b.totalSpend - a.totalSpend);
    const monthlySpendMap = /* @__PURE__ */ new Map();
    allPOs.rows.forEach((po) => {
      const date = new Date(po.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const existing = monthlySpendMap.get(monthKey);
      const amount = toDecimal(po.total_amount);
      if (existing) {
        existing.spend = add(existing.spend, amount).toNumber();
        existing.count++;
      } else {
        monthlySpendMap.set(monthKey, { spend: amount.toNumber(), count: 1 });
      }
    });
    const monthlySpend = Array.from(monthlySpendMap.entries()).map(([month, data]) => ({ month, spend: Math.round(data.spend), poCount: data.count })).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);
    const poVsGrnVariance = [];
    res.json({
      posByStatus,
      totalPOValue: Math.round(totalPOValue),
      averagePOValue: Math.round(averagePOValue),
      spendByVendor,
      monthlySpend,
      poVsGrnVariance,
      fulfillmentRate
    });
  } catch (error) {
    logger.error("Error fetching PO analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});
router14.get("/invoice-collections", authMiddleware, requireFeature("analytics_module"), requirePermission("analytics", "view"), async (req, res) => {
  try {
    const allInvoices = await storage.getAllInvoices();
    const allClients = await storage.getAllClients();
    const invoicesByStatus = {
      draft: 0,
      sent: 0,
      partial: 0,
      paid: 0,
      overdue: 0
    };
    let totalOutstanding = 0;
    let totalPaid = 0;
    let overdueAmount = 0;
    let totalCollectionDays = 0;
    let paidInvoicesCount = 0;
    const now = /* @__PURE__ */ new Date();
    allInvoices.forEach((invoice) => {
      const paidAmt = toDecimal(invoice.paidAmount);
      const totalAmt = toDecimal(invoice.total);
      const remaining = subtract(totalAmt, paidAmt).toNumber();
      if (invoice.paymentStatus === "paid") {
        invoicesByStatus.paid++;
        totalPaid = add(totalPaid, totalAmt).toNumber();
        const invoiceDate = invoice.issueDate ? new Date(invoice.issueDate) : new Date(invoice.createdAt);
        const paidDate = invoice.lastPaymentDate ? new Date(invoice.lastPaymentDate) : new Date(invoice.updatedAt);
        const days = Math.floor((paidDate.getTime() - invoiceDate.getTime()) / (1e3 * 60 * 60 * 24));
        if (days >= 0) {
          totalCollectionDays += days;
          paidInvoicesCount++;
        }
      } else if (invoice.paymentStatus === "partial") {
        invoicesByStatus.partial++;
        totalOutstanding += remaining;
      } else if (invoice.paymentStatus === "overdue") {
        invoicesByStatus.overdue++;
        totalOutstanding += remaining;
        overdueAmount += remaining;
      } else if (invoice.paymentStatus === "pending") {
        const invoiceDate = new Date(invoice.createdAt);
        const daysSince = Math.floor((now.getTime() - invoiceDate.getTime()) / (1e3 * 60 * 60 * 24));
        if (daysSince > 30) {
          invoicesByStatus.overdue++;
          overdueAmount += remaining;
        } else {
          invoicesByStatus.sent++;
        }
        totalOutstanding += remaining;
      }
    });
    const averageCollectionDays = paidInvoicesCount > 0 ? Math.round(totalCollectionDays / paidInvoicesCount) : 0;
    const ageingBuckets = [
      { bucket: "0-30 days", count: 0, amount: 0 },
      { bucket: "31-60 days", count: 0, amount: 0 },
      { bucket: "61-90 days", count: 0, amount: 0 },
      { bucket: "90+ days", count: 0, amount: 0 }
    ];
    allInvoices.forEach((invoice) => {
      if (invoice.paymentStatus !== "paid") {
        const invoiceDate = new Date(invoice.createdAt);
        const days = Math.floor((now.getTime() - invoiceDate.getTime()) / (1e3 * 60 * 60 * 24));
        const remaining = subtract(invoice.total, invoice.paidAmount).toNumber();
        if (days <= 30) {
          ageingBuckets[0].count++;
          ageingBuckets[0].amount += remaining;
        } else if (days <= 60) {
          ageingBuckets[1].count++;
          ageingBuckets[1].amount += remaining;
        } else if (days <= 90) {
          ageingBuckets[2].count++;
          ageingBuckets[2].amount += remaining;
        } else {
          ageingBuckets[3].count++;
          ageingBuckets[3].amount += remaining;
        }
      }
    });
    ageingBuckets.forEach((bucket) => {
      bucket.amount = Math.round(bucket.amount);
    });
    const monthlyMap = /* @__PURE__ */ new Map();
    allInvoices.forEach((invoice) => {
      const date = new Date(invoice.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const existing = monthlyMap.get(monthKey);
      const totalAmt = toDecimal(invoice.total).toNumber();
      const paidAmt = toDecimal(invoice.paidAmount).toNumber();
      if (existing) {
        existing.invoiced += totalAmt;
        existing.collected += paidAmt;
      } else {
        monthlyMap.set(monthKey, {
          invoiced: totalAmt,
          collected: paidAmt
        });
      }
    });
    const monthlyCollections = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      invoiced: Math.round(data.invoiced),
      collected: Math.round(data.collected)
    })).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);
    const debtorMap = /* @__PURE__ */ new Map();
    allInvoices.forEach((invoice) => {
      const remaining = toDecimal(invoice.remainingAmount);
      const calcRemaining = subtract(invoice.total, invoice.paidAmount);
      const outstanding = Math.max(remaining.toNumber(), calcRemaining.toNumber());
      if (outstanding > 0 && invoice.clientId) {
        const existing = debtorMap.get(invoice.clientId);
        const invoiceDate = new Date(invoice.createdAt);
        const days = Math.floor((now.getTime() - invoiceDate.getTime()) / (1e3 * 60 * 60 * 24));
        if (existing) {
          existing.outstanding += outstanding;
          existing.count++;
          existing.oldestDays = Math.max(existing.oldestDays, days);
        } else {
          const client = allClients.find((c) => c.id === invoice.clientId);
          debtorMap.set(invoice.clientId, {
            name: client?.name || "Unknown Client",
            outstanding,
            count: 1,
            oldestDays: days
          });
        }
      }
    });
    const topDebtors = Array.from(debtorMap.entries()).map(([clientId, data]) => ({
      clientId,
      clientName: data.name,
      outstandingAmount: Math.round(data.outstanding),
      invoiceCount: data.count,
      oldestInvoiceDays: data.oldestDays
    })).sort((a, b) => b.outstandingAmount - a.outstandingAmount).slice(0, 20);
    res.json({
      invoicesByStatus,
      totalOutstanding: Math.round(totalOutstanding),
      totalPaid: Math.round(totalPaid),
      overdueAmount: Math.round(overdueAmount),
      averageCollectionDays,
      ageingBuckets,
      monthlyCollections,
      topDebtors
    });
  } catch (error) {
    logger.error("Error fetching invoice analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});
router14.get("/serial-tracking", authMiddleware, async (req, res) => {
  try {
    const serialNumbers2 = await db.execute(sql11`
      SELECT * FROM serial_numbers ORDER BY created_at DESC
    `);
    const totalSerials = serialNumbers2.rows.length;
    const serialsByStatus = {
      delivered: 0,
      in_stock: 0,
      returned: 0,
      defective: 0
    };
    serialNumbers2.rows.forEach((serial2) => {
      const status = serial2.status;
      if (serialsByStatus.hasOwnProperty(status)) {
        serialsByStatus[status]++;
      }
    });
    const serialsByProduct = [];
    const now = /* @__PURE__ */ new Date();
    const warrantyExpiring = serialNumbers2.rows.filter((serial2) => serial2.warranty_end_date).map((serial2) => {
      const endDate = new Date(serial2.warranty_end_date);
      const daysRemaining = Math.floor((endDate.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
      return {
        serialNumber: serial2.serial_number,
        productName: "Product",
        customerName: "Customer",
        warrantyEndDate: serial2.warranty_end_date,
        daysRemaining
      };
    }).filter((item) => item.daysRemaining > 0 && item.daysRemaining <= 90).sort((a, b) => a.daysRemaining - b.daysRemaining);
    res.json({
      totalSerials,
      serialsByProduct,
      warrantyExpiring,
      serialsByStatus
    });
  } catch (error) {
    logger.error("Error fetching serial tracking analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});
var analytics_routes_default = router14;

// server/routes/email-templates.routes.ts
import { Router as Router15 } from "express";
init_logger();
init_db();
init_schema();
import { eq as eq14 } from "drizzle-orm";

// server/services/email-template.service.ts
init_db();
init_schema();
init_logger();
import { eq as eq13, and as and5 } from "drizzle-orm";
var TEMPLATE_VARIABLES = {
  quote: [
    { name: "quote_number", description: "Quote reference number" },
    { name: "client_name", description: "Client company/person name" },
    { name: "client_email", description: "Client email address" },
    { name: "total", description: "Quote total amount" },
    { name: "valid_until", description: "Quote validity date" },
    { name: "company_name", description: "Your company name" },
    { name: "attention_to", description: "Attention to person" },
    { name: "currency", description: "Currency code (e.g., INR, USD)" }
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
    { name: "currency", description: "Currency code" }
  ],
  sales_order: [
    { name: "order_number", description: "Sales order number" },
    { name: "client_name", description: "Client company/person name" },
    { name: "client_email", description: "Client email address" },
    { name: "total", description: "Order total amount" },
    { name: "expected_delivery", description: "Expected delivery date" },
    { name: "company_name", description: "Your company name" },
    { name: "currency", description: "Currency code" }
  ],
  payment_reminder: [
    { name: "invoice_number", description: "Invoice reference number" },
    { name: "client_name", description: "Client company/person name" },
    { name: "remaining_amount", description: "Remaining balance" },
    { name: "due_date", description: "Payment due date" },
    { name: "days_overdue", description: "Number of days past due" },
    { name: "company_name", description: "Your company name" },
    { name: "currency", description: "Currency code" }
  ],
  password_reset: [
    { name: "user_name", description: "User's display name" },
    { name: "reset_link", description: "Password reset URL" },
    { name: "expiry_hours", description: "Hours until link expires" }
  ],
  welcome: [
    { name: "user_name", description: "User's display name" },
    { name: "login_url", description: "Application login URL" },
    { name: "company_name", description: "Your company name" }
  ]
};
var DEFAULT_TEMPLATES = {
  quote: {
    subject: "Quote {{quote_number}} from {{company_name}}",
    body: `<h2>Quote {{quote_number}}</h2>
<p>Dear {{client_name}},</p>
<p>Please find attached your quotation for the requested items/services.</p>
<p><strong>Total Amount:</strong> {{currency}} {{total}}</p>
<p><strong>Valid Until:</strong> {{valid_until}}</p>
<p>If you have any questions or require modifications, please don't hesitate to contact us.</p>
<p>Best regards,<br>{{company_name}}</p>`
  },
  invoice: {
    subject: "Invoice {{invoice_number}} from {{company_name}}",
    body: `<h2>Invoice {{invoice_number}}</h2>
<p>Dear {{client_name}},</p>
<p>Please find attached your invoice for recent services/products.</p>
<p><strong>Total Amount:</strong> {{currency}} {{total}}</p>
<p><strong>Due Date:</strong> {{due_date}}</p>
<p>Please process this invoice at your earliest convenience.</p>
<p>Best regards,<br>{{company_name}}</p>`
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
<p>Best regards,<br>{{company_name}}</p>`
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
<p>Best regards,<br>{{company_name}}</p>`
  },
  password_reset: {
    subject: "Password Reset Request",
    body: `<h2>Password Reset Request</h2>
<p>Hi {{user_name}},</p>
<p>You requested a password reset. Click the link below to reset your password:</p>
<p><a href="{{reset_link}}" style="display: inline-block; padding: 10px 20px; background-color: #0046FF; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
<p>This link will expire in {{expiry_hours}} hour(s).</p>
<p>If you didn't request this, you can safely ignore this email.</p>`
  },
  welcome: {
    subject: "Welcome to {{company_name}}!",
    body: `<h2>Welcome to {{company_name}}!</h2>
<p>Hi {{user_name}},</p>
<p>Your account has been successfully created. You can now login and start using the platform.</p>
<p><a href="{{login_url}}" style="display: inline-block; padding: 10px 20px; background-color: #0046FF; color: white; text-decoration: none; border-radius: 5px;">Login Now</a></p>
<p>If you have any questions, please don't hesitate to contact us.</p>
<p>Best regards,<br>{{company_name}} Team</p>`
  }
};
var EmailTemplateService = class {
  /**
   * Get active template by type (returns default if none found)
   */
  static async getTemplate(type) {
    try {
      const [template] = await db.select().from(emailTemplates).where(and5(
        eq13(emailTemplates.type, type),
        eq13(emailTemplates.isActive, true),
        eq13(emailTemplates.isDefault, true)
      )).limit(1);
      if (template) return template;
      const [anyTemplate] = await db.select().from(emailTemplates).where(and5(
        eq13(emailTemplates.type, type),
        eq13(emailTemplates.isActive, true)
      )).limit(1);
      return anyTemplate || null;
    } catch (error) {
      logger.error(`Error getting email template for type ${type}:`, error);
      return null;
    }
  }
  /**
   * Create a virtual template from defaults (for fallback)
   */
  static getDefaultTemplate(type) {
    return DEFAULT_TEMPLATES[type] || DEFAULT_TEMPLATES.quote;
  }
  /**
   * Render template with variable substitution
   */
  static renderTemplate(template, variables) {
    let subject = template.subject;
    let body = template.body;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      const safeValue = value !== void 0 ? String(value) : "";
      subject = subject.replace(regex, safeValue);
      body = body.replace(regex, safeValue);
    }
    body = body.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, varName, content) => {
      const value = variables[varName];
      return value && value !== "" && value !== "0" ? content : "";
    });
    return { subject, body };
  }
  /**
   * Get template and render with variables (with fallback)
   */
  static async renderTemplateByType(type, variables) {
    const template = await this.getTemplate(type);
    if (template) {
      return this.renderTemplate(
        { subject: template.subject, body: template.body },
        variables
      );
    }
    return this.renderTemplate(this.getDefaultTemplate(type), variables);
  }
  /**
   * Get available variables for a template type
   */
  static getAvailableVariables(type) {
    return TEMPLATE_VARIABLES[type] || [];
  }
  /**
   * Validate that template uses valid variables
   */
  static validateTemplate(templateContent, type) {
    const errors = [];
    const warnings = [];
    const validVars = TEMPLATE_VARIABLES[type].map((v) => v.name);
    const variablePattern = /\{\{(?!#|\/)([\w]+)\}\}/g;
    let match;
    while ((match = variablePattern.exec(templateContent)) !== null) {
      const varName = match[1];
      if (!validVars.includes(varName)) {
        warnings.push(`Unknown variable: {{${varName}}}. Available: ${validVars.join(", ")}`);
      }
    }
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
  static previewTemplate(template, type) {
    const sampleData = {
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
      expiry_hours: "1"
    };
    return this.renderTemplate(template, sampleData);
  }
  /**
   * Seed default templates for all types
   */
  static async seedDefaultTemplates(userId) {
    const types = [
      "quote",
      "invoice",
      "sales_order",
      "payment_reminder",
      "password_reset",
      "welcome"
    ];
    for (const type of types) {
      try {
        const [existing] = await db.select().from(emailTemplates).where(and5(
          eq13(emailTemplates.type, type),
          eq13(emailTemplates.isDefault, true)
        )).limit(1);
        if (existing) {
          logger.info(`Default email template for ${type} already exists, skipping`);
          continue;
        }
        const defaultTemplate = DEFAULT_TEMPLATES[type];
        const availableVars = TEMPLATE_VARIABLES[type];
        await db.insert(emailTemplates).values({
          name: `Default ${type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} Template`,
          type,
          subject: defaultTemplate.subject,
          body: defaultTemplate.body,
          availableVariables: JSON.stringify(availableVars),
          isActive: true,
          isDefault: true,
          createdBy: userId
        });
        logger.info(`Created default email template for ${type}`);
      } catch (error) {
        logger.error(`Error seeding email template for ${type}:`, error);
      }
    }
  }
};

// server/routes/email-templates.routes.ts
init_storage();
var router15 = Router15();
router15.get(
  "/",
  requireFeature("email_templates_module"),
  authMiddleware,
  async (req, res) => {
    try {
      const templates2 = await db.select().from(emailTemplates).orderBy(emailTemplates.type);
      res.json(templates2);
    } catch (error) {
      logger.error("Error fetching email templates:", error);
      res.status(500).json({ error: "Failed to fetch email templates" });
    }
  }
);
router15.get(
  "/types",
  requireFeature("email_templates_module"),
  authMiddleware,
  async (req, res) => {
    try {
      const types = Object.keys(TEMPLATE_VARIABLES).map((type) => ({
        type,
        variables: TEMPLATE_VARIABLES[type],
        defaultTemplate: DEFAULT_TEMPLATES[type]
      }));
      res.json(types);
    } catch (error) {
      logger.error("Error fetching template types:", error);
      res.status(500).json({ error: "Failed to fetch template types" });
    }
  }
);
router15.get(
  "/:id",
  requireFeature("email_templates_module"),
  authMiddleware,
  async (req, res) => {
    try {
      const [template] = await db.select().from(emailTemplates).where(eq14(emailTemplates.id, req.params.id)).limit(1);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      logger.error("Error fetching email template:", error);
      res.status(500).json({ error: "Failed to fetch email template" });
    }
  }
);
router15.get(
  "/type/:type",
  requireFeature("email_templates_module"),
  authMiddleware,
  async (req, res) => {
    try {
      const type = req.params.type;
      const template = await EmailTemplateService.getTemplate(type);
      if (!template) {
        const defaultTemplate = EmailTemplateService.getDefaultTemplate(type);
        return res.json({
          id: null,
          type,
          name: `Default ${type} Template`,
          subject: defaultTemplate.subject,
          body: defaultTemplate.body,
          isDefault: true,
          isActive: true,
          availableVariables: JSON.stringify(TEMPLATE_VARIABLES[type])
        });
      }
      res.json(template);
    } catch (error) {
      logger.error("Error fetching template by type:", error);
      res.status(500).json({ error: "Failed to fetch template" });
    }
  }
);
router15.post(
  "/",
  requireFeature("email_templates_module"),
  authMiddleware,
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can create email templates" });
      }
      const { name, type, subject, body, isActive, isDefault } = req.body;
      if (!name || !type || !subject || !body) {
        return res.status(400).json({ error: "Name, type, subject, and body are required" });
      }
      const validTypes = ["quote", "invoice", "sales_order", "payment_reminder", "password_reset", "welcome"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: `Invalid type. Must be one of: ${validTypes.join(", ")}` });
      }
      const validation = EmailTemplateService.validateTemplate(subject + body, type);
      if (!validation.valid) {
        return res.status(400).json({ error: "Template validation failed", details: validation.errors });
      }
      if (isDefault) {
        await db.update(emailTemplates).set({ isDefault: false }).where(eq14(emailTemplates.type, type));
      }
      const [template] = await db.insert(emailTemplates).values({
        name,
        type,
        subject,
        body,
        availableVariables: JSON.stringify(TEMPLATE_VARIABLES[type]),
        isActive: isActive ?? true,
        isDefault: isDefault ?? false,
        createdBy: req.user.id
      }).returning();
      await storage.createActivityLog({
        userId: req.user.id,
        action: "create_email_template",
        entityType: "email_template",
        entityId: template.id
      });
      res.status(201).json(template);
    } catch (error) {
      logger.error("Error creating email template:", error);
      res.status(500).json({ error: error.message || "Failed to create email template" });
    }
  }
);
router15.put(
  "/:id",
  requireFeature("email_templates_module"),
  authMiddleware,
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can update email templates" });
      }
      const [existing] = await db.select().from(emailTemplates).where(eq14(emailTemplates.id, req.params.id)).limit(1);
      if (!existing) {
        return res.status(404).json({ error: "Template not found" });
      }
      const { name, subject, body, isActive, isDefault } = req.body;
      const type = existing.type;
      if (subject || body) {
        const validation = EmailTemplateService.validateTemplate(
          (subject || existing.subject) + (body || existing.body),
          type
        );
        if (!validation.valid) {
          return res.status(400).json({ error: "Template validation failed", details: validation.errors });
        }
      }
      if (isDefault && !existing.isDefault) {
        await db.update(emailTemplates).set({ isDefault: false }).where(eq14(emailTemplates.type, existing.type));
      }
      const [template] = await db.update(emailTemplates).set({
        ...name !== void 0 && { name },
        ...subject !== void 0 && { subject },
        ...body !== void 0 && { body },
        ...isActive !== void 0 && { isActive },
        ...isDefault !== void 0 && { isDefault },
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq14(emailTemplates.id, req.params.id)).returning();
      await storage.createActivityLog({
        userId: req.user.id,
        action: "update_email_template",
        entityType: "email_template",
        entityId: template.id
      });
      res.json(template);
    } catch (error) {
      logger.error("Error updating email template:", error);
      res.status(500).json({ error: error.message || "Failed to update email template" });
    }
  }
);
router15.delete(
  "/:id",
  requireFeature("email_templates_module"),
  authMiddleware,
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can delete email templates" });
      }
      const [existing] = await db.select().from(emailTemplates).where(eq14(emailTemplates.id, req.params.id)).limit(1);
      if (!existing) {
        return res.status(404).json({ error: "Template not found" });
      }
      await db.delete(emailTemplates).where(eq14(emailTemplates.id, req.params.id));
      await storage.createActivityLog({
        userId: req.user.id,
        action: "delete_email_template",
        entityType: "email_template",
        entityId: req.params.id
      });
      res.json({ success: true });
    } catch (error) {
      logger.error("Error deleting email template:", error);
      res.status(500).json({ error: error.message || "Failed to delete email template" });
    }
  }
);
router15.post(
  "/:id/preview",
  requireFeature("email_templates_module"),
  authMiddleware,
  async (req, res) => {
    try {
      const [template] = await db.select().from(emailTemplates).where(eq14(emailTemplates.id, req.params.id)).limit(1);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      const preview = EmailTemplateService.previewTemplate(
        { subject: template.subject, body: template.body },
        template.type
      );
      res.json(preview);
    } catch (error) {
      logger.error("Error previewing template:", error);
      res.status(500).json({ error: "Failed to preview template" });
    }
  }
);
router15.post(
  "/preview-draft",
  requireFeature("email_templates_module"),
  authMiddleware,
  async (req, res) => {
    try {
      const { subject, body, type } = req.body;
      if (!subject || !body || !type) {
        return res.status(400).json({ error: "Subject, body, and type are required" });
      }
      const preview = EmailTemplateService.previewTemplate(
        { subject, body },
        type
      );
      const validation = EmailTemplateService.validateTemplate(subject + body, type);
      res.json({ ...preview, validation });
    } catch (error) {
      logger.error("Error previewing draft template:", error);
      res.status(500).json({ error: "Failed to preview template" });
    }
  }
);
router15.post(
  "/seed-defaults",
  requireFeature("email_templates_module"),
  authMiddleware,
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can seed default templates" });
      }
      await EmailTemplateService.seedDefaultTemplates(req.user.id);
      await storage.createActivityLog({
        userId: req.user.id,
        action: "seed_email_templates",
        entityType: "email_template",
        entityId: "system"
      });
      res.json({ success: true, message: "Default templates seeded successfully" });
    } catch (error) {
      logger.error("Error seeding default templates:", error);
      res.status(500).json({ error: error.message || "Failed to seed default templates" });
    }
  }
);
var email_templates_routes_default = router15;

// server/routes/notification.routes.ts
import { Router as Router16 } from "express";
var router16 = Router16();
router16.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadOnly = req.query.unreadOnly === "true";
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const notifications2 = await NotificationService.getNotifications({
      userId,
      unreadOnly,
      limit,
      offset
    });
    res.json({
      notifications: notifications2,
      pagination: {
        limit,
        offset,
        hasMore: notifications2.length === limit
      }
    });
  } catch (error) {
    console.error("[NotificationRoutes] Failed to get notifications:", error);
    res.status(500).json({ error: "Failed to get notifications" });
  }
});
router16.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await NotificationService.getUnreadCount(userId);
    res.json({ count });
  } catch (error) {
    console.error("[NotificationRoutes] Failed to get unread count:", error);
    res.status(500).json({ error: "Failed to get unread count" });
  }
});
router16.post("/:id/read", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
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
router16.post("/read-all", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await NotificationService.markAllAsRead(userId);
    res.json({ success: true, count });
  } catch (error) {
    console.error("[NotificationRoutes] Failed to mark all as read:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
});
router16.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
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
router16.delete("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await NotificationService.deleteAll(userId);
    res.json({ success: true, count });
  } catch (error) {
    console.error("[NotificationRoutes] Failed to delete all notifications:", error);
    res.status(500).json({ error: "Failed to delete all notifications" });
  }
});
var notificationRoutes = router16;

// server/routes/collaboration.routes.ts
import { Router as Router17 } from "express";
init_db();
init_schema();
import { eq as eq15, and as and7 } from "drizzle-orm";
var router17 = Router17();
router17.get("/:entityType/:entityId/presence", authMiddleware, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const collaborators = await WebSocketService.getCollaborators(entityType, entityId);
    res.json({
      entityType,
      entityId,
      collaborators,
      count: collaborators.length
    });
  } catch (error) {
    console.error("[CollaborationRoutes] Failed to get presence:", error);
    res.status(500).json({ error: "Failed to get collaboration presence" });
  }
});
router17.get("/:entityType/:entityId/is-editing", authMiddleware, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const userId = req.user.id;
    const sessions = await db.select({
      userId: collaborationSessions.userId,
      userName: users.name,
      isEditing: collaborationSessions.isEditing,
      cursorPosition: collaborationSessions.cursorPosition
    }).from(collaborationSessions).innerJoin(users, eq15(collaborationSessions.userId, users.id)).where(
      and7(
        eq15(collaborationSessions.entityType, entityType),
        eq15(collaborationSessions.entityId, entityId),
        eq15(collaborationSessions.isEditing, true)
      )
    );
    const othersEditing = sessions.filter((s) => s.userId !== userId);
    res.json({
      isBeingEdited: othersEditing.length > 0,
      editors: othersEditing.map((s) => ({
        userId: s.userId,
        userName: s.userName,
        cursorPosition: s.cursorPosition
      }))
    });
  } catch (error) {
    console.error("[CollaborationRoutes] Failed to check editing status:", error);
    res.status(500).json({ error: "Failed to check editing status" });
  }
});
router17.post("/:entityType/:entityId/heartbeat", authMiddleware, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const userId = req.user.id;
    await db.update(collaborationSessions).set({ lastActivity: /* @__PURE__ */ new Date() }).where(
      and7(
        eq15(collaborationSessions.entityType, entityType),
        eq15(collaborationSessions.entityId, entityId),
        eq15(collaborationSessions.userId, userId)
      )
    );
    res.json({ success: true });
  } catch (error) {
    console.error("[CollaborationRoutes] Failed to update heartbeat:", error);
    res.status(500).json({ error: "Failed to update heartbeat" });
  }
});
router17.get("/user/:userId/status", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const isOnline = WebSocketService.isUserOnline(userId);
    const connectionCount = WebSocketService.getUserConnectionCount(userId);
    res.json({
      userId,
      isOnline,
      connectionCount
    });
  } catch (error) {
    console.error("[CollaborationRoutes] Failed to get user status:", error);
    res.status(500).json({ error: "Failed to get user status" });
  }
});
router17.delete("/:entityType/:entityId/leave", authMiddleware, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const userId = req.user.id;
    await db.delete(collaborationSessions).where(
      and7(
        eq15(collaborationSessions.entityType, entityType),
        eq15(collaborationSessions.entityId, entityId),
        eq15(collaborationSessions.userId, userId)
      )
    );
    res.json({ success: true });
  } catch (error) {
    console.error("[CollaborationRoutes] Failed to leave session:", error);
    res.status(500).json({ error: "Failed to leave collaboration session" });
  }
});
var collaborationRoutes = router17;

// server/routes/credit-notes.routes.ts
import { Router as Router18 } from "express";
init_logger();
init_db();
init_schema();
init_numbering_service();
import { eq as eq16, desc as desc4 } from "drizzle-orm";
var router18 = Router18();
router18.get("/credit-notes", authMiddleware, requireFeature("creditNotes_module"), async (req, res) => {
  try {
    const creditNotes2 = await db.select().from(creditNotes).leftJoin(invoices, eq16(creditNotes.invoiceId, invoices.id)).leftJoin(clients, eq16(creditNotes.clientId, clients.id)).leftJoin(users, eq16(creditNotes.createdBy, users.id)).orderBy(desc4(creditNotes.createdAt));
    const formattedNotes = creditNotes2.map((row) => ({
      ...row.credit_notes,
      invoice: row.invoices ? {
        id: row.invoices.id,
        invoiceNumber: row.invoices.invoiceNumber
      } : null,
      client: row.clients ? {
        id: row.clients.id,
        name: row.clients.name,
        email: row.clients.email
      } : null,
      createdByUser: row.users ? {
        id: row.users.id,
        name: row.users.name
      } : null
    }));
    return res.json(formattedNotes);
  } catch (error) {
    logger.error("Get credit notes error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch credit notes" });
  }
});
router18.get("/credit-notes/:id", authMiddleware, requireFeature("creditNotes_module"), async (req, res) => {
  try {
    const [creditNote] = await db.select().from(creditNotes).where(eq16(creditNotes.id, req.params.id));
    if (!creditNote) {
      return res.status(404).json({ error: "Credit note not found" });
    }
    const items = await db.select().from(creditNoteItems).where(eq16(creditNoteItems.creditNoteId, req.params.id)).orderBy(creditNoteItems.sortOrder);
    let invoice = null;
    if (creditNote.invoiceId) {
      const [foundInvoice] = await db.select().from(invoices).where(eq16(invoices.id, creditNote.invoiceId));
      invoice = foundInvoice || null;
    }
    const [client] = await db.select().from(clients).where(eq16(clients.id, creditNote.clientId));
    const [creator] = await db.select().from(users).where(eq16(users.id, creditNote.createdBy));
    return res.json({
      ...creditNote,
      items,
      invoice: invoice ? {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        paidAmount: invoice.paidAmount,
        paymentStatus: invoice.paymentStatus
      } : null,
      client: client ? {
        id: client.id,
        name: client.name,
        email: client.email
      } : null,
      createdByUser: creator ? {
        id: creator.id,
        name: creator.name
      } : null
    });
  } catch (error) {
    logger.error("Get credit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch credit note" });
  }
});
router18.get("/invoices/:invoiceId/credit-notes", authMiddleware, requireFeature("creditNotes_module"), async (req, res) => {
  try {
    const creditNotes2 = await db.select().from(creditNotes).where(eq16(creditNotes.invoiceId, req.params.invoiceId)).orderBy(desc4(creditNotes.createdAt));
    return res.json(creditNotes2);
  } catch (error) {
    logger.error("Get invoice credit notes error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch credit notes" });
  }
});
router18.post("/credit-notes", authMiddleware, requireFeature("creditNotes_create"), requirePermission("credit_notes", "create"), async (req, res) => {
  try {
    const { invoiceId, clientId: directClientId, reason, items, notes, currency = "INR", cgst = "0", sgst = "0", igst = "0" } = req.body;
    if (!reason || !items || items.length === 0) {
      return res.status(400).json({ error: "Reason and at least one item are required" });
    }
    let resolvedClientId;
    let invoice = null;
    if (invoiceId) {
      const [foundInvoice] = await db.select().from(invoices).where(eq16(invoices.id, invoiceId));
      if (!foundInvoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      invoice = foundInvoice;
      resolvedClientId = invoice.clientId;
    } else if (directClientId) {
      const [client] = await db.select().from(clients).where(eq16(clients.id, directClientId));
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      resolvedClientId = directClientId;
    } else {
      return res.status(400).json({ error: "Either invoiceId or clientId is required" });
    }
    const creditNoteNumber = await NumberingService.generateCreditNoteNumber();
    let subtotal = toDecimal(0);
    for (const item of items) {
      const itemSubtotal = toDecimal(item.quantity).times(toDecimal(item.unitPrice));
      subtotal = subtotal.plus(itemSubtotal);
    }
    const total = subtotal.plus(toDecimal(cgst)).plus(toDecimal(sgst)).plus(toDecimal(igst));
    const result = await db.transaction(async (tx) => {
      const [creditNote] = await tx.insert(creditNotes).values({
        creditNoteNumber,
        invoiceId: invoiceId || null,
        clientId: resolvedClientId,
        status: "draft",
        issueDate: /* @__PURE__ */ new Date(),
        reason,
        currency,
        subtotal: toMoneyString(subtotal),
        cgst,
        sgst,
        igst,
        total: toMoneyString(total),
        notes,
        createdBy: req.user.id
      }).returning();
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemSubtotal = toDecimal(item.quantity).times(toDecimal(item.unitPrice));
        await tx.insert(creditNoteItems).values({
          creditNoteId: creditNote.id,
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: String(item.unitPrice),
          subtotal: toMoneyString(itemSubtotal),
          hsnSac: item.hsnSac || null,
          sortOrder: i
        });
      }
      await tx.insert(activityLogs).values({
        userId: req.user.id,
        action: "create_credit_note",
        entityType: "credit_note",
        entityId: creditNote.id,
        timestamp: /* @__PURE__ */ new Date()
      });
      return creditNote;
    });
    return res.status(201).json(result);
  } catch (error) {
    logger.error("Create credit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to create credit note" });
  }
});
router18.put("/credit-notes/:id", authMiddleware, requireFeature("creditNotes_edit"), requirePermission("credit_notes", "edit"), async (req, res) => {
  try {
    const { reason, items, notes, cgst = "0", sgst = "0", igst = "0", invoiceId } = req.body;
    const [existing] = await db.select().from(creditNotes).where(eq16(creditNotes.id, req.params.id));
    if (!existing) {
      return res.status(404).json({ error: "Credit note not found" });
    }
    if (existing.status !== "draft") {
      return res.status(400).json({ error: "Only draft credit notes can be edited" });
    }
    let subtotal = toDecimal(0);
    if (items) {
      for (const item of items) {
        const itemSubtotal = toDecimal(item.quantity).times(toDecimal(item.unitPrice));
        subtotal = subtotal.plus(itemSubtotal);
      }
    }
    let finalInvoiceId = existing.invoiceId;
    if (invoiceId !== void 0) {
      if (invoiceId === null) {
        finalInvoiceId = null;
      } else {
        const [targetInvoice] = await db.select().from(invoices).where(eq16(invoices.id, invoiceId));
        if (!targetInvoice) {
          return res.status(404).json({ error: "Target invoice not found" });
        }
        if (targetInvoice.clientId !== existing.clientId) {
          return res.status(400).json({ error: "Target invoice must belong to the same client" });
        }
        finalInvoiceId = invoiceId;
      }
    }
    const total = subtotal.plus(toDecimal(cgst)).plus(toDecimal(sgst)).plus(toDecimal(igst));
    const result = await db.transaction(async (tx) => {
      const [updated] = await tx.update(creditNotes).set({
        reason: reason || existing.reason,
        invoiceId: finalInvoiceId,
        notes: notes !== void 0 ? notes : existing.notes,
        cgst,
        sgst,
        igst,
        subtotal: toMoneyString(subtotal),
        total: toMoneyString(total),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq16(creditNotes.id, req.params.id)).returning();
      if (items) {
        await tx.delete(creditNoteItems).where(eq16(creditNoteItems.creditNoteId, req.params.id));
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemSubtotal = toDecimal(item.quantity).times(toDecimal(item.unitPrice));
          await tx.insert(creditNoteItems).values({
            creditNoteId: req.params.id,
            productId: item.productId || null,
            description: item.description,
            quantity: item.quantity,
            unitPrice: String(item.unitPrice),
            subtotal: toMoneyString(itemSubtotal),
            hsnSac: item.hsnSac || null,
            sortOrder: i
          });
        }
      }
      await tx.insert(activityLogs).values({
        userId: req.user.id,
        action: "update_credit_note",
        entityType: "credit_note",
        entityId: req.params.id,
        timestamp: /* @__PURE__ */ new Date()
      });
      return updated;
    });
    return res.json(result);
  } catch (error) {
    logger.error("Update credit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to update credit note" });
  }
});
router18.delete("/credit-notes/:id", authMiddleware, requireFeature("creditNotes_delete"), requirePermission("credit_notes", "delete"), async (req, res) => {
  try {
    const [existing] = await db.select().from(creditNotes).where(eq16(creditNotes.id, req.params.id));
    if (!existing) {
      return res.status(404).json({ error: "Credit note not found" });
    }
    if (existing.status !== "draft") {
      return res.status(400).json({ error: "Only draft credit notes can be deleted" });
    }
    await db.transaction(async (tx) => {
      await tx.delete(creditNoteItems).where(eq16(creditNoteItems.creditNoteId, req.params.id));
      await tx.delete(creditNotes).where(eq16(creditNotes.id, req.params.id));
      await tx.insert(activityLogs).values({
        userId: req.user.id,
        action: "delete_credit_note",
        entityType: "credit_note",
        entityId: req.params.id,
        timestamp: /* @__PURE__ */ new Date()
      });
    });
    return res.json({ success: true });
  } catch (error) {
    logger.error("Delete credit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to delete credit note" });
  }
});
router18.post("/credit-notes/:id/issue", authMiddleware, requireFeature("creditNotes_issue"), requirePermission("credit_notes", "edit"), async (req, res) => {
  try {
    const [existing] = await db.select().from(creditNotes).where(eq16(creditNotes.id, req.params.id));
    if (!existing) {
      return res.status(404).json({ error: "Credit note not found" });
    }
    if (existing.status !== "draft") {
      return res.status(400).json({ error: "Credit note has already been issued" });
    }
    const result = await db.transaction(async (tx) => {
      const [updated] = await tx.update(creditNotes).set({
        status: "issued",
        issueDate: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq16(creditNotes.id, req.params.id)).returning();
      await tx.insert(activityLogs).values({
        userId: req.user.id,
        action: "issue_credit_note",
        entityType: "credit_note",
        entityId: req.params.id,
        timestamp: /* @__PURE__ */ new Date()
      });
      return updated;
    });
    return res.json(result);
  } catch (error) {
    logger.error("Issue credit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to issue credit note" });
  }
});
router18.post("/credit-notes/:id/apply", authMiddleware, requireFeature("creditNotes_apply"), requirePermission("credit_notes", "edit"), async (req, res) => {
  try {
    const [creditNote] = await db.select().from(creditNotes).where(eq16(creditNotes.id, req.params.id));
    if (!creditNote) {
      return res.status(404).json({ error: "Credit note not found" });
    }
    if (creditNote.status !== "issued") {
      return res.status(400).json({ error: "Credit note must be issued before applying" });
    }
    if (!creditNote.invoiceId) {
      return res.status(400).json({ error: "Cannot apply a standalone credit note without an invoice" });
    }
    const [invoice] = await db.select().from(invoices).where(eq16(invoices.id, creditNote.invoiceId));
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    const creditAmount = toDecimal(creditNote.total);
    const currentPaid = toDecimal(invoice.paidAmount);
    const invoiceTotal = toDecimal(invoice.total);
    const newPaidAmount = currentPaid.plus(creditAmount);
    const newRemainingAmount = invoiceTotal.minus(newPaidAmount);
    let newPaymentStatus = invoice.paymentStatus || "pending";
    if (moneyGte(newPaidAmount, invoiceTotal)) {
      newPaymentStatus = "paid";
    } else if (moneyGt(newPaidAmount, 0)) {
      newPaymentStatus = "partial";
    }
    const result = await db.transaction(async (tx) => {
      const [updatedCreditNote] = await tx.update(creditNotes).set({
        status: "applied",
        appliedAmount: creditNote.total,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq16(creditNotes.id, req.params.id)).returning();
      await tx.update(invoices).set({
        paidAmount: toMoneyString(newPaidAmount),
        remainingAmount: toMoneyString(newRemainingAmount.isNegative() ? toDecimal(0) : newRemainingAmount),
        paymentStatus: newPaymentStatus,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq16(invoices.id, creditNote.invoiceId));
      await tx.insert(activityLogs).values({
        userId: req.user.id,
        action: "apply_credit_note",
        entityType: "credit_note",
        entityId: req.params.id,
        timestamp: /* @__PURE__ */ new Date()
      });
      return updatedCreditNote;
    });
    return res.json(result);
  } catch (error) {
    logger.error("Apply credit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to apply credit note" });
  }
});
router18.post("/credit-notes/:id/cancel", authMiddleware, requireFeature("creditNotes_edit"), requirePermission("credit_notes", "edit"), async (req, res) => {
  try {
    const [existing] = await db.select().from(creditNotes).where(eq16(creditNotes.id, req.params.id));
    if (!existing) {
      return res.status(404).json({ error: "Credit note not found" });
    }
    if (existing.status === "applied") {
      return res.status(400).json({ error: "Applied credit notes cannot be cancelled" });
    }
    if (existing.status === "cancelled") {
      return res.status(400).json({ error: "Credit note is already cancelled" });
    }
    const result = await db.transaction(async (tx) => {
      const [updated] = await tx.update(creditNotes).set({
        status: "cancelled",
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq16(creditNotes.id, req.params.id)).returning();
      await tx.insert(activityLogs).values({
        userId: req.user.id,
        action: "cancel_credit_note",
        entityType: "credit_note",
        entityId: req.params.id,
        timestamp: /* @__PURE__ */ new Date()
      });
      return updated;
    });
    return res.json(result);
  } catch (error) {
    logger.error("Cancel credit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to cancel credit note" });
  }
});
var credit_notes_routes_default = router18;

// server/routes/debit-notes.routes.ts
import { Router as Router19 } from "express";
init_logger();
init_db();
init_schema();
init_numbering_service();
import { eq as eq17, desc as desc5 } from "drizzle-orm";
var router19 = Router19();
router19.get("/debit-notes", authMiddleware, requireFeature("debitNotes_module"), async (req, res) => {
  try {
    const debitNotes2 = await db.select().from(debitNotes).leftJoin(invoices, eq17(debitNotes.invoiceId, invoices.id)).leftJoin(clients, eq17(debitNotes.clientId, clients.id)).leftJoin(users, eq17(debitNotes.createdBy, users.id)).orderBy(desc5(debitNotes.createdAt));
    const formattedNotes = debitNotes2.map((row) => ({
      ...row.debit_notes,
      invoice: row.invoices ? {
        id: row.invoices.id,
        invoiceNumber: row.invoices.invoiceNumber
      } : null,
      client: row.clients ? {
        id: row.clients.id,
        name: row.clients.name,
        email: row.clients.email
      } : null,
      createdByUser: row.users ? {
        id: row.users.id,
        name: row.users.name
      } : null
    }));
    return res.json(formattedNotes);
  } catch (error) {
    logger.error("Get debit notes error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch debit notes" });
  }
});
router19.get("/debit-notes/:id", authMiddleware, requireFeature("debitNotes_module"), async (req, res) => {
  try {
    const [debitNote] = await db.select().from(debitNotes).where(eq17(debitNotes.id, req.params.id));
    if (!debitNote) {
      return res.status(404).json({ error: "Debit note not found" });
    }
    const items = await db.select().from(debitNoteItems).where(eq17(debitNoteItems.debitNoteId, req.params.id)).orderBy(debitNoteItems.sortOrder);
    let invoice = null;
    if (debitNote.invoiceId) {
      const [foundInvoice] = await db.select().from(invoices).where(eq17(invoices.id, debitNote.invoiceId));
      invoice = foundInvoice || null;
    }
    const [client] = await db.select().from(clients).where(eq17(clients.id, debitNote.clientId));
    const [creator] = await db.select().from(users).where(eq17(users.id, debitNote.createdBy));
    return res.json({
      ...debitNote,
      items,
      invoice: invoice ? {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        paidAmount: invoice.paidAmount,
        paymentStatus: invoice.paymentStatus
      } : null,
      client: client ? {
        id: client.id,
        name: client.name,
        email: client.email
      } : null,
      createdByUser: creator ? {
        id: creator.id,
        name: creator.name
      } : null
    });
  } catch (error) {
    logger.error("Get debit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch debit note" });
  }
});
router19.get("/invoices/:invoiceId/debit-notes", authMiddleware, requireFeature("debitNotes_module"), async (req, res) => {
  try {
    const debitNotes2 = await db.select().from(debitNotes).where(eq17(debitNotes.invoiceId, req.params.invoiceId)).orderBy(desc5(debitNotes.createdAt));
    return res.json(debitNotes2);
  } catch (error) {
    logger.error("Get invoice debit notes error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch debit notes" });
  }
});
router19.post("/debit-notes", authMiddleware, requireFeature("debitNotes_create"), requirePermission("debit_notes", "create"), async (req, res) => {
  try {
    const { invoiceId, reason, items, notes, currency = "INR", cgst = "0", sgst = "0", igst = "0" } = req.body;
    if (!reason || !items || items.length === 0) {
      return res.status(400).json({ error: "Reason and at least one item are required" });
    }
    let resolvedClientId;
    let invoice = null;
    if (invoiceId) {
      const [foundInvoice] = await db.select().from(invoices).where(eq17(invoices.id, invoiceId));
      if (!foundInvoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      invoice = foundInvoice;
      resolvedClientId = invoice.clientId;
    } else if (req.body.clientId) {
      const [client] = await db.select().from(clients).where(eq17(clients.id, req.body.clientId));
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      resolvedClientId = req.body.clientId;
    } else {
      return res.status(400).json({ error: "Either invoiceId or clientId is required" });
    }
    const debitNoteNumber = await NumberingService.generateDebitNoteNumber();
    let subtotal = toDecimal(0);
    for (const item of items) {
      const itemSubtotal = toDecimal(item.quantity).times(toDecimal(item.unitPrice));
      subtotal = subtotal.plus(itemSubtotal);
    }
    const total = subtotal.plus(toDecimal(cgst)).plus(toDecimal(sgst)).plus(toDecimal(igst));
    const result = await db.transaction(async (tx) => {
      const [debitNote] = await tx.insert(debitNotes).values({
        debitNoteNumber,
        invoiceId: invoiceId || null,
        clientId: resolvedClientId,
        status: "draft",
        issueDate: /* @__PURE__ */ new Date(),
        reason,
        currency,
        subtotal: toMoneyString(subtotal),
        cgst,
        sgst,
        igst,
        total: toMoneyString(total),
        notes,
        createdBy: req.user.id
      }).returning();
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemSubtotal = toDecimal(item.quantity).times(toDecimal(item.unitPrice));
        await tx.insert(debitNoteItems).values({
          debitNoteId: debitNote.id,
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: String(item.unitPrice),
          subtotal: toMoneyString(itemSubtotal),
          hsnSac: item.hsnSac || null,
          sortOrder: i
        });
      }
      await tx.insert(activityLogs).values({
        userId: req.user.id,
        action: "create_debit_note",
        entityType: "debit_note",
        entityId: debitNote.id,
        timestamp: /* @__PURE__ */ new Date()
      });
      return debitNote;
    });
    return res.status(201).json(result);
  } catch (error) {
    logger.error("Create debit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to create debit note" });
  }
});
router19.put("/debit-notes/:id", authMiddleware, requireFeature("debitNotes_edit"), requirePermission("debit_notes", "edit"), async (req, res) => {
  try {
    const { reason, items, notes, cgst = "0", sgst = "0", igst = "0", invoiceId } = req.body;
    const [existing] = await db.select().from(debitNotes).where(eq17(debitNotes.id, req.params.id));
    if (!existing) {
      return res.status(404).json({ error: "Debit note not found" });
    }
    if (existing.status !== "draft") {
      return res.status(400).json({ error: "Only draft debit notes can be edited" });
    }
    let subtotal = toDecimal(0);
    if (items) {
      for (const item of items) {
        const itemSubtotal = toDecimal(item.quantity).times(toDecimal(item.unitPrice));
        subtotal = subtotal.plus(itemSubtotal);
      }
    }
    let finalInvoiceId = existing.invoiceId;
    if (invoiceId !== void 0) {
      if (invoiceId === null) {
        finalInvoiceId = null;
      } else {
        const [targetInvoice] = await db.select().from(invoices).where(eq17(invoices.id, invoiceId));
        if (!targetInvoice) {
          return res.status(404).json({ error: "Target invoice not found" });
        }
        if (targetInvoice.clientId !== existing.clientId) {
          return res.status(400).json({ error: "Target invoice must belong to the same client" });
        }
        finalInvoiceId = invoiceId;
      }
    }
    const total = subtotal.plus(toDecimal(cgst)).plus(toDecimal(sgst)).plus(toDecimal(igst));
    const result = await db.transaction(async (tx) => {
      const [updated] = await tx.update(debitNotes).set({
        reason: reason || existing.reason,
        invoiceId: finalInvoiceId,
        notes: notes !== void 0 ? notes : existing.notes,
        cgst,
        sgst,
        igst,
        subtotal: toMoneyString(subtotal),
        total: toMoneyString(total),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq17(debitNotes.id, req.params.id)).returning();
      if (items) {
        await tx.delete(debitNoteItems).where(eq17(debitNoteItems.debitNoteId, req.params.id));
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemSubtotal = toDecimal(item.quantity).times(toDecimal(item.unitPrice));
          await tx.insert(debitNoteItems).values({
            debitNoteId: req.params.id,
            productId: item.productId || null,
            description: item.description,
            quantity: item.quantity,
            unitPrice: String(item.unitPrice),
            subtotal: toMoneyString(itemSubtotal),
            hsnSac: item.hsnSac || null,
            sortOrder: i
          });
        }
      }
      await tx.insert(activityLogs).values({
        userId: req.user.id,
        action: "update_debit_note",
        entityType: "debit_note",
        entityId: req.params.id,
        timestamp: /* @__PURE__ */ new Date()
      });
      return updated;
    });
    return res.json(result);
  } catch (error) {
    logger.error("Update debit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to update debit note" });
  }
});
router19.delete("/debit-notes/:id", authMiddleware, requireFeature("debitNotes_delete"), requirePermission("debit_notes", "delete"), async (req, res) => {
  try {
    const [existing] = await db.select().from(debitNotes).where(eq17(debitNotes.id, req.params.id));
    if (!existing) {
      return res.status(404).json({ error: "Debit note not found" });
    }
    if (existing.status !== "draft") {
      return res.status(400).json({ error: "Only draft debit notes can be deleted" });
    }
    await db.transaction(async (tx) => {
      await tx.delete(debitNoteItems).where(eq17(debitNoteItems.debitNoteId, req.params.id));
      await tx.delete(debitNotes).where(eq17(debitNotes.id, req.params.id));
      await tx.insert(activityLogs).values({
        userId: req.user.id,
        action: "delete_debit_note",
        entityType: "debit_note",
        entityId: req.params.id,
        timestamp: /* @__PURE__ */ new Date()
      });
    });
    return res.json({ success: true });
  } catch (error) {
    logger.error("Delete debit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to delete debit note" });
  }
});
router19.post("/debit-notes/:id/issue", authMiddleware, requireFeature("debitNotes_issue"), requirePermission("debit_notes", "edit"), async (req, res) => {
  try {
    const [existing] = await db.select().from(debitNotes).where(eq17(debitNotes.id, req.params.id));
    if (!existing) {
      return res.status(404).json({ error: "Debit note not found" });
    }
    if (existing.status !== "draft") {
      return res.status(400).json({ error: "Debit note has already been issued" });
    }
    const result = await db.transaction(async (tx) => {
      const [updated] = await tx.update(debitNotes).set({
        status: "issued",
        issueDate: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq17(debitNotes.id, req.params.id)).returning();
      await tx.insert(activityLogs).values({
        userId: req.user.id,
        action: "issue_debit_note",
        entityType: "debit_note",
        entityId: req.params.id,
        timestamp: /* @__PURE__ */ new Date()
      });
      return updated;
    });
    return res.json(result);
  } catch (error) {
    logger.error("Issue debit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to issue debit note" });
  }
});
router19.post("/debit-notes/:id/apply", authMiddleware, requireFeature("debitNotes_apply"), requirePermission("debit_notes", "edit"), async (req, res) => {
  try {
    const [debitNote] = await db.select().from(debitNotes).where(eq17(debitNotes.id, req.params.id));
    if (!debitNote) {
      return res.status(404).json({ error: "Debit note not found" });
    }
    if (debitNote.status !== "issued") {
      return res.status(400).json({ error: "Debit note must be issued before applying" });
    }
    if (!debitNote.invoiceId) {
      return res.status(400).json({ error: "Cannot apply a standalone debit note without an invoice" });
    }
    const [invoice] = await db.select().from(invoices).where(eq17(invoices.id, debitNote.invoiceId));
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    const debitAmount = toDecimal(debitNote.total);
    const invoiceTotal = toDecimal(invoice.total);
    const currentPaid = toDecimal(invoice.paidAmount);
    const newInvoiceTotal = invoiceTotal.plus(debitAmount);
    const newRemainingAmount = newInvoiceTotal.minus(currentPaid);
    let newPaymentStatus = invoice.paymentStatus || "pending";
    if (moneyGte(currentPaid, newInvoiceTotal)) {
      newPaymentStatus = "paid";
    } else if (moneyGt(currentPaid, 0)) {
      newPaymentStatus = "partial";
    } else {
      newPaymentStatus = "pending";
    }
    const result = await db.transaction(async (tx) => {
      const [updatedDebitNote] = await tx.update(debitNotes).set({
        status: "applied",
        appliedAmount: debitNote.total,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq17(debitNotes.id, req.params.id)).returning();
      await tx.update(invoices).set({
        total: toMoneyString(newInvoiceTotal),
        remainingAmount: toMoneyString(newRemainingAmount),
        paymentStatus: newPaymentStatus,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq17(invoices.id, debitNote.invoiceId));
      await tx.insert(activityLogs).values({
        userId: req.user.id,
        action: "apply_debit_note",
        entityType: "debit_note",
        entityId: req.params.id,
        timestamp: /* @__PURE__ */ new Date()
      });
      return updatedDebitNote;
    });
    return res.json(result);
  } catch (error) {
    logger.error("Apply debit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to apply debit note" });
  }
});
router19.post("/debit-notes/:id/cancel", authMiddleware, requireFeature("debitNotes_edit"), requirePermission("debit_notes", "edit"), async (req, res) => {
  try {
    const [existing] = await db.select().from(debitNotes).where(eq17(debitNotes.id, req.params.id));
    if (!existing) {
      return res.status(404).json({ error: "Debit note not found" });
    }
    if (existing.status === "applied") {
      return res.status(400).json({ error: "Applied debit notes cannot be cancelled" });
    }
    if (existing.status === "cancelled") {
      return res.status(400).json({ error: "Debit note is already cancelled" });
    }
    const result = await db.transaction(async (tx) => {
      const [updated] = await tx.update(debitNotes).set({
        status: "cancelled",
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq17(debitNotes.id, req.params.id)).returning();
      await tx.insert(activityLogs).values({
        userId: req.user.id,
        action: "cancel_debit_note",
        entityType: "debit_note",
        entityId: req.params.id,
        timestamp: /* @__PURE__ */ new Date()
      });
      return updated;
    });
    return res.json(result);
  } catch (error) {
    logger.error("Cancel debit note error:", error);
    return res.status(500).json({ error: error.message || "Failed to cancel debit note" });
  }
});
var debit_notes_routes_default = router19;

// server/routes/subscriptions.routes.ts
import { Router as Router20 } from "express";
init_logger();

// server/services/subscription.service.ts
init_db();
init_schema();
init_numbering_service();
init_logger();
import { eq as eq18, and as and10, lte } from "drizzle-orm";
import { addMonths, addYears, startOfDay, differenceInDays } from "date-fns";
init_feature_flags();
var SubscriptionService = class {
  /**
   * Get all subscriptions
   */
  static async getAllSubscriptions() {
    return await db.query.subscriptions.findMany({
      with: {
        client: true
      },
      orderBy: (subscriptions2, { desc: desc6 }) => [desc6(subscriptions2.createdAt)]
    });
  }
  /**
   * Get subscription by ID
   */
  static async getSubscriptionById(id) {
    return await db.query.subscriptions.findFirst({
      where: eq18(subscriptions.id, id),
      with: {
        client: true,
        invoices: {
          orderBy: (invoices2, { desc: desc6 }) => [desc6(invoices2.issueDate)]
        }
      }
    });
  }
  /**
   * Create a new subscription
   */
  static async createSubscription(data, userId) {
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const subNumber = `SUB-${year}-${Math.floor(Math.random() * 1e4).toString().padStart(4, "0")}`;
    console.log(`[SubscriptionService] Creating subscription. Payload:`, JSON.stringify(data, null, 2));
    const startDate = new Date(data.startDate);
    console.log(`[SubscriptionService] Parsed Start Date: ${startDate.toISOString()}`);
    const [newSubscription] = await db.insert(subscriptions).values({
      clientId: data.clientId,
      planName: data.planName,
      billingCycle: data.billingCycle,
      startDate,
      nextBillingDate: startDate,
      amount: data.amount,
      // Ensure decimal/string format is handled by driver
      currency: data.currency,
      itemsSnapshot: data.itemsSnapshot,
      notes: data.notes,
      autoRenew: data.autoRenew !== void 0 ? data.autoRenew : true,
      subscriptionNumber: subNumber,
      status: "active",
      createdBy: userId
    }).returning();
    if (newSubscription.status === "active" && newSubscription.nextBillingDate <= /* @__PURE__ */ new Date()) {
      logger.info(`[SubscriptionService] New subscription ${newSubscription.id} starts in past/today. Processing immediate renewal.`);
      const subWithClient = await db.query.subscriptions.findFirst({
        where: eq18(subscriptions.id, newSubscription.id),
        with: { client: true }
      });
      if (subWithClient) {
        await this.processSubscriptionRenewal(subWithClient);
      }
    }
    return newSubscription;
  }
  /**
   * Update subscription
   */
  static async updateSubscription(id, data) {
    const [updated] = await db.update(subscriptions).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq18(subscriptions.id, id)).returning();
    return updated;
  }
  /**
   * Cancel subscription
   */
  static async cancelSubscription(id) {
    const [updated] = await db.update(subscriptions).set({ status: "cancelled", autoRenew: false, updatedAt: /* @__PURE__ */ new Date() }).where(eq18(subscriptions.id, id)).returning();
    return updated;
  }
  /**
   * Process due subscriptions and generate invoices
   */
  static async processDueSubscriptions() {
    const today = startOfDay(/* @__PURE__ */ new Date());
    const dueSubscriptions = await db.query.subscriptions.findMany({
      where: and10(
        eq18(subscriptions.status, "active"),
        lte(subscriptions.nextBillingDate, today)
      ),
      with: {
        client: true
      }
    });
    logger.info(`[SubscriptionService] Found ${dueSubscriptions.length} due subscriptions.`);
    const results = [];
    for (const sub of dueSubscriptions) {
      const result = await this.processSubscriptionRenewal(sub);
      results.push(result);
    }
    return results;
  }
  /**
   * Process subscription renewal(s) until up to date
   */
  static async processSubscriptionRenewal(sub) {
    const MAX_CYCLES = 12;
    let cyclesProcessed = 0;
    let currentNextBilling = new Date(sub.nextBillingDate);
    const today = startOfDay(/* @__PURE__ */ new Date());
    const results = [];
    while (currentNextBilling <= today && cyclesProcessed < MAX_CYCLES) {
      cyclesProcessed++;
      try {
        console.log(`[SubscriptionService] Processing renewal cycle #${cyclesProcessed} for ${sub.id}. Current Billing: ${currentNextBilling.toISOString()}`);
        const invoice = await this.generateInvoiceForSubscription(sub);
        const nextDate = this.calculateNextBillingDate(currentNextBilling, sub.billingCycle);
        console.log(`[SubscriptionService] New Next Date: ${nextDate.toISOString()}`);
        await db.update(subscriptions).set({
          nextBillingDate: nextDate,
          lastInvoiceDate: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq18(subscriptions.id, sub.id));
        if (isFeatureEnabled("email_subscriptionRenewed")) {
          if (sub.client && sub.client.email) {
            await EmailService.sendSubscriptionRenewedEmail(
              sub.client.email,
              sub.client.name,
              sub.planName,
              invoice.invoiceNumber,
              `${sub.currency} ${sub.amount}`,
              nextDate
            );
          }
        }
        results.push({ subscriptionId: sub.id, invoiceId: invoice.id, status: "success", billingDate: currentNextBilling });
        currentNextBilling = nextDate;
      } catch (error) {
        logger.error(`[SubscriptionService] Failed to process subscription ${sub.id} cycle ${cyclesProcessed}:`, error);
        return { subscriptionId: sub.id, error: error.message, status: "failed" };
      }
    }
    if (cyclesProcessed >= MAX_CYCLES) {
      logger.warn(`[SubscriptionService] Hit max renewal cycles (${MAX_CYCLES}) for ${sub.id}. Stopping catch-up.`);
    }
    return { subscriptionId: sub.id, processedcount: results.length, status: "success", details: results };
  }
  /**
   * Generate Invoice for a Subscription
   */
  static async generateInvoiceForSubscription(sub) {
    logger.info(`[SubscriptionService] Generating invoice for subscription ${sub.id}`);
    const invoiceNumber = await NumberingService.generateMasterInvoiceNumber();
    const items = JSON.parse(sub.itemsSnapshot || "[]");
    const [newInvoice] = await db.insert(invoices).values({
      invoiceNumber,
      clientId: sub.clientId,
      subscriptionId: sub.id,
      status: "draft",
      // Auto-draft? Or sent? Usually draft for review or auto-send.
      issueDate: /* @__PURE__ */ new Date(),
      dueDate: addMonths(/* @__PURE__ */ new Date(), 1),
      // Default net 30?
      currency: sub.currency,
      subtotal: sub.amount.toString(),
      // Assuming amount is subtotal? Or total? 
      // Simplified: amount is total for now, logic below
      total: sub.amount.toString(),
      notes: `Recurring invoice for ${sub.planName} (${sub.billingCycle})`,
      createdBy: sub.createdBy
      // Attributed to creator of sub? Or system?
    }).returning();
    if (items.length > 0) {
      for (const item of items) {
        const itemSubtotal = item.subtotal || (Number(item.quantity) * Number(item.unitPrice)).toString();
        await db.insert(invoiceItems).values({
          invoiceId: newInvoice.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toString(),
          subtotal: itemSubtotal
          // ... other fields
        });
      }
    }
    return newInvoice;
  }
  /**
   * Calculate Proration for plan change
   */
  static calculateProration(currentAmount, newAmount, nextBillingDate, billingCycle) {
    const today = startOfDay(/* @__PURE__ */ new Date());
    const daysRemaining = differenceInDays(new Date(nextBillingDate), today);
    if (daysRemaining <= 0) return { amount: 0, description: "No proration needed" };
    let totalDays = 30;
    if (billingCycle === "quarterly") totalDays = 90;
    if (billingCycle === "annually") totalDays = 365;
    const oldDailyRate = currentAmount / totalDays;
    const newDailyRate = newAmount / totalDays;
    const adjustment = (newDailyRate - oldDailyRate) * daysRemaining;
    return {
      amount: parseFloat(adjustment.toFixed(2)),
      daysRemaining,
      description: `Proration for ${daysRemaining} remaining days`
    };
  }
  /**
   * Helper: Calculate next billing date
   */
  static calculateNextBillingDate(currentDate, cycle) {
    const date = new Date(currentDate);
    switch (cycle) {
      case "monthly":
        return addMonths(date, 1);
      case "quarterly":
        return addMonths(date, 3);
      case "annually":
        return addYears(date, 1);
      default:
        return addMonths(date, 1);
    }
  }
};

// server/routes/subscriptions.routes.ts
init_numbering_service();
init_db();
init_schema();
import { eq as eq19 } from "drizzle-orm";
var router20 = Router20();
router20.get("/subscriptions", authMiddleware, requireFeature("subscriptions_module"), async (req, res) => {
  try {
    const subs = await SubscriptionService.getAllSubscriptions();
    return res.json(subs);
  } catch (error) {
    logger.error("Error fetching subscriptions:", error);
    return res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});
router20.post("/subscriptions", authMiddleware, requireFeature("subscriptions_module"), async (req, res) => {
  try {
    const sub = await SubscriptionService.createSubscription(req.body, req.user.id);
    return res.status(201).json(sub);
  } catch (error) {
    logger.error("Error creating subscription:", error);
    return res.status(500).json({ error: "Failed to create subscription" });
  }
});
router20.get("/subscriptions/:id", authMiddleware, requireFeature("subscriptions_module"), async (req, res) => {
  try {
    const sub = await SubscriptionService.getSubscriptionById(req.params.id);
    if (!sub) {
      return res.status(404).json({ error: "Subscription not found" });
    }
    return res.json(sub);
  } catch (error) {
    logger.error("Error fetching subscription:", error);
    return res.status(500).json({ error: "Failed to fetch subscription" });
  }
});
router20.post("/subscriptions/:id/preview-update", authMiddleware, requireFeature("subscriptions_module"), async (req, res) => {
  try {
    const { amount, billingCycle } = req.body;
    const subscription = await SubscriptionService.getSubscriptionById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }
    if (subscription.status !== "active") {
      return res.json({ amount: 0, description: "Subscription not active", daysRemaining: 0 });
    }
    const proration = SubscriptionService.calculateProration(
      parseFloat(subscription.amount),
      parseFloat(amount),
      new Date(subscription.nextBillingDate),
      subscription.billingCycle
      // Use current cycle for calc comparison
    );
    return res.json(proration);
  } catch (error) {
    logger.error("Preview subscription update error:", error);
    return res.status(500).json({ error: error.message || "Failed to preview update" });
  }
});
router20.put("/subscriptions/:id", authMiddleware, requireFeature("subscriptions_module"), requirePermission("subscriptions", "edit"), async (req, res) => {
  try {
    const { planName, billingCycle, startDate, amount, currency, autoRenew, itemsSnapshot, notes, applyProration } = req.body;
    const existing = await SubscriptionService.getSubscriptionById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Subscription not found" });
    }
    const result = await db.transaction(async (tx) => {
      if (applyProration && existing.status === "active") {
        const proration = SubscriptionService.calculateProration(
          parseFloat(existing.amount),
          parseFloat(amount),
          new Date(existing.nextBillingDate),
          existing.billingCycle
        );
        if (proration.amount !== 0) {
          if (proration.amount > 0) {
            const invoiceNumber = await NumberingService.generateMasterInvoiceNumber();
            const [invoice] = await tx.insert(invoices).values({
              invoiceNumber,
              clientId: existing.clientId,
              subscriptionId: existing.id,
              status: "draft",
              issueDate: /* @__PURE__ */ new Date(),
              dueDate: /* @__PURE__ */ new Date(),
              // Immediate
              currency: currency || existing.currency,
              subtotal: toMoneyString(proration.amount),
              total: toMoneyString(proration.amount),
              notes: `Proration charge for plan change: ${proration.description}`,
              createdBy: req.user.id
            }).returning();
            await tx.insert(invoiceItems).values({
              invoiceId: invoice.id,
              description: `Proration Adjustment (${proration.description})`,
              quantity: 1,
              unitPrice: proration.amount.toString(),
              subtotal: proration.amount.toString()
            });
          } else {
            const creditAmount = Math.abs(proration.amount);
            const currentCredit = parseFloat(existing.prorataCredit || "0");
            await tx.update(subscriptions).set({
              prorataCredit: (currentCredit + creditAmount).toString(),
              notes: (existing.notes || "") + `
[${(/* @__PURE__ */ new Date()).toISOString()}] Applied proration credit: ${creditAmount}`
            }).where(eq19(subscriptions.id, req.params.id));
          }
        }
      }
      const updateData = {
        planName,
        billingCycle,
        amount: amount.toString(),
        currency,
        autoRenew,
        itemsSnapshot: JSON.stringify(itemsSnapshot),
        // Ensure string format
        notes
      };
      if (startDate) {
        updateData.startDate = new Date(startDate);
      }
      const [updated] = await tx.update(subscriptions).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq19(subscriptions.id, req.params.id)).returning();
      await tx.insert(activityLogs).values({
        userId: req.user.id,
        action: "update_subscription",
        entityType: "subscription",
        entityId: req.params.id,
        timestamp: /* @__PURE__ */ new Date()
      });
      return updated;
    });
    return res.json(result);
  } catch (error) {
    logger.error("Update subscription error:", error);
    return res.status(500).json({ error: error.message || "Failed to update subscription" });
  }
});
router20.post("/subscriptions/:id/cancel", authMiddleware, requireFeature("subscriptions_module"), async (req, res) => {
  try {
    const sub = await SubscriptionService.cancelSubscription(req.params.id);
    return res.json(sub);
  } catch (error) {
    logger.error("Error cancelling subscription:", error);
    return res.status(500).json({ error: "Failed to cancel subscription" });
  }
});
var subscriptionRoutes = router20;

// server/routes/workflows.routes.ts
import { Router as Router21 } from "express";
init_storage();

// server/services/workflow.service.ts
init_storage();
init_logger();
var WorkflowService = class {
  /**
   * Create a complete workflow with triggers and actions
   */
  static async createWorkflow(data) {
    try {
      const workflow = await storage.createWorkflow(data.workflow);
      logger.info(`[WorkflowService] Created workflow: ${workflow.id} (${workflow.name})`);
      const triggers = [];
      for (const trigger of data.triggers) {
        const created = await storage.createWorkflowTrigger({
          ...trigger,
          workflowId: workflow.id
        });
        triggers.push(created);
      }
      logger.info(`[WorkflowService] Created ${triggers.length} triggers for workflow ${workflow.id}`);
      const actions = [];
      for (const action of data.actions) {
        const created = await storage.createWorkflowAction({
          ...action,
          workflowId: workflow.id
        });
        actions.push(created);
      }
      logger.info(`[WorkflowService] Created ${actions.length} actions for workflow ${workflow.id}`);
      if (data.schedule) {
        await storage.createWorkflowSchedule({
          ...data.schedule,
          workflowId: workflow.id
        });
        logger.info(`[WorkflowService] Created schedule for workflow ${workflow.id}`);
      }
      return { workflow, triggers, actions };
    } catch (error) {
      logger.error(`[WorkflowService] Error creating workflow:`, error);
      throw error;
    }
  }
  /**
   * Update workflow with new triggers and actions
   */
  static async updateWorkflow(workflowId, data) {
    try {
      const result = {};
      if (data.workflow) {
        result.workflow = await storage.updateWorkflow(workflowId, data.workflow);
        logger.info(`[WorkflowService] Updated workflow: ${workflowId}`);
      }
      if (data.triggers) {
        await storage.deleteWorkflowTriggers(workflowId);
        const triggers = [];
        for (const trigger of data.triggers) {
          const created = await storage.createWorkflowTrigger({
            ...trigger,
            workflowId
          });
          triggers.push(created);
        }
        result.triggers = triggers;
        logger.info(`[WorkflowService] Updated ${triggers.length} triggers for workflow ${workflowId}`);
      }
      if (data.actions) {
        await storage.deleteWorkflowActions(workflowId);
        const actions = [];
        for (const action of data.actions) {
          const created = await storage.createWorkflowAction({
            ...action,
            workflowId
          });
          actions.push(created);
        }
        result.actions = actions;
        logger.info(`[WorkflowService] Updated ${actions.length} actions for workflow ${workflowId}`);
      }
      return result;
    } catch (error) {
      logger.error(`[WorkflowService] Error updating workflow ${workflowId}:`, error);
      throw error;
    }
  }
  /**
   * Get complete workflow with triggers and actions
   */
  static async getWorkflowComplete(workflowId) {
    try {
      const workflow = await storage.getWorkflow(workflowId);
      if (!workflow) {
        return {
          workflow: void 0,
          triggers: [],
          actions: []
        };
      }
      const triggers = await storage.getWorkflowTriggers(workflowId);
      const actions = await storage.getWorkflowActions(workflowId);
      const schedule = await storage.getWorkflowSchedule(workflowId);
      return {
        workflow,
        triggers,
        actions,
        schedule
      };
    } catch (error) {
      logger.error(`[WorkflowService] Error getting workflow ${workflowId}:`, error);
      throw error;
    }
  }
  /**
   * Delete workflow (soft delete - sets status to inactive)
   */
  static async deleteWorkflow(workflowId) {
    try {
      await storage.deleteWorkflow(workflowId);
      logger.info(`[WorkflowService] Deleted workflow: ${workflowId}`);
    } catch (error) {
      logger.error(`[WorkflowService] Error deleting workflow ${workflowId}:`, error);
      throw error;
    }
  }
  /**
   * Get all active workflows for a specific entity type
   */
  static async getActiveWorkflowsForEntity(entityType) {
    try {
      return await storage.getActiveWorkflows(entityType);
    } catch (error) {
      logger.error(`[WorkflowService] Error getting active workflows for ${entityType}:`, error);
      throw error;
    }
  }
  /**
   * Toggle workflow status (active/inactive)
   */
  static async toggleWorkflowStatus(workflowId, isActive) {
    try {
      const status = isActive ? "active" : "inactive";
      const updated = await storage.updateWorkflow(workflowId, { status });
      logger.info(`[WorkflowService] Set workflow ${workflowId} status to ${status}`);
      return updated;
    } catch (error) {
      logger.error(`[WorkflowService] Error toggling workflow status:`, error);
      throw error;
    }
  }
  /**
   * Validate workflow configuration
   * Ensures triggers and actions are properly configured
   */
  static validateWorkflowConfig(data) {
    const errors = [];
    if (data.triggers.length === 0) {
      errors.push("Workflow must have at least one trigger");
    }
    for (const trigger of data.triggers) {
      if (!trigger.triggerType) {
        errors.push("Trigger must have a type");
      }
      if (!trigger.conditions || Object.keys(trigger.conditions).length === 0) {
        errors.push(`Trigger of type ${trigger.triggerType} must have conditions`);
      }
    }
    if (data.actions.length === 0) {
      errors.push("Workflow must have at least one action");
    }
    for (const action of data.actions) {
      if (!action.actionType) {
        errors.push("Action must have a type");
      }
      if (!action.actionConfig || Object.keys(action.actionConfig).length === 0) {
        errors.push(`Action of type ${action.actionType} must have configuration`);
      }
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// server/routes/workflows.routes.ts
init_logger();
var router21 = Router21();
router21.use(requireFeature("workflows_module"));
router21.get("/", authMiddleware, requirePermission("settings", "view"), async (req, res) => {
  try {
    const workflows2 = await storage.getAllWorkflows();
    res.json(workflows2);
  } catch (error) {
    logger.error("[WorkflowRoutes] Error fetching workflows:", error);
    res.status(500).json({ error: "Failed to fetch workflows" });
  }
});
router21.get("/entity/:entityType", authMiddleware, requirePermission("settings", "view"), async (req, res) => {
  try {
    const { entityType } = req.params;
    const workflows2 = await storage.getWorkflowsByEntity(entityType);
    res.json(workflows2);
  } catch (error) {
    logger.error("[WorkflowRoutes] Error fetching workflows by entity:", error);
    res.status(500).json({ error: "Failed to fetch workflows" });
  }
});
router21.get("/:id", authMiddleware, requirePermission("settings", "view"), async (req, res) => {
  try {
    const { id } = req.params;
    const workflowData = await WorkflowService.getWorkflowComplete(id);
    if (!workflowData.workflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    res.json(workflowData);
  } catch (error) {
    logger.error("[WorkflowRoutes] Error fetching workflow:", error);
    res.status(500).json({ error: "Failed to fetch workflow" });
  }
});
router21.post("/", authMiddleware, requirePermission("settings", "create"), async (req, res) => {
  try {
    const { workflow, triggers, actions, schedule } = req.body;
    if (!workflow || !triggers || !actions) {
      return res.status(400).json({
        error: "Missing required fields: workflow, triggers, and actions are required"
      });
    }
    const validation = WorkflowService.validateWorkflowConfig({ triggers, actions });
    if (!validation.isValid) {
      return res.status(400).json({ error: "Invalid workflow configuration", details: validation.errors });
    }
    const workflowWithUser = {
      ...workflow,
      createdBy: req.user.id
    };
    const result = await WorkflowService.createWorkflow({
      workflow: workflowWithUser,
      triggers,
      actions,
      schedule
    });
    logger.info(`[WorkflowRoutes] Created workflow: ${result.workflow.id} by user ${req.user.id}`);
    res.status(201).json(result);
  } catch (error) {
    logger.error("[WorkflowRoutes] Error creating workflow:", error);
    res.status(500).json({ error: "Failed to create workflow", details: error.message });
  }
});
router21.patch("/:id", authMiddleware, requirePermission("settings", "edit"), async (req, res) => {
  try {
    const { id } = req.params;
    const { workflow, triggers, actions } = req.body;
    const existing = await storage.getWorkflow(id);
    if (!existing) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    if (triggers && actions) {
      const validation = WorkflowService.validateWorkflowConfig({ triggers, actions });
      if (!validation.isValid) {
        return res.status(400).json({ error: "Invalid workflow configuration", details: validation.errors });
      }
    }
    const result = await WorkflowService.updateWorkflow(id, {
      workflow,
      triggers,
      actions
    });
    logger.info(`[WorkflowRoutes] Updated workflow: ${id} by user ${req.user.id}`);
    res.json(result);
  } catch (error) {
    logger.error("[WorkflowRoutes] Error updating workflow:", error);
    res.status(500).json({ error: "Failed to update workflow", details: error.message });
  }
});
router21.delete("/:id", authMiddleware, requirePermission("settings", "delete"), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await storage.getWorkflow(id);
    if (!existing) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    await WorkflowService.deleteWorkflow(id);
    logger.info(`[WorkflowRoutes] Deleted workflow: ${id} by user ${req.user.id}`);
    res.json({ message: "Workflow deleted successfully" });
  } catch (error) {
    logger.error("[WorkflowRoutes] Error deleting workflow:", error);
    res.status(500).json({ error: "Failed to delete workflow" });
  }
});
router21.post("/:id/toggle", authMiddleware, requirePermission("settings", "edit"), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "isActive must be a boolean" });
    }
    const updated = await WorkflowService.toggleWorkflowStatus(id, isActive);
    if (!updated) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    logger.info(`[WorkflowRoutes] Toggled workflow ${id} to ${isActive ? "active" : "inactive"} by user ${req.user.id}`);
    res.json(updated);
  } catch (error) {
    logger.error("[WorkflowRoutes] Error toggling workflow:", error);
    res.status(500).json({ error: "Failed to toggle workflow status" });
  }
});
router21.post("/:id/test", authMiddleware, requirePermission("settings", "edit"), async (req, res) => {
  try {
    const { id } = req.params;
    const { testData } = req.body;
    if (!testData) {
      return res.status(400).json({ error: "testData is required for simulation" });
    }
    const workflow = await storage.getWorkflow(id);
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    const triggers = await storage.getWorkflowTriggers(id);
    const triggerResults = triggers.map((trigger) => {
      return {
        triggerId: trigger.id,
        triggerType: trigger.triggerType,
        conditions: trigger.conditions,
        result: "Test evaluation - implement trigger evaluation here"
      };
    });
    const actions = await storage.getWorkflowActions(id);
    logger.info(`[WorkflowRoutes] Tested workflow: ${id} by user ${req.user.id}`);
    res.json({
      workflow,
      triggerResults,
      actions,
      note: "Test mode - no actual actions were executed"
    });
  } catch (error) {
    logger.error("[WorkflowRoutes] Error testing workflow:", error);
    res.status(500).json({ error: "Failed to test workflow" });
  }
});
router21.post("/:id/execute", authMiddleware, requirePermission("settings", "edit"), async (req, res) => {
  try {
    const { id } = req.params;
    const { entityId, entityType } = req.body;
    if (!entityId || !entityType) {
      return res.status(400).json({ error: "entityId and entityType are required" });
    }
    const workflow = await storage.getWorkflow(id);
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    await WorkflowEngine.triggerWorkflows(entityType, entityId, {
      eventType: "manual",
      entity: req.body.entity || {},
      triggeredBy: `user:${req.user.id}`
    });
    logger.info(`[WorkflowRoutes] Manually executed workflow: ${id} by user ${req.user.id}`);
    res.json({ message: "Workflow execution triggered successfully" });
  } catch (error) {
    logger.error("[WorkflowRoutes] Error executing workflow:", error);
    res.status(500).json({ error: "Failed to execute workflow" });
  }
});
router21.get("/:id/executions", authMiddleware, requirePermission("settings", "view"), async (req, res) => {
  try {
    const { id } = req.params;
    const executions = await storage.getWorkflowExecutions(id);
    res.json(executions);
  } catch (error) {
    logger.error("[WorkflowRoutes] Error fetching workflow executions:", error);
    res.status(500).json({ error: "Failed to fetch workflow executions" });
  }
});
router21.get("/executions/entity/:entityType/:entityId", authMiddleware, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const executions = await storage.getEntityWorkflowExecutions(entityType, entityId);
    res.json(executions);
  } catch (error) {
    logger.error("[WorkflowRoutes] Error fetching entity workflow executions:", error);
    res.status(500).json({ error: "Failed to fetch executions" });
  }
});
var workflows_routes_default = router21;

// server/routes.ts
init_logger();
init_cache_service();
async function registerRoutes(app2) {
  app2.use("/api/auth", auth_routes_default);
  app2.use("/api/users", authMiddleware, users_routes_default);
  app2.use("/api/clients", authMiddleware, clients_routes_default);
  app2.use("/api/quotes", quotes_routes_default);
  app2.use("/api/invoices", authMiddleware, invoices_routes_default);
  app2.use("/api", authMiddleware, payments_routes_default);
  app2.use("/api/products", authMiddleware, products_routes_default);
  app2.use("/api", authMiddleware, vendors_routes_default);
  app2.use("/api", authMiddleware, settings_routes_default);
  app2.use("/api/serial-numbers", authMiddleware, serial_numbers_routes_default);
  app2.use("/api/approval-rules", authMiddleware, approval_rules_routes_default);
  app2.use("/api", authMiddleware, pricing_routes_default);
  app2.use("/api/email-templates", email_templates_routes_default);
  app2.use("/api/notifications", notificationRoutes);
  app2.use("/api/collaboration", authMiddleware, collaborationRoutes);
  app2.use("/api", credit_notes_routes_default);
  app2.use("/api", debit_notes_routes_default);
  app2.use("/api", subscriptionRoutes);
  app2.use("/api/workflows", authMiddleware, workflows_routes_default);
  app2.get("/api/templates", authMiddleware, async (req, res) => {
    try {
      const type = req.query.type;
      const style = req.query.style;
      const cacheKey = `templates:list:${type || "all"}:${style || "all"}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) return res.json(cached);
      let templates2;
      if (type) {
        templates2 = await storage.getTemplatesByType(type);
      } else if (style) {
        templates2 = await storage.getTemplatesByStyle(style);
      } else {
        templates2 = await storage.getAllTemplates();
      }
      await cacheService.set(cacheKey, templates2, 300);
      return res.json(templates2);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch templates" });
    }
  });
  app2.get("/api/templates/type/:type", authMiddleware, async (req, res) => {
    try {
      const templates2 = await storage.getTemplatesByType(req.params.type);
      return res.json(templates2);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch templates by type" });
    }
  });
  app2.get("/api/templates/default/:type", authMiddleware, async (req, res) => {
    try {
      const template = await storage.getDefaultTemplate(req.params.type);
      if (!template) {
        return res.status(404).json({ error: "Default template not found" });
      }
      return res.json(template);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch default template" });
    }
  });
  app2.get("/api/templates/:id", authMiddleware, async (req, res) => {
    try {
      const cacheKey = `templates:id:${req.params.id}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) return res.json(cached);
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      await cacheService.set(cacheKey, template, 3600);
      return res.json(template);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch template" });
    }
  });
  app2.post("/api/templates", authMiddleware, async (req, res) => {
    try {
      const template = await storage.createTemplate({
        ...req.body,
        createdBy: req.user.id
      });
      await storage.createActivityLog({
        userId: req.user.id,
        action: "create_template",
        entityType: "template",
        entityId: template.id
      });
      return res.json(template);
    } catch (error) {
      logger.error("Create template error:", error);
      return res.status(500).json({ error: error.message || "Failed to create template" });
    }
  });
  app2.patch("/api/templates/:id", authMiddleware, async (req, res) => {
    try {
      const template = await storage.updateTemplate(req.params.id, req.body);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      await storage.createActivityLog({
        userId: req.user.id,
        action: "update_template",
        entityType: "template",
        entityId: template.id
      });
      await cacheService.del(`templates:id:${req.params.id}`);
      return res.json(template);
    } catch (error) {
      logger.error("Update template error:", error);
      return res.status(500).json({ error: error.message || "Failed to update template" });
    }
  });
  app2.delete("/api/templates/:id", authMiddleware, async (req, res) => {
    try {
      await storage.deleteTemplate(req.params.id);
      await storage.createActivityLog({
        userId: req.user.id,
        action: "delete_template",
        entityType: "template",
        entityId: req.params.id
      });
      await cacheService.del(`templates:id:${req.params.id}`);
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete template" });
    }
  });
  app2.get("/api/admin/users", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const users2 = await storage.getAllUsers();
      const sanitized = users2.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt
      }));
      return res.json(sanitized);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  app2.patch("/api/admin/users/:userId/role", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const { role } = req.body;
      if (!["admin", "manager", "user", "viewer"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      const updated = await storage.updateUser(req.params.userId, { role });
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      await storage.createActivityLog({
        userId: req.user.id,
        action: "change_user_role",
        entityType: "user",
        entityId: req.params.userId
      });
      return res.json({ success: true, message: `User role changed to ${role}` });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Failed to update user role" });
    }
  });
  app2.patch("/api/admin/users/:userId/status", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const { status } = req.body;
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const updated = await storage.updateUser(req.params.userId, { status });
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      await storage.createActivityLog({
        userId: req.user.id,
        action: "change_user_status",
        entityType: "user",
        entityId: req.params.userId
      });
      return res.json({ success: true, message: `User status changed to ${status}` });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Failed to update user status" });
    }
  });
  app2.use("/api/analytics", authMiddleware, analytics_routes_default);
  app2.use("/api", authMiddleware, quote_workflow_routes_default);
  const httpServer = createServer(app2);
  return httpServer;
}

// api/index.ts
var app = null;
async function initializeApp() {
  if (app) return app;
  const newApp = express();
  newApp.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1e3,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false
  });
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1e3,
    max: 5,
    message: "Too many login attempts, please try again later.",
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false
  });
  newApp.use("/api/", limiter);
  newApp.use("/api/auth/login", authLimiter);
  newApp.use("/api/auth/signup", authLimiter);
  try {
    if (process.env.RESEND_API_KEY) {
      EmailService.initializeResend(process.env.RESEND_API_KEY);
      console.log("\u2713 Resend email service initialized");
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      EmailService.initialize({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        from: process.env.EMAIL_FROM || "noreply@quoteprogen.com"
      });
      console.log("\u2713 SMTP email service initialized");
    }
  } catch (error) {
    console.warn("\u26A0 Email service initialization failed:", error);
  }
  newApp.use(express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  }));
  newApp.use(express.urlencoded({ extended: false, limit: "10mb" }));
  newApp.use(cookieParser());
  await registerRoutes(newApp);
  app = newApp;
  return newApp;
}
async function handler(req, res) {
  try {
    if (!process.env.DATABASE_URL) {
      console.error("Missing DATABASE_URL environment variable");
      return res.status(500).json({
        error: "Server Configuration Error",
        message: "Database connection is not configured"
      });
    }
    if (!process.env.SESSION_SECRET) {
      console.error("Missing SESSION_SECRET environment variable");
      return res.status(500).json({
        error: "Server Configuration Error",
        message: "Session secret is not configured"
      });
    }
    const expressApp = await initializeApp();
    return expressApp(req, res);
  } catch (error) {
    console.error("Error handling request:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    const isDevelopment = process.env.NODE_ENV !== "production";
    return res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
      ...isDevelopment && { stack: error instanceof Error ? error.stack : void 0 }
    });
  }
}
export {
  handler as default
};
