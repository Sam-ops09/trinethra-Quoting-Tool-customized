import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, CheckCircle, XCircle, AlertCircle, Plus, PackageCheck, Truck, Barcode, Home, ChevronRight, Calendar } from "lucide-react";
import { PermissionGuard } from "@/components/permission-guard";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// Interface (Unchanged)
interface GRN {
    id: string;
    grnNumber: string;
    vendorPoId: string;
    poNumber: string;
    vendorName: string;
    receivedDate: string;
    quantityOrdered: number;
    quantityReceived: number;
    quantityRejected: number;
    inspectionStatus: string;
    deliveryNoteNumber: string;
    batchNumber: string;
}

// --- Component Start ---

export default function GRNList() {
    const [, setLocation] = useLocation();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("all"); // New state for status filtering

    const { data: grns = [], isLoading } = useQuery<GRN[]>({
        queryKey: ["/api/grns"],
    });

    // Consolidated Filtering Logic
    const filteredGRNs = grns
        .filter((grn) => {
            // Status Filter
            const matchStatus = activeFilter === "all" || grn.inspectionStatus === activeFilter;

            // Search Term Filter
            const q = searchTerm.toLowerCase().trim();
            const matchSearch =
                grn.grnNumber.toLowerCase().includes(q) ||
                grn.poNumber.toLowerCase().includes(q) ||
                grn.vendorName.toLowerCase().includes(q) ||
                grn.deliveryNoteNumber?.toLowerCase().includes(q);

            return matchStatus && matchSearch;
        })
        .sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime()); // Sort by newest first

    // Status Configuration (Improved)
    const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
        pending: { label: "Pending Inspection", color: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-400", icon: AlertCircle },
        approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-400", icon: CheckCircle },
        rejected: { label: "Rejected", color: "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-400", icon: XCircle },
        partial: { label: "Partially Approved", color: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/50 dark:text-blue-400", icon: AlertCircle },
    };

    // Stats Calculation for Cards (Unchanged)
    const stats = {
        total: grns.length,
        pending: grns.filter(g => g.inspectionStatus === 'pending').length,
        approved: grns.filter(g => g.inspectionStatus === 'approved').length,
        rejected: grns.filter(g => g.inspectionStatus === 'rejected').length,
    };

    // Helper for Date Formatting
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    if (isLoading) {
        return <LoadingSkeleton />;
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
                        <PackageCheck className="h-3.5 w-3.5" />
                        GRN List
                    </span>
                </nav>


                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                            Goods Received Notes
                        </h1>
                        <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            Track inventory receipts & inspections
                        </p>
                    </div>
                    <PermissionGuard resource="grn" action="create">
                        <Button
                            onClick={() => setLocation("/vendor-pos")}
                            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 h-8 text-xs"
                        >
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Record GRN</span>
                            <span className="sm:hidden">New</span>
                        </Button>
                    </PermissionGuard>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    <Card
                        className={`border-slate-200 dark:border-slate-800 cursor-pointer transition-all ${
                            activeFilter === 'all' ? 'ring-2 ring-slate-900 dark:ring-slate-100' : 'hover:shadow-md'
                        }`}
                        onClick={() => setActiveFilter('all')}
                    >
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Total</span>
                                <PackageCheck className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
                            <p className="text-[10px] text-slate-600 dark:text-slate-400">GRNs</p>
                        </CardContent>
                    </Card>

                    <Card
                        className={`border-slate-200 dark:border-slate-800 cursor-pointer transition-all ${
                            activeFilter === 'pending' ? 'ring-2 ring-amber-600 dark:ring-amber-400' : 'hover:shadow-md'
                        }`}
                        onClick={() => setActiveFilter('pending')}
                    >
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Pending</span>
                                <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</div>
                            <p className="text-[10px] text-slate-600 dark:text-slate-400">Inspection</p>
                        </CardContent>
                    </Card>

                    <Card
                        className={`border-slate-200 dark:border-slate-800 cursor-pointer transition-all ${
                            activeFilter === 'approved' ? 'ring-2 ring-emerald-600 dark:ring-emerald-400' : 'hover:shadow-md'
                        }`}
                        onClick={() => setActiveFilter('approved')}
                    >
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Approved</span>
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</div>
                            <p className="text-[10px] text-slate-600 dark:text-slate-400">Complete</p>
                        </CardContent>
                    </Card>

                    <Card
                        className={`border-slate-200 dark:border-slate-800 cursor-pointer transition-all ${
                            activeFilter === 'rejected' ? 'ring-2 ring-rose-600 dark:ring-rose-400' : 'hover:shadow-md'
                        }`}
                        onClick={() => setActiveFilter('rejected')}
                    >
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Issues</span>
                                <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
                                {stats.rejected + grns.filter(g => g.inspectionStatus === 'partial').length}
                            </div>
                            <p className="text-[10px] text-slate-600 dark:text-slate-400">Rejected</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search Bar */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-3">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <Input
                                placeholder="Search by GRN, PO, vendor, or delivery note..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-9 text-xs"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* GRN List */}
                {filteredGRNs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredGRNs.map((grn) => {
                            const status = STATUS_CONFIG[grn.inspectionStatus] || STATUS_CONFIG.pending;
                            const Icon = status.icon;
                            return (
                                <Card
                                    key={grn.id}
                                    onClick={() => setLocation(`/grn/${grn.id}`)}
                                    className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer"
                                >
                                    <CardHeader className="pb-2.5 p-3 border-b border-slate-200 dark:border-slate-800">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                    {grn.grnNumber}
                                                </CardTitle>
                                                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(grn.receivedDate)}
                                                </p>
                                            </div>
                                            <Badge className={`${status.color} shrink-0 text-[10px] px-1.5 py-0.5 capitalize gap-1`}>
                                                <Icon className="h-2.5 w-2.5" />
                                                {status.label.split(' ')[0]}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="pt-3 p-3 space-y-2.5">
                                        {/* Vendor & PO Info */}
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                                                <Truck className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                                    {grn.vendorName}
                                                </p>
                                                <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                                                    PO: {grn.poNumber}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Delivery Note */}
                                        {grn.deliveryNoteNumber && (
                                            <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                                <div className="flex items-center gap-1.5 text-[11px]">
                                                    <Barcode className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                                                    <span className="text-slate-600 dark:text-slate-400">DN:</span>
                                                    <span className="text-slate-900 dark:text-white font-medium truncate">
                                                        {grn.deliveryNoteNumber}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <Separator />

                                        {/* Quantities */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="text-center">
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-0.5">
                                                    Ordered
                                                </p>
                                                <p className="text-base font-bold text-slate-900 dark:text-white">
                                                    {grn.quantityOrdered}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-0.5">
                                                    Received
                                                </p>
                                                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                                    {grn.quantityReceived}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-0.5">
                                                    Rejected
                                                </p>
                                                <p className="text-base font-bold text-rose-600 dark:text-rose-400">
                                                    {grn.quantityRejected}
                                                </p>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* View Button */}
                                        <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                                            <Eye className="h-3 w-3 mr-1.5" />
                                            View Details
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty State */
                    <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700">
                        <CardContent className="py-12 text-center">
                            <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
                                <div className="rounded-full bg-slate-100 dark:bg-slate-900 p-5">
                                    <PackageCheck className="h-10 w-10 text-slate-400" />
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        No GRNs Found
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        {searchTerm || activeFilter !== 'all'
                                            ? "Try adjusting your search or filter criteria."
                                            : "Start by recording a GRN against an acknowledged Purchase Order."}
                                    </p>
                                </div>
                                {!searchTerm && activeFilter === 'all' && (
                                    <PermissionGuard resource="grn" action="create">
                                        <Button
                                            onClick={() => setLocation("/vendor-pos")}
                                            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 h-8 text-xs"
                                        >
                                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                                            Record First GRN
                                        </Button>
                                    </PermissionGuard>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

// Loading Skeleton
function LoadingSkeleton() {
    return (
        <div className="min-h-screen">
            <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-3">
                <Skeleton className="h-4 w-40 mb-3" />
                <div className="flex justify-between items-center mb-3">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-8 w-28" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-lg" />
                    ))}
                </div>
                <Skeleton className="h-10 w-full mb-3 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-64 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
}