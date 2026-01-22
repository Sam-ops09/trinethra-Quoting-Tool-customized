import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    FileText,
    Eye,
    List,
    Clock,
    CheckCircle2,
    SlidersHorizontal,
    Calendar,
    DollarSign,
    Users,
    X,
    Home,
    ChevronRight,
    TrendingUp,
    Filter,
    Package,
    Download,
    Pencil,
    MoreVertical,
    Grid3x3,
    Mail,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import type { SalesOrder } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";
type StatusFilter = "all" | "draft" | "confirmed" | "fulfilled" | "cancelled";
type SortOption = "newest" | "oldest" | "amount-high" | "amount-low" | "client";

export default function SalesOrdersList() {
    const [, setLocation] = useLocation();
    const isEnabled = useFeatureFlag("sales_orders_module");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [sortBy, setSortBy] = useState<SortOption>("newest");

    if (isEnabled === false) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
                <h1 className="text-2xl font-bold">Feature Disabled</h1>
                <p className="text-muted-foreground">The Sales Orders module is currently disabled.</p>
                <Button onClick={() => setLocation("/")}>Go Home</Button>
            </div>
        );
    }

    const { data: salesOrders, isLoading } = useQuery<
        Array<SalesOrder & { clientName: string; quoteNumber: string }>
    >({
        queryKey: ["/api/sales-orders"],
    });

    const stats = useMemo(() => {
        if (!salesOrders)
            return {
                total: 0,
                draft: 0,
                confirmed: 0,
                fulfilled: 0,
                cancelled: 0,
                totalValue: 0,
            };

        return {
            total: salesOrders.length,
            draft: salesOrders.filter((o) => o.status === "draft").length,
            confirmed: salesOrders.filter((o) => o.status === "confirmed").length,
            fulfilled: salesOrders.filter((o) => o.status === "fulfilled").length,
            cancelled: salesOrders.filter((o) => o.status === "cancelled").length,
            totalValue: salesOrders.reduce((sum, o) => sum + Number(o.total), 0),
        };
    }, [salesOrders]);

    const filteredOrders = useMemo(() => {
        if (!salesOrders) return [];

        let filtered = salesOrders.filter(
            (order) =>
                order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (statusFilter !== "all") {
            filtered = filtered.filter((order) => order.status === statusFilter);
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
                case "oldest":
                    return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
                case "amount-high":
                    return Number(b.total) - Number(a.total);
                case "amount-low":
                    return Number(a.total) - Number(b.total);
                case "client":
                    return a.clientName.localeCompare(b.clientName);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [salesOrders, searchQuery, statusFilter, sortBy]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "draft":
                return "bg-muted text-muted-foreground";
            case "confirmed":
                return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary";
            case "fulfilled":
                return "bg-success/10 text-success dark:bg-success/20 dark:text-success";
            case "cancelled":
                return "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-10 w-64" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-32 rounded-2xl" />
                        ))}
                    </div>
                    <Skeleton className="h-24 rounded-2xl" />
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-40 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
                {/* Premium Breadcrumbs */}
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
                        <Package className="h-3.5 w-3.5" />
                        Sales Orders
                    </span>
                </nav>

                {/* Premium Header */}
                <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                    <div className="relative px-6 sm:px-8 py-6 sm:py-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 shadow-lg">
                                        <Package className="h-6 w-6 text-white dark:text-slate-900" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                                            Sales Orders
                                        </h1>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                            Track and manage customer orders
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Premium Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <CardContent className="relative p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="space-y-1.5 min-w-0 flex-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Total Orders</p>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0 shadow-md">
                                    <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                <TrendingUp className="h-3.5 w-3.5" />
                                <span>All time</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <CardContent className="relative p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="space-y-1.5 min-w-0 flex-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Confirmed</p>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.confirmed}</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0 shadow-md">
                                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                <span>In progress</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <CardContent className="relative p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="space-y-1.5 min-w-0 flex-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Fulfilled</p>
                                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.fulfilled}</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0 shadow-md">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                <span>Completed</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <CardContent className="relative p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="space-y-1.5 min-w-0 flex-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Total Value</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.totalValue)}</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-md">
                                    <DollarSign className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                                <span>Revenue total</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Premium Filters */}
                <Card className="rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg">
                    <CardContent className="p-5 space-y-4">
                        {/* Search Bar with Enhanced Design */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by order number, client, or quote..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-11 pr-10 h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <Select
                                    value={sortBy}
                                    onValueChange={(value) => setSortBy(value as SortOption)}
                                >
                                    <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Sort" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="newest">Newest First</SelectItem>
                                        <SelectItem value="oldest">Oldest First</SelectItem>
                                        <SelectItem value="amount-high">Highest Amount</SelectItem>
                                        <SelectItem value="amount-low">Lowest Amount</SelectItem>
                                        <SelectItem value="client">Client Name</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="hidden sm:flex items-center gap-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                                    <Button
                                        variant={viewMode === "list" ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setViewMode("list")}
                                        className="h-9 w-9 p-0 rounded-lg"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setViewMode("grid")}
                                        className="h-9 w-9 p-0 rounded-lg"
                                    >
                                        <Grid3x3 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Premium Status Pills */}
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={statusFilter === "all" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter("all")}
                                    className={cn(
                                        "h-9 px-4 rounded-full text-sm font-medium transition-all duration-200",
                                        statusFilter === "all" && "shadow-lg"
                                    )}
                                >
                                    All <Badge className="ml-2 h-5 px-2 text-xs bg-white/20 dark:bg-slate-900/20">{stats.total}</Badge>
                                </Button>
                                <Button
                                    variant={statusFilter === "draft" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter("draft")}
                                    className={cn(
                                        "h-9 px-4 rounded-full text-sm font-medium transition-all duration-200",
                                        statusFilter === "draft" && "shadow-lg"
                                    )}
                                >
                                    Draft <Badge className="ml-2 h-5 px-2 text-xs bg-white/20 dark:bg-slate-900/20">{stats.draft}</Badge>
                                </Button>
                                <Button
                                    variant={statusFilter === "confirmed" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter("confirmed")}
                                    className={cn(
                                        "h-9 px-4 rounded-full text-sm font-medium transition-all duration-200",
                                        statusFilter === "confirmed" && "shadow-lg"
                                    )}
                                >
                                    Confirmed <Badge className="ml-2 h-5 px-2 text-xs bg-white/20 dark:bg-slate-900/20">{stats.confirmed}</Badge>
                                </Button>
                                <Button
                                    variant={statusFilter === "fulfilled" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter("fulfilled")}
                                    className={cn(
                                        "h-9 px-4 rounded-full text-sm font-medium transition-all duration-200",
                                        statusFilter === "fulfilled" && "shadow-lg"
                                    )}
                                >
                                    Fulfilled <Badge className="ml-2 h-5 px-2 text-xs bg-white/20 dark:bg-slate-900/20">{stats.fulfilled}</Badge>
                                </Button>
                                <Button
                                    variant={statusFilter === "cancelled" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter("cancelled")}
                                    className={cn(
                                        "h-9 px-4 rounded-full text-sm font-medium transition-all duration-200",
                                        statusFilter === "cancelled" && "shadow-lg"
                                    )}
                                >
                                    Cancelled <Badge className="ml-2 h-5 px-2 text-xs bg-white/20 dark:bg-slate-900/20">{stats.cancelled}</Badge>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders Content */}
                {filteredOrders && filteredOrders.length > 0 ? (
                    viewMode === "list" ? (
                        <div className="space-y-3">
                            {filteredOrders.map((order) => (
                                <Card
                                    key={order.id}
                                    onClick={() => setLocation(`/sales-orders/${order.id}`)}
                                    className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                                >
                                    {/* Status Accent Bar */}
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-1.5"
                                        style={{
                                            background:
                                                order.status === "fulfilled" ? "rgb(34 197 94)" :
                                                order.status === "confirmed" ? "rgb(59 130 246)" :
                                                order.status === "cancelled" ? "rgb(239 68 68)" :
                                                "rgb(156 163 175)",
                                        }}
                                    />

                                    <CardContent className="relative p-5 sm:p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                            {/* Order Info */}
                                            <div className="flex-1 min-w-0 space-y-4">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                        {order.orderNumber}
                                                    </h3>
                                                    <Badge
                                                        className={cn(
                                                            "px-3 py-1 text-xs font-semibold rounded-full",
                                                            getStatusColor(order.status)
                                                        )}
                                                    >
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
                                                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Client</p>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{order.clientName}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                                        <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center shrink-0">
                                                            <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Date</p>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                                {new Date(order.orderDate).toLocaleDateString("en-US", {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    year: "numeric",
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800">
                                                        <div className="h-10 w-10 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0 shadow-md">
                                                            <DollarSign className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Amount</p>
                                                            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                                                {formatCurrency(order.total)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {order.quoteNumber && (
                                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                                            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0">
                                                                <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quote</p>
                                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{order.quoteNumber}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex lg:flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    onClick={() => setLocation(`/sales-orders/${order.id}`)}
                                                    className="flex-1 lg:flex-initial lg:w-28 h-10 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 rounded-xl font-semibold"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" className="flex-1 lg:flex-initial lg:w-28 h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 font-semibold">
                                                            <MoreVertical className="h-4 w-4 mr-2" />
                                                            More
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                                        {order.status === "draft" && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => setLocation(`/sales-orders/${order.id}/edit`)}>
                                                                    <Pencil className="h-4 w-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                            </>
                                                        )}
                                                        <DropdownMenuItem onClick={() => window.open(`/api/sales-orders/${order.id}/pdf`, '_blank')}>
                                                            <Download className="h-4 w-4 mr-2" />
                                                            PDF
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredOrders.map((order) => (
                                <Card
                                    key={order.id}
                                    onClick={() => setLocation(`/sales-orders/${order.id}`)}
                                    className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                                >
                                    {/* Status Indicator */}
                                    <div className="absolute top-0 right-0 left-0 h-2 rounded-t-2xl"
                                        style={{
                                            background:
                                                order.status === "fulfilled" ? "rgb(34 197 94)" :
                                                order.status === "confirmed" ? "rgb(59 130 246)" :
                                                order.status === "cancelled" ? "rgb(239 68 68)" :
                                                "rgb(156 163 175)",
                                        }}
                                    />

                                    <CardHeader className="p-5 pb-3">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 shadow-md">
                                                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <Badge
                                                className={cn(
                                                    "px-3 py-1 text-xs font-semibold rounded-full",
                                                    getStatusColor(order.status)
                                                )}
                                            >
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                                            {order.orderNumber}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-0 space-y-3">
                                        {/* Client Info */}
                                        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950">
                                                    <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Client</span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{order.clientName}</p>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Calendar className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Date</span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {new Date(order.orderDate).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                            {order.quoteNumber && (
                                                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <FileText className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Quote</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{order.quoteNumber}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Amount */}
                                        <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Amount</span>
                                                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                                                {formatCurrency(order.total)}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="space-y-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                onClick={() => setLocation(`/sales-orders/${order.id}`)}
                                                className="w-full h-10 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 shadow-lg transition-all duration-200 hover:scale-105 rounded-xl font-semibold"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </Button>
                                            <div className="grid grid-cols-3 gap-2">
                                                {order.status === "draft" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setLocation(`/sales-orders/${order.id}/edit`);
                                                        }}
                                                        className="h-9 px-2 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(`/api/sales-orders/${order.id}/pdf`, '_blank');
                                                    }}
                                                    className="h-9 px-2 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 col-span-2"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="p-6 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
                            <Package className="h-16 w-16 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            No sales orders found
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                            {searchQuery
                                ? "Try adjusting your search or filters to find what you're looking for."
                                : "Orders will appear here once they're created from quotes."}
                        </p>
                        {searchQuery && (
                            <Button
                                onClick={() => setSearchQuery("")}
                                className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 shadow-lg rounded-xl"
                            >
                                Clear Search
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
