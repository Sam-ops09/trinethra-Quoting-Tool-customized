/**
 * Debit Notes List Page
 * 
 * Displays all debit notes with filtering and navigation
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Plus,
    FileWarning,
    Calendar,
    ArrowUpRight,
    Filter,
    LayoutGrid,
    Home,
    ChevronRight,
    CheckCircle2,
    XCircle,
    FileText,
    Eye,
    Edit,
    X,
    Receipt,
    Send,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { isFeatureEnabled } from "@shared/feature-flags";
import { PermissionGuard } from "@/components/permission-guard";

interface DebitNote {
    id: string;
    debitNoteNumber: string;
    invoiceId: string;
    status: string;
    issueDate: string;
    reason: string;
    total: string;
    createdAt: string;
    invoice?: {
        id: string;
        invoiceNumber: string;
    };
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
    draft: {
        color: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
        label: "Draft",
        icon: Edit,
        gradient: "from-slate-400 to-slate-500",
        progress: 25
    },
    issued: {
        color: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
        label: "Issued",
        icon: Send,
        gradient: "from-orange-400 to-orange-500",
        progress: 50
    },
    applied: {
        color: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
        label: "Applied",
        icon: CheckCircle2,
        gradient: "from-rose-400 to-rose-500",
        progress: 100
    },
    cancelled: {
        color: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
        label: "Cancelled",
        icon: XCircle,
        gradient: "from-slate-400 to-slate-500",
        progress: 0
    },
};

export default function DebitNotes() {
    const [, setLocation] = useLocation();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [filterOpen, setFilterOpen] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const { data: debitNotes, isLoading } = useQuery<DebitNote[]>({ 
        queryKey: ["/api/debit-notes"],
    });

    const filtered = useMemo(() => debitNotes?.filter((dn) => {
        const q = search.toLowerCase().trim();
        const matchSearch = !q || 
            dn.debitNoteNumber.toLowerCase().includes(q) || 
            dn.client?.name?.toLowerCase().includes(q) || 
            dn.invoice?.invoiceNumber?.toLowerCase().includes(q) ||
            dn.reason?.toLowerCase().includes(q);
        const matchStatus = status === "all" || dn.status === status;
        return matchSearch && matchStatus;
    }), [debitNotes, search, status]);

    const stats = useMemo(() => ({
        total: debitNotes?.length || 0,
        draft: debitNotes?.filter((d) => d.status === "draft").length || 0,
        issued: debitNotes?.filter((d) => d.status === "issued").length || 0,
        applied: debitNotes?.filter((d) => d.status === "applied").length || 0,
        cancelled: debitNotes?.filter((d) => d.status === "cancelled").length || 0,
    }), [debitNotes]);

    const formatCurrency = (val: string) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(val));

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });

    if (!isFeatureEnabled("debitNotes_module")) {
        return (
            <div className="container mx-auto py-8">
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">Debit Notes feature is disabled.</p>
                    </CardContent>
                </Card>
            </div>
        );
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
                                <FileWarning className="h-3.5 w-3.5" />
                                Debit Notes
                            </span>
                        </nav>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFilterOpen(!filterOpen)}
                                className="h-8 px-2.5 text-xs lg:hidden"
                            >
                                <Filter className={cn("h-3.5 w-3.5", filterOpen && "text-orange-600")} />
                            </Button>
                            {isFeatureEnabled("debitNotes_create") && (
                                <PermissionGuard resource="invoices" action="create">
                                    <Button
                                        size="sm"
                                        className="h-8 px-3 text-xs bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900"
                                        onClick={() => setLocation("/debit-notes/new")}
                                    >
                                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                                        <span className="hidden sm:inline">New Debit Note</span>
                                        <span className="sm:hidden">New</span>
                                    </Button>
                                </PermissionGuard>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats Bar */}
                    <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {[
                            { key: "total", label: "Total", value: stats.total, icon: FileWarning, color: "text-slate-600 dark:text-slate-400" },
                            { key: "draft", label: "Draft", value: stats.draft, icon: Edit, color: "text-slate-600 dark:text-slate-400" },
                            { key: "issued", label: "Issued", value: stats.issued, icon: Send, color: "text-orange-600 dark:text-orange-400" },
                            { key: "applied", label: "Applied", value: stats.applied, icon: CheckCircle2, color: "text-rose-600 dark:text-rose-400" },
                            { key: "cancelled", label: "Cancelled", value: stats.cancelled, icon: XCircle, color: "text-slate-600 dark:text-slate-400" },
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
                                                placeholder="Number, client, invoice..."
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
                                            {["all", "draft", "issued", "applied", "cancelled"].map((s) => (
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
                                                    <span className="capitalize">{s === "all" ? "All Notes" : s}</span>
                                                    {s !== "all" && (
                                                        <span className="font-bold">
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
                            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                                {filtered.map((dn) => {
                                    const statusConfig = STATUS_CONFIG[dn.status] || STATUS_CONFIG.draft;
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <Card
                                            key={dn.id}
                                            onMouseEnter={() => setHoveredCard(dn.id)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                            onClick={() => setLocation(`/debit-notes/${dn.id}`)}
                                            className={`group relative border-slate-200 dark:border-slate-800 cursor-pointer transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-950/50 hover:-translate-y-1 ${hoveredCard === dn.id ? "ring-2 ring-rose-500/50" : ""}`}
                                        >
                                            {/* Progress Bar */}
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
                                                                {dn.debitNoteNumber}
                                                            </CardTitle>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(dn.issueDate || dn.createdAt)}
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className={`${statusConfig.color} shrink-0 text-[10px] px-2 py-1 font-semibold`}
                                                    >
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {statusConfig.label}
                                                    </Badge>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="p-4 pt-0 space-y-3">
                                                {/* Client & Invoice Info */}
                                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                                    <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                                                        <FileWarning className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                            {dn.client?.name || "Unknown Client"}
                                                        </p>
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                                            Invoice: {dn.invoice?.invoiceNumber || "-"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Reason */}
                                                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Reason</p>
                                                    <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                                                        {dn.reason || "-"}
                                                    </p>
                                                </div>

                                                <Separator className="my-2" />

                                                {/* Amount & Actions */}
                                                <div className="flex items-end justify-between">
                                                    <div>
                                                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">
                                                            Debit Amount
                                                        </p>
                                                        <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
                                                            {formatCurrency(dn.total)}
                                                        </p>
                                                    </div>
                                                    <div className={`flex items-center gap-1 transition-all duration-300 ${hoveredCard === dn.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setLocation(`/debit-notes/${dn.id}`);
                                                            }}
                                                        >
                                                            <Eye className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>

                                            {/* Hover Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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
                                                <FileWarning className="h-12 w-12 text-slate-400" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                No Debit Notes Found
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {search
                                                    ? "Try adjusting your search or filter criteria."
                                                    : "Create your first debit note for additional charges."}
                                            </p>
                                        </div>
                                        {!search && isFeatureEnabled("debitNotes_create") && (
                                            <Button
                                                size="lg"
                                                className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900"
                                                onClick={() => setLocation("/debit-notes/new")}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create Your First Debit Note
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Action Button - Mobile */}
            {isFeatureEnabled("debitNotes_create") && (
                <Button
                    size="icon"
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 lg:hidden z-50"
                    onClick={() => setLocation("/debit-notes/new")}
                >
                    <Plus className="h-6 w-6 text-white dark:text-slate-900" />
                </Button>
            )}
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="min-h-screen">
            <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
                <div className="w-full max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 py-2.5">
                    <div className="flex items-center justify-between gap-3">
                        <Skeleton className="h-5 w-48" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-28" />
                        </div>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-9 w-24 rounded-full shrink-0" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
                <div className="flex gap-4">
                    <div className="hidden lg:block lg:w-64 xl:w-72 shrink-0">
                        <Skeleton className="h-64 rounded-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="h-64 rounded-lg" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
