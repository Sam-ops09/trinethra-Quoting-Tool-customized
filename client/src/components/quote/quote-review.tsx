import { UseFormReturn } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/currency";
import { 
    Calculator, 
    CheckCircle2, 
    Receipt
} from "lucide-react";
import { useFeatureFlag } from "@/hooks/use-feature-flag";

interface TaxRate {
    id: string;
    region: string;
    taxType: string;
    sgstRate: string;
    cgstRate: string;
    igstRate: string;
    isActive: boolean;
}

interface QuoteReviewProps {
    form: UseFormReturn<any>;
    activeTaxRates: TaxRate[];
}

export function QuoteReview({ form, activeTaxRates }: QuoteReviewProps) {
    const items = form.watch("items");
    const currency = form.watch("currency");
    const discount = form.watch("discount");
    const cgst = form.watch("cgst");
    const sgst = form.watch("sgst");
    const igst = form.watch("igst");
    const shippingCharges = form.watch("shippingCharges");

    const showDiscount = useFeatureFlag("pricing_discount");
    const showShipping = useFeatureFlag("pricing_shipping");
    const showCgst = useFeatureFlag("tax_cgst");
    const showSgst = useFeatureFlag("tax_sgst");
    const showIgst = useFeatureFlag("tax_igst");
    const showTaxRateMgmt = useFeatureFlag("tax_rateManagement");


    // Apply selected tax rate
    const applyTaxRate = (taxRateId: string) => {
        const selectedRate = activeTaxRates.find((rate) => rate.id === taxRateId);
        if (selectedRate) {
            form.setValue("cgst", parseFloat(selectedRate.cgstRate));
            form.setValue("sgst", parseFloat(selectedRate.sgstRate));
            form.setValue("igst", parseFloat(selectedRate.igstRate));
        }
    };

    const subtotal = items.reduce(
        (sum: number, item: any) => sum + (item.quantity * item.unitPrice),
        0
    );
    const discountAmount = (subtotal * discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const cgstAmount = (taxableAmount * cgst) / 100;
    const sgstAmount = (taxableAmount * sgst) / 100;
    const igstAmount = (taxableAmount * igst) / 100;
    const total = taxableAmount + cgstAmount + sgstAmount + igstAmount + shippingCharges;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight">Review & Finalize</h2>
                <p className="text-muted-foreground">
                    Review the pricing, apply taxes, and finalize your quote.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle>Items Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/30 border-b">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Item</th>
                                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Qty</th>
                                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Unit Price</th>
                                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {items.map((item: any, i: number) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3 max-w-[300px]">
                                                    <div className="font-medium truncate">{item.description.split('\n')[0]}</div>
                                                    <div className="text-xs text-muted-foreground truncate">{item.hsnSac || '-'}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right font-mono">{formatCurrency(item.unitPrice, currency)}</td>
                                                <td className="px-4 py-3 text-right font-mono font-medium">{formatCurrency(item.quantity * item.unitPrice, currency)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm bg-muted/5">
                         <CardContent className="p-6 flex items-start gap-4">
                            <CheckCircle2 className="h-6 w-6 text-green-600 mt-1" />
                            <div>
                                <h3 className="font-semibold">Ready to Submit?</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Please verify all details above. Once created, you can still edit the quote until it is approved or sent. 
                                    A PDF will be generated automatically.
                                </p>
                            </div>
                         </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-primary">
                                <Calculator className="h-5 w-5" />
                                <CardTitle>Pricing & Taxes</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             {showTaxRateMgmt && activeTaxRates.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-muted-foreground">Quick Apply Tax Rate</Label>
                                    <Select onValueChange={applyTaxRate}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select region..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {activeTaxRates.map((rate) => (
                                                <SelectItem key={rate.id} value={rate.id}>
                                                    {rate.region} ({rate.taxType})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-4">
                                {showDiscount && (
                                    <FormField
                                        control={form.control}
                                        name="discount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex justify-between items-center mb-1">
                                                    <FormLabel className="text-xs">Discount (%)</FormLabel>
                                                    <span className="text-xs font-mono text-muted-foreground">
                                                        -{formatCurrency(discountAmount, currency)}
                                                    </span>
                                                </div>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min="0"
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <div className="grid grid-cols-3 gap-3">
                                    {showCgst && (
                                        <FormField
                                            control={form.control}
                                            name="cgst"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">CGST %</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="number" onChange={(e) => field.onChange(Number(e.target.value))} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                    {showSgst && (
                                        <FormField
                                            control={form.control}
                                            name="sgst"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">SGST %</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="number" onChange={(e) => field.onChange(Number(e.target.value))} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                    {showIgst && (
                                        <FormField
                                            control={form.control}
                                            name="igst"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">IGST %</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="number" onChange={(e) => field.onChange(Number(e.target.value))} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>

                                {showShipping && (
                                    <FormField
                                        control={form.control}
                                        name="shippingCharges"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Shipping</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                                            <Receipt className="h-3 w-3" />
                                                        </span>
                                                        <Input 
                                                            {...field} 
                                                            className="pl-8"
                                                            type="number" 
                                                            onChange={(e) => field.onChange(Number(e.target.value))} 
                                                        />
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-3 font-medium text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotal, currency)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Taxable Amount</span>
                                    <span>{formatCurrency(taxableAmount, currency)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Total Tax</span>
                                    <span>{formatCurrency((showCgst ? cgstAmount : 0) + (showSgst ? sgstAmount : 0) + (showIgst ? igstAmount : 0), currency)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                                    <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">Total</span>
                                    <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(total, currency)}</span>
                                </div>
                                {useFeatureFlag('quotes_profitMargin') && (
                                    <div className="flex justify-between items-center p-2 mt-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 text-xs text-blue-700 dark:text-blue-300">
                                        <div className="flex items-center gap-1.5">
                                            <Calculator className="h-3 w-3" />
                                            <span>Est. Profit Margin</span>
                                        </div>
                                        <span className="font-bold">20.00%</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
