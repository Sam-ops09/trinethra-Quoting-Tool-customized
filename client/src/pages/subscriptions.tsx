/**
 * Subscriptions List Page
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Plus,
    Calendar,
    Filter,
    Home,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Eye,
    Receipt,
    Repeat,
    PauseCircle,
    Clock,
    X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { isFeatureEnabled } from "@shared/feature-flags";
import { PermissionGuard } from "@/components/permission-guard";

interface Subscription {
    id: string;
    subscriptionNumber: string;
    clientId: string;
    planName: string;
    status: string;
    billingCycle: string;
    amount: string;
    currency: string;
    nextBillingDate: string;
    client?: {
        id: string;
        name: string;
    };
}

const STATUS_CONFIG: Record<string, {
    color: string;
    label: string;
    icon: any;
    gradient: string;
    progress: number;
}> = {
    active: {
        color: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
        label: "Active",
        icon: CheckCircle2,
        gradient: "from-emerald-400 to-emerald-500",
        progress: 100
    },
    paused: {
        color: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
        label: "Paused",
        icon: PauseCircle,
        gradient: "from-amber-400 to-amber-500",
        progress: 50
    },
    cancelled: {
        color: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
        label: "Cancelled",
        icon: XCircle,
        gradient: "from-rose-400 to-rose-500",
        progress: 0
    },
    expired: {
        color: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
        label: "Expired",
        icon: Clock,
        gradient: "from-slate-400 to-slate-500",
        progress: 100
    },
};

export default function Subscriptions() {
    const [, setLocation] = useLocation();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [filterOpen, setFilterOpen] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const { data: subscriptions, isLoading } = useQuery<Subscription[]>({ 
        queryKey: ["/api/subscriptions"],
    });

    const filtered = useMemo(() => subscriptions?.filter((sub) => {
        const q = search.toLowerCase().trim();
        const matchSearch = !q || 
            sub.subscriptionNumber.toLowerCase().includes(q) || 
            sub.client?.name?.toLowerCase().includes(q) || 
            sub.planName?.toLowerCase().includes(q);
        const matchStatus = status === "all" || sub.status === status;
        return matchSearch && matchStatus;
    }), [subscriptions, search, status]);

    const stats = useMemo(() => ({
        total: subscriptions?.length || 0,
        active: subscriptions?.filter((s) => s.status === "active").length || 0,
        paused: subscriptions?.filter((s) => s.status === "paused").length || 0,
        cancelled: subscriptions?.filter((s) => s.status === "cancelled").length || 0,
        expired: subscriptions?.filter((s) => s.status === "expired").length || 0,
    }), [subscriptions]);

    const formatCurrency = (val: string, curr: string = 'INR') =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(Number(val));

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });

    if (!isFeatureEnabled("subscriptions_module")) {
        return <div className="p-8 text-center text-muted-foreground">Subscriptions feature is disabled.</div>;
    }

    if (isLoading) return <LoadingSkeleton />;

    return (
        <div className="min-h-screen">
            {/* Sticky Header Bar */}
            <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
                <div className="w-full max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 py-2.5">
                    <div className="flex items-center justify-between gap-3">
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
                                <Repeat className="h-3.5 w-3.5" />
                                Subscriptions
                            </span>
                        </nav>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFilterOpen(!filterOpen)}
                                className="h-8 px-2.5 text-xs lg:hidden"
                            >
                                <Filter className={cn("h-3.5 w-3.5", filterOpen && "text-blue-600")} />
                            </Button>
                            <PermissionGuard resource="invoices" action="create">
                                <Button
                                    size="sm"
                                    className="h-8 px-3 text-xs bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900"
                                    onClick={() => setLocation("/subscriptions/new")}
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                                    <span className="hidden sm:inline">New Subscription</span>
                                    <span className="sm:hidden">New</span>
                                </Button>
                            </PermissionGuard>
                        </div>
                    </div>

                    {/* Quick Stats Bar */}
                    <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {[
                            { key: "total", label: "Total", value: stats.total, icon: Repeat, color: "text-slate-600 dark:text-slate-400" },
                            { key: "active", label: "Active", value: stats.active, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
                            { key: "paused", label: "Paused", value: stats.paused, icon: PauseCircle, color: "text-amber-600 dark:text-amber-400" },
                            { key: "cancelled", label: "Cancelled", value: stats.cancelled, icon: XCircle, color: "text-rose-600 dark:text-rose-400" },
                        ].map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <button
                                    key={stat.key}
                                    onClick={() => setStatus(stat.key === "total" ? "all" : stat.key)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0",
                                        status === (stat.key === "total" ? "all" : stat.key)
                                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg"
                                            : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    <span>{stat.label}</span>
                                    <span className={cn("font-bold", status === (stat.key === "total" ? "all" : stat.key) ? "" : stat.color)}>
                                        {stat.value}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="w-full max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
                <div className="flex gap-4">
                    {/* Filter Sidebar */}
                    <div className={cn("lg:block lg:w-64 xl:w-72 shrink-0", filterOpen ? "block" : "hidden")}>
                        <div className="sticky top-20 space-y-3">
                            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                                <CardHeader className="p-4 pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-bold">Filters</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setFilterOpen(false)}
                                            className="h-6 w-6 p-0 lg:hidden"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Search</label>
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                            <Input
                                                placeholder="Number, client, plan..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="pl-8 h-9 text-xs"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Status</label>
                                        <div className="space-y-1.5">
                                            {["all", "active", "paused", "cancelled", "expired"].map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => setStatus(s)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all",
                                                        status === s
                                                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                                    )}
                                                >
                                                    <span className="capitalize">{s === "all" ? "All Subscriptions" : s}</span>
                                                    {s !== "all" && (
                                                        <span className="font-bold">{stats[s as keyof typeof stats]}</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {filtered && filtered.length > 0 ? (
                            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                                {filtered.map((sub) => {
                                    const statusConfig = STATUS_CONFIG[sub.status] || STATUS_CONFIG.expired;
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <Card
                                            key={sub.id}
                                            onMouseEnter={() => setHoveredCard(sub.id)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                            onClick={() => setLocation(`/subscriptions/${sub.id}`)}
                                            className={cn.constructor === String ? "" : `group relative border-slate-200 dark:border-slate-800 cursor-pointer transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-950/50 hover:-translate-y-1 ${hoveredCard === sub.id ? "ring-2 ring-indigo-500/50" : ""}`}
                                        >
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
                                                <div
                                                    className={`h-full bg-gradient-to-r transition-all duration-500 ${statusConfig.gradient}`}
                                                    style={{ width: `${statusConfig.progress}%` }}
                                                />
                                            </div>

                                            <CardHeader className="pb-3 p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <CardTitle className="text-base font-bold text-slate-900 dark:text-white truncate">
                                                                {sub.subscriptionNumber}
                                                            </CardTitle>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                                            <Repeat className="h-3 w-3" />
                                                            {sub.planName}
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className={`${statusConfig.color} shrink-0 text-[10px] px-2 py-1 font-semibold`}>
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {statusConfig.label}
                                                    </Badge>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="p-4 pt-0 space-y-3">
                                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                                        <Repeat className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                            {sub.client?.name || "Unknown Client"}
                                                        </p>
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate capitalize">
                                                            Cycle: {sub.billingCycle}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Next Billing</p>
                                                        <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                                                            {formatDate(sub.nextBillingDate)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Amount</p>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {formatCurrency(sub.amount, sub.currency)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <Separator className="my-2" />
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                    <Repeat className="h-6 w-6 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Subscriptions Found</h3>
                                <p className="text-muted-foreground mb-6">Create your first subscription to automate billing.</p>
                                <Button onClick={() => setLocation("/subscriptions/new")}>Create Subscription</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-24" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
            </div>
        </div>
    );
}
