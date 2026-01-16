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
import { analyticsService } from "./services/analytics.service";
import ExcelJS from "exceljs";
import { toDecimal, add, subtract, divide, toMoneyString } from "./utils/financial";
import { logger } from "./utils/logger";

const router = Router();

/**
 * Main Overview Analytics
 * Corresponds to /api/analytics
 */
router.get("/analytics", async (req: AuthRequest, res: Response) => {
  try {
    const allQuotes = await storage.getAllQuotes();
    const allClients = await storage.getAllClients();
    const allInvoices = await storage.getAllInvoices();

    // 1. Overview stats
    const totalQuotes = allQuotes.length;
    
    // Revenue from paid invoices
    const totalRevenueVal = allInvoices.reduce((sum, inv) => {
      if (inv.paymentStatus === 'paid' || inv.paymentStatus === 'partial') {
        return add(sum, inv.paidAmount);
      }
      return sum;
    }, toDecimal(0));

    // Average Deal Size (from Quotes)
    const totalQuoteValue = allQuotes.reduce((sum, q) => add(sum, q.total), toDecimal(0));
    const avgQuoteValue = allQuotes.length > 0 ? divide(totalQuoteValue, allQuotes.length) : toDecimal(0);

    // Conversion Rate (Invoices vs Quotes)
    // Simple approximation: converted quotes / total quotes
    const convertedQuotes = allQuotes.filter(q => q.status === 'invoiced' || q.status === 'closed_paid').length;
    const conversionRate = allQuotes.length > 0 ? (convertedQuotes / allQuotes.length) * 100 : 0;

    const overview = {
      totalQuotes,
      totalRevenue: Math.round(totalRevenueVal.toNumber()).toLocaleString(),
      avgQuoteValue: Math.round(avgQuoteValue.toNumber()).toLocaleString(),
      conversionRate: conversionRate.toFixed(1),
    };

    // 2. Monthly Data (Last 12 months)
    const monthlyDataMap = new Map<string, { quotes: number; revenue: number; conversions: number }>();
    const now = new Date();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleString('default', { month: 'short' });
        monthlyDataMap.set(key, { quotes: 0, revenue: 0, conversions: 0 });
    }

    allQuotes.forEach(q => {
        const d = new Date(q.createdAt);
        const key = d.toLocaleString('default', { month: 'short' });
        if (monthlyDataMap.has(key)) {
            const entry = monthlyDataMap.get(key)!;
            entry.quotes++;
            if (q.status === 'invoiced' || q.status === 'closed_paid') {
                entry.conversions++;
            }
        }
    });

    allInvoices.forEach(inv => {
        const d = new Date(inv.createdAt);
        const key = d.toLocaleString('default', { month: 'short' });
        if (monthlyDataMap.has(key)) {
            const entry = monthlyDataMap.get(key)!;
             if (inv.paymentStatus === 'paid' || inv.paymentStatus === 'partial') {
                entry.revenue = add(entry.revenue, inv.paidAmount).toNumber();
            }
        }
    });

    const monthlyData = Array.from(monthlyDataMap.entries()).map(([month, data]) => ({
        month,
        quotes: data.quotes,
        revenue: Math.round(data.revenue),
        conversions: data.conversions
    }));

    // 3. Top Clients
    const clientRevenue = new Map<string, number>();
    const clientQuotes = new Map<string, number>();

    allQuotes.forEach(q => {
        const curr = clientQuotes.get(q.clientId) || 0;
        clientQuotes.set(q.clientId, curr + 1);
    });

    // We use quotes total for potential revenue (frontend shows "Total Revenue" but context implies "Total Business Volume" or "Potential")
    // Or we can use actual revenue from invoices. Let's use Quote Total for "Top Accounts" context usually implies "Who we are quoting most to" or "Who pays most". 
    // The previous implementation used Quote Total. Let's stick to Quote Total for consistency with "Top Customers" in previous route, but rename to match interface.
    // Actually interface says `totalRevenue` string. Let's use Paid Invoice amount for actual revenue if possible, or Quote Total if not.
    // Let's use Quote Total as it represents "Deal Value" for Sales.
    const clientDealValue = new Map<string, number>();
    allQuotes.forEach(q => {
        const val = toDecimal(q.total);
        const curr = toDecimal(clientDealValue.get(q.clientId) || 0);
        clientDealValue.set(q.clientId, add(curr, val).toNumber());
    });

    const topClients = Array.from(clientDealValue.entries()).map(([clientId, val]) => {
        const client = allClients.find(c => c.id === clientId);
        return {
            name: client?.name || "Unknown",
            totalRevenue: Math.round(val).toLocaleString(),
            quoteCount: clientQuotes.get(clientId) || 0
        };
    }).sort((a, b) => parseFloat(b.totalRevenue.replace(/,/g, '')) - parseFloat(a.totalRevenue.replace(/,/g, ''))).slice(0, 5);


    // 4. Status Breakdown
    const statusMap = new Map<string, { count: number; value: number }>();
    allQuotes.forEach(q => {
        const status = q.status;
        const val = toDecimal(q.total);
        const entry = statusMap.get(status) || { count: 0, value: 0 };
        entry.count++;
        entry.value = add(entry.value, val).toNumber();
        statusMap.set(status, entry);
    });

    const statusBreakdown = Array.from(statusMap.entries()).map(([status, data]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count: data.count,
        value: Math.round(data.value)
    }));

    res.json({
      overview,
      monthlyData,
      topClients,
      statusBreakdown
    });

  } catch (error) {
    logger.error("Error fetching analytics overview:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

router.get("/analytics/forecast", async (req: AuthRequest, res: Response) => {
    const data = await analyticsService.getRevenueForecast();
    res.json(data);
});

router.get("/analytics/deal-distribution", async (req: AuthRequest, res: Response) => {
    const data = await analyticsService.getDealDistribution();
    res.json(data);
});

router.get("/analytics/regional", async (req: AuthRequest, res: Response) => {
    const data = await analyticsService.getRegionalDistribution();
    res.json(data);
});

router.get("/analytics/pipeline", async (req: AuthRequest, res: Response) => {
    const data = await analyticsService.getSalesPipeline();
    res.json(data);
});

router.get("/analytics/competitor-insights", async (req: AuthRequest, res: Response) => {
    const data = await analyticsService.getCompetitorInsights();
    res.json(data);
});

router.get("/analytics/export", async (req: AuthRequest, res: Response) => {
  try {
    const timeRange = req.query.timeRange as string || "12";
    let startDate: Date | undefined;
    let endDate = new Date(); // now

    if (timeRange !== 'all') {
      const months = parseInt(timeRange);
      if (!isNaN(months)) {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);
      }
    }

    // 1. Fetch all required data
    const quotesList = await analyticsService.getCustomReport({ startDate, endDate });
    const pipelineData = await analyticsService.getSalesPipeline();
    const regionalData = await analyticsService.getRegionalDistribution();
    
    // Calculate Summary Stats from the filtered quotes list
    const totalQuotes = quotesList.length;
    const totalRevenue = quotesList.reduce((sum, q) => sum + q.totalAmount, 0);
    const avgDealSize = totalQuotes > 0 ? totalRevenue / totalQuotes : 0;
    
    // Status Breakdown from filtered list
    const statusCounts: Record<string, number> = {};
    quotesList.forEach(q => {
        statusCounts[q.status] = (statusCounts[q.status] || 0) + 1;
    });

    // 2. Create Workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'T-Quoting Tool';
    workbook.created = new Date();

    // --- SHEET 1: DASHBOARD OVERVIEW ---
    const summarySheet = workbook.addWorksheet('Overview');
    
    summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 25 },
        { header: 'Value', key: 'value', width: 25, style: { numFmt: '"₹"#,##0' } }, // Default currency, will override for non-currency rows manually or just let it be?
    ];
    // Actually better to apply per-cell for mixed types, but let's try to handle the specific numeric rows.

    summarySheet.addRows([
        { metric: 'Report Date', value: new Date().toLocaleDateString() },
        { metric: 'Time Range', value: timeRange === 'all' ? 'All Time' : `Last ${timeRange} Months` },
        {}, // Empty row
        { metric: 'Total Quotes', value: totalQuotes },
        { metric: 'Total Revenue', value: totalRevenue },
        { metric: 'Average Deal Size', value: avgDealSize },
    ]);

    // Fix formats for specific rows
    summarySheet.getRow(2).getCell('value').numFmt = '@'; // Date/Text
    summarySheet.getRow(3).getCell('value').numFmt = '@'; 
    summarySheet.getRow(5).getCell('value').numFmt = '#,##0'; // Count
    summarySheet.getRow(6).getCell('value').numFmt = '"₹"#,##0'; // Revenue
    summarySheet.getRow(7).getCell('value').numFmt = '"₹"#,##0'; // Avg Deal


    summarySheet.getRow(1).font = { bold: true, size: 14 };
    
    // Add Pipeline Data to Overview Sheet (starting row 10)
    summarySheet.getCell('A9').value = 'Pipeline Stage';
    summarySheet.getCell('B9').value = 'Count';
    summarySheet.getCell('C9').value = 'Value';
    summarySheet.getCell('A9').font = { bold: true };
    summarySheet.getCell('B9').font = { bold: true };
    summarySheet.getCell('C9').font = { bold: true };

    let currentRow = 10;
    pipelineData.forEach(stage => {
        summarySheet.getCell(`A${currentRow}`).value = stage.stage;
        summarySheet.getCell(`B${currentRow}`).value = stage.count;
        summarySheet.getCell(`C${currentRow}`).value = stage.totalValue;
        summarySheet.getCell(`C${currentRow}`).numFmt = '"₹"#,##0';
        currentRow++;
    });

    // --- SHEET 2: REGIONAL DATA ---
    const regionSheet = workbook.addWorksheet('Regional Performance');
    regionSheet.columns = [
        { header: 'Region', key: 'region', width: 20 },
        { header: 'Quotes', key: 'count', width: 15, style: { numFmt: '#,##0' } },
        { header: 'Revenue', key: 'revenue', width: 20, style: { numFmt: '"₹"#,##0' } },
        { header: 'Share (%)', key: 'share', width: 15, style: { numFmt: '0.0"%"' } },
    ];
    regionSheet.getRow(1).font = { bold: true };
    
    regionalData.forEach(r => {
        regionSheet.addRow({
            region: r.region,
            count: r.quoteCount,
            revenue: r.totalRevenue,
            share: r.percentage.toFixed(1)
        });
    });

    // --- SHEET 3: DETAILED QUOTES ---
    const quotesSheet = workbook.addWorksheet('Quote Details');
    quotesSheet.columns = [
        { header: 'Quote Number', key: 'quoteNumber', width: 20 },
        { header: 'Client', key: 'clientName', width: 30 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Amount', key: 'totalAmount', width: 20, style: { numFmt: '"₹"#,##0' } },
        { header: 'Date', key: 'createdDate', width: 20 },
    ];
    quotesSheet.getRow(1).font = { bold: true };

    quotesList.forEach(q => {
        quotesSheet.addRow({
            quoteNumber: q.quoteNumber,
            clientName: q.clientName,
            status: q.status,
            totalAmount: q.totalAmount,
            createdDate: new Date(q.createdDate).toLocaleDateString()
        });
    });

    // Response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Analytics_Report_${new Date().toISOString().split('T')[0]}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    logger.error("Error exporting analytics report:", error);
    res.status(500).json({ error: "Failed to export report" });
  }
});


/**
 * Vendor Analytics
 */
router.get("/analytics/vendor-spend", async (req: AuthRequest, res: Response) => {
  try {
    const timeRange = req.query.timeRange as string || "12";
    
    const allPOs = await db.execute(sql`
      SELECT * FROM vendor_purchase_orders ORDER BY created_at DESC
    `);
    
    // Filter by time range if needed... currently getting all for simplicity or simple filter
    // Converting timeRange to date logic could be done here.

    const allVendors = await storage.getAllVendors();

    let totalSpend = 0;
    let totalPOs = 0;
    let fulfilledPOs = 0;
    let delayedPOs = 0;

    const vendorStats = new Map<string, { spend: number; count: number; fulfilled: number }>();

    allPOs.rows.forEach((po: any) => {
        const val = toDecimal(po.total || po.total_amount); // Handle diza vs raw
        totalSpend = add(totalSpend, val).toNumber();
        totalPOs++;

        if (po.status === 'fulfilled') fulfilledPOs++;
        
        // Check delay (if actual delivery > expected)
        if (po.actual_delivery_date && po.expected_delivery_date) {
            if (new Date(po.actual_delivery_date) > new Date(po.expected_delivery_date)) delayedPOs++;
        }

        const stats = vendorStats.get(po.vendor_id) || { spend: 0, count: 0, fulfilled: 0 };
        stats.spend = add(stats.spend, val).toNumber();
        stats.count++;
        if (po.status === 'fulfilled') stats.fulfilled++;
        vendorStats.set(po.vendor_id, stats);
    });

    const avgPoValue = totalPOs > 0 ? totalSpend / totalPOs : 0;

    const topVendors = Array.from(vendorStats.entries()).map(([vid, stat]) => {
        const v = allVendors.find(vend => vend.id === vid);
        return {
            vendorName: v?.name || "Unknown",
            totalSpend: Math.round(stat.spend).toLocaleString(),
            poCount: stat.count,
            avgPoValue: stat.count > 0 ? Math.round(stat.spend / stat.count).toLocaleString() : "0"
        };
    }).sort((a,b) => parseFloat(b.totalSpend.replace(/,/g,'')) - parseFloat(a.totalSpend.replace(/,/g,''))).slice(0, 5);

    const vendorPerformance = Array.from(vendorStats.entries()).map(([vid, stat]) => {
         const v = allVendors.find(vend => vend.id === vid);
         return {
            vendorName: v?.name || "Unknown",
            totalPOs: stat.count,
            fulfilledPOs: stat.fulfilled,
            onTimeDeliveryRate: "95%", // Placeholder - needs actual logic
            totalSpend: Math.round(stat.spend).toLocaleString()
         };
    }).slice(0, 10);

    const data = {
        overview: {
            totalSpend: Math.round(totalSpend).toLocaleString(),
            totalPOs,
            activeVendors: vendorStats.size,
            delayedPOs,
            avgPoValue: Math.round(avgPoValue).toLocaleString()
        },
        topVendors,
        vendorPerformance,
        procurementDelays: {
            count: delayedPOs,
            percentage: totalPOs > 0 ? ((delayedPOs / totalPOs) * 100).toFixed(1) : "0.0"
        }
    };

    res.json(data);
  } catch (error) {
    logger.error("Error fetching vendor analytics:", error);
    res.status(500).json({ error: "Failed to fetch vendor analytics" });
  }
});

/**
 * KEEPING ORIGINAL ROUTES FOR BACKWARD COMPATIBILITY IF NEEDED BY OTHER DASHBOARDS
 * (Renamed to avoid conflict if paths overlap, but here paths are distinct enough except for overlaps)
 * Actually, frontend 'dashboards/sales-quotes' etc might use these.
 * 
 * /analytics/sales-quotes -> Used by Sales Quote Dashboard?
 * /analytics/vendor-po -> Used by Vendor PO Dashboard?
 * /analytics/invoice-collections -> Used by Invoice Dashboard?
 * /analytics/serial-tracking -> Used by Serial Dashboard?
 * 
 * I will preserve them below.
 */

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
        valueByStatus[status] = add(valueByStatus[status], quote.total).toNumber();
      }
    });

    // Conversion rate
    const sentQuotes = quotesByStatus.sent + quotesByStatus.approved + quotesByStatus.rejected;
    const conversionRate = sentQuotes > 0 ? (quotesByStatus.approved / sentQuotes) * 100 : 0;

    // Average quote value
    // Average quote value
    const totalValue = allQuotes.reduce((sum, q) => add(sum, q.total), toDecimal(0));
    const averageQuoteValue = allQuotes.length > 0 ? divide(totalValue, allQuotes.length).toNumber() : 0;

    // Top customers
    const customerQuotes = new Map<string, { name: string; count: number; value: number }>();
    allQuotes.forEach((quote) => {
      const existing = customerQuotes.get(quote.clientId);
      const value = toDecimal(quote.total);
      if (existing) {
        existing.count++;
        existing.value = add(existing.value, value).toNumber();
      } else {
        const client = allClients.find(c => c.id === quote.clientId);
        if (client) {
          customerQuotes.set(quote.clientId, {
            name: client.name,
            count: 1,
            value: value.toNumber(),
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
        existing.value = add(existing.value, quote.total).toNumber();
        if (quote.status === "approved") existing.approved++;
      } else {
        monthlyData.set(monthKey, {
          quotes: 1,
          value: toDecimal(quote.total).toNumber(),
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
      totalQuoteValue: Math.round(totalValue.toNumber()),
      topCustomers,
      monthlyTrend,
    });
  } catch (error) {
    logger.error("Error fetching sales analytics:", error);
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
      const amount = toDecimal(po.total_amount);
      if (existing) {
        existing.spend = add(existing.spend, amount).toNumber();
        existing.count++;
      } else {
        const vendor = allVendors.find(v => v.id === po.vendor_id);
        if (vendor) {
          vendorSpend.set(po.vendor_id, {
            name: vendor.name,
            spend: amount.toNumber(),
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
      const amount = toDecimal(po.total_amount);
      if (existing) {
        existing.spend = add(existing.spend, amount).toNumber();
        existing.count++;
      } else {
        monthlySpendMap.set(monthKey, { spend: amount.toNumber(), count: 1 });
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
    logger.error("Error fetching PO analytics:", error);
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
      const paidAmt = toDecimal(invoice.paidAmount);
      const totalAmt = toDecimal(invoice.total);
      const remaining = subtract(totalAmt, paidAmt).toNumber();
      
      const totalAmtVal = totalAmt.toNumber();

      if (invoice.paymentStatus === "paid") {
        invoicesByStatus.paid++;
        totalPaid = add(totalPaid, totalAmt).toNumber();

        // Calculate collection days - use lastPaymentDate if available, otherwise updatedAt
        const invoiceDate = invoice.issueDate ? new Date(invoice.issueDate) : new Date(invoice.createdAt);
        const paidDate = invoice.lastPaymentDate ? new Date(invoice.lastPaymentDate) : new Date(invoice.updatedAt);
        const days = Math.floor((paidDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Only count positive days (avoid negative values from data issues)
        if (days >= 0) {
          totalCollectionDays += days;
          paidInvoicesCount++;
        }
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
        const remaining = subtract(invoice.total, invoice.paidAmount).toNumber();

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
      const totalAmt = toDecimal(invoice.total).toNumber();
      const paidAmt = toDecimal(invoice.paidAmount).toNumber();

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
    
    allInvoices.forEach((invoice) => {
      const remaining = toDecimal(invoice.remainingAmount);
      // Fallback for remainingAmount if not populated correctly (should be handled by business logic but safety check)
      const calcRemaining = subtract(invoice.total, invoice.paidAmount);
      
      const outstanding = Math.max(remaining.toNumber(), calcRemaining.toNumber());

      if (outstanding > 0 && invoice.clientId) {
         const existing = debtorMap.get(invoice.clientId);
         const invoiceDate = new Date(invoice.createdAt);
         const days = Math.floor((now.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
         
         if (existing) {
             existing.outstanding += outstanding;
             existing.count++;
             existing.oldestDays = Math.max(existing.oldestDays, days);
         } else {
             const client = allClients.find(c => c.id === invoice.clientId);
             
             debtorMap.set(invoice.clientId, {
                 name: client?.name || "Unknown Client",
                 outstanding: outstanding,
                 count: 1,
                 oldestDays: days
             });
         }
      }
    });

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
    logger.error("Error fetching invoice analytics:", error);
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
    logger.error("Error fetching serial tracking analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;

