# Verification & Testing Guide

This document outlines the tests available to verify the integrity of the Quoting Tool, specifically focusing on Stock Management and Invoice Generation workflows.

## Prerequisites

Ensure the development server is running before executing these tests.

```bash
# Start the server
pnpm dev
```

## 1. Stock & Workflow Regression Test

**Script:** `verify_stock.ts`

This script verifies the "Happy Path" of the Quote-to-Invoice lifecycle. It ensures that when a Sales Order is converted to an Invoice:
- Stock is correctly deducted from the Product.
- Reserved quantity is released.
- Available quantity is updated correctly.
- Quote status is updated to `invoiced`.

### How to Run
```bash
npx tsx verify_stock.ts
```

### Expected Output
- `✅ PASS: Stock correctly deducted to -5`
- `✅ PASS: Available quantity correctly updated to -5`
- `🎉 ALL CHECKS PASSED`

---

## 2. Concurrency & Race Condition Test

**Script:** `test_race_condition.ts`

This script verifies that the system prevents duplicate invoices when multiple requests are sent simultaneously (e.g., accidental double-click). It attacks the `convert-to-invoice` endpoint with concurrent requests.

### How to Run
```bash
npx tsx test_race_condition.ts
```

### Expected Output
- `Successes: 1 (Expected 1)`
- `Conflicts: 1 (Expected 1)`
- `✅ RACE TEST PASSED: Duplicate prevented.`

This confirms that the **database transactions** and **unique constraints** are working correctly.

---

## 3. Audit Bug Fixes Test Suite

**Script:** `test_audit_fixes.ts`

This comprehensive test suite verifies all 12 bug fixes implemented from the security audit, including:
- Signup role escalation prevention
- Template query fixes
- Indexed token lookups (performance)
- Payment recording atomicity
- Quote-to-SO race condition prevention
- Settings key validation whitelist
- Financial calculation precision (Decimal.js)
- Invoice cancellation stock reversal

### How to Run
```bash
npx tsx test_audit_fixes.ts
```

### Expected Output
```
✅ Role escalation blocked
✅ Template queries work
✅ Token refresh efficient
✅ Payment recorded atomically
✅ Race condition prevented
✅ Invalid key rejected
✅ Valid key accepted
✅ Custom key accepted
✅ Financial precision maintained
✅ Stock reversal worked

Total: 10 passed, 0 failed
✅ All tests passed!
```

---

## 4. Integrated Audit Test Suite (Consolidated)

**Script:** `tests/integrated_audit_tests.ts`

This is the **primary test suite** for verifying all audit fixes and regression testing. It consolidates:
- Security Fixes (Role escalation, Settings validation, Soft delete)
- Financial Integrity (Transactions, Precision, Stock reversal)
- Workflow Logic (Stock deduction, Shortage notes)
- Concurrency (Race conditions, Numbering service)
- **12+ Test Scenarios in one run**

### How to Run
```bash
# Note: Run with TESTING=true to avoid rate limits during heavy testing
TESTING=true npx tsx tests/integrated_audit_tests.ts
npx tsx test_phase2_fixes.ts

npx tsx tests/integrated_audit_tests.ts
npx tsx test_full_flow.ts
npx tsx test_audit_fixes.ts
npx tsx test_phase2_fixes.ts
npx tsx test_race_condition.ts
npx tsx verify_stock.ts
npx tsx verify_audit_fixes_v2.ts
npx tsx verify_default_role.ts
npx tsx debug_payment_failure.ts
npx tsx verify_decimal.ts
npx tsx verify_audit_fixes_v3.ts
npx tsx reproduce_so_edit.ts
npx tsx repro_clone_numbering.ts
npx tsx check_settings.ts
npx tsx scripts/test-pdf-worker.ts
npx tsx debug_analytics_data.ts
npx tsx tests/verify_feature_flags.ts
```

### Expected Output
```
🧪 INTEGRATED AUDIT TEST SUITE
==============================
...
📊 FINAL SUMMARY
==============================
Total: 12 passed, 0 failed
```
