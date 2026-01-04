-- Migration: Add is_master field to invoices table
-- Created: 2025-12-05
-- Purpose: Enable master-child invoice hierarchy

-- Add is_master field if it doesn't exist
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_master BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster master invoice queries
CREATE INDEX IF NOT EXISTS idx_invoices_is_master ON invoices(is_master);

-- Update existing invoices without parent to be masters if they're the first invoice for a quote
UPDATE invoices
SET is_master = true
WHERE parent_invoice_id IS NULL
  AND id IN (
    SELECT DISTINCT ON (quote_id) id
    FROM invoices
    WHERE parent_invoice_id IS NULL
    ORDER BY quote_id, created_at ASC
  );

