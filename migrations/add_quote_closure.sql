-- Migration: Add closure status to quotes
-- This completes the standard business flow by adding "closed_paid" status

-- Step 1: Add new status values to the enum
-- Note: PostgreSQL requires adding values one at a time
ALTER TYPE quote_status ADD VALUE IF NOT EXISTS 'closed_paid';
ALTER TYPE quote_status ADD VALUE IF NOT EXISTS 'closed_cancelled';

-- Step 2: Add closure tracking fields to quotes table
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS closed_by VARCHAR REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS closure_notes TEXT;

-- Step 3: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_quotes_closed_at ON quotes(closed_at);
CREATE INDEX IF NOT EXISTS idx_quotes_closed_by ON quotes(closed_by);

-- Step 4: Add comment for documentation
COMMENT ON COLUMN quotes.closed_at IS 'Timestamp when quote was closed (fully paid or cancelled)';
COMMENT ON COLUMN quotes.closed_by IS 'User who closed the quote';
COMMENT ON COLUMN quotes.closure_notes IS 'Notes about the closure (reason for cancellation, final remarks, etc.)';

