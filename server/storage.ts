import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import {
  users,
  type User,
  type InsertUser,
  clients,
  quotes,
  quoteItems,
  invoices,
  invoiceItems,
  invoiceAttachments,
  type InvoiceAttachment,
  type InsertInvoiceAttachment,
  paymentHistory,
  templates,
  activityLogs,
  settings,
  bankDetails,
  clientTags,
  clientCommunications,
  taxRates,
  pricingTiers,
  currencySettings,
  vendors,
  vendorPurchaseOrders,
  vendorPoItems,
  goodsReceivedNotes,
  type Client,
  type InsertClient,
  type Quote,
  type InsertQuote,
  type QuoteItem,
  type InsertQuoteItem,
  type Invoice,
  type InsertInvoice,
  type InvoiceItem,
  type InsertInvoiceItem,
  type PaymentHistory,
  type InsertPaymentHistory,
  type Template,
  type InsertTemplate,
  type ActivityLog,
  type InsertActivityLog,
  type Setting,
  type InsertSetting,
  type BankDetails,
  type InsertBankDetails,
  type ClientTag,
  type InsertClientTag,
  type ClientCommunication,
  type InsertClientCommunication,
  type TaxRate,
  type InsertTaxRate,
  type PricingTier,
  type InsertPricingTier,
  type CurrencySetting,
  type InsertCurrencySetting,
  type Vendor,
  type InsertVendor,
  type VendorPurchaseOrder,
  type InsertVendorPurchaseOrder,
  type VendorPoItem,
  type InsertVendorPoItem,
  type GoodsReceivedNote,
  type InsertGrn,
  quoteVersions,
  salesOrders,
  salesOrderItems,
  type QuoteVersion,
  type InsertQuoteVersion,
  type SalesOrder,
  type InsertSalesOrder,
  type SalesOrderItem,
  type InsertSalesOrderItem,
} from "@shared/schema";
import { version } from "os";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<InsertUser, "password"> & { passwordHash: string }): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  updateUserWithTokenCheck(id: string, token: string, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;

  // Clients
  getClient(id: string): Promise<Client | undefined>;
  getClientsByCreator(createdBy: string): Promise<Client[]>;
  getAllClients(): Promise<Client[]>;
  createClient(client: InsertClient & { createdBy: string }): Promise<Client>;
  updateClient(id: string, data: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<void>;

  // Quotes
  getQuote(id: string): Promise<Quote | undefined>;
  getQuotesByCreator(createdBy: string): Promise<Quote[]>;
  getAllQuotes(): Promise<Quote[]>;
  createQuote(quote: InsertQuote & { createdBy: string; quoteNumber: string }): Promise<Quote>;
  updateQuote(id: string, data: Partial<Quote>): Promise<Quote | undefined>;
  deleteQuote(id: string): Promise<void>;
  getLastQuoteNumber(): Promise<string | undefined>;

  // Quote Items
  getQuoteItems(quoteId: string): Promise<QuoteItem[]>;
  createQuoteItem(item: InsertQuoteItem): Promise<QuoteItem>;
  deleteQuoteItems(quoteId: string): Promise<void>;

  // Invoices
  getInvoice(id: string): Promise<Invoice | undefined>;
  getInvoiceByQuote(quoteId: string): Promise<Invoice | undefined>;
  getAllInvoices(): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice | undefined>;
  getLastInvoiceNumber(): Promise<string | undefined>;

  // Payment History
  getPaymentHistory(invoiceId: string): Promise<PaymentHistory[]>;
  createPaymentHistory(payment: InsertPaymentHistory): Promise<PaymentHistory>;
  deletePaymentHistory(id: string): Promise<void>;

  // Templates
  getTemplate(id: string): Promise<Template | undefined>;
  getAllTemplates(): Promise<Template[]>;
  getTemplatesByType(type: string): Promise<Template[]>;
  getTemplatesByStyle(style: string): Promise<Template[]>;
  getDefaultTemplate(type: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate & { createdBy: string }): Promise<Template>;
  updateTemplate(id: string, data: Partial<Template>): Promise<Template | undefined>;
  deleteTemplate(id: string): Promise<void>;

  // Activity Logs
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(userId: string, limit?: number): Promise<ActivityLog[]>;

  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  getAllSettings(): Promise<Setting[]>;
  upsertSetting(setting: InsertSetting): Promise<Setting>;
  deleteSetting(key: string): Promise<void>;

  // Bank Details
  getBankDetails(id: string): Promise<BankDetails | undefined>;
  getAllBankDetails(): Promise<BankDetails[]>;
  getActiveBankDetails(): Promise<BankDetails | undefined>;
  createBankDetails(details: InsertBankDetails & { updatedBy?: string }): Promise<BankDetails>;
  updateBankDetails(id: string, data: Partial<BankDetails>, updatedBy?: string): Promise<BankDetails | undefined>;
  deleteBankDetails(id: string): Promise<void>;

  // PHASE 3 - Client Tags
  getClientTags(clientId: string): Promise<ClientTag[]>;
  addClientTag(tag: InsertClientTag): Promise<ClientTag>;
  removeClientTag(tagId: string): Promise<void>;

  // PHASE 3 - Client Communications
  getClientCommunications(clientId: string): Promise<ClientCommunication[]>;
  createClientCommunication(communication: InsertClientCommunication): Promise<ClientCommunication>;
  deleteClientCommunication(id: string): Promise<void>;

  // PHASE 3 - Tax Rates
  getTaxRate(id: string): Promise<TaxRate | undefined>;
  getTaxRateByRegion(region: string): Promise<TaxRate | undefined>;
  getAllTaxRates(): Promise<TaxRate[]>;
  getActiveTaxRates(): Promise<TaxRate[]>;
  createTaxRate(rate: InsertTaxRate): Promise<TaxRate>;
  updateTaxRate(id: string, data: Partial<TaxRate>): Promise<TaxRate | undefined>;
  deleteTaxRate(id: string): Promise<void>;

  // PHASE 3 - Pricing Tiers
  getPricingTier(id: string): Promise<PricingTier | undefined>;
  getAllPricingTiers(): Promise<PricingTier[]>;
  getPricingTierByAmount(amount: number): Promise<PricingTier | undefined>;
  createPricingTier(tier: InsertPricingTier): Promise<PricingTier>;
  updatePricingTier(id: string, data: Partial<PricingTier>): Promise<PricingTier | undefined>;
  deletePricingTier(id: string): Promise<void>;

  // PHASE 3 - Currency Settings
  getCurrencySettings(): Promise<CurrencySetting | undefined>;
  upsertCurrencySettings(settings: InsertCurrencySetting): Promise<CurrencySetting>;

  // NEW FEATURE - Vendors
  getVendor(id: string): Promise<Vendor | undefined>;
  getAllVendors(): Promise<Vendor[]>;
  getActiveVendors(): Promise<Vendor[]>;
  createVendor(vendor: InsertVendor & { createdBy: string }): Promise<Vendor>;
  updateVendor(id: string, data: Partial<Vendor>): Promise<Vendor | undefined>;
  deleteVendor(id: string): Promise<void>;

  // NEW FEATURE - Vendor Purchase Orders
  getVendorPo(id: string): Promise<VendorPurchaseOrder | undefined>;
  getVendorPosByQuote(quoteId: string): Promise<VendorPurchaseOrder[]>;
  getAllVendorPos(): Promise<VendorPurchaseOrder[]>;
  createVendorPo(po: InsertVendorPurchaseOrder & { createdBy: string; poNumber: string }): Promise<VendorPurchaseOrder>;
  updateVendorPo(id: string, data: Partial<VendorPurchaseOrder>): Promise<VendorPurchaseOrder | undefined>;
  deleteVendorPo(id: string): Promise<void>;
  getLastPoNumber(): Promise<string | undefined>;

  // NEW FEATURE - Vendor PO Items
  getVendorPoItems(vendorPoId: string): Promise<VendorPoItem[]>;
  createVendorPoItem(item: InsertVendorPoItem): Promise<VendorPoItem>;
  updateVendorPoItem(id: string, data: Partial<VendorPoItem>): Promise<VendorPoItem | undefined>;
  deleteVendorPoItems(vendorPoId: string): Promise<void>;

  // NEW FEATURE - Invoice Items
  getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]>;
  getInvoiceItem(id: string): Promise<InvoiceItem | undefined>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  updateInvoiceItem(id: string, data: Partial<InvoiceItem>): Promise<InvoiceItem | undefined>;
  deleteInvoiceItems(invoiceId: string): Promise<void>;
  getInvoicesByQuote(quoteId: string): Promise<Invoice[]>;

  // NEW FEATURE - Goods Received Notes (GRN)
  getGrn(id: string): Promise<GoodsReceivedNote | undefined>;

  // Serial Numbers
  getSerialNumber(id: string): Promise<any | undefined>;
  getSerialNumberByValue(serialNumber: string): Promise<any | undefined>;
  createSerialNumber(serial: any): Promise<any>;
  updateSerialNumber(id: string, data: Partial<any>): Promise<any | undefined>;
  getPaymentById(id: string): Promise<PaymentHistory | undefined>;

  // NEW FEATURE - Quote Versions
  createQuoteVersion(version: InsertQuoteVersion): Promise<QuoteVersion>;
  getQuoteVersions(quoteId: string): Promise<QuoteVersion[]>;
  getQuoteVersion(quoteId: string, version: number): Promise<QuoteVersion | undefined>;

  // NEW FEATURE - Sales Orders
  createSalesOrder(order: InsertSalesOrder): Promise<SalesOrder>;
  getSalesOrder(id: string): Promise<SalesOrder | undefined>;
  getSalesOrderByQuote(quoteId: string): Promise<SalesOrder | undefined>;
  getAllSalesOrders(): Promise<SalesOrder[]>;
  updateSalesOrder(id: string, data: Partial<SalesOrder>): Promise<SalesOrder | undefined>;
  deleteSalesOrder(id: string): Promise<void>;
  getLastSalesOrderNumber(): Promise<string | undefined>;

  // NEW FEATURE - Sales Order Items
  createSalesOrderItem(item: InsertSalesOrderItem): Promise<SalesOrderItem>;
  getSalesOrderItems(salesOrderId: string): Promise<SalesOrderItem[]>;
  deleteSalesOrderItems(salesOrderId: string): Promise<void>;
}


export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }


  async createUser(user: Omit<InsertUser, "password"> & { passwordHash: string }): Promise<User> {
  const [newUser] = await db
    .insert(users)
    .values(user)
    .returning();
  return newUser;
}

  async updateUser(id: string, data: Partial<User>): Promise < User | undefined > {
  const [updated] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return updated || undefined;
}

  async updateUserWithTokenCheck(id: string, token: string, data: Partial<User>): Promise < User | undefined > {
  // Atomically update user only if the reset token matches
  // This prevents race conditions where the same token is used multiple times
  const [updated] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(users.id, id), eq(users.resetToken, token)))
    .returning();
  return updated || undefined;
}

  async deleteUser(id: string): Promise < void> {
  // Delete in order of dependencies to avoid foreign key constraint violations
  // 1. Delete activity logs for this user
  await db.delete(activityLogs).where(eq(activityLogs.userId, id));

  // 2. Delete templates created by this user
  await db.delete(templates).where(eq(templates.createdBy, id));

  // 3. Delete quotes created by this user (this will cascade to quote items due to onDelete: "cascade")
  await db.delete(quotes).where(eq(quotes.createdBy, id));

  // 4. Delete clients created by this user
  await db.delete(clients).where(eq(clients.createdBy, id));

  // 5. Finally, delete the user
  await db.delete(users).where(eq(users.id, id));
}

  async getAllUsers(): Promise < User[] > {
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

  // Clients
  async getClient(id: string): Promise < Client | undefined > {
  const [client] = await db.select().from(clients).where(eq(clients.id, id));
  return client || undefined;
}

  async getClientsByCreator(createdBy: string): Promise < Client[] > {
  return await db.select().from(clients).where(eq(clients.createdBy, createdBy));
}

  async getAllClients(): Promise < Client[] > {
  return await db.select().from(clients).orderBy(desc(clients.createdAt));
}

  async createClient(client: InsertClient & { createdBy: string }): Promise < Client > {
  const [newClient] = await db.insert(clients).values(client).returning();
  return newClient;
}

  async updateClient(id: string, data: Partial<Client>): Promise < Client | undefined > {
  const [updated] = await db
    .update(clients)
    .set(data)
    .where(eq(clients.id, id))
    .returning();
  return updated || undefined;
}

  async deleteClient(id: string): Promise < void> {
  await db.delete(clients).where(eq(clients.id, id));
}

  // Quotes
  async getQuote(id: string): Promise < Quote | undefined > {
  const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
  return quote || undefined;
}

  async getQuotesByCreator(createdBy: string): Promise < Quote[] > {
  return await db.select().from(quotes).where(eq(quotes.createdBy, createdBy)).orderBy(desc(quotes.createdAt));
}

  async getAllQuotes(): Promise < Quote[] > {
  return await db.select().from(quotes).orderBy(desc(quotes.createdAt));
}

  async createQuote(quote: InsertQuote & { createdBy: string; quoteNumber: string }): Promise < Quote > {
  const [newQuote] = await db.insert(quotes).values(quote).returning();
  return newQuote;
}

  async updateQuote(id: string, data: Partial<Quote>): Promise < Quote | undefined > {
  const [updated] = await db
    .update(quotes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(quotes.id, id))
    .returning();
  return updated || undefined;
}

  async deleteQuote(id: string): Promise < void> {
  await db.delete(quotes).where(eq(quotes.id, id));
}

  async getLastQuoteNumber(): Promise < string | undefined > {
  const [lastQuote] = await db.select().from(quotes).orderBy(desc(quotes.createdAt)).limit(1);
  return lastQuote?.quoteNumber;
}

  // Quote Items
  async getQuoteItems(quoteId: string): Promise < QuoteItem[] > {
  return await db.select().from(quoteItems).where(eq(quoteItems.quoteId, quoteId)).orderBy(quoteItems.sortOrder);
}

  async createQuoteItem(item: InsertQuoteItem): Promise < QuoteItem > {
  const [newItem] = await db.insert(quoteItems).values(item).returning();
  return newItem;
}

  async deleteQuoteItems(quoteId: string): Promise < void> {
  await db.delete(quoteItems).where(eq(quoteItems.quoteId, quoteId));
}

  // Invoices
  async getInvoice(id: string): Promise < Invoice | undefined > {
  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
  return invoice || undefined;
}

  async getInvoiceByQuote(quoteId: string): Promise < Invoice | undefined > {
  const [invoice] = await db.select().from(invoices).where(eq(invoices.quoteId, quoteId));
  return invoice || undefined;
}

  async getAllInvoices(): Promise < Invoice[] > {
  return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
}

  async createInvoice(invoice: InsertInvoice): Promise < Invoice > {
  const [newInvoice] = await db.insert(invoices).values(invoice).returning();
  return newInvoice;
}

  async updateInvoice(id: string, data: Partial<Invoice>): Promise < Invoice | undefined > {
  const [updated] = await db
    .update(invoices)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(invoices.id, id))
    .returning();
  return updated || undefined;
}

  async getLastInvoiceNumber(): Promise < string | undefined > {
  const [lastInvoice] = await db.select().from(invoices).orderBy(desc(invoices.createdAt)).limit(1);
  return lastInvoice?.invoiceNumber;
}

  // Payment History
  async getPaymentHistory(invoiceId: string): Promise < PaymentHistory[] > {
  return await db
    .select()
    .from(paymentHistory)
    .where(eq(paymentHistory.invoiceId, invoiceId))
    .orderBy(desc(paymentHistory.paymentDate));
}

  async getPaymentById(id: string): Promise < PaymentHistory | undefined > {
  const [payment] = await db
    .select()
    .from(paymentHistory)
    .where(eq(paymentHistory.id, id));
  return payment || undefined;
}

  async createPaymentHistory(payment: InsertPaymentHistory): Promise < PaymentHistory > {
  const [newPayment] = await db.insert(paymentHistory).values(payment).returning();
  return newPayment;
}

  async deletePaymentHistory(id: string): Promise < void> {
  await db.delete(paymentHistory).where(eq(paymentHistory.id, id));
}

  // Templates
  async getTemplate(id: string): Promise < Template | undefined > {
  const [template] = await db.select().from(templates).where(eq(templates.id, id));
  return template || undefined;
}

  async getAllTemplates(): Promise < Template[] > {
  return await db.select().from(templates).where(eq(templates.isActive, true));
}

  async getTemplatesByType(type: string): Promise < Template[] > {
  return await db
    .select()
    .from(templates)
    .where(eq(templates.type, type) && eq(templates.isActive, true));
}

  async getTemplatesByStyle(style: string): Promise < Template[] > {
  return await db
    .select()
    .from(templates)
    .where(eq(templates.style, style) && eq(templates.isActive, true));
}

  async getDefaultTemplate(type: string): Promise < Template | undefined > {
  const [template] = await db
    .select()
    .from(templates)
    .where(eq(templates.type, type) && eq(templates.isDefault, true));
  return template || undefined;
}

  async createTemplate(template: InsertTemplate & { createdBy: string }): Promise < Template > {
  const [newTemplate] = await db.insert(templates).values(template).returning();
  return newTemplate;
}

  async updateTemplate(id: string, data: Partial<Template>): Promise < Template | undefined > {
  const [updated] = await db
    .update(templates)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(templates.id, id))
    .returning();
  return updated || undefined;
}

  async deleteTemplate(id: string): Promise < void> {
  await db.delete(templates).where(eq(templates.id, id));
}

  // Activity Logs
  async createActivityLog(log: InsertActivityLog): Promise < ActivityLog > {
  const [newLog] = await db.insert(activityLogs).values(log).returning();
  return newLog;
}

  async getActivityLogs(userId: string, limit: number = 50): Promise < ActivityLog[] > {
  return await db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.userId, userId))
    .orderBy(desc(activityLogs.timestamp))
    .limit(limit);
}

  // Settings
  async getSetting(key: string): Promise < Setting | undefined > {
  const [setting] = await db.select().from(settings).where(eq(settings.key, key));
  return setting || undefined;
}

  async getAllSettings(): Promise < Setting[] > {
  return await db.select().from(settings);
}

  async upsertSetting(setting: InsertSetting): Promise < Setting > {
  const existing = await this.getSetting(setting.key);
  if(existing) {
    const [updated] = await db
      .update(settings)
      .set({ ...setting, updatedAt: new Date() })
      .where(eq(settings.key, setting.key))
      .returning();
    return updated;
  } else {
    const [newSetting] = await db.insert(settings).values(setting).returning();
    return newSetting;
  }
}

  async deleteSetting(key: string): Promise < void> {
  await db.delete(settings).where(eq(settings.key, key));
}

  // Bank Details
  async getBankDetails(id: string): Promise < BankDetails | undefined > {
  const [detail] = await db.select().from(bankDetails).where(eq(bankDetails.id, id));
  return detail || undefined;
}

  async getAllBankDetails(): Promise < BankDetails[] > {
  return await db.select().from(bankDetails).orderBy(desc(bankDetails.createdAt));
}

  async getActiveBankDetails(): Promise < BankDetails | undefined > {
  const [detail] = await db
    .select()
    .from(bankDetails)
    .where(eq(bankDetails.isActive, true))
    .orderBy(desc(bankDetails.updatedAt))
    .limit(1);
  return detail || undefined;
}

  async createBankDetails(details: InsertBankDetails & { updatedBy?: string }): Promise < BankDetails > {
  const [newDetail] = await db.insert(bankDetails).values(details).returning();
  return newDetail;
}

  async updateBankDetails(
  id: string,
  data: Partial<BankDetails>,
  updatedBy ?: string
): Promise < BankDetails | undefined > {
  const [updated] = await db
    .update(bankDetails)
    .set({ ...data, updatedAt: new Date(), updatedBy: updatedBy || data.updatedBy })
    .where(eq(bankDetails.id, id))
    .returning();
  return updated;
}

  async deleteBankDetails(id: string): Promise < void> {
  await db.delete(bankDetails).where(eq(bankDetails.id, id));
}

  // PHASE 3 - Client Tags
  async getClientTags(clientId: string): Promise < ClientTag[] > {
  return await db.select().from(clientTags).where(eq(clientTags.clientId, clientId));
}

  async addClientTag(tag: InsertClientTag): Promise < ClientTag > {
  const [newTag] = await db.insert(clientTags).values(tag).returning();
  return newTag;
}

  async removeClientTag(tagId: string): Promise < void> {
  await db.delete(clientTags).where(eq(clientTags.id, tagId));
}

  // PHASE 3 - Client Communications
  async getClientCommunications(clientId: string): Promise < ClientCommunication[] > {
  return await db
    .select()
    .from(clientCommunications)
    .where(eq(clientCommunications.clientId, clientId))
    .orderBy(desc(clientCommunications.date));
}

  async createClientCommunication(communication: InsertClientCommunication): Promise < ClientCommunication > {
  const [newComm] = await db.insert(clientCommunications).values(communication).returning();
  return newComm;
}

  async deleteClientCommunication(id: string): Promise < void> {
  await db.delete(clientCommunications).where(eq(clientCommunications.id, id));
}

  // PHASE 3 - Tax Rates
  async getTaxRate(id: string): Promise < TaxRate | undefined > {
  const [rate] = await db.select().from(taxRates).where(eq(taxRates.id, id));
  return rate || undefined;
}

  async getTaxRateByRegion(region: string): Promise < TaxRate | undefined > {
  const [rate] = await db
    .select()
    .from(taxRates)
    .where(and(eq(taxRates.region, region), eq(taxRates.isActive, true)))
    .orderBy(desc(taxRates.effectiveFrom))
    .limit(1);
  return rate || undefined;
}

  async getAllTaxRates(): Promise < TaxRate[] > {
  return await db.select().from(taxRates).orderBy(desc(taxRates.effectiveFrom));
}

  async getActiveTaxRates(): Promise < TaxRate[] > {
  return await db
    .select()
    .from(taxRates)
    .where(eq(taxRates.isActive, true))
    .orderBy(desc(taxRates.effectiveFrom));
}

  async createTaxRate(rate: InsertTaxRate): Promise < TaxRate > {
  const [newRate] = await db.insert(taxRates).values(rate).returning();
  return newRate;
}

  async updateTaxRate(id: string, data: Partial<TaxRate>): Promise < TaxRate | undefined > {
  const [updated] = await db.update(taxRates).set(data).where(eq(taxRates.id, id)).returning();
  return updated || undefined;
}

  async deleteTaxRate(id: string): Promise < void> {
  await db.delete(taxRates).where(eq(taxRates.id, id));
}

  // PHASE 3 - Pricing Tiers
  async getPricingTier(id: string): Promise < PricingTier | undefined > {
  const [tier] = await db.select().from(pricingTiers).where(eq(pricingTiers.id, id));
  return tier || undefined;
}

  async getAllPricingTiers(): Promise < PricingTier[] > {
  return await db.select().from(pricingTiers);
}

  async getPricingTierByAmount(amount: number): Promise < PricingTier | undefined > {

  // Find tier where amount is between min and max
  const tiers = await db.select().from(pricingTiers).where(eq(pricingTiers.isActive, true));
  return tiers.find(t => {
    const min = parseFloat(t.minAmount.toString());
    const max = t.maxAmount ? parseFloat(t.maxAmount.toString()) : Infinity;
    return amount >= min && amount <= max;
  });
}


  async createPricingTier(tier: InsertPricingTier): Promise < PricingTier > {
  const [newTier] = await db.insert(pricingTiers).values(tier).returning();
  return newTier;
}

  async updatePricingTier(id: string, data: Partial<PricingTier>): Promise < PricingTier | undefined > {
  const [updated] = await db.update(pricingTiers).set(data).where(eq(pricingTiers.id, id)).returning();
  return updated || undefined;
}

  async deletePricingTier(id: string): Promise < void> {
  await db.delete(pricingTiers).where(eq(pricingTiers.id, id));
}

  // PHASE 3 - Currency Settings
  async getCurrencySettings(): Promise < CurrencySetting | undefined > {
  const [settings] = await db.select().from(currencySettings).limit(1);
  return settings || undefined;
}

  async upsertCurrencySettings(settings: InsertCurrencySetting): Promise < CurrencySetting > {
  const existing = await this.getCurrencySettings();
  if(existing) {
    const [updated] = await db
      .update(currencySettings)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(currencySettings.id, existing.id))
      .returning();
    return updated;
  } else {
    const [newSettings] = await db.insert(currencySettings).values(settings).returning();
    return newSettings;
  }
}

  // NEW FEATURE - Vendors
  async getVendor(id: string): Promise < Vendor | undefined > {
  const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
  return vendor || undefined;
}

  async getAllVendors(): Promise < Vendor[] > {
  return await db.select().from(vendors).orderBy(desc(vendors.createdAt));
}

  async getActiveVendors(): Promise < Vendor[] > {
  return await db.select().from(vendors).where(eq(vendors.isActive, true)).orderBy(vendors.name);
}

  async createVendor(vendor: InsertVendor & { createdBy: string }): Promise < Vendor > {
  const [newVendor] = await db.insert(vendors).values(vendor).returning();
  return newVendor;
}

  async updateVendor(id: string, data: Partial<Vendor>): Promise < Vendor | undefined > {
  const [updated] = await db
    .update(vendors)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(vendors.id, id))
    .returning();
  return updated || undefined;
}

  async deleteVendor(id: string): Promise < void> {
  await db.delete(vendors).where(eq(vendors.id, id));
}

  // NEW FEATURE - Vendor Purchase Orders
  async getVendorPo(id: string): Promise < VendorPurchaseOrder | undefined > {
  const [po] = await db.select().from(vendorPurchaseOrders).where(eq(vendorPurchaseOrders.id, id));
  return po || undefined;
}

  async getVendorPosByQuote(quoteId: string): Promise < VendorPurchaseOrder[] > {
  return await db.select().from(vendorPurchaseOrders).where(eq(vendorPurchaseOrders.quoteId, quoteId)).orderBy(desc(vendorPurchaseOrders.createdAt));
}

  async getAllVendorPos(): Promise < VendorPurchaseOrder[] > {
  return await db.select().from(vendorPurchaseOrders).orderBy(desc(vendorPurchaseOrders.createdAt));
}

  async createVendorPo(po: InsertVendorPurchaseOrder & { createdBy: string; poNumber: string }): Promise < VendorPurchaseOrder > {
  const [newPo] = await db.insert(vendorPurchaseOrders).values(po).returning();
  return newPo;
}

  async updateVendorPo(id: string, data: Partial<VendorPurchaseOrder>): Promise < VendorPurchaseOrder | undefined > {
  const [updated] = await db
    .update(vendorPurchaseOrders)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(vendorPurchaseOrders.id, id))
    .returning();
  return updated || undefined;
}

  async deleteVendorPo(id: string): Promise < void> {
  await db.delete(vendorPurchaseOrders).where(eq(vendorPurchaseOrders.id, id));
}

  async getLastPoNumber(): Promise < string | undefined > {
  const [lastPo] = await db.select().from(vendorPurchaseOrders).orderBy(desc(vendorPurchaseOrders.createdAt)).limit(1);
  return lastPo?.poNumber;
}

  // NEW FEATURE - Vendor PO Items
  async getVendorPoItems(vendorPoId: string): Promise < VendorPoItem[] > {
  return await db.select().from(vendorPoItems).where(eq(vendorPoItems.vendorPoId, vendorPoId)).orderBy(vendorPoItems.sortOrder);
}

  async createVendorPoItem(item: InsertVendorPoItem): Promise < VendorPoItem > {
  const [newItem] = await db.insert(vendorPoItems).values(item).returning();
  return newItem;
}

  async updateVendorPoItem(id: string, data: Partial<VendorPoItem>): Promise < VendorPoItem | undefined > {
  const [updated] = await db
    .update(vendorPoItems)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(vendorPoItems.id, id))
    .returning();
  return updated || undefined;
}

  async deleteVendorPoItems(vendorPoId: string): Promise < void> {
  await db.delete(vendorPoItems).where(eq(vendorPoItems.vendorPoId, vendorPoId));
}

  // NEW FEATURE - Invoice Items
  async getInvoiceItems(invoiceId: string): Promise < InvoiceItem[] > {
  return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId)).orderBy(invoiceItems.sortOrder);
}

  async getInvoiceItem(id: string): Promise < InvoiceItem | undefined > {
  const [item] = await db.select().from(invoiceItems).where(eq(invoiceItems.id, id));
  return item || undefined;
}

  async createInvoiceItem(item: InsertInvoiceItem): Promise < InvoiceItem > {
  const [newItem] = await db.insert(invoiceItems).values(item).returning();
  return newItem;
}

  async updateInvoiceItem(id: string, data: Partial<InvoiceItem>): Promise < InvoiceItem | undefined > {
  const [updated] = await db
    .update(invoiceItems)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(invoiceItems.id, id))
    .returning();
  return updated || undefined;
}

  async deleteInvoiceItems(invoiceId: string): Promise<void> {
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }

  async createInvoiceAttachment(attachment: InsertInvoiceAttachment): Promise<InvoiceAttachment> {
    const [newAttachment] = await db.insert(invoiceAttachments).values(attachment).returning();
    return newAttachment;
  }

  async getInvoicesByQuote(quoteId: string): Promise < Invoice[] > {
  return await db.select().from(invoices).where(eq(invoices.quoteId, quoteId)).orderBy(desc(invoices.createdAt));
}

  // Serial Numbers
  async getSerialNumber(id: string): Promise < any | undefined > {
  const { serialNumbers } = await import("@shared/schema");
  const [serial] = await db.select().from(serialNumbers).where(eq(serialNumbers.id, id));
  return serial || undefined;
}

  async getSerialNumberByValue(serialNumber: string): Promise < any | undefined > {
  const { serialNumbers } = await import("@shared/schema");
  const [serial] = await db.select().from(serialNumbers).where(eq(serialNumbers.serialNumber, serialNumber));
  return serial || undefined;
}

  async createSerialNumber(serial: any): Promise < any > {
  const { serialNumbers } = await import("@shared/schema");
  const [newSerial] = await db.insert(serialNumbers).values(serial).returning();
  return newSerial;
}

  async updateSerialNumber(id: string, data: Partial<any>): Promise < any | undefined > {
  const { serialNumbers } = await import("@shared/schema");
  const [updated] = await db
    .update(serialNumbers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(serialNumbers.id, id))
    .returning();
  return updated || undefined;
}

  // NEW FEATURE - Goods Received Notes (GRN)
  async getGrn(id: string): Promise < GoodsReceivedNote | undefined > {
  const [grn] = await db.select().from(goodsReceivedNotes).where(eq(goodsReceivedNotes.id, id));
  return grn || undefined;
}

  async getGrnByNumber(grnNumber: string): Promise < GoodsReceivedNote | undefined > {
  const [grn] = await db.select().from(goodsReceivedNotes).where(eq(goodsReceivedNotes.grnNumber, grnNumber));
  return grn || undefined;
}

  async getAllGrns(): Promise < GoodsReceivedNote[] > {
  return await db.select().from(goodsReceivedNotes).orderBy(desc(goodsReceivedNotes.createdAt));
}

  async getGrnsByVendorPo(vendorPoId: string): Promise < GoodsReceivedNote[] > {
  return await db.select().from(goodsReceivedNotes).where(eq(goodsReceivedNotes.vendorPoId, vendorPoId)).orderBy(desc(goodsReceivedNotes.createdAt));
}

  async createGrn(grn: InsertGrn & { createdBy: string; grnNumber: string }): Promise < GoodsReceivedNote > {
  const [newGrn] = await db.insert(goodsReceivedNotes).values(grn).returning();
  return newGrn;
}

  async updateGrn(id: string, data: Partial<GoodsReceivedNote>): Promise < GoodsReceivedNote | undefined > {
  const [updated] = await db
    .update(goodsReceivedNotes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(goodsReceivedNotes.id, id))
    .returning();
  return updated || undefined;
}

  async deleteGrn(id: string): Promise < void> {
  await db.delete(goodsReceivedNotes).where(eq(goodsReceivedNotes.id, id));
}


  // Quote Versions
  async createQuoteVersion(version: InsertQuoteVersion): Promise<QuoteVersion> {
    const [newVersion] = await db.insert(quoteVersions).values(version).returning();
    return newVersion;
  }

  async getQuoteVersions(quoteId: string): Promise<QuoteVersion[]> {
    return await db
      .select()
      .from(quoteVersions)
      .where(eq(quoteVersions.quoteId, quoteId))
      .orderBy(desc(quoteVersions.version));
  }

  async getQuoteVersion(quoteId: string, version: number): Promise<QuoteVersion | undefined> {
    const [ver] = await db
      .select()
      .from(quoteVersions)
      .where(and(eq(quoteVersions.quoteId, quoteId), eq(quoteVersions.version, version)));
    return ver || undefined;
  }

  // Sales Orders
  async createSalesOrder(order: InsertSalesOrder): Promise<SalesOrder> {
    const [newOrder] = await db.insert(salesOrders).values(order).returning();
    return newOrder;
  }

  async getSalesOrder(id: string): Promise<SalesOrder | undefined> {
    const [order] = await db.select().from(salesOrders).where(eq(salesOrders.id, id));
    return order || undefined;
  }

  async getSalesOrderByQuote(quoteId: string): Promise<SalesOrder | undefined> {
    const [order] = await db.select().from(salesOrders).where(eq(salesOrders.quoteId, quoteId));
    return order || undefined;
  }

  async getAllSalesOrders(): Promise<SalesOrder[]> {
    return await db.select().from(salesOrders).orderBy(desc(salesOrders.createdAt));
  }

  async updateSalesOrder(id: string, data: Partial<SalesOrder>): Promise<SalesOrder | undefined> {
    const [updatedOrder] = await db
      .update(salesOrders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(salesOrders.id, id))
      .returning();
    return updatedOrder || undefined;
  }

  async deleteSalesOrder(id: string): Promise<void> {
    await db.delete(salesOrders).where(eq(salesOrders.id, id));
  }

  async getLastSalesOrderNumber(): Promise<string | undefined> {
    const [lastOrder] = await db
      .select()
      .from(salesOrders)
      .orderBy(desc(salesOrders.orderNumber))
      .limit(1);
    return lastOrder?.orderNumber;
  }

  // Sales Order Items
  async createSalesOrderItem(item: InsertSalesOrderItem): Promise<SalesOrderItem> {
    const [ newItem] = await db.insert(salesOrderItems).values(item).returning();
    return newItem;
  }

  async getSalesOrderItems(salesOrderId: string): Promise<SalesOrderItem[]> {
    return await db
      .select()
      .from(salesOrderItems)
      .where(eq(salesOrderItems.salesOrderId, salesOrderId))
      .orderBy(salesOrderItems.sortOrder);
  }

  async deleteSalesOrderItems(salesOrderId: string): Promise<void> {
    await db.delete(salesOrderItems).where(eq(salesOrderItems.salesOrderId, salesOrderId));
  }
}

export const storage = new DatabaseStorage();
