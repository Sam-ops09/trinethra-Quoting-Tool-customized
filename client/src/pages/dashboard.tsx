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
    Package
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
    totalRevenue: string; // numeric string
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
    topClients: Array<{
        name: string;
        total: number;
        quoteCount: number;
    }>;
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
    closed_paid: "hsl(45 90% 50%)",
    closed_cancelled: "hsl(0 0% 45%)",
};

const toNum = (s: string | number) =>
    typeof s === "number" ? s : Number(String(s).replace(/[^\d.-]/g, "")) || 0;

const pct = (part: number, total: number) =>
    total ? Math.round((part / total) * 100) : 0;

const lastN = <T,>(arr: T[], n: number) =>
    arr?.length ? arr.slice(Math.max(0, arr.length - n)) : [];

/* ------------ Pure helpers (no hooks here) ------------ */

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
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 space-y-6">
            <div className="mx-auto max-w-[1600px] space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-full sm:w-[300px]" />
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-40 w-full rounded-2xl" />
                    ))}
                </div>
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                    <Skeleton className="lg:col-span-4 h-96 rounded-2xl" />
                    <Skeleton className="lg:col-span-3 h-96 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}

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
                group cursor-default
            `}
        >
            {/* Subtle Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-50`} />

            <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                            {label}
                        </p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
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

                <div className="flex items-end justify-between gap-4 mt-4">
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

    const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
        queryKey: ["/api/analytics/dashboard"],
    });

    if (isLoading) return <Loading />;

    if (!metrics) {
        return (
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                    <CardContent className="p-8 sm:p-12 text-center">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3 hover:rotate-6 transition-transform">
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
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Create Quote
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => setLocation("/clients")}
                                className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
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

    const topClientsData = metrics.topClients || [];
    const topClients = {
        rows: topClientsData.map(c => ({ client: c.name, total: c.total })),
        grand: topClientsData.reduce((acc, c) => acc + c.total, 0)
    };
    const revenueTrend = calcTrend(totalRevenueNum, sparkSeries);
    const latestRevenue =
        metrics.monthlyRevenue?.[metrics.monthlyRevenue.length - 1]?.revenue || 0;
    const quoteTrend = calcTrend(latestRevenue, sparkSeries);

    const filteredRecentQuotes = metrics.recentQuotes?.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5) || [];

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
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 animate-in fade-in duration-500">
             {/* Decorative Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
                <div className="absolute top-0 left-0 w-[1000px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/3" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8"
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className="space-y-4">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-fit">
                        <button
                            onClick={() => setLocation("/")}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
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
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Dashboard Overview
                            </h1>
                            <p className="text-sm text-muted-foreground max-w-lg">
                                Real-time insights into your business performance and recent activities.
                            </p>
                        </div>

                        <Tabs
                            value={timeRange}
                            onValueChange={setTimeRange}
                            className="w-full sm:w-auto"
                        >
                            <TabsList className="grid grid-cols-4 w-full sm:w-auto p-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur border border-slate-200/50 dark:border-slate-800/50 rounded-xl h-11">
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
                        <Card className="h-full border-none shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 dark:from-indigo-950 dark:to-slate-900 text-white overflow-hidden relative group rounded-2xl">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 invert dark:invert-0" />
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/15 transition-colors duration-500" />

                            <CardContent className="relative p-6 flex flex-col justify-between h-full gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_theme(colors.emerald.400)]" />
                                        <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Live Updates</span>
                                    </div>
                                    <h3 className="text-2xl font-bold leading-tight mb-2">
                                        Welcome Back, <br /> Admin
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
                                        className="w-full bg-white text-slate-900 hover:bg-white/90 shadow-lg border-0 font-semibold h-11"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Quote
                                    </Button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setLocation("/clients")}
                                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white border-0 h-9"
                                        >
                                            <Users className="h-4 w-4 mr-2" />
                                            Clients
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setLocation("/invoices")}
                                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white border-0 h-9"
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
                            index={0}
                        />
                        <MetricCard
                            label="Total Clients"
                            value={metrics.totalClients}
                            sub="Active in your pipeline"
                            icon={Users}
                            sparkData={sparkSeries}
                            tint="blue"
                            index={1}
                        />
                        <MetricCard
                            label="Total Collected"
                            value={formatCurrency(totalRevenueNum)}
                            sub="From paid invoices"
                            icon={DollarSign}
                            sparkData={sparkSeries}
                            tint="green"
                            trend={revenueTrend.trend}
                            trendValue={revenueTrend.value}
                            index={2}
                        />
                        <MetricCard
                            label="Conversion Rate"
                            value={`${metrics.conversionRate}%`}
                            sub="Quotes converting to approval"
                            icon={TrendingUp}
                            sparkData={sparkSeries}
                            tint="purple"
                            index={3}
                        />
                    </div>
                </div>

                {/* ---------- Analytics Dashboard ---------- */}
                <div className="grid gap-6 grid-cols-1 xl:grid-cols-7">
                    {/* Revenue Trends Chart */}
                    <motion.div variants={itemVariants} className="xl:col-span-4">
                         <Card className="h-full border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl">
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
                                                    tickFormatter={(v: number) => v === 0 ? "0" : formatCurrency(v)}
                                                    tick={{ fill: 'currentColor', opacity: 0.7 }}
                                                    width={80}
                                                />
                                                <Tooltip
                                                    cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                                    formatter={(val: number) => [formatCurrency(Number(val)), "Revenue"]}
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
                        <Card className="h-full border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <PieChartIcon className="h-4 w-4 text-blue-500" />
                                            Order Status
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">Distribution summary</p>
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

                {/* ---------- Recent Activity & Top Clients (Responsive) ---------- */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {/* Recent Quotes List */}
                     <motion.div variants={itemVariants} className="flex flex-col h-full">
                         <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <History className="h-4 w-4 text-blue-500" />
                                Recent Activity
                            </h3>
                             <Button variant="ghost" size="sm" onClick={() => setLocation("/quotes")} className="text-muted-foreground hover:text-primary p-0 h-auto">
                                View All <ArrowUpRight className="h-3 w-3 ml-1" />
                            </Button>
                         </div>
                        
                        {filteredRecentQuotes.length > 0 ? (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex-1">
                                    <Table>
                                        <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                            <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                                                <TableHead className="w-[120px] font-semibold text-xs uppercase tracking-wider text-slate-500">Quote #</TableHead>
                                                <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500">Client</TableHead>
                                                <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500">Status</TableHead>
                                                <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-slate-500">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredRecentQuotes.map((q) => (
                                                <TableRow 
                                                    key={q.id} 
                                                    className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm"
                                                    onClick={() => setLocation(`/quotes/${q.id}`)}
                                                >
                                                    <TableCell className="font-medium text-slate-900 dark:text-slate-200 py-3">
                                                        {q.quoteNumber}
                                                    </TableCell>
                                                    <TableCell className="text-slate-600 dark:text-slate-400 py-3">
                                                        {q.clientName}
                                                        <div className="text-[10px] text-slate-400">{new Date(q.createdAt).toLocaleDateString()}</div>
                                                    </TableCell>
                                                    <TableCell className="py-3">
                                                         <Badge
                                                            variant="secondary"
                                                            className={`text-[10px] capitalize px-2 py-0.5 rounded-full font-medium shadow-none ${q.status === "approved"
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/30"
                                                                : q.status === "sent"
                                                                    ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900/30"
                                                                    : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                                                                }`}
                                                        >
                                                            {q.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-slate-900 dark:text-white py-3">
                                                        {formatCurrency(toNum(q.total))}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile List (Card Style) */}
                                <div className="sm:hidden space-y-3">
                                    {filteredRecentQuotes.map((quote) => (
                                        <div
                                            key={quote.id}
                                            onClick={() => setLocation(`/quotes/${quote.id}`)}
                                            className="p-4 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm shadow-sm active:scale-98 transition-transform cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{quote.quoteNumber}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{quote.clientName}</p>
                                                </div>
                                                <Badge
                                                    className={cn(
                                                        "px-2 py-0.5 text-[10px] font-semibold rounded-full",
                                                        STATUS_COLORS[quote.status] ? "text-white" : "bg-slate-100 text-slate-600"
                                                    )}
                                                    style={STATUS_COLORS[quote.status] ? { backgroundColor: STATUS_COLORS[quote.status] } : {}}
                                                >
                                                    {quote.status}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500 dark:text-slate-400">
                                                    {new Date(quote.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="font-bold text-slate-900 dark:text-white">
                                                    INR {toNum(quote.total).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Mobile Cards */}
                                <div className="sm:hidden space-y-3">
                                    {filteredRecentQuotes.map((q) => (
                                        <div
                                            key={q.id}
                                            onClick={() => setLocation(`/quotes/${q.id}`)}
                                            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
                                        >
                                             <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white">{q.quoteNumber}</h4>
                                                    <p className="text-xs text-slate-500">{new Date(q.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-[10px] capitalize ${q.status === "approved"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : q.status === "sent"
                                                            ? "bg-blue-50 text-blue-700"
                                                            : "bg-slate-100 text-slate-700"
                                                        }`}
                                                >
                                                    {q.status}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                                                    <Users className="h-3.5 w-3.5" />
                                                    <span className="truncate max-w-[120px]">{q.clientName}</span>
                                                </div>
                                                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(toNum(q.total))}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                                <Card className="h-40 flex flex-col items-center justify-center text-muted-foreground border-dashed">
                                    <History className="h-8 w-8 mb-2 opacity-20" />
                                    <p className="text-sm">No recent activity found</p>
                                </Card>
                        )}
                     </motion.div>

                    {/* Top Clients */}
                     <motion.div variants={itemVariants} className="flex flex-col h-full">
                         <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-amber-500" />
                                Top Clients
                            </h3>
                             <p className="text-xs text-muted-foreground">By revenue contribution</p>
                         </div>

                        <Card className="flex-1 border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl">
                            <CardContent className="p-6">
                                {topClients.rows.length ? (
                                    <div className="space-y-5">
                                        {topClients.rows.map((row, i) => {
                                            const share = pct(row.total, topClients.grand || row.total);
                                            const rankColor = i === 0 ? "from-yellow-400 to-amber-600" : i === 1 ? "from-slate-400 to-slate-600" : "from-orange-400 to-orange-700";
                                            return (
                                                <div key={row.client} className="space-y-2 group">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${i < 3 ? rankColor : "from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800"} text-white text-xs font-bold shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                                            {i + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold truncate text-foreground">{row.client}</p>
                                                            <p className="text-xs text-muted-foreground">{share}% of top revenue</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-sm font-bold tabular-nums block text-slate-900 dark:text-white">
                                                                {formatCurrency(row.total)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800/50 overflow-hidden ml-11 ring-1 ring-slate-100/50 dark:ring-slate-800/50">
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
                                    <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-muted-foreground">
                                        <Users className="h-12 w-12 mb-3 opacity-20" />
                                        <p className="text-sm">No client data available</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}