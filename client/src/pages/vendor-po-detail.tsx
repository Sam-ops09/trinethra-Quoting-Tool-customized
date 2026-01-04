import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Send,
    Package,
    Loader2,
    Edit,
    CheckCircle,
    XCircle,
    Home,
    ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CreateGRNDialog } from "@/components/vendor-po/create-grn-dialog";
import { PermissionGuard } from "@/components/permission-guard";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
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

interface VendorPoDetail {
    id: string;
    poNumber: string;
    status: string;
    vendor: {
        name: string;
        email: string;
        phone?: string;
        address?: string;
        contactPerson?: string;
    };
    quote: {
        id: string;
        quoteNumber: string;
    };
    items: Array<{
        id: string;
        description: string;
        quantity: number;
        receivedQuantity: number;
        unitPrice: string;
        subtotal: string;
        serialNumbers?: string; // JSON array encoded as string
    }>;
    subtotal: string;
    discount: string;
    cgst: string;
    sgst: string;
    igst: string;
    shippingCharges: string;
    total: string;
    orderDate: string;
    expectedDeliveryDate?: string;
    actualDeliveryDate?: string;
    notes?: string;
    termsAndConditions?: string;
}

type SerialItem = VendorPoDetail["items"][number];

const STATUS_STEPS: Array<{
    id: VendorPoDetail["status"] | "cancelled";
    label: string;
}> = [
    { id: "draft", label: "Draft" },
    { id: "sent", label: "Sent" },
    { id: "acknowledged", label: "Acknowledged" },
    { id: "fulfilled", label: "Fulfilled" },
];

function getStatusColor(status: string) {
    switch (status) {
        case "fulfilled":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
        case "acknowledged":
            return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary";
        case "sent":
            return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
        case "draft":
            return "bg-muted text-muted-foreground";
        case "cancelled":
            return "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive";
        default:
            return "bg-muted text-muted-foreground";
    }
}

export default function VendorPoDetailPage() {
    const [, params] = useRoute("/vendor-pos/:id");
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    // Feature flags
    const canCreateGRN = useFeatureFlag('grn_create');
    const canEmailVendorPO = useFeatureFlag('vendorPO_emailSending');
    const canGeneratePDF = useFeatureFlag('vendorPO_pdfGeneration');

    const [showSerialDialog, setShowSerialDialog] = useState(false);
    const [showGRNDialog, setShowGRNDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<SerialItem | null>(null);
    const [serialNumbers, setSerialNumbers] = useState("");

    const { data: po, isLoading } = useQuery<VendorPoDetail>({
        queryKey: ["/api/vendor-pos", params?.id],
        enabled: !!params?.id,
    });

    const updateStatusMutation = useMutation({
        mutationFn: async (status: string) => {
            return await apiRequest("PATCH", `/api/vendor-pos/${params?.id}`, {
                status,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/vendor-pos", params?.id] });
            queryClient.invalidateQueries({ queryKey: ["/api/vendor-pos"] });
            toast({
                title: "Status updated",
                description: "Purchase order status has been updated successfully.",
            });
        },
    });

    const cancelPoMutation = useMutation({
        mutationFn: async () => {
            return await apiRequest("PATCH", `/api/vendor-pos/${params?.id}`, {
                status: "cancelled",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/vendor-pos", params?.id] });
            queryClient.invalidateQueries({ queryKey: ["/api/vendor-pos"] });
            setShowCancelDialog(false);
            toast({
                title: "PO Cancelled",
                description: "The purchase order has been cancelled successfully.",
                variant: "destructive",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to cancel purchase order.",
                variant: "destructive",
            });
        },
    });

    const updateSerialsMutation = useMutation({
        mutationFn: async ({
                               itemId,
                               serials,
                           }: {
            itemId: string;
            serials: string[];
        }) => {
            return await apiRequest(
                "PATCH",
                `/api/vendor-pos/${params?.id}/items/${itemId}/serials`,
                {
                    serialNumbers: serials,
                }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/vendor-pos", params?.id] });
            setShowSerialDialog(false);
            setSelectedItem(null);
            setSerialNumbers("");
            toast({
                title: "Serial numbers updated",
                description: "Item serial numbers have been updated successfully.",
            });
        },
    });

    const handleAddSerials = (item: SerialItem) => {
        setSelectedItem(item);
        const existingSerials = item.serialNumbers ? JSON.parse(item.serialNumbers) : [];
        setSerialNumbers(existingSerials.join("\n"));
        setShowSerialDialog(true);
    };

    const handleSaveSerials = () => {
        if (!selectedItem) return;
        const serials = serialNumbers
            .split("\n")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        updateSerialsMutation.mutate({ itemId: selectedItem.id, serials });
    };

    const selectedStatusIndex = useMemo(() => {
        const idx = STATUS_STEPS.findIndex((s) => s.id === po?.status);
        return idx === -1 ? 0 : idx;
    }, [po?.status]);

    // LOADING STATE
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
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Skeleton className="h-40 rounded-lg" />
                                <Skeleton className="h-40 rounded-lg" />
                            </div>
                            <Skeleton className="h-64 rounded-lg" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="h-48 rounded-lg" />
                            <Skeleton className="h-32 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // NOT FOUND STATE
    if (!po) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-xl mx-auto p-4 sm:p-6">
                    <Card className="text-center">
                        <CardHeader>
                            <CardTitle className="text-base sm:text-lg">
                                Purchase order not found
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                The requested vendor purchase order could not be located.
                            </p>
                            <Button
                                className="mt-4"
                                onClick={() => setLocation("/vendor-pos")}
                                variant="outline"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Vendor POs
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const canSend = po.status === "draft";
    const canAcknowledge = po.status === "sent";
    const canMarkFulfilled = po.status === "acknowledged" || po.status === "sent";
    const canCreateGRNFromStatus = po.status === "acknowledged" || po.status === "sent";
    const canCreateGRNButton = canCreateGRN && canCreateGRNFromStatus; // Feature flag AND status check
    const canCancel = po.status !== "cancelled" && po.status !== "fulfilled";

    const formattedOrderDate = new Date(po.orderDate).toLocaleDateString();
    const formattedExpectedDate = po.expectedDeliveryDate
        ? new Date(po.expectedDeliveryDate).toLocaleDateString()
        : null;
    const formattedActualDate = po.actualDeliveryDate
        ? new Date(po.actualDeliveryDate).toLocaleDateString()
        : null;

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
                            onClick={() => setLocation("/vendor-pos")}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                        >
                            <Package className="h-3.5 w-3.5" />
                            <span>Purchase Orders</span>
                        </button>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                            <Package className="h-3.5 w-3.5" />
                            {po.poNumber}
                        </span>
                    </nav>

                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setLocation("/vendor-pos")}
                                className="h-8 w-8 shrink-0"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                                        {po.poNumber}
                                    </h1>
                                    <Badge variant="outline" className={`${getStatusColor(po.status)} text-xs px-2 py-0.5 h-6`}>
                                        {po.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 shrink-0 flex-wrap">
                            {canSend && (
                                <PermissionGuard resource="vendor-pos" action="edit" tooltipText="Only Purchase/Operations can manage POs">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateStatusMutation.mutate("sent")}
                                    className="h-8 px-3 text-xs"
                                  >
                                    <Send className="h-3.5 w-3.5 mr-1" />
                                    <span>Send</span>
                                  </Button>
                                </PermissionGuard>
                            )}
                            {canAcknowledge && (
                                <PermissionGuard resource="vendor-pos" action="edit" tooltipText="Only Purchase/Operations can acknowledge POs">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateStatusMutation.mutate("acknowledged")}
                                    className="h-8 px-3 text-xs"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                    <span>Acknowledge</span>
                                  </Button>
                                </PermissionGuard>
                            )}
                            {canCreateGRNButton && (
                                <PermissionGuard resource="grn" action="create" tooltipText="Only Purchase/Operations can create GRNs">
                                  <Button
                                    size="sm"
                                    className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 h-8 px-3 text-xs"
                                    onClick={() => setShowGRNDialog(true)}
                                  >
                                    <Package className="h-3.5 w-3.5 mr-1" />
                                    <span>GRN</span>
                                  </Button>
                                </PermissionGuard>
                            )}
                            {canMarkFulfilled && (
                                <PermissionGuard resource="vendor-pos" action="edit" tooltipText="Only Purchase/Operations can fulfill POs">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateStatusMutation.mutate("fulfilled")}
                                    className="h-8 px-3 text-xs"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                    <span>Fulfill</span>
                                  </Button>
                                </PermissionGuard>
                            )}
                            {canCancel && (
                                <PermissionGuard resource="vendor-pos" action="delete" tooltipText="Only Purchase/Operations can cancel POs">
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setShowCancelDialog(true)}
                                    className="h-8 px-3 text-xs"
                                  >
                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                    <span>Cancel</span>
                                  </Button>
                                </PermissionGuard>
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
                                                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                                                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                                            } ${isCurrent ? "ring-2 ring-slate-400 dark:ring-slate-600 ring-offset-2" : ""}`}
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
                                        <div className={`h-px w-6 sm:w-12 transition-colors ${isCompleted ? "bg-slate-900 dark:bg-slate-100" : "bg-slate-200 dark:bg-slate-800"}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content - Flexible Layout */}
            <div className="flex-1 w-full max-w-[1800px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
                {/* Summary Card - Mobile Only */}
                <div className="lg:hidden mb-4">
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-xs text-slate-600 dark:text-slate-400">Total Amount</div>
                                <div className="text-lg font-bold text-slate-900 dark:text-white">
                                    ₹{parseFloat(po.total).toLocaleString()}
                                </div>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 grid grid-cols-2 gap-3 text-xs">
                                <div className="text-slate-600 dark:text-slate-400">Order: {formattedOrderDate}</div>
                                {formattedExpectedDate && (
                                    <div className="text-slate-600 dark:text-slate-400">Expected: {formattedExpectedDate}</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Grid - Flexible */}
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
                    {/* Left Column */}
                    <div className="space-y-4 sm:space-y-6 min-w-0">
                        {/* Vendor & Quote Cards */}
                        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                            {/* Vendor Card */}
                            <Card className="border-slate-200 dark:border-slate-800">
                                <CardHeader className="p-3 sm:p-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                                    <CardTitle className="text-xs sm:text-sm font-bold flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        Vendor
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 sm:p-4 space-y-2 text-xs sm:text-sm">
                                    <p className="font-semibold text-slate-900 dark:text-white break-words">
                                        {po.vendor.name}
                                    </p>
                                    <p className="text-slate-600 dark:text-slate-400 break-all">
                                        {po.vendor.email}
                                    </p>
                                    {po.vendor.phone && (
                                        <p className="text-slate-600 dark:text-slate-400">
                                            📞 {po.vendor.phone}
                                        </p>
                                    )}
                                    {po.vendor.contactPerson && (
                                        <p className="text-slate-600 dark:text-slate-400 break-words">
                                            👤 {po.vendor.contactPerson}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quote Card */}
                            <Card className="border-slate-200 dark:border-slate-800">
                                <CardHeader className="p-3 sm:p-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                                    <CardTitle className="text-xs sm:text-sm font-bold">Related Quote</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 sm:p-4">
                                    <Button
                                        variant="outline"
                                        className="w-full h-9 text-xs sm:text-sm"
                                        onClick={() => setLocation(`/quotes/${po.quote.id}`)}
                                    >
                                        {po.quote.quoteNumber}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Items List */}
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader className="p-3 sm:p-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                                <CardTitle className="text-xs sm:text-sm font-bold">Items ({po.items.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-4 space-y-3">
                                {po.items.map((item) => {
                                    const serials: string[] = item.serialNumbers
                                        ? JSON.parse(item.serialNumbers)
                                        : [];
                                    const enteredSerialCount = serials.length;

                                    return (
                                        <div
                                            key={item.id}
                                            className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50 dark:bg-slate-900/50"
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white flex-1 line-clamp-2">
                                                    {item.description}
                                                </h3>
                                                <PermissionGuard resource="vendor-pos" action="edit" tooltipText="Only Purchase/Operations can manage PO items">
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleAddSerials(item)}
                                                    className="h-7 px-2 text-xs shrink-0"
                                                  >
                                                    <Edit className="h-3 w-3 mr-1" />
                                                    {enteredSerialCount > 0 ? "Edit" : "Add"}
                                                  </Button>
                                                </PermissionGuard>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 dark:text-slate-400 mb-2">
                                                <div>Qty: <span className="font-medium text-slate-900 dark:text-white">{item.quantity}</span></div>
                                                <div>Recv: <span className="font-medium text-slate-900 dark:text-white">{item.receivedQuantity}</span></div>
                                                <div>Price: <span className="font-medium text-slate-900 dark:text-white">₹{parseFloat(item.unitPrice).toLocaleString()}</span></div>
                                                <div>Total: <span className="font-medium text-slate-900 dark:text-white">₹{parseFloat(item.subtotal).toLocaleString()}</span></div>
                                            </div>
                                            {enteredSerialCount > 0 && (
                                                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">SN:</span>
                                                        {serials.slice(0, 3).map((sn, i) => (
                                                            <Badge key={i} variant="outline" className="text-xs px-2 py-1">
                                                                {sn}
                                                            </Badge>
                                                        ))}
                                                        {enteredSerialCount > 3 && (
                                                            <Badge variant="outline" className="text-xs px-2 py-1">
                                                                +{enteredSerialCount - 3}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        {/* Notes & Terms */}
                        {(po.notes || po.termsAndConditions) && (
                            <Card className="border-slate-200 dark:border-slate-800">
                                <CardHeader className="p-3 sm:p-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                                    <CardTitle className="text-xs sm:text-sm font-bold">Additional Info</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 sm:p-4 space-y-3 text-xs sm:text-sm">
                                    {po.notes && (
                                        <div>
                                            <h4 className="font-semibold mb-1 text-slate-900 dark:text-white">Notes</h4>
                                            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap line-clamp-4">
                                                {po.notes}
                                            </p>
                                        </div>
                                    )}
                                    {po.termsAndConditions && (
                                        <div>
                                            <h4 className="font-semibold mb-1 text-slate-900 dark:text-white">Terms & Conditions</h4>
                                            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap line-clamp-4">
                                                {po.termsAndConditions}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-24 self-start">
                        {/* Summary */}
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader className="p-3 sm:p-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                                <CardTitle className="text-xs sm:text-sm font-bold">Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-4 space-y-2 text-xs sm:text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        ₹{parseFloat(po.subtotal).toLocaleString()}
                                    </span>
                                </div>
                                {parseFloat(po.discount) > 0 && (
                                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                        <span>Discount</span>
                                        <span>-₹{parseFloat(po.discount).toLocaleString()}</span>
                                    </div>
                                )}
                                {parseFloat(po.cgst) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">CGST</span>
                                        <span className="text-slate-900 dark:text-white">₹{parseFloat(po.cgst).toLocaleString()}</span>
                                    </div>
                                )}
                                {parseFloat(po.sgst) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">SGST</span>
                                        <span className="text-slate-900 dark:text-white">₹{parseFloat(po.sgst).toLocaleString()}</span>
                                    </div>
                                )}
                                {parseFloat(po.igst) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">IGST</span>
                                        <span className="text-slate-900 dark:text-white">₹{parseFloat(po.igst).toLocaleString()}</span>
                                    </div>
                                )}
                                {parseFloat(po.shippingCharges) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">Shipping</span>
                                        <span className="text-slate-900 dark:text-white">
                                            ₹{parseFloat(po.shippingCharges).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 mt-2 flex justify-between items-center">
                                    <span className="font-bold text-slate-900 dark:text-white">Total</span>
                                    <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                                        ₹{parseFloat(po.total).toLocaleString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Delivery */}
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader className="p-3 sm:p-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                                <CardTitle className="text-xs sm:text-sm font-bold">Delivery</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-4 space-y-2 text-xs sm:text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Ordered</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{formattedOrderDate}</span>
                                </div>
                                {formattedExpectedDate && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">Expected</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{formattedExpectedDate}</span>
                                    </div>
                                )}
                                {formattedActualDate && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">Delivered</span>
                                        <span className="font-medium text-emerald-600 dark:text-emerald-400">{formattedActualDate}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* SERIAL NUMBERS DIALOG */}
            <Dialog open={showSerialDialog} onOpenChange={setShowSerialDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Manage Serial Numbers</DialogTitle>
                        <DialogDescription>
                            Enter one serial number per line. Ensure the count matches the
                            required quantity for this item.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 sm:space-y-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                {selectedItem?.description ?? ""}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Required: {selectedItem?.quantity ?? 0} units
                            </p>
                        </div>
                        <Textarea
                            value={serialNumbers}
                            onChange={(e) => setSerialNumbers(e.target.value)}
                            placeholder={"SN001\nSN002\nSN003"}
                            rows={10}
                            className="font-mono text-xs sm:text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            {
                                serialNumbers
                                    .split("\n")
                                    .filter((s) => s.trim().length > 0).length
                            }{" "}
                            serial number(s) entered
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowSerialDialog(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveSerials}
                            disabled={updateSerialsMutation.isPending}
                        >
                            {updateSerialsMutation.isPending && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* GRN CREATION DIALOG */}
            <CreateGRNDialog
                open={showGRNDialog}
                onOpenChange={setShowGRNDialog}
                vendorPoId={po.id}
                vendorPoNumber={po.poNumber}
                items={po.items}
            />

            {/* CANCEL CONFIRMATION DIALOG */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Purchase Order?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel PO{" "}
                            <strong>{po.poNumber}</strong>? This action cannot be undone. The
                            vendor will need to be notified separately about the cancellation.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>No, Keep PO</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => cancelPoMutation.mutate()}
                            disabled={cancelPoMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {cancelPoMutation.isPending && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Yes, Cancel PO
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}