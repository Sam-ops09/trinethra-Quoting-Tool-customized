# Feature Disable Guide - QuoteProGen

> **Important**: This guide provides instructions for disabling features in the QuoteProGen system WITHOUT deleting any code. All features can be disabled through configuration flags, environment variables, and conditional rendering. The codebase remains intact for easy re-enabling of features.

## Table of Contents

1. [Feature Flag Configuration System](#feature-flag-configuration-system)
2. [Core Features](#core-features)
3. [Module-Specific Features](#module-specific-features)
4. [Advanced Features](#advanced-features)
5. [Integration Features](#integration-features)
6. [UI/UX Features](#ui-ux-features)
7. [Analytics & Reporting](#analytics--reporting)
8. [Security & Access Control](#security--access-control)
9. [Implementation Instructions](#implementation-instructions)

---

## Quick Start - Feature Flag System

### Overview

This system allows you to disable any feature by setting a flag to `false` without touching existing code. The system works at three levels:

1. **Route Level** - Hide entire pages/routes
2. **UI Level** - Hide specific UI components, buttons, sections
3. **API Level** - Block API endpoints from being accessed

### System Architecture

```
┌─────────────────────────────────────────────────┐
│          Feature Flags Configuration            │
│        shared/feature-flags.ts (Source)         │
└──────────────┬──────────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
┌─────────────┐  ┌─────────────┐
│   Client    │  │   Server    │
│  (React)    │  │  (Express)  │
└──────┬──────┘  └──────┬──────┘
       │                │
       ▼                ▼
  ┌────────┐      ┌──────────┐
  │ Routes │      │   API    │
  │   UI   │      │ Routes   │
  │Sidebar │      │Middleware│
  └────────┘      └──────────┘
```

---

## All Pages & Routes Reference

### Complete Page List (32 Pages)

Below is every single page in the application with its route, file location, and role access:

| # | Page Name | Route | File | Roles with Access | Can Disable? |
|---|-----------|-------|------|-------------------|--------------|
| 1 | **Login** | `/login` | `login.tsx` | Public | ⚠️ No (Auth) |
| 2 | **Signup** | `/signup` | `signup.tsx` | Public | ⚠️ No (Auth) |
| 3 | **Reset Password** | `/reset-password` | `reset-password.tsx` | Public | ✅ Yes |
| 4 | **Dashboard** | `/` | `dashboard.tsx` | All | ⚠️ No (Home) |
| 5 | **Clients List** | `/clients` | `clients.tsx` | Sales, Finance, Admin | ✅ Yes |
| 6 | **Client Detail** | `/clients/:id` | `client-detail.tsx` | Sales, Finance, Admin | ✅ Yes |
| 7 | **Quotes List** | `/quotes` | `quotes.tsx` | Sales, Finance, Admin | ✅ Yes |
| 8 | **Quote Create** | `/quotes/create` | `quote-create.tsx` | Sales, Admin | ✅ Yes |
| 9 | **Quote Edit** | `/quotes/:id/edit` | `quote-create.tsx` | Sales, Admin | ✅ Yes |
| 10 | **Quote Detail** | `/quotes/:id` | `quote-detail.tsx` | Sales, Finance, Admin | ✅ Yes |
| 11 | **Invoices List** | `/invoices` | `invoices.tsx` | Sales, Finance, Admin | ✅ Yes |
| 12 | **Invoice Detail** | `/invoices/:id` | `invoice-detail.tsx` | Sales, Finance, Admin | ✅ Yes |
| 13 | **Vendors List** | `/vendors` | `vendors.tsx` | Purchase, Admin | ✅ Yes |
| 14 | **Vendor POs List** | `/vendor-pos` | `vendor-pos.tsx` | Purchase, Admin | ✅ Yes |
| 15 | **Vendor PO Detail** | `/vendor-pos/:id` | `vendor-po-detail.tsx` | Purchase, Admin | ✅ Yes |
| 16 | **Products List** | `/products` | `products.tsx` | Sales, Purchase, Admin | ✅ Yes |
| 17 | **GRN List** | `/grn` | `grn-list.tsx` | Purchase, Admin | ✅ Yes |
| 18 | **GRN Detail** | `/grn/:id` | `grn-detail.tsx` | Purchase, Admin | ✅ Yes |
| 19 | **Serial Search** | `/serial-search` | `serial-search.tsx` | Sales, Purchase, Admin | ✅ Yes |
| 20 | **Dashboards Overview** | `/dashboards` | `dashboards-overview.tsx` | All | ✅ Yes |
| 21 | **Sales Quote Dashboard** | `/dashboards/sales-quotes` | `sales-quote-dashboard.tsx` | Sales, Admin | ✅ Yes |
| 22 | **Vendor PO Dashboard** | `/dashboards/vendor-po` | `vendor-po-dashboard.tsx` | Purchase, Admin | ✅ Yes |
| 23 | **Invoice Collections Dashboard** | `/dashboards/invoice-collections` | `invoice-collections-dashboard.tsx` | Finance, Admin | ✅ Yes |
| 24 | **Serial Tracking Dashboard** | `/dashboards/serial-tracking` | `serial-tracking-dashboard.tsx` | Purchase, Admin | ✅ Yes |
| 25 | **Governance Dashboard** | `/admin/governance` | `governance-dashboard.tsx` | Admin only | ✅ Yes |
| 26 | **User Management** | `/admin/users` | `admin-users.tsx` | Admin only | ✅ Yes |
| 27 | **Admin Settings** | `/admin/settings` | `admin-settings.tsx` | Admin only | ✅ Yes |
| 28 | **Admin Configuration** | `/admin/configuration` | `admin-configuration.tsx` | Admin only | ✅ Yes |
| 29 | **Numbering Schemes** | Part of Admin Config | `numbering-schemes.tsx` | Admin only | ✅ Yes |
| 30 | **Analytics** | Embedded in Dashboard | `analytics.tsx` | Sales, Finance, Admin | ✅ Yes |
| 31 | **Not Found** | `*` (404) | `not-found.tsx` | All | ⚠️ No (Error) |
| 32 | **Access Denied** | Inline in App.tsx | Component | All | ⚠️ No (Error) |

### Navigation Structure

**Desktop Navigation** (Horizontal Navbar with Dropdowns):
- **Home** (Dashboard icon)
- **Sales** Dropdown
  - Quotes
  - Clients  
  - Invoices
- **Purchase** Dropdown
  - Vendors
  - Vendor POs
  - Products
  - GRN
- **Serial Search** (Standalone)
- **Admin** Dropdown (Admin only)
  - User Management
  - Governance
  - Configuration
  - Advanced Settings

**Mobile Navigation** (Sidebar Drawer):
- All items listed vertically
- Grouped by: Menu, Admin

---

## Core Module Features

### Step 1: Create Feature Flags Configuration File

Create a new file: `shared/feature-flags.ts`

```typescript
/**
 * FEATURE FLAGS CONFIGURATION
 * Central location for enabling/disabling features without code deletion
 * Set any flag to false to disable a feature
 */

export interface FeatureFlags {
  // Core Modules
  quotes: boolean;
  invoices: boolean;
  clients: boolean;
  vendors: boolean;
  products: boolean;
  
  // Quote Features
  quoteAdvancedSections: boolean;  // BOM, SLA, Timeline
  quoteTemplates: boolean;
  quoteVersioning: boolean;
  quoteEmailSending: boolean;
  quotePdfGeneration: boolean;
  quoteToInvoiceConversion: boolean;
  quoteToVendorPoConversion: boolean;
  
  // Invoice Features
  invoiceChildInvoices: boolean;
  invoiceMasterInvoices: boolean;
  invoicePaymentTracking: boolean;
  invoicePaymentReminders: boolean;
  invoiceOverdueNotifications: boolean;
  invoicePdfGeneration: boolean;
  invoiceEmailSending: boolean;
  invoicePartialPayments: boolean;
  
  // Client Features
  clientSegmentation: boolean;
  clientTags: boolean;
  clientCommunicationHistory: boolean;
  clientPreferredThemes: boolean;
  clientTimeline: boolean;
  clientAdvancedSearch: boolean;
  
  // Vendor & Supply Chain Features
  vendorManagement: boolean;
  vendorPurchaseOrders: boolean;
  vendorGoodsReceivedNotes: boolean;
  serialNumberTracking: boolean;
  inventoryManagement: boolean;
  
  // Advanced Quote Features
  billOfMaterials: boolean;
  serviceLevelAgreements: boolean;
  projectTimeline: boolean;
  
  // Payment Features
  paymentHistory: boolean;
  paymentMethods: boolean;
  paymentAnalytics: boolean;
  
  // Analytics & Dashboards
  analyticsDashboard: boolean;
  salesQuoteDashboard: boolean;
  vendorPoDashboard: boolean;
  invoiceCollectionsDashboard: boolean;
  serialTrackingDashboard: boolean;
  governanceDashboard: boolean;
  revenueForecasting: boolean;
  
  // Tax & Pricing
  gstTaxCalculation: boolean;
  hsnSacCodes: boolean;
  multiTaxSupport: boolean;
  pricingTiers: boolean;
  discountManagement: boolean;
  shippingCharges: boolean;
  
  // PDF & Theming
  pdfThemes: boolean;
  customPdfThemes: boolean;
  clientSpecificThemes: boolean;
  pdfLogoSupport: boolean;
  
  // Email Integration
  emailIntegration: boolean;
  resendApi: boolean;
  smtpSupport: boolean;
  welcomeEmails: boolean;
  
  // Security Features
  roleBasedAccessControl: boolean;
  delegationSystem: boolean;
  passwordReset: boolean;
  backupEmail: boolean;
  twoFactorAuth: boolean;  // Future feature
  sessionManagement: boolean;
  activityLogging: boolean;
  
  // Configuration Features
  bankDetailsManagement: boolean;
  numberingSchemes: boolean;
  taxRateManagement: boolean;
  documentTemplates: boolean;
  
  // User Management
  userManagement: boolean;
  userStatusControl: boolean;
  multipleRoles: boolean;
  
  // Advanced Features
  apiRateLimiting: boolean;
  websocketSupport: boolean;
  excelExport: boolean;
  darkMode: boolean;
  
  // Reporting
  customReports: boolean;
  scheduleReports: boolean;  // Future feature
  exportPdf: boolean;
  exportExcel: boolean;
}

/**
 * DEFAULT FEATURE FLAGS
 * All features enabled by default
 * Set to false to disable specific features
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // Core Modules
  quotes: true,
  invoices: true,
  clients: true,
  vendors: true,
  products: true,
  
  // Quote Features
  quoteAdvancedSections: true,
  quoteTemplates: true,
  quoteVersioning: true,
  quoteEmailSending: true,
  quotePdfGeneration: true,
  quoteToInvoiceConversion: true,
  quoteToVendorPoConversion: true,
  
  // Invoice Features
  invoiceChildInvoices: true,
  invoiceMasterInvoices: true,
  invoicePaymentTracking: true,
  invoicePaymentReminders: true,
  invoiceOverdueNotifications: true,
  invoicePdfGeneration: true,
  invoiceEmailSending: true,
  invoicePartialPayments: true,
  
  // Client Features
  clientSegmentation: true,
  clientTags: true,
  clientCommunicationHistory: true,
  clientPreferredThemes: true,
  clientTimeline: true,
  clientAdvancedSearch: true,
  
  // Vendor & Supply Chain Features
  vendorManagement: true,
  vendorPurchaseOrders: true,
  vendorGoodsReceivedNotes: true,
  serialNumberTracking: true,
  inventoryManagement: true,
  
  // Advanced Quote Features
  billOfMaterials: true,
  serviceLevelAgreements: true,
  projectTimeline: true,
  
  // Payment Features
  paymentHistory: true,
  paymentMethods: true,
  paymentAnalytics: true,
  
  // Analytics & Dashboards
  analyticsDashboard: true,
  salesQuoteDashboard: true,
  vendorPoDashboard: true,
  invoiceCollectionsDashboard: true,
  serialTrackingDashboard: true,
  governanceDashboard: true,
  revenueForecasting: true,
  
  // Tax & Pricing
  gstTaxCalculation: true,
  hsnSacCodes: true,
  multiTaxSupport: true,
  pricingTiers: true,
  discountManagement: true,
  shippingCharges: true,
  
  // PDF & Theming
  pdfThemes: true,
  customPdfThemes: true,
  clientSpecificThemes: true,
  pdfLogoSupport: true,
  
  // Email Integration
  emailIntegration: true,
  resendApi: true,
  smtpSupport: true,
  welcomeEmails: true,
  
  // Security Features
  roleBasedAccessControl: true,
  delegationSystem: true,
  passwordReset: true,
  backupEmail: true,
  twoFactorAuth: false,  // Not yet implemented
  sessionManagement: true,
  activityLogging: true,
  
  // Configuration Features
  bankDetailsManagement: true,
  numberingSchemes: true,
  taxRateManagement: true,
  documentTemplates: true,
  
  // User Management
  userManagement: true,
  userStatusControl: true,
  multipleRoles: true,
  
  // Advanced Features
  apiRateLimiting: true,
  websocketSupport: true,
  excelExport: true,
  darkMode: true,
  
  // Reporting
  customReports: true,
  scheduleReports: false,  // Not yet implemented
  exportPdf: true,
  exportExcel: true,
};

/**
 * Get feature flags from environment variables or use defaults
 * Environment variables take precedence over defaults
 */
export function getFeatureFlags(): FeatureFlags {
  // Check if running in browser or Node.js
  const isBrowser = typeof window !== 'undefined';
  
  // In production, you can override via environment variables
  // Example: VITE_FEATURE_QUOTES=false to disable quotes module
  const flags = { ...DEFAULT_FEATURE_FLAGS };
  
  // Override with environment variables if available
  if (isBrowser && import.meta.env) {
    Object.keys(flags).forEach((key) => {
      const envKey = `VITE_FEATURE_${key.toUpperCase()}`;
      const envValue = import.meta.env[envKey];
      if (envValue !== undefined) {
        flags[key as keyof FeatureFlags] = envValue === 'true';
      }
    });
  }
  
  return flags;
}

// Export singleton instance
export const featureFlags = getFeatureFlags();

// Helper function to check if a feature is enabled
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature];
}
```

### Step 2: Create Feature Flag Hook for React Components

Create a new file: `client/src/hooks/useFeatureFlag.ts`

```typescript
import { featureFlags, isFeatureEnabled, type FeatureFlags } from '@/../../shared/feature-flags';

/**
 * React hook to check if a feature is enabled
 * Usage: const isEnabled = useFeatureFlag('quotes');
 */
export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  return isFeatureEnabled(feature);
}

/**
 * React hook to get all feature flags
 */
export function useFeatureFlags(): FeatureFlags {
  return featureFlags;
}

/**
 * HOC to conditionally render component based on feature flag
 */
export function withFeatureFlag<P extends object>(
  Component: React.ComponentType<P>,
  feature: keyof FeatureFlags,
  FallbackComponent?: React.ComponentType<P>
) {
  return function FeatureFlaggedComponent(props: P) {
    if (isFeatureEnabled(feature)) {
      return <Component {...props} />;
    }
    
    if (FallbackComponent) {
      return <FallbackComponent {...props} />;
    }
    
    return null;
  };
}
```

### Step 3: Create Server-Side Feature Flag Middleware

Create a new file: `server/feature-flags-middleware.ts`

```typescript
import type { Request, Response, NextFunction } from 'express';
import { featureFlags, isFeatureEnabled, type FeatureFlags } from '../shared/feature-flags';

/**
 * Middleware to check if a feature is enabled
 * Returns 404 if feature is disabled
 */
export function requireFeature(feature: keyof FeatureFlags) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!isFeatureEnabled(feature)) {
      return res.status(404).json({
        error: 'Feature not available',
        message: `The ${feature} feature is currently disabled`,
      });
    }
    next();
  };
}

/**
 * Middleware to add feature flags to response
 */
export function addFeatureFlagsToResponse(req: Request, res: Response, next: NextFunction) {
  res.locals.featureFlags = featureFlags;
  next();
}

/**
 * API endpoint to get feature flags
 */
export function getFeatureFlagsEndpoint(req: Request, res: Response) {
  res.json(featureFlags);
}
```

---

## Core Features

### 1. Disable Quotes Module

**What it does**: Completely disables quote creation, viewing, and management.

**Steps**:
1. Set in `shared/feature-flags.ts`:
   ```typescript
   quotes: false,
   ```

2. Update `client/src/App.tsx` to conditionally render routes:
   ```typescript
   import { isFeatureEnabled } from '@/../../shared/feature-flags';
   
   // In your route definitions
   {isFeatureEnabled('quotes') && (
     <>
       <Route path="/quotes" component={() => <ProtectedRoute component={Quotes} requiredPath="/quotes" />} />
       <Route path="/quotes/create" component={() => <ProtectedRoute component={QuoteCreate} requiredPath="/quotes" />} />
       <Route path="/quotes/:id" component={() => <ProtectedRoute component={QuoteDetail} requiredPath="/quotes" />} />
     </>
   )}
   ```

3. Update sidebar in `client/src/components/app-sidebar.tsx`:
   ```typescript
   import { isFeatureEnabled } from '@/../../shared/feature-flags';
   
   // In navigation items
   {isFeatureEnabled('quotes') && (
     <SidebarMenuItem>
       <SidebarMenuButton asChild>
         <Link href="/quotes">
           <FileText className="h-4 w-4" />
           <span>Quotes</span>
         </Link>
       </SidebarMenuButton>
     </SidebarMenuItem>
   )}
   ```

4. Update API routes in `server/routes.ts`:
   ```typescript
   import { requireFeature } from './feature-flags-middleware';
   
   // Protect quote routes
   app.get("/api/quotes", requireFeature('quotes'), authMiddleware, async (req, res) => {
     // existing code
   });
   ```

**Database Impact**: No changes needed - data remains intact.

---

### 2. Disable Invoices Module

**What it does**: Disables invoice generation, viewing, and payment tracking.

**Steps**:
1. Set in `shared/feature-flags.ts`:
   ```typescript
   invoices: false,
   ```

2. Hide routes in `client/src/App.tsx`:
   ```typescript
   {isFeatureEnabled('invoices') && (
     <>
       <Route path="/invoices" component={() => <ProtectedRoute component={Invoices} requiredPath="/invoices" />} />
       <Route path="/invoices/:id" component={() => <ProtectedRoute component={InvoiceDetail} requiredPath="/invoices" />} />
     </>
   )}
   ```

3. Update sidebar navigation
4. Protect API routes with `requireFeature('invoices')`

**Database Impact**: No changes needed.

---

### 3. Disable Clients/CRM Module

**What it does**: Disables client management and CRM features.

**Steps**:
1. Set in `shared/feature-flags.ts`:
   ```typescript
   clients: false,
   ```

2. Update routes and sidebar
3. Protect API endpoints

**Note**: If clients are disabled, quotes and invoices may need alternative client selection or simplified workflow.

---

### 4. Disable Vendors Module

**What it does**: Disables vendor management and supplier features.

**Steps**:
1. Set in `shared/feature-flags.ts`:
   ```typescript
   vendors: false,
   vendorManagement: false,
   ```

2. Hide vendor routes
3. Protect vendor API endpoints

---

### 5. Disable Products Module

**What it does**: Disables product catalog and inventory.

**Steps**:
1. Set in `shared/feature-flags.ts`:
   ```typescript
   products: false,
   inventoryManagement: false,
   ```

---

## Module-Specific Features

### 6. Disable Quote Advanced Sections

**What it does**: Disables BOM, SLA, and Timeline sections in quotes.

**Steps**:
1. Set flags:
   ```typescript
   quoteAdvancedSections: false,
   billOfMaterials: false,
   serviceLevelAgreements: false,
   projectTimeline: false,
   ```

2. Update `client/src/pages/quote-create.tsx` and `quote-detail.tsx`:
   ```typescript
   import { isFeatureEnabled } from '@/../../shared/feature-flags';
   
   // Conditionally render sections
   {isFeatureEnabled('billOfMaterials') && (
     <BOMSection />
   )}
   
   {isFeatureEnabled('serviceLevelAgreements') && (
     <SLASection />
   )}
   
   {isFeatureEnabled('projectTimeline') && (
     <TimelineSection />
   )}
   ```

**Database Impact**: Fields `bomSection`, `slaSection`, `timelineSection` in quotes table remain but won't be populated.

---

### 7. Disable Quote Templates

**What it does**: Removes ability to save and reuse quote templates.

**Steps**:
1. Set flag:
   ```typescript
   quoteTemplates: false,
   ```

2. Hide template selection UI in quote creation forms
3. Protect template API endpoints

---

### 8. Disable Quote Email Sending

**What it does**: Removes "Send Email" button from quote pages.

**Steps**:
1. Set flag:
   ```typescript
   quoteEmailSending: false,
   emailIntegration: false,  // Disables all email features
   ```

2. Update quote detail page:
   ```typescript
   {isFeatureEnabled('quoteEmailSending') && (
     <Button onClick={sendQuoteEmail}>Send Email</Button>
   )}
   ```

**Service Impact**: Email service can remain configured but won't be triggered.

---

### 9. Disable Quote PDF Generation

**What it does**: Removes PDF download/generation for quotes.

**Steps**:
1. Set flag:
   ```typescript
   quotePdfGeneration: false,
   ```

2. Hide PDF buttons in UI
3. Protect PDF generation endpoints

---

### 10. Disable Quote to Invoice Conversion

**What it does**: Removes "Create Invoice" button from approved quotes.

**Steps**:
1. Set flag:
   ```typescript
   quoteToInvoiceConversion: false,
   ```

2. Update quote detail page to hide conversion button:
   ```typescript
   {isFeatureEnabled('quoteToInvoiceConversion') && quote.status === 'approved' && (
     <Button onClick={createInvoice}>Create Invoice</Button>
   )}
   ```

---

### 11. Disable Child/Master Invoices

**What it does**: Disables hierarchical invoice structure for milestone billing.

**Steps**:
1. Set flags:
   ```typescript
   invoiceChildInvoices: false,
   invoiceMasterInvoices: false,
   ```

2. Hide "Create Child Invoice" buttons
3. Hide master invoice status fields

**Database Impact**: Fields `isMaster`, `masterInvoiceStatus`, `parentInvoiceId` remain unused.

---

### 12. Disable Payment Reminders

**What it does**: Disables automated payment reminder emails.

**Steps**:
1. Set flags:
   ```typescript
   invoicePaymentReminders: false,
   invoiceOverdueNotifications: false,
   ```

2. Comment out or skip reminder cron jobs/scheduled tasks
3. Hide "Send Reminder" buttons in UI

---

### 13. Disable Partial Payments

**What it does**: Only allows full payment of invoices.

**Steps**:
1. Set flag:
   ```typescript
   invoicePartialPayments: false,
   ```

2. Update payment form to require full amount
3. Hide payment history if only one payment allowed

---

## Advanced Features

### 14. Disable Serial Number Tracking

**What it does**: Disables serial number assignment and tracking for received goods.

**Steps**:
1. Set flags:
   ```typescript
   serialNumberTracking: false,
   ```

2. Hide serial number routes and UI
3. Protect serial number API endpoints

---

### 15. Disable Vendor Purchase Orders

**What it does**: Disables PO creation and management.

**Steps**:
1. Set flags:
   ```typescript
   vendorPurchaseOrders: false,
   quoteToVendorPoConversion: false,
   ```

2. Hide PO routes and navigation
3. Protect PO API endpoints

---

### 16. Disable Goods Received Notes (GRN)

**What it does**: Disables GRN tracking and stock receipt.

**Steps**:
1. Set flag:
   ```typescript
   vendorGoodsReceivedNotes: false,
   ```

2. Hide GRN routes
3. Protect GRN API endpoints

---

### 17. Disable Client Segmentation

**What it does**: Removes client categorization (Enterprise, Corporate, Startup, etc.).

**Steps**:
1. Set flag:
   ```typescript
   clientSegmentation: false,
   ```

2. Hide segment dropdown in client forms
3. Don't display segment badges in client lists

**Database Impact**: `segment` field in clients table remains but won't be set.

---

### 18. Disable Client Tags

**What it does**: Removes custom tag system for clients.

**Steps**:
1. Set flag:
   ```typescript
   clientTags: false,
   ```

2. Hide tag input in client forms
3. Hide tag filters in client list

---

### 19. Disable Client Communication History

**What it does**: Removes communication tracking (emails, calls, meetings, notes).

**Steps**:
1. Set flag:
   ```typescript
   clientCommunicationHistory: false,
   ```

2. Hide communication tab in client detail page
3. Protect communication API endpoints

**Database Impact**: `clientCommunications` table remains but won't be populated.

---

### 20. Disable Client Preferred Themes

**What it does**: Uses default PDF theme for all clients instead of client-specific themes.

**Steps**:
1. Set flags:
   ```typescript
   clientPreferredThemes: false,
   clientSpecificThemes: false,
   ```

2. Hide theme selector in client form
3. Always use default theme in PDF generation

---

## Analytics & Reporting

### 21. Disable Analytics Dashboard

**What it does**: Disables main analytics/dashboard page with revenue metrics.

**Steps**:
1. Set flag:
   ```typescript
   analyticsDashboard: false,
   ```

2. Hide dashboard route
3. Protect analytics API endpoints

**Alternative**: Redirect to a simplified dashboard or quote list.

---

### 22. Disable Specialized Dashboards

**What it does**: Disables Sales Quote, Vendor PO, Invoice Collections, Serial Tracking, and Governance dashboards.

**Steps**:
1. Set flags:
   ```typescript
   salesQuoteDashboard: false,
   vendorPoDashboard: false,
   invoiceCollectionsDashboard: false,
   serialTrackingDashboard: false,
   governanceDashboard: false,
   ```

2. Hide dashboard navigation in `client/src/pages/dashboards-overview.tsx`:
   ```typescript
   {isFeatureEnabled('salesQuoteDashboard') && (
     <DashboardCard title="Sales Quotes" ... />
   )}
   ```

---

### 23. Disable Revenue Forecasting

**What it does**: Removes AI-powered revenue predictions from analytics.

**Steps**:
1. Set flag:
   ```typescript
   revenueForecasting: false,
   ```

2. Hide forecasting charts in dashboard
3. Skip forecast calculations in analytics service

---

### 24. Disable Excel Export

**What it does**: Removes Excel export functionality.

**Steps**:
1. Set flag:
   ```typescript
   excelExport: false,
   ```

2. Hide "Export to Excel" buttons
3. Protect Excel export API endpoints

---

## Tax & Pricing Features

### 25. Disable GST Tax Calculation

**What it does**: Disables automatic GST/CGST/SGST/IGST calculation.

**Steps**:
1. Set flags:
   ```typescript
   gstTaxCalculation: false,
   multiTaxSupport: false,
   ```

2. Hide tax fields in quote/invoice forms
3. Set all tax values to 0 in calculations

**Alternative**: Use simple subtotal only or flat tax rate.

---

### 26. Disable HSN/SAC Codes

**What it does**: Removes HSN/SAC code input for items.

**Steps**:
1. Set flag:
   ```typescript
   hsnSacCodes: false,
   ```

2. Hide HSN/SAC input in quote/invoice item forms
3. Don't display HSN/SAC in PDFs

**Database Impact**: `hsnSac` field in `quoteItems` remains but won't be populated.

---

### 27. Disable Discount Management

**What it does**: Removes discount functionality from quotes/invoices.

**Steps**:
1. Set flag:
   ```typescript
   discountManagement: false,
   ```

2. Hide discount input fields
3. Always set discount to 0 in calculations

---

### 28. Disable Shipping Charges

**What it does**: Removes shipping/delivery charge fields.

**Steps**:
1. Set flag:
   ```typescript
   shippingCharges: false,
   ```

2. Hide shipping charge input
3. Always set shipping to 0 in calculations

---

### 29. Disable Pricing Tiers

**What it does**: Removes Standard/Premium/Enterprise pricing levels.

**Steps**:
1. Set flag:
   ```typescript
   pricingTiers: false,
   ```

2. Hide pricing tier selector
3. Use single pricing model

---

## PDF & Theming

### 30. Disable PDF Themes

**What it does**: Uses only default PDF theme, removes theme selection.

**Steps**:
1. Set flags:
   ```typescript
   pdfThemes: false,
   customPdfThemes: false,
   ```

2. Always use "professional" theme in PDF generation:
   ```typescript
   const theme = isFeatureEnabled('pdfThemes') ? selectedTheme : 'professional';
   ```

---

### 31. Disable PDF Logo Support

**What it does**: Generates PDFs without logo/header images.

**Steps**:
1. Set flag:
   ```typescript
   pdfLogoSupport: false,
   ```

2. Skip logo rendering in PDF service

---

## Email Integration

### 32. Disable All Email Features

**What it does**: Completely disables email sending (quotes, invoices, reminders, welcome emails).

**Steps**:
1. Set flags:
   ```typescript
   emailIntegration: false,
   resendApi: false,
   smtpSupport: false,
   welcomeEmails: false,
   quoteEmailSending: false,
   invoiceEmailSending: false,
   invoicePaymentReminders: false,
   invoiceOverdueNotifications: false,
   ```

2. Hide all "Send Email" buttons
3. Skip email service initialization in `api/index.ts`

**Service Impact**: Email service won't initialize, no emails sent.

---

### 33. Disable Welcome Emails Only

**What it does**: Users can register but don't receive welcome emails.

**Steps**:
1. Set flag:
   ```typescript
   welcomeEmails: false,
   ```

2. Skip welcome email in signup route

---

## Security & Access Control

### 34. Disable Role-Based Access Control

**What it does**: Gives all users full access (not recommended for production).

**Steps**:
1. Set flag:
   ```typescript
   roleBasedAccessControl: false,
   ```

2. Skip permission checks in routes:
   ```typescript
   if (isFeatureEnabled('roleBasedAccessControl')) {
     // Check permissions
   } else {
     // Allow all
   }
   ```

**Warning**: This is a security risk. Only disable for single-user or demo systems.

---

### 35. Disable Delegation System

**What it does**: Removes temporary approval authority delegation.

**Steps**:
1. Set flag:
   ```typescript
   delegationSystem: false,
   ```

2. Hide delegation fields in user management
3. Skip delegation checks in approval workflows

**Database Impact**: Delegation fields in users table remain unused.

---

### 36. Disable Password Reset

**What it does**: Removes "Forgot Password" functionality.

**Steps**:
1. Set flag:
   ```typescript
   passwordReset: false,
   ```

2. Hide "Forgot Password" link on login page
3. Protect password reset API endpoints

**Warning**: Users who forget passwords will need admin intervention.

---

### 37. Disable Backup Email

**What it does**: Removes secondary email for account recovery.

**Steps**:
1. Set flag:
   ```typescript
   backupEmail: false,
   ```

2. Hide backup email field in user profile

---

### 38. Disable Activity Logging

**What it does**: Stops recording user actions in audit trail.

**Steps**:
1. Set flag:
   ```typescript
   activityLogging: false,
   ```

2. Skip activity log creation in CRUD operations
3. Hide activity log viewer

**Compliance Warning**: May be required for audit/compliance requirements.

---

### 39. Disable Session Management

**What it does**: Uses only JWT tokens without session store (not recommended).

**Steps**:
1. Set flag:
   ```typescript
   sessionManagement: false,
   ```

2. Skip session middleware setup

**Warning**: Reduces security - sessions help with token revocation.

---

## Configuration Features

### 40. Disable Bank Details Management

**What it does**: Removes bank account configuration for invoices.

**Steps**:
1. Set flag:
   ```typescript
   bankDetailsManagement: false,
   ```

2. Hide bank details section in admin settings
3. Don't display bank details on invoices

---

### 41. Disable Numbering Schemes

**What it does**: Uses default sequential numbering for quotes/invoices/POs.

**Steps**:
1. Set flag:
   ```typescript
   numberingSchemes: false,
   ```

2. Hide numbering configuration in admin settings
3. Use default format: QUO-YYYY-NNNN, INV-YYYY-NNNN, PO-YYYY-NNNN

---

### 42. Disable Tax Rate Management

**What it does**: Uses hardcoded tax rates instead of configurable rates.

**Steps**:
1. Set flag:
   ```typescript
   taxRateManagement: false,
   ```

2. Hide tax rate configuration UI
3. Use default tax rates (e.g., 18% GST)

---

### 43. Disable Document Templates

**What it does**: Removes ability to create/save custom document templates.

**Steps**:
1. Set flag:
   ```typescript
   documentTemplates: false,
   quoteTemplates: false,
   ```

2. Hide template management UI
3. Protect template API endpoints

---

## User Management

### 44. Disable User Management

**What it does**: Prevents creating/editing/deleting users (except self).

**Steps**:
1. Set flag:
   ```typescript
   userManagement: false,
   ```

2. Hide admin users page from navigation
3. Protect user management API endpoints

**Note**: Initial admin user can still modify their own profile.

---

### 45. Disable User Status Control

**What it does**: All users remain active, can't be deactivated.

**Steps**:
1. Set flag:
   ```typescript
   userStatusControl: false,
   ```

2. Hide status toggle in user management
3. Skip status checks in authentication

---

### 46. Disable Multiple Roles

**What it does**: Forces all users to single role (e.g., all users are "viewer").

**Steps**:
1. Set flag:
   ```typescript
   multipleRoles: false,
   ```

2. Hide role selector in user creation
3. Assign default role to all users

---

## Advanced Features

### 47. Disable API Rate Limiting

**What it does**: Removes rate limiting on API endpoints.

**Steps**:
1. Set flag:
   ```typescript
   apiRateLimiting: false,
   ```

2. Skip rate limiter middleware setup in `api/index.ts`:
   ```typescript
   if (isFeatureEnabled('apiRateLimiting')) {
     app.use(rateLimiter);
   }
   ```

**Security Warning**: May expose API to abuse.

---

### 48. Disable WebSocket Support

**What it does**: Removes real-time features (if any).

**Steps**:
1. Set flag:
   ```typescript
   websocketSupport: false,
   ```

2. Skip WebSocket server initialization

---

### 49. Disable Dark Mode

**What it does**: Removes theme toggle, forces light mode.

**Steps**:
1. Set flag:
   ```typescript
   darkMode: false,
   ```

2. Hide theme toggle in header/settings
3. Force light theme in ThemeProvider

---

### 50. Disable PDF Export

**What it does**: Removes all PDF generation (quotes, invoices, reports).

**Steps**:
1. Set flags:
   ```typescript
   quotePdfGeneration: false,
   invoicePdfGeneration: false,
   exportPdf: false,
   ```

2. Hide all "Download PDF" buttons
3. Protect PDF generation endpoints

---

## Implementation Instructions

### Full Implementation Steps

#### 1. Create Configuration Files

Create the three files mentioned in [Feature Flag Configuration System](#feature-flag-configuration-system):
- `shared/feature-flags.ts`
- `client/src/hooks/useFeatureFlag.ts`
- `server/feature-flags-middleware.ts`

#### 2. Update App Routes

Edit `client/src/App.tsx` to wrap routes with feature flag checks:

```typescript
import { isFeatureEnabled } from '@/../../shared/feature-flags';

function Router() {
  return (
    <Switch>
      {/* Public routes - always available */}
      <Route path="/login" component={() => <PublicRoute component={Login} />} />
      <Route path="/signup" component={() => <PublicRoute component={Signup} />} />
      
      {/* Feature-flagged routes */}
      {isFeatureEnabled('quotes') && (
        <>
          <Route path="/quotes" component={() => <ProtectedRoute component={Quotes} requiredPath="/quotes" />} />
          <Route path="/quotes/create" component={() => <ProtectedRoute component={QuoteCreate} requiredPath="/quotes" />} />
          <Route path="/quotes/:id" component={() => <ProtectedRoute component={QuoteDetail} requiredPath="/quotes" />} />
        </>
      )}
      
      {isFeatureEnabled('invoices') && (
        <>
          <Route path="/invoices" component={() => <ProtectedRoute component={Invoices} requiredPath="/invoices" />} />
          <Route path="/invoices/:id" component={() => <ProtectedRoute component={InvoiceDetail} requiredPath="/invoices" />} />
        </>
      )}
      
      {/* Add similar checks for all routes */}
    </Switch>
  );
}
```

#### 3. Update Sidebar Navigation

Edit `client/src/components/app-sidebar.tsx`:

```typescript
import { isFeatureEnabled } from '@/../../shared/feature-flags';

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Always show dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Feature-flagged menu items */}
              {isFeatureEnabled('quotes') && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/quotes">
                      <FileText className="h-4 w-4" />
                      <span>Quotes</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {isFeatureEnabled('clients') && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/clients">
                      <Users className="h-4 w-4" />
                      <span>Clients</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {/* Add similar checks for all menu items */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
```

#### 4. Protect API Routes

Edit `server/routes.ts` to add feature flag checks:

```typescript
import { requireFeature } from './feature-flags-middleware';
import { isFeatureEnabled } from '../shared/feature-flags';

export function registerRoutes(app: Express): Server {
  // Add feature flags endpoint
  app.get("/api/feature-flags", (req, res) => {
    res.json(featureFlags);
  });
  
  // Protect quote routes
  app.get("/api/quotes", requireFeature('quotes'), authMiddleware, async (req, res) => {
    // existing code
  });
  
  app.post("/api/quotes", requireFeature('quotes'), authMiddleware, async (req, res) => {
    // existing code
  });
  
  // Protect invoice routes
  app.get("/api/invoices", requireFeature('invoices'), authMiddleware, async (req, res) => {
    // existing code
  });
  
  // Protect vendor routes
  app.get("/api/vendors", requireFeature('vendors'), authMiddleware, async (req, res) => {
    // existing code
  });
  
  // Protect email endpoints
  app.post("/api/quotes/:id/send-email", requireFeature('quoteEmailSending'), authMiddleware, async (req, res) => {
    // existing code
  });
  
  // Add similar protection to all routes
}
```

#### 5. Update Component UI Elements

For each component that has optional features, wrap them in feature flag checks:

**Example: Quote Detail Page** (`client/src/pages/quote-detail.tsx`):

```typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

export default function QuoteDetail() {
  const canSendEmail = useFeatureFlag('quoteEmailSending');
  const canGeneratePdf = useFeatureFlag('quotePdfGeneration');
  const canConvertToInvoice = useFeatureFlag('quoteToInvoiceConversion');
  const showAdvancedSections = useFeatureFlag('quoteAdvancedSections');
  
  return (
    <div>
      <h1>Quote Details</h1>
      
      {/* Action buttons */}
      <div className="actions">
        {canGeneratePdf && (
          <Button onClick={downloadPdf}>Download PDF</Button>
        )}
        
        {canSendEmail && (
          <Button onClick={sendEmail}>Send Email</Button>
        )}
        
        {canConvertToInvoice && quote.status === 'approved' && (
          <Button onClick={createInvoice}>Create Invoice</Button>
        )}
      </div>
      
      {/* Advanced sections */}
      {showAdvancedSections && (
        <>
          <BOMSection />
          <SLASection />
          <TimelineSection />
        </>
      )}
    </div>
  );
}
```

#### 6. Conditional Service Initialization

Edit `api/index.ts` to conditionally initialize services:

```typescript
import { isFeatureEnabled } from '../shared/feature-flags';

async function initializeServices() {
  // Email service
  if (isFeatureEnabled('emailIntegration')) {
    if (process.env.RESEND_API_KEY) {
      EmailService.initializeResend(process.env.RESEND_API_KEY);
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      EmailService.initializeSMTP({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        from: process.env.EMAIL_FROM || "noreply@quoteprogen.com",
      });
    }
  }
  
  // Rate limiting
  if (isFeatureEnabled('apiRateLimiting')) {
    app.use(rateLimiter);
  }
  
  // WebSocket support
  if (isFeatureEnabled('websocketSupport')) {
    // Initialize WebSocket server
  }
}
```

#### 7. Environment Variable Override (Optional)

Create `.env.local` file for development overrides:

```env
# Feature Flags - Override defaults
# Set to false to disable features

# Core modules
VITE_FEATURE_QUOTES=true
VITE_FEATURE_INVOICES=true
VITE_FEATURE_CLIENTS=true
VITE_FEATURE_VENDORS=false
VITE_FEATURE_PRODUCTS=false

# Email
VITE_FEATURE_EMAILINTEGRATION=false

# Analytics
VITE_FEATURE_ANALYTICSDASHBOARD=true
VITE_FEATURE_REVENUEFORECASTING=false

# Add more as needed
```

#### 8. TypeScript Configuration

Ensure TypeScript can resolve the shared module. Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

#### 9. Testing

After implementing feature flags, test:

1. **Enable all features** (default state):
   - All routes accessible
   - All menu items visible
   - All API endpoints functional

2. **Disable quotes module**:
   ```typescript
   quotes: false
   ```
   - `/quotes` returns 404
   - Quotes menu item hidden
   - API returns feature disabled error

3. **Disable email**:
   ```typescript
   emailIntegration: false
   ```
   - Send email buttons hidden
   - Email service not initialized
   - API email endpoints return 404

4. **Disable advanced features**:
   ```typescript
   quoteAdvancedSections: false
   ```
   - BOM/SLA/Timeline sections hidden
   - Database fields not populated but remain

---

## Environment-Based Feature Flags

### Production vs Development

You can set different defaults based on environment:

```typescript
// shared/feature-flags.ts

export function getFeatureFlags(): FeatureFlags {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Start with defaults
  const flags = { ...DEFAULT_FEATURE_FLAGS };
  
  // Override for production
  if (isProduction) {
    // Disable experimental features in production
    flags.twoFactorAuth = false;
    flags.scheduleReports = false;
  }
  
  // Override with environment variables
  // ... rest of implementation
  
  return flags;
}
```

---

## Quick Reference: Disable Common Feature Combinations

### Minimal Quote-Only System

```typescript
// Keep only quote creation and viewing
const MINIMAL_FLAGS = {
  quotes: true,
  clients: true,  // Need clients for quotes
  invoices: false,
  vendors: false,
  products: false,
  quoteAdvancedSections: false,
  quoteTemplates: false,
  quoteEmailSending: false,
  quotePdfGeneration: true,  // Keep PDF for sharing
  analyticsDashboard: false,
  emailIntegration: false,
};
```

### Invoice-Focused System

```typescript
// Focus on invoicing and payments
const INVOICE_FLAGS = {
  quotes: false,
  invoices: true,
  clients: true,
  vendors: false,
  products: false,
  invoicePaymentTracking: true,
  invoicePaymentReminders: true,
  invoicePdfGeneration: true,
  emailIntegration: true,
  analyticsDashboard: true,
};
```

### Full Supply Chain (No Sales)

```typescript
// Vendor and inventory focused
const SUPPLY_CHAIN_FLAGS = {
  quotes: false,
  invoices: false,
  clients: false,
  vendors: true,
  products: true,
  vendorPurchaseOrders: true,
  vendorGoodsReceivedNotes: true,
  serialNumberTracking: true,
  inventoryManagement: true,
};
```

### Read-Only/Demo Mode

```typescript
// Everything visible but limited actions
const READ_ONLY_FLAGS = {
  // Show everything
  ...DEFAULT_FEATURE_FLAGS,
  
  // But disable modifications
  userManagement: false,
  emailIntegration: false,
  paymentTracking: false,
};

// In routes, check user.role === 'viewer' to prevent creates/edits
```

---

## Best Practices

### 1. **Document Your Changes**
When disabling features, document why and when:
```typescript
// Disabled client segmentation - client requested simplified workflow
// Date: 2024-01-15
// Contact: client@example.com
clientSegmentation: false,
```

### 2. **Use Version Control**
Commit feature flag changes separately:
```bash
git commit -m "feat: disable vendor module per client request #123"
```

### 3. **Keep Database Intact**
Never delete database tables or columns. Feature flags only control:
- UI visibility
- API availability
- Service initialization
- Data population

### 4. **Test Both States**
For each feature flag:
- Test with feature enabled (default)
- Test with feature disabled
- Ensure no errors or broken UI

### 5. **Gradual Rollout**
Disable features one at a time to identify issues:
```bash
# First disable
quotes: true → false

# Test thoroughly

# Then disable next
invoices: true → false
```

### 6. **Environment-Specific**
Use different configurations per environment:
- **Development**: All features enabled for testing
- **Staging**: Match production configuration
- **Production**: Only required features enabled

### 7. **Monitor Impact**
After disabling features:
- Check error logs for related errors
- Monitor API 404s (should only be disabled endpoints)
- Verify user workflows still functional

### 8. **Provide Fallbacks**
When disabling features, provide alternatives:
```typescript
{isFeatureEnabled('analyticsDashboard') ? (
  <AnalyticsDashboard />
) : (
  <SimpleRevenueCard />
)}
```

---

## Troubleshooting

### Issue: Route Returns 404 After Disabling Feature

**Cause**: Feature flag properly blocking route.

**Solution**: This is expected. Update navigation to not link to disabled routes.

---

### Issue: UI Shows Feature But API Blocks It

**Cause**: Client-side flag enabled but server-side disabled.

**Solution**: Ensure feature flags are synchronized between client and server.

---

### Issue: Database Errors After Disabling Feature

**Cause**: Code trying to access disabled feature data.

**Solution**: Wrap database queries in feature flag checks:
```typescript
if (isFeatureEnabled('serialNumberTracking')) {
  const serials = await db.query.serialNumbers.findMany();
}
```

---

### Issue: Missing Menu Items

**Cause**: Feature disabled, menu items correctly hidden.

**Solution**: Verify this is intentional. If not, re-enable feature flag.

---

### Issue: Email Not Sending Even When Enabled

**Cause**: Email service not initialized or credentials missing.

**Solution**: Check:
1. `emailIntegration: true` in feature flags
2. Environment variables set (RESEND_API_KEY or SMTP_*)
3. Email service initialization in `api/index.ts`

---

## Reverting Changes

To re-enable any feature:

1. Set flag back to `true` in `shared/feature-flags.ts`
2. Restart development server or redeploy
3. No code changes needed - everything is still there!

Example:
```typescript
// Before (disabled)
quotes: false,

// After (enabled)
quotes: true,
```

---

## Complete Implementation Examples

### Example 1: Disable Quote-Only Setup (Sales Module Only)

**Goal**: Keep only sales quotes, disable everything else.

```typescript
// In shared/feature-flags.ts - Override DEFAULT_FEATURE_FLAGS

export const MINIMAL_SALES_CONFIG: Partial<FeatureFlags> = {
  // Enable only what's needed
  pages_dashboard: true,
  pages_clients: true,
  pages_clientDetail: true,
  pages_quotes: true,
  pages_quoteCreate: true,
  pages_quoteDetail: true,
  
  quotes_module: true,
  quotes_create: true,
  quotes_edit: true,
  quotes_pdfGeneration: true,
  
  clients_module: true,
  clients_create: true,
  clients_edit: true,
  
  // Disable everything else
  invoices_module: false,
  pages_invoices: false,
  pages_invoiceDetail: false,
  
  vendors_module: false,
  vendorPO_module: false,
  grn_module: false,
  products_module: false,
  
  pages_vendors: false,
  pages_vendorPOs: false,
  pages_grn: false,
  pages_products: false,
  pages_serialSearch: false,
  
  nav_purchaseDropdown: false,
  nav_serialSearchLink: false,
  
  analytics_module: false,
  pages_dashboardsOverview: false,
  
  email_integration: false,
};

// Apply this configuration
export function getFeatureFlags(): FeatureFlags {
  return { ...DEFAULT_FEATURE_FLAGS, ...MINIMAL_SALES_CONFIG };
}
```

**Result**: Clean sales-only interface with quotes and clients.

---

### Example 2: Disable Invoice-Focused Setup (Finance Module)

**Goal**: Focus on invoice management and payments.

```typescript
export const FINANCE_FOCUSED_CONFIG: Partial<FeatureFlags> = {
  // Core finance features
  pages_dashboard: true,
  pages_clients: true,  // Need to see who owes money
  pages_invoices: true,
  pages_invoiceDetail: true,
  
  invoices_module: true,
  invoices_create: true,
  invoices_edit: true,
  invoices_paymentTracking: true,
  invoices_paymentReminders: true,
  
  payments_module: true,
  payments_create: true,
  payments_history: true,
  
  analytics_module: true,
  pages_invoiceCollectionsDashboard: true,
  
  // Disable sales features
  quotes_module: false,
  pages_quotes: false,
  quotes_create: false,
  
  // Disable supply chain
  vendors_module: false,
  vendorPO_module: false,
  grn_module: false,
  products_module: false,
  
  nav_salesDropdown: false,
  nav_purchaseDropdown: false,
};
```

---

### Example 3: Read-Only Demo Mode

**Goal**: Everything visible but no edits/creates allowed.

```typescript
export const DEMO_MODE_CONFIG: Partial<FeatureFlags> = {
  // All pages visible
  pages_dashboard: true,
  pages_clients: true,
  pages_quotes: true,
  pages_invoices: true,
  pages_vendors: true,
  
  // Modules enabled for viewing
  quotes_module: true,
  invoices_module: true,
  clients_module: true,
  vendors_module: true,
  
  // Disable all create/edit/delete actions
  quotes_create: false,
  quotes_edit: false,
  quotes_delete: false,
  
  invoices_create: false,
  invoices_edit: false,
  invoices_delete: false,
  
  clients_create: false,
  clients_edit: false,
  clients_delete: false,
  
  vendors_create: false,
  vendors_edit: false,
  vendors_delete: false,
  
  // Disable email/PDF to prevent spam
  email_integration: false,
  pdf_generation: false,
  
  // Disable payments
  payments_create: false,
  
  // Keep analytics visible
  analytics_module: true,
};
```

---

### Example 4: Minimal Configuration (Absolute Basics)

**Goal**: Bare minimum - just quotes and PDFs.

```typescript
export const ULTRA_MINIMAL_CONFIG: Partial<FeatureFlags> = {
  // Only dashboard and quotes
  pages_dashboard: true,
  pages_quotes: true,
  pages_quoteCreate: true,
  pages_quoteDetail: true,
  
  quotes_module: true,
  quotes_create: true,
  quotes_edit: true,
  quotes_pdfGeneration: true,
  
  // Basic client support (required for quotes)
  clients_module: true,
  pages_clients: true,
  clients_create: true,
  
  // Everything else OFF
  invoices_module: false,
  vendors_module: false,
  vendorPO_module: false,
  grn_module: false,
  products_module: false,
  analytics_module: false,
  email_integration: false,
  payments_module: false,
  
  // Disable advanced features
  quotes_bomSection: false,
  quotes_slaSection: false,
  quotes_timelineSection: false,
  quotes_templates: false,
  
  // Disable all admin features
  pages_adminUsers: false,
  pages_adminSettings: false,
  pages_adminConfiguration: false,
  
  // Simplify UI
  ui_darkMode: false,
  ui_animations: false,
};
```

---

## Step-by-Step Implementation Guide

### Phase 1: Setup (15 minutes)

1. **Create feature flags file**:
   ```bash
   # Create the file
   touch shared/feature-flags.ts
   ```
   
   Copy the complete `FeatureFlags` interface and `DEFAULT_FEATURE_FLAGS` from above.

2. **Create React hook**:
   ```bash
   touch client/src/hooks/useFeatureFlag.ts
   ```
   
   Copy the hook code from above.

3. **Create server middleware**:
   ```bash
   touch server/feature-flags-middleware.ts
   ```
   
   Copy the middleware code from above.

---

### Phase 2: Update Core Files (30 minutes)

#### Update App.tsx

```typescript
import { isFeatureEnabled } from '@/../../shared/feature-flags';

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="w-full pt-14 sm:pt-16">
        <Switch>
          {/* Always available */}
          <Route path="/" component={() => <ProtectedRoute component={Dashboard} requiredPath="/" />} />
          
          {/* Clients - conditional */}
          {isFeatureEnabled('pages_clients') && (
            <>
              <Route path="/clients" component={() => <ProtectedRoute component={Clients} requiredPath="/clients" />} />
              <Route path="/clients/:id" component={() => <ProtectedRoute component={ClientDetail} requiredPath="/clients" />} />
            </>
          )}
          
          {/* Quotes - conditional */}
          {isFeatureEnabled('pages_quotes') && (
            <>
              <Route path="/quotes" component={() => <ProtectedRoute component={Quotes} requiredPath="/quotes" />} />
              <Route path="/quotes/create" component={() => <ProtectedRoute component={QuoteCreate} requiredPath="/quotes" />} />
              <Route path="/quotes/:id/edit" component={() => <ProtectedRoute component={QuoteCreate} requiredPath="/quotes" />} />
              <Route path="/quotes/:id" component={() => <ProtectedRoute component={QuoteDetail} requiredPath="/quotes" />} />
            </>
          )}
          
          {/* Invoices - conditional */}
          {isFeatureEnabled('pages_invoices') && (
            <>
              <Route path="/invoices" component={() => <ProtectedRoute component={Invoices} requiredPath="/invoices" />} />
              <Route path="/invoices/:id" component={() => <ProtectedRoute component={InvoiceDetail} requiredPath="/invoices" />} />
            </>
          )}
          
          {/* Vendors - conditional */}
          {isFeatureEnabled('pages_vendors') && (
            <Route path="/vendors" component={() => <ProtectedRoute component={Vendors} requiredPath="/vendors" />} />
          )}
          
          {/* Vendor POs - conditional */}
          {isFeatureEnabled('pages_vendorPOs') && (
            <>
              <Route path="/vendor-pos" component={() => <ProtectedRoute component={VendorPOs} requiredPath="/vendor-pos" />} />
              <Route path="/vendor-pos/:id" component={() => <ProtectedRoute component={VendorPoDetail} requiredPath="/vendor-pos" />} />
            </>
          )}
          
          {/* Products - conditional */}
          {isFeatureEnabled('pages_products') && (
            <Route path="/products" component={() => <ProtectedRoute component={Products} requiredPath="/products" />} />
          )}
          
          {/* GRN - conditional */}
          {isFeatureEnabled('pages_grn') && (
            <>
              <Route path="/grn" component={() => <ProtectedRoute component={GRNList} requiredPath="/grn" />} />
              <Route path="/grn/:id" component={() => <ProtectedRoute component={GRNDetail} requiredPath="/grn" />} />
            </>
          )}
          
          {/* Serial Search - conditional */}
          {isFeatureEnabled('pages_serialSearch') && (
            <Route path="/serial-search" component={() => <ProtectedRoute component={SerialSearch} requiredPath="/serial-search" />} />
          )}
          
          {/* Dashboards - conditional */}
          {isFeatureEnabled('pages_dashboardsOverview') && (
            <Route path="/dashboards" component={() => <ProtectedRoute component={DashboardsOverview} requiredPath="/dashboards" />} />
          )}
          
          {isFeatureEnabled('pages_salesQuoteDashboard') && (
            <Route path="/dashboards/sales-quotes" component={() => <ProtectedRoute component={SalesQuoteDashboard} requiredPath="/dashboards/sales-quotes" />} />
          )}
          
          {isFeatureEnabled('pages_vendorPODashboard') && (
            <Route path="/dashboards/vendor-po" component={() => <ProtectedRoute component={VendorPODashboard} requiredPath="/dashboards/vendor-po" />} />
          )}
          
          {isFeatureEnabled('pages_invoiceCollectionsDashboard') && (
            <Route path="/dashboards/invoice-collections" component={() => <ProtectedRoute component={InvoiceCollectionsDashboard} requiredPath="/dashboards/invoice-collections" />} />
          )}
          
          {isFeatureEnabled('pages_serialTrackingDashboard') && (
            <Route path="/dashboards/serial-tracking" component={() => <ProtectedRoute component={SerialTrackingDashboard} requiredPath="/dashboards/serial-tracking" />} />
          )}
          
          {/* Admin - conditional */}
          {isFeatureEnabled('pages_adminUsers') && (
            <Route path="/admin/users" component={() => <ProtectedRoute component={AdminUsers} requiredPath="/admin/users" />} />
          )}
          
          {isFeatureEnabled('pages_adminSettings') && (
            <Route path="/admin/settings" component={() => <ProtectedRoute component={AdminSettings} requiredPath="/admin/settings" />} />
          )}
          
          {isFeatureEnabled('pages_adminConfiguration') && (
            <Route path="/admin/configuration" component={() => <ProtectedRoute component={AdminConfiguration} requiredPath="/admin/configuration" />} />
          )}
          
          {isFeatureEnabled('pages_governanceDashboard') && (
            <Route path="/admin/governance" component={() => <ProtectedRoute component={GovernanceDashboard} requiredPath="/admin/governance" />} />
          )}
          
          {/* 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}
```

#### Update app-sidebar.tsx

```typescript
import { isFeatureEnabled } from '@/../../shared/feature-flags';

// Filter menu items based on feature flags
const menuItems = [
  {
    title: "Home",
    url: "/",
    icon: LayoutDashboard,
    roles: ["admin", "sales_executive", "sales_manager", "purchase_operations", "finance_accounts", "viewer"],
    description: "Dashboard overview",
  },
  // Quotes - conditional
  ...(isFeatureEnabled('pages_quotes') ? [{
    title: "Quotes",
    url: "/quotes",
    icon: FileText,
    roles: ["admin", "sales_executive", "sales_manager", "finance_accounts", "viewer"],
    description: "Manage sales quotes",
  }] : []),
  // Clients - conditional
  ...(isFeatureEnabled('pages_clients') ? [{
    title: "Clients",
    url: "/clients",
    icon: Users,
    roles: ["admin", "sales_executive", "sales_manager", "finance_accounts", "viewer"],
    description: "Client management",
  }] : []),
  // Invoices - conditional
  ...(isFeatureEnabled('pages_invoices') ? [{
    title: "Invoices",
    url: "/invoices",
    icon: Receipt,
    roles: ["admin", "sales_executive", "sales_manager", "finance_accounts", "viewer"],
    description: "Invoice tracking",
  }] : []),
  // Vendors - conditional
  ...(isFeatureEnabled('pages_vendors') ? [{
    title: "Vendors",
    url: "/vendors",
    icon: Building2,
    roles: ["admin", "purchase_operations", "viewer"],
    description: "Vendor management",
  }] : []),
  // Vendor POs - conditional
  ...(isFeatureEnabled('pages_vendorPOs') ? [{
    title: "Vendor POs",
    url: "/vendor-pos",
    icon: PackageCheck,
    roles: ["admin", "purchase_operations", "viewer"],
    description: "Purchase orders",
  }] : []),
  // Products - conditional
  ...(isFeatureEnabled('pages_products') ? [{
    title: "Products",
    url: "/products",
    icon: Package,
    roles: ["admin", "purchase_operations", "sales_executive", "sales_manager", "viewer"],
    description: "Product catalog",
  }] : []),
  // GRN - conditional
  ...(isFeatureEnabled('pages_grn') ? [{
    title: "GRN",
    url: "/grn",
    icon: PackageCheck,
    roles: ["admin", "purchase_operations", "viewer"],
    description: "Goods receipt notes",
  }] : []),
  // Serial Search - conditional
  ...(isFeatureEnabled('pages_serialSearch') ? [{
    title: "Serial Search",
    url: "/serial-search",
    icon: Search,
    roles: ["admin", "sales_executive", "sales_manager", "purchase_operations", "viewer"],
    description: "Track serial numbers",
  }] : []),
];

const adminItems = [
  // User Management - conditional
  ...(isFeatureEnabled('pages_adminUsers') ? [{
    title: "User Management",
    url: "/admin/users",
    icon: Users,
    roles: ["admin"],
    description: "Manage users",
  }] : []),
  // Governance - conditional
  ...(isFeatureEnabled('pages_governanceDashboard') ? [{
    title: "Governance",
    url: "/admin/governance",
    icon: Shield,
    roles: ["admin"],
    description: "System governance",
  }] : []),
  // Configuration - conditional
  ...(isFeatureEnabled('pages_adminConfiguration') ? [{
    title: "Configuration",
    url: "/admin/configuration",
    icon: Settings,
    roles: ["admin"],
    description: "System config",
  }] : []),
  // Settings - conditional
  ...(isFeatureEnabled('pages_adminSettings') ? [{
    title: "Advanced Settings",
    url: "/admin/settings",
    icon: Settings,
    roles: ["admin"],
    description: "Advanced options",
  }] : []),
];

// In render section - hide theme toggle if needed
{isFeatureEnabled('ui_themeToggle') && <ThemeToggle />}
```

---

### Phase 3: Update Server Routes (20 minutes)

#### Update server/routes.ts

```typescript
import { requireFeature } from './feature-flags-middleware';

export function registerRoutes(app: Express): Server {
  // Add feature flags API endpoint
  app.get("/api/feature-flags", (req, res) => {
    res.json(featureFlags);
  });
  
  // Auth routes (always available)
  app.post("/api/auth/signup", 
    requireFeature('pages_signup'),  // Can disable signup
    async (req, res) => {
      // Signup logic
    }
  );
  
  app.post("/api/auth/reset-password",
    requireFeature('pages_resetPassword'),
    async (req, res) => {
      // Reset password logic
    }
  );
  
  // Quote routes - protected
  app.get("/api/quotes", 
    requireFeature('quotes_module'),
    authMiddleware, 
    async (req, res) => {
      // Get quotes
    }
  );
  
  app.post("/api/quotes", 
    requireFeature('quotes_create'),
    authMiddleware, 
    requirePermission("quotes", "create"),
    async (req, res) => {
      // Create quote
    }
  );
  
  app.put("/api/quotes/:id", 
    requireFeature('quotes_edit'),
    authMiddleware,
    requirePermission("quotes", "edit"),
    async (req, res) => {
      // Update quote
    }
  );
  
  app.post("/api/quotes/:id/email", 
    requireFeature('email_quoteSending'),
    authMiddleware,
    async (req, res) => {
      // Send quote email
    }
  );
  
  app.get("/api/quotes/:id/pdf", 
    requireFeature('quotes_pdfGeneration'),
    authMiddleware,
    async (req, res) => {
      // Generate PDF
    }
  );
  
  // Invoice routes - protected
  app.get("/api/invoices", 
    requireFeature('invoices_module'),
    authMiddleware,
    async (req, res) => {
      // Get invoices
    }
  );
  
  app.post("/api/invoices", 
    requireFeature('invoices_create'),
    authMiddleware,
    requirePermission("invoices", "create"),
    async (req, res) => {
      // Create invoice
    }
  );
  
  // Payment routes - protected
  app.post("/api/invoices/:id/payments", 
    requireFeature('payments_create'),
    authMiddleware,
    requirePermission("payments", "create"),
    async (req, res) => {
      // Record payment
    }
  );
  
  // Vendor routes - protected
  app.get("/api/vendors", 
    requireFeature('vendors_module'),
    authMiddleware,
    async (req, res) => {
      // Get vendors
    }
  );
  
  // Analytics routes - protected
  app.get("/api/analytics/revenue", 
    requireFeature('analytics_module'),
    authMiddleware,
    async (req, res) => {
      // Get analytics
    }
  );
  
  // User management - protected
  app.post("/api/users", 
    requireFeature('users_create'),
    authMiddleware,
    async (req, res) => {
      // Create user
    }
  );
  
  return server;
}
```

---

### Phase 4: Update Page Components (Variable time)

For each page that has optional features, add feature flag checks:

#### Example: quote-detail.tsx

```typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

export default function QuoteDetail() {
  const { id } = useParams();
  const canEdit = useFeatureFlag('quotes_edit');
  const canDelete = useFeatureFlag('quotes_delete');
  const canApprove = useFeatureFlag('quotes_approve');
  const canSendEmail = useFeatureFlag('email_quoteSending');
  const canGeneratePDF = useFeatureFlag('quotes_pdfGeneration');
  const canCreateInvoice = useFeatureFlag('invoices_create');
  const canCreatePO = useFeatureFlag('vendorPO_create');
  
  const showBOM = useFeatureFlag('quotes_bomSection');
  const showSLA = useFeatureFlag('quotes_slaSection');
  const showTimeline = useFeatureFlag('quotes_timelineSection');
  
  return (
    <div>
      <h1>Quote {quote.quoteNumber}</h1>
      
      {/* Action buttons */}
      <div className="flex gap-2">
        {canEdit && <Button onClick={handleEdit}>Edit</Button>}
        {canDelete && <Button variant="destructive" onClick={handleDelete}>Delete</Button>}
        {canApprove && quote.status === 'sent' && <Button onClick={handleApprove}>Approve</Button>}
        {canSendEmail && <Button onClick={sendEmail}><Mail /> Send Email</Button>}
        {canGeneratePDF && <Button onClick={downloadPDF}><Download /> Download PDF</Button>}
        {canCreateInvoice && quote.status === 'approved' && (
          <Button onClick={createInvoice}>Create Invoice</Button>
        )}
        {canCreatePO && <Button onClick={createPO}>Create Vendor PO</Button>}
      </div>
      
      {/* Quote details */}
      <QuoteDetails quote={quote} />
      
      {/* Advanced sections */}
      {showBOM && quote.bomSection && <BOMSection data={quote.bomSection} />}
      {showSLA && quote.slaSection && <SLASection data={quote.slaSection} />}
      {showTimeline && quote.timelineSection && <TimelineSection data={quote.timelineSection} />}
    </div>
  );
}
```

#### Example: invoice-detail.tsx

```typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

export default function InvoiceDetail() {
  const canEdit = useFeatureFlag('invoices_edit');
  const canAddPayment = useFeatureFlag('payments_create');
  const canSendEmail = useFeatureFlag('email_invoiceSending');
  const canSendReminder = useFeatureFlag('invoices_paymentReminders');
  const canGeneratePDF = useFeatureFlag('invoices_pdfGeneration');
  const showPaymentHistory = useFeatureFlag('payments_history');
  const showChildInvoices = useFeatureFlag('invoices_childInvoices');
  const canCreateChild = useFeatureFlag('invoices_childInvoices');
  
  return (
    <div>
      <h1>Invoice {invoice.invoiceNumber}</h1>
      
      <div className="flex gap-2">
        {canEdit && <Button onClick={handleEdit}>Edit</Button>}
        {canAddPayment && <Button onClick={openPaymentDialog}>Record Payment</Button>}
        {canSendEmail && <Button onClick={sendEmail}><Mail /> Send Email</Button>}
        {canSendReminder && <Button onClick={sendReminder}>Send Reminder</Button>}
        {canGeneratePDF && <Button onClick={downloadPDF}><Download /> PDF</Button>}
        {canCreateChild && !invoice.isMaster && (
          <Button onClick={createChildInvoice}>Create Child Invoice</Button>
        )}
      </div>
      
      <InvoiceDetails invoice={invoice} />
      
      {showPaymentHistory && (
        <PaymentHistory payments={invoice.payments} />
      )}
      
      {showChildInvoices && invoice.childInvoices?.length > 0 && (
        <ChildInvoicesList invoices={invoice.childInvoices} />
      )}
    </div>
  );
}
```

---

## Testing & Validation

### Test Plan

#### 1. Test Feature Disabled

```bash
# Set flag to false
pages_quotes: false

# Expected results:
✅ /quotes returns 404
✅ Quotes menu item hidden in sidebar
✅ API GET /api/quotes returns 404
✅ No console errors
✅ Other features still work
```

#### 2. Test Feature Re-enabled

```bash
# Set flag back to true
pages_quotes: true

# Expected results:
✅ /quotes loads correctly
✅ Quotes menu item visible
✅ API GET /api/quotes works
✅ All quote features functional
```

#### 3. Test Dependent Features

```bash
# Disable quotes but keep invoices
quotes_module: false
invoices_module: true

# Expected results:
✅ Invoices still work
✅ Can't create invoice from quote (button hidden)
✅ Existing invoices still link to quotes (but link disabled)
```

### Validation Checklist

After disabling any feature:

- [ ] Routes return 404 for disabled pages
- [ ] Navigation items hidden appropriately
- [ ] API endpoints protected
- [ ] No console errors in browser
- [ ] No 500 errors on server
- [ ] Related features still work
- [ ] Database remains intact
- [ ] Can re-enable by setting flag to true

---

## Quick Disable Recipes

### Recipe 1: Simple Quote System

**Use Case**: Client only needs basic quotes and clients.

```typescript
// Copy this into your feature flags
const config = {
  // Keep these
  pages_dashboard: true,
  pages_clients: true,
  pages_quotes: true,
  quotes_module: true,
  clients_module: true,
  quotes_pdfGeneration: true,
  
  // Disable these
  invoices_module: false,
  vendors_module: false,
  vendorPO_module: false,
  grn_module: false,
  products_module: false,
  analytics_module: false,
  email_integration: false,
  quotes_bomSection: false,
  quotes_slaSection: false,
  quotes_timelineSection: false,
};
```

### Recipe 2: Invoice-Only System

**Use Case**: Client needs billing and payment tracking only.

```typescript
const config = {
  // Keep these
  pages_dashboard: true,
  pages_clients: true,
  pages_invoices: true,
  invoices_module: true,
  payments_module: true,
  email_integration: true,
  invoices_paymentReminders: true,
  analytics_module: true,
  
  // Disable these
  quotes_module: false,
  vendors_module: false,
  vendorPO_module: false,
  grn_module: false,
  products_module: false,
};
```

### Recipe 3: Full Supply Chain (No Sales)

**Use Case**: Client needs procurement and inventory only.

```typescript
const config = {
  // Keep these
  pages_dashboard: true,
  pages_vendors: true,
  pages_vendorPOs: true,
  pages_grn: true,
  pages_products: true,
  pages_serialSearch: true,
  vendors_module: true,
  vendorPO_module: true,
  grn_module: true,
  products_module: true,
  serialNumber_tracking: true,
  
  // Disable these
  quotes_module: false,
  invoices_module: false,
  clients_module: false,
  pages_clients: false,
};
```

### Recipe 4: Demo/Read-Only Mode

**Use Case**: Show everything but prevent modifications.

```typescript
const config = {
  // All pages visible
  pages_dashboard: true,
  pages_clients: true,
  pages_quotes: true,
  pages_invoices: true,
  
  // All modules visible
  quotes_module: true,
  invoices_module: true,
  clients_module: true,
  
  // Disable all actions
  quotes_create: false,
  quotes_edit: false,
  quotes_delete: false,
  invoices_create: false,
  invoices_edit: false,
  clients_create: false,
  clients_edit: false,
  payments_create: false,
  email_integration: false,
  pdf_generation: false,
};
```

---

## Environment Variables Override

You can override feature flags via environment variables:

### .env.local (Development)

```env
# Disable features for local development
VITE_FEATURE_PAGES_VENDORS=false
VITE_FEATURE_PAGES_VENDORPOS=false
VITE_FEATURE_PAGES_GRN=false
VITE_FEATURE_EMAIL_INTEGRATION=false
```

### .env.production (Production)

```env
# Production configuration
VITE_FEATURE_PAGES_SIGNUP=false  # Admin creates users only
VITE_FEATURE_EMAIL_INTEGRATION=true
VITE_FEATURE_ANALYTICS_MODULE=true
```

### .env.demo (Demo Environment)

```env
# Demo mode - read only
VITE_FEATURE_QUOTES_CREATE=false
VITE_FEATURE_QUOTES_EDIT=false
VITE_FEATURE_INVOICES_CREATE=false
VITE_FEATURE_PAYMENTS_CREATE=false
VITE_FEATURE_EMAIL_INTEGRATION=false
```

---

## Summary

This guide provides a **non-destructive** way to disable any feature in QuoteProGen:

✅ **No code deletion** - Everything remains in codebase  
✅ **Easy to reverse** - Change flag from false → true  
✅ **Granular control** - 150+ individual feature flags  
✅ **Environment-specific** - Different settings per environment  
✅ **Database intact** - All data structures remain  
✅ **Type-safe** - TypeScript ensures correct feature names  
✅ **32 pages controllable** - Every page can be disabled
✅ **Client-side & server-side** - Complete protection  

**Total Features Controllable**: 150+ individual feature flags

---

## Additional Resources

- [QuoteProGen README](../README.md) - Full system documentation
- [User Roles & Permissions](./USER_ROLES_VISUAL_DIAGRAMS.md) - Role-based access control
- [API Documentation](../README.md#-api-documentation) - Complete API reference
- [Database Schema](../README.md#-database-schema) - Data model overview

---

**Last Updated**: December 31, 2024  
**Version**: 2.0  
**Based on**: Complete codebase analysis (32 pages, 150+ flags, 126+ API endpoints)  
**Maintainer**: QuoteProGen Development Team

---

## Support

For questions or issues:
1. Check this guide for the feature you want to disable
2. Review the implementation examples
3. Test in development before deploying
4. Document all disabled features for client reference

**Remember**: You can always re-enable features by setting flags back to `true`!

