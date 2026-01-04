-- Migration: Pre-push data fixes
-- Created: 2025-12-05
-- Purpose: Fix all data issues before drizzle-kit push

-- ============================================
-- FIX 1: NULL created_by values in invoices
-- ============================================
DO $$
DECLARE
    admin_user_id VARCHAR;
    null_invoice_count INTEGER;
BEGIN
    -- Count invoices with NULL created_by
    SELECT COUNT(*) INTO null_invoice_count
    FROM invoices
    WHERE created_by IS NULL;

    IF null_invoice_count > 0 THEN
        RAISE NOTICE 'Found % invoice(s) with NULL created_by, fixing...', null_invoice_count;

        -- Get first admin user
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

        -- Update invoices
        IF admin_user_id IS NOT NULL THEN
            UPDATE invoices
            SET created_by = admin_user_id
            WHERE created_by IS NULL;

            RAISE NOTICE '✓ Fixed % invoice(s) with created_by = %', null_invoice_count, admin_user_id;
        ELSE
            RAISE EXCEPTION '✗ No users found in database. Cannot fix invoices.';
        END IF;
    ELSE
        RAISE NOTICE '✓ All invoices have valid created_by values';
    END IF;
END $$;

-- ============================================
-- FIX 2: Add is_master column if missing
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'invoices'
        AND column_name = 'is_master'
    ) THEN
        RAISE NOTICE 'Adding is_master column to invoices table...';
        ALTER TABLE invoices ADD COLUMN is_master BOOLEAN NOT NULL DEFAULT false;
        CREATE INDEX IF NOT EXISTS idx_invoices_is_master ON invoices(is_master);

        -- Set existing invoices without parent as masters
        UPDATE invoices
        SET is_master = true
        WHERE parent_invoice_id IS NULL
          AND id IN (
            SELECT DISTINCT ON (quote_id) id
            FROM invoices
            WHERE parent_invoice_id IS NULL
            ORDER BY quote_id, created_at ASC
          );

        RAISE NOTICE '✓ Added is_master column and flagged master invoices';
    ELSE
        RAISE NOTICE '✓ is_master column already exists';
    END IF;
END $$;

-- ============================================
-- FIX 3: Ensure unique constraints won't fail
-- ============================================

-- Check for duplicate PO numbers
DO $$
DECLARE
    dup_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO dup_count
    FROM (
        SELECT po_number, COUNT(*) as cnt
        FROM vendor_purchase_orders
        GROUP BY po_number
        HAVING COUNT(*) > 1
    ) duplicates;

    IF dup_count > 0 THEN
        RAISE NOTICE 'Found % duplicate PO number(s), fixing...', dup_count;

        -- Add sequence numbers to duplicates
        WITH ranked AS (
            SELECT
                id,
                po_number,
                ROW_NUMBER() OVER (PARTITION BY po_number ORDER BY created_at) as rn
            FROM vendor_purchase_orders
        )
        UPDATE vendor_purchase_orders vpo
        SET po_number = ranked.po_number || '-' || ranked.rn
        FROM ranked
        WHERE vpo.id = ranked.id
        AND ranked.rn > 1;

        RAISE NOTICE '✓ Fixed duplicate PO numbers';
    ELSE
        RAISE NOTICE '✓ No duplicate PO numbers found';
    END IF;
END $$;

-- Check for duplicate product SKUs
DO $$
DECLARE
    dup_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO dup_count
    FROM (
        SELECT sku, COUNT(*) as cnt
        FROM products
        GROUP BY sku
        HAVING COUNT(*) > 1
    ) duplicates;

    IF dup_count > 0 THEN
        RAISE NOTICE 'Found % duplicate SKU(s), fixing...', dup_count;

        -- Add sequence numbers to duplicates
        WITH ranked AS (
            SELECT
                id,
                sku,
                ROW_NUMBER() OVER (PARTITION BY sku ORDER BY created_at) as rn
            FROM products
        )
        UPDATE products p
        SET sku = ranked.sku || '-' || ranked.rn
        FROM ranked
        WHERE p.id = ranked.id
        AND ranked.rn > 1;

        RAISE NOTICE '✓ Fixed duplicate SKUs';
    ELSE
        RAISE NOTICE '✓ No duplicate SKUs found';
    END IF;
END $$;

-- Check for duplicate GRN numbers
DO $$
DECLARE
    dup_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO dup_count
    FROM (
        SELECT grn_number, COUNT(*) as cnt
        FROM goods_received_notes
        GROUP BY grn_number
        HAVING COUNT(*) > 1
    ) duplicates;

    IF dup_count > 0 THEN
        RAISE NOTICE 'Found % duplicate GRN number(s), fixing...', dup_count;

        -- Add sequence numbers to duplicates
        WITH ranked AS (
            SELECT
                id,
                grn_number,
                ROW_NUMBER() OVER (PARTITION BY grn_number ORDER BY created_at) as rn
            FROM goods_received_notes
        )
        UPDATE goods_received_notes grn
        SET grn_number = ranked.grn_number || '-' || ranked.rn
        FROM ranked
        WHERE grn.id = ranked.id
        AND ranked.rn > 1;

        RAISE NOTICE '✓ Fixed duplicate GRN numbers';
    ELSE
        RAISE NOTICE '✓ No duplicate GRN numbers found';
    END IF;
END $$;

-- ============================================
-- FIX 4: Safely remove payment_history.child_invoice_id and its FK
-- ============================================
DO $$
DECLARE
    has_column BOOLEAN := FALSE;
    has_constraint BOOLEAN := FALSE;
BEGIN
    -- Check if column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'payment_history'
          AND column_name = 'child_invoice_id'
    ) INTO has_column;

    -- Check if constraint exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_name = kcu.table_name
        WHERE tc.table_name = 'payment_history'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND tc.constraint_name = 'payment_history_child_invoice_id_child_invoices_id_fk'
    ) INTO has_constraint;

    IF has_constraint THEN
        RAISE NOTICE 'Dropping existing FK constraint payment_history_child_invoice_id_child_invoices_id_fk';
        EXECUTE 'ALTER TABLE payment_history DROP CONSTRAINT payment_history_child_invoice_id_child_invoices_id_fk';
    ELSE
        RAISE NOTICE 'FK constraint payment_history_child_invoice_id_child_invoices_id_fk does not exist; nothing to drop';
    END IF;

    IF has_column THEN
        RAISE NOTICE 'Dropping column payment_history.child_invoice_id';
        EXECUTE 'ALTER TABLE payment_history DROP COLUMN child_invoice_id';
    ELSE
        RAISE NOTICE 'Column payment_history.child_invoice_id does not exist; nothing to drop';
    END IF;
END $$;

-- ============================================
-- FINAL VERIFICATION
-- ============================================
DO $$
DECLARE
    null_created_by INTEGER;
    has_is_master BOOLEAN;
BEGIN
    -- Check for NULL created_by
    SELECT COUNT(*) INTO null_created_by
    FROM invoices
    WHERE created_by IS NULL;

    -- Check for is_master column
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'invoices'
        AND column_name = 'is_master'
    ) INTO has_is_master;

    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'PRE-PUSH VERIFICATION COMPLETE';
    RAISE NOTICE '============================================';

    IF null_created_by = 0 AND has_is_master THEN
        RAISE NOTICE '✓ All checks passed!';
        RAISE NOTICE '✓ Safe to run: pnpm db:push';
    ELSE
        IF null_created_by > 0 THEN
            RAISE EXCEPTION '✗ Still have % invoice(s) with NULL created_by', null_created_by;
        END IF;
        IF NOT has_is_master THEN
            RAISE EXCEPTION '✗ is_master column missing from invoices table';
        END IF;
    END IF;
END $$;
