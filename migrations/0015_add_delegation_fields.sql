-- Add delegation fields to users table for approval authority delegation
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "delegated_approval_to" varchar,
ADD COLUMN IF NOT EXISTS "delegation_start_date" timestamp,
ADD COLUMN IF NOT EXISTS "delegation_end_date" timestamp,
ADD COLUMN IF NOT EXISTS "delegation_reason" text;

-- Add foreign key constraint
ALTER TABLE "users"
ADD CONSTRAINT "users_delegated_approval_to_fk"
FOREIGN KEY ("delegated_approval_to") REFERENCES "users"("id") ON DELETE SET NULL;

-- Create index for faster delegation queries
CREATE INDEX IF NOT EXISTS "users_delegation_idx" ON "users"("delegated_approval_to", "delegation_start_date", "delegation_end_date");

