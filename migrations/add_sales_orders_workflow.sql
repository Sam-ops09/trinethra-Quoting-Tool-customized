-- Migration: Add Sales Orders workflow and Quote Version History
-- Created: 2026-01-04
-- Description: Adds quote_versions table for revision history, sales_orders and sales_order_items tables for the new workflow

-- Create new enum for sales order status
DO $$ BEGIN
    CREATE TYPE sales_order_status AS ENUM ('draft', 'confirmed', 'fulfilled', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create new enum for sales order item status
DO $$ BEGIN
    CREATE TYPE sales_order_item_status AS ENUM ('pending', 'partial', 'fulfilled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Quote Versions table - stores complete snapshots of quote at each revision
CREATE TABLE IF NOT EXISTS quote_versions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id VARCHAR NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    -- Snapshot of quote data at this version
    client_id VARCHAR NOT NULL,
    status TEXT NOT NULL,
    validity_days INTEGER,
    quote_date TIMESTAMP,
    valid_until TIMESTAMP,
    reference_number TEXT,
    attention_to TEXT,
    subtotal DECIMAL(12, 2) DEFAULT 0,
    discount DECIMAL(12, 2) DEFAULT 0,
    cgst DECIMAL(12, 2) DEFAULT 0,
    sgst DECIMAL(12, 2) DEFAULT 0,
    igst DECIMAL(12, 2) DEFAULT 0,
    shipping_charges DECIMAL(12, 2) DEFAULT 0,
    total DECIMAL(12, 2) DEFAULT 0,
    notes TEXT,
    terms_and_conditions TEXT,
    bom_section TEXT,
    sla_section TEXT,
    timeline_section TEXT,
    -- Snapshot of items as JSON
    items_snapshot TEXT NOT NULL, -- JSON array of quote items
    -- Metadata
    revision_notes TEXT,
    revised_by VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Sales Orders table - intermediate step between quotes and invoices
CREATE TABLE IF NOT EXISTS sales_orders (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    quote_id VARCHAR NOT NULL REFERENCES quotes(id),
    client_id VARCHAR NOT NULL REFERENCES clients(id),
    status sales_order_status NOT NULL DEFAULT 'draft',
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
    confirmed_at TIMESTAMP,
    confirmed_by VARCHAR REFERENCES users(id),
    created_by VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Sales Order Items table
CREATE TABLE IF NOT EXISTS sales_order_items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_order_id VARCHAR NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    fulfilled_quantity INTEGER NOT NULL DEFAULT 0,
    unit_price DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    hsn_sac VARCHAR(10),
    status sales_order_item_status NOT NULL DEFAULT 'pending',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add approval tracking fields to quotes table
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS approved_by VARCHAR REFERENCES users(id);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS approval_notes TEXT;

-- Add sales_order_id reference to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sales_order_id VARCHAR REFERENCES sales_orders(id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quote_versions_quote_id ON quote_versions(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_versions_version ON quote_versions(version);
CREATE INDEX IF NOT EXISTS idx_sales_orders_quote_id ON sales_orders(quote_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_client_id ON sales_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_order_items_order_id ON sales_order_items(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_sales_order_id ON invoices(sales_order_id);

-- Add comments for documentation
COMMENT ON TABLE quote_versions IS 'Stores complete snapshots of quotes at each revision for version history';
COMMENT ON TABLE sales_orders IS 'Intermediate step between approved quotes and invoices - Sales Order entity';
COMMENT ON TABLE sales_order_items IS 'Line items for sales orders';
COMMENT ON COLUMN quotes.approved_at IS 'Timestamp when quote was approved';
COMMENT ON COLUMN quotes.approved_by IS 'User who approved the quote';
COMMENT ON COLUMN quotes.approval_notes IS 'Notes added during quote approval';
COMMENT ON COLUMN invoices.sales_order_id IS 'Reference to the sales order this invoice was generated from';
