import { UseFormReturn } from "react-hook-form";
import {
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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Building2, Calendar, Hash, User, Globe } from "lucide-react";
import type { Client } from "@shared/schema";

interface QuoteBasicInfoProps {
    form: UseFormReturn<any>;
    clients: Client[] | undefined;
}

export function QuoteBasicInfo({ form, clients }: QuoteBasicInfoProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight">Basic Details</h2>
                <p className="text-muted-foreground">
                    Start by selecting a client and setting the quote terms.
                </p>
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle>Client Information</CardTitle>
                            <CardDescription>Select the client and currency for this quote</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Client <span className="text-destructive">*</span></FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger data-testid="select-client" className="h-11">
                                            <SelectValue placeholder="Select a client..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {clients?.map((client) => (
                                            <SelectItem
                                                key={client.id}
                                                value={client.id}
                                            >
                                                {client.name}
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
                        name="currency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Currency <span className="text-destructive">*</span></FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger data-testid="select-currency" className="h-11">
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-muted-foreground" />
                                                <SelectValue placeholder="Select currency" />
                                            </div>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                                        <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                                        <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                                        <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                                        <SelectItem value="AUD">AUD ($) - Australian Dollar</SelectItem>
                                        <SelectItem value="CAD">CAD ($) - Canadian Dollar</SelectItem>
                                        <SelectItem value="SGD">SGD ($) - Singapore Dollar</SelectItem>
                                        <SelectItem value="AED">AED (د.إ) - UAE Dirham</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle>Quote Details</CardTitle>
                            <CardDescription>Set validity and reference information</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="validityDays"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Validity Period (Days) <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <Input
                                            {...field}
                                            type="number"
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            data-testid="input-validity-days"
                                            className="pl-9 h-11"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="referenceNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reference / PO Number</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <Hash className="h-4 w-4" />
                                        </div>
                                        <Input
                                            {...field}
                                            value={field.value || ""}
                                            data-testid="input-reference-number"
                                            className="pl-9 h-11"
                                            placeholder="Optional"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name="attentionTo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Attention To</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <Input
                                                {...field}
                                                value={field.value || ""}
                                                data-testid="input-attention-to"
                                                className="pl-9 h-11"
                                                placeholder="Specific person or department (Optional)"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
