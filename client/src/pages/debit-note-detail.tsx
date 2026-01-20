/**
 * Debit Note Detail Page
 * 
 * Displays a debit note with actions to issue, apply, or cancel
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Send,
    CheckCircle,
    XCircle,
    Home,
    ChevronRight,
    Loader2,
    FileWarning,
    FileText,
    Calendar,
    User,
    Receipt,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { isFeatureEnabled } from "@shared/feature-flags";

interface DebitNote {
    id: string;
    debitNoteNumber: string;
    invoiceId: string;
    status: string;
    issueDate: string | null;
    appliedDate: string | null;
    reason: string;
    notes: string | null;
    total: string;
    createdAt: string;
    updatedAt: string;
    invoice?: {
        id: string;
        invoiceNumber: string;
        total: string;
    };
    client?: {
        id: string;
        name: string;
        email: string;
    };
    items?: Array<{
        id: string;
        description: string;
        quantity: number;
        unitPrice: string;
        hsnSac: string | null;
    }>;
}

const STATUS_STEPS = [
    { id: "draft", label: "Draft" },
    { id: "issued", label: "Issued" },
    { id: "applied", label: "Applied" },
];

function getStatusColor(status: string) {
    switch (status) {
        case "applied":
            return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";
        case "issued":
            return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
        case "draft":
            return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
        case "cancelled":
            return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
        default:
            return "bg-slate-100 text-slate-600";
    }
}

export default function DebitNoteDetailPage() {
    const [, params] = useRoute("/debit-notes/:id");
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showApplyDialog, setShowApplyDialog] = useState(false);

    const { data: debitNote, isLoading } = useQuery<DebitNote>({
        queryKey: ["/api/debit-notes", params?.id],
        enabled: !!params?.id,
    });

    const issueMutation = useMutation({
        mutationFn: async () => {
            return await apiRequest("POST", `/api/debit-notes/${params?.id}/issue`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/debit-notes", params?.id] });
            queryClient.invalidateQueries({ queryKey: ["/api/debit-notes"] });
            toast({
                title: "Debit Note Issued",
                description: "The debit note has been issued successfully.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to issue debit note.",
                variant: "destructive",
            });
        },
    });

    const applyMutation = useMutation({
        mutationFn: async () => {
            return await apiRequest("POST", `/api/debit-notes/${params?.id}/apply`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/debit-notes", params?.id] });
            queryClient.invalidateQueries({ queryKey: ["/api/debit-notes"] });
            queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
            setShowApplyDialog(false);
            toast({
                title: "Debit Note Applied",
                description: "The additional charge has been applied to the invoice successfully.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to apply debit note.",
                variant: "destructive",
            });
        },
    });

    const cancelMutation = useMutation({
        mutationFn: async () => {
            return await apiRequest("POST", `/api/debit-notes/${params?.id}/cancel`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/debit-notes", params?.id] });
            queryClient.invalidateQueries({ queryKey: ["/api/debit-notes"] });
            setShowCancelDialog(false);
            toast({
                title: "Debit Note Cancelled",
                description: "The debit note has been cancelled.",
                variant: "destructive",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to cancel debit note.",
                variant: "destructive",
            });
        },
    });

    const selectedStatusIndex = STATUS_STEPS.findIndex((s) => s.id === debitNote?.status);

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-3">
                    <Skeleton className="h-4 w-48" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-7 w-40" />
                        </div>
                        <Skeleton className="h-8 w-32" />
                    </div>
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                        <div className="space-y-3">
                            <Skeleton className="h-40 rounded-lg" />
                            <Skeleton className="h-64 rounded-lg" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="h-48 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!debitNote) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-xl mx-auto p-4 sm:p-6">
                    <Card className="text-center">
                        <CardHeader>
                            <CardTitle className="text-base sm:text-lg">
                                Debit note not found
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                The requested debit note could not be located.
                            </p>
                            <Button
                                className="mt-4"
                                onClick={() => setLocation("/debit-notes")}
                                variant="outline"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Debit Notes
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const canIssue = debitNote.status === "draft" && isFeatureEnabled("debitNotes_issue");
    const canApply = debitNote.status === "issued" && isFeatureEnabled("debitNotes_apply") && !!debitNote.invoiceId;
    const canCancel = debitNote.status !== "cancelled" && debitNote.status !== "applied";

    const formatCurrency = (val: string) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(val));

    const formatDate = (dateStr: string | null) =>
        dateStr ? new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

    return (
        <div className="min-h-screen flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-fit mb-2">
                        <button
                            onClick={() => setLocation("/")}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                        >
                            <Home className="h-3.5 w-3.5" />
                            <span>Home</span>
                        </button>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        <button
                            onClick={() => setLocation("/debit-notes")}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                        >
                            <FileWarning className="h-3.5 w-3.5" />
                            <span>Debit Notes</span>
                        </button>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                            <FileWarning className="h-3.5 w-3.5" />
                            {debitNote.debitNoteNumber}
                        </span>
                    </nav>

                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setLocation("/debit-notes")}
                                className="h-8 w-8 shrink-0"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                                        {debitNote.debitNoteNumber}
                                    </h1>
                                    <Badge variant="outline" className={`${getStatusColor(debitNote.status)} text-xs px-2 py-0.5 h-6`}>
                                        {debitNote.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 shrink-0 flex-wrap">
                            {canIssue && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => issueMutation.mutate()}
                                    disabled={issueMutation.isPending}
                                    className="h-8 px-3 text-xs"
                                >
                                    {issueMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1" />}
                                    <span>Issue</span>
                                </Button>
                            )}
                            {canApply && (
                                <Button
                                    size="sm"
                                    className="bg-rose-600 hover:bg-rose-700 text-white h-8 px-3 text-xs"
                                    onClick={() => setShowApplyDialog(true)}
                                >
                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                    <span>Apply to Invoice</span>
                                </Button>
                            )}
                            {canCancel && (
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setShowCancelDialog(true)}
                                    className="h-8 px-3 text-xs"
                                >
                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                    <span>Cancel</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Status Progress Bar */}
                    <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-2">
                        {STATUS_STEPS.map((step, index) => {
                            const isCompleted = index <= selectedStatusIndex;
                            const isCurrent = index === selectedStatusIndex;

                            return (
                                <div key={step.id} className="flex items-center gap-2 shrink-0">
                                    <div className="flex items-center gap-1.5">
                                        <div
                                            className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold transition-all ${
                                                isCompleted
                                                    ? "bg-rose-600 text-white"
                                                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                                            } ${isCurrent ? "ring-2 ring-rose-300 ring-offset-2" : ""}`}
                                        >
                                            {index + 1}
                                        </div>
                                        <span
                                            className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
                                                isCompleted ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                                            }`}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                    {index < STATUS_STEPS.length - 1 && (
                                        <div className={`h-px w-6 sm:w-12 transition-colors ${isCompleted ? "bg-rose-600" : "bg-slate-200 dark:bg-slate-800"}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 w-full max-w-[1800px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
                    {/* Left Column */}
                    <div className="space-y-4 sm:space-y-6 min-w-0">
                        {/* Client & Invoice Cards */}
                        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                            {/* Client Card */}
                            <Card className="border-slate-200 dark:border-slate-800">
                                <CardHeader className="p-3 sm:p-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                                    <CardTitle className="text-xs sm:text-sm font-bold flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Client
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 sm:p-4 space-y-2 text-xs sm:text-sm">
                                    <p className="font-semibold text-slate-900 dark:text-white break-words">
                                        {debitNote.client?.name || "Unknown Client"}
                                    </p>
                                    <p className="text-slate-600 dark:text-slate-400 break-all">
                                        {debitNote.client?.email || "-"}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Invoice Card */}
                            <Card className="border-slate-200 dark:border-slate-800">
                                <CardHeader className="p-3 sm:p-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                                    <CardTitle className="text-xs sm:text-sm font-bold flex items-center gap-2">
                                        <Receipt className="h-4 w-4" />
                                        Invoice
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 sm:p-4">
                                    {debitNote.invoiceId ? (
                                        <>
                                            <Button
                                                variant="outline"
                                                className="w-full h-9 text-xs sm:text-sm"
                                                onClick={() => setLocation(`/invoices/${debitNote.invoiceId}`)}
                                            >
                                                {debitNote.invoice?.invoiceNumber || "View Invoice"}
                                            </Button>
                                            {debitNote.invoice && (
                                                <p className="text-xs text-slate-500 mt-2 text-center">
                                                    Invoice Total: {formatCurrency(debitNote.invoice.total)}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-slate-500 text-center italic py-2">
                                            Standalone Debit Note (No Invoice Linked)
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Reason Card */}
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader className="p-3 sm:p-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                                <CardTitle className="text-xs sm:text-sm font-bold flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Reason
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-4">
                                <p className="text-sm text-slate-900 dark:text-white">
                                    {debitNote.reason}
                                </p>
                                {debitNote.notes && (
                                    <p className="text-xs text-slate-500 mt-2 whitespace-pre-wrap">
                                        {debitNote.notes}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Items Card */}
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader className="p-3 sm:p-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                                <CardTitle className="text-xs sm:text-sm font-bold">
                                    Line Items ({debitNote.items?.length || 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-4 space-y-3">
                                {debitNote.items?.map((item) => (
                                    <div
                                        key={item.id}
                                        className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50 dark:bg-slate-900/50"
                                    >
                                        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                            {item.description}
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 dark:text-slate-400">
                                            <div>Qty: <span className="font-medium text-slate-900 dark:text-white">{item.quantity}</span></div>
                                            <div>Price: <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(item.unitPrice)}</span></div>
                                            <div>HSN: <span className="font-medium text-slate-900 dark:text-white">{item.hsnSac || "-"}</span></div>
                                            <div>Total: <span className="font-medium text-rose-600">{formatCurrency(String(item.quantity * parseFloat(item.unitPrice)))}</span></div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-24 self-start">
                        {/* Summary */}
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader className="p-3 sm:p-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                                <CardTitle className="text-xs sm:text-sm font-bold">Debit Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-4 space-y-2 text-xs sm:text-sm">
                                <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex justify-between items-center">
                                    <span className="font-bold text-slate-900 dark:text-white">Total Debit</span>
                                    <span className="font-bold text-rose-600 text-lg">
                                        {formatCurrency(debitNote.total)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dates */}
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader className="p-3 sm:p-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                                <CardTitle className="text-xs sm:text-sm font-bold flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Dates
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-4 space-y-2 text-xs sm:text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Created</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{formatDate(debitNote.createdAt)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Issued</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{formatDate(debitNote.issueDate)}</span>
                                </div>
                                {debitNote.appliedDate && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">Applied</span>
                                        <span className="font-medium text-rose-600">{formatDate(debitNote.appliedDate)}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Apply Confirmation Dialog */}
            <AlertDialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apply Debit Note?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will add an additional charge of <strong>{formatCurrency(debitNote.total)}</strong> to invoice{" "}
                            <strong>{debitNote.invoice?.invoiceNumber}</strong>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => applyMutation.mutate()}
                            disabled={applyMutation.isPending}
                            className="bg-rose-600 text-white hover:bg-rose-700"
                        >
                            {applyMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Apply Debit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Debit Note?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel debit note{" "}
                            <strong>{debitNote.debitNoteNumber}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>No, Keep It</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => cancelMutation.mutate()}
                            disabled={cancelMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {cancelMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Yes, Cancel
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
