import { useLocation, useRoute } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Download,
    Send,
    Loader2,
    Building2,
    Mail,
    Phone,
    MapPin,
    FileText,
    Calendar,
    Receipt,
    DollarSign,
    AlertCircle,
    CheckCircle2,
    Clock,
    TrendingUp,
    Package,
    CreditCard,
    Home,
    ChevronRight,
    Bell,
    Trash,
    Lock,
    Unlock,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/use-permissions";
import { PermissionGuard } from "@/components/permission-guard";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { PaymentTracker } from "@/components/invoice/payment-tracker";
import { Separator } from "@/components/ui/separator";
import { InvoiceSplitWizard } from "@/components/invoice/split-wizard";
import { SerialNumberEntry } from "@/components/invoice/serial-number-entry";
import { MasterInvoiceManager } from "@/components/invoice/master-invoice-manager";
import { EditInvoiceDialog } from "@/components/invoice/edit-invoice-dialog";
import { ExecBOMSection } from "@/components/shared/exec-bom-section";
import { formatCurrency } from "@/lib/currency";
import { CommentsSection } from "@/components/comments-section";
import type { ExecBOMData } from "@/types/bom-types";


interface InvoiceDetail {
    id: string;
    invoiceNumber: string;
    quoteId: string;
    quoteNumber: string;
    status: string;
    isMaster: boolean;
    masterInvoiceStatus?: string;
    parentInvoiceId?: string;
    childInvoices?: Array<{
        id: string;
        invoiceNumber: string;
        total: string;
        paymentStatus: string;
        createdAt: string;
    }>;
    client: {
        name: string;
        email: string;
        phone: string;
        billingAddress: string;
        gstin: string;
    };
    items: Array<{
        id: string;
        description: string;
        quantity: number;
        fulfilledQuantity: number;
        unitPrice: string;
        subtotal: string;
        serialNumbers?: string;
        hsnSac?: string;
    }>;
    subtotal: string;
    discount: string;
    cgst: string;
    sgst: string;
    igst: string;
    shippingCharges: string;
    total: string;
    currency?: string;
    dueDate: string;
    paymentStatus: string;
    paidAmount: string;
    notes?: string;
    termsAndConditions?: string;
    deliveryNotes?: string;
    milestoneDescription?: string;
    createdAt: string;
    createdByName?: string;
    bomSection?: string;
    // Invoice management fields
    cancelledAt?: string;
    cancelledBy?: string;
    cancellationReason?: string;
    finalizedAt?: string;
    finalizedBy?: string;
    isLocked?: boolean;
}

export default function InvoiceDetail() {
    const [, params] = useRoute("/invoices/:id");
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    // Feature flags
    const canGeneratePDF = useFeatureFlag('invoices_pdfGeneration');
    const canSendEmail = useFeatureFlag('invoices_emailSending');
    const canSendReminder = useFeatureFlag('invoices_paymentReminders');
    const canCreatePayment = useFeatureFlag('payments_create');
    const canCreateChildInvoice = useFeatureFlag('invoices_childInvoices');
    const canFinalizeInvoice = useFeatureFlag('invoices_finalize');
    const canLockInvoice = useFeatureFlag('invoices_lock');
    const canCancelInvoice = useFeatureFlag('invoices_cancel');

    const [showEmailDialog, setShowEmailDialog] = useState(false);
    const [emailData, setEmailData] = useState({ email: "", message: "" });
    const [isDownloading, setIsDownloading] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [paymentData, setPaymentData] = useState({ status: "", paidAmount: "" });
    const [showSplitWizard, setShowSplitWizard] = useState(false);
    const [showSerialDialog, setShowSerialDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showReminderDialog, setShowReminderDialog] = useState(false);
    const [reminderEmail, setReminderEmail] = useState("");
    const [reminderMessage, setReminderMessage] = useState("");
    
    // Invoice management states
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancellationReason, setCancellationReason] = useState("");
    const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
    
    // BOM State
    const [bomData, setBomData] = useState<ExecBOMData>({ blocks: [] });
    // Keep track if BOM data is dirty/changed to enable save button
    const [isBomDirty, setIsBomDirty] = useState(false);

    const { data: invoice, isLoading } = useQuery<InvoiceDetail>({
        queryKey: ["/api/invoices", params?.id],
        enabled: !!params?.id,
    });
    
    // Sync BOM data when invoice loads
    useEffect(() => {
        if (invoice?.bomSection) {
            try {
                const parsed = JSON.parse(invoice.bomSection);
                setBomData(parsed);
            } catch (e) {
                console.error("Failed to parse BOM section:", e);
                setBomData({ blocks: [] });
            }
        } else if (invoice) {
             setBomData({ blocks: [] });
        }
    }, [invoice]);
    
    const updateBomMutation = useMutation({
        mutationFn: async (data: ExecBOMData) => {
            return await apiRequest("PUT", `/api/invoices/${params?.id}/master-details`, {
                bomSection: JSON.stringify(data)
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/invoices", params?.id] });
            toast({
                title: "Success",
                description: "BOM updated successfully.",
            });
            setIsBomDirty(false);
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error?.message || "Failed to update BOM.",
                variant: "destructive",
            });
        },
    });
    
    const handleBomChange = (newData: ExecBOMData) => {
        setBomData(newData);
        setIsBomDirty(true);
    };
    
    const handleSaveBom = () => {
        updateBomMutation.mutate(bomData);
    };

    const updatePaymentMutation = useMutation({
        mutationFn: async (data: { paymentStatus?: string; paidAmount?: string }) => {
            return await apiRequest("PUT", `/api/invoices/${params?.id}/payment-status`, data);
        },
        onSuccess: () => {
            // Force refetch to ensure payment status updates immediately (since staleTime is Infinity)
            queryClient.refetchQueries({ queryKey: ["/api/invoices", params?.id] });
            queryClient.refetchQueries({ queryKey: ["/api/invoices"] });

            // If this is a child invoice, also refetch the parent
            if (invoice?.parentInvoiceId) {
                queryClient.refetchQueries({ queryKey: ["/api/invoices", invoice.parentInvoiceId] });
            }

            toast({
                title: "Success",
                description: "Payment details updated successfully.",
            });
            setShowPaymentDialog(false);
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error?.message || "Failed to update payment details.",
                variant: "destructive",
            });
        },
    });

    const handleUpdatePayment = () => {
        if (!invoice) return;

        const updates: { paymentStatus?: string; paidAmount?: string } = {};

        if (paymentData.status && paymentData.status !== invoice.paymentStatus) {
            updates.paymentStatus = paymentData.status;
        }

        if (paymentData.paidAmount && paymentData.paidAmount !== invoice.paidAmount) {
            updates.paidAmount = paymentData.paidAmount;
        }

        if (Object.keys(updates).length > 0) {
            updatePaymentMutation.mutate(updates);
        } else {
            setShowPaymentDialog(false);
        }
    };

    const downloadPdfMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`/api/invoices/${params?.id}/pdf`, {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to download PDF");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;

            // Use the response's Content-Disposition header filename if available
            const contentDisposition = response.headers.get("Content-Disposition");
            let filename = `Invoice-${invoice?.invoiceNumber || "document"}.pdf`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            a.download = filename;
            console.log("Downloading PDF with filename:", filename, "Invoice number:", invoice?.invoiceNumber);

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
            setIsDownloading(false);
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to download invoice PDF.",
                variant: "destructive",
            });
            setIsDownloading(false);
        },
    });

    const emailInvoiceMutation = useMutation({
        mutationFn: async () => {
            if (!emailData.email) throw new Error("Email is required");
            return await apiRequest("POST", `/api/invoices/${params?.id}/email`, {
                recipientEmail: emailData.email,
                message: emailData.message || "",
            });
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Invoice sent via email successfully.",
            });
            setShowEmailDialog(false);
            setEmailData({ email: "", message: "" });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to send invoice via email.",
                variant: "destructive",
            });
        },
    });

    const paymentReminderMutation = useMutation({
        mutationFn: async () => {
            if (!reminderEmail) throw new Error("Email is required");
            return await apiRequest("POST", `/api/invoices/${params?.id}/payment-reminder`, {
                recipientEmail: reminderEmail,
                message: reminderMessage || "",
            });
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Payment reminder sent successfully.",
            });
            setShowReminderDialog(false);
            setReminderEmail("");
            setReminderMessage("");
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to send payment reminder.",
                variant: "destructive",
            });
        },
    });

    const updateSerialsMutation = useMutation({
        mutationFn: async ({ itemId, serials }: { itemId: string; serials: string[] }) => {
            return await apiRequest("PATCH", `/api/invoices/${params?.id}/items/${itemId}/serials`, {
                serialNumbers: serials,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/invoices", params?.id] });

            // If this is a child invoice, also invalidate the parent/master invoice
            if (invoice?.parentInvoiceId) {
                console.log("Invalidating parent invoice:", invoice.parentInvoiceId);
                queryClient.invalidateQueries({ queryKey: ["/api/invoices", invoice.parentInvoiceId] });
            }

            toast({
                title: "Success",
                description: "Serial numbers updated successfully.",
            });
            setShowSerialDialog(false);
            setSelectedItem(null);
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error?.message || "Failed to update serial numbers.",
                variant: "destructive",
            });
        },
    });

    const handleSerialAssignment = (item: any) => {
        setSelectedItem(item);
        setShowSerialDialog(true);
    };

    const handleSaveSerials = (serials: string[]) => {
        if (!selectedItem) return;

        updateSerialsMutation.mutate({ itemId: selectedItem.id, serials });
    };

    // Invoice management mutations
    const finalizeMutation = useMutation({
        mutationFn: async () => {
            return await apiRequest("PUT", `/api/invoices/${params?.id}/finalize`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/invoices", params?.id] });
            queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
            toast({
                title: "Success",
                description: "Invoice finalized successfully.",
            });
            setShowFinalizeDialog(false);
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error?.message || "Failed to finalize invoice.",
                variant: "destructive",
            });
        },
    });

    const lockMutation = useMutation({
        mutationFn: async (isLocked: boolean) => {
            return await apiRequest("PUT", `/api/invoices/${params?.id}/lock`, { isLocked });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/invoices", params?.id] });
            queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
            toast({
                title: "Success",
                description: invoice?.isLocked ? "Invoice unlocked successfully." : "Invoice locked successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error?.message || "Failed to lock/unlock invoice.",
                variant: "destructive",
            });
        },
    });

    const cancelMutation = useMutation({
        mutationFn: async (reason: string) => {
            return await apiRequest("PUT", `/api/invoices/${params?.id}/cancel`, { cancellationReason: reason });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/invoices", params?.id] });
            queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
            toast({
                title: "Success",
                description: "Invoice cancelled successfully.",
            });
            setShowCancelDialog(false);
            setCancellationReason("");
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error?.message || "Failed to cancel invoice.",
                variant: "destructive",
            });
        },
    });

    const getPaymentStatusColor = (status: string) => {
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

    const getStatusIcon = () => {
        if (!invoice) return null;
        if (invoice.paymentStatus === "paid")
            return <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />;
        if (invoice.paymentStatus === "overdue")
            return <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />;
        if (invoice.paymentStatus === "partial")
            return <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />;
        return <Clock className="h-4 w-4 sm:h-5 sm:w-5" />;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
                    <Skeleton className="h-10 w-48" />
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="min-h-screen bg-background">
                <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                            <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4 opacity-60" />
                            <h3 className="text-base sm:text-lg font-semibold mb-2">
                                Invoice not found
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLocation("/invoices")}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Invoices
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const outstanding = Number(invoice.total) - Number(invoice.paidAmount);
    const percentPaid =
        Number(invoice.total) > 0
            ? (Number(invoice.paidAmount) / Number(invoice.total)) * 100
            : 0;

    return (
        <div className="min-h-screen w-full ">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-[1600px] mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
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
                    <button
                        onClick={() => setLocation("/invoices")}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                    >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Invoices</span>
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                        <Receipt className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[150px]">{invoice.invoiceNumber}</span>
                    </span>
                </nav>


                {/* HEADER */}
                <Card className="border border-border/70 bg-card/95 backdrop-blur-sm shadow-sm">
                    <CardContent className="p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setLocation("/invoices")}
                                    data-testid="button-back"
                                    className="shrink-0 hover:bg-primary/10 hover:text-primary h-8 w-8 sm:h-9 sm:w-9"
                                >
                                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                                </Button>
                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                                            {invoice.invoiceNumber}
                                        </h1>
                                        {invoice.parentInvoiceId && (
                                            <Badge variant="secondary" className="text-[10px] sm:text-xs">
                                                Child Invoice
                                            </Badge>
                                        )}
                                        {invoice.isMaster && (
                                            <Badge variant="default" className="text-[10px] sm:text-xs">
                                                Master Invoice
                                            </Badge>
                                        )}
                                        <Badge
                                            className={`${getPaymentStatusColor(
                                                invoice.paymentStatus,
                                            )} flex items-center gap-1 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs`}
                                        >
                                            {getStatusIcon()}
                                            <span className="capitalize">{invoice.paymentStatus}</span>
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans']">
                                        {invoice.parentInvoiceId && (
                                            <div
                                                className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-950 px-2 py-1 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
                                                onClick={() => setLocation(`/invoices/${invoice.parentInvoiceId}`)}
                                            >
                                                <ArrowLeft className="h-3 w-3" />
                                                <span className="text-blue-700 dark:text-blue-300 font-medium">
                                                    View Parent Invoice
                                                </span>
                                            </div>
                                        )}
                                        <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                                            <FileText className="h-3 w-3" />
                                            <span className="truncate">
                        Quote&nbsp;
                                                <span className="font-medium text-foreground">
                          {invoice.quoteNumber}
                        </span>
                      </span>
                                        </div>
                                        <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>
                        {new Date(invoice.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                      </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex flex-wrap gap-2 w-full md:w-auto md:justify-end">
                                {/* Edit button visibility logic:
                                    - Master invoices: Show if not locked
                                    - Child invoices: Show if not paid
                                    - Regular invoices: Show if not paid and not locked
                                */}
                                {((invoice.isMaster && invoice.masterInvoiceStatus !== "locked" && !invoice.isLocked) ||
                                  (!invoice.isMaster && invoice.paymentStatus !== "paid" && !invoice.isLocked)) && (
                                    <PermissionGuard resource="invoices" action="edit" tooltipText="Only Finance/Accounts can edit invoices">
                                      <Button
                                        variant="default"
                                        size="sm"
                                        className="flex-1 sm:flex-initial justify-center gap-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700"
                                        onClick={() => setShowEditDialog(true)}
                                      >
                                        <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span className="hidden xs:inline">Edit Invoice</span>
                                        <span className="xs:hidden">Edit</span>
                                      </Button>
                                    </PermissionGuard>
                                )}

                                {canCreateChildInvoice && invoice.isMaster && invoice.masterInvoiceStatus !== "draft" && (
                                    <PermissionGuard resource="invoices" action="create" tooltipText="Only Finance/Accounts can create invoices">
                                      <Button
                                        variant="default"
                                        size="sm"
                                        className="flex-1 sm:flex-initial justify-center gap-2 text-xs sm:text-sm"
                                        onClick={() => setShowSplitWizard(true)}
                                        disabled={invoice.items.every(item => item.quantity <= (item.fulfilledQuantity || 0))}
                                      >
                                        <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline">
                                            {invoice.items.every(item => item.quantity <= (item.fulfilledQuantity || 0))
                                                ? "Fully Invoiced"
                                                : "Create Child Invoice"}
                                        </span>
                                        <span className="sm:hidden">Split</span>
                                      </Button>
                                    </PermissionGuard>
                                )}

                                {canGeneratePDF && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 sm:flex-initial justify-center gap-2 text-xs sm:text-sm hover:bg-success/10 hover:border-success hover:text-success"
                                    onClick={() => {
                                        setIsDownloading(true);
                                        downloadPdfMutation.mutate();
                                    }}
                                    disabled={isDownloading}
                                    data-testid="button-download-pdf"
                                  >
                                    {isDownloading ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                                            <span className="hidden sm:inline">Downloading...</span>
                                            <span className="sm:hidden">PDF...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            <span className="hidden sm:inline">Download PDF</span>
                                            <span className="sm:hidden">PDF</span>
                                        </>
                                    )}
                                  </Button>
                                )}

                                {canSendEmail && (
                                  <PermissionGuard resource="invoices" action="edit" tooltipText="Only Finance/Accounts can email invoices">
                                    <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 sm:flex-initial justify-center gap-2 text-xs sm:text-sm hover:bg-primary/10 hover:border-primary hover:text-primary"
                                    onClick={() => setShowEmailDialog(true)}
                                    data-testid="button-email-invoice"
                                  >
                                    <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">Email Invoice</span>
                                    <span className="sm:hidden">Email</span>
                                  </Button>
                                </PermissionGuard>
                                )}

                                {/* Payment Reminder Button - Show for pending, partial, or overdue invoices */}
                                {canSendReminder && (invoice.paymentStatus === "pending" ||
                                  invoice.paymentStatus === "partial" ||
                                  invoice.paymentStatus === "overdue") && (
                                    <PermissionGuard resource="payments" action="create" tooltipText="Only Finance/Accounts can send payment reminders">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 sm:flex-initial justify-center gap-2 text-xs sm:text-sm hover:bg-warning/10 hover:border-warning hover:text-warning"
                                        onClick={() => {
                                            setReminderEmail(invoice.client.email);
                                            setShowReminderDialog(true);
                                        }}
                                        data-testid="button-payment-reminder"
                                      >
                                        <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline">Payment Reminder</span>
                                        <span className="sm:hidden">Remind</span>
                                      </Button>
                                    </PermissionGuard>
                                )}

                                <PermissionGuard resource="payments" action="create" tooltipText="Only Finance/Accounts can record payments">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 sm:flex-initial justify-center gap-2 text-xs sm:text-sm hover:bg-primary/10 hover:border-primary hover:text-primary"
                                    onClick={() => {
                                        setPaymentData({
                                            status: invoice.paymentStatus,
                                            paidAmount: invoice.paidAmount ?? "",
                                        });
                                        setShowPaymentDialog(true);
                                    }}
                                    data-testid="button-open-payment-dialog"
                                  >
                                    <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">Update Payment</span>
                                    <span className="sm:hidden">Payment</span>
                                  </Button>
                                </PermissionGuard>

                                {/* Finalize Button - Show for draft/sent unpaid invoices */}
                                {canFinalizeInvoice && !invoice.finalizedAt && invoice.paymentStatus !== "paid" && invoice.status !== "cancelled" && (
                                    <PermissionGuard resource="invoices" action="finalize" tooltipText="Only authorized users can finalize invoices">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 sm:flex-initial justify-center gap-2 text-xs sm:text-sm hover:bg-green-50 hover:border-green-600 hover:text-green-600"
                                            onClick={() => setShowFinalizeDialog(true)}
                                            data-testid="button-finalize-invoice"
                                        >
                                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            <span className="hidden sm:inline">Finalize</span>
                                            <span className="sm:hidden">Finalize</span>
                                        </Button>
                                    </PermissionGuard>
                                )}

                                {/* Lock/Unlock Button - Show for finalized or paid invoices */}
                                {canLockInvoice && (invoice.finalizedAt || invoice.paymentStatus === "paid") && invoice.status !== "cancelled" && (
                                    <PermissionGuard resource="invoices" action="lock" tooltipText="Only Finance/Admin can lock invoices">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 sm:flex-initial justify-center gap-2 text-xs sm:text-sm hover:bg-amber-50 hover:border-amber-600 hover:text-amber-600"
                                            onClick={() => lockMutation.mutate(!invoice.isLocked)}
                                            data-testid="button-lock-invoice"
                                        >
                                            {invoice.isLocked ? (
                                                <>
                                                    <Unlock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    <span className="hidden sm:inline">Unlock</span>
                                                    <span className="sm:hidden">Unlock</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    <span className="hidden sm:inline">Lock</span>
                                                    <span className="sm:hidden">Lock</span>
                                                </>
                                            )}
                                        </Button>
                                    </PermissionGuard>
                                )}

                                {/* Cancel Button - Show for unpaid invoices that aren't cancelled */}
                                {canCancelInvoice && invoice.paymentStatus !== "paid" && invoice.status !== "cancelled" && (
                                    <PermissionGuard resource="invoices" action="cancel" tooltipText="Only authorized users can cancel invoices">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 sm:flex-initial justify-center gap-2 text-xs sm:text-sm hover:bg-orange-50 hover:border-orange-600 hover:text-orange-600"
                                            onClick={() => setShowCancelDialog(true)}
                                            data-testid="button-cancel-invoice"
                                        >
                                            <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            <span className="hidden sm:inline">Cancel Invoice</span>
                                            <span className="sm:hidden">Cancel</span>
                                        </Button>
                                    </PermissionGuard>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {invoice.isMaster && (
                    <MasterInvoiceManager invoiceId={invoice.id} />
                )}
                
                {/* MAIN GRID */}
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    {/* LEFT COLUMN */}
                    <div className="space-y-3 lg:col-span-2 min-w-0">
                        {/* CLIENT INFO */}
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-900">
                                        <Building2 className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <CardTitle className="text-sm font-bold">
                                        Client Information
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {/* Company */}
                                    <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                        <div className="flex items-start gap-2">
                                            <Building2 className="h-3 w-3 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold mb-0.5">
                                                    Company
                                                </p>
                                                <p className="text-xs font-semibold text-slate-900 dark:text-white break-words">
                                                    {invoice.client.name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                        <div className="flex items-start gap-2">
                                            <Mail className="h-3 w-3 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold mb-0.5">
                                                    Email
                                                </p>
                                                <p className="text-xs text-slate-900 dark:text-white break-all">
                                                    {invoice.client.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    {invoice.client.phone && (
                                        <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                            <div className="flex items-start gap-2">
                                                <Phone className="h-3 w-3 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold mb-0.5">
                                                        Phone
                                                    </p>
                                                    <p className="text-xs text-slate-900 dark:text-white">{invoice.client.phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* GSTIN */}
                                    {invoice.client.gstin && (
                                        <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                            <div className="flex items-start gap-2">
                                                <Receipt className="h-3 w-3 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold mb-0.5">
                                                        GSTIN
                                                    </p>
                                                    <p className="text-xs font-mono text-slate-900 dark:text-white">
                                                        {invoice.client.gstin}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Billing address full width */}
                                    {invoice.client.billingAddress && (
                                        <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 sm:col-span-2">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-3 w-3 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold mb-0.5">
                                                        Billing Address
                                                    </p>
                                                    <p className="text-xs text-slate-900 dark:text-white whitespace-pre-line break-words">
                                                        {invoice.client.billingAddress}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* CHILD INVOICES (if master) */}
                        {invoice.isMaster && invoice.childInvoices && invoice.childInvoices.length > 0 && (
                            <Card className="border-slate-200 dark:border-slate-800">
                                <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                                                <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                            </div>
                                            <CardTitle className="text-sm font-bold">Child Invoices</CardTitle>
                                        </div>
                                        <Badge className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-[10px] px-2 py-0.5">
                                            {invoice.childInvoices.length}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="space-y-2">
                                        {invoice.childInvoices.map((child) => (
                                            <div
                                                key={child.id}
                                                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
                                                onClick={() => setLocation(`/invoices/${child.id}`)}
                                            >
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <Receipt className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">{child.invoiceNumber}</p>
                                                        <p className="text-[10px] text-slate-600 dark:text-slate-400">
                                                            {new Date(child.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                            ₹{Number(child.total).toLocaleString()}
                                                        </p>
                                                        <Badge className={`${getPaymentStatusColor(child.paymentStatus)} text-[10px] px-1.5 py-0`}>
                                                            {child.paymentStatus}
                                                        </Badge>
                                                    </div>
                                                    <ArrowLeft className="h-3 w-3 rotate-180 text-slate-400" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* INVOICING PROGRESS (if master) */}
                        {invoice.isMaster && (
                            <Card className="border-slate-200 dark:border-slate-800">
                                <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                                            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <CardTitle className="text-sm font-bold">Invoicing Progress</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="space-y-2.5">
                                        {invoice.items.map(item => {
                                            const remainingQty = item.quantity - (item.fulfilledQuantity || 0);
                                            const progress = item.quantity > 0 ? ((item.fulfilledQuantity || 0) / item.quantity) * 100 : 0;
                                            const isComplete = remainingQty === 0;

                                            return (
                                                <div key={item.id} className="space-y-2 p-3 rounded-lg border bg-muted/30">
                                                    <div className="flex justify-between items-start gap-3">
                                                        <span className="font-medium text-sm">{item.description}</span>
                                                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                                                            {item.fulfilledQuantity || 0} / {item.quantity} invoiced
                                                        </span>
                                                    </div>
                                                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                                                                isComplete 
                                                                    ? 'bg-success' 
                                                                    : progress > 0 
                                                                        ? 'bg-warning' 
                                                                        : 'bg-muted-foreground/20'
                                                            }`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className={isComplete ? "text-success font-medium" : remainingQty > 0 ? "text-warning font-medium" : "text-muted-foreground"}>
                                                            {isComplete ? "✓ Fully invoiced" : `${remainingQty} remaining`}
                                                        </span>
                                                        <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Summary */}
                                    <div className="mt-4 pt-4 border-t">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Overall Progress:</span>
                                            <span className="font-semibold">
                                                {invoice.items.length > 0
                                                    ? `${Math.round(
                                                          (invoice.items.reduce((sum, item) => sum + (item.fulfilledQuantity || 0), 0) /
                                                           invoice.items.reduce((sum, item) => sum + item.quantity, 0)) * 100
                                                      )}%`
                                                    : "0%"}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* LINE ITEMS */}
                        {/* LINE ITEMS */}
                        <Card className="border bg-card shadow-sm overflow-hidden">
                            <CardHeader className="border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 rounded-md bg-primary/10 text-primary">
                                        <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm sm:text-lg">Line Items</CardTitle>
                                        <p className="hidden sm:block text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans']">
                                            Products and services breakdown
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                {/* MOBILE STACKED VIEW */}
                                <div className="sm:hidden px-3 py-3 space-y-3">
                                    {invoice.items.map((item, index) => {
                                        const serialNumbers = item.serialNumbers ? JSON.parse(item.serialNumbers) : [];
                                        return (
                                        <div
                                            key={item.id}
                                            className="rounded-xl border bg-muted/40 px-3 py-3 space-y-1.5"
                                        >
                                            <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground font-['Open_Sans']">
              #{index + 1}
            </span>
                                                <span className="text-[11px] text-muted-foreground font-['Open_Sans']">
              Qty:{" "}
                                                    <span className="font-semibold text-foreground">
                {item.quantity}
              </span>
            </span>
                                            </div>

                                            <p className="text-xs font-semibold sm:text-sm text-foreground break-words">
                                                {item.description}
                                            </p>

                                            {/* HSN/SAC Badge */}
                                            {item.hsnSac && (
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                        HSN/SAC: {item.hsnSac}
                                                    </Badge>
                                                </div>
                                            )}

                                            {/* Serial Numbers Badge */}
                                            <div className="flex items-center gap-2 pt-1">
                                                {serialNumbers.length > 0 ? (
                                                    <Badge variant="default" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                                        {serialNumbers.length} Serial{serialNumbers.length !== 1 ? 's' : ''} Assigned
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-[10px]">
                                                        No Serials
                                                    </Badge>
                                                )}
                                                <PermissionGuard resource="invoices" action="edit" tooltipText="Only authorized users can manage serial numbers">
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleSerialAssignment(item)}
                                                    className="h-6 text-[10px] px-2"
                                                  >
                                                    {serialNumbers.length > 0 ? "Edit" : "Assign"}
                                                  </Button>
                                                </PermissionGuard>
                                            </div>

                                            <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-border/60 mt-1.5">
                                                <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-['Open_Sans']">
                Unit Price
              </span>
                                                    <span className="text-xs font-semibold font-['Open_Sans']">
                {formatCurrency(item.unitPrice, invoice.currency)}
              </span>
                                                </div>
                                                <div className="text-right">
              <span className="text-[10px] text-muted-foreground font-['Open_Sans']">
                Total
              </span>
                                                    <p className="text-sm font-bold text-primary">
                                                        {formatCurrency(item.subtotal, invoice.currency)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )})}
                                </div>

                                {/* DESKTOP / TABLE VIEW */}
                                <div className="hidden sm:block w-full overflow-x-auto">
                                    <table className="w-full min-w-[700px] text-xs sm:text-sm">
                                        <thead className="bg-muted/80 border-b">
                                        <tr>
                                            <th className="text-left font-semibold text-muted-foreground uppercase tracking-wide px-4 md:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs">
                                                #
                                            </th>
                                            <th className="text-left font-semibold text-muted-foreground uppercase tracking-wide px-4 md:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs">
                                                Description
                                            </th>
                                            <th className="text-right font-semibold text-muted-foreground uppercase tracking-wide px-4 md:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs">
                                                Qty
                                            </th>
                                            <th className="text-center font-semibold text-muted-foreground uppercase tracking-wide px-4 md:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs">
                                                HSN/SAC
                                            </th>
                                            <th className="text-center font-semibold text-muted-foreground uppercase tracking-wide px-4 md:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs">
                                                Serial Numbers
                                            </th>
                                            <th className="text-right font-semibold text-muted-foreground uppercase tracking-wide px-4 md:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs">
                                                Unit Price
                                            </th>
                                            <th className="text-right font-semibold text-muted-foreground uppercase tracking-wide px-4 md:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs">
                                                Total
                                            </th>
                                            <th className="text-center font-semibold text-muted-foreground uppercase tracking-wide px-4 md:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs">
                                                Actions
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/70">
                                        {invoice.items.map((item, index) => {
                                            const serialNumbers = item.serialNumbers ? JSON.parse(item.serialNumbers) : [];
                                            return (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                                            >
                                                <td className="px-4 md:px-6 py-2.5 sm:py-3 text-[11px] sm:text-sm text-muted-foreground">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 md:px-6 py-2.5 sm:py-3 align-top">
                                                    <p className="font-medium text-xs sm:text-sm text-foreground break-words">
                                                        {item.description}
                                                    </p>
                                                </td>
                                                <td className="px-4 md:px-6 py-2.5 sm:py-3 text-right text-[11px] sm:text-sm font-['Open_Sans']">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-4 md:px-6 py-2.5 sm:py-3 text-center text-[11px] sm:text-sm font-['Open_Sans']">
                                                    {item.hsnSac ? (
                                                        <span className="font-mono bg-muted/50 px-2 py-1 rounded text-primary">
                                                            {item.hsnSac}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 md:px-6 py-2.5 sm:py-3 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        {serialNumbers.length > 0 ? (
                                                            <>
                                                                <Badge variant="default" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                                                    {serialNumbers.length} Assigned
                                                                </Badge>
                                                                {serialNumbers.length > 0 && serialNumbers.length <= 3 && (
                                                                    <div className="text-[9px] text-muted-foreground font-mono">
                                                                        {serialNumbers.join(", ")}
                                                                    </div>
                                                                )}
                                                                {serialNumbers.length > 3 && (
                                                                    <div className="text-[9px] text-muted-foreground">
                                                                        Click "Edit" to view all
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[10px]">
                                                                Not Assigned
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-2.5 sm:py-3 text-right text-[11px] sm:text-sm font-['Open_Sans']">
                                                    {formatCurrency(item.unitPrice, invoice.currency)}
                                                </td>
                                                <td className="px-4 md:px-6 py-2.5 sm:py-3 text-right text-[11px] sm:text-sm font-semibold text-primary">
                                                    {formatCurrency(item.subtotal, invoice.currency)}
                                                </td>
                                                <td className="px-4 md:px-6 py-2.5 sm:py-3 text-center">
                                                    <PermissionGuard resource="invoices" action="edit" tooltipText="Only authorized users can manage serial numbers">
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleSerialAssignment(item)}
                                                        className="h-7 text-[10px]"
                                                      >
                                                        {serialNumbers.length > 0 ? "Edit" : "Assign"}
                                                      </Button>
                                                    </PermissionGuard>
                                                </td>
                                            </tr>
                                        )})}
                                        </tbody>
                                    </table>
                                </div>

                                {/* FOOTER ROW (shared) */}
                                <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans'] bg-muted/40">
                                    <span>{invoice.items.length} line items</span>
                                    <span className="inline-flex items-center gap-1">
        <DollarSign className="h-3 w-3" />
        Subtotal:{" "}
                                        <span className="font-semibold text-foreground">
          {formatCurrency(invoice.subtotal, invoice.currency)}
        </span>
      </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN / SUMMARY */}
                    <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-6 min-w-0">
                        <Card className="border bg-card shadow-sm">
                            <CardHeader className="border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 rounded-md bg-primary/10 text-primary">
                                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <CardTitle className="text-sm sm:text-lg">
                                            Invoice Summary
                                        </CardTitle>
                                        <p className="text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans'] truncate">
                                            Financial overview
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4">
                                {invoice.createdByName && (
                                    <div className="rounded-lg border bg-muted/50 px-3 sm:px-4 py-2.5 sm:py-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Receipt className="h-3.5 w-3.5 text-secondary" />
                                            <span className="text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans']">
                                                Prepared by
                                            </span>
                                        </div>
                                        <p className="font-semibold text-xs sm:text-sm md:text-base break-words">
                                            {invoice.createdByName}
                                        </p>
                                    </div>
                                )}

                                <div className="rounded-lg border bg-primary/5 px-3 sm:px-4 py-2.5 sm:py-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Calendar className="h-3.5 w-3.5 text-primary" />
                                        <span className="text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans']">
                                          Due Date
                                        </span>
                                    </div>
                                    <p className="font-bold text-sm sm:text-lg break-words">
                                        {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>

                                <Separator />

                                <div className="space-y-1.5 sm:space-y-2.5 font-['Open_Sans'] text-[11px] sm:text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-semibold">
                      {formatCurrency(invoice.subtotal, invoice.currency)}
                    </span>
                                    </div>
                                    {Number(invoice.discount) > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Discount</span>
                                            <span className="font-semibold text-success">
                        -{formatCurrency(invoice.discount, invoice.currency)}
                      </span>
                                        </div>
                                    )}
                                    {Number(invoice.cgst) > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">CGST</span>
                                            <span className="font-semibold">
                        {formatCurrency(invoice.cgst, invoice.currency)}
                      </span>
                                        </div>
                                    )}
                                    {Number(invoice.sgst) > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">SGST</span>
                                            <span className="font-semibold">
                        {formatCurrency(invoice.sgst, invoice.currency)}
                      </span>
                                        </div>
                                    )}
                                    {Number(invoice.igst) > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">IGST</span>
                                            <span className="font-semibold">
                        {formatCurrency(invoice.igst, invoice.currency)}
                      </span>
                                        </div>
                                    )}
                                    {Number(invoice.shippingCharges) > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Shipping</span>
                                            <span className="font-semibold">
                        {formatCurrency(invoice.shippingCharges, invoice.currency)}
                      </span>
                                        </div>
                                    )}
                                </div>

                                <Separator className="bg-primary/10" />

                                <div className="rounded-xl border-2 border-primary/30 bg-primary/5 px-3 sm:px-4 py-3 sm:py-4 space-y-2">
                                    <div className="flex justify-between items-center">
                    <span className="text-[11px] sm:text-sm font-semibold text-muted-foreground">
                      Total Amount
                    </span>
                                        <span className="text-lg sm:text-2xl font-bold text-primary">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-sm font-['Open_Sans']">
                                        <div className="rounded-lg bg-background/80 px-2.5 py-2">
                                            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">
                                                Paid
                                            </p>
                                            <p className="font-bold text-success break-words">
                                                {formatCurrency(Number(invoice.paidAmount))}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-background/80 px-2.5 py-2">
                                            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">
                                                Outstanding
                                            </p>
                                            <p className="font-bold text-warning break-words">
                                                {formatCurrency(outstanding)}
                                            </p>
                                        </div>
                                    </div>

                                    {percentPaid > 0 && (
                                        <div className="space-y-1.5 pt-1.5">
                                            <div className="flex justify-between items-center text-[10px] sm:text-xs">
                        <span className="font-medium text-muted-foreground inline-flex items-center gap-1.5">
                          <TrendingUp className="h-3 w-3" />
                          Payment progress
                        </span>
                                                <span className="font-bold text-primary">
                          {percentPaid.toFixed(1)}%
                        </span>
                                            </div>
                                            <div className="relative w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        percentPaid >= 100
                                                            ? "bg-gradient-to-r from-success to-success/80"
                                                            : "bg-gradient-to-r from-primary to-secondary"
                                                    }`}
                                                    style={{ width: `${Math.min(percentPaid, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* BOM SECTION */}
                <Card className="border-slate-200 dark:border-slate-800 mt-4 sm:mt-6">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-4 flex flex-row items-center justify-between">
                         <CardTitle className="text-base">Bill of Materials</CardTitle>
                         {isBomDirty && (
                             <Button size="sm" onClick={handleSaveBom} disabled={updateBomMutation.isPending}>
                                 {updateBomMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                 Save BOM
                             </Button>
                         )}
                    </CardHeader>
                    <CardContent className="p-4">
                        <ExecBOMSection 
                            value={bomData} 
                            onChange={handleBomChange} 
                            readonly={invoice.isLocked || (invoice.paymentStatus === 'paid' && !invoice.isMaster)}
                        />
                    </CardContent>
                </Card>

                {/* PAYMENT TRACKER (bottom section) */}
                <div className="mt-4 sm:mt-6">
                    <PaymentTracker
                        invoiceId={invoice.id}
                        total={Number(invoice.total)}
                        paidAmount={Number(invoice.paidAmount)}
                        paymentStatus={invoice.paymentStatus}
                        parentInvoiceId={invoice.parentInvoiceId}
                        isMaster={invoice.isMaster}
                        onUpdate={() => {
                            queryClient.invalidateQueries({
                                queryKey: ["/api/invoices", params?.id],
                            });
                            // If this is a child invoice, also invalidate parent
                            if (invoice.parentInvoiceId) {
                                queryClient.invalidateQueries({
                                    queryKey: ["/api/invoices", invoice.parentInvoiceId],
                                });
                            }
                        }}
                    />
                </div>

                {/* DELIVERY NOTES SECTION */}
                {invoice.deliveryNotes && (
                    <Card className="border border-border/70 bg-card/95 backdrop-blur-sm shadow-sm">
                        <CardHeader className="border-b border-slate-200 dark:border-slate-800 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-950">
                                    <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-semibold">Delivery Notes</CardTitle>
                                    <p className="text-xs text-muted-foreground">Delivery and shortage information</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 py-4">
                            <div className="space-y-2 text-sm whitespace-pre-wrap">
                                {invoice.deliveryNotes.split('\n').map((line, idx) => (
                                    <p 
                                        key={idx} 
                                        className={line.includes('[SHORTAGE]') 
                                            ? 'text-warning font-medium bg-warning/10 px-2 py-1 rounded border-l-2 border-warning' 
                                            : 'text-muted-foreground'
                                        }
                                    >
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* COMMENTS SECTION */}
                <CommentsSection 
                    entityId={invoice.id} 
                    entityType="invoice" 
                    title="Comments & Discussions"
                    className="mt-4 sm:mt-6"
                />

            {/* EMAIL DIALOG */}
            <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                <DialogContent className="w-full max-w-[500px] mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="border-b pb-3 sm:pb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 bg-secondary/10 rounded-md text-secondary">
                                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div className="min-w-0">
                                <DialogTitle className="text-sm sm:text-lg truncate">
                                    Email Invoice
                                </DialogTitle>
                                <p className="hidden sm:block text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans'] mt-0.5">
                                    Send this invoice to your client as a PDF attachment
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-3 sm:space-y-4 py-2">
                        <div className="space-y-1.5 sm:space-y-2">
                            <Label
                                htmlFor="recipient-email"
                                className="text-[11px] sm:text-sm font-semibold flex items-center gap-1"
                            >
                                Recipient Email <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                                <Input
                                    id="recipient-email"
                                    type="email"
                                    placeholder="client@example.com"
                                    className="pl-9 sm:pl-10 text-xs sm:text-sm"
                                    value={emailData.email}
                                    onChange={(e) =>
                                        setEmailData({ ...emailData, email: e.target.value })
                                    }
                                    data-testid="input-email-recipient"
                                />
                            </div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground font-['Open_Sans']">
                                A PDF copy of this invoice will be attached.
                            </p>
                        </div>

                        <div className="space-y-1.5 sm:space-y-2">
                            <Label htmlFor="email-message" className="text-[11px] sm:text-sm font-semibold">
                                Message (optional)
                            </Label>
                            <Textarea
                                id="email-message"
                                placeholder="Add a short message to your client..."
                                className="min-h-[90px] sm:min-h-[110px] resize-none text-xs sm:text-sm"
                                value={emailData.message}
                                onChange={(e) =>
                                    setEmailData({ ...emailData, message: e.target.value })
                                }
                                data-testid="textarea-email-message"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 flex-col sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => setShowEmailDialog(false)}
                            data-testid="button-email-cancel"
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => emailInvoiceMutation.mutate()}
                            disabled={!emailData.email || emailInvoiceMutation.isPending}
                            data-testid="button-email-send"
                            className="w-full sm:w-auto bg-secondary hover:bg-primary text-secondary-foreground hover:text-primary-foreground"
                        >
                            {emailInvoiceMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Email
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* PAYMENT DIALOG */}
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogContent className="w-full max-w-[500px] mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="border-b pb-3 sm:pb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 bg-primary rounded-md text-primary-foreground">
                                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div className="min-w-0">
                                <DialogTitle className="text-sm sm:text-lg truncate">
                                    Update Payment Details
                                </DialogTitle>
                                <p className="hidden sm:block text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans'] mt-0.5">
                                    Adjust payment status and amount for this invoice
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-3 sm:space-y-4 py-2">
                        <div className="space-y-1.5 sm:space-y-2">
                            <Label
                                htmlFor="payment-status"
                                className="text-[11px] sm:text-sm font-semibold"
                            >
                                Payment Status
                            </Label>
                            <Select
                                value={paymentData.status}
                                onValueChange={(value) =>
                                    setPaymentData({ ...paymentData, status: value })
                                }
                            >
                                <SelectTrigger
                                    id="payment-status"
                                    data-testid="select-payment-status"
                                    className="h-9 sm:h-10 text-xs sm:text-sm"
                                >
                                    <SelectValue placeholder="Select payment status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3.5 w-3.5 text-primary" />
                                            <span className="text-sm">Pending</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="partial">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-3.5 w-3.5 text-warning" />
                                            <span className="text-sm">Partial</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="paid">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                            <span className="text-sm">Paid</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="overdue">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                                            <span className="text-sm">Overdue</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5 sm:space-y-2">
                            <Label
                                htmlFor="paid-amount"
                                className="text-[11px] sm:text-sm font-semibold"
                            >
                                Paid Amount
                            </Label>
                            <div className="flex items-center gap-2 bg-primary/5 border border-primary/30 px-2.5 sm:px-3 py-2.5 sm:py-3 rounded-lg">
                <span className="text-lg sm:text-2xl font-bold text-primary">
                  ₹
                </span>
                                <Input
                                    id="paid-amount"
                                    type="number"
                                    placeholder="0.00"
                                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base sm:text-xl font-bold"
                                    value={paymentData.paidAmount}
                                    onChange={(e) =>
                                        setPaymentData({ ...paymentData, paidAmount: e.target.value })
                                    }
                                    min="0"
                                    max={invoice.total}
                                    step="0.01"
                                    data-testid="input-paid-amount"
                                />
                            </div>
                            <div className="flex items-center justify-between text-[10px] sm:text-xs font-['Open_Sans'] px-1">
                <span className="text-muted-foreground">
                  Total invoice amount:
                </span>
                                <span className="font-bold text-primary">
                  {formatCurrency(Number(invoice.total))}
                </span>
                            </div>
                            {paymentData.paidAmount && (
                                <div className="flex items-center justify-between text-[10px] sm:text-xs font-['Open_Sans'] px-1">
                  <span className="text-muted-foreground">
                    Outstanding balance:
                  </span>
                                    <span className="font-bold text-warning">
                    ₹
                                        {(
                                            Number(invoice.total || 0) - Number(paymentData.paidAmount)
                                        ).toLocaleString()}
                  </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 flex-col sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => setShowPaymentDialog(false)}
                            data-testid="button-payment-cancel"
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdatePayment}
                            disabled={updatePaymentMutation.isPending}
                            data-testid="button-payment-update"
                            className="w-full sm:w-auto bg-primary hover:bg-secondary"
                        >
                            {updatePaymentMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Update Payment
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* PAYMENT REMINDER DIALOG */}
            <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
                <DialogContent className="w-full max-w-[500px] mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="border-b pb-3 sm:pb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 bg-warning/10 rounded-md text-warning">
                                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div className="flex-1 text-left">
                                <DialogTitle className="text-base sm:text-lg font-bold">
                                    Send Payment Reminder
                                </DialogTitle>
                                <p className="hidden sm:block text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans'] mt-0.5">
                                    Remind the client about pending payment
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-3 sm:space-y-4 py-2">
                        {/* Invoice Info Summary */}
                        <div className="p-3 rounded-lg bg-warning/5 border border-warning/20 space-y-2">
                            <div className="flex justify-between items-center text-xs sm:text-sm">
                                <span className="text-muted-foreground">Invoice Number:</span>
                                <span className="font-bold">{invoice.invoiceNumber}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs sm:text-sm">
                                <span className="text-muted-foreground">Outstanding:</span>
                                <span className="font-bold text-warning">
                                    ₹{(Number(invoice.total) - Number(invoice.paidAmount)).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs sm:text-sm">
                                <span className="text-muted-foreground">Due Date:</span>
                                <span className="font-semibold">
                                    {new Date(invoice.dueDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <Label
                                htmlFor="reminder-email"
                                className="text-[11px] sm:text-sm font-semibold"
                            >
                                Recipient Email
                            </Label>
                            <Input
                                id="reminder-email"
                                type="email"
                                placeholder="client@example.com"
                                className="h-9 sm:h-10 text-xs sm:text-sm"
                                value={reminderEmail}
                                onChange={(e) => setReminderEmail(e.target.value)}
                                data-testid="input-reminder-email"
                            />
                        </div>

                        {/* Custom Message */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <Label
                                htmlFor="reminder-message"
                                className="text-[11px] sm:text-sm font-semibold"
                            >
                                Additional Message (Optional)
                            </Label>
                            <Textarea
                                id="reminder-message"
                                placeholder="Add a custom note to the payment reminder email..."
                                className="resize-none min-h-[80px] text-xs sm:text-sm"
                                value={reminderMessage}
                                onChange={(e) => setReminderMessage(e.target.value)}
                                data-testid="textarea-reminder-message"
                            />
                            <p className="text-[10px] text-muted-foreground">
                                This will be appended to the standard payment reminder template
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 flex-col sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => setShowReminderDialog(false)}
                            data-testid="button-reminder-cancel"
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => paymentReminderMutation.mutate()}
                            disabled={!reminderEmail || paymentReminderMutation.isPending}
                            data-testid="button-send-reminder"
                            className="w-full sm:w-auto bg-warning hover:bg-warning/90 text-white"
                        >
                            {paymentReminderMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Bell className="h-4 w-4 mr-2" />
                                    Send Reminder
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* SERIAL NUMBER ASSIGNMENT DIALOG */}
            {selectedItem && (
                <SerialNumberEntry
                    open={showSerialDialog}
                    onOpenChange={setShowSerialDialog}
                    itemDescription={selectedItem.description}
                    expectedQuantity={selectedItem.quantity}
                    existingSerials={selectedItem.serialNumbers ? JSON.parse(selectedItem.serialNumbers) : []}
                    onSave={handleSaveSerials}
                    isLoading={updateSerialsMutation.isPending}
                />
            )}

            {/* INVOICE SPLIT WIZARD */}
            {invoice.isMaster && (
                <InvoiceSplitWizard
                    open={showSplitWizard}
                    onOpenChange={setShowSplitWizard}
                    quoteId={invoice.quoteId}
                    masterInvoiceId={invoice.id}
                    items={invoice.items}
                    masterInvoice={{
                        discount: invoice.discount,
                        cgst: invoice.cgst,
                        sgst: invoice.sgst,
                        igst: invoice.igst,
                        shippingCharges: invoice.shippingCharges,
                    }}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ["/api/invoices", params?.id] });
                        queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
                        setShowSplitWizard(false);
                    }}
                />
            )}

            {/* EDIT INVOICE DIALOG - Works for both Master and Child invoices */}
            <EditInvoiceDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                invoiceId={invoice.id}
                currentData={{
                    items: invoice.items.map(item => ({
                        id: item.id,
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        subtotal: item.subtotal,
                        sortOrder: 0,
                        hsnSac: item.hsnSac,
                    })),
                    subtotal: invoice.subtotal,
                    discount: invoice.discount,
                    cgst: invoice.cgst,
                    sgst: invoice.sgst,
                    igst: invoice.igst,
                    shippingCharges: invoice.shippingCharges,
                    total: invoice.total,
                    notes: invoice.notes || "",
                    termsAndConditions: invoice.termsAndConditions || "",
                    deliveryNotes: invoice.deliveryNotes || "",
                    milestoneDescription: invoice.milestoneDescription || "",
                }}
                isDraft={
                    invoice.isMaster
                        ? (!invoice.masterInvoiceStatus || invoice.masterInvoiceStatus === "draft")
                        : (invoice.paymentStatus !== "paid") // Child invoices editable until paid
                }
            />

            {/* Finalize Confirmation Dialog */}
            <Dialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            Finalize Invoice
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to finalize invoice <strong>{invoice.invoiceNumber}</strong>?
                        </p>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-800">
                                ℹ️ Finalizing marks the invoice as ready to send. This action helps track invoice workflow.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowFinalizeDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => finalizeMutation.mutate()}
                        >
                            Finalize Invoice
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Invoice Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-orange-600">
                            <XCircle className="h-5 w-5" />
                            Cancel Invoice
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Please provide a reason for cancelling invoice <strong>{invoice.invoiceNumber}</strong>:
                        </p>
                        <div>
                            <Label htmlFor="cancellation-reason">Cancellation Reason *</Label>
                            <Textarea
                                id="cancellation-reason"
                                placeholder="Enter reason for cancellation..."
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                        {invoice.isMaster && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                                <p className="text-sm text-amber-800">
                                    ⚠️ All unpaid child invoices will also be cancelled.
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowCancelDialog(false);
                                setCancellationReason("");
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (cancellationReason.trim()) {
                                    cancelMutation.mutate(cancellationReason);
                                }
                            }}
                            disabled={!cancellationReason.trim()}
                        >
                            Cancel Invoice
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    </div>
    );
}