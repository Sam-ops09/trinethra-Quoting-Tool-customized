import { UseFormReturn, useFieldArray } from "react-hook-form";
import { useRef, useState } from "react";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
    Plus, 
    Trash2, 
    Upload, 
    Loader2, 
    DollarSign, 
    Package, 
    AlertCircle,
    FileSpreadsheet,
    Download
} from "lucide-react";
import { ProductPicker } from "@/components/ProductPicker";
import { formatCurrency } from "@/lib/currency";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface QuoteLineItemsProps {
    form: UseFormReturn<any>;
}

export function QuoteLineItems({ form }: QuoteLineItemsProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const items = form.watch("items");
    const currency = form.watch("currency");

    const subtotal = items.reduce(
        (sum: number, item: any) => sum + (item.quantity * item.unitPrice),
        0
    );

    // Excel Import Logic
    const parseExcelMutation = useMutation({
        mutationFn: async (fileContent: string) => {
             const res = await apiRequest("POST", "/api/quotes/parse-excel", { fileContent });
             return await res.json();
        },
        onSuccess: (data: any[]) => {
             if (data && data.length > 0) {
                 const currentItems = form.getValues("items");
                 // If only one item exists and it's empty/default, clear it
                 if (currentItems.length === 1 && !currentItems[0].description && currentItems[0].quantity === 1 && currentItems[0].unitPrice === 0) {
                    remove(0);
                 }
                 
                 data.forEach((item) => {
                    append({
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        hsnSac: item.hsnSac || ""
                    });
                 });
                 
                 toast({ title: "Import Successful", description: `${data.length} items imported from Excel.` });
             } else {
                 toast({ title: "No items found", description: "The Excel file didn't contain valid items.", variant: "destructive" });
             }
             if (fileInputRef.current) fileInputRef.current.value = "";
        },
        onError: (error: any) => {
             toast({ title: "Import Failed", description: error.message || "Failed to parse Excel file", variant: "destructive" });
             if (fileInputRef.current) fileInputRef.current.value = "";
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.match(/\.(xlsx|xls)$/)) {
            toast({ title: "Invalid file type", description: "Please upload an Excel file (.xlsx, .xls)", variant: "destructive" });
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (evt) => {
             const base64String = evt.target?.result?.toString().split(',')[1];
             if (base64String) {
                 parseExcelMutation.mutate(base64String);
             }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold tracking-tight">Line Items</h2>
                    <p className="text-muted-foreground">
                        Add products and services to your quote.
                    </p>
                </div>
                
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={parseExcelMutation.isPending}
                    >
                        {parseExcelMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <FileSpreadsheet className="h-4 w-4 text-green-600" />
                        )}
                        Import from Excel
                    </Button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept=".xlsx, .xls"
                    />
                </div>
            </div>

            {fields.length === 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No items needed</AlertTitle>
                    <AlertDescription>
                        You must add at least one line item to proceed.
                    </AlertDescription>
                </Alert>
            )}

            <div className="space-y-4">
                {fields.map((fieldItem, index) => (
                    <Card key={fieldItem.id} className="overflow-hidden border-border/60 hover:border-border transition-colors">
                        <div className="p-1 bg-muted/30 border-b flex justify-between items-center px-4">
                            <span className="text-xs font-medium text-muted-foreground">Item #{index + 1}</span>
                            {fields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => remove(index)}
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                        <CardContent className="p-4 grid gap-4 grid-cols-1 lg:grid-cols-12 items-start">
                            {/* Product & Description - Takes up more space */}
                            <div className="lg:col-span-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase text-muted-foreground">Product / Service</label>
                                    <ProductPicker
                                        value={form.watch(`items.${index}.productId`)}
                                        showStock={true}
                                        placeholder="Search products..."
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
                                </div>
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.description`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    placeholder="Item description..."
                                                    className="min-h-[80px] text-sm resize-y"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Numbers - Takes up less space */}
                            <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.hsnSac`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase text-muted-foreground">HSN/SAC</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Code" className="font-mono text-sm" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`items.${index}.quantity`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase text-muted-foreground text-right block">Qty</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    type="number" 
                                                    min="1"
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                    className="font-mono text-sm text-right"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`items.${index}.unitPrice`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase text-muted-foreground text-right block">Price</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    type="number" 
                                                    min="0"
                                                    step="0.01"
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                    className="font-mono text-sm text-right"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase text-muted-foreground text-right block">Total</label>
                                    <div className="h-10 px-3 py-2 bg-muted/30 rounded-md text-right font-mono text-sm font-medium border">
                                        {formatCurrency(items[index].quantity * items[index].unitPrice, currency)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({
                        productId: null,
                        description: "",
                        quantity: 1,
                        unitPrice: 0,
                        hsnSac: "",
                    })}
                    className="w-full border-dashed h-12 gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Another Item
                </Button>
            </div>
            
            <div className="flex justify-end p-4 bg-muted/20 rounded-lg border">
                 <div className="text-right">
                     <span className="text-sm text-muted-foreground block mb-1">Total Items Value</span>
                     <span className="text-2xl font-bold text-primary">{formatCurrency(subtotal, currency)}</span>
                 </div>
            </div>
        </div>
    );
}
