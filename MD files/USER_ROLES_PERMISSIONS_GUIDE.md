# User Roles & Permissions Documentation

## Overview
The system has a role-based access control (RBAC) system with 6 distinct user roles, each with specific permissions for managing quotes, invoices, vendor POs, GRNs, and other resources.

## User Roles Summary

| Role | Name | Level | Primary Function |
|------|------|-------|------------------|
| `admin` | Administrator | ⭐⭐⭐⭐⭐ | Full system access, settings, user management |
| `sales_manager` | Sales Manager | ⭐⭐⭐⭐ | Quote approval, invoice creation |
| `sales_executive` | Sales Executive | ⭐⭐⭐ | Create and edit draft quotes, manage clients |
| `purchase_operations` | Purchase / Operations | ⭐⭐⭐ | Manage Vendor POs and GRNs |
| `finance_accounts` | Finance / Accounts | ⭐⭐⭐ | Create and finalize invoices, manage payments |
| `viewer` | Viewer | ⭐ | Read-only access |

---

## Detailed Role Permissions

### 1. 👨‍💼 Administrator
**Name**: Administrator  
**Access Level**: Full  
**Description**: Full system access - Configure settings, manage users, all operations

#### Permissions:
| Resource | Create | View | Edit | Delete | Approve | Cancel | Finalize | Lock |
|----------|--------|------|------|--------|---------|--------|----------|------|
| Quotes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | - | - |
| Invoices | ✅ | ✅ | ✅ | ✅ | - | ✅ | ✅ | ✅ |
| Vendor POs | ✅ | ✅ | ✅ | ✅ | - | - | - | - |
| GRNs | ✅ | ✅ | ✅ | ✅ | - | - | - | - |
| Clients | ✅ | ✅ | ✅ | ✅ | - | - | - | - |
| Vendors | ✅ | ✅ | ✅ | ✅ | - | - | - | - |
| Products | ✅ | ✅ | ✅ | ✅ | - | - | - | - |
| Payments | ✅ | ✅ | ✅ | ✅ | - | - | - | - |
| Serial Numbers | - | ✅ | ✅ | - | - | - | - | - |
| Users | ✅ | ✅ | ✅ | ✅ | - | - | - | - |
| Settings | - | ✅ | - | - | - | - | - | ✅ |

**Key Capabilities**:
- Manage all system resources
- Create/edit/delete users and assign roles
- Configure system settings
- Approve or cancel quotes
- Finalize and lock invoices
- Full audit trail access

---

### 2. 👔 Sales Manager
**Name**: Sales Manager  
**Access Level**: High  
**Description**: Approve quotes, edit certain fields after approval, manage invoices

#### Permissions:
| Resource | Create | View | Edit | Cancel | Approve | Finalize |
|----------|--------|------|------|--------|---------|----------|
| Quotes | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| Invoices | ✅ | ✅ | ✅ | - | - | - |
| Vendor POs | - | ✅ | - | - | - | - |
| GRNs | - | ✅ | - | - | - | - |
| Clients | ✅ | ✅ | ✅ | - | - | - |
| Products | - | ✅ | - | - | - | - |
| Payments | - | ✅ | - | - | - | - |
| Serial Numbers | - | ✅ | ✅ | - | - | - |

**Key Capabilities**:
- **Quote Management**:
  - Create new quotes
  - Edit quotes (all statuses: draft, sent, acknowledged)
  - Approve quotes (move to approved state)
  - Cancel quotes
  - View all quotes

- **Invoice Management**:
  - Create new invoices from approved quotes
  - Edit invoices (view/modify details)
  - View invoice history and status

- **Client Management**:
  - Create new clients
  - Edit client information
  - View all clients

- **Serial Number Tracking**:
  - View serial numbers
  - Edit serial numbers for items

- **Operational Visibility**:
  - View Vendor POs
  - View GRNs
  - View Payments

**Typical Workflow**:
1. Sales Executive creates draft quote
2. Sales Manager reviews and approves quote
3. Sales Manager or Finance creates invoice from approved quote
4. Finance finalizes invoice

---

### 3. 📊 Sales Executive
**Name**: Sales Executive  
**Access Level**: Medium  
**Description**: Create and edit draft quotes, manage clients, view related operations

#### Permissions:
| Resource | Create | View | Edit | Conditions |
|----------|--------|------|------|-----------|
| Quotes | ✅ | ✅ | ✅ | Only draft & sent status |
| Invoices | - | ✅ | - | - |
| Vendor POs | - | ✅ | - | - |
| Clients | ✅ | ✅ | ✅ | - |
| Products | - | ✅ | - | - |
| Serial Numbers | - | ✅ | - | - |

**Key Capabilities**:
- **Quote Management**:
  - Create new quotes
  - Edit quotes with draft or sent status
  - Cannot edit quotes after sent (needs manager approval)
  - View all quotes
  - Cannot approve quotes (that's manager's role)
  - Cannot cancel quotes

- **Client Management**:
  - Create new clients
  - Edit client details
  - View all clients
  - Add client contacts and addresses

- **Product Viewing**:
  - Browse all available products
  - View product pricing and details

- **Operational Visibility**:
  - View invoices (read-only)
  - View Vendor POs (read-only)
  - View Serial Numbers

**Typical Workflow**:
1. Sales Executive creates and edits draft quote
2. Sales Executive sends quote to client
3. Sales Manager approves the sent quote
4. Awaits Finance to create invoice

---

### 4. 🚚 Purchase / Operations
**Name**: Purchase / Operations  
**Access Level**: Medium  
**Description**: Create and manage Vendor POs and GRNs, track supply chain

#### Permissions:
| Resource | Create | View | Edit | Delete | Manage |
|----------|--------|------|------|--------|--------|
| Vendor POs | ✅ | ✅ | ✅ | ✅ | ✅ |
| GRNs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Quotes | - | ✅ | - | - | - |
| Invoices | - | ✅ | - | - | - |
| Vendors | ✅ | ✅ | ✅ | - | - |
| Products | ✅ | ✅ | ✅ | - | - |
| Serial Numbers | - | ✅ | ✅ | - | - |

**Key Capabilities**:
- **Vendor PO Management**:
  - Create new Vendor Purchase Orders
  - Edit PO details (quantities, items, terms)
  - Delete POs
  - View full PO history and status
  - Track PO status through fulfillment

- **GRN (Goods Received Notes)**:
  - Create GRNs from received items
  - Edit GRN details (quantity received, quality checks)
  - Update serial numbers for received items
  - Track received vs. ordered quantities
  - Manage GRN status

- **Vendor Management**:
  - Create new vendor records
  - Edit vendor details (contact, address, payment terms)
  - View vendor history

- **Product Management**:
  - Create new products (in collaboration with Sales)
  - Edit product details (pricing, specs)
  - View product catalog

- **Supply Chain Visibility**:
  - View quotes (for PO creation)
  - View invoices (for reconciliation)
  - Edit serial numbers (track items received)

**Typical Workflow**:
1. Operations receives approved quote from Sales Manager
2. Operations creates Vendor PO from quote
3. Operations sends PO to vendor
4. Upon delivery, Operations creates GRN
5. Operations updates serial numbers for items received
6. Finance creates final invoice based on GRN

---

### 5. 💰 Finance / Accounts
**Name**: Finance / Accounts  
**Access Level**: Medium-High  
**Description**: Create and finalize invoices, record payments, manage receivables

#### Permissions:
| Resource | Create | View | Edit | Delete | Finalize | Lock |
|----------|--------|------|------|--------|----------|------|
| Invoices | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Payments | ✅ | ✅ | ✅ | ✅ | - | - |
| Quotes | - | ✅ | - | - | - | - |
| Clients | - | ✅ | - | - | - | - |
| Serial Numbers | - | ✅ | - | - | - | - |

**Key Capabilities**:
- **Invoice Management**:
  - Create invoices from approved quotes
  - Edit invoice details (amounts, taxes, terms)
  - Finalize invoices (move to finalized state)
  - Lock invoices (prevent further edits after finalization)
  - Cancel invoices if needed
  - View all invoices and payment status

- **Payment Management**:
  - Record payments received
  - Update payment status
  - Add payment details (date, amount, method)
  - Delete payment records if needed
  - Track outstanding receivables

- **Financial Visibility**:
  - View approved quotes (for invoicing)
  - View client information (for billing)
  - Track serial numbers (for asset management)

- **Audit Compliance**:
  - Lock invoices for compliance
  - Maintain complete invoice history
  - Record all payment transactions

**Typical Workflow**:
1. Finance receives approved quote from Sales Manager
2. Finance creates invoice with quantities and pricing
3. Finance calculates taxes and totals
4. Finance sends invoice to client
5. Upon payment receipt, Finance records payment
6. Finance finalizes and locks invoice for accounting

---

### 6. 👁️ Viewer
**Name**: Viewer  
**Access Level**: Low  
**Description**: Read-only access to most resources

#### Permissions:
| Resource | View |
|----------|------|
| Quotes | ✅ |
| Invoices | ✅ |
| Vendor POs | ✅ |
| GRNs | ✅ |
| Clients | ✅ |
| Vendors | ✅ |
| Products | ✅ |
| Payments | ✅ |
| Serial Numbers | ✅ |

**Key Capabilities**:
- View all quotes (cannot create/edit/approve)
- View all invoices (cannot finalize/lock)
- View Vendor POs (read-only)
- View GRNs (read-only)
- View all clients and vendors
- View product catalog
- View payment records
- View serial number tracking

**Typical Use Cases**:
- **Management/Directors**: High-level visibility without operational access
- **Auditors**: Review records and compliance
- **New Team Members**: Onboarding/training access
- **Consultants/Contractors**: Temporary view-only access

---

## Role Comparison Matrix

### Quote Management
| Action | Admin | Sales Manager | Sales Executive | Purchase Ops | Finance | Viewer |
|--------|-------|---------------|-----------------|--------------|---------|--------|
| Create Quote | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Quote | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Draft/Sent | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Approved | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve Quote | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Cancel Quote | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Invoice Management
| Action | Admin | Sales Manager | Sales Executive | Purchase Ops | Finance | Viewer |
|--------|-------|---------------|-----------------|--------------|---------|--------|
| Create Invoice | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| View Invoice | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Invoice | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Finalize Invoice | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Lock Invoice | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Cancel Invoice | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |

### Vendor PO Management
| Action | Admin | Sales Manager | Sales Executive | Purchase Ops | Finance | Viewer |
|--------|-------|---------------|-----------------|--------------|---------|--------|
| Create PO | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View PO | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Edit PO | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Delete PO | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |

### GRN Management
| Action | Admin | Sales Manager | Sales Executive | Purchase Ops | Finance | Viewer |
|--------|-------|---------------|-----------------|--------------|---------|--------|
| Create GRN | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View GRN | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Edit GRN | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Delete GRN | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |

### Payment Management
| Action | Admin | Sales Manager | Sales Executive | Purchase Ops | Finance | Viewer |
|--------|-------|---------------|-----------------|--------------|---------|--------|
| View Payment | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Record Payment | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Edit Payment | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Delete Payment | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |

### Client/Vendor Management
| Action | Admin | Sales Manager | Sales Executive | Purchase Ops | Finance | Viewer |
|--------|-------|---------------|-----------------|--------------|---------|--------|
| Create Client | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Client | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Vendor | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Edit Vendor | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View Client/Vendor | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### System Administration
| Action | Admin | Sales Manager | Sales Executive | Purchase Ops | Finance | Viewer |
|--------|-------|---------------|-----------------|--------------|---------|--------|
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Audit Logs | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Typical Organization Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMINISTRATOR                           │
│  • System Configuration • User Management • Audit           │
└─────────────────────────────────────────────────────────────┘
        │
        ├── SALES TEAM
        │   ├─ Sales Manager (Approves quotes)
        │   └─ Sales Executives (Create quotes)
        │
        ├── OPERATIONS TEAM
        │   └─ Purchase / Operations (Manages POs & GRNs)
        │
        ├── FINANCE TEAM
        │   └─ Finance / Accounts (Manages invoices & payments)
        │
        └── MANAGEMENT
            └─ Viewers (Read-only access)
```

---

## Permission Conditions

Some permissions have **conditions** that must be met:

### Sales Executive - Quote Edit
- **Condition**: Quote status must be "draft" OR "sent"
- **Implication**: Cannot edit quotes after Sales Manager approves them

### Finance - Invoice Lock
- **Condition**: Invoice must be finalized
- **Implication**: Can lock finalized invoices to prevent accidental changes

---

## Security Principles

1. **Least Privilege**: Each role has minimum necessary permissions
2. **Separation of Duties**: Key actions separated between roles:
   - Quote approval ≠ Invoice creation
   - Invoice finalization ≠ Payment recording
   - PO creation ≠ Invoice finalization

3. **Audit Trail**: All actions logged with user role and timestamp
4. **Status-Based Access**: Some permissions depend on object status
5. **Role Hierarchy**: Admin > Manager > Specialist > Viewer

---

## Common Access Patterns

### Complete Quote-to-Invoice Workflow
```
1. Sales Executive creates draft quote
   ↓
2. Sales Manager approves quote
   ↓
3. Finance creates invoice from approved quote
   ↓
4. Finance finalizes invoice
   ↓
5. Finance records payment
   ↓
6. Finance locks invoice for accounting
```

### Complete PO-to-Invoice Workflow
```
1. Operations creates Vendor PO from approved quote
   ↓
2. Operations sends PO to vendor
   ↓
3. Vendor delivers items
   ↓
4. Operations creates GRN and updates serial numbers
   ↓
5. Finance creates invoice from GRN
   ↓
6. Finance records payment from vendor
```

---

## API Access

Permissions are enforced through:
- **Middleware**: `permissions-middleware.ts` - Checks role on every API call
- **Service**: `permissions-service.ts` - Defines all role permissions
- **Decorators**: `@RequireRole()` - Protects specific endpoints

### Example: Creating an Invoice
```typescript
// Only Finance/Accounts role can create invoices
POST /api/invoices
Authorization: Bearer <token>
```

If user role doesn't have permission:
```json
{
  "error": "Insufficient permissions",
  "requiredRole": "finance_accounts",
  "userRole": "sales_executive"
}
```

---

## Default Role Assignment

- **New Users**: Created with "viewer" role by default
- **Admin Setup**: Administrator changes role as needed
- **No Self-Promotion**: Users cannot change their own role

---

## Best Practices

1. **Assign Minimal Roles**: Start with viewer, escalate as needed
2. **Regular Audits**: Review user role assignments quarterly
3. **Separation of Duties**: Avoid giving same person both approval and execution roles
4. **Temporary Access**: Use expiring sessions for contractors/consultants
5. **Monitor Changes**: Log all role modifications for compliance

