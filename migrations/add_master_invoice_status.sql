-- Add Master Invoice Status Enum and Field
-- Migration created: 2025-12-06

-- Step 1: Create the master_invoice_status enum
DO $$ BEGIN
  CREATE TYPE master_invoice_status AS ENUM ('draft', 'confirmed', 'locked');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add the masterInvoiceStatus column to invoices table
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS master_invoice_status master_invoice_status;

-- Step 3: Set default status for existing master invoices to 'draft'
UPDATE invoices
SET master_invoice_status = 'draft'
WHERE is_master = true AND master_invoice_status IS NULL;

-- Step 4: Add comment for documentation
COMMENT ON COLUMN invoices.master_invoice_status IS 'Status for master invoices: draft (can be edited), confirmed (finalized baseline), locked (fully locked after all child invoices generated)';

