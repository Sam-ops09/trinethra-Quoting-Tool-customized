import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    Calendar,
    Users,
    Package,
    FileText,
    Download,
    CheckCircle,
    XCircle,
    Truck,
    Pencil,
    Mail,
    Home,
    ChevronRight,
    Phone,
    MapPin,
    Hash,
    User,
    Receipt,
    Loader2,
    Clock,
    X
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { SalesOrder, SalesOrderItem, Client, Quote } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function SalesOrderDetail() {
    const { id } = useParams();
    const [, setLocation] = useLocation();
    const isEnabled = useFeatureFlag("sales_orders_module");
    const canGeneratePDF = useFeatureFlag("sales_orders_pdfGeneration");
    const canSendEmail = useFeatureFlag("sales_orders_emailSending");
    const { toast } = useToast();

    if (isEnabled === false) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
                <h1 className="text-2xl font-bold">Feature Disabled</h1>
                <p className="text-muted-foreground">The Sales Orders module is currently disabled.</p>
                <Button onClick={() => setLocation("/")}>Go Home</Button>
            </div>
        );
    }
    const queryClient = useQueryClient();
    const [showFulfillDialog, setShowFulfillDialog] = useState(false);
    const [actualDeliveryDate, setActualDeliveryDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    const { data: order, isLoading } = useQuery<SalesOrder & { 
        client: Client; 
        items: SalesOrderItem[]; 
        quote: Quote & { items?: any[] }; 
        createdByName: string;
        invoiceId?: string;
    }>({
        queryKey: [`/api/sales-orders/${id}`],
    });

    const updateStatusMutation = useMutation({
        mutationFn: async (updateData: any) => {
            const res = await apiRequest("PATCH", `/api/sales-orders/${id}`, updateData);
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/sales-orders/${id}`] });
            queryClient.invalidateQueries({ queryKey: ["/api/sales-orders"] });
            toast({
                title: "Status Updated",
                description: "Sales order status has been updated successfully.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update status",
                variant: "destructive",
            });
        },
    });

    const emailMutation = useMutation({
        mutationFn: async (data: { email: string; subject: string; body: string }) => {
            const res = await apiRequest("POST", `/api/sales-orders/${id}/email`, data);
            return await res.json();
        },
        onSuccess: () => {
            toast({
                title: "Email Sent",
                description: "Sales order has been emailed to the client.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Email Failed",
                description: error.message || "Failed to send email",
                variant: "destructive",
            });
        },
    });

    const convertToInvoiceMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", `/api/sales-orders/${id}/convert-to-invoice`);
            return await res.json();
        },
        onSuccess: (invoice) => {
            toast({
                title: "Invoice Created",
                description: "Successfully converted sales order to invoice.",
            });
            setLocation(`/invoices/${invoice.id}`);
        },
        onError: (error: Error) => {
            toast({
                title: "Conversion Failed",
                description: error.message || "Failed to create invoice",
                variant: "destructive",
            });
        },
    });

    const handleEmail = () => {
        if (!order) return;

        if (!order.client?.email) {
            toast({
                title: "No Email",
                description: "Client does not have an email address.",
                variant: "destructive"
            });
            return;
        }

        if (!window.confirm(`Send Sales Order ${order.orderNumber} to ${order.client.email}?`)) return;

        emailMutation.mutate({
            email: order.client.email,
            subject: `Sales Order ${order.orderNumber} - ${order.client.name}`,
            body: `Dear ${order.client.name},\n\nPlease find attached Sales Order ${order.orderNumber}.\n\nKey Details:\nOrder Date: ${new Date(order.createdAt).toLocaleDateString()}\nTotal Amount: ${order.total}\n\nBest regards,\n${order.createdByName || "Sales Team"}`
        });
    };

    const updateStatus = (newStatus: string, deliveryDate?: string) => {
        const updateData: any = { status: newStatus };
        if (deliveryDate) {
            updateData.actualDeliveryDate = deliveryDate;
        }
        updateStatusMutation.mutate(updateData);
    };

    const handleFulfill = () => {
        updateStatus("fulfilled", actualDeliveryDate);
        setShowFulfillDialog(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "draft":
                return "bg-muted text-muted-foreground";
            case "confirmed":
                return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary";
            case "fulfilled":
                return "bg-success/10 text-success dark:bg-success/20 dark:text-success";
            case "cancelled":
                return "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

    const getStatusBorderColor = (status: string) => {
        switch (status) {
            case "draft":
                return 'rgb(148, 163, 184)'; // slate
            case "confirmed":
                return 'rgb(59, 130, 246)'; // blue
            case "fulfilled":
                return 'rgb(34, 197, 94)'; // green
            case "cancelled":
                return 'rgb(239, 68, 68)'; // red
            default:
                return 'rgb(148, 163, 184)';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-3">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <div className="grid gap-3 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-3">
                            <Skeleton className="h-48 rounded-lg" />
                            <Skeleton className="h-64 rounded-lg" />
                        </div>
                        <Skeleton className="h-96 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen">
                <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-12">
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <Package className="h-12 w-12 text-slate-400 mb-4" />
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Order not found</p>
                            <Button onClick={() => setLocation("/sales-orders")} className="h-9 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Orders
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const displayItems = (order.items && order.items.length > 0) 
        ? order.items 
        : (order.quote?.items || []);

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
                        onClick={() => setLocation("/sales-orders")}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                    >
                        <Package className="h-3.5 w-3.5" />
                        <span>Sales Orders</span>
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                        <Hash className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{order.orderNumber}</span>
                    </span>
                </nav>

                {/* Header */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation("/sales-orders")}
                        className="h-8 w-8 shrink-0"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                    </Button>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                                {order.orderNumber}
                            </h1>
                            <Badge className={`${getStatusColor(order.status)} text-[10px] px-2 py-0.5`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                        </div>
                        <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            Created {new Date(order.orderDate).toLocaleDateString()}
                            {order.createdByName && ` • by ${order.createdByName}`}
                        </p>
                    </div>
                </div>

                {/* Status Badge and Quick Actions Card */}
                <Card className="border-slate-200 dark:border-slate-800 border-l-4" style={{ borderLeftColor: getStatusBorderColor(order.status) }}>
                    <CardContent className="p-3">
                        <div className="flex flex-col gap-3">
                            {/* Total Amount Display */}
                            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                                <div>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase mb-0.5">Total Amount</p>
                                    <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{Number(order.total).toLocaleString()}</p>
                                </div>
                                <Receipt className="h-8 w-8 text-emerald-600 dark:text-emerald-400 opacity-50" />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-1.5">
                                {order.status === "draft" && (
                                    <Button
                                        size="sm"
                                        onClick={() => updateStatus("confirmed")}
                                        className="flex-1 sm:flex-initial h-7 text-xs bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
                                    >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Confirm
                                    </Button>
                                )}
                                
                                {order.status === "confirmed" && (
                                    <Button
                                        size="sm"
                                        onClick={() => setShowFulfillDialog(true)}
                                        className="flex-1 sm:flex-initial h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                        <Truck className="h-3 w-3 mr-1" />
                                        Mark Fulfilled
                                    </Button>
                                )}
                                
                                {order.status === "fulfilled" && !order.invoiceId && (
                                    <Button
                                        size="sm"
                                        onClick={() => convertToInvoiceMutation.mutate()}
                                        disabled={convertToInvoiceMutation.isPending}
                                        className="flex-1 sm:flex-initial h-7 text-xs bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
                                    >
                                        {convertToInvoiceMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Receipt className="h-3 w-3 mr-1" />}
                                        Invoice
                                    </Button>
                                )}

                                {order.invoiceId && (
                                    <Button
                                        size="sm"
                                        onClick={() => setLocation(`/invoices/${order.invoiceId}`)}
                                        className="flex-1 sm:flex-initial h-7 text-xs bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
                                    >
                                        <Receipt className="h-3 w-3 mr-1" />
                                        View Invoice
                                    </Button>
                                )}
                                
                                {order.status !== "cancelled" && order.status !== "fulfilled" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateStatus("cancelled")}
                                        className="flex-1 sm:flex-initial h-7 text-xs"
                                    >
                                        <X className="h-3 w-3 mr-1" />
                                        Cancel
                                    </Button>
                                )}

                                {(order.status === "draft" || order.status === "confirmed") && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setLocation(`/sales-orders/${order.id}/edit`)}
                                        className="flex-1 sm:flex-initial h-7 text-xs"
                                    >
                                        <Pencil className="h-3 w-3 mr-1" />
                                        <span className="hidden xs:inline">Edit</span>
                                    </Button>
                                )}

                                {canGeneratePDF && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(`/api/sales-orders/${order.id}/pdf`, '_blank')}
                                        className="flex-1 sm:flex-initial h-7 text-xs"
                                    >
                                        <Download className="h-3 w-3 mr-1" />
                                        <span className="hidden xs:inline">PDF</span>
                                    </Button>
                                )}
                                
                                {canSendEmail && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleEmail}
                                        disabled={emailMutation.isPending}
                                        className="flex-1 sm:flex-initial h-7 text-xs"
                                    >
                                        {emailMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Mail className="h-3 w-3 mr-1" />}
                                        <span className="hidden xs:inline">Email</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Grid */}
                <div className="grid gap-3 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-3">
                        {/* Client Information Card */}
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                                        <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <CardTitle className="text-sm font-bold">Client Information</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {/* Company Name */}
                                    <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <User className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Company</p>
                                        </div>
                                        <p className="font-bold text-xs text-slate-900 dark:text-white break-words">{order.client.name}</p>
                                    </div>

                                    {/* Email */}
                                    <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Mail className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Email</p>
                                        </div>
                                        <p className="text-xs text-slate-900 dark:text-white break-all">{order.client.email}</p>
                                    </div>

                                    {/* Phone */}
                                    {order.client.phone && (
                                        <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Phone className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Phone</p>
                                            </div>
                                            <p className="text-xs text-slate-900 dark:text-white">{order.client.phone}</p>
                                        </div>
                                    )}

                                    {/* GSTIN */}
                                    {order.client.gstin && (
                                        <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Hash className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">GSTIN</p>
                                            </div>
                                            <p className="font-mono text-xs text-slate-900 dark:text-white break-all">{order.client.gstin}</p>
                                        </div>
                                    )}

                                    {/* Billing Address */}
                                    {order.client.billingAddress && (
                                        <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 sm:col-span-2">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <MapPin className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Billing Address</p>
                                            </div>
                                            <p className="text-xs text-slate-900 dark:text-white whitespace-pre-line break-words">{order.client.billingAddress}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Line Items Card */}
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                                            <Package className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                        </div>
                                        <CardTitle className="text-sm font-bold">Line Items</CardTitle>
                                    </div>
                                    <Badge className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-[10px] px-2 py-0.5">
                                        {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3">
                                <div className="space-y-2">
                                    {displayItems.length > 0 ? (
                                        displayItems.map((item: any, index: number) => (
                                            <div
                                                key={item.id || index}
                                                className="relative border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 transition-colors"
                                            >
                                                {/* Item Number Badge */}
                                                <div className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center text-[10px] font-bold">
                                                    {index + 1}
                                                </div>

                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pl-4 sm:pl-0">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-xs text-slate-900 dark:text-white break-words mb-1.5">
                                                            {item.description}
                                                        </p>
                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-600 dark:text-slate-400">
                                                            <span className="flex items-center gap-1">
                                                                <span className="font-medium">Qty:</span>
                                                                <span className="font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <span className="font-medium">Unit:</span>
                                                                <span className="font-bold">₹{Number(item.unitPrice).toLocaleString()}</span>
                                                            </span>
                                                            {item.hsnSac && (
                                                                <span className="flex items-center gap-1">
                                                                    <span className="font-medium">HSN/SAC:</span>
                                                                    <span className="font-mono font-bold bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-900 dark:text-white">{item.hsnSac}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5 uppercase font-semibold">Subtotal</p>
                                                        <p className="font-bold text-base text-emerald-600 dark:text-emerald-400">₹{Number(item.subtotal).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <Package className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                            <p className="text-slate-500">No items found for this order</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes Section */}
                        {order.notes && (
                            <Card className="border-slate-200 dark:border-slate-800">
                                <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                                            <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                        </div>
                                        <CardTitle className="text-sm font-bold">Notes</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-900 border-l-4 border-amber-500">
                                        <p className="text-xs text-slate-900 dark:text-white whitespace-pre-line break-words leading-relaxed">{order.notes}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Terms & Conditions Section */}
                        {order.termsAndConditions && (
                            <Card className="border-slate-200 dark:border-slate-800">
                                <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                                            <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                        </div>
                                        <CardTitle className="text-sm font-bold">Terms & Conditions</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-900 border-l-4 border-purple-500">
                                        <p className="text-xs text-slate-900 dark:text-white whitespace-pre-line break-words leading-relaxed">{order.termsAndConditions}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:sticky lg:top-6 space-y-3">
                        {/* Delivery Tracking Card */}
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                                        <Truck className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <CardTitle className="text-sm font-bold">Delivery Tracking</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 space-y-3">
                                {/* Timeline */}
                                <div className="space-y-4">
                                    {/* Order Placed */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="h-2 w-2 rounded-full bg-blue-600 my-1.5"></div>
                                            <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-800 min-h-[30px]"></div>
                                        </div>
                                        <div className="pb-4">
                                            <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">Order Placed</p>
                                            <p className="text-xs text-slate-900 dark:text-white mt-0.5">
                                                {format(new Date(order.orderDate), "PPP")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Expected Delivery */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={cn("h-2 w-2 rounded-full my-1.5", 
                                                order.expectedDeliveryDate ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"
                                            )}></div>
                                            <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-800 min-h-[30px]"></div>
                                        </div>
                                        <div className="pb-4">
                                            <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">Expected Delivery</p>
                                            {order.expectedDeliveryDate ? (
                                                <p className="text-xs text-slate-900 dark:text-white mt-0.5">
                                                    {format(new Date(order.expectedDeliveryDate), "PPP")}
                                                </p>
                                            ) : (
                                                <p className="text-xs italic text-slate-400 mt-0.5">Not scheduled</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actual Delivery */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={cn("h-2 w-2 rounded-full my-1.5", 
                                                order.status === "fulfilled" ? "bg-green-600" : "bg-slate-300 dark:bg-slate-700"
                                            )}></div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">Actual Delivery</p>
                                            {order.status === "fulfilled" && order.actualDeliveryDate ? (
                                                <p className="text-xs font-bold text-green-600 dark:text-green-400 mt-0.5">
                                                    {format(new Date(order.actualDeliveryDate), "PPP")}
                                                </p>
                                            ) : (
                                                <p className="text-xs italic text-slate-400 mt-0.5">
                                                    {order.status === "fulfilled" ? "Delivered" : "Pending delivery"}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Current Status Box */}
                                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Current Status</p>
                                    <div className={cn("p-2.5 rounded-md border-l-4 flex items-center gap-2", 
                                        order.status === "draft" ? "bg-slate-50 dark:bg-slate-950 border-slate-500" :
                                        order.status === "confirmed" ? "bg-blue-50 dark:bg-blue-950 border-blue-500" :
                                        order.status === "fulfilled" ? "bg-green-50 dark:bg-green-950 border-green-500" :
                                        "bg-red-50 dark:bg-red-950 border-red-500"
                                    )}>
                                        {order.status === "draft" && <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />}
                                        {order.status === "confirmed" && <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                                        {order.status === "fulfilled" && <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />}
                                        {order.status === "cancelled" && <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />}
                                        
                                        <div>
                                            <p className="text-xs font-bold capitalize text-slate-900 dark:text-white">{order.status}</p>
                                            <p className="text-[10px] text-slate-600 dark:text-slate-400">
                                                {order.status === "draft" && "Awaiting confirmation"}
                                                {order.status === "confirmed" && "Processing for delivery"}
                                                {order.status === "fulfilled" && "Successfully delivered"}
                                                {order.status === "cancelled" && "Order cancelled"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Summary Card */}
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                                        <Receipt className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <CardTitle className="text-sm font-bold">Order Summary</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 space-y-3">
                                {/* Created By */}
                                {order.createdByName && (
                                    <div className="p-2.5 rounded-md bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                            <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase">Created By</p>
                                        </div>
                                        <p className="font-semibold text-xs text-slate-900 dark:text-white break-words">{order.createdByName}</p>
                                    </div>
                                )}

                                {/* Source Quote */}
                                {order.quoteId && order.quote && (
                                    <div className="p-2.5 rounded-md bg-emerald-50 dark:bg-emerald-950 border-l-4 border-emerald-500">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Hash className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Source Quote</p>
                                        </div>
                                        <Button 
                                            variant="link" 
                                            onClick={() => setLocation(`/quotes/${order.quoteId}`)} 
                                            className="h-auto p-0 font-semibold text-xs text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400"
                                        >
                                            {order.quote.quoteNumber} →
                                        </Button>
                                    </div>
                                )}

                                {/* Financial Summary */}
                                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Financial Summary</p>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center text-xs p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-900">
                                            <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">₹{Number(order.subtotal).toLocaleString()}</span>
                                        </div>

                                        {Number(order.discount) > 0 && (
                                            <div className="flex justify-between items-center text-xs p-1.5 rounded bg-rose-50 dark:bg-rose-950">
                                                <span className="text-slate-600 dark:text-slate-400">Discount</span>
                                                <span className="font-semibold text-rose-600 dark:text-rose-400">-₹{Number(order.discount).toLocaleString()}</span>
                                            </div>
                                        )}

                                        {Number(order.cgst) > 0 && (
                                            <div className="flex justify-between items-center text-xs p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-900">
                                                <span className="text-slate-600 dark:text-slate-400">CGST</span>
                                                <span className="font-semibold text-slate-900 dark:text-white">₹{Number(order.cgst).toLocaleString()}</span>
                                            </div>
                                        )}

                                        {Number(order.sgst) > 0 && (
                                            <div className="flex justify-between items-center text-xs p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-900">
                                                <span className="text-slate-600 dark:text-slate-400">SGST</span>
                                                <span className="font-semibold text-slate-900 dark:text-white">₹{Number(order.sgst).toLocaleString()}</span>
                                            </div>
                                        )}

                                        {Number(order.igst) > 0 && (
                                            <div className="flex justify-between items-center text-xs p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-900">
                                                <span className="text-slate-600 dark:text-slate-400">IGST</span>
                                                <span className="font-semibold text-slate-900 dark:text-white">₹{Number(order.igst).toLocaleString()}</span>
                                            </div>
                                        )}

                                        {Number(order.shippingCharges) > 0 && (
                                            <div className="flex justify-between items-center text-xs p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-900">
                                                <span className="text-slate-600 dark:text-slate-400">Shipping</span>
                                                <span className="font-semibold text-slate-900 dark:text-white">₹{Number(order.shippingCharges).toLocaleString()}</span>
                                            </div>
                                        )}

                                        {/* Total */}
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 mt-3">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">Total</span>
                                            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{Number(order.total).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Fulfillment Dialog */}
            <Dialog open={showFulfillDialog} onOpenChange={setShowFulfillDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark Order as Fulfilled</DialogTitle>
                        <DialogDescription>
                            Record the actual delivery date for this order.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label htmlFor="deliveryDate" className="text-sm font-medium">
                                Actual Delivery Date
                            </label>
                            <Input
                                id="deliveryDate"
                                type="date"
                                value={actualDeliveryDate}
                                onChange={(e) => setActualDeliveryDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowFulfillDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleFulfill} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm Fulfillment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
