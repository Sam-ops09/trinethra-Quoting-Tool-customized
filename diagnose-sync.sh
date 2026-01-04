#!/bin/bash

# Quick Diagnostic Script for Master-Child Sync

echo "========================================"
echo "DIAGNOSTIC: Master-Child Sync Status"
echo "========================================"
echo ""

# Check if server is running
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✓ Server is running on port 5000"
else
    echo "✗ Server is NOT running!"
    echo "  Please run: pnpm dev"
    exit 1
fi

# Check if sync code exists
if grep -q "Updating serial numbers for item" server/routes.ts; then
    echo "✓ Serial sync code found in routes.ts"
else
    echo "✗ Serial sync code NOT found!"
    exit 1
fi

if grep -q "This is a child invoice. Parent:" server/routes.ts; then
    echo "✓ Master sync logic found in routes.ts"
else
    echo "✗ Master sync logic NOT found!"
    exit 1
fi

if grep -q "Invalidating parent invoice:" client/src/pages/invoice-detail.tsx; then
    echo "✓ Frontend invalidation code found"
else
    echo "✗ Frontend invalidation code NOT found!"
    exit 1
fi

if grep -q "getInvoiceItem" server/storage.ts; then
    echo "✓ getInvoiceItem method exists in storage.ts"
else
    echo "✗ getInvoiceItem method NOT found!"
    exit 1
fi

echo ""
echo "========================================"
echo "All checks passed! ✓"
echo "========================================"
echo ""
echo "If sync is still not working, please:"
echo "1. Check browser console for errors"
echo "2. Check server logs when updating serials"
echo "3. Verify you're testing on a CHILD invoice (not master)"
echo "4. Make sure to refresh the master invoice page"
echo ""
echo "Expected flow:"
echo "1. Update serial numbers in child invoice"
echo "2. Server logs should show: 'This is a child invoice'"
echo "3. Server logs should show: '✓ Master item updated successfully'"
echo "4. Browser console should show: 'Invalidating parent invoice'"
echo "5. Master invoice should refresh automatically"
echo ""

