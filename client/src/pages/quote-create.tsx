import { useEffect, useState, useRef } from "react";
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
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2, ArrowLeft, Upload, Home, ChevronRight, FileText, Edit, Package, DollarSign } from "lucide-react";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

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
            return await apiRequest("PATCH", `/api/quotes/${params?.id}`, data);
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

    // Excel Import Logic
    const fileInputRef = useRef<HTMLInputElement>(null);
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

        // check if file is excel
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
            <div className="min-h-screen bg-background">
                <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
                    <div className="p-6 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    if (isEditMode && existingQuote?.status === "invoiced") {
        return (
            <div className="min-h-screen bg-background">
                <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">
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
            </div>
        );
    }

    const isSubmitting =
        createMutation.isPending || updateMutation.isPending;

    return (
        <div className="min-h-screen w-full">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-[1600px] mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Premium Breadcrumbs */}
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
                        onClick={() => setLocation("/quotes")}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                    >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Quotes</span>
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                        <Edit className="h-3.5 w-3.5" />
                        <span>{isEditMode ? "Edit Quote" : "New Quote"}</span>
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
                                    onClick={() =>
                                        setLocation(
                                            isEditMode ? `/quotes/${params?.id}` : "/quotes",
                                        )
                                    }
                                    data-testid="button-back"
                                    className="shrink-0 hover:bg-primary/10 hover:text-primary h-8 w-8 sm:h-9 sm:w-9"
                                >
                                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                                </Button>
                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                                            {isEditMode
                                                ? `Edit Quote ${existingQuote?.quoteNumber}`
                                                : "Create New Quote"}
                                        </h1>
                                    </div>
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
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-3"
                    >
                        <div className="grid gap-3 lg:grid-cols-3">
                            {/* Left column */}
                            <div className="lg:col-span-2 space-y-3">
                                {/* Basic Information */}
                                <Card className="border bg-card shadow-sm overflow-hidden">
                                    <CardHeader className="border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="p-1.5 sm:p-2 rounded-md bg-primary/10 text-primary">
                                                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm sm:text-lg">Basic Information</CardTitle>
                                                <p className="hidden sm:block text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans']">
                                                    Client and quote details
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="clientId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Client *</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger data-testid="select-client" className="text-sm">
                                                                <SelectValue placeholder="Select a client" />
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
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="validityDays"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Validity Period (days) *</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                onChange={(e) =>
                                                                    field.onChange(Number(e.target.value))
                                                                }
                                                                data-testid="input-validity-days"
                                                                className="text-sm"
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
                                                        <FormLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Reference/PO Number</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                value={field.value || ""}
                                                                data-testid="input-reference-number"
                                                                className="text-sm"
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
                                                    <FormLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Attention To</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            value={field.value || ""}
                                                            data-testid="input-attention-to"
                                                            className="text-sm"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Line Items */}
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
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    onClick={() =>
                                                        append({
                                                            description: "",
                                                            quantity: 1,
                                                            unitPrice: 0,
                                                            hsnSac: "",
                                                        })
                                                    }
                                                    data-testid="button-add-item"
                                                    size="sm"
                                                    className="flex-1 sm:flex-initial justify-center gap-2 text-xs sm:text-sm"
                                                >
                                                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    <span className="hidden xs:inline">Add Item</span>
                                                    <span className="xs:hidden">Add</span>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={parseExcelMutation.isPending}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="flex-1 sm:flex-initial justify-center gap-2 text-xs sm:text-sm"
                                                >
                                                    {parseExcelMutation.isPending ? (
                                                        <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    )}
                                                    <span className="hidden xs:inline">Import</span>
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
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="w-full overflow-x-auto">
                                            <table className="w-full min-w-[700px] text-xs sm:text-sm">
                                                <thead className="bg-muted/80 border-b">
                                                    <tr>
                                                        <th className="text-left font-semibold text-muted-foreground uppercase tracking-wide px-4 md:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs">
                                                            #
                                                        </th>
                                                        <th className="text-left font-semibold text-muted-foreground uppercase tracking-wide px-4 md:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs">
                                                            Description *
                                                        </th>
                                                        <th className="text-center font-semibold text-muted-foreground uppercase tracking-wide px-4 md:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs">
                                                            HSN/SAC
                                                        </th>
                                                        <th className="text-right font-semibold text-muted-foreground uppercase tracking-wide px-4 md:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs">
                                                            Qty *
                                                        </th>
                                                        <th className="text-right font-semibold text-muted-foreground uppercase tracking-wide px-4 md:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs">
                                                            Unit Price *
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
                                                    {fields.map((fieldItem, index) => (
                                                        <tr
                                                            key={fieldItem.id}
                                                            className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                                                        >
                                                            <td className="px-4 md:px-6 py-2.5 sm:py-3 text-[11px] sm:text-sm text-muted-foreground">
                                                                {index + 1}
                                                            </td>
                                                            <td className="px-4 md:px-6 py-2.5 sm:py-3 align-top">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`items.${index}.description`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <Textarea
                                                                                    {...field}
                                                                                    data-testid={`input-item-description-${index}`}
                                                                                    placeholder="Item description"
                                                                                    className="bg-transparent border-0 focus-visible:ring-1 text-xs sm:text-sm min-h-[60px]"
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </td>
                                                            <td className="px-4 md:px-6 py-2.5 sm:py-3 text-center">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`items.${index}.hsnSac`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <Input
                                                                                    {...field}
                                                                                    maxLength={10}
                                                                                    data-testid={`input-item-hsnsac-${index}`}
                                                                                    placeholder="HSN/SAC"
                                                                                    className="bg-transparent border-0 focus-visible:ring-1 text-center text-xs sm:text-sm max-w-[120px] mx-auto"
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </td>
                                                            <td className="px-4 md:px-6 py-2.5 sm:py-3 text-right">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`items.${index}.quantity`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <Input
                                                                                    {...field}
                                                                                    type="number"
                                                                                    min="1"
                                                                                    onChange={(e) =>
                                                                                        field.onChange(
                                                                                            Number(e.target.value),
                                                                                        )
                                                                                    }
                                                                                    data-testid={`input-item-quantity-${index}`}
                                                                                    className="bg-transparent border-0 focus-visible:ring-1 text-right text-xs sm:text-sm max-w-[80px] ml-auto"
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </td>
                                                            <td className="px-4 md:px-6 py-2.5 sm:py-3 text-right">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`items.${index}.unitPrice`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <Input
                                                                                    {...field}
                                                                                    type="number"
                                                                                    step="0.01"
                                                                                    min="0"
                                                                                    onChange={(e) =>
                                                                                        field.onChange(
                                                                                            Number(e.target.value),
                                                                                        )
                                                                                    }
                                                                                    data-testid={`input-item-unit-price-${index}`}
                                                                                    className="bg-transparent border-0 focus-visible:ring-1 text-right text-xs sm:text-sm max-w-[100px] ml-auto"
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </td>
                                                            <td className="px-4 md:px-6 py-2.5 sm:py-3 text-right text-[11px] sm:text-sm font-semibold text-primary">
                                                                ₹{(items[index].quantity * items[index].unitPrice).toLocaleString()}
                                                            </td>
                                                            <td className="px-4 md:px-6 py-2.5 sm:py-3 text-center">
                                                                {fields.length > 1 && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => remove(index)}
                                                                        data-testid={`button-remove-item-${index}`}
                                                                        className="h-7 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans'] bg-muted/40">
                                            <span>{fields.length} line items</span>
                                            <span className="inline-flex items-center gap-1">
                                                <DollarSign className="h-3 w-3" />
                                                Subtotal:{" "}
                                                <span className="font-semibold text-foreground">
                                                    ₹{subtotal.toLocaleString()}
                                                </span>
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Additional Information */}
                                <Card className="border bg-card shadow-sm">
                                    <CardHeader className="border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="p-1.5 sm:p-2 rounded-md bg-primary/10 text-primary">
                                                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm sm:text-lg">Additional Information</CardTitle>
                                                <p className="hidden sm:block text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans']">
                                                    Notes and terms
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="notes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            value={field.value || ""}
                                                            data-testid="input-notes"
                                                            placeholder="Add any additional notes..."
                                                            rows={3}
                                                            className="resize-none text-sm"
                                                        />
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
                                                    <FormLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Terms & Conditions</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            value={field.value || ""}
                                                            rows={5}
                                                            data-testid="input-terms"
                                                            placeholder="Enter terms and conditions..."
                                                            className="resize-none text-sm"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Advanced Sections */}
                                <Card className="border bg-card shadow-sm">
                                    <CardHeader className="border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                        <div>
                                            <CardTitle className="text-sm sm:text-lg">Advanced Sections (Optional)</CardTitle>
                                            <p className="text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans'] mt-1">
                                                Add detailed technical and project information
                                            </p>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-3 sm:px-4 md:px-6 py-4 sm:py-5">
                                        <Tabs defaultValue="bom" className="w-full">
                                            <TabsList className="grid w-full grid-cols-3">
                                                <TabsTrigger value="bom">📦 BOM</TabsTrigger>
                                                <TabsTrigger value="sla">📋 SLA</TabsTrigger>
                                                <TabsTrigger value="timeline">📅 Timeline</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="bom" className="mt-4">
                                                <BOMSection
                                                    items={bomItems}
                                                    onChange={setBomItems}
                                                />
                                            </TabsContent>
                                            <TabsContent value="sla" className="mt-4">
                                                <SLASection
                                                    data={slaData}
                                                    onChange={setSlaData}
                                                />
                                            </TabsContent>
                                            <TabsContent value="timeline" className="mt-4">
                                                <TimelineSection
                                                    data={timelineData}
                                                    onChange={setTimelineData}
                                                />
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right column - Pricing Summary */}
                            <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-6 min-w-0">
                                <Card className="border bg-card shadow-sm">
                                    <CardHeader className="border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="p-1.5 sm:p-2 rounded-md bg-primary/10 text-primary">
                                                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <CardTitle className="text-sm sm:text-lg">
                                                    Pricing & Taxes
                                                </CardTitle>
                                                <p className="text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans'] truncate">
                                                    Financial overview
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 space-y-4">
                                        {activeTaxRates.length > 0 && (
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Quick Apply Tax Rate</Label>
                                                <Select onValueChange={applyTaxRate}>
                                                    <SelectTrigger data-testid="select-tax-rate" className="text-sm">
                                                        <SelectValue placeholder="Select a tax rate..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {activeTaxRates.map((rate) => (
                                                            <SelectItem key={rate.id} value={rate.id}>
                                                                {rate.region} - {rate.taxType} (CGST:{" "}
                                                                {rate.cgstRate}%, SGST: {rate.sgstRate}%,
                                                                IGST: {rate.igstRate}%)
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        <FormField
                                            control={form.control}
                                            name="discount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Discount (%)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            step="0.01"
                                                            onChange={(e) =>
                                                                field.onChange(Number(e.target.value))
                                                            }
                                                            data-testid="input-discount"
                                                            className="text-sm"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Separator />

                                        <div className="grid gap-3 grid-cols-3">
                                            <FormField
                                                control={form.control}
                                                name="cgst"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">CGST (%)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                step="0.01"
                                                                onChange={(e) =>
                                                                    field.onChange(Number(e.target.value))
                                                                }
                                                                data-testid="input-cgst"
                                                                className="text-sm"
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
                                                        <FormLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">SGST (%)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                step="0.01"
                                                                onChange={(e) =>
                                                                    field.onChange(Number(e.target.value))
                                                                }
                                                                data-testid="input-sgst"
                                                                className="text-sm"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="igst"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">IGST (%)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                step="0.01"
                                                                onChange={(e) =>
                                                                    field.onChange(Number(e.target.value))
                                                                }
                                                                data-testid="input-igst"
                                                                className="text-sm"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="shippingCharges"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Shipping Charges (₹)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            step="0.01"
                                                            onChange={(e) =>
                                                                field.onChange(Number(e.target.value))
                                                            }
                                                            data-testid="input-shipping"
                                                            className="text-sm"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Separator />

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
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Taxable Amount</span>
                                                <span className="font-semibold">
                                                    ₹{taxableAmount.toLocaleString()}
                                                </span>
                                            </div>
                                            {cgstAmount > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-muted-foreground">CGST ({cgst}%)</span>
                                                    <span className="font-semibold">
                                                        ₹{cgstAmount.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                            {sgstAmount > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-muted-foreground">SGST ({sgst}%)</span>
                                                    <span className="font-semibold">
                                                        ₹{sgstAmount.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                            {igstAmount > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-muted-foreground">IGST ({igst}%)</span>
                                                    <span className="font-semibold">
                                                        ₹{igstAmount.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                            {shippingCharges > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-muted-foreground">Shipping</span>
                                                    <span className="font-semibold">
                                                        ₹{Number(shippingCharges).toLocaleString()}
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
                                                <span className="text-lg sm:text-2xl font-bold text-primary" data-testid="text-total">
                                                    ₹{total.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 pt-2">
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting || fields.length === 0}
                                                className="w-full justify-center gap-2 text-xs sm:text-sm"
                                                data-testid="button-create-quote"
                                            >
                                                {isSubmitting && (
                                                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                                                )}
                                                {isEditMode ? "Update Quote" : "Create Quote"}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    setLocation(
                                                        isEditMode ? `/quotes/${params?.id}` : "/quotes",
                                                    )
                                                }
                                                className="w-full justify-center gap-2 text-xs sm:text-sm"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
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