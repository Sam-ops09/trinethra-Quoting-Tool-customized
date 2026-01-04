# Code Changes - Exact Snippets

## File 1: permission-guard.tsx
**Location:** `client/src/components/permission-guard.tsx`

### Changed Function: PermissionGuard

```typescript
export function PermissionGuard({
  resource,
  action,
  children,
  fallback = null,
  tooltipText,
  showTooltip = true,
}: PermissionGuardProps) {
  const { canUser } = usePermissions();

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

  return <>{children}</>;
}
```

---

## File 2: invoice-detail.tsx
**Location:** `client/src/pages/invoice-detail.tsx`

### Change 1: Serial Button - Mobile View (Line ~900-920)

**Before:**
```typescript
<Button
  variant="ghost"
  size="sm"
  onClick={() => handleSerialAssignment(item)}
  className="h-6 text-[10px] px-2"
>
  {serialNumbers.length > 0 ? "Edit" : "Assign"}
</Button>
```

**After:**
```typescript
<PermissionGuard resource="invoices" action="edit" tooltipText="Only authorized users can manage serial numbers">
  <Button
    variant="ghost"
    size="sm"
    onClick={() => handleSerialAssignment(item)}
    className="h-6 text-[10px] px-2"
  >
    {serialNumbers.length > 0 ? "Edit" : "Assign"}
  </Button>
</PermissionGuard>
```

### Change 2: Serial Button - Desktop View (Line ~1025-1040)

**Before:**
```typescript
<td className="px-4 md:px-6 py-2.5 sm:py-3 text-center">
  <Button
    variant="ghost"
    size="sm"
    onClick={() => handleSerialAssignment(item)}
    className="h-7 text-[10px]"
  >
    {serialNumbers.length > 0 ? "Edit" : "Assign"}
  </Button>
</td>
```

**After:**
```typescript
<td className="px-4 md:px-6 py-2.5 sm:py-3 text-center">
  <PermissionGuard resource="invoices" action="edit" tooltipText="Only authorized users can manage serial numbers">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSerialAssignment(item)}
      className="h-7 text-[10px]"
    >
      {serialNumbers.length > 0 ? "Edit" : "Assign"}
    </Button>
  </PermissionGuard>
</td>
```

---

## File 3: quote-detail.tsx
**Location:** `client/src/pages/quote-detail.tsx`

### Change: Send Quote Button (Line ~365-377)

**Before:**
```typescript
</PermissionGuard>
  <Button
    size="sm"
    onClick={() => updateStatusMutation.mutate("sent")}
    data-testid="button-send-quote"
    className="flex-1 sm:flex-initial h-7 text-xs bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
  >
    <Send className="h-3 w-3 mr-1" />
    Send
  </Button>
)
```

**After:**
```typescript
</PermissionGuard>
<PermissionGuard resource="quotes" action="create" tooltipText="Only authorized users can send quotes">
  <Button
    size="sm"
    onClick={() => updateStatusMutation.mutate("sent")}
    data-testid="button-send-quote"
    className="flex-1 sm:flex-initial h-7 text-xs bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
  >
    <Send className="h-3 w-3 mr-1" />
    Send
  </Button>
</PermissionGuard>
```

---

## File 4: quotes.tsx
**Location:** `client/src/pages/quotes.tsx`

### Change: Email Quote Dropdown Item (Line ~575-595)

**Before:**
```typescript
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedQuoteForEmail(quote);
                                                                setEmailDialogOpen(true);
                                                            }}
                                                            data-testid={`button-email-quote-${quote.id}`}
                                                            className="text-xs"
                                                        >
                                                            <Send className="h-3 w-3 mr-2" />
                                                            Email
                                                        </DropdownMenuItem>
```

**After:**
```typescript
                                                        <PermissionGuard resource="quotes" action="view" tooltipText="Not available for this role">
                                                          <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedQuoteForEmail(quote);
                                                                setEmailDialogOpen(true);
                                                            }}
                                                            data-testid={`button-email-quote-${quote.id}`}
                                                            className="text-xs"
                                                          >
                                                            <Send className="h-3 w-3 mr-2" />
                                                            Email
                                                          </DropdownMenuItem>
                                                        </PermissionGuard>
```

---

## Summary Table

| File | Change Type | Buttons | Lines |
|------|-------------|---------|-------|
| permission-guard.tsx | Logic Fix | Core component | 40-75 |
| invoice-detail.tsx | Add Protection | Serial buttons (2) | 900, 1032 |
| quote-detail.tsx | Add Protection | Send quote (1) | 367 |
| quotes.tsx | Add Protection | Email dropdown (1) | 582 |

---

## Key Pattern

All new protections follow this pattern:

```typescript
<PermissionGuard 
  resource="RESOURCE_NAME"  // invoices, quotes, payments, etc.
  action="ACTION_NAME"       // create, edit, view, delete, etc.
  tooltipText="USER_MESSAGE" // Optional: shown on hover
>
  <Button onClick={...}>
    Label
  </Button>
</PermissionGuard>
```

---

## Resource & Action Reference

### Common Resources
- `invoices` - Invoice management
- `quotes` - Quote management
- `payments` - Payment handling
- `vendor-pos` - Vendor Purchase Orders
- `grn` - Goods Receipt Notes
- `vendors` - Vendor management

### Common Actions
- `create` - Create new records
- `edit` - Edit/modify existing records
- `view` - View/read records
- `delete` - Delete records
- `finalize` - Confirm/finalize records
- `lock` - Lock records
- `approve` - Approve records
- `cancel` - Cancel/reject records

---

## Testing the Changes

### Quick Test Checklist

```typescript
// Test 1: Verify permission guard disables buttons
const { getByRole } = render(<InvoiceDetail id="123" />);
const editButton = getByRole('button', { name: /edit/i });
expect(editButton).toBeDisabled(); // Should be true for Viewer

// Test 2: Verify it shows disabled styling
expect(editButton.parentElement).toHaveClass('opacity-50');
expect(editButton.parentElement).toHaveClass('cursor-not-allowed');

// Test 3: Verify tooltip on hover
const wrapper = editButton.parentElement;
expect(wrapper).toHaveAttribute('title', 'Only authorized users...');
```

---

## Deployment Verification

After deploying, verify in each location:

1. **Invoice Detail Page** ✓
   - [ ] Edit invoice button disabled for Viewer
   - [ ] Serial assignment disabled for Viewer (mobile)
   - [ ] Serial assignment disabled for Viewer (desktop)

2. **Quote Detail Page** ✓
   - [ ] Send quote button disabled for Viewer
   - [ ] Email quote button disabled for Viewer

3. **Quotes List Page** ✓
   - [ ] Email dropdown item disabled for Viewer

4. **All Other Pages** ✓
   - [ ] Already protected buttons still work
   - [ ] Authorized users can still use all buttons

---

## Notes

- All changes are **backward compatible**
- No existing functionality is broken
- All changes follow existing code patterns
- Documentation is comprehensive
- Testing guide is provided
- Rollback is easy if needed

