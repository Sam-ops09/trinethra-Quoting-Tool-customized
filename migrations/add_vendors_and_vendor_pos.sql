-- Add vendors and vendor PO tables

-- Create vendors table
CREATE TABLE IF NOT EXISTS "vendors" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "address" TEXT,
  "gstin" TEXT,
  "pan" TEXT,
  "contact_person" TEXT,
  "payment_terms" TEXT,
  "notes" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_by" VARCHAR NOT NULL REFERENCES "users"("id"),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create vendor POs table
CREATE TABLE IF NOT EXISTS "vendor_pos" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "po_number" TEXT NOT NULL UNIQUE,
  "vendor_id" VARCHAR NOT NULL REFERENCES "vendors"("id"),
  "quote_id" VARCHAR REFERENCES "quotes"("id"),
  "status" vendor_po_status NOT NULL DEFAULT 'draft',
  "po_date" TIMESTAMP NOT NULL DEFAULT NOW(),
  "delivery_date" TIMESTAMP,
  "reference_number" TEXT,
  "subtotal" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  "discount" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  "cgst" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  "sgst" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  "igst" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  "shipping_charges" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  "total" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  "notes" TEXT,
  "terms_and_conditions" TEXT,
  "created_by" VARCHAR NOT NULL REFERENCES "users"("id"),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create vendor PO items table
CREATE TABLE IF NOT EXISTS "vendor_po_items" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "vendor_po_id" VARCHAR NOT NULL REFERENCES "vendor_pos"("id") ON DELETE CASCADE,
  "description" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unit_price" DECIMAL(12, 2) NOT NULL,
  "subtotal" DECIMAL(12, 2) NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_vendors_created_by" ON "vendors"("created_by");
CREATE INDEX IF NOT EXISTS "idx_vendors_is_active" ON "vendors"("is_active");
CREATE INDEX IF NOT EXISTS "idx_vendor_pos_vendor_id" ON "vendor_pos"("vendor_id");
CREATE INDEX IF NOT EXISTS "idx_vendor_pos_quote_id" ON "vendor_pos"("quote_id");
CREATE INDEX IF NOT EXISTS "idx_vendor_pos_status" ON "vendor_pos"("status");
CREATE INDEX IF NOT EXISTS "idx_vendor_pos_created_by" ON "vendor_pos"("created_by");
CREATE INDEX IF NOT EXISTS "idx_vendor_po_items_vendor_po_id" ON "vendor_po_items"("vendor_po_id");

