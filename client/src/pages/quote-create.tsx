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
import { Plus, Trash2, Loader2, ArrowLeft, Home, ChevronRight, FileText } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import type { Client } from "@shared/schema";
import { BOMSection, type BOMItem } from "@/components/quote/bom-section";
import { SLASection, type SLAData } from "@/components/quote/sla-section";
import {
    TimelineSection,
    type TimelineData,
} from "@/components/quote/timeline-section";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

type TaxRate = {
    id: string;
    region: string;
    taxType: string;
    sgstRate: string;
    cgstRate: string;
    igstRate: string;
    isActive: boolean;
    effectiveFrom: string;
};

interface QuoteCreatePayload {
    clientId: string;
    validityDays: number;
    referenceNumber?: string;
    attentionTo?: string;
    discount: string; // monetary discount amount
    cgst: string;
    sgst: string;
    igst: string;
    shippingCharges: string;
    subtotal: string;
    total: string;
    notes?: string;
    termsAndConditions?: string;
    status: "draft" | "sent" | "approved" | "rejected" | "invoiced";
    quoteDate: string;
    items: { description: string; quantity: number; unitPrice: number; hsnSac?: string }[];
    bomSection?: string; // JSON string
    slaSection?: string; // JSON string
    timelineSection?: string; // JSON string
}

interface QuoteDetail {
    id: string;
    quoteNumber: string;
    status: string;
    clientId: string;
    validityDays: number;
    referenceNumber?: string;
    attentionTo?: string;
    notes?: string;
    termsAndConditions?: string;
    quoteDate?: string;
    items: Array<{
        id: string;
        description: string;
        quantity: number;
        unitPrice: string;
        subtotal: string;
        hsnSac?: string;
    }>;
    subtotal: string;
    discount: string;
    cgst: string;
    sgst: string;
    igst: string;
    shippingCharges: string;
    total: string;
    bomSection?: string;
    slaSection?: string;
    timelineSection?: string;
}

const quoteFormSchema = z.object({
    clientId: z.string().min(1, "Client is required"),
    validityDays: z.coerce.number().min(1, "Validity period is required"),
    referenceNumber: z.string().optional(),
    attentionTo: z.string().optional(),
    discount: z.coerce.number().min(0, "Discount must be positive"),
    cgst: z.coerce.number().min(0, "CGST must be positive"),
    sgst: z.coerce.number().min(0, "SGST must be positive"),
    igst: z.coerce.number().min(0, "IGST must be positive"),
    shippingCharges: z.coerce.number().min(0, "Shipping charges must be positive"),
    notes: z.string().optional(),
    termsAndConditions: z.string().optional(),
    items: z
        .array(
            z.object({
                description: z.string().min(1, "Description is required"),
                quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
                unitPrice: z.coerce.number().min(0, "Unit price must be positive"),
                hsnSac: z.string().max(10).optional(),
            }),
        )
        .min(1, "At least one item is required"),
});

export default function QuoteCreate() {
    const [, setLocation] = useLocation();
    const [, params] = useRoute("/quotes/:id/edit");
    const { toast } = useToast();
    const { user } = useAuth();
    const isEditMode = !!params?.id;

    const { data: clients } = useQuery<Client[]>({
        queryKey: ["/api/clients"],
    });

    const { data: taxRates } = useQuery<TaxRate[]>({
        queryKey: ["/api/tax-rates"],
    });

    const activeTaxRates = taxRates?.filter((rate) => rate.isActive) || [];

    const { data: existingQuote, isLoading: isLoadingQuote } =
        useQuery<QuoteDetail>({
            queryKey: ["/api/quotes", params?.id],
            enabled: isEditMode,
            staleTime: 0, // Always refetch when component mounts in edit mode
            gcTime: 0, // Don't cache quote data for edit mode
        });

    const form = useForm<z.infer<typeof quoteFormSchema>>({
        resolver: zodResolver(quoteFormSchema),
        shouldUnregister: false,
        defaultValues: {
            clientId: "",
            validityDays: 30,
            referenceNumber: "",
            attentionTo: "",
            discount: 0,
            cgst: 9,
            sgst: 9,
            igst: 0,
            shippingCharges: 0,
            notes: "",
            termsAndConditions:
                "Payment Terms: Net 30 days\nDelivery: 7-10 business days\nWarranty: 1 year manufacturer warranty",
            items: [{ description: "", quantity: 1, unitPrice: 0, hsnSac: "" }],
        },
    });

    // Advanced Sections State
    const [bomItems, setBomItems] = useState<BOMItem[]>([]);
    const [slaData, setSlaData] = useState<SLAData>({
        overview: "",
        responseTime: "",
        resolutionTime: "",
        availability: "",
        supportHours: "",
        escalationProcess: "",
        metrics: [],
    });
    const [timelineData, setTimelineData] = useState<TimelineData>({
        projectOverview: "",
        startDate: "",
        endDate: "",
        milestones: [],
    });

    // Pre-select client from URL query parameter (new quote from client page)
    useEffect(() => {
        if (!isEditMode) {
            const params = new URLSearchParams(window.location.search);
            const clientIdParam = params.get("clientId");
            if (clientIdParam) {
                form.setValue("clientId", clientIdParam);
            }
        }
    }, [isEditMode, form]);

    // Load existing quote data when editing
    useEffect(() => {
        if (existingQuote && isEditMode) {
            const subtotal = Number(existingQuote.subtotal);
            const discountAmount = Number(existingQuote.discount);
            const cgstAmount = Number(existingQuote.cgst);
            const sgstAmount = Number(existingQuote.sgst);
            const igstAmount = Number(existingQuote.igst);

            const taxBase = subtotal - discountAmount;

            const discountPercent =
                subtotal > 0 ? (discountAmount / subtotal) * 100 : 0;
            const cgstPercent = taxBase > 0 ? (cgstAmount / taxBase) * 100 : 0;
            const sgstPercent = taxBase > 0 ? (sgstAmount / taxBase) * 100 : 0;
            const igstPercent = taxBase > 0 ? (igstAmount / taxBase) * 100 : 0;

            form.reset({
                clientId: existingQuote.clientId,
                validityDays: existingQuote.validityDays,
                referenceNumber: existingQuote.referenceNumber || "",
                attentionTo: existingQuote.attentionTo || "",
                discount: Number(discountPercent.toFixed(2)),
                cgst: Number(cgstPercent.toFixed(2)),
                sgst: Number(sgstPercent.toFixed(2)),
                igst: Number(igstPercent.toFixed(2)),
                shippingCharges: Number(existingQuote.shippingCharges),
                notes: existingQuote.notes || "",
                termsAndConditions: existingQuote.termsAndConditions || "",
                items: existingQuote.items.map((item) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: Number(item.unitPrice),
                    hsnSac: item.hsnSac || "",
                })),
            });

            if (existingQuote.bomSection) {
                try {
                    const parsedBOM = JSON.parse(existingQuote.bomSection);
                    setBomItems(parsedBOM);
                } catch (e) {
                    console.error("Failed to parse BOM section:", e);
                }
            }

            if (existingQuote.slaSection) {
                try {
                    const parsedSLA = JSON.parse(existingQuote.slaSection);
                    setSlaData(parsedSLA);
                } catch (e) {
                    console.error("Failed to parse SLA section:", e);
                }
            }

            if (existingQuote.timelineSection) {
                try {
                    const parsedTimeline = JSON.parse(existingQuote.timelineSection);
                    setTimelineData(parsedTimeline);
                } catch (e) {
                    console.error("Failed to parse Timeline section:", e);
                }
            }
        }
    }, [existingQuote, isEditMode, form]);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const createMutation = useMutation({
        mutationFn: async (data: QuoteCreatePayload) => {
            return await apiRequest("POST", "/api/quotes", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
            toast({
                title: "Quote created",
                description: "Your quote has been created successfully.",
            });
            setLocation("/quotes");
        },
        onError: (error: any) => {
            toast({
                title: "Failed to create quote",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: QuoteCreatePayload) => {
            return await apiRequest("PUT", `/api/quotes/${params?.id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
            queryClient.invalidateQueries({
                queryKey: ["/api/quotes", params?.id],
            });
            toast({
                title: "Quote updated",
                description: "Your quote has been updated successfully.",
            });
            setLocation(`/quotes/${params?.id}`);
        },
        onError: (error: any) => {
            toast({
                title: "Failed to update quote",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const items = form.watch("items");
    const discount = form.watch("discount");
    const cgst = form.watch("cgst");
    const sgst = form.watch("sgst");
    const igst = form.watch("igst");
    const shippingCharges = form.watch("shippingCharges");

    // Apply selected tax rate
    const applyTaxRate = (taxRateId: string) => {
        const selectedRate = activeTaxRates.find((rate) => rate.id === taxRateId);
        if (selectedRate) {
            form.setValue("cgst", parseFloat(selectedRate.cgstRate));
            form.setValue("sgst", parseFloat(selectedRate.sgstRate));
            form.setValue("igst", parseFloat(selectedRate.igstRate));
            toast({
                title: "Tax rate applied",
                description: `Applied ${selectedRate.taxType} rates for ${selectedRate.region}`,
            });
        }
    };

    const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
    );
    const discountAmount = (subtotal * discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const cgstAmount = (taxableAmount * cgst) / 100;
    const sgstAmount = (taxableAmount * sgst) / 100;
    const igstAmount = (taxableAmount * igst) / 100;
    const total =
        taxableAmount + cgstAmount + sgstAmount + igstAmount + shippingCharges;

    const onSubmit = async (values: z.infer<typeof quoteFormSchema>) => {
        const quoteData: QuoteCreatePayload = {
            clientId: values.clientId,
            validityDays: values.validityDays,
            referenceNumber: values.referenceNumber || undefined,
            attentionTo: values.attentionTo || undefined,
            discount: discountAmount.toString(),
            cgst: cgstAmount.toString(),
            sgst: sgstAmount.toString(),
            igst: igstAmount.toString(),
            shippingCharges: shippingCharges.toString(),
            subtotal: subtotal.toString(),
            total: total.toString(),
            notes: values.notes || undefined,
            termsAndConditions: values.termsAndConditions || undefined,
            status: isEditMode ? (existingQuote?.status as any) : "draft",
            quoteDate: isEditMode
                ? existingQuote?.quoteDate || new Date().toISOString()
                : new Date().toISOString(),
            items: values.items.map((i) => ({
                description: i.description,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                hsnSac: i.hsnSac || undefined,
            })),
            bomSection:
                bomItems.length > 0 ? JSON.stringify(bomItems) : undefined,
            slaSection:
                slaData.overview || slaData.metrics.length > 0
                    ? JSON.stringify(slaData)
                    : undefined,
            timelineSection:
                timelineData.projectOverview ||
                timelineData.milestones.length > 0
                    ? JSON.stringify(timelineData)
                    : undefined,
        };

        if (isEditMode) {
            await updateMutation.mutateAsync(quoteData);
        } else {
            await createMutation.mutateAsync(quoteData);
        }
    };

    if (isEditMode && isLoadingQuote) {
        return (
            <div className="p-3 sm:p-4 md:p-6 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (isEditMode && existingQuote?.status === "invoiced") {
        return (
            <div className="p-3 sm:p-4 md:p-6">
                <div className="text-center py-8 sm:py-12">
                    <p className="text-sm sm:text-base text-muted-foreground">
                        This quote has been invoiced and cannot be edited.
                    </p>
                    <Button
                        className="mt-4"
                        onClick={() => setLocation(`/quotes/${params?.id}`)}
                    >
                        Back to Quote
                    </Button>
                </div>
            </div>
        );
    }

    const isSubmitting =
        createMutation.isPending || updateMutation.isPending;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Premium Header Section with Glass Effect */}
            <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 shadow-lg shadow-slate-900/5">
                <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-fit mb-4">
                        <button
                            onClick={() => setLocation("/")}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                        >
                            <Home className="h-3.5 w-3.5" />
                            <span>Home</span>
                        </button>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        <button
                            onClick={() => setLocation("/quotes")}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                        >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Quotes</span>
                        </button>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {isEditMode ? existingQuote?.quoteNumber : "New Quote"}
                        </span>
                    </nav>

                    {/* Premium Header */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                    setLocation(
                                        isEditMode ? `/quotes/${params?.id}` : "/quotes",
                                    )
                                }
                                data-testid="button-back"
                                className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600 shadow-md hover:shadow-lg transition-all duration-200 border border-slate-300/50 dark:border-slate-600/50"
                            >
                                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700 dark:text-slate-200" />
                            </Button>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent truncate">
                                    {isEditMode
                                        ? `Edit Quote ${existingQuote?.quoteNumber}`
                                        : "Create New Quote"}
                                </h1>
                                {user && (
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-primary/60 animate-pulse"></span>
                                        Prepared by: <span className="font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">

                {/* Form */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-3"
                    >
                        <div className="grid gap-3 lg:grid-cols-3">
                            {/* Left column */}
                            <div className="lg:col-span-2 space-y-4 sm:space-y-5">
                                {/* Basic Info */}
                                <Card className="border-0 shadow-xl shadow-slate-900/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5">
                                    <CardHeader className="border-b border-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700 p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <CardTitle className="text-base sm:text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                                Basic Information
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 sm:space-y-5 p-4 sm:p-5 lg:p-6">
                                        <FormField
                                            control={form.control}
                                            name="clientId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                        Client <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger data-testid="select-client" className="h-11 rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
                                                                <SelectValue placeholder="Select a client" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-xl">
                                                            {clients?.map((client) => (
                                                                <SelectItem
                                                                    key={client.id}
                                                                    value={client.id}
                                                                    className="rounded-lg"
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
                                        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="validityDays"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                            Validity Period (days) <span className="text-red-500">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                onChange={(e) =>
                                                                    field.onChange(Number(e.target.value))
                                                                }
                                                                data-testid="input-validity-days"
                                                                className="h-11 rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
                                                            />
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
                                                        <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                            Reference/PO Number
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                value={field.value || ""}
                                                                data-testid="input-reference-number"
                                                                className="h-11 rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="attentionTo"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                        Attention To
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            value={field.value || ""}
                                                            data-testid="input-attention-to"
                                                            className="h-11 rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Line Items */}
                                <Card className="border-0 shadow-xl shadow-slate-900/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5">
                                    <CardHeader className="border-b border-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700 p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-800/50">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                    </svg>
                                                </div>
                                                <CardTitle className="text-base sm:text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                                    Line Items
                                                </CardTitle>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    append({
                                                        description: "",
                                                        quantity: 1,
                                                        unitPrice: 0,
                                                        hsnSac: "",
                                                    })
                                                }
                                                data-testid="button-add-item"
                                                className="h-9 px-4 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                                            >
                                                <Plus className="h-4 w-4 mr-1.5" />
                                                Add Item
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 p-4 sm:p-5 lg:p-6">
                                        {fields.map((fieldItem, index) => (
                                            <div
                                                key={fieldItem.id}
                                                className="relative flex flex-col gap-4 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-800/50 dark:to-slate-900 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                                            >
                                                <div className="flex-1 w-full space-y-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.description`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                    Description <span className="text-red-500">*</span>
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Textarea
                                                                        {...field}
                                                                        data-testid={`input-item-description-${index}`}
                                                                        className="min-h-[80px] rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200 resize-none"
                                                                        placeholder="Enter detailed item description..."
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`items.${index}.hsnSac`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                        HSN/SAC Code
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            {...field}
                                                                            maxLength={10}
                                                                            data-testid={`input-item-hsnsac-${index}`}
                                                                            className="h-11 rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
                                                                            placeholder="e.g., 8471"
                                                                        />
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
                                                                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                        Quantity <span className="text-red-500">*</span>
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            {...field}
                                                                            type="number"
                                                                            onChange={(e) =>
                                                                                field.onChange(
                                                                                    Number(e.target.value),
                                                                                )
                                                                            }
                                                                            data-testid={`input-item-quantity-${index}`}
                                                                            className="h-11 rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
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
                                                                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                        Unit Price <span className="text-red-500">*</span>
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            {...field}
                                                                            type="number"
                                                                            step="0.01"
                                                                            onChange={(e) =>
                                                                                field.onChange(
                                                                                    Number(e.target.value),
                                                                                )
                                                                            }
                                                                            data-testid={`input-item-unit-price-${index}`}
                                                                            className="h-11 rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <div className="space-y-2 col-span-2 lg:col-span-1">
                                                            <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                Subtotal
                                                            </FormLabel>
                                                            <div className="h-11 flex items-center font-bold text-base px-4 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl border border-primary/30 dark:border-primary/40 text-primary shadow-sm">
                                                                ₹{(items[index].quantity * items[index].unitPrice).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {fields.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => remove(index)}
                                                        data-testid={`button-remove-item-${index}`}
                                                        className="absolute top-3 right-3 h-8 w-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Additional Info */}
                                <Card className="border-0 shadow-xl shadow-slate-900/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5">
                                    <CardHeader className="border-b border-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700 p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <CardTitle className="text-base sm:text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                                Additional Information
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-5 p-4 sm:p-5 lg:p-6">
                                        {/* Notes Section */}
                                        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/50">
                                            <FormField
                                                control={form.control}
                                                name="notes"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                            </svg>
                                                            Internal Notes
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                {...field}
                                                                value={field.value || ""}
                                                                data-testid="input-notes"
                                                                className="min-h-[100px] rounded-xl border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200 resize-none mt-2"
                                                                placeholder="Add any additional notes..."
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Terms & Conditions Section */}
                                        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/50">
                                            <FormField
                                                control={form.control}
                                                name="termsAndConditions"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Terms &amp; Conditions
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                {...field}
                                                                value={field.value || ""}
                                                                rows={5}
                                                                data-testid="input-terms"
                                                                className="min-h-[120px] rounded-xl border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200 resize-none mt-2"
                                                                placeholder="Enter terms and conditions..."
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Advanced Sections */}
                                <Card className="border-0 shadow-xl shadow-slate-900/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5">
                                    <CardHeader className="border-b border-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700 p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            </div>
                                            <div>
                                                <CardTitle className="text-base sm:text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                                    Advanced Sections (Optional)
                                                </CardTitle>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                    Add detailed technical and project information to your quote
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 sm:p-5 lg:p-6">
                                        <Tabs defaultValue="bom" className="w-full">
                                            <TabsList className="grid w-full grid-cols-3 h-auto gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                                <TabsTrigger
                                                    value="bom"
                                                    className="text-xs sm:text-sm py-2.5 px-3 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md transition-all duration-200"
                                                >
                                                    📦 BOM
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="sla"
                                                    className="text-xs sm:text-sm py-2.5 px-3 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md transition-all duration-200"
                                                >
                                                    📋 SLA
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="timeline"
                                                    className="text-xs sm:text-sm py-2.5 px-3 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md transition-all duration-200"
                                                >
                                                    📅 Timeline
                                                </TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="bom" className="mt-3 sm:mt-4">
                                                <BOMSection
                                                    items={bomItems}
                                                    onChange={setBomItems}
                                                />
                                            </TabsContent>
                                            <TabsContent value="sla" className="mt-3 sm:mt-4">
                                                <SLASection
                                                    data={slaData}
                                                    onChange={setSlaData}
                                                />
                                            </TabsContent>
                                            <TabsContent value="timeline" className="mt-3 sm:mt-4">
                                                <TimelineSection
                                                    data={timelineData}
                                                    onChange={setTimelineData}
                                                />
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right column */}
                            <div className="space-y-4 sm:space-y-6">
                                <Card className="border-0 shadow-xl shadow-slate-900/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5 lg:sticky lg:top-24">
                                    <CardHeader className="border-b border-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700 p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-emerald-50/80 to-green-50/80 dark:from-emerald-950/30 dark:to-green-950/30">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <CardTitle className="text-base sm:text-lg font-bold bg-gradient-to-r from-emerald-900 to-emerald-700 dark:from-emerald-200 dark:to-emerald-400 bg-clip-text text-transparent">
                                                Pricing &amp; Taxes
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 sm:space-y-5 p-4 sm:p-5 lg:p-6">
                                        {activeTaxRates.length > 0 && (
                                            <div className="space-y-2.5 p-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/30 dark:border-blue-800/30">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    Quick Apply Tax Rate
                                                </label>
                                                <Select onValueChange={applyTaxRate}>
                                                    <SelectTrigger data-testid="select-tax-rate" className="h-11 rounded-xl border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
                                                        <SelectValue placeholder="Select a tax rate..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        {activeTaxRates.map((rate) => (
                                                            <SelectItem key={rate.id} value={rate.id} className="rounded-lg">
                                                                {rate.region} - {rate.taxType} (CGST:{" "}
                                                                {rate.cgstRate}%, SGST: {rate.sgstRate}%,
                                                                IGST: {rate.igstRate}%)
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                                    Select a pre-configured tax rate or enter manually below
                                                </p>
                                            </div>
                                        )}

                                        <FormField
                                            control={form.control}
                                            name="discount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                        Discount (%)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            step="0.01"
                                                            onChange={(e) =>
                                                                field.onChange(Number(e.target.value))
                                                            }
                                                            data-testid="input-discount"
                                                            className="h-11 rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Divider */}
                                        <div className="relative py-2">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                                            </div>
                                            <div className="relative flex justify-center text-xs font-medium uppercase">
                        <span className="bg-white dark:bg-slate-900 px-3 py-1 text-slate-500 dark:text-slate-400 rounded-full">
                          Or enter manually
                        </span>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="cgst"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">CGST (%)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                step="0.01"
                                                                onChange={(e) =>
                                                                    field.onChange(Number(e.target.value))
                                                                }
                                                                data-testid="input-cgst"
                                                                className="h-11 rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="sgst"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">SGST (%)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                step="0.01"
                                                                onChange={(e) =>
                                                                    field.onChange(Number(e.target.value))
                                                                }
                                                                data-testid="input-sgst"
                                                                className="h-11 rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="igst"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">IGST (%)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            step="0.01"
                                                            onChange={(e) =>
                                                                field.onChange(Number(e.target.value))
                                                            }
                                                            data-testid="input-igst"
                                                            className="h-11 rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="shippingCharges"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">Shipping Charges</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            step="0.01"
                                                            onChange={(e) =>
                                                                field.onChange(Number(e.target.value))
                                                            }
                                                            data-testid="input-shipping"
                                                            className="h-11 rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="pt-5 mt-5 border-t border-slate-200 dark:border-slate-700 space-y-3 font-['Open_Sans']">
                                            <div className="flex justify-between items-center text-sm p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          Subtotal:
                        </span>
                                                <span className="font-semibold text-slate-900 dark:text-white">
                          ₹{subtotal.toFixed(2)}
                        </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30">
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          Discount:
                        </span>
                                                <span className="font-semibold text-red-700 dark:text-red-300">
                          -₹{discountAmount.toFixed(2)}
                        </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          Taxable Amount:
                        </span>
                                                <span className="font-semibold text-blue-700 dark:text-blue-300">
                          ₹{taxableAmount.toFixed(2)}
                        </span>
                                            </div>
                                            {cgstAmount > 0 && (
                                                <div className="flex justify-between items-center text-sm p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            CGST ({cgst}%):
                          </span>
                                                    <span className="font-semibold text-amber-700 dark:text-amber-300">
                            ₹{cgstAmount.toFixed(2)}
                          </span>
                                                </div>
                                            )}
                                            {sgstAmount > 0 && (
                                                <div className="flex justify-between items-center text-sm p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            SGST ({sgst}%):
                          </span>
                                                    <span className="font-semibold text-amber-700 dark:text-amber-300">
                            ₹{sgstAmount.toFixed(2)}
                          </span>
                                                </div>
                                            )}
                                            {igstAmount > 0 && (
                                                <div className="flex justify-between items-center text-sm p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                          <span className="text-purple-600 dark:text-purple-400 font-medium">
                            IGST ({igst}%):
                          </span>
                                                    <span className="font-semibold text-purple-700 dark:text-purple-300">
                            ₹{igstAmount.toFixed(2)}
                          </span>
                                                </div>
                                            )}
                                            {shippingCharges > 0 && (
                                                <div className="flex justify-between items-center text-sm p-2.5 rounded-lg bg-green-50 dark:bg-green-950/30">
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            Shipping:
                          </span>
                                                    <span className="font-semibold text-green-700 dark:text-green-300">
                            ₹{shippingCharges.toFixed(2)}
                          </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center text-lg font-bold border-t-2 border-emerald-200 dark:border-emerald-800 pt-4 mt-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50">
                                                <span className="text-emerald-900 dark:text-emerald-200">Total:</span>
                                                <span
                                                    className="text-2xl bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent"
                                                    data-testid="text-total"
                                                >
                          ₹{total.toFixed(2)}
                        </span>
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary via-primary/90 to-primary hover:from-primary/90 hover:via-primary hover:to-primary/90 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 text-base font-semibold"
                                            disabled={isSubmitting}
                                            data-testid="button-create-quote"
                                        >
                                            {isSubmitting && (
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            )}
                                            {isEditMode ? "✨ Update Quote" : "🚀 Create Quote"}
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