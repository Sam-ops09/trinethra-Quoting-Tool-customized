import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, pgEnum, boolean, index, uniqueIndex, jsonb, serial, primaryKey, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "sales_executive", "sales_manager", "purchase_operations", "finance_accounts", "viewer"]);
export const userStatusEnum = pgEnum("user_status", ["active", "inactive"]);
export const quoteStatusEnum = pgEnum("quote_status", ["draft", "sent", "approved", "rejected", "invoiced", "closed_paid", "closed_cancelled"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "partial", "paid", "overdue"]);
export const vendorPoStatusEnum = pgEnum("vendor_po_status", ["draft", "sent", "acknowledged", "fulfilled", "cancelled"]);
export const invoiceItemStatusEnum = pgEnum("invoice_item_status", ["pending", "fulfilled", "partial"]);
export const masterInvoiceStatusEnum = pgEnum("master_invoice_status", ["draft", "confirmed", "locked"]);
export const salesOrderStatusEnum = pgEnum("sales_order_status", ["draft", "confirmed", "fulfilled", "cancelled"]);
export const salesOrderItemStatusEnum = pgEnum("sales_order_item_status", ["pending", "partial", "fulfilled"]);
export const creditNoteStatusEnum = pgEnum("credit_note_status", ["draft", "issued", "applied", "cancelled"]);
export const debitNoteStatusEnum = pgEnum("debit_note_status", ["draft", "issued", "applied", "cancelled"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "paused", "cancelled", "expired"]);
export const billingCycleEnum = pgEnum("billing_cycle", ["monthly", "quarterly", "annually"]);
// Users table
export const users = pgTable("users", {
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
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  clients: many(clients),
  quotes: many(quotes),
  templates: many(templates),
  activityLogs: many(activityLogs),
  communications: many(clientCommunications),
}));

// Clients table
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  billingAddress: text("billing_address"),
  shippingAddress: text("shipping_address"),
  gstin: text("gstin"),
  contactPerson: text("contact_person"),
  segment: text("segment"), // enterprise, corporate, startup, government, education
  preferredTheme: text("preferred_theme"), // professional, modern, minimal, creative, premium
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export const clientsRelations = relations(clients, ({ one, many }) => ({
  creator: one(users, {
    fields: [clients.createdBy],
    references: [users.id],
  }),
  quotes: many(quotes),
  tags: many(clientTags),
  communications: many(clientCommunications),
}));

// Quotes table
export const quotes = pgTable("quotes", {
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
  bomSection: text("bom_section"), // Bill of Materials JSON
  slaSection: text("sla_section"), // Service Level Agreement JSON
  timelineSection: text("timeline_section"), // Project Timeline JSON
  // Closure tracking
  closedAt: timestamp("closed_at"),
  closedBy: varchar("closed_by").references(() => users.id),
  closureNotes: text("closure_notes"),
  // Public Sharing
  publicToken: text("public_token").unique(),
  tokenExpiresAt: timestamp("token_expires_at"),
  // Rule-Based Approval Fields
  approvalStatus: text("approval_status").notNull().default("none"), // none, pending, approved, rejected
  approvalRequiredBy: userRoleEnum("approval_required_by"), // Role required to approve (e.g. sales_manager)
  // Client Acceptance Fields
  clientSignature: text("client_signature"),
  clientAcceptedAt: timestamp("client_accepted_at"),
  clientAcceptedName: text("client_accepted_name"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const approvalRuleTriggerTypeEnum = pgEnum("approval_rule_trigger_type", ["discount_percentage", "total_amount"]);

export const approvalRules = pgTable("approval_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  triggerType: approvalRuleTriggerTypeEnum("trigger_type").notNull(),
  thresholdValue: decimal("threshold_value", { precision: 12, scale: 2 }).notNull(),
  requiredRole: userRoleEnum("required_role").notNull().default("sales_manager"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const approvalRulesRelations = relations(approvalRules, ({ one }) => ({
  creator: one(users, {
    fields: [approvalRules.createdBy],
    references: [users.id],
  }),
}));

export type ApprovalRule = typeof approvalRules.$inferSelect;
export type InsertApprovalRule = typeof approvalRules.$inferInsert;

export const quoteVersions = pgTable("quote_versions", {
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
  itemsSnapshot: text("items_snapshot").notNull(), // JSON
  revisionNotes: text("revision_notes"),
  revisedBy: varchar("revised_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quoteVersionsRelations = relations(quoteVersions, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteVersions.quoteId],
    references: [quotes.id],
  }),
  reviser: one(users, {
    fields: [quoteVersions.revisedBy],
    references: [users.id],
  }),
}));

export const salesOrders = pgTable("sales_orders", {
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
  bomSection: text("bom_section"), // Stores JSON string of ExecBOMData
}, (table) => {
  return {
    uniqueQuote: uniqueIndex("idx_sales_orders_quote_unique").on(table.quoteId),
  };
});

export const salesOrdersRelations = relations(salesOrders, ({ one, many }) => ({
  quote: one(quotes, {
    fields: [salesOrders.quoteId],
    references: [quotes.id],
  }),
  client: one(clients, {
    fields: [salesOrders.clientId],
    references: [clients.id],
  }),
  creator: one(users, {
    fields: [salesOrders.createdBy],
    references: [users.id],
  }),
  confirmer: one(users, {
    fields: [salesOrders.confirmedBy],
    references: [users.id],
  }),
  items: many(salesOrderItems),
  // One sales order can have multiple invoices (e.g. partial)
  invoices: many(invoices),
}));

export const salesOrderItems = pgTable("sales_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  salesOrderId: varchar("sales_order_id").notNull().references(() => salesOrders.id, { onDelete: "cascade" }),
  productId: varchar("product_id").references(() => products.id), // Optional link to product catalog
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  fulfilledQuantity: integer("fulfilled_quantity").notNull().default(0),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  hsnSac: varchar("hsn_sac", { length: 10 }),
  status: salesOrderItemStatusEnum("status").notNull().default("pending"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
  return {
    salesOrderIdx: index("idx_sales_order_items_order_id").on(table.salesOrderId),
  };
});

export const salesOrderItemsRelations = relations(salesOrderItems, ({ one }) => ({
  salesOrder: one(salesOrders, {
    fields: [salesOrderItems.salesOrderId],
    references: [salesOrders.id],
  }),
}));

export const quoteItems = pgTable("quote_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteId: varchar("quote_id").notNull().references(() => quotes.id, { onDelete: "cascade" }),
  productId: varchar("product_id").references(() => products.id), // Optional link to product catalog
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  hsnSac: varchar("hsn_sac", { length: 10 }),
  sortOrder: integer("sort_order").notNull().default(0),
  // Optional item support - client can deselect optional items
  isOptional: boolean("is_optional").notNull().default(false),
  isSelected: boolean("is_selected").notNull().default(true),
});

// Quote Comments table for public comment thread
export const quoteComments = pgTable("quote_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteId: varchar("quote_id").notNull().references(() => quotes.id, { onDelete: "cascade" }),
  authorType: text("author_type").notNull(), // 'client' or 'internal'
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email"),
  message: text("message").notNull(),
  parentCommentId: varchar("parent_comment_id"),
  isInternal: boolean("is_internal").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quoteCommentsRelations = relations(quoteComments, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteComments.quoteId],
    references: [quotes.id],
  }),
  parentComment: one(quoteComments, {
    fields: [quoteComments.parentCommentId],
    references: [quoteComments.id],
  }),
}));

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionNumber: text("subscription_number").notNull().unique(), // SUB-2025-001
  clientId: varchar("client_id").notNull().references(() => clients.id),
  planName: text("plan_name").notNull(),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  billingCycle: billingCycleEnum("billing_cycle").notNull().default("monthly"),
  startDate: timestamp("start_date").notNull().defaultNow(),
  nextBillingDate: timestamp("next_billing_date").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("INR"),
  autoRenew: boolean("auto_renew").notNull().default(true),
  itemsSnapshot: text("items_snapshot").notNull(), // JSON
  lastInvoiceDate: timestamp("last_invoice_date"),
  prorataCredit: decimal("prorata_credit", { precision: 12, scale: 2 }).default("0"),
  notes: text("notes"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  client: one(clients, {
    fields: [subscriptions.clientId],
    references: [clients.id],
  }),
  creator: one(users, {
    fields: [subscriptions.createdBy],
    references: [users.id],
  }),
  invoices: many(invoices),
}));

export const invoices = pgTable("invoices", {
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
  bomSection: text("bom_section"), // Stores JSON string of ExecBOMData
  // Invoice management fields
  cancelledAt: timestamp("cancelled_at"),
  cancelledBy: varchar("cancelled_by").references(() => users.id),
  cancellationReason: text("cancellation_reason"),
  finalizedAt: timestamp("finalized_at"),
  finalizedBy: varchar("finalized_by").references(() => users.id),
  isLocked: boolean("is_locked").notNull().default(false),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
  return {
    parentIdx: index("idx_invoices_parent_invoice_id").on(table.parentInvoiceId),
    subscriptionIdx: index("idx_invoices_subscription_id").on(table.subscriptionId),
    // REMOVED unique constraint to allow partial invoicing (multiple invoices per SO)
    // uniqueSalesOrder: uniqueIndex("idx_invoices_sales_order_unique").on(table.salesOrderId).where(sql`sales_order_id IS NOT NULL`),
    clientIdx: index("idx_invoices_client_id").on(table.clientId),
    paymentStatusIdx: index("idx_invoices_payment_status").on(table.paymentStatus),
  };
});

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  client: one(clients, {
    fields: [quotes.clientId],
    references: [clients.id],
  }),
  template: one(templates, {
    fields: [quotes.templateId],
    references: [templates.id],
  }),
  creator: one(users, {
    fields: [quotes.createdBy],
    references: [users.id],
  }),
  closer: one(users, {
    fields: [quotes.closedBy],
    references: [users.id],
  }),
  items: many(quoteItems),
  invoices: many(invoices),
  vendorPos: many(vendorPurchaseOrders),
  versions: many(quoteVersions),
  salesOrders: many(salesOrders),
}));
export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  quote: one(quotes, {
    fields: [invoices.quoteId],
    references: [quotes.id],
  }),
  parentInvoice: one(invoices, {
    fields: [invoices.parentInvoiceId],
    references: [invoices.id],
    relationName: "invoiceHierarchy",
  }),
  childInvoices: many(invoices, {
    relationName: "invoiceHierarchy",
  }),
  subscription: one(subscriptions, {
    fields: [invoices.subscriptionId],
    references: [subscriptions.id],
  }),
  creator: one(users, {
    fields: [invoices.createdBy],
    references: [users.id],
  }),
  items: many(invoiceItems),
  payments: many(paymentHistory),
}));

// Payment History table
export const paymentHistory = pgTable("payment_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // bank_transfer, credit_card, check, cash, upi, etc.
  transactionId: text("transaction_id"),
  notes: text("notes"),
  paymentDate: timestamp("payment_date").notNull().defaultNow(),
  recordedBy: varchar("recorded_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const paymentHistoryRelations = relations(paymentHistory, ({ one }) => ({
  invoice: one(invoices, {
    fields: [paymentHistory.invoiceId],
    references: [invoices.id],
  }),
  recordedBy: one(users, {
    fields: [paymentHistory.recordedBy],
    references: [users.id],
  }),
}));

// Invoice Items table
export const invoiceItems = pgTable("invoice_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  productId: varchar("product_id").references(() => products.id), // Optional link to product catalog
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  fulfilledQuantity: integer("fulfilled_quantity").notNull().default(0),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  serialNumbers: text("serial_numbers"), // JSON array of serial numbers
  status: invoiceItemStatusEnum("status").notNull().default("pending"),
  sortOrder: integer("sort_order").notNull().default(0),
  hsnSac: varchar("hsn_sac", { length: 10 }), // HSN/SAC code for GST compliance
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const invoiceAttachments = pgTable("invoice_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => invoices.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  content: text("content").notNull(), // Base64
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

// Vendors table
export const vendors = pgTable("vendors", {
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
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  creator: one(users, {
    fields: [vendors.createdBy],
    references: [users.id],
  }),
  purchaseOrders: many(vendorPurchaseOrders),
}));

// Vendor Purchase Orders table
export const vendorPurchaseOrders = pgTable("vendor_purchase_orders", {
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
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const vendorPurchaseOrdersRelations = relations(vendorPurchaseOrders, ({ one, many }) => ({
  quote: one(quotes, {
    fields: [vendorPurchaseOrders.quoteId],
    references: [quotes.id],
  }),
  vendor: one(vendors, {
    fields: [vendorPurchaseOrders.vendorId],
    references: [vendors.id],
  }),
  creator: one(users, {
    fields: [vendorPurchaseOrders.createdBy],
    references: [users.id],
  }),
  items: many(vendorPoItems),
}));

// Vendor PO Items table
export const vendorPoItems = pgTable("vendor_po_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorPoId: varchar("vendor_po_id").notNull().references(() => vendorPurchaseOrders.id, { onDelete: "cascade" }),
  productId: varchar("product_id").references(() => products.id), // Optional link to product catalog
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  receivedQuantity: integer("received_quantity").notNull().default(0),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  serialNumbers: text("serial_numbers"), // JSON array of received serial numbers
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const vendorPoItemsRelations = relations(vendorPoItems, ({ one, many }) => ({
  vendorPo: one(vendorPurchaseOrders, {
    fields: [vendorPoItems.vendorPoId],
    references: [vendorPurchaseOrders.id],
  }),
  grns: many(goodsReceivedNotes),
}));

// Products/Inventory table
export const products = pgTable("products", {
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
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  creator: one(users, {
    fields: [products.createdBy],
    references: [users.id],
  }),
  serialNumbers: many(serialNumbers),
}));

// Goods Received Notes (GRN) table
export const goodsReceivedNotes = pgTable("goods_received_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  grnNumber: text("grn_number").notNull().unique(),
  vendorPoId: varchar("vendor_po_id").notNull().references(() => vendorPurchaseOrders.id),
  vendorPoItemId: varchar("vendor_po_item_id").notNull().references(() => vendorPoItems.id),
  receivedDate: timestamp("received_date").notNull().defaultNow(),
  quantityOrdered: integer("quantity_ordered").notNull(),
  quantityReceived: integer("quantity_received").notNull(),
  quantityRejected: integer("quantity_rejected").notNull().default(0),
  inspectionStatus: text("inspection_status").notNull().default("pending"), // pending, approved, rejected, partial
  inspectedBy: varchar("inspected_by").references(() => users.id),
  inspectionNotes: text("inspection_notes"),
  deliveryNoteNumber: text("delivery_note_number"),
  batchNumber: text("batch_number"),
  attachments: text("attachments"), // JSON array of file URLs
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const goodsReceivedNotesRelations = relations(goodsReceivedNotes, ({ one, many }) => ({
  vendorPo: one(vendorPurchaseOrders, {
    fields: [goodsReceivedNotes.vendorPoId],
    references: [vendorPurchaseOrders.id],
  }),
  vendorPoItem: one(vendorPoItems, {
    fields: [goodsReceivedNotes.vendorPoItemId],
    references: [vendorPoItems.id],
  }),
  creator: one(users, {
    fields: [goodsReceivedNotes.createdBy],
    references: [users.id],
  }),
  inspector: one(users, {
    fields: [goodsReceivedNotes.inspectedBy],
    references: [users.id],
  }),
  serialNumbers: many(serialNumbers),
}));

// Serial Numbers table with complete history tracking
export const serialNumbers = pgTable("serial_numbers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serialNumber: text("serial_number").notNull().unique(),
  productId: varchar("product_id").references(() => products.id),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  vendorPoId: varchar("vendor_po_id").references(() => vendorPurchaseOrders.id),
  vendorPoItemId: varchar("vendor_po_item_id").references(() => vendorPoItems.id),
  grnId: varchar("grn_id").references(() => goodsReceivedNotes.id),
  invoiceId: varchar("invoice_id").references(() => invoices.id),
  invoiceItemId: varchar("invoice_item_id").references(() => invoiceItems.id),
  status: text("status").notNull().default("in_stock"), // in_stock, reserved, delivered, returned, defective
  warrantyStartDate: timestamp("warranty_start_date"),
  warrantyEndDate: timestamp("warranty_end_date"),
  location: text("location"),
  notes: text("notes"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const serialNumbersRelations = relations(serialNumbers, ({ one }) => ({
  product: one(products, {
    fields: [serialNumbers.productId],
    references: [products.id],
  }),
  vendor: one(vendors, {
    fields: [serialNumbers.vendorId],
    references: [vendors.id],
  }),
  vendorPo: one(vendorPurchaseOrders, {
    fields: [serialNumbers.vendorPoId],
    references: [vendorPurchaseOrders.id],
  }),
  vendorPoItem: one(vendorPoItems, {
    fields: [serialNumbers.vendorPoItemId],
    references: [vendorPoItems.id],
  }),
  grn: one(goodsReceivedNotes, {
    fields: [serialNumbers.grnId],
    references: [goodsReceivedNotes.id],
  }),
  invoice: one(invoices, {
    fields: [serialNumbers.invoiceId],
    references: [invoices.id],
  }),
  invoiceItem: one(invoiceItems, {
    fields: [serialNumbers.invoiceItemId],
    references: [invoiceItems.id],
  }),
  creator: one(users, {
    fields: [serialNumbers.createdBy],
    references: [users.id],
  }),
}));

// Templates table
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // quote, invoice, email
  style: text("style").notNull().default("professional"), // professional, modern, minimal
  description: text("description"),
  headerImage: text("header_image"), // URL to header image
  logoUrl: text("logo_url"),
  colors: text("colors"), // JSON for color scheme
  isActive: boolean("is_active").notNull().default(true),
  isDefault: boolean("is_default").notNull().default(false),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const templatesRelations = relations(templates, ({ one, many }) => ({
  creator: one(users, {
    fields: [templates.createdBy],
    references: [users.id],
  }),
  quotes: many(quotes),
}));

// Activity Logs table
export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id"),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Settings table
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Bank Details table
export const bankDetails = pgTable("bank_details", {
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// CLIENT MANAGEMENT PHASE 3 - CLIENT TAGS TABLE
export const clientTags = pgTable("client_tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  tag: text("tag").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const clientTagsRelations = relations(clientTags, ({ one }) => ({
  client: one(clients, {
    fields: [clientTags.clientId],
    references: [clients.id],
  }),
}));

// CLIENT MANAGEMENT PHASE 3 - COMMUNICATION HISTORY TABLE
export const clientCommunications = pgTable("client_communications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // email, call, meeting, note
  subject: text("subject"),
  message: text("message"),
  date: timestamp("date").notNull().defaultNow(),
  communicatedBy: varchar("communicated_by").notNull().references(() => users.id),
  attachments: text("attachments"), // JSON array of attachment URLs
});

export const clientCommunicationsRelations = relations(clientCommunications, ({ one }) => ({
  client: one(clients, {
    fields: [clientCommunications.clientId],
    references: [clients.id],
  }),
  user: one(users, {
    fields: [clientCommunications.communicatedBy],
    references: [users.id],
  }),
}));

// TAX & PRICING PHASE 3 - TAX RATES TABLE
export const taxRates = pgTable("tax_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  region: text("region").notNull(), // IN-AP, IN-KA, IN-MH, etc.
  taxType: text("tax_type").notNull(), // GST, VAT, SAT, etc.
  sgstRate: decimal("sgst_rate", { precision: 5, scale: 2 }).notNull().default("0"), // State GST
  cgstRate: decimal("cgst_rate", { precision: 5, scale: 2 }).notNull().default("0"), // Central GST
  igstRate: decimal("igst_rate", { precision: 5, scale: 2 }).notNull().default("0"), // Integrated GST
  effectiveFrom: timestamp("effective_from").notNull().defaultNow(),
  effectiveTo: timestamp("effective_to"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// PAYMENT TERMS TABLE
export const paymentTerms = pgTable("payment_terms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // Net 30, Due on Receipt, etc.
  days: integer("days").notNull().default(0),
  description: text("description"),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

// TAX & PRICING PHASE 3 - PRICING TIERS TABLE
export const pricingTiers = pgTable("pricing_tiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // Standard, Premium, Enterprise
  minAmount: decimal("min_amount", { precision: 12, scale: 2 }).notNull(),
  maxAmount: decimal("max_amount", { precision: 12, scale: 2 }),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).notNull().default("0"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// TAX & PRICING PHASE 3 - CURRENCY SETTINGS TABLE
export const currencySettings = pgTable("currency_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  baseCurrency: text("base_currency").notNull().default("INR"), // Default currency
  supportedCurrencies: text("supported_currencies").notNull(), // JSON array
  exchangeRates: text("exchange_rates"), // JSON object of rates
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// EMAIL TEMPLATES TABLE - Admin-configurable email templates
export const emailTemplateTypeEnum = pgEnum("email_template_type", [
  "quote", "invoice", "sales_order", "payment_reminder", "password_reset", "welcome"
]);

export const emailTemplates = pgTable("email_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // e.g., "Quote Email", "Invoice Reminder"
  type: emailTemplateTypeEnum("type").notNull(), // quote, invoice, sales_order, etc.
  subject: text("subject").notNull(), // Email subject with {{variables}}
  body: text("body").notNull(), // HTML body with {{variables}}
  availableVariables: text("available_variables").notNull(), // JSON array of allowed variables
  isActive: boolean("is_active").notNull().default(true),
  isDefault: boolean("is_default").notNull().default(false),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const emailTemplatesRelations = relations(emailTemplates, ({ one }) => ({
  creator: one(users, {
    fields: [emailTemplates.createdBy],
    references: [users.id],
  }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  backupEmail: true,
  passwordHash: true,
  name: true,
  role: true,
  status: true,
  refreshToken: true,
  refreshTokenExpiry: true,
}).extend({
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain uppercase, lowercase, number, and special character"),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  createdBy: true,
}).extend({
  email: z.string().email("Invalid email format"),
  segment: z.string().optional(),
  preferredTheme: z.string().optional(),
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  quoteNumber: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  approvalStatus: true,
  approvalRequiredBy: true,
});

export const insertApprovalRuleSchema = createInsertSchema(approvalRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export const insertQuoteItemSchema = createInsertSchema(quoteItems).omit({
  id: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentHistorySchema = createInsertSchema(paymentHistory).omit({
  id: true,
  createdAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  createdBy: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export const insertBankDetailsSchema = createInsertSchema(bankDetails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// PHASE 3 - CLIENT MANAGEMENT INSERT SCHEMAS
export const insertClientTagSchema = createInsertSchema(clientTags).omit({
  id: true,
  createdAt: true,
});

export const insertClientCommunicationSchema = createInsertSchema(clientCommunications).omit({
  id: true,
});

// PHASE 3 - TAX & PRICING INSERT SCHEMAS
export const insertTaxRateSchema = createInsertSchema(taxRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPricingTierSchema = createInsertSchema(pricingTiers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCurrencySettingSchema = createInsertSchema(currencySettings).omit({
  id: true,
  updatedAt: true,
});

// NEW FEATURE - INVOICE ITEMS INSERT SCHEMA
export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// NEW FEATURE - VENDORS INSERT SCHEMA
export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

// NEW FEATURE - VENDOR POs INSERT SCHEMA
export const insertVendorPurchaseOrderSchema = createInsertSchema(vendorPurchaseOrders).omit({
  id: true,
  poNumber: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

// NEW FEATURE - VENDOR PO ITEMS INSERT SCHEMA
export const insertVendorPoItemSchema = createInsertSchema(vendorPoItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// PRODUCTS INSERT SCHEMA
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

// GRN INSERT SCHEMA
export const insertGrnSchema = createInsertSchema(goodsReceivedNotes).omit({
  id: true,
  grnNumber: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

// SERIAL NUMBERS INSERT SCHEMA
export const insertSerialNumberSchema = createInsertSchema(serialNumbers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});


export const insertQuoteVersionSchema = createInsertSchema(quoteVersions).omit({
  id: true,
  createdAt: true,
});

export const insertSalesOrderSchema = createInsertSchema(salesOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSalesOrderItemSchema = createInsertSchema(salesOrderItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// REAL-TIME COLLABORATION - NOTIFICATION TYPES ENUM
export const notificationTypeEnum = pgEnum("notification_type", [
  "quote_status_change",
  "approval_request",
  "approval_decision",
  "payment_received",
  "payment_overdue",
  "collaboration_joined",
  "collaboration_edit",
  "system_announcement"
]);

// NOTIFICATIONS TABLE - For in-app notification center
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  entityType: text("entity_type"), // quote, invoice, payment, sales_order, etc.
  entityId: varchar("entity_id"),
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),
  metadata: jsonb("metadata"), // Additional context data (e.g., old/new status, amount, etc.)
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("idx_notifications_user_id").on(table.userId),
  userUnreadIdx: index("idx_notifications_user_unread").on(table.userId, table.isRead),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// COLLABORATION SESSIONS TABLE - For tracking active document editors
export const collaborationSessions = pgTable("collaboration_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(), // quote, sales_order, invoice
  entityId: varchar("entity_id").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  socketId: text("socket_id").notNull(),
  cursorPosition: jsonb("cursor_position"), // { field: string, line: number }
  isEditing: boolean("is_editing").notNull().default(false),
  lastActivity: timestamp("last_activity").notNull().defaultNow(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
}, (table) => ({
  entityIdx: index("idx_collab_sessions_entity").on(table.entityType, table.entityId),
  userSocketIdx: index("idx_collab_sessions_socket").on(table.socketId),
}));

export const collaborationSessionsRelations = relations(collaborationSessions, ({ one }) => ({
  user: one(users, {
    fields: [collaborationSessions.userId],
    references: [users.id],
  }),
}));

// NOTIFICATION INSERT SCHEMA
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  isRead: true,
  readAt: true,
});

// COLLABORATION SESSION INSERT SCHEMA
export const insertCollaborationSessionSchema = createInsertSchema(collaborationSessions).omit({
  id: true,
  joinedAt: true,
  lastActivity: true,
});

// ==================== CREDIT NOTES ====================

// Credit Notes Table - For refunds/returns
export const creditNotes = pgTable("credit_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creditNoteNumber: text("credit_note_number").notNull().unique(),
  invoiceId: varchar("invoice_id").references(() => invoices.id), // Optional - can be standalone
  clientId: varchar("client_id").notNull().references(() => clients.id),
  status: creditNoteStatusEnum("status").notNull().default("draft"),
  issueDate: timestamp("issue_date").notNull().defaultNow(),
  reason: text("reason").notNull(), // Return, Damaged goods, Price adjustment, etc.
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
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  invoiceIdx: index("idx_credit_notes_invoice_id").on(table.invoiceId),
  clientIdx: index("idx_credit_notes_client_id").on(table.clientId),
  statusIdx: index("idx_credit_notes_status").on(table.status),
}));

// Credit Note Items Table
export const creditNoteItems = pgTable("credit_note_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creditNoteId: varchar("credit_note_id").notNull().references(() => creditNotes.id, { onDelete: "cascade" }),
  productId: varchar("product_id").references(() => products.id),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  hsnSac: varchar("hsn_sac", { length: 10 }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creditNotesRelations = relations(creditNotes, ({ one, many }) => ({
  invoice: one(invoices, {
    fields: [creditNotes.invoiceId],
    references: [invoices.id],
  }),
  client: one(clients, {
    fields: [creditNotes.clientId],
    references: [clients.id],
  }),
  creator: one(users, {
    fields: [creditNotes.createdBy],
    references: [users.id],
  }),
  items: many(creditNoteItems),
}));

export const creditNoteItemsRelations = relations(creditNoteItems, ({ one }) => ({
  creditNote: one(creditNotes, {
    fields: [creditNoteItems.creditNoteId],
    references: [creditNotes.id],
  }),
  product: one(products, {
    fields: [creditNoteItems.productId],
    references: [products.id],
  }),
}));

// ==================== DEBIT NOTES ====================

// Debit Notes Table - For additional charges
export const debitNotes = pgTable("debit_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  debitNoteNumber: text("debit_note_number").notNull().unique(),
  invoiceId: varchar("invoice_id").references(() => invoices.id), // Optional - can be standalone
  clientId: varchar("client_id").notNull().references(() => clients.id),
  status: debitNoteStatusEnum("status").notNull().default("draft"),
  issueDate: timestamp("issue_date").notNull().defaultNow(),
  reason: text("reason").notNull(), // Additional charges, Price revision, etc.
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
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  invoiceIdx: index("idx_debit_notes_invoice_id").on(table.invoiceId),
  clientIdx: index("idx_debit_notes_client_id").on(table.clientId),
  statusIdx: index("idx_debit_notes_status").on(table.status),
}));

// Debit Note Items Table
export const debitNoteItems = pgTable("debit_note_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  debitNoteId: varchar("debit_note_id").notNull().references(() => debitNotes.id, { onDelete: "cascade" }),
  productId: varchar("product_id").references(() => products.id),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  hsnSac: varchar("hsn_sac", { length: 10 }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const debitNotesRelations = relations(debitNotes, ({ one, many }) => ({
  invoice: one(invoices, {
    fields: [debitNotes.invoiceId],
    references: [invoices.id],
  }),
  client: one(clients, {
    fields: [debitNotes.clientId],
    references: [clients.id],
  }),
  creator: one(users, {
    fields: [debitNotes.createdBy],
    references: [users.id],
  }),
  items: many(debitNoteItems),
}));

export const debitNoteItemsRelations = relations(debitNoteItems, ({ one }) => ({
  debitNote: one(debitNotes, {
    fields: [debitNoteItems.debitNoteId],
    references: [debitNotes.id],
  }),
  product: one(products, {
    fields: [debitNoteItems.productId],
    references: [products.id],
  }),
}));

// CREDIT NOTE INSERT SCHEMAS
export const insertCreditNoteSchema = createInsertSchema(creditNotes).omit({
  id: true,
  creditNoteNumber: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  appliedAmount: true,
});

export const insertCreditNoteItemSchema = createInsertSchema(creditNoteItems).omit({
  id: true,
  createdAt: true,
});

// DEBIT NOTE INSERT SCHEMAS
export const insertDebitNoteSchema = createInsertSchema(debitNotes).omit({
  id: true,
  debitNoteNumber: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  appliedAmount: true,
});

export const insertDebitNoteItemSchema = createInsertSchema(debitNoteItems).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type QuoteItem = typeof quoteItems.$inferSelect;
export type InsertQuoteItem = z.infer<typeof insertQuoteItemSchema>;

export type QuoteComment = typeof quoteComments.$inferSelect;
export type InsertQuoteComment = Omit<typeof quoteComments.$inferInsert, 'id' | 'createdAt'>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type InsertPaymentHistory = z.infer<typeof insertPaymentHistorySchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

export type BankDetails = typeof bankDetails.$inferSelect;
export type InsertBankDetails = z.infer<typeof insertBankDetailsSchema>;

// PHASE 3 - CLIENT MANAGEMENT TYPES
export type ClientTag = typeof clientTags.$inferSelect;
export type InsertClientTag = z.infer<typeof insertClientTagSchema>;

export type ClientCommunication = typeof clientCommunications.$inferSelect;
export type InsertClientCommunication = z.infer<typeof insertClientCommunicationSchema>;

// PHASE 3 - TAX & PRICING TYPES
export type TaxRate = typeof taxRates.$inferSelect;
export type InsertTaxRate = z.infer<typeof insertTaxRateSchema>;

export type PricingTier = typeof pricingTiers.$inferSelect;
export type InsertPricingTier = z.infer<typeof insertPricingTierSchema>;

export type CurrencySetting = typeof currencySettings.$inferSelect;
export type InsertCurrencySetting = z.infer<typeof insertCurrencySettingSchema>;

// NEW FEATURE - INVOICE ITEMS TYPES
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;

// NEW FEATURE - VENDORS TYPES
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;

// NEW FEATURE - VENDOR POs TYPES
export type VendorPurchaseOrder = typeof vendorPurchaseOrders.$inferSelect;
export type InsertVendorPurchaseOrder = z.infer<typeof insertVendorPurchaseOrderSchema>;

// NEW FEATURE - VENDOR PO ITEMS TYPES
export type VendorPoItem = typeof vendorPoItems.$inferSelect;
export type InsertVendorPoItem = z.infer<typeof insertVendorPoItemSchema>;

// PRODUCTS TYPES
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// GRN TYPES
export type GoodsReceivedNote = typeof goodsReceivedNotes.$inferSelect;
export type InsertGrn = z.infer<typeof insertGrnSchema>;

// SERIAL NUMBERS TYPES
export type SerialNumber = typeof serialNumbers.$inferSelect;

export type InsertSerialNumber = z.infer<typeof insertSerialNumberSchema>;

// NEW FEATURE - QUOTE VERSIONS TYPES
export type QuoteVersion = typeof quoteVersions.$inferSelect;
export type InsertQuoteVersion = z.infer<typeof insertQuoteVersionSchema>;

// NEW FEATURE - SALES ORDERS TYPES
export type SalesOrder = typeof salesOrders.$inferSelect;
export type InsertSalesOrder = z.infer<typeof insertSalesOrderSchema>;

export type SalesOrderItem = typeof salesOrderItems.$inferSelect;
export type InsertSalesOrderItem = z.infer<typeof insertSalesOrderItemSchema>;

export const insertInvoiceAttachmentSchema = createInsertSchema(invoiceAttachments).omit({
    id: true,
    createdAt: true,
});

export type InvoiceAttachment = typeof invoiceAttachments.$inferSelect;
export type InsertInvoiceAttachment = z.infer<typeof insertInvoiceAttachmentSchema>;

// EMAIL TEMPLATES INSERT SCHEMA
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

// EMAIL TEMPLATES TYPES
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplateType = "quote" | "invoice" | "sales_order" | "payment_reminder" | "password_reset" | "welcome";

// REAL-TIME COLLABORATION TYPES
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type NotificationType = "quote_status_change" | "approval_request" | "approval_decision" | "payment_received" | "payment_overdue" | "collaboration_joined" | "collaboration_edit" | "system_announcement";

export type CollaborationSession = typeof collaborationSessions.$inferSelect;
export type InsertCollaborationSession = z.infer<typeof insertCollaborationSessionSchema>;

// CREDIT NOTES TYPES
export type CreditNote = typeof creditNotes.$inferSelect;
export type InsertCreditNote = z.infer<typeof insertCreditNoteSchema>;
export type CreditNoteItem = typeof creditNoteItems.$inferSelect;
export type InsertCreditNoteItem = z.infer<typeof insertCreditNoteItemSchema>;
export type CreditNoteStatus = "draft" | "issued" | "applied" | "cancelled";

// DEBIT NOTES TYPES
export type DebitNote = typeof debitNotes.$inferSelect;
export type InsertDebitNote = z.infer<typeof insertDebitNoteSchema>;
export type DebitNoteItem = typeof debitNoteItems.$inferSelect;
export type InsertDebitNoteItem = z.infer<typeof insertDebitNoteItemSchema>;
export type DebitNoteStatus = "draft" | "issued" | "applied" | "cancelled";
