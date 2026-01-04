#!/bin/bash

# Complete Database Migration Script for User Roles
# This handles everything: role migration + enum update

set -e

echo "🔄 Complete User Role Migration"
echo "================================"
echo ""

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set. Loading from .env..."
    if [ -f .env ]; then
        export $(cat .env | grep "^DATABASE_URL" | xargs)
    fi

    if [ -z "$DATABASE_URL" ]; then
        echo "❌ Could not find DATABASE_URL in .env"
        exit 1
    fi
fi

echo "✅ DATABASE_URL found"
echo ""

# Step 1: Migrate user roles
echo "STEP 1: Migrating User Roles"
echo "-----------------------------"
echo ""

./scripts/migrate-roles.sh --yes

# Step 2: Update enum type
echo ""
echo "STEP 2: Updating Enum Type"
echo "--------------------------"
echo ""

echo "1️⃣  Renaming old enum type..."
psql "$DATABASE_URL" -c "ALTER TYPE user_role RENAME TO user_role_old;" 2>/dev/null || {
    echo "   ℹ️  Old enum already renamed or doesn't exist"
}
echo "   ✅ Old enum handled"
echo ""

echo "2️⃣  Creating new enum type..."
psql "$DATABASE_URL" << 'SQL'
CREATE TYPE user_role AS ENUM (
    'admin',
    'sales_executive',
    'sales_manager',
    'purchase_operations',
    'finance_accounts',
    'viewer'
);
SQL
echo "   ✅ New enum created"
echo ""

echo "3️⃣  Converting role column to use new enum..."
psql "$DATABASE_URL" -c "ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::text::user_role;"
echo "   ✅ Column converted"
echo ""

echo "4️⃣  Dropping old enum type..."
psql "$DATABASE_URL" -c "DROP TYPE IF EXISTS user_role_old;" 2>/dev/null || {
    echo "   ℹ️  Old enum already dropped"
}
echo "   ✅ Cleanup complete"
echo ""

# Step 3: Verify
echo "STEP 3: Verification"
echo "--------------------"
echo ""

echo "📊 Current users and roles:"
psql "$DATABASE_URL" -c "SELECT email, role FROM users ORDER BY created_at;"
echo ""

echo "📊 Enum values:"
psql "$DATABASE_URL" -c "SELECT unnest(enum_range(NULL::user_role));"
echo ""

echo "✅ ✅ ✅ Migration Complete! ✅ ✅ ✅"
echo ""
echo "Your database is now ready with the new role system:"
echo "  - admin"
echo "  - sales_executive"
echo "  - sales_manager"
echo "  - purchase_operations"
echo "  - finance_accounts"
echo "  - viewer"
echo ""
echo "📝 Next step:"
echo "   Restart your application: pnpm run dev"
echo ""

