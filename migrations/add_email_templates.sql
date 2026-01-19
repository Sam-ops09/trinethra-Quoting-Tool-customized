-- Migration: Add email_templates table
-- Created: 2026-01-19

-- Create enum type for email template types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_template_type') THEN
        CREATE TYPE email_template_type AS ENUM (
            'quote', 'invoice', 'sales_order', 'payment_reminder', 'password_reset', 'welcome'
        );
    END IF;
END$$;

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type email_template_type NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    available_variables TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_by VARCHAR REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on type for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(type);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

-- Add comment
COMMENT ON TABLE email_templates IS 'Admin-configurable email templates with variable substitution';
