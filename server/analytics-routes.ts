/**
 * ANALYTICS & DASHBOARD ROUTES
 *
 * Comprehensive endpoints for dashboards and reporting
 */

import { Router, Response } from "express";
import { AuthRequest } from "./routes";
import { storage } from "./storage";
import { db } from "./db";
import { sql } from "drizzle-orm";

const router = Router();

/**
 * Sales & Quote Dashboard Analytics
 */
router.get("/analytics/sales-quotes", async (req: AuthRequest, res: Response) => {
  try {
    const allQuotes = await storage.getAllQuotes();
    const allClients = await storage.getAllClients();

    // Quotes by status
    const quotesByStatus = {
      draft: 0,
      sent: 0,
      approved: 0,
      rejected: 0,
      invoiced: 0,
    };

    const valueByStatus = {
      draft: 0,
      sent: 0,
      approved: 0,
      rejected: 0,
      invoiced: 0,
    };

    allQuotes.forEach((quote) => {
      const status = quote.status as keyof typeof quotesByStatus;
      if (quotesByStatus.hasOwnProperty(status)) {
        quotesByStatus[status]++;
        valueByStatus[status] += parseFloat(quote.total.toString());
      }
    });

    // Conversion rate
    const sentQuotes = quotesByStatus.sent + quotesByStatus.approved + quotesByStatus.rejected;
    const conversionRate = sentQuotes > 0 ? (quotesByStatus.approved / sentQuotes) * 100 : 0;

    // Average quote value
    const totalValue = allQuotes.reduce((sum, q) => sum + parseFloat(q.total.toString()), 0);
    const averageQuoteValue = allQuotes.length > 0 ? totalValue / allQuotes.length : 0;

    // Top customers
    const customerQuotes = new Map<string, { name: string; count: number; value: number }>();
    allQuotes.forEach((quote) => {
      const existing = customerQuotes.get(quote.clientId);
      const value = parseFloat(quote.total.toString());
      if (existing) {
        existing.count++;
        existing.value += value;
      } else {
        const client = allClients.find(c => c.id === quote.clientId);
        if (client) {
          customerQuotes.set(quote.clientId, {
            name: client.name,
            count: 1,
            value: value,
          });
        }
      }
    });

    const topCustomers = Array.from(customerQuotes.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        quoteCount: data.count,
        totalValue: data.value
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);

    // Monthly trend
    const monthlyData = new Map<string, { quotes: number; value: number; approved: number }>();
    allQuotes.forEach((quote) => {
      const date = new Date(quote.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const existing = monthlyData.get(monthKey);
      if (existing) {
        existing.quotes++;
        existing.value += parseFloat(quote.total.toString());
        if (quote.status === "approved") existing.approved++;
      } else {
        monthlyData.set(monthKey, {
          quotes: 1,
          value: parseFloat(quote.total.toString()),
          approved: quote.status === "approved" ? 1 : 0,
        });
      }
    });

    const monthlyTrend = Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);

    res.json({
      quotesByStatus,
      valueByStatus,
      conversionRate,
      averageQuoteValue: Math.round(averageQuoteValue),
      totalQuoteValue: Math.round(totalValue),
      topCustomers,
      monthlyTrend,
    });
  } catch (error) {
    console.error("Error fetching sales analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

/**
 * Vendor PO & Procurement Dashboard Analytics
 */
router.get("/analytics/vendor-po", async (req: AuthRequest, res: Response) => {
  try {
    const allPOs = await db.execute(sql`
      SELECT * FROM vendor_purchase_orders ORDER BY created_at DESC
    `);

    const allVendors = await storage.getAllVendors();

    // POs by status
    const posByStatus = {
      draft: 0,
      sent: 0,
      acknowledged: 0,
      fulfilled: 0,
      cancelled: 0,
    };

    let totalPOValue = 0;

    allPOs.rows.forEach((po: any) => {
      const status = po.status as keyof typeof posByStatus;
      if (posByStatus.hasOwnProperty(status)) {
        posByStatus[status]++;
      }
      totalPOValue += parseFloat(po.total_amount || 0);
    });

    const averagePOValue = allPOs.rows.length > 0 ? totalPOValue / allPOs.rows.length : 0;
    const fulfillmentRate = allPOs.rows.length > 0 ? (posByStatus.fulfilled / allPOs.rows.length) * 100 : 0;

    // Spend by vendor
    const vendorSpend = new Map<string, { name: string; spend: number; count: number }>();
    allPOs.rows.forEach((po: any) => {
      const existing = vendorSpend.get(po.vendor_id);
      const amount = parseFloat(po.total_amount || 0);
      if (existing) {
        existing.spend += amount;
        existing.count++;
      } else {
        const vendor = allVendors.find(v => v.id === po.vendor_id);
        if (vendor) {
          vendorSpend.set(po.vendor_id, {
            name: vendor.name,
            spend: amount,
            count: 1,
          });
        }
      }
    });

    const spendByVendor = Array.from(vendorSpend.entries())
      .map(([vendorId, data]) => ({
        vendorId,
        vendorName: data.name,
        totalSpend: Math.round(data.spend),
        poCount: data.count,
      }))
      .sort((a, b) => b.totalSpend - a.totalSpend);

    // Monthly spend
    const monthlySpendMap = new Map<string, { spend: number; count: number }>();
    allPOs.rows.forEach((po: any) => {
      const date = new Date(po.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const existing = monthlySpendMap.get(monthKey);
      const amount = parseFloat(po.total_amount || 0);
      if (existing) {
        existing.spend += amount;
        existing.count++;
      } else {
        monthlySpendMap.set(monthKey, { spend: amount, count: 1 });
      }
    });

    const monthlySpend = Array.from(monthlySpendMap.entries())
      .map(([month, data]) => ({ month, spend: Math.round(data.spend), poCount: data.count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);

    // PO vs GRN variance (placeholder - would need GRN integration)
    const poVsGrnVariance: any[] = [];

    res.json({
      posByStatus,
      totalPOValue: Math.round(totalPOValue),
      averagePOValue: Math.round(averagePOValue),
      spendByVendor,
      monthlySpend,
      poVsGrnVariance,
      fulfillmentRate,
    });
  } catch (error) {
    console.error("Error fetching PO analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

/**
 * Invoice & Collections Dashboard Analytics
 */
router.get("/analytics/invoice-collections", async (req: AuthRequest, res: Response) => {
  try {
    const allInvoices = await storage.getAllInvoices();
    const allClients = await storage.getAllClients();

    // Invoices by status
    const invoicesByStatus = {
      draft: 0,
      sent: 0,
      partial: 0,
      paid: 0,
      overdue: 0,
    };

    let totalOutstanding = 0;
    let totalPaid = 0;
    let overdueAmount = 0;
    let totalCollectionDays = 0;
    let paidInvoicesCount = 0;

    const now = new Date();

    allInvoices.forEach((invoice) => {
      const paidAmt = parseFloat(invoice.paidAmount.toString());
      const totalAmt = parseFloat(invoice.total.toString());
      const remaining = totalAmt - paidAmt;

      if (invoice.paymentStatus === "paid") {
        invoicesByStatus.paid++;
        totalPaid += totalAmt;

        // Calculate collection days
        const invoiceDate = new Date(invoice.createdAt);
        const paidDate = new Date(invoice.updatedAt);
        const days = Math.floor((paidDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
        totalCollectionDays += days;
        paidInvoicesCount++;
      } else if (invoice.paymentStatus === "partial") {
        invoicesByStatus.partial++;
        totalOutstanding += remaining;
      } else if (invoice.paymentStatus === "overdue") {
        invoicesByStatus.overdue++;
        totalOutstanding += remaining;
        overdueAmount += remaining;
      } else if (invoice.paymentStatus === "pending") {
        const invoiceDate = new Date(invoice.createdAt);
        const daysSince = Math.floor((now.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSince > 30) {
          invoicesByStatus.overdue++;
          overdueAmount += remaining;
        } else {
          invoicesByStatus.sent++;
        }
        totalOutstanding += remaining;
      }

      if (!invoice.isMaster) { // Only count non-master for status
        // Invoice payment statuses are: pending, partial, paid, overdue
        // No draft status for invoices
      }
    });

    const averageCollectionDays = paidInvoicesCount > 0 ? Math.round(totalCollectionDays / paidInvoicesCount) : 0;

    // Ageing buckets
    const ageingBuckets = [
      { bucket: "0-30 days", count: 0, amount: 0 },
      { bucket: "31-60 days", count: 0, amount: 0 },
      { bucket: "61-90 days", count: 0, amount: 0 },
      { bucket: "90+ days", count: 0, amount: 0 },
    ];

    allInvoices.forEach((invoice) => {
      if (invoice.paymentStatus !== "paid") {
        const invoiceDate = new Date(invoice.createdAt);
        const days = Math.floor((now.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
        const remaining = parseFloat(invoice.total.toString()) - parseFloat(invoice.paidAmount.toString());

        if (days <= 30) {
          ageingBuckets[0].count++;
          ageingBuckets[0].amount += remaining;
        } else if (days <= 60) {
          ageingBuckets[1].count++;
          ageingBuckets[1].amount += remaining;
        } else if (days <= 90) {
          ageingBuckets[2].count++;
          ageingBuckets[2].amount += remaining;
        } else {
          ageingBuckets[3].count++;
          ageingBuckets[3].amount += remaining;
        }
      }
    });

    ageingBuckets.forEach(bucket => {
      bucket.amount = Math.round(bucket.amount);
    });

    // Monthly collections
    const monthlyMap = new Map<string, { invoiced: number; collected: number }>();
    allInvoices.forEach((invoice) => {
      const date = new Date(invoice.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const existing = monthlyMap.get(monthKey);
      const totalAmt = parseFloat(invoice.total.toString());
      const paidAmt = parseFloat(invoice.paidAmount.toString());

      if (existing) {
        existing.invoiced += totalAmt;
        existing.collected += paidAmt;
      } else {
        monthlyMap.set(monthKey, {
          invoiced: totalAmt,
          collected: paidAmt,
        });
      }
    });

    const monthlyCollections = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        invoiced: Math.round(data.invoiced),
        collected: Math.round(data.collected),
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);

    // Top debtors
    const debtorMap = new Map<string, { name: string; outstanding: number; count: number; oldestDays: number }>();
    // NOTE: This section analyzes debtors but invoices don't have clientId directly
    // Would need to join with quotes table to get client information
    // Skipping detailed debtor analysis for now

    const topDebtors = Array.from(debtorMap.entries())
      .map(([clientId, data]) => ({
        clientId,
        clientName: data.name,
        outstandingAmount: Math.round(data.outstanding),
        invoiceCount: data.count,
        oldestInvoiceDays: data.oldestDays,
      }))
      .sort((a, b) => b.outstandingAmount - a.outstandingAmount)
      .slice(0, 20);

    res.json({
      invoicesByStatus,
      totalOutstanding: Math.round(totalOutstanding),
      totalPaid: Math.round(totalPaid),
      overdueAmount: Math.round(overdueAmount),
      averageCollectionDays,
      ageingBuckets,
      monthlyCollections,
      topDebtors,
    });
  } catch (error) {
    console.error("Error fetching invoice analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

/**
 * Serial Tracking Dashboard Analytics
 */
router.get("/analytics/serial-tracking", async (req: AuthRequest, res: Response) => {
  try {
    const serialNumbers = await db.execute(sql`
      SELECT * FROM serial_numbers ORDER BY created_at DESC
    `);

    const totalSerials = serialNumbers.rows.length;

    // Serials by status
    const serialsByStatus = {
      delivered: 0,
      in_stock: 0,
      returned: 0,
      defective: 0,
    };

    serialNumbers.rows.forEach((serial: any) => {
      const status = serial.status as keyof typeof serialsByStatus;
      if (serialsByStatus.hasOwnProperty(status)) {
        serialsByStatus[status]++;
      }
    });

    // Serials by product (placeholder - would need product integration)
    const serialsByProduct: Array<{ productName: string; count: number }> = [];

    // Warranty expiring
    const now = new Date();
    const warrantyExpiring = serialNumbers.rows
      .filter((serial: any) => serial.warranty_end_date)
      .map((serial: any) => {
        const endDate = new Date(serial.warranty_end_date);
        const daysRemaining = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return {
          serialNumber: serial.serial_number,
          productName: "Product", // Would need actual product lookup
          customerName: "Customer", // Would need actual customer lookup
          warrantyEndDate: serial.warranty_end_date,
          daysRemaining,
        };
      })
      .filter((item: any) => item.daysRemaining > 0 && item.daysRemaining <= 90)
      .sort((a: any, b: any) => a.daysRemaining - b.daysRemaining);

    res.json({
      totalSerials,
      serialsByProduct,
      warrantyExpiring,
      serialsByStatus,
    });
  } catch (error) {
    console.error("Error fetching serial tracking analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;

