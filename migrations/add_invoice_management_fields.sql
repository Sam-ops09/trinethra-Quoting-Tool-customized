-- Add invoice management fields for delete, finalize, lock, and cancel features
-- Migration: add_invoice_management_fields.sql

-- Add cancellation fields
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cancelled_by TEXT REFERENCES users(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Add finalization fields
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMP;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS finalized_by TEXT REFERENCES users(id);

-- Add lock field (separate from master_invoice_status)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;

-- Create index for performance on commonly queried fields
CREATE INDEX IF NOT EXISTS idx_invoices_cancelled_at ON invoices(cancelled_at);
CREATE INDEX IF NOT EXISTS idx_invoices_is_locked ON invoices(is_locked);
