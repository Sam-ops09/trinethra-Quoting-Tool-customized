# 📘 QuoteProGen - Developer Documentation

> **Complete technical guide for developers**  
> Version 2.0 | Updated: January 1, 2026

---

## 📖 Quick Navigation

| Section | Description |
|---------|-------------|
| [🚀 Getting Started](#-getting-started) | Installation & first steps |
| [🏗️ Architecture](#️-architecture) | System design & flow |
| [🛠️ Tech Stack](#️-tech-stack) | Technologies used |
| [📁 Project Files](#-project-structure) | Codebase organization |
| [🎯 Core Features](#-core-systems) | Main functionality |
| [🚩 Feature Flags](#-feature-flags-system) | Feature control system |
| [🔒 Security](#-security--rbac) | Auth & permissions |
| [💾 Database](#-database-schema) | Data model |
| [🔌 API Reference](#-api-documentation) | Endpoints guide |
| [⚙️ Configuration](#️-configuration) | Setup & config |
| [🧪 Testing](#-testing) | Test strategy |
| [🚀 Deployment](#-deployment) | Going live |

---

## 📊 Project at a Glance

<table>
<tr>
<td>

**📈 Scale**
- 50,000+ lines of code
- 126+ API endpoints
- 25+ database tables
- 150+ feature flags

</td>
<td>

**🎨 Frontend**
- 32 pages
- 47 UI components
- React + TypeScript
- TailwindCSS + Shadcn/UI

</td>
<td>

**⚡ Backend**
- Express.js + Node.js
- PostgreSQL + Drizzle ORM
- 6 user roles
- JWT authentication

</td>
</tr>
</table>

### ✨ What This System Does

| Module | Capability |
|--------|-----------|
| 💰 **Quotes** | Create, manage, approve quotes → Convert to invoices |
| 📄 **Invoices** | Generate invoices → Track payments → Send reminders |
| 👥 **CRM** | Manage clients → Track communications → Segmentation |
| 🏭 **Vendors** | Vendor POs → Goods receipt → Serial tracking |
| 📊 **Analytics** | Sales forecasting → Revenue trends → Performance metrics |
| 🔐 **Security** | Role-based access → Feature flags → Audit logs |
| 📧 **Communication** | PDF generation → Email delivery → Automated reminders |  

---

## 🚀 Getting Started

### ⚡ Quick Setup (5 minutes)

#### Step 1: Prerequisites
```bash
# Check you have these installed
node --version  # Need 18+
pnpm --version  # Install with: npm install -g pnpm
psql --version  # PostgreSQL 14+
```

#### Step 2: Clone & Install
```bash
git clone <repository-url>
cd Quoting-Tool
pnpm install  # Installs all dependencies
```

#### Step 3: Environment Setup
```bash
# Copy template
cp .env.example .env

# Edit .env with your values
DATABASE_URL="postgresql://user:pass@localhost:5432/quoting"
SESSION_SECRET="generate-a-long-random-string-here"
RESEND_API_KEY="re_your_api_key"  # Optional: for emails
```

> 💡 **Generate secure secret:** `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

#### Step 4: Database Setup
```bash
# Create database (if using local PostgreSQL)
createdb quoting

# Run migrations
pnpm db:push
```

#### Step 5: Start Development Server
```bash
pnpm dev
# ✅ App running at http://localhost:5000
```

#### Step 6: First Login
1. Open http://localhost:5000
2. Click "Sign Up" → Create account
3. Promote to admin:
   ```sql
   UPDATE users SET role = 'Super Admin' WHERE email = 'your@email.com';
   ```
4. Refresh page → You're admin! 🎉

### 📝 Common Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm check        # Type checking
pnpm db:push      # Sync database schema
pnpm test         # Run E2E tests
pnpm test:ui      # Interactive test UI
```

---

## 🏗️ Architecture

### 🎯 Simple Overview

```
┌─────────────┐
│   Browser   │  ← User interacts here
└──────┬──────┘
       │ HTTP
┌──────▼──────┐
│   React     │  ← Frontend (UI)
│  TypeScript │
└──────┬──────┘
       │ REST API
┌──────▼──────┐
│   Express   │  ← Backend (Logic)
│   Node.js   │
└──────┬──────┘
       │ SQL
┌──────▼──────┐
│ PostgreSQL  │  ← Database (Storage)
└─────────────┘
```

### 🔄 Request Flow (What Happens When You Click)

```
1. 🖱️  User clicks "Create Quote"
         ↓
2. 🚩  Feature Flag Check → Is quotes_create enabled?
         ↓
3. ⚛️  React Component → Renders form
         ↓
4. 📡  API Call → POST /api/quotes
         ↓
5. 🚪  Express Route → Receives request
         ↓
6. 🚩  Feature Flag Middleware → Check again
         ↓
7. 🔐  Auth Middleware → Is user logged in?
         ↓
8. 🛡️  Permission Middleware → Does user have permission?
         ↓
9. 💼  Business Logic → Validate data, generate quote number
         ↓
10. 💾  Database Query → INSERT INTO quotes...
         ↓
11. ✅  Response → Return new quote data
         ↓
12. 🎉  UI Updates → Show success message
```

### 📂 Code Organization

```
Frontend (client/)
  ├── pages/         → Full page views
  ├── components/    → Reusable UI pieces
  ├── hooks/         → Custom React logic
  └── lib/           → Utilities

Backend (server/)
  ├── routes.ts      → API endpoints (THE BIG FILE)
  ├── storage.ts     → Database queries
  ├── *-middleware.ts → Security & checks
  └── services/      → Business logic

Shared (shared/)
  ├── schema.ts      → Database structure
  ├── feature-flags.ts → Feature toggles
  └── types.ts       → TypeScript types
```

---

## 🛠️ Tech Stack

### 🎨 Frontend Stack

| What | Why | Version |
|------|-----|---------|
| **React** | Build interactive UIs | 18.3.1 |
| **TypeScript** | Catch errors before runtime | 5.6.3 |
| **Vite** | Lightning-fast dev server | 5.4.11 |
| **TailwindCSS** | Style with utility classes | 3.4.15 |
| **Shadcn/UI** | Beautiful pre-built components | Latest |
| **React Query** | Smart data fetching & caching | 5.62.3 |
| **Recharts** | Charts for analytics | 2.15.0 |

**Why these choices?**
- 🚀 **Fast**: Vite + React = instant hot reload
- 🎯 **Type-safe**: TypeScript catches bugs early
- 🎨 **Beautiful**: TailwindCSS + Shadcn/UI = professional design
- 📊 **Smart**: React Query handles caching automatically

### ⚡ Backend Stack

| What | Why | Version |
|------|-----|---------|
| **Node.js** | JavaScript on server | 18+ |
| **Express** | Simple API framework | 4.21.2 |
| **TypeScript** | Type safety everywhere | 5.6.3 |
| **Drizzle ORM** | Type-safe database queries | 0.38.3 |
| **PostgreSQL** | Reliable SQL database | 14+ |
| **bcrypt** | Secure password hashing | 5.1.1 |
| **PDFKit** | Generate PDF documents | 0.15.1 |
| **Resend** | Modern email API | 4.0.1 |

**Why these choices?**
- 🔒 **Secure**: bcrypt for passwords, JWT for auth
- 💪 **Reliable**: PostgreSQL never loses data
- 📝 **Type-safe**: Drizzle ORM = no SQL typos
- 📧 **Modern**: Resend = easy email delivery

### 🚀 DevOps & Tools

| Tool | Purpose |
|------|---------|
| **pnpm** | Fast package manager |
| **Playwright** | Test user workflows |
| **Vercel** | Deploy with one command |
| **Neon** | Cloud PostgreSQL (free tier) |

### 📦 Full Dependency List

<details>
<summary><b>Click to expand all 145 packages</b></summary>

**Production (109 packages)**
- React ecosystem: react, react-dom, react-router
- UI: @radix-ui/*, lucide-react, recharts
- Forms: react-hook-form, zod
- Backend: express, drizzle-orm, bcrypt
- PDF: pdfkit, pdfkit-table
- Email: resend, nodemailer
- Utils: date-fns, decimal.js, nanoid

**Development (36 packages)**
- Build: vite, typescript, esbuild
- Testing: playwright, @playwright/test
- Types: @types/* packages

</details>

---

## 📁 Project Structure

### 🗂️ Overview (What Goes Where)

```
Quoting-Tool/
│
├── 🎨 client/           → Everything users see (React app)
├── ⚡ server/           → Business logic & APIs (Express)
├── 🔄 shared/           → Code used by both client & server
├── 🗄️ migrations/       → Database version history
├── 🧪 tests/            → Automated tests
└── 📝 MD files/         → Documentation
```

### 🎨 Frontend Files (client/)

<details>
<summary><b>Click to see frontend structure</b></summary>

```
client/
├── public/              Static files (logos, images)
│   └── logo.svg
│
└── src/
    ├── pages/           32 full pages
    │   ├── dashboard.tsx
    │   ├── quotes.tsx
    │   ├── invoices.tsx
    │   ├── clients.tsx
    │   └── ... 28 more
    │
    ├── components/      Reusable UI pieces
    │   ├── ui/          47 Shadcn components
    │   ├── quote/       Quote-specific
    │   ├── invoice/     Invoice-specific
    │   └── ...
    │
    ├── hooks/           Custom React hooks
    │   ├── use-toast.ts
    │   ├── useFeatureFlag.ts
    │   └── use-permissions.ts
    │
    ├── lib/             Utilities
    │   ├── auth-context.tsx
    │   ├── queryClient.ts
    │   └── utils.ts
    │
    ├── App.tsx          Main app + routing
    └── main.tsx         Entry point
```

</details>

### ⚡ Backend Files (server/)

<details>
<summary><b>Click to see backend structure</b></summary>

```
server/
├── index.ts                    Server entry point
├── routes.ts                   ALL API endpoints (5500 lines!)
├── storage.ts                  Database queries
├── permissions-middleware.ts   Who can do what
├── feature-flags-middleware.ts What's enabled
│
└── services/                   Business logic
    ├── pdf-service.ts          Generate PDFs
    ├── email-service.ts        Send emails
    ├── analytics-routes.ts     Dashboards
    └── ...
```

**The Big File:** `routes.ts` contains ALL 126+ API endpoints. It's organized by module:
- Lines 1-500: Authentication & Users
- Lines 500-1500: Quotes & Quote Items
- Lines 1500-2500: Invoices & Payments
- Lines 2500-3500: Clients & CRM
- Lines 3500-4500: Vendors & POs
- Lines 4500-5500: Products, GRN, Settings

</details>

### 🔄 Shared Files (shared/)

```
shared/
├── schema.ts         Database tables (25+ tables)
├── feature-flags.ts  Feature toggles (150+ flags)
└── types.ts          TypeScript definitions
```

**Why shared?**  
Client and server both need to know the database structure and types!

### 💡 Key Files to Know

| File | What It Does | Lines |
|------|--------------|-------|
| `server/routes.ts` | All API logic | 5,500 |
| `shared/schema.ts` | Database structure | 850 |
| `shared/feature-flags.ts` | Feature control | 350 |
| `client/src/App.tsx` | App routing | 200 |
| `server/storage.ts` | Database queries | 800 |

---

## 🎯 Core Systems

### 🗺️ System Map

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Quotes    │────▶│   Invoices   │────▶│  Payments   │
│  (Create)   │     │  (Generate)  │     │   (Track)   │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │                     │
       ▼                    ▼                     ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Clients   │     │   Vendor PO  │     │  Analytics  │
│    (CRM)    │     │ (Procurement)│     │ (Insights)  │
└─────────────┘     └──────────────┘     └─────────────┘
```

---

### 1️⃣ Quote Management

**What it does:** Create professional quotes for clients

**Key Features:**
- ✍️ Create quotes with line items
- 📊 Add BOM, SLA, and timeline sections
- 📄 Generate branded PDFs (7 themes)
- 📧 Email quotes to clients
- ✅ Approve/reject workflow
- 🔄 Convert to invoice

**Main Files:**
- `client/src/pages/quotes.tsx` - List view
- `client/src/pages/quote-detail.tsx` - Detail view
- `server/routes.ts` (lines 500-1500) - API logic

**API Endpoints:**
```
GET    /api/quotes           List all quotes
POST   /api/quotes           Create new quote
GET    /api/quotes/:id       Get details
PATCH  /api/quotes/:id       Update quote
GET    /api/quotes/:id/pdf   Generate PDF
POST   /api/quotes/:id/email Send via email
POST   /api/quotes/:id/convert-to-invoice
```

**Database Tables:**
- `quotes` - Quote headers
- `quote_items` - Line items

---

### 2️⃣ Invoice Management

**What it does:** Track billing and payments

**Key Features:**
- 💰 Auto-generate from approved quotes
- 📝 Master/child invoices (milestone billing)
- 💳 Record multiple payments
- ⏰ Track due dates & overdue status
- 📬 Automated payment reminders
- 🧾 PDF invoices with themes

**Main Files:**
- `client/src/pages/invoices.tsx` - List view
- `client/src/pages/invoice-detail.tsx` - Detail & payments
- `server/routes.ts` (lines 1500-2500) - API logic

**API Endpoints:**
```
GET    /api/invoices                List invoices
GET    /api/invoices/:id            Get details
POST   /api/invoices/:id/payment    Record payment
POST   /api/invoices/:id/reminder   Send reminder
POST   /api/invoices/:id/create-child
```

**Database Tables:**
- `invoices` - Invoice headers
- `invoice_items` - Line items
- `payments` - Payment history

---

### 3️⃣ Client Management (CRM)

**What it does:** Manage customer relationships

**Key Features:**
- 👤 Complete client profiles
- 🏢 Client segmentation (Enterprise, Corporate, etc.)
- 🏷️ Custom tags
- 💬 Communication history (emails, calls, meetings)
- 📊 Client analytics & insights
- 🎨 Preferred PDF themes

**Main Files:**
- `client/src/pages/clients.tsx` - Client list
- `client/src/pages/client-detail.tsx` - Profile view
- `server/routes.ts` (lines 2500-3500) - API logic

**API Endpoints:**
```
GET    /api/clients             List clients
POST   /api/clients             Create client
GET    /api/clients/:id         Get profile
POST   /api/clients/:id/tags    Add tag
POST   /api/clients/:id/communications
```

**Database Tables:**
- `clients` - Client profiles
- `client_tags` - Tags
- `client_communications` - History

---

### 4️⃣ Vendor Management & Procurement

**What it does:** Handle supplier orders

**Key Features:**
- 🏭 Vendor database
- 📦 Purchase orders (PO)
- ✅ GRN (Goods Receipt Notes)
- 🔢 Serial number tracking
- 📊 Vendor performance metrics
- 📧 Email POs to vendors

**Main Files:**
- `client/src/pages/vendors.tsx` - Vendor list
- `client/src/pages/vendor-pos.tsx` - PO list
- `client/src/pages/grn-list.tsx` - GRN tracking
- `server/routes.ts` (lines 3500-4500) - API logic

**API Endpoints:**
```
GET    /api/vendors             List vendors
POST   /api/vendor-pos          Create PO
POST   /api/vendor-pos/:id/grn  Create GRN
GET    /api/serial-numbers/search
```

**Database Tables:**
- `vendors` - Vendor profiles
- `vendor_pos` - Purchase orders
- `grns` - Goods received
- `serial_numbers` - Item tracking

---

### 5️⃣ Products & Inventory

**What it does:** Product catalog & stock management

**Key Features:**
- 📦 Product master data
- 📊 Stock tracking
- 🔢 Serial number requirements
- ⚠️ Reorder levels
- 📂 Category management

**Main Files:**
- `client/src/pages/products.tsx`
- `server/routes.ts` (lines 4500-5000)

**Database Tables:**
- `products` - Product catalog

---

### 6️⃣ Analytics & Dashboards

**What it does:** Business intelligence & reporting

**Key Features:**
- 📈 Sales forecasting
- 💰 Revenue trends
- 📊 Quote conversion rates
- 🏢 Client insights
- 🏭 Vendor performance
- 📥 Excel & PDF exports

**Main Files:**
- `client/src/pages/sales-quote-dashboard.tsx`
- `client/src/pages/invoice-collections-dashboard.tsx`
- `server/analytics-routes.ts`

**API Endpoints:**
```
GET    /api/analytics/sales-quotes
GET    /api/analytics/invoice-collections
GET    /api/reports/quotes?format=pdf|excel
```

---

### 7️⃣ Admin Configuration

**What it does:** System settings & configuration

**Key Features:**
- 🏢 Company profile
- 🔢 Document numbering schemes
- 🏦 Bank details
- 📧 Email templates
- 💱 Tax rates
- 👥 User management

**Main Files:**
- `client/src/pages/admin-configuration.tsx`
- `client/src/pages/admin-users.tsx`

**Database Tables:**
- `settings` - Key-value config
- `users` - User accounts
- `bank_details` - Payment info

---

## 🚩 Feature Flags System

**NEW**: Comprehensive feature flags system allows enabling/disabling any feature without code deletion.

### Overview

The feature flags system provides granular control over application features:
- 150+ individual feature flags
- No code deletion required
- Instant enable/disable
- Works with existing RBAC
- Type-safe implementation

### Configuration File

**Location**: \`shared/feature-flags.ts\`

\`\`\`typescript
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // Pages & Routes (32 flags)
  pages_dashboard: true,
  pages_quotes: true,
  pages_invoices: true,
  pages_clients: true,
  pages_vendors: true,
  pages_products: true,
  // ... 26 more page flags
  
  // Core Modules
  quotes_module: true,
  quotes_create: true,
  quotes_edit: true,
  quotes_delete: true,
  quotes_approve: true,
  quotes_pdfGeneration: true,
  quotes_emailSending: true,
  quotes_convertToInvoice: true,
  quotes_convertToVendorPO: true,
  // ... 9 more quote flags
  
  invoices_module: true,
  invoices_create: true,
  invoices_pdfGeneration: true,
  invoices_emailSending: true,
  invoices_paymentReminders: true,
  invoices_childInvoices: true,
  // ... 10 more invoice flags
  
  // ... 100+ more flags for all features
};
\`\`\`

### Usage

#### Client-Side (React)

\`\`\`typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

function MyComponent() {
  const canGeneratePDF = useFeatureFlag('quotes_pdfGeneration');
  
  return (
    <div>
      {canGeneratePDF && (
        <Button onClick={downloadPDF}>Download PDF</Button>
      )}
    </div>
  );
}
\`\`\`

#### Server-Side (Express)

\`\`\`typescript
import { requireFeature } from './feature-flags-middleware';

app.get("/api/quotes/:id/pdf", 
  requireFeature('quotes_pdfGeneration'),
  authMiddleware,
  async (req, res) => {
    // Handler code
  }
);
\`\`\`

### Protected Elements

| Category | Count | Examples |
|----------|-------|----------|
| **Pages** | 32 | Dashboard, Quotes, Invoices, Clients, etc. |
| **Buttons** | 22+ | PDF, Email, Create, Edit, Delete |
| **API Routes** | 50+ | All major endpoints |
| **Navigation** | 15+ | Sidebar menu items |
| **Tabs** | 4 | Admin configuration tabs |

### Feature Flag Categories

1. **Pages & Routes** (32 flags) - Control page access
2. **Navigation** (5 flags) - Show/hide menu items
3. **Quotes Module** (18 flags) - Quote operations
4. **Invoices Module** (16 flags) - Invoice operations
5. **Clients Module** (13 flags) - CRM features
6. **Vendors Module** (18 flags) - Vendor & procurement
7. **Products Module** (8 flags) - Product management
8. **Payments** (9 flags) - Payment tracking
9. **Tax & Pricing** (11 flags) - Tax calculations
10. **PDF & Themes** (14 flags) - PDF generation
11. **Email** (8 flags) - Email features
12. **Admin** (9 flags) - Admin functions
13. **Security** (9 flags) - Security features
14. **UI/UX** (9 flags) - UI elements
15. **Advanced** (6 flags) - Excel export, etc.

### Security Model

\`\`\`
Request Flow:
1. Feature Flag Check → If disabled, return 404
2. Authentication → If not logged in, return 401
3. Permission Check → If no permission, return 403
4. Execute Handler → If all checks pass
\`\`\`

### Common Operations

**Disable Quotes Module:**
\`\`\`typescript
// In shared/feature-flags.ts
quotes_module: false,
pages_quotes: false,
quotes_create: false,
quotes_edit: false,
\`\`\`

**Disable PDF Generation:**
\`\`\`typescript
pdf_generation: false,
quotes_pdfGeneration: false,
invoices_pdfGeneration: false,
vendorPO_pdfGeneration: false,
\`\`\`

**Disable Email Features:**
\`\`\`typescript
email_integration: false,
quotes_emailSending: false,
invoices_emailSending: false,
\`\`\`

### Documentation

- \`FEATURE_DISABLE_GUIDE.md\` - Complete guide
- \`FEATURE_FLAGS_QUICK_REFERENCE.md\` - Quick reference
- \`FEATURE_FLAGS_ARCHITECTURE.md\` - Architecture diagrams
- \`FEATURE_FLAGS_IMPLEMENTATION.md\` - Implementation details

---

## 🔒 Security & RBAC

### User Roles

| Role | Level | Description |
|------|-------|-------------|
| **Super Admin** | 6 | Full system access |
| **Admin** | 5 | Administrative access |
| **Sales Manager** | 4 | Sales oversight |
| **Sales** | 3 | Quote creation |
| **Finance/Accounts** | 2 | Invoice & payment management |
| **Purchase/Operations** | 1 | Vendor & procurement |

### Permission Matrix

\`\`\`typescript
// Resource-based permissions
const ROLE_PERMISSIONS = {
  'Super Admin': {
    quotes: { view: true, create: true, edit: true, delete: true, approve: true },
    invoices: { view: true, create: true, edit: true, delete: true },
    clients: { view: true, create: true, edit: true, delete: true },
    vendors: { view: true, create: true, edit: true, delete: true },
    // ... all resources
  },
  'Sales': {
    quotes: { view: true, create: true, edit: true, delete: false, approve: false },
    invoices: { view: true, create: false, edit: false, delete: false },
    clients: { view: true, create: true, edit: true, delete: false },
    // ... limited access
  },
  // ... other roles
};
\`\`\`

### Authentication

- Password hashing with bcrypt (10 rounds)
- Session-based authentication with HTTP-only cookies
- Refresh token support (7 days)
- Password reset via email
- Account lockout after failed attempts

### Authorization

\`\`\`typescript
// Middleware chain
app.get("/api/quotes/:id",
  requireFeature('quotes_module'),      // Feature flag
  authMiddleware,                       // Authentication
  requirePermission('quotes', 'view'),  // Authorization
  async (req, res) => { /* handler */ }
);
\`\`\`

### Security Features

- CORS configuration
- Rate limiting
- SQL injection protection (ORM)
- XSS protection
- CSRF tokens
- Secure headers
- Activity logging
- Audit trails

---

## 💾 Database Schema

### Tables (25+)

1. **users** - User accounts and authentication
2. **clients** - Client/customer information
3. **quotes** - Quote headers
4. **quote_items** - Quote line items
5. **invoices** - Invoice headers
6. **invoice_items** - Invoice line items
7. **payments** - Payment transactions
8. **vendors** - Vendor information
9. **vendor_pos** - Vendor purchase orders
10. **vendor_po_items** - PO line items
11. **grns** - Goods receipt notes
12. **grn_items** - GRN line items
13. **serial_numbers** - Serial number tracking
14. **products** - Product catalog
15. **client_tags** - Client tagging
16. **client_communications** - Communication history
17. **activity_logs** - Audit logging
18. **settings** - System configuration
19. **payment_reminder_logs** - Email tracking
20. **numbering_counters** - Sequential numbering
21. **permission_delegations** - Temporary permissions
22. **payment_methods** - Payment method tracking
23. **tax_rates** - Tax configuration
24. **invoice_notes** - Invoice annotations
25. **quote_templates** - Quote templates

### Key Relationships

\`\`\`
users (1) ←─────→ (N) quotes
clients (1) ←────→ (N) quotes
quotes (1) ←─────→ (N) quote_items
quotes (1) ←─────→ (0..1) invoices
invoices (1) ←───→ (N) invoice_items
invoices (1) ←───→ (N) payments
vendors (1) ←────→ (N) vendor_pos
vendor_pos (1) ←─→ (N) vendor_po_items
vendor_pos (1) ←─→ (N) grns
grns (1) ←───────→ (N) grn_items
grn_items (1) ←──→ (N) serial_numbers
\`\`\`

### Example Schema

\`\`\`typescript
// quotes table (simplified)
export const quotes = pgTable("quotes", {
  id: text("id").primaryKey(),
  quoteNumber: text("quote_number").notNull().unique(),
  clientId: text("client_id").notNull().references(() => clients.id),
  status: text("status").notNull().default("draft"),
  subtotal: numeric("subtotal").notNull(),
  discount: numeric("discount").default("0"),
  cgst: numeric("cgst").default("0"),
  sgst: numeric("sgst").default("0"),
  igst: numeric("igst").default("0"),
  total: numeric("total").notNull(),
  validityDays: integer("validity_days").default(30),
  quoteDate: timestamp("quote_date").defaultNow(),
  createdBy: text("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  // ... more fields
});
\`\`\`

---

## 🔌 API Documentation

### Base URL

- Development: \`http://localhost:5000\`
- Production: \`https://your-domain.vercel.app\`

### Authentication

All protected endpoints require authentication via session cookie.

\`\`\`bash
# Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# Response sets HTTP-only cookie
\`\`\`

### Common Headers

\`\`\`
Accept: application/json
Content-Type: application/json
Cookie: connect.sid=<session-id>
\`\`\`

### Response Format

\`\`\`json
// Success
{
  "id": "123",
  "quoteNumber": "QT-2025-001",
  "status": "draft",
  // ... data
}

// Error
{
  "error": "Quote not found"
}
\`\`\`

### Status Codes

- \`200\` - Success
- \`201\` - Created
- \`400\` - Bad Request
- \`401\` - Unauthorized
- \`403\` - Forbidden
- \`404\` - Not Found
- \`500\` - Server Error

### Key Endpoints

See [API Endpoints](#api-endpoints) section above for complete list.

### Rate Limiting

Currently no rate limiting implemented. Add via middleware if needed.

---

## 🎨 Frontend Architecture

### Component Structure

\`\`\`
components/
├── ui/              # Shadcn/UI primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ... (44 more)
├── quote/           # Quote-specific
│   ├── bom-section.tsx
│   ├── sla-section.tsx
│   └── timeline-section.tsx
├── invoice/         # Invoice-specific
│   ├── payment-tracker.tsx
│   ├── split-wizard.tsx
│   └── edit-invoice-dialog.tsx
└── vendor-po/       # Vendor PO
    ├── create-vendor-po-dialog.tsx
    └── create-grn-dialog.tsx
\`\`\`

### State Management

- **React Query** for server state
- **React Context** for auth state
- **useState/useReducer** for local state
- No global state management (Redux, Zustand)

### Routing

Uses **Wouter** for client-side routing:

\`\`\`typescript
import { Route, Switch } from "wouter";

<Switch>
  <Route path="/" component={Dashboard} />
  <Route path="/quotes" component={Quotes} />
  <Route path="/quotes/:id" component={QuoteDetail} />
  // ... more routes
</Switch>
\`\`\`

### Data Fetching

\`\`\`typescript
import { useQuery, useMutation } from "@tanstack/react-query";

// Fetching data
const { data, isLoading } = useQuery({
  queryKey: ["/api/quotes"],
});

// Mutations
const mutation = useMutation({
  mutationFn: (data) => apiRequest("POST", "/api/quotes", data),
  onSuccess: () => queryClient.invalidateQueries(),
});
\`\`\`

### Styling

- **TailwindCSS** for utilities
- **CSS Variables** for theming
- **Shadcn/UI** components
- **Framer Motion** for animations

### Form Handling

\`\`\`typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const form = useForm({
  resolver: zodResolver(schema),
});
\`\`\`

---

## ⚙️ Backend Architecture

### Server Structure

\`\`\`
server/
├── index.ts                    # Entry point, Express setup
├── routes.ts                   # Main API routes (5500 lines)
├── storage.ts                  # Database abstraction
├── permissions-middleware.ts   # RBAC middleware
├── feature-flags-middleware.ts # Feature flags
├── email-service.ts           # Email integration
├── pdf-service.ts             # PDF generation
├── analytics-routes.ts        # Analytics endpoints
└── payment-reminder-scheduler.ts # Cron jobs
\`\`\`

### Middleware Chain

\`\`\`typescript
app.use(cookieParser());
app.use(express.json());
app.use(cors({ credentials: true }));

// Per-route middleware
app.get("/api/resource",
  requireFeature('feature_flag'),
  authMiddleware,
  requirePermission('resource', 'view'),
  handler
);
\`\`\`

### Database Layer

**Drizzle ORM** for type-safe queries:

\`\`\`typescript
import { db } from "./db";
import { quotes, clients } from "@shared/schema";

// Query with joins
const quote = await db
  .select()
  .from(quotes)
  .leftJoin(clients, eq(quotes.clientId, clients.id))
  .where(eq(quotes.id, id))
  .limit(1);
\`\`\`

### Services

#### Email Service

\`\`\`typescript
class EmailService {
  static async sendQuoteEmail(to, quoteId, pdfBuffer) {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Quote from Company",
      html: emailTemplate,
      attachments: [{ filename: "quote.pdf", content: pdfBuffer }]
    });
  }
}
\`\`\`

#### PDF Service

\`\`\`typescript
class PDFService {
  static generateQuotePDF(quote, client, items, theme) {
    const doc = new PDFDocument();
    // Apply theme
    // Add header, items, totals
    // Return buffer
    return doc;
  }
}
\`\`\`

### Background Jobs

\`\`\`typescript
import cron from "node-cron";

// Run daily at 9 AM
cron.schedule("0 9 * * *", async () => {
  // Check overdue invoices
  // Send payment reminders
});
\`\`\`

---

## ⚙️ Configuration

### Environment Variables

Create \`.env\` file:

\`\`\`bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/quoting"

# Server
PORT=5000
NODE_ENV=development

# Email (Resend)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@example.com

# Email (SMTP - alternative)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# Session
SESSION_SECRET=your-secret-key-here

# Optional
VERCEL_URL=your-domain.vercel.app
\`\`\`

### Application Settings

Stored in database via \`/api/settings\`:

- Company profile
- Document numbering formats
- Email templates
- Tax rates
- Bank details
- Payment terms

### Feature Flags

Edit \`shared/feature-flags.ts\` to enable/disable features.

---

## 🔧 Development Workflow

### Local Development

\`\`\`bash
# Start dev server (auto-reload)
pnpm dev

# Type checking
pnpm check

# Database push (sync schema)
pnpm db:push

# Run tests
pnpm test
\`\`\`

### Code Structure

\`\`\`bash
# Create new page
touch client/src/pages/my-page.tsx

# Create new component
touch client/src/components/my-component.tsx

# Add API endpoint in server/routes.ts
app.get("/api/my-endpoint", authMiddleware, handler);

# Update schema
# Edit shared/schema.ts
pnpm db:push
\`\`\`

### Database Migrations

\`\`\`bash
# Generate migration
pnpm drizzle-kit generate

# Apply migration
pnpm drizzle-kit push

# Studio (GUI)
pnpm drizzle-kit studio
\`\`\`

### Adding a New Feature

1. Add feature flag in \`shared/feature-flags.ts\`
2. Create UI components in \`client/src/components/\`
3. Create page in \`client/src/pages/\`
4. Add route in \`client/src/App.tsx\`
5. Add API endpoint in \`server/routes.ts\`
6. Add database table in \`shared/schema.ts\`
7. Run \`pnpm db:push\`
8. Protect with feature flags
9. Add permissions check
10. Test functionality
11. Write E2E tests

---

## 🧪 Testing

### E2E Tests (Playwright)

\`\`\`bash
# Run all tests
pnpm test

# Run specific test
pnpm test tests/e2e/analytics.spec.ts

# Debug mode
pnpm test:debug

# UI mode
pnpm test:ui
\`\`\`

### Test Suites

1. \`analytics.spec.ts\` - Analytics dashboards
2. \`client-management.spec.ts\` - Client CRUD
3. \`pricing.spec.ts\` - Quote pricing
4. \`phase3-security.spec.ts\` - RBAC
5. \`password-reset-security.spec.ts\` - Auth
6. \`pdf-and-email.spec.ts\` - PDF/Email
7. ... (14 total)

### Writing Tests

\`\`\`typescript
import { test, expect } from "@playwright/test";

test("create quote", async ({ page }) => {
  await page.goto("/quotes");
  await page.click("text=Create Quote");
  await page.fill("#clientName", "Test Client");
  await page.click("text=Save");
  await expect(page.locator("text=Quote created")).toBeVisible();
});
\`\`\`

---

## 🚀 Deployment

### Vercel Deployment

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production
vercel --prod
\`\`\`

### Environment Setup

1. Set environment variables in Vercel dashboard
2. Connect Neon PostgreSQL database
3. Configure build settings:
   - **Build Command**: \`pnpm build\`
   - **Output Directory**: \`dist\`
   - **Install Command**: \`pnpm install\`

### Database Migration

\`\`\`bash
# Production database
pnpm db:push
\`\`\`

### Post-Deployment

1. Create admin user
2. Configure company settings
3. Set up email integration
4. Test all features
5. Monitor logs

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Fails**
\`\`\`bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL

# Reset database
pnpm db:push
\`\`\`

**Build Errors**
\`\`\`bash
# Clear cache
rm -rf node_modules .next dist
pnpm install
pnpm build
\`\`\`

**Port Already in Use**
\`\`\`bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
\`\`\`

**Feature Not Working**
1. Check feature flag in \`shared/feature-flags.ts\`
2. Check user permissions
3. Check network tab for API errors
4. Check server logs

### Debug Mode

\`\`\`bash
# Enable debug logs
DEBUG=* pnpm dev

# Check server logs
tail -f server.log
\`\`\`

---

## 📖 Additional Resources

### Documentation Files

- \`FEATURE_DISABLE_GUIDE.md\` - Feature flags guide
- \`USER_ROLES_VISUAL_DIAGRAMS.md\` - RBAC diagrams
- \`DASHBOARD_REDESIGN_COMPLETE.md\` - Dashboard docs
- \`EMAIL_FIX_VISUAL_DIAGRAMS.md\` - Email system
- \`PDF_GENERATION_GUIDE.md\` - PDF documentation

### Key Concepts

- **Quote-to-Cash**: Quote → Approval → Invoice → Payment
- **Procurement**: Quote → Vendor PO → GRN → Serial Numbers
- **RBAC**: Role-based access control with 6 roles
- **Feature Flags**: Enable/disable features without code changes
- **Multi-Tenancy**: Support for multiple companies (future)

### Support

For issues or questions:
1. Check documentation in \`MD files/\`
2. Review code comments
3. Check Git history for context
4. Contact development team

---

## 🎓 Learning Path

### For New Developers

1. **Day 1-2**: Set up local environment, run application
2. **Day 3-4**: Understand project structure and architecture
3. **Day 5-7**: Study core modules (Quotes, Invoices)
4. **Week 2**: Learn RBAC and feature flags
5. **Week 3**: Make first contribution
6. **Week 4+**: Work on features independently

### 3. Workflow States

1.  **Trigger**: Sales Rep clicks "Mark as Approved".
2.  **Intercept**: API calls `evaluateQuote()`.
3.  **Branch**:
    *   **No Trigger**: Status -> `approved`.
    *   **Triggered**: Status -> `approval_pending`. Notification sent to `sales_manager`.
4.  **Decision**: Manager clicks "Approve" -> Status -> `approved`.

---

## 🏗️ Frontend Architecture (White Box Implementation)

### 1. Global State Management (`QueryClient`)

The application uses **TanStack Query (React Query)** with a specific "Business App" configuration designed to minimize flickering while ensuring data consistency for numbered documents.

```typescript
// client/src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 Minute Stale Time: QUOTES/INVOICES don't change often from outside
      staleTime: 5 * 60 * 1000, 
      // User Interface Stability: Don't refetch just because user tabbed away
      refetchOnWindowFocus: false, 
      // Fail Fast: Don't retry on 404/500s, let the UI handle the error boundary
      retry: false, 
    },
  },
});
```

### 2. Authentication Concurrency (The "Refresh Mutex")

The `apiClient` wrapper implements a custom **Mutex Lock** to prevent race conditions when an Access Token expires.

**Problem**: If a page fires 5 requests simultaneously (Dashboard, Notifications, User Profile, etc.) and the token is expired, all 5 returns `401`. Primitive clients effectively DDOS the refresh endpoint.

**Solution**:
```typescript
// client/src/lib/queryClient.ts
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

if (res.status === 401) {
    if (!isRefreshing) {
        isRefreshing = true;
        // The FIRST request triggers the refresh
        refreshPromise = refreshAccessToken();
    }
    
    // The other 4 requests AWAIT the same promise
    const success = await refreshPromise;
    
    if (success) {
        // Retry original request with new cookie
        return fetch(url, ...);
    }
}
```

---

## 🔢 Sequence & Numbering Engine (White Box Implementation)

### 1. Atomic Upsert Strategy

To guarantee gapless, unique references (e.g., `INV-2025-0001`) without locking the entire table, the `NumberingService` uses a PostgreSQL atomic upsert pattern.

**Mechanism**:
1.  Attempt to insert `value=1` for key `quote_counter_2025`.
2.  If key exists (Conflict), perform `UPDATE value = value + 1`.
3.  Use `RETURNING value` to get the reserved number in the same cycle.

```typescript
// server/services/numbering.service.ts
const result = await db.execute(sql`
  INSERT INTO settings (key, value) 
  VALUES (${counterKey}, '1')
  ON CONFLICT (key) DO UPDATE 
  SET value = (CAST(settings.value AS INTEGER) + 1)::text
  RETURNING value
`);
```

### 2. Format Specification

The format is configurable per tenant but defaults to:
`{PREFIX}-{YEAR}-{COUNTER:04d}`

| Variable | Example Resolution |
| :--- | :--- |
| `{PREFIX}` | `QT`, `INV`, `SO` |
| `{YEAR}` | `2025` |
| `{COUNTER}` | `123` |
| `{COUNTER:04d}` | `0123` (Zero Padded) |

---

## 🔐 Security & Permissions (White Box Implementation)

### 1. Dynamic Circular Dependency Resolution

The `permissions-middleware` needs to check logic in `permissions-service`, typically creating a circular dependency loop (Middleware -> Service -> Types -> Middleware).

**Solution**: Lazy Import
```typescript
// server/permissions-middleware.ts
export function requireQuoteApprovalPermission() {
  return async (req, res, next) => {
    // Dynamic import breaks the cycle at runtime
    const { canApproveQuote } = await import("./permissions-service");
    // ...
  };
}
```

### 2. Audit Interception Strategy

Instead of remembering to log every successful action in every route, the `auditLog` middleware monkey-patches the `res.json` method.

```typescript
// server/permissions-middleware.ts
const originalSend = res.json.bind(res);

res.json = function(data) {
    // Only log if the operation succeeded (2xx Status)
    if (res.statusCode >= 200 && res.statusCode < 300) {
        storage.createActivityLog({ ... });
    }
    return originalSend(data);
};
```

---

## 📦 Inventory & Products (White Box Implementation)

### 1. Strict Feature Guarding

The API doesn't just hide UI elements; it actively sanitizes input payloads based on Feature Flags.

```typescript
// server/routes/products.routes.ts
router.patch("/:id", async (req, res) => {
    const updates = { ...req.body };
    
    // Hard Logic: If SKU feature is disabled, the SKU field is forcibly removed
    // even if the user is an Admin sending raw JSON.
    if (!isFeatureEnabled('products_sku')) delete updates.sku;
    
    // ... update DB ...
});
```

### 2. Stock Logic

*   **Initialization**: New products default to `stockQuantity: 0` and `availableQuantity: 0` unless explicitly set.
*   **Decoupling**: The system tracks `stockQuantity` (Physical) and `availableQuantity` (Allocatable) separately, allowing for future "Reserved Stock" features (e.g., stock held in a Sales Order but not yet shipped).

### Key Files to Study

2. \`shared/schema.ts\` - Database structure
3. \`client/src/App.tsx\` - Routing
4. \`server/permissions-middleware.ts\` - RBAC
5. \`shared/feature-flags.ts\` - Feature control

---

## 📊 Project Statistics

\`\`\`
Total Files: 500+
Total Lines: 50,000+
Languages: TypeScript (95%), CSS (3%), JSON (2%)
Avg. Complexity: Low-Medium
Code Coverage: ~60% (E2E tests)
Bundle Size: ~2.5MB (production)
Load Time: <2s (initial)
\`\`\`

---

## 🏆 Best Practices

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful comments
- Use descriptive variable names

### Git Workflow

\`\`\`bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "feat: add new feature"

# Push
git push origin feature/my-feature

# Create PR
\`\`\`

### Component Guidelines

- One component per file
- Use functional components
- Extract reusable logic to hooks
- Keep components small (<300 lines)
- Use TypeScript interfaces

### API Guidelines

- RESTful endpoints
- Consistent naming
- Proper error handling
- Input validation
- Return appropriate status codes

---

## 📝 License

This project is proprietary and confidential.

---

## 👥 Contributors

Development Team - QuoteProGen

---

**Last Updated**: January 1, 2026  
**Version**: 2.0  
**Status**: Production Ready

