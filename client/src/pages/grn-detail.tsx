import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Package, FileText, Save, Upload, PackageCheck, Building2, Mail, Phone, Clock, DollarSign, UserCheck, Barcode, Home, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PermissionGuard } from "@/components/permission-guard";

// Interface (Unchanged)
interface GRNDetail {
    id: string;
    grnNumber: string;
    vendorPo: {
        id: string;
        poNumber: string;
        vendor: {
            name: string;
            email: string;
            phone?: string;
        };
    };
    vendorPoItem: {
        id: string;
        description: string;
        quantity: number;
        receivedQuantity: number;
        unitPrice: string;
    };
    receivedDate: string;
    quantityOrdered: number;
    quantityReceived: number;
    quantityRejected: number;
    inspectionStatus: string;
    inspectedBy?: {
        id: string;
        name: string;
    };
    inspectionNotes?: string;
    deliveryNoteNumber?: string;
    batchNumber?: string;
    attachments?: string;
}

// --- Component Start ---

export default function GRNDetailPage() {
    const [, params] = useRoute("/grn/:id");
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);

    // Form State (Unchanged)
    const [formData, setFormData] = useState({
        quantityReceived: 0,
        quantityRejected: 0,
        inspectionStatus: "pending",
        inspectionNotes: "",
        deliveryNoteNumber: "",
        batchNumber: "",
    });

    // Data Fetching (Unchanged)
    const { data: grn, isLoading } = useQuery<GRNDetail>({
        queryKey: ["/api/grns", params?.id],
        enabled: !!params?.id,
    });

    // Sync state with fetched data on load (Unchanged)
    useEffect(() => {
        if (grn) {
            setFormData({
                quantityReceived: grn.quantityReceived,
                quantityRejected: grn.quantityRejected,
                inspectionStatus: grn.inspectionStatus,
                inspectionNotes: grn.inspectionNotes || "",
                deliveryNoteNumber: grn.deliveryNoteNumber || "",
                batchNumber: grn.batchNumber || "",
            });
        }
    }, [grn]);

    // Mutation (Unchanged)
    const updateMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            // Logic to determine final status before sending
            let finalStatus = data.inspectionStatus;
            const totalReceived = data.quantityReceived + data.quantityRejected;

            // Automatic status correction logic (as in previous version)
            if (totalReceived > 0 && totalReceived < grn!.quantityOrdered && finalStatus === 'approved') {
                finalStatus = 'partial';
            }

            const updateData = {
                ...data,
                inspectionStatus: finalStatus,
            }

            return await apiRequest("PATCH", `/api/grns/${params?.id}`, updateData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/grns", params?.id] });
            queryClient.invalidateQueries({ queryKey: ["/api/grns"] });
            toast({
                title: "GRN updated successfully",
                description: "The goods received note has been updated.",
            });
            setIsEditing(false);
        },
        onError: () => {
            toast({
                title: "Failed to update GRN",
                description: "Check quantities and try again.",
                variant: "destructive",
            });
        },
    });

    // Submission Handler (Unchanged validation)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const totalCount = formData.quantityReceived + formData.quantityRejected;
        if (totalCount > (grn?.quantityOrdered || 0)) {
            toast({
                title: "Invalid quantities",
                description: `Received (${formData.quantityReceived}) + Rejected (${formData.quantityRejected}) must not exceed ordered quantity (${grn?.quantityOrdered}).`,
                variant: "destructive",
            });
            return;
        }

        if (totalCount === 0 && (grn?.quantityOrdered || 0) > 0 && (formData.inspectionStatus !== 'rejected' && formData.inspectionStatus !== 'pending')) {
            toast({
                title: "Quantity mismatch",
                description: `A status of ${formData.inspectionStatus} requires a positive received or rejected quantity.`,
                variant: "destructive",
            });
            return;
        }

        updateMutation.mutate(formData);
    };

    // Status Badge Logic (Compact)
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; color: string; icon: any }> = {
            pending: { label: "Pending Inspection", color: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-400", icon: Clock },
            approved: { label: "Fully Approved", color: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-400", icon: CheckCircle },
            rejected: { label: "Rejected", color: "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-400", icon: XCircle },
            partial: { label: "Partially Approved", color: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/50 dark:text-blue-400", icon: AlertCircle },
        };

        const config = statusMap[status] || statusMap.pending;
        const Icon = config.icon;

        return (
            <Badge className={`${config.color} gap-1 font-medium border text-[10px] py-0.5 px-2`}>
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    // Helper for formatting currency
    const formatCurrency = (amount: number | string) => {
        return `₹${parseFloat(amount as string).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Helper for formatting date
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    // Error/Loading States (Using the refined skeleton)
    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (!grn) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
                <Card className="border-dashed border-2 shadow-none">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="rounded-full bg-muted p-6 mb-4">
                            <Package className="h-14 w-14 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">GRN Not Found</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            The goods received note ID *{params?.id}* could not be located.
                        </p>
                        <Button onClick={() => setLocation("/grn")} variant="outline" size="lg">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to GRN List
                        </Button>
                    </CardContent>
                </Card>
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
                    <button
                        onClick={() => setLocation("/grn")}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                    >
                        <PackageCheck className="h-3.5 w-3.5" />
                        <span>GRN List</span>
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                        <Package className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[150px]">{grn.grnNumber}</span>
                    </span>
                </nav>


                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                            {grn.grnNumber}
                        </h1>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                                Received: {formatDate(grn.receivedDate)}
                            </p>
                            {getStatusBadge(grn.inspectionStatus)}
                        </div>
                    </div>
                    <Button
                        onClick={() => setLocation("/grn")}
                        variant="outline"
                        className="h-8 text-xs"
                        size="sm"
                    >
                        <ArrowLeft className="h-3 w-3 mr-1.5" />
                        Back
                    </Button>
                </div>

                {/* Main Layout Grid */}
                <div className="grid lg:grid-cols-3 gap-3">
                    {/* Column 1: Main Content */}
                    <div className="lg:col-span-2 space-y-3">

                        {/* Purchase Order & Vendor Details */}
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader className="p-3 border-b border-slate-200 dark:border-slate-800">
                                <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                                    <FileText className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                                    Source PO & Vendor
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                    <DetailBox icon={FileText} label="PO Number" value={grn.vendorPo.poNumber} href={`/vendor-pos/${grn.vendorPo.id}`} />
                                    <DetailBox icon={Building2} label="Vendor Name" value={grn.vendorPo.vendor.name} />
                                    <DetailBox icon={Mail} label="Vendor Email" value={grn.vendorPo.vendor.email} />
                                    {grn.vendorPo.vendor.phone && <DetailBox icon={Phone} label="Vendor Phone" value={grn.vendorPo.vendor.phone} />}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Item & Value Details */}
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader className="p-3 border-b border-slate-200 dark:border-slate-800">
                                <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                                    <Package className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                                    Item Received Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 space-y-2.5">
                                <div className="p-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Item Description</p>
                                    <p className="font-semibold text-xs text-slate-900 dark:text-white">{grn.vendorPoItem.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <ValueBox icon={DollarSign} label="Unit Price" value={formatCurrency(grn.vendorPoItem.unitPrice)} color="text-slate-900 dark:text-white" />
                                    <ValueBox icon={DollarSign} label="Received Value" value={formatCurrency(parseFloat(grn.vendorPoItem.unitPrice) * grn.quantityReceived)} color="text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. Inspection Form / Details */}
                        {isEditing || grn.inspectionStatus === "pending" ? (
                            <InspectionForm
                                grn={grn}
                                formData={formData}
                                setFormData={setFormData}
                                handleSubmit={handleSubmit}
                                updateMutation={updateMutation}
                                setIsEditing={setIsEditing}
                                isEditing={isEditing}
                            />
                        ) : (
                            <InspectionDetails grn={grn} setIsEditing={setIsEditing} />
                        )}

                    </div>

                    {/* Column 2: Sidebar Summary */}
                    <div className="lg:col-span-1 space-y-3">

                        {/* Quantity Summary Card */}
                        <Card className="border-slate-200 dark:border-slate-800 sticky top-4">
                            <CardHeader className="p-3 border-b border-slate-200 dark:border-slate-800">
                                <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                                    <PackageCheck className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                                    Receipt Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 space-y-2">
                                <SummaryMetric label="Ordered Quantity" value={grn.quantityOrdered} color="text-slate-900 dark:text-white" />
                                <SummaryMetric label="Received (Accepted)" value={grn.quantityReceived} color="text-emerald-600 dark:text-emerald-400" />
                                <SummaryMetric label="Rejected" value={grn.quantityRejected} color="text-rose-600 dark:text-rose-400" />
                                <Separator className="my-2" />
                                <SummaryMetric
                                    label="Acceptance Rate"
                                    value={`${grn.quantityOrdered > 0 ? Math.round((grn.quantityReceived / grn.quantityOrdered) * 100) : 0}%`}
                                    color="text-slate-900 dark:text-white"
                                    largeText
                                />

                                {grn.quantityReceived < grn.quantityOrdered && grn.inspectionStatus !== 'rejected' && (
                                    <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-900">
                                        <div className="flex items-start gap-1.5">
                                            <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                            <div className="text-xs">
                                                <p className="font-semibold text-amber-900 dark:text-amber-300 mb-0.5">Pending Balance</p>
                                                <p className="text-amber-700 dark:text-amber-400">
                                                    {grn.quantityOrdered - grn.quantityReceived} units still expected.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions Card */}
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader className="p-3 border-b border-slate-200 dark:border-slate-800">
                                <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                                    <CheckCircle className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                                    Quick Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start h-8 text-xs"
                                    onClick={() => setLocation(`/vendor-pos/${grn.vendorPo.id}`)}
                                    size="sm"
                                >
                                    <FileText className="h-3 w-3 mr-1.5" />
                                    View Source PO
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start h-8 text-xs"
                                    disabled={true}
                                    size="sm"
                                >
                                    <Upload className="h-3 w-3 mr-1.5" />
                                    Upload Documents
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Helper Components for Cleanliness ---

// 1. Reusable Detail Box (Compact)
function DetailBox({ icon: Icon, label, value, href }: { icon: any, label: string, value: string, href?: string }) {
    const content = (
        <div className="p-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer">
            <div className="flex items-center gap-1 mb-0.5">
                <Icon className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">{label}</p>
            </div>
            <p className="font-semibold text-xs text-slate-900 dark:text-white break-words">{value}</p>
        </div>
    );

    return href ? (
        <a href={href} className="block">{content}</a>
    ) : content;
}

// 2. Reusable Value Box (Compact)
function ValueBox({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
    return (
        <div className="p-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
            <div className="flex items-center gap-1 mb-0.5">
                <Icon className={`h-3 w-3 ${color}`} />
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">{label}</p>
            </div>
            <p className={`text-base font-bold ${color}`}>{value}</p>
        </div>
    );
}

// 3. Summary Metric for Sidebar (Compact)
function SummaryMetric({ label, value, color, largeText = false }: { label: string, value: string | number, color: string, largeText?: boolean }) {
    return (
        <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
            <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{label}</span>
                <span className={`${largeText ? 'text-lg' : 'text-base'} font-bold ${color}`}>{value}</span>
            </div>
        </div>
    );
}

// 4. Inspection Form Component (Compact)
function InspectionForm({ grn, formData, setFormData, handleSubmit, updateMutation, setIsEditing, isEditing }: any) {
    const totalCount = formData.quantityReceived + formData.quantityRejected;
    const isExceeded = totalCount > grn.quantityOrdered;

    return (
        <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="p-3 border-b border-slate-200 dark:border-slate-800">
                <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                        Quality Inspection & Receipt
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Quantity Inputs */}
                    <div className="grid grid-cols-3 gap-2">
                        <InputGroup label="Ordered Qty" value={grn.quantityOrdered} disabled={true} />
                        <InputGroup
                            label="Received Qty *"
                            type="number"
                            value={formData.quantityReceived}
                            onChange={(e:any) => setFormData({ ...formData, quantityReceived: parseInt(e.target.value) || 0 })}
                        />
                        <InputGroup
                            label="Rejected Qty"
                            type="number"
                            value={formData.quantityRejected}
                            onChange={(e:any) => setFormData({ ...formData, quantityRejected: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    {isExceeded && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Total quantity ({totalCount}) exceeds ordered quantity ({grn.quantityOrdered}).
                        </p>
                    )}

                    {/* Status Select */}
                    <div className="space-y-1">
                        <Label htmlFor="inspectionStatus" className="text-xs font-semibold">Inspection Status *</Label>
                        <Select
                            value={formData.inspectionStatus}
                            onValueChange={(value) => setFormData({ ...formData, inspectionStatus: value })}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending Inspection</SelectItem>
                                <SelectItem value="approved">Approved (Full Match)</SelectItem>
                                <SelectItem value="rejected">Rejected (Do Not Accept)</SelectItem>
                                <SelectItem value="partial">Partially Approved</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-2">
                        <InputGroup label="Delivery Note #" value={formData.deliveryNoteNumber} onChange={(e:any) => setFormData({ ...formData, deliveryNoteNumber: e.target.value })} />
                        <InputGroup label="Batch/Lot #" value={formData.batchNumber} onChange={(e:any) => setFormData({ ...formData, batchNumber: e.target.value })} />
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                        <Label htmlFor="inspectionNotes" className="text-xs font-semibold">Inspection Notes</Label>
                        <Textarea
                            id="inspectionNotes"
                            rows={2}
                            value={formData.inspectionNotes}
                            onChange={(e) => setFormData({ ...formData, inspectionNotes: e.target.value })}
                            placeholder="Enter inspection findings, quality notes, or any issues..."
                            className="resize-none text-xs"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        {isEditing && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                                disabled={updateMutation.isPending}
                                size="sm"
                                className="w-full sm:w-auto h-8 text-xs"
                            >
                                Cancel
                            </Button>
                        )}
                        <PermissionGuard resource="grn" action="edit" tooltipText="Only Purchase/Operations can update GRNs">
                          <Button
                            type="submit"
                            disabled={updateMutation.isPending || isExceeded}
                            size="sm"
                            className="w-full sm:w-auto h-8 text-xs bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
                          >
                            {updateMutation.isPending ? (
                                <>
                                    <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-3 w-3 mr-1.5" />
                                    {isEditing ? "Save Changes" : "Complete Inspection"}
                                </>
                            )}
                          </Button>
                        </PermissionGuard>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

// 5. Inspection Details Component (Compact)
function InspectionDetails({ grn, setIsEditing }: any) {
    return (
        <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="p-3 border-b border-slate-200 dark:border-slate-800">
                <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                        Inspection History
                    </div>
                    <PermissionGuard resource="grn" action="edit" tooltipText="Only Purchase/Operations can re-inspect GRNs">
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setIsEditing(true)}>
                        <UserCheck className="h-3 w-3 mr-1" />
                        Re-inspect
                      </Button>
                    </PermissionGuard>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                    {grn.inspectedBy && <DetailBox icon={UserCheck} label="Inspected By" value={grn.inspectedBy.name} />}
                    {grn.deliveryNoteNumber && <DetailBox icon={Barcode} label="Delivery Note" value={grn.deliveryNoteNumber} />}
                    {grn.batchNumber && <DetailBox icon={Package} label="Batch/Lot Number" value={grn.batchNumber} />}
                </div>

                {grn.inspectionNotes && (
                    <div className="p-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Inspection Notes</p>
                        <p className="text-xs whitespace-pre-wrap text-slate-900 dark:text-white">{grn.inspectionNotes}</p>
                    </div>
                )}

                {!grn.inspectedBy && !grn.inspectionNotes && !grn.deliveryNoteNumber && !grn.batchNumber && (
                    <div className="text-center py-6">
                        <AlertCircle className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                        <p className="text-xs text-slate-600 dark:text-slate-400">No inspection details recorded yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// 6. Generic Input Group (Compact)
function InputGroup({ label, value, onChange, type = "text", disabled = false }: { label: string, value: any, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, disabled?: boolean }) {
    return (
        <div className="space-y-1">
            <Label className="text-xs font-semibold">{label}</Label>
            <Input
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                min={0}
                className="h-8 text-xs"
            />
        </div>
    );
}

// 7. Loading Skeleton (Compact)
function LoadingSkeleton() {
    return (
        <div className="min-h-screen">
            <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-3">
                <Skeleton className="h-4 w-40 mb-3" />
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-3 w-64" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                </div>

                <div className="grid lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-2 space-y-3">
                        <Skeleton className="h-32 rounded-lg" />
                        <Skeleton className="h-36 rounded-lg" />
                        <Skeleton className="h-72 rounded-lg" />
                    </div>
                    <div className="lg:col-span-1 space-y-3">
                        <Skeleton className="h-56 rounded-lg" />
                        <Skeleton className="h-32 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}