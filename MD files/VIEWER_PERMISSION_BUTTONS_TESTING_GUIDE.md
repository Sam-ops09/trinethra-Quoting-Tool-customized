# Viewer Permission Buttons Fix - Testing Guide

## Overview
This guide helps verify that all action buttons are properly disabled for Viewer users and functional for authorized users.

---

## Test Case 1: Invoice Detail Page

### Setup
1. Navigate to any invoice detail page
2. Have two browser tabs/windows ready - one logged in as Viewer, one as Finance user

### Viewer User Tests
1. **Edit Invoice Button**
   - Expected: Disabled (greyed out, not clickable)
   - Check: Button shows opacity-50 CSS class
   - Verify: Tooltip shows "Only Finance/Accounts can edit invoices"

2. **Email Invoice Button**
   - Expected: Disabled (greyed out, not clickable)
   - Verify: Cannot trigger email dialog

3. **Payment Reminder Button**
   - Expected: Disabled (if invoice is pending/partial/overdue)
   - Verify: Tooltip shows "Only Finance/Accounts can send payment reminders"

4. **Update Payment / Record Payment Button**
   - Expected: Disabled (greyed out, not clickable)
   - Verify: Cannot open payment dialog

5. **Create Child Invoice Button**
   - Expected: Disabled (only for master invoices)
   - Verify: Tooltip shows "Only Finance/Accounts can create invoices"

6. **Assign/Edit Serial Numbers Button**
   - Expected: Disabled (both mobile and desktop views)
   - Verify: Cannot assign or edit serial numbers
   - Check: Works in both table view and mobile card view

7. **Lock Master Invoice Button** (if master invoice)
   - Expected: Disabled (greyed out)
   - Verify: Tooltip shows "Only Finance/Accounts can lock master invoices"

8. **Edit Master Invoice Details Button** (if master invoice)
   - Expected: Disabled
   - Verify: Cannot edit master invoice details

### Finance User Tests
1. All above buttons should be:
   - Fully visible (100% opacity)
   - Clickable
   - Functional (dialogs/actions open)
   - Performing expected actions

---

## Test Case 2: Quote Detail Page

### Viewer User Tests
1. **Email Quote Button**
   - Expected: Disabled (greyed out, not clickable)
   - Verify: Cannot open email dialog
   - Tooltip: "Not available for this role"

2. **Send Quote Button** (when status is draft)
   - Expected: Disabled (greyed out, not clickable)
   - Verify: Cannot change status to "sent"
   - Tooltip: "Only authorized users can send quotes"

3. **Approve Quote Button** (when status is sent)
   - Expected: Disabled
   - Verify: Cannot approve
   - Tooltip: "Only Sales Managers can approve quotes"

4. **Reject Quote Button** (when status is sent)
   - Expected: Disabled
   - Verify: Cannot reject
   - Tooltip: "Only Sales Managers can reject quotes"

### Sales Manager/Finance User Tests
1. All above buttons should be:
   - Fully visible and clickable
   - Functional
   - Performing expected actions

---

## Test Case 3: Quotes List Page

### Viewer User Tests
1. **Email Quote (Dropdown Menu)**
   - Expected: Menu item disabled/not clickable
   - Verify: Cannot trigger email dialog
   - Tooltip: "Not available for this role"

2. **Download PDF Button**
   - Expected: Available (not a restricted action)
   - Verify: Can download PDF

3. **View Button**
   - Expected: Available (viewing is allowed)
   - Verify: Can navigate to quote detail

### Authorized User Tests
1. **Email Quote**
   - Expected: Available and functional
   - Verify: Can send quote via email

---

## Test Case 4: Client Detail Page

### Viewer User Tests
1. **Create New Quote Button**
   - Expected: Disabled (greyed out, not clickable)
   - Verify: Cannot navigate to quote creation
   - Tooltip: "Only Sales Managers and Sales Executives can create quotes"

### Sales User Tests
1. **Create New Quote Button**
   - Expected: Available and clickable
   - Verify: Can create new quote for client

---

## Test Case 5: Vendor PO Detail Page

### Viewer User Tests
1. **Send PO Button**
   - Expected: Disabled
   - Tooltip: "Only Purchase/Operations can manage POs"

2. **Acknowledge PO Button**
   - Expected: Disabled
   - Tooltip: "Only Purchase/Operations can acknowledge POs"

3. **Create GRN Button**
   - Expected: Disabled
   - Tooltip: "Only Purchase/Operations can create GRNs"

4. **Fulfill PO Button**
   - Expected: Disabled
   - Tooltip: "Only Purchase/Operations can fulfill POs"

5. **Cancel PO Button**
   - Expected: Disabled
   - Tooltip: "Only Purchase/Operations can cancel POs"

### Operations User Tests
1. All above buttons should be:
   - Fully visible and clickable
   - Functional

---

## Test Case 6: GRN Detail Page

### Viewer User Tests
1. **Update/Save GRN Button**
   - Expected: Disabled
   - Tooltip: "Only Purchase/Operations can update GRNs"

2. **Re-inspect GRN Button**
   - Expected: Disabled
   - Tooltip: "Only Purchase/Operations can re-inspect GRNs"

### Operations User Tests
1. Both buttons should be:
   - Fully visible and clickable
   - Functional

---

## Test Case 7: Vendors Directory Page

### Viewer User Tests
1. **Edit Vendor Button**
   - Expected: Disabled
   - Tooltip: "Only Purchase/Operations can edit vendors"

2. **Delete Vendor Button**
   - Expected: Disabled (shown as red delete button)
   - Tooltip: "Only Purchase/Operations can delete vendors"

3. **Add Vendor Button**
   - Expected: Disabled
   - Tooltip: "Only Purchase/Operations can create vendors"

### Operations User Tests
1. All above buttons should be:
   - Fully visible and clickable
   - Functional

---

## Visual Verification Checklist

For each disabled button, verify:
- [ ] Button has reduced opacity (appears greyed out)
- [ ] Button has `cursor: not-allowed` CSS class (cursor changes on hover)
- [ ] Button has `disabled={true}` HTML attribute
- [ ] Button doesn't respond to clicks
- [ ] Tooltip appears on hover (if tooltipText provided)

For each enabled button, verify:
- [ ] Button has full opacity (appears normal)
- [ ] Button has normal cursor
- [ ] Button is clickable
- [ ] Button performs expected action

---

## Automated Testing (Optional)

### Sample Test Cases (Using Testing Library)

```typescript
// Test that serial buttons are disabled for Viewer
test('Serial assignment buttons disabled for Viewer', () => {
  // Mock usePermissions to return Viewer role
  mockUsePermissions({ role: 'viewer', canUser: () => false });
  
  render(<InvoiceDetail invoiceId="123" />);
  
  const serialButtons = screen.getAllByText(/Assign|Edit/);
  serialButtons.forEach(btn => {
    expect(btn).toBeDisabled();
    expect(btn.closest('div')).toHaveClass('opacity-50');
  });
});

// Test that serial buttons are enabled for Finance
test('Serial assignment buttons enabled for Finance', () => {
  mockUsePermissions({ role: 'finance', canUser: () => true });
  
  render(<InvoiceDetail invoiceId="123" />);
  
  const serialButtons = screen.getAllByText(/Assign|Edit/);
  serialButtons.forEach(btn => {
    expect(btn).not.toBeDisabled();
    expect(btn.closest('div')).not.toHaveClass('opacity-50');
  });
});
```

---

## Troubleshooting

### Button Still Clickable
1. Check PermissionGuard wrapping:
   - Button must be directly inside `<PermissionGuard>` tags
   - Check for typos in resource/action names

2. Verify permission configuration:
   - Check `/lib/permissions-new.ts` for resource/action definitions
   - Verify user role has correct permissions

3. Check canUser() hook:
   - Ensure it's returning false for Viewer users
   - Check user role is being set correctly

### Tooltip Not Showing
1. Verify `tooltipText` prop is provided to PermissionGuard
2. Check `showTooltip` is not explicitly set to false
3. Ensure browser supports title attribute tooltips
4. Check browser's tooltip delay settings

### Button Styling Issues
1. Verify CSS classes are applied: `opacity-50 cursor-not-allowed inline-block`
2. Check for CSS overrides in your stylesheet
3. Use browser dev tools to inspect applied styles

---

## Sign-Off Checklist

Before deploying, verify:
- [ ] All buttons properly disabled for Viewer users
- [ ] All buttons functional for authorized users
- [ ] Visual feedback (opacity + cursor) working correctly
- [ ] Tooltips showing when provided
- [ ] No console errors
- [ ] No broken functionality
- [ ] All pages tested
- [ ] Mobile view tested
- [ ] Desktop view tested

---

## Contact & Support

If you find any issues:
1. Note which button and page
2. Take a screenshot
3. Check browser console for errors
4. Report user role and expected vs. actual behavior

