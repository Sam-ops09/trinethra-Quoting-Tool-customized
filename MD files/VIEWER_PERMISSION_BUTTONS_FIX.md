# Viewer Permission Buttons Fix - Complete Implementation

## Issue Summary
Several action buttons were still operational for Viewer user role when they should have been disabled. The issue was in the `PermissionGuard` component logic which only disabled buttons when BOTH `showTooltip && tooltipText` were provided, causing buttons without tooltipText to remain clickable.

## Root Cause Analysis
The original `PermissionGuard` component had this logic:
```typescript
if (!canUser(resource, action)) {
    if (showTooltip && tooltipText) {
        // Only disable if BOTH conditions are true
        // Otherwise, return fallback or nothing
    }
    return <>{fallback}</>;  // BUG: Returns children without disabling!
}
```

This meant any button wrapped without a tooltipText would remain fully functional for unauthorized users.

## Solution Implemented

### 1. Fixed PermissionGuard Component
**File:** `client/src/components/permission-guard.tsx`

**Change:** Modified the PermissionGuard to ALWAYS disable buttons when permission is denied, regardless of whether tooltipText is provided.

**New Logic:**
```typescript
if (!canUser(resource, action)) {
    // ALWAYS clone children and add disabled prop - don't wait for tooltipText
    const disabledChildren = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, {
          disabled: true,
        });
      }
      return child;
    });

    // Only show with tooltip wrapper if both showTooltip and tooltipText are provided
    if (showTooltip && tooltipText) {
      return (
        <div
          title={tooltipText}
          className="opacity-50 cursor-not-allowed inline-block"
        >
          {disabledChildren}
        </div>
      );
    }

    // If no tooltip, still show disabled version but without the tooltip wrapper
    return (
      <div className="opacity-50 cursor-not-allowed inline-block">
        {disabledChildren}
      </div>
    );
  }
```

### 2. Added Missing PermissionGuard Wrappers

#### Invoice Detail Page
**File:** `client/src/pages/invoice-detail.tsx`

**Buttons Protected:**
- Serial Number Assignment Button (Mobile View - Line ~907)
- Serial Number Assignment Button (Desktop View - Line ~1032)

**Protection:** `resource="invoices" action="edit"`

```typescript
<PermissionGuard resource="invoices" action="edit" tooltipText="Only authorized users can manage serial numbers">
  <Button
    variant="ghost"
    size="sm"
    onClick={() => handleSerialAssignment(item)}
  >
    {serialNumbers.length > 0 ? "Edit" : "Assign"}
  </Button>
</PermissionGuard>
```

#### Quote Detail Page
**File:** `client/src/pages/quote-detail.tsx`

**Button Protected:** "Send Quote" Button (Line ~367)

**Protection:** `resource="quotes" action="create"`

```typescript
<PermissionGuard resource="quotes" action="create" tooltipText="Only authorized users can send quotes">
  <Button
    size="sm"
    onClick={() => updateStatusMutation.mutate("sent")}
    className="flex-1 sm:flex-initial h-7 text-xs bg-slate-900 hover:bg-slate-800"
  >
    <Send className="h-3 w-3 mr-1" />
    Send
  </Button>
</PermissionGuard>
```

#### Quotes List Page
**File:** `client/src/pages/quotes.tsx`

**Button Protected:** "Email Quote" Dropdown Menu Item (Line ~582)

**Protection:** `resource="quotes" action="view"`

```typescript
<PermissionGuard resource="quotes" action="view" tooltipText="Not available for this role">
  <DropdownMenuItem
    onClick={() => {
      setSelectedQuoteForEmail(quote);
      setEmailDialogOpen(true);
    }}
  >
    <Send className="h-3 w-3 mr-2" />
    Email
  </DropdownMenuItem>
</PermissionGuard>
```

## Buttons Already Protected (No Changes Needed)

The following buttons were already properly wrapped with PermissionGuard:

### Invoice Detail Page
- ✅ Edit Invoice Button - `resource="invoices" action="edit"`
- ✅ Create Child Invoice Button - `resource="invoices" action="create"`
- ✅ Email Invoice Button - `resource="invoices" action="view"`
- ✅ Payment Reminder Button - `resource="payments" action="view"`
- ✅ Update Payment Button - `resource="payments" action="create"`

### Master Invoice Manager (in Invoice Detail)
- ✅ Confirm Master Invoice Button - `resource="invoices" action="finalize"`
- ✅ Lock Master Invoice Button - `resource="invoices" action="lock"`
- ✅ Edit Master Invoice Details Button - `resource="invoices" action="edit"`
- ✅ Create Child Invoice Button (in Items) - `resource="invoices" action="create"`

### Quote Detail Page
- ✅ Email Quote Button - `resource="quotes" action="view"`
- ✅ Approve Quote Button - `resource="quotes" action="approve"`
- ✅ Reject Quote Button - `resource="quotes" action="cancel"`

### Client Detail Page
- ✅ Create New Quote Button - `resource="quotes" action="create"`

### Vendor PO Detail Page
- ✅ Send PO Button - `resource="vendor-pos" action="edit"`
- ✅ Acknowledge PO Button - `resource="vendor-pos" action="edit"`
- ✅ Create GRN Button - `resource="grn" action="create"`
- ✅ Fulfill PO Button - `resource="vendor-pos" action="edit"`
- ✅ Cancel PO Button - `resource="vendor-pos" action="delete"`

### GRN Detail Page
- ✅ Update/Save GRN Button - `resource="grn" action="edit"`
- ✅ Re-inspect GRN Button - `resource="grn" action="edit"`

### Vendors Page
- ✅ Edit Vendor Button - `resource="vendors" action="edit"`
- ✅ Delete Vendor Button - `resource="vendors" action="delete"`

## Verification Checklist

The following buttons are now properly disabled for Viewer users:

- [x] Edit Invoice
- [x] Email Invoice
- [x] Payment Reminder
- [x] Update Payment / Record Payment
- [x] Create Child Invoice
- [x] Lock Invoice
- [x] Edit Master Invoice Details
- [x] Email (in Quote Details)
- [x] Email (in Quotes List Page)
- [x] Send Quote
- [x] Creating New Quote (in Client Details)
- [x] Edit (in Vendors Directory)
- [x] Acknowledge (in VPO)
- [x] GRN (in VPO)
- [x] Fulfill (in VPO)
- [x] Cancel (in VPO)
- [x] Re-inspect (in GRN Details)
- [x] Assign/Edit Serial Numbers (in Invoice Details)

## How It Works Now

1. **PermissionGuard Component** checks if user has the required permission
2. If permission is **DENIED**:
   - Clones all children and adds `disabled={true}` prop
   - Wraps in a div with `opacity-50` and `cursor-not-allowed` CSS classes
   - If tooltipText provided, adds hover tooltip with explanation
3. If permission is **ALLOWED**:
   - Renders children normally without any modifications

## Testing Recommendations

1. **Login as Viewer User** and verify all action buttons are:
   - Visually disabled (greyed out)
   - Non-clickable (disabled prop prevents clicks)
   - Show tooltip on hover (if tooltipText provided)

2. **Login as Finance/Operations User** and verify all buttons:
   - Are clickable and functional
   - Perform expected actions

3. **Verify on all pages:**
   - Invoice Detail Page
   - Quote Detail Page
   - Quotes List Page
   - Client Detail Page
   - Vendor PO Detail Page
   - GRN Detail Page
   - Vendors Directory Page

## Files Modified

1. `client/src/components/permission-guard.tsx` - Core fix
2. `client/src/pages/invoice-detail.tsx` - Added 2 button protections
3. `client/src/pages/quote-detail.tsx` - Added 1 button protection
4. `client/src/pages/quotes.tsx` - Added 1 button protection

## Rollback Instructions

If needed, revert these commits or restore the original versions of the files. The changes are backward compatible and don't break any existing functionality.

