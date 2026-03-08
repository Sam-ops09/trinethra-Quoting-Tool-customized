import { Router } from "express";
import { db } from "../db";
import { quotes, invoices, clients, products } from "../../shared/schema";
import { ilike, or, eq } from "drizzle-orm";
// We need to cast text to string to use ilike on integer columns (like quoteNumber) if necessary,
// but actually quoteNumber is integer, referenceNumber is text.
// Let's use raw SQL for unified LIKE on numbers, or just rely on ILIKE for text fields.
import { sql } from "drizzle-orm";
import { requireFeature } from "../feature-flags-middleware";

const router = Router();

// Apply search feature flag to all routes
router.use(requireFeature('ui_searchFilters'));

router.get("/", requireFeature('ui_searchFilters'), async (req, res) => {
  try {
    const q = req.query.q as string;
    console.log("[Search] Received search request for:", q);
    if (!q || q.trim() === "") {
      return res.json([]);
    }

    const searchTerm = `%${q.trim()}%`;
    const results: Array<{ id: string | number, type: string, title: string, subtitle: string, url: string }> = [];

    // Search Quotes
    const matchedQuotes = await db
      .select()
      .from(quotes)
      .where(
        or(
          ilike(quotes.referenceNumber, searchTerm),
          ilike(quotes.quoteNumber, searchTerm)
        )
      )
      .limit(5);

    matchedQuotes.forEach(quote => {
      results.push({
        id: `quote-${quote.id}`,
        type: "Quote",
        title: `Quote #${quote.quoteNumber}${quote.referenceNumber ? ` (${quote.referenceNumber})` : ''}`,
        subtitle: `Status: ${quote.status} | Total: ${quote.total}`,
        url: `/quotes/${quote.id}`
      });
    });

    // Search Invoices
    const matchedInvoices = await db
      .select()
      .from(invoices)
      .where(
        ilike(invoices.invoiceNumber, searchTerm)
      )
      .limit(5);

    matchedInvoices.forEach(inv => {
      results.push({
        id: `invoice-${inv.id}`,
        type: "Invoice",
        title: `Invoice ${inv.invoiceNumber}`,
        subtitle: `Status: ${inv.status} | Total: ${inv.total}`,
        url: `/invoices/${inv.id}`
      });
    });

    // Search Clients
    const matchedClients = await db
      .select()
      .from(clients)
      .where(
        or(
          ilike(clients.name, searchTerm),
          ilike(clients.email, searchTerm)
        )
      )
      .limit(5);

    matchedClients.forEach(client => {
      results.push({
        id: `client-${client.id}`,
        type: "Client",
        title: client.name,
        subtitle: client.email || "No email",
        url: `/clients/${client.id}`
      });
    });

    // Search Products
    const matchedProducts = await db
      .select()
      .from(products)
      .where(
        or(
          ilike(products.name, searchTerm),
          ilike(products.sku, searchTerm)
        )
      )
      .limit(5);

    matchedProducts.forEach(product => {
      results.push({
        id: `product-${product.id}`,
        type: "Product",
        title: product.name,
        subtitle: `SKU: ${product.sku} | Price: ${product.unitPrice}`,
        url: `/products` // Products page doesn't have individual detail pages currently based on standard routing
      });
    });

    console.log(`[Search] Found ${results.length} total results for '${q}' (Quotes: ${matchedQuotes.length}, Invoices: ${matchedInvoices.length}, Clients: ${matchedClients.length}, Products: ${matchedProducts.length})`);
    return res.json(results);
  } catch (error) {
    console.error("[Search Route Error]", error);
    return res.status(500).json({ error: "Search failed" });
  }
});

export default router;
