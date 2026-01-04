#!/bin/bash

# Database Migration Script: Update User Roles
# This script safely migrates user roles from old to new enum values

set -e  # Exit on any error

echo "🔄 Starting user role migration..."
echo ""

# Load .env file if it exists
if [ -f .env ]; then
    echo "📁 Loading environment from .env file..."
    export $(grep -v '^#' .env | grep DATABASE_URL | xargs)
    echo ""
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo "   Please set it in your .env file or export it"
    echo ""
    echo "   Example:"
    echo "   export DATABASE_URL='postgresql://user:pass@host:5432/dbname'"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL found"
echo ""

# Step 1: Check current users
echo "📊 Checking current user roles..."
psql "$DATABASE_URL" -c "SELECT email, role FROM users ORDER BY created_at;" 2>/dev/null || {
    echo "❌ Could not connect to database"
    echo "   Please check your DATABASE_URL"
    exit 1
}
echo ""

# Step 2: Show what will change
echo "⚠️  This will update user roles as follows:"
echo "  - 'admin' → 'admin' (no change)"
echo "  - 'manager' → 'sales_manager'"
echo "  - 'user' → 'sales_executive'"
echo "  - 'viewer' → 'viewer' (no change)"
echo ""

# Step 3: Ask for confirmation
if [ "$1" != "--yes" ] && [ "$1" != "-y" ]; then
    read -p "❓ Continue with migration? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "❌ Migration cancelled"
        exit 0
    fi
fi

echo ""
echo "🚀 Starting migration..."
echo ""

# Step 4: Run migration
echo "1️⃣  Creating temporary role column..."
psql "$DATABASE_URL" -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS role_new TEXT;" || {
    echo "❌ Failed to create temporary column"
    exit 1
}
echo "   ✅ Temporary column created"
echo ""

echo "2️⃣  Mapping old roles to new roles..."
psql "$DATABASE_URL" << 'SQL'
UPDATE users SET role_new = CASE
    WHEN role::text = 'admin' THEN 'admin'
    WHEN role::text = 'manager' THEN 'sales_manager'
    WHEN role::text = 'user' THEN 'sales_executive'
    WHEN role::text = 'viewer' THEN 'viewer'
    ELSE 'sales_executive'
END
WHERE role_new IS NULL;
SQL

echo "   ✅ Roles mapped successfully"
echo ""

echo "3️⃣  Replacing old role column..."
psql "$DATABASE_URL" -c "ALTER TABLE users DROP COLUMN role;" || {
    echo "❌ Failed to drop old column"
    exit 1
}
psql "$DATABASE_URL" -c "ALTER TABLE users RENAME COLUMN role_new TO role;" || {
    echo "❌ Failed to rename column"
    exit 1
}
echo "   ✅ Role column updated"
echo ""

echo "4️⃣  Verifying migration..."
psql "$DATABASE_URL" -c "SELECT email, role FROM users ORDER BY created_at;"
echo ""

echo "✅ User role migration completed successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Run: pnpm run db:push"
echo "   2. This will update the enum with new role values"
echo "   3. Restart your application"
echo ""

