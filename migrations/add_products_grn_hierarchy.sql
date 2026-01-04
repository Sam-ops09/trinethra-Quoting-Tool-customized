-- Migration: Add Products, GRN, Serial Numbers, and Hierarchical Invoicing
-- Created: 2025-12-05
-- Purpose: Complete the enterprise-grade procurement system

-- Products/Inventory table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    unit_price DECIMAL(12, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER NOT NULL DEFAULT 0,
    requires_serial_number BOOLEAN NOT NULL DEFAULT false,
    warranty_months INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Goods Received Notes (GRN) table
CREATE TABLE IF NOT EXISTS goods_received_notes (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    grn_number TEXT NOT NULL UNIQUE,
    vendor_po_id VARCHAR NOT NULL REFERENCES vendor_purchase_orders(id),
    vendor_po_item_id VARCHAR NOT NULL REFERENCES vendor_po_items(id),
    received_date TIMESTAMP NOT NULL DEFAULT NOW(),
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER NOT NULL,
    quantity_rejected INTEGER NOT NULL DEFAULT 0,
    inspection_status TEXT NOT NULL DEFAULT 'pending',
    inspected_by VARCHAR REFERENCES users(id),
    inspection_notes TEXT,
    delivery_note_number TEXT,
    batch_number TEXT,
    attachments TEXT,
    created_by VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Serial Numbers table with complete tracking
CREATE TABLE IF NOT EXISTS serial_numbers (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number TEXT NOT NULL UNIQUE,
    product_id VARCHAR REFERENCES products(id),
    vendor_id VARCHAR REFERENCES vendors(id),
    vendor_po_id VARCHAR REFERENCES vendor_purchase_orders(id),
    vendor_po_item_id VARCHAR REFERENCES vendor_po_items(id),
    grn_id VARCHAR REFERENCES goods_received_notes(id),
    invoice_id VARCHAR REFERENCES invoices(id),
    invoice_item_id VARCHAR REFERENCES invoice_items(id),
    status TEXT NOT NULL DEFAULT 'in_stock',
    warranty_start_date TIMESTAMP,
    warranty_end_date TIMESTAMP,
    location TEXT,
    notes TEXT,
    created_by VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add hierarchical invoice support
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS parent_invoice_id VARCHAR REFERENCES invoices(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS milestone_description TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_grn_vendor_po ON goods_received_notes(vendor_po_id);
CREATE INDEX IF NOT EXISTS idx_grn_vendor_po_item ON goods_received_notes(vendor_po_item_id);
CREATE INDEX IF NOT EXISTS idx_grn_received_date ON goods_received_notes(received_date);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_number ON serial_numbers(serial_number);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_product ON serial_numbers(product_id);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_status ON serial_numbers(status);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_vendor_po ON serial_numbers(vendor_po_id);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_grn ON serial_numbers(grn_id);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_invoice ON serial_numbers(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_parent ON invoices(parent_invoice_id);

-- Create trigger to auto-calculate available quantity for products
CREATE OR REPLACE FUNCTION update_product_available_quantity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.available_quantity := NEW.stock_quantity - NEW.reserved_quantity;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_product_available_quantity
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_available_quantity();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create function to generate GRN numbers
CREATE OR REPLACE FUNCTION generate_grn_number()
RETURNS TEXT AS $$
DECLARE
    last_number TEXT;
    next_number INTEGER;
BEGIN
    SELECT grn_number INTO last_number
    FROM goods_received_notes
    ORDER BY created_at DESC
    LIMIT 1;

    IF last_number IS NULL THEN
        RETURN 'GRN-0001';
    ELSE
        next_number := CAST(SUBSTRING(last_number FROM 5) AS INTEGER) + 1;
        RETURN 'GRN-' || LPAD(next_number::TEXT, 4, '0');
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE products IS 'Product catalog with inventory tracking';
COMMENT ON TABLE goods_received_notes IS 'Records of goods received from vendors with inspection details';
COMMENT ON TABLE serial_numbers IS 'Complete serial number tracking from vendor to customer with warranty info';
COMMENT ON COLUMN invoices.parent_invoice_id IS 'For child invoices - references the master invoice';
COMMENT ON COLUMN invoices.milestone_description IS 'Description for milestone-based billing';

