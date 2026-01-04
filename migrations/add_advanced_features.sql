-- Migration: Add advanced features - Multiple invoices, Vendor POs, Serial numbers
-- Created: 2025-12-05

-- Create new enums
DO $$ BEGIN
    CREATE TYPE vendor_po_status AS ENUM ('draft', 'sent', 'acknowledged', 'fulfilled', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invoice_item_status AS ENUM ('pending', 'fulfilled', 'partial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    gstin TEXT,
    contact_person TEXT,
    payment_terms TEXT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Invoice Items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id VARCHAR NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    fulfilled_quantity INTEGER NOT NULL DEFAULT 0,
    unit_price DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    serial_numbers TEXT,
    status invoice_item_status NOT NULL DEFAULT 'pending',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Vendor Purchase Orders table
CREATE TABLE IF NOT EXISTS vendor_purchase_orders (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number TEXT NOT NULL UNIQUE,
    quote_id VARCHAR NOT NULL REFERENCES quotes(id),
    vendor_id VARCHAR NOT NULL REFERENCES vendors(id),
    status vendor_po_status NOT NULL DEFAULT 'draft',
    order_date TIMESTAMP NOT NULL DEFAULT NOW(),
    expected_delivery_date TIMESTAMP,
    actual_delivery_date TIMESTAMP,
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    cgst DECIMAL(12, 2) NOT NULL DEFAULT 0,
    sgst DECIMAL(12, 2) NOT NULL DEFAULT 0,
    igst DECIMAL(12, 2) NOT NULL DEFAULT 0,
    shipping_charges DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    terms_and_conditions TEXT,
    created_by VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Vendor PO Items table
CREATE TABLE IF NOT EXISTS vendor_po_items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_po_id VARCHAR NOT NULL REFERENCES vendor_purchase_orders(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    received_quantity INTEGER NOT NULL DEFAULT 0,
    unit_price DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    serial_numbers TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Alter invoices table to support multiple invoices per quote
-- Drop the unique constraint on quote_id if it exists
DO $$
BEGIN
    ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_quote_id_unique;
    ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_quote_id_key;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Add new columns to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cgst DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sgst DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS igst DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS shipping_charges DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_master BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS created_by VARCHAR REFERENCES users(id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_vendors_email ON vendors(email);
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_vendor_pos_quote_id ON vendor_purchase_orders(quote_id);
CREATE INDEX IF NOT EXISTS idx_vendor_pos_vendor_id ON vendor_purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_pos_status ON vendor_purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_vendor_po_items_po_id ON vendor_po_items(vendor_po_id);
CREATE INDEX IF NOT EXISTS idx_invoices_quote_id ON invoices(quote_id);
CREATE INDEX IF NOT EXISTS idx_invoices_is_master ON invoices(is_master);

-- Update existing invoices to copy quote totals (if needed)
-- This ensures backward compatibility
UPDATE invoices i
SET
    subtotal = COALESCE((SELECT q.subtotal FROM quotes q WHERE q.id = i.quote_id), 0),
    discount = COALESCE((SELECT q.discount FROM quotes q WHERE q.id = i.quote_id), 0),
    cgst = COALESCE((SELECT q.cgst FROM quotes q WHERE q.id = i.quote_id), 0),
    sgst = COALESCE((SELECT q.sgst FROM quotes q WHERE q.id = i.quote_id), 0),
    igst = COALESCE((SELECT q.igst FROM quotes q WHERE q.id = i.quote_id), 0),
    shipping_charges = COALESCE((SELECT q.shipping_charges FROM quotes q WHERE q.id = i.quote_id), 0),
    total = COALESCE((SELECT q.total FROM quotes q WHERE q.id = i.quote_id), 0),
    notes = COALESCE((SELECT q.notes FROM quotes q WHERE q.id = i.quote_id), ''),
    terms_and_conditions = COALESCE((SELECT q.terms_and_conditions FROM quotes q WHERE q.id = i.quote_id), ''),
    is_master = true
WHERE i.subtotal = 0 OR i.total = 0;

