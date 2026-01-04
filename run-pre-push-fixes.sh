#!/bin/bash
# Pre-Push Database Fixes
# Run this BEFORE running pnpm db:push

set -e  # Exit on error

echo "🔧 Pre-Push Database Fixes"
echo "============================"
echo ""

# Load .env file if it exists
if [ -f .env ]; then
    echo "📁 Loading environment from .env file..."
    # Source the .env file and export DATABASE_URL
    set -a
    source .env
    set +a
    # Remove quotes from DATABASE_URL if present
    export DATABASE_URL=$(echo $DATABASE_URL | tr -d '"')
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please do one of the following:"
    echo "  1. Add DATABASE_URL to your .env file"
    echo "  2. Or run: export DATABASE_URL='your-database-url'"
    echo ""
    exit 1
fi

echo "✓ DATABASE_URL is set"
echo ""

# Run the pre-push fixes
echo "📊 Running pre-push fixes..."
echo ""

if psql "$DATABASE_URL" -f migrations/pre_push_fixes.sql; then
    echo ""
    echo "✅ All pre-push fixes completed successfully!"
    echo ""
    echo "🚀 You can now safely run:"
    echo "   pnpm db:push"
    echo ""
else
    echo ""
    echo "❌ Pre-push fixes failed!"
    echo "   Please check the error messages above"
    echo "   You may need to fix data manually"
    exit 1
fi

