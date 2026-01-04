# Vendor PO Permission Fix - Sales Manager Role

## Issue Summary
A sales manager user was encountering a **403 Forbidden** error when attempting to create a vendor purchase order in production. This was happening because the "Create Vendor PO" button was visible to the sales manager, but the server correctly rejected the request due to insufficient permissions.

## Root Cause
The issue was a **mismatch between client-side UI display and server-side permissions**:

### Server-Side Permissions (Correct)
In `/server/permissions-service.ts`, the **sales_manager** role is defined with these vendor PO permissions:
```typescript
sales_manager: {
  permissions: [
    { resource: "vendor_pos", action: "view" },  // ✅ Can view POs
    // ❌ Missing: create, edit, delete
  ]
}
```

### Purchase Operations Role (Correct)
```typescript
purchase_operations: {
  permissions: [
    { resource: "vendor_pos", action: "view" },
    { resource: "vendor_pos", action: "create" },   // ✅ Can create
    { resource: "vendor_pos", action: "edit" },     // ✅ Can edit
    { resource: "vendor_pos", action: "delete" },   // ✅ Can delete
  ]
}
```

### Client-Side UI Issue (Fixed)
In `/client/src/pages/quote-detail.tsx`, the "Create Vendor PO" button was displayed to ALL users who could view approved quotes, without checking for the `vendor-pos` create permission.

**Before:**
```tsx
{quote.status === "approved" && (
  <>
    <Button onClick={() => convertToInvoiceMutation.mutate()}>
      Invoice
    </Button>
    <Button onClick={() => setShowVendorPoDialog(true)}>
      Vendor PO  {/* ❌ Shown to everyone */}
    </Button>
  </>
)}
```

**After:**
```tsx
{quote.status === "approved" && (
  <>
    <Button onClick={() => convertToInvoiceMutation.mutate()}>
      Invoice
    </Button>
    {user && hasPermission(user.role, "vendor-pos", "create") && (
      <Button onClick={() => setShowVendorPoDialog(true)}>
        Vendor PO  {/* ✅ Only shown to authorized users */}
      </Button>
    )}
  </>
)}
```

## Is This Expected Behavior?
**YES**, this is the correct and expected behavior based on the role definitions:

### Role Responsibilities

| Role | View Vendor POs | Create Vendor POs | Purpose |
|------|----------------|-------------------|---------|
| **Sales Manager** | ✅ Yes | ❌ No | Approve quotes, manage sales, view PO status |
| **Purchase/Operations** | ✅ Yes | ✅ Yes | Manage procurement, create & track POs |
| **Admin** | ✅ Yes | ✅ Yes | Full system access |

### Workflow Separation
This permission structure enforces proper **separation of duties**:

1. **Sales Manager** approves quotes
2. **Purchase/Operations** creates vendor POs based on approved quotes
3. **Finance/Accounts** manages invoices and payments

This ensures that:
- Sales team focuses on customer-facing activities
- Procurement team handles vendor relationships
- No single role controls the entire quote-to-cash cycle

## Changes Made

### 1. Updated `/client/src/pages/quote-detail.tsx`
- Added import for `useAuth` and `hasPermission`
- Added user context to component
- Wrapped "Create Vendor PO" button with permission check
- Button now only displays for users with `vendor-pos` create permission

### 2. Verified Other UI Components
- `/client/src/pages/vendor-pos.tsx` - Already using `PermissionGuard` ✅
- `/client/src/components/vendor-po/select-quote-for-po-dialog.tsx` - Protected by parent ✅

## Testing Recommendations

### Test as Sales Manager
1. Login as sales manager
2. Navigate to an approved quote
3. Verify "Create Vendor PO" button is NOT visible
4. Verify ability to view existing vendor POs (read-only)

### Test as Purchase/Operations
1. Login as purchase/operations user
2. Navigate to an approved quote
3. Verify "Create Vendor PO" button IS visible
4. Verify ability to create new vendor POs
5. Verify ability to edit and manage POs

### Test as Admin
1. Login as admin
2. Verify full access to all vendor PO operations

## Related Files
- `/server/permissions-service.ts` - Server-side permission definitions
- `/server/permissions-middleware.ts` - Permission enforcement middleware
- `/server/routes.ts` - Line 3182 - Vendor PO creation endpoint with permission check
- `/client/src/lib/permissions-new.ts` - Client-side permission helpers
- `/client/src/pages/quote-detail.tsx` - Fixed UI permission check
- `/client/src/pages/vendor-pos.tsx` - Already has correct permission guards

## Security Notes
✅ Server-side permissions are enforced regardless of client-side UI
✅ The 403 error was the correct security response
✅ Client-side permission checks improve UX by hiding unauthorized actions
✅ Separation of duties is maintained across roles

## Conclusion
The 403 Forbidden error was **expected and correct** behavior. Sales managers should not be able to create vendor POs - that's the responsibility of the Purchase/Operations team. The fix ensures the UI no longer shows the "Create Vendor PO" button to unauthorized users, preventing confusion and providing a better user experience.

