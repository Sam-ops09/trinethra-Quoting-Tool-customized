import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Loader2,
    DollarSign,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Home,
    ChevronRight,
    Receipt,
    Calendar,
    Clock,
    Users,
    BarChart3,
    PieChart as PieChartIcon,
} from "lucide-react";
import { useLocation } from "wouter";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/currency";

interface AgeingBucket {
    bucket: string;
    count: number;
    amount: number;
}

interface MonthlyCollection {
    month: string;
    invoiced: number;
    collected: number;
}

interface TopDebtor {
    clientId: string;
    clientName: string;
    outstandingAmount: number;
    invoiceCount: number;
    oldestInvoiceDays: number;
}

interface InvoiceAnalyticsData {
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
    ageingBuckets: AgeingBucket[];
    monthlyCollections: MonthlyCollection[];
    topDebtors: TopDebtor[];
}

// Professional color palette
const COLORS = {
    primary: "#1e40af",      // Professional blue
    success: "#059669",      // Professional green
    warning: "#d97706",      // Professional amber
    danger: "#dc2626",       // Professional red
    neutral: "#64748b",      // Slate gray
};

export default function InvoiceAnalytics() {
    const [, setLocation] = useLocation();

    const { data: analytics, isLoading } = useQuery<InvoiceAnalyticsData>({
        queryKey: ["/api/analytics/invoice-collections"],
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
                <div className="max-w-[1600px] mx-auto space-y-6">
                    <Skeleton className="h-10 w-80" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-28 rounded-lg" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <Skeleton className="lg:col-span-2 h-[400px] rounded-lg" />
                        <Skeleton className="h-[400px] rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (!analytics) return null;

    const statusData = [
        { name: "Paid", value: analytics.invoicesByStatus.paid, color: COLORS.success },
        { name: "Sent", value: analytics.invoicesByStatus.sent, color: COLORS.primary },
        { name: "Partial", value: analytics.invoicesByStatus.partial, color: COLORS.warning },
        { name: "Overdue", value: analytics.invoicesByStatus.overdue, color: COLORS.danger },
    ].filter(d => d.value > 0);

    const totalInvoices = Object.values(analytics.invoicesByStatus).reduce((a, b) => a + b, 0);
    const totalInvoiced = analytics.monthlyCollections.reduce((sum, item) => sum + item.invoiced, 0);
    const collectionRate = totalInvoiced > 0 ? (analytics.totalPaid / totalInvoiced) * 100 : 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="w-full max-w-[1600px] mx-auto px-6 py-6 space-y-6">
                {/* Breadcrumb */}
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
                        onClick={() => setLocation("/invoices")}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                    >
                        <Receipt className="h-3.5 w-3.5" />
                        <span>Invoices</span>
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                        <BarChart3 className="h-3.5 w-3.5" />
                        Analytics
                    </span>
                </nav>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invoice Analytics</h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Revenue, collections, and payment performance insights
                        </p>
                    </div>
                </div>

                {/* KPI Cards - Compact */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Total Collected</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                        {formatCurrency(analytics.totalPaid)}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {analytics.invoicesByStatus.paid} invoices
                                    </p>
                                </div>
                                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Outstanding</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                        {formatCurrency(analytics.totalOutstanding)}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {analytics.invoicesByStatus.partial + analytics.invoicesByStatus.sent} pending
                                    </p>
                                </div>
                                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                                    <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Overdue</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                        {formatCurrency(analytics.overdueAmount)}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {analytics.invoicesByStatus.overdue} invoices
                                    </p>
                                </div>
                                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20">
                                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Avg Collection</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                        {analytics.averageCollectionDays} Days
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Collection rate: {collectionRate.toFixed(1)}%
                                    </p>
                                </div>
                                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                                    <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Collection Trend */}
                    <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold">Revenue Collection Trend</CardTitle>
                                    <CardDescription className="text-xs mt-1">Monthly invoiced vs collected</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-xs">12 months</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.monthlyCollections} barGap={4}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis 
                                            dataKey="month" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#64748b', fontSize: 11 }} 
                                            dy={8}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#64748b', fontSize: 11 }} 
                                            tickFormatter={(value) => formatCurrency(value)}
                                            dx={-8}
                                        />
                                        <Tooltip 
                                            cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                                            contentStyle={{ 
                                                backgroundColor: 'white', 
                                                borderRadius: '8px', 
                                                border: '1px solid #e2e8f0', 
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                padding: '8px 12px',
                                                fontSize: '12px'
                                            }}
                                            formatter={(value: number, name: string) => [
                                                formatCurrency(value),
                                                name === 'invoiced' ? 'Invoiced' : 'Collected'
                                            ]}
                                        />
                                        <Legend 
                                            wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
                                            iconType="circle"
                                            iconSize={8}
                                        />
                                        <Bar 
                                            name="Invoiced" 
                                            dataKey="invoiced" 
                                            fill={COLORS.primary}
                                            radius={[4, 4, 0, 0]} 
                                            maxBarSize={40}
                                        />
                                        <Bar 
                                            name="Collected" 
                                            dataKey="collected" 
                                            fill={COLORS.success}
                                            radius={[4, 4, 0, 0]} 
                                            maxBarSize={40}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Distribution */}
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">Status Distribution</CardTitle>
                            <CardDescription className="text-xs mt-1">By payment status</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'white', 
                                                borderRadius: '8px', 
                                                border: '1px solid #e2e8f0', 
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                padding: '8px 12px',
                                                fontSize: '12px'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                {statusData.map((item) => {
                                    const percentage = totalInvoices > 0 ? ((item.value / totalInvoices) * 100).toFixed(0) : '0';
                                    return (
                                        <div key={item.name} className="flex items-center gap-2 p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-slate-600 dark:text-slate-400">{item.name}</p>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    {item.value} <span className="text-xs font-normal text-slate-500">({percentage}%)</span>
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Aging and Debtors */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Aging Analysis */}
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">Receivables Aging</CardTitle>
                            <CardDescription className="text-xs mt-1">Outstanding by days overdue</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="h-[240px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.ageingBuckets} layout="vertical" barSize={24}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                        <XAxis type="number" hide />
                                        <YAxis 
                                            dataKey="bucket" 
                                            type="category" 
                                            axisLine={false} 
                                            tickLine={false}
                                            width={80}
                                            tick={{ fill: '#64748b', fontSize: 11 }}
                                        />
                                        <Tooltip 
                                            cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                                            contentStyle={{ 
                                                backgroundColor: 'white', 
                                                borderRadius: '8px', 
                                                border: '1px solid #e2e8f0', 
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                padding: '8px 12px',
                                                fontSize: '12px'
                                            }}
                                            formatter={(value: number, name: string, props: any) => [
                                                formatCurrency(value),
                                                `${props.payload.count} invoice${props.payload.count !== 1 ? 's' : ''}`
                                            ]}
                                        />
                                        <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                                            {analytics.ageingBuckets.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={
                                                        index === 0 ? COLORS.primary :
                                                        index === 1 ? COLORS.warning :
                                                        index === 2 ? "#ea580c" :
                                                        COLORS.danger
                                                    }
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                {analytics.ageingBuckets.map((bucket, idx) => {
                                    const colors = [COLORS.primary, COLORS.warning, "#ea580c", COLORS.danger];
                                    return (
                                        <div key={bucket.bucket} className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[idx] }} />
                                                <span className="text-xs text-slate-600 dark:text-slate-400">{bucket.bucket}</span>
                                                <Badge variant="outline" className="text-xs ml-auto">{bucket.count}</Badge>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(bucket.amount)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Debtors */}
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold">Top Debtors</CardTitle>
                                    <CardDescription className="text-xs mt-1">Highest outstanding balances</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-xs">{analytics.topDebtors.length}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <ScrollArea className="h-[320px]">
                                <div className="space-y-2 pr-4">
                                    {analytics.topDebtors.map((debtor, index) => {
                                        const riskLevel = debtor.oldestInvoiceDays > 90 ? 'high' : debtor.oldestInvoiceDays > 60 ? 'medium' : 'low';
                                        return (
                                            <div 
                                                key={debtor.clientId} 
                                                className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-medium text-slate-500">#{index + 1}</span>
                                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{debtor.clientName}</h4>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                                                            <span className="flex items-center gap-1">
                                                                <Receipt className="h-3 w-3" />
                                                                {debtor.invoiceCount}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {debtor.oldestInvoiceDays}d
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {formatCurrency(debtor.outstandingAmount)}
                                                        </p>
                                                        <Badge 
                                                            variant={riskLevel === 'high' ? 'destructive' : 'outline'}
                                                            className="text-xs mt-1"
                                                        >
                                                            {riskLevel === 'high' ? 'High' : riskLevel === 'medium' ? 'Med' : 'Low'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {analytics.topDebtors.length === 0 && (
                                        <div className="text-center py-8">
                                            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">All Clear</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No outstanding debtors</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
