import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Receipt,
    Eye,
    Download,
    Send,
    Loader2,
    DollarSign,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Home,
    ChevronRight,
    MoreVertical,
    Pencil,
    Filter,
    X,
    SlidersHorizontal,
    List,
    Grid3x3,
    Calendar,
    Users,
    BarChart3,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
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
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";

interface Invoice {
    id: string;
    invoiceNumber: string;
    quoteId: string;
    quoteNumber: string;
    clientName: string;
    paymentStatus: string;
    dueDate: string;
    paidAmount: string;
    total: string;
    currency?: string;
    createdAt: string;
    isMaster?: boolean;
    parentInvoiceId?: string;
}

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "amount-high" | "amount-low" | "client";

/**
 * Utility: safely coerce to number and guard against NaN/Infinity.
 */
const safeNumber = (value: string | number | null | undefined): number => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const str = String(value).replace(/[^0-9.-]+/g, "");
    const n = parseFloat(str);
    return Number.isFinite(n) ? n : 0;
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "paid":
            return "bg-success/10 text-success dark:bg-success/20 dark:text-success";
        case "partial":
            return "bg-amber-100/50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300";
        case "pending":
            return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary";
        case "overdue":
            return "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive";
        default:
            return "bg-muted text-muted-foreground";
    }
};

export default function Invoices() {
    const [, setLocation] = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
    const { toast } = useToast();

    // Feature flags
    const canGeneratePDF = useFeatureFlag('invoices_pdfGeneration');
    const canSendEmail = useFeatureFlag('invoices_emailSending');

    const { data: invoices, isLoading } = useQuery<Invoice[]>({
        queryKey: ["/api/invoices"],
    });

    const downloadPdfMutation = useMutation({
        mutationFn: async (invoiceId: string) => {
            const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to download PDF");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Invoice-${invoiceId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Invoice PDF downloaded successfully.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to download invoice PDF.",
                variant: "destructive",
            });
        },
    });

    const filteredInvoices = useMemo(() => {
        if (!invoices) return [];
        
        let filtered = invoices.filter((invoice) => {
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !query ||
                invoice.invoiceNumber.toLowerCase().includes(query) ||
                invoice.clientName.toLowerCase().includes(query) ||
                invoice.quoteNumber.toLowerCase().includes(query);
            const matchesStatus =
                statusFilter === "all" || invoice.paymentStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });

        filtered.sort((a, b) => {
             switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case "amount-high":
                    return safeNumber(b.total) - safeNumber(a.total);
                case "amount-low":
                    return safeNumber(a.total) - safeNumber(b.total);
                case "client":
                    return a.clientName.localeCompare(b.clientName);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [invoices, searchQuery, statusFilter, sortBy]);

    // Summary stats
    const stats = useMemo(() => {
        if (!invoices) return {
            totalCount: 0,
            pending: 0,
            partial: 0,
            paid: 0,
            overdue: 0,
            totalRevenue: 0,
            totalCollected: 0
        };

        return {
            totalCount: invoices.length,
            pending: invoices.filter((i) => i.paymentStatus === "pending").length,
            partial: invoices.filter((i) => i.paymentStatus === "partial").length,
            paid: invoices.filter((i) => i.paymentStatus === "paid").length,
            overdue: invoices.filter((i) => i.paymentStatus === "overdue").length,
            totalRevenue: invoices.reduce((sum, i) => sum + safeNumber(i.total), 0),
            totalCollected: invoices.reduce((sum, i) => sum + safeNumber(i.paidAmount), 0),
        };
    }, [invoices]);

    const outstanding = Math.max(
        stats.totalRevenue - stats.totalCollected,
        0
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-10 w-64" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <Receipt className="h-3.5 w-3.5" />
                        Invoices
                    </span>
                </nav>

                {/* Premium Header */}
                <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                    <div className="relative px-6 sm:px-8 py-6 sm:py-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 shadow-lg">
                                        <Receipt className="h-6 w-6 text-white dark:text-slate-900" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                                            Invoices
                                        </h1>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                            Track revenue and payment status
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Button 
                                onClick={() => setLocation("/invoices/analytics")}
                                className="bg-white/50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 backdrop-blur-sm"
                                variant="outline"
                            >
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Analytics
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Premium Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Revenue */}
                    <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <CardContent className="relative p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="space-y-1.5 min-w-0 flex-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Total Revenue</p>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-md">
                                    <DollarSign className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                                <Receipt className="h-3.5 w-3.5" />
                                <span>{stats.totalCount} invoices</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Collected */}
                    <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <CardContent className="relative p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="space-y-1.5 min-w-0 flex-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Collected</p>
                                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.totalCollected)}</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0 shadow-md">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                <TrendingUp className="h-3.5 w-3.5" />
                                <span>{stats.paid} paid</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Outstanding */}
                    <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <CardContent className="relative p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="space-y-1.5 min-w-0 flex-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Outstanding</p>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(outstanding)}</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0 shadow-md">
                                    <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                <span>{stats.partial + stats.pending} pending</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Paid Count */}
                    <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <CardContent className="relative p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="space-y-1.5 min-w-0 flex-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Paid</p>
                                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.paid}</p>
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
                                    placeholder="Search by invoice number, client, or quote..."
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
                                    All <Badge className="ml-2 h-5 px-2 text-xs bg-white/20 dark:bg-slate-900/20">{stats.totalCount}</Badge>
                                </Button>
                                <Button
                                    variant={statusFilter === "pending" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter("pending")}
                                    className={cn(
                                        "h-9 px-4 rounded-full text-sm font-medium transition-all duration-200",
                                        statusFilter === "pending" && "shadow-lg"
                                    )}
                                >
                                    Pending <Badge className="ml-2 h-5 px-2 text-xs bg-white/20 dark:bg-slate-900/20">{stats.pending}</Badge>
                                </Button>
                                <Button
                                    variant={statusFilter === "partial" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter("partial")}
                                    className={cn(
                                        "h-9 px-4 rounded-full text-sm font-medium transition-all duration-200",
                                        statusFilter === "partial" && "shadow-lg"
                                    )}
                                >
                                    Partial <Badge className="ml-2 h-5 px-2 text-xs bg-white/20 dark:bg-slate-900/20">{stats.partial}</Badge>
                                </Button>
                                <Button
                                    variant={statusFilter === "paid" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter("paid")}
                                    className={cn(
                                        "h-9 px-4 rounded-full text-sm font-medium transition-all duration-200",
                                        statusFilter === "paid" && "shadow-lg"
                                    )}
                                >
                                    Paid <Badge className="ml-2 h-5 px-2 text-xs bg-white/20 dark:bg-slate-900/20">{stats.paid}</Badge>
                                </Button>
                                <Button
                                    variant={statusFilter === "overdue" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter("overdue")}
                                    className={cn(
                                        "h-9 px-4 rounded-full text-sm font-medium transition-all duration-200",
                                        statusFilter === "overdue" && "shadow-lg"
                                    )}
                                >
                                    Overdue <Badge className="ml-2 h-5 px-2 text-xs bg-white/20 dark:bg-slate-900/20">{stats.overdue}</Badge>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Invoices Content */}
                {filteredInvoices && filteredInvoices.length > 0 ? (
                    viewMode === "list" ? (
                        <div className="space-y-3">
                            {filteredInvoices.map((invoice) => {
                                const total = safeNumber(invoice.total);
                                const paid = safeNumber(invoice.paidAmount);
                                const rawPercent = total > 0 ? (paid / total) * 100 : 0;
                                const percentPaid = Number.isFinite(rawPercent) ? rawPercent : 0;

                                return (
                                    <Card
                                        key={invoice.id}
                                        onClick={() => setLocation(`/invoices/${invoice.id}`)}
                                        className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                                    >
                                        {/* Status Accent Bar */}
                                        <div
                                            className="absolute left-0 top-0 bottom-0 w-1.5"
                                            style={{
                                                background:
                                                    invoice.paymentStatus === "paid" ? "rgb(34 197 94)" :
                                                    invoice.paymentStatus === "partial" ? "rgb(251 191 36)" :
                                                    invoice.paymentStatus === "pending" ? "rgb(59 130 246)" :
                                                    invoice.paymentStatus === "overdue" ? "rgb(239 68 68)" :
                                                    "rgb(156 163 175)",
                                            }}
                                        />

                                        <CardContent className="relative p-5 sm:p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                                {/* Invoice Info */}
                                                <div className="flex-1 min-w-0 space-y-4">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                            {invoice.invoiceNumber}
                                                        </h3>
                                                        <Badge
                                                            className={cn(
                                                                "px-3 py-1 text-xs font-semibold rounded-full",
                                                                getStatusColor(invoice.paymentStatus)
                                                            )}
                                                        >
                                                            {invoice.paymentStatus.charAt(0).toUpperCase() + invoice.paymentStatus.slice(1)}
                                                        </Badge>
                                                        {invoice.isMaster && <Badge variant="secondary" className="text-xs px-2 py-0.5">Master</Badge>}
                                                        {invoice.parentInvoiceId && <Badge variant="outline" className="text-xs px-2 py-0.5">Child</Badge>}
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                                            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
                                                                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Client</p>
                                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{invoice.clientName}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                                            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center shrink-0">
                                                                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Due Date</p>
                                                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                                    {new Date(invoice.dueDate).toLocaleDateString("en-US", {
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
                                                                    {formatCurrency(invoice.total, invoice.currency)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                                            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0">
                                                                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Progress</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={cn("h-full rounded-full transition-all",
                                                                                percentPaid >= 100 ? "bg-emerald-500" :
                                                                                percentPaid > 0 ? "bg-amber-500" : "bg-slate-300"
                                                                            )}
                                                                            style={{ width: `${percentPaid}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">{Math.round(percentPaid)}%</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex lg:flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        onClick={() => setLocation(`/invoices/${invoice.id}`)}
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
                                                            {canGeneratePDF && (
                                                                <DropdownMenuItem onClick={async (e) => {
                                                                    e.preventDefault();
                                                                    setDownloadingInvoiceId(invoice.id);
                                                                    try {
                                                                        await downloadPdfMutation.mutateAsync(invoice.id);
                                                                    } finally {
                                                                        setDownloadingInvoiceId(null);
                                                                    }
                                                                }}>
                                                                    {downloadingInvoiceId === invoice.id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                                                                    PDF
                                                                </DropdownMenuItem>
                                                            )}
                                                            {canSendEmail && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => setLocation(`/invoices/${invoice.id}`)}>
                                                                        <Send className="h-4 w-4 mr-2" />
                                                                        Email
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredInvoices.map((invoice) => {
                                const total = safeNumber(invoice.total);
                                const paid = safeNumber(invoice.paidAmount);
                                const rawPercent = total > 0 ? (paid / total) * 100 : 0;
                                const percentPaid = Number.isFinite(rawPercent) ? rawPercent : 0;

                                return (
                                    <Card
                                        key={invoice.id}
                                        onClick={() => setLocation(`/invoices/${invoice.id}`)}
                                        className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                                    >
                                        {/* Status Indicator */}
                                        <div className="absolute top-0 right-0 left-0 h-2 rounded-t-2xl"
                                            style={{
                                                background:
                                                    invoice.paymentStatus === "paid" ? "rgb(34 197 94)" :
                                                    invoice.paymentStatus === "partial" ? "rgb(251 191 36)" :
                                                    invoice.paymentStatus === "pending" ? "rgb(59 130 246)" :
                                                    invoice.paymentStatus === "overdue" ? "rgb(239 68 68)" :
                                                    "rgb(156 163 175)",
                                            }}
                                        />

                                        <CardHeader className="p-5 pb-3">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 shadow-md">
                                                    <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <Badge
                                                    className={cn(
                                                        "px-3 py-1 text-xs font-semibold rounded-full",
                                                        getStatusColor(invoice.paymentStatus)
                                                    )}
                                                >
                                                    {invoice.paymentStatus.charAt(0).toUpperCase() + invoice.paymentStatus.slice(1)}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                                                {invoice.invoiceNumber}
                                            </CardTitle>
                                            {(invoice.isMaster || invoice.parentInvoiceId) && (
                                                <div className="flex gap-1 mt-1">
                                                    {invoice.isMaster && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">Master</Badge>}
                                                    {invoice.parentInvoiceId && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">Child</Badge>}
                                                </div>
                                            )}
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
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{invoice.clientName}</p>
                                            </div>

                                            {/* Details */}
                                            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Calendar className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Due Date</span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                            </div>

                                            {/* Progress */}
                                            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Progress</span>
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">{Math.round(percentPaid)}%</span>
                                                </div>
                                                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full rounded-full transition-all",
                                                            percentPaid >= 100 ? "bg-emerald-500" :
                                                            percentPaid > 0 ? "bg-amber-500" : "bg-slate-300"
                                                        )}
                                                        style={{ width: `${percentPaid}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Amount */}
                                            <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Amount</span>
                                                    <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                                                    {formatCurrency(invoice.total, invoice.currency)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="space-y-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    onClick={() => setLocation(`/invoices/${invoice.id}`)}
                                                    className="w-full h-10 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 shadow-lg transition-all duration-200 hover:scale-105 rounded-xl font-semibold"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Button>
                                                {canGeneratePDF && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            setDownloadingInvoiceId(invoice.id);
                                                            try {
                                                                await downloadPdfMutation.mutateAsync(invoice.id);
                                                            } finally {
                                                                setDownloadingInvoiceId(null);
                                                            }
                                                        }}
                                                        className="w-full h-9 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800"
                                                    >
                                                        {downloadingInvoiceId === invoice.id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                                                        PDF
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="p-6 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
                            <Receipt className="h-16 w-16 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            No invoices found
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                            {searchQuery
                                ? "Try adjusting your search or filters to find what you're looking for."
                                : "Invoices will appear here once they're created."}
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