# Feature Flags Quick Reference

## 🎯 Common Operations

### Disable Entire Module

```typescript
// In shared/feature-flags.ts

// Disable Quotes Module
quotes_module: false,
pages_quotes: false,
pages_quoteCreate: false,
pages_quoteDetail: false,

// Disable Invoices Module  
invoices_module: false,
pages_invoices: false,
pages_invoiceDetail: false,

// Disable Vendors Module
vendors_module: false,
vendorPO_module: false,
pages_vendors: false,
pages_vendorPOs: false,
pages_vendorPODetail: false,

// Disable Supply Chain
grn_module: false,
pages_grn: false,
pages_grnDetail: false,
serialNumber_tracking: false,
pages_serialSearch: false,

// Disable Products
products_module: false,
pages_products: false,

// Disable Clients
clients_module: false,  // ⚠️ May affect quotes/invoices
pages_clients: false,
pages_clientDetail: false,
```

### Disable Specific Features

```typescript
// Disable Quote Email Sending
quotes_emailSending: false,
email_quoteSending: false,

// Disable Quote PDF Generation
quotes_pdfGeneration: false,

// Disable Invoice Reminders
invoices_paymentReminders: false,
invoices_overdueNotifications: false,

// Disable Child Invoices
invoices_childInvoices: false,
invoices_masterInvoices: false,

// Disable Dark Mode
ui_darkMode: false,
ui_themeToggle: false,

// Disable Signup
pages_signup: false,

// Disable Password Reset
pages_resetPassword: false,

// Disable User Management
pages_adminUsers: false,
users_create: false,
users_edit: false,

// Disable Analytics
analytics_module: false,
pages_dashboardsOverview: false,
pages_salesQuoteDashboard: false,
```

## 📱 Check Feature in Code

### React Components

```typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

function MyComponent() {
  const canEdit = useFeatureFlag('quotes_edit');
  const canSendEmail = useFeatureFlag('email_quoteSending');
  
  return (
    <div>
      {canEdit && <Button>Edit</Button>}
      {canSendEmail && <Button>Send Email</Button>}
    </div>
  );
}
```

### In Routes (App.tsx)

```typescript
import { isFeatureEnabled } from '@shared/feature-flags';

{isFeatureEnabled('pages_quotes') && (
  <Route path="/quotes" component={Quotes} />
)}
```

### Server Routes

```typescript
import { requireFeature } from './feature-flags-middleware';

app.get("/api/quotes", 
  requireFeature('quotes_module'),
  authMiddleware,
  handler
);
```

## 🔍 All 150+ Flags at a Glance

### Pages (32 flags)
- `pages_dashboard`, `pages_clients`, `pages_clientDetail`
- `pages_quotes`, `pages_quoteCreate`, `pages_quoteDetail`
- `pages_invoices`, `pages_invoiceDetail`
- `pages_vendors`, `pages_vendorPOs`, `pages_vendorPODetail`
- `pages_products`, `pages_grn`, `pages_grnDetail`, `pages_serialSearch`
- `pages_dashboardsOverview`, `pages_salesQuoteDashboard`, etc.
- `pages_adminUsers`, `pages_adminSettings`, `pages_adminConfiguration`
- `pages_governanceDashboard`, `pages_numberingSchemes`
- `pages_signup`, `pages_resetPassword`

### Navigation (5 flags)
- `nav_salesDropdown`, `nav_purchaseDropdown`, `nav_adminDropdown`
- `nav_dashboardsLink`, `nav_serialSearchLink`

### Quotes (18 flags)
- `quotes_module`, `quotes_create`, `quotes_edit`, `quotes_delete`
- `quotes_approve`, `quotes_cancel`, `quotes_close`, `quotes_version`
- `quotes_bomSection`, `quotes_slaSection`, `quotes_timelineSection`
- `quotes_convertToInvoice`, `quotes_convertToVendorPO`
- `quotes_emailSending`, `quotes_pdfGeneration`, `quotes_templates`
- `quotes_referenceNumber`, `quotes_attentionTo`, etc.

### Invoices (16 flags)
- `invoices_module`, `invoices_create`, `invoices_edit`, `invoices_delete`
- `invoices_finalize`, `invoices_lock`, `invoices_cancel`
- `invoices_childInvoices`, `invoices_masterInvoices`
- `invoices_emailSending`, `invoices_pdfGeneration`
- `invoices_paymentTracking`, `invoices_paymentHistory`
- `invoices_partialPayments`, `invoices_paymentReminders`

### Clients (13 flags)
- `clients_module`, `clients_create`, `clients_edit`, `clients_delete`
- `clients_segmentation`, `clients_tags`, `clients_preferredTheme`
- `clients_communicationHistory`, `clients_timeline`

### Vendors & Supply Chain (18 flags)
- `vendors_module`, `vendorPO_module`, `grn_module`
- `serialNumber_tracking`, `serialNumber_search`

### Products (8 flags)
- `products_module`, `products_create`, `products_edit`, `products_delete`
- `products_sku`, `products_categories`, `products_pricing`

### Payments (9 flags)
- `payments_module`, `payments_create`, `payments_edit`, `payments_delete`
- `payments_history`, `payments_methods`, `payments_notes`

### Tax & Pricing (11 flags)
- `tax_gst`, `tax_cgst`, `tax_sgst`, `tax_igst`, `tax_hsnSac`
- `pricing_discount`, `pricing_shipping`, `pricing_tiers`

### PDF & Themes (14 flags)
- `pdf_generation`, `pdf_themes`, `pdf_customThemes`
- `theme_professional`, `theme_modern`, `theme_minimal`, etc.

### Email (8 flags)
- `email_integration`, `email_resend`, `email_smtp`
- `email_quoteSending`, `email_invoiceSending`
- `email_paymentReminders`, `email_overdueNotifications`

### Admin (9 flags)
- `admin_userManagement`, `admin_settings`, `admin_configuration`
- `admin_governance`, `admin_bankDetails`, `admin_taxRates`

### Security (9 flags)
- `security_rbac`, `security_permissions`, `security_delegation`
- `security_passwordReset`, `security_auditLogs`

### UI/UX (9 flags)
- `ui_darkMode`, `ui_themeToggle`, `ui_animations`
- `ui_searchFilters`, `ui_sorting`, `ui_pagination`

## 💡 Tips

1. **Restart server** after changing flags
2. **Test thoroughly** before deploying
3. **Document changes** for client reference
4. **Use environment variables** for different environments
5. **Check API endpoint** `/api/feature-flags` to see active flags

## ⚡ Quick Commands

```bash
# Restart development server
npm run dev

# Check TypeScript errors
npm run typecheck

# Run tests
npm test
```

---

**Remember**: All features remain in code - just disabled!

