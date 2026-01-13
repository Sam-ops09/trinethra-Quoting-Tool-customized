-- Migration to add invoice_attachments table
-- This table stores PDF attachments and other files associated with invoices

CREATE TABLE IF NOT EXISTS invoice_attachments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id VARCHAR NOT NULL REFERENCES invoices(id),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoice_attachments_invoice_id ON invoice_attachments(invoice_id);
