-- Command to clear all data except for the 'users' table
-- usage: psql -d <your_database_name> -f clear_data_except_users.sql

TRUNCATE TABLE
  clients,
  quotes,
  quote_versions,
  sales_orders,
  sales_order_items,
  quote_items,
  invoices,
  payment_history,
  invoice_items,
  invoice_attachments,
  vendors,
  vendor_purchase_orders,
  vendor_po_items,
  products,
  goods_received_notes,
  serial_numbers,
  templates,
  activity_logs,
  settings,
  bank_details,
  client_tags,
  client_communications,
  tax_rates,
  payment_terms,
  pricing_tiers,
  currency_settings
RESTART IDENTITY CASCADE;
