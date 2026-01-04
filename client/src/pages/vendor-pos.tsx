import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Plus,
    Building2,
    FileText,
    Calendar,
    ArrowUpRight,
    Filter,
    LayoutGrid,
    Home,
    ChevronRight,
    Clock,
    CheckCircle2,
    Send,
    XCircle,
    TrendingUp,
    Eye,
    Edit,
    Trash2,
    MoreVertical,
    X,
    Package,
    Truck
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { SelectQuoteForPoDialog } from "@/components/vendor-po/select-quote-for-po-dialog";
import { PermissionGuard } from "@/components/permission-guard";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Types
interface VendorPO {
    id: string;
    poNumber: string;
    quoteId: string;
    quoteNumber: string;
    vendorName: string;
    status: string;
    orderDate: string;
    expectedDeliveryDate?: string;
    total: string;
    createdAt: string;
}

const STATUS_CONFIG: Record<string, {
    color: string;
    label: string;
    icon: any;
    gradient: string;
    progress: number;
}> = {
    draft: {
        color: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
        label: "Draft",
        icon: Edit,
        gradient: "from-slate-400 to-slate-500",
        progress: 20
    },
    sent: {
        color: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
        label: "Sent",
        icon: Send,
        gradient: "from-slate-400 to-slate-500",
        progress: 40
    },
    acknowledged: {
        color: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
        label: "Acknowledged",
        icon: CheckCircle2,
        gradient: "from-slate-400 to-slate-500",
        progress: 60
    },
    fulfilled: {
        color: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
        label: "Fulfilled",
        icon: Package,
        gradient: "from-slate-700 to-slate-800",
        progress: 100
    },
    cancelled: {
        color: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
        label: "Cancelled",
        icon: XCircle,
        gradient: "from-slate-300 to-slate-400",
        progress: 0
    },
};

export default function VendorPOs() {
    const [, setLocation] = useLocation();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [dialog, setDialog] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const { data: pos, isLoading } = useQuery<VendorPO[]>({ queryKey: ["/api/vendor-pos"] });

    const filtered = useMemo(() => pos?.filter((po) => {
        const q = search.toLowerCase().trim();
        const matchSearch = !q || po.poNumber.toLowerCase().includes(q) || po.vendorName.toLowerCase().includes(q) || po.quoteNumber.toLowerCase().includes(q);
        const matchStatus = status === "all" || po.status === status;
        return matchSearch && matchStatus;
    }), [pos, search, status]);

    const stats = useMemo(() => ({
        total: pos?.length || 0,
        draft: pos?.filter((p) => p.status === "draft").length || 0,
        sent: pos?.filter((p) => p.status === "sent").length || 0,
        acknowledged: pos?.filter((p) => p.status === "acknowledged").length || 0,
        fulfilled: pos?.filter((p) => p.status === "fulfilled").length || 0,
        cancelled: pos?.filter((p) => p.status === "cancelled").length || 0,
    }), [pos]);

    const formatCurrency = (val: string) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(val));

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });

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
                                <FileText className="h-3.5 w-3.5" />
                                Purchase Orders
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
                            <PermissionGuard resource="vendor-pos" action="create">
                                <Button
                                    onClick={() => setDialog(true)}
                                    size="sm"
                                    className="h-8 px-3 text-xs bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900"
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                                    <span className="hidden sm:inline">Create Order</span>
                                    <span className="sm:hidden">New</span>
                                </Button>
                            </PermissionGuard>
                        </div>
                    </div>

                    {/* Quick Stats Bar */}
                    <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {[
                            { key: "total", label: "Total", value: stats.total, icon: FileText, color: "text-slate-600 dark:text-slate-400" },
                            { key: "draft", label: "Draft", value: stats.draft, icon: Edit, color: "text-slate-600 dark:text-slate-400" },
                            { key: "sent", label: "Sent", value: stats.sent, icon: Send, color: "text-blue-600 dark:text-blue-400" },
                            { key: "acknowledged", label: "Ack", value: stats.acknowledged, icon: CheckCircle2, color: "text-violet-600 dark:text-violet-400" },
                            { key: "fulfilled", label: "Done", value: stats.fulfilled, icon: Package, color: "text-emerald-600 dark:text-emerald-400" },
                            { key: "cancelled", label: "Cancel", value: stats.cancelled, icon: XCircle, color: "text-rose-600 dark:text-rose-400" },
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
                    {/* Filter Sidebar - Desktop */}
                    <div className={cn(
                        "lg:block lg:w-64 xl:w-72 shrink-0",
                        filterOpen ? "block" : "hidden"
                    )}>
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
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                                            Search
                                        </label>
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                            <Input
                                                placeholder="PO #, vendor, quote..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="pl-8 h-9 text-xs"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                                            Status
                                        </label>
                                        <div className="space-y-1.5">
                                            {["all", "draft", "sent", "acknowledged", "fulfilled", "cancelled"].map((s) => (
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
                                                    <span className="capitalize">{s === "all" ? "All Orders" : s}</span>
                                                    {s !== "all" && (
                                                        <span className={cn("font-bold", status === s ? "" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.color.split(" ")[1])}>
                                                            {stats[s as keyof typeof stats]}
                                                        </span>
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
                            <div className={cn(
                                "grid gap-3 sm:gap-4",
                                viewMode === "grid"
                                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                                    : "grid-cols-1"
                            )}>
                                {filtered.map((po) => {
                                    const statusConfig = STATUS_CONFIG[po.status] || STATUS_CONFIG.draft;
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <Card
                                            key={po.id}
                                            onMouseEnter={() => setHoveredCard(po.id)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                            onClick={() => setLocation(`/vendor-pos/${po.id}`)}
                                            className={cn(
                                                "group relative border-slate-200 dark:border-slate-800 cursor-pointer transition-all duration-300 overflow-hidden",
                                                "hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-950/50 hover:-translate-y-1",
                                                hoveredCard === po.id && "ring-2 ring-blue-500/50"
                                            )}
                                        >
                                            {/* Progress Bar */}
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
                                                <div
                                                    className={cn("h-full bg-gradient-to-r transition-all duration-500", statusConfig.gradient)}
                                                    style={{ width: `${statusConfig.progress}%` }}
                                                />
                                            </div>

                                            <CardHeader className="pb-3 p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <CardTitle className="text-base font-bold text-slate-900 dark:text-white truncate">
                                                                {po.poNumber}
                                                            </CardTitle>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(po.orderDate)}
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(statusConfig.color, "shrink-0 text-[10px] px-2 py-1 font-semibold")}
                                                    >
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {statusConfig.label}
                                                    </Badge>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="p-4 pt-0 space-y-3">
                                                {/* Vendor Info */}
                                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                        <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                            {po.vendorName}
                                                        </p>
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                                            Quote: {po.quoteNumber}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Delivery Info */}
                                                {po.expectedDeliveryDate && (
                                                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                                                        <Truck className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400 shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Expected Delivery</p>
                                                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                                {formatDate(po.expectedDeliveryDate)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                <Separator className="my-2" />

                                                {/* Amount & Actions */}
                                                <div className="flex items-end justify-between">
                                                    <div>
                                                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">
                                                            Order Total
                                                        </p>
                                                        <p className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                                            {formatCurrency(po.total)}
                                                        </p>
                                                    </div>
                                                    <div className={cn(
                                                        "flex items-center gap-1 transition-all duration-300",
                                                        hoveredCard === po.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                                                    )}>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setLocation(`/vendor-pos/${po.id}`);
                                                            }}
                                                        >
                                                            <Eye className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                        >
                                                            <ArrowUpRight className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>

                                            {/* Hover Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700">
                                <CardContent className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 rounded-full blur-2xl opacity-20" />
                                            <div className="relative rounded-full bg-slate-100 dark:bg-slate-800 p-6">
                                                <LayoutGrid className="h-12 w-12 text-slate-400" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                No Purchase Orders Found
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {search
                                                    ? "Try adjusting your search or filter criteria."
                                                    : "Create your first purchase order from an approved quote."}
                                            </p>
                                        </div>
                                        {!search && (
                                            <PermissionGuard resource="vendor-pos" action="create">
                                                <Button
                                                    onClick={() => setDialog(true)}
                                                    size="lg"
                                                    className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Create Your First Order
                                                </Button>
                                            </PermissionGuard>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Action Button - Mobile */}
            <PermissionGuard resource="vendor-pos" action="create">
                <Button
                    onClick={() => setDialog(true)}
                    size="icon"
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 lg:hidden z-50"
                >
                    <Plus className="h-6 w-6 text-white dark:text-slate-900" />
                </Button>
            </PermissionGuard>

            <SelectQuoteForPoDialog open={dialog} onOpenChange={setDialog} />
        </div>
    );
}


function LoadingSkeleton() {
    return (
        <div className="min-h-screen">
            {/* Sticky Header Bar */}
            <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
                <div className="w-full max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 py-2.5">
                    <div className="flex items-center justify-between gap-3">
                        <Skeleton className="h-5 w-48" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-28" />
                        </div>
                    </div>
                    {/* Quick Stats Bar */}
                    <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-9 w-24 rounded-full shrink-0" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
                <div className="flex gap-4">
                    {/* Filter Sidebar Skeleton */}
                    <div className="hidden lg:block lg:w-64 xl:w-72 shrink-0">
                        <div className="space-y-3">
                            <Skeleton className="h-64 rounded-lg" />
                        </div>
                    </div>

                    {/* Main Content Skeleton */}
                    <div className="flex-1 min-w-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <Skeleton className="h-1 w-full rounded-none" />
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <Skeleton className="h-6 w-32" />
                                            <Skeleton className="h-6 w-20 rounded-full" />
                                        </div>
                                        <Skeleton className="h-16 w-full rounded-lg" />
                                        <Skeleton className="h-14 w-full rounded-lg" />
                                        <div className="flex items-end justify-between">
                                            <Skeleton className="h-8 w-24" />
                                            <Skeleton className="h-8 w-16" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}