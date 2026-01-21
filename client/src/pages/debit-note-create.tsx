/**
 * Debit Note Create/Edit Page
 * 
 * Form for creating or editing a debit note linked to an invoice
 */

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
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
import { Plus, Trash2, Loader2, ArrowLeft, Home, ChevronRight, FileWarning, Edit } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

const debitNoteFormSchema = z.object({
    clientId: z.string().min(1, "Client is required"),
    invoiceId: z.string().optional(),
    reason: z.string().min(1, "Reason is required"),
    notes: z.string().optional(),
    items: z.array(
        z.object({
            description: z.string().min(1, "Description is required"),
            quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
            unitPrice: z.coerce.number().min(0, "Unit price must be positive"),
            hsnSac: z.string().optional(),
        })
    ).min(1, "At least one item is required"),
});

type Invoice = {
    id: string;
    invoiceNumber: string;
    total: string;
    clientId: string;
};

type Client = {
    id: string;
    name: string;
};

export default function DebitNoteCreate() {
    const { id } = useParams<{ id?: string }>();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const { user } = useAuth();
    const isEdit = !!id && id !== "new";

    const { data: invoices, isLoading: isLoadingInvoices } = useQuery<Invoice[]>({
        queryKey: ["/api/invoices"],
    });

    const { data: clients, isLoading: isLoadingClients } = useQuery<Client[]>({
        queryKey: ["/api/clients"],
    });

    // Fetch existing debit note if editing
    const { data: existingNote, isLoading: isLoadingNote } = useQuery({
        queryKey: ["/api/debit-notes", id],
        queryFn: async () => {
            const res = await fetch(`/api/debit-notes/${id}`, { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch debit note");
            return res.json();
        },
        enabled: isEdit,
    });

    const form = useForm<z.infer<typeof debitNoteFormSchema>>({
        resolver: zodResolver(debitNoteFormSchema),
        defaultValues: {
            clientId: "",
            invoiceId: "",
            reason: "",
            notes: "",
            items: [{ description: "", quantity: 1, unitPrice: 0, hsnSac: "" }],
        },
    });

    // Auto-select client when invoice is selected
    const selectedInvoiceId = form.watch("invoiceId");
    useEffect(() => {
        if (selectedInvoiceId && invoices) {
            const invoice = invoices.find(i => i.id === selectedInvoiceId);
            if (invoice) {
                form.setValue("clientId", invoice.clientId);
            }
        }
    }, [selectedInvoiceId, invoices, form]);

    // Populate form when editing
    useEffect(() => {
        if (existingNote) {
            form.reset({
                clientId: existingNote.clientId || "",
                invoiceId: existingNote.invoiceId || "",
                reason: existingNote.reason || "",
                notes: existingNote.notes || "",
                items: existingNote.items?.length > 0
                    ? existingNote.items.map((item: any) => ({
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: parseFloat(item.unitPrice),
                        hsnSac: item.hsnSac || "",
                    }))
                    : [{ description: "", quantity: 1, unitPrice: 0, hsnSac: "" }],
            });
        }
    }, [existingNote, form]);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    // Calculations
    const items = form.watch("items");
    const subtotal = items.reduce((sum, item) => {
        return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    }, 0);

    const createMutation = useMutation({
        mutationFn: async (values: z.infer<typeof debitNoteFormSchema>) => {
            const url = isEdit ? `/api/debit-notes/${id}` : "/api/debit-notes";
            const method = isEdit ? "PUT" : "POST";
            
            const payload = {
                clientId: values.clientId,
                invoiceId: values.invoiceId === "none" ? null : (values.invoiceId || null),
                reason: values.reason,
                notes: values.notes,
                items: values.items.map(item => ({
                    description: item.description,
                    quantity: Number(item.quantity),
                    unitPrice: String(item.unitPrice),
                    hsnSac: item.hsnSac || null,
                })),
            };
            
            const res = await apiRequest(method, url, payload);
            return await res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/debit-notes"] });
            toast({
                title: "Success",
                description: isEdit ? "Debit note updated successfully" : "Debit note created successfully",
            });
            setLocation(`/debit-notes/${data.id}`);
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to save debit note",
                variant: "destructive",
            });
        }
    });

    const onSubmit = (values: z.infer<typeof debitNoteFormSchema>) => {
        createMutation.mutate(values);
    };

    if (isLoadingInvoices || (isEdit && isLoadingNote)) {
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
                        onClick={() => setLocation("/debit-notes")}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                    >
                        <FileWarning className="h-3.5 w-3.5" />
                        <span>Debit Notes</span>
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                        <Edit className="h-3.5 w-3.5" />
                        <span>{isEdit ? "Edit" : "Create"}</span>
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
                                    onClick={() => setLocation("/debit-notes")}
                                    className="shrink-0 hover:bg-primary/10 hover:text-primary h-8 w-8 sm:h-9 sm:w-9"
                                >
                                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                                </Button>
                                <div className="min-w-0 flex-1 space-y-1">
                                    <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                                        {isEdit ? "Edit Debit Note" : "Create Debit Note"}
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
                                {/* Debit Note Details */}
                                <Card>
                                    <CardHeader className="border-b px-6 py-4">
                                        <CardTitle className="text-base">Debit Note Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="clientId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Select Client *</FormLabel>
                                                        <Select 
                                                            onValueChange={(val) => {
                                                                field.onChange(val);
                                                                // Clear invoice if client changes and current invoice belongs to different client
                                                                const currentInvoiceId = form.getValues("invoiceId");
                                                                if (currentInvoiceId && invoices) {
                                                                    const inv = invoices.find(i => i.id === currentInvoiceId);
                                                                    if (inv && inv.clientId !== val) {
                                                                        form.setValue("invoiceId", "");
                                                                    }
                                                                }
                                                            }} 
                                                            value={field.value}
                                                            disabled={isEdit}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select a client" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {clients?.map((client) => (
                                                                    <SelectItem key={client.id} value={client.id}>
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
                                                name="invoiceId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Select Invoice (Optional)</FormLabel>
                                                        <Select 
                                                            onValueChange={field.onChange} 
                                                            value={field.value || undefined}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select an invoice" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="none">None (Standalone)</SelectItem>
                                                                {invoices
                                                                    ?.filter(inv => !form.getValues("clientId") || inv.clientId === form.getValues("clientId"))
                                                                    .map((invoice) => (
                                                                    <SelectItem key={invoice.id} value={invoice.id}>
                                                                        {invoice.invoiceNumber} - {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(parseFloat(invoice.total))}
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
                                                name="reason"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Reason *</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="e.g., Additional shipping, Late fee" />
                                                        </FormControl>
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
                                            onClick={() => append({ description: "", quantity: 1, unitPrice: 0, hsnSac: "" })}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Item
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[700px] text-sm text-left">
                                                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                                    <tr>
                                                        <th className="px-6 py-3 font-medium">Description</th>
                                                        <th className="px-6 py-3 font-medium w-28">HSN/SAC</th>
                                                        <th className="px-6 py-3 font-medium w-24">Qty</th>
                                                        <th className="px-6 py-3 font-medium w-32">Unit Price</th>
                                                        <th className="px-6 py-3 font-medium w-32 text-right">Total</th>
                                                        <th className="px-6 py-3 font-medium w-16"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {fields.map((field, index) => (
                                                        <tr key={field.id} className="group hover:bg-muted/50">
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
                                                                    name={`items.${index}.hsnSac`}
                                                                    render={({ field }) => (
                                                                        <Input {...field} placeholder="HSN" className="h-8" />
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
                                                                        <Input type="number" {...field} min="0" step="0.01" className="h-8" />
                                                                    )}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 text-right font-medium">
                                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
                                                                    (Number(form.watch(`items.${index}.quantity`)) || 0) * (Number(form.watch(`items.${index}.unitPrice`)) || 0)
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => remove(index)}
                                                                    disabled={fields.length === 1}
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

                                {/* Additional Details */}
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
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Summary Sidebar */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader className="border-b px-6 py-4">
                                        <CardTitle className="text-base">Debit Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(subtotal)}</span>
                                        </div>

                                        <Separator />

                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total Debit</span>
                                            <span className="text-red-600">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(subtotal)}</span>
                                        </div>

                                        <Button 
                                            type="submit" 
                                            className="w-full"
                                            disabled={createMutation.isPending}
                                        >
                                            {createMutation.isPending && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            {isEdit ? "Update Debit Note" : "Create Debit Note"}
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
