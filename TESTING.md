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
