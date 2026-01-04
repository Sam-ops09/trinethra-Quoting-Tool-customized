# Viewer Permission Buttons Fix - Quick Reference

## Changes Summary

### 1. Core Fix: PermissionGuard Component
**File:** `client/src/components/permission-guard.tsx`

**What was wrong:**
- Buttons without `tooltipText` were NOT being disabled for unauthorized users
- Component returned unmodified children if tooltipText was missing

**What's fixed:**
- Now ALWAYS disables buttons when user lacks permission
- Works with or without tooltipText

---

## Buttons Protected by This Fix

### Invoice Detail Page (`invoice-detail.tsx`)
| Button | Protection | Line |
|--------|-----------|------|
| Assign/Edit Serial Numbers (Mobile) | `invoices:edit` | ~907 |
| Assign/Edit Serial Numbers (Desktop) | `invoices:edit` | ~1032 |

### Quote Detail Page (`quote-detail.tsx`)
| Button | Protection | Line |
|--------|-----------|------|
| Send Quote | `quotes:create` | ~367 |

### Quotes List Page (`quotes.tsx`)
| Button | Protection | Line |
|--------|-----------|------|
| Email Quote (Dropdown) | `quotes:view` | ~582 |

---

## Already Protected Buttons (No Changes Needed)

### Invoice-Related
- ✅ Edit Invoice → `invoices:edit`
- ✅ Email Invoice → `invoices:view`
- ✅ Payment Reminder → `payments:view`
- ✅ Update Payment → `payments:create`
- ✅ Create Child Invoice → `invoices:create`
- ✅ Lock Master Invoice → `invoices:lock`
- ✅ Edit Master Invoice Details → `invoices:edit`

### Quote-Related
- ✅ Email Quote (Detail Page) → `quotes:view`
- ✅ Approve Quote → `quotes:approve`
- ✅ Reject Quote → `quotes:cancel`

### Client-Related
- ✅ Create New Quote → `quotes:create`

### Vendor PO-Related
- ✅ Send PO → `vendor-pos:edit`
- ✅ Acknowledge PO → `vendor-pos:edit`
- ✅ Create GRN → `grn:create`
- ✅ Fulfill PO → `vendor-pos:edit`
- ✅ Cancel PO → `vendor-pos:delete`

### GRN-Related
- ✅ Update/Save GRN → `grn:edit`
- ✅ Re-inspect GRN → `grn:edit`

### Vendor-Related
- ✅ Edit Vendor → `vendors:edit`
- ✅ Delete Vendor → `vendors:delete`

---

## Testing the Fix

### For Viewer Users
1. Log in as a Viewer user
2. Navigate to any page with action buttons
3. Verify:
   - Buttons appear greyed out (opacity-50)
   - Cursor shows "not-allowed" (cursor-not-allowed)
   - Buttons don't respond to clicks
   - Tooltip appears on hover (if tooltipText provided)

### For Authorized Users
1. Log in as a user with appropriate permissions (Finance, Operations, Sales, etc.)
2. All buttons should be:
   - Fully visible and colored
   - Clickable and functional
   - Performing expected actions

---

## How PermissionGuard Works

```typescript
<PermissionGuard 
  resource="invoices" 
  action="edit" 
  tooltipText="Only Finance/Accounts can edit"
>
  <Button>Edit Invoice</Button>
</PermissionGuard>
```

### When user HAS permission:
- Button renders normally
- Button is clickable
- Action executes

### When user LACKS permission:
- Button is disabled (disabled={true})
- Button appears greyed out (opacity: 0.5)
- Cursor shows "not-allowed"
- Tooltip shows (if tooltipText provided)
- Button doesn't respond to clicks

---

## Resource & Action Permissions

### Resources
- `invoices` - Invoice management
- `payments` - Payment handling
- `quotes` - Quote management
- `vendor-pos` - Vendor Purchase Orders
- `grn` - Goods Receipt Notes
- `vendors` - Vendor management

### Actions
- `create` - Create new records
- `edit` - Edit/modify records
- `view` - View/read records
- `delete` - Delete records
- `finalize` - Confirm/finalize records
- `lock` - Lock records
- `approve` - Approve records
- `cancel` - Cancel/reject records

---

## Verification Checklist

- [x] PermissionGuard component fixed
- [x] Invoice detail page buttons protected
- [x] Quote detail page buttons protected
- [x] Quotes list page buttons protected
- [x] All other buttons already protected
- [x] No compilation errors
- [x] All changes backward compatible

---

## Implementation Details

### Affected Files
1. `client/src/components/permission-guard.tsx` (Core logic fix)
2. `client/src/pages/invoice-detail.tsx` (2 button wrappers added)
3. `client/src/pages/quote-detail.tsx` (1 button wrapper added)
4. `client/src/pages/quotes.tsx` (1 button wrapper added)

### Total Changes
- **1 core component fix**
- **4 button protections added**
- **0 breaking changes**

---

## Notes

- The fix maintains backward compatibility
- Buttons without tooltipText now work correctly
- Visual feedback (opacity + cursor) provided for all disabled buttons
- Tooltip behavior unchanged (still optional)

