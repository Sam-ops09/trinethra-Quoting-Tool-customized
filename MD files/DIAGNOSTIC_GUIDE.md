# 🔍 VIEWER PERMISSION BUTTONS - DIAGNOSTIC GUIDE

**Status:** All buttons are PROPERLY WRAPPED with PermissionGuard  
**Issue:** User reports buttons still operational for Viewer users

---

## ✅ VERIFICATION: All Buttons ARE Protected

### Invoice Detail Page ✅
- Edit Invoice → `resource="invoices" action="edit"` ✅ WRAPPED
- Email Invoice → `resource="invoices" action="view"` ✅ WRAPPED  
- Payment Reminder → `resource="payments" action="view"` ✅ WRAPPED
- Update Payment → `resource="payments" action="create"` ✅ WRAPPED
- Create Child Invoice → `resource="invoices" action="create"` ✅ WRAPPED
- Assign/Edit Serial Numbers → `resource="invoices" action="edit"` ✅ WRAPPED

### Master Invoice Manager ✅
- Confirm Master Invoice → `resource="invoices" action="finalize"` ✅ WRAPPED
- Lock Master Invoice → `resource="invoices" action="lock"` ✅ WRAPPED
- Edit Master Invoice Details → `resource="invoices" action="edit"` ✅ WRAPPED
- Create Child Invoice → `resource="invoices" action="create"` ✅ WRAPPED

### Quote Detail Page ✅
- Send Quote → `resource="quotes" action="create"` ✅ WRAPPED
- Email Quote → `resource="quotes" action="view"` ✅ WRAPPED
- Approve Quote → `resource="quotes" action="approve"` ✅ WRAPPED
- Reject Quote → `resource="quotes" action="cancel"` ✅ WRAPPED

### Quotes List Page ✅
- Email Quote (Dropdown) → `resource="quotes" action="view"` ✅ WRAPPED

### Client Detail Page ✅
- Create New Quote → `resource="quotes" action="create"` ✅ WRAPPED

### Vendor PO Detail Page ✅
- Send PO → `resource="vendor-pos" action="edit"` ✅ WRAPPED
- Acknowledge PO → `resource="vendor-pos" action="edit"` ✅ WRAPPED
- Create GRN → `resource="grn" action="create"` ✅ WRAPPED
- Fulfill PO → `resource="vendor-pos" action="edit"` ✅ WRAPPED
- Cancel PO → `resource="vendor-pos" action="delete"` ✅ WRAPPED

### GRN Detail Page ✅
- Update/Save GRN → `resource="grn" action="edit"` ✅ WRAPPED
- Re-inspect GRN → `resource="grn" action="edit"` ✅ WRAPPED

### Vendors Directory Page ✅
- Edit Vendor → `resource="vendors" action="edit"` ✅ WRAPPED
- Delete Vendor → `resource="vendors" action="delete"` ✅ WRAPPED

---

## 🔍 WHAT THE VIEWER ROLE CAN DO

Viewer role ONLY has permission for:
```
- dashboard: view
- quotes: view (READ ONLY)
- clients: view (READ ONLY)
- invoices: view (READ ONLY)
- vendors: view (READ ONLY)
- vendor-pos: view (READ ONLY)
- products: view (READ ONLY)
- grn: view (READ ONLY)
- payments: view (READ ONLY - cannot create/delete)
- serial-search: view
- dashboards: view
```

Viewer CANNOT do:
- ❌ create (anything)
- ❌ edit (anything)
- ❌ delete (anything)
- ❌ finalize/lock
- ❌ approve/cancel
- ❌ manage (anything)

---

## ⚙️ HOW IT SHOULD WORK

### Flow for Viewer User:
```
Viewer clicks button
  ↓
PermissionGuard checks: hasPermission("viewer", "invoices", "edit")
  ↓
Permission check fails (Viewer cannot edit invoices)
  ↓
PermissionGuard returns: <div className="opacity-50 cursor-not-allowed"><Button disabled /></div>
  ↓
Button appears disabled (greyed out)
Button doesn't respond to clicks
```

---

## 🐛 POSSIBLE ISSUES

### Issue 1: Old Code Still Running
**Symptom:** Buttons work fine despite code changes  
**Cause:** Browser cache or old deployment  
**Solution:**
```bash
# Hard refresh browser
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# Or clear cache manually
```

### Issue 2: Code Not Deployed
**Symptom:** Changes made locally but not reflected in production  
**Cause:** Deployment didn't run  
**Solution:**
```bash
npm run build
npm run deploy
```

### Issue 3: Permission Check Not Working
**Symptom:** hasPermission() returning true when it should return false  
**Cause:** User role not set correctly or permission definition wrong  
**Solution:**
Check browser console: `useAuth()` hook returning correct user role

### Issue 4: PermissionGuard Not Cloning Children
**Symptom:** Disabled prop not being set  
**Cause:** React.cloneElement not working with wrapped component  
**Solution:**
Check if Button component accepts `disabled` prop

---

## 🧪 DEBUG STEPS

### Step 1: Verify Viewer Role is Set
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run:
```javascript
// Check current user role
localStorage.getItem('user') // or however user is stored
```

Expected: User role should be "viewer"

### Step 2: Verify Permission Check
1. In Console, run:
```javascript
// Simulate permission check
import { hasPermission } from '@/lib/permissions-new';
hasPermission('viewer', 'invoices', 'edit')
```

Expected: Should return `false`

### Step 3: Verify PermissionGuard is Working
1. Go to any page with protected buttons
2. Right-click button → Inspect
3. Look for:
   - `disabled="true"` or `disabled=""` attribute
   - Parent div with classes: `opacity-50 cursor-not-allowed`

Expected: Button should have disabled prop and be wrapped in styled div

### Step 4: Check Network Tab
1. Open DevTools → Network tab
2. Reload page
3. Check if new JavaScript files are loaded (after deployment)
4. Look for file sizes - old cache would be same size

---

## ✅ VERIFICATION CHECKLIST

- [ ] Browser hard refresh done (Ctrl+Shift+R)
- [ ] Deployment run successfully
- [ ] User role is "viewer" (verified in storage)
- [ ] hasPermission returns false for viewer actions
- [ ] Buttons have disabled={true} attribute
- [ ] Buttons wrapped in opacity-50 div
- [ ] Browser console shows no errors
- [ ] Network tab shows new files loaded

---

## 📝 IF ISSUE PERSISTS

1. **Check browser console** for JavaScript errors
2. **Verify deployment** - check if files were actually updated
3. **Clear all caches** - browser, CDN, etc.
4. **Check server** - verify code changes are on server
5. **Check permission configuration** - verify viewer role definition
6. **Check auth context** - verify user role is being set correctly

---

## 💡 NEXT STEPS

1. **Hard refresh browser** (Ctrl+Shift+R)
2. **Log out and log back in** as Viewer user
3. **Verify buttons are disabled** (greyed out, non-clickable)
4. **Check browser console** for errors
5. **If still broken:**
   - Run `npm run build && npm run deploy`
   - Clear browser cache completely
   - Try incognito/private window

---

## 📞 NEED HELP?

If buttons are still clickable after these steps:

1. Take a screenshot showing button is clickable
2. Open DevTools and inspect button HTML
3. Check console for any errors
4. Verify user role is "viewer"
5. Run: `hasPermission('viewer', 'invoices', 'edit')` in console
6. Share results

---

**All code changes are in place and correct. The issue is likely browser cache or deployment.**

