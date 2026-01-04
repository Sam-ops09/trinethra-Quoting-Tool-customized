-- Add HSN/SAC code fields to quote_items and invoice_items tables
-- HSN (Harmonized System Nomenclature) for goods
-- SAC (Services Accounting Code) for services

-- Add to quote_items
ALTER TABLE quote_items
ADD COLUMN IF NOT EXISTS hsn_sac VARCHAR(10);

-- Add to invoice_items
ALTER TABLE invoice_items
ADD COLUMN IF NOT EXISTS hsn_sac VARCHAR(10);

-- Add comment for documentation
COMMENT ON COLUMN quote_items.hsn_sac IS 'HSN/SAC code for GST compliance (India)';
COMMENT ON COLUMN invoice_items.hsn_sac IS 'HSN/SAC code for GST compliance (India)';

