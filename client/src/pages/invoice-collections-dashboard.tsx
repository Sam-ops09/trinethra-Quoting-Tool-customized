import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    Receipt,
    DollarSign,
    AlertCircle,
    Download,
    Clock,
    CheckCircle,
    User,
    Loader2,
    Home,
    ChevronRight,
    Activity,
    CreditCard
} from "lucide-react";
import { useLocation } from "wouter";
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
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { formatCurrency } from "@/lib/currency";

// Interface (Unchanged)
interface InvoiceCollectionsMetrics {
    invoicesByStatus: {
        draft: number;
        sent: number;
        partial: number;
        paid: number;
        overdue: number;
    };
    totalOutstanding: number;
    totalPaid: number;
    overdueAmount: number;
    averageCollectionDays: number;
    ageingBuckets: Array<{
        bucket: string;
        count: number;
        amount: number;
    }>;
    monthlyCollections: Array<{
        month: string;
        invoiced: number;
        collected: number;
    }>;
    topDebtors: Array<{
        clientId: string;
        clientName: string;
        outstandingAmount: number;
        invoiceCount: number;
        oldestInvoiceDays: number;
    }>;
}

const INVOICE_STATUS_COLORS = {
    draft: "#94a3b8", // Slate
    sent: "#3b82f6", // Blue
    partial: "#f59e0b", // Amber
    paid: "#22c55e", // Green
    overdue: "#ef4444", // Red
};



// --- Helper Components ---

// 1. Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label, isCurrency = true }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 bg-background border rounded-lg shadow-lg text-sm space-y-1">
                <p className="font-bold">{label}</p>
                <Separator className="my-1" />
                {payload.map((item: any) => (
                    <p key={item.dataKey} style={{ color: item.color }}>
                        {item.name}: {' '}
                        <span className="font-semibold">
                {isCurrency ? formatCurrency(item.value) : `${item.value.toLocaleString()} Invoices`}
              </span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// 2. Stat Card Component
const StatCard = ({ title, value, subValue, icon: Icon, iconColor, subLabel, borderClass }: { title: string, value: string | number, subValue: string | number, icon: any, iconColor: string, subLabel: string, borderClass?: string }) => (
    <Card className={`hover:shadow-lg transition-shadow ${borderClass || ''}`}>
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
                {title}
                <div className={`p-1 rounded-md ${iconColor}/10`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className={`text-2xl font-bold ${iconColor}`}>{value}</div>
            <p className="text-xs text-muted-foreground mt-1">
                {subValue} {subLabel}
            </p>
        </CardContent>
    </Card>
);

// 3. Skeleton Loader (Placeholder)
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2 p-4 border rounded-lg">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-7 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Skeleton className="h-[380px] rounded-lg xl:col-span-2" />
            <Skeleton className="h-[380px] rounded-lg xl:col-span-1" />
        </div>
        <Skeleton className="h-[380px] rounded-lg" />
    </div>
);


// --- Main Component ---

export default function InvoiceCollectionsDashboard() {
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const [exportingFormat, setExportingFormat] = useState<"excel" | "pdf" | null>(null);

    // Feature flags
    const canExportExcel = useFeatureFlag('advanced_excelExport');
    const canExportPDF = useFeatureFlag('invoices_pdfGeneration');

    const { data: metrics, isLoading } = useQuery<InvoiceCollectionsMetrics>({
        queryKey: ["/api/analytics/invoice-collections"],
    });

    // Export Logic with improved error handling
    const handleExportReport = async (format: "excel" | "pdf") => {
        setExportingFormat(format);

        try {
            toast({
                title: "Preparing export...",
                description: `Generating ${format.toUpperCase()} report`,
            });

            const response = await fetch(`/api/reports/invoices?format=${format}`, {
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

            a.download = `Invoice Report ${dateStr}.${format === "excel" ? "xlsx" : "pdf"}`;
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
    const totalInvoices = Object.values(metrics.invoicesByStatus).reduce((a, b) => a + b, 0);

    const invoiceStatusData = Object.entries(metrics.invoicesByStatus).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: INVOICE_STATUS_COLORS[status as keyof typeof INVOICE_STATUS_COLORS],
    }));

    const collectionRate = ((metrics.totalPaid / (metrics.totalPaid + metrics.totalOutstanding)) * 100).toFixed(1);
    const overdueRate = ((metrics.overdueAmount / (metrics.totalOutstanding || 1)) * 100).toFixed(1);


    return (
        <div className="min-h-screen w-full bg-background">
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">

                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-fit">
                    <button
                        onClick={() => setLocation("/")}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                    >
                        <Home className="h-3.5 w-3.5" />
                        <span>Home</span>
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <button
                        onClick={() => setLocation("/analytics")}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                    >
                        <Activity className="h-3.5 w-3.5" />
                        <span>Analytics</span>
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                        <CreditCard className="h-3.5 w-3.5" />
                        Invoice Collections
                    </span>
                </nav>

                {/* Header with Title and Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b">
                    <div className="flex items-center gap-3">
                        <Receipt className="h-6 w-6 sm:h-7 sm:w-7 text-primary shrink-0" />
                        <div>
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight">
                                Invoice & Collections
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                                Analyze revenue cycle health and receivables aging
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                        {canExportExcel && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportReport("excel")}
                            disabled={exportingFormat !== null}
                            className="flex-1 sm:flex-initial h-8 sm:h-9 text-xs sm:text-sm"
                          >
                            {exportingFormat === "excel" ? (
                                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                            ) : (
                                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                            )}
                            <span className="hidden xs:inline">Export </span>Excel
                          </Button>
                        )}
                        {canExportPDF && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportReport("pdf")}
                            disabled={exportingFormat !== null}
                            className="flex-1 sm:flex-initial h-8 sm:h-9 text-xs sm:text-sm"
                          >
                            {exportingFormat === "pdf" ? (
                                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                            ) : (
                                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                            )}
                            <span className="hidden xs:inline">Export </span>PDF
                          </Button>
                        )}
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Outstanding"
                        value={formatCurrency(metrics.totalOutstanding)}
                        subValue={metrics.invoicesByStatus.sent + metrics.invoicesByStatus.partial}
                        icon={Clock}
                        iconColor="text-yellow-600"
                        subLabel="Pending Invoices"
                        borderClass="border-2 border-yellow-500/30"
                    />
                    <StatCard
                        title="Overdue Amount"
                        value={formatCurrency(metrics.overdueAmount)}
                        subValue={metrics.invoicesByStatus.overdue}
                        icon={AlertCircle}
                        iconColor="text-red-600"
                        subLabel="Overdue Invoices"
                        borderClass="border-2 border-red-500/30"
                    />
                    <StatCard
                        title="Total Collected"
                        value={formatCurrency(metrics.totalPaid)}
                        subValue={collectionRate}
                        icon={CheckCircle}
                        iconColor="text-green-600"
                        subLabel="% Collection Rate"
                    />
                    <StatCard
                        title="Avg. Collection Days"
                        value={`${metrics.averageCollectionDays} days`}
                        subValue={totalInvoices}
                        icon={Receipt}
                        iconColor="text-primary"
                        subLabel="Total Invoices"
                    />
                </div>

                {/* Charts Grid: Ageing and Monthly Trend */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

                    {/* Receivables Ageing (Bar Chart - High Priority) */}
                    <Card className="xl:col-span-2">
                        <CardHeader>
                            <CardTitle>Receivables Ageing Analysis</CardTitle>
                            <CardDescription>Outstanding amounts categorized by days past due. </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={metrics.ageingBuckets || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                                    <XAxis dataKey="bucket" stroke="#666" />
                                    <YAxis tickFormatter={(val) => formatCurrency(val)} stroke="#666" />
                                    <Tooltip content={<CustomTooltip isCurrency={true} />} />
                                    <Legend />
                                    <Bar dataKey="amount" fill="#ef4444" name="Amount Overdue" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="count" fill="#3b82f6" name="Invoice Count" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Invoices by Status (Pie Chart) */}
                    <Card className="xl:col-span-1">
                        <CardHeader>
                            <CardTitle>Invoices by Status</CardTitle>
                            <CardDescription>Current distribution across the payment cycle.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={invoiceStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={90}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {invoiceStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip isCurrency={false} />} />
                                    <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Trend & Top Debtors */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Monthly Collections (Area Chart) */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Monthly Collections Trend</CardTitle>
                            <CardDescription>Comparison of invoiced amounts versus collected cash flow.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={metrics.monthlyCollections || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                                    <XAxis dataKey="month" stroke="#666" />
                                    <YAxis tickFormatter={(val) => formatCurrency(val)} stroke="#666" />
                                    <Tooltip content={<CustomTooltip isCurrency={true} />} />
                                    <Legend />
                                    <Area type="monotone" dataKey="invoiced" stroke="#3b82f6" fillOpacity={0.5} fill="url(#colorInvoiced)" name="Invoiced Amount" />
                                    <Area type="monotone" dataKey="collected" stroke="#22c55e" fillOpacity={0.5} fill="url(#colorCollected)" name="Collected Amount" />
                                    <defs>
                                        <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Top Debtors (List) */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Top Debtors</CardTitle>
                            <CardDescription>Accounts with the highest outstanding value.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {metrics.topDebtors && metrics.topDebtors.length > 0 ? (
                                metrics.topDebtors
                                    .slice(0, 10)
                                    .sort((a, b) => b.outstandingAmount - a.outstandingAmount)
                                    .map((debtor) => {
                                        const oldestDays = debtor.oldestInvoiceDays || 0;
                                        const urgencyBadge = oldestDays > 60 ? "Over 60 Days" : oldestDays > 30 ? "Over 30 Days" : "Recent";
                                        const urgencyColor = oldestDays > 60 ? "text-red-600 bg-red-100" : oldestDays > 30 ? "text-yellow-600 bg-yellow-100" : "text-green-600 bg-green-100";

                                        return (
                                            <div key={debtor.clientId} className="flex items-center justify-between p-2 border-b last:border-b-0 hover:bg-muted/50 transition-colors rounded-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 bg-primary/10 text-primary`}>
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm truncate">{debtor.clientName || 'Unknown'}</p>
                                                        <Badge className={`text-xs h-5 px-1.5 ${urgencyColor}`}>{urgencyBadge}</Badge>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="font-bold text-base text-red-600">{formatCurrency(debtor.outstandingAmount)}</p>
                                                    <p className="text-xs text-muted-foreground">{debtor.invoiceCount} Invoices</p>
                                                </div>
                                            </div>
                                        );
                                    })
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No significant outstanding accounts.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Collection KPIs */}
                <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-background">
                    <CardHeader>
                        <CardTitle className="text-lg">Collection Key Performance Indicators (KPIs)</CardTitle>
                        <CardDescription>High-level metrics for financial health.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg bg-background/50">
                                <p className="text-sm text-muted-foreground">Average Collection Days</p>
                                <p className="text-3xl font-bold mt-1 text-blue-600">{metrics.averageCollectionDays || 0}</p>
                                <p className="text-xs text-muted-foreground">Days to payment</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-background/50">
                                <p className="text-sm text-muted-foreground">Current Collection Rate</p>
                                <p className="text-3xl font-bold mt-1 text-green-600">
                                    {collectionRate}%
                                </p>
                                <p className="text-xs text-muted-foreground">Percentage of total invoiced</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-background/50">
                                <p className="text-sm text-muted-foreground">Overdue Rate (of Outstanding)</p>
                                <p className="text-3xl font-bold text-red-600 mt-1">
                                    {overdueRate}%
                                </p>
                                <p className="text-xs text-muted-foreground">Percentage of outstanding amount</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}