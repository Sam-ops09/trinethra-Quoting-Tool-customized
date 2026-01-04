"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    FileText,
    Users,
    DollarSign,
    TrendingUp,
    Receipt,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Activity,
    Calendar,
    LayoutDashboard,
    ChevronRight,
    Target,
    BarChart3,
    PieChart as PieChartIcon,
    Eye,
    Home,
    Trophy,
    History,
    CheckCircle2,
    Send,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import {
    ResponsiveContainer,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Label,
    Area,
    AreaChart,
} from "recharts";

/* ----------------------- Types ----------------------- */

type QuoteStatus =
    | "draft"
    | "sent"
    | "approved"
    | "rejected"
    | "invoiced"
    | string;

interface DashboardMetrics {
    totalQuotes: number;
    totalClients: number;
    totalRevenue: string; // numeric string (no ₹ symbol)
    conversionRate: string; // "100.0"
    totalInvoices?: number;
    pendingInvoices?: number;
    recentQuotes: Array<{
        id: string;
        quoteNumber: string;
        clientName: string;
        total: string; // numeric string
        status: QuoteStatus;
        createdAt: string;
    }>;
    quotesByStatus: Array<{ status: QuoteStatus; count: number }>;
    monthlyRevenue: Array<{ month: string; revenue: number }>;
    recentActivity?: Array<{
        id: string;
        type: "quote" | "invoice" | "client";
        action: string;
        description: string;
        timestamp: string;
    }>;
}

/* -------------------- Design Tokens ------------------- */

const STATUS_COLORS: Record<string, string> = {
    draft: "hsl(28 22% 83%)",
    sent: "hsl(205 32% 40%)",
    approved: "hsl(142 60% 40%)",
    rejected: "hsl(0 65% 55%)",
    invoiced: "hsl(205 48% 22%)",
};

const INR = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
});

const inr = (n: number) => INR.format(n);

const toNum = (s: string | number) =>
    typeof s === "number" ? s : Number(String(s).replace(/[^\d.-]/g, "")) || 0;

const pct = (part: number, total: number) =>
    total ? Math.round((part / total) * 100) : 0;

const lastN = <T,>(arr: T[], n: number) =>
    arr?.length ? arr.slice(Math.max(0, arr.length - n)) : [];

/* ------------ Pure helpers (no hooks here) ------------ */

function getTopClients(
    recent: DashboardMetrics["recentQuotes"],
    limit = 5
) {
    const m = new Map<string, number>();
    for (const q of recent || []) {
        if (q.status === "approved" || q.status === "invoiced") {
            m.set(q.clientName, (m.get(q.clientName) || 0) + toNum(q.total));
        }
    }
    const rows = Array.from(m.entries())
        .map(([client, total]) => ({ client, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, limit);
    const grand = rows.reduce((s, r) => s + r.total, 0);
    return { rows, grand };
}

function calcTrend(current: number, series: number[]) {
    if (!series || series.length < 2) return { trend: "neutral" as const, value: "0%" };
    const previous = series[series.length - 2] ?? 0;
    if (!previous) return { trend: "neutral" as const, value: "N/A" };
    const change = ((current - previous) / previous) * 100;
    const rounded = Math.abs(Math.round(change));
    if (change > 0) return { trend: "up" as const, value: `${rounded}%` };
    if (change < 0) return { trend: "down" as const, value: `${rounded}%` };
    return { trend: "neutral" as const, value: "0%" };
}

/* ------------------- Loading Skeleton ------------------ */

function Loading() {
    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
            <div className="mx-auto max-w-[1800px] p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="space-y-4 sm:space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-10 w-full sm:w-[300px]" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="overflow-hidden">
                                <CardContent className="p-5">
                                    <Skeleton className="h-4 w-24 mb-3" />
                                    <Skeleton className="h-10 w-32 mb-4" />
                                    <Skeleton className="h-16 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid gap-4 grid-cols-1 xl:grid-cols-7">
                        <Card className="xl:col-span-4">
                            <CardHeader>
                                <Skeleton className="h-6 w-40" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-[300px] w-full" />
                            </CardContent>
                        </Card>
                        <Card className="xl:col-span-3">
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-[300px] w-full" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bottom Grid */}
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        {[1, 2].map((i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-36" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-[250px] w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------------- KPI Metric Card ---------------- */



/* ---------------- Metric Card (Premium) ---------------- */

function MetricCard({
    label,
    value,
    sub,
    icon: Icon,
    tint,
    sparkData,
    trend,
    trendValue,
    testId,
    index = 0,
}: {
    label: string;
    value: string | number;
    sub: string;
    icon: any;
    tint?: "primary" | "blue" | "green" | "purple";
    sparkData?: number[];
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    testId?: string;
    index?: number;
}) {
    const tintStyles = {
        primary: {
            bg: "bg-white/50 dark:bg-slate-900/50",
            icon: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
            border: "border-indigo-100 dark:border-indigo-900/50",
            accent: "text-indigo-600 dark:text-indigo-400",
            gradient: "from-indigo-500/5 to-purple-500/5"
        },
        blue: {
            bg: "bg-white/50 dark:bg-slate-900/50",
            icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
            border: "border-blue-100 dark:border-blue-900/50",
            accent: "text-blue-600 dark:text-blue-400",
            gradient: "from-blue-500/5 to-cyan-500/5"
        },
        green: {
            bg: "bg-white/50 dark:bg-slate-900/50",
            icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            border: "border-emerald-100 dark:border-emerald-900/50",
            accent: "text-emerald-600 dark:text-emerald-400",
            gradient: "from-emerald-500/5 to-teal-500/5"
        },
        purple: {
            bg: "bg-white/50 dark:bg-slate-900/50",
            icon: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
            border: "border-purple-100 dark:border-purple-900/50",
            accent: "text-purple-600 dark:text-purple-400",
            gradient: "from-purple-500/5 to-pink-500/5"
        }
    };

    const style = tintStyles[tint || "primary"];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`
                relative overflow-hidden rounded-2xl border ${style.border}
                bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl
                shadow-sm hover:shadow-xl transition-all duration-300
                group
            `}
        >
            {/* Subtle Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-50`} />

            <CardContent className="p-5 relative z-10">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                            {label}
                        </p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <h3
                                className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
                                data-testid={testId}
                            >
                                {value}
                            </h3>
                        </div>
                    </div>
                    <div className={`
                        h-10 w-10 rounded-xl ${style.icon}
                        flex items-center justify-center shrink-0
                        shadow-sm group-hover:scale-110 transition-transform duration-300
                    `}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>

                <div className="flex items-end justify-between gap-4">
                    <div className="space-y-1">
                        {trend && trendValue && (
                            <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-emerald-600 dark:text-emerald-400" :
                                trend === "down" ? "text-red-600 dark:text-red-400" :
                                    "text-slate-500 dark:text-slate-400"
                                }`}>
                                <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/50 dark:bg-black/20 ${trend === "up" ? "bg-emerald-500/10" :
                                    trend === "down" ? "bg-red-500/10" : "bg-slate-500/10"
                                    }`}>
                                    {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
                                    {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
                                    {trendValue}
                                </span>
                                <span className="text-muted-foreground/70">vs last period</span>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground/70 leading-relaxed font-medium">
                            {sub}
                        </p>
                    </div>

                    {sparkData && sparkData.length > 1 && (
                        <div className="h-10 w-24 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sparkData.map((y, i) => ({ i, y }))}>
                                    <defs>
                                        <linearGradient id={`gradient-${label}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="currentColor" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        type="monotone"
                                        dataKey="y"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        fill={`url(#gradient-${label})`}
                                        className={style.accent}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </CardContent>
        </motion.div>
    );
}

/* ----------------------- Main Page ---------------------- */

export default function Dashboard() {
    const [, setLocation] = useLocation();
    const [timeRange, setTimeRange] = useState("last-90");

    // Single data hook – keep order stable
    const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
        queryKey: ["/api/analytics/dashboard"],
    });

    if (isLoading) return <Loading />;

    if (!metrics) {
        return (
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full border-none shadow-2xl">
                    <CardContent className="p-8 sm:p-12 text-center">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                            <LayoutDashboard className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Welcome to QuoteProGen
                        </h1>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            Start managing your quotes and clients efficiently. Create your first quote or add a client to begin.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
                            <Button
                                size="lg"
                                onClick={() => setLocation("/quotes/create")}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Create Quote
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => setLocation("/clients")}
                            >
                                <Users className="h-5 w-5 mr-2" />
                                Add Client
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    /* ------------- Derived Data & Presentation ------------- */

    const totalQuotes = metrics.totalQuotes ?? 0;
    const totalRevenueNum = toNum(metrics.totalRevenue);
    const sparkSeries = lastN(
        metrics.monthlyRevenue?.map((m) => m.revenue) || [],
        8
    );

    const donutTotal =
        metrics.quotesByStatus?.reduce(
            (sum, row) => sum + (row?.count || 0),
            0
        ) || 0;

    const topClients = getTopClients(metrics.recentQuotes || []);
    const revenueTrend = calcTrend(totalRevenueNum, sparkSeries);
    const latestRevenue =
        metrics.monthlyRevenue?.[metrics.monthlyRevenue.length - 1]?.revenue || 0;
    const quoteTrend = calcTrend(latestRevenue, sparkSeries);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
            {/* Decorative Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-[1000px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/3" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 space-y-6"
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className="space-y-4">
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
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                            <LayoutDashboard className="h-3.5 w-3.5" />
                            Dashboard
                        </span>
                    </nav>

                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                                Dashboard Overview
                            </h1>
                            <p className="text-sm text-muted-foreground max-w-lg">
                                Welcome back! Here's an overview of your business performance and recent activities.
                            </p>
                        </div>

                        <Tabs
                            value={timeRange}
                            onValueChange={setTimeRange}
                            className="w-full sm:w-auto"
                        >
                            <TabsList className="grid grid-cols-4 w-full sm:w-auto p-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur border border-slate-200/50 dark:border-slate-800/50 rounded-xl">
                                {["last-7", "last-30", "last-90", "ytd"].map((val) => (
                                    <TabsTrigger
                                        key={val}
                                        value={val}
                                        className="rounded-lg text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm transition-all"
                                    >
                                        {val === "ytd" ? "YTD" : val.replace("last-", "") + "d"}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                </motion.div>

                {/* Quick Actions & KPIs */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left: Quick Actions */}
                    <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4">
                        <Card className="h-full border-none shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 dark:from-indigo-950 dark:to-slate-900 text-white overflow-hidden relative group">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/15 transition-colors duration-500" />

                            <CardContent className="relative p-6 flex flex-col justify-between h-full gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_theme(colors.emerald.400)]" />
                                        <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Live Updates</span>
                                    </div>
                                    <h3 className="text-2xl font-bold leading-tight mb-2">
                                        Track your <br /> Growth
                                    </h3>
                                    <div className="space-y-3 mt-4">
                                        <div className="flex items-center justify-between text-sm/relaxed text-white/80 border-b border-white/10 pb-2">
                                            <span>Conversion</span>
                                            <span className="font-bold text-white">{metrics.conversionRate}%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm/relaxed text-white/80 border-b border-white/10 pb-2">
                                            <span>Active Clients</span>
                                            <span className="font-bold text-white">{metrics.totalClients}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button
                                        onClick={() => setLocation("/quotes/create")}
                                        className="w-full bg-white text-slate-900 hover:bg-white/90 shadow-lg border-0 font-semibold"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Quote
                                    </Button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setLocation("/clients")}
                                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white border-0"
                                        >
                                            <Users className="h-4 w-4 mr-2" />
                                            Clients
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setLocation("/invoices")}
                                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white border-0"
                                        >
                                            <Receipt className="h-4 w-4 mr-2" />
                                            Invoices
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Right: KPI Metrics */}
                    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <MetricCard
                            label="Total Quotes"
                            value={metrics.totalQuotes}
                            sub="Across all stages"
                            icon={FileText}
                            sparkData={sparkSeries}
                            trend={quoteTrend.trend}
                            trendValue={quoteTrend.value}
                            testId="metric-total-quotes"
                            index={0}
                        />
                        <MetricCard
                            label="Total Clients"
                            value={metrics.totalClients}
                            sub="Active in your pipeline"
                            icon={Users}
                            sparkData={sparkSeries}
                            tint="blue"
                            testId="metric-total-clients"
                            index={1}
                        />
                        <MetricCard
                            label="Total Revenue"
                            value={inr(totalRevenueNum)}
                            sub="From approved quotes"
                            icon={DollarSign}
                            sparkData={sparkSeries}
                            tint="green"
                            trend={revenueTrend.trend}
                            trendValue={revenueTrend.value}
                            testId="metric-total-revenue"
                            index={2}
                        />
                        <MetricCard
                            label="Conversion Rate"
                            value={`${metrics.conversionRate}%`}
                            sub="Quotes converting to approval"
                            icon={TrendingUp}
                            sparkData={sparkSeries}
                            tint="purple"
                            testId="metric-conversion-rate"
                            index={3}
                        />
                    </div>
                </div>

                {/* ---------- Analytics Dashboard ---------- */}
                <div className="grid gap-6 grid-cols-1 xl:grid-cols-7">
                    {/* Revenue Trends Chart */}
                    <motion.div variants={itemVariants} className="xl:col-span-4">
                        <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-emerald-500" />
                                            Revenue Trends
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">Monthly revenue performance</p>
                                    </div>
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                                        {metrics.monthlyRevenue?.length || 0} Months Data
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {metrics.monthlyRevenue?.length ? (
                                    <div className="w-full h-[320px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={metrics.monthlyRevenue}
                                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                            >
                                                <defs>
                                                    <linearGradient id="revenueGradientMain" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                                                <XAxis
                                                    dataKey="month"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    className="text-xs font-medium text-muted-foreground"
                                                    tick={{ fill: 'currentColor', opacity: 0.7 }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    tickLine={false}
                                                    axisLine={false}
                                                    className="text-xs font-medium text-muted-foreground"
                                                    tickCount={5}
                                                    tickFormatter={(v: number) => v === 0 ? "0" : inr(v)}
                                                    tick={{ fill: 'currentColor', opacity: 0.7 }}
                                                    width={80}
                                                />
                                                <Tooltip
                                                    cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                                    formatter={(val: number) => [inr(Number(val)), "Revenue"]}
                                                    contentStyle={{
                                                        borderRadius: '12px',
                                                        border: '1px solid var(--border)',
                                                        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                        color: 'var(--foreground)',
                                                        padding: '12px',
                                                    }}
                                                    itemStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
                                                    labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '4px', fontSize: '12px' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="revenue"
                                                    stroke="#10b981"
                                                    strokeWidth={3}
                                                    fill="url(#revenueGradientMain)"
                                                    animationDuration={1500}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-[320px] flex flex-col items-center justify-center text-muted-foreground">
                                        <BarChart3 className="h-16 w-16 mb-4 opacity-10" />
                                        <p className="text-sm font-medium">No revenue data available</p>
                                        <p className="text-xs">Create quotes to see revenue trends</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Quote Status Distribution */}
                    <motion.div variants={itemVariants} className="xl:col-span-3">
                        <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <PieChartIcon className="h-4 w-4 text-blue-500" />
                                            Distributions
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">Status breakdown</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {metrics.quotesByStatus?.length ? (
                                    <div className="space-y-6">
                                        <div className="w-full h-[200px] flex items-center justify-center relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={metrics.quotesByStatus}
                                                        dataKey="count"
                                                        nameKey="status"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius="65%"
                                                        outerRadius="90%"
                                                        paddingAngle={4}
                                                        cornerRadius={6}
                                                    >
                                                        {metrics.quotesByStatus.map((entry, index) => (
                                                            <Cell
                                                                key={index}
                                                                fill={STATUS_COLORS[entry.status] ?? "hsl(28 22% 83%)"}
                                                                stroke="rgba(255,255,255,0.1)"
                                                                strokeWidth={2}
                                                            />
                                                        ))}
                                                        <Label
                                                            position="center"
                                                            content={({ viewBox }) => {
                                                                if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox))
                                                                    return null;
                                                                const { cx, cy } = viewBox as { cx: number; cy: number };
                                                                return (
                                                                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                                                                        <tspan
                                                                            className="fill-foreground text-3xl font-bold"
                                                                            x={cx}
                                                                            dy="-0.3em"
                                                                        >
                                                                            {donutTotal}
                                                                        </tspan>
                                                                        <tspan
                                                                            className="fill-muted-foreground text-xs font-medium uppercase tracking-wider"
                                                                            x={cx}
                                                                            dy="1.6em"
                                                                        >
                                                                            Quotes
                                                                        </tspan>
                                                                    </text>
                                                                );
                                                            }}
                                                        />
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{
                                                            borderRadius: '12px',
                                                            border: '1px solid var(--border)',
                                                            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
                                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                            color: 'var(--foreground)',
                                                        }}
                                                        itemStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {metrics.quotesByStatus.map((entry, i) => {
                                                const percentage = donutTotal > 0 ? Math.round((entry.count / donutTotal) * 100) : 0;
                                                return (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        key={entry.status}
                                                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm"
                                                                style={{
                                                                    backgroundColor: STATUS_COLORS[entry.status] ?? "hsl(28 22% 83%)",
                                                                }}
                                                            />
                                                            <span className="text-xs font-semibold capitalize text-muted-foreground">{entry.status}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="block text-sm font-bold text-foreground">{entry.count}</span>
                                                            <span className="block text-[10px] text-muted-foreground/70">{percentage}%</span>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                                        <PieChartIcon className="h-16 w-16 mb-4 opacity-10" />
                                        <p className="text-sm font-medium">No status data available</p>
                                        <p className="text-xs">Create quotes to see distribution</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* ---------- Pipeline & Top Performers ---------- */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {/* Sales Pipeline */}
                    <motion.div variants={itemVariants}>
                        <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <Target className="h-4 w-4 text-purple-500" />
                                            Sales Pipeline
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">Quote progression by stage</p>
                                    </div>
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900/50">
                                        {totalQuotes} Total
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {metrics.quotesByStatus?.length ? (
                                    <div className="space-y-6">
                                        {["draft", "sent", "approved", "invoiced", "rejected"].map((key, i) => {
                                            const row = metrics.quotesByStatus.find((r) => r.status === key);
                                            const count = row?.count ?? 0;
                                            const p = pct(count, totalQuotes);
                                            return (
                                                <div key={key} className="relative group">
                                                    <div className="flex items-center justify-between mb-2 z-10 relative">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="h-8 w-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform"
                                                            >
                                                                <span
                                                                    className="h-3 w-3 rounded-full"
                                                                    style={{
                                                                        backgroundColor: STATUS_COLORS[key] ?? "hsl(var(--primary))",
                                                                        boxShadow: `0 0 10px ${STATUS_COLORS[key]}40`
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <span className="text-sm font-semibold capitalize text-foreground">{key}</span>
                                                                <p className="text-[10px] text-muted-foreground">{count} quotes</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-sm font-bold">{p}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${p}%` }}
                                                            transition={{ duration: 1, delay: i * 0.1 }}
                                                            className="h-full rounded-full"
                                                            style={{
                                                                backgroundColor: STATUS_COLORS[key] ?? "hsl(var(--primary))",
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                                        <p className="text-sm">No pipeline data</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Top Performing Clients */}
                    <motion.div variants={itemVariants}>
                        <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <Trophy className="h-4 w-4 text-amber-500" />
                                            Top Clients
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">Ranked by revenue contribution</p>
                                    </div>
                                    <div className="flex -space-x-2">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className={`h-6 w-6 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-white ${i === 0 ? "bg-yellow-400" : i === 1 ? "bg-slate-400" : "bg-orange-400"
                                                }`}>
                                                {i + 1}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {topClients.rows.length ? (
                                    <div className="space-y-4">
                                        {topClients.rows.map((row, i) => {
                                            const share = pct(row.total, topClients.grand || row.total);
                                            const rankColor = i === 0 ? "from-yellow-400 to-amber-600" : i === 1 ? "from-slate-400 to-slate-600" : "from-orange-400 to-orange-700";
                                            return (
                                                <div key={row.client} className="space-y-2 group">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${i < 3 ? rankColor : "from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800"} text-white text-xs font-bold shadow-sm group-hover:scale-105 transition-transform`}>
                                                            {i + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold truncate text-foreground">{row.client}</p>
                                                            <p className="text-xs text-muted-foreground">{share}% of top revenue</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-sm font-bold tabular-nums block">
                                                                {inr(row.total)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden ml-11">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${share}%` }}
                                                            transition={{ duration: 1, delay: i * 0.1 }}
                                                            className={`h-full rounded-full bg-gradient-to-r ${i < 3 ? rankColor : "from-indigo-500 to-purple-600"}`}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
                                        <Users className="h-16 w-16 mb-4 opacity-20" />
                                        <p className="text-sm font-medium">No client data</p>
                                        <p className="text-xs">Add clients to see rankings</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* ---------- Recent Activity ---------- */}
                <motion.div variants={itemVariants}>
                    <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <History className="h-4 w-4 text-blue-500" />
                                        Recent Activity
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">Latest quote updates and changes</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setLocation("/quotes")} className="text-muted-foreground hover:text-primary">
                                    View All
                                    <ArrowUpRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {metrics.recentQuotes?.length ? (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {metrics.recentQuotes.slice(0, 5).map((q, idx) => (
                                        <div
                                            key={q.id}
                                            role="button"
                                            tabIndex={0}
                                            className="flex items-center gap-4 p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                                            onClick={() => setLocation(`/quotes/${q.id}`)}
                                        >
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 
                                                ${q.status === "approved"
                                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                                                    : q.status === "sent"
                                                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                                        : "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                                } transition-colors group-hover:scale-110 duration-200`}
                                            >
                                                {q.status === "approved" ? <CheckCircle2 className="h-5 w-5" /> :
                                                    q.status === "sent" ? <Send className="h-5 w-5" /> :
                                                        <FileText className="h-5 w-5" />}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                                                        {q.quoteNumber}
                                                    </p>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(q.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-muted-foreground truncate">{q.clientName}</p>
                                                    <Badge
                                                        variant="secondary"
                                                        className={`text-[10px] capitalize px-1.5 h-5 ${q.status === "approved"
                                                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                                                            : q.status === "sent"
                                                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                                                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                                            }`}
                                                    >
                                                        {q.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-right pl-2">
                                                <span className="text-sm font-bold tabular-nums block">{inr(toNum(q.total))}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Activity className="h-12 w-12 mb-3 opacity-10" />
                                    <p className="text-sm">No recent activity</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}