import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
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
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

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
    createdAt: string;
    isMaster?: boolean;
    parentInvoiceId?: string;
}

/**
 * Utility: safely coerce to number and guard against NaN/Infinity.
 */
const safeNumber = (value: string | number | null | undefined): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "paid":
            return "bg-success/10 text-success dark:bg-success/20 dark:text-success";
        case "partial":
            return "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning";
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

    const filteredInvoices = invoices?.filter((invoice) => {
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

    // Summary stats
    const stats = {
        totalCount: invoices?.length || 0,
        pending: invoices?.filter((i) => i.paymentStatus === "pending").length || 0,
        partial: invoices?.filter((i) => i.paymentStatus === "partial").length || 0,
        paid: invoices?.filter((i) => i.paymentStatus === "paid").length || 0,
        overdue: invoices?.filter((i) => i.paymentStatus === "overdue").length || 0,
        totalRevenue:
            invoices?.reduce((sum, i) => sum + safeNumber(i.total), 0) || 0,
        totalCollected:
            invoices?.reduce((sum, i) => sum + safeNumber(i.paidAmount), 0) || 0,
    };

    const outstanding = Math.max(
        stats.totalRevenue - stats.totalCollected,
        0
    );

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-3">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-7 w-48" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-24 rounded-lg" />
                        ))}
                    </div>
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-32 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-3">
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
                        <Receipt className="h-3.5 w-3.5" />
                        Invoices
                    </span>
                </nav>


                {/* Header */}
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        Invoices
                    </h1>
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        Revenue and payment tracking
                    </p>
                </div>

                {/* KPI ROW */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {/* Total Revenue */}
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="space-y-1 min-w-0 flex-1">
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                                        Revenue
                                    </p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white truncate">
                                        ₹{(stats.totalRevenue / 1000).toFixed(0)}K
                                    </p>
                                </div>
                                <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                                    <DollarSign className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                </div>
                            </div>
                            <p className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-400 truncate">
                                <Receipt className="h-3 w-3 shrink-0" />
                                <span className="truncate">{stats.totalCount} invoices</span>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Collected */}
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="space-y-1 min-w-0 flex-1">
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                                        Collected
                                    </p>
                                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 truncate">
                                        ₹{(stats.totalCollected / 1000).toFixed(0)}K
                                    </p>
                                </div>
                                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                            <p className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 truncate">
                                <TrendingUp className="h-3 w-3 shrink-0" />
                                <span className="truncate">{stats.paid} paid</span>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Outstanding */}
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="space-y-1 min-w-0 flex-1">
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                                        Outstanding
                                    </p>
                                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400 truncate">
                                        ₹{(outstanding / 1000).toFixed(0)}K
                                    </p>
                                </div>
                                <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0">
                                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate">
                                {stats.partial + stats.pending} pending
                            </p>
                        </CardContent>
                    </Card>

                    {/* Breakdown */}
                    <Card className="border-slate-200 dark:border-slate-800 col-span-2 lg:col-span-1">
                        <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="space-y-1 min-w-0 flex-1">
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                                        Breakdown
                                    </p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white truncate">
                                        {stats.totalCount}
                                    </p>
                                </div>
                                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
                                    <Receipt className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                                <div className="text-center">
                                    <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{stats.paid}</div>
                                    <div className="text-slate-500 dark:text-slate-400 truncate">Paid</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-amber-600 dark:text-amber-400 text-sm">{stats.partial}</div>
                                    <div className="text-slate-500 dark:text-slate-400 truncate">Partial</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-slate-900 dark:text-white text-sm">{stats.pending}</div>
                                    <div className="text-slate-500 dark:text-slate-400 truncate">Pending</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* SEARCH + FILTER */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-3">
                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <Input
                                    placeholder="Search invoices, clients, or quote numbers..."
                                    className="pl-9 pr-3 text-xs h-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    data-testid="input-search-invoices"
                                />
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        ×
                                    </Button>
                                )}
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger
                                    className="w-full sm:w-[140px] text-xs h-9"
                                    data-testid="select-status-filter"
                                >
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent align="end">
                                    <SelectItem value="all" className="text-xs">All statuses</SelectItem>
                                    <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                                    <SelectItem value="partial" className="text-xs">Partial</SelectItem>
                                    <SelectItem value="paid" className="text-xs">Paid</SelectItem>
                                    <SelectItem value="overdue" className="text-xs">Overdue</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

            {/* LIST / EMPTY */}
            {filteredInvoices && filteredInvoices.length > 0 ? (
                <section className="space-y-2">
                    {filteredInvoices.map((invoice) => {
                        const total = safeNumber(invoice.total);
                        const paid = safeNumber(invoice.paidAmount);
                        const outstandingAmount = Math.max(total - paid, 0);
                        const rawPercent = total > 0 ? (paid / total) * 100 : 0;
                        const percentPaid = Number.isFinite(rawPercent) ? rawPercent : 0;

                        return (
                            <Card
                                key={invoice.id}
                                className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-all duration-200 cursor-pointer border-l-4"
                                data-testid={`invoice-card-${invoice.id}`}
                                onClick={() => setLocation(`/invoices/${invoice.id}`)}
                                style={{
                                    borderLeftColor:
                                        invoice.paymentStatus === 'paid' ? 'rgb(34, 197, 94)' :
                                        invoice.paymentStatus === 'partial' ? 'rgb(234, 179, 8)' :
                                        invoice.paymentStatus === 'overdue' ? 'rgb(239, 68, 68)' :
                                        'rgb(59, 130, 246)'
                                }}
                            >
                                <CardContent className="p-3">
                                    <div className="flex flex-col lg:flex-row gap-3 items-start">
                                        {/* LEFT: main info */}
                                        <div className="flex-1 min-w-0 space-y-2.5">
                                            {/* Top row: title + status */}
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                                                    {invoice.invoiceNumber}
                                                </h3>
                                                {invoice.isMaster && (
                                                    <Badge className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-[10px] px-1.5 py-0">
                                                        Master
                                                    </Badge>
                                                )}
                                                {invoice.parentInvoiceId && (
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-300 dark:border-slate-700">
                                                        Child
                                                    </Badge>
                                                )}
                                                <Badge
                                                    className={`${getStatusColor(
                                                        invoice.paymentStatus
                                                    )} text-[10px] px-2 py-0.5 capitalize font-semibold`}
                                                >
                                                    {invoice.paymentStatus}
                                                </Badge>
                                                {invoice.paymentStatus === "overdue" && (
                                                    <Badge
                                                        className="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 text-[10px] flex items-center gap-0.5 px-1.5 py-0"
                                                    >
                                                        <AlertCircle className="h-2.5 w-2.5" />
                                                        Overdue
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Middle row: key fields */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                                <div className="min-w-0">
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5 uppercase font-semibold">
                                                        Client
                                                    </span>
                                                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                                                        {invoice.clientName}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5 uppercase font-semibold">
                                                        Due Date
                                                    </span>
                                                    <p className="font-medium text-slate-900 dark:text-white truncate">
                                                        {new Date(invoice.dueDate).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            }
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5 uppercase font-semibold">
                                                        Total
                                                    </span>
                                                    <p className="font-bold text-slate-900 dark:text-white truncate">
                                                        ₹{(total / 1000).toFixed(0)}K
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5 uppercase font-semibold">
                                                        Outstanding
                                                    </span>
                                                    <p className="font-bold text-amber-600 dark:text-amber-400 truncate">
                                                        ₹{(outstandingAmount / 1000).toFixed(0)}K
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Payment progress */}
                                            {percentPaid > 0 && (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400">
                                                        <span>Payment Progress</span>
                                                        <span className="font-semibold text-slate-900 dark:text-white">
                                                            {percentPaid.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-300 ${
                                                                percentPaid >= 100
                                                                    ? "bg-emerald-600 dark:bg-emerald-500"
                                                                    : "bg-blue-600 dark:bg-blue-500"
                                                            }`}
                                                            style={{ width: `${Math.min(percentPaid, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* RIGHT: actions - only show container if there are buttons */}
                                        <div
                                            className="flex flex-row lg:flex-col gap-1.5 lg:items-stretch w-full lg:w-auto"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 lg:flex-initial h-7 text-xs"
                                                onClick={() => setLocation(`/invoices/${invoice.id}`)}
                                                data-testid={`button-view-invoice-${invoice.id}`}
                                            >
                                                <Eye className="h-3 w-3 mr-1" />
                                                <span className="hidden sm:inline">View</span>
                                            </Button>

                                            {canGeneratePDF && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 lg:flex-initial h-7 text-xs"
                                                onClick={() => {
                                                    setDownloadingInvoiceId(invoice.id);
                                                    downloadPdfMutation.mutate(invoice.id);
                                                    setTimeout(() => setDownloadingInvoiceId(null), 2000);
                                                }}
                                                disabled={downloadingInvoiceId === invoice.id}
                                                data-testid={`button-download-invoice-${invoice.id}`}
                                              >
                                                {downloadingInvoiceId === invoice.id ? (
                                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                ) : (
                                                    <Download className="h-3 w-3 mr-1" />
                                                )}
                                                <span className="hidden sm:inline">PDF</span>
                                              </Button>
                                            )}

                                            {canSendEmail && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 lg:flex-initial h-7 text-xs"
                                                onClick={() => setLocation(`/invoices/${invoice.id}`)}
                                                data-testid={`button-email-invoice-${invoice.id}`}
                                              >
                                                <Send className="h-3 w-3 mr-1" />
                                                <span className="hidden sm:inline">Send</span>
                                              </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </section>
            ) : (
                <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center px-4">
                        <div className="rounded-full bg-slate-100 dark:bg-slate-900 p-8 mb-4">
                            <Receipt className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">
                            No invoices found
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md">
                            {searchQuery
                                ? "Try adjusting your search or filters to find what you're looking for."
                                : "Convert approved quotes to invoices to start tracking payments."}
                        </p>
                    </CardContent>
                </Card>
            )}
            </div>
        </div>
    );
}