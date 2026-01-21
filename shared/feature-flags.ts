/**
 * FEATURE FLAGS CONFIGURATION
 * Central location for enabling/disabling features without code deletion
 * Set any flag to false to disable a feature
 *
 * All permissions are preserved - feature flags work alongside RBAC
 */

export interface FeatureFlags {
  // ==================== PAGES & ROUTES ====================

  // Core Pages
  pages_dashboard: boolean;
  pages_clients: boolean;
  pages_clientDetail: boolean;
  pages_quotes: boolean;
  pages_quoteCreate: boolean;
  pages_quoteDetail: boolean;
  pages_invoices: boolean;
  pages_invoiceDetail: boolean;
  pages_vendors: boolean;
  pages_vendorPOs: boolean;
  pages_vendorPODetail: boolean;
  pages_products: boolean;
  pages_grn: boolean;
  pages_grnDetail: boolean;
  pages_serialSearch: boolean;

  // Dashboard Pages
  pages_dashboardsOverview: boolean;
  pages_salesQuoteDashboard: boolean;
  pages_vendorPODashboard: boolean;
  pages_invoiceCollectionsDashboard: boolean;
  pages_serialTrackingDashboard: boolean;

  // Admin Pages
  pages_adminUsers: boolean;
  pages_adminSettings: boolean;
  pages_adminConfiguration: boolean;
  pages_governanceDashboard: boolean;
  pages_adminAnalytics: boolean;
  pages_numberingSchemes: boolean;

  // Auth Pages
  pages_resetPassword: boolean;
  pages_signup: boolean;

  // ==================== NAVIGATION ====================

  nav_salesDropdown: boolean;
  nav_purchaseDropdown: boolean;
  nav_adminDropdown: boolean;
  nav_dashboardsLink: boolean;
  nav_serialSearchLink: boolean;

  // ==================== QUOTE FEATURES ====================

  quotes_module: boolean;
  quotes_create: boolean;
  quotes_edit: boolean;
  quotes_delete: boolean;
  quotes_approve: boolean;
  quotes_cancel: boolean;
  quotes_close: boolean;
  quotes_clone: boolean;
  quotes_version: boolean;
  sales_orders_module: boolean;
  sales_orders_pdfGeneration: boolean;
  sales_orders_emailSending: boolean;

  // Quote Advanced Sections
  quotes_bomSection: boolean;
  quotes_slaSection: boolean;
  quotes_timelineSection: boolean;

  // Quote Actions
  quotes_convertToInvoice: boolean;
  quotes_convertToSalesOrder: boolean; // Added for flow control
  sales_orders_convertToInvoice: boolean; // Added for flow control
  quotes_convertToVendorPO: boolean;
  quotes_sendQuote: boolean;
  quotes_emailSending: boolean;
  quotes_pdfGeneration: boolean;
  quotes_templates: boolean;

  // Quote Fields
  quotes_referenceNumber: boolean;
  quotes_attentionTo: boolean;
  quotes_validityDays: boolean;
  quotes_discount: boolean;
  quotes_shippingCharges: boolean;
  quotes_notes: boolean;
  quotes_termsConditions: boolean;

  // ==================== INVOICE FEATURES ====================

  invoices_module: boolean;
  invoices_create: boolean;
  invoices_edit: boolean;
  invoices_delete: boolean;
  invoices_finalize: boolean;
  invoices_lock: boolean;
  invoices_cancel: boolean;

  // Invoice Types
  invoices_childInvoices: boolean;
  invoices_masterInvoices: boolean;
  invoices_milestoneInvoices: boolean;

  // Invoice Actions
  invoices_emailSending: boolean;
  invoices_pdfGeneration: boolean;
  invoices_paymentTracking: boolean;
  invoices_paymentHistory: boolean;
  invoices_partialPayments: boolean;

  // Invoice Reminders
  invoices_paymentReminders: boolean;
  invoices_overdueNotifications: boolean;
  invoices_autoReminders: boolean;

  // ==================== CREDIT NOTES ====================

  creditNotes_module: boolean;
  creditNotes_create: boolean;
  creditNotes_edit: boolean;
  creditNotes_delete: boolean;
  creditNotes_issue: boolean;
  creditNotes_apply: boolean;

  // ==================== DEBIT NOTES ====================

  debitNotes_module: boolean;
  debitNotes_create: boolean;
  debitNotes_edit: boolean;
  debitNotes_delete: boolean;
  debitNotes_issue: boolean;
  debitNotes_apply: boolean;

  // ==================== SUBSCRIPTIONS ====================
  subscriptions_module: boolean;



  // ==================== CLIENT/CRM FEATURES ====================

  clients_module: boolean;
  clients_create: boolean;
  clients_edit: boolean;
  clients_delete: boolean;

  // Client Features
  clients_segmentation: boolean;
  clients_tags: boolean;
  clients_preferredTheme: boolean;
  clients_gstin: boolean;
  clients_billingAddress: boolean;
  clients_shippingAddress: boolean;

  // Client Communication
  clients_communicationHistory: boolean;
  clients_timeline: boolean;
  clients_notes: boolean;
  clients_advancedSearch: boolean;

  // ==================== VENDOR & SUPPLY CHAIN ====================

  vendors_module: boolean;
  vendors_create: boolean;
  vendors_edit: boolean;
  vendors_delete: boolean;

  // Vendor POs
  vendorPO_module: boolean;
  vendorPO_create: boolean;
  vendorPO_edit: boolean;
  vendorPO_delete: boolean;
  vendorPO_emailSending: boolean;
  vendorPO_pdfGeneration: boolean;
  vendorPO_statusTracking: boolean;

  // GRN (Goods Received Notes)
  grn_module: boolean;
  grn_create: boolean;
  grn_edit: boolean;
  grn_delete: boolean;
  grn_serialNumberTracking: boolean;
  grn_qualityNotes: boolean;

  // Serial Numbers
  serialNumber_tracking: boolean;
  serialNumber_search: boolean;
  serialNumber_export: boolean;
  serialNumber_history: boolean;

  // ==================== PRODUCTS & INVENTORY ====================

  products_module: boolean;
  products_create: boolean;
  products_edit: boolean;
  products_delete: boolean;
  products_sku: boolean;
  products_categories: boolean;
  products_pricing: boolean;
  products_reorderLevel: boolean;
  
  // Products Linking & Stock Control
  products_link_to_quotes: boolean;
  products_link_to_invoices: boolean;
  products_link_to_vendor_pos: boolean;
  products_stock_tracking: boolean;
  products_stock_warnings: boolean;
  products_reserve_on_order: boolean;
  products_allow_negative_stock: boolean;

  // ==================== ANALYTICS & DASHBOARDS ====================

  analytics_module: boolean;
  analytics_revenueMetrics: boolean;
  analytics_quoteMetrics: boolean;
  analytics_invoiceMetrics: boolean;
  analytics_vendorMetrics: boolean;
  analytics_forecasting: boolean;
  analytics_trends: boolean;
  analytics_charts: boolean;

  // Specialized Dashboards
  dashboard_salesQuotes: boolean;
  dashboard_vendorPO: boolean;
  dashboard_invoiceCollections: boolean;
  dashboard_serialTracking: boolean;
  dashboard_governance: boolean;

  // ==================== PAYMENT FEATURES ====================

  payments_module: boolean;
  payments_create: boolean;
  payments_edit: boolean;
  payments_delete: boolean;
  payments_history: boolean;
  payments_methods: boolean;
  payments_transactionIds: boolean;
  payments_notes: boolean;
  payments_analytics: boolean;

  // ==================== TAX & PRICING ====================

  tax_gst: boolean;
  tax_cgst: boolean;
  tax_sgst: boolean;
  tax_igst: boolean;
  tax_hsnSac: boolean;
  tax_multiRate: boolean;
  tax_rateManagement: boolean;

  pricing_tiers: boolean;
  pricing_discount: boolean;
  pricing_shipping: boolean;
  pricing_automatic: boolean;

  // ==================== PDF & THEMES ====================

  pdf_generation: boolean;
  pdf_themes: boolean;
  pdf_customThemes: boolean;
  pdf_clientSpecificThemes: boolean;
  pdf_logo: boolean;
  pdf_headerFooter: boolean;
  pdf_watermark: boolean;

  // Available Themes
  theme_professional: boolean;
  theme_modern: boolean;
  theme_minimal: boolean;
  theme_creative: boolean;
  theme_premium: boolean;
  theme_government: boolean;
  theme_education: boolean;

  // ==================== EMAIL INTEGRATION ====================

  email_integration: boolean;
  email_resend: boolean;
  email_smtp: boolean;

  // Email Types
  email_welcome: boolean;
  email_quoteSending: boolean;
  email_invoiceSending: boolean;
  email_paymentReminders: boolean;
  email_overdueNotifications: boolean;
  email_vendorPO: boolean;

  // Email Templates
  email_templates_module: boolean;
  email_subscriptionRenewed: boolean;

  // ==================== ADMIN & CONFIGURATION ====================

  admin_userManagement: boolean;
  admin_settings: boolean;
  admin_configuration: boolean;
  admin_governance: boolean;
  admin_bankDetails: boolean;
  admin_taxRates: boolean;
  admin_numberingSchemes: boolean;
  admin_templates: boolean;
  admin_activityLogs: boolean;

  // ==================== SECURITY & ACCESS CONTROL ====================

  security_rbac: boolean;
  security_permissions: boolean;
  security_delegation: boolean;
  security_passwordReset: boolean;
  security_backupEmail: boolean;
  security_twoFactor: boolean;
  security_sessionManagement: boolean;
  security_rateLimiting: boolean;
  security_auditLogs: boolean;

  // ==================== USER MANAGEMENT ====================

  users_create: boolean;
  users_edit: boolean;
  users_delete: boolean;
  users_statusControl: boolean;
  users_roleAssignment: boolean;
  users_delegation: boolean;

  // ==================== ADVANCED FEATURES ====================

  advanced_apiRateLimiting: boolean;
  advanced_websockets: boolean;
  advanced_excelExport: boolean;
  advanced_bulkOperations: boolean;
  advanced_customReports: boolean;
  advanced_scheduledReports: boolean;

  // ==================== UI/UX FEATURES ====================

  ui_darkMode: boolean;
  ui_themeToggle: boolean;
  ui_animations: boolean;
  ui_tooltips: boolean;
  ui_breadcrumbs: boolean;
  ui_searchFilters: boolean;
  ui_sorting: boolean;
  ui_pagination: boolean;
  ui_responsiveDesign: boolean;

  // ==================== INTEGRATIONS ====================

  integration_vercelAnalytics: boolean;
  integration_externalApi: boolean;
}

/**
 * DEFAULT FEATURE FLAGS
 * All features enabled by default - customize as needed
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
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
  pdf_generation: true,  // Re-enabled for testing
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
  security_twoFactor: true,  // Not yet implemented
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
  advanced_scheduledReports: true,  // Not yet implemented

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
};

/**
 * Get feature flags from environment variables or use defaults
 */
export function getFeatureFlags(): FeatureFlags {
  const isBrowser = typeof window !== 'undefined';
  const flags = { ...DEFAULT_FEATURE_FLAGS };

  // Override with environment variables if available (client-side)
  if (isBrowser && typeof import.meta !== 'undefined' && import.meta.env) {
    Object.keys(flags).forEach((key) => {
      const envKey = `VITE_FEATURE_${key.toUpperCase()}`;
      const envValue = import.meta.env[envKey];
      if (envValue !== undefined) {
        flags[key as keyof FeatureFlags] = envValue === 'true';
      }
    });
  }

  // Override with environment variables (server-side)
  if (!isBrowser && typeof process !== 'undefined' && process.env) {
    Object.keys(flags).forEach((key) => {
      const envKey = `FEATURE_${key.toUpperCase()}`;
      const envValue = process.env[envKey];
      if (envValue !== undefined) {
        flags[key as keyof FeatureFlags] = envValue === 'true';
      }
    });
  }

  return flags;
}

// Export singleton instance
export const featureFlags = getFeatureFlags();

/**
 * Helper function to check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature];
}

/**
 * Helper to check multiple features (OR logic)
 */
export function anyFeatureEnabled(...features: (keyof FeatureFlags)[]): boolean {
  return features.some(f => isFeatureEnabled(f));
}

/**
 * Helper to check multiple features (AND logic)
 */
export function allFeaturesEnabled(...features: (keyof FeatureFlags)[]): boolean {
  return features.every(f => isFeatureEnabled(f));
}

