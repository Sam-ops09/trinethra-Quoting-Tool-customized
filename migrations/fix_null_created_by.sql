-- Migration: Fix NULL created_by values in invoices
-- Created: 2025-12-05
-- Purpose: Update existing invoices with NULL created_by before schema enforcement

-- First, get a valid user ID (preferably an admin)
DO $$
DECLARE
    admin_user_id VARCHAR;
BEGIN
    -- Get the first admin user ID, or any user if no admin exists
    SELECT id INTO admin_user_id
    FROM users
    WHERE role = 'admin'
    LIMIT 1;

    -- If no admin, get any user
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id
        FROM users
        LIMIT 1;
    END IF;

    -- Update all invoices with NULL created_by
    IF admin_user_id IS NOT NULL THEN
        UPDATE invoices
        SET created_by = admin_user_id
        WHERE created_by IS NULL;

        RAISE NOTICE 'Updated % invoice(s) with created_by = %',
            (SELECT COUNT(*) FROM invoices WHERE created_by = admin_user_id),
            admin_user_id;
    ELSE
        RAISE EXCEPTION 'No users found in database. Cannot fix invoices.';
    END IF;
END $$;

-- Verify no NULL values remain
DO $$
DECLARE
    null_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_count
    FROM invoices
    WHERE created_by IS NULL;

    IF null_count > 0 THEN
        RAISE EXCEPTION 'Still have % invoice(s) with NULL created_by', null_count;
    ELSE
        RAISE NOTICE 'All invoices have valid created_by values';
    END IF;
END $$;

