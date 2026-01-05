import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, X, Plus, Trash2, Calendar } from "lucide-react";
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation(`/sales-orders/${id}`)}
                        className="rounded-full"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Edit Order: {order.orderNumber}
                        </h1>
                        <p className="text-sm text-slate-500">
                            Modify order details and line items
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Line Items */}
                    <Card className="rounded-2xl border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Line Items</span>
                                <Button type="button" onClick={addItem} size="sm">
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Item
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40%]">Description</TableHead>
                                        <TableHead className="w-[15%]">Quantity</TableHead>
                                        <TableHead className="w-[20%]">Unit Price</TableHead>
                                        <TableHead className="w-[20%]">Subtotal</TableHead>
                                        <TableHead className="w-[5%]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Input
                                                    value={item.description}
                                                    onChange={(e) => updateItem(index, "description", e.target.value)}
                                                    placeholder="Item description"
                                                    required
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                                                    min="1"
                                                    required
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
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={`₹${Number(item.subtotal).toLocaleString()}`}
                                                    disabled
                                                    className="bg-slate-50 dark:bg-slate-900"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeItem(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            
                            {/* Total */}
                            <div className="mt-4 flex justify-end">
                                <div className="text-right">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        ₹{items.reduce((sum, item) => sum + Number(item.subtotal), 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financials */}
                    <Card className="rounded-2xl border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Financials & Taxes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label>Discount (%)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label>Shipping Charges (₹)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.shippingCharges}
                                        onChange={(e) => setFormData({ ...formData, shippingCharges: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label>CGST (%)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.cgst}
                                        onChange={(e) => setFormData({ ...formData, cgst: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label>SGST (%)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.sgst}
                                        onChange={(e) => setFormData({ ...formData, sgst: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label>IGST (%)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.igst}
                                        onChange={(e) => setFormData({ ...formData, igst: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            
                            {/* Summary Calculation Display */}
                            <div className="mt-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-2 text-right">
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
                                            <p className="text-sm text-slate-500">Subtotal: ₹{subtotal.toFixed(2)}</p>
                                            <p className="text-sm text-slate-500">Discount: -₹{discountAmount.toFixed(2)}</p>
                                            <p className="text-sm text-slate-500">Tax Base: ₹{taxBase.toFixed(2)}</p>
                                            <p className="text-sm text-slate-500">CGST + SGST + IGST: ₹{(cgstAmount + sgstAmount + igstAmount).toFixed(2)}</p>
                                            <p className="text-sm text-slate-500">Shipping: ₹{Number(formData.shippingCharges).toFixed(2)}</p>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white mt-2 pt-2 border-t">
                                                Total: ₹{total.toFixed(2)}
                                            </p>
                                        </>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Order Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="expectedDeliveryDate"
                                        type="date"
                                        value={formData.expectedDeliveryDate}
                                        onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={4}
                                    placeholder="Add any notes about this order..."
                                />
                            </div>

                            <div>
                                <Label htmlFor="terms">Terms & Conditions</Label>
                                <Textarea
                                    id="terms"
                                    value={formData.termsAndConditions}
                                    onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                                    rows={4}
                                    placeholder="Enter terms and conditions..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setLocation(`/sales-orders/${id}`)}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending || items.length === 0}
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
