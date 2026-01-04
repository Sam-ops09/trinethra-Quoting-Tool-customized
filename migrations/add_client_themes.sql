-- Migration: Add segment and preferredTheme to clients table
-- This migration adds support for client segmentation and theme customization

-- Add segment column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS segment TEXT;

-- Add preferredTheme column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferred_theme TEXT;

-- Add comments for documentation
COMMENT ON COLUMN clients.segment IS 'Client segment: enterprise, corporate, startup, government, education, creative';
COMMENT ON COLUMN clients.preferred_theme IS 'Preferred PDF theme: professional, modern, minimal, creative, premium, government, education';

-- Create index for better performance when filtering by segment
CREATE INDEX IF NOT EXISTS idx_clients_segment ON clients(segment);
CREATE INDEX IF NOT EXISTS idx_clients_preferred_theme ON clients(preferred_theme);

