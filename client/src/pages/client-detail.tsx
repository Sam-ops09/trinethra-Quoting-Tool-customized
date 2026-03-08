import * as React from "react";
import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Building2,
    FileText,
    DollarSign,
    Plus,
    Trash2,
    Tag,
    MessageSquare,
    Calendar,
    User,
    Users,
    X,
    Palette,
    Loader2,
    Home,
    ChevronRight,
    Eye,
    Download,
    Sparkles,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PermissionGuard } from "@/components/permission-guard";
import type {
    Client,
    ClientTag,
    ClientCommunication,
    Quote,
    Invoice,
} from "@shared/schema";
import { format } from "date-fns";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { formatCurrency } from "@/lib/currency";
import { ClientFormDialog, type ClientFormValues, clientFormSchema } from "@/components/client-form-dialog";

interface Theme {
    name: string;
    displayName: string;
    description: string;
    colors: {
        primary: string;
        primaryLight: string;
        accent: string;
        accentLight: string;
    };
}

const communicationSchema = z.object({
    type: z.enum(["email", "call", "meeting", "note"]),
    subject: z.string().optional(),
    message: z.string().min(1, "Message is required"),
});

type CommunicationFormData = z.infer<typeof communicationSchema>;

interface ExtendedQuote extends Quote {
    clientName?: string;
}

interface ExtendedInvoice extends Invoice {
    clientName?: string;
    quoteNumber?: string;
}

export default function ClientDetail() {
    const [, params] = useRoute("/clients/:id");
    const clientId = params?.id;
    const { toast } = useToast();

    const [newTag, setNewTag] = useState("");
    const [isCommunicationDialogOpen, setIsCommunicationDialogOpen] =
        useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedSegment, setSelectedSegment] = useState("");
    const [selectedTheme, setSelectedTheme] = useState("");

 
    // Feature flags
    const canViewTags = useFeatureFlag('clients_tags');
    const canViewHistory = useFeatureFlag('clients_communicationHistory');
    const canViewTheme = useFeatureFlag('clients_preferredTheme') && useFeatureFlag('pdf_clientSpecificThemes');
    const canViewQuotes = useFeatureFlag('quotes_module');
    const canViewInvoices = useFeatureFlag('invoices_module');
    const canManageSegments = useFeatureFlag('clients_segmentation');
    const canViewGSTIN = useFeatureFlag('clients_gstin');
    const canViewBilling = useFeatureFlag('clients_billingAddress');
    const canViewShipping = useFeatureFlag('clients_shippingAddress');
    const canCreateQuote = useFeatureFlag('quotes_create');
    const canViewTimeline = useFeatureFlag('clients_timeline');
    const canViewNotes = useFeatureFlag('clients_notes');

    // Fetch client data
    const { data: client, isLoading: clientLoading } = useQuery<Client>({
        queryKey: [`/api/clients/${clientId}`],
        enabled: !!clientId,
    });

    // Update theme selection state when client data is loaded
    React.useEffect(() => {
        if (client) {
            setSelectedSegment((client as any).segment || "");
            setSelectedTheme((client as any).preferredTheme || "");
        }
    }, [client]);

    // Fetch themes
    const { data: themes = [] } = useQuery<Theme[]>({
        queryKey: ["/api/themes"],
    });

    // Fetch suggested theme for segment
    const { data: suggestedTheme } = useQuery<Theme>({
        queryKey: [
            `/api/themes/segment/${selectedSegment || (client as any)?.segment}`,
        ],
        enabled: !!(selectedSegment || (client as any)?.segment),
    });

    // Fetch client tags
    const { data: tags = [] } = useQuery<ClientTag[]>({
        queryKey: [`/api/clients/${clientId}/tags`],
        enabled: !!clientId,
    });

    // Fetch client communications
    const { data: communications = [] } = useQuery<ClientCommunication[]>({
        queryKey: [`/api/clients/${clientId}/communications`],
        enabled: !!clientId,
    });

    // Fetch all quotes and filter for this client
    const { data: allQuotes = [] } = useQuery<ExtendedQuote[]>({
        queryKey: ["/api/quotes"],
    });

    const clientQuotes = allQuotes.filter((q) => q.clientId === clientId);

    // Fetch all invoices and filter for this client's quotes
    const { data: allInvoices = [] } = useQuery<ExtendedInvoice[]>({
        queryKey: ["/api/invoices"],
    });

    const clientInvoices = allInvoices.filter((inv) =>
        clientQuotes.some(
            (q) => q.id === inv.quoteNumber || q.quoteNumber === inv.quoteNumber
        )
    );

    // Mutations
    const addTagMutation = useMutation({
        mutationFn: async (tag: string) => {
            return await apiRequest("POST", `/api/clients/${clientId}/tags`, { tag });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [`/api/clients/${clientId}/tags`],
            });
            setNewTag("");
            toast({
                title: "Tag added",
                description: "Tag has been added successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Failed to add tag",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const removeTagMutation = useMutation({
        mutationFn: async (tagId: string) => {
            return await apiRequest("DELETE", `/api/clients/tags/${tagId}`, {});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [`/api/clients/${clientId}/tags`],
            });
            toast({
                title: "Tag removed",
                description: "Tag has been removed successfully.",
            });
        },
    });

    const communicationForm = useForm<CommunicationFormData>({
        resolver: zodResolver(communicationSchema),
        defaultValues: {
            type: "note",
            subject: "",
            message: "",
        },
    });

    const createCommunicationMutation = useMutation({
        mutationFn: async (data: CommunicationFormData) => {
            return await apiRequest(
                "POST",
                `/api/clients/${clientId}/communications`,
                data
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [`/api/clients/${clientId}/communications`],
            });
            setIsCommunicationDialogOpen(false);
            communicationForm.reset();
            toast({
                title: "Communication logged",
                description: "Communication has been recorded successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Failed to log communication",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const deleteCommunicationMutation = useMutation({
        mutationFn: async (commId: string) => {
            return await apiRequest(
                "DELETE",
                `/api/clients/communications/${commId}`,
                {}
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [`/api/clients/${clientId}/communications`],
            });
            toast({
                title: "Communication deleted",
                description: "Communication has been removed successfully.",
            });
        },
    });

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientFormSchema),
        defaultValues: {
            name: client?.name || "",
            email: client?.email || "",
            phone: client?.phone || "",
            billingAddress: client?.billingAddress || "",
            shippingAddress: client?.shippingAddress || "",
            gstin: client?.gstin || "",
            contactPerson: client?.contactPerson || "",
            segment: (client as any)?.segment || "corporate",
        },
    });

    // Update form when client data is loaded
    React.useEffect(() => {
        if (client) {
            form.reset({
                name: client.name,
                email: client.email,
                phone: client.phone || "",
                billingAddress: client.billingAddress || "",
                shippingAddress: client.shippingAddress || "",
                gstin: client.gstin || "",
                contactPerson: client.contactPerson || "",
                segment: (client as any).segment || "corporate",
            });
        }
    }, [client, form]);

    const updateClientMutation = useMutation({
        mutationFn: (data: ClientFormValues) => 
            apiRequest("PUT", `/api/clients/${clientId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}`] });
            toast({ title: "Success", description: "Client details updated successfully" });
            setIsEditDialogOpen(false);
        },
        onError: (err: any) => {
            toast({ 
                title: "Error", 
                description: err.message || "Failed to update client", 
                variant: "destructive" 
            });
        }
    });

    const canEditClient = useFeatureFlag('clients_edit');

    // Theme update mutation
    const updateThemeMutation = useMutation({
        mutationFn: async (data: { segment?: string; preferredTheme?: string }) => {
            return await apiRequest("PATCH", `/api/clients/${clientId}/theme`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}`] });
            toast({
                title: "Theme updated",
                description: "Client theme preferences have been saved.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Failed to update theme",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleThemeUpdate = async () => {
        await updateThemeMutation.mutateAsync({
            segment: selectedSegment || undefined,
            preferredTheme: selectedTheme || undefined,
        });
    };

    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTag.trim()) {
            addTagMutation.mutate(newTag.trim());
        }
    };

    const onCommunicationSubmit = (values: CommunicationFormData) => {
        createCommunicationMutation.mutate(values);
    };

    const getCommunicationIcon = (type: string) => {
        switch (type) {
            case "email":
                return <Mail className="h-4 w-4" />;
            case "call":
                return <Phone className="h-4 w-4" />;
            case "meeting":
                return <Calendar className="h-4 w-4" />;
            case "note":
            default:
                return <MessageSquare className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "draft":
                return "bg-muted text-muted-foreground";
            case "sent":
                return "bg-primary/10 text-primary";
            case "approved":
                return "bg-success/10 text-success";
            case "rejected":
                return "bg-destructive/10 text-destructive";
            case "invoiced":
                return "bg-accent/10 text-accent";
            case "paid":
                return "bg-success/10 text-success";
            case "partial":
                return "bg-warning/10 text-warning";
            case "pending":
                return "bg-primary/10 text-primary";
            case "overdue":
                return "bg-destructive/10 text-destructive";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

    if (clientLoading) {
        return (
            <div className="min-h-screen">
                <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-3">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 rounded-lg" />
                        ))}
                    </div>
                    <Skeleton className="h-64 w-full rounded-lg" />
                </div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="min-h-screen">
                <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                            <Building2 className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4 opacity-60" />
                            <h3 className="text-base sm:text-lg font-semibold mb-2">
                                Client not found
                            </h3>
                            <Link href="/clients">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Clients
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const clientSegment = (client as any)?.segment;
    const clientPreferredTheme = (client as any)?.preferredTheme;

    return (
        <div className="min-h-screen">
            <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-3">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-fit">
                    <Link href="/">
                        <button className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105">
                            <Home className="h-3.5 w-3.5" />
                            <span>Home</span>
                        </button>
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <Link href="/clients">
                        <button className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105">
                            <Users className="h-3.5 w-3.5" />
                            <span>Clients</span>
                        </button>
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white truncate">
                        <Users className="h-3.5 w-3.5" />
                        {client.name}
                    </span>
                </nav>

                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                        <Link href="/clients">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                            </Button>
                        </Link>
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                                {client.name}
                            </h1>
                            <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                Client overview and activity
                            </p>
                        </div>
                    </div>
                    {canEditClient && (
                        <PermissionGuard resource="clients" action="edit">
                            <Button
                                onClick={() => setIsEditDialogOpen(true)}
                                variant="outline"
                                size="sm"
                                className="h-9 px-3 text-xs flex items-center gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                            >
                                <Building2 className="h-3.5 w-3.5" />
                                <span>Edit Detail</span>
                            </Button>
                        </PermissionGuard>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
                    {/* Quotes */}
                    {canViewQuotes && (
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                                            Quotes
                                        </p>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                                            {clientQuotes.length}
                                        </p>
                                    </div>
                                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
                                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
 
                    {/* Invoices */}
                    {canViewInvoices && (
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                                            Invoices
                                        </p>
                                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                            {clientInvoices.length}
                                        </p>
                                    </div>
                                    <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                                        <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
 
                    {/* Communications */}
                    {canViewHistory && (
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                                            Chats
                                        </p>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                                            {communications.length}
                                        </p>
                                    </div>
                                    <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center shrink-0">
                                        <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
 
                    {/* Tags */}
                    {canViewTags && (
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                                            Tags
                                        </p>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                                            {tags.length}
                                        </p>
                                    </div>
                                    <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0">
                                        <Tag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

            {/* COMPANY INFO */}
            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                            <Building2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <CardTitle className="text-sm font-bold">Company Information</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-3">
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                        {/* Email */}
                        <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Mail className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Email</p>
                            </div>
                            <p className="text-xs text-slate-900 dark:text-white break-all">{client.email}</p>
                        </div>

                        {/* Phone */}
                        {client.phone && (
                            <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Phone className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Phone</p>
                                </div>
                                <p className="text-xs text-slate-900 dark:text-white">{client.phone}</p>
                            </div>
                        )}

                        {/* Contact Person */}
                        {client.contactPerson && (
                            <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <User className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Contact Person</p>
                                </div>
                                <p className="text-xs text-slate-900 dark:text-white break-words">{client.contactPerson}</p>
                            </div>
                        )}

                         {/* GSTIN */}
                        {canViewGSTIN && client.gstin && (
                            <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <FileText className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">GSTIN</p>
                                </div>
                                <p className="font-mono text-xs text-slate-900 dark:text-white break-all">{client.gstin}</p>
                            </div>
                        )}
 
                        {/* Segment */}
                        {canManageSegments && clientSegment && (
                            <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Tag className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Segment</p>
                                </div>
                                <Badge variant="secondary" className="capitalize text-[10px] px-1.5 py-0">
                                    {clientSegment}
                                </Badge>
                            </div>
                        )}

                         {/* Billing Address */}
                        {canViewBilling && client.billingAddress && (
                            <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 sm:col-span-2">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <MapPin className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Billing Address</p>
                                </div>
                                <p className="text-xs text-slate-900 dark:text-white whitespace-pre-line break-words leading-relaxed">
                                    {client.billingAddress}
                                </p>
                            </div>
                        )}
 
                        {/* Shipping Address */}
                        {canViewShipping && client.shippingAddress && (
                            <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 sm:col-span-2">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <MapPin className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Shipping Address</p>
                                </div>
                                <p className="text-xs text-slate-900 dark:text-white whitespace-pre-line break-words leading-relaxed">
                                    {client.shippingAddress}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* TABS + CONTENT */}
            <Tabs defaultValue="quotes" className="space-y-3">
                {/* tab bar – horizontal scroll on mobile */}
                 <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                    <TabsList className="inline-flex sm:flex flex-wrap w-full h-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1">
                        {canViewQuotes && (
                            <TabsTrigger
                                value="quotes"
                                className="text-[10px] sm:text-xs py-2 px-2 sm:px-3 gap-1 flex-1 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm rounded"
                            >
                                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                <span className="hidden sm:inline">Quotes</span>
                                <span className="sm:hidden">Q</span>
                                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">
                                    {clientQuotes.length}
                                </Badge>
                            </TabsTrigger>
                        )}
                        {canViewInvoices && (
                            <TabsTrigger
                                value="invoices"
                                className="text-[11px] sm:text-xs py-2.5 px-3 sm:px-4 gap-1.5 flex-1 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                <span className="hidden sm:inline">Invoices</span>
                                <span className="sm:hidden">I</span>
                                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">
                                    {clientInvoices.length}
                                </Badge>
                            </TabsTrigger>
                        )}
                        {canViewTheme && (
                            <TabsTrigger
                                value="theme"
                                className="text-[11px] sm:text-xs py-2.5 px-3 sm:px-4 gap-1.5 flex-1 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                <span className="hidden sm:inline">Theme</span>
                                <span className="sm:hidden">Th</span>
                            </TabsTrigger>
                        )}
                        {canViewTags && (
                            <TabsTrigger
                                value="tags"
                                className="text-[11px] sm:text-xs py-2.5 px-3 sm:px-4 gap-1.5 flex-1 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                <span className="hidden sm:inline">Tags</span>
                                <span className="sm:hidden">Tg</span>
                                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">
                                    {tags.length}
                                </Badge>
                            </TabsTrigger>
                        )}
                        {canViewHistory && (
                            <TabsTrigger
                                value="communications"
                                className="text-[11px] sm:text-xs py-2.5 px-3 sm:px-4 gap-1.5 flex-1 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                <span className="hidden sm:inline">History</span>
                                <span className="sm:hidden">H</span>
                                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">
                                    {communications.length}
                                </Badge>
                            </TabsTrigger>
                        )}
                    </TabsList>
                </div>

                {/* QUOTES */}
                {canViewQuotes && (
                    <TabsContent value="quotes" className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <h3 className="text-base sm:text-lg font-semibold">Quotes</h3>
                            {canCreateQuote && (
                                <PermissionGuard resource="quotes" action="create" tooltipText="Only Sales Managers and Sales Executives can create quotes">
                                <Link href={`/quotes/create?clientId=${clientId}`}>
                                    <Button size="sm" className="w-full sm:w-auto btn-classy shadow-elegant-lg">
                                    <Plus className="h-4 w-4 mr-2" />
                                    <span>New quote</span>
                                    </Button>
                                </Link>
                                </PermissionGuard>
                            )}
                        </div>
 
                        {clientQuotes.length > 0 ? (
                            <div className="space-y-3">
                                {clientQuotes.map((quote) => (
                                    <Card
                                        key={quote.id}
                                        className="border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md"
                                    >
                                        <CardContent className="p-4 sm:p-5">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Link href={`/quotes/${quote.id}`}>
                                                                <h4 className="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors cursor-pointer">
                                                                    {quote.quoteNumber}
                                                                </h4>
                                                            </Link>
                                                            <Badge variant="secondary" className="text-[10px] capitalize px-1.5 py-0">
                                                                {quote.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar className="h-3.5 w-3.5" />
                                                                <span>{format(new Date(quote.createdAt!), "MMM d, yyyy")}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                                                                <DollarSign className="h-3.5 w-3.5" />
                                                                <span>{formatCurrency(Number(quote.total || 0))}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 sm:self-center">
                                                    <Link href={`/quotes/${quote.id}`}>
                                                        <Button variant="ghost" size="sm" className="h-8 xs:h-9 hover:bg-primary/10 hover:text-primary group">
                                                            <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/quotes/${quote.id}/pdf`}>
                                                        <Button variant="ghost" size="sm" className="h-8 xs:h-9 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="border-dashed border-2 py-10 xs:py-16 text-center">
                                <CardContent className="flex flex-col items-center">
                                    <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
                                        <FileText className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold mb-1">No quotes yet</h3>
                                    <p className="text-sm text-muted-foreground font-['Open_Sans'] mb-6 max-w-md px-4">
                                        Create your first quote for this client and it will appear here.
                                    </p>
                                    {canCreateQuote && (
                                        <PermissionGuard resource="quotes" action="create" tooltipText="Only Sales Managers and Sales Executives can create quotes">
                                        <Link href={`/quotes/create?clientId=${clientId}`}>
                                            <Button size="lg" className="btn-classy shadow-elegant-lg">
                                            <Plus className="h-5 w-5 mr-2" />
                                            Create quote
                                            </Button>
                                        </Link>
                                        </PermissionGuard>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                )}

                {/* INVOICES */}
                {canViewInvoices && (
                    <TabsContent value="invoices" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base sm:text-lg font-semibold">Invoices</h3>
                        </div>
 
                        {clientInvoices.length > 0 ? (
                            <div className="space-y-3">
                                {clientInvoices.map((invoice) => (
                                    <Card
                                        key={invoice.id}
                                        className="border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 transition-all duration-300 shadow-sm hover:shadow-md"
                                    >
                                        <CardContent className="p-4 sm:p-5">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                                        <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Link href={`/invoices/${invoice.id}`}>
                                                                <h4 className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                                                                    {invoice.invoiceNumber}
                                                                </h4>
                                                            </Link>
                                                            <Badge variant="secondary" className="text-[10px] capitalize px-1.5 py-0">
                                                                {invoice.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar className="h-3.5 w-3.5" />
                                                                <span>{format(new Date(invoice.createdAt!), "MMM d, yyyy")}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                                                                <DollarSign className="h-3.5 w-3.5" />
                                                                <span>{formatCurrency(Number(invoice.total || 0))}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 sm:self-center">
                                                    <Link href={`/invoices/${invoice.id}`}>
                                                        <Button variant="ghost" size="sm" className="h-8 xs:h-9 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 group">
                                                            <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="border-dashed border-2 py-12 xs:py-20 text-center">
                                <CardContent className="flex flex-col items-center">
                                    <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
                                        <DollarSign className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold mb-1">No invoices yet</h3>
                                    <p className="text-sm text-muted-foreground font-['Open_Sans'] max-w-md px-4">
                                        Invoices created from quotes for this client will appear here.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                )}

                {/* THEME */}
                {canViewTheme && (
                    <TabsContent value="theme" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base sm:text-lg font-semibold">
                                Preferred PDF theme
                            </h3>
                        </div>
                        <Card>
                            <CardContent className="pt-6 space-y-6">
                                <Alert className="bg-primary/5 border-primary/20">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <AlertDescription className="text-xs sm:text-sm">
                                        Select the default theme for PDF generation for this specific
                                        client.
                                    </AlertDescription>
                                </Alert>
 
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <Palette className="h-4 w-4 text-primary" />
                                        Available themes
                                    </h4>
 
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {themes.map((theme) => {
                                            const isSelected = selectedTheme === theme.name;
                                            return (
                                                <Card
                                                    key={theme.name}
                                                    className={`
                                                        cursor-pointer transition-all duration-300 border-2
                                                        ${
                                                            isSelected
                                                                ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                                                                : "border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                                                        }
                                                    `}
                                                    onClick={() => setSelectedTheme(theme.name)}
                                                >
                                                    <CardContent className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="w-12 h-12 rounded-lg shadow-inner flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0"
                                                                style={{ backgroundColor: theme.colors.primary }}
                                                            >
                                                                <div
                                                                    className="h-1/3 w-full"
                                                                    style={{ backgroundColor: theme.colors.primaryLight }}
                                                                />
                                                                <div
                                                                    className="h-1/3 w-full"
                                                                    style={{ backgroundColor: theme.colors.accent }}
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-sm truncate">
                                                                    {theme.name}
                                                                </p>
                                                                <div className="flex gap-1 mt-1">
                                                                    <div
                                                                        className="w-2.5 h-2.5 rounded-full"
                                                                        style={{
                                                                            backgroundColor: theme.colors.primary,
                                                                        }}
                                                                    />
                                                                    <div
                                                                        className="w-2.5 h-2.5 rounded-full"
                                                                        style={{
                                                                            backgroundColor: theme.colors.primaryLight,
                                                                        }}
                                                                    />
                                                                    <div
                                                                        className="w-2.5 h-2.5 rounded-full"
                                                                        style={{
                                                                            backgroundColor: theme.colors.accent,
                                                                        }}
                                                                    />
                                                                    <span className="text-[11px] text-muted-foreground">
                                                                        Accent
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
 
                                {/* Save Button */}
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedSegment(clientSegment || "");
                                            setSelectedTheme(clientPreferredTheme || "");
                                        }}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleThemeUpdate}
                                        disabled={updateThemeMutation.isPending}
                                    >
                                        {updateThemeMutation.isPending && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Save theme settings
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {/* TAGS */}
                {canViewTags && (
                    <TabsContent value="tags" className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h3 className="text-base sm:text-lg font-semibold">Client tags</h3>
                        </div>
                        <Card>
                            <CardContent className="pt-5 sm:pt-6">
                                <form
                                    onSubmit={handleAddTag}
                                    className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4"
                                >
                                    <Input
                                        placeholder="Add a tag (e.g., VIP, Wholesale, etc.)"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        data-testid="input-new-tag"
                                        className="text-sm h-10"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={!newTag.trim() || addTagMutation.isPending}
                                        size="sm"
                                        className="whitespace-nowrap w-full sm:w-auto"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add
                                    </Button>
                                </form>
                                <div className="flex flex-wrap gap-2">
                                    {tags.length > 0 ? (
                                        tags.map((tag) => (
                                            <Badge
                                                key={tag.id}
                                                variant="secondary"
                                                className="px-2.5 sm:px-3 py-1 text-xs sm:text-sm flex items-center gap-1.5"
                                            >
                                                <Tag className="h-3 w-3" />
                                                <span className="max-w-[100px] sm:max-w-[120px] lg:max-w-none truncate">
                                                    {tag.tag}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTagMutation.mutate(tag.id)}
                                                    className="ml-0.5 hover:text-destructive"
                                                    data-testid={`button-remove-tag-${tag.id}`}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-xs sm:text-sm text-muted-foreground font-['Open_Sans']">
                                            No tags yet. Add tags to organise and categorise this client.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {/* COMMUNICATIONS */}
                <TabsContent value="communications" className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="text-base sm:text-lg font-semibold">
                            Communication history
                        </h3>
                        {canViewHistory && (
                            <Dialog
                                open={isCommunicationDialogOpen}
                                onOpenChange={setIsCommunicationDialogOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button size="sm" className="self-start w-full sm:w-auto">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Log communication
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] max-w-[600px] p-4 sm:p-6">
                                    <DialogHeader className="space-y-2 sm:space-y-3">
                                        <DialogTitle className="text-lg sm:text-xl">Log communication</DialogTitle>
                                        <DialogDescription className="text-xs sm:text-sm">
                                            Record a communication with this client.
                                        </DialogDescription>
                                    </DialogHeader>
                                <Form {...communicationForm}>
                                    <form
                                        onSubmit={communicationForm.handleSubmit(
                                            onCommunicationSubmit
                                        )}
                                        className="space-y-4"
                                    >
                                        <FormField
                                            control={communicationForm.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs sm:text-sm">Type *</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="h-10 text-sm">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="email">Email</SelectItem>
                                                            <SelectItem value="call">Phone call</SelectItem>
                                                            <SelectItem value="meeting">Meeting</SelectItem>
                                                            {canViewNotes && <SelectItem value="note">Note</SelectItem>}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={communicationForm.control}
                                            name="subject"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs sm:text-sm">Subject</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Brief subject or title"
                                                            className="text-sm h-10"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={communicationForm.control}
                                            name="message"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs sm:text-sm">Message *</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            placeholder="Communication details..."
                                                            rows={4}
                                                            className="text-sm min-h-[96px]"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="submit"
                                            className="w-full text-sm"
                                            disabled={createCommunicationMutation.isPending}
                                        >
                                            {createCommunicationMutation.isPending && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Log communication
                                        </Button>
                                    </form>
                                </Form>
                            </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    {canViewTimeline ? (
                        communications.length > 0 ? (
                            <div className="space-y-3">
                                {communications.map((comm) => (
                                    <Card
                                        key={comm.id}
                                        className="border bg-background/95 hover:bg-muted/70 transition-colors"
                                    >
                                        <CardContent className="p-4 sm:p-4.5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div className="p-2 bg-primary/10 rounded-md text-primary shrink-0">
                                                        {getCommunicationIcon(comm.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                            <Badge
                                                                variant="outline"
                                                                className="capitalize text-[10px] sm:text-xs"
                                                            >
                                                                {comm.type}
                                                            </Badge>
                                                            <span className="text-[11px] sm:text-xs text-muted-foreground">
                                  {format(
                                      new Date(comm.date),
                                      "MMM dd, yyyy 'at' h:mm a"
                                  )}
                                </span>
                                                        </div>
                                                        {comm.subject && (
                                                            <h4 className="font-semibold text-sm mb-1 truncate">
                                                                {comm.subject}
                                                            </h4>
                                                        )}
                                                        <p className="text-xs sm:text-sm text-muted-foreground font-['Open_Sans'] whitespace-pre-line">
                                                            {comm.message}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        deleteCommunicationMutation.mutate(comm.id)
                                                    }
                                                    data-testid={`button-delete-comm-${comm.id}`}
                                                    className="shrink-0"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
                                    <MessageSquare className="h-14 w-14 sm:h-16 sm:w-16 text-muted-foreground mb-4 opacity-60" />
                                    <h3 className="text-base sm:text-lg font-semibold mb-2">
                                        No communications logged
                                    </h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground font-['Open_Sans'] mb-4 max-w-sm">
                                    Start tracking your interactions with this client.
                                </p>
                                <Button
                                    size="sm"
                                    onClick={() => setIsCommunicationDialogOpen(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Log first communication
                                </Button>
                            </CardContent>
                        </Card>
                    )
                ) : (
                    <Card>
                            <CardContent className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
                                <MessageSquare className="h-14 w-14 sm:h-16 sm:w-16 text-muted-foreground mb-4 opacity-60" />
                                <h3 className="text-base sm:text-lg font-semibold mb-2">
                                    Timeline View Disabled
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground font-['Open_Sans'] mb-4 max-w-sm">
                                    You don't have permission to view the communication timeline.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            {/* Client Edit Dialog */}
            {canEditClient && (
                <ClientFormDialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    form={form}
                    onSubmit={(data) => updateClientMutation.mutate(data)}
                    isEditing={true}
                    isPending={updateClientMutation.isPending}
                    canViewGSTIN={canViewGSTIN}
                    canManageSegments={canManageSegments}
                    canViewBilling={canViewBilling}
                    canViewShipping={canViewShipping}
                    canViewTheme={canViewTheme}
                />
            )}
        </div>
        </div>
    );
}