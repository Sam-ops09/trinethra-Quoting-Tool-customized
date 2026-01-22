-- Migration: Add 'created' to workflow_trigger_type enum
-- Description: Adds support for 'created' trigger type to workflows

DO $$ 
BEGIN
    ALTER TYPE workflow_trigger_type ADD VALUE IF NOT EXISTS 'created';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
