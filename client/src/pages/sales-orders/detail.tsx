
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    Calendar,
    Users,
    DollarSign,
    Package,
    Clock,
    FileText,
    Download,
    CheckCircle,
    XCircle,
    Truck,
    List,
    Pencil,
    Mail
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import type { SalesOrder, SalesOrderItem, Client, Quote } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [showFulfillDialog, setShowFulfillDialog] = useState(false);
    const [actualDeliveryDate, setActualDeliveryDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    const { data: order, isLoading } = useQuery<SalesOrder & { 
        client: Client; 
        items: SalesOrderItem[]; 
        quote: Quote & { items?: any[] }; 
        createdByName: string 
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    <Skeleton className="h-12 w-48" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Order not found</h1>
                    <Button onClick={() => setLocation("/sales-orders")} className="mt-4">Back to Orders</Button>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "draft": return "bg-gray-100 text-gray-800";
            case "confirmed": return "bg-blue-100 text-blue-800";
            case "fulfilled": return "bg-green-100 text-green-800";
            case "cancelled": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const displayItems = (order.items && order.items.length > 0) 
        ? order.items 
        : (order.quote?.items || []);

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 animate-in fade-in duration-500">
            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
                {/* Header Navigation */}
                <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setLocation("/sales-orders")}
                            className="rounded-full hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow transition-all shrink-0 mt-1"
                        >
                            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </Button>
                        <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3 truncate">
                                    <Package className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 shrink-0" />
                                    <span className="truncate">{order.orderNumber}</span>
                                </h1>
                                <Badge className={cn("px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize border shadow-sm", getStatusColor(order.status))}>
                                    {order.status}
                                </Badge>
                            </div>
                            <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Created on {format(new Date(order.orderDate), "PPP")}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto pt-2 sm:pt-0">
                         {/* Status Action Buttons */}
                         {order.status === "draft" && (
                             <Button
                                 onClick={() => updateStatus("confirmed")}
                                 size="sm"
                                 className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                             >
                                 <CheckCircle className="h-4 w-4 mr-1.5" />
                                 Confirm Order
                             </Button>
                         )}
                         
                         {order.status === "confirmed" && (
                             <Button
                                 onClick={() => setShowFulfillDialog(true)}
                                 size="sm"
                                 className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                             >
                                 <Truck className="h-4 w-4 mr-1.5" />
                                 Mark Fulfilled
                             </Button>
                         )}
                         
                         {order.status === "fulfilled" && (
                             <Button
                                 onClick={() => convertToInvoiceMutation.mutate()}
                                 disabled={convertToInvoiceMutation.isPending}
                                 size="sm"
                                 className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                             >
                                 <FileText className="h-4 w-4 mr-1.5" />
                                 {convertToInvoiceMutation.isPending ? "Converting..." : "Convert to Invoice"}
                             </Button>
                         )}
                         
                         {order.status !== "cancelled" && order.status !== "fulfilled" && (
                             <Button
                                 onClick={() => updateStatus("cancelled")}
                                 size="sm"
                                 variant="outline"
                                 className="flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50"
                             >
                                 <XCircle className="h-4 w-4 mr-1.5" />
                                 Cancel
                             </Button>
                         )}

                          <Separator orientation="vertical" className="hidden sm:block h-8 mx-1" />

                          {/* PDF & Email Actions */}
                          <div className="flex w-full sm:w-auto gap-2">
                            {(order.status === "draft" || order.status === "confirmed") && (
                                <Button
                                    onClick={() => setLocation(`/sales-orders/${order.id}/edit`)}
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 sm:flex-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    <Pencil className="h-4 w-4 mr-1.5" />
                                    Edit
                                </Button>
                            )}

                            <Button
                                onClick={() => window.open(`/api/sales-orders/${order.id}/pdf`, '_blank')}
                                size="sm"
                                variant="outline"
                                className="flex-1 sm:flex-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                <Download className="h-4 w-4 mr-1.5" />
                                PDF
                            </Button>
                            
                            <Button
                                onClick={handleEmail}
                                disabled={emailMutation.isPending}
                                size="sm"
                                variant="outline"
                                className="flex-1 sm:flex-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                <Mail className="h-4 w-4 mr-1.5" />
                                {emailMutation.isPending ? "Sending..." : "Email"}
                            </Button>
                          </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                         {/* Items Table */}
                        <Card className="rounded-xl xs:rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                             <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-4 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg text-slate-800 dark:text-slate-100">
                                        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                            <List className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </div>
                                        Order Items
                                    </CardTitle>
                                    <Badge variant="outline" className="bg-white dark:bg-slate-800 text-slate-500 font-normal">
                                        {displayItems.length} Items
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
                                            <TableHead className="pl-4 sm:pl-6 w-[45%] h-11 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</TableHead>
                                            <TableHead className="text-center w-[15%] h-11 text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</TableHead>
                                            <TableHead className="text-right w-[20%] h-11 text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit Price</TableHead>
                                            <TableHead className="text-right pr-4 sm:pr-6 w-[20%] h-11 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {displayItems.length > 0 ? (
                                            displayItems.map((item: any, i: number) => (
                                                <TableRow key={item.id || i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60 border-slate-100 dark:border-slate-800 transition-colors group">
                                                    <TableCell className="pl-4 sm:pl-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-medium text-slate-900 dark:text-slate-100 text-sm sm:text-base line-clamp-2 leading-relaxed">
                                                                {item.description}
                                                            </span>
                                                            {item.hsnSac && (
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 w-fit">
                                                                    HSN: {item.hsnSac}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center py-4">
                                                        <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 text-sm">
                                                            {item.quantity}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right py-4 font-medium text-slate-600 dark:text-slate-400 text-sm whitespace-nowrap">
                                                        ₹{Number(item.unitPrice).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-4 sm:pr-6 py-4 font-bold text-slate-900 dark:text-white text-sm whitespace-nowrap group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        ₹{Number(item.subtotal).toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                                                    <Package className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                                    <p>No items found for this order</p>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                                
                                {/* Totals Section */}
                                <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex flex-col sm:flex-row justify-end gap-6 sm:gap-12 pl-4 sm:pl-0">
                                        <div className="space-y-3 w-full sm:w-64 max-w-full">
                                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                                <span>Subtotal</span>
                                                <span className="font-medium text-slate-900 dark:text-slate-200">₹{Number(order.subtotal).toLocaleString()}</span>
                                            </div>
                                            
                                            {Number(order.discount) > 0 && (
                                                <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                                                    <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5" /> Discount</span>
                                                    <span className="font-medium">-₹{Number(order.discount).toLocaleString()}</span>
                                                </div>
                                            )}

                                            {Number(order.shippingCharges) > 0 && (
                                                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                                    <span>Shipping Charges</span>
                                                    <span className="font-medium text-slate-900 dark:text-slate-200">₹{Number(order.shippingCharges).toLocaleString()}</span>
                                                </div>
                                            )}

                                            {(Number(order.cgst) > 0 || Number(order.sgst) > 0 || Number(order.igst) > 0) && (
                                                <div className="border-t border-dashed border-slate-200 dark:border-slate-700 my-2 pt-2 space-y-2">
                                                    {Number(order.cgst) > 0 && (
                                                        <div className="flex justify-between text-sm text-slate-500">
                                                            <span>CGST (9%)</span>
                                                            <span>₹{Number(order.cgst).toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                    {Number(order.sgst) > 0 && (
                                                        <div className="flex justify-between text-sm text-slate-500">
                                                            <span>SGST (9%)</span>
                                                            <span>₹{Number(order.sgst).toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                    {Number(order.igst) > 0 && (
                                                        <div className="flex justify-between text-sm text-slate-500">
                                                            <span>IGST (18%)</span>
                                                            <span>₹{Number(order.igst).toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                                                <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
                                                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{Number(order.total).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Terms & Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {order.notes && (
                                <Card className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                                    <CardHeader className="p-4 sm:p-5 pb-2">
                                        <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            <FileText className="h-4 w-4" /> Notes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 sm:p-5 pt-2">
                                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                            {order.notes}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                            {order.termsAndConditions && (
                                <Card className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                                    <CardHeader className="p-4 sm:p-5 pb-2">
                                        <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            <List className="h-4 w-4" /> Terms & Conditions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 sm:p-5 pt-2">
                                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                            {order.termsAndConditions}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Client Card */}
                        <Card className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-900">
                            <CardHeader className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="flex items-center gap-2.5 text-sm sm:text-base text-slate-800 dark:text-slate-100">
                                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    Client Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-5 space-y-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-500 uppercase font-semibold text-[10px] tracking-wide">Customer</p>
                                    <p className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">{order.client.name}</p>
                                    <div className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer transition-colors" onClick={() => window.location.href=`mailto:${order.client.email}`}>
                                        <Mail className="h-3 w-3" />
                                        <span className="truncate">{order.client.email}</span>
                                    </div>
                                </div>
                                <Separator className="bg-slate-100 dark:bg-slate-800" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] uppercase font-semibold text-slate-500 mb-1">GSTIN</p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate" title={order.client.gstin || undefined}>{order.client.gstin || "N/A"}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Phone</p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{order.client.phone || "N/A"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Delivery Tracking Card */}
                        <Card className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-900">
                             <CardHeader className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="flex items-center gap-2.5 text-sm sm:text-base text-slate-800 dark:text-slate-100">
                                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                                        <Truck className="h-4 w-4" />
                                    </div>
                                    Delivery Tracking
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-5 space-y-5">
                                <div className="space-y-4">
                                    {/* Timeline Item 1 */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="h-2 w-2 rounded-full bg-blue-600 my-1.5"></div>
                                            <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-800 min-h-[30px]"></div>
                                        </div>
                                        <div className="pb-4">
                                            <p className="text-xs font-semibold uppercase text-slate-500">Order Placed</p>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                                                {format(new Date(order.orderDate), "PPP")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Timeline Item 2 */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={cn("h-2 w-2 rounded-full my-1.5", 
                                                order.expectedDeliveryDate ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"
                                            )}></div>
                                            <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-800 min-h-[30px]"></div>
                                        </div>
                                        <div className="pb-4">
                                            <p className="text-xs font-semibold uppercase text-slate-500">Expected Delivery</p>
                                            {order.expectedDeliveryDate ? (
                                                <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                                                    {format(new Date(order.expectedDeliveryDate), "PPP")}
                                                </p>
                                            ) : (
                                                <p className="text-sm italic text-slate-400 mt-0.5">Not scheduled</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timeline Item 3 (Final) */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={cn("h-2 w-2 rounded-full my-1.5", 
                                                order.status === "fulfilled" ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                                            )}></div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase text-slate-500">Actual Delivery</p>
                                            {order.status === "fulfilled" && order.actualDeliveryDate ? (
                                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                                    {format(new Date(order.actualDeliveryDate), "PPP")}
                                                </p>
                                            ) : (
                                                <p className="text-sm italic text-slate-400 mt-0.5">
                                                    {order.status === "fulfilled" ? "Delivered" : "Pending delivery"}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-xs font-bold text-slate-900 dark:text-slate-200 mb-2">Current Status</p>
                                    <div className={cn("p-3 rounded-lg border flex items-center gap-3", 
                                        order.status === "draft" ? "bg-slate-50 border-slate-200 text-slate-600" :
                                        order.status === "confirmed" ? "bg-blue-50 border-blue-200 text-blue-700" :
                                        order.status === "fulfilled" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                                        "bg-red-50 border-red-200 text-red-700"
                                    )}>
                                        {order.status === "draft" && <Clock className="h-5 w-5" />}
                                        {order.status === "confirmed" && <Truck className="h-5 w-5" />}
                                        {order.status === "fulfilled" && <CheckCircle className="h-5 w-5" />}
                                        {order.status === "cancelled" && <XCircle className="h-5 w-5" />}
                                        
                                        <div>
                                            <p className="text-sm font-bold capitalize">{order.status}</p>
                                            <p className="text-xs opacity-80">
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

                        {/* Order Metadata */}
                         <Card className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-900">
                            <CardHeader className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="flex items-center gap-2.5 text-sm sm:text-base text-slate-800 dark:text-slate-100">
                                    <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    Reference Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-5 space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Source Quote</span>
                                    <Button variant="link" onClick={() => setLocation(`/quotes/${order.quoteId}`)} className="h-auto p-0 font-bold text-blue-600">
                                        {order.quote.quoteNumber} <ArrowLeft className="h-3 w-3 ml-1 rotate-180" />
                                    </Button>
                                </div>
                                <Separator className="bg-slate-100 dark:bg-slate-800" />
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Created By</span>
                                    <span className="font-medium text-slate-900 dark:text-white px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs">{order.createdByName}</span>
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
                        <Button onClick={handleFulfill} className="bg-emerald-600 hover:bg-emerald-700">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm Fulfillment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
