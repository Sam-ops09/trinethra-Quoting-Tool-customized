# User Roles Quick Reference Card

## 6 User Roles Overview

### 1️⃣ **ADMIN** - Administrator ⭐⭐⭐⭐⭐
- **Access**: Full system access
- **Key Tasks**: 
  - Manage all users & assign roles
  - Configure system settings
  - Access complete audit logs
  - Manage all resources (quotes, invoices, POs, GRNs, clients, vendors, products, payments)
- **Cannot**: Nothing - full access

---

### 2️⃣ **SALES_MANAGER** - Sales Manager ⭐⭐⭐⭐
- **Access**: High-level sales & invoice management
- **Key Tasks**:
  - ✅ Create & edit quotes (all statuses)
  - ✅ **APPROVE** quotes
  - ✅ Cancel quotes
  - ✅ Create invoices
  - ✅ Edit invoices
  - ✅ Create & edit clients
  - ✅ Edit serial numbers
- **Cannot**: Finalize invoices, lock invoices, manage users, create GRNs

---

### 3️⃣ **SALES_EXECUTIVE** - Sales Executive ⭐⭐⭐
- **Access**: Quote & client management
- **Key Tasks**:
  - ✅ Create quotes
  - ✅ Edit quotes (only draft/sent status)
  - ✅ Create & edit clients
  - ✅ View invoices & POs
  - ✅ View products & serial numbers
- **Cannot**: Approve quotes, create invoices, edit approved quotes, manage POs

---

### 4️⃣ **PURCHASE_OPERATIONS** - Purchase/Operations ⭐⭐⭐
- **Access**: Supply chain & vendor management
- **Key Tasks**:
  - ✅ Create, edit, delete Vendor POs
  - ✅ Create, edit, delete GRNs
  - ✅ Create & edit vendors
  - ✅ Create & edit products
  - ✅ Update serial numbers
  - ✅ View quotes & invoices
- **Cannot**: Create quotes, approve quotes, create invoices, manage payments

---

### 5️⃣ **FINANCE_ACCOUNTS** - Finance/Accounts ⭐⭐⭐
- **Access**: Invoice & payment management
- **Key Tasks**:
  - ✅ Create invoices
  - ✅ Edit invoices
  - ✅ **FINALIZE** invoices
  - ✅ **LOCK** invoices (prevent edits)
  - ✅ Cancel invoices
  - ✅ Record payments
  - ✅ Edit payments
  - ✅ View quotes & clients
- **Cannot**: Approve quotes, create POs, manage users

---

### 6️⃣ **VIEWER** - Viewer ⭐
- **Access**: Read-only to all resources
- **Key Tasks**:
  - ✅ View all quotes, invoices, POs, GRNs
  - ✅ View all clients, vendors, products, payments
  - ✅ View serial numbers
- **Cannot**: Create, edit, delete anything

---

## Permission Matrix at a Glance

### Quotes
```
Create Quote          → Admin, Sales Manager, Sales Executive
Edit Draft/Sent       → Admin, Sales Manager, Sales Executive
Edit Approved         → Admin, Sales Manager
Approve Quote         → Admin, Sales Manager
Cancel Quote          → Admin, Sales Manager
View Quote            → Admin, Sales Manager, Sales Executive, Purchase Ops, Finance, Viewer
```

### Invoices
```
Create Invoice        → Admin, Sales Manager, Finance
Edit Invoice          → Admin, Sales Manager, Finance
Finalize Invoice      → Admin, Finance
Lock Invoice          → Admin, Finance
Cancel Invoice        → Admin, Finance
View Invoice          → All roles
```

### Vendor POs
```
Create PO             → Admin, Purchase Ops
Edit PO               → Admin, Purchase Ops
Delete PO             → Admin, Purchase Ops
View PO               → Admin, Sales Manager, Purchase Ops, Finance, Viewer
```

### GRNs
```
Create GRN            → Admin, Purchase Ops
Edit GRN              → Admin, Purchase Ops
Delete GRN            → Admin, Purchase Ops
View GRN              → Admin, Sales Manager, Purchase Ops, Finance, Viewer
```

### Payments
```
Record Payment        → Admin, Finance
Edit Payment          → Admin, Finance
Delete Payment        → Admin, Finance
View Payment          → Admin, Sales Manager, Finance, Viewer
```

### Clients/Vendors
```
Create Client         → Admin, Sales Manager, Sales Executive
Edit Client           → Admin, Sales Manager, Sales Executive
Create Vendor         → Admin, Purchase Ops
Edit Vendor           → Admin, Purchase Ops
View Client/Vendor    → All roles (except Sales Exec can't view vendors)
```

### System Admin
```
Manage Users          → Admin only
Manage Settings       → Admin only
View Audit Logs       → Admin only
```

---

## Typical Workflows by Role

### 📈 Sales Executive Workflow
1. **Create** a new quote with client & products
2. **Send** quote to Sales Manager for approval
3. **Wait** for Sales Manager to approve
4. **Monitor** quote status transitions
5. Cannot create invoices (Finance does it)

### ✅ Sales Manager Workflow
1. **Review** quotes from Sales Executives
2. **Approve** or reject quotes
3. **Create** invoices from approved quotes
4. **Monitor** invoice status
5. **Report** to Finance on pending items

### 💵 Finance Workflow
1. **Receive** approved quotes from Sales Manager
2. **Create** invoices with correct amounts & taxes
3. **Send** invoices to clients
4. **Record** payments as received
5. **Finalize** and **lock** invoices for accounting

### 🚚 Operations Workflow
1. **Receive** approved quotes from Sales
2. **Create** Vendor Purchase Orders
3. **Send** POs to vendors
4. **Receive** goods from vendors
5. **Create** GRNs and update serial numbers
6. Provide info to Finance for final invoicing

### 👁️ Viewer Workflow
1. **Monitor** all activities
2. **Report** on status and metrics
3. **Cannot** modify anything
4. Great for management & auditing

---

## Permission Conditions

⚠️ **Conditional Permissions** (require context to be met):

| Role | Permission | Condition |
|------|-----------|-----------|
| Sales Executive | Edit Quote | Quote status = "draft" OR "sent" |
| Finance | Lock Invoice | Invoice status = "finalized" |
| - | - | - |

---

## Access Examples

### ✅ Allowed
- Sales Executive creates a draft quote ✅
- Sales Manager approves the quote ✅
- Finance creates invoice from approved quote ✅
- Operations creates PO from approved quote ✅
- Finance records payment ✅
- Finance locks invoice ✅

### ❌ Not Allowed
- Sales Executive approves their own quote ❌
- Finance creates quote ❌
- Operations creates invoice ❌
- Sales Executive edits approved quote ❌
- Viewer creates anything ❌
- Any role manages other users ❌

---

## Assigning Roles

**Default Role**: All new users start as **Viewer**

**How to Change**:
1. Only **Admin** can change user roles
2. Cannot change your own role
3. Changes are logged for audit

**Recommended Assignments**:
- Sales team → Sales Executive (then promote to Sales Manager)
- Operations team → Purchase Operations
- Accounting team → Finance/Accounts
- Stakeholders → Viewer
- System owner → Admin

---

## Special Notes

### 🔐 Security
- **Viewer** role has NO write access to anything
- **Separation of Duties**: Quote approval ≠ Invoice creation
- **Audit Trail**: All actions logged with user role
- **Status-Based**: Some permissions depend on object status (draft, sent, approved, etc.)

### 📊 Typical Team Size
- **Admins**: 1-2 people
- **Sales Managers**: 1-3 people
- **Sales Executives**: 2-10 people
- **Purchase Ops**: 1-2 people
- **Finance**: 1-3 people
- **Viewers**: 5-20 people

### ⚙️ Implementation
Permissions enforced via:
1. **Middleware** - Checks role on API requests
2. **Service** - Defines all permissions
3. **Database** - Stores role with user

---

## Quick Decision Tree

**What role should I assign?**

```
Does this person need to...

→ Manage system, users, settings?
  └─ YES → Admin
  
→ Approve quotes?
  └─ YES → Sales Manager (also handle invoices)
  └─ NO → Continue...
  
→ Create quotes?
  └─ YES → Sales Executive (or Sales Manager)
  └─ NO → Continue...

→ Create/manage Vendor POs and GRNs?
  └─ YES → Purchase Operations
  └─ NO → Continue...

→ Create/finalize invoices or manage payments?
  └─ YES → Finance/Accounts
  └─ NO → Continue...

→ Just review and monitor?
  └─ YES → Viewer
  └─ NO → Viewer (safest default)
```

---

## Cheat Sheet

| Need To... | Role |
|-----------|------|
| Manage everything | Admin |
| Approve quotes | Sales Manager |
| Create quotes | Sales Manager, Sales Executive |
| Create invoices | Sales Manager, Finance |
| Finalize invoices | Finance |
| Lock invoices | Finance |
| Create Vendor POs | Purchase Operations |
| Create GRNs | Purchase Operations |
| Record payments | Finance |
| See everything (read-only) | Viewer |
| Manage users | Admin only |

---

**Status**: Complete  
**Last Updated**: 2025-12-25  
**Audience**: Admins, Team Leads, System Owners

