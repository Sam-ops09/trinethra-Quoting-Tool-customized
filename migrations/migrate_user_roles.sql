-- Migration: Update user roles from old to new enum values
-- This must be run BEFORE updating the schema

-- Step 1: Create a temporary column for the new role
ALTER TABLE users ADD COLUMN role_new TEXT;

-- Step 2: Map old roles to new roles
UPDATE users SET role_new = CASE
    WHEN role = 'admin' THEN 'admin'
    WHEN role = 'manager' THEN 'sales_manager'
    WHEN role = 'user' THEN 'sales_executive'
    WHEN role = 'viewer' THEN 'viewer'
    ELSE 'sales_executive' -- Default for any unexpected values
END;

-- Step 3: Drop the old role column
ALTER TABLE users DROP COLUMN role;

-- Step 4: Rename the new column to role
ALTER TABLE users RENAME COLUMN role_new TO role;

-- Step 5: Now the schema update can proceed with the new enum
-- Run this separately: pnpm run db:push

