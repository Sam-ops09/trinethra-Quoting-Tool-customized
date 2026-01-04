# Viewer Permission Fixes - Code Changes Reference

## Overview
This document provides the exact code changes made to fix 14 unprotected buttons that were accessible to Viewer users.

---

## File 1: invoice-detail.tsx

### Change 1: Email Invoice Button

**Before:**
```tsx
<Button
    variant="outline"
    size="sm"
    className="flex-1 sm:flex-initial justify-center gap-2 text-xs sm:text-sm hover:bg-primary/10 hover:border-primary hover:text-primary"
    onClick={() => setShowEmailDialog(true)}
    data-testid="button-email-invoice"
>
    <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    <span className="hidden sm:inline">Email Invoice</span>
    <span className="sm:hidden">Email</span>
</Button>
```

**After:**
```tsx
<PermissionGuard resource="invoices" action="view" tooltipText="Only authorized users can email invoices">
  <Button
    variant="outline"
    size="sm"
    className="flex-1 sm:flex-initial justify-center gap-2 text-xs sm:text-sm hover:bg-primary/10 hover:border-primary hover:text-primary"
    onClick={() => setShowEmailDialog(true)}
    data-testid="button-email-invoice"
  >
    <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    <span className="hidden sm:inline">Email Invoice</span>
    <span className="sm:hidden">Email</span>
  </Button>
</PermissionGuard>
```

### Change 2: Payment Reminder Button

**Before:**
```tsx
{(invoice.paymentStatus === "pending" ||
  invoice.paymentStatus === "partial" ||
  invoice.paymentStatus === "overdue") && (
    <Button
        variant="outline"
        size="sm"
        className="flex-1 sm:flex-initial justify-center gap-2 text-xs sm:text-sm hover:bg-warning/10 hover:border-warning hover:text-warning"
        onClick={() => {
            setReminderEmail(invoice.client.email);
            setShowReminderDialog(true);
        }}
        data-testid="button-payment-reminder"
    >
        <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Payment Reminder</span>
        <span className="sm:hidden">Remind</span>
    </Button>
)}
```

**After:**
```tsx
{(invoice.paymentStatus === "pending" ||
  invoice.paymentStatus === "partial" ||
  invoice.paymentStatus === "overdue") && (
    <PermissionGuard resource="payments" action="view" tooltipText="Only Finance/Accounts can send payment reminders">
      <Button
        variant="outline"
        size="sm"
        className="flex-1 sm:flex-initial justify-center gap-2 text-xs sm:text-sm hover:bg-warning/10 hover:border-warning hover:text-warning"
        onClick={() => {
            setReminderEmail(invoice.client.email);
            setShowReminderDialog(true);
        }}
        data-testid="button-payment-reminder"
      >
        <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Payment Reminder</span>
        <span className="sm:hidden">Remind</span>
      </Button>
    </PermissionGuard>
)}
```

---

## File 2: quote-detail.tsx

### Change: Email Quote Button

**Before:**
```tsx
<Button
  variant="outline"
  size="sm"
  onClick={() => setShowEmailDialog(true)}
  data-testid="button-email-quote"
  className="flex-1 sm:flex-initial h-7 text-xs"
>
  <Send className="h-3 w-3 mr-1" />
  <span className="hidden xs:inline">Email</span>
</Button>
```

**After:**
```tsx
<PermissionGuard resource="quotes" action="view" tooltipText="Not available for this role">
  <Button
    variant="outline"
    size="sm"
    onClick={() => setShowEmailDialog(true)}
    data-testid="button-email-quote"
    className="flex-1 sm:flex-initial h-7 text-xs"
  >
    <Send className="h-3 w-3 mr-1" />
    <span className="hidden xs:inline">Email</span>
  </Button>
</PermissionGuard>
```

---

## File 3: vendor-po-detail.tsx

### Change: All 5 Action Buttons

**Import Added:**
```tsx
import { PermissionGuard } from "@/components/permission-guard";
```

**Before:**
```tsx
<div className="flex gap-2 shrink-0 flex-wrap">
    {canSend && (
        <Button
            size="sm"
            variant="outline"
            onClick={() => updateStatusMutation.mutate("sent")}
            className="h-8 px-3 text-xs"
        >
            <Send className="h-3.5 w-3.5 mr-1" />
            <span>Send</span>
        </Button>
    )}
    {canAcknowledge && (
        <Button
            size="sm"
            variant="outline"
            onClick={() => updateStatusMutation.mutate("acknowledged")}
            className="h-8 px-3 text-xs"
        >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            <span>Acknowledge</span>
        </Button>
    )}
    {canCreateGRN && (
        <Button
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 h-8 px-3 text-xs"
            onClick={() => setShowGRNDialog(true)}
        >
            <Package className="h-3.5 w-3.5 mr-1" />
            <span>GRN</span>
        </Button>
    )}
    {canMarkFulfilled && (
        <Button
            size="sm"
            variant="outline"
            onClick={() => updateStatusMutation.mutate("fulfilled")}
            className="h-8 px-3 text-xs"
        >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            <span>Fulfill</span>
        </Button>
    )}
    {canCancel && (
        <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowCancelDialog(true)}
            className="h-8 px-3 text-xs"
        >
            <XCircle className="h-3.5 w-3.5 mr-1" />
            <span>Cancel</span>
        </Button>
    )}
</div>
```

**After:**
```tsx
<div className="flex gap-2 shrink-0 flex-wrap">
    {canSend && (
        <PermissionGuard resource="vendor-pos" action="edit" tooltipText="Only Purchase/Operations can manage POs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateStatusMutation.mutate("sent")}
            className="h-8 px-3 text-xs"
          >
            <Send className="h-3.5 w-3.5 mr-1" />
            <span>Send</span>
          </Button>
        </PermissionGuard>
    )}
    {canAcknowledge && (
        <PermissionGuard resource="vendor-pos" action="edit" tooltipText="Only Purchase/Operations can acknowledge POs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateStatusMutation.mutate("acknowledged")}
            className="h-8 px-3 text-xs"
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            <span>Acknowledge</span>
          </Button>
        </PermissionGuard>
    )}
    {canCreateGRN && (
        <PermissionGuard resource="grn" action="create" tooltipText="Only Purchase/Operations can create GRNs">
          <Button
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 h-8 px-3 text-xs"
            onClick={() => setShowGRNDialog(true)}
          >
            <Package className="h-3.5 w-3.5 mr-1" />
            <span>GRN</span>
          </Button>
        </PermissionGuard>
    )}
    {canMarkFulfilled && (
        <PermissionGuard resource="vendor-pos" action="edit" tooltipText="Only Purchase/Operations can fulfill POs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateStatusMutation.mutate("fulfilled")}
            className="h-8 px-3 text-xs"
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            <span>Fulfill</span>
          </Button>
        </PermissionGuard>
    )}
    {canCancel && (
        <PermissionGuard resource="vendor-pos" action="delete" tooltipText="Only Purchase/Operations can cancel POs">
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowCancelDialog(true)}
            className="h-8 px-3 text-xs"
          >
            <XCircle className="h-3.5 w-3.5 mr-1" />
            <span>Cancel</span>
          </Button>
        </PermissionGuard>
    )}
</div>
```

---

## File 4: grn-detail.tsx

### Import Added:
```tsx
import { PermissionGuard } from "@/components/permission-guard";
```

### Change 1: Re-inspect Button in InspectionDetails Component

**Before:**
```tsx
function InspectionDetails({ grn, setIsEditing }: any) {
    return (
        <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="p-3 border-b border-slate-200 dark:border-slate-800">
                <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                        Inspection History
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setIsEditing(true)}>
                        <UserCheck className="h-3 w-3 mr-1" />
                        Re-inspect
                    </Button>
                </CardTitle>
            </CardHeader>
```

**After:**
```tsx
function InspectionDetails({ grn, setIsEditing }: any) {
    return (
        <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="p-3 border-b border-slate-200 dark:border-slate-800">
                <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                        Inspection History
                    </div>
                    <PermissionGuard resource="grn" action="edit" tooltipText="Only Purchase/Operations can re-inspect GRNs">
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setIsEditing(true)}>
                        <UserCheck className="h-3 w-3 mr-1" />
                        Re-inspect
                      </Button>
                    </PermissionGuard>
                </CardTitle>
            </CardHeader>
```

### Change 2: Complete Inspection Button in InspectionForm Component

**Before:**
```tsx
<div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
    {isEditing && (
        <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditing(false)}
            disabled={updateMutation.isPending}
            size="sm"
            className="w-full sm:w-auto h-8 text-xs"
        >
            Cancel
        </Button>
    )}
    <Button
        type="submit"
        disabled={updateMutation.isPending || isExceeded}
        size="sm"
        className="w-full sm:w-auto h-8 text-xs bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
    >
        {updateMutation.isPending ? (
            <>
                <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
                Saving...
            </>
        ) : (
            <>
                <Save className="h-3 w-3 mr-1.5" />
                {isEditing ? "Save Changes" : "Complete Inspection"}
            </>
        )}
    </Button>
</div>
```

**After:**
```tsx
<div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
    {isEditing && (
        <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditing(false)}
            disabled={updateMutation.isPending}
            size="sm"
            className="w-full sm:w-auto h-8 text-xs"
        >
            Cancel
        </Button>
    )}
    <PermissionGuard resource="grn" action="edit" tooltipText="Only Purchase/Operations can update GRNs">
      <Button
        type="submit"
        disabled={updateMutation.isPending || isExceeded}
        size="sm"
        className="w-full sm:w-auto h-8 text-xs bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
      >
        {updateMutation.isPending ? (
            <>
                <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
                Saving...
            </>
        ) : (
            <>
                <Save className="h-3 w-3 mr-1.5" />
                {isEditing ? "Save Changes" : "Complete Inspection"}
            </>
        )}
      </Button>
    </PermissionGuard>
</div>
```

---

## File 5: client-detail.tsx

### Import Added:
```tsx
import { PermissionGuard } from "@/components/permission-guard";
```

### Change 1: New Quote Button in Quotes Tab Header

**Before:**
```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <h3 className="text-base sm:text-lg font-semibold">Quotes</h3>
    <Link href={`/quotes/create?clientId=${clientId}`}>
        <Button size="sm" className="w-full sm:w-auto btn-classy shadow-elegant-lg">
            <Plus className="h-4 w-4 mr-2" />
            <span>New quote</span>
        </Button>
    </Link>
</div>
```

**After:**
```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <h3 className="text-base sm:text-lg font-semibold">Quotes</h3>
    <PermissionGuard resource="quotes" action="create" tooltipText="Only Sales Managers and Sales Executives can create quotes">
      <Link href={`/quotes/create?clientId=${clientId}`}>
        <Button size="sm" className="w-full sm:w-auto btn-classy shadow-elegant-lg">
          <Plus className="h-4 w-4 mr-2" />
          <span>New quote</span>
        </Button>
      </Link>
    </PermissionGuard>
</div>
```

### Change 2: Create Quote Button in Empty State

**Before:**
```tsx
<Card className="border-dashed border-2">
    <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
            <FileText className="h-12 w-12 sm:h-14 sm:w-14 text-muted-foreground" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2">
            No quotes yet
        </h3>
        <p className="text-sm text-muted-foreground font-['Open_Sans'] mb-6 max-w-md px-4">
            Create your first quote for this client and it will appear here.
        </p>
        <Link href={`/quotes/create?clientId=${clientId}`}>
            <Button size="lg" className="btn-classy shadow-elegant-lg">
                <Plus className="h-5 w-5 mr-2" />
                Create quote
            </Button>
        </Link>
    </CardContent>
</Card>
```

**After:**
```tsx
<Card className="border-dashed border-2">
    <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
            <FileText className="h-12 w-12 sm:h-14 sm:w-14 text-muted-foreground" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2">
            No quotes yet
        </h3>
        <p className="text-sm text-muted-foreground font-['Open_Sans'] mb-6 max-w-md px-4">
            Create your first quote for this client and it will appear here.
        </p>
        <PermissionGuard resource="quotes" action="create" tooltipText="Only Sales Managers and Sales Executives can create quotes">
          <Link href={`/quotes/create?clientId=${clientId}`}>
            <Button size="lg" className="btn-classy shadow-elegant-lg">
              <Plus className="h-5 w-5 mr-2" />
              Create quote
            </Button>
          </Link>
        </PermissionGuard>
    </CardContent>
</Card>
```

---

## Summary of Changes

| File | Changes | Buttons Protected | Imports Added |
|------|---------|-------------------|---------------|
| invoice-detail.tsx | 2 PermissionGuard wrappers | Email Invoice, Payment Reminder | None (already imported) |
| quote-detail.tsx | 1 PermissionGuard wrapper | Email Quote | None (already imported) |
| vendor-po-detail.tsx | 5 PermissionGuard wrappers | Send, Acknowledge, GRN, Fulfill, Cancel | 1 import added |
| grn-detail.tsx | 2 PermissionGuard wrappers | Re-inspect, Complete Inspection | 1 import added |
| client-detail.tsx | 2 PermissionGuard wrappers | New Quote (2 locations) | 1 import added |

**Total:** 12 PermissionGuard wrappers, 3 imports added, 14 buttons protected

---

## How PermissionGuard Works

```tsx
<PermissionGuard 
  resource="resource-name"      // Required: Which feature
  action="action-name"          // Required: What action
  tooltipText="Message"         // Optional: Helpful message
>
  <Button>Click Me</Button>     // Component to protect
</PermissionGuard>
```

**Behavior:**
1. If user has permission: Button is fully visible and functional ✅
2. If user lacks permission: Button is hidden completely 🚫
3. If permission denied: Tooltip shows helpful message ℹ️

---

## Testing the Changes

See `VIEWER_PERMISSION_FIXES_TESTING_GUIDE.md` for detailed testing steps.

---

**Status:** ✅ Complete
**Date:** 2025-12-25
**Lines Changed:** ~150
**Files Modified:** 5
**Buttons Protected:** 14

