import { useState, useEffect } from "react";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, X, Plus, Trash2, Calendar, Home, ChevronRight, Package, DollarSign, FileText, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SalesOrder, SalesOrderItem, Client } from "@shared/schema";
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
            <div className="min-h-screen bg-background">
                <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-96 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground">Order not found</h1>
                    <Button onClick={() => setLocation("/sales-orders")} className="mt-4">Back to Orders</Button>
                </div>
            </div>
        );
    }

    if (order.status === "fulfilled" || order.status === "cancelled") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground">Cannot Edit</h1>
                    <p className="text-muted-foreground mt-2">
                        {order.status === "fulfilled" ? "Fulfilled" : "Cancelled"} orders cannot be edited.
                    </p>
                    <Button onClick={() => setLocation(`/sales-orders/${id}`)} className="mt-4">Back to Order</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full">
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
                        onClick={() => setLocation("/sales-orders")}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                    >
                        <Package className="h-3.5 w-3.5" />
                        <span>Sales Orders</span>
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit Order</span>
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
                                    onClick={() => setLocation(`/sales-orders/${id}`)}
                                    className="shrink-0 hover:bg-primary/10 hover:text-primary h-8 w-8 sm:h-9 sm:w-9"
                                >
                                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                                </Button>
                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                                            Edit Order: {order.orderNumber}
                                        </h1>
                                    </div>
                                    <p className="text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans']">
                                        Modify order details and line items
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* LINE ITEMS */}
                    <Card className="border bg-card shadow-sm overflow-hidden">
                        <CardHeader className="border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                            <div className="flex items-center justify-between gap-2 sm:gap-3">
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
                                <Button 
                                    type="button" 
                                    onClick={addItem} 
                                    size="sm" 
                                    className="flex-1 sm:flex-initial justify-center gap-2 text-xs sm:text-sm"
                                >
                                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <span className="hidden xs:inline">Add Item</span>
                                    <span className="xs:hidden">Add</span>
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            {/* MOBILE STACKED VIEW */}
                            <div className="sm:hidden px-3 py-3 space-y-3">
                                {items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="rounded-xl border bg-muted/40 px-3 py-3 space-y-2"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[11px] text-muted-foreground font-['Open_Sans']">
                                                #{index + 1}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeItem(index)}
                                                className="h-6 text-[10px] px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            <div>
                                                <Label className="text-[10px] text-muted-foreground uppercase">Description</Label>
                                                <Input
                                                    value={item.description}
                                                    onChange={(e) => updateItem(index, "description", e.target.value)}
                                                    placeholder="Item description"
                                                    required
                                                    className="mt-1 text-xs"
                                                />
                                            </div>

                                            {/* HSN/SAC */}
                                            <div>
                                                <Label className="text-[10px] text-muted-foreground uppercase">HSN/SAC</Label>
                                                <Input
                                                    value={item.hsnSac || ""}
                                                    onChange={(e) => updateItem(index, "hsnSac", e.target.value)}
                                                    placeholder="HSN/SAC code"
                                                    className="mt-1 text-xs"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label className="text-[10px] text-muted-foreground uppercase">Quantity</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                                                        min="1"
                                                        required
                                                        className="mt-1 text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] text-muted-foreground uppercase">Unit Price</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                                                        min="0"
                                                        step="0.01"
                                                        required
                                                        className="mt-1 text-xs"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-border/60">
                                                <span className="text-[10px] text-muted-foreground font-['Open_Sans']">
                                                    Subtotal
                                                </span>
                                                <p className="text-sm font-bold text-primary">
                                                    ₹{Number(item.subtotal).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
                                            <th className="text-center font-semibold text-muted-foreground uppercase tracking-wide px-4 md:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs">
                                                HSN/SAC
                                            </th>
                                            <th className="text-right font-semibold text-muted-foreground uppercase tracking-wide px-4 md:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs">
                                                Qty
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
                                        {items.map((item, index) => (
                                            <tr
                                                key={index}
                                                className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                                            >
                                                <td className="px-4 md:px-6 py-2.5 sm:py-3 text-[11px] sm:text-sm text-muted-foreground">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 md:px-6 py-2.5 sm:py-3 align-top">
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, "description", e.target.value)}
                                                        placeholder="Item description"
                                                        required
                                                        className="bg-transparent border-0 focus-visible:ring-1 text-xs sm:text-sm"
                                                    />
                                                </td>
                                                <td className="px-4 md:px-6 py-2.5 sm:py-3 text-center">
                                                    <Input
                                                        value={item.hsnSac || ""}
                                                        onChange={(e) => updateItem(index, "hsnSac", e.target.value)}
                                                        placeholder="HSN/SAC"
                                                        className="bg-transparent border-0 focus-visible:ring-1 text-center text-xs sm:text-sm max-w-[120px] mx-auto"
                                                    />
                                                </td>
                                                <td className="px-4 md:px-6 py-2.5 sm:py-3 text-right">
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                                                        min="1"
                                                        required
                                                        className="bg-transparent border-0 focus-visible:ring-1 text-right text-xs sm:text-sm max-w-[80px] ml-auto"
                                                    />
                                                </td>
                                                <td className="px-4 md:px-6 py-2.5 sm:py-3 text-right">
                                                    <Input
                                                        type="number"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                                                        min="0"
                                                        step="0.01"
                                                        required
                                                        className="bg-transparent border-0 focus-visible:ring-1 text-right text-xs sm:text-sm max-w-[100px] ml-auto"
                                                    />
                                                </td>
                                                <td className="px-4 md:px-6 py-2.5 sm:py-3 text-right text-[11px] sm:text-sm font-semibold text-primary">
                                                    ₹{Number(item.subtotal).toLocaleString()}
                                                </td>
                                                <td className="px-4 md:px-6 py-2.5 sm:py-3 text-center">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeItem(index)}
                                                        className="h-7 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* FOOTER ROW */}
                            <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans'] bg-muted/40">
                                <span>{items.length} line items</span>
                                <span className="inline-flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    Subtotal:{" "}
                                    <span className="font-semibold text-foreground">
                                        ₹{items.reduce((sum, item) => sum + Number(item.subtotal), 0).toLocaleString()}
                                    </span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* FINANCIALS & SUMMARY */}
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                        {/* LEFT COLUMN - Financials */}
                        <div className="space-y-3 lg:col-span-2 min-w-0">
                            <Card className="border bg-card shadow-sm">
                                <CardHeader className="border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="p-1.5 sm:p-2 rounded-md bg-primary/10 text-primary">
                                            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm sm:text-lg">Financials & Taxes</CardTitle>
                                            <p className="hidden sm:block text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans']">
                                                Discount, taxes, and shipping
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Discount (%)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={formData.discount}
                                                onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Shipping Charges (₹)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={formData.shippingCharges}
                                                onChange={(e) => setFormData({ ...formData, shippingCharges: Number(e.target.value) })}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">CGST (%)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={formData.cgst}
                                                onChange={(e) => setFormData({ ...formData, cgst: Number(e.target.value) })}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">SGST (%)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={formData.sgst}
                                                onChange={(e) => setFormData({ ...formData, sgst: Number(e.target.value) })}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">IGST (%)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={formData.igst}
                                                onChange={(e) => setFormData({ ...formData, igst: Number(e.target.value) })}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ORDER DETAILS */}
                            <Card className="border bg-card shadow-sm">
                                <CardHeader className="border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="p-1.5 sm:p-2 rounded-md bg-primary/10 text-primary">
                                            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm sm:text-lg">Order Details</CardTitle>
                                            <p className="hidden sm:block text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans']">
                                                Additional information
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="expectedDeliveryDate" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Expected Delivery Date</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="expectedDeliveryDate"
                                                type="date"
                                                value={formData.expectedDeliveryDate}
                                                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                                                className="pl-10 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="notes" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            rows={4}
                                            placeholder="Add any notes about this order..."
                                            className="resize-none text-sm"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="terms" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Terms & Conditions</Label>
                                        <Textarea
                                            id="terms"
                                            value={formData.termsAndConditions}
                                            onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                                            rows={4}
                                            placeholder="Enter terms and conditions..."
                                            className="resize-none text-sm"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT COLUMN - Summary */}
                        <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-6 min-w-0">
                            <Card className="border bg-card shadow-sm">
                                <CardHeader className="border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="p-1.5 sm:p-2 rounded-md bg-primary/10 text-primary">
                                            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <CardTitle className="text-sm sm:text-lg">
                                                Order Summary
                                            </CardTitle>
                                            <p className="text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans'] truncate">
                                                Financial overview
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4">
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
                                                <div className="space-y-1.5 sm:space-y-2.5 font-['Open_Sans'] text-[11px] sm:text-sm">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-muted-foreground">Subtotal</span>
                                                        <span className="font-semibold">
                                                            ₹{subtotal.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    {discountAmount > 0 && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-muted-foreground">Discount</span>
                                                            <span className="font-semibold text-success">
                                                                -₹{discountAmount.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {cgstAmount > 0 && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-muted-foreground">CGST</span>
                                                            <span className="font-semibold">
                                                                ₹{cgstAmount.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {sgstAmount > 0 && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-muted-foreground">SGST</span>
                                                            <span className="font-semibold">
                                                                ₹{sgstAmount.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {igstAmount > 0 && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-muted-foreground">IGST</span>
                                                            <span className="font-semibold">
                                                                ₹{igstAmount.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {formData.shippingCharges > 0 && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-muted-foreground">Shipping</span>
                                                            <span className="font-semibold">
                                                                ₹{Number(formData.shippingCharges).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <Separator className="bg-primary/10" />

                                                <div className="rounded-xl border-2 border-primary/30 bg-primary/5 px-3 sm:px-4 py-3 sm:py-4">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[11px] sm:text-sm font-semibold text-muted-foreground">
                                                            Total Amount
                                                        </span>
                                                        <span className="text-lg sm:text-2xl font-bold text-primary">
                                                            ₹{total.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* ACTIONS */}
                                                <div className="flex flex-col gap-2 pt-2">
                                                    <Button
                                                        type="submit"
                                                        disabled={updateMutation.isPending || items.length === 0}
                                                        className="w-full justify-center gap-2 text-xs sm:text-sm"
                                                    >
                                                        <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setLocation(`/sales-orders/${id}`)}
                                                        className="w-full justify-center gap-2 text-xs sm:text-sm"
                                                    >
                                                        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
