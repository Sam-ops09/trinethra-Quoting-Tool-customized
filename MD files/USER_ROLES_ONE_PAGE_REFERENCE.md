# Role Capabilities - One Page Reference

## 6 ROLES - ONE PAGE SUMMARY

```
┌──────────────────────────────────────────────────────────────────┐
│                           ADMIN ⭐⭐⭐⭐⭐                        │
│                      (FULL ACCESS - Everything)                  │
├──────────────────────────────────────────────────────────────────┤
│ • Manage all users & assign roles                                │
│ • Configure system settings                                      │
│ • Create/Edit/Delete all resources                               │
│ • Approve quotes                                                 │
│ • Finalize & lock invoices                                       │
│ • View audit logs                                                │
│                                                                  │
│ KEY ACTIONS: ✅ Everything | ❌ Nothing blocked                 │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    SALES_MANAGER ⭐⭐⭐⭐                        │
│               (QUOTE APPROVAL & INVOICE MANAGEMENT)              │
├──────────────────────────────────────────────────────────────────┤
│ ✅ Create quotes                                                 │
│ ✅ Edit quotes (all statuses)                                    │
│ ✅ APPROVE quotes (main responsibility)                          │
│ ✅ Cancel quotes                                                 │
│ ✅ Create invoices                                               │
│ ✅ Edit invoices                                                 │
│ ✅ Create & edit clients                                         │
│ ✅ Edit serial numbers                                           │
│                                                                  │
│ ❌ Finalize invoices (Finance does)                             │
│ ❌ Manage users                                                  │
│ ❌ Manage settings                                               │
│                                                                  │
│ KEY WORKFLOW: Reviews Exec quotes → Approves → Finance invoices │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                  SALES_EXECUTIVE ⭐⭐⭐                         │
│              (CREATE QUOTES & MANAGE CLIENTS)                    │
├──────────────────────────────────────────────────────────────────┤
│ ✅ Create quotes                                                 │
│ ✅ Edit quotes (ONLY draft/sent status)                          │
│ ✅ Create & edit clients                                         │
│ ✅ View invoices                                                 │
│ ✅ View POs & GRNs                                               │
│ ✅ View products                                                 │
│ ✅ View serial numbers                                           │
│                                                                  │
│ ❌ Approve quotes                                                │
│ ❌ Edit approved quotes                                          │
│ ❌ Create invoices                                               │
│ ❌ Create POs                                                    │
│                                                                  │
│ KEY WORKFLOW: Create quote → Send to client → Manager approves  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│               PURCHASE_OPERATIONS ⭐⭐⭐                        │
│              (MANAGE VENDOR POs & GRNs)                          │
├──────────────────────────────────────────────────────────────────┤
│ ✅ Create Vendor POs                                             │
│ ✅ Edit Vendor POs                                               │
│ ✅ Delete Vendor POs                                             │
│ ✅ Create GRNs (Goods Received Notes)                            │
│ ✅ Edit GRNs                                                     │
│ ✅ Delete GRNs                                                   │
│ ✅ Create & edit vendors                                         │
│ ✅ Create & edit products                                        │
│ ✅ Update serial numbers                                         │
│ ✅ View quotes & invoices                                        │
│                                                                  │
│ ❌ Create or approve quotes                                      │
│ ❌ Create invoices                                               │
│ ❌ Finalize invoices                                             │
│                                                                  │
│ KEY WORKFLOW: Get quote → Create PO → Receive goods → Create GRN│
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│               FINANCE_ACCOUNTS ⭐⭐⭐                          │
│         (CREATE & FINALIZE INVOICES, MANAGE PAYMENTS)           │
├──────────────────────────────────────────────────────────────────┤
│ ✅ Create invoices                                               │
│ ✅ Edit invoices                                                 │
│ ✅ FINALIZE invoices (lock core fields)                          │
│ ✅ LOCK invoices (prevent any changes)                           │
│ ✅ Cancel invoices                                               │
│ ✅ Record payments                                               │
│ ✅ Edit payments                                                 │
│ ✅ Delete payments                                               │
│ ✅ View quotes & clients                                         │
│                                                                  │
│ ❌ Approve quotes                                                │
│ ❌ Create POs                                                    │
│ ❌ Manage users                                                  │
│                                                                  │
│ KEY WORKFLOW: Create invoice → Send → Record payment → Finalize │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                       VIEWER ⭐                                 │
│                  (READ-ONLY TO EVERYTHING)                       │
├──────────────────────────────────────────────────────────────────┤
│ ✅ View all quotes                                               │
│ ✅ View all invoices                                             │
│ ✅ View all POs & GRNs                                           │
│ ✅ View all clients & vendors                                    │
│ ✅ View all products                                             │
│ ✅ View all payments                                             │
│ ✅ View serial numbers                                           │
│                                                                  │
│ ❌ Create anything                                               │
│ ❌ Edit anything                                                 │
│ ❌ Delete anything                                               │
│ ❌ Approve anything                                              │
│                                                                  │
│ BEST FOR: Management, directors, auditors, investors            │
└──────────────────────────────────────────────────────────────────┘
```

---

## PERMISSION MATRIX - WHAT CAN WHO DO?

```
                  Admin  Sales  Sales  Purch  Finance Viewer
                         Mgr    Exec   Ops    Accts
Create Quote      ✅     ✅     ✅     ❌     ❌      ❌
Edit Quote        ✅     ✅     ✅*    ❌     ❌      ❌
Approve Quote     ✅     ✅     ❌     ❌     ❌      ❌
View Quote        ✅     ✅     ✅     ✅     ✅      ✅

Create Invoice    ✅     ✅     ❌     ❌     ✅      ❌
Edit Invoice      ✅     ✅     ❌     ❌     ✅      ❌
Finalize Invoice  ✅     ❌     ❌     ❌     ✅      ❌
Lock Invoice      ✅     ❌     ❌     ❌     ✅      ❌
View Invoice      ✅     ✅     ✅     ✅     ✅      ✅

Create PO         ✅     ❌     ❌     ✅     ❌      ❌
Manage PO         ✅     ❌     ❌     ✅     ❌      ❌
View PO           ✅     ✅     ❌     ✅     ✅      ✅

Create GRN        ✅     ❌     ❌     ✅     ❌      ❌
Manage GRN        ✅     ❌     ❌     ✅     ❌      ❌
View GRN          ✅     ✅     ❌     ✅     ✅      ✅

Record Payment    ✅     ❌     ❌     ❌     ✅      ❌
View Payment      ✅     ✅     ❌     ❌     ✅      ✅

Manage Users      ✅     ❌     ❌     ❌     ❌      ❌
Manage Settings   ✅     ❌     ❌     ❌     ❌      ❌

* Sales Exec can edit ONLY draft/sent quotes
```

---

## TEAM ROLES BY DEPARTMENT

```
SALES DEPARTMENT
├─ Sales Manager (1-2)           ← Approves quotes
├─ Sales Executive (2-10)        ← Creates quotes
└─ Sales Support (optional)      ← Viewer

OPERATIONS DEPARTMENT  
└─ Purchase Operations (1-2)     ← Manages POs & GRNs

FINANCE DEPARTMENT
└─ Finance/Accounts (1-3)        ← Creates & finalizes invoices

MANAGEMENT
├─ CEO/Director                  ← Viewer or Admin
├─ CFO                            ← Finance or Admin
└─ Others                         ← Viewer

SYSTEM
└─ System Admin (1)              ← Admin role
```

---

## TYPICAL DAY BY ROLE

### Sales Executive
```
09:00 ─ Create new quote for client ABC
10:30 ─ Modify quote specs after client feedback  
12:00 ─ Send quote to client via system
14:00 ─ Create new client DEF in system
15:30 ─ Check invoice status on approved quotes
16:00 ─ Update quote with revised pricing
```
✅ Can create/edit drafts  |  ⚠️ Must wait for Manager approval

### Sales Manager
```
09:00 ─ Review 5 pending quotes from team
09:30 ─ Approve 3 quotes, request changes for 2
11:00 ─ Create invoices from newly approved quotes
13:00 ─ Answer Sales Exec questions about quote rules
14:30 ─ Monitor quote & invoice pipeline
15:00 ─ Create new client contract
```
✅ Approves quotes  |  ✅ Creates invoices  |  ⚠️ Finance finalizes

### Finance/Accounts
```
09:00 ─ Finalize pending invoices
09:30 ─ Record customer payments received
10:30 ─ Create invoices from approved quotes
12:00 ─ Lock completed invoices for accounting
14:00 ─ Review payment status across clients
15:30 ─ Prepare aging report
```
✅ Finalizes invoices  |  ✅ Records payments  |  ✅ Locks for audit

### Purchase Operations
```
09:00 ─ Create Vendor PO from approved quote
10:00 ─ Send PO to vendor
11:00 ─ Update vendor contact information
14:00 ─ Receive shipment from vendor
14:30 ─ Create GRN in system
15:00 ─ Enter serial numbers for received items
```
✅ Creates & manages POs  |  ✅ Creates GRNs  |  ✅ Updates serials

### Viewer (Management)
```
09:00 ─ Check quote pipeline status
10:00 ─ Review invoice aging report
11:00 ─ Monitor payment receipts
12:00 ─ Check PO fulfillment status
14:00 ─ Dashboard metrics review
15:00 ─ Prepare executive summary
```
✅ View only  |  ❌ Cannot modify anything

---

## KEY PRINCIPLES

### 1️⃣ Separation of Duties
- Quote approval ≠ Quote creation
- Invoice finalization ≠ Invoice creation
- Payment recording ≠ Invoice creation
- **Reason**: Prevents fraud and ensures accuracy

### 2️⃣ Status-Based Permissions
- Draft quotes → Anyone with permission can edit
- Sent quotes → Executive can edit, Manager can edit
- Approved quotes → Only Manager/Admin can edit
- **Reason**: Ensures data consistency

### 3️⃣ Clear Escalation
- Sales Exec → Sales Manager → Finance
- Operations → Separate parallel track
- Admin oversees everything
- **Reason**: Clear reporting structure

### 4️⃣ Audit Trail
- Who did what
- When they did it
- Their role at the time
- What changed
- **Reason**: Compliance & accountability

---

## COMMON SCENARIOS

### ❓ "I want to approve my own quote"
**Answer**: No, only Sales Manager can approve
**Rule**: Separation of duties
**Workaround**: Submit to Manager for approval

### ❓ "I want to edit an approved quote"  
**Answer**: Only if you're Sales Manager or Admin
**Rule**: Approved quotes are frozen
**Workaround**: Manager can edit, or create new quote

### ❓ "I want to finalize my invoice"
**Answer**: Only Finance/Accounts role
**Rule**: Clear financial responsibility
**Workaround**: Ask Finance to finalize

### ❓ "I want to delete an invoice"
**Answer**: Only Admin/Finance can delete
**Rule**: Financial compliance
**Workaround**: Cancel instead of delete, creates audit trail

### ❓ "I want to see all payments"
**Answer**: 
- Finance: ✅ Full view
- Viewer: ✅ View only
- Exec: ❌ Cannot see
**Reason**: Financial confidentiality

---

## PERMISSION LEVELS

```
Level 1: ADMIN                (✅ 100% - Everything)
         └─ Full system access

Level 2: MANAGER ROLES        (✅ 80% - Specialized areas)
         ├─ Sales Manager
         └─ Finance/Accounts

Level 3: SPECIALIST ROLES     (✅ 50% - Specific domains)
         ├─ Sales Executive
         └─ Purchase Operations

Level 4: VIEWER               (✅ 20% - Read-only view)
         └─ View all, modify none
```

---

## HOW TO ASSIGN ROLES

### For New Hire
1. Start as VIEWER
2. After training → Specific role (Exec, Mgr, Ops, Finance)
3. After 3+ months → Consider promotion if performing well
4. Never: Self-assign higher role

### For Promotion
1. Manager recommends promotion
2. Admin reviews and approves
3. Role changed in system
4. Change logged for audit
5. Permissions effective immediately

### For Termination
1. Remove system access
2. Audit final actions
3. Archive data
4. Log all changes
5. Document in exit process

---

## TROUBLESHOOTING

**"I can't do X"**
→ Check your role
→ Check required status for object
→ Ask admin to review permissions

**"Someone did something they shouldn't"**
→ Check audit log
→ Review their role assignment
→ Adjust permissions if needed
→ Consider user training

**"We need a new role"**
→ Current system has 6 defined roles
→ Likely need to use existing role
→ Discuss with admin before creating new role

---

## SECURITY CHECKLIST

- ✅ Users assigned appropriate roles
- ✅ Separation of duties enforced
- ✅ Audit trail enabled
- ✅ Approval workflows working
- ✅ No users with unnecessary high roles
- ✅ Password policies enforced
- ✅ Session timeouts configured
- ✅ Quarterly role audits scheduled

---

**Created**: 2025-12-25  
**Status**: Complete Reference  
**Next Review**: Q1 2026

