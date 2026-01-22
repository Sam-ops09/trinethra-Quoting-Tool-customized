import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, Clock, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/currency";

interface VendorAnalytics {
  overview: {
    totalSpend: string;
    totalPOs: number;
    activeVendors: number;
    delayedPOs: number;
    avgPoValue: string;
  };
  topVendors: Array<{
    vendorName: string;
    totalSpend: string;
    poCount: number;
    avgPoValue: string;
  }>;
  vendorPerformance: Array<{
    vendorName: string;
    totalPOs: number;
    fulfilledPOs: number;
    onTimeDeliveryRate: string;
    totalSpend: string;
  }>;
  procurementDelays: {
    count: number;
    percentage: string;
  };
}

interface VendorAnalyticsSectionProps {
  timeRange: string;
}

export function VendorAnalyticsSection({ timeRange }: VendorAnalyticsSectionProps) {
  const { data, isLoading } = useQuery<VendorAnalytics>({
    queryKey: ["/api/analytics/vendor-spend", timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/vendor-spend?timeRange=${timeRange}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch vendor analytics");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.overview.totalSpend)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.overview.totalPOs} purchase orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.activeVendors}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg PO: {formatCurrency(data.overview.avgPoValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Purchase Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalPOs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.overview.totalPOs - data.overview.delayedPOs} on-time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Delayed POs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{data.overview.delayedPOs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.procurementDelays.percentage}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Vendors */}
      <Card>
        <CardHeader>
          <CardTitle>Top Vendors by Spend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topVendors.slice(0, 5).map((vendor, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-muted/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{vendor.vendorName}</p>
                    <p className="text-xs text-muted-foreground">{vendor.poCount} POs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatCurrency(vendor.totalSpend)}</p>
                  <p className="text-xs text-muted-foreground">
                    Avg: {formatCurrency(vendor.avgPoValue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vendor Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-2 font-semibold">Vendor</th>
                  <th className="pb-2 font-semibold text-right">Total POs</th>
                  <th className="pb-2 font-semibold text-right">Fulfilled</th>
                  <th className="pb-2 font-semibold text-right">On-Time Rate</th>
                  <th className="pb-2 font-semibold text-right">Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.vendorPerformance.slice(0, 10).map((vendor, index) => (
                  <tr key={index} className="hover:bg-muted/40">
                    <td className="py-3">{vendor.vendorName}</td>
                    <td className="py-3 text-right">{vendor.totalPOs}</td>
                    <td className="py-3 text-right">{vendor.fulfilledPOs}</td>
                    <td className="py-3 text-right">
                      <Badge variant={parseFloat(vendor.onTimeDeliveryRate) >= 80 ? "default" : "destructive"}>
                        {vendor.onTimeDeliveryRate}
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-semibold">
                      {formatCurrency(vendor.totalSpend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VendorAnalyticsSection;
