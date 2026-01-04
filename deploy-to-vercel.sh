#!/bin/bash

# QuoteProGen - Vercel Deployment Script
# This script helps you deploy QuoteProGen to Vercel quickly

set -e  # Exit on error

echo "🚀 QuoteProGen Vercel Deployment Helper"
echo "========================================"
echo ""

# Check if required tools are installed
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ Git is required but not installed."; exit 1; }

echo "✅ Prerequisites check passed"
echo ""

# Generate SESSION_SECRET if not exists
echo "📝 Step 1: Generate SESSION_SECRET"
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "Generated SESSION_SECRET: $SESSION_SECRET"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating one..."
    cat > .env << EOF
DATABASE_URL=postgresql://user:password@host:5432/database
SESSION_SECRET=$SESSION_SECRET
RESEND_API_KEY=
NODE_ENV=development
EOF
    echo "✅ Created .env file. Please update DATABASE_URL and RESEND_API_KEY"
    echo ""
else
    echo "✅ .env file exists"
    echo ""
fi

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Step 2: Initializing Git repository"
    git init
    git add .
    git commit -m "Initial commit - Prepare for Vercel deployment"
    echo "✅ Git repository initialized"
    echo ""
else
    echo "✅ Git repository already initialized"
    echo ""
fi

# Check for uncommitted changes
if [[ $(git status --porcelain) ]]; then
    echo "📦 Step 3: Committing recent changes"
    git add .
    git commit -m "Configure Vercel deployment"
    echo "✅ Changes committed"
    echo ""
else
    echo "✅ No uncommitted changes"
    echo ""
fi

# Test build
echo "🔨 Step 4: Testing production build"
if pnpm build; then
    echo "✅ Build successful!"
    echo ""
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo "========================================"
echo "🎉 Pre-deployment checks complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Set up your database:"
echo "   • Neon: https://neon.tech (recommended)"
echo "   • Supabase: https://supabase.com"
echo ""
echo "2. Get your database connection string"
echo ""
echo "3. Deploy to Vercel:"
echo "   • Method 1 (Dashboard): https://vercel.com/new"
echo "     - Import your GitHub repository"
echo "     - Add environment variables:"
echo "       DATABASE_URL=$SESSION_SECRET"
echo "       SESSION_SECRET=$SESSION_SECRET"
echo "       RESEND_API_KEY=re_your-key-here"
echo ""
echo "   • Method 2 (CLI):"
echo "     npm i -g vercel"
echo "     vercel login"
echo "     vercel --prod"
echo ""
echo "4. Initialize database:"
echo "   DATABASE_URL=\"your-prod-url\" pnpm db:push"
echo ""
echo "5. Create admin user:"
echo "   - Sign up at your deployed URL"
echo "   - Update role in database:"
echo "     UPDATE users SET role = 'admin' WHERE email = 'your@email.com';"
echo ""
echo "📚 For detailed instructions, see:"
echo "   • VERCEL_DEPLOYMENT.md - Complete guide"
echo "   • DEPLOY_CHECKLIST.md - Quick checklist"
echo "   • README.md - Full documentation"
echo ""
echo "🚀 Ready to deploy! Good luck!"

