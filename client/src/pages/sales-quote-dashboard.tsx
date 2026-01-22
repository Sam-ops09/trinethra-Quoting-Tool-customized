import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    FileText,
    DollarSign,
    CheckCircle,
    XCircle,
    Clock,
    Download,
    BarChart3,
    Users,
    Percent,
    Loader2,
} from "lucide-react";
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
    AreaChart,
    Area,
} from "recharts";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { formatCurrency } from "@/lib/currency";

// Interface (Unchanged)
interface SalesMetrics {
    quotesByStatus: {
        draft: number;
        sent: number;
        approved: number;
        rejected: number;
        invoiced: number;
    };
    valueByStatus: {
        draft: number;
        sent: number;
        approved: number;
        rejected: number;
        invoiced: number;
    };
    conversionRate: number;
    averageQuoteValue: number;
    totalQuoteValue: number;
    topCustomers: Array<{
        id: string;
        name: string;
        quoteCount: number;
        totalValue: number;
    }>;
    monthlyTrend: Array<{
        month: string;
        quotes: number;
        value: number;
        approved: number;
    }>;
}

const STATUS_COLORS = {
    draft: "#94a3b8", // Slate
    sent: "#3b82f6", // Blue
    approved: "#22c55e", // Green
    rejected: "#ef4444", // Red
    invoiced: "#8b5cf6", // Violet
    closed_paid: "#f59e0b", // Amber
    closed_cancelled: "#737373", // Neutral
};



// --- Component Start ---

export default function SalesQuoteDashboard() {
    const { toast } = useToast();
    const [exportingFormat, setExportingFormat] = useState<"excel" | "pdf" | null>(null);

    // Feature flags
    const canExportExcel = useFeatureFlag('advanced_excelExport');
    const canExportPDF = useFeatureFlag('quotes_pdfGeneration');

    const { data: metrics, isLoading } = useQuery<SalesMetrics>({
        queryKey: ["/api/analytics/sales-quotes"],
    });

    // Export Logic with improved error handling
    const handleExportReport = async (format: "excel" | "pdf") => {
        setExportingFormat(format);

        try {
            toast({
                title: "Preparing export...",
                description: `Generating ${format.toUpperCase()} report`,
            });

            const response = await fetch(`/api/reports/quotes?format=${format}`, {
                credentials: "include",
                headers: {
                    "Accept": format === "excel"
                        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        : "application/pdf",
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Export failed with status ${response.status}`);
            }

            const blob = await response.blob();

            // Verify blob has content
            if (blob.size === 0) {
                throw new Error("Generated file is empty");
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;

            const dateStr = new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
            }).replace(/,/g, "");

            a.download = `Quote Report ${dateStr}.${format === "excel" ? "xlsx" : "pdf"}`;
            document.body.appendChild(a);
            a.click();

            // Clean up
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 100);

            toast({
                title: "Export successful!",
                description: `Report downloaded as ${format.toUpperCase()}`,
            });
        } catch (error) {
            console.error("Export error:", error);
            toast({
                title: "Export failed",
                description: error instanceof Error ? error.message : "Could not generate report. Please try again.",
                variant: "destructive",
            });
        } finally {
            setExportingFormat(null);
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
    const quoteStatusData = Object.entries(metrics.quotesByStatus).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
        icon: status === 'approved' ? CheckCircle : status === 'rejected' ? XCircle : Clock,
    }));

    const valueStatusData = Object.entries(metrics.valueByStatus).map(([status, value]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: Math.round(value),
        color: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
    }));

    const totalQuotes = Object.values(metrics.quotesByStatus).reduce((a, b) => a + b, 0);


    return (
        <div className="min-h-screen w-full">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">

                {/* Sticky Header with Title and Actions */}
                <div className="sticky top-0 z-10 bg-muted/30 dark:bg-background pt-1 pb-3 backdrop-blur-sm -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8">
                    <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="h-7 w-7 text-primary shrink-0" />
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                                    Sales & Quote Performance
                                </h1>
                                <p className="text-sm text-muted-foreground hidden sm:block">
                                    Analyze pipeline health and conversion rates.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                            {canExportExcel && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExportReport("excel")}
                                disabled={exportingFormat !== null}
                              >
                                {exportingFormat === "excel" ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4 mr-2" />
                                )}
                                Export Excel
                              </Button>
                            )}
                            {canExportPDF && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExportReport("pdf")}
                                disabled={exportingFormat !== null}
                              >
                                {exportingFormat === "pdf" ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4 mr-2" />
                                )}
                                Export PDF
                              </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Quotes"
                        value={totalQuotes}
                        subValue={formatCurrency(metrics.totalQuoteValue)}
                        icon={FileText}
                        iconColor="text-blue-500"
                        subLabel="Total Value"
                    />
                    <StatCard
                        title="Conversion Rate"
                        value={`${metrics.conversionRate.toFixed(1)}%`}
                        subValue="High Priority"
                        icon={Percent}
                        iconColor="text-green-600"
                        subLabel="Sent → Approved"
                    />
                    <StatCard
                        title="Avg Quote Value"
                        value={formatCurrency(metrics.averageQuoteValue)}
                        subValue="Per Quote"
                        icon={DollarSign}
                        iconColor="text-orange-500"
                        subLabel="Average"
                    />
                    <StatCard
                        title="Approved Value"
                        value={formatCurrency(metrics.valueByStatus.approved)}
                        subValue={`${metrics.quotesByStatus.approved} Quotes`}
                        icon={CheckCircle}
                        iconColor="text-green-600"
                        subLabel="Converted"
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

                    {/* Quotes by Status (Pie Chart) */}
                    <Card className="xl:col-span-1">
                        <CardHeader>
                            <CardTitle>Quotes by Count</CardTitle>
                            <CardDescription>Distribution across pipeline stages.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={quoteStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={90}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {quoteStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip isCurrency={false} />} />
                                    <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Value by Status (Bar Chart) */}
                    <Card className="xl:col-span-2">
                        <CardHeader>
                            <CardTitle>Value by Status</CardTitle>
                            <CardDescription>Total quote value in each stage (INR).</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={valueStatusData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                                    <XAxis dataKey="name" stroke="#666" />
                                    <YAxis tickFormatter={(val) => formatCurrency(val)} stroke="#666" />
                                    <Tooltip content={<CustomTooltip isCurrency={true} />} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                        {valueStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Trend & Top Customers */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Monthly Trend (Area Chart) */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Monthly Performance Trend</CardTitle>
                            <CardDescription>Quotes created (Total) vs. Approved over the last few months.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={metrics.monthlyTrend || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                                    <XAxis dataKey="month" stroke="#666" />
                                    <YAxis stroke="#666" />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="quotes" stroke="#3b82f6" fillOpacity={0.5} fill="url(#colorQuotes)" name="Total Quotes" />
                                    <Area type="monotone" dataKey="approved" stroke="#22c55e" fillOpacity={0.5} fill="url(#colorApproved)" name="Approved Quotes" />
                                    <defs>
                                        <linearGradient id="colorQuotes" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Top Customers (List) */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Top Customers</CardTitle>
                            <CardDescription>By Quote Value (Top {Math.min(10, metrics.topCustomers.length)}).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
                            {metrics.topCustomers && metrics.topCustomers.length > 0 ? (
                                metrics.topCustomers.slice(0, 10).map((customer, index) => (
                                    <div key={customer.id} className="flex items-center justify-between p-2 border-b last:border-b-0 hover:bg-muted/50 transition-colors rounded-sm">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="secondary" className="h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                                                {index + 1}
                                            </Badge>
                                            <div>
                                                <p className="font-semibold text-sm truncate">{customer.name || 'Unknown'}</p>
                                                <p className="text-xs text-muted-foreground">{customer.quoteCount || 0} Quotes</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-semibold text-sm text-primary">{formatCurrency(customer.totalValue)}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No customer data available yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}


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
const CustomTooltip = ({ active, payload, label, isCurrency = false }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const totalQuotes = data.quotes || null;
        const approvedQuotes = data.approved || null;

        return (
            <div className="p-3 bg-background border rounded-lg shadow-lg text-sm space-y-1">
                <p className="font-bold">{label}</p>
                <Separator />
                {payload.map((item: any) => (
                    <p key={item.dataKey} style={{ color: item.color }}>
                        {item.name}: {' '}
                        <span className="font-semibold">
                {isCurrency ? formatCurrency(item.value) : item.value.toLocaleString()}
              </span>
                    </p>
                ))}
                {/* Show extra context for monthly trend if available */}
                {totalQuotes !== null && approvedQuotes !== null && (
                    <p className="text-xs text-muted-foreground pt-1">
                        Conversion: {totalQuotes > 0 ? ((approvedQuotes / totalQuotes) * 100).toFixed(1) : 0}%
                    </p>
                )}
            </div>
        );
    }

    return null;
};

// 3. Skeleton Loader
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
            <Skeleton className="h-[380px] rounded-lg xl:col-span-1" />
            <Skeleton className="h-[380px] rounded-lg xl:col-span-2" />
        </div>

        {/* Trend & List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Skeleton className="h-[380px] rounded-lg lg:col-span-2" />
            <Skeleton className="h-[380px] rounded-lg lg:col-span-1" />
        </div>
    </div>
);