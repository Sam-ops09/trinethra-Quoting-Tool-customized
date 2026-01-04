# PHASE 1 Implementation - Role-Based UI Guide

## What Was Already Implemented

✅ **PermissionGuard Component** - `/client/src/components/PermissionGuard.tsx`
✅ **Database Delegation Fields** - Migration created
✅ **Delegation Endpoints** - Created in routes.ts
✅ **Bulk Operations** - Created in bulk-operations.ts
✅ **Permissions Service** - Updated with bulk functions

---

## What Still Needs To Be Done - Frontend UI Integration

### Step 1: Update Quotes List Page

**File**: `client/src/pages/quotes-list.tsx`

Find the "Create Quote" button and wrap it with PermissionGuard:

```typescript
// Add import at top
import { PermissionGuard } from "@/components/PermissionGuard";

// Find the Create Quote button and wrap it:
<PermissionGuard 
  resource="quotes" 
  action="create"
  tooltipText="Only Sales Executives and Sales Managers can create quotes"
>
  <Button onClick={() => router.push("/quotes/create")}>
    <Plus className="mr-2 h-4 w-4" />
    Create Quote
  </Button>
</PermissionGuard>
```

---

### Step 2: Update Quote Detail Page

**File**: `client/src/pages/quote-detail.tsx`

Wrap the Approve button:

```typescript
import { PermissionGuard } from "@/components/PermissionGuard";

// Find Approve button and wrap:
<PermissionGuard 
  resource="quotes" 
  action="approve"
  tooltipText="Only Sales Managers can approve quotes"
>
  <Button onClick={() => handleApprove()}>
    <Check className="mr-2 h-4 w-4" />
    Approve Quote
  </Button>
</PermissionGuard>
```

---

### Step 3: Update Invoices List Page

**File**: `client/src/pages/invoices-list.tsx`

```typescript
import { PermissionGuard } from "@/components/PermissionGuard";

// Wrap Create Invoice button
<PermissionGuard 
  resource="invoices" 
  action="create"
  tooltipText="Only Sales Managers and Finance can create invoices"
>
  <Button onClick={() => router.push("/invoices/create")}>
    <Plus className="mr-2 h-4 w-4" />
    Create Invoice
  </Button>
</PermissionGuard>
```

---

### Step 4: Update Invoice Detail Page

**File**: `client/src/pages/invoice-detail.tsx`

```typescript
import { PermissionGuard } from "@/components/PermissionGuard";

// Finalize button
<PermissionGuard 
  resource="invoices" 
  action="finalize"
  tooltipText="Only Finance/Accounts can finalize invoices"
>
  <Button onClick={() => handleFinalize()}>
    <Check className="mr-2 h-4 w-4" />
    Finalize Invoice
  </Button>
</PermissionGuard>

// Lock button
<PermissionGuard 
  resource="invoices" 
  action="lock"
  tooltipText="Only Finance/Accounts can lock invoices"
>
  <Button onClick={() => handleLock()}>
    <Lock className="mr-2 h-4 w-4" />
    Lock Invoice
  </Button>
</PermissionGuard>
```

---

### Step 5: Update Vendor POs List Page

**File**: `client/src/pages/vendor-pos-list.tsx`

```typescript
import { PermissionGuard } from "@/components/PermissionGuard";

<PermissionGuard 
  resource="vendor-pos" 
  action="create"
  tooltipText="Only Purchase/Operations can create Vendor POs"
>
  <Button onClick={() => router.push("/vendor-pos/create")}>
    <Plus className="mr-2 h-4 w-4" />
    Create PO
  </Button>
</PermissionGuard>
```

---

### Step 6: Update Vendor POs Detail Page

**File**: `client/src/pages/vendor-po-detail.tsx`

```typescript
import { PermissionGuard } from "@/components/PermissionGuard";

// Edit buttons
<PermissionGuard 
  resource="vendor-pos" 
  action="edit"
  tooltipText="Only Purchase/Operations can edit Vendor POs"
>
  <Button onClick={() => setIsEditing(true)}>
    <Edit className="mr-2 h-4 w-4" />
    Edit PO
  </Button>
</PermissionGuard>

// Delete button
<PermissionGuard 
  resource="vendor-pos" 
  action="delete"
  tooltipText="Only Purchase/Operations can delete Vendor POs"
>
  <Button variant="destructive" onClick={() => handleDelete()}>
    <Trash className="mr-2 h-4 w-4" />
    Delete PO
  </Button>
</PermissionGuard>
```

---

### Step 7: Update Clients List Page

**File**: `client/src/pages/clients-list.tsx`

```typescript
import { PermissionGuard } from "@/components/PermissionGuard";

<PermissionGuard 
  resource="clients" 
  action="create"
  tooltipText="Only Sales Executives, Managers, and Admins can create clients"
>
  <Button onClick={() => router.push("/clients/create")}>
    <Plus className="mr-2 h-4 w-4" />
    Add Client
  </Button>
</PermissionGuard>
```

---

### Step 8: Update GRN Pages

**File**: `client/src/pages/grn-list.tsx` and `client/src/pages/grn-detail.tsx`

```typescript
import { PermissionGuard } from "@/components/PermissionGuard";

// Create GRN
<PermissionGuard 
  resource="grn" 
  action="create"
  tooltipText="Only Purchase/Operations can create GRNs"
>
  <Button onClick={() => router.push("/grn/create")}>
    <Plus className="mr-2 h-4 w-4" />
    Create GRN
  </Button>
</PermissionGuard>
```

---

## Implementation Pattern

All PermissionGuard implementations follow this pattern:

```typescript
<PermissionGuard 
  resource="resource_name"      // matches permission definition
  action="action_name"           // view, create, edit, delete, approve, etc.
  tooltipText="Help message"     // shown on hover when user doesn't have permission
>
  <Button onClick={handler}>
    Icon + Label
  </Button>
</PermissionGuard>
```

---

## Testing the Implementation

After implementing PermissionGuard in all pages:

### Test with Different Roles

1. **Login as Viewer**
   - Should see NO create buttons
   - Should see NO approve/edit buttons
   - Should see NO delete buttons
   - Should see everything as view-only

2. **Login as Sales Executive**
   - Should see Create Quote button ✓
   - Should NOT see Approve button ✗
   - Should see Create Client button ✓
   - Should NOT see Create Invoice button ✗

3. **Login as Sales Manager**
   - Should see Create Quote button ✓
   - Should see Approve button ✓
   - Should see Create Invoice button ✓
   - Should NOT see Create PO button ✗

4. **Login as Finance/Accounts**
   - Should NOT see Create Quote button ✗
   - Should see Create Invoice button ✓
   - Should see Finalize button ✓
   - Should see Lock button ✓

5. **Login as Purchase/Operations**
   - Should see Create PO button ✓
   - Should see Create GRN button ✓
   - Should NOT see Create Invoice button ✗

6. **Login as Admin**
   - Should see ALL buttons ✓

---

## Estimated Time

- Finding all action buttons: 1 hour
- Wrapping with PermissionGuard: 1-2 hours
- Testing all roles: 30 minutes
- **Total: 2-3 hours**

---

## Checklist for Implementation

- [ ] Import PermissionGuard in quotes-list.tsx
- [ ] Wrap Create Quote button
- [ ] Import in quote-detail.tsx
- [ ] Wrap Approve button
- [ ] Import in invoices-list.tsx
- [ ] Wrap Create Invoice button
- [ ] Import in invoice-detail.tsx
- [ ] Wrap Finalize button
- [ ] Wrap Lock button
- [ ] Import in vendor-pos-list.tsx
- [ ] Wrap Create PO button
- [ ] Import in vendor-po-detail.tsx
- [ ] Wrap Edit button
- [ ] Wrap Delete button
- [ ] Import in clients-list.tsx
- [ ] Wrap Create Client button
- [ ] Import in grn-list.tsx and grn-detail.tsx
- [ ] Wrap Create GRN buttons
- [ ] Test with Viewer role
- [ ] Test with Sales Executive role
- [ ] Test with Sales Manager role
- [ ] Test with Finance/Accounts role
- [ ] Test with Purchase/Operations role
- [ ] Test with Admin role
- [ ] Verify tooltips appear on hover
- [ ] Verify correct buttons are hidden for each role

---

## Files That Have Been Completed

✅ `client/src/components/PermissionGuard.tsx` - Component created
✅ `shared/schema.ts` - Delegation fields added
✅ `migrations/0015_add_delegation_fields.sql` - Migration created
✅ `server/permissions-service.ts` - Bulk operations and delegation logic added
✅ `server/routes.ts` - Delegation API endpoints added
✅ `server/bulk-operations.ts` - Bulk operations endpoints created

---

## Files Still Needing Updates

⏳ `client/src/pages/quotes-list.tsx` - Wrap Create button
⏳ `client/src/pages/quote-detail.tsx` - Wrap Approve button
⏳ `client/src/pages/invoices-list.tsx` - Wrap Create button
⏳ `client/src/pages/invoice-detail.tsx` - Wrap Finalize/Lock buttons
⏳ `client/src/pages/vendor-pos-list.tsx` - Wrap Create button
⏳ `client/src/pages/vendor-po-detail.tsx` - Wrap Edit/Delete buttons
⏳ `client/src/pages/clients-list.tsx` - Wrap Create button
⏳ `client/src/pages/grn-list.tsx` - Wrap Create button
⏳ `client/src/pages/grn-detail.tsx` - Wrap Edit buttons

---

## Next Steps

1. Go through each file listed above
2. Find action buttons
3. Import PermissionGuard
4. Wrap the button with PermissionGuard
5. Test with different roles

---

**Note**: The backend is 100% ready. Only the frontend UI still needs to be updated.

