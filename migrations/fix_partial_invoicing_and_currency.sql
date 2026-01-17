-- Migration: Fix Partial Invoicing and Add Currency
-- Created: 2026-01-17
-- Purpose: Allow multiple invoices per sales order and track currency

-- 1. Remove User-Hostile Constraint inhibiting Partial Invoicing
DROP INDEX IF EXISTS idx_invoices_sales_order_unique;

-- 2. Add Currency Columns (Default to INR for existing records)
DO $$
BEGIN
    -- Quotes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'currency') THEN
        ALTER TABLE quotes ADD COLUMN currency TEXT NOT NULL DEFAULT 'INR';
    END IF;

    -- Sales Orders
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_orders' AND column_name = 'currency') THEN
        ALTER TABLE sales_orders ADD COLUMN currency TEXT NOT NULL DEFAULT 'INR';
    END IF;

    -- Invoices
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'currency') THEN
        ALTER TABLE invoices ADD COLUMN currency TEXT NOT NULL DEFAULT 'INR';
    END IF;

    -- Vendor POs
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_purchase_orders' AND column_name = 'currency') THEN
        ALTER TABLE vendor_purchase_orders ADD COLUMN currency TEXT NOT NULL DEFAULT 'INR';
    END IF;
END $$;
