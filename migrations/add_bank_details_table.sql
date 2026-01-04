-- Add bank_details table
CREATE TABLE IF NOT EXISTS bank_details (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  ifsc_code TEXT NOT NULL,
  branch TEXT,
  swift_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_by VARCHAR(36) REFERENCES users(id),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on is_active for quick active record lookups
CREATE INDEX idx_bank_details_is_active ON bank_details(is_active);

-- Create index on created_at for ordering
CREATE INDEX idx_bank_details_created_at ON bank_details(created_at DESC);

