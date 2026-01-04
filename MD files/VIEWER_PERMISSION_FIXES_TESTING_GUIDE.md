# Viewer Permission Fixes - Testing Guide

## Quick Test Steps

### 1. Test as Viewer User
```bash
1. Login as user with "Viewer" role
2. Navigate to Invoices > Click any invoice
3. Verify buttons are HIDDEN:
   - Email Invoice ❌
   - Payment Reminder ❌
4. Navigate to Quotes > Click any quote
5. Verify buttons are HIDDEN:
   - Email Quote ❌
6. Navigate to Vendor POs > Click any PO
7. Verify buttons are HIDDEN:
   - Send ❌
   - Acknowledge ❌
   - GRN ❌
   - Fulfill ❌
   - Cancel ❌
8. Navigate to GRNs > Click any GRN
9. Verify buttons are HIDDEN:
   - Re-inspect ❌
   - Complete Inspection (in form) ❌
10. Navigate to Clients > Click any client > Quotes tab
11. Verify buttons are HIDDEN:
    - New Quote ❌
```

### 2. Test as Finance/Accounts User
```bash
1. Login as user with "Finance/Accounts" role
2. Navigate to Invoices > Click any invoice
3. Verify buttons are VISIBLE:
   - Email Invoice ✅
   - Payment Reminder ✅ (if invoice is pending/partial/overdue)
   - Update Payment ✅
   - Edit Invoice ✅
4. Verify buttons are HIDDEN:
   - Acknowledge (PO button) ❌
   - GRN ❌
```

### 3. Test as Sales Manager User
```bash
1. Login as user with "Sales Manager" role
2. Navigate to Quotes > Click any quote
3. Verify button is VISIBLE:
   - Email Quote ✅
4. Navigate to Clients > Click any client > Quotes tab
5. Verify button is VISIBLE:
   - New Quote ✅
6. Verify buttons are HIDDEN:
   - Acknowledge (PO button) ❌
   - GRN ❌
```

### 4. Test as Purchase/Operations User
```bash
1. Login as user with "Purchase/Operations" role
2. Navigate to Vendor POs > Click any PO
3. Verify buttons are VISIBLE:
   - Send ✅ (if status is draft)
   - Acknowledge ✅ (if status is sent)
   - GRN ✅ (if status is acknowledged/sent)
   - Fulfill ✅ (if status is acknowledged/sent)
   - Cancel ✅ (if not cancelled/fulfilled)
4. Navigate to GRNs > Click any GRN
5. Verify buttons are VISIBLE:
   - Re-inspect ✅
   - Complete Inspection ✅
6. Verify buttons are HIDDEN:
   - Email Invoice ❌
   - Payment Reminder ❌
```

### 5. Test as Sales Executive User
```bash
1. Login as user with "Sales Executive" role
2. Navigate to Clients > Click any client > Quotes tab
3. Verify button is VISIBLE:
   - New Quote ✅
4. Verify buttons are HIDDEN:
   - Email Invoice ❌
   - Email Quote ❌
   - Acknowledge (PO button) ❌
```

### 6. Test as Admin User
```bash
1. Login as user with "Admin" role
2. Navigate to all pages (Invoice, Quote, PO, GRN, Client)
3. Verify ALL action buttons are VISIBLE ✅
4. Verify ALL buttons are FUNCTIONAL ✅
```

---

## Detailed Test Scenarios

### Scenario 1: Invoice Email Test
**Role:** Finance/Accounts
1. Go to Invoices
2. Click on any invoice
3. Click "Email Invoice" button
4. Verify dialog opens for email configuration
5. Send email
6. Verify success message

**Same test as Viewer:**
1. Go to Invoices
2. Click on any invoice
3. Verify "Email Invoice" button is NOT visible
4. ✅ Pass if hidden

---

### Scenario 2: Payment Reminder Test
**Role:** Finance/Accounts
1. Go to Invoices
2. Click on any UNPAID invoice (pending/partial/overdue status)
3. Click "Payment Reminder" button
4. Verify dialog opens
5. Send reminder
6. Verify success message

**Conditions to test:**
- Paid invoice: Button should NOT appear ✅
- Pending invoice: Button should appear ✅
- Partial invoice: Button should appear ✅
- Overdue invoice: Button should appear ✅

---

### Scenario 3: Vendor PO Workflow Test
**Role:** Purchase/Operations
1. Go to Vendor POs
2. Click on draft PO
3. Click "Send" button → Status changes to "sent" ✅
4. Click on sent PO
5. Click "Acknowledge" button → Status changes to "acknowledged" ✅
6. Click on acknowledged PO
7. Click "GRN" button → Opens GRN creation dialog ✅
8. Click "Fulfill" button → Status changes to "fulfilled" ✅
9. At any step, click "Cancel" → Status changes to "cancelled" ✅

**Same test as Viewer:**
1. Go to Vendor POs
2. Click on any PO
3. Verify ALL 5 buttons (Send, Acknowledge, GRN, Fulfill, Cancel) are NOT visible ✅

---

### Scenario 4: GRN Inspection Test
**Role:** Purchase/Operations
1. Go to GRNs
2. Click on any GRN with "pending" status
3. Fill in inspection form:
   - Quantity Received: [number]
   - Quantity Rejected: [number]
   - Inspection Status: Select status
   - Add notes if needed
4. Click "Complete Inspection" button
5. Verify form submits and saves ✅
6. Click "Re-inspect" button to edit again
7. Verify form opens in edit mode ✅

**Same test as Viewer:**
1. Go to GRNs
2. Click on any GRN
3. Verify "Re-inspect" button is NOT visible ✅
4. Verify "Complete Inspection" button is NOT visible ✅
5. Form should be view-only ✅

---

### Scenario 5: Quote Email Test
**Role:** Sales Manager
1. Go to Quotes
2. Click on any quote
3. Click "Email" button
4. Verify dialog opens with email configuration
5. Send email
6. Verify success message ✅

**Same test as Viewer:**
1. Go to Quotes
2. Click on any quote
3. Verify "Email" button is NOT visible ✅

---

### Scenario 6: Create Quote from Client Test
**Role:** Sales Manager or Sales Executive
1. Go to Clients
2. Click on any client
3. Click "Quotes" tab
4. Click "New quote" button
5. Verify quote creation page opens ✅
6. Create and save quote
7. Verify quote appears in client's quote list ✅

**Same test as Viewer:**
1. Go to Clients
2. Click on any client
3. Click "Quotes" tab
4. Verify "New quote" button is NOT visible ✅
5. If no quotes exist, verify "Create quote" button in empty state is NOT visible ✅

---

## Edge Cases to Test

### 1. Invoice with Multiple Statuses
- **Test:** Payment status transitions (pending → partial → paid)
- **Expected:** Payment Reminder button appears/disappears based on status
- **Verify:** Works for Viewer role (button hidden regardless) ✅

### 2. Master Invoice Child Invoice Operations
- **Test:** Create, edit, split master invoices
- **Verify:** All operations require proper permissions ✅

### 3. Rapid Role Changes
- **Test:** Change user role while viewing page
- **Expected:** Buttons appear/disappear on page refresh
- **Verify:** Works correctly ✅

### 4. Network Latency
- **Test:** Send email/reminder with slow network
- **Expected:** Button disabled during operation
- **Verify:** No duplicate operations ✅

### 5. Permission Changes During Session
- **Test:** Admin removes viewer user's access while logged in
- **Expected:** User cannot perform actions
- **Verify:** Server-side enforcement works ✅

---

## Automated Testing (Optional)

### Playwright Test Template
```typescript
import { test, expect } from '@playwright/test';

test('Viewer cannot see invoice action buttons', async ({ page }) => {
  // Login as Viewer
  await page.goto('/login');
  await page.fill('input[name="email"]', 'viewer@test.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Navigate to invoice
  await page.goto('/invoices');
  await page.click('a[href*="/invoices/"]');

  // Verify buttons are hidden
  await expect(page.locator('button:has-text("Email Invoice")')).toBeHidden();
  await expect(page.locator('button:has-text("Payment Reminder")')).toBeHidden();
});

test('Finance can see invoice action buttons', async ({ page }) => {
  // Login as Finance
  await page.goto('/login');
  await page.fill('input[name="email"]', 'finance@test.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Navigate to invoice
  await page.goto('/invoices');
  await page.click('a[href*="/invoices/"]');

  // Verify buttons are visible
  await expect(page.locator('button:has-text("Email Invoice")')).toBeVisible();
  await expect(page.locator('button:has-text("Payment Reminder")')).toBeVisible();
});
```

---

## Sign-Off Checklist

- [ ] All 6 roles tested
- [ ] All 14 buttons verified
- [ ] No buttons visible to Viewer
- [ ] All authorized role buttons visible
- [ ] All buttons functional
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Email/notification features work
- [ ] Database operations successful
- [ ] Audit logs capture actions

---

## Known Limitations

None identified at this time.

---

## Rollback Plan

If issues are found:
1. Revert PermissionGuard components from affected files
2. Re-test with previous state
3. File bug report with specific scenario

---

## Support Contact

For issues during testing, check:
1. User role assignment in admin panel
2. Permission configuration in permissions-new.ts
3. PermissionGuard component logic
4. API authorization endpoints

---

**Last Updated:** 2025-12-25
**Status:** Ready for Testing ✅

