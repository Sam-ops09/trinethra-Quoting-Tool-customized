
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
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
import { Plus, Trash2, Loader2, ArrowLeft, Home, ChevronRight, Repeat, Save } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Client } from "@shared/schema";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface Subscription {
    id: string;
    subscriptionNumber: string;
    clientId: string;
    planName: string;
    status: string;
    billingCycle: string;
    startDate: string;
    nextBillingDate: string;
    amount: string;
    currency: string;
    autoRenew: boolean;
    itemsSnapshot: string;
    notes?: string;
}


const subscriptionFormSchema = z.object({
    clientId: z.string().min(1, "Client is required"),
    planName: z.string().min(1, "Plan Name is required"),
    billingCycle: z.enum(["monthly", "quarterly", "annually"]),
    startDate: z.string().min(1, "Start Date is required"),
    notes: z.string().optional(),
    currency: z.string().default("INR"),
    items: z.array(z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.coerce.number().min(1, "Min 1"),
        unitPrice: z.coerce.number().min(0, "Min 0"),
    })).min(1, "At least one item required"),
});

export default function SubscriptionCreate() {
    const [, setLocation] = useLocation();
    const [, params] = useRoute("/subscriptions/:id/edit");
    const { toast } = useToast();
    const isEditMode = !!params?.id;
    const [showProrationDialog, setShowProrationDialog] = useState(false);
    const [prorationPreview, setProrationPreview] = useState<{ amount: number; description: string; daysRemaining: number } | null>(null);
    const [pendingValues, setPendingValues] = useState<z.infer<typeof subscriptionFormSchema> | null>(null);

    const { data: clients } = useQuery<Client[]>({
        queryKey: ["/api/clients"],
    });

    const { data: existingSubscription, isLoading: isLoadingSub } = useQuery<Subscription>({
        queryKey: ["/api/subscriptions", params?.id],
        enabled: isEditMode,
    });

    const form = useForm<z.infer<typeof subscriptionFormSchema>>({
        resolver: zodResolver(subscriptionFormSchema),
        defaultValues: {
            clientId: "",
            planName: "",
            billingCycle: "monthly",
            startDate: new Date().toISOString().split("T")[0],
            notes: "",
            currency: "INR",
            items: [{ description: "", quantity: 1, unitPrice: 0 }],
        },
    });

    useEffect(() => {
        if (existingSubscription && isEditMode) {
            const items = JSON.parse(existingSubscription.itemsSnapshot || "[]");
            form.reset({
                ...existingSubscription,
                billingCycle: existingSubscription.billingCycle as "monthly" | "quarterly" | "annually",
                startDate: new Date(existingSubscription.startDate).toISOString().split("T")[0],
                items: items.length > 0 ? items : [{ description: "", quantity: 1, unitPrice: 0 }],
            });
        }
    }, [existingSubscription, isEditMode, form]);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            return await apiRequest("POST", "/api/subscriptions", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
            toast({ title: "Subscription created successfully" });
            setLocation("/subscriptions");
        },
        onError: (err: any) => {
            toast({ title: "Failed to create subscription", description: err.message, variant: "destructive" });
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            return await apiRequest("PUT", `/api/subscriptions/${params?.id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
            toast({ title: "Subscription updated successfully" });
            setLocation("/subscriptions");
        },
        onError: (err: any) => {
            toast({ title: "Failed to update subscription", description: err.message, variant: "destructive" });
        }
    });

    const items = form.watch("items");
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const currency = form.watch("currency");

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency }).format(val);

    const onSubmit = (values: z.infer<typeof subscriptionFormSchema>) => {
        const payload = {
            ...values,
            amount: totalAmount.toString(),
            itemsSnapshot: JSON.stringify(values.items),
            startDate: new Date(values.startDate).toISOString(), // Convert to timestamp
        };

        if (isEditMode) {
            // Check for proration first
            setPendingValues(values);
            apiRequest("POST", `/api/subscriptions/${params?.id}/preview-update`, {
                amount: totalAmount.toString(),
                billingCycle: values.billingCycle
            })
            .then(res => res.json())
            .then(data => {
                if (data.amount !== 0) {
                    setProrationPreview(data);
                    setShowProrationDialog(true);
                } else {
                    updateMutation.mutate(payload);
                }
            })
            .catch(err => {
                console.error("Failed to preview proration", err);
                toast({ title: "Failed to calculate proration", description: "Proceeding with update without proration check.", variant: "default" }); // Variant fixed from secondary
                updateMutation.mutate(payload);
            });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleConfirmUpdate = (applyProration: boolean) => {
        if (!pendingValues) return;
        
        const payload = {
            ...pendingValues,
            amount: totalAmount.toString(),
            itemsSnapshot: JSON.stringify(pendingValues.items),
            startDate: new Date(pendingValues.startDate).toISOString(),
            applyProration
        };

        updateMutation.mutate(payload);
        setShowProrationDialog(false);
    };

    if (isEditMode && isLoadingSub) return <div className="p-8 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="min-h-screen w-full bg-slate-50/50 dark:bg-slate-950/50">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-[1600px] mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-fit">
                    <button onClick={() => setLocation("/")} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                        <Home className="h-3.5 w-3.5" /><span>Home</span>
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <button onClick={() => setLocation("/subscriptions")} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                        <Repeat className="h-3.5 w-3.5" /><span>Subscriptions</span>
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                        <span>{isEditMode ? "Edit Subscription" : "New Subscription"}</span>
                    </span>
                </nav>

                <div className="flex items-center justify-between">
                     <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? "Edit Subscription" : "Create Subscription"}</h1>
                     <Button variant="outline" onClick={() => setLocation("/subscriptions")}>Cancel</Button>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Plan Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <FormField
                                        control={form.control}
                                        name="clientId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Client</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Client" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {clients?.map(client => (
                                                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="planName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Plan Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g. Bronze Plan" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="billingCycle"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Billing Cycle</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="monthly">Monthly</SelectItem>
                                                            <SelectItem value="quarterly">Quarterly</SelectItem>
                                                            <SelectItem value="annually">Annually</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="startDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Start Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Notes (Internal)</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="flex flex-col">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Items & Pricing</CardTitle>
                                    <Button type="button" size="sm" onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Item
                                    </Button>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[40%]">Description</TableHead>
                                                    <TableHead className="w-[20%]">Qty</TableHead>
                                                    <TableHead className="w-[30%]">Price</TableHead>
                                                    <TableHead className="w-[10%]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {fields.map((field, index) => (
                                                    <TableRow key={field.id}>
                                                        <TableCell>
                                                            <FormField
                                                                control={form.control}
                                                                name={`items.${index}.description`}
                                                                render={({ field }) => (
                                                                    <Input {...field} placeholder="Item name" className="h-8" />
                                                                )}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <FormField
                                                                control={form.control}
                                                                name={`items.${index}.quantity`}
                                                                render={({ field }) => (
                                                                    <Input {...field} type="number" min="1" className="h-8" />
                                                                )}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <FormField
                                                                control={form.control}
                                                                name={`items.${index}.unitPrice`}
                                                                render={({ field }) => (
                                                                    <Input {...field} type="number" min="0" className="h-8" />
                                                                )}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive"
                                                                onClick={() => remove(index)}
                                                                disabled={fields.length === 1}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg w-1/2">
                                            <div className="flex justify-between items-center text-sm mb-2">
                                                <span className="text-muted-foreground">Currency</span>
                                                <span className="font-semibold">{currency}</span>
                                            </div>
                                            <Separator className="my-2" />
                                            <div className="flex justify-between items-center text-lg font-bold">
                                                <span>Total Amount</span>
                                                <span>{formatCurrency(totalAmount)}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground text-right mt-1 capitalize">
                                                per {form.watch("billingCycle")}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="ghost" onClick={() => setLocation("/subscriptions")}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {isEditMode ? "Update Subscription" : "Create Subscription"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>

            {/* Proration Confirmation Dialog */}
            <Dialog open={showProrationDialog} onOpenChange={setShowProrationDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Subscription Update Confirmation</DialogTitle>
                        <DialogDescription>
                            Changes to the subscription plan usually require a proration adjustment.
                        </DialogDescription>
                    </DialogHeader>

                    {prorationPreview && (
                        <div className="space-y-4 py-4">
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertTitle>Proration Calculated</AlertTitle>
                                <AlertDescription>
                                    {prorationPreview.description}
                                </AlertDescription>
                            </Alert>
                            
                            <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                                <span className="font-medium">Adjustment Amount:</span>
                                <span className={prorationPreview.amount > 0 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                                    {formatCurrency(Math.abs(prorationPreview.amount))}
                                    {prorationPreview.amount > 0 ? " (Charge)" : " (Credit)"}
                                </span>
                            </div>

                            <p className="text-sm text-slate-500">
                                Do you want to apply this proration immediately?
                                {prorationPreview.amount > 0 
                                    ? " An invoice will be generated for the difference." 
                                    : " The credit will be added to the subscription balance."}
                            </p>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowProrationDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="secondary" onClick={() => handleConfirmUpdate(false)}>
                            Update without Proration
                        </Button>
                        <Button onClick={() => handleConfirmUpdate(true)}>
                            Apply Proration & Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
