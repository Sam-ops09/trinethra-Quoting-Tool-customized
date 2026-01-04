#!/bin/bash
# Master-Child Invoice System Diagnostic Script
# Run this to check the current state of the system

echo "🔍 Master-Child Invoice System Diagnostic"
echo "=========================================="
echo ""

# Auto-load DATABASE_URL from .env if not set
if [ -z "$DATABASE_URL" ]; then
    if [ -f ".env" ]; then
        # Parse .env for DATABASE_URL line and export
        DB_URL_LINE=$(grep -E '^DATABASE_URL=' .env | head -n 1)
        if [ -n "$DB_URL_LINE" ]; then
            # Remove leading key and possible quotes
            DB_URL_VALUE=$(echo "$DB_URL_LINE" | sed -E 's/^DATABASE_URL=\"?(.*)\"?$/\1/')
            export DATABASE_URL="$DB_URL_VALUE"
        fi
    fi
fi

# Prepare a cleaned URL for psql (strip unsupported channel_binding parameter)
CLEAN_DB_URL=$(echo "$DATABASE_URL" | sed -E 's/[&?]channel_binding=require//')

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo "   Please set it in your .env file or export it"
    exit 1
else
    echo "✅ DATABASE_URL is set"
fi

echo ""
echo "📊 Checking database schema..."
echo ""

# Check if is_master column exists
COLUMN_CHECK=$(psql "$CLEAN_DB_URL" -t -c "
SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'invoices'
    AND column_name = 'is_master'
);" 2>&1)

if echo "$COLUMN_CHECK" | grep -q "t"; then
    echo "✅ is_master column exists in invoices table"
else
    echo "❌ is_master column DOES NOT exist in invoices table"
    echo "   Run: psql \$CLEAN_DB_URL -f migrations/add_invoice_is_master.sql"
    exit 1
fi

echo ""
echo "📋 Checking existing invoices..."
echo ""

# Get invoice statistics
INVOICE_STATS=$(psql "$CLEAN_DB_URL" -t -c "
SELECT
    COUNT(*) as total,
    COUNT(CASE WHEN is_master = true THEN 1 END) as masters,
    COUNT(CASE WHEN parent_invoice_id IS NOT NULL THEN 1 END) as children
FROM invoices;" 2>&1)

echo "Invoice Statistics:"
echo "$INVOICE_STATS" | tr -d '\n' | awk '{print "  Total: "$1"\n  Masters: "$2"\n  Children: "$3}'

echo ""
echo "📝 Recent invoices:"
echo ""

psql "$CLEAN_DB_URL" -c "
SELECT
    invoice_number,
    is_master,
    CASE
        WHEN parent_invoice_id IS NULL THEN 'No parent'
        ELSE 'Has parent'
    END as parent_status,
    to_char(created_at, 'YYYY-MM-DD HH24:MI') as created
FROM invoices
ORDER BY created_at DESC
LIMIT 5;"

echo ""
echo "🔧 Checking for master invoices without is_master flag..."
echo ""

UNFLAGGED=$(psql "$CLEAN_DB_URL" -t -c "
SELECT COUNT(*)
FROM invoices
WHERE parent_invoice_id IS NULL
AND is_master = false;" 2>&1)

if [ "$UNFLAGGED" -gt 0 ]; then
    echo "⚠️  Found $UNFLAGGED invoice(s) without parent but is_master=false"
    echo "   Run this SQL to fix:"
    echo "   UPDATE invoices SET is_master = true WHERE parent_invoice_id IS NULL AND is_master = false;"
else
    echo "✅ All invoices without parent are correctly marked as masters"
fi

echo ""
echo "🧪 Test suggestions:"
echo "   1. Create a new quote and convert to invoice"
echo "   2. Check if 'Create Child Invoice' button appears"
echo "   3. Try creating a child invoice"
echo "   4. Verify child invoice has hierarchical number (e.g., INV-001-1)"
echo ""
echo "📖 For detailed troubleshooting, see: MASTER_CHILD_INVOICE_TROUBLESHOOTING.md"
