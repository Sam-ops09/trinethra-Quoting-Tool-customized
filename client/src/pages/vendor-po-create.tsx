import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2, ArrowLeft, Home, ChevronRight, FileText, Edit } from "lucide-react";
import { ProductPicker } from "@/components/ProductPicker";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";

// Types matching the backend API expectations
interface VendorPoCreatePayload {
    vendorId: string;
    expectedDeliveryDate?: string;
    subtotal: string;
    discount: string;
    cgst: string;
    sgst: string;
    igst: string;
    shippingCharges: string;
    total: string;
    currency?: string;
    notes?: string;
    termsAndConditions?: string;
    items: { 
        productId?: string | null;
        description: string; 
        quantity: number; 
        unitPrice: number; 
        subtotal: number;
    }[];
}

const vendorPoFormSchema = z.object({
    vendorId: z.string().min(1, "Vendor is required"),
    expectedDeliveryDate: z.string().optional(),
    currency: z.string().default("INR"),
    subtotal: z.number().default(0),
    discount: z.coerce.number().min(0, "Discount must be positive"),
    cgst: z.coerce.number().min(0, "CGST must be positive"),
    sgst: z.coerce.number().min(0, "SGST must be positive"),
    igst: z.coerce.number().min(0, "IGST must be positive"),
    shippingCharges: z.coerce.number().min(0, "Shipping charges must be positive"),
    notes: z.string().optional(),
    termsAndConditions: z.string().optional(),
    items: z.array(
        z.object({
            productId: z.string().nullable().optional(),
            description: z.string().min(1, "Description is required"),
            quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
            unitPrice: z.coerce.number().min(0, "Unit price must be positive"),
        })
    ).min(1, "At least one item is required"),
});

type Vendor = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    contactPerson?: string;
};

export default function VendorPoCreate() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const { user } = useAuth();

    const { data: vendors, isLoading: isLoadingVendors } = useQuery<Vendor[]>({
        queryKey: ["/api/vendors"],
    });

    const form = useForm<z.infer<typeof vendorPoFormSchema>>({
        resolver: zodResolver(vendorPoFormSchema),
        defaultValues: {
            vendorId: "",
            expectedDeliveryDate: "",
            currency: "INR",
            discount: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            shippingCharges: 0,
            notes: "",
            termsAndConditions: "",
            items: [{ productId: null, description: "", quantity: 1, unitPrice: 0 }],
        },
    });

    // Check for items passed via query search params (e.g. from Invoice Edit)
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const itemsParam = searchParams.get("items");
        
        if (itemsParam) {
            try {
                const parsedItems = JSON.parse(decodeURIComponent(itemsParam));
                if (Array.isArray(parsedItems) && parsedItems.length > 0) {
                    const formItems = parsedItems.map((item: any) => ({
                         productId: item.productId || null,
                         description: item.description || "",
                         quantity: Number(item.quantity) || 1,
                         unitPrice: Number(item.unitPrice) || 0,
                    }));
                    
                    // Allow React Hook Form to register the items
                    setTimeout(() => {
                        form.setValue("items", formItems);
                    }, 0);
                    
                    toast({
                       title: "Items Pre-filled",
                       description: "Vendor PO items have been populated from your selection.",
                    });
                }
            } catch (e) {
                console.error("Failed to parse items param", e);
            }
        }
    }, []);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    // Calculations
    const items = form.watch("items");
    const currency = form.watch("currency");
    const discount = form.watch("discount"); // Percentage
    const cgst = form.watch("cgst");
    const sgst = form.watch("sgst");
    const igst = form.watch("igst");
    const shippingCharges = form.watch("shippingCharges");

    const subtotal = items.reduce((sum, item) => {
        return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    }, 0);

    const discountAmount = (subtotal * (Number(discount) || 0)) / 100;
    const taxableAmount = subtotal - discountAmount;
    const cgstAmount = (taxableAmount * (Number(cgst) || 0)) / 100;
    const sgstAmount = (taxableAmount * (Number(sgst) || 0)) / 100;
    const igstAmount = (taxableAmount * (Number(igst) || 0)) / 100;
    const total = taxableAmount + cgstAmount + sgstAmount + igstAmount + (Number(shippingCharges) || 0);

    const createMutation = useMutation({
        mutationFn: async (values: z.infer<typeof vendorPoFormSchema>) => {
            const payload: VendorPoCreatePayload = {
                vendorId: values.vendorId,
                expectedDeliveryDate: values.expectedDeliveryDate || undefined,
                subtotal: subtotal.toString(),
                discount: discountAmount.toString(),
                cgst: cgstAmount.toString(),
                sgst: sgstAmount.toString(),
                igst: igstAmount.toString(),
                shippingCharges: values.shippingCharges.toString(),
                total: total.toString(),
                currency: values.currency,
                notes: values.notes,
                termsAndConditions: values.termsAndConditions,
                items: values.items.map(item => ({
                    productId: item.productId || null,
                    description: item.description,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice),
                    subtotal: Number(item.quantity) * Number(item.unitPrice)
                }))
            };
            
            const res = await apiRequest("POST", "/api/vendor-pos", payload);
            return await res.json();
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ["/api/vendor-pos"] });
             toast({
                 title: "Success",
                 description: "Vendor Purchase Order created successfully",
             });
             setLocation("/vendor-pos");
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to create Vendor PO",
                variant: "destructive",
            });
        }
    });

    const onSubmit = (values: z.infer<typeof vendorPoFormSchema>) => {
        createMutation.mutate(values);
    };

    if (isLoadingVendors) {
         return (
             <div className="flex items-center justify-center min-h-screen">
                 <Loader2 className="h-8 w-8 animate-spin" />
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
                        onClick={() => setLocation("/vendor-pos")}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                    >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Vendor POs</span>
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                        <Edit className="h-3.5 w-3.5" />
                        <span>Create PO</span>
                    </span>
                </nav>

                {/* Header */}
                <Card className="border border-border/70 bg-card/95 backdrop-blur-sm shadow-sm">
                    <CardContent className="p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setLocation("/vendor-pos")}
                                    className="shrink-0 hover:bg-primary/10 hover:text-primary h-8 w-8 sm:h-9 sm:w-9"
                                >
                                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                                </Button>
                                <div className="min-w-0 flex-1 space-y-1">
                                    <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                                        Create Vendor Purchase Order
                                    </h1>
                                     {user && (
                                        <p className="text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans']">
                                            Prepared by: {user.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Vendor Details */}
                                <Card>
                                    <CardHeader className="border-b px-6 py-4">
                                        <CardTitle className="text-base">Vendor Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="vendorId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Select Vendor *</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select a vendor" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {vendors?.map((vendor) => (
                                                                    <SelectItem key={vendor.id} value={vendor.id}>
                                                                        {vendor.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="expectedDeliveryDate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Expected Delivery Date</FormLabel>
                                                        <FormControl>
                                                            <Input type="date" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="currency"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Currency</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select currency" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="INR">INR (₹)</SelectItem>
                                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                                                <SelectItem value="AUD">AUD ($)</SelectItem>
                                                                <SelectItem value="CAD">CAD ($)</SelectItem>
                                                                <SelectItem value="SGD">SGD ($)</SelectItem>
                                                                <SelectItem value="AED">AED (د.إ)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Line Items */}
                                <Card>
                                    <CardHeader className="border-b px-6 py-4 flex flex-row items-center justify-between">
                                        <CardTitle className="text-base">Line Items</CardTitle>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => append({ productId: null, description: "", quantity: 1, unitPrice: 0 })}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Item
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                         <div className="overflow-x-auto">
                                            <table className="w-full min-w-[900px] text-sm text-left">
                                                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                                    <tr>
                                                        <th className="px-6 py-3 font-medium" style={{minWidth: '200px'}}>Product</th>
                                                        <th className="px-6 py-3 font-medium">Description</th>
                                                        <th className="px-6 py-3 font-medium w-32">Qty</th>
                                                        <th className="px-6 py-3 font-medium w-40">Unit Price</th>
                                                        <th className="px-6 py-3 font-medium w-40 text-right">Total</th>
                                                        <th className="px-6 py-3 font-medium w-16"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {fields.map((field, index) => (
                                                        <tr key={field.id} className="group hover:bg-muted/50">
                                                            <td className="px-6 py-4" style={{minWidth: '200px'}}>
                                                                <ProductPicker
                                                                    value={form.watch(`items.${index}.productId`)}
                                                                    showStock={true}
                                                                    placeholder="Select product..."
                                                                    onSelect={(product) => {
                                                                        if (product) {
                                                                            form.setValue(`items.${index}.productId`, product.id);
                                                                            form.setValue(`items.${index}.description`, product.name + (product.description ? `\n${product.description}` : ''));
                                                                            if (product.basePrice) {
                                                                                form.setValue(`items.${index}.unitPrice`, parseFloat(product.basePrice));
                                                                            }
                                                                        } else {
                                                                            form.setValue(`items.${index}.productId`, null);
                                                                        }
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`items.${index}.description`}
                                                                    render={({ field }) => (
                                                                        <Input {...field} placeholder="Item description" className="bg-transparent border-0 focus-visible:ring-0 px-0 h-auto" />
                                                                    )}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`items.${index}.quantity`}
                                                                    render={({ field }) => (
                                                                        <Input type="number" {...field} min="1" className="h-8" />
                                                                    )}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`items.${index}.unitPrice`}
                                                                    render={({ field }) => (
                                                                        <Input type="number" {...field} min="0" className="h-8" />
                                                                    )}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 text-right font-medium">
                                                                {formatCurrency(
                                                                    (Number(form.watch(`items.${index}.quantity`)) || 0) * (Number(form.watch(`items.${index}.unitPrice`)) || 0),
                                                                    currency
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => remove(index)}
                                                                    className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="border-b px-6 py-4">
                                        <CardTitle className="text-base">Additional Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="notes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Notes</FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} placeholder="Internal notes..." />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="termsAndConditions"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Terms & Conditions</FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} placeholder="Specific terms for this order..." />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card>
                                    <CardHeader className="border-b px-6 py-4">
                                        <CardTitle className="text-base">Order Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>{formatCurrency(subtotal, currency)}</span>
                                        </div>
                                        
                                        <Separator />
                                        
                                        <div className="space-y-3">
                                            <FormField
                                                control={form.control}
                                                name="discount"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center justify-between space-y-0">
                                                        <FormLabel className="text-sm font-normal text-muted-foreground">Discount (%)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} className="w-20 h-8 text-right" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="cgst"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center justify-between space-y-0">
                                                        <FormLabel className="text-sm font-normal text-muted-foreground">CGST (%)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} className="w-20 h-8 text-right" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="sgst"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center justify-between space-y-0">
                                                        <FormLabel className="text-sm font-normal text-muted-foreground">SGST (%)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} className="w-20 h-8 text-right" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="igst"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center justify-between space-y-0">
                                                        <FormLabel className="text-sm font-normal text-muted-foreground">IGST (%)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} className="w-20 h-8 text-right" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="shippingCharges"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center justify-between space-y-0">
                                                        <FormLabel className="text-sm font-normal text-muted-foreground">Shipping</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} className="w-20 h-8 text-right" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <Separator />

                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total</span>
                                            <span>{formatCurrency(total, currency)}</span>
                                        </div>

                                        <Button 
                                            type="submit" 
                                            className="w-full"
                                            disabled={createMutation.isPending}
                                        >
                                            {createMutation.isPending && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Create Purchase Order
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
