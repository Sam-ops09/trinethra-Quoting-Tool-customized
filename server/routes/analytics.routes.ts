
import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware";
import { storage } from "../storage";
import { logger } from "../utils/logger";
import { analyticsService } from "../services/analytics.service";
import { db } from "../db";
import { sql } from "drizzle-orm";
import ExcelJS from "exceljs";
import { toDecimal, add, subtract, divide } from "../utils/financial";

const router = Router();

router.get("/dashboard", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const quotes = await storage.getAllQuotes();
      const clients = await storage.getAllClients();
      const invoices = await storage.getAllInvoices();

      const totalQuotes = quotes.length;
      const totalClients = clients.length;

      const safeToNum = (val: any) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        const str = String(val).replace(/[^0-9.-]+/g, "");
        return parseFloat(str) || 0;
      };

      const approvedQuotes = quotes.filter(q => q.status === "approved" || q.status === "invoiced" || q.status === "closed_paid");
      
      // Calculate Total Revenue from Invoices (Collected Amount)
      const totalRevenue = invoices.reduce((sum, inv) => sum + safeToNum(inv.paidAmount), 0);

      const conversionRate = totalQuotes > 0
        ? ((approvedQuotes.length / totalQuotes) * 100).toFixed(1)
        : "0";

      const recentQuotes = await Promise.all(
        quotes.slice(0, 5).map(async (quote) => {
          const client = await storage.getClient(quote.clientId);
          return {
            id: quote.id,
            quoteNumber: quote.quoteNumber,
            clientName: client?.name || "Unknown",
            total: quote.total,
            status: quote.status,
            createdAt: quote.createdAt,
          };
        })
      );

      // Create client map for faster lookup
      const clientMap = new Map(clients.map(c => [c.id, c]));

      // Top clients (by Collected Amount)
      const clientRevenue = new Map<string, { name: string; totalRevenue: number; quoteCount: number }>();
      
      for (const inv of invoices) {
        if (!inv.clientId) continue;
        const paid = safeToNum(inv.paidAmount);
        if (paid <= 0) continue;

        const client = clientMap.get(inv.clientId);
        if (!client) continue;
        
        const existing = clientRevenue.get(inv.clientId);
        if (existing) {
          existing.totalRevenue += paid;
          existing.quoteCount += 1;
        } else {
          clientRevenue.set(inv.clientId, {
            name: client.name,
            totalRevenue: paid,
            quoteCount: 1,
          });
        }
      }

      const topClients = Array.from(clientRevenue.values())
        .map(c => ({
          name: c.name,
          total: c.totalRevenue, // Send as number
          quoteCount: c.quoteCount,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      const quotesByStatus = quotes.reduce((acc: any[], quote) => {
        const existing = acc.find(item => item.status === quote.status);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({ status: quote.status, count: 1 });
        }
        return acc;
      }, []);

      // Monthly revenue (simplified - last 6 months)
      const monthlyRevenue = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const monthQuotes = approvedQuotes.filter(q => {
          const qDate = new Date(q.createdAt);
          return qDate.getMonth() === date.getMonth() && qDate.getFullYear() === date.getFullYear();
        });
        const revenue = monthQuotes.reduce((sum, q) => sum + safeToNum(q.total), 0);
        monthlyRevenue.push({ month, revenue });
      }

      return res.json({
        totalQuotes,
        totalClients,
        totalRevenue: totalRevenue.toFixed(2),
        conversionRate,
        recentQuotes,
        topClients,
        quotesByStatus,
        monthlyRevenue,
      });
    } catch (error) {
      logger.error("Analytics error:", error);
      return res.status(500).json({ error: "Failed to fetch analytics" });
    }
});

router.get("/:timeRange(\\d+)", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const timeRange = req.params.timeRange ? Number(req.params.timeRange) : 12;
      
      const quotes = await storage.getAllQuotes();
      const clients = await storage.getAllClients();

      // Filter by time range
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - timeRange);
      const filteredQuotes = quotes.filter(q => new Date(q.createdAt) >= cutoffDate);

      const approvedQuotes = filteredQuotes.filter(q => q.status === "approved" || q.status === "invoiced");
      const totalRevenue = approvedQuotes.reduce((sum, q) => sum + Number(q.total), 0);
      const avgQuoteValue = filteredQuotes.length > 0
        ? (filteredQuotes.reduce((sum, q) => sum + Number(q.total), 0) / filteredQuotes.length).toFixed(2)
        : "0";

      const conversionRate = filteredQuotes.length > 0
        ? ((approvedQuotes.length / filteredQuotes.length) * 100).toFixed(1)
        : "0";

      // Monthly data
      const monthlyData = [];
      for (let i = timeRange - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        
        const monthQuotes = filteredQuotes.filter(q => {
          const qDate = new Date(q.createdAt);
          return qDate.getMonth() === date.getMonth() && qDate.getFullYear() === date.getFullYear();
        });
        
        const monthApproved = monthQuotes.filter(q => q.status === "approved" || q.status === "invoiced");
        const revenue = monthApproved.reduce((sum, q) => sum + Number(q.total), 0);
        
        monthlyData.push({
          month,
          quotes: monthQuotes.length,
          revenue,
          conversions: monthApproved.length,
        });
      }

      // Top clients
      const clientRevenue = new Map<string, { name: string; totalRevenue: number; quoteCount: number }>();
      
      for (const quote of approvedQuotes) {
        const client = await storage.getClient(quote.clientId);
        if (!client) continue;
        
        const existing = clientRevenue.get(client.id);
        if (existing) {
          existing.totalRevenue += Number(quote.total);
          existing.quoteCount += 1;
        } else {
          clientRevenue.set(client.id, {
            name: client.name,
            totalRevenue: Number(quote.total),
            quoteCount: 1,
          });
        }
      }

      const topClients = Array.from(clientRevenue.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10)
        .map(c => ({
          name: c.name,
          totalRevenue: c.totalRevenue.toFixed(2),
          quoteCount: c.quoteCount,
        }));

      // Status breakdown
      const statusBreakdown = filteredQuotes.reduce((acc: any[], quote) => {
        const existing = acc.find(item => item.status === quote.status);
        const value = Number(quote.total);
        if (existing) {
          existing.count += 1;
          existing.value += value;
        } else {
          acc.push({ status: quote.status, count: 1, value });
        }
        return acc;
      }, []);

      return res.json({
        overview: {
          totalQuotes: filteredQuotes.length,
          totalRevenue: totalRevenue.toFixed(2),
          avgQuoteValue,
          conversionRate,
        },
        monthlyData,
        topClients,
        statusBreakdown,
      });
    } catch (error) {
      logger.error("Analytics error:", error);
      return res.status(500).json({ error: "Failed to fetch analytics" });
    }
});

// PHASE 3 - ADVANCED ANALYTICS ENDPOINTS
router.get("/forecast", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const monthsAhead = req.query.months ? Number(req.query.months) : 3;
      const forecast = await analyticsService.getRevenueForecast(monthsAhead);
      return res.json(forecast);
    } catch (error) {
      logger.error("Forecast error:", error);
      return res.status(500).json({ error: "Failed to fetch forecast" });
    }
});

router.get("/deal-distribution", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const distribution = await analyticsService.getDealDistribution();
      return res.json(distribution);
    } catch (error) {
      logger.error("Deal distribution error:", error);
      return res.status(500).json({ error: "Failed to fetch deal distribution" });
    }
});

router.get("/regional", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const regionalData = await analyticsService.getRegionalDistribution();
      return res.json(regionalData);
    } catch (error) {
      logger.error("Regional data error:", error);
      return res.status(500).json({ error: "Failed to fetch regional data" });
    }
});

router.post("/custom-report", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { startDate, endDate, status, minAmount, maxAmount } = req.body;
      const report = await analyticsService.getCustomReport({
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
        minAmount,
        maxAmount,
      });
      return res.json(report);
    } catch (error) {
      logger.error("Custom report error:", error);
      return res.status(500).json({ error: "Failed to generate custom report" });
    }
});

router.get("/pipeline", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const pipeline = await analyticsService.getSalesPipeline();
      return res.json(pipeline);
    } catch (error) {
      logger.error("Pipeline error:", error);
      return res.status(500).json({ error: "Failed to fetch pipeline data" });
    }
});

router.get("/client/:clientId/ltv", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const ltv = await analyticsService.getClientLifetimeValue(req.params.clientId);
      return res.json(ltv);
    } catch (error) {
      logger.error("LTV error:", error);
      return res.status(500).json({ error: "Failed to fetch client LTV" });
    }
});

router.get("/competitor-insights", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const insights = await analyticsService.getCompetitorInsights();
      return res.json(insights);
    } catch (error) {
      logger.error("Competitor insights error:", error);
      return res.status(500).json({ error: "Failed to fetch competitor insights" });
    }
});

// VENDOR ANALYTICS ENDPOINTS
router.get("/vendor-spend", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const timeRange = req.query.timeRange ? Number(req.query.timeRange) : 12;
      const vendors = await storage.getAllVendors();
      const vendorPos = await storage.getAllVendorPos();

      // Filter by time range
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - timeRange);
      const filteredPos = vendorPos.filter(po => new Date(po.createdAt) >= cutoffDate);

      // Calculate vendor spend
      const vendorSpend = new Map();
      for (const po of filteredPos) {
        const vendor = vendors.find(v => v.id === po.vendorId);
        if (vendor) {
          const existing = vendorSpend.get(po.vendorId);
          const poTotal = Number(po.total);
          if (existing) {
            existing.totalSpend += poTotal;
            existing.poCount += 1;
          } else {
            vendorSpend.set(po.vendorId, {
              vendorId: po.vendorId,
              vendorName: vendor.name,
              totalSpend: poTotal,
              poCount: 1,
              status: po.status,
            });
          }
        }
      }

      // Top vendors by spend
      const topVendors = Array.from(vendorSpend.values())
        .sort((a, b) => b.totalSpend - a.totalSpend)
        .slice(0, 10)
        .map(v => ({
          vendorId: v.vendorId,
          vendorName: v.vendorName,
          totalSpend: v.totalSpend.toFixed(2),
          poCount: v.poCount,
          avgPoValue: (v.totalSpend / v.poCount).toFixed(2),
        }));

      // Total procurement spend
      const totalSpend = filteredPos.reduce((sum, po) => sum + Number(po.total), 0);

      // Procurement delays (POs not fulfilled on time)
      const delayedPos = filteredPos.filter(po => {
        if (po.status === "fulfilled" && po.expectedDeliveryDate && po.actualDeliveryDate) {
          return new Date(po.actualDeliveryDate) > new Date(po.expectedDeliveryDate);
        }
        if (po.status !== "fulfilled" && po.expectedDeliveryDate) {
          return new Date() > new Date(po.expectedDeliveryDate);
        }
        return false;
      });

      // Vendor performance metrics
      const vendorPerformance = Array.from(vendorSpend.values()).map(v => {
        const vendorPOs = filteredPos.filter(po => po.vendorId === v.vendorId);
        const onTimePOs = vendorPOs.filter(po => {
          if (po.status === "fulfilled" && po.expectedDeliveryDate && po.actualDeliveryDate) {
            return new Date(po.actualDeliveryDate) <= new Date(po.expectedDeliveryDate);
          }
          return false;
        });

        const fulfilledCount = vendorPOs.filter(po => po.status === "fulfilled").length;
        const onTimeRate = fulfilledCount > 0 ? ((onTimePOs.length / fulfilledCount) * 100).toFixed(1) : "0";

        return {
          vendorName: v.vendorName,
          totalPOs: vendorPOs.length,
          fulfilledPOs: fulfilledCount,
          onTimeDeliveryRate: onTimeRate + "%",
          totalSpend: v.totalSpend.toFixed(2),
        };
      }).sort((a, b) => Number(b.totalSpend) - Number(a.totalSpend));

      return res.json({
        overview: {
          totalSpend: totalSpend.toFixed(2),
          totalPOs: filteredPos.length,
          activeVendors: vendorSpend.size,
          delayedPOs: delayedPos.length,
          avgPoValue: filteredPos.length > 0 ? (totalSpend / filteredPos.length).toFixed(2) : "0",
        },
        topVendors,
        vendorPerformance,
        procurementDelays: {
          count: delayedPos.length,
          percentage: filteredPos.length > 0 ? ((delayedPos.length / filteredPos.length) * 100).toFixed(1) : "0",
        },
      });
    } catch (error) {
      logger.error("Vendor analytics error:", error);
      return res.status(500).json({ error: "Failed to fetch vendor analytics" });
    }
});


// --- LEGACY / ADDITIONAL ANALYTICS ROUTES MERGED FROM analytics-routes.ts ---

router.get("/export", authMiddleware, async (req: AuthRequest, res: Response) => {
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
        { header: 'Value', key: 'value', width: 25, style: { numFmt: '#,##0.00' } }, 
    ];

    summarySheet.addRows([
        { metric: 'Report Date', value: new Date().toLocaleDateString() },
        { metric: 'Time Range', value: timeRange === 'all' ? 'All Time' : `Last ${timeRange} Months` },
        {}, // Empty row
        { metric: 'Total Quotes', value: totalQuotes },
        { metric: 'Total Revenue', value: totalRevenue },
        { metric: 'Average Deal Size', value: avgDealSize },
    ]);

    summarySheet.getRow(2).getCell('value').numFmt = '@'; 
    summarySheet.getRow(3).getCell('value').numFmt = '@'; 
    summarySheet.getRow(5).getCell('value').numFmt = '#,##0'; 
    summarySheet.getRow(6).getCell('value').numFmt = '#,##0.00'; 
    summarySheet.getRow(7).getCell('value').numFmt = '#,##0.00'; 

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
        summarySheet.getCell(`C${currentRow}`).numFmt = '#,##0.00';
        currentRow++;
    });

    // --- SHEET 2: REGIONAL DATA ---
    const regionSheet = workbook.addWorksheet('Regional Performance');
    regionSheet.columns = [
        { header: 'Region', key: 'region', width: 20 },
        { header: 'Quotes', key: 'count', width: 15, style: { numFmt: '#,##0' } },
        { header: 'Revenue', key: 'revenue', width: 20, style: { numFmt: '#,##0.00' } },
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
        { header: 'Amount', key: 'totalAmount', width: 20, style: { numFmt: '#,##0.00' } },
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

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Analytics_Report_${new Date().toISOString().split('T')[0]}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    logger.error("Error exporting analytics report:", error);
    res.status(500).json({ error: "Failed to export report" });
  }
});

router.get("/sales-quotes", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const allQuotes = await storage.getAllQuotes();
    const allClients = await storage.getAllClients();

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

    const sentQuotes = quotesByStatus.sent + quotesByStatus.approved + quotesByStatus.rejected;
    const conversionRate = sentQuotes > 0 ? (quotesByStatus.approved / sentQuotes) * 100 : 0;

    const totalValue = allQuotes.reduce((sum, q) => add(sum, q.total), toDecimal(0));
    const averageQuoteValue = allQuotes.length > 0 ? divide(totalValue, allQuotes.length).toNumber() : 0;

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

router.get("/vendor-po", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const allPOs = await db.execute(sql`
      SELECT * FROM vendor_purchase_orders ORDER BY created_at DESC
    `);

    const allVendors = await storage.getAllVendors();

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

router.get("/invoice-collections", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const allInvoices = await storage.getAllInvoices();
    const allClients = await storage.getAllClients();

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
      
      if (invoice.paymentStatus === "paid") {
        invoicesByStatus.paid++;
        totalPaid = add(totalPaid, totalAmt).toNumber();

        const invoiceDate = invoice.issueDate ? new Date(invoice.issueDate) : new Date(invoice.createdAt);
        const paidDate = invoice.lastPaymentDate ? new Date(invoice.lastPaymentDate) : new Date(invoice.updatedAt);
        const days = Math.floor((paidDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
        
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
    });

    const averageCollectionDays = paidInvoicesCount > 0 ? Math.round(totalCollectionDays / paidInvoicesCount) : 0;

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

    const debtorMap = new Map<string, { name: string; outstanding: number; count: number; oldestDays: number }>();
    
    allInvoices.forEach((invoice) => {
      const remaining = toDecimal(invoice.remainingAmount);
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

router.get("/serial-tracking", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const serialNumbers = await db.execute(sql`
      SELECT * FROM serial_numbers ORDER BY created_at DESC
    `);

    const totalSerials = serialNumbers.rows.length;

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

    const serialsByProduct: Array<{ productName: string; count: number }> = [];

    const now = new Date();
    const warrantyExpiring = serialNumbers.rows
      .filter((serial: any) => serial.warranty_end_date)
      .map((serial: any) => {
        const endDate = new Date(serial.warranty_end_date);
        const daysRemaining = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return {
          serialNumber: serial.serial_number,
          productName: "Product", 
          customerName: "Customer", 
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
