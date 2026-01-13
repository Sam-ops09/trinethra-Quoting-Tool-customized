import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Search,
    FileText,
    Eye,
    Download,
    Send,
    Loader2,
    Pencil,
    Grid3x3,
    List,
    Clock,
    CheckCircle2,
    SlidersHorizontal,
    Calendar,
    DollarSign,
    Users,
    MoreVertical,
    X,
    Mail,
    Home,
    ChevronRight,
    TrendingUp,
    Filter,
    Copy,
} from "lucide-react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import type { Quote } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
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
import { PermissionGuard } from "@/components/permission-guard";
import { SendQuoteEmailDialog } from "@/components/send-quote-email-dialog";
import { cn } from "@/lib/utils";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { useAuth } from "@/lib/auth-context";
import { hasPermission } from "@/lib/permissions-new";

type ViewMode = "grid" | "list";
type StatusFilter =
    | "all"
    | "draft"
    | "sent"
    | "approved"
    | "rejected"
    | "invoiced";
type SortOption =
    | "newest"
    | "oldest"
    | "amount-high"
    | "amount-low"
    | "client";

export default function Quotes() {
    const [, setLocation] = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [selectedQuoteForEmail, setSelectedQuoteForEmail] = useState<(Quote & { clientName: string; clientEmail: string }) | null>(null);
    const [downloadingQuoteId, setDownloadingQuoteId] = useState<string | null>(
        null,
    );
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const { toast } = useToast();
    const { user } = useAuth();

    // Feature flags
    const canGeneratePDF = useFeatureFlag('quotes_pdfGeneration');
    const canSendEmail = useFeatureFlag('quotes_emailSending');
    const canClone = useFeatureFlag('quotes_clone');

    // Calculate if any actions are available for dropdown
    const hasDropdownActions = (quote: any) => {
        const canEdit = quote.status !== "invoiced" && user && hasPermission(user.role, "quotes", "edit");
        return canEdit || canGeneratePDF || canSendEmail || canClone;
    };

    const { data: quotes, isLoading } = useQuery<
        Array<Quote & { clientName: string; clientEmail: string }>
    >({
        queryKey: ["/api/quotes"],
    });

    const downloadPdfMutation = useMutation({
        mutationFn: async (quoteId: string) => {
            const response = await fetch(`/api/quotes/${quoteId}/pdf`, {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to download PDF");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Quote-${quoteId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Quote PDF downloaded successfully.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to download quote PDF.",
                variant: "destructive",
            });
        },
    });

    const cloneQuoteMutation = useMutation({
        mutationFn: async (quoteId: string) => {
           const response = await fetch(`/api/quotes/${quoteId}/clone`, {
               method: "POST",
               headers: {
                   "Content-Type": "application/json",
               },
           });
           
           if (!response.ok) {
               const error = await response.json();
               throw new Error(error.error || "Failed to clone quote");
           }
           
           return response.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Success",
                description: "Quote cloned successfully",
            });
            // Navigate to the new quote
            setLocation(`/quotes/${data.id}`);
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    });


    const stats = useMemo(() => {
        if (!quotes)
            return {
                total: 0,
                draft: 0,
                sent: 0,
                approved: 0,
                rejected: 0,
                invoiced: 0,
                totalValue: 0,
            };

        return {
            total: quotes.length,
            draft: quotes.filter((q) => q.status === "draft").length,
            sent: quotes.filter((q) => q.status === "sent").length,
            approved: quotes.filter((q) => q.status === "approved").length,
            rejected: quotes.filter((q) => q.status === "rejected").length,
            invoiced: quotes.filter((q) => q.status === "invoiced").length,
            totalValue: quotes.reduce((sum, q) => sum + Number(q.total), 0),
        };
    }, [quotes]);

    const filteredQuotes = useMemo(() => {
        if (!quotes) return [];

        let filtered = quotes.filter(
            (quote) =>
                quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                quote.clientName.toLowerCase().includes(searchQuery.toLowerCase()),
        );

        if (statusFilter !== "all") {
            filtered = filtered.filter((quote) => quote.status === statusFilter);
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return (
                        new Date(b.quoteDate).getTime() -
                        new Date(a.quoteDate).getTime()
                    );
                case "oldest":
                    return (
                        new Date(a.quoteDate).getTime() -
                        new Date(b.quoteDate).getTime()
                    );
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
    }, [quotes, searchQuery, statusFilter, sortBy]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "draft":
                return "bg-muted text-muted-foreground";
            case "sent":
                return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary";
            case "approved":
                return "bg-success/10 text-success dark:bg-success/20 dark:text-success";
            case "rejected":
                return "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive";
            case "invoiced":
                return "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent";
            case "closed_paid":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "closed_cancelled":
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, i) => (
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
                        <FileText className="h-3.5 w-3.5" />
                        Quotes
                    </span>
                </nav>

                {/* Premium Header */}
                <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                    <div className="relative px-6 sm:px-8 py-6 sm:py-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 shadow-lg">
                                        <FileText className="h-6 w-6 text-white dark:text-slate-900" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                                            Quotes
                                        </h1>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                            Manage all business proposals
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <PermissionGuard resource="quotes" action="create">
                                <Button
                                    onClick={() => setLocation("/quotes/create")}
                                    data-testid="button-create-quote"
                                    className="h-11 px-6 text-sm font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 w-full sm:w-auto rounded-xl"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Quote
                                </Button>
                            </PermissionGuard>
                        </div>
                    </div>
                </div>

                {/* Premium Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <CardContent className="relative p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="space-y-1.5 min-w-0 flex-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Total Quotes</p>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0 shadow-md">
                                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Pending</p>
                                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.draft + stats.sent}</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0 shadow-md">
                                    <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                                <span>Awaiting response</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <CardContent className="relative p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="space-y-1.5 min-w-0 flex-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Approved</p>
                                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0 shadow-md">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                <span>Confirmed deals</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <CardContent className="relative p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="space-y-1.5 min-w-0 flex-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Sent</p>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.sent}</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0 shadow-md">
                                    <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                <span>Out for review</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 col-span-2 sm:col-span-1">
                        <CardContent className="relative p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="space-y-1.5 min-w-0 flex-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Total Value</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{(stats.totalValue / 1000).toFixed(0)}K</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-md">
                                    <DollarSign className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                                <span>Revenue pipeline</span>
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
                                    placeholder="Search by quote number or client..."
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
                                    variant={statusFilter === "sent" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter("sent")}
                                    className={cn(
                                        "h-9 px-4 rounded-full text-sm font-medium transition-all duration-200",
                                        statusFilter === "sent" && "shadow-lg"
                                    )}
                                >
                                    Sent <Badge className="ml-2 h-5 px-2 text-xs bg-white/20 dark:bg-slate-900/20">{stats.sent}</Badge>
                                </Button>
                                <Button
                                    variant={statusFilter === "approved" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter("approved")}
                                    className={cn(
                                        "h-9 px-4 rounded-full text-sm font-medium transition-all duration-200",
                                        statusFilter === "approved" && "shadow-lg"
                                    )}
                                >
                                    Approved <Badge className="ml-2 h-5 px-2 text-xs bg-white/20 dark:bg-slate-900/20">{stats.approved}</Badge>
                                </Button>
                                <Button
                                    variant={statusFilter === "rejected" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter("rejected")}
                                    className={cn(
                                        "h-9 px-4 rounded-full text-sm font-medium transition-all duration-200",
                                        statusFilter === "rejected" && "shadow-lg"
                                    )}
                                >
                                    Rejected <Badge className="ml-2 h-5 px-2 text-xs bg-white/20 dark:bg-slate-900/20">{stats.rejected}</Badge>
                                </Button>
                                <Button
                                    variant={statusFilter === "invoiced" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter("invoiced")}
                                    className={cn(
                                        "h-9 px-4 rounded-full text-sm font-medium transition-all duration-200",
                                        statusFilter === "invoiced" && "shadow-lg"
                                    )}
                                >
                                    Invoiced <Badge className="ml-2 h-5 px-2 text-xs bg-white/20 dark:bg-slate-900/20">{stats.invoiced}</Badge>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quotes Content */}
                {filteredQuotes && filteredQuotes.length > 0 ? (
                    viewMode === "list" ? (
                        <div className="space-y-3">
                            {filteredQuotes.map((quote) => (
                                <Card
                                    key={quote.id}
                                    onClick={() => setLocation(`/quotes/${quote.id}`)}
                                    className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                                    data-testid={`quote-card-${quote.id}`}
                                >
                                    {/* Status Accent Bar */}
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-1.5"
                                        style={{
                                            background:
                                                quote.status === "approved" ? "rgb(34 197 94)" :
                                                quote.status === "sent" ? "rgb(59 130 246)" :
                                                quote.status === "rejected" ? "rgb(239 68 68)" :
                                                quote.status === "invoiced" ? "rgb(168 85 247)" :
                                                "rgb(156 163 175)",
                                        }}
                                    />

                                    <CardContent className="relative p-5 sm:p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                            {/* Quote Info */}
                                            <div className="flex-1 min-w-0 space-y-4">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                        {quote.quoteNumber}
                                                    </h3>
                                                    <Badge
                                                        className={cn(
                                                            "px-3 py-1 text-xs font-semibold rounded-full",
                                                            getStatusColor(quote.status)
                                                        )}
                                                    >
                                                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
                                                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Client</p>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{quote.clientName}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                                        <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center shrink-0">
                                                            <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Date</p>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                                {new Date(quote.quoteDate).toLocaleDateString("en-US", {
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
                                                                ₹{Number(quote.total).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                                        <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0">
                                                            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Validity</p>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{quote.validityDays} days</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex lg:flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    onClick={() => setLocation(`/quotes/${quote.id}`)}
                                                    data-testid={`button-view-quote-${quote.id}`}
                                                    className="flex-1 lg:flex-initial lg:w-28 h-10 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 rounded-xl font-semibold"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Button>

                                                {hasDropdownActions(quote) && (
                                                  <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" className="flex-1 lg:flex-initial lg:w-28 h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 font-semibold">
                                                            <MoreVertical className="h-4 w-4 mr-2" />
                                                            More
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                                        <PermissionGuard resource="quotes" action="edit">
                                                            {quote.status !== "invoiced" && (
                                                                <>
                                                                    <DropdownMenuItem
                                                                        onClick={() => setLocation(`/quotes/${quote.id}/edit`)}
                                                                        data-testid={`button-edit-quote-${quote.id}`}
                                                                    >
                                                                        <Pencil className="h-4 w-4 mr-2" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                </>
                                                            )}
                                                        </PermissionGuard>
                                                        {canClone && (
                                                            <PermissionGuard resource="quotes" action="create">
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (confirm("Are you sure you want to clone this quote?")) {
                                                                            cloneQuoteMutation.mutate(quote.id);
                                                                        }
                                                                    }}
                                                                >
                                                                    <Copy className="h-4 w-4 mr-2" />
                                                                    Clone
                                                                </DropdownMenuItem>
                                                            </PermissionGuard>
                                                        )}
                                                        {canGeneratePDF && (
                                                          <DropdownMenuItem
                                                            onClick={() => {
                                                                setDownloadingQuoteId(quote.id);
                                                                downloadPdfMutation.mutate(quote.id);
                                                                setTimeout(() => setDownloadingQuoteId(null), 2000);
                                                            }}
                                                            disabled={downloadingQuoteId === quote.id}
                                                            data-testid={`button-download-quote-${quote.id}`}
                                                          >
                                                            {downloadingQuoteId === quote.id ? (
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            ) : (
                                                                <Download className="h-4 w-4 mr-2" />
                                                            )}
                                                            PDF
                                                          </DropdownMenuItem>
                                                        )}
                                                        {canSendEmail && (
                                                          <PermissionGuard resource="quotes" action="edit" tooltipText="Not available for this role">
                                                            <DropdownMenuItem
                                                              onClick={() => {
                                                                  setSelectedQuoteForEmail(quote);
                                                                  setEmailDialogOpen(true);
                                                              }}
                                                              data-testid={`button-email-quote-${quote.id}`}
                                                            >
                                                              <Send className="h-4 w-4 mr-2" />
                                                              Email
                                                            </DropdownMenuItem>
                                                          </PermissionGuard>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredQuotes.map((quote) => (
                                <Card
                                    key={quote.id}
                                    onClick={() => setLocation(`/quotes/${quote.id}`)}
                                    className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                                    data-testid={`quote-card-${quote.id}`}
                                >
                                    {/* Status Indicator */}
                                    <div className="absolute top-0 right-0 left-0 h-2 rounded-t-2xl"
                                        style={{
                                            background:
                                                quote.status === "approved" ? "rgb(34 197 94)" :
                                                quote.status === "sent" ? "rgb(59 130 246)" :
                                                quote.status === "rejected" ? "rgb(239 68 68)" :
                                                quote.status === "invoiced" ? "rgb(168 85 247)" :
                                                "rgb(156 163 175)",
                                        }}
                                    />

                                    <CardHeader className="p-5 pb-3">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 shadow-md">
                                                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <Badge
                                                className={cn(
                                                    "px-3 py-1 text-xs font-semibold rounded-full",
                                                    getStatusColor(quote.status)
                                                )}
                                            >
                                                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                                            {quote.quoteNumber}
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
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{quote.clientName}</p>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Calendar className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Date</span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {new Date(quote.quoteDate).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Valid</span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{quote.validityDays}d</p>
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Amount</span>
                                                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                                                ₹{Number(quote.total).toLocaleString()}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="space-y-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                onClick={() => setLocation(`/quotes/${quote.id}`)}
                                                data-testid={`button-view-quote-${quote.id}`}
                                                className="w-full h-10 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 shadow-lg transition-all duration-200 hover:scale-105 rounded-xl font-semibold"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </Button>
                                            <div className="grid grid-cols-3 gap-2">
                                                <PermissionGuard resource="quotes" action="edit">
                                                    {quote.status !== "invoiced" && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setLocation(`/quotes/${quote.id}/edit`);
                                                            }}
                                                            data-testid={`button-edit-quote-${quote.id}`}
                                                            className="h-9 px-2 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </PermissionGuard>
                                                {canClone && (
                                                    <PermissionGuard resource="quotes" action="create">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (confirm("Are you sure you want to clone this quote?")) {
                                                                    cloneQuoteMutation.mutate(quote.id);
                                                                }
                                                            }}
                                                            className="h-9 px-2 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800"
                                                            title="Clone Quote"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </PermissionGuard>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDownloadingQuoteId(quote.id);
                                                        downloadPdfMutation.mutate(quote.id);
                                                        setTimeout(() => setDownloadingQuoteId(null), 2000);
                                                    }}
                                                    disabled={downloadingQuoteId === quote.id}
                                                    data-testid={`button-download-quote-${quote.id}`}
                                                    className="h-9 px-2 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800"
                                                >
                                                    {downloadingQuoteId === quote.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Download className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedQuoteForEmail(quote);
                                                        setEmailDialogOpen(true);
                                                    }}
                                                    data-testid={`button-email-quote-${quote.id}`}
                                                    className="h-9 px-2 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800"
                                                >
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )
                ) : (
                    <Card className="relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center px-6">
                            <div className="relative mb-6">
                                <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-12 shadow-lg">
                                    <FileText className="h-16 w-16 text-slate-400 dark:text-slate-600" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                                No quotes found
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
                                {searchQuery || statusFilter !== "all"
                                    ? "Try adjusting your search or filter criteria to find what you're looking for"
                                    : "Start creating professional quotes to manage your business proposals efficiently"}
                            </p>
                            {!searchQuery && statusFilter === "all" && (
                                <PermissionGuard resource="quotes" action="create">
                                    <Button
                                        onClick={() => setLocation("/quotes/create")}
                                        data-testid="button-create-first-quote"
                                        className="h-12 px-8 text-sm font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 rounded-xl"
                                    >
                                        <Plus className="h-5 w-5 mr-2" />
                                        Create Your First Quote
                                    </Button>
                                </PermissionGuard>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Email Dialog */}
            {selectedQuoteForEmail && (
                <SendQuoteEmailDialog
                    open={emailDialogOpen}
                    onOpenChange={setEmailDialogOpen}
                    quoteId={selectedQuoteForEmail.id}
                    quoteNumber={selectedQuoteForEmail.quoteNumber}
                    clientEmail={selectedQuoteForEmail.clientEmail}
                    clientName={selectedQuoteForEmail.clientName}
                />
            )}
        </div>
    );
}