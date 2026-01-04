# Quick Deployment Guide

## What Changed
Fixed the module resolution error by bundling the API serverless function properly for Vercel deployment.

## Files Modified
1. **package.json** - Added `build:api` script
2. **vercel.json** - Changed to use bundled API file
3. **api/tsconfig.json** - Fixed circular reference
4. **api/bundled.js** - Generated bundle (auto-created during build)

## Deploy to Vercel

### Option 1: Via Git (Recommended)
```bash
git add .
git commit -m "Fix: Bundle API for Vercel deployment"
git push
```
Vercel will automatically deploy when it detects the push.

### Option 2: Using Vercel CLI
```bash
# Build first
pnpm run build

# Deploy
vercel --prod
```

## Environment Variables Required
Make sure these are set in Vercel dashboard:
- `DATABASE_URL` - Your database connection string
- `SESSION_SECRET` - A secure random string for sessions
- `RESEND_API_KEY` or SMTP settings - For email functionality

## Testing After Deployment
1. Check Vercel deployment logs for any errors
2. Test the login endpoint: `https://your-domain.vercel.app/api/auth/login`
3. Check browser console - should see successful API responses
4. Verify no `ERR_MODULE_NOT_FOUND` errors

## Rollback if Needed
If something goes wrong:
```bash
vercel rollback
```

## Local Testing
To test the bundled API locally:
```bash
pnpm run build
pnpm start
```

Then visit: http://localhost:5000

