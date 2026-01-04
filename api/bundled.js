var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
  bankDetails: () => bankDetails,
  clientCommunications: () => clientCommunications,
  clientCommunicationsRelations: () => clientCommunicationsRelations,
  clientTags: () => clientTags,
  clientTagsRelations: () => clientTagsRelations,
  clients: () => clients,
  clientsRelations: () => clientsRelations,
  currencySettings: () => currencySettings,
  goodsReceivedNotes: () => goodsReceivedNotes,
  goodsReceivedNotesRelations: () => goodsReceivedNotesRelations,
  insertActivityLogSchema: () => insertActivityLogSchema,
  insertBankDetailsSchema: () => insertBankDetailsSchema,
  insertClientCommunicationSchema: () => insertClientCommunicationSchema,
  insertClientSchema: () => insertClientSchema,
  insertClientTagSchema: () => insertClientTagSchema,
  insertCurrencySettingSchema: () => insertCurrencySettingSchema,
  insertGrnSchema: () => insertGrnSchema,
  insertInvoiceItemSchema: () => insertInvoiceItemSchema,
  insertInvoiceSchema: () => insertInvoiceSchema,
  insertPaymentHistorySchema: () => insertPaymentHistorySchema,
  insertPricingTierSchema: () => insertPricingTierSchema,
  insertProductSchema: () => insertProductSchema,
  insertQuoteItemSchema: () => insertQuoteItemSchema,
  insertQuoteSchema: () => insertQuoteSchema,
  insertSerialNumberSchema: () => insertSerialNumberSchema,
  insertSettingSchema: () => insertSettingSchema,
  insertTaxRateSchema: () => insertTaxRateSchema,
  insertTemplateSchema: () => insertTemplateSchema,
  insertUserSchema: () => insertUserSchema,
  insertVendorPoItemSchema: () => insertVendorPoItemSchema,
  insertVendorPurchaseOrderSchema: () => insertVendorPurchaseOrderSchema,
  insertVendorSchema: () => insertVendorSchema,
  invoiceItemStatusEnum: () => invoiceItemStatusEnum,
  invoiceItems: () => invoiceItems,
  invoiceItemsRelations: () => invoiceItemsRelations,
  invoices: () => invoices,
  invoicesRelations: () => invoicesRelations,
  masterInvoiceStatusEnum: () => masterInvoiceStatusEnum,
  paymentHistory: () => paymentHistory,
  paymentHistoryRelations: () => paymentHistoryRelations,
  paymentStatusEnum: () => paymentStatusEnum,
  paymentTerms: () => paymentTerms,
  pricingTiers: () => pricingTiers,
  products: () => products,
  productsRelations: () => productsRelations,
  quoteItems: () => quoteItems,
  quoteItemsRelations: () => quoteItemsRelations,
  quoteStatusEnum: () => quoteStatusEnum,
  quotes: () => quotes,
  quotesRelations: () => quotesRelations,
  serialNumbers: () => serialNumbers,
  serialNumbersRelations: () => serialNumbersRelations,
  settings: () => settings,
  taxRates: () => taxRates,
  templates: () => templates,
  templatesRelations: () => templatesRelations,
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
  vendorsRelations: () => vendorsRelations
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var userRoleEnum, userStatusEnum, quoteStatusEnum, paymentStatusEnum, vendorPoStatusEnum, invoiceItemStatusEnum, masterInvoiceStatusEnum, users, usersRelations, clients, clientsRelations, quotes, quotesRelations, quoteItems, quoteItemsRelations, invoices, invoicesRelations, paymentHistory, paymentHistoryRelations, invoiceItems, invoiceItemsRelations, vendors, vendorsRelations, vendorPurchaseOrders, vendorPurchaseOrdersRelations, vendorPoItems, vendorPoItemsRelations, products, productsRelations, goodsReceivedNotes, goodsReceivedNotesRelations, serialNumbers, serialNumbersRelations, templates, templatesRelations, activityLogs, activityLogsRelations, settings, bankDetails, clientTags, clientTagsRelations, clientCommunications, clientCommunicationsRelations, taxRates, paymentTerms, pricingTiers, currencySettings, insertUserSchema, insertClientSchema, insertQuoteSchema, insertQuoteItemSchema, insertInvoiceSchema, insertPaymentHistorySchema, insertTemplateSchema, insertActivityLogSchema, insertSettingSchema, insertBankDetailsSchema, insertClientTagSchema, insertClientCommunicationSchema, insertTaxRateSchema, insertPricingTierSchema, insertCurrencySettingSchema, insertInvoiceItemSchema, insertVendorSchema, insertVendorPurchaseOrderSchema, insertVendorPoItemSchema, insertProductSchema, insertGrnSchema, insertSerialNumberSchema;
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
      communications: many(clientCommunications)
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
      createdAt: timestamp("created_at").notNull().defaultNow()
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
      createdBy: varchar("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
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
      vendorPos: many(vendorPurchaseOrders)
    }));
    quoteItems = pgTable("quote_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      quoteId: varchar("quote_id").notNull().references(() => quotes.id, { onDelete: "cascade" }),
      description: text("description").notNull(),
      quantity: integer("quantity").notNull().default(1),
      unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
      sortOrder: integer("sort_order").notNull().default(0),
      hsnSac: varchar("hsn_sac", { length: 10 })
      // HSN/SAC code for GST compliance
    });
    quoteItemsRelations = relations(quoteItems, ({ one }) => ({
      quote: one(quotes, {
        fields: [quoteItems.quoteId],
        references: [quotes.id]
      })
    }));
    invoices = pgTable("invoices", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      invoiceNumber: text("invoice_number").notNull().unique(),
      parentInvoiceId: varchar("parent_invoice_id"),
      // For child invoices - self-reference added after table creation
      quoteId: varchar("quote_id").notNull().references(() => quotes.id),
      paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
      dueDate: timestamp("due_date").notNull(),
      paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).notNull().default("0"),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
      discount: decimal("discount", { precision: 12, scale: 2 }).notNull().default("0"),
      cgst: decimal("cgst", { precision: 12, scale: 2 }).notNull().default("0"),
      sgst: decimal("sgst", { precision: 12, scale: 2 }).notNull().default("0"),
      igst: decimal("igst", { precision: 12, scale: 2 }).notNull().default("0"),
      shippingCharges: decimal("shipping_charges", { precision: 12, scale: 2 }).notNull().default("0"),
      total: decimal("total", { precision: 12, scale: 2 }).notNull().default("0"),
      notes: text("notes"),
      termsAndConditions: text("terms_and_conditions"),
      isMaster: boolean("is_master").notNull().default(false),
      masterInvoiceStatus: masterInvoiceStatusEnum("master_invoice_status"),
      // Only for master invoices
      deliveryNotes: text("delivery_notes"),
      milestoneDescription: text("milestone_description"),
      // For milestone billing
      // Payment Tracking
      lastPaymentDate: timestamp("last_payment_date"),
      paymentMethod: text("payment_method"),
      paymentNotes: text("payment_notes"),
      paymentReminderSentAt: timestamp("payment_reminder_sent_at"),
      overdueReminderSentAt: timestamp("overdue_reminder_sent_at"),
      createdBy: varchar("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
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
      // Reference number from payment gateway or bank
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
      address: text("address"),
      gstin: text("gstin"),
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
      quoteId: varchar("quote_id").notNull().references(() => quotes.id),
      vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
      status: vendorPoStatusEnum("status").notNull().default("draft"),
      orderDate: timestamp("order_date").notNull().defaultNow(),
      expectedDeliveryDate: timestamp("expected_delivery_date"),
      actualDeliveryDate: timestamp("actual_delivery_date"),
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
      segment: z.string().optional(),
      preferredTheme: z.string().optional()
    });
    insertQuoteSchema = createInsertSchema(quotes).omit({
      id: true,
      quoteNumber: true,
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

// server/storage.ts
import { eq, desc, and } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_db();
    init_schema();
    DatabaseStorage = class {
      // Users
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user || void 0;
      }
      async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user || void 0;
      }
      async createUser(user) {
        const [newUser] = await db.insert(users).values(user).returning();
        return newUser;
      }
      async updateUser(id, data) {
        const [updated] = await db.update(users).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
        return updated || void 0;
      }
      async updateUserWithTokenCheck(id, token, data) {
        const [updated] = await db.update(users).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(users.id, id), eq(users.resetToken, token))).returning();
        return updated || void 0;
      }
      async deleteUser(id) {
        await db.delete(activityLogs).where(eq(activityLogs.userId, id));
        await db.delete(templates).where(eq(templates.createdBy, id));
        await db.delete(quotes).where(eq(quotes.createdBy, id));
        await db.delete(clients).where(eq(clients.createdBy, id));
        await db.delete(users).where(eq(users.id, id));
      }
      async getAllUsers() {
        return await db.select().from(users).orderBy(desc(users.createdAt));
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
        await db.delete(clients).where(eq(clients.id, id));
      }
      // Quotes
      async getQuote(id) {
        const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
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
        return await db.select().from(templates).where(eq(templates.type, type) && eq(templates.isActive, true));
      }
      async getTemplatesByStyle(style) {
        return await db.select().from(templates).where(eq(templates.style, style) && eq(templates.isActive, true));
      }
      async getDefaultTemplate(type) {
        const [template] = await db.select().from(templates).where(eq(templates.type, type) && eq(templates.isDefault, true));
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
        const [tier] = await db.select().from(pricingTiers).where(eq(pricingTiers.isActive, true));
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
      async getInvoicesByQuote(quoteId) {
        return await db.select().from(invoices).where(eq(invoices.quoteId, quoteId)).orderBy(desc(invoices.createdAt));
      }
      // Serial Numbers
      async getSerialNumber(id) {
        const { serialNumbers: serialNumbers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const [serial] = await db.select().from(serialNumbers2).where(eq(serialNumbers2.id, id));
        return serial || void 0;
      }
      async getSerialNumberByValue(serialNumber) {
        const { serialNumbers: serialNumbers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const [serial] = await db.select().from(serialNumbers2).where(eq(serialNumbers2.serialNumber, serialNumber));
        return serial || void 0;
      }
      async createSerialNumber(serial) {
        const { serialNumbers: serialNumbers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const [newSerial] = await db.insert(serialNumbers2).values(serial).returning();
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
        await db.delete(goodsReceivedNotes).where(eq(goodsReceivedNotes.id, id));
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/services/pdf-themes.ts
var pdf_themes_exports = {};
__export(pdf_themes_exports, {
  creativeTheme: () => creativeTheme,
  educationTheme: () => educationTheme,
  getAllThemes: () => getAllThemes,
  getSuggestedTheme: () => getSuggestedTheme,
  getTheme: () => getTheme,
  governmentTheme: () => governmentTheme,
  minimalTheme: () => minimalTheme,
  modernTheme: () => modernTheme,
  premiumTheme: () => premiumTheme,
  professionalTheme: () => professionalTheme,
  segmentThemeMapping: () => segmentThemeMapping,
  themeRegistry: () => themeRegistry
});
function getTheme(themeName) {
  if (!themeName) return professionalTheme;
  return themeRegistry[themeName] || professionalTheme;
}
function getSuggestedTheme(segment) {
  if (!segment) return professionalTheme;
  const themeName = segmentThemeMapping[segment] || "professional";
  return getTheme(themeName);
}
function getAllThemes() {
  return Object.values(themeRegistry);
}
var professionalTheme, modernTheme, minimalTheme, creativeTheme, premiumTheme, governmentTheme, educationTheme, themeRegistry, segmentThemeMapping;
var init_pdf_themes = __esm({
  "server/services/pdf-themes.ts"() {
    "use strict";
    professionalTheme = {
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
    modernTheme = {
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
    minimalTheme = {
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
    creativeTheme = {
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
    premiumTheme = {
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
    governmentTheme = {
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
    educationTheme = {
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
    themeRegistry = {
      professional: professionalTheme,
      modern: modernTheme,
      minimal: minimalTheme,
      creative: creativeTheme,
      premium: premiumTheme,
      government: governmentTheme,
      education: educationTheme
    };
    segmentThemeMapping = {
      enterprise: "premium",
      corporate: "professional",
      startup: "modern",
      government: "government",
      education: "education",
      creative: "creative"
    };
  }
});

// server/services/numbering.service.ts
var NumberingService;
var init_numbering_service = __esm({
  "server/services/numbering.service.ts"() {
    "use strict";
    init_storage();
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
       * Generate a formatted master invoice number
       * Example: MINV-2025-001
       */
      static async generateMasterInvoiceNumber() {
        try {
          let formatSetting = await storage.getSetting("masterInvoiceFormat");
          if (!formatSetting) formatSetting = await storage.getSetting("master_invoice_number_format");
          let prefixSetting = await storage.getSetting("masterInvoicePrefix");
          if (!prefixSetting) prefixSetting = await storage.getSetting("master_invoice_prefix");
          const format = formatSetting?.value || "{PREFIX}-{YEAR}-{COUNTER:04d}";
          const prefix = prefixSetting?.value || "MINV";
          const counter = await this.getAndIncrementCounter("master_invoice");
          return this.applyFormat(format, prefix, counter);
        } catch (error) {
          console.error("Error generating master invoice number:", error);
          const counter = Math.floor(Math.random() * 1e4);
          return `MINV-${String(counter).padStart(4, "0")}`;
        }
      }
      /**
       * Generate a formatted child invoice number
       * Example: INV-2025-001
       */
      static async generateChildInvoiceNumber() {
        try {
          let formatSetting = await storage.getSetting("childInvoiceFormat");
          if (!formatSetting) formatSetting = await storage.getSetting("invoice_number_format");
          let prefixSetting = await storage.getSetting("childInvoicePrefix");
          if (!prefixSetting) prefixSetting = await storage.getSetting("invoice_prefix");
          const format = formatSetting?.value || "{PREFIX}-{YEAR}-{COUNTER:04d}";
          const prefix = prefixSetting?.value || "INV";
          const counter = await this.getAndIncrementCounter("child_invoice");
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
       * Get the next counter value and increment it
       * Uses year-based counter keys (e.g., quote_counter_2025)
       * Always checks DB for the latest value before incrementing
       * Counters start from 1 (formatted as 001 with padding)
       */
      static async getAndIncrementCounter(type) {
        const year = (/* @__PURE__ */ new Date()).getFullYear();
        const counterKey = `${type}_counter_${year}`;
        const currentCounterSetting = await storage.getSetting(counterKey);
        let currentValue = 0;
        if (currentCounterSetting && currentCounterSetting.value) {
          const parsed = parseInt(currentCounterSetting.value, 10);
          if (!isNaN(parsed)) {
            currentValue = parsed;
          }
        }
        const nextValue = currentValue + 1;
        console.log(`[NumberingService] ${type}_${year}: current=${currentValue}, next=${nextValue}`);
        await storage.upsertSetting({
          key: counterKey,
          value: String(nextValue)
        });
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
          { resource: "settings", action: "manage" }
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
          { resource: "vendor_pos", action: "view" },
          { resource: "clients", action: "view" },
          { resource: "clients", action: "create" },
          { resource: "clients", action: "edit" },
          { resource: "products", action: "view" },
          { resource: "serial_numbers", action: "view" }
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
          { resource: "vendor_pos", action: "view" },
          { resource: "grns", action: "view" },
          { resource: "clients", action: "view" },
          { resource: "clients", action: "create" },
          { resource: "clients", action: "edit" },
          { resource: "products", action: "view" },
          { resource: "payments", action: "view" },
          { resource: "serial_numbers", action: "view" },
          { resource: "serial_numbers", action: "edit" }
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
          { resource: "payments", action: "view" },
          { resource: "payments", action: "create" },
          { resource: "payments", action: "edit" },
          { resource: "payments", action: "delete" },
          { resource: "quotes", action: "view" },
          { resource: "clients", action: "view" },
          { resource: "serial_numbers", action: "view" }
        ]
      },
      viewer: {
        name: "Viewer",
        description: "Read-only access to most resources",
        permissions: [
          { resource: "quotes", action: "view" },
          { resource: "invoices", action: "view" },
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

// server/serial-number-service.ts
var serial_number_service_exports = {};
__export(serial_number_service_exports, {
  canEditSerialNumbers: () => canEditSerialNumbers,
  getSerialTraceability: () => getSerialTraceability,
  logSerialNumberChange: () => logSerialNumberChange,
  validateSerialNumbers: () => validateSerialNumbers
});
import { eq as eq2, and as and2, sql as sql3 } from "drizzle-orm";
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
    (serial, index) => validSerials.indexOf(serial) !== index
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
      and2(
        eq2(invoiceItems.invoiceId, invoiceId),
        sql3`${invoiceItems.id} != ${invoiceItemId}`
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
    const invoice = await db.select().from(invoices).where(eq2(invoices.id, invoiceId)).limit(1);
    if (invoice.length > 0) {
      const quoteId = invoice[0].quoteId;
      const relatedInvoices = await db.select().from(invoices).where(
        and2(
          eq2(invoices.quoteId, quoteId),
          sql3`${invoices.id} != ${invoiceId}`
        )
      );
      const existingSerialsInQuote = [];
      for (const relInvoice of relatedInvoices) {
        const items = await db.select().from(invoiceItems).where(eq2(invoiceItems.invoiceId, relInvoice.id));
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
  if (options.checkSystemWide) {
    const existingSerials = await db.select({ serialNumber: serialNumbers.serialNumber }).from(serialNumbers).where(
      sql3`${serialNumbers.serialNumber} IN (${sql3.join(validSerials.map((s) => sql3`${s}`), sql3`, `)})`
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
  const [serial] = await db.select().from(serialNumbers).where(eq2(serialNumbers.serialNumber, serialNumberValue)).limit(1);
  if (serial) {
    console.log("[Serial Traceability] Found in serialNumbers table:", serial.id);
    const invoice = serial.invoiceId ? await db.select().from(invoices).where(eq2(invoices.id, serial.invoiceId)).limit(1) : [];
    if (invoice.length === 0) {
      console.log("[Serial Traceability] No invoice found for serial");
      return null;
    }
    const quote = await db.select().from(quotes).where(eq2(quotes.id, invoice[0].quoteId)).limit(1);
    const customer = quote.length > 0 ? await db.select().from(clients).where(eq2(clients.id, quote[0].clientId)).limit(1) : [];
    const invoiceItem = serial.invoiceItemId ? await db.select().from(invoiceItems).where(eq2(invoiceItems.id, serial.invoiceItemId)).limit(1) : [];
    const history = await db.select({
      action: activityLogs.action,
      userId: activityLogs.userId,
      timestamp: activityLogs.timestamp
    }).from(activityLogs).where(
      and2(
        eq2(activityLogs.entityType, "serial_number"),
        eq2(activityLogs.entityId, serial.id)
      )
    ).orderBy(activityLogs.timestamp);
    const historyWithUsers = await Promise.all(
      history.map(async (h) => {
        const user = await db.select().from(users).where(eq2(users.id, h.userId)).limit(1);
        return {
          action: h.action,
          user: user.length > 0 ? user[0].name : "Unknown",
          timestamp: h.timestamp.toISOString()
        };
      })
    );
    return {
      serialNumber: serial.serialNumber,
      status: serial.status || "unknown",
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
      warranty: serial.warrantyStartDate && serial.warrantyEndDate ? {
        startDate: serial.warrantyStartDate.toISOString(),
        endDate: serial.warrantyEndDate.toISOString()
      } : void 0,
      location: serial.location || void 0,
      notes: serial.notes || void 0,
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
  const invoice = await db.select().from(invoices).where(eq2(invoices.id, item.invoiceId)).limit(1);
  if (invoice.length === 0) return null;
  const quote = await db.select().from(quotes).where(eq2(quotes.id, invoice[0].quoteId)).limit(1);
  const customer = quote.length > 0 ? await db.select().from(clients).where(eq2(clients.id, quote[0].clientId)).limit(1) : [];
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
  const invoice = await db.select().from(invoices).where(eq2(invoices.id, invoiceId)).limit(1);
  if (invoice.length === 0) {
    return { canEdit: false, reason: "Invoice not found" };
  }
  const user = await db.select().from(users).where(eq2(users.id, userId)).limit(1);
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

// api/index.ts
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser2 from "cookie-parser";

// server/routes.ts
init_storage();
import { createServer } from "http";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

// server/services/pdf.service.ts
init_pdf_themes();
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
var PDFService = class _PDFService {
  // ===== A4 =====
  static PAGE_WIDTH = 595.28;
  static PAGE_HEIGHT = 841.89;
  // ===== Compact margins (closer to invoice design) =====
  static MARGIN_LEFT = 28;
  static MARGIN_RIGHT = 28;
  static MARGIN_TOP = 22;
  static MARGIN_BOTTOM = 32;
  static CONTENT_WIDTH = _PDFService.PAGE_WIDTH - _PDFService.MARGIN_LEFT - _PDFService.MARGIN_RIGHT;
  // ===== Clean invoice-style palette =====
  static INK = "#111827";
  static SUBTLE = "#4B5563";
  static FAINT = "#6B7280";
  static LINE = "#D1D5DB";
  static SOFT = "#F3F4F6";
  static SURFACE = "#FFFFFF";
  static ACCENT = "#111827";
  static SUCCESS = "#16A34A";
  static WARNING = "#F59E0B";
  static DANGER = "#B91C1C";
  static activeTheme = null;
  // ===== Fonts (optional Inter) =====
  static FONT_REG = "Helvetica";
  static FONT_BOLD = "Helvetica-Bold";
  // ===== Stroke & padding (invoice-style) =====
  static STROKE_W = 0.9;
  static PAD_X = 8;
  // ======================================================================
  // PUBLIC
  // ======================================================================
  static generateQuotePDF(data) {
    let selectedTheme;
    if (data.theme) selectedTheme = getTheme(data.theme);
    else if (data.client.preferredTheme) selectedTheme = getTheme(data.client.preferredTheme);
    else if (data.client.segment) selectedTheme = getSuggestedTheme(data.client.segment);
    else selectedTheme = getTheme("professional");
    this.applyTheme(selectedTheme);
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: this.MARGIN_TOP,
        bottom: this.MARGIN_BOTTOM,
        left: this.MARGIN_LEFT,
        right: this.MARGIN_RIGHT
      },
      bufferPages: true,
      info: { Author: data.companyName || "AICERA" }
    });
    this.setupFonts(doc);
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
    return doc;
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
  static setupFonts(doc) {
    const fontsDir = path.join(process.cwd(), "server", "pdf", "fonts");
    const tryRegister = (name, filename) => {
      try {
        const p = path.join(fontsDir, filename);
        if (fs.existsSync(p)) {
          doc.registerFont(name, p);
          return true;
        }
      } catch {
      }
      return false;
    };
    const okReg = tryRegister("Inter", "Inter-Regular.ttf");
    const okBold = tryRegister("Inter-Bold", "Inter-Bold.ttf");
    if (okReg && okBold) {
      this.FONT_REG = "Inter";
      this.FONT_BOLD = "Inter-Bold";
    } else {
      this.FONT_REG = "Helvetica";
      this.FONT_BOLD = "Helvetica-Bold";
    }
  }
  // ======================================================================
  // HELPERS
  // ======================================================================
  static bottomY() {
    return this.PAGE_HEIGHT - this.MARGIN_BOTTOM;
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
  static currency(v) {
    const n = Number(v) || 0;
    return `Rs. ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
    doc.text(String(txt).toUpperCase(), x, y, { characterSpacing: 0.6, lineBreak: false });
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
    const words = t.split(" ");
    const lines = [];
    let line = "";
    const push = () => {
      const s = line.trim();
      if (s) lines.push(s);
      line = "";
    };
    for (const w of words) {
      const cand = line ? `${line} ${w}` : w;
      if (doc.widthOfString(cand) <= width) {
        line = cand;
      } else {
        push();
        line = w;
        if (lines.length >= maxLines) break;
      }
    }
    if (line && lines.length < maxLines) push();
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
  // HEADER (invoice-style)
  // ======================================================================
  static drawHeader(doc, data, title) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    const topY = doc.page.margins.top;
    const logoSize = 26;
    let logoPrinted = false;
    try {
      let logoPath = path.join(process.cwd(), "client", "public", "AICERA_Logo.png");
      if (!fs.existsSync(logoPath)) logoPath = path.join(process.cwd(), "client", "public", "logo.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, x, topY - 2, { fit: [logoSize, logoSize] });
        logoPrinted = true;
      }
    } catch {
    }
    doc.font(this.FONT_BOLD).fontSize(11).fillColor(this.INK);
    doc.text(title, x, topY - 2, { width: w, align: "center", lineBreak: false });
    const leftX = logoPrinted ? x + logoSize + 8 : x;
    doc.font(this.FONT_BOLD).fontSize(10).fillColor(this.INK);
    doc.text(this.clean(data.companyName || "AICERA"), leftX, topY + 12, {
      width: 300,
      lineBreak: false
    });
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
    const minLineY = topY + 58;
    doc.y = Math.max(doc.y + 6, minLineY);
    this.hLine(doc, x, x + w, doc.y);
    doc.y += 8;
  }
  // ======================================================================
  // FROM
  // ======================================================================
  static drawFromBox(doc, data) {
    const x = this.MARGIN_LEFT;
    const w = this.CONTENT_WIDTH;
    const h = 55;
    this.ensureSpace(doc, data, h + 10);
    const y0 = doc.y;
    this.box(doc, x, y0, w, h, { fill: "#FFFFFF" });
    this.label(doc, "From", x + this.PAD_X, y0 + 6);
    const name = this.clean(data.companyName || "AICERA");
    doc.font(this.FONT_BOLD).fontSize(8.6).fillColor(this.INK);
    doc.text(name, x + this.PAD_X, y0 + 18, { width: w - this.PAD_X * 2, lineBreak: false });
    const addr = this.normalizeAddress(data.companyAddress, 4) || "-";
    doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(addr, x + this.PAD_X, y0 + 28, { width: w - this.PAD_X * 2, lineBreak: true });
    const contactBits = [];
    if (data.companyPhone) contactBits.push(`Ph: ${this.clean(data.companyPhone)}`);
    if (data.companyGSTIN) contactBits.push(`GSTIN: ${this.clean(data.companyGSTIN).toUpperCase()}`);
    if (data.preparedByEmail) contactBits.push(`Email: ${this.clean(data.preparedByEmail)}`);
    doc.font(this.FONT_REG).fontSize(7).fillColor(this.SUBTLE);
    if (contactBits.length) {
      doc.text(this.truncateToWidth(doc, contactBits.join("  |  "), w - this.PAD_X * 2), x + this.PAD_X, y0 + h - 14, {
        width: w - this.PAD_X * 2,
        lineBreak: false
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
    const h = 128;
    this.ensureSpace(doc, data, h + 10);
    const y0 = doc.y;
    const leftX = x;
    const rightX = x + leftW + gap;
    this.box(doc, leftX, y0, leftW, h, { fill: "#FFFFFF" });
    const half = Math.floor(h / 2);
    this.hLine(doc, leftX, leftX + leftW, y0 + half);
    const clientName = this.clean(data.client.name || "-");
    const shipAddr = this.normalizeAddress(data.client.shippingAddress || data.client.billingAddress, 2) || "-";
    const billAddr = this.normalizeAddress(data.client.billingAddress, 2) || "-";
    const phone = this.clean(data.client.phone);
    const email = this.clean(data.client.email);
    this.label(doc, "Consignee (Ship To)", leftX + this.PAD_X, y0 + 6);
    doc.font(this.FONT_BOLD).fontSize(8.6).fillColor(this.INK);
    doc.text(clientName, leftX + this.PAD_X, y0 + 18, { width: leftW - this.PAD_X * 2, lineBreak: false });
    doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(shipAddr, leftX + this.PAD_X, y0 + 30, { width: leftW - this.PAD_X * 2 });
    const by = y0 + half;
    this.label(doc, "Buyer (Bill To)", leftX + this.PAD_X, by + 6);
    doc.font(this.FONT_BOLD).fontSize(8.6).fillColor(this.INK);
    doc.text(clientName, leftX + this.PAD_X, by + 18, { width: leftW - this.PAD_X * 2, lineBreak: false });
    doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
    doc.text(billAddr, leftX + this.PAD_X, by + 30, { width: leftW - this.PAD_X * 2 });
    const contact = [phone ? `Ph: ${phone}` : "", email ? `Email: ${email}` : ""].filter(Boolean).join("  |  ");
    if (contact) {
      doc.font(this.FONT_REG).fontSize(7).fillColor(this.SUBTLE);
      doc.text(this.truncateToWidth(doc, contact, leftW - this.PAD_X * 2), leftX + this.PAD_X, y0 + h - 14, {
        width: leftW - this.PAD_X * 2,
        lineBreak: false
      });
    }
    this.box(doc, rightX, y0, rightW, h, { fill: "#FFFFFF" });
    const q = data.quote;
    const rows = [
      { k: "Quote Date", v: this.safeDate(q.quoteDate) },
      { k: "Validity", v: q.validUntil ? `Until ${this.safeDate(q.validUntil)}` : `${Number(q.validityDays || 30)} days` },
      { k: "Reference", v: this.clean(q.referenceNumber || "-") },
      { k: "Prepared By", v: this.clean(data.preparedBy || "-") }
    ];
    const rH = Math.floor(h / rows.length);
    for (let i = 0; i < rows.length; i++) {
      const ry = y0 + i * rH;
      if (i > 0) this.hLine(doc, rightX, rightX + rightW, ry);
      const labelW = rightW * 0.5;
      const valueW = rightW - labelW - this.PAD_X * 2;
      doc.font(this.FONT_REG).fontSize(7).fillColor(this.SUBTLE);
      doc.text(rows[i].k, rightX + this.PAD_X, ry + 5, { width: labelW - this.PAD_X, lineBreak: false });
      doc.font(this.FONT_BOLD).fontSize(7.6).fillColor(this.INK);
      doc.text(this.truncateToWidth(doc, rows[i].v, valueW), rightX + labelW, ry + 5, {
        width: valueW,
        align: "right",
        lineBreak: false
      });
    }
    doc.y = y0 + h + 10;
  }
  // ======================================================================
  // ITEMS TABLE (NO HSN/SAC)
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
    const desc3 = w - (sl + qty + unit + rate + amt);
    const cx = {
      sl: x,
      desc: x + sl,
      qty: x + sl + desc3,
      unit: x + sl + desc3 + qty,
      rate: x + sl + desc3 + qty + unit,
      amt: x + sl + desc3 + qty + unit + rate,
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
      doc.text("DESCRIPTION", cx.desc + 4, yy + 7, { width: desc3 - 8, align: "left", characterSpacing: 0.6, lineBreak: false });
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
      const descLines = this.wrapLines(doc, descText, desc3 - 8, 2);
      doc.restore();
      const rowH = Math.max(minRowH, 8 + descLines.length * 11);
      if (y + rowH > this.bottomY() - 12) {
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
      this.box(doc, x, y, w, rowH, { fill: "#FFFFFF" });
      doc.save();
      doc.strokeColor(this.LINE).lineWidth(0.8);
      [cx.desc, cx.qty, cx.unit, cx.rate, cx.amt].forEach((vx) => {
        doc.moveTo(vx, y).lineTo(vx, y + rowH).stroke();
      });
      doc.restore();
      doc.font(this.FONT_REG).fontSize(8).fillColor(this.INK);
      doc.text(String(i + 1), cx.sl, y + Math.floor((rowH - 9) / 2) - 1, {
        width: sl,
        align: "center",
        lineBreak: false
      });
      let dy = y + 6;
      for (const ln of descLines) {
        doc.text(this.truncateToWidth(doc, ln, desc3 - 8), cx.desc + 4, dy, { width: desc3 - 8, lineBreak: false });
        dy += 11;
      }
      const midY = y + Math.floor((rowH - 10) / 2) - 1;
      doc.text(String(qtyVal), cx.qty, midY, { width: qty, align: "center", lineBreak: false });
      doc.text(unitText, cx.unit, midY, { width: unit, align: "center", lineBreak: false });
      doc.font(this.FONT_BOLD).fontSize(8).fillColor(this.INK);
      doc.text(this.currency(rateVal), cx.rate, midY, { width: rate - 8, align: "right", lineBreak: false });
      doc.text(this.currency(amtVal), cx.amt, midY, { width: amt - 8, align: "right", lineBreak: false });
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
    const h = 122;
    this.ensureSpace(doc, data, h + 12);
    const y0 = doc.y;
    this.box(doc, x, y0, leftW, h, { fill: "#FFFFFF" });
    this.label(doc, "Amount Chargeable (in words)", x + this.PAD_X, y0 + 6);
    const q = data.quote;
    const total = Number(q.total) || 0;
    doc.font(this.FONT_BOLD).fontSize(7.8).fillColor(this.INK);
    doc.text(this.truncateToWidth(doc, this.amountToINRWords(total), leftW - this.PAD_X * 2), x + this.PAD_X, y0 + 20, {
      width: leftW - this.PAD_X * 2,
      lineBreak: false
    });
    this.label(doc, "Terms & Conditions", x + this.PAD_X, y0 + 50);
    const termsInline = this.termsToInlineBullets(this.clean(q.termsAndConditions || "")) || "\u2014";
    const termsLines = this.wrapLines(doc, termsInline, leftW - this.PAD_X * 2, 2);
    doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
    let ty = y0 + 62;
    for (const ln of termsLines) {
      doc.text(this.truncateToWidth(doc, ln, leftW - this.PAD_X * 2), x + this.PAD_X, ty, {
        width: leftW - this.PAD_X * 2,
        lineBreak: false
      });
      ty += 10;
    }
    const xr = x + leftW + gap;
    this.box(doc, xr, y0, rightW, h, { fill: "#FFFFFF" });
    this.label(doc, "Totals", xr + this.PAD_X, y0 + 6);
    const subtotal = Number(q.subtotal) || 0;
    const shipping = Number(q.shippingCharges) || 0;
    const cgst = Number(q.cgst) || 0;
    const sgst = Number(q.sgst) || 0;
    const igst = Number(q.igst) || 0;
    const rows = [];
    rows.push({ k: "Subtotal", v: subtotal });
    if (shipping > 0) rows.push({ k: "Shipping", v: shipping });
    if (cgst > 0) rows.push({ k: "CGST", v: cgst });
    if (sgst > 0) rows.push({ k: "SGST", v: sgst });
    if (igst > 0 && cgst === 0 && sgst === 0) rows.push({ k: "IGST", v: igst });
    rows.push({ k: "TOTAL", v: total, bold: true });
    let ry = y0 + 22;
    const rowH = 14;
    const labelW = rightW * 0.55;
    const valueW = rightW - labelW - this.PAD_X * 2;
    for (const r of rows) {
      if (ry > y0 + h - 20) break;
      doc.font(this.FONT_BOLD).fontSize(r.bold ? 8.6 : 7.6).fillColor(this.INK);
      doc.text(r.k, xr + this.PAD_X, ry, { width: labelW - this.PAD_X, lineBreak: false });
      const moneyStr = this.currency(r.v);
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
    const h = 76;
    this.ensureSpace(doc, data, h + 12);
    const y0 = doc.y;
    this.box(doc, x, y0, colW, h, { fill: "#FFFFFF" });
    this.label(doc, "Declaration", x + this.PAD_X, y0 + 6);
    const declaration = this.clean(data.declarationText) || "We declare that this proposal shows the actual price of the goods/services described and that all particulars are true and correct.";
    const declLines = this.wrapLines(doc, declaration, colW - this.PAD_X * 2, 2);
    doc.font(this.FONT_REG).fontSize(7.2).fillColor(this.SUBTLE);
    let dy = y0 + 20;
    for (const ln of declLines) {
      doc.text(this.truncateToWidth(doc, ln, colW - this.PAD_X * 2), x + this.PAD_X, dy, {
        width: colW - this.PAD_X * 2,
        lineBreak: false
      });
      dy += 9;
    }
    const xr = x + colW + gap;
    this.box(doc, xr, y0, colW, h, { fill: "#FFFFFF" });
    this.label(doc, "Company Bank Details for Payment", xr + this.PAD_X, y0 + 6);
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
    const bankLines2 = this.wrapLines(doc, bankText, colW - this.PAD_X * 2, 2);
    doc.font(this.FONT_BOLD).fontSize(7.2).fillColor(this.INK);
    let by = y0 + 20;
    for (const ln of bankLines2) {
      doc.text(this.truncateToWidth(doc, ln, colW - this.PAD_X * 2), xr + this.PAD_X, by, {
        width: colW - this.PAD_X * 2,
        lineBreak: false
      });
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
    this.box(doc, x, y0, colW, h, { fill: "#FFFFFF" });
    this.label(doc, "Client Acceptance", x + this.PAD_X, y0 + 6);
    doc.font(this.FONT_REG).fontSize(8.8).fillColor(this.SUBTLE);
    doc.text(this.clean(data.clientAcceptanceLabel || "Customer Seal & Signature"), x + this.PAD_X, y0 + 20, {
      width: colW - this.PAD_X * 2
    });
    this.hLine(doc, x + this.PAD_X, x + colW - this.PAD_X, y0 + h - 24);
    doc.font(this.FONT_REG).fontSize(8.2).fillColor(this.SUBTLE);
    doc.text("Date:", x + this.PAD_X, y0 + h - 16, { width: colW - this.PAD_X * 2, lineBreak: false });
    const xr = x + colW + gap;
    this.box(doc, xr, y0, colW, h, { fill: "#FFFFFF" });
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
    const footerTop = this.PAGE_HEIGHT - 34;
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
  // TERMS INLINE
  // ======================================================================
  static termsToInlineBullets(raw) {
    const t = this.clean(raw);
    if (!t) return "";
    const lines = t.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => l.replace(/^[-*•\d.)\]]\s*/, ""));
    return lines.join(" \u2022 ").replace(/\s+/g, " ").trim();
  }
};

// server/services/invoice-pdf.service.ts
import PDFDocument2 from "pdfkit";
import path2 from "path";
import fs2 from "fs";
var InvoicePDFService = class _InvoicePDFService {
  // A4 points
  static PAGE_WIDTH = 595.28;
  static PAGE_HEIGHT = 841.89;
  // Compact margins (closer to classic invoice templates)
  static MARGIN_LEFT = 28;
  static MARGIN_RIGHT = 28;
  static MARGIN_TOP = 22;
  static MARGIN_BOTTOM = 32;
  static CONTENT_WIDTH = _InvoicePDFService.PAGE_WIDTH - _InvoicePDFService.MARGIN_LEFT - _InvoicePDFService.MARGIN_RIGHT;
  // Clean “invoice” palette (subtle lines, minimal accent)
  static INK = "#111827";
  static SUBTLE = "#4B5563";
  static FAINT = "#6B7280";
  static LINE = "#D1D5DB";
  static SOFT = "#F3F4F6";
  static CURRENCY_PREFIX = "Rs. ";
  // Serials
  static SERIAL_INLINE_LIMIT = 8;
  static SERIAL_APPENDIX_THRESHOLD = 12;
  // ---------------------------
  // Public API
  // ---------------------------
  static generateInvoicePDF(data) {
    const doc = new PDFDocument2({
      size: "A4",
      margins: {
        top: this.MARGIN_TOP,
        bottom: this.MARGIN_BOTTOM,
        left: this.MARGIN_LEFT,
        right: this.MARGIN_RIGHT
      },
      bufferPages: true,
      info: {
        Author: data.companyName || "AICERA"
      }
    });
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
    const range = doc.bufferedPageRange();
    const totalPages = range.count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      this.drawFooter(doc, i + 1, totalPages);
    }
    doc.end();
    return doc;
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
  static money(v) {
    const n = Number(v) || 0;
    return this.CURRENCY_PREFIX + n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  /** For totals rows (discount etc.) */
  static moneySigned(v) {
    const n = Number(v) || 0;
    if (n < 0) {
      const abs = Math.abs(n);
      return "-" + this.CURRENCY_PREFIX + abs.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    return this.money(n);
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
    const w = this.CONTENT_WIDTH;
    const topY = doc.page.margins.top;
    const logoSize = 26;
    let logoPrinted = false;
    try {
      let logoPath = path2.join(process.cwd(), "client", "public", "AICERA_Logo.png");
      if (!fs2.existsSync(logoPath)) logoPath = path2.join(process.cwd(), "client", "public", "logo.png");
      if (fs2.existsSync(logoPath)) {
        doc.image(logoPath, x, topY - 2, { fit: [logoSize, logoSize] });
        logoPrinted = true;
      }
    } catch {
      logoPrinted = false;
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
    if (this.isValidGSTIN(data.companyGSTIN)) {
      parts.push(`GSTIN: ${String(data.companyGSTIN).trim().toUpperCase()}`);
    }
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
  // Top blocks: Bill/Ship + meta (grid)
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
      const companyBoxH = 60;
      this.ensureSpace(doc, data, companyBoxH + 10);
      this.box(doc, x, startY, w, companyBoxH, { fill: "#FFFFFF" });
      doc.font("Helvetica-Bold").fontSize(8.2).fillColor(this.INK);
      doc.text("From", x + 8, startY + 6, { width: w - 16 });
      if (companyDetails.name) {
        doc.font("Helvetica-Bold").fontSize(8.6).fillColor(this.INK);
        doc.text(companyDetails.name, x + 8, startY + 18, {
          width: w - 16,
          lineBreak: false
        });
      }
      const companyInfo = [];
      if (companyDetails.address) {
        companyInfo.push(String(companyDetails.address).trim());
      }
      if (companyDetails.phone) {
        companyInfo.push(`Ph: ${String(companyDetails.phone).trim()}`);
      }
      if (companyDetails.gstin) {
        companyInfo.push(`GSTIN: ${String(companyDetails.gstin).trim().toUpperCase()}`);
      }
      if (data.userEmail) {
        companyInfo.push(`Contact: ${String(data.userEmail).trim()}`);
      }
      if (companyInfo.length > 0) {
        doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
        doc.text(companyInfo.join(" | "), x + 8, startY + 30, {
          width: w - 16,
          lineBreak: true
        });
      }
      startY += companyBoxH + 10;
    }
    const startY2 = startY;
    const leftX = x;
    const rightX = x + leftW + gap;
    const h = 128;
    this.ensureSpace(doc, data, h + 10);
    this.box(doc, leftX, startY2, leftW, h, { fill: "#FFFFFF" });
    const ship = data.client?.shippingAddress || data.client?.billingAddress;
    const bill = data.client?.billingAddress;
    const clientPhone = data.client?.phone;
    const clientEmail = data.client?.email;
    const clientGSTIN = data.client?.gstin;
    doc.font("Helvetica-Bold").fontSize(8.2).fillColor(this.INK);
    doc.text("Consignee (Ship To)", leftX + 8, startY2 + 6, { width: leftW - 16 });
    doc.font("Helvetica-Bold").fontSize(8.6).fillColor(this.INK);
    doc.text(data.client.name || "-", leftX + 8, startY2 + 20, {
      width: leftW - 16,
      lineBreak: false
    });
    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    const shipAddr = this.normalizeAddress(ship, 2) || "-";
    doc.text(shipAddr, leftX + 8, startY2 + 32, { width: leftW - 16 });
    doc.save();
    doc.strokeColor(this.LINE).lineWidth(0.8);
    doc.moveTo(leftX, startY2 + 64).lineTo(leftX + leftW, startY2 + 64).stroke();
    doc.restore();
    doc.font("Helvetica-Bold").fontSize(8.2).fillColor(this.INK);
    doc.text("Buyer (Bill To)", leftX + 8, startY2 + 70, { width: leftW - 16 });
    doc.font("Helvetica-Bold").fontSize(8.6).fillColor(this.INK);
    doc.text(data.client.name || "-", leftX + 8, startY2 + 84, {
      width: leftW - 16,
      lineBreak: false
    });
    doc.font("Helvetica").fontSize(7.2).fillColor(this.SUBTLE);
    const billAddr = this.normalizeAddress(bill, 2) || "-";
    doc.text(billAddr, leftX + 8, startY2 + 96, { width: leftW - 16 });
    const billParts = [];
    if (this.isValidPhone(clientPhone)) billParts.push(`Ph: ${String(clientPhone).trim()}`);
    if (this.isValidEmail(clientEmail)) billParts.push(`Email: ${String(clientEmail).trim()}`);
    if (this.isValidGSTIN(clientGSTIN)) billParts.push(`GSTIN: ${String(clientGSTIN).trim().toUpperCase()}`);
    if (billParts.length) {
      doc.font("Helvetica").fontSize(7).fillColor(this.SUBTLE);
      doc.text(billParts.join("  |  "), leftX + 8, startY2 + 116, { width: leftW - 16 });
    }
    this.box(doc, rightX, startY2, rightW, h, { fill: "#FFFFFF" });
    const kvRowH = 18;
    const pad = 8;
    const labelW = Math.min(88, rightW * 0.45);
    const valW = rightW - pad * 2 - labelW;
    const row = (i, label, value) => {
      const yy = startY2 + pad + i * kvRowH;
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
    row(0, "Invoice Date", invDate);
    row(1, "Due Date", due);
    row(2, "PO No.", quoteNo);
    row(3, "Payment Status", status);
    row(4, "Invoice Prepared By", preparedBy);
    const deliveryNotesStr = String(data.deliveryNotes || "").trim();
    row(5, "Delivery Note", deliveryNotesStr);
    doc.y = startY2 + h + 10;
  }
  // ---------------------------
  // Items Table (paginates)
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
      const desc3 = descRaw || "-";
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
      const descLinesAll = this.wrapTextLines(doc, desc3, col.desc - 12, 3);
      const descLines = descLinesAll.slice(0, 2);
      if (descLinesAll.length > 2 && descLines[1]) {
        descLines[1] = this.truncateToWidth(doc, descLines[1], col.desc - 12);
      }
      const descH = descLines.length * 11;
      let serialLines = [];
      let serialH = 0;
      if (serialInline) {
        doc.font("Helvetica").fontSize(6.8).fillColor(this.SUBTLE);
        const sAll = this.wrapTextLines(doc, serialInline, col.desc - 12, 2);
        serialLines = sAll.slice(0, 2);
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
      doc.text(this.money(rate), cx.rate, y + padY, {
        width: col.rate - 8,
        align: "right",
        lineBreak: false
      });
      doc.text(this.money(amount), cx.amount, y + padY, {
        width: col.amount - 8,
        align: "right",
        lineBreak: false
      });
      doc.save();
      doc.strokeColor(this.LINE).lineWidth(0.8);
      doc.moveTo(x0, y + rowH).lineTo(cx.right, y + rowH).stroke();
      doc.restore();
      if (needsAppendix) appendix.push({ itemIndex: idx + 1, description: desc3, serials });
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
    const taxable = Math.max(0, subtotal - Math.max(0, discount) + Math.max(0, shipping));
    const totalsRows = [
      { label: "Subtotal", value: subtotal }
    ];
    if (shipping > 0) totalsRows.push({ label: "Shipping/Handling", value: shipping });
    if (cgst > 0) totalsRows.push({ label: "CGST", value: cgst });
    if (sgst > 0) totalsRows.push({ label: "SGST", value: sgst });
    if (igst > 0) totalsRows.push({ label: "IGST", value: igst });
    totalsRows.push({ label: "TOTAL", value: total, bold: true });
    const words = this.amountInWordsINR(total);
    const notesText = String(data.notes || data.quote.notes || "").trim();
    const milestone = String(data.milestoneDescription || "").trim();
    const delivery = String(data.deliveryNotes || "").trim();
    const termsRaw = String(data.termsAndConditions || "").trim();
    const termsLines = termsRaw ? termsRaw.split("\n").map((s) => s.trim()).filter(Boolean) : [];
    const termsText = termsLines.join("  \u2022  ");
    const maxTermsLines = 4;
    doc.save();
    doc.font("Helvetica").fontSize(7.4);
    const wordsH = doc.heightOfString(words, { width: leftW - 16 });
    const notesBlock = [milestone, delivery, notesText].filter(Boolean).join(" | ");
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
      doc.text(this.truncateToWidth(doc, notesBlock, leftW - 16), leftX + 8, ly, { width: leftW - 16 });
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
      const moneyStr = r.signed ? this.moneySigned(r.value) : this.money(r.value);
      doc.text(moneyStr, rightX + 8 + labelW, ry - (r.bold ? 1 : 0), {
        width: valW,
        align: "right",
        lineBreak: false
      });
      ry += rowH;
    });
    const taxBits = [];
    const nbsp = "\xA0";
    taxBits.push(`Taxable: ${this.money(taxable).replace("Rs. ", "Rs." + nbsp)}`);
    if (cgst > 0) taxBits.push(`CGST: ${this.money(cgst).replace("Rs. ", "Rs." + nbsp)}`);
    if (sgst > 0) taxBits.push(`SGST: ${this.money(sgst).replace("Rs. ", "Rs." + nbsp)}`);
    if (igst > 0) taxBits.push(`IGST: ${this.money(igst).replace("Rs. ", "Rs." + nbsp)}`);
    doc.font("Helvetica").fontSize(6).fillColor(this.FAINT);
    const taxLine = this.truncateToWidth(doc, taxBits.join("  |  "), rightW - 16);
    doc.text(taxLine, rightX + 8, ry + 2, {
      width: rightW - 16,
      align: "right",
      lineBreak: false
    });
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
    if (bankLines.length) {
      doc.text(bankLines.join("\n"), x + leftW + gap + 8, y0 + 20, { width: rightW - 16 });
    } else {
      doc.text("-", x + leftW + gap + 8, y0 + 20, { width: rightW - 16 });
    }
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
  // Footer (inside margins; does not mutate doc.y)
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
  static amountInWordsINR(amount) {
    const n = Number(amount) || 0;
    const rupees = Math.floor(n);
    const paise = Math.round((n - rupees) * 100);
    const r = this.numberToWordsIndian(rupees);
    const p = paise > 0 ? this.numberToWordsIndian(paise) : "";
    if (paise > 0) return `INR ${r} and ${p} Paise Only`;
    return `INR ${r} Only`;
  }
  static numberToWordsIndian(num) {
    const n = Math.floor(Math.abs(num));
    if (n === 0) return "Zero";
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
};

// server/services/analytics.service.ts
init_storage();
var AnalyticsService = class {
  /**
   * Get revenue forecast based on historical data
   */
  async getRevenueForecast(monthsAhead = 3) {
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
          monthlyRevenue[monthKey] += parseFloat(invoice.paidAmount.toString());
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
      return distribution.map((d) => ({
        ...d,
        percentage: totalQuotes > 0 ? d.count / totalQuotes * 100 : 0
      }));
    } catch (error) {
      console.error("Error getting deal distribution:", error);
      return [];
    }
  }
  /**
   * Get regional sales distribution
   */
  async getRegionalDistribution() {
    try {
      const allClients = await storage.getAllClients();
      const allQuotes = await storage.getAllQuotes();
      const regionData = {};
      for (const quote of allQuotes) {
        const client = allClients.find((c) => c.id === quote.clientId);
        const region = client?.billingAddress?.split(",").pop()?.trim() || "Unknown";
        if (!regionData[region]) {
          regionData[region] = { count: 0, revenue: 0 };
        }
        regionData[region].count++;
        regionData[region].revenue += parseFloat(quote.total.toString());
      }
      const totalQuotes = Object.values(regionData).reduce((sum, r) => sum + r.count, 0);
      return Object.entries(regionData).map(([region, data]) => ({
        region,
        quoteCount: data.count,
        totalRevenue: this.roundAmount(data.revenue),
        percentage: totalQuotes > 0 ? data.count / totalQuotes * 100 : 0
      }));
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
      const clients2 = await storage.getAllClients();
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
        const client = clients2.find((c) => c.id === q.clientId);
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
      const totalRevenue = clientInvoices.reduce((sum, i) => sum + parseFloat(i.paidAmount.toString()), 0);
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
      return {
        avgQuoteValue: this.roundAmount(avgValue),
        medianQuoteValue: this.roundAmount(medianValue),
        quoteFrequency,
        conversionTrend: parseFloat(conversionTrend.toFixed(2))
      };
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

// server/services/pricing.service.ts
init_storage();
import { Decimal } from "decimal.js";
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
    const decimal2 = new Decimal(amount);
    switch (roundingRule) {
      case "up":
        return parseFloat(decimal2.toDecimalPlaces(2, Decimal.ROUND_UP).toString());
      case "down":
        return parseFloat(decimal2.toDecimalPlaces(2, Decimal.ROUND_DOWN).toString());
      case "nearest":
      default:
        return parseFloat(decimal2.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString());
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

// server/routes.ts
init_numbering_service();

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

// shared/feature-flags.ts
var DEFAULT_FEATURE_FLAGS = {
  // ==================== PAGES & ROUTES ====================
  pages_dashboard: true,
  pages_clients: true,
  pages_clientDetail: true,
  pages_quotes: true,
  pages_quoteCreate: true,
  pages_quoteDetail: true,
  pages_invoices: true,
  pages_invoiceDetail: true,
  pages_vendors: false,
  pages_vendorPOs: false,
  pages_vendorPODetail: false,
  pages_products: false,
  pages_grn: false,
  pages_grnDetail: false,
  pages_serialSearch: true,
  pages_dashboardsOverview: true,
  pages_salesQuoteDashboard: true,
  pages_vendorPODashboard: false,
  pages_invoiceCollectionsDashboard: true,
  pages_serialTrackingDashboard: false,
  pages_adminUsers: true,
  pages_adminSettings: true,
  pages_adminConfiguration: true,
  pages_governanceDashboard: false,
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
  quotes_version: true,
  quotes_bomSection: true,
  quotes_slaSection: true,
  quotes_timelineSection: true,
  quotes_convertToInvoice: true,
  quotes_convertToVendorPO: true,
  quotes_emailSending: false,
  quotes_pdfGeneration: false,
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
  invoices_emailSending: false,
  invoices_pdfGeneration: false,
  // Re-enabled for testing
  invoices_paymentTracking: true,
  invoices_paymentHistory: true,
  invoices_partialPayments: true,
  invoices_paymentReminders: true,
  invoices_overdueNotifications: true,
  invoices_autoReminders: true,
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
  vendors_module: false,
  vendors_create: false,
  vendors_edit: false,
  vendors_delete: false,
  vendorPO_module: false,
  vendorPO_create: false,
  vendorPO_edit: false,
  vendorPO_delete: false,
  vendorPO_emailSending: false,
  vendorPO_pdfGeneration: false,
  vendorPO_statusTracking: false,
  grn_module: false,
  grn_create: false,
  grn_edit: false,
  grn_delete: false,
  grn_serialNumberTracking: false,
  grn_qualityNotes: false,
  serialNumber_tracking: false,
  serialNumber_search: false,
  serialNumber_export: false,
  serialNumber_history: false,
  // ==================== PRODUCTS & INVENTORY ====================
  products_module: true,
  products_create: true,
  products_edit: true,
  products_delete: true,
  products_sku: true,
  products_categories: true,
  products_pricing: true,
  products_reorderLevel: true,
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
  pdf_generation: false,
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
  email_integration: false,
  email_resend: true,
  email_smtp: true,
  email_welcome: true,
  email_quoteSending: false,
  email_invoiceSending: false,
  email_paymentReminders: false,
  email_overdueNotifications: false,
  email_vendorPO: false,
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
  security_twoFactor: false,
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
  advanced_scheduledReports: false,
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
  integration_externalApi: true
};
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
var featureFlags = getFeatureFlags();
function isFeatureEnabled(feature) {
  return featureFlags[feature];
}

// server/feature-flags-middleware.ts
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
function getFeatureFlagsEndpoint(req, res) {
  res.json(featureFlags);
}

// server/analytics-routes.ts
init_storage();
init_db();
import { Router } from "express";
import { sql as sql2 } from "drizzle-orm";
var router = Router();
router.get("/analytics/sales-quotes", async (req, res) => {
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
        valueByStatus[status] += parseFloat(quote.total.toString());
      }
    });
    const sentQuotes = quotesByStatus.sent + quotesByStatus.approved + quotesByStatus.rejected;
    const conversionRate = sentQuotes > 0 ? quotesByStatus.approved / sentQuotes * 100 : 0;
    const totalValue = allQuotes.reduce((sum, q) => sum + parseFloat(q.total.toString()), 0);
    const averageQuoteValue = allQuotes.length > 0 ? totalValue / allQuotes.length : 0;
    const customerQuotes = /* @__PURE__ */ new Map();
    allQuotes.forEach((quote) => {
      const existing = customerQuotes.get(quote.clientId);
      const value = parseFloat(quote.total.toString());
      if (existing) {
        existing.count++;
        existing.value += value;
      } else {
        const client = allClients.find((c) => c.id === quote.clientId);
        if (client) {
          customerQuotes.set(quote.clientId, {
            name: client.name,
            count: 1,
            value
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
        existing.value += parseFloat(quote.total.toString());
        if (quote.status === "approved") existing.approved++;
      } else {
        monthlyData.set(monthKey, {
          quotes: 1,
          value: parseFloat(quote.total.toString()),
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
      totalQuoteValue: Math.round(totalValue),
      topCustomers,
      monthlyTrend
    });
  } catch (error) {
    console.error("Error fetching sales analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});
router.get("/analytics/vendor-po", async (req, res) => {
  try {
    const allPOs = await db.execute(sql2`
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
      const amount = parseFloat(po.total_amount || 0);
      if (existing) {
        existing.spend += amount;
        existing.count++;
      } else {
        const vendor = allVendors.find((v) => v.id === po.vendor_id);
        if (vendor) {
          vendorSpend.set(po.vendor_id, {
            name: vendor.name,
            spend: amount,
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
      const amount = parseFloat(po.total_amount || 0);
      if (existing) {
        existing.spend += amount;
        existing.count++;
      } else {
        monthlySpendMap.set(monthKey, { spend: amount, count: 1 });
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
    console.error("Error fetching PO analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});
router.get("/analytics/invoice-collections", async (req, res) => {
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
      const paidAmt = parseFloat(invoice.paidAmount.toString());
      const totalAmt = parseFloat(invoice.total.toString());
      const remaining = totalAmt - paidAmt;
      if (invoice.paymentStatus === "paid") {
        invoicesByStatus.paid++;
        totalPaid += totalAmt;
        const invoiceDate = new Date(invoice.createdAt);
        const paidDate = new Date(invoice.updatedAt);
        const days = Math.floor((paidDate.getTime() - invoiceDate.getTime()) / (1e3 * 60 * 60 * 24));
        totalCollectionDays += days;
        paidInvoicesCount++;
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
      if (!invoice.isMaster) {
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
        const remaining = parseFloat(invoice.total.toString()) - parseFloat(invoice.paidAmount.toString());
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
      const totalAmt = parseFloat(invoice.total.toString());
      const paidAmt = parseFloat(invoice.paidAmount.toString());
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
    console.error("Error fetching invoice analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});
router.get("/analytics/serial-tracking", async (req, res) => {
  try {
    const serialNumbers2 = await db.execute(sql2`
      SELECT * FROM serial_numbers ORDER BY created_at DESC
    `);
    const totalSerials = serialNumbers2.rows.length;
    const serialsByStatus = {
      delivered: 0,
      in_stock: 0,
      returned: 0,
      defective: 0
    };
    serialNumbers2.rows.forEach((serial) => {
      const status = serial.status;
      if (serialsByStatus.hasOwnProperty(status)) {
        serialsByStatus[status]++;
      }
    });
    const serialsByProduct = [];
    const now = /* @__PURE__ */ new Date();
    const warrantyExpiring = serialNumbers2.rows.filter((serial) => serial.warranty_end_date).map((serial) => {
      const endDate = new Date(serial.warranty_end_date);
      const daysRemaining = Math.floor((endDate.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
      return {
        serialNumber: serial.serial_number,
        productName: "Product",
        // Would need actual product lookup
        customerName: "Customer",
        // Would need actual customer lookup
        warrantyEndDate: serial.warranty_end_date,
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
    console.error("Error fetching serial tracking analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});
var analytics_routes_default = router;

// server/routes.ts
init_db();
init_schema();
import { eq as eq3, desc as desc2, sql as sql4 } from "drizzle-orm";
function getJWTSecret() {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }
  return process.env.SESSION_SECRET;
}
var JWT_EXPIRES_IN = "15m";
async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const decoded = jwt.verify(token, getJWTSecret());
    const user = await storage.getUser(decoded.id);
    if (!user || user.status !== "active") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
async function registerRoutes(app2) {
  app2.use(cookieParser());
  app2.get("/api/feature-flags", getFeatureFlagsEndpoint);
  app2.post("/api/auth/signup", requireFeature("pages_signup"), async (req, res) => {
    try {
      const { email, backupEmail, password, name } = req.body;
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const refreshToken = nanoid(32);
      const refreshTokenExpiry = new Date(Date.now() + 1 * 24 * 60 * 60 * 1e3);
      const user = await storage.createUser({
        email,
        backupEmail,
        passwordHash,
        name,
        role: "viewer",
        status: "active",
        refreshToken,
        refreshTokenExpiry
      });
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        getJWTSecret(),
        { expiresIn: JWT_EXPIRES_IN }
      );
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1e3
        // 15 minutes
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1e3
        // 7 days
      });
      await storage.createActivityLog({
        userId: user.id,
        action: "signup",
        entityType: "user",
        entityId: user.id
      });
      try {
        await EmailService.sendWelcomeEmail(email, name);
      } catch (error) {
        console.error("Failed to send welcome email:", error);
      }
      return res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ error: error.message || "Failed to create account" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      console.log("Login attempt received");
      const { email, password } = req.body;
      if (!email || !password) {
        console.log("Missing email or password");
        return res.status(400).json({ error: "Email and password are required" });
      }
      console.log("Fetching user from database");
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log("User not found:", email);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      console.log("User found, checking status");
      if (user.status !== "active") {
        console.log("User account is not active:", user.status);
        return res.status(401).json({ error: "Account is inactive" });
      }
      console.log("Verifying password");
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        console.log("Invalid password");
        return res.status(401).json({ error: "Invalid credentials" });
      }
      console.log("Generating tokens");
      const refreshToken = nanoid(32);
      const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
      await storage.updateUser(user.id, {
        refreshToken,
        refreshTokenExpiry
      });
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        getJWTSecret(),
        { expiresIn: JWT_EXPIRES_IN }
      );
      console.log("Setting cookies");
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
      console.log("Creating activity log");
      await storage.createActivityLog({
        userId: user.id,
        action: "login",
        entityType: "user",
        entityId: user.id
      });
      console.log("Login successful");
      return res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (error) {
      console.error("Login error:", error);
      console.error("Error details:", {
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
  app2.post("/api/auth/logout", authMiddleware, async (req, res) => {
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
      console.error("Logout error:", error);
      res.clearCookie("token");
      res.clearCookie("refreshToken");
      return res.json({ success: true });
    }
  });
  app2.get("/api/auth/me", authMiddleware, async (req, res) => {
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
  app2.post("/api/auth/reset-password", requireFeature("pages_resetPassword"), async (req, res) => {
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
        console.error("Failed to send password reset email:", error);
      }
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to process request" });
    }
  });
  app2.post("/api/auth/reset-password-confirm", requireFeature("pages_resetPassword"), async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password are required" });
      }
      const users_list = await storage.getAllUsers();
      const user = users_list.find((u) => u.resetToken !== null && u.resetToken === token);
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
        console.warn(`Reset token already used or invalidated for user ${user.id}`);
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }
      console.log(`Password reset successful for user ${user.id}, token cleared`);
      await storage.createActivityLog({
        userId: user.id,
        action: "reset_password",
        entityType: "user",
        entityId: user.id
      });
      return res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password confirm error:", error);
      return res.status(500).json({ error: "Failed to reset password" });
    }
  });
  app2.post("/api/auth/refresh", async (req, res) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ error: "No refresh token" });
      }
      const users_list = await storage.getAllUsers();
      const user = users_list.find((u) => u.refreshToken === refreshToken);
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
      const newToken = jwt.sign(
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
      console.error("Refresh token error:", error);
      res.clearCookie("refreshToken");
      res.clearCookie("token");
      return res.status(500).json({ error: "Failed to refresh token" });
    }
  });
  app2.get("/api/users", authMiddleware, async (req, res) => {
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
  app2.post("/api/users", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const { email, backupEmail, password, name, role, status } = req.body;
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Email already exists" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        backupEmail,
        passwordHash,
        name,
        role: role || "user",
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
  app2.put("/api/users/:id", authMiddleware, async (req, res) => {
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
        updateData.passwordHash = await bcrypt.hash(password, 10);
      }
      const updatedUser = await storage.updateUser(userId, updateData);
      await storage.createActivityLog({
        userId: req.user.id,
        action: "update_user",
        entityType: "user",
        entityId: userId
      });
      return res.json(updatedUser);
    } catch (error) {
      return res.status(500).json({ error: error.message || "Failed to update user" });
    }
  });
  app2.delete("/api/users/:id", authMiddleware, async (req, res) => {
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
      console.error("Delete user error:", error);
      return res.status(500).json({ error: error.message || "Failed to delete user" });
    }
  });
  app2.get("/api/clients", requireFeature("clients_module"), authMiddleware, async (req, res) => {
    try {
      const clients2 = await storage.getAllClients();
      return res.json(clients2);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch clients" });
    }
  });
  app2.get("/api/clients/:id", requireFeature("clients_module"), authMiddleware, async (req, res) => {
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
  app2.post("/api/clients", requireFeature("clients_create"), authMiddleware, requirePermission("clients", "create"), async (req, res) => {
    try {
      const { name, email, phone } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: "Client name and email are required" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
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
  app2.put("/api/clients/:id", requireFeature("clients_edit"), authMiddleware, requirePermission("clients", "edit"), async (req, res) => {
    try {
      const { name, email } = req.body;
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
  app2.delete("/api/clients/:id", requireFeature("clients_delete"), authMiddleware, requirePermission("clients", "delete"), async (req, res) => {
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
  app2.get("/api/quotes", requireFeature("quotes_module"), authMiddleware, async (req, res) => {
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
      return res.json(quotesWithClients);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });
  app2.get("/api/quotes/:id", requireFeature("quotes_module"), authMiddleware, async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      const client = await storage.getClient(quote.clientId);
      const items = await storage.getQuoteItems(quote.id);
      const creator = await storage.getUser(quote.createdBy);
      return res.json({
        ...quote,
        client,
        items,
        createdByName: creator?.name || "Unknown"
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch quote" });
    }
  });
  app2.post("/api/quotes", requireFeature("quotes_create"), authMiddleware, requirePermission("quotes", "create"), async (req, res) => {
    try {
      const { items, ...quoteData } = req.body;
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
      const quote = await storage.createQuote({
        ...quoteData,
        quoteNumber,
        createdBy: req.user.id
      });
      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          await storage.createQuoteItem({
            quoteId: quote.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: String(item.unitPrice),
            subtotal: String(item.quantity * item.unitPrice),
            sortOrder: i,
            hsnSac: item.hsnSac || null
          });
        }
      }
      await storage.createActivityLog({
        userId: req.user.id,
        action: "create_quote",
        entityType: "quote",
        entityId: quote.id
      });
      return res.json(quote);
    } catch (error) {
      console.error("Create quote error:", error);
      return res.status(500).json({ error: error.message || "Failed to create quote" });
    }
  });
  app2.patch("/api/quotes/:id", authMiddleware, requirePermission("quotes", "edit"), async (req, res) => {
    try {
      const existingQuote = await storage.getQuote(req.params.id);
      if (!existingQuote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      if (existingQuote.status === "invoiced") {
        return res.status(400).json({ error: "Cannot edit an invoiced quote" });
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
      const updateData = { ...req.body };
      if (updateData.quoteDate) updateData.quoteDate = toDate(updateData.quoteDate);
      if (updateData.validUntil) updateData.validUntil = toDate(updateData.validUntil);
      const quote = await storage.updateQuote(req.params.id, updateData);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      await storage.createActivityLog({
        userId: req.user.id,
        action: "update_quote",
        entityType: "quote",
        entityId: quote.id
      });
      if (updateData.status === "sent" && existingQuote.status !== "sent") {
        try {
          const client = await storage.getClient(quote.clientId);
          if (client?.email) {
            const items = await storage.getQuoteItems(quote.id);
            const creator = await storage.getUser(quote.createdBy);
            const allSettings = await storage.getAllSettings();
            const settingsMap = allSettings.reduce((acc, s) => {
              acc[s.key] = s.value;
              return acc;
            }, {});
            const subjectTemplate = settingsMap["email_quote_subject"] || "Quote {QUOTE_NUMBER} from {COMPANY_NAME}";
            const bodyTemplate = settingsMap["email_quote_body"] || "Dear {CLIENT_NAME},\n\nPlease find attached quote {QUOTE_NUMBER} for your review.\n\nTotal Amount: {TOTAL}\nValid Until: {VALIDITY_DATE}\n\nBest regards,\n{COMPANY_NAME}";
            const companyName = settingsMap["company_name"] || settingsMap["companyName"] || "Company";
            const companyAddress = settingsMap["company_address"] || "";
            const companyPhone = settingsMap["company_phone"] || "";
            const companyEmail = settingsMap["company_email"] || "";
            const companyWebsite = settingsMap["company_website"] || "";
            const companyGSTIN = settingsMap["company_gstin"] || "";
            const currencySymbol = settingsMap["currencySymbol"] || "\u20B9";
            const quoteDate = new Date(quote.quoteDate);
            const validityDate = new Date(quoteDate);
            validityDate.setDate(validityDate.getDate() + (quote.validityDays || 30));
            const replacements = {
              "{COMPANY_NAME}": companyName,
              "{CLIENT_NAME}": client.name,
              "{QUOTE_NUMBER}": quote.quoteNumber,
              "{TOTAL}": `${currencySymbol}${Number(quote.total).toLocaleString()}`,
              "{VALIDITY_DATE}": validityDate.toLocaleDateString()
            };
            let emailSubject = subjectTemplate;
            let emailBody = bodyTemplate;
            Object.entries(replacements).forEach(([key, value]) => {
              const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              emailSubject = emailSubject.replace(new RegExp(escapedKey, "g"), value);
              emailBody = emailBody.replace(new RegExp(escapedKey, "g"), value);
            });
            const bankDetail = await storage.getActiveBankDetails();
            const bankName = bankDetail?.bankName || "";
            const bankAccountNumber = bankDetail?.accountNumber || "";
            const bankAccountName = bankDetail?.accountName || "";
            const bankIfscCode = bankDetail?.ifscCode || "";
            const bankBranch = bankDetail?.branch || "";
            const bankSwiftCode = bankDetail?.swiftCode || "";
            const pdfStream = PDFService.generateQuotePDF({
              quote,
              client,
              items,
              companyName,
              companyAddress,
              companyPhone,
              companyEmail,
              companyWebsite,
              companyGSTIN,
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
            });
            const chunks = [];
            await new Promise((resolve, reject) => {
              pdfStream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
              pdfStream.on("end", resolve);
              pdfStream.on("error", reject);
            });
            const pdfBuffer = Buffer.concat(chunks);
            await EmailService.sendQuoteEmail(
              client.email,
              emailSubject,
              emailBody,
              pdfBuffer
            );
            console.log(`[Auto-Email] Quote ${quote.quoteNumber} sent to ${client.email}`);
          }
        } catch (emailError) {
          console.error("[Auto-Email] Failed to send email:", emailError);
        }
      }
      return res.json(quote);
    } catch (error) {
      console.error("Update quote error:", error);
      return res.status(500).json({ error: error.message || "Failed to update quote" });
    }
  });
  app2.put("/api/quotes/:id", requireFeature("quotes_edit"), authMiddleware, requirePermission("quotes", "edit"), async (req, res) => {
    try {
      const existingQuote = await storage.getQuote(req.params.id);
      if (!existingQuote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      if (existingQuote.status === "invoiced") {
        return res.status(400).json({ error: "Cannot edit an invoiced quote" });
      }
      const { items, ...quoteData } = req.body;
      if (quoteData.quoteDate && typeof quoteData.quoteDate === "string") {
        quoteData.quoteDate = new Date(quoteData.quoteDate);
      }
      if (quoteData.validUntil && typeof quoteData.validUntil === "string") {
        quoteData.validUntil = new Date(quoteData.validUntil);
      }
      const quote = await storage.updateQuote(req.params.id, quoteData);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      if (items && Array.isArray(items)) {
        await storage.deleteQuoteItems(req.params.id);
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          await storage.createQuoteItem({
            quoteId: quote.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: String(item.unitPrice),
            subtotal: String(item.quantity * item.unitPrice),
            sortOrder: i,
            hsnSac: item.hsnSac || null
          });
        }
      }
      await storage.createActivityLog({
        userId: req.user.id,
        action: "update_quote",
        entityType: "quote",
        entityId: quote.id
      });
      return res.json(quote);
    } catch (error) {
      console.error("Update quote error:", error);
      return res.status(500).json({ error: error.message || "Failed to update quote" });
    }
  });
  app2.post("/api/quotes/:id/convert-to-invoice", authMiddleware, requirePermission("invoices", "create"), async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      const existingInvoices = await storage.getInvoicesByQuote(quote.id);
      const masterInvoice = existingInvoices.find((inv) => inv.isMaster);
      if (masterInvoice) {
        return res.status(400).json({ error: "Quote already has a master invoice" });
      }
      const invoiceNumber = await NumberingService.generateMasterInvoiceNumber();
      const invoice = await storage.createInvoice({
        invoiceNumber,
        quoteId: quote.id,
        paymentStatus: "pending",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
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
        isMaster: true,
        masterInvoiceStatus: "draft",
        createdBy: req.user.id
      });
      const quoteItems2 = await storage.getQuoteItems(quote.id);
      for (const item of quoteItems2) {
        await storage.createInvoiceItem({
          invoiceId: invoice.id,
          description: item.description,
          quantity: item.quantity,
          fulfilledQuantity: 0,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          status: "pending",
          sortOrder: item.sortOrder,
          hsnSac: item.hsnSac || null
        });
      }
      await storage.updateQuote(quote.id, { status: "invoiced" });
      await storage.createActivityLog({
        userId: req.user.id,
        action: "convert_to_invoice",
        entityType: "quote",
        entityId: quote.id
      });
      return res.json(invoice);
    } catch (error) {
      console.error("Convert to invoice error:", error);
      return res.status(500).json({ error: error.message || "Failed to convert to invoice" });
    }
  });
  app2.put("/api/invoices/:id/master-status", authMiddleware, requirePermission("invoices", "finalize"), async (req, res) => {
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
      return res.json(updatedInvoice);
    } catch (error) {
      console.error("Update master invoice status error:", error);
      return res.status(500).json({ error: error.message || "Failed to update master invoice status" });
    }
  });
  app2.put("/api/invoices/:id/master-details", authMiddleware, requirePermission("invoices", "edit"), async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      const isMasterInvoice = invoice.isMaster;
      const isChildInvoice = !!invoice.parentInvoiceId;
      const isRegularInvoice = !isMasterInvoice && !isChildInvoice;
      if (isMasterInvoice) {
        if (invoice.masterInvoiceStatus === "locked") {
          return res.status(400).json({
            error: "Cannot edit a locked master invoice"
          });
        }
      } else if (isChildInvoice || isRegularInvoice) {
        if (invoice.paymentStatus === "paid") {
          return res.status(400).json({
            error: "Cannot edit a paid invoice"
          });
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
          "paidAmount"
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
              const allChildInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId);
              const siblingInvoices = allChildInvoices.filter(
                (inv) => inv.parentInvoiceId === masterInvoice.id && inv.id !== invoice.id
              );
              const invoicedQuantities = {};
              for (const sibling of siblingInvoices) {
                const siblingItems = await storage.getInvoiceItems(sibling.id);
                for (const item of siblingItems) {
                  const key = item.description;
                  invoicedQuantities[key] = (invoicedQuantities[key] || 0) + item.quantity;
                }
              }
              for (const newItem of req.body.items) {
                const masterItem = masterItems.find((mi) => mi.description === newItem.description);
                if (!masterItem) {
                  return res.status(400).json({
                    error: `Item "${newItem.description}" not found in master invoice`
                  });
                }
                const alreadyInvoiced = invoicedQuantities[newItem.description] || 0;
                const remaining = masterItem.quantity - alreadyInvoiced;
                if (newItem.quantity > remaining) {
                  return res.status(400).json({
                    error: `Item "${newItem.description}" quantity (${newItem.quantity}) exceeds remaining quantity (${remaining})`
                  });
                }
              }
            }
          }
          await storage.deleteInvoiceItems(invoice.id);
          for (const item of req.body.items) {
            await storage.createInvoiceItem({
              invoiceId: invoice.id,
              description: item.description,
              quantity: item.quantity,
              fulfilledQuantity: item.fulfilledQuantity || 0,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
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
        return res.status(400).json({ error: "No valid fields to update" });
      }
      let updatedInvoice = invoice;
      if (Object.keys(updateData).length > 0) {
        updatedInvoice = await storage.updateInvoice(req.params.id, updateData) || invoice;
      }
      await storage.createActivityLog({
        userId: req.user.id,
        action: "update_master_invoice",
        entityType: "invoice",
        entityId: invoice.id
      });
      return res.json(updatedInvoice);
    } catch (error) {
      console.error("Update master invoice error:", error);
      return res.status(500).json({ error: error.message || "Failed to update master invoice" });
    }
  });
  app2.post("/api/invoices/:id/create-child-invoice", authMiddleware, requirePermission("invoices", "create"), async (req, res) => {
    try {
      const { items, dueDate, notes, deliveryNotes, milestoneDescription } = req.body;
      const masterInvoice = await storage.getInvoice(req.params.id);
      if (!masterInvoice) {
        return res.status(404).json({ error: "Master invoice not found" });
      }
      if (!masterInvoice.isMaster) {
        return res.status(400).json({ error: "This is not a master invoice" });
      }
      if (masterInvoice.masterInvoiceStatus === "draft") {
        return res.status(400).json({
          error: "Master invoice must be confirmed before creating child invoices"
        });
      }
      const masterItems = await storage.getInvoiceItems(masterInvoice.id);
      const allChildInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId);
      const siblingInvoices = allChildInvoices.filter((inv) => inv.parentInvoiceId === masterInvoice.id);
      const invoicedQuantities = {};
      for (const sibling of siblingInvoices) {
        const siblingItems = await storage.getInvoiceItems(sibling.id);
        for (const item of siblingItems) {
          const key = item.description;
          invoicedQuantities[key] = (invoicedQuantities[key] || 0) + item.quantity;
        }
      }
      for (const newItem of items) {
        const masterItem = masterItems.find((mi) => mi.description === newItem.description);
        if (!masterItem) {
          return res.status(400).json({
            error: `Item "${newItem.description}" not found in master invoice`
          });
        }
        const alreadyInvoiced = invoicedQuantities[newItem.description] || 0;
        const remaining = masterItem.quantity - alreadyInvoiced;
        if (newItem.quantity > remaining) {
          return res.status(400).json({
            error: `Item "${newItem.description}" quantity (${newItem.quantity}) exceeds remaining quantity (${remaining})`
          });
        }
      }
      let subtotal = 0;
      for (const item of items) {
        subtotal += Number(item.unitPrice) * item.quantity;
      }
      const masterSubtotal = Number(masterInvoice.subtotal);
      const ratio = masterSubtotal > 0 ? subtotal / masterSubtotal : 0;
      const cgst = (Number(masterInvoice.cgst) * ratio).toFixed(2);
      const sgst = (Number(masterInvoice.sgst) * ratio).toFixed(2);
      const igst = (Number(masterInvoice.igst) * ratio).toFixed(2);
      const shippingCharges = (Number(masterInvoice.shippingCharges) * ratio).toFixed(2);
      const discount = (Number(masterInvoice.discount) * ratio).toFixed(2);
      const total = subtotal + Number(cgst) + Number(sgst) + Number(igst) + Number(shippingCharges) - Number(discount);
      const childNumber = siblingInvoices.length + 1;
      const invoiceNumber = `${masterInvoice.invoiceNumber}-${childNumber}`;
      const childInvoice = await storage.createInvoice({
        invoiceNumber,
        parentInvoiceId: masterInvoice.id,
        quoteId: masterInvoice.quoteId,
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
      });
      for (const item of items) {
        await storage.createInvoiceItem({
          invoiceId: childInvoice.id,
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
      await storage.createActivityLog({
        userId: req.user.id,
        action: "create_child_invoice",
        entityType: "invoice",
        entityId: childInvoice.id
      });
      return res.json(childInvoice);
    } catch (error) {
      console.error("Create child invoice error:", error);
      return res.status(500).json({ error: error.message || "Failed to create child invoice" });
    }
  });
  app2.get("/api/invoices/:id/master-summary", authMiddleware, async (req, res) => {
    try {
      const masterInvoice = await storage.getInvoice(req.params.id);
      if (!masterInvoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      if (!masterInvoice.isMaster) {
        return res.status(400).json({ error: "This is not a master invoice" });
      }
      const masterItems = await storage.getInvoiceItems(masterInvoice.id);
      const allInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId);
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
      console.error("Get master invoice summary error:", error);
      return res.status(500).json({ error: error.message || "Failed to get master invoice summary" });
    }
  });
  app2.get("/api/quotes/:id/pdf", authMiddleware, async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
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
      const companyName = settings2.find((s) => s.key === "company_name")?.value || "OPTIVALUE TEK";
      const companyAddress = settings2.find((s) => s.key === "company_address")?.value || "";
      const companyPhone = settings2.find((s) => s.key === "company_phone")?.value || "";
      const companyEmail = settings2.find((s) => s.key === "company_email")?.value || "";
      const companyWebsite = settings2.find((s) => s.key === "company_website")?.value || "";
      const companyGSTIN = settings2.find((s) => s.key === "company_gstin")?.value || "";
      const bankDetail = await storage.getActiveBankDetails();
      const bankName = bankDetail?.bankName || "";
      const bankAccountNumber = bankDetail?.accountNumber || "";
      const bankAccountName = bankDetail?.accountName || "";
      const bankIfscCode = bankDetail?.ifscCode || "";
      const bankBranch = bankDetail?.branch || "";
      const bankSwiftCode = bankDetail?.swiftCode || "";
      const pdfStream = PDFService.generateQuotePDF({
        quote,
        client,
        items,
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        companyWebsite,
        companyGSTIN,
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
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="Quote-${quote.quoteNumber}.pdf"`);
      pdfStream.on("error", (err) => {
        console.error("PDF stream error:", err);
        if (!res.headersSent) {
          res.status(500).end("Failed to generate PDF");
        }
      });
      pdfStream.pipe(res);
      await storage.createActivityLog({
        userId: req.user.id,
        action: "export_pdf",
        entityType: "quote",
        entityId: quote.id
      });
    } catch (error) {
      console.error("PDF export error:", error);
      return res.status(500).json({ error: error.message || "Failed to generate PDF" });
    }
  });
  app2.post("/api/quotes/:id/email", authMiddleware, requirePermission("quotes", "view"), async (req, res) => {
    try {
      const { recipientEmail, message } = req.body;
      if (!recipientEmail) {
        return res.status(400).json({ error: "Recipient email is required" });
      }
      const quote = await storage.getQuote(req.params.id);
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
      const companyName = settings2.find((s) => s.key === "company_name")?.value || "OPTIVALUE TEK";
      const companyAddress = settings2.find((s) => s.key === "company_address")?.value || "";
      const companyPhone = settings2.find((s) => s.key === "company_phone")?.value || "";
      const companyEmail = settings2.find((s) => s.key === "company_email")?.value || "";
      const companyWebsite = settings2.find((s) => s.key === "company_website")?.value || "";
      const companyGSTIN = settings2.find((s) => s.key === "company_gstin")?.value || "";
      const emailSubjectTemplate = settings2.find((s) => s.key === "email_quote_subject")?.value || "Quote {QUOTE_NUMBER} from {COMPANY_NAME}";
      const emailBodyTemplate = settings2.find((s) => s.key === "email_quote_body")?.value || "Dear {CLIENT_NAME},\n\nPlease find attached quote {QUOTE_NUMBER} for your review.\n\nTotal Amount: {TOTAL}\nValid Until: {VALIDITY_DATE}\n\nBest regards,\n{COMPANY_NAME}";
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
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        emailSubject = emailSubject.replace(new RegExp(escapedKey, "g"), value);
        emailBody = emailBody.replace(new RegExp(escapedKey, "g"), value);
      });
      if (message) {
        emailBody = `${emailBody}

---
Additional Note:
${message}`;
      }
      const bankDetail = await storage.getActiveBankDetails();
      const bankName = bankDetail?.bankName || "";
      const bankAccountNumber = bankDetail?.accountNumber || "";
      const bankAccountName = bankDetail?.accountName || "";
      const bankIfscCode = bankDetail?.ifscCode || "";
      const bankBranch = bankDetail?.branch || "";
      const bankSwiftCode = bankDetail?.swiftCode || "";
      const pdfStream = PDFService.generateQuotePDF({
        quote,
        client,
        items,
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        companyWebsite,
        companyGSTIN,
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
      });
      const chunks = [];
      await new Promise((resolve, reject) => {
        pdfStream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        pdfStream.on("end", resolve);
        pdfStream.on("error", reject);
      });
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
      console.error("Email quote error:", error);
      return res.status(500).json({ error: error.message || "Failed to send quote email" });
    }
  });
  app2.get("/api/invoices", requireFeature("invoices_module"), authMiddleware, async (req, res) => {
    try {
      const invoices2 = await storage.getAllInvoices();
      const invoicesWithDetails = await Promise.all(
        invoices2.map(async (invoice) => {
          const quote = await storage.getQuote(invoice.quoteId);
          const client = quote ? await storage.getClient(quote.clientId) : null;
          return {
            ...invoice,
            quoteNumber: quote?.quoteNumber || "",
            clientName: client?.name || "Unknown",
            total: invoice.total,
            // Use invoice's total, not quote's
            isMaster: invoice.isMaster || false,
            parentInvoiceId: invoice.parentInvoiceId || null
          };
        })
      );
      return res.json(invoicesWithDetails);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });
  app2.get("/api/invoices/:id", requireFeature("invoices_module"), authMiddleware, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      const quote = await storage.getQuote(invoice.quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Related quote not found" });
      }
      const client = await storage.getClient(quote.clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      let items = await storage.getInvoiceItems(invoice.id);
      const isUsingQuoteItems = !items || items.length === 0;
      if (isUsingQuoteItems) {
        const quoteItems2 = await storage.getQuoteItems(quote.id);
        items = quoteItems2;
      }
      const creator = await storage.getUser(quote.createdBy);
      let childInvoices = [];
      if (invoice.isMaster) {
        const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId);
        childInvoices = allInvoices.filter((inv) => inv.parentInvoiceId === invoice.id).map((child) => ({
          id: child.id,
          invoiceNumber: child.invoiceNumber,
          total: child.total,
          paymentStatus: child.paymentStatus,
          createdAt: child.createdAt
        }));
      }
      const invoiceDetail = {
        ...invoice,
        quoteNumber: quote.quoteNumber,
        status: quote.status,
        isMaster: invoice.isMaster || false,
        parentInvoiceId: invoice.parentInvoiceId || null,
        childInvoices,
        client: {
          name: client.name,
          email: client.email,
          phone: client.phone || "",
          billingAddress: client.billingAddress || "",
          gstin: client.gstin || ""
        },
        items: items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          fulfilledQuantity: item.fulfilledQuantity || 0,
          serialNumbers: item.serialNumbers || null,
          status: item.status || "pending",
          hsnSac: item.hsnSac || item.hsn_sac || null
        })),
        subtotal: invoice.subtotal !== null && invoice.subtotal !== void 0 ? invoice.subtotal : quote.subtotal,
        discount: invoice.discount !== null && invoice.discount !== void 0 ? invoice.discount : quote.discount,
        cgst: invoice.cgst !== null && invoice.cgst !== void 0 ? invoice.cgst : quote.cgst,
        sgst: invoice.sgst !== null && invoice.sgst !== void 0 ? invoice.sgst : quote.sgst,
        igst: invoice.igst !== null && invoice.igst !== void 0 ? invoice.igst : quote.igst,
        shippingCharges: invoice.shippingCharges !== null && invoice.shippingCharges !== void 0 ? invoice.shippingCharges : quote.shippingCharges,
        total: invoice.total !== null && invoice.total !== void 0 ? invoice.total : quote.total,
        deliveryNotes: invoice.deliveryNotes || null,
        milestoneDescription: invoice.milestoneDescription || null,
        createdByName: creator?.name || "Unknown"
      };
      return res.json(invoiceDetail);
    } catch (error) {
      console.error("Get invoice error:", error);
      return res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });
  app2.put("/api/invoices/:id/payment-status", authMiddleware, requirePermission("payments", "create"), async (req, res) => {
    try {
      const { paymentStatus, paidAmount } = req.body;
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      const quote = await storage.getQuote(invoice.quoteId);
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
        updateData.lastPaymentDate = /* @__PURE__ */ new Date();
      }
      if (paymentStatus === "paid" && paidAmount === void 0) {
        const totalAmount = invoice.total ? Number(invoice.total) : Number(quote.total);
        updateData.paidAmount = String(totalAmount);
        updateData.lastPaymentDate = /* @__PURE__ */ new Date();
      }
      const updatedInvoice = await storage.updateInvoice(req.params.id, updateData);
      if (invoice.parentInvoiceId) {
        const masterInvoice = await storage.getInvoice(invoice.parentInvoiceId);
        if (masterInvoice) {
          const allInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId);
          const childInvoices = allInvoices.filter((inv) => inv.parentInvoiceId === masterInvoice.id);
          const totalChildPaidAmount = childInvoices.reduce((sum, child) => {
            const childPaid = child.id === invoice.id ? Number(updateData.paidAmount || 0) : Number(child.paidAmount || 0);
            return sum + childPaid;
          }, 0);
          const masterTotal = Number(masterInvoice.total);
          let masterPaymentStatus = "pending";
          if (totalChildPaidAmount >= masterTotal) {
            masterPaymentStatus = "paid";
          } else if (totalChildPaidAmount > 0) {
            masterPaymentStatus = "partial";
          }
          await storage.updateInvoice(masterInvoice.id, {
            paidAmount: String(totalChildPaidAmount),
            paymentStatus: masterPaymentStatus,
            lastPaymentDate: /* @__PURE__ */ new Date()
          });
          if (masterPaymentStatus === "paid") {
            const quote2 = await storage.getQuote(masterInvoice.quoteId);
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
        const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId);
        const allPaid = allInvoices.every((inv) => inv.paymentStatus === "paid");
        if (allPaid) {
          const quote2 = await storage.getQuote(invoice.quoteId);
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
      console.error("Update payment status error:", error);
      return res.status(500).json({ error: error.message || "Failed to update payment status" });
    }
  });
  app2.post("/api/invoices/:id/payment", authMiddleware, requirePermission("payments", "create"), async (req, res) => {
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
      const quote = await storage.getQuote(invoice.quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Related quote not found" });
      }
      await storage.createPaymentHistory({
        invoiceId: req.params.id,
        amount: String(amount),
        paymentMethod,
        transactionId: transactionId || void 0,
        notes: notes || void 0,
        paymentDate: paymentDate ? new Date(paymentDate) : /* @__PURE__ */ new Date(),
        recordedBy: req.user.id
      });
      const newPaidAmount = Number(invoice.paidAmount) + Number(amount);
      const totalAmount = Number(invoice.total || quote.total);
      let newPaymentStatus = invoice.paymentStatus;
      if (newPaidAmount >= totalAmount) {
        newPaymentStatus = "paid";
      } else if (newPaidAmount > 0) {
        newPaymentStatus = "partial";
      }
      const updatedInvoice = await storage.updateInvoice(req.params.id, {
        paidAmount: String(newPaidAmount),
        paymentStatus: newPaymentStatus,
        lastPaymentDate: /* @__PURE__ */ new Date(),
        paymentMethod
      });
      if (invoice.parentInvoiceId) {
        const masterInvoice = await storage.getInvoice(invoice.parentInvoiceId);
        if (masterInvoice) {
          const allInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId);
          const childInvoices = allInvoices.filter((inv) => inv.parentInvoiceId === masterInvoice.id);
          const totalChildPaidAmount = childInvoices.reduce((sum, child) => {
            const childPaid = child.id === invoice.id ? newPaidAmount : Number(child.paidAmount || 0);
            return sum + childPaid;
          }, 0);
          const masterTotal = Number(masterInvoice.total);
          let masterPaymentStatus = "pending";
          if (totalChildPaidAmount >= masterTotal) {
            masterPaymentStatus = "paid";
          } else if (totalChildPaidAmount > 0) {
            masterPaymentStatus = "partial";
          }
          await storage.updateInvoice(masterInvoice.id, {
            paidAmount: String(totalChildPaidAmount),
            paymentStatus: masterPaymentStatus,
            lastPaymentDate: /* @__PURE__ */ new Date()
          });
        }
      }
      await storage.createActivityLog({
        userId: req.user.id,
        action: "record_payment",
        entityType: "invoice",
        entityId: invoice.id
      });
      const updatedQuote = await storage.getQuote(invoice.quoteId);
      if (updatedQuote && updatedQuote.status === "invoiced") {
        const allInvoicesForQuote = await storage.getInvoicesByQuote(invoice.quoteId);
        const relevantInvoices = allInvoicesForQuote.filter((inv) => !inv.parentInvoiceId);
        const allPaid = relevantInvoices.every((inv) => inv.paymentStatus === "paid");
        if (allPaid && relevantInvoices.length > 0) {
          await storage.updateQuote(invoice.quoteId, {
            status: "closed_paid",
            closedAt: /* @__PURE__ */ new Date(),
            closedBy: req.user.id
          });
          await storage.createActivityLog({
            userId: req.user.id,
            action: "close_quote",
            entityType: "quote",
            entityId: updatedQuote.id
          });
        }
      }
      return res.json(updatedInvoice);
    } catch (error) {
      console.error("Record payment error:", error);
      return res.status(500).json({ error: error.message || "Failed to record payment" });
    }
  });
  app2.get("/api/invoices/:id/payment-history-detailed", authMiddleware, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      console.log(`[Payment History] Fetching for invoice ${req.params.id}, isMaster: ${invoice.isMaster}`);
      let payments;
      if (invoice.isMaster) {
        console.log(`[Payment History] Master invoice detected, aggregating child payments`);
        const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId);
        const childInvoices = allInvoices.filter((inv) => inv.parentInvoiceId === invoice.id);
        console.log(`[Payment History] Found ${childInvoices.length} child invoices:`, childInvoices.map((c) => c.id));
        const childPayments = await Promise.all(
          childInvoices.map((child) => storage.getPaymentHistory(child.id))
        );
        payments = childPayments.flat().sort(
          (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        );
        console.log(`[Payment History] Aggregated ${payments.length} payments from children`);
      } else {
        payments = await storage.getPaymentHistory(req.params.id);
        console.log(`[Payment History] Regular/child invoice, found ${payments.length} payments`);
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
      console.log(`[Payment History] Returning ${enrichedPayments.length} enriched payments`);
      return res.json(enrichedPayments);
    } catch (error) {
      console.error("Fetch payment history error:", error);
      return res.status(500).json({ error: "Failed to fetch payment history" });
    }
  });
  app2.get("/api/invoices/:id/payment-history", authMiddleware, async (req, res) => {
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
        paymentMethod: invoice.paymentMethod,
        history
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch payment history" });
    }
  });
  app2.delete("/api/payment-history/:id", authMiddleware, async (req, res) => {
    try {
      const payment = await storage.getPaymentById(req.params.id);
      if (!payment) {
        return res.status(404).json({ error: "Payment record not found" });
      }
      const invoice = await storage.getInvoice(payment.invoiceId);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      const quote = await storage.getQuote(invoice.quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Related quote not found" });
      }
      await storage.deletePaymentHistory(req.params.id);
      const allPayments = await storage.getPaymentHistory(payment.invoiceId);
      const newPaidAmount = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
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
        lastPaymentDate: lastPayment?.paymentDate || null,
        paymentMethod: lastPayment?.paymentMethod || null
      });
      if (invoice.parentInvoiceId) {
        const masterInvoice = await storage.getInvoice(invoice.parentInvoiceId);
        if (masterInvoice) {
          const allInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId);
          const childInvoices = allInvoices.filter((inv) => inv.parentInvoiceId === masterInvoice.id);
          const totalChildPaidAmount = childInvoices.reduce((sum, child) => {
            const childPaid = child.id === invoice.id ? newPaidAmount : Number(child.paidAmount || 0);
            return sum + childPaid;
          }, 0);
          const masterTotal = Number(masterInvoice.total);
          let masterPaymentStatus = "pending";
          if (totalChildPaidAmount >= masterTotal) {
            masterPaymentStatus = "paid";
          } else if (totalChildPaidAmount > 0) {
            masterPaymentStatus = "partial";
          }
          await storage.updateInvoice(masterInvoice.id, {
            paidAmount: String(totalChildPaidAmount),
            paymentStatus: masterPaymentStatus,
            lastPaymentDate: totalChildPaidAmount > 0 ? /* @__PURE__ */ new Date() : null
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
      console.error("Delete payment error:", error);
      return res.status(500).json({ error: error.message || "Failed to delete payment" });
    }
  });
  app2.get("/api/quotes/:id/pdf", authMiddleware, async (req, res) => {
    console.log(`[PDF Export START] Received request for quote: ${req.params.id}`);
    try {
      const quote = await storage.getQuote(req.params.id);
      console.log(`[PDF Export] Found quote: ${quote?.quoteNumber}`);
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
      const companyName = settings2.find((s) => s.key === "company_name")?.value || "OPTIVALUE TEK";
      const companyAddress = settings2.find((s) => s.key === "company_address")?.value || "";
      const companyPhone = settings2.find((s) => s.key === "company_phone")?.value || "";
      const companyEmail = settings2.find((s) => s.key === "company_email")?.value || "";
      const companyWebsite = settings2.find((s) => s.key === "company_website")?.value || "";
      const companyGSTIN = settings2.find((s) => s.key === "company_gstin")?.value || "";
      const bankDetail = await storage.getActiveBankDetails();
      const bankName = bankDetail?.bankName || "";
      const bankAccountNumber = bankDetail?.accountNumber || "";
      const bankAccountName = bankDetail?.accountName || "";
      const bankIfscCode = bankDetail?.ifscCode || "";
      const bankBranch = bankDetail?.branch || "";
      const bankSwiftCode = bankDetail?.swiftCode || "";
      const pdfStream = PDFService.generateQuotePDF({
        quote,
        client,
        items,
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        companyWebsite,
        companyGSTIN,
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
      });
      const cleanFilename = `Quote-${quote.quoteNumber}.pdf`.replace(/[^\w\-. ]/g, "_");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", "");
      res.setHeader("Content-Disposition", `attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`);
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      console.log(`[PDF Export] Quote #${quote.quoteNumber}`);
      console.log(`[PDF Export] Clean filename: ${cleanFilename}`);
      console.log(`[PDF Export] Content-Disposition header: attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`);
      console.log(`[PDF Export] About to pipe PDF stream`);
      pdfStream.pipe(res);
      console.log(`[PDF Export] PDF stream piped successfully`);
      await storage.createActivityLog({
        userId: req.user.id,
        action: "export_pdf",
        entityType: "quote",
        entityId: quote.id
      });
      console.log(`[PDF Export COMPLETE] Quote PDF exported successfully: ${quote.quoteNumber}`);
    } catch (error) {
      console.error("[PDF Export ERROR]", error);
      return res.status(500).json({ error: error.message || "Failed to generate PDF" });
    }
  });
  app2.get("/api/invoices/:id/pdf", authMiddleware, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      const quote = await storage.getQuote(invoice.quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Related quote not found" });
      }
      const client = await storage.getClient(quote.clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      let items = await storage.getInvoiceItems(invoice.id);
      if (!items || items.length === 0) {
        const quoteItems2 = await storage.getQuoteItems(quote.id);
        items = quoteItems2;
      }
      const creator = await storage.getUser(quote.createdBy);
      let parentInvoice = null;
      if (invoice.parentInvoiceId) {
        parentInvoice = await storage.getInvoice(invoice.parentInvoiceId);
      }
      let childInvoices = [];
      if (invoice.isMaster) {
        const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId);
        childInvoices = allInvoices.filter((inv) => inv.parentInvoiceId === invoice.id).map((child) => ({
          invoiceNumber: child.invoiceNumber,
          total: child.total,
          paymentStatus: child.paymentStatus,
          createdAt: child.createdAt
        }));
      }
      const settings2 = await storage.getAllSettings();
      const companyName = settings2.find((s) => s.key === "company_name")?.value || "OPTIVALUE TEK";
      const companyAddress = settings2.find((s) => s.key === "company_address")?.value || "";
      const companyPhone = settings2.find((s) => s.key === "company_phone")?.value || "";
      const companyEmail = settings2.find((s) => s.key === "company_email")?.value || "";
      const companyWebsite = settings2.find((s) => s.key === "company_website")?.value || "";
      const companyGSTIN = settings2.find((s) => s.key === "company_gstin")?.value || "";
      const bankDetail = await storage.getActiveBankDetails();
      const bankName = bankDetail?.bankName || "";
      const bankAccountNumber = bankDetail?.accountNumber || "";
      const bankAccountName = bankDetail?.accountName || "";
      const bankIfscCode = bankDetail?.ifscCode || "";
      const bankBranch = bankDetail?.branch || "";
      const bankSwiftCode = bankDetail?.swiftCode || "";
      const pdfStream = InvoicePDFService.generateInvoicePDF({
        quote,
        client,
        items,
        // Type cast to handle both invoice items and quote items
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        companyWebsite,
        companyGSTIN,
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
        dueDate: new Date(invoice.dueDate),
        paidAmount: invoice.paidAmount,
        paymentStatus: invoice.paymentStatus,
        // Master/Child invoice specific fields
        isMaster: invoice.isMaster,
        masterInvoiceStatus: invoice.masterInvoiceStatus || void 0,
        parentInvoiceNumber: parentInvoice?.invoiceNumber,
        childInvoices,
        deliveryNotes: invoice.deliveryNotes,
        milestoneDescription: invoice.milestoneDescription,
        // Use invoice totals (not quote totals)
        subtotal: invoice.subtotal,
        discount: invoice.discount,
        cgst: invoice.cgst,
        sgst: invoice.sgst,
        igst: invoice.igst,
        shippingCharges: invoice.shippingCharges,
        total: invoice.total,
        notes: invoice.notes,
        termsAndConditions: invoice.termsAndConditions,
        // Bank details
        bankName,
        bankAccountNumber,
        bankAccountName,
        bankIfscCode,
        bankBranch,
        bankSwiftCode
      });
      const cleanFilename = `Invoice-${invoice.invoiceNumber}.pdf`.replace(/[^\w\-. ]/g, "_");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", "");
      res.setHeader("Content-Disposition", `attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`);
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      console.log(`[PDF Export] Invoice #${invoice.invoiceNumber}`);
      console.log(`[PDF Export] Clean filename: ${cleanFilename}`);
      console.log(`[PDF Export] Content-Disposition header: attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`);
      pdfStream.pipe(res);
      await storage.createActivityLog({
        userId: req.user.id,
        action: "export_pdf",
        entityType: "invoice",
        entityId: invoice.id
      });
    } catch (error) {
      console.error("PDF export error:", error);
      return res.status(500).json({ error: error.message || "Failed to generate PDF" });
    }
  });
  app2.post("/api/invoices/:id/email", authMiddleware, requirePermission("invoices", "view"), async (req, res) => {
    try {
      const { recipientEmail, message } = req.body;
      if (!recipientEmail) {
        return res.status(400).json({ error: "Recipient email is required" });
      }
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      const quote = await storage.getQuote(invoice.quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Related quote not found" });
      }
      const client = await storage.getClient(quote.clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      const items = await storage.getQuoteItems(quote.id);
      const creator = await storage.getUser(quote.createdBy);
      const settings2 = await storage.getAllSettings();
      const companyName = settings2.find((s) => s.key === "company_name")?.value || "OPTIVALUE TEK";
      const companyAddress = settings2.find((s) => s.key === "company_address")?.value || "";
      const companyPhone = settings2.find((s) => s.key === "company_phone")?.value || "";
      const companyEmail = settings2.find((s) => s.key === "company_email")?.value || "";
      const companyWebsite = settings2.find((s) => s.key === "company_website")?.value || "";
      const companyGSTIN = settings2.find((s) => s.key === "company_gstin")?.value || "";
      const emailSubjectTemplate = settings2.find((s) => s.key === "email_invoice_subject")?.value || "Invoice {INVOICE_NUMBER} from {COMPANY_NAME}";
      const emailBodyTemplate = settings2.find((s) => s.key === "email_invoice_body")?.value || "Dear {CLIENT_NAME},\n\nPlease find attached invoice {INVOICE_NUMBER}.\n\nAmount Due: {TOTAL}\nDue Date: {DUE_DATE}\n\nPayment Details:\n{BANK_DETAILS}\n\nBest regards,\n{COMPANY_NAME}";
      const bankDetailRecord = await storage.getActiveBankDetails();
      const bankDetailsForEmail = bankDetailRecord ? `Bank: ${bankDetailRecord.bankName}
Account: ${bankDetailRecord.accountName}
Account Number: ${bankDetailRecord.accountNumber}
IFSC: ${bankDetailRecord.ifscCode}` : "Contact us for payment details";
      const variables = {
        "{COMPANY_NAME}": companyName,
        "{CLIENT_NAME}": client.name,
        "{INVOICE_NUMBER}": invoice.invoiceNumber,
        "{TOTAL}": `\u20B9${Number(invoice.total).toLocaleString()}`,
        "{OUTSTANDING}": `\u20B9${(Number(invoice.total) - Number(invoice.paidAmount)).toLocaleString()}`,
        "{DUE_DATE}": new Date(invoice.dueDate).toLocaleDateString(),
        "{BANK_DETAILS}": bankDetailsForEmail
      };
      let emailSubject = emailSubjectTemplate;
      let emailBody = emailBodyTemplate;
      Object.entries(variables).forEach(([key, value]) => {
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        emailSubject = emailSubject.replace(new RegExp(escapedKey, "g"), value);
        emailBody = emailBody.replace(new RegExp(escapedKey, "g"), value);
      });
      if (message) {
        emailBody = `${emailBody}

---
Additional Note:
${message}`;
      }
      const pdfStream = InvoicePDFService.generateInvoicePDF({
        quote,
        client,
        items,
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        companyWebsite,
        companyGSTIN,
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
        dueDate: new Date(invoice.dueDate),
        paidAmount: invoice.paidAmount,
        paymentStatus: invoice.paymentStatus,
        // Add missing invoice fields
        isMaster: invoice.isMaster,
        masterInvoiceStatus: invoice.masterInvoiceStatus || void 0,
        deliveryNotes: invoice.deliveryNotes,
        milestoneDescription: invoice.milestoneDescription,
        // Use invoice totals (not quote totals)
        subtotal: invoice.subtotal,
        discount: invoice.discount,
        cgst: invoice.cgst,
        sgst: invoice.sgst,
        igst: invoice.igst,
        shippingCharges: invoice.shippingCharges,
        total: invoice.total,
        notes: invoice.notes,
        termsAndConditions: invoice.termsAndConditions,
        // Bank details from dedicated table
        bankName: bankDetailRecord?.bankName || void 0,
        bankAccountNumber: bankDetailRecord?.accountNumber || void 0,
        bankAccountName: bankDetailRecord?.accountName || void 0,
        bankIfscCode: bankDetailRecord?.ifscCode || void 0,
        bankBranch: bankDetailRecord?.branch || void 0,
        bankSwiftCode: bankDetailRecord?.swiftCode || void 0
      });
      const chunks = [];
      await new Promise((resolve, reject) => {
        pdfStream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        pdfStream.on("end", resolve);
        pdfStream.on("error", reject);
      });
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
      console.error("Email invoice error:", error);
      return res.status(500).json({ error: error.message || "Failed to send invoice email" });
    }
  });
  app2.post("/api/invoices/:id/payment-reminder", authMiddleware, requirePermission("invoices", "view"), async (req, res) => {
    try {
      const { recipientEmail, message } = req.body;
      if (!recipientEmail) {
        return res.status(400).json({ error: "Recipient email is required" });
      }
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      const quote = await storage.getQuote(invoice.quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Related quote not found" });
      }
      const client = await storage.getClient(quote.clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      const settings2 = await storage.getAllSettings();
      const companyName = settings2.find((s) => s.key === "company_name")?.value || "OPTIVALUE TEK";
      const emailSubjectTemplate = settings2.find((s) => s.key === "email_payment_reminder_subject")?.value || "Payment Reminder: Invoice {INVOICE_NUMBER}";
      const emailBodyTemplate = settings2.find((s) => s.key === "email_payment_reminder_body")?.value || "Dear {CLIENT_NAME},\n\nThis is a friendly reminder that invoice {INVOICE_NUMBER} is due for payment.\n\nAmount Due: {OUTSTANDING}\nDue Date: {DUE_DATE}\nDays Overdue: {DAYS_OVERDUE}\n\nPlease arrange payment at your earliest convenience.\n\nBest regards,\n{COMPANY_NAME}";
      const dueDate = new Date(invoice.dueDate);
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
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        emailSubject = emailSubject.replace(new RegExp(escapedKey, "g"), value);
        emailBody = emailBody.replace(new RegExp(escapedKey, "g"), value);
      });
      if (message) {
        emailBody = `${emailBody}

---
Additional Note:
${message}`;
      }
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
      console.error("Payment reminder error:", error);
      return res.status(500).json({ error: error.message || "Failed to send payment reminder" });
    }
  });
  app2.get("/api/templates", authMiddleware, async (req, res) => {
    try {
      const type = req.query.type;
      const style = req.query.style;
      let templates2;
      if (type) {
        templates2 = await storage.getTemplatesByType(type);
      } else if (style) {
        templates2 = await storage.getTemplatesByStyle(style);
      } else {
        templates2 = await storage.getAllTemplates();
      }
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
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
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
      console.error("Create template error:", error);
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
      return res.json(template);
    } catch (error) {
      console.error("Update template error:", error);
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
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete template" });
    }
  });
  app2.get("/api/settings", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can access settings" });
      }
      const settingsArray = await storage.getAllSettings();
      const settingsObject = settingsArray.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      return res.json(settingsObject);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch settings" });
    }
  });
  app2.post("/api/settings", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can update settings" });
      }
      const body = req.body;
      if (body.key && body.value !== void 0) {
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
        for (const [key, value] of Object.entries(body)) {
          if (value !== void 0 && value !== null) {
            const setting = await storage.upsertSetting({
              key,
              value: String(value),
              updatedBy: req.user.id
            });
            results.push(setting);
          }
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
      return res.status(500).json({ error: error.message || "Failed to update setting" });
    }
  });
  app2.post("/api/settings/migrate-document-numbers", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can migrate document numbers" });
      }
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
      console.error("Document number migration error:", error);
      return res.status(500).json({
        error: error.message || "Failed to migrate document numbers",
        success: false
      });
    }
  });
  app2.get("/api/bank-details", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can access bank details" });
      }
      const details = await storage.getAllBankDetails();
      return res.json(details);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch bank details" });
    }
  });
  app2.get("/api/bank-details/active", authMiddleware, async (req, res) => {
    try {
      const detail = await storage.getActiveBankDetails();
      return res.json(detail || null);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch active bank details" });
    }
  });
  app2.post("/api/bank-details", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can create bank details" });
      }
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
  app2.put("/api/bank-details/:id", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can update bank details" });
      }
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
          ...isActive !== void 0 && { isActive }
        },
        req.user.id
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
  app2.delete("/api/bank-details/:id", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can delete bank details" });
      }
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
  app2.get("/api/vendors", authMiddleware, async (req, res) => {
    try {
      const vendors2 = await storage.getAllVendors();
      res.json(vendors2);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ error: "Failed to fetch vendors" });
    }
  });
  app2.get("/api/vendors/:id", authMiddleware, async (req, res) => {
    try {
      const vendor = await storage.getVendor(req.params.id);
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      console.error("Error fetching vendor:", error);
      res.status(500).json({ error: "Failed to fetch vendor" });
    }
  });
  app2.post("/api/vendors", authMiddleware, requirePermission("vendors", "create"), async (req, res) => {
    try {
      const vendor = await storage.createVendor({
        ...req.body,
        createdBy: req.user.id
      });
      res.json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(500).json({ error: "Failed to create vendor" });
    }
  });
  app2.patch("/api/vendors/:id", authMiddleware, requirePermission("vendors", "edit"), async (req, res) => {
    try {
      const updated = await storage.updateVendor(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ error: "Failed to update vendor" });
    }
  });
  app2.delete("/api/vendors/:id", authMiddleware, requirePermission("vendors", "delete"), async (req, res) => {
    try {
      await storage.deleteVendor(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vendor:", error);
      res.status(500).json({ error: "Failed to delete vendor" });
    }
  });
  app2.get("/api/vendor-pos", authMiddleware, async (req, res) => {
    try {
      const pos = await storage.getAllVendorPos();
      const enrichedPos = await Promise.all(
        pos.map(async (po) => {
          const vendor = await storage.getVendor(po.vendorId);
          const quote = await storage.getQuote(po.quoteId);
          return {
            ...po,
            vendorName: vendor?.name || "Unknown",
            quoteNumber: quote?.quoteNumber || "Unknown"
          };
        })
      );
      res.json(enrichedPos);
    } catch (error) {
      console.error("Error fetching vendor POs:", error);
      res.status(500).json({ error: "Failed to fetch vendor POs" });
    }
  });
  app2.get("/api/vendor-pos/:id", authMiddleware, async (req, res) => {
    try {
      const po = await storage.getVendorPo(req.params.id);
      if (!po) {
        return res.status(404).json({ error: "Vendor PO not found" });
      }
      const vendor = await storage.getVendor(po.vendorId);
      const quote = await storage.getQuote(po.quoteId);
      const items = await storage.getVendorPoItems(po.id);
      res.json({
        ...po,
        vendor: vendor || {},
        quote: { id: quote?.id, quoteNumber: quote?.quoteNumber },
        items
      });
    } catch (error) {
      console.error("Error fetching vendor PO:", error);
      res.status(500).json({ error: "Failed to fetch vendor PO" });
    }
  });
  app2.post("/api/quotes/:id/create-vendor-po", authMiddleware, requirePermission("vendor_pos", "create"), async (req, res) => {
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
      console.error("Error creating vendor PO:", error);
      res.status(500).json({ error: "Failed to create vendor PO" });
    }
  });
  app2.patch("/api/vendor-pos/:id", authMiddleware, async (req, res) => {
    try {
      const updated = await storage.updateVendorPo(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Vendor PO not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating vendor PO:", error);
      res.status(500).json({ error: "Failed to update vendor PO" });
    }
  });
  app2.patch("/api/vendor-pos/:id/items/:itemId/serials", authMiddleware, async (req, res) => {
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
      console.error("Error updating serial numbers:", error);
      res.status(500).json({ error: "Failed to update serial numbers" });
    }
  });
  app2.get("/api/quotes/:id/invoices", authMiddleware, async (req, res) => {
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
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });
  app2.post("/api/quotes/:id/create-invoice", authMiddleware, requirePermission("invoices", "create"), async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      const { parentInvoiceId, isMaster = false } = req.body;
      let invoiceNumber;
      if (parentInvoiceId) {
        const parentInvoice = await storage.getInvoice(parentInvoiceId);
        if (!parentInvoice) {
          return res.status(404).json({ error: "Parent invoice not found" });
        }
        const allInvoices = await storage.getInvoicesByQuote(quote.id);
        const siblings = allInvoices.filter((inv) => inv.parentInvoiceId === parentInvoiceId);
        const childNumber = siblings.length + 1;
        invoiceNumber = `${parentInvoice.invoiceNumber}-${childNumber}`;
      } else if (isMaster) {
        invoiceNumber = await NumberingService.generateMasterInvoiceNumber();
      } else {
        invoiceNumber = await NumberingService.generateChildInvoiceNumber();
      }
      const dueDate = /* @__PURE__ */ new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const invoice = await storage.createInvoice({
        invoiceNumber,
        quoteId: quote.id,
        parentInvoiceId: parentInvoiceId || null,
        isMaster: parentInvoiceId ? false : isMaster || false,
        paymentStatus: "pending",
        dueDate,
        paidAmount: "0",
        subtotal: req.body.subtotal || quote.subtotal,
        discount: req.body.discount || quote.discount,
        cgst: req.body.cgst || quote.cgst,
        sgst: req.body.sgst || quote.sgst,
        igst: req.body.igst || quote.igst,
        shippingCharges: req.body.shippingCharges || quote.shippingCharges,
        total: req.body.total || quote.total,
        notes: req.body.notes || quote.notes,
        termsAndConditions: req.body.termsAndConditions || quote.termsAndConditions,
        deliveryNotes: req.body.deliveryNotes || null,
        milestoneDescription: req.body.milestoneDescription || null,
        createdBy: req.user.id
      });
      if (req.body.items && Array.isArray(req.body.items) && req.body.items.length > 0) {
        for (const item of req.body.items) {
          await storage.createInvoiceItem({
            invoiceId: invoice.id,
            description: item.description,
            quantity: item.quantity,
            fulfilledQuantity: 0,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            status: "pending",
            sortOrder: item.sortOrder || 0,
            hsnSac: item.hsnSac || null
          });
        }
      } else {
        const quoteItems2 = await storage.getQuoteItems(quote.id);
        for (const item of quoteItems2) {
          await storage.createInvoiceItem({
            invoiceId: invoice.id,
            description: item.description,
            quantity: item.quantity,
            fulfilledQuantity: 0,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            status: "pending",
            sortOrder: item.sortOrder,
            hsnSac: item.hsnSac || null
          });
        }
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });
  app2.patch("/api/invoices/:id/items/:itemId/serials", authMiddleware, requirePermission("serial_numbers", "edit"), async (req, res) => {
    try {
      const { serialNumbers: serialNumbers2 } = req.body;
      console.log(`Updating serial numbers for item ${req.params.itemId} in invoice ${req.params.id}`);
      console.log(`Serial numbers count: ${serialNumbers2?.length || 0}`);
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
        console.log(`This is a child invoice. Parent: ${invoice.parentInvoiceId}`);
        console.log(`Syncing with master invoice...`);
        const masterItems = await storage.getInvoiceItems(invoice.parentInvoiceId);
        console.log(`Searching for master item with:`);
        console.log(`  Description: "${invoiceItem.description}"`);
        console.log(`  Unit Price: ${invoiceItem.unitPrice}`);
        console.log(`
Available master items:`);
        masterItems.forEach((mi, index) => {
          console.log(`  [${index}] Description: "${mi.description}", Unit Price: ${mi.unitPrice}`);
        });
        const masterItem = masterItems.find(
          (mi) => mi.description === invoiceItem.description && Number(mi.unitPrice) === Number(invoiceItem.unitPrice)
        );
        if (masterItem) {
          console.log(`Found master item: ${masterItem.description} (ID: ${masterItem.id})`);
          const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId);
          const childInvoices = allInvoices.filter((inv) => inv.parentInvoiceId === invoice.parentInvoiceId);
          console.log(`Found ${childInvoices.length} child invoices for this master`);
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
                console.log(`  Child ${childInvoice.invoiceNumber}: ${serials.length} serial numbers`);
              } catch (e) {
                console.error("Error parsing serial numbers:", e);
              }
            }
          }
          console.log(`Total aggregated serial numbers: ${allChildSerialNumbers.length}`);
          await storage.updateInvoiceItem(masterItem.id, {
            serialNumbers: allChildSerialNumbers.length > 0 ? JSON.stringify(allChildSerialNumbers) : null,
            status: masterItem.fulfilledQuantity >= masterItem.quantity ? "fulfilled" : "pending"
          });
          console.log(`\u2713 Master item updated successfully with ${allChildSerialNumbers.length} serial numbers`);
        } else {
          console.log(`\u26A0 No matching master item found for: ${invoiceItem.description}`);
        }
      } else {
        console.log(`This is not a child invoice or is a master invoice itself`);
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating serial numbers:", error);
      res.status(500).json({ error: "Failed to update serial numbers" });
    }
  });
  app2.post("/api/invoices/:id/items/:itemId/serials/validate", authMiddleware, requirePermission("serial_numbers", "view"), async (req, res) => {
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
      console.error("Error validating serial numbers:", error);
      return res.status(500).json({ error: error.message || "Failed to validate serial numbers" });
    }
  });
  app2.get("/api/invoices/:id/serials/permissions", authMiddleware, async (req, res) => {
    try {
      const { canEditSerialNumbers: canEditSerialNumbers2 } = await Promise.resolve().then(() => (init_serial_number_service(), serial_number_service_exports));
      const { id: invoiceId } = req.params;
      const permissions = await canEditSerialNumbers2(req.user.id, invoiceId);
      return res.json(permissions);
    } catch (error) {
      console.error("Error checking serial edit permissions:", error);
      return res.status(500).json({ error: error.message || "Failed to check permissions" });
    }
  });
  app2.get("/api/serial-numbers/search", authMiddleware, async (req, res) => {
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
      console.error("Error searching serial number:", error);
      return res.status(500).json({ error: error.message || "Failed to search serial number" });
    }
  });
  app2.post("/api/serial-numbers/batch-validate", authMiddleware, async (req, res) => {
    try {
      const { getSerialTraceability: getSerialTraceability2 } = await Promise.resolve().then(() => (init_serial_number_service(), serial_number_service_exports));
      const { serials } = req.body;
      if (!serials || !Array.isArray(serials)) {
        return res.status(400).json({ error: "Invalid serials array" });
      }
      const results = await Promise.all(
        serials.map(async (serial) => {
          const traceability = await getSerialTraceability2(serial);
          return {
            serial,
            exists: !!traceability,
            info: traceability
          };
        })
      );
      return res.json({ results });
    } catch (error) {
      console.error("Error batch validating serials:", error);
      return res.status(500).json({ error: error.message || "Failed to validate serials" });
    }
  });
  app2.post("/api/invoices/:masterId/create-child", authMiddleware, requirePermission("invoices", "create"), async (req, res) => {
    try {
      const { masterId } = req.params;
      const { items, milestoneDescription, deliveryNotes, notes } = req.body;
      console.log("Creating child invoice for master:", masterId);
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      const masterInvoice = await storage.getInvoice(masterId);
      if (!masterInvoice) {
        console.error("Master invoice not found:", masterId);
        return res.status(404).json({ error: "Master invoice not found" });
      }
      if (!masterInvoice.isMaster) {
        console.error("Invoice is not a master invoice:", masterId);
        return res.status(400).json({ error: "Invoice is not a master invoice" });
      }
      const masterItems = await storage.getInvoiceItems(masterId);
      console.log("Master items count:", masterItems?.length || 0);
      if (!masterItems || masterItems.length === 0) {
        console.error("Master invoice has no items");
        return res.status(400).json({ error: "Master invoice has no items" });
      }
      if (!items || !Array.isArray(items) || items.length === 0) {
        console.error("Invalid items array:", items);
        return res.status(400).json({ error: "Items array is required and must not be empty" });
      }
      for (const item of items) {
        const masterItem = masterItems.find((mi) => mi.id === item.itemId);
        if (!masterItem) {
          console.error("Item not found in master:", item.itemId);
          return res.status(400).json({ error: `Item ${item.itemId} not found in master invoice` });
        }
        const remaining = masterItem.quantity - masterItem.fulfilledQuantity;
        console.log(`Item ${masterItem.description}: qty=${item.quantity}, remaining=${remaining}`);
        if (item.quantity > remaining) {
          console.error(`Over-invoicing detected: requested=${item.quantity}, remaining=${remaining}`);
          return res.status(400).json({
            error: `Cannot invoice ${item.quantity} of "${masterItem.description}". Only ${remaining} remaining.`
          });
        }
      }
      const allInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId);
      const siblings = allInvoices.filter((inv) => inv.parentInvoiceId === masterId);
      const childNumber = siblings.length + 1;
      const childInvoiceNumber = `${masterInvoice.invoiceNumber}-${childNumber}`;
      let subtotal = 0;
      console.log("Calculating subtotal for child invoice...");
      for (const item of items) {
        const masterItem = masterItems.find((mi) => mi.id === item.itemId);
        if (!masterItem) {
          console.error("Master item not found during calculation:", item.itemId);
          continue;
        }
        const itemSubtotal = Number(masterItem.unitPrice) * item.quantity;
        console.log(`  Item: ${masterItem.description}, unitPrice: ${masterItem.unitPrice}, qty: ${item.quantity}, subtotal: ${itemSubtotal}`);
        subtotal += itemSubtotal;
      }
      console.log("Total subtotal:", subtotal);
      const masterSubtotal = Number(masterInvoice.subtotal);
      console.log("Master subtotal:", masterSubtotal);
      const ratio = masterSubtotal > 0 ? subtotal / masterSubtotal : 0;
      console.log("Ratio:", ratio);
      const discount = Number(masterInvoice.discount) * ratio;
      const cgst = Number(masterInvoice.cgst) * ratio;
      const sgst = Number(masterInvoice.sgst) * ratio;
      const igst = Number(masterInvoice.igst) * ratio;
      const shippingCharges = Number(masterInvoice.shippingCharges) * ratio;
      console.log("Calculated amounts - discount:", discount, "cgst:", cgst, "sgst:", sgst, "igst:", igst, "shipping:", shippingCharges);
      const total = subtotal - discount + cgst + sgst + igst + shippingCharges;
      console.log("Final total:", total);
      const childInvoice = await storage.createInvoice({
        invoiceNumber: childInvoiceNumber,
        parentInvoiceId: masterId,
        quoteId: masterInvoice.quoteId,
        paymentStatus: "pending",
        dueDate: masterInvoice.dueDate ? new Date(masterInvoice.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        igst: igst.toFixed(2),
        shippingCharges: shippingCharges.toFixed(2),
        total: total.toFixed(2),
        paidAmount: "0",
        isMaster: false,
        milestoneDescription: milestoneDescription || null,
        deliveryNotes: deliveryNotes || null,
        notes: notes || masterInvoice.notes || null,
        termsAndConditions: masterInvoice.termsAndConditions || null,
        createdBy: req.user.id
      });
      for (const item of items) {
        const masterItem = masterItems.find((mi) => mi.id === item.itemId);
        if (!masterItem) continue;
        await storage.createInvoiceItem({
          invoiceId: childInvoice.id,
          description: masterItem.description,
          quantity: item.quantity,
          fulfilledQuantity: 0,
          unitPrice: masterItem.unitPrice,
          subtotal: (Number(masterItem.unitPrice) * item.quantity).toFixed(2),
          serialNumbers: item.serialNumbers ? JSON.stringify(item.serialNumbers) : null,
          status: "pending",
          sortOrder: masterItem.sortOrder,
          hsnSac: masterItem.hsnSac || null
        });
        await db.update(invoiceItems).set({
          fulfilledQuantity: sql4`${invoiceItems.fulfilledQuantity} + ${item.quantity}`,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq3(invoiceItems.id, masterItem.id));
      }
      await db.insert(activityLogs).values({
        userId: req.user.id,
        action: "child_invoice_created",
        entityType: "invoice",
        entityId: childInvoice.id
      });
      res.json(childInvoice);
    } catch (error) {
      console.error("Error creating child invoice:", error);
      res.status(500).json({ error: "Failed to create child invoice" });
    }
  });
  app2.get("/api/products", authMiddleware, async (req, res) => {
    try {
      const products2 = await db.select().from(products).orderBy(products.name);
      res.json(products2);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/:id", authMiddleware, async (req, res) => {
    try {
      const [product] = await db.select().from(products).where(eq3(products.id, req.params.id));
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });
  app2.post("/api/products", authMiddleware, async (req, res) => {
    try {
      const [product] = await db.insert(products).values({
        ...req.body,
        createdBy: req.user.id
      }).returning();
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });
  app2.patch("/api/products/:id", authMiddleware, async (req, res) => {
    try {
      const [updated] = await db.update(products).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(products.id, req.params.id)).returning();
      if (!updated) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });
  app2.get("/api/grns", authMiddleware, async (req, res) => {
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
        eq3(goodsReceivedNotes.vendorPoId, vendorPurchaseOrders.id)
      ).leftJoin(
        vendors,
        eq3(vendorPurchaseOrders.vendorId, vendors.id)
      ).orderBy(desc2(goodsReceivedNotes.receivedDate));
      res.json(grns);
    } catch (error) {
      console.error("Error fetching GRNs:", error);
      res.status(500).json({ error: "Failed to fetch GRNs" });
    }
  });
  app2.get("/api/grns/:id", authMiddleware, async (req, res) => {
    try {
      const [grn] = await db.select({
        id: goodsReceivedNotes.id,
        grnNumber: goodsReceivedNotes.grnNumber,
        vendorPoId: goodsReceivedNotes.vendorPoId,
        vendorPoItemId: goodsReceivedNotes.vendorPoItemId,
        receivedDate: goodsReceivedNotes.receivedDate,
        quantityOrdered: goodsReceivedNotes.quantityOrdered,
        quantityReceived: goodsReceivedNotes.quantityReceived,
        quantityRejected: goodsReceivedNotes.quantityRejected,
        inspectionStatus: goodsReceivedNotes.inspectionStatus,
        inspectedBy: goodsReceivedNotes.inspectedBy,
        inspectionNotes: goodsReceivedNotes.inspectionNotes,
        deliveryNoteNumber: goodsReceivedNotes.deliveryNoteNumber,
        batchNumber: goodsReceivedNotes.batchNumber,
        attachments: goodsReceivedNotes.attachments
      }).from(goodsReceivedNotes).where(eq3(goodsReceivedNotes.id, req.params.id));
      if (!grn) {
        return res.status(404).json({ error: "GRN not found" });
      }
      const [po] = await db.select().from(vendorPurchaseOrders).where(eq3(vendorPurchaseOrders.id, grn.vendorPoId));
      const [vendor] = await db.select().from(vendors).where(eq3(vendors.id, po.vendorId));
      const [poItem] = await db.select().from(vendorPoItems).where(eq3(vendorPoItems.id, grn.vendorPoItemId));
      let inspector = null;
      if (grn.inspectedBy) {
        [inspector] = await db.select({ id: users.id, name: users.name }).from(users).where(eq3(users.id, grn.inspectedBy));
      }
      res.json({
        ...grn,
        vendorPo: {
          id: po.id,
          poNumber: po.poNumber,
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
      console.error("Error fetching GRN:", error);
      res.status(500).json({ error: "Failed to fetch GRN" });
    }
  });
  app2.post("/api/grns", authMiddleware, async (req, res) => {
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
      const [poItem] = await db.select().from(vendorPoItems).where(eq3(vendorPoItems.id, vendorPoItemId));
      await db.update(vendorPoItems).set({
        receivedQuantity: (poItem.receivedQuantity || 0) + quantityReceived,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(vendorPoItems.id, vendorPoItemId));
      if (serialNumbers2 && Array.isArray(serialNumbers2) && serialNumbers2.length > 0) {
        const serialRecords = serialNumbers2.map((sn) => ({
          serialNumber: sn,
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
      console.error("Error creating GRN:", error);
      res.status(500).json({ error: error.message || "Failed to create GRN" });
    }
  });
  app2.patch("/api/grns/:id", authMiddleware, async (req, res) => {
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
      }).where(eq3(goodsReceivedNotes.id, req.params.id)).returning();
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
      console.error("Error updating GRN:", error);
      res.status(500).json({ error: error.message || "Failed to update GRN" });
    }
  });
  app2.post("/api/serial-numbers/bulk", authMiddleware, async (req, res) => {
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
      const existing = await db.select().from(serialNumbers).where(sql4`${serialNumbers.serialNumber} = ANY(${serialNumbers2})`);
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
      res.json({ count: created.length, serialNumbers: created });
    } catch (error) {
      console.error("Error importing serial numbers:", error);
      res.status(500).json({ error: error.message || "Failed to import serial numbers" });
    }
  });
  app2.get("/api/serial-numbers/:serialNumber", authMiddleware, async (req, res) => {
    try {
      const [serial] = await db.select().from(serialNumbers).where(eq3(serialNumbers.serialNumber, req.params.serialNumber));
      if (!serial) {
        return res.status(404).json({ error: "Serial number not found" });
      }
      let product = null;
      if (serial.productId) {
        [product] = await db.select({ id: products.id, name: products.name, sku: products.sku }).from(products).where(eq3(products.id, serial.productId));
      }
      let vendor = null;
      if (serial.vendorId) {
        [vendor] = await db.select({ id: vendors.id, name: vendors.name }).from(vendors).where(eq3(vendors.id, serial.vendorId));
      }
      let vendorPo = null;
      if (serial.vendorPoId) {
        [vendorPo] = await db.select({
          id: vendorPurchaseOrders.id,
          poNumber: vendorPurchaseOrders.poNumber,
          orderDate: vendorPurchaseOrders.orderDate
        }).from(vendorPurchaseOrders).where(eq3(vendorPurchaseOrders.id, serial.vendorPoId));
      }
      let grn = null;
      if (serial.grnId) {
        [grn] = await db.select({
          id: goodsReceivedNotes.id,
          grnNumber: goodsReceivedNotes.grnNumber,
          receivedDate: goodsReceivedNotes.receivedDate,
          inspectionStatus: goodsReceivedNotes.inspectionStatus
        }).from(goodsReceivedNotes).where(eq3(goodsReceivedNotes.id, serial.grnId));
      }
      let invoice = null;
      if (serial.invoiceId) {
        [invoice] = await db.select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          createdAt: invoices.createdAt
        }).from(invoices).where(eq3(invoices.id, serial.invoiceId));
      }
      res.json({
        ...serial,
        product,
        vendor,
        vendorPo,
        grn,
        invoice
      });
    } catch (error) {
      console.error("Error fetching serial number:", error);
      res.status(500).json({ error: "Failed to fetch serial number" });
    }
  });
  app2.get("/api/analytics/dashboard", authMiddleware, async (req, res) => {
    try {
      const quotes2 = await storage.getAllQuotes();
      const clients2 = await storage.getAllClients();
      const invoices2 = await storage.getAllInvoices();
      const totalQuotes = quotes2.length;
      const totalClients = clients2.length;
      const approvedQuotes = quotes2.filter((q) => q.status === "approved" || q.status === "invoiced");
      const totalRevenue = approvedQuotes.reduce((sum, q) => sum + Number(q.total), 0);
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
        const revenue = monthQuotes.reduce((sum, q) => sum + Number(q.total), 0);
        monthlyRevenue.push({ month, revenue });
      }
      return res.json({
        totalQuotes,
        totalClients,
        totalRevenue: totalRevenue.toFixed(2),
        conversionRate,
        recentQuotes,
        quotesByStatus,
        monthlyRevenue
      });
    } catch (error) {
      console.error("Analytics error:", error);
      return res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/analytics/:timeRange(\\d+)", authMiddleware, async (req, res) => {
    try {
      const timeRange = req.params.timeRange ? Number(req.params.timeRange) : 12;
      const quotes2 = await storage.getAllQuotes();
      const clients2 = await storage.getAllClients();
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
      console.error("Analytics error:", error);
      return res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/analytics/forecast", authMiddleware, async (req, res) => {
    try {
      const monthsAhead = req.query.months ? Number(req.query.months) : 3;
      const forecast = await analyticsService.getRevenueForecast(monthsAhead);
      return res.json(forecast);
    } catch (error) {
      console.error("Forecast error:", error);
      return res.status(500).json({ error: "Failed to fetch forecast" });
    }
  });
  app2.get("/api/analytics/deal-distribution", authMiddleware, async (req, res) => {
    try {
      const distribution = await analyticsService.getDealDistribution();
      return res.json(distribution);
    } catch (error) {
      console.error("Deal distribution error:", error);
      return res.status(500).json({ error: "Failed to fetch deal distribution" });
    }
  });
  app2.get("/api/analytics/regional", authMiddleware, async (req, res) => {
    try {
      const regionalData = await analyticsService.getRegionalDistribution();
      return res.json(regionalData);
    } catch (error) {
      console.error("Regional data error:", error);
      return res.status(500).json({ error: "Failed to fetch regional data" });
    }
  });
  app2.post("/api/analytics/custom-report", authMiddleware, async (req, res) => {
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
      console.error("Custom report error:", error);
      return res.status(500).json({ error: "Failed to generate custom report" });
    }
  });
  app2.get("/api/analytics/pipeline", authMiddleware, async (req, res) => {
    try {
      const pipeline = await analyticsService.getSalesPipeline();
      return res.json(pipeline);
    } catch (error) {
      console.error("Pipeline error:", error);
      return res.status(500).json({ error: "Failed to fetch pipeline data" });
    }
  });
  app2.get("/api/analytics/client/:clientId/ltv", authMiddleware, async (req, res) => {
    try {
      const ltv = await analyticsService.getClientLifetimeValue(req.params.clientId);
      return res.json(ltv);
    } catch (error) {
      console.error("LTV error:", error);
      return res.status(500).json({ error: "Failed to fetch client LTV" });
    }
  });
  app2.get("/api/analytics/competitor-insights", authMiddleware, async (req, res) => {
    try {
      const insights = await analyticsService.getCompetitorInsights();
      return res.json(insights);
    } catch (error) {
      console.error("Competitor insights error:", error);
      return res.status(500).json({ error: "Failed to fetch competitor insights" });
    }
  });
  app2.get("/api/analytics/vendor-spend", authMiddleware, async (req, res) => {
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
      console.error("Vendor analytics error:", error);
      return res.status(500).json({ error: "Failed to fetch vendor analytics" });
    }
  });
  app2.get("/api/clients/:clientId/tags", authMiddleware, async (req, res) => {
    try {
      const tags = await storage.getClientTags(req.params.clientId);
      return res.json(tags);
    } catch (error) {
      console.error("Get tags error:", error);
      return res.status(500).json({ error: "Failed to fetch client tags" });
    }
  });
  app2.post("/api/clients/:clientId/tags", authMiddleware, async (req, res) => {
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
      console.error("Add tag error:", error);
      return res.status(500).json({ error: "Failed to add tag" });
    }
  });
  app2.delete("/api/clients/tags/:tagId", authMiddleware, async (req, res) => {
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
      console.error("Remove tag error:", error);
      return res.status(500).json({ error: "Failed to remove tag" });
    }
  });
  app2.get("/api/clients/:clientId/communications", authMiddleware, async (req, res) => {
    try {
      const communications = await storage.getClientCommunications(req.params.clientId);
      return res.json(communications);
    } catch (error) {
      console.error("Get communications error:", error);
      return res.status(500).json({ error: "Failed to fetch communications" });
    }
  });
  app2.post("/api/clients/:clientId/communications", authMiddleware, async (req, res) => {
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
      console.error("Create communication error:", error);
      return res.status(500).json({ error: error.message || "Failed to create communication" });
    }
  });
  app2.delete("/api/clients/communications/:commId", authMiddleware, async (req, res) => {
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
      console.error("Delete communication error:", error);
      return res.status(500).json({ error: "Failed to delete communication" });
    }
  });
  app2.get("/api/pricing-tiers", authMiddleware, async (req, res) => {
    try {
      const tiers = await storage.getAllPricingTiers();
      return res.json(tiers);
    } catch (error) {
      console.error("Get pricing tiers error:", error);
      return res.status(500).json({ error: "Failed to fetch pricing tiers" });
    }
  });
  app2.post("/api/pricing-tiers", authMiddleware, async (req, res) => {
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
      return res.json(tier);
    } catch (error) {
      console.error("Create pricing tier error:", error);
      return res.status(500).json({ error: error.message || "Failed to create pricing tier" });
    }
  });
  app2.patch("/api/pricing-tiers/:id", authMiddleware, async (req, res) => {
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
        entityId: req.params.id
      });
      return res.json(updated);
    } catch (error) {
      console.error("Update pricing tier error:", error);
      return res.status(500).json({ error: error.message || "Failed to update pricing tier" });
    }
  });
  app2.delete("/api/pricing-tiers/:id", authMiddleware, async (req, res) => {
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
      return res.json({ success: true });
    } catch (error) {
      console.error("Delete pricing tier error:", error);
      return res.status(500).json({ error: "Failed to delete pricing tier" });
    }
  });
  app2.post("/api/pricing/calculate-discount", authMiddleware, async (req, res) => {
    try {
      const { subtotal } = req.body;
      if (!subtotal || subtotal <= 0) {
        return res.status(400).json({ error: "Valid subtotal is required" });
      }
      const result = await pricingService.calculateDiscount(subtotal);
      return res.json(result);
    } catch (error) {
      console.error("Calculate discount error:", error);
      return res.status(500).json({ error: error.message || "Failed to calculate discount" });
    }
  });
  app2.post("/api/pricing/calculate-taxes", authMiddleware, async (req, res) => {
    try {
      const { amount, region, useIGST } = req.body;
      if (!amount || !region) {
        return res.status(400).json({ error: "Amount and region are required" });
      }
      const taxes = await pricingService.calculateTaxes(amount, region, useIGST);
      return res.json(taxes);
    } catch (error) {
      console.error("Calculate taxes error:", error);
      return res.status(500).json({ error: error.message || "Failed to calculate taxes" });
    }
  });
  app2.post("/api/pricing/calculate-total", authMiddleware, async (req, res) => {
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
      return res.json(total);
    } catch (error) {
      console.error("Calculate total error:", error);
      return res.status(500).json({ error: error.message || "Failed to calculate total" });
    }
  });
  app2.post("/api/pricing/convert-currency", authMiddleware, async (req, res) => {
    try {
      const { amount, fromCurrency, toCurrency } = req.body;
      if (!amount || !fromCurrency || !toCurrency) {
        return res.status(400).json({ error: "Amount, fromCurrency, and toCurrency are required" });
      }
      const converted = await pricingService.convertCurrency(amount, fromCurrency, toCurrency);
      return res.json({ original: amount, converted, fromCurrency, toCurrency });
    } catch (error) {
      console.error("Convert currency error:", error);
      return res.status(500).json({ error: error.message || "Failed to convert currency" });
    }
  });
  app2.get("/api/currency-settings", authMiddleware, async (req, res) => {
    try {
      const settings2 = await storage.getCurrencySettings();
      if (!settings2) {
        return res.json({ baseCurrency: "INR", supportedCurrencies: "[]", exchangeRates: "{}" });
      }
      return res.json(settings2);
    } catch (error) {
      console.error("Get currency settings error:", error);
      return res.status(500).json({ error: "Failed to fetch currency settings" });
    }
  });
  app2.post("/api/currency-settings", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
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
      console.error("Update currency settings error:", error);
      return res.status(500).json({ error: error.message || "Failed to update currency settings" });
    }
  });
  app2.get("/api/admin/settings", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
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
  app2.post("/api/admin/settings/company", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
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
  app2.post("/api/admin/settings/taxation", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
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
  app2.post("/api/admin/settings/email", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const emailSettings = req.body;
      for (const [key, value] of Object.entries(emailSettings)) {
        await storage.upsertSetting({
          key,
          value: String(value),
          updatedBy: req.user.id
        });
      }
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
      await storage.createActivityLog({
        userId: req.user.id,
        action: "update_email_settings",
        entityType: "settings"
      });
      return res.json({ success: true, message: "Email settings updated" });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Failed to update email settings" });
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
  app2.get("/api/settings", authMiddleware, async (req, res) => {
    try {
      const settings2 = await storage.getAllSettings();
      const settingsMap = {};
      settings2.forEach((s) => {
        settingsMap[s.key] = s.value;
      });
      return res.json(settingsMap);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch settings" });
    }
  });
  app2.post("/api/settings", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const settingsData = req.body;
      for (const [key, value] of Object.entries(settingsData)) {
        await storage.upsertSetting({
          key,
          value: String(value),
          updatedBy: req.user.id
        });
      }
      await storage.createActivityLog({
        userId: req.user.id,
        action: "update_settings",
        entityType: "settings"
      });
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Failed to update settings" });
    }
  });
  app2.get("/api/themes", authMiddleware, async (req, res) => {
    try {
      const { getAllThemes: getAllThemes2 } = await Promise.resolve().then(() => (init_pdf_themes(), pdf_themes_exports));
      const themes = getAllThemes2();
      return res.json(themes);
    } catch (error) {
      return res.status(500).json({ error: error.message || "Failed to get themes" });
    }
  });
  app2.get("/api/themes/segment/:segment", authMiddleware, async (req, res) => {
    try {
      const { getSuggestedTheme: getSuggestedTheme2 } = await Promise.resolve().then(() => (init_pdf_themes(), pdf_themes_exports));
      const theme = getSuggestedTheme2(req.params.segment);
      return res.json(theme);
    } catch (error) {
      return res.status(500).json({ error: error.message || "Failed to get suggested theme" });
    }
  });
  app2.patch("/api/clients/:id/theme", authMiddleware, async (req, res) => {
    try {
      const { preferredTheme, segment } = req.body;
      const updateData = {};
      if (preferredTheme !== void 0) updateData.preferredTheme = preferredTheme;
      if (segment !== void 0) updateData.segment = segment;
      const client = await storage.updateClient(req.params.id, updateData);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      await storage.createActivityLog({
        userId: req.user.id,
        action: "update_client_theme",
        entityType: "client",
        entityId: req.params.id
      });
      return res.json(client);
    } catch (error) {
      return res.status(500).json({ error: error.message || "Failed to update client theme" });
    }
  });
  app2.get("/api/governance/stats", authMiddleware, async (req, res) => {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }
      const allUsers = await storage.getAllUsers();
      const totalUsers = allUsers.length;
      const activeUsers = allUsers.filter((u) => u.status === "active").length;
      const activityLogs2 = await db.select().from(activityLogs);
      const totalActivities = activityLogs2.length;
      const criticalActivities = activityLogs2.filter(
        (log) => log.action.includes("delete") || log.action.includes("approve") || log.action.includes("lock") || log.action.includes("finalize")
      ).length;
      const unauthorizedAttempts = activityLogs2.filter(
        (log) => log.action.includes("unauthorized")
      ).length;
      const thirtyDaysAgo = /* @__PURE__ */ new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentApprovals = activityLogs2.filter(
        (log) => log.action.includes("approve") && log.timestamp && new Date(log.timestamp) > thirtyDaysAgo
      ).length;
      return res.json({
        totalUsers,
        activeUsers,
        totalActivities,
        criticalActivities,
        unauthorizedAttempts,
        recentApprovals
      });
    } catch (error) {
      console.error("Error fetching governance stats:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch governance stats" });
    }
  });
  app2.get("/api/activity-logs/recent", authMiddleware, async (req, res) => {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }
      const logs = await db.select().from(activityLogs).orderBy(desc2(activityLogs.timestamp)).limit(100);
      const enrichedLogs = await Promise.all(
        logs.map(async (log) => {
          const user = log.userId ? await storage.getUser(log.userId) : null;
          return {
            ...log,
            userName: user?.name || "Unknown User",
            userEmail: user?.email || "unknown@example.com"
          };
        })
      );
      return res.json(enrichedLogs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch activity logs" });
    }
  });
  app2.get("/api/tax-rates", authMiddleware, async (req, res) => {
    try {
      const rates = await db.select().from(taxRates).where(eq3(taxRates.isActive, true));
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
      console.error("Error fetching tax rates:", error);
      return res.status(500).json({ error: "Failed to fetch tax rates" });
    }
  });
  app2.post("/api/tax-rates", authMiddleware, async (req, res) => {
    try {
      if (!["admin", "finance_accounts"].includes(req.user.role)) {
        return res.status(403).json({ error: "Forbidden: Only admin and finance can manage tax rates" });
      }
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
        taxType,
        sgstRate: parseFloat(sgst),
        cgstRate: parseFloat(cgst),
        igstRate: parseFloat(igst)
      });
    } catch (error) {
      console.error("Error creating tax rate:", error);
      return res.status(500).json({ error: error.message || "Failed to create tax rate" });
    }
  });
  app2.delete("/api/tax-rates/:id", authMiddleware, async (req, res) => {
    try {
      if (!["admin", "finance_accounts"].includes(req.user.role)) {
        return res.status(403).json({ error: "Forbidden: Only admin and finance can manage tax rates" });
      }
      await db.delete(taxRates).where(eq3(taxRates.id, req.params.id));
      await storage.createActivityLog({
        userId: req.user.id,
        action: "delete_tax_rate",
        entityType: "tax_rate",
        entityId: req.params.id
      });
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting tax rate:", error);
      return res.status(500).json({ error: error.message || "Failed to delete tax rate" });
    }
  });
  app2.get("/api/payment-terms", authMiddleware, async (req, res) => {
    try {
      const terms = await db.select().from(paymentTerms).where(eq3(paymentTerms.isActive, true));
      return res.json(terms);
    } catch (error) {
      console.error("Error fetching payment terms:", error);
      return res.status(500).json({ error: "Failed to fetch payment terms" });
    }
  });
  app2.post("/api/payment-terms", authMiddleware, async (req, res) => {
    try {
      if (!["admin", "finance_accounts"].includes(req.user.role)) {
        return res.status(403).json({ error: "Forbidden: Only admin and finance can manage payment terms" });
      }
      const { name, days, description, isDefault } = req.body;
      if (!name || days === void 0) {
        return res.status(400).json({ error: "Name and days are required" });
      }
      if (isDefault) {
        await db.update(paymentTerms).set({ isDefault: false }).where(eq3(paymentTerms.isDefault, true));
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
      console.error("Error creating payment term:", error);
      return res.status(500).json({ error: error.message || "Failed to create payment term" });
    }
  });
  app2.delete("/api/payment-terms/:id", authMiddleware, async (req, res) => {
    try {
      if (!["admin", "finance_accounts"].includes(req.user.role)) {
        return res.status(403).json({ error: "Forbidden: Only admin and finance can manage payment terms" });
      }
      await db.delete(paymentTerms).where(eq3(paymentTerms.id, req.params.id));
      await storage.createActivityLog({
        userId: req.user.id,
        action: "delete_payment_term",
        entityType: "payment_term",
        entityId: req.params.id
      });
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting payment term:", error);
      return res.status(500).json({ error: error.message || "Failed to delete payment term" });
    }
  });
  app2.get("/api/debug/counters", async (req, res) => {
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
      console.error("Error fetching counters:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch counters" });
    }
  });
  app2.post("/api/debug/reset-counter/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const year = (/* @__PURE__ */ new Date()).getFullYear();
      console.log(`[DEBUG] Resetting counter for ${type} in year ${year}`);
      await NumberingService.resetCounter(type, year);
      return res.json({
        success: true,
        message: `Counter ${type}_counter_${year} has been reset to 0`,
        nextNumber: "0001"
      });
    } catch (error) {
      console.error("Error resetting counter:", error);
      return res.status(500).json({ error: error.message || "Failed to reset counter" });
    }
  });
  app2.post("/api/debug/set-counter/:type/:value", async (req, res) => {
    try {
      const { type, value } = req.params;
      const year = (/* @__PURE__ */ new Date()).getFullYear();
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue < 0) {
        return res.status(400).json({ error: "Value must be a non-negative integer" });
      }
      console.log(`[DEBUG] Setting ${type}_counter_${year} to ${numValue}`);
      await NumberingService.setCounter(type, year, numValue);
      const nextValue = numValue + 1;
      return res.json({
        success: true,
        message: `Counter ${type}_counter_${year} set to ${numValue}`,
        nextNumber: String(nextValue).padStart(4, "0")
      });
    } catch (error) {
      console.error("Error setting counter:", error);
      return res.status(500).json({ error: error.message || "Failed to set counter" });
    }
  });
  app2.get("/api/settings", authMiddleware, async (req, res) => {
    try {
      const allSettings = await storage.getAllSettings();
      const settingsObj = {};
      for (const setting of allSettings) {
        settingsObj[setting.key] = setting.value;
      }
      res.json(settingsObj);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: error.message || "Failed to fetch settings" });
    }
  });
  app2.post("/api/settings", authMiddleware, async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key) {
        return res.status(400).json({ error: "Setting key is required" });
      }
      const setting = await storage.upsertSetting({
        key,
        value: value !== void 0 ? String(value) : ""
      });
      res.json(setting);
    } catch (error) {
      console.error("Error saving setting:", error);
      res.status(500).json({ error: error.message || "Failed to save setting" });
    }
  });
  app2.use("/api", authMiddleware, analytics_routes_default);
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
  newApp.use(cookieParser2());
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
