
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
    ArrowUpRight,
    MoreHorizontal,
    Download,
    Pencil
} from "lucide-react";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type StatusFilter = "all" | "draft" | "confirmed" | "fulfilled" | "cancelled";
type SortOption = "newest" | "oldest" | "amount-high" | "amount-low" | "client";

export default function SalesOrdersList() {
    const [, setLocation] = useLocation();
    const isEnabled = useFeatureFlag("sales_orders_module");
    const [searchQuery, setSearchQuery] = useState("");

    if (isEnabled === false) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
                <h1 className="text-2xl font-bold">Feature Disabled</h1>
                <p className="text-muted-foreground">The Sales Orders module is currently disabled.</p>
                <Button onClick={() => setLocation("/")}>Go Home</Button>
            </div>
        );
    }
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [sortBy, setSortBy] = useState<SortOption>("newest");

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
                return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
            case "confirmed":
                return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
            case "fulfilled":
                return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800";
            case "cancelled":
                return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
            default:
                return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 p-6 space-y-6">
                 <div className="w-full max-w-[1600px] mx-auto space-y-6">
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                        ))}
                    </div>
                    <Skeleton className="h-[500px] w-full rounded-2xl" />
                 </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 animate-in fade-in duration-500">
            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
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
                        <Package className="h-3.5 w-3.5" />
                        Sales Orders
                    </span>
                </nav>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Sales Orders
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Manage and track your customer orders and fulfillment status.
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="group relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Orders</p>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.total}</h3>
                                </div>
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:scale-110 transition-transform">
                                    <Package className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="group relative overflow-hidden rounded-xl border border-blue-100/60 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Confirmed</p>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-300 mt-2">{stats.confirmed}</h3>
                                </div>
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
                                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="group relative overflow-hidden rounded-xl border border-emerald-100/60 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Fulfilled</p>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-300 mt-2">{stats.fulfilled}</h3>
                                </div>
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg group-hover:scale-110 transition-transform">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="group relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Value</p>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">₹{(stats.totalValue / 1000).toFixed(1)}k</h3>
                                </div>
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:scale-110 transition-transform">
                                    <DollarSign className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search - Pinned Sticky Header on Mobile could be added here if needed */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 px-1 no-scrollbar">
                         <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            {(["all", "draft", "confirmed", "fulfilled", "cancelled"] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize whitespace-nowrap",
                                        statusFilter === status
                                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                            : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                                    )}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                            <SelectTrigger className="w-[140px] h-9 text-xs border-0 bg-slate-100 dark:bg-slate-800 ml-1">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                                <SelectItem value="amount-high">Amount High</SelectItem>
                                <SelectItem value="amount-low">Amount Low</SelectItem>
                                <SelectItem value="client">Client Name</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Content - Responsive List/Table */}
                <div className="space-y-4">
                    {filteredOrders && filteredOrders.length > 0 ? (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                        <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                                            <TableHead className="w-[180px] font-semibold text-xs uppercase tracking-wider text-slate-500">Order #</TableHead>
                                            <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500">Client</TableHead>
                                            <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500">Date</TableHead>
                                            <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500">Status</TableHead>
                                            <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-slate-500">Amount</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredOrders.map((order) => (
                                            <TableRow 
                                                key={order.id} 
                                                className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border-slate-100 dark:border-slate-800"
                                                onClick={() => setLocation(`/sales-orders/${order.id}`)}
                                            >
                                                <TableCell className="font-medium text-slate-900 dark:text-slate-200">
                                                    <div className="flex flex-col">
                                                        <span>{order.orderNumber}</span>
                                                        <span className="text-xs text-slate-400 font-normal">Ref: {order.quoteNumber}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                                                            {order.clientName.charAt(0)}
                                                        </div>
                                                        <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">{order.clientName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-slate-500 dark:text-slate-400 text-sm">
                                                        {format(new Date(order.orderDate), "MMM d, yyyy")}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={cn("rounded-full font-medium text-[10px] px-2.5 py-0.5 uppercase tracking-wide", getStatusColor(order.status))}>
                                                        {order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-slate-900 dark:text-white">
                                                    ₹{Number(order.total).toLocaleString()}
                                                </TableCell>
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4 text-slate-500" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => setLocation(`/sales-orders/${order.id}`)}>
                                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                                            </DropdownMenuItem>
                                                            {order.status === 'draft' && (
                                                                <DropdownMenuItem onClick={() => setLocation(`/sales-orders/${order.id}/edit`)}>
                                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem onClick={() => window.open(`/api/sales-orders/${order.id}/pdf`, '_blank')}>
                                                                <Download className="mr-2 h-4 w-4" /> Download PDF
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden grid grid-cols-1 gap-4">
                                {filteredOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        onClick={() => setLocation(`/sales-orders/${order.id}`)}
                                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        <div className={cn("absolute top-0 left-0 bottom-0 w-1", 
                                            order.status === 'confirmed' ? 'bg-blue-500' :
                                            order.status === 'fulfilled' ? 'bg-emerald-500' :
                                            order.status === 'cancelled' ? 'bg-red-500' : 'bg-slate-300'
                                        )} />
                                        
                                        <div className="pl-3 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-slate-900 dark:text-white">
                                                            {order.orderNumber}
                                                        </h3>
                                                        <Badge variant="outline" className={cn("rounded-md text-[10px] px-1.5 py-0 h-5", getStatusColor(order.status))}>
                                                            {order.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                        Ref: {order.quoteNumber}
                                                    </p>
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 -mr-2 -mt-2 text-slate-400">
                                                    <ChevronRight className="h-5 w-5" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                                <div className="col-span-2 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                                    <Users className="h-4 w-4 text-slate-400" />
                                                    <span className="font-medium truncate">{order.clientName}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Calendar className="h-4 w-4 text-slate-400" />
                                                    <span>{format(new Date(order.orderDate), "MMM d")}</span>
                                                </div>
                                                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white justify-end">
                                                    <span className="text-xs font-normal text-slate-500">Total:</span>
                                                    ₹{Number(order.total).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                <Package className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No sales orders found</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2 mb-6">
                                Try adjusting your search or filters, or create a new order from a quote.
                            </p>
                            <Button onClick={() => setSearchQuery("")} variant="outline">
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
