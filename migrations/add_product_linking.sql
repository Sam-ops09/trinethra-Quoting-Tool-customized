-- Add productId column to all item tables for product catalog linking

-- Add product_id to quote_items
ALTER TABLE quote_items ADD COLUMN IF NOT EXISTS product_id VARCHAR REFERENCES products(id);

-- Add product_id to sales_order_items
ALTER TABLE sales_order_items ADD COLUMN IF NOT EXISTS product_id VARCHAR REFERENCES products(id);

-- Add product_id to invoice_items
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS product_id VARCHAR REFERENCES products(id);

-- Add product_id to vendor_po_items
ALTER TABLE vendor_po_items ADD COLUMN IF NOT EXISTS product_id VARCHAR REFERENCES products(id);
