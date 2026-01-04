-- Add version field to quotes table
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Create index on quote_number and version for faster lookups
CREATE INDEX IF NOT EXISTS idx_quotes_number_version ON quotes(quote_number, version);

-- Update existing quotes to have version 1
UPDATE quotes SET version = 1 WHERE version IS NULL;

