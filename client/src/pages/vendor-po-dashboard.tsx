import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Download,
  DollarSign,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

interface VendorPOMetrics {
  posByStatus: {
    draft: number;
    sent: number;
    acknowledged: number;
    fulfilled: number;
    cancelled: number;
  };
  totalPOValue: number;
  averagePOValue: number;
  spendByVendor: Array<{
    vendorId: string;
    vendorName: string;
    totalSpend: number;
    poCount: number;
  }>;
  monthlySpend: Array<{
    month: string;
    spend: number;
    poCount: number;
  }>;
  poVsGrnVariance: Array<{
    poId: string;
    poNumber: string;
    orderedValue: number;
    receivedValue: number;
    variance: number;
    variancePercent: number;
  }>;
  fulfillmentRate: number;
}

const PO_STATUS_COLORS = {
  draft: "#94a3b8",
  sent: "#3b82f6",
  acknowledged: "#f59e0b",
  fulfilled: "#22c55e",
  cancelled: "#ef4444",
};

export default function VendorPODashboard() {
  const { data: metrics, isLoading } = useQuery<VendorPOMetrics>({
    queryKey: ["/api/analytics/vendor-po"],
  });

  const handleExportReport = async (format: "excel" | "pdf") => {
    try {
      const response = await fetch(`/api/reports/vendor-pos?format=${format}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vendor-po-report-${new Date().toISOString().split("T")[0]}.${format === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8 max-w-7xl mx-auto">
          <div className="space-y-4">
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const poStatusData = Object.entries(metrics?.posByStatus || {}).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: PO_STATUS_COLORS[status as keyof typeof PO_STATUS_COLORS],
  }));

  return (
    <div className="min-h-screen w-full">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Package className="h-7 w-7 text-primary" />
              Vendor PO & Procurement Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Purchase order tracking and vendor spend analysis
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExportReport("excel")}>
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button variant="outline" onClick={() => handleExportReport("pdf")}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Total POs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(metrics?.posByStatus || {}).reduce((a, b) => a + b, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active purchase orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total PO Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{(metrics?.totalPOValue || 0).toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All purchase orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Avg PO Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{(metrics?.averagePOValue || 0).toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per purchase order
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Fulfillment Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {metrics?.fulfillmentRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                POs completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* POs by Status */}
          <Card>
            <CardHeader>
              <CardTitle>POs by Status</CardTitle>
              <CardDescription>Distribution across fulfillment stages</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={poStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {poStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Spend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spend Trend</CardTitle>
              <CardDescription>Procurement spend over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metrics?.monthlySpend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`} />
                  <Area type="monotone" dataKey="spend" stroke="#3b82f6" fill="#3b82f6" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Spend by Vendor */}
        <Card>
          <CardHeader>
            <CardTitle>Spend by Vendor</CardTitle>
            <CardDescription>Top vendors by total spend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics?.spendByVendor && metrics.spendByVendor.length > 0 ? (
                metrics.spendByVendor.slice(0, 10).map((vendor, index) => (
                  <div key={vendor.vendorId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{vendor.vendorName || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{vendor.poCount || 0} POs</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{(vendor.totalSpend || 0).toLocaleString("en-IN")}</p>
                      <p className="text-sm text-muted-foreground">Total spend</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No vendor data available yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* PO vs GRN Variance */}
        <Card>
          <CardHeader>
            <CardTitle>PO vs GRN Variance</CardTitle>
            <CardDescription>Differences between ordered and received quantities/values</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.poVsGrnVariance && metrics.poVsGrnVariance.length > 0 ? (
                metrics.poVsGrnVariance.slice(0, 10).map((item) => (
                  <div key={item.poId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold">{item.poNumber || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">
                        Ordered: ₹{(item.orderedValue || 0).toLocaleString("en-IN")} |
                        Received: ₹{(item.receivedValue || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.variance !== 0 && (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                      <div className="text-right">
                        <p className={`font-semibold ${(item.variance || 0) < 0 ? "text-red-600" : (item.variance || 0) > 0 ? "text-green-600" : ""}`}>
                          {(item.variance || 0) > 0 ? "+" : ""}₹{(item.variance || 0).toLocaleString("en-IN")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(item.variancePercent || 0).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No variance data available yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

