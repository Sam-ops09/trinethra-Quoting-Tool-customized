-- Add Tax Rates Table (if not already exists from schema)
-- Note: tax_rates table structure already exists in schema with different columns
-- This migration focuses on payment_terms table

-- Add Payment Terms Table
CREATE TABLE IF NOT EXISTS payment_terms (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  days INTEGER NOT NULL DEFAULT 0 CHECK (days >= 0),
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR REFERENCES users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_terms_is_default ON payment_terms(is_default);
CREATE INDEX IF NOT EXISTS idx_payment_terms_is_active ON payment_terms(is_active);

-- Insert default payment terms
INSERT INTO payment_terms (name, days, description, is_default) VALUES
  ('Due on Receipt', 0, 'Payment due immediately upon receipt', FALSE),
  ('Net 15', 15, 'Payment due within 15 days', FALSE),
  ('Net 30', 30, 'Payment due within 30 days', TRUE),
  ('Net 45', 45, 'Payment due within 45 days', FALSE),
  ('Net 60', 60, 'Payment due within 60 days', FALSE)
ON CONFLICT DO NOTHING;



