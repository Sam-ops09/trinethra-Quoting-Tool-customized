# QuoteProGen - Enterprise-Grade Quote to Cash Platform

A comprehensive full-stack enterprise system for end-to-end quote-to-cash operations, supply chain management, and financial operations. Built with modern technologies to handle complex business workflows including quotes, invoices, vendors, purchase orders, goods receipt, serial number tracking, and advanced analytics with granular role-based access control.

> **📖 For Complete Developer Documentation**: See [README_DEVELOPER_COMPLETE.md](./README_DEVELOPER_COMPLETE.md) for in-depth technical documentation covering architecture, feature flags system, API details, and development guidelines.

## 📊 Project Statistics

| Metric | Count | Description |
|--------|-------|-------------|
| **Total Lines of Code** | 50,000+ | Complete codebase |
| **API Endpoints** | 126+ | RESTful API routes |
| **Database Tables** | 25+ | Comprehensive data model |
| **Feature Flags** | 150+ | Granular feature control (NEW!) |
| **UI Components** | 47 | shadcn/ui components |
| **Pages/Views** | 32 | Complete application pages |
| **User Roles** | 6 | Granular access control |
| **PDF Themes** | 7 | Professional document themes |
| **Test Suites** | 14 | E2E test coverage |
| **Dependencies** | 145 | Production + dev packages |
| **Services** | 10 | Backend business logic services |
| **Migrations** | 15 | Database schema versions |
| **Documentation** | 50+ | Markdown documentation files |

### 🎯 Core Capabilities

- ✅ **Complete Quote-to-Cash Workflow** - From quote creation to invoice payment
- ✅ **Feature Flags System** - 150+ flags to enable/disable any feature without code deletion (NEW!)
- ✅ **Supply Chain Management** - Vendor POs, GRN, serial number tracking
- ✅ **CRM & Client Management** - Full customer relationship management
- ✅ **Financial Operations** - Invoicing, payments, collections, analytics
- ✅ **Multi-Role Access Control** - 6 roles with granular permissions
- ✅ **Professional PDF Generation** - 7 themes with client-specific customization
- ✅ **Email Integration** - Automated emails for quotes, invoices, reminders
- ✅ **Advanced Analytics** - 15+ dashboard endpoints with forecasting
- ✅ **Inventory Management** - Products, stock tracking, serial numbers
- ✅ **Audit & Compliance** - Complete activity logging and history
- ✅ **Responsive Design** - Adaptive layouts for all screen sizes (NEW!)
- ✅ **Production Ready** - Vercel deployment, PostgreSQL, comprehensive testing

## 📑 Table of Contents

- [Project Statistics](#-project-statistics)
- [Complete Feature List](#-complete-feature-list)
- [Feature Flags System](#-feature-flags-system-new)
- [Tech Stack](#️-tech-stack)
- [Quick Start Guide](#-quick-start-guide)
- [Production Deployment](#-production-deployment)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Customization Guide](#-customization-guide-for-clients)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Complete Feature List

### 📝 Quote Management System
- **Quote Creation & Editing** - Rich quote builder with line items, descriptions, and calculations
- **Quote Status Tracking** - Draft, Sent, Approved, Rejected, Invoiced, Closed (Paid/Cancelled) states
- **Quote Numbering** - Auto-generated sequential quote numbers with configurable format
- **Quote Versioning** - Track multiple versions of quotes
- **Quote Templates** - Save and reuse quote structures for faster creation
- **Quote Validity** - Configurable validity periods (default 30 days)
- **Reference Numbers** - Add custom reference numbers for internal tracking
- **Attention To** - Specify contact person for the quote
- **Advanced Sections**:
  - 📄 **Bill of Materials (BOM)** - Detailed component breakdowns with JSON support
  - ⏱️ **Service Level Agreements (SLA)** - Define service commitments and response times
  - 📅 **Project Timeline** - Visual timeline with milestones and deliverables
- **Quote Items** - Add multiple line items with quantity, unit price, HSN/SAC codes for GST compliance
- **Discount Management** - Apply percentage or fixed amount discounts
- **Shipping Charges** - Add delivery and shipping costs
- **Notes & Terms** - Custom notes and terms & conditions per quote
- **PDF Generation** - Generate professional PDFs with multiple theme options
- **Email Delivery** - Send quotes directly to clients via email with PDF attachment
- **Quote to Invoice** - Convert approved quotes to invoices with one click
- **Quote to Vendor PO** - Create vendor purchase orders from approved quotes

### 💰 Invoice & Payment Management
- **Invoice Generation** - Automatic invoice creation from approved quotes
- **Invoice Numbering** - Sequential invoice numbers with configurable format
- **Child Invoice Support** - Create child invoices from parent invoices for milestone billing
- **Master Invoice System** - Manage multiple child invoices under one master invoice
  - Draft, Confirmed, and Locked states for master invoices
  - Milestone descriptions for milestone-based billing
  - Delivery notes tracking
- **Payment Status Tracking** - Pending, Partial, Paid, Overdue states
- **Payment History** - Record multiple payments per invoice with full audit trail
- **Payment Methods** - Support for Bank Transfer, Credit Card, Check, Cash, UPI, etc.
- **Transaction IDs** - Track payment gateway and bank reference numbers
- **Due Date Management** - Set and track payment due dates
- **Overdue Detection** - Automatic identification of overdue invoices
- **Payment Reminders** - Automated email reminders for pending payments with tracking
- **Overdue Notifications** - Automated overdue payment notifications
- **Partial Payment Support** - Track multiple installments with detailed history
- **Payment Notes** - Add notes to each payment transaction
- **Payment Analytics** - View payment trends and collection metrics
- **Invoice PDFs** - Generate professional invoice PDFs with payment details and themes
- **Email Invoices** - Send invoices and payment reminders via email with PDF attachment
- **Child Invoice Management** - Hierarchical invoice structure for complex projects

### 👥 Client Management (CRM)
- **Client Profiles** - Comprehensive client information management
- **Contact Details** - Name, Email, Phone, Contact Person
- **Billing & Shipping** - Separate billing and shipping addresses
- **GSTIN Management** - Store client GST identification numbers
- **Client Segmentation** - Categorize clients by type:
  - 🏢 **Enterprise** - Large corporations
  - 🏛️ **Corporate** - Medium businesses
  - 🚀 **Startup** - Early-stage companies
  - 🏛️ **Government** - Government agencies
  - 🎓 **Education** - Educational institutions
- **Client Tags** - Add custom tags for flexible categorization
- **Preferred Themes** - Assign client-specific PDF themes
- **Communication History** - Complete log of all interactions:
  - 📧 Email communications
  - 📞 Phone calls
  - 🤝 Meetings
  - 📝 Notes
- **Client Timeline** - View all quotes, invoices, and interactions
- **Client Search** - Advanced search by name, email, segment, tags

### 📊 Analytics & Reporting Dashboard
- **Revenue Metrics**:
  - Total Revenue (all-time and period-based)
  - Monthly Recurring Revenue (MRR)
  - Average Deal Size
  - Revenue Growth Rate
- **Quote Analytics**:
  - Total Quotes Created
  - Quote Conversion Rate (quotes → invoices)
  - Average Quote Value
  - Quote Status Distribution
- **Invoice Analytics**:
  - Total Invoices Generated
  - Payment Collection Rate
  - Outstanding Amount
  - Overdue Invoices Count
- **Time-Based Analysis**:
  - Configurable time ranges (3, 6, 12, 24 months)
  - Month-over-month comparisons
  - Trend visualizations
- **Revenue Forecasting**:
  - AI-powered revenue predictions
  - Seasonal trend analysis
  - Confidence intervals
- **Deal Distribution**:
  - Deal size segmentation
  - Client segment analysis
- **Visual Charts** - Revenue trends, deal distribution, payment status using Recharts

### 🎨 PDF Theme System
Multiple professional themes for quotes and invoices:
- **Professional** - Classic business design with formal layout
- **Modern** - Clean contemporary design with blue accents
- **Minimal** - Simple elegant layout with maximum clarity
- **Creative** - Bold colorful design for creative agencies
- **Premium** - Luxury gold-accented design for high-end services
- **Government** - Formal structured layout for government contracts
- **Education** - Friendly academic-focused design

**Theme Features**:
- Custom color schemes per theme
- Client segment auto-mapping (e.g., Government clients → Government theme)
- Override capability for specific clients
- Logo and header image support
- Professional table formatting
- Automatic tax calculation display
- Multi-vendor PO theme support

### 📊 Invoice & Quote Customization
- **Bank Details Management** - Store multiple bank accounts for payment instructions
  - Account name, number, IFSC/SWIFT codes
  - Bank name and branch information
  - Active/inactive status per bank
  - Display on invoices and quotes
- **Custom Templates** - Save and reuse document templates
  - Quote templates with preset terms, items, and formatting
  - Invoice templates with payment terms
  - PO templates with standard conditions
  - Template versioning and archival

### 🔐 Security & Access Control
- **Role-Based Access Control (RBAC)**:
  - 👑 **Admin** - Full system access, user management, settings, reporting
  - 👔 **Sales Manager** - Create/edit quotes, invoices, clients, view analytics, manage sales team
  - 📊 **Sales Executive** - Create and manage quotes and client interactions
  - 🏭 **Purchase Operations** - Manage vendor POs, goods received, supplier interactions
  - 💼 **Finance & Accounts** - Manage payments, invoices, financial reporting, tax configuration
  - 👁️ **Viewer** - Read-only access to assigned documents
- **Permission-Based Authorization** - Granular permissions per resource (create, edit, view, delete)
- **Delegation System** - Temporary approval authority delegation with date range
- **JWT Authentication** - Secure token-based auth with access and refresh tokens
- **Password Security**:
  - Bcrypt hashing with salt rounds (10 rounds)
  - Password complexity requirements (uppercase, lowercase, number, special char)
  - Minimum 8 characters
  - Password reset with secure token expiration
  - Password reset link sent via email
  - Backup email support for account recovery
- **Session Management**:
  - HTTP-only cookies
  - Secure flag in production
  - 15-minute access token expiry
  - 7-day refresh token expiry
  - Token refresh endpoint for seamless experience
- **API Rate Limiting** - Prevent brute force attacks
- **Helmet.js Security Headers** - XSS, clickjacking, MIME sniffing protection
- **Input Validation** - Zod schema validation on all inputs
- **SQL Injection Protection** - Parameterized queries via Drizzle ORM
- **Activity Logging** - Audit trail of all user actions (create, update, delete)
- **User Status Management** - Active/Inactive status control for employees

### 🏭 Vendor & Supply Chain Management
- **Vendor Management** - Comprehensive vendor database and profile management
  - Vendor details (name, email, phone, location, GST/Tax ID)
  - Payment terms and conditions
  - Bank details for payments
  - Performance ratings and notes
- **Purchase Orders (PO)** - Create and manage vendor purchase orders
  - Auto-generated from approved quotes
  - Status tracking: Draft, Sent, Acknowledged, Fulfilled, Cancelled
  - PO items with descriptions, quantities, and unit prices
  - Delivery schedules and milestones
  - Terms and conditions per PO
  - PDF generation and email delivery to vendors
- **Goods Received Notes (GRN)** - Track received items
  - Match received items against purchase orders
  - Serial number tracking for each received item
  - Received date and quality notes
  - Stock integration for inventory management
- **Serial Number Tracking** - Complete serial number management
  - Track serial numbers across POs and GRNs
  - Unique identifier per item for warranty and support
  - Search and filter by serial number
  - Historical tracking of serial number movements
  - Export serial number data
- **Products Database** - Manage product master
  - Product codes (SKU)
  - Descriptions and specifications
  - Unit pricing and cost management
  - Reorder levels and quantities
  - Product categories and classification

### 🔄 Supply Chain Dashboards
- **Sales Quote Dashboard** - Real-time quote pipeline view
  - Quote creation trends
  - Conversion metrics
  - Sales executive performance
  - Quote status distribution
- **Vendor PO Dashboard** - Supplier and procurement tracking
  - Open and pending POs
  - Supplier performance metrics
  - Delivery timeliness tracking
  - Cost analysis per vendor
- **Invoice Collections Dashboard** - Payment collection monitoring
  - Outstanding invoices by client
  - Collection efficiency metrics
  - Days Sales Outstanding (DSO)
  - Payment trend analysis
- **GRN & Serial Tracking Dashboard** - Goods received monitoring
  - Recent receipts
  - Serial number activation tracking
  - Quality issue tracking
  - Inventory updates
- **Governance & Approvals Dashboard** - Hierarchical approval tracking
  - Pending approvals by level
  - Approval history and audit trail
  - SLA compliance for approvals
  - Delegation tracking

### 📊 Advanced Analytics & Reporting
- **Revenue Metrics**:
  - Total Revenue (all-time and period-based)
  - Monthly Recurring Revenue (MRR)
  - Average Deal Size
  - Revenue Growth Rate
- **Quote Analytics**:
  - Total Quotes Created
  - Quote Conversion Rate (quotes → invoices)
  - Average Quote Value
  - Quote Status Distribution
  - Sales Executive Performance
- **Invoice Analytics**:
  - Total Invoices Generated
  - Payment Collection Rate
  - Outstanding Amount
  - Overdue Invoices Count
  - Collection efficiency metrics
- **Vendor Analytics**:
  - Vendor performance scoring
  - On-time delivery rates
  - Cost analysis per vendor
  - Quality metrics
- **Time-Based Analysis**:
  - Configurable time ranges (3, 6, 12, 24 months)
  - Month-over-month comparisons
  - Trend visualizations
- **Deal Distribution**:
  - Deal size segmentation
  - Client segment analysis
  - Regional distribution (if applicable)
- **Visual Charts** - Revenue trends, deal distribution, payment status using Recharts

### 🔧 Numbering & Configuration
- **Document Number Migration** - Safe migration of legacy numbering systems
- **Configurable Numbering Schemes**:
  - Quote number format (QUO-YYYY-NNNN, custom prefixes)
  - Invoice number format (INV-YYYY-NNNN, custom prefixes)
  - PO number format (PO-YYYY-NNNN, custom prefixes)
  - Auto-increment by year, month, or continuous
- **Sequential Counter Management** - Reset counters per period or year
- **Multi-format Support** - Support for existing numbering patterns

### 💱 Tax & Pricing Configuration
- **Multi-Tax Support** - GST, CGST, SGST, IGST
- **Regional Tax Rates** - Configure tax rates by region/state
- **Tax Rate Management** - Admin can create, update, activate/deactivate rates
- **HSN/SAC Code Support** - Goods and Services classification for tax compliance
- **Automatic Tax Calculation** - Taxes calculated based on quote/invoice items
- **Pricing Tiers** - Standard, Premium, Enterprise with automatic discounts
- **Currency Settings** - Base currency configuration (default: INR)

### 📧 Email Integration
- **Email Service Options**:
  - **Resend API** (recommended) - Modern transactional email service
  - **SMTP** - Traditional SMTP server support
- **Email Types**:
  - Welcome emails on user signup
  - Quote delivery to clients
  - Invoice delivery to clients
  - Payment reminders
  - Overdue invoice notifications
- **Email Templates** - Customizable HTML email templates
- **Attachment Support** - Attach PDF quotes and invoices

### 📱 User Interface Features
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Mode** - Full dark mode support with theme toggle
- **Sidebar Navigation** - Collapsible sidebar with icons and labels
- **Data Tables** - Sortable, searchable, paginated
- **Forms** - React Hook Form with real-time validation
- **Toast Notifications** - Success, error, warning messages
- **Permission Guards** - UI elements hide based on user role

---

## 🛠️ Tech Stack

### Frontend (React 18 + TypeScript)
- **React 18.3.1** - Modern React with concurrent features
- **TypeScript 5.6.3** - Type-safe development
- **Vite 5.4.20** - Lightning-fast build tool and dev server
- **Wouter 3.3.5** - Lightweight routing library (3.3.5 KB)
- **TailwindCSS 3.4.17** + **@tailwindcss/vite 4.1.3** - Utility-first CSS framework
- **TanStack Query 5.60.5** - Powerful data fetching and caching
- **React Hook Form 7.55.0** - Performant form management
- **Zod 3.24.2** - TypeScript-first schema validation
- **Framer Motion 11.13.1** - Smooth animations and transitions
- **Next Themes 0.4.6** - Advanced theme management (dark/light mode)

### UI Component Library (shadcn/ui - 47 components)
- **Radix UI** - Accessible unstyled component primitives
  - @radix-ui/react-dialog, dropdown-menu, popover, select, tabs, toast
  - @radix-ui/react-accordion, alert-dialog, avatar, checkbox, collapsible
  - @radix-ui/react-context-menu, hover-card, label, menubar, navigation-menu
  - @radix-ui/react-progress, radio-group, scroll-area, separator, slider
  - @radix-ui/react-switch, toggle, toggle-group, tooltip
- **Recharts 2.15.2** - Composable charting library for analytics
- **Lucide React 0.453.0** - Beautiful icon library (1000+ icons)
- **Class Variance Authority 0.7.1** - Component variants utility
- **CMDK 1.1.1** - Command palette/menu
- **Embla Carousel 8.6.0** - Lightweight carousel
- **React Icons 5.4.0** - Popular icon sets
- **React Day Picker 8.10.1** - Date picker component
- **Input OTP 1.4.2** - OTP input component
- **Vaul 1.1.2** - Drawer component
- **Tailwind Merge 2.6.0** - Merge Tailwind classes intelligently
- **Tailwindcss Animate 1.0.7** - Animation utilities

### Backend (Node.js + Express)
- **Node.js 18+** - JavaScript runtime
- **Express 4.21.2** - Web application framework
- **TypeScript 5.6.3** - Type safety on the server
- **Drizzle ORM 0.39.1** - TypeScript ORM for SQL databases
- **Drizzle Zod 0.7.0** - Zod integration for Drizzle
- **@neondatabase/serverless 0.10.4** - Neon PostgreSQL driver

### Authentication & Security
- **jsonwebtoken 9.0.2** - JWT token generation and verification
- **bcryptjs 3.0.3** - Password hashing
- **express-session 1.18.1** - Session management
- **connect-pg-simple 10.0.0** - PostgreSQL session store
- **cookie-parser 1.4.7** - Cookie parsing middleware
- **helmet 7.2.0** - Security headers middleware
- **express-rate-limit 7.1.0** - Rate limiting middleware
- **express-validator 7.0.0** - Input validation
- **nanoid 5.1.6** - Unique ID generation

### PDF & Document Generation
- **pdfkit 0.13.0** - PDF generation library
- **pdfkit-table 0.1.99** - Table support for PDFKit
- **mammoth 1.11.0** - .docx file processing

### Email Services
- **resend 6.4.2** - Modern email API (recommended)
- **nodemailer 6.9.0** - Traditional SMTP email sending

### Data Processing & Utilities
- **Decimal.js 10.6.0** - Precise decimal arithmetic for financial calculations
- **date-fns 3.6.0** - Modern date utility library
- **ExcelJS 4.4.0** - Excel file generation and parsing
- **dotenv 16.4.5** - Environment variable management
- **ws 8.18.0** - WebSocket support

### Development Tools
- **tsx 4.20.5** - TypeScript execution for Node.js
- **esbuild 0.25.0** - Fast JavaScript bundler
- **Playwright 1.40.0** - End-to-end testing framework
- **Drizzle Kit 0.31.4** - Database migration tool
- **@vitejs/plugin-react 4.7.0** - Vite React plugin
- **Autoprefixer 10.4.20** - PostCSS plugin for vendor prefixes
- **PostCSS 8.4.47** - CSS transformations

### Type Definitions (@types packages)
- @types/node, @types/express, @types/react, @types/react-dom
- @types/bcryptjs, @types/jsonwebtoken, @types/nodemailer
- @types/pdfkit, @types/cookie-parser, @types/express-session
- @types/passport, @types/passport-local, @types/ws
- @types/connect-pg-simple

### Infrastructure & Deployment
- **Vercel** - Serverless deployment platform
  - @vercel/node 3.2.29 - Vercel serverless functions
  - @vercel/analytics 1.6.1 - Analytics integration
- **PostgreSQL** - Relational database (Neon/Supabase)
- **Git** - Version control system

### Testing & Quality
- **Playwright** - Cross-browser E2E testing
- **@playwright/test** - Test runner and assertions
- **TypeScript** - Compile-time type checking
- **ESLint** (via config) - Code linting

### Development Experience
- **Replit Plugins** (development mode only)
  - @replit/vite-plugin-cartographer - Code navigation
  - @replit/vite-plugin-dev-banner - Dev mode indicator
  - @replit/vite-plugin-runtime-error-modal - Error overlay

### Performance & Optimization
- **React Resizable Panels 2.1.7** - Split view layouts
- **Memorystore 1.6.7** - In-memory session store (development)
- **bufferutil 4.0.8** - WebSocket buffer utilities (optional dependency)

### Total Package Count
- **109 production dependencies**
- **36 development dependencies**
- **145 total packages**

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** 18+ (LTS recommended)
- **pnpm** package manager (`npm install -g pnpm`)
- **PostgreSQL** database (local installation or cloud service)
- **Git** for version control

### Installation Steps

#### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd QuoteProGen
```

#### 2. Install Dependencies
```bash
pnpm install
```

This installs all frontend and backend dependencies.

#### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/quoteprogen
# For cloud databases (Neon/Supabase), use their connection string

# Session & Security (REQUIRED)
SESSION_SECRET=your-super-secret-key-at-least-32-characters-long

# Email Configuration (Choose one)
# Option 1: Resend (Recommended)
RESEND_API_KEY=re_your_resend_api_key_here

# Option 2: SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application Settings
NODE_ENV=development
PORT=5000

# Optional
FROM_EMAIL=noreply@yourcompany.com
FROM_NAME=QuoteProGen
```

**Generate a secure SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 4. Set Up the Database

**Option A: Local PostgreSQL**
```bash
createdb quoteprogen
```

**Option B: Cloud Database (Recommended)**
1. Create account at [Neon](https://neon.tech) or [Supabase](https://supabase.com)
2. Create a new project
3. Copy the connection string to your `.env` file
4. Make sure to add `?sslmode=require` at the end

#### 5. Initialize Database Schema

```bash
pnpm db:push
```

This creates all necessary tables in your database.

#### 6. Start Development Server

```bash
pnpm dev
```

The application will start on **http://localhost:5000**

#### 7. Create Your First Admin User

1. Open browser to **http://localhost:5000**
2. Click "Sign Up" and create an account
3. **Promote user to admin** using your database tool:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

4. Log out and log back in to activate admin permissions

### Development Commands

```bash
# Development
pnpm dev                    # Start development server (PORT 5000)

# Build & Production
pnpm build                  # Build frontend and backend for production
pnpm build:api              # Build only API serverless function
pnpm start                  # Start production server

# Type Checking & Validation
pnpm check                  # Run TypeScript type checking

# Database Management
pnpm db:push                # Push schema changes to database
pnpm migrate:roles          # Run role migration script

# Testing (Playwright E2E Tests)
pnpm test                   # Run all E2E tests
pnpm test:ui                # Open Playwright Test UI (interactive)
pnpm test:debug             # Run tests in debug mode
pnpm test:report            # Show test report

# Specific Test Suites
pnpm test:analytics         # Run analytics tests
pnpm test:client-management # Run client management tests
pnpm test:pricing           # Run pricing tests
pnpm test:security          # Run security tests (Phase 3)
pnpm test:password-reset    # Run password reset security tests
pnpm test:pdf-and-email     # Run PDF generation and email tests
```

### Available NPM Scripts (Full List)
- `dev` - Development server with hot reload
- `build` - Complete production build (API + frontend)
- `build:api` - Build serverless API bundle
- `start` - Production server
- `check` - TypeScript type checking
- `db:push` - Drizzle schema push to database
- `migrate:roles` - User roles migration
- `test` - Playwright E2E tests
- `test:debug` - Debug mode for tests
- `test:ui` - Interactive test UI
- `test:analytics` - Analytics feature tests
- `test:client-management` - Client management tests
- `test:pricing` - Pricing system tests
- `test:security` - Phase 3 security tests
- `test:password-reset` - Password reset tests
- `test:pdf-and-email` - PDF and email tests
- `test:report` - Show HTML test report

---

## 🚀 Production Deployment

### Deploying to Vercel (Recommended)

#### Step 1: Prepare Your Repository

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### Step 2: Set Up Production Database

Create a PostgreSQL database at [Neon](https://neon.tech) or [Supabase](https://supabase.com) and copy the connection string.

#### Step 3: Deploy to Vercel

1. Visit [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure project:
   - **Framework Preset:** Vite
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist/public`
   - **Install Command:** `pnpm install`

4. **Add Environment Variables:**
   ```
   DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require
   SESSION_SECRET=your-generated-secret-key
   NODE_ENV=production
   RESEND_API_KEY=re_your_key (optional)
   FROM_EMAIL=noreply@yourdomain.com
   FROM_NAME=Your Company Name
   ```

5. Click **Deploy**

#### Step 4: Initialize Production Database

```bash
DATABASE_URL="your-production-database-url" pnpm db:push
```

#### Step 5: Create First Admin User

1. Visit your deployed app URL
2. Sign up for an account
3. Connect to your production database and run:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
   ```

### Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] Database connection works
- [ ] User signup/login works
- [ ] Admin user can access all features
- [ ] Quote PDF generation works
- [ ] Email sending works
- [ ] Mobile responsiveness verified
- [ ] SSL certificate active (https)

---

## 📁 Project Structure

```
QuoteProGen/
├── client/                          # Frontend React application
│   ├── public/                      # Static assets
│   │   ├── logo.png                 # Company logo
│   │   ├── logo.svg
│   │   └── favicon.png             # Browser icon
│   │
│   └── src/
│       ├── App.tsx                  # Main app component with routing
│       ├── main.tsx                 # Entry point
│       ├── index.css                # Global styles
│       │
│       ├── components/              # Reusable UI components
│       │   ├── app-sidebar.tsx      # Top navigation bar
│       │   ├── permission-guard.tsx # Access control wrapper
│       │   ├── theme-toggle.tsx     # Dark/light mode toggle
│       │   ├── activity-log-viewer.tsx  # Audit trail viewer
│       │   ├── keyboard-shortcuts-help.tsx  # Shortcuts overlay
│       │   │
│       │   ├── ui/                  # shadcn/ui components (47 components)
│       │   │   ├── button.tsx       # Button component
│       │   │   ├── card.tsx         # Card layouts
│       │   │   ├── dialog.tsx       # Modal dialogs
│       │   │   ├── form.tsx         # Form components
│       │   │   ├── table.tsx        # Data tables
│       │   │   ├── chart.tsx        # Charts with Recharts
│       │   │   └── ... 40+ more     # Complete UI component library
│       │   │
│       │   ├── quote/               # Quote-specific components
│       │   │   ├── bom-section.tsx  # Bill of Materials
│       │   │   ├── sla-section.tsx  # SLA management
│       │   │   ├── timeline-section.tsx  # Project timeline
│       │   │   └── advanced-sections-display.tsx
│       │   │
│       │   ├── invoice/             # Invoice-specific components
│       │   │   ├── edit-invoice-dialog.tsx
│       │   │   ├── payment-tracker.tsx
│       │   │   ├── master-invoice-manager.tsx
│       │   │   ├── split-wizard.tsx
│       │   │   └── serial-number-entry.tsx
│       │   │
│       │   ├── vendor-po/           # Purchase order components
│       │   │
│       │   ├── admin-settings/      # Admin configuration components
│       │   │   ├── CurrencySettings.tsx
│       │   │   ├── PricingSettings.tsx
│       │   │   ├── TaxSettings.tsx
│       │   │   ├── types.ts
│       │   │   ├── hooks.ts
│       │   │   └── utils.tsx
│       │   │
│       │   └── analytics/           # Analytics components
│       │       └── vendor-analytics-section.tsx
│       │
│       ├── pages/                   # Page components (31 pages)
│       │   ├── dashboard.tsx                    # Main dashboard
│       │   ├── clients.tsx                      # Client list
│       │   ├── client-detail.tsx                # Client profile
│       │   ├── quotes.tsx                       # Quote list
│       │   ├── quote-create.tsx                 # Quote creation/editing
│       │   ├── quote-detail.tsx                 # Quote details
│       │   ├── invoices.tsx                     # Invoice list
│       │   ├── invoice-detail.tsx               # Invoice details
│       │   ├── invoice-collections-dashboard.tsx  # Collections tracking
│       │   ├── analytics.tsx                    # Legacy analytics (kept for reference)
│       │   ├── admin-users.tsx                  # User management
│       │   ├── admin-settings.tsx               # Advanced settings
│       │   ├── admin-configuration.tsx          # System configuration
│       │   ├── vendors.tsx                      # Vendor management
│       │   ├── vendor-pos.tsx                   # Purchase orders list
│       │   ├── vendor-po-detail.tsx             # PO details
│       │   ├── vendor-po-dashboard.tsx          # PO analytics
│       │   ├── products.tsx                     # Products master
│       │   ├── grn-list.tsx                     # Goods received notes
│       │   ├── grn-detail.tsx                   # GRN details
│       │   ├── serial-search.tsx                # Serial number search
│       │   ├── serial-tracking-dashboard.tsx    # Serial tracking
│       │   ├── sales-quote-dashboard.tsx        # Sales pipeline
│       │   ├── governance-dashboard.tsx         # Approvals dashboard
│       │   ├── dashboards-overview.tsx          # Dashboard hub
│       │   ├── numbering-schemes.tsx            # Document numbering config
│       │   ├── login.tsx                        # Authentication
│       │   ├── signup.tsx
│       │   ├── reset-password.tsx
│       │   └── not-found.tsx
│       │
│       ├── hooks/                   # Custom React hooks
│       │   ├── use-toast.ts         # Toast notifications
│       │   ├── use-permissions.ts   # Permission checks
│       │   └── use-mobile.tsx       # Mobile detection
│       │
│       └── lib/                     # Utility functions
│           ├── queryClient.ts       # TanStack Query setup
│           ├── utils.ts             # Helper functions
│           ├── permissions.ts       # Permission utilities
│           ├── permissions-new.ts   # Enhanced permissions
│           ├── auth-context.tsx     # Authentication context
│           └── theme-provider.tsx   # Theme management
│
├── server/                          # Backend Express application
│   ├── index.ts                     # Server entry point
│   ├── routes.ts                    # Main API endpoints (5,559 lines, 126+ routes)
│   ├── analytics-routes.ts          # Analytics endpoints (454 lines)
│   ├── serial-number-routes.ts      # Serial number endpoints
│   ├── reports-routes.ts            # Reporting endpoints
│   ├── db.ts                        # Database connection (Neon PostgreSQL)
│   ├── storage.ts                   # Database query abstraction layer
│   ├── permissions-middleware.ts    # Permission enforcement
│   ├── permissions-service.ts       # Permission logic
│   ├── vite.ts                      # Vite integration
│   │
│   └── services/                    # Business logic services
│       ├── pdf.service.ts                   # Quote PDF generation
│       ├── invoice-pdf.service.ts           # Invoice PDF generation
│       ├── vendor-po-pdf.service.ts         # Vendor PO PDF generation
│       ├── pdf-themes.ts                    # PDF themes (7 professional themes)
│       ├── email.service.ts                 # Email sending (Resend/SMTP)
│       ├── analytics.service.ts             # Analytics calculations
│       ├── pricing.service.ts               # Tax & pricing logic
│       ├── numbering.service.ts             # Document numbering
│       ├── payment-reminder.service.ts      # Payment automation
│       └── document-number-migration.service.ts  # Migration utilities
│
├── shared/                          # Shared code between client/server
│   └── schema.ts                    # Database schema (847 lines, 25+ tables)
│
├── api/                             # Vercel serverless functions
│   ├── index.ts                     # API handler
│   └── bundled.js                   # Bundled API (auto-generated)
│
├── migrations/                      # Database migrations (15 migration files)
│   ├── add_advanced_features.sql
│   ├── add_bank_details_table.sql
│   ├── add_vendors_and_vendor_pos.sql
│   ├── add_products_grn_hierarchy.sql
│   ├── add_tax_rates_payment_terms.sql
│   └── ... more migrations
│
├── scripts/                         # Utility scripts
│   ├── migrate-user-roles.ts
│   ├── fix-products-available-quantity.ts
│   └── print-env.ts
│
├── tests/                           # E2E tests with Playwright
│   └── e2e/
│       ├── analytics.spec.ts
│       ├── client-management.spec.ts
│       ├── client-management-ui.spec.ts
│       ├── client-management-improvements.spec.ts
│       ├── invoice-and-payments.spec.ts
│       ├── password-reset-security.spec.ts
│       ├── pdf-and-email.spec.ts
│       ├── pricing.spec.ts
│       ├── quote-creation.spec.ts
│       ├── phase3-security.spec.ts
│       ├── user-management-edit.spec.ts
│       ├── admin-settings.spec.ts
│       ├── edge-cases-and-validation.spec.ts
│       └── setup.ts
│
├── MD files/                        # Documentation and guides (45+ MD files)
│   ├── DOCUMENTATION_INDEX.md
│   ├── DASHBOARD_REDESIGN_SUMMARY.md
│   ├── CLIENTS_REDESIGN_COMPLETE.md
│   ├── INVOICE_MANAGEMENT_GUIDE.md
│   └── ... extensive documentation
│
├── .env                             # Environment variables (create this)
├── .env.test                        # Test environment variables
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript config
├── vite.config.ts                   # Vite config
├── tailwind.config.ts               # Tailwind CSS config
├── drizzle.config.ts                # Database ORM config
├── vercel.json                      # Vercel deployment config
├── playwright.config.ts             # Test configuration
├── postcss.config.js                # PostCSS config
├── components.json                  # shadcn/ui config
└── README.md                        # This file
```

---

## 📚 API Documentation

### Authentication (8 endpoints)

**POST /api/auth/signup** - Create account
```json
{
  "email": "user@example.com",
  "backupEmail": "backup@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**POST /api/auth/login** - Login
**POST /api/auth/logout** - Logout
**POST /api/auth/refresh** - Refresh access token
**GET /api/auth/me** - Get current user
**POST /api/auth/reset-password** - Request password reset
**POST /api/auth/reset-password-confirm** - Confirm password reset with token

### Users (5 endpoints)

**GET /api/users** - List all users (Admin only)
**POST /api/users** - Create new user (Admin only)
**PATCH /api/users/:id** - Update user role/status/delegation (Admin only)
**DELETE /api/users/:id** - Delete user (Admin only)
**GET /api/users/:id** - Get user details

### Clients (12 endpoints)

**GET /api/clients** - List all clients with pagination and search
**POST /api/clients** - Create client
**GET /api/clients/:id** - Get client details with full profile
**PATCH /api/clients/:id** - Update client
**DELETE /api/clients/:id** - Delete client
**GET /api/clients/:id/tags** - Get client tags
**POST /api/clients/:id/tags** - Add client tag
**DELETE /api/clients/tags/:tagId** - Remove client tag
**GET /api/clients/:id/communications** - Get communication history
**POST /api/clients/:id/communications** - Add communication record
**DELETE /api/clients/communications/:commId** - Delete communication

### Quotes (12 endpoints)

**GET /api/quotes** - List quotes with filtering by status, client, date
**POST /api/quotes** - Create new quote
**GET /api/quotes/:id** - Get quote details with items and client
**PATCH /api/quotes/:id** - Update quote
**DELETE /api/quotes/:id** - Delete quote
**GET /api/quotes/:id/pdf** - Generate quote PDF with theme
**POST /api/quotes/:id/email** - Send quote via email with PDF
**POST /api/quotes/:id/convert-to-invoice** - Convert approved quote to invoice
**POST /api/quotes/:id/create-invoice** - Create invoice from quote
**POST /api/quotes/:id/create-vendor-po** - Create vendor PO from quote
**GET /api/quotes/:id/invoices** - Get all invoices created from quote
**POST /api/quotes/:id/close** - Close quote (paid/cancelled)

### Invoices (18 endpoints)

**GET /api/invoices** - List invoices with filtering by status, client, date
**POST /api/invoices** - Create invoice manually
**GET /api/invoices/:id** - Get invoice details with items and payments
**PATCH /api/invoices/:id** - Update invoice
**DELETE /api/invoices/:id** - Delete invoice
**GET /api/invoices/:id/pdf** - Generate invoice PDF with theme
**POST /api/invoices/:id/email** - Send invoice via email
**POST /api/invoices/:id/payment** - Record invoice payment
**DELETE /api/payment-history/:id** - Delete payment record
**GET /api/invoices/:id/payment-history** - Get payment history
**GET /api/invoices/:id/payment-history-detailed** - Get detailed payment history
**POST /api/invoices/:id/payment-reminder** - Send payment reminder
**POST /api/invoices/:id/overdue-reminder** - Send overdue reminder
**GET /api/invoices/:id/master-summary** - Get master invoice summary
**POST /api/invoices/:id/create-child-invoice** - Create child invoice (milestone billing)
**POST /api/invoices/:masterId/create-child** - Alternative child invoice creation
**PATCH /api/invoices/:id/items/:itemId/serials** - Update serial numbers for invoice item
**POST /api/invoices/:id/items/:itemId/serials/validate** - Validate serial numbers
**GET /api/invoices/:id/serials/permissions** - Check serial number permissions

### Vendors (6 endpoints)

**GET /api/vendors** - List all vendors
**POST /api/vendors** - Create vendor
**GET /api/vendors/:id** - Get vendor details with PO history
**PATCH /api/vendors/:id** - Update vendor
**DELETE /api/vendors/:id** - Delete vendor (cascade deletes POs)
**GET /api/vendors/:id/performance** - Get vendor performance metrics

### Vendor Purchase Orders (8 endpoints)

**GET /api/vendor-pos** - List purchase orders with filtering
**GET /api/vendor-pos/:id** - Get PO details with items and vendor
**POST /api/vendor-pos** - Create PO manually
**PATCH /api/vendor-pos/:id** - Update PO status and details
**DELETE /api/vendor-pos/:id** - Delete PO
**PATCH /api/vendor-pos/:id/items/:itemId/serials** - Update item serial numbers
**GET /api/vendor-pos/:id/pdf** - Generate PO PDF
**POST /api/vendor-pos/:id/email** - Send PO via email to vendor

### Products (6 endpoints)

**GET /api/products** - List products with stock levels
**POST /api/products** - Create product
**GET /api/products/:id** - Get product details with stock history
**PATCH /api/products/:id** - Update product (price, stock, etc.)
**DELETE /api/products/:id** - Delete product
**GET /api/products/:id/serial-numbers** - Get all serial numbers for product

### Goods Received Notes (GRN) (7 endpoints)

**GET /api/grns** - List GRNs with filtering
**POST /api/grns** - Create GRN
**GET /api/grns/:id** - Get GRN details with PO reference
**PATCH /api/grns/:id** - Update GRN inspection status
**DELETE /api/grns/:id** - Delete GRN
**GET /api/grns/:id/serial-numbers** - Get serial numbers from GRN
**POST /api/grns/:id/approve** - Approve GRN after inspection

### Serial Numbers (8 endpoints)

**GET /api/serial-numbers/search** - Search serial numbers by number, status, product
**POST /api/serial-numbers/batch-validate** - Validate multiple serial numbers
**POST /api/serial-numbers/activate** - Activate serial number
**POST /api/serial-numbers/bulk** - Bulk create serial numbers
**GET /api/serial-numbers/:serialNumber** - Get serial number details with full history
**GET /api/serial-numbers/:id/history** - Get movement history
**PATCH /api/serial-numbers/:id/status** - Update serial number status
**DELETE /api/serial-numbers/:id** - Delete serial number

### Templates (8 endpoints)

**GET /api/templates** - List all templates
**GET /api/templates/type/:type** - Get templates by type (quote/invoice/email)
**GET /api/templates/default/:type** - Get default template by type
**GET /api/templates/:id** - Get template details
**POST /api/templates** - Create template
**PATCH /api/templates/:id** - Update template
**DELETE /api/templates/:id** - Delete template
**POST /api/templates/:id/set-default** - Set as default template

### Bank Details (5 endpoints)

**GET /api/bank-details** - List all bank details
**GET /api/bank-details/active** - Get active bank accounts
**POST /api/bank-details** - Add bank account
**PATCH /api/bank-details/:id** - Update bank details
**DELETE /api/bank-details/:id** - Delete bank account

### Settings & Configuration (6 endpoints)

**GET /api/settings** - Get all system settings
**GET /api/settings/:key** - Get specific setting
**POST /api/settings** - Update settings
**POST /api/settings/migrate-document-numbers** - Migrate legacy document numbers
**GET /api/settings/numbering-schemes** - Get document numbering schemes
**POST /api/settings/numbering-schemes** - Update numbering schemes

### Tax Rates (5 endpoints)

**GET /api/tax-rates** - Get all tax rates
**GET /api/tax-rates/region/:region** - Get tax rates by region
**POST /api/tax-rates** - Create tax rate
**PATCH /api/tax-rates/:id** - Update tax rate
**DELETE /api/tax-rates/:id** - Delete tax rate

### Pricing & Currency (10 endpoints)

**GET /api/pricing-tiers** - Get all pricing tiers
**POST /api/pricing-tiers** - Create pricing tier
**PATCH /api/pricing-tiers/:id** - Update pricing tier
**DELETE /api/pricing-tiers/:id** - Delete pricing tier
**POST /api/pricing/calculate-discount** - Calculate tiered discount
**POST /api/pricing/calculate-taxes** - Calculate taxes for amount
**POST /api/pricing/calculate-total** - Calculate full quote/invoice total
**POST /api/pricing/convert-currency** - Convert between currencies
**GET /api/currency-settings** - Get currency configuration
**POST /api/currency-settings** - Update currency settings

### Analytics & Dashboards (15+ endpoints)

**GET /api/analytics/dashboard** - Get main dashboard metrics
**GET /api/analytics/:timeRange** - Get time-based analytics (3, 6, 12, 24 months)
**GET /api/analytics/forecast** - Get revenue forecasting data
**GET /api/analytics/deal-distribution** - Get deal distribution by segment
**GET /api/analytics/regional** - Get regional performance data
**GET /api/analytics/pipeline** - Get sales pipeline metrics
**GET /api/analytics/client/:clientId/ltv** - Get client lifetime value
**GET /api/analytics/vendor-spend** - Get vendor spend analysis
**GET /api/analytics/competitor-insights** - Get competitive analysis
**POST /api/analytics/custom-report** - Generate custom report

**GET /api/analytics/sales-quotes** - Sales & quote dashboard
**GET /api/analytics/vendor-po** - Vendor & procurement dashboard
**GET /api/analytics/invoice-collections** - Collections & receivables dashboard
**GET /api/analytics/serial-tracking** - Serial number tracking dashboard
**GET /api/analytics/governance** - Governance & approvals dashboard

### Activity Logs (3 endpoints)

**GET /api/activity-logs** - Get activity logs with filtering
**GET /api/activity-logs/user/:userId** - Get logs for specific user
**GET /api/activity-logs/entity/:entityType/:entityId** - Get logs for entity

### Total API Coverage
- **126+ REST endpoints** across all modules
- Full CRUD operations for all entities
- Advanced analytics and reporting endpoints
- Comprehensive filtering, sorting, and pagination support

---

## 📊 Database Schema

The application uses **PostgreSQL** with **Drizzle ORM**. The schema includes **25+ tables** spanning 847 lines of code with comprehensive relationships and constraints.

### Authentication & User Management
- **users** - User accounts with roles, passwords, reset tokens, refresh tokens, and delegation fields
  - Supports 6 roles: admin, sales_executive, sales_manager, purchase_operations, finance_accounts, viewer
  - Active/inactive status management
  - Temporary approval delegation with date ranges
- **activity_logs** - Complete audit trail of all user actions with entity tracking

### Core Business Entities
- **clients** - Customer profiles with complete CRM data
  - Billing & shipping addresses
  - GSTIN for tax compliance
  - Client segment categorization (Enterprise, Corporate, Startup, Government, Education)
  - Preferred PDF theme settings
- **quotes** - Quote records with full lifecycle management
  - Version tracking for quote revisions
  - Advanced sections: BOM (Bill of Materials), SLA, Timeline (JSON fields)
  - Validity period tracking
  - Quote closure tracking with closure notes and timestamps
  - Status: draft, sent, approved, rejected, invoiced, closed_paid, closed_cancelled
- **quote_items** - Line items with HSN/SAC codes for GST compliance
- **invoices** - Invoice records with master/child invoice support
  - Master invoice management with status (draft, confirmed, locked)
  - Milestone billing support with milestone descriptions
  - Payment status: pending, partial, paid, overdue
  - Parent-child invoice relationships for split billing
  - Delivery notes tracking
- **invoice_items** - Individual invoice items with serial number support
  - Fulfillment tracking (quantity ordered vs fulfilled)
  - Item status: pending, fulfilled, partial
- **payment_history** - Complete payment records with full audit trail
  - Multiple payment methods supported
  - Transaction ID tracking
  - Notes and payment date tracking
  - Recorded by user tracking

### CRM & Communication
- **client_tags** - Flexible client categorization with custom tags
- **client_communications** - Complete communication history
  - Types: email, call, meeting, note
  - Attachment support (JSON array)
  - User attribution for all communications

### Supply Chain Management
- **vendors** - Vendor database with contact and performance info
  - Payment terms
  - GSTIN for tax compliance
  - Active/inactive status
  - Performance notes
- **vendor_purchase_orders** - POs created from quotes
  - Status: draft, sent, acknowledged, fulfilled, cancelled
  - Expected and actual delivery date tracking
  - Full tax calculation (CGST, SGST, IGST)
  - Terms and conditions
- **vendor_po_items** - PO line items with serial number support
  - Quantity ordered vs received tracking
  - Serial numbers as JSON array
- **products** - Product master database with inventory management
  - SKU and category management
  - Stock quantity, reserved quantity, available quantity
  - Reorder level tracking
  - Serial number requirement flag
  - Warranty months configuration
- **goods_received_notes** - GRN records linked to POs
  - Inspection status tracking (pending, approved, rejected, partial)
  - Quantity ordered, received, and rejected tracking
  - Inspector attribution
  - Batch number and delivery note tracking
  - Attachments support (JSON array)
- **serial_numbers** - Complete serial number tracking with history
  - Status: in_stock, reserved, delivered, returned, defective
  - Warranty start and end date tracking
  - Full traceability through product, vendor, PO, GRN, invoice relationships
  - Location tracking
  - Notes field for additional information

### Configuration & Templates
- **templates** - Reusable document templates
  - Types: quote, invoice, email
  - Styles: professional, modern, minimal
  - Header image and logo URL support
  - Color scheme (JSON)
  - Default template designation
- **bank_details** - Bank account information for payment instructions
  - Multiple banks support
  - IFSC and SWIFT codes
  - Active/inactive status
- **settings** - System configuration key-value store
- **tax_rates** - Regional tax rate management
  - SGST, CGST, IGST rates
  - Region-specific (state codes: IN-AP, IN-KA, etc.)
  - Effective date ranges
  - Active/inactive status
- **payment_terms** - Configurable payment terms
  - Name and description
  - Days until payment due
  - Default designation
- **pricing_tiers** - Tiered pricing with automatic discounts
  - Amount range (min/max)
  - Discount percentage
  - Active/inactive status
- **currency_settings** - Multi-currency support
  - Base currency configuration
  - Supported currencies (JSON array)
  - Exchange rates (JSON object)

### Key Schema Features
- **Comprehensive Relationships** - All tables properly related with foreign keys
- **Cascade Deletes** - Proper cascade behavior for dependent records
- **Timestamp Tracking** - createdAt and updatedAt on all major tables
- **Soft Deletes** - isActive flags for vendors and products
- **JSON Support** - Advanced features stored as JSON (BOM, SLA, Timeline, Serial Numbers, Attachments)
- **Decimal Precision** - Financial fields with proper precision (12, 2)
- **Enum Types** - Type safety for status fields and roles
- **User Attribution** - createdBy, updatedBy, recordedBy tracking throughout
- **Validation** - Zod schemas for all insert operations with comprehensive validation rules

All tables include proper indexes, constraints, and validation rules to ensure data integrity and optimal performance.

---

## 🔧 Customization Guide (For Clients)

### 1. Change Company Logo

Replace these files with your logo:
```
client/public/logo.png          # Main logo (PNG)
client/public/logo.svg          # Vector logo (SVG, recommended)
client/public/favicon.png       # Browser tab icon
```

Then rebuild: `pnpm build`

### 2. Customize Brand Colors

Edit `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#YOUR_COLOR',
      },
    }
  }
}
```

And `client/src/index.css`:
```css
:root {
  --primary: YOUR_COLOR_HSL;
}
```

### 3. Modify PDF Themes

Edit `server/services/pdf-themes.ts`:
```typescript
export const professionalTheme: PDFTheme = {
  colors: {
    primary: '#1a237e',      // Change colors
    secondary: '#5c6bc0',
    // ... more
  },
};
```

### 4. Customize Email Templates

Edit `server/services/email.service.ts`:
```typescript
static async sendWelcomeEmail(to: string, userName: string) {
  const html = `
    <h1>Welcome to Your Company!</h1>
    <p>Your custom message here...</p>
  `;
  // ...
}
```

### 5. Change Quote Number Format

Edit `server/routes.ts`:
```typescript
function generateDocumentNumber(prefix: string, lastNumber: string | undefined) {
  // Modify format here
  return `${prefix}-2024-0001`;  // e.g., QUO-2024-0001
}
```

### 6. Update Tax Rates

Edit `server/services/pricing.service.ts`:
```typescript
private static readonly DEFAULT_CGST_RATE = 9;  // Change from 9%
private static readonly DEFAULT_SGST_RATE = 9;
```

### 7. Add New Database Field

1. Edit `shared/schema.ts` - add field to table
2. Run `pnpm db:push`
3. Update UI forms in `client/src/pages/`

### 8. Add New Page/Route

1. Create page in `client/src/pages/my-page.tsx`
2. Add route in `client/src/App.tsx`
3. Add to sidebar in `client/src/components/app-sidebar.tsx`

### 9. Add New API Endpoint

1. Add route in `server/routes.ts`
2. Add storage method in `server/storage.ts`
3. Call from frontend using TanStack Query

### 10. Switch Email Provider

**For Resend:**
```env
RESEND_API_KEY=re_your_key
```

**For SMTP:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-password
```

---

## 🧪 Testing

QuoteProGen includes comprehensive end-to-end testing with **Playwright**, covering all major features and workflows.

### Test Infrastructure
- **Test Framework:** Playwright 1.40.0
- **Test Suites:** 14 comprehensive test files
- **Coverage:** All major features, security, and edge cases
- **Configuration:** `playwright.config.ts`

### Test Suites

#### Core Functionality Tests
1. **analytics.spec.ts** - Analytics dashboard and reporting features
   - Dashboard metrics calculation
   - Time-based analytics (3, 6, 12, 24 months)
   - Revenue forecasting
   - Deal distribution analytics

2. **client-management.spec.ts** - Client CRUD operations and management
   - Client creation, editing, deletion
   - Client search and filtering
   - Client profile management

3. **client-management-ui.spec.ts** - Client UI interactions
   - UI responsiveness
   - Form validations
   - Real-time updates

4. **client-management-improvements.spec.ts** - Enhanced client features
   - Client tags management
   - Communication history
   - Client segmentation

5. **quote-creation.spec.ts** - Quote creation workflow
   - Quote builder functionality
   - Item management
   - Tax calculations
   - Quote versioning

6. **invoice-and-payments.spec.ts** - Invoice and payment tracking
   - Invoice generation from quotes
   - Payment recording
   - Payment history
   - Master/child invoices
   - Payment reminders

7. **pdf-and-email.spec.ts** - Document generation and delivery
   - PDF generation with themes
   - Email sending functionality
   - Attachment handling

8. **pricing.spec.ts** - Pricing and tax calculations
   - Tax rate calculations (CGST, SGST, IGST)
   - Pricing tiers
   - Discount calculations
   - Currency conversions

#### Security & Compliance Tests
9. **phase3-security.spec.ts** - Security features
   - Permission enforcement
   - Role-based access control
   - Unauthorized access prevention

10. **password-reset-security.spec.ts** - Password reset security
    - Token generation and validation
    - Token expiration
    - Token reuse prevention
    - Secure reset workflow

11. **user-management-edit.spec.ts** - User management
    - User creation and editing
    - Role assignment
    - User delegation
    - Status management

#### Configuration & Edge Cases
12. **admin-settings.spec.ts** - Admin configuration
    - System settings management
    - Bank details configuration
    - Document numbering schemes
    - Tax rate management

13. **edge-cases-and-validation.spec.ts** - Edge case handling
    - Input validation
    - Error handling
    - Boundary conditions
    - Data integrity checks

14. **setup.ts** - Test setup and utilities
    - Test database initialization
    - Test helpers and fixtures
    - Authentication utilities

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test suite
pnpm test tests/e2e/analytics.spec.ts
pnpm test:analytics                    # Analytics tests
pnpm test:client-management            # Client management tests
pnpm test:pricing                      # Pricing tests
pnpm test:security                     # Security tests (Phase 3)
pnpm test:password-reset               # Password reset tests
pnpm test:pdf-and-email                # PDF and email tests

# Interactive debugging
pnpm test:ui                           # Opens Playwright test UI
pnpm test:debug                        # Run tests in debug mode

# View test results
pnpm test:report                       # Show HTML test report
```

### Test Reports

Test results are saved in:
- `playwright-report/` - HTML reports with screenshots
- `test-results/` - Test artifacts and traces
- `test-results 2/` - Additional test results

### Continuous Integration

Tests are designed to run in CI/CD pipelines with:
- Headless browser mode
- Parallel execution support
- Screenshot capture on failure
- Video recording for debugging
- Trace files for deep analysis

### Test Best Practices

✅ **Isolated Test Data** - Each test creates its own test data
✅ **Cleanup** - Tests clean up after themselves
✅ **Idempotent** - Tests can run multiple times safely
✅ **Fast Execution** - Optimized for quick feedback
✅ **Readable** - Clear test names and structure
✅ **Comprehensive** - Cover happy paths and edge cases

---

## 🐛 Troubleshooting

### Database Connection Fails
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql $DATABASE_URL
```

### Port 5000 Already in Use
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Build Errors
```bash
# Clear and rebuild
rm -rf node_modules dist pnpm-lock.yaml
pnpm install
pnpm build
```

### Email Not Sending
- Verify RESEND_API_KEY or SMTP credentials
- Check spam folder
- Check server logs for errors

### TypeScript Errors
```bash
pnpm check
```

---

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

- **Documentation:** Check this README and `/docs` folder
- **Issues:** Create a GitHub issue
- **Email:** support@yourcompany.com

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev/) - UI Library
- [Vite](https://vitejs.dev/) - Build Tool
- [Drizzle ORM](https://orm.drizzle.team/) - Database ORM
- [shadcn/ui](https://ui.shadcn.com/) - Component Library
- [TailwindCSS](https://tailwindcss.com/) - CSS Framework
- [Vercel](https://vercel.com/) - Hosting Platform

---

## 🏗️ Architecture Highlights

### Design Principles
- **Type Safety** - TypeScript throughout (client + server)
- **Database-First** - Drizzle ORM with PostgreSQL for reliability
- **Component-Based** - Reusable React components with shadcn/ui
- **API-Driven** - RESTful API design with 126+ endpoints
- **Permission-Based** - Granular RBAC at API and UI levels
- **Audit Trail** - Complete activity logging for compliance
- **Serverless Ready** - Vercel deployment with edge functions
- **Scalable** - Optimized database queries and caching

### Code Organization
- **Shared Schema** - Single source of truth in `shared/schema.ts`
- **Service Layer** - Business logic separated in `server/services/`
- **Middleware** - Authentication and permission checks centralized
- **Component Library** - 47 reusable UI components
- **Custom Hooks** - React hooks for permissions, toast, mobile detection
- **Type Definitions** - Comprehensive TypeScript types throughout

### Performance Optimizations
- **TanStack Query** - Automatic caching and refetching
- **Optimistic Updates** - Instant UI feedback
- **Pagination** - Large datasets handled efficiently
- **Decimal.js** - Precise financial calculations
- **Database Indexes** - Optimized query performance
- **Lazy Loading** - Components loaded on demand

### Security Measures
- **JWT Authentication** - Secure token-based auth
- **Bcrypt Hashing** - Industry-standard password security
- **HTTP-only Cookies** - XSS protection
- **Helmet.js** - Security headers
- **Rate Limiting** - Brute force protection
- **SQL Injection Prevention** - Parameterized queries
- **Input Validation** - Zod schema validation
- **CORS Configuration** - Cross-origin security

---

**Made with ❤️ for modern businesses**

**Version:** 1.0.0  
**Last Updated:** December 31, 2025  
**Node.js:** 18+  
**Database:** PostgreSQL 14+

