import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Download, AlertTriangle, CheckCircle, Clock, BarChart3, TrendingDown, Factory } from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Interface (Unchanged)
interface SerialTrackingMetrics {
    totalSerials: number;
    serialsByProduct: Array<{
        productName: string;
        count: number;
    }>;
    warrantyExpiring: Array<{
        serialNumber: string;
        productName: string;
        customerName: string;
        warrantyEndDate: string;
        daysRemaining: number;
    }>;
    serialsByStatus: {
        delivered: number;
        in_stock: number;
        returned: number;
        defective: number;
    };
}

// Color mapping for Status Pie Chart
const STATUS_PIE_COLORS: Record<string, string> = {
    delivered: "#22c55e", // Green
    in_stock: "#3b82f6", // Blue
    returned: "#f59e0b", // Amber
    defective: "#ef4444", // Red
};

// --- Helper Components ---

// 1. Stat Card Component
const StatCard = ({ title, value, subValue, icon: Icon, iconColor, subLabel }: { title: string, value: string | number, subValue: string | number, icon: any, iconColor: string, subLabel: string }) => (
    <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
                {title}
                <div className={`p-1 rounded-md ${iconColor}/10`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground mt-1">
                {subValue} {subLabel}
            </p>
        </CardContent>
    </Card>
);

// 2. Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 bg-background border rounded-lg shadow-lg text-sm space-y-1">
                <p className="font-bold">{label}</p>
                <Separator className="my-1" />
                {payload.map((item: any) => (
                    <p key={item.dataKey} style={{ color: item.color }}>
                        {item.name}: {' '}
                        <span className="font-semibold">{item.value.toLocaleString()} Units</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// 3. Skeleton Loader (Simplified and adapted)
const DashboardSkeleton = () => (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
            <div className="space-y-1">
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-4 w-96 hidden sm:block" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-9 w-28" />
            </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2 p-4 border rounded-lg">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-7 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Skeleton className="h-[380px] rounded-lg xl:col-span-2" />
            <Skeleton className="h-[380px] rounded-lg xl:col-span-1" />
        </div>

        {/* Warranty List */}
        <Skeleton className="h-[380px] rounded-lg" />
    </div>
);


// --- Main Component ---

export default function SerialTrackingDashboard() {
    const { data: metrics, isLoading } = useQuery<SerialTrackingMetrics>({
        queryKey: ["/api/analytics/serial-tracking"],
    });

    // Export Logic (Unchanged)
    const handleExportReport = async (format: "excel" | "pdf") => {
        try {
            const response = await fetch(`/api/reports/serial-numbers?format=${format}`, {
                credentials: "include",
            });

            if (!response.ok) throw new Error("Export failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `serial-report-${new Date().toISOString().split("T")[0]}.${format === "excel" ? "xlsx" : "pdf"}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Export error:", error);
        }
    };

    if (isLoading || !metrics) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
                <DashboardSkeleton />
            </div>
        );
    }

    // Data transformations
    const statusData = Object.entries(metrics.serialsByStatus).map(([status, count]) => ({
        name: status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()), // Convert snake_case to Title Case
        value: count,
        color: STATUS_PIE_COLORS[status],
    }));

    const expiringSoonCount = metrics.warrantyExpiring.filter(w => w.daysRemaining <= 90).length;

    return (
        <div className="min-h-screen w-full">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">

                {/* Sticky Header with Title and Actions */}
                <div className="sticky top-0 z-10 bg-muted/30 dark:bg-background pt-1 pb-3 backdrop-blur-sm -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8">
                    <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-3">
                            <Package className="h-7 w-7 text-primary shrink-0" />
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                                    Serial Tracking & Warranty
                                </h1>
                                <p className="text-sm text-muted-foreground hidden sm:block">
                                    Real-time traceability and warranty lifecycle management.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                            <Button variant="outline" size="sm" onClick={() => handleExportReport("excel")}>
                                <Download className="h-4 w-4 mr-2" />
                                Export Excel
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleExportReport("pdf")}>
                                <Download className="h-4 w-4 mr-2" />
                                Export PDF
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Serials"
                        value={metrics.totalSerials.toLocaleString()}
                        subValue={metrics.totalSerials}
                        icon={Package}
                        iconColor="text-blue-500"
                        subLabel="Tracked Units"
                    />
                    <StatCard
                        title="Units Delivered"
                        value={metrics.serialsByStatus.delivered.toLocaleString()}
                        subValue={`${Math.round((metrics.serialsByStatus.delivered / metrics.totalSerials) * 100) || 0}%`}
                        icon={CheckCircle}
                        iconColor="text-green-600"
                        subLabel="Of Total"
                    />
                    <StatCard
                        title="Warranty Expiring"
                        value={expiringSoonCount.toLocaleString()}
                        subValue={expiringSoonCount > 0 ? 'Urgent Action' : 'Stable'}
                        icon={Clock}
                        iconColor={expiringSoonCount > 0 ? "text-red-600" : "text-yellow-600"}
                        subLabel="Units (90 days)"
                    />
                    <StatCard
                        title="Defective Units"
                        value={metrics.serialsByStatus.defective.toLocaleString()}
                        subValue={metrics.serialsByStatus.defective}
                        icon={AlertTriangle}
                        iconColor="text-red-600"
                        subLabel="Reported Issues"
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Status Distribution (Pie Chart) */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Status Distribution</CardTitle>
                            <CardDescription>Breakdown by current unit location/status.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={90}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Serials by Product (Bar Chart) */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Units by Product</CardTitle>
                            <CardDescription>Total serial numbers tracked per product line.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={metrics.serialsByProduct || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                                    <XAxis
                                        dataKey="productName"
                                        interval={0}
                                        angle={-25}
                                        textAnchor="end"
                                        height={70}
                                        stroke="#666"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis stroke="#666" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" name="Serials" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Warranty Expiring Soon - High Impact List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDown className="h-5 w-5 text-red-600" />
                            Warranty Expiration Watchlist
                        </CardTitle>
                        <CardDescription>Units with warranty ending in the next **90 days** ({expiringSoonCount} units).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {metrics.warrantyExpiring && expiringSoonCount > 0 ? (
                                metrics.warrantyExpiring
                                    .filter(w => w.daysRemaining <= 90)
                                    .sort((a, b) => a.daysRemaining - b.daysRemaining)
                                    .map((item) => {
                                        const days = item.daysRemaining || 0;
                                        const urgencyClass = days <= 30 ? "border-red-500/50 bg-red-500/5" :
                                            days <= 60 ? "border-yellow-500/50 bg-yellow-500/5" :
                                                "border-border bg-background";

                                        return (
                                            <div
                                                key={item.serialNumber}
                                                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg transition-shadow shadow-sm ${urgencyClass} hover:shadow-md`}
                                            >
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <p className="font-mono font-bold text-sm truncate">{item.serialNumber || 'N/A'}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                                        <Factory className="h-3 w-3 inline mr-1" />
                                                        {item.productName || 'Unknown'} for {item.customerName || 'Unknown Customer'}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-4 mt-2 sm:mt-0 shrink-0">
                                                    {days <= 60 && (
                                                        <Badge variant="destructive" className="h-5 text-xs px-2 bg-red-500/90 hover:bg-red-600">
                                                            {days <= 30 ? 'CRITICAL' : 'WARNING'}
                                                        </Badge>
                                                    )}
                                                    <div className="text-right">
                                                        <p className={`font-bold text-lg ${days <= 30 ? "text-red-600" : days <= 60 ? "text-yellow-600" : "text-foreground"}`}>
                                                            {days} days
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Ends: {item.warrantyEndDate ? new Date(item.warrantyEndDate).toLocaleDateString('en-GB') : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500 opacity-50" />
                                    <p className="text-sm">No critical warranty expirations found in the next 90 days.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}