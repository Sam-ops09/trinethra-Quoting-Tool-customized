import { useState, useEffect } from "react";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, X, Plus, Trash2, Calendar, Home, ChevronRight, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SalesOrder, SalesOrderItem, Client } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export default function SalesOrderEdit() {
    const { id } = useParams();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const isEnabled = useFeatureFlag("sales_orders_module");
    
    // Add feature flag check
    if (isEnabled === false) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
                <h1 className="text-2xl font-bold">Feature Disabled</h1>
                <p className="text-muted-foreground">The Sales Orders module is currently disabled.</p>
                <Button onClick={() => setLocation("/")}>Go Home</Button>
            </div>
        );
    }

    const { data: order, isLoading } = useQuery<SalesOrder & { 
        client: Client; 
        items: SalesOrderItem[];
        quote?: any;
    }>({
        queryKey: [`/api/sales-orders/${id}`],
    });

    const [formData, setFormData] = useState({
        notes: "",
        termsAndConditions: "",
        expectedDeliveryDate: "",
        discount: 0,
        cgst: 9,
        sgst: 9,
        igst: 0,
        shippingCharges: 0,
    });

    const [items, setItems] = useState<Array<{
        id?: string;
        description: string;
        quantity: number;
        unitPrice: string;
        subtotal: string;
        hsnSac?: string;
    }>>([]);

    // Initialize form when order loads
    useEffect(() => {
        if (order) {
            // Use order items if available, otherwise fall back to quote items
            const displayItems = (order.items && order.items.length > 0) 
                 ? order.items 
                 : (order.quote?.items || []);
            
            // Calculate initial percentages based on amounts if needed
            const subtotal = Number(order.subtotal || 0);
            const discountAmount = Number(order.discount || 0);
            const taxBase = subtotal - discountAmount;
            
            const cgstPercent = taxBase > 0 ? (Number(order.cgst || 0) / taxBase) * 100 : 9;
            const sgstPercent = taxBase > 0 ? (Number(order.sgst || 0) / taxBase) * 100 : 9;
            const igstPercent = taxBase > 0 ? (Number(order.igst || 0) / taxBase) * 100 : 0;
            const discountPercent = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0;

            setFormData({
                notes: order.notes || "",
                termsAndConditions: order.termsAndConditions || "",
                expectedDeliveryDate: order.expectedDeliveryDate 
                    ? new Date(order.expectedDeliveryDate).toISOString().split('T')[0] 
                    : "",
                discount: discountPercent,
                cgst: cgstPercent,
                sgst: sgstPercent,
                igst: igstPercent,
                shippingCharges: Number(order.shippingCharges || 0),
            });

            setItems(displayItems.map((item: any) => ({
                id: item.id,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal,
                hsnSac: item.hsnSac,
            })));
        }
    }, [order]);

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("PATCH", `/api/sales-orders/${id}`, data);
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/sales-orders/${id}`] });
            queryClient.invalidateQueries({ queryKey: ["/api/sales-orders"] });
            toast({
                title: "Order Updated",
                description: "Sales order has been updated successfully.",
            });
            setLocation(`/sales-orders/${id}`);
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update order",
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Calculate totals
        // Calculate final totals for submission
        const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
        const discountAmount = (subtotal * formData.discount) / 100;
        const taxBase = subtotal - discountAmount;
        const cgstAmount = (taxBase * formData.cgst) / 100;
        const sgstAmount = (taxBase * formData.sgst) / 100;
        const igstAmount = (taxBase * formData.igst) / 100;
        const total = taxBase + cgstAmount + sgstAmount + igstAmount + Number(formData.shippingCharges);
        
        updateMutation.mutate({
            ...formData,
            subtotal: subtotal.toFixed(2),
            discount: discountAmount.toFixed(2),
            cgst: cgstAmount.toFixed(2),
            sgst: sgstAmount.toFixed(2),
            igst: igstAmount.toFixed(2),
            shippingCharges: formData.shippingCharges.toString(),
            total: total.toFixed(2),
            items: items.map((item, index) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal,
                hsnSac: item.hsnSac,
                sortOrder: index,
            })),
        });
    };

    const addItem = () => {
        setItems([...items, {
            description: "",
            quantity: 1,
            unitPrice: "0",
            subtotal: "0",
            hsnSac: "",
        }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        
        // Recalculate subtotal if quantity or price changes
        if (field === "quantity" || field === "unitPrice") {
            const qty = field === "quantity" ? Number(value) : newItems[index].quantity;
            const price = field === "unitPrice" ? Number(value) : Number(newItems[index].unitPrice);
            newItems[index].subtotal = (qty * price).toString();
        }
        
        setItems(newItems);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    <Skeleton className="h-12 w-48" />
                    <Skeleton className="h-96 w-full rounded-2xl" />
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

    if (order.status === "fulfilled" || order.status === "cancelled") {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cannot Edit</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        {order.status === "fulfilled" ? "Fulfilled" : "Cancelled"} orders cannot be edited.
                    </p>
                    <Button onClick={() => setLocation(`/sales-orders/${id}`)} className="mt-4">Back to Order</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 animate-in fade-in duration-500">
            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-fit">
                    <button
                        onClick={() => setLocation("/")}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <Home className="h-3.5 w-3.5" />
                        <span>Home</span>
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <button
                        onClick={() => setLocation("/sales-orders")}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <Package className="h-3.5 w-3.5" />
                        <span>Sales Orders</span>
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                        <span>Edit Order</span>
                    </span>
                </nav>

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation(`/sales-orders/${id}`)}
                        className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-500" />
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Edit Order: {order.orderNumber}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Modify order details and line items
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Line Items */}
                    <Card className="group relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm transition-all duration-300">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800/60">
                            <CardTitle className="flex items-center justify-between text-lg font-semibold text-slate-900 dark:text-white">
                                <span>Line Items</span>
                                <Button type="button" onClick={addItem} size="sm" className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200">
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Item
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                    <TableRow className="border-slate-100 dark:border-slate-800">
                                        <TableHead className="w-[40%] font-semibold text-xs uppercase tracking-wider text-slate-500">Description</TableHead>
                                        <TableHead className="w-[15%] font-semibold text-xs uppercase tracking-wider text-slate-500">Quantity</TableHead>
                                        <TableHead className="w-[20%] font-semibold text-xs uppercase tracking-wider text-slate-500">Unit Price</TableHead>
                                        <TableHead className="w-[20%] font-semibold text-xs uppercase tracking-wider text-slate-500">Subtotal</TableHead>
                                        <TableHead className="w-[5%]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item, index) => (
                                        <TableRow key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-800">
                                            <TableCell>
                                                <Input
                                                    value={item.description}
                                                    onChange={(e) => updateItem(index, "description", e.target.value)}
                                                    placeholder="Item description"
                                                    required
                                                    className="bg-transparent border-slate-200 dark:border-slate-700"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                                                    min="1"
                                                    required
                                                    className="bg-transparent border-slate-200 dark:border-slate-700"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.unitPrice}
                                                    onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                    className="bg-transparent border-slate-200 dark:border-slate-700"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={`₹${Number(item.subtotal).toLocaleString()}`}
                                                    disabled
                                                    className="bg-slate-50/50 dark:bg-slate-900/50 border-0"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeItem(index)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            
                            {/* Total */}
                            <div className="p-6 bg-slate-50/30 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total</p>
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        ₹{items.reduce((sum, item) => sum + Number(item.subtotal), 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financials */}
                    <Card className="group relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm transition-all duration-300">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800/60">
                            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Financials & Taxes</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Discount (%)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                                        className="bg-transparent border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Shipping Charges (₹)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.shippingCharges}
                                        onChange={(e) => setFormData({ ...formData, shippingCharges: Number(e.target.value) })}
                                        className="bg-transparent border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                            </div>
                            <Separator className="bg-slate-100 dark:bg-slate-800" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">CGST (%)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.cgst}
                                        onChange={(e) => setFormData({ ...formData, cgst: Number(e.target.value) })}
                                        className="bg-transparent border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">SGST (%)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.sgst}
                                        onChange={(e) => setFormData({ ...formData, sgst: Number(e.target.value) })}
                                        className="bg-transparent border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">IGST (%)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.igst}
                                        onChange={(e) => setFormData({ ...formData, igst: Number(e.target.value) })}
                                        className="bg-transparent border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                            </div>
                            
                            {/* Summary Calculation Display */}
                            <div className="bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-xl space-y-3 text-right border border-slate-100 dark:border-slate-800">
                                {(() => {
                                    const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
                                    const discountAmount = (subtotal * formData.discount) / 100;
                                    const taxBase = subtotal - discountAmount;
                                    const cgstAmount = (taxBase * formData.cgst) / 100;
                                    const sgstAmount = (taxBase * formData.sgst) / 100;
                                    const igstAmount = (taxBase * formData.igst) / 100;
                                    const total = taxBase + cgstAmount + sgstAmount + igstAmount + Number(formData.shippingCharges);
                                    
                                    return (
                                        <>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Subtotal: <span className="text-slate-900 dark:text-white ml-2">₹{subtotal.toFixed(2)}</span></p>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Discount: <span className="text-red-500 ml-2">-₹{discountAmount.toFixed(2)}</span></p>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tax Base: <span className="text-slate-900 dark:text-white ml-2">₹{taxBase.toFixed(2)}</span></p>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Tax: <span className="text-slate-900 dark:text-white ml-2">₹{(cgstAmount + sgstAmount + igstAmount).toFixed(2)}</span></p>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Shipping: <span className="text-slate-900 dark:text-white ml-2">₹{Number(formData.shippingCharges).toFixed(2)}</span></p>
                                            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 mt-2">
                                                <p className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-end gap-3">
                                                    Total: <span className="text-2xl">₹{total.toFixed(2)}</span>
                                                </p>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="group relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm transition-all duration-300">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800/60">
                            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Order Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="expectedDeliveryDate" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Expected Delivery Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="expectedDeliveryDate"
                                        type="date"
                                        value={formData.expectedDeliveryDate}
                                        onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                                        className="pl-10 bg-transparent border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={4}
                                    placeholder="Add any notes about this order..."
                                    className="bg-transparent border-slate-200 dark:border-slate-700 resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="terms" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Terms & Conditions</Label>
                                <Textarea
                                    id="terms"
                                    value={formData.termsAndConditions}
                                    onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                                    rows={4}
                                    placeholder="Enter terms and conditions..."
                                    className="bg-transparent border-slate-200 dark:border-slate-700 resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 sticky bottom-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setLocation(`/sales-orders/${id}`)}
                            className="hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending || items.length === 0}
                            className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {updateMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
