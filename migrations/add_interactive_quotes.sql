-- Migration: Add Interactive Quotes Support
-- Quote Comments table for threaded client questions
-- Optional items support for quote line items

-- Quote Comments table for public comment thread
CREATE TABLE IF NOT EXISTS quote_comments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id VARCHAR NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  author_type TEXT NOT NULL CHECK (author_type IN ('client', 'internal')),
  author_name TEXT NOT NULL,
  author_email TEXT,
  message TEXT NOT NULL,
  parent_comment_id VARCHAR REFERENCES quote_comments(id) ON DELETE CASCADE,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for efficient comment lookups
CREATE INDEX IF NOT EXISTS idx_quote_comments_quote_id ON quote_comments(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_comments_parent ON quote_comments(parent_comment_id);

-- Add optional item support to quote_items
ALTER TABLE quote_items ADD COLUMN IF NOT EXISTS is_optional BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE quote_items ADD COLUMN IF NOT EXISTS is_selected BOOLEAN NOT NULL DEFAULT true;

-- Add client signature field for quote acceptance
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_signature TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_accepted_at TIMESTAMP;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_accepted_name TEXT;
