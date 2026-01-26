import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Form } from "@/components/ui/form";
import { 
    Home, 
    ChevronRight, 
    Edit, 
    Loader2, 
    ArrowLeft, 
    ArrowRight, 
    Check,
    Save,
    RotateCcw
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import type { Client } from "@shared/schema";
import { CollaborationPresence } from "@/components/collaboration-presence";
import { useCollaboration } from "@/lib/websocket-context";
import { QuoteBasicInfo } from "@/components/quote/quote-basic-info";
import { QuoteLineItems } from "@/components/quote/quote-line-items";
import { QuoteAdvanced } from "@/components/quote/quote-advanced";
import { QuoteReview } from "@/components/quote/quote-review";
import type { ExecBOMData, ExecBOMItemRow } from "@/types/bom-types";
import type { SLAData } from "@/components/quote/sla-section";
import type { TimelineData } from "@/components/quote/timeline-section";
import { cn } from "@/lib/utils";
import Decimal from "decimal.js";

// Configure Decimal for consistent behavior with backend
Decimal.set({ precision: 20, rounding: 4 }); // 4 = ROUND_HALF_UP

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
    discount: string;
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
    items: { productId?: string | null; description: string; quantity: number; unitPrice: number; hsnSac?: string }[];
    bomSection?: string | null;
    slaSection?: string | null;
    timelineSection?: string | null;
    currency: string;
    version?: number;
}

interface QuoteDetail {
    id: string;
    quoteNumber: string;
    status: string;
    clientId: string;
    validityDays: number;
    referenceNumber?: string;
    attentionTo?: string;
    currency?: string;
    notes?: string;
    termsAndConditions?: string;
    quoteDate?: string;
    version: number;
    items: Array<{
        id: string;
        productId?: string | null;
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
    currency: z.string().default("INR"),
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
                productId: z.string().nullable().optional(),
                description: z.string().min(1, "Description is required"),
                quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
                unitPrice: z.coerce.number().min(0, "Unit price must be positive"),
                hsnSac: z.string().max(10).optional(),
            }),
        )
        .min(1, "At least one item is required"),
});

const STEPS = [
    { id: 0, title: "Basic Info", description: "Client & Validity" },
    { id: 1, title: "Line Items", description: "Products & Services" },
    { id: 2, title: "Advanced", description: "BOM, SLA & Timeline" },
    { id: 3, title: "Review", description: "Pricing & Finalize" },
];

export default function QuoteCreate() {
    const [, setLocation] = useLocation();
    const [, params] = useRoute("/quotes/:id/edit");
    const { toast } = useToast();
    const { user } = useAuth();
    const isEditMode = !!params?.id;

    // Wizard State
    const [currentStep, setCurrentStep] = useState(0);

    // Real-time collaboration - only for edit mode
    const { } = useCollaboration(isEditMode ? "quote" : "", isEditMode ? params?.id || "" : "");

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
            staleTime: 0,
            gcTime: 0,
        });

    const form = useForm<z.infer<typeof quoteFormSchema>>({
        resolver: zodResolver(quoteFormSchema),
        shouldUnregister: false,
        defaultValues: {
            clientId: "",
            currency: "INR",
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
            items: [{ productId: null, description: "", quantity: 1, unitPrice: 0, hsnSac: "" }],
        },
    });

    // Advanced Sections State
    const [bomData, setBomData] = useState<ExecBOMData>({ blocks: [] });
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

    // Pre-select client from URL query parameter
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

            const discountPercent = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0;
            const cgstPercent = taxBase > 0 ? (cgstAmount / taxBase) * 100 : 0;
            const sgstPercent = taxBase > 0 ? (sgstAmount / taxBase) * 100 : 0;
            const igstPercent = taxBase > 0 ? (igstAmount / taxBase) * 100 : 0;

            form.reset({
                clientId: existingQuote.clientId,
                currency: existingQuote.currency || "INR",
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
                    productId: item.productId || null,
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: Number(item.unitPrice),
                    hsnSac: item.hsnSac || "",
                })),
            });

            if (existingQuote.bomSection) {
                try {
                    const parsed = JSON.parse(existingQuote.bomSection);
                    if (Array.isArray(parsed)) {
                        const legacyItems = parsed;
                        const newItems: ExecBOMItemRow[] = legacyItems.map((item: any) => ({
                            type: 'item',
                            id: item.id || crypto.randomUUID(),
                            module: item.partNumber || "Item",
                            description: item.description || "",
                            qty: item.quantity || 1,
                            selected: true
                        }));
                        setBomData({
                            blocks: [{
                                id: crypto.randomUUID(),
                                title: "Legacy BOM Block",
                                sections: [{
                                    id: crypto.randomUUID(),
                                    label: "Legacy Import",
                                    items: newItems
                                }]
                            }]
                        });
                    } else {
                        setBomData(parsed);
                    }
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
            // Check for Optimistic Locking Error
            if (error.res?.status === 409) {
                toast({
                    title: "Conflict Detected",
                    description: error.message || "This quote has been modified by someone else.",
                    variant: "destructive",
                    action: <div onClick={() => window.location.reload()} className="cursor-pointer font-bold underline">Reload</div>
                });
            } else {
                toast({
                    title: "Failed to update quote",
                    description: error.message,
                    variant: "destructive",
                });
            }
        },
    });

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    const onSubmit = async (values: z.infer<typeof quoteFormSchema>) => {
        const items = values.items;

        // Use Decimal.js for calculations
        const subtotal = items.reduce((sum, item) => {
            const qty = new Decimal(item.quantity);
            const price = new Decimal(item.unitPrice);
            return sum.plus(qty.times(price));
        }, new Decimal(0));

        const discountPercent = new Decimal(values.discount);
        const discountAmount = subtotal.times(discountPercent).dividedBy(100);
        const taxableAmount = subtotal.minus(discountAmount);

        const cgstAmount = taxableAmount.times(values.cgst).dividedBy(100);
        const sgstAmount = taxableAmount.times(values.sgst).dividedBy(100);
        const igstAmount = taxableAmount.times(values.igst).dividedBy(100);
        
        const shippingCharges = new Decimal(values.shippingCharges);
        const total = taxableAmount.plus(cgstAmount).plus(sgstAmount).plus(igstAmount).plus(shippingCharges);

        const quoteData: QuoteCreatePayload = {
            clientId: values.clientId,
            currency: values.currency,
            validityDays: values.validityDays,
            referenceNumber: values.referenceNumber || undefined,
            attentionTo: values.attentionTo || undefined,
            discount: discountAmount.toFixed(2),
            cgst: cgstAmount.toFixed(2),
            sgst: sgstAmount.toFixed(2),
            igst: igstAmount.toFixed(2),
            shippingCharges: shippingCharges.toFixed(2),
            subtotal: subtotal.toFixed(2),
            total: total.toFixed(2),
            notes: values.notes || undefined,
            termsAndConditions: values.termsAndConditions || undefined,
            status: isEditMode ? (existingQuote?.status as any) : "draft",
            version: isEditMode ? existingQuote?.version : undefined,
            quoteDate: isEditMode
                ? existingQuote?.quoteDate || new Date().toISOString()
                : new Date().toISOString(),
            items: values.items.map((i) => ({
                productId: i.productId || null,
                description: i.description,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                hsnSac: i.hsnSac || undefined,
            })),
            bomSection:
                bomData.blocks.length > 0 ? JSON.stringify(bomData) : null,
            slaSection:
                slaData.overview || slaData.metrics.length > 0
                    ? JSON.stringify(slaData)
                    : null,
            timelineSection:
                timelineData.projectOverview ||
                timelineData.milestones.length > 0
                    ? JSON.stringify(timelineData)
                    : null,
        };

        if (isEditMode) {
            await updateMutation.mutateAsync(quoteData);
        } else {
            await createMutation.mutateAsync(quoteData);
        }
    };

    // Wizard Navigation Logic
    const nextStep = async () => {
        let isValid = false;
        
        // Validate specific fields based on step
        if (currentStep === 0) {
            isValid = await form.trigger(["clientId", "currency", "validityDays", "referenceNumber", "attentionTo"]);
        } else if (currentStep === 1) {
            isValid = await form.trigger(["items"]);
        } else {
            isValid = true;
        }

        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (isEditMode && isLoadingQuote) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (isEditMode && existingQuote?.status === "invoiced") {
        return (
            <div className="min-h-screen bg-background p-8 text-center">
                <p className="text-muted-foreground">This quote has been invoiced and cannot be edited.</p>
                <Button className="mt-4" onClick={() => setLocation(`/quotes/${params?.id}`)}>Back to Quote</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-muted/5">
            <div className="w-full max-w-12xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border shadow-sm w-fit text-sm animate-in fade-in slide-in-from-top-2 duration-500">
                    <button onClick={() => setLocation("/")} className="hover:text-primary transition-colors"><Home className="h-4 w-4" /></button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <button onClick={() => setLocation("/quotes")} className="hover:text-primary transition-colors">Quotes</button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-primary">{isEditMode ? "Edit Quote" : "New Quote"}</span>
                </nav>

                {/* Header with Steps */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {isEditMode ? `Edit Quote ${existingQuote?.quoteNumber}` : "Create New Quote"}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Follow the steps below to generate a comprehensive quote.
                        </p>
                    </div>
                    
                    {/* Real-time collaboration indicator */}
                    {isEditMode && params?.id && (
                        <CollaborationPresence 
                            entityType="quote" 
                            entityId={params.id}
                            className="self-center"
                        />
                    )}
                </div>

                {/* Wizard Stepper */}
                {/* Mobile Stepper Indicator */}
                <div className="md:hidden space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium">
                        <span className="text-primary">Step {currentStep + 1} of {STEPS.length}</span>
                        <span className="text-muted-foreground">{STEPS[currentStep].title}</span>
                    </div>
                    <Progress value={((currentStep + 1) / STEPS.length) * 100} className="h-2" />
                </div>

                {/* Desktop Stepper */}
                <div className="hidden md:block w-full bg-card border rounded-xl p-4 shadow-sm overflow-x-auto">
                    <div className="flex items-center justify-between min-w-[600px]">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="flex flex-1 items-center last:flex-none">
                                <div className={cn(
                                    "flex items-center gap-3",
                                    index <= currentStep ? "text-primary" : "text-muted-foreground"
                                )}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                                        index < currentStep ? "bg-primary text-primary-foreground" :
                                        index === currentStep ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                                        "bg-muted text-muted-foreground"
                                    )}>
                                        {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">{step.title}</span>
                                        <span className="text-xs text-muted-foreground hidden lg:block">{step.description}</span>
                                    </div>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div className={cn(
                                        "h-[2px] w-full mx-4 rounded-full transition-all duration-500",
                                        index < currentStep ? "bg-primary" : "bg-muted"
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="min-h-[400px]">
                            {currentStep === 0 && (
                                <QuoteBasicInfo form={form} clients={clients} />
                            )}
                            {currentStep === 1 && (
                                <QuoteLineItems form={form} />
                            )}
                            {currentStep === 2 && (
                                <QuoteAdvanced 
                                    form={form} 
                                    bomData={bomData} 
                                    setBomData={setBomData}
                                    slaData={slaData}
                                    setSlaData={setSlaData}
                                    timelineData={timelineData}
                                    setTimelineData={setTimelineData}
                                />
                            )}
                            {currentStep === 3 && (
                                <QuoteReview form={form} activeTaxRates={activeTaxRates} />
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t z-10 animate-in slide-in-from-bottom-2">
                            <div className="w-full max-w-12xl mx-auto p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                                 <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    disabled={currentStep === 0}
                                    className="w-full sm:w-32 gap-2 order-2 sm:order-1"
                                 >
                                    <ArrowLeft className="h-4 w-4" /> Back
                                 </Button>

                                 <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setLocation(isEditMode ? `/quotes/${params?.id}` : "/quotes")}
                                        className="flex-1 sm:flex-initial"
                                    >
                                        Cancel
                                    </Button>
                                    
                                    {currentStep < STEPS.length - 1 ? (
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            className="flex-1 sm:flex-initial w-full sm:w-32 gap-2"
                                        >
                                            Next <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 sm:flex-initial w-full sm:w-40 gap-2"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {isEditMode ? "Update" : "Create"}
                                        </Button>
                                    )}
                                 </div>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}